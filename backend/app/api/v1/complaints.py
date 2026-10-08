from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from bson import ObjectId
from app.database.connection import get_database
from app.api.deps import get_current_active_user, get_current_officer_user
from app.models.user import UserInDB, UserRole
from app.ml.pipeline import process_complaint
from app.ml.duplicates import duplicate_service
from app.ml.fake_detector import analyze_image_authenticity
from app.models.complaint import ComplaintCreate, ComplaintResponse, ComplaintInDB, AIAnalysis

router = APIRouter()

@router.post("/", response_model=ComplaintResponse)
async def create_complaint(
    complaint_in: ComplaintCreate,
    current_user: UserInDB = Depends(get_current_active_user)
):
    db = get_database()
    
    # 1. AI processing (Department, Priority, Sentiment, Keywords)
    ai_results = process_complaint(complaint_in.title, complaint_in.description)
    
    # 2. Duplicate Detection
    new_embedding = duplicate_service.get_embedding(complaint_in.title + " " + complaint_in.description)
    
    # Fetch recent complaints globally for duplicate check
    recent_complaints_cursor = db.complaints.find({}).sort("created_at", -1).limit(100)
    
    recent_complaints = await recent_complaints_cursor.to_list(length=100)
    
    is_duplicate = False
    duplicate_of = None
    
    if recent_complaints and new_embedding is not None:
        try:
            texts = [c.get("title", "") + " " + c.get("description", "") for c in recent_complaints]
            existing_embeddings = duplicate_service.model.encode(texts, convert_to_tensor=True)
            
            dup_found, dup_idx = duplicate_service.is_duplicate(new_embedding, existing_embeddings)
            
            if dup_found:
                is_duplicate = True
                duplicate_of = str(recent_complaints[dup_idx]["_id"])
                # Increment reporter count of the original
                await db.complaints.update_one(
                    {"_id": recent_complaints[dup_idx]["_id"]},
                    {"$inc": {"reporter_count": 1}}
                )
        except Exception as e:
            print(f"Duplicate check failed: {e}")

    # Find an officer for the predicted department
    assigned_officer_id = None
    if ai_results.get("predicted_department"):
        # Look for an active officer matching the predicted department
        officer = await db.users.find_one({
            "role": "officer", 
            "department": ai_results["predicted_department"],
            "is_active": True
        })
        if officer:
            assigned_officer_id = officer["_id"]

    is_fake_image = False
    image_authenticity_score = 1.0
    image_analysis_details = None
    if complaint_in.image_url:
        fake_analysis = analyze_image_authenticity(complaint_in.image_url)
        is_fake_image = fake_analysis["is_fake_image"]
        image_authenticity_score = fake_analysis["image_authenticity_score"]
        image_analysis_details = {"details": fake_analysis.get("details", "")}

    ai_analysis = AIAnalysis(
        predicted_department=ai_results["predicted_department"],
        predicted_priority=ai_results["predicted_priority"],
        sentiment=ai_results["sentiment"],
        keywords=ai_results["keywords"],
        is_duplicate=is_duplicate,
        duplicate_of=duplicate_of,
        image_analysis=image_analysis_details,
        is_fake_image=is_fake_image,
        image_authenticity_score=image_authenticity_score,
        is_spam=ai_results.get("is_spam", False),
        spam_score=ai_results.get("spam_score", 0.0)
    )

    complaint_db = ComplaintInDB(
        **complaint_in.dict(),
        citizen_id=current_user.id,
        ai_analysis=ai_analysis,
        assigned_officer_id=assigned_officer_id
    )
    
    result = await db.complaints.insert_one(complaint_db.dict(by_alias=True))
    complaint_db.id = result.inserted_id
    
    return complaint_db

@router.get("/", response_model=List[ComplaintResponse])
async def get_my_complaints(
    current_user: UserInDB = Depends(get_current_active_user)
):
    db = get_database()
    cursor = db.complaints.find({"citizen_id": current_user.id})
    complaints = await cursor.to_list(length=100)
    return complaints

@router.get("/public", response_model=List[ComplaintResponse])
async def get_public_complaints():
    db = get_database()
    cursor = db.complaints.find({}).sort("created_at", -1)
    complaints = await cursor.to_list(length=100)
    return complaints

@router.get("/all", response_model=List[ComplaintResponse])
async def get_all_complaints(
    current_user: UserInDB = Depends(get_current_active_user)
):
    print("DEBUG get_all_complaints called by user:", current_user.email, "role:", current_user.role, "type:", type(current_user.role))
    role_str = str(current_user.role.value) if hasattr(current_user.role, 'value') else str(current_user.role)
    if "admin" not in role_str.lower():
        print("DEBUG user is NOT admin! Raising 403")
        raise HTTPException(status_code=403, detail="Only admins can view all complaints")
    print("DEBUG user IS admin! Fetching complaints")
        
    db = get_database()
    cursor = db.complaints.find({}).sort("created_at", -1)
    complaints = await cursor.to_list(length=3500)
    return complaints

@router.get("/assigned", response_model=List[ComplaintResponse])
async def get_assigned_complaints(
    current_user: UserInDB = Depends(get_current_active_user)
):
    role_str = current_user.role.value if hasattr(current_user.role, 'value') else str(current_user.role)
    if role_str != "officer":
        raise HTTPException(status_code=403, detail="Only officers can view assigned complaints")
        
    db = get_database()
    cursor = db.complaints.find({"assigned_officer_id": current_user.id}).sort("created_at", -1)
    complaints = await cursor.to_list(length=500)
    return complaints

@router.get("/{complaint_id}", response_model=ComplaintResponse)
async def get_complaint(
    complaint_id: str,
    current_user: UserInDB = Depends(get_current_active_user)
):
    db = get_database()
    try:
        complaint = await db.complaints.find_one({"_id": {"$in": [ObjectId(complaint_id), complaint_id]}})
    except:
        complaint = await db.complaints.find_one({"_id": complaint_id})
    
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
        
    if str(complaint["citizen_id"]) != str(current_user.id) and current_user.role not in ["admin", "officer"]:
        raise HTTPException(status_code=403, detail="Not enough privileges")
        
    return complaint

from pydantic import BaseModel
from typing import Optional

class StatusUpdate(BaseModel):
    status: str
    rejection_reason: Optional[str] = None
    progress_note: Optional[str] = None

@router.put("/{complaint_id}/status", response_model=ComplaintResponse)
async def update_complaint_status(
    complaint_id: str,
    status_update: StatusUpdate,
    current_user: UserInDB = Depends(get_current_active_user)
):
    db = get_database()
    
    if current_user.role not in ["admin", "officer"]:
        raise HTTPException(status_code=403, detail="Only officers can update status")
        
    update_data = {"status": status_update.status}
    if status_update.status == "rejected" and status_update.rejection_reason:
        update_data["rejection_reason"] = status_update.rejection_reason
    
    if status_update.status == "in_progress" and status_update.progress_note:
        update_data["progress_note"] = status_update.progress_note
        
    try:
        result = await db.complaints.find_one_and_update(
            {"_id": {"$in": [ObjectId(complaint_id), complaint_id]}},
            {"$set": update_data},
            return_document=True
        )
    except:
        result = await db.complaints.find_one_and_update(
            {"_id": complaint_id},
            {"$set": update_data},
            return_document=True
        )
    
    if not result:
        raise HTTPException(status_code=404, detail="Complaint not found")
        
    return result
