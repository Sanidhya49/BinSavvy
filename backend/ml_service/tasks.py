import os
import tempfile
import base64
import requests
from celery import shared_task
import django
from django.conf import settings
from cloudinary_config import upload_processed_image
from roboflow_config import roboflow_config

# Configure Django settings for Celery tasks
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'binsavvy.settings')
django.setup()

def download_image_from_url(image_url: str) -> str:
    """Download image from URL and return temporary file path"""
    try:
        response = requests.get(image_url, timeout=30)
        response.raise_for_status()
        
        # Create temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_file:
            temp_file.write(response.content)
            return temp_file.name
    except Exception as e:
        print(f"Error downloading image from URL: {e}")
        raise e

@shared_task
def process_image_with_roboflow(image_id: str, image_url: str, location: str = "", confidence_threshold: float = 0.1, min_detection_size: int = 20, max_detections: int = 50):
    """
    Process image using Roboflow waste detection model
    
    Args:
        image_id: Unique identifier for the image
        image_url: Cloudinary URL of the image
        location: Location where image was taken
        confidence_threshold: Minimum confidence for detections (0.0-1.0)
        min_detection_size: Minimum detection size in pixels
        max_detections: Maximum number of detections per image
    """
    temp_file_path = None
    try:
        print(f"Processing image {image_id} with Roboflow from URL: {image_url}")
        
        # Download image from Cloudinary URL
        temp_file_path = download_image_from_url(image_url)
        
        # Process with Roboflow directly from URL
        roboflow_result = roboflow_config.predict_image_from_url(image_url, confidence_threshold)
        
        # Analyze predictions
        analysis_results = roboflow_config.analyze_predictions(roboflow_result)
        
        # Upload processed image to Cloudinary if we have results
        processed_image_url = None
        if analysis_results.get('total_detections', 0) > 0:
            try:
                # For now, we'll use the original image as processed
                # In a real implementation, you'd overlay detection boxes
                processed_image_url = upload_processed_image(temp_file_path, folder="binsavvy/processed")
            except Exception as upload_error:
                print(f"Error uploading processed image: {upload_error}")
        
        return {
            'image_id': image_id,
            'processed_image_url': processed_image_url,
            'analysis_results': analysis_results,
            'status': 'completed',
            'model_used': 'Roboflow Waste Detection v2'
        }
        
    except Exception as e:
        print(f"Error processing image with Roboflow: {str(e)}")
        return {
            'image_id': image_id,
            'error': str(e),
            'status': 'failed'
        }
    finally:
        # Clean up temporary file
        if temp_file_path and os.path.exists(temp_file_path):
            os.unlink(temp_file_path)

@shared_task
def process_image_with_yolo(image_id: str, image_url: str, location: str = "", confidence_threshold: float = 0.1, min_detection_size: int = 20, max_detections: int = 50):
    """
    Process image using local YOLOv8 model (fallback)
    
    Args:
        image_id: Unique identifier for the image
        image_url: Cloudinary URL of the image
        location: Location where image was taken
        confidence_threshold: Minimum confidence for detections (0.0-1.0)
        min_detection_size: Minimum detection size in pixels
        max_detections: Maximum number of detections per image
    """
    temp_file_path = None
    try:
        print(f"Processing image {image_id} with YOLOv8 from URL: {image_url}")
        
        # Download image from Cloudinary URL
        temp_file_path = download_image_from_url(image_url)
        
        # Load YOLO model
        try:
            # Lazy import to avoid heavy dependency at startup
            from ultralytics import YOLO  # type: ignore
            model = YOLO('yolov8n-seg.pt')
        except Exception as model_error:
            print(f"Error loading YOLO model: {model_error}")
            # Try with weights_only=False as fallback
            try:
                from ultralytics import YOLO  # type: ignore
                model = YOLO('yolov8n-seg.pt', weights_only=False)
            except Exception as fallback_error:
                print(f"Fallback YOLO loading also failed: {fallback_error}")
                return {
                    'image_id': image_id,
                    'error': f'YOLO model loading failed: {str(fallback_error)}',
                    'status': 'failed'
                }
        
        # Run inference
        results = model(temp_file_path)
        
        # Process results
        detections = []
        for result in results:
            if result.boxes is not None:
                for box in result.boxes:
                    confidence = float(box.conf[0]) if len(box.conf) > 0 else 0
                    
                    # Filter by confidence threshold
                    if confidence < confidence_threshold:
                        continue
                    
                    # Calculate detection size
                    bbox = box.xyxy[0].tolist() if len(box.xyxy) > 0 else []
                    if len(bbox) == 4:
                        width = bbox[2] - bbox[0]
                        height = bbox[3] - bbox[1]
                        size = min(width, height)
                        
                        # Filter by minimum detection size
                        if size < min_detection_size:
                            continue
                    
                    detection = {
                        'class': int(box.cls[0]) if len(box.cls) > 0 else 0,
                        'confidence': confidence,
                        'bbox': bbox
                    }
                    detections.append(detection)
                    
                    # Limit to max detections
                    if len(detections) >= max_detections:
                        break
        
        # Create analysis results
        analysis_results = {
            'total_detections': len(detections),
            'detections': detections,
            'model_used': 'YOLOv8 Local Model',
            'message': f'Found {len(detections)} objects in image'
        }
        
        # Upload processed image to Cloudinary if we have results
        processed_image_url = None
        if len(detections) > 0:
            try:
                # For now, we'll use the original image as processed
                # In a real implementation, you'd overlay detection boxes
                processed_image_url = upload_processed_image(temp_file_path, folder="binsavvy/processed")
            except Exception as upload_error:
                print(f"Error uploading processed image: {upload_error}")
        
        return {
            'image_id': image_id,
            'processed_image_url': processed_image_url,
            'analysis_results': analysis_results,
            'status': 'completed',
            'model_used': 'YOLOv8 Local Model'
        }
        
    except Exception as e:
        print(f"Error processing image with YOLOv8: {str(e)}")
        return {
            'image_id': image_id,
            'error': str(e),
            'status': 'failed'
        }
    finally:
        # Clean up temporary file
        if temp_file_path and os.path.exists(temp_file_path):
            os.unlink(temp_file_path)

def process_image(image_id: str, image_url: str, location: str = "", use_roboflow: bool = True, 
                 confidence_threshold: float = 0.1, min_detection_size: int = 20, max_detections: int = 50):
    """
    Main function to process image with ML models
    
    Args:
        image_id: Unique identifier for the image
        image_url: Cloudinary URL of the image
        location: Location where image was taken
        use_roboflow: Whether to use Roboflow (True) or YOLOv8 (False)
        confidence_threshold: Minimum confidence for detections (0.0-1.0)
        min_detection_size: Minimum detection size in pixels
        max_detections: Maximum number of detections per image
    """
    try:
        print(f"Starting ML processing for image {image_id} with confidence={confidence_threshold}")
        
        if use_roboflow:
            return process_image_with_roboflow(image_id, image_url, location, confidence_threshold, min_detection_size, max_detections)
        else:
            return process_image_with_yolo(image_id, image_url, location, confidence_threshold, min_detection_size, max_detections)
            
    except Exception as e:
        print(f"Error in process_image: {str(e)}")
        return {
            'image_id': image_id,
            'error': str(e),
            'status': 'failed'
        } 