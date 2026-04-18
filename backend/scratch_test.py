import requests
import json

base_url = "http://localhost:8000/api"

def test_admin_apis():
    # Login
    print("Logging in...")
    login_data = {
        "username": "admin@college.edu",
        "password": "admin123"
    }
    resp = requests.post(f"{base_url}/auth/login", data=login_data)
    if resp.status_code != 200:
        print("Login failed:", resp.status_code, resp.text)
        return
    token = resp.json().get("access_token")
    headers = {"Authorization": f"Bearer {token}"}
    print("Login successful. Token acquired.")

    # Test stats
    resp = requests.get(f"{base_url}/admin/stats", headers=headers)
    print("Stats:", resp.status_code, resp.json())
    
    # Test students
    resp = requests.get(f"{base_url}/admin/students", headers=headers)
    print("Students:", resp.status_code, "Items:", len(resp.json()) if resp.status_code==200 else resp.text)

    # Test users
    resp = requests.get(f"{base_url}/admin/users", headers=headers)
    print("Users:", resp.status_code, "Items:", len(resp.json()) if resp.status_code==200 else resp.text)

if __name__ == "__main__":
    test_admin_apis()
