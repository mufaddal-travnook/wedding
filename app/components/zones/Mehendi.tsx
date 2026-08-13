import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group } from 'three';
import { Tree, Palm, FlowerBed, Lantern, Fountain, StringLights } from '../props';

interface MehendiProps {
  zoneZ: number;
}

// Jhoola (flower swing)
function Jhoola({ position }: { position: [number, number, number] }) {
  const seatRef = useRef<Group>(null);

  useFrame((state) => {
    if (seatRef.current) {
      seatRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.9) * 0.22;
    }
  });

  return (
    <group position={position} rotation={[0, -0.5, 0]}>
      {/* A-frame legs */}
      {[-1.6, 1.6].map((x) => (
        <group key={`leg${x}`}>
          <mesh position={[x, 2.2, 0.9]} rotation={[0.38, 0, 0]}>
            <cylinderGeometry args={[0.09, 0.11, 4.4, 6]} />
            <meshStandardMaterial color="#8a6d5c" roughness={0.85} />
          </mesh>
          <mesh position={[x, 2.2, -0.9]} rotation={[-0.38, 0, 0]}>
            <cylinderGeometry args={[0.09, 0.11, 4.4, 6]} />
            <meshStandardMaterial color="#8a6d5c" roughness={0.85} />
          </mesh>
        </group>
      ))}
      {/* Top bar */}
      <mesh position={[0, 4.15, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.08, 0.08, 3.8, 6]} />
        <meshStandardMaterial color="#8a6d5c" roughness={0.85} />
      </mesh>
      {/* Hanging seat */}
      <group ref={seatRef} position={[0, 4.15, 0]}>
        {/* Ropes */}
        {[-0.75, 0.75].map((x) => (
          <mesh key={`rope${x}`} position={[x, -1.15, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 2.3, 5]} />
            <meshStandardMaterial color="#d9c27a" roughness={0.7} />
          </mesh>
        ))}
        {/* Seat plank */}
        <mesh position={[0, -2.3, 0]}>
          <boxGeometry args={[1.7, 0.12, 0.7]} />
          <meshStandardMaterial color="#e8c400" roughness={0.6} />
        </mesh>
      </group>
    </group>
  );
}

export function Mehendi({ zoneZ }: MehendiProps) {
  return (
    <group position={[0, 0, zoneZ]}>

      {/* ===== DECORATED GAZEBO ===== */}
      <group position={[13, 0, 0]}>
        {/* Base */}
        <mesh position={[0, 0.3, 0]}>
          <cylinderGeometry args={[4.6, 5, 0.6, 8]} />
          <meshStandardMaterial color="#d9c27a" roughness={0.7} />
        </mesh>
        {/* Pillars */}
        {Array.from({ length: 4 }).map((_, i) => {
          const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
          return (
            <mesh key={`gpillar${i}`} position={[Math.cos(a) * 3.4, 2.4, Math.sin(a) * 3.4]}>
              <cylinderGeometry args={[0.18, 0.22, 3.6, 7]} />
              <meshStandardMaterial color="#8a6d5c" roughness={0.85} />
            </mesh>
          );
        })}
        {/* Roof */}
        <mesh position={[0, 5.2, 0]} rotation={[0, Math.PI / 4, 0]}>
          <coneGeometry args={[4.6, 2.2, 4]} />
          <meshStandardMaterial color="#e8c400" roughness={0.6} />
        </mesh>
        {/* Roof finial */}
        <mesh position={[0, 6.5, 0]}>
          <sphereGeometry args={[0.3, 8, 8]} />
          <meshStandardMaterial color="#c9a04e" metalness={0.5} roughness={0.3} />
        </mesh>

        {/* Floor cushions */}
        {[[1.2, 1], [-1.2, 1], [0, -1.4], [1.8, -0.8], [-1.8, -0.8]].map(([x, z], i) => (
          <mesh key={`cushion${i}`} position={[x, 0.75, z]}>
            <cylinderGeometry args={[0.55, 0.6, 0.3, 8]} />
            <meshStandardMaterial
              color={['#e8c400', '#7ec850', '#f5a623', '#e8452c', '#7ec850'][i]}
              roughness={0.8}
            />
          </mesh>
        ))}
      </group>

      {/* ===== JHOOLA (SWING) ===== */}
      <Jhoola position={[9, 0, 7]} />

      {/* ===== MEHENDI TABLE ===== */}
      <group position={[16, 0, 6]}>
        <mesh position={[0, 0.25, 0]}>
          <cylinderGeometry args={[1.1, 1.2, 0.5, 8]} />
          <meshStandardMaterial color="#7ec850" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.75, 0]}>
          <cylinderGeometry args={[0.09, 0.14, 0.5, 6]} />
          <meshStandardMaterial color="#2e5417" roughness={0.8} />
        </mesh>
        <FlowerBed position={[0, 0.5, 0]} count={5} spreadX={0.8} spreadZ={0.8} colors={['#f5d000', '#f5a623']} />
      </group>

      {/* ===== TREES ===== */}
      {([[20, -6, 1.4], [19, 8, 1.2], [8, -8, 1.1], [-6, 10, 1.2], [-7, -9, 1], [25, 2, 1]] as [number, number, number][]).map(([x, z, s], i) => (
        <Tree key={`mt${i}`} position={[x, 0, z]} scale={s} leafColor="#4f9440" />
      ))}

      {/* Marigold-decorated trees */}
      {([[5, 10], [24, 7], [6, -11]] as [number, number][]).map(([x, z], i) => (
        <group key={`mdt${i}`}>
          <Tree position={[x, 0, z]} scale={1} leafColor="#6fae3a" />
          {/* Marigold clusters on tree */}
          {Array.from({ length: 5 }).map((_, j) => (
            <mesh key={j} position={[x + (Math.random() - 0.5) * 2, 1.8 + Math.random() * 1.8, z + (Math.random() - 0.5) * 2]}>
              <sphereGeometry args={[0.15, 6, 6]} />
              <meshStandardMaterial color="#f5a623" emissive="#d07800" emissiveIntensity={0.25} />
            </mesh>
          ))}
        </group>
      ))}

      {/* ===== STRING LIGHTS BETWEEN TREES ===== */}
      <StringLights from={[20, 4.2, -6]} to={[13, 5.3, 0]} sag={1.1} count={15} color="#f5d000" />
      <StringLights from={[13, 5.3, 0]} to={[19, 4.0, 8]} sag={1.1} count={15} color="#f5a623" />
      <StringLights from={[8, 3.4, -8]} to={[13, 5.3, 0]} sag={1.1} count={13} color="#e8452c" />

      {/* ===== FLOWER BEDS ===== */}
      <FlowerBed position={[10, 0, 2]} count={35} spreadX={16} spreadZ={8} colors={['#f5d000', '#f5a623', '#ffe36b']} />
      <FlowerBed position={[-6, 0, 2]} count={16} spreadX={5} spreadZ={5} colors={['#f5d000', '#9ed64f']} />

      {/* ===== LANTERNS ===== */}
      {Array.from({ length: 9 }).map((_, i) => (
        <Lantern
          key={`ml${i}`}
          position={[
            (Math.sin(i * 2.5) * 0.5 + 0.5) * 28 - 4,
            4 + Math.sin(i * 1.6) * 3.5,
            (Math.cos(i * 2.0) * 0.5 + 0.5) * 18 - 9,
          ]}
          color="#fff0a0"
          size={0.26}
        />
      ))}

      {/* ===== FOUNTAIN ===== */}
      <Fountain position={[-8, 0, -3]} color="#88ddaa" height={2} spread={1} />
    </group>
  );
}
