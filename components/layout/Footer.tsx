import { Logo } from "@/components/ui/Logo";
import { company, contact, credentials, navigation, services } from "@/lib/content";

/**
 * Horizontal two-zone panel: a light brand band across the top, the navy link
 * grid beneath it, divided by a gold bar.
 *
 * Neither zone is a flat slab — each ramps toward the other so the bar reads as
 * a boundary rather than a wall. The band holds flat aliceblue behind the copy
 * and only cools into a steel blue over its last 45%, where nothing but the
 * rule sits; push the ramp any higher and the tagline drops under 4.5:1. The
 * navy below picks up at its lightest right under the rule and settles into the
 * panel's own colour over the next 190px. Dark copy needs a light ground and
 * light copy a dark one, so the two ramps meet at the gold rather than blending
 * through mid-tones that would strand text on both sides.
 */
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative px-4 pb-6">
      <div className="mx-auto w-full max-w-page">
        <div className="glass overflow-hidden rounded-3xl">
          {/* Brand band */}
          <div className="border-b-4 border-gold bg-[linear-gradient(to_bottom,var(--color-alice)_0%,var(--color-alice)_55%,color-mix(in_oklab,var(--color-alice)_70%,var(--color-ink-700))_100%)] px-8 py-8 sm:px-10 sm:py-9">
            {/* `items-start` keeps the column axis from stretching the logo:
                a column flex container overrides `w-auto` and smears the image
                to the full band width at a fixed height. */}
            <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between sm:gap-10">
              <Logo />
              <div className="sm:text-right">
                <p className="max-w-sm text-sm leading-relaxed text-ink/65">{company.promise}</p>
                <p className="mt-1.5 font-display text-sm font-medium tracking-tight text-gold-deep">
                  {company.motto}
                </p>
              </div>
            </div>
          </div>

          {/* Everything else, on the page's navy */}
          <div className="bg-[linear-gradient(to_bottom,color-mix(in_oklab,var(--color-ink-500)_40%,transparent)_0%,transparent_190px)]">
            <div className="grid gap-10 p-8 sm:p-10 lg:grid-cols-[1fr_1fr_1.2fr] lg:gap-8">
              {/* Navigate */}
              <nav aria-label="Footer">
                <h2 className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-ice/45">
                  Navigate
                </h2>
                <ul className="mt-3 space-y-0.5">
                  {navigation.map((item) => (
                    <li key={item.href}>
                      <a
                        href={item.href}
                        className="-my-1 inline-block py-2 text-sm text-ice/70 transition-colors duration-300 hover:text-gold"
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>

              {/* Services */}
              <div>
                <h2 className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-ice/45">
                  Services
                </h2>
                <ul className="mt-3 space-y-0.5">
                  {services.map((service) => (
                    <li key={service.slug}>
                      <a
                        href="#services"
                        className="-my-1 inline-block py-2 text-sm text-ice/70 transition-colors duration-300 hover:text-gold"
                      >
                        {service.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Contact */}
              <div>
                <h2 className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-ice/45">
                  Get in touch
                </h2>
                <address className="mt-4 space-y-3 text-sm not-italic text-ice/70">
                  <p className="leading-relaxed">
                    {contact.address.lines.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </p>
                  <p className="flex flex-col gap-1">
                    <a
                      href={contact.telephone.href}
                      className="-my-1 inline-block py-2 transition-colors duration-300 hover:text-gold"
                    >
                      {contact.telephone.label}
                    </a>
                    {contact.mobiles.map((mobile) => (
                      <a
                        key={mobile.href}
                        href={mobile.href}
                        className="-my-1 inline-block py-2 transition-colors duration-300 hover:text-gold"
                      >
                        {mobile.label}
                      </a>
                    ))}
                  </p>
                  <a
                    href={`mailto:${contact.email}`}
                    className="-my-1 inline-block py-2 text-gold transition-opacity duration-300 hover:opacity-80"
                  >
                    {contact.email}
                  </a>
                </address>
              </div>
            </div>

            {/* Credentials rail */}
            <div className="border-t border-ice/10 px-8 py-5 sm:px-10">
              <ul className="flex flex-wrap gap-x-6 gap-y-2">
                {credentials.map((credential) => (
                  <li key={credential.number} className="text-xs text-ice/45">
                    <span className="text-ice/65">{credential.label}</span> {credential.number}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-3 border-t border-ice/10 px-8 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-10">
              <p className="text-xs text-ice/45">
                © {year} {company.name}. All rights reserved.
              </p>
              <ul className="flex gap-5 text-xs text-ice/45">
                <li>
                  <a
                    href="#"
                    className="-my-1 inline-block py-2 transition-colors duration-300 hover:text-ice"
                  >
                    Privacy policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="-my-1 inline-block py-2 transition-colors duration-300 hover:text-ice"
                  >
                    Terms of service
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
