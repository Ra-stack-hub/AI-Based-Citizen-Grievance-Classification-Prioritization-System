from fastapi import APIRouter, Depends, HTTPException
from typing import Optional, Dict, Any, List
from pydantic import BaseModel
from app.api.deps import get_current_active_user
from app.models.user import UserInDB

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None

class ChatAction(BaseModel):
    label: str
    type: str
    payload: Optional[Any] = None

class ChatResponse(BaseModel):
    message: str
    intent: str
    conversation_id: str
    actions: List[ChatAction] = []
    next_action: Optional[str] = None
    is_card: bool = False
    card_data: Optional[Dict[str, Any]] = None

from app.services.agent_service import execute_agent_step

@router.post("/message", response_model=ChatResponse)
async def chat_message(
    request: ChatRequest,
    current_user: UserInDB = Depends(get_current_active_user)
):
    conv_id = request.conversation_id or f"conv_{current_user.id}"
    
    # Execute agentic workflow
    agent_resp = await execute_agent_step(request.message, conv_id, str(current_user.id))
    
    # Map back to API response format
    actions = [
        ChatAction(label=a["label"], type=a["type"], payload=a.get("payload")) 
        for a in agent_resp.actions
    ]
    
    return ChatResponse(
        message=agent_resp.message,
        intent=agent_resp.intent,
        conversation_id=conv_id,
        actions=actions,
        is_card=agent_resp.is_card,
        card_data=agent_resp.card_data
    )

import httpx

class CitizenChatRequest(BaseModel):
    message: str

@router.post("/citizen")
async def citizen_chat(request: CitizenChatRequest):
    # System prompt for Citizen Chatbot
    system_prompt = """You are GrievAI AI, a helpful virtual assistant for citizens of the smart city.
Your job is to help citizens file complaints, track their grievances, and understand city rules.
Be concise, polite, and practical. Keep responses under 3 sentences if possible."""

    prompt = f"{system_prompt}\n\nCitizen: {request.message}\nAI:"
    
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(
                "http://localhost:11434/api/generate",
                json={
                    "model": "qwen2.5:1.5b", # Using an available small model
                    "prompt": prompt,
                    "stream": False
                }
            )
            response.raise_for_status()
            data = response.json()
            return {"reply": data.get("response", "I'm sorry, I couldn't understand that.")}
    except Exception as e:
        return {"reply": "Sorry, my AI brain (Ollama) is currently offline or unreachable. Please try again later."}

class AdminChatRequest(BaseModel):
    message: str

@router.post("/admin")
async def admin_chat(request: AdminChatRequest):
    # System prompt for Admin Chatbot
    system_prompt = """You are GrievAI Admin AI, an executive assistant for city administrators and ward officers.
Your role is to help analyze complaint trends, provide operational insights, manage departmental workflows, and summarize civic issues.
Maintain a professional, analytical, and data-oriented tone. Keep responses concise and structured."""

    prompt = f"{system_prompt}\n\nAdmin: {request.message}\nAI:"
    
    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.post(
                "http://localhost:11434/api/generate",
                json={
                    "model": "qwen2.5:3b", # A slightly larger model for better analytical responses
                    "prompt": prompt,
                    "stream": False
                }
            )
            response.raise_for_status()
            data = response.json()
            return {"reply": data.get("response", "I'm sorry, I couldn't process the request.")}
    except Exception as e:
        return {"reply": "Sorry, the Admin AI module is currently unreachable. Please check the local model service."}
