'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Hero from '@/components/ui/Hero';
import HeroScrollScene from '@/components/ui/HeroScrollScene';
import AnimatedHeroTitle from '@/components/ui/AnimatedHeroTitle';
import TileCrossLiftField from '@/components/ui/TileCrossLiftField';
import TileMaskOverlay from '@/components/ui/TileMaskOverlay';
import NoiseGrainOverlay from '@/components/ui/NoiseGrainOverlay';
import DesignSection from '@/components/services/DesignSection';
import EngineeringSection from '@/components/services/EngineeringSection';
import StrategySection from '@/components/services/StrategySection';
import PricingSection from '@/components/services/PricingSection';

type ServiceId = 'branding' | 'engineering' | 'seo' | 'pricing';

const HERO_CHAR_RISE_DURATION_S = 0.7;

const isServiceId = (value: string | null): value is ServiceId =>
  value === 'branding' ||
  value === 'engineering' ||
  value === 'seo' ||
  value === 'pricing';

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

export default function ServicesPage() {
  const heroTitleLines = ['Strategy', 'Design', 'Engineering.'];
  const heroTileStartDelayMs = 1150;
  const heroTileSequenceDurationMs = 670;
  const heroTitleDelay = (heroTileStartDelayMs + heroTileSequenceDurationMs + 120) / 1000;
  const heroTitleStagger = 0.028;
  const heroAmbientCrossStartDelayMs =
    getHeroTitleAnimationEndMs(heroTitleLines, heroTitleDelay, heroTitleStagger);
  const searchParams = useSearchParams();

  const serviceParam = searchParams.get('service');
  useEffect(() => {
    document.body.classList.add('hide-scrollbar');
    document.documentElement.classList.add('hide-scrollbar');
    return () => {
      document.body.classList.remove('hide-scrollbar');
      document.documentElement.classList.remove('hide-scrollbar');
    };
  }, []);

  useEffect(() => {
    if (!isServiceId(serviceParam)) return;
    const section = document.getElementById(serviceParam);
    if (!section) return;

    const rect = section.getBoundingClientRect();
    const inView = rect.top <= 12 && rect.bottom >= 12;
    if (inView) return;
    const timeout = window.setTimeout(() => {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
    return () => window.clearTimeout(timeout);
  }, [serviceParam]);

  return (
    <div className="min-h-screen w-full">
      <HeroScrollScene
        hero={({ isActive }) => (
          <Hero
            variant="page"
            title={
              <AnimatedHeroTitle
                lines={heroTitleLines}
                delay={heroTitleDelay}
                stagger={heroTitleStagger}
              />
            }
            bgColor="#8fd462"
            headerClassName="services-hero-header"
            backgroundMedia={
              <>
                <TileCrossLiftField
                  className="z-0"
                  backgroundColor="#8fd462"
                  tileColor="rgba(242, 242, 247, 0.08)"
                  glowColor="rgba(242, 242, 247, 0.92)"
                  isActive={isActive}
                  tileSize={82}
                  minRows={8}
                  minCols={12}
                  initialTriggerMinDelayMs={120}
                  initialTriggerMaxDelayMs={420}
                  minTriggerDelayMs={1000}
                  maxTriggerDelayMs={1000}
                  startDelayMs={heroAmbientCrossStartDelayMs}
                />
                <TileMaskOverlay
                  className="z-[1]"
                  tileSize={82}
                  speed={6}
                  color="#f2f2f7"
                  startDelayMs={heroTileStartDelayMs}
                />
                <NoiseGrainOverlay
                  className="z-[2] mix-blend-overlay opacity-65"
                  patternWidth={100}
                  patternHeight={100}
                  grainOpacity={0.09}
                  grainSpeed={8}
                />
              </>
            }
          />
        )}
        next={
          <div data-services-stage className="relative w-full bg-white">
            <DesignSection />
            <EngineeringSection />
            <StrategySection />
            <PricingSection />
          </div>
        }
      />
    </div>
  );
}
