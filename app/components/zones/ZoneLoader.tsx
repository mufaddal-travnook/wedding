import { Entrance } from './Entrance';
import { Nikah } from './Nikah';
import { Mehendi } from './Mehendi';
import { Reception } from './Reception';
import type { EventConfig } from '@/app/config/types';

interface ZoneLoaderProps {
  events: EventConfig[];
  currentIdx: number;
}

const ZONE_COMPONENTS: Record<string, React.ComponentType<{ zoneZ: number }>> = {
  entrance: Entrance,
  nikah: Nikah,
  mehendi: Mehendi,
  reception: Reception,
};

export function ZoneLoader({ events, currentIdx }: ZoneLoaderProps) {
  return (
    <>
      {events.map((event, i) => {
        const Component = ZONE_COMPONENTS[event.id];
        if (!Component) return null;

        // Only render current zone + adjacent zones for performance
        const distance = Math.abs(i - currentIdx);
        if (distance > 1) return null;

        return <Component key={event.id} zoneZ={event.zoneZ} />;
      })}
    </>
  );
}
