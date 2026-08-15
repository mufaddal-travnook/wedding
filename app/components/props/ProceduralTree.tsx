'use client';

import { useMemo } from 'react';
import { BufferAttribute, BufferGeometry, Vector3 } from 'three';

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
const DEG2RAD = Math.PI / 180;
const TAU = Math.PI * 2;
const UP = new Vector3(0, 1, 0);
const _axis = new Vector3();

let _ring = new Float32Array(0);

interface Ring {
  pos: Vector3;
  tangent: Vector3;
  normal: Vector3;
  binormal: Vector3;
  radius: number;
}

interface Tube {
  rings: Ring[];
  radial: number;
}

interface TreeParams {
  seed: number;
  levels: number;
  children: number[];
  branchAngle: number[];
  angleVariance: number;
  lengthRatio: number;
  trunkLength: number;
  trunkRadius: number;
  taper: number;
  taperCurve: number;
  rootFlare: number;
  flareFrac: number;
  radiusExponent: number;
  minRadius: number;
  minLength: number;
  droop: number;
  upPull: number;
  gnarl: number[];
  radialSegments: number;
  sectionLength: number;
  childStart: number;
  trunkClear: number;
}

const DEFAULTS: TreeParams = {
  seed: 1,
  levels: 4,
  children: [3, 12, 8],
  branchAngle: [38, 50, 58],
  angleVariance: 14,
  lengthRatio: 0.62,
  trunkLength: 9,
  trunkRadius: 0.42,
  taper: 0.55,
  taperCurve: 0.7,
  rootFlare: 0.6,
  flareFrac: 0.18,
  radiusExponent: 2.3,
  minRadius: 0.05,
  minLength: 0.6,
  droop: 0.05,
  upPull: 0.3,
  gnarl: [0.05, 0.16, 0.26, 0.32],
  radialSegments: 6,
  sectionLength: 1.3,
  childStart: 0.12,
  trunkClear: 0.25,
};

function createRandom(seed: number) {
  let s = (seed >>> 0) || 1;
  return function () {
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function perpendicular(v: Vector3) {
  const a = Math.abs(v.x) < 0.9 ? _axis.set(1, 0, 0) : _axis.set(0, 1, 0);
  return new Vector3().crossVectors(v, a).normalize();
}

function transport(t0: Vector3, t1: Vector3, n: Vector3) {
  _axis.crossVectors(t0, t1);
  const sin = _axis.length();
  if (sin < 1e-6) return;
  _axis.divideScalar(sin);
  n.applyAxisAngle(_axis, Math.atan2(sin, t0.dot(t1)));
}

function ringAt(rings: Ring[], t: number) {
  const f = Math.max(0, Math.min(0.999, t)) * (rings.length - 1);
  const i = Math.floor(f);
  const frac = f - i;
  const a = rings[i];
  const b = rings[Math.min(i + 1, rings.length - 1)];
  return {
    pos: a.pos.clone().lerp(b.pos, frac),
    tangent: a.tangent.clone().lerp(b.tangent, frac).normalize(),
    normal: a.normal.clone().lerp(b.normal, frac).normalize(),
    radius: a.radius + (b.radius - a.radius) * frac,
  };
}

function growBranch(
  tubes: Tube[], base: Vector3, dir: Vector3,
  length: number, baseRadius: number, level: number,
  p: TreeParams, random: () => number,
) {
  const sections = Math.max(3, Math.min(24, Math.round(length / p.sectionLength)));
  const radial = Math.max(3, p.radialSegments - level);
  const step = length / sections;
  const gnarl = p.gnarl[Math.min(level, p.gnarl.length - 1)];
  const start = level === 0 ? p.trunkClear : p.childStart;

  let tangent = dir.clone().normalize();
  const normal = perpendicular(tangent);
  const rings: Ring[] = [];
  const pos = base.clone();

  for (let s = 0; s <= sections; s++) {
    const t = s / sections;
    let radius = baseRadius * ((1 - p.taper) + p.taper * Math.pow(1 - t, p.taperCurve));
    if (level === 0 && p.rootFlare > 0) {
      const flare = Math.max(0, (p.flareFrac - t) / p.flareFrac);
      radius *= 1 + p.rootFlare * flare * flare * flare;
    }
    rings.push({
      pos: pos.clone(),
      tangent: tangent.clone(),
      normal: normal.clone(),
      binormal: new Vector3().crossVectors(tangent, normal),
      radius,
    });
    if (s < sections) {
      const next = tangent.clone();
      next.x += (random() * 2 - 1) * gnarl;
      next.y += (random() * 2 - 1) * gnarl;
      next.z += (random() * 2 - 1) * gnarl;
      if (level > 0) next.y -= p.droop * step;
      next.normalize();
      transport(tangent, next, normal);
      pos.addScaledVector(next, step);
      tangent = next;
    }
  }

  tubes.push({ rings, radial });

  if (level >= p.levels - 1 || length < p.minLength) return;

  const n = p.children[Math.min(level, p.children.length - 1)];
  const angle = p.branchAngle[Math.min(level, p.branchAngle.length - 1)];
  const pipeDrop = Math.pow(1 / n, 1 / p.radiusExponent);

  for (let i = 0; i < n; i++) {
    const ct = start + (i + 0.5 + (random() - 0.5) * 0.6) / n * (1 - start);
    const ring = ringAt(rings, ct);
    const tilt = (angle + (random() * 2 - 1) * p.angleVariance) * DEG2RAD;
    const roll = i * GOLDEN_ANGLE + (random() * 2 - 1) * 0.4;
    const childDir = ring.tangent.clone()
      .applyAxisAngle(ring.normal, tilt)
      .applyAxisAngle(ring.tangent, roll);
    if (p.upPull > 0) childDir.lerp(UP, p.upPull).normalize();
    const childBase = Math.max(p.minRadius, Math.min(baseRadius * pipeDrop, ring.radius));
    growBranch(tubes, ring.pos, childDir, length * p.lengthRatio, childBase, level + 1, p, random);
  }
}

function copyVertex(
  positions: Float32Array, normals: Float32Array,
  offset: number, ring: Float32Array, i: number,
) {
  const o = offset * 3;
  positions[o] = ring[i]; positions[o + 1] = ring[i + 1]; positions[o + 2] = ring[i + 2];
  normals[o] = ring[i + 3]; normals[o + 1] = ring[i + 4]; normals[o + 2] = ring[i + 5];
  return offset + 1;
}

function emitTube(
  positions: Float32Array, normals: Float32Array,
  offset: number, rings: Ring[], radial: number,
) {
  const stride = (radial + 1) * 6;
  const needed = rings.length * stride;
  if (_ring.length < needed) _ring = new Float32Array(needed);
  const ringBuf = _ring;

  for (let r = 0; r < rings.length; r++) {
    const { pos, normal, binormal, radius } = rings[r];
    let o = r * stride;
    for (let j = 0; j <= radial; j++) {
      const a = j / radial * TAU;
      const c = Math.cos(a);
      const s = Math.sin(a);
      const nx = c * normal.x + s * binormal.x;
      const ny = c * normal.y + s * binormal.y;
      const nz = c * normal.z + s * binormal.z;
      ringBuf[o++] = pos.x + nx * radius;
      ringBuf[o++] = pos.y + ny * radius;
      ringBuf[o++] = pos.z + nz * radius;
      ringBuf[o++] = nx;
      ringBuf[o++] = ny;
      ringBuf[o++] = nz;
    }
  }

  for (let r = 0; r < rings.length - 1; r++) {
    const a = r * stride;
    const b = (r + 1) * stride;
    for (let j = 0; j < radial; j++) {
      const aL = a + j * 6, aR = a + (j + 1) * 6;
      const bL = b + j * 6, bR = b + (j + 1) * 6;
      offset = copyVertex(positions, normals, offset, ringBuf, aL);
      offset = copyVertex(positions, normals, offset, ringBuf, bR);
      offset = copyVertex(positions, normals, offset, ringBuf, bL);
      offset = copyVertex(positions, normals, offset, ringBuf, aL);
      offset = copyVertex(positions, normals, offset, ringBuf, aR);
      offset = copyVertex(positions, normals, offset, ringBuf, bR);
    }
  }
  return offset;
}

function buildTreeGeometry(overrides: Partial<TreeParams> = {}): BufferGeometry {
  const p = { ...DEFAULTS, ...overrides };
  const random = createRandom(p.seed);
  const tubes: Tube[] = [];
  growBranch(tubes, new Vector3(), UP, p.trunkLength, p.trunkRadius, 0, p, random);

  let vertexCount = 0;
  for (const tube of tubes) vertexCount += (tube.rings.length - 1) * tube.radial * 6;

  const positions = new Float32Array(vertexCount * 3);
  const normals = new Float32Array(vertexCount * 3);
  let offset = 0;
  for (const tube of tubes) offset = emitTube(positions, normals, offset, tube.rings, tube.radial);

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new BufferAttribute(normals, 3));
  geometry.computeBoundingSphere();
  return geometry;
}

// ─── React component ───

interface ProceduralTreeProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  seed?: number;
  trunkColor?: string;
  leafColor?: string;
  levels?: number;
  trunkLength?: number;
  trunkRadius?: number;
  children_?: number[];
}

export function ProceduralTree({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale: s = 1,
  seed = 1,
  trunkColor = '#5a3d2b',
  leafColor = '#5f9463',
  levels = 3,
  trunkLength = 5,
  trunkRadius = 0.25,
  children_ = [3, 8, 6],
}: ProceduralTreeProps) {
  const geo = useMemo(
    () => buildTreeGeometry({
      seed,
      levels,
      trunkLength,
      trunkRadius,
      children: children_,
      radialSegments: 5,
      sectionLength: 1.0,
    }),
    [seed, levels, trunkLength, trunkRadius, children_],
  );

  return (
    <group position={position} rotation={rotation} scale={s}>
      <mesh geometry={geo} castShadow>
        <meshStandardMaterial color={trunkColor} roughness={0.92} />
      </mesh>
      {/* Foliage canopy — sphere clusters at branch tips approximated by a few large spheres */}
      <mesh position={[0, trunkLength * 0.75, 0]} castShadow>
        <sphereGeometry args={[trunkLength * 0.38, 8, 8]} />
        <meshStandardMaterial color={leafColor} roughness={0.75} />
      </mesh>
      <mesh position={[trunkLength * 0.15, trunkLength * 0.6, trunkLength * 0.1]} castShadow>
        <sphereGeometry args={[trunkLength * 0.28, 7, 7]} />
        <meshStandardMaterial color={leafColor} roughness={0.75} />
      </mesh>
      <mesh position={[-trunkLength * 0.12, trunkLength * 0.85, -trunkLength * 0.08]} castShadow>
        <sphereGeometry args={[trunkLength * 0.24, 7, 7]} />
        <meshStandardMaterial color={leafColor} roughness={0.75} />
      </mesh>
    </group>
  );
}
