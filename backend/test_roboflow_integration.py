#!/usr/bin/env python3
"""
Test script for Roboflow waste detection integration
"""

import os
import sys
import base64
from PIL import Image
import io

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'binsavvy.settings')

# Import Django and setup
import django
django.setup()

from roboflow_config import roboflow_config

def create_test_image():
    """Create a simple test image for testing"""
    # Create a simple test image (100x100 pixels, red color)
    img = Image.new('RGB', (100, 100), color='red')
    
    # Convert to base64
    buffer = io.BytesIO()
    img.save(buffer, format='JPEG')
    img_data = buffer.getvalue()
    img_base64 = base64.b64encode(img_data).decode('utf-8')
    
    return img_base64

def test_roboflow_config():
    """Test Roboflow configuration"""
    print("🔧 Testing Roboflow Configuration...")
    
    try:
        # Test 1: Check API key
        api_key = roboflow_config.api_key
        if api_key:
            print(f"✅ API Key found: {api_key[:10]}...")
        else:
            print("❌ API Key not found")
            return False
        
        # Test 2: Check model ID
        model_id = roboflow_config.model_id
        print(f"✅ Model ID: {model_id}")
        
        # Test 3: Check API URL
        api_url = roboflow_config.api_url
        print(f"✅ API URL: {api_url}")
        
        return True
        
    except Exception as e:
        print(f"❌ Configuration error: {str(e)}")
        return False

def test_roboflow_prediction():
    """Test Roboflow prediction with a test image"""
    print("\n🔍 Testing Roboflow Prediction...")
    
    try:
        # Create test image
        test_image_base64 = create_test_image()
        
        # Save test image to temporary file
        import tempfile
        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_file:
            image_data = base64.b64decode(test_image_base64)
            temp_file.write(image_data)
            temp_file_path = temp_file.name
        
        try:
            # Test prediction
            print("📤 Sending image to Roboflow API...")
            result = roboflow_config.predict_image(temp_file_path)
            
            if "error" in result:
                print(f"❌ Prediction failed: {result['error']}")
                return False
            
            print("✅ Prediction successful!")
            print(f"📊 Results: {result}")
            
            # Test analysis
            print("\n📈 Testing prediction analysis...")
            analysis = roboflow_config.analyze_predictions(result)
            
            if "error" in analysis:
                print(f"❌ Analysis failed: {analysis['error']}")
                return False
            
            print("✅ Analysis successful!")
            print(f"📊 Analysis: {analysis}")
            
            return True
            
        finally:
            # Clean up
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)
                
    except Exception as e:
        print(f"❌ Prediction test failed: {str(e)}")
        return False

def test_ml_task():
    """Test the ML task integration"""
    print("\n🤖 Testing ML Task Integration...")
    
    try:
        from ml_service.tasks import process_image_with_roboflow
        
        # Create test image
        test_image_base64 = create_test_image()
        
        # Test the task
        print("📤 Testing ML task...")
        result = process_image_with_roboflow(
            image_id="test-123",
            image_data=test_image_base64,
            location="Test Location"
        )
        
        if result and result.get('status') == 'completed':
            print("✅ ML task successful!")
            print(f"📊 Task result: {result}")
            return True
        else:
            print(f"❌ ML task failed: {result}")
            return False
            
    except Exception as e:
        print(f"❌ ML task test failed: {str(e)}")
        return False

def main():
    """Main test function"""
    print("🚀 Starting Roboflow Integration Tests...")
    print("=" * 50)
    
    # Test 1: Configuration
    config_ok = test_roboflow_config()
    
    if not config_ok:
        print("\n❌ Configuration test failed. Please check your .env file.")
        return
    
    # Test 2: Prediction
    prediction_ok = test_roboflow_prediction()
    
    # Test 3: ML Task
    task_ok = test_ml_task()
    
    # Summary
    print("\n" + "=" * 50)
    print("📋 Test Summary:")
    print(f"Configuration: {'✅ PASS' if config_ok else '❌ FAIL'}")
    print(f"Prediction: {'✅ PASS' if prediction_ok else '❌ FAIL'}")
    print(f"ML Task: {'✅ PASS' if task_ok else '❌ FAIL'}")
    
    if config_ok and prediction_ok and task_ok:
        print("\n🎉 All tests passed! Roboflow integration is working correctly.")
        print("\n💡 Next steps:")
        print("1. Start your Django server: python manage.py runserver")
        print("2. Upload an image through the frontend")
        print("3. Check the ML processing results")
    else:
        print("\n⚠️ Some tests failed. Please check the errors above.")

if __name__ == "__main__":
    main() 