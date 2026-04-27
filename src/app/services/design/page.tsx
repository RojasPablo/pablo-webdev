'use client';

import HeroScrollScene from "@/components/ui/HeroScrollScene";
import ServicePageHero from "@/components/ui/ServicePageHero";
import DesignSection from "@/components/services/DesignSection";

export default function DesignPage() {
  return (
    <div className="min-h-screen w-full">
      <HeroScrollScene
        sheetColor="#f2f2f7"
        darkenHero={false}
        hero={({ scrollYProgress }) => (
          <ServicePageHero
            scrollYProgress={scrollYProgress}
            image="/images/green.jpg"
            titleLines={["Design."]}
            description="We design the full system behind your product, from creative direction and brand language to interaction patterns and scalable component libraries. Every deliverable is built to stay consistent across screens, campaigns, and whatever comes next."
            accentColor="#8ed462"
            introColor="#d7dddb"
          />
        )}
        next={
          <div className="relative w-full bg-[#f2f2f7]">
            <DesignSection />
          </div>
        }
      />
    </div>
  );
}
