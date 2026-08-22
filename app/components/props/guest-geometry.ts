import {
  BoxGeometry,
  BufferGeometry,
  ConeGeometry,
  CylinderGeometry,
  Euler,
  Float32BufferAttribute,
  Matrix4,
  Quaternion,
  SphereGeometry,
  TorusGeometry,
  Vector3,
} from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { GuestVariant } from './guest-variants';

/**
 * Guest bodies, baked once into merged geometries.
 *
 * A guest used to be ~60 separate meshes, each with its own inline geometry
 * and material. At 61 background guests that was 3,660 draw calls and 3,660
 * GPU allocations — around 60% of the entire scene.
 *
 * A standing guest is rigid: no part moves relative to any other unless the
 * guest is animated. So the whole body can be merged into ONE geometry at
 * module scope and drawn with InstancedMesh, giving one draw call per
 * (variant, material-group) rather than one per body part per guest.
 *
 * Colour is the wrinkle. Merging forces a single material, so per-guest
 * cloth/accent/skin colour can no longer come from separate materials. It is
 * baked into a vertex-colour attribute instead, and the shared material runs
 * with `vertexColors: true`. Guests that need a *custom* colourway (the
 * Greeter's ivory gown) get their own cached merged geometry, keyed on the
 * colour triple — there are only a handful of distinct colourways in play, so
 * the cache stays tiny.
 *
 * Animated guests are handled separately: see `guest-parts.ts` for the
 * articulated build used by the near-camera path.
 */

export const VARIANT_DEFAULTS: Record<GuestVariant, { cloth: string; accent: string }> = {
  sherwani: { cloth: '#f3e9d6', accent: '#c9a04e' },
  thobe: { cloth: '#fbfaf6', accent: '#8c1d2f' },
  hijabi: { cloth: '#7c3f58', accent: '#c9a04e' },
  suit: { cloth: '#2b3a55', accent: '#7a1f2b' },
};

export const DEFAULT_SKIN = '#d9a679';

export interface Colorway {
  cloth: string;
  accent: string;
  skin: string;
}

/** One primitive of a guest body, positioned in the guest's local space. */
interface Part {
  geo: BufferGeometry;
  pos: [number, number, number];
  rot?: [number, number, number];
  scale?: [number, number, number];
  /** Which colour slot this part draws from. */
  tint: keyof Colorway | string;
}

/* ---------------------------------------------------------------- *
 * Primitive builders.
 *
 * These allocate freely: every geometry they produce is consumed by
 * `mergeGeometries` and disposed immediately after, so nothing here
 * outlives the bake.
 * ---------------------------------------------------------------- */

const box = (w: number, h: number, d: number) => new BoxGeometry(w, h, d);
const sph = (r: number, ws = 8, hs = 8) => new SphereGeometry(r, ws, hs);
const cyl = (rt: number, rb: number, h: number, rs = 6) =>
  new CylinderGeometry(rt, rb, h, rs);
const con = (r: number, h: number, rs = 8) => new ConeGeometry(r, h, rs);
const tor = (r: number, tube: number, rs = 8, ts = 16) =>
  new TorusGeometry(r, tube, rs, ts);

/**
 * The arm pair, as static geometry in the rest pose.
 *
 * The articulated version pivots these at the shoulder; for a background
 * guest the rest pose is all that is ever seen.
 */
function armParts(sleeve: string): Part[] {
  const parts: Part[] = [];
  for (const side of [-1, 1] as const) {
    // Shoulder pivot at (side*0.24, 0.98, 0), rotated by side*0.12 about Z.
    // Bake that transform into each arm part's local placement.
    const tilt = side * 0.12;
    const sin = Math.sin(tilt);
    const cos = Math.cos(tilt);
    const place = (lx: number, ly: number): [number, number, number] => [
      side * 0.24 + (lx * cos - ly * sin),
      0.98 + (lx * sin + ly * cos),
      0,
    ];

    parts.push({
      geo: cyl(0.05, 0.045, 0.42, 6),
      pos: place(0, -0.21),
      rot: [0, 0, tilt],
      tint: sleeve,
    });
    parts.push({
      geo: sph(0.055, 6, 6),
      pos: place(0, -0.44),
      rot: [0, 0, tilt],
      tint: 'skin',
    });
  }
  return parts;
}

/** Build the full part list for one variant. */
function variantParts(variant: GuestVariant): Part[] {
  const parts: Part[] = [];

  // ---- Head, shared by every variant ----
  parts.push({
    geo: sph(0.16, 10, 10),
    pos: [0, 1.2, variant === 'hijabi' ? 0.02 : 0],
    tint: 'skin',
  });

  parts.push(...armParts('cloth'));

  if (variant === 'sherwani') {
    for (const x of [-0.08, 0.08]) {
      parts.push({ geo: cyl(0.06, 0.07, 0.36, 6), pos: [x, 0.18, 0], tint: '#e8ddc6' });
      parts.push({ geo: box(0.1, 0.06, 0.19), pos: [x, 0.035, 0.04], tint: 'accent' });
    }
    parts.push({ geo: cyl(0.19, 0.31, 0.78, 10), pos: [0, 0.66, 0], tint: 'cloth' });
    parts.push({
      geo: box(0.05, 0.72, 0.02),
      pos: [0, 0.68, 0.2],
      rot: [0.15, 0, 0],
      tint: 'accent',
    });
    parts.push({
      geo: tor(0.13, 0.025, 6, 12),
      pos: [0, 1.04, 0],
      rot: [Math.PI / 2, 0, 0],
      tint: 'accent',
    });
    parts.push({
      geo: box(0.1, 0.72, 0.025),
      pos: [0.03, 0.74, 0.21],
      rot: [0.15, 0, -0.5],
      tint: 'accent',
    });
    // safa (turban) + band + kalgi
    parts.push({
      geo: sph(0.19, 10, 10),
      pos: [0, 1.3, 0],
      scale: [1, 0.72, 1],
      tint: 'accent',
    });
    parts.push({
      geo: tor(0.17, 0.02, 6, 12),
      pos: [0, 1.24, 0],
      rot: [Math.PI / 2, 0, 0],
      tint: '#f6e7c5',
    });
    parts.push({
      geo: con(0.025, 0.14, 6),
      pos: [0, 1.46, 0.05],
      rot: [0.25, 0, 0],
      tint: '#f6e7c5',
    });
  }

  if (variant === 'thobe') {
    parts.push({ geo: cyl(0.18, 0.3, 1.0, 10), pos: [0, 0.55, 0], tint: 'cloth' });
    for (const x of [-0.08, 0.08]) {
      parts.push({ geo: box(0.1, 0.04, 0.18), pos: [x, 0.025, 0.06], tint: '#6b4f2f' });
    }
    parts.push({
      geo: sph(0.19, 10, 10),
      pos: [0, 1.26, -0.01],
      scale: [1, 0.8, 1],
      tint: '#ffffff',
    });
    for (const side of [-1, 1]) {
      parts.push({
        geo: box(0.14, 0.32, 0.03),
        pos: [side * 0.15, 1.06, -0.05],
        rot: [0, 0, side * -0.12],
        tint: '#ffffff',
      });
    }
    parts.push({ geo: box(0.24, 0.34, 0.03), pos: [0, 1.06, -0.15], tint: '#ffffff' });
    parts.push({
      geo: tor(0.155, 0.022, 6, 12),
      pos: [0, 1.33, 0],
      rot: [Math.PI / 2, 0, 0],
      tint: '#1a1a1a',
    });
  }

  if (variant === 'hijabi') {
    parts.push({ geo: cyl(0.17, 0.4, 1.0, 12), pos: [0, 0.55, 0], tint: 'cloth' });
    parts.push({
      geo: tor(0.385, 0.02, 6, 18),
      pos: [0, 0.06, 0],
      rot: [Math.PI / 2, 0, 0],
      tint: 'accent',
    });
    parts.push({ geo: con(0.21, 0.32, 10), pos: [0, 0.98, 0.01], tint: 'cloth' });
    parts.push({ geo: sph(0.185, 10, 10), pos: [0, 1.21, -0.025], tint: 'cloth' });
    parts.push({ geo: sph(0.022, 6, 6), pos: [0.1, 1.3, 0.11], tint: 'accent' });
  }

  if (variant === 'suit') {
    for (const x of [-0.09, 0.09]) {
      parts.push({ geo: cyl(0.07, 0.08, 0.55, 6), pos: [x, 0.3, 0], tint: 'cloth' });
      parts.push({ geo: box(0.11, 0.07, 0.2), pos: [x, 0.035, 0.05], tint: '#1a1512' });
    }
    parts.push({ geo: cyl(0.2, 0.185, 0.5, 10), pos: [0, 0.8, 0], tint: 'cloth' });
    for (const x of [-0.2, 0.2]) {
      parts.push({ geo: sph(0.07, 6, 6), pos: [x, 1.0, 0], tint: 'cloth' });
    }
    parts.push({ geo: box(0.11, 0.34, 0.02), pos: [0, 0.85, 0.185], tint: '#f5f2ec' });
    parts.push({ geo: box(0.045, 0.26, 0.015), pos: [0, 0.82, 0.2], tint: 'accent' });
    parts.push({
      geo: sph(0.165, 10, 10),
      pos: [0, 1.28, -0.02],
      scale: [1, 0.65, 1],
      tint: '#241a12',
    });
  }

  return parts;
}

/* ---------------------------------------------------------------- *
 * Baking
 * ---------------------------------------------------------------- */

const srgbToLinear = (c: number) =>
  c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

/**
 * Parse `#rrggbb` into linear-space RGB.
 *
 * Vertex colours are consumed by the shader in linear space, while the hex
 * literals in the variant tables are authored in sRGB — the same convention
 * `new Color(hex)` applies. Converting here keeps merged guests matching the
 * colours the per-material version produced.
 */
function hexToLinear(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [
    srgbToLinear(((n >> 16) & 255) / 255),
    srgbToLinear(((n >> 8) & 255) / 255),
    srgbToLinear((n & 255) / 255),
  ];
}

/** Resolve a part's tint slot against the guest's colourway. */
function resolveTint(tint: string, colors: Colorway): [number, number, number] {
  if (tint === 'cloth') return hexToLinear(colors.cloth);
  if (tint === 'accent') return hexToLinear(colors.accent);
  if (tint === 'skin') return hexToLinear(colors.skin);
  return hexToLinear(tint);
}

const _mat = new Matrix4();
const _quat = new Quaternion();
const _euler = new Euler();
const _pos = new Vector3();
const _scale = new Vector3();

/**
 * Merge one variant's parts into a single geometry with baked vertex colours.
 *
 * Every source primitive is disposed once merged — they exist only to be
 * copied into the combined buffer.
 */
function bakeGuest(variant: GuestVariant, colors: Colorway): BufferGeometry {
  const parts = variantParts(variant);
  const staged: BufferGeometry[] = [];

  for (const part of parts) {
    const g = part.geo;

    // Bake the part's local transform into its vertices.
    _pos.set(part.pos[0], part.pos[1], part.pos[2]);
    _euler.set(part.rot?.[0] ?? 0, part.rot?.[1] ?? 0, part.rot?.[2] ?? 0);
    _quat.setFromEuler(_euler);
    _scale.set(part.scale?.[0] ?? 1, part.scale?.[1] ?? 1, part.scale?.[2] ?? 1);
    _mat.compose(_pos, _quat, _scale);
    g.applyMatrix4(_mat);

    // Bake the tint into a vertex-colour attribute, so the merged body needs
    // only one material.
    const [r, gr, b] = resolveTint(part.tint, colors);
    const count = g.attributes.position.count;
    const rgb = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      rgb[i * 3] = r;
      rgb[i * 3 + 1] = gr;
      rgb[i * 3 + 2] = b;
    }
    g.setAttribute('color', new Float32BufferAttribute(rgb, 3));

    // mergeGeometries requires a matching attribute set across inputs. The
    // primitives all carry position/normal/uv, and we have just added color.
    staged.push(g);
  }

  const merged = mergeGeometries(staged, false);
  staged.forEach((g) => g.dispose());

  if (!merged) {
    throw new Error(`Failed to merge guest geometry for variant "${variant}"`);
  }
  merged.computeBoundingSphere();
  return merged;
}

/* ---------------------------------------------------------------- *
 * Cache
 * ---------------------------------------------------------------- */

const bakeCache = new Map<string, BufferGeometry>();

/**
 * The merged body geometry for a variant and colourway.
 *
 * Cached forever: there are four variants and only a handful of colourways,
 * so this settles at well under a dozen geometries for the whole scene.
 */
export function guestGeometry(
  variant: GuestVariant,
  cloth?: string,
  accent?: string,
  skin: string = DEFAULT_SKIN,
): BufferGeometry {
  const d = VARIANT_DEFAULTS[variant];
  const colors: Colorway = {
    cloth: cloth ?? d.cloth,
    accent: accent ?? d.accent,
    skin,
  };
  const key = `${variant}|${colors.cloth}|${colors.accent}|${colors.skin}`;

  let geo = bakeCache.get(key);
  if (!geo) {
    geo = bakeGuest(variant, colors);
    bakeCache.set(key, geo);
  }
  return geo;
}

/** Diagnostics: how many distinct guest bodies have been baked. */
export const bakedGuestCount = () => bakeCache.size;
