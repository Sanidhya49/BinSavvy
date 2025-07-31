#!/usr/bin/env python3
"""
Test script for Roboflow waste detection integration
"""

import os
import sys
import base64
from dotenv import load_dotenv

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

load_dotenv()

def test_roboflow_config():
    """Test Roboflow configuration"""
    try:
        from roboflow_config import roboflow_config
        
        print("✅ Roboflow configuration loaded successfully")
        print(f"   Model ID: {roboflow_config.model_id}")
        print(f"   API URL: {roboflow_config.api_url}")
        
        # Check if API key is set
        if roboflow_config.api_key and roboflow_config.api_key != "your-roboflow-api-key-here":
            print("✅ Roboflow API key is configured")
        else:
            print("❌ Roboflow API key not configured")
            print("   Please add ROBOFLOW_API_KEY to your .env file")
            return False
            
        return True
        
    except Exception as e:
        print(f"❌ Error loading Roboflow config: {str(e)}")
        return False

def test_cloudinary_config():
    """Test Cloudinary configuration"""
    try:
        from cloudinary_config import cloudinary_config
        
        print("✅ Cloudinary configuration loaded successfully")
        print(f"   Cloud Name: {cloudinary_config.cloud_name}")
        
        # Check if Cloudinary is properly configured
        if cloudinary_config.is_configured():
            print("✅ Cloudinary credentials are configured")
        else:
            print("❌ Cloudinary credentials not fully configured")
            print("   Please check CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file")
            return False
        
        return True
        
    except Exception as e:
        print(f"❌ Error loading Cloudinary config: {str(e)}")
        print("   This might be due to missing environment variables")
        return False

def test_ml_tasks():
    """Test ML task imports"""
    try:
        from ml_service.tasks import process_image, process_image_with_roboflow, process_image_with_yolo
        
        print("✅ ML tasks imported successfully")
        return True
        
    except Exception as e:
        print(f"❌ Error importing ML tasks: {str(e)}")
        print("   This might be due to missing dependencies or configuration issues")
        return False

def test_dependencies():
    """Test if all required packages are installed"""
    required_packages = [
        'ultralytics',
        'opencv-python',
        'numpy',
        'requests',
        'cloudinary',
        'inference-sdk',
        'roboflow'
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            if package == 'opencv-python':
                import cv2
            elif package == 'inference-sdk':
                import inference_sdk
            elif package == 'roboflow':
                import roboflow
            else:
                __import__(package.replace('-', '_'))
            print(f"✅ {package} is installed")
        except ImportError:
            print(f"❌ {package} is missing")
            missing_packages.append(package)
    
    if missing_packages:
        print(f"\n📦 Missing packages: {', '.join(missing_packages)}")
        print("   Run: pip install -r requirements.txt")
        return False
    
    return True

def main():
    """Run all tests"""
    print("🧪 Testing BinSavvy ML Integration...")
    print("=" * 50)
    
    # Test dependencies first
    deps_ok = test_dependencies()
    
    if not deps_ok:
        print("\n❌ Dependencies missing. Please install them first.")
        return 1
    
    print()  # Add spacing
    
    # Test configurations
    roboflow_ok = test_roboflow_config()
    cloudinary_ok = test_cloudinary_config()
    ml_tasks_ok = test_ml_tasks()
    
    print("=" * 50)
    
    if all([roboflow_ok, cloudinary_ok, ml_tasks_ok]):
        print("✅ All tests passed! ML integration is ready.")
        print("\n📋 Next steps:")
        print("1. Start the backend: python manage.py runserver")
        print("2. Test image upload with ML processing")
        print("3. Check the frontend for results")
    else:
        print("❌ Some tests failed. Please check the errors above.")
        print("\n🔧 Common fixes:")
        print("- Make sure all environment variables are set in .env")
        print("- Install missing dependencies: pip install -r requirements.txt")
        print("- Check that your API keys are correct")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main()) 