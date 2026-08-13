'use client';

import { useJourney, useJourneyDispatch } from '@/app/lib/hooks/useJourneyState';

export function StartScreen() {
  const { stage } = useJourney();
  const dispatch = useJourneyDispatch();

  if (stage !== 'gate') return null;

  return (
    <div className="fixed left-0 right-0 bottom-[12vh] z-[8] flex flex-col items-center gap-[14px] animate-fadeIn">
      <button
        onClick={() => dispatch({ type: 'SET_STAGE', stage: 'naming' })}
        className="relative overflow-hidden border border-white/50 bg-white/[0.12] backdrop-blur-[10px] text-white px-[46px] py-4 rounded-full text-[14px] tracking-[0.34em] uppercase cursor-pointer transition-all duration-400 hover:bg-white/25 hover:border-[#f3ddb0] hover:tracking-[0.4em] focus-visible:outline-2 focus-visible:outline-[#c9a04e] focus-visible:outline-offset-[3px]"
      >
        Begin
        <span className="absolute inset-[-2px] rounded-full bg-[linear-gradient(120deg,transparent_30%,rgba(255,235,190,0.35)_50%,transparent_70%)] translate-x-[-100%] animate-shine" />
      </button>
      <div className="text-[11px] tracking-[0.24em] uppercase text-white/65 [text-shadow:0_1px_8px_rgba(0,0,0,0.4)]">
        A little journey awaits you
      </div>
    </div>
  );
}
