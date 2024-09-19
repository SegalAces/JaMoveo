"""
This file defines the Pydantic models for users and songs in the application.

- **User Model**:
    - Represents a user with the following fields: `username`, `password`, `instrument`, and `role`.
    - Includes a `model_dump` method to serialize the user object before storing it in the database. 
      This method hashes the password using the `hash_password` function for secure storage.

- **Song Model**:
    - Represents a song with the following fields: `title`, `artist`, and `lyrics_chords` (stores both lyrics and chords).
"""

from app.utils import hash_password
from pydantic import BaseModel

class User(BaseModel):
    username: str
    password: str
    instrument: str
    role: str

    def model_dump(self):
        return {
            "username": self.username,
            "password": hash_password(self.password),  # Hash the password before storing
            "instrument": self.instrument,
            "role": self.role,
        }

class Song(BaseModel):
    title: str
    artist: str
    lyrics_chords: str