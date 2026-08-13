import { useMemo } from 'react';
import { PlaneGeometry, DoubleSide } from 'three';

interface DrapeProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  width?: number;
  height?: number;
  color?: string;
  opacity?: number;
}

export function Drape({
  position = [0, 3, 0],
  rotation = [0, 0, 0],
  width = 2.6,
  height = 4.3,
  color = '#fffdf8',
  opacity = 0.45,
}: DrapeProps) {
  const geo = useMemo(() => {
    const g = new PlaneGeometry(width, height, 8, 8);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      // Gentle fabric wave
      pos.setZ(i, Math.sin(x * 2.2) * 0.09 * ((height / 2 - y) / height + 0.2));
    }
    pos.needsUpdate = true;
    g.computeVertexNormals();
    return g;
  }, [width, height]);

  return (
    <mesh position={position} rotation={rotation} geometry={geo} castShadow>
      <meshStandardMaterial
        color={color}
        roughness={0.7}
        side={DoubleSide}
        transparent={opacity < 1}
        opacity={opacity}
      />
    </mesh>
  );
}
