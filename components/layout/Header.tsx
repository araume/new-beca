"use client";

import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/ui/Logo";
import { QUOTE_HREF, navigation } from "@/lib/content";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>("");
  const panelRef = useRef<HTMLDivElement>(null);

  // Compact the bar once the hero starts leaving.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Scroll spy — highlights the nav item for the section under the viewport centre.
  useEffect(() => {
    const sections = navigation
      .map((item) => document.querySelector<HTMLElement>(item.href))
      .filter((node): node is HTMLElement => node !== null);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(`#${entry.target.id}`);
        }
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  // Dismiss the mobile panel on Escape or an outside click.
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!panelRef.current?.contains(event.target as Node)) setOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-3 sm:pt-4">
      <div ref={panelRef} className="mx-auto w-full max-w-page">
        <div
          className={`glass flex items-center justify-between gap-4 rounded-2xl transition-[padding,border-radius,background-color] duration-500 ease-[var(--ease-soft)] ${
            scrolled ? "px-4 py-2.5 sm:px-5" : "px-5 py-3.5 sm:px-7 sm:py-4"
          }`}
        >
          <a href="#top" className="rounded-lg" aria-label={`${"BECA Logistics"} — back to top`}>
            <Logo />
          </a>

          {/* Desktop navigation */}
          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {navigation.map((item) => {
                const isActive = active === item.href;
                return (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      aria-current={isActive ? "true" : undefined}
                      className={`relative block rounded-full px-3.5 py-2 font-display text-sm font-medium transition-colors duration-300 ${
                        isActive ? "text-ice" : "text-ice/60 hover:text-ice"
                      }`}
                    >
                      {item.label}
                      <span
                        aria-hidden="true"
                        className={`absolute inset-x-3.5 -bottom-0.5 h-px origin-center bg-gold transition-transform duration-500 ease-[var(--ease-soft)] ${
                          isActive ? "scale-x-100" : "scale-x-0"
                        }`}
                      />
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <a href={QUOTE_HREF} className="btn btn-primary hidden py-2.5 text-sm sm:inline-flex">
              Get a quote
            </a>

            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? "Close menu" : "Open menu"}
              className="grid h-10 w-10 place-items-center rounded-full border border-ice/20 text-ice transition-colors duration-300 hover:bg-ice/10 lg:hidden"
            >
              <span className="relative block h-3.5 w-5">
                <span
                  className={`absolute left-0 block h-0.5 w-full rounded bg-current transition-all duration-400 ease-[var(--ease-soft)] ${
                    open ? "top-1.5 rotate-45" : "top-0"
                  }`}
                />
                <span
                  className={`absolute left-0 top-1.5 block h-0.5 w-full rounded bg-current transition-opacity duration-200 ${
                    open ? "opacity-0" : "opacity-100"
                  }`}
                />
                <span
                  className={`absolute left-0 block h-0.5 w-full rounded bg-current transition-all duration-400 ease-[var(--ease-soft)] ${
                    open ? "top-1.5 -rotate-45" : "top-3"
                  }`}
                />
              </span>
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        <div
          id="mobile-nav"
          className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-500 ease-[var(--ease-soft)] lg:hidden ${
            open ? "mt-2 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="min-h-0">
            <nav aria-label="Mobile" className="glass rounded-2xl p-2">
              <ul className="flex flex-col">
                {navigation.map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      onClick={() => setOpen(false)}
                      tabIndex={open ? 0 : -1}
                      className="block rounded-xl px-4 py-3 font-display text-base font-medium text-ice/80 transition-colors duration-300 hover:bg-ice/10 hover:text-ice"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
                <li className="p-2 pt-3">
                  <a
                    href={QUOTE_HREF}
                    onClick={() => setOpen(false)}
                    tabIndex={open ? 0 : -1}
                    className="btn btn-primary w-full"
                  >
                    Get a quote
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
