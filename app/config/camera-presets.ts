import type { CameraPreset } from './types';

export const CAMERA_VIEWS: Record<string, CameraPreset> = {
  entrance: {
    // Pulled back and raised so the full gate arch (7.8 tall) and the car both
    // sit in frame. Looking at z=6 — between the car (z=9) and the gate
    // (z=6.5) — keeps the car in the foreground and the gate right behind it,
    // instead of aiming past the car at empty road.
    position: [9, 6, 20],
    lookAt: [0, 3.2, 6],
    flyDuration: 2400,
  },
  nikah: {
    position: [8, 5, 14],       // angled to see mandap + carpet approach
    lookAt: [-8, 3, -1],
    flyDuration: 2600,
  },
  mehendi: {
    position: [-8, 5, 12],      // opposite side, see gazebo + swing
    lookAt: [10, 2.5, 1],
    flyDuration: 2600,
  },
  reception: {
    position: [-8, 5.5, 16],    // see stage + dance floor + string lights
    lookAt: [6, 3, 0],
    flyDuration: 2800,
  },
};
