from fastapi import APIRouter, HTTPException, Request, Depends
from app.utils import SECRET_KEY, ALGORITHM, get_db
import jwt

router = APIRouter()

@router.get("/validate_token")
async def validate_token(request: Request, db = Depends(get_db)):
    token = request.headers.get("Authorization")
    if not token:
        raise HTTPException(status_code=401, detail="Token is missing")
    
    # Remove "Bearer " prefix if it exists
    token = token.replace("Bearer ", "")
    
    try:
        # Decode the token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        
        if not username:
            raise HTTPException(status_code=401, detail="Invalid token payload")
        
        # Fetch user from the database
        user = await db['users'].find_one({"username": username})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Return user information
        return {
            "username": user['username'],
            "role": "admin" if (user.get('role', 'user') == 'admin') else "user",
            "instrument": user.get('instrument', 'vocals')  # Ensure 'instrument' defaults to 'vocals' if not found
        }
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    except Exception as e:  # Generic exception handling for unexpected errors
        print(f"Unexpected error: {e}")  # Log the error for debugging
        raise HTTPException(status_code=500, detail="Internal server error")