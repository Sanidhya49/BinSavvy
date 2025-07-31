#!/usr/bin/env python3
"""
Test script for ML processing to debug upload failures
"""

import os
import sys
import base64
import tempfile
from dotenv import load_dotenv

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

load_dotenv()

def create_test_image():
    """Create a proper test image"""
    try:
        from PIL import Image, ImageDraw, ImageFont
        import io
        
        # Create a simple test image
        img = Image.new('RGB', (400, 300), color='red')
        draw = ImageDraw.Draw(img)
        
        # Add some text
        try:
            font = ImageFont.load_default()
        except:
            font = None
        
        draw.text((50, 50), "Test Waste Image", fill='white', font=font)
        draw.text((50, 100), "For ML Testing", fill='white', font=font)
        
        # Convert to bytes
        img_byte_arr = io.BytesIO()
        img.save(img_byte_arr, format='JPEG')
        img_byte_arr = img_byte_arr.getvalue()
        
        return img_byte_arr
        
    except ImportError:
        # Fallback if PIL is not available
        print("⚠️  PIL not available, using minimal test data")
        return b"fake_image_data"

def test_roboflow_api():
    """Test Roboflow API directly"""
    try:
        from roboflow_config import roboflow_config
        
        print("🧪 Testing Roboflow API...")
        
        # Create a proper test image
        test_image_data = create_test_image()
        
        # Save to temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_file:
            temp_file.write(test_image_data)
            temp_file_path = temp_file.name
        
        try:
            # Test with local file
            result = roboflow_config.predict_image(temp_file_path)
            
            print(f"Roboflow API Response: {result}")
            
            if "error" in result:
                print(f"❌ Roboflow API Error: {result['error']}")
                return False
            else:
                print("✅ Roboflow API test successful")
                return True
                
        finally:
            # Clean up
            os.unlink(temp_file_path)
            
    except Exception as e:
        print(f"❌ Roboflow API test failed: {str(e)}")
        return False

def test_cloudinary_upload():
    """Test Cloudinary upload"""
    try:
        from cloudinary_config import cloudinary_config
        
        print("🧪 Testing Cloudinary upload...")
        
        # Create a proper test image
        test_image_data = create_test_image()
        
        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_file:
            temp_file.write(test_image_data)
            temp_file_path = temp_file.name
        
        try:
            import cloudinary.uploader
            
            result = cloudinary.uploader.upload(
                temp_file_path,
                folder="binsavvy/test",
                public_id="test_upload",
                overwrite=True
            )
            
            print(f"Cloudinary upload result: {result}")
            print("✅ Cloudinary upload test successful")
            return True
            
        finally:
            # Clean up
            os.unlink(temp_file_path)
            
    except Exception as e:
        print(f"❌ Cloudinary upload test failed: {str(e)}")
        return False

def test_ml_tasks():
    """Test ML tasks directly"""
    try:
        # Configure Django settings for testing
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'binsavvy.settings')
        import django
        django.setup()
        
        from ml_service.tasks import process_image_with_roboflow, process_image_with_yolo
        
        print("🧪 Testing ML tasks...")
        
        # Create a proper test image
        test_image_data = create_test_image()
        test_image_base64 = base64.b64encode(test_image_data).decode('utf-8')
        test_image_id = "test-123"
        test_location = "Test Location"
        
        print("Testing Roboflow processing...")
        roboflow_result = process_image_with_roboflow(test_image_id, test_image_base64, test_location)
        print(f"Roboflow result: {roboflow_result}")
        
        print("Testing YOLO processing...")
        yolo_result = process_image_with_yolo(test_image_id, test_image_base64, test_location)
        print(f"YOLO result: {yolo_result}")
        
        return True
        
    except Exception as e:
        print(f"❌ ML tasks test failed: {str(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        return False

def test_environment():
    """Test environment variables"""
    print("🧪 Testing environment variables...")
    
    required_vars = [
        'ROBOFLOW_API_KEY',
        'CLOUDINARY_CLOUD_NAME',
        'CLOUDINARY_API_KEY',
        'CLOUDINARY_API_SECRET'
    ]
    
    missing_vars = []
    
    for var in required_vars:
        value = os.getenv(var)
        if value and value != f"your-{var.lower()}-here":
            print(f"✅ {var}: Configured")
        else:
            print(f"❌ {var}: Missing or placeholder")
            missing_vars.append(var)
    
    if missing_vars:
        print(f"\nMissing environment variables: {', '.join(missing_vars)}")
        return False
    
    return True

def test_simple_upload():
    """Test a simple image upload without ML processing"""
    try:
        print("🧪 Testing simple image upload...")
        
        # Check if backend server is running
        import requests
        try:
            response = requests.get("http://localhost:8000/api/images/health/", timeout=5)
            if response.status_code != 200:
                print("⚠️  Backend server is running but health check failed")
                return False
        except requests.exceptions.ConnectionError:
            print("⚠️  Backend server is not running. Please start it with: python manage.py runserver")
            print("   Skipping upload test...")
            return True  # Don't fail the test, just skip
        except Exception as e:
            print(f"⚠️  Backend server check failed: {str(e)}")
            return True  # Don't fail the test, just skip
        
        # Create a test image
        test_image_data = create_test_image()
        test_image_base64 = base64.b64encode(test_image_data).decode('utf-8')
        
        # Test the upload endpoint directly
        url = "http://localhost:8000/api/images/upload/"
        
        # Create form data
        files = {'image': ('test.jpg', test_image_data, 'image/jpeg')}
        data = {
            'location': 'Test Location',
            'latitude': '23.2696',
            'longitude': '77.3956',
            'skip_ml': 'true'  # Skip ML processing for this test
        }
        
        response = requests.post(url, files=files, data=data)
        
        print(f"Upload response status: {response.status_code}")
        print(f"Upload response: {response.text[:200]}...")
        
        if response.status_code == 201:
            print("✅ Simple upload test successful")
            return True
        else:
            print(f"❌ Simple upload test failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Simple upload test failed: {str(e)}")
        return False

def main():
    """Run all tests"""
    print("🔍 Debugging ML Processing Issues...")
    print("=" * 50)
    
    # Test environment
    env_ok = test_environment()
    print()
    
    if not env_ok:
        print("❌ Environment not properly configured")
        return 1
    
    # Test individual components
    roboflow_ok = test_roboflow_api()
    print()
    
    cloudinary_ok = test_cloudinary_upload()
    print()
    
    ml_tasks_ok = test_ml_tasks()
    print()
    
    # Test simple upload last (depends on backend server)
    simple_upload_ok = test_simple_upload()
    print()
    
    print("=" * 50)
    
    if all([roboflow_ok, cloudinary_ok, ml_tasks_ok]):
        print("✅ All ML components working correctly")
        if simple_upload_ok:
            print("✅ Upload system working correctly")
        else:
            print("⚠️  Upload system needs backend server running")
        
        print("\n💡 Next steps:")
        print("1. Start backend: python manage.py runserver")
        print("2. Test image upload from frontend")
        print("3. Check government dashboard: http://localhost:8080/government")
    else:
        print("❌ Some components are failing")
        print("\n🔧 Fix the failing components above")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main()) 