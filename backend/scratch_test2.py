from app.database.connection import get_database, connect_to_mongo
import asyncio

async def test():
    await connect_to_mongo()
    db = get_database()
    doc = await db.complaints.find_one()
    print(doc)

if __name__ == "__main__":
    asyncio.run(test())
