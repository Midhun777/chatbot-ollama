from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database import models
from app.schemas import schemas
from app.core.security import verify_password, get_password_hash, create_access_token
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
from app.core import security

router = APIRouter()

@router.post("/register", response_model=schemas.Token)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    print(f"DEBUG: Registration attempt for email: {user.email}, role: {user.role}")
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        print(f"DEBUG: Email {user.email} already registered")
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Check for duplicate id_number based on role
    if user.role == models.UserRole.STUDENT:
        existing_student = db.query(models.Student).filter(models.Student.enrollment_no == user.id_number).first()
        if existing_student:
            print(f"DEBUG: Enrollment No {user.id_number} already registered")
            raise HTTPException(status_code=400, detail="Enrollment No already registered")
    elif user.role == models.UserRole.FACULTY:
        existing_faculty = db.query(models.Faculty).filter(models.Faculty.employee_id == user.id_number).first()
        if existing_faculty:
            print(f"DEBUG: Employee ID {user.id_number} already registered")
            raise HTTPException(status_code=400, detail="Employee ID already registered")
    
    try:
        hashed_password = get_password_hash(user.password)
        new_user = models.User(
            email=user.email,
            password_hash=hashed_password,
            role=user.role
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        print(f"DEBUG: User {new_user.id} created")

        # Create profile based on role
        if user.role == models.UserRole.STUDENT:
            student_profile = models.Student(
                user_id=new_user.id,
                enrollment_no=user.id_number,
                first_name=user.first_name,
                last_name=user.last_name,
                department=user.department,
                current_semester=1,
                phone=""
            )
            db.add(student_profile)
        elif user.role == models.UserRole.FACULTY:
            faculty_profile = models.Faculty(
                user_id=new_user.id,
                employee_id=user.id_number,
                first_name=user.first_name,
                last_name=user.last_name,
                department=user.department,
                designation="Lecturer"
            )
            db.add(faculty_profile)
        
        db.commit()
        print("DEBUG: Profile created successfully")
        
        access_token_expires = timedelta(minutes=security.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": str(new_user.id), "role": new_user.role}, expires_delta=access_token_expires
        )
        return {"access_token": access_token, "token_type": "bearer"}
    except Exception as e:
        print(f"DEBUG: Registration error: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=security.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id), "role": user.role}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}
