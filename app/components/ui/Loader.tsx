'use client';

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from 'react';
import { useJourneyDispatch } from '@/app/lib/hooks/useJourneyState';
import { defaultConfig } from '@/app/config/default-config';

/** Heart outline on a 32×32 canvas. `pathLength="100"` normalises the dash math to percentages. */
const HEART_D =
  'M16,28.2 C16,28.2 3,20.2 3,11.5 C3,6.5 7,3.5 11,3.5 C14,3.5 16,6 16,6 C16,6 18,3.5 21,3.5 C25,3.5 29,6.5 29,11.5 C29,20.2 16,28.2 16,28.2 Z';

const clamp = (n: number) => Math.max(0, Math.min(100, n));

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function subscribeToMotionPreference(onChange: () => void) {
  const mq = window.matchMedia(REDUCED_MOTION_QUERY);
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
}

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeToMotionPreference,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false,
  );
}

export function Loader() {
  const dispatch = useJourneyDispatch();
  const { loader, couple } = defaultConfig;
  const { colors } = loader;
  const gradientId = useId();
  const reducedMotion = usePrefersReducedMotion();

  // The first checkpoint is the starting state, so the sequencer below only
  // has to advance from the second one onward.
  const [target, setTarget] = useState(() => clamp(loader.steps[0]?.at ?? 100));
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState(loader.steps[0]?.label ?? '');
  const [exiting, setExiting] = useState(false);
  const [unmounted, setUnmounted] = useState(false);
  const progressRef = useRef(0);

  const monogram = useMemo(() => {
    if (loader.monogram) return loader.monogram;
    const sep = loader.monogramSeparator ?? '&';
    const initial = (name: string) => name.trim().charAt(0).toUpperCase();
    return `${initial(couple.name1)} ${sep} ${initial(couple.name2)}`;
  }, [loader.monogram, loader.monogramSeparator, couple.name1, couple.name2]);

  // Step sequencer → hold at 100% → fade → unmount.
  const startExit = useCallback(
    (schedule: (fn: () => void, ms: number) => void) => {
      schedule(() => {
        setExiting(true);
        // Reveal the gate underneath while the overlay fades out.
        dispatch({ type: 'SET_STAGE', stage: 'gate' });
        schedule(() => setUnmounted(true), loader.fadeMs);
      }, loader.holdMs);
    },
    [dispatch, loader.fadeMs, loader.holdMs],
  );

  useEffect(() => {
    const steps = loader.steps;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const schedule = (fn: () => void, ms: number) => {
      timers.push(setTimeout(fn, ms));
    };

    let interval: ReturnType<typeof setInterval> | undefined;
    let i = 1;

    const advance = () => {
      if (i >= steps.length) return;
      setTarget(clamp(steps[i].at));
      setStep(steps[i].label);
      i += 1;
      if (i >= steps.length) {
        if (interval) clearInterval(interval);
        startExit(schedule);
      }
    };

    if (steps.length <= 1) {
      startExit(schedule);
    } else {
      interval = setInterval(advance, loader.stepDurationMs);
    }

    return () => {
      if (interval) clearInterval(interval);
      timers.forEach(clearTimeout);
    };
  }, [loader.steps, loader.stepDurationMs, startExit]);

  // Ease the displayed value toward the current step so the arc and the
  // percentage move continuously instead of snapping between checkpoints.
  useEffect(() => {
    // Reduced motion reads `target` directly — no tween, no state churn.
    if (reducedMotion) {
      progressRef.current = target;
      return;
    }

    let raf = 0;
    const tick = () => {
      const next = progressRef.current + (target - progressRef.current) * 0.12;
      if (Math.abs(target - next) < 0.15) {
        progressRef.current = target;
        setProgress(target);
        return;
      }
      progressRef.current = next;
      setProgress(next);
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, reducedMotion]);

  if (unmounted) return null;

  const shown = clamp(reducedMotion ? target : progress);
  const rounded = Math.round(shown);

  return (
    <div
      role="status"
      aria-busy={!exiting}
      aria-label="Loading the wedding journey"
      className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-[clamp(18px,4vh,30px)] px-6 py-[env(safe-area-inset-top)] text-[#ffe9d6] will-change-[opacity,transform]"
      style={
        {
          background: loader.background,
          opacity: exiting ? 0 : 1,
          transform: exiting ? 'scale(1.04)' : 'scale(1)',
          transition: `opacity ${loader.fadeMs}ms ease, transform ${loader.fadeMs}ms ease`,
          pointerEvents: exiting ? 'none' : 'auto',
          '--heart-size': loader.heartSize,
        } as CSSProperties
      }
    >
      {/* Heart progress dial */}
      <div
        className="relative grid place-items-center"
        style={{ width: 'var(--heart-size)', height: 'var(--heart-size)' }}
      >
        {/* Ambient bloom */}
        <div
          aria-hidden
          className="absolute inset-[-38%] rounded-full blur-2xl animate-loaderGlow"
          style={{ background: `radial-gradient(circle, ${colors.glow} 0%, transparent 68%)` }}
        />

        <svg
          viewBox="0 0 32 32"
          className="relative w-full h-full animate-loaderBeat"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={rounded}
          aria-valuetext={`${rounded} percent — ${step}`}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stopColor={colors.progressFrom} />
              <stop offset="100%" stopColor={colors.progressTo} />
            </linearGradient>
          </defs>

          {/* Track */}
          <path
            d={HEART_D}
            fill="none"
            stroke={colors.track}
            strokeWidth={1.4}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />

          {/* Filled arc */}
          <path
            d={HEART_D}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={2.1}
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray="100"
            strokeDashoffset={100 - shown}
            style={{ filter: `drop-shadow(0 0 3px ${colors.glow})` }}
          />
        </svg>

        {/* Monogram */}
        <div
          className="absolute inset-0 grid place-items-center pointer-events-none select-none"
          style={{ transform: 'translateY(-4%)' }}
        >
          <span
            className="font-[family-name:var(--font-great-vibes)] leading-none"
            style={{
              fontSize: 'calc(var(--heart-size) * 0.3)',
              color: colors.monogram,
              textShadow: `0 2px 14px ${colors.glow}`,
            }}
          >
            {monogram}
          </span>
        </div>
      </div>

      {/* Title, flanked by hairline rules */}
      <div className="flex items-center gap-[clamp(10px,3vw,18px)] w-full max-w-[min(440px,86vw)]">
        <span
          aria-hidden
          className="h-px flex-1"
          style={{ background: `linear-gradient(90deg, transparent, ${colors.rule})` }}
        />
        <h1
          className="font-[family-name:var(--font-marcellus)] text-center text-[clamp(11px,2.9vw,15px)] uppercase tracking-[0.28em] sm:tracking-[0.42em] whitespace-nowrap"
          style={{ color: colors.title }}
        >
          {loader.title}
        </h1>
        <span
          aria-hidden
          className="h-px flex-1"
          style={{ background: `linear-gradient(90deg, ${colors.rule}, transparent)` }}
        />
      </div>

      {/* Readout */}
      <div className="flex flex-col items-center gap-[6px] text-center">
        <div
          className="text-[clamp(10px,2.6vw,12px)] tracking-[0.34em] tabular-nums"
          style={{ color: colors.percent }}
        >
          {rounded}%
        </div>
        <div
          aria-live="polite"
          className="min-h-[1.15em] text-[clamp(11px,2.8vw,13px)] font-light tracking-[0.08em] transition-opacity duration-300"
          style={{ color: colors.step }}
        >
          {step}
        </div>
        {loader.footnote && (
          <div
            className="mt-[clamp(6px,1.6vh,12px)] text-[clamp(9px,2.3vw,11px)] uppercase tracking-[0.22em]"
            style={{ color: colors.step }}
          >
            {loader.footnote}
          </div>
        )}
      </div>
    </div>
  );
}
