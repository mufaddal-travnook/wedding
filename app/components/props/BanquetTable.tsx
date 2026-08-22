import { Chair } from './Chair';
import { cylinderGeo, sphereGeo, stdMat } from '@/app/lib/three-cache';

/**
 * BanquetTable — a draped round table ringed with chairs.
 *
 * Seated guests are NOT drawn here: `RoadsideDecor` collects them into a
 * single `<GuestCrowd>` so the whole crowd batches into a few instanced draw
 * calls. Seat occupancy lives in `crowd-layout.ts`, shared between the two so
 * chairs and guests always agree on which seats are filled.
 */

interface BanquetTableProps {
  position: [number, number, number];
  seats?: number;
}

/** Distance from table centre to each chair. */
const SEAT_RADIUS = 1.75;

export function BanquetTable({ position, seats = 5 }: BanquetTableProps) {
  return (
    <group position={position}>
      {/* Draped round table */}
      <mesh
        position={[0, 0.38, 0]}
        castShadow
        geometry={cylinderGeo(0.95, 1.05, 0.76, 14)}
        material={stdMat({ color: '#fdf8f2', roughness: 0.75 })}
      />
      <mesh
        position={[0, 0.78, 0]}
        geometry={cylinderGeo(1.08, 1.08, 0.06, 16)}
        material={stdMat({ color: '#f3e9d6', roughness: 0.6 })}
      />

      {/* Floral centrepiece */}
      <mesh
        position={[0, 0.98, 0]}
        geometry={sphereGeo(0.26, 8, 8)}
        material={stdMat({ color: '#f05a8e', roughness: 0.65 })}
      />

      {Array.from({ length: seats }, (_, i) => {
        const angle = (i / seats) * Math.PI * 2;
        return (
          <Chair
            key={i}
            position={[
              Math.cos(angle) * SEAT_RADIUS,
              0,
              Math.sin(angle) * SEAT_RADIUS,
            ]}
            rotation={[0, -angle + Math.PI / 2, 0]}
          />
        );
      })}
    </group>
  );
}
