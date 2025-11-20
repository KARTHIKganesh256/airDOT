from __future__ import annotations

from typing import NamedTuple

import numpy as np


class AQICategory(NamedTuple):
    name: str
    range: tuple[int, int]
    color: str
    health: str


AQI_SCALE = [
    AQICategory("Good", (0, 50), "#00E400", "Air quality is satisfactory."),
    AQICategory(
        "Moderate",
        (51, 100),
        "#FFFF00",
        "Acceptable; some pollutants may be a moderate concern.",
    ),
    AQICategory(
        "Unhealthy for Sensitive Groups",
        (101, 150),
        "#FF7E00",
        "Sensitive groups should limit outdoor exertion.",
    ),
    AQICategory(
        "Unhealthy", (151, 200), "#FF0000", "Everyone may begin to experience effects."
    ),
    AQICategory(
        "Very Unhealthy",
        (201, 300),
        "#8F3F97",
        "Health warnings of emergency conditions.",
    ),
    AQICategory(
        "Hazardous",
        (301, 500),
        "#7E0023",
        "Serious risk for entire population.",
    ),
]


POLLUTANT_BREAKPOINTS = {
    "pm25": [
        (0.0, 12.0, 0, 50),
        (12.1, 35.4, 51, 100),
        (35.5, 55.4, 101, 150),
        (55.5, 150.4, 151, 200),
        (150.5, 250.4, 201, 300),
        (250.5, 350.4, 301, 400),
        (350.5, 500.4, 401, 500),
    ],
    "pm10": [
        (0, 54, 0, 50),
        (55, 154, 51, 100),
        (155, 254, 101, 150),
        (255, 354, 151, 200),
        (355, 424, 201, 300),
        (425, 504, 301, 400),
        (505, 604, 401, 500),
    ],
    "no2": [
        (0, 53, 0, 50),
        (54, 100, 51, 100),
        (101, 360, 101, 150),
        (361, 649, 151, 200),
        (650, 1249, 201, 300),
        (1250, 1649, 301, 400),
        (1650, 2049, 401, 500),
    ],
    "co2": [
        (0, 600, 0, 50),
        (601, 1000, 51, 100),
        (1001, 1500, 101, 150),
        (1501, 2000, 151, 200),
        (2001, 5000, 201, 300),
        (5001, 10000, 301, 400),
        (10001, 20000, 401, 500),
    ],
}


def _linear_scale(value: float, bp_low: float, bp_high: float, aqi_low: int, aqi_high: int) -> float:
    return ((aqi_high - aqi_low) / (bp_high - bp_low)) * (value - bp_low) + aqi_low


def _aqi_for_pollutant(pollutant: str, value: float | None) -> float | None:
    if value is None:
        return None
    breakpoints = POLLUTANT_BREAKPOINTS.get(pollutant)
    if not breakpoints:
        return None

    for bp_low, bp_high, aqi_low, aqi_high in breakpoints:
        if bp_low <= value <= bp_high:
            return _linear_scale(value, bp_low, bp_high, aqi_low, aqi_high)

    bp_low, bp_high, aqi_low, aqi_high = breakpoints[-1]
    if value > bp_high:
        return _linear_scale(value, bp_low, bp_high, aqi_low, aqi_high)
    return None


def compute_aqi(payload: dict[str, float | None]) -> dict[str, float | str]:
    pollutant_aqis = {
        pollutant: _aqi_for_pollutant(pollutant, payload.get(pollutant))
        for pollutant in POLLUTANT_BREAKPOINTS
    }
    pollutant_aqis = {k: v for k, v in pollutant_aqis.items() if v is not None}
    if not pollutant_aqis:
        return {
            "aqi": 0,
            "category": "Unknown",
            "color": "#9ca3af",
            "health": "Insufficient data",
            "primary_pollutant": None,
        }

    primary_pollutant = max(pollutant_aqis, key=pollutant_aqis.get)
    aqi_value = int(round(float(pollutant_aqis[primary_pollutant])))

    category = next(
        (cat for cat in AQI_SCALE if cat.range[0] <= aqi_value <= cat.range[1]),
        AQI_SCALE[-1],
    )

    return {
        "aqi": aqi_value,
        "category": category.name,
        "color": category.color,
        "health": category.health,
        "primary_pollutant": primary_pollutant,
    }


def get_category_palette() -> dict[str, str]:
    return {cat.name: cat.color for cat in AQI_SCALE}


def rolling_average(values: list[float], window: int = 6) -> float:
    if not values:
        return 0.0
    arr = np.array(values[-window:])
    return float(np.mean(arr))





