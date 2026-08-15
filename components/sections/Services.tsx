"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { services } from "@/lib/content";

/**
 * Scroll-snap carousel rather than a JS slider: native scrolling gives real
 * touch momentum, works without JavaScript, and keeps arrow-key and screen
 * reader behaviour for free. The arrows drive `scrollBy` on top of it.
 */
export function Services() {
  const trackRef = useRef<HTMLUListElement>(null);
  const [progress, setProgress] = useState(0);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const sync = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    const max = track.scrollWidth - track.clientWidth;
    const ratio = max > 0 ? track.scrollLeft / max : 0;

    setProgress(ratio);
    setAtStart(track.scrollLeft <= 2);
    setAtEnd(track.scrollLeft >= max - 2);

    const card = track.firstElementChild as HTMLElement | null;
    if (card) {
      const step = card.getBoundingClientRect().width + 20;
      setActiveIndex(Math.round(track.scrollLeft / step));
    }
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    sync();
    track.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync, { passive: true });
    return () => {
      track.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [sync]);

  const scrollByCard = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.firstElementChild as HTMLElement | null;
    const step = card ? card.getBoundingClientRect().width + 20 : track.clientWidth * 0.8;
    track.scrollBy({ left: step * direction, behavior: "smooth" });
  };

  const scrollToIndex = (index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.children[index] as HTMLElement | undefined;
    card?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
  };

  return (
    <section id="services" className="relative z-10 py-24 sm:py-28">
      <div className="mx-auto w-full max-w-page px-6">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div className="max-w-2xl">
            <Reveal>
              <p className="eyebrow">Scope of services</p>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="mt-6 font-display text-[clamp(1.875rem,4vw,2.875rem)] font-bold leading-[1.08] text-ice">
                Seven service lines, one accountable team.
              </h2>
            </Reveal>
            <Reveal delay={140}>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-ice/60">
                Whatever the volume — FCL or LCL, consolidated or individual — the shipment stays
                with us from entry filing through to final delivery.
              </p>
            </Reveal>
          </div>

          {/* Arrows */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => scrollByCard(-1)}
              disabled={atStart}
              aria-label="Previous services"
              className="grid h-11 w-11 place-items-center rounded-full border border-ice/20 text-ice transition-all duration-300 ease-[var(--ease-soft)] hover:border-gold hover:bg-gold hover:text-ink disabled:pointer-events-none disabled:opacity-30"
            >
              <svg viewBox="0 0 20 20" aria-hidden="true" className="h-4 w-4" fill="none">
                <path
                  d="M12.5 4.5 7 10l5.5 5.5"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => scrollByCard(1)}
              disabled={atEnd}
              aria-label="More services"
              className="grid h-11 w-11 place-items-center rounded-full border border-ice/20 text-ice transition-all duration-300 ease-[var(--ease-soft)] hover:border-gold hover:bg-gold hover:text-ink disabled:pointer-events-none disabled:opacity-30"
            >
              <svg viewBox="0 0 20 20" aria-hidden="true" className="h-4 w-4" fill="none">
                <path
                  d="M7.5 4.5 13 10l-5.5 5.5"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Track — inset gutters match the page container so cards start and end
          on the content edges while still scrolling past them. */}
      <div className="mt-12">
        <ul
          ref={trackRef}
          tabIndex={0}
          aria-label="Services"
          className="carousel-inset no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-2"
        >
          {services.map((service) => (
            <li
              key={service.slug}
              className="carousel-card group shrink-0 snap-start"
            >
              <article>
                <div className="relative aspect-4/3 overflow-hidden rounded-2xl border border-ice/10 bg-ink-700">
                  <Image
                    src={service.image}
                    alt={service.name}
                    fill
                    sizes="(max-width: 640px) 82vw, (max-width: 1024px) 46vw, 380px"
                    className="object-cover transition-transform duration-700 ease-[var(--ease-soft)] group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,13,41,0.85),transparent_55%)]" />
                  <div className="absolute inset-x-0 bottom-0 flex flex-wrap gap-1.5 p-4">
                    {service.points.map((point) => (
                      <span
                        key={point}
                        className="glass-soft rounded-full px-2.5 py-1 text-[0.6875rem] text-ice/80"
                      >
                        {point}
                      </span>
                    ))}
                  </div>
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-transparent transition-colors duration-500 group-hover:ring-gold/50"
                  />
                </div>

                <h3 className="mt-5 font-display text-xl font-semibold tracking-tight text-ice">
                  {service.name}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-ice/60">{service.summary}</p>
              </article>
            </li>
          ))}
        </ul>
      </div>

      {/* Progress rail + dots */}
      <div className="mx-auto mt-8 flex w-full max-w-page items-center gap-6 px-6">
        <div className="h-px flex-1 bg-ice/12">
          <div
            className="h-px origin-left bg-gold transition-transform duration-200 ease-out"
            style={{ transform: `scaleX(${Math.max(0.06, progress || 0.06)})` }}
          />
        </div>
        <ul className="flex gap-2">
          {services.map((service, index) => (
            <li key={service.slug}>
              <button
                type="button"
                onClick={() => scrollToIndex(index)}
                aria-label={`Go to ${service.name}`}
                aria-current={index === activeIndex ? "true" : undefined}
                className={`block h-1.5 rounded-full transition-all duration-500 ease-[var(--ease-soft)] ${
                  index === activeIndex ? "w-6 bg-gold" : "w-1.5 bg-ice/25 hover:bg-ice/50"
                }`}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
