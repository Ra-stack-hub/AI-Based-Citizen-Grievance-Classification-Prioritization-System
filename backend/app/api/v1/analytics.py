from fastapi import APIRouter, Depends
from app.services.analytics_service import get_analytics_data, get_hotspots
from app.api.deps import get_current_active_user

router = APIRouter()

@router.get("/data")
async def get_analytics(current_user = Depends(get_current_active_user)):
    data = await get_analytics_data()
    return data

@router.get("/hotspots")
async def get_hotspots_route(current_user = Depends(get_current_active_user)):
    data = await get_hotspots()
    return data
