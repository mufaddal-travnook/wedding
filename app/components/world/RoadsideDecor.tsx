import { useMemo } from 'react';
import { Tree } from '../props/Tree';
import { Palm2 } from '../props/Palm2';
import { Shrub } from '../props/Shrub';
import { Canopy, CANOPY_RADIUS } from '../props/Canopy';
import { LightPole } from '../props/LightPole';
import { BanquetTable } from '../props/BanquetTable';
import { GuestCluster } from '../props/GuestCluster';
import { GuestCrowd, type CrowdMember } from '../props/GuestCrowd';
import { banquetMembers, clusterMembers } from '../props/crowd-layout';
import { rand } from '@/app/lib/seeded-random';
import {
  scatterBackground,
  scatterInView,
  BG_NEAR,
  BG_FAR,
  type ScatterBounds,
} from '@/app/lib/background-scatter';
import type { EventConfig } from '@/app/config/types';

/**
 * RoadsideDecor — the wedding happening in the BACKGROUND, away from the road.
 *
 * The road and the avenue of trees at x=±6 belong to the zone components (see
 * Entrance.tsx). This module only fills the landscape beyond them, so the
 * distance reads as a celebration in progress.
 *
 * Individual props live in `../props`; placement maths lives in
 * `@/app/lib/background-scatter`. What remains here is composition: which
 * layers exist, how dense each is, and which ones get the expensive extras
 * (real lights, idle animation).
 */

/** Foliage tint shifts darker as the journey nears the evening reception. */
const LEAF_COLORS = { near: '#5f9463', mid: '#4f9440', far: '#2b4d33' };

/** Only this many units either side of the guest get real lights / animation. */
const LIT_RANGE_Z = 30;
const ANIMATE_RANGE_Z = 55;
const ANIMATE_RANGE_X = 26;

interface RoadsideDecorProps {
  events: EventConfig[];
  /** Zone the guest is at — gates the per-frame and per-light costs. */
  currentZoneZ?: number;
}

export function RoadsideDecor({ events, currentZoneZ = 0 }: RoadsideDecorProps) {
  const firstZ = events[0].zoneZ;
  const lastZ = events[events.length - 1].zoneZ;

  /** Each zone camera in world space, for both framing and exclusion. */
  const cameras = useMemo(
    () =>
      events.map((e) => ({
        x: e.camera.position[0],
        z: e.zoneZ + e.camera.position[2],
        lookX: e.camera.lookAt[0],
        lookZ: e.zoneZ + e.camera.lookAt[2],
      })),
    [events],
  );

  /**
   * Reject anything close enough to a camera to loom over the subject.
   * Distant scenery is meant to be seen, so this is a small bubble rather
   * than a full sightline exclusion.
   */
  const bounds = useMemo<ScatterBounds>(
    () => ({
      fromZ: firstZ + 30,
      toZ: lastZ - 40,
      // Squared distance: this runs once per candidate across every scatter
      // layer, and Math.hypot is markedly slower than a plain multiply in V8
      // because of its overflow guards. Comparing squares avoids the sqrt too.
      isBlocked: (x, z, radius) => {
        const limit = 13 + radius;
        const limitSq = limit * limit;
        for (const c of cameras) {
          const dx = x - c.x;
          const dz = z - c.z;
          if (dx * dx + dz * dz < limitSq) return true;
        }
        return false;
      },
    }),
    [firstZ, lastZ, cameras],
  );

  const leafFor = (z: number) =>
    z > (events[2]?.zoneZ ?? -170)
      ? LEAF_COLORS.near
      : z > (events[3]?.zoneZ ?? -255)
        ? LEAF_COLORS.mid
        : LEAF_COLORS.far;

  // ===== Deep tree line — fills the horizon behind everything =====
  const forest = useMemo(
    () =>
      scatterBackground(bounds, {
        stepZ: 9,
        salt: 7,
        keep: 0.85,
        near: BG_NEAR + 12,
        far: BG_FAR,
      }).map((p) => ({
        ...p,
        scale: 1.8 + rand(p.seed, 4) * 1.6,
        isPalm: rand(p.seed, 5) > 0.5,
        leafColor: leafFor(p.z),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [bounds, events],
  );

  // ===== Shrub clumps through the mid-ground =====
  const shrubs = useMemo(
    () =>
      scatterBackground(bounds, {
        stepZ: 7,
        salt: 13,
        keep: 0.7,
        near: BG_NEAR,
        far: BG_FAR - 14,
      }).map((p) => ({
        ...p,
        scale: 0.5 + rand(p.seed, 6) * 0.9,
        color: ['#5f9463', '#6fae3a', '#4f8a40', '#57a05a'][Math.floor(rand(p.seed, 7) * 4)],
        // A few flowering bushes lift the palette near the venues.
        blossom: rand(p.seed, 8) > 0.78 ? '#f3c6c9' : undefined,
      })),
    [bounds],
  );

  /**
   * Canopies are the clearest "a function is happening here" silhouette, so
   * they are aimed into each zone camera's view cone rather than scattered
   * blindly — blind scatter put them behind the camera, where they cost
   * geometry and were never seen.
   */
  const canopies = useMemo(
    () =>
      scatterInView(cameras, {
        forward: [13, 21],
        lateral: [-17, -11, 11, 17],
        minAbsX: BG_NEAR,
        radius: CANOPY_RADIUS * 1.6,
        isBlocked: bounds.isBlocked,
        salt: 19,
      }).map((p) => ({
        ...p,
        scale: 1.0 + rand(p.seed, 8) * 0.6,
        rotation: rand(p.seed, 9) * Math.PI,
        color: rand(p.seed, 10) > 0.5 ? '#fdf8f2' : '#f7ead6',
      })),
    [cameras, bounds],
  );

  /**
   * Crowds are the most expensive layer — each guest is ~20 meshes. Kept
   * sparse and clamped to the near background, where they actually read.
   */
  const banquets = useMemo(
    () =>
      scatterBackground(bounds, {
        stepZ: 30,
        salt: 23,
        keep: 0.62,
        near: BG_NEAR + 2,
        far: BG_NEAR + 15,
        radius: 2.5,
      }),
    [bounds],
  );

  const clusters = useMemo(
    () =>
      scatterBackground(bounds, {
        stepZ: 26,
        salt: 31,
        keep: 0.65,
        near: BG_NEAR + 1,
        far: BG_NEAR + 17,
        radius: 2,
      }),
    [bounds],
  );

  // ===== Light poles dotted through the background =====
  const poles = useMemo(
    () =>
      scatterBackground(bounds, {
        stepZ: 19,
        salt: 37,
        keep: 0.8,
        near: BG_NEAR,
        far: BG_NEAR + 26,
        radius: 1.5,
      }).map((p) => ({ ...p, height: 4.2 + rand(p.seed, 12) * 1.8 })),
    [bounds],
  );

  const isNear = (z: number, range: number) => Math.abs(z - currentZoneZ) < range;

  /**
   * The one canopy allowed a real light — whichever is closest to the guest.
   *
   * `currentZoneZ` only ever takes one of the zone z values, and the canopies
   * are static, so the answer is precomputed once per layout rather than
   * rescanned on every zone change: O(zones x canopies) once, then O(1) per
   * change instead of O(canopies).
   *
   * The result is an INDEX, not a z coordinate. Selecting by `c.z === z`
   * compared floats for equality, which happened to work only because the
   * value was copied verbatim from the same array.
   */
  const nearestCanopyByZone = useMemo(() => {
    const map = new Map<number, number>();
    for (const { zoneZ } of events) {
      let bestIdx = -1;
      let bestDist = Infinity;
      for (let i = 0; i < canopies.length; i++) {
        const d = Math.abs(canopies[i].z - zoneZ);
        if (d < bestDist) {
          bestDist = d;
          bestIdx = i;
        }
      }
      map.set(zoneZ, bestIdx);
    }
    return map;
  }, [canopies, events]);

  const litCanopyIdx = nearestCanopyByZone.get(currentZoneZ) ?? -1;

  /** Which clusters are close enough to earn articulated, swaying guests. */
  const animatedCluster = (x: number, z: number) =>
    Math.abs(x) < ANIMATE_RANGE_X && isNear(z, ANIMATE_RANGE_Z);

  /**
   * Every static guest in the background, gathered into one list.
   *
   * This is the single biggest saving in the scene. Each guest used to be a
   * ~60-mesh `<Person>`; at 61 guests that was 3,660 draw calls. Collected
   * here and handed to `<GuestCrowd>`, they become one instanced draw call
   * per body type — four in practice, regardless of crowd size.
   *
   * Animated clusters are skipped: they render articulated guests of their
   * own, and including them here would draw those guests twice.
   */
  const crowd = useMemo(() => {
    const members: CrowdMember[] = [];

    for (const b of banquets) {
      members.push(...banquetMembers([b.x, 0, b.z], b.seed));
    }
    for (const c of clusters) {
      if (animatedCluster(c.x, c.z)) continue;
      members.push(...clusterMembers([c.x, 0, c.z], c.seed));
    }

    return members;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [banquets, clusters, currentZoneZ]);

  return (
    <group>
      {/* Deep tree line on the horizon */}
      {forest.map((t, i) =>
        t.isPalm ? (
          <Palm2 key={`f${i}`} position={[t.x, 0, t.z]} scale={t.scale} />
        ) : (
          <Tree key={`f${i}`} position={[t.x, 0, t.z]} scale={t.scale} leafColor={t.leafColor} />
        ),
      )}

      {/* Shrub clumps */}
      {shrubs.map((s, i) => (
        <Shrub
          key={`s${i}`}
          position={[s.x, 0, s.z]}
          scale={s.scale}
          color={s.color}
          blossomColor={s.blossom}
          seed={s.seed}
        />
      ))}

      {/* Canopy pavilions, aimed into frame */}
      {canopies.map((c, i) => (
        <Canopy
          key={`cp${i}`}
          position={[c.x, 0, c.z]}
          scale={c.scale}
          rotation={c.rotation}
          color={c.color}
          // Glow adds a real pointLight, and several canopies can be near the
          // guest at once. Only the single closest one gets it; the rest keep
          // their emissive finial, which costs nothing.
          glow={i === litCanopyIdx}
        />
      ))}

      {/* Banquet tables and chairs — their guests come from <GuestCrowd>. */}
      {banquets.map((b, i) => (
        <BanquetTable key={`b${i}`} position={[b.x, 0, b.z]} />
      ))}

      {/* Cocktail tables. Near clusters also render their own swaying guests. */}
      {clusters.map((c, i) => (
        <GuestCluster
          key={`g${i}`}
          position={[c.x, 0, c.z]}
          seed={c.seed}
          animate={animatedCluster(c.x, c.z)}
        />
      ))}

      {/* Every static guest, as a few instanced draw calls. */}
      <GuestCrowd members={crowd} />

      {/* Warm light poles */}
      {poles.map((p, i) => (
        <LightPole
          key={`p${i}`}
          position={[p.x, 0, p.z]}
          height={p.height}
          lit={isNear(p.z, LIT_RANGE_Z) && Math.abs(p.x) < ANIMATE_RANGE_X}
        />
      ))}
    </group>
  );
}
