from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, desc, func
from typing import List
from app.database.connection import get_db
from app.database import models
from app.schemas import schemas
from app.api.dependencies import get_current_user
from datetime import datetime

router = APIRouter()

@router.post("/", response_model=schemas.MessageResponse)
def send_message(
    message: schemas.MessageCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Send a direct message to another user."""
    # Verify receiver exists
    receiver = db.query(models.User).filter(models.User.id == message.receiver_id).first()
    if not receiver:
        raise HTTPException(status_code=404, detail="Receiver not found")

    db_message = models.DirectMessage(
        sender_id=current_user.id,
        receiver_id=message.receiver_id,
        content=message.content,
        timestamp=datetime.utcnow(),
        is_read=False
    )
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message

@router.get("/history/{other_user_id}", response_model=List[schemas.MessageResponse])
def get_chat_history(
    other_user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Retrieve the conversation history between current user and another user."""
    messages = db.query(models.DirectMessage).filter(
        or_(
            and_(models.DirectMessage.sender_id == current_user.id, models.DirectMessage.receiver_id == other_user_id),
            and_(models.DirectMessage.sender_id == other_user_id, models.DirectMessage.receiver_id == current_user.id)
        )
    ).order_by(models.DirectMessage.timestamp.asc()).all()

    # Mark received messages as read
    db.query(models.DirectMessage).filter(
        models.DirectMessage.sender_id == other_user_id,
        models.DirectMessage.receiver_id == current_user.id,
        models.DirectMessage.is_read == False
    ).update({"is_read": True})
    db.commit()

    return messages

@router.get("/conversations", response_model=List[schemas.ChatMember])
def get_conversations(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get list of users the current user has interacted with."""
    # Find all users who sent or received messages from current user
    interacted_user_ids = db.query(models.DirectMessage.sender_id).filter(models.DirectMessage.receiver_id == current_user.id).all()
    interacted_user_ids += db.query(models.DirectMessage.receiver_id).filter(models.DirectMessage.sender_id == current_user.id).all()
    
    unique_ids = list(set([uid[0] for uid in interacted_user_ids if uid[0] != current_user.id]))
    
    chat_members = []
    for uid in unique_ids:
        user = db.query(models.User).filter(models.User.id == uid).first()
        if not user: continue
        
        # Get details based on role
        name_info = {"first_name": "User", "last_name": str(uid)}
        if user.role == "student":
            s = db.query(models.Student).filter(models.Student.user_id == uid).first()
            if s: name_info = {"first_name": s.first_name, "last_name": s.last_name}
        elif user.role == "faculty":
            f = db.query(models.Faculty).filter(models.Faculty.user_id == uid).first()
            if f: name_info = {"first_name": f.first_name, "last_name": f.last_name}
        elif user.role == "admin":
             name_info = {"first_name": "Admin", "last_name": ""}

        # Get last message
        last_msg = db.query(models.DirectMessage).filter(
            or_(
                and_(models.DirectMessage.sender_id == current_user.id, models.DirectMessage.receiver_id == uid),
                and_(models.DirectMessage.sender_id == uid, models.DirectMessage.receiver_id == current_user.id)
            )
        ).order_by(models.DirectMessage.timestamp.desc()).first()

        unread_count = db.query(models.DirectMessage).filter(
            models.DirectMessage.sender_id == uid,
            models.DirectMessage.receiver_id == current_user.id,
            models.DirectMessage.is_read == False
        ).count()

        chat_members.append({
            "id": user.id,
            "email": user.email,
            "role": user.role,
            "first_name": name_info["first_name"],
            "last_name": name_info["last_name"],
            "last_message": last_msg.content if last_msg else None,
            "last_message_time": last_msg.timestamp if last_msg else None,
            "unread_count": unread_count
        })

    # Sort by last message time
    chat_members.sort(key=lambda x: x["last_message_time"] or datetime.min, reverse=True)
    return chat_members

@router.get("/contacts", response_model=List[schemas.ChatMember])
def get_contacts(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get list of possible contacts based on the user role."""
    contacts = []
    
    if current_user.role == "student":
        # Students can contact ALL Faculty
        faculty_list = db.query(models.Faculty).all()
        for f in faculty_list:
            u = db.query(models.User).filter(models.User.id == f.user_id).first()
            if u:
                contacts.append({
                    "id": u.id,
                    "email": u.email,
                    "role": u.role,
                    "first_name": f.first_name,
                    "last_name": f.last_name,
                    "unread_count": 0
                })
    elif current_user.role == "faculty":
        # Faculty can contact ALL Students (or limited by department, but keeping open for now)
        student_list = db.query(models.Student).all()
        for s in student_list:
            u = db.query(models.User).filter(models.User.id == s.user_id).first()
            if u:
                contacts.append({
                    "id": u.id,
                    "email": u.email,
                    "role": u.role,
                    "first_name": s.first_name,
                    "last_name": s.last_name,
                    "unread_count": 0
                })
    
    return contacts
