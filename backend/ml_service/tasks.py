import os
import tempfile
import base64
import requests
from celery import shared_task
import django
from django.conf import settings
from cloudinary_config import upload_processed_image
from roboflow_config import roboflow_config
from PIL import Image, ImageDraw, ImageFont
import io

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

def create_processed_image_with_detections(image_path: str, predictions: list, confidence_threshold: float = 0.1) -> str:
    """
    Create a processed image with detection boxes and labels
    
    Args:
        image_path: Path to the original image
        predictions: List of predictions from ML model
        confidence_threshold: Minimum confidence threshold
    
    Returns:
        Path to the processed image file
    """
    try:
        # Open the original image
        with Image.open(image_path) as img:
            # Convert to RGB if necessary
            if img.mode != 'RGB':
                img = img.convert('RGB')
            
            # Create a copy for drawing
            processed_img = img.copy()
            draw = ImageDraw.Draw(processed_img)
            
            # Try to load a font, fallback to default if not available
            try:
                font = ImageFont.truetype("arial.ttf", 16)
            except:
                font = ImageFont.load_default()
            
            # Filter predictions by confidence threshold
            filtered_predictions = [p for p in predictions if p.get('confidence', 0) >= confidence_threshold]
            print(f"DEBUG: Filtered predictions: {filtered_predictions}")
            
            # Draw detection boxes
            for prediction in filtered_predictions:
                # Extract bounding box coordinates
                x = prediction.get('x', 0)
                y = prediction.get('y', 0)
                width = prediction.get('width', 0)
                height = prediction.get('height', 0)
                confidence = prediction.get('confidence', 0)
                class_name = prediction.get('class', 'Garbage')
                
                # Calculate box coordinates
                x1 = x - width / 2
                y1 = y - height / 2
                x2 = x + width / 2
                y2 = y + height / 2
                
                # Draw rectangle
                draw.rectangle([x1, y1, x2, y2], outline='red', width=3)
                
                # Draw label
                label = f"{class_name} {confidence:.2f}"
                label_bbox = draw.textbbox((x1, y1 - 20), label, font=font)
                draw.rectangle(label_bbox, fill='red')
                draw.text((x1, y1 - 20), label, fill='white', font=font)
            
            # Save processed image to temporary file
            temp_processed_path = tempfile.mktemp(suffix='.jpg')
            processed_img.save(temp_processed_path, 'JPEG', quality=95)
            
            return temp_processed_path
            
    except Exception as e:
        print(f"Error creating processed image: {e}")
        # Return original image path if processing fails
        return image_path

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
        
        # Create and upload processed image with detection overlays
        processed_image_url = None
        print(f"DEBUG: Total detections: {analysis_results.get('total_detections', 0)}")
        print(f"DEBUG: Predictions: {roboflow_result.get('predictions', [])}")
        
        if analysis_results.get('total_detections', 0) > 0:
            try:
                print(f"DEBUG: Creating processed image with detections...")
                # Create processed image with detection boxes
                processed_image_path = create_processed_image_with_detections(
                    temp_file_path, 
                    roboflow_result.get('predictions', []), 
                    confidence_threshold
                )
                
                print(f"DEBUG: Processed image created at: {processed_image_path}")
                
                # Upload processed image to Cloudinary
                processed_image_url = upload_processed_image(processed_image_path, folder="binsavvy/processed")
                print(f"DEBUG: Processed image uploaded to: {processed_image_url}")
                
                # Clean up temporary processed image
                if processed_image_path != temp_file_path and os.path.exists(processed_image_path):
                    os.unlink(processed_image_path)
                    
            except Exception as upload_error:
                print(f"Error uploading processed image: {upload_error}")
                # Fallback to original image
                processed_image_url = image_url
        else:
            print(f"DEBUG: No detections found, using original image")
            processed_image_url = image_url
        
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
        
        # Create and upload processed image with detection overlays
        processed_image_url = None
        if len(detections) > 0:
            try:
                # Convert YOLO detections to the format expected by create_processed_image_with_detections
                predictions = []
                for detection in detections:
                    bbox = detection['bbox']
                    if len(bbox) == 4:
                        x = (bbox[0] + bbox[2]) / 2  # center x
                        y = (bbox[1] + bbox[3]) / 2  # center y
                        width = bbox[2] - bbox[0]    # width
                        height = bbox[3] - bbox[1]   # height
                        
                        predictions.append({
                            'x': x,
                            'y': y,
                            'width': width,
                            'height': height,
                            'confidence': detection['confidence'],
                            'class': 'Garbage'  # YOLO doesn't have specific waste classes
                        })
                
                # Create processed image with detection boxes
                processed_image_path = create_processed_image_with_detections(
                    temp_file_path, 
                    predictions, 
                    confidence_threshold
                )
                
                # Upload processed image to Cloudinary
                processed_image_url = upload_processed_image(processed_image_path, folder="binsavvy/processed")
                
                # Clean up temporary processed image
                if processed_image_path != temp_file_path and os.path.exists(processed_image_path):
                    os.unlink(processed_image_path)
                    
                         except Exception as upload_error:
                 print(f"Error uploading processed image: {upload_error}")
                 # Fallback to original image
                 processed_image_url = image_url
        
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