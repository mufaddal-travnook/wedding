'use client';

import { useCallback } from 'react';
import { useJourney } from '@/app/lib/hooks/useJourneyState';
import { useEvents } from '@/app/lib/hooks/useSideConfig';
import { driveTo } from '@/app/lib/journey-bridge';

/**
 * Journey navigation, pinned to the very bottom of the viewport.
 *
 * Mounted independently in `page.tsx` — NOT inside JourneyOverlay — so it
 * stays visible while the details modal opens and closes, and survives the
 * overlay unmounting during driving. It reads journey state itself.
 *
 * Owns the bottom band of the screen. ExploreControls stacks above it; the
 * overlay reserves NAV_BAND_PX so the two never collide.
 */

/**
 * Height this bar reserves at the bottom of the screen, excluding the safe
 * area inset. JourneyOverlay pads its bottom stack by this much.
 */
export const NAV_BAND_PX = 92;

export function EventNavigationBar() {
  const journey = useJourney();
  const events = useEvents();

  const { eventIdx, stage } = journey;
  const event = events[eventIdx];

  const atStart = eventIdx <= 0;
  const atEnd = eventIdx >= events.length - 1;
  // The car is already moving; let it arrive before accepting another move.
  const disabled = stage === 'driving';

  const goPrevious = useCallback(() => {
    if (eventIdx > 0) driveTo(eventIdx - 1);
  }, [eventIdx]);

  const goNext = useCallback(() => {
    if (eventIdx < events.length - 1) driveTo(eventIdx + 1);
  }, [eventIdx, events.length]);

  if ((stage !== 'event' && stage !== 'driving') || !event) return null;

  const button =
    'pointer-events-auto group flex items-center gap-2 rounded-full px-5 py-2.5 ' +
    'text-[11px] font-bold uppercase tracking-[0.2em] text-white ' +
    'border border-white/25 bg-white/[0.08] backdrop-blur-xl ' +
    'shadow-[0_8px_28px_-6px_rgba(0,0,0,0.7)] [text-shadow:0_1px_6px_rgba(0,0,0,0.5)] ' +
    'transition-all duration-300 ' +
    'enabled:hover:bg-white/[0.18] enabled:hover:border-white/45 enabled:hover:-translate-y-0.5 ' +
    'enabled:active:translate-y-0 ' +
    'disabled:pointer-events-none disabled:opacity-0 ' +
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/80 ' +
    'sm:px-6 sm:py-3 sm:text-[12px] sm:tracking-[0.24em]';

  return (
    <nav
      aria-label="Event navigation"
      className={`pointer-events-none fixed inset-x-0 bottom-0 z-[10] flex items-center justify-between gap-3
        px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-12
        transition-opacity duration-500 sm:justify-center sm:gap-10 sm:px-8
        ${disabled ? 'opacity-40' : 'opacity-100'}`}
      // Scrim so white type stays legible over a bright sky or pale ground.
      style={{
        background:
          'linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.28) 50%, transparent 100%)',
      }}
    >
      <button
        type="button"
        data-nav="prev"
        onClick={goPrevious}
        disabled={disabled || atStart}
        aria-label="Previous event"
        className={button}
      >
        <span aria-hidden className="transition-transform duration-300 group-hover:-translate-x-0.5">
          ←
        </span>
        <span className="max-[380px]:sr-only">Prev</span>
      </button>

      <p className="pointer-events-none flex flex-col items-center gap-0.5 text-center [text-shadow:0_2px_10px_rgba(0,0,0,0.75)]">
        <span className="text-[12px] font-bold uppercase tracking-[0.26em] text-white sm:text-[13px]">
          {event.label}
        </span>
        <span className="text-[10px] font-semibold tabular-nums tracking-[0.18em] text-white/60">
          {Math.min(eventIdx + 1, events.length)}&thinsp;/&thinsp;{events.length}
        </span>
      </p>

      <button
        type="button"
        data-nav="next"
        onClick={goNext}
        disabled={disabled || atEnd}
        aria-label="Next event"
        className={button}
      >
        <span className="max-[380px]:sr-only">Next</span>
        <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5">
          →
        </span>
      </button>
    </nav>
  );
}
