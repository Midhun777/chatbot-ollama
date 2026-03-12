from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
from app.database.connection import get_db
from app.database import models
from app.schemas import schemas
from app.api.dependencies import get_current_user
from ai_engine import rag_chain, intent

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    answer: str
    source: str # e.g., 'DATABASE' or 'RAG-LLM'

@router.post("/query", response_model=ChatResponse)
def handle_chat_query(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    user_query = request.message
    
    # 1. Determine Intent
    query_intent = intent.classify_intent(user_query)
    
    chat_resp = None
    
    # 2. Path A: Personal DB Inquiry
    if query_intent == "PERSONAL":
        student = db.query(models.Student).filter(models.Student.user_id == current_user.id).first()
        if not student:
            chat_resp = ChatResponse(
                answer="I can only fetch personal DB records for authenticated students.",
                source="DATABASE"
            )
        else:
            # Very stripped-down example response fetching mechanism based on keywords
            if "attendance" in user_query.lower():
                attendances = db.query(models.Attendance).filter(models.Attendance.student_id == student.id).all()
                ans = f"Hello {student.first_name}, you have {len(attendances)} attendance records on file."
                chat_resp = ChatResponse(answer=ans, source="DATABASE")
                
            elif "mark" in user_query.lower() or "grade" in user_query.lower():
                marks = db.query(models.Mark).filter(models.Mark.student_id == student.id).all()
                ans = f"Hello {student.first_name}, you have grades for {len(marks)} exams."
                chat_resp = ChatResponse(answer=ans, source="DATABASE")
                
            else:
                ans = f"Hello {student.first_name}, I routed you to your personal profile. Your enrollment number is {student.enrollment_no}."
                chat_resp = ChatResponse(answer=ans, source="DATABASE")

    # 3. Path B: RAG Query for Knowledge/Syllabus
    else:
        try:
            # Let Langchain process this through Chroma & local Ollama model
            ollama_answer = rag_chain.ask_question(user_query)
            chat_resp = ChatResponse(answer=ollama_answer, source="RAG-LLM")
            
        except Exception as e:
            # Basic fallback if LLM server is offline, without crashing API
            print(f"RAG Error: {e}")
            chat_resp = ChatResponse(
                answer="I'm sorry, my local AI engine is currently unreachable. Please ensure Ollama is running.",
                source="SYSTEM_ERROR"
            )

    # 4. Persistence: Save Message to DB
    if chat_resp:
        db_msg = models.ChatMessage(
            user_id=current_user.id,
            query=user_query,
            answer=chat_resp.answer,
            source=chat_resp.source
        )
        db.add(db_msg)
        db.commit()
    
    return chat_resp

@router.get("/history", response_model=List[schemas.ChatMessageResponse])
def get_chat_history(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    history = db.query(models.ChatMessage).filter(models.ChatMessage.user_id == current_user.id).order_by(models.ChatMessage.timestamp.asc()).all()
    return history
