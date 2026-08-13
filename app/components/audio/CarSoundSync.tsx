'use client';

import { useFrame } from '@react-three/fiber';
import { useAudio } from './AudioEngine';
import type { DriveState } from '../car/useCarDrive';

interface CarSoundSyncProps {
  driveState: React.RefObject<DriveState>;
}

export function CarSoundSync({ driveState }: CarSoundSyncProps) {
  const audio = useAudio();

  useFrame(() => {
    if (!audio || !driveState.current.active) return;
    audio.carDrive(driveState.current.speed);
  });

  return null;
}
