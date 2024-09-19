from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.database import connect_to_db, close_db_connection
from app.routes import router as api_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting up... connecting to MongoDB.")
    db, client = await connect_to_db()  # Initialize the database and client
    app.state.db = db  # Store the db in the app state
    app.state.client = client  # Store the client in the app state
    yield
    print("Shutting down... closing MongoDB connection.")
    await close_db_connection(app.state.client)  # Close client

app = FastAPI(lifespan=lifespan)

# CORS settings (allow frontend to make requests)
origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the JaMoveo server side!"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)