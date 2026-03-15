@echo off
echo ==========================================
echo Starting AI-Powered Smart College Portal
echo ==========================================

echo Starting Python FastAPI Backend...
start cmd /k "cd backend && call venv\Scripts\activate && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

echo Starting Vite React Frontend...
start cmd /k "cd frontend && npm run dev"

echo.
echo ==========================================
echo All services are starting up!
echo Backend API available at: http://localhost:8000
echo Frontend UI available at: http://localhost:5173 
echo Default Login Admin: admin@college.edu / admin123
echo ==========================================
echo Welcome Midhun Mathew to the Antigravity Workstation
echo Keep these command windows open while testing.
pause
