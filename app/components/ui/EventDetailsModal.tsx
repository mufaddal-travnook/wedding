'use client';

import { useEffect } from 'react';
import type { EventConfig } from '@/app/config/types';

export interface EventDetailsModalProps {
  /** The event whose schedule metadata is on display. */
  event: EventConfig;
  /** Guest name substituted into `{{name}}` placeholders. */
  guestName: string;
  /** Closing unmounts the modal — the gift box trigger brings it back. */
  onClose: () => void;
  /** Accessible label for the close button. */
  closeLabel?: string;
}

/**
 * A pure display overlay for the current event: greeting, title, description and
 * schedule metadata, plus a close button. It holds no navigation of its own —
 * moving between events is the bottom navigation bar's job.
 */
export function EventDetailsModal({
  event,
  guestName,
  onClose,
  closeLabel = 'Close event details',
}: EventDetailsModalProps) {
  const theme = event.theme;

  // Escape closes the modal, matching the close button.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const fillTemplate = (value: string) => value.replace(/\{\{name\}\}/g, guestName);

  return (
    <section
      role="dialog"
      aria-modal="false"
      aria-label={`${event.title} details`}
      className="pointer-events-auto relative w-full max-h-full overflow-y-auto rounded-2xl p-4 sm:w-[min(420px,42vw)] sm:p-6 animate-fadeIn"
      style={{
        background: 'rgba(0,0,0,0.45)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${theme.accent}33`,
        boxShadow: `0 8px 40px ${theme.shadow}`,
      }}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label={closeLabel}
        className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-white/60 transition-all hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{ outlineColor: theme.accent }}
      >
        ✕
      </button>

      {event.greet && (
        <p
          className="font-[family-name:var(--font-great-vibes)] text-[22px] sm:text-[clamp(24px,3.4vw,30px)] pr-9"
          style={{ color: theme.accent }}
        >
          {fillTemplate(event.greet)}
        </p>
      )}

      <p
        className="mt-2 pr-9 text-[10px] font-medium uppercase tracking-[0.35em] sm:text-[11px] sm:tracking-[0.42em]"
        style={{ color: theme.eyebrow }}
      >
        {event.eyebrow}
      </p>

      <h2
        className="mb-3 mt-1.5 font-[family-name:var(--font-marcellus)] text-[26px] font-normal leading-[1.1] sm:text-[clamp(30px,3.6vw,44px)]"
        style={{ color: theme.title }}
      >
        {event.title}
      </h2>

      <p
        className="text-[13px] font-normal leading-[1.7] sm:text-[14px] sm:leading-[1.75]"
        style={{ color: theme.body }}
      >
        {fillTemplate(event.body)}
      </p>

      <ul
        className="mt-3 text-[12px] leading-[1.9] sm:mt-4 sm:text-[13px] sm:leading-[2]"
        style={{ color: theme.body }}
      >
        {event.meta.map((line, i) => (
          <li key={`${line.icon}-${i}`}>
            <span className="mr-2" style={{ color: theme.accent }} aria-hidden>
              {line.icon}
            </span>
            {line.bold ? (
              line.text.includes(line.bold) ? (
                <>
                  {line.text.split(line.bold)[0]}
                  <b className="font-semibold" style={{ color: theme.title }}>
                    {line.bold}
                  </b>
                  {line.text.split(line.bold)[1] ?? ''}
                </>
              ) : (
                <>
                  <b className="font-semibold" style={{ color: theme.title }}>
                    {line.bold}
                  </b>{' '}
                  {line.text}
                </>
              )
            ) : (
              <span className="font-medium">{line.text}</span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
