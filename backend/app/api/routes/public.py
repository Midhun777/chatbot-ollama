from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database.connection import get_db
from app.database import models
from app.schemas import schemas

router = APIRouter()

@router.get("/courses", response_model=List[schemas.PublicCourseResponse])
def get_public_courses(db: Session = Depends(get_db)):
    """Fetch all courses along with the faculty name."""
    courses = db.query(models.Course).all()
    
    result = []
    for c in courses:
        faculty_name = "TBA"
        if c.faculty:
            faculty_name = f"{c.faculty.first_name} {c.faculty.last_name}"
        
        result.append({
            "id": c.id,
            "course_code": c.course_code,
            "course_name": c.course_name,
            "department": c.department,
            "credits": c.credits,
            "faculty_name": faculty_name
        })
        
    return result
