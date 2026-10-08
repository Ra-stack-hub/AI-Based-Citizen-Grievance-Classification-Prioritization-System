from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from enum import Enum
from bson import ObjectId
from app.models.user import PyObjectId

class ComplaintStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    REJECTED = "rejected"

class PriorityLevel(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class Location(BaseModel):
    latitude: float
    longitude: float
    address: Optional[str] = None

class ComplaintCreate(BaseModel):
    title: str
    description: str
    location: Location
    image_url: Optional[str] = None
    voice_url: Optional[str] = None
    video_url: Optional[str] = None
    # Department is optional, normally predicted by AI
    department: Optional[str] = None
    category: Optional[str] = None

class AIAnalysis(BaseModel):
    predicted_department: Optional[str] = None
    predicted_priority: Optional[PriorityLevel] = None
    sentiment: Optional[str] = None
    keywords: List[str] = []
    is_duplicate: bool = False
    duplicate_of: Optional[str] = None # ID of the original complaint
    image_analysis: Optional[Dict[str, Any]] = None
    is_fake_image: bool = False
    image_authenticity_score: float = 1.0
    is_spam: bool = False
    spam_score: float = 0.0

    model_config = ConfigDict(
        use_enum_values=True,
    )

class ComplaintInDB(ComplaintCreate):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    citizen_id: PyObjectId
    status: ComplaintStatus = ComplaintStatus.PENDING
    assigned_officer_id: Optional[PyObjectId] = None
    ai_analysis: Optional[AIAnalysis] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    reporter_count: int = 1 # Increments if duplicates are found
    rejection_reason: Optional[str] = None
    progress_note: Optional[str] = None

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        use_enum_values=True,
    )
        
class ComplaintResponse(ComplaintInDB):
    pass
