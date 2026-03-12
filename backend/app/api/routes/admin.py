from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database.connection import get_db
from app.database import models
from app.schemas import schemas
from app.api.dependencies import get_current_active_admin
from app.core.security import get_password_hash

router = APIRouter()

@router.get("/users", response_model=List[schemas.UserBase])
def get_all_users(
    skip: int = 0, limit: int = 100, 
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_active_admin)
):
    users = db.query(models.User).offset(skip).limit(limit).all()
    return users

@router.post("/users/student", response_model=schemas.UserBase)
def create_student_user(
    user: schemas.UserCreate, 
    profile: schemas.StudentProfileCreate,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_active_admin)
):
    # Create Base User
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    new_user = models.User(email=user.email, password_hash=hashed_password, role=models.UserRole.STUDENT)
    db.add(new_user)
    db.flush() # Get user ID
    
    # Create Profile
    student_profile = models.Student(
        user_id=new_user.id,
        **profile.dict()
    )
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
    new_user = models.User(email=user.email, password_hash=hashed_password, role=models.UserRole.FACULTY)
    db.add(new_user)
    db.flush()
    
    faculty_profile = models.Faculty(
        user_id=new_user.id,
        **profile.dict()
    )
    db.add(faculty_profile)
    db.commit()
    db.refresh(new_user)
    return new_user
