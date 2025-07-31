import os
import json
import uuid
import base64
import traceback
from datetime import datetime
from django.http import JsonResponse
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
import cloudinary
import cloudinary.uploader
from cloudinary_config import cloudinary_config

# Import ML tasks with error handling
try:
    from ml_service.tasks import process_image
    ML_AVAILABLE = True
except Exception as e:
    print(f"ML tasks not available: {str(e)}")
    ML_AVAILABLE = False

# In-memory storage for demo (in production, this would be a database)
uploaded_images = []

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """Health check endpoint"""
    return Response({
        'status': 'healthy',
        'message': 'Images API is working',
        'timestamp': datetime.now().isoformat()
    })

@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt
def upload_image(request):
    """Upload image with ML processing"""
    try:
        image_file = request.FILES.get('image')
        location = request.data.get('location', '')
        latitude = request.data.get('latitude')
        longitude = request.data.get('longitude')
        use_roboflow = request.data.get('use_roboflow', 'true').lower() == 'true'
        skip_ml = request.data.get('skip_ml', 'false').lower() == 'true'
        
        if not image_file:
            return Response({'error': 'No image file provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        if not location:
            return Response({'error': 'Location is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        image_id = str(uuid.uuid4())
        current_time = datetime.now().isoformat()
        
        # Convert image to base64 for ML processing
        image_data = image_file.read()
        image_base64 = base64.b64encode(image_data).decode('utf-8')
        
        # Create initial image object
        image_object = {
            'image_id': image_id,
            'image_url': f"data:{image_file.content_type};base64,{image_base64}",
            'location': location,
            'latitude': float(latitude) if latitude else None,
            'longitude': float(longitude) if longitude else None,
            'uploaded_at': current_time,
            'status': 'processing',
            'processed_image_url': None,
            'analysis_results': None,
            'error_message': None
        }
        
        # Store the image temporarily
        uploaded_images.append(image_object)
        
        print(f"Processing image {image_id} with location: {location}")
        
        # If skip_ml is True, just store the image without ML processing
        if skip_ml:
            image_object['status'] = 'completed'
            image_object['analysis_results'] = {
                'message': 'ML processing skipped',
                'total_detections': 0,
                'model_used': 'No ML processing'
            }
            
            # Update stored image
            for i, img in enumerate(uploaded_images):
                if img['image_id'] == image_id:
                    uploaded_images[i] = image_object
                    break
            
            print(f"Image {image_id} uploaded without ML processing")
            
            return Response({
                'message': 'Image uploaded successfully (ML processing skipped)',
                'data': image_object
            }, status=status.HTTP_201_CREATED)
        
        # Check if ML is available
        if not ML_AVAILABLE:
            print(f"ML not available, storing image without processing")
            image_object['status'] = 'completed'
            image_object['analysis_results'] = {
                'message': 'ML processing not available (Redis/Celery not running)',
                'total_detections': 0,
                'model_used': 'No ML processing'
            }
            
            # Update stored image
            for i, img in enumerate(uploaded_images):
                if img['image_id'] == image_id:
                    uploaded_images[i] = image_object
                    break
            
            return Response({
                'message': 'Image uploaded successfully (ML processing not available)',
                'data': image_object
            }, status=status.HTTP_201_CREATED)
        
        # Start ML processing task
        try:
            # Process image with ML
            ml_result = process_image.delay(
                image_id=image_id,
                image_data=image_base64,
                location=location,
                use_roboflow=use_roboflow
            )
            
            # Get result (in production, this would be async)
            result = ml_result.get(timeout=120)  # Increased timeout to 120 seconds
            
            print(f"ML processing result: {result}")
            
            if result and result.get('status') == 'completed':
                # Update image object with results
                image_object.update({
                    'status': 'completed',
                    'processed_image_url': result.get('cloudinary_url'),
                    'analysis_results': result.get('analysis_results'),
                    'model_used': result.get('model_used')
                })
                
                # Update stored image
                for i, img in enumerate(uploaded_images):
                    if img['image_id'] == image_id:
                        uploaded_images[i] = image_object
                        break
                
                print(f"Image {image_id} processed successfully")
                
                return Response({
                    'message': 'Image uploaded and processed successfully',
                    'data': image_object
                }, status=status.HTTP_201_CREATED)
            else:
                # ML processing failed, but image was uploaded
                error_msg = result.get('error', 'Processing failed') if result else 'Processing timeout'
                image_object['status'] = 'completed'  # Changed from 'failed' to 'completed'
                image_object['analysis_results'] = {
                    'message': f'ML processing failed: {error_msg}',
                    'total_detections': 0,
                    'model_used': 'No ML processing'
                }
                image_object['error_message'] = error_msg
                
                print(f"ML processing failed for image {image_id}: {error_msg}")
                
                return Response({
                    'message': 'Image uploaded successfully (ML processing failed)',
                    'data': image_object
                }, status=status.HTTP_201_CREATED)
                
        except Exception as ml_error:
            # ML processing failed, but image was uploaded
            error_msg = str(ml_error)
            image_object['status'] = 'completed'  # Changed from 'failed' to 'completed'
            image_object['analysis_results'] = {
                'message': f'ML processing failed: {error_msg}',
                'total_detections': 0,
                'model_used': 'No ML processing'
            }
            image_object['error_message'] = error_msg
            
            print(f"ML processing exception for image {image_id}: {error_msg}")
            print(f"Traceback: {traceback.format_exc()}")
            
            return Response({
                'message': 'Image uploaded successfully (ML processing failed)',
                'data': image_object
            }, status=status.HTTP_201_CREATED)
    
    except Exception as e:
        print(f"Upload error: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_user_images(request):
    """Get user images with ML results"""
    try:
        # Return the actual uploaded images
        return Response({
            'message': 'Images retrieved successfully',
            'data': uploaded_images
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_image_details(request, image_id):
    """Get image details with ML analysis"""
    try:
        # Find the image by ID
        image = next((img for img in uploaded_images if img['image_id'] == image_id), None)
        
        if not image:
            return Response({'error': 'Image not found'}, status=status.HTTP_404_NOT_FOUND)
        
        return Response({
            'message': 'Image details retrieved successfully',
            'data': image
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([AllowAny])
def delete_image(request, image_id):
    """Delete image from storage"""
    try:
        global uploaded_images
        
        # Find and remove the image
        uploaded_images = [img for img in uploaded_images if img['image_id'] != image_id]
        
        return Response({
            'message': f'Image {image_id} deleted successfully'
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def reprocess_image(request, image_id):
    """Reprocess image with different ML model"""
    try:
        # Find the image
        image = next((img for img in uploaded_images if img['image_id'] == image_id), None)
        
        if not image:
            return Response({'error': 'Image not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Get parameters
        use_roboflow = request.data.get('use_roboflow', True)
        
        # Extract base64 data from image URL
        image_data = image['image_url'].split(',')[1] if ',' in image['image_url'] else image['image_url']
        
        # Update status to processing
        for i, img in enumerate(uploaded_images):
            if img['image_id'] == image_id:
                uploaded_images[i]['status'] = 'processing'
                break
        
        # Reprocess with ML
        ml_result = process_image.delay(
            image_id=image_id,
            image_data=image_data,
            location=image['location'],
            use_roboflow=use_roboflow
        )
        
        result = ml_result.get(timeout=60)
        
        if result and result.get('status') == 'completed':
            # Update with new results
            for i, img in enumerate(uploaded_images):
                if img['image_id'] == image_id:
                    uploaded_images[i].update({
                        'status': 'completed',
                        'processed_image_url': result.get('cloudinary_url'),
                        'analysis_results': result.get('analysis_results'),
                        'model_used': result.get('model_used')
                    })
                    break
            
            return Response({
                'message': 'Image reprocessed successfully',
                'data': uploaded_images[i]
            })
        else:
            return Response({
                'error': 'Reprocessing failed',
                'details': result.get('error', 'Unknown error')
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
