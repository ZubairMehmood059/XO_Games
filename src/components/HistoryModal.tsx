import React from 'react';
import { X, Trash2, Trophy, Swords } from 'lucide-react';
import { MatchRecord } from '../types/game';
import { storageService } from '../services/storage';
import { audioService } from '../services/audio';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: MatchRecord[];
  onHistoryUpdated: (updated: MatchRecord[]) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onHistoryUpdated,
}) => {
  if (!isOpen) return null;

  const handleClear = () => {
    storageService.clearHistory();
    onHistoryUpdated([]);
    audioService.playClick();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#080B12]/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#0E1420] border border-[#29384D] rounded-2xl p-4 sm:p-6 max-w-lg w-full my-auto shadow-2xl space-y-4 max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#29384D] pb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#35E7FF]" />
            <h3 className="font-display font-bold text-xl uppercase tracking-wide text-[#F2F7FF]">
              Match Records
            </h3>
          </div>
          <button
            onClick={() => {
              audioService.playClick();
              onClose();
            }}
            className="min-h-[40px] min-w-[40px] flex items-center justify-center p-1.5 rounded-lg text-[#9BAAC0] hover:text-[#F2F7FF] transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#35E7FF]"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {history.length === 0 ? (
            <div className="py-12 text-center text-xs font-mono text-[#9BAAC0] space-y-2">
              <Swords className="w-8 h-8 mx-auto text-[#29384D]" />
              <p>No recent duel records yet.</p>
              <p className="text-xs text-[#9BAAC0]">Play against AI or a friend to start tracking stats.</p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="bg-[#141D2B] border border-[#29384D] rounded-xl p-3 flex items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-[#1B2638] text-[#35E7FF] text-xs font-mono font-bold">
                      {item.boardSize}×{item.boardSize}
                    </span>
                    <span className="text-[#F2F7FF] font-sans font-semibold text-sm">
                      {item.mode === 'ai' ? `AI (${item.difficulty || 'Focused'})` : 'Local 2P'}
                    </span>
                  </div>
                  <div className="text-xs font-mono text-[#9BAAC0]">
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {item.turns} moves
                  </div>
                </div>

                <div className="text-right">
                  {item.winner === 'DRAW' ? (
                    <span className="px-2.5 py-1 rounded-md bg-[#1B2638] text-[#FFC857] text-xs font-mono font-bold border border-[#FFC857]/30">
                      DRAW
                    </span>
                  ) : item.winner === 'X' ? (
                    <span className="px-2.5 py-1 rounded-md bg-[#1B2638] text-[#35E7FF] text-xs font-mono font-bold border border-[#35E7FF]/30">
                      X WON
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-md bg-[#1B2638] text-[#FF3DAE] text-xs font-mono font-bold border border-[#FF3DAE]/30">
                      O WON
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer with Clear & Close */}
        <div className="pt-3 border-t border-[#29384D] flex items-center justify-between text-xs">
          {history.length > 0 && (
            <button
              onClick={handleClear}
              className="text-[#FF647C] hover:underline flex items-center gap-1.5 font-sans font-medium transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}
          <button
            onClick={() => {
              audioService.playClick();
              onClose();
            }}
            className="ml-auto px-5 py-2.5 rounded-lg bg-[#141D2B] border border-[#29384D] text-[#F2F7FF] font-sans font-medium text-sm hover:bg-[#1B2638] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
