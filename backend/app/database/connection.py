from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os

from dotenv import load_dotenv
load_dotenv()

# We will use SQLite for local development ease unless Postgres is running
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./college_portal.db")

# If using sqlite, check_same_thread needs to be false
engine_args = {"check_same_thread": False} if "sqlite" in DATABASE_URL else {}

engine = create_engine(DATABASE_URL, connect_args=engine_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
