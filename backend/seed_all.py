"""
Rich Seed Script — Smart College Portal
Run from: d:\vs-code\main-projects\chatbot-march-03\backend
Command:  venv/Scripts/python.exe seed_all.py
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from app.database.connection import SessionLocal, engine, Base
from app.database import models
from app.core.security import get_password_hash
from datetime import datetime, timedelta
import random, uuid

Base.metadata.create_all(bind=engine)
db = SessionLocal()

print("Starting full rich seed...")

# ─── 1. USERS ────────────────────────────────────────────────────────────────

def create_user(email, password, role):
    existing = db.query(models.User).filter(models.User.email == email).first()
    if existing:
        return existing
    u = models.User(email=email, password_hash=get_password_hash(password), role=role)
    db.add(u)
    db.flush()
    return u

admin  = create_user("admin@college.edu",   "admin123",   "admin")
fac1   = create_user("alice@college.edu",   "faculty123", "faculty")
fac2   = create_user("ramesh@college.edu",  "faculty123", "faculty")
fac3   = create_user("priya@college.edu",   "faculty123", "faculty")
fac4   = create_user("anita@college.edu",   "faculty123", "faculty")
stu1   = create_user("john@college.edu",    "student123", "student")
stu2   = create_user("priya.s@college.edu", "student123", "student")
stu3   = create_user("arjun@college.edu",   "student123", "student")
db.commit()
print("   Users created")

# ─── 2. FACULTY PROFILES ─────────────────────────────────────────────────────

faculty_data = [
    (fac1, "EMP001", "Alice",  "Kumar",   "Computer Science",   "Associate Professor"),
    (fac2, "EMP002", "Ramesh", "Sharma",  "Mathematics",        "Professor"),
    (fac3, "EMP003", "Priya",  "Nair",    "Computer Science",   "Assistant Professor"),
    (fac4, "EMP004", "Anita",  "Joseph",  "English",            "Lecturer"),
    (create_user("michael@college.edu", "faculty123", "faculty"), "EMP005", "Michael", "Johnson", "Mechanical Engineering", "Professor"),
    (create_user("sarah@college.edu", "faculty123", "faculty"), "EMP006", "Sarah", "Lee", "Electrical Engineering", "Associate Professor"),
    (create_user("david@college.edu", "faculty123", "faculty"), "EMP007", "David", "Smith", "Business Administration", "Professor"),
    (create_user("emma@college.edu", "faculty123", "faculty"), "EMP008", "Emma", "Wilson", "Civil Engineering", "Assistant Professor"),
]
fac_profiles = {}
for user, eid, fn, ln, dept, desig in faculty_data:
    if not db.query(models.Faculty).filter(models.Faculty.user_id == user.id).first():
        fp = models.Faculty(user_id=user.id, employee_id=eid, first_name=fn, last_name=ln, department=dept, designation=desig)
        db.add(fp)
        db.flush()
        fac_profiles[eid] = fp
    else:
        fac_profiles[eid] = db.query(models.Faculty).filter(models.Faculty.user_id == user.id).first()
db.commit()
print("   Faculty profiles created")

# ─── 3. STUDENT PROFILES ─────────────────────────────────────────────────────

students_data = [
    (stu1, "CS2401", "John",   "Mathew",  "Computer Science", 3, "+91 9876543210"),
    (stu2, "CS2402", "Priya",  "Sharma",  "Computer Science", 3, "+91 9876543211"),
    (stu3, "CS2403", "Arjun",  "Menon",   "Computer Science", 3, "+91 9876543212"),
]
stu_profiles = {}
for user, enr, fn, ln, dept, sem, phone in students_data:
    existing = db.query(models.Student).filter(models.Student.user_id == user.id).first()
    if not existing:
        sp = models.Student(
            user_id=user.id, enrollment_no=enr, first_name=fn, last_name=ln,
            department=dept, current_semester=sem, phone=phone,
            profile_bio=f"Passionate {dept} student at Smart College."
        )
        db.add(sp)
        db.flush()
        stu_profiles[enr] = sp
    else:
        existing.profile_bio = f"Passionate {dept} student at Smart College."
        stu_profiles[enr] = existing
db.commit()
print("   Student profiles created")

# ─── 4. COURSES ──────────────────────────────────────────────────────────────

courses_def = [
    ("CS301", "Data Structures & Algorithms", "Computer Science", 4, "EMP001"),
    ("CS302", "Operating Systems",            "Computer Science", 3, "EMP003"),
    ("CS303", "Database Management Systems",  "Computer Science", 3, "EMP001"),
    ("MA301", "Discrete Mathematics",         "Mathematics",      4, "EMP002"),
    ("EN301", "Technical Communication",      "English",          2, "EMP004"),
    ("ME401", "Thermodynamics",               "Mechanical Engineering", 4, "EMP005"),
    ("ME402", "Fluid Mechanics",              "Mechanical Engineering", 4, "EMP005"),
    ("ME403", "Engineering Graphics",         "Mechanical Engineering", 3, "EMP005"),
    ("EE201", "Circuit Theory",               "Electrical Engineering", 4, "EMP006"),
    ("EE202", "Digital Electronics",          "Electrical Engineering", 3, "EMP006"),
    ("EE203", "Power Systems",                "Electrical Engineering", 4, "EMP006"),
    ("BA101", "Marketing Management",         "Business Administration", 3, "EMP007"),
    ("BA102", "Financial Accounting",         "Business Administration", 3, "EMP007"),
    ("BA103", "Business Ethics",              "Business Administration", 2, "EMP007"),
    ("CE301", "Structural Analysis",          "Civil Engineering", 4, "EMP008"),
    ("CE302", "Soil Mechanics",               "Civil Engineering", 4, "EMP008"),
    ("CE303", "Surveying & Leveling",         "Civil Engineering", 3, "EMP008"),
]
course_objs = {}
for code, name, dept, credits, fac_id in courses_def:
    existing = db.query(models.Course).filter(models.Course.course_code == code).first()
    if not existing:
        fp = fac_profiles.get(fac_id)
        c = models.Course(course_code=code, course_name=name, department=dept, credits=credits,
                          faculty_id=fp.id if fp else None)
        db.add(c)
        db.flush()
        course_objs[code] = c
    else:
        course_objs[code] = existing
db.commit()
print("   Courses created")


# ─── 7. ANNOUNCEMENTS ────────────────────────────────────────────────────────

existing_ann = db.query(models.Announcement).count()
if existing_ann == 0:
    ann_data = [
        ("End Semester Examinations - May 2025", "End semester exams will be held from 5th May to 20th May 2025. Students are advised to collect their Hall Tickets from the Examination Office by 28th April.", "Exam", True),
        ("Mid-Semester Marks Published", "Mid-semester marks for Semester 3 have been published on the student portal. Students with objections may contact their respective faculty within 5 working days.", "Exam", False),
        ("National Hackathon - Registration Open", "Smart College is participating in TechFest 2025. Register your teams at the CS Department notice board before 20th March. First prize: 50,000!", "Event", True),
        ("Campus Recruitment Drive - Infosys", "Infosys will be conducting campus placements on 25th March 2025. Final year students are eligible. Report to the Placement Cell with updated resume.", "Event", False),
        ("Summer Vacation Notice", "College will remain closed from 1st June to 30th June 2025 for summer vacation. Final year project submissions are due before 30th May.", "Holiday", False),
        ("Library Extended Hours", "The college library will remain open till 9:00 PM on all working days until the end semester examinations. Utilize this time to prepare well!", "General", False),
        ("Fee Payment Deadline", "Last date to pay 2nd installment of tuition fee is 31st March 2025. Late payments will attract a penalty of 500 per day. Contact the Accounts Office for queries.", "General", True),
        ("Lab Safety Workshop", "A mandatory lab safety and first aid workshop will be conducted for all Science lab users on 22nd March at 10:00 AM in the Seminar Hall.", "Event", False),
        ("Cultural Fest - AURORA 2025", "Annual cultural festival AURORA 2025 is scheduled for 10th-12th April. Registrations for events (dance, music, coding) are open. Contact Cultural Committee.", "Event", False),
        ("Revised Academic Calendar", "The academic calendar for 2025-26 has been revised. Please check the updated schedule on the college website or contact your class teacher for details.", "General", False),
    ]
    for title, body, category, pinned in ann_data:
        db.add(models.Announcement(title=title, body=body, category=category, is_pinned=pinned, created_by=admin.id))
db.commit()
print("   Announcements created")

# ─── 8. TIMETABLE ────────────────────────────────────────────────────────────

existing_tt = db.query(models.Timetable).count()
if existing_tt < 50:
    # Clear existing to ensure consistency for this rich seed
    db.query(models.Timetable).delete()
    tt_data = [
        # COMPUTER SCIENCE - SEM 3
        ("Computer Science", 3, "Monday", "08:30 - 09:30", "Data Structures & Algorithms", "CS301", "Lab B1", "Dr. Alice Kumar"),
        ("Computer Science", 3, "Monday", "09:30 - 10:30", "Discrete Mathematics", "MA301", "Room 204", "Prof. Ramesh Sharma"),
        ("Computer Science", 3, "Tuesday", "10:30 - 11:30", "Operating Systems", "CS302", "Room 101", "Dr. Priya Nair"),
        
        # MECHANICAL ENGINEERING - SEM 2
        ("Mechanical Engineering", 2, "Monday", "09:00 - 10:00", "Thermodynamics", "ME401", "Room 401", "Dr. Michael Johnson"),
        ("Mechanical Engineering", 2, "Monday", "10:00 - 11:00", "Engineering Graphics", "ME403", "Drawing Hall", "Dr. Michael Johnson"),
        ("Mechanical Engineering", 2, "Tuesday", "09:00 - 11:00", "Fluid Mechanics Lab", "ME402L", "Workshop A", "Dr. Michael Johnson"),
        ("Mechanical Engineering", 2, "Wednesday", "11:00 - 12:00", "Thermodynamics", "ME401", "Room 401", "Dr. Michael Johnson"),
        
        # ELECTRICAL ENGINEERING - SEM 1
        ("Electrical Engineering", 1, "Monday", "09:00 - 10:00", "Circuit Theory", "EE201", "Lab E1", "Dr. Sarah Lee"),
        ("Electrical Engineering", 1, "Monday", "11:00 - 12:00", "Digital Electronics", "EE202", "Room 501", "Dr. Sarah Lee"),
        ("Electrical Engineering", 1, "Tuesday", "14:00 - 16:00", "Circuit Lab", "EE201L", "Lab E2", "Dr. Sarah Lee"),
        ("Electrical Engineering", 1, "Thursday", "10:00 - 11:00", "Circuit Theory", "EE201", "Room 501", "Dr. Sarah Lee"),

        # BUSINESS ADMINISTRATION - SEM 1
        ("Business Administration", 1, "Monday", "10:00 - 11:00", "Marketing Management", "BA101", "Room 105", "Dr. David Smith"),
        ("Business Administration", 1, "Wednesday", "09:00 - 10:00", "Financial Accounting", "BA102", "Room 105", "Dr. David Smith"),
        ("Business Administration", 1, "Friday", "11:00 - 12:00", "Business Ethics", "BA103", "Room 105", "Dr. David Smith"),
        ("Business Administration", 1, "Friday", "14:00 - 15:00", "Marketing Workshop", "BA101W", "Seminar Hall", "Dr. David Smith"),

        # CIVIL ENGINEERING - SEM 3
        ("Civil Engineering", 3, "Monday", "08:30 - 09:30", "Structural Analysis", "CE301", "Room 302", "Dr. Emma Wilson"),
        ("Civil Engineering", 3, "Tuesday", "10:00 - 12:00", "Surveying Practical", "CE303P", "Campus Grounds", "Dr. Emma Wilson"),
        ("Civil Engineering", 3, "Wednesday", "14:00 - 15:00", "Soil Mechanics", "CE302", "Room 302", "Dr. Emma Wilson"),
        ("Civil Engineering", 3, "Thursday", "11:00 - 12:00", "Structural Analysis", "CE301", "Room 302", "Dr. Emma Wilson"),

        # ADDING MORE FOR EVERYONE...
        ("Computer Science", 1, "Monday", "09:00 - 10:00", "Programming Fundamentals", "CS101", "Lab B2", "Dr. Alice Kumar"),
        ("Computer Science", 4, "Wednesday", "10:00 - 12:00", "Cloud Computing", "CS401", "Room 101", "Dr. Priya Nair"),
        ("Mechanical Engineering", 4, "Friday", "09:00 - 10:00", "Power Plant Engineering", "ME405", "Room 402", "Dr. Michael Johnson"),
        ("Electrical Engineering", 4, "Monday", "14:00 - 15:00", "Control Systems", "EE401", "Room 502", "Dr. Sarah Lee"),
    ]
    # Multiply entries with random days to reach "rich" status
    all_depts = ["Computer Science", "Mechanical Engineering", "Electrical Engineering", "Business Administration", "Civil Engineering"]
    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    added_count = len(tt_data)
    
    for row in tt_data:
        db.add(models.Timetable(department=row[0], semester=row[1], day_of_week=row[2],
                                time_slot=row[3], subject_name=row[4], subject_code=row[5],
                                room=row[6], faculty_name=row[7]))
    
    # Generate some filler to make it look "Dense"
    for dept in all_depts:
        for sem in [1, 2, 3, 4]:
            for day in days:
                if random.random() > 0.4: # 60% chance for a morning class
                    db.add(models.Timetable(
                        department=dept, semester=sem, day_of_week=day,
                        time_slot="09:00 - 10:00", subject_name=f"Core {dept} Subject", 
                        subject_code=f"{dept[:2].upper()}{sem}0{random.randint(1,9)}",
                        room=f"Room {random.randint(100,500)}", faculty_name="Assigned Faculty"
                    ))
                    added_count += 1

    db.commit()
    print(f"   Timetable created ({added_count} entries)")

# ─── 9. DOCUMENT FORMS (Dummy PDFs) ──────────────────────────────────────────

existing_forms = db.query(models.DocumentForm).count()
if existing_forms == 0:
    from scripts.create_dummy_forms import create_forms, DESCRIPTIONS
    forms_meta = create_forms()
    for fm in forms_meta:
        db_form = models.DocumentForm(
            title=fm["title"],
            description=fm["description"],
            file_path=fm["file_path"],
            uploaded_by=admin.id
        )
        db.add(db_form)
    db.commit()
    print(f"   Document forms created ({len(forms_meta)} PDFs)")
else:
    print(f"   Document forms already exist ({existing_forms})")

db.close()
print("\nSeed complete! Login credentials:")
print("   Admin   : admin@college.edu / admin123")
print("   Faculty : alice@college.edu / faculty123")
print("   Student : john@college.edu  / student123")
print("   Student : priya.s@college.edu / student123")
print("   Student : arjun@college.edu / student123")
