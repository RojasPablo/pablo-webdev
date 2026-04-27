// src/components/ui/HeroScrollScene.tsx
"use client";

import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";

type HeroSceneRenderContext = {
  scrollYProgress: MotionValue<number>;
  reduceMotion: boolean;
  isActive: boolean;
};

interface HeroScrollSceneProps {
  hero: ReactNode | ((context: HeroSceneRenderContext) => ReactNode);
  next: ReactNode;
  nextPreview?: ReactNode;
  sheetColor?: string;
  darkenHero?: boolean;

  /**
   * Scroll runway for the scene.
   * Smaller = effect starts/finishes sooner.
   */
  sceneHeightVh?: number;

  className?: string;
}

export default function HeroScrollScene({
  hero,
  next,
  nextPreview,
  sheetColor = "#f6f1e3",
  darkenHero = true,
  sceneHeightVh = 95,
  className = "",
}: HeroScrollSceneProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const [isSceneActive, setIsSceneActive] = useState(true);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver === "undefined") {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) {
          return;
        }

        setIsSceneActive(entry.isIntersecting && entry.intersectionRatio > 0);
      },
      { root: null, threshold: 0 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // Hero header fades/scales more gradually - still visible at 50%
  const heroHeaderOpacity = useTransform(scrollYProgress, [0, 0.9], [1, 0]);
  const heroHeaderScale = useTransform(scrollYProgress, [0, 0.9], [1, 0.7]);
  const heroHeaderY = useTransform(scrollYProgress, [0, 0.9], ["0px", "-220px"]);

  // Darken effect - hero darkens as sheet rises
  const heroBrightness = useTransform(
    scrollYProgress,
    [0, 0.5],
    ["brightness(1)", "brightness(0.8)"]
  );

  // Sheet rises faster - completes by 35% scroll progress
  const sheetY = useTransform(
    scrollYProgress,
    [0, 0.35, 1],
    ["100%", "0%", "0%"]
  );


  const previewContent = useMemo(() => nextPreview ?? next, [nextPreview, next]);
  const resolvedHero =
    typeof hero === "function" ? hero({ scrollYProgress, reduceMotion, isActive: isSceneActive }) : hero;

  return (
    <>
      <motion.div
        className="hero-scene__fixed-header"
        style={
          reduceMotion
            ? { pointerEvents: "none", visibility: isSceneActive ? "visible" : "hidden" }
            : ({
                pointerEvents: "none",
                visibility: isSceneActive ? "visible" : "hidden",
                ["--hero-header-opacity" as never]: heroHeaderOpacity,
                ["--hero-header-scale" as never]: heroHeaderScale,
                ["--hero-header-y" as never]: heroHeaderY,
              } as never)
        }
      >
        <motion.div
          style={{
            filter: reduceMotion || !darkenHero ? "none" : heroBrightness,
            height: "100%",
            width: "100%",
          }}
        >
          {resolvedHero}
        </motion.div>
      </motion.div>
      <section
        ref={ref}
        className={["hero-scene", className].join(" ")}
        style={{
          height: `${sceneHeightVh}vh`,
          pointerEvents: "none",
          position: "relative",
          zIndex: 0,
        }}
        aria-hidden="true"
      >
        <div className="hero-scene__sticky" style={{ pointerEvents: "none" }}>
          <motion.div
            className="hero-scene__sheet"
            style={{
              pointerEvents: "none",
              backgroundColor: sheetColor,
              y: reduceMotion ? "0%" : sheetY,
              boxShadow: "none",
            }}
          >
            <div className="hero-scene__sheetInner" style={{ pointerEvents: "none" }}>
              <div className="pointer-events-none select-none">{previewContent}</div>
            </div>
          </motion.div>
        </div>
      </section>

      <div
        className="hero-scene__after"
        style={{
          backgroundColor: sheetColor,
          position: "relative",
          zIndex: 10,
          pointerEvents: "auto",
        }}
      >
        {next}
      </div>
    </>
  );
}
