'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { AdaptiveDpr, PerformanceMonitor } from '@react-three/drei';
import { ACESFilmicToneMapping } from 'three';
import { useMobileDetect } from '@/app/lib/hooks/useMobileDetect';
import { Experience } from './Experience';

export default function Scene() {
  const device = useMobileDetect();

  return (
    <Canvas
      camera={{ position: [14, 7, 24], fov: 50, near: 0.1, far: 600 }}
      dpr={[1, device.maxDpr]}
      gl={{
        antialias: !device.isMobile,
        toneMapping: ACESFilmicToneMapping,
        toneMappingExposure: 1.0,
      }}
      shadows={device.isMobile ? false : true}
      performance={{ min: 0.5 }}
      style={{ position: 'fixed', inset: 0 }}
    >
      <PerformanceMonitor
        onDecline={() => {
          // Auto-handled by AdaptiveDpr
        }}
      >
        <AdaptiveDpr pixelated />
      </PerformanceMonitor>

      <Suspense fallback={null}>
        <Experience />
      </Suspense>
    </Canvas>
  );
}
