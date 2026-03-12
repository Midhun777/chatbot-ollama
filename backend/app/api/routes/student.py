from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database.connection import get_db
from app.database import models
from app.schemas import schemas
from app.api.dependencies import get_current_student

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
        "profile": student,
        "total_courses": len(student.attendances) # Simplified for now
    }

@router.get("/attendance", response_model=List[schemas.AttendanceResponse])
def get_my_attendance(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_student)
):
    student = db.query(models.Student).filter(models.Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
        
    attendance = db.query(models.Attendance).filter(models.Attendance.student_id == student.id).all()
    return attendance

@router.get("/marks", response_model=List[schemas.MarkResponse])
def get_my_marks(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_student)
):
    student = db.query(models.Student).filter(models.Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
        
    marks = db.query(models.Mark).filter(models.Mark.student_id == student.id).all()
    return marks
