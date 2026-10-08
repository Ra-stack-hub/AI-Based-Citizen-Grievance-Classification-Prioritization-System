import asyncio
from datetime import datetime
from app.database.connection import connect_to_mongo, get_database, close_mongo_connection
from bson import ObjectId

async def main():
    await connect_to_mongo()
    db = get_database()
    
    complaint = {
        "title": "Severe Pothole on Main Street",
        "description": "There is a massive pothole that is damaging cars.",
        "location": {"latitude": 40.7128, "longitude": -74.0060, "address": "123 Main St"},
        "citizen_id": ObjectId(),
        "status": "pending",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "reporter_count": 1,
        "ai_analysis": {
            "predicted_department": "Roads",
            "predicted_priority": "high",
            "keywords": ["pothole", "damage"],
            "is_duplicate": False,
            "is_fake_image": False,
            "image_authenticity_score": 1.0,
            "is_spam": False,
            "spam_score": 0.0
        }
    }
    
    result = await db.complaints.insert_one(complaint)
    print("Inserted complaint:", result.inserted_id)
    
    await close_mongo_connection()

if __name__ == "__main__":
    asyncio.run(main())
