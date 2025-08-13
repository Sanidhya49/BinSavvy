# BinSavvy: Smart Waste Analysis Platform

A comprehensive web platform for smart waste analysis using AI and machine learning. Users can upload images of waste in their surroundings, and administrators can analyze these images using YOLOv8 for instance segmentation and object detection.

## 🚀 Features

### For Users:
- **User Authentication**: Secure registration and login system with demo accounts
- **Image Upload**: Upload photos with location data and GPS coordinates
- **Upload History**: View and manage all uploaded images with real-time status
- **Dashboard**: View recent activity and upload statistics
- **Real-time Processing**: Track processing status of uploaded images
- **Analysis Results**: View AI-generated waste analysis and insights

### For Administrators:
- **Admin Dashboard**: Comprehensive management interface with system health monitoring
- **ML Model Integration**: Run YOLOv8 and Roboflow models for waste detection
- **ML Configuration**: Configure models, thresholds, and processing settings
- **System Monitoring**: Real-time health checks for all services
- **Analytics Dashboard**: Comprehensive waste analytics and insights
- **Enhanced ML Processor**: Batch processing and job management
- **Government-grade Reporting**: Cluster uploads into geographic zones, compute a priority score, and export reports in human-friendly formats (JSON, CSV, Excel, Word, Text, GeoJSON) with live map links.

## 🛠️ Tech Stack

### Frontend:
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **React Router** for navigation
- **React Hook Form** for form handling
- **Sonner** for toast notifications

### Backend:
- **Django 5.0** with Django REST Framework
- **SQLite** for development database (PostgreSQL for production)
- **Cloudinary** for image storage and processing
- **Celery** with Redis for background tasks (synchronous for development)
- **YOLOv8** for ML model integration

### ML & AI:
- **Roboflow API** for cloud-based waste detection (default model `garbage-det-t1lur/1`)
- **Ultralytics YOLOv8** for local object detection
- **OpenCV** for image processing
- **NumPy** for numerical operations

### Cloud Services:
- **Cloudinary** for image storage and optimization
- **Roboflow** for ML model hosting
- **Firebase** for authentication (configured, not fully integrated)

## 📁 Project Structure

```
BinSavvy-BS/
├── src/                    # React frontend source
│   ├── components/         # Reusable UI components
│   │   ├── ui/            # shadcn/ui components
│   │   ├── user/          # User-specific components
│   │   ├── admin/         # Admin components
│   │   ├── government/    # Government dashboard
│   │   └── auth/          # Authentication components
│   ├── pages/             # Page components
│   ├── contexts/          # React contexts
│   ├── hooks/             # Custom hooks
│   ├── lib/               # Utility functions
│   └── types/             # TypeScript type definitions
├── backend/               # Django backend
│   ├── binsavvy/          # Django project settings
│   ├── users/             # User management app
│   ├── images/            # Image upload app
│   ├── ml_service/        # ML processing app
│   ├── cloudinary_config.py # Cloudinary configuration
│   ├── roboflow_config.py # Roboflow configuration
│   └── requirements.txt   # Python dependencies
├── public/                # Static assets
└── README.md             # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.10+
- Cloudinary account
- Roboflow API key

### 1. Clone the Repository
```bash
git clone <repository-url>
cd BinSavvy-BS
```

### 2. Backend Setup

#### Install Python Dependencies
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
pip install -r requirements.txt
```

#### Environment Configuration
Create a `.env` file in the `backend` directory:
```env
DEBUG=True
SECRET_KEY=your-secret-key-here
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
ROBOFLOW_API_KEY=your-roboflow-api-key
# Optional: override the default Roboflow model (defaults to garbage-det-t1lur/1)
ROBOFLOW_MODEL_ID=garbage-det-t1lur/1
```

#### Cloudinary Setup
1. Create account at [Cloudinary](https://cloudinary.com/)
2. Get your Cloud Name, API Key, and API Secret
3. Update the `.env` file with your credentials

#### Roboflow Setup
1. Create account at [Roboflow](https://roboflow.com/)
2. Get your API key
3. Update the `.env` file with your API key
4. (Optional) Set `ROBOFLOW_MODEL_ID` to switch models without code changes

#### Database Setup
```bash
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```

#### Start Backend Server
```bash
python manage.py runserver
```

The backend will be available at `http://localhost:8000`

### 3. Frontend Setup

#### Install Dependencies
```bash
npm install
```

If you pulled updates, make sure the following new libs are installed for Excel/Word export:

```bash
npm install xlsx docx
```

#### Start Development Server
```bash
npm run dev
```

The frontend will be available at `http://localhost:8080`

## 🧭 Government Reporting (Zones)

The analytics page provides a zones-based report designed for municipal action:

- **Zone clustering**: Nearby uploads are grouped into zones by a selectable radius (250 m, 500 m, 1 km).
- **Per-zone metrics**:
  - GPS center, radius, bounding box
  - Total detections and average confidence (density proxy)
  - **Priority score**: weighted by detections (0.6), confidence (0.3), and number of uploads (0.1)
  - Representative address (optional)
  - Quick map links (Google Maps & OpenStreetMap)
- **Exports**:
  - JSON, CSV, Text (human-friendly)
  - Excel (.xlsx) and Word (.docx) with formatted tables
  - GeoJSON for GIS tools

To export: Open Admin → Analytics → choose Time Range, Format, Zone Size, Include Addresses → Export Report.

## 🔐 Demo Accounts

For testing purposes, the following demo accounts are available:

- **Admin Account**: `admin` / `admin123`
- **User Account**: `user` / `user123`

## 📡 API Endpoints

### Authentication
- `POST /api/users/login/` - User login
- `POST /api/users/register/` - Register new user
- `POST /api/users/logout/` - User logout
- `POST /api/users/refresh/` - Refresh JWT token
- `GET /api/users/profile/` - Get user profile
- `PUT /api/users/profile/update/` - Update user profile

### Image Management
- `POST /api/images/upload/` - Upload image with location
- `GET /api/images/list/` - Get user's images
- `GET /api/images/{id}/` - Get specific image details
- `DELETE /api/images/{id}/delete/` - Delete image
- `POST /api/images/{id}/reprocess/` - Reprocess image with ML

### Health Checks
- `GET /api/users/health/` - User service health check
- `GET /api/images/health/` - Image service health check

## 🔧 Development

### Backend Development
```bash
cd backend
python manage.py runserver
```

### Frontend Development
```bash
npm run dev
```

### Debug Routes
- `http://localhost:8080/debug` - API debug information
- `http://localhost:8080/backend-test` - Backend connection test
- `http://localhost:8080/government` - Government dashboard

## ✅ Current Status

### ✅ Completed Features:
- **User Authentication**: Login/Register with demo accounts
- **Image Upload**: Upload images with location and GPS data
- **Real Image Storage**: Cloudinary integration for production-ready storage
- **Upload History**: View all uploaded images with status
- **Dashboard**: Real-time stats and recent activity
- **Backend API**: Full REST API with health checks
- **Frontend-Backend Integration**: Complete API integration
- **Responsive UI**: Mobile-friendly interface
- **ML Integration**: Roboflow API with 10% confidence threshold
- **Enhanced Admin Dashboard**: System health monitoring and management
- **ML Configuration Panel**: Model settings and thresholds
- **Government Dashboard**: Waste report viewing system
- **Analytics Dashboard**: Comprehensive waste analytics
- **Zones Reporting**: Priority scoring, GeoJSON/Excel/Word/CSV/TXT export, and map links
- **Enhanced ML Processor**: Batch processing and job management
- **JWT Authentication**: Token-based authentication (demo mode)
- **Real-time Updates**: Auto-refresh and focus-based updates

### 🚧 In Progress:
- **Real-time Updates**: WebSocket integration for live status updates
- **Advanced Analytics**: Charts and visualizations
- **Batch Processing**: Process multiple images simultaneously

### 📋 Planned Features:
- **Firebase Authentication**: Full Firebase integration
- **Database Migration**: PostgreSQL for production
- **Celery Tasks**: Background processing with Redis
- **Real-time Notifications**: Push notifications for processing status
- **Drone Footage Analysis**: Video processing capabilities
- **Mobile App**: React Native mobile application

## 🚀 Deployment

### Backend Deployment
1. Set up PostgreSQL database
2. Configure environment variables
3. Set up Celery with Redis (when implemented)
4. Deploy to your preferred platform (Heroku, AWS, etc.)

### Frontend Deployment
1. Build the project: `npm run build`
2. Deploy the `dist` folder to your hosting service

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [YOLOv8](https://github.com/ultralytics/ultralytics) for object detection
- [Cloudinary](https://cloudinary.com/) for image processing
- [Roboflow](https://roboflow.com/) for ML model hosting
- [shadcn/ui](https://ui.shadcn.com/) for UI components
- [Django](https://www.djangoproject.com/) for backend framework

## 📞 Support

For support, email support@binsavvy.com or create an issue in this repository.
