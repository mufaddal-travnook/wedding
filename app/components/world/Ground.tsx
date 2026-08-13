import { useMemo } from 'react';
import { CanvasTexture, RepeatWrapping, CircleGeometry, MeshStandardMaterial, Color, Float32BufferAttribute } from 'three';
import type { EventConfig } from '@/app/config/types';

const GROUND_PALETTES: Record<string, { base: [number, number, number]; dark: [number, number, number]; light: [number, number, number] }> = {
  entrance: { base: [100, 140, 85], dark: [70, 110, 60], light: [130, 170, 110] },
  nikah:    { base: [200, 190, 160], dark: [170, 160, 130], light: [230, 220, 195] },
  mehendi:  { base: [110, 165, 70], dark: [80, 130, 50], light: [145, 195, 100] },
  reception:{ base: [35, 58, 44], dark: [20, 38, 28], light: [55, 80, 60] },
};

function generateGrassTexture(palette: { base: [number, number, number]; dark: [number, number, number]; light: [number, number, number] }): CanvasTexture {
  const size = 512;
  const cv = document.createElement('canvas');
  cv.width = size;
  cv.height = size;
  const ctx = cv.getContext('2d')!;
  const { base, dark, light } = palette;

  // Base fill
  ctx.fillStyle = `rgb(${base[0]},${base[1]},${base[2]})`;
  ctx.fillRect(0, 0, size, size);

  // Large soft patches
  for (let i = 0; i < 400; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = 12 + Math.random() * 30;
    const useLight = Math.random() > 0.45;
    const c = useLight ? light : dark;
    ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${0.12 + Math.random() * 0.15})`;
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * (0.5 + Math.random() * 1.0), Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  // Grass blade strokes
  for (let i = 0; i < 2500; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const len = 3 + Math.random() * 7;
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.9;
    const c = Math.random() > 0.5 ? light : dark;
    ctx.strokeStyle = `rgba(${c[0]},${c[1]},${c[2]},${0.25 + Math.random() * 0.35})`;
    ctx.lineWidth = 0.5 + Math.random() * 1.2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(angle) * len, y + Math.sin(angle) * len);
    ctx.stroke();
  }

  const tex = new CanvasTexture(cv);
  tex.wrapS = RepeatWrapping;
  tex.wrapT = RepeatWrapping;
  tex.repeat.set(10, 10);
  tex.anisotropy = 4;
  return tex;
}

// Create a circle geometry with vertex-color noise for soft edges
function createGroundGeometry(radius: number, segments: number, palette: { base: [number, number, number]; dark: [number, number, number]; light: [number, number, number] }) {
  const geo = new CircleGeometry(radius, segments);
  geo.rotateX(-Math.PI / 2);

  // Add subtle vertex displacement for terrain relief
  const pos = geo.attributes.position;
  for (let i = 1; i < pos.count; i++) { // skip center vertex
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const dist = Math.sqrt(x * x + z * z) / radius;
    // Gentle hills with noise
    const noise = Math.sin(x * 0.12) * Math.cos(z * 0.12) * 0.8
      + Math.sin(x * 0.05 + 1.3) * Math.cos(z * 0.07) * 0.5;
    pos.setY(i, noise * (1 - dist * 0.5)); // flatten near edges
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();

  // Vertex colors for soft green-to-tan blending
  const colors = new Float32Array(pos.count * 3);
  const baseCol = new Color(`rgb(${palette.base.join(',')})`);
  const darkCol = new Color(`rgb(${palette.dark.join(',')})`);
  const lightCol = new Color(`rgb(${palette.light.join(',')})`);

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const dist = Math.sqrt(x * x + z * z) / radius;

    // Noise-based blending
    const noise = Math.sin(x * 0.15 + 2) * Math.cos(z * 0.15) * 0.5 + 0.5;
    const edgeFade = Math.max(0, 1 - dist * 1.1); // fade at edges

    const c = baseCol.clone();
    c.lerp(noise > 0.6 ? lightCol : darkCol, noise * 0.35);
    c.multiplyScalar(0.85 + edgeFade * 0.15); // darken edges slightly

    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }
  geo.setAttribute('color', new Float32BufferAttribute(colors, 3));

  return geo;
}

interface GroundProps {
  events: EventConfig[];
}

export function Ground({ events }: GroundProps) {
  const grounds = useMemo(() => {
    if (typeof document === 'undefined') return [];
    return events.map((event) => {
      const palette = GROUND_PALETTES[event.id] ?? GROUND_PALETTES.entrance;
      const geo = createGroundGeometry(68, 64, palette);
      const tex = generateGrassTexture(palette);
      return { id: event.id, zoneZ: event.zoneZ, geo, tex };
    });
  }, [events]);

  return (
    <group>
      {grounds.map((g) => (
        <mesh key={g.id} geometry={g.geo} position={[0, -0.05, g.zoneZ]} receiveShadow>
          <meshStandardMaterial
            map={g.tex}
            vertexColors
            roughness={0.92}
          />
        </mesh>
      ))}
    </group>
  );
}
