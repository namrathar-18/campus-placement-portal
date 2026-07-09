# 🎓 Campus Placement Portal

A full-stack, role-based platform that digitizes the entire campus recruitment lifecycle — from company drives and student applications to shortlisting, offers, and placement analytics.

<p align="center">
  <a href="https://campus-placement-portal.vercel.app"><b>🌐 Live Demo</b></a> &nbsp;•&nbsp;
  <a href="#-features"><b>Features</b></a> &nbsp;•&nbsp;
  <a href="#-tech-stack"><b>Tech Stack</b></a> &nbsp;•&nbsp;
  <a href="#-getting-started"><b>Getting Started</b></a>
</p>

---

## 🌐 Live Demo

- **Frontend:** https://campus-placement-portal.vercel.app
- **API:** https://campus-placement-portal-dl0o.onrender.com/api

> Access is restricted to official Christ University email accounts (`@mca.christuniversity.in`, `@mscaiml.christuniversity.in`) via email/password or Google sign-in.

---

## 📌 Overview

The Campus Placement Portal replaces spreadsheets and email threads with a single source of truth for placements. It serves three distinct roles — **Students**, **Student Representatives**, and **Placement Officers** — each with a tailored dashboard, permissions, and workflow. The result is faster drives, transparent tracking, and data-driven placement decisions.

---

## ✨ Features

### 👨‍🎓 Student
- Google / university-email authentication with guided profile setup
- Browse verified company drives with eligibility indicators
- One-click apply and real-time application status tracking
- Personal placement statistics and offer history
- **AI Resume Analyzer** — matches a resume against a job description and returns a fit score with matched/missing skills
- In-app assistant for placement queries

### 🧑‍💼 Placement Officer
- Central dashboard with live placement KPIs
- Create and manage companies, roles, and eligibility criteria
- Review, shortlist, and update applications across drives
- Broadcast notifications to students
- **Placement Analytics** — charts for offers, CTC ranges, department-wise placement, and company participation
- Export placed-student reports (PDF)

### 🧑‍🏫 Student Representative
- Delegated management of drives, applications, and notifications
- Role-scoped permissions distinct from officers

### 🔐 Platform
- JWT-based auth with bcrypt password hashing
- Google OAuth restricted to whitelisted university domains
- Role-based access control across every route
- Responsive, accessible UI with light/dark support

---

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, TanStack Query, React Router |
| **Backend** | Node.js, Express, JWT, bcrypt |
| **Database** | MongoDB (Atlas) with Mongoose |
| **Auth** | Email/password + Google OAuth (`@react-oauth/google`) |
| **Analytics/PDF** | Recharts, jsPDF |
| **Hosting** | Vercel (frontend) · Render (API) · MongoDB Atlas (DB) |

---

## 🏗️ Architecture

```
Browser ──▶ Vercel (React + Vite SPA)
                │  REST / JWT
                ▼
          Render (Express API) ──▶ MongoDB Atlas
                │
                └──▶ Google OAuth · Resume Analyzer
```

---

## 📂 Project Structure

```text
campus-placement-portal/
├── src/                 # React frontend
│   ├── pages/           # Student, officer, representative views
│   ├── components/      # UI + shared components
│   ├── hooks/           # Auth and data hooks
│   └── lib/             # API client
├── server/              # Express backend
│   ├── routes/          # Auth, companies, applications, stats…
│   ├── models/          # Mongoose schemas
│   ├── middleware/      # Auth / RBAC
│   └── ml/              # Resume analyzer
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A MongoDB connection string (MongoDB Atlas free tier works)

### 1. Clone
```bash
git clone https://github.com/namrathar-18/campus-placement-portal.git
cd campus-placement-portal
```

### 2. Backend
```bash
cd server
npm install
# create server/.env (see below)
npm start
```

`server/.env`:
```env
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=a_long_random_string
PORT=5000
NODE_ENV=development
GOOGLE_CLIENT_ID=your_google_client_id
```

### 3. Frontend
```bash
cd ..
npm install
# create .env (see below)
npm run dev
```

`.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

The app runs at `http://localhost:8080`.

---

## ☁️ Deployment

| Service | Platform | Root | Build | Start |
|--------|----------|------|-------|-------|
| Frontend | Vercel | `/` | `npm run build` | static (`dist`) |
| Backend | Render | `server` | `npm install` | `npm start` |
| Database | MongoDB Atlas | — | — | — |

Set the environment variables above in each platform's dashboard. Pushing to `main` redeploys automatically when the repos are connected.

---

## 👩‍💻 Author

**Namratha R** — [@namrathar-18](https://github.com/namrathar-18)

> Built as a full-stack MERN-style placement management system for real campus recruitment workflows.
