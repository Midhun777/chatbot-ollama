import os
import sys

# Add backend directory to sys.path so we can import app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fpdf import FPDF
from app.database.connection import SessionLocal
from app.database import models

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
UPLOADS_DIR = os.path.join(DATA_DIR, "uploads")
KNOWLEDGE_DIR = os.path.join(DATA_DIR, "knowledge")

# Create directories if they don't exist
os.makedirs(UPLOADS_DIR, exist_ok=True)
os.makedirs(KNOWLEDGE_DIR, exist_ok=True)

def create_pdf(filename, title, content, directory):
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", 'B', 16)
    pdf.cell(0, 10, title, ln=True, align='C')
    pdf.ln(10)
    pdf.set_font("Arial", size=12)
    pdf.multi_cell(0, 10, content)
    
    filepath = os.path.join(directory, filename)
    pdf.output(filepath)
    print(f"Created: {filepath}")
    return filepath

# --- 1. Generate Knowledge Base Documents (for RAG) ---
knowledge_docs = [
    {
        "filename": "faculty_directory_2026.pdf",
        "title": "Faculty Directory and Contact Information 2026",
        "content": "Computer Science Department:\n"
                   "- Dr. Alice Smith (HOD): specializes in Artificial Intelligence. Email: alice@college.edu\n"
                   "- Prof. Bob Johnson: teaches Database Management Systems. Room 302.\n"
                   "- Dr. Charlie Brown: specializes in Computer Networks and Security. Room 204.\n"
                   "\nElectrical Engineering:\n"
                   "- Dr. David Wilson: specializes in Power Systems.\n"
                   "- Prof. Eve Davis: teaches Electronics and Circuits.\n"
    },
    {
        "filename": "course_catalog_cs.pdf",
        "title": "Computer Science Course Catalog",
        "content": "CS101 - Introduction to Programming (4 Credits): Covers basic procedural programming using Python.\n\n"
                   "CS201 - Data Structures and Algorithms (4 Credits): Trees, graphs, sorting, and dynamic programming.\n\n"
                   "CS301 - Artificial Intelligence (3 Credits): Machine learning, neural networks, and expert systems. Prerequisite: CS201.\n\n"
                   "CS401 - Database Management (3 Credits): SQL, normal forms, transaction management."
    },
    {
        "filename": "examination_guidelines.pdf",
        "title": "Examination and Grading Guidelines",
        "content": "The academic year is divided into two semesters.\n"
                   "Grading System:\n"
                   "Total marks per subject: 100\n"
                   "- Internal Assessment (Assignments/Quizzes): 30 marks\n"
                   "- Mid-Semester Examination: 20 marks\n"
                   "- End-Semester Examination: 50 marks\n\n"
                   "Passing Criteria: A minimum of 40% aggregate and minimum 75% attendance is required to pass a course."
    },
    {
        "filename": "campus_facilities.pdf",
        "title": "Campus Facilities and Timings",
        "content": "Library: The central library is open Monday to Saturday, 8:00 AM to 10:00 PM. Access requires a valid Student ID card.\n\n"
                   "Sports Complex: Includes a gym, indoor badminton courts, and an Olympic-size swimming pool. Open to all students from 6:00 AM to 8:00 PM.\n\n"
                   "Cafeteria: The main cafeteria serves meals from 7:30 AM to 9:00 PM. Vegetarian and non-vegetarian options are available.\n\n"
                   "Medical Center: A 24/7 medical room with a resident doctor and nurse is located in Block C."
    }
]

# --- 2. Generate Downloadable Forms ---
forms_data = [
    {
        "filename": "scholarship_application_form.pdf",
        "title": "Merit Scholarship Application Form",
        "content": "This is a dummy application form for the Merit Scholarship.\n\n"
                   "Please fill in your details:\n"
                   "Name: _______________\n"
                   "Enrollment No: _______________\n"
                   "CGPA: _______________\n"
                   "Family Income: _______________\n\n"
                   "Submit this form to the administration block by March 30th."
    },
    {
        "filename": "hostel_accommodation_form.pdf",
        "title": "Hostel Accommodation Request Form",
        "content": "This is a dummy application form for Hostel Accommodation.\n\n"
                   "Name: _______________\n"
                   "Department: _______________\n"
                   "Permanent Address: ______________________________\n\n"
                   "Subject to availability, rooms are allocated on a first-come, first-served basis."
    },
    {
        "filename": "leave_application_form.pdf",
        "title": "Student Leave Application Form",
        "content": "This is a dummy application form for Student Medical/Personal Leave.\n\n"
                   "Name: _______________\n"
                   "Dates of Leave: From _______ To _______\n"
                   "Reason for Leave: ______________________________\n\n"
                   "Note: Leaves extending beyond 3 days require a medical certificate."
    }
]

print("Generating Knowledge Base PDFs for RAG...")
for doc in knowledge_docs:
    create_pdf(doc["filename"], doc["title"], doc["content"], KNOWLEDGE_DIR)

print("\nGenerating Downloadable Form PDFs...")
db = SessionLocal()
admin_user = db.query(models.User).filter_by(role="admin").first()

for idx, form in enumerate(forms_data):
    filepath = create_pdf(form["filename"], form["title"], form["content"], UPLOADS_DIR)
    
    # Check if form already exists in DB
    existing_form = db.query(models.DocumentForm).filter_by(title=form["title"]).first()
    if not existing_form:
        new_form = models.DocumentForm(
            title=form["title"],
            description=f"Official form for {form['title']}",
            file_path=filepath,
            uploaded_by=admin_user.id if admin_user else 1
        )
        db.add(new_form)

db.commit()
db.close()
print("Forms added to database.")
