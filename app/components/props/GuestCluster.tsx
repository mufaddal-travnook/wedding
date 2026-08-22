import { Person as Person2 } from './person2';
import { clusterMembers } from './crowd-layout';
import { cylinderGeo, stdMat } from '@/app/lib/three-cache';

/**
 * GuestCluster — the cocktail table at the centre of a knot of guests.
 *
 * The guests themselves are NOT drawn here. They are collected by
 * `RoadsideDecor` into a single `<GuestCrowd>` so the whole crowd batches
 * into a few instanced draw calls; rendering them per-cluster would scope
 * batching to three guests at a time.
 *
 * The exception is `animate`: a batched guest is rigid, so clusters near the
 * camera still build articulated `<Person>` instances that can sway. That
 * path is deliberately rare — see ANIMATE_RANGE_Z in RoadsideDecor.
 */

interface GuestClusterProps {
  position: [number, number, number];
  /** Drives group size, spacing and outfits. */
  seed: number;
  /**
   * Idle sway costs a per-person useFrame callback every frame, and forces
   * the guests out of the instanced batch. Enable it only for clusters near
   * the camera — at distance the motion is invisible.
   */
  animate?: boolean;
}

export function GuestCluster({ position, seed, animate = false }: GuestClusterProps) {
  return (
    <group position={position}>
      {/* Cloth cocktail table */}
      <mesh
        position={[0, 0.5, 0]}
        castShadow
        geometry={cylinderGeo(0.4, 0.48, 1.0, 12)}
        material={stdMat({ color: '#fdf8f2', roughness: 0.75 })}
      />
      <mesh
        position={[0, 1.02, 0]}
        geometry={cylinderGeo(0.54, 0.54, 0.05, 14)}
        material={stdMat({ color: '#f3e9d6', roughness: 0.6 })}
      />

      {/* Near-camera clusters only: articulated guests that can sway. */}
      {animate &&
        clusterMembers([0, 0, 0], seed).map((m, i) => (
          <Person2
            key={i}
            variant={m.variant}
            position={m.position}
            rotation={[0, m.rotationY, 0]}
            scale={m.scale}
            animate
          />
        ))}
    </group>
  );
}
