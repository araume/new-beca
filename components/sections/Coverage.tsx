import { CoverageMap } from "@/components/visuals/CoverageMap";
import { Reveal } from "@/components/ui/Reveal";
import { leadTimes } from "@/lib/content";

export function Coverage() {
  return (
    <section id="coverage" className="relative z-10 px-6 py-24 sm:py-28">
      <div className="mx-auto w-full max-w-page">
        <div className="max-w-2xl">
          <Reveal>
            <p className="eyebrow">Area of coverage</p>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="mt-6 font-display text-[clamp(1.875rem,4vw,2.875rem)] font-bold leading-[1.08] text-ice">
              Luzon, Visayas and Mindanao — with published lead times.
            </h2>
          </Reveal>
          <Reveal delay={140}>
            <p className="mt-5 text-base leading-relaxed text-ice/60">
              Our own fleet routes Metro Manila, Northern and Southern Luzon and the Bicol region.
              Visayas and Mindanao bound cargo moves through special tie-ups with major local
              forwarding companies.
            </p>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-start lg:gap-16">
          {/* Lead time table */}
          <Reveal>
            <div className="glass overflow-hidden rounded-3xl">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[30rem] border-collapse text-left">
                  <caption className="sr-only">
                    Delivery lead times by area of the Philippines
                  </caption>
                  <thead>
                    <tr className="border-b border-ice/12">
                      <th
                        scope="col"
                        className="px-6 py-4 font-display text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-ice/45"
                      >
                        Area
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-4 font-display text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-ice/45"
                      >
                        Lead time
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {leadTimes.map((row) => (
                      <tr
                        key={row.area}
                        className="group border-b border-ice/8 transition-colors duration-300 last:border-0 hover:bg-ice/4"
                      >
                        <th scope="row" className="px-6 py-4 align-top font-normal">
                          <span className="block font-display text-[0.9375rem] font-semibold text-ice">
                            {row.area}
                          </span>
                          <span className="mt-0.5 block text-xs text-ice/45">{row.note}</span>
                        </th>
                        <td className="px-6 py-4 align-top">
                          <span className="block whitespace-nowrap font-display text-[0.9375rem] font-semibold text-gold">
                            {row.days}
                          </span>
                          <span
                            aria-hidden="true"
                            className="mt-2 block h-0.5 w-24 overflow-hidden rounded-full bg-ice/12"
                          >
                            <span
                              className="block h-full rounded-full bg-gold/70"
                              style={{ width: `${row.weight * 100}%` }}
                            />
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="border-t border-ice/12 px-6 py-4 text-xs leading-relaxed text-ice/45">
                Visayas and Mindanao figures are counted from pull-out at the local pier. Off-shore
                areas are handled through our partner network.
              </p>
            </div>
          </Reveal>

          {/* Network map */}
          <Reveal delay={120}>
            <CoverageMap />
            <ul className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2">
              {["Luzon", "Visayas", "Mindanao"].map((group) => (
                <li key={group} className="flex items-center gap-2 text-xs text-ice/50">
                  <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-gold" />
                  {group}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
