'use client';

import type { CameraMode } from '@/app/config/types';

export interface ExploreControlsProps {
  /** Current camera mode. */
  mode: CameraMode;
  /** Requests a camera mode change. */
  onModeChange: (mode: CameraMode) => void;
  /** Themed accent, normally the current event's accent colour. */
  accentColor: string;
  /** Hides the "Drag to orbit" hint on small screens. */
  hint?: string;
}

/**
 * Explore mode controls. Rendered as an ordinary block inside the overlay's
 * bottom stack — it grows upward above the navigation bar rather than floating
 * over it, so entering explore mode never covers or displaces the nav.
 */
export function ExploreControls({
  mode,
  onModeChange,
  accentColor,
  hint = 'Drag to orbit · Scroll to zoom',
}: ExploreControlsProps) {
  const isExploring = mode === 'explore';

  return (
    <div className="pointer-events-none flex flex-col items-end gap-2">
      {isExploring && (
        <>
          <p className="pointer-events-none max-sm:hidden text-right text-[9px] tracking-[0.1em] text-white/35 sm:text-[10px]">
            {hint}
          </p>
          <button
            type="button"
            onClick={() => onModeChange('guided')}
            className="pointer-events-auto rounded-full border border-white/30 bg-black/30 px-3 py-1.5 text-[10px] uppercase tracking-[0.15em] text-white backdrop-blur-md transition-all hover:bg-black/50 focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2 sm:px-4 sm:py-2 sm:text-[11px] sm:tracking-[0.2em]"
          >
            Reset View
          </button>
        </>
      )}

      <button
        type="button"
        data-nav={isExploring ? 'explore-back' : 'explore'}
        onClick={() => onModeChange(isExploring ? 'guided' : 'explore')}
        aria-pressed={isExploring}
        aria-label={isExploring ? 'Back to guided journey' : 'Explore this venue freely'}
        className="pointer-events-auto rounded-full border px-3 py-1.5 text-[10px] uppercase tracking-[0.15em] backdrop-blur-md transition-all focus-visible:outline-2 focus-visible:outline-offset-2 sm:px-5 sm:py-2.5 sm:text-[11px] sm:tracking-[0.25em]"
        style={{
          borderColor: isExploring ? 'rgba(255,255,255,0.5)' : `${accentColor}88`,
          background: isExploring ? 'rgba(255,255,255,0.15)' : `${accentColor}22`,
          color: isExploring ? '#fff' : accentColor,
          outlineColor: isExploring ? '#fff' : accentColor,
        }}
      >
        {isExploring ? '← Back' : 'Explore'}
      </button>
    </div>
  );
}
