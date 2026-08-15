import { Reveal } from "@/components/ui/Reveal";
import { process } from "@/lib/content";

export function Process() {
  return (
    <section id="process" className="relative z-10 px-6 py-24 sm:py-28">
      <div className="mx-auto w-full max-w-page">
        <div className="max-w-2xl">
          <Reveal>
            <p className="eyebrow">How it works</p>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="mt-6 font-display text-[clamp(1.875rem,4vw,2.875rem)] font-bold leading-[1.08] text-ice">
              Three steps from origin port to consignee&apos;s door.
            </h2>
          </Reveal>
        </div>

        <div className="relative mt-14">
          {/* Connecting rail */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-6 hidden h-px bg-gradient-to-r from-gold/50 via-gold/25 to-transparent md:block"
          />

          <ol className="grid gap-10 md:grid-cols-3 md:gap-8">
            {process.map((step, index) => (
              <li key={step.step} className="relative">
                <Reveal delay={index * 120}>
                  <span className="relative z-10 grid h-12 w-12 place-items-center rounded-full border border-gold/40 bg-ink-900 font-display text-sm font-bold text-gold">
                    {step.step}
                  </span>
                  <h3 className="mt-6 font-display text-xl font-semibold tracking-tight text-ice">
                    {step.title}
                  </h3>
                  <p className="mt-3 max-w-sm text-sm leading-relaxed text-ice/60">{step.body}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
