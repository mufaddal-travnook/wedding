import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Mesh } from 'three';

interface HorseProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  bodyColor?: string;
  scale?: number;
}

export function Horse({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  bodyColor = '#f5f0e6',
  scale: s = 1,
}: HorseProps) {
  const headRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (!headRef.current) return;
    headRef.current.rotation.z = -0.18 + Math.sin(state.clock.elapsedTime * 1.3) * 0.06;
  });

  return (
    <group position={position} rotation={rotation} scale={s}>
      {/* Body */}
      <mesh position={[0, 1.35, 0]} castShadow>
        <boxGeometry args={[2.1, 0.95, 0.8]} />
        <meshStandardMaterial color={bodyColor} roughness={0.75} />
      </mesh>
      {/* Neck */}
      <mesh position={[0.95, 2.0, 0]} rotation={[0, 0, -0.5]} castShadow>
        <boxGeometry args={[0.45, 1.05, 0.5]} />
        <meshStandardMaterial color={bodyColor} roughness={0.75} />
      </mesh>
      {/* Head */}
      <mesh ref={headRef} position={[1.5, 2.42, 0]} rotation={[0, 0, -0.18]} castShadow>
        <boxGeometry args={[0.75, 0.4, 0.42]} />
        <meshStandardMaterial color={bodyColor} roughness={0.75} />
      </mesh>
      {/* Ears */}
      {[0.14, -0.14].map((z) => (
        <mesh key={z} position={[1.32, 2.72, z]}>
          <coneGeometry args={[0.09, 0.26, 4]} />
          <meshStandardMaterial color={bodyColor} roughness={0.8} />
        </mesh>
      ))}
      {/* Legs */}
      {[[-0.8, 0.32], [-0.8, -0.32], [0.8, 0.32], [0.8, -0.32]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.45, z]}>
          <cylinderGeometry args={[0.11, 0.09, 0.95, 6]} />
          <meshStandardMaterial color={bodyColor} roughness={0.8} />
        </mesh>
      ))}
      {/* Tail */}
      <mesh position={[-1.15, 1.5, 0]} rotation={[0, 0, 0.7]}>
        <coneGeometry args={[0.14, 0.9, 5]} />
        <meshStandardMaterial color="#cfc4ae" roughness={0.7} />
      </mesh>
      {/* Saddle cloth */}
      <mesh position={[0, 1.86, 0]}>
        <boxGeometry args={[1.15, 0.1, 0.95]} />
        <meshStandardMaterial color="#b3122e" roughness={0.5} />
      </mesh>
      {/* Gold saddle trim */}
      <mesh position={[0, 1.8, 0]}>
        <boxGeometry args={[1.05, 0.06, 1.02]} />
        <meshStandardMaterial color="#c9a04e" metalness={0.4} roughness={0.4} />
      </mesh>
      {/* Plume */}
      <mesh position={[1.42, 3.0, 0]}>
        <coneGeometry args={[0.1, 0.5, 5]} />
        <meshStandardMaterial color="#f05a8e" emissive="#881144" emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}
