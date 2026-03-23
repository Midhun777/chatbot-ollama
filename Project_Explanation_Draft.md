# Project Explanation Draft

## 1. Project Overview
### What is this project?
This is **EduSphere Web Portal**, an AI‑powered web application that helps students, faculty and admin staff manage college activities like announcements, timetables, roadmaps and an AI chat assistant. It is built with a **FastAPI** backend (Python) and a **React** frontend (JavaScript). The AI features use a Retrieval‑Augmented Generation (RAG) chain to answer student queries.

### What problem does it solve?
- Centralises all college information in one place.
- Provides an AI chatbot that can answer academic questions using the college’s data.
- Lets students view timetables, announcements and create personal roadmaps.
- Gives admin a dashboard to manage content.

### Main features
- **Authentication** – login & signup for students, faculty, admin.
- **Admin Dashboard** – manage announcements, timetables, courses.
- **Student Dashboard** – view personal timetable, announcements, AI chat.
- **AI Chatbot** – powered by a RAG chain (`backend/ai_engine/rag_chain.py`).
- **Roadmap Generator** – AI suggests a study roadmap.
- **Responsive UI** – built with modern React components and CSS.

---
## 2. Technologies Used
| Layer | Technology | Why we use it |
|-------|------------|---------------|
| Frontend | **React (Vite)**, **JavaScript**, **CSS** | Fast, component‑based UI, easy to integrate with API.
| Backend | **FastAPI** (Python) | High‑performance async API, automatic docs.
| Database | **SQLite** (`college_portal.db`) | Simple file‑based DB, good for prototyping.
| AI | **LangChain**, **OpenAI/ollama** (via `ai_engine`) | Provides LLM‑driven chat and RAG.
| Auth | **OAuth2PasswordBearer**, **JWT** | Secure token‑based authentication.
| Testing | **pytest** (backend), **Jest** (frontend) | Automated test suite.

---
## 3. Folder & File Structure
```
chatbot-march-03/
├─ backend/                # Python server
│   ├─ app/                # FastAPI app
│   │   ├─ api/            # Routers (auth, admin, student, …)
│   │   │   └─ routes/     # Individual endpoint files
│   │   ├─ core/           # Core utilities (e.g., email, utils)
│   │   ├─ database/       # DB models & connection
│   │   ├─ schemas/        # Pydantic models (request/response)
│   │   └─ main.py         # FastAPI entry point
│   ├─ ai_engine/          # AI / RAG logic
│   │   └─ rag_chain.py    # Retrieval‑augmented generation chain
│   ├─ college_portal.db    # SQLite DB file
│   └─ requirements.txt    # Python deps
├─ frontend/               # React UI
│   ├─ src/                # Source code
│   │   ├─ App.jsx         # Root component
│   │   ├─ main.jsx        # React entry point
│   │   ├─ index.css       # Global styles
│   │   ├─ components/     # Reusable UI components (Navbar, Card, …)
│   │   ├─ pages/          # Page‑level components (auth, admin, guest)
│   │   │   ├─ auth/       # Login.jsx, Register.jsx
│   │   │   ├─ admin/      # AdminDashboard.jsx
│   │   │   └─ guest/      # GuestDashboard.jsx
│   │   └─ services/       # API call wrappers (axios instances)
│   └─ package.json        # NPM deps & scripts
├─ README.md               # Project description
└─ Project_Explanation.md  # Final documentation (to be generated)
```
- **backend/app/main.py** – creates FastAPI app, adds CORS, includes all routers.
- **backend/app/api/routes/auth.py** – handles `/register` and `/login` with JWT.
- **backend/ai_engine/rag_chain.py** – builds the RAG pipeline for the chatbot.
- **frontend/src/pages/auth/Login.jsx** – UI for user login.
- **frontend/src/pages/auth/Register.jsx** – UI for user signup.
- **frontend/src/pages/admin/AdminDashboard.jsx** – admin UI for managing data.

---
## 4. Data Flow Explanation
1. **User opens the web app** (React runs in browser).
2. **Login/Signup** – React sends a POST request to `/api/auth/login` or `/api/auth/register`.
3. Backend validates credentials, creates a **JWT** and returns it.
4. Browser stores the token (usually in `localStorage`).
5. For any protected request (e.g., fetching announcements), React adds `Authorization: Bearer <token>` header.
6. FastAPI verifies the token, extracts user ID & role, then queries the **SQLite** DB.
7. Data (JSON) is sent back to the frontend, which updates the UI.
8. **AI Chat** – user types a question, React calls `/api/chat/query`.
   - Backend receives the query, passes it to `rag_chain.run()`.
   - RAG chain fetches relevant docs from the DB, sends them to the LLM, gets a response.
   - Response is returned to the UI and displayed.

---
## 5. Database Explanation
- **Database type:** SQLite (`college_portal.db`).
- **Key tables (SQLAlchemy models):**
  - `User` – stores email, password hash, role (student/faculty/admin).
  - `Student` – profile linked to `User` (enrollment_no, name, dept, semester).
  - `Faculty` – similar profile for faculty members.
  - `Announcement`, `Timetable`, `Roadmap` – content that admin can create.
  - `ChatHistory` – optional table to store past AI conversations.
- **How data is stored:** FastAPI uses SQLAlchemy ORM; `Base.metadata.create_all()` creates tables on startup.
- **Retrieval for AI:** RAG reads from `Announcement` and `Timetable` tables to provide context.

---
## 6. Working of Each Feature
### Login / Signup
- **Signup (`/api/auth/register`)** creates a new `User` and a default `Student` profile.
- **Login (`/api/auth/login`)** checks email & password, returns JWT.
- Frontend stores token and redirects to appropriate dashboard based on role.

### Main Functionality
- **Admin Dashboard** – CRUD UI for announcements, timetables, roadmaps. Calls admin routers (`/api/admin/*`).
- **Student Dashboard** – Shows personal timetable, announcements, AI chat. Calls student routers.
- **AI Chatbot** – Uses `backend/ai_engine/rag_chain.py` to fetch relevant docs and generate answer via LLM.
- **Roadmap Generator** – Takes student goals, runs a prompt through LLM, returns a study plan.

---
## 7. API & Backend Logic
- **Routers** (`backend/app/api/routes/*.py`): each file defines a FastAPI `APIRouter` with endpoints.
  - `auth.py` – `/register`, `/login`.
  - `admin.py` – admin CRUD endpoints, protected by `role=admin` dependency.
  - `student.py` – student‑specific data (timetable, profile).
  - `chat.py` – `/query` endpoint that calls `rag_chain.run()`.
- **Dependency Injection** – `Depends(get_db)` provides a DB session per request.
- **Security** – JWT token creation (`create_access_token`) and verification (`OAuth2PasswordBearer`).
- **Error handling** – custom handler for `RequestValidationError` to return useful JSON.

---
## 8. Simple Architecture Diagram (text‑based)
```
[Browser] <--HTTPS--> [React Frontend] <--REST API--> [FastAPI Backend] <--SQLAlchemy--> [SQLite DB]
                                   |
                                   +---> [LangChain / RAG] <--LLM (OpenAI/ollama)
```

---
## 9. How to Explain This in Viva / Presentation
**Script (Manglish):**
```
Good morning/afternoon everyone. Today I will talk about EduSphere Web Portal.

First, this project is a web application that brings together all college activities – announcements, timetables, and an AI chatbot – in one place. It solves the problem of scattered information and helps students get quick answers using AI.

Technically, we used React for the frontend because it lets us build reusable components and talk to the backend via REST. The backend is FastAPI, a modern Python framework that gives us high performance and automatic docs. We store data in SQLite, which is lightweight and easy to set up. For AI, we integrated LangChain with an LLM to create a Retrieval‑Augmented Generation chain that fetches relevant college data before answering.

The folder structure is simple: `backend/` contains the API, models and AI logic, while `frontend/` holds all the React code. When a user logs in, the frontend sends credentials to `/api/auth/login`. The backend validates, creates a JWT token and sends it back. The token is then used for every protected request.

The AI chat works like this: the user types a question, the frontend calls `/api/chat/query`. The backend passes the query to `rag_chain.py`, which pulls relevant documents from the DB, sends them to the LLM, and returns the answer.

In summary, the system is built with modern web technologies, follows a clean separation of concerns, and provides an AI‑enhanced experience for students.

Thank you, and I’m happy to answer any questions.
```

---
## 10. Possible Questions & Answers
| Question | Answer |
|----------|--------|
| **Why did you choose FastAPI over Flask?** | FastAPI is async‑first, gives automatic OpenAPI docs, and has better performance. It also integrates nicely with Pydantic for request validation.
| **How is authentication handled?** | We use JWT tokens. After login, the server returns a signed token which the client stores and sends in the `Authorization` header for subsequent calls.
| **What is RAG and why is it used?** | Retrieval‑Augmented Generation combines a knowledge base (our DB) with a Large Language Model. It ensures the AI answers are grounded in real college data.
| **Can the app scale to a larger database?** | Yes. SQLite is fine for prototyping; for production we can switch to PostgreSQL by changing the SQLAlchemy URL in `database/connection.py`.
| **How do you protect admin routes?** | Admin routers have a dependency that checks the JWT `role` claim; only users with `role='admin'` can access those endpoints.
| **What testing strategy is used?** | Backend uses `pytest` with fixtures to test API endpoints; frontend uses Jest/React Testing Library for component tests.

---
## 11. Improvements
- **Database migration** – integrate Alembic for versioned migrations instead of `create_all()`.
- **Production DB** – move from SQLite to PostgreSQL/MySQL for concurrency.
- **Refresh tokens** – implement token refresh flow for longer sessions.
- **Better UI/UX** – add dark mode, micro‑animations, and improve accessibility.
- **AI cost optimisation** – cache frequent RAG results, limit token usage.
- **CI/CD pipeline** – GitHub Actions to run tests, lint and deploy automatically.
- **Dockerisation** – containerise backend and frontend for easy deployment.
- **Internationalisation** – add i18n support for multiple languages.

---
*End of draft.*
