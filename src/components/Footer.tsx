import React from 'react';
import { CheckCircle2, Shield } from 'lucide-react';

interface FooterProps {
  onNavigate?: (screen: 'faq' | 'privacy') => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="border-t border-[#29384D] mt-16 px-4 sm:px-6 lg:px-8 py-6 bg-[#080B12] text-xs text-[#9BAAC0]">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center sm:justify-start font-sans">
          <span className="font-display font-bold text-lg text-[#F2F7FF]">XO GAMES</span>
          <span>·</span>
          <span>Cyberpunk Tactical Arena</span>
          <span className="hidden sm:inline">·</span>
          <span className="text-[#35E7FF] hidden sm:inline font-mono text-[11px]">Cyan #35E7FF</span>
          <span className="hidden sm:inline">·</span>
          <span className="text-[#FF3DAE] hidden sm:inline font-mono text-[11px]">Magenta #FF3DAE</span>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono flex-wrap justify-center sm:justify-end">
          <nav aria-label="Footer Legal and Information Links" className="flex items-center gap-3 font-sans text-xs text-[#9BAAC0]">
            <button
              onClick={() => onNavigate?.('faq')}
              className="hover:text-[#35E7FF] transition-colors underline-offset-4 hover:underline cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-[#35E7FF] rounded px-1"
            >
              Arena FAQ
            </button>
            <span className="text-[#29384D]">·</span>
            <button
              onClick={() => onNavigate?.('privacy')}
              className="hover:text-[#35E7FF] transition-colors underline-offset-4 hover:underline cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-[#35E7FF] rounded px-1"
            >
              Privacy Policy
            </button>
          </nav>
          <span className="hidden sm:inline text-[#29384D]">|</span>
          <span className="flex items-center gap-1.5 text-[#4FE3A4]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>WCAG AAA Contrast</span>
          </span>
          <span className="flex items-center gap-1.5 text-[#35E7FF]">
            <Shield className="w-3.5 h-3.5" />
            <span>Deterministic Engine</span>
          </span>
        </div>
      </div>
    </footer>
  );
};
