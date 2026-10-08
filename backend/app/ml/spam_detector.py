import logging
import re

logger = logging.getLogger(__name__)

_spam_detector_pipeline = None

def get_spam_detector():
    global _spam_detector_pipeline
    if _spam_detector_pipeline is None:
        try:
            from transformers import pipeline
            logger.info("Loading text spam detector model...")
            # A lightweight text classification model for spam
            _spam_detector_pipeline = pipeline("text-classification", model="mrm8488/bert-tiny-finetuned-sms-spam-detection")
            logger.info("Text spam detector model loaded.")
        except Exception as e:
            logger.error(f"Failed to load text spam detector: {e}")
            _spam_detector_pipeline = "failed"
    return _spam_detector_pipeline

def analyze_text_spam(text: str) -> dict:
    """
    Detects if the given grievance text is spam, gibberish, or a fake complaint.
    """
    result = {
        "is_spam": False,
        "spam_score": 0.0,
        "details": "Looks legitimate"
    }
    
    if not text or len(text.strip()) < 5:
        return {
            "is_spam": True,
            "spam_score": 0.99,
            "details": "Text is too short or empty."
        }
        
    # Heuristics: Check for repeating characters (e.g., "asdfghjkl", "aaaaaa")
    if re.search(r'(.)\1{5,}', text):
        return {
            "is_spam": True,
            "spam_score": 0.85,
            "details": "Contains repeating characters/gibberish."
        }
        
    # Heuristics: Check for mostly special characters
    alpha_chars = sum(c.isalpha() for c in text)
    if alpha_chars > 0 and (len(text) - alpha_chars) / len(text) > 0.5:
        return {
            "is_spam": True,
            "spam_score": 0.90,
            "details": "Too many special characters or non-alphabetic symbols."
        }

    try:
        detector = get_spam_detector()
        if detector and detector != "failed":
            # Truncate text to avoid length issues
            preds = detector(text[:512])
            for p in preds:
                label = p['label'].lower()
                score = p['score']
                if 'spam' in label or 'label_1' in label: # Sometimes it outputs label_1 for spam
                    result["spam_score"] = score
                    if score > 0.5:
                        result["is_spam"] = True
                        result["details"] = "AI detected this as spam."
                        break
                elif 'ham' in label or 'legit' in label or 'label_0' in label:
                    result["spam_score"] = 1.0 - score
                    if result["spam_score"] > 0.5:
                        result["is_spam"] = True
                        result["details"] = "AI detected this as spam."
                    break
    except Exception as e:
        logger.error(f"Error analyzing text for spam: {e}")

    return result
