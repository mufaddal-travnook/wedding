/**
 * LightPole — a slim mast topped with warm bulbs.
 *
 * Dots the background with points of light so the distance still reads as a
 * venue after dark.
 *
 * `lit` adds a real pointLight. Keep it on only a handful at a time: every
 * dynamic light is compiled into every lit material's shader, so lighting a
 * whole field of poles blows past the renderer's light budget. Unlit poles
 * still glow via their emissive bulbs, which costs nothing.
 */

interface LightPoleProps {
  position: [number, number, number];
  height?: number;
  lit?: boolean;
}

export function LightPole({ position, height = 5, lit = false }: LightPoleProps) {
  return (
    <group position={position}>
      <mesh position={[0, height / 2, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.09, height, 5]} />
        <meshStandardMaterial color="#4a4038" roughness={0.8} />
      </mesh>

      {/* Bulb cluster at the top */}
      {[0, 1, 2].map((i) => (
        <mesh
          key={i}
          position={[
            Math.cos(i * 2.1) * 0.22,
            height - 0.15 - i * 0.12,
            Math.sin(i * 2.1) * 0.22,
          ]}
        >
          <sphereGeometry args={[0.11, 6, 6]} />
          <meshStandardMaterial color="#fff0d0" emissive="#ffcc88" emissiveIntensity={1.8} />
        </mesh>
      ))}

      {lit && (
        <pointLight
          position={[0, height - 0.3, 0]}
          color="#ffddaa"
          intensity={2}
          distance={14}
          decay={2}
        />
      )}
    </group>
  );
}
