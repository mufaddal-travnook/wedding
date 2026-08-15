'use client';

import { useCallback } from 'react';
import { useJourney, useJourneyDispatch } from '@/app/lib/hooks/useJourneyState';
import { useEvents } from '@/app/lib/hooks/useSideConfig';
import { EventDetailsModal } from './EventDetailsModal';
import { GiftBoxTrigger } from './GiftBoxTrigger';
import { ExploreControls } from './ExploreControls';
import { NAV_BAND_PX } from './EventNavigationBar';

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
 *   └──────────────────────────────┘
 *
 * Because the column is anchored at the bottom, revealing the explore buttons
 * extends the stack upward.
 *
 * Navigation is NOT part of this shell — EventNavigationBar mounts separately
 * in `page.tsx` so it survives this overlay unmounting during driving. The
 * bottom padding below reserves room for it.
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

      {/* Explore controls sit above the independently-mounted navigation bar.
          Padding comes from NAV_BAND_PX so the reservation can never drift out
          of sync with the bar's actual height. */}
      <div
        className="flex shrink-0 flex-col px-3 sm:px-6"
        style={{
          paddingBottom: `calc(${NAV_BAND_PX}px + env(safe-area-inset-bottom))`,
        }}
      >
        <ExploreControls
          mode={journey.cameraMode}
          onModeChange={(mode) => dispatch({ type: 'SET_CAMERA_MODE', mode })}
          accentColor={theme.accent}
        />
      </div>
    </div>
  );
}
