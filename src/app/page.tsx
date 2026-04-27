// src/app/page.tsx
'use client';

import { motion } from "framer-motion";
import HeroScrollScene from "@/components/ui/HeroScrollScene";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Image from "next/image";
import Footer from "@/components/ui/Footer";
import AnimatedHeroTitle from "@/components/ui/AnimatedHeroTitle";
import TileCrossLiftField from "@/components/ui/TileCrossLiftField";
import TileMaskOverlay from "@/components/ui/TileMaskOverlay";
import NoiseGrainOverlay from "@/components/ui/NoiseGrainOverlay";
import FeaturedWork from "@/components/ui/FeaturedWork";
import Timeline from "@/components/ui/Timeline";
import ServicesStack from "@/components/ui/ServicesStack";

const HERO_CHAR_RISE_DURATION_S = 0.7;

function getHeroTitleAnimationEndMs(lines: string[], delay: number, stagger: number) {
  const maxEndSeconds = Math.max(
    ...lines.map((line, lineIndex) => {
      const chars = Array.from(line);
      const lastCharOffset = Math.max(0, chars.length - 1) * stagger;
      const lineDelay = delay + lineIndex * (chars.length * stagger + 0.18);
      return lineDelay + lastCharOffset + HERO_CHAR_RISE_DURATION_S;
    }),
  );
  return Math.round(maxEndSeconds * 1000);
}

export default function HomePage() {
  const heroTitleLines = ["Strategy. Design. Engineering.", "One collaborative partner."];
  const heroTileStartDelayMs = 1150;
  const heroTileSequenceDurationMs = 670;
  const heroTitleDelay = (heroTileStartDelayMs + heroTileSequenceDurationMs + 120) / 1000;
  const heroTitleStagger = 0.028;
  const heroAmbientCrossStartDelayMs =
    getHeroTitleAnimationEndMs(heroTitleLines, heroTitleDelay, heroTitleStagger);

  return (
    <>
    <main className="w-full overflow-x-clip">
      {/* Content wrapper — sits above fixed footer */}
      <div style={{ position: 'relative', zIndex: 20, backgroundColor: '#f2f2f7' }}>
      <HeroScrollScene
        sheetColor="#f2f2f7"
        hero={({ isActive }) => (
          <div className="relative w-full h-screen overflow-hidden">
            <NoiseGrainOverlay className="absolute inset-0 z-50 mix-blend-overlay opacity-65 pointer-events-none" patternWidth={100} patternHeight={100} grainOpacity={0.09} grainSpeed={8} />
            <motion.div
              className="absolute inset-0"
              animate={{ scale: 1.6, x: "18%", y: "18%" }}
              transition={{ duration: 7, ease: "easeInOut" }}
              style={{ transformOrigin: "center center" }}
            >
              <Image src="/images/purple.jpg" alt="Strand" fill className="object-cover" priority />
            </motion.div>
            <TileCrossLiftField
              className="absolute inset-0 z-10"
              backgroundColor="transparent"
              tileColor="transparent"
              glowColor="rgba(242, 242, 247, 0.7)"
              isActive={isActive}
              tileSize={82}
              minRows={8}
              minCols={12}
              initialTriggerMinDelayMs={120}
              initialTriggerMaxDelayMs={420}
              minTriggerDelayMs={1000}
              maxTriggerDelayMs={1000}
              startDelayMs={heroAmbientCrossStartDelayMs}
              showBorder={false}
            />
            <TileMaskOverlay
              className="z-[11]"
              color="#9589d3"
              tileSize={82}
              speed={6}
              startDelayMs={heroTileStartDelayMs}
              enableHoverTrail={true}
            />
            <div className="absolute inset-0 z-20 flex items-center" style={{ opacity: 'var(--hero-header-opacity, 1)', transform: 'scale(var(--hero-header-scale, 1)) translateY(var(--hero-header-y, 0px))', transformOrigin: 'center center' }}>
              <div className="grid-container w-full">
                <div className="grid-layout">
                  <div className="grid-span-12 flex justify-center">
                    <div style={{ width: 'calc((((100% - 11rem) / 12) * 5) + 4rem)', pointerEvents: 'auto' }}>
                      <Card
                        title=""
                        initialColor="#9589d3"
                        customContent={
                          <div style={{ color: '#2d2d2d', fontFamily: 'var(--font-heading)', fontWeight: 600, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ fontSize: 'clamp(1.5rem, 2.8vw, 2.25rem)', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
                              <AnimatedHeroTitle
                                lines={heroTitleLines}
                                delay={heroTitleDelay}
                                stagger={heroTitleStagger}
                              />
                            </div>
                            <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(0.8125rem, 1.2vw, 0.9375rem)', color: '#2d2d2d', lineHeight: 1.6, letterSpacing: '-0.01em', fontWeight: 400, margin: 0 }}>
                              We research how your customers search, build the identity that earns their trust, and engineer the product that delivers on it. Every layer covered, one partner, nothing left to chance.
                            </p>
                          </div>
                        }
                      >
                        <Button initialColor="#9589d3" href="/contact">Let&apos;s talk</Button>
                      </Card>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        next={
          <section className="relative min-h-screen w-full">
            <div className="relative z-10">
              <ServicesStack />
              <FeaturedWork />
              <Timeline />
            </div>
          </section>
        }
      />
      </div>
      {/* Transparent spacer — lets fixed footer show through */}
      <div id="footer-spacer" style={{ height: '200vh', position: 'relative', zIndex: 0 }} />
    </main>
    <Footer />
    </>
  );
}
