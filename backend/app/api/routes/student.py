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

    # Calculate attendance percentage
    attendances = db.query(models.Attendance).filter(models.Attendance.student_id == student.id).all()
    total = len(attendances)
    present = sum(1 for a in attendances if a.status == "Present")
    attendance_pct = round((present / total * 100), 1) if total > 0 else 0

    return {
        "profile": {
            "name": f"{student.first_name} {student.last_name}",
            "enrollment_no": student.enrollment_no,
            "semester": student.current_semester,
            "attendance_pct": attendance_pct,
            "cgpa": student.cgpa or 0.0,
            "department": student.department,
            "phone": student.phone,
            "profile_bio": student.profile_bio or "",
        },
        "total_courses": len(set(a.course_id for a in attendances))
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
    return student

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

