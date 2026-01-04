# FitCalc.AI Deployment Guide

## ⚠️ Critical Architecture Note
Your application has two parts:
1.  **Frontend**: Static HTML/CSS/JS (Lightweight) → **Deploy to Vercel**
2.  **Backend**: Python ML Engine + 288MB Model (Heavy) → **Deploy to Render or Railway**

**Why not Vercel for everything?**
Vercel Serverless Functions have a **50MB size limit**. Your `nutrition_model.joblib` is **288MB**, so it will fail to deploy on Vercel's free tier.

---

## 🚀 Step 1: Deploy Frontend to Vercel (Fast & Free)

1.  Push your code to **GitHub**.
2.  Go to [Vercel.com](https://vercel.com) and log in.
3.  Click **"Add New Project"** -> Select your Repository.
4.  **Framework Preset**: Select "Other" (since it's plain HTML).
5.  **Build Command**: Leave empty.
6.  **Output Directory**: Leave empty (or `.` ).
7.  Click **Deploy**.

Your frontend is now live! (e.g., `https://fitcalc.vercel.app`)

---

## 🏗️ Step 2: Deploy Backend to Render (Supported)

Render allows Docker containers and persistent disk, which supports large models.

1.  Go to [Render.com](https://render.com).
2.  Click **New +** -> **Web Service**.
3.  Connect your GitHub repo.
4.  **Runtime**: Python 3.
5.  **Build Command**: `pip install -r backend_requirements.txt`
6.  **Start Command**: `uvicorn ml_service.app:app --host 0.0.0.0 --port $PORT`
    *   *Note: Ensure `ml_service` folder contains `app.py`.*
    *   *Note: If your repo root is the app root, command might be `uvicorn ml_service.app:app ...`*
7.  Select **Free Tier**.
8.  Click **Create Web Service**.

Wait for deployment. You will get a URL like `https://fitcalc-backend.onrender.com`.

---

## 🔗 Step 3: Connect Them

1.  Open `assets/js/config.js` in your code.
2.  Update the `API_BASE_URL` with your **Render Backend URL**:
    ```javascript
    const config = {
        API_BASE_URL: "https://fitcalc-backend.onrender.com" // Your Render URL
    };
    ```
3.  Commit and Push the change to GitHub.
4.  Vercel will automatically redeploy your frontend with the new connection.

---

## ✅ Final Check
1.  Open your Vercel URL.
2.  Go to **AI Diet**.
3.  Click **Generate**.
4.  It should talk to your Render backend and show results!
