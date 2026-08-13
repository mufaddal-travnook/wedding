'use client';

import { createContext, useContext, useRef, useCallback, useEffect, type ReactNode } from 'react';
import { useJourney } from '@/app/lib/hooks/useJourneyState';

// ============================================================
// Procedural audio — all Web Audio API, zero external files.
// Engine, wind, per-zone generative BGM, SFX.
// ============================================================

interface AudioAPI {
  init: () => void;
  carStart: () => void;
  carDrive: (speed: number) => void;
  carStop: () => void;
  chime: (base?: number) => void;
  fireworkBoom: () => void;
  setZone: (id: string) => void;
  setMasterGain: (on: boolean) => void;
}

const AudioContext_ = createContext<AudioAPI | null>(null);
export const useAudio = () => useContext(AudioContext_);

// Noise buffer generator
function makeNoise(ctx: AudioContext): AudioBuffer {
  const len = ctx.sampleRate * 2;
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  return buf;
}

// Scales per zone
const SCALES: Record<string, number[]> = {
  entrance: [392, 440, 494, 587, 659, 784],
  nikah: [349.2, 392, 440, 523.3, 587.3, 698.5],
  mehendi: [329.6, 370, 415.3, 493.9, 554.4, 659.3],
  reception: [293.7, 349.2, 392, 440, 523.3, 587.3],
};
const CHORDS: Record<string, number[][]> = {
  entrance: [[392, 494, 587], [440, 523.3, 659]],
  nikah: [[349.2, 440, 523.3], [293.7, 392, 587.3]],
  mehendi: [[329.6, 415.3, 493.9], [370, 554.4, 659.3]],
  reception: [[293.7, 349.2, 440], [261.6, 392, 523.3]],
};
const BPM: Record<string, number> = { entrance: 76, nikah: 66, mehendi: 104, reception: 118 };

export function AudioProvider({ children }: { children: ReactNode }) {
  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const sfxRef = useRef<GainNode | null>(null);
  const musicRef = useRef<GainNode | null>(null);
  const noiseRef = useRef<AudioBuffer | null>(null);
  const engineGainRef = useRef<GainNode | null>(null);
  const engineOsc1Ref = useRef<OscillatorNode | null>(null);
  const engineOsc2Ref = useRef<OscillatorNode | null>(null);
  const engineFilterRef = useRef<BiquadFilterNode | null>(null);
  const windGainRef = useRef<GainNode | null>(null);
  const zoneGainsRef = useRef<Record<string, GainNode>>({});
  const seqTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const seqStepRef = useRef(0);
  const currentZoneRef = useRef('entrance');
  const initializedRef = useRef(false);

  // Pluck helper
  const pluck = useCallback((freq: number, when: number, dest: GainNode, vol = 0.12, dur = 0.5) => {
    const ctx = ctxRef.current!;
    const o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, when);
    g.gain.linearRampToValueAtTime(vol, when + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    o.connect(g); g.connect(dest);
    o.start(when); o.stop(when + dur + 0.05);
  }, []);

  // Pad helper
  const pad = useCallback((freqs: number[], when: number, dest: GainNode, vol = 0.045, dur = 3.4) => {
    const ctx = ctxRef.current!;
    freqs.forEach((fr) => {
      [0, 0.4].forEach((det) => {
        const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = fr * (1 + det * 0.0015);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, when);
        g.gain.linearRampToValueAtTime(vol, when + 1.1);
        g.gain.linearRampToValueAtTime(0, when + dur);
        o.connect(g); g.connect(dest);
        o.start(when); o.stop(when + dur + 0.1);
      });
    });
  }, []);

  // Bell helper
  const bell = useCallback((freq: number, when: number, dest: GainNode, vol = 0.08) => {
    const ctx = ctxRef.current!;
    const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = freq;
    const o2 = ctx.createOscillator(); o2.type = 'sine'; o2.frequency.value = freq * 2.76;
    const g = ctx.createGain(); const g2 = ctx.createGain();
    g.gain.setValueAtTime(vol, when); g.gain.exponentialRampToValueAtTime(0.0001, when + 1.8);
    g2.gain.setValueAtTime(vol * 0.25, when); g2.gain.exponentialRampToValueAtTime(0.0001, when + 0.9);
    o.connect(g); o2.connect(g2); g.connect(dest); g2.connect(dest);
    o.start(when); o.stop(when + 2); o2.start(when); o2.stop(when + 1);
  }, []);

  // Kick helper
  const kick = useCallback((when: number, dest: GainNode, vol = 0.3) => {
    const ctx = ctxRef.current!;
    const o = ctx.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(130, when);
    o.frequency.exponentialRampToValueAtTime(42, when + 0.14);
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, when);
    g.gain.exponentialRampToValueAtTime(0.0001, when + 0.22);
    o.connect(g); g.connect(dest);
    o.start(when); o.stop(when + 0.25);
  }, []);

  // Tick helper
  const tick = useCallback((when: number, dest: GainNode, vol = 0.06, hp = 5000) => {
    const ctx = ctxRef.current!;
    const src = ctx.createBufferSource(); src.buffer = noiseRef.current!;
    const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = hp;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, when);
    g.gain.exponentialRampToValueAtTime(0.0001, when + 0.07);
    src.connect(f); f.connect(g); g.connect(dest);
    src.start(when); src.stop(when + 0.1);
  }, []);

  const init = useCallback(() => {
    if (initializedRef.current) return;
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AC();
    ctxRef.current = ctx;

    const master = ctx.createGain(); master.gain.value = 0.9; master.connect(ctx.destination);
    masterRef.current = master;

    const sfx = ctx.createGain(); sfx.gain.value = 1; sfx.connect(master);
    sfxRef.current = sfx;

    const music = ctx.createGain(); music.gain.value = 0.55; music.connect(master);
    musicRef.current = music;

    noiseRef.current = makeNoise(ctx);

    // Zone gains
    ['entrance', 'nikah', 'mehendi', 'reception'].forEach((id) => {
      const g = ctx.createGain(); g.gain.value = 0; g.connect(music);
      zoneGainsRef.current[id] = g;
    });

    // Wind
    const windSrc = ctx.createBufferSource(); windSrc.buffer = noiseRef.current; windSrc.loop = true;
    const windF = ctx.createBiquadFilter(); windF.type = 'lowpass'; windF.frequency.value = 320; windF.Q.value = 0.4;
    const windG = ctx.createGain(); windG.gain.value = 0.028;
    windSrc.connect(windF); windF.connect(windG); windG.connect(sfx);
    windSrc.start();
    windGainRef.current = windG;
    // LFO gusting
    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.08;
    const lg = ctx.createGain(); lg.gain.value = 0.012;
    lfo.connect(lg); lg.connect(windG.gain); lfo.start();

    // Engine
    const eo1 = ctx.createOscillator(); eo1.type = 'sawtooth'; eo1.frequency.value = 46;
    const eo2 = ctx.createOscillator(); eo2.type = 'square'; eo2.frequency.value = 92;
    const enSrc = ctx.createBufferSource(); enSrc.buffer = noiseRef.current; enSrc.loop = true;
    const enF = ctx.createBiquadFilter(); enF.type = 'bandpass'; enF.frequency.value = 140; enF.Q.value = 1.2;
    const enLp = ctx.createBiquadFilter(); enLp.type = 'lowpass'; enLp.frequency.value = 420;
    const enG = ctx.createGain(); enG.gain.value = 0;
    eo1.connect(enLp); eo2.connect(enLp); enSrc.connect(enF); enF.connect(enLp);
    enLp.connect(enG); enG.connect(sfx);
    eo1.start(); eo2.start(); enSrc.start();
    engineGainRef.current = enG;
    engineOsc1Ref.current = eo1;
    engineOsc2Ref.current = eo2;
    engineFilterRef.current = enLp;

    // Sequencer
    let nextT = ctx.currentTime + 0.1;
    seqStepRef.current = 0;
    seqTimerRef.current = setInterval(() => {
      if (!ctxRef.current) return;
      const zone = currentZoneRef.current;
      const bpm = BPM[zone] || 80;
      const spb = 60 / bpm / 2;
      while (nextT < ctx.currentTime + 0.35) {
        const s = seqStepRef.current;
        const dest = zoneGainsRef.current[zone];
        if (dest) {
          const sc = SCALES[zone] || SCALES.entrance;
          const ch = CHORDS[zone] || CHORDS.entrance;
          if (zone === 'entrance') {
            if (s % 16 === 0) pad(ch[(s / 16) % 2], nextT, dest);
            if (s % 4 === 0 && Math.random() < 0.7) bell(sc[Math.floor(Math.random() * sc.length)], nextT, dest, 0.05);
          } else if (zone === 'nikah') {
            if (s % 16 === 0) pad(ch[(s / 16) % 2], nextT, dest, 0.055, 4.2);
            if (s % 8 === 4) bell(sc[Math.floor(Math.random() * 3) + 2], nextT, dest, 0.05);
            if (s % 2 === 0 && Math.random() < 0.35) pluck(sc[Math.floor(Math.random() * sc.length)] * 2, nextT, dest, 0.05, 0.8);
          } else if (zone === 'mehendi') {
            if (s % 8 === 0) kick(nextT, dest, 0.22);
            if (s % 8 === 4) { kick(nextT, dest, 0.14); tick(nextT, dest, 0.07, 6500); }
            if (s % 2 === 1) tick(nextT, dest, 0.045, 8000);
            const mel = [0, 2, 4, 3, 5, 4, 2, 1];
            if (s % 2 === 0) pluck(sc[mel[(s / 2) % 8]], nextT, dest, 0.1, 0.4);
            if (s % 16 === 0) pad(ch[(s / 16) % 2], nextT, dest, 0.03, 2.4);
          } else if (zone === 'reception') {
            if (s % 4 === 0) kick(nextT, dest, 0.3);
            if (s % 8 === 4) tick(nextT, dest, 0.12, 3200);
            if (s % 2 === 1) tick(nextT, dest, 0.05, 9000);
            if (s % 4 === 2) pluck(sc[0] / 2, nextT, dest, 0.13, 0.3);
            const mel2 = [5, 4, 2, 4, 5, 4, 2, 0];
            if (s % 2 === 0 && (s % 32) < 24) pluck(sc[mel2[(s / 2) % 8]] * 2, nextT, dest, 0.07, 0.35);
            if (s % 16 === 0) pad(ch[(s / 16) % 2], nextT, dest, 0.035, 2.6);
          }
        }
        nextT += spb;
        seqStepRef.current++;
      }
    }, 120);

    initializedRef.current = true;
  }, [pluck, pad, bell, kick, tick]);

  const api: AudioAPI = {
    init,
    carStart: () => {
      const ctx = ctxRef.current; const eg = engineGainRef.current;
      const o1 = engineOsc1Ref.current; const o2 = engineOsc2Ref.current;
      if (!ctx || !eg || !o1 || !o2) return;
      const t = ctx.currentTime;
      eg.gain.cancelScheduledValues(t);
      eg.gain.setValueAtTime(0.001, t);
      eg.gain.exponentialRampToValueAtTime(0.14, t + 0.25);
      o1.frequency.setValueAtTime(30, t); o1.frequency.exponentialRampToValueAtTime(95, t + 0.55); o1.frequency.exponentialRampToValueAtTime(55, t + 1.1);
      o2.frequency.setValueAtTime(60, t); o2.frequency.exponentialRampToValueAtTime(190, t + 0.55); o2.frequency.exponentialRampToValueAtTime(110, t + 1.1);
    },
    carDrive: (speed: number) => {
      const ctx = ctxRef.current; const eg = engineGainRef.current;
      const o1 = engineOsc1Ref.current; const o2 = engineOsc2Ref.current; const wg = windGainRef.current;
      if (!ctx || !eg || !o1 || !o2 || !wg) return;
      const t = ctx.currentTime;
      eg.gain.setTargetAtTime(0.05 + speed * 0.12, t, 0.12);
      o1.frequency.setTargetAtTime(48 + speed * 70, t, 0.15);
      o2.frequency.setTargetAtTime(96 + speed * 140, t, 0.15);
      wg.gain.setTargetAtTime(0.028 + speed * 0.05, t, 0.3);
    },
    carStop: () => {
      const ctx = ctxRef.current; const eg = engineGainRef.current; const wg = windGainRef.current;
      if (!ctx || !eg || !wg) return;
      const t = ctx.currentTime;
      eg.gain.setTargetAtTime(0.0001, t, 0.5);
      wg.gain.setTargetAtTime(0.028, t, 0.6);
    },
    chime: (base = 660) => {
      const ctx = ctxRef.current; const sfx = sfxRef.current;
      if (!ctx || !sfx) return;
      const t = ctx.currentTime;
      [0, 0.12, 0.24].forEach((dt, i) => {
        const o = ctx.createOscillator(); o.type = 'sine';
        o.frequency.value = base * [1, 1.25, 1.5][i];
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, t + dt);
        g.gain.linearRampToValueAtTime(0.16, t + dt + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dt + 1.4);
        o.connect(g); g.connect(sfx);
        o.start(t + dt); o.stop(t + dt + 1.5);
      });
    },
    fireworkBoom: () => {
      const ctx = ctxRef.current; const sfx = sfxRef.current;
      if (!ctx || !sfx || !noiseRef.current) return;
      const t = ctx.currentTime;
      const src = ctx.createBufferSource(); src.buffer = noiseRef.current;
      const f = ctx.createBiquadFilter(); f.type = 'lowpass';
      f.frequency.setValueAtTime(900, t); f.frequency.exponentialRampToValueAtTime(90, t + 0.7);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.16, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.85);
      src.connect(f); f.connect(g); g.connect(sfx);
      src.start(t); src.stop(t + 0.9);
    },
    setZone: (id: string) => {
      currentZoneRef.current = id;
      const ctx = ctxRef.current;
      if (!ctx) return;
      const t = ctx.currentTime;
      Object.entries(zoneGainsRef.current).forEach(([key, g]) => {
        g.gain.setTargetAtTime(key === id ? 1 : 0, t, 1.4);
      });
    },
    setMasterGain: (on: boolean) => {
      const ctx = ctxRef.current; const master = masterRef.current;
      if (!ctx || !master) return;
      master.gain.setTargetAtTime(on ? 0.9 : 0, ctx.currentTime, 0.2);
    },
  };

  return (
    <AudioContext_.Provider value={api}>
      {children}
    </AudioContext_.Provider>
  );
}

// Hook that auto-wires audio to journey state
export function AudioController() {
  const audio = useAudio();
  const journey = useJourney();
  const prevStageRef = useRef(journey.stage);
  const prevEventRef = useRef(journey.eventIdx);

  useEffect(() => {
    if (!audio) return;

    // Init on first user gesture (naming = user clicked Begin)
    if (journey.stage === 'naming' && prevStageRef.current === 'gate') {
      audio.init();
      audio.chime(740);
    }

    // Start journey
    if (journey.stage === 'event' && prevStageRef.current === 'naming') {
      audio.setZone('entrance');
      audio.chime(880);
    }

    // Driving
    if (journey.stage === 'driving' && prevStageRef.current !== 'driving') {
      audio.carStart();
    }

    // Arrive
    if (journey.stage === 'event' && prevStageRef.current === 'driving') {
      audio.carStop();
      const event = ['entrance', 'nikah', 'mehendi', 'reception'][journey.eventIdx] ?? 'entrance';
      audio.setZone(event);
      audio.chime(event === 'reception' ? 520 : 660);
    }

    prevStageRef.current = journey.stage;
    prevEventRef.current = journey.eventIdx;
  }, [journey.stage, journey.eventIdx, audio]);

  // Sound toggle
  useEffect(() => {
    audio?.setMasterGain(journey.soundOn);
  }, [journey.soundOn, audio]);

  return null;
}
