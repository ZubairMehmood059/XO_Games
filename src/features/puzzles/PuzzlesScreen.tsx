import React, { useState, useEffect } from 'react';
import { ArrowLeft, Trophy, HelpCircle, CheckCircle2, RotateCcw, Shuffle, Shield, Award } from 'lucide-react';
import { PuzzleScenario, PuzzleDifficulty } from '../../types/game';
import {
  PUZZLE_SCENARIOS,
  validatePuzzleMove,
  getNextPuzzleVariant,
  getPuzzlesByDifficulty,
} from '../../engine/puzzles';
import { audioService } from '../../services/audio';
import { storageService } from '../../services/storage';

interface PuzzlesScreenProps {
  onReturnToLobby: () => void;
}

const DIFFICULTY_LABELS: Record<PuzzleDifficulty, { label: string; color: string; border: string }> = {
  recruit: { label: 'Recruit', color: 'text-[#35E7FF]', border: 'border-[#35E7FF]/40' },
  tactician: { label: 'Tactician', color: 'text-[#4FE3A4]', border: 'border-[#4FE3A4]/40' },
  operative: { label: 'Operative', color: 'text-[#FFC857]', border: 'border-[#FFC857]/40' },
  apex: { label: 'Apex', color: 'text-[#FF3DAE]', border: 'border-[#FF3DAE]/40' },
};

export const PuzzlesScreen: React.FC<PuzzlesScreenProps> = ({ onReturnToLobby }) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<PuzzleDifficulty>('recruit');
  const [selectedPuzzleIndex, setSelectedPuzzleIndex] = useState(0);
  const [currentBoard, setCurrentBoard] = useState(PUZZLE_SCENARIOS[0].initialBoard);
  const [showHint, setShowHint] = useState(false);
  const [isSolved, setIsSolved] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [solvedPuzzles, setSolvedPuzzles] = useState<Record<string, boolean>>(() =>
    storageService.getPuzzleProgress()
  );
  const [historyIds, setHistoryIds] = useState<string[]>(() =>
    storageService.getPuzzleHistory()
  );

  const currentPool = getPuzzlesByDifficulty(selectedDifficulty);
  const puzzle = currentPool[selectedPuzzleIndex] || currentPool[0] || PUZZLE_SCENARIOS[0];

  // Sync board on puzzle switch
  useEffect(() => {
    setCurrentBoard(puzzle.initialBoard);
    setIsSolved(false);
    setShowHint(false);
    setErrorMessage(null);
    storageService.recordPuzzlePlayed(puzzle.id);
  }, [puzzle.id]);

  const handleSelectDifficulty = (diff: PuzzleDifficulty) => {
    audioService.playClick();
    setSelectedDifficulty(diff);
    setSelectedPuzzleIndex(0);
  };

  const handleSelectPuzzle = (idx: number) => {
    audioService.playClick();
    setSelectedPuzzleIndex(idx);
    setShowHint(false);
    setIsSolved(false);
    setErrorMessage(null);
  };

  const handleCellClick = (cellIndex: number) => {
    if (isSolved || currentBoard[cellIndex] !== null) return;

    if (validatePuzzleMove(puzzle, cellIndex)) {
      audioService.playPuzzleSuccess();
      const next = [...currentBoard];
      next[cellIndex] = puzzle.playerMark;
      setCurrentBoard(next);
      setIsSolved(true);
      setErrorMessage(null);

      const updatedSolved = storageService.markPuzzleSolved(puzzle.id);
      setSolvedPuzzles(updatedSolved);
    } else {
      audioService.playPuzzleFail();
      setErrorMessage('Tactical error. That cell does not accomplish the objective.');
      setTimeout(() => setErrorMessage(null), 3000);
    }
  };

  const handleResetPuzzle = () => {
    audioService.playRestart();
    setCurrentBoard(puzzle.initialBoard);
    setIsSolved(false);
    setErrorMessage(null);
    setShowHint(false);
  };

  const handleNextPuzzle = () => {
    audioService.playClick();
    if (selectedPuzzleIndex < currentPool.length - 1) {
      setSelectedPuzzleIndex(selectedPuzzleIndex + 1);
    } else {
      // Advance to next difficulty tier if available
      const tiers: PuzzleDifficulty[] = ['recruit', 'tactician', 'operative', 'apex'];
      const currentTierIndex = tiers.indexOf(selectedDifficulty);
      if (currentTierIndex < tiers.length - 1) {
        setSelectedDifficulty(tiers[currentTierIndex + 1]);
        setSelectedPuzzleIndex(0);
      } else {
        // Loop back to start
        setSelectedDifficulty('recruit');
        setSelectedPuzzleIndex(0);
      }
    }
  };

  const handlePlayVariant = () => {
    audioService.playClick();
    const variant = getNextPuzzleVariant(puzzle.id, historyIds);
    const updatedHistory = storageService.recordPuzzlePlayed(variant.id);
    setHistoryIds(updatedHistory);

    // If variant is in current tier
    const variantIndex = currentPool.findIndex((p) => p.id === variant.id);
    if (variantIndex !== -1) {
      setSelectedPuzzleIndex(variantIndex);
    } else {
      setSelectedDifficulty(variant.difficulty);
      const nextPool = getPuzzlesByDifficulty(variant.difficulty);
      const idx = nextPool.findIndex((p) => p.id === variant.id);
      setSelectedPuzzleIndex(idx !== -1 ? idx : 0);
    }
  };

  const totalSolvedCount = Object.keys(solvedPuzzles).filter((id) =>
    PUZZLE_SCENARIOS.some((p) => p.id === id)
  ).length;

  return (
    <div className="space-y-6 sm:space-y-8 max-w-4xl mx-auto w-full">
      {/* Top Bar Navigation */}
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

        <div className="flex items-center gap-2">
          <div className="text-xs font-mono uppercase tracking-wider text-[#4FE3A4] bg-[#141D2B] px-3 py-1.5 rounded-lg border border-[#29384D] flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5" />
            <span>Mastered: {totalSolvedCount} / {PUZZLE_SCENARIOS.length}</span>
          </div>
          <div className="text-xs font-mono uppercase tracking-wider text-[#FFC857] bg-[#141D2B] px-3 py-1.5 rounded-lg border border-[#29384D] hidden sm:block">
            Level {puzzle.level} of {PUZZLE_SCENARIOS.length}
          </div>
        </div>
      </div>

      {/* Difficulty Tier Navigation Strip */}
      <div className="flex items-center gap-2 bg-[#0E1420] p-1 rounded-xl border border-[#29384D] overflow-x-auto">
        {(['recruit', 'tactician', 'operative', 'apex'] as PuzzleDifficulty[]).map((diff) => {
          const cfg = DIFFICULTY_LABELS[diff];
          const isSelected = selectedDifficulty === diff;
          const tierPuzzles = getPuzzlesByDifficulty(diff);
          const solvedInTier = tierPuzzles.filter((p) => solvedPuzzles[p.id]).length;

          return (
            <button
              key={diff}
              onClick={() => handleSelectDifficulty(diff)}
              className={`flex-1 min-w-[120px] py-2 px-3 rounded-lg text-xs font-sans font-medium flex items-center justify-between transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#35E7FF] ${
                isSelected
                  ? `bg-[#1B2638] ${cfg.color} border ${cfg.border} font-semibold`
                  : 'text-[#9BAAC0] hover:text-[#F2F7FF]'
              }`}
            >
              <span>{cfg.label}</span>
              <span className="font-mono text-[11px] opacity-80">
                {solvedInTier}/{tierPuzzles.length}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left: Active Puzzle Board */}
        <div className="md:col-span-7 flex flex-col items-center space-y-4">
          <div
            className="w-full aspect-square bg-[#0E1420] border border-[#29384D] rounded-2xl p-2.5 sm:p-4 md:p-5 shadow-2xl relative"
            style={{ maxWidth: puzzle.boardSize === 3 ? '380px' : puzzle.boardSize === 4 ? '410px' : '440px' }}
          >
            <div
              className={`grid h-full w-full ${puzzle.boardSize === 5 ? 'gap-1.5 sm:gap-2' : puzzle.boardSize === 4 ? 'gap-1.5 sm:gap-2.5' : 'gap-2 sm:gap-3'}`}
              style={{ gridTemplateColumns: `repeat(${puzzle.boardSize}, minmax(0, 1fr))` }}
            >
              {currentBoard.map((val, idx) => (
                <button
                  key={idx}
                  onClick={() => handleCellClick(idx)}
                  disabled={val !== null || isSolved}
                  className={`relative flex items-center justify-center rounded-lg sm:rounded-xl border transition-colors aspect-square select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#35E7FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#080B12] ${
                    isSolved && idx === puzzle.targetMove
                      ? 'bg-[#141D2B] border-[#4FE3A4] text-[#4FE3A4]'
                      : val === 'X'
                      ? 'bg-[#141D2B] border-[#35E7FF]/50 text-[#35E7FF]'
                      : val === 'O'
                      ? 'bg-[#141D2B] border-[#FF3DAE]/50 text-[#FF3DAE]'
                      : 'bg-[#080B12] border-[#29384D] hover:border-[#35E7FF]/50 hover:bg-[#141D2B] active:scale-95 cursor-pointer disabled:cursor-default'
                  }`}
                  aria-label={`Puzzle cell ${idx + 1}, ${val ? 'marked by ' + val : 'unoccupied'}`}
                >
                  {val === 'X' && (
                    <svg
                      className={puzzle.boardSize === 5 ? 'w-6 h-6 sm:w-8 sm:h-8' : puzzle.boardSize === 4 ? 'w-7 h-7 sm:w-10 sm:h-10' : 'w-10 h-10 sm:w-14 sm:h-14'}
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
                      className={puzzle.boardSize === 5 ? 'w-6 h-6 sm:w-8 sm:h-8' : puzzle.boardSize === 4 ? 'w-7 h-7 sm:w-10 sm:h-10' : 'w-10 h-10 sm:w-14 sm:h-14'}
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
              ))}
            </div>
          </div>

          {/* Controls Under Board */}
          <div className="flex items-center justify-between w-full max-w-[400px] text-xs font-mono text-[#9BAAC0]">
            <span>Active Player: <strong className="text-[#35E7FF]">Mark {puzzle.playerMark}</strong></span>
            <div className="flex items-center gap-3">
              <button
                onClick={handlePlayVariant}
                className="hover:text-[#35E7FF] transition-colors flex items-center gap-1 font-sans font-medium cursor-pointer"
                title="Shuffle to another unplayed puzzle in this tier"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span>Variant</span>
              </button>
              <button
                onClick={handleResetPuzzle}
                className="hover:text-[#35E7FF] transition-colors flex items-center gap-1 font-sans font-medium cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-[#35E7FF]"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Objective, Hints & Puzzle Selector */}
        <div className="md:col-span-5 space-y-4">
          {/* Objective Box */}
          <div className="bg-[#0E1420] border border-[#29384D] rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className={`text-xs font-mono uppercase tracking-wider ${DIFFICULTY_LABELS[puzzle.difficulty].color}`}>
                Level {puzzle.level} · {puzzle.boardSize}×{puzzle.boardSize} Arena
              </span>
              {solvedPuzzles[puzzle.id] && (
                <span className="flex items-center gap-1 text-xs font-mono text-[#4FE3A4]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>SOLVED</span>
                </span>
              )}
            </div>

            <h3 className="font-display text-2xl font-bold uppercase tracking-wide text-[#F2F7FF]">
              {puzzle.title}
            </h3>

            <p className="font-sans text-sm text-[#9BAAC0] leading-relaxed">
              {puzzle.objective}
            </p>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-lg bg-[#FF647C]/15 border border-[#FF647C]/40 text-xs font-sans text-[#FF647C]">
                {errorMessage}
              </div>
            )}

            {/* Solved Banner */}
            {isSolved && (
              <div className="p-3.5 rounded-lg bg-[#4FE3A4]/15 border border-[#4FE3A4]/40 space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono text-[#4FE3A4] font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>TACTICAL OBJECTIVE COMPLETE!</span>
                </div>
                <p className="font-sans text-xs text-[#9BAAC0]">{puzzle.explanation}</p>
                <button
                  onClick={handleNextPuzzle}
                  className="w-full py-2.5 bg-[#4FE3A4] text-[#080B12] font-sans font-semibold text-xs uppercase tracking-wider hover:brightness-105 transition-all rounded-lg mt-1 min-h-[40px] cursor-pointer"
                >
                  Next Protocol
                </button>
              </div>
            )}

            {/* Hint Accordion */}
            {!isSolved && (
              <div className="pt-2 border-t border-[#29384D]">
                <button
                  onClick={() => setShowHint(!showHint)}
                  className="text-xs font-sans font-medium text-[#FFC857] hover:underline flex items-center gap-1.5 py-1"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>{showHint ? 'Hide Tactical Hint' : 'Reveal Tactical Hint'}</span>
                </button>
                {showHint && (
                  <p className="font-sans text-xs text-[#9BAAC0] mt-2 p-2.5 rounded-lg bg-[#141D2B] border border-[#29384D]">
                    {puzzle.hint}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Tier Scenarios Selector */}
          <div className="bg-[#0E1420] border border-[#29384D] rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-[#9BAAC0]">
              <span className="uppercase tracking-wider">
                {DIFFICULTY_LABELS[selectedDifficulty].label} Protocols
              </span>
              <span>{currentPool.length} Scenarios</span>
            </div>

            <div className="space-y-1.5">
              {currentPool.map((p, idx) => (
                <button
                  key={p.id}
                  onClick={() => handleSelectPuzzle(idx)}
                  className={`w-full min-h-[44px] p-2.5 rounded-lg text-left text-xs font-sans font-medium flex items-center justify-between border transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#35E7FF] ${
                    selectedPuzzleIndex === idx
                      ? 'bg-[#1B2638] border-[#35E7FF]/60 text-[#35E7FF]'
                      : 'bg-[#141D2B] border-[#29384D] text-[#9BAAC0] hover:text-[#F2F7FF]'
                  }`}
                >
                  <span className="truncate">
                    {p.level}. {p.title} ({p.boardSize}×{p.boardSize})
                  </span>
                  {solvedPuzzles[p.id] && <CheckCircle2 className="w-3.5 h-3.5 text-[#4FE3A4] shrink-0 ml-1" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
