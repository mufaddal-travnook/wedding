'use client';

import { useJourney } from '@/app/lib/hooks/useJourneyState';
import { defaultConfig } from '@/app/config/default-config';

export function BrandHeader() {
  const { stage, eventIdx } = useJourney();
  const config = defaultConfig;
  const theme = config.events[eventIdx]?.theme;

  if (stage === 'loading') return null;

  return (
    <div className="fixed top-5 left-0 right-0 text-center pointer-events-none z-[6] transition-opacity duration-1000">
      <div
        className="font-[family-name:var(--font-great-vibes)] text-[clamp(30px,4.6vw,44px)] transition-colors duration-[2s]"
        style={{
          color: theme?.title ?? '#fff',
          textShadow: `0 2px 20px ${theme?.shadow ?? 'rgba(0,0,0,0.5)'}`,
        }}
      >
        {config.couple.name1} &amp; {config.couple.name2}
      </div>
      <div
        className="w-[120px] h-px mx-auto my-[6px] transition-all duration-[2s]"
        style={{
          background: `linear-gradient(90deg, transparent, ${theme?.accent ?? '#c9a04e'}, transparent)`,
        }}
      />
      <div
        className="text-[11px] tracking-[0.34em] uppercase transition-colors duration-[2s]"
        style={{
          color: theme?.body ?? '#f5efe6',
          textShadow: `0 1px 10px ${theme?.shadow ?? 'rgba(0,0,0,0.5)'}`,
        }}
      >
        {config.couple.date} · {config.couple.location}
      </div>
    </div>
  );
}
