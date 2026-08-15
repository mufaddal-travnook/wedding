// import { useMemo } from "react";

// /**
//  * Palm — a fuller, more realistic low-poly palm.
//  *
//  * - Curved, tapering trunk with ring joints and a root flare
//  * - Arcing fronds built from drooping segments (upper crown + browner lower skirt)
//  * - Coconuts under the crown
//  * - Deterministic per-tree variation seeded from position (no re-render flicker)
//  *
//  * Usage:  <Palm position={[10, 0, -4]} scale={1.2} />
//  * Force identical twins with an explicit seed: <Palm seed={7} />
//  */

// interface PalmProps {
//   position?: [number, number, number];
//   scale?: number;
//   seed?: number;
// }

// // Deterministic pseudo-random
// const rand = (seed: number, salt = 0) => {
//   const s = Math.sin(seed * 12.9898 + salt * 78.233) * 43758.5453;
//   return s - Math.floor(s);
// };

// const TRUNK = "#9c7b58";
// const TRUNK_DARK = "#846449";
// const FROND = "#4f8f4a";
// const FROND_LIGHT = "#63a352";
// const FROND_DRY = "#8a7a3f";
// const COCONUT = "#6b4f2f";

// const TRUNK_SEGS = 6;

// export function Palm({ position = [0, 0, 0], scale: s = 1, seed }: PalmProps) {
//   const t = useMemo(() => {
//     const sd = seed ?? position[0] * 13.37 + position[2] * 7.77 + 3.1;

//     const leanDir = rand(sd, 0) * Math.PI * 2; // which way the trunk bends
//     const curve = 0.28 + rand(sd, 1) * 0.3; // total bend (radians)
//     const trunkH = (4.0 + rand(sd, 2) * 1.4) * s;

//     // --- Trunk: stacked segments along a curve (bend increases toward the top)
//     const segH = trunkH / TRUNK_SEGS;
//     const trunk: { pos: [number, number, number]; rot: number; r0: number; r1: number }[] = [];
//     let px = 0;
//     let py = 0;
//     for (let i = 0; i < TRUNK_SEGS; i++) {
//       const tm = curve * Math.pow((i + 0.5) / TRUNK_SEGS, 1.5);
//       const cx = px + Math.sin(tm) * segH * 0.5;
//       const cy = py + Math.cos(tm) * segH * 0.5;
//       const taper = (n: number) => (0.3 - 0.17 * (n / TRUNK_SEGS)) * s;
//       trunk.push({
//         pos: [cx, cy, 0],
//         rot: -tm,
//         r0: taper(i + 1) * 1.1, // top slightly flared -> ring ledges at joints
//         r1: taper(i),
//       });
//       px += Math.sin(tm) * segH;
//       py += Math.cos(tm) * segH;
//     }
//     const crown: [number, number, number] = [px, py, 0];
//     const crownTilt = -curve; // fronds inherit the trunk's final tilt

//     // --- Upper fronds
//     const FRONDS = 7;
//     const fronds = Array.from({ length: FRONDS }, (_, i) => ({
//       angle: (i / FRONDS) * Math.PI * 2 + rand(sd, 10 + i) * 0.5,
//       len: (2.6 + rand(sd, 20 + i) * 0.9) * s,
//       lift: 0.95 + rand(sd, 30 + i) * 0.35, // initial elevation from horizontal
//       droop: 0.5 + rand(sd, 40 + i) * 0.35, // how hard the tip bows down
//       light: rand(sd, 50 + i) > 0.5,
//     }));

//     // --- Lower skirt: shorter, browner, heavily drooped older fronds
//     const SKIRT = 4;
//     const skirt = Array.from({ length: SKIRT }, (_, i) => ({
//       angle: (i / SKIRT) * Math.PI * 2 + 0.4 + rand(sd, 60 + i) * 0.6,
//       len: (1.6 + rand(sd, 70 + i) * 0.5) * s,
//       lift: 0.15 + rand(sd, 80 + i) * 0.2,
//       droop: 0.9 + rand(sd, 90 + i) * 0.3,
//     }));

//     // --- Coconuts
//     const nuts = Array.from({ length: 3 }, (_, i) => {
//       const a = rand(sd, 100 + i) * Math.PI * 2;
//       const r = 0.24 * s;
//       return {
//         pos: [Math.cos(a) * r, -0.16 * s - rand(sd, 110 + i) * 0.08, Math.sin(a) * r] as [
//           number,
//           number,
//           number,
//         ],
//         size: (0.14 + rand(sd, 120 + i) * 0.05) * s,
//       };
//     });

//     return { leanDir, segH, trunk, crown, crownTilt, fronds, skirt, nuts };
//   }, [seed, position, s]);

//   const FROND_SEGS = 4;

//   const renderFrond = (
//     f: { angle: number; len: number; lift: number; droop: number },
//     color: string,
//     key: string,
//   ) => {
//     const segL = f.len / FROND_SEGS;
//     const pieces = [];
//     let px = 0.12 * s; // start just outside the crown center
//     let py = 0.05 * s;
//     for (let j = 0; j < FROND_SEGS; j++) {
//       const phi = f.lift - f.droop * Math.pow((j + 0.5) / FROND_SEGS, 1.6) * 2;
//       const cx = px + Math.cos(phi) * segL * 0.5;
//       const cy = py + Math.sin(phi) * segL * 0.5;
//       const width = (0.34 - 0.06 * j) * s; // taper toward the tip
//       pieces.push(
//         <mesh
//           key={j}
//           position={[cx, cy, 0]}
//           rotation={[0, 0, phi - Math.PI / 2]}
//           scale={[1, 1, 0.28]} // flatten the cone into a leaf blade
//           castShadow
//         >
//           <coneGeometry args={[width, segL * 1.15, 4]} />
//           <meshStandardMaterial color={color} roughness={0.7} side={2} />
//         </mesh>,
//       );
//       px += Math.cos(phi) * segL;
//       py += Math.sin(phi) * segL;
//     }
//     return (
//       <group key={key} rotation={[0, f.angle, 0]}>
//         {pieces}
//       </group>
//     );
//   };

//   return (
//     <group position={position}>
//       <group rotation={[0, t.leanDir, 0]}>
//         {/* Root flare */}
//         <mesh position={[0, 0.12 * s, 0]} receiveShadow>
//           <cylinderGeometry args={[0.32 * s, 0.44 * s, 0.24 * s, 7]} />
//           <meshStandardMaterial color={TRUNK_DARK} roughness={0.9} />
//         </mesh>

//         {/* Curved trunk */}
//         {t.trunk.map((seg, i) => (
//           <mesh key={i} position={seg.pos} rotation={[0, 0, seg.rot]} castShadow>
//             <cylinderGeometry args={[seg.r0, seg.r1, t.segH * 1.02, 7]} />
//             <meshStandardMaterial
//               color={i % 2 ? TRUNK : TRUNK_DARK}
//               roughness={0.88}
//             />
//           </mesh>
//         ))}

//         {/* Crown */}
//         <group position={t.crown} rotation={[0, 0, t.crownTilt]}>
//           {/* crown core hides frond roots */}
//           <mesh>
//             <sphereGeometry args={[0.26 * s, 8, 8]} />
//             <meshStandardMaterial color={TRUNK_DARK} roughness={0.9} />
//           </mesh>

//           {t.fronds.map((f, i) =>
//             renderFrond(f, f.light ? FROND_LIGHT : FROND, `f${i}`),
//           )}
//           {t.skirt.map((f, i) => renderFrond(f, FROND_DRY, `s${i}`))}

//           {t.nuts.map((n, i) => (
//             <mesh key={i} position={n.pos} castShadow>
//               <sphereGeometry args={[n.size, 8, 8]} />
//               <meshStandardMaterial color={COCONUT} roughness={0.85} />
//             </mesh>
//           ))}
//         </group>
//       </group>
//     </group>
//   );
// }

import { useMemo } from "react";
import * as THREE from "three";

/**
 * Palm — realistic low-poly palm with proper pinnate fronds.
 *
 * Each frond is ONE mesh: a procedurally built BufferGeometry with a thin
 * rachis (center rib) and dozens of individual leaflets fanning off both
 * sides, drooping toward the tip — the way real palm leaves grow. Vertex
 * colors fade from a darker base to sunlit tips.
 *
 * Still deterministic per position (or explicit `seed`), so trees vary
 * but never flicker between renders.
 *
 * Usage:  <Palm position={[10, 0, -4]} scale={1.2} />
 */

interface PalmProps {
  position?: [number, number, number];
  scale?: number;
  seed?: number;
}

const rand = (seed: number, salt = 0) => {
  const s = Math.sin(seed * 12.9898 + salt * 78.233) * 43758.5453;
  return s - Math.floor(s);
};

const TRUNK = "#9c7b58";
const TRUNK_DARK = "#846449";
const COCONUT = "#6b4f2f";

const TRUNK_SEGS = 6;

interface FrondOpts {
  len: number;
  lift: number;   // initial elevation from horizontal (radians)
  droop: number;  // how hard the tip bows down
  leaflets: number;
  baseColor: THREE.Color;
  tipColor: THREE.Color;
  sd: number;     // seed
  salt: number;
}

/** Builds a single frond: rachis strip + leaflet triangles, vertex-colored. */
function makeFrondGeometry(o: FrondOpts): THREE.BufferGeometry {
  const pos: number[] = [];
  const col: number[] = [];
  const tmp = new THREE.Color();

  const pushVert = (p: THREE.Vector3, c: THREE.Color) => {
    pos.push(p.x, p.y, p.z);
    col.push(c.r, c.g, c.b);
  };
  const pushTri = (
    a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3,
    ca: THREE.Color, cb: THREE.Color, cc: THREE.Color,
  ) => {
    pushVert(a, ca); pushVert(b, cb); pushVert(c, cc);
  };

  // --- Spine: drooping arc in the local X-Y plane (x = outward, y = up)
  const M = o.leaflets;
  const segL = o.len / M;
  const pts: THREE.Vector3[] = [];
  let px = 0.1, py = 0.05;
  pts.push(new THREE.Vector3(px, py, 0));
  for (let j = 0; j < M; j++) {
    const phi = o.lift - o.droop * Math.pow((j + 0.5) / M, 1.6) * 2;
    px += Math.cos(phi) * segL;
    py += Math.sin(phi) * segL;
    pts.push(new THREE.Vector3(px, py, 0));
  }
  const tangents = pts.map((_, j) => {
    const a = pts[Math.max(0, j - 1)];
    const b = pts[Math.min(pts.length - 1, j + 1)];
    return b.clone().sub(a).normalize();
  });

  const rachisColor = o.baseColor.clone().multiplyScalar(0.72);

  // --- Rachis: thin strip along the spine
  const rw = 0.022 * o.len;
  for (let j = 0; j < pts.length - 1; j++) {
    const p0 = pts[j], p1 = pts[j + 1];
    const a = new THREE.Vector3(p0.x, p0.y, -rw);
    const b = new THREE.Vector3(p0.x, p0.y, rw);
    const c = new THREE.Vector3(p1.x, p1.y, -rw);
    const d = new THREE.Vector3(p1.x, p1.y, rw);
    pushTri(a, b, c, rachisColor, rachisColor, rachisColor);
    pushTri(b, d, c, rachisColor, rachisColor, rachisColor);
  }

  // --- Leaflets: pairs fanning off each side, sagging more toward the tip
  const bw = 0.032 * o.len; // leaflet base half-width along the spine
  for (let j = 1; j < pts.length; j++) {
    const t = j / (pts.length - 1);
    const P = pts[j];
    const T = tangents[j];

    // longest around mid-frond, shorter at base and tip
    const L =
      o.len * 0.21 *
      (0.4 + 0.85 * Math.sin(Math.PI * Math.min(t * 1.12, 1))) *
      (0.9 + rand(o.sd, o.salt + j) * 0.2);
    const spread = 0.9 + rand(o.sd, o.salt + j + 50) * 0.25; // angle off the rib
    const sag = 0.25 + t * 1.15;                              // droop grows tipward

    const cBase = tmp.clone().copy(o.baseColor).lerp(o.tipColor, t * 0.55);
    const cTip = o.baseColor.clone().lerp(o.tipColor, 0.45 + 0.55 * t);

    for (const side of [-1, 1]) {
      const dir = T.clone()
        .multiplyScalar(Math.cos(spread))
        .add(new THREE.Vector3(0, 0, side * Math.sin(spread)));
      dir.y -= sag;
      dir.normalize();
      const tip = P.clone().add(dir.multiplyScalar(L));
      const b1 = P.clone().add(T.clone().multiplyScalar(-bw));
      const b2 = P.clone().add(T.clone().multiplyScalar(bw));
      pushTri(b1, b2, tip, cBase, cBase, cTip);
    }
  }

  // --- Tip leaflet continuing off the end of the rib
  {
    const P = pts[pts.length - 1];
    const T = tangents[tangents.length - 1];
    const dir = T.clone(); dir.y -= 0.7; dir.normalize();
    const tip = P.clone().add(dir.multiplyScalar(o.len * 0.14));
    const b1 = P.clone().add(new THREE.Vector3(0, 0, -bw));
    const b2 = P.clone().add(new THREE.Vector3(0, 0, bw));
    pushTri(b1, b2, tip, o.tipColor, o.tipColor, o.tipColor);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  geo.computeVertexNormals();
  return geo;
}

 export function Palm2({ position = [0, 0, 0], scale: s = 1, seed }: PalmProps) {
  const t = useMemo(() => {
    const sd = seed ?? position[0] * 13.37 + position[2] * 7.77 + 3.1;

    const leanDir = rand(sd, 0) * Math.PI * 2;
    const curve = 0.28 + rand(sd, 1) * 0.3;
    const trunkH = (4.0 + rand(sd, 2) * 1.4) * s;

    // --- Curved trunk
    const segH = trunkH / TRUNK_SEGS;
    const trunk: { pos: [number, number, number]; rot: number; r0: number; r1: number }[] = [];
    let px = 0, py = 0;
    for (let i = 0; i < TRUNK_SEGS; i++) {
      const tm = curve * Math.pow((i + 0.5) / TRUNK_SEGS, 1.5);
      const cx = px + Math.sin(tm) * segH * 0.5;
      const cy = py + Math.cos(tm) * segH * 0.5;
      const taper = (n: number) => (0.3 - 0.17 * (n / TRUNK_SEGS)) * s;
      trunk.push({ pos: [cx, cy, 0], rot: -tm, r0: taper(i + 1) * 1.1, r1: taper(i) });
      px += Math.sin(tm) * segH;
      py += Math.cos(tm) * segH;
    }
    const crown: [number, number, number] = [px, py, 0];
    const crownTilt = -curve;

    // --- Frond geometries (one mesh each)
    const greenA = { base: new THREE.Color("#3f7a3c"), tip: new THREE.Color("#7fb75e") };
    const greenB = { base: new THREE.Color("#4c8a44"), tip: new THREE.Color("#93c771") };
    const dry = { base: new THREE.Color("#8a7a3f"), tip: new THREE.Color("#b5a15c") };

    const FRONDS = 8;
    const fronds = Array.from({ length: FRONDS }, (_, i) => {
      const c = rand(sd, 50 + i) > 0.5 ? greenA : greenB;
      return {
        angle: (i / FRONDS) * Math.PI * 2 + rand(sd, 10 + i) * 0.5,
        geo: makeFrondGeometry({
          len: (2.7 + rand(sd, 20 + i) * 0.9) * s,
          lift: 0.9 + rand(sd, 30 + i) * 0.4,
          droop: 0.5 + rand(sd, 40 + i) * 0.3,
          leaflets: 12,
          baseColor: c.base,
          tipColor: c.tip,
          sd,
          salt: 200 + i * 100,
        }),
      };
    });

    const SKIRT = 4;
    const skirt = Array.from({ length: SKIRT }, (_, i) => ({
      angle: (i / SKIRT) * Math.PI * 2 + 0.4 + rand(sd, 60 + i) * 0.6,
      geo: makeFrondGeometry({
        len: (1.7 + rand(sd, 70 + i) * 0.5) * s,
        lift: 0.15 + rand(sd, 80 + i) * 0.2,
        droop: 0.95 + rand(sd, 90 + i) * 0.3,
        leaflets: 9,
        baseColor: dry.base,
        tipColor: dry.tip,
        sd,
        salt: 700 + i * 100,
      }),
    }));

    // --- Coconuts
    const nuts = Array.from({ length: 3 }, (_, i) => {
      const a = rand(sd, 100 + i) * Math.PI * 2;
      const r = 0.24 * s;
      return {
        pos: [Math.cos(a) * r, -0.16 * s - rand(sd, 110 + i) * 0.08, Math.sin(a) * r] as [
          number, number, number,
        ],
        size: (0.14 + rand(sd, 120 + i) * 0.05) * s,
      };
    });

    return { leanDir, segH, trunk, crown, crownTilt, fronds, skirt, nuts };
  }, [seed, position, s]);

  return (
    <group position={position}>
      <group rotation={[0, t.leanDir, 0]}>
        {/* Root flare */}
        <mesh position={[0, 0.12 * s, 0]} receiveShadow>
          <cylinderGeometry args={[0.32 * s, 0.44 * s, 0.24 * s, 7]} />
          <meshStandardMaterial color={TRUNK_DARK} roughness={0.9} />
        </mesh>

        {/* Curved trunk */}
        {t.trunk.map((seg, i) => (
          <mesh key={i} position={seg.pos} rotation={[0, 0, seg.rot]} castShadow>
            <cylinderGeometry args={[seg.r0, seg.r1, t.segH * 1.02, 7]} />
            <meshStandardMaterial color={i % 2 ? TRUNK : TRUNK_DARK} roughness={0.88} />
          </mesh>
        ))}

        {/* Crown */}
        <group position={t.crown} rotation={[0, 0, t.crownTilt]}>
          <mesh>
            <sphereGeometry args={[0.26 * s, 8, 8]} />
            <meshStandardMaterial color={TRUNK_DARK} roughness={0.9} />
          </mesh>

          {t.fronds.map((f, i) => (
            <mesh key={`f${i}`} geometry={f.geo} rotation={[0, f.angle, 0]} castShadow>
              <meshStandardMaterial
                vertexColors
                roughness={0.72}
                side={THREE.DoubleSide}
              />
            </mesh>
          ))}
          {t.skirt.map((f, i) => (
            <mesh key={`s${i}`} geometry={f.geo} rotation={[0, f.angle, 0]}>
              <meshStandardMaterial
                vertexColors
                roughness={0.85}
                side={THREE.DoubleSide}
              />
            </mesh>
          ))}

          {t.nuts.map((n, i) => (
            <mesh key={i} position={n.pos} castShadow>
              <sphereGeometry args={[n.size, 8, 8]} />
              <meshStandardMaterial color={COCONUT} roughness={0.85} />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  );
}