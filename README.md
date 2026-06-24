# 🚀 AI Interview Coach

> An AI-powered career preparation platform that helps students and job seekers optimize resumes, evaluate job fit, practice AI-driven interviews, track progress, and receive personalized career guidance.

---

## 🌟 Overview

AI Interview Coach is a full-stack platform designed to streamline the entire interview preparation journey. It combines Resume Analysis, AI Feedback, Job Matching, Mock Interviews, Career Roadmaps, and Performance Analytics into a single intelligent system.

The platform leverages **Google Gemini AI**, **FastAPI**, **React**, **Redis**, and **Celery** to deliver personalized career insights and scalable AI-powered workflows.

---

## ✨ Key Features

### 📄 Resume Analysis

* Upload PDF resumes
* ATS-style scoring
* Resume quality assessment
* Skills extraction
* Section-wise evaluation
* Instant heuristic feedback

### 🤖 AI Resume Feedback

Powered by Google Gemini AI.

* Resume strengths analysis
* Weakness identification
* Improvement suggestions
* Actionable recommendations
* Recruiter-style feedback

### 🎯 Job Match Analysis

Compare resumes against real job descriptions.

Provides:

* Match percentage
* Missing skills detection
* Gap analysis
* Hiring readiness insights
* AI-generated recommendations

### 🎤 AI Mock Interview Simulator

Practice realistic interviews powered by Gemini AI.

#### Supported Modes

* General Interview
* Resume-Based Interview
* Job Description-Based Interview

#### Features

* Dynamic question generation
* Context-aware follow-up questions
* Answer evaluation
* AI-generated feedback
* Interview scoring
* Final performance summary

### 📈 Analytics Dashboard

Track improvement over time.

Includes:

* Resume score progression
* Interview performance trends
* Job match improvements
* Activity analytics
* Learning insights

### 🗂 Resume Version Tracking

Manage and compare resume iterations.

Features:

* Resume snapshots
* Version comparison
* Change tracking
* Progress monitoring

### 🛣 AI Career Roadmap Generator

Generate personalized learning plans based on:

* Current skills
* Career goals
* Target role
* Experience level

### ⚡ Redis Caching

Improves performance by reducing repeated AI requests.

* Faster response times
* Reduced Gemini API usage
* Improved scalability

### 🔄 Asynchronous Task Processing

Powered by Celery and Redis.

* Background AI processing
* Non-blocking user experience
* Scalable architecture
* Queue-based task execution

---

## 🏗 System Architecture

```text
                     ┌───────────────────┐
                     │ React Frontend    │
                     └─────────┬─────────┘
                               │
                               ▼
                     ┌───────────────────┐
                     │ FastAPI Backend   │
                     └─────────┬─────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        ▼                      ▼                      ▼

 ┌──────────────┐      ┌──────────────┐      ┌──────────────┐
 │ SQLite / DB │      │ Gemini AI    │      │ Redis Cache  │
 └──────────────┘      └──────────────┘      └──────┬───────┘
                                                    │
                                                    ▼
                                           ┌──────────────┐
                                           │ Celery Worker│
                                           └──────────────┘
```

---

## 🛠 Tech Stack

### Frontend

* React.js
* TypeScript
* Vite
* React Router
* CSS

### Backend

* FastAPI
* SQLAlchemy
* JWT Authentication
* SQLite

### AI & ML

* Google Gemini AI
* Prompt Engineering
* Structured JSON Responses

### Caching & Background Jobs

* Redis
* Celery

### Deployment

* Vercel (Frontend)
* Render (Backend)

---

## 📂 Project Structure

```text
AI-Interview-Coach/
│
├── interview-coach-frontend/
│   ├── src/
│   ├── pages/
│   ├── components/
│   ├── hooks/
│   ├── services/
│   └── styles/
│
├── interview-coach-backend/
│   ├── models/
│   ├── routes/
│   ├── schemas/
│   ├── services/
│   ├── middleware/
│   ├── workers/
│   ├── database/
│   ├── main.py
│   └── requirements.txt
│
└── README.md
```

---

## 🔐 Authentication & Security

Implemented using:

* JWT Access Tokens
* Password Hashing (bcrypt)
* Protected Routes
* Session Validation
* Secure API Authorization

---

## 🧠 AI Workflow

```text
Resume Upload
      ↓
Resume Analysis
      ↓
AI Feedback
      ↓
Job Match Analysis
      ↓
Mock Interview
      ↓
Performance Analytics
      ↓
Career Roadmap
```

---

## 🚀 Installation

### Clone Repository

```bash
git clone https://github.com/chanchal-barak/interview-coach.git
cd interview-coach
```

### Backend Setup

```bash
cd interview-coach-backend

python -m venv venv

venv\Scripts\activate

pip install -r requirements.txt
```

### Create .env

```env
GEMINI_API_KEY=your_api_key

DATABASE_URL=sqlite:///./interview_coach.db

JWT_SECRET_KEY=your_secret_key

ACCESS_TOKEN_EXPIRE_MINUTES=1440

REDIS_URL=redis://localhost:6379/0
```

### Run Backend

```bash
uvicorn main:app --reload
```

Backend:

```text
http://localhost:8000
```

Swagger Docs:

```text
http://localhost:8000/docs
```

### Run Redis

```bash
docker run -d --name redis -p 6379:6379 redis
```

### Run Celery Worker

```bash
celery -A workers.tasks worker --pool=solo --loglevel=info
```

### Frontend Setup

```bash
cd interview-coach-frontend

npm install

npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

## 🌐 Live Deployment

### Frontend

https://interview-coach-eosin.vercel.app

### Backend

https://interview-coach-0hgx.onrender.com

---

## 📸 Screenshots

---

## 📸 Screenshots

### Dashboard
<img width="1896" height="956" alt="image" src="https://github.com/user-attachments/assets/e01d6197-9973-4bc8-9e83-e0a2bbad00af" />


### Resume Analysis
<img width="1918" height="966" alt="image" src="https://github.com/user-attachments/assets/675fe0d6-db26-4e9f-8868-a75a7d127ccd" />


### AI Interview Simulator

<img width="1897" height="960" alt="image" src="https://github.com/user-attachments/assets/db1dc20f-a029-4d39-8062-385a97f99fbc" />


### Analytics

<img width="1893" height="956" alt="image" src="https://github.com/user-attachments/assets/93276690-6cf4-45d3-9c77-e9b83afacc34" />


---

## 🎯 Future Enhancements

* PostgreSQL Migration
* AWS EC2 Deployment
* AWS S3 Resume Storage
* CloudWatch Monitoring
* Email Notifications
* Multi-Language Support
* Advanced ATS Scoring
* Voice-Based Interviews
* AI Interview Report PDFs
* Real-Time Interview Analytics

---

## 👨‍💻 Author

### Chanchal Barak

B.Tech Computer Science & Engineering (Data Science)

Bhagwan Parshuram Institute of Technology

---

## ⭐ Support

If you found this project useful:

⭐ Star the repository

🍴 Fork the repository

🚀 Build something awesome


