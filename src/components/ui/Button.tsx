'use client';

import { ReactNode } from 'react';
import Image from 'next/image';
import { Link } from 'next-view-transitions';
import TileMaskOverlay from '@/components/ui/TileMaskOverlay';

interface ButtonProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  initialColor?: string;
  iconBgColor?: string;
  iconColor?: string;
  icon?: ReactNode;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  tileMaskEnabled?: boolean;
  tileMaskDelayMs?: number;
  tileMaskColor?: string;
  tileMaskSpeed?: number;
  target?: string;
  /** When set the button acts as a window into this image — renders it behind the label/icons */
  windowImage?: string;
}

/**
 * Standard Button Component
 * - Text on left, icon on right
 * - On hover: they swap positions with animation
 * - Based on MindMarket "Methodology" button design
 */
export default function Button({
  children,
  href,
  onClick,
  initialColor = '#ffed4e',
  iconBgColor = '#ffffff',
  iconColor,
  icon,
  className = '',
  disabled = false,
  type = 'button',
  tileMaskEnabled = false,
  tileMaskDelayMs = 0,
  tileMaskColor = '#ffffff',
  tileMaskSpeed = 8,
  target,
  windowImage,
}: ButtonProps) {
  // Base button styles
  const baseStyles = `
    btn-base
    ${disabled ? 'btn-disabled' : ''}
    ${className}
  `.trim();

  const iconSVG = (
    <svg
      className="btn-icon"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      style={iconColor ? { color: iconColor } : undefined}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2.5}
        d="M9 5l7 7-7 7"
      />
    </svg>
  );

  const iconContent = icon ?? iconSVG;

  const content = (
    <>
      {/* Window image — fills the button behind label/icons (btn-label z-index:2 sits above) */}
      {windowImage && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden' }}>
          <Image
            src={windowImage}
            fill
            alt=""
            style={{
              objectFit: 'cover',
              objectPosition: 'center',
              transform: 'scale(4)',
              transformOrigin: 'center center',
            }}
          />
        </div>
      )}

      {/* Icon on LEFT - hidden by default, shows on hover */}
      <div className="btn-icon-wrapper-left" style={{ backgroundColor: iconBgColor }}>
        {iconContent}
      </div>
      
      <span className="btn-text btn-label">{children}</span>
      
      {/* Icon on RIGHT - visible by default, hides on hover */}
      <div className="btn-icon-wrapper" style={{ backgroundColor: iconBgColor }}>
        {iconContent}
      </div>

      {tileMaskEnabled && (
        <TileMaskOverlay
          className="z-[1]"
          color={tileMaskColor}
          speed={tileMaskSpeed}
          startDelayMs={tileMaskDelayMs}
          tileSize={24}
          minRows={4}
          minCols={8}
          enableHoverTrail={false}
        />
      )}
    </>
  );

  // If href is provided, render as Link
  if (href) {
    return (
      <Link
        href={href}
        className={baseStyles}
        style={{ backgroundColor: initialColor }}
        aria-disabled={disabled}
        target={target}
        rel={target === '_blank' ? 'noopener noreferrer' : undefined}
      >
        {content}
      </Link>
    );
  }

  // Otherwise render as button
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={baseStyles}
      style={{ backgroundColor: initialColor }}
    >
      {content}
    </button>
  );
}
