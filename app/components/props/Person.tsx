import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Mesh } from 'three';

interface PersonProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  shirtColor?: string;
  pantsColor?: string;
  skinColor?: string;
  scale?: number;
  animate?: boolean;    // arm sway
}

export function Person({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  shirtColor = '#b3122e',
  pantsColor = '#241c4d',
  skinColor = '#d9a679',
  scale: s = 1,
  animate = false,
}: PersonProps) {
  const armLRef = useRef<Mesh>(null);
  const armRRef = useRef<Mesh>(null);
  const phase = useRef(Math.random() * Math.PI * 2);

  useFrame((state) => {
    if (!animate) return;
    const t = state.clock.elapsedTime * 4 + phase.current;
    if (armLRef.current) armLRef.current.rotation.z = 0.5 + Math.sin(t) * 0.55;
    if (armRRef.current) armRRef.current.rotation.z = -0.5 - Math.cos(t) * 0.55;
  });

  return (
    <group position={position} rotation={rotation} scale={s}>
      {/* Pants/legs */}
      <mesh position={[0, 0.28, 0]}>
        <cylinderGeometry args={[0.16, 0.2, 0.55, 7]} />
        <meshStandardMaterial color={pantsColor} roughness={0.8} />
      </mesh>
      {/* Torso */}
      <mesh position={[0, 0.78, 0]}>
        <cylinderGeometry args={[0.2, 0.17, 0.5, 7]} />
        <meshStandardMaterial color={shirtColor} roughness={0.7} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.16, 0]}>
        <sphereGeometry args={[0.16, 8, 8]} />
        <meshStandardMaterial color={skinColor} roughness={0.8} />
      </mesh>
      {/* Left arm */}
      <mesh ref={armLRef} position={[-0.25, 1.0, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.42, 5]} />
        <meshStandardMaterial color={shirtColor} roughness={0.7} />
      </mesh>
      {/* Right arm */}
      <mesh ref={armRRef} position={[0.25, 1.0, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.42, 5]} />
        <meshStandardMaterial color={shirtColor} roughness={0.7} />
      </mesh>
    </group>
  );
}
