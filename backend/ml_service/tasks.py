import os
import tempfile
import base64
from celery import shared_task
import django
from django.conf import settings
from ultralytics import YOLO
import cv2
import numpy as np
from PIL import Image
import io
import cloudinary
import cloudinary.uploader
from cloudinary_config import cloudinary_config
from roboflow_config import roboflow_config

# Configure Django settings for Celery tasks
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'binsavvy.settings')
django.setup()

@shared_task
def process_image_with_roboflow(image_id: str, image_data: str, location: str = ""):
    """
    Process image using Roboflow waste detection model
    
    Args:
        image_id: Unique identifier for the image
        image_data: Base64 encoded image data
        location: Location where image was taken
    """
    try:
        # Decode base64 image data
        if ',' in image_data:
            image_data = image_data.split(',')[1]
        
        image_bytes = base64.b64decode(image_data)
        
        # Create temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_file:
            temp_file.write(image_bytes)
            temp_file_path = temp_file.name
        
        try:
            # Upload to Cloudinary first
            cloudinary_result = cloudinary.uploader.upload(
                temp_file_path,
                folder="binsavvy/waste_images",
                public_id=f"waste_{image_id}",
                overwrite=True
            )
            
            # Get Cloudinary URL
            cloudinary_url = cloudinary_result['secure_url']
            
            # Process with Roboflow
            roboflow_result = roboflow_config.predict_image_from_url(cloudinary_url)
            
            # Analyze predictions
            analysis_results = roboflow_config.analyze_predictions(roboflow_result)
            
            return {
                'image_id': image_id,
                'cloudinary_url': cloudinary_url,
                'analysis_results': analysis_results,
                'status': 'completed',
                'model_used': 'Roboflow Waste Detection v2'
            }
            
        finally:
            # Clean up temporary file
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)
        
    except Exception as e:
        print(f"Error processing image with Roboflow: {str(e)}")
        return {
            'image_id': image_id,
            'error': str(e),
            'status': 'failed'
        }

@shared_task
def process_image_with_yolo(image_id: str, image_data: str, location: str = ""):
    """
    Process image using local YOLOv8 model (fallback)
    
    Args:
        image_id: Unique identifier for the image
        image_data: Base64 encoded image data
        location: Location where image was taken
    """
    try:
        # Decode base64 image data
        if ',' in image_data:
            image_data = image_data.split(',')[1]
        
        image_bytes = base64.b64decode(image_data)
        
        # Create temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_file:
            temp_file.write(image_bytes)
            temp_file_path = temp_file.name
        
        try:
            # Upload to Cloudinary
            cloudinary_result = cloudinary.uploader.upload(
                temp_file_path,
                folder="binsavvy/waste_images",
                public_id=f"waste_{image_id}",
                overwrite=True
            )
            
            # Load YOLO model with safe loading
            try:
                model_path = os.path.join(settings.BASE_DIR, 'yolov8n-seg.pt')
            except:
                # Fallback to current directory
                model_path = os.path.join(os.getcwd(), 'yolov8n-seg.pt')
            
            if not os.path.exists(model_path):
                # Download model if not exists
                model = YOLO('yolov8n-seg.pt')
                model.save(model_path)
            else:
                # Load with safe weights_only=False for compatibility
                import torch
                try:
                    model = YOLO(model_path)
                except Exception as yolo_error:
                    print(f"YOLO loading error: {yolo_error}")
                    # Try alternative loading method
                    model = YOLO('yolov8n-seg.pt')  # Download fresh model
            
            # Run inference
            results = model(temp_file_path)
            
            # Process results
            detections = []
            for result in results:
                boxes = result.boxes
                if boxes is not None:
                    for box in boxes:
                        detection = {
                            'class': model.names[int(box.cls[0])],
                            'confidence': float(box.conf[0]),
                            'bbox': box.xyxy[0].tolist()
                        }
                        detections.append(detection)
            
            # Analyze results
            total_detections = len(detections)
            avg_confidence = sum(d['confidence'] for d in detections) / total_detections if total_detections > 0 else 0
            
            waste_counts = {}
            for detection in detections:
                class_name = detection['class']
                if class_name not in waste_counts:
                    waste_counts[class_name] = 0
                waste_counts[class_name] += 1
            
            analysis_results = {
                'total_detections': total_detections,
                'average_confidence': round(avg_confidence, 3),
                'waste_types': waste_counts,
                'detections': detections,
                'model_used': 'YOLOv8n Segmentation',
                'model_accuracy': 'Local Model'
            }
            
            return {
                'image_id': image_id,
                'cloudinary_url': cloudinary_result['secure_url'],
                'analysis_results': analysis_results,
                'status': 'completed',
                'model_used': 'YOLOv8n Segmentation'
            }
            
        finally:
            # Clean up temporary file
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)
        
    except Exception as e:
        print(f"Error processing image with YOLO: {str(e)}")
        return {
            'image_id': image_id,
            'error': str(e),
            'status': 'failed'
        }

@shared_task
def process_image(image_id: str, image_data: str, location: str = "", use_roboflow: bool = True):
    """
    Main image processing task - chooses between Roboflow and YOLO
    
    Args:
        image_id: Unique identifier for the image
        image_data: Base64 encoded image data
        location: Location where image was taken
        use_roboflow: Whether to use Roboflow API (True) or local YOLO (False)
    """
    try:
        if use_roboflow:
            # Try Roboflow first
            return process_image_with_roboflow(image_id, image_data, location)
        else:
            # Use local YOLO model
            return process_image_with_yolo(image_id, image_data, location)
            
    except Exception as e:
        print(f"Error in main image processing task: {str(e)}")
        # Fallback to YOLO if Roboflow fails
        if use_roboflow:
            print("Roboflow failed, falling back to YOLO...")
            return process_image_with_yolo(image_id, image_data, location)
        else:
            return {
                'image_id': image_id,
                'error': str(e),
                'status': 'failed'
            } 