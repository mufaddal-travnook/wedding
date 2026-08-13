import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, BufferGeometry, Float32BufferAttribute, PointsMaterial, AdditiveBlending, Color } from 'three';

const COLORS = ['#ffd27a', '#f05a8e', '#9ecbff', '#9ed64f', '#e8b0ff'];
const PARTICLE_COUNT = 60;
const MAX_FIREWORKS = 4;

interface Burst {
  active: boolean;
  originX: number;
  originY: number;
  originZ: number;
  life: number;
  color: Color;
  velocities: Float32Array;
}

interface FireworksProps {
  zoneZ: number;
  enabled?: boolean;
}

export function Fireworks({ zoneZ, enabled = true }: FireworksProps) {
  const groupRef = useRef<(Points | null)[]>([]);
  const burstsRef = useRef<Burst[]>(
    Array.from({ length: MAX_FIREWORKS }, () => ({
      active: false,
      originX: 0, originY: 0, originZ: 0,
      life: 0,
      color: new Color('#ffd27a'),
      velocities: new Float32Array(PARTICLE_COUNT * 3),
    }))
  );
  const timerRef = useRef(1 + Math.random() * 2);

  useFrame((state, delta) => {
    if (!enabled) return;

    // Spawn timer
    timerRef.current -= delta;
    if (timerRef.current <= 0) {
      timerRef.current = 0.8 + Math.random() * 1.5;

      // Find inactive burst
      const burst = burstsRef.current.find((b) => !b.active);
      if (burst) {
        burst.active = true;
        burst.life = 0;
        burst.originX = (Math.random() - 0.5) * 30;
        burst.originY = 14 + Math.random() * 10;
        burst.originZ = zoneZ + (Math.random() - 0.5) * 20;
        burst.color.set(COLORS[Math.floor(Math.random() * COLORS.length)]);

        // Random spherical velocities
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(Math.random() * 2 - 1);
          const speed = 2.5 + Math.random() * 4;
          burst.velocities[i * 3] = Math.sin(phi) * Math.cos(theta) * speed;
          burst.velocities[i * 3 + 1] = Math.cos(phi) * speed;
          burst.velocities[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * speed;
        }
      }
    }

    // Update each burst
    burstsRef.current.forEach((burst, bi) => {
      const pts = groupRef.current[bi];
      if (!pts || !burst.active) {
        if (pts) (pts.material as PointsMaterial).opacity = 0;
        return;
      }

      burst.life += delta;
      const posAttr = pts.geometry.attributes.position;

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        // Apply gravity
        burst.velocities[i * 3 + 1] -= 2.8 * delta;

        const px = burst.originX + burst.velocities[i * 3] * burst.life;
        const py = burst.originY + burst.velocities[i * 3 + 1] * burst.life;
        const pz = burst.originZ + burst.velocities[i * 3 + 2] * burst.life;

        posAttr.setXYZ(i, px, py, pz);
      }
      posAttr.needsUpdate = true;

      const mat = pts.material as PointsMaterial;
      mat.color.copy(burst.color);
      mat.opacity = Math.max(0, 1 - burst.life / 2.2);

      if (burst.life > 2.2) {
        burst.active = false;
        mat.opacity = 0;
      }
    });
  });

  return (
    <group>
      {Array.from({ length: MAX_FIREWORKS }).map((_, i) => {
        const geo = new BufferGeometry();
        const pos = new Float32Array(PARTICLE_COUNT * 3);
        geo.setAttribute('position', new Float32BufferAttribute(pos, 3));

        return (
          <points
            key={i}
            ref={(el: any) => { groupRef.current[i] = el; }}
            geometry={geo}
          >
            <pointsMaterial
              size={0.35}
              transparent
              opacity={0}
              sizeAttenuation
              blending={AdditiveBlending}
              depthWrite={false}
            />
          </points>
        );
      })}
    </group>
  );
}
