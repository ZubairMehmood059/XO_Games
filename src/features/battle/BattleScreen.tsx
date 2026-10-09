import React, { useState, useEffect, useCallback } from 'react';
import { RotateCcw, Undo2, ArrowLeft, Bot, Users } from 'lucide-react';
import { BoardSize, CellValue, GameMode, AIDifficulty, PlayerMark, MatchScore } from '../../types/game';
import { createEmptyBoard, checkWinner, isValidMove, makeMove } from '../../engine/rules';
import { getAIMove } from '../../engine/ai';
import { audioService } from '../../services/audio';
import { storageService } from '../../services/storage';

interface BattleScreenProps {
  boardSize: BoardSize;
  mode: GameMode;
  difficulty: AIDifficulty;
  onReturnToLobby: () => void;
  onMatchFinished: (winner: PlayerMark | 'DRAW', board: CellValue[], winningLine: number[] | null, turns: number) => void;
  onBoardSizeChange: (size: BoardSize) => void;
}

export const BattleScreen: React.FC<BattleScreenProps> = ({
  boardSize,
  mode,
  difficulty,
  onReturnToLobby,
  onMatchFinished,
  onBoardSizeChange,
}) => {
  const [board, setBoard] = useState<CellValue[]>(() => createEmptyBoard(boardSize));
  const [currentTurn, setCurrentTurn] = useState<PlayerMark>('X');
  const [status, setStatus] = useState<'PLAYING' | 'WON' | 'DRAW'>('PLAYING');
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const [moveHistory, setMoveHistory] = useState<number[]>([]);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [hoveredCell, setHoveredCell] = useState<number | null>(null);
  const [score, setScore] = useState<MatchScore>({ playerX: 0, playerO: 0, draws: 0 });

  // Reset board when boardSize changes
  useEffect(() => {
    setBoard(createEmptyBoard(boardSize));
    setCurrentTurn('X');
    setStatus('PLAYING');
    setWinningLine(null);
    setMoveHistory([]);
    setIsAIThinking(false);
  }, [boardSize]);

  // AI Turn Handling
  useEffect(() => {
    if (mode === 'ai' && currentTurn === 'O' && status === 'PLAYING' && !isAIThinking) {
      setIsAIThinking(true);
      const timer = setTimeout(() => {
        const aiMoveIndex = getAIMove(board, boardSize, 'O', difficulty);
        if (aiMoveIndex >= 0 && isValidMove(board, aiMoveIndex, 'PLAYING')) {
          executeMove(aiMoveIndex, 'O');
        }
        setIsAIThinking(false);
      }, 350);

      return () => clearTimeout(timer);
    }
  }, [currentTurn, status, mode, board, boardSize, difficulty]);

  const executeMove = useCallback(
    (index: number, player: PlayerMark) => {
      const nextBoard = makeMove(board, index, player);
      audioService.playMove(player);

      const nextHistory = [...moveHistory, index];
      setMoveHistory(nextHistory);
      setBoard(nextBoard);

      const winResult = checkWinner(nextBoard, boardSize);

      if (winResult.winner) {
        const winnerMark: PlayerMark = winResult.winner;
        setStatus('WON');
        setWinningLine(winResult.winningLine);
        if (mode === 'ai' && winnerMark === 'O') {
          audioService.playLoss();
        } else {
          audioService.playWin();
        }
        setScore((prev) => ({
          ...prev,
          playerX: winnerMark === 'X' ? prev.playerX + 1 : prev.playerX,
          playerO: winnerMark === 'O' ? prev.playerO + 1 : prev.playerO,
        }));
        storageService.recordMatch({
          boardSize,
          mode,
          difficulty: mode === 'ai' ? difficulty : undefined,
          winner: winnerMark,
          turns: nextHistory.length,
          playerMark: 'X',
        });
        setTimeout(() => {
          onMatchFinished(winnerMark, nextBoard, winResult.winningLine, nextHistory.length);
        }, 600);
      } else if (winResult.isDraw) {
        setStatus('DRAW');
        setWinningLine(null);
        audioService.playDraw();
        setScore((prev) => ({ ...prev, draws: prev.draws + 1 }));
        storageService.recordMatch({
          boardSize,
          mode,
          difficulty: mode === 'ai' ? difficulty : undefined,
          winner: 'DRAW',
          turns: nextHistory.length,
          playerMark: 'X',
        });
        setTimeout(() => {
          onMatchFinished('DRAW', nextBoard, null, nextHistory.length);
        }, 600);
      } else {
        setCurrentTurn(player === 'X' ? 'O' : 'X');
      }
    },
    [board, boardSize, moveHistory, mode, difficulty, onMatchFinished]
  );

  const handleCellClick = (index: number) => {
    if (isAIThinking) return;
    if (!isValidMove(board, index, status)) {
      audioService.playInvalid();
      return;
    }

    if (mode === 'ai' && currentTurn !== 'X') return;

    executeMove(index, currentTurn);
  };

  const handleRestart = () => {
    audioService.playRestart();
    setBoard(createEmptyBoard(boardSize));
    setCurrentTurn('X');
    setStatus('PLAYING');
    setWinningLine(null);
    setMoveHistory([]);
    setIsAIThinking(false);
  };

  const handleUndo = () => {
    if (mode !== 'ai' || isAIThinking || moveHistory.length === 0 || status !== 'PLAYING') return;
    audioService.playClick();

    // If it's Player X's turn, undo both the AI's last move and Player X's previous move
    const stepsToUndo = moveHistory.length >= 2 ? 2 : 1;
    const newHistory = moveHistory.slice(0, -stepsToUndo);
    const newBoard = createEmptyBoard(boardSize);
    for (let i = 0; i < newHistory.length; i++) {
      const mark = i % 2 === 0 ? 'X' : 'O';
      newBoard[newHistory[i]] = mark;
    }

    setBoard(newBoard);
    setMoveHistory(newHistory);
    setCurrentTurn('X');
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-xl mx-auto w-full">
      {/* Top Navigation & Status Header */}
      <div className="flex items-center justify-between border-b border-[#29384D] pb-3 sm:pb-4 gap-2 flex-wrap">
        <button
          onClick={() => {
            audioService.playClick();
            onReturnToLobby();
          }}
          className="text-xs sm:text-sm font-sans font-medium text-[#9BAAC0] hover:text-[#35E7FF] flex items-center gap-1.5 transition-colors shrink-0 py-1.5 px-2.5 rounded-lg border border-[#29384D] bg-[#141D2B] hover:border-[#35E7FF]/40 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#35E7FF]"
        >
          <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>Lobby</span>
        </button>

        {/* Board Size Quick Selector */}
        <div className="flex items-center gap-1 bg-[#0E1420] p-1 rounded-lg border border-[#29384D]">
          {([3, 4, 5] as BoardSize[]).map((sz) => (
            <button
              key={sz}
              onClick={() => {
                if (boardSize !== sz) {
                  audioService.playClick();
                  onBoardSizeChange(sz);
                }
              }}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-mono rounded-md transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#35E7FF] ${
                boardSize === sz
                  ? 'bg-[#1B2638] text-[#35E7FF] font-semibold border border-[#35E7FF]/30'
                  : 'text-[#9BAAC0] hover:text-[#F2F7FF]'
              }`}
            >
              {sz}×{sz}
            </button>
          ))}
        </div>

        {/* Restart Action */}
        <div className="flex items-center gap-2 shrink-0">
          {mode === 'ai' && (
            <button
              onClick={handleUndo}
              disabled={moveHistory.length === 0 || status !== 'PLAYING' || isAIThinking}
              className="min-h-[36px] min-w-[36px] flex items-center justify-center p-2 rounded-lg bg-[#141D2B] border border-[#29384D] text-[#9BAAC0] hover:text-[#35E7FF] disabled:opacity-40 disabled:hover:text-[#9BAAC0] transition-colors cursor-pointer disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-[#35E7FF]"
              title="Undo last move"
              aria-label="Undo move"
            >
              <Undo2 className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={handleRestart}
            className="min-h-[36px] min-w-[36px] flex items-center justify-center p-2 rounded-lg bg-[#141D2B] border border-[#29384D] text-[#9BAAC0] hover:text-[#35E7FF] transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#35E7FF]"
            title="Restart board"
            aria-label="Restart match"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mode Clarification Banner for 5x5 */}
      {boardSize === 5 && (
        <div className="bg-[#141D2B] border border-[#29384D] rounded-lg px-3 py-2 text-center text-xs font-mono text-[#35E7FF]">
          Arena 5×5 Rule: Exactly 4 consecutive matching marks win
        </div>
      )}

      {/* Dual Combatant Scoreboard */}
      <div className="grid grid-cols-3 items-center bg-[#0E1420] border border-[#29384D] rounded-xl p-2.5 sm:p-4 relative overflow-hidden gap-1">
        {/* Active Player Turn Beam */}
        <div
          className={`absolute top-0 h-0.5 bg-[#35E7FF] transition-all duration-200 ${
            currentTurn === 'X' ? 'left-0 w-1/3' : 'left-2/3 w-1/3'
          }`}
        />

        {/* Player 1 (X) */}
        <div className="flex flex-col items-start space-y-0.5 sm:space-y-1 min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[#141D2B] text-[#35E7FF] border border-[#35E7FF]/40 flex items-center justify-center font-display font-bold text-xs sm:text-sm shrink-0">
              ✕
            </span>
            <div className="min-w-0">
              <span className="text-xs sm:text-sm font-sans font-semibold text-[#F2F7FF] block truncate">
                {mode === 'ai' ? 'Pilot (You)' : 'Player 1'}
              </span>
              <span className="text-[10px] sm:text-[11px] text-[#35E7FF] font-mono hidden sm:block">Mark X</span>
            </div>
          </div>
          <div className="text-[11px] sm:text-xs font-mono text-[#9BAAC0] tabular-nums pt-0.5 truncate">
            Wins: <strong className="text-[#35E7FF] text-xs sm:text-sm font-bold">{score.playerX}</strong>
          </div>
        </div>

        {/* Center Turn Indicator */}
        <div className="flex flex-col items-center justify-center text-center px-0.5 sm:px-1">
          <span
            className={`text-[11px] sm:text-xs font-sans font-medium px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md border whitespace-nowrap ${
              isAIThinking
                ? 'bg-[#141D2B] text-[#FFC857] border-[#FFC857]/40 animate-pulse'
                : currentTurn === 'X'
                ? 'bg-[#141D2B] text-[#35E7FF] border-[#35E7FF]/30'
                : 'bg-[#141D2B] text-[#FF3DAE] border-[#FF3DAE]/30'
            }`}
          >
            {isAIThinking
              ? 'AI Thinking...'
              : status !== 'PLAYING'
              ? 'Round Over'
              : mode === 'ai'
              ? currentTurn === 'X'
                ? 'Your Turn'
                : 'AI Turn'
              : `Player ${currentTurn}'s Turn`}
          </span>
          <span className="text-[10px] sm:text-xs font-mono text-[#9BAAC0] mt-0.5 sm:mt-1 tabular-nums whitespace-nowrap">
            Draws: {score.draws}
          </span>
        </div>

        {/* Player 2 / AI (O) */}
        <div className="flex flex-col items-end space-y-0.5 sm:space-y-1 min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <div className="text-right min-w-0">
              <span className="text-xs sm:text-sm font-sans font-semibold text-[#F2F7FF] block truncate">
                {mode === 'ai' ? `AI (${difficulty})` : 'Player 2'}
              </span>
              <span className="text-[10px] sm:text-[11px] text-[#FF3DAE] font-mono hidden sm:block">Mark O</span>
            </div>
            <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[#141D2B] text-[#FF3DAE] border border-[#FF3DAE]/40 flex items-center justify-center font-display font-bold text-xs sm:text-sm shrink-0">
              ○
            </span>
          </div>
          <div className="text-[11px] sm:text-xs font-mono text-[#9BAAC0] tabular-nums pt-0.5 truncate">
            Wins: <strong className="text-[#FF3DAE] text-xs sm:text-sm font-bold">{score.playerO}</strong>
          </div>
        </div>
      </div>

      {/* Central Focused Arena Game Board */}
      <div
        className="relative mx-auto w-full aspect-square bg-[#0E1420] border border-[#29384D] rounded-2xl p-2.5 sm:p-4 md:p-5 shadow-2xl"
        style={{ maxWidth: boardSize === 3 ? '380px' : boardSize === 4 ? '410px' : '440px' }}
      >
        <div
          className={`grid h-full w-full ${boardSize === 5 ? 'gap-1.5 sm:gap-2.5' : 'gap-2 sm:gap-3'}`}
          style={{ gridTemplateColumns: `repeat(${boardSize}, minmax(0, 1fr))` }}
        >
          {board.map((val, idx) => {
            const isWinCell = winningLine?.includes(idx);
            return (
              <button
                key={idx}
                onClick={() => handleCellClick(idx)}
                onMouseEnter={() => setHoveredCell(idx)}
                onMouseLeave={() => setHoveredCell(null)}
                disabled={isAIThinking || val !== null || status !== 'PLAYING'}
                className={`relative flex items-center justify-center rounded-lg sm:rounded-xl border transition-colors aspect-square select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#35E7FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#080B12] ${
                  isWinCell
                    ? val === 'X'
                      ? 'bg-[#141D2B] border-[#35E7FF] text-[#35E7FF]'
                      : 'bg-[#141D2B] border-[#FF3DAE] text-[#FF3DAE]'
                    : val === 'X'
                    ? 'bg-[#141D2B] border-[#35E7FF]/50 text-[#35E7FF]'
                    : val === 'O'
                    ? 'bg-[#141D2B] border-[#FF3DAE]/50 text-[#FF3DAE]'
                    : 'bg-[#080B12] border-[#29384D] hover:border-[#35E7FF]/50 hover:bg-[#141D2B] active:scale-95 cursor-pointer disabled:cursor-default'
                }`}
                aria-label={`Cell ${idx + 1}, ${val ? 'marked by ' + val : 'unoccupied'}`}
              >
                {val === 'X' && (
                  <svg
                    className={
                      boardSize === 3
                        ? 'w-10 h-10 sm:w-14 sm:h-14'
                        : boardSize === 4
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
                      boardSize === 3
                        ? 'w-10 h-10 sm:w-14 sm:h-14'
                        : boardSize === 4
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
                {!val && hoveredCell === idx && status === 'PLAYING' && !isAIThinking && (
                  <div className="w-2.5 h-2.5 rounded-full bg-[#35E7FF]/40" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Controls Strip */}
      <div className="flex items-center justify-between text-xs font-mono text-[#9BAAC0] pt-1">
        <div className="flex items-center gap-2">
          {mode === 'ai' ? <Bot className="w-3.5 h-3.5 text-[#35E7FF]" /> : <Users className="w-3.5 h-3.5 text-[#35E7FF]" />}
          <span>{mode === 'ai' ? `Neural AI (${difficulty})` : 'Pass & Play Duel'}</span>
        </div>
        <div className="text-[11px]">
          Moves: <strong className="text-[#F2F7FF]">{moveHistory.length}</strong>
        </div>
      </div>
    </div>
  );
};
