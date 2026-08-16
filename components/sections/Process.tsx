"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { PROCESS_STEP_MS, process } from "@/lib/content";
import { usePrefersReducedMotion } from "@/lib/hooks";

export function Process() {
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [inView, setInView] = useState(false);
  // Once a step is picked by hand the carousel stops for good — this is the
  // "pause" mechanism auto-advancing content is required to offer.
  const [userStopped, setUserStopped] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  // Only advance while the section is actually on screen.
  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "0px 0px -20% 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const advancing = !reducedMotion && !userStopped;
  const running = advancing && inView && !hovered;

  const select = (index: number) => {
    setActive(index);
    setUserStopped(true);
  };

  return (
    <section
      ref={sectionRef}
      id="process"
      className="relative z-10 overflow-hidden px-6 py-24 sm:py-28"
    >
      {/*
        Backdrop. All three frames stay mounted and cross-fade on opacity, which
        the compositor handles on its own; swapping a single `src` would flash
        on every change. Same navy duotone treatment as the About plate.
      */}
      <div className="absolute inset-0 -z-10 isolate bg-ink-900">
        {process.map((step, index) => (
          <Image
            key={step.step}
            src={step.image}
            alt=""
            aria-hidden="true"
            fill
            sizes="100vw"
            className="object-cover object-center mix-blend-luminosity transition-opacity duration-[1200ms] ease-[var(--ease-soft)] motion-reduce:transition-none"
            style={{ opacity: index === active ? 0.5 : 0 }}
          />
        ))}
        <div className="absolute inset-0 bg-ink-900/55" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,var(--color-ink-900)_0%,transparent_26%,transparent_74%,var(--color-ink-900)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-ink-900)_0%,rgba(0,13,41,0.55)_48%,transparent_92%)]" />
      </div>

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

          {/* Hover-pause is scoped to the steps rather than the whole section:
              a section-wide handler would leave the slideshow stopped whenever
              the cursor simply came to rest mid-viewport while scrolling. */}
          <ol
            className="grid gap-10 md:grid-cols-3 md:gap-8"
            onPointerEnter={() => setHovered(true)}
            onPointerLeave={() => setHovered(false)}
            onFocusCapture={() => setHovered(true)}
            onBlurCapture={() => setHovered(false)}
          >
            {process.map((step, index) => {
              const isActive = index === active;

              return (
                <li key={step.step} className="relative">
                  <Reveal delay={index * 120}>
                    <button
                      type="button"
                      onClick={() => select(index)}
                      aria-current={isActive ? "step" : undefined}
                      className="group w-full cursor-pointer text-left"
                    >
                      <span className="relative z-10 grid h-12 w-12 place-items-center">
                        {/* Pulse rings — active step only */}
                        {isActive && !reducedMotion ? (
                          <>
                            <span
                              aria-hidden="true"
                              className="absolute inset-0 rounded-full bg-gold/40"
                              style={{ animation: "beca-ring 2.4s var(--ease-soft) infinite" }}
                            />
                            <span
                              aria-hidden="true"
                              className="absolute inset-0 rounded-full bg-gold/30"
                              style={{
                                animation: "beca-ring 2.4s var(--ease-soft) 1.2s infinite",
                              }}
                            />
                          </>
                        ) : null}

                        <span
                          className={`relative grid h-12 w-12 place-items-center rounded-full border font-display text-sm font-bold transition-colors duration-500 ease-[var(--ease-soft)] ${
                            isActive
                              ? "border-gold bg-gold text-ink"
                              : "border-gold/35 bg-ink-900 text-gold/70 group-hover:border-gold/70"
                          }`}
                        >
                          {step.step}
                        </span>
                      </span>

                      <h3
                        className={`mt-6 font-display text-xl font-semibold tracking-tight transition-colors duration-500 ${
                          isActive ? "text-ice" : "text-ice/55 group-hover:text-ice/80"
                        }`}
                      >
                        {step.title}
                      </h3>
                      <p
                        className={`mt-3 max-w-sm text-sm leading-relaxed transition-colors duration-500 ${
                          isActive ? "text-ice/70" : "text-ice/40 group-hover:text-ice/55"
                        }`}
                      >
                        {step.body}
                      </p>

                      {/*
                        Dwell indicator. The step advances off this animation's
                        `animationend` rather than a parallel timer, so the bar
                        and the schedule cannot drift apart — pausing the
                        animation pauses the slideshow itself.
                      */}
                      <span
                        aria-hidden="true"
                        className="mt-6 block h-px w-full max-w-sm overflow-hidden bg-ice/12"
                      >
                        <span
                          key={active}
                          className="block h-px origin-left bg-gold"
                          onAnimationEnd={(event) => {
                            // Guarded so a click can never be overridden: an
                            // `animationend` already queued when the user takes
                            // control would otherwise advance one step past the
                            // stop. Also ignores any other animation on this node.
                            if (!advancing || event.animationName !== "beca-progress") {
                              return;
                            }
                            setActive((current) => (current + 1) % process.length);
                          }}
                          style={
                            isActive && advancing
                              ? {
                                  animation: `beca-progress ${PROCESS_STEP_MS}ms linear forwards`,
                                  animationPlayState: running ? "running" : "paused",
                                }
                              : { transform: isActive ? "scaleX(1)" : "scaleX(0)" }
                          }
                        />
                      </span>
                    </button>
                  </Reveal>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
