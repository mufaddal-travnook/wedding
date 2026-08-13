'use client';

import { useState } from 'react';
import { useJourney, useJourneyDispatch } from '@/app/lib/hooks/useJourneyState';

export function NameModal() {
  const { stage } = useJourney();
  const dispatch = useJourneyDispatch();
  const [name, setName] = useState('');

  if (stage !== 'naming') return null;

  const begin = () => {
    const clean = name.trim().replace(/[<>&]/g, '') || 'Friend';
    dispatch({ type: 'SET_GUEST', name: clean });
    dispatch({ type: 'SET_STAGE', stage: 'event' });
  };

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-[rgba(13,10,30,0.45)] backdrop-blur-[10px] animate-fadeIn">
      <div className="text-center px-[30px] max-w-[440px] w-full animate-slideUp">
        <div className="text-[11px] tracking-[0.4em] uppercase text-[#e8b86d]">
          Before we set off
        </div>
        <h2 className="font-[family-name:var(--font-marcellus)] text-[clamp(26px,5vw,34px)] text-white mt-3 mb-[6px] font-normal">
          May we know your name?
        </h2>
        <p className="text-white/80 font-light text-[14px] tracking-[0.04em] mb-7">
          So every invitation along the way is written just for you.
        </p>
        <input
          type="text"
          maxLength={30}
          autoComplete="off"
          placeholder="Your lovely name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && begin()}
          className="w-full bg-transparent border-0 border-b border-white/40 text-white font-[family-name:var(--font-marcellus)] text-[22px] text-center py-[10px] px-[6px] outline-none transition-colors duration-300 caret-[#e8b86d] focus:border-b-[#e8b86d] placeholder:text-white/35 placeholder:text-[17px] placeholder:font-[family-name:var(--font-jost)] placeholder:font-light placeholder:tracking-[0.12em]"
          autoFocus
        />
        <button
          onClick={begin}
          className="mt-8 border-0 bg-gradient-to-br from-[#c9a04e] to-[#e8b86d] text-[#241f47] px-[42px] py-[14px] rounded-full text-[13px] tracking-[0.28em] uppercase cursor-pointer transition-all duration-350 font-medium hover:translate-y-[-2px] hover:shadow-[0_10px_30px_rgba(201,160,78,0.4)] focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-[3px]"
        >
          Start the journey
        </button>
      </div>
    </div>
  );
}
