'use client';

import { useCallback } from 'react';
import { useJourney, useJourneyDispatch } from '@/app/lib/hooks/useJourneyState';
import { useEvents } from '@/app/lib/hooks/useSideConfig';
import { driveTo } from '@/app/lib/journey-bridge';
import { EventDetailsModal } from './EventDetailsModal';
import { GiftBoxTrigger } from './GiftBoxTrigger';
import { ExploreControls } from './ExploreControls';
import { EventNavigationBar } from './EventNavigationBar';

/**
 * Layout shell for the in-journey overlay.
 *
 * Everything is laid out in normal flow inside one bottom-anchored column, so
 * the pieces can never overlap each other:
 *
 *   ┌──────────────────────────────┐
 *   │ content band (flex-1)        │  ← gift box / details modal, beside the zone
 *   ├──────────────────────────────┤
 *   │ explore controls             │  ← grows upward when explore mode opens
 *   │ navigation bar               │  ← stays pinned to the bottom edge
 *   └──────────────────────────────┘
 *
 * Because the column is anchored at the bottom, revealing the explore buttons
 * extends the stack upward instead of displacing the navigation bar.
 */
export function JourneyOverlay() {
  const journey = useJourney();
  const dispatch = useJourneyDispatch();
  const events = useEvents();

  const event = events[journey.eventIdx];

  const openDetails = useCallback(
    () => dispatch({ type: 'SET_PANEL_OPEN', open: true }),
    [dispatch],
  );
  const closeDetails = useCallback(
    () => dispatch({ type: 'SET_PANEL_OPEN', open: false }),
    [dispatch],
  );

  const goPrevious = useCallback(() => {
    if (journey.eventIdx > 0) driveTo(journey.eventIdx - 1);
  }, [journey.eventIdx]);

  const goNext = useCallback(() => {
    if (journey.eventIdx < events.length - 1) driveTo(journey.eventIdx + 1);
  }, [journey.eventIdx, events.length]);

  if (journey.stage !== 'event' || !event) return null;

  const theme = event.theme;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9] flex flex-col">
      {/* Content band — the gift box and details modal sit beside the zone. */}
      <div className="flex min-h-0 flex-1 items-center px-3 pb-3 pt-20 sm:px-[4vw] sm:pt-24">
        {journey.panelOpen ? (
          <EventDetailsModal
            event={event}
            guestName={journey.guestName}
            onClose={closeDetails}
          />
        ) : (
          <GiftBoxTrigger
            onClick={openDetails}
            accentColor={theme.accent}
            shadowColor={theme.shadow}
          />
        )}
      </div>

      {/* Bottom stack — explore controls above, navigation pinned below. */}
      <div className="flex shrink-0 flex-col gap-3 px-3 pb-[max(12px,env(safe-area-inset-bottom))] sm:gap-4 sm:px-6 sm:pb-6">
        <ExploreControls
          mode={journey.cameraMode}
          onModeChange={(mode) => dispatch({ type: 'SET_CAMERA_MODE', mode })}
          accentColor={theme.accent}
        />
        <EventNavigationBar
          currentIndex={journey.eventIdx}
          total={events.length}
          currentLabel={event.label}
          onPrevious={goPrevious}
          onNext={goNext}
          accentColor={theme.accent}
          textColor={theme.title}
        />
      </div>
    </div>
  );
}
