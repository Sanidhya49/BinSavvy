#!/usr/bin/env python3
"""
Environment configuration checker for BinSavvy backend
Run this script to verify all required environment variables are set
"""

import os
from dotenv import load_dotenv

def check_environment():
    """Check if all required environment variables are configured"""
    print("=== BinSavvy Environment Configuration Check ===\n")
    
    # Load environment variables
    load_dotenv()
    
    # Required environment variables
    required_vars = {
        'SECRET_KEY': 'Django secret key for security',
        'CLOUDINARY_CLOUD_NAME': 'Cloudinary cloud name for image storage',
        'CLOUDINARY_API_KEY': 'Cloudinary API key',
        'CLOUDINARY_API_SECRET': 'Cloudinary API secret',
        'ROBOFLOW_API_KEY': 'Roboflow API key for ML model access',
    }
    
    # Optional environment variables
    optional_vars = {
        'ROBOFLOW_MODEL_ID': 'Roboflow model ID (default: garbage-det-t1lur/1)',
        'DEBUG': 'Debug mode (default: True)',
        'ALLOWED_HOSTS': 'Allowed hosts (default: localhost,127.0.0.1)',
        'CORS_ALLOWED_ORIGINS': 'CORS allowed origins',
    }
    
    print("🔍 Checking Required Environment Variables:")
    print("-" * 50)
    
    all_required_present = True
    for var, description in required_vars.items():
        value = os.getenv(var)
        if value:
            # Mask sensitive values
            if 'KEY' in var or 'SECRET' in var:
                masked_value = value[:8] + "..." + value[-4:] if len(value) > 12 else "***"
                print(f"✅ {var}: {masked_value}")
            else:
                print(f"✅ {var}: {value}")
        else:
            print(f"❌ {var}: NOT SET - {description}")
            all_required_present = False
    
    print("\n🔍 Checking Optional Environment Variables:")
    print("-" * 50)
    
    for var, description in optional_vars.items():
        value = os.getenv(var)
        if value:
            print(f"✅ {var}: {value}")
        else:
            print(f"⚪ {var}: Not set (using default) - {description}")
    
    print("\n" + "=" * 60)
    
    if all_required_present:
        print("🎉 All required environment variables are configured!")
        print("✅ Your backend should work correctly.")
    else:
        print("⚠️  Some required environment variables are missing!")
        print("❌ Please set the missing variables before running the backend.")
        print("\nFor Render deployment, add these environment variables in your Render dashboard:")
        for var in required_vars:
            if not os.getenv(var):
                print(f"   - {var}")
    
    print("\n📋 Environment Summary:")
    print(f"   - Total required variables: {len(required_vars)}")
    print(f"   - Configured: {sum(1 for var in required_vars if os.getenv(var))}")
    print(f"   - Missing: {sum(1 for var in required_vars if not os.getenv(var))}")
    
    return all_required_present

if __name__ == "__main__":
    check_environment()
