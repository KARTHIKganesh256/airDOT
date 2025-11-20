# AeroSense Architecture Plan

## Overview

AeroSense is being rebuilt as a Flask + MongoDB service paired with a React/Tailwind dashboard focused on real-time AQI analytics for Telangana & Andhra Pradesh.

## Target Architecture

- **Backend (Flask)**
  - REST endpoints under `/api` (`/latest`, `/history`, `/mapdata`, `/predict`).
  - MongoDB (`readings`, `cities`, `forecasts`, `alerts`) with PyMongo/Motor.
  - Random Forest AQI predictor persisted via joblib; retraining pipeline using historical data.
  - Background scheduler (APScheduler) for periodic ingestion, model refresh, and alert generation.
  - Websocket or long-poll support optional; default is polling every 5s.

- **Frontend (React + Vite + TypeScript)**
  - TailwindCSS theme with dark mode, neon-futuristic styling.
  - Layout: Navbar, collapsible sidebar, dashboard cards, charts, map.
  - React Query for data fetching.
  - Chart.js (react-chartjs-2) for live AQI + prediction graphs.
  - React Leaflet with Telangana/AP boundaries for heatmap overlays & tooltips.
  - Animations via Framer Motion.

- **Data Flow**
  1. Sensor/seed scripts write readings per city into MongoDB.
  2. Flask serves latest/historical data and generates predictions.
  3. Frontend polls `/api/latest` every 5s, updates cards/charts/map.
  4. Alerts triggered server-side propagate through `/api/latest` & `/api/history`.

- **Deployment**
  - Backend served via Gunicorn/Flask; configure environment variables for Mongo URI, model paths.
  - Frontend built with Vite; environment variable `VITE_API_URL` for API base.
  - Optionally containerized with Docker Compose (Flask API + MongoDB + React static build).

## Next Steps

1. Scaffold Flask app with Blueprints, services, and Mongo integration.
2. Implement Mongo schema helpers, data seeders, and Random Forest trainer.
3. Build React dashboard with Tailwind design system and map overlay.
4. Connect front/back via React Query and websockets/polling.
5. Polish UX, optimize bundle size, and prepare deployment scripts.


