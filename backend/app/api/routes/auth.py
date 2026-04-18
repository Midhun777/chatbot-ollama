from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database import models
from app.schemas import schemas
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.logging import log_system_activity
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
from app.core import security
from app.api.dependencies import get_current_user

router = APIRouter()

@router.get("/me", response_model=schemas.UserMeResponse)
def get_me(current_user: models.User = Depends(get_current_user)):
    """Returns the currently authenticated user's profile info."""
    return current_user

@router.post("/register", response_model=schemas.Token)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    print(f"DEBUG: Registration attempt for email: {user.email}")
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        print(f"DEBUG: Email {user.email} already registered")
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Removed ID and Role specific duplicate checks
    
    try:
        hashed_password = get_password_hash(user.password)
        new_user = models.User(
            email=user.email,
            password_hash=hashed_password,
            role=user.role if user.role in ["student", "faculty"] else "student",
            status="pending" if user.role == "faculty" else "active"
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        print(f"DEBUG: User {new_user.id} created")

        if new_user.role == "student":
            import uuid
            student_profile = models.Student(
                user_id=new_user.id,
                enrollment_no=f"STU-{uuid.uuid4().hex[:6].upper()}",
                first_name=user.first_name,
                last_name=user.last_name,
                department="Undeclared",
                current_semester=1,
                phone=""
            )
            db.add(student_profile)
        elif new_user.role == "faculty":
            import uuid
            faculty_profile = models.Faculty(
                user_id=new_user.id,
                employee_id=f"FAC-{uuid.uuid4().hex[:6].upper()}",
                first_name=user.first_name,
                last_name=user.last_name,
                department="Undeclared",
                designation="Assistant Professor"
            )
            db.add(faculty_profile)
        
        db.commit()
        log_system_activity(db, new_user.id, "User Registered", f"Role: {new_user.role}, Status: {new_user.status}")
        print("DEBUG: Profile created successfully")
        
        access_token_expires = timedelta(minutes=security.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": str(new_user.id), "role": new_user.role, "status": new_user.status}, expires_delta=access_token_expires
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
    if user.status == "banned":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been banned. Please contact administration."
        )

    access_token_expires = timedelta(minutes=security.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id), "role": user.role, "status": user.status}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}
