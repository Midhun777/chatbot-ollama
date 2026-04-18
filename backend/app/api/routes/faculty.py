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

@router.get("/profile", response_model=schemas.FacultyProfileResponse)
def get_faculty_profile(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_faculty)
):
    faculty = db.query(models.Faculty).filter(models.Faculty.user_id == current_user.id).first()
    if not faculty:
        raise HTTPException(status_code=404, detail="Faculty profile not found")
    return faculty

@router.patch("/profile", response_model=schemas.FacultyProfileResponse)
def update_faculty_profile(
    updates: schemas.FacultyProfileUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_faculty)
):
    faculty = db.query(models.Faculty).filter(models.Faculty.user_id == current_user.id).first()
    if not faculty:
        raise HTTPException(status_code=404, detail="Faculty profile not found")

    update_data = updates.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(faculty, field, value)

    db.commit()
    db.refresh(faculty)
    return faculty

