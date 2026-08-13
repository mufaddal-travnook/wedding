'use client';

import { useJourney } from '@/app/lib/hooks/useJourneyState';
import { defaultConfig } from '@/app/config/default-config';

export function DriveCaption() {
  const { stage, previousEventIdx, eventIdx, guestName } = useJourney();
  const config = defaultConfig;

  if (stage !== 'driving') return null;

  const prevEvent = config.events[previousEventIdx];
  const caption = prevEvent?.caption;
  if (!caption) return null;

  const text = caption.replace(/\{\{name\}\}/g, guestName);

  return (
    <div className="fixed bottom-[9vh] left-0 right-0 text-center z-[8] pointer-events-none animate-fadeIn">
      <span
        className="font-[family-name:var(--font-great-vibes)] text-[clamp(22px,3vw,30px)]"
        style={{
          color: config.events[eventIdx]?.theme.title ?? '#fff',
          textShadow: `0 2px 16px ${config.events[eventIdx]?.theme.shadow ?? 'rgba(0,0,0,0.5)'}`,
        }}
      >
        {text}
      </span>
    </div>
  );
}
