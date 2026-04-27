"use client";

import { useEffect, useRef, useState } from "react";

const TILE_TRAIL_MAX_OPACITY = 0.5;
const TILE_TRAIL_FADE_MS = 520;
const TILE_TRAIL_SAMPLE_WINDOW_MS = 24;

type TileTrailHit = {
  tileIndex: number;
  timestamp: number;
};

type HoverTileTrailOverlayProps = {
  className?: string;
  color?: string;
  tileSize?: number;
  minRows?: number;
  minCols?: number;
};

export default function HoverTileTrailOverlay({
  className = "",
  color = "#f2f2f7",
  tileSize = 72,
  minRows = 8,
  minCols = 8,
}: HoverTileTrailOverlayProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const tileElementsRef = useRef<Array<HTMLSpanElement | null>>([]);
  const trailLastSeenRef = useRef<Map<number, number>>(new Map());
  const lastTrailHitRef = useRef<TileTrailHit | null>(null);
  const trailAnimationFrameRef = useRef<number | null>(null);
  const [grid, setGrid] = useState<{ rows: number; cols: number }>({
    rows: minRows,
    cols: minCols,
  });

  useEffect(() => {
    const element = containerRef.current;
    if (!element || typeof ResizeObserver === "undefined") {
      return;
    }

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) {
        return;
      }

      const nextRows = Math.max(minRows, Math.round(entry.contentRect.height / tileSize));
      const nextCols = Math.max(minCols, Math.round(entry.contentRect.width / tileSize));

      setGrid((prev) => {
        if (prev.rows === nextRows && prev.cols === nextCols) {
          return prev;
        }
        return { rows: nextRows, cols: nextCols };
      });
    });

    resizeObserver.observe(element);
    return () => resizeObserver.disconnect();
  }, [minCols, minRows, tileSize]);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) {
      return;
    }

    const runTrailFrame = () => {
      const now = performance.now();
      let hasActiveTiles = false;

      trailLastSeenRef.current.forEach((timestamp, tileIndex) => {
        const tileElement = tileElementsRef.current[tileIndex];
        if (!tileElement) {
          trailLastSeenRef.current.delete(tileIndex);
          return;
        }

        const age = now - timestamp;
        if (age >= TILE_TRAIL_FADE_MS) {
          tileElement.style.opacity = "0";
          trailLastSeenRef.current.delete(tileIndex);
          return;
        }

        hasActiveTiles = true;
        const life = 1 - age / TILE_TRAIL_FADE_MS;
        tileElement.style.opacity = (TILE_TRAIL_MAX_OPACITY * life).toFixed(3);
      });

      if (!hasActiveTiles) {
        trailAnimationFrameRef.current = null;
        return;
      }

      trailAnimationFrameRef.current = window.requestAnimationFrame(runTrailFrame);
    };

    const handlePointerMove = (event: PointerEvent) => {
      const bounds = element.getBoundingClientRect();
      if (
        bounds.width <= 0 ||
        bounds.height <= 0 ||
        event.clientX < bounds.left ||
        event.clientX >= bounds.right ||
        event.clientY < bounds.top ||
        event.clientY >= bounds.bottom
      ) {
        return;
      }

      const col = Math.min(
        grid.cols - 1,
        Math.max(0, Math.floor(((event.clientX - bounds.left) / bounds.width) * grid.cols)),
      );
      const row = Math.min(
        grid.rows - 1,
        Math.max(0, Math.floor(((event.clientY - bounds.top) / bounds.height) * grid.rows)),
      );
      const tileIndex = row * grid.cols + col;
      const now = performance.now();
      const lastTrailHit = lastTrailHitRef.current;

      if (
        lastTrailHit &&
        lastTrailHit.tileIndex === tileIndex &&
        now - lastTrailHit.timestamp < TILE_TRAIL_SAMPLE_WINDOW_MS
      ) {
        return;
      }

      lastTrailHitRef.current = { tileIndex, timestamp: now };
      trailLastSeenRef.current.set(tileIndex, now);

      const tileElement = tileElementsRef.current[tileIndex];
      if (tileElement) {
        tileElement.style.opacity = TILE_TRAIL_MAX_OPACITY.toString();
      }

      if (trailAnimationFrameRef.current === null) {
        trailAnimationFrameRef.current = window.requestAnimationFrame(runTrailFrame);
      }
    };

    const handlePointerLeave = () => {
      lastTrailHitRef.current = null;
    };

    element.addEventListener("pointermove", handlePointerMove, { passive: true });
    element.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      element.removeEventListener("pointermove", handlePointerMove);
      element.removeEventListener("pointerleave", handlePointerLeave);
      if (trailAnimationFrameRef.current !== null) {
        window.cancelAnimationFrame(trailAnimationFrameRef.current);
        trailAnimationFrameRef.current = null;
      }
    };
  }, [grid.cols, grid.rows]);

  useEffect(() => {
    return () => {
      if (trailAnimationFrameRef.current !== null) {
        window.cancelAnimationFrame(trailAnimationFrameRef.current);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className={`absolute inset-0 ${className}`.trim()} aria-hidden="true">
      <div
        className="absolute inset-0 grid"
        style={{
          gridTemplateColumns: `repeat(${grid.cols}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${grid.rows}, minmax(0, 1fr))`,
        }}
      >
        {Array.from({ length: grid.rows * grid.cols }, (_, tileIndex) => (
          <span
            key={`hover-trail-${tileIndex}`}
            ref={(node) => {
              tileElementsRef.current[tileIndex] = node;
            }}
            className="block"
            style={{
              backgroundColor: color,
              opacity: 0,
            }}
          />
        ))}
      </div>
    </div>
  );
}
