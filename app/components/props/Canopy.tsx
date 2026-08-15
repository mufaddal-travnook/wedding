import { useMemo } from 'react';
import { DoubleSide } from 'three';

/**
 * Canopy — an elegant wedding pavilion (mandap-style).
 *
 * Two-tier pagoda roof whose corners land on the posts, tied by cross-beams,
 * with gold eave trim and corner orbs. A scalloped valance runs the eaves;
 * sheer corner drapes hang with gold tiebacks, flower swags sag between the
 * posts, and a marble dais with a gold rim sits underfoot.
 *
 * `glow` adds warm light under the roof plus hanging string-light dots for
 * evening scenes — use it sparingly, each one is a real pointLight.
 *
 * Usage:
 *   <Canopy position={[0, 0, -20]} />
 *   <Canopy position={[0, 0, -20]} color="#f6efe2" accent="#b9a13c" glow />
 */

interface CanopyProps {
  position: [number, number, number];
  scale?: number;
  /** Roof fabric color */
  color?: string;
  /** Gold trim color */
  accent?: string;
  /** Corner drape fabric */
  drapeColor?: string;
  /** Swag blossom colors, cycled */
  flowerColors?: string[];
  rotation?: number;
  glow?: boolean;
}

/** Post distance from centre on each axis. */
const POST = 1.6;
/** Roof edge distance (posts + overhang). */
const EAVE = 1.77;

/**
 * Footprint radius in world units at scale=1 — the dais is the widest part.
 * Placement code uses this to keep canopies from overlapping each other or
 * intruding on the road.
 */
export const CANOPY_RADIUS = 2.45;
/** Overall height at scale=1, finial tip included. */
export const CANOPY_HEIGHT = 5.2;

export function Canopy({
  position,
  scale = 1,
  color = '#fdf8f2',
  accent = '#c9a04e',
  drapeColor = '#fbf6ee',
  flowerColors = ['#e8a7ad', '#fff3e4', '#f3c6c9'],
  rotation = 0,
  glow = false,
}: CanopyProps) {
  const corners = useMemo(
    () =>
      [
        [-POST, -POST],
        [POST, -POST],
        [-POST, POST],
        [POST, POST],
      ] as [number, number][],
    [],
  );

  // Scalloped valance: hanging half-discs along all four eaves
  const scallops = useMemo(() => {
    const out: { pos: [number, number, number]; rotY: number; alt: boolean }[] = [];
    const N = 6;
    for (let i = 0; i < N; i++) {
      const t = -1.5 + (i / (N - 1)) * 3.0;
      out.push({ pos: [t, 2.58, EAVE], rotY: 0, alt: i % 2 === 0 });
      out.push({ pos: [t, 2.58, -EAVE], rotY: 0, alt: i % 2 === 0 });
      out.push({ pos: [EAVE, 2.58, t], rotY: Math.PI / 2, alt: i % 2 === 0 });
      out.push({ pos: [-EAVE, 2.58, t], rotY: Math.PI / 2, alt: i % 2 === 0 });
    }
    return out;
  }, []);

  // Flower swags sagging between the posts on all four sides
  const swags = useMemo(() => {
    const out: { pos: [number, number, number]; color: string }[] = [];
    const N = 5;
    for (let side = 0; side < 4; side++) {
      for (let i = 0; i < N; i++) {
        const t = -1.15 + (i / (N - 1)) * 2.3;
        const sag = (1 - Math.pow(t / 1.15, 2)) * 0.38;
        const y = 2.48 - sag;
        const c = flowerColors[(side + i) % flowerColors.length];
        if (side === 0) out.push({ pos: [t, y, POST + 0.04], color: c });
        if (side === 1) out.push({ pos: [t, y, -POST - 0.04], color: c });
        if (side === 2) out.push({ pos: [POST + 0.04, y, t], color: c });
        if (side === 3) out.push({ pos: [-POST - 0.04, y, t], color: c });
      }
    }
    return out;
  }, [flowerColors]);

  // Hanging string-light dots under the roof (deterministic ring)
  const lights = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2 + 0.3;
        const r = 0.9 + (i % 3) * 0.35;
        return [Math.cos(a) * r, 2.28 + (i % 2) * 0.18, Math.sin(a) * r] as [
          number,
          number,
          number,
        ];
      }),
    [],
  );

  const Gold = () => (
    <meshStandardMaterial color={accent} metalness={0.55} roughness={0.35} />
  );

  return (
    <group position={position} rotation={[0, rotation, 0]} scale={scale}>
      {/* ---- Dais: marble platform with gold rim ---- */}
      <mesh position={[0, 0.07, 0]} receiveShadow>
        <cylinderGeometry args={[2.35, CANOPY_RADIUS, 0.14, 24]} />
        <meshStandardMaterial color="#f7f1e8" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.145, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.32, 0.028, 8, 40]} />
        <Gold />
      </mesh>

      {/* ---- Posts with gold base + capital rings ---- */}
      {corners.map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position={[0, 1.38, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.09, 2.5, 10]} />
            <meshStandardMaterial color="#f3ecdd" roughness={0.55} />
          </mesh>
          <mesh position={[0, 0.22, 0]}>
            <cylinderGeometry args={[0.13, 0.16, 0.16, 10]} />
            <Gold />
          </mesh>
          <mesh position={[0, 2.56, 0]}>
            <cylinderGeometry args={[0.11, 0.09, 0.12, 10]} />
            <Gold />
          </mesh>
        </group>
      ))}

      {/* ---- Cross beams tying the frame ---- */}
      {[POST, -POST].map((z, i) => (
        <mesh key={`bz${i}`} position={[0, 2.66, z]}>
          <boxGeometry args={[POST * 2 + 0.2, 0.09, 0.09]} />
          <meshStandardMaterial color="#f3ecdd" roughness={0.6} />
        </mesh>
      ))}
      {[POST, -POST].map((x, i) => (
        <mesh key={`bx${i}`} position={[x, 2.66, 0]}>
          <boxGeometry args={[0.09, 0.09, POST * 2 + 0.2]} />
          <meshStandardMaterial color="#f3ecdd" roughness={0.6} />
        </mesh>
      ))}

      {/* ---- Two-tier pagoda roof (corners aligned with the posts) ---- */}
      <mesh position={[0, 3.25, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[2.5, 1.1, 4]} />
        <meshStandardMaterial color={color} roughness={0.65} flatShading />
      </mesh>
      <mesh position={[0, 4.1, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[1.3, 0.9, 4]} />
        <meshStandardMaterial color={color} roughness={0.65} flatShading />
      </mesh>
      {/* band between tiers */}
      <mesh position={[0, 3.72, 0]} rotation={[0, Math.PI / 4, 0]}>
        <cylinderGeometry args={[1.28, 1.32, 0.1, 4]} />
        <Gold />
      </mesh>

      {/* ---- Gold eave trim + corner orbs ---- */}
      {[EAVE, -EAVE].map((z, i) => (
        <mesh key={`tz${i}`} position={[0, 2.72, z]}>
          <boxGeometry args={[EAVE * 2, 0.055, 0.07]} />
          <Gold />
        </mesh>
      ))}
      {[EAVE, -EAVE].map((x, i) => (
        <mesh key={`tx${i}`} position={[x, 2.72, 0]}>
          <boxGeometry args={[0.07, 0.055, EAVE * 2]} />
          <Gold />
        </mesh>
      ))}
      {corners.map(([x, z], i) => (
        <mesh key={`o${i}`} position={[(x / POST) * EAVE, 2.75, (z / POST) * EAVE]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <Gold />
        </mesh>
      ))}

      {/* ---- Scalloped valance ---- */}
      {scallops.map((sc, i) => (
        <mesh key={i} position={sc.pos} rotation={[0, sc.rotY, 0]} scale={[1, 0.72, 0.22]}>
          <sphereGeometry args={[0.17, 8, 8]} />
          <meshStandardMaterial
            color={sc.alt ? color : accent}
            metalness={sc.alt ? 0 : 0.4}
            roughness={0.6}
          />
        </mesh>
      ))}

      {/* ---- Sheer corner drapes with gold tiebacks ---- */}
      {corners.map(([x, z], i) => (
        <group key={`d${i}`} position={[x * 1.06, 0, z * 1.06]}>
          <mesh position={[0, 1.42, 0]}>
            {/* Open-ended cylinder — needs DoubleSide or the inner face vanishes. */}
            <cylinderGeometry args={[0.12, 0.3, 2.35, 10, 1, true]} />
            <meshStandardMaterial
              color={drapeColor}
              roughness={0.8}
              transparent
              opacity={0.82}
              side={DoubleSide}
            />
          </mesh>
          <mesh position={[0, 1.35, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.17, 0.022, 8, 16]} />
            <Gold />
          </mesh>
        </group>
      ))}

      {/* ---- Flower swags between posts ---- */}
      {swags.map((sw, i) => (
        <mesh key={i} position={sw.pos}>
          <icosahedronGeometry args={[0.07, 1]} />
          <meshStandardMaterial color={sw.color} roughness={0.65} />
        </mesh>
      ))}

      {/* ---- Finial: orb + tip ---- */}
      <mesh position={[0, 4.68, 0]}>
        <sphereGeometry args={[0.14, 12, 12]} />
        <meshStandardMaterial
          color={accent}
          metalness={0.6}
          roughness={0.3}
          emissive={glow ? accent : '#000000'}
          emissiveIntensity={glow ? 0.25 : 0}
        />
      </mesh>
      <mesh position={[0, 4.92, 0]}>
        <coneGeometry args={[0.06, 0.3, 10]} />
        <Gold />
      </mesh>

      {/* ---- Evening glow ---- */}
      {glow && (
        <>
          <pointLight
            position={[0, 2.9, 0]}
            color="#ffd9a0"
            intensity={1.3}
            distance={11}
            decay={2}
          />
          {lights.map((p, i) => (
            <mesh key={i} position={p}>
              <sphereGeometry args={[0.032, 6, 6]} />
              <meshStandardMaterial
                color="#ffe6b8"
                emissive="#ffca7a"
                emissiveIntensity={1.6}
              />
            </mesh>
          ))}
        </>
      )}
    </group>
  );
}
