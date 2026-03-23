import requests

data = {
    "email": "mighjdmat4828@gmail.com",
    "password": "password",
    "role": "student",
    "first_name": "Midhun",
    "last_name": "Mathew",
    "department": "Electrical Engineering",
    "id_number": "12345678"
}

resp = requests.post("http://localhost:8000/api/auth/register", json=data)
print(resp.status_code)
print(resp.json())
