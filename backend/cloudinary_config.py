import cloudinary
import cloudinary.uploader
import cloudinary.api
import os
from django.conf import settings

def configure_cloudinary():
    """Configure Cloudinary with environment variables"""
    cloudinary.config(
        cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
        api_key=os.getenv('CLOUDINARY_API_KEY'),
        api_secret=os.getenv('CLOUDINARY_API_SECRET')
    )

def upload_image(image_file, folder="binsavvy/uploads"):
    """Upload image to Cloudinary"""
    configure_cloudinary()
    
    try:
        result = cloudinary.uploader.upload(
            image_file,
            folder=folder,
            resource_type="image",
            transformation=[
                {"width": 800, "height": 600, "crop": "limit"},
                {"quality": "auto"}
            ]
        )
        return {
            'url': result['secure_url'],
            'public_id': result['public_id'],
            'width': result['width'],
            'height': result['height']
        }
    except Exception as e:
        print(f"Error uploading to Cloudinary: {e}")
        return None

def upload_processed_image(image_file, folder="binsavvy/processed"):
    """Upload processed image to Cloudinary"""
    configure_cloudinary()
    
    try:
        result = cloudinary.uploader.upload(
            image_file,
            folder=folder,
            resource_type="image",
            transformation=[
                {"quality": "auto"}
            ]
        )
        return result['secure_url']
    except Exception as e:
        print(f"Error uploading processed image: {e}")
        return None

def delete_image(public_id):
    """Delete image from Cloudinary"""
    configure_cloudinary()
    
    try:
        result = cloudinary.uploader.destroy(public_id)
        return result['result'] == 'ok'
    except Exception as e:
        print(f"Error deleting from Cloudinary: {e}")
        return False 