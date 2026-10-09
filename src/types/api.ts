import { BoardSize, CellValue, GameStatus, PlayerMark } from './game';

export type ConnectionStatus =
  | 'LOCAL_ONLY'
  | 'CONNECTING'
  | 'WAITING_OPPONENT'
  | 'MATCH_ACTIVE'
  | 'DISCONNECTED'
  | 'RECONNECTING'
  | 'ERROR';

export interface CreateRoomRequest {
  board_size: BoardSize;
  creator_name: string;
}

export interface CreateRoomResponse {
  room_code: string;
  board_size: BoardSize;
  player_id: string;
  symbol: PlayerMark;
  ws_url: string;
}

export interface JoinRoomRequest {
  player_name: string;
}

export interface JoinRoomResponse {
  room_code: string;
  board_size: BoardSize;
  player_id: string;
  symbol: PlayerMark;
  ws_url: string;
}

export interface HealthResponse {
  status: string;
  version: string;
  active_rooms: number;
  timestamp: number;
}

export interface PlayerInfo {
  id: string;
  name: string;
  connected: boolean;
  score: number;
}

export interface RoomStatePayload {
  type: 'ROOM_STATE';
  room_code: string;
  board_size: BoardSize;
  board: CellValue[];
  current_turn: PlayerMark;
  status: GameStatus;
  winning_line: number[] | null;
  winner: PlayerMark | null;
  players: {
    X: PlayerInfo;
    O?: PlayerInfo;
  };
  rematch_requested_by?: string[];
}

export interface MatchOverPayload {
  type: 'MATCH_OVER';
  status: GameStatus;
  winner: PlayerMark | null;
  winning_line: number[] | null;
  board: CellValue[];
}

export interface ErrorPayload {
  type: 'ERROR';
  code: string;
  message: string;
}

export interface OpponentDisconnectedPayload {
  type: 'OPPONENT_DISCONNECTED';
  message: string;
}

export type WSServerMessage =
  | RoomStatePayload
  | MatchOverPayload
  | ErrorPayload
  | OpponentDisconnectedPayload;

export interface WSClientMove {
  type: 'MOVE';
  cell_index: number;
}

export interface WSClientRematch {
  type: 'REMATCH_REQUEST';
}

export interface WSClientResign {
  type: 'RESIGN';
}

export type WSClientMessage = WSClientMove | WSClientRematch | WSClientResign;
