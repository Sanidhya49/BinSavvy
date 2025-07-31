import firebase_admin
from firebase_admin import credentials, firestore, storage, auth
import os
from django.conf import settings

# Initialize Firebase Admin SDK
def initialize_firebase():
    """Initialize Firebase Admin SDK with service account"""
    try:
        # Check if already initialized
        firebase_admin.get_app()
    except ValueError:
        # Initialize Firebase Admin SDK
        cred = credentials.Certificate(os.path.join(settings.BASE_DIR, 'firebase-service-account.json'))
        firebase_admin.initialize_app(cred, {
            'storageBucket': os.getenv('FIREBASE_STORAGE_BUCKET', 'binsavvy.appspot.com')
        })

# Get Firestore database
def get_firestore_db():
    """Get Firestore database instance"""
    initialize_firebase()
    return firestore.client()

# Get Firebase Storage bucket
def get_storage_bucket():
    """Get Firebase Storage bucket"""
    initialize_firebase()
    return storage.bucket()

# Firebase Authentication
def verify_firebase_token(id_token):
    """Verify Firebase ID token"""
    try:
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token
    except Exception as e:
        return None 