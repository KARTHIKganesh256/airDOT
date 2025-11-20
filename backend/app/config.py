from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    project_name: str = "AeroSense"
    cors_origins: list[str] = Field(
        default_factory=lambda: [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
        ]
    )

    mongo_uri: str = Field(default="mongodb://localhost:27017")
    mongo_db: str = Field(default="aerosense")

    models_dir: Path = Field(default=Path("./models"))
    model_filename: str = Field(default="rf_aqi_model.pkl")

    retrain_interval_minutes: int = Field(default=30)
    refresh_latest_interval_seconds: int = Field(default=5)
    history_limit: int = Field(default=500)

    telangana_geojson_path: Path = Field(
        default=Path("./data/geo/ts_ap_districts.geojson")
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()


