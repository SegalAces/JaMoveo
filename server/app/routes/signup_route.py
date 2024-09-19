from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from app.models.models import User
from app.utils import get_db

router = APIRouter()

class SignupRequest(BaseModel):
    username: str
    password: str
    instrument: str
    role: str

@router.post("/signup")
async def create_user(request: SignupRequest, db = Depends(get_db)):  # Use Depends for db
    try:
        # Check if the username already exists
        existing_user = await db['users'].find_one({"username": request.username})
        print(f"Existing user check response: {existing_user}")
        if existing_user:
            raise HTTPException(status_code=400, detail="Username already exists")

        # Create user instance
        user = User(
            username=request.username,
            password=request.password,
            instrument=request.instrument,
            role=request.role
        )
        
        # Prepare user data for insertion
        user_data = user.model_dump()
        print(f"User data to be inserted: {user_data}")
        
        # Insert user into the database
        result = await db['users'].insert_one(user_data)
        
        # Check if the insertion was successful
        if result.inserted_id is None:
            raise HTTPException(status_code=500, detail="User insertion failed")

        print(f"Insert result: {result.inserted_id}")

        return {"message": "User created successfully"}
    
    except HTTPException as http_err:
        # Re-raise the HTTPException for FastAPI to handle
        raise http_err  
    except Exception as e:
        print(f"Error occurred during user signup: {e}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred.")