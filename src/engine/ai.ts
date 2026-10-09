import { BoardSize, CellValue, PlayerMark, AIDifficulty } from '../types/game';
import { getAvailableMoves, checkWinner, makeMove, getWinningLines } from './rules';

/**
 * Main AI move calculation entry point.
 */
export function getAIMove(
  board: CellValue[],
  size: BoardSize,
  aiMark: PlayerMark,
  difficulty: AIDifficulty
): number {
  const availableMoves = getAvailableMoves(board);
  if (availableMoves.length === 0) return -1;

  switch (difficulty) {
    case 'casual':
      return getCasualMove(availableMoves);
    case 'focused':
      return getFocusedMove(board, size, aiMark, availableMoves);
    case 'master':
      return getMasterMove(board, size, aiMark, availableMoves);
    default:
      return getCasualMove(availableMoves);
  }
}

/**
 * Casual AI: Selects uniformly and randomly from legal available cells.
 */
function getCasualMove(availableMoves: number[]): number {
  const randomIndex = Math.floor(Math.random() * availableMoves.length);
  return availableMoves[randomIndex];
}

/**
 * Helper to compute true tactical center cells across board dimensions.
 * 3x3 -> [4]
 * 4x4 -> [5, 6, 9, 10]
 * 5x5 -> [12]
 */
function getCenterIndices(size: BoardSize): number[] {
  if (size === 3) return [4];
  if (size === 4) return [5, 6, 9, 10];
  if (size === 5) return [12];
  return [Math.floor((size * size) / 2)];
}

/**
 * Focused AI: Takes immediate wins, blocks immediate opponent wins,
 * otherwise picks optimal positional move based on documented heuristics.
 */
function getFocusedMove(
  board: CellValue[],
  size: BoardSize,
  aiMark: PlayerMark,
  availableMoves: number[]
): number {
  const opponentMark: PlayerMark = aiMark === 'X' ? 'O' : 'X';

  // 1. Check for immediate winning move
  for (const move of availableMoves) {
    const testBoard = makeMove(board, move, aiMark);
    if (checkWinner(testBoard, size).winner === aiMark) {
      return move;
    }
  }

  // 2. Check for immediate opponent winning move to block
  for (const move of availableMoves) {
    const testBoard = makeMove(board, move, opponentMark);
    if (checkWinner(testBoard, size).winner === opponentMark) {
      return move;
    }
  }

  // 3. Positional priority (center cells, then corners, then others)
  const centerCells = getCenterIndices(size).filter((c) => availableMoves.includes(c));
  if (centerCells.length > 0) {
    return centerCells[Math.floor(Math.random() * centerCells.length)];
  }

  const corners = [0, size - 1, size * (size - 1), size * size - 1];
  const availableCorners = corners.filter((c) => availableMoves.includes(c));
  if (availableCorners.length > 0) {
    return availableCorners[Math.floor(Math.random() * availableCorners.length)];
  }

  // 4. Fallback random legal move
  return getCasualMove(availableMoves);
}

/**
 * Master AI:
 * - 3x3: Perfect Minimax with Alpha-Beta pruning (unbeatable).
 * - 4x4 / 5x5: Depth-bounded heuristic search with alpha-beta pruning.
 */
function getMasterMove(
  board: CellValue[],
  size: BoardSize,
  aiMark: PlayerMark,
  availableMoves: number[]
): number {
  const opponentMark: PlayerMark = aiMark === 'X' ? 'O' : 'X';

  // Quick 1-ply win check
  for (const move of availableMoves) {
    const testBoard = makeMove(board, move, aiMark);
    if (checkWinner(testBoard, size).winner === aiMark) {
      return move;
    }
  }

  // Quick 1-ply block check
  for (const move of availableMoves) {
    const testBoard = makeMove(board, move, opponentMark);
    if (checkWinner(testBoard, size).winner === opponentMark) {
      return move;
    }
  }

  if (size === 3) {
    let bestScore = -Infinity;
    let bestMove = availableMoves[0];

    for (const move of availableMoves) {
      const nextBoard = makeMove(board, move, aiMark);
      const score = minimax(nextBoard, 0, false, aiMark, opponentMark, -Infinity, Infinity, 9);
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }
    return bestMove;
  } else {
    // 4x4 and 5x5 heuristic bounded search (max depth 3 to ensure sub-50ms execution)
    const maxDepth = size === 4 ? 3 : 2;
    let bestScore = -Infinity;
    let bestMove = availableMoves[0];

    // Order candidate moves by positional proximity to existing marks for pruning efficiency
    const sortedMoves = sortMovesByProximity(board, availableMoves, size);

    for (const move of sortedMoves) {
      const nextBoard = makeMove(board, move, aiMark);
      const score = heuristicSearch(nextBoard, 0, false, aiMark, opponentMark, -Infinity, Infinity, maxDepth, size);
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }
    return bestMove;
  }
}

/**
 * Standard Minimax for 3x3 board.
 */
function minimax(
  board: CellValue[],
  depth: number,
  isMaximizing: boolean,
  aiMark: PlayerMark,
  opponentMark: PlayerMark,
  alpha: number,
  beta: number,
  maxDepth: number
): number {
  const result = checkWinner(board, 3);
  if (result.winner === aiMark) return 10 - depth;
  if (result.winner === opponentMark) return depth - 10;
  if (result.isDraw || depth >= maxDepth) return 0;

  const availableMoves = getAvailableMoves(board);

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of availableMoves) {
      const nextBoard = makeMove(board, move, aiMark);
      const evaluation = minimax(nextBoard, depth + 1, false, aiMark, opponentMark, alpha, beta, maxDepth);
      maxEval = Math.max(maxEval, evaluation);
      alpha = Math.max(alpha, evaluation);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of availableMoves) {
      const nextBoard = makeMove(board, move, opponentMark);
      const evaluation = minimax(nextBoard, depth + 1, true, aiMark, opponentMark, alpha, beta, maxDepth);
      minEval = Math.min(minEval, evaluation);
      beta = Math.min(beta, evaluation);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

/**
 * Heuristic bounded search for 4x4 and 5x5.
 */
function heuristicSearch(
  board: CellValue[],
  depth: number,
  isMaximizing: boolean,
  aiMark: PlayerMark,
  opponentMark: PlayerMark,
  alpha: number,
  beta: number,
  maxDepth: number,
  size: BoardSize
): number {
  const result = checkWinner(board, size);
  if (result.winner === aiMark) return 1000 - depth;
  if (result.winner === opponentMark) return depth - 1000;
  if (result.isDraw) return 0;
  if (depth >= maxDepth) {
    return evaluateBoardHeuristic(board, size, aiMark, opponentMark);
  }

  const availableMoves = getAvailableMoves(board);
  const candidateMoves = sortMovesByProximity(board, availableMoves, size).slice(0, 10);

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of candidateMoves) {
      const nextBoard = makeMove(board, move, aiMark);
      const evaluation = heuristicSearch(nextBoard, depth + 1, false, aiMark, opponentMark, alpha, beta, maxDepth, size);
      maxEval = Math.max(maxEval, evaluation);
      alpha = Math.max(alpha, evaluation);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of candidateMoves) {
      const nextBoard = makeMove(board, move, opponentMark);
      const evaluation = heuristicSearch(nextBoard, depth + 1, true, aiMark, opponentMark, alpha, beta, maxDepth, size);
      minEval = Math.min(minEval, evaluation);
      beta = Math.min(beta, evaluation);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

/**
 * Positional evaluation function for larger boards.
 */
function evaluateBoardHeuristic(
  board: CellValue[],
  size: BoardSize,
  aiMark: PlayerMark,
  opponentMark: PlayerMark
): number {
  let score = 0;
  const lines = getWinningLines(size);

  for (const line of lines) {
    let aiCount = 0;
    let oppCount = 0;

    for (const idx of line) {
      if (board[idx] === aiMark) aiCount++;
      else if (board[idx] === opponentMark) oppCount++;
    }

    if (aiCount > 0 && oppCount === 0) {
      score += Math.pow(10, aiCount);
    } else if (oppCount > 0 && aiCount === 0) {
      score -= Math.pow(10, oppCount) * 1.2;
    }
  }

  return score;
}

/**
 * Sorts moves prioritizing cells adjacent to occupied marks.
 */
function sortMovesByProximity(board: CellValue[], moves: number[], size: BoardSize): number[] {
  return [...moves].sort((a, b) => {
    const scoreA = getNeighborScore(board, a, size);
    const scoreB = getNeighborScore(board, b, size);
    return scoreB - scoreA;
  });
}

function getNeighborScore(board: CellValue[], index: number, size: BoardSize): number {
  const row = Math.floor(index / size);
  const col = index % size;
  let count = 0;

  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = row + dr;
      const nc = col + dc;
      if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
        if (board[nr * size + nc] !== null) count++;
      }
    }
  }
  return count;
}
