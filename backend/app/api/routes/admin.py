from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
import os
import shutil
from app.database.connection import get_db
from app.database import models
from app.schemas import schemas
from app.api.dependencies import get_current_active_admin
from app.core.security import get_password_hash
from datetime import datetime

router = APIRouter()

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data", "uploads", "forms")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# ─── STATS ───────────────────────────────────────────────────────────────────

@router.get("/stats")
def get_admin_stats(
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_active_admin)
):
    total_users      = db.query(models.User).count()
    total_students   = db.query(models.User).filter(models.User.role == "student").count()
    total_faculty    = db.query(models.User).filter(models.User.role == "faculty").count()
    total_ann        = db.query(models.Announcement).count()
    total_forms      = db.query(models.DocumentForm).count()
    total_chats      = db.query(models.ChatMessage).count()
    return {
        "total_users": total_users,
        "total_students": total_students,
        "total_faculty": total_faculty,
        "total_announcements": total_ann,
        "total_forms": total_forms,
        "total_chat_queries": total_chats,
    }

# ─── USERS ───────────────────────────────────────────────────────────────────

@router.get("/users")
def get_all_users(
    skip: int = 0, limit: int = 100,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_active_admin)
):
    users = db.query(models.User).offset(skip).limit(limit).all()
    result = []
    for u in users:
        result.append({
            "id": u.id,
            "email": u.email,
            "role": u.role,
            "status": u.status,
            "created_at": u.created_at,
        })
    return result

@router.patch("/users/{user_id}/approve")
def approve_faculty(
    user_id: int,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_active_admin)
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.role != "faculty":
        raise HTTPException(status_code=400, detail="User is not a faculty member")
    user.status = "active"
    db.commit()
    return {"message": "Faculty approved and activated"}

@router.patch("/users/{user_id}/status")
def update_user_status(
    user_id: int,
    update: schemas.UserStatusUpdate,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_active_admin)
):
    if user_id == admin_user.id:
        raise HTTPException(status_code=400, detail="Cannot change your own status")
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if update.status not in ["active", "pending", "banned"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    user.status = update.status
    db.commit()
    return {"message": f"Status updated to {update.status}"}

@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_active_admin)
):
    if user_id == admin_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}

@router.patch("/users/{user_id}/role")
def change_user_role(
    user_id: int,
    update: schemas.UserRoleUpdate,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_active_admin)
):
    if user_id == admin_user.id:
        raise HTTPException(status_code=400, detail="Cannot change your own role")
    if update.role not in ["student", "faculty", "admin"]:
        raise HTTPException(status_code=400, detail="Invalid role")
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.role = update.role
    db.commit()
    return {"message": f"Role updated to {update.role}"}

# ─── STUDENTS ────────────────────────────────────────────────────────────────

@router.get("/students")
def get_all_students(
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_active_admin)
):
    students = db.query(models.Student).all()
    result = []
    for s in students:
        user = db.query(models.User).filter(models.User.id == s.user_id).first()
        # Attendance
        att_pct = 0
        result.append({
            "id": s.id,
            "user_id": s.user_id,
            "email": user.email if user else "",
            "enrollment_no": s.enrollment_no,
            "first_name": s.first_name,
            "last_name": s.last_name,
            "department": s.department,
            "current_semester": s.current_semester,
            "phone": s.phone or "",
            "cgpa": 0.0,
            "attendance_pct": att_pct,
            "profile_bio": s.profile_bio or "",
        })
    return result

# ─── FACULTY ─────────────────────────────────────────────────────────────────

@router.get("/faculty")
def get_all_faculty(
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_active_admin)
):
    faculty_list = db.query(models.Faculty).all()
    result = []
    for f in faculty_list:
        user = db.query(models.User).filter(models.User.id == f.user_id).first()
        result.append({
            "id": f.id,
            "user_id": f.user_id,
            "email": user.email if user else "",
            "employee_id": f.employee_id,
            "first_name": f.first_name,
            "last_name": f.last_name,
            "department": f.department,
            "designation": f.designation,
        })
    return result

# ─── CREATE USERS ─────────────────────────────────────────────────────────────

@router.post("/users/student", response_model=schemas.UserBase)
def create_student_user(
    user: schemas.UserCreate,
    profile: schemas.StudentProfileCreate,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_active_admin)
):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = get_password_hash(user.password)
    new_user = models.User(email=user.email, password_hash=hashed_password, role="student")
    db.add(new_user)
    db.flush()
    student_profile = models.Student(user_id=new_user.id, **profile.dict())
    db.add(student_profile)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/users/faculty", response_model=schemas.UserBase)
def create_faculty_user(
    user: schemas.UserCreate,
    profile: schemas.FacultyProfileCreate,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_active_admin)
):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = get_password_hash(user.password)
    new_user = models.User(email=user.email, password_hash=hashed_password, role="faculty")
    db.add(new_user)
    db.flush()
    faculty_profile = models.Faculty(user_id=new_user.id, **profile.dict())
    db.add(faculty_profile)
    db.commit()
    db.refresh(new_user)
    return new_user

# ─── FORMS ───────────────────────────────────────────────────────────────────

@router.post("/forms/upload", response_model=schemas.DocumentFormResponse)
def upload_form(
    title: str = Form(...),
    description: str = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_active_admin)
):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    file_location = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_location, "wb+") as file_object:
        shutil.copyfileobj(file.file, file_object)
    db_form = models.DocumentForm(
        title=title,
        description=description,
        file_path=file_location,
        uploaded_by=admin_user.id
    )
    db.add(db_form)
    db.commit()
    db.refresh(db_form)
    return db_form

@router.get("/forms", response_model=List[schemas.DocumentFormResponse])
def get_forms(
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_active_admin)
):
    return db.query(models.DocumentForm).order_by(models.DocumentForm.created_at.desc()).all()

@router.delete("/forms/{form_id}")
def delete_form(
    form_id: int,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_active_admin)
):
    form = db.query(models.DocumentForm).filter(models.DocumentForm.id == form_id).first()
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    # Delete the actual file too
    if os.path.exists(form.file_path):
        os.remove(form.file_path)
    db.delete(form)
    db.commit()
    return {"message": "Form deleted"}

# ─── TIMETABLE ───────────────────────────────────────────────────────────────

@router.get("/timetable")
def get_all_timetable(
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_active_admin)
):
    return db.query(models.Timetable).order_by(models.Timetable.department, models.Timetable.semester, models.Timetable.day_of_week, models.Timetable.time_slot).all()

@router.post("/timetable")
def create_timetable_entry(
    entry: schemas.TimetableCreate,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_active_admin)
):
    tt = models.Timetable(**entry.dict())
    db.add(tt)
    db.commit()
    db.refresh(tt)
    return tt

@router.delete("/timetable/{entry_id}")
def delete_timetable_entry(
    entry_id: int,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_active_admin)
):
    entry = db.query(models.Timetable).filter(models.Timetable.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    db.delete(entry)
    db.commit()
    return {"message": "Deleted"}

# ─── CHAT LOGS ───────────────────────────────────────────────────────────────

@router.get("/chat-logs")
def get_all_chat_logs(
    skip: int = 0, limit: int = 200,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_active_admin)
):
    messages = db.query(models.ChatMessage).order_by(models.ChatMessage.timestamp.desc()).offset(skip).limit(limit).all()
    result = []
    for m in messages:
        user = db.query(models.User).filter(models.User.id == m.user_id).first()
        result.append({
            "id": m.id,
            "user_email": user.email if user else "unknown",
            "query": m.query,
            "answer": m.answer,
            "source": m.source,
            "timestamp": m.timestamp,
        })
    return result
