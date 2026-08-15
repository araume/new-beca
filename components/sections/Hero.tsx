import { GlobeCanvas } from "@/components/visuals/GlobeCanvas";
import { Reveal } from "@/components/ui/Reveal";
import { FOUNDED_YEAR, QUOTE_HREF, company, contact } from "@/lib/content";

const assurances = [
  { label: `Established ${FOUNDED_YEAR}`, detail: "Philippine-owned and operated" },
  { label: "DTI & LTFRB registered", detail: "Freight forwarding and trucking" },
  { label: "Insured door-to-door", detail: "Inland trucking and marine cover" },
];

export function Hero() {
  return (
    <section id="top" className="relative">
      {/* The globe extends past the section so its lower half dissolves into
          the partner strip instead of clipping at the boundary. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[calc(100%_+_22vh)] overflow-hidden">
        <GlobeCanvas className="mask-fade-b absolute inset-0 h-full w-full" />
        {/* Seats the headline against the wireframe without hiding the globe. */}
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,var(--color-ink-900)_0%,transparent_28%)] lg:bg-[linear-gradient(to_right,var(--color-ink-900)_0%,rgba(0,13,41,0.6)_42%,transparent_72%)]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-page flex-col justify-center px-6 pb-24 pt-36 sm:pt-40">
        <Reveal>
          <p className="eyebrow">Customs brokerage &amp; freight forwarding</p>
        </Reveal>

        <Reveal delay={90}>
          <h1 className="mt-6 max-w-4xl font-display text-[clamp(2.5rem,7vw,4.75rem)] font-bold leading-[1.02] tracking-[-0.03em] text-ice text-glow-ice">
            Fast, safe, reliable,
            <br />
            <span className="text-gold">personalized</span> service.
          </h1>
        </Reveal>

        <Reveal delay={180}>
          <p className="mt-7 max-w-xl text-base leading-relaxed text-ice/65 sm:text-lg">
            {company.intro}
          </p>
        </Reveal>

        <Reveal delay={260}>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <a href={QUOTE_HREF} className="btn btn-primary px-7 py-3.5 text-base">
              Get a quote
              <svg viewBox="0 0 20 20" aria-hidden="true" className="h-4 w-4" fill="none">
                <path
                  d="M4 10h11m0 0-4.5-4.5M15 10l-4.5 4.5"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
            <a href={contact.telephone.href} className="btn btn-ghost px-7 py-3.5 text-base">
              Call {contact.telephone.label}
            </a>
          </div>
        </Reveal>

        <Reveal delay={340}>
          <ul className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-ice/10 bg-ice/10 sm:grid-cols-3">
            {assurances.map((item) => (
              <li key={item.label} className="glass-soft px-5 py-4">
                <p className="font-display text-sm font-semibold text-ice">{item.label}</p>
                <p className="mt-1 text-xs text-ice/50">{item.detail}</p>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>

      {/* Scroll cue */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 sm:flex"
        style={{ animation: "beca-float 3s var(--ease-inout) infinite" }}
      >
        <span className="font-display text-[0.625rem] uppercase tracking-[0.28em] text-ice/35">
          Scroll
        </span>
        <span className="block h-8 w-px bg-gradient-to-b from-ice/40 to-transparent" />
      </div>
    </section>
  );
}
