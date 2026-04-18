from app.database.connection import SessionLocal
from app.database import models

db = SessionLocal()
try:
    admin = db.query(models.User).first()
    print("User found:", admin.email if admin else "None")
except Exception as e:
    print("ERROR:", e)
