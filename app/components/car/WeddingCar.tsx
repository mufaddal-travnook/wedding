import { useMemo } from 'react';
import { CanvasTexture } from 'three';

interface WeddingCarProps {
  color?: string;
  trimColor?: string;
  decorations?: boolean;
}

function Garland({
  from, to, sag = 0.3, color = '#f5a623', count = 9,
}: {
  from: [number, number, number]; to: [number, number, number];
  sag?: number; color?: string; count?: number;
}) {
  const beads = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i <= count; i++) {
      const t = i / count;
      pts.push([
        from[0] + (to[0] - from[0]) * t,
        from[1] + (to[1] - from[1]) * t - Math.sin(t * Math.PI) * sag,
        from[2] + (to[2] - from[2]) * t,
      ]);
    }
    return pts;
  }, [from, to, sag, count]);

  return (
    <group>
      {beads.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.05, 5, 5]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.15} roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

function Flower({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {[0, 1, 2, 3, 4].map((i) => {
        const a = (i / 5) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 0.06, 0, Math.sin(a) * 0.06]}>
            <sphereGeometry args={[0.045, 5, 5]} />
            <meshStandardMaterial color="#fdf8f2" roughness={0.5} />
          </mesh>
        );
      })}
      <mesh position={[0, 0.01, 0]}>
        <sphereGeometry args={[0.03, 5, 5]} />
        <meshStandardMaterial color="#ffe27a" emissive="#aa8800" emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

export function WeddingCar({ color = '#b3122e', trimColor = '#c9a04e', decorations = true }: WeddingCarProps) {
  const B = { color, roughness: 0.28, metalness: 0.3 };  // body
  const T = { color: trimColor, metalness: 0.6, roughness: 0.25 };  // chrome/trim
  const G = { color: '#a8d8ea', roughness: 0.08, metalness: 0.12, transparent: true, opacity: 0.65 };  // glass

  const plateTexture = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const cv = document.createElement('canvas');
    cv.width = 256; cv.height = 80;
    const cx = cv.getContext('2d')!;
    cx.fillStyle = '#fdf8f2'; cx.fillRect(0, 0, 256, 80);
    cx.strokeStyle = trimColor; cx.lineWidth = 4; cx.strokeRect(4, 4, 248, 72);
    cx.fillStyle = color; cx.font = 'bold 24px sans-serif';
    cx.textAlign = 'center'; cx.textBaseline = 'middle';
    cx.fillText('JUST MARRIED', 128, 42);
    return new CanvasTexture(cv);
  }, [color, trimColor]);

  // Car faces -Z (Math.PI rotation), so front = +Z local, rear = -Z local
  return (
    <group rotation={[0, Math.PI, 0]}>

      {/* ============ UNDERBODY ============ */}
      <mesh position={[0, 0.28, 0]}>
        <boxGeometry args={[1.7, 0.12, 4.2]} />
        <meshStandardMaterial color="#111" roughness={0.95} />
      </mesh>

      {/* ============ FRONT — BONNET + GRILL ============ */}
      {/* Bonnet (hood) — long, slightly higher at cabin end, tapers forward */}
      <mesh position={[0, 0.62, 1.4]} castShadow>
        <boxGeometry args={[1.65, 0.22, 1.8]} />
        <meshStandardMaterial {...B} />
      </mesh>
      {/* Bonnet top curve */}
      <mesh position={[0, 0.74, 1.4]} castShadow>
        <cylinderGeometry args={[0.82, 0.82, 1.75, 12, 1, false, 0, Math.PI]} />
        <meshStandardMaterial {...B} />
      </mesh>

      {/* Front face / radiator */}
      <mesh position={[0, 0.58, 2.32]} castShadow>
        <boxGeometry args={[1.5, 0.45, 0.08]} />
        <meshStandardMaterial {...B} />
      </mesh>

      {/* Grill — chrome frame */}
      <mesh position={[0, 0.58, 2.36]}>
        <boxGeometry args={[0.9, 0.36, 0.04]} />
        <meshStandardMaterial {...T} />
      </mesh>
      {/* Grill vertical slats */}
      {[-0.28, -0.14, 0, 0.14, 0.28].map((x) => (
        <mesh key={`gs${x}`} position={[x, 0.58, 2.37]}>
          <boxGeometry args={[0.025, 0.3, 0.03]} />
          <meshStandardMaterial color="#1a1218" roughness={0.9} />
        </mesh>
      ))}
      {/* Grill horizontal bars */}
      {[-0.08, 0.08].map((y) => (
        <mesh key={`gb${y}`} position={[0, 0.58 + y, 2.37]}>
          <boxGeometry args={[0.85, 0.02, 0.03]} />
          <meshStandardMaterial {...T} />
        </mesh>
      ))}

      {/* Hood ornament */}
      <mesh position={[0, 0.82, 2.2]}>
        <coneGeometry args={[0.03, 0.2, 5]} />
        <meshStandardMaterial {...T} />
      </mesh>

      {/* Front bumper — chrome bar */}
      <mesh position={[0, 0.36, 2.36]}>
        <boxGeometry args={[1.8, 0.1, 0.1]} />
        <meshStandardMaterial {...T} />
      </mesh>
      {/* Bumper guards */}
      {[-0.7, 0.7].map((x) => (
        <mesh key={`bg${x}`} position={[x, 0.36, 2.4]}>
          <cylinderGeometry args={[0.05, 0.05, 0.12, 8]} />
          <meshStandardMaterial {...T} />
        </mesh>
      ))}

      {/* Headlights — large chrome-ringed lamps */}
      {[-0.62, 0.62].map((x) => (
        <group key={`hl${x}`} position={[x, 0.62, 2.34]}>
          {/* Light housing */}
          <mesh>
            <cylinderGeometry args={[0.15, 0.13, 0.12, 12]} />
            <meshStandardMaterial {...T} />
          </mesh>
          {/* Lens */}
          <mesh position={[0, 0, 0.06]} rotation={[Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.12, 12]} />
            <meshStandardMaterial color="#fff8e0" emissive="#ffedb0" emissiveIntensity={1.0} roughness={0.15} />
          </mesh>
        </group>
      ))}

      {/* ============ MAIN BODY ============ */}
      <mesh position={[0, 0.52, 0]} castShadow>
        <boxGeometry args={[1.75, 0.36, 4.2]} />
        <meshStandardMaterial {...B} />
      </mesh>

      {/* Body side bulge (rounded lower body) */}
      {[-0.88, 0.88].map((x) => (
        <mesh key={`bside${x}`} position={[x, 0.52, 0]} castShadow>
          <cylinderGeometry args={[0.18, 0.18, 4.1, 8, 1, false, x > 0 ? -Math.PI / 2 : Math.PI / 2, Math.PI]} />
          <meshStandardMaterial {...B} />
        </mesh>
      ))}

      {/* Running boards (step rails along sides) */}
      {[-0.92, 0.92].map((x) => (
        <mesh key={`rail${x}`} position={[x, 0.34, 0]}>
          <boxGeometry args={[0.12, 0.04, 2.0]} />
          <meshStandardMaterial color="#222" roughness={0.9} />
        </mesh>
      ))}

      {/* Chrome belt line */}
      {[-0.89, 0.89].map((x) => (
        <mesh key={`belt${x}`} position={[x, 0.72, -0.2]}>
          <boxGeometry args={[0.03, 0.03, 2.5]} />
          <meshStandardMaterial {...T} />
        </mesh>
      ))}

      {/* ============ CABIN ============ */}
      {/* Cabin main */}
      <mesh position={[0, 0.98, -0.35]} castShadow>
        <boxGeometry args={[1.6, 0.48, 1.7]} />
        <meshStandardMaterial {...B} />
      </mesh>

      {/* Cabin top — rounded roof */}
      <mesh position={[0, 1.24, -0.35]} castShadow>
        <boxGeometry args={[1.45, 0.06, 1.6]} />
        <meshStandardMaterial {...B} />
      </mesh>
      <mesh position={[0, 1.22, -0.35]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.72, 0.72, 1.4, 12, 1, false, 0, Math.PI]} />
        <meshStandardMaterial {...B} />
      </mesh>

      {/* Pillars (A-pillar, B-pillar, C-pillar) */}
      {[-0.76, 0.76].map((x) =>
        [0.45, -0.05, -0.55].map((z, pi) => (
          <mesh key={`pillar${x}${pi}`} position={[x, 0.98, z]}>
            <boxGeometry args={[0.08, 0.48, 0.08]} />
            <meshStandardMaterial {...B} />
          </mesh>
        ))
      )}

      {/* Windshield — angled */}
      <mesh position={[0, 1.0, 0.48]} rotation={[-0.3, 0, 0]}>
        <planeGeometry args={[1.38, 0.44]} />
        <meshStandardMaterial {...G} side={2} />
      </mesh>
      {/* Rear window */}
      <mesh position={[0, 1.0, -1.12]} rotation={[0.2, Math.PI, 0]}>
        <planeGeometry args={[1.3, 0.4]} />
        <meshStandardMaterial {...G} side={2} />
      </mesh>
      {/* Side windows */}
      {[-0.81, 0.81].map((x) => (
        <group key={`sw${x}`}>
          {/* Front side window */}
          <mesh position={[x, 1.0, 0.2]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[0.42, 0.4]} />
            <meshStandardMaterial {...G} side={2} />
          </mesh>
          {/* Rear side window */}
          <mesh position={[x, 1.0, -0.35]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[0.42, 0.4]} />
            <meshStandardMaterial {...G} side={2} />
          </mesh>
        </group>
      ))}

      {/* Side mirrors */}
      {[-0.86, 0.86].map((x) => (
        <group key={`mir${x}`} position={[x, 0.92, 0.5]}>
          <mesh>
            <boxGeometry args={[0.04, 0.03, 0.14]} />
            <meshStandardMaterial {...T} />
          </mesh>
          <mesh position={[x > 0 ? 0.035 : -0.035, 0, 0]}>
            <boxGeometry args={[0.02, 0.09, 0.12]} />
            <meshStandardMaterial color="#bbd8e8" metalness={0.5} roughness={0.1} />
          </mesh>
        </group>
      ))}

      {/* ============ REAR — BOOT + TAIL ============ */}
      {/* Boot/trunk — extends behind cabin */}
      <mesh position={[0, 0.58, -1.6]} castShadow>
        <boxGeometry args={[1.65, 0.3, 0.9]} />
        <meshStandardMaterial {...B} />
      </mesh>
      {/* Boot top curve */}
      <mesh position={[0, 0.74, -1.6]} castShadow>
        <cylinderGeometry args={[0.82, 0.82, 0.85, 12, 1, false, 0, Math.PI]} />
        <meshStandardMaterial {...B} />
      </mesh>
      {/* Boot lid handle */}
      <mesh position={[0, 0.74, -2.04]}>
        <boxGeometry args={[0.3, 0.04, 0.03]} />
        <meshStandardMaterial {...T} />
      </mesh>

      {/* Rear face panel */}
      <mesh position={[0, 0.52, -2.06]}>
        <boxGeometry args={[1.6, 0.36, 0.06]} />
        <meshStandardMaterial {...B} />
      </mesh>

      {/* Rear bumper */}
      <mesh position={[0, 0.36, -2.1]}>
        <boxGeometry args={[1.75, 0.1, 0.1]} />
        <meshStandardMaterial {...T} />
      </mesh>

      {/* Tail lights */}
      {[-0.6, 0.6].map((x) => (
        <group key={`tl${x}`} position={[x, 0.58, -2.08]}>
          <mesh>
            <cylinderGeometry args={[0.09, 0.08, 0.06, 8]} />
            <meshStandardMaterial color="#cc1111" emissive="#ff0000" emissiveIntensity={0.5} roughness={0.35} />
          </mesh>
          {/* Chrome ring */}
          <mesh>
            <torusGeometry args={[0.09, 0.015, 4, 12]} />
            <meshStandardMaterial {...T} />
          </mesh>
        </group>
      ))}

      {/* Licence plate area */}
      <mesh position={[0, 0.46, -2.08]}>
        <boxGeometry args={[0.5, 0.18, 0.03]} />
        <meshStandardMaterial color="#fdf8f2" roughness={0.8} />
      </mesh>

      {/* ============ FENDERS + WHEEL WELLS ============ */}
      {([
        [-0.88, 0.42, 1.25], [0.88, 0.42, 1.25],
        [-0.88, 0.42, -1.35], [0.88, 0.42, -1.35],
      ] as [number, number, number][]).map(([x, y, z], i) => (
        <mesh key={`fender${i}`} position={[x, y + 0.16, z]} rotation={[0, 0, x > 0 ? 0 : Math.PI]}>
          <sphereGeometry args={[0.48, 10, 6, 0, Math.PI, 0, Math.PI / 2]} />
          <meshStandardMaterial {...B} />
        </mesh>
      ))}

      {/* ============ WHEELS ============ */}
      {([
        [-0.92, 0.38, 1.25], [0.92, 0.38, 1.25],
        [-0.92, 0.38, -1.35], [0.92, 0.38, -1.35],
      ] as [number, number, number][]).map(([x, y, z], i) => (
        <group key={`wh${i}`} position={[x, y, z]}>
          {/* Outer tire */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[0.32, 0.12, 8, 16]} />
            <meshStandardMaterial color="#1a1218" roughness={0.95} />
          </mesh>
          {/* Wheel disc */}
          <mesh rotation={[0, 0, Math.PI / 2]} position={[x > 0 ? 0.05 : -0.05, 0, 0]}>
            <cylinderGeometry args={[0.28, 0.28, 0.08, 14]} />
            <meshStandardMaterial color="#2a2228" roughness={0.85} metalness={0.1} />
          </mesh>
          {/* Hub cap */}
          <mesh rotation={[0, 0, Math.PI / 2]} position={[x > 0 ? 0.1 : -0.1, 0, 0]}>
            <cylinderGeometry args={[0.14, 0.14, 0.03, 10]} />
            <meshStandardMaterial {...T} />
          </mesh>
          {/* Spokes */}
          {[0, 1, 2, 3, 4, 5].map((s) => {
            const a = (s / 6) * Math.PI * 2;
            return (
              <mesh key={s} rotation={[0, 0, Math.PI / 2]} position={[x > 0 ? 0.08 : -0.08, Math.cos(a) * 0.2, Math.sin(a) * 0.2]}>
                <boxGeometry args={[0.02, 0.03, 0.02]} />
                <meshStandardMaterial {...T} />
              </mesh>
            );
          })}
        </group>
      ))}

      {/* ============ DECORATIONS ============ */}
      {decorations && (
        <>
          {/* Hood garland */}
          <Garland from={[-0.8, 0.78, 1.3]} to={[0.8, 0.78, 1.3]} sag={0.22} color="#f5a623" count={10} />
          {/* Rear garland */}
          <Garland from={[-0.75, 0.7, -2.05]} to={[0.75, 0.7, -2.05]} sag={0.2} color="#e8452c" count={8} />

          {/* Hood flowers */}
          <Flower position={[-0.35, 0.78, 1.8]} />
          <Flower position={[0, 0.78, 1.9]} />
          <Flower position={[0.35, 0.78, 1.8]} />

          {/* Roof bow */}
          <mesh position={[0, 1.32, -0.35]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshStandardMaterial {...T} />
          </mesh>
          {[-0.14, 0.14].map((x) => (
            <mesh key={`bow${x}`} position={[x, 1.32, -0.35]} rotation={[0, 0, x > 0 ? -0.7 : 0.7]}>
              <coneGeometry args={[0.08, 0.28, 5]} />
              <meshStandardMaterial {...T} />
            </mesh>
          ))}

          {/* Trailing ribbons from rear */}
          <Garland from={[-0.25, 0.42, -2.1]} to={[-0.25, 0.22, -3.5]} sag={-0.12} color={trimColor} count={7} />
          <Garland from={[0.25, 0.42, -2.1]} to={[0.25, 0.22, -3.5]} sag={-0.12} color={trimColor} count={7} />

          {/* JUST MARRIED plate on rear */}
          {plateTexture && (
            <mesh position={[0, 0.46, -2.12]} rotation={[0, Math.PI, 0]}>
              <planeGeometry args={[0.5, 0.16]} />
              <meshStandardMaterial map={plateTexture} roughness={0.7} />
            </mesh>
          )}
        </>
      )}
    </group>
  );
}
