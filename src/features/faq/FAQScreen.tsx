import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, ArrowLeft, Swords, Cpu, Grid3X3, Users, Zap } from 'lucide-react';

interface FAQScreenProps {
  onReturnToLobby: () => void;
  onNavigateToBattle: (size: 3 | 4 | 5) => void;
}

interface FAQItem {
  id: string;
  category: 'rules' | 'ai' | 'multiplayer' | 'privacy';
  question: string;
  answer: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    id: 'rules-1',
    category: 'rules',
    question: 'How do the 4×4 Matrix and 5×5 Arena rules differ from Classic 3×3?',
    answer: 'In Classic 3×3, winning requires 3 marks in a line. In 4×4 Matrix, you must connect 4 marks in a line on a 16-cell board, which eliminates the forced draw typical of 3×3. In 5×5 Arena (Gomoku-inspired), victory also requires connecting 4 marks in any orthogonal or diagonal direction across 25 cells, opening up intense multi-directional fork strategies.',
  },
  {
    id: 'rules-2',
    category: 'rules',
    question: 'Who gets the first move in a match?',
    answer: 'Player X always moves first in all modes, following tournament standard convention. In local Pass & Play, players can alternate who pilots symbol X. In Online Multiplayer, the room creator pilots X and takes the opening turn.',
  },
  {
    id: 'ai-1',
    category: 'ai',
    question: 'How does the Neural AI Bot work on different difficulty levels?',
    answer: 'Casual makes uniform random moves for relaxed play. Focused computes 1-ply winning moves, 1-ply immediate blocks, and favors high-value tactical centers and corners. Master deploys a mathematically unbeatable Minimax algorithm with Alpha-Beta pruning on 3×3, and a depth-bounded heuristic board evaluator on 4×4 and 5×5.',
  },
  {
    id: 'ai-2',
    category: 'ai',
    question: 'Can I beat the Master AI on a 3×3 board?',
    answer: 'In game theory, 3×3 Tic-Tac-Toe is a solved game. When both players play optimally, the game always ends in a draw. You cannot win against Master AI on 3×3 if it plays flawlessly, but you can force a draw by avoiding strategic traps.',
  },
  {
    id: 'multiplayer-1',
    category: 'multiplayer',
    question: 'How does online multiplayer match-making and room creation work?',
    answer: 'XO Games uses private room codes (e.g. CYBER-892). One player creates a room and shares the 6-character code with their opponent. All moves are server-authoritative and synchronized in real time via WebSockets with zero persistent accounts required.',
  },
  {
    id: 'multiplayer-2',
    category: 'multiplayer',
    question: 'What happens if a player disconnects during an online match?',
    answer: 'The system detects connection loss instantly via WebSocket heartbeats. The remaining player receives an immediate OPPONENT_DISCONNECTED notice. The room remains active in server memory for 15 minutes before being automatically reclaimed.',
  },
  {
    id: 'privacy-1',
    category: 'privacy',
    question: 'Where is my match history and audio configuration saved?',
    answer: 'All data is stored directly in your browser using the HTML5 localStorage API. No tracking cookies or external accounts are necessary. If you clear your browser cookies and site data, your local records will be reset.',
  },
];

export const FAQScreen: React.FC<FAQScreenProps> = ({ onReturnToLobby, onNavigateToBattle }) => {
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({ 'rules-1': true, 'ai-1': true });

  const toggleItem = (id: string) => {
    setOpenIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-6 sm:py-8 px-3 sm:px-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-[#29384D] pb-3 sm:pb-4 mb-6 sm:mb-8">
        <button
          onClick={onReturnToLobby}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#29384D] bg-[#141D2B] text-xs font-sans font-medium text-[#9BAAC0] hover:text-[#F2F7FF] hover:border-[#35E7FF]/60 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#35E7FF]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Lobby</span>
        </button>

        <span className="font-mono text-xs text-[#9BAAC0]">
          INTEL_BASE // FAQ
        </span>
      </div>

      <div className="bg-[#0E1420] border border-[#29384D] rounded-2xl p-4 sm:p-8 lg:p-10 space-y-6 sm:space-y-8">
        {/* Title */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#35E7FF]/10 border border-[#35E7FF]/30 text-[#35E7FF] font-mono text-xs font-semibold uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5" />
            Arena Intelligence & Codex
          </div>
          <h1 className="font-display text-3xl sm:text-5xl font-extrabold uppercase tracking-wide text-[#F2F7FF]">
            Frequently Asked Questions
          </h1>
          <p className="font-sans text-sm sm:text-base text-[#9BAAC0]">
            Direct answers on board rules, Minimax AI calculations, WebSocket multiplayer architecture, and deterministic game mechanics.
          </p>
        </div>

        {/* Quick Launch Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-y border-[#29384D] py-5">
          <button
            type="button"
            onClick={() => onNavigateToBattle(3)}
            className="flex items-center gap-3 p-3 bg-[#141D2B] border border-[#29384D] hover:border-[#35E7FF]/50 rounded-xl text-left transition-all cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#35E7FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#080B12]"
          >
            <Grid3X3 className="w-5 h-5 text-[#35E7FF] shrink-0" />
            <div>
              <div className="font-display font-bold text-sm text-[#F2F7FF] group-hover:text-[#35E7FF] transition-colors">Classic 3×3</div>
              <div className="text-[11px] text-[#9BAAC0] font-sans">3-in-a-row duel</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigateToBattle(4)}
            className="flex items-center gap-3 p-3 bg-[#141D2B] border border-[#29384D] hover:border-[#35E7FF]/50 rounded-xl text-left transition-all cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#35E7FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#080B12]"
          >
            <Zap className="w-5 h-5 text-[#35E7FF] shrink-0" />
            <div>
              <div className="font-display font-bold text-sm text-[#F2F7FF] group-hover:text-[#35E7FF] transition-colors">Tactical 4×4</div>
              <div className="text-[11px] text-[#9BAAC0] font-sans">4-in-a-row matrix</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigateToBattle(5)}
            className="flex items-center gap-3 p-3 bg-[#141D2B] border border-[#29384D] hover:border-[#FF3DAE]/50 rounded-xl text-left transition-all cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF3DAE] focus-visible:ring-offset-2 focus-visible:ring-offset-[#080B12]"
          >
            <Swords className="w-5 h-5 text-[#FF3DAE] shrink-0" />
            <div>
              <div className="font-display font-bold text-sm text-[#F2F7FF] group-hover:text-[#FF3DAE] transition-colors">Arena 5×5</div>
              <div className="text-[11px] text-[#9BAAC0] font-sans">4-in-a-row grandmaster</div>
            </div>
          </button>
        </div>

        {/* Accordion Questions */}
        <div className="space-y-3">
          {FAQ_DATA.map((item) => {
            const isOpen = !!openIds[item.id];
            return (
              <div
                key={item.id}
                className="bg-[#141D2B] border border-[#29384D] rounded-xl overflow-hidden transition-colors"
              >
                <button
                  onClick={() => toggleItem(item.id)}
                  aria-expanded={isOpen}
                  className="w-full min-h-[44px] flex items-center justify-between p-3.5 sm:p-5 text-left cursor-pointer hover:bg-[#1B2638]/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#35E7FF]"
                >
                  <span className="font-sans font-semibold text-sm sm:text-base text-[#F2F7FF] pr-4">
                    {item.question}
                  </span>
                  <span className="shrink-0 text-[#35E7FF]">
                    {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </span>
                </button>

                {isOpen && (
                  <div className="px-3.5 pb-3.5 sm:px-5 sm:pb-5 pt-1 text-xs sm:text-sm text-[#9BAAC0] font-sans leading-relaxed border-t border-[#29384D]/40">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Back Action */}
        <div className="pt-4 flex justify-end">
          <button
            onClick={onReturnToLobby}
            className="w-full sm:w-auto min-h-[44px] px-6 py-3 bg-[#35E7FF] text-[#080B12] font-sans font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-[#35E7FF]/90 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#35E7FF]"
          >
            Back to Arena
          </button>
        </div>
      </div>
    </div>
  );
};
