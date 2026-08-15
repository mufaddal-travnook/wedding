'use client';

import { journey } from '@/app/config/journey';
import { resolveJourney } from '@/app/config/resolve-journey';
import type { ResolvedEvent } from '@/app/config/resolve-journey';
import type { JourneySide } from '@/app/config/journey-types';
import type { Side } from '@/app/config/types';
import { useJourney } from './useJourneyState';

/**
 * Reads the authored journey config and hands the rest of the app a resolved
 * event list per side.
 *
 * Resolution happens once at module load, so an unknown zone name or a
 * duplicate stop id throws immediately at startup rather than mid-render.
 */
const RESOLVED = resolveJourney(journey);

/** The first side in config — used when an unknown side is requested. */
const FALLBACK_SIDE = Object.keys(journey.sides)[0];

export interface SideView extends JourneySide {
  id: string;
  /** This side's stops, fully resolved with presets and road positions. */
  events: ResolvedEvent[];
}

function buildSideView(sideId: string): SideView {
  const id = journey.sides[sideId] ? sideId : FALLBACK_SIDE;
  return { id, ...journey.sides[id], events: RESOLVED[id] };
}

/** The config for a given side, falling back to the first side listed. */
export function getSideConfig(side: Side | string): SideView {
  return buildSideView(side);
}

export function getSideEvents(side: Side | string): ResolvedEvent[] {
  return getSideConfig(side).events;
}

/** Every side listed in config, in authoring order. */
export function listSides(): SideView[] {
  return Object.keys(journey.sides).map(buildSideView);
}

/** The active side's config, driven by the guest's pick in the name modal. */
export function useSideConfig(): SideView {
  return getSideConfig(useJourney().side);
}

/** The active side's event list — the journey the guest actually travels. */
export function useEvents(): ResolvedEvent[] {
  return useSideConfig().events;
}
