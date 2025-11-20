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

## Setting API URL (Optional)

If your backend API is hosted elsewhere, set it as a secret:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Name: `VITE_API_URL`
4. Value: Your API URL (e.g., `https://your-api.com/api`)
5. Save

The workflow will use this URL when building the frontend.

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

