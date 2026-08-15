import { useMemo } from "react";

/**
 * GatePost — an elegant wedding entrance post.
 *
 * Ivory marble shaft, champagne-gold moldings, a blush rose garland
 * and a softly glowing finial. Drop-in replacement for the old post:
 * default usage is still <GatePost x={-6} /> / <GatePost x={6} />.
 *
 * Theming (e.g. Mehendi gate):
 *   <GatePost x={-6} accent="#b9a13c" flowerColors={["#f4d35e", "#e9edc9", "#a7c957"]} />
 */

const IVORY = "#fdf9f3";
const GOLD = "#d4af61";
const BLUSH = "#f3c6c9";
const ROSE = "#e8a7ad";
const CREAM = "#fff3e4";
const LEAF = "#9fb98a";

// Deterministic pseudo-random so the garland never "re-blooms" between renders
const rand = (i: number, salt = 0) => {
  const s = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return s - Math.floor(s);
};

type GatePostProps = {
  x: number;
  /** Metallic accent for moldings, capital and finial */
  accent?: string;
  /** Blossom colors, cycled around the garland */
  flowerColors?: string[];
  /** Warm point light + emissive finial (lovely at dusk; disable for bright day scenes) */
  glow?: boolean;
};

function GoldMaterial({ color, emissive }: { color: string; emissive?: boolean }) {
  return (
    <meshStandardMaterial
      color={color}
      metalness={0.75}
      roughness={0.28}
      emissive={emissive ? color : "#000000"}
      emissiveIntensity={emissive ? 0.22 : 0}
    />
  );
}

function MarbleMaterial() {
  return <meshStandardMaterial color={IVORY} roughness={0.42} metalness={0.05} />;
}

function Garland({ y, accentColors }: { y: number; accentColors: string[] }) {
  const blossoms = useMemo(() => {
    const N = 14;
    return Array.from({ length: N }, (_, i) => {
      const a = (i / N) * Math.PI * 2;
      const r = 0.52 + rand(i) * 0.06;
      const droop = Math.sin(a * 2) * 0.14; // gentle swag rise & fall
      return {
        pos: [Math.cos(a) * r, y + droop, Math.sin(a) * r] as [number, number, number],
        size: 0.09 + rand(i, 1) * 0.05,
        color: accentColors[i % accentColors.length],
        leaf: rand(i, 2) > 0.45,
        leafRot: rand(i, 3) * Math.PI * 2,
      };
    });
  }, [y, accentColors]);

  return (
    <group>
      {/* vine the blossoms sit on */}
      <mesh position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.54, 0.02, 8, 40]} />
        <meshStandardMaterial color={LEAF} roughness={0.8} />
      </mesh>
      {blossoms.map((b, i) => (
        <group key={i} position={b.pos}>
          <mesh castShadow>
            <icosahedronGeometry args={[b.size, 1]} />
            <meshStandardMaterial color={b.color} roughness={0.65} />
          </mesh>
          {b.leaf && (
            <mesh position={[0, -b.size * 0.9, 0]} rotation={[0.4, b.leafRot, 0]}>
              <coneGeometry args={[b.size * 0.55, b.size * 1.4, 5]} />
              <meshStandardMaterial color={LEAF} roughness={0.8} />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
}

export default function GatePost({
  x,
  accent = GOLD,
  flowerColors = [ROSE, BLUSH, CREAM],
  glow = true,
}: GatePostProps) {
  return (
    <group position={[x, 0, 0]}>
      {/* ---- Plinth: two stepped tiers + gold molding ---- */}
      <mesh position={[0, 0.14, 0]} receiveShadow>
        <cylinderGeometry args={[0.78, 0.86, 0.28, 28]} />
        <MarbleMaterial />
      </mesh>
      <mesh position={[0, 0.42, 0]} receiveShadow>
        <cylinderGeometry args={[0.62, 0.72, 0.3, 28]} />
        <MarbleMaterial />
      </mesh>
      <mesh position={[0, 0.6, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.6, 0.045, 10, 40]} />
        <GoldMaterial color={accent} />
      </mesh>

      {/* ---- Shaft: gently tapered marble column ---- */}
      <mesh position={[0, 3.9, 0]} castShadow>
        <cylinderGeometry args={[0.36, 0.46, 6.6, 28]} />
        <MarbleMaterial />
      </mesh>

      {/* Gold band moldings at the thirds */}
      <mesh position={[0, 2.4, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.44, 0.028, 10, 40]} />
        <GoldMaterial color={accent} />
      </mesh>
      <mesh position={[0, 5.0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.405, 0.028, 10, 40]} />
        <GoldMaterial color={accent} />
      </mesh>

      {/* ---- Rose garland ---- */}
      <Garland y={5.85} accentColors={flowerColors} />

      {/* ---- Capital: neck ring, cushion torus, abacus ---- */}
      <mesh position={[0, 7.14, 0]}>
        <cylinderGeometry args={[0.42, 0.38, 0.14, 28]} />
        <GoldMaterial color={accent} />
      </mesh>
      <mesh position={[0, 7.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.44, 0.09, 12, 40]} />
        <MarbleMaterial />
      </mesh>
      <mesh position={[0, 7.5, 0]}>
        <cylinderGeometry args={[0.56, 0.52, 0.18, 28]} />
        <GoldMaterial color={accent} />
      </mesh>

      {/* ---- Finial: orb, halo ring, teardrop tip ---- */}
      <mesh position={[0, 7.95, 0]} castShadow>
        <sphereGeometry args={[0.34, 24, 24]} />
        <GoldMaterial color={accent} emissive={glow} />
      </mesh>
      <mesh position={[0, 7.95, 0]} rotation={[Math.PI / 2.6, 0, 0]}>
        <torusGeometry args={[0.46, 0.02, 10, 48]} />
        <GoldMaterial color={accent} />
      </mesh>
      <mesh position={[0, 8.42, 0]}>
        <coneGeometry args={[0.11, 0.5, 20]} />
        <GoldMaterial color={accent} emissive={glow} />
      </mesh>

      {/* Warm evening glow */}
      {glow && (
        <pointLight
          position={[0, 8.1, 0]}
          color="#ffd9a0"
          intensity={1.1}
          distance={9}
          decay={2}
        />
      )}
    </group>
  );
}