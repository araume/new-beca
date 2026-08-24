/**
 * Projection helpers and voyage data for the hero world map.
 *
 * public/world-map.json is generated from public/world.svg by
 * `npm run build:map`. The source is a MapSVG export whose vertical axis is
 * **Mercator**, not linear in latitude — verified by projecting twelve known
 * cities and confirming each lands inside its own country's bounding box.
 */

export type WorldGeo = { west: number; north: number; east: number; south: number };

export type WorldMapData = {
  width: number;
  height: number;
  geo: WorldGeo;
  countries: {
    id: string;
    name: string;
    d: string;
    /** [x0, y0, x1, y1] in map space, precomputed for viewport culling. */
    box: [number, number, number, number];
  }[];
};

const mercator = (lat: number) => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));

/** Projects a lat/lng onto the map's user-space coordinates. */
export function project(lat: number, lng: number, width: number, height: number, geo: WorldGeo) {
  const north = mercator(geo.north);
  const south = mercator(geo.south);
  return {
    x: ((lng - geo.west) / (geo.east - geo.west)) * width,
    y: ((north - mercator(lat)) / (north - south)) * height,
  };
}

export type Port = {
  /** ISO-2 code, used to highlight the country outline beneath the marker. */
  country: string;
  city: string;
  label: string;
  lat: number;
  lng: number;
};

/** Every voyage departs from the company's home port. */
export const HOME_PORT: Port = {
  country: "PH",
  city: "Manila",
  label: "Manila, Philippines",
  lat: 14.5995,
  lng: 120.9842,
};

/**
 * Destination ports — one per client market named in the brochure's partial
 * client listing: USA, Sweden, Russia, Italy and Romania. One port each keeps
 * every market equally likely to be picked.
 */
export const DESTINATIONS: Port[] = [
  { country: "US", city: "Los Angeles", label: "Los Angeles, USA", lat: 33.74, lng: -118.27 },
  { country: "SE", city: "Stockholm", label: "Stockholm, Sweden", lat: 59.33, lng: 18.07 },
  { country: "RU", city: "St Petersburg", label: "St Petersburg, Russia", lat: 59.94, lng: 30.31 },
  { country: "IT", city: "Genoa", label: "Genoa, Italy", lat: 44.41, lng: 8.93 },
  { country: "RO", city: "Constanța", label: "Constanța, Romania", lat: 44.17, lng: 28.65 },
];

/**
 * Cargo ship artwork from public/ship1.svg (viewBox 0 0 512.004 512.004),
 * inlined so it can be filled in the palette gold and rotated per frame without
 * an image load plus an offscreen recolour pass.
 */
export const SHIP_PATH =
  "M511.834,297.856c-0.085-2.411-0.427-4.821-1.344-7.125l-42.667-106.667c-3.264-8.085-11.093-13.397-19.819-13.397v-64 c0-11.776-9.536-21.333-21.333-21.333h-64c-11.797,0-21.333,9.557-21.333,21.333V192v85.333h-4.203l-10.475-47.467 c-3.669-18.923-19.648-33.301-39.552-36.928L143.087,48.917c-6.101-6.101-15.275-7.915-23.253-4.629 c-7.979,3.307-13.163,11.093-13.163,19.712v85.333c0,11.776,9.536,21.333,21.333,21.333s21.333-9.557,21.333-21.333v-33.835 l91.264,91.264c-6.272,6.187-10.795,13.888-12.501,22.592l-10.581,47.979h-25.515v-42.667c0-11.776-9.536-21.333-21.333-21.333 H85.338c-11.797,0-21.333,9.557-21.333,21.333v42.667H21.338c-7.083,0-13.696,3.52-17.664,9.365 c-3.968,5.867-4.779,13.312-2.155,19.904l41.152,102.827v17.28c0,23.509,19.115,42.624,42.603,42.624h315.157 c9.301,0,18.347-2.88,26.325-8.491c1.365-0.939,2.688-1.899,4.181-3.221l71.339-64.213c6.187-5.568,9.728-13.547,9.728-21.845 v-72.896C512.005,298.368,511.855,298.133,511.834,297.856z M261.21,277.334L261.21,277.334l8.661-39.318 c0.171-0.811,2.709-3.349,7.467-3.349s7.296,2.539,7.552,3.883l8.576,38.784H261.21z M384.005,277.333v-64h42.667h6.891l25.6,64 H384.005z";

export const SHIP_VIEWBOX = 512.004;
