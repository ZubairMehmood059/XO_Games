import React from 'react';
import { Shield, Lock, Database, Radio, CheckCircle, ArrowLeft } from 'lucide-react';

interface PrivacyPolicyScreenProps {
  onReturnToLobby: () => void;
}

export const PrivacyPolicyScreen: React.FC<PrivacyPolicyScreenProps> = ({ onReturnToLobby }) => {
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
          LEGAL_DOC // REV-2026.10
        </span>
      </div>

      <div className="bg-[#0E1420] border border-[#29384D] rounded-2xl p-4 sm:p-8 lg:p-10 space-y-6 sm:space-y-8">
        {/* Title */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#35E7FF]/10 border border-[#35E7FF]/30 text-[#35E7FF] font-mono text-xs font-semibold uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5" />
            Transparent Data Architecture
          </div>
          <h1 className="font-display text-3xl sm:text-5xl font-extrabold uppercase tracking-wide text-[#F2F7FF]">
            Privacy Policy & Data Disclosures
          </h1>
          <p className="font-sans text-sm sm:text-base text-[#9BAAC0]">
            Effective Date: October 9, 2026. XO Games operates on a client-first, minimal-data philosophy. We do not require accounts, do not harvest personal identifiers, and do not monetize user data.
          </p>
        </div>

        {/* Section 1: Local Storage Practices */}
        <div className="space-y-3 border-t border-[#29384D] pt-6">
          <div className="flex items-center gap-2 text-[#35E7FF] font-sans font-bold text-lg">
            <Database className="w-5 h-5 shrink-0" />
            <h2>1. Browser Local Storage (Client-Side Only)</h2>
          </div>
          <p className="font-sans text-sm text-[#9BAAC0] leading-relaxed">
            XO Games stores specific gameplay preferences locally within your browser’s <code className="text-[#35E7FF] bg-[#141D2B] px-1.5 py-0.5 rounded font-mono text-xs">localStorage</code>:
          </p>
          <ul className="list-disc list-inside space-y-1.5 font-sans text-sm text-[#9BAAC0] ml-2">
            <li><strong className="text-[#F2F7FF]">Sound Preference:</strong> Whether Web Audio synthesizers are unmuted (<code className="text-[#35E7FF] font-mono text-xs">xo_sound_enabled</code>).</li>
            <li><strong className="text-[#F2F7FF]">Recent Match Records:</strong> Up to 20 recent match outcomes stored exclusively on your device (<code className="text-[#35E7FF] font-mono text-xs">xo_match_history</code>).</li>
            <li><strong className="text-[#F2F7FF]">Puzzle Progress:</strong> Solved scenario badges and difficulty mastery (<code className="text-[#35E7FF] font-mono text-xs">xo_puzzle_progress</code>).</li>
            <li><strong className="text-[#F2F7FF]">Telemetry Consent:</strong> Your choice regarding Google Analytics 4 tracking (<code className="text-[#35E7FF] font-mono text-xs">xo_analytics_consent</code>).</li>
          </ul>
          <p className="font-sans text-xs text-[#9BAAC0]/80">
            This information is never transmitted to third parties and can be cleared at any time by clearing your browser cache.
          </p>
        </div>

        {/* Section 2: Online Multiplayer & WebSockets */}
        <div className="space-y-3 border-t border-[#29384D] pt-6">
          <div className="flex items-center gap-2 text-[#FF3DAE] font-sans font-bold text-lg">
            <Radio className="w-5 h-5 shrink-0" />
            <h2>2. Online Multiplayer & Ephemeral State</h2>
          </div>
          <p className="font-sans text-sm text-[#9BAAC0] leading-relaxed">
            When you create or join an online multiplayer match:
          </p>
          <ul className="list-disc list-inside space-y-1.5 font-sans text-sm text-[#9BAAC0] ml-2">
            <li>Rooms are designated by short, random 6-character room codes.</li>
            <li>Player identities are generated ephemerally (e.g. <code className="text-[#FF3DAE] font-mono text-xs">usr_a8f9</code>) without collecting IP addresses, hardware signatures, or real identities.</li>
            <li>Game state is maintained in server memory (RAM) only for the duration of the match and is automatically purged after 15 minutes of inactivity.</li>
          </ul>
        </div>

        {/* Section 3: Google Analytics 4 & Telemetry */}
        <div className="space-y-3 border-t border-[#29384D] pt-6">
          <div className="flex items-center gap-2 text-[#FFC857] font-sans font-bold text-lg">
            <Lock className="w-5 h-5 shrink-0" />
            <h2>3. Privacy-Aware Telemetry & Google Analytics 4</h2>
          </div>
          <p className="font-sans text-sm text-[#9BAAC0] leading-relaxed">
            We provide optional Google Analytics 4 integration with strict privacy protections:
          </p>
          <ul className="list-disc list-inside space-y-1.5 font-sans text-sm text-[#9BAAC0] ml-2">
            <li><strong className="text-[#F2F7FF]">Opt-In / Explicit Consent:</strong> Analytics scripts are loaded only after your explicit approval in our telemetry banner.</li>
            <li><strong className="text-[#F2F7FF]">IP Anonymization:</strong> IP addresses are anonymized before processing.</li>
            <li><strong className="text-[#F2F7FF]">No Cross-Site Advertising:</strong> We disable ad personalization and marketing signals.</li>
          </ul>
        </div>

        {/* Section 4: Security & HTTPS */}
        <div className="space-y-3 border-t border-[#29384D] pt-6">
          <div className="flex items-center gap-2 text-[#4FE3A4] font-sans font-bold text-lg">
            <CheckCircle className="w-5 h-5 shrink-0" />
            <h2>4. Cryptographic Security & HTTPS/WSS</h2>
          </div>
          <p className="font-sans text-sm text-[#9BAAC0] leading-relaxed">
            All data in transit is encrypted using Transport Layer Security (TLS 1.3 / HTTPS). WebSocket connections utilize secure WebSockets (WSS). Strict HTTP response headers (<code className="text-[#4FE3A4] font-mono text-xs">HSTS</code>, <code className="text-[#4FE3A4] font-mono text-xs">CSP</code>, <code className="text-[#4FE3A4] font-mono text-xs">X-Content-Type-Options: nosniff</code>) defend against frame manipulation and cross-site scripting.
          </p>
        </div>

        {/* Section 5: Contact & Inquiries */}
        <div className="border-t border-[#29384D] pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-sans font-bold text-sm text-[#F2F7FF]">Questions or Privacy Requests?</h3>
            <p className="text-xs text-[#9BAAC0]">Review our open source codebase or reach out to security engineers.</p>
          </div>
          <button
            onClick={onReturnToLobby}
            className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 bg-[#35E7FF] text-[#080B12] font-sans font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-[#35E7FF]/90 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#35E7FF]"
          >
            Acknowledge & Return
          </button>
        </div>
      </div>
    </div>
  );
};
