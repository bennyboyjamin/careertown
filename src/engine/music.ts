import { audioCtx } from './sfx';

/**
 * Gentle background music, made by the same tiny synth as the sound effects (no audio files).
 * Each area has its own calm loop; it fades between them and stays quiet under the sound effects.
 */
export type Tune = 'town' | 'home' | 'work' | 'night' | 'none';

// MIDI note numbers. Chords are 4 bars; melody is 8 notes per bar (rests = 0).
const SONGS: Record<Exclude<Tune, 'none'>, { bpm: number; chords: number[][]; melody: number[]; bass: number[]; wave: OscillatorType; vol: number }> = {
  town: { bpm: 92, wave: 'triangle', vol: 1,
    chords: [[60, 64, 67], [57, 60, 64], [53, 57, 60], [55, 59, 62]],
    bass: [48, 45, 41, 43],
    melody: [72, 0, 76, 79, 0, 76, 74, 0,  72, 0, 69, 72, 0, 74, 76, 0,  77, 0, 76, 74, 0, 72, 69, 0,  71, 0, 74, 79, 0, 77, 76, 74] },
  home: { bpm: 70, wave: 'sine', vol: 0.9,
    chords: [[60, 64, 67], [55, 59, 62], [57, 60, 64], [53, 57, 60]],
    bass: [48, 43, 45, 41],
    melody: [76, 0, 0, 74, 72, 0, 0, 0,  74, 0, 0, 71, 67, 0, 0, 0,  72, 0, 0, 76, 74, 0, 72, 0,  69, 0, 0, 72, 71, 0, 0, 0] },
  work: { bpm: 104, wave: 'triangle', vol: 0.85,
    chords: [[62, 65, 69], [60, 64, 67], [58, 62, 65], [60, 64, 67]],
    bass: [50, 48, 46, 48],
    melody: [74, 0, 77, 0, 81, 0, 79, 77,  76, 0, 72, 0, 76, 0, 79, 0,  77, 0, 74, 0, 70, 0, 74, 77,  76, 0, 0, 72, 74, 0, 0, 0] },
  night: { bpm: 60, wave: 'sine', vol: 0.75,
    chords: [[57, 60, 64], [53, 57, 60], [55, 59, 62], [52, 55, 59]],
    bass: [45, 41, 43, 40],
    melody: [76, 0, 0, 0, 72, 0, 0, 0,  74, 0, 0, 0, 69, 0, 0, 0,  71, 0, 0, 0, 67, 0, 0, 0,  72, 0, 0, 0, 0, 0, 0, 0] },
};
const hz = (m: number) => 440 * Math.pow(2, (m - 69) / 12);
const BASE_VOL = 0.05;

let enabled = true;
let current: Tune = 'none';
let master: GainNode | null = null;
let timer = 0;
let step = 0;
let nextAt = 0;

function voice(a: AudioContext, out: AudioNode, freq: number, t: number, dur: number, wave: OscillatorType, vol: number) {
  const o = a.createOscillator(); const g = a.createGain();
  o.type = wave; o.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + Math.min(0.08, dur / 3));
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(out); o.start(t); o.stop(t + dur + 0.05);
}

function schedule() {
  const a = audioCtx(); if (!a || !master || current === 'none') return;
  const song = SONGS[current]; const eighth = 60 / song.bpm / 2;
  if (nextAt < a.currentTime) nextAt = a.currentTime + 0.05;
  while (nextAt < a.currentTime + 0.4) {
    const s = step % 32, bar = Math.floor(s / 8);
    if (s % 8 === 0) {
      song.chords[bar].forEach((m) => voice(a, master!, hz(m), nextAt, eighth * 8, 'sine', 0.22 * song.vol));
      voice(a, master!, hz(song.bass[bar]), nextAt, eighth * 3, 'triangle', 0.5 * song.vol);
    }
    if (s % 8 === 4) voice(a, master!, hz(song.bass[bar] + 7), nextAt, eighth * 3, 'triangle', 0.35 * song.vol);
    const m = song.melody[s];
    if (m) voice(a, master!, hz(m), nextAt, eighth * 1.8, song.wave, 0.45 * song.vol);
    nextAt += eighth; step++;
  }
}

function ensure() {
  const a = audioCtx(); if (!a) return null;
  if (!master) { master = a.createGain(); master.gain.value = 0; master.connect(a.destination); }
  if (!timer) timer = window.setInterval(schedule, 120);
  return a;
}

function fadeTo(v: number, secs = 0.8) {
  const a = audioCtx(); if (!a || !master) return;
  master.gain.cancelScheduledValues(a.currentTime);
  master.gain.setValueAtTime(master.gain.value, a.currentTime);
  master.gain.linearRampToValueAtTime(v, a.currentTime + secs);
}

/** Play an area's tune (fades over from the last one). */
export function playTune(t: Tune) {
  if (t === current) return;
  const a = ensure(); if (!a) return;
  fadeTo(0, 0.4);
  window.setTimeout(() => { current = t; step = 0; nextAt = 0; fadeTo(enabled && t !== 'none' ? BASE_VOL : 0); }, 420);
}
export function setMusicEnabled(on: boolean) {
  enabled = on;
  if (!master) return;
  fadeTo(on && current !== 'none' ? BASE_VOL : 0, 0.5);
}
// iPhone/iPad: pause when the app goes to the background
if (typeof document !== 'undefined') document.addEventListener('visibilitychange', () => { if (master) fadeTo(document.hidden || !enabled ? 0 : BASE_VOL, 0.3); });
