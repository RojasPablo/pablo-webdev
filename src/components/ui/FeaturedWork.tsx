import Image from "next/image";
import Button from "@/components/ui/Button";

const projects = [
  {
    name: "Red Twig",
    image: "/images/cafe.jpg",
    href: "https://www.redtwig.com/",
    service: "Web Development — Growth Support",
    industry: "Cafe",
    year: "2025",
    blurb: "We've assisted Red Twig in handling seasonal rollouts and managing their growth.",
  },
  {
    name: "GemCare",
    image: "/images/gemcare.jpg",
    href: "https://family-care-six.vercel.app/",
    service: "Full Stack Build & Branding",
    industry: "Adult Home Care",
    year: "2025",
    blurb: "A brand and platform built together — designed to reflect the warmth and trust behind every care relationship.",
  },
  {
    name: "Elite Paralegal Services",
    image: "/images/eps.jpg",
    href: "https://eliteparalegalservices.com/",
    service: "SEO",
    industry: "Paralegal Services",
    year: "2025",
    blurb: "Targeted SEO that put Elite Paralegal Services in front of the right clients, driving measurable visibility and qualified leads.",
  },
];

export default function FeaturedWork() {
  return (
    <section className="relative left-1/2 right-1/2 mt-28 w-screen -ml-[50vw] -mr-[50vw] bg-[#141314] min-h-screen flex items-center py-24 lg:py-0">
      <div className="grid-container">

        {/* Heading */}
        <div className="mb-16 flex flex-col gap-6 items-center text-center">
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2rem, 4.5vw, 3rem)', fontWeight: 600, lineHeight: 1.1, letterSpacing: '-0.02em', color: '#f2f2f7', margin: 0 }}>
            Featured Work
          </h1>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(0.9375rem, 1.75vw, 1.125rem)', fontWeight: 400, lineHeight: 1.6, letterSpacing: '-0.01em', color: 'rgba(255,255,255,0.55)', margin: 0, maxWidth: '52ch' }}>
            Real results for real businesses. Designed to command attention, built to perform, and engineered to scale as you grow.
          </h2>
        </div>

        {/* Cards */}
        <div className="grid-layout">
          {projects.map((project) => (
            <div
              key={project.name}
              className="grid-span-12 lg:grid-span-4 group"
              style={{ backgroundColor: '#1e1d1e', borderRadius: '4px' }}
            >
              {/* Image + hover overlay */}
              <div className="p-2 pb-0">
                <div className="relative w-full aspect-[4/3] overflow-hidden" style={{ backgroundColor: '#2a292a', borderRadius: '2px' }}>
                  <Image
                    src={project.image}
                    alt={project.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-all duration-500 group-hover:blur-sm group-hover:scale-105"
                    style={{ willChange: 'transform, filter' }}
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 flex items-center justify-center p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div style={{ background: '#fff', borderRadius: '4px', padding: '1.5rem', width: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.7rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.4)' }}>Service</span>
                        <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.9375rem', fontWeight: 600, color: '#1a1a1a', lineHeight: 1.2 }}>{project.service}</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.7rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.4)' }}>Industry</span>
                        <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.9375rem', fontWeight: 600, color: '#1a1a1a', lineHeight: 1.2 }}>{project.industry}</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.7rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.4)' }}>Year</span>
                        <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.9375rem', fontWeight: 600, color: '#1a1a1a', lineHeight: 1.2 }}>{project.year}</span>
                      </div>
                      <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.875rem', fontWeight: 400, color: 'rgba(0,0,0,0.65)', lineHeight: 1.6, margin: 0, borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: '0.75rem' }}>
                        {project.blurb}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="flex flex-col gap-4 p-6">
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.25rem, 2vw, 1.5rem)', fontWeight: 600, lineHeight: 1.1, letterSpacing: '-0.02em', color: '#f2f2f7', margin: 0 }}>
                  {project.name}
                </h3>
                <Button initialColor="#f2f2f7" iconColor="#f2f2f7" iconBgColor="#1e1d1e" href={project.href} target="_blank">
                  Visit Site
                </Button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
