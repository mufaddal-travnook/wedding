import { useMemo } from 'react';
import { CanvasTexture, RepeatWrapping, CircleGeometry, Color, Float32BufferAttribute } from 'three';
import type { EventConfig } from '@/app/config/types';

const GROUND_PALETTES: Record<string, {
  base: [number, number, number];
  dark: [number, number, number];
  light: [number, number, number];
  soil: [number, number, number];
}> = {
  entrance: { base: [95, 135, 80], dark: [65, 105, 55], light: [125, 165, 105], soil: [140, 120, 85] },
  nikah:    { base: [185, 175, 145], dark: [155, 145, 115], light: [215, 205, 180], soil: [170, 150, 110] },
  mehendi:  { base: [105, 158, 65], dark: [75, 125, 45], light: [140, 190, 95], soil: [130, 115, 70] },
  reception:{ base: [30, 52, 38], dark: [18, 35, 25], light: [48, 72, 52], soil: [45, 38, 28] },
};

function generateGrassTexture(palette: typeof GROUND_PALETTES.entrance): CanvasTexture {
  const size = 512;
  const cv = document.createElement('canvas');
  cv.width = size;
  cv.height = size;
  const ctx = cv.getContext('2d')!;
  const { base, dark, light, soil } = palette;

  // Base fill
  ctx.fillStyle = `rgb(${base[0]},${base[1]},${base[2]})`;
  ctx.fillRect(0, 0, size, size);

  // Layer 1: Large organic patches — irregular earth/grass variation
  for (let i = 0; i < 300; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = 15 + Math.random() * 35;
    const isSoil = Math.random() > 0.75;
    const c = isSoil ? soil : (Math.random() > 0.5 ? light : dark);
    ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${0.08 + Math.random() * 0.12})`;
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * (0.4 + Math.random() * 1.2), Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  // Layer 2: Medium grass clumps
  for (let i = 0; i < 500; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = 4 + Math.random() * 12;
    const c = Math.random() > 0.6 ? light : dark;
    ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${0.12 + Math.random() * 0.15})`;
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * 0.7, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  // Layer 3: Fine grass blade strokes — directional, organic feel
  for (let i = 0; i < 4000; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const len = 2 + Math.random() * 6;
    // Mostly vertical with slight randomness
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.6;
    const c = Math.random() > 0.55 ? light : dark;
    ctx.strokeStyle = `rgba(${c[0]},${c[1]},${c[2]},${0.18 + Math.random() * 0.22})`;
    ctx.lineWidth = 0.4 + Math.random() * 1.0;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(angle) * len, y + Math.sin(angle) * len);
    ctx.stroke();
  }

  // Layer 4: Tiny bright highlights — subtle dew/life
  for (let i = 0; i < 200; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    ctx.fillStyle = `rgba(${light[0] + 40},${light[1] + 40},${light[2] + 30},${0.06 + Math.random() * 0.08})`;
    ctx.beginPath();
    ctx.arc(x, y, 0.4 + Math.random() * 1.2, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new CanvasTexture(cv);
  tex.wrapS = RepeatWrapping;
  tex.wrapT = RepeatWrapping;
  tex.repeat.set(12, 12);
  tex.anisotropy = 4;
  return tex;
}

function createGroundGeometry(radius: number, palette: typeof GROUND_PALETTES.entrance) {
  const geo = new CircleGeometry(radius, 48);
  geo.rotateX(-Math.PI / 2);

  const pos = geo.attributes.position;
  const base = new Color(`rgb(${palette.base.join(',')})`);
  const dark = new Color(`rgb(${palette.dark.join(',')})`);
  const light = new Color(`rgb(${palette.light.join(',')})`);
  const colors = new Float32Array(pos.count * 3);

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const dist = Math.sqrt(x * x + z * z) / radius;

    // Smooth noise-based variation
    const noise = Math.sin(x * 0.1 + 1.7) * Math.cos(z * 0.1) * 0.5 + 0.5;
    const c = base.clone().lerp(noise > 0.55 ? light : dark, noise * 0.25);
    // Edge darkening
    c.multiplyScalar(0.9 + (1 - dist) * 0.1);

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
      return {
        id: event.id,
        zoneZ: event.zoneZ,
        geo: createGroundGeometry(70, palette),
        tex: generateGrassTexture(palette),
      };
    });
  }, [events]);

  return (
    <group>
      {grounds.map((g) => (
        <mesh key={g.id} geometry={g.geo} position={[0, -0.02, g.zoneZ]} receiveShadow>
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
