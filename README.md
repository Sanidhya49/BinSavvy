# BinSavvy: Smart Waste Analysis Platform

## Project Info

BinSavvy is a web platform for smart waste analysis. Users can upload images of waste in their surroundings, and administrators can analyze these images using AI models for instance segmentation and object detection.

## Features
- User registration, login, and dashboard
- Image upload with location and timestamp
- Admin dashboard for managing uploads and running ML models
- Instance segmentation and object detection (YOLOv8)
- Data visualization and insights

## Tech Stack
- Frontend: React, TypeScript, Vite, shadcn-ui, Tailwind CSS
- Backend: Django, Django REST Framework, Celery, PostgreSQL, AWS S3
- ML: YOLOv8 (ultralytics)

## Getting Started

### Prerequisites
- Node.js & npm
- Python 3.10+
- PostgreSQL
- Redis (for Celery)

### Frontend Setup
```sh
npm install
npm run dev
```

### Backend Setup
```sh
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
pip install -r requirements.txt
# Set up .env file with your credentials
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```

### Running the App
- Start Redis server
- Start Celery worker: `celery -A binsavvy worker -l info`
- Start Django server: `python manage.py runserver`
- Start frontend: `npm run dev`

## Deployment
- Use Docker Compose or your preferred cloud provider

## License
MIT
