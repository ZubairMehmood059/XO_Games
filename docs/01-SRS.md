# XO Games — Software Requirements Specification (01-SRS.md)

**Product:** XO Games  
**Classification:** Browser-Based Competitive Tic-Tac-Toe Gaming Platform  
**Version:** 1.0.0-PROD  
**Design Status:** FROZEN (Cyberpunk Arena Identity)  

---

## 1. Introduction & Purpose

This document provides the formal Functional and Non-Functional Requirements Specification for **XO Games**, a high-performance, responsive browser-based tactical game platform featuring multiple board dimensions, adaptive AI algorithms, tactical puzzle protocols, and real-time multiplayer room networking.

---

## 2. Functional Requirements (FR)

### 2.1 Game Engine & Core Rules (REQ-ENG)

- **REQ-ENG-01 (Classic 3×3 Mode):**
  - Board grid of size $3\times 3$ (9 cells).
  - Win condition: Exactly 3 consecutive matching marks horizontally, vertically, or along either primary diagonal.
  - Draw condition: All 9 cells occupied without an active 3-mark win line.
- **REQ-ENG-02 (Tactical 4×4 Mode):**
  - Board grid of size $4\times 4$ (16 cells).
  - Win condition: Exactly 4 consecutive matching marks horizontally, vertically, or diagonally.
  - Draw condition: All 16 cells filled without a 4-mark line.
- **REQ-ENG-03 (Arena 5×5 Mode):**
  - Board grid of size $5\times 5$ (25 cells).
  - Win condition: 4 consecutive matching marks anywhere along a line or diagonal.
  - UI requirement: Explicitly display *"Win Mandate: 4 in a row"* in the game header and rules sidebar.
- **REQ-ENG-04 (Deterministic Turn Order):**
  - Player X always makes the opening move on Round 1.
  - For subsequent rounds in a match, the starting turn rotates or can be reset upon rematch.
- **REQ-ENG-05 (Move Validation & Integrity):**
  - Occupied cells cannot be overwritten.
  - Moves cannot be placed after the match state is `WON`, `DEFEATED`, or `DRAW`.
  - Coordinate range strictly validated ($0 \le \text{index} < \text{gridSize}^2$).
- **REQ-ENG-06 (Winning Line Identification):**
  - The game engine must return the exact array of winning cell indices (e.g., `[0, 4, 8]`) to illuminate the vector laser reveal.
- **REQ-ENG-07 (Score & Match History Tracking):**
  - Track session tally: `Player X Wins`, `Player O / AI Wins`, and `Draws`.
  - Provide an undo option (available exclusively during single-player AI mode).

### 2.2 Artificial Intelligence Engine (REQ-AI)

- **REQ-AI-01 (Casual Difficulty):**
  - Randomly selects from currently legal unoccupied cells with a uniform distribution.
  - Execution latency: Simulated 250ms–350ms thinking delay for organic pacing.
- **REQ-AI-02 (Focused Difficulty):**
  - Step 1: Detect immediate win opportunity on the current turn; execute immediately if present.
  - Step 2: Detect immediate opponent win threat; place blocking counter-mark immediately.
  - Step 3: Heuristic center/corner positional priority; choose highest utility move.
- **REQ-AI-03 (Master Difficulty):**
  - 3×3 Board: Perfect Minimax with Alpha-Beta pruning (guarantees unbeatable mathematical play; always wins or forces draw).
  - 4×4 & 5×5 Boards: Depth-bounded evaluation function with terminal branch pruning (depth 4–5), open-line potential weighting, and fork recognition.
  - Computation budget: Maximum 100ms CPU execution time; non-blocking interaction loop.

### 2.3 Tactical Puzzle Engine (REQ-PUZ)

- **REQ-PUZ-01 (Curated Scenarios):**
  - Support pre-configured tactical scenarios with initial board setups, active player, move limits, objective description, and validated solution sets.
- **REQ-PUZ-02 (Puzzle Verification):**
  - Validate player move against target solution. If valid, mark `SOLVED` and illuminate trophy state. If invalid, trigger retry state.

### 2.4 Real-Time Multiplayer (REQ-NET)

- **REQ-NET-01 (Room Creation):**
  - Generate unpredictable 6-character alphanumeric room codes (e.g. `CYBER-892`).
- **REQ-NET-02 (Room Joining & Capacity):**
  - Enforce maximum 2 active player connections per room.
  - Player 1 assigned Mark X; Player 2 assigned Mark O. Subsequent connection attempts rejected with `ROOM_FULL`.
- **REQ-NET-03 (Server-Authoritative State):**
  - Server maintains master board state, turn status, and win detection. Client only sends intent `SUBMIT_MOVE(cellIndex)`.
- **REQ-NET-04 (Honest Connection States):**
  - Display explicit UI states: `LOCAL_ONLY`, `CONNECTING`, `WAITING_OPPONENT`, `MATCH_ACTIVE`, `DISCONNECTED`, `RECONNECTING`.
  - Local gameplay remains 100% playable when server is offline.

---

## 3. Non-Functional Requirements (NFR)

- **NFR-PERF-01 (Frame Budget):** Smooth 60 FPS transitions and render updates.
- **NFR-RESP-01 (Responsive Grid):** Flawless presentation across Mobile ($320\text{px}–430\text{px}$), Tablet ($768\text{px}–1023\text{px}$), and Desktop ($1024\text{px}–1440\text{px}+$) with zero horizontal scrolling.
- **NFR-A11Y-01 (Accessibility):** WCAG AAA contrast ratio ($> 10:1$ for primary `#F2F7FF` on `#080B12`); full keyboard navigation (`Tab` + `Enter`/`Space`); touch targets $\ge 44\times 44\text{px}$.
- **NFR-SEC-01 (Security):** Strict server-side move bounds checking, WebSocket message size limits ($< 4\text{KB}$), sanitized inputs, and room expiration after 15 minutes of inactivity.
