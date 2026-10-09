export type BoardSize = 3 | 4 | 5;
export type PlayerMark = 'X' | 'O';
export type CellValue = PlayerMark | null;

export type GameStatus = 'WAITING' | 'PLAYING' | 'WON' | 'DRAW';
export type GameMode = 'ai' | 'pass_and_play' | 'online' | 'puzzle';
export type AIDifficulty = 'casual' | 'focused' | 'master';

export interface WinResult {
  winner: PlayerMark | null;
  isDraw: boolean;
  winningLine: number[] | null;
}

export interface MatchScore {
  playerX: number;
  playerO: number;
  draws: number;
}

export interface MatchRecord {
  id: string;
  timestamp: number;
  boardSize: BoardSize;
  mode: GameMode;
  difficulty?: AIDifficulty;
  winner: PlayerMark | 'DRAW';
  turns: number;
  playerMark: PlayerMark;
}

export interface UserSettings {
  soundEnabled: boolean;
  reducedMotion: boolean;
  preferredBoardSize: BoardSize;
  preferredDifficulty: AIDifficulty;
}

export type PuzzleDifficulty = 'recruit' | 'tactician' | 'operative' | 'apex';

export interface PuzzleScenario {
  id: string;
  title: string;
  level: number;
  difficulty: PuzzleDifficulty;
  boardSize: BoardSize;
  initialBoard: CellValue[];
  playerMark: PlayerMark;
  targetMove: number;
  objective: string;
  hint: string;
  explanation: string;
}

export interface PlayerFeedback {
  id: string;
  callsign: string;
  discipline: string;
  rating: number;
  message: string;
  timestamp: number;
  isBenchmark?: boolean;
}
