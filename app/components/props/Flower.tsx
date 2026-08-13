interface FlowerProps {
  position?: [number, number, number];
  color?: string;
  scale?: number;
}

export function Flower({ position = [0, 0, 0], color = '#f05a8e', scale: s = 1 }: FlowerProps) {
  return (
    <group position={position} rotation={[0, Math.random() * Math.PI * 2, 0]}>
      {[0, 1, 2, 3, 4].map((i) => {
        const a = (i / 5) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 0.13 * s, 0, Math.sin(a) * 0.13 * s]} scale={[1, 0.5, 1]}>
            <sphereGeometry args={[0.11 * s, 6, 6]} />
            <meshStandardMaterial color={color} roughness={0.6} />
          </mesh>
        );
      })}
      <mesh position={[0, 0.03 * s, 0]}>
        <sphereGeometry args={[0.08 * s, 6, 6]} />
        <meshStandardMaterial color="#ffe27a" emissive="#996b00" emissiveIntensity={0.25} />
      </mesh>
    </group>
  );
}
