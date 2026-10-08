import asyncio
from app.config import settings
from app.database.connection import connect_to_mongo, get_database, close_mongo_connection

async def main():
    await connect_to_mongo()
    db = get_database()
    print('DB Name:', db.name)
    count = await db.complaints.count_documents({})
    print('Count:', count)
    await close_mongo_connection()

if __name__ == "__main__":
    asyncio.run(main())
