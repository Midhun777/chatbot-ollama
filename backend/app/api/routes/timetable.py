from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database.connection import get_db
from app.database import models
from app.schemas import schemas
from app.api.dependencies import get_current_student, get_current_active_admin, get_current_admin_or_faculty

router = APIRouter()

DAY_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

@router.get("/", response_model=List[schemas.TimetableEntry])
def get_my_timetable(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_student)
):
    """Returns the timetable for the current student's department & semester."""
    student = db.query(models.Student).filter(models.Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    entries = (
        db.query(models.Timetable)
        .filter(
            models.Timetable.department == student.department,
            models.Timetable.semester == student.current_semester
        )
        .all()
    )

    # Sort by day order then time slot
    entries.sort(key=lambda e: (
        DAY_ORDER.index(e.day_of_week) if e.day_of_week in DAY_ORDER else 99,
        e.time_slot
    ))
    return entries

@router.post("/", response_model=schemas.TimetableEntry)
def create_timetable_entry(
    entry: schemas.TimetableCreate,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_admin_or_faculty)
):
    """Admin or Faculty: Create a new timetable entry."""
    db_entry = models.Timetable(**entry.dict())
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry

@router.delete("/{entry_id}")
def delete_timetable_entry(
    entry_id: int,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_admin_or_faculty)
):
    """Admin or Faculty: Delete a timetable entry."""
    db_entry = db.query(models.Timetable).filter(models.Timetable.id == entry_id).first()
    if not db_entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    db.delete(db_entry)
    db.commit()
    return {"message": "Deleted successfully"}

@router.post("/seed")
def seed_timetable(
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(get_current_active_admin)
):
    """Admin: Seeds sample timetable data for CS department semester 1."""
    sample_data = [
        {"department": "Computer Science", "semester": 1, "day_of_week": "Monday", "time_slot": "09:00 - 10:00", "subject_name": "Programming Fundamentals", "subject_code": "CS101", "room": "Lab B1", "faculty_name": "Dr. Alice Kumar"},
        {"department": "Computer Science", "semester": 1, "day_of_week": "Monday", "time_slot": "10:00 - 11:00", "subject_name": "Mathematics I", "subject_code": "MA101", "room": "Room 204", "faculty_name": "Prof. Ramesh"},
        {"department": "Computer Science", "semester": 1, "day_of_week": "Monday", "time_slot": "11:00 - 12:00", "subject_name": "Digital Logic", "subject_code": "CS102", "room": "Room 101", "faculty_name": "Dr. Priya Nair"},
        {"department": "Computer Science", "semester": 1, "day_of_week": "Tuesday", "time_slot": "09:00 - 10:00", "subject_name": "English Communication", "subject_code": "EN101", "room": "Room 301", "faculty_name": "Ms. Anita Joseph"},
        {"department": "Computer Science", "semester": 1, "day_of_week": "Tuesday", "time_slot": "10:00 - 11:00", "subject_name": "Programming Lab", "subject_code": "CS101L", "room": "Lab B2", "faculty_name": "Dr. Alice Kumar"},
        {"department": "Computer Science", "semester": 1, "day_of_week": "Wednesday", "time_slot": "09:00 - 10:00", "subject_name": "Mathematics I", "subject_code": "MA101", "room": "Room 204", "faculty_name": "Prof. Ramesh"},
        {"department": "Computer Science", "semester": 1, "day_of_week": "Wednesday", "time_slot": "10:00 - 11:00", "subject_name": "Digital Logic", "subject_code": "CS102", "room": "Lab A1", "faculty_name": "Dr. Priya Nair"},
        {"department": "Computer Science", "semester": 1, "day_of_week": "Thursday", "time_slot": "09:00 - 10:00", "subject_name": "Programming Fundamentals", "subject_code": "CS101", "room": "Room 101", "faculty_name": "Dr. Alice Kumar"},
        {"department": "Computer Science", "semester": 1, "day_of_week": "Thursday", "time_slot": "11:00 - 12:00", "subject_name": "English Communication", "subject_code": "EN101", "room": "Room 301", "faculty_name": "Ms. Anita Joseph"},
        {"department": "Computer Science", "semester": 1, "day_of_week": "Friday", "time_slot": "09:00 - 10:00", "subject_name": "Mathematics I", "subject_code": "MA101", "room": "Room 204", "faculty_name": "Prof. Ramesh"},
        {"department": "Computer Science", "semester": 1, "day_of_week": "Friday", "time_slot": "10:00 - 11:00", "subject_name": "Digital Logic Lab", "subject_code": "CS102L", "room": "Lab A2", "faculty_name": "Dr. Priya Nair"},
    ]
    
    # Avoid duplicate seeds
    existing = db.query(models.Timetable).filter(models.Timetable.department == "Computer Science").count()
    if existing > 0:
        return {"message": f"Timetable already seeded ({existing} entries). Delete manually to re-seed."}

    for entry in sample_data:
        db.add(models.Timetable(**entry))
    db.commit()
    return {"message": f"Seeded {len(sample_data)} timetable entries."}
