import { useMemo } from 'react';
import { AdditiveBlending } from 'three';

interface StringLightsProps {
  from: [number, number, number];
  to: [number, number, number];
  sag?: number;
  count?: number;
  color?: string;
  bulbSize?: number;
}

export function StringLights({
  from, to, sag = 1, count = 13, color = '#ffd98c', bulbSize = 0.09,
}: StringLightsProps) {
  const bulbs = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i <= count; i++) {
      const t = i / count;
      pts.push([
        from[0] + (to[0] - from[0]) * t,
        from[1] + (to[1] - from[1]) * t - Math.sin(t * Math.PI) * sag,
        from[2] + (to[2] - from[2]) * t,
      ]);
    }
    return pts;
  }, [from, to, sag, count]);

  return (
    <group>
      {bulbs.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[bulbSize, 6, 6]} />
          <meshBasicMaterial color={color} transparent opacity={0.9} />
        </mesh>
      ))}
    </group>
  );
}
