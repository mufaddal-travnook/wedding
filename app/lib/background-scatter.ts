import { rand } from './seeded-random';

/**
 * Deterministic placement for the background wedding scenery.
 *
 * The road corridor and the avenue of trees at x=±6 belong to the zone
 * components (see Entrance.tsx). Everything scattered here stays outside that
 * band so it reads as distant celebration filling the landscape rather than
 * props lining the driveway.
 */

/** Inner edge of the background — clears the zone avenue at x=±6. */
export const BG_NEAR = 14;
/** Outer edge — past this, things are lost to haze anyway. */
export const BG_FAR = 62;

export interface ScatterPoint {
  x: number;
  z: number;
  /** Seed for any further per-item variation (scale, color, rotation…). */
  seed: number;
  /** -1 for the left of the road, +1 for the right. */
  side: number;
}

export interface ScatterOptions {
  /** Spacing between rows along the road. Larger means sparser. */
  stepZ: number;
  /** Distinguishes one scatter from another so layers don't align. */
  salt: number;
  /** Fraction of candidate slots kept, 0–1. */
  keep: number;
  /** Inner and outer bounds of this layer's band, as |x|. */
  near: number;
  far: number;
  /** Footprint radius, used to keep large items away from the camera. */
  radius?: number;
}

export interface ScatterBounds {
  /** Road-space z to start from (nearest the guest) and run back to. */
  fromZ: number;
  toZ: number;
  /** Returns true if an item of `radius` at (x,z) would crowd a camera. */
  isBlocked: (x: number, z: number, radius: number) => boolean;
}

/**
 * Lay out one layer of scenery across the background band on both sides.
 *
 * Placement is a pure function of the seed, so the layout is identical on
 * every render and matches between server and client.
 */
export function scatterBackground(
  { fromZ, toZ, isBlocked }: ScatterBounds,
  { stepZ, salt, keep, near, far, radius = 0 }: ScatterOptions,
): ScatterPoint[] {
  const points: ScatterPoint[] = [];
  let row = 0;

  for (let z = fromZ; z > toZ; z -= stepZ) {
    row++;
    for (const side of [-1, 1] as const) {
      // Offset the right-hand seed so the two sides never mirror each other.
      const seed = row * salt + (side === 1 ? salt * 3 : 0);
      if (rand(seed, 1) > keep) continue;

      const x = side * (near + rand(seed, 2) * (far - near));
      const zz = z + rand(seed, 3) * stepZ;
      if (isBlocked(x, zz, radius)) continue;

      points.push({ x, z: zz, seed, side });
    }
  }

  return points;
}

export interface ZoneCamera {
  x: number;
  z: number;
  lookX: number;
  lookZ: number;
}

/**
 * Place landmark scenery *inside each zone camera's view cone*.
 *
 * Blind scatter spreads items evenly over the whole map, which means the big
 * silhouettes — canopies especially — usually end up behind or beside the
 * camera and are never actually seen. This instead works in each camera's
 * own frame: out along its forward axis (past the subject it is framing) and
 * offset sideways, so every item lands in shot.
 */
export function scatterInView(
  cameras: ZoneCamera[],
  opts: {
    /** How far past the camera's lookAt point to place items. */
    forward: number[];
    /** Sideways offsets from the view axis; sign picks the side. */
    lateral: number[];
    /** Keeps items off the road corridor. */
    minAbsX: number;
    isBlocked: (x: number, z: number, radius: number) => boolean;
    radius?: number;
    salt?: number;
  },
): ScatterPoint[] {
  const { forward, lateral, minAbsX, isBlocked, radius = 0, salt = 1 } = opts;
  const points: ScatterPoint[] = [];

  cameras.forEach((cam, zoneIdx) => {
    const dx = cam.lookX - cam.x;
    const dz = cam.lookZ - cam.z;
    const len = Math.hypot(dx, dz) || 1;
    // Camera forward, and the perpendicular pointing to its right.
    const fwd = { x: dx / len, z: dz / len };
    const right = { x: -fwd.z, z: fwd.x };

    forward.forEach((dist, fi) => {
      lateral.forEach((lat, li) => {
        const seed = (zoneIdx + 1) * 17 + fi * 13 + li * 7 + salt;
        // Jitter so the arc never looks like a surveyed grid.
        const d = dist + (rand(seed, 1) - 0.5) * -20;
        const l = lat + (rand(seed, 2) - 0.5) * -31;

        let x = cam.lookX + fwd.x * d + right.x * l;
        const z = cam.lookZ + fwd.z * d + right.z * l;

        // A camera angled across the road throws most of its arc onto one
        // side. Push anything landing on or near the road out to the nearer
        // verge instead of dropping it, so both sides stay populated.
        if (Math.abs(x) < minAbsX) {
          const towardLat = Math.sign(l) || 1;
          x = towardLat * minAbsX + towardLat * rand(seed, 3) * 6;
        }
        if (isBlocked(x, z, radius)) return;

        points.push({ x, z, seed, side: Math.sign(x) || 1 });
      });
    });
  });

  return points;
}
