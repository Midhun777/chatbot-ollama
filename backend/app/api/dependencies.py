from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database import models
from app.core.security import SECRET_KEY, ALGORITHM, oauth2_scheme

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    user = db.query(models.User).filter(models.User.id == int(user_id)).first()
    if user is None:
        raise credentials_exception
    return user

def get_current_user_optional(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """Attempt to get current user, but return None if not authenticated."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            return None
        return db.query(models.User).filter(models.User.id == int(user_id)).first()
    except:
        return None

def get_current_active_admin(current_user: models.User = Depends(get_current_user)):
    if current_user.role != models.UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not enough privileges")
    return current_user

def get_current_student(current_user: models.User = Depends(get_current_user)):
    if current_user.role != models.UserRole.STUDENT:
        raise HTTPException(status_code=403, detail="Not enough privileges")
    return current_user

def get_current_faculty(current_user: models.User = Depends(get_current_user)):
    if current_user.role != models.UserRole.FACULTY:
        raise HTTPException(status_code=403, detail="Not enough privileges")
    if current_user.status != "active":
        raise HTTPException(status_code=403, detail="Account pending approval")
    return current_user

def get_current_admin_or_faculty(current_user: models.User = Depends(get_current_user)):
    if current_user.role not in [models.UserRole.ADMIN, models.UserRole.FACULTY]:
        raise HTTPException(status_code=403, detail="Not enough privileges, requires admin or faculty role")
    if current_user.status != "active":
        raise HTTPException(status_code=403, detail="Account pending approval")
    return current_user
