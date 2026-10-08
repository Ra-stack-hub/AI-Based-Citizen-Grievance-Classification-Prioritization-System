from fastapi import APIRouter, Depends
from app.services.dashboard_service import get_dashboard_stats
from app.api.deps import get_current_active_user

router = APIRouter()

@router.get("/stats")
async def get_stats(current_user = Depends(get_current_active_user)):
    # You could optionally restrict this to admins:
    # if current_user.role != "admin": raise HTTPException(...)
    stats = await get_dashboard_stats()
    return stats
