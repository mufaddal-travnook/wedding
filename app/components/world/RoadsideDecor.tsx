import { useMemo } from 'react';
import { Tree } from '../props/Tree';
import { Palm } from '../props/Palm';
import { Flower } from '../props/Flower';
import { Lantern } from '../props/Lantern';
import type { EventConfig } from '@/app/config/types';

// Street lamp pole with glowing light
function StreetLamp({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Pole */}
      <mesh position={[0, 2.4, 0]}>
        <cylinderGeometry args={[0.08, 0.12, 4.8, 6]} />
        <meshStandardMaterial color="#3a3a4a" roughness={0.7} metalness={0.3} />
      </mesh>
      {/* Arm */}
      <mesh position={[0.4, 4.6, 0]} rotation={[0, 0, -0.3]}>
        <cylinderGeometry args={[0.04, 0.04, 1.0, 5]} />
        <meshStandardMaterial color="#3a3a4a" roughness={0.7} metalness={0.3} />
      </mesh>
      {/* Lamp housing */}
      <mesh position={[0.7, 4.7, 0]}>
        <cylinderGeometry args={[0.2, 0.15, 0.3, 8]} />
        <meshStandardMaterial color="#2a2a3a" roughness={0.6} metalness={0.4} />
      </mesh>
      {/* Light bulb glow */}
      <mesh position={[0.7, 4.5, 0]}>
        <sphereGeometry args={[0.18, 8, 8]} />
        <meshStandardMaterial
          color="#ffeedd"
          emissive="#ffcc88"
          emissiveIntensity={2.0}
          transparent
          opacity={0.9}
        />
      </mesh>
      {/* Light cone on ground */}
      <pointLight position={[0.7, 4.4, 0]} color="#ffddaa" intensity={3} distance={12} decay={2} />
    </group>
  );
}

interface RoadsideDecorProps {
  events: EventConfig[];
}

export function RoadsideDecor({ events }: RoadsideDecorProps) {
  const lastZ = events[events.length - 1].zoneZ;

  // Generate tree positions along the road
  const trees = useMemo(() => {
    const arr: { x: number; z: number; scale: number; type: 'tree' | 'palm'; leafColor: string }[] = [];
    const seed = 42;
    for (let z = 15; z > lastZ - 15; z -= 14 + Math.sin(z * 0.1 + seed) * 4) {
      // Left side
      arr.push({
        x: -8 - Math.abs(Math.sin(z * 0.3)) * 6,
        z,
        scale: 0.8 + Math.abs(Math.sin(z * 0.7)) * 0.6,
        type: Math.sin(z * 0.5) > 0.3 ? 'palm' : 'tree',
        leafColor: z > events[2]?.zoneZ ? '#5f9463' : z > events[3]?.zoneZ ? '#4f9440' : '#2b4d33',
      });
      // Right side (offset so not symmetric)
      if (Math.sin(z * 0.4 + 1.7) > -0.3) {
        arr.push({
          x: 8 + Math.abs(Math.cos(z * 0.3)) * 6,
          z: z + 3,
          scale: 0.7 + Math.abs(Math.cos(z * 0.5)) * 0.5,
          type: Math.cos(z * 0.6) > 0.2 ? 'palm' : 'tree',
          leafColor: z > events[2]?.zoneZ ? '#5f9463' : z > events[3]?.zoneZ ? '#4f9440' : '#2b4d33',
        });
      }
    }
    return arr;
  }, [lastZ, events]);

  // Roadside flowers (small clusters near the road edge)
  const flowers = useMemo(() => {
    const arr: { x: number; z: number; color: string; scale: number }[] = [];
    const colors = ['#f05a8e', '#f5a623', '#fdf8f2', '#e86fb0', '#ffe27a'];
    for (let z = 10; z > lastZ - 10; z -= 6 + Math.random() * 4) {
      const side = Math.sin(z * 1.3) > 0 ? -1 : 1;
      arr.push({
        x: side * (3.8 + Math.abs(Math.sin(z * 0.8)) * 2),
        z,
        color: colors[Math.abs(Math.floor(Math.sin(z * 2.1) * colors.length)) % colors.length],
        scale: 0.7 + Math.abs(Math.sin(z * 1.5)) * 0.7,
      });
    }
    return arr;
  }, [lastZ]);

  // Floating lanterns per zone
  const lanterns = useMemo(() => {
    const arr: { x: number; y: number; z: number; color: string }[] = [];
    events.forEach((event) => {
      const colors: Record<string, string> = {
        entrance: '#ffd9a0',
        nikah: '#fff0cf',
        mehendi: '#fff0a0',
        reception: '#aabbff',
      };
      const c = colors[event.id] || '#ffd9a0';
      const count = event.id === 'reception' ? 6 : 8;
      for (let i = 0; i < count; i++) {
        arr.push({
          x: (Math.sin(i * 2.7 + event.zoneZ * 0.1) * 0.5 + 0.5) * 30 - 15,
          y: 4 + Math.sin(i * 1.3) * 3 + 2,
          z: event.zoneZ + (Math.cos(i * 1.8) * 0.5 + 0.5) * 20 - 10,
          color: c,
        });
      }
    });
    return arr;
  }, [events]);

  // Street lamps for reception zone (and slightly before it)
  const streetLamps = useMemo(() => {
    const receptionZ = events[events.length - 1]?.zoneZ ?? -255;
    const arr: { x: number; z: number }[] = [];
    // Place lamps along the road approaching reception
    for (let z = receptionZ + 40; z > receptionZ - 20; z -= 12) {
      arr.push({ x: -4.5, z });
      arr.push({ x: 4.5, z });
    }
    // Also a few in the mehendi-to-reception transition
    const mehendiZ = events[2]?.zoneZ ?? -170;
    for (let z = mehendiZ - 20; z > receptionZ + 40; z -= 18) {
      arr.push({ x: -4.5, z });
      arr.push({ x: 4.5, z });
    }
    return arr;
  }, [events]);

  return (
    <group>
      {/* Trees */}
      {trees.map((t, i) =>
        t.type === 'palm' ? (
          <Palm key={`t${i}`} position={[t.x, 0, t.z]} scale={t.scale} />
        ) : (
          <Tree key={`t${i}`} position={[t.x, 0, t.z]} scale={t.scale} leafColor={t.leafColor} />
        )
      )}

      {/* Roadside flowers */}
      {flowers.map((f, i) => (
        <Flower key={`f${i}`} position={[f.x, 0.12, f.z]} color={f.color} scale={f.scale} />
      ))}

      {/* Floating lanterns */}
      {lanterns.map((l, i) => (
        <Lantern key={`l${i}`} position={[l.x, l.y, l.z]} color={l.color} size={0.25} />
      ))}

      {/* Street lamps for reception */}
      {streetLamps.map((s, i) => (
        <StreetLamp key={`sl${i}`} position={[s.x, 0, s.z]} />
      ))}
    </group>
  );
}
