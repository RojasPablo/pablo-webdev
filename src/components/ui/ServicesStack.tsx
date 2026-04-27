'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const serviceCards = [
  {
    image: '/images/purple.jpg',
    alt: 'Get found before your competition does',
    title: 'Get found before your competition does',
    label: 'Strategy',
    content: 'We research how your customers search, fix what\'s holding you back, and build the authority to keep you ranking above the rest.',
    color: '#d7c4f9',
    buttonLabel: 'Discover Strategy',
    buttonHref: '/services/strategy',
  },
  {
    image: '/images/green.jpg',
    alt: 'A brand that builds trust on first contact',
    title: 'A brand that builds trust on first contact',
    label: 'Design',
    content: 'From visual identity to interaction design, we build the system that makes your business look like the obvious choice.',
    color: '#d7dddb',
    buttonLabel: 'Learn about Design',
    buttonHref: '/services/design',
  },
  {
    image: '/images/Blue2.jpg',
    alt: 'Engineered for what comes next',
    title: 'Engineered for what comes next',
    label: 'Engineering',
    content: 'Fast, scalable, and built without shortcuts — from storefronts and SaaS apps to the integrations that keep everything running.',
    color: '#507cce',
    buttonLabel: 'Explore Engineering',
    buttonHref: '/services/engineering',
  },
  {
    image: '/images/red.jpg',
    alt: "New project or existing one, we've got a plan",
    title: "New project or existing one, we've got a plan",
    label: 'Pricing',
    content: 'Transparent pricing for new builds and flexible retainers for ongoing work — no surprises, no bloat.',
    color: '#fa435b',
    buttonLabel: 'View Retainer Plans',
    buttonHref: '/services/pricing',
  },
];

export default function ServicesStack() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const carouselRef = useRef<HTMLDivElement>(null);
  const [mobileIndex, setMobileIndex] = useState(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: leftRef.current,
        start: 'top top',
        endTrigger: sectionRef.current,
        end: 'bottom bottom',
        pin: leftRef.current,
        pinSpacing: false,
      });

      serviceCards.forEach((_, i) => {
        ScrollTrigger.create({
          trigger: cardRefs.current[i],
          start: 'top center',
          end: 'bottom center',
          onEnter: () => setActiveIndex(i),
          onEnterBack: () => setActiveIndex(i),
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number((entry.target as HTMLElement).dataset.index);
            setMobileIndex(index);
          }
        });
      },
      { root: carousel, threshold: 0.5 },
    );

    Array.from(carousel.children).forEach((child) => observer.observe(child));
    return () => observer.disconnect();
  }, []);

  const scrollToCard = (i: number) => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    const child = carousel.children[i] as HTMLElement;
    carousel.scrollTo({ left: child.offsetLeft, behavior: 'smooth' });
  };

  return (
    <>
      {/* ── Mobile layout ── */}
      <div className="lg:hidden flex flex-col gap-8 pt-24 pb-16">
        <div className="grid-container flex flex-col gap-4">
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2rem, 8vw, 3rem)', fontWeight: 600, lineHeight: 1.1, letterSpacing: '-0.02em', color: '#1a1a1a', margin: 0 }}>
            Pixel-perfect web development
          </h2>
          <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(0.9375rem, 4vw, 1.125rem)', lineHeight: 1.6, color: 'rgba(0,0,0,0.75)', margin: 0 }}>
            At Strand, every first impression starts with your online presence. We pack a punch with our code to ensure your vision is strengthened, secured, and woven to perfection.
          </p>
        </div>

        <div
          ref={carouselRef}
          className="flex overflow-x-scroll"
          style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', scrollPaddingLeft: '2rem' }}
        >
          {serviceCards.map((card, i) => (
            <div
              key={card.title}
              data-index={i}
              className="relative flex-shrink-0 aspect-[3/4] overflow-hidden"
              style={{ scrollSnapAlign: 'start', width: 'calc(100vw - 4rem)', marginLeft: i === 0 ? '2rem' : '1rem', marginRight: i === serviceCards.length - 1 ? '2rem' : 0 }}
            >
              <Image src={card.image} alt={card.alt} fill sizes="85vw" className="object-cover" />
              <div className="absolute inset-0 flex items-center justify-center" style={{ pointerEvents: 'none' }}>
                <div className="w-[85%]" style={{ pointerEvents: 'auto' }}>
                  <Card title={card.title} content={card.content} initialColor={card.color} className="card--sm-title">
                    <Button initialColor="transparent" iconBgColor="#ffffff" iconColor="#141314" className="text-white" windowImage={card.image} href={card.buttonHref}>{card.buttonLabel}</Button>
                  </Card>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid-container">
          <div className="grid-layout items-center">
            <div className="grid-span-6 flex flex-row gap-2">
              {serviceCards.map((card, i) => (
                <div
                  key={i}
                  onClick={() => scrollToCard(i)}
                  style={{
                    width: mobileIndex === i ? '5rem' : '2.5rem',
                    height: '4rem',
                    backgroundImage: `url(${card.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    opacity: mobileIndex === i ? 1 : 0.35,
                    transition: 'opacity 0.4s ease, width 0.4s ease',
                    cursor: 'pointer',
                  }}
                />
              ))}
            </div>
            <div className="grid-span-6">
              <Button initialColor="#141314" iconColor="#141314" iconBgColor="#f2f2f7" className="text-[#f2f2f7] w-full" href="/contact">Contact Us</Button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Desktop layout ── */}
      <div ref={sectionRef} className="hidden lg:block grid-container pt-24">
        <div className="grid-layout">

          <div ref={leftRef} className="grid-span-4 grid-start-1 flex flex-col justify-between pr-8 pt-8 pb-8" style={{ height: '100vh' }}>
            <div className="flex flex-col gap-6">
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2rem, 4.5vw, 3rem)', fontWeight: 600, lineHeight: 1.1, letterSpacing: '-0.02em', color: '#1a1a1a', margin: 0 }}>
                Pixel-perfect web development
              </h2>
              <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(0.9375rem, 1.75vw, 1.125rem)', lineHeight: 1.6, color: 'rgba(0,0,0,0.75)', margin: 0 }}>
                At Strand, every first impression starts with your online presence. We pack a punch with our code to ensure your vision is strengthened, secured, and woven to perfection.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              {serviceCards.map((card, i) => (
                <div
                  key={i}
                  onClick={() => cardRefs.current[i]?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                  style={{
                    width: activeIndex === i ? '5rem' : '2.5rem',
                    height: '2.5rem',
                    backgroundImage: `url(${card.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    opacity: activeIndex === i ? 1 : 0.35,
                    transition: 'opacity 0.4s ease, width 0.4s ease',
                    cursor: 'pointer',
                  }}
                />
              ))}
            </div>

            <Button initialColor="#141314" iconColor="#141314" iconBgColor="#f2f2f7" className="text-[#f2f2f7]" href="/contact">Contact Us</Button>
          </div>

          <div className="grid-span-8 grid-start-5 flex flex-col gap-8">
            {serviceCards.map((card, i) => (
              <div
                key={card.title}
                ref={(el) => { cardRefs.current[i] = el; }}
                className="relative w-full aspect-[2/1] overflow-hidden"
              >
                <Image src={card.image} alt={card.alt} fill sizes="66vw" className="object-cover" style={{ willChange: 'transform' }} />
                <div className="absolute inset-0 flex items-center justify-center" style={{ pointerEvents: 'none' }}>
                  <div className="w-[calc(50%-0.5rem)]" style={{ pointerEvents: 'auto' }}>
                    <Card title={card.title} content={card.content} initialColor={card.color} className="card--sm-title">
                      <Button initialColor="transparent" iconBgColor="#ffffff" iconColor="#141314" className="text-white" windowImage={card.image} href={card.buttonHref}>{card.buttonLabel}</Button>
                    </Card>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </>
  );
}
