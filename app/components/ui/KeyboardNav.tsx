'use client';

import { useEffect } from 'react';
import { useJourney } from '@/app/lib/hooks/useJourneyState';
import { useEvents } from '@/app/lib/hooks/useSideConfig';
import { driveTo } from '@/app/lib/journey-bridge';

/**
 * Arrow keys mirror the navigation bar, and Escape leaves explore mode.
 *
 * This calls the journey bridge directly rather than synthesising a click on
 * `[data-nav]`: the buttons are hidden at the ends of the journey
 * (`disabled:opacity-0`), and a `.click()` on a disabled button is a no-op, so
 * the keyboard path used to silently die in cases the bridge handles fine.
 */
export function KeyboardNav() {
  const { stage, eventIdx } = useJourney();
  const events = useEvents();

  useEffect(() => {
    // Ignore keys while the car is in motion — `driveTo` would reject them
    // anyway, and during any other stage the journey UI is not on screen.
    if (stage !== 'event') return;

    const handler = (e: KeyboardEvent) => {
      // Never hijack keys aimed at a field or an open dialog.
      const el = document.activeElement;
      if (
        el instanceof HTMLInputElement ||
        el instanceof HTMLTextAreaElement ||
        el instanceof HTMLSelectElement ||
        (el instanceof HTMLElement && el.isContentEditable)
      ) {
        return;
      }
      if (e.altKey || e.ctrlKey || e.metaKey) return;

      if (e.key === 'ArrowRight') {
        if (eventIdx < events.length - 1) {
          e.preventDefault();
          driveTo(eventIdx + 1);
        }
      } else if (e.key === 'ArrowLeft') {
        if (eventIdx > 0) {
          e.preventDefault();
          driveTo(eventIdx - 1);
        }
      } else if (e.key === 'Escape') {
        // Explore mode owns its own exit button; this stays a DOM click because
        // that control is local to ExploreControls and has no bridge.
        const backBtn = document.querySelector<HTMLButtonElement>('[data-nav="explore-back"]');
        backBtn?.click();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [stage, eventIdx, events.length]);

  return null;
}
