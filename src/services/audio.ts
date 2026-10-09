import { PlayerMark } from '../types/game';

class AudioManager {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private masterVolume: number = 0.08;
  private lastSoundTimes: Map<string, number> = new Map();
  private userInteracted: boolean = false;

  constructor() {
    // Load persisted sound setting synchronously
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('xo_sound_enabled');
        if (stored !== null) {
          this.soundEnabled = JSON.parse(stored);
        } else {
          // Also check unified user settings if present
          const userSettings = localStorage.getItem('xo_user_settings');
          if (userSettings) {
            const parsed = JSON.parse(userSettings);
            if (typeof parsed.soundEnabled === 'boolean') {
              this.soundEnabled = parsed.soundEnabled;
            }
          }
        }
      }
    } catch {
      this.soundEnabled = true;
    }

    // Attach passive user-interaction listeners to unlock AudioContext safely
    if (typeof window !== 'undefined') {
      const unlockAudio = () => {
        this.userInteracted = true;
        this.initContext();
        window.removeEventListener('pointerdown', unlockAudio);
        window.removeEventListener('keydown', unlockAudio);
        window.removeEventListener('touchstart', unlockAudio);
      };
      window.addEventListener('pointerdown', unlockAudio, { passive: true, once: true });
      window.addEventListener('keydown', unlockAudio, { passive: true, once: true });
      window.addEventListener('touchstart', unlockAudio, { passive: true, once: true });
    }
  }

  /**
   * Initializes or resumes the AudioContext safely without throwing on autoplay limits.
   */
  private initContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    try {
      if (!this.ctx) {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }

      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {
          // Will resume on next user gesture
        });
      }
    } catch {
      // Autoplay or audio driver sandbox safety
    }

    return this.ctx;
  }

  /**
   * Prevents rapid duplicate sounds from stacking into distorted harsh audio.
   */
  private throttle(key: string, minIntervalMs: number = 40): boolean {
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const last = this.lastSoundTimes.get(key) || 0;
    if (now - last < minIntervalMs) {
      return false;
    }
    this.lastSoundTimes.set(key, now);
    return true;
  }

  public isEnabled(): boolean {
    return this.soundEnabled;
  }

  public setEnabled(enabled: boolean, playFeedback: boolean = true) {
    this.soundEnabled = enabled;
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('xo_sound_enabled', JSON.stringify(enabled));
        // Also keep xo_user_settings in sync
        const userSettings = localStorage.getItem('xo_user_settings');
        if (userSettings) {
          const parsed = JSON.parse(userSettings);
          parsed.soundEnabled = enabled;
          localStorage.setItem('xo_user_settings', JSON.stringify(parsed));
        }
      }
    } catch {
      // Ignore quota errors
    }

    if (enabled && playFeedback) {
      this.playClick();
    }
  }

  public toggle(): boolean {
    this.setEnabled(!this.soundEnabled, true);
    return this.soundEnabled;
  }

  /**
   * Internal tone synthesizer utilizing standard Web Audio API oscillators and gain envelopes.
   */
  private playTone(
    freq: number,
    duration = 0.05,
    type: OscillatorType = 'sine',
    gainMultiplier = 1,
    rampToFreq?: number
  ) {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.initContext();
      if (!ctx || ctx.state === 'suspended') return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      if (rampToFreq !== undefined) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(rampToFreq, 10), now + duration);
      }

      const peakGain = Math.max(0.0001, this.masterVolume * gainMultiplier);
      gain.gain.setValueAtTime(0.0001, now);
      // Fast 4ms attack to prevent speaker pops
      gain.gain.linearRampToValueAtTime(peakGain, now + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch {
      // Never disrupt gameplay if audio fails
    }
  }

  /**
   * Tactile placement sound for marks.
   */
  public playMove(mark: PlayerMark) {
    if (!this.throttle(`move_${mark}`, 40)) return;
    if (mark === 'X') {
      // Electric cyan laser click (crisp dual harmonic)
      this.playTone(520, 0.04, 'sine', 0.9, 680);
    } else {
      // Neon magenta resonance (deep punchy warm drop)
      this.playTone(380, 0.048, 'sine', 1.0, 260);
    }
  }

  /**
   * UI Click for buttons, tabs, modal controls, and selector pills.
   */
  public playClick() {
    if (!this.throttle('click', 35)) return;
    this.playTone(600, 0.03, 'triangle', 0.75, 480);
  }

  /**
   * Illegal move or invalid selection notice.
   */
  public playInvalid() {
    if (!this.throttle('invalid', 80)) return;
    this.playTone(190, 0.09, 'sawtooth', 0.55, 140);
  }

  /**
   * Victory sound: uplifting cyber harmonic sequence.
   */
  public playWin() {
    if (!this.soundEnabled || !this.throttle('win', 250)) return;
    this.playTone(523.25, 0.09, 'sine', 0.9); // C5
    setTimeout(() => {
      this.playTone(659.25, 0.1, 'sine', 1.0); // E5
    }, 85);
    setTimeout(() => {
      this.playTone(783.99, 0.12, 'sine', 1.1); // G5
    }, 170);
    setTimeout(() => {
      this.playTone(1046.5, 0.22, 'sine', 1.25); // C6
    }, 255);
  }

  /**
   * Loss sound: subtle descending cyberpunk tone.
   */
  public playLoss() {
    if (!this.soundEnabled || !this.throttle('loss', 250)) return;
    this.playTone(440, 0.08, 'triangle', 0.8, 330);
    setTimeout(() => {
      this.playTone(330, 0.15, 'sine', 0.75, 220);
    }, 90);
  }

  /**
   * Tactical Draw sound: neutral resolved cadence.
   */
  public playDraw() {
    if (!this.soundEnabled || !this.throttle('draw', 250)) return;
    this.playTone(392, 0.08, 'sine', 0.85);
    setTimeout(() => {
      this.playTone(329.63, 0.14, 'sine', 0.75);
    }, 80);
  }

  /**
   * Board restart / Rematch sound: rapid high-tech charging sweep.
   */
  public playRestart() {
    if (!this.throttle('restart', 120)) return;
    this.playTone(280, 0.09, 'sine', 0.8, 720);
  }

  /**
   * Tactical Puzzle solved triumph sound.
   */
  public playPuzzleSuccess() {
    if (!this.soundEnabled || !this.throttle('puzzle_success', 200)) return;
    this.playTone(587.33, 0.08, 'sine', 0.9); // D5
    setTimeout(() => {
      this.playTone(880, 0.1, 'sine', 1.05); // A5
    }, 80);
    setTimeout(() => {
      this.playTone(1174.66, 0.18, 'sine', 1.2); // D6
    }, 160);
  }

  /**
   * Tactical Puzzle failed attempt buzzer.
   */
  public playPuzzleFail() {
    if (!this.soundEnabled || !this.throttle('puzzle_fail', 100)) return;
    this.playTone(240, 0.07, 'sawtooth', 0.6, 170);
  }

  /**
   * Online Sector connection established / match started.
   */
  public playConnected() {
    if (!this.soundEnabled || !this.throttle('connected', 150)) return;
    this.playTone(440, 0.06, 'sine', 0.85, 660);
    setTimeout(() => {
      this.playTone(880, 0.12, 'sine', 0.95);
    }, 70);
  }

  /**
   * Online Sector disconnect / link severed alert.
   */
  public playDisconnected() {
    if (!this.soundEnabled || !this.throttle('disconnected', 150)) return;
    this.playTone(520, 0.07, 'sawtooth', 0.7, 300);
    setTimeout(() => {
      this.playTone(220, 0.12, 'sawtooth', 0.6, 140);
    }, 80);
  }
}

export const audioService = new AudioManager();
