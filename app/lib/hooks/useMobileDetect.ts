'use client';

import { useState, useEffect } from 'react';

export interface DeviceProfile {
  isMobile: boolean;
  maxDpr: number;
  shadowMapSize: number;
  maxParticles: number;
  enableFireworks: boolean;
}

export function useMobileDetect(): DeviceProfile {
  const [profile, setProfile] = useState<DeviceProfile>({
    isMobile: false,
    maxDpr: 1.5,
    shadowMapSize: 1024,
    maxParticles: 200,
    enableFireworks: true,
  });

  useEffect(() => {
    const isMobile = /Android|iPhone|iPad|iPod|webOS|BlackBerry/i.test(navigator.userAgent)
      || window.innerWidth < 768;

    setProfile({
      isMobile,
      maxDpr: isMobile ? 1 : 1.5,
      shadowMapSize: isMobile ? 512 : 1024,
      maxParticles: isMobile ? 80 : 200,
      enableFireworks: !isMobile || window.innerWidth > 480,
    });
  }, []);

  return profile;
}
