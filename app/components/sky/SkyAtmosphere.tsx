import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  InstancedMesh, Object3D, Color,
  PointsMaterial, BufferGeometry, Float32BufferAttribute,
  Points, DoubleSide, AdditiveBlending,
} from 'three';

// ============ TWINKLING STARS (Reception) ============
export function StarField({ count = 400, radius = 130, zoneZ = 0 }: { count?: number; radius?: number; zoneZ?: number }) {
  const pointsRef = useRef<Points>(null);

  const { positions, sizes } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sz = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * 0.4;
      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.cos(phi) + 15;
      pos[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta) + zoneZ;
      sz[i] = 0.3 + Math.random() * 0.8;
    }
    return { positions: pos, sizes: sz };
  }, [count, radius, zoneZ]);

  const geo = useMemo(() => {
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(positions, 3));
    return g;
  }, [positions]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const mat = pointsRef.current.material as PointsMaterial;
    mat.opacity = 0.65 + Math.sin(state.clock.elapsedTime * 0.8) * 0.2;
  });

  return (
    <points ref={pointsRef} geometry={geo}>
      <pointsMaterial
        color="#ffffff"
        size={0.9}
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// ============ FLOATING PARTICLES (generic, color set directly) ============
function FloatingParticles({
  zoneZ, count = 50, color = '#ffd9a0', color2,
  size = 0.1, speed = 0.4, heightRange = [2, 18] as [number, number],
  drift = 0.3, glow = false,
}: {
  zoneZ: number; count?: number; color?: string; color2?: string;
  size?: number; speed?: number; heightRange?: [number, number];
  drift?: number; glow?: boolean;
}) {
  const meshRef = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);
  const initialized = useRef(false);

  const particles = useMemo(() =>
    Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * 80,
      y: heightRange[0] + Math.random() * (heightRange[1] - heightRange[0]),
      z: (Math.random() - 0.5) * 60 + zoneZ,
      phase: Math.random() * Math.PI * 2,
      speedMul: 0.6 + Math.random() * 0.8,
      baseScale: 0.5 + Math.random() * 1.0,
    })),
    [count, heightRange, zoneZ]
  );

  const c1 = useMemo(() => new Color(color), [color]);
  const c2 = useMemo(() => new Color(color2 || color).offsetHSL(0.05, 0, 0.1), [color2, color]);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh || initialized.current) return;
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      dummy.position.set(p.x, p.y, p.z);
      dummy.scale.setScalar(p.baseScale * size);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      mesh.setColorAt(i, Math.random() > 0.5 ? c1 : c2);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    initialized.current = true;
  }, [particles, c1, c2, size, dummy]);

  useFrame((state) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const s = speed * p.speedMul;
      const y = p.y + Math.sin(t * s + p.phase) * 1.5;
      const x = p.x + Math.sin(t * s * 0.7 + p.phase * 1.5) * drift * 3;
      const z = p.z + Math.cos(t * s * 0.5 + p.phase) * drift * 2;
      const pulse = 0.8 + Math.sin(t * 2 + p.phase) * 0.2;
      dummy.position.set(x, y, z);
      dummy.scale.setScalar(p.baseScale * size * pulse);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} frustumCulled={false}>
      <sphereGeometry args={[1, 5, 5]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={glow ? 0.8 : 0.2}
        transparent
        opacity={0.7}
        depthWrite={false}
      />
    </instancedMesh>
  );
}

// ============ FALLING PETALS ============
function FallingPetals({
  zoneZ, count = 35, color = '#f5a0b0', color2 = '#fdf0f0', spread = 35,
}: { zoneZ: number; count?: number; color?: string; color2?: string; spread?: number }) {
  const meshRef = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);
  const initialized = useRef(false);

  const petals = useMemo(() =>
    Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * spread * 2,
      y: 3 + Math.random() * 15,
      z: (Math.random() - 0.5) * spread + zoneZ,
      phase: Math.random() * Math.PI * 2,
      fallSpeed: 0.3 + Math.random() * 0.5,
      swayAmp: 1 + Math.random() * 3,
      rotSpeed: 1 + Math.random() * 2,
      scale: 0.06 + Math.random() * 0.08,
    })),
    [count, spread, zoneZ]
  );

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh || initialized.current) return;
    const c1 = new Color(color);
    const c2 = new Color(color2);
    for (let i = 0; i < petals.length; i++) {
      dummy.position.set(petals[i].x, petals[i].y, petals[i].z);
      dummy.scale.set(petals[i].scale, petals[i].scale * 0.5, petals[i].scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      mesh.setColorAt(i, Math.random() > 0.4 ? c1 : c2);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    initialized.current = true;
  }, [petals, color, color2, dummy]);

  useFrame((state) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < petals.length; i++) {
      const p = petals[i];
      let y = p.y - (t * p.fallSpeed) % 18;
      if (y < 0) y += 18;
      const x = p.x + Math.sin(t * 0.5 + p.phase) * p.swayAmp;
      const z = p.z + Math.cos(t * 0.4 + p.phase * 1.3) * p.swayAmp * 0.5;
      dummy.position.set(x, y, z);
      dummy.scale.set(p.scale, p.scale * 0.5, p.scale);
      dummy.rotation.set(
        Math.sin(t * p.rotSpeed + p.phase) * 0.8,
        t * p.rotSpeed * 0.5,
        Math.cos(t * p.rotSpeed * 0.7 + p.phase) * 0.6
      );
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} frustumCulled={false}>
      <planeGeometry args={[1, 1]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.15}
        transparent
        opacity={0.65}
        side={DoubleSide}
        depthWrite={false}
      />
    </instancedMesh>
  );
}

// ============ MAIN ============
export function SkyAtmosphere({ eventId, zoneZ }: { eventId: string; zoneZ: number }) {
  switch (eventId) {
    case 'entrance':
      return (
        <group>
          <FloatingParticles zoneZ={zoneZ} count={18} color="#ffd9a0" color2="#ffb870" size={0.07} speed={0.25} heightRange={[4, 18]} drift={0.4} glow />
          <FallingPetals zoneZ={zoneZ} count={12} color="#f5a0b0" color2="#fddde6" spread={25} />
        </group>
      );
    case 'nikah':
      return (
        <group>
          <FallingPetals zoneZ={zoneZ} count={15} color="#fff8f0" color2="#f5ead6" spread={25} />
          <FloatingParticles zoneZ={zoneZ} count={12} color="#fff5d0" color2="#ffe8b0" size={0.05} speed={0.15} heightRange={[6, 22]} drift={0.25} glow />
        </group>
      );
    case 'mehendi':
      return (
        <group>
          <FloatingParticles zoneZ={zoneZ} count={15} color="#f5c040" color2="#f5a623" size={0.06} speed={0.3} heightRange={[3, 14]} drift={0.4} glow />
          <FallingPetals zoneZ={zoneZ} count={10} color="#f5a623" color2="#f5d000" spread={20} />
        </group>
      );
    case 'reception':
      return (
        <group>
          <StarField count={300} radius={140} zoneZ={zoneZ} />
          <FloatingParticles zoneZ={zoneZ} count={15} color="#aabbff" color2="#dde4ff" size={0.05} speed={0.15} heightRange={[5, 20]} drift={0.2} glow />
        </group>
      );
    default:
      return null;
  }
}
