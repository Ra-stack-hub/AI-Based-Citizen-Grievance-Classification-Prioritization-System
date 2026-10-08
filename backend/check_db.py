import asyncio
from app.database.connection import get_database, connect_to_mongo

async def test():
    await connect_to_mongo()
    db = get_database()
    
    print("Users:")
    async for u in db.users.find():
        print(f" - {u.get('email')} : {u.get('_id')}")
        
    print("\nComplaints:")
    async for c in db.complaints.find():
        print(f" - ID: {c.get('_id')}, Citizen: {c.get('citizen_id')}, Title: {c.get('title')}")

if __name__ == '__main__':
    asyncio.run(test())
