from app.database.connection import get_database, connect_to_mongo
import asyncio
from app.ml.duplicates import duplicate_service

async def test_duplicate():
    await connect_to_mongo()
    db = get_database()
    recent = await db.complaints.find({}).limit(5).to_list(5)
    
    if not recent:
        print("No complaints in DB.")
        return
        
    print(f"Found {len(recent)} complaints.")
    texts = [c["title"] + " " + c["description"] for c in recent]
    
    new_text = texts[0]
    print("Testing with:", new_text)
    
    new_emb = duplicate_service.get_embedding(new_text)
    exist_emb = duplicate_service.model.encode(texts, convert_to_tensor=True)
    
    is_dup, idx = duplicate_service.is_duplicate(new_emb, exist_emb)
    print("Is Dup?", is_dup, "Index:", idx)

if __name__ == "__main__":
    asyncio.run(test_duplicate())
