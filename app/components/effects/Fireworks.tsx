import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { NormalOrGLBufferAttributes } from 'three';
import { Points, BufferGeometry, Float32BufferAttribute, PointsMaterial, AdditiveBlending, Color } from 'three';
import { useDisposableSet } from '@/app/lib/use-disposable';

const COLORS = ['#ffd27a', '#f05a8e', '#9ecbff', '#9ed64f', '#e8b0ff'];
const PARTICLE_COUNT = 60;
const MAX_FIREWORKS = 4;

interface Burst {
  active: boolean;
  originX: number;
  originY: number;
  originZ: number;
  life: number;
  color: Color;
  velocities: Float32Array;
}

interface FireworksProps {
  zoneZ: number;
  enabled?: boolean;
}

export function Fireworks({ zoneZ, enabled = true }: FireworksProps) {
  // R3F hands back Points typed with its looser buffer-attribute generic, so
  // the ref is widened to match rather than narrowed with a cast.
  const groupRef = useRef<(Points<BufferGeometry<NormalOrGLBufferAttributes>> | null)[]>([]);
  const burstsRef = useRef<Burst[]>(
    Array.from({ length: MAX_FIREWORKS }, () => ({
      active: false,
      originX: 0, originY: 0, originZ: 0,
      life: 0,
      color: new Color('#ffd27a'),
      velocities: new Float32Array(PARTICLE_COUNT * 3),
    }))
  );
  /**
   * Countdown to the next burst.
   *
   * Randomness is genuinely wanted here — fireworks should not fire on a
   * metronome, and nothing about this is server-rendered — but the seed is
   * drawn on first use rather than in the initialiser, so render itself stays
   * pure.
   */
  const timerRef = useRef<number | null>(null);

  /**
   * The point clouds each burst writes into.
   *
   * These used to be constructed inside the render body, so every React
   * render allocated four fresh BufferGeometries and orphaned the previous
   * four. Three.js does not garbage-collect GPU memory — an orphaned geometry
   * keeps its WebGL buffer until context loss — so the leak grew without
   * bound over a session. Built once here, and disposed on unmount.
   */
  const { geometries } = useDisposableSet(
    () => ({
      geometries: Array.from({ length: MAX_FIREWORKS }, () => {
        const geo = new BufferGeometry();
        geo.setAttribute(
          'position',
          new Float32BufferAttribute(new Float32Array(PARTICLE_COUNT * 3), 3),
        );
        return geo;
      }),
    }),
    [],
  );

  useFrame((state, delta) => {
    if (!enabled) return;

    // Spawn timer. Seeded on the first frame rather than during render, so
    // render stays pure.
    if (timerRef.current === null) {
      timerRef.current = 1 + Math.random() * 2;
    }

    timerRef.current -= delta;
    if (timerRef.current <= 0) {
      timerRef.current = 0.8 + Math.random() * 1.5;

      // Find inactive burst
      const burst = burstsRef.current.find((b) => !b.active);
      if (burst) {
        burst.active = true;
        burst.life = 0;
        burst.originX = (Math.random() - 0.5) * 30;
        burst.originY = 14 + Math.random() * 10;
        burst.originZ = zoneZ + (Math.random() - 0.5) * 20;
        burst.color.set(COLORS[Math.floor(Math.random() * COLORS.length)]);

        // Random spherical velocities
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(Math.random() * 2 - 1);
          const speed = 2.5 + Math.random() * 4;
          burst.velocities[i * 3] = Math.sin(phi) * Math.cos(theta) * speed;
          burst.velocities[i * 3 + 1] = Math.cos(phi) * speed;
          burst.velocities[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * speed;
        }
      }
    }

    // Update each burst
    burstsRef.current.forEach((burst, bi) => {
      const pts = groupRef.current[bi];
      if (!pts || !burst.active) {
        if (pts) (pts.material as PointsMaterial).opacity = 0;
        return;
      }

      burst.life += delta;
      // These geometries are built above with a Float32BufferAttribute, so the
      // looser element-level attribute type is narrowed back here.
      const posAttr = pts.geometry.attributes.position as Float32BufferAttribute;

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        // Apply gravity
        burst.velocities[i * 3 + 1] -= 2.8 * delta;

        const px = burst.originX + burst.velocities[i * 3] * burst.life;
        const py = burst.originY + burst.velocities[i * 3 + 1] * burst.life;
        const pz = burst.originZ + burst.velocities[i * 3 + 2] * burst.life;

        posAttr.setXYZ(i, px, py, pz);
      }
      posAttr.needsUpdate = true;

      const mat = pts.material as PointsMaterial;
      mat.color.copy(burst.color);
      mat.opacity = Math.max(0, 1 - burst.life / 2.2);

      if (burst.life > 2.2) {
        burst.active = false;
        mat.opacity = 0;
      }
    });
  });

  return (
    <group>
      {geometries.map((geo, i) => (
        <points
          key={i}
          ref={(el) => { groupRef.current[i] = el; }}
          geometry={geo}
        >
          <pointsMaterial
            size={0.35}
            transparent
            opacity={0}
            sizeAttenuation
            blending={AdditiveBlending}
            depthWrite={false}
          />
        </points>
      ))}
    </group>
  );
}
