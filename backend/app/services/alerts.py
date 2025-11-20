from __future__ import annotations

from datetime import datetime, timedelta

from ..db import get_collection
from .readings import get_latest_cache


ALERT_THRESHOLD = {
    "pm25": 90,
    "pm10": 150,
    "aqi": 150,
}


def refresh_alerts() -> None:
    latest = get_latest_cache(force=True)
    alerts_collection = get_collection("alerts")
    now = datetime.utcnow()

    active_alerts = []
    for reading in latest:
        messages = []
        if reading["aqi"] >= ALERT_THRESHOLD["aqi"]:
            messages.append(
                f"AQI reached {reading['aqi']} ({reading['category']}) in {reading['city']}."
            )
        if reading["pm25"] >= ALERT_THRESHOLD["pm25"]:
            messages.append(
                f"High PM2.5 concentration ({reading['pm25']:.1f} µg/m³) detected."
            )
        if reading["pm10"] >= ALERT_THRESHOLD["pm10"]:
            messages.append(
                f"Elevated PM10 levels ({reading['pm10']:.1f} µg/m³)."
            )

        if not messages:
            continue

        active_alerts.append(
            {
                "city": reading["city"],
                "state": reading["state"],
                "messages": messages,
                "category": reading["category"],
                "aqi": reading["aqi"],
                "color": reading["color"],
                "timestamp": now,
            }
        )

    if active_alerts:
        alerts_collection.delete_many({"timestamp": {"$lt": now - timedelta(hours=2)}})
        alerts_collection.insert_many(active_alerts)


def get_recent_alerts(limit: int = 10) -> list[dict[str, str]]:
    collection = get_collection("alerts")
    cursor = collection.find().sort("timestamp", -1).limit(limit)
    return [
        {
            "city": doc.get("city"),
            "category": doc.get("category"),
            "messages": doc.get("messages", []),
            "aqi": doc.get("aqi"),
            "color": doc.get("color"),
            "timestamp": doc.get("timestamp").isoformat() if doc.get("timestamp") else None,
        }
        for doc in cursor
    ]






