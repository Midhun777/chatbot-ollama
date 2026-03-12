import requests

BASE_URL = 'http://localhost:8000/api'

try:
    # 1. Login to get token
    print('Attempting login...')
    res = requests.post(f'{BASE_URL}/auth/login', data={'username': 'admin@college.edu', 'password': 'admin123'})
    res.raise_for_status()
    token = res.json()['access_token']
    print('Login successful!')

    # 2. Call chat endpoint
    headers = {'Authorization': f'Bearer {token}'}
    print('Sending POST /chat/query ...')
    res_chat = requests.post(f'{BASE_URL}/chat/query', json={'message': 'hi'}, headers=headers)
    print(f'Status: {res_chat.status_code}')
    print(f'Response: {res_chat.text}')
except Exception as e:
    print(f'Error: {e}')
