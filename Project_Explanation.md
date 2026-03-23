# 🎓 Smart College Web Portal — AI Chatbot: Complete Project Guide
*(A beginner-friendly explanation of your entire project)*

## 1. Project Overview 🌟
### What is this project?
This project is an **AI-powered Smart College Web Portal**. It's like a complete college management system but with a super-smart AI assistant (chatbot) built inside it. 
*(Manglish: Ithu oru college management portal aanu, koode oru smart AI chatbot-um undu.)*

### What problem does it solve?
Usually, students have to search through tons of college PDFs, notices, and documents to find simple answers (like "When is the exam?", "How to get a bonafide certificate?"). This project solves that by letting students just **chat with the portal** to get answers instantly! 

### Main Features:
- **Role-based Logins:** Separate dashboards for Admin, Faculty, and Students.
- **Smart AI Chatbot:** Answers questions based on documents uploaded by the college.
- **Document RAG System:** Admins can upload PDFs/notices, and the AI "reads" them to answer student queries.
- **Personalized Queries:** Students can ask about their attendance or marks, and the chatbot fetches it securely from the database.

---

## 2. Technologies Used 💻
We divided the project into a Frontend (what the user sees) and a Backend (the brain and database).

### Frontend (User Interface)
- **React.js & Vite:** Used to build the website fast. React makes it easy to create reusable components like buttons and navbars.
- **Tailwind CSS:** Used for styling and making the app look beautiful without writing long CSS files.

### Backend (Server & API)
- **FastAPI (Python):** This is our backend framework. It receives requests from the frontend and sends back data. *Why? Because it's super fast, great for AI, and easy to connect with databases.*
- **SQLite & SQLAlchemy:** SQLite is our database (where data is saved), and SQLAlchemy is the ORM (a tool that lets us write Python code instead of raw SQL queries to talk to the database).

### AI Engine (The Brain 🧠)
- **LangChain:** A tool that connects our chatbot to our documents.
- **Ollama (Llama 3.2):** This is the **Local LLM** (Large Language Model). Instead of paying for ChatGPT, we run a mini ChatGPT directly on our own computer for free and with full privacy!
- **ChromaDB:** A special "Vector Database". It stores text in a mathematical format so the AI can search through it quickly.
- **HuggingFace Embeddings:** Converts English sentences into numbers (vectors) before saving them to ChromaDB.

---

## 3. Folder & File Structure 📂
### Backend Directory (`/backend`)
Handles the server and AI logic.
- `app/api/routes/`: Contains different files for different API endpoints (e.g., `chat.py` for chatbot, `auth.py` for login).
- `app/database/models.py`: Defines our database tables (Users, Students, Courses).
- `app/main.py`: The starting point of our server.
- `ai_engine/rag_chain.py`: Contains the LangChain logic to retrieve documents and ask Ollama the question.
- `data/chromadb/`: The folder where our vector database saves the uploaded documents.

### Frontend Directory (`/frontend/src`)
Handles what the user sees on the screen.
- `pages/`: Contains the screens for the app (`Login.jsx`, `StudentDashboard.jsx`, `Timetable.jsx`).
- `components/`: Contains reusable UI parts (like `Navbar.jsx`).
- `App.jsx`: The main router that decides which page to show based on the URL.

---

## 4. Data Flow Explanation 🔄
How does a message travel from the user to the database and back?

**Step-by-step Example: A student asks the chatbot: "How do I apply for hostel?"**
1. **Frontend:** The student types the message and clicks send. React sends a `POST` request to the backend API (`/api/chat/query`).
2. **Backend Route (`chat.py`):** FastAPI receives this message. First, it checks the "intent" (is the student asking for a form, personal info, or a general question?). 
3. **Keyword Matching:** It sees the keyword "hostel" and checks if there is a Hostel Form in the SQL database.
4. **AI Processing:** If a form is found, it sends the form link back. If not, it sends the question to `rag_chain.py`.
5. **RAG & Vector DB:** `rag_chain` searches `ChromaDB` for paragraphs related to "hostel". 
6. **Ollama LLM:** The matched paragraphs + the student's question are sent to Ollama (Llama 3.2). Ollama generates a human-like answer.
7. **Response:** FastAPI sends Ollama's answer back to the React frontend, and the student sees the reply on their screen!

---

## 5. Database Explanation 🗄️
We use **SQLite**. It is a lightweight, file-based database.

### Important Tables (Collections)
1. **Users:** Stores login emails, passwords (hashed/encrypted), and roles (Admin/Student/Faculty).
2. **Students & Faculty:** Linked to the Users table. Stores personal info (Enrollment No, Department, CGPA).
3. **Courses:** Stores subjects and links them to Faculty.
4. **Attendance & Marks:** Links a Student to a Course.
5. **DocumentForm:** Stores the metadata (titles, file paths) of PDFs uploaded by the admin.
6. **ChatMessage:** Saves every question and answer so the student can see their chat history when they log back in.

*(Manglish: Namukku main aayi 2 databases undu. Oru normal SQLite database user details save cheyyan, pinne oru ChromaDB documents search cheyyan vendi.)*

---

## 6. Working of Each Feature ⚙️

### Login / Signup
- User enters Email and Password. Backend hashes the password to check if it matches the DB. If yes, it creates a **JWT Token** (a secure digital ID card) and sends it to the frontend. The frontend saves it and uses it for future requests.

### Documents Upload (Admin)
- Admin logs in -> Uploads a PDF.
- The file is saved on the server. The data inside the PDF is chopped into small pieces (chunks), converted to embeddings (numbers), and saved inside ChromaDB.

### Smart AI Chatbot (Student)
The chatbot has 3 "Paths":
1. **Form Downloader:** Checks for words like "download form", "hostel", "admission". If found, it fetches the PDF automatically.
2. **Personal DB Query:** If the user asks "What is my attendance?", the backend connects to the SQLite database and tells them their exact attendance.
3. **RAG Inference:** For general questions ("What are the library timings?"), it searches ChromaDB and asks Ollama to generate an intelligent answer.

---

## 7. API & Backend Logic 🔌
APIs are the bridges between frontend and backend.
- `GET /api/student/dashboard`: Fetches student details.
- `POST /api/chat/query`: The main AI endpoint. It takes the message, processes it via Langchain/Ollama, saves the chat history to the database, and returns the AI's reply.
- `GET /api/chat/history`: Pulls past messages from the `chat_messages` table to show on the screen.

---

## 8. Simple Architecture Diagram 🏗️
```text
[ React.js Frontend ] 
        |
    (HTTP/JSON API requests over Network)
        |
        v
[ FastAPI Backend Application ]
        |
        +---> [ System Router (chat.py) ]
                    |
      +-------------+-------------+
      |                           |
[ SQLite DB ]               [ AI Engine (LangChain) ]
(Users, Marks)                    |
                            +-----+-----+
                            |           |
                     [ ChromaDB ]   [ Ollama (Llama3) ]
                    (PDF vectors)   (Brain/Generator)
```

---

## 9. How to Explain This in Viva / Presentation 🎤
*(Here is a mixed English-Manglish script you can use to impress the examiner!)*

**Introduction:**
"Good morning everyone. Ee project-inte peru **Smart College Web Portal**. Ithu sadharana oru college management system pole aanu, pakshe idhil main highlight nammude **AI Chatbot** aanu. Njangal ithu develop cheythirikkunathu React-um, FastAPI-um, pinne Ollama vazhi local aayi run cheyyunna LLM-um upayogichanu."

**Explanation Flow:**
"Ithil 3 roles undu: Admin, Faculty, pinne Students. 
Admin or faculty-kku syllabus, notices, allengil form PDFs portalil upload cheyyam. Upload cheyyumpol, LangChain upayogichu aa documents nammal **ChromaDB**-il vector aayi store cheyyum. (This is called RAG - Retrieval-Augmented Generation).
Student login cheythu chatbot-nodu enthenkilum chothichal—for example, 'How to apply for hostel?'—namude API first database-il check cheyyum, forms vellathum undo ennu. Illengil, aa question seedha ChromaDB-il poyi match aakunna context edukkum, ennittu **Ollama (Llama 3)** model aa content vechu answer generate cheythu frontend-ilekku thirichu tharum."

**Conclusion:**
"So basically, students-nu full time questions chothikkan oru personalized AI assistant-ne nammal college portal-il combine cheythu. Pinne privacy-kku vendi ChatGPT API use cheyyathe, local AI model (Ollama) aanu use cheythathu. That is the core architecture of our project. Thank you!"

---

## 10. Possible Questions & Answers 🤔

**Q1: Why did you use FastAPI instead of Node.js or Django?**
**Ans:** Python is the best language for AI and Machine Learning. Since we used LangChain and HuggingFace, FastAPI was the best choice because it runs Python but is incredibly fast and modern.

**Q2: What is RAG?**
**Ans:** RAG stands for Retrieval-Augmented Generation. Instead of training a whole new AI model on our college data (which is very expensive), we just let the AI *read* our college documents (retrieval) and give answers based on them (generation). 

**Q3: Where is the AI running? Are you using the OpenAI/ChatGPT API?**
**Ans:** No, we are using **Ollama**, which allows us to run Large Language Models purely locally on our machine. We are using the Llama 3 model. It is 100% free and completely private.

**Q4: How do you know which student is asking for their attendance?**
**Ans:** We use **JWT (JSON Web Tokens)** for authentication. When the student logs in, the React frontend saves a token. Every time they chat, the token is sent to the backend. The backend decrypts it to find the user's ID, and then pulls *only* their attendance from the SQLite database.

**Q5: What is ChromaDB?**
**Ans:** It is a vector database. Standard databases search for exact words (like SQL `LIKE '%word%'`). ChromaDB searches for *meaning*. It converts sentences into coordinates (vectors), so if a student asks for "housing", it knows it means "hostel".

---

## 11. Improvements (Future Scope) 🚀
If the examiner asks what you can improve in the future, say:
1. **Switching to PostgreSQL:** Currently, we use SQLite which is mostly for development. For a real college with thousands of students, PostgreSQL would be more powerful.
2. **Cloud Deployment:** We can deploy the backend on AWS and host the LLM on a HuggingFace Inference Endpoint or AWS EC2 GPU instance for 24/7 availability.
3. **Voice Chat:** Adding a Speech-to-Text feature so students can just speak to the portal instead of typing.

---
*Best of luck for your Presentation / Viva! You're going to rock!* 🎉
