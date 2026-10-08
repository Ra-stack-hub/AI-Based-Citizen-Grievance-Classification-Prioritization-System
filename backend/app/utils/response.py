from typing import Any, Optional, Dict
from pydantic import BaseModel

class APIResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Any] = None
    errors: Optional[Dict[str, Any]] = None

def success_response(data: Any, message: str = "Success") -> dict:
    return {"success": True, "message": message, "data": data}

def error_response(message: str, errors: Optional[Dict[str, Any]] = None) -> dict:
    return {"success": False, "message": message, "errors": errors}
