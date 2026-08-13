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
  return (
    <group position={position} rotation={rotation}>
      {/* Seat */}
      <mesh position={[0, 0.55, 0]}>
        <boxGeometry args={[0.7, 0.1, 0.7]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* Back */}
      <mesh position={[0, 1.0, -0.3]}>
        <boxGeometry args={[0.7, 0.8, 0.1]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* Legs */}
      {[[-0.28, -0.28], [0.28, -0.28], [-0.28, 0.28], [0.28, 0.28]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.27, z]}>
          <cylinderGeometry args={[0.04, 0.04, 0.55, 5]} />
          <meshStandardMaterial color={color} roughness={0.6} />
        </mesh>
      ))}
      {/* Back finial */}
      <mesh position={[0, 1.42, -0.3]}>
        <sphereGeometry args={[0.09, 6, 6]} />
        <meshStandardMaterial color={accentColor} metalness={0.4} roughness={0.4} />
      </mesh>
    </group>
  );
}
