import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { CanvasTexture } from 'three';
import type { Group } from 'three';
import { Tree, Person, Horse, StringLights, Lantern, Fountain, Drape } from '../props';
import { Fireworks } from '../effects/Fireworks';

interface ReceptionProps {
  zoneZ: number;
}

// Dinner table with candle
function DinnerTable({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.1, 0.14, 0.8, 6]} />
        <meshStandardMaterial color="#3a2f63" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.85, 0]}>
        <cylinderGeometry args={[1.2, 1.2, 0.1, 10]} />
        <meshStandardMaterial color="#f5ead6" roughness={0.7} />
      </mesh>
      {/* Candle */}
      <mesh position={[0, 1.05, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.3, 6]} />
        <meshStandardMaterial color="#fff0cf" emissive="#ffb066" emissiveIntensity={1.6} />
      </mesh>
      {/* Candle glow */}
      <pointLight position={[0, 1.3, 0]} color="#ffcc88" intensity={0.8} distance={5} decay={2} />
    </group>
  );
}

export function Reception({ zoneZ }: ReceptionProps) {
  const bandRef = useRef<Group>(null);
  const dancersRef = useRef<Group>(null);

  // Marquee texture
  const marqueeTexture = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const cv = document.createElement('canvas');
    cv.width = 1024; cv.height = 160;
    const cx = cv.getContext('2d')!;
    cx.clearRect(0, 0, 1024, 160);
    cx.fillStyle = '#ffd27a'; cx.font = '86px cursive';
    cx.textAlign = 'center'; cx.textBaseline = 'middle';
    cx.shadowColor = '#ffb040'; cx.shadowBlur = 26;
    cx.fillText('Ayesha ♥ Rohan', 512, 84);
    return new CanvasTexture(cv);
  }, []);

  // Band animation
  useFrame((state) => {
    if (bandRef.current) {
      bandRef.current.children.forEach((p, i) => {
        const t = state.clock.elapsedTime * 7 + i * 1.3;
        p.position.y = 1.05 + Math.abs(Math.sin(t * 0.5)) * 0.06;
      });
    }
    if (dancersRef.current) {
      dancersRef.current.children.forEach((p, i) => {
        const t = state.clock.elapsedTime * 4 + i * 1.5;
        p.rotation.y = Math.sin(t * 0.7) * 0.8;
        p.position.y = 0.24 + Math.abs(Math.sin(t)) * 0.12;
      });
    }
  });

  const bandColors: [string, string][] = [
    ['#b3122e', '#f5ead6'], ['#c9a04e', '#241c4d'], ['#7a5bd6', '#f5ead6'],
    ['#b3122e', '#241c4d'], ['#c9a04e', '#3a2f63'],
  ];

  return (
    <group position={[0, 0, zoneZ]}>

      {/* ===== FIREWORKS ===== */}
      <Fireworks zoneZ={zoneZ} />

      {/* ===== MOON ===== */}
      <mesh position={[26, 30, -34]}>
        <sphereGeometry args={[2.6, 16, 16]} />
        <meshBasicMaterial color="#fff6dc" />
      </mesh>
      {/* Moon glow */}
      <pointLight position={[26, 30, -34]} color="#eeeeff" intensity={2} distance={80} decay={1.5} />

      {/* ===== GRAND STAGE ===== */}
      <group position={[14, 0, -2]} rotation={[0, -0.35, 0]}>
        {/* Platform */}
        <mesh position={[0, 0.45, 0]} castShadow>
          <boxGeometry args={[13, 0.9, 7]} />
          <meshStandardMaterial color="#3a2f63" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.95, 0]}>
          <boxGeometry args={[13.6, 0.2, 7.6]} />
          <meshStandardMaterial color="#c9a04e" metalness={0.4} roughness={0.4} />
        </mesh>
        {/* Backdrop */}
        <mesh position={[0, 4.4, -3.3]}>
          <boxGeometry args={[13, 7, 0.4]} />
          <meshStandardMaterial color="#241c4d" roughness={0.7} />
        </mesh>
        {/* Drapes on backdrop */}
        {[-5.4, -2.7, 0, 2.7, 5.4].map((x, i) => (
          <Drape
            key={`sd${i}`}
            position={[x, 4.3, -3.05]}
            width={2.2}
            height={6.4}
            color={['#7a5bd6', '#b3122e', '#c9a04e', '#b3122e', '#7a5bd6'][i]}
            opacity={0.9}
          />
        ))}
        {/* Marquee sign */}
        {marqueeTexture && (
          <mesh position={[0, 6.6, -3.05]}>
            <planeGeometry args={[9.5, 1.5]} />
            <meshBasicMaterial map={marqueeTexture} transparent />
          </mesh>
        )}
        {/* Stage lights (glow spheres instead of SpotLights for perf) */}
        {[-6, 6].map((x) => (
          <group key={`stl${x}`}>
            <mesh position={[x, 2.7, 3.2]}>
              <cylinderGeometry args={[0.12, 0.12, 5.4, 6]} />
              <meshStandardMaterial color="#1c1638" roughness={0.8} />
            </mesh>
            <mesh position={[x, 5.5, 3.2]}>
              <sphereGeometry args={[0.3, 8, 8]} />
              <meshStandardMaterial
                color={x < 0 ? '#ffb0d0' : '#9ecbff'}
                emissive={x < 0 ? '#ff6090' : '#6090ff'}
                emissiveIntensity={2}
              />
            </mesh>
            <pointLight
              position={[x, 5.5, 3.2]}
              color={x < 0 ? '#ffb0d0' : '#9ecbff'}
              intensity={3}
              distance={15}
              decay={2}
            />
          </group>
        ))}
      </group>

      {/* ===== BAND ===== */}
      <group ref={bandRef} position={[14, 0, -2]} rotation={[0, -0.35, 0]}>
        {bandColors.map(([shirt, pants], i) => (
          <Person
            key={`band${i}`}
            position={[-4.4 + i * 2.2, 1.05, 0.4 - Math.abs(i - 2) * 0.5]}
            shirtColor={shirt}
            pantsColor={pants}
            scale={1.25}
            animate
          />
        ))}
      </group>

      {/* ===== DANCE FLOOR + DANCERS ===== */}
      <mesh position={[2, 0.12, 8]}>
        <cylinderGeometry args={[5.4, 5.6, 0.24, 10]} />
        <meshStandardMaterial color="#241c4d" roughness={0.4} metalness={0.2} />
      </mesh>
      <group ref={dancersRef}>
        {([[0, 6.6, '#7ec850'], [3.4, 9, '#f05a8e'], [0.6, 10, '#e8c400'], [-2.4, 8.4, '#9ecbff']] as [number, number, string][]).map(([x, z, c], i) => (
          <Person
            key={`dancer${i}`}
            position={[x, 0.24, z]}
            shirtColor={c}
            pantsColor="#241c4d"
            animate
          />
        ))}
      </group>

      {/* ===== HORSES ===== */}
      <Horse position={[-9, 0, 10]} rotation={[0, 0.5, 0]} scale={0.95} />
      <Horse position={[-11, 0, 3]} rotation={[0, 0.9, 0]} bodyColor="#d9c9a8" scale={0.9} />

      {/* ===== DECORATED CART ===== */}
      <group position={[-12.6, 0, 11.4]} rotation={[0, 0.5, 0]}>
        <mesh position={[0, 1.25, 0]} castShadow>
          <boxGeometry args={[2.4, 0.9, 1.5]} />
          <meshStandardMaterial color="#b3122e" roughness={0.55} />
        </mesh>
        <mesh position={[0, 1.76, 0]}>
          <boxGeometry args={[2.5, 0.14, 1.6]} />
          <meshStandardMaterial color="#c9a04e" metalness={0.4} roughness={0.4} />
        </mesh>
        {/* Cart wheels */}
        {[[-0.85, 0.7], [-0.85, -0.7], [0.85, 0.7], [0.85, -0.7]].map(([x, z], i) => (
          <mesh key={`cw${i}`} position={[x, 0.5, z]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.5, 0.5, 0.14, 10]} />
            <meshStandardMaterial color="#c9a04e" metalness={0.5} roughness={0.4} />
          </mesh>
        ))}
      </group>

      {/* ===== STRING LIGHT POLES ===== */}
      {([[-6, 14], [4, 15], [12, 10], [16, 4], [-12, 7], [-4, -6], [8, -8]] as [number, number][]).map(([x, z], i) => (
        <mesh key={`pole${i}`} position={[x, 2.6, z]}>
          <cylinderGeometry args={[0.09, 0.12, 5.2, 6]} />
          <meshStandardMaterial color="#1c1638" roughness={0.8} />
        </mesh>
      ))}
      {/* String lights between poles */}
      <StringLights from={[-6, 5.2, 14]} to={[4, 5.2, 15]} sag={1} count={13} color="#ffd98c" />
      <StringLights from={[4, 5.2, 15]} to={[12, 5.2, 10]} sag={1} count={13} color="#ffd98c" />
      <StringLights from={[12, 5.2, 10]} to={[16, 5.2, 4]} sag={1} count={13} color="#ffd98c" />
      <StringLights from={[-12, 5.2, 7]} to={[-6, 5.2, 14]} sag={1.3} count={15} color="#ffd98c" />
      <StringLights from={[-4, 5.2, -6]} to={[8, 5.2, -8]} sag={1} count={13} color="#ffd98c" />
      <StringLights from={[8, 5.2, -8]} to={[16, 5.2, 4]} sag={1.3} count={15} color="#ffd98c" />

      {/* ===== DINNER TABLES ===== */}
      {([[-3, 14], [7, 13], [-8, -4], [10, -6]] as [number, number][]).map(([x, z], i) => (
        <DinnerTable key={`dt${i}`} position={[x, 0, z]} />
      ))}

      {/* ===== NIGHT TREES ===== */}
      {([[22, 10, 1.3], [-16, 12, 1.2], [-18, -3, 1], [20, -8, 1.1], [2, -12, 1]] as [number, number, number][]).map(([x, z, s], i) => (
        <Tree key={`rt${i}`} position={[x, 0, z]} scale={s} leafColor="#2b4d33" />
      ))}

      {/* ===== LANTERNS (blue-tinted for night) ===== */}
      {Array.from({ length: 8 }).map((_, i) => (
        <Lantern
          key={`rl${i}`}
          position={[
            (Math.sin(i * 2.3) * 0.5 + 0.5) * 30 - 15,
            4 + Math.sin(i * 1.5) * 3,
            (Math.cos(i * 1.7) * 0.5 + 0.5) * 20 - 10,
          ]}
          color="#aabbff"
          size={0.28}
        />
      ))}

      {/* ===== FOUNTAIN WITH COLORED LIGHT ===== */}
      <Fountain position={[-5, 0, 4]} color="#8888ff" height={3} spread={1.2} />
    </group>
  );
}
