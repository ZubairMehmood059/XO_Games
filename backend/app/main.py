import time
import json
import secrets
import logging
from typing import Optional
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from .config import CORS_ORIGINS, MAX_MESSAGE_BYTES
from .schemas import (
    CreateRoomRequest,
    CreateRoomResponse,
    JoinRoomRequest,
    JoinRoomResponse,
    HealthResponse,
)
from .rooms import room_manager

logger = logging.getLogger("xo_games.api")

app = FastAPI(
    title="XO Games Multiplayer Arena API",
    version="1.0.0",
    description="Server-authoritative game engine and real-time WebSocket backend for XO Games."
)

# Production CORS Configuration
allow_credentials = "*" not in CORS_ORIGINS
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=allow_credentials,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

@app.get("/api/health", response_model=HealthResponse)
def health_check():
    room_manager.cleanup_expired()
    return {
        "status": "online",
        "version": "1.0.0",
        "active_rooms": len(room_manager.rooms),
        "timestamp": int(time.time()),
    }

@app.post("/api/rooms", response_model=CreateRoomResponse, status_code=status.HTTP_201_CREATED)
def create_room(req: CreateRoomRequest):
    try:
        room, creator_id = room_manager.create_room(req.board_size, req.creator_name)
    except RuntimeError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(e)
        )

    return {
        "room_code": room.room_code,
        "board_size": room.board_size,
        "player_id": creator_id,
        "symbol": "X",
        "ws_url": f"/ws/{room.room_code}?player_id={creator_id}",
    }

@app.post("/api/rooms/{room_code}/join", response_model=JoinRoomResponse)
def join_room(room_code: str, req: JoinRoomRequest):
    room = room_manager.get_room(room_code)
    if not room:
        raise HTTPException(status_code=404, detail="Room code not found or expired")

    if "O" in room.players:
        raise HTTPException(status_code=409, detail="Room is already full")

    player_id = f"usr_{secrets.token_hex(4)}"
    success = room.add_player_o(player_id, req.player_name)
    if not success:
        raise HTTPException(status_code=409, detail="Failed to join room")

    return {
        "room_code": room.room_code,
        "board_size": room.board_size,
        "player_id": player_id,
        "symbol": "O",
        "ws_url": f"/ws/{room.room_code}?player_id={player_id}",
    }

async def broadcast_room_state(room):
    payload = json.dumps(room.to_state_payload())
    for sym in ["X", "O"]:
        if sym in room.players:
            ws = room.players[sym].get("websocket")
            if ws:
                try:
                    await ws.send_text(payload)
                except Exception:
                    pass

@app.websocket("/ws/{room_code}")
async def websocket_endpoint(websocket: WebSocket, room_code: str, player_id: Optional[str] = None):
    await websocket.accept()

    if not player_id:
        await websocket.send_text(json.dumps({
            "type": "ERROR",
            "code": "MISSING_PLAYER_ID",
            "message": "player_id query parameter is required."
        }))
        await websocket.close(code=1008)
        return

    room = room_manager.get_room(room_code)
    if not room:
        await websocket.send_text(json.dumps({
            "type": "ERROR",
            "code": "ROOM_NOT_FOUND",
            "message": "Room not found or expired."
        }))
        await websocket.close(code=1008)
        return

    symbol = room.get_symbol_by_player_id(player_id)
    if not symbol:
        await websocket.send_text(json.dumps({
            "type": "ERROR",
            "code": "UNAUTHORIZED",
            "message": "Player identity not recognized in this room."
        }))
        await websocket.close(code=1008)
        return

    # Cleanly replace prior websocket if re-connecting
    old_ws = room.players[symbol].get("websocket")
    if old_ws and old_ws != websocket:
        try:
            await old_ws.close(code=1000)
        except Exception:
            pass

    room.players[symbol]["websocket"] = websocket
    room.players[symbol]["connected"] = True
    room.touch()
    await broadcast_room_state(room)

    try:
        while True:
            raw_data = await websocket.receive_text()
            if len(raw_data) > MAX_MESSAGE_BYTES:
                await websocket.send_text(json.dumps({
                    "type": "ERROR",
                    "code": "MESSAGE_TOO_LARGE",
                    "message": f"Message size exceeds {MAX_MESSAGE_BYTES} byte limit."
                }))
                await websocket.close(code=1009)
                break

            try:
                msg = json.loads(raw_data)
            except json.JSONDecodeError:
                await websocket.send_text(json.dumps({
                    "type": "ERROR",
                    "code": "INVALID_JSON",
                    "message": "Payload is not valid JSON."
                }))
                continue

            if not isinstance(msg, dict):
                continue

            msg_type = msg.get("type")

            if msg_type == "MOVE":
                cell_index = msg.get("cell_index")
                if cell_index is None or not isinstance(cell_index, int):
                    await websocket.send_text(json.dumps({
                        "type": "ERROR",
                        "code": "INVALID_MOVE",
                        "message": "cell_index must be an integer."
                    }))
                    continue

                success, err_msg = room.apply_move(player_id, cell_index)
                if success:
                    await broadcast_room_state(room)
                    if room.status in ("WON", "DRAW"):
                        match_over_payload = json.dumps({
                            "type": "MATCH_OVER",
                            "status": room.status,
                            "winner": room.winner,
                            "winning_line": room.winning_line,
                            "board": room.board,
                        })
                        for s in ["X", "O"]:
                            if s in room.players and room.players[s].get("websocket"):
                                try:
                                    await room.players[s]["websocket"].send_text(match_over_payload)
                                except Exception:
                                    pass
                else:
                    await websocket.send_text(json.dumps({
                        "type": "ERROR",
                        "code": "INVALID_MOVE",
                        "message": err_msg or "Invalid move."
                    }))

            elif msg_type == "REMATCH_REQUEST":
                success, _ = room.request_rematch(player_id)
                if success:
                    await broadcast_room_state(room)

            elif msg_type == "RESIGN":
                success, err_msg = room.apply_resign(player_id)
                if success:
                    await broadcast_room_state(room)
                else:
                    await websocket.send_text(json.dumps({
                        "type": "ERROR",
                        "code": "INVALID_ACTION",
                        "message": err_msg or "Cannot resign."
                    }))

            elif msg_type == "PING":
                await websocket.send_text(json.dumps({"type": "PONG"}))

            else:
                await websocket.send_text(json.dumps({
                    "type": "ERROR",
                    "code": "UNKNOWN_EVENT",
                    "message": f"Unrecognized event type: {msg_type}"
                }))

    except WebSocketDisconnect:
        room.disconnect_player(player_id)
        # Notify opponent of disconnection
        other_symbol = "O" if symbol == "X" else "X"
        if other_symbol in room.players and room.players[other_symbol].get("websocket"):
            try:
                await room.players[other_symbol]["websocket"].send_text(json.dumps({
                    "type": "OPPONENT_DISCONNECTED",
                    "message": f"Player {symbol} disconnected."
                }))
            except Exception:
                pass
        # Broadcast updated room state with connected: False
        await broadcast_room_state(room)
    except Exception as exc:
        logger.warning("WebSocket exception for player %s: %s", player_id, exc)
        room.disconnect_player(player_id)
        await broadcast_room_state(room)

