from __future__ import annotations

from flask import Blueprint

from .api import register_routes

api_blueprint = Blueprint("api", __name__)
register_routes(api_blueprint)





