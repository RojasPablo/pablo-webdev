'use client';

/**
 * ServicePageHero
 *
 * The shared hero layout for individual service routes (Strategy, Design, etc.).
 * Distinct from the homepage hero which uses a full-bleed photo + zoom animation.
 *
 * Layout: #f2f2f7 background, grid-positioned image behind a card, image
 * scales out to fill the viewport as the user scrolls down.
 */

import Image from "next/image";
import { useRef, useEffect, useState } from "react";
import { motion, useTransform, type MotionValue } from "framer-motion";
import AnimatedHeroTitle from "@/components/ui/AnimatedHeroTitle";
import TileMaskOverlay from "@/components/ui/TileMaskOverlay";
import NoiseGrainOverlay from "@/components/ui/NoiseGrainOverlay";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

const TILE_SIZE = 82;
const MORPH_START = 0.06;
const MORPH_END   = 0.58;

/** Smooth in both directions — gentle enough on reverse that the card drifts back open */
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

interface ServicePageHeroProps {
  /** Framer Motion scroll progress from HeroScrollScene (0 = top, 1 = scrolled away) */
  scrollYProgress: MotionValue<number>;

  /** Absolute path to the hero image, e.g. "/images/purple.jpg" */
  image: string;

  /**
   * CSS grid-column value for the image wrapper using explicit line numbers.
   * e.g. "4 / 10" = columns 4–9, "3 / 10" = columns 3–9
   * Image sits at z-index 1 and spans 70vh tall.
   */
  imageGridColumn?: string;

  /**
   * CSS grid-column value for the card using explicit line numbers.
   * e.g. "5 / 9" = columns 5–8, "4 / 9" = columns 4–8
   * Card sits at z-index 2 (above the image).
   */
  cardGridColumn?: string;

  /** Title lines fed to AnimatedHeroTitle */
  titleLines: string[];

  /** Body copy rendered inside the card */
  description: string;

  /** Card + button accent color */
  accentColor: string;

  /** Optional intro color shown before the white card reveal finishes */
  introColor?: string;

  /** TileMaskOverlay start delay (ms). Defaults to 1150. */
  tileStartDelayMs?: number;

  /** AnimatedHeroTitle delay (s). Defaults to 1.96. */
  titleDelay?: number;

  /** AnimatedHeroTitle per-character stagger (s). Defaults to 0.028. */
  titleStagger?: number;
}

export default function ServicePageHero({
  scrollYProgress,
  image,
  imageGridColumn = '4 / 10',
  cardGridColumn = '5 / 9',
  titleLines,
  description,
  accentColor,
  introColor,
  tileStartDelayMs = 1150,
  titleDelay = 1.96,
  titleStagger = 0.028,
}: ServicePageHeroProps) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Measure the card once on mount — stored in refs so transforms never recreate
  const cardRef = useRef<HTMLDivElement>(null);
  const measuredW = useRef(448);
  const measuredH = useRef(380);

  useEffect(() => {
    if (!cardRef.current) return;
    measuredW.current = cardRef.current.offsetWidth;
    measuredH.current = cardRef.current.offsetHeight;
  }, [isMobile]);

  const imageScale = useTransform(scrollYProgress, [0, 0.5], [1, 2.2]);

  // Content fades out gently before the morph begins
  const cardContentOpacity = useTransform(scrollYProgress, (v) =>
    1 - Math.max(0, Math.min(1, (v - 0.05) / 0.14))
  );

  // Both axes share identical progress so X and Y are always in sync
  const cardScaleX = useTransform(scrollYProgress, (v) => {
    const target = TILE_SIZE / measuredW.current;
    const t = Math.max(0, Math.min(1, (v - MORPH_START) / (MORPH_END - MORPH_START)));
    return 1 + (target - 1) * easeInOutCubic(t);
  });

  const cardScaleY = useTransform(scrollYProgress, (v) => {
    const target = TILE_SIZE / measuredH.current;
    const t = Math.max(0, Math.min(1, (v - MORPH_START) / (MORPH_END - MORPH_START)));
    return 1 + (target - 1) * easeInOutCubic(t);
  });

  // Tile fades out after landing
  const cardOpacity = useTransform(scrollYProgress, (v) =>
    1 - Math.max(0, Math.min(1, (v - 0.44) / 0.10))
  );

  const sharedOverlays = (
    <>
      <NoiseGrainOverlay
        className="absolute inset-0 z-50 mix-blend-overlay opacity-65 pointer-events-none"
        patternWidth={100}
        patternHeight={100}
        grainOpacity={0.09}
        grainSpeed={8}
      />
      <div className="fixed inset-0 z-[10000] pointer-events-none">
        <TileMaskOverlay
          className="z-0"
          color="#d5d5d5"
          tileSize={82}
          speed={6}
          startDelayMs={tileStartDelayMs}
          enableHoverTrail={false}
        />
      </div>
    </>
  );

  const downChevron = (
    <svg
      className="btn-icon"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      style={{ color: '#141314' }}
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 9l7 7 7-7" />
    </svg>
  );

  const handleScrollDown = () => {
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
  };

  const cardContent = (
    <Card
      title=""
      initialColor={introColor ?? accentColor}
      entryDelayMs={isMobile ? 400 : 1820}
      contentStyle={{ opacity: cardContentOpacity }}
      customContent={
        <div style={{ color: '#2d2d2d', fontFamily: 'var(--font-heading)', fontWeight: 600, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ fontSize: isMobile ? 'clamp(1.75rem, 8vw, 2.25rem)' : 'clamp(1.5rem, 2.8vw, 2.25rem)', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
            <AnimatedHeroTitle lines={titleLines} delay={isMobile ? 0.3 : titleDelay} stagger={isMobile ? 0.02 : titleStagger} />
          </div>
          <p style={{ fontFamily: 'var(--font-heading)', fontSize: isMobile ? '0.8125rem' : 'clamp(0.8125rem, 1.2vw, 0.9375rem)', color: '#2d2d2d', lineHeight: 1.55, letterSpacing: '-0.01em', fontWeight: 400, margin: 0 }}>
            {isMobile ? description.split('.')[0] + '.' : description}
          </p>
        </div>
      }
    >
      <Button
        onClick={handleScrollDown}
        initialColor="transparent"
        iconBgColor="#ffffff"
        iconColor="#141314"
        icon={downChevron}
        className="text-white"
        windowImage={image}
      >
        Our Process
      </Button>
    </Card>
  );

  if (isMobile) {
    return (
      <div className="relative w-full h-screen overflow-hidden" style={{ backgroundColor: '#f2f2f7' }}>
        {sharedOverlays}

        {/* Image — right half, fades into background */}
        <motion.div
          style={{
            position: 'absolute',
            top: 0, bottom: 0,
            right: 0,
            width: '65%',
            scale: imageScale,
            transformOrigin: 'center right',
            zIndex: 1,
          }}
        >
          <Image src={image} alt="" fill className="object-cover" priority />
        </motion.div>

        {/* Gradient blending image into background on the left */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 2,
            background: 'linear-gradient(to right, #f2f2f7 30%, transparent 75%)',
            pointerEvents: 'none',
          }}
        />

        {/* Card — centered, full usable width */}
        <div
          className="absolute inset-0 z-20 flex items-center"
          style={{ transform: 'translateY(var(--hero-header-y, 0px))', padding: '0 1rem', pointerEvents: 'none' }}
        >
          <motion.div
            ref={cardRef}
            style={{
              width: '100%',
              scaleX: cardScaleX,
              scaleY: cardScaleY,
              opacity: cardOpacity,
              transformOrigin: 'center center',
              pointerEvents: 'auto',
            }}
          >
            {cardContent}
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden" style={{ backgroundColor: '#f2f2f7' }}>
      {sharedOverlays}
      <div
        className="absolute inset-0 z-20 flex items-center"
        style={{ transform: 'translateY(var(--hero-header-y, 0px))', pointerEvents: 'none' }}
      >
        <div className="grid-container w-full">
          <div className="grid-layout" style={{ alignItems: 'center' }}>
            {/* Image — behind the card, scales out on scroll */}
            <motion.div
              style={{
                gridColumn: imageGridColumn,
                gridRow: 1,
                zIndex: 1,
                height: '70vh',
                position: 'relative',
                scale: imageScale,
                transformOrigin: 'center center',
              }}
            >
              <Image src={image} alt="" fill className="object-cover" priority />
            </motion.div>

            {/* Card — morphs to tile size on scroll */}
            <motion.div
              ref={cardRef}
              style={{
                gridColumn: cardGridColumn,
                gridRow: 1,
                zIndex: 2,
                scaleX: cardScaleX,
                scaleY: cardScaleY,
                opacity: cardOpacity,
                transformOrigin: 'center center',
                pointerEvents: 'auto',
              }}
            >
              {cardContent}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
