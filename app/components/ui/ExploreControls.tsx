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
 * Explore mode controls, right-aligned above the navigation bar.
 *
 * Rendered as an ordinary block inside the overlay's bottom stack, which pads
 * itself by the nav bar's height — so these grow upward and never collide
 * with Prev/Next.
 */
export function ExploreControls({
  mode,
  onModeChange,
  accentColor,
  hint = 'Drag to orbit · Scroll to zoom',
}: ExploreControlsProps) {
  const isExploring = mode === 'explore';

  /** Shared shape: glass pill, white bold type, lifted shadow. */
  const base =
    'pointer-events-auto rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] ' +
    'text-white backdrop-blur-xl transition-all duration-300 ' +
    'shadow-[0_8px_24px_-6px_rgba(0,0,0,0.65)] [text-shadow:0_1px_6px_rgba(0,0,0,0.5)] ' +
    'hover:-translate-y-0.5 active:translate-y-0 ' +
    'focus-visible:outline-2 focus-visible:outline-offset-2 ' +
    'sm:px-5 sm:py-2.5 sm:text-[11px] sm:tracking-[0.22em]';

  return (
    <div className="pointer-events-none flex flex-col items-end gap-2.5">
      {isExploring && (
        <>
          <p className="pointer-events-none max-sm:hidden rounded-full bg-black/35 px-3 py-1 text-right text-[9px] font-semibold tracking-[0.12em] text-white/70 backdrop-blur-md [text-shadow:0_1px_4px_rgba(0,0,0,0.6)] sm:text-[10px]">
            {hint}
          </p>
          <button
            type="button"
            onClick={() => onModeChange('guided')}
            className={`${base} border border-white/25 bg-white/[0.08] hover:border-white/45 hover:bg-white/[0.18] focus-visible:outline-white/80`}
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
        className={`${base} border`}
        style={{
          // Exploring reads as "active", so it goes solid white-on-glass;
          // otherwise the zone accent tints the border and glow.
          borderColor: isExploring ? 'rgba(255,255,255,0.5)' : `${accentColor}99`,
          background: isExploring ? 'rgba(255,255,255,0.20)' : `${accentColor}33`,
          outlineColor: isExploring ? '#fff' : accentColor,
        }}
      >
        {isExploring ? '← Back' : 'Explore'}
      </button>
    </div>
  );
}
