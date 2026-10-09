import React from 'react';
import { AlertTriangle, Home, Swords, RefreshCw, Compass } from 'lucide-react';

interface NotFoundProps {
  onReturnToLobby: () => void;
  onQuickPlay: () => void;
}

export const NotFoundScreen: React.FC<NotFoundProps> = ({ onReturnToLobby, onQuickPlay }) => {
  return (
    <div className="w-full max-w-3xl mx-auto py-8 sm:py-12 px-3 sm:px-6">
      <div className="bg-[#0E1420] border border-[#29384D] rounded-2xl p-5 sm:p-10 relative overflow-hidden shadow-2xl">
        {/* Subtle Background Circuit Glow */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#FF3DAE]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#35E7FF]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Status Badge */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#FF647C]/15 border border-[#FF647C]/40 text-[#FF647C] font-mono text-xs font-semibold tracking-wider uppercase">
            <AlertTriangle className="w-3.5 h-3.5" />
            Sector Unreachable · Error 404
          </span>
          <span className="font-mono text-xs text-[#9BAAC0]">
            GRID_COORD_NULL
          </span>
        </div>

        {/* Main Header */}
        <div className="space-y-3 mb-6">
          <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-extrabold uppercase tracking-wide text-[#F2F7FF]">
            Tactical Void <span className="text-[#FF647C]">Detected</span>
          </h1>
          <p className="font-sans text-sm sm:text-base text-[#9BAAC0] max-w-xl leading-relaxed">
            The requested arena coordinates do not correspond to any active matrix, challenge puzzle, or combat sector in the XO Games system.
          </p>
        </div>

        {/* Diagnostics Card */}
        <div className="bg-[#141D2B] border border-[#29384D] rounded-xl p-3.5 sm:p-5 mb-8 font-mono text-xs text-[#9BAAC0] space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-[#29384D]/50 text-[#F2F7FF]">
            <span className="font-semibold uppercase tracking-wider text-[#35E7FF]">Sector Diagnostics</span>
            <span className="text-[11px] text-[#9BAAC0]">SYS_CHECK // 0x404</span>
          </div>
          <div className="flex justify-between">
            <span>Requested Path:</span>
            <span className="text-[#F2F7FF] font-semibold">{typeof window !== 'undefined' ? window.location.pathname : '/unknown'}</span>
          </div>
          <div className="flex justify-between">
            <span>Matrix Status:</span>
            <span className="text-[#4FE3A4]">Arena Engines Operational</span>
          </div>
          <div className="flex justify-between">
            <span>Remedy Protocol:</span>
            <span className="text-[#FFC857]">Re-route to Combat Lobby or Quick Launch</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            onClick={onReturnToLobby}
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#35E7FF] text-[#080B12] font-sans font-bold text-sm uppercase tracking-wider rounded-xl shadow-lg shadow-[#35E7FF]/20 hover:bg-[#35E7FF]/90 transition-all cursor-pointer min-h-[48px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#35E7FF]"
          >
            <Home className="w-4 h-4" />
            <span>Return to Lobby</span>
          </button>

          <button
            onClick={onQuickPlay}
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#141D2B] border border-[#29384D] hover:border-[#FF3DAE]/60 text-[#F2F7FF] font-sans font-bold text-sm uppercase tracking-wider rounded-xl transition-all cursor-pointer min-h-[48px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#35E7FF]"
          >
            <Swords className="w-4 h-4 text-[#FF3DAE]" />
            <span>Quick Match (3×3 AI)</span>
          </button>
        </div>

        {/* Quick Nav Links */}
        <div className="mt-8 pt-6 border-t border-[#29384D] flex flex-wrap items-center justify-between gap-3 text-xs text-[#9BAAC0] font-sans">
          <span className="flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-[#35E7FF]" />
            Alternative destinations:
          </span>
          <div className="flex items-center gap-4">
            <button
              onClick={onReturnToLobby}
              className="hover:text-[#35E7FF] transition-colors underline underline-offset-4"
            >
              Arena Lobby
            </button>
            <span className="text-[#29384D]">·</span>
            <button
              onClick={onQuickPlay}
              className="hover:text-[#35E7FF] transition-colors underline underline-offset-4"
            >
              Classic 3×3
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
