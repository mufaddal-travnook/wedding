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

  // Gift box — collapsed state
  if (!journey.panelOpen) {
    return (
      <button
        onClick={() => dispatch({ type: 'TOGGLE_PANEL' })}
        className="fixed z-[9] left-4 bottom-4 sm:left-6 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center backdrop-blur-xl border transition-all duration-300 hover:scale-110 active:scale-95"
        style={{
          background: `${theme.accent}22`,
          borderColor: `${theme.accent}66`,
          boxShadow: `0 4px 20px ${theme.shadow}`,
        }}
        aria-label="Open event details"
        title="View event details"
      >
        <span className="text-2xl sm:text-3xl" role="img" aria-label="gift">🎁</span>
      </button>
    );
  }

  return (
    <div
      aria-live="polite"
      role="region"
      aria-label="Event information"
      className="fixed z-[9] animate-fadeIn
        left-3 right-3 bottom-3 rounded-2xl p-4
        sm:left-[4vw] sm:right-auto sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 sm:max-w-[420px] sm:w-[min(420px,88vw)] sm:rounded-2xl sm:p-6"
      style={{
        background: `rgba(0,0,0,0.45)`,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${theme.accent}33`,
        boxShadow: `0 8px 40px ${theme.shadow}`,
      }}
    >
      {/* Close button */}
      <button
        onClick={() => dispatch({ type: 'TOGGLE_PANEL' })}
        className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
        aria-label="Close panel"
      >
        ✕
      </button>

      {/* Greeting */}
      {event.greet && (
        <div
          className="font-[family-name:var(--font-great-vibes)] text-[22px] sm:text-[clamp(24px,3.4vw,30px)]"
          style={{ color: theme.accent }}
        >
          {fillTemplate(event.greet)}
        </div>
      )}

      {/* Eyebrow */}
      <div
        className="text-[10px] sm:text-[11px] tracking-[0.35em] sm:tracking-[0.42em] uppercase mt-2 font-medium"
        style={{ color: theme.eyebrow }}
      >
        {event.eyebrow}
      </div>

      {/* Title */}
      <h2
        className="font-[family-name:var(--font-marcellus)] font-normal text-[26px] sm:text-[clamp(30px,5vw,48px)] leading-[1.1] mt-1.5 mb-3"
        style={{ color: theme.title }}
      >
        {event.title}
      </h2>

      {/* Body */}
      <div
        className="font-normal text-[13px] sm:text-[14px] leading-[1.7] sm:leading-[1.75]"
        style={{ color: theme.body }}
      >
        {fillTemplate(event.body)}
      </div>

      {/* Meta */}
      <div
        className="mt-3 sm:mt-4 text-[12px] sm:text-[13px] leading-[1.9] sm:leading-[2]"
        style={{ color: theme.body }}
      >
        {event.meta.map((m, i) => (
          <div key={i}>
            <span className="mr-2" style={{ color: theme.accent }}>{m.icon}</span>
            {m.bold ? (
              m.text.includes(m.bold) ? (
                <>
                  {m.text.split(m.bold)[0]}
                  <b className="font-semibold" style={{ color: theme.title }}>{m.bold}</b>
                  {m.text.split(m.bold)[1] ?? ''}
                </>
              ) : (
                <>
                  <b className="font-semibold" style={{ color: theme.title }}>{m.bold}</b>
                  {' '}{m.text}
                </>
              )
            ) : (
              <span className="font-medium">{m.text}</span>
            )}
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div className="mt-4 sm:mt-6 flex items-center justify-between sm:justify-start sm:gap-6">
        <button
          data-nav="prev"
          onClick={handlePrev}
          disabled={journey.eventIdx === 0}
          aria-label="Previous event"
          className="border-0 cursor-pointer text-[11px] sm:text-[12px] tracking-[0.2em] sm:tracking-[0.3em] uppercase py-2 px-3 sm:px-1 rounded-lg sm:rounded-none transition-all disabled:opacity-25 disabled:cursor-default hover:bg-white/10 sm:hover:bg-transparent"
          style={{ color: theme.title }}
        >
          ← Prev
        </button>

        <span className="text-[10px] sm:text-[11px] tracking-[0.2em] opacity-60" style={{ color: theme.body }}>
          {journey.eventIdx + 1} / {config.events.length}
        </span>

        <button
          data-nav="next"
          onClick={handleNext}
          aria-label="Next event"
          className="border-0 cursor-pointer text-[11px] sm:text-[12px] tracking-[0.2em] sm:tracking-[0.3em] uppercase py-2 px-3 sm:px-1 rounded-lg sm:rounded-none transition-all hover:bg-white/10 sm:hover:bg-transparent"
          style={{ color: theme.title }}
        >
          {journey.eventIdx === config.events.length - 1 ? 'Replay ↺' : 'Next →'}
        </button>
      </div>
    </div>
  );
}
