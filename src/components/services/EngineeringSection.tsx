'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const ACCENT = '#6c94dc';
const MONO = "ui-monospace, 'SF Mono', SFMono-Regular, Menlo, monospace";

interface Item {
  title: string;
  description: string;
}

interface CardProps {
  label: string;
  title: string;
  description: string;
  items: Item[];
  tag: string;
  dark?: boolean;
}

function AccordionRow({
  item,
  index,
  isOpen,
  onToggle,
  fg,
  muted,
  divider,
}: {
  item: Item;
  index: number;
  isOpen: boolean;
  onToggle: (i: number) => void;
  fg: string;
  muted: string;
  divider: string;
}) {
  const iconRef = useRef<HTMLSpanElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [symbol, setSymbol] = useState<'+' | '−'>('+');

  useEffect(() => {
    if (!bodyRef.current) return;
    if (isOpen) {
      gsap.fromTo(bodyRef.current,
        { height: 0, opacity: 0 },
        { height: 'auto', opacity: 1, duration: 0.4, ease: 'power3.out' }
      );
    } else {
      gsap.to(bodyRef.current, {
        height: 0, opacity: 0,
        duration: 0.28, ease: 'power3.in',
      });
    }
  }, [isOpen]);

  const handleClick = () => {
    if (!iconRef.current) return;

    gsap.to(iconRef.current, {
      rotateY: 90,
      duration: 0.18,
      ease: 'power2.in',
      onComplete: () => {
        setSymbol(prev => prev === '+' ? '−' : '+');
        gsap.fromTo(
          iconRef.current!,
          { rotateY: -90 },
          { rotateY: 0, duration: 0.22, ease: 'power2.out' }
        );
      },
    });

    onToggle(index);
  };

  return (
    <div style={{ borderTop: `1px solid ${divider}` }}>
      <button
        onClick={handleClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 0',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          gap: '1rem',
        }}
      >
        <span style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '0.9375rem',
          fontWeight: 400,
          color: isOpen || hovered ? fg : muted,
          letterSpacing: '-0.01em',
          transition: 'color 0.2s ease',
        }}>
          {item.title}
        </span>
        <span style={{ display: 'inline-block', perspective: '120px', flexShrink: 0 }}>
          <span
            ref={iconRef}
            style={{
              fontFamily: MONO,
              fontSize: '1rem',
              color: isOpen || hovered ? fg : muted,
              lineHeight: 1,
              display: 'inline-block',
              transition: 'color 0.2s ease',
            }}
          >
            {symbol}
          </span>
        </span>
      </button>

      <div ref={bodyRef} style={{ overflow: 'hidden', height: 0, opacity: 0 }}>
        <p style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '0.8125rem',
          color: fg,
          lineHeight: 1.65,
          margin: 0,
          paddingBottom: '1.25rem',
          letterSpacing: '-0.005em',
        }}>
          {item.description}
        </p>
      </div>
    </div>
  );
}

function ServiceCard({ label, title, description, items, tag, dark = false }: CardProps) {
  const [open, setOpen] = useState<number | null>(null);

  const bg      = dark ? '#141414' : '#f5f5f5';
  const fg      = dark ? '#ffffff' : '#141414';
  const muted   = dark ? 'rgba(255,255,255,0.4)' : '#888888';
  const divider = dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';

  const handleToggle = (i: number) => {
    setOpen(prev => prev === i ? null : i);
  };

  return (
    <div style={{
      backgroundColor: bg,
      padding: '2.5rem',
      display: 'flex',
      flexDirection: 'column',
      height: '44rem',
      boxSizing: 'border-box',
    }}>
      <div style={{ height: '16rem', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2.25rem' }}>
          <div style={{ width: 9, height: 9, backgroundColor: ACCENT, flexShrink: 0 }} />
          <span style={{ fontFamily: MONO, fontSize: '0.6875rem', letterSpacing: '0.1em', color: fg, textTransform: 'uppercase' }}>
            {label}
          </span>
        </div>
        <span style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'clamp(1.75rem, 3vw, 2.75rem)',
          fontWeight: 300,
          lineHeight: 1.05,
          letterSpacing: '-0.03em',
          color: fg,
          display: 'block',
          marginBottom: '1rem',
        }}>
          {title}
        </span>
        <p style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '0.8125rem',
          fontWeight: 400,
          color: muted,
          lineHeight: 1.65,
          letterSpacing: '-0.005em',
          margin: 0,
        }}>
          {description}
        </p>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {items.map((item, i) => (
          <AccordionRow
            key={i}
            item={item}
            index={i}
            isOpen={open === i}
            onToggle={handleToggle}
            fg={fg}
            muted={muted}
            divider={divider}
          />
        ))}
        <div style={{ borderTop: `1px solid ${divider}` }} />
      </div>

      <div style={{ paddingTop: '2rem' }}>
        <p style={{
          fontFamily: MONO,
          fontSize: '0.625rem',
          letterSpacing: '0.1em',
          color: muted,
          textTransform: 'uppercase',
          margin: 0,
        }}>
          {tag}
        </p>
      </div>
    </div>
  );
}

const FOUNDATIONS: CardProps = {
  label: 'Infrastructure',
  title: 'Foundations & Architecture',
  description: 'The decisions made before a line of code is written determine everything that follows. Get the architecture wrong and everything built on top of it costs more to fix than it did to build.',
  tag: 'Technical Foundation',
  dark: false,
  items: [
    { title: 'Tech Stack Planning', description: 'The right tools for the right problem. Framework, database, hosting, and services chosen around your goals — not habit or defaults.' },
    { title: 'Performance Architecture', description: 'Speed is a feature. Every project is structured for fast load times, clean Core Web Vitals, and a Lighthouse score worth showing off.' },
    { title: 'Database Design', description: "Data that's modeled well scales without pain. Schema, relationships, and query patterns laid out before they become a problem to untangle later." },
    { title: 'Hosting & Deployment', description: 'Production-ready from the first push. CI/CD pipelines, environment configs, and Vercel deployments that ship fast and break rarely.' },
  ],
};

const SITES: CardProps = {
  label: 'Web',
  title: 'Web & Commerce',
  description: "A site that looks good but can't be found, updated, or sold from isn't finished. This is where design becomes a business asset.",
  tag: 'Business-Facing Websites',
  dark: true,
  items: [
    { title: 'CMS-Powered Builds', description: 'Your team updates content without touching code. Built on Sanity, Contentful, or custom solutions structured around how you actually work.' },
    { title: 'E-commerce & Shopify', description: 'Storefronts, product pages, cart logic, and checkout flows built to convert. Custom Shopify themes or headless commerce when the platform needs to get out of the way.' },
    { title: 'Landing Pages', description: 'High-intent pages engineered around a single outcome. Copy, layout, and performance tuned to the one action you need visitors to take.' },
    { title: 'SEO-Ready Structure', description: 'Semantic HTML, metadata, structured data, and page speed built in from the start — not patched on after the fact.' },
  ],
};

const APPS: CardProps = {
  label: 'Product',
  title: 'Apps & SaaS',
  description: 'If your product has users, it needs more than a website. Accounts, billing, dashboards — this is the logic layer that turns a URL into something people actually depend on.',
  tag: 'User-Facing Products',
  dark: true,
  items: [
    { title: 'Auth & User Accounts', description: 'Login, roles, permissions, and session management that works correctly the first time. Built on proven patterns — not reinvented from scratch.' },
    { title: 'Subscription & Billing', description: "Stripe-powered billing flows, plan management, and subscription logic handled cleanly. The part of your product where reliability isn't optional." },
    { title: 'Dashboards & Admin', description: 'Internal tools and client-facing dashboards that surface the right data at the right time. Built to be used daily, not just demoed once.' },
    { title: 'Onboarding Flows', description: 'The path from signup to value is a product decision. Structured flows, guided steps, and progressive disclosure that reduce drop-off and drive activation from day one.' },
  ],
};

const INTEGRATIONS: CardProps = {
  label: 'Integrations',
  title: 'Integrations',
  description: "Your product doesn't exist in isolation. It runs alongside the tools, platforms, and data your business already depends on — and they all need to talk to each other.",
  tag: 'Connected Systems',
  dark: false,
  items: [
    { title: 'API Development', description: "Custom REST APIs built to be consumed correctly. Documented, versioned, and structured for the integrations you need now and the ones you'll need later." },
    { title: 'Third-Party Connections', description: 'Stripe, HubSpot, Mailchimp, Google, Airtable — whatever your stack runs on, connected properly. No brittle workarounds, no undocumented hacks.' },
    { title: 'Webhook Systems', description: 'Event-driven architecture that keeps your systems in sync automatically. Actions in one platform trigger the right behavior everywhere else.' },
    { title: 'Automation Pipelines', description: 'Repetitive manual processes replaced with logic that runs itself. From form submissions to data syncing to notification triggers — built once, runs always.' },
  ],
};

function CardRow({ left, right, bgImage, rowRef }: { left: CardProps; right: CardProps; bgImage?: string; rowRef?: (el: HTMLDivElement | null) => void }) {
  return (
    <div ref={rowRef} className="flex min-h-screen w-full items-center" style={{ padding: '1rem 0' }}>
      <div className="grid-container w-full">
        <div className="grid-layout items-stretch">
          {bgImage && (
            <div style={{
              gridColumn: '3 / 11',
              gridRow: 1,
              margin: '-1rem',
              position: 'relative',
              zIndex: 0,
            }}>
              <Image src={bgImage} alt="" fill className="object-cover" />
            </div>
          )}
          <div style={{ gridColumn: '3 / 7', gridRow: 1, zIndex: 1, position: 'relative' }}>
            <ServiceCard {...left} />
          </div>
          <div style={{ gridColumn: '7 / 11', gridRow: 1, zIndex: 1, position: 'relative' }}>
            <ServiceCard {...right} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EngineeringSection() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const bottomRowRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const bottom = bottomRowRef.current;
    if (!wrapper || !bottom) return;

    const enterTrigger = ScrollTrigger.create({
      trigger: bottom,
      start: 'top 55%',
      end: 'bottom 55%',
      onEnter: () => gsap.to(wrapper, { backgroundColor: '#141314', duration: 0.9, ease: 'power2.inOut' }),
      onEnterBack: () => gsap.to(wrapper, { backgroundColor: '#141314', duration: 0.9, ease: 'power2.inOut' }),
      onLeave: () => gsap.to(wrapper, { backgroundColor: '#eeeeee', duration: 0.9, ease: 'power2.inOut' }),
      onLeaveBack: () => gsap.to(wrapper, { backgroundColor: '#eeeeee', duration: 0.9, ease: 'power2.inOut' }),
    });

    return () => enterTrigger.kill();
  }, []);

  return (
    <div ref={wrapperRef} style={{ backgroundColor: '#eeeeee' }}>
      <CardRow left={FOUNDATIONS} right={SITES} bgImage="/images/Blue2.jpg" />
      <CardRow left={APPS} right={INTEGRATIONS} bgImage="/images/Blue2.jpg" rowRef={(el) => { bottomRowRef.current = el; }} />
    </div>
  );
}
