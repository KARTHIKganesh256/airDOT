from __future__ import annotations

import atexit

from flask import Flask
from flask_cors import CORS

from .config import get_settings
from .routes import api_blueprint
from .scheduler import init_scheduler


def create_app() -> Flask:
    settings = get_settings()
    app = Flask(settings.project_name)
    CORS(
        app,
        origins=settings.cors_origins,
        supports_credentials=True,
    )

    app.register_blueprint(api_blueprint, url_prefix="/api")

    scheduler = init_scheduler(app)

    @app.route("/health", methods=["GET"])
    def healthcheck() -> dict[str, str]:
        return {"status": "ok", "service": settings.project_name}

    @app.route("/", methods=["GET"])
    def root() -> dict[str, str]:
        return {"message": "AeroSense API"}

    if not scheduler.running:
        scheduler.start()

    atexit.register(lambda: scheduler.shutdown(wait=False) if scheduler.running else None)

    return app


app = create_app()



