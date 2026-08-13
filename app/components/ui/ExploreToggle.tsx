'use client';

import { useJourney, useJourneyDispatch } from '@/app/lib/hooks/useJourneyState';
import { defaultConfig } from '@/app/config/default-config';

export function ExploreToggle() {
  const { stage, cameraMode, eventIdx, panelOpen } = useJourney();
  const dispatch = useJourneyDispatch();
  const theme = defaultConfig.events[eventIdx]?.theme;

  if (stage !== 'event') return null;

  const isExploring = cameraMode === 'explore';

  const toggle = () => {
    dispatch({ type: 'SET_CAMERA_MODE', mode: isExploring ? 'guided' : 'explore' });
  };

  const resetView = () => {
    dispatch({ type: 'SET_CAMERA_MODE', mode: 'guided' });
  };

  // On mobile, hide when panel is open to avoid overlap
  // Position: bottom-right on desktop, top-right area on mobile when panel is open
  return (
    <div className={`fixed z-[8] flex flex-col items-end gap-2
      bottom-4 right-3
      sm:bottom-6 sm:right-6
      ${panelOpen ? 'max-sm:top-16 max-sm:bottom-auto max-sm:right-3' : ''}
    `}>
      {isExploring && (
        <button
          onClick={resetView}
          className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-white/30 bg-black/30 backdrop-blur-md text-white text-[10px] sm:text-[11px] tracking-[0.15em] sm:tracking-[0.2em] uppercase transition-all hover:bg-black/50"
        >
          Reset View
        </button>
      )}
      <button
        data-nav={isExploring ? 'explore-back' : 'explore'}
        onClick={toggle}
        aria-label={isExploring ? 'Back to guided journey' : 'Explore this venue freely'}
        className="px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-full border backdrop-blur-md text-[10px] sm:text-[11px] tracking-[0.15em] sm:tracking-[0.25em] uppercase transition-all"
        style={{
          borderColor: isExploring ? 'rgba(255,255,255,0.5)' : `${theme?.accent ?? '#c9a04e'}88`,
          background: isExploring ? 'rgba(255,255,255,0.15)' : `${theme?.accent ?? '#c9a04e'}22`,
          color: isExploring ? '#fff' : (theme?.accent ?? '#c9a04e'),
        }}
      >
        {isExploring ? '← Back' : 'Explore'}
      </button>

      {isExploring && (
        <p className="text-white/35 text-[9px] sm:text-[10px] tracking-[0.1em] text-right max-sm:hidden">
          Drag to orbit · Scroll to zoom
        </p>
      )}
    </div>
  );
}
