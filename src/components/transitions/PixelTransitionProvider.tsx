'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  type ReactNode,
} from 'react';
import PixelTransitionOverlay from './PixelTransitionOverlay';
import { createPixelTransition } from '@/lib/animations/createPixelTransition';

type TransitionFn = (onCovered?: () => void) => Promise<void>;

type PixelTransitionContextValue = {
  runTransition: TransitionFn;
};

const PixelTransitionContext = createContext<PixelTransitionContextValue | null>(null);

export function PixelTransitionProvider({ children }: { children: ReactNode }) {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const isRunningRef = useRef(false);

  const runTransition = useCallback<TransitionFn>((onCovered) => {
    return new Promise((resolve) => {
      if (!overlayRef.current || isRunningRef.current) {
        onCovered?.();
        resolve();
        return;
      }

      isRunningRef.current = true;

      const tl = createPixelTransition({
        overlayEl: overlayRef.current,
        onCovered,
      });

      tl.eventCallback('onComplete', () => {
        isRunningRef.current = false;
        resolve();
      });

      tl.play(0);
    });
  }, []);

  const value = useMemo(() => ({ runTransition }), [runTransition]);

  return (
    <PixelTransitionContext.Provider value={value}>
      {children}
      <PixelTransitionOverlay ref={overlayRef} rows={8} cols={18} />
    </PixelTransitionContext.Provider>
  );
}

export function usePixelTransition() {
  const context = useContext(PixelTransitionContext);

  if (!context) {
    throw new Error('usePixelTransition must be used within PixelTransitionProvider');
  }

  return context;
}
