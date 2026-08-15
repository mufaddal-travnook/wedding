import { getZone, isZoneKind } from './zone-registry';
import type { JourneyConfig, JourneySide, JourneyStop } from './journey-types';
import type { EventConfig } from './types';

/**
 * Turns the authored journey config into the fully-resolved event list the
 * rest of the app consumes.
 *
 * Two things happen here:
 *  - Visual presets are filled in from the stop's `zone`, unless the stop
 *    overrides them. Authors write copy; the registry supplies the look.
 *  - Road positions are derived from `spacing` and the stop's index, so a
 *    side can have any number of stops without hand-maintained coordinates.
 *
 * A resolved stop is still an `EventConfig`, so every existing component —
 * ZoneLoader, CameraController, SceneLights, the overlay — keeps working
 * unchanged.
 */

/** A resolved stop keeps its zone kind so the loader knows what to render. */
export interface ResolvedEvent extends EventConfig {
  /** Which scene to build. Distinct from `id`, which is the stop's identity. */
  zone: string;
}

function resolveStop(stop: JourneyStop, index: number, spacing: number): ResolvedEvent {
  if (!isZoneKind(stop.zone)) {
    throw new Error(
      `Journey stop "${stop.id}" names unknown zone "${stop.zone}". ` +
        `Add it to the zone registry, or use an existing kind.`,
    );
  }
  const zone = getZone(stop.zone);

  return {
    id: stop.id,
    zone: stop.zone,

    label: stop.label,
    eyebrow: stop.eyebrow,
    title: stop.title,
    greet: stop.greet,
    body: stop.body,
    caption: stop.caption,
    meta: stop.meta,

    // Zone defaults, overridable per stop.
    sky: stop.sky ?? zone.sky,
    lighting: stop.lighting ?? zone.lighting,
    camera: stop.camera ?? zone.camera,
    theme: stop.theme ?? zone.theme,

    // Stops march down the road at a fixed interval unless pinned.
    zoneZ: stop.zoneZ ?? -index * spacing,

    enableExplore: stop.enableExplore,
    exploreBounds: stop.exploreBounds,
    interactions: stop.interactions,
  };
}

export function resolveSide(side: JourneySide, spacing: number): ResolvedEvent[] {
  return side.stops.map((stop, i) => resolveStop(stop, i, spacing));
}

/**
 * Resolve every side up front. Called once at module load, so a bad zone
 * name fails immediately and loudly rather than at render time.
 */
export function resolveJourney(config: JourneyConfig): Record<string, ResolvedEvent[]> {
  const out: Record<string, ResolvedEvent[]> = {};
  for (const [sideId, side] of Object.entries(config.sides)) {
    const ids = new Set<string>();
    for (const stop of side.stops) {
      if (ids.has(stop.id)) {
        throw new Error(`Side "${sideId}" has duplicate stop id "${stop.id}".`);
      }
      ids.add(stop.id);
    }
    out[sideId] = resolveSide(side, config.spacing);
  }
  return out;
}
