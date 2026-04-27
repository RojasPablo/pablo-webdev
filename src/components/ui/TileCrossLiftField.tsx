"use client";

import { useEffect, useRef, useState } from "react";

type TileCrossLiftFieldProps = {
  className?: string;
  tileSize?: number;
  minRows?: number;
  minCols?: number;
  backgroundColor?: string;
  tileColor?: string;
  glowColor?: string;
  isActive?: boolean;
  initialTriggerMinDelayMs?: number;
  initialTriggerMaxDelayMs?: number;
  minTriggerDelayMs?: number;
  maxTriggerDelayMs?: number;
  startDelayMs?: number;
  showBorder?: boolean;
};

type TileActivation = {
  startedAt: number;
  delayMs: number;
  peakZ: number;
  durationMs: number;
};

const ARM_PEAK_Z = 26;
const ARM_DURATION_MS = 1220;
const ARM_DELAY_MS = 56;
const STRAGGLER_DELAYS_MS = [180, 320, 470] as const;
const RISE_PORTION = 0.3;
const HOLD_PORTION = 0.2;
const BASE_TILE_ALPHA = 0.1;
const PEAK_TILE_ALPHA = 0.36;
const BASE_SHADOW_ALPHA = 0.08;
const PEAK_SHADOW_ALPHA = 0.46;
const SINGLE_TILE_PEAK_Z = 18;
const SINGLE_TILE_DURATION_MS = 980;
const QUIET_BUFFER_TRIM_MS = 20;
const LONGEST_SEQUENCE_DURATION_MS = Math.max(
  ARM_DELAY_MS + ARM_DURATION_MS,
  Math.max(...STRAGGLER_DELAYS_MS) + SINGLE_TILE_DURATION_MS,
);

function easeInOutCubic(value: number) {
  return value < 0.5
    ? 4 * value * value * value
    : 1 - Math.pow(-2 * value + 2, 3) / 2;
}

function easeOutQuart(value: number) {
  return 1 - Math.pow(1 - value, 4);
}

function buildCrossIndices(row: number, col: number, rows: number, cols: number) {
  const indices: Array<TileActivation & { tileIndex: number }> = [];
  const pushIfValid = (nextRow: number, nextCol: number, delayMs: number) => {
    if (nextRow < 0 || nextRow >= rows || nextCol < 0 || nextCol >= cols) {
      return;
    }

    indices.push({
      tileIndex: nextRow * cols + nextCol,
      delayMs,
      peakZ: ARM_PEAK_Z,
      durationMs: ARM_DURATION_MS,
    });
  };

  pushIfValid(row - 1, col, ARM_DELAY_MS);
  pushIfValid(row + 1, col, ARM_DELAY_MS);
  pushIfValid(row, col - 1, ARM_DELAY_MS);
  pushIfValid(row, col + 1, ARM_DELAY_MS);

  return indices;
}

export default function TileCrossLiftField({
  className = "",
  tileSize = 68,
  minRows = 10,
  minCols = 16,
  backgroundColor = "#4d9fff",
  tileColor = "rgba(242, 242, 247, 0.18)",
  glowColor = "rgba(242, 242, 247, 0.92)",
  isActive = true,
  initialTriggerMinDelayMs,
  initialTriggerMaxDelayMs,
  minTriggerDelayMs = 550,
  maxTriggerDelayMs = 1300,
  startDelayMs = 0,
  showBorder = true,
}: TileCrossLiftFieldProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const tileElementsRef = useRef<Array<HTMLDivElement | null>>([]);
  const activeTilesRef = useRef<Map<number, TileActivation>>(new Map());
  const animationFrameRef = useRef<number | null>(null);
  const randomTriggerTimeoutRef = useRef<number | null>(null);
  const startDelayTimeoutRef = useRef<number | null>(null);
  const [grid, setGrid] = useState({ rows: minRows, cols: minCols });

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
    const resetTiles = () => {
      tileElementsRef.current.forEach((tile) => {
        if (!tile) {
          return;
        }

        tile.style.transform = "translate3d(0, 0, 0)";
        tile.style.opacity = "1";
        tile.style.boxShadow = "none";
        tile.style.background = tileColor;
      });
    };

    resetTiles();
  }, [grid.cols, grid.rows, tileColor]);

  useEffect(() => {
    if (isActive) {
      return;
    }

    if (startDelayTimeoutRef.current !== null) {
      window.clearTimeout(startDelayTimeoutRef.current);
      startDelayTimeoutRef.current = null;
    }
    if (randomTriggerTimeoutRef.current !== null) {
      window.clearTimeout(randomTriggerTimeoutRef.current);
      randomTriggerTimeoutRef.current = null;
    }
    if (animationFrameRef.current !== null) {
      window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    activeTilesRef.current.clear();
    tileElementsRef.current.forEach((tile) => {
      if (!tile) {
        return;
      }

      tile.style.transform = "translate3d(0, 0, 0)";
      tile.style.boxShadow = "none";
      tile.style.background = tileColor;
    });
  }, [isActive, tileColor]);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    const runFrame = () => {
      const now = performance.now();
      let hasActiveTiles = false;

      activeTilesRef.current.forEach((activation, tileIndex) => {
        const tile = tileElementsRef.current[tileIndex];
        if (!tile) {
          activeTilesRef.current.delete(tileIndex);
          return;
        }

        const elapsed = now - activation.startedAt - activation.delayMs;
        if (elapsed < 0) {
          hasActiveTiles = true;
          return;
        }

        const progress = Math.min(1, elapsed / activation.durationMs);
        const peakZ = activation.peakZ;

        let depth = 0;
        if (progress < RISE_PORTION) {
          depth = easeOutQuart(progress / RISE_PORTION) * peakZ;
        } else if (progress < RISE_PORTION + HOLD_PORTION) {
          depth = peakZ;
        } else {
          const settleProgress =
            (progress - (RISE_PORTION + HOLD_PORTION)) / (1 - (RISE_PORTION + HOLD_PORTION));
          depth =
            (1 - easeInOutCubic(settleProgress)) * peakZ;
        }

        const glowStrength = depth / peakZ;
        tile.style.transform = `translate3d(0, 0, ${depth.toFixed(2)}px)`;
        const highlightAlpha = BASE_TILE_ALPHA + glowStrength * (PEAK_TILE_ALPHA - BASE_TILE_ALPHA);
        const shadowAlpha = BASE_SHADOW_ALPHA + glowStrength * (PEAK_SHADOW_ALPHA - BASE_SHADOW_ALPHA);
        tile.style.background = `linear-gradient(180deg, rgba(242, 242, 247, ${highlightAlpha.toFixed(3)}) 0%, ${tileColor} 100%)`;
        tile.style.boxShadow =
          depth > 0.5
            ? `0 ${Math.round(depth * 0.42)}px ${Math.round(depth * 1.35)}px rgba(18, 25, 38, ${(
                shadowAlpha
              ).toFixed(3)})`
            : "none";

        if (progress >= 1) {
          tile.style.transform = "translate3d(0, 0, 0)";
          tile.style.background = tileColor;
          tile.style.boxShadow = "none";
          activeTilesRef.current.delete(tileIndex);
          return;
        }

        hasActiveTiles = true;
      });

      if (!hasActiveTiles) {
        animationFrameRef.current = null;
        return;
      }

      animationFrameRef.current = window.requestAnimationFrame(runFrame);
    };

    const startLoop = () => {
      if (animationFrameRef.current !== null) {
        return;
      }
      animationFrameRef.current = window.requestAnimationFrame(runFrame);
    };

    const queueRandomCross = (isInitial = false) => {
      const resolvedMinTriggerDelayMs =
        isInitial ? initialTriggerMinDelayMs ?? minTriggerDelayMs : minTriggerDelayMs;
      const resolvedMaxTriggerDelayMs =
        isInitial ? initialTriggerMaxDelayMs ?? maxTriggerDelayMs : maxTriggerDelayMs;
      const quietDelayMs =
        resolvedMinTriggerDelayMs +
        Math.random() * Math.max(0, resolvedMaxTriggerDelayMs - resolvedMinTriggerDelayMs);
      const adjustedQuietDelayMs = isInitial
        ? quietDelayMs
        : Math.max(0, quietDelayMs - QUIET_BUFFER_TRIM_MS);
      const triggerDelay = adjustedQuietDelayMs + (isInitial ? 0 : LONGEST_SEQUENCE_DURATION_MS);

      randomTriggerTimeoutRef.current = window.setTimeout(() => {
        const row = Math.floor(Math.random() * grid.rows);
        const col = Math.floor(Math.random() * grid.cols);
        const now = performance.now();

        buildCrossIndices(row, col, grid.rows, grid.cols).forEach(({ tileIndex: activeIndex, ...activation }) => {
          activeTilesRef.current.set(activeIndex, {
            startedAt: now,
            ...activation,
          });
        });

        const usedTileIndices = new Set<number>(activeTilesRef.current.keys());
        STRAGGLER_DELAYS_MS.forEach((delayMs) => {
          let singleTileIndex = Math.floor(Math.random() * grid.rows * grid.cols);
          let attempts = 0;

          while (usedTileIndices.has(singleTileIndex) && attempts < 24) {
            singleTileIndex = Math.floor(Math.random() * grid.rows * grid.cols);
            attempts += 1;
          }

          usedTileIndices.add(singleTileIndex);
          activeTilesRef.current.set(singleTileIndex, {
            startedAt: now,
            delayMs,
            peakZ: SINGLE_TILE_PEAK_Z,
            durationMs: SINGLE_TILE_DURATION_MS,
          });
        });

        startLoop();
        queueRandomCross(false);
      }, triggerDelay);
    };

    if (startDelayMs > 0) {
      startDelayTimeoutRef.current = window.setTimeout(() => {
        queueRandomCross(true);
      }, startDelayMs);
    } else {
      queueRandomCross(true);
    }

    return () => {
      if (startDelayTimeoutRef.current !== null) {
        window.clearTimeout(startDelayTimeoutRef.current);
        startDelayTimeoutRef.current = null;
      }
      if (randomTriggerTimeoutRef.current !== null) {
        window.clearTimeout(randomTriggerTimeoutRef.current);
        randomTriggerTimeoutRef.current = null;
      }
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [
    glowColor,
    grid.cols,
    grid.rows,
    initialTriggerMaxDelayMs,
    initialTriggerMinDelayMs,
    isActive,
    maxTriggerDelayMs,
    minTriggerDelayMs,
    startDelayMs,
    tileColor,
  ]);

  return (
    <div
      ref={containerRef}
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`.trim()}
      style={{
        perspective: "1200px",
        backgroundColor,
      }}
      aria-hidden="true"
    >
      <div
        className="absolute inset-0 grid"
        style={{
          gridTemplateColumns: `repeat(${grid.cols}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${grid.rows}, minmax(0, 1fr))`,
          transformStyle: "preserve-3d",
        }}
      >
        {Array.from({ length: grid.rows * grid.cols }, (_, tileIndex) => (
          <div
            key={`tile-cross-lift-${tileIndex}`}
            ref={(node) => {
              tileElementsRef.current[tileIndex] = node;
            }}
            className={showBorder ? "border border-white/10" : ""}
            style={{
              background: tileColor,
              transformStyle: "preserve-3d",
              willChange: "transform, box-shadow, background",
            }}
          />
        ))}
      </div>
    </div>
  );
}
