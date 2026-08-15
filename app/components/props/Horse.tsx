import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";

/**
 * Horse — a complete redesign as a proper baraat (wedding) horse.
 *
 * Anatomy first: instead of a box on stilts, the body is built from three
 * overlapping muscle masses (chest, barrel, hindquarters), an arched
 * two-segment neck, a real horse head (cranium + tapered muzzle + jaw,
 * eyes, ears), jointed legs (shoulder/thigh, knee/hock, cannon, fetlock,
 * dark hooves) and a flowing tail. A mane runs along the crest of the neck.
 *
 * Then the wedding tack: red & gold saddle cloth with side drapes and
 * tassels, a saddle seat, a gold breast band with bells, a bridle noseband
 * and brow gem, a feathered head plume, and a fresh flower garland around
 * the neck.
 *
 * Idle animation (on by default): gentle head nod, tail sway and a subtle
 * breathing bob — phase-seeded from position so multiple horses don't sync.
 *
 * Usage:
 *   <Horse position={[4, 0, -2]} rotation={[0, Math.PI / 3, 0]} />
 *   <Horse bodyColor="#6e5a48" maneColor="#2e2118" />   // bay horse
 */

interface HorseProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  bodyColor?: string;
  maneColor?: string;
  /** Saddle cloth / drape color */
  clothColor?: string;
  /** Gold trim color */
  trimColor?: string;
  scale?: number;
  animate?: boolean;
}

const HOOF = "#3a3129";
const GARLAND = ["#e8a7ad", "#fff3e4", "#f3c6c9"];

export function Horse({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  bodyColor = "#f5f0e6",
  maneColor = "#cfc0a8",
  clothColor = "#b3122e",
  trimColor = "#c9a04e",
  scale: s = 1,
  animate = true,
}: HorseProps) {
  const rootRef = useRef<Group>(null);
  const headRef = useRef<Group>(null);
  const tailRef = useRef<Group>(null);
  const phase = useMemo(() => position[0] * 2.3 + position[2] * 1.1, [position]);

  useFrame((state) => {
    if (!animate) return;
    const t = state.clock.elapsedTime;
    if (headRef.current) {
      headRef.current.rotation.z = -0.12 + Math.sin(t * 1.3 + phase) * 0.05;
    }
    if (tailRef.current) {
      tailRef.current.rotation.x = Math.sin(t * 1.9 + phase) * 0.16;
    }
    if (rootRef.current) {
      rootRef.current.position.y = Math.sin(t * 2.6 + phase) * 0.008;
    }
  });

  const Body = ({ color }: { color: string }) => (
    <meshStandardMaterial color={color} roughness={0.75} />
  );
  const Gold = () => (
    <meshStandardMaterial color={trimColor} metalness={0.55} roughness={0.35} />
  );

  // Mane: flattened tufts along the crest of the neck
  const mane = useMemo(() => {
    const from = { x: 0.76, y: 1.74 };
    const to = { x: 1.13, y: 2.26 };
    return Array.from({ length: 5 }, (_, i) => {
      const t = i / 4;
      return {
        pos: [
          from.x + (to.x - from.x) * t - 0.09,
          from.y + (to.y - from.y) * t + 0.05,
          0,
        ] as [number, number, number],
        size: 0.15 - t * 0.03,
      };
    });
  }, []);

  // Flower garland around the base of the neck
  const garland = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => {
        const a = (i / 10) * Math.PI * 2;
        const c = Math.cos(a);
        return {
          pos: [0.74 + c * 0.2, 1.5 + c * 0.17, Math.sin(a) * 0.28] as [
            number, number, number,
          ],
          color: GARLAND[i % GARLAND.length],
        };
      }),
    [],
  );

  const FrontLeg = ({ z }: { z: number }) => (
    <group position={[0.52, 0, z]}>
      <mesh position={[0, 0.95, 0]} scale={[1, 1.3, 0.8]} castShadow>
        <sphereGeometry args={[0.14, 8, 8]} />
        <Body color={bodyColor} />
      </mesh>
      <mesh position={[0, 0.66, 0]} castShadow>
        <cylinderGeometry args={[0.085, 0.065, 0.5, 7]} />
        <Body color={bodyColor} />
      </mesh>
      <mesh position={[0, 0.42, 0]}>
        <sphereGeometry args={[0.065, 8, 8]} />
        <Body color={bodyColor} />
      </mesh>
      <mesh position={[0, 0.24, 0]} castShadow>
        <cylinderGeometry args={[0.055, 0.05, 0.34, 7]} />
        <Body color={bodyColor} />
      </mesh>
      <mesh position={[0, 0.09, 0]}>
        <sphereGeometry args={[0.055, 8, 8]} />
        <Body color={bodyColor} />
      </mesh>
      <mesh position={[0, 0.05, 0.01]}>
        <cylinderGeometry args={[0.07, 0.08, 0.1, 8]} />
        <Body color={HOOF} />
      </mesh>
    </group>
  );

  const HindLeg = ({ z }: { z: number }) => (
    <group position={[0, 0, z]}>
      {/* thigh mass */}
      <mesh position={[-0.6, 1.0, 0]} scale={[1.1, 1.35, 0.75]} castShadow>
        <sphereGeometry args={[0.22, 8, 8]} />
        <Body color={bodyColor} />
      </mesh>
      {/* gaskin, angled back to the hock */}
      <mesh position={[-0.66, 0.62, 0]} rotation={[0, 0, -0.18]} castShadow>
        <cylinderGeometry args={[0.095, 0.07, 0.5, 7]} />
        <Body color={bodyColor} />
      </mesh>
      <mesh position={[-0.72, 0.38, 0]}>
        <sphereGeometry args={[0.07, 8, 8]} />
        <Body color={bodyColor} />
      </mesh>
      <mesh position={[-0.72, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.055, 0.05, 0.3, 7]} />
        <Body color={bodyColor} />
      </mesh>
      <mesh position={[-0.72, 0.08, 0]}>
        <sphereGeometry args={[0.055, 8, 8]} />
        <Body color={bodyColor} />
      </mesh>
      <mesh position={[-0.72, 0.05, 0.01]}>
        <cylinderGeometry args={[0.07, 0.08, 0.1, 8]} />
        <Body color={HOOF} />
      </mesh>
    </group>
  );

  return (
    <group position={position} rotation={rotation} scale={s}>
      <group ref={rootRef}>
        {/* ============ Body: chest + barrel + hindquarters ============ */}
        <mesh position={[0.55, 1.25, 0]} scale={[1.1, 1, 0.85]} castShadow>
          <sphereGeometry args={[0.42, 12, 12]} />
          <Body color={bodyColor} />
        </mesh>
        <mesh position={[0, 1.2, 0]} scale={[1.5, 0.95, 0.9]} castShadow>
          <sphereGeometry args={[0.45, 12, 12]} />
          <Body color={bodyColor} />
        </mesh>
        <mesh position={[-0.62, 1.28, 0]} scale={[1.15, 1.05, 0.9]} castShadow>
          <sphereGeometry args={[0.4, 12, 12]} />
          <Body color={bodyColor} />
        </mesh>

        {/* ============ Arched neck ============ */}
        <mesh position={[0.88, 1.68, 0]} rotation={[0, 0, -0.65]} castShadow>
          <cylinderGeometry args={[0.17, 0.24, 0.55, 8]} />
          <Body color={bodyColor} />
        </mesh>
        <mesh position={[1.1, 2.0, 0]} rotation={[0, 0, -0.35]} castShadow>
          <cylinderGeometry args={[0.13, 0.17, 0.5, 8]} />
          <Body color={bodyColor} />
        </mesh>

        {/* Mane along the crest */}
        {mane.map((m, i) => (
          <mesh key={i} position={m.pos} scale={[0.55, 1, 0.22]}>
            <sphereGeometry args={[m.size, 8, 8]} />
            <Body color={maneColor} />
          </mesh>
        ))}

        {/* ============ Head (pivots at the top of the neck) ============ */}
        <group ref={headRef} position={[1.19, 2.16, 0]} rotation={[0, 0, -0.12]}>
          {/* cranium */}
          <mesh position={[0.03, 0.02, 0]} scale={[1.15, 1, 0.9]} castShadow>
            <sphereGeometry args={[0.17, 10, 10]} />
            <Body color={bodyColor} />
          </mesh>
          {/* muzzle, tapering forward-down */}
          <mesh position={[0.26, -0.1, 0]} rotation={[0, 0, -1.9]} castShadow>
            <cylinderGeometry args={[0.085, 0.13, 0.4, 8]} />
            <Body color={bodyColor} />
          </mesh>
          <mesh position={[0.45, -0.16, 0]}>
            <sphereGeometry args={[0.09, 8, 8]} />
            <Body color={bodyColor} />
          </mesh>
          {/* jaw */}
          <mesh position={[0.08, -0.12, 0]} scale={[1.3, 0.75, 0.8]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <Body color={bodyColor} />
          </mesh>
          {/* eyes */}
          {[0.135, -0.135].map((z, i) => (
            <mesh key={i} position={[0.14, 0.05, z]}>
              <sphereGeometry args={[0.032, 8, 8]} />
              <meshStandardMaterial color="#1c1410" roughness={0.3} />
            </mesh>
          ))}
          {/* ears */}
          {[0.08, -0.08].map((z, i) => (
            <mesh
              key={i}
              position={[-0.06, 0.18, z]}
              rotation={[Math.sign(z) * 0.22, 0, 0.28]}
            >
              <coneGeometry args={[0.05, 0.17, 5]} />
              <Body color={bodyColor} />
            </mesh>
          ))}
          {/* brow gem */}
          <mesh position={[0.15, 0.09, 0]}>
            <icosahedronGeometry args={[0.032, 0]} />
            <Gold />
          </mesh>
          {/* bridle noseband */}
          <group position={[0.3, -0.12, 0]} rotation={[0, 0, -0.32]}>
            <mesh rotation={[0, Math.PI / 2, 0]}>
              <torusGeometry args={[0.12, 0.017, 8, 16]} />
              <Gold />
            </mesh>
          </group>
          {/* feathered plume */}
          <group position={[0.0, 0.26, 0]}>
            <mesh position={[0, 0.03, 0]}>
              <cylinderGeometry args={[0.03, 0.05, 0.08, 8]} />
              <Gold />
            </mesh>
            {[0, 0.35, -0.35].map((rz, i) => (
              <mesh key={i} position={[0, 0.2, 0]} rotation={[0, 0, rz]}>
                <coneGeometry args={[0.045, 0.3, 5]} />
                <meshStandardMaterial
                  color={i === 1 ? "#fff3e4" : "#f05a8e"}
                  emissive={i === 1 ? "#000000" : "#881144"}
                  emissiveIntensity={0.2}
                  roughness={0.6}
                />
              </mesh>
            ))}
          </group>
        </group>

        {/* ============ Legs ============ */}
        <FrontLeg z={0.26} />
        <FrontLeg z={-0.26} />
        <HindLeg z={0.27} />
        <HindLeg z={-0.27} />

        {/* ============ Tail (pivots at the dock) ============ */}
        <group ref={tailRef} position={[-1.0, 1.45, 0]}>
          <mesh>
            <sphereGeometry args={[0.07, 8, 8]} />
            <Body color={bodyColor} />
          </mesh>
          <mesh position={[-0.1, -0.28, 0]} rotation={[0, 0, 0.35]}>
            <cylinderGeometry args={[0.06, 0.1, 0.5, 7]} />
            <Body color={maneColor} />
          </mesh>
          <mesh position={[-0.22, -0.62, 0]} rotation={[Math.PI, 0, -0.2]}>
            <coneGeometry args={[0.1, 0.36, 6]} />
            <Body color={maneColor} />
          </mesh>
        </group>

        {/* ============ Wedding tack ============ */}
        {/* gold underlay + saddle cloth */}
        <mesh position={[0, 1.62, 0]}>
          <boxGeometry args={[0.92, 0.05, 1.0]} />
          <Gold />
        </mesh>
        <mesh position={[0, 1.66, 0]}>
          <boxGeometry args={[0.85, 0.07, 0.92]} />
          <meshStandardMaterial color={clothColor} roughness={0.55} />
        </mesh>
        {/* side drapes with tassels */}
        {[0.47, -0.47].map((z, i) => (
          <group key={i}>
            <mesh position={[0, 1.46, z]}>
              <boxGeometry args={[0.62, 0.38, 0.03]} />
              <meshStandardMaterial color={clothColor} roughness={0.55} />
            </mesh>
            {[-0.2, 0, 0.2].map((x, j) => (
              <mesh key={j} position={[x, 1.23, z]} rotation={[Math.PI, 0, 0]}>
                <coneGeometry args={[0.028, 0.1, 5]} />
                <Gold />
              </mesh>
            ))}
          </group>
        ))}
        {/* saddle seat + pommel */}
        <mesh position={[0, 1.72, 0]} castShadow>
          <cylinderGeometry args={[0.26, 0.28, 0.09, 10]} />
          <meshStandardMaterial color={clothColor} roughness={0.5} />
        </mesh>
        <mesh position={[0.22, 1.78, 0]}>
          <sphereGeometry args={[0.045, 8, 8]} />
          <Gold />
        </mesh>
        {/* breast band + bells */}
        <mesh position={[0.86, 1.22, 0]} rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[0.33, 0.022, 8, 20]} />
          <Gold />
        </mesh>
        {[[0.98, 0.97, 0], [0.94, 1.0, 0.15], [0.94, 1.0, -0.15]].map((p, i) => (
          <mesh key={i} position={p as [number, number, number]}>
            <sphereGeometry args={[0.034, 8, 8]} />
            <Gold />
          </mesh>
        ))}

        {/* ============ Flower garland ============ */}
        {garland.map((g, i) => (
          <mesh key={i} position={g.pos}>
            <icosahedronGeometry args={[0.05, 1]} />
            <meshStandardMaterial color={g.color} roughness={0.65} />
          </mesh>
        ))}
      </group>
    </group>
  );
}