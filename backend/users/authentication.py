from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework.authentication import get_authorization_header
from django.contrib.auth.models import AnonymousUser
from django.utils.functional import SimpleLazyObject
from django.utils.translation import gettext_lazy as _
from django.contrib.auth import get_user_model
from rest_framework import exceptions
import jwt
from django.conf import settings

# Demo users data (in production, this would be in a database)
DEMO_USERS = {
    '1': {
        'id': '1',
        'username': 'admin',
        'email': 'admin@binsavvy.com',
        'role': 'admin',
        'is_admin': True,
        'phone_number': '+1234567890',
        'address': '123 Admin Street, City, State'
    },
    '2': {
        'id': '2',
        'username': 'user',
        'email': 'user@binsavvy.com',
        'role': 'user',
        'is_admin': False,
        'phone_number': '+0987654321',
        'address': '456 User Avenue, City, State'
    }
}

class DemoUser:
    """Custom user class for demo users"""
    def __init__(self, user_data):
        self.id = user_data['id']
        self.username = user_data['username']
        self.email = user_data['email']
        self.role = user_data['role']
        self.is_admin = user_data['is_admin']
        self.phone_number = user_data['phone_number']
        self.address = user_data['address']
        self.is_authenticated = True
        self.is_anonymous = False

    def __str__(self):
        return self.username

class DemoJWTAuthentication(JWTAuthentication):
    """Custom JWT authentication for demo users"""
    
    def authenticate(self, request):
        header = self.get_header(request)
        if header is None:
            return None

        raw_token = self.get_raw_token(header)
        if raw_token is None:
            return None

        try:
            validated_token = self.get_validated_token(raw_token)
            
            # Extract user_id from token
            user_id = validated_token.get('user_id')
            if not user_id:
                return None
                
            # Get demo user data
            user_data = DEMO_USERS.get(str(user_id))
            if not user_data:
                return None
                
            # Create demo user object
            user = DemoUser(user_data)
            
            return (user, validated_token)
        except (InvalidToken, TokenError, Exception) as e:
            # If token is invalid, return None (anonymous user)
            return None

    def get_validated_token(self, raw_token):
        """
        Validates an encoded JSON web token and returns a validated token
        wrapper object.
        """
        from rest_framework_simplejwt.tokens import AccessToken
        
        try:
            # Use AccessToken for validation
            return AccessToken(raw_token)
        except Exception as e:
            raise InvalidToken(str(e)) 