"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Subscribes to a media query as an external store, so the value stays live
 * (the globe stops the moment the OS setting is toggled) without the cascading
 * render that a useState/useEffect pair would cause.
 *
 * The server snapshot is `false`: the motion-safe, pointer-fine branch is the
 * one that renders identically on both sides, and React reconciles the real
 * value immediately after hydration.
 */
function useMediaQuery(query: string) {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onStoreChange);
      return () => list.removeEventListener("change", onStoreChange);
    },
    [query]
  );

  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

/** True when the user has asked the OS to reduce motion. */
export function usePrefersReducedMotion() {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

/**
 * True when the device has no fine pointer (touch phones and tablets). Used to
 * swap cursor-driven globe rotation for auto-rotation.
 */
export function useIsCoarsePointer() {
  return useMediaQuery("(hover: none), (pointer: coarse)");
}
