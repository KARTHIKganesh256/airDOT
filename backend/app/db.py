from __future__ import annotations

from functools import lru_cache
from typing import Any

from pymongo import MongoClient
from pymongo.collection import Collection
from pymongo.database import Database

from .config import get_settings


@lru_cache
def get_client() -> MongoClient[Any]:
    settings = get_settings()
    # return MongoClient(settings.mongo_uri, serverSelectionTimeoutMS=2000)
    # Fallback to Mock DB for this environment
    from .mock_db import MockClient
    print("WARNING: Using Mock Database")
    return MockClient(settings.mongo_uri)


def get_database() -> Database[Any]:
    client = get_client()
    settings = get_settings()
    return client[settings.mongo_db]


def get_collection(name: str) -> Collection[Any]:
    db = get_database()
    return db[name]







