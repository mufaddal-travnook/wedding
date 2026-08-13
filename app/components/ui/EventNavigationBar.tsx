'use client';

export interface EventNavigationBarProps {
  /** Zero-based index of the current event. */
  currentIndex: number;
  /** Total number of events in this side's journey. */
  total: number;
  /** Label of the current event, shown between the two actions. */
  currentLabel?: string;
  onPrevious: () => void;
  onNext: () => void;
  /** Themed accent, normally the current event's accent colour. */
  accentColor: string;
  /** Themed text colour for labels. */
  textColor?: string;
  /** Blocks both actions, e.g. while the car is already driving. */
  disabled?: boolean;
}

/**
 * Standalone navigation, anchored at the very bottom of the viewport. It is a
 * sibling of the event details modal, never a child of it, so the modal can
 * open and close without affecting the guest's ability to move between events.
 */
export function EventNavigationBar({
  currentIndex,
  total,
  currentLabel,
  onPrevious,
  onNext,
  accentColor,
  textColor = '#ffffff',
  disabled = false,
}: EventNavigationBarProps) {
  const atStart = currentIndex <= 0;
  const atEnd = currentIndex >= total - 1;

  const buttonClass =
    'pointer-events-auto flex items-center gap-2 rounded-full border px-4 py-2 text-[10px] uppercase tracking-[0.18em] backdrop-blur-md transition-all duration-300 enabled:hover:-translate-y-0.5 disabled:cursor-default disabled:opacity-25 focus-visible:outline-2 focus-visible:outline-offset-2 sm:px-6 sm:py-2.5 sm:text-[11px] sm:tracking-[0.24em]';

  const buttonStyle = {
    borderColor: `${accentColor}66`,
    background: 'rgba(0,0,0,0.38)',
    color: textColor,
    outlineColor: accentColor,
  };

  return (
    <nav
      aria-label="Event navigation"
      className="pointer-events-none flex items-center justify-between gap-3 sm:justify-center sm:gap-8"
    >
      <button
        type="button"
        data-nav="prev"
        onClick={onPrevious}
        disabled={disabled || atStart}
        aria-label="Previous event"
        className={buttonClass}
        style={buttonStyle}
      >
        <span aria-hidden>←</span>
        <span className="max-[380px]:sr-only">Previous</span>
      </button>

      <p
        className="pointer-events-none text-center text-[10px] tracking-[0.2em] sm:text-[11px]"
        style={{ color: textColor }}
      >
        {currentLabel && <span className="mr-2 opacity-80">{currentLabel}</span>}
        <span className="tabular-nums opacity-55">
          {Math.min(currentIndex + 1, total)} / {total}
        </span>
      </p>

      <button
        type="button"
        data-nav="next"
        onClick={onNext}
        disabled={disabled || atEnd}
        aria-label="Next event"
        className={buttonClass}
        style={buttonStyle}
      >
        <span className="max-[380px]:sr-only">Next</span>
        <span aria-hidden>→</span>
      </button>
    </nav>
  );
}
