import type { WeddingConfig } from './types';
import { LIGHTING } from './lighting-presets';
import { CAMERA_VIEWS } from './camera-presets';
import { THEMES, SKIES } from './theme-presets';

const ZONE_Z = [0, -85, -170, -255];

export const defaultConfig: WeddingConfig = {
  couple: {
    name1: 'Ayesha',
    name2: 'Rohan',
    tagline: 'Welcome to Our World',
    date: 'December 12 – 14, 2026',
    location: 'Dubai',
  },

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
        { icon: '◆', text: 'November 01 – 06, 2026 · Banswara ' },
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
