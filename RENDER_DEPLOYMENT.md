# BinSavvy Backend - Render Deployment Guide

This guide will help you deploy your BinSavvy backend to Render and fix the ML model issues.

## 🚨 Current Issues & Solutions

### Issue 1: ML Model Not Working ("ML Unavailable")
**Root Cause**: Missing `ROBOFLOW_API_KEY` environment variable in Render deployment.

**Solution**: Add the Roboflow API key to your Render environment variables.

### Issue 2: Admin Dashboard Not Showing User Uploads
**Root Cause**: Admin dashboard only shows images for admin user, not all users.

**Solution**: ✅ Fixed in code - Admin users now see all uploaded images.

## 🔧 Render Deployment Steps

### 1. Get Your Roboflow API Key

1. Go to [Roboflow](https://roboflow.com/) and sign in
2. Navigate to your account settings
3. Find your API key (it should look like: `your_api_key_here`)
4. Copy this key - you'll need it for Render

### 2. Configure Environment Variables in Render

In your Render dashboard:

1. Go to your backend service
2. Click on "Environment" tab
3. Add these environment variables:

```env
# Required for basic functionality
SECRET_KEY=your-secret-key-here-make-it-long-and-random
DEBUG=False
ALLOWED_HOSTS=your-render-app-url.onrender.com

# Required for image storage
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Required for ML model (THIS IS THE KEY MISSING ONE!)
ROBOFLOW_API_KEY=your-roboflow-api-key-here

# Optional - you can use the default model
ROBOFLOW_MODEL_ID=garbage-det-t1lur/1

# CORS settings for frontend
CORS_ALLOWED_ORIGINS=https://your-frontend-url.vercel.app
CORS_ALLOW_ALL=False
```

### 3. Get Your Cloudinary Credentials

If you don't have Cloudinary set up:

1. Go to [Cloudinary](https://cloudinary.com/) and create an account
2. In your dashboard, you'll find:
   - Cloud Name
   - API Key  
   - API Secret
3. Add these to your Render environment variables

### 4. Deploy and Test

1. Save the environment variables in Render
2. Redeploy your backend service
3. Test the ML functionality by uploading an image

## 🧪 Testing Your Deployment

### Test 1: Environment Variables
Run this command in your Render service logs or locally:
```bash
python check_env.py
```

### Test 2: ML Model
1. Upload an image from the user dashboard
2. Check if it shows "ML processing" instead of "ML Unavailable"
3. Verify the admin dashboard shows the uploaded image

### Test 3: Admin Dashboard
1. Login as admin (username: `admin`, password: `admin123`)
2. Go to Admin Dashboard
3. You should now see all user uploads, not just admin uploads

## 🔍 Troubleshooting

### If ML Still Shows "Unavailable":

1. **Check Render Logs**: Look for error messages about Roboflow API
2. **Verify API Key**: Make sure your Roboflow API key is correct
3. **Test API Key**: You can test your API key directly:
   ```bash
   curl -X POST "https://serverless.roboflow.com/garbage-det-t1lur/1" \
        -H "Content-Type: application/x-www-form-urlencoded" \
        -d "api_key=YOUR_API_KEY&image=IMAGE_URL&confidence=0.1"
   ```

### If Admin Dashboard Still Empty:

1. **Check User IDs**: Make sure users are uploading with proper user IDs
2. **Check Backend Logs**: Look for messages about admin user detection
3. **Verify Authentication**: Ensure admin login is working correctly

## 📋 Environment Variables Checklist

- [ ] `SECRET_KEY` - Django secret key
- [ ] `CLOUDINARY_CLOUD_NAME` - Your Cloudinary cloud name
- [ ] `CLOUDINARY_API_KEY` - Your Cloudinary API key  
- [ ] `CLOUDINARY_API_SECRET` - Your Cloudinary API secret
- [ ] `ROBOFLOW_API_KEY` - Your Roboflow API key ⚠️ **CRITICAL**
- [ ] `ROBOFLOW_MODEL_ID` - Model ID (optional, has default)
- [ ] `DEBUG=False` - Disable debug mode for production
- [ ] `ALLOWED_HOSTS` - Your Render app URL
- [ ] `CORS_ALLOWED_ORIGINS` - Your frontend URL

## 🚀 Quick Fix Commands

If you need to quickly test locally with the same environment:

```bash
# Create .env file in backend directory
cat > backend/.env << EOF
SECRET_KEY=your-secret-key-here
DEBUG=True
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
ROBOFLOW_API_KEY=your-roboflow-api-key
ROBOFLOW_MODEL_ID=garbage-det-t1lur/1
EOF

# Test environment
cd backend
python check_env.py

# Run backend
python manage.py runserver
```

## 📞 Support

If you're still having issues:

1. Check the Render service logs for error messages
2. Verify all environment variables are set correctly
3. Test your Roboflow API key independently
4. Make sure your Cloudinary credentials are valid

The most common issue is the missing `ROBOFLOW_API_KEY` environment variable in Render.
