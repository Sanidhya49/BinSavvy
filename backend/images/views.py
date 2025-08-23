import os
import json
import uuid
import base64
import traceback
from datetime import datetime
from django.http import JsonResponse
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
import cloudinary
import cloudinary.uploader
from cloudinary_config import upload_image as cloudinary_upload_image, delete_image as cloudinary_delete_image

# Import ML tasks with error handling
try:
    from ml_service.tasks import process_image
    ML_AVAILABLE = True
except Exception as e:
    print(f"ML tasks not available: {str(e)}")
    ML_AVAILABLE = False

# In-memory storage for demo (in production, this would be a database)
uploaded_images = []

# Migration function to add user_id to existing images (for backward compatibility)
def migrate_existing_images():
    """Add user_id to existing images that don't have it"""
    for img in uploaded_images:
        if 'user_id' not in img:
            # Assign to admin user (user_id: '1') for existing images
            img['user_id'] = '1'
            print(f"Migrated image {img['image_id']} to admin user")

# Helper function to get user ID from request
def get_user_id_from_request(request):
    """Extract user ID from request headers or query params"""
    # Try to get from Authorization header first
    auth_header = request.headers.get('Authorization', '')
    if auth_header.startswith('Bearer '):
        token = auth_header.split(' ')[1]
        # For demo, extract user_id from token format: access_{user_id}_{timestamp}
        if token.startswith('access_'):
            parts = token.split('_')
            if len(parts) >= 3:
                return parts[1]
    
    # Fallback to query parameter
    return request.GET.get('user_id') or request.data.get('user_id')

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
        
        # Get user ID from request
        user_id = get_user_id_from_request(request)
        if not user_id:
            return Response({'error': 'User ID is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        if not image_file:
            return Response({'error': 'No image file provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        if not location:
            return Response({'error': 'Location is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        image_id = str(uuid.uuid4())
        current_time = datetime.now().isoformat()
        
        print(f"Starting upload for image {image_id} with location: {location}")
        
        # Upload to Cloudinary
        cloudinary_result = cloudinary_upload_image(image_file, folder="binsavvy/uploads")
        
        if not cloudinary_result:
            return Response({
                'error': 'Failed to upload image to Cloudinary'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # Create initial image object with Cloudinary URL
        image_object = {
            'image_id': image_id,
            'user_id': user_id,  # Add user ID for data isolation
            'image_url': cloudinary_result['url'],
            'cloudinary_public_id': cloudinary_result['public_id'],
            'location': location,
            'latitude': float(latitude) if latitude else None,
            'longitude': float(longitude) if longitude else None,
            'uploaded_at': current_time,
            'status': 'processing',
            'processed_image_url': None,
            'analysis_results': None,
            'error_message': None,
            'image_width': cloudinary_result.get('width'),
            'image_height': cloudinary_result.get('height')
        }
        
        # Store the image temporarily
        uploaded_images.append(image_object)
        
        print(f"Image uploaded to Cloudinary: {cloudinary_result['url']}")
        
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
                'message': 'Image uploaded successfully',
                'image_id': image_id,
                'image_url': cloudinary_result['url'],
                'status': 'completed',
                'analysis_results': image_object['analysis_results']
            }, status=status.HTTP_201_CREATED)
        
        # Process with ML if available
        if ML_AVAILABLE:
            try:
                print(f"Starting ML processing for image {image_id}")
                
                # Process image with ML
                ml_result = process_image(
                    image_id=image_id,
                    image_url=cloudinary_result['url'],
                    location=location,
                    use_roboflow=use_roboflow
                )
                
                # Update image object with ML results
                image_object['status'] = 'completed'
                image_object['processed_image_url'] = ml_result.get('processed_image_url')
                image_object['analysis_results'] = ml_result.get('analysis_results')
                
                # Update stored image
                for i, img in enumerate(uploaded_images):
                    if img['image_id'] == image_id:
                        uploaded_images[i] = image_object
                        break
                
                print(f"ML processing completed for image {image_id}")
                
                return Response({
                    'message': 'Image uploaded and processed successfully',
                    'image_id': image_id,
                    'image_url': cloudinary_result['url'],
                    'status': 'completed',
                    'processed_image_url': ml_result.get('processed_image_url'),
                    'analysis_results': ml_result.get('analysis_results')
                }, status=status.HTTP_201_CREATED)
                
            except Exception as ml_error:
                print(f"ML processing failed for image {image_id}: {str(ml_error)}")
                traceback.print_exc()
                
                # Update image object with error
                image_object['status'] = 'ml_failed'
                image_object['error_message'] = f"ML processing failed: {str(ml_error)}"
                
                # Update stored image
                for i, img in enumerate(uploaded_images):
                    if img['image_id'] == image_id:
                        uploaded_images[i] = image_object
                        break
                
                return Response({
                    'message': 'Image uploaded but ML processing failed',
                    'image_id': image_id,
                    'image_url': cloudinary_result['url'],
                    'status': 'ml_failed',
                    'error_message': str(ml_error)
                }, status=status.HTTP_201_CREATED)
        else:
            # ML not available
            image_object['status'] = 'ml_unavailable'
            image_object['analysis_results'] = {
                'message': 'ML processing not available',
                'total_detections': 0,
                'model_used': 'No ML available'
            }
            
            # Update stored image
            for i, img in enumerate(uploaded_images):
                if img['image_id'] == image_id:
                    uploaded_images[i] = image_object
                    break
            
            print(f"Image {image_id} uploaded but ML not available")
            
            return Response({
                'message': 'Image uploaded but ML processing not available',
                'image_id': image_id,
                'image_url': cloudinary_result['url'],
                'status': 'ml_unavailable',
                'analysis_results': image_object['analysis_results']
            }, status=status.HTTP_201_CREATED)
            
    except Exception as e:
        print(f"Error in upload_image: {str(e)}")
        traceback.print_exc()
        return Response({
            'error': f'Upload failed: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_user_images(request):
    """Get user images with ML results"""
    try:
        # Get user ID from request
        user_id = get_user_id_from_request(request)
        
        if not user_id:
            return Response({'error': 'User ID is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Migrate existing images to add user_id
        migrate_existing_images()
        
        # Filter images by user_id
        user_images = [img for img in uploaded_images if img.get('user_id') == user_id]
        
        print(f"Returning {len(user_images)} images for user {user_id}")
        
        return Response({
            'message': 'Images retrieved successfully',
            'data': user_images
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_image_details(request, image_id):
    """Get image details with ML analysis"""
    try:
        # Get user ID from request
        user_id = get_user_id_from_request(request)
        
        if not user_id:
            return Response({'error': 'User ID is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Find the image by ID and check ownership
        image = next((img for img in uploaded_images if img['image_id'] == image_id and img.get('user_id') == user_id), None)
        
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
    """Delete image from storage and Cloudinary"""
    try:
        global uploaded_images
        
        # Get user ID from request
        user_id = get_user_id_from_request(request)
        
        if not user_id:
            return Response({'error': 'User ID is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Find the image before deleting and check ownership
        image_to_delete = next((img for img in uploaded_images if img['image_id'] == image_id and img.get('user_id') == user_id), None)
        
        if not image_to_delete:
            return Response({'error': 'Image not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Delete from Cloudinary if public_id exists
        if image_to_delete.get('cloudinary_public_id'):
            try:
                delete_success = cloudinary_delete_image(image_to_delete['cloudinary_public_id'])
                if delete_success:
                    print(f"Image {image_id} deleted from Cloudinary successfully")
                else:
                    print(f"Failed to delete image {image_id} from Cloudinary")
            except Exception as cloudinary_error:
                print(f"Error deleting from Cloudinary: {cloudinary_error}")
        
        # Remove from local storage
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
        confidence_threshold = request.data.get('confidence_threshold', 0.1)
        min_detection_size = request.data.get('min_detection_size', 20)
        max_detections = request.data.get('max_detections', 50)
        
        print(f"Reprocessing image {image_id} with use_roboflow={use_roboflow}, confidence={confidence_threshold}")
        
        # Update status to processing
        for i, img in enumerate(uploaded_images):
            if img['image_id'] == image_id:
                uploaded_images[i]['status'] = 'processing'
                break
        
        # Process with ML if available
        if ML_AVAILABLE:
            try:
                print(f"Starting ML reprocessing for image {image_id}")
                
                # Process image with ML using Cloudinary URL and ML parameters
                ml_result = process_image(
                    image_id=image_id,
                    image_url=image['image_url'],
                    location=image['location'],
                    use_roboflow=use_roboflow,
                    confidence_threshold=confidence_threshold,
                    min_detection_size=min_detection_size,
                    max_detections=max_detections
                )
                
                if ml_result and ml_result.get('status') == 'completed':
                    # Update with new results
                    for i, img in enumerate(uploaded_images):
                        if img['image_id'] == image_id:
                            uploaded_images[i].update({
                                'status': 'completed',
                                'processed_image_url': ml_result.get('processed_image_url'),
                                'analysis_results': ml_result.get('analysis_results'),
                                'model_used': ml_result.get('model_used'),
                                'ml_config': {
                                    'confidence_threshold': confidence_threshold,
                                    'min_detection_size': min_detection_size,
                                    'max_detections': max_detections,
                                    'model': 'roboflow' if use_roboflow else 'yolo'
                                }
                            })
                            break
                    
                    print(f"ML reprocessing completed for image {image_id}")
                    
                    return Response({
                        'message': 'Image reprocessed successfully',
                        'success': True,
                        'data': uploaded_images[i]
                    })
                else:
                    # ML processing failed
                    error_msg = ml_result.get('error', 'Unknown error') if ml_result else 'Processing failed'
                    
                    # Update status to failed
                    for i, img in enumerate(uploaded_images):
                        if img['image_id'] == image_id:
                            uploaded_images[i]['status'] = 'ml_failed'
                            uploaded_images[i]['error_message'] = error_msg
                            break
                    
                    return Response({
                        'message': 'Reprocessing failed',
                        'success': False,
                        'error': error_msg
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                    
            except Exception as ml_error:
                print(f"ML reprocessing failed for image {image_id}: {str(ml_error)}")
                traceback.print_exc()
                
                # Update status to failed
                for i, img in enumerate(uploaded_images):
                    if img['image_id'] == image_id:
                        uploaded_images[i]['status'] = 'ml_failed'
                        uploaded_images[i]['error_message'] = f"ML processing failed: {str(ml_error)}"
                        break
                
                return Response({
                    'message': 'Reprocessing failed',
                    'success': False,
                    'error': str(ml_error)
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            # ML not available
            for i, img in enumerate(uploaded_images):
                if img['image_id'] == image_id:
                    uploaded_images[i]['status'] = 'ml_unavailable'
                    uploaded_images[i]['analysis_results'] = {
                        'message': 'ML processing not available',
                        'total_detections': 0,
                        'model_used': 'No ML available'
                    }
                    break
            
            return Response({
                'message': 'ML processing not available',
                'success': False,
                'error': 'ML service not available'
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        
    except Exception as e:
        print(f"Error in reprocess_image: {str(e)}")
        traceback.print_exc()
        return Response({
            'message': 'Reprocessing failed',
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
