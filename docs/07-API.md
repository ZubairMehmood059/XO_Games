# XO Games — REST API & WebSocket Protocol Contract (07-API.md)

**Product:** XO Games  
**Protocol:** HTTP/1.1 REST + WSS (WebSockets)  
**Serialization:** JSON  
**Version:** 1.0.0-PROD  

---

## 1. REST Endpoints

### 1.1 Health Probe
- **Endpoint:** `GET /api/health`
- **Response:**
  ```json
  {
    "status": "online",
    "version": "1.0.0",
    "active_rooms": 14,
    "timestamp": 1742081234
  }
  ```

### 1.2 Create Room
- **Endpoint:** `POST /api/rooms`
- **Request Body:**
  ```json
  {
    "board_size": 3,
    "creator_name": "Pilot_01"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "room_code": "CYBER-892",
    "board_size": 3,
    "player_id": "usr_9f82a1c0",
    "symbol": "X",
    "ws_url": "/ws/CYBER-892?player_id=usr_9f82a1c0"
  }
  ```

### 1.3 Join Room Verification
- **Endpoint:** `POST /api/rooms/{room_code}/join`
- **Request Body:**
  ```json
  {
    "player_name": "Rival_02"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "room_code": "CYBER-892",
    "board_size": 3,
    "player_id": "usr_3e14b2d5",
    "symbol": "O",
    "ws_url": "/ws/CYBER-892?player_id=usr_3e14b2d5"
  }
  ```
- **Error Responses:**
  - `404 Not Found`: Room code does not exist.
  - `409 Conflict`: Room is already full (2 players connected).

---

## 2. WebSocket Protocol (`/ws/{room_code}`)

### 2.1 Connection Handshake
Client initiates connection with query parameter:
`wss://<backend_host>/ws/{room_code}?player_id={player_id}`

### 2.2 Client-to-Server Messages

1. **Submit Move:**
   ```json
   {
     "type": "MOVE",
     "cell_index": 4
   }
   ```
2. **Request Rematch:**
   ```json
   {
     "type": "REMATCH_REQUEST"
   }
   ```
3. **Leave Match / Resign:**
   ```json
   {
     "type": "RESIGN"
   }
   ```

### 2.3 Server-to-Client Messages

1. **Room State Sync (Broadcast on join & every valid move):**
   ```json
   {
     "type": "ROOM_STATE",
     "room_code": "CYBER-892",
     "board_size": 3,
     "board": ["X", null, "O", null, "X", null, null, null, null],
     "current_turn": "O",
     "status": "PLAYING",
     "winning_line": null,
     "winner": null,
     "players": {
       "X": {"id": "usr_9f82a1c0", "name": "Pilot_01", "connected": true, "score": 1},
       "O": {"id": "usr_3e14b2d5", "name": "Rival_02", "connected": true, "score": 0}
     }
   }
   ```

2. **Match Finished (Victory / Draw):**
   ```json
   {
     "type": "MATCH_OVER",
     "status": "WON",
     "winner": "X",
     "winning_line": [0, 4, 8],
     "board": ["X", "O", null, null, "X", "O", null, null, "X"]
   }
   ```

3. **Opponent Disconnected:**
   ```json
   {
     "type": "OPPONENT_DISCONNECTED",
     "message": "Opponent connection lost. Awaiting reconnect for 60 seconds."
   }
   ```

4. **Error Alert:**
   ```json
   {
     "type": "ERROR",
     "code": "INVALID_MOVE",
     "message": "Cell is already occupied or not your turn."
   }
   ```
