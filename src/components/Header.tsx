import React from 'react';
import { Volume2, VolumeX, Menu, X, History } from 'lucide-react';
import { audioService } from '../services/audio';

interface HeaderProps {
  activeScreen: string;
  onNavigate: (screen: 'lobby' | 'battle' | 'puzzles' | 'multiplayer' | 'faq' | 'privacy' | 'notfound') => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenHistory: () => void;
  mobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeScreen,
  onNavigate,
  soundEnabled,
  onToggleSound,
  onOpenHistory,
  mobileMenuOpen,
  onToggleMobileMenu,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-[#0E1420]/95 backdrop-blur-md border-b border-[#29384D] px-3 sm:px-6 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Wordmark in Barlow Condensed */}
        <button
          onClick={() => {
            audioService.playClick();
            if (mobileMenuOpen) onToggleMobileMenu();
            onNavigate('lobby');
          }}
          className="flex items-center gap-1.5 font-display font-extrabold text-2xl sm:text-3xl tracking-wider text-[#F2F7FF] hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-[#35E7FF] rounded-md px-1 py-0.5"
          aria-label="XO Games Home"
        >
          <span className="text-[#35E7FF]">X</span>
          <span className="text-[#FF3DAE]">O</span>
          <span className="tracking-wide text-[#F2F7FF]">GAMES</span>
        </button>

        {/* Desktop Navigation Links - Refined to font-sans font-medium */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 font-sans text-sm font-medium text-[#9BAAC0]">
          <button
            onClick={() => {
              audioService.playClick();
              onNavigate('lobby');
            }}
            className={`transition-colors py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#35E7FF] rounded ${
              activeScreen === 'lobby' ? 'text-[#35E7FF] border-b-2 border-[#35E7FF]' : 'hover:text-[#F2F7FF]'
            }`}
          >
            Arena Lobby
          </button>
          <button
            onClick={() => {
              audioService.playClick();
              onNavigate('battle');
            }}
            className={`transition-colors py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#35E7FF] rounded ${
              activeScreen === 'battle' ? 'text-[#35E7FF] border-b-2 border-[#35E7FF]' : 'hover:text-[#F2F7FF]'
            }`}
          >
            Play Battle
          </button>
          <button
            onClick={() => {
              audioService.playClick();
              onNavigate('puzzles');
            }}
            className={`transition-colors py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#35E7FF] rounded ${
              activeScreen === 'puzzles' ? 'text-[#35E7FF] border-b-2 border-[#35E7FF]' : 'hover:text-[#F2F7FF]'
            }`}
          >
            Tactical Puzzles
          </button>
          <button
            onClick={() => {
              audioService.playClick();
              onNavigate('multiplayer');
            }}
            className={`transition-colors py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#35E7FF] rounded ${
              activeScreen === 'multiplayer' ? 'text-[#35E7FF] border-b-2 border-[#35E7FF]' : 'hover:text-[#F2F7FF]'
            }`}
          >
            Online Sectors
          </button>
          <button
            onClick={() => {
              audioService.playClick();
              onNavigate('faq');
            }}
            className={`transition-colors py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#35E7FF] rounded ${
              activeScreen === 'faq' ? 'text-[#35E7FF] border-b-2 border-[#35E7FF]' : 'hover:text-[#F2F7FF]'
            }`}
          >
            FAQ
          </button>
        </nav>

        {/* Right Controls with accessible touch targets */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* History Button */}
          <button
            onClick={() => {
              audioService.playClick();
              onOpenHistory();
            }}
            className="min-h-[40px] min-w-[40px] flex items-center justify-center p-2 rounded-lg bg-[#141D2B] border border-[#29384D] text-[#9BAAC0] hover:text-[#F2F7FF] hover:border-[#35E7FF]/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#35E7FF] transition-colors cursor-pointer"
            title="Recent Match Records"
            aria-label="View Match Records"
          >
            <History className="w-4 h-4" />
          </button>

          {/* Sound Mute Toggle */}
          <button
            onClick={onToggleSound}
            className="min-h-[40px] min-w-[40px] flex items-center justify-center p-2 rounded-lg bg-[#141D2B] border border-[#29384D] text-[#9BAAC0] hover:text-[#35E7FF] hover:border-[#35E7FF]/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#35E7FF] transition-colors cursor-pointer"
            title={soundEnabled ? 'Mute synthesized sound' : 'Enable synthesized sound'}
            aria-label={soundEnabled ? 'Mute sound' : 'Enable sound'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-[#35E7FF]" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={onToggleMobileMenu}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation-menu"
            className="md:hidden min-h-[40px] min-w-[40px] flex items-center justify-center p-2 rounded-lg bg-[#141D2B] border border-[#29384D] text-[#9BAAC0] hover:text-[#F2F7FF] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#35E7FF] transition-colors cursor-pointer"
            aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
          >
            {mobileMenuOpen ? <X className="w-4 h-4 text-[#35E7FF]" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer with 44px minimum touch targets */}
      {mobileMenuOpen && (
        <div
          id="mobile-navigation-menu"
          role="navigation"
          aria-label="Mobile Navigation"
          className="md:hidden mt-3 pt-3 border-t border-[#29384D] space-y-1.5 pb-1 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <button
            type="button"
            onClick={() => {
              audioService.playClick();
              onNavigate('lobby');
              onToggleMobileMenu();
            }}
            className={`w-full min-h-[44px] flex items-center text-left px-4 py-2.5 rounded-lg text-sm font-sans font-medium transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#35E7FF] ${
              activeScreen === 'lobby' ? 'bg-[#1B2638] text-[#35E7FF] border border-[#35E7FF]/30' : 'bg-[#141D2B] text-[#F2F7FF] hover:bg-[#1B2638]'
            }`}
          >
            Arena Lobby
          </button>
          <button
            type="button"
            onClick={() => {
              audioService.playClick();
              onNavigate('battle');
              onToggleMobileMenu();
            }}
            className={`w-full min-h-[44px] flex items-center text-left px-4 py-2.5 rounded-lg text-sm font-sans font-medium transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#35E7FF] ${
              activeScreen === 'battle' ? 'bg-[#1B2638] text-[#35E7FF] border border-[#35E7FF]/30' : 'bg-[#141D2B] text-[#F2F7FF] hover:bg-[#1B2638]'
            }`}
          >
            Play Battle
          </button>
          <button
            type="button"
            onClick={() => {
              audioService.playClick();
              onNavigate('puzzles');
              onToggleMobileMenu();
            }}
            className={`w-full min-h-[44px] flex items-center text-left px-4 py-2.5 rounded-lg text-sm font-sans font-medium transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#35E7FF] ${
              activeScreen === 'puzzles' ? 'bg-[#1B2638] text-[#35E7FF] border border-[#35E7FF]/30' : 'bg-[#141D2B] text-[#F2F7FF] hover:bg-[#1B2638]'
            }`}
          >
            Tactical Puzzles
          </button>
          <button
            type="button"
            onClick={() => {
              audioService.playClick();
              onNavigate('multiplayer');
              onToggleMobileMenu();
            }}
            className={`w-full min-h-[44px] flex items-center text-left px-4 py-2.5 rounded-lg text-sm font-sans font-medium transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#35E7FF] ${
              activeScreen === 'multiplayer' ? 'bg-[#1B2638] text-[#35E7FF] border border-[#35E7FF]/30' : 'bg-[#141D2B] text-[#F2F7FF] hover:bg-[#1B2638]'
            }`}
          >
            Online Sectors
          </button>
          <button
            type="button"
            onClick={() => {
              audioService.playClick();
              onNavigate('faq');
              onToggleMobileMenu();
            }}
            className={`w-full min-h-[44px] flex items-center text-left px-4 py-2.5 rounded-lg text-sm font-sans font-medium transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#35E7FF] ${
              activeScreen === 'faq' ? 'bg-[#1B2638] text-[#35E7FF] border border-[#35E7FF]/30' : 'bg-[#141D2B] text-[#F2F7FF] hover:bg-[#1B2638]'
            }`}
          >
            Arena FAQ
          </button>
          <button
            type="button"
            onClick={() => {
              audioService.playClick();
              onNavigate('privacy');
              onToggleMobileMenu();
            }}
            className={`w-full min-h-[44px] flex items-center text-left px-4 py-2.5 rounded-lg text-sm font-sans font-medium transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#35E7FF] ${
              activeScreen === 'privacy' ? 'bg-[#1B2638] text-[#35E7FF] border border-[#35E7FF]/30' : 'bg-[#141D2B] text-[#F2F7FF] hover:bg-[#1B2638]'
            }`}
          >
            Privacy Policy
          </button>

          {/* Master Sound Settings Row in Mobile Navigation */}
          <div className="pt-2 border-t border-[#29384D] flex items-center justify-between px-4 py-2 text-xs font-sans text-[#9BAAC0]">
            <span>Master Audio Synthesis</span>
            <button
              type="button"
              onClick={() => {
                onToggleSound();
              }}
              className={`px-3 py-1.5 rounded-md font-mono text-xs font-semibold border transition-colors cursor-pointer ${
                soundEnabled
                  ? 'bg-[#1B2638] text-[#35E7FF] border-[#35E7FF]/40'
                  : 'bg-[#141D2B] text-[#9BAAC0] border-[#29384D]'
              }`}
            >
              SOUND: {soundEnabled ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
