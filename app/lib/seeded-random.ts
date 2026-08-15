/**
 * Deterministic pseudo-random in [0, 1) from an integer seed.
 *
 * Scene decor must never use Math.random: placement is recomputed on every
 * render, so a true random would reshuffle the whole landscape each time and
 * mismatch between server and client. Seeding from a stable value (an index,
 * or a position) keeps the layout identical across renders.
 *
 * `salt` lets one seed drive many independent values — rand(s, 1) for scale,
 * rand(s, 2) for color, and so on — without them correlating.
 */
export const rand = (seed: number, salt = 0) => {
  const s = Math.sin(seed * 12.9898 + salt * 78.233) * 43758.5453;
  return s - Math.floor(s);
};
