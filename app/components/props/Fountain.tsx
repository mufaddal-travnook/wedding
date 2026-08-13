import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, BufferGeometry, Float32BufferAttribute, PointsMaterial, AdditiveBlending } from 'three';

interface FountainProps {
  position?: [number, number, number];
  color?: string;
  particleCount?: number;
  height?: number;
  spread?: number;
}

export function Fountain({
  position = [0, 0, 0],
  color = '#88ccff',
  particleCount = 80,
  height = 3,
  spread = 1.2,
}: FountainProps) {
  const pointsRef = useRef<Points>(null);

  // Each particle has a phase (0–1 in its lifecycle)
  const particles = useMemo(() =>
    Array.from({ length: particleCount }, () => ({
      phase: Math.random(),
      angle: Math.random() * Math.PI * 2,
      speed: 0.6 + Math.random() * 0.4,
      radial: 0.3 + Math.random() * 0.7,
    })),
    [particleCount]
  );

  const geo = useMemo(() => {
    const g = new BufferGeometry();
    const pos = new Float32Array(particleCount * 3);
    g.setAttribute('position', new Float32BufferAttribute(pos, 3));
    return g;
  }, [particleCount]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const t = state.clock.elapsedTime;
    const posAttr = geo.attributes.position;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      // Lifecycle: 0→1 repeating
      const life = (t * p.speed * 0.5 + p.phase) % 1;

      // Parabolic arc: rises then falls
      const y = height * (life * (2 - life * 2)); // peaks at life=0.5
      const r = spread * life * p.radial;
      const x = Math.cos(p.angle + t * 0.3) * r;
      const z = Math.sin(p.angle + t * 0.3) * r;

      posAttr.setXYZ(i, x, y + 0.5, z);
    }
    posAttr.needsUpdate = true;
  });

  return (
    <group position={position}>
      {/* Basin */}
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[1.2, 1.4, 0.4, 12]} />
        <meshStandardMaterial color="#d0c8b8" roughness={0.8} />
      </mesh>
      {/* Inner basin (water surface) */}
      <mesh position={[0, 0.42, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.0, 12]} />
        <meshStandardMaterial color="#5588bb" roughness={0.2} metalness={0.1} transparent opacity={0.7} />
      </mesh>
      {/* Center pedestal */}
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.15, 0.2, 0.6, 8]} />
        <meshStandardMaterial color="#d0c8b8" roughness={0.7} />
      </mesh>
      {/* Water particles */}
      <points ref={pointsRef} geometry={geo}>
        <pointsMaterial
          color={color}
          size={0.15}
          transparent
          opacity={0.6}
          sizeAttenuation
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </points>
      {/* Mist glow */}
      <mesh position={[0, 1.5, 0]}>
        <sphereGeometry args={[0.8, 8, 8]} />
        <meshBasicMaterial color={color} transparent opacity={0.06} />
      </mesh>
    </group>
  );
}
