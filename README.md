# 🎓 Smart College Web Portal — AI Chatbot

An AI-powered Smart College Web Portal featuring a RAG-based chatbot built with **FastAPI**, **React**, **LangChain**, and **Ollama** for local LLM inference. The system provides role-based access for Admins, Faculty, and Students, with an intelligent assistant capable of answering queries from uploaded documents.

---

## ✨ Features

- 🤖 **AI Chatbot** powered by local LLMs via [Ollama](https://ollama.com/) and LangChain RAG pipeline
- 🔐 **JWT Authentication** with role-based access (Admin / Faculty / Student)
- 📚 **Document Upload & Indexing** using ChromaDB vector store and HuggingFace embeddings
- 💬 **Persistent Chat History** per user session
- 👨‍🏫 **Faculty Dashboard** — manage courses, upload materials
- 🎓 **Student Dashboard** — view courses, access AI assistant
- 🛡️ **Admin Panel** — user management and portal configuration
- ⚡ **Fast & Modern** — Vite + React frontend with Tailwind CSS

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | FastAPI, SQLAlchemy, SQLite |
| AI Engine | LangChain, Ollama (local LLM), ChromaDB |
| Embeddings | HuggingFace `sentence-transformers` |
| Auth | JWT (python-jose), bcrypt (passlib) |

---

## 📁 Project Structure

```
chatbot-march-03/
├── backend/
│   ├── app/
│   │   ├── api/routes/        # Auth, Admin, Student, Faculty, Chat routes
│   │   ├── core/              # Security (JWT, hashing)
│   │   ├── database/          # SQLAlchemy models & connection
│   │   └── schemas/           # Pydantic schemas
│   ├── ai_engine/             # RAG chain, document loader, Ollama integration
│   ├── data/                  # Uploaded docs & ChromaDB vector store
│   ├── requirements.txt
│   └── main.py
├── frontend/
│   ├── src/
│   │   ├── pages/             # Admin, Faculty, Student pages
│   │   ├── components/        # Shared UI components
│   │   ├── context/           # Auth context
│   │   └── services/          # API service layer
│   ├── index.html
│   └── vite.config.js
├── start_servers.bat          # One-click startup script (Windows)
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- [Python 3.10+](https://www.python.org/)
- [Node.js 18+](https://nodejs.org/)
- [Ollama](https://ollama.com/) installed and running locally
- A supported LLM pulled via Ollama (e.g., `llama3`, `mistral`)

### 1. Clone the Repository

```bash
git clone https://github.com/Midhun777/chatbot-ollama.git
cd chatbot-ollama
```

### 2. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Create a .env file
cp .env.example .env         # then edit with your values
```

**.env example:**
```env
SECRET_KEY=your_super_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3
```

Start the backend server:
```bash
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`.

### 4. Start Ollama

```bash
# Pull your preferred model
ollama pull llama3

# Ollama runs automatically on http://localhost:11434
```

### 5. One-Click Start (Windows)

```bash
start_servers.bat
```

This script starts both the FastAPI backend and Vite frontend simultaneously.

---

## 🔌 API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/login` | Login and receive JWT token |
| `POST` | `/api/auth/register` | Register a new user |
| `GET` | `/api/student/dashboard` | Student dashboard data |
| `GET` | `/api/faculty/courses` | Faculty course list |
| `POST` | `/api/chat/ask` | Send a message to the AI chatbot |
| `GET` | `/api/chat/history` | Retrieve chat history for the logged-in user |
| `POST` | `/api/admin/upload` | Upload documents for RAG indexing |

> Full interactive API docs: `http://localhost:8000/docs`

---

## 🤖 How the AI Chatbot Works

1. **Document Upload** — Admin/Faculty upload PDF/text files via the portal.
2. **Indexing** — LangChain splits documents into chunks and embeds them using HuggingFace `sentence-transformers`, stored in **ChromaDB**.
3. **Query** — When a student asks a question, the RAG chain retrieves the most relevant chunks from ChromaDB.
4. **Response** — The retrieved context is sent to the local **Ollama** LLM, which generates a grounded answer.
5. **History** — All messages are saved to the SQLite database and reloaded on next login.

---

## 🛡️ Roles & Permissions

| Role | Capabilities |
|------|-------------|
| **Admin** | Manage users, upload documents, configure portal |
| **Faculty** | View/manage assigned courses, upload materials |
| **Student** | View courses, chat with AI assistant, view chat history |

---

## 🧪 Running Tests

```bash
cd backend
python test_chat_api.py
python test_rag_debug.py
```

---

## 📦 Dependencies

**Backend** (`requirements.txt`):
- `fastapi`, `uvicorn` — API server
- `sqlalchemy` — ORM
- `python-jose`, `passlib` — Auth & security
- `langchain`, `langchain-community`, `langchain-huggingface` — AI pipeline
- `chromadb` — Vector store
- `pypdf` — PDF parsing
- `sentence-transformers` — Document embeddings
- `python-dotenv` — Environment config

**Frontend** (`package.json`):
- `react`, `react-dom` — UI framework
- `vite` — Build tool & dev server
- `tailwindcss` — Utility-first CSS

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🙌 Acknowledgements

- [Ollama](https://ollama.com/) for making local LLM inference simple
- [LangChain](https://www.langchain.com/) for the RAG framework
- [FastAPI](https://fastapi.tiangolo.com/) for the blazing-fast Python API layer
- [ChromaDB](https://www.trychroma.com/) for the vector database
