'use client';

import { useJourney } from '@/app/lib/hooks/useJourneyState';
import { defaultConfig } from '@/app/config/default-config';
import { useEvents } from '@/app/lib/hooks/useSideConfig';

export function BrandHeader() {
  const { stage, eventIdx } = useJourney();
  const config = defaultConfig;
  const theme = useEvents()[eventIdx]?.theme;

  if (stage === 'loading') return null;

  return (
    <div className="fixed top-3 sm:top-5 left-0 right-0 text-center pointer-events-none z-[6] transition-opacity duration-1000">
      <div
        className="font-[family-name:var(--font-great-vibes)] text-[22px] sm:text-[clamp(30px,4.6vw,44px)] transition-colors duration-[2s]"
        style={{
          color: theme?.title ?? '#fff',
          textShadow: `0 2px 16px ${theme?.shadow ?? 'rgba(0,0,0,0.5)'}`,
        }}
      >
        {config.couple.name1} &amp; {config.couple.name2}
      </div>
      <div
        className="w-16 sm:w-[120px] h-px mx-auto my-1 sm:my-[6px] transition-all duration-[2s]"
        style={{
          background: `linear-gradient(90deg, transparent, ${theme?.accent ?? '#c9a04e'}, transparent)`,
        }}
      />
      <div
        className="text-[9px] sm:text-[11px] tracking-[0.25em] sm:tracking-[0.34em] uppercase transition-colors duration-[2s]"
        style={{
          color: theme?.body ?? '#f5efe6',
          textShadow: `0 1px 8px ${theme?.shadow ?? 'rgba(0,0,0,0.5)'}`,
        }}
      >
        {config.couple.date} · {config.couple.location}
      </div>
    </div>
  );
}
