'use client';

import { useJourney } from '@/app/lib/hooks/useJourneyState';
import { Person as Person2 } from './person2';

/**
 * Greeter — a single guest in a white gown who welcomes the visitor at the
 * gate, waving until they press "Let's Begin".
 *
 * Only visible during the `gate` stage (i.e. after the loader finishes and
 * before the name modal), so she reads as the host receiving you at the door
 * rather than as set dressing.
 *
 * Rendered inside <Entrance>, so `position` is zone-local.
 */
export function Greeter() {
  const { stage } = useJourney();

  if (stage !== 'gate') return null;

  return (
    <Person2
      variant="hijabi"
      clothColor="#fdfbf6"
      accentColor="#c9a04e"
      /**
       * Placed just past the car (z=9) and beside the gate, so from the
       * entrance camera at [9, 6, 20] she sits *behind* the car rather than
       * between it and the lens — background greeter, not foreground blocker.
       * x=2.8 clears the 3.5-wide carpet and leaves a 1.6 gap to the gate
       * post at x=4.4.
       */
      position={[2.8, 0, 5.6]}
      // Turned to face the camera.
      rotation={[0, 0.41, 0]}
      scale={1.9}
      animate
      wave
    />
  );
}
