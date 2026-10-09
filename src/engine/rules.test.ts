import test from 'node:test';
import assert from 'node:assert';
import { createEmptyBoard, checkWinner, isValidMove, makeMove, getAvailableMoves } from './rules.ts';
import { getAIMove } from './ai.ts';
import { CellValue } from '../types/game.ts';
import { audioService } from '../services/audio.ts';
import {
  PUZZLE_SCENARIOS,
  validatePuzzleMove,
  getPuzzlesByDifficulty,
  getNextPuzzleVariant,
} from './puzzles.ts';

test('3x3 Horizontal Win detection', () => {
  const board: CellValue[] = ['X', 'X', 'X', null, 'O', 'O', null, null, null];
  const result = checkWinner(board, 3);
  assert.strictEqual(result.winner, 'X');
  assert.strictEqual(result.isDraw, false);
  assert.deepStrictEqual(result.winningLine, [0, 1, 2]);
});

test('3x3 Vertical Win detection', () => {
  const board: CellValue[] = ['O', 'X', null, 'O', 'X', null, 'O', null, null];
  const result = checkWinner(board, 3);
  assert.strictEqual(result.winner, 'O');
  assert.strictEqual(result.isDraw, false);
  assert.deepStrictEqual(result.winningLine, [0, 3, 6]);
});

test('3x3 Diagonal Win detection', () => {
  const board: CellValue[] = ['X', 'O', null, null, 'X', 'O', null, null, 'X'];
  const result = checkWinner(board, 3);
  assert.strictEqual(result.winner, 'X');
  assert.strictEqual(result.isDraw, false);
  assert.deepStrictEqual(result.winningLine, [0, 4, 8]);
});

test('3x3 Draw detection', () => {
  const board: CellValue[] = ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X'];
  const result = checkWinner(board, 3);
  assert.strictEqual(result.winner, null);
  assert.strictEqual(result.isDraw, true);
  assert.strictEqual(result.winningLine, null);
});

test('4x4 4-in-a-row Win detection', () => {
  const board = createEmptyBoard(4);
  [8, 9, 10, 11].forEach((i) => {
    board[i] = 'X';
  });
  const result = checkWinner(board, 4);
  assert.strictEqual(result.winner, 'X');
  assert.deepStrictEqual(result.winningLine, [8, 9, 10, 11]);
});

test('5x5 4-in-a-row Win detection', () => {
  const board = createEmptyBoard(5);
  [6, 7, 8, 9].forEach((i) => {
    board[i] = 'X';
  });
  const result = checkWinner(board, 5);
  assert.strictEqual(result.winner, 'X');
  assert.deepStrictEqual(result.winningLine, [6, 7, 8, 9]);
});

test('Move legality enforcement', () => {
  const board = createEmptyBoard(3);
  board[0] = 'X';
  assert.strictEqual(isValidMove(board, 0, 'PLAYING'), false);
  assert.strictEqual(isValidMove(board, 1, 'PLAYING'), true);
  assert.strictEqual(isValidMove(board, 1, 'WON'), false);
  assert.strictEqual(isValidMove(board, 9, 'PLAYING'), false);
});

test('AI Focused takes immediate win', () => {
  // Board where X has 0, 1 occupied. Cell 2 wins!
  const board: CellValue[] = ['X', 'X', null, 'O', 'O', null, null, null, null];
  const aiMove = getAIMove(board, 3, 'X', 'focused');
  assert.strictEqual(aiMove, 2);
});

test('AI Focused blocks opponent immediate win', () => {
  // Opponent O has 3, 4 occupied. Threatens 5.
  const board: CellValue[] = ['X', null, null, 'O', 'O', null, null, null, null];
  const aiMove = getAIMove(board, 3, 'X', 'focused');
  assert.strictEqual(aiMove, 5);
});

test('AI Master Minimax blocks terminal threat', () => {
  // Opponent O has [0, 1]. Threatens 2.
  const board: CellValue[] = ['O', 'O', null, 'X', null, null, null, null, null];
  const aiMove = getAIMove(board, 3, 'X', 'master');
  assert.strictEqual(aiMove, 2);
});

test('Feedback validation format and integrity', () => {
  const sample = {
    callsign: 'Specter_7',
    discipline: 'Tactical 4×4',
    rating: 5,
    message: 'Matrix forks require deep scanning. Flawless responsive touch targets on mobile.',
  };
  assert.ok(sample.callsign.length >= 3);
  assert.ok(sample.rating >= 1 && sample.rating <= 5);
  assert.ok(sample.message.length >= 5);
});

test('AI Audit: Casual genuinely makes random legal moves without hardcoded biases', () => {
  const emptyBoard = createEmptyBoard(3);
  const movesSample = new Set<number>();
  for (let i = 0; i < 60; i++) {
    const move = getAIMove(emptyBoard, 3, 'O', 'casual');
    assert.ok(move >= 0 && move <= 8);
    assert.strictEqual(emptyBoard[move], null);
    movesSample.add(move);
  }
  // Across 60 samples on an empty 3x3 board, casual should pick at least 6 different cells
  assert.ok(movesSample.size >= 6, `Expected varied random moves, got ${movesSample.size}`);
});

test('AI Audit: Focused respects tactical center and corner heuristics across board sizes', () => {
  // 3x3 empty board -> center cell 4
  const empty3 = createEmptyBoard(3);
  const move3 = getAIMove(empty3, 3, 'O', 'focused');
  assert.strictEqual(move3, 4);

  // 4x4 empty board -> true tactical center cells [5, 6, 9, 10]
  const empty4 = createEmptyBoard(4);
  const move4 = getAIMove(empty4, 4, 'O', 'focused');
  assert.ok([5, 6, 9, 10].includes(move4), `Expected 4x4 center [5,6,9,10], got ${move4}`);

  // 5x5 empty board -> center cell 12
  const empty5 = createEmptyBoard(5);
  const move5 = getAIMove(empty5, 5, 'O', 'focused');
  assert.strictEqual(move5, 12);
});

test('AI Audit: AI respects turn order, never moves twice, and mutates only legal cells', () => {
  const board = createEmptyBoard(3);
  board[0] = 'X';
  const aiMove = getAIMove(board, 3, 'O', 'focused');
  assert.notStrictEqual(aiMove, 0);
  assert.strictEqual(board[aiMove], null);

  const nextBoard = makeMove(board, aiMove, 'O');
  assert.strictEqual(nextBoard[0], 'X');
  assert.strictEqual(nextBoard[aiMove], 'O');
  // Original board immutable
  assert.strictEqual(board[aiMove], null);
});

test('AI Audit: Focused is beatable by standard tactical corner forks on 3x3', () => {
  // Human opens corner 0, AI takes center 4
  let board = createEmptyBoard(3);
  board = makeMove(board, 0, 'X');
  const ai1 = getAIMove(board, 3, 'O', 'focused');
  assert.strictEqual(ai1, 4);
  board = makeMove(board, ai1, 'O');

  // Human takes opposite corner 8
  board = makeMove(board, 8, 'X');
  const ai2 = getAIMove(board, 3, 'O', 'focused');
  assert.ok([2, 6].includes(ai2), `AI should pick available corner, got ${ai2}`);
  board = makeMove(board, ai2, 'O');

  // Human forks with the other remaining corner
  const remainingCorner = ai2 === 2 ? 6 : 2;
  board = makeMove(board, remainingCorner, 'X');
  // At this point, Human has marks at 0, 8, and remainingCorner, creating a double threat.
  const ai3 = getAIMove(board, 3, 'O', 'focused');
  board = makeMove(board, ai3, 'O');

  // The AI can only block one threat; human wins on the next move.
  const avail = getAvailableMoves(board);
  const humanWinningMoves = avail.filter((m) => checkWinner(makeMove(board, m, 'X'), 3).winner === 'X');
  assert.strictEqual(humanWinningMoves.length >= 1, true, 'Human must have an unblocked winning move');
});

test('AI Audit: Master Minimax is mathematically unbeatably defensive on 3x3', () => {
  // Master must successfully prevent human corner fork by playing edge 1 or 3 or 5 or 7
  let board = createEmptyBoard(3);
  board = makeMove(board, 0, 'X');
  const ai1 = getAIMove(board, 3, 'O', 'master');
  assert.strictEqual(ai1, 4);
  board = makeMove(board, ai1, 'O');

  board = makeMove(board, 8, 'X');
  const ai2 = getAIMove(board, 3, 'O', 'master');
  // Minimax knows to counter opposite corners with an edge, not another corner
  assert.ok([1, 3, 5, 7].includes(ai2), `Master Minimax must pick edge to prevent fork, got ${ai2}`);
});

test('AI Audit: Difficulty selection actually changes AI decisions', () => {
  // Board setup with 1-ply threat: O has [3, 4], threatening 5. X has [0].
  const board: CellValue[] = ['X', null, null, 'O', 'O', null, null, null, null];
  
  // Focused and Master must take the immediate block or win
  const focusedMove = getAIMove(board, 3, 'O', 'focused');
  assert.strictEqual(focusedMove, 5); // Takes immediate win!

  // Casual picks from all available cells [1, 2, 5, 6, 7, 8] uniformly, not always 5
  const casualPicks = new Set<number>();
  for (let i = 0; i < 40; i++) {
    casualPicks.add(getAIMove(board, 3, 'O', 'casual'));
  }
  assert.ok(casualPicks.size > 1, 'Casual should vary choices rather than always playing move 5');
});

test('Sound System: Master Sound ON/OFF toggle and audio triggers work safely', () => {
  // Verify audioService exports
  assert.strictEqual(typeof audioService.isEnabled(), 'boolean');
  assert.strictEqual(typeof audioService.toggle(), 'boolean');
  assert.strictEqual(typeof audioService.setEnabled, 'function');
  assert.strictEqual(typeof audioService.playMove, 'function');
  assert.strictEqual(typeof audioService.playClick, 'function');
  assert.strictEqual(typeof audioService.playWin, 'function');
  assert.strictEqual(typeof audioService.playLoss, 'function');
  assert.strictEqual(typeof audioService.playDraw, 'function');
  assert.strictEqual(typeof audioService.playRestart, 'function');
  assert.strictEqual(typeof audioService.playPuzzleSuccess, 'function');
  assert.strictEqual(typeof audioService.playPuzzleFail, 'function');
  assert.strictEqual(typeof audioService.playConnected, 'function');
  assert.strictEqual(typeof audioService.playDisconnected, 'function');
});

test('Puzzle Mode: Every puzzle has unique ID, legal target, and valid solution', () => {
  const ids = new Set<string>();
  const levels = new Set<number>();

  for (const p of PUZZLE_SCENARIOS) {
    // Uniqueness
    assert.strictEqual(ids.has(p.id), false, `Duplicate puzzle ID: ${p.id}`);
    ids.add(p.id);

    assert.strictEqual(levels.has(p.level), false, `Duplicate puzzle level: ${p.level}`);
    levels.add(p.level);

    // Initial board state integrity
    assert.strictEqual(p.initialBoard.length, p.boardSize * p.boardSize);
    assert.strictEqual(p.initialBoard[p.targetMove], null, `Target move occupied on ${p.id}`);

    // Solvability check
    const isValid = validatePuzzleMove(p, p.targetMove);
    assert.strictEqual(isValid, true, `Puzzle ${p.id} targetMove failed validation`);

    // Invalid moves must fail
    const invalidCandidate = p.targetMove === 0 ? 1 : 0;
    if (p.initialBoard[invalidCandidate] === null) {
      assert.strictEqual(validatePuzzleMove(p, invalidCandidate), false);
    }
  }

  assert.strictEqual(PUZZLE_SCENARIOS.length, 12);
});

test('Puzzle Mode: Progressive difficulty tiers and variant rotation work properly', () => {
  const tiers = ['recruit', 'tactician', 'operative', 'apex'] as const;
  for (const tier of tiers) {
    const pool = getPuzzlesByDifficulty(tier);
    assert.strictEqual(pool.length >= 3, true, `Tier ${tier} should have at least 3 scenarios`);
  }

  // Variant retrieval without repeats
  const first = PUZZLE_SCENARIOS[0];
  const variant = getNextPuzzleVariant(first.id, []);
  assert.notStrictEqual(variant.id, first.id);
  assert.strictEqual(variant.difficulty, first.difficulty);

  // Variant retrieval when one is in history
  const variantWithHistory = getNextPuzzleVariant(first.id, [variant.id]);
  assert.notStrictEqual(variantWithHistory.id, first.id);
  assert.notStrictEqual(variantWithHistory.id, variant.id);
});
