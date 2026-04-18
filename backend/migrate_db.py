import sqlite3

try:
    conn = sqlite3.connect('college_portal.db')
    cursor = conn.cursor()
    cursor.execute("ALTER TABLE faculty ADD COLUMN phone VARCHAR;")
    cursor.execute("ALTER TABLE faculty ADD COLUMN profile_bio VARCHAR DEFAULT '';")
    conn.commit()
    print("Columns added successfully")
except Exception as e:
    print(f"Error adding columns: {e}")
finally:
    conn.close()
