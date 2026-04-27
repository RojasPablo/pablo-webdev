'use client';

import '../../styles/menubutton.css';

interface MenuButtonProps {
  isOpen: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  className?: string;
}

/**
 * MenuButton Component
 *
 * A circular menu toggle button with an animated metallic gradient border effect.
 * Features two counter-rotating gradient layers that create a dynamic metallic shimmer.
 *
 * @param isOpen - Controls the icon state (hamburger vs hidden)
 * @param onMouseEnter - Handler for when mouse enters the button
 * @param onMouseLeave - Handler for when mouse leaves the button
 * @param className - Optional additional classes
 */
export default function MenuButton({ isOpen, onMouseEnter, onMouseLeave, className = '' }: MenuButtonProps) {
  return (
    <button
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`menu-button ${className}`}
      aria-label="Menu"
      aria-expanded={isOpen}
    >
      {/* Menu Icon SVG */}
      <svg
        className="menu-icon"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        {isOpen ? null : (
          // Hamburger icon when menu is closed
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        )}
      </svg>
    </button>
  );
}
