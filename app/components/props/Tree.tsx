interface TreeProps {
  position?: [number, number, number];
  scale?: number;
  leafColor?: string;
  trunkColor?: string;
}

export function Tree({
  position = [0, 0, 0],
  scale: s = 1,
  leafColor = '#5f9463',
  trunkColor = '#8a6d5c',
}: TreeProps) {
  return (
    <group position={position}>
      {/* Trunk */}
      <mesh position={[0, 0.7 * s, 0]} castShadow>
        <cylinderGeometry args={[0.24 * s, 0.34 * s, 1.4 * s, 6]} />
        <meshStandardMaterial color={trunkColor} roughness={0.9} />
      </mesh>
      {/* Lower canopy */}
      <mesh position={[0, 2.6 * s, 0]} castShadow>
        <coneGeometry args={[1.5 * s, 2.6 * s, 7]} />
        <meshStandardMaterial color={leafColor} roughness={0.75} />
      </mesh>
      {/* Upper canopy */}
      <mesh position={[0, 3.7 * s, 0]} castShadow>
        <coneGeometry args={[1.1 * s, 2.0 * s, 7]} />
        <meshStandardMaterial color={leafColor} roughness={0.75} />
      </mesh>
    </group>
  );
}
