'use client';

import HeroScrollScene from "@/components/ui/HeroScrollScene";
import ServicePageHero from "@/components/ui/ServicePageHero";
import EngineeringSection from "@/components/services/EngineeringSection";

export default function EngineeringPage() {
  return (
    <div className="min-h-screen w-full">
      <HeroScrollScene
        sheetColor="#f2f2f7"
        darkenHero={false}
        hero={({ scrollYProgress }) => (
          <ServicePageHero
            scrollYProgress={scrollYProgress}
            image="/images/blue2.jpg"
            titleLines={["Engineering."]}
            description="We build every layer of your product, from architecture and infrastructure to storefronts, SaaS applications, and connected APIs. Performance is a feature, reliability is a requirement, and every decision is made to hold up as you scale."
            accentColor="#2093ff"
            introColor="#507cce"
          />
        )}
        next={
          <div className="relative w-full bg-[#f2f2f7]">
            <EngineeringSection />
          </div>
        }
      />
    </div>
  );
}
