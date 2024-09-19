from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from app.utils import verify_password, create_access_token, get_db
import datetime

router = APIRouter()

# JWT configuration
ACCESS_TOKEN_EXPIRE_MINUTES = 10

# Request body model for login
class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/login")
async def login(request: LoginRequest, db = Depends(get_db)):
    try:
        # Find user by username
        user = await db['users'].find_one({"username": request.username})
        
        # Check if user exists and password is correct
        if not user or not verify_password(request.password, user['password']):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        # Create JWT token
        access_token_expires = datetime.timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user['username']},
            expires_delta=access_token_expires
        )
        
        return {"access_token": access_token, "token_type": "bearer"}
    
    except HTTPException as http_err:
        # Re-raise the HTTPException for FastAPI to handle
        raise http_err  
    except Exception as e:
        print(f"Error occurred during login: {e}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred.")