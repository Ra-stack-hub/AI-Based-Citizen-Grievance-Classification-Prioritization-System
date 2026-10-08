from typing import Dict, Any, List
from app.ml.pipeline import process_complaint
from app.database.connection import get_database
from bson import ObjectId

async def analyze_complaint_tool(title: str, description: str) -> Dict[str, Any]:
    """Uses the existing ML pipeline to analyze a complaint."""
    # The existing pipeline returns { predicted_department, predicted_priority, sentiment, keywords }
    return process_complaint(title, description)

async def get_user_complaints_tool(user_id: str) -> List[Dict[str, Any]]:
    """Fetches all complaints for a user."""
    db = get_database()
    cursor = db.complaints.find({"citizen_id": ObjectId(user_id)})
    complaints = await cursor.to_list(length=100)
    # Serialize ObjectId for JSON readiness
    for c in complaints:
        c["_id"] = str(c["_id"])
        c["citizen_id"] = str(c["citizen_id"])
    return complaints

async def get_complaint_status_tool(complaint_id: str) -> Dict[str, Any]:
    """Fetches status for a specific complaint ID."""
    db = get_database()
    try:
        # If the ID starts with 'GRV-', strip it for internal DB match if necessary.
        # Assuming internal IDs are ObjectIds, but in UI they might be shown as GRV-XYZ.
        # For this tool, we assume complaint_id is the ObjectId string.
        clean_id = complaint_id.replace("GRV-", "") if complaint_id.startswith("GRV-") else complaint_id
        complaint = await db.complaints.find_one({"_id": ObjectId(clean_id)})
        if complaint:
            complaint["_id"] = str(complaint["_id"])
            complaint["citizen_id"] = str(complaint["citizen_id"])
            return complaint
    except Exception:
        pass
    return None
