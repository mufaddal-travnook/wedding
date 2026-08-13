import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Color, FogExp2 } from 'three';
import { LIGHTING } from '@/app/config/lighting-presets';

// Convert linear fog near/far to exponential density
function fogDensity(near: number, far: number): number {
  // Approximate: density such that at 'far' distance, fog is ~95% opaque
  return 2.5 / far;
}

interface SceneFogProps {
  eventId: string;
}

export function SceneFog({ eventId }: SceneFogProps) {
  const { scene } = useThree();
  const targetRef = useRef(eventId);
  const transitionRef = useRef({ t: 1, from: eventId, to: eventId });

  if (targetRef.current !== eventId) {
    transitionRef.current = { t: 0, from: targetRef.current, to: eventId };
    targetRef.current = eventId;
  }

  useFrame((_, delta) => {
    const tr = transitionRef.current;
    const fromPreset = LIGHTING[tr.from] ?? LIGHTING.entrance;
    const toPreset = LIGHTING[tr.to] ?? LIGHTING.entrance;

    if (tr.t < 1) {
      tr.t = Math.min(1, tr.t + delta * 0.18); // ~5.5s transition for smooth driving crossfade
    }

    const k = tr.t;
    const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;

    if (!scene.fog) {
      scene.fog = new FogExp2(fromPreset.fog, fogDensity(fromPreset.fogNear, fromPreset.fogFar));
    }

    const fog = scene.fog as FogExp2;
    const fromColor = new Color(fromPreset.fog);
    const toColor = new Color(toPreset.fog);

    fog.color.copy(fromColor).lerp(toColor, e);

    const fromDensity = fogDensity(fromPreset.fogNear, fromPreset.fogFar);
    const toDensity = fogDensity(toPreset.fogNear, toPreset.fogFar);
    fog.density = fromDensity + (toDensity - fromDensity) * e;
  });

  return null;
}
