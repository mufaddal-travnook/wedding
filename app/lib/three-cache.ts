import {
  BoxGeometry,
  BufferGeometry,
  CapsuleGeometry,
  CircleGeometry,
  ConeGeometry,
  CylinderGeometry,
  Material,
  MeshStandardMaterial,
  PlaneGeometry,
  SphereGeometry,
  TorusGeometry,
} from 'three';
import type { Side } from 'three';

/**
 * Shared geometry and material cache.
 *
 * Inline JSX like `<boxGeometry args={[1,2,1]} />` constructs a brand-new
 * object for every component instance. Thirty-five palms with nine geometries
 * each meant 315 byte-identical geometry objects, each with its own GPU
 * buffer — and, worse, 315 distinct material identities, which defeats
 * Three's batching entirely: it sorts draw calls by material, so N identical
 * materials cost N shader state changes instead of one.
 *
 * These helpers key on the construction arguments, so cost becomes
 * O(unique shapes) rather than O(instances). Everything here lives for the
 * lifetime of the page deliberately — the cache IS the point, so nothing in
 * it is disposed. For per-component resources that genuinely must be freed,
 * see `useDisposable` in `./use-disposable.ts`.
 */

const geoCache = new Map<string, BufferGeometry>();

function cachedGeo<T extends BufferGeometry>(key: string, make: () => T): T {
  let g = geoCache.get(key);
  if (!g) {
    g = make();
    geoCache.set(key, g);
  }
  return g as T;
}

/** Join numeric args into a stable cache key. */
const k = (...a: (number | undefined)[]) => a.join(',');

export const boxGeo = (w: number, h: number, d: number) =>
  cachedGeo(`box|${k(w, h, d)}`, () => new BoxGeometry(w, h, d));

export const sphereGeo = (r: number, ws = 8, hs = 8) =>
  cachedGeo(`sph|${k(r, ws, hs)}`, () => new SphereGeometry(r, ws, hs));

export const cylinderGeo = (rt: number, rb: number, h: number, rs = 8) =>
  cachedGeo(`cyl|${k(rt, rb, h, rs)}`, () => new CylinderGeometry(rt, rb, h, rs));

export const coneGeo = (r: number, h: number, rs = 8) =>
  cachedGeo(`con|${k(r, h, rs)}`, () => new ConeGeometry(r, h, rs));

export const torusGeo = (r: number, tube: number, rs = 8, ts = 16) =>
  cachedGeo(`tor|${k(r, tube, rs, ts)}`, () => new TorusGeometry(r, tube, rs, ts));

export const planeGeo = (w: number, h: number, ws = 1, hs = 1) =>
  cachedGeo(`pln|${k(w, h, ws, hs)}`, () => new PlaneGeometry(w, h, ws, hs));

export const circleGeo = (r: number, seg = 16) =>
  cachedGeo(`cir|${k(r, seg)}`, () => new CircleGeometry(r, seg));

export const capsuleGeo = (r: number, len: number, cs = 4, rs = 8) =>
  cachedGeo(`cap|${k(r, len, cs, rs)}`, () => new CapsuleGeometry(r, len, cs, rs));

/* ------------------------------------------------------------------ */

const matCache = new Map<string, MeshStandardMaterial>();

export interface StdMatOpts {
  color: string;
  roughness?: number;
  metalness?: number;
  emissive?: string;
  emissiveIntensity?: number;
  transparent?: boolean;
  opacity?: number;
  side?: Side;
  flatShading?: boolean;
  depthWrite?: boolean;
  vertexColors?: boolean;
}

/**
 * A shared MeshStandardMaterial keyed on its visual properties.
 *
 * Two props asking for the same cream at the same roughness get the *same*
 * material object, so Three can batch them into one draw call group.
 */
export function stdMat(o: StdMatOpts): MeshStandardMaterial {
  const key = [
    o.color,
    o.roughness ?? 1,
    o.metalness ?? 0,
    o.emissive ?? '',
    o.emissiveIntensity ?? 1,
    o.transparent ? 1 : 0,
    o.opacity ?? 1,
    o.side ?? 0,
    o.flatShading ? 1 : 0,
    o.depthWrite === false ? 0 : 1,
    o.vertexColors ? 1 : 0,
  ].join('|');

  let m = matCache.get(key);
  if (!m) {
    m = new MeshStandardMaterial({
      color: o.color,
      roughness: o.roughness ?? 1,
      metalness: o.metalness ?? 0,
      transparent: o.transparent ?? false,
      opacity: o.opacity ?? 1,
      flatShading: o.flatShading ?? false,
      vertexColors: o.vertexColors ?? false,
    });
    if (o.emissive) {
      m.emissive.set(o.emissive);
      m.emissiveIntensity = o.emissiveIntensity ?? 1;
    }
    if (o.side !== undefined) m.side = o.side;
    if (o.depthWrite !== undefined) m.depthWrite = o.depthWrite;
    matCache.set(key, m);
  }
  return m;
}

/** Diagnostics: how many unique objects the cache is holding. */
export const cacheStats = () => ({
  geometries: geoCache.size,
  materials: matCache.size,
});

/**
 * Free every cached resource. Only for a full teardown (hot reload, or a
 * deliberate unmount of the whole experience) — cached objects are shared, so
 * disposing one while a mesh still references it would break rendering.
 */
export function disposeCaches() {
  geoCache.forEach((g: BufferGeometry) => g.dispose());
  geoCache.clear();
  matCache.forEach((m: Material) => m.dispose());
  matCache.clear();
}
