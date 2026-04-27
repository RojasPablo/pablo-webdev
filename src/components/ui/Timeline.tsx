'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const TIMELINE_STEPS = [
  {
    number: "01",
    color: "#9589d3",
    title: "Discovery & Strategy",
    meta: "Week 1–2",
    description: "We start by understanding your business, your audience, and your goals. Competitor research, user personas, and a content strategy form the foundation everything else is built on.",
  },
  {
    number: "02",
    color: "#8ed462",
    title: "Design & Wireframes",
    meta: "Week 3–4",
    description: "Information architecture first, then wireframes, then high-fidelity visuals. Every interaction and motion is considered before a single line of code is written.",
  },
  {
    number: "03",
    color: "#2093ff",
    title: "Development & Build",
    meta: "Week 5–6",
    description: "Hand-crafted code — no bloat, full performance. API integrations, CMS, analytics, and on-page SEO are all implemented with your growth in mind.",
  },
  {
    number: "04",
    color: "#fa435b",
    title: "Site Launch & Handoff",
    meta: "Week 7–8",
    description: "Cross-browser QA, performance optimization, and a full CMS walkthrough before go-live. You leave with a site you own and know how to run.",
  },
];

const STEP_IMAGES = [
  "/images/discovery.jpg",
  "/images/Design.jpg",
  "/images/build.jpg",
  "/images/handoff.jpg",
];

export default function Timeline() {
  const desktopRef = useRef<HTMLDivElement>(null);
  const stepsContainerRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rotationRef = useRef(0);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const mm = gsap.matchMedia();

    mm.add("(min-width: 1024px)", () => {
      const st = ScrollTrigger.create({
        trigger: desktopRef.current,
        start: "top top",
        end: () => `+=${window.innerHeight * (TIMELINE_STEPS.length - 1)}`,
        pin: true,
        pinSpacing: true,
        onUpdate: (self) => {
          const step = Math.min(
            Math.floor(self.progress * TIMELINE_STEPS.length),
            TIMELINE_STEPS.length - 1
          );
          setActiveStep(step);
        },
      });
      return () => st.kill();
    });

    return () => mm.revert();
  }, []);

  // Set indicator to step 0 position on mount
  useEffect(() => {
    const indicator = indicatorRef.current;
    const container = stepsContainerRef.current;
    const slot = slotRefs.current[0];
    if (!indicator || !container || !slot) return;
    const containerRect = container.getBoundingClientRect();
    const slotRect = slot.getBoundingClientRect();
    gsap.set(indicator, { y: slotRect.top - containerRect.top - 4.5 });
  }, []);

  // Animate the floating indicator on step change
  useEffect(() => {
    const indicator = indicatorRef.current;
    const container = stepsContainerRef.current;
    const slot = slotRefs.current[activeStep];
    if (!indicator || !container || !slot) return;

    const containerRect = container.getBoundingClientRect();
    const slotRect = slot.getBoundingClientRect();
    const targetY = slotRect.top - containerRect.top - 4.5;
    const currentY = gsap.getProperty(indicator, 'y') as number;

    rotationRef.current += 360;

    gsap.timeline()
      .to(indicator, {
        y: currentY - 14,
        duration: 0.2,
        ease: 'power2.out',
      })
      .to(indicator, {
        y: targetY,
        rotation: rotationRef.current,
        duration: 0.6,
        ease: 'power3.in',
      });
  }, [activeStep]);

  return (
    <section className="relative mt-28">

      {/* ── Mobile layout ── */}
      <div className="lg:hidden grid-container pb-24">
        <div className="mb-10 flex flex-col gap-1">
          <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.6875rem', fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.38)', margin: 0 }}>
            // Our Process
          </p>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2rem, 6vw, 2.75rem)', fontWeight: 600, lineHeight: 1.05, letterSpacing: '-0.025em', color: '#1a1a1a', margin: 0 }}>
            What to expect
          </h2>
        </div>
        <div className="flex flex-col">
          {TIMELINE_STEPS.map((step) => (
            <div key={step.number} className="flex flex-col py-8" style={{ borderTop: '1px solid rgba(0,0,0,0.1)' }}>
              <div className="flex items-center gap-2 mb-3">
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.6875rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: step.color }}>
                  [{step.number}]
                </span>
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.6875rem', fontWeight: 400, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.55)' }}>
                  {step.meta}
                </span>
              </div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.25rem, 5vw, 1.625rem)', fontWeight: 600, lineHeight: 1.1, letterSpacing: '-0.02em', color: '#1a1a1a', margin: '0 0 0.75rem' }}>
                {step.title}
              </h3>
              <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.9375rem', lineHeight: 1.65, color: 'rgba(0,0,0,0.55)', margin: 0 }}>
                {step.description}
              </p>
            </div>
          ))}
          <div style={{ borderTop: '1px solid rgba(0,0,0,0.1)' }} />
        </div>
      </div>

      {/* ── Desktop layout — GSAP pinned, 100vh panel ── */}
      <div
        ref={desktopRef}
        className="hidden lg:flex flex-col"
        style={{ height: '100vh' }}
      >
        <div className="grid-container h-full flex flex-col" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>

          {/* Heading row */}
          <div className="grid-layout items-end mb-10" style={{ flexShrink: 0 }}>
            <div className="grid-span-4 grid-start-3">
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2.25rem, 4vw, 3rem)', fontWeight: 600, lineHeight: 1.05, letterSpacing: '-0.025em', color: '#1a1a1a', margin: 0 }}>
                What to expect
              </h2>
            </div>
          </div>

          {/* Steps + image */}
          <div className="grid-layout" style={{ flex: 1, minHeight: 0, alignItems: 'stretch' }}>

            {/* Right — accordion steps */}
            <div ref={stepsContainerRef} className="grid-span-4 grid-start-7 flex flex-col" style={{ position: 'relative', height: '100%', gridRow: 1 }}>

              {/* Single floating indicator square — sits in the gutter right of the numbers */}
              <div
                ref={indicatorRef}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '-0.75rem',
                  width: '10px',
                  height: '10px',
                  backgroundColor: '#1a1a1a',
                  zIndex: 10,
                  transformOrigin: 'center center',
                }}
              />

              {TIMELINE_STEPS.map((step, i) => {
                const isActive = activeStep === i;
                return (
                  <div
                    key={step.number}
                    ref={(el) => { slotRefs.current[i] = el; }}
                    className="flex flex-col"
                    style={{
                      flex: 1,
                      borderTop: '1px solid rgba(0,0,0,0.1)',
                      paddingTop: '1.125rem',
                      paddingBottom: '1.125rem',
                      opacity: isActive ? 1 : 0.25,
                      transform: isActive ? 'translateX(1.25rem)' : 'translateX(0)',
                      transition: 'opacity 0.5s ease, transform 0.5s ease',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Number row */}
                    <div className="flex items-center gap-2 mb-2.5">
                      <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.6875rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: step.color }}>
                        [{step.number}]
                      </span>
                      <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.6875rem', fontWeight: 400, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.55)' }}>
                        {step.meta}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: isActive ? 'clamp(1.375rem, 2vw, 1.75rem)' : 'clamp(1.125rem, 1.6vw, 1.375rem)',
                      fontWeight: 600,
                      lineHeight: 1.1,
                      letterSpacing: '-0.02em',
                      color: '#1a1a1a',
                      margin: '0 0 0.5rem',
                      transition: 'font-size 0.4s ease',
                    }}>
                      {step.title}
                    </h3>

                    {/* Description */}
                    <p style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: 'clamp(0.875rem, 1.2vw, 1rem)',
                      lineHeight: 1.65,
                      color: 'rgba(0,0,0,0.58)',
                      margin: 0,
                    }}>
                      {step.description}
                    </p>
                  </div>
                );
              })}
              <div style={{ borderTop: '1px solid rgba(0,0,0,0.1)', flexShrink: 0 }} />
            </div>

            {/* Left — stacked images, each slides up from bottom of container */}
            <div className="grid-span-4 grid-start-3 flex flex-col" style={{ height: '100%', gridRow: 1 }}>
              {/* Process label — above image, aligned left */}
              <div className="flex justify-start mb-3" style={{ flexShrink: 0 }}>
                <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.6875rem', fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.38)', margin: 0 }}>
                  // Our Process
                </p>
              </div>
              <div className="relative w-full overflow-hidden" style={{ borderRadius: '3px', flex: 1, minHeight: 0 }}>
                {STEP_IMAGES.map((src, i) => (
                  <div
                    key={i}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      zIndex: i + 1,
                      transform: activeStep >= i ? 'translateY(0%)' : 'translateY(100%)',
                      transition: 'transform 0.75s cubic-bezier(0.76, 0, 0.24, 1)',
                    }}
                  >
                    <Image
                      src={src}
                      alt={`Step ${i + 1}`}
                      fill
                      sizes="33vw"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

    </section>
  );
}
