from firebase_config import get_firestore_db, get_storage_bucket
from datetime import datetime
import uuid
import os

class FirebaseImageUpload:
    def __init__(self, image_id=None, user_uid=None, image_url=None, location=None, 
                 latitude=None, longitude=None, status='pending'):
        self.image_id = image_id or str(uuid.uuid4())
        self.user_uid = user_uid
        self.image_url = image_url
        self.location = location
        self.latitude = latitude
        self.longitude = longitude
        self.uploaded_at = datetime.now()
        self.status = status
        self.processed_image_url = None
        self.analysis_results = {}

    def to_dict(self):
        return {
            'image_id': self.image_id,
            'user_uid': self.user_uid,
            'image_url': self.image_url,
            'location': self.location,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'uploaded_at': self.uploaded_at.isoformat(),
            'status': self.status,
            'processed_image_url': self.processed_image_url,
            'analysis_results': self.analysis_results
        }

    @classmethod
    def from_dict(cls, data):
        image = cls(
            image_id=data.get('image_id'),
            user_uid=data.get('user_uid'),
            image_url=data.get('image_url'),
            location=data.get('location'),
            latitude=data.get('latitude'),
            longitude=data.get('longitude'),
            status=data.get('status', 'pending')
        )
        image.uploaded_at = datetime.fromisoformat(data.get('uploaded_at', datetime.now().isoformat()))
        image.processed_image_url = data.get('processed_image_url')
        image.analysis_results = data.get('analysis_results', {})
        return image

class FirebaseImageService:
    def __init__(self):
        self.db = get_firestore_db()
        self.storage = get_storage_bucket()
        self.collection = 'image_uploads'

    def upload_image(self, image_file, user_uid, location, latitude=None, longitude=None):
        """Upload image to Firebase Storage and save metadata to Firestore"""
        # Upload to Firebase Storage
        blob_name = f"uploads/{user_uid}/{image_file.name}"
        blob = self.storage.blob(blob_name)
        blob.upload_from_file(image_file)
        blob.make_public()
        
        # Create image upload record
        image_upload = FirebaseImageUpload(
            user_uid=user_uid,
            image_url=blob.public_url,
            location=location,
            latitude=latitude,
            longitude=longitude
        )
        
        # Save to Firestore
        doc_ref = self.db.collection(self.collection).document(image_upload.image_id)
        doc_ref.set(image_upload.to_dict())
        
        return image_upload

    def get_image(self, image_id):
        """Get image upload by ID"""
        doc = self.db.collection(self.collection).document(image_id).get()
        if doc.exists:
            return FirebaseImageUpload.from_dict(doc.to_dict())
        return None

    def get_user_images(self, user_uid):
        """Get all images for a user"""
        images = []
        docs = self.db.collection(self.collection).where('user_uid', '==', user_uid).stream()
        for doc in docs:
            images.append(FirebaseImageUpload.from_dict(doc.to_dict()))
        return images

    def update_image_status(self, image_id, status, processed_image_url=None, analysis_results=None):
        """Update image processing status"""
        doc_ref = self.db.collection(self.collection).document(image_id)
        update_data = {'status': status}
        
        if processed_image_url:
            update_data['processed_image_url'] = processed_image_url
        if analysis_results:
            update_data['analysis_results'] = analysis_results
            
        doc_ref.update(update_data)

    def upload_processed_image(self, image_id, processed_image_file):
        """Upload processed image to Firebase Storage"""
        blob_name = f"processed/{image_id}/processed_{os.path.basename(processed_image_file.name)}"
        blob = self.storage.blob(blob_name)
        blob.upload_from_file(processed_image_file)
        blob.make_public()
        
        # Update the image record
        self.update_image_status(image_id, 'completed', blob.public_url)
        
        return blob.public_url 