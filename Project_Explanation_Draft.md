# Project Explanation (Simple Language)

## 1. What is this project?
This is **EduSphere**, a web app for college students and staff. It lets you see announcements, timetables, and talk to an AI chatbot that can answer questions about the college.

## 2. Why did we build it?
- All college info in one place.
- Students get quick answers from AI.
- Easy for admin to add news or schedules.

## 3. Main things it can do
- **Login / Sign‑up** – create an account and get a token.
- **Admin panel** – add / edit announcements, timetables.
- **Student view** – see your timetable, read announcements.
- **AI chat** – ask questions, get answers from the AI.
- **Roadmap** – AI suggests a study plan.

## 4. What tools we used
| Part | Tool | Why |
|------|------|-----|
| Frontend | React (JavaScript) | Easy to build interactive UI.
| Backend | FastAPI (Python) | Fast, async API with automatic docs.
| Database | SQLite file | Simple, no server needed for prototype.
| AI | LangChain + LLM (OpenAI/ollama) | Gives the chatbot smart answers.
| Auth | JWT tokens | Secure way to keep users logged in.

## 5. Folder layout (simple view)
```
chatbot-march-03/
├─ backend/          # Python server
│   ├─ app/          # FastAPI code
│   │   ├─ api/      # API routes (auth, admin, student, chat…)
│   │   ├─ database/ # DB models and connection
│   │   ├─ schemas/  # Request/response shapes
│   │   └─ main.py   # Starts the FastAPI app
│   ├─ ai_engine/    # AI logic (RAG chain)
│   └─ college_portal.db # SQLite DB file
├─ frontend/         # React UI
│   ├─ src/          # Source code
│   │   ├─ components/   # Reusable UI parts (Navbar, Card…)
│   │   ├─ pages/        # Page components (login, admin, student)
│   │   └─ services/     # API call helpers
│   └─ package.json  # NPM dependencies
└─ README.md
```
- `backend/app/main.py` – creates FastAPI app, adds CORS, includes all routers.
- `backend/app/api/routes/auth.py` – handles **/register** and **/login**.
- `backend/ai_engine/rag_chain.py` – builds the AI answer pipeline.
- `frontend/src/pages/auth/Login.jsx` – login screen UI.
- `frontend/src/pages/auth/Register.jsx` – signup screen UI.
- `frontend/src/pages/admin/AdminDashboard.jsx` – admin dashboard UI.

## 6. How data moves (step by step)
1. User opens the web page (React runs in browser).
2. User logs in → React sends POST to **/api/auth/login**.
3. Backend checks email/password, returns a **JWT** token.
4. Browser stores token (e.g., localStorage).
5. For any later request (e.g., get announcements) React adds `Authorization: Bearer <token>` header.
6. Backend verifies token, reads data from SQLite, sends JSON back.
7. UI updates with the data.
8. For AI chat: user types a question → React calls **/api/chat/query**.
   - Backend passes question to `rag_chain.run()`.
   - RAG fetches relevant docs from DB, asks the LLM, gets answer.
   - Answer is sent back and shown in chat window.

## 7. Database basics
- **Type:** SQLite file `college_portal.db`.
- **Key tables:**
  - `User` – stores email, password hash, role (student/admin/faculty).
  - `Student` – extra info for student users.
  - `Faculty` – extra info for faculty users.
  - `Announcement`, `Timetable`, `Roadmap` – content that admin creates.
- FastAPI uses SQLAlchemy ORM; tables are created automatically when the app starts.

## 8. How each feature works (simple)
- **Signup:** POST `/api/auth/register` creates a new `User` and a default `Student` profile.
- **Login:** POST `/api/auth/login` checks credentials, returns JWT.
- **Admin Dashboard:** Calls admin routes to add/edit announcements, timetables, etc.
- **Student Dashboard:** Calls student routes to fetch personal data.
- **AI Chat:** Calls chat route, which runs the RAG chain to give a smart answer.
- **Roadmap:** Sends user goals to AI, AI returns a study plan.

## 9. API quick view
- Each feature has its own router file under `backend/app/api/routes/`.
- Example: `auth.py` defines `/register` and `/login`.
- All routers are included in `main.py` with a prefix like `/api/auth`.
- Security: JWT token is checked on protected routes.

## 10. Simple diagram (text)
```
[Browser] <--HTTPS--> [React Frontend] <--REST--> [FastAPI Backend] <--SQLAlchemy--> [SQLite DB]
                                 |
                                 +---> [LangChain / LLM] (AI)
```

## 11. How to talk about this in a viva (Manglish)
```
Hello everyone, today I will explain EduSphere.

First, this is a web app for college. It shows announcements, timetables and also has an AI chatbot.

We used React for the front end because it is easy to build interactive pages. The back end is FastAPI in Python – it is fast and gives us automatic API docs. Data is stored in a simple SQLite file.

When a user logs in, the front end sends the credentials to `/api/auth/login`. The server checks them, creates a JWT token and sends it back. The token is then used for all other requests.

The AI chat works by sending the user question to `/api/chat/query`. The server runs a Retrieval‑Augmented Generation chain that first pulls relevant college data from the DB, then asks a large language model for an answer.

In short, the system combines a modern web front end, a fast Python API, a lightweight database and an AI component to give students a single place for all college information.

Thank you.
```

---
*End of simple draft.*
