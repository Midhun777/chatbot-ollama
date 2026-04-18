from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str
    first_name: str
    last_name: str
    role: Optional[str] = "student"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None
    status: Optional[str] = None

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

class PublicCourseResponse(BaseModel):
    id: int
    course_code: str
    course_name: str
    department: str
    credits: int
    faculty_name: Optional[str] = None
    
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
    profile_bio: Optional[str] = None

class StudentProfileResponse(BaseModel):
    id: int
    enrollment_no: str
    first_name: str
    last_name: str
    department: str
    current_semester: int
    phone: Optional[str] = ""
    profile_bio: Optional[str] = ""

    class Config:
        from_attributes = True

class FacultyProfileUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    department: Optional[str] = None
    designation: Optional[str] = None
    profile_bio: Optional[str] = None

class FacultyProfileResponse(BaseModel):
    id: int
    employee_id: str
    first_name: str
    last_name: str
    department: str
    designation: str
    phone: Optional[str] = ""
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


# ─── Direct Messaging ───────────────────────────────────────────
class MessageCreate(BaseModel):
    receiver_id: int
    content: str

class MessageResponse(BaseModel):
    id: int
    sender_id: int
    receiver_id: int
    content: str
    timestamp: datetime
    is_read: bool

    class Config:
        from_attributes = True

class ChatMember(BaseModel):
    id: int
    email: str
    first_name: str
    last_name: str
    role: str
    last_message: Optional[str] = None
    last_message_time: Optional[datetime] = None
    unread_count: int = 0

# ─── Admin Management ───────────────────────────────────────────
class UserStatusUpdate(BaseModel):
    status: str

class UserRoleUpdate(BaseModel):
    role: str

class UserManagementResponse(BaseModel):
    id: int
    email: str
    role: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class AdminAuditLogResponse(BaseModel):
    id: int
    admin_id: int
    admin_email: str
    action: str
    target: str
    timestamp: datetime

    class Config:
        from_attributes = True
