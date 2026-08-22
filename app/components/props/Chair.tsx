import { boxGeo, cylinderGeo, sphereGeo, stdMat } from '@/app/lib/three-cache';

/**
 * Chair — banquet seating.
 *
 * Geometry and materials come from the shared cache: every chair in the scene
 * uses the same default colours, so all of them collapse onto one set of
 * objects and batch into a handful of draw calls.
 */

interface ChairProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  color?: string;
  accentColor?: string;
}

export function Chair({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  color = '#fdf8f2',
  accentColor = '#c9a04e',
}: ChairProps) {
  const frame = stdMat({ color, roughness: 0.6 });

  return (
    <group position={position} rotation={rotation}>
      {/* Seat */}
      <mesh position={[0, 0.55, 0]} geometry={boxGeo(0.7, 0.1, 0.7)} material={frame} />
      {/* Back */}
      <mesh position={[0, 1.0, -0.3]} geometry={boxGeo(0.7, 0.8, 0.1)} material={frame} />
      {/* Legs */}
      {[[-0.28, -0.28], [0.28, -0.28], [-0.28, 0.28], [0.28, 0.28]].map(([x, z], i) => (
        <mesh
          key={i}
          position={[x, 0.27, z]}
          geometry={cylinderGeo(0.04, 0.04, 0.55, 5)}
          material={frame}
        />
      ))}
      {/* Back finial */}
      <mesh
        position={[0, 1.42, -0.3]}
        geometry={sphereGeo(0.09, 6, 6)}
        material={stdMat({ color: accentColor, metalness: 0.4, roughness: 0.4 })}
      />
    </group>
  );
}
