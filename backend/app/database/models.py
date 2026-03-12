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
    created_at = Column(DateTime, default=datetime.utcnow)

    student_profile = relationship("Student", back_populates="user", uselist=False)
    faculty_profile = relationship("Faculty", back_populates="user", uselist=False)

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

    user = relationship("User", back_populates="student_profile")
    attendances = relationship("Attendance", back_populates="student")
    marks = relationship("Mark", back_populates="student")

class Faculty(Base):
    __tablename__ = "faculty"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    employee_id = Column(String, unique=True, index=True)
    first_name = Column(String)
    last_name = Column(String)
    department = Column(String)
    designation = Column(String)

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
    attendances = relationship("Attendance", back_populates="course")
    marks = relationship("Mark", back_populates="course")

class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    course_id = Column(Integer, ForeignKey("courses.id"))
    date = Column(DateTime)
    status = Column(String) # Present/Absent

    student = relationship("Student", back_populates="attendances")
    course = relationship("Course", back_populates="attendances")

class Mark(Base):
    __tablename__ = "marks"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    course_id = Column(Integer, ForeignKey("courses.id"))
    exam_type = Column(String) # Mid-Sem, Final, Internal
    marks_obtained = Column(Float)
    total_marks = Column(Float)

    student = relationship("Student", back_populates="marks")
    course = relationship("Course", back_populates="marks")

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    query = Column(String)
    answer = Column(String)
    source = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")
