import requests
import json

data = {
    "email": "newuser55@college.edu",
    "password": "password",
    # "role": "student", # Removed
    "first_name": "New",
    "last_name": "User",
    # "department": "Computer Science", # Removed
    # "id_number": "STU-99999" # Removed
}

try:
    resp = requests.post("http://localhost:8000/api/auth/register", json=data)
    print("STATUS:", resp.status_code)
    print("BODY:", resp.json())
except Exception as e:
    print("ERROR:", e)
