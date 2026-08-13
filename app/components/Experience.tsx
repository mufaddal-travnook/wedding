'use client';

import { useRef, useCallback, useEffect } from 'react';
import type { Group } from 'three';
import { useJourney, useJourneyDispatch } from '@/app/lib/hooks/useJourneyState';
import { defaultConfig } from '@/app/config/default-config';
import { getSideEvents } from '@/app/lib/hooks/useSideConfig';
import { registerDriveHandler } from '@/app/lib/journey-bridge';
import { Ground } from './world/Ground';
import { Road } from './world/Road';
import { RoadsideDecor } from './world/RoadsideDecor';
import { SceneLights } from './lighting/SceneLights';
import { SceneFog } from './world/Fog';
import { WeddingCar } from './car/WeddingCar';
import { useCarDrive } from './car/useCarDrive';
import { ContactShadows } from '@react-three/drei';
import { CameraController } from './camera/CameraController';
import { SkyAtmosphere } from './sky/SkyAtmosphere';
import { ZoneLoader } from './zones/ZoneLoader';
import { CarSoundSync } from './audio/CarSoundSync';

export function Experience() {
  const journey = useJourney();
  const dispatch = useJourneyDispatch();
  const config = defaultConfig;
  const events = getSideEvents(journey.side);
  const currentEvent = events[journey.eventIdx];

  const carRef = useRef<Group>(null);
  const speedMul = config.car.speedMultiplier;
  const { driveRef, startDrive } = useCarDrive(carRef, speedMul);

  const handleDriveTo = useCallback((targetIdx: number) => {
    if (driveRef.current.active) return;
    const fromZ = events[journey.eventIdx].zoneZ + 9;
    const toZ = events[targetIdx].zoneZ + 9;
    dispatch({ type: 'DRIVE_TO', idx: targetIdx });
    startDrive(fromZ, toZ, targetIdx);

    const dist = Math.abs(toZ - fromZ);
    const duration = Math.max(3200, dist * 62) / speedMul;
    setTimeout(() => {
      dispatch({ type: 'ARRIVE' });
    }, duration + 800);
  }, [journey.eventIdx, events, dispatch, startDrive, driveRef, speedMul]);

  // Expose the drive handler to the DOM overlay, which lives in a separate root.
  useEffect(() => registerDriveHandler(handleDriveTo), [handleDriveTo]);

  return (
    <>
      <SceneFog eventId={currentEvent.id} />
      <SceneLights eventId={currentEvent.id} eventZoneZ={currentEvent.zoneZ} />
      <Ground events={events} />
      <Road events={events} />

      {/* Trees, flowers, lanterns, street lamps along the road */}
      <RoadsideDecor events={events} />

      {/* Per-zone atmosphere — renders both previous + current during driving for crossfade */}
      {journey.stage === 'driving' && journey.previousEventIdx !== journey.eventIdx && (
        <SkyAtmosphere
          eventId={events[journey.previousEventIdx].id}
          zoneZ={events[journey.previousEventIdx].zoneZ}
        />
      )}
      <SkyAtmosphere eventId={currentEvent.id} zoneZ={currentEvent.zoneZ} />

      {/* Zone buildings, decorations, characters */}
      <ZoneLoader events={events} currentIdx={journey.eventIdx} />

      {/* Car */}
      {/* Rest pose faces -Z, down the road. `useCarDrive` overrides rotation.y
          to match the travel direction once the car starts moving. */}
      <group
        ref={carRef}
        position={[0, 0, events[0].zoneZ + 9]}
        rotation={[0, Math.PI, 0]}
      >
        <WeddingCar
          color={config.car.color}
          trimColor={config.car.trimColor}
          decorations={config.car.decorations}
        />
        <ContactShadows
          position={[0, 0.01, 0]}
          opacity={0.45}
          scale={6}
          blur={2.5}
          far={3}
        />
      </group>

      <CarSoundSync driveState={driveRef} />

      <CameraController
        eventIdx={journey.eventIdx}
        events={events}
        driveState={driveRef}
        carRef={carRef}
        cameraMode={journey.cameraMode}
      />
    </>
  );
}
