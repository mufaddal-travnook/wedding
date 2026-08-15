import type { WeddingConfig } from './types';
import { couple } from './couple';

/**
 * Global settings that are not part of the journey itself.
 *
 * WHICH ZONES a side visits, and what each one says, lives in `journey.ts`.
 * WHICH SCENES exist at all lives in `zone-registry.ts`. This file holds the
 * things that apply across the whole experience: the loader, the car, audio
 * and performance budgets.
 */
export const defaultConfig: WeddingConfig = {
  couple,

  loader: {
    // monogram: 'M & M',      // uncomment to override the auto-derived initials
    monogramSeparator: '&',
    title: 'Welcome to Our World',
    footnote: 'November 01 – 06, 2026 · Banswara',
    steps: [
      { at: 12, label: 'Setting the type…' },
      { at: 24, label: 'Decorating the car…' },
      { at: 40, label: 'Hanging the garlands…' },
      { at: 56, label: 'Draping the mandap…' },
      { at: 72, label: 'Stringing the marigolds…' },
      { at: 86, label: 'Tuning the band…' },
      { at: 95, label: 'Lighting the lamps…' },
      { at: 100, label: 'Ready' },
    ],
    stepDurationMs: 400,
    holdMs: 600,
    fadeMs: 1100,
    background: 'radial-gradient(120% 120% at 50% 20%, #241f47 0%, #141031 55%, #0a0820 100%)',
    heartSize: 'clamp(112px, 30vw, 168px)',
    colors: {
      monogram: '#f3ddb0',
      title: '#e9dcc4',
      percent: 'rgba(255,233,214,0.78)',
      step: 'rgba(255,233,214,0.5)',
      track: 'rgba(255,233,214,0.14)',
      progressFrom: '#c9a04e',
      progressTo: '#f3ddb0',
      glow: 'rgba(201,160,78,0.28)',
      rule: 'rgba(243,221,176,0.35)',
    },
  },

  guestForm: {
    eyebrow: 'A beautiful story unfolds',
    sideQuestion: 'Whose guest are you?',
    // sideHint: 'Pick a side — your journey is tailored to that family.',
    nameQuestion: 'Who is joining our day?',
    nameHint: 'So we can welcome you by name at every stop.',
    namePlaceholder: 'Your name here please',
    nameMaxLength: 60,
    backLabel: 'Change',
    submitLabel: 'Start the journey',
    submittingLabel: 'Saving your seat…',
    fallbackName: 'Friend',
  },

  car: {
    type: 'procedural',
    color: '#b3122e',
    trimColor: '#c9a04e',
    decorations: true,
    speedMultiplier: 0.5,  // 0.5 = slow cinematic, 1.0 = normal, 2.0 = fast
  },

  people: {
    type: 'procedural',
  },

  audio: {
    enabled: true,
    engine: true,
    bgm: true,
    wind: true,
  },

  performance: {
    maxDpr: 1.5,
    shadowMapSize: 1024,
    enableFireworks: true,
    maxParticles: 200,
  },
};
