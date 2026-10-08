from app.models.complaint import PriorityLevel

# Keywords indicating high severity
EMERGENCY_KEYWORDS = ["fire", "blood", "accident", "death", "collapse", "explosion", "urgent", "immediate", "danger"]
HIGH_SEVERITY_KEYWORDS = ["broken", "no water", "power cut", "leak", "block", "overflow", "stray dog", "bribe"]

def predict_priority(text: str, sentiment: str, department: str) -> PriorityLevel:
    text_lower = text.lower()
    
    # 1. Check emergency keywords
    for word in EMERGENCY_KEYWORDS:
        if word in text_lower:
            return PriorityLevel.CRITICAL
            
    # 2. Check sentiment impact
    if sentiment == "Critical":
        return PriorityLevel.CRITICAL
    
    # 3. Check high severity keywords
    for word in HIGH_SEVERITY_KEYWORDS:
        if word in text_lower:
            return PriorityLevel.HIGH
            
    if sentiment == "Angry" or sentiment == "Negative":
        return PriorityLevel.HIGH
        
    # 4. Department specific heuristics
    if department in ["Health Department", "Public Safety Department"]:
        return PriorityLevel.HIGH
        
    if department in ["Sanitation Department", "Electricity Department", "Water Supply Department"]:
        return PriorityLevel.MEDIUM
        
    return PriorityLevel.LOW
