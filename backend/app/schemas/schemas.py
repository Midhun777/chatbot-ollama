from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str
    first_name: str
    last_name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

class StudentProfileCreate(BaseModel):
    enrollment_no: str
    first_name: str
    last_name: str
    department: str
    current_semester: int
    phone: str

class FacultyProfileCreate(BaseModel):
    employee_id: str
    first_name: str
    last_name: str
    department: str
    designation: str

class CourseResponse(BaseModel):
    id: int
    course_code: str
    course_name: str
    department: str
    credits: int

    class Config:
        from_attributes = True

class AttendanceCreate(BaseModel):
    student_id: int
    course_id: int
    date: str  # using string date usually easier from frontend
    status: str

class AttendanceResponse(BaseModel):
    id: int
    date: datetime
    status: str
    course_id: int

    class Config:
        from_attributes = True

class MarkCreate(BaseModel):
    student_id: int
    course_id: int
    exam_type: str
    marks_obtained: float
    total_marks: float

class MarkResponse(BaseModel):
    id: int
    exam_type: str
    marks_obtained: float
    total_marks: float
    course: CourseResponse

    class Config:
        from_attributes = True

class ChatMessageResponse(BaseModel):
    id: int
    query: str
    answer: str
    source: str
    timestamp: datetime

    class Config:
        from_attributes = True

class DocumentFormCreate(BaseModel):
    title: str
    description: Optional[str] = None

class DocumentFormResponse(DocumentFormCreate):
    id: int
    file_path: str
    uploaded_by: int
    created_at: datetime

    class Config:
        from_attributes = True

# ─── Announcements ────────────────────────────────────────────────
class AnnouncementCreate(BaseModel):
    title: str
    body: str
    category: Optional[str] = "General"
    is_pinned: Optional[bool] = False

class AnnouncementResponse(AnnouncementCreate):
    id: int
    created_by: int
    created_at: datetime

    class Config:
        from_attributes = True

# ─── Timetable ───────────────────────────────────────────────────
class TimetableEntry(BaseModel):
    id: int
    department: str
    semester: int
    day_of_week: str
    time_slot: str
    subject_name: str
    subject_code: str
    room: str
    faculty_name: str

    class Config:
        from_attributes = True

# ─── Student Profile Update ──────────────────────────────────────
class StudentProfileUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    department: Optional[str] = None
    current_semester: Optional[int] = None
    cgpa: Optional[float] = None
    profile_bio: Optional[str] = None

class StudentProfileResponse(BaseModel):
    id: int
    enrollment_no: str
    first_name: str
    last_name: str
    department: str
    current_semester: int
    phone: Optional[str] = ""
    cgpa: Optional[float] = 0.0
    profile_bio: Optional[str] = ""

    class Config:
        from_attributes = True


# ─── AI Roadmap ───────────────────────────────────────────────────
class RoadmapRequest(BaseModel):
    topic: str
    skill_level: Optional[str] = "Beginner"
    deadline_weeks: Optional[int] = 4
    daily_hours: Optional[float] = 1.5

# ─── Timetable Create ────────────────────────────────────────────
class TimetableCreate(BaseModel):
    department: str
    semester: int
    day_of_week: str
    time_slot: str
    subject_name: str
    subject_code: str
    room: str
    faculty_name: str
