from app.database.connection import engine, Base
from app.database.models import AdminAuditLog
import sys, os

print("Creating AdminAuditLog table...")
AdminAuditLog.__table__.create(bind=engine, checkfirst=True)
print("Table created successfully!")
