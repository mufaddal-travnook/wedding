'use client';

import { defaultConfig } from '@/app/config/default-config';
import type { EventConfig, Side, SideConfig } from '@/app/config/types';
import { useJourney } from './useJourneyState';

/** The `sides` entry for a given side, falling back to the groom's list. */
export function getSideConfig(side: Side): SideConfig {
  return defaultConfig.sides[side] ?? defaultConfig.sides.groom;
}

export function getSideEvents(side: Side): EventConfig[] {
  return getSideConfig(side).events;
}

/** Every side listed in config, in display order. */
export function listSides(): SideConfig[] {
  return Object.values(defaultConfig.sides);
}

/** The active side's config, driven by the guest's pick in the name modal. */
export function useSideConfig(): SideConfig {
  return getSideConfig(useJourney().side);
}

/** The active side's event list — the journey the guest actually travels. */
export function useEvents(): EventConfig[] {
  return useSideConfig().events;
}
