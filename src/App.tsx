import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { VictoryModal } from './components/VictoryModal';
import { HistoryModal } from './components/HistoryModal';
import { CookieConsentBanner } from './components/CookieConsentBanner';
import { LobbyScreen } from './features/lobby/LobbyScreen';
import { BattleScreen } from './features/battle/BattleScreen';
import { PuzzlesScreen } from './features/puzzles/PuzzlesScreen';
import { MultiplayerScreen } from './features/multiplayer/MultiplayerScreen';
import { FAQScreen } from './features/faq/FAQScreen';
import { PrivacyPolicyScreen } from './features/privacy/PrivacyPolicyScreen';
import { NotFoundScreen } from './features/notfound/NotFoundScreen';
import { BoardSize, GameMode, AIDifficulty, CellValue, PlayerMark, MatchRecord } from './types/game';
import { audioService } from './services/audio';
import { storageService } from './services/storage';
import { analytics } from './services/analytics';

type ScreenType = 'lobby' | 'battle' | 'puzzles' | 'multiplayer' | 'faq' | 'privacy' | 'notfound';

export default function App() {
  const [activeScreen, setActiveScreen] = useState<ScreenType>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      const params = new URLSearchParams(window.location.search);
      const screenParam = params.get('screen');
      if (screenParam === 'faq') return 'faq';
      if (screenParam === 'privacy') return 'privacy';
      if (screenParam === 'puzzles') return 'puzzles';
      if (screenParam === 'multiplayer') return 'multiplayer';
      if (screenParam === 'battle') return 'battle';

      if (path !== '/' && path !== '/index.html' && path !== '') {
        return 'notfound';
      }
    }
    return 'lobby';
  });

  const [soundEnabled, setSoundEnabled] = useState(() => audioService.isEnabled());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [matchHistory, setMatchHistory] = useState<MatchRecord[]>(() => storageService.getHistory());

  // Sync page title, analytics page view, and scroll position on screen changes
  useEffect(() => {
    let title = 'XO Games — Cyberpunk Arena Tic-Tac-Toe';
    if (activeScreen === 'battle') title = 'Combat Arena · XO Games';
    else if (activeScreen === 'puzzles') title = 'Tactical Puzzles · XO Games';
    else if (activeScreen === 'multiplayer') title = 'Online Multiplayer Sectors · XO Games';
    else if (activeScreen === 'faq') title = 'Arena FAQ & Codex · XO Games';
    else if (activeScreen === 'privacy') title = 'Privacy Policy & Data Security · XO Games';
    else if (activeScreen === 'notfound') title = '404 Sector Void · XO Games';

    document.title = title;
    analytics.logPageView(`/${activeScreen}`, title);
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
  }, [activeScreen]);

  // Battle Configuration
  const [boardSize, setBoardSize] = useState<BoardSize>(3);
  const [gameMode, setGameMode] = useState<GameMode>('ai');
  const [aiDifficulty, setAiDifficulty] = useState<AIDifficulty>('focused');

  // Victory Modal State
  const [showVictoryModal, setShowVictoryModal] = useState(false);
  const [victoryWinner, setVictoryWinner] = useState<PlayerMark | null>(null);
  const [victoryIsDraw, setVictoryIsDraw] = useState(false);
  const [victoryLine, setVictoryLine] = useState<number[] | null>(null);
  const [finalBoard, setFinalBoard] = useState<CellValue[]>([]);
  const [finalTurns, setFinalTurns] = useState(0);

  // Teaser Board State (for Lobby)
  const [teaserBoard, setTeaserBoard] = useState<CellValue[]>([
    'X', null, 'O',
    null, 'X', null,
    'O', null, null
  ]);
  const [teaserTurn, setTeaserTurn] = useState<PlayerMark>('X');

  const handleToggleSound = () => {
    const next = audioService.toggle();
    setSoundEnabled(next);
  };

  const handleStartMatch = (size: BoardSize, mode: GameMode, difficulty: AIDifficulty) => {
    setBoardSize(size);
    setGameMode(mode);
    setAiDifficulty(difficulty);
    analytics.logGameStart(mode, size, difficulty);
    setActiveScreen('battle');
  };

  const handleMatchFinished = (
    winner: PlayerMark | 'DRAW',
    board: CellValue[],
    winningLine: number[] | null,
    turns: number
  ) => {
    setFinalBoard(board);
    setFinalTurns(turns);
    setVictoryLine(winningLine);
    if (winner === 'DRAW') {
      setVictoryWinner(null);
      setVictoryIsDraw(true);
    } else {
      setVictoryWinner(winner);
      setVictoryIsDraw(false);
    }
    setShowVictoryModal(true);
    analytics.logGameEnd(winner, turns, boardSize);
    setMatchHistory(storageService.getHistory());
  };

  const handleTeaserCellClick = (idx: number) => {
    if (teaserBoard[idx] !== null) return;
    const next = [...teaserBoard];
    next[idx] = teaserTurn;
    setTeaserBoard(next);
    audioService.playMove(teaserTurn);
    setTeaserTurn(teaserTurn === 'X' ? 'O' : 'X');
  };

  const handleTeaserReset = () => {
    setTeaserBoard([
      'X', null, 'O',
      null, 'X', null,
      'O', null, null
    ]);
    setTeaserTurn('X');
    audioService.playClick();
  };

  return (
    <div className="min-h-screen bg-[#080B12] text-[#F2F7FF] font-sans antialiased selection:bg-[#35E7FF]/20 selection:text-[#F2F7FF] flex flex-col overflow-x-hidden">
      {/* Header */}
      <Header
        activeScreen={activeScreen}
        onNavigate={(screen) => {
          setActiveScreen(screen);
          setMobileMenuOpen(false);
        }}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onOpenHistory={() => setHistoryModalOpen(true)}
        mobileMenuOpen={mobileMenuOpen}
        onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
      />

      {/* Main Viewport Content */}
      <main className="flex-1 p-3 sm:p-6 lg:p-8 flex justify-center items-start">
        <div className="w-full max-w-7xl mx-auto">
          {activeScreen === 'lobby' && (
            <LobbyScreen
              onStartMatch={handleStartMatch}
              onNavigateToPuzzles={() => setActiveScreen('puzzles')}
              onNavigateToMultiplayer={() => setActiveScreen('multiplayer')}
              teaserBoard={teaserBoard}
              onTeaserCellClick={handleTeaserCellClick}
              onTeaserReset={handleTeaserReset}
              teaserTurn={teaserTurn}
            />
          )}

          {activeScreen === 'battle' && (
            <BattleScreen
              boardSize={boardSize}
              mode={gameMode}
              difficulty={aiDifficulty}
              onReturnToLobby={() => setActiveScreen('lobby')}
              onMatchFinished={handleMatchFinished}
              onBoardSizeChange={(sz) => setBoardSize(sz)}
            />
          )}

          {activeScreen === 'puzzles' && (
            <PuzzlesScreen onReturnToLobby={() => setActiveScreen('lobby')} />
          )}

          {activeScreen === 'multiplayer' && (
            <MultiplayerScreen onReturnToLobby={() => setActiveScreen('lobby')} />
          )}

          {activeScreen === 'faq' && (
            <FAQScreen
              onReturnToLobby={() => setActiveScreen('lobby')}
              onNavigateToBattle={(size) => handleStartMatch(size, 'ai', 'focused')}
            />
          )}

          {activeScreen === 'privacy' && (
            <PrivacyPolicyScreen onReturnToLobby={() => setActiveScreen('lobby')} />
          )}

          {activeScreen === 'notfound' && (
            <NotFoundScreen
              onReturnToLobby={() => setActiveScreen('lobby')}
              onQuickPlay={() => handleStartMatch(3, 'ai', 'focused')}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <Footer
        onNavigate={(screen) => {
          setActiveScreen(screen);
          setMobileMenuOpen(false);
        }}
      />

      {/* Privacy / Telemetry Consent Banner */}
      <CookieConsentBanner onOpenPrivacy={() => setActiveScreen('privacy')} />

      {/* Victory / Draw Modal */}
      {showVictoryModal && (
        <VictoryModal
          winner={victoryWinner}
          isDraw={victoryIsDraw}
          winningLine={victoryLine}
          board={finalBoard}
          boardSize={boardSize}
          turns={finalTurns}
          onRematch={() => {
            setShowVictoryModal(false);
            // Re-mounts or resets the active match
            setActiveScreen('battle');
          }}
          onReturnToLobby={() => {
            setShowVictoryModal(false);
            setActiveScreen('lobby');
          }}
        />
      )}

      {/* Match History Modal */}
      <HistoryModal
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        history={matchHistory}
        onHistoryUpdated={(updated) => setMatchHistory(updated)}
      />
    </div>
  );
}
