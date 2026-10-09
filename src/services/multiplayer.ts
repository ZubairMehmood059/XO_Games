import {
  CreateRoomRequest,
  CreateRoomResponse,
  HealthResponse,
  JoinRoomRequest,
  JoinRoomResponse,
  RoomStatePayload,
  WSServerMessage,
} from '../types/api';

const env = (typeof import.meta !== 'undefined' && (import.meta as any).env) || {};

const API_BASE_URL =
  env.VITE_API_BASE_URL ||
  (typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}:8000` : 'http://localhost:8000');

const WS_BASE_URL =
  env.VITE_WS_BASE_URL ||
  (typeof window !== 'undefined'
    ? `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.hostname}:8000`
    : 'ws://localhost:8000');

export interface MultiPlayerCallbacks {
  onStateUpdate: (state: RoomStatePayload) => void;
  onError: (errorMsg: string) => void;
  onOpponentDisconnected: (msg: string) => void;
  onConnectionChange: (connected: boolean) => void;
}

class MultiplayerService {
  private socket: WebSocket | null = null;
  private currentRoomCode: string | null = null;
  private currentPlayerId: string | null = null;
  private callbacks: MultiPlayerCallbacks | null = null;

  public getApiBaseUrl(): string {
    return API_BASE_URL;
  }

  public getWsBaseUrl(): string {
    return WS_BASE_URL;
  }

  public async checkHealth(): Promise<HealthResponse | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/health`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(3000),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  public async createRoom(request: CreateRoomRequest): Promise<CreateRoomResponse> {
    const res = await fetch(`${API_BASE_URL}/api/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to create room' }));
      throw new Error(err.detail || 'Room creation failed');
    }

    return await res.json();
  }

  public async joinRoom(roomCode: string, request: JoinRoomRequest): Promise<JoinRoomResponse> {
    const cleanCode = roomCode.trim().toUpperCase();
    const res = await fetch(`${API_BASE_URL}/api/rooms/${cleanCode}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to join room' }));
      throw new Error(err.detail || 'Room joining failed');
    }

    return await res.json();
  }

  public connectWebSocket(
    roomCode: string,
    playerId: string,
    callbacks: MultiPlayerCallbacks
  ): void {
    this.disconnect();
    this.currentRoomCode = roomCode;
    this.currentPlayerId = playerId;
    this.callbacks = callbacks;

    const wsUrl = `${WS_BASE_URL}/ws/${roomCode}?player_id=${playerId}`;

    try {
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        this.callbacks?.onConnectionChange(true);
      };

      this.socket.onmessage = (event) => {
        try {
          const message: WSServerMessage = JSON.parse(event.data);
          if (message.type === 'ROOM_STATE') {
            this.callbacks?.onStateUpdate(message);
          } else if (message.type === 'ERROR') {
            this.callbacks?.onError(message.message);
          } else if (message.type === 'OPPONENT_DISCONNECTED') {
            this.callbacks?.onOpponentDisconnected(message.message);
          }
        } catch {
          // Ignore parse errors
        }
      };

      this.socket.onerror = () => {
        this.callbacks?.onError('WebSocket connection error. Is the server running?');
      };

      this.socket.onclose = () => {
        this.callbacks?.onConnectionChange(false);
      };
    } catch (err) {
      this.callbacks?.onError(`Failed to open WebSocket: ${err instanceof Error ? err.message : 'Unknown'}`);
    }
  }

  public sendMove(cellIndex: number): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      this.callbacks?.onError('Not connected to game server');
      return;
    }
    this.socket.send(
      JSON.stringify({
        type: 'MOVE',
        cell_index: cellIndex,
      })
    );
  }

  public sendRematch(): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;
    this.socket.send(
      JSON.stringify({
        type: 'REMATCH_REQUEST',
      })
    );
  }

  public disconnect(): void {
    if (this.socket) {
      try {
        this.socket.close();
      } catch {
        // Ignore
      }
      this.socket = null;
    }
    this.currentRoomCode = null;
    this.currentPlayerId = null;
  }
}

export const multiplayerService = new MultiplayerService();
