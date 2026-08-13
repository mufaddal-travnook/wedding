import { useMemo } from 'react';
import type { EventConfig } from '@/app/config/types';

interface RoadProps {
  events: EventConfig[];
}

export function Road({ events }: RoadProps) {
  const lastZ = events[events.length - 1].zoneZ;
  const roadLength = -lastZ + 70;
  const roadCenter = (lastZ - 20) / 2;

  const dashes = useMemo(() => {
    const d: number[] = [];
    for (let z = 8; z > lastZ - 14; z -= 4) {
      d.push(z);
    }
    return d;
  }, [lastZ]);

  return (
    <group>
      {/* Gravel shoulders — wider, darker, sunk slightly */}
      <mesh position={[0, -0.02, roadCenter]} receiveShadow>
        <boxGeometry args={[8.0, 0.08, roadLength]} />
        <meshStandardMaterial color="#9a8a72" roughness={1} />
      </mesh>

      {/* Main road surface — slightly raised above shoulders */}
      <mesh position={[0, 0.04, roadCenter]} receiveShadow>
        <boxGeometry args={[6.0, 0.12, roadLength]} />
        <meshStandardMaterial color="#baa888" roughness={0.95} />
      </mesh>

      {/* Dark road edges — thin strips */}
      {[-3.1, 3.1].map((x) => (
        <mesh key={x} position={[x, 0.05, roadCenter]}>
          <boxGeometry args={[0.25, 0.1, roadLength]} />
          <meshStandardMaterial color="#8a7a62" roughness={1} />
        </mesh>
      ))}

      {/* Center dashes */}
      {dashes.map((z, i) => (
        <mesh key={i} position={[0, 0.12, z]}>
          <boxGeometry args={[0.2, 0.02, 1.5]} />
          <meshStandardMaterial color="#f0e8d8" roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}
