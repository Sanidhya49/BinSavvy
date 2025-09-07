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
        # Allow overriding via env; default to the requested model
        self.model_id = os.getenv('ROBOFLOW_MODEL_ID', "garbage-det-t1lur/1")
        self.api_url = "https://serverless.roboflow.com"
        
        print(f"DEBUG: RoboflowConfig initialization")
        print(f"DEBUG: ROBOFLOW_API_KEY present: {bool(self.api_key)}")
        print(f"DEBUG: ROBOFLOW_MODEL_ID: {self.model_id}")
        print(f"DEBUG: API URL: {self.api_url}")
        
        if not self.api_key:
            print("ERROR: ROBOFLOW_API_KEY not found in environment variables")
            print("ERROR: Please set ROBOFLOW_API_KEY in your environment")
            # Don't raise error immediately, allow graceful degradation
            self.api_key = None
    
    def predict_image(self, image_path: str, confidence_threshold: float = 0.1) -> Dict[str, Any]:
        """
        Predict waste detection on an image using Roboflow API
        
        Args:
            image_path: Path to the image file
            confidence_threshold: Minimum confidence threshold (0.0 to 1.0, default 0.1 = 10%)
            
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
                "api_key": self.api_key,
                "confidence": confidence_threshold
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
    
    def predict_image_from_url(self, image_url: str, confidence_threshold: float = 0.1) -> Dict[str, Any]:
        """
        Predict waste detection on an image using URL
        
        Args:
            image_url: URL of the image
            confidence_threshold: Minimum confidence threshold (0.0 to 1.0, default 0.1 = 10%)
            
        Returns:
            Dictionary containing prediction results
        """
        try:
            # Check if API key is available
            if not self.api_key:
                error_msg = "Roboflow API key not configured. Please set ROBOFLOW_API_KEY environment variable."
                print(f"ERROR: {error_msg}")
                return {"error": error_msg, "predictions": []}
            
            url = f"{self.api_url}/{self.model_id}"
            headers = {
                "Content-Type": "application/x-www-form-urlencoded"
            }
            params = {
                "api_key": self.api_key,
                "image": image_url,
                "confidence": confidence_threshold
            }
            
            print(f"DEBUG: Roboflow API call - URL: {url}")
            print(f"DEBUG: Roboflow API call - Params: {params}")
            
            response = requests.post(url, headers=headers, params=params, timeout=30)
            
            print(f"DEBUG: Roboflow API response status: {response.status_code}")
            print(f"DEBUG: Roboflow API response text: {response.text[:500]}...")  # First 500 chars
            
            if response.status_code == 200:
                result = response.json()
                print(f"DEBUG: Roboflow API response JSON: {result}")
                return result
            else:
                error_msg = f"API request failed with status {response.status_code}: {response.text}"
                print(f"ERROR: {error_msg}")
                return {"error": error_msg, "predictions": []}
                
        except Exception as e:
            error_msg = f"Error in Roboflow prediction from URL: {str(e)}"
            print(f"ERROR: {error_msg}")
            return {"error": error_msg, "predictions": []}
    
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
                "model_used": self.model_id,
                "model_accuracy": ""
            }
            
            return analysis_results
            
        except Exception as e:
            print(f"Error analyzing predictions: {str(e)}")
            return {"error": str(e)}

# Create global instance with error handling
try:
    roboflow_config = RoboflowConfig()
    print("DEBUG: RoboflowConfig initialized successfully")
except Exception as e:
    print(f"ERROR: Failed to initialize RoboflowConfig: {str(e)}")
    # Create a dummy config to prevent import errors
    class DummyRoboflowConfig:
        def __init__(self):
            self.api_key = None
            self.model_id = "garbage-det-t1lur/1"
            self.api_url = "https://serverless.roboflow.com"
        
        def predict_image_from_url(self, image_url, confidence_threshold=0.1):
            return {"error": "Roboflow not configured", "predictions": []}
        
        def analyze_predictions(self, predictions):
            return {"error": "Roboflow not configured", "total_detections": 0}
    
    roboflow_config = DummyRoboflowConfig() 