import { useEffect, useMemo } from "react";
import { CanvasTexture, Quaternion, SRGBColorSpace, Vector3 } from "three";

/**
 * WeddingCar — a 1930s-style classic saloon (Rolls-Royce / Bentley silhouette).
 *
 * Layout (local space, before the facing rotation):
 *   +Z = front, -Z = rear, +Y = up. Overall ~4.9 long x 1.7 wide.
 *   Front axle z = +1.45, rear axle z = -1.45, wheel radius 0.42.
 *
 * Structure:
 *   1. Chassis + running boards
 *   2. Bonnet (long hood) + radiator grille + ornament
 *   3. Cabin (upright, rounded roof, pillars, glass)
 *   4. Tail (sloping boot) + spare wheel
 *   5. Fenders (swept arches) + wheels (wire spokes)
 *   6. Chrome details (lamp bar, headlamps, bumpers, tail lamps)
 *   7. Optional decoration: white ribbon "V" + JUST MARRIED plate only
 */

interface WeddingCarProps {
  /** Main coachwork colour. Default: ivory — the classic wedding car. */
  color?: string;
  /** Chrome / brightwork colour. */
  trimColor?: string;
  /** Ribbon "V" + rear plate. No garlands or flowers are ever rendered. */
  decorations?: boolean;
}

/* ---------------------------------------------------------------- */
/*  Shared material presets                                          */
/* ---------------------------------------------------------------- */

const useMaterials = (color: string, trimColor: string) =>
  useMemo(
    () => ({
      paint: { color, metalness: 0.35, roughness: 0.22 },
      fender: { color: "#101014", metalness: 0.3, roughness: 0.25 }, // gloss black wings
      chrome: { color: trimColor, metalness: 0.95, roughness: 0.12 },
      glass: {
        color: "#9fc4d8",
        metalness: 0.1,
        roughness: 0.05,
        transparent: true,
        opacity: 0.55,
      },
      tire: { color: "#15151a", roughness: 0.95 },
      interior: { color: "#3a2a20", roughness: 0.85 }, // leather brown
      ribbon: { color: "#ffffff", roughness: 0.6 },
    }),
    [color, trimColor],
  );

type Mats = ReturnType<typeof useMaterials>;

/* ---------------------------------------------------------------- */
/*  Wheel — tire, chrome rim, wire spokes, knock-off hub             */
/* ---------------------------------------------------------------- */

function Wheel({
  position,
  mats,
}: {
  position: [number, number, number];
  mats: Mats;
}) {
  const side = position[0] > 0 ? 1 : -1;
  return (
    // `useCarDrive` spins anything named "wheel" about its local X (the axle).
    <group position={position} name="wheel">
      {/* Tire — torus rotated about Y so the wheel plane is YZ (rolls along Z) */}
      <mesh rotation={[0, Math.PI / 2, 0]} castShadow>
        <torusGeometry args={[0.3, 0.12, 10, 24]} />
        <meshStandardMaterial {...mats.tire} />
      </mesh>
      {/* Whitewall — a flat ring on the outer sidewall, just clear of the tire tube */}
      <mesh
        position={[side * 0.125, 0, 0]}
        rotation={[0, (side * Math.PI) / 2, 0]}
      >
        <ringGeometry args={[0.24, 0.33, 24]} />
        <meshStandardMaterial color="#efe9dc" roughness={0.8} />
      </mesh>
      {/* Rim — cylinder axis along X (the axle) */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.24, 0.24, 0.14, 20]} />
        <meshStandardMaterial {...mats.chrome} />
      </mesh>
      {/* 6 full-diameter spokes radiating in the wheel plane = 12 spoke ends.
          Sat outboard of the rim disc (half-length 0.07) so they stay visible. */}
      {Array.from({ length: 6 }).map((_, i) => {
        const a = (i / 6) * Math.PI;
        return (
          <mesh key={i} position={[side * 0.105, 0, 0]} rotation={[a, 0, 0]}>
            <cylinderGeometry args={[0.008, 0.008, 0.5, 4]} />
            <meshStandardMaterial {...mats.chrome} />
          </mesh>
        );
      })}
      {/* Knock-off hub */}
      <mesh rotation={[0, 0, Math.PI / 2]} position={[side * 0.09, 0, 0]}>
        <cylinderGeometry args={[0.07, 0.09, 0.06, 12]} />
        <meshStandardMaterial {...mats.chrome} />
      </mesh>
    </group>
  );
}

/* ---------------------------------------------------------------- */
/*  Fender arch — a half-torus sweeping over a wheel                 */
/* ---------------------------------------------------------------- */

function FenderArch({
  x,
  z,
  mats,
  radius = 0.52,
}: {
  x: number;
  z: number;
  mats: Mats;
  radius?: number;
}) {
  return (
    <mesh position={[x, 0.42, z]} rotation={[0, Math.PI / 2, 0]} castShadow>
      {/* Arc spans the top half of the wheel */}
      <torusGeometry args={[radius, 0.1, 10, 20, Math.PI]} />
      <meshStandardMaterial {...mats.fender} />
    </mesh>
  );
}

/* ---------------------------------------------------------------- */
/*  Headlamp — chrome bowl + warm lens                               */
/* ---------------------------------------------------------------- */

function Headlamp({ x, mats }: { x: number; mats: Mats }) {
  return (
    <group position={[x, 0.98, 2.05]}>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.14, 0.1, 0.22, 16]} />
        <meshStandardMaterial {...mats.chrome} />
      </mesh>
      <mesh position={[0, 0, 0.115]} rotation={[0, 0, 0]}>
        <circleGeometry args={[0.13, 16]} />
        <meshStandardMaterial
          color="#fff6dd"
          emissive="#ffe9a8"
          emissiveIntensity={0.9}
          roughness={0.1}
        />
      </mesh>
    </group>
  );
}

/* ---------------------------------------------------------------- */
/*  Main component                                                   */
/* ---------------------------------------------------------------- */

export function WeddingCar({
  color = "#f4eddc",
  trimColor = "#d3d7dd",
  decorations = true,
}: WeddingCarProps) {
  const M = useMaterials(color, trimColor);

  /* Ribbon "V": radiator cap knot → each windshield top corner.
     A box's long axis is +Z, so the orientation has to come from a quaternion —
     a Z-Euler term cannot tilt it, which is why an Euler triple leaves the two
     ribbons parallel instead of splayed. */
  const ribbons = useMemo(() => {
    const start = new Vector3(0, 1.34, 2.14);
    return [-0.62, 0.62].map((x) => {
      const end = new Vector3(x, 1.72, 0.4);
      const direction = end.clone().sub(start);
      return {
        key: `ribbon${x}`,
        length: direction.length(),
        position: start
          .clone()
          .add(end)
          .multiplyScalar(0.5)
          .toArray() as [number, number, number],
        quaternion: new Quaternion().setFromUnitVectors(
          new Vector3(0, 0, 1),
          direction.normalize(),
        ),
      };
    });
  }, []);

  /* "JUST MARRIED" plate texture */
  const plateTexture = useMemo(() => {
    if (typeof document === "undefined") return null;
    const cv = document.createElement("canvas");
    cv.width = 320;
    cv.height = 96;
    const cx = cv.getContext("2d")!;
    cx.fillStyle = "#fbf7ee";
    cx.fillRect(0, 0, 320, 96);
    cx.strokeStyle = "#8a7440";
    cx.lineWidth = 5;
    cx.strokeRect(6, 6, 308, 84);
    cx.fillStyle = "#2b2118";
    cx.font = "italic bold 34px Georgia, serif";
    cx.textAlign = "center";
    cx.textBaseline = "middle";
    cx.fillText("Just Married", 160, 50);
    const texture = new CanvasTexture(cv);
    // Without this the canvas is read as linear and the plate renders washed out.
    texture.colorSpace = SRGBColorSpace;
    return texture;
  }, []);

  useEffect(() => () => plateTexture?.dispose(), [plateTexture]);

  return (
    /* Authored nose-forward (+Z). Facing is owned by the parent group: its rest
       pose in Experience and `useCarDrive` both point +Z along the travel
       direction, so rotating here would cancel that out and reverse the car. */
    <group>
      {/* ============ 1. CHASSIS ============ */}
      <mesh position={[0, 0.34, 0]}>
        <boxGeometry args={[1.3, 0.14, 4.4]} />
        <meshStandardMaterial color="#0a0a0c" roughness={0.95} />
      </mesh>
      {/* Axles */}
      {[1.45, -1.45].map((z) => (
        <mesh
          key={`axle${z}`}
          position={[0, 0.42, z]}
          rotation={[0, 0, Math.PI / 2]}
        >
          <cylinderGeometry args={[0.035, 0.035, 1.9, 8]} />
          <meshStandardMaterial
            color="#1c1c22"
            roughness={0.8}
            metalness={0.4}
          />
        </mesh>
      ))}
      {/* Running boards, linking front and rear fenders */}
      {[-0.86, 0.86].map((x) => (
        <group key={`rb${x}`}>
          <mesh position={[x, 0.5, 0]} castShadow>
            <boxGeometry args={[0.24, 0.05, 1.8]} />
            <meshStandardMaterial {...M.fender} />
          </mesh>
          {/* Chrome edge strip */}
          <mesh position={[x + (x > 0 ? 0.1 : -0.1), 0.52, 0]}>
            <boxGeometry args={[0.03, 0.02, 1.8]} />
            <meshStandardMaterial {...M.chrome} />
          </mesh>
        </group>
      ))}
      {/* Fender-to-board sweep (diagonal connectors) */}
      {[-0.86, 0.86].map((x) => (
        <group key={`sweep${x}`}>
          <mesh position={[x, 0.6, 1.12]} rotation={[0.75, 0, 0]}>
            <boxGeometry args={[0.2, 0.05, 0.55]} />
            <meshStandardMaterial {...M.fender} />
          </mesh>
          <mesh position={[x, 0.6, -1.12]} rotation={[-0.75, 0, 0]}>
            <boxGeometry args={[0.2, 0.05, 0.55]} />
            <meshStandardMaterial {...M.fender} />
          </mesh>
        </group>
      ))}

      {/* ============ 2. BONNET + RADIATOR ============ */}
      {/* Lower engine bay sides */}
      <mesh position={[0, 0.72, 1.35]} castShadow>
        <boxGeometry args={[1.1, 0.5, 1.5]} />
        <meshStandardMaterial {...M.paint} />
      </mesh>
      {/* Rounded bonnet top. The half-shell spans the cylinder's +Z side, so it
          needs -PI/2 about X to crown upward; scale flattens it to the hinge height. */}
      <mesh
        position={[0, 0.97, 1.35]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={[1, 1, 0.5]}
        castShadow
      >
        <cylinderGeometry
          args={[0.55, 0.55, 1.5, 16, 1, false, -Math.PI / 2, Math.PI]}
        />
        <meshStandardMaterial {...M.paint} />
      </mesh>
      {/* Bonnet centre hinge line */}
      <mesh position={[0, 1.245, 1.35]}>
        <boxGeometry args={[0.025, 0.02, 1.5]} />
        <meshStandardMaterial {...M.chrome} />
      </mesh>
      {/* Louvre vents on bonnet sides */}
      {[-0.56, 0.56].map((x) =>
        [0.95, 1.15, 1.35, 1.55, 1.75].map((z) => (
          <mesh key={`lv${x}${z}`} position={[x, 0.78, z]}>
            <boxGeometry args={[0.015, 0.3, 0.035]} />
            <meshStandardMaterial color="#2a2a30" roughness={0.7} />
          </mesh>
        )),
      )}

      {/* Radiator shell — tall upright chrome */}
      <group position={[0, 0.9, 2.14]}>
        <mesh castShadow>
          <boxGeometry args={[0.74, 0.78, 0.14]} />
          <meshStandardMaterial {...M.chrome} />
        </mesh>
        {/* Black grille core */}
        <mesh position={[0, -0.02, 0.075]}>
          <boxGeometry args={[0.6, 0.62, 0.02]} />
          <meshStandardMaterial color="#0d0d10" roughness={0.9} />
        </mesh>
        {/* Vertical grille slats */}
        {Array.from({ length: 9 }).map((_, i) => (
          <mesh key={i} position={[-0.26 + i * 0.065, -0.02, 0.085]}>
            <boxGeometry args={[0.014, 0.6, 0.015]} />
            <meshStandardMaterial {...M.chrome} />
          </mesh>
        ))}
        {/* Radiator cap + flying ornament */}
        <mesh position={[0, 0.42, 0]}>
          <cylinderGeometry args={[0.05, 0.06, 0.06, 10]} />
          <meshStandardMaterial {...M.chrome} />
        </mesh>
        <mesh position={[0, 0.52, 0]} rotation={[-0.5, 0, 0]}>
          <coneGeometry args={[0.035, 0.18, 6]} />
          <meshStandardMaterial {...M.chrome} />
        </mesh>
      </group>

      {/* ============ 3. CABIN ============ */}
      {/* Scuttle: transition from bonnet to cabin */}
      <mesh position={[0, 0.85, 0.55]} castShadow>
        <boxGeometry args={[1.45, 0.75, 0.35]} />
        <meshStandardMaterial {...M.paint} />
      </mesh>
      {/* Cabin body */}
      <mesh position={[0, 0.9, -0.5]} castShadow>
        <boxGeometry args={[1.5, 0.85, 1.85]} />
        <meshStandardMaterial {...M.paint} />
      </mesh>
      {/* Greenhouse (window band) */}
      <mesh position={[0, 1.52, -0.5]} castShadow>
        <boxGeometry args={[1.38, 0.42, 1.75]} />
        <meshStandardMaterial {...M.interior} />
      </mesh>
      {/* Rounded roof — same upward-crowning fix, flattened to a subtle dome */}
      <mesh
        position={[0, 1.74, -0.5]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={[1, 1, 0.2]}
        castShadow
      >
        <cylinderGeometry
          args={[0.7, 0.7, 1.7, 16, 1, false, -Math.PI / 2, Math.PI]}
        />
        <meshStandardMaterial {...M.paint} />
      </mesh>
      <mesh position={[0, 1.74, -0.5]}>
        <boxGeometry args={[1.38, 0.04, 1.7]} />
        <meshStandardMaterial {...M.paint} />
      </mesh>

      {/* Pillars */}
      {[-0.7, 0.7].map((x) =>
        [0.35, -0.25, -0.85, -1.35].map((z, i) => (
          <mesh key={`p${x}${i}`} position={[x, 1.52, z]}>
            <boxGeometry args={[0.06, 0.44, 0.09]} />
            <meshStandardMaterial {...M.paint} />
          </mesh>
        )),
      )}
      {/* Header + sill rails around glass */}
      {[-0.705, 0.705].map((x) => (
        <group key={`rail${x}`}>
          <mesh position={[x, 1.31, -0.5]}>
            <boxGeometry args={[0.05, 0.04, 1.75]} />
            <meshStandardMaterial {...M.chrome} />
          </mesh>
          <mesh position={[x, 1.72, -0.5]}>
            <boxGeometry args={[0.05, 0.04, 1.75]} />
            <meshStandardMaterial {...M.paint} />
          </mesh>
        </group>
      ))}

      {/* Windshield — upright with slight rake. Must clear the greenhouse box,
          whose front face is at z = 0.375, or the interior occludes the glass. */}
      <mesh position={[0, 1.5, 0.4]} rotation={[-0.12, 0, 0]}>
        <planeGeometry args={[1.3, 0.42]} />
        <meshStandardMaterial {...M.glass} side={2} />
      </mesh>
      <mesh position={[0, 1.71, 0.4]} rotation={[-0.12, 0, 0]}>
        <boxGeometry args={[1.34, 0.035, 0.035]} />
        <meshStandardMaterial {...M.chrome} />
      </mesh>
      {/* Rear window */}
      <mesh position={[0, 1.52, -1.38]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[1.0, 0.36]} />
        <meshStandardMaterial {...M.glass} side={2} />
      </mesh>
      {/* Side glass: front + rear door panes */}
      {[-0.71, 0.71].map((x) => (
        <group key={`glass${x}`}>
          <mesh position={[x, 1.52, 0.05]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[0.5, 0.36]} />
            <meshStandardMaterial {...M.glass} side={2} />
          </mesh>
          <mesh position={[x, 1.52, -0.55]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[0.5, 0.36]} />
            <meshStandardMaterial {...M.glass} side={2} />
          </mesh>
          <mesh position={[x, 1.52, -1.12]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[0.4, 0.36]} />
            <meshStandardMaterial {...M.glass} side={2} />
          </mesh>
        </group>
      ))}

      {/* Door seams + handles */}
      {[-0.751, 0.751].map((x) => (
        <group key={`door${x}`}>
          {[0.35, -0.25, -0.85].map((z) => (
            <mesh key={`seam${z}`} position={[x, 0.9, z]}>
              <boxGeometry args={[0.01, 0.8, 0.015]} />
              {/* three cannot parse 8-digit hex — alpha belongs in `opacity` */}
              <meshStandardMaterial
                color="#000000"
                transparent
                opacity={0.33}
                roughness={1}
              />
            </mesh>
          ))}
          {[0.05, -0.55].map((z) => (
            <mesh
              key={`hdl${z}`}
              position={[x, 1.12, z]}
              rotation={[0, 0, Math.PI / 2]}
            >
              <cylinderGeometry args={[0.015, 0.015, 0.14, 6]} />
              <meshStandardMaterial {...M.chrome} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Chrome waistline moulding along the whole body */}
      {[-0.755, 0.755].map((x) => (
        <mesh key={`waist${x}`} position={[x, 1.18, -0.35]}>
          <boxGeometry args={[0.02, 0.03, 2.25]} />
          <meshStandardMaterial {...M.chrome} />
        </mesh>
      ))}

      {/* ============ 4. TAIL + SPARE WHEEL ============ */}
      {/* Sloping boot */}
      <mesh position={[0, 0.78, -1.72]} rotation={[0.35, 0, 0]} castShadow>
        <boxGeometry args={[1.4, 0.55, 0.75]} />
        <meshStandardMaterial {...M.paint} />
      </mesh>
      <mesh position={[0, 0.62, -1.85]} castShadow>
        <boxGeometry args={[1.42, 0.5, 0.6]} />
        <meshStandardMaterial {...M.paint} />
      </mesh>
      {/* Rear-mounted spare wheel — torus faces rearward (plane XY) by default */}
      <group position={[0, 0.72, -2.22]}>
        <mesh castShadow>
          <torusGeometry args={[0.26, 0.1, 10, 22]} />
          <meshStandardMaterial {...M.tire} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.1, 18]} />
          <meshStandardMaterial {...M.chrome} />
        </mesh>
      </group>

      {/* Tail lamps */}
      {[-0.55, 0.55].map((x) => (
        <group key={`tail${x}`} position={[x, 0.6, -2.16]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.055, 0.05, 0.08, 10]} />
            <meshStandardMaterial {...M.chrome} />
          </mesh>
          <mesh position={[0, 0, -0.045]} rotation={[0, Math.PI, 0]}>
            <circleGeometry args={[0.045, 10]} />
            <meshStandardMaterial
              color="#b01020"
              emissive="#ff2233"
              emissiveIntensity={0.55}
              roughness={0.3}
            />
          </mesh>
        </group>
      ))}

      {/* ============ 5. FENDERS + WHEELS ============ */}
      {[1.45, -1.45].map((z) => (
        <group key={`axleGrp${z}`}>
          <FenderArch x={-0.86} z={z} mats={M} />
          <FenderArch x={0.86} z={z} mats={M} />
          <Wheel position={[-0.88, 0.42, z]} mats={M} />
          <Wheel position={[0.88, 0.42, z]} mats={M} />
        </group>
      ))}

      {/* ============ 6. CHROME DETAILS ============ */}
      {/* Headlamp crossbar between the front fenders */}
      <mesh position={[0, 0.98, 2.02]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.025, 0.025, 1.55, 8]} />
        <meshStandardMaterial {...M.chrome} />
      </mesh>
      <Headlamp x={-0.58} mats={M} />
      <Headlamp x={0.58} mats={M} />

      {/* Bumpers — twin chrome blades */}
      {[
        { z: 2.42, w: 1.7 },
        { z: -2.42, w: 1.6 },
      ].map(({ z, w }) => (
        <group key={`bmp${z}`} position={[0, 0.42, z]}>
          <mesh>
            <boxGeometry args={[w, 0.055, 0.05]} />
            <meshStandardMaterial {...M.chrome} />
          </mesh>
          <mesh position={[0, -0.08, 0]}>
            <boxGeometry args={[w, 0.055, 0.05]} />
            <meshStandardMaterial {...M.chrome} />
          </mesh>
        </group>
      ))}

      {/* ============ 7. DECORATIONS (ribbon + plate only) ============ */}
      {decorations && (
        <>
          {/* Classic white ribbon "V" from radiator cap to windshield corners */}
          {ribbons.map(({ key, position, quaternion, length }) => (
            <mesh key={key} position={position} quaternion={quaternion}>
              <boxGeometry args={[0.05, 0.008, length]} />
              <meshStandardMaterial {...M.ribbon} />
            </mesh>
          ))}
          {/* Small ribbon knot at the radiator cap */}
          <mesh position={[0, 1.34, 2.14]}>
            <sphereGeometry args={[0.045, 8, 8]} />
            <meshStandardMaterial {...M.ribbon} />
          </mesh>

          {/* JUST MARRIED plate above the rear bumper */}
          {plateTexture && (
            <group position={[0, 0.46, -2.3]} rotation={[0, Math.PI, 0]}>
              <mesh>
                <boxGeometry args={[0.56, 0.2, 0.02]} />
                <meshStandardMaterial color="#fbf7ee" roughness={0.8} />
              </mesh>
              <mesh position={[0, 0, 0.012]}>
                <planeGeometry args={[0.54, 0.18]} />
                <meshStandardMaterial map={plateTexture} roughness={0.7} />
              </mesh>
            </group>
          )}
        </>
      )}
    </group>
  );
}
