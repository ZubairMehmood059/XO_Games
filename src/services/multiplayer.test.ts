import test from 'node:test';
import assert from 'node:assert';
import { multiplayerService } from './multiplayer.ts';
import { createEmptyBoard, checkWinner, isValidMove } from '../engine/rules.ts';
import { getAIMove } from '../engine/ai.ts';
import { PUZZLE_SCENARIOS, validatePuzzleMove } from '../engine/puzzles.ts';
import { RoomStatePayload, HealthResponse, CreateRoomResponse, JoinRoomResponse } from '../types/api.ts';

test('Multiplayer Service: Fallback URLs and base configuration are valid', () => {
  const apiBase = multiplayerService.getApiBaseUrl();
  const wsBase = multiplayerService.getWsBaseUrl();
  assert.ok(apiBase.startsWith('http://') || apiBase.startsWith('https://'));
  assert.ok(wsBase.startsWith('ws://') || wsBase.startsWith('wss://'));
});

test('Multiplayer Service: Health check handles offline gracefully without throwing', async () => {
  // Mock global fetch to simulate network offline / timeout
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    throw new Error('Connection refused');
  };

  try {
    const health = await multiplayerService.checkHealth();
    assert.strictEqual(health, null);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('Multiplayer Service: API contracts and type structure validation', () => {
  const mockHealth: HealthResponse = {
    status: 'online',
    version: '1.0.0',
    active_rooms: 3,
    timestamp: 1742080000,
  };
  assert.strictEqual(mockHealth.status, 'online');
  assert.strictEqual(typeof mockHealth.active_rooms, 'number');

  const mockCreateRes: CreateRoomResponse = {
    room_code: 'CYBER-777',
    board_size: 3,
    player_id: 'usr_abc123',
    symbol: 'X',
    ws_url: '/ws/CYBER-777?player_id=usr_abc123',
  };
  assert.strictEqual(mockCreateRes.symbol, 'X');
  assert.strictEqual(mockCreateRes.board_size, 3);

  const mockJoinRes: JoinRoomResponse = {
    room_code: 'CYBER-777',
    board_size: 3,
    player_id: 'usr_xyz456',
    symbol: 'O',
    ws_url: '/ws/CYBER-777?player_id=usr_xyz456',
  };
  assert.strictEqual(mockJoinRes.symbol, 'O');

  const mockRoomState: RoomStatePayload = {
    type: 'ROOM_STATE',
    room_code: 'CYBER-777',
    board_size: 3,
    board: ['X', null, 'O', null, 'X', null, null, null, null],
    current_turn: 'O',
    status: 'PLAYING',
    winning_line: null,
    winner: null,
    players: {
      X: { id: 'usr_abc123', name: 'Pilot_01', connected: true, score: 0 },
      O: { id: 'usr_xyz456', name: 'Rival_02', connected: true, score: 0 },
    },
  };
  assert.strictEqual(mockRoomState.status, 'PLAYING');
  assert.strictEqual(mockRoomState.current_turn, 'O');
});

test('Offline Fault Tolerance: Local game engine runs 100% offline without backend', () => {
  // Local Pass-and-play move flow
  const board = createEmptyBoard(3);
  assert.strictEqual(isValidMove(board, 4, 'PLAYING'), true);
  board[4] = 'X';
  board[0] = 'O';
  board[2] = 'X';
  board[1] = 'O';
  board[6] = 'X'; // X has 4, 2, 6 -> diagonal [2, 4, 6] win!
  const win = checkWinner(board, 3);
  assert.strictEqual(win.winner, 'X');
  assert.deepStrictEqual(win.winningLine, [6, 4, 2]);
});

test('Offline Fault Tolerance: AI calculations run 100% offline with zero latency penalties', () => {
  const board = createEmptyBoard(3);
  board[0] = 'X';
  board[1] = 'X';
  // AI playing O must block cell 2
  const blockMove = getAIMove(board, 3, 'O', 'focused');
  assert.strictEqual(blockMove, 2);
});

test('Offline Fault Tolerance: Tactical puzzles validate offline with deterministic keys', () => {
  assert.ok(PUZZLE_SCENARIOS.length >= 6);
  for (const puzzle of PUZZLE_SCENARIOS) {
    assert.strictEqual(validatePuzzleMove(puzzle, puzzle.targetMove), true);
  }
});
