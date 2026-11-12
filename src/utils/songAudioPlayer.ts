/**
 * Audio Synthesizer and Interactive Song Player for Children's Educational Songs.
 * Produces dynamic Web Audio instrumental accompaniment loops synchronized with
 * Web Speech API vocals and interactive lyrics timing.
 */

import { EducationalSong, SongLyricLine } from '../types';
import { sounds, getBestFemaleEnglishVoice } from './audio';

export type SongPlayerState = 'idle' | 'playing' | 'paused' | 'completed';

export interface SongPlayerUpdate {
  state: SongPlayerState;
  currentTime: number;
  currentLineIndex: number;
  isLooping: boolean;
  playbackSpeed: number;
}

class SongAudioPlayer {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private currentSong: EducationalSong | null = null;
  private state: SongPlayerState = 'idle';
  private currentTime: number = 0;
  private currentLineIndex: number = 0;
  private isLooping: boolean = true;
  private playbackSpeed: number = 1.0; // 0.8, 1.0, 1.2

  private animationFrameId: number | null = null;
  private beatIntervalId: number | null = null;
  private lastTimestamp: number = 0;

  private listeners: Set<(update: SongPlayerUpdate) => void> = new Set();
  private lastSpokenLineId: string | null = null;

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

  public subscribe(cb: (update: SongPlayerUpdate) => void): () => void {
    this.listeners.add(cb);
    this.emit();
    return () => this.listeners.delete(cb);
  }

  private emit(): void {
    const update: SongPlayerUpdate = {
      state: this.state,
      currentTime: this.currentTime,
      currentLineIndex: this.currentLineIndex,
      isLooping: this.isLooping,
      playbackSpeed: this.playbackSpeed,
    };
    this.listeners.forEach((cb) => cb(update));
  }

  public play(song: EducationalSong, loop: boolean = true): void {
    const ctx = this.getContext();
    if (!ctx) return;

    if (this.currentSong?.id !== song.id) {
      this.currentSong = song;
      this.currentTime = 0;
      this.currentLineIndex = 0;
      this.lastSpokenLineId = null;
    }

    this.isLooping = loop;
    this.state = 'playing';

    if (!this.masterGain) {
      this.masterGain = ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.24, ctx.currentTime);
      this.masterGain.connect(ctx.destination);
    }

    this.startRhythm(song);
    this.lastTimestamp = performance.now();
    this.loopTick();

    // Trigger vocal singing for current line
    this.speakCurrentLine();
    this.emit();
  }

  public pause(): void {
    this.state = 'paused';
    this.stopRhythm();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.pause();
    }
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.emit();
  }

  public resume(): void {
    if (!this.currentSong) return;
    this.state = 'playing';
    this.getContext();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.resume();
    }
    this.startRhythm(this.currentSong);
    this.lastTimestamp = performance.now();
    this.loopTick();
    this.emit();
  }

  public stop(): void {
    this.state = 'idle';
    this.currentTime = 0;
    this.currentLineIndex = 0;
    this.lastSpokenLineId = null;
    this.stopRhythm();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.emit();
  }

  public toggleLoop(): boolean {
    this.isLooping = !this.isLooping;
    this.emit();
    return this.isLooping;
  }

  public setLoop(loop: boolean): void {
    this.isLooping = loop;
    this.emit();
  }

  public setSpeed(speed: number): void {
    this.playbackSpeed = speed;
    if (this.state === 'playing' && this.currentSong) {
      this.startRhythm(this.currentSong);
    }
    this.emit();
  }

  public jumpToLine(index: number): void {
    if (!this.currentSong) return;
    const line = this.currentSong.lyrics[index];
    if (line) {
      this.currentTime = line.startTime;
      this.currentLineIndex = index;
      this.lastSpokenLineId = null;
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      this.speakCurrentLine();
      this.emit();
    }
  }

  private loopTick = (): void => {
    if (this.state !== 'playing' || !this.currentSong) return;

    const now = performance.now();
    const deltaSeconds = ((now - this.lastTimestamp) / 1000) * this.playbackSpeed;
    this.lastTimestamp = now;

    this.currentTime += deltaSeconds;

    // Check lyrics line advancement
    const lyrics = this.currentSong.lyrics;
    const activeIndex = lyrics.findIndex(
      (line) => this.currentTime >= line.startTime && this.currentTime < line.endTime
    );

    if (activeIndex !== -1 && activeIndex !== this.currentLineIndex) {
      this.currentLineIndex = activeIndex;
      this.speakCurrentLine();
    }

    // Check end of song
    if (this.currentTime >= this.currentSong.durationSeconds) {
      if (this.isLooping) {
        // Smooth loop back to beginning
        this.currentTime = 0;
        this.currentLineIndex = 0;
        this.lastSpokenLineId = null;
        sounds.playDing();
        this.speakCurrentLine();
      } else {
        // Song completed
        this.state = 'completed';
        this.stopRhythm();
        sounds.playVictoryWin();
        this.emit();
        return;
      }
    }

    this.emit();
    this.animationFrameId = requestAnimationFrame(this.loopTick);
  };

  private speakCurrentLine(): void {
    if (!this.currentSong || this.state !== 'playing') return;
    const currentLine = this.currentSong.lyrics[this.currentLineIndex];
    if (!currentLine || currentLine.id === this.lastSpokenLineId) return;

    this.lastSpokenLineId = currentLine.id;

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(currentLine.textEnglish);
    utterance.lang = 'en-US';
    // Slightly higher pitch and friendly singing tempo
    utterance.rate = 0.95 * this.playbackSpeed;
    utterance.pitch = 1.25;

    const femaleVoice = getBestFemaleEnglishVoice();
    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }

    window.speechSynthesis.speak(utterance);
  }

  // Musical accompaniment synthesizer
  private startRhythm(song: EducationalSong): void {
    this.stopRhythm();
    const ctx = this.getContext();
    if (!ctx || !this.masterGain) return;

    const intervalMs = (60 / (song.bpm * this.playbackSpeed)) * 500; // 8th note
    let step = 0;

    const playStepSound = () => {
      if (this.state !== 'playing' || !this.ctx || !this.masterGain) return;
      const time = this.ctx.currentTime;

      // 1. Kick on steps 0, 4
      if (step % 4 === 0) {
        const kickOsc = this.ctx.createOscillator();
        const kickGain = this.ctx.createGain();
        kickOsc.frequency.setValueAtTime(130, time);
        kickOsc.frequency.exponentialRampToValueAtTime(42, time + 0.1);
        kickGain.gain.setValueAtTime(0.35, time);
        kickGain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);
        kickOsc.connect(kickGain);
        kickGain.connect(this.masterGain);
        kickOsc.start(time);
        kickOsc.stop(time + 0.13);
      }

      // 2. Snare / Claps on steps 2, 6
      if (step % 4 === 2) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, time);
        gain.gain.setValueAtTime(0.2, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(time);
        osc.stop(time + 0.09);
      }

      // 3. Cheerful melodic marimba / bell notes
      const scaleNotes = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5]; // C D E G A C
      const noteFreq = scaleNotes[step % scaleNotes.length];

      if (step % 2 === 0) {
        const bellOsc = this.ctx.createOscillator();
        const bellGain = this.ctx.createGain();
        bellOsc.type = 'sine';
        bellOsc.frequency.setValueAtTime(noteFreq, time);
        bellGain.gain.setValueAtTime(0.18, time);
        bellGain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);
        bellOsc.connect(bellGain);
        bellGain.connect(this.masterGain);
        bellOsc.start(time);
        bellOsc.stop(time + 0.2);
      }

      step = (step + 1) % 16;
    };

    this.beatIntervalId = window.setInterval(playStepSound, intervalMs);
  }

  private stopRhythm(): void {
    if (this.beatIntervalId) {
      clearInterval(this.beatIntervalId);
      this.beatIntervalId = null;
    }
  }
}

export const songPlayer = new SongAudioPlayer();
