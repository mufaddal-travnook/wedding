import { useRef, useMemo, useEffect } from 'react';
import { InstancedMesh, Object3D, Color, SphereGeometry, MeshStandardMaterial } from 'three';

const DEFAULT_COLORS = ['#f05a8e', '#f5a623', '#fdf8f2', '#e86fb0'];

interface FlowerBedProps {
  position?: [number, number, number];
  count?: number;
  spreadX?: number;
  spreadZ?: number;
  colors?: string[];
}

export function FlowerBed({
  position = [0, 0, 0],
  count = 30,
  spreadX = 5,
  spreadZ = 5,
  colors = DEFAULT_COLORS,
}: FlowerBedProps) {
  const meshRef = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);
  const initialized = useRef(false);

  const flowers = useMemo(() =>
    Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * spreadX * 2,
      z: (Math.random() - 0.5) * spreadZ * 2,
      scale: 0.8 + Math.random() * 0.6,
      rotY: Math.random() * Math.PI * 2,
      colorIdx: Math.floor(Math.random() * colors.length),
    })),
    [count, spreadX, spreadZ, colors.length]
  );

  const palette = useMemo(() => colors.map((c) => new Color(c)), [colors]);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh || initialized.current) return;
    for (let i = 0; i < flowers.length; i++) {
      const f = flowers[i];
      dummy.position.set(f.x, 0.12, f.z);
      dummy.scale.setScalar(f.scale * 0.12);
      dummy.rotation.y = f.rotY;
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      mesh.setColorAt(i, palette[f.colorIdx]);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    initialized.current = true;
  }, [flowers, palette, dummy]);

  return (
    <group position={position}>
      <instancedMesh ref={meshRef} args={[undefined, undefined, count]} frustumCulled={false}>
        <sphereGeometry args={[1, 6, 6]} />
        <meshStandardMaterial color="#ffffff" vertexColors roughness={0.6} />
      </instancedMesh>
    </group>
  );
}
