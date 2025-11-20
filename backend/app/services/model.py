from __future__ import annotations

from datetime import datetime
from pathlib import Path
from typing import Any

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score

from ..config import get_settings
from ..db import get_collection
from .readings import get_latest_cache, get_recent_history

settings = get_settings()


def _model_path() -> Path:
    settings.models_dir.mkdir(parents=True, exist_ok=True)
    return settings.models_dir / settings.model_filename


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


def train_model_if_needed(force: bool = False) -> dict[str, Any] | None:
    df = _load_dataframe()
    if df is None or df.empty:
        return None

    path = _model_path()
    if path.exists() and not force:
        # Already trained recently; skip to avoid thrashing.
        return {"status": "cached"}

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
        "training_records": int(len(df)),
    }

    joblib.dump({"model": model, "feature_columns": features.columns.tolist(), "metrics": metrics}, path)

    collection = get_collection("model_metrics")
    collection.insert_one(
        {
            "metrics": metrics,
            "timestamp": pd.Timestamp.utcnow(),
        }
    )
    return metrics


def _load_model() -> tuple[RandomForestRegressor, list[str], dict[str, Any]] | None:
    path = _model_path()
    if not path.exists():
        train_model_if_needed(force=True)
        if not path.exists():
            return None
    artifact: dict[str, Any] = joblib.load(path)
    return artifact["model"], artifact["feature_columns"], artifact.get("metrics", {})


def predict_next_24(city: str | None = None) -> dict[str, Any]:
    artifact = _load_model()
    if artifact is None:
        return {"points": [], "metrics": None}

    model, feature_columns, metrics = artifact

    latest = get_latest_cache(force=True)
    if not latest:
        return {"points": [], "metrics": metrics}

    if city:
        latest = [record for record in latest if record["city"].lower() == city.lower()]
        if not latest:
            latest = get_latest_cache()

    baseline = latest[0]
    base_df = pd.DataFrame([baseline])
    base_df["timestamp"] = pd.to_datetime(base_df["timestamp"])

    projections = []
    for hour in range(1, 25):
        future = base_df.copy()
        future["timestamp"] = future["timestamp"] + pd.Timedelta(hours=hour)
        future["hour"] = future["timestamp"].dt.hour
        future["dayofweek"] = future["timestamp"].dt.dayofweek
        future = pd.get_dummies(future, columns=["city"], drop_first=True)
        for col in feature_columns:
            if col not in future.columns:
                future[col] = 0
        future = future[feature_columns]
        predicted_aqi = float(model.predict(future)[0])
        projections.append(
            {
                "target_time": future.index[0],
                "predicted_aqi": round(predicted_aqi, 2),
            }
        )

    for point in projections:
        point["target_time"] = pd.Timestamp(point["target_time"]).isoformat()

    return {
        "generated_at": datetime.utcnow().isoformat(),
        "points": projections,
        "metrics": metrics,
    }


