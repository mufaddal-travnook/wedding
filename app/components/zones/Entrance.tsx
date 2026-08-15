import { useMemo } from 'react';
import { CanvasTexture } from 'three';
import { Palm, Palm2,  Flower, FlowerBed, Lantern, Fountain, Tree, Greeter } from '../props';
import { ProceduralTree } from '../props/ProceduralTree';
import GatePost from '../props/GatePost';

interface EntranceProps {
  zoneZ: number;
}

export function Entrance({ zoneZ }: EntranceProps) {
  const signTexture = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const cv = document.createElement('canvas');
    cv.width = 1024; cv.height = 200;
    const cx = cv.getContext('2d')!;
    cx.fillStyle = '#fdf8f2'; cx.fillRect(0, 0, 1024, 200);
    cx.strokeStyle = '#c9a04e'; cx.lineWidth = 6; cx.strokeRect(14, 14, 996, 172);
    cx.fillStyle = '#8a6a2a'; cx.font = '64px serif';
    cx.textAlign = 'center'; cx.textBaseline = 'middle';
    cx.fillText('WELCOME  TO  OUR  WORLD', 512, 104);
    return new CanvasTexture(cv);
  }, []);

  return (
    <group position={[0, 0, zoneZ]}>

      {/* ===== GRAND GATE ===== */}
      <group position={[0, 0, 6.5]}>
        <GatePost x={-4.4} />
        <GatePost x={4.4} />

        {/* Arch beam */}
        <mesh position={[0, 7.1, 0]} castShadow>
          <boxGeometry args={[9.9, 0.85, 0.5]} />
          <meshStandardMaterial color="#fdf8f2" roughness={0.6} />
        </mesh>

        {/* Sign */}
        {signTexture && (
          <>
            <mesh position={[0, 5.75, 0.28]}>
              <planeGeometry args={[8.6, 1.7]} />
              <meshStandardMaterial map={signTexture} roughness={0.7} />
            </mesh>
            <mesh position={[0, 5.75, -0.28]} rotation={[0, Math.PI, 0]}>
              <planeGeometry args={[8.6, 1.7]} />
              <meshStandardMaterial map={signTexture} roughness={0.7} />
            </mesh>
          </>
        )}

        {/* Gate top decorative arches */}
        <mesh position={[0, 7.8, 0]}>
          <boxGeometry args={[6, 0.12, 0.4]} />
          <meshStandardMaterial color="#c9a04e" metalness={0.4} roughness={0.4} />
        </mesh>
      </group>

      {/* ===== FLANKING PLANTERS ===== */}
      {[-7, 7].map((x) => (
        <group key={`planter${x}`} position={[x, 0, 6.5]}>
          {/* <mesh position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.9, 0.7, 1, 8]} />
            <meshStandardMaterial color="#b35a3c" roughness={0.8} />
          </mesh>
          <mesh position={[0, 1.5, 0]}>
            <sphereGeometry args={[1, 8, 8]} />
            <meshStandardMaterial color="#5f9463" roughness={0.7} />
          </mesh> */}
          <FlowerBed position={[0, 1.9, 0]} count={6} spreadX={0.7} spreadZ={0.7} colors={['#f05a8e', '#fdf8f2']} />
        </group>
      ))}

      {/* ===== TREES & PALMS ===== */}
      {/* left side */}
      {/* <Tree position={[-6, 0, 9]} scale={2} /> */}
<Palm2 position={[-6, 0, 4]} scale={2.5} />
<Tree position={[-6, 0, -1]} scale={2} />
<Palm2 position={[-6, 0, -6]} scale={2.6} />
<Tree position={[-6, 0, -11]} scale={2} />
<Palm2 position={[-6, 0, -16]} scale={2.6} />
<Tree position={[-6, 0, -21]} scale={2} />
<Palm2 position={[-6, 0, -26]} scale={2.6} />
<Tree position={[-6, 0, -31]} scale={2} />
<Palm2 position={[-6, 0, -36]} scale={2.6} />
<Tree position={[-6, 0, -41]} scale={2} />
<Palm2 position={[-6, 0, -46]} scale={2.6} />
<Tree position={[-6, 0, -51]} scale={2} />
<Palm2 position={[-6, 0, -56]} scale={2.6} />
<Tree position={[-6, 0, -61]} scale={2} />

{/* right side */}
{/* <Tree position={[6, 0, 9]} scale={2} /> */}
<Palm2 position={[6, 0, 4]} scale={2.6} />
<Tree position={[6, 0, -1]} scale={2} />
<Palm2 position={[6, 0, -6]} scale={2.6} />
<Tree position={[6, 0, -11]} scale={2} />
<Palm2 position={[6, 0, -16]} scale={2.6} />
<Tree position={[6, 0, -21]} scale={2} />
<Palm2 position={[6, 0, -26]} scale={2.6} />
<Tree position={[6, 0, -31]} scale={2} />
<Palm2 position={[6, 0, -36]} scale={2.6} />
<Tree position={[6, 0, -41]} scale={2} />
<Palm2 position={[6, 0, -46]} scale={2.6} />
<Tree position={[6, 0, -51]} scale={2} />
<Palm2 position={[6, 0, -56]} scale={2.6} />
<Tree position={[6, 0, -61]} scale={2} />
      



      {/* <Palm position={[6, 0, 3]} scale={1.2} />
      <Palm position={[6, 0, -1]} scale={1.6} />
      <Palm position={[-13, 0, -6]} scale={0.9} />
      <Palm position={[13, 0, -8]} scale={1.0} /> */}
      {/* <ProceduralTree position={[-9, 0, 12]} scale={0.7} seed={1} trunkLength={6} trunkRadius={0.3} levels={3} leafColor="#5f9463" />
      <ProceduralTree position={[9, 0, 13]} scale={0.65} seed={7} trunkLength={5.5} trunkRadius={0.28} levels={3} leafColor="#6fae3a" />
      <ProceduralTree position={[-16, 0, 7]} scale={0.6} seed={13} trunkLength={5} trunkRadius={0.25} levels={3} leafColor="#5f9463" />
      <ProceduralTree position={[15, 0, -4]} scale={0.55} seed={21} trunkLength={4.5} trunkRadius={0.22} levels={3} leafColor="#4f8a40" /> */}

      {/* ===== FLOWER BED — single curated cluster ===== */}
      <FlowerBed position={[0, 0, 11]} count={16} spreadX={10} spreadZ={2} colors={['#f05a8e', '#f5a623', '#fdf8f2']} />
      {/* <FlowerBed position={[2, 0, 11]} count={16} spreadX={10} spreadZ={2} colors={['#f05a8e', '#f5a623', '#fdf8f2']} /> */}

      {/* ===== FLOATING LANTERNS — fewer, intentional ===== */}
      {/* <Lantern position={[-8, 6, 4]} color="#ffd9a0" size={0.3} />
      <Lantern position={[8, 7, 2]} color="#ffd9a0" size={0.25} />
      <Lantern position={[-4, 8, -3]} color="#ffd9a0" size={0.28} />
      <Lantern position={[5, 5.5, 8]} color="#ffd9a0" size={0.22} />
      <Lantern position={[0, 9, 0]} color="#ffd9a0" size={0.35} /> */}

      {/* ===== FOUNTAIN ===== */}
      <Fountain position={[5.5, 0, 10]} color="#88ccff" height={7.5} />
      <Fountain position={[-5.5, 0, 10]} color="#88ccff" height={7.5} />

      {/* ===== GREETER — welcomes the guest at the gate stage ===== */}
      <Greeter />

      {/* ===== WELCOME CARPET =====
          Stacked in strictly non-overlapping y bands, all above the road
          surface (top at y=0.10). The old version had the red slab spanning
          0.06–0.10 and the gold border 0.05–0.07 — they intersected each
          other and met the road exactly, which is what made it flicker. */}
      {/* Gold border: 0.11 – 0.14 */}
      <mesh position={[0, 0.125, 3]} receiveShadow>
        <boxGeometry args={[3.8, 0.03, 8.2]} />
        <meshStandardMaterial color="#c9a04e" roughness={0.6} metalness={0.2} />
      </mesh>
      {/* Red runner sits on top of the border: 0.14 – 0.18 */}
      <mesh position={[0, 0.16, 3]} receiveShadow>
        <boxGeometry args={[3.5, 0.04, 8]} />
        <meshStandardMaterial color="#b3122e" roughness={0.85} />
      </mesh>
    </group>
  );
}
