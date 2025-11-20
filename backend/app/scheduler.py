from __future__ import annotations

from datetime import datetime, timedelta

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from flask import Flask

from .config import get_settings
from .services.alerts import refresh_alerts
from .services.model import train_model_if_needed
from .services.readings import refresh_latest_cache


def init_scheduler(app: Flask) -> BackgroundScheduler:
    settings = get_settings()
    scheduler = BackgroundScheduler()

    def job_wrapper(func):
        def inner():
            with app.app_context():
                func()

        return inner

    scheduler.add_job(
        job_wrapper(refresh_latest_cache),
        IntervalTrigger(seconds=settings.refresh_latest_interval_seconds),
        id="refresh_latest_cache",
        next_run_time=datetime.utcnow() + timedelta(seconds=5),
    )

    scheduler.add_job(
        job_wrapper(train_model_if_needed),
        IntervalTrigger(minutes=settings.retrain_interval_minutes),
        id="train_model",
        next_run_time=datetime.utcnow() + timedelta(seconds=10),
    )

    scheduler.add_job(
        job_wrapper(refresh_alerts),
        IntervalTrigger(minutes=5),
        id="refresh_alerts",
        next_run_time=datetime.utcnow() + timedelta(seconds=15),
    )

    return scheduler






