# BinSavvy: Smart Waste Analysis Platform

A comprehensive web platform for smart waste analysis using AI and machine learning. Users can upload images of waste in their surroundings, and administrators can analyze these images using YOLOv8 for instance segmentation and object detection.

## 🚀 Features

### For Users:
- **User Authentication**: Secure registration and login system
- **Image Upload**: Upload photos with location data and GPS coordinates
- **Upload History**: View and manage all uploaded images with real-time status
- **Dashboard**: View recent activity and upload statistics
- **Real-time Processing**: Track processing status of uploaded images
- **Analysis Results**: View AI-generated waste analysis and insights (coming soon)

### For Administrators:
- **Admin Dashboard**: Comprehensive management interface
- **ML Model Integration**: Run YOLOv8 models for waste detection (coming soon)
- **Batch Processing**: Process multiple images simultaneously (coming soon)
- **Data Analytics**: View waste composition and distribution insights (coming soon)
- **User Management**: Manage user accounts and permissions (coming soon)

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
- **Celery** with Redis for background tasks (coming soon)
- **YOLOv8** for ML model integration (coming soon)

### ML & AI:
- **Ultralytics YOLOv8** for object detection (coming soon)
- **OpenCV** for image processing (coming soon)
- **NumPy** for numerical operations (coming soon)

## 📁 Project Structure

```
BinSavvy-BS/
├── src/                    # React frontend source
│   ├── components/         # Reusable UI components
│   │   ├── ui/            # shadcn/ui components
│   │   ├── user/          # User-specific components
│   │   ├── admin/         # Admin components
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
│   └── requirements.txt   # Python dependencies
├── public/                # Static assets
└── README.md             # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.10+
- Cloudinary account

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
```

#### Cloudinary Setup
1. Create account at [Cloudinary](https://cloudinary.com/)
2. Get your Cloud Name, API Key, and API Secret
3. Update the `.env` file with your credentials

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

#### Start Development Server
```bash
npm run dev
```

The frontend will be available at `http://localhost:8080`

## 📡 API Endpoints

### Authentication
- `POST /api/users/register/` - Register new user
- `GET /api/users/profile/` - Get user profile
- `PUT /api/users/profile/update/` - Update user profile

### Image Management
- `POST /api/images/upload/` - Upload image with location
- `GET /api/images/list/` - Get user's images
- `GET /api/images/{id}/` - Get specific image details
- `DELETE /api/images/{id}/delete/` - Delete image

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

## ✅ Current Status

### ✅ Completed Features:
- **User Authentication**: Login/Register with demo accounts
- **Image Upload**: Upload images with location and GPS data
- **Image Storage**: Base64 storage in backend (Cloudinary integration ready)
- **Upload History**: View all uploaded images with status
- **Dashboard**: Real-time stats and recent activity
- **Backend API**: Full REST API with health checks
- **Frontend-Backend Integration**: Complete API integration
- **Responsive UI**: Mobile-friendly interface

### 🚧 In Progress:
- **ML Model Integration**: YOLOv8 integration for waste detection
- **Cloudinary Integration**: Real image storage and processing
- **Admin Dashboard**: Full admin functionality
- **Real-time Updates**: WebSocket integration

### 📋 Planned Features:
- **Firebase Authentication**: Full Firebase integration
- **Database Migration**: PostgreSQL for production
- **Celery Tasks**: Background processing
- **Analytics Dashboard**: Waste composition analysis
- **Drone Footage Analysis**: Video processing capabilities

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
- [shadcn/ui](https://ui.shadcn.com/) for UI components
- [Django](https://www.djangoproject.com/) for backend framework

## 📞 Support

For support, email support@binsavvy.com or create an issue in this repository.
