'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Link, useTransitionRouter } from 'next-view-transitions';
import { usePathname } from 'next/navigation';
import { SiCodemagic } from 'react-icons/si';
import { BiCodeAlt } from 'react-icons/bi';
import { BsSearch } from 'react-icons/bs';
import { IoIosSend } from 'react-icons/io';
import { RiArrowRightUpLine } from 'react-icons/ri';
import MenuButton from './MenuButton';
import TileMaskOverlay from './TileMaskOverlay';
import NoiseGrainOverlay from './NoiseGrainOverlay';


type CardIcon =
  | 'profile'
  | 'phone'
  | 'arrow-up'
  | 'sparkle'
  | 'codemagic'
  | 'code'
  | 'search'
  | 'loop'
  | 'paper-plane';

type CardLine = { text: string; href?: string };
type MenuCard = { title: string; lines: CardLine[]; bg: string; text: string; accentBg: string; accentText: string; icon: CardIcon; solidBg?: string; footer?: string; };

const menuCards: MenuCard[] = [
  {
    title: 'Pablo R.',
    lines: [
      { text: 'Lead Engineer' },
      { text: 'Based in Washington' }
    ] as CardLine[],
    bg: '#ffffff',
    text: '#1f8bff',
    accentBg: '#1f8bff',
    accentText: '#ffffff',
    icon: 'code' as CardIcon,
  },
  {
    title: 'Get in touch @',
    lines: [
      { text: 'Phone: (206) 581-7359', href: 'tel:12065817359' },
      { text: 'Email: pabrojas@uw.edu', href: 'mailto:pabrojas@uw.edu' },
    ] as CardLine[],
    bg: '#ffffff',
    text: '#ffffff',
    accentBg: '#ffffff',
    accentText: '#5ac55d',
    solidBg: '#5ac55d',
    icon: 'paper-plane' as CardIcon,
  },
  {
    title: 'Ready for you!',
    lines: [
      { text: "Let’s build something," },
      { text: "together" }
    ] as CardLine[],
    bg: '#fa435b',
    text: '#ffffff',
    accentBg: '#ffffff',
    accentText: '#f95f55',
    icon: 'arrow-up' as CardIcon,
  },
];

const serviceMenuCards = [
  {
    title: 'Branding',
    lines: [{ text: 'Identity, voice, and visuals that feel intentional.' }] as CardLine[],
    bg: '#5ac55d',
    text: '#ffffff',
    accentBg: '#ffffff',
    accentText: '#000000',
    icon: 'codemagic' as CardIcon,
    serviceId: 'branding',
    href: '/services/design',
  },
  {
    title: 'Web\u00A0Dev',
    lines: [{ text: 'Fast, modern builds that are easy to ship and maintain.' }] as CardLine[],
    bg: '#1f8bff',
    text: '#ffffff',
    accentBg: '#ffffff',
    accentText: '#1f8bff',
    icon: 'code' as CardIcon,
    serviceId: 'engineering',
    href: '/services/engineering',
  },
  {
    title: 'Strategy',
    lines: [{ text: 'Technical + content tweaks that compound rankings.' }] as CardLine[],
    bg: '#141314',
    text: '#ffffff',
    accentBg: '#FFFFFF',
    accentText: '#141314',
    icon: 'search' as CardIcon,
    serviceId: 'seo',
    href: '/services/strategy',
  },
  {
    title: 'Pricing',
    lines: [{ text: 'Monthly support that moves with your roadmap.' }] as CardLine[],
    bg: '#fa435b',
    text: '#ffffff',
    accentBg: '#ffffff',
    accentText: '#ff5c46',
    icon: 'arrow-up' as CardIcon,
    serviceId: 'pricing',
    href: '/services/pricing',
  },
];

const SHOW_NAV_DROPDOWN_CARD_ICONS = true;
const NAV_DROPDOWN_GRAIN_DELAY_MS = 0;

function lightenHexColor(hexColor: string, lightenAmount = 0.18) {
  const normalized = hexColor.trim().replace('#', '');
  const isShortHex = /^[0-9a-fA-F]{3}$/.test(normalized);
  const isLongHex = /^[0-9a-fA-F]{6}$/.test(normalized);

  if (!isShortHex && !isLongHex) {
    return '#1a1a1a';
  }

  const expanded = isShortHex
    ? normalized
        .split('')
        .map((char) => `${char}${char}`)
        .join('')
    : normalized;

  const channels = [0, 2, 4].map((startIndex) => parseInt(expanded.slice(startIndex, startIndex + 2), 16));
  const amount = Math.max(0, Math.min(1, lightenAmount));
  const lightened = channels.map((value) => Math.round(value + (255 - value) * amount));

  return `#${lightened.map((value) => value.toString(16).padStart(2, '0')).join('')}`;
}

function isLightHexColor(hexColor: string) {
  const normalized = hexColor.trim().replace('#', '');
  const isShortHex = /^[0-9a-fA-F]{3}$/.test(normalized);
  const isLongHex = /^[0-9a-fA-F]{6}$/.test(normalized);

  if (!isShortHex && !isLongHex) {
    return false;
  }

  const expanded = isShortHex
    ? normalized
        .split('')
        .map((char) => `${char}${char}`)
        .join('')
    : normalized;

  const r = parseInt(expanded.slice(0, 2), 16);
  const g = parseInt(expanded.slice(2, 4), 16);
  const b = parseInt(expanded.slice(4, 6), 16);
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

  return luminance > 0.7;
}

function getLayerOneIconColor(backgroundHex: string, preferredColor?: string) {
  return isLightHexColor(backgroundHex) ? preferredColor ?? '#000000' : '#ffffff';
}

function CardIconBadge({ type, bg, color }: { type: CardIcon; bg: string; color: string }) {
  return (
    <span
      className="flex h-11 w-11 items-center justify-center rounded-full"
      style={{ backgroundColor: bg, color }}
    >
      <CardIconGlyph type={type} className="h-6 w-6" color={color} />
    </span>
  );
}

function CardIconGlyph({ type, className, color }: { type: CardIcon; className?: string; color?: string }) {
  const common = { width: 24, height: 24, strokeWidth: 2, stroke: 'currentColor', fill: 'none' };
  const sizedCommon = { ...common, className, style: color ? { color } : undefined };

  if (type === 'profile') {
    return (
      <svg viewBox="0 0 24 24" {...sizedCommon}>
        <circle cx="12" cy="12" r="8" />
        <circle cx="9" cy="11" r="1" fill="currentColor" stroke="none" />
        <circle cx="15" cy="11" r="1" fill="currentColor" stroke="none" />
        <path d="M9 15c.7.7 1.6 1.1 3 1.1s2.3-.4 3-1.1" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === 'phone') {
    return (
      <svg viewBox="0 0 24 24" {...sizedCommon}>
        <path
          d="M4.5 6h15a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="m4 7.5 7.6 5.3c.14.1.33.1.48 0L20 7.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (type === 'arrow-up') {
    return <RiArrowRightUpLine className={className} style={color ? { color } : undefined} />;
  }

  if (type === 'sparkle') {
    return (
      <svg viewBox="0 0 24 24" {...sizedCommon}>
        <path d="M12 3.5 13.6 9 19 10.6 13.6 12.2 12 17.7 10.4 12.2 5 10.6 10.4 9 12 3.5Z" />
      </svg>
    );
  }

  if (type === 'codemagic') {
    return <SiCodemagic className={className} style={color ? { color } : undefined} />;
  }

  if (type === 'code') {
    return <BiCodeAlt className={className} style={color ? { color } : undefined} />;
  }

  if (type === 'search') {
    return <BsSearch className={className} style={color ? { color } : undefined} />;
  }

  if (type === 'paper-plane') {
    return <IoIosSend className={className} style={color ? { color } : undefined} />;
  }

  if (type === 'loop') {
    return (
      <svg
        viewBox="0 0 24 24"
        className={className}
        style={color ? { color } : undefined}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
      </svg>
    );
  }

  return null;
}

export default function Nav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesMenuOpen, setServicesMenuOpen] = useState(false);
  const [serviceHoverTileMaskRuns, setServiceHoverTileMaskRuns] = useState<Record<string, number>>({});
  const [menuCardHoverTileMaskRuns, setMenuCardHoverTileMaskRuns] = useState<Record<string, number>>({});
  const [isMdUp, setIsMdUp] = useState(false);
  const [mobileMenuGrainEnabled, setMobileMenuGrainEnabled] = useState(false);
  const [servicesMenuGrainEnabled, setServicesMenuGrainEnabled] = useState(false);
  const [scrollOpacity, setScrollOpacity] = useState(1);
  const [startupVisible, setStartupVisible] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const servicesCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mobileMenuGrainTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const servicesMenuGrainTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();
  const router = useTransitionRouter();
  const useDarkNav = pathname.startsWith('/services/') || pathname === '/contact';

  useEffect(() => {
    if (pathname !== '/') {
      setStartupVisible(true);
      return;
    }
    const timer = window.setTimeout(() => setStartupVisible(true), 1820);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  const handleServiceClick = (href: string) => {
    setServicesMenuOpen(false);
    setServicesMenuGrainEnabled(false);
    router.push(href);
  };

  const handleMenuCardClick = () => {
    setMobileMenuOpen(false);
    setMobileMenuGrainEnabled(false);
    router.push('/contact');
  };

  const openMenu = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setMobileMenuOpen(true);
    setMobileMenuGrainEnabled(true);
  };

  const scheduleCloseMenu = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
    }
    closeTimerRef.current = setTimeout(() => {
      setMobileMenuOpen(false);
      setMobileMenuGrainEnabled(false);
      closeTimerRef.current = null;
    }, 150);
  };

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }

    const mediaQuery = window.matchMedia('(min-width: 768px)');
    const syncMatch = () => setIsMdUp(mediaQuery.matches);
    syncMatch();

    mediaQuery.addEventListener('change', syncMatch);
    return () => mediaQuery.removeEventListener('change', syncMatch);
  }, []);

  useEffect(() => {
    if (mobileMenuGrainTimerRef.current) {
      clearTimeout(mobileMenuGrainTimerRef.current);
      mobileMenuGrainTimerRef.current = null;
    }

    if (!mobileMenuOpen) {
      return;
    }

    if (NAV_DROPDOWN_GRAIN_DELAY_MS <= 0) {
      return;
    }

    mobileMenuGrainTimerRef.current = setTimeout(() => {
      setMobileMenuGrainEnabled(true);
      mobileMenuGrainTimerRef.current = null;
    }, NAV_DROPDOWN_GRAIN_DELAY_MS);
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (servicesMenuGrainTimerRef.current) {
      clearTimeout(servicesMenuGrainTimerRef.current);
      servicesMenuGrainTimerRef.current = null;
    }

    if (!servicesMenuOpen) {
      return;
    }

    if (NAV_DROPDOWN_GRAIN_DELAY_MS <= 0) {
      return;
    }

    servicesMenuGrainTimerRef.current = setTimeout(() => {
      setServicesMenuGrainEnabled(true);
      servicesMenuGrainTimerRef.current = null;
    }, NAV_DROPDOWN_GRAIN_DELAY_MS);
  }, [servicesMenuOpen]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
      if (servicesCloseTimerRef.current) {
        clearTimeout(servicesCloseTimerRef.current);
      }
      if (mobileMenuGrainTimerRef.current) {
        clearTimeout(mobileMenuGrainTimerRef.current);
      }
      if (servicesMenuGrainTimerRef.current) {
        clearTimeout(servicesMenuGrainTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    let rafId: number | null = null;
    const handleScroll = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(() => {
        const y = window.scrollY;
        const fadeStart = 0;
        const fadeEnd = 220;
        const next =
          y <= fadeStart
            ? 1
            : y >= fadeEnd
              ? 0
              : 1 - (y - fadeStart) / (fadeEnd - fadeStart);
        setScrollOpacity(next);
        rafId = null;
      });
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const openServicesMenu = () => {
    if (servicesCloseTimerRef.current) {
      clearTimeout(servicesCloseTimerRef.current);
      servicesCloseTimerRef.current = null;
    }
    setServicesMenuOpen(true);
    setServicesMenuGrainEnabled(true);
  };

  const scheduleCloseServicesMenu = () => {
    if (servicesCloseTimerRef.current) {
      clearTimeout(servicesCloseTimerRef.current);
    }
    servicesCloseTimerRef.current = setTimeout(() => {
      setServicesMenuOpen(false);
      setServicesMenuGrainEnabled(false);
      servicesCloseTimerRef.current = null;
    }, 150);
  };

  const triggerServiceHoverTileMask = (serviceId: string) => {
    setServiceHoverTileMaskRuns((prev) => ({
      ...prev,
      [serviceId]: (prev[serviceId] ?? 0) + 1,
    }));
  };

  const triggerMenuCardHoverTileMask = (cardId: string) => {
    setMenuCardHoverTileMaskRuns((prev) => ({
      ...prev,
      [cardId]: (prev[cardId] ?? 0) + 1,
    }));
  };

  const isAnyMenuOpen = mobileMenuOpen || servicesMenuOpen;

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    document.documentElement.dataset.navMenuOpen = isAnyMenuOpen ? 'true' : 'false';
    document.dispatchEvent(new Event('nav-menu-grain-pause-change'));

    return () => {
      if (!isAnyMenuOpen) {
        return;
      }
      document.documentElement.dataset.navMenuOpen = 'false';
      document.dispatchEvent(new Event('nav-menu-grain-pause-change'));
    };
  }, [isAnyMenuOpen]);

  const hideNavOnRoute = pathname === '/test' || pathname.startsWith('/test/');

  if (hideNavOnRoute) {
    return null;
  }

  return (
    <nav
      className="absolute inset-x-0 top-0 z-50 w-full py-4"
      style={{
        opacity: startupVisible ? scrollOpacity : 0,
        transition: 'opacity 0.2s ease',
        pointerEvents: (startupVisible && scrollOpacity >= 0.05) ? 'auto' : 'none',
        viewTransitionName: 'nav',
      }}
    >
      <style dangerouslySetInnerHTML={{
        __html: `
.menu-drop {
            display: grid;
            grid-template-rows: 0fr;
            opacity: 0;
            transform: translateY(-18px);
            transform-origin: top;
            transition: grid-template-rows 0.75s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
            will-change: grid-template-rows, opacity, transform;
          }
          .menu-drop--open {
            grid-template-rows: 1fr;
            opacity: 1;
            transform: translateY(0);
          }
          .menu-drop__content {
            opacity: 0;
            min-height: 0;
            overflow: hidden;
            transition: opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          }
          .menu-drop--open .menu-drop__content {
            opacity: 1;
            transition-delay: 0.08s;
          }
          .nav-tagline {
            display: inline-flex;
            gap: 0.35em;
            overflow: hidden;
            max-width: 0;
            opacity: 0;
            transition: max-width 0.55s ease, opacity 0.55s ease;
            will-change: max-width, opacity;
          }
          .group:hover .nav-tagline {
            max-width: 360px;
            opacity: 1;
          }
          .nav-tagline-word {
            display: inline-block;
            opacity: 0;
            transform: translateY(6px);
            transition: opacity 0.55s ease, transform 0.55s ease;
            transition-delay: var(--delay, 0ms);
          }
          .group:hover .nav-tagline-word {
            opacity: 1;
            transform: translateY(0);
          }
          .nav-route-link {
            color: var(--nav-route-link-color, #ffffff);
            transition: color 0.2s ease;
          }
          .nav-route-link:hover,
          .nav-route-link[data-active='true'] {
            color: var(--nav-route-link-active-color, currentColor);
          }
        `
      }} />
      <div
        className={`fixed inset-0 z-0 bg-black/50 transition-opacity duration-200 ${
          isAnyMenuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => {
          setMobileMenuOpen(false);
          setServicesMenuOpen(false);
          setMobileMenuGrainEnabled(false);
          setServicesMenuGrainEnabled(false);
        }}
        aria-hidden="true"
      />

      <div className="grid-container relative z-10">
        {/* Wrapper for black container and dropdown menu */}
        <div
          className="w-full relative"
          onMouseLeave={scheduleCloseMenu}
        >
          {/* Nav bar */}
          <div className="flex items-center justify-between h-[65px]">
            {/* Logo */}
            <Link href="/" className="group flex items-center gap-2 flex-shrink-0" style={{ fontFamily: 'var(--font-heading)' }}>
              <span className="text-xl" style={{ color: useDarkNav ? '#141314' : '#ffffff' }}>Strand.</span>
              <span className="nav-tagline text-sm whitespace-nowrap" style={{ color: useDarkNav ? 'rgba(20,19,20,0.6)' : 'rgba(255,255,255,0.7)' }}>
                <span className="nav-tagline-word" style={{ '--delay': '0ms' } as CSSProperties}>A</span>
                <span className="nav-tagline-word" style={{ '--delay': '140ms' } as CSSProperties}>web</span>
                <span className="nav-tagline-word" style={{ '--delay': '280ms' } as CSSProperties}>development</span>
                <span className="nav-tagline-word" style={{ '--delay': '420ms' } as CSSProperties}>company</span>
              </span>
            </Link>

            {/* Links — absolutely centered so logo expansion doesn't shift them */}
            <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-8">
              {[
                { href: '/services/strategy', label: 'Strategy' },
                { href: '/services/design', label: 'Design' },
                { href: '/services/engineering', label: 'Engineering' },
                { href: '/services/pricing', label: 'Pricing' },
                { href: '/contact', label: 'Contact' },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  data-active={pathname === href ? 'true' : 'false'}
                  className="nav-link nav-route-link text-[17px]"
                  style={{
                    fontFamily: 'var(--font-heading)',
                    ['--nav-route-link-color' as '--nav-route-link-color']:
                      useDarkNav ? 'rgba(20, 19, 20, 0.5)' : '#ffffff',
                    ['--nav-route-link-active-color' as '--nav-route-link-active-color']: '#141314',
                  }}
                >
                  {label}
                </Link>
              ))}
            </div>

            {/* Hamburger */}
            <MenuButton
              isOpen={mobileMenuOpen}
              onMouseEnter={openMenu}
              onMouseLeave={scheduleCloseMenu}
            />
          </div>

          {/* Mobile Menu - positioned absolute relative to wrapper */}
          <div
            className={`absolute left-0 right-0 menu-drop ${
              mobileMenuOpen ? 'menu-drop--open pointer-events-auto' : 'pointer-events-none'
            }`}
            style={{ top: 'calc(100% + 1rem)' }}
            onMouseEnter={openMenu}
            onMouseLeave={scheduleCloseMenu}
          >
            <div className="menu-drop__content bg-black rounded-[5px] shadow-lg py-4 px-4 text-left">
              <div className="grid grid-cols-2 gap-4 md:hidden">
                {serviceMenuCards.map((card) => (
                  <button
                    key={card.title}
                    onClick={() => handleServiceClick(card.href)}
                    className="group relative aspect-square w-full overflow-hidden rounded-[5px] border shadow-sm transition-shadow duration-200 hover:shadow-md cursor-pointer text-left"
                    style={{
                      backgroundColor: card.bg,
                      color: card.text,
                      borderColor: card.bg,
                      fontFamily: 'var(--font-body)',
                      textAlign: 'left',
                    }}
                  >
                    {mobileMenuGrainEnabled && !isMdUp && (
                      <NoiseGrainOverlay
                        className="z-0 mix-blend-overlay opacity-65"
                        patternWidth={100}
                        patternHeight={100}
                        grainOpacity={0.09}
                        grainSpeed={6}
                        dprCap={1}
                        pauseWhenNavMenuOpen={false}
                      />
                    )}

                    <div className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center overflow-hidden">
                      <div className="relative h-[108%] w-[108%] -translate-x-1/2">
                        <div className="absolute inset-0 opacity-[0.22]">
                          <CardIconGlyph
                            type={card.icon}
                            className="h-full w-full"
                            color={getLayerOneIconColor(card.bg, card.text)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="relative z-10 flex h-full w-full flex-col items-start pt-4 pr-3 pb-1 pl-2 text-left">
                      <div
                        className="absolute right-4 top-4"
                        style={{ display: SHOW_NAV_DROPDOWN_CARD_ICONS ? undefined : 'none' }}
                      >
                        <CardIconBadge type={card.icon} bg={card.accentBg} color={card.accentText} />
                      </div>

                      <p
                        className="mt-auto w-full self-start text-left text-[1.35rem] font-semibold leading-tight tracking-tight"
                        style={{ fontFamily: 'var(--font-heading)', color: card.text }}
                      >
                        {card.title}
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="hidden gap-4 md:grid md:grid-cols-2 lg:grid-cols-3">
                {menuCards.map((card) => (
                  <button
                    key={card.title}
                    type="button"
                    onClick={handleMenuCardClick}
                    onMouseEnter={() => triggerMenuCardHoverTileMask(card.title)}
                    className="group relative overflow-hidden rounded-[5px] border shadow-sm"
                    style={{
                      fontFamily: 'var(--font-body)',
                      backgroundColor: card.solidBg ?? card.bg,
                      color: card.text,
                      borderColor: card.solidBg ?? card.bg,
                      textAlign: 'left',
                    }}
                  >
                    {mobileMenuGrainEnabled && isMdUp && (
                      <NoiseGrainOverlay
                        className="z-0 mix-blend-overlay opacity-65"
                        patternWidth={100}
                        patternHeight={100}
                        grainOpacity={0.09}
                        grainSpeed={6}
                        dprCap={1}
                        pauseWhenNavMenuOpen={false}
                      />
                    )}

                    {(menuCardHoverTileMaskRuns[card.title] ?? 0) > 0 && (
                      <TileMaskOverlay
                        key={`menu-card-hover-mask-${card.title}-${menuCardHoverTileMaskRuns[card.title]}`}
                        className="z-[2]"
                        color={lightenHexColor(card.solidBg ?? card.bg)}
                        speed={10}
                        tileSize={34}
                        minRows={5}
                        minCols={5}
                        enableHoverTrail={false}
                      />
                    )}

                    <div className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center overflow-hidden">
                      <div className="relative h-[108%] w-[108%] -translate-x-1/2">
                        <div className="absolute inset-0 opacity-[0.22]">
                          <CardIconGlyph
                            type={card.icon}
                            className="h-full w-full"
                            color={getLayerOneIconColor(card.solidBg ?? card.bg, card.text)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="relative z-10 flex h-full w-full flex-col items-start gap-4 p-5 text-left">
                      <div
                        className="absolute right-5 top-5"
                        style={{ display: SHOW_NAV_DROPDOWN_CARD_ICONS ? undefined : 'none' }}
                      >
                        <CardIconBadge type={card.icon} bg={card.accentBg} color={card.accentText} />
                      </div>

                      <p
                        className="mt-10 w-full self-start text-left text-4xl md:text-5xl font-semibold leading-tight pr-12"
                        style={{ fontFamily: 'var(--font-heading)', color: card.text }}
                      >
                        {card.title}
                      </p>

                      <div className="flex-1" />

                      <div className="w-full self-start space-y-1 text-left text-sm font-medium leading-snug" style={{ color: card.text }}>
                        {card.lines.map((line) => (
                          <p key={line.text} className="block">{line.text}</p>
                        ))}
                      </div>

                      {card.footer && (
                        <p
                          className="w-full self-start text-left text-sm leading-relaxed"
                          style={{ color: card.text }}
                        >
                          {card.footer}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Services dropdown (desktop hover on Services link) */}
          <div
            className={`absolute left-0 right-0 menu-drop ${
              servicesMenuOpen ? 'menu-drop--open pointer-events-auto' : 'pointer-events-none'
            }`}
            style={{ top: 'calc(100% + 1rem)' }}
            onMouseEnter={openServicesMenu}
            onMouseLeave={scheduleCloseServicesMenu}
          >
            <div
              className="menu-drop__content bg-black rounded-[5px] shadow-lg py-4 px-4"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                {serviceMenuCards.map((card) => (
                  <button
                    key={card.title}
                    onClick={() => handleServiceClick(card.href)}
                    onMouseEnter={() => triggerServiceHoverTileMask(card.serviceId)}
                    className="group relative aspect-square overflow-hidden rounded-[5px] border shadow-sm transition-shadow duration-200 hover:shadow-md cursor-pointer text-left w-full"
                    style={{
                      backgroundColor: card.bg,
                      color: card.text,
                      borderColor: card.bg,
                      fontFamily: 'var(--font-body)'
                    }}
                  >
                    {servicesMenuGrainEnabled && (
                      <NoiseGrainOverlay
                        className="z-0 mix-blend-overlay opacity-65"
                        patternWidth={100}
                        patternHeight={100}
                        grainOpacity={0.09}
                        grainSpeed={6}
                        dprCap={1}
                        pauseWhenNavMenuOpen={false}
                      />
                    )}

                    {(serviceHoverTileMaskRuns[card.serviceId] ?? 0) > 0 && (
                      <TileMaskOverlay
                        key={`service-hover-mask-${card.serviceId}-${serviceHoverTileMaskRuns[card.serviceId]}`}
                        className="z-[2]"
                        color={lightenHexColor(card.bg)}
                        speed={10}
                        tileSize={34}
                        minRows={5}
                        minCols={5}
                        enableHoverTrail={false}
                      />
                    )}

                    <div className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center overflow-hidden">
                      <div className="relative h-[108%] w-[108%] -translate-x-1/2">
                        <div className="absolute inset-0 opacity-[0.22]">
                          <CardIconGlyph
                            type={card.icon}
                            className="h-full w-full"
                            color={getLayerOneIconColor(card.bg, card.text)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="relative z-10 flex h-full flex-col gap-4 pt-5 pr-5 pb-1 pl-2">
                      <div
                        className="absolute right-5 top-5"
                        style={{ display: SHOW_NAV_DROPDOWN_CARD_ICONS ? undefined : 'none' }}
                      >
                        <CardIconBadge type={card.icon} bg={card.accentBg} color={card.accentText} />
                      </div>

                      <div className="h-5" aria-hidden="true" />

                      <p
                        className="mt-auto text-[1.8rem] md:text-[2.1rem] font-semibold leading-tight pr-12"
                        style={{ fontFamily: 'var(--font-heading)', color: card.text }}
                      >
                        {card.title}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </nav>
  );
}
