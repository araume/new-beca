import { clients } from "@/lib/content";

/**
 * The brochure supplies a partial client list, not carrier logos — so this
 * runs as a typographic marquee. Swap the <li> contents for <Image> marks if
 * the client later provides carrier artwork.
 */
export function PartnerStrip() {
  return (
    <section
      aria-label="Forwarders and partners we handle cargo for"
      className="relative z-10 border-y border-ice/10 py-7"
    >
      <p className="mb-6 text-center font-display text-[0.6875rem] uppercase tracking-[0.28em] text-ice/40">
        Handling cargo for forwarders worldwide
      </p>

      <div className="marquee overflow-hidden">
        <div className="marquee-track flex w-max items-center">
          {[0, 1].map((copy) => (
            <ul
              key={copy}
              aria-hidden={copy === 1 ? true : undefined}
              className="flex shrink-0 items-center"
            >
              {clients.map((client) => (
                <li
                  key={`${copy}-${client.name}`}
                  className="flex shrink-0 items-center gap-3 px-7 sm:px-10"
                >
                  <span className="whitespace-nowrap font-display text-lg font-semibold tracking-tight text-ice/75 sm:text-xl">
                    {client.name}
                  </span>
                  <span className="whitespace-nowrap rounded-full border border-ice/15 px-2 py-0.5 text-[0.6875rem] uppercase tracking-[0.14em] text-ice/45">
                    {client.country}
                  </span>
                  <span aria-hidden="true" className="ml-4 h-1 w-1 rotate-45 bg-gold/60" />
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}
