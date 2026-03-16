# 🎓 Campus Placement Portal

A full-stack web application designed to streamline and manage the campus recruitment process for students and placement officers.

---

## 📌 Overview

The **Campus Placement Portal** simplifies campus hiring by providing a centralized platform for students, placement officers, and companies. It enables efficient job postings, application tracking, notifications, and analytics — all in one place.

---

## 👩‍💻 Creator



---

## ✨ Features

### 👨‍🎓 Student Features
- Secure registration and login
- View and search company/job listings
- Apply for eligible positions
- Track application status
- View placement statistics and updates

### 🧑‍💼 Placement Officer Features
- Officer dashboard for management
- Add and manage companies and job postings
- Review and update student applications
- Send notifications to students
- Generate placement reports and analytics

### 🔔 General Features
- Role-based authentication
- Real-time notifications
- Responsive UI
- Clean and modern design

---

## 🛠️ Tech Stack

### Frontend
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Vite

### Backend
- Node.js
- Express.js

### Database
- MongoDB

---

## Resume Analyzer (Python ML)

The backend now includes a Python-based resume analyzer that:
- extracts skills from resume text
- extracts required skills from a job description
- computes semantic similarity using TF-IDF + cosine similarity
- returns matched skills, missing skills, and a fit score

### Install Python dependencies

From the project root:

```bash
pip install -r server/ml/requirements.txt
```

If your server uses a custom Python command, set:

```bash
PYTHON_EXECUTABLE=python
```

### API endpoint

`POST /api/zenith/resume-analyzer`

Request body:

```json
{
	"jobDescription": "We need React, Node.js, SQL and problem solving skills...",
	"resumeText": "Built React dashboards and Node APIs with MongoDB...",
	"topKMissing": 10
}
```

Notes:
- `jobDescription` is required.
- `resumeText` is optional. If omitted, backend uses stored resume text or extracts it from uploaded resume PDF.
- Model scores are estimations and cannot guarantee 100% real-world accuracy.

---

## 📂 Project Structure

```text
campus-placement-portal/
│
├── src/            # Frontend React application
├── public/         # Static assets
├── server/         # Backend Express server
├── .env.example    # Sample environment variables
└── README.md
