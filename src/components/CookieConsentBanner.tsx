import React, { useState, useEffect } from 'react';
import { Shield, Check, X } from 'lucide-react';
import { analytics } from '../services/analytics';

interface CookieConsentBannerProps {
  onOpenPrivacy: () => void;
}

export const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({ onOpenPrivacy }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show if user has not made a choice yet
    const current = analytics.getConsent();
    if (current === null) {
      // Small delay so it does not distract immediately on mount
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!visible) return null;

  const handleAccept = () => {
    analytics.setConsent(true);
    setVisible(false);
  };

  const handleDecline = () => {
    analytics.setConsent(false);
    setVisible(false);
  };

  return (
    <aside
      aria-label="Privacy and Cookie Preferences"
      className="fixed bottom-3 sm:bottom-4 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md z-50 bg-[#0E1420] border border-[#29384D] rounded-xl p-3.5 sm:p-4 shadow-2xl backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 duration-200"
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#35E7FF]/10 border border-[#35E7FF]/30 flex items-center justify-center shrink-0 mt-0.5">
          <Shield className="w-4 h-4 text-[#35E7FF]" />
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-sans text-xs font-bold text-[#F2F7FF] uppercase tracking-wider">
              Privacy & Telemetry Notice
            </h4>
            <span className="font-mono text-[10px] text-[#4FE3A4]">ANONYMIZED</span>
          </div>

          <p className="text-xs text-[#9BAAC0] leading-relaxed">
            XO Games uses local storage for board preferences and optional anonymized telemetry to balance AI difficulty. No personal data is collected or sold.{' '}
            <button
              onClick={onOpenPrivacy}
              className="text-[#35E7FF] hover:underline underline-offset-2 ml-1 cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-[#35E7FF]"
            >
              Privacy Policy
            </button>
          </p>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleAccept}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 min-h-[40px] bg-[#35E7FF] text-[#080B12] font-sans font-semibold text-xs rounded-lg hover:bg-[#35E7FF]/90 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#35E7FF]"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Accept</span>
            </button>
            <button
              onClick={handleDecline}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 min-h-[40px] bg-[#141D2B] border border-[#29384D] text-[#9BAAC0] hover:text-[#F2F7FF] font-sans font-semibold text-xs rounded-lg transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#35E7FF]"
            >
              <X className="w-3.5 h-3.5" />
              <span>Essential Only</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
