import { Reveal } from "@/components/ui/Reveal";
import { stats } from "@/lib/content";

export function TrustBand() {
  return (
    <section aria-label="Company at a glance" className="relative z-10 px-6 py-16 sm:py-20">
      <div className="mx-auto w-full max-w-page">
        <ul className="grid gap-px overflow-hidden rounded-3xl border border-ice/10 bg-ice/10 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <li key={stat.label} className="glass-soft">
              <Reveal delay={index * 80} className="h-full px-6 py-8">
                <p className="font-display text-[2.75rem] font-bold leading-none tracking-[-0.04em] text-gold">
                  {stat.value}
                  {stat.unit ? (
                    <span className="ml-1 text-xl font-semibold text-gold/70">{stat.unit}</span>
                  ) : null}
                </p>
                <p className="mt-4 font-display text-sm font-semibold text-ice">{stat.label}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-ice/50">{stat.detail}</p>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
