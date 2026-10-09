# XO Games — Data Persistence Strategy (05-DATABASE.md)

**Product:** XO Games  
**Classification:** Browser Storage & In-Memory Server Room Management  
**Version:** 1.0.0-PROD  

---

## 1. Local Browser Persistence (Client-Side)

XO Games does not require user accounts or server databases for personal gameplay history. All personal records and preferences are stored in the user's browser via `localStorage`:

### Stored Keys & Schemas:
1. `xo_settings`:
   ```json
   {
     "soundEnabled": true,
     "volume": 0.08,
     "reducedMotion": false,
     "preferredBoardSize": 3
   }
   ```
2. `xo_match_history`:
   ```json
   [
     {
       "id": "match_1742081234567",
       "timestamp": 1742081234567,
       "boardSize": 3,
       "mode": "ai",
       "difficulty": "master",
       "winner": "X",
       "turns": 7,
       "playerSymbol": "X"
     }
   ]
   ```
   *Retention limit:* The storage service automatically caps history at the 20 most recent matches to prevent unbounded storage growth.

3. **Storage Resilience:**
   - Wrapped in a safe try/catch adapter with in-memory fallback if cookies or localStorage are disabled by privacy browsers.

---

## 2. Server Persistence & Lifecycle (Backend)

### Online Room Management:
- Active multiplayer rooms are kept in an **in-memory thread-safe registry** (`RoomManager`).
- **Room Lifecycle:**
  1. `CREATED`: Room generated with 6-character room code; awaiting second player.
  2. `ACTIVE`: 2 players connected; turn timer active.
  3. `FINISHED`: Win or draw reached; awaiting rematch or close.
  4. `EXPIRED`: Room closed after 15 minutes of inactivity or when both players disconnect.

### Scalability Limits & Trade-Offs:
- **In-Memory Simplicity:** Perfect for MVP ($< 10,000$ concurrent rooms). Zero database maintenance or operational cost.
- **Limitation:** In multi-instance cluster deployments, room state must migrate to Redis / Cloud SQL. Documented as a Phase 2 scalability evolution.
