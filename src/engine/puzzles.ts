import { PuzzleScenario, PuzzleDifficulty } from '../types/game';
import { checkWinner, makeMove, getAvailableMoves } from './rules';

export const PUZZLE_SCENARIOS: PuzzleScenario[] = [
  // --- TIER 1: RECRUIT (Levels 1-3) ---
  {
    id: 'puz-rec-1-fork',
    title: 'Diagonal Breakthrough',
    level: 1,
    difficulty: 'recruit',
    boardSize: 3,
    // Indices: 0: X, 1: O, 4: X, 6: O. Target 8 completes (0, 4, 8)
    initialBoard: [
      'X', 'O', null,
      null, 'X', null,
      'O', null, null,
    ],
    playerMark: 'X',
    targetMove: 8,
    objective: 'Deliver the decisive checkmate along the primary diagonal.',
    hint: 'Look at the line running from top-left to bottom-right.',
    explanation: 'Placing mark X at index 8 completes the 3-in-a-row diagonal (0, 4, 8).',
  },
  {
    id: 'puz-rec-2-counter',
    title: 'Top Flank Intercept',
    level: 2,
    difficulty: 'recruit',
    boardSize: 3,
    // O threatens win on row 0: [O, O, null]. X has marks at 3, 7. X must block at index 2!
    initialBoard: [
      'O', 'O', null,
      'X', null, null,
      null, 'X', null,
    ],
    playerMark: 'X',
    targetMove: 2,
    objective: 'Prevent immediate defeat by intercepting the opponent row threat.',
    hint: 'Block row 0 before opponent claims the top-right corner.',
    explanation: 'Playing at cell 2 blocks O from securing 3-in-a-row on their next turn.',
  },
  {
    id: 'puz-rec-3-vertical',
    title: 'Column Overdrive',
    level: 3,
    difficulty: 'recruit',
    boardSize: 3,
    // X has marks at 1 and 4. Cell 7 completes col 1: [1, 4, 7]!
    initialBoard: [
      'O', 'X', null,
      null, 'X', 'O',
      null, null, null,
    ],
    playerMark: 'X',
    targetMove: 7,
    objective: 'Execute a direct vertical blitz down the center column.',
    hint: 'Inspect the central vertical lane from top to bottom.',
    explanation: 'Playing at cell 7 completes 3 matching marks along the center column (1, 4, 7).',
  },

  // --- TIER 2: TACTICIAN (Levels 4-6) ---
  {
    id: 'puz-tac-4-anti-diag',
    title: 'Reverse Vector Strike',
    level: 4,
    difficulty: 'tactician',
    boardSize: 3,
    // X has marks at 2 and 4. Cell 6 completes the anti-diagonal [2, 4, 6]!
    initialBoard: [
      null, 'O', 'X',
      'O', 'X', null,
      null, null, null,
    ],
    playerMark: 'X',
    targetMove: 6,
    objective: 'Strike across the ascending diagonal to claim victory.',
    hint: 'Trace the line from top-right to bottom-left.',
    explanation: 'Placing X at cell 6 connects the anti-diagonal (2, 4, 6) for an instant win.',
  },
  {
    id: 'puz-tac-5-shield',
    title: 'Center Diagonal Guard',
    level: 5,
    difficulty: 'tactician',
    boardSize: 3,
    // O threatens diagonal win [0, 4, 8]. O has 0 and 4. X must block index 8!
    initialBoard: [
      'O', null, 'X',
      null, 'O', null,
      null, 'X', null,
    ],
    playerMark: 'X',
    targetMove: 8,
    objective: 'Neutralize the opponent diagonal offensive before they strike.',
    hint: 'Guard the bottom-right corner against the incoming diagonal.',
    explanation: 'Playing at cell 8 blocks opponent O from completing the primary diagonal.',
  },
  {
    id: 'puz-tac-6-corner-trap',
    title: 'Corner Fork Ignition',
    level: 6,
    difficulty: 'tactician',
    boardSize: 3,
    // X has marks at 0 and 6. Placing at 3 wins column 0 [0, 3, 6]!
    initialBoard: [
      'X', 'O', null,
      null, 'O', null,
      'X', null, null,
    ],
    playerMark: 'X',
    targetMove: 3,
    objective: 'Complete the left perimeter flank to crush the defense.',
    hint: 'Look between the two marks on the left column.',
    explanation: 'Playing at cell 3 secures 3-in-a-row down the left column (0, 3, 6).',
  },

  // --- TIER 3: OPERATIVE (Levels 7-9) ---
  {
    id: 'puz-opr-7-4x4-flank',
    title: 'Perimeter Breach',
    level: 7,
    difficulty: 'operative',
    boardSize: 4,
    // 4x4: Row 2 has indices 8, 9, 10 occupied by X. Cell 11 finishes 4-in-a-row!
    initialBoard: [
      'O', null, null, 'O',
      null, 'O', null, null,
      'X', 'X', 'X', null,
      null, null, null, 'O',
    ],
    playerMark: 'X',
    targetMove: 11,
    objective: 'Complete the 4-in-a-row horizontal breakthrough.',
    hint: 'Inspect the third row for an unbroken 3-cell chain.',
    explanation: 'Placing mark X at index 11 secures the 4-in-a-row victory condition (8, 9, 10, 11).',
  },
  {
    id: 'puz-opr-8-4x4-diag',
    title: 'Diagonal Overdrive',
    level: 8,
    difficulty: 'operative',
    boardSize: 4,
    // 4x4: Diagonal 0, 5, 10, 15 has X at 0, 5, 10. Cell 15 completes 4-in-a-row!
    initialBoard: [
      'X', 'O', null, null,
      null, 'X', 'O', null,
      null, null, 'X', null,
      'O', null, null, null,
    ],
    playerMark: 'X',
    targetMove: 15,
    objective: 'Connect the 4-mark corner-to-corner laser line.',
    hint: 'Trace the main diagonal down to the bottom-right corner.',
    explanation: 'Cell 15 completes the 4-in-a-row diagonal (0, 5, 10, 15).',
  },
  {
    id: 'puz-opr-9-4x4-block',
    title: 'Matrix Firewall',
    level: 9,
    difficulty: 'operative',
    boardSize: 4,
    // 4x4: Opponent O has col 1: indices 1, 5, 9. Threatens index 13 for 4-in-a-row!
    initialBoard: [
      null, 'O', 'X', null,
      'X', 'O', null, null,
      null, 'O', null, 'X',
      null, null, null, null,
    ],
    playerMark: 'X',
    targetMove: 13,
    objective: 'Establish a defensive firewall before opponent completes column 1.',
    hint: 'Scan column 1 to halt the vertical chain at the baseline.',
    explanation: 'Placing X at index 13 blocks opponent O from finishing 4-in-a-row (1, 5, 9, 13).',
  },

  // --- TIER 4: APEX (Levels 10-12) ---
  {
    id: 'puz-apx-10-5x5-corridor',
    title: 'Gomoku Corridor',
    level: 10,
    difficulty: 'apex',
    boardSize: 5,
    // 5x5: Row 2 columns 1, 2, 3 have X: indices 11, 12, 13. Win is 4-in-a-row. Cell 14 finishes!
    initialBoard: [
      null, null, null, null, null,
      'O', null, 'O', null, null,
      null, 'X', 'X', 'X', null,
      null, 'O', null, null, null,
      null, null, null, null, 'O',
    ],
    playerMark: 'X',
    targetMove: 14,
    objective: 'Complete the 4-in-a-row horizontal vector.',
    hint: 'Extend the center triple flank horizontally.',
    explanation: 'Playing at cell 14 completes 4 consecutive matching marks (11, 12, 13, 14).',
  },
  {
    id: 'puz-apx-11-5x5-counter',
    title: 'The Neural Block',
    level: 11,
    difficulty: 'apex',
    boardSize: 5,
    // 5x5: Opponent O has 3 in a row vertically: col 2 -> 2, 7, 12. Threatens 17 for 4-in-a-row.
    initialBoard: [
      null, null, 'O', null, null,
      null, null, 'O', null, null,
      null, null, 'O', null, null,
      null, 'X', null, 'X', null,
      null, null, null, null, 'X',
    ],
    playerMark: 'X',
    targetMove: 17,
    objective: 'Block the vertical column attack before O secures 4-in-a-row.',
    hint: 'Look down the center column.',
    explanation: 'Placing X at cell 17 stops opponent O from winning on index 17.',
  },
  {
    id: 'puz-apx-12-5x5-diagonal',
    title: 'Sub-Matrix Pinnacle',
    level: 12,
    difficulty: 'apex',
    boardSize: 5,
    // 5x5: Diagonal from (1, 1)=6, (2, 2)=12, (3, 3)=18. Cell (4, 4)=24 finishes 4-in-a-row!
    initialBoard: [
      'O', null, null, null, null,
      null, 'X', null, 'O', null,
      null, null, 'X', null, null,
      'O', null, null, 'X', null,
      null, null, null, null, null,
    ],
    playerMark: 'X',
    targetMove: 24,
    objective: 'Complete the 4-in-a-row diagonal vector to conquer the arena.',
    hint: 'Trace the diagonal cascade down to the bottom-right terminal node.',
    explanation: 'Playing at cell 24 completes the 4-in-a-row diagonal vector (6, 12, 18, 24).',
  },
];

/**
 * Validates whether the given move satisfies the puzzle objective.
 * The move must:
 * 1. Be legal and unoccupied on the initial board
 * 2. Match the puzzle's designated target move
 * 3. Either produce an immediate victory for the player OR immediately block the opponent's winning threat.
 */
export function validatePuzzleMove(puzzle: PuzzleScenario, moveIndex: number): boolean {
  if (moveIndex < 0 || moveIndex >= puzzle.initialBoard.length) return false;
  if (puzzle.initialBoard[moveIndex] !== null) return false;
  if (puzzle.targetMove !== moveIndex) return false;

  // Verify the move is valid in the game rules
  const afterMove = makeMove(puzzle.initialBoard, moveIndex, puzzle.playerMark);
  const winResult = checkWinner(afterMove, puzzle.boardSize);

  if (winResult.winner === puzzle.playerMark) {
    return true;
  }

  // If not a winning move, verify it was a required defensive block against opponent win
  const opponentMark = puzzle.playerMark === 'X' ? 'O' : 'X';
  const oppWinsAtTarget = checkWinner(makeMove(puzzle.initialBoard, moveIndex, opponentMark), puzzle.boardSize);
  return oppWinsAtTarget.winner === opponentMark;
}

/**
 * Returns puzzles grouped by difficulty tier.
 */
export function getPuzzlesByDifficulty(difficulty: PuzzleDifficulty): PuzzleScenario[] {
  return PUZZLE_SCENARIOS.filter((p) => p.difficulty === difficulty);
}

/**
 * Replay support: finds a different valid puzzle in the current difficulty pool
 * that has not yet been played, or wraps around if all have been played.
 */
export function getNextPuzzleVariant(
  currentId: string,
  historyIds: string[]
): PuzzleScenario {
  const current = PUZZLE_SCENARIOS.find((p) => p.id === currentId) || PUZZLE_SCENARIOS[0];
  const pool = getPuzzlesByDifficulty(current.difficulty);

  // Filter pool for unplayed variants
  const unplayed = pool.filter((p) => p.id !== currentId && !historyIds.includes(p.id));
  if (unplayed.length > 0) {
    return unplayed[0];
  }

  // Fallback to any other variant in tier
  const otherVariants = pool.filter((p) => p.id !== currentId);
  if (otherVariants.length > 0) {
    return otherVariants[0];
  }

  return current;
}
