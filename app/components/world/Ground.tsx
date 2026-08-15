import { useMemo } from 'react';
import {
  CanvasTexture,
  RepeatWrapping,
  PlaneGeometry,
  Color,
  Float32BufferAttribute,
  LinearMipmapLinearFilter,
  LinearFilter,
} from 'three';
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
  // Square-ish tiles across a very long plane: one tile per ~14 world units.
  // Mipmaps + high anisotropy stop the fine blade strokes from shimmering
  // when the ground is viewed at a grazing angle.
  tex.repeat.set(16, 44);
  tex.anisotropy = 16;
  tex.generateMipmaps = true;
  tex.minFilter = LinearMipmapLinearFilter;
  tex.magFilter = LinearFilter;
  return tex;
}

/**
 * One continuous ground plane spanning the whole journey.
 *
 * The previous version placed a 70-unit disc per zone at the same y, so
 * neighbouring discs overlapped and z-fought — that was the flicker. A single
 * plane can't overlap itself, so the ground is now uniform and stable.
 *
 * Zone identity is preserved by blending each zone's palette into the vertex
 * colors along Z, giving a smooth transition between zones instead of a hard
 * seam where two discs met.
 */
function createGroundGeometry(
  width: number,
  fromZ: number,
  toZ: number,
  zones: { zoneZ: number; palette: typeof GROUND_PALETTES.entrance }[],
) {
  const length = fromZ - toZ;
  // Enough segments along Z that palette blending reads as a gradient.
  const geo = new PlaneGeometry(width, length, 32, Math.max(64, Math.ceil(length / 6)));
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, 0, (fromZ + toZ) / 2);

  const toColor = (c: [number, number, number]) => new Color(`rgb(${c.join(',')})`);
  const stops = zones.map((z) => ({
    z: z.zoneZ,
    base: toColor(z.palette.base),
    dark: toColor(z.palette.dark),
    light: toColor(z.palette.light),
  }));

  const pos = geo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const c = new Color();

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);

    // Find the two zone stops this vertex sits between and blend their
    // palettes. Zones run front-to-back, so stop z values descend.
    const last = stops[stops.length - 1];
    let a = stops[0];
    let b = stops[0];
    if (z <= last.z) {
      // Past the final zone — hold its palette flat.
      a = b = last;
    } else {
      for (let s = 0; s < stops.length - 1; s++) {
        if (z <= stops[s].z && z >= stops[s + 1].z) {
          a = stops[s];
          b = stops[s + 1];
          break;
        }
      }
    }
    const span = a.z - b.z;
    // Smoothstep so zones ease into each other rather than ramping linearly.
    const raw = span > 0 ? Math.min(1, Math.max(0, (a.z - z) / span)) : 0;
    const k = raw * raw * (3 - 2 * raw);

    c.copy(a.base).lerp(b.base, k);
    const lightC = a.light.clone().lerp(b.light, k);
    const darkC = a.dark.clone().lerp(b.dark, k);

    // Smooth noise-based variation, same character as before.
    const noise = Math.sin(x * 0.1 + 1.7) * Math.cos(z * 0.1) * 0.5 + 0.5;
    c.lerp(noise > 0.55 ? lightC : darkC, noise * 0.25);

    // Darken toward the far left/right edges so the plane fades out.
    const edge = Math.min(1, Math.abs(x) / (width / 2));
    c.multiplyScalar(1 - edge * edge * 0.18);

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
  const ground = useMemo(() => {
    if (typeof document === 'undefined') return null;

    const zones = events.map((event) => ({
      zoneZ: event.zoneZ,
      palette: GROUND_PALETTES[event.id] ?? GROUND_PALETTES.entrance,
    }));

    // Extend well past the first and last zones so the plane never ends in view.
    const fromZ = zones[0].zoneZ + 90;
    const toZ = zones[zones.length - 1].zoneZ - 90;

    return {
      geo: createGroundGeometry(220, fromZ, toZ, zones),
      // The texture is a detail overlay; zone color comes from vertex colors.
      tex: generateGrassTexture(GROUND_PALETTES.entrance),
    };
  }, [events]);

  if (!ground) return null;

  // y=-0.12 sits clearly below the road shoulder (underside at y=-0.06) so the
  // two surfaces never z-fight where the road crosses the ground.
  return (
    <mesh geometry={ground.geo} position={[0, -0.12, 0]} receiveShadow>
      <meshStandardMaterial map={ground.tex} vertexColors roughness={0.92} />
    </mesh>
  );
}
