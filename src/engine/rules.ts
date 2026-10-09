import { BoardSize, CellValue, PlayerMark, WinResult, GameStatus } from '../types/game';

/**
 * Creates an empty board of length size * size.
 */
export function createEmptyBoard(size: BoardSize): CellValue[] {
  return Array(size * size).fill(null);
}

/**
 * Generates all winning combinations for a given board size and winning run length.
 * 3x3 -> 3 in a row
 * 4x4 -> 4 in a row
 * 5x5 -> 4 in a row
 */
export function getWinningLines(size: BoardSize): number[][] {
  const lines: number[][] = [];
  const winLength = size === 3 ? 3 : 4; // 3 for 3x3; 4 for 4x4 and 5x5

  // 1. Horizontal Rows
  for (let r = 0; r < size; r++) {
    for (let c = 0; c <= size - winLength; c++) {
      const line: number[] = [];
      for (let k = 0; k < winLength; k++) {
        line.push(r * size + (c + k));
      }
      lines.push(line);
    }
  }

  // 2. Vertical Columns
  for (let c = 0; c < size; c++) {
    for (let r = 0; r <= size - winLength; r++) {
      const line: number[] = [];
      for (let k = 0; k < winLength; k++) {
        line.push((r + k) * size + c);
      }
      lines.push(line);
    }
  }

  // 3. Diagonal Down-Right (\)
  for (let r = 0; r <= size - winLength; r++) {
    for (let c = 0; c <= size - winLength; c++) {
      const line: number[] = [];
      for (let k = 0; k < winLength; k++) {
        line.push((r + k) * size + (c + k));
      }
      lines.push(line);
    }
  }

  // 4. Diagonal Up-Right (/)
  for (let r = winLength - 1; r < size; r++) {
    for (let c = 0; c <= size - winLength; c++) {
      const line: number[] = [];
      for (let k = 0; k < winLength; k++) {
        line.push((r - k) * size + (c + k));
      }
      lines.push(line);
    }
  }

  return lines;
}

// Cached winning lines for instant evaluation performance
const cachedLines: Record<BoardSize, number[][]> = {
  3: getWinningLines(3),
  4: getWinningLines(4),
  5: getWinningLines(5),
};

/**
 * Evaluates board state and determines winner, winning line coordinates, or draw.
 */
export function checkWinner(board: CellValue[], size: BoardSize): WinResult {
  const lines = cachedLines[size] || getWinningLines(size);

  for (const line of lines) {
    const first = board[line[0]];
    if (!first) continue;

    let match = true;
    for (let i = 1; i < line.length; i++) {
      if (board[line[i]] !== first) {
        match = false;
        break;
      }
    }

    if (match) {
      return {
        winner: first,
        isDraw: false,
        winningLine: line,
      };
    }
  }

  // Check for draw (all cells filled without a winner)
  const isFull = board.every((cell) => cell !== null);
  if (isFull) {
    return {
      winner: null,
      isDraw: true,
      winningLine: null,
    };
  }

  return {
    winner: null,
    isDraw: false,
    winningLine: null,
  };
}

/**
 * Returns all unoccupied indices on the board.
 */
export function getAvailableMoves(board: CellValue[]): number[] {
  const moves: number[] = [];
  for (let i = 0; i < board.length; i++) {
    if (board[i] === null) {
      moves.push(i);
    }
  }
  return moves;
}

/**
 * Validates if a move can legally be placed.
 */
export function isValidMove(board: CellValue[], index: number, status: GameStatus): boolean {
  if (status !== 'PLAYING') return false;
  if (index < 0 || index >= board.length) return false;
  return board[index] === null;
}

/**
 * Creates an immutable copy of the board with the player's mark placed.
 */
export function makeMove(board: CellValue[], index: number, mark: PlayerMark): CellValue[] {
  const next = [...board];
  next[index] = mark;
  return next;
}
