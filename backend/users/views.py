from django.shortcuts import render
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
import json

# Create your views here.

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """Health check endpoint"""
    return Response({
        'status': 'healthy',
        'message': 'BinSavvy API is running'
    })

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """Register a new user - simplified version"""
    try:
        data = request.data
        
        return Response({
            'message': 'User registration endpoint ready',
            'data': data
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_user_profile(request):
    """Get user profile - simplified version"""
    return Response({
        'message': 'User profile endpoint ready'
    })

@api_view(['PUT'])
@permission_classes([AllowAny])
def update_user_profile(request):
    """Update user profile - simplified version"""
    return Response({
        'message': 'Profile update endpoint ready'
    })
