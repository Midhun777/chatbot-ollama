# EduSphere - Complete Project Explanation 🎓

This is a complete, beginner-friendly guide to understand **EduSphere** (Smart College Web Portal with AI Chatbot). Ee document oru beginner-friendly aayittulla complete guide aanu. Viva time-ilum presentations-ilum use cheyyam.

---

## 1. Project Overview 🌟

### What is this project?
EduSphere is a smart web portal for colleges. Ithil students, faculty, and admins-nu separate logins undu. The main highlight is an **AI Chatbot** that can answer any questions related to the college (like syllabus, rules, fees, etc.) based on documents uploaded by the admin.

### What problem does it solve?
Normal college websites-il oru cheriya notification aariyanamengil, page muzhuvan thappi nadakkanam. This project solves that by bringing everything (Announcements, Timetables, Roadmap generation) into one single dashboard. Pinne, college rules or details aariyan chatbot-nod vach chodichaal mathi – quick answer kittum! 

### Main Features
- **Role-based Logins:** Admin, Faculty, and Student thamil different views.
- **AI Chatbot (RAG):** Smart bot that answers from college documents.
- **Announcements & Timetable:** Easy tracking of college news.
- **AI Roadmap Builder:** Student-nte goals vachoru study plan tharum.
- **Secure:** JWT Tokens use cheythittulla fully secure API.

---

## 2. Technologies Used 🛠️

Project is divided into two parts: Frontend (UI) and Backend (Server & AI).

### Frontend (Client Side)
- **React.js (v18):** Web pages build cheyyan. Easy to create single-page applications (SPA).
- **Vite:** React app run cheyyanum build cheyyanum ulla fast tool. Create-react-app-nekal fast aanu!
- **Tailwind CSS:** Designing and styling-nu vendi. CSS files niranju kidakkunna preshnam illa, direct HTML-il class ezhutham.
- **React Router DOM:** Different pages (e.g., `/login`, `/dashboard`) handle cheyyan.

### Backend (Server Side)
- **FastAPI (Python):** Backend APIs undakkan. Valare fast aanu, and automatically API documentation (`/docs`) tharum.
- **SQLite:** Database aayi use cheyyunnu. Ith files aayi save aavum (no separate server needed). Lightweight and perfect for simple projects.
- **SQLAlchemy:** Python code vazhi Database-il ulla tables create cheyyanum queries run cheyyanum (ORM).
- **JWT (JSON Web Tokens):** User login aayo ennu check cheyyan ulla secure token system.

### AI & Chatbot Engine
- **LangChain:** AI model-neyum nammude data-yeyum connect cheyyunna framework.
- **Ollama (Local LLM):** Internet illathe local aayi AI model run cheyyan use cheyyunnu. Usually LLaMA3 or Mistral. Data privacy kittum!
- **ChromaDB:** Documents okke vector-aayi (numbers) save cheyyunna Vector Database (RAG implement cheyyan).
- **HuggingFace Embeddings:** Text-ne numbers-aayi (vectors) convert cheyyan.

---

## 3. Folder & File Structure 📁

Muzhuvan code-um 2 main folders-il aanu: `frontend` and `backend`.

```text
chatbot-march-03/
├── backend/                  👉 Python Backend Server
│   ├── app/                  
│   │   ├── api/routes/       👉 APIs-nte routes (auth.py, chat.py, admin.py)
│   │   ├── database/         👉 DB connection and Table definitions (models.py)
│   │   ├── schemas/          👉 Data validation shapes (using Pydantic)
│   │   └── main.py           👉 Backend start aavunna main file !
│   │
│   ├── ai_engine/            👉 AI & RAG logic (rag_chain.py, ingest.py)
│   └── college_portal.db     👉 The actual SQLite database file
│
├── frontend/                 👉 React UI (Student/Admin screens)
│   ├── src/
│   │   ├── pages/            👉 Screens (Login.jsx, StudentDashboard.jsx)
│   │   ├── components/       👉 UI parts like Navbar, Buttons
│   │   ├── context/          👉 AuthContext (User login aano ennu aariyan)
│   │   └── App.jsx           👉 Frontend routing here!
│   └── package.json          👉 React npm dependencies
│
└── README.md                 👉 How to run the app instructions
```

---

## 4. Data Flow Explanation 🔄

### How data moves from frontend to backend to database?

Let's take an example: **"User logging in"**

1. **User action:** Student `email` & `password` type cheythitt Login button click cheyyunnu. (Frontend)
2. **API Call:** React fetches the backend API `POST /api/auth/login` and sends the data.
3. **Backend validation:** FastAPI receives this data. It checks the `college_portal.db` (Database) checking if this user exists and password is correct.
4. **Token Generation:** Match aanengil backend oru securely signed **JWT Token** create cheyth frontend-nu thirichu kodukkum.
5. **Storage:** Frontend aa token localStorage-il save cheyyum. Iniyulla questions / actions-nu ee token automatically backend-lekku povum.

---

## 5. Database Explanation 🗄️

**Database Used:** SQLite (`college_portal.db`)  
**ORM Used:** SQLAlchemy (Python classes-ne DB tables aakkunnu)

### Main Tables (Collections):
1. **User:** Contains `id`, `email`, `password_hash`, `role` (Admin, Student, Faculty). Everyone who logs in has a row here.
2. **Student:** Extra details strictly for students (`department`, `enrollment_number`). Links to User table.
3. **Faculty:** Extra details for teachers (`department`, `designation`). Links to User table.
4. **Announcement / Timetable:** Admin idunnu messages and schedules save cheyyunna tables.
5. **ChatHistory:** User-um AI-um thammilulla samsaram save cheythu vekkan.

*When we run `main.py`, SQLAlchemy automatic aayi ee tables `college_portal.db`-il create cheyyum.*

---

## 6. Working of Each Feature ⚙️

### 1. Login / Signup Flow
- **Signup:** Registration form vazhi data koduthal passowrd hash cheythu (secure aaki) DB-il save cheyyum. Default aayi Student role assign cheyyum.
- **Login:** Email/Password check cheyum. Correct aanengil JWT token varum. Frontend AuthContext update aavum -> Dashboard-il kerum.

### 2. Administrator Panel
- Admin dashboard-il login aakumbol, DB-il ulla Announcements, Timetables, Users data fetch cheyyum.
- Admin can upload PDFs. Upload cheyyumbol athu text aayi extract aayi vectors-aayi ChromaDB-il kerum (AI-ku answer parayan vendi).

### 3. AI Chatbot (Main Feature) - *How it works step-by-step*
1. **Student Question:** Student asks "What is the fee for BTech?"
2. **API Call:** API hits `/api/chat/ask`.
3. **Embeddings:** Question-ne numbers-aayi (Embeddings) convert cheyyum.
4. **Similarity Search (ChromaDB):** Database-il nokuuka "BTech fees"-num aayi match aavunna information vella document-ilum undo?
5. **Context Fetch:** Athu kandu pidicha document paragraphs (chunks) eduth LLM-lekku (Ollama Llama3) kodukkum. "Ey LLM, idhaanu documents, idhaanu user question. Answer para."
6. **Generation:** AI smart aayi oru summary undaki thirich tharum.

### 4. Roadmap Generation
Student says "I want to be a Web Developer". API connects to LLM, asks for a step-by-step roadmap, and displays it nicely on the UI.

---

## 7. API & Backend Logic 🌐

Backend is fully running on FastAPI. Every feature has its own file in `routes`.

- **`auth.py`:** Handles `/api/auth/login` and `/api/auth/register`. Token generation logic is here.
- **`chat.py`:** `/api/chat/ask` API undu. This is the bridge between the Frontend and the AI Engine (`rag_chain.py`).
- **`admin.py`:** APIs for adding documents, modifying users. Protected by role check -> ONLY admin can access these APIs.
- **`student.py`:** APIs to fetch announcements and timetables for students.

**Middlewares & Security:** Ellam APIs-ilum (except login/register) `Depends(get_current_user)` undu. Ithoru logic aanu that makes sure token valid aanengil mathrame data backend tharullu.

---

## 8. Simple Architecture Diagram 📊

Use this simple mental map or draw on board:

```text
+-----------------------+           +-----------------------+           +----------------------+
|                       |  (JSON)   |                       | (SQL)     |                      |
|    React Frontend     | <=======> |    FastAPI Backend    | <=======> |  SQLite Database     |
|   (UI, Dashboards)    |  REST API |  (Logic, Auth, API)   |           |  (Users, Timetable)  |
|                       |           |                       |           |                      |
+-----------------------+           +-------+-------+-------+           +----------------------+
                                            |       ^
                               (Context &   |       | (Answer)
                                Question)   v       |
                                    +-----------------------+
                                    |    LangChain +        | <====> ChromaDB (Vector DB for PDFs)
                                    |    Ollama (LLM)       | 
                                    +-----------------------+
```

---

## 9. How to Explain This in Viva / Presentation 🎤

A detailed Viva script to sound highly professional and knowledgeable:

**Introduction:**
> "Good morning everyone. This is our project, **EduSphere - A Smart College Web Portal**. The main goal of this project is to centralize college operations and provide an intelligent assistant for students. Normal college sites don't have interactive ways to get queries solved. So, we integrated an AI Chatbot into our portal."

**Technology Stack:**
> "For the frontend UI, we chose **React** with **Vite** because it's components-based and extremely fast. For the backend, we used **FastAPI (Python)**. Since AI processing is mostly in Python, FastAPI was the best choice. For the database, we went with **SQLite** managed by SQLAlchemy ORM. Our AI engine is powered by **LangChain** and a local LLM via **Ollama** for data privacy."

**How it works (The Core Logic):**
> "Our application uses a modern architecture. When an admin uploads a college document, LangChain splits the text, generates vector embeddings using HuggingFace models, and saves it in ChromaDB Vector Database. 
> When a student asks a question to the Chatbot, the system checks ChromaDB for the most relevant context and passes it to the Ollama LLM to generate an accurate answer. This is called **RAG (Retrieval-Augmented Generation)** methodology."

**Conclusion:**
> "In short, EduSphere is not just a standard CRUD application. It's an intelligent AI-enhanced portal that saves time for both admins and students."

---

## 10. Possible Viva Questions & Answers ❓

**Q1: Why did you use FastAPI instead of Django or Node.js?**
> **Answer:** FastAPI is built for high performance and async operations. Since we are integrating AI libraries like LangChain (which are Python-native), using a Python backend makes sense. FastAPI is lighter than Django and faster.

**Q2: What is JWT? How are you handling login?**
> **Answer:** JWT stands for JSON Web Token. When a user logs in, the backend verifies credentials and returns a signed token. We store this in the frontend and send it in the header for every future request to prove the user is authenticated. 

**Q3: Explain what RAG means in your project?**
> **Answer:** RAG stands for Retrieval-Augmented Generation. Instead of training a model from scratch, we store our college PDFs in a Vector Database (ChromaDB). When a user asks a question, we *retrieve* the actual PDF text related to the question and give it to the AI to *generate* the answer.

**Q4: Where is the data stored?**
> **Answer:** Relational data like user details and announcements are in a local SQLite file (`college_portal.db`). The uploaded PDF text embeddings are stored in ChromaDB (a vector database).

**Q5: Will this app work without the internet?**
> **Answer:** Yes! Because we are using **Ollama** to run the LLM locally on the machine, and SQLite for the database, the whole application can run completely offline on a local network.

---

## 11. Improvements (Future Scope) 🚀
What else can be added to make this better?
1. **PostgreSQL/MySQL integration:** Instead of SQLite, use a cloud database like AWS RDS or Supabase for a larger scale.
2. **Email Notifications:** Automatic emails when an assignment or announcement is added.
3. **Payment Gateway:** Fee payment portal integration for students.
4. **Cloud LLM (Optional):** Integrating OpenAI APIs or Gemini APIs if the local server doesn't have a good GPU to run Ollama quickly.

---

*This document contains everything needed to understand the code, the concepts and to present the project with confidence. Happy Coding!* 🎓
