# XO Games — System Architecture & Topology (03-ARCHITECTURE.md)

**Product:** XO Games  
**Architecture:** Decoupled React Frontend + Server-Authoritative Python FastAPI Backend  
**Deployment Model:** Static SPA (Netlify) + Containerized Micro-Service (FastAPI on Render / Railway / Docker)  

---

## 1. System Architecture Overview

```
+-------------------------------------------------------------+
|                     Client Browser                          |
|  +-------------------------------------------------------+  |
|  | React 19 + TypeScript + Vite                          |  |
|  | - GameEngine (Deterministic Rules, Board State)       |  |
|  | - AIEngine (Minimax Alpha-Beta, Bounded Heuristic)    |  |
|  | - PuzzleEngine (Curated Scenarios)                    |  |
|  | - AudioManager (Synthesized Web Audio API)            |  |
|  | - StorageService (localStorage Preferences & History) |  |
|  | - MultiplayerService (REST API + WebSocket Client)    |  |
|  +-------------------------------------------------------+  |
+-------------------------------------------------------------+
                            |
                 HTTPS / WSS (Typed Contracts)
                            |
                            v
+-------------------------------------------------------------+
|               FastAPI Multiplayer Service                   |
|  +-------------------------------------------------------+  |
|  | - /api/health (Liveness Probe)                        |  |
|  | - /api/rooms (Room Creation & Status REST API)        |  |
|  | - /ws/{room_code} (Bidirectional WebSocket Tunnel)   |  |
|  | - RoomManager (In-memory Room Registry & Expiry)      |  |
|  | - Authoritative GameEngine (Server Move Validation)   |  |
|  +-------------------------------------------------------+  |
+-------------------------------------------------------------+
```

---

## 2. Frontend Directory Structure

```
src/
├── components/          # Shared visual controls (Header, Button, Modal, Drawer)
├── engine/              # Central Game Engine (Pure TS, 0 framework dependencies)
│   ├── rules.ts         # Win evaluation (3x3, 4x4, 5x5), valid moves, draws
│   ├── ai.ts            # Casual, Focused, and Master Minimax AI algorithms
│   └── puzzles.ts       # Curated puzzle scenarios & validator
├── features/
│   ├── lobby/           # Home & game mode selection
│   ├── battle/          # Active board grid, combatant HUD, controls
│   ├── multiplayer/     # Private sector room creation, join, connection status
│   └── puzzles/         # Tactical puzzle selector and completion modal
├── services/
│   ├── audio.ts         # Synthesized Web Audio API sound engine
│   ├── storage.ts       # Resilient localStorage preferences & match history
│   └── multiplayer.ts   # Typed REST & WebSocket client with reconnection logic
├── types/
│   ├── game.ts          # BoardSize, CellValue, GameStatus, MoveResult
│   └── api.ts           # REST schemas & WebSocket message payloads
├── App.tsx              # Application shell & view router
├── main.tsx             # React entry point
└── index.css            # Tailwind CSS tokens & typography
```

---

## 3. Backend Structure & Module Boundaries

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py          # FastAPI application entry, CORS, routes & WebSockets
│   ├── engine.py        # Authoritative server-side game rules
│   ├── rooms.py         # In-memory RoomManager, code generation, disconnect handling
│   ├── schemas.py       # Pydantic models for REST & WebSocket protocols
│   └── config.py        # Environment variables & timeouts
├── tests/
│   ├── test_engine.py   # Unit tests for all game rules and board sizes
│   └── test_rooms.py    # Tests for room lifecycle and move validation
├── requirements.txt     # fastapi, uvicorn, pydantic, websockets, pytest
├── Dockerfile           # Production container build
└── run.py               # Local execution runner
```

---

## 4. Key Architectural Decisions & Rationale

1. **Decoupled Client-Side Engine for Offline Playability:**
   - The frontend implements the full game engine locally. Pass-and-play, AI, and Puzzles never fail even when network connection drops or the backend is unreachable.
2. **Server-Authoritative Multiplayer:**
   - During online matches, the server is the single source of truth. Moves are submitted as intents, validated on the server, and authoritative state is broadcast to both participants.
3. **In-Memory Room State for MVP:**
   - Online rooms are ephemeral matches lasting 2–10 minutes. Storing active rooms in a high-speed Python dictionary with a 15-minute cleanup TTL avoids external database latency and infrastructure cost.
