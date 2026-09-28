import { clientCountries } from "@/lib/content";

/**
 * The brochure supplies a partial client list, not carrier logos — so this
 * runs as a typographic marquee of the markets those clients ship from.
 * Swap the <li> contents for <Image> marks if the client later provides
 * carrier artwork.
 */
export function PartnerStrip() {
  return (
    <section
      aria-label="Markets we handle cargo from"
      className="relative z-10 border-y border-ice/10 py-7"
    >
      <p className="mb-6 text-center font-display text-[0.6875rem] uppercase tracking-[0.28em] text-ice/40">
        Handling cargo for forwarders worldwide
      </p>

      {/*
        Four copies rather than two. The track still translates -50%, which now
        lands copy 3 exactly where copy 1 started, so the seam stays invisible —
        but the doubled width keeps the list wider than the viewport now that
        five short country names have replaced six long company names. Doubling
        the copies also leaves the -50% travel distance roughly where it was, so
        the shared 48s duration still scrolls at the original speed.
      */}
      <div className="marquee overflow-hidden">
        <div className="marquee-track flex w-max items-center">
          {[0, 1, 2, 3].map((copy) => (
            <ul
              key={copy}
              aria-hidden={copy > 0 ? true : undefined}
              className="flex shrink-0 items-center"
            >
              {clientCountries.map((country) => (
                <li
                  key={`${copy}-${country}`}
                  className="flex shrink-0 items-center gap-6 px-7 sm:px-10"
                >
                  <span className="whitespace-nowrap font-display text-lg font-semibold uppercase tracking-[0.12em] text-ice/75 sm:text-xl">
                    {country}
                  </span>
                  <span aria-hidden="true" className="h-1 w-1 rotate-45 bg-gold/60" />
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}
