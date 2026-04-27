import type { CSSProperties } from "react";

interface AnimatedHeroTitleProps {
  lines: string[];
  className?: string;
  stagger?: number;
  delay?: number;
}

export default function AnimatedHeroTitle({
  lines,
  className = "",
  stagger = 0.045,
  delay = 0,
}: AnimatedHeroTitleProps) {
  return (
    <span className={["hero-title-animated", className].join(" ")}>
      {lines.map((line, lineIndex) => {
        const chars = Array.from(line);
        const isReverse = lineIndex % 2 === 1;
        const lineDelay = delay + lineIndex * (chars.length * stagger + 0.18);

        return (
          <span key={`${line}-${lineIndex}`} className="hero-title-line">
            {chars.map((char, charIndex) => {
              const orderIndex = isReverse ? chars.length - 1 - charIndex : charIndex;
              const charDelay = lineDelay + orderIndex * stagger;
              const displayChar = char === " " ? "\u00A0" : char;
              return (
                <span
                  key={`${lineIndex}-${charIndex}-${char}`}
                  className="hero-title-char"
                  data-letter={char}
                  style={
                    {
                      ["--char-delay" as never]: `${charDelay}s`,
                    } as CSSProperties
                  }
                >
                  {displayChar}
                </span>
              );
            })}
          </span>
        );
      })}
    </span>
  );
}
