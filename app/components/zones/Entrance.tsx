import { useMemo } from 'react';
import { CanvasTexture } from 'three';
import { Tree, Palm, Flower, FlowerBed, Lantern, Fountain } from '../props';

interface EntranceProps {
  zoneZ: number;
}

// Grand gate post
function GatePost({ x }: { x: number }) {
  return (
    <group position={[x, 0, 0]}>
      <mesh position={[0, 3.7, 0]} castShadow>
        <cylinderGeometry args={[0.42, 0.5, 7.4, 10]} />
        <meshStandardMaterial color="#fdf8f2" roughness={0.6} />
      </mesh>
      {/* Capital */}
      <mesh position={[0, 7.5, 0]}>
        <cylinderGeometry args={[0.58, 0.58, 0.34, 10]} />
        <meshStandardMaterial color="#c9a04e" metalness={0.45} roughness={0.4} />
      </mesh>
      {/* Finial */}
      <mesh position={[0, 7.95, 0]}>
        <sphereGeometry args={[0.42, 10, 10]} />
        <meshStandardMaterial color="#c9a04e" metalness={0.45} roughness={0.4} />
      </mesh>
      {/* Base */}
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.62, 0.7, 0.5, 10]} />
        <meshStandardMaterial color="#c9a04e" metalness={0.45} roughness={0.4} />
      </mesh>
    </group>
  );
}

export function Entrance({ zoneZ }: EntranceProps) {
  const signTexture = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const cv = document.createElement('canvas');
    cv.width = 1024; cv.height = 200;
    const cx = cv.getContext('2d')!;
    cx.fillStyle = '#fdf8f2'; cx.fillRect(0, 0, 1024, 200);
    cx.strokeStyle = '#c9a04e'; cx.lineWidth = 6; cx.strokeRect(14, 14, 996, 172);
    cx.fillStyle = '#8a6a2a'; cx.font = '64px serif';
    cx.textAlign = 'center'; cx.textBaseline = 'middle';
    cx.fillText('WELCOME  TO  OUR  WORLD', 512, 104);
    return new CanvasTexture(cv);
  }, []);

  return (
    <group position={[0, 0, zoneZ]}>

      {/* ===== GRAND GATE ===== */}
      <group position={[0, 0, 6.5]}>
        <GatePost x={-4.4} />
        <GatePost x={4.4} />

        {/* Arch beam */}
        <mesh position={[0, 7.1, 0]} castShadow>
          <boxGeometry args={[9.9, 0.85, 0.5]} />
          <meshStandardMaterial color="#fdf8f2" roughness={0.6} />
        </mesh>

        {/* Sign */}
        {signTexture && (
          <>
            <mesh position={[0, 5.75, 0.28]}>
              <planeGeometry args={[8.6, 1.7]} />
              <meshStandardMaterial map={signTexture} roughness={0.7} />
            </mesh>
            <mesh position={[0, 5.75, -0.28]} rotation={[0, Math.PI, 0]}>
              <planeGeometry args={[8.6, 1.7]} />
              <meshStandardMaterial map={signTexture} roughness={0.7} />
            </mesh>
          </>
        )}

        {/* Gate top decorative arches */}
        <mesh position={[0, 7.8, 0]}>
          <boxGeometry args={[6, 0.12, 0.4]} />
          <meshStandardMaterial color="#c9a04e" metalness={0.4} roughness={0.4} />
        </mesh>
      </group>

      {/* ===== FLANKING PLANTERS ===== */}
      {[-7, 7].map((x) => (
        <group key={`planter${x}`} position={[x, 0, 6.5]}>
          <mesh position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.9, 0.7, 1, 8]} />
            <meshStandardMaterial color="#b35a3c" roughness={0.8} />
          </mesh>
          <mesh position={[0, 1.5, 0]}>
            <sphereGeometry args={[1, 8, 8]} />
            <meshStandardMaterial color="#5f9463" roughness={0.7} />
          </mesh>
          <FlowerBed position={[0, 1.9, 0]} count={6} spreadX={0.7} spreadZ={0.7} colors={['#f05a8e', '#fdf8f2']} />
        </group>
      ))}

      {/* ===== TREES & PALMS ===== */}
      <Palm position={[-11, 0, 2]} scale={1.1} />
      <Palm position={[11, 0, 3]} scale={1.2} />
      <Palm position={[-13, 0, -6]} scale={0.9} />
      <Palm position={[13, 0, -8]} scale={1.0} />
      <Tree position={[-9, 0, 12]} scale={1.2} />
      <Tree position={[9, 0, 13]} scale={1.1} />
      <Tree position={[-16, 0, 7]} scale={1.0} />
      <Tree position={[15, 0, -4]} scale={0.9} />

      {/* ===== FLOWER BEDS ===== */}
      <FlowerBed position={[0, 0, 11]} count={30} spreadX={14} spreadZ={3} colors={['#f05a8e', '#f5a623', '#fdf8f2']} />
      <FlowerBed position={[-10, 0, -2]} count={15} spreadX={4} spreadZ={3} colors={['#f05a8e', '#fdf8f2', '#e86fb0']} />
      <FlowerBed position={[10, 0, -3]} count={15} spreadX={4} spreadZ={3} colors={['#f5a623', '#ffe27a', '#fdf8f2']} />

      {/* ===== FLOATING LANTERNS ===== */}
      {Array.from({ length: 10 }).map((_, i) => (
        <Lantern
          key={`el${i}`}
          position={[
            (Math.sin(i * 2.3) * 0.5 + 0.5) * 28 - 14,
            4.5 + Math.sin(i * 1.7) * 3,
            (Math.cos(i * 1.9) * 0.5 + 0.5) * 16 - 8,
          ]}
          color="#ffd9a0"
          size={0.28}
        />
      ))}

      {/* ===== FOUNTAIN ===== */}
      <Fountain position={[12, 0, 0]} color="#88ccff" height={2.5} />

      {/* ===== WELCOME CARPET ===== */}
      <mesh position={[0, 0.08, 3]} receiveShadow>
        <boxGeometry args={[3.5, 0.04, 8]} />
        <meshStandardMaterial color="#b3122e" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.06, 3]}>
        <boxGeometry args={[3.8, 0.02, 8.2]} />
        <meshStandardMaterial color="#c9a04e" roughness={0.6} metalness={0.2} />
      </mesh>
    </group>
  );
}
