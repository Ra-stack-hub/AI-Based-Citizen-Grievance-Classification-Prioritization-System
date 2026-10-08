from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def get_departments():
    # Hardcoded for now, could be fetched from DB
    return [
        {"id": "water", "name": "Water Supply Department"},
        {"id": "electricity", "name": "Electricity Department"},
        {"id": "sanitation", "name": "Sanitation Department"},
        {"id": "public_safety", "name": "Public Safety Department"},
        {"id": "health", "name": "Health Department"}
    ]
