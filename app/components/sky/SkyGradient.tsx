'use client';

import { useJourney } from '@/app/lib/hooks/useJourneyState';
import { defaultConfig } from '@/app/config/default-config';

export function SkyGradient() {
  const { eventIdx, stage } = useJourney();
  // Longer transition during driving for smooth crossfade
  const duration = stage === 'driving' ? '6000ms' : '3000ms';

  return (
    <>
      {defaultConfig.events.map((event, i) => {
        const { sky } = event;
        const gradient = `linear-gradient(${sky.direction ?? 180}deg, ${sky.stops.join(', ')})`;
        return (
          <div
            key={event.id}
            className="fixed inset-0 pointer-events-none ease-in-out"
            style={{
              background: gradient,
              opacity: i === eventIdx ? 1 : 0,
              zIndex: 0,
              transition: `opacity ${duration} ease-in-out`,
            }}
          />
        );
      })}
    </>
  );
}
