from app.database.connection import get_database, connect_to_mongo
import asyncio

async def test():
    await connect_to_mongo()
    db = get_database()
    users = await db.users.find({'email': 'admin@smartcity.gov'}).to_list(100)
    for u in users:
        print(f"ID: {u.get('_id')}, Email: {u.get('email')}, Role: {u.get('role')}")

if __name__ == "__main__":
    asyncio.run(test())
