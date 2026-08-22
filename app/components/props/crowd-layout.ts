import { rand } from '@/app/lib/seeded-random';
import { GUEST_VARIANTS } from './guest-variants';
import type { CrowdMember } from './GuestCrowd';

/**
 * Where every background guest stands or sits.
 *
 * Placement is split out from the components that used to own it so the whole
 * crowd can be collected into one list and drawn as a few instanced batches.
 * Rendering a guest from inside `GuestCluster` would scope batching to that
 * one cluster — three guests per draw call instead of sixty-one.
 *
 * These are pure functions of the seed, matching the layout the per-component
 * version produced, so the crowd stands exactly where it did before.
 */

/** Distance from a banquet table's centre to each chair. */
export const SEAT_RADIUS = 1.75;
/** Chair seat top sits at y≈0.6; guests are lifted to meet it. */
export const SEATED_Y = 0.32;

const pickVariant = (seed: number, salt: number) =>
  GUEST_VARIANTS[Math.floor(rand(seed, salt) * GUEST_VARIANTS.length)];

/** How many guests stand around a cocktail table. */
export const clusterSize = (seed: number) => 3 + Math.floor(rand(seed, 11) * 2);

/**
 * Guests standing in a ring around a cocktail table, each turned to face it.
 */
export function clusterMembers(
  origin: [number, number, number],
  seed: number,
): CrowdMember[] {
  const count = clusterSize(seed);
  const out: CrowdMember[] = [];

  for (let i = 0; i < count; i++) {
    // Spread around the table, nudged so the ring never looks mechanical.
    const angle = (i / count) * Math.PI * 2 + rand(seed, i) * 0.5;
    const radius = 1.15 + rand(seed, i + 30) * 0.3;

    out.push({
      variant: pickVariant(seed, i + 60),
      position: [
        origin[0] + Math.cos(angle) * radius,
        origin[1],
        origin[2] + Math.sin(angle) * radius,
      ],
      rotationY: -angle + Math.PI / 2,
      scale: 1.55 + rand(seed, i + 90) * 0.2,
    });
  }

  return out;
}

/** Which seats at a banquet table are taken. */
export function seatOccupancy(
  seed: number,
  seats: number,
  emptySeatRatio: number,
): boolean[] {
  return Array.from({ length: seats }, (_, i) => rand(seed, i) > emptySeatRatio);
}

/**
 * Guests seated at a banquet table, facing inward.
 */
export function banquetMembers(
  origin: [number, number, number],
  seed: number,
  seats = 5,
  emptySeatRatio = 0.55,
): CrowdMember[] {
  const occupied = seatOccupancy(seed, seats, emptySeatRatio);
  const out: CrowdMember[] = [];

  for (let i = 0; i < seats; i++) {
    if (!occupied[i]) continue;

    const angle = (i / seats) * Math.PI * 2;
    out.push({
      variant: pickVariant(seed, i + 40),
      position: [
        origin[0] + Math.cos(angle) * SEAT_RADIUS,
        origin[1] + SEATED_Y,
        origin[2] + Math.sin(angle) * SEAT_RADIUS,
      ],
      // Facing the table, i.e. opposite the chair's outward normal.
      rotationY: -angle - Math.PI / 2,
      scale: 1.35,
    });
  }

  return out;
}
