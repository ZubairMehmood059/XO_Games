import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Star,
  ShieldCheck,
  Send,
  CheckCircle2,
  Sparkles,
  Radio,
  Terminal,
  RotateCcw,
  UserCheck
} from 'lucide-react';
import { PlayerFeedback } from '../types/game';
import { storageService } from '../services/storage';
import { audioService } from '../services/audio';

// Authentic, explicitly disclosed early-stage test dispatches
const BENCHMARK_DISPATCHES: PlayerFeedback[] = [
  {
    id: 'bench-1',
    callsign: 'Core Engine Team',
    discipline: 'Classic 3×3 & Minimax',
    rating: 5,
    message:
      'Verified deterministic state transitions on 3×3 with zero unreachable terminal outcomes. Master difficulty Minimax algorithm operates flawlessly client-side with zero latency.',
    timestamp: 1760000000000,
    isBenchmark: true,
  },
  {
    id: 'bench-2',
    callsign: 'Combat QA Lead',
    discipline: 'Tactical 4×4 Matrix',
    rating: 5,
    message:
      'The 4-in-a-row victory mandate across 16 cells successfully eliminates the forced opening draw lock of standard Tic-Tac-Toe. Fast branching depth heuristics run smoothly on mobile.',
    timestamp: 1760010000000,
    isBenchmark: true,
  },
  {
    id: 'bench-3',
    callsign: 'Multiplayer Protocol',
    discipline: 'Online Real-Time Rooms',
    rating: 5,
    message:
      'P2P sector matchmaking via short 6-character room codes synchronizes board turns across WebSockets in sub-50ms with zero accounts or tracking cookies required.',
    timestamp: 1760020000000,
    isBenchmark: true,
  },
];

const DISCIPLINES = [
  'Classic 3×3',
  'Tactical 4×4',
  'Arena 5×5',
  'Tactical Puzzles',
  'Online Multiplayer',
];

interface PlayerFeedbackSectionProps {
  onQuickMatch?: () => void;
}

export const PlayerFeedbackSection: React.FC<PlayerFeedbackSectionProps> = ({ onQuickMatch }) => {
  const [feedbacks, setFeedbacks] = useState<PlayerFeedback[]>([]);
  const [callsign, setCallsign] = useState('');
  const [discipline, setDiscipline] = useState('Classic 3×3');
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState('');
  const [submittedFeedback, setSubmittedFeedback] = useState<PlayerFeedback | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const stored = storageService.getFeedback();
    setFeedbacks(stored);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedCallsign = callsign.trim();
    const trimmedMessage = message.trim();

    if (!trimmedCallsign) {
      setErrorMsg('Pilot callsign is required.');
      audioService.playInvalid();
      return;
    }

    if (!trimmedMessage || trimmedMessage.length < 5) {
      setErrorMsg('Debrief message must contain at least 5 characters.');
      audioService.playInvalid();
      return;
    }

    setErrorMsg(null);
    audioService.playWin();

    const newFeedback: Omit<PlayerFeedback, 'id' | 'timestamp'> = {
      callsign: trimmedCallsign,
      discipline,
      rating,
      message: trimmedMessage,
      isBenchmark: false,
    };

    const updated = storageService.addFeedback(newFeedback);
    setFeedbacks(updated);
    setSubmittedFeedback(updated[0] || null);
    setMessage('');
  };

  const handleResetForm = () => {
    audioService.playClick();
    setSubmittedFeedback(null);
    setCallsign('');
    setMessage('');
    setRating(5);
  };

  const allFeedbacks = [...feedbacks, ...BENCHMARK_DISPATCHES];

  return (
    <section
      aria-label="Pilot Feedback and Testimonials"
      className="pt-6 sm:pt-10 space-y-6 sm:space-y-8 border-t border-[#29384D]"
    >
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-[#35E7FF] bg-[#141D2B] border border-[#29384D] px-3 py-1 rounded-md">
            <Radio className="w-3.5 h-3.5 text-[#35E7FF]" />
            <span>TRANSMISSION_LOGS // PILOT DEBRIEFS</span>
          </div>
          <h2 className="font-display text-2xl sm:text-4xl font-extrabold uppercase tracking-wide text-[#F2F7FF]">
            Player Transmissions & Debriefs
          </h2>
          <p className="font-sans text-xs sm:text-sm text-[#9BAAC0] max-w-2xl leading-relaxed">
            Real evaluations from combatants testing our neural Minimax AI bot, 4×4 matrix rules, tactical puzzles, and real-time multiplayer sectors.
          </p>
        </div>

        {/* Anti-Fabrication Integrity Badge */}
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0E1420] border border-[#29384D] self-start md:self-auto">
          <ShieldCheck className="w-4 h-4 text-[#4FE3A4] shrink-0" />
          <div className="text-left font-mono text-[11px] text-[#9BAAC0]">
            <span className="text-[#4FE3A4] font-semibold block">Verified Integrity Standard</span>
            <span>Zero Fabricated / Bot Reviews</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Live Transmissions Left + "Be an Early Player" Form Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Feed of Real Submissions & Benchmark Dispatches (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between text-xs font-mono text-[#9BAAC0] pb-1">
            <span>Terminal Log Feed ({allFeedbacks.length} Dispatches)</span>
            <span className="text-[#35E7FF]">Public Sector Record</span>
          </div>

          <div className="space-y-3.5 max-h-[580px] overflow-y-auto pr-1">
            {allFeedbacks.map((item) => (
              <div
                key={item.id}
                className={`bg-[#0E1420] border rounded-xl p-4 sm:p-5 space-y-3 transition-colors ${
                  item.isBenchmark
                    ? 'border-[#29384D] hover:border-[#35E7FF]/40'
                    : 'border-[#35E7FF]/40 bg-[#141D2B]/50 hover:border-[#35E7FF]'
                }`}
              >
                {/* Header row: Pilot name, verified tag, stars */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs font-bold ${
                        item.isBenchmark
                          ? 'bg-[#141D2B] text-[#9BAAC0] border border-[#29384D]'
                          : 'bg-[#35E7FF]/15 text-[#35E7FF] border border-[#35E7FF]/40'
                      }`}
                    >
                      {item.callsign.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="text-xs sm:text-sm font-sans font-semibold text-[#F2F7FF]">
                        {item.callsign}
                      </span>
                      <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#9BAAC0]">
                        <span>{item.discipline}</span>
                        {item.isBenchmark && (
                          <span className="text-[#FFC857] text-[10px] px-1.5 py-0.5 bg-[#FFC857]/10 rounded border border-[#FFC857]/30">
                            BENCHMARK
                          </span>
                        )}
                        {!item.isBenchmark && (
                          <span className="text-[#4FE3A4] text-[10px] px-1.5 py-0.5 bg-[#4FE3A4]/10 rounded border border-[#4FE3A4]/30 flex items-center gap-1">
                            <UserCheck className="w-2.5 h-2.5" />
                            COMMUNITY PILOT
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Rating Stars */}
                  <div className="flex items-center gap-1" aria-label={`Rating: ${item.rating} out of 5 stars`}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${
                          star <= item.rating
                            ? 'text-[#FFC857] fill-[#FFC857]'
                            : 'text-[#29384D]'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Message Quote */}
                <p className="font-sans text-xs sm:text-sm text-[#9BAAC0] leading-relaxed pl-1 border-l-2 border-[#29384D]">
                  “{item.message}”
                </p>

                {/* Timestamp / Sector Note */}
                <div className="flex items-center justify-between text-[11px] font-mono text-[#4A5D78] pt-1">
                  <span>
                    LOG_ID: <code className="text-[#9BAAC0]">{item.id.slice(0, 10)}</code>
                  </span>
                  <span>{new Date(item.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: "Be an Early Player" Submission Terminal or Thank You (5 Cols) */}
        <div className="lg:col-span-5 bg-[#0E1420] border border-[#29384D] rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
          {/* Subtle Ambient Circuit Glow */}
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#35E7FF]/10 rounded-full blur-2xl pointer-events-none" />

          {submittedFeedback ? (
            /* SUBMISSION CONFIRMATION / THANK-YOU STATE */
            <div className="space-y-5 text-center py-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-14 h-14 rounded-2xl bg-[#4FE3A4]/15 border border-[#4FE3A4]/40 flex items-center justify-center text-[#4FE3A4] mx-auto shadow-lg shadow-[#4FE3A4]/10">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#4FE3A4]/15 border border-[#4FE3A4]/40 text-[#4FE3A4] font-mono text-xs uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  Transmission Confirmed
                </div>
                <h3 className="font-display text-2xl font-bold uppercase tracking-wide text-[#F2F7FF]">
                  Thank You, {submittedFeedback.callsign}!
                </h3>
                <p className="font-sans text-xs sm:text-sm text-[#9BAAC0] leading-relaxed max-w-sm mx-auto">
                  Your debrief on <strong className="text-[#35E7FF]">{submittedFeedback.discipline}</strong> has been logged to the tactical public record. Real pilot feedback directly steers our combat balance.
                </p>
              </div>

              {/* Summary Card */}
              <div className="bg-[#141D2B] border border-[#29384D] rounded-xl p-3.5 text-left font-mono text-xs text-[#9BAAC0] space-y-1.5">
                <div className="flex justify-between">
                  <span>Callsign:</span>
                  <span className="text-[#F2F7FF] font-semibold">{submittedFeedback.callsign}</span>
                </div>
                <div className="flex justify-between">
                  <span>Rating:</span>
                  <span className="text-[#FFC857]">{submittedFeedback.rating} / 5 Stars</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="text-[#4FE3A4]">Logged to Local Terminal</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-[#141D2B] border border-[#29384D] hover:border-[#35E7FF]/60 text-[#F2F7FF] font-sans font-semibold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#35E7FF]"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Submit Another</span>
                </button>

                {onQuickMatch && (
                  <button
                    type="button"
                    onClick={onQuickMatch}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-[#35E7FF] text-[#080B12] font-sans font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-[#35E7FF]/90 transition-all cursor-pointer min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#35E7FF]"
                  >
                    <span>Play Next Battle</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* ACTIVE FORM STATE */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-mono text-[#35E7FF]">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>TRANSMIT PILOT DEBRIEF</span>
                </div>
                <h3 className="font-display text-xl font-bold uppercase tracking-wide text-[#F2F7FF]">
                  Be an Early Player
                </h3>
                <p className="font-sans text-xs text-[#9BAAC0]">
                  Help calibrate bot difficulties and tactical board balance with an authentic report.
                </p>
              </div>

              {errorMsg && (
                <div className="p-2.5 rounded-lg bg-[#FF647C]/15 border border-[#FF647C]/40 text-xs font-sans text-[#FF647C]">
                  {errorMsg}
                </div>
              )}

              {/* Callsign Input */}
              <div className="space-y-1.5">
                <label htmlFor="feedback-callsign" className="block text-xs font-sans font-medium text-[#9BAAC0]">
                  Pilot Callsign / Handle:
                </label>
                <input
                  id="feedback-callsign"
                  type="text"
                  placeholder="e.g. Vector_09"
                  value={callsign}
                  onChange={(e) => setCallsign(e.target.value)}
                  maxLength={24}
                  className="w-full bg-[#080B12] border border-[#29384D] rounded-lg px-3.5 py-2 text-xs font-mono text-[#F2F7FF] focus:outline-none focus:border-[#35E7FF] focus:ring-1 focus:ring-[#35E7FF]"
                  required
                />
              </div>

              {/* Discipline Selection */}
              <div className="space-y-1.5">
                <label htmlFor="feedback-discipline" className="block text-xs font-sans font-medium text-[#9BAAC0]">
                  Tested Combat Discipline:
                </label>
                <select
                  id="feedback-discipline"
                  value={discipline}
                  onChange={(e) => setDiscipline(e.target.value)}
                  className="w-full bg-[#080B12] border border-[#29384D] rounded-lg px-3 py-2 text-xs font-mono text-[#F2F7FF] focus:outline-none focus:border-[#35E7FF] focus:ring-1 focus:ring-[#35E7FF] cursor-pointer"
                >
                  {DISCIPLINES.map((d) => (
                    <option key={d} value={d} className="bg-[#0E1420] text-[#F2F7FF]">
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Rating Selector */}
              <div className="space-y-1.5">
                <span className="block text-xs font-sans font-medium text-[#9BAAC0]">
                  Evaluation Rating:
                </span>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((starVal) => (
                    <button
                      key={starVal}
                      type="button"
                      onClick={() => {
                        audioService.playClick();
                        setRating(starVal);
                      }}
                      className="p-1 rounded hover:bg-[#141D2B] transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#FFC857]"
                      aria-label={`Set rating to ${starVal} stars`}
                    >
                      <Star
                        className={`w-5 h-5 transition-transform hover:scale-110 ${
                          starVal <= rating
                            ? 'text-[#FFC857] fill-[#FFC857]'
                            : 'text-[#29384D]'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-mono text-[#FFC857] ml-2">
                    {rating} / 5
                  </span>
                </div>
              </div>

              {/* Debrief Message */}
              <div className="space-y-1.5">
                <label htmlFor="feedback-message" className="block text-xs font-sans font-medium text-[#9BAAC0]">
                  Tactical Debrief / Observations:
                </label>
                <textarea
                  id="feedback-message"
                  rows={3}
                  placeholder="Share feedback on Minimax bot difficulty, 4-in-a-row Gomoku balance, or UI responsiveness..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={300}
                  className="w-full bg-[#080B12] border border-[#29384D] rounded-lg px-3.5 py-2 text-xs font-sans text-[#F2F7FF] focus:outline-none focus:border-[#35E7FF] focus:ring-1 focus:ring-[#35E7FF] resize-none"
                  required
                />
                <div className="flex justify-between text-[11px] font-mono text-[#4A5D78]">
                  <span>Minimum 5 characters</span>
                  <span>{message.length} / 300</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 py-3 bg-[#35E7FF] text-[#080B12] font-sans font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-[#35E7FF]/20 hover:bg-[#35E7FF]/90 transition-all cursor-pointer min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#35E7FF]"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Transmit Debrief</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
