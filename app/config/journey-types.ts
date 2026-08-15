import type { ZoneKind } from './zone-registry';
import type {
  CameraPreset,
  ExploreBounds,
  LightingPreset,
  MetaLine,
  SkyGradient,
  ThemeColors,
  ZoneInteraction,
} from './types';

/**
 * The journey config — which zones a side visits, in what order, and what
 * each one says.
 *
 * This is the file you edit to build a wedding. It never names a React
 * component or a preset object: it names a `zone` from the registry and
 * supplies copy. Everything visual is resolved for you.
 */

export interface JourneyStop {
  /**
   * Unique within a side's journey. This is the stop's identity — used for
   * React keys, deep links and analytics — NOT a lookup into the 3D world.
   * Two stops may reuse one zone: `nikah-day` and `nikah-night` are distinct
   * stops that both render the `nikah` scene.
   */
  id: string;

  /** Which 3D scene to build. Must exist in the zone registry. */
  zone: ZoneKind;

  // ---- Copy ----
  /** Short name for the nav bar / progress dots. */
  label: string;
  eyebrow: string;
  title: string;
  /** Supports {{name}}. */
  greet: string;
  /** Supports {{name}}. */
  body: string;
  /** Caption shown while driving to the NEXT stop. Supports {{name}}. */
  caption: string;
  meta: MetaLine[];

  // ---- Optional visual overrides ----
  /**
   * Each defaults to the zone's own preset. Set one only when this stop
   * should differ — e.g. the same venue at a different hour.
   */
  sky?: SkyGradient;
  lighting?: LightingPreset;
  camera?: CameraPreset;
  theme?: ThemeColors;

  // ---- Optional behaviour ----
  enableExplore?: boolean;
  exploreBounds?: ExploreBounds;
  interactions?: ZoneInteraction[];
  /**
   * Override the automatic road position. Leave unset — spacing is derived
   * so the road stays consistent however many stops a side has.
   */
  zoneZ?: number;
}

export interface JourneySide {
  /** Full label, e.g. "Groom's Side". */
  label: string;
  /** Button label, e.g. "Groom". */
  shortLabel: string;
  icon: string;
  blurb: string;
  host: string;
  accent: string;
  /** The stops this side travels, in order. */
  stops: JourneyStop[];
}

export interface JourneyConfig {
  /** Distance along the road between consecutive stops. */
  spacing: number;
  /** Each side's journey, keyed by side id. */
  sides: Record<string, JourneySide>;
}
