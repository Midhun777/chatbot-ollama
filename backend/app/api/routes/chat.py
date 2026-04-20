from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
import os
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from app.database.connection import get_db
from app.database import models
from app.schemas import schemas
from app.api.dependencies import get_current_user, get_current_user_optional
from app.ai_engine import rag_chain, intent

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

class FormAttachment(BaseModel):
    form_id: int
    form_title: str
    description: Optional[str] = None
    download_url: str

class ChatResponse(BaseModel):
    answer: str
    source: str  # e.g., 'DATABASE', 'RAG-LLM', or 'FORMS'
    form: Optional[FormAttachment] = None

@router.get("/forms/download/{form_id}")
def download_form(
    form_id: int,
    db: Session = Depends(get_db)
):
    form = db.query(models.DocumentForm).filter(models.DocumentForm.id == form_id).first()
    if not form or not os.path.exists(form.file_path):
        raise HTTPException(status_code=404, detail="Form not found")
    
    return FileResponse(
        path=form.file_path, 
        filename=os.path.basename(form.file_path),
        media_type="application/pdf"
    )

# Keywords that map to specific form types for better matching
FORM_KEYWORDS = {
    "admission": ["admission", "admit", "enroll", "enrollment", "join", "entry"],
    "scholarship": ["scholarship", "financial aid", "merit", "stipend", "funding"],
    "leave": ["leave", "absence", "absent", "off", "vacation", "sick leave"],
    "bonafide": ["bonafide", "bona fide", "certificate", "verification", "proof"],
    "hostel": ["hostel", "accommodation", "dormitory", "dorm", "room", "stay", "housing"],
}

def find_matching_form(query: str, forms):
    """Find the best matching form for a user query."""
    lower_query = query.lower()
    
    # First pass: Check if query contains specific form-type keywords
    for form_type, keywords in FORM_KEYWORDS.items():
        if any(kw in lower_query for kw in keywords):
            # Find the form whose title matches this type
            for f in forms:
                if form_type in f.title.lower():
                    return f
    
    # Second pass: Match any word from form titles
    for f in forms:
        title_words = [w.lower() for w in f.title.split() if len(w) > 3]
        if any(word in lower_query for word in title_words):
            return f
    
    return None

@router.post("/query", response_model=ChatResponse)
def handle_chat_query(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_current_user_optional)
):
    user_query = request.message
    
    # 1. Determine Intent
    # Guests only have GENERAL intent
    query_intent = intent.classify_intent(user_query) if current_user else "GENERAL"
    
    chat_resp = None
    
    # Check if the query is asking for a form or document
    lower_query = user_query.lower()
    form_trigger_words = ["form", "application", "apply", "download", "send me", "give me", "need a", "get the"]
    if any(trigger in lower_query for trigger in form_trigger_words):
        forms = db.query(models.DocumentForm).all()
        matched_form = find_matching_form(user_query, forms)
        
        if matched_form:
            download_url = f"http://localhost:8000/api/chat/forms/download/{matched_form.id}"
            ans = (
                f"Here is the **{matched_form.title}** you requested! "
                f"Click the download button below to get your form.\n\n"
                f"_{matched_form.description}_"
            )
            form_attachment = FormAttachment(
                form_id=matched_form.id,
                form_title=matched_form.title,
                description=matched_form.description,
                download_url=download_url,
            )
            chat_resp = ChatResponse(answer=ans, source="FORMS", form=form_attachment)
        else:
            # No specific form matched — list all available forms
            if forms:
                form_list = "\n".join(
                    [f"• **{f.title}** — {f.description or 'No description'}" for f in forms]
                )
                ans = (
                    f"I couldn't find the exact form you're looking for, but here are all available forms:\n\n"
                    f"{form_list}\n\n"
                    f"Please specify which form you need (e.g., \"send me admission form\")."
                )
                chat_resp = ChatResponse(answer=ans, source="FORMS")

    # 2. Path A: Personal DB Inquiry
    if not chat_resp and query_intent == "PERSONAL":
        student = db.query(models.Student).filter(models.Student.user_id == current_user.id).first()
        if not student:
            chat_resp = ChatResponse(
                answer="I can only fetch personal DB records for authenticated students.",
                source="DATABASE"
            )
        else:
            # Very stripped-down example response fetching mechanism based on keywords
            if "attendance" in user_query.lower():
                ans = f"Hello {student.first_name}, you have 0 attendance records on file."
                chat_resp = ChatResponse(answer=ans, source="DATABASE")
                
            elif "mark" in user_query.lower() or "grade" in user_query.lower():
                ans = f"Hello {student.first_name}, you have grades for 0 exams."
                chat_resp = ChatResponse(answer=ans, source="DATABASE")
                
            else:
                ans = f"Hello {student.first_name}, I routed you to your personal profile. Your enrollment number is {student.enrollment_no}."
                chat_resp = ChatResponse(answer=ans, source="DATABASE")
    
    # 2.5 Path: Greetings (Skip RAG for simple chitchat)
    if not chat_resp and query_intent == "GREETING":
        greetings = [
            "Hello! How can I help you today?",
            "Hey there! Need help with your courses or timetable?",
            "Hi! I'm your EduSphere AI Assistant. What can I do for you?",
            "Good day! How can I assist you with your academic queries?"
        ]
        import random
        chat_resp = ChatResponse(answer=random.choice(greetings), source="GREETINGS")

    # 2.7 Path: Catalog Inquiry (Force accuracy from DB)
    if not chat_resp and query_intent == "CATALOG_INQUIRY":
        courses = db.query(models.Course).all()
        if not courses:
            ans = "Our course catalog is currently being updated. Please check back shortly for a full list of subjects!"
            chat_resp = ChatResponse(answer=ans, source="DATABASE")
        else:
            # Create a structured list for the LLM
            course_list = "\n".join([f"- {c.course_name} ({c.course_code}) in {c.department}" for c in courses])
            llm_prompt = (
                f"The student asked about the courses provided. Here is the 100% accurate list from our database:\n\n"
                f"{course_list}\n\n"
                "Please summarize this list politely and professionally for the student. Do NOT say 'based on the context'. Just give a helpful response."
            )
            try:
                # Use RAG chain's LLM but with our custom prompt to ensure accuracy
                ans = rag_chain.get_llm().invoke(llm_prompt)
                chat_resp = ChatResponse(answer=ans, source="DATABASE")
            except Exception:
                # Fallback to pure list if LLM fails
                ans = f"Here are the courses we offer:\n\n{course_list}"
                chat_resp = ChatResponse(answer=ans, source="DATABASE")

    # 2.8 Path: Faculty Inquiry (Force accuracy from DB)
    if not chat_resp and query_intent == "FACULTY_INQUIRY":
        faculty = db.query(models.Faculty).all()
        if not faculty:
            ans = "The faculty directory is currently being updated. Please check back shortly!"
            chat_resp = ChatResponse(answer=ans, source="DATABASE")
        else:
            # Create a structured list for the LLM
            fac_list = "\n".join([f"- Dr./Prof. {f.first_name} {f.last_name} ({f.designation} in {f.department})" for f in faculty[:15]]) # Limit to 15 for prompt size
            total_count = len(faculty)
            llm_prompt = (
                f"The student asked about the faculty members. We have a total of {total_count} faculty members. "
                f"Here is a sample of the most relevant ones from our database:\n\n"
                f"{fac_list}\n\n"
                f"Please tell the student that we have {total_count} faculty members across all departments and highlight a few. "
                "Be professional and encouraging."
            )
            try:
                ans = rag_chain.get_llm().invoke(llm_prompt)
                chat_resp = ChatResponse(answer=ans, source="DATABASE")
            except Exception:
                ans = f"We have {total_count} faculty members. Here are some of them:\n\n{fac_list}"
                chat_resp = ChatResponse(answer=ans, source="DATABASE")

    # 2.9 Path: Admission Inquiry (Force policy retrieval)
    if not chat_resp and query_intent == "ADMISSION_INQUIRY":
        # We use standard RAG but the new tags and k=10 will naturally find the policy.
        # We can also inject a hint to the LLM.
        try:
            # We call ask_question directly but with a more specific prompt if we wanted, 
            # however, the k=10 and the new "OFFICIAL ADMISSION POLICY" tag in db_ingest 
            # will make it very likely to be top of the list.
            ans = rag_chain.ask_question(query)
            chat_resp = ChatResponse(answer=ans, source="RAG-POLICY")
        except Exception:
            pass

    if not chat_resp:
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

    # 4. Persistence: Save Message to DB (Only if authenticated)
    if chat_resp and current_user:
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
