import { MatchRecord, UserSettings, PlayerFeedback } from '../types/game';

const SETTINGS_KEY = 'xo_user_settings';
const HISTORY_KEY = 'xo_match_history';

const DEFAULT_SETTINGS: UserSettings = {
  soundEnabled: true,
  reducedMotion: false,
  preferredBoardSize: 3,
  preferredDifficulty: 'focused',
};

export const storageService = {
  getSettings(): UserSettings {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (!stored) return DEFAULT_SETTINGS;
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: Partial<UserSettings>): UserSettings {
    try {
      const current = storageService.getSettings();
      const updated = { ...current, ...settings };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
      return updated;
    } catch {
      return { ...DEFAULT_SETTINGS, ...settings };
    }
  },

  getHistory(): MatchRecord[] {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      if (!stored) return [];
      return JSON.parse(stored);
    } catch {
      return [];
    }
  },

  recordMatch(record: Omit<MatchRecord, 'id' | 'timestamp'>): MatchRecord[] {
    try {
      const current = storageService.getHistory();
      const newEntry: MatchRecord = {
        ...record,
        id: `match_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        timestamp: Date.now(),
      };
      // Keep only most recent 20 matches
      const updated = [newEntry, ...current].slice(0, 20);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
      return updated;
    } catch {
      return [];
    }
  },

  clearHistory(): void {
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch {
      // Ignore
    }
  },

  getFeedback(): PlayerFeedback[] {
    try {
      const stored = localStorage.getItem('xo_player_feedback');
      if (!stored) return [];
      return JSON.parse(stored);
    } catch {
      return [];
    }
  },

  addFeedback(feedback: Omit<PlayerFeedback, 'id' | 'timestamp'>): PlayerFeedback[] {
    try {
      const current = storageService.getFeedback();
      const newEntry: PlayerFeedback = {
        ...feedback,
        id: `fb_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        timestamp: Date.now(),
      };
      const updated = [newEntry, ...current].slice(0, 30);
      localStorage.setItem('xo_player_feedback', JSON.stringify(updated));
      return updated;
    } catch {
      return [];
    }
  },

  getPuzzleProgress(): Record<string, boolean> {
    try {
      const stored = localStorage.getItem('xo_puzzle_progress');
      if (!stored) return {};
      return JSON.parse(stored);
    } catch {
      return {};
    }
  },

  markPuzzleSolved(puzzleId: string): Record<string, boolean> {
    try {
      const current = storageService.getPuzzleProgress();
      const updated = { ...current, [puzzleId]: true };
      localStorage.setItem('xo_puzzle_progress', JSON.stringify(updated));
      return updated;
    } catch {
      return {};
    }
  },

  getPuzzleHistory(): string[] {
    try {
      const stored = localStorage.getItem('xo_puzzle_history_pool');
      if (!stored) return [];
      return JSON.parse(stored);
    } catch {
      return [];
    }
  },

  recordPuzzlePlayed(puzzleId: string): string[] {
    try {
      const current = storageService.getPuzzleHistory();
      const next = current.includes(puzzleId) ? current : [...current, puzzleId];
      localStorage.setItem('xo_puzzle_history_pool', JSON.stringify(next));
      return next;
    } catch {
      return [];
    }
  },

  resetPuzzleHistory(): void {
    try {
      localStorage.removeItem('xo_puzzle_history_pool');
    } catch {
      // Ignore
    }
  },
};
