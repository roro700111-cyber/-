/**
 * Web Audio API synthesizer for instant zero-dependency sound effects,
 * plus Web Speech API for English speech synthesis and pronunciation evaluation.
 */

class SoundSynthesizer {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  playPop(): void {
    const ctx = this.getContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.09);
  }

  playClick(): void {
    const ctx = this.getContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(450, now);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.04);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.05);
  }

  playTick(): void {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.04);
  }

  playTimeBonus(): void {
    if (this.muted) return;
    this.playDing();
    setTimeout(() => {
      this.playPointsStream(4);
    }, 100);
  }

  playSuccess(): void {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      gain.gain.setValueAtTime(0, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.25, now + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.26);
    });
  }

  /**
   * Crystal bell "Ding!" sound for instant positive auditory feedback on correct answers and task completion
   */
  playDing(): void {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const bellPartials = [
      { freq: 1046.5, gain: 0.35, decay: 0.85 }, // C6 fundamental
      { freq: 2093.0, gain: 0.28, decay: 0.65 }, // C7 1st harmonic
      { freq: 3136.0, gain: 0.16, decay: 0.45 }, // G7 chime
      { freq: 4186.0, gain: 0.09, decay: 0.3 },  // C8 sparkle
    ];

    bellPartials.forEach((partial) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(partial.freq, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(partial.gain, now + 0.006);
      gain.gain.exponentialRampToValueAtTime(0.0005, now + partial.decay);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + partial.decay + 0.02);
    });
  }

  /**
   * Cheerful two-tone "Ding-Dong!" task completed chime
   */
  playDingDong(): void {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const tones = [
      { freq: 1318.51, time: 0, decay: 0.65 },    // E6
      { freq: 1046.5, time: 0.2, decay: 0.85 },    // C6
    ];

    tones.forEach((tone) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(tone.freq, now + tone.time);

      gain.gain.setValueAtTime(0, now + tone.time);
      gain.gain.linearRampToValueAtTime(0.3, now + tone.time + 0.006);
      gain.gain.exponentialRampToValueAtTime(0.0005, now + tone.time + tone.decay);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + tone.time);
      osc.stop(now + tone.time + tone.decay + 0.02);
    });
  }

  playError(): void {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.linearRampToValueAtTime(120, now + 0.2);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.23);
  }

  playStarCollect(): void {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const freqs = [659.25, 880, 1174.66, 1567.98]; // E5, A5, D6, G6
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.06);
      gain.gain.setValueAtTime(0.2, now + i * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.005, now + i * 0.06 + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.06);
      osc.stop(now + i * 0.06 + 0.31);
    });
  }

  playFanfare(): void {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const sequence = [
      { f: 523.25, t: 0, d: 0.15 },
      { f: 523.25, t: 0.15, d: 0.15 },
      { f: 523.25, t: 0.3, d: 0.15 },
      { f: 659.25, t: 0.45, d: 0.4 },
      { f: 587.33, t: 0.9, d: 0.15 },
      { f: 659.25, t: 1.05, d: 0.15 },
      { f: 783.99, t: 1.25, d: 0.6 },
    ];
    sequence.forEach((item) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(item.f, now + item.t);
      gain.gain.setValueAtTime(0.25, now + item.t);
      gain.gain.exponentialRampToValueAtTime(0.001, now + item.t + item.d);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + item.t);
      osc.stop(now + item.t + item.d + 0.02);
    });
  }

  /**
   * Sound of collecting points/stars in rapid cascading succession
   */
  playPointsStream(count = 5): void {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const basePitches = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98];

    for (let i = 0; i < count; i++) {
      const freq = basePitches[i % basePitches.length] * (1 + Math.floor(i / basePitches.length) * 0.25);
      const startTime = now + i * 0.08;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.22, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.26);
    }
  }

  /**
   * Crowd cheering & clapping applause sound
   */
  playCheer(): void {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Harmonious chord of joy
    const joyChords = [
      { f: 523.25, d: 0.6 }, // C5
      { f: 659.25, d: 0.6 }, // E5
      { f: 783.99, d: 0.7 }, // G5
      { f: 1046.5, d: 0.9 }, // C6
    ];

    joyChords.forEach((chord) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(chord.f, now);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + chord.d);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + chord.d + 0.02);
    });

    // Simulate rhythmic clapping bursts
    const clapTimes = [0.05, 0.18, 0.32, 0.45, 0.58, 0.72, 0.88, 1.05];
    clapTimes.forEach((t) => {
      // White noise buffer for crisp clap
      const bufferSize = ctx.sampleRate * 0.04;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      // Bandpass filter to sound like hands clapping
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1100;
      filter.Q.value = 1.5;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.3, now + t);
      gain.gain.exponentialRampToValueAtTime(0.01, now + t + 0.05);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start(now + t);
      noise.stop(now + t + 0.06);
    });
  }

  /**
   * Ascending Level Up fanfare
   */
  playLevelUp(): void {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const notes = [440, 554.37, 659.25, 880, 1108.73, 1318.51]; // A major arpeggio
    notes.forEach((freq, idx) => {
      const startTime = now + idx * 0.09;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.25, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.42);
    });
  }

  /**
   * Super grand celebration: Crystal Ding + Fanfare + Clapping Cheers + Points Cascade
   */
  playSuperCelebration(): void {
    if (this.muted) return;
    this.playDing();
    setTimeout(() => {
      this.playFanfare();
    }, 120);
    setTimeout(() => {
      this.playCheer();
    }, 500);
    setTimeout(() => {
      this.playPointsStream(6);
    }, 900);
  }

  /**
   * Victory Win celebration for students winning games or completing modules
   */
  playVictoryWin(): void {
    this.playSuperCelebration();
  }

  /**
   * Sound of completing an individual task or earning a star
   */
  playTaskCompleted(): void {
    if (this.muted) return;
    this.playDing();
    setTimeout(() => {
      this.playPointsStream(3);
    }, 150);
  }

  toggleMute(): boolean {
    this.muted = !this.muted;
    return this.muted;
  }

  isMuted(): boolean {
    return this.muted;
  }

  setMuted(mute: boolean): void {
    this.muted = mute;
  }
}

export const sounds = new SoundSynthesizer();

/**
 * Interactive Web Audio Synthesizer for upbeat kids competition music.
 * Generates dynamic, upbeat arcade game-show soundtrack loops with
 * bouncy syncopated bass, upbeat drums, and cheering marimba motifs.
 */
class CompetitionMusicPlayer {
  private ctx: AudioContext | null = null;
  private isRunning: boolean = false;
  private timerId: number | null = null;
  private currentStep: number = 0;
  private masterGain: GainNode | null = null;
  private listeners: Set<(playing: boolean) => void> = new Set();
  private volume: number = 0.22;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  private scheduleStep(step: number, time: number): void {
    const ctx = this.ctx;
    if (!ctx || !this.masterGain) return;

    const bar = Math.floor(step / 16) % 4;
    const stepInBar = step % 16;

    // 1. Kick on steps 0, 8
    if (stepInBar === 0 || stepInBar === 8) {
      const kickOsc = ctx.createOscillator();
      const kickGain = ctx.createGain();
      kickOsc.type = 'sine';
      kickOsc.frequency.setValueAtTime(140, time);
      kickOsc.frequency.exponentialRampToValueAtTime(38, time + 0.12);
      kickGain.gain.setValueAtTime(0.45, time);
      kickGain.gain.exponentialRampToValueAtTime(0.001, time + 0.14);
      kickOsc.connect(kickGain);
      kickGain.connect(this.masterGain);
      kickOsc.start(time);
      kickOsc.stop(time + 0.15);
    }

    // 2. Snare / Clap on steps 4, 12
    if (stepInBar === 4 || stepInBar === 12) {
      const bufSize = Math.floor(ctx.sampleRate * 0.08);
      const noiseBuf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const data = noiseBuf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufSize * 0.3));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuf;
      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 800;
      const snareGain = ctx.createGain();
      snareGain.gain.setValueAtTime(0.3, time);
      snareGain.gain.exponentialRampToValueAtTime(0.001, time + 0.09);
      noise.connect(filter);
      filter.connect(snareGain);
      snareGain.connect(this.masterGain);
      noise.start(time);
      noise.stop(time + 0.1);
    }

    // 3. Shaker / Hi-hat on even 16th steps
    if (stepInBar % 2 === 0) {
      const bufSize = Math.floor(ctx.sampleRate * 0.02);
      const noiseBuf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const data = noiseBuf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuf;
      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 5500;
      const hhGain = ctx.createGain();
      const accent = stepInBar % 4 === 2 ? 0.16 : 0.08;
      hhGain.gain.setValueAtTime(accent, time);
      hhGain.gain.exponentialRampToValueAtTime(0.001, time + 0.03);
      noise.connect(filter);
      filter.connect(hhGain);
      hhGain.connect(this.masterGain);
      noise.start(time);
      noise.stop(time + 0.035);
    }

    // 4. Bouncy Bassline (Progression: C Major -> A Minor -> F Major -> G Major)
    const rootFreqs = [130.81, 110.0, 87.31, 98.0];
    const root = rootFreqs[bar];
    const bassSteps = [0, 3, 6, 8, 11, 14];
    if (bassSteps.includes(stepInBar)) {
      const noteFreq =
        stepInBar === 6 || stepInBar === 14
          ? root * 1.5
          : stepInBar === 11
          ? root * 1.25
          : root;
      const bassOsc = ctx.createOscillator();
      const bassGain = ctx.createGain();
      bassOsc.type = 'triangle';
      bassOsc.frequency.setValueAtTime(noteFreq, time);
      bassGain.gain.setValueAtTime(0.32, time);
      bassGain.gain.exponentialRampToValueAtTime(0.01, time + 0.14);
      bassOsc.connect(bassGain);
      bassGain.connect(this.masterGain);
      bassOsc.start(time);
      bassOsc.stop(time + 0.15);
    }

    // 5. Upbeat Cheerful Lead Melody (bright marimba / chime style)
    const melodyScores: Array<Record<number, number>> = [
      // Bar 0: C Major cheerful fanfare
      { 0: 523.25, 2: 659.25, 4: 783.99, 6: 1046.5, 8: 783.99, 10: 880.0, 12: 1046.5, 14: 1174.66 },
      // Bar 1: A Minor lively variation
      { 0: 880.0, 2: 783.99, 4: 659.25, 6: 880.0, 8: 1046.5, 10: 1174.66, 12: 1318.51, 14: 1046.5 },
      // Bar 2: F Major joyous leap
      { 0: 698.46, 2: 880.0, 4: 1046.5, 6: 1318.51, 8: 1046.5, 10: 880.0, 12: 783.99, 14: 698.46 },
      // Bar 3: G Major triumphant turnaround
      { 0: 783.99, 2: 987.77, 4: 1174.66, 6: 1396.91, 8: 1567.98, 10: 1396.91, 12: 1174.66, 14: 987.77 },
    ];

    const note = melodyScores[bar][stepInBar];
    if (note) {
      const leadOsc = ctx.createOscillator();
      const leadGain = ctx.createGain();
      leadOsc.type = 'sine';
      leadOsc.frequency.setValueAtTime(note, time);

      const overtoneOsc = ctx.createOscillator();
      const overtoneGain = ctx.createGain();
      overtoneOsc.type = 'triangle';
      overtoneOsc.frequency.setValueAtTime(note * 2, time);

      leadGain.gain.setValueAtTime(0.22, time);
      leadGain.gain.exponentialRampToValueAtTime(0.005, time + 0.15);

      overtoneGain.gain.setValueAtTime(0.1, time);
      overtoneGain.gain.exponentialRampToValueAtTime(0.001, time + 0.11);

      leadOsc.connect(leadGain);
      overtoneOsc.connect(overtoneGain);
      leadGain.connect(this.masterGain);
      overtoneGain.connect(this.masterGain);

      leadOsc.start(time);
      overtoneOsc.start(time);
      leadOsc.stop(time + 0.16);
      overtoneOsc.stop(time + 0.16);
    }
  }

  start(): void {
    if (this.isRunning) return;
    const ctx = this.getContext();
    if (!ctx) return;

    this.isRunning = true;
    this.masterGain = ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.001, ctx.currentTime);
    this.masterGain.gain.linearRampToValueAtTime(this.volume, ctx.currentTime + 0.3);
    this.masterGain.connect(ctx.destination);

    const stepIntervalMs = 118; // ~127 BPM 16th note
    this.currentStep = 0;

    let nextStepTime = ctx.currentTime + 0.05;

    const tick = () => {
      if (!this.isRunning) return;
      const now = ctx.currentTime;
      while (nextStepTime < now + 0.25) {
        this.scheduleStep(this.currentStep, nextStepTime);
        nextStepTime += stepIntervalMs / 1000;
        this.currentStep = (this.currentStep + 1) % 64;
      }
      this.timerId = window.setTimeout(tick, 35);
    };

    tick();
    this.notify();
  }

  stop(): void {
    if (!this.isRunning) return;
    this.isRunning = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    if (this.masterGain && this.ctx) {
      try {
        const now = this.ctx.currentTime;
        this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
        this.masterGain.gain.linearRampToValueAtTime(0.001, now + 0.2);
      } catch {
        // ignore
      }
    }
    this.notify();
  }

  toggle(): boolean {
    if (this.isRunning) {
      this.stop();
    } else {
      this.start();
    }
    return this.isRunning;
  }

  isPlaying(): boolean {
    return this.isRunning;
  }

  subscribe(callback: (playing: boolean) => void): () => void {
    this.listeners.add(callback);
    callback(this.isRunning);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notify(): void {
    this.listeners.forEach((cb) => cb(this.isRunning));
  }
}

export const competitionMusic = new CompetitionMusicPlayer();


/**
 * Known female voice indicators across Windows, macOS, iOS, Android, and Linux browsers
 */
const FEMALE_VOICE_KEYWORDS = [
  'female',
  'woman',
  'girl',
  'samantha', // macOS / iOS default female
  'victoria', // macOS
  'karen', // macOS / iOS (AU)
  'serena', // macOS / iOS (UK)
  'moira', // macOS (IE)
  'fiona', // macOS (Scotland)
  'tessa', // macOS (ZA)
  'ava', // iOS / macOS
  'allison', // macOS
  'susan', // Windows / macOS
  'zira', // Windows Microsoft Zira (Female)
  'jenny', // Windows Microsoft Jenny (Natural Female)
  'aria', // Windows Microsoft Aria (Natural Female)
  'hazel', // Windows Microsoft Hazel (UK Female)
  'libby', // Windows Microsoft Libby (UK Female)
  'sonia', // Windows Microsoft Sonia (UK Female)
  'michelle', // Windows Microsoft Michelle
  'clara',
  'stephanie',
  'google uk english female',
  'google us english female',
];

const MALE_VOICE_EXCLUSIONS = [
  'male',
  'man',
  'boy',
  'david', // Microsoft David (Male)
  'mark', // Microsoft Mark (Male)
  'george', // Microsoft George (Male)
  'alex', // macOS Alex (Male)
  'fred', // macOS Fred (Male)
  'daniel', // macOS Daniel (Male)
  'oliver', // macOS Oliver (Male)
  'tom', // macOS Tom (Male)
  'guy', // Microsoft Guy (Male)
  'ryan', // Microsoft Ryan (Male)
  'steffan', // Microsoft Steffan (Male)
  'brian',
  'james',
  'paul',
  'john',
  'google us english', // Default "Google US English" is a male voice
];

/**
 * Accurately selects a warm, friendly female English voice (Teacher Rona)
 */
export function getBestFemaleEnglishVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  // Filter English voices first
  const englishVoices = voices.filter(
    (v) => v.lang.startsWith('en') || v.lang.startsWith('EN')
  );
  const pool = englishVoices.length > 0 ? englishVoices : voices;

  // 1. High priority: renowned natural female voices
  const topFemaleVoices = [
    'microsoft jenny',
    'microsoft aria',
    'google uk english female',
    'samantha',
    'victoria',
    'microsoft zira',
    'karen',
    'serena',
    'ava',
    'hazel',
    'libby',
    'sonia',
  ];

  for (const preferred of topFemaleVoices) {
    const match = pool.find((v) => v.name.toLowerCase().includes(preferred));
    if (match) return match;
  }

  // 2. Any voice matching female keywords without male exclusions
  const femaleVoice = pool.find((v) => {
    const name = v.name.toLowerCase();
    const isExcluded = MALE_VOICE_EXCLUSIONS.some((male) => name.includes(male));
    if (isExcluded) return false;
    return FEMALE_VOICE_KEYWORDS.some((fem) => name.includes(fem));
  });
  if (femaleVoice) return femaleVoice;

  // 3. Any English voice not in male exclusion list
  const nonMaleVoice = pool.find((v) => {
    const name = v.name.toLowerCase();
    return !MALE_VOICE_EXCLUSIONS.some((male) => name.includes(male));
  });
  if (nonMaleVoice) return nonMaleVoice;

  // 4. Fallback
  return pool[0] || null;
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices();
  };
}

/**
 * Text-to-Speech using standard browser SpeechSynthesis configured with a friendly female teacher voice
 */
export function speakEnglish(text: string, slow: boolean = false): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      resolve();
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    // Friendly, clear pedagogical pacing for children
    utterance.rate = slow ? 0.75 : 0.92;
    // Pleasant, cheerful, distinctly female pitch
    utterance.pitch = 1.25;
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();

    const femaleVoice = getBestFemaleEnglishVoice();
    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }

    window.speechSynthesis.speak(utterance);
  });
}

/**
 * Speech Recognition Helper for Pronunciation Practice
 */
/**
 * Advanced Speech Recognition Helper for Accurate Pronunciation Practice
 */
export interface SpeechRecognitionResult {
  transcript: string;
  text: string;
  isMatch: boolean;
  score: number; // 0 to 100
  feedbackArabic: string;
  feedbackEnglish: string;
  error?: string;
  accuracyTier?: 'perfect' | 'great' | 'good' | 'try_again' | 'no_speech';
}

// Clean and normalize text for pronunciation matching
function cleanSpeechText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'!]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Number & common homophone mappings for English kids vocabulary
const PHONETIC_EQUIVALENTS: Record<string, string[]> = {
  '1': ['one', 'won'],
  'one': ['1', 'won'],
  '2': ['two', 'to', 'too'],
  'two': ['2', 'to', 'too'],
  'to': ['two', 'too', '2'],
  'too': ['two', 'to', '2'],
  '3': ['three'],
  'three': ['3'],
  '4': ['four', 'for', 'fore'],
  'four': ['4', 'for', 'fore'],
  'for': ['four', '4', 'fore'],
  '5': ['five'],
  'five': ['5'],
  '6': ['six'],
  'six': ['6'],
  '7': ['seven'],
  'seven': ['7'],
  '8': ['eight', 'ate'],
  'eight': ['8', 'ate'],
  'ate': ['eight', '8'],
  '9': ['nine'],
  'nine': ['9'],
  '10': ['ten'],
  'ten': ['10'],
  'red': ['read'],
  'blue': ['blew'],
  'sun': ['son'],
  'sea': ['see'],
  'see': ['sea'],
  'hear': ['here'],
  'here': ['hear'],
  'write': ['right'],
  'right': ['write'],
  'flour': ['flower'],
  'flower': ['flour'],
};

// Levenshtein distance for string similarity calculation
function computeLevenshtein(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

// Compute word similarity between 0 and 1
function calculateSimilarity(target: string, spoken: string): number {
  const t = cleanSpeechText(target);
  const s = cleanSpeechText(spoken);

  if (t === s) return 1.0;
  if (!s || !t) return 0.0;

  // Check homophones / equivalents
  if (PHONETIC_EQUIVALENTS[t]?.includes(s) || PHONETIC_EQUIVALENTS[s]?.includes(t)) {
    return 1.0;
  }

  // Token check (if child said "it's an apple" or "a dog" or "the cat")
  const tokens = s.split(' ').filter(Boolean);
  for (const token of tokens) {
    if (token === t || PHONETIC_EQUIVALENTS[t]?.includes(token)) {
      return 1.0;
    }
    const dist = computeLevenshtein(t, token);
    const maxLen = Math.max(t.length, token.length);
    const tokenSim = Math.max(0, 1 - dist / maxLen);
    if (tokenSim >= 0.85) {
      return tokenSim;
    }
  }

  // Phrase level distance
  const distance = computeLevenshtein(t, s);
  const maxLen = Math.max(t.length, s.length);
  return Math.max(0, 1 - distance / maxLen);
}

export function listenPronunciation(
  targetWord: string,
  onInterim?: (interim: string) => void,
  onVolumeChange?: (volume: number) => void
): Promise<SpeechRecognitionResult> {
  return new Promise(async (resolve) => {
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition: any; webkitSpeechRecognition: any }).SpeechRecognition ||
      (window as unknown as { SpeechRecognition: any; webkitSpeechRecognition: any }).webkitSpeechRecognition;

    const cleanedTarget = cleanSpeechText(targetWord);
    let micStream: MediaStream | null = null;
    let audioCtx: AudioContext | null = null;
    let animFrame: number | null = null;

    // Start Live Mic Volume Meter if supported
    if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia && onVolumeChange) {
      try {
        micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioContextClass) {
          audioCtx = new AudioContextClass();
          const source = audioCtx.createMediaStreamSource(micStream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 128;
          source.connect(analyser);

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const pollVolume = () => {
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const avg = sum / dataArray.length;
            const volumePercent = Math.min(100, Math.round((avg / 90) * 100));
            onVolumeChange(volumePercent);
            animFrame = requestAnimationFrame(pollVolume);
          };
          pollVolume();
        }
      } catch (err) {
        // user denied mic or in sandbox
        console.warn('Microphone stream error:', err);
      }
    }

    const cleanupAudio = () => {
      if (animFrame) cancelAnimationFrame(animFrame);
      if (audioCtx && audioCtx.state !== 'closed') {
        try { audioCtx.close(); } catch { /* ignore */ }
      }
      if (micStream) {
        micStream.getTracks().forEach((track) => track.stop());
      }
      if (onVolumeChange) onVolumeChange(0);
    };

    if (!SpeechRecognition) {
      cleanupAudio();
      // Informative response when browser has no Web Speech Recognition API
      resolve({
        transcript: '',
        text: '',
        isMatch: false,
        score: 0,
        error: 'no-speech-recognition',
        feedbackArabic: 'متصفحك لا يدعم ميزة التعرف على الصوت المباشر (Web Speech API). ننصح باستخدام متصفح Google Chrome أو Microsoft Edge.',
        feedbackEnglish: 'Speech Recognition is not supported on this browser. Please use Chrome or Edge.',
        accuracyTier: 'no_speech',
      });
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = true;
      recognition.continuous = false;
      recognition.maxAlternatives = 5;

      const recognizedCandidates: string[] = [];
      let finalTranscript = '';
      let hasReceivedAudio = false;

      recognition.onresult = (event: any) => {
        hasReceivedAudio = true;
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          for (let j = 0; j < result.length; j++) {
            const transcript = cleanSpeechText(result[j].transcript);
            if (transcript && !recognizedCandidates.includes(transcript)) {
              recognizedCandidates.push(transcript);
            }
          }
          if (result[0]?.transcript) {
            finalTranscript = cleanSpeechText(result[0].transcript);
            if (onInterim) {
              onInterim(result[0].transcript);
            }
          }
        }
      };

      recognition.onerror = (event: any) => {
        cleanupAudio();
        const errType = event?.error || 'unknown';
        console.warn('SpeechRecognition error:', errType);

        if (errType === 'no-speech') {
          resolve({
            transcript: '',
            text: '',
            isMatch: false,
            score: 0,
            error: 'no-speech',
            feedbackArabic: 'لم يتم سماع أي صوت واضح عبر الميكروفون. يرجى الاقتراب والتحدث بوضوح!',
            feedbackEnglish: 'No speech was detected. Please speak closer to the microphone.',
            accuracyTier: 'no_speech',
          });
        } else if (errType === 'not-allowed' || errType === 'service-not-allowed') {
          resolve({
            transcript: '',
            text: '',
            isMatch: false,
            score: 0,
            error: 'not-allowed',
            feedbackArabic: 'تم رفض إذن الوصول إلى الميكروفون. يرجى السماح للمتصفح باستخدام الميكروفون للتدريب.',
            feedbackEnglish: 'Microphone permission denied. Please allow microphone access.',
            accuracyTier: 'no_speech',
          });
        } else {
          // If we already collected candidates before error
          if (recognizedCandidates.length > 0) {
            evaluateAndResolve();
          } else {
            resolve({
              transcript: '',
              text: '',
              isMatch: false,
              score: 0,
              error: errType,
              feedbackArabic: 'تعذر التقاط الصوت، اضغط على زر الميكروفون وحاول مرة أخرى 🎙️',
              feedbackEnglish: 'Could not capture audio, please try again.',
              accuracyTier: 'no_speech',
            });
          }
        }
      };

      const evaluateAndResolve = () => {
        cleanupAudio();

        if (recognizedCandidates.length === 0 && !finalTranscript) {
          resolve({
            transcript: '',
            text: '',
            isMatch: false,
            score: 0,
            feedbackArabic: 'لم يتم التقاط صوت واضح. تحدث بوضوح بالإنجليزية!',
            feedbackEnglish: 'No clear speech detected. Speak clearly in English!',
            accuracyTier: 'no_speech',
          });
          return;
        }

        // Test all candidate alternatives to find best similarity to target
        let bestScore = 0;
        let bestTranscript = finalTranscript || recognizedCandidates[0] || '';

        const allCandidates = [finalTranscript, ...recognizedCandidates].filter(Boolean);
        for (const candidate of allCandidates) {
          const sim = calculateSimilarity(cleanedTarget, candidate);
          const score = Math.round(sim * 100);
          if (score > bestScore) {
            bestScore = score;
            bestTranscript = candidate;
          }
        }

        let isMatch = false;
        let accuracyTier: 'perfect' | 'great' | 'good' | 'try_again' | 'no_speech' = 'try_again';
        let feedbackArabic = '';
        let feedbackEnglish = '';

        if (bestScore >= 92) {
          isMatch = true;
          accuracyTier = 'perfect';
          feedbackArabic = `نطق مثالي ورائع جداً 100%! مخارج الحروف ممتازة يا بطل! 🌟`;
          feedbackEnglish = `Outstanding pronunciation! Perfect phonics and clarity!`;
        } else if (bestScore >= 80) {
          isMatch = true;
          accuracyTier = 'great';
          feedbackArabic = `نطق ممتاز وقريب جداً بنسبة ${bestScore}%! أحسنت صنعاً 👏`;
          feedbackEnglish = `Great pronunciation (${bestScore}%)! Keep it up!`;
        } else if (bestScore >= 65) {
          isMatch = true;
          accuracyTier = 'good';
          feedbackArabic = `نطق جيد بنسبة ${bestScore}%. تدرب مرة أخرى لتصل إلى الإتقان الكامل 👍`;
          feedbackEnglish = `Good attempt (${bestScore}%)! Practice one more time to master it!`;
        } else {
          isMatch = false;
          accuracyTier = 'try_again';
          feedbackArabic = `سمعنا: "${bestTranscript}" بينما الكلمة المطلوبة هي "${targetWord}". استمع لنطق المعلمة وحاول مرة أخرى 🔁`;
          feedbackEnglish = `We heard: "${bestTranscript}", but the target is "${targetWord}". Listen and try again!`;
        }

        resolve({
          transcript: bestTranscript,
          text: bestTranscript,
          isMatch,
          score: bestScore,
          feedbackArabic,
          feedbackEnglish,
          accuracyTier,
        });
      };

      recognition.onend = () => {
        evaluateAndResolve();
      };

      recognition.start();

      // Safe stop after 5.5 seconds if user stays silent
      setTimeout(() => {
        try {
          recognition.stop();
        } catch {
          // ignore
        }
      }, 5500);
    } catch (e) {
      cleanupAudio();
      resolve({
        transcript: '',
        text: '',
        isMatch: false,
        score: 0,
        error: 'start-failed',
        feedbackArabic: 'حدث خطأ في بدء الميكروفون. تأكد من تفعيل إذن الميكروفون.',
        feedbackEnglish: 'Failed to start microphone. Please check permissions.',
        accuracyTier: 'no_speech',
      });
    }
  });
}


/**
 * Play audio from custom recorded base64 data URL
 */
export function playAudioDataUrl(url: string, slow: boolean = false): Promise<void> {
  return new Promise((resolve) => {
    try {
      const audio = new Audio(url);
      if (slow) audio.playbackRate = 0.8;
      audio.onended = () => resolve();
      audio.onerror = () => resolve();
      audio.play().catch(() => resolve());
    } catch {
      resolve();
    }
  });
}

/**
 * Plays custom recorded pronunciation if available, or falls back to English SpeechSynthesis
 */
export function playWordAudio(
  word: { english: string; customAudioUrl?: string },
  slow: boolean = false
): Promise<void> {
  if (word.customAudioUrl) {
    return playAudioDataUrl(word.customAudioUrl, slow);
  }
  return speakEnglish(word.english, slow);
}

/**
 * Speaks an encouraging cheerful praise for kids
 */
export function playEncouragementPraise(customText?: string): Promise<void> {
  const praises = [
    'Awesome job! You are a superstar!',
    'Brilliant work! Keep it up!',
    'Fantastic! You did it!',
    'Super champion of English!',
    'Outstanding pronunciation and listening!',
  ];
  const text = customText || praises[Math.floor(Math.random() * praises.length)];
  return speakEnglish(text);
}


