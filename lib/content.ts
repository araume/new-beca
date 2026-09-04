/**
 * Single source of truth for every fact on the landing page.
 * Everything here is transcribed from the company brochure, with typos in the
 * source corrected ("Minadanao" -> "Mindanao") and the truncated phone number
 * on the last brochure page resolved to the full one.
 */

export const FOUNDED_YEAR = 2009;

/** Recomputed at build time so the "years in operation" figure never goes stale. */
export const YEARS_IN_OPERATION = new Date().getFullYear() - FOUNDED_YEAR;

export const company = {
  name: "BECA Logistics",
  motto: "Fast, Safe, Reliable, Personalized Service",
  promise: "A trusted name committed to total customer satisfaction.",
  tagline: "Taking care of your business.",
  intro:
    "Full-service logistics for the international importing community — customs brokerage, clearance, warehousing and door-to-door delivery across the Philippines, handled by one accountable team.",
} as const;

export const contact = {
  // TODO: placeholder pending the client's real address.
  email: "info@beca.logistics",
  telephone: { label: "(02) 8828-2939", href: "tel:+63288282939" },
  mobiles: [
    { label: "0917-547-3667", href: "tel:+639175473667" },
    { label: "0969-630-8952", href: "tel:+639696308952" },
  ],
  address: {
    lines: [
      "Km 16, RSTI Compound, Unit R-16",
      "Alabang–Zapote Road, Pamplona 1",
      "Las Piñas City, Philippines 1740",
    ],
    oneLine:
      "Km 16, RSTI Compound, Unit R-16, Alabang–Zapote Road, Pamplona 1, Las Piñas City, Philippines 1740",
  },
} as const;

export const credentials = [
  {
    label: "DTI Fair Trade Enforcement Bureau",
    number: "No. 26-WAB100259",
    scope: "International Freight Forwarder",
  },
  {
    label: "Department of Trade and Industry",
    number: "No. 03665977",
    scope: "Nationally Registered",
  },
  {
    label: "LTFRB Registration",
    number: "No. 2017-5025 / 2020-5228",
    scope: "Trucking Services",
  },
  {
    label: "Marine Cargo Insurance",
    number: "Policy No. MI-B020-0036090",
    scope: "Inland trucking & marine cover",
  },
] as const;

export const stats = [
  {
    value: `${YEARS_IN_OPERATION}`,
    unit: "yrs",
    label: "In operation",
    detail: `Serving importers since ${FOUNDED_YEAR}`,
  },
  {
    value: "7",
    unit: "",
    label: "Service lines",
    detail: "Brokerage to door delivery, one roof",
  },
  {
    value: "3",
    unit: "",
    label: "Island groups",
    detail: "Luzon, Visayas and Mindanao reach",
  },
  {
    value: "24/7",
    unit: "",
    label: "Warehouse security",
    detail: "CCTV-monitored and guarded facility",
  },
] as const;

export type Service = {
  slug: string;
  name: string;
  summary: string;
  points: readonly string[];
  image: string;
};

export const services: readonly Service[] = [
  {
    slug: "customs-brokerage",
    name: "Customs Brokerage",
    summary:
      "Licensed brokerage that files the right entry type for your product and keeps every shipment moving through the tariff process without surprises.",
    points: ["Formal & informal entries", "Entry type advisory", "Duties assessment"],
    image: "/images/services1.png",
  },
  {
    slug: "customs-clearing",
    name: "Customs Clearing & Facilitation",
    summary:
      "Clearance for incoming ocean cargo across the entire container port network of the Philippines, with releases actively expedited rather than queued.",
    points: ["All Philippine container ports", "Expedited cargo release", "Documentation handling"],
    image: "/images/services2.png",
  },
  {
    slug: "distribution",
    name: "Distribution & Delivery",
    summary:
      "Door-to-door delivery on our own fleet, routing Metro Manila, Northern and Southern Luzon and the Bicol region daily, with tie-ups covering Visayas and Mindanao.",
    points: ["Company-owned fleet", "Signed delivery receipts by email", "Regular status updates"],
    image: "/images/services3.png",
  },
  {
    slug: "warehousing",
    name: "Warehousing",
    summary:
      "Owned, insured storage that receives and consolidates cargo from local and international forwarders alike — monitored by CCTV and guarded around the clock.",
    points: ["24/7 CCTV surveillance", "RSTI Compound security", "Consolidation services"],
    image: "/images/services4.png",
  },
  {
    slug: "facility-usage",
    name: "Facility Usage",
    summary:
      "A cargo facilitating station for clients who need immediate distribution instead of storage — cutting warehousing overhead straight out of the landed cost.",
    points: ["Container unloading & stripping space", "Unloading personnel", "Temporary coordinating facility"],
    image: "/images/services5.png",
  },
  {
    slug: "single-consignee",
    name: "Single Consignee Shipment",
    summary:
      "For returning residents and OFWs bringing home personal effects and household goods, we arrange the shipment with the Department of Finance (Mabuhay Lane) for duties exemption.",
    points: ["Full Container Load handling", "Duties exemption filing", "Delivery to final destination"],
    image: "/images/services6.png",
  },
  {
    slug: "marine-insurance",
    name: "Cargo Marine Insurance",
    summary:
      "Coverage available under the BECA Logistics policy at competitive premiums, on All Risk or FPA terms, rated to your product class, declared value and country of origin.",
    points: ["All Risk or FPA terms", "Competitive marine premiums", "Policy No. MI-B020-0036090"],
    image: "/images/services7.png",
  },
];

export type LeadTime = {
  area: string;
  note: string;
  days: string;
  /** 0–1, used to size the bar in the coverage table */
  weight: number;
};

export const leadTimes: readonly LeadTime[] = [
  { area: "Metro Manila", note: "Own fleet, daily routing", days: "1–3 days", weight: 0.15 },
  { area: "Luzon I", note: "Northern & Southern Luzon", days: "3–5 days", weight: 0.25 },
  { area: "Luzon II", note: "Including the Bicol region", days: "3–7 days", weight: 0.35 },
  {
    area: "Visayas / Mindanao — City",
    note: "Upon pull-out from local pier",
    days: "3–5 days",
    weight: 0.25,
  },
  {
    area: "Visayas / Mindanao — Outside",
    note: "Upon pull-out from local pier",
    days: "7–9 days",
    weight: 0.45,
  },
  {
    area: "Visayas / Mindanao — Island",
    note: "Upon pull-out from local pier",
    days: "15–20 days",
    weight: 1,
  },
  { area: "Off-shore areas", note: "Partner network handover", days: "10–20 days", weight: 0.8 },
];

/**
 * Hub coordinates, projected into the user-space of public/philippines.svg
 * (702.39 × 1209.4381) from its mapsvg:geoViewBox of
 * 116.927573 20.834769 126.606549 4.640292.
 */
export type Hub = { name: string; group: string; x: number; y: number; primary?: boolean };

export const hubs: readonly Hub[] = [
  { name: "Subic", group: "Luzon", x: 239.8, y: 451.1 },
  { name: "Manila", group: "Luzon", x: 294.4, y: 465.7, primary: true },
  { name: "Batangas", group: "Luzon", x: 299.8, y: 528.6 },
  { name: "Cebu", group: "Visayas", x: 504.9, y: 785.6, primary: true },
  { name: "Cagayan de Oro", group: "Mindanao", x: 559.1, y: 924.6 },
  { name: "Davao", group: "Mindanao", x: 618.8, y: 1019.0 },
];

/** Drawn as animated network lines between hubs, by index into `hubs`. */
export const hubRoutes: readonly [number, number][] = [
  [1, 0],
  [1, 2],
  [1, 3],
  [3, 4],
  [4, 5],
  [1, 5],
];

export const clients = [
  { name: "Cargo Plus, Inc.", country: "USA" },
  { name: "NJJR Forwarder", country: "USA" },
  { name: "Barangay Forwarder", country: "Sweden" },
  { name: "Love Joy Moving", country: "Russia" },
  { name: "Mabuhay Trading & Services", country: "Italy" },
  { name: "Smart Recruitment and Cargo Services", country: "Romania" },
] as const;

/**
 * The partner strip shows markets rather than company names. Deduped because
 * two of the clients above are US forwarders — listed straight through, the
 * marquee would read "USA" twice in a row.
 */
export const clientCountries: readonly string[] = [
  ...new Set(clients.map((client) => client.country)),
];

export const process = [
  {
    step: "01",
    title: "Quote & booking",
    body: "Send us the shipment details — origin, volume, FCL or LCL. We come back with a competitive rate and the entry type your product actually needs.",
    image: "/images/hiw1.jpeg",
  },
  {
    step: "02",
    title: "Clearance & handling",
    body: "We file the customs entry, clear the cargo at any Philippine container port and expedite its release, with professional handling from container unloading onward.",
    image: "/images/hiw2.jpeg",
  },
  {
    step: "03",
    title: "Door delivery",
    body: "Our own fleet and partner network take it to the consignee's door under insured cover, with signed delivery receipts and photos emailed on request.",
    image: "/images/hiw3.jpeg",
  },
] as const;

/** Dwell time per step in the how-it-works slideshow, in milliseconds. */
export const PROCESS_STEP_MS = 6000;

export const navigation = [
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Process", href: "#process" },
  { label: "Coverage", href: "#coverage" },
  { label: "Contact", href: "#contact" },
] as const;

/**
 * Primary conversion target. The dedicated quote page is not built yet, so the
 * CTA resolves to the on-page contact block until /quote exists.
 */
export const QUOTE_HREF = "#contact";
