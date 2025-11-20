from __future__ import annotations

from datetime import datetime, timedelta
from pathlib import Path
from typing import Any, TypedDict

from bson import ObjectId
from pymongo import ASCENDING, DESCENDING

from ..config import get_settings
from ..db import get_collection
from .aqi import compute_aqi


settings = get_settings()


class Reading(TypedDict, total=False):
    id: str
    city: str
    state: str
    latitude: float
    longitude: float
    pm25: float
    pm10: float
    co2: float
    no2: float
    temperature: float
    humidity: float
    aqi: int
    category: str
    color: str
    health: str
    primary_pollutant: str | None
    timestamp: datetime


_latest_cache: list[Reading] = []
_latest_updated_at: datetime | None = None
_map_geojson_cache: dict[str, Any] | None = None


def _serialize(doc: dict[str, Any]) -> Reading:
    meta = compute_aqi(
        {
            "pm25": doc.get("pm25"),
            "pm10": doc.get("pm10"),
            "co2": doc.get("co2"),
            "no2": doc.get("no2"),
        }
    )

    timestamp = doc.get("timestamp")
    if isinstance(timestamp, datetime):
        timestamp = timestamp.isoformat()

    return Reading(
        id=str(doc.get("_id", ObjectId())),
        city=doc.get("city", "Unknown"),
        state=doc.get("state", "Telangana"),
        latitude=doc.get("latitude", 0.0),
        longitude=doc.get("longitude", 0.0),
        pm25=doc.get("pm25", 0.0),
        pm10=doc.get("pm10", 0.0),
        co2=doc.get("co2", 0.0),
        no2=doc.get("no2", 0.0),
        temperature=doc.get("temperature", 0.0),
        humidity=doc.get("humidity", 0.0),
        aqi=meta["aqi"],
        category=meta["category"],
        color=meta["color"],
        health=meta["health"],
        primary_pollutant=meta["primary_pollutant"],
        timestamp=timestamp,
    )


def refresh_latest_cache() -> None:
    global _latest_cache, _latest_updated_at
    try:
        readings = get_collection("readings")
        pipeline = [
            {"$sort": {"city": ASCENDING, "timestamp": DESCENDING}},
            {
                "$group": {
                    "_id": "$city",
                    "doc": {"$first": "$$ROOT"},
                }
            }
        ]
        cursor = readings.aggregate(pipeline)
        docs = list(cursor)
        flattened = [doc.get("doc", {}) for doc in docs]
        if flattened:
            flattened.sort(key=lambda doc: doc.get("aqi", 0), reverse=True)
        _latest_cache = [_serialize(doc) for doc in flattened if doc]
        _latest_updated_at = datetime.utcnow()
    except Exception:
        _latest_cache = []
        _latest_updated_at = datetime.utcnow()


def get_latest_cache(force: bool = False) -> list[Reading]:
    if force or _latest_cache == [] or _is_cache_stale(_latest_updated_at, 10):
        refresh_latest_cache()
    return _latest_cache


def _is_cache_stale(updated_at: datetime | None, seconds: int) -> bool:
    if updated_at is None:
        return True
    return datetime.utcnow() - updated_at > timedelta(seconds=seconds)


def get_history(city: str, limit: int = 200) -> list[Reading]:
    try:
        collection = get_collection("readings")
        cursor = (
            collection.find({"city": city})
            .sort("timestamp", DESCENDING)
            .limit(min(limit, settings.history_limit))
        )
        return [_serialize(doc) for doc in cursor]
    except Exception:
        return []


def get_recent_history(limit: int = 200) -> list[Reading]:
    try:
        collection = get_collection("readings")
        cursor = (
            collection.find()
            .sort("timestamp", DESCENDING)
            .limit(min(limit, settings.history_limit))
        )
        return [_serialize(doc) for doc in cursor]
    except Exception:
        return []


def get_map_geojson() -> dict[str, Any]:
    global _map_geojson_cache
    if _map_geojson_cache is None:
        geo_path = Path(settings.telangana_geojson_path)
        if not geo_path.exists():
            _map_geojson_cache = {"type": "FeatureCollection", "features": []}
        else:
            _map_geojson_cache = geo_path.read_text(encoding="utf-8")
    if isinstance(_map_geojson_cache, str):
        import json

        _map_geojson_cache = json.loads(_map_geojson_cache)
    return _map_geojson_cache


def get_map_overlay() -> dict[str, Any]:
    latest = get_latest_cache()
    return {
        "updated_at": datetime.utcnow().isoformat(),
        "cities": [
            {
                "city": row["city"],
                "state": row["state"],
                "location": [row["latitude"], row["longitude"]],
                "aqi": row["aqi"],
                "category": row["category"],
                "color": row["color"],
                "health": row["health"],
            }
            for row in latest
        ],
        "geojson": get_map_geojson(),
    }


def save_reading(payload: dict[str, Any]) -> str:
    collection = get_collection("readings")
    payload["timestamp"] = payload.get("timestamp", datetime.utcnow())
    result = collection.insert_one(payload)
    refresh_latest_cache()
    return str(result.inserted_id)


