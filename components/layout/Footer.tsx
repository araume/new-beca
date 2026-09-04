import { Logo } from "@/components/ui/Logo";
import { company, contact, credentials, navigation, services } from "@/lib/content";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative px-4 pb-6">
      <div className="mx-auto w-full max-w-page">
        <div className="glass-light overflow-hidden rounded-3xl">
          <div className="grid gap-10 p-8 sm:p-10 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr] lg:gap-8">
            {/* Identity */}
            <div>
              <Logo />
              <p className="mt-5 max-w-xs text-sm leading-relaxed text-ink/65">
                {company.promise}
              </p>
              <p className="mt-4 font-display text-sm font-medium tracking-tight text-gold-deep">
                {company.motto}
              </p>
            </div>

            {/* Navigate */}
            <nav aria-label="Footer">
              <h2 className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-ink/50">
                Navigate
              </h2>
              <ul className="mt-3 space-y-0.5">
                {navigation.map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      className="-my-1 inline-block py-2 text-sm text-ink/70 transition-colors duration-300 hover:text-gold-deep"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Services */}
            <div>
              <h2 className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-ink/50">
                Services
              </h2>
              <ul className="mt-3 space-y-0.5">
                {services.map((service) => (
                  <li key={service.slug}>
                    <a
                      href="#services"
                      className="-my-1 inline-block py-2 text-sm text-ink/70 transition-colors duration-300 hover:text-gold-deep"
                    >
                      {service.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h2 className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-ink/50">
                Get in touch
              </h2>
              <address className="mt-4 space-y-3 text-sm not-italic text-ink/70">
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
                    className="-my-1 inline-block py-2 transition-colors duration-300 hover:text-gold-deep"
                  >
                    {contact.telephone.label}
                  </a>
                  {contact.mobiles.map((mobile) => (
                    <a
                      key={mobile.href}
                      href={mobile.href}
                      className="-my-1 inline-block py-2 transition-colors duration-300 hover:text-gold-deep"
                    >
                      {mobile.label}
                    </a>
                  ))}
                </p>
                <a
                  href={`mailto:${contact.email}`}
                  className="-my-1 inline-block py-2 text-gold-deep transition-opacity duration-300 hover:opacity-80"
                >
                  {contact.email}
                </a>
              </address>
            </div>
          </div>

          {/* Credentials rail */}
          <div className="border-t border-ink/10 px-8 py-5 sm:px-10">
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {credentials.map((credential) => (
                <li key={credential.number} className="text-xs text-ink/55">
                  <span className="text-ink/75">{credential.label}</span> {credential.number}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-3 border-t border-ink/10 px-8 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-10">
            <p className="text-xs text-ink/55">
              © {year} {company.name}. All rights reserved.
            </p>
            <ul className="flex gap-5 text-xs text-ink/55">
              <li>
                <a href="#" className="-my-1 inline-block py-2 transition-colors duration-300 hover:text-ink">
                  Privacy policy
                </a>
              </li>
              <li>
                <a href="#" className="-my-1 inline-block py-2 transition-colors duration-300 hover:text-ink">
                  Terms of service
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
