import React from 'react';
import { Play, Crosshair, Swords, Zap, Trophy, Bot, Users, Globe, ChevronRight } from 'lucide-react';
import { BoardSize, GameMode, AIDifficulty, CellValue } from '../../types/game';
import { audioService } from '../../services/audio';
import { PlayerFeedbackSection } from '../../components/PlayerFeedbackSection';

interface LobbyScreenProps {
  onStartMatch: (size: BoardSize, mode: GameMode, difficulty: AIDifficulty) => void;
  onNavigateToPuzzles: () => void;
  onNavigateToMultiplayer: () => void;
  teaserBoard: CellValue[];
  onTeaserCellClick: (idx: number) => void;
  onTeaserReset: () => void;
  teaserTurn: 'X' | 'O';
}

export const LobbyScreen: React.FC<LobbyScreenProps> = ({
  onStartMatch,
  onNavigateToPuzzles,
  onNavigateToMultiplayer,
  teaserBoard,
  onTeaserCellClick,
  onTeaserReset,
  teaserTurn,
}) => {
  const [selectedDifficulty, setSelectedDifficulty] = React.useState<AIDifficulty>('focused');
  const [selectedOpponent, setSelectedOpponent] = React.useState<'ai' | 'local'>('ai');

  return (
    <div className="space-y-10 sm:space-y-14">
      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Copy & Instant Quick Match */}
        <div className="lg:col-span-7 space-y-5 sm:space-y-6">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-[#9BAAC0] bg-[#0E1420] border border-[#29384D] px-3 py-1 rounded max-w-full flex-wrap">
            <span className="w-2 h-2 rounded-full bg-[#35E7FF] shrink-0" />
            <span className="text-[#35E7FF] font-semibold">Competitive Cyber Arena</span>
            <span aria-hidden="true" className="text-[#29384D]">·</span>
            <span>Deterministic Engine</span>
          </div>

          <h1 className="font-display text-3xl sm:text-5xl lg:text-7xl font-extrabold uppercase tracking-wide leading-[1.05] text-[#F2F7FF]">
            Tactical Duels. <br />
            <span className="text-[#35E7FF]">
              Neural Strategy.
            </span>
          </h1>

          <p className="font-sans text-sm sm:text-base text-[#9BAAC0] max-w-xl leading-relaxed">
            Tic-Tac-Toe elevated into an esports cyber arena. Play classic 3×3 speed duels, 4×4 matrixes engineered to eliminate forced opening draws, and expansive 5×5 arenas.
          </p>

          {/* Quick Match Action Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                audioService.playClick();
                onStartMatch(3, selectedOpponent === 'ai' ? 'ai' : 'pass_and_play', selectedDifficulty);
              }}
              className="w-full sm:w-auto px-6 py-3.5 bg-[#35E7FF] text-[#080B12] font-sans font-semibold text-sm hover:bg-[#35E7FF]/90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 rounded-lg min-h-[46px] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#35E7FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#080B12]"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start 3×3 Battle</span>
            </button>
            <button
              type="button"
              onClick={() => {
                audioService.playClick();
                onStartMatch(4, selectedOpponent === 'ai' ? 'ai' : 'pass_and_play', selectedDifficulty);
              }}
              className="w-full sm:w-auto px-6 py-3.5 bg-[#141D2B] text-[#F2F7FF] border border-[#29384D] font-sans font-semibold text-sm hover:border-[#35E7FF]/60 hover:bg-[#1B2638] transition-all flex items-center justify-center gap-2 rounded-lg min-h-[46px] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#35E7FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#080B12]"
            >
              <Crosshair className="w-4 h-4 text-[#35E7FF]" />
              <span>Tactical 4×4 Matrix</span>
            </button>
          </div>

          {/* Opponent & AI Difficulty Configuration Bar */}
          <div className="pt-3 border-t border-[#29384D] space-y-3 max-w-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs flex-wrap">
              <div className="flex items-center gap-2 font-sans flex-wrap">
                <span className="text-[#9BAAC0]">Opponent:</span>
                <div className="flex bg-[#0E1420] p-0.5 rounded-lg border border-[#29384D]">
                  <button
                    onClick={() => {
                      audioService.playClick();
                      setSelectedOpponent('ai');
                    }}
                    className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 font-medium transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#35E7FF] ${
                      selectedOpponent === 'ai'
                        ? 'bg-[#1B2638] text-[#35E7FF] border border-[#35E7FF]/30'
                        : 'text-[#9BAAC0] hover:text-[#F2F7FF]'
                    }`}
                  >
                    <Bot className="w-3.5 h-3.5" />
                    <span>Neural AI</span>
                  </button>
                  <button
                    onClick={() => {
                      audioService.playClick();
                      setSelectedOpponent('local');
                    }}
                    className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 font-medium transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#35E7FF] ${
                      selectedOpponent === 'local'
                        ? 'bg-[#1B2638] text-[#35E7FF] border border-[#35E7FF]/30'
                        : 'text-[#9BAAC0] hover:text-[#F2F7FF]'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Pass & Play</span>
                  </button>
                </div>
              </div>

              {selectedOpponent === 'ai' && (
                <div className="flex items-center gap-2 font-sans flex-wrap">
                  <span className="text-[#9BAAC0]">AI Level:</span>
                  <div className="flex bg-[#0E1420] p-0.5 rounded-lg border border-[#29384D]">
                    {(['casual', 'focused', 'master'] as AIDifficulty[]).map((diff) => (
                      <button
                        key={diff}
                        onClick={() => {
                          audioService.playClick();
                          setSelectedDifficulty(diff);
                        }}
                        className={`px-2.5 py-1.5 rounded-md font-mono text-xs uppercase tracking-wide transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC857] ${
                          selectedDifficulty === diff
                            ? 'bg-[#1B2638] text-[#FFC857] font-semibold border border-[#FFC857]/30'
                            : 'text-[#9BAAC0] hover:text-[#F2F7FF]'
                        }`}
                      >
                        {diff}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Telemetry Strip */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-2 text-xs font-mono text-[#9BAAC0]">
              <div className="truncate">
                <span className="block text-[#9BAAC0] text-[10px] sm:text-[11px]">Engine</span>
                <strong className="text-[#35E7FF] font-semibold text-[11px] sm:text-xs">Minimax & Bounded</strong>
              </div>
              <div className="truncate">
                <span className="block text-[#9BAAC0] text-[10px] sm:text-[11px]">Disciplines</span>
                <strong className="text-[#F2F7FF] font-semibold text-[11px] sm:text-xs">3×3 · 4×4 · 5×5</strong>
              </div>
              <div className="truncate">
                <span className="block text-[#9BAAC0] text-[10px] sm:text-[11px]">Multiplayer</span>
                <strong className="text-[#4FE3A4] font-semibold text-[11px] sm:text-xs">Real-Time P2P</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Right: Live Interactive Teaser Board */}
        <div className="lg:col-span-5 flex justify-center w-full">
          <div className="w-full max-w-[min(100%,380px)] bg-[#0E1420] border border-[#29384D] rounded-2xl p-4 sm:p-6 shadow-xl relative">
            <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-[#29384D] mb-4">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2 h-2 rounded-full bg-[#35E7FF] shrink-0" />
                <span className="text-xs font-mono font-bold text-[#F2F7FF] truncate">Pilot (X)</span>
              </div>
              <span className="text-[11px] font-mono text-[#9BAAC0]">Turn: {teaserTurn}</span>
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs font-mono font-bold text-[#F2F7FF] truncate">Bot (O)</span>
                <span className="w-2 h-2 rounded-full bg-[#FF3DAE] shrink-0" />
              </div>
            </div>

            {/* Interactive 3x3 Grid */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 aspect-square bg-[#080B12] p-2.5 sm:p-3 rounded-xl border border-[#29384D] w-full">
              {teaserBoard.map((val, idx) => (
                <button
                  key={idx}
                  onClick={() => onTeaserCellClick(idx)}
                  className={`relative flex items-center justify-center rounded-lg border transition-colors aspect-square select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#35E7FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#080B12] ${
                    val === 'X'
                      ? 'bg-[#141D2B] border-[#35E7FF]/50 text-[#35E7FF]'
                      : val === 'O'
                      ? 'bg-[#141D2B] border-[#FF3DAE]/50 text-[#FF3DAE]'
                      : 'bg-[#0E1420] border-[#29384D] hover:border-[#35E7FF]/60 hover:bg-[#141D2B] text-transparent'
                  }`}
                  aria-label={`Teaser cell ${idx + 1}, ${val ? 'marked by ' + val : 'unoccupied'}`}
                >
                  {val === 'X' && (
                    <svg className="w-8 h-8 sm:w-11 sm:h-11 md:w-12 md:h-12" viewBox="0 0 24 24" fill="none" stroke="#35E7FF" strokeWidth="2.75" strokeLinecap="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  )}
                  {val === 'O' && (
                    <svg className="w-8 h-8 sm:w-11 sm:h-11 md:w-12 md:h-12" viewBox="0 0 24 24" fill="none" stroke="#FF3DAE" strokeWidth="2.75" strokeLinecap="round">
                      <circle cx="12" cy="12" r="7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-[#29384D] flex items-center justify-between text-xs font-mono text-[#9BAAC0]">
              <span className="text-[11px]">Click tile to test marks</span>
              <button
                onClick={onTeaserReset}
                className="hover:text-[#35E7FF] transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Arena Disciplines Showcase Cards */}
      <div className="pt-2 sm:pt-4 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-wide text-[#F2F7FF]">
              Arena Disciplines
            </h2>
            <p className="font-sans text-xs sm:text-sm text-[#9BAAC0]">Launch tactical duels across 3 grid scales and challenge modes</p>
          </div>
          <span className="text-[11px] font-mono text-[#35E7FF] bg-[#141D2B] px-2.5 py-1 rounded border border-[#29384D]">
            4 Combat Tiers
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Classic 3x3 */}
          <button
            type="button"
            onClick={() => {
              audioService.playClick();
              onStartMatch(3, selectedOpponent === 'ai' ? 'ai' : 'pass_and_play', selectedDifficulty);
            }}
            className="group cursor-pointer bg-[#0E1420] border border-[#29384D] rounded-xl p-5 hover:border-[#35E7FF]/60 hover:bg-[#141D2B] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#35E7FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#080B12] transition-all flex flex-col justify-between text-left w-full"
            aria-label="Start Classic 3×3 game"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#141D2B] border border-[#29384D] flex items-center justify-center text-[#35E7FF] group-hover:scale-105 transition-transform">
                <Swords className="w-5 h-5" />
              </div>
              <h3 className="font-display text-xl font-bold uppercase tracking-wide text-[#F2F7FF] group-hover:text-[#35E7FF] transition-colors">
                Classic 3×3
              </h3>
              <p className="font-sans text-sm text-[#9BAAC0] leading-relaxed">
                Pure tactical speed duel. 9-turn clashes against adaptive neural AI or local rivals.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-[#29384D] flex items-center justify-between text-xs font-mono text-[#9BAAC0] w-full">
              <span className="text-[#35E7FF]">3-in-a-row</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-[#35E7FF]" />
            </div>
          </button>

          {/* Card 2: Tactical 4x4 */}
          <button
            type="button"
            onClick={() => {
              audioService.playClick();
              onStartMatch(4, selectedOpponent === 'ai' ? 'ai' : 'pass_and_play', selectedDifficulty);
            }}
            className="group cursor-pointer bg-[#0E1420] border border-[#29384D] rounded-xl p-5 hover:border-[#35E7FF]/60 hover:bg-[#141D2B] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#35E7FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#080B12] transition-all flex flex-col justify-between text-left w-full"
            aria-label="Start Tactical 4×4 game"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#141D2B] border border-[#29384D] flex items-center justify-center text-[#35E7FF] group-hover:scale-105 transition-transform">
                <Crosshair className="w-5 h-5" />
              </div>
              <h3 className="font-display text-xl font-bold uppercase tracking-wide text-[#F2F7FF] group-hover:text-[#35E7FF] transition-colors">
                Tactical 4×4
              </h3>
              <p className="font-sans text-sm text-[#9BAAC0] leading-relaxed">
                16-cell expanded field requiring 4-in-a-row to eliminate forced draws with wider branching forks.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-[#29384D] flex items-center justify-between text-xs font-mono text-[#9BAAC0] w-full">
              <span className="text-[#35E7FF]">4-in-a-row</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-[#35E7FF]" />
            </div>
          </button>

          {/* Card 3: Arena 5x5 */}
          <button
            type="button"
            onClick={() => {
              audioService.playClick();
              onStartMatch(5, selectedOpponent === 'ai' ? 'ai' : 'pass_and_play', selectedDifficulty);
            }}
            className="group cursor-pointer bg-[#0E1420] border border-[#29384D] rounded-xl p-5 hover:border-[#FF3DAE]/60 hover:bg-[#141D2B] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF3DAE] focus-visible:ring-offset-2 focus-visible:ring-offset-[#080B12] transition-all flex flex-col justify-between text-left w-full"
            aria-label="Start Arena 5×5 game"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#141D2B] border border-[#29384D] flex items-center justify-center text-[#FF3DAE] group-hover:scale-105 transition-transform">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-display text-xl font-bold uppercase tracking-wide text-[#F2F7FF] group-hover:text-[#FF3DAE] transition-colors">
                Arena 5×5
              </h3>
              <p className="font-sans text-sm text-[#9BAAC0] leading-relaxed">
                Grandmaster scale (Gomoku inspired). Deep positional opening theory, flank pins, and 4-mark corridors.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-[#29384D] flex items-center justify-between text-xs font-mono text-[#9BAAC0] w-full">
              <span className="text-[#FF3DAE]">4-in-a-row mandate</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-[#FF3DAE]" />
            </div>
          </button>

          {/* Card 4: Daily Puzzles */}
          <button
            type="button"
            onClick={() => {
              audioService.playClick();
              onNavigateToPuzzles();
            }}
            className="group cursor-pointer bg-[#0E1420] border border-[#29384D] rounded-xl p-5 hover:border-[#FFC857]/60 hover:bg-[#141D2B] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC857] focus-visible:ring-offset-2 focus-visible:ring-offset-[#080B12] transition-all flex flex-col justify-between text-left w-full"
            aria-label="Navigate to Tactical Puzzles"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#141D2B] border border-[#29384D] flex items-center justify-center text-[#FFC857] group-hover:scale-105 transition-transform">
                <Trophy className="w-5 h-5" />
              </div>
              <h3 className="font-display text-xl font-bold uppercase tracking-wide text-[#F2F7FF] group-hover:text-[#FFC857] transition-colors">
                Tactical Puzzles
              </h3>
              <p className="font-sans text-sm text-[#9BAAC0] leading-relaxed">
                Curated tactical scenarios. Find the forced win in 1 move, counter lethal traps, and master diagonal fork pins.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-[#29384D] flex items-center justify-between text-xs font-mono text-[#9BAAC0] w-full">
              <span className="text-[#FFC857]">6 Protocols</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-[#FFC857]" />
            </div>
          </button>
        </div>
      </div>

      {/* Testimonials / Player Feedback Section */}
      <PlayerFeedbackSection
        onQuickMatch={() => onStartMatch(3, selectedOpponent === 'ai' ? 'ai' : 'pass_and_play', selectedDifficulty)}
      />
    </div>
  );
};
