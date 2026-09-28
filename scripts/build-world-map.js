/**
 * Generates public/world-map.json from assets/world.svg.
 *
 * The source is a MapSVG export: 256 country paths, pure polylines (relative
 * `m` + implicit linetos + `z`), 95k points and 404 KB gzipped — far too heavy
 * to download or to stroke per animation frame. This decimates it with
 * Douglas-Peucker, drops sub-pixel islands, and rounds to 1 decimal.
 */
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const ROOT = path.join(__dirname, "..");
const SRC = path.join(ROOT, "assets", "world.svg");
const OUT = path.join(ROOT, "public", "world-map.json");

// Tuned to keep coastlines legible at the map's widest zoom while cutting ~90%
// of the points. Units are map user-space (the map is ~1010 wide).
const SIMPLIFY_TOLERANCE = 0.45;
const MIN_ISLAND_SPAN = 1.1;

const svg = fs.readFileSync(SRC, "utf8");

const header = svg.match(/mapsvg:geoViewBox="([^"]+)"/);
const [west, north, east, south] = header[1].split(/\s+/).map(Number);
const width = Number(svg.match(/width="([\d.]+)"/)[1]);
const height = Number(svg.match(/height="([\d.]+)"/)[1]);

/** Parses one `d` attribute into absolute-coordinate subpaths. */
function parsePath(d) {
  const subpaths = [];
  const tokens = d.match(/[mMzZ]|-?\d*\.?\d+(?:e-?\d+)?/gi) || [];
  let i = 0;
  let cx = 0;
  let cy = 0;
  let startX = 0;
  let startY = 0;
  let current = null;
  let mode = "m";

  while (i < tokens.length) {
    const t = tokens[i];
    if (t === "m" || t === "M") {
      mode = t;
      i += 1;
      const x = Number(tokens[i]);
      const y = Number(tokens[i + 1]);
      i += 2;
      cx = mode === "m" ? cx + x : x;
      cy = mode === "m" ? cy + y : y;
      startX = cx;
      startY = cy;
      if (current && current.length > 2) subpaths.push(current);
      current = [[cx, cy]];
      continue;
    }
    if (t === "z" || t === "Z") {
      if (current && current.length > 2) subpaths.push(current);
      current = null;
      cx = startX;
      cy = startY;
      i += 1;
      continue;
    }
    const x = Number(tokens[i]);
    const y = Number(tokens[i + 1]);
    i += 2;
    cx = mode === "m" ? cx + x : x;
    cy = mode === "m" ? cy + y : y;
    if (!current) current = [[cx, cy]];
    else current.push([cx, cy]);
  }
  if (current && current.length > 2) subpaths.push(current);
  return subpaths;
}

function perpendicularDistance(p, a, b) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  if (dx === 0 && dy === 0) return Math.hypot(p[0] - a[0], p[1] - a[1]);
  const t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy);
  const clamped = Math.max(0, Math.min(1, t));
  return Math.hypot(p[0] - (a[0] + clamped * dx), p[1] - (a[1] + clamped * dy));
}

function simplify(points, tolerance) {
  if (points.length < 3) return points;
  let maxDist = 0;
  let index = 0;
  for (let i = 1; i < points.length - 1; i += 1) {
    const dist = perpendicularDistance(points[i], points[0], points[points.length - 1]);
    if (dist > maxDist) {
      maxDist = dist;
      index = i;
    }
  }
  if (maxDist <= tolerance) return [points[0], points[points.length - 1]];
  return [
    ...simplify(points.slice(0, index + 1), tolerance).slice(0, -1),
    ...simplify(points.slice(index), tolerance),
  ];
}

const pathRe = /<path\s+d="([^"]+)"\s*title="([^"]*)"\s*id="([^"]*)"/g;
const countries = [];
let inputPoints = 0;
let outputPoints = 0;
let match;

while ((match = pathRe.exec(svg))) {
  const [, d, title, id] = match;
  const subpaths = parsePath(d);
  const kept = [];

  for (const sub of subpaths) {
    inputPoints += sub.length;
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const [x, y] of sub) {
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
    if (Math.hypot(maxX - minX, maxY - minY) < MIN_ISLAND_SPAN) continue;

    const simplified = simplify(sub, SIMPLIFY_TOLERANCE);
    if (simplified.length < 3) continue;
    outputPoints += simplified.length;
    kept.push(simplified);
  }

  if (kept.length === 0) continue;

  // Emit as a relative path string at 1 decimal.
  let d2 = "";
  let px = 0;
  let py = 0;
  for (const sub of kept) {
    const [sx, sy] = sub[0];
    const rx = Math.round((sx - px) * 10) / 10;
    const ry = Math.round((sy - py) * 10) / 10;
    d2 += `m${rx} ${ry}`;
    px = px + rx;
    py = py + ry;
    for (let i = 1; i < sub.length; i += 1) {
      const nx = Math.round((sub[i][0] - px) * 10) / 10;
      const ny = Math.round((sub[i][1] - py) * 10) / 10;
      if (nx === 0 && ny === 0) continue;
      d2 += `l${nx} ${ny}`;
      px += nx;
      py += ny;
    }
    d2 += "z";
  }

  // Emit the bounding box so the runtime never has to re-parse the path just
  // to know where it is; culling needs the box on every frame.
  let bx0 = Infinity;
  let by0 = Infinity;
  let bx1 = -Infinity;
  let by1 = -Infinity;
  for (const sub of kept) {
    for (const [px2, py2] of sub) {
      if (px2 < bx0) bx0 = px2;
      if (py2 < by0) by0 = py2;
      if (px2 > bx1) bx1 = px2;
      if (py2 > by1) by1 = py2;
    }
  }
  const round1 = (v) => Math.round(v * 10) / 10;

  countries.push({
    id,
    name: title,
    d: d2,
    box: [round1(bx0), round1(by0), round1(bx1), round1(by1)],
  });
}

const payload = { width, height, geo: { west, north, east, south }, countries };
const json = JSON.stringify(payload);
fs.writeFileSync(OUT, json);

console.log("countries:", countries.length);
console.log("points:", inputPoints, "->", outputPoints, `(${((1 - outputPoints / inputPoints) * 100).toFixed(1)}% removed)`);
console.log("json:", (json.length / 1024).toFixed(1), "KB raw,", (zlib.gzipSync(json).length / 1024).toFixed(1), "KB gzipped");
