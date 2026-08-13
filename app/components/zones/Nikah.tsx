import { Tree, FlowerBed, Lantern, Chair, Drape, Fountain } from '../props';

interface NikahProps {
  zoneZ: number;
}

// Mandap pillar
function MandapPillar({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 3.4, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.24, 4.6, 8]} />
        <meshStandardMaterial color="#fdf8f2" roughness={0.5} />
      </mesh>
      <mesh position={[0, 5.85, 0]}>
        <sphereGeometry args={[0.3, 8, 8]} />
        <meshStandardMaterial color="#c9a04e" metalness={0.5} roughness={0.35} />
      </mesh>
    </group>
  );
}

export function Nikah({ zoneZ }: NikahProps) {
  const pillars = Array.from({ length: 6 }, (_, i) => {
    const a = (i / 6) * Math.PI * 2;
    return { x: Math.cos(a) * 4.4, z: Math.sin(a) * 4.4 };
  });

  return (
    <group position={[0, 0, zoneZ]}>

      {/* ===== IVORY CARPET ===== */}
      <mesh position={[-8, 0.16, 0]} receiveShadow>
        <boxGeometry args={[3.4, 0.06, 16]} />
        <meshStandardMaterial color="#faf3e6" roughness={0.9} />
      </mesh>
      <mesh position={[-8, 0.13, 0]}>
        <boxGeometry args={[3.8, 0.04, 16]} />
        <meshStandardMaterial color="#c9a04e" roughness={0.6} metalness={0.2} />
      </mesh>

      {/* ===== MANDAP ===== */}
      <group position={[-14, 0, 0]}>
        {/* Base platforms */}
        <mesh position={[0, 0.35, 0]}>
          <cylinderGeometry args={[6, 6.4, 0.7, 10]} />
          <meshStandardMaterial color="#f5ead6" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.95, 0]}>
          <cylinderGeometry args={[5.2, 5.6, 0.5, 10]} />
          <meshStandardMaterial color="#fdf8f2" roughness={0.6} />
        </mesh>

        {/* Pillars */}
        {pillars.map((p, i) => (
          <MandapPillar key={i} x={p.x} z={p.z} />
        ))}

        {/* Drapes between pillars */}
        {pillars.map((p, i) => {
          const next = pillars[(i + 1) % pillars.length];
          const mx = (p.x + next.x) / 2;
          const mz = (p.z + next.z) / 2;
          const angle = Math.atan2(mx, mz);
          return (
            <Drape
              key={`drape${i}`}
              position={[mx, 3.35, mz]}
              rotation={[0, angle, 0]}
              width={2.6}
              height={4.3}
              color="#fffdf8"
              opacity={0.4}
            />
          );
        })}

        {/* Dome roof */}
        <mesh position={[0, 6.9, 0]} castShadow>
          <coneGeometry args={[5.6, 2.4, 10]} />
          <meshStandardMaterial color="#f5ead6" roughness={0.6} />
        </mesh>
        {/* Gold finial */}
        <mesh position={[0, 8.6, 0]}>
          <sphereGeometry args={[1.05, 12, 12]} />
          <meshStandardMaterial color="#c9a04e" metalness={0.55} roughness={0.3} />
        </mesh>
        <mesh position={[0, 9.7, 0]}>
          <coneGeometry args={[0.3, 0.9, 6]} />
          <meshStandardMaterial color="#c9a04e" metalness={0.55} roughness={0.3} />
        </mesh>

        {/* Seat of honour */}
        <mesh position={[0, 1.45, 0]}>
          <boxGeometry args={[2.6, 0.5, 1.2]} />
          <meshStandardMaterial color="#e9d9bd" roughness={0.7} />
        </mesh>
        <mesh position={[0, 2.1, -0.6]}>
          <boxGeometry args={[2.6, 1.4, 0.28]} />
          <meshStandardMaterial color="#c9a04e" metalness={0.3} roughness={0.5} />
        </mesh>
      </group>

      {/* ===== GUEST CHAIRS ===== */}
      {Array.from({ length: 3 }).flatMap((_, r) =>
        Array.from({ length: 4 }).map((_, c) => (
          <Chair
            key={`chair${r}${c}`}
            position={[-8.5 + c * 1.3 - (r % 2) * 0.4, 0, -4.5 - r * 1.4]}
            rotation={[0, Math.atan2(14 - (-8.5 + c * 1.3), 0 - (-4.5 - r * 1.4)), 0]}
            color="#fdf8f2"
            accentColor="#c9a04e"
          />
        ))
      )}

      {/* ===== FLORAL PILLARS ===== */}
      {Array.from({ length: 4 }).flatMap((_, i) =>
        [-1, 1].map((s) => (
          <group key={`fpillar${i}${s}`} position={[-3.5 - i * 2.6, 0, s * 2.4]}>
            <mesh position={[0, 1.2, 0]}>
              <cylinderGeometry args={[0.14, 0.2, 2.4, 7]} />
              <meshStandardMaterial color="#f5ead6" roughness={0.6} />
            </mesh>
            <mesh position={[0, 2.7, 0]}>
              <sphereGeometry args={[0.6, 8, 8]} />
              <meshStandardMaterial color="#fffdf8" roughness={0.5} />
            </mesh>
            <FlowerBed position={[0, 3.05, 0]} count={6} spreadX={0.45} spreadZ={0.45} colors={['#fffdf8', '#f3ddc0']} />
          </group>
        ))
      )}

      {/* ===== JASMINE TREES ===== */}
      {([[-20, 6], [-19, -7], [-7, 9], [6, 8], [7, -7], [14, 3]] as [number, number][]).map(([x, z], i) => (
        <Tree key={`jt${i}`} position={[x, 0, z]} scale={0.9 + Math.abs(Math.sin(i)) * 0.4} leafColor="#dfe8d2" />
      ))}

      {/* ===== FLOWER BEDS ===== */}
      <FlowerBed position={[-4, 0, 3]} count={30} spreadX={16} spreadZ={8} colors={['#fffdf8', '#f3ddc0', '#f7e9c9']} />

      {/* ===== LANTERNS ===== */}
      {Array.from({ length: 8 }).map((_, i) => (
        <Lantern
          key={`nl${i}`}
          position={[
            (Math.sin(i * 2.1) * 0.5 + 0.5) * 26 - 18,
            4 + Math.sin(i * 1.4) * 3,
            (Math.cos(i * 1.6) * 0.5 + 0.5) * 14 - 7,
          ]}
          color="#fff0cf"
          size={0.24}
        />
      ))}

      {/* ===== FOUNTAIN ===== */}
      <Fountain position={[8, 0, -5]} color="#aaddff" height={2} spread={0.8} />
    </group>
  );
}
