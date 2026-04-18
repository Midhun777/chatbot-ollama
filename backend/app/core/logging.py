from sqlalchemy.orm import Session
from ..database import models
from datetime import datetime

def log_system_activity(db: Session, user_id: int, action: str, target: str):
    """
    Records a system or administrative activity in the audit logs.
    """
    try:
        log_entry = models.AdminAuditLog(
            admin_id=user_id,
            action=action,
            target=target,
            timestamp=datetime.utcnow()
        )
        db.add(log_entry)
        db.commit()
    except Exception as e:
        print(f"Error logging activity: {e}")
        db.rollback()
