import { useMemo } from 'react';
import { CircleGeometry, Color, Float32BufferAttribute } from 'three';
import type { EventConfig } from '@/app/config/types';

const GROUND_COLORS: Record<string, string> = {
  entrance: '#6a9060',
  nikah: '#c8b898',
  mehendi: '#7aaa55',
  reception: '#1e3828',
};

function createGroundGeometry(radius: number, baseColor: string) {
  const geo = new CircleGeometry(radius, 48);
  geo.rotateX(-Math.PI / 2);

  const pos = geo.attributes.position;
  const base = new Color(baseColor);
  const colors = new Float32Array(pos.count * 3);

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const dist = Math.sqrt(x * x + z * z) / radius;

    // Subtle variation — not noisy, just gentle shifts
    const variation = Math.sin(x * 0.08) * Math.cos(z * 0.08) * 0.06;
    const c = base.clone();
    c.offsetHSL(0, 0, variation - dist * 0.05);

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
  const grounds = useMemo(() =>
    events.map((event) => ({
      id: event.id,
      zoneZ: event.zoneZ,
      geo: createGroundGeometry(70, GROUND_COLORS[event.id] ?? '#6a9060'),
    })),
    [events]
  );

  return (
    <group>
      {grounds.map((g) => (
        <mesh key={g.id} geometry={g.geo} position={[0, -0.02, g.zoneZ]} receiveShadow>
          <meshStandardMaterial vertexColors roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}
