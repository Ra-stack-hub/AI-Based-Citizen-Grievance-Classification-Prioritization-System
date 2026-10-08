import re
from fastapi import HTTPException

def validate_phone_number(phone: str) -> bool:
    pattern = re.compile(r"^\+?1?\d{9,15}$")
    if not pattern.match(phone):
        raise HTTPException(status_code=400, detail="Invalid phone number format")
    return True

def validate_password_strength(password: str) -> bool:
    if len(password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters long")
    if not re.search(r"[A-Z]", password):
        raise HTTPException(status_code=400, detail="Password must contain at least one uppercase letter")
    if not re.search(r"[0-9]", password):
        raise HTTPException(status_code=400, detail="Password must contain at least one number")
    return True
