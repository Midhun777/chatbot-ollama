from sqlalchemy.orm import Session
from app.database import models
from langchain_core.documents import Document
from langchain_community.vectorstores import Chroma
import os

# Configuration paths (consistent with ingest.py)
BACKEND_LOGIC_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
CHROMA_DB_DIR = os.path.join(BACKEND_LOGIC_DIR, "data", "chromadb")

def get_institution_info():
    """Returns hardcoded institution info as a Document."""
    info = """
    CORE INSTITUTIONAL METADATA:
    EduSphere Web Portal - Official Identity
    Location: Ernakulam, Kochi, Kerala, India.
    Campus: Main Campus is located at Marine Drive, Kochi.
    Contact: info@edusphere.edu | +91 484 2345678
    Departments: Computer Science, Civil Engineering, Mechanical Engineering, Electrical & Electronics, Business Administration.
    Vision: To be a global leader in AI-driven education and institutional management.
    """
    return Document(page_content=info, metadata={"source": "Institutional-Meta"})

def get_admission_info():
    """Returns detailed admission policy as a Document."""
    info = """
    OFFICIAL ADMISSION POLICY 2025-26:
    The admission process at EduSphere is structured into 5 clear steps:
    1. ONLINE APPLICATION: Candidates must register and fill the application form on the official website.
    2. ENTRANCE EXAM: Applicants for Engineering and Management must appear for the EduSphere Entrance Test (EET).
    3. MERIT LIST & INTERVIEW: Based on EET scores, candidates are shortlisted for a personal interview.
    4. DOCUMENT VERIFICATION: Shortlisted candidates must bring original certificates for verification at the Kochi campus.
    5. FEE PAYMENT & ENROLLMENT: Final admission is confirmed upon payment of the first semester fee.
    
    Eligibility: Minimum 60% aggregate in 10+2 for UG, and 55% in graduation for PG.
    Deadlines: Phase 1 applications close on June 15th, 2025.
    """
    return Document(page_content=info, metadata={"source": "Admission-Policy"})

def ingest_database_records(db: Session, embedding_model):
    """
    Pulls records from the database, converts to text documents, 
    and adds them to ChromaDB.
    """
    documents = []

    # 1. Hardcoded Core Policies & Info
    documents.append(get_institution_info())
    documents.append(get_admission_info())

    # 2. Ingest Courses with Context Tags
    courses = db.query(models.Course).all()
    for c in courses:
        text = f"[COURSE CATALOG] The subject '{c.course_name}' (Code: {c.course_code}) is offered by the {c.department} department. It is an academic course with {c.credits} credits."
        documents.append(Document(page_content=text, metadata={"source": "DB-Courses", "id": c.id}))

    # 3. Ingest Faculty with Context Tags
    faculty = db.query(models.Faculty).all()
    for f in faculty:
        text = f"[FACULTY DIRECTORY] Dr./Prof. {f.first_name} {f.last_name} is a {f.designation} serving in the {f.department} department."
        documents.append(Document(page_content=text, metadata={"source": "DB-Faculty", "id": f.id}))

    # 4. Ingest Timetable with Context Tags (The most noisy records)
    timetable = db.query(models.Timetable).all()
    for t in timetable:
        text = f"[SCHEDULING RECORD] For the {t.department} department (Semester {t.semester}), a class for {t.subject_name} is scheduled on {t.day_of_week} at {t.time_slot}. This is a time-table entry for {t.room}."
        documents.append(Document(page_content=text, metadata={"source": "DB-Timetable", "id": t.id}))

    # 5. Ingest Announcements with Context Tags
    announcements = db.query(models.Announcement).all()
    for a in announcements:
        text = f"[OFFICIAL ANNOUNCEMENT - {a.category}] Title: {a.title}. Content: {a.body}"
        documents.append(Document(page_content=text, metadata={"source": "DB-Announcements", "id": a.id}))

    if not documents:
        return 0

    print(f"Syncing {len(documents)} context-tagged records into ChromaDB...")
    
    # Initialize or load vector store
    vectorstore = Chroma(
        persist_directory=CHROMA_DB_DIR,
        embedding_function=embedding_model
    )
    
    # Add documents
    vectorstore.add_documents(documents)
    vectorstore.persist()
    
    return len(documents)
