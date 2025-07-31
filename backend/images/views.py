from django.shortcuts import render
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
import json

# Create your views here.

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
    """Upload image - simplified version"""
    try:
        # Get form data
        image_file = request.FILES.get('image')
        location = request.data.get('location', '')
        
        if not image_file:
            return Response({'error': 'No image file provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        if not location:
            return Response({'error': 'Location is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({
            'message': 'Image upload endpoint ready',
            'filename': image_file.name,
            'location': location
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_user_images(request):
    """Get user images - simplified version"""
    return Response({
        'message': 'Get user images endpoint ready',
        'images': []
    })

@api_view(['GET'])
@permission_classes([AllowAny])
def get_image_details(request, image_id):
    """Get image details - simplified version"""
    return Response({
        'message': 'Get image details endpoint ready',
        'image_id': image_id
    })

@api_view(['DELETE'])
@permission_classes([AllowAny])
def delete_image(request, image_id):
    """Delete image - simplified version"""
    return Response({
        'message': 'Delete image endpoint ready',
        'image_id': image_id
    })
