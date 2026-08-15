"use client";

import { useEffect, useRef } from "react";
import { useIsCoarsePointer, usePrefersReducedMotion } from "@/lib/hooks";

/**
 * Wireframe globe, rendered with the 2D canvas API.
 *
 * Written without three.js on purpose: this page already pays for a large
 * backdrop-filter on the header and footer, and a WebGL context plus ~150 KB of
 * gzipped runtime on top of that is what makes mid-range Android drop frames.
 * A graticule sphere is a handful of projected polylines — it does not need a
 * scene graph.
 *
 * Guards: DPR capped, rAF stopped when the canvas leaves the viewport or the
 * tab is hidden, and a single static frame when the user prefers reduced motion.
 */

const DEG = Math.PI / 180;

/** Origin markets from the brochure's client list, arced back to Manila. */
const MANILA = { lat: 14.6, lon: 121.0 };
const ORIGINS = [
  { lat: 34.05, lon: -118.24 }, // Los Angeles, USA
  { lat: 40.71, lon: -74.01 }, // New York, USA
  { lat: 59.33, lon: 18.07 }, // Stockholm, Sweden
  { lat: 55.75, lon: 37.62 }, // Moscow, Russia
  { lat: 41.9, lon: 12.5 }, // Rome, Italy
  { lat: 44.43, lon: 26.1 }, // Bucharest, Romania
];

type Vec3 = { x: number; y: number; z: number };

function toVector(lat: number, lon: number): Vec3 {
  const phi = lat * DEG;
  const lambda = lon * DEG;
  return {
    x: Math.cos(phi) * Math.sin(lambda),
    y: Math.sin(phi),
    z: Math.cos(phi) * Math.cos(lambda),
  };
}

/** Spherical interpolation, used to trace great-circle arcs between two hubs. */
function slerp(a: Vec3, b: Vec3, t: number): Vec3 {
  const dot = Math.min(1, Math.max(-1, a.x * b.x + a.y * b.y + a.z * b.z));
  const omega = Math.acos(dot);
  if (omega < 1e-6) return a;
  const sin = Math.sin(omega);
  const ka = Math.sin((1 - t) * omega) / sin;
  const kb = Math.sin(t * omega) / sin;
  return { x: a.x * ka + b.x * kb, y: a.y * ka + b.y * kb, z: a.z * ka + b.z * kb };
}

export function GlobeCanvas({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const coarsePointer = useIsCoarsePointer();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;
    const ctx = context;

    let width = 0;
    let height = 0;
    let radius = 0;
    let centreX = 0;
    let centreY = 0;

    // Cursor-driven rotation is pointer-only; touch devices auto-rotate instead.
    const interactive = !coarsePointer && !reducedMotion;

    let spin = -MANILA.lon * DEG;
    let targetSpin = spin;
    let tilt = 0.34;
    let targetTilt = tilt;

    const dpr = Math.min(window.devicePixelRatio || 1, coarsePointer ? 1.5 : 2);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // The sphere is centred near the bottom edge so its top half fills the
      // hero and its lower half bleeds past the section boundary.
      radius =
        width < 768
          ? Math.min(width * 0.78, height * 0.42)
          : Math.min(width * 0.42, height * 0.62);
      centreX = width / 2;
      centreY = height * 0.72;
    };

    const project = (v: Vec3, sp: number, tl: number) => {
      const cosS = Math.cos(sp);
      const sinS = Math.sin(sp);
      const rx = v.x * cosS + v.z * sinS;
      const rz = -v.x * sinS + v.z * cosS;

      const cosT = Math.cos(tl);
      const sinT = Math.sin(tl);
      const ry = v.y * cosT - rz * sinT;
      const rz2 = v.y * sinT + rz * cosT;

      return { sx: centreX + rx * radius, sy: centreY - ry * radius, depth: rz2 };
    };

    /**
     * Strokes a polyline in two passes — a wide faint pass and a thin bright
     * pass — which reads as bloom without paying for shadowBlur.
     */
    const strokePolyline = (
      points: { sx: number; sy: number; depth: number }[],
      front: boolean,
      colour: string,
      alpha: number,
      lineWidth: number
    ) => {
      ctx.beginPath();
      let drawing = false;
      for (const point of points) {
        const visible = front ? point.depth >= 0 : point.depth < 0;
        if (!visible) {
          drawing = false;
          continue;
        }
        if (drawing) ctx.lineTo(point.sx, point.sy);
        else {
          ctx.moveTo(point.sx, point.sy);
          drawing = true;
        }
      }
      ctx.strokeStyle = colour;
      ctx.globalAlpha = alpha;
      ctx.lineWidth = lineWidth;
      ctx.stroke();
    };

    const drawGraticule = (sp: number, tl: number) => {
      const ice = "#def5ff";

      // Meridians
      for (let lon = 0; lon < 360; lon += 20) {
        const points = [];
        for (let lat = -90; lat <= 90; lat += 4) {
          points.push(project(toVector(lat, lon), sp, tl));
        }
        strokePolyline(points, false, ice, 0.07, 1);
        strokePolyline(points, true, ice, 0.06, 2.4);
        strokePolyline(points, true, ice, 0.34, 0.85);
      }

      // Parallels
      for (let lat = -75; lat <= 75; lat += 15) {
        const points = [];
        for (let lon = 0; lon <= 360; lon += 4) {
          points.push(project(toVector(lat, lon), sp, tl));
        }
        const emphasis = lat === 0 ? 1.6 : 1;
        strokePolyline(points, false, ice, 0.07 * emphasis, 1);
        strokePolyline(points, true, ice, 0.06 * emphasis, 2.4);
        strokePolyline(points, true, ice, 0.3 * emphasis, 0.85);
      }

      // Limb
      ctx.beginPath();
      ctx.arc(centreX, centreY, radius, 0, Math.PI * 2);
      ctx.globalAlpha = 0.5;
      ctx.lineWidth = 1;
      ctx.strokeStyle = ice;
      ctx.stroke();
      ctx.globalAlpha = 1;
    };

    const manilaVector = toVector(MANILA.lat, MANILA.lon);
    const arcs = ORIGINS.map((origin) => {
      const from = toVector(origin.lat, origin.lon);
      const samples: Vec3[] = [];
      for (let i = 0; i <= 48; i += 1) {
        const t = i / 48;
        const point = slerp(from, manilaVector, t);
        // Lift the arc off the surface so it reads as a route, not a coastline.
        const lift = 1 + 0.16 * Math.sin(Math.PI * t);
        samples.push({ x: point.x * lift, y: point.y * lift, z: point.z * lift });
      }
      return samples;
    });

    const drawRoutes = (sp: number, tl: number, time: number) => {
      const gold = "#d8b800";

      arcs.forEach((samples, index) => {
        const points = samples.map((sample) => project(sample, sp, tl));
        strokePolyline(points, true, gold, 0.1, 3);
        strokePolyline(points, true, gold, 0.55, 1);

        // Traveling pulse along the route.
        const progress = ((time / 4200 + index / arcs.length) % 1 + 1) % 1;
        const position = points[Math.floor(progress * (points.length - 1))];
        if (position && position.depth >= 0) {
          ctx.globalAlpha = 0.9;
          ctx.fillStyle = gold;
          ctx.beginPath();
          ctx.arc(position.sx, position.sy, 2.2, 0, Math.PI * 2);
          ctx.fill();

          ctx.globalAlpha = 0.18;
          ctx.beginPath();
          ctx.arc(position.sx, position.sy, 7, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Manila hub marker
      const hub = project(manilaVector, sp, tl);
      if (hub.depth >= 0) {
        const pulse = 0.5 + 0.5 * Math.sin(time / 700);
        ctx.globalAlpha = 0.16 + 0.2 * pulse;
        ctx.fillStyle = "#d8b800";
        ctx.beginPath();
        ctx.arc(hub.sx, hub.sy, 6 + 8 * pulse, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.arc(hub.sx, hub.sy, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const render = (time: number) => {
      ctx.clearRect(0, 0, width, height);

      // Atmospheric wash behind the wireframe.
      const glow = ctx.createRadialGradient(
        centreX,
        centreY,
        radius * 0.1,
        centreX,
        centreY,
        radius * 1.15
      );
      glow.addColorStop(0, "rgba(18, 49, 118, 0.55)");
      glow.addColorStop(0.55, "rgba(11, 38, 96, 0.28)");
      glow.addColorStop(1, "rgba(0, 18, 56, 0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(centreX, centreY, radius * 1.15, 0, Math.PI * 2);
      ctx.fill();

      drawGraticule(spin, tilt);
      drawRoutes(spin, tilt, time);
    };

    let frame = 0;
    let onScreen = true;
    let running = false;

    const loop = (time: number) => {
      // Ease toward the pointer target; keep a slow drift so it never feels dead.
      if (interactive) {
        spin += (targetSpin - spin) * 0.045 + 0.0009;
        tilt += (targetTilt - tilt) * 0.045;
      } else {
        spin += 0.0016;
      }
      render(time);
      frame = requestAnimationFrame(loop);
    };

    const start = () => {
      if (running || reducedMotion) return;
      running = true;
      frame = requestAnimationFrame(loop);
    };

    const stop = () => {
      running = false;
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!interactive) return;
      const px = event.clientX / window.innerWidth;
      const py = event.clientY / window.innerHeight;
      targetSpin = -MANILA.lon * DEG + (px - 0.5) * 1.5;
      targetTilt = Math.max(0.05, Math.min(0.7, 0.34 + (py - 0.5) * 0.45));
    };

    const onVisibility = () => {
      if (document.hidden) stop();
      else if (onScreen) start();
    };

    resize();
    render(0);

    const resizeObserver = new ResizeObserver(() => {
      resize();
      render(performance.now());
    });
    resizeObserver.observe(canvas);

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        if (onScreen && !document.hidden) start();
        else stop();
      },
      { threshold: 0 }
    );
    intersectionObserver.observe(canvas);

    if (interactive) window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [coarsePointer, reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none select-none ${className}`}
    />
  );
}
