'use client';

import { useJourney, useJourneyDispatch } from '@/app/lib/hooks/useJourneyState';
import { defaultConfig } from '@/app/config/default-config';

export function ExploreToggle() {
  const { stage, cameraMode, eventIdx } = useJourney();
  const dispatch = useJourneyDispatch();
  const theme = defaultConfig.events[eventIdx]?.theme;

  // Only show when at an event (not loading, naming, driving)
  if (stage !== 'event') return null;

  const isExploring = cameraMode === 'explore';

  const toggle = () => {
    dispatch({ type: 'SET_CAMERA_MODE', mode: isExploring ? 'guided' : 'explore' });
  };

  const resetView = () => {
    dispatch({ type: 'SET_CAMERA_MODE', mode: 'guided' });
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9] flex flex-col items-end gap-2">
      {isExploring && (
        <button
          onClick={resetView}
          className="px-4 py-2 rounded-full border border-white/30 bg-black/20 backdrop-blur-md text-white text-[11px] tracking-[0.2em] uppercase transition-all hover:bg-black/40"
        >
          Reset View
        </button>
      )}
      <button
        data-nav={isExploring ? 'explore-back' : 'explore'}
        onClick={toggle}
        aria-label={isExploring ? 'Back to guided journey' : 'Explore this venue freely'}
        className="px-5 py-2.5 rounded-full border backdrop-blur-md text-[11px] tracking-[0.25em] uppercase transition-all"
        style={{
          borderColor: isExploring ? 'rgba(255,255,255,0.5)' : `${theme?.accent ?? '#c9a04e'}88`,
          background: isExploring ? 'rgba(255,255,255,0.15)' : `${theme?.accent ?? '#c9a04e'}22`,
          color: isExploring ? '#fff' : (theme?.accent ?? '#c9a04e'),
        }}
      >
        {isExploring ? '← Back to Journey' : 'Explore Venue'}
      </button>

      {/* Hint text */}
      {isExploring && (
        <p className="text-white/40 text-[10px] tracking-[0.15em] text-right mt-1">
          Drag to orbit · Scroll to zoom · Right-drag to pan
        </p>
      )}
    </div>
  );
}
