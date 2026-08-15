import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";

/**
 * Person — low-poly wedding guests in four outfits.
 *
 * Variants:
 *  - "sherwani": cream & gold sherwani with stole, churidar and a safa
 *    (turban) with kalgi — groom's side classic.
 *  - "thobe":    white kandura/thobe with ghutra + black agal.
 *  - "hijabi":   flowing gown with gold hem, hijab and chest drape.
 *  - "suit":     navy suit, white shirt, tie and dress shoes.
 *
 * Fixes over the old version:
 *  - Arms pivot at the SHOULDER (wrapped in groups), so animation looks
 *    natural instead of rotating about the elbow.
 *  - Hands, shoes/headwear per variant, and a gentle idle bob.
 *  - `wave` raises the right arm and waves it — perfect for guests
 *    greeting the car as it drives past.
 *  - Deterministic phase from position: crowds don't sway in sync.
 *
 * Usage:
 *   <Person variant="sherwani" position={[2, 0, 5]} animate />
 *   <Person variant="thobe" wave animate />
 *   <Person variant="hijabi" clothColor="#3f6b4f" />   // Mehendi palette
 */

type Variant = "sherwani" | "thobe" | "hijabi" | "suit";

interface PersonProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  variant?: Variant;
  /** Main garment color (has a sensible default per variant) */
  clothColor?: string;
  /** Trim / stole / tie color */
  accentColor?: string;
  skinColor?: string;
  scale?: number;
  animate?: boolean; // idle sway + bob
  wave?: boolean;    // right arm raised, waving
}

const DEFAULTS: Record<Variant, { cloth: string; accent: string }> = {
  sherwani: { cloth: "#f3e9d6", accent: "#c9a04e" },
  thobe: { cloth: "#fbfaf6", accent: "#8c1d2f" },
  hijabi: { cloth: "#7c3f58", accent: "#c9a04e" },
  suit: { cloth: "#2b3a55", accent: "#7a1f2b" },
};

export function Person({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  variant = "sherwani",
  clothColor,
  accentColor,
  skinColor = "#d9a679",
  scale: s = 1,
  animate = false,
  wave = false,
}: PersonProps) {
  const cloth = clothColor ?? DEFAULTS[variant].cloth;
  const accent = accentColor ?? DEFAULTS[variant].accent;

  const rootRef = useRef<Group>(null);
  const armLRef = useRef<Group>(null);
  const armRRef = useRef<Group>(null);
  const phase = useMemo(
    () => position[0] * 3.1 + position[2] * 1.7,
    [position],
  );

  useFrame((state) => {
    if (!animate && !wave) return;
    const t = state.clock.elapsedTime;

    if (animate && rootRef.current) {
      rootRef.current.position.y = Math.abs(Math.sin(t * 2.1 + phase)) * 0.02;
    }
    if (armLRef.current) {
      armLRef.current.rotation.z = 0.12 + (animate ? Math.sin(t * 2.1 + phase) * 0.1 : 0);
      armLRef.current.rotation.x = animate ? Math.sin(t * 2.1 + phase + 1) * 0.12 : 0;
    }
    if (armRRef.current) {
      if (wave) {
        // arm raised overhead, hand oscillating
        armRRef.current.rotation.z = -3.1 + Math.sin(t * 6 + phase) * 0.15;
        armRRef.current.rotation.x = 0;
      } else {
        armRRef.current.rotation.z = -0.12 - (animate ? Math.sin(t * 2.1 + phase) * 0.1 : 0);
        armRRef.current.rotation.x = animate ? -Math.sin(t * 2.1 + phase + 1) * 0.12 : 0;
      }
    }
  });

  // Sleeve color: gown/robe variants have sleeves in the garment color
  const sleeve = variant === "suit" ? cloth : cloth;

  const Arm = ({ side }: { side: 1 | -1 }) => (
    <group
      ref={side === -1 ? armLRef : armRRef}
      position={[side * 0.24, 0.98, 0]}
      rotation={[0, 0, side * 0.12]}
    >
      <mesh position={[0, -0.21, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.045, 0.42, 6]} />
        <meshStandardMaterial color={sleeve} roughness={0.75} />
      </mesh>
      <mesh position={[0, -0.44, 0]}>
        <sphereGeometry args={[0.055, 8, 8]} />
        <meshStandardMaterial color={skinColor} roughness={0.8} />
      </mesh>
    </group>
  );

  return (
    <group position={position} rotation={rotation} scale={s}>
      <group ref={rootRef}>
        {/* ================= Head (shared) ================= */}
        <mesh position={[0, 1.2, variant === "hijabi" ? 0.02 : 0]} castShadow>
          <sphereGeometry args={[0.16, 12, 12]} />
          <meshStandardMaterial color={skinColor} roughness={0.8} />
        </mesh>

        <Arm side={-1} />
        <Arm side={1} />

        {/* ================= Variant bodies ================= */}

        {variant === "sherwani" && (
          <>
            {/* churidar legs */}
            {[-0.08, 0.08].map((x, i) => (
              <mesh key={i} position={[x, 0.18, 0]}>
                <cylinderGeometry args={[0.06, 0.07, 0.36, 6]} />
                <meshStandardMaterial color="#e8ddc6" roughness={0.8} />
              </mesh>
            ))}
            {/* mojari shoes */}
            {[-0.08, 0.08].map((x, i) => (
              <mesh key={i} position={[x, 0.035, 0.04]}>
                <boxGeometry args={[0.1, 0.06, 0.19]} />
                <meshStandardMaterial color={accent} metalness={0.3} roughness={0.5} />
              </mesh>
            ))}
            {/* sherwani coat, flared */}
            <mesh position={[0, 0.66, 0]} castShadow>
              <cylinderGeometry args={[0.19, 0.31, 0.78, 10]} />
              <meshStandardMaterial color={cloth} roughness={0.65} />
            </mesh>
            {/* gold placket */}
            <mesh position={[0, 0.68, 0.2]} rotation={[0.15, 0, 0]}>
              <boxGeometry args={[0.05, 0.72, 0.02]} />
              <meshStandardMaterial color={accent} metalness={0.5} roughness={0.4} />
            </mesh>
            {/* collar */}
            <mesh position={[0, 1.04, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.13, 0.025, 8, 16]} />
              <meshStandardMaterial color={accent} metalness={0.5} roughness={0.4} />
            </mesh>
            {/* stole across the chest */}
            <mesh position={[0.03, 0.74, 0.21]} rotation={[0.15, 0, -0.5]}>
              <boxGeometry args={[0.1, 0.72, 0.025]} />
              <meshStandardMaterial color={accent} metalness={0.35} roughness={0.5} />
            </mesh>
            {/* safa (turban) + band + kalgi */}
            <mesh position={[0, 1.3, 0]} scale={[1, 0.72, 1]}>
              <sphereGeometry args={[0.19, 10, 10]} />
              <meshStandardMaterial color={accent} roughness={0.55} />
            </mesh>
            <mesh position={[0, 1.24, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.17, 0.02, 8, 16]} />
              <meshStandardMaterial color="#f6e7c5" metalness={0.4} roughness={0.4} />
            </mesh>
            <mesh position={[0, 1.46, 0.05]} rotation={[0.25, 0, 0]}>
              <coneGeometry args={[0.025, 0.14, 6]} />
              <meshStandardMaterial color="#f6e7c5" metalness={0.6} roughness={0.3} />
            </mesh>
          </>
        )}

        {variant === "thobe" && (
          <>
            {/* long white robe to the ankles */}
            <mesh position={[0, 0.55, 0]} castShadow>
              <cylinderGeometry args={[0.18, 0.3, 1.0, 10]} />
              <meshStandardMaterial color={cloth} roughness={0.7} />
            </mesh>
            {/* sandals */}
            {[-0.08, 0.08].map((x, i) => (
              <mesh key={i} position={[x, 0.025, 0.06]}>
                <boxGeometry args={[0.1, 0.04, 0.18]} />
                <meshStandardMaterial color="#6b4f2f" roughness={0.8} />
              </mesh>
            ))}
            {/* ghutra: cap + side/back drapes */}
            <mesh position={[0, 1.26, -0.01]} scale={[1, 0.8, 1]}>
              <sphereGeometry args={[0.19, 10, 10]} />
              <meshStandardMaterial color="#ffffff" roughness={0.6} />
            </mesh>
            {[-1, 1].map((side, i) => (
              <mesh
                key={i}
                position={[side * 0.15, 1.06, -0.05]}
                rotation={[0, 0, side * -0.12]}
              >
                <boxGeometry args={[0.14, 0.32, 0.03]} />
                <meshStandardMaterial color="#ffffff" roughness={0.6} />
              </mesh>
            ))}
            <mesh position={[0, 1.06, -0.15]}>
              <boxGeometry args={[0.24, 0.34, 0.03]} />
              <meshStandardMaterial color="#ffffff" roughness={0.6} />
            </mesh>
            {/* agal */}
            <mesh position={[0, 1.33, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.155, 0.022, 8, 16]} />
              <meshStandardMaterial color="#1a1a1a" roughness={0.6} />
            </mesh>
          </>
        )}

        {variant === "hijabi" && (
          <>
            {/* flowing gown */}
            <mesh position={[0, 0.55, 0]} castShadow>
              <cylinderGeometry args={[0.17, 0.4, 1.0, 12]} />
              <meshStandardMaterial color={cloth} roughness={0.65} />
            </mesh>
            {/* gold hem */}
            <mesh position={[0, 0.06, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.385, 0.02, 8, 24]} />
              <meshStandardMaterial color={accent} metalness={0.5} roughness={0.4} />
            </mesh>
            {/* chest drape under the chin */}
            <mesh position={[0, 0.98, 0.01]}>
              <coneGeometry args={[0.21, 0.32, 10]} />
              <meshStandardMaterial color={cloth} roughness={0.65} />
            </mesh>
            {/* hijab: slightly larger sphere set back so the face shows */}
            <mesh position={[0, 1.21, -0.025]} castShadow>
              <sphereGeometry args={[0.185, 12, 12]} />
              <meshStandardMaterial color={cloth} roughness={0.65} />
            </mesh>
            {/* hijab pin */}
            <mesh position={[0.1, 1.3, 0.11]}>
              <sphereGeometry args={[0.022, 8, 8]} />
              <meshStandardMaterial color={accent} metalness={0.7} roughness={0.3} />
            </mesh>
          </>
        )}

        {variant === "suit" && (
          <>
            {/* trousers */}
            {[-0.09, 0.09].map((x, i) => (
              <mesh key={i} position={[x, 0.3, 0]}>
                <cylinderGeometry args={[0.07, 0.08, 0.55, 6]} />
                <meshStandardMaterial color={cloth} roughness={0.8} />
              </mesh>
            ))}
            {/* dress shoes */}
            {[-0.09, 0.09].map((x, i) => (
              <mesh key={i} position={[x, 0.035, 0.05]}>
                <boxGeometry args={[0.11, 0.07, 0.2]} />
                <meshStandardMaterial color="#1a1512" roughness={0.35} metalness={0.15} />
              </mesh>
            ))}
            {/* jacket */}
            <mesh position={[0, 0.8, 0]} castShadow>
              <cylinderGeometry args={[0.2, 0.185, 0.5, 10]} />
              <meshStandardMaterial color={cloth} roughness={0.7} />
            </mesh>
            {/* shoulders */}
            {[-0.2, 0.2].map((x, i) => (
              <mesh key={i} position={[x, 1.0, 0]}>
                <sphereGeometry args={[0.07, 8, 8]} />
                <meshStandardMaterial color={cloth} roughness={0.7} />
              </mesh>
            ))}
            {/* shirt */}
            <mesh position={[0, 0.85, 0.185]}>
              <boxGeometry args={[0.11, 0.34, 0.02]} />
              <meshStandardMaterial color="#f5f2ec" roughness={0.6} />
            </mesh>
            {/* tie */}
            <mesh position={[0, 0.82, 0.2]}>
              <boxGeometry args={[0.045, 0.26, 0.015]} />
              <meshStandardMaterial color={accent} roughness={0.5} />
            </mesh>
            {/* hair */}
            <mesh position={[0, 1.28, -0.02]} scale={[1, 0.65, 1]}>
              <sphereGeometry args={[0.165, 10, 10]} />
              <meshStandardMaterial color="#241a12" roughness={0.85} />
            </mesh>
          </>
        )}
      </group>
    </group>
  );
}