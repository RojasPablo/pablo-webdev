// src/components/ui/Hero.tsx
import type { ReactNode } from "react";

type HeroVariant = "home" | "page";

export interface HeroProps {
  variant?: HeroVariant;

  // Page variant
  eyebrow?: string;

  // Both variants
  title: ReactNode;
  description?: string;

  bgColor?: string;

  illustration?: ReactNode;
  illustrationPlaceholder?: string;

  className?: string;

  // NEW: optional class hooks (lets wrappers style parts without rewriting Hero)
  headerClassName?: string;
  descriptionClassName?: string;
  descriptionDelay?: number;
  illustrationClassName?: string;

  // Optional background media (video, image, etc.)
  backgroundMedia?: ReactNode;
  backgroundMediaClassName?: string;
}

export default function Hero({
  variant = "page",
  eyebrow,
  title,
  description,
  bgColor = "#8ed462",
  illustration,
  illustrationPlaceholder = "[ illustration placeholder ]",
  className = "",
  headerClassName = "",
  descriptionClassName = "",
  descriptionDelay,
  illustrationClassName = "",
  backgroundMedia,
  backgroundMediaClassName = "",
}: HeroProps) {
  const isHome = variant === "home";

  return (
    <section
      className={[
        "hero-container",
        isHome ? "hero--home" : "hero--page",
        className,
      ].join(" ")}
      style={{ backgroundColor: bgColor }}
    >
      {backgroundMedia && (
        <div className={["hero-background", backgroundMediaClassName].join(" ")}>
          {backgroundMedia}
        </div>
      )}
      {/* Header */}
      <div className={["hero-header", headerClassName].join(" ")}>
        {!isHome && eyebrow && <p className="hero-eyebrow">{eyebrow}</p>}
        <h1 className="hero-title">{title}</h1>

        {isHome && description && (
          <p
            className={["hero-tagline mx-auto mt-8", descriptionClassName].join(" ")}
            style={
              descriptionDelay !== undefined
                ? ({ ["--tagline-delay" as never]: `${descriptionDelay}s` } as never)
                : undefined
            }
          >
            {description}
          </p>
        )}
      </div>

      {/* Illustration area */}
      <div className={["hero-illustration", illustrationClassName].join(" ")} aria-hidden="true">
        <div className="hero-illustration-inner">
          {illustration ?? (
            <div className="hero-placeholder">{illustrationPlaceholder}</div>
          )}
        </div>
      </div>
    </section>
  );
}
