from app.database.connection import SessionLocal
from app.database import models
from datetime import datetime, timedelta

db = SessionLocal()

admin = db.query(models.User).filter(models.User.role == 'admin').first()
if admin:
    logs = [
        models.AdminAuditLog(admin_id=admin.id, action="System Initialization", target="ChromaDB", timestamp=datetime.utcnow() - timedelta(hours=2)),
        models.AdminAuditLog(admin_id=admin.id, action="Approved Faculty", target="faculty@college.edu", timestamp=datetime.utcnow() - timedelta(hours=1)),
        models.AdminAuditLog(admin_id=admin.id, action="Changed Role", target="student@college.edu (to Faculty)", timestamp=datetime.utcnow() - timedelta(minutes=30)),
    ]
    db.add_all(logs)
    db.commit()
    print("Seed logs created successfully.")
else:
    print("No admin user found to associate logs with.")
db.close()
