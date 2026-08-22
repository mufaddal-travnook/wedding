import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group, MeshStandardMaterial } from "three";
import { boxGeo, coneGeo, cylinderGeo, sphereGeo, stdMat, torusGeo } from "@/app/lib/three-cache";
import { VARIANT_DEFAULTS, DEFAULT_SKIN } from "./guest-geometry";
import type { GuestVariant } from "./guest-variants";

/**
 * Person — an ARTICULATED low-poly guest.
 *
 * Variants:
 *  - "sherwani": cream & gold sherwani with stole, churidar and a safa
 *    (turban) with kalgi — groom's side classic.
 *  - "thobe":    white kandura/thobe with ghutra + black agal.
 *  - "hijabi":   flowing gown with gold hem, hijab and chest drape.
 *  - "suit":     navy suit, white shirt, tie and dress shoes.
 *
 * Use this only where a guest must MOVE — the greeter waving at the gate, and
 * the few clusters close enough to the camera for idle sway to register. It
 * is deliberately expensive: arms pivot at the shoulder, so the body cannot
 * be merged into a single geometry.
 *
 * Every static guest should go through `<GuestCrowd>` instead, which draws
 * the whole crowd as a few instanced calls. See `guest-geometry.ts`.
 *
 * Geometries and materials come from the shared cache, so the handful of
 * articulated guests still reuse one object per distinct shape and colour
 * rather than allocating ~60 of each per person.
 *
 * Usage:
 *   <Person variant="thobe" wave animate />
 *   <Person variant="hijabi" clothColor="#3f6b4f" />   // Mehendi palette
 */

interface PersonProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  variant?: GuestVariant;
  /** Main garment color (has a sensible default per variant) */
  clothColor?: string;
  /** Trim / stole / tie color */
  accentColor?: string;
  skinColor?: string;
  scale?: number;
  animate?: boolean; // idle sway + bob
  wave?: boolean;    // right arm raised, waving
}

/**
 * One arm, pivoting at the shoulder.
 *
 * Defined at module scope rather than inside `Person`: a component declared
 * during render is a fresh type on every render, so React unmounts and
 * remounts the whole subtree each time — which would also drop the refs the
 * animation writes to.
 */
function Arm({
  side,
  armRef,
  sleeve,
  skinMat,
}: {
  side: 1 | -1;
  armRef: React.RefObject<Group | null>;
  sleeve: string;
  skinMat: MeshStandardMaterial;
}) {
  return (
    <group
      ref={armRef}
      position={[side * 0.24, 0.98, 0]}
      rotation={[0, 0, side * 0.12]}
    >
      <mesh
        position={[0, -0.21, 0]}
        castShadow
        geometry={cylinderGeo(0.05, 0.045, 0.42, 6)}
        material={stdMat({ color: sleeve, roughness: 0.75 })}
      />
      <mesh
        position={[0, -0.44, 0]}
        geometry={sphereGeo(0.055, 6, 6)}
        material={skinMat}
      />
    </group>
  );
}

export function Person({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  variant = "sherwani",
  clothColor,
  accentColor,
  skinColor = DEFAULT_SKIN,
  scale: s = 1,
  animate = false,
  wave = false,
}: PersonProps) {
  const cloth = clothColor ?? VARIANT_DEFAULTS[variant].cloth;
  const accent = accentColor ?? VARIANT_DEFAULTS[variant].accent;

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

  // Shared materials for this guest's colourway.
  const clothMat = stdMat({ color: cloth, roughness: 0.7 });
  const skinMat = stdMat({ color: skinColor, roughness: 0.8 });

  return (
    <group position={position} rotation={rotation} scale={s}>
      <group ref={rootRef}>
        {/* ================= Head (shared) ================= */}
        <mesh
          position={[0, 1.2, variant === "hijabi" ? 0.02 : 0]}
          castShadow
          geometry={sphereGeo(0.16, 10, 10)}
          material={skinMat}
        />

        <Arm side={-1} armRef={armLRef} sleeve={cloth} skinMat={skinMat} />
        <Arm side={1} armRef={armRRef} sleeve={cloth} skinMat={skinMat} />

        {/* ================= Variant bodies ================= */}

        {variant === "sherwani" && (
          <>
            {/* churidar legs */}
            {[-0.08, 0.08].map((x, i) => (
              <mesh
                key={i}
                position={[x, 0.18, 0]}
                geometry={cylinderGeo(0.06, 0.07, 0.36, 6)}
                material={stdMat({ color: "#e8ddc6", roughness: 0.8 })}
              />
            ))}
            {/* mojari shoes */}
            {[-0.08, 0.08].map((x, i) => (
              <mesh
                key={i}
                position={[x, 0.035, 0.04]}
                geometry={boxGeo(0.1, 0.06, 0.19)}
                material={stdMat({ color: accent, metalness: 0.3, roughness: 0.5 })}
              />
            ))}
            {/* sherwani coat, flared */}
            <mesh
              position={[0, 0.66, 0]}
              castShadow
              geometry={cylinderGeo(0.19, 0.31, 0.78, 10)}
              material={stdMat({ color: cloth, roughness: 0.65 })}
            />
            {/* gold placket */}
            <mesh
              position={[0, 0.68, 0.2]}
              rotation={[0.15, 0, 0]}
              geometry={boxGeo(0.05, 0.72, 0.02)}
              material={stdMat({ color: accent, metalness: 0.5, roughness: 0.4 })}
            />
            {/* collar */}
            <mesh
              position={[0, 1.04, 0]}
              rotation={[Math.PI / 2, 0, 0]}
              geometry={torusGeo(0.13, 0.025, 6, 12)}
              material={stdMat({ color: accent, metalness: 0.5, roughness: 0.4 })}
            />
            {/* stole across the chest */}
            <mesh
              position={[0.03, 0.74, 0.21]}
              rotation={[0.15, 0, -0.5]}
              geometry={boxGeo(0.1, 0.72, 0.025)}
              material={stdMat({ color: accent, metalness: 0.35, roughness: 0.5 })}
            />
            {/* safa (turban) + band + kalgi */}
            <mesh
              position={[0, 1.3, 0]}
              scale={[1, 0.72, 1]}
              geometry={sphereGeo(0.19, 10, 10)}
              material={stdMat({ color: accent, roughness: 0.55 })}
            />
            <mesh
              position={[0, 1.24, 0]}
              rotation={[Math.PI / 2, 0, 0]}
              geometry={torusGeo(0.17, 0.02, 6, 12)}
              material={stdMat({ color: "#f6e7c5", metalness: 0.4, roughness: 0.4 })}
            />
            <mesh
              position={[0, 1.46, 0.05]}
              rotation={[0.25, 0, 0]}
              geometry={coneGeo(0.025, 0.14, 6)}
              material={stdMat({ color: "#f6e7c5", metalness: 0.6, roughness: 0.3 })}
            />
          </>
        )}

        {variant === "thobe" && (
          <>
            {/* long white robe to the ankles */}
            <mesh
              position={[0, 0.55, 0]}
              castShadow
              geometry={cylinderGeo(0.18, 0.3, 1.0, 10)}
              material={stdMat({ color: cloth, roughness: 0.7 })}
            />
            {/* sandals */}
            {[-0.08, 0.08].map((x, i) => (
              <mesh
                key={i}
                position={[x, 0.025, 0.06]}
                geometry={boxGeo(0.1, 0.04, 0.18)}
                material={stdMat({ color: "#6b4f2f", roughness: 0.8 })}
              />
            ))}
            {/* ghutra: cap + side/back drapes */}
            <mesh
              position={[0, 1.26, -0.01]}
              scale={[1, 0.8, 1]}
              geometry={sphereGeo(0.19, 10, 10)}
              material={stdMat({ color: "#ffffff", roughness: 0.6 })}
            />
            {[-1, 1].map((side, i) => (
              <mesh
                key={i}
                position={[side * 0.15, 1.06, -0.05]}
                rotation={[0, 0, side * -0.12]}
                geometry={boxGeo(0.14, 0.32, 0.03)}
                material={stdMat({ color: "#ffffff", roughness: 0.6 })}
              />
            ))}
            <mesh
              position={[0, 1.06, -0.15]}
              geometry={boxGeo(0.24, 0.34, 0.03)}
              material={stdMat({ color: "#ffffff", roughness: 0.6 })}
            />
            {/* agal */}
            <mesh
              position={[0, 1.33, 0]}
              rotation={[Math.PI / 2, 0, 0]}
              geometry={torusGeo(0.155, 0.022, 6, 12)}
              material={stdMat({ color: "#1a1a1a", roughness: 0.6 })}
            />
          </>
        )}

        {variant === "hijabi" && (
          <>
            {/* flowing gown */}
            <mesh
              position={[0, 0.55, 0]}
              castShadow
              geometry={cylinderGeo(0.17, 0.4, 1.0, 12)}
              material={stdMat({ color: cloth, roughness: 0.65 })}
            />
            {/* gold hem */}
            <mesh
              position={[0, 0.06, 0]}
              rotation={[Math.PI / 2, 0, 0]}
              geometry={torusGeo(0.385, 0.02, 6, 18)}
              material={stdMat({ color: accent, metalness: 0.5, roughness: 0.4 })}
            />
            {/* chest drape under the chin */}
            <mesh
              position={[0, 0.98, 0.01]}
              geometry={coneGeo(0.21, 0.32, 10)}
              material={stdMat({ color: cloth, roughness: 0.65 })}
            />
            {/* hijab: slightly larger sphere set back so the face shows */}
            <mesh
              position={[0, 1.21, -0.025]}
              castShadow
              geometry={sphereGeo(0.185, 10, 10)}
              material={stdMat({ color: cloth, roughness: 0.65 })}
            />
            {/* hijab pin */}
            <mesh
              position={[0.1, 1.3, 0.11]}
              geometry={sphereGeo(0.022, 6, 6)}
              material={stdMat({ color: accent, metalness: 0.7, roughness: 0.3 })}
            />
          </>
        )}

        {variant === "suit" && (
          <>
            {/* trousers */}
            {[-0.09, 0.09].map((x, i) => (
              <mesh
                key={i}
                position={[x, 0.3, 0]}
                geometry={cylinderGeo(0.07, 0.08, 0.55, 6)}
                material={stdMat({ color: cloth, roughness: 0.8 })}
              />
            ))}
            {/* dress shoes */}
            {[-0.09, 0.09].map((x, i) => (
              <mesh
                key={i}
                position={[x, 0.035, 0.05]}
                geometry={boxGeo(0.11, 0.07, 0.2)}
                material={stdMat({ color: "#1a1512", roughness: 0.35, metalness: 0.15 })}
              />
            ))}
            {/* jacket */}
            <mesh
              position={[0, 0.8, 0]}
              castShadow
              geometry={cylinderGeo(0.2, 0.185, 0.5, 10)}
              material={clothMat}
            />
            {/* shoulders */}
            {[-0.2, 0.2].map((x, i) => (
              <mesh
                key={i}
                position={[x, 1.0, 0]}
                geometry={sphereGeo(0.07, 6, 6)}
                material={clothMat}
              />
            ))}
            {/* shirt */}
            <mesh
              position={[0, 0.85, 0.185]}
              geometry={boxGeo(0.11, 0.34, 0.02)}
              material={stdMat({ color: "#f5f2ec", roughness: 0.6 })}
            />
            {/* tie */}
            <mesh
              position={[0, 0.82, 0.2]}
              geometry={boxGeo(0.045, 0.26, 0.015)}
              material={stdMat({ color: accent, roughness: 0.5 })}
            />
            {/* hair */}
            <mesh
              position={[0, 1.28, -0.02]}
              scale={[1, 0.65, 1]}
              geometry={sphereGeo(0.165, 10, 10)}
              material={stdMat({ color: "#241a12", roughness: 0.85 })}
            />
          </>
        )}
      </group>
    </group>
  );
}
