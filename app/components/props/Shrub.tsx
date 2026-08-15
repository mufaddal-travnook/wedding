import { useMemo } from 'react';
import { Color } from 'three';
import { rand } from '@/app/lib/seeded-random';

/**
 * Shrub — a grounded, clustered bush.
 *
 * A main lobe plus two side lobes, all squashed faceted icosahedrons with
 * slight per-lobe color variation, sunk into the terrain so the shrub sits
 * ON the ground instead of balancing on it. Optional blossoms for the
 * stretches near each venue.
 *
 * Usage:
 *   <Shrub position={[x, 0, z]} scale={0.8} color="#5f9463" />
 *   <Shrub position={[x, 0, z]} scale={0.8} blossomColor="#f3c6c9" />
 */

interface ShrubProps {
  position: [number, number, number];
  scale?: number;
  color?: string;
  blossomColor?: string;
  /** Defaults to a hash of `position`, so each shrub differs but stays stable. */
  seed?: number;
}

export function Shrub({
  position,
  scale: s = 1,
  color = '#5d8f57',
  blossomColor,
  seed,
}: ShrubProps) {
  const shape = useMemo(() => {
    const sd = seed ?? position[0] * 7.31 + position[2] * 3.77 + 5.5;
    const base = new Color(color);
    const jitter = (salt: number) =>
      '#' +
      base
        .clone()
        .offsetHSL(0, (rand(sd, salt) - 0.5) * 0.08, (rand(sd, salt + 1) - 0.5) * 0.12)
        .getHexString();

    const lobes: {
      pos: [number, number, number];
      size: number;
      squash: number;
      color: string;
    }[] = [
      { pos: [0, 0.5, 0], size: 1.0, squash: 0.72, color: jitter(10) },
      {
        pos: [0.55 + rand(sd, 20) * 0.2, 0.32, (rand(sd, 21) - 0.5) * 0.5],
        size: 0.62 + rand(sd, 22) * 0.15,
        squash: 0.68,
        color: jitter(30),
      },
      {
        pos: [-0.5 - rand(sd, 40) * 0.2, 0.3, (rand(sd, 41) - 0.5) * 0.5],
        size: 0.55 + rand(sd, 42) * 0.15,
        squash: 0.65,
        color: jitter(50),
      },
    ];

    const blossoms = blossomColor
      ? Array.from({ length: 5 }, (_, i) => {
          const a = rand(sd, 70 + i) * Math.PI * 2;
          const l = lobes[i % lobes.length];
          return {
            pos: [
              l.pos[0] + Math.cos(a) * l.size * 0.8,
              l.pos[1] + l.size * l.squash * (0.5 + rand(sd, 80 + i) * 0.4),
              l.pos[2] + Math.sin(a) * l.size * 0.8,
            ] as [number, number, number],
            size: 0.07 + rand(sd, 90 + i) * 0.04,
          };
        })
      : [];

    return { lobes, rotY: rand(sd, 60) * Math.PI * 2, blossoms };
  }, [seed, position, color, blossomColor]);

  return (
    <group position={position} rotation={[0, shape.rotY, 0]} scale={s}>
      {shape.lobes.map((l, i) => (
        <mesh key={i} position={l.pos} scale={[1, l.squash, 1]} castShadow>
          <icosahedronGeometry args={[l.size, 1]} />
          <meshStandardMaterial color={l.color} roughness={0.85} flatShading />
        </mesh>
      ))}
      {shape.blossoms.map((b, i) => (
        <mesh key={`b${i}`} position={b.pos}>
          <icosahedronGeometry args={[b.size, 0]} />
          <meshStandardMaterial color={blossomColor} roughness={0.55} />
        </mesh>
      ))}
    </group>
  );
}
