import logging
from transformers import pipeline

logger = logging.getLogger(__name__)

INTENTS = [
    "FILE_COMPLAINT",
    "TRACK_COMPLAINT",
    "MY_COMPLAINTS",
    "CHECK_STATUS",
    "DEPARTMENT_HELP",
    "PRIORITY_EXPLANATION",
    "REOPEN_COMPLAINT",
    "COMPLAINT_DETAILS",
    "GENERAL_HELP",
    "CIVIC_INFORMATION_RAG"
]

class IntentDetector:
    def __init__(self):
        try:
            # We reuse the same model as the department classifier if possible,
            # or initialize a new zero-shot instance for intent classification.
            self.classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")
        except Exception as e:
            logger.error(f"Failed to load intent classifier model: {e}")
            self.classifier = None

    def detect_intent(self, text: str) -> str:
        if not self.classifier:
            return "UNKNOWN"
            
        # Quick heuristic overrides for common exact phrases
        lower_text = text.lower()
        if lower_text in ["hi", "hello", "hey"]:
            return "GENERAL_HELP"
            
        result = self.classifier(text, INTENTS)
        top_intent = result["labels"][0]
        confidence = result["scores"][0]
        
        # Threshold for UNKNOWN
        if confidence < 0.2:
            return "UNKNOWN"
            
        return top_intent

intent_service = IntentDetector()
