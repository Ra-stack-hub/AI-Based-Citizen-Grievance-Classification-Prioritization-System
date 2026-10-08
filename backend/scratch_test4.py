from app.database.connection import get_database, connect_to_mongo
import asyncio

async def test():
    await connect_to_mongo()
    db = get_database()
    user = await db.users.find_one({'email': 'admin@smartcity.gov'})
    print(user)

if __name__ == "__main__":
    asyncio.run(test())
