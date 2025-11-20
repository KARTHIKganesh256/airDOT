# GitHub Pages Deployment Guide

## Quick Setup

1. **Enable GitHub Pages in your repository:**
   - Go to your repository: https://github.com/KARTHIKganesh256/airDOT
   - Click **Settings** → **Pages**
   - Under **Source**, select **GitHub Actions**
   - Save

2. **Push your code:**
   ```powershell
   git add .
   git commit -m "Add GitHub Pages deployment"
   git push origin main
   ```

3. **Wait for deployment:**
   - Go to **Actions** tab in your repository
   - Watch the workflow run (takes ~2-3 minutes)
   - Once complete, your site will be live at:
     **https://KARTHIKganesh256.github.io/airDOT/**

## Setting API URL (REQUIRED for Live Data)

**IMPORTANT:** The frontend needs a backend API to display data. Without it, you'll see "Connecting..." and no values.

### Option 1: Deploy Backend First (Recommended)

1. **Deploy your Flask backend** to a hosting service:
   - [Railway](https://railway.app) (free tier available)
   - [Render](https://render.com) (free tier available)
   - [Heroku](https://heroku.com)
   - [PythonAnywhere](https://www.pythonanywhere.com)

2. **Get your API URL** (e.g., `https://your-app.railway.app/api`)

3. **Set it as a GitHub Secret:**
   - Go to your repository: https://github.com/KARTHIKganesh256/airDOT
   - Click **Settings** → **Secrets and variables** → **Actions**
   - Click **New repository secret**
   - Name: `VITE_API_URL`
   - Value: Your API URL (e.g., `https://your-app.railway.app/api`)
   - Click **Add secret**

4. **Redeploy:**
   - Go to **Actions** tab
   - Click **Deploy to GitHub Pages** workflow
   - Click **Run workflow** → **Run workflow**

### Option 2: Use Local Development

For local testing, run both backend and frontend locally (see main README).

## Local Testing

To test the GitHub Pages build locally:

```powershell
cd frontend
npm run build
npm run preview
```

Visit `http://localhost:4173/airDOT/` to preview.

## Troubleshooting

- **404 errors**: Make sure GitHub Pages is set to use **GitHub Actions** as the source
- **API not working**: Check that `VITE_API_URL` secret is set correctly
- **Build fails**: Check the **Actions** tab for error details

