import React, { useState, useEffect } from 'react';
import { ArrowLeft, Radio, Shield, Copy, CheckCircle2, RotateCcw, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { BoardSize, PlayerMark } from '../../types/game';
import { RoomStatePayload, ConnectionStatus } from '../../types/api';
import { multiplayerService } from '../../services/multiplayer';
import { audioService } from '../../services/audio';

interface MultiplayerScreenProps {
  onReturnToLobby: () => void;
}

export const MultiplayerScreen: React.FC<MultiplayerScreenProps> = ({ onReturnToLobby }) => {
  const [selectedSize, setSelectedSize] = useState<BoardSize>(3);
  const [creatorName, setCreatorName] = useState('Pilot_01');
  const [joinName, setJoinName] = useState('Rival_02');
  const [joinCode, setJoinCode] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  const [activeRoomState, setActiveRoomState] = useState<RoomStatePayload | null>(null);
  const [myPlayerId, setMyPlayerId] = useState<string | null>(null);
  const [mySymbol, setMySymbol] = useState<PlayerMark>('X');
  const [status, setStatus] = useState<ConnectionStatus>('LOCAL_ONLY');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [serverOnline, setServerOnline] = useState<boolean | null>(null);

  // Probe server health on mount
  useEffect(() => {
    multiplayerService.checkHealth().then((res) => {
      setServerOnline(res !== null);
    });

    return () => {
      multiplayerService.disconnect();
    };
  }, []);

  const handleCreateRoom = async () => {
    audioService.playClick();
    setStatus('CONNECTING');
    setErrorMessage(null);

    try {
      const roomData = await multiplayerService.createRoom({
        board_size: selectedSize,
        creator_name: creatorName.trim() || 'Pilot_01',
      });

      setMyPlayerId(roomData.player_id);
      setMySymbol(roomData.symbol);
      setStatus('WAITING_OPPONENT');

      multiplayerService.connectWebSocket(roomData.room_code, roomData.player_id, {
        onStateUpdate: (state) => {
          setActiveRoomState((prev) => {
            if (prev && prev.status === 'PLAYING' && state.status !== 'PLAYING') {
              if (state.status === 'DRAW') {
                audioService.playDraw();
              } else if (state.winner === mySymbol) {
                audioService.playWin();
              } else if (state.winner) {
                audioService.playLoss();
              }
            } else if (prev && prev.board && state.board) {
              // Opponent move sound
              const prevMoves = prev.board.filter(Boolean).length;
              const nextMoves = state.board.filter(Boolean).length;
              if (nextMoves > prevMoves && state.current_turn === mySymbol) {
                const opponentSymbol = mySymbol === 'X' ? 'O' : 'X';
                audioService.playMove(opponentSymbol);
              }
            }
            return state;
          });

          if (state.players.O && state.status === 'PLAYING') {
            setStatus('MATCH_ACTIVE');
            audioService.playConnected();
          } else if (state.status === 'WAITING') {
            setStatus('WAITING_OPPONENT');
          }
        },
        onError: (err) => {
          setErrorMessage(err);
          setStatus('ERROR');
          audioService.playDisconnected();
        },
        onOpponentDisconnected: (msg) => {
          setErrorMessage(msg);
          audioService.playDisconnected();
        },
        onConnectionChange: (connected) => {
          if (!connected) {
            setStatus('DISCONNECTED');
            audioService.playDisconnected();
          }
        },
      });
    } catch (err) {
      setStatus('ERROR');
      audioService.playDisconnected();
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Failed to connect to multiplayer backend. Ensure FastAPI server is running.'
      );
    }
  };

  const handleJoinRoom = async () => {
    if (!joinCode.trim()) {
      setErrorMessage('Please enter a valid room code.');
      audioService.playInvalid();
      return;
    }

    audioService.playClick();
    setStatus('CONNECTING');
    setErrorMessage(null);

    try {
      const roomData = await multiplayerService.joinRoom(joinCode, {
        player_name: joinName.trim() || 'Rival_02',
      });

      setMyPlayerId(roomData.player_id);
      setMySymbol(roomData.symbol);
      setStatus('MATCH_ACTIVE');
      audioService.playConnected();

      multiplayerService.connectWebSocket(roomData.room_code, roomData.player_id, {
        onStateUpdate: (state) => {
          setActiveRoomState((prev) => {
            if (prev && prev.status === 'PLAYING' && state.status !== 'PLAYING') {
              if (state.status === 'DRAW') {
                audioService.playDraw();
              } else if (state.winner === mySymbol) {
                audioService.playWin();
              } else if (state.winner) {
                audioService.playLoss();
              }
            } else if (prev && prev.board && state.board) {
              const prevMoves = prev.board.filter(Boolean).length;
              const nextMoves = state.board.filter(Boolean).length;
              if (nextMoves > prevMoves && state.current_turn === mySymbol) {
                const opponentSymbol = mySymbol === 'X' ? 'O' : 'X';
                audioService.playMove(opponentSymbol);
              }
            }
            return state;
          });
        },
        onError: (err) => {
          setErrorMessage(err);
          setStatus('ERROR');
          audioService.playDisconnected();
        },
        onOpponentDisconnected: (msg) => {
          setErrorMessage(msg);
          audioService.playDisconnected();
        },
        onConnectionChange: (connected) => {
          if (!connected) {
            setStatus('DISCONNECTED');
            audioService.playDisconnected();
          }
        },
      });
    } catch (err) {
      setStatus('ERROR');
      audioService.playDisconnected();
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Failed to join room. Verify the code and ensure server is active.'
      );
    }
  };

  const handleCellClick = (idx: number) => {
    if (!activeRoomState) return;
    if (activeRoomState.status !== 'PLAYING') return;
    if (activeRoomState.current_turn !== mySymbol) {
      audioService.playInvalid();
      return;
    }
    if (activeRoomState.board[idx] !== null) {
      audioService.playInvalid();
      return;
    }

    multiplayerService.sendMove(idx);
    audioService.playMove(mySymbol);
  };

  const handleRematch = () => {
    multiplayerService.sendRematch();
    audioService.playRestart();
  };

  const handleLeaveMatch = () => {
    multiplayerService.disconnect();
    setActiveRoomState(null);
    setStatus('LOCAL_ONLY');
    setMyPlayerId(null);
    audioService.playClick();
  };

  const handleCopyCode = () => {
    if (!activeRoomState) return;
    navigator.clipboard?.writeText(activeRoomState.room_code);
    setCopiedCode(true);
    audioService.playClick();
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-2xl mx-auto w-full">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-[#29384D] pb-3 sm:pb-4 gap-2 flex-wrap">
        <button
          onClick={() => {
            audioService.playClick();
            handleLeaveMatch();
            onReturnToLobby();
          }}
          className="text-xs sm:text-sm font-sans font-medium text-[#9BAAC0] hover:text-[#35E7FF] flex items-center gap-1.5 transition-colors shrink-0 py-1.5 px-2.5 rounded-lg border border-[#29384D] bg-[#141D2B] hover:border-[#35E7FF]/40 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#35E7FF]"
        >
          <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>Lobby</span>
        </button>
        <div className="flex items-center gap-2 text-xs font-mono">
          {serverOnline ? (
            <span className="flex items-center gap-1.5 text-[#4FE3A4]">
              <Wifi className="w-3.5 h-3.5" />
              <span>FastAPI Server Online</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-[#FFC857]">
              <WifiOff className="w-3.5 h-3.5" />
              <span>Server Standby / Offline</span>
            </span>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-3.5 rounded-lg bg-[#FF647C]/15 border border-[#FF647C]/40 flex items-start gap-2.5 text-xs font-sans text-[#FF647C]">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">Multiplayer Notice:</p>
            <p>{errorMessage}</p>
          </div>
        </div>
      )}

      {/* VIEW 1: LOBBY SETUP (No Active Room) */}
      {!activeRoomState && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Host Private Sector */}
            <div className="bg-[#0E1420] border border-[#29384D] rounded-xl p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono text-[#35E7FF]">
                <Radio className="w-4 h-4 animate-pulse" />
                <span>HOST PRIVATE SECTOR</span>
              </div>
              <h3 className="font-display text-xl font-bold uppercase tracking-wide text-[#F2F7FF]">
                Create Room
              </h3>
              <p className="font-sans text-sm text-[#9BAAC0] leading-relaxed">
                Generate an encrypted sector code and duel a friend across any mobile or desktop browser.
              </p>

              {/* Board Size Picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-sans text-[#9BAAC0]">Board Dimension:</label>
                <div className="grid grid-cols-3 gap-2">
                  {([3, 4, 5] as BoardSize[]).map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      className={`py-2 rounded-lg text-xs font-mono border transition-colors ${
                        selectedSize === sz
                          ? 'bg-[#1B2638] border-[#35E7FF] text-[#35E7FF] font-bold'
                          : 'bg-[#141D2B] border-[#29384D] text-[#9BAAC0]'
                      }`}
                    >
                      {sz}×{sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Creator Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-sans text-[#9BAAC0]">Your Pilot Name:</label>
                <input
                  type="text"
                  value={creatorName}
                  onChange={(e) => setCreatorName(e.target.value)}
                  className="w-full bg-[#080B12] border border-[#29384D] rounded-lg px-3.5 py-2.5 text-sm font-mono text-[#F2F7FF] focus:outline-none focus:border-[#35E7FF]"
                  maxLength={20}
                />
              </div>

              <button
                type="button"
                onClick={handleCreateRoom}
                disabled={status === 'CONNECTING'}
                className="w-full py-3.5 bg-[#35E7FF] text-[#080B12] font-sans font-semibold text-sm hover:bg-[#35E7FF]/90 active:scale-[0.99] disabled:opacity-50 transition-all rounded-lg min-h-[46px] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#35E7FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#080B12]"
              >
                {status === 'CONNECTING' ? 'Initializing...' : 'Launch Private Sector'}
              </button>
            </div>

            {/* Join Sector by Code */}
            <div className="bg-[#0E1420] border border-[#29384D] rounded-xl p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono text-[#FF3DAE]">
                <Shield className="w-4 h-4" />
                <span>JOIN SECTOR</span>
              </div>
              <h3 className="font-display text-xl font-bold uppercase tracking-wide text-[#F2F7FF]">
                Join Room
              </h3>
              <p className="font-sans text-sm text-[#9BAAC0] leading-relaxed">
                Enter the 6-character room sector code broadcasted by your rival combatant.
              </p>

              {/* Room Code Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-sans text-[#9BAAC0]">Room Sector Code:</label>
                <input
                  type="text"
                  placeholder="e.g. CYB-892"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  className="w-full bg-[#080B12] border border-[#29384D] rounded-lg px-3.5 py-2.5 text-sm font-mono uppercase tracking-widest text-[#35E7FF] focus:outline-none focus:border-[#FF3DAE] focus:ring-1 focus:ring-[#FF3DAE]"
                  maxLength={10}
                />
              </div>

              {/* Pilot Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-sans text-[#9BAAC0]">Your Pilot Name:</label>
                <input
                  type="text"
                  value={joinName}
                  onChange={(e) => setJoinName(e.target.value)}
                  className="w-full bg-[#080B12] border border-[#29384D] rounded-lg px-3.5 py-2.5 text-sm font-mono text-[#F2F7FF] focus:outline-none focus:border-[#FF3DAE] focus:ring-1 focus:ring-[#FF3DAE]"
                  maxLength={20}
                />
              </div>

              <button
                type="button"
                onClick={handleJoinRoom}
                disabled={status === 'CONNECTING'}
                className="w-full py-3.5 bg-[#141D2B] text-[#F2F7FF] border border-[#29384D] hover:border-[#FF3DAE] hover:bg-[#1B2638] active:scale-[0.99] disabled:opacity-50 font-sans font-semibold text-sm transition-all rounded-lg min-h-[46px] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF3DAE] focus-visible:ring-offset-2 focus-visible:ring-offset-[#080B12]"
              >
                {status === 'CONNECTING' ? 'Establishing Uplink...' : 'Establish Uplink'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: ACTIVE MULTIPLAYER MATCH */}
      {activeRoomState && (
        <div className="space-y-6">
          {/* Room Header & Room Code Display */}
          <div className="bg-[#0E1420] border border-[#29384D] rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-xs">
            <div className="flex items-center gap-3">
              <span className="text-[#9BAAC0]">Sector Code:</span>
              <span className="font-bold text-base text-[#35E7FF] tracking-widest">
                {activeRoomState.room_code}
              </span>
              <button
                onClick={handleCopyCode}
                className="p-1 rounded text-[#9BAAC0] hover:text-[#35E7FF] flex items-center gap-1"
                title="Copy Room Code"
              >
                {copiedCode ? <CheckCircle2 className="w-4 h-4 text-[#4FE3A4]" /> : <Copy className="w-4 h-4" />}
                <span className="text-[10px]">{copiedCode ? 'COPIED' : 'COPY'}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[#9BAAC0]">Your Mark:</span>
              <strong className={`px-2 py-0.5 rounded ${mySymbol === 'X' ? 'bg-[#35E7FF]/20 text-[#35E7FF]' : 'bg-[#FF3DAE]/20 text-[#FF3DAE]'}`}>
                {mySymbol}
              </strong>
            </div>
          </div>

          {/* Waiting for Opponent Status */}
          {activeRoomState.status === 'WAITING' && (
            <div className="p-6 rounded-xl bg-[#141D2B] border border-[#29384D] text-center space-y-3 font-mono">
              <div className="w-3 h-3 rounded-full bg-[#FFC857] animate-ping mx-auto" />
              <h4 className="text-base font-bold text-[#F2F7FF]">Awaiting Rival Combatant...</h4>
              <p className="text-xs text-[#9BAAC0] max-w-sm mx-auto">
                Share room code <strong className="text-[#35E7FF]">{activeRoomState.room_code}</strong> with your friend to begin the duel.
              </p>
            </div>
          )}

          {/* Active Combatant HUD */}
          {activeRoomState.status !== 'WAITING' && (
            <div className="grid grid-cols-3 items-center bg-[#0E1420] border border-[#29384D] rounded-xl p-3 sm:p-4 text-xs">
              {/* Player X */}
              <div className="space-y-0.5">
                <span className="text-[#35E7FF] font-sans font-semibold text-sm block truncate">
                  {activeRoomState.players.X.name} (X)
                </span>
                <span className="text-xs font-mono text-[#9BAAC0]">
                  Score: {activeRoomState.players.X.score}
                </span>
              </div>

              {/* Turn Status */}
              <div className="text-center">
                <span
                  className={`px-2.5 py-1 rounded-md text-xs font-sans font-medium ${
                    activeRoomState.current_turn === mySymbol
                      ? 'bg-[#35E7FF]/20 text-[#35E7FF] border border-[#35E7FF]/40'
                      : 'bg-[#FF3DAE]/20 text-[#FF3DAE] border border-[#FF3DAE]/40'
                  }`}
                >
                  {activeRoomState.status !== 'PLAYING'
                    ? 'Match Over'
                    : activeRoomState.current_turn === mySymbol
                    ? 'Your Turn'
                    : "Opponent's Turn"}
                </span>
              </div>

              {/* Player O */}
              <div className="space-y-0.5 text-right">
                <span className="text-[#FF3DAE] font-sans font-semibold text-sm block truncate">
                  {activeRoomState.players.O ? `${activeRoomState.players.O.name} (O)` : 'Waiting...'}
                </span>
                <span className="text-xs font-mono text-[#9BAAC0]">
                  Score: {activeRoomState.players.O?.score || 0}
                </span>
              </div>
            </div>
          )}

          {/* Online Game Board */}
          <div
            className="relative mx-auto w-full aspect-square bg-[#0E1420] border border-[#29384D] rounded-2xl p-2.5 sm:p-4 md:p-5 shadow-2xl"
            style={{ maxWidth: activeRoomState.board_size === 3 ? '380px' : activeRoomState.board_size === 4 ? '410px' : '440px' }}
          >
            <div
              className={`grid h-full w-full ${activeRoomState.board_size === 5 ? 'gap-1.5 sm:gap-2.5' : 'gap-2 sm:gap-3'}`}
              style={{ gridTemplateColumns: `repeat(${activeRoomState.board_size}, minmax(0, 1fr))` }}
            >
              {activeRoomState.board.map((val, idx) => {
                const isWinCell = activeRoomState.winning_line?.includes(idx);
                const isMyTurn = activeRoomState.current_turn === mySymbol && activeRoomState.status === 'PLAYING';
                return (
                  <button
                    key={idx}
                    onClick={() => handleCellClick(idx)}
                    disabled={!isMyTurn || val !== null}
                    className={`relative flex items-center justify-center rounded-lg sm:rounded-xl border transition-colors aspect-square select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#35E7FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#080B12] ${
                      isWinCell
                        ? val === 'X'
                          ? 'bg-[#141D2B] border-[#35E7FF] text-[#35E7FF]'
                          : 'bg-[#141D2B] border-[#FF3DAE] text-[#FF3DAE]'
                        : val === 'X'
                        ? 'bg-[#141D2B] border-[#35E7FF]/50 text-[#35E7FF]'
                        : val === 'O'
                        ? 'bg-[#141D2B] border-[#FF3DAE]/50 text-[#FF3DAE]'
                        : isMyTurn
                        ? 'bg-[#080B12] border-[#29384D] hover:border-[#35E7FF]/60 hover:bg-[#141D2B] active:scale-95 cursor-pointer'
                        : 'bg-[#080B12] border-[#29384D] opacity-80 cursor-default'
                    }`}
                    aria-label={`Online cell ${idx + 1}, ${val ? 'marked by ' + val : 'unoccupied'}`}
                  >
                    {val === 'X' && (
                      <svg
                        className={
                          activeRoomState.board_size === 3
                            ? 'w-10 h-10 sm:w-14 sm:h-14'
                            : activeRoomState.board_size === 4
                            ? 'w-7 h-7 sm:w-10 sm:h-10'
                            : 'w-6 h-6 sm:w-8 sm:h-8'
                        }
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#35E7FF"
                        strokeWidth="2.75"
                        strokeLinecap="round"
                      >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    )}
                    {val === 'O' && (
                      <svg
                        className={
                          activeRoomState.board_size === 3
                            ? 'w-10 h-10 sm:w-14 sm:h-14'
                            : activeRoomState.board_size === 4
                            ? 'w-7 h-7 sm:w-10 sm:h-10'
                            : 'w-6 h-6 sm:w-8 sm:h-8'
                        }
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#FF3DAE"
                        strokeWidth="2.75"
                        strokeLinecap="round"
                      >
                        <circle cx="12" cy="12" r="7" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Match Actions */}
          <div className="flex items-center justify-between gap-3 text-xs">
            {activeRoomState.status !== 'PLAYING' && activeRoomState.status !== 'WAITING' && (
              <button
                onClick={handleRematch}
                disabled={activeRoomState.rematch_requested_by?.includes(myPlayerId || '')}
                className={`px-4 py-2.5 font-sans font-semibold text-xs rounded-lg flex items-center gap-1.5 transition-all min-h-[40px] ${
                  activeRoomState.rematch_requested_by?.includes(myPlayerId || '')
                    ? 'bg-[#1B2638] text-[#9BAAC0] border border-[#29384D] cursor-not-allowed opacity-80'
                    : 'bg-[#35E7FF] text-[#080B12] hover:bg-[#68eeff] cursor-pointer'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>
                  {activeRoomState.rematch_requested_by?.includes(myPlayerId || '')
                    ? 'Awaiting Rival...'
                    : 'Request Rematch'}
                </span>
              </button>
            )}
            <button
              onClick={handleLeaveMatch}
              className="ml-auto px-4 py-2.5 rounded-lg bg-[#141D2B] border border-[#29384D] text-[#FF647C] font-sans font-medium text-xs hover:bg-[#1B2638] transition-colors min-h-[40px] cursor-pointer"
            >
              Leave Room
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
