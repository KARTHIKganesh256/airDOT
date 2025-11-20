from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path
from typing import Any, Generator, Iterable, Mapping

from bson import ObjectId


class MockCursor:
    def __init__(self, data: list[dict[str, Any]]):
        self._data = data

    def __iter__(self) -> Generator[dict[str, Any], None, None]:
        yield from self._data

    def sort(self, key_or_list: Any, direction: Any = None) -> MockCursor:
        # Basic sort support
        if isinstance(key_or_list, str):
            key = key_or_list
            reverse = direction == -1
            self._data.sort(key=lambda x: x.get(key, 0), reverse=reverse)
        return self

    def limit(self, limit: int) -> MockCursor:
        self._data = self._data[:limit]
        return self
    
    def to_list(self, length: int | None = None) -> list[dict[str, Any]]:
        return self._data


class MockCollection:
    def __init__(self, name: str, data: list[dict[str, Any]]):
        self.name = name
        self._data = data

    def find(self, filter: dict[str, Any] | None = None) -> MockCursor:
        if not filter:
            return MockCursor(list(self._data))
        
        result = []
        for doc in self._data:
            match = True
            for k, v in filter.items():
                if doc.get(k) != v:
                    match = False
                    break
            if match:
                result.append(doc)
        return MockCursor(result)

    def insert_one(self, document: dict[str, Any]) -> Any:
        if "_id" not in document:
            document["_id"] = ObjectId()
        self._data.append(document)
        
        # Persist to file for continuity (optional, but good for "real" feel)
        self._save_to_file()
        
        class InsertResult:
            inserted_id = document["_id"]
        return InsertResult()

    def count_documents(self, filter: dict[str, Any]) -> int:
        return len(list(self.find(filter)))

    def aggregate(self, pipeline: list[dict[str, Any]]) -> MockCursor:
        # Very basic aggregation support for the specific query in readings.py
        # Pipeline used: sort by city/time, group by city to get latest
        
        # 1. Sort
        # We'll just take the latest for each city manually
        latest_by_city = {}
        for doc in self._data:
            city = doc.get("city")
            if not city:
                continue
            
            current_latest = latest_by_city.get(city)
            if not current_latest:
                latest_by_city[city] = doc
            else:
                # Compare timestamps
                ts_doc = doc.get("timestamp")
                ts_curr = current_latest.get("timestamp")
                
                # Handle string vs datetime
                if isinstance(ts_doc, str):
                    try:
                        ts_doc = datetime.fromisoformat(ts_doc)
                    except: pass
                if isinstance(ts_curr, str):
                    try:
                        ts_curr = datetime.fromisoformat(ts_curr)
                    except: pass

                if ts_doc and ts_curr and ts_doc > ts_curr:
                    latest_by_city[city] = doc
        
        # Format as expected by the aggregation result: {"doc": ...}
        result = [{"doc": doc} for doc in latest_by_city.values()]
        return MockCursor(result)

    def _save_to_file(self):
        # Simple persistence
        pass


class MockDatabase:
    def __init__(self):
        self._collections: dict[str, MockCollection] = {}
        # Seed some data
        self._seed_data()

    def __getitem__(self, name: str) -> MockCollection:
        if name not in self._collections:
            self._collections[name] = MockCollection(name, [])
        return self._collections[name]

    def _seed_data(self):
        # Add some dummy readings so the app isn't empty
        readings = [
            {
                "city": "Hyderabad",
                "state": "Telangana",
                "latitude": 17.3850,
                "longitude": 78.4867,
                "pm25": 45.0,
                "pm10": 80.0,
                "co2": 400.0,
                "no2": 20.0,
                "temperature": 28.0,
                "humidity": 60.0,
                "timestamp": datetime.utcnow().isoformat()
            },
            {
                "city": "Warangal",
                "state": "Telangana",
                "latitude": 17.9689,
                "longitude": 79.5941,
                "pm25": 35.0,
                "pm10": 65.0,
                "co2": 380.0,
                "no2": 15.0,
                "temperature": 29.0,
                "humidity": 55.0,
                "timestamp": datetime.utcnow().isoformat()
            }
        ]
        self._collections["readings"] = MockCollection("readings", readings)


class MockClient:
    def __init__(self, uri: str, **kwargs):
        self.uri = uri
        self._db = MockDatabase()

    def __getitem__(self, name: str) -> MockDatabase:
        return self._db
