from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database.connection import get_db
from app.database import models
from app.schemas import schemas
from app.api.dependencies import get_current_student
from app.core.logging import log_system_activity

router = APIRouter()

@router.get("/dashboard")
def get_student_dashboard(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_student)
):
    student = db.query(models.Student).filter(models.Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
    return {
        "profile": {
            "name": f"{student.first_name} {student.last_name}",
            "enrollment_no": student.enrollment_no,
            "semester": student.current_semester,
            "department": student.department,
            "phone": student.phone,
            "profile_bio": student.profile_bio or "",
        },
        "total_courses": 0
    }

@router.get("/profile", response_model=schemas.StudentProfileResponse)
def get_student_profile(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_student)
):
    student = db.query(models.Student).filter(models.Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
    return student

@router.patch("/profile", response_model=schemas.StudentProfileResponse)
def update_student_profile(
    updates: schemas.StudentProfileUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_student)
):
    student = db.query(models.Student).filter(models.Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    update_data = updates.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(student, field, value)

    db.commit()
    db.refresh(student)
    log_system_activity(db, current_user.id, "Profile Update", f"Student: {current_user.email}")
    return student


