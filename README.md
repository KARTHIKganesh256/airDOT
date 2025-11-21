# AeroSense - Air Quality Monitoring Dashboard

A real-time air quality monitoring and predictive analytics platform for Telangana & Andhra Pradesh, India. Built with modern web technologies, featuring AI-powered forecasting and an intuitive dashboard interface.

🌐 **Live Demo:** [https://karthikganesh256.github.io/airDOT/](https://karthikganesh256.github.io/airDOT/)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Project Structure](#project-structure)
- [Step-by-Step Setup Guide](#step-by-step-setup-guide)
- [How It Works](#how-it-works)
- [Architecture](#architecture)
- [Deployment](#deployment)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)

---

## 🎯 Overview

AeroSense is a full-stack air quality monitoring system that:

- **Monitors** real-time air quality data across multiple cities
- **Predicts** 24-hour AQI forecasts using machine learning
- **Visualizes** data through interactive charts, maps, and dashboards
- **Alerts** users about unhealthy air conditions
- **Works standalone** with demo data (no backend required for basic usage)

---

## ✨ Features

### Real-Time Monitoring
- Live air quality index (AQI) for multiple cities
- Temperature, humidity, and PM2.5 concentration tracking
- Auto-refreshing data every 5 seconds

### Predictive Analytics
- 24-hour AQI forecast using Random Forest machine learning
- Model performance metrics (R², MAE, RMSE)
- Confidence intervals for predictions

### Interactive Visualizations
- Real-time AQI trend charts
- City-wise heatmap with geographic overlays
- Historical data analysis
- Forecast visualization

### Smart Features
- Automatic data caching for performance
- Background model retraining
- Alert generation for unhealthy conditions
- Responsive design (mobile-friendly)

---

## 🛠️ Technologies Used

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.2.0 | UI framework for building interactive components |
| **TypeScript** | 5.9.3 | Type-safe JavaScript for better code quality |
| **Vite** | 7.2.2 | Fast build tool and development server |
| **Tailwind CSS** | 3.4.13 | Utility-first CSS framework for styling |
| **React Query** | 5.90.7 | Data fetching, caching, and synchronization |
| **Chart.js** | 4.5.1 | Beautiful, responsive charts |
| **React Leaflet** | 5.0.0 | Interactive maps with geographic data |
| **Framer Motion** | 12.23.24 | Smooth animations and transitions |
| **Axios** | 1.13.2 | HTTP client for API requests |
| **React Router** | 7.9.5 | Client-side routing |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Python** | 3.8+ | Programming language |
| **Flask** | 3.0.0 | Lightweight web framework |
| **MongoDB** | Latest | NoSQL database for sensor readings |
| **PyMongo** | 4.6.0+ | MongoDB driver for Python |
| **scikit-learn** | 1.3.0+ | Machine learning library (Random Forest) |
| **Pandas** | 2.1.0+ | Data manipulation and analysis |
| **NumPy** | 1.24.0+ | Numerical computing |
| **APScheduler** | 3.10.4+ | Background task scheduling |
| **Pydantic** | 2.0.0+ | Data validation and settings management |
| **Joblib** | 1.3.0+ | Model persistence |

### Development Tools

- **ESLint** - Code linting
- **TypeScript** - Type checking
- **PostCSS** - CSS processing
- **Git** - Version control
- **GitHub Actions** - CI/CD pipeline

---

## 📁 Project Structure

```
airDot/
├── backend/                 # Flask backend application
│   ├── app/
│   │   ├── __init__.py     # Flask app initialization
│   │   ├── config.py        # Configuration settings
│   │   ├── db.py            # MongoDB connection
│   │   ├── routes/         # API route handlers
│   │   │   └── api.py       # REST API endpoints
│   │   ├── services/       # Business logic
│   │   │   ├── aqi.py       # AQI calculation
│   │   │   ├── readings.py  # Data retrieval
│   │   │   ├── model.py     # ML model training/prediction
│   │   │   └── alerts.py    # Alert generation
│   │   ├── scheduler.py     # Background tasks
│   │   └── seed.py          # Database seeding
│   └── requirements.txt     # Python dependencies
│
├── frontend/                # React frontend application
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── dashboard/   # Dashboard-specific components
│   │   │   ├── layout/      # Layout components
│   │   │   └── ui/          # Reusable UI components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utility functions
│   │   │   ├── api.ts       # API client
│   │   │   └── mockData.ts  # Demo data generator
│   │   ├── pages/           # Page components
│   │   ├── types/           # TypeScript type definitions
│   │   └── main.tsx         # Application entry point
│   ├── package.json         # Node.js dependencies
│   └── vite.config.ts      # Vite configuration
│
├── data/                    # Static data files
│   └── geo/                 # Geographic data (GeoJSON)
│
├── .github/
│   └── workflows/
│       └── deploy.yml       # GitHub Actions deployment
│
└── README.md                # This file
```

---

## 🚀 Step-by-Step Setup Guide

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.8+
- **MongoDB** (local or cloud instance)
- **Git**

### Step 1: Clone the Repository

```bash
git clone https://github.com/KARTHIKganesh256/airDOT.git
cd airDOT
```

### Step 2: Backend Setup

#### 2.1 Create Virtual Environment

```bash
cd backend
python -m venv .venv
```

#### 2.2 Activate Virtual Environment

**Windows:**
```bash
.venv\Scripts\Activate
```

**Linux/Mac:**
```bash
source .venv/bin/activate
```

#### 2.3 Install Dependencies

```bash
pip install -r requirements.txt
```

#### 2.4 Configure Environment Variables

Create a `.env` file in the `backend` directory:

```env
MONGO_URI=mongodb://localhost:27017
MONGO_DB=aerosense
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

#### 2.5 Start MongoDB

Make sure MongoDB is running on your system:

```bash
# Windows (if installed as service, it should auto-start)
# Or use MongoDB Atlas (cloud) - update MONGO_URI in .env

# Linux
sudo systemctl start mongod

# Mac
brew services start mongodb-community
```

#### 2.6 Seed Database (Optional - for demo data)

```bash
python -m app.seed --days 7 --interval 60 --drop
```

This creates 7 days of sample data with readings every 60 minutes.

#### 2.7 Start Backend Server

```bash
python -m app
```

The backend will run on `http://localhost:8000`

### Step 3: Frontend Setup

#### 3.1 Navigate to Frontend Directory

```bash
cd ../frontend
```

#### 3.2 Install Dependencies

```bash
npm install
```

#### 3.3 Configure API URL (Optional)

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:8000/api
```

**Note:** If not set, the frontend will use mock data (works standalone).

#### 3.4 Start Development Server

```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

### Step 4: Access the Application

Open your browser and navigate to:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000/api/latest

---

## 🔄 How It Works

### Data Flow

1. **Data Ingestion**
   - Sensor readings are stored in MongoDB
   - Each reading contains: AQI, temperature, humidity, PM2.5, PM10, CO2, NO2
   - Readings are timestamped and associated with cities

2. **Data Processing**
   - Backend calculates AQI from pollutant values
   - Latest readings are cached for fast access
   - Historical data is aggregated for analysis

3. **Machine Learning**
   - Random Forest model predicts 24-hour AQI
   - Model is trained on historical data
   - Retrained automatically every 30 minutes

4. **Frontend Display**
   - React Query fetches data every 5 seconds
   - Charts update in real-time
   - Map shows city-wise air quality
   - Alerts displayed for unhealthy conditions

### AQI Calculation Algorithm

1. **Pollutant to AQI Conversion**
   - Each pollutant (PM2.5, PM10, CO2, NO2) is converted to AQI using EPA breakpoints
   - Linear interpolation between breakpoint ranges

2. **Primary Pollutant Selection**
   - The pollutant with highest AQI becomes "primary pollutant"
   - Overall AQI = highest pollutant AQI

3. **Category Assignment**
   - AQI 0-50: Good (Green)
   - AQI 51-100: Moderate (Yellow)
   - AQI 101-150: Unhealthy for Sensitive Groups (Orange)
   - AQI 151-200: Unhealthy (Red)
   - AQI 201-300: Very Unhealthy (Purple)
   - AQI 301-500: Hazardous (Maroon)

### Machine Learning Model

- **Algorithm:** Random Forest Regressor
- **Features:** Hour of day, day of week, city, historical AQI, pollutants
- **Training:** Automatic retraining with latest data
- **Metrics:** R² score, Mean Absolute Error (MAE), Root Mean Squared Error (RMSE)

---

## 🏗️ Architecture

### Backend Architecture

```
┌─────────────────┐
│   MongoDB       │
│   Database      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Flask API     │
│   - Routes      │
│   - Services    │
│   - Scheduler   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   ML Model      │
│   (Random Forest)│
└─────────────────┘
```

### Frontend Architecture

```
┌─────────────────┐
│   React App     │
│   - Components  │
│   - Hooks       │
│   - Pages       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   React Query   │
│   - Caching     │
│   - Fetching    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   API Client    │
│   (Axios)       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Flask API     │
│   or Mock Data  │
└─────────────────┘
```

---

## 🚢 Deployment

### GitHub Pages Deployment (Automatic)

The project is configured for automatic deployment to GitHub Pages:

1. **Push to main branch** triggers deployment
2. **GitHub Actions** builds the frontend
3. **Deploys** to `https://karthikganesh256.github.io/airDOT/`

**Note:** The deployed version uses mock data by default (no backend required).

### Manual Deployment

#### Frontend (Static Hosting)

```bash
cd frontend
npm run build
# Upload the 'dist' folder to your hosting service
```

#### Backend (Cloud Hosting)

Popular options:
- **Railway** - https://railway.app
- **Render** - https://render.com
- **Heroku** - https://heroku.com
- **PythonAnywhere** - https://www.pythonanywhere.com

1. Deploy backend to cloud service
2. Set `VITE_API_URL` environment variable in frontend
3. Rebuild and deploy frontend

See `DEPLOYMENT.md` for detailed instructions.

---

## 📡 API Endpoints

### Base URL
- Local: `http://localhost:8000/api`
- Production: Your deployed backend URL

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/latest` | Get latest readings for all cities |
| GET | `/history?city={city}&limit={limit}` | Get historical data for a city |
| GET | `/mapdata` | Get map overlay data with city locations |
| GET | `/predict?city={city}` | Get 24-hour AQI forecast |
| POST | `/ingest` | Ingest new sensor reading |
| POST | `/train` | Manually trigger model retraining |

### Example Response

```json
{
  "updated_at": "2024-01-15T10:30:00Z",
  "readings": [
    {
      "id": "123",
      "city": "Hyderabad",
      "state": "Telangana",
      "aqi": 65,
      "temperature": 31.5,
      "humidity": 58,
      "pm25": 32.5,
      "category": "Moderate",
      "timestamp": "2024-01-15T10:30:00Z"
    }
  ],
  "alerts": [],
  "palette": {
    "Good": "#00E400",
    "Moderate": "#FFFF00"
  }
}
```

---

## 🧪 Testing

### Backend Testing

```bash
cd backend
python -m pytest  # If tests are added
```

### Frontend Testing

```bash
cd frontend
npm run lint      # Lint code
npm run build     # Test build
```

---

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the MIT License.

---

## 👤 Author

**KARTHIKganesh256**
- GitHub: [@KARTHIKganesh256](https://github.com/KARTHIKganesh256)

---

## 🙏 Acknowledgments

- EPA for AQI calculation standards
- Telangana & Andhra Pradesh for geographic data
- Open source community for amazing tools and libraries

---

## 📞 Support

For issues, questions, or contributions, please open an issue on GitHub.

---

**Made with ❤️ for better air quality monitoring**

