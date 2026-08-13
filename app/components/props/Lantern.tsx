import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Mesh } from 'three';

interface LanternProps {
  position?: [number, number, number];
  color?: string;
  size?: number;
}

export function Lantern({ position = [0, 5, 0], color = '#ffd9a0', size = 0.3 }: LanternProps) {
  const ref = useRef<Mesh>(null);
  const phase = useRef(Math.random() * Math.PI * 2);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.position.y = position[1] + Math.sin(t * 1.1 + phase.current) * 0.25;
    ref.current.position.x = position[0] + Math.sin(t * 0.6 + phase.current * 1.3) * 0.1;
  });

  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[size, 8, 8]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={1.2}
        roughness={0.4}
        transparent
        opacity={0.85}
      />
    </mesh>
  );
}
