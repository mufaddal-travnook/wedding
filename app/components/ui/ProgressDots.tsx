'use client';

import { useJourney } from '@/app/lib/hooks/useJourneyState';
import { useEvents } from '@/app/lib/hooks/useSideConfig';

export function ProgressDots() {
  const { stage, eventIdx } = useJourney();
  const events = useEvents();
  const theme = events[eventIdx]?.theme;

  if (stage === 'loading' || stage === 'gate' || stage === 'naming') return null;

  return (
    <div className="fixed top-3 left-3 sm:top-[26px] sm:left-[22px] z-[6] flex gap-2 sm:gap-[10px] items-center transition-opacity duration-1000">
      {events.map((event, i) => (
        <div
          key={event.id}
          className="w-[7px] h-[7px] rounded-full transition-all duration-600"
          style={{
            background: i === eventIdx
              ? (theme?.accent ?? '#e8b86d')
              : i < eventIdx
                ? 'rgba(255,255,255,0.75)'
                : 'rgba(255,255,255,0.32)',
            transform: i === eventIdx ? 'scale(1.5)' : 'scale(1)',
            boxShadow: i === eventIdx ? `0 0 12px ${theme?.accent ?? '#e8b86d'}` : '0 0 8px rgba(0,0,0,0.3)',
          }}
          title={event.label}
        />
      ))}
    </div>
  );
}
