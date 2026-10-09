# XO Games — Security Controls & Threat Model (06-SECURITY.md)

**Product:** XO Games  
**Security Standard:** Production-Grade Tactical Gaming Application  
**Version:** 1.0.0-PROD  

---

## 1. Threat Model & Mitigations

### 1.1 Server-Authoritative Integrity (Anti-Cheat)
- **Threat:** Client attempts to place a move outside turn order, overwrite an occupied cell, submit coordinates outside grid bounds, or declare false victory.
- **Mitigation:** The FastAPI backend treats all client messages as unverified requests. The server validates:
  1. Room existence and participant membership (`player_id` matches current turn).
  2. Cell boundary check ($0 \le \text{cellIndex} < \text{gridSize}^2$).
  3. Cell emptiness check (`board[cellIndex] is None`).
  4. Active match state check (`status == "PLAYING"`).
  5. Authoritative calculation of victory or draw lines exclusively on the server.

### 1.2 WebSocket Flood & Abuse Prevention
- **Threat:** Malicious actor bombards the WebSocket server with high-frequency messages or giant payloads.
- **Mitigation:**
  - WebSocket payload size capped at 4096 bytes (4 KB). Larger payloads immediately close the socket with code `1009` (Message Too Big).
  - Rate limiting: Client moves restricted to at most 1 move per turn; spurious spam triggers temporary cool-down.

### 1.3 CORS & Network Isolation
- **Mitigation:**
  - FastAPI configured with explicit CORS origins defined via environment variables (`CORS_ORIGINS`).
  - Strict Content-Security-Policy headers in production.

### 1.4 Room Code Predictability
- **Threat:** Attackers guessing room codes to eavesdrop on private duels.
- **Mitigation:** Room codes generated using cryptographically strong random generation (`secrets.choice`) with uppercase alphanumeric space, yielding $36^6 \approx 2.17 \times 10^9$ possibilities.
