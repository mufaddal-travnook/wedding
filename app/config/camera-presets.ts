import type { CameraPreset } from './types';

export const CAMERA_VIEWS: Record<string, CameraPreset> = {
  entrance: {
    position: [13, 6.5, 22],
    lookAt: [0, 3.6, 4],
    flyDuration: 2400,
  },
  nikah: {
    position: [12, 6, 16],
    lookAt: [-9, 3, -1],
    flyDuration: 2600,
  },
  mehendi: {
    position: [-11, 6, 15],
    lookAt: [11, 2.6, 1],
    flyDuration: 2600,
  },
  reception: {
    position: [-13, 6.5, 18],
    lookAt: [8, 3, 0],
    flyDuration: 2800,
  },
};
