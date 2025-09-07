#!/usr/bin/env python3
"""
Test script to verify Roboflow API key and model access
Run this to debug ML issues
"""

import os
import requests
from dotenv import load_dotenv

def test_roboflow_api():
    """Test Roboflow API with the configured key"""
    print("=== Roboflow API Test ===\n")
    
    # Load environment variables
    load_dotenv()
    
    # Get configuration
    api_key = os.getenv('ROBOFLOW_API_KEY')
    model_id = os.getenv('ROBOFLOW_MODEL_ID', 'garbage-det-t1lur/1')
    api_url = "https://serverless.roboflow.com"
    
    print(f"API Key: {api_key[:8]}...{api_key[-4:] if api_key else 'NOT SET'}")
    print(f"Model ID: {model_id}")
    print(f"API URL: {api_url}")
    print()
    
    if not api_key:
        print("❌ ERROR: ROBOFLOW_API_KEY not found!")
        return False
    
    # Test with a sample image URL (a public image of garbage)
    test_image_url = "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800"
    
    print(f"Testing with image: {test_image_url}")
    print()
    
    try:
        # Make API request
        url = f"{api_url}/{model_id}"
        headers = {
            "Content-Type": "application/x-www-form-urlencoded"
        }
        params = {
            "api_key": api_key,
            "image": test_image_url,
            "confidence": 0.1
        }
        
        print(f"Making request to: {url}")
        print(f"Parameters: {params}")
        print()
        
        response = requests.post(url, headers=headers, params=params, timeout=30)
        
        print(f"Response Status: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        print()
        
        if response.status_code == 200:
            result = response.json()
            print("✅ SUCCESS: API request successful!")
            print(f"Response: {result}")
            
            # Check if we got predictions
            predictions = result.get('predictions', [])
            print(f"\nDetections found: {len(predictions)}")
            
            if predictions:
                print("Sample detection:")
                print(f"  - Class: {predictions[0].get('class', 'unknown')}")
                print(f"  - Confidence: {predictions[0].get('confidence', 0):.3f}")
                print(f"  - Position: x={predictions[0].get('x', 0):.1f}, y={predictions[0].get('y', 0):.1f}")
            else:
                print("No detections found (this is normal for some images)")
            
            return True
        else:
            print(f"❌ ERROR: API request failed!")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ ERROR: Exception occurred: {str(e)}")
        return False

def test_imports():
    """Test if all required modules can be imported"""
    print("=== Import Test ===\n")
    
    try:
        from roboflow_config import roboflow_config
        print("✅ roboflow_config imported successfully")
        print(f"   API Key present: {bool(roboflow_config.api_key)}")
        print(f"   Model ID: {roboflow_config.model_id}")
    except Exception as e:
        print(f"❌ roboflow_config import failed: {str(e)}")
        return False
    
    try:
        from ml_service.tasks import process_image
        print("✅ ml_service.tasks imported successfully")
    except Exception as e:
        print(f"❌ ml_service.tasks import failed: {str(e)}")
        return False
    
    return True

if __name__ == "__main__":
    print("BinSavvy Roboflow Debug Tool\n")
    
    # Test imports first
    imports_ok = test_imports()
    print()
    
    # Test API if imports work
    if imports_ok:
        api_ok = test_roboflow_api()
        
        print("\n" + "="*50)
        if api_ok:
            print("🎉 All tests passed! Your Roboflow setup should work.")
        else:
            print("⚠️  API test failed. Check your API key and network connection.")
    else:
        print("❌ Import tests failed. Check your Python environment.")