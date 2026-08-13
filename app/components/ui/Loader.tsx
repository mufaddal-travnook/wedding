'use client';

import { useState, useEffect } from 'react';
import { useJourneyDispatch } from '@/app/lib/hooks/useJourneyState';

export function Loader() {
  const dispatch = useJourneyDispatch();
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState('Warming up…');
  const [done, setDone] = useState(false);

  useEffect(() => {
    const steps = [
      [12, 'Setting the type…'],
      [24, 'Decorating the car…'],
      [40, 'Hanging the garlands…'],
      [56, 'Draping the mandap…'],
      [72, 'Stringing the marigolds…'],
      [86, 'Tuning the band…'],
      [95, 'Lighting the lamps…'],
      [100, 'Ready'],
    ] as [number, string][];

    let i = 0;
    const timer = setInterval(() => {
      if (i >= steps.length) {
        clearInterval(timer);
        setTimeout(() => {
          setDone(true);
          dispatch({ type: 'SET_STAGE', stage: 'gate' });
        }, 500);
        return;
      }
      setProgress(steps[i][0]);
      setStep(steps[i][1]);
      i++;
    }, 400);

    return () => clearInterval(timer);
  }, [dispatch]);

  if (done) return null;

  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center justify-center text-[#ffe9d6] transition-opacity duration-[1100ms]"
      style={{
        background: 'radial-gradient(120% 120% at 50% 20%, #241f47 0%, #141031 55%, #0a0820 100%)',
        opacity: done ? 0 : 1,
        pointerEvents: done ? 'none' : 'auto',
      }}
    >
      {/* Monogram */}
      <div
        className="font-[family-name:var(--font-great-vibes)] text-[64px] text-[#f3ddb0] leading-none animate-pulse"
      >
        A&nbsp;&amp;&nbsp;R
      </div>

      {/* Title */}
      <div className="font-[family-name:var(--font-marcellus)] text-[15px] tracking-[0.42em] uppercase mt-[18px] mb-[30px] text-[#e9dcc4]">
        Welcome to Our World
      </div>

      {/* Progress bar */}
      <div className="w-[min(300px,70vw)] h-[2px] bg-[rgba(255,233,214,0.15)] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-[width] duration-300 ease-out"
          style={{
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #c9a04e, #f3ddb0)',
          }}
        />
      </div>

      {/* Percentage */}
      <div className="mt-[14px] text-[11px] tracking-[0.3em] text-[rgba(255,233,214,0.7)]">
        {progress}%
      </div>

      {/* Step */}
      <div className="mt-[6px] text-[12px] font-light tracking-[0.08em] text-[rgba(255,233,214,0.5)] h-4">
        {step}
      </div>
    </div>
  );
}
