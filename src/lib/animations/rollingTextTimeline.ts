import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type CreateRollingTextTimelineParams = {
  heroTitleEl: HTMLElement;
  timeScale?: number;
};

/**
 * Scroll-driven vertical reel:
 * - ONE tick per scroll direction. Continuous scroll in the same direction
 *   does nothing until the user stops and scrolls again (or reverses).
 * - Each character reels inside its own clipped window (position stays fixed).
 * - Organic feel via stable per-letter delay + duration jitter.
 */
export function createRollingTextTimeline({
  heroTitleEl,
  timeScale = 1,
}: CreateRollingTextTimelineParams): gsap.core.Timeline {
  const tl = gsap.timeline({ paused: true });
  tl.timeScale(timeScale);

  const charEls = Array.from(
    heroTitleEl.querySelectorAll<HTMLElement>(".letter, [data-letter]")
  );

  if (!charEls.length) return tl;

  // -------------------------
  // Reel DOM + measurement
  // -------------------------

  type Reel = {
    el: HTMLElement;
    track: HTMLElement;
    stepPx: number;
    delayJ: number;
    durJ: number;
  };

  const reels: Reel[] = [];

  // lineHeight is passed in so each row matches the parent's actual line box height
  const makeRow = (char: string, lineHeight: string) => {
    const row = document.createElement("span");
    row.textContent = char;
    row.style.display = "block";
    row.style.lineHeight = lineHeight;
    return row;
  };

  const initReel = (el: HTMLElement): Reel | null => {
    const raw = (el.textContent ?? "").replace(/\u00A0/g, " ");
    if (!raw || raw === " ") return null;

    // Already initialised — return existing reel
    const existingTrack = el.querySelector<HTMLElement>("[data-reel-track]");
    if (existingTrack) {
      const stepPx = Number(el.dataset.reelStepPx ?? "0");
      const delayJ = Number(el.dataset.reelDelayJ ?? "0");
      const durJ = Number(el.dataset.reelDurJ ?? "0");
      return { el, track: existingTrack, stepPx, delayJ, durJ };
    }

    // ── Use a tight line-height that contains glyphs including descenders.
    //    1.15 provides room for descenders (g, y, p, q, j) while staying tight
    //    enough to prevent the row above from peeking through.
    const rowLineHeight = "1.15";

    // Mask styling on the element itself (keeps layout position fixed)
    el.style.display = "inline-block";
    el.style.overflow = "hidden";
    el.style.verticalAlign = "top";
    el.style.willChange = "contents";
    el.style.paddingRight = "0.02em";

    // Stable jitter values (persist across re-measures)
    const delayJ = Math.random();
    const durJ = Math.random();
    el.dataset.reelDelayJ = String(delayJ);
    el.dataset.reelDurJ = String(durJ);

    // Build track: 3 rows — top / center / bottom
    const track = document.createElement("span");
    track.dataset.reelTrack = "true";
    track.style.display = "block";
    track.style.willChange = "transform";

    track.appendChild(makeRow(raw, rowLineHeight)); // top
    track.appendChild(makeRow(raw, rowLineHeight)); // center (visible at rest)
    track.appendChild(makeRow(raw, rowLineHeight)); // bottom

    el.textContent = "";
    el.appendChild(track);

    return { el, track, stepPx: 0, delayJ, durJ };
  };

  for (const el of charEls) {
    const r = initReel(el);
    if (r) reels.push(r);
  }

  if (!reels.length) return tl;

  const measure = () => {
    for (const r of reels) {
      const firstRow = r.track.children[0] as HTMLElement | undefined;
      if (!firstRow) continue;

      const step = firstRow.getBoundingClientRect().height;
      if (!step) continue;

      r.stepPx = step;
      r.el.dataset.reelStepPx = String(step);

      // Mask height = exactly one row
      r.el.style.height = `${step}px`;

      // Rest position: show center row (y = -1 row)
      gsap.set(r.track, { y: -step });
    }
  };

  measure();
  const onResize = () => measure();
  window.addEventListener("resize", onResize);

  // ─────────────────────────────────────────────────────
  // Discrete scroll tick — one per direction change
  // ─────────────────────────────────────────────────────

  // Last direction we actually fired a tick for.
  // Stays locked until scroll velocity drops to ~0 (user paused).
  let lastTickDir: 1 | -1 | 0 = 0;

  // Debounce timer: resets lastTickDir after scroll stops
  let stopTimer: ReturnType<typeof setTimeout> | null = null;

  const tick = (dir: 1 | -1) => {
    const maxDelay = 2.0; // Spread character starts over 2s for dramatic stagger
    const minDur = 0.3;
    const maxDur = 0.55;

    for (const r of reels) {
      if (!r.stepPx) continue;
      if (gsap.isTweening(r.track)) continue;

      // Down: center → bottom row.  Up: center → top row.  Then snap back.
      const targetY = dir === 1 ? -2 * r.stepPx : 0;
      const delay = r.delayJ * maxDelay;
      const dur = minDur + r.durJ * (maxDur - minDur);

      gsap.to(r.track, {
        y: targetY,
        delay,
        duration: dur,
        ease: "power2.out",
        overwrite: "auto",
        onComplete: () => {
          gsap.set(r.track, { y: -r.stepPx });
        },
      });
    }
  };

  const st = ScrollTrigger.create({
    trigger: heroTitleEl,
    start: "top bottom",
    end: "bottom top",
    onUpdate: (self) => {
      const velocity = self.getVelocity();

      // ── Velocity near zero → user paused scrolling.
      //    Debounce the reset so a brief micro-pause mid-flick doesn't
      //    accidentally allow a second tick.
      if (Math.abs(velocity) < 5) {
        if (!stopTimer) {
          stopTimer = setTimeout(() => {
            lastTickDir = 0;
            stopTimer = null;
          }, 200);
        }
        return;
      }

      // Still scrolling → cancel any pending stop reset
      if (stopTimer) {
        clearTimeout(stopTimer);
        stopTimer = null;
      }

      const dir: 1 | -1 = velocity > 0 ? 1 : -1;

      // Fire only when direction is new or first tick after a stop
      if (dir !== lastTickDir) {
        lastTickDir = dir;
        tick(dir);
      }
    },
  });

  // Cleanup
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tl.eventCallback("onKill" as any, () => {
    st.kill();
    if (stopTimer) clearTimeout(stopTimer);
    window.removeEventListener("resize", onResize);
  });

  return tl;
}
