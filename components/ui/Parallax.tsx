"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePrefersReducedMotion } from "@/lib/hooks";

type ParallaxProps = {
  children: ReactNode;
  /**
   * Travel in pixels across the full viewport pass. Negative moves the layer
   * against the scroll direction (appears further away).
   */
  distance?: number;
  className?: string;
};

/**
 * Transform-only parallax layer.
 *
 * Deliberately not using CSS scroll-driven animations: `animation-timeline` is
 * still missing in Firefox and older Safari, and this page leans on parallax
 * heavily enough that a silent no-op there would read as broken. A rAF-throttled
 * observer that only ticks while the element is on screen costs less than the
 * fallback plumbing would.
 */
export function Parallax({ children, distance = -60, className = "" }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const node = ref.current;
    if (!node || reducedMotion) return;

    let frame = 0;
    let active = false;

    const update = () => {
      frame = 0;
      const rect = node.getBoundingClientRect();
      const viewport = window.innerHeight || 1;
      // -1 when the element sits below the fold, +1 once it has passed above it.
      const progress = (rect.top + rect.height / 2 - viewport / 2) / (viewport / 2 + rect.height / 2);
      node.style.transform = `translate3d(0, ${(progress * distance).toFixed(2)}px, 0)`;
    };

    const onScroll = () => {
      if (frame || !active) return;
      frame = requestAnimationFrame(update);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        active = entry.isIntersecting;
        if (active) update();
      },
      { rootMargin: "20% 0px" }
    );

    observer.observe(node);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
      node.style.transform = "";
    };
  }, [distance, reducedMotion]);

  return (
    <div ref={ref} className={className} style={{ willChange: "transform" }}>
      {children}
    </div>
  );
}
