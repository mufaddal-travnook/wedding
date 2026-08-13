'use client';

import { useJourney, useJourneyDispatch } from '@/app/lib/hooks/useJourneyState';
import { defaultConfig } from '@/app/config/default-config';

export function EventPanel() {
  const journey = useJourney();
  const dispatch = useJourneyDispatch();
  const config = defaultConfig;
  const event = config.events[journey.eventIdx];
  const theme = event?.theme;

  if (journey.stage !== 'event' || !event) return null;

  const guestName = journey.guestName;
  const fillTemplate = (s: string) => s.replace(/\{\{name\}\}/g, guestName);

  const handleNext = () => {
    if (journey.eventIdx < config.events.length - 1) {
      const driveTo = (window as any).__weddingDriveTo;
      if (driveTo) driveTo(journey.eventIdx + 1);
    } else {
      // Replay
      const driveTo = (window as any).__weddingDriveTo;
      if (driveTo) driveTo(0);
    }
  };

  const handlePrev = () => {
    if (journey.eventIdx > 0) {
      const driveTo = (window as any).__weddingDriveTo;
      if (driveTo) driveTo(journey.eventIdx - 1);
    }
  };

  return (
    <div
      aria-live="polite"
      role="region"
      aria-label="Event information"
      className="fixed z-[9] left-[6vw] top-1/2 -translate-y-1/2 max-w-[440px] w-[min(440px,86vw)] animate-fadeIn max-sm:left-0 max-sm:right-0 max-sm:top-auto max-sm:bottom-0 max-sm:translate-y-0 max-sm:max-w-none max-sm:w-full max-sm:px-6 max-sm:py-5"
      style={{
        background: 'max-sm:linear-gradient(180deg, transparent, rgba(0,0,0,0.5) 46%)',
      }}
    >
      {/* Greeting */}
      {event.greet && (
        <div
          className="font-[family-name:var(--font-great-vibes)] text-[clamp(24px,3.4vw,32px)] transition-colors duration-[1.5s]"
          style={{ color: theme.accent, textShadow: `0 2px 14px ${theme.shadow}` }}
        >
          {fillTemplate(event.greet)}
        </div>
      )}

      {/* Eyebrow */}
      <div
        className="text-[11px] tracking-[0.42em] uppercase mt-[10px] transition-colors duration-[1.5s]"
        style={{ color: theme.eyebrow, textShadow: `0 1px 10px ${theme.shadow}` }}
      >
        {event.eyebrow}
      </div>

      {/* Title */}
      <h2
        className="font-[family-name:var(--font-marcellus)] font-normal text-[clamp(34px,5.6vw,54px)] leading-[1.08] mt-2 mb-4 transition-colors duration-[1.5s] max-sm:text-[30px]"
        style={{ color: theme.title, textShadow: `0 3px 26px ${theme.shadow}` }}
      >
        {event.title}
      </h2>

      {/* Body */}
      <div
        className="font-light text-[15px] leading-[1.75] max-w-[400px] transition-colors duration-[1.5s] max-sm:text-[14px]"
        style={{ color: theme.body, textShadow: `0 1px 12px ${theme.shadow}` }}
      >
        {fillTemplate(event.body)}
      </div>

      {/* Meta */}
      <div
        className="mt-5 text-[14px] leading-[2.05] transition-colors duration-[1.5s]"
        style={{ color: theme.body, textShadow: `0 1px 12px ${theme.shadow}` }}
      >
        {event.meta.map((m, i) => (
          <div key={i}>
            <span className="mr-[10px] transition-colors duration-[1.5s]" style={{ color: theme.accent }}>
              {m.icon}
            </span>
            {m.bold ? (
              <>
                {m.text.includes(m.bold) ? (
                  <>
                    {m.text.split(m.bold)[0]}
                    <b className="font-medium tracking-[0.03em]" style={{ color: theme.title }}>{m.bold}</b>
                    {m.text.split(m.bold)[1] ?? ''}
                  </>
                ) : (
                  <>
                    <b className="font-medium tracking-[0.03em]" style={{ color: theme.title }}>{m.bold}</b>
                    {' '}{m.text}
                  </>
                )}
              </>
            ) : (
              m.text
            )}
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div className="mt-8 flex items-center gap-[26px]">
        <button
          data-nav="prev"
          onClick={handlePrev}
          disabled={journey.eventIdx === 0}
          aria-label="Previous event"
          className="bg-none border-0 cursor-pointer text-[12px] tracking-[0.3em] uppercase py-2 px-[2px] relative transition-colors duration-300 disabled:opacity-30 disabled:cursor-default"
          style={{ color: theme.title, textShadow: `0 1px 10px ${theme.shadow}` }}
        >
          ← Previous
          <span className="absolute left-0 right-0 bottom-0 h-px origin-right scale-x-[0.35] transition-transform duration-400 hover:scale-x-100 hover:origin-left" style={{ background: theme.accent, opacity: 0.7 }} />
        </button>

        <span className="text-[11px] tracking-[0.3em] opacity-70" style={{ color: theme.body }}>
          {journey.eventIdx + 1} / {config.events.length}
        </span>

        <button
          data-nav="next"
          onClick={handleNext}
          aria-label="Next event"
          className="bg-none border-0 cursor-pointer text-[12px] tracking-[0.3em] uppercase py-2 px-[2px] relative transition-colors duration-300"
          style={{ color: theme.title, textShadow: `0 1px 10px ${theme.shadow}` }}
        >
          {journey.eventIdx === config.events.length - 1 ? 'Replay ↺' : 'Next →'}
          <span className="absolute left-0 right-0 bottom-0 h-px origin-left scale-x-[0.35] transition-transform duration-400 hover:scale-x-100" style={{ background: theme.accent, opacity: 0.7 }} />
        </button>
      </div>
    </div>
  );
}
