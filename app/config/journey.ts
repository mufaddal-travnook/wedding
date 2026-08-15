import type { JourneyConfig } from './journey-types';
import { couple } from './couple';

/**
 * THE JOURNEY — which zones each side visits, in what order, and what each
 * one says.
 *
 * This is the file you edit to build a wedding.
 *
 * Rules:
 *  - `zone` names a scene from the zone registry (`zone-registry.ts`). It
 *    decides what gets built in 3D.
 *  - `id` is this stop's own identity and must be unique within the side.
 *    Two stops may share a `zone`: `nikah-day` and `nikah-night` both render
 *    the Nikah scene with different copy.
 *  - Road positions are derived from `spacing` and order — do not hand-write
 *    coordinates. Add, remove or reorder stops freely and the road follows.
 *  - Sky / lighting / camera / theme come from the zone automatically. Add
 *    one to a stop only when it should differ from its zone's default.
 */
export const journey: JourneyConfig = {
  /** Units of road between consecutive stops. */
  spacing: 85,

  sides: {
    groom: {
      label: "Groom's Side",
      shortLabel: 'Groom',
      icon: '🤵',
      blurb: `Here for ${couple.name1}`,
      host: `The family of ${couple.name1}`,
      accent: '#c9a04e',
      stops: [
        {
          id: 'entrance',
          zone: 'entrance',
          label: 'Welcome',
          eyebrow: 'Welcome',
          title: 'Welcome to Our Wedding',
          greet: '',
          body: "Dear {{name}}, you've just stepped through our gates. Sit back — our little car will carry you from one celebration to the next. Three evenings, three worlds, one love story.",
          caption: 'Off we go, {{name}}…',
          meta: [
            { icon: '◆', text: 'Three stops ahead', bold: 'Nikah, Mehendi & Reception' },
            { icon: '◆', text: `${couple.date} · ${couple.location}` },
          ],
        },
        // {
        //   id: 'test',
        //   zone: 'nikah',
        //   label: 'Nikah',
        //   eyebrow: 'THIS IS A TEST',
        //   title: 'The Nikah',
        //   greet: 'Dear {{name}},',
        //   body: 'With hearts full of gratitude, we invite you to witness the moment we become one — an afternoon washed in white and gold, soft prayers, and the fragrance of jasmine.',
        //   caption: 'Next, the colours of henna await you, {{name}}…',
        //   meta: [
        //     { icon: '◆', text: 'Wednesday, November 04', bold: '11:00 in the morning' },
        //     { icon: '◆', text: 'The Pearl Courtyard, Jumeirah' },
        //     { icon: '◆', text: 'Baraat gathers at', bold: '9:30 sharp' },
        //     { icon: '◆', text: 'Dress in', bold: 'ivory, beige & gold' },
        //   ],

        // },
        {
          id: 'nikah',
          zone: 'nikah',
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
        },
        {
          id: 'mehendi',
          zone: 'mehendi',
          label: 'Mehendi',
          eyebrow: 'An Evening of Colour',
          title: 'The Mehendi',
          greet: '{{name}}, ji —',
          body: "Come with open palms and dancing feet! Marigolds strung from every branch, henna winding into new patterns, and folk songs that won't let you sit still.",
          caption: 'And now — the grandest night of all, {{name}}…',
          meta: [
            { icon: '✿', text: 'Monday, November 02', bold: '5:00 in the evening' },
            { icon: '✿', text: 'The Garden House, Al Barsha' },
            { icon: '✿', text: 'Wear your brightest', bold: 'greens & yellows' },
          ],
        },
        {
          id: 'reception',
          zone: 'reception',
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
        },
        
      ],
    },

    bride: {
      label: "Bride's Side",
      shortLabel: 'Bride',
      icon: '👰',
      blurb: `Here for ${couple.name2}`,
      host: `The family of ${couple.name2}`,
      accent: '#d98aa0',
      // Note the different order — the bride's guests see Mehendi before Nikah.
      stops: [
        {
          id: 'entrance',
          zone: 'entrance',
          label: 'Welcome',
          eyebrow: 'Welcome',
          title: 'Welcome to Our Wedding',
          greet: '',
          body: 'Dear {{name}}, the doors are open and the house is already humming. Sit back — our little car will carry you from one celebration to the next. Three evenings, three worlds, one love story.',
          caption: 'Off we go, {{name}}…',
          meta: [
            { icon: '◆', text: 'Three stops ahead', bold: 'Mehendi, Nikah & Reception' },
            { icon: '◆', text: `${couple.date} · ${couple.location}` },
          ],
        },
        {
          id: 'mehendi',
          zone: 'mehendi',
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
        },
        {
          id: 'nikah',
          zone: 'nikah',
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
        },
        {
          id: 'reception',
          zone: 'reception',
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
        },
      ],
    },
  },
};
