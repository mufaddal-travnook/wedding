/**
 * The 3D scene owns the car animation, but the DOM overlay owns the navigation
 * buttons — and the two live in separate React reconcilers (R3F's canvas root vs
 * the page root). This tiny typed bridge is how the overlay asks the scene to
 * drive somewhere, replacing the previous untyped `window as any` handshake.
 */

export type DriveToHandler = (targetIdx: number) => void;

declare global {
  interface Window {
    __weddingDriveTo?: DriveToHandler;
  }
}

/** Called by the scene once its drive handler is ready. Returns an unregister fn. */
export function registerDriveHandler(handler: DriveToHandler): () => void {
  if (typeof window === 'undefined') return () => {};
  window.__weddingDriveTo = handler;
  return () => {
    if (window.__weddingDriveTo === handler) delete window.__weddingDriveTo;
  };
}

/** Called by the overlay. No-ops until the scene has registered. */
export function driveTo(targetIdx: number): void {
  if (typeof window === 'undefined') return;
  window.__weddingDriveTo?.(targetIdx);
}
