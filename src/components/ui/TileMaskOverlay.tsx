"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { TILE_MASK_SEQUENCE, buildTileMaskOpacityFrame, buildTileMaskPatterns } from "@/lib/animations/tileMask";

type TileTrailHit = {
  tileIndex: number;
  timestamp: number;
};

const TILE_TRAIL_MAX_OPACITY = 0.5;
const TILE_TRAIL_FADE_MS = 520;
const TILE_TRAIL_SAMPLE_WINDOW_MS = 24;

type TileMaskOverlayProps = {
  className?: string;
  color?: string;
  speed?: number;
  startDelayMs?: number;
  tileSize?: number;
  minRows?: number;
  minCols?: number;
  enableHoverTrail?: boolean;
};

export default function TileMaskOverlay({
  className = "",
  color = "#59b7ff",
  speed = 6,
  startDelayMs = 0,
  tileSize = 72,
  minRows = 8,
  minCols = 8,
  enableHoverTrail = true,
}: TileMaskOverlayProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const tileElementsRef = useRef<Array<HTMLSpanElement | null>>([]);
  const trailLastSeenRef = useRef<Map<number, number>>(new Map());
  const lastTrailHitRef = useRef<TileTrailHit | null>(null);
  const trailAnimationFrameRef = useRef<number | null>(null);
  const [stepIndex, setStepIndex] = useState(startDelayMs > 0 ? -1 : 0);
  const [grid, setGrid] = useState<{ rows: number; cols: number }>({
    rows: minRows,
    cols: minCols,
  });

  const safeSpeed = Math.max(0.25, speed);
  const resolvedStepIndex = Math.max(0, stepIndex);
  const activeStep = TILE_MASK_SEQUENCE[resolvedStepIndex] ?? TILE_MASK_SEQUENCE[0];
  const lastStepIndex = TILE_MASK_SEQUENCE.length - 1;
  const isPlaying = stepIndex >= 0 && stepIndex < lastStepIndex;
  const isSequenceComplete = stepIndex >= lastStepIndex;
  const postFillExtraHoldMs = resolvedStepIndex > 0 ? 10 : 0;
  const effectiveDelayMs =
    Math.max(16, activeStep.durationMs / safeSpeed, activeStep.minDurationMs ?? 0) + postFillExtraHoldMs;
  const tileTransitionMs = Math.max(16, 170 / safeSpeed);
  const patterns = useMemo(() => buildTileMaskPatterns(grid.rows, grid.cols), [grid.cols, grid.rows]);
  const activeOpacityFrame = useMemo(() => buildTileMaskOpacityFrame(patterns, activeStep), [activeStep, patterns]);

  useEffect(() => {
    if (stepIndex >= 0 || startDelayMs <= 0) {
      return;
    }

    const startTimerId = window.setTimeout(() => {
      setStepIndex(0);
    }, startDelayMs);

    return () => window.clearTimeout(startTimerId);
  }, [startDelayMs, stepIndex]);

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
    if (!isPlaying) {
      return;
    }

    const timerId = window.setTimeout(() => {
      setStepIndex((value) => Math.min(value + 1, lastStepIndex));
    }, effectiveDelayMs);

    return () => window.clearTimeout(timerId);
  }, [effectiveDelayMs, isPlaying, lastStepIndex, stepIndex]);

  useEffect(() => {
    if (!enableHoverTrail) {
      if (trailAnimationFrameRef.current !== null) {
        window.cancelAnimationFrame(trailAnimationFrameRef.current);
        trailAnimationFrameRef.current = null;
      }
      trailLastSeenRef.current.forEach((_, tileIndex) => {
        const tileElement = tileElementsRef.current[tileIndex];
        if (tileElement) {
          tileElement.style.opacity = "0";
        }
      });
      trailLastSeenRef.current.clear();
      lastTrailHitRef.current = null;
      return;
    }

    if (!isSequenceComplete) {
      if (trailAnimationFrameRef.current !== null) {
        window.cancelAnimationFrame(trailAnimationFrameRef.current);
        trailAnimationFrameRef.current = null;
      }
      trailLastSeenRef.current.forEach((_, tileIndex) => {
        const tileElement = tileElementsRef.current[tileIndex];
        if (tileElement) {
          tileElement.style.opacity = "0";
        }
      });
      trailLastSeenRef.current.clear();
      lastTrailHitRef.current = null;
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

    const handleMouseMove = (event: MouseEvent) => {
      const element = containerRef.current;
      if (!element) {
        return;
      }

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

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (trailAnimationFrameRef.current !== null) {
        window.cancelAnimationFrame(trailAnimationFrameRef.current);
        trailAnimationFrameRef.current = null;
      }
    };
  }, [enableHoverTrail, grid.cols, grid.rows, isSequenceComplete]);

  useEffect(() => {
    return () => {
      if (trailAnimationFrameRef.current !== null) {
        window.cancelAnimationFrame(trailAnimationFrameRef.current);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className={`absolute inset-0 pointer-events-none ${className}`} aria-hidden="true">
      <div
        className="absolute inset-0 grid"
        style={{
          gridTemplateColumns: `repeat(${grid.cols}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${grid.rows}, minmax(0, 1fr))`,
          gap: 0,
          margin: '-1px',
          width: 'calc(100% + 2px)',
          height: 'calc(100% + 2px)',
        }}
      >
        {activeOpacityFrame.flatMap((row, rowIndex) =>
          row.map((tileOpacity, colIndex) => (
            <span
              key={`tile-mask-${rowIndex}-${colIndex}`}
              ref={(node) => {
                tileElementsRef.current[rowIndex * grid.cols + colIndex] = node;
              }}
              className="block"
              style={{
                backgroundColor: color,
                opacity: isSequenceComplete ? 0 : tileOpacity,
                transition: isSequenceComplete ? "none" : `opacity ${tileTransitionMs}ms linear`,
              }}
            />
          )),
        )}
      </div>
    </div>
  );
}
