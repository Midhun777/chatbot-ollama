from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database.connection import engine, Base
from .api.routes import auth, admin, student, faculty, chat

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Smart College Web Portal API",
    description="Backend API for the AI-Powered Smart College Web Portal",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", 
        "http://localhost:5174", 
        "http://localhost:5175",
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(student.router, prefix="/api/student", tags=["Student"])
app.include_router(faculty.router, prefix="/api/faculty", tags=["Faculty"])
app.include_router(chat.router, prefix="/api/chat", tags=["AI Chatbot System"])

@app.get("/")
def read_root():
    return {"message": "Welcome to Smart College Web Portal API"}
