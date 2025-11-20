from __future__ import annotations

from flask import Blueprint, jsonify, request

from ..services.alerts import get_recent_alerts
from ..services.aqi import get_category_palette
from ..services.model import predict_next_24, train_model_if_needed
from ..services.readings import (
    get_history,
    get_latest_cache,
    get_map_overlay,
    save_reading,
)


def register_routes(bp: Blueprint) -> None:
    @bp.get("/latest")
    def latest():
        latest = get_latest_cache(force=True)
        data = {
            "updated_at": latest[0]["timestamp"] if latest else None,
            "readings": latest,
            "alerts": get_recent_alerts(),
            "palette": get_category_palette(),
        }
        return jsonify(data)

    @bp.get("/history")
    def history():
        city = request.args.get("city")
        limit = int(request.args.get("limit", 200))
        if not city:
            return jsonify({"error": "city parameter is required"}), 400
        return jsonify({"city": city, "readings": get_history(city, limit)})

    @bp.get("/mapdata")
    def mapdata():
        return jsonify(get_map_overlay())

    @bp.get("/predict")
    def predict():
        city = request.args.get("city")
        result = predict_next_24(city=city)
        return jsonify(result)

    @bp.post("/ingest")
    def ingest():
        payload = request.get_json(force=True, silent=True)
        if not payload:
            return jsonify({"error": "Invalid payload"}), 400
        doc_id = save_reading(payload)
        return jsonify({"inserted_id": doc_id}), 201

    @bp.post("/train")
    def trigger_train():
        metrics = train_model_if_needed(force=True)
        return jsonify(metrics or {"status": "no-data"})



