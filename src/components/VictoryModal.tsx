import React from 'react';
import { Trophy, RotateCcw, Swords } from 'lucide-react';
import { BoardSize, CellValue, PlayerMark } from '../types/game';
import { audioService } from '../services/audio';

interface VictoryModalProps {
  winner: PlayerMark | null;
  isDraw: boolean;
  winningLine: number[] | null;
  board: CellValue[];
  boardSize: BoardSize;
  turns: number;
  onRematch: () => void;
  onReturnToLobby: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  winner,
  isDraw,
  winningLine,
  board,
  boardSize,
  turns,
  onRematch,
  onReturnToLobby,
}) => {
  const isWinnerX = winner === 'X';
  const isWinnerO = winner === 'O';

  return (
    <div className="fixed inset-0 z-50 bg-[#080B12]/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#0E1420] border border-[#29384D] rounded-2xl p-4 sm:p-8 max-w-md w-full my-auto shadow-2xl text-center space-y-4 sm:space-y-6 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Glow Accent */}
        <div
          className={`absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-20 blur-3xl pointer-events-none rounded-full ${
            isWinnerX ? 'bg-[#35E7FF]/20' : isWinnerO ? 'bg-[#FF3DAE]/20' : 'bg-[#FFC857]/15'
          }`}
        />

        {/* Icon */}
        <div
          className={`inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#141D2B] border mx-auto ${
            isWinnerX
              ? 'border-[#35E7FF]/50 text-[#35E7FF]'
              : isWinnerO
              ? 'border-[#FF3DAE]/50 text-[#FF3DAE]'
              : 'border-[#FFC857]/50 text-[#FFC857]'
          }`}
        >
          {isDraw ? <Swords className="w-6 h-6 sm:w-7 sm:h-7" /> : <Trophy className="w-6 h-6 sm:w-7 sm:h-7" />}
        </div>

        {/* Header Text */}
        <div className="space-y-1 sm:space-y-1.5">
          <span className="text-[11px] sm:text-xs font-mono uppercase tracking-wider text-[#9BAAC0]">
            Match Outcome Complete
          </span>
          <h2 className="font-display text-2xl sm:text-4xl font-extrabold uppercase tracking-wide text-[#F2F7FF]">
            {isDraw ? 'Tactical Draw' : `Player ${winner} Victorious`}
          </h2>
          <p className="font-sans text-xs sm:text-sm text-[#9BAAC0]">
            {isDraw
              ? 'All combatant moves exhausted without an unbroken vector.'
              : `Decisive victory achieved in ${turns} moves on ${boardSize}×${boardSize} arena.`}
          </p>
        </div>

        {/* Mini Snapshot of Board */}
        <div
          className="bg-[#080B12] border border-[#29384D] rounded-xl p-2.5 sm:p-3 mx-auto"
          style={{ maxWidth: boardSize === 3 ? '160px' : boardSize === 4 ? '200px' : '230px' }}
        >
          <div
            className="grid gap-1 sm:gap-1.5 aspect-square"
            style={{ gridTemplateColumns: `repeat(${boardSize}, minmax(0, 1fr))` }}
          >
            {board.map((cell, idx) => {
              const isWinCell = winningLine?.includes(idx);
              return (
                <div
                  key={idx}
                  className={`flex items-center justify-center rounded text-xs font-display font-bold aspect-square ${
                    isWinCell
                      ? cell === 'X'
                        ? 'bg-[#141D2B] text-[#35E7FF] border border-[#35E7FF]'
                        : 'bg-[#141D2B] text-[#FF3DAE] border border-[#FF3DAE]'
                      : 'bg-[#0E1420] text-[#9BAAC0]/40 border border-[#29384D]'
                  }`}
                >
                  {cell}
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 sm:space-y-2.5 pt-1 sm:pt-2">
          <button
            onClick={() => {
              audioService.playRestart();
              onRematch();
            }}
            className="w-full py-3 sm:py-3.5 bg-[#35E7FF] text-[#080B12] font-sans font-semibold text-sm hover:bg-[#68eeff] active:scale-[0.99] transition-all flex items-center justify-center gap-2 rounded-lg min-h-[44px] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#35E7FF]"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Engage Rematch</span>
          </button>
          <button
            onClick={() => {
              audioService.playClick();
              onReturnToLobby();
            }}
            className="w-full py-2.5 sm:py-3 bg-[#141D2B] text-[#F2F7FF] border border-[#29384D] font-sans font-medium text-sm hover:bg-[#1B2638] transition-all min-h-[42px] rounded-lg cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#35E7FF]"
          >
            Return to Arena Lobby
          </button>
        </div>
      </div>
    </div>
  );
};
