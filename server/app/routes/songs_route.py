from fastapi import APIRouter, Depends, HTTPException
from app.utils import get_db 
import re

router = APIRouter()

# Helper function to serialize ObjectId fields
def serialize_song(song):
    """Convert a song document to a serializable format."""
    if '_id' in song:
        song['_id'] = str(song['_id'])  # Convert ObjectId to string
    return song

# Function to detect Hebrew characters in the title
def contains_hebrew(text):
    hebrew_pattern = re.compile(r'[\u0590-\u05FF]')
    return bool(hebrew_pattern.search(text))

# Function to transpose the words order in each line
def transpose_song(song):
    if 'chords' in song and isinstance(song['chords'], list):
        for line in song['chords']:
            line.reverse()
    return song

# Helper function to find songs where the title contains all given words
async def find_songs_by_query(query: str, db):
    songs_collection = db['songs']  # Access the songs collection from db

    if not query.strip():  
        # If query is empty, return the first 50 songs
        cursor = songs_collection.find({}).limit(50)
    else:
        words = query.split()
        regex_patterns = [re.compile(f".*{re.escape(word)}.*", re.IGNORECASE) for word in words]
        query_conditions = [{"title": {"$regex": pattern}} for pattern in regex_patterns]
        cursor = songs_collection.find({"$and": query_conditions}).limit(50)
    
    songs = await cursor.to_list(None)
    return [serialize_song(song) for song in songs]

@router.get("/search/songs")
async def search_songs(query: str = "", db = Depends(get_db)):
    try:
        # If the query is empty, return the first 50 songs
        if not query:
            songs = await find_songs_by_query("", db)
            return {"songs": songs}  # Return the first 50 songs
        
        songs = await find_songs_by_query(query, db)

        # If there are no songs found for the query, return an empty list
        if not songs:
            return {"songs": []}

        # Check if the song title is in Hebrew and transpose if needed
        for song in songs:
            if contains_hebrew(song['title']):
                song = transpose_song(song)

        return {"songs": songs}
    except Exception as e:
        raise HTTPException(status_code=500, detail="An unexpected error occurred.")