import { useEffect, useMemo, useRef } from 'react';
import type { BufferGeometry, Material, Texture } from 'three';

/**
 * Lifetime management for GPU resources built inside a component.
 *
 * Three.js does not garbage-collect GPU memory. A BufferGeometry, Material or
 * Texture that goes out of scope leaves its WebGL buffer allocated until the
 * context is lost. `useMemo` alone is not enough: it stops the object being
 * rebuilt every render, but nothing frees it when the component unmounts, and
 * nothing frees the *previous* value when a dependency changes.
 *
 * These helpers pair every allocation with its matching dispose.
 *
 * Note the deliberate split from `three-cache.ts`: resources there are shared
 * across the whole app and must NOT be disposed per-component. Use these
 * hooks only for resources a single component owns outright — a procedurally
 * generated texture, a one-off modified geometry.
 */

type Disposable = { dispose(): void };

/**
 * `useMemo` that disposes the old value when deps change and the final value
 * on unmount.
 *
 * ```ts
 * const geo = useDisposable(() => new PlaneGeometry(1, h), [h]);
 * ```
 */
export function useDisposable<T extends Disposable>(
  factory: () => T,
  deps: React.DependencyList,
): T {
  // Deps are forwarded from the caller, so they cannot be an inline literal
  // here. The caller's own dep list is what the linter checks at the call site.
  // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/use-memo
  const value = useMemo(factory, deps);

  // Track the live value in a ref so the unmount cleanup — which must have an
  // empty dep list to run only on unmount — can still reach the latest one.
  const ref = useRef(value);

  useEffect(() => {
    const previous = ref.current;
    if (previous !== value) {
      previous.dispose();
      ref.current = value;
    }
  }, [value]);

  useEffect(
    () => () => {
      ref.current.dispose();
    },
    [],
  );

  return value;
}

/**
 * The same, for a factory returning several resources at once.
 *
 * ```ts
 * const { geo, tex } = useDisposableSet(
 *   () => ({ geo: makeGeo(), tex: makeTex() }),
 *   [events],
 * );
 * ```
 *
 * Every own enumerable property carrying a `dispose` method is freed; other
 * properties (numbers, plain data) are passed through untouched.
 */
export function useDisposableSet<T extends object>(
  factory: () => T,
  deps: React.DependencyList,
): T {
  // Deps are forwarded from the caller, so they cannot be an inline literal
  // here. The caller's own dep list is what the linter checks at the call site.
  // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/use-memo
  const value = useMemo(factory, deps);
  const ref = useRef(value);

  useEffect(() => {
    const previous = ref.current;
    if (previous !== value) {
      disposeAll(previous);
      ref.current = value;
    }
  }, [value]);

  useEffect(
    () => () => {
      disposeAll(ref.current);
    },
    [],
  );

  return value;
}

function isDisposable(v: unknown): v is Disposable {
  return (
    typeof v === 'object' &&
    v !== null &&
    typeof (v as Disposable).dispose === 'function'
  );
}

/** Dispose every disposable held in an object, array, or the value itself. */
export function disposeAll(target: unknown) {
  if (!target) return;
  if (isDisposable(target)) {
    target.dispose();
    return;
  }
  if (Array.isArray(target)) {
    target.forEach(disposeAll);
    return;
  }
  if (typeof target === 'object') {
    // Recurse, so a property holding an array of geometries is freed too.
    Object.values(target as Record<string, unknown>).forEach((v) => {
      if (isDisposable(v) || Array.isArray(v)) disposeAll(v);
    });
  }
}

export type { Disposable, BufferGeometry, Material, Texture };
