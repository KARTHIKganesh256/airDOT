from pymongo import MongoClient
from app.config import get_settings

def main():
    settings = get_settings()
    client = MongoClient(settings.mongo_uri, serverSelectionTimeoutMS=5000)
    db = client[settings.mongo_db]
    readings = db["readings"]
    count = readings.count_documents({})
    print(f"Readings count: {count}")

if __name__ == "__main__":
    main()
