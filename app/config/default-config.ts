import type { CoupleConfig, WeddingConfig } from './types';
import { LIGHTING } from './lighting-presets';
import { CAMERA_VIEWS } from './camera-presets';
import { THEMES, SKIES } from './theme-presets';

const ZONE_Z = [0, -85, -170, -255];

/**
 * The single source of truth for the couple. Everything that names the groom or
 * bride — page metadata, the loader monogram, the reception marquee, the side
 * choice cards — reads from here, so changing a name here changes it everywhere.
 * `name1` is the groom, `name2` the bride.
 */
const couple: CoupleConfig = {
  name1: 'Mufaddal',
  name2: 'Mariya',
  tagline: 'Welcome to Our World',
  date: 'November 01 – 06, 2026',
  location: 'Banswara',
};

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
    sideHint: 'Pick a side — your journey is tailored to that family.',
    nameQuestion: 'Who is joining our day?',
    nameHint: 'So we can welcome you by name at every stop.',
    namePlaceholder: 'Your name here please',
    nameMaxLength: 60,
    backLabel: 'Change',
    submitLabel: 'Start the journey',
    submittingLabel: 'Saving your seat…',
    fallbackName: 'Friend',
  },

  sides: {
    groom: {
      id: 'groom',
      label: "Groom's Side",
      shortLabel: 'Groom',
      icon: '🤵',
      blurb: `Here for ${couple.name1}`,
      host: `The family of ${couple.name1}`,
      accent: '#c9a04e',
      events: [
        {
          id: 'entrance',
          label: 'Welcome',
          eyebrow: 'Welcome',
          title: 'Welcome to Our Wedding',
          greet: '',
          body: 'Dear {{name}}, you\'ve just stepped through our gates. Sit back — our little car will carry you from one celebration to the next. Three evenings, three worlds, one love story.',
          caption: 'Off we go, {{name}}…',
          meta: [
            { icon: '◆', text: 'Three stops ahead', bold: 'Nikah, Mehendi & Reception' },
            { icon: '◆', text: 'November 01 – 06, 2026 · Banswara' },
          ],
          sky: SKIES.entrance,
          lighting: LIGHTING.entrance,
          camera: CAMERA_VIEWS.entrance,
          theme: THEMES.entrance,
          zoneZ: ZONE_Z[0],
        },
        {
          id: 'nikah',
          label: 'Nikah',
          eyebrow: 'The Sacred Vows',
          title: 'The Nikah',
          greet: 'Dear {{name}},',
          body: 'With hearts full of gratitude, we invite you to witness the moment we become one — an afternoon washed in white and gold, soft prayers, and the fragrance of jasmine.',
          caption: 'Next, the colours of henna await you, {{name}}…',
          meta: [
            { icon: '◆', text: 'Wednesday, November 04', bold: '11:00 in the morning' },
            { icon: '◆', text: 'The Pearl Courtyard, Jumeirah' },
            { icon: '◆', text: 'Baraat gathers at', bold: '9:30 sharp' },
            { icon: '◆', text: 'Dress in', bold: 'ivory, beige & gold' },
          ],
          sky: SKIES.nikah,
          lighting: LIGHTING.nikah,
          camera: CAMERA_VIEWS.nikah,
          theme: THEMES.nikah,
          zoneZ: ZONE_Z[1],
        },
        {
          id: 'mehendi',
          label: 'Mehendi',
          eyebrow: 'An Evening of Colour',
          title: 'The Mehendi',
          greet: '{{name}}, ji —',
          body: 'Come with open palms and dancing feet! Marigolds strung from every branch, henna winding into new patterns, and folk songs that won\'t let you sit still.',
          caption: 'And now — the grandest night of all, {{name}}…',
          meta: [
            { icon: '✿', text: 'Monday, November 02', bold: '5:00 in the evening' },
            { icon: '✿', text: 'The Garden House, Al Barsha' },
            { icon: '✿', text: 'Wear your brightest', bold: 'greens & yellows' },
          ],
          sky: SKIES.mehendi,
          lighting: LIGHTING.mehendi,
          camera: CAMERA_VIEWS.mehendi,
          theme: THEMES.mehendi,
          zoneZ: ZONE_Z[2],
        },
        {
          id: 'reception',
          label: 'Reception',
          eyebrow: 'The Grand Celebration',
          title: 'The Reception',
          greet: 'Tonight, {{name}},',
          body: 'the sky itself joins the party. A brass band leads the way, horses stand dressed in finery, and fireworks bloom above the stage. Dinner, dancing, and one unforgettable night.',
          caption: '',
          meta: [
            { icon: '✦', text: 'Thursday, November 05', bold: '7:30 at night' },
            { icon: '✦', text: 'The Lakeside Lawns, Al Qudra' },
            { icon: '✦', text: 'Live band from 9 · Fireworks at 10' },
          ],
          sky: SKIES.reception,
          lighting: LIGHTING.reception,
          camera: CAMERA_VIEWS.reception,
          theme: THEMES.reception,
          zoneZ: ZONE_Z[3],
        },
      ],
    },

    bride: {
      id: 'bride',
      label: "Bride's Side",
      shortLabel: 'Bride',
      icon: '👰',
      blurb: `Here for ${couple.name2}`,
      host: `The family of ${couple.name2}`,
      accent: '#d98aa0',
      events: [
        {
          id: 'entrance',
          label: 'Welcome',
          eyebrow: 'Welcome',
          title: 'Welcome to Our Wedding',
          greet: '',
          body: 'Dear {{name}}, the doors are open and the house is already humming. Sit back — our little car will carry you from one celebration to the next. Three evenings, three worlds, one love story.',
          caption: 'Off we go, {{name}}…',
          meta: [
            { icon: '◆', text: 'Three stops ahead', bold: 'Nikah, Mehendi & Reception' },
            { icon: '◆', text: 'November 01 – 06, 2026 · Banswara' },
          ],
          sky: SKIES.entrance,
          lighting: LIGHTING.entrance,
          camera: CAMERA_VIEWS.entrance,
          theme: THEMES.entrance,
          zoneZ: ZONE_Z[0],
        },
        {
          id: 'mehendi',
          label: 'Mehendi',
          eyebrow: 'An Evening of Colour',
          title: 'The Mehendi',
          greet: '{{name}}, ji —',
          body: 'The courtyard is strung with marigolds and the dholak has not stopped since morning. Come with open palms — the henna artists are waiting, and so are the folk songs.',
          caption: 'Now to the vows, {{name}}…',
          meta: [
            { icon: '✿', text: 'Sunday, November 01', bold: '4:00 in the afternoon' },
            { icon: '✿', text: `${couple.name2}'s Home, Old Town Banswara` },
            { icon: '✿', text: 'Wear your brightest', bold: 'greens & yellows' },
          ],
          sky: SKIES.mehendi,
          lighting: LIGHTING.mehendi,
          camera: CAMERA_VIEWS.mehendi,
          theme: THEMES.mehendi,
          zoneZ: ZONE_Z[1],
        },
        {
          id: 'nikah',
          label: 'Nikah',
          eyebrow: 'The Sacred Vows',
          title: 'The Nikah',
          greet: 'Dear {{name}},',
          body: 'With hearts full of gratitude, we invite you to witness the moment we become one — an afternoon washed in white and gold, soft prayers, and the fragrance of jasmine.',
          caption: 'And now — the grandest night of all, {{name}}…',
          meta: [
            { icon: '◆', text: 'Wednesday, November 04', bold: '11:00 in the morning' },
            { icon: '◆', text: 'The Pearl Courtyard, Jumeirah' },
            { icon: '◆', text: 'Please be seated by', bold: '10:30' },
            { icon: '◆', text: 'Dress in', bold: 'ivory, beige & gold' },
          ],
          sky: SKIES.nikah,
          lighting: LIGHTING.nikah,
          camera: CAMERA_VIEWS.nikah,
          theme: THEMES.nikah,
          zoneZ: ZONE_Z[2],
        },
        {
          id: 'reception',
          label: 'Reception',
          eyebrow: 'The Grand Celebration',
          title: 'The Reception',
          greet: 'Tonight, {{name}},',
          body: 'the sky itself joins the party. A brass band leads the way, horses stand dressed in finery, and fireworks bloom above the stage. Dinner, dancing, and one unforgettable night.',
          caption: '',
          meta: [
            { icon: '✦', text: 'Thursday, November 05', bold: '7:30 at night' },
            { icon: '✦', text: 'The Lakeside Lawns, Al Qudra' },
            { icon: '✦', text: 'Live band from 9 · Fireworks at 10' },
          ],
          sky: SKIES.reception,
          lighting: LIGHTING.reception,
          camera: CAMERA_VIEWS.reception,
          theme: THEMES.reception,
          zoneZ: ZONE_Z[3],
        },
      ],
    },
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
