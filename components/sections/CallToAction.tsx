import { Reveal } from "@/components/ui/Reveal";
import { company, contact } from "@/lib/content";

const channels = [
  {
    label: "Request a quote",
    value: contact.email,
    href: `mailto:${contact.email}?subject=Quote%20request%20%E2%80%94%20BECA%20Logistics`,
    detail: "Tell us the origin, volume and terms. We reply with a rate.",
    icon: (
      <path
        d="M2.5 6.5h15v11h-15v-11Zm0 .5 7.5 5.5L17.5 7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    label: "Call the office",
    value: contact.telephone.label,
    href: contact.telephone.href,
    detail: "Mondays to Saturdays, Philippine business hours.",
    icon: (
      <path
        d="M4 3.5h3.2l1.4 3.6-2 1.4a10.5 10.5 0 0 0 4.9 4.9l1.4-2 3.6 1.4V16a1.5 1.5 0 0 1-1.6 1.5A13.4 13.4 0 0 1 2.5 5.1 1.5 1.5 0 0 1 4 3.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    ),
  },
  {
    label: "Mobile / Viber",
    value: contact.mobiles[0].label,
    href: contact.mobiles[0].href,
    detail: `Alternate line ${contact.mobiles[1].label}.`,
    icon: (
      <path
        d="M6.5 2.5h7a1.5 1.5 0 0 1 1.5 1.5v12a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 5 16V4a1.5 1.5 0 0 1 1.5-1.5Zm2.25 12.25h2.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
];

export function CallToAction() {
  return (
    <section id="contact" className="relative z-10 px-6 pb-20 pt-8 sm:pb-24">
      <div className="mx-auto w-full max-w-page">
        <div className="glass relative overflow-hidden rounded-3xl px-7 py-14 sm:px-12 sm:py-16">
          {/* Ambient wash */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(216,184,0,0.22),transparent_65%)]"
          />

          <div className="relative max-w-2xl">
            <Reveal>
              <p className="eyebrow">Start a shipment</p>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="mt-6 font-display text-[clamp(1.875rem,4.2vw,3rem)] font-bold leading-[1.06] text-ice">
                Tell us what you&apos;re moving. We&apos;ll take it from the pier.
              </h2>
            </Reveal>
            <Reveal delay={140}>
              <p className="mt-5 text-base leading-relaxed text-ice/60">
                {company.promise} Reach the team directly — no ticket queue, no call centre.
              </p>
            </Reveal>
          </div>

          <Reveal delay={200}>
            <ul className="relative mt-12 grid gap-4 md:grid-cols-3">
              {channels.map((channel) => (
                <li key={channel.label}>
                  <a
                    href={channel.href}
                    className="group flex h-full flex-col rounded-2xl border border-ice/12 bg-ice/4 p-6 transition-all duration-500 ease-[var(--ease-soft)] hover:-translate-y-1 hover:border-gold/50 hover:bg-ice/8"
                  >
                    <span className="grid h-10 w-10 place-items-center rounded-full border border-ice/15 text-gold transition-colors duration-500 group-hover:border-gold/50">
                      <svg viewBox="0 0 20 20" aria-hidden="true" className="h-5 w-5" fill="none">
                        {channel.icon}
                      </svg>
                    </span>
                    <span className="mt-5 font-display text-xs font-semibold uppercase tracking-[0.16em] text-ice/45">
                      {channel.label}
                    </span>
                    <span className="mt-2 break-words font-display text-lg font-semibold tracking-tight text-ice">
                      {channel.value}
                    </span>
                    <span className="mt-2 text-sm leading-relaxed text-ice/50">
                      {channel.detail}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={280}>
            <p className="relative mt-10 border-t border-ice/10 pt-6 text-sm text-ice/50">
              <span className="text-ice/70">Office:</span> {contact.address.oneLine}
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
