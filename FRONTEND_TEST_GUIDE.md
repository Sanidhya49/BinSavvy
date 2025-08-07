# 🚀 BinSavvy Frontend Integration Test Guide

## 📋 Test Checklist

### **Step 1: Basic Navigation**
- [ ] Open http://localhost:8080
- [ ] Verify homepage loads without errors
- [ ] Test navigation between pages
- [ ] Check responsive design on different screen sizes

### **Step 2: Authentication Flow**
- [ ] Click "Login" button
- [ ] Login as `admin@binsavvy.com` (password: any)
- [ ] Verify admin dashboard loads
- [ ] Test logout functionality

### **Step 3: User Upload Flow**
- [ ] Go to `/upload` page
- [ ] Select an image file
- [ ] Enter location information
- [ ] Submit upload
- [ ] Verify upload success message
- [ ] Check image appears in history

### **Step 4: Admin Management**
- [ ] Go to `/admin` dashboard
- [ ] Check system health indicators
- [ ] View upload statistics
- [ ] Navigate to User Uploads
- [ ] Test image processing features

### **Step 5: ML Processing Test**
- [ ] Find an uploaded image in admin panel
- [ ] Click "Start Analysis" or "Reprocess"
- [ ] Verify ML processing starts
- [ ] Check processing status updates
- [ ] View analysis results

### **Step 6: Settings & Configuration**
- [ ] Go to `/admin/settings`
- [ ] Test ML configuration panel
- [ ] Adjust confidence thresholds
- [ ] Test "Save Config" functionality
- [ ] Test "Test Service" button

## 🎯 Expected Results

### **✅ Successful Upload Flow:**
1. Image uploads to Cloudinary
2. ML processing starts automatically
3. Results are displayed with confidence scores
4. Image appears in user history

### **✅ Admin Features:**
1. Dashboard shows system health
2. Upload management works
3. ML configuration saves properly
4. Processing status updates in real-time

### **✅ Error Handling:**
1. Network errors show user-friendly messages
2. Invalid uploads are rejected gracefully
3. Loading states are displayed properly
4. Retry mechanisms work

## 🔧 Troubleshooting

### **If Frontend Won't Load:**
```bash
# Check if frontend server is running
npm run dev

# Check for console errors (F12)
# Look for import or API errors
```

### **If Uploads Fail:**
```bash
# Check backend server
cd backend && python manage.py runserver

# Check Cloudinary credentials in .env
# Verify Roboflow API key
```

### **If ML Processing Fails:**
```bash
# Check backend logs for ML errors
# Verify Roboflow API is accessible
# Check confidence threshold settings
```

## 📊 Test Data

### **Sample Images to Test:**
- Plastic bottles
- Paper waste
- Metal cans
- Organic waste
- Mixed waste

### **Test Locations:**
- "Beach near Marina Bay"
- "Park in downtown area"
- "Residential area sidewalk"
- "Commercial district"

## 🎉 Success Criteria

✅ **All pages load without errors**
✅ **Upload flow works end-to-end**
✅ **ML processing returns results**
✅ **Admin features are functional**
✅ **Error handling works properly**
✅ **Responsive design works**

---

**Ready to test? Open http://localhost:8080 and follow this guide!** 