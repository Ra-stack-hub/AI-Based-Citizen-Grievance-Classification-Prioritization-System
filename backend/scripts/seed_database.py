import asyncio
import os
import sys
import pandas as pd
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
from bson import ObjectId

# Ensure we can import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database.connection import db, connect_to_mongo, close_mongo_connection, get_database
from app.models.complaint import ComplaintInDB, Location, ComplaintStatus, PriorityLevel

async def main():
    print("Starting database seed process...")
    await connect_to_mongo()
    
    database = get_database()
    complaints_collection = database["complaints"]
    users_collection = database["users"]
    
    # 1. Clear existing complaints to avoid duplicates
    print("Clearing existing complaints...")
    await complaints_collection.delete_many({})
    
    # 2. Ensure a dummy citizen exists
    dummy_email = "testcitizen@example.com"
    dummy_user = await users_collection.find_one({"email": dummy_email})
    
    if not dummy_user:
        print("Creating dummy citizen user...")
        dummy_citizen = {
            "email": dummy_email,
            "full_name": "Test Citizen",
            "role": "citizen",
            "is_active": True,
            "created_at": datetime.utcnow()
        }
        result = await users_collection.insert_one(dummy_citizen)
        citizen_id = result.inserted_id
    else:
        citizen_id = dummy_user["_id"]
        
    print(f"Using citizen ID: {citizen_id}")

    # 3. Load the dataset
    data_path = os.path.join("datasets", "raw", "grievances_synthetic.csv")
    if not os.path.exists(data_path):
        print(f"Error: Dataset not found at {data_path}")
        await close_mongo_connection()
        return
        
    df = pd.read_csv(data_path)
    # Drop NAs
    df = df.dropna(subset=['text', 'category'])
    
    print(f"Preparing to insert {len(df)} complaints...")
    
    complaints_to_insert = []
    
    for idx, row in df.iterrows():
        text = row['text']
        category = row['category']
        
        # Generate a short title from the text
        title = text[:50] + "..." if len(text) > 50 else text
        
        complaint = ComplaintInDB(
            title=title,
            description=text,
            department=category,
            category=category,
            location=Location(latitude=21.2514, longitude=81.6296, address="Chhattisgarh, India"),
            citizen_id=str(citizen_id),
            status=ComplaintStatus.PENDING,
        )
        # convert to dict for motor
        complaint_dict = complaint.model_dump(by_alias=True, exclude_none=True)
        complaints_to_insert.append(complaint_dict)
        
    # 4. Insert in chunks
    chunk_size = 500
    for i in range(0, len(complaints_to_insert), chunk_size):
        chunk = complaints_to_insert[i:i + chunk_size]
        await complaints_collection.insert_many(chunk)
        print(f"Inserted {len(chunk)} complaints... (Total: {min(i + chunk_size, len(complaints_to_insert))}/{len(complaints_to_insert)})")
        
    print("Database seed complete!")
    await close_mongo_connection()

if __name__ == "__main__":
    asyncio.run(main())
