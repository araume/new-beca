import { company } from "@/lib/content";

/**
 * Wordmark placeholder. The brochure ships no vector logo, so this is a
 * typographic mark built from the palette — swap the <svg> for the real asset
 * when the client supplies one.
 */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <svg
        viewBox="0 0 32 32"
        aria-hidden="true"
        className="h-8 w-8 shrink-0 text-ice"
        fill="none"
      >
        <circle cx="16" cy="16" r="13" stroke="currentColor" strokeOpacity="0.45" strokeWidth="1.25" />
        <ellipse
          cx="16"
          cy="16"
          rx="5.5"
          ry="13"
          stroke="currentColor"
          strokeOpacity="0.35"
          strokeWidth="1.25"
        />
        <path d="M3 16h26" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1.25" />
        <path
          d="M6.5 23.5 25.5 8.5"
          stroke="var(--color-gold)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="25.5" cy="8.5" r="2.75" fill="var(--color-gold)" />
      </svg>
      <span className="flex flex-col leading-none">
        <span className="font-display text-[1.0625rem] font-bold tracking-tight text-ice">
          BECA
        </span>
        <span className="font-display text-[0.5625rem] font-medium uppercase tracking-[0.32em] text-ice/55">
          Logistics
        </span>
      </span>
      <span className="sr-only">{company.name}</span>
    </span>
  );
}
