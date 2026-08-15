import { getZone, isZoneKind } from '@/app/config/zone-registry';
import type { ResolvedEvent } from '@/app/config/resolve-journey';

interface ZoneLoaderProps {
  events: ResolvedEvent[];
  currentIdx: number;
}

/**
 * Builds the 3D scene for the current stop and its immediate neighbours.
 *
 * Scenes are looked up by `zone`, not by `id`, so several stops can reuse one
 * venue — two Mehendi nights render the same scene with different copy.
 */
export function ZoneLoader({ events, currentIdx }: ZoneLoaderProps) {
  return (
    <>
      {events.map((event, i) => {
        // Only render the current zone + adjacent ones, for performance.
        if (Math.abs(i - currentIdx) > 1) return null;
        if (!isZoneKind(event.zone)) return null;

        const Zone = getZone(event.zone).component;
        // Keyed by stop id, not zone: two stops sharing a venue must stay
        // separate instances, or React would reuse one and skip the second.
        return <Zone key={event.id} zoneZ={event.zoneZ} />;
      })}
    </>
  );
}
