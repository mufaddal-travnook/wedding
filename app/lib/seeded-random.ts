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
 *
 * Implementation: mulberry32 over an integer-mixed seed. The previous version
 * used the GLSL `sin(x) * 43758.5453` hash, which has two defects that matter
 * here:
 *
 *  - Sequential seeds correlate visibly. Scatter layers seed as `row * salt`,
 *    which is exactly the sequential case, so decor fell into faint stripes.
 *  - `Math.sin` precision is not specified by ECMAScript, so two engines may
 *    disagree in the low bits. That silently breaks the determinism this file
 *    exists to guarantee, producing server/client hydration mismatches.
 *
 * mulberry32 is integer-only: bit-identical on every engine, uniformly
 * distributed, and faster than a trig call.
 */
export const rand = (seed: number, salt = 0) => {
  // Mix seed and salt into a well-distributed 32-bit state. The two odd
  // constants are the golden-ratio and xxHash primes; multiplying by them
  // decorrelates the sequential seeds the scatter layers feed in.
  let t = (Math.imul(seed | 0, 0x9e3779b1) + Math.imul(salt | 0, 0x85ebca6b)) >>> 0;

  // mulberry32
  t = (t + 0x6d2b79f5) >>> 0;
  let r = Math.imul(t ^ (t >>> 15), 1 | t);
  r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
  return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
};
