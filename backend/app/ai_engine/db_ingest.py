from sqlalchemy.orm import Session
from app.database import models
from langchain.schema import Document
from langchain_community.vectorstores import Chroma
import os

# Configuration paths (consistent with ingest.py)
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data")
CHROMA_DB_DIR = os.path.join(DATA_DIR, "chromadb")

def get_institution_info():
    """Returns hardcoded institution info as a Document."""
    info = """
    EduSphere Web Portal - Institutional Information
    Location: Ernakulam, Kochi, Kerala, India.
    Campus: Main Campus is located at Marine Drive, Kochi.
    Contact: info@edusphere.edu | +91 484 2345678
    Departments: Computer Science, Civil Engineering, Mechanical Engineering, Electrical & Electronics.
    Vision: To be a global leader in AI-driven education and institutional management.
    """
    return Document(page_content=info, metadata={"source": "Institutional-Meta"})

def ingest_database_records(db: Session, embedding_model):
    """
    Pulls records from the database, converts to text documents, 
    and adds them to ChromaDB.
    """
    documents = []

    # 1. Hardcoded Institution Info
    documents.append(get_institution_info())

    # 2. Ingest Courses
    courses = db.query(models.Course).all()
    for c in courses:
        text = f"Course Catalog Info: The course {c.course_name} (Code: {c.course_code}) is offered by the {c.department} department and carries {c.credits} credits."
        documents.append(Document(page_content=text, metadata={"source": "DB-Courses", "id": c.id}))

    # 3. Ingest Faculty
    faculty = db.query(models.Faculty).all()
    for f in faculty:
        text = f"Faculty Directory: {f.first_name} {f.last_name} is a {f.designation} in the {f.department} department."
        documents.append(Document(page_content=text, metadata={"source": "DB-Faculty", "id": f.id}))

    # 4. Ingest Timetable
    timetable = db.query(models.Timetable).all()
    for t in timetable:
        text = f"Timetable Entry: In the {t.department} department (Semester {t.semester}), there is a class for {t.subject_name} ({t.subject_code}) on {t.day_of_week} at {t.time_slot}. The class is held in {t.room} and taught by {t.faculty_name}."
        documents.append(Document(page_content=text, metadata={"source": "DB-Timetable", "id": t.id}))

    # 5. Ingest Announcements
    announcements = db.query(models.Announcement).all()
    for a in announcements:
        text = f"Official Announcement [{a.category}]: {a.title}. Content: {a.body}"
        documents.append(Document(page_content=text, metadata={"source": "DB-Announcements", "id": a.id}))

    if not documents:
        return 0

    print(f"Syncing {len(documents)} database records into ChromaDB...")
    
    # Initialize or load vector store
    vectorstore = Chroma(
        persist_directory=CHROMA_DB_DIR,
        embedding_function=embedding_model
    )
    
    # Add documents (This upserts based on metadata/content if needed, 
    # but here we just add them. For a production system, we'd check for duplicates.)
    vectorstore.add_documents(documents)
    vectorstore.persist()
    
    return len(documents)
