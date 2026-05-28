# TaskFlow Deployment Guide (Render-Only)

This guide describes how to deploy the complete TaskFlow full-stack application (PostgreSQL, Spring Boot API, and React UI) entirely on **Render** (using their free tier services).

---

## 📦 Part 1: Deploy the PostgreSQL Database

1. Sign up/log in to [Render](https://render.com/).
2. Click **New** (top right) and select **PostgreSQL**.
3. Configure the database:
   - **Name**: `taskflow-db`
   - **Database Name**: `taskflow`
   - **User**: `postgres` (or default)
   - **Region**: Choose a region close to you
   - **Plan**: Select the **Free** tier
4. Click **Create Database**.
5. Once active, note down the **Internal Database URL** (e.g., `postgres://postgres:password@dpg-xxx-a:5432/taskflow`). You will use this link for the backend service.

---

## ☕ Part 2: Deploy the Spring Boot Backend

1. Push your TaskFlow codebase to a **GitHub repository** (private or public).
2. On Render, click **New** and select **Web Service**.
3. Connect your GitHub repository.
4. Configure the Web Service:
   - **Name**: `taskflow-backend`
   - **Root Directory**: `backend` (Important: must point to the Java sub-folder)
   - **Runtime**: `Docker` (Render automatically detects and builds the `Dockerfile` inside `backend/`)
   - **Plan**: Select the **Free** tier
5. Open the **Advanced** settings and add the following **Environment Variables**:
   - `DB_URL`: The **Internal Database URL** from Part 1.
   - `DB_USERNAME`: Your PostgreSQL database username.
   - `DB_PASSWORD`: Your PostgreSQL database password.
   - `JWT_SECRET`: A long random string (at least 32 characters) for signing tokens.
   - `JWT_EXPIRATION`: `86400000` (24 hours).
   - `GEMINI_API_KEY`: Your Google Gemini API Key.
   - `CORS_ORIGINS`: The URL of your static frontend on Render (you will update this in Part 4 once the frontend is active, or use `*` for testing).
6. Click **Create Web Service**. Render will compile and start the backend. Once active, copy the backend service URL (e.g., `https://taskflow-backend.onrender.com`).

---

## ⚛️ Part 3: Deploy the React Frontend

Render provides free static web hosting for frontends.

1. On Render, click **New** and select **Static Site**.
2. Connect your GitHub repository.
3. Configure the Static Site:
   - **Name**: `taskflow-portal`
   - **Root Directory**: `frontend` (Important: must point to the React sub-folder)
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
4. Open the **Advanced** settings and add the following **Environment Variable**:
   - `VITE_API_URL`: The URL of your deployed Render backend (from Part 2, e.g., `https://taskflow-backend.onrender.com`).
5. Click **Create Static Site**.
6. **Required SPA Routing Rule** (prevents 404 errors when reloading pages):
   - Go to your static site settings, click **Redirects/Rewrites**.
   - Click **Add Rule**.
   - **Source**: `/*`
   - **Destination**: `/index.html`
   - **Action**: `Rewrite` (This ensures React router handles all sub-paths).
7. Copy your deployed frontend static site URL (e.g., `https://taskflow-portal.onrender.com`).

---

## 🔄 Part 4: Enable CORS (Final Connection)

1. Go back to your **Render Web Service** dashboard for `taskflow-backend`.
2. Navigate to **Environment Variables**.
3. Update the `CORS_ORIGINS` variable:
   - Value: `https://taskflow-portal.onrender.com` (your actual Render static site URL).
4. Save changes. Render will perform a quick rolling update to apply the new CORS policy.

**Your full-stack application is now fully deployed and live on Render!**
