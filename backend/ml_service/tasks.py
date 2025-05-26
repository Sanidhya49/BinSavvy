from celery import shared_task
from ultralytics import YOLO
import cv2
import numpy as np
from django.conf import settings
from images.models import ImageUpload
import os

@shared_task
def process_image(image_id):
    try:
        # Get the image upload instance
        image_upload = ImageUpload.objects.get(id=image_id)
        image_upload.status = 'processing'
        image_upload.save()

        # Load YOLO model
        model = YOLO('yolov8n-seg.pt')  # Using YOLOv8 nano model with segmentation

        # Read image
        image_path = image_upload.image.path
        img = cv2.imread(image_path)
        
        # Run inference
        results = model(img)
        
        # Process results
        result = results[0]
        masks = result.masks
        boxes = result.boxes
        
        # Create visualization
        if masks is not None:
            # Create mask overlay
            mask_overlay = np.zeros_like(img)
            for mask in masks.data:
                mask_overlay[mask.cpu().numpy() > 0.5] = [0, 255, 0]  # Green overlay
            
            # Blend original image with mask overlay
            alpha = 0.5
            output = cv2.addWeighted(img, 1, mask_overlay, alpha, 0)
            
            # Save processed image
            processed_path = os.path.join(settings.MEDIA_ROOT, 'processed', f'{image_id}_processed.jpg')
            os.makedirs(os.path.dirname(processed_path), exist_ok=True)
            cv2.imwrite(processed_path, output)
            
            # Update image upload with processed image
            image_upload.processed_image = f'processed/{image_id}_processed.jpg'
        
        # Save analysis results
        analysis_results = {
            'detections': [],
            'masks': []
        }
        
        if boxes is not None:
            for box in boxes:
                detection = {
                    'class': model.names[int(box.cls)],
                    'confidence': float(box.conf),
                    'bbox': box.xyxy[0].tolist()
                }
                analysis_results['detections'].append(detection)
        
        image_upload.analysis_results = analysis_results
        image_upload.status = 'completed'
        image_upload.save()
        
        return True
        
    except Exception as e:
        if image_upload:
            image_upload.status = 'failed'
            image_upload.save()
        raise e 