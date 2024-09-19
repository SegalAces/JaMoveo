import asyncio
import logging
import json
from fastapi import APIRouter, WebSocket, HTTPException
from fastapi.websockets import WebSocketDisconnect, WebSocketState
from typing import List
from bson import ObjectId

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()
clients: List[WebSocket] = []  # List to hold connected clients
clients_lock = asyncio.Lock()  # Lock for thread safety

@router.websocket("/ws/notifications")
async def notifications_websocket_endpoint(websocket: WebSocket):
    db = websocket.app.state.db  # Access db from app state
    await websocket.accept()

    async with clients_lock:
        clients.append(websocket)
    logger.info("WebSocket connection established")

    await send_current_rehearsal_state([websocket], db)

    try:
        while True:
            data = await websocket.receive_text()
            logger.info(f"Received data: {data}")

            message = json.loads(data)
            action = message.get("action")

            if action == "start_rehearsal":
                logger.info("Starting rehearsal")
                await manage_rehearsal_state("active", None, db)
            elif action == "stop_rehearsal":
                if await is_admin(message.get("username"), db):
                    logger.info("Stopping rehearsal")
                    await manage_rehearsal_state("inactive", None, db)
                else:
                    logger.warning("Unauthorized attempt to stop rehearsal")
                    raise HTTPException(status_code=403, detail="User is not authorized to stop the rehearsal.")
            elif action == "song_chosen":
                song_id = message.get("song_id")
                logger.info(f"Song chosen: {song_id}")
                await manage_rehearsal_state("active", song_id, db)
            elif action == "song_not_chosen":
                logger.info("Song not chosen, updating rehearsal state")
                rehearsal_state, current_song = await get_rehearsal_state_and_song(db)
                await manage_rehearsal_state(rehearsal_state, None, db)

            await send_current_rehearsal_state(clients, db)

    except WebSocketDisconnect:
        async with clients_lock:
            if websocket in clients:
                clients.remove(websocket)
                logger.info("WebSocket connection closed")
    except HTTPException as e:
        logger.error(f"HTTP Exception: {e.detail}")
        if websocket.client_state == WebSocketState.CONNECTED:
            await websocket.send_text(json.dumps({"error": e.detail}))
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        if websocket.client_state == WebSocketState.CONNECTED:
            await websocket.send_text(json.dumps({"error": f"Unexpected server error: {str(e)}"}))
    finally:
        async with clients_lock:
            if websocket in clients:
                clients.remove(websocket)
                logger.info("WebSocket cleaned up after disconnect.")

async def manage_rehearsal_state(rehearsal_state: str, song_id: str, db):
    song_title = None
    message = "Rehearsal state updated successfully"
    logger.info(f"Managing rehearsal state: {rehearsal_state}, song id: {song_id}")
    try:
        if song_id:
            res = await db['songs'].find_one({"_id": ObjectId(song_id)})
            if not res:
                raise HTTPException(status_code=404, detail=f"Song with ID {song_id} not found.")
            song_title = res['title']
        
        res = await db['rehearsal session'].update_one({}, {
            "$set": {
                "rehearsal_state": rehearsal_state,
                "current_song_id": song_id,
                "current_song_title": song_title
            }
        })
        if res.matched_count == 0:
            raise HTTPException(status_code=500, detail="Error updating rehearsal state")
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    return {"message": message}

async def get_rehearsal_state_and_song(db):
    logger.info("Fetching rehearsal state and song")
    try:
        res = await db['rehearsal session'].find_one()
        if not res:
            return "inactive", None  # No document in the collection

        current_song = None
        if res.get('rehearsal_state') == 'active' and res.get('current_song_id'):
            current_song = await db['songs'].find_one({"_id": ObjectId(res['current_song_id'])})
            if not current_song:
                raise HTTPException(status_code=404, detail=f"Song with ID {res['current_song_id']} not found.")
        
        return res.get('rehearsal_state', 'inactive'), current_song

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching rehearsal state and song: {str(e)}")

async def send_current_rehearsal_state(clients: List[WebSocket], db):
    rehearsal_state, current_song = await get_rehearsal_state_and_song(db)
    if current_song:
        current_song = serialize_song(current_song)

    message = json.dumps({
        "rehearsal_state": rehearsal_state,
        "current_song": current_song if current_song else None
    })
    logger.info("Sending rehearsal state...")
    
    if clients:
        send_tasks = []
        disconnected_clients = []
        for client in clients:
            try:
                send_tasks.append(client.send_text(message))
            except Exception as e:
                logger.error(f"Error sending message to client: {str(e)}")
                disconnected_clients.append(client)
        await asyncio.gather(*send_tasks, return_exceptions=True)

        async with clients_lock:
            for client in disconnected_clients:
                if client in clients:
                    clients.remove(client)
    else:
        logger.info("No clients connected.")

def serialize_song(song):
    song['_id'] = str(song['_id']) 
    return song

async def is_admin(username: str, db) -> bool:
    try:
        user = await db['users'].find_one({"username": username})
        if not user:
            raise HTTPException(status_code=404, detail=f"User {username} not found.")
        return user['role'] == 'admin'
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error checking admin role: {str(e)}")