# XO Games — Cyberpunk Arena Design Specification & Architecture (Design.md)

**Product:** XO Games (Cyberpunk Arena)  
**Status:** **DESIGN LOCK FROZEN — PHASE 1 SIGNED OFF**  
**Classification:** Browser-Based Competitive Tic-Tac-Toe Gaming Platform  
**Target Audience:** Competitive tactical puzzle & board game players, strategy enthusiasts, esports/cyberpunk aesthetics fans  
**Core Identity:** Futuristic competitive cyber-arena; sleek, electric, tactical, immersive, high-contrast, uncluttered  

---

## 1. Product Direction & Context

XO Games is a dedicated interactive gaming platform that transforms the ancient game of Tic-Tac-Toe into a tactical cyberpunk cyber-duel. 

It is **NOT** a documentation site, developer dashboard, or generic administrative interface. Every screen, component, and interaction is engineered around the central board and duel experience:
- **Core Arena Modes:** Classic 3×3 Duel, Tactical 4×4 Matrix (4-in-a-row to eliminate forced draws), and Arena 5×5 (Gomoku-inspired expanded grid).
- **Competitors:** Adaptive Neural AI (Novice, Tactician, Cybermind) and Real-Time Multiplayer Rooms (P2P / Room Sector Codes).
- **Tactical Training:** Curated Puzzle Scenarios ("Forced Win in 1", "Counter the Diagonal Fork", "Perimeter Breach").

---

## 2. Visual Design Tokens & Cyberpunk Theme System

### 2.1 Color Tokens (60-30-10 Distribution)

- **Canvas & Backdrops (60%)**:
  - `Main Background`: `#080B12` (Ultra-deep cosmic void canvas)
  - `Secondary Background`: `#0E1420` (Subdued arena floor & panel backing)
- **Surfaces & Borders (30%)**:
  - `Elevated Surface`: `#141D2B` (Arena board frames, player HUD cards, dialog backing)
  - `Strong Surface`: `#1B2638` (Active board cells, tactical button fills, input enclosures)
  - `Subtle Borders`: `#29384D` (Crisp 1px hairline structural dividers and chamfer cuts)
  - `Primary Text`: `#F2F7FF` (Luminous cool white, WCAG AAA contrast $> 10:1$ on dark canvas)
  - `Secondary Text`: `#9BAAC0` (Muted slate blue, WCAG AA contrast $\ge 4.5:1$)
- **High-Intent Cyberpunk Accents (10% Budget)**:
  - `Electric Cyan`: `#35E7FF` (Player X mark, primary interaction highlights, active turn energy)
  - `Neon Magenta`: `#FF3DAE` (Player O mark, counter-tactics, opponent alerts)
  - `Competitive Amber`: `#FFC857` (Match point alert, primary CTA triggers, puzzle trophies)
  - `Success`: `#4FE3A4` (Match victory, connected status, legal puzzle move)
  - `Error / Alert`: `#FF647C` (Defeat, illegal move attempt, disconnection alert)

*Restraint Rule:* Glow effects and gradients are strictly reserved for active kinetic feedback (e.g. glowing winning beam, active player underline, cell hover target reticle). No permanent muddy glowing borders or unreadable neon text.

### 2.2 Typography System (Design Lock Refinement)

- **Headings & Display Brand**: `Barlow Condensed` (Bold Condensed Sans-serif, weights: 700 Bold, 800 ExtraBold)
  - Used for: Brand logo mark, arena hero headlines, card titles, board glyphs, match outcomes, modal titles.
  - Scale:
    - Arena Hero Display: `clamp(2.5rem, 6vw, 4.5rem)` (40–72px) / Line-height 1.02 / tracking wide uppercase
    - Section Heading: `clamp(1.75rem, 3.5vw, 2.5rem)` (28–40px) / Line-height 1.1 uppercase
    - Arena Subhead & Card Titles: `1.25rem–1.5rem` (20–24px) / Line-height 1.2 uppercase
- **Interface & Body Text**: `Inter` (Humanist/grotesque sans, weights: 400 Regular, 500 Medium, 600 SemiBold)
  - Used for: Mode descriptions, button labels, modal body copy, dialog text, tooltips.
  - Scale:
    - Body Standard: `1rem` (16px) / Line-height 1.5
    - Body Small: `0.875rem` (14px) / Line-height 1.4
- **Technical Labels & Telemetry**: `JetBrains Mono` / Monospace
  - Used strictly for: Latency indicators, round tallies, room codes, timers, move coordinates.
  - Scale: `0.75rem–0.8125rem` (12–13px) tabular figures.

### 2.3 Geometry & Edge Treatment
- **Selective Chamfers**: Buttons and HUD header panels feature 6px angled corner cuts (`clip-path: polygon(...)` or subtle asymmetric corner accents), imparting authentic cyberpunk mech aesthetics without breaking touch-target geometry.
- **Board Grid**: Discrete floating tile cells with 8px–12px gaps on `#141D2B` elevated surface, ensuring unambiguous hit targets and clean SVG stroke reveals.

---

## 3. Arena Layout & Game-First Hierarchy

### 3.1 Home / Arena Lobby
- **Top Bar Contract**:
  - Zone 1: Cyberpunk brand lockup `XO GAMES` with glowing electric cyan & neon magenta indicator nodes.
  - Zone 2: Navigation links (`ARENA MODES`, `CYBER AI`, `SECTORS`, `PUZZLES`).
  - Zone 3: Primary Action (`ENTER ARENA` in `#35E7FF` electric cyan with black text).
- **Arena Hero Section**:
  - Split grid: Left features compelling tactical headline (*"TACTICAL DUELS. NEURAL STRATEGY."*), instant quick match launcher, and arena statistics. Right features a live interactive 3×3 Cyberpunk Grid teaser with real-time responsive cells and tactical reset controls.
- **Mode Selection Cards**:
  - Classic 3×3 (Speed Duel, 3-in-a-row)
  - Tactical 4×4 Matrix (Eliminating forced draws, 4-in-a-row)
  - Arena 5×5 (Grandmaster sector, Gomoku flank tactics)
  - Neural Puzzles (Engine tactical puzzles with move limits)

### 3.2 Live Gameplay Screen (Board-Centric Focus)
- **Top HUD**: Mode indicator, Sector/Round counter (`ROUND 02 // 05`), Audio toggle, Resign / Back button.
- **Dual Combatant Header**:
  - Left: Player X (`#35E7FF` cyan mark, wins counter, active turn beam).
  - Center: Match phase indicator (`YOUR TURN` / `AI COMPUTING`).
  - Right: Player O (`#FF3DAE` magenta mark, wins counter, difficulty rating).
- **Primary Game Board**:
  - Dominates 70%+ of the active viewport area.
  - Scale: $380\times 380\text{px}$ (Desktop), $340\times 340\text{px}$ (Tablet), scalable fluid square on mobile.
- **Controls Footer**: Rematch, Reset, Undo (AI mode only), and match seed identifier.

### 3.3 Match Outcomes & Dialogs
- **Decisive Victory / Defeat**:
  - High-impact modal with animated laser win-line reveal across the winning cells.
  - Statistical summary (Turns taken, accuracy, round score).
  - 1-click Rematch (`#35E7FF`) and Lobby return.

---

## 4. Interaction & Motion Specifications

- **Latency Budget**: Fast, responsive game-feel with 160ms–220ms durations.
- **Easing**: `cubic-bezier(0.16, 1, 0.3, 1)` (snappy ease-out).
- **Cell Hover**: Subtle cyan/magenta targeting reticle with 20% opacity ghost mark on unoccupied cells.
- **Mark Placement**:
  - X: Crisp electric cyan cross strokes expand from center (180ms scale-in).
  - O: Neon magenta ring draws in counter-clockwise (180ms).
- **Winning Line Reveal**: Glowing vector laser stroke shoots across winning cell centers in 220ms, causing connected cells to pulse with a subtle ambient wash.
- **Audio Synthesis (Web Audio API)**:
  - High-pitch blip (440Hz, 35ms) on cell tap.
  - Low synthesizer confirmation (220Hz) on turn change.
  - Ascending dual-tone (587Hz $\rightarrow$ 880Hz) on match victory.
- **Accessibility & Reduced Motion**:
  - All motion queries obey `prefers-reduced-motion: reduce` by replacing scale/draw transitions with instantaneous opacity cuts.
  - Status is never conveyed by color alone: turn indicators always pair with text ("YOUR TURN", "OPPONENT TURN") and distinct mark glyphs (✕ vs ○).

---

## 5. Responsive Engineering Matrix

- **Mobile Phones (< 640px / 320px–430px)**:
  - Single-column linear layout with zero horizontal overflow (`overflow-x-hidden`).
  - Board scales smoothly to `w-full max-w-[min(calc(100vw-2.5rem),380px)] aspect-square mx-auto`.
  - All interactive tap targets $\ge 44\times 44\text{px}$ (board cells $\ge 64\times 64\text{px}$).
  - Scoreboard HUD compresses into high-density 3-column pill with `truncate` text handling and prominent ✕ / ○ icons.
  - Collapsible cyber drawer menu for navigation.
  - Buttons expand to full-width touch bars with min-height 44px–48px.
- **Tablets (640px–1023px / Portrait & Landscape)**:
  - 2-column grid for arena modes and multiplayer options (`sm:grid-cols-2`).
  - Board centered with comfortable spacing (`max-w-[400px]`).
  - Scoreboard HUD expands with player name labels, latency indicators, and turn badges.
  - Tactical 4×4 Matrix split with board and rulebook side-by-side or stacked cleanly.
- **Laptops (1024px–1439px)**:
  - 2-column Hero split (text/CTAs left, live interactive board teaser right).
  - 4-column arena mode selection cards (`lg:grid-cols-4`).
  - Full top bar navigation with 4 single-line links and primary action CTA.
  - Large $380\times 380\text{px}$ to $400\times 400\text{px}$ board with targeting reticle hover physics.
- **Large Desktops (≥ 1440px)**:
  - Container capped at `max-w-7xl` with generous padding to prevent wide-screen dispersion.

---

## 6. Practical QA & Anti-Pattern Checklist

- [x] **No Generic AI Slop**: No fuzzy purple nebulas, no 2px unreadable neon text, no fake compiler consoles.
- [x] **No Documentation Bleed**: No developer API tabs, no code markdown viewports in the game interface.
- [x] **Board Priority**: The game board is the central visual hero in gameplay screens.
- [x] **Touch Reliability**: All cell buttons and CTA targets are large and accessible.
- [x] **Contrast Compliance**: Primary text `#F2F7FF` on `#080B12` yields 17.6:1 contrast ratio (exceeds WCAG AAA).
