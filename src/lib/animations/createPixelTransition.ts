import gsap from 'gsap';

type CreatePixelTransitionParams = {
  overlayEl: HTMLDivElement;
  onCovered?: () => void;
};

export function createPixelTransition({
  overlayEl,
  onCovered,
}: CreatePixelTransitionParams) {
  const cells = overlayEl.querySelectorAll('.pixel-transition-cell');

  const tl = gsap.timeline({
    paused: true,
    defaults: {
      ease: 'power2.inOut',
    },
  });

  tl.set(overlayEl, { visibility: 'visible' });

  // Cover
  tl.to(cells, {
    scaleY: 1,
    duration: 0.45,
    stagger: {
      each: 0.015,
      from: 'random',
    },
  });

  // Midpoint: swap content
  tl.call(() => {
    onCovered?.();
  });

  // Reveal
  tl.to(cells, {
    scaleY: 0,
    duration: 0.45,
    stagger: {
      each: 0.015,
      from: 'random',
    },
  });

  tl.set(overlayEl, { visibility: 'hidden' });

  return tl;
}
