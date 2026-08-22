'use client';

import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  AdditiveBlending,
  BufferGeometry,
  Color,
  DoubleSide,
  Float32BufferAttribute,
  InstancedMesh,
  MeshStandardMaterial,
  Object3D,
  PlaneGeometry,
  Points,
  PointsMaterial,
  SphereGeometry,
} from 'three';
import { rand } from '@/app/lib/seeded-random';
import { useDisposable } from '@/app/lib/use-disposable';

/**
 * Atmosphere — drifting motes, falling petals and stars.
 *
 * All motion here runs on the GPU.
 *
 * The previous version rebuilt every instance matrix on the CPU each frame:
 * for each particle it set position/scale/rotation, called `updateMatrix()`
 * (a full TRS compose, with trig for the Euler path), wrote 16 floats, then
 * re-uploaded the whole instance buffer. Across the particle systems that was
 * tens of thousands of matrix composes a second on the main thread, blocking
 * input, to animate what is ultimately a sine wave.
 *
 * Instead the instance matrices are written ONCE — they hold each particle's
 * home position and its animation parameters — and a small patch to the
 * vertex shader displaces the vertices per frame. The per-frame CPU cost
 * drops from O(N) to O(1): a single uniform write. Nothing is re-uploaded.
 *
 * Placement is seeded rather than `Math.random()`, so the sky is identical on
 * server and client and does not reshuffle on re-render.
 */

/* ------------------------------------------------------------------ *
 * Shader plumbing
 * ------------------------------------------------------------------ */

interface TimeUniform {
  value: number;
}

/**
 * Patch a material's vertex shader with a time-driven displacement.
 *
 * Each particle's animation parameters travel in unused corners of its
 * instance matrix, which every instanced draw already supplies — no extra
 * attribute buffers, no extra uploads.
 *
 * `onBeforeCompile` runs once per material; the returned uniform is what the
 * render loop pokes each frame.
 */
function patchMaterial(
  mat: MeshStandardMaterial,
  body: string,
  constants: Record<string, number> = {},
): TimeUniform {
  const uTime: TimeUniform = { value: 0 };
  const names = Object.keys(constants);
  const declarations = ['uniform float uTime;', ...names.map((n) => `uniform float ${n};`)].join('\n');

  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uTime;
    for (const n of names) shader.uniforms[n] = { value: constants[n] };

    shader.vertexShader =
      `${declarations}\n` +
      shader.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>\n${body}`);
  };
  // Three caches compiled programs per material. Without a distinct key a
  // patched material can be handed an unpatched program compiled earlier for
  // the same parameters, and the animation silently stops.
  const constantKey = names.map((n) => `${n}=${constants[n]}`).join(',');
  mat.customProgramCacheKey = () => `${body}|${constantKey}`;

  return uTime;
}

/* ------------------------------------------------------------------ *
 * TWINKLING STARS (Reception)
 * ------------------------------------------------------------------ */

export function StarField({
  count = 400,
  radius = 130,
  zoneZ = 0,
}: {
  count?: number;
  radius?: number;
  zoneZ?: number;
}) {
  const pointsRef = useRef<Points>(null);

  /**
   * Stars never move, so the geometry is built once and simply left alone.
   * Only the material opacity breathes, which is a single scalar per frame.
   */
  const geo = useDisposable(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = rand(i, 1) * Math.PI * 2;
      const phi = rand(i, 2) * Math.PI * 0.4;
      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.cos(phi) + 15;
      pos[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta) + zoneZ;
    }
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(pos, 3));
    return g;
  }, [count, radius, zoneZ]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const mat = pointsRef.current.material as PointsMaterial;
    mat.opacity = 0.65 + Math.sin(state.clock.elapsedTime * 0.8) * 0.2;
  });

  return (
    <points ref={pointsRef} geometry={geo}>
      <pointsMaterial
        color="#ffffff"
        size={0.9}
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

/* ------------------------------------------------------------------ *
 * FLOATING PARTICLES
 * ------------------------------------------------------------------ */

/**
 * Drift and pulse, entirely in the vertex shader.
 *
 * `instanceMatrix[3].xyz` is the particle's home position, which doubles as
 * its phase source — using position means neighbouring motes never pulse in
 * lockstep, and it costs no extra data.
 */
const FLOAT_VERTEX = /* glsl */ `
  float ph = instanceMatrix[3][0] * 0.7 + instanceMatrix[3][2] * 1.3;
  float sp = uSpeed * (0.6 + fract(ph * 0.13) * 0.8);

  // Pulse: scale the vertex about the instance origin before drifting.
  transformed *= 0.8 + sin(uTime * 2.0 + ph) * 0.2;

  // Drift.
  transformed.y += sin(uTime * sp + ph) * 1.5;
  transformed.x += sin(uTime * sp * 0.7 + ph * 1.5) * uDrift * 3.0;
  transformed.z += cos(uTime * sp * 0.5 + ph) * uDrift * 2.0;
`;

function FloatingParticles({
  zoneZ,
  count = 50,
  color = '#ffd9a0',
  color2,
  size = 0.1,
  speed = 0.4,
  heightRange = [2, 18] as [number, number],
  drift = 0.3,
  glow = false,
}: {
  zoneZ: number;
  count?: number;
  color?: string;
  color2?: string;
  size?: number;
  speed?: number;
  heightRange?: [number, number];
  drift?: number;
  glow?: boolean;
}) {
  const meshRef = useRef<InstancedMesh>(null);
  const [lo, hi] = heightRange;

  const geo = useDisposable(() => new SphereGeometry(1, 5, 5), []);

  const { mat, timeRef } = useDisposableParticleMaterial(
    () => {
      const m = new MeshStandardMaterial({
        color,
        emissive: new Color(color),
        emissiveIntensity: glow ? 0.8 : 0.2,
        transparent: true,
        opacity: 0.7,
        depthWrite: false,
        vertexColors: true,
      });
      // Speed and drift are per-system constants, so they ride as uniforms
      // rather than being baked into every instance.
      const u = patchMaterial(m, FLOAT_VERTEX, { uSpeed: speed, uDrift: drift });
      return { mat: m, uTime: u };
    },
    [color, glow, speed, drift],
  );

  /** Home positions and per-particle tint, written once. */
  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const dummy = new Object3D();
    const c1 = new Color(color);
    const c2 = new Color(color2 || color).offsetHSL(0.05, 0, 0.1);

    for (let i = 0; i < count; i++) {
      dummy.position.set(
        (rand(i, 1) - 0.5) * 80,
        lo + rand(i, 2) * (hi - lo),
        (rand(i, 3) - 0.5) * 60 + zoneZ,
      );
      dummy.scale.setScalar((0.5 + rand(i, 4)) * size);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      mesh.setColorAt(i, rand(i, 5) > 0.5 ? c1 : c2);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [count, size, zoneZ, lo, hi, color, color2]);

  // The entire per-frame cost of this system: one scalar.
  useFrame((state) => {
    timeRef.current.value = state.clock.elapsedTime;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[geo, mat, count]}
      frustumCulled={false}
    />
  );
}

/* ------------------------------------------------------------------ *
 * FALLING PETALS
 * ------------------------------------------------------------------ */

/**
 * Fall, sway and tumble in the vertex shader.
 *
 * The fall wraps with `mod` over an 18-unit column, matching the CPU version's
 * `(t * fallSpeed) % 18`. Tumbling is a rotation built inline from the phase,
 * so each petal spins about its own centre rather than orbiting.
 */
const PETAL_VERTEX = /* glsl */ `
  float ph = instanceMatrix[3][0] * 0.9 + instanceMatrix[3][2] * 1.7;
  float fall = 0.3 + fract(ph * 0.31) * 0.5;
  float sway = 1.0 + fract(ph * 0.17) * 3.0;
  float rot  = 1.0 + fract(ph * 0.23) * 2.0;

  // Tumble about the petal's own centre.
  float ca = cos(uTime * rot * 0.5);
  float sa = sin(uTime * rot * 0.5);
  transformed.xz = mat2(ca, -sa, sa, ca) * transformed.xz;
  float cb = cos(sin(uTime * rot + ph) * 0.8);
  float sb = sin(sin(uTime * rot + ph) * 0.8);
  transformed.yz = mat2(cb, -sb, sb, cb) * transformed.yz;

  // Fall, wrapping through an 18-unit column, plus lateral sway.
  transformed.y -= mod(uTime * fall, 18.0);
  transformed.x += sin(uTime * 0.5 + ph) * sway;
  transformed.z += cos(uTime * 0.4 + ph * 1.3) * sway * 0.5;
`;

function FallingPetals({
  zoneZ,
  count = 35,
  color = '#f5a0b0',
  color2 = '#fdf0f0',
  spread = 35,
}: {
  zoneZ: number;
  count?: number;
  color?: string;
  color2?: string;
  spread?: number;
}) {
  const meshRef = useRef<InstancedMesh>(null);

  const geo = useDisposable(() => new PlaneGeometry(1, 1), []);

  const { mat, timeRef } = useDisposableParticleMaterial(
    () => {
      const m = new MeshStandardMaterial({
        color,
        emissive: new Color(color),
        emissiveIntensity: 0.15,
        transparent: true,
        opacity: 0.65,
        side: DoubleSide,
        depthWrite: false,
        vertexColors: true,
      });
      return { mat: m, uTime: patchMaterial(m, PETAL_VERTEX) };
    },
    [color],
  );

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const dummy = new Object3D();
    const c1 = new Color(color);
    const c2 = new Color(color2);

    for (let i = 0; i < count; i++) {
      const scale = 0.06 + rand(i, 4) * 0.08;
      dummy.position.set(
        (rand(i, 1) - 0.5) * spread * 2,
        // Start high: the shader subtracts a wrapping fall from here.
        3 + rand(i, 2) * 15 + 18,
        (rand(i, 3) - 0.5) * spread + zoneZ,
      );
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(scale, scale * 0.5, scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      mesh.setColorAt(i, rand(i, 5) > 0.4 ? c1 : c2);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [count, spread, zoneZ, color, color2]);

  useFrame((state) => {
    timeRef.current.value = state.clock.elapsedTime;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[geo, mat, count]}
      frustumCulled={false}
    />
  );
}

/* ------------------------------------------------------------------ *
 * Shared helper
 * ------------------------------------------------------------------ */

/**
 * Build a patched particle material and dispose it when it is replaced or the
 * component unmounts. These materials are per-system (each carries its own
 * time uniform), so they are NOT shared through `three-cache`.
 */
function useDisposableParticleMaterial(
  factory: () => { mat: MeshStandardMaterial; uTime: TimeUniform },
  deps: React.DependencyList,
) {
  // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/use-memo
  const built = useMemo(factory, deps);
  const matRef = useRef(built.mat);

  /**
   * The time uniform is handed back through a ref rather than directly.
   *
   * `useFrame` writes to it every frame, and a value returned straight out of
   * `useMemo` is treated as immutable — mutating it is exactly the kind of
   * render-output mutation the React compiler rejects. A ref is the sanctioned
   * escape hatch for mutable per-frame state.
   */
  const timeRef = useRef(built.uTime);

  useLayoutEffect(() => {
    if (matRef.current !== built.mat) {
      matRef.current.dispose();
      matRef.current = built.mat;
    }
    timeRef.current = built.uTime;
  }, [built.mat, built.uTime]);

  useLayoutEffect(
    () => () => {
      matRef.current.dispose();
    },
    [],
  );

  return { mat: built.mat, timeRef };
}

/* ------------------------------------------------------------------ *
 * MAIN
 * ------------------------------------------------------------------ */

export function SkyAtmosphere({ eventId, zoneZ }: { eventId: string; zoneZ: number }) {
  switch (eventId) {
    case 'entrance':
      return (
        <group>
          <FloatingParticles zoneZ={zoneZ} count={18} color="#ffd9a0" color2="#ffb870" size={0.07} speed={0.25} heightRange={[4, 18]} drift={0.4} glow />
          <FallingPetals zoneZ={zoneZ} count={12} color="#f5a0b0" color2="#fddde6" spread={25} />
        </group>
      );
    case 'nikah':
      return (
        <group>
          <FallingPetals zoneZ={zoneZ} count={15} color="#fff8f0" color2="#f5ead6" spread={25} />
          <FloatingParticles zoneZ={zoneZ} count={12} color="#fff5d0" color2="#ffe8b0" size={0.05} speed={0.15} heightRange={[6, 22]} drift={0.25} glow />
        </group>
      );
    case 'mehendi':
      return (
        <group>
          <FloatingParticles zoneZ={zoneZ} count={15} color="#f5c040" color2="#f5a623" size={0.06} speed={0.3} heightRange={[3, 14]} drift={0.4} glow />
          <FallingPetals zoneZ={zoneZ} count={10} color="#f5a623" color2="#f5d000" spread={20} />
        </group>
      );
    case 'reception':
      return (
        <group>
          <StarField count={300} radius={140} zoneZ={zoneZ} />
          <FloatingParticles zoneZ={zoneZ} count={15} color="#aabbff" color2="#dde4ff" size={0.05} speed={0.15} heightRange={[5, 20]} drift={0.2} glow />
        </group>
      );
    default:
      return null;
  }
}
