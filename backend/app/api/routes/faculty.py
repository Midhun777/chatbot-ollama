from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List
import os
import shutil
from app.database.connection import get_db
from app.database import models
from app.schemas import schemas
from app.api.dependencies import get_current_faculty
from datetime import datetime

router = APIRouter()

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data", "uploads", "materials")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get("/courses", response_model=List[schemas.CourseResponse])
def get_faculty_courses(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_faculty)
):
    faculty = db.query(models.Faculty).filter(models.Faculty.user_id == current_user.id).first()
    if not faculty:
        raise HTTPException(status_code=404, detail="Faculty profile not found")
    
    courses = db.query(models.Course).filter(models.Course.faculty_id == faculty.id).all()
    return courses

@router.get("/courses/{course_id}/students", response_model=List[schemas.StudentProfileResponse])
def get_students_for_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_faculty)
):
    faculty = db.query(models.Faculty).filter(models.Faculty.user_id == current_user.id).first()
    course = db.query(models.Course).filter(models.Course.id == course_id, models.Course.faculty_id == faculty.id).first()
    
    if not course:
        raise HTTPException(status_code=404, detail="Course not found or not assigned to you")
    
    # Returning all students in the same department for this mock app
    students = db.query(models.Student).filter(models.Student.department == course.department).all()
    return students

@router.post("/attendance", status_code=status.HTTP_201_CREATED)
def mark_attendance(
    attendance_data: schemas.AttendanceCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_faculty)
):
    faculty = db.query(models.Faculty).filter(models.Faculty.user_id == current_user.id).first()
    if not faculty:
        raise HTTPException(status_code=404, detail="Faculty profile not found")

    course = db.query(models.Course).filter(models.Course.id == attendance_data.course_id, models.Course.faculty_id == faculty.id).first()
    if not course:
        raise HTTPException(status_code=403, detail="Not authorized for this course")

    try:
        parsed_date = datetime.strptime(attendance_data.date, "%Y-%m-%d")
    except ValueError:
        parsed_date = datetime.utcnow()

    # Check if entry already exists to update it instead
    existing = db.query(models.Attendance).filter(
        models.Attendance.student_id == attendance_data.student_id,
        models.Attendance.course_id == attendance_data.course_id,
        models.Attendance.date == parsed_date
    ).first()
    
    if existing:
        existing.status = attendance_data.status
        db.commit()
        db.refresh(existing)
        return existing

    new_attendance = models.Attendance(
        student_id=attendance_data.student_id,
        course_id=attendance_data.course_id,
        date=parsed_date,
        status=attendance_data.status
    )
    db.add(new_attendance)
    db.commit()
    db.refresh(new_attendance)
    return new_attendance

@router.post("/marks", status_code=status.HTTP_201_CREATED)
def upload_marks(
    mark_data: schemas.MarkCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_faculty)
):
    faculty = db.query(models.Faculty).filter(models.Faculty.user_id == current_user.id).first()
    if not faculty:
        raise HTTPException(status_code=404, detail="Faculty profile not found")

    course = db.query(models.Course).filter(models.Course.id == mark_data.course_id, models.Course.faculty_id == faculty.id).first()
    if not course:
        raise HTTPException(status_code=403, detail="Not authorized for this course")

    # Check if marks already exist to update
    existing = db.query(models.Mark).filter(
        models.Mark.student_id == mark_data.student_id,
        models.Mark.course_id == mark_data.course_id,
        models.Mark.exam_type == mark_data.exam_type
    ).first()

    if existing:
        existing.marks_obtained = mark_data.marks_obtained
        existing.total_marks = mark_data.total_marks
        db.commit()
        db.refresh(existing)
        return existing

    new_mark = models.Mark(
        student_id=mark_data.student_id, 
        course_id=mark_data.course_id,
        exam_type=mark_data.exam_type,
        marks_obtained=mark_data.marks_obtained,
        total_marks=mark_data.total_marks
    )
    db.add(new_mark)
    db.commit()
    db.refresh(new_mark)
    return new_mark

@router.post("/materials", response_model=schemas.DocumentFormResponse)
def upload_material(
    title: str = Form(...),
    description: str = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_faculty)
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
        uploaded_by=current_user.id
    )
    db.add(db_form)
    db.commit()
    db.refresh(db_form)
    return db_form
