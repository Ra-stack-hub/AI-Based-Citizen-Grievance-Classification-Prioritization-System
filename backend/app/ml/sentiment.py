from transformers import pipeline
import logging

logger = logging.getLogger(__name__)

class SentimentAnalyzer:
    def __init__(self):
        try:
            self.analyzer = pipeline("sentiment-analysis", model="distilbert-base-uncased-finetuned-sst-2-english")
        except Exception as e:
            logger.error(f"Failed to load sentiment model: {e}")
            self.analyzer = None

    def analyze(self, text: str) -> str:
        if not self.analyzer:
            return "Neutral"
            
        result = self.analyzer(text)[0]
        # map to required categories: Positive, Neutral, Negative, Angry, Critical
        # Since standard sentiment is POSITIVE/NEGATIVE, we can use heuristics for more granular sentiment
        score = result['score']
        label = result['label']
        
        if label == "NEGATIVE":
            if score > 0.95:
                return "Critical"
            elif score > 0.8:
                return "Angry"
            else:
                return "Negative"
        else:
            if score > 0.8:
                return "Positive"
            else:
                return "Neutral"

sentiment_service = SentimentAnalyzer()
