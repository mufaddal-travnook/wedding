import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  InstancedMesh,
  Object3D,
  Color,
  SphereGeometry,
  MeshStandardMaterial,
} from 'three';

const FLOWER_PALETTE = ['#f05a8e', '#f5a623', '#fdf8f2', '#e86fb0', '#ffe27a', '#c9a04e', '#ff7eb3'];

interface WildflowersProps {
  zoneZ: number;
  count?: number;
  spread?: number;
}

export function Wildflowers({
  zoneZ,
  count = 120,
  spread = 45,
}: WildflowersProps) {
  const meshRef = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);
  const initialized = useRef(false);

  const flowers = useMemo(() => {
    const arr: { x: number; z: number; scale: number; phase: number; colorIdx: number }[] = [];
    for (let i = 0; i < count; i++) {
      let x: number;
      do {
        x = (Math.random() - 0.5) * spread * 2;
      } while (Math.abs(x) < 4);

      arr.push({
        x,
        z: (Math.random() - 0.5) * spread * 1.2 + zoneZ,
        scale: 0.08 + Math.random() * 0.12,
        phase: Math.random() * Math.PI * 2,
        colorIdx: Math.floor(Math.random() * FLOWER_PALETTE.length),
      });
    }
    return arr;
  }, [count, spread, zoneZ]);

  const colors = useMemo(() => FLOWER_PALETTE.map((c) => new Color(c)), []);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh || initialized.current) return;

    for (let i = 0; i < flowers.length; i++) {
      const f = flowers[i];
      dummy.position.set(f.x, 0.12, f.z);
      dummy.scale.setScalar(f.scale);
      dummy.rotation.set(0, Math.random() * Math.PI, 0);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      mesh.setColorAt(i, colors[f.colorIdx]);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    initialized.current = true;
  }, [flowers, colors, dummy]);

  useFrame((state) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const time = state.clock.elapsedTime;

    for (let i = 0; i < flowers.length; i++) {
      const f = flowers[i];
      const sway = Math.sin(time * 1.2 + f.phase) * 0.1;
      dummy.position.set(f.x, 0.12 + Math.sin(time * 0.8 + f.phase) * 0.015, f.z);
      dummy.scale.setScalar(f.scale);
      dummy.rotation.set(sway, f.phase, sway * 0.5);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  const geo = useMemo(() => new SphereGeometry(1, 6, 6), []);
  const mat = useMemo(
    () => new MeshStandardMaterial({ color: '#ffffff', vertexColors: true, roughness: 0.6 }),
    []
  );

  return <instancedMesh ref={meshRef} args={[geo, mat, count]} frustumCulled={false} />;
}
