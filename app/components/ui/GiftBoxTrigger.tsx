'use client';

export interface GiftBoxTriggerProps {
  /** Reveals the event details modal. */
  onClick: () => void;
  /** Tooltip copy shown above the box. */
  tooltip?: string;
  /** Themed accent, normally the current event's accent colour. */
  accentColor: string;
  /** Themed shadow used for the ambient glow. */
  shadowColor?: string;
  /** Emoji or glyph rendered inside the box. */
  glyph?: string;
  /** Accessible name for the button. */
  label?: string;
}

/**
 * The collapsed state of the event details. Unlike the old fixed panel this sits
 * inline in the overlay layout beside the zone, bouncing slowly to hint that it
 * is interactive, with a persistent tooltip above it.
 */
export function GiftBoxTrigger({
  onClick,
  tooltip = 'click for details',
  accentColor,
  shadowColor = 'rgba(0,0,0,0.35)',
  glyph = '🎁',
  label = 'Open event details',
}: GiftBoxTriggerProps) {
  return (
    <div className="pointer-events-auto group relative flex flex-col items-center gap-2">
      {/* Persistent tooltip — brightens on hover/focus of the button below. */}
      <span
        role="tooltip"
        className="whitespace-nowrap rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.18em] backdrop-blur-md transition-all duration-300 group-hover:-translate-y-0.5 group-focus-within:-translate-y-0.5 sm:text-[11px]"
        style={{
          color: accentColor,
          borderColor: `${accentColor}44`,
          background: 'rgba(0,0,0,0.35)',
        }}
      >
        {tooltip}
      </span>

      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        title={tooltip}
        className="animate-giftBounce flex h-12 w-12 items-center justify-center rounded-full border backdrop-blur-xl transition-transform duration-300 hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-[3px] active:scale-95 sm:h-14 sm:w-14"
        style={{
          background: `${accentColor}22`,
          borderColor: `${accentColor}66`,
          boxShadow: `0 4px 20px ${shadowColor}`,
          outlineColor: accentColor,
        }}
      >
        <span className="text-2xl sm:text-3xl" aria-hidden>
          {glyph}
        </span>
      </button>
    </div>
  );
}
