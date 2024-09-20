"""
WebSocket Notifications Endpoint for a Rehearsal Management System.

This module provides a WebSocket-based notification system to manage a rehearsal state and song selection in real-time. 
The primary functionality includes:
- Managing connected WebSocket clients.
- Sending updates about the rehearsal state (active/inactive) and the current song.
- Admin-only functionality for starting/stopping rehearsals and selecting songs.

Key Components:
- `clients`: A list of connected WebSocket clients.
- `notifications_websocket_endpoint`: Handles WebSocket connections, actions like starting/stopping rehearsal, and song selection.
- `manage_rehearsal_state`: Updates the rehearsal state and the current song in the database.
- `send_current_rehearsal_state`: Broadcasts the current rehearsal state and song to all connected clients.
- Error handling for invalid actions, WebSocket disconnections, and database errors.
"""

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

    await send_current_rehearsal_state([websocket], db)

    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            action = message.get("action")

            if action == "start_rehearsal":
                await manage_rehearsal_state("active", None, db)
            elif action == "stop_rehearsal":
                if await is_admin(message.get("username"), db):
                    await manage_rehearsal_state("inactive", None, db)
                else:
                    raise HTTPException(status_code=403, detail="User is not authorized to stop the rehearsal.")
            elif action == "song_chosen":
                song_id = message.get("song_id")
                await manage_rehearsal_state("active", song_id, db)
            elif action == "song_not_chosen":
                rehearsal_state, current_song = await get_rehearsal_state_and_song(db)
                await manage_rehearsal_state(rehearsal_state, None, db)

            await send_current_rehearsal_state(clients, db)

    except WebSocketDisconnect:
        async with clients_lock:
            if websocket in clients:
                clients.remove(websocket)
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
    try:
        res = await db['rehearsal session'].find_one()
        if not res:
            return "inactive", None  

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