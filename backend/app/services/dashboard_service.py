from app.database.connection import get_database

async def get_dashboard_stats():
    db = get_database()
    
    total_complaints = await db.complaints.count_documents({})
    resolved_complaints = await db.complaints.count_documents({"status": "Resolved"})
    pending_complaints = total_complaints - resolved_complaints
    
    # Priority breakdown
    pipeline = [
        {"$group": {"_id": "$ai_analysis.predicted_priority", "count": {"$sum": 1}}}
    ]
    priority_cursor = db.complaints.aggregate(pipeline)
    priority_data = await priority_cursor.to_list(length=10)
    
    priority_distribution = {
        item["_id"] if item["_id"] else "Unassigned": item["count"] 
        for item in priority_data
    }

    # Department breakdown
    dept_pipeline = [
        {"$group": {"_id": "$ai_analysis.predicted_department", "count": {"$sum": 1}}}
    ]
    dept_cursor = db.complaints.aggregate(dept_pipeline)
    dept_data = await dept_cursor.to_list(length=20)
    
    department_distribution = {
        item["_id"] if item["_id"] else "Unknown": item["count"]
        for item in dept_data
    }

    return {
        "total_complaints": total_complaints,
        "resolved_complaints": resolved_complaints,
        "pending_complaints": pending_complaints,
        "priority_distribution": priority_distribution,
        "department_distribution": department_distribution
    }
