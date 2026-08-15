import { Person as Person2 } from './person2';
import { rand } from '@/app/lib/seeded-random';
import { GUEST_VARIANTS } from './guest-variants';

/**
 * GuestCluster — a knot of guests standing and talking around a cocktail
 * table, each turned to face the table.
 */

interface GuestClusterProps {
  position: [number, number, number];
  /** Drives group size, spacing and outfits. */
  seed: number;
  /**
   * Idle sway costs a per-person useFrame callback every frame. Enable it
   * only for clusters near the camera — at distance the motion is invisible.
   */
  animate?: boolean;
}

export function GuestCluster({ position, seed, animate = false }: GuestClusterProps) {
  const count = 3 + Math.floor(rand(seed, 11) * 2);

  return (
    <group position={position}>
      {/* Cloth cocktail table */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.4, 0.48, 1.0, 12]} />
        <meshStandardMaterial color="#fdf8f2" roughness={0.75} />
      </mesh>
      <mesh position={[0, 1.02, 0]}>
        <cylinderGeometry args={[0.54, 0.54, 0.05, 14]} />
        <meshStandardMaterial color="#f3e9d6" roughness={0.6} />
      </mesh>

      {Array.from({ length: count }, (_, i) => {
        // Spread around the table, nudged so the ring never looks mechanical.
        const angle = (i / count) * Math.PI * 2 + rand(seed, i) * 0.5;
        const radius = 1.15 + rand(seed, i + 30) * 0.3;

        return (
          <Person2
            key={i}
            variant={GUEST_VARIANTS[Math.floor(rand(seed, i + 60) * GUEST_VARIANTS.length)]}
            position={[Math.cos(angle) * radius, 0, Math.sin(angle) * radius]}
            rotation={[0, -angle + Math.PI / 2, 0]}
            scale={1.55 + rand(seed, i + 90) * 0.2}
            animate={animate}
          />
        );
      })}
    </group>
  );
}
