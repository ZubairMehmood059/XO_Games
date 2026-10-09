# XO Games — Cyberpunk Arena Design System (04-DESIGN-SYSTEM.md)

**Product:** XO Games  
**Status:** **DESIGN LOCK FROZEN**  
**Creative Direction:** Cyberpunk Arena Gaming Platform  
**Source of Truth:** Aligned with `Design.md` and `Skill.md`  

---

## 1. Design Tokens

### Color Palette
- `Main Background`: `#080B12`
- `Secondary Background`: `#0E1420`
- `Elevated Surface`: `#141D2B`
- `Strong Surface`: `#1B2638`
- `Primary Text`: `#F2F7FF`
- `Secondary Text`: `#9BAAC0`
- `Subtle Borders`: `#29384D`
- `Electric Cyan`: `#35E7FF` (Primary Interaction & Player X)
- `Neon Magenta`: `#FF3DAE` (Player O & Counter Highlights)
- `Competitive Amber`: `#FFC857` (Special Status & High-Priority CTAs)
- `Success`: `#4FE3A4`
- `Error`: `#FF647C`

### Typography
- **Headings & Display Brand**: `Barlow Condensed` (Bold, ExtraBold)
- **Interface & Body**: `Inter` (Regular, Medium, SemiBold)
- **Technical Telemetry**: `JetBrains Mono` / Monospace (Tabular Numerals)

### Layout & Sizing
- **Board Grid**: Discrete floating tile cells with 8px–12px gaps on `#141D2B` elevated surface.
- **Chamfers**: 6px angled corner cuts on selected interactive buttons and HUD headers.
- **Touch Targets**: Minimum $\ge 44\times 44\text{px}$ across all mobile breakpoints.

---

## 2. Screen Specifications

1. **Home / Arena Lobby**: Distinctive `XO GAMES` wordmark, cyberpunk hero with interactive live board teaser, instant match launcher, and mode showcase.
2. **Mode Selection**: Classic 3×3 (Speed duel), Tactical 4×4 Matrix (No-draw condition), Arena 5×5 (Grandmaster flank tactics), and Neural Puzzles.
3. **Gameplay Screen**: Centered dominant game board, dual combatant HUD with animated turn beams, score tallies, audio controls, and rematch trigger.
4. **AI Difficulty Selection**: Novice, Tactician, and Cybermind (Neural Minimax).
5. **Multiplayer Sector Lobby**: 6-character room codes with 1-click copy and instant join.
6. **Victory / Defeat / Draw Modal**: Glowing vector laser win-line reveal, match analysis stats, and 1-click rematch.
7. **Mobile Gameplay**: Responsive aspect ratio, touch-friendly cell targets ($\ge 64\times 64\text{px}$), sticky controls under 12% of screen height.
