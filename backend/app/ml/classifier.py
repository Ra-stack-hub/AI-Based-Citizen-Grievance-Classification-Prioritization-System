import os
import joblib
import logging

logger = logging.getLogger(__name__)

DEPARTMENTS = [
    "Road Department",
    "Water Supply Department",
    "Electricity Department",
    "Sanitation Department",
    "Health Department",
    "Revenue Department",
    "Public Safety Department",
    "Drainage Department",
    "Municipal Corporation",
    "Traffic Department"
]

class ComplaintClassifier:
    def __init__(self):
        try:
            model_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "ml", "models", "department_classifier.joblib")
            if os.path.exists(model_path):
                self.classifier = joblib.load(model_path)
                logger.info(f"Successfully loaded trained classifier from {model_path}")
            else:
                logger.warning(f"Model not found at {model_path}. Using fallback.")
                self.classifier = None
        except Exception as e:
            logger.error(f"Failed to load classifier model: {e}")
            self.classifier = None

    def predict_department(self, text: str) -> str:
        if not self.classifier:
            return "Municipal Corporation" # Default fallback
            
        try:
            # The model is a sklearn pipeline that outputs a single string prediction
            prediction = self.classifier.predict([text])[0]
            return prediction
        except Exception as e:
            logger.error(f"Prediction failed: {e}")
            return "Municipal Corporation"

classifier_service = ComplaintClassifier()
