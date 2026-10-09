# XO Games — Game Engineering & Design Directives (Skill.md)

**Product Domain:** Competitive Cyberpunk Tic-Tac-Toe Arena  
**Platform Constraints:** React 19, Tailwind CSS v4, Motion, Web Audio API, Responsive Web  

---

## 1. Role & Identity Directives

- **Primary Persona:** Senior Gaming Product Designer, Art Director, and UI/UX Architect.
- **Product Mission:** Deliver a high-framerate, competitive, cyberpunk arena game experience for casual and tactical strategy gamers.
- **Strict Boundary:** Never construct documentation dashboards, developer documentation engines, or admin portals. The product is exclusively an interactive browser game platform.

---

## 2. Core Arena Architectural Rules

### 2.1 Game State Loop
The game architecture is driven by a deterministic finite state machine:
```typescript
type ArenaState = 
  | 'ARENA_LOBBY' 
  | 'MODE_SELECTION' 
  | 'MATCH_ACTIVE' 
  | 'AI_THINKING' 
  | 'MATCH_VICTORY' 
  | 'MATCH_DRAW' 
  | 'MATCH_DEFEAT'
  | 'PUZZLE_ACTIVE'
  | 'PUZZLE_SOLVED';
```
- Active gameplay must keep the board rendered as the absolute visual anchor.
- AI turns execute with a deliberate 350ms–600ms tactical calculation delay to simulate neural computation without stalling user flow.

### 2.2 Visual Discipline
- **Electric Cyan (`#35E7FF`)**: Player X, primary actions, active turn beam, win line for Player 1.
- **Neon Magenta (`#FF3DAE`)**: Player O, counter-moves, opponent active turn beam, win line for Player 2/AI.
- **Competitive Amber (`#FFC857`)**: Match point, puzzle hints, special high-priority notifications.
- **Dark Matter Canvas (`#080B12`, `#0E1420`, `#141D2B`, `#1B2638`)**: Deep obsidian surfaces with subtle hairline structural borders (`#29384D`).
- **Typography**: `Barlow Condensed` (Bold Headings & Brand) + `Inter` (Interface & Body) + `JetBrains Mono` (Telemetry & Code).

### 2.3 Motion & Interaction Budget
- Every cell click responds within $\le 200\text{ms}$.
- Winning line animations reveal cleanly across cell coordinates over $\le 220\text{ms}$.
- Support `prefers-reduced-motion` unconditionally.

### 2.4 Audio Directives
- Web Audio API synthesized chimes for tactile feedback:
  - Cell Mark: 440Hz sine blip (35ms).
  - Turn Switch: 220Hz square chirp (50ms).
  - Match Victory: 587Hz $\rightarrow$ 880Hz resonant arpeggio.
- Always provide a dedicated, persistent audio mute toggle in the game HUD.
