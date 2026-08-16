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

/**
 * Path data lifted from public/plane.svg (viewBox 0 0 512 512), inlined so the
 * marker can be filled in the palette gold and rotated per-frame. Drawing the
 * .svg through an <img> would mean an async load plus an offscreen canvas and a
 * composite pass just to recolour it.
 *
 * The artwork's nose points up-and-right, i.e. -45° from the +x axis, so
 * headings are drawn with that offset added back.
 */
const PLANE_PATH =
  "M500.146,11.928C487.408-0.883,462.448,0.033,444.365,0.006c-0.033,0-0.061,0-0.094,0c-18.1,0-35.124,7.059-47.933,19.875 L143.06,273.038l-50.961-10.191c-5.553-1.092-11.3,0.628-15.315,4.643L4.954,339.435c-4.411,4.417-6.033,10.908-4.224,16.88 c1.814,5.978,6.766,10.472,12.888,11.696l108.639,21.733l21.733,108.639c1.224,6.121,5.718,11.074,11.696,12.888 c1.616,0.491,3.271,0.728,4.914,0.728c4.423,0,8.747-1.731,11.967-4.951l71.945-71.829c4.014-4.004,5.757-9.75,4.643-15.315 l-10.191-50.961l253.157-253.278c12.838-12.838,19.897-29.894,19.87-48.027C511.964,49.555,512.885,24.595,500.146,11.928z " +
  "M68.742,46.015c-5.377-0.893-10.892,0.861-14.763,4.731L6.091,98.629c-4.025,4.025-5.763,9.806-4.616,15.38 c1.142,5.582,5.012,10.209,10.301,12.326l164.328,65.767L286.032,82.23L68.742,46.015z " +
  "M465.987,443.26L429.774,225.97L319.901,335.898l65.767,164.328c2.118,5.289,6.745,9.159,12.325,10.301 c1.131,0.232,2.272,0.348,3.403,0.348c4.445,0,8.769-1.754,11.977-4.964l47.884-47.889 C465.128,454.156,466.886,448.658,465.987,443.26z";

/** Nose offset of the artwork, in radians. */
const PLANE_NOSE_OFFSET = Math.PI / 4;
const PLANE_VIEWBOX = 512;

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
    let planeSize = 18;

    // Built here rather than at module scope: Path2D does not exist in Node,
    // and this component is prerendered on the server.
    const planePath = new Path2D(PLANE_PATH);

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
      planeSize = width < 768 ? 13 : 18;
    };

    /**
     * Under orthographic projection the sphere only occludes what sits both
     * behind its centre plane AND inside its silhouette. Testing `vz < 0` alone
     * is correct for points on the surface, but route arcs are lifted to radius
     * 1.16 — those can round past the limb while still behind the centre plane,
     * and culling them there left the arc ending in mid-air, up to 0.16 globe
     * radii clear of the edge, instead of tucking behind it.
     */
    const isHidden = (vx: number, vy: number, vz: number) =>
      vz < 0 && Math.hypot(vx, vy) < 1;

    const project = (v: Vec3, sp: number, tl: number) => {
      const cosS = Math.cos(sp);
      const sinS = Math.sin(sp);
      const rx = v.x * cosS + v.z * sinS;
      const rz = -v.x * sinS + v.z * cosS;

      const cosT = Math.cos(tl);
      const sinT = Math.sin(tl);
      const ry = v.y * cosT - rz * sinT;
      const rz2 = v.y * sinT + rz * cosT;

      // Under orthographic projection the sphere only occludes what sits both
      // behind its centre plane AND inside its silhouette. Testing `depth < 0`
      // alone is right for points on the surface, but route arcs are lifted to
      // radius 1.16 — those can round past the limb while still behind the
      // centre plane, and culling them there left the arc ending in mid-air
      // instead of tucking behind the globe's edge.
      return {
        sx: centreX + rx * radius,
        sy: centreY - ry * radius,
        depth: rz2,
        hidden: isHidden(rx, ry, rz2),
        // View-space position, kept so the exact silhouette crossing can be
        // solved for when a line passes behind the globe.
        vx: rx,
        vy: ry,
        vz: rz2,
      };
    };

    type Projected = ReturnType<typeof project>;

    /**
     * Finds where the segment between two straddling samples crosses the
     * silhouette, so lines terminate on the globe's edge rather than at
     * whichever sample happened to land nearest it. Runs only on transitions.
     */
    const boundaryPoint = (a: Projected, b: Projected) => {
      const aVisible = !a.hidden;
      let lo = 0;
      let hi = 1;
      for (let k = 0; k < 12; k++) {
        const mid = (lo + hi) / 2;
        const vx = a.vx + (b.vx - a.vx) * mid;
        const vy = a.vy + (b.vy - a.vy) * mid;
        const vz = a.vz + (b.vz - a.vz) * mid;
        if (!isHidden(vx, vy, vz) === aVisible) lo = mid;
        else hi = mid;
      }
      const t = (lo + hi) / 2;
      return {
        sx: a.sx + (b.sx - a.sx) * t,
        sy: a.sy + (b.sy - a.sy) * t,
      };
    };

    /**
     * Strokes a polyline in two passes — a wide faint pass and a thin bright
     * pass — which reads as bloom without paying for shadowBlur.
     */
    const strokePolyline = (
      points: Projected[],
      front: boolean,
      colour: string,
      alpha: number,
      lineWidth: number
    ) => {
      ctx.beginPath();
      let drawing = false;
      for (let i = 0; i < points.length; i += 1) {
        const point = points[i];
        const visible = front ? !point.hidden : point.hidden;

        if (visible) {
          if (drawing) {
            ctx.lineTo(point.sx, point.sy);
          } else {
            // Enter at the silhouette rather than at this sample.
            if (i > 0) {
              const edge = boundaryPoint(points[i - 1], point);
              ctx.moveTo(edge.sx, edge.sy);
              ctx.lineTo(point.sx, point.sy);
            } else {
              ctx.moveTo(point.sx, point.sy);
            }
            drawing = true;
          }
        } else if (drawing) {
          // Exit at the silhouette rather than at the previous sample.
          const edge = boundaryPoint(points[i - 1], point);
          ctx.lineTo(edge.sx, edge.sy);
          drawing = false;
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

        // Aircraft tracking the route toward Manila.
        const progress = ((time / 4200 + index / arcs.length) % 1 + 1) % 1;
        const step = Math.floor(progress * (points.length - 1));
        const position = points[step];
        // Look ahead one sample for the heading; hold the last leg at the end.
        const ahead = points[Math.min(step + 1, points.length - 1)];

        if (position && !position.hidden) {
          const dx = ahead.sx - position.sx;
          const dy = ahead.sy - position.sy;
          const heading = dx === 0 && dy === 0 ? 0 : Math.atan2(dy, dx);
          // Shrink slightly as the aircraft rounds toward the limb. Depth is
          // clamped because an aircraft past the silhouette is now drawn with a
          // negative depth, which would otherwise invert the scale.
          const depthScale = 0.78 + 0.22 * Math.max(0, position.depth);
          const scale = (planeSize / PLANE_VIEWBOX) * depthScale;

          ctx.globalAlpha = 0.16;
          ctx.fillStyle = gold;
          ctx.beginPath();
          ctx.arc(position.sx, position.sy, planeSize * 0.62, 0, Math.PI * 2);
          ctx.fill();

          ctx.save();
          ctx.translate(position.sx, position.sy);
          ctx.rotate(heading + PLANE_NOSE_OFFSET);
          ctx.scale(scale, scale);
          ctx.translate(-PLANE_VIEWBOX / 2, -PLANE_VIEWBOX / 2);
          ctx.globalAlpha = 0.95;
          ctx.fillStyle = gold;
          ctx.fill(planePath);
          ctx.restore();
        }
      });

      // Manila hub marker
      const hub = project(manilaVector, sp, tl);
      if (!hub.hidden) {
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
