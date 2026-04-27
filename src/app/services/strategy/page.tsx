'use client';

import HeroScrollScene from "@/components/ui/HeroScrollScene";
import ServicePageHero from "@/components/ui/ServicePageHero";
import StrategySection from "@/components/services/StrategySection";

export default function StrategyPage() {
  return (
    <div className="min-h-screen w-full">
      <HeroScrollScene
        sheetColor="#f2f2f7"
        darkenHero={false}
        hero={({ scrollYProgress }) => (
          <ServicePageHero
            scrollYProgress={scrollYProgress}
            image="/images/purple.jpg"
            titleLines={["Strategy."]}
            description="We audit your site, research where the real opportunities are, and build the technical and content foundation to capture them. Then we track every metric, report monthly, and keep refining because rankings never stand still."
            accentColor="#9589d3"
            introColor="#d7c4f9"
          />
        )}
        next={
          <div className="relative w-full bg-[#f2f2f7]">
            <StrategySection />
          </div>
        }
      />
    </div>
  );
}
