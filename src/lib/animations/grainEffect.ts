export type GrainEffectOptions = {
  patternWidth?: number;
  patternHeight?: number;
  grainOpacity?: number;
  grainDensity?: number;
  grainWidth?: number;
  grainHeight?: number;
  grainSpeed?: number;
  dprCap?: number;
  pauseWhenNavMenuOpen?: boolean;
  pauseWhileScrolling?: boolean;
  scrollResumeDelayMs?: number;
  numFrames?: number;
};

type FrameCallback = (timestamp: number) => void;
type GrainFramePool = {
  frames: HTMLCanvasElement[];
  refs: number;
};

const sharedCallbacks = new Set<FrameCallback>();
const framePoolCache = new Map<string, GrainFramePool>();
let sharedRafId: number | null = null;

function runSharedLoop(timestamp: number): void {
  sharedCallbacks.forEach((callback) => callback(timestamp));
  sharedRafId = sharedCallbacks.size > 0 ? window.requestAnimationFrame(runSharedLoop) : null;
}

function registerSharedCallback(callback: FrameCallback): void {
  sharedCallbacks.add(callback);
  if (sharedRafId === null) {
    sharedRafId = window.requestAnimationFrame(runSharedLoop);
  }
}

function unregisterSharedCallback(callback: FrameCallback): void {
  sharedCallbacks.delete(callback);
}

function buildFramePoolCacheKey(
  patternWidth: number,
  patternHeight: number,
  grainOpacity: number,
  grainDensity: number,
  grainWidth: number,
  grainHeight: number,
  numFrames: number,
) {
  return [
    patternWidth,
    patternHeight,
    grainOpacity.toFixed(4),
    grainDensity,
    grainWidth,
    grainHeight,
    numFrames,
  ].join("|");
}

function createNoiseFrame(
  patternWidth: number,
  patternHeight: number,
  grainOpacity: number,
  grainDensity: number,
  grainWidth: number,
  grainHeight: number,
) {
  const frameCanvas = document.createElement("canvas");
  frameCanvas.width = patternWidth;
  frameCanvas.height = patternHeight;

  const frameCtx = frameCanvas.getContext("2d", { alpha: true, desynchronized: true });
  if (!frameCtx) {
    return null;
  }

  const imageData = frameCtx.createImageData(patternWidth, patternHeight);
  const { data } = imageData;

  for (let y = 0; y < patternHeight; y += grainDensity) {
    for (let x = 0; x < patternWidth; x += grainDensity) {
      const gray = Math.floor(Math.random() * 256);
      const alpha = Math.round(grainOpacity * (0.35 + Math.random() * 0.65) * 255);
      const maxY = Math.min(patternHeight, y + grainHeight);
      const maxX = Math.min(patternWidth, x + grainWidth);

      for (let fillY = y; fillY < maxY; fillY += 1) {
        for (let fillX = x; fillX < maxX; fillX += 1) {
          const pixelIndex = (fillY * patternWidth + fillX) * 4;
          data[pixelIndex] = gray;
          data[pixelIndex + 1] = gray;
          data[pixelIndex + 2] = gray;
          data[pixelIndex + 3] = alpha;
        }
      }
    }
  }

  frameCtx.putImageData(imageData, 0, 0);
  return frameCanvas;
}

function acquireFramePool(
  cacheKey: string,
  patternWidth: number,
  patternHeight: number,
  grainOpacity: number,
  grainDensity: number,
  grainWidth: number,
  grainHeight: number,
  numFrames: number,
) {
  const cached = framePoolCache.get(cacheKey);
  if (cached) {
    cached.refs += 1;
    return cached.frames;
  }

  const frames: HTMLCanvasElement[] = [];
  for (let frameIndex = 0; frameIndex < numFrames; frameIndex += 1) {
    const frame = createNoiseFrame(
      patternWidth,
      patternHeight,
      grainOpacity,
      grainDensity,
      grainWidth,
      grainHeight,
    );
    if (frame) {
      frames.push(frame);
    }
  }

  framePoolCache.set(cacheKey, { frames, refs: 1 });
  return frames;
}

function releaseFramePool(cacheKey: string) {
  const cached = framePoolCache.get(cacheKey);
  if (!cached) {
    return;
  }

  cached.refs -= 1;
  if (cached.refs <= 0) {
    framePoolCache.delete(cacheKey);
  }
}

export function mountGrainEffect(target: HTMLElement, options: GrainEffectOptions = {}) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { alpha: true, desynchronized: true });
  if (!ctx) {
    return () => undefined;
  }

  const safePatternWidth = Math.max(24, Math.floor(options.patternWidth ?? 100));
  const safePatternHeight = Math.max(24, Math.floor(options.patternHeight ?? 100));
  const safeGrainOpacity = Math.max(0, Math.min(1, options.grainOpacity ?? 0.05));
  const safeGrainDensity = Math.max(1, Math.floor(options.grainDensity ?? 1));
  const safeGrainWidth = Math.max(1, Math.floor(options.grainWidth ?? 1));
  const safeGrainHeight = Math.max(1, Math.floor(options.grainHeight ?? 1));
  const safeGrainSpeed = Math.max(4, Math.min(24, Math.floor(options.grainSpeed ?? 8)));
  const safeDprCap = Math.max(1, Math.min(3, options.dprCap ?? 2));
  const safeNumFrames = Math.max(4, Math.min(32, Math.floor(options.numFrames ?? 16)));
  const shouldPauseWhileScrolling = options.pauseWhileScrolling !== false;
  const safeScrollResumeDelayMs = Math.max(60, Math.floor(options.scrollResumeDelayMs ?? 140));
  const frameIntervalMs = 1000 / safeGrainSpeed;
  const shouldPauseWhenNavMenuOpen = options.pauseWhenNavMenuOpen !== false;
  const readNavMenuPauseState = () =>
    shouldPauseWhenNavMenuOpen && document.documentElement.dataset.navMenuOpen === "true";
  const framePoolCacheKey = buildFramePoolCacheKey(
    safePatternWidth,
    safePatternHeight,
    safeGrainOpacity,
    safeGrainDensity,
    safeGrainWidth,
    safeGrainHeight,
    safeNumFrames,
  );
  const sourceFrames = acquireFramePool(
    framePoolCacheKey,
    safePatternWidth,
    safePatternHeight,
    safeGrainOpacity,
    safeGrainDensity,
    safeGrainWidth,
    safeGrainHeight,
    safeNumFrames,
  );

  if (sourceFrames.length === 0) {
    releaseFramePool(framePoolCacheKey);
    return () => undefined;
  }

  const framePatterns = sourceFrames
    .map((frame) => ctx.createPattern(frame, "repeat"))
    .filter((pattern): pattern is CanvasPattern => Boolean(pattern));

  if (framePatterns.length === 0) {
    releaseFramePool(framePoolCacheKey);
    return () => undefined;
  }

  canvas.setAttribute("aria-hidden", "true");
  canvas.style.position = "absolute";
  canvas.style.inset = "0";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.pointerEvents = "none";
  canvas.style.display = "block";
  target.appendChild(canvas);

  let cssWidth = 1;
  let cssHeight = 1;
  let devicePixelRatio = 1;
  let lastDrawAt = 0;
  let frameIndex = 0;
  let isRegistered = false;
  let resizeObserver: ResizeObserver | null = null;
  let intersectionObserver: IntersectionObserver | null = null;
  let isInViewport = true;
  let isDocumentVisible = document.visibilityState !== "hidden";
  let isPausedByNavMenu = false;
  let isPausedByScroll = false;
  let scrollResumeTimerId: number | null = null;

  const syncCanvasSize = () => {
    cssWidth = Math.max(1, Math.round(target.clientWidth));
    cssHeight = Math.max(1, Math.round(target.clientHeight));
    devicePixelRatio = Math.min(window.devicePixelRatio || 1, safeDprCap);

    const nextWidth = Math.max(1, Math.round(cssWidth * devicePixelRatio));
    const nextHeight = Math.max(1, Math.round(cssHeight * devicePixelRatio));
    if (canvas.width !== nextWidth) {
      canvas.width = nextWidth;
    }
    if (canvas.height !== nextHeight) {
      canvas.height = nextHeight;
    }
  };

  const displayFrame = () => {
    const pattern = framePatterns[frameIndex];
    frameIndex = (frameIndex + 1) % framePatterns.length;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, cssWidth, cssHeight);
  };

  const shouldAnimate = () =>
    isInViewport && isDocumentVisible && !isPausedByNavMenu && !isPausedByScroll;

  const stopAnimationLoop = () => {
    if (!isRegistered) {
      return;
    }

    isRegistered = false;
    unregisterSharedCallback(tick);
  };

  const tick = (timestamp: number) => {
    if (!shouldAnimate()) {
      stopAnimationLoop();
      return;
    }

    if (timestamp - lastDrawAt >= frameIntervalMs) {
      displayFrame();
      lastDrawAt = timestamp;
    }
  };

  const startAnimationLoop = () => {
    if (isRegistered || !shouldAnimate()) {
      return;
    }

    isRegistered = true;
    registerSharedCallback(tick);
  };

  const handleResize = () => {
    syncCanvasSize();
    displayFrame();
  };

  const handleVisibilityChange = () => {
    isDocumentVisible = document.visibilityState !== "hidden";
    if (isDocumentVisible) {
      displayFrame();
      startAnimationLoop();
    } else {
      stopAnimationLoop();
    }
  };

  const handleNavMenuPauseChange = () => {
    const nextPausedState = readNavMenuPauseState();
    if (nextPausedState === isPausedByNavMenu) {
      return;
    }

    isPausedByNavMenu = nextPausedState;
    if (isPausedByNavMenu) {
      stopAnimationLoop();
      return;
    }

    displayFrame();
    startAnimationLoop();
  };

  const clearScrollResumeTimer = () => {
    if (scrollResumeTimerId !== null) {
      window.clearTimeout(scrollResumeTimerId);
      scrollResumeTimerId = null;
    }
  };

  const handleScrollActivity = () => {
    if (!shouldPauseWhileScrolling) {
      return;
    }

    isPausedByScroll = true;
    stopAnimationLoop();
    clearScrollResumeTimer();

    scrollResumeTimerId = window.setTimeout(() => {
      isPausedByScroll = false;
      displayFrame();
      startAnimationLoop();
      scrollResumeTimerId = null;
    }, safeScrollResumeDelayMs);
  };

  isPausedByNavMenu = readNavMenuPauseState();
  syncCanvasSize();
  displayFrame();
  startAnimationLoop();

  if (typeof ResizeObserver !== "undefined") {
    resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(target);
  } else {
    window.addEventListener("resize", handleResize);
  }

  if (typeof IntersectionObserver !== "undefined") {
    intersectionObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) {
          return;
        }

        isInViewport = entry.isIntersecting && entry.intersectionRatio > 0;
        if (isInViewport) {
          displayFrame();
          startAnimationLoop();
        } else {
          stopAnimationLoop();
        }
      },
      { root: null, threshold: 0 },
    );
    intersectionObserver.observe(target);
  }

  document.addEventListener("visibilitychange", handleVisibilityChange);
  document.addEventListener("nav-menu-grain-pause-change", handleNavMenuPauseChange);
  window.addEventListener("scroll", handleScrollActivity, { passive: true });

  return () => {
    stopAnimationLoop();
    if (resizeObserver) {
      resizeObserver.disconnect();
    } else {
      window.removeEventListener("resize", handleResize);
    }
    if (intersectionObserver) {
      intersectionObserver.disconnect();
    }
    clearScrollResumeTimer();
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    document.removeEventListener("nav-menu-grain-pause-change", handleNavMenuPauseChange);
    window.removeEventListener("scroll", handleScrollActivity);
    if (canvas.parentElement) {
      canvas.parentElement.removeChild(canvas);
    }
    releaseFramePool(framePoolCacheKey);
  };
}
