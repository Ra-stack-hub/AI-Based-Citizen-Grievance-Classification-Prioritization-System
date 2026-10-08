from app.database.connection import get_database, connect_to_mongo
import asyncio

async def test():
    await connect_to_mongo()
    db = get_database()
    docs = await db.complaints.find().sort('created_at', -1).limit(3).to_list(3)
    for doc in docs:
        print("Doc:", doc.get("title"), "| AI Analysis:", doc.get("ai_analysis"))

if __name__ == "__main__":
    asyncio.run(test())
