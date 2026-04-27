'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Workaround for Chrome View Transitions API scroll lock bug.
 * Manually handles wheel and keyboard events to force scrolling.
 */
export default function ScrollFix() {
  const pathname = usePathname();

  useEffect(() => {
    // Manual wheel handler - forces scroll when native scroll is blocked
    const handleWheel = (e: WheelEvent) => {
      // Don't interfere if target is a scrollable element
      const target = e.target as HTMLElement;
      if (target.closest('[data-scroll-container]')) return;

      window.scrollBy({
        top: e.deltaY,
        left: e.deltaX,
        behavior: 'instant'
      });
    };

    // Manual keyboard handler for arrow keys, Page Up/Down, Home/End, Space
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't interfere if user is typing in an input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      const scrollAmount = 100;
      const pageScrollAmount = window.innerHeight * 0.9;

      switch (e.key) {
        case 'ArrowDown':
          if (e.metaKey || e.ctrlKey) {
            // Cmd/Ctrl + Down = jump to bottom
            window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' });
          } else {
            window.scrollBy({ top: scrollAmount, behavior: 'instant' });
          }
          break;
        case 'ArrowUp':
          if (e.metaKey || e.ctrlKey) {
            // Cmd/Ctrl + Up = jump to top
            window.scrollTo({ top: 0, behavior: 'instant' });
          } else {
            window.scrollBy({ top: -scrollAmount, behavior: 'instant' });
          }
          break;
        case 'PageDown':
        case ' ': // Space
          if (!e.shiftKey) {
            window.scrollBy({ top: pageScrollAmount, behavior: 'instant' });
          }
          break;
        case 'PageUp':
          window.scrollBy({ top: -pageScrollAmount, behavior: 'instant' });
          break;
        case 'Home':
          if (e.metaKey || e.ctrlKey) {
            window.scrollTo({ top: 0, behavior: 'instant' });
          }
          break;
        case 'End':
          if (e.metaKey || e.ctrlKey) {
            window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' });
          }
          break;
        default:
          return; // Don't prevent default for other keys
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [pathname]);

  return null;
}
