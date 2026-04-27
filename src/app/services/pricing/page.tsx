'use client';

import HeroScrollScene from '@/components/ui/HeroScrollScene';
import ServicePageHero from '@/components/ui/ServicePageHero';
import PricingSection from '@/components/services/PricingSection';

export default function PricingPage() {
  return (
    <div className="min-h-screen w-full">
      <HeroScrollScene
        sheetColor="#eeeeee"
        darkenHero={false}
        hero={({ scrollYProgress }) => (
          <ServicePageHero
            scrollYProgress={scrollYProgress}
            image="/images/red.jpg"
            titleLines={['Pricing.']}
            description="Clear, transparent pricing for new builds and ongoing retainers, structured around the stage your business is actually in. Pick your entry point and scale from there."
            accentColor="#fa435b"
          />
        )}
        next={
          <div className="relative w-full">
            <PricingSection />
          </div>
        }
      />
    </div>
  );
}
