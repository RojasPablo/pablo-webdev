import { ReactNode } from 'react';
import { Link } from 'next-view-transitions';
import CharacterIcon from '@/components/ui/CharacterIcon';

interface CTAButtonProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

/**
 * CTA Button Component
 * - Button with text and character icon
 * - Character turns to face your cursor as you hover
 */
export default function CTAButton({
  children,
  href,
  onClick,
  className = '',
  disabled = false,
  type = 'button',
}: CTAButtonProps) {
  const baseStyles = `
    cta-btn-base
    ${disabled ? 'cta-btn-disabled' : ''}
    ${className}
  `.trim();

  // If href is provided, render as Link
  if (href) {
    return (
      <Link
        href={href}
        className={baseStyles}
        aria-disabled={disabled}
      >
        <span className="btn-cta-text">{children}</span>
        <CharacterIcon size={40} variant="hover-track" />
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
    >
      <span className="btn-cta-text">{children}</span>
      <CharacterIcon size={40} variant="hover-track" />
    </button>
  );
}
