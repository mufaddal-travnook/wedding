import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Color } from 'three';
import type { HemisphereLight, DirectionalLight, AmbientLight } from 'three';
import { LIGHTING } from '@/app/config/lighting-presets';

interface SceneLightsProps {
  eventId: string;
  eventZoneZ: number;
}

export function SceneLights({ eventId, eventZoneZ }: SceneLightsProps) {
  const hemiRef = useRef<HemisphereLight>(null);
  const sunRef = useRef<DirectionalLight>(null);
  const ambRef = useRef<AmbientLight>(null);
  const targetRef = useRef(eventId);
  const transitionRef = useRef({ t: 1, from: eventId, to: eventId });

  if (targetRef.current !== eventId) {
    transitionRef.current = { t: 0, from: targetRef.current, to: eventId };
    targetRef.current = eventId;
  }

  useFrame((_, delta) => {
    const tr = transitionRef.current;
    const from = LIGHTING[tr.from] ?? LIGHTING.entrance;
    const to = LIGHTING[tr.to] ?? LIGHTING.entrance;

    if (tr.t < 1) {
      tr.t = Math.min(1, tr.t + delta * 0.18); // ~5.5s transition for smooth crossfade
    }

    const k = tr.t;
    const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;

    const hemi = hemiRef.current;
    const sun = sunRef.current;
    const amb = ambRef.current;
    if (!hemi || !sun || !amb) return;

    // Hemisphere
    hemi.color.copy(new Color(from.hemiSky)).lerp(new Color(to.hemiSky), e);
    hemi.groundColor.copy(new Color(from.hemiGround)).lerp(new Color(to.hemiGround), e);
    hemi.intensity = from.hemiIntensity + (to.hemiIntensity - from.hemiIntensity) * e;

    // Directional (sun)
    sun.color.copy(new Color(from.sunColor)).lerp(new Color(to.sunColor), e);
    sun.intensity = from.sunIntensity + (to.sunIntensity - from.sunIntensity) * e;

    // Sun follows current zone for crisp shadows
    sun.position.set(24, 34, eventZoneZ + 14);
    if (sun.target) {
      sun.target.position.set(0, 0, eventZoneZ);
      sun.target.updateMatrixWorld();
    }

    // Ambient
    amb.intensity = from.ambientIntensity + (to.ambientIntensity - from.ambientIntensity) * e;
  });

  const preset = LIGHTING[eventId] ?? LIGHTING.entrance;

  return (
    <>
      <hemisphereLight
        ref={hemiRef}
        args={[preset.hemiSky, preset.hemiGround, preset.hemiIntensity]}
      />
      <directionalLight
        ref={sunRef}
        color={preset.sunColor}
        intensity={preset.sunIntensity}
        position={[24, 34, eventZoneZ + 14]}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-45}
        shadow-camera-right={45}
        shadow-camera-top={45}
        shadow-camera-bottom={-45}
        shadow-camera-far={140}
      >
        <group position={[0, 0, eventZoneZ]} />
      </directionalLight>
      <ambientLight ref={ambRef} intensity={preset.ambientIntensity} />
    </>
  );
}
