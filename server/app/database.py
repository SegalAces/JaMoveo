import os
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import ServerSelectionTimeoutError

# Function to initialize MongoDB connection
async def connect_to_db():
    mongo_url = os.getenv('MONGO_URL')
    if not mongo_url:
        raise Exception("MONGO_URL environment variable is not set")
    
    try:
        # Create the Motor client
        client = AsyncIOMotorClient(mongo_url)
        db = client['JaMoveo']  # Access the specific database
        print("Connected to MongoDB!")
        return db, client  # Return both db and client
    except ServerSelectionTimeoutError as err:
        print(f"Could not connect to MongoDB: {err}")
        raise err

# Function to close MongoDB connection
async def close_db_connection(client):
    client.close()