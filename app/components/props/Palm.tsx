interface PalmProps {
  position?: [number, number, number];
  scale?: number;
}

export function Palm({ position = [0, 0, 0], scale: s = 1 }: PalmProps) {
  const lean = (Math.random() - 0.5) * 0.12;
  return (
    <group position={position}>
      {/* Trunk */}
      <mesh position={[0, 2.2 * s, 0]} rotation={[0, 0, lean]} castShadow>
        <cylinderGeometry args={[0.16 * s, 0.26 * s, 4.4 * s, 6]} />
        <meshStandardMaterial color="#9c7b58" roughness={0.85} />
      </mesh>
      {/* Leaves */}
      {Array.from({ length: 6 }).map((_, i) => {
        const a = (i / 6) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * 1.1 * s, 4.5 * s, Math.sin(a) * 1.1 * s]}
            rotation={[Math.sin(a) * 1.15, 0, -Math.cos(a) * 1.15]}
          >
            <coneGeometry args={[0.35 * s, 2.6 * s, 4]} />
            <meshStandardMaterial color="#4d8b4d" roughness={0.7} />
          </mesh>
        );
      })}
    </group>
  );
}
