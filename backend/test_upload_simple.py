#!/usr/bin/env python3
"""
Simple test script to verify uploads work without ML processing..
"""

import os
import sys
import requests
from PIL import Image, ImageDraw
import io

def create_test_image():
    """Create a simple test image"""
    img = Image.new('RGB', (400, 300), color='blue')
    draw = ImageDraw.Draw(img)
    draw.text((50, 50), "Test Upload Image", fill='white')
    
    # Convert to bytes
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='JPEG')
    return img_byte_arr.getvalue()

def test_upload_without_ml():
    """Test upload without ML processing"""
    print("🧪 Testing upload without ML processing...")
    
    try:
        # Create test image
        test_image_data = create_test_image()
        
        # Test upload with skip_ml=true
        files = {'image': ('test.jpg', test_image_data, 'image/jpeg')}
        data = {
            'location': 'Test Location - No ML',
            'latitude': '23.2696',
            'longitude': '77.3956',
            'skip_ml': 'true'  # Skip ML processing
        }
        
        response = requests.post("http://localhost:8000/api/images/upload/", files=files, data=data)
        
        print(f"Upload response status: {response.status_code}")
        
        if response.status_code == 201:
            result = response.json()
            print("✅ Upload successful without ML processing")
            print(f"   Image ID: {result.get('data', {}).get('image_id', 'N/A')}")
            print(f"   Status: {result.get('data', {}).get('status', 'N/A')}")
            return True
        else:
            print(f"❌ Upload failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Upload test failed: {str(e)}")
        return False

def test_upload_with_ml():
    """Test upload with ML processing (may fail if Redis not running)"""
    print("🧪 Testing upload with ML processing...")
    
    try:
        # Create test image
        test_image_data = create_test_image()
        
        # Test upload with ML processing
        files = {'image': ('test.jpg', test_image_data, 'image/jpeg')}
        data = {
            'location': 'Test Location - With ML',
            'latitude': '23.2696',
            'longitude': '77.3956',
            'skip_ml': 'false'  # Try ML processing
        }
        
        response = requests.post("http://localhost:8000/api/images/upload/", files=files, data=data)
        
        print(f"Upload response status: {response.status_code}")
        
        if response.status_code == 201:
            result = response.json()
            print("✅ Upload successful with ML processing")
            print(f"   Image ID: {result.get('data', {}).get('image_id', 'N/A')}")
            print(f"   Status: {result.get('data', {}).get('status', 'N/A')}")
            return True
        else:
            print(f"❌ Upload failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Upload test failed: {str(e)}")
        return False

def test_get_images():
    """Test getting images list"""
    print("🧪 Testing get images list...")
    
    try:
        response = requests.get("http://localhost:8000/api/images/list/")
        
        print(f"Get images response status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            images = result.get('data', [])
            print(f"✅ Got {len(images)} images")
            for img in images:
                print(f"   - {img.get('location', 'N/A')} ({img.get('status', 'N/A')})")
            return True
        else:
            print(f"❌ Get images failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Get images test failed: {str(e)}")
        return False

def main():
    """Run all tests"""
    print("🔍 Testing Upload System...")
    print("=" * 40)
    
    # Test backend health first
    try:
        response = requests.get("http://localhost:8000/api/images/health/", timeout=5)
        if response.status_code == 200:
            print("✅ Backend server is running")
        else:
            print("❌ Backend server health check failed")
            return 1
    except:
        print("❌ Backend server is not running")
        print("   Please start it with: python manage.py runserver")
        return 1
    
    print()
    
    # Test uploads
    upload_without_ml_ok = test_upload_without_ml()
    print()
    
    upload_with_ml_ok = test_upload_with_ml()
    print()
    
    get_images_ok = test_get_images()
    print()
    
    print("=" * 40)
    
    if all([upload_without_ml_ok, get_images_ok]):
        print("✅ Upload system is working correctly!")
        if upload_with_ml_ok:
            print("✅ ML processing is working!")
        else:
            print("⚠️  ML processing failed (Redis not running)")
            print("   To enable ML processing:")
            print("   1. Install Redis: https://github.com/microsoftarchive/redis/releases")
            print("   2. Or use Docker: docker run -d -p 6379:6379 redis:alpine")
            print("   3. Or run: start_redis.bat")
        
        print("\n🎉 You can now:")
        print("1. Upload images from the frontend")
        print("2. View results in the government dashboard")
        print("3. Check the history page")
    else:
        print("❌ Some upload tests failed")
        print("\n🔧 Check the errors above")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main()) 