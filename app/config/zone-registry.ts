import type { ComponentType } from 'react';
import { Entrance } from '../components/zones/Entrance';
import { Nikah } from '../components/zones/Nikah';
import { Mehendi } from '../components/zones/Mehendi';
import { Reception } from '../components/zones/Reception';
import { LIGHTING } from './lighting-presets';
import { CAMERA_VIEWS } from './camera-presets';
import { THEMES, SKIES } from './theme-presets';
import type {
  CameraPreset,
  LightingPreset,
  SkyGradient,
  ThemeColors,
} from './types';

/**
 * The catalogue of 3D scenes the world knows how to build.
 *
 * This is the ONLY place a zone kind is wired to its scene and its default
 * look. An event in the journey config names a `zone` from here; everything
 * else about it — its text, its order, where it sits on the road — is the
 * event's own business.
 *
 * Adding a new kind of venue means adding one entry here plus its component.
 * Adding another *event* that reuses an existing venue means touching only
 * the journey config.
 */

/** Props every zone scene receives. */
export interface ZoneProps {
  zoneZ: number;
}

export interface ZoneDefinition {
  /** Human-readable name, for config authoring and error messages. */
  label: string;
  /** The 3D scene. */
  component: ComponentType<ZoneProps>;
  /** Defaults an event inherits unless it overrides them. */
  sky: SkyGradient;
  lighting: LightingPreset;
  camera: CameraPreset;
  theme: ThemeColors;
  /**
   * Which atmosphere variant SkyAtmosphere should render. Separate from the
   * zone key so several venues can share one atmosphere treatment.
   */
  atmosphere: 'entrance' | 'nikah' | 'mehendi' | 'reception';
}

export const ZONES = {
  entrance: {
    label: 'Entrance',
    component: Entrance,
    sky: SKIES.entrance,
    lighting: LIGHTING.entrance,
    camera: CAMERA_VIEWS.entrance,
    theme: THEMES.entrance,
    atmosphere: 'entrance',
  },
  nikah: {
    label: 'Nikah',
    component: Nikah,
    sky: SKIES.nikah,
    lighting: LIGHTING.nikah,
    camera: CAMERA_VIEWS.nikah,
    theme: THEMES.nikah,
    atmosphere: 'nikah',
  },
  mehendi: {
    label: 'Mehendi',
    component: Mehendi,
    sky: SKIES.mehendi,
    lighting: LIGHTING.mehendi,
    camera: CAMERA_VIEWS.mehendi,
    theme: THEMES.mehendi,
    atmosphere: 'mehendi',
  },
  test: {
    label: 'Mehendi',
    component: Mehendi,
    sky: SKIES.mehendi,
    lighting: LIGHTING.mehendi,
    camera: CAMERA_VIEWS.mehendi,
    theme: THEMES.mehendi,
    atmosphere: 'mehendi',
  },
  reception: {
    label: 'Reception',
    component: Reception,
    sky: SKIES.reception,
    lighting: LIGHTING.reception,
    camera: CAMERA_VIEWS.reception,
    theme: THEMES.reception,
    atmosphere: 'reception',
  },
} satisfies Record<string, ZoneDefinition>;

/** Every zone kind the world can build. */
export type ZoneKind = keyof typeof ZONES;

export const ZONE_KINDS = Object.keys(ZONES) as ZoneKind[];

export function getZone(kind: ZoneKind): ZoneDefinition {
  return ZONES[kind];
}

/** True if `kind` names a zone this build knows how to render. */
export function isZoneKind(kind: string): kind is ZoneKind {
  return kind in ZONES;
}
