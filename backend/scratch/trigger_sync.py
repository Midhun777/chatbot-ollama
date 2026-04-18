import sys
import os

# Add root to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from app.database.connection import SessionLocal
from app.ai_engine.ingest import ingest_all_knowledge

def run_ingestion():
    db = SessionLocal()
    try:
        print("Starting Knowledge Synchronization (PDFs + Database)...")
        total = ingest_all_knowledge(db=db)
        print(f"SUCCESS: Synchronized {total} knowledge blocks into ChromaDB.")
    except Exception as e:
        print(f"ERROR: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    run_ingestion()
