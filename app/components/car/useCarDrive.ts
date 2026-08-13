import { useRef, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group } from 'three';

export interface DriveState {
  active: boolean;
  fromZ: number;
  toZ: number;
  t0: number;
  duration: number;
  targetIdx: number;
  progress: number;  // 0-1
  speed: number;     // 0-1 (bell curve)
}

export function useCarDrive(carRef: React.RefObject<Group | null>, speedMultiplier = 1.0) {
  const driveRef = useRef<DriveState>({
    active: false,
    fromZ: 12,
    toZ: 12,
    t0: 0,
    duration: 1,
    targetIdx: 0,
    progress: 0,
    speed: 0,
  });

  const startDrive = useCallback((fromZ: number, toZ: number, targetIdx: number) => {
    const dist = Math.abs(toZ - fromZ);
    const baseDuration = Math.max(3200, dist * 62);
    const duration = baseDuration / speedMultiplier;

    driveRef.current = {
      active: true,
      fromZ,
      toZ,
      t0: performance.now(),
      duration,
      targetIdx,
      progress: 0,
      speed: 0,
    };
  }, []);

  useFrame((state) => {
    const drive = driveRef.current;
    const car = carRef.current;
    if (!drive.active || !car) return;

    const elapsed = performance.now() - drive.t0;
    const k = Math.min(1, elapsed / drive.duration);

    // Quintic ease in-out for smooth start/stop
    const e = k < 0.5
      ? 16 * k * k * k * k * k
      : 1 - Math.pow(-2 * k + 2, 5) / 2;

    // Bell curve speed (0→1→0)
    const speed = Math.sin(Math.min(k, 1) * Math.PI);

    drive.progress = k;
    drive.speed = speed;

    // Position
    car.position.z = drive.fromZ + (drive.toZ - drive.fromZ) * e;
    car.position.y = Math.abs(Math.sin(state.clock.elapsedTime * 22)) * 0.02 * speed; // engine judder

    // Face direction of travel
    car.rotation.y = drive.toZ < drive.fromZ ? Math.PI : 0;

    // Spin wheels
    const spinDir = drive.toZ < drive.fromZ ? 1 : -1;
    car.traverse((child) => {
      if (child.name === 'wheel') {
        child.rotation.x += speed * spinDir * state.clock.getDelta() * 18;
      }
    });

    if (k >= 1) {
      drive.active = false;
      drive.speed = 0;
    }
  });

  return { driveRef, startDrive };
}
