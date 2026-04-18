import requests

req = requests.post("http://localhost:8000/api/auth/register", json={
    "email": "alan5@edu.in",
    "password": "password123",
    "first_name": "Alan",
    "last_name": "Turing",
    "role": "faculty"
})
print("STATUS CODE:", req.status_code)
print("RESPONSE:", req.text)
