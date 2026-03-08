# Free Deployment Guide

This guide walks you through hosting the entire app **for free** using:
- **MongoDB Atlas** – Database (free M0 tier)
- **Render** – Backend API (free tier)
- **Vercel** – Frontend (free tier)

---

## Step 1 — MongoDB Atlas (Database)

1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com) and create a free account.
2. Create a new **Project**, then click **Build a Database**.
3. Choose **M0 Free** tier → select a cloud region → click **Create**.
4. Set a **username** and **password** (save these).
5. Under **Network Access**, click **Add IP Address** → choose **Allow Access from Anywhere** (`0.0.0.0/0`).
6. Go to your cluster → click **Connect** → **Drivers** → copy the connection string.
   - It looks like: `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/placement_db?retryWrites=true&w=majority`
   - Replace `<user>` and `<password>` with your credentials.

---

## Step 2 — Render (Backend)

1. Push this project to a **GitHub repository** (if not already done).
2. Go to [https://render.com](https://render.com) and sign up with GitHub.
3. Click **New → Web Service** → connect your GitHub repo.
4. Fill in the settings:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free
5. Under **Environment Variables**, add:

   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `PORT` | `5000` |
   | `MONGODB_URI` | *(your Atlas connection string from Step 1)* |
   | `JWT_SECRET` | *(any long random string, e.g. 32+ random chars)* |
   | `EMAIL_USER` | *(your Gmail address)* |
   | `EMAIL_PASSWORD` | *(your Gmail App Password)* |
   | `GOOGLE_CLIENT_ID` | *(your Google OAuth client ID, if used)* |

6. Click **Deploy**. Wait for it to finish.
7. Copy your backend URL — it will look like: `https://placement-backend.onrender.com`

> **Note:** Render's free tier spins down after 15 minutes of inactivity. The first request after sleep takes ~30 seconds to wake up. This is normal on the free tier.

---

## Step 3 — Vercel (Frontend)

1. Go to [https://vercel.com](https://vercel.com) and sign up with GitHub.
2. Click **Add New → Project** → import your GitHub repo.
3. Set the **Framework Preset** to **Vite**.
4. Under **Environment Variables**, add:

   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | `https://placement-backend.onrender.com/api` *(your Render URL + `/api`)* |
   | `VITE_GOOGLE_CLIENT_ID` | *(your Google OAuth client ID, if used)* |

5. Click **Deploy**. Vercel will build and host your frontend.
6. Your app will be live at `https://your-project-name.vercel.app`.

---

## Summary

```
Browser  →  Vercel (React frontend)
               ↓
         Render (Express backend API)
               ↓
         MongoDB Atlas (database)
```

---

## Updating the App

Any `git push` to your main branch will automatically redeploy both Vercel and Render.
