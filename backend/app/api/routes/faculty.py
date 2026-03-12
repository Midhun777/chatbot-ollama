from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database.connection import get_db
from app.database import models
from app.schemas import schemas
from app.api.dependencies import get_current_faculty

router = APIRouter()

@router.post("/attendance", status_code=status.HTTP_201_CREATED)
def mark_attendance(
    attendance_data: schemas.AttendanceResponse, # Using response model for input ease in this mock
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_faculty)
):
    faculty = db.query(models.Faculty).filter(models.Faculty.user_id == current_user.id).first()
    if not faculty:
        raise HTTPException(status_code=404, detail="Faculty profile not found")

    course = db.query(models.Course).filter(models.Course.id == attendance_data.course_id, models.Course.faculty_id == faculty.id).first()
    if not course:
        raise HTTPException(status_code=403, detail="Not authorized for this course")

    new_attendance = models.Attendance(
        student_id=attendance_data.student_id, # Simplified
        course_id=attendance_data.course_id,
        date=attendance_data.date,
        status=attendance_data.status
    )
    db.add(new_attendance)
    db.commit()
    db.refresh(new_attendance)
    return new_attendance

@router.post("/marks", status_code=status.HTTP_201_CREATED)
def upload_marks(
    mark_data: schemas.MarkResponse, # Using response model for input ease in this mock
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_faculty)
):
    faculty = db.query(models.Faculty).filter(models.Faculty.user_id == current_user.id).first()
    if not faculty:
        raise HTTPException(status_code=404, detail="Faculty profile not found")

    new_mark = models.Mark(
        student_id=mark_data.student_id, # Simplified 
        course_id=mark_data.course.id,
        exam_type=mark_data.exam_type,
        marks_obtained=mark_data.marks_obtained,
        total_marks=mark_data.total_marks
    )
    db.add(new_mark)
    db.commit()
    db.refresh(new_mark)
    return new_mark
