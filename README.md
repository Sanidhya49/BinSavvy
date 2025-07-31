# BinSavvy: Smart Waste Analysis Platform

A comprehensive web platform for smart waste analysis using AI and machine learning. Users can upload images of waste in their surroundings, and administrators can analyze these images using YOLOv8 for instance segmentation and object detection.

## 🚀 Features

### For Users:
- **User Authentication**: Secure registration and login via Firebase
- **Image Upload**: Upload photos with location data and GPS coordinates
- **Upload History**: View and manage all uploaded images
- **Real-time Processing**: Track processing status of uploaded images
- **Analysis Results**: View AI-generated waste analysis and insights

### For Administrators:
- **Admin Dashboard**: Comprehensive management interface
- **ML Model Integration**: Run YOLOv8 models for waste detection
- **Batch Processing**: Process multiple images simultaneously
- **Data Analytics**: View waste composition and distribution insights
- **User Management**: Manage user accounts and permissions

## 🛠️ Tech Stack

### Frontend:
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **React Router** for navigation
- **React Hook Form** for form handling

### Backend:
- **Django 5.0** with Django REST Framework
- **Firebase Authentication** for user management
- **Firestore Database** for data storage
- **Cloudinary** for image storage and processing
- **Celery** with Redis for background tasks
- **YOLOv8** for ML model integration

### ML & AI:
- **Ultralytics YOLOv8** for object detection
- **OpenCV** for image processing
- **NumPy** for numerical operations

## 📁 Project Structure

```
BinSavvy-BS/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts
│   │   ├── hooks/          # Custom hooks
│   │   └── lib/            # Utility functions
│   └── public/             # Static assets
├── backend/                 # Django backend
│   ├── binsavvy/           # Django project settings
│   ├── users/              # User management app
│   ├── images/             # Image upload app
│   ├── ml_service/         # ML processing app
│   ├── firebase_config.py  # Firebase configuration
│   ├── cloudinary_config.py # Cloudinary configuration
│   └── requirements.txt    # Python dependencies
└── README.md              # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.10+
- Redis server
- Firebase project
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
FIREBASE_PROJECT_ID=binsavvy
FIREBASE_API_KEY=your-firebase-api-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0
```

#### Firebase Setup
1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication, Firestore Database
3. Download service account key and save as `firebase-service-account.json`

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

#### Start Backend Services
```bash
# Start Redis server (in separate terminal)
redis-server

# Start Celery worker (in separate terminal)
celery -A binsavvy worker -l info

# Start Django server
python manage.py runserver
```

### 3. Frontend Setup

#### Install Dependencies
```bash
cd frontend  # or from project root
npm install
```

#### Start Development Server
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

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

### Running Tests
```bash
# Backend tests
python manage.py test

# Frontend tests
npm test
```

## 🚀 Deployment

### Backend Deployment
1. Set up PostgreSQL database
2. Configure environment variables
3. Set up Celery with Redis
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
- [Firebase](https://firebase.google.com/) for backend services
- [Cloudinary](https://cloudinary.com/) for image processing
- [shadcn/ui](https://ui.shadcn.com/) for UI components

## 📞 Support

For support, email support@binsavvy.com or create an issue in this repository.
