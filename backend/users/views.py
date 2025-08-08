import os
import json
import uuid
import traceback
from datetime import datetime, timedelta
from django.http import JsonResponse
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.hashers import make_password, check_password
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from .models import User

# In-memory storage for demo (in production, this would be a database)
users = [
    {
        'id': '1',
        'username': 'admin',
        'email': 'admin@binsavvy.com',
        'password': make_password('admin123'),
        'role': 'admin',
        'is_admin': True,
        'phone_number': '+1234567890',
        'address': '123 Admin Street, City, State'
    },
    {
        'id': '2',
        'username': 'user',
        'email': 'user@binsavvy.com',
        'password': make_password('user123'),
        'role': 'user',
        'is_admin': False,
        'phone_number': '+0987654321',
        'address': '456 User Avenue, City, State'
    }
]

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """Health check endpoint"""
    return Response({
        'status': 'healthy',
        'message': 'Users API is working',
        'timestamp': datetime.now().isoformat()
    })

@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt
def login_user(request):
    """User login with JWT tokens"""
    try:
        # Handle both JSON and form data
        if request.content_type == 'application/json':
            data = request.data
        else:
            data = request.POST
        
        username = data.get('username')
        password = data.get('password')
        
        print(f"Login attempt for username: {username}")
        
        if not username or not password:
            return Response({
                'error': 'Username and password are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Find user in demo data
        user = next((u for u in users if u['username'] == username), None)
        
        if not user or not check_password(password, user['password']):
            print(f"Invalid credentials for user: {username}")
            return Response({
                'error': 'Invalid credentials'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        print(f"Login successful for user: {username}")
        
        # Create JWT tokens (simplified for demo)
        access_token = f"access_{user['id']}_{int(datetime.now().timestamp())}"
        refresh_token = f"refresh_{user['id']}_{int(datetime.now().timestamp())}"
        
        # Return user data and tokens
        return Response({
            'success': True,
            'user': {
                'id': user['id'],
                'username': user['username'],
                'email': user['email'],
                'role': user['role'],
                'is_admin': user['is_admin'],
                'phone_number': user['phone_number'],
                'address': user['address']
            },
            'access': access_token,
            'refresh': refresh_token
        })
        
    except Exception as e:
        print(f"Login error: {str(e)}")
        traceback.print_exc()
        return Response({
            'error': 'Login failed'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt
def register_user(request):
    """User registration"""
    try:
        # Handle both JSON and form data
        if request.content_type == 'application/json':
            data = request.data
        else:
            data = request.POST
        
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        phone_number = data.get('phone_number', '')
        address = data.get('address', '')
        
        print(f"Registration attempt for username: {username}")
        
        if not username or not email or not password:
            return Response({
                'error': 'Username, email, and password are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if user already exists
        existing_user = next((u for u in users if u['username'] == username), None)
        if existing_user:
            return Response({
                'error': 'Username already exists'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create new user
        new_user = {
            'id': str(uuid.uuid4()),
            'username': username,
            'email': email,
            'password': make_password(password),
            'role': 'user',
            'is_admin': False,
            'phone_number': phone_number,
            'address': address
        }
        
        users.append(new_user)
        
        print(f"Registration successful for user: {username}")
        
        return Response({
            'success': True,
            'user': {
                'id': new_user['id'],
                'username': new_user['username'],
                'email': new_user['email'],
                'role': new_user['role'],
                'is_admin': new_user['is_admin'],
                'phone_number': new_user['phone_number'],
                'address': new_user['address']
            }
        })
        
    except Exception as e:
        print(f"Registration error: {str(e)}")
        traceback.print_exc()
        return Response({
            'error': 'Registration failed'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def logout_user(request):
    """User logout"""
    try:
        return Response({
            'success': True,
            'message': 'Logged out successfully'
        })
    except Exception as e:
        print(f"Logout error: {str(e)}")
        return Response({
            'error': 'Logout failed'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def refresh_token(request):
    """Refresh JWT token"""
    try:
        from rest_framework_simplejwt.tokens import RefreshToken
        from rest_framework_simplejwt.exceptions import TokenError
        
        refresh_token = request.data.get('refresh')
        
        if not refresh_token:
            return Response({
                'error': 'Refresh token is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Validate and decode the refresh token
            refresh = RefreshToken(refresh_token)
            
            # Generate new access token
            access_token = str(refresh.access_token)
            
            return Response({
                'success': True,
                'access': access_token
            })
            
        except TokenError as e:
            return Response({
                'error': 'Invalid refresh token'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
    except Exception as e:
        print(f"Token refresh error: {str(e)}")
        return Response({
            'error': 'Token refresh failed'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_user_profile(request):
    """Get current user profile"""
    try:
        # For demo, return a mock user
        user = users[0]  # Return admin user for demo
        
        return Response({
            'success': True,
            'data': {
                'id': user['id'],
                'username': user['username'],
                'email': user['email'],
                'role': user['role'],
                'is_admin': user['is_admin'],
                'phone_number': user['phone_number'],
                'address': user['address']
            }
        })
        
    except Exception as e:
        print(f"Get profile error: {str(e)}")
        return Response({
            'error': 'Failed to get profile'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PUT'])
@permission_classes([AllowAny])
def update_user_profile(request):
    """Update current user profile"""
    try:
        data = request.data
        user = users[0]  # Use admin user for demo
        
        # Update user data
        if 'email' in data:
            user['email'] = data['email']
        if 'phone_number' in data:
            user['phone_number'] = data['phone_number']
        if 'address' in data:
            user['address'] = data['address']
        
        return Response({
            'success': True,
            'data': {
                'id': user['id'],
                'username': user['username'],
                'email': user['email'],
                'role': user['role'],
                'is_admin': user['is_admin'],
                'phone_number': user['phone_number'],
                'address': user['address']
            }
        })
        
    except Exception as e:
        print(f"Update profile error: {str(e)}")
        return Response({
            'error': 'Failed to update profile'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
