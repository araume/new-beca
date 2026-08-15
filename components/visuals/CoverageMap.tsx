"use client";

import { useEffect, useRef, useState } from "react";
import { hubRoutes, hubs } from "@/lib/content";
import { usePrefersReducedMotion } from "@/lib/hooks";

/** User-space of public/philippines.svg. */
const VIEW_WIDTH = 702.39;
const VIEW_HEIGHT = 1209.4381;

/**
 * The province outlines live in a 100 KB static SVG. Rather than inline that
 * into the document (where it would be paid for twice — once in the HTML, once
 * in the RSC payload) it is fetched when the section approaches the viewport
 * and rebuilt as React <path> elements from the `d` attributes alone.
 *
 * The lead-time table above carries the same information, so nothing is lost
 * when JavaScript is unavailable.
 */
export function CoverageMap() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [outline, setOutline] = useState<string[]>([]);
  const [drawn, setDrawn] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const node = wrapperRef.current;
    if (!node) return;

    let cancelled = false;

    const load = async () => {
      try {
        const response = await fetch("/philippines.svg");
        if (!response.ok) return;
        const markup = await response.text();
        if (cancelled) return;

        const document_ = new DOMParser().parseFromString(markup, "image/svg+xml");
        const paths = Array.from(document_.querySelectorAll("path"))
          .map((path) => path.getAttribute("d"))
          .filter((d): d is string => Boolean(d));

        setOutline(paths);
        requestAnimationFrame(() => !cancelled && setDrawn(true));
      } catch {
        // Non-fatal: the table remains the source of truth.
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        void load();
      },
      { rootMargin: "300px" }
    );

    observer.observe(node);
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <svg
        viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        role="img"
        aria-label="Wireframe map of the Philippines showing BECA Logistics hubs in Subic, Manila, Batangas, Cebu, Cagayan de Oro and Davao, connected as a delivery network."
        className="mx-auto h-auto w-full max-w-[420px]"
      >
        <defs>
          <linearGradient id="beca-route" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--color-gold)" stopOpacity="0.15" />
            <stop offset="50%" stopColor="var(--color-gold)" stopOpacity="0.9" />
            <stop offset="100%" stopColor="var(--color-gold)" stopOpacity="0.15" />
          </linearGradient>
        </defs>

        {/* Province outlines */}
        <g
          fill="var(--color-ice)"
          fillOpacity="0.05"
          stroke="var(--color-ice)"
          strokeWidth="1"
          strokeLinejoin="round"
        >
          {outline.map((d, index) => (
            <path
              key={index}
              d={d}
              style={{
                opacity: drawn ? 0.3 : 0,
                transition: reducedMotion
                  ? undefined
                  : `opacity 900ms var(--ease-soft) ${Math.min(index * 6, 700)}ms`,
              }}
            />
          ))}
        </g>

        {/* Route network */}
        <g
          stroke="url(#beca-route)"
          strokeWidth="1.6"
          strokeLinecap="round"
          fill="none"
          style={{ opacity: drawn ? 1 : 0, transition: "opacity 600ms 500ms" }}
        >
          {hubRoutes.map(([from, to], index) => {
            const a = hubs[from];
            const b = hubs[to];
            // Bow each link outward so overlapping routes stay legible.
            const midX = (a.x + b.x) / 2 + (b.y - a.y) * 0.12;
            const midY = (a.y + b.y) / 2 - (b.x - a.x) * 0.12;
            return (
              <path
                key={`${from}-${to}`}
                d={`M ${a.x} ${a.y} Q ${midX} ${midY} ${b.x} ${b.y}`}
                pathLength={100}
                strokeDasharray="100"
                strokeDashoffset={reducedMotion ? 0 : 100}
                style={
                  reducedMotion || !drawn
                    ? undefined
                    : {
                        animation: `beca-dash 1400ms var(--ease-soft) ${600 + index * 160}ms forwards`,
                      }
                }
              />
            );
          })}
        </g>

        {/* Hubs */}
        <g style={{ opacity: drawn ? 1 : 0, transition: "opacity 600ms 1200ms" }}>
          {hubs.map((hub, index) => (
            <g key={hub.name}>
              <circle
                cx={hub.x}
                cy={hub.y}
                r={hub.primary ? 7 : 5}
                fill="var(--color-gold)"
                fillOpacity="0.28"
                style={
                  reducedMotion
                    ? undefined
                    : {
                        transformOrigin: `${hub.x}px ${hub.y}px`,
                        animation: `beca-pulse ${2600 + index * 220}ms var(--ease-inout) ${index * 180}ms infinite`,
                      }
                }
              />
              <circle cx={hub.x} cy={hub.y} r={hub.primary ? 4 : 3} fill="var(--color-gold)" />
              <text
                x={hub.x + (hub.primary ? 13 : 11)}
                y={hub.y + 5}
                fill="var(--color-ice)"
                fillOpacity={hub.primary ? 0.92 : 0.62}
                fontSize={hub.primary ? 21 : 18}
                fontFamily="var(--font-display)"
                fontWeight={hub.primary ? 600 : 500}
              >
                {hub.name}
              </text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
