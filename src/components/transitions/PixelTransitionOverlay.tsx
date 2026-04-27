'use client';

import { forwardRef, useMemo } from 'react';

type PixelTransitionOverlayProps = {
  rows?: number;
  cols?: number;
};

const PixelTransitionOverlay = forwardRef<HTMLDivElement, PixelTransitionOverlayProps>(
  function PixelTransitionOverlay({ rows = 8, cols = 16 }, ref) {
    const cells = useMemo(
      () => Array.from({ length: rows * cols }, (_, i) => i),
      [rows, cols],
    );

    return (
      <div
        ref={ref}
        className="pixel-transition-overlay"
        aria-hidden="true"
        style={{ '--pt-rows': rows, '--pt-cols': cols } as React.CSSProperties}
      >
        <div className="pixel-transition-grid">
          {cells.map((cell) => (
            <div key={cell} className="pixel-transition-cell" />
          ))}
        </div>
      </div>
    );
  },
);

export default PixelTransitionOverlay;
