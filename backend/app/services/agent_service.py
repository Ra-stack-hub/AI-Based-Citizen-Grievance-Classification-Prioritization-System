from typing import Dict, Any, List, Optional
from app.services.intent_service import intent_service
from app.services.tools import analyze_complaint_tool, get_user_complaints_tool, get_complaint_status_tool
from app.services.rag_service import rag_service
from pydantic import BaseModel
import re

# In-memory session state for Agentic workflow prototyping
# { "conversation_id": { "state": "INIT", "data": {} } }
SESSION_STORE: Dict[str, Dict[str, Any]] = {}

class AgentResponse(BaseModel):
    message: str
    intent: str
    actions: List[Dict[str, Any]] = []
    is_card: bool = False
    card_data: Optional[Dict[str, Any]] = None

async def execute_agent_step(message: str, conversation_id: str, user_id: str) -> AgentResponse:
    if conversation_id not in SESSION_STORE:
        SESSION_STORE[conversation_id] = {"state": "INIT", "data": {}}
        
    session = SESSION_STORE[conversation_id]
    state = session["state"]
    
    # 1. If we are in the middle of a workflow, handle it
    if state == "AWAITING_LOCATION":
        session["data"]["location"] = message
        session["state"] = "AWAITING_EVIDENCE"
        return AgentResponse(
            message="Thank you. Would you like to upload a photo of the issue? You can attach one or say 'No'.",
            intent="FILE_COMPLAINT",
            actions=[
                {"label": "📷 Upload Photo", "type": "UPLOAD_IMAGE", "payload": "upload"},
                {"label": "Skip", "type": "TEXT_REPLY", "payload": "No photo"}
            ]
        )
        
    if state == "AWAITING_EVIDENCE":
        # Assume photo logic is handled, proceed to Analysis
        analysis_res = await analyze_complaint_tool(
            session["data"].get("description", message), 
            session["data"].get("description", message)
        )
        session["data"]["ai_analysis"] = analysis_res
        session["state"] = "AWAITING_CONFIRMATION"
        
        return AgentResponse(
            message="AI analysis is complete. Review the details below. Would you like to submit this complaint?",
            intent="FILE_COMPLAINT",
            is_card=True,
            card_data={
                "category": analysis_res.get("predicted_department", "Municipal Corporation"),
                "priority": analysis_res.get("predicted_priority", "Medium").upper(),
                "department": analysis_res.get("predicted_department", "Municipal Corporation"),
                "confidence": "92%",
                "similar_complaints": 3,
                "reason": f"Keywords detected: {', '.join(analysis_res.get('keywords', []))}"
            },
            actions=[
                {"label": "Submit Complaint", "type": "CONFIRM_SUBMISSION", "payload": session["data"]},
                {"label": "Cancel", "type": "TEXT_REPLY", "payload": "Cancel"}
            ]
        )

    if state == "AWAITING_CONFIRMATION":
        if "cancel" in message.lower() or "no" in message.lower():
            session["state"] = "INIT"
            session["data"] = {}
            return AgentResponse(
                message="Complaint submission cancelled. How else can I help you?",
                intent="GENERAL_HELP"
            )
        
        # In a full flow, the frontend actually does the API call to /api/v1/complaints
        # We just reset state here since frontend takes over for submission.
        session["state"] = "INIT"
        session["data"] = {}
        return AgentResponse(
            message="Please click the Submit button in the chat or on the form to proceed.",
            intent="FILE_COMPLAINT"
        )
        
    if state == "AWAITING_TICKET_ID":
        # Extract potential GRV- ticket
        match = re.search(r'([0-9a-fA-F]{24}|GRV-\d+)', message)
        if match:
            ticket_id = match.group(1)
            status_data = await get_complaint_status_tool(ticket_id)
            session["state"] = "INIT"
            if status_data:
                return AgentResponse(
                    message=f"Complaint found. Status: {status_data['status']}. Department: {status_data.get('ai_analysis', {}).get('predicted_department', 'N/A')}",
                    intent="TRACK_COMPLAINT"
                )
            else:
                return AgentResponse(
                    message="I couldn't find a complaint with that ID.",
                    intent="TRACK_COMPLAINT"
                )
        else:
            return AgentResponse(
                message="Please provide a valid complaint ID (e.g., GRV-1234 or a 24-character ID).",
                intent="TRACK_COMPLAINT"
            )

    # 2. If INIT, run intent detection
    intent = intent_service.detect_intent(message)
    
    if intent == "FILE_COMPLAINT":
        session["state"] = "AWAITING_LOCATION"
        session["data"]["description"] = message
        return AgentResponse(
            message="I can help you report it. Please share the location of the issue.",
            intent=intent,
            actions=[
                {"label": "📍 Share Current Location", "type": "SHARE_LOCATION", "payload": "current"}
            ]
        )
        
    elif intent == "TRACK_COMPLAINT":
        session["state"] = "AWAITING_TICKET_ID"
        return AgentResponse(
            message="Sure, I can track that for you. Please provide your complaint ID.",
            intent=intent
        )
        
    elif intent == "MY_COMPLAINTS":
        complaints = await get_user_complaints_tool(user_id)
        if not complaints:
            return AgentResponse(message="You have no registered complaints yet.", intent=intent)
            
        complaint_list = "\n".join([f"- {c.get('title')} ({c.get('status')})" for c in complaints[:5]])
        return AgentResponse(
            message=f"Here are your recent complaints:\n{complaint_list}",
            intent=intent
        )
        
    elif intent == "DEPARTMENT_HELP":
        return AgentResponse(
            message="GrievAI AI automatically routes your complaints. E.g., potholes go to Roads & Infrastructure, and garbage issues to Sanitation.",
            intent=intent
        )
        
    elif intent == "GENERAL_HELP":
        return AgentResponse(
            message="Hello! I am GrievAI AI. I can help you file a complaint, track an existing complaint, understand its priority, or answer grievance-related questions.",
            intent=intent,
            actions=[
                {"label": "File a Complaint", "type": "TEXT_REPLY", "payload": "I want to file a complaint"},
                {"label": "Track Complaint", "type": "TEXT_REPLY", "payload": "Track my complaint"},
                {"label": "My Complaints", "type": "TEXT_REPLY", "payload": "Show my complaints"}
            ]
        )
        
    elif intent == "CIVIC_INFORMATION_RAG":
        # 1. Trigger Advanced RAG (Hybrid Search + RRF)
        rag_response = rag_service.generate_response(message)
        
        # 2. Extract Data
        answer = rag_response.get("answer")
        source = rag_response.get("source")
        confidence = rag_response.get("confidence")
        
        if source:
            # Append Citation (Anti-Hallucination / Explainable AI)
            final_message = f"{answer}\n\n*Source: {source} (Confidence: {confidence})*"
        else:
            final_message = answer
            
        return AgentResponse(
            message=final_message,
            intent=intent,
            is_card=True if source else False,
            card_data={
                "title": rag_response.get("title", "Information"),
                "source": source,
                "confidence": confidence
            } if source else None
        )
        
    return AgentResponse(
        message="I'm not quite sure how to help with that. You can ask me to file a complaint or track an existing one.",
        intent="UNKNOWN"
    )
