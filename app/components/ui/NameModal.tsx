'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useJourney, useJourneyDispatch } from '@/app/lib/hooks/useJourneyState';
import { defaultConfig } from '@/app/config/default-config';
import { listSides } from '@/app/lib/hooks/useSideConfig';
import type { Side } from '@/app/config/types';

/** How long we wait on the save before letting the guest through anyway. */
const SAVE_TIMEOUT_MS = 6000;

export function NameModal() {
  const { stage } = useJourney();
  const dispatch = useJourneyDispatch();
  const form = defaultConfig.guestForm;
  const sides = listSides();

  const [side, setSide] = useState<Side | null>(null);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Move focus to the name field once a side is chosen.
  useEffect(() => {
    if (side) inputRef.current?.focus();
  }, [side]);

  if (stage !== 'naming') return null;

  const chosen = sides.find((s) => s.id === side) ?? null;
  const accent = chosen?.accent ?? '#e8b86d';
  const cleanName = name.replace(/[<>]/g, '').replace(/\s+/g, ' ').trim();

  /** Record the guest in Appwrite. Never blocks the journey — a failed save is only logged. */
  const saveGuest = async (guestName: string, guestSide: Side) => {
    try {
      const res = await fetch('/api/guests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: guestName, side: guestSide }),
        signal: AbortSignal.timeout(SAVE_TIMEOUT_MS),
      });
      if (!res.ok) {
        console.warn('[NameModal] Guest not saved:', res.status, await res.text());
      }
    } catch (error) {
      console.warn('[NameModal] Guest save failed:', error);
    }
  };

  const begin = async () => {
    if (!side || saving) return;

    const guestName = cleanName || form.fallbackName;
    setSaving(true);
    await saveGuest(guestName, side);

    dispatch({ type: 'SET_SIDE', side });
    dispatch({ type: 'SET_GUEST', name: guestName });
    dispatch({ type: 'SET_STAGE', stage: 'event' });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={form.eyebrow}
      className="fixed inset-0 z-20 flex items-center justify-center overflow-y-auto bg-[rgba(13,10,30,0.45)] px-5 py-10 backdrop-blur-[10px] animate-fadeIn"
    >
      <div className="w-full max-w-[460px] text-center animate-slideUp">
        <div
          className="text-[10px] sm:text-[11px] tracking-[0.32em] sm:tracking-[0.4em] uppercase"
          style={{ color: accent }}
        >
          {form.eyebrow}
        </div>

        {/* Step 1 — whose guest are you? */}
        {!side && (
          <>
            <h2 className="font-[family-name:var(--font-marcellus)] text-[clamp(24px,6vw,34px)] leading-tight text-white mt-3 font-normal">
              {form.sideQuestion}
            </h2>
            {form.sideHint && (
              <p className="mt-2 text-[12px] sm:text-[13px] font-light text-white/50">
                {form.sideHint}
              </p>
            )}

            <div
              role="group"
              aria-label={form.sideQuestion}
              className="mt-7 grid grid-cols-2 gap-3 sm:gap-4"
            >
              {sides.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSide(s.id)}
                  className="group flex flex-col items-center gap-2 rounded-2xl border bg-white/[0.06] px-3 py-5 sm:px-5 sm:py-7 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/[0.12] focus-visible:outline-2 focus-visible:outline-offset-[3px]"
                  style={{ borderColor: `${s.accent}55`, outlineColor: s.accent } as CSSProperties}
                >
                  <span
                    className="text-[26px] sm:text-[32px] leading-none transition-transform duration-300 group-hover:scale-110"
                    aria-hidden
                  >
                    {s.icon}
                  </span>
                  <span
                    className="font-[family-name:var(--font-marcellus)] text-[15px] sm:text-[18px]"
                    style={{ color: s.accent }}
                  >
                    {s.shortLabel}
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-light tracking-[0.08em] text-white/55">
                    {s.blurb}
                  </span>
                </button>
              ))}
            </div>
          </>
        )}

        {/* Step 2 — full name */}
        {side && chosen && (
          <>
            <h2 className="font-[family-name:var(--font-marcellus)] text-[clamp(23px,5.6vw,32px)] leading-tight text-white mt-3 font-normal">
              {form.nameQuestion}
            </h2>

            <button
              onClick={() => setSide(null)}
              disabled={saving}
              className="mt-2 inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1 text-[10px] sm:text-[11px] uppercase tracking-[0.16em] text-white/60 transition-colors hover:border-white/35 hover:text-white/90 disabled:opacity-40"
            >
              <span aria-hidden>{chosen.icon}</span>
              {chosen.label}
              <span className="text-white/40">· {form.backLabel}</span>
            </button>

            <input
              ref={inputRef}
              type="text"
              name="fullName"
              maxLength={form.nameMaxLength}
              autoComplete="name"
              placeholder={form.namePlaceholder}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && begin()}
              disabled={saving}
              aria-label={form.nameQuestion}
              className="mt-6 w-full border-0 border-b border-white/40 bg-transparent px-1.5 py-2.5 text-center font-[family-name:var(--font-marcellus)] text-[clamp(18px,4.6vw,22px)] text-white outline-none transition-colors duration-300 placeholder:font-[family-name:var(--font-jost)] placeholder:text-[15px] placeholder:font-light placeholder:tracking-[0.12em] placeholder:text-white/35 disabled:opacity-60"
              style={{ caretColor: accent, borderBottomColor: name ? accent : undefined }}
            />

            {form.nameHint && (
              <p className="mt-3 text-[11px] sm:text-[12px] font-light text-white/40">
                {form.nameHint}
              </p>
            )}

            <button
              onClick={begin}
              disabled={saving}
              className="mt-7 cursor-pointer rounded-full border-0 px-[clamp(28px,8vw,42px)] py-3.5 text-[clamp(11px,2.8vw,13px)] font-medium uppercase tracking-[0.24em] text-[#241f47] transition-all duration-300 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-[3px] disabled:translate-y-0 disabled:opacity-70"
              style={{
                background: `linear-gradient(135deg, ${accent}, #e8b86d)`,
                boxShadow: saving ? 'none' : `0 10px 30px ${accent}55`,
              }}
            >
              {saving ? form.submittingLabel : form.submitLabel}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
