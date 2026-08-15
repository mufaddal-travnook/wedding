import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  InstancedMesh,
  Object3D,
  Color,
  PlaneGeometry,
  MeshStandardMaterial,
  DoubleSide,
} from 'three';

// 4-color palette for grass variation
const GRASS_PALETTE = ['#5a9440', '#6db848', '#4a7a30', '#7dba55'];

interface GrassFieldProps {
  zoneZ: number;
  count?: number;
  spread?: number;
  color?: string;
  colorVariation?: string;
  height?: number;
}

// Simple clustered noise — value noise with threshold
function clusteredRandom(spread: number, count: number, zoneZ: number): { x: number; z: number }[] {
  const pts: { x: number; z: number }[] = [];
  let attempts = 0;
  while (pts.length < count && attempts < count * 5) {
    attempts++;
    const x = (Math.random() - 0.5) * spread * 2;
    const z = (Math.random() - 0.5) * spread * 1.4;
    // Exclude road corridor (3 units each side)
    if (Math.abs(x) < 3.5) continue;
    // Clustered: use noise-like threshold — blades more likely near existing blades
    const noise = Math.sin(x * 0.3) * Math.cos(z * 0.3) * 0.5 + 0.5;
    if (Math.random() > noise * 0.7 + 0.3) continue;
    pts.push({ x, z: z + zoneZ });
  }
  return pts;
}

export function GrassField({
  zoneZ,
  count = 800,
  spread = 50,
  color = '#5a9440',
  colorVariation = '#7dba55',
  height = 0.6,
}: GrassFieldProps) {
  const meshRef = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);
  const initialized = useRef(false);

  const blades = useMemo(() => {
    const positions = clusteredRandom(spread, count, zoneZ);
    return positions.map((p) => ({
      x: p.x,
      z: p.z,
      scale: 0.6 + Math.random() * 0.8,
      rotY: Math.random() * Math.PI,
      tiltX: (Math.random() - 0.5) * 0.5,  // ±15° tilt
      phase: Math.random() * Math.PI * 2,
      speed: 0.8 + Math.random() * 0.6,
      colorIdx: Math.floor(Math.random() * 4),
    }));
  }, [count, spread, zoneZ]);

  const palette = useMemo(() => {
    const base = new Color(color);
    const alt = new Color(colorVariation);
    return [
      base.clone(),
      alt.clone(),
      base.clone().lerp(alt, 0.3),
      alt.clone().offsetHSL(0.02, 0, 0.05),
    ];
  }, [color, colorVariation]);

  // Initialize instance matrices and colors on mount
  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh || initialized.current) return;

    for (let i = 0; i < blades.length; i++) {
      const b = blades[i];
      dummy.position.set(b.x, 0.02, b.z);
      dummy.scale.set(1, b.scale, 1);
      dummy.rotation.set(b.tiltX, b.rotY, 0);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      mesh.setColorAt(i, palette[b.colorIdx]);
    }
    // Fill remaining slots (if clustered noise produced fewer)
    for (let i = blades.length; i < count; i++) {
      dummy.position.set(0, -100, 0); // hide unused
      dummy.scale.set(0, 0, 0);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    initialized.current = true;
  }, [blades, palette, dummy, count]);

  // Wind animation
  useFrame((state) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const time = state.clock.elapsedTime;

    for (let i = 0; i < blades.length; i++) {
      const b = blades[i];
      const windX = Math.sin(time * b.speed + b.phase) * 0.18;
      const windZ = Math.cos(time * b.speed * 0.7 + b.phase * 1.3) * 0.1;
      const gust = Math.sin(time * 0.4 + b.x * 0.06) * 0.12;

      dummy.position.set(b.x, 0.02, b.z);
      dummy.scale.set(1, b.scale, 1);
      dummy.rotation.set(b.tiltX + windX + gust, b.rotY, windZ);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  const geo = useMemo(() => {
    const g = new PlaneGeometry(0.12, height, 1, 3);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      const normalizedY = (y + height / 2) / height;
      pos.setX(i, pos.getX(i) * (1 - normalizedY * 0.8));
      pos.setY(i, y + height / 2);
    }
    pos.needsUpdate = true;
    g.computeVertexNormals();
    return g;
  }, [height]);

  const mat = useMemo(
    // Per-blade tint comes from setColorAt, not a vertex attribute — see FlowerBed.
    () => new MeshStandardMaterial({
      color: '#ffffff',
      side: DoubleSide,
      roughness: 0.8,
    }),
    []
  );

  return <instancedMesh ref={meshRef} args={[geo, mat, count]} frustumCulled={false} />;
}
