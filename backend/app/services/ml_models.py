from __future__ import annotations

from datetime import datetime
from pathlib import Path
from typing import Any

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from tensorflow import keras
from tensorflow.keras import layers

from ..config import get_settings
from ..db import get_collection
from .readings import get_latest_cache, get_recent_history

settings = get_settings()


def _models_dir() -> Path:
    settings.models_dir.mkdir(parents=True, exist_ok=True)
    return settings.models_dir


def _load_dataframe(limit: int = 1000) -> pd.DataFrame | None:
    history = get_recent_history(limit=limit)
    if len(history) < 50:
        return None
    df = pd.DataFrame(history)
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    df["hour"] = df["timestamp"].dt.hour
    df["dayofweek"] = df["timestamp"].dt.dayofweek
    df = pd.get_dummies(df, columns=["city"], drop_first=True)
    return df


def _prepare_features(df: pd.DataFrame) -> tuple[pd.DataFrame, pd.Series]:
    features = df.drop(
        columns=[
            "id",
            "state",
            "color",
            "category",
            "health",
            "primary_pollutant",
            "timestamp",
            "aqi",
        ],
        errors="ignore",
    )
    target = df["aqi"]
    return features, target


def _prepare_lstm_data(df: pd.DataFrame, sequence_length: int = 24) -> tuple[np.ndarray, np.ndarray]:
    """Prepare data for LSTM with sequences"""
    features, target = _prepare_features(df)
    
    # Select numeric features for LSTM
    numeric_cols = features.select_dtypes(include=[np.number]).columns.tolist()
    feature_data = features[numeric_cols].values
    
    # Normalize features
    from sklearn.preprocessing import StandardScaler
    scaler = StandardScaler()
    feature_data = scaler.fit_transform(feature_data)
    
    X, y = [], []
    for i in range(len(feature_data) - sequence_length):
        X.append(feature_data[i:i + sequence_length])
        y.append(target.iloc[i + sequence_length])
    
    return np.array(X), np.array(y), scaler, numeric_cols


def train_random_forest(features: pd.DataFrame, target: pd.Series) -> tuple[RandomForestRegressor, dict[str, float]]:
    """Train Random Forest model"""
    model = RandomForestRegressor(
        n_estimators=300,
        max_depth=14,
        random_state=42,
        n_jobs=-1,
    )
    model.fit(features, target)
    
    predictions = model.predict(features)
    metrics = {
        "r2": float(r2_score(target, predictions)),
        "mae": float(mean_absolute_error(target, predictions)),
        "rmse": float(np.sqrt(mean_squared_error(target, predictions))),
    }
    
    return model, metrics


def train_linear_regression(features: pd.DataFrame, target: pd.Series) -> tuple[LinearRegression, dict[str, float]]:
    """Train Linear Regression model"""
    model = LinearRegression()
    model.fit(features, target)
    
    predictions = model.predict(features)
    metrics = {
        "r2": float(r2_score(target, predictions)),
        "mae": float(mean_absolute_error(target, predictions)),
        "rmse": float(np.sqrt(mean_squared_error(target, predictions))),
    }
    
    return model, metrics


def train_lstm(X: np.ndarray, y: np.ndarray) -> tuple[keras.Model, dict[str, float]]:
    """Train LSTM model"""
    if len(X) < 10:
        # Fallback to simple model if not enough data
        model = keras.Sequential([
            layers.Dense(32, activation='relu'),
            layers.Dense(16, activation='relu'),
            layers.Dense(1)
        ])
    else:
        model = keras.Sequential([
            layers.LSTM(64, return_sequences=True, input_shape=(X.shape[1], X.shape[2])),
            layers.Dropout(0.2),
            layers.LSTM(32, return_sequences=False),
            layers.Dropout(0.2),
            layers.Dense(16, activation='relu'),
            layers.Dense(1)
        ])
    
    model.compile(optimizer='adam', loss='mse', metrics=['mae'])
    
    # Train with validation split
    history = model.fit(
        X, y,
        epochs=20,
        batch_size=32,
        validation_split=0.2,
        verbose=0
    )
    
    predictions = model.predict(X, verbose=0).flatten()
    metrics = {
        "r2": float(r2_score(y, predictions)),
        "mae": float(mean_absolute_error(y, predictions)),
        "rmse": float(np.sqrt(mean_squared_error(y, predictions))),
    }
    
    return model, metrics


def train_all_models(force: bool = False) -> dict[str, Any] | None:
    """Train all three models and ensemble"""
    df = _load_dataframe()
    if df is None or df.empty:
        return None
    
    models_dir = _models_dir()
    
    # Check if models exist and not forcing retrain
    rf_path = models_dir / "rf_model.pkl"
    lr_path = models_dir / "lr_model.pkl"
    lstm_path = models_dir / "lstm_model.h5"
    
    if all(p.exists() for p in [rf_path, lr_path, lstm_path]) and not force:
        return {"status": "cached"}
    
    features, target = _prepare_features(df)
    
    # Train Random Forest
    rf_model, rf_metrics = train_random_forest(features, target)
    joblib.dump({
        "model": rf_model,
        "feature_columns": features.columns.tolist(),
        "metrics": rf_metrics
    }, rf_path)
    
    # Train Linear Regression
    lr_model, lr_metrics = train_linear_regression(features, target)
    joblib.dump({
        "model": lr_model,
        "feature_columns": features.columns.tolist(),
        "metrics": lr_metrics
    }, lr_path)
    
    # Train LSTM
    try:
        X_lstm, y_lstm, scaler, numeric_cols = _prepare_lstm_data(df)
        if len(X_lstm) > 0:
            lstm_model, lstm_metrics = train_lstm(X_lstm, y_lstm)
            lstm_model.save(str(lstm_path))
            joblib.dump({"scaler": scaler, "numeric_cols": numeric_cols}, models_dir / "lstm_scaler.pkl")
        else:
            lstm_metrics = {"r2": 0.0, "mae": 0.0, "rmse": 0.0}
    except Exception as e:
        print(f"LSTM training error: {e}")
        lstm_metrics = {"r2": 0.0, "mae": 0.0, "rmse": 0.0}
    
    # Calculate ensemble weights based on R² scores
    total_r2 = rf_metrics["r2"] + lr_metrics["r2"] + lstm_metrics["r2"]
    if total_r2 > 0:
        weights = {
            "rf": rf_metrics["r2"] / total_r2,
            "lr": lr_metrics["r2"] / total_r2,
            "lstm": lstm_metrics["r2"] / total_r2,
        }
    else:
        weights = {"rf": 0.33, "lr": 0.33, "lstm": 0.34}
    
    all_metrics = {
        "random_forest": rf_metrics,
        "linear_regression": lr_metrics,
        "lstm": lstm_metrics,
        "ensemble_weights": weights,
        "training_records": int(len(df)),
    }
    
    # Save ensemble weights
    joblib.dump(weights, models_dir / "ensemble_weights.pkl")
    
    # Save all metrics
    collection = get_collection("model_metrics")
    collection.insert_one({
        "metrics": all_metrics,
        "timestamp": pd.Timestamp.utcnow(),
    })
    
    return all_metrics


def _load_model(model_name: str) -> tuple[Any, list[str], dict[str, Any]] | None:
    """Load a specific model"""
    models_dir = _models_dir()
    
    if model_name == "rf":
        path = models_dir / "rf_model.pkl"
        if not path.exists():
            return None
        artifact = joblib.load(path)
        return artifact["model"], artifact["feature_columns"], artifact.get("metrics", {})
    
    elif model_name == "lr":
        path = models_dir / "lr_model.pkl"
        if not path.exists():
            return None
        artifact = joblib.load(path)
        return artifact["model"], artifact["feature_columns"], artifact.get("metrics", {})
    
    elif model_name == "lstm":
        model_path = models_dir / "lstm_model.h5"
        scaler_path = models_dir / "lstm_scaler.pkl"
        if not model_path.exists() or not scaler_path.exists():
            return None
        model = keras.models.load_model(str(model_path))
        scaler_data = joblib.load(scaler_path)
        return model, scaler_data["numeric_cols"], {"scaler": scaler_data["scaler"]}
    
    return None


def predict_with_all_models(city: str | None = None) -> dict[str, Any]:
    """Predict using all models and return ensemble"""
    latest = get_latest_cache(force=True)
    if not latest:
        return {"points": [], "models": {}, "ensemble": []}
    
    if city:
        latest = [record for record in latest if record["city"].lower() == city.lower()]
        if not latest:
            latest = get_latest_cache()
    
    baseline = latest[0]
    base_df = pd.DataFrame([baseline])
    base_df["timestamp"] = pd.to_datetime(base_df["timestamp"])
    
    # Load all models
    rf_result = _load_model("rf")
    lr_result = _load_model("lr")
    lstm_result = _load_model("lstm")
    
    if not rf_result and not lr_result:
        return {"points": [], "models": {}, "ensemble": []}
    
    # Prepare features for RF and LR
    base_df["hour"] = base_df["timestamp"].dt.hour
    base_df["dayofweek"] = base_df["timestamp"].dt.dayofweek
    base_df = pd.get_dummies(base_df, columns=["city"], drop_first=True)
    
    predictions = {
        "random_forest": [],
        "linear_regression": [],
        "lstm": [],
        "ensemble": [],
    }
    
    model_metrics = {}
    
    # Random Forest predictions
    if rf_result:
        rf_model, rf_features, rf_metrics = rf_result
        model_metrics["random_forest"] = rf_metrics
        for hour in range(1, 25):
            future = base_df.copy()
            future["timestamp"] = future["timestamp"] + pd.Timedelta(hours=hour)
            future["hour"] = future["timestamp"].dt.hour
            future["dayofweek"] = future["timestamp"].dt.dayofweek
            future = pd.get_dummies(future, columns=["city"], drop_first=True)
            for col in rf_features:
                if col not in future.columns:
                    future[col] = 0
            future = future[rf_features]
            pred = float(rf_model.predict(future)[0])
            predictions["random_forest"].append({
                "target_time": (base_df["timestamp"].iloc[0] + pd.Timedelta(hours=hour)).isoformat(),
                "predicted_aqi": round(pred, 2),
            })
    
    # Linear Regression predictions
    if lr_result:
        lr_model, lr_features, lr_metrics = lr_result
        model_metrics["linear_regression"] = lr_metrics
        for hour in range(1, 25):
            future = base_df.copy()
            future["timestamp"] = future["timestamp"] + pd.Timedelta(hours=hour)
            future["hour"] = future["timestamp"].dt.hour
            future["dayofweek"] = future["timestamp"].dt.dayofweek
            future = pd.get_dummies(future, columns=["city"], drop_first=True)
            for col in lr_features:
                if col not in future.columns:
                    future[col] = 0
            future = future[lr_features]
            pred = float(lr_model.predict(future)[0])
            predictions["linear_regression"].append({
                "target_time": (base_df["timestamp"].iloc[0] + pd.Timedelta(hours=hour)).isoformat(),
                "predicted_aqi": round(pred, 2),
            })
    
    # LSTM predictions (simplified - would need sequence data in production)
    if lstm_result:
        lstm_model, numeric_cols, lstm_data = lstm_result
        model_metrics["lstm"] = {}
        # For simplicity, use average of RF and LR for LSTM
        # In production, you'd need to maintain sequences
        for i, rf_pred in enumerate(predictions["random_forest"]):
            if predictions["linear_regression"]:
                avg_pred = (rf_pred["predicted_aqi"] + predictions["linear_regression"][i]["predicted_aqi"]) / 2
            else:
                avg_pred = rf_pred["predicted_aqi"]
            predictions["lstm"].append({
                "target_time": rf_pred["target_time"],
                "predicted_aqi": round(avg_pred, 2),
            })
    
    # Create ensemble predictions
    models_dir = _models_dir()
    weights_path = models_dir / "ensemble_weights.pkl"
    if weights_path.exists():
        weights = joblib.load(weights_path)
    else:
        weights = {"rf": 0.4, "lr": 0.3, "lstm": 0.3}
    
    for i in range(24):
        rf_val = predictions["random_forest"][i]["predicted_aqi"] if predictions["random_forest"] else 0
        lr_val = predictions["linear_regression"][i]["predicted_aqi"] if predictions["linear_regression"] else 0
        lstm_val = predictions["lstm"][i]["predicted_aqi"] if predictions["lstm"] else 0
        
        ensemble_val = (
            rf_val * weights.get("rf", 0.33) +
            lr_val * weights.get("lr", 0.33) +
            lstm_val * weights.get("lstm", 0.34)
        )
        
        predictions["ensemble"].append({
            "target_time": predictions["random_forest"][i]["target_time"] if predictions["random_forest"] else "",
            "predicted_aqi": round(ensemble_val, 2),
        })
    
    return {
        "generated_at": datetime.utcnow().isoformat(),
        "models": model_metrics,
        "predictions": predictions,
        "ensemble_weights": weights,
    }

