# XO Games — Cyberpunk Tactical Arena

A responsive, browser-based tactical strategy game platform engineered with an authentic cyberpunk aesthetic. XO Games features deterministic game rules across 3 grid scales, Minimax AI opponents, curated tactical puzzle scenarios, and a server-authoritative Python FastAPI WebSocket multiplayer backend.

---

## Features

### 1. Game Disciplines
- **Classic 3×3 Speed Duel:** 3-in-a-row victory. Quick, decisive matches.
- **Tactical 4×4 Matrix:** 4-in-a-row victory on a 16-cell board, eliminating forced first-move draws through branching fork theory.
- **Arena 5×5:** Gomoku-inspired grandmaster scale with 4-in-a-row mandate, corridor pins, and positional flank strategy.

### 2. Opponent Configurations
- **Neural AI Bot:**
  - **Casual:** Uniform random legal moves with organic pacing.
  - **Focused:** 1-ply winning moves, 1-ply blocking moves, and center/corner heuristics.
  - **Master:** Mathematically unbeatable Minimax with Alpha-Beta pruning on 3×3; depth-bounded heuristic evaluation on 4×4 and 5×5.
- **Local Pass & Play:** Seamless couch duel between two human combatants on the same device.
- **Private Online Sectors:** Ephemeral rooms generated with 6-character room codes (`CYBER-892`), validated by server-authoritative WebSocket state synchronization.

### 3. Tactical Puzzle Mode
- 6 hand-crafted tactical scenarios across 3×3, 4×4, and 5×5 arenas (e.g. *Fork Master*, *Defend & Counter*, *Perimeter Breach*, *The Neural Block*).
- Interactive validation engine with hints, move limits, and tactical explanations.

### 4. Audio & Tactile Polish
- Native Web Audio API synthesizer for zero-dependency retro-cyber chimes (460Hz Cyan mark, 340Hz Magenta mark, 880Hz victory fanfare).
- Persistent audio mute toggle stored in `localStorage`.

### 5. Resilient Local History
- Records recent 20 matches (board size, mode, difficulty, winner, turns, timestamp) in browser `localStorage` with in-memory fallback.

---

## Technology Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Web Audio API
- **Backend:** Python 3.10+, FastAPI, Pydantic, WebSockets, Uvicorn
- **Testing:** Node.js native test runner (`node:test`) + Python standard `unittest`
- **Deployment:** Netlify (Static SPA) + Render / Railway / Docker (FastAPI)

---

## Getting Started

### Prerequisites
- Node.js 18+ (tested on Node.js 20 & 22)
- Python 3.10+ (for multiplayer backend)

### 1. Frontend Development

```bash
# Install dependencies
npm install

# Run Vite development server
npm run dev
```

Visit `http://localhost:3000` in your browser.

### 2. Backend Development (Optional for Multiplayer)

```bash
# Navigate to backend
cd backend

# On Windows (PowerShell / Command Prompt):
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python run.py

# On Linux / macOS:
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python3 run.py

# The FastAPI server listens on http://0.0.0.0:8000
```

---

## Running Automated Tests

Run the complete test suite across frontend rules, multiplayer integration, and backend engines:

```bash
# Runs complete frontend (26 tests) & backend suite (24 tests) - 50 total
npm test
```

Or run separately:
```bash
# Frontend engine rules & integration tests (26 test cases)
npx tsx --test src/engine/rules.test.ts src/services/multiplayer.test.ts

# Backend server game engine, rooms, REST, and WebSocket tests (24 test cases)
python -m unittest discover backend/tests

# Two-client live duel & anti-cheat simulation
python backend/tests/verify_two_clients.py
```

---

## Deployment

### Frontend (Netlify)
1. Push repository to GitHub.
2. Link repository in Netlify.
3. Build command: `npm run build`
4. Publish directory: `dist`
5. SPA redirect rule is pre-configured in `netlify.toml`:
   ```toml
   [build]
     command = "npm run build"
     publish = "dist"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```
6. Set environment variables in Netlify Dashboard:
   - `VITE_API_BASE_URL`: Deployed backend URL (e.g. `https://xo-games-api.onrender.com`)
   - `VITE_WS_BASE_URL`: Deployed WebSocket URL (e.g. `wss://xo-games-api.onrender.com`)

### Backend (Docker / Render / Railway)
A multi-stage Dockerfile is included at `backend/Dockerfile`:
```bash
docker build -t xo-games-backend backend/
docker run -p 8000:8000 xo-games-backend
```

---

## Security & Reliability Controls

- **Server-Authoritative Moves:** Clients only transmit move intentions (`MOVE` with `cell_index`). Turn order, coordinate boundaries, cell occupancy, and win conditions are calculated exclusively on the server.
- **WebSocket Payload Clamping:** Message size restricted to 4 KB to prevent buffer abuse.
- **Memory TTL:** Ephemeral in-memory rooms automatically expire after 15 minutes of inactivity.
- **Offline Fault Tolerance:** When the backend is offline, the frontend displays an honest standby indicator while all Local, AI, and Puzzle modes remain 100% playable.

## Production Readiness & Operations

### 1. Custom 404 Routing
- Dedicated cyberpunk-themed `NotFoundScreen` at unmapped routes (`GRID_COORD_NULL`).
- Direct recovery pathways back to Arena Lobby or Quick Match (Classic 3×3).

### 2. SEO & Open Graph Social Cards
- Canonical URL tag: `<link rel="canonical" href="https://xogames.app/" />`.
- Standard Open Graph and Twitter Card tags with vector 1200×630 `og-image.svg` card.
- Structured JSON-LD `<script type="application/ld+json">` representing `VideoGame` schema.
- Crawler directives defined in `public/robots.txt`.
- Public routes indexed in `public/sitemap.xml`.

### 3. HTTPS & Security Headers
- Configured in `netlify.toml`:
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
  - `Content-Security-Policy`: Restricts scripts, fonts, styles, and frames while allowing Google Analytics and Google Fonts.
  - `X-Frame-Options: SAMEORIGIN`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()`

### 4. Privacy-First Analytics & Consent
- Optional Google Analytics 4 integration (`VITE_GA4_ID`).
- Telemetry scripts only initialize after user clicks **Accept** on the persistent `CookieConsentBanner`.
- Explicit **Essential Only** option prevents any analytics scripts from loading.
- IP anonymization and SameSite/Secure cookies enforced.

### 5. Legal & Documentation
- Comprehensive **Privacy Policy** (`PrivacyPolicyScreen`) disclosing local storage keys (`xo_audio_enabled`, `xo_match_history`, `xo_analytics_consent`), ephemeral WebSocket memory, and cryptographic TLS guarantees.
- Comprehensive **Arena FAQ** (`FAQScreen`) explaining 3×3, 4×4 Matrix, and 5×5 Gomoku rules, Minimax AI algorithms, and room disconnect behavior.

### 6. Mobile Responsiveness & WCAG Accessibility
- **Cross-Device Layout Integrity:** Seamless scaling from 320px narrow mobile viewports up to 4K displays.
- **Adaptive Game Boards:** 3×3, 4×4, and 5×5 grids maintain touch-friendly cells (minimum 44px) and proportional vector marks across all devices without horizontal overflow or viewport clipping.
- **Polished Mobile Drawer:** Header integrates accessible slide-in navigation drawer with 44px touch targets and ARIA attributes (`aria-expanded`, `aria-controls`).
- **Accessible Keyboard Navigation:** All discipline cards, modal buttons, and board cells support full keyboard activation (`Tab`, `Enter`, `Space`) with high-contrast `focus-visible:ring-2 focus-visible:ring-[#35E7FF]` rings.
- **Color Contrast:** All text pairings strictly meet WCAG AAA contrast requirements against dark cyberpunk backdrops.

---

## License

MIT License. Designed and engineered for production deployment.
