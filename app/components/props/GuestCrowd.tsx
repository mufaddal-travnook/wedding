'use client';

import { useLayoutEffect, useMemo, useRef } from 'react';
import { DoubleSide, InstancedMesh, Object3D } from 'three';
import { guestGeometry, DEFAULT_SKIN } from './guest-geometry';
import { stdMat } from '@/app/lib/three-cache';
import type { GuestVariant } from './guest-variants';

/**
 * GuestCrowd — every static background guest in the scene, drawn as a handful
 * of instanced draw calls.
 *
 * Previously each guest was a `<Person>` of ~60 meshes. Sixty-one background
 * guests meant 3,660 draw calls, about 60% of the whole scene.
 *
 * Guests are grouped by baked body geometry (variant + colourway), and each
 * group becomes one `InstancedMesh`. Since the scene draws from four variants
 * in their default colours, that is four draw calls for the entire crowd
 * regardless of how many guests there are.
 *
 * Per-guest variation rides in the instance matrix (position, rotation,
 * uniform scale). Colour is already baked into each body's vertex-colour
 * attribute, so no `setColorAt` pass is needed — and colour therefore costs
 * nothing per instance.
 *
 * Animated guests do NOT belong here: a merged body is rigid. They keep the
 * articulated `<Person>` path, which is why `RoadsideDecor` only animates the
 * few clusters near the camera.
 */

export interface CrowdMember {
  variant: GuestVariant;
  position: [number, number, number];
  /** Y-axis rotation in radians. */
  rotationY: number;
  scale: number;
  /** Optional colourway overrides; defaults come from the variant. */
  clothColor?: string;
  accentColor?: string;
  skinColor?: string;
}

interface GuestCrowdProps {
  members: CrowdMember[];
}

/** Instances sharing one baked body. */
interface Batch {
  key: string;
  variant: GuestVariant;
  cloth?: string;
  accent?: string;
  skin: string;
  members: CrowdMember[];
}

export function GuestCrowd({ members }: GuestCrowdProps) {
  /**
   * Bucket guests by the body they will be drawn with. This is the whole
   * optimisation: one bucket becomes one draw call.
   */
  const batches = useMemo(() => {
    const byBody = new Map<string, Batch>();

    for (const m of members) {
      const skin = m.skinColor ?? DEFAULT_SKIN;
      const key = `${m.variant}|${m.clothColor ?? ''}|${m.accentColor ?? ''}|${skin}`;

      let batch = byBody.get(key);
      if (!batch) {
        batch = {
          key,
          variant: m.variant,
          cloth: m.clothColor,
          accent: m.accentColor,
          skin,
          members: [],
        };
        byBody.set(key, batch);
      }
      batch.members.push(m);
    }

    return [...byBody.values()];
  }, [members]);

  return (
    <>
      {batches.map((b) => (
        <GuestBatch key={b.key} batch={b} />
      ))}
    </>
  );
}

/**
 * The shared material for every guest body.
 *
 * `vertexColors` is what makes merging viable — all per-guest colour lives in
 * the geometry, so one material serves the entire crowd and Three can batch
 * freely. DoubleSide because the low-poly bodies have open shells (the
 * flared coats and gowns are unclosed cylinders).
 */
const guestMaterial = () =>
  stdMat({
    color: '#ffffff',
    roughness: 0.72,
    vertexColors: true,
    side: DoubleSide,
  });

function GuestBatch({ batch }: { batch: Batch }) {
  const ref = useRef<InstancedMesh>(null);

  const geo = useMemo(
    () => guestGeometry(batch.variant, batch.cloth, batch.accent, batch.skin),
    [batch.variant, batch.cloth, batch.accent, batch.skin],
  );
  const mat = useMemo(() => guestMaterial(), []);

  /**
   * Write the instance matrices once.
   *
   * `useLayoutEffect` rather than `useEffect` so the buffer is populated
   * before the first paint — with `useEffect` the crowd flashes at the origin
   * for one frame. Nothing here runs per-frame: static guests never move, so
   * the matrix buffer is written on mount and left alone.
   */
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;

    const dummy = new Object3D();
    for (let i = 0; i < batch.members.length; i++) {
      const m = batch.members[i];
      dummy.position.set(m.position[0], m.position[1], m.position[2]);
      dummy.rotation.set(0, m.rotationY, 0);
      dummy.scale.setScalar(m.scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.count = batch.members.length;
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [batch.members]);

  return (
    <instancedMesh
      ref={ref}
      args={[geo, mat, batch.members.length]}
      castShadow
      receiveShadow
    />
  );
}
