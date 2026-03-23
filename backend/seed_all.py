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

print("🌱 Starting full rich seed...")

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
print("  ✅ Users created")

# ─── 2. FACULTY PROFILES ─────────────────────────────────────────────────────

faculty_data = [
    (fac1, "EMP001", "Alice",  "Kumar",   "Computer Science",   "Associate Professor"),
    (fac2, "EMP002", "Ramesh", "Sharma",  "Mathematics",        "Professor"),
    (fac3, "EMP003", "Priya",  "Nair",    "Computer Science",   "Assistant Professor"),
    (fac4, "EMP004", "Anita",  "Joseph",  "English",            "Lecturer"),
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
print("  ✅ Faculty profiles created")

# ─── 3. STUDENT PROFILES ─────────────────────────────────────────────────────

students_data = [
    (stu1, "CS2401", "John",   "Mathew",  "Computer Science", 3, "+91 9876543210", 8.7),
    (stu2, "CS2402", "Priya",  "Sharma",  "Computer Science", 3, "+91 9876543211", 9.1),
    (stu3, "CS2403", "Arjun",  "Menon",   "Computer Science", 3, "+91 9876543212", 7.8),
]
stu_profiles = {}
for user, enr, fn, ln, dept, sem, phone, cgpa in students_data:
    existing = db.query(models.Student).filter(models.Student.user_id == user.id).first()
    if not existing:
        sp = models.Student(
            user_id=user.id, enrollment_no=enr, first_name=fn, last_name=ln,
            department=dept, current_semester=sem, phone=phone, cgpa=cgpa,
            profile_bio=f"Passionate {dept} student at Smart College."
        )
        db.add(sp)
        db.flush()
        stu_profiles[enr] = sp
    else:
        existing.cgpa = cgpa
        existing.profile_bio = f"Passionate {dept} student at Smart College."
        stu_profiles[enr] = existing
db.commit()
print("  ✅ Student profiles created")

# ─── 4. COURSES ──────────────────────────────────────────────────────────────

courses_def = [
    ("CS301", "Data Structures & Algorithms", "Computer Science", 4, "EMP001"),
    ("CS302", "Operating Systems",            "Computer Science", 3, "EMP003"),
    ("CS303", "Database Management Systems",  "Computer Science", 3, "EMP001"),
    ("MA301", "Discrete Mathematics",         "Mathematics",      4, "EMP002"),
    ("EN301", "Technical Communication",      "English",          2, "EMP004"),
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
print("  ✅ Courses created")

# ─── 5. ATTENDANCE ───────────────────────────────────────────────────────────

for enr, sp in stu_profiles.items():
    existing_att = db.query(models.Attendance).filter(models.Attendance.student_id == sp.id).count()
    if existing_att > 0:
        continue
    base_date = datetime.now() - timedelta(days=60)
    for course_code, co in course_objs.items():
        for day_offset in range(0, 60, 3):  # class every 3 days
            date = base_date + timedelta(days=day_offset)
            if date.weekday() >= 6:  # skip Sunday
                continue
            # Randomise attendance (more present than absent)
            status = "Present" if random.random() > 0.2 else "Absent"
            att = models.Attendance(student_id=sp.id, course_id=co.id, date=date, status=status)
            db.add(att)
db.commit()
print("  ✅ Attendance records created")

# ─── 6. MARKS ────────────────────────────────────────────────────────────────

marks_data = {
    "CS2401": {"CS301": (42, 50), "CS302": (38, 50), "CS303": (45, 50), "MA301": (40, 50), "EN301": (46, 50)},
    "CS2402": {"CS301": (48, 50), "CS302": (45, 50), "CS303": (47, 50), "MA301": (44, 50), "EN301": (49, 50)},
    "CS2403": {"CS301": (35, 50), "CS302": (33, 50), "CS303": (38, 50), "MA301": (30, 50), "EN301": (40, 50)},
}
for enr, sp in stu_profiles.items():
    existing_marks = db.query(models.Mark).filter(models.Mark.student_id == sp.id).count()
    if existing_marks > 0:
        continue
    for code, (got, total) in marks_data.get(enr, {}).items():
        co = course_objs.get(code)
        if not co:
            continue
        for exam_type, multiplier in [("Internal", 0.4), ("Mid-Sem", 0.8), ("Final", 1.0)]:
            m = models.Mark(
                student_id=sp.id, course_id=co.id,
                exam_type=exam_type,
                marks_obtained=round(got * multiplier, 1),
                total_marks=round(total * multiplier, 1)
            )
            db.add(m)
db.commit()
print("  ✅ Marks created")

# ─── 7. ANNOUNCEMENTS ────────────────────────────────────────────────────────

existing_ann = db.query(models.Announcement).count()
if existing_ann == 0:
    ann_data = [
        ("🎓 End Semester Examinations – May 2025", "End semester exams will be held from 5th May to 20th May 2025. Students are advised to collect their Hall Tickets from the Examination Office by 28th April.", "Exam", True),
        ("📅 Mid-Semester Marks Published", "Mid-semester marks for Semester 3 have been published on the student portal. Students with objections may contact their respective faculty within 5 working days.", "Exam", False),
        ("🏆 National Hackathon – Registration Open", "Smart College is participating in TechFest 2025. Register your teams at the CS Department notice board before 20th March. First prize: ₹50,000!", "Event", True),
        ("🌟 Campus Recruitment Drive – Infosys", "Infosys will be conducting campus placements on 25th March 2025. Final year students are eligible. Report to the Placement Cell with updated resume.", "Event", False),
        ("🏖️ Summer Vacation Notice", "College will remain closed from 1st June to 30th June 2025 for summer vacation. Final year project submissions are due before 30th May.", "Holiday", False),
        ("📚 Library Extended Hours", "The college library will remain open till 9:00 PM on all working days until the end semester examinations. Utilize this time to prepare well!", "General", False),
        ("⚠️ Fee Payment Deadline", "Last date to pay 2nd installment of tuition fee is 31st March 2025. Late payments will attract a penalty of ₹500 per day. Contact the Accounts Office for queries.", "General", True),
        ("🔬 Lab Safety Workshop", "A mandatory lab safety and first aid workshop will be conducted for all Science lab users on 22nd March at 10:00 AM in the Seminar Hall.", "Event", False),
        ("🎁 Cultural Fest – AURORA 2025", "Annual cultural festival AURORA 2025 is scheduled for 10th–12th April. Registrations for events (dance, music, coding) are open. Contact Cultural Committee.", "Event", False),
        ("📋 Revised Academic Calendar", "The academic calendar for 2025–26 has been revised. Please check the updated schedule on the college website or contact your class teacher for details.", "General", False),
    ]
    for title, body, category, pinned in ann_data:
        db.add(models.Announcement(title=title, body=body, category=category, is_pinned=pinned, created_by=admin.id))
db.commit()
print("  ✅ Announcements created")

# ─── 8. TIMETABLE ────────────────────────────────────────────────────────────

existing_tt = db.query(models.Timetable).count()
if existing_tt == 0:
    tt_data = [
        # MONDAY
        ("Computer Science",3,"Monday","08:30 - 09:30","Data Structures & Algorithms","CS301","Lab B1","Dr. Alice Kumar"),
        ("Computer Science",3,"Monday","09:30 - 10:30","Discrete Mathematics","MA301","Room 204","Prof. Ramesh Sharma"),
        ("Computer Science",3,"Monday","10:30 - 11:30","Operating Systems","CS302","Room 101","Dr. Priya Nair"),
        ("Computer Science",3,"Monday","11:30 - 12:30","Database Management Systems","CS303","Room 303","Dr. Alice Kumar"),
        ("Computer Science",3,"Monday","14:00 - 15:00","Technical Communication","EN301","Room 201","Ms. Anita Joseph"),
        # TUESDAY
        ("Computer Science",3,"Tuesday","08:30 - 09:30","Discrete Mathematics","MA301","Room 204","Prof. Ramesh Sharma"),
        ("Computer Science",3,"Tuesday","09:30 - 11:30","DSA Lab","CS301L","Lab B2","Dr. Alice Kumar"),
        ("Computer Science",3,"Tuesday","11:30 - 12:30","Operating Systems","CS302","Room 101","Dr. Priya Nair"),
        ("Computer Science",3,"Tuesday","14:00 - 15:00","Database Management Systems","CS303","Room 303","Dr. Alice Kumar"),
        ("Computer Science",3,"Tuesday","15:00 - 16:00","Technical Communication","EN301","Room 201","Ms. Anita Joseph"),
        # WEDNESDAY
        ("Computer Science",3,"Wednesday","08:30 - 09:30","Data Structures & Algorithms","CS301","Room 101","Dr. Alice Kumar"),
        ("Computer Science",3,"Wednesday","09:30 - 10:30","Operating Systems","CS302","Room 102","Dr. Priya Nair"),
        ("Computer Science",3,"Wednesday","10:30 - 12:30","OS Lab","CS302L","Lab A1","Dr. Priya Nair"),
        ("Computer Science",3,"Wednesday","14:00 - 15:00","Discrete Mathematics","MA301","Room 204","Prof. Ramesh Sharma"),
        # THURSDAY
        ("Computer Science",3,"Thursday","08:30 - 09:30","Database Management Systems","CS303","Room 303","Dr. Alice Kumar"),
        ("Computer Science",3,"Thursday","09:30 - 10:30","Discrete Mathematics","MA301","Room 204","Prof. Ramesh Sharma"),
        ("Computer Science",3,"Thursday","10:30 - 12:30","DBMS Lab","CS303L","Lab B1","Dr. Alice Kumar"),
        ("Computer Science",3,"Thursday","14:00 - 15:00","Technical Communication","EN301","Room 201","Ms. Anita Joseph"),
        ("Computer Science",3,"Thursday","15:00 - 16:00","Operating Systems","CS302","Room 101","Dr. Priya Nair"),
        # FRIDAY
        ("Computer Science",3,"Friday","08:30 - 09:30","Data Structures & Algorithms","CS301","Room 101","Dr. Alice Kumar"),
        ("Computer Science",3,"Friday","09:30 - 10:30","Discrete Mathematics","MA301","Room 204","Prof. Ramesh Sharma"),
        ("Computer Science",3,"Friday","10:30 - 11:30","Database Management Systems","CS303","Room 303","Dr. Alice Kumar"),
        ("Computer Science",3,"Friday","11:30 - 12:30","Operating Systems","CS302","Room 102","Dr. Priya Nair"),
        ("Computer Science",3,"Friday","14:00 - 15:00","Technical Communication","EN301","Room 201","Ms. Anita Joseph"),
        # SATURDAY
        ("Computer Science",3,"Saturday","09:00 - 11:00","Project Work / Self Study","--","Project Lab","Respective Guide"),
        ("Computer Science",3,"Saturday","11:00 - 12:00","Remedial Class / Doubt Session","ALL","Room 101","Faculty"),
    ]
    for row in tt_data:
        db.add(models.Timetable(department=row[0], semester=row[1], day_of_week=row[2],
                                time_slot=row[3], subject_name=row[4], subject_code=row[5],
                                room=row[6], faculty_name=row[7]))
db.commit()
print("  ✅ Timetable created (27 entries)")

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
    print(f"  ✅ Document forms created ({len(forms_meta)} PDFs)")
else:
    print(f"  ⏭️  Document forms already exist ({existing_forms})")

db.close()
print("\n🎉 Seed complete! Login credentials:")
print("   Admin   : admin@college.edu / admin123")
print("   Faculty : alice@college.edu / faculty123")
print("   Student : john@college.edu  / student123")
print("   Student : priya.s@college.edu / student123")
print("   Student : arjun@college.edu / student123")
