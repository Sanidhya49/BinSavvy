import os
import requests
import base64
from typing import Dict, List, Any
from django.conf import settings
from dotenv import load_dotenv

load_dotenv()

class RoboflowConfig:
    """Configuration for Roboflow waste detection model"""
    
    def __init__(self):
        self.api_key = os.getenv('ROBOFLOW_API_KEY')
        self.model_id = "waste-detection-xkvwi/2"  # The model you referenced
        self.api_url = "https://serverless.roboflow.com"
        
        if not self.api_key:
            raise ValueError("ROBOFLOW_API_KEY not found in environment variables")
    
    def predict_image(self, image_path: str) -> Dict[str, Any]:
        """
        Predict waste detection on an image using Roboflow API
        
        Args:
            image_path: Path to the image file
            
        Returns:
            Dictionary containing prediction results
        """
        try:
            # Read and encode the image
            with open(image_path, "rb") as image_file:
                image_data = base64.b64encode(image_file.read()).decode('utf-8')
            
            # Prepare the API request
            url = f"{self.api_url}/{self.model_id}"
            headers = {
                "Content-Type": "application/x-www-form-urlencoded"
            }
            params = {
                "api_key": self.api_key
            }
            
            # Make the API request
            response = requests.post(
                url,
                data=image_data,
                headers=headers,
                params=params
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                raise Exception(f"API request failed with status {response.status_code}: {response.text}")
                
        except Exception as e:
            print(f"Error in Roboflow prediction: {str(e)}")
            return {"error": str(e)}
    
    def predict_image_from_url(self, image_url: str) -> Dict[str, Any]:
        """
        Predict waste detection on an image using URL
        
        Args:
            image_url: URL of the image
            
        Returns:
            Dictionary containing prediction results
        """
        try:
            url = f"{self.api_url}/{self.model_id}"
            headers = {
                "Content-Type": "application/x-www-form-urlencoded"
            }
            params = {
                "api_key": self.api_key,
                "image": image_url
            }
            
            response = requests.post(url, headers=headers, params=params)
            
            if response.status_code == 200:
                return response.json()
            else:
                raise Exception(f"API request failed with status {response.status_code}: {response.text}")
                
        except Exception as e:
            print(f"Error in Roboflow prediction from URL: {str(e)}")
            return {"error": str(e)}
    
    def analyze_predictions(self, predictions: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze and format prediction results
        
        Args:
            predictions: Raw prediction results from Roboflow
            
        Returns:
            Formatted analysis results
        """
        try:
            if "error" in predictions:
                return predictions
            
            # Extract predictions
            detections = predictions.get("predictions", [])
            
            # Count different types of waste
            waste_counts = {}
            total_confidence = 0
            total_detections = len(detections)
            
            for detection in detections:
                class_name = detection.get("class", "unknown")
                confidence = detection.get("confidence", 0)
                
                if class_name not in waste_counts:
                    waste_counts[class_name] = 0
                waste_counts[class_name] += 1
                total_confidence += confidence
            
            # Calculate average confidence
            avg_confidence = total_confidence / total_detections if total_detections > 0 else 0
            
            # Format results
            analysis_results = {
                "total_detections": total_detections,
                "average_confidence": round(avg_confidence, 3),
                "waste_types": waste_counts,
                "detections": detections,
                "model_used": "Roboflow Waste Detection v2",
                "model_accuracy": "88.9% mAP"
            }
            
            return analysis_results
            
        except Exception as e:
            print(f"Error analyzing predictions: {str(e)}")
            return {"error": str(e)}

# Create global instance
roboflow_config = RoboflowConfig() 