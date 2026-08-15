import Image from "next/image";
import { Parallax } from "@/components/ui/Parallax";
import { Reveal } from "@/components/ui/Reveal";
import { FOUNDED_YEAR, YEARS_IN_OPERATION, company, credentials } from "@/lib/content";

export function About() {
  return (
    <section id="about" className="relative z-10 overflow-hidden py-24 sm:py-32">
      {/* Background plate — supplied by the developer as public/images/about-bg.png */}
      <div className="absolute inset-0 -z-10">
        <Parallax distance={-70} className="absolute inset-x-0 -top-[12%] h-[124%]">
          <Image
            src="/images/about-bg.png"
            alt=""
            fill
            aria-hidden="true"
            sizes="100vw"
            className="object-cover"
          />
        </Parallax>
        <div className="absolute inset-0 bg-ink-900/82" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,var(--color-ink-900)_0%,transparent_22%,transparent_78%,var(--color-ink-900)_100%)]" />
      </div>

      <div className="mx-auto w-full max-w-page px-6">
        <div className="grid gap-14 lg:grid-cols-[1fr_0.95fr] lg:gap-20">
          <div>
            <Reveal>
              <p className="eyebrow">About the company</p>
            </Reveal>

            <Reveal delay={80}>
              <h2 className="mt-6 max-w-xl font-display text-[clamp(2rem,4.5vw,3.25rem)] font-bold leading-[1.06] text-ice">
                {YEARS_IN_OPERATION} years of moving cargo for people who cannot afford surprises.
              </h2>
            </Reveal>

            <Reveal delay={150}>
              <div className="mt-8 max-w-xl space-y-5 text-base leading-relaxed text-ice/65">
                <p>
                  {company.name} was established in {FOUNDED_YEAR} to give the international
                  importing community something it was not getting: responsive, dedicated service
                  with a person behind it. That emphasis on personalized handling has not changed
                  since.
                </p>
                <p>
                  Alongside quality of service, the company has always worked to put the most
                  competitive rate in front of its clients. We handle any volume of cargo — FCL or
                  LCL, consolidated or individual shipment — and satisfy the full distribution
                  requirement through to final delivery at the consignee&apos;s door under agreed
                  terms.
                </p>
                <p>
                  Today our team collectively brings decades of freight handling experience to the
                  international shipping community. We regard ourselves as an extension of our
                  clients.
                </p>
              </div>
            </Reveal>
          </div>

          {/* Proof of legitimacy */}
          <Reveal delay={220}>
            <div className="glass rounded-3xl p-7 sm:p-8">
              <h3 className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-ice/45">
                Registrations &amp; coverage
              </h3>

              <ul className="mt-6 space-y-5">
                {credentials.map((credential) => (
                  <li key={credential.number} className="border-b border-ice/10 pb-5 last:border-0 last:pb-0">
                    <div className="flex items-start gap-3">
                      <svg
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                        className="mt-0.5 h-4.5 w-4.5 shrink-0 text-gold"
                        fill="none"
                      >
                        <path
                          d="M10 1.75 3.25 4.5v5.1c0 4.02 2.76 7.34 6.75 8.65 3.99-1.31 6.75-4.63 6.75-8.65V4.5L10 1.75Z"
                          stroke="currentColor"
                          strokeWidth="1.4"
                          strokeLinejoin="round"
                        />
                        <path
                          d="m7.2 9.9 2 2 3.6-3.9"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div>
                        <p className="font-display text-sm font-semibold text-ice">
                          {credential.label}
                        </p>
                        <p className="mt-1 font-mono text-xs tracking-tight text-gold">
                          {credential.number}
                        </p>
                        <p className="mt-1 text-xs text-ice/50">{credential.scope}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <p className="mt-7 border-t border-ice/10 pt-5 text-xs leading-relaxed text-ice/45">
                Our warehouse is owned, insured and monitored by CCTV, maintained and guarded 24/7
                by RSTI Compound Security. All delivery trucks are LTFRB registered.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
