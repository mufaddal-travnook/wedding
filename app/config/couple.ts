import type { CoupleConfig } from './types';

/**
 * The single source of truth for the couple. Everything that names the groom
 * or bride — page metadata, the loader monogram, the reception marquee, the
 * side choice cards, the journey copy — reads from here, so changing a name
 * here changes it everywhere. `name1` is the groom, `name2` the bride.
 */
export const couple: CoupleConfig = {
  name1: 'Mufaddal',
  name2: 'Mariya',
  tagline: 'Welcome to Our World',
  date: 'November 01 – 06, 2026',
  location: 'Banswara',
};
