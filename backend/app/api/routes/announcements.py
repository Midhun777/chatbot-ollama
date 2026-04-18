from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database.connection import get_db
from app.database import models
from app.schemas import schemas
from app.api.dependencies import get_current_user, get_current_admin_or_faculty
from app.core.logging import log_system_activity

router = APIRouter()

@router.get("/", response_model=List[schemas.AnnouncementResponse])
def get_announcements(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get all announcements – pinned ones first, then newest."""
    announcements = (
        db.query(models.Announcement)
        .order_by(models.Announcement.is_pinned.desc(), models.Announcement.created_at.desc())
        .all()
    )
    return announcements

@router.post("/", response_model=schemas.AnnouncementResponse)
def create_announcement(
    announcement: schemas.AnnouncementCreate,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_admin_or_faculty)
):
    """Admin or Faculty: Create a new announcement."""
    db_announcement = models.Announcement(
        title=announcement.title,
        body=announcement.body,
        category=announcement.category,
        is_pinned=announcement.is_pinned,
        created_by=admin_user.id
    )
    db.add(db_announcement)
    db.commit()
    db.refresh(db_announcement)
    log_system_activity(db, admin_user.id, "Created Announcement", f"Title: {db_announcement.title}")
    return db_announcement

@router.delete("/{announcement_id}")
def delete_announcement(
    announcement_id: int,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_admin_or_faculty)
):
    """Admin or Faculty: Delete an announcement."""
    ann = db.query(models.Announcement).filter(models.Announcement.id == announcement_id).first()
    if not ann:
        raise HTTPException(status_code=404, detail="Announcement not found")
    title = ann.title
    db.delete(ann)
    db.commit()
    log_system_activity(db, admin_user.id, "Deleted Announcement", f"Title: {title}")
    return {"message": "Deleted successfully"}

@router.put("/{announcement_id}/toggle-pin", response_model=schemas.AnnouncementResponse)
def toggle_pin_announcement(
    announcement_id: int,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_admin_or_faculty)
):
    """Admin or Faculty: Toggle the pinned status of an announcement."""
    ann = db.query(models.Announcement).filter(models.Announcement.id == announcement_id).first()
    if not ann:
        raise HTTPException(status_code=404, detail="Announcement not found")
    
    ann.is_pinned = not ann.is_pinned
    db.commit()
    db.refresh(ann)
    action = "Pinned" if ann.is_pinned else "Unpinned"
    log_system_activity(db, admin_user.id, f"{action} Announcement", f"Title: {ann.title}")
    return ann
