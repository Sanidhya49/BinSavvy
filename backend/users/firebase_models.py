from firebase_config import get_firestore_db
from datetime import datetime
import uuid

class FirebaseUser:
    def __init__(self, uid=None, email=None, display_name=None, is_admin=False):
        self.uid = uid or str(uuid.uuid4())
        self.email = email
        self.display_name = display_name
        self.is_admin = is_admin
        self.created_at = datetime.now()
        self.phone_number = None
        self.address = None

    def to_dict(self):
        return {
            'uid': self.uid,
            'email': self.email,
            'display_name': self.display_name,
            'is_admin': self.is_admin,
            'created_at': self.created_at.isoformat(),
            'phone_number': self.phone_number,
            'address': self.address
        }

    @classmethod
    def from_dict(cls, data):
        user = cls(
            uid=data.get('uid'),
            email=data.get('email'),
            display_name=data.get('display_name'),
            is_admin=data.get('is_admin', False)
        )
        user.created_at = datetime.fromisoformat(data.get('created_at', datetime.now().isoformat()))
        user.phone_number = data.get('phone_number')
        user.address = data.get('address')
        return user

class FirebaseUserService:
    def __init__(self):
        self.db = get_firestore_db()
        self.collection = 'users'

    def create_user(self, user_data):
        """Create a new user in Firestore"""
        user = FirebaseUser(**user_data)
        doc_ref = self.db.collection(self.collection).document(user.uid)
        doc_ref.set(user.to_dict())
        return user

    def get_user(self, uid):
        """Get user by UID"""
        doc = self.db.collection(self.collection).document(uid).get()
        if doc.exists:
            return FirebaseUser.from_dict(doc.to_dict())
        return None

    def update_user(self, uid, user_data):
        """Update user data"""
        doc_ref = self.db.collection(self.collection).document(uid)
        doc_ref.update(user_data)

    def delete_user(self, uid):
        """Delete user"""
        self.db.collection(self.collection).document(uid).delete()

    def get_all_users(self):
        """Get all users"""
        users = []
        docs = self.db.collection(self.collection).stream()
        for doc in docs:
            users.append(FirebaseUser.from_dict(doc.to_dict()))
        return users 