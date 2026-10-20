// client/src/utils/audio.js
// High-energy esports Audio & Haptic Sync Engine for CLUTCH

class AudioHapticManager {
  constructor() {
    this.muted = false;
    this.unlocked = false;
    this.audioElements = {};
    this.ringInterval = null;
    this.hapticInterval = null;
    this.ctx = null;
    
    // Initialize audio elements with HTML5 Audio
    this.initAudioStems();
  }

  initAudioStems() {
    if (typeof window === 'undefined') return;

    try {
      this.audioElements = {
        beat_tick: new Audio('/audio/beat_tick.mp3'),
        clutch_lock: new Audio('/audio/clutch_lock.mp3'),
        stage_call_ring: new Audio('/audio/stage_call_ring.mp3')
      };

      // Set properties
      this.audioElements.stage_call_ring.loop = true;

      // Preload stems
      Object.values(this.audioElements).forEach((audio) => {
        audio.preload = 'auto';
        audio.volume = 0.85;
      });
    } catch (e) {
      console.warn('HTML5 Audio initialization warning:', e);
    }
  }

  // Gracefully unlock audio stems on first user interaction (bypasses browser autoplay policy)
  unlockAudio() {
    if (this.unlocked) return;
    this.unlocked = true;

    // Unlock Web Audio API context if available
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext && !this.ctx) {
        this.ctx = new AudioContext();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    } catch (e) {
      // Ignore
    }

    // Warm-up HTML5 audio elements silently
    Object.values(this.audioElements).forEach((audio) => {
      try {
        const promise = audio.play();
        if (promise !== undefined) {
          promise
            .then(() => {
              audio.pause();
              audio.currentTime = 0;
            })
            .catch(() => {
              // Ignore play-pause race
            });
        }
      } catch (err) {
        // Ignore
      }
    });
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.muted) {
      this.stopStageRingtoneAndBuzz();
    }
    return this.muted;
  }

  // Play Beat Cue ("ROCK", "PAPER", "SCISSOR")
  playBeatTick(beatName = 'ROCK') {
    if (this.muted) return;
    this.unlockAudio();

    try {
      const audio = this.audioElements.beat_tick;
      if (audio) {
        audio.currentTime = 0;
        audio.play().catch(() => this.fallbackSynthBeat(beatName));
      } else {
        this.fallbackSynthBeat(beatName);
      }
    } catch (e) {
      this.fallbackSynthBeat(beatName);
    }
  }

  // Play CLUTCH Lock-in Bass Cue + Haptic
  playClutchLock() {
    if (!this.muted) {
      this.unlockAudio();
      try {
        const audio = this.audioElements.clutch_lock;
        if (audio) {
          audio.currentTime = 0;
          audio.play().catch(() => this.fallbackSynthClutch());
        } else {
          this.fallbackSynthClutch();
        }
      } catch (e) {
        this.fallbackSynthClutch();
      }
    }

    // Haptic Feedback: Trigger navigator.vibrate(120) at exact frame of CLUTCH beat!
    this.triggerClutchHaptic();
  }

  // Haptics: 120ms vibration pulse for CLUTCH lock-in
  triggerClutchHaptic() {
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(120);
      }
    } catch (e) {
      // Ignore if unsupported or restricted
    }
  }

  // Final 2 Stage Summons: Start phone ringtone + continuous buzz sequence
  startStageRingtoneAndBuzz() {
    this.stopStageRingtoneAndBuzz();
    this.unlockAudio();

    if (!this.muted) {
      try {
        const audio = this.audioElements.stage_call_ring;
        if (audio) {
          audio.currentTime = 0;
          audio.play().catch(() => this.startFallbackRingtoneSynth());
        } else {
          this.startFallbackRingtoneSynth();
        }
      } catch (e) {
        this.startFallbackRingtoneSynth();
      }
    }

    // Haptics: Continuous phone buzz sequence navigator.vibrate([400, 200, 400, 1000])
    const executeBuzz = () => {
      try {
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          navigator.vibrate([400, 200, 400, 1000]);
        }
      } catch (e) {
        // Ignore
      }
    };

    executeBuzz();
    this.hapticInterval = setInterval(executeBuzz, 2000);
  }

  // Stop phone ringtone & buzz
  stopStageRingtoneAndBuzz() {
    if (this.hapticInterval) {
      clearInterval(this.hapticInterval);
      this.hapticInterval = null;
    }

    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(0); // Cancel ongoing vibration
      }
    } catch (e) {
      // Ignore
    }

    try {
      const audio = this.audioElements.stage_call_ring;
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    } catch (e) {
      // Ignore
    }

    if (this.ringInterval) {
      clearInterval(this.ringInterval);
      this.ringInterval = null;
    }
  }

  playVictory() {
    if (this.muted) return;
    this.unlockAudio();

    if (!this.ctx) return;
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99];
    notes.forEach((freq, idx) => {
      const now = this.ctx.currentTime + idx * 0.08;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.4);
    });
  }

  playDefeat() {
    if (this.muted) return;
    this.unlockAudio();

    if (!this.ctx) return;
    const notes = [392.00, 369.99, 329.63, 246.94];
    notes.forEach((freq, idx) => {
      const now = this.ctx.currentTime + idx * 0.14;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    });
  }

  playClick() {
    if (this.muted) return;
    this.unlockAudio();

    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.06);
  }

  // Web Audio Synthesizer Fallbacks
  fallbackSynthBeat(beatName) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const freq = beatName === 'SCISSOR' ? 620 : beatName === 'PAPER' ? 380 : 200;
    osc.type = beatName === 'SCISSOR' ? 'sawtooth' : 'sine';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.2);

    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  fallbackSynthClutch() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    [160, 220, 330].forEach((freq) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.4);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.6);
    });
  }

  startFallbackRingtoneSynth() {
    if (!this.ctx) return;
    const ringPattern = () => {
      if (!this.ctx || this.muted) return;
      const now = this.ctx.currentTime;
      [853, 960].forEach((freq) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.setValueAtTime(0.25, now + 1.2);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.3);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 1.35);
      });
    };
    ringPattern();
    this.ringInterval = setInterval(ringPattern, 2400);
  }
}

export const sound = new AudioHapticManager();
