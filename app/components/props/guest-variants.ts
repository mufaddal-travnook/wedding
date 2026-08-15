/**
 * The outfits background guests are drawn from.
 *
 * Shared so every crowd component picks from the same set — see the Person
 * component in `person2.tsx` for what each variant looks like.
 */
export const GUEST_VARIANTS = ['sherwani', 'thobe', 'hijabi', 'suit'] as const;

export type GuestVariant = (typeof GUEST_VARIANTS)[number];
