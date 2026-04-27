"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Branding", href: "/services?service=branding" },
  { label: "Engineering", href: "/services?service=engineering" },
  { label: "Strategy", href: "/services/strategy" },
  { label: "Contact", href: "/contact" },
];

const CONTACT_INFO = [
  { label: "Pablo Rojas", href: null },
  { label: "pabrojas@uw.edu", href: "mailto:pabrojas@uw.edu" },
  { label: "(206) 581-7359", href: "tel:+12065817359" },
];

const linkStyle = {
  fontFamily: 'var(--font-heading)',
  fontSize: 'clamp(0.875rem, 1.2vw, 1rem)',
  fontWeight: 400,
  letterSpacing: '-0.01em',
  color: 'rgba(255,255,255,0.4)' as string,
  textDecoration: 'none',
  transition: 'color 0.25s ease',
};

export default function Footer() {
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const spacer = document.getElementById("footer-spacer");
    if (!spacer || !innerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        innerRef.current,
        { y: "70vh" },
        {
          y: "0vh",
          ease: "none",
          scrollTrigger: {
            trigger: spacer,
            start: "top bottom",
            end: "bottom bottom",
            scrub: 1.5,
          },
        }
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <footer
      className="w-full overflow-hidden grid-container"
      style={{
        height: '100vh',
        backgroundColor: '#141314',
        position: 'fixed',
        bottom: 0,
        left: 0,
        zIndex: 0,
        paddingTop: '4rem',
      }}
    >
      <div ref={innerRef} className="grid-layout items-start h-full">

        {/* Availability — col 1 */}
        <div className="grid-span-2 grid-start-1 flex flex-col" style={{ gap: '0.625rem' }}>
          <span style={linkStyle}>Accepting Projects</span>
          <span style={{ ...linkStyle, color: 'rgba(255,255,255,0.9)' }}>2 spots left</span>
        </div>

        {/* Nav — centered around col 6/7 gutter */}
        <nav className="grid-span-2 grid-start-6 flex flex-col" style={{ gap: '0.625rem' }}>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              style={linkStyle}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.9)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Contact — col 10 */}
        <div className="grid-span-2 grid-start-10 flex flex-col" style={{ gap: '0.625rem' }}>
          {CONTACT_INFO.map(({ label, href }) =>
            href ? (
              <a
                key={label}
                href={href}
                style={linkStyle}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.9)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
              >
                {label}
              </a>
            ) : (
              <span key={label} style={linkStyle}>
                {label}
              </span>
            )
          )}
        </div>

      </div>
    </footer>
  );
}
