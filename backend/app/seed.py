from __future__ import annotations

import argparse
import math
import random
from datetime import datetime, timedelta, timezone
from typing import Sequence

from .db import get_collection
from .services.aqi import compute_aqi


CITIES: Sequence[dict[str, float | str]] = [
    {"city": "Hyderabad", "state": "Telangana", "latitude": 17.3850, "longitude": 78.4867},
    {"city": "Warangal", "state": "Telangana", "latitude": 17.9689, "longitude": 79.5941},
    {"city": "Nizamabad", "state": "Telangana", "latitude": 18.6725, "longitude": 78.0941},
    {"city": "Karimnagar", "state": "Telangana", "latitude": 18.4385, "longitude": 79.1288},
    {"city": "Vijayawada", "state": "Andhra Pradesh", "latitude": 16.5062, "longitude": 80.6480},
    {"city": "Visakhapatnam", "state": "Andhra Pradesh", "latitude": 17.6868, "longitude": 83.2185},
    {"city": "Tirupati", "state": "Andhra Pradesh", "latitude": 13.6288, "longitude": 79.4192},
    {"city": "Guntur", "state": "Andhra Pradesh", "latitude": 16.3067, "longitude": 80.4365},
]


def gaussian(base: float, variation: float) -> float:
    return max(0.0, random.gauss(base, variation))


def seasonal_factor(index: int) -> float:
    return math.sin(index / 24 * 2 * math.pi) * 10


def generate_readings(days: int, interval_minutes: int) -> list[dict]:
    now = datetime.now(timezone.utc).replace(second=0, microsecond=0)
    total_points = int(days * 24 * 60 / interval_minutes)
    documents = []

    for point in range(total_points):
        timestamp = now - timedelta(minutes=interval_minutes * (total_points - point))
        variation = seasonal_factor(point)

        for city in CITIES:
            base_pm25 = 40 if city["state"] == "Telangana" else 35
            base_pm10 = 80 if city["state"] == "Telangana" else 70

            pm25 = gaussian(base_pm25 + variation, 6.0)
            pm10 = gaussian(base_pm10 + variation, 10.0)
            co2 = gaussian(550 + variation * 5, 35.0)
            no2 = gaussian(30 + variation * 1.5, 6.0)
            temperature = gaussian(31 if city["state"] == "Telangana" else 30, 1.8)
            humidity = max(20.0, min(95.0, gaussian(55 - variation, 4.0)))

            aqi_meta = compute_aqi(
                {
                    "pm25": pm25,
                    "pm10": pm10,
                    "co2": co2,
                    "no2": no2,
                }
            )

            documents.append(
                {
                    "city": city["city"],
                    "state": city["state"],
                    "latitude": city["latitude"],
                    "longitude": city["longitude"],
                    "pm25": round(pm25, 2),
                    "pm10": round(pm10, 2),
                    "co2": round(co2, 2),
                    "no2": round(no2, 2),
                    "temperature": round(temperature, 2),
                    "humidity": round(humidity, 2),
                    "aqi": aqi_meta["aqi"],
                    "category": aqi_meta["category"],
                    "color": aqi_meta["color"],
                    "health": aqi_meta["health"],
                    "timestamp": timestamp,
                }
            )
    return documents


def seed_database(days: int, interval: int, drop_existing: bool = False) -> dict[str, int]:
    readings = get_collection("readings")
    if drop_existing:
        readings.drop()

    documents = generate_readings(days=days, interval_minutes=interval)
    if documents:
        readings.insert_many(documents)
    return {"inserted": len(documents)}


def main() -> None:
    parser = argparse.ArgumentParser(description="Seed MongoDB with synthetic AQI data.")
    parser.add_argument("--days", type=int, default=7, help="Number of days to seed.")
    parser.add_argument(
        "--interval", type=int, default=60, help="Minutes between readings."
    )
    parser.add_argument(
        "--drop", action="store_true", help="Drop existing readings collection first."
    )
    args = parser.parse_args()

    result = seed_database(days=args.days, interval=args.interval, drop_existing=args.drop)
    print(f"Inserted {result['inserted']} readings.")


if __name__ == "__main__":
    main()








