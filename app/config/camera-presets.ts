import type { CameraPreset } from './types';

export const CAMERA_VIEWS: Record<string, CameraPreset> = {
  entrance: {
    position: [10, 5.5, 18],    // closer, lower — gate fills frame
    lookAt: [0, 3, 2],
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
