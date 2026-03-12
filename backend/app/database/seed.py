import sys
import os

# Ensure the app module is in path so absolute imports work
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from app.database.connection import SessionLocal, engine, Base
from app.database import models
from app.core.security import get_password_hash
from datetime import datetime

def seed_database():
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Check if already seeded
        if db.query(models.User).first():
            print("Database already contains users. Skipping seed.")
            return

        print("Seeding users...")

        # 1. Admin User
        admin_user = models.User(
            email="admin@college.edu",
            password_hash=get_password_hash("admin123"),
            role=models.UserRole.ADMIN
        )
        db.add(admin_user)

        # 2. Student User
        student_user = models.User(
            email="student@college.edu",
            password_hash=get_password_hash("student123"),
            role=models.UserRole.STUDENT
        )
        db.add(student_user)
        db.flush() # Get student user ID
        
        student_profile = models.Student(
            user_id=student_user.id,
            enrollment_no="BCA24001",
            first_name="Alex",
            last_name="Doe",
            department="BCA",
            current_semester=4,
            phone="555-0100"
        )
        db.add(student_profile)

        # 3. Faculty User
        faculty_user = models.User(
            email="faculty@college.edu",
            password_hash=get_password_hash("faculty123"),
            role=models.UserRole.FACULTY
        )
        db.add(faculty_user)
        db.flush()
        
        faculty_profile = models.Faculty(
            user_id=faculty_user.id,
            employee_id="F1001",
            first_name="Jane",
            last_name="Smith",
            department="BCA",
            designation="Professor"
        )
        db.add(faculty_profile)
        
        # Add a Course
        db.flush()
        course = models.Course(
            course_code="BCA401",
            course_name="Artificial Intelligence",
            department="BCA",
            credits=4,
            faculty_id=faculty_profile.id
        )
        db.add(course)

        db.commit()
        print("Database seeded successfully!")
        print("Test Accounts Created:")
        print("Admin:   admin@college.edu / admin123")
        print("Student: student@college.edu / student123")
        print("Faculty: faculty@college.edu / faculty123")

    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
