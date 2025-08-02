#!/usr/bin/env python3
"""
Simple test for Roboflow integration without Celery
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

def test_roboflow_direct():
    """Test Roboflow API directly"""
    print("🔧 Testing Roboflow API Directly...")
    
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
        
        # Test 3: Test prediction with a simple image
        print("\n📤 Testing prediction...")
        
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
        print(f"❌ Test failed: {str(e)}")
        return False

def main():
    """Main test function"""
    print("🚀 Starting Simple Roboflow Test...")
    print("=" * 50)
    
    success = test_roboflow_direct()
    
    print("\n" + "=" * 50)
    if success:
        print("🎉 Roboflow integration is working!")
        print("\n💡 Next steps:")
        print("1. Start your Django server: python manage.py runserver")
        print("2. Upload an image through the frontend")
        print("3. Check the ML processing results")
        print("4. Visit http://localhost:8080/government to see all reports")
    else:
        print("❌ Roboflow test failed. Please check your API key and internet connection.")

if __name__ == "__main__":
    main() 