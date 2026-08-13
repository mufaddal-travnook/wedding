'use client';

import { useEffect } from 'react';
import { useJourney } from '@/app/lib/hooks/useJourneyState';

export function KeyboardNav() {
  const { stage } = useJourney();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (stage !== 'event') return;

      if (e.key === 'ArrowRight') {
        const nextBtn = document.querySelector('[data-nav="next"]') as HTMLButtonElement;
        nextBtn?.click();
      }
      if (e.key === 'ArrowLeft') {
        const prevBtn = document.querySelector('[data-nav="prev"]') as HTMLButtonElement;
        prevBtn?.click();
      }
      if (e.key === 'Escape') {
        // Close explore mode or modals
        const backBtn = document.querySelector('[data-nav="explore-back"]') as HTMLButtonElement;
        backBtn?.click();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [stage]);

  return null;
}
