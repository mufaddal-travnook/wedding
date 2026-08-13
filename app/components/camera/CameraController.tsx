import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3, type Group } from 'three';
import { OrbitControls } from '@react-three/drei';
import type { DriveState } from '../car/useCarDrive';
import type { CameraMode } from '@/app/config/types';

interface CameraControllerProps {
  eventIdx: number;
  events: { zoneZ: number; camera: { position: [number, number, number]; lookAt: [number, number, number]; flyDuration?: number } }[];
  driveState: React.RefObject<DriveState>;
  carRef: React.RefObject<Group | null>;
  cameraMode: CameraMode;
}

export function CameraController({ eventIdx, events, driveState, carRef, cameraMode }: CameraControllerProps) {
  const { camera } = useThree();
  const lookAtTarget = useRef(new Vector3(0, 3.4, 5));
  const orbitRef = useRef<any>(null);
  const flyRef = useRef<{
    active: boolean;
    fromPos: Vector3;
    toPos: Vector3;
    fromLook: Vector3;
    toLook: Vector3;
    t0: number;
    duration: number;
  } | null>(null);
  const lastEventIdx = useRef(-1);

  // When switching from explore back to guided, trigger a fly to current event framing
  const prevModeRef = useRef(cameraMode);
  useEffect(() => {
    if (prevModeRef.current === 'explore' && cameraMode === 'guided') {
      // Re-trigger fly to current event
      lastEventIdx.current = -1;
    }
    prevModeRef.current = cameraMode;
  }, [cameraMode]);

  // Trigger fly when event changes and not driving and in guided mode
  if (cameraMode === 'guided' && lastEventIdx.current !== eventIdx && !driveState.current.active) {
    const event = events[eventIdx];
    if (event) {
      const zoneZ = event.zoneZ;
      const cam = event.camera;
      flyRef.current = {
        active: true,
        fromPos: camera.position.clone(),
        toPos: new Vector3(cam.position[0], cam.position[1], zoneZ + cam.position[2]),
        fromLook: lookAtTarget.current.clone(),
        toLook: new Vector3(cam.lookAt[0], cam.lookAt[1], zoneZ + cam.lookAt[2]),
        t0: performance.now(),
        duration: cam.flyDuration ?? 2400,
      };
    }
    lastEventIdx.current = eventIdx;
  }

  // Update orbit controls target when switching to explore
  useEffect(() => {
    if (cameraMode === 'explore' && orbitRef.current) {
      const event = events[eventIdx];
      if (event) {
        const cam = event.camera;
        orbitRef.current.target.set(cam.lookAt[0], cam.lookAt[1], event.zoneZ + cam.lookAt[2]);
        orbitRef.current.update();
      }
    }
  }, [cameraMode, eventIdx, events]);

  useFrame(() => {
    // In explore mode, OrbitControls handle everything
    if (cameraMode === 'explore') return;

    const drive = driveState.current;

    // Chase camera during driving
    if (drive.active && carRef.current) {
      const car = carRef.current;
      const goingForward = drive.toZ < drive.fromZ;

      const behindDist = goingForward ? 10 : -10;
      const sideOffset = 4;
      const heightOffset = 4.5;

      const chasePos = new Vector3(
        car.position.x + sideOffset,
        car.position.y + heightOffset,
        car.position.z + behindDist
      );
      const chaseLook = new Vector3(
        car.position.x,
        car.position.y + 1.0,
        car.position.z + (goingForward ? -5 : 5)
      );

      camera.position.lerp(chasePos, 0.12);
      lookAtTarget.current.lerp(chaseLook, 0.14);
      camera.lookAt(lookAtTarget.current);

      flyRef.current = null;
      lastEventIdx.current = -1;
      return;
    }

    // Fly camera to event framing
    const fly = flyRef.current;
    if (fly && fly.active) {
      const elapsed = performance.now() - fly.t0;
      const k = Math.min(1, elapsed / fly.duration);
      const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;

      camera.position.lerpVectors(fly.fromPos, fly.toPos, e);
      lookAtTarget.current.lerpVectors(fly.fromLook, fly.toLook, e);
      camera.lookAt(lookAtTarget.current);

      if (k >= 1) fly.active = false;
      return;
    }

    camera.lookAt(lookAtTarget.current);
  });

  // Compute orbit bounds for current zone
  const currentEvent = events[eventIdx];
  const orbitTarget = currentEvent
    ? [currentEvent.camera.lookAt[0], currentEvent.camera.lookAt[1], currentEvent.zoneZ + currentEvent.camera.lookAt[2]] as [number, number, number]
    : [0, 3, 0] as [number, number, number];

  return (
    <>
      {cameraMode === 'explore' && (
        <OrbitControls
          ref={orbitRef}
          makeDefault
          enableDamping
          dampingFactor={0.08}
          minDistance={5}
          maxDistance={35}
          maxPolarAngle={Math.PI / 2.05}
          minPolarAngle={0.2}
          target={orbitTarget}
          enablePan
          panSpeed={0.5}
          rotateSpeed={0.6}
          zoomSpeed={0.8}
        />
      )}
    </>
  );
}
