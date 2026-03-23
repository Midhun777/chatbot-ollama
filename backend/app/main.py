from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from .database.connection import engine, Base
from .api.routes import auth, admin, student, faculty, chat, announcements, timetable, roadmap

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="EduSphere Web Portal API",
    description="Backend API for the AI-Powered EduSphere Web Portal",
    version="2.0.0"
)

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    body = await request.body()
    print(f"Validation Error for request: {request.url}")
    print(f"Body: {body.decode()}")
    print(f"Errors: {exc.errors()}")
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors(), "body": body.decode()},
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
app.include_router(announcements.router, prefix="/api/announcements", tags=["Announcements"])
app.include_router(timetable.router, prefix="/api/timetable", tags=["Timetable"])
app.include_router(roadmap.router, prefix="/api/roadmap", tags=["AI Roadmap"])

@app.get("/")
def read_root():
    return {"message": "Welcome to EduSphere Web Portal API v2.0"}
