type EventParams = Record<string, string | number | boolean | undefined>;

interface ConsentSettings {
  analytics: boolean;
  timestamp: number;
}

const STORAGE_KEY = 'xo_analytics_consent';
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA4_ID || '';

class AnalyticsService {
  private initialized = false;

  constructor() {
    this.checkAndInit();
  }

  public getConsent(): boolean | null {
    if (typeof window === 'undefined') return null;
    try {
      const item = localStorage.getItem(STORAGE_KEY);
      if (!item) return null;
      const parsed: ConsentSettings = JSON.parse(item);
      return parsed.analytics;
    } catch {
      return null;
    }
  }

  public setConsent(granted: boolean): void {
    if (typeof window === 'undefined') return;
    try {
      const settings: ConsentSettings = {
        analytics: granted,
        timestamp: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));

      if (granted && !this.initialized) {
        this.loadGtag();
      } else if (!granted) {
        // Clear cookies if revoked
        this.disableGtag();
      }
    } catch {
      // Ignore localStorage exceptions
    }
  }

  private checkAndInit(): void {
    if (typeof window === 'undefined') return;
    if (this.getConsent() === true) {
      this.loadGtag();
    }
  }

  private loadGtag(): void {
    if (!GA_MEASUREMENT_ID || this.initialized) return;

    try {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
      document.head.appendChild(script);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const win = window as any;
      win.dataLayer = win.dataLayer || [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      function gtag(...args: any[]) {
        win.dataLayer.push(args);
      }
      win.gtag = gtag;

      gtag('js', new Date());
      gtag('config', GA_MEASUREMENT_ID, {
        anonymize_ip: true,
        cookie_flags: 'SameSite=None;Secure',
      });

      this.initialized = true;
    } catch {
      // Fail safely without affecting gameplay
    }
  }

  private disableGtag(): void {
    if (typeof window === 'undefined') return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const win = window as any;
    if (GA_MEASUREMENT_ID) {
      win[`ga-disable-${GA_MEASUREMENT_ID}`] = true;
    }
  }

  public logEvent(eventName: string, params?: EventParams): void {
    // Only track if consent was explicitly granted
    if (!this.initialized || this.getConsent() !== true) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const win = window as any;
    if (typeof win.gtag === 'function') {
      try {
        win.gtag('event', eventName, params);
      } catch {
        // Silently handle tracking errors
      }
    }
  }

  public logPageView(pagePath: string, pageTitle: string): void {
    this.logEvent('page_view', {
      page_path: pagePath,
      page_title: pageTitle,
    });
  }

  public logGameStart(mode: string, boardSize: number, difficulty?: string): void {
    this.logEvent('game_start', {
      game_mode: mode,
      board_size: boardSize,
      ai_difficulty: difficulty,
    });
  }

  public logGameEnd(winner: string, turns: number, boardSize: number): void {
    this.logEvent('game_end', {
      winner,
      turns,
      board_size: boardSize,
    });
  }

  public logPuzzleSolved(scenarioId: string, moves: number): void {
    this.logEvent('puzzle_completed', {
      scenario_id: scenarioId,
      moves_taken: moves,
    });
  }
}

export const analytics = new AnalyticsService();
