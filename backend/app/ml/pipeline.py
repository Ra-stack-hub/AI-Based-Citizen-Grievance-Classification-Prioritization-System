from typing import Dict, Any
from app.ml.nlp_utils import clean_text, extract_keywords
from app.ml.classifier import classifier_service
from app.ml.sentiment import sentiment_service
from app.ml.priority import predict_priority
from app.ml.duplicates import duplicate_service
from app.ml.spam_detector import analyze_text_spam

def process_complaint(title: str, description: str) -> Dict[str, Any]:
    """
    Main orchestration function for AI analysis of a complaint.
    """
    full_text = f"{title}. {description}"
    cleaned = clean_text(full_text)
    
    # 1. Keywords
    keywords = extract_keywords(cleaned)
    
    # 2. Sentiment
    sentiment = sentiment_service.analyze(cleaned)
    
    # 3. Department Classification
    department = classifier_service.predict_department(cleaned)
    
    # 4. Priority Prediction
    priority = predict_priority(cleaned, sentiment, department)
    
    # Note: Duplicate detection requires querying DB for recent complaints
    # This will be handled in the API router level, not here.
    
    # 5. Spam Detection
    spam_analysis = analyze_text_spam(full_text)
    
    return {
        "predicted_department": department,
        "predicted_priority": priority,
        "sentiment": sentiment,
        "keywords": keywords,
        "is_spam": spam_analysis["is_spam"],
        "spam_score": spam_analysis["spam_score"],
        "spam_details": spam_analysis.get("details", "")
    }
