'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const ASCII_CHARS = ' .,:;i1tfLCG08@#';
const FONT_SIZE = 10;
const CHAR_ASPECT = 0.55;
const ASCII_COLOR = '#ffffff';
const DISPLAY_HEIGHT = '72vh';
const INTER_FONT = 'var(--font-inter), "Inter", sans-serif';

type DeliverableCard = {
  name: string;
  desc: string;
};

type PillarConfig = {
  title: string;
  intro: string;
  cards: DeliverableCard[];
  imageUrl: string;
  tintColor: string;
  videoUrl: string;
  mediaPlacement: 'left' | 'right';
  bgColor: string;
  fgColor: string;
};

const PILLARS: PillarConfig[] = [
  {
    title: 'Design Direction',
    intro:
      'Design Direction defines how your brand feels before a single screen is designed. These four areas establish the strategic foundation that guides every visual and creative decision moving forward.',
    cards: [
      {
        name: 'Creative Direction',
        desc: 'Creative direction sets the overarching vision for the brand. It aligns tone, aesthetic, and intent so every design decision moves in the same direction.',
      },
      {
        name: 'Typography Systems',
        desc: 'Typography systems create a structured voice across the interface. Every type pairing is chosen to feel distinctive, readable, and consistent at every scale.',
      },
      {
        name: 'Color Strategy',
        desc: 'Color strategy builds a palette with purpose, not preference. Each tone is selected to support hierarchy, accessibility, and a recognizable visual identity.',
      },
      {
        name: 'Brand Language',
        desc: 'Brand language defines the visual patterns that make your identity feel cohesive. It ensures every touchpoint feels like part of the same system, not a one-off design.',
      },
    ],
    imageUrl: '/images/Design.jpg',
    tintColor: 'rgba(59, 95, 102, 0.38)',
    videoUrl: '/videos/koi.ascii.webm',
    mediaPlacement: 'left',
    bgColor: '#eeeeee',
    fgColor: '#141314',
  },
  {
    title: 'Experience & Interaction',
    intro:
      'Experience and Interaction shape how your product behaves, not just how it looks. These four areas define the movement, responsiveness, and flow that bring the interface to life.',
    cards: [
      {
        name: 'Interaction Design',
        desc: 'Interaction design defines how users engage with the interface. It ensures every click, scroll, and input feels intuitive and intentional.',
      },
      {
        name: 'Motion Systems',
        desc: 'Motion systems create a consistent rhythm across the product. They guide attention, communicate state changes, and make the experience feel fluid instead of static.',
      },
      {
        name: 'Micro-Interactions',
        desc: 'Micro-interactions add moments of feedback that make the interface feel responsive and alive. They reinforce usability while adding polish to everyday actions.',
      },
      {
        name: 'User Flow Mapping',
        desc: 'User flow mapping structures the journey from entry to conversion. It ensures every path feels clear, purposeful, and frictionless.',
      },
    ],
    imageUrl: '/images/cyan.jpg',
    tintColor: 'rgba(77, 159, 255, 0.4)',
    videoUrl: '/videos/Shark.ascii.webm',
    mediaPlacement: 'right',
    bgColor: '#eeeeee',
    fgColor: '#141314',
  },
  {
    title: 'Visual Systems',
    intro:
      'Visual Systems turn design decisions into a cohesive, scalable framework. These elements ensure everything works together consistently across screens, states, and future growth.',
    cards: [
      {
        name: 'Component Libraries',
        desc: 'Component libraries create reusable building blocks for the interface. They keep design and development aligned while making the system easier to scale.',
      },
      {
        name: 'Layout & Spacing Systems',
        desc: 'Layout and spacing systems define structure and rhythm across every screen. They create balance, clarity, and consistency throughout the experience.',
      },
      {
        name: 'Iconography & Assets',
        desc: 'Iconography and assets establish a visual language that feels unified and intentional. Every element is designed to support usability while reinforcing the brand.',
      },
      {
        name: 'Imagery Direction',
        desc: 'Imagery direction ensures all visual content aligns with the brand’s tone. It creates a cohesive look that feels curated instead of inconsistent.',
      },
    ],
    imageUrl: '/images/discovery.jpg',
    tintColor: 'rgba(137, 119, 243, 0.4)',
    videoUrl: '/videos/fishies.webm',
    mediaPlacement: 'left',
    bgColor: '#141314',
    fgColor: '#ffffff',
  },

  {
    title: 'Scalable Design Assets',
    intro:
      'Scalable Design Assets extend the system into real-world applications. These deliverables ensure your brand stays consistent across pages, campaigns, and future growth.',
    cards: [
      {
        name: 'Page Templates',
        desc: 'Page templates create structured layouts that maintain consistency across your site. They allow new content to scale without breaking the design system.',
      },
      {
        name: 'Wireframes & Prototypes',
        desc: 'Wireframes and prototypes define structure and flow before final execution. They help validate ideas early and keep the build process efficient.',
      },
      {
        name: 'Conversion Copywriting',
        desc: 'Conversion copywriting ensures every page communicates clearly and drives action. It aligns messaging with design to support both brand voice and performance.',
      },
      {
        name: 'Social & Marketing Extensions',
        desc: 'Social and marketing extensions adapt the system for ongoing content. They make it easy to stay consistent across campaigns without sacrificing quality.',
      },
    ],
    imageUrl: '/images/red.jpg',
    tintColor: 'rgba(250, 67, 91, 0.26)',
    videoUrl: '/videos/koi.ascii.webm',
    mediaPlacement: 'right',
    bgColor: '#141314',
    fgColor: '#ffffff',
  },
];

function AsciiMediaPanel({
  title,
  imageUrl,
  tintColor,
  videoUrl,
}: {
  title: string;
  imageUrl: string;
  tintColor: string;
  videoUrl: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const panel = panelRef.current;
    if (!video || !canvas || !panel) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const sampler = document.createElement('canvas');
    const samplerContext = sampler.getContext('2d');
    if (!samplerContext) return;

    const width = canvas.width;
    const height = canvas.height;
    const cols = Math.floor(width / (FONT_SIZE * CHAR_ASPECT));
    const rows = Math.floor(height / FONT_SIZE);
    const cellWidth = width / cols;
    const cellHeight = height / rows;

    sampler.width = cols;
    sampler.height = rows;

    let isMounted = true;
    let animationFrameId = 0;
    let isInView = false;
    let isRendering = false;

    const renderFrame = () => {
      if (!isMounted || !isInView) {
        isRendering = false;
        return;
      }

      ctx.clearRect(0, 0, width, height);

      if (video.readyState >= 2) {
        samplerContext.clearRect(0, 0, cols, rows);
        const sourceWidth = video.videoWidth || cols;
        const sourceHeight = video.videoHeight || rows;
        const sourceAspect = sourceWidth / sourceHeight;
        const targetAspect = cols / rows;

        let drawWidth = cols;
        let drawHeight = rows;
        let drawX = 0;
        let drawY = 0;

        if (sourceAspect > targetAspect) {
          drawWidth = rows * sourceAspect;
          drawX = (cols - drawWidth) / 2;
        } else {
          drawHeight = cols / sourceAspect;
          drawY = (rows - drawHeight) / 2;
        }

        samplerContext.drawImage(video, drawX, drawY, drawWidth, drawHeight);
        const { data } = samplerContext.getImageData(0, 0, cols, rows);

        ctx.font = `${FONT_SIZE}px "Courier New", monospace`;
        ctx.textBaseline = 'top';

        for (let row = 0; row < rows; row += 1) {
          for (let col = 0; col < cols; col += 1) {
            const pixelIndex = (row * cols + col) * 4;
            const r = data[pixelIndex];
            const g = data[pixelIndex + 1];
            const b = data[pixelIndex + 2];
            const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
            const char = ASCII_CHARS[Math.floor(lum * (ASCII_CHARS.length - 1))];

            if (char === ' ') continue;

            ctx.fillStyle = ASCII_COLOR;
            ctx.fillText(char, col * cellWidth, row * cellHeight);
          }
        }
      }

      animationFrameId = requestAnimationFrame(renderFrame);
    };

    const stopRendering = () => {
      if (!isRendering) return;
      cancelAnimationFrame(animationFrameId);
      isRendering = false;
    };

    const startRendering = () => {
      if (!isMounted || !isInView || isRendering) return;
      isRendering = true;
      animationFrameId = requestAnimationFrame(renderFrame);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;

        isInView = entry.isIntersecting;

        if (isInView) {
          video.play().catch(() => {});
          startRendering();
          return;
        }

        video.pause();
        stopRendering();
      },
      { threshold: 0.15 },
    );

    observer.observe(panel);

    return () => {
      isMounted = false;
      observer.disconnect();
      video.pause();
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <>
      <video
        ref={videoRef}
        src={videoUrl}
        loop
        muted
        playsInline
        preload="metadata"
        style={{ display: 'none' }}
      />
      <div
        ref={panelRef}
        className="ascii-media-panel"
        style={{
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          maxWidth: '100%',
          maxHeight: DISPLAY_HEIGHT,
          overflow: 'hidden',
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 0,
            overflow: 'hidden',
            transform: 'scaleY(-1)',
          }}
        >
          <div
            style={{
              position: 'relative',
              width: '177.7778%',
              aspectRatio: '2400 / 1350',
              transform: 'rotate(90deg) scaleX(-1)',
              flexShrink: 0,
              backgroundImage: `url(${imageUrl})`,
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'cover',
            }}
          />
        </div>
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 1,
            backgroundColor: tintColor,
          }}
        />
        <h1
          className="ascii-media-title"
          style={{
            position: 'absolute',
            left: '1rem',
            bottom: '1rem',
            zIndex: 2,
            fontFamily: INTER_FONT,
            color: '#eeeeee',
            fontSize: 'clamp(2.05rem, 4vw, 4.2rem)',
            lineHeight: 0.92,
            letterSpacing: '-0.04em',
            fontWeight: 600,
            maxWidth: '70%',
          }}
        >
          {title}
        </h1>
        <canvas
          ref={canvasRef}
          width={720}
          height={1280}
          style={{
            display: 'block',
            maxWidth: '100%',
            maxHeight: DISPLAY_HEIGHT,
            width: '100%',
            height: 'auto',
            position: 'relative',
            zIndex: 3,
          }}
        />
      </div>
    </>
  );
}

function PillarCopy({ title, intro, cards, fgColor }: Pick<PillarConfig, 'title' | 'intro' | 'cards' | 'fgColor'>) {
  const mutedColor = fgColor === '#ffffff' ? 'rgba(255,255,255,0.55)' : 'rgba(20,19,20,0.72)';
  const dividerColor = fgColor === '#ffffff' ? 'rgba(255,255,255,0.15)' : 'rgba(20,19,20,0.18)';

  return (
    <>
      <article
        className="pillar-intro"
        style={{
          gridColumn: '1 / -1',
          backgroundColor: 'transparent',
          color: fgColor,
          transition: 'color 0.7s ease',
        }}
      >
        <div
          style={{
            marginBottom: '1.5rem',
            fontFamily: INTER_FONT,
            fontSize: 'clamp(0.9rem, 1.15vw, 1.35rem)',
            lineHeight: 1,
            letterSpacing: '-0.02em',
            textTransform: 'uppercase',
            color: fgColor,
            fontWeight: 600,
            transition: 'color 0.7s ease',
          }}
        >
          {title}
        </div>
        <div
          aria-hidden="true"
          style={{
            width: '100%',
            height: '1px',
            backgroundColor: dividerColor,
            marginBottom: '1.75rem',
            transition: 'background-color 0.7s ease',
          }}
        />
        <p
          style={{
            margin: 0,
            fontFamily: INTER_FONT,
            fontSize: 'clamp(0.82rem, 1.05vw, 0.98rem)',
            lineHeight: 1.55,
            letterSpacing: '-0.01em',
            color: mutedColor,
            maxWidth: '62ch',
            transition: 'color 0.7s ease',
          }}
        >
          {intro}
        </p>
      </article>
      {cards.map((card) => (
        <article
          key={card.name}
          style={{
            backgroundColor: 'transparent',
            color: fgColor,
            transition: 'color 0.7s ease',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '1.5rem',
              fontFamily: INTER_FONT,
              fontSize: 'clamp(0.9rem, 1.15vw, 1.35rem)',
              lineHeight: 1,
              letterSpacing: '-0.02em',
              textTransform: 'uppercase',
              color: fgColor,
              fontWeight: 500,
              transition: 'color 0.7s ease',
            }}
          >
            <span>{card.name}</span>
          </div>
          <div
            aria-hidden="true"
            style={{
              width: '100%',
              height: '1px',
              backgroundColor: dividerColor,
              marginBottom: '1.75rem',
              transition: 'background-color 0.7s ease',
            }}
          />
          <p
            style={{
              margin: 0,
              fontFamily: INTER_FONT,
              fontSize: 'clamp(0.82rem, 1.05vw, 0.98rem)',
              lineHeight: 1.55,
              letterSpacing: '-0.01em',
              color: mutedColor,
              maxWidth: '28ch',
              transition: 'color 0.7s ease',
            }}
          >
            {card.desc}
          </p>
        </article>
      ))}
    </>
  );
}

function PillarSection({
  title,
  intro,
  cards,
  imageUrl,
  tintColor,
  videoUrl,
  mediaPlacement,
  fgColor,
  sectionRef,
}: PillarConfig & { sectionRef?: (el: HTMLDivElement | null) => void }) {
  const mediaOnLeft = mediaPlacement === 'left';

  return (
    <div
      ref={sectionRef}
      className="grid-layout items-center pillar-row"
      style={{ minHeight: '100svh', alignContent: 'center' }}
    >
      {mediaOnLeft ? (
        <>
          <div className="pillar-media-slot" style={{ gridColumn: '2 / 5' }}>
            <AsciiMediaPanel
              title={title}
              imageUrl={imageUrl}
              tintColor={tintColor}
              videoUrl={videoUrl}
            />
          </div>
          <section
            className="pillar-copy"
            style={{
              gridColumn: '6 / 12',
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              columnGap: '1.25rem',
              rowGap: '4rem',
              alignSelf: 'stretch',
            }}
          >
            <PillarCopy title={title} intro={intro} cards={cards} fgColor={fgColor} />
          </section>
        </>
      ) : (
        <>
          <section
            className="pillar-copy"
            style={{
              gridColumn: '2 / 8',
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              columnGap: '1.25rem',
              rowGap: '4rem',
              alignSelf: 'stretch',
            }}
          >
            <PillarCopy title={title} intro={intro} cards={cards} fgColor={fgColor} />
          </section>
          <div className="pillar-media-slot" style={{ gridColumn: '9 / 12' }}>
            <AsciiMediaPanel
              title={title}
              imageUrl={imageUrl}
              tintColor={tintColor}
              videoUrl={videoUrl}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default function DesignSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const pillarRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const triggers = pillarRefs.current.map((el, i) => {
      if (!el) return null;
      return ScrollTrigger.create({
        trigger: el,
        start: 'top 55%',
        end: 'bottom 55%',
        onEnter: () => {
          gsap.to(section, {
            backgroundColor: PILLARS[i].bgColor,
            duration: 0.9,
            ease: 'power2.inOut',
          });
          setActiveIndex(i);
        },
        onEnterBack: () => {
          gsap.to(section, {
            backgroundColor: PILLARS[i].bgColor,
            duration: 0.9,
            ease: 'power2.inOut',
          });
          setActiveIndex(i);
        },
      });
    });

    return () => triggers.forEach(t => t?.kill());
  }, []);

  return (
    <section
      ref={sectionRef}
      id="branding"
      className="w-full min-h-screen"
      data-service-section="branding"
      style={{ backgroundColor: PILLARS[0].bgColor }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media (max-width: 767px) {
              .branding-stack {
                gap: 0 !important;
              }

              .pillar-row {
                min-height: 100svh !important;
                align-content: center !important;
                row-gap: 1.75rem;
                padding-block: 1.5rem;
              }

              .pillar-media-slot,
              .pillar-copy {
                grid-column: 1 / -1 !important;
              }

              .pillar-media-slot {
                order: 1;
                width: 100%;
                margin-inline: 0;
              }

              .pillar-copy {
                order: 2;
                grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
                column-gap: 1rem !important;
                row-gap: 2.5rem !important;
              }

              .pillar-intro {
                grid-column: 1 / -1 !important;
              }

              .pillar-media-slot .ascii-media-panel {
                transform: scaleX(-1);
                width: 100%;
                height: min(11rem, 22svh);
                max-height: none !important;
              }

              .pillar-media-slot .ascii-media-panel canvas {
                width: 100% !important;
                height: 100% !important;
                object-fit: cover;
              }

              .pillar-media-slot .ascii-media-title {
                left: auto !important;
                right: 1rem !important;
                bottom: auto !important;
                top: 1rem !important;
                transform: scaleX(-1);
              }
            }
          `,
        }}
      />
      <div className="grid-container w-full">
        <div
          className="branding-stack"
          style={{ display: 'flex', flexDirection: 'column', gap: 0 }}
        >
          {PILLARS.map((pillar, i) => (
            <PillarSection
              key={pillar.title}
              {...pillar}
              sectionRef={(el) => { pillarRefs.current[i] = el; }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
