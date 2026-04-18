from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Float, Enum
from sqlalchemy.orm import relationship
from .connection import Base
from datetime import datetime
import enum

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    STUDENT = "student"
    FACULTY = "faculty"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    role = Column(String, default=UserRole.STUDENT)
    status = Column(String, default="active") # active, pending, banned
    created_at = Column(DateTime, default=datetime.utcnow)

    student_profile = relationship("Student", back_populates="user", uselist=False)
    faculty_profile = relationship("Faculty", back_populates="user", uselist=False)
    
    sent_messages = relationship("DirectMessage", back_populates="sender", foreign_keys="[DirectMessage.sender_id]")
    received_messages = relationship("DirectMessage", back_populates="receiver", foreign_keys="[DirectMessage.receiver_id]")

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    enrollment_no = Column(String, unique=True, index=True)
    first_name = Column(String)
    last_name = Column(String)
    department = Column(String)
    current_semester = Column(Integer)
    phone = Column(String)
    profile_bio = Column(String, default="")

    user = relationship("User", back_populates="student_profile")

class Faculty(Base):
    __tablename__ = "faculty"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    employee_id = Column(String, unique=True, index=True)
    first_name = Column(String)
    last_name = Column(String)
    department = Column(String)
    designation = Column(String)
    phone = Column(String)
    profile_bio = Column(String, default="")

    user = relationship("User", back_populates="faculty_profile")
    courses = relationship("Course", back_populates="faculty")

class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    course_code = Column(String, unique=True, index=True)
    course_name = Column(String)
    department = Column(String)
    credits = Column(Integer)
    faculty_id = Column(Integer, ForeignKey("faculty.id"))

    faculty = relationship("Faculty", back_populates="courses")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    query = Column(String)
    answer = Column(String)
    source = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")

class DocumentForm(Base):
    __tablename__ = "document_forms"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)
    file_path = Column(String)
    uploaded_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    uploader = relationship("User")


class Announcement(Base):
    __tablename__ = "announcements"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    body = Column(String)
    category = Column(String, default="General")  # General, Exam, Event, Holiday
    is_pinned = Column(Boolean, default=False)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    author = relationship("User")


class Timetable(Base):
    __tablename__ = "timetable"

    id = Column(Integer, primary_key=True, index=True)
    department = Column(String, index=True)
    semester = Column(Integer, index=True)
    day_of_week = Column(String)   # Monday, Tuesday, ...
    time_slot = Column(String)     # e.g. "09:00 - 10:00"
    subject_name = Column(String)
    subject_code = Column(String)
    room = Column(String)
    faculty_name = Column(String)


class DirectMessage(Base):
    __tablename__ = "direct_messages"

    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"))
    receiver_id = Column(Integer, ForeignKey("users.id"))
    content = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)
    is_read = Column(Boolean, default=False)

    sender = relationship("User", foreign_keys=[sender_id], back_populates="sent_messages")
    receiver = relationship("User", foreign_keys=[receiver_id], back_populates="received_messages")

class AdminAuditLog(Base):
    __tablename__ = "admin_audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    admin_id = Column(Integer, ForeignKey("users.id"))
    action = Column(String)
    target = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)

    admin = relationship("User")
