from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.complaints import router as complaints_router
from app.api.v1.chat import router as chat_router
from app.api.v1.dashboard import router as dashboard_router
from app.api.v1.analytics import router as analytics_router
from app.api.v1.departments import router as departments_router

api_router = APIRouter()
api_router.include_router(auth_router, prefix="/auth", tags=["auth"])
api_router.include_router(complaints_router, prefix="/complaints", tags=["complaints"])
api_router.include_router(chat_router, prefix="/chat", tags=["chat"])
api_router.include_router(dashboard_router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(analytics_router, prefix="/analytics", tags=["analytics"])
api_router.include_router(departments_router, prefix="/departments", tags=["departments"])
