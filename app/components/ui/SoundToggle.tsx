'use client';

import { useJourney, useJourneyDispatch } from '@/app/lib/hooks/useJourneyState';

export function SoundToggle() {
  const { soundOn, stage } = useJourney();
  const dispatch = useJourneyDispatch();

  if (stage === 'loading') return null;

  return (
    <button
      onClick={() => dispatch({ type: 'TOGGLE_SOUND' })}
      className="fixed top-3 right-3 sm:top-5 sm:right-5 z-[7] w-9 h-9 sm:w-[42px] sm:h-[42px] rounded-full border border-white/35 bg-[rgba(20,16,40,0.35)] backdrop-blur-[8px] text-white text-[14px] sm:text-[16px] cursor-pointer transition-colors duration-300 hover:bg-[rgba(20,16,40,0.6)] focus-visible:outline-2 focus-visible:outline-[#c9a04e] focus-visible:outline-offset-[2px]"
      style={{ opacity: soundOn ? 1 : 0.55 }}
      aria-label="Toggle sound"
      title="Sound"
    >
      {soundOn ? '♪' : '𝄽'}
    </button>
  );
}
