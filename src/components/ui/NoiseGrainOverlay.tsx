"use client";

import { useEffect, useRef } from "react";
import { mountGrainEffect, type GrainEffectOptions } from "@/lib/animations/grainEffect";

type NoiseGrainOverlayProps = GrainEffectOptions & {
  className?: string;
};

export default function NoiseGrainOverlay({
  className = "",
  patternWidth = 100,
  patternHeight = 100,
  grainOpacity = 0.05,
  grainDensity = 1,
  grainWidth = 1,
  grainHeight = 1,
  grainSpeed = 8,
  dprCap = 2,
  pauseWhenNavMenuOpen = true,
  pauseWhileScrolling = true,
  scrollResumeDelayMs = 140,
}: NoiseGrainOverlayProps) {
  const overlayRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) {
      return;
    }
    return mountGrainEffect(overlay, {
      patternWidth,
      patternHeight,
      grainOpacity,
      grainDensity,
      grainWidth,
      grainHeight,
      grainSpeed,
      dprCap,
      pauseWhenNavMenuOpen,
      pauseWhileScrolling,
      scrollResumeDelayMs,
    });
  }, [
    dprCap,
    grainDensity,
    grainHeight,
    grainOpacity,
    grainSpeed,
    grainWidth,
    patternHeight,
    patternWidth,
    pauseWhenNavMenuOpen,
    pauseWhileScrolling,
    scrollResumeDelayMs,
  ]);

  return <div ref={overlayRef} className={`pointer-events-none absolute inset-0 ${className}`} aria-hidden="true" />;
}
