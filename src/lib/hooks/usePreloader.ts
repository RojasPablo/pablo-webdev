//last edited 2024-06-10
import { useState, useEffect } from 'react';

const PRELOADER_STORAGE_KEY = 'preloaderShownOnce';

export function usePreloader() {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const PRELOADER_VISIBLE_MS = 3500;
  const PRELOADER_EXIT_MS = 800;

  useEffect(() => {
    const hasShownPreloader = window.localStorage.getItem(PRELOADER_STORAGE_KEY);

    if (hasShownPreloader) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      setIsVisible(true);
    });

    window.localStorage.setItem(PRELOADER_STORAGE_KEY, 'true');

    const exitTimer = window.setTimeout(() => {
      setIsExiting(true);
    }, PRELOADER_VISIBLE_MS);

    const hideTimer = window.setTimeout(() => {
      setIsVisible(false);
    }, PRELOADER_VISIBLE_MS + PRELOADER_EXIT_MS);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(exitTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  return {
    isVisible,
    isExiting,
  };
}
