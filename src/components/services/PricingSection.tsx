'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const MONO = "ui-monospace, 'SF Mono', SFMono-Regular, Menlo, monospace";
const HEADING = 'var(--font-heading)';

function useIsMobile(breakpoint = 1024) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < breakpoint);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [breakpoint]);
  return isMobile;
}

interface Package {
  label: string;
  price: string;
  timeline: string;
  scope: string[];
  cta: string;
  href: string;
  image: string;
  accentColor: string;
}

const PACKAGES: Package[] = [
  {
    label: 'Strategy',
    price: 'from $–,–––',
    timeline: '2–3 weeks',
    scope: [
      'SEO architecture & keyword mapping',
      'Content structure and conversion plan',
      '1 strategy presentation + revisions',
    ],
    cta: 'Start with Strategy',
    href: '/contact',
    image: '/images/purple.jpg',
    accentColor: '#d7c4f9',
  },
  {
    label: 'Design',
    price: 'from $–,–––',
    timeline: '4–6 weeks',
    scope: [
      'Creative direction & brand identity',
      'Typography, color, and component system',
      '2 structured revision rounds',
    ],
    cta: 'Start with Design',
    href: '/contact',
    image: '/images/green.jpg',
    accentColor: '#d7dddb',
  },
  {
    label: 'Engineering',
    price: 'from $–,–––',
    timeline: '6–10 weeks',
    scope: [
      'Full-stack site or app with CMS',
      'Deployment, performance, and QA',
      '2 rounds of refinement',
    ],
    cta: 'Start with Engineering',
    href: '/contact',
    image: '/images/Blue2.jpg',
    accentColor: '#507cce',
  },
  {
    label: 'Full Stack',
    price: 'from $–,–––',
    timeline: '10–16 weeks',
    scope: [
      'Strategy, identity, build, and launch',
      'Single point of contact throughout',
      'Priority scheduling and bundled pricing',
    ],
    cta: 'Get Started',
    href: '/contact',
    image: '/images/red.jpg',
    accentColor: '#fa435b',
  },
];

function PackageCard({ label, price, timeline, scope, cta, href, accentColor, isHovered, isMobile }: Package & { isHovered: boolean; isMobile: boolean }) {
  const labelColor = isHovered ? '#141314' : 'rgba(20,19,20,0.4)';
  const scopeColor = isHovered ? '#141314' : 'rgba(20,19,20,0.55)';

  return (
    <div style={{
      backgroundColor: '#ffffff',
      padding: isMobile ? '1.25rem' : '2rem',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      boxSizing: 'border-box',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: isMobile ? '1.25rem' : '1.75rem' }}>
        <div style={{
          width: isHovered ? 8 : 0,
          height: 8,
          backgroundColor: accentColor,
          flexShrink: 0,
          marginRight: isHovered ? '0.5rem' : 0,
          transition: 'width 0.3s ease, margin-right 0.3s ease',
        }} />
        <span style={{
          fontFamily: MONO,
          fontSize: '0.6875rem',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: labelColor,
          transition: 'color 0.3s ease',
        }}>
          {label}
        </span>
      </div>

      <span style={{
        fontFamily: HEADING,
        fontSize: isMobile ? '1.75rem' : 'clamp(2rem, 3vw, 3rem)',
        fontWeight: 300,
        letterSpacing: '-0.04em',
        lineHeight: 1,
        color: '#141314',
        marginBottom: '0.5rem',
      }}>
        {price}
      </span>
      <span style={{
        fontFamily: MONO,
        fontSize: '0.6875rem',
        letterSpacing: '0.06em',
        color: 'rgba(20,19,20,0.35)',
        textTransform: 'uppercase',
        marginBottom: isMobile ? '1.5rem' : '2.5rem',
      }}>
        {timeline}
      </span>

      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
        {scope.map((item) => (
          <li key={item} style={{
            fontFamily: HEADING,
            fontSize: isMobile ? '0.75rem' : '0.8125rem',
            lineHeight: 1.55,
            color: scopeColor,
            letterSpacing: '-0.005em',
            transition: 'color 0.3s ease',
          }}>
            {item}
          </li>
        ))}
      </ul>

      <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem' }}>
        <Link href={href} style={{
          backgroundColor: '#141314',
          padding: '0.625rem 1rem',
          fontFamily: MONO,
          fontSize: '0.7rem',
          color: '#eeeeee',
          textDecoration: 'none',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}>
          {cta}
        </Link>
        <Link href={href} aria-label={cta} style={{
          backgroundColor: '#141314',
          width: '2.25rem',
          display: 'grid',
          placeItems: 'center',
          fontFamily: MONO,
          fontSize: '1rem',
          color: '#eeeeee',
          textDecoration: 'none',
          fontWeight: 300,
        }}>
          +
        </Link>
      </div>
    </div>
  );
}

const RETAINER_PACKAGES: Package[] = [
  {
    label: 'Embedded',
    price: '$–,––– /mo',
    timeline: 'monthly',
    scope: [
      'Priority turnaround, 1–3 days',
      'Two requests at a time',
      'Near full-time availability',
      'Everything in Active',
      'For heavy build phases',
    ],
    cta: 'Get Started',
    href: '/contact',
    image: '/images/red.jpg',
    accentColor: '#fa435b',
  },
  {
    label: 'Active',
    price: '$–––/hr',
    timeline: 'as needed',
    scope: [
      'One request at a time',
      '2–5 day turnaround',
      'Unlimited revisions',
      'Direct Slack access',
      'Pause or cancel to the next month',
    ],
    cta: 'Get Started',
    href: '/contact',
    image: '/images/blue2.jpg',
    accentColor: '#4d9fff',
  },
];

type PricingSectionProps = {
  mode?: 'full' | 'embedded';
};

export default function PricingSection({ mode = 'full' }: PricingSectionProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [hoveredRetainerIndex, setHoveredRetainerIndex] = useState<number | null>(null);
  const isMobile = useIsMobile();
return (
    <div id={mode === 'embedded' ? undefined : 'pricing'} style={{ backgroundColor: '#eeeeee' }}>

      {/* Viewport 1 - Starting Something */}
      <section style={{
        minHeight: isMobile ? 'unset' : '100vh',
        display: 'flex',
        alignItems: 'center',
        padding: isMobile ? '5rem 1.25rem 4rem' : undefined,
      }}>
        {isMobile ? (
          /* Mobile layout */
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <span style={{ fontFamily: MONO, fontSize: '0.6875rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#ff6944' }}>{'// starting something'}</span>
              <h2 style={{ fontFamily: HEADING, fontSize: '1.875rem', fontWeight: 300, letterSpacing: '-0.03em', lineHeight: 1.05, color: '#141314', margin: 0 }}>Choose your entry point.</h2>
            </div>

            {/* Decorative image */}
            <div style={{ position: 'relative', width: '100%', height: '10rem', overflow: 'hidden' }}>
              {PACKAGES.map((pkg, i) => (
                <Image key={pkg.label} src={pkg.image} alt="" fill className="object-cover" style={{ opacity: hoveredIndex === i ? 1 : 0, transition: 'opacity 0.5s ease' }} />
              ))}
              <Image src="/images/red.jpg" alt="" fill className="object-cover" style={{ opacity: hoveredIndex === null ? 1 : 0, transition: 'opacity 0.5s ease' }} />
            </div>

            {/* 2x2 cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {PACKAGES.map((pkg, i) => (
                <div
                  key={pkg.label}
                  onTouchStart={() => setHoveredIndex(i)}
                  onTouchEnd={() => setHoveredIndex(null)}
                  style={{ opacity: hoveredIndex !== null && hoveredIndex !== i ? 0.4 : 1, transition: 'opacity 0.3s ease' }}
                >
                  <PackageCard {...pkg} isHovered={hoveredIndex === i} isMobile={isMobile} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Desktop layout */
          <div className="grid-container w-full">
            <div className="grid-layout" style={{ alignItems: 'center' }}>
              <div style={{ gridColumn: '2 / 5', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <span style={{ fontFamily: MONO, fontSize: '0.6875rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#ff6944' }}>{'// starting something'}</span>
                <h2 style={{ fontFamily: HEADING, fontSize: 'clamp(2rem, 3vw, 2.75rem)', fontWeight: 300, letterSpacing: '-0.03em', lineHeight: 1.05, color: '#141314', margin: 0 }}>Choose your entry point.</h2>
              </div>
              <div style={{ gridColumn: '6 / 12', position: 'relative' }}>
                {/* Background image stack */}
                <div style={{ position: 'absolute', inset: '-1rem', zIndex: 0, overflow: 'hidden' }}>
                  <Image src="/images/red.jpg" alt="" fill className="object-cover" style={{ opacity: hoveredIndex === null ? 1 : 0, transition: 'opacity 0.5s ease' }} />
                  {PACKAGES.map((pkg, i) => (
                    <Image key={pkg.label} src={pkg.image} alt="" fill className="object-cover" style={{ opacity: hoveredIndex === i ? 1 : 0, transition: 'opacity 0.5s ease' }} />
                  ))}
                </div>
                {/* Cards */}
                <div style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  {PACKAGES.map((pkg, i) => (
                    <div
                      key={pkg.label}
                      onMouseEnter={() => setHoveredIndex(i)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      style={{ opacity: hoveredIndex !== null && hoveredIndex !== i ? 0.4 : 1, transition: 'opacity 0.3s ease' }}
                    >
                      <PackageCard {...pkg} isHovered={hoveredIndex === i} isMobile={false} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Viewport 2 - Already Have Something */}
      <section style={{
        minHeight: isMobile ? 'unset' : '100vh',
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#eeeeee',
        padding: isMobile ? '4rem 1.25rem' : undefined,
      }}>
        {isMobile ? (
          /* Mobile layout */
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <span style={{ fontFamily: MONO, fontSize: '0.6875rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#ff6944' }}>{'// already have something'}</span>
              <h2 style={{ fontFamily: HEADING, fontSize: '1.875rem', fontWeight: 300, letterSpacing: '-0.03em', lineHeight: 1.05, color: '#141314', margin: 0 }}>Elevate what you have.</h2>
            </div>

            {/* Decorative image */}
            <div style={{ position: 'relative', width: '100%', height: '10rem', overflow: 'hidden' }}>
              <Image src="/images/red.jpg" alt="" fill className="object-cover" style={{ opacity: hoveredRetainerIndex === null ? 1 : 0, transition: 'opacity 0.5s ease' }} />
              {RETAINER_PACKAGES.map((pkg, i) => (
                <Image key={pkg.label} src={pkg.image} alt="" fill className="object-cover" style={{ opacity: hoveredRetainerIndex === i ? 1 : 0, transition: 'opacity 0.5s ease' }} />
              ))}
            </div>

            {/* 1x2 retainer cards (stacked) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {RETAINER_PACKAGES.map((pkg, i) => (
                <div
                  key={pkg.label}
                  onTouchStart={() => setHoveredRetainerIndex(i)}
                  onTouchEnd={() => setHoveredRetainerIndex(null)}
                  style={{ opacity: hoveredRetainerIndex !== null && hoveredRetainerIndex !== i ? 0.4 : 1, transition: 'opacity 0.3s ease' }}
                >
                  <PackageCard {...pkg} isHovered={hoveredRetainerIndex === i} isMobile={isMobile} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Desktop layout */
          <div className="grid-container w-full">
            <div className="grid-layout" style={{ alignItems: 'center' }}>
              {/* Text column */}
              <div style={{ gridColumn: '2 / 5', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <span style={{ fontFamily: MONO, fontSize: '0.6875rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#ff6944' }}>{'// already have something'}</span>
                <h2 style={{ fontFamily: HEADING, fontSize: 'clamp(2rem, 3vw, 2.75rem)', fontWeight: 300, letterSpacing: '-0.03em', lineHeight: 1.05, color: '#141314', margin: 0 }}>Elevate what you have.</h2>
              </div>

              {/* 2 rectangular retainer cards */}
              <div style={{ gridColumn: '6 / 12', position: 'relative' }}>
                <div style={{ position: 'absolute', inset: '-1rem', zIndex: 0, overflow: 'hidden' }}>
                  <Image src="/images/red.jpg" alt="" fill className="object-cover" style={{ opacity: hoveredRetainerIndex === null ? 1 : 0, transition: 'opacity 0.5s ease' }} />
                  {RETAINER_PACKAGES.map((pkg, i) => (
                    <Image key={pkg.label} src={pkg.image} alt="" fill className="object-cover" style={{ opacity: hoveredRetainerIndex === i ? 1 : 0, transition: 'opacity 0.5s ease' }} />
                  ))}
                </div>
                <div style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  {RETAINER_PACKAGES.map((pkg, i) => (
                    <div
                      key={pkg.label}
                      onMouseEnter={() => setHoveredRetainerIndex(i)}
                      onMouseLeave={() => setHoveredRetainerIndex(null)}
                      style={{ opacity: hoveredRetainerIndex !== null && hoveredRetainerIndex !== i ? 0.4 : 1, transition: 'opacity 0.3s ease', minHeight: '37rem' }}
                    >
                      <PackageCard {...pkg} isHovered={hoveredRetainerIndex === i} isMobile={false} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
