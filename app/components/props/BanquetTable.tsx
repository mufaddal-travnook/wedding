import { Chair } from './Chair';
import { Person as Person2 } from './person2';
import { rand } from '@/app/lib/seeded-random';
import { GUEST_VARIANTS } from './guest-variants';

/**
 * BanquetTable — a draped round table ringed with chairs, some occupied.
 *
 * Seat count is deliberately low: five chairs already read as a full table at
 * background distance, and every extra guest is ~20 meshes.
 */

interface BanquetTableProps {
  position: [number, number, number];
  /** Drives which seats are filled and what each guest wears. */
  seed: number;
  seats?: number;
  /** Fraction of seats left empty — higher means a sparser table. */
  emptySeatRatio?: number;
}

/** Distance from table centre to each chair. */
const SEAT_RADIUS = 1.75;
/** Chair seat top sits at y≈0.6; guests are lifted to meet it. */
const SEATED_Y = 0.32;

export function BanquetTable({
  position,
  seed,
  seats = 5,
  emptySeatRatio = 0.55,
}: BanquetTableProps) {
  return (
    <group position={position}>
      {/* Draped round table */}
      <mesh position={[0, 0.38, 0]} castShadow>
        <cylinderGeometry args={[0.95, 1.05, 0.76, 14]} />
        <meshStandardMaterial color="#fdf8f2" roughness={0.75} />
      </mesh>
      <mesh position={[0, 0.78, 0]}>
        <cylinderGeometry args={[1.08, 1.08, 0.06, 16]} />
        <meshStandardMaterial color="#f3e9d6" roughness={0.6} />
      </mesh>

      {/* Floral centrepiece */}
      <mesh position={[0, 0.98, 0]}>
        <sphereGeometry args={[0.26, 8, 8]} />
        <meshStandardMaterial color="#f05a8e" roughness={0.65} />
      </mesh>

      {Array.from({ length: seats }, (_, i) => {
        const angle = (i / seats) * Math.PI * 2;
        const x = Math.cos(angle) * SEAT_RADIUS;
        const z = Math.sin(angle) * SEAT_RADIUS;
        const occupied = rand(seed, i) > emptySeatRatio;

        return (
          <group key={i}>
            <Chair position={[x, 0, z]} rotation={[0, -angle + Math.PI / 2, 0]} />
            {occupied && (
              <Person2
                variant={GUEST_VARIANTS[Math.floor(rand(seed, i + 40) * GUEST_VARIANTS.length)]}
                position={[x, SEATED_Y, z]}
                // Facing the table, i.e. opposite the chair's outward normal.
                rotation={[0, -angle - Math.PI / 2, 0]}
                scale={1.35}
              />
            )}
          </group>
        );
      })}
    </group>
  );
}
