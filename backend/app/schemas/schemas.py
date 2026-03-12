from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str
    role: str = "student"
    first_name: str
    last_name: str
    department: str
    id_number: str # Enrollment No or Employee ID

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

class AttendanceResponse(BaseModel):
    id: int
    date: datetime
    status: str
    course_id: int

    class Config:
        from_attributes = True

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
