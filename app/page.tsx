'use client';

import dynamic from 'next/dynamic';
import { JourneyProvider } from '@/app/lib/hooks/useJourneyState';
import { SkyGradient } from '@/app/components/sky/SkyGradient';
import { Loader } from '@/app/components/ui/Loader';
import { StartScreen } from '@/app/components/ui/StartScreen';
import { NameModal } from '@/app/components/ui/NameModal';
import { BrandHeader } from '@/app/components/ui/BrandHeader';
import { ProgressDots } from '@/app/components/ui/ProgressDots';
import { SoundToggle } from '@/app/components/ui/SoundToggle';
import { JourneyOverlay } from '@/app/components/ui/JourneyOverlay';
import { DriveCaption } from '@/app/components/ui/DriveCaption';
import { KeyboardNav } from '@/app/components/ui/KeyboardNav';
import { AudioProvider, AudioController } from '@/app/components/audio/AudioEngine';

const Scene = dynamic(() => import('@/app/components/Scene'), {
  ssr: false,
});

export default function Home() {
  return (
    <JourneyProvider>
      <AudioProvider>
        {/* Layers: sky → 3D canvas → UI overlays */}
        <SkyGradient />
        <Scene />

        {/* Audio auto-controller — wires to journey state */}
        <AudioController />

        {/* UI flow: Loader → Start → Name → Journey */}
        <Loader />
        <StartScreen />
        <NameModal />
        <BrandHeader />
        <ProgressDots />
        <SoundToggle />
        <DriveCaption />

        {/* Details modal / gift box, explore controls and bottom navigation */}
        <JourneyOverlay />

        <KeyboardNav />
      </AudioProvider>
    </JourneyProvider>
  );
}
