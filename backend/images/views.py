from django.shortcuts import render
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
import json
import uuid
from datetime import datetime
import base64

# In-memory storage for demo (in production, this would be a database)
uploaded_images = []

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """Health check endpoint for images"""
    return Response({
        'status': 'healthy',
        'message': 'BinSavvy Images API is running'
    })

@api_view(['POST'])
@permission_classes([AllowAny])
def upload_image(request):
    """Upload image - working version with proper response"""
    try:
        # Get form data
        image_file = request.FILES.get('image')
        location = request.data.get('location', '')
        latitude = request.data.get('latitude')
        longitude = request.data.get('longitude')
        
        if not image_file:
            return Response({'error': 'No image file provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        if not location:
            return Response({'error': 'Location is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create a unique image ID
        image_id = str(uuid.uuid4())
        current_time = datetime.now().isoformat()
        
        # Convert image to base64 for storage (in production, this would be uploaded to Cloudinary/S3)
        image_data = image_file.read()
        image_base64 = base64.b64encode(image_data).decode('utf-8')
        image_url = f"data:{image_file.content_type};base64,{image_base64}"
        
        # Create the image object
        image_object = {
            'image_id': image_id,
            'image_url': image_url,
            'location': location,
            'latitude': float(latitude) if latitude else None,
            'longitude': float(longitude) if longitude else None,
            'uploaded_at': current_time,
            'status': 'pending',
            'processed_image_url': None,
            'analysis_results': None
        }
        
        # Store the image (in production, this would be saved to database)
        uploaded_images.append(image_object)
        
        return Response({
            'message': 'Image uploaded successfully',
            'data': image_object
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_user_images(request):
    """Get user images - returns actual uploaded images"""
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
    """Get image details - returns actual image data"""
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
    """Delete image - removes from storage"""
    try:
        global uploaded_images
        
        # Find and remove the image
        uploaded_images = [img for img in uploaded_images if img['image_id'] != image_id]
        
        return Response({
            'message': f'Image {image_id} deleted successfully'
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
