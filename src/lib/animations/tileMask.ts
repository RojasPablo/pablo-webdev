export type TileMaskPatternKey =
  | "fullOn"
  | "frame2"
  | "frame3"
  | "frame4"
  | "frame5"
  | "frame6"
  | "fullOff";

export type TileMaskStep = {
  pattern: TileMaskPatternKey;
  opacity: number;
  durationMs: number;
  minDurationMs?: number;
};

export type TileMaskPlaybackStep = TileMaskStep & {
  isLossPrecursor?: boolean;
  lossPrecursorFromPattern?: TileMaskPatternKey;
  lossPrecursorFromOpacity?: number;
};

const TILE_MASK_LOSS_PRECURSOR_OPACITY_FACTOR = 0.5;
const TILE_MASK_LOSS_PRECURSOR_DURATION_RATIO = 0.34;

const TILE_MASK_BASE_SEQUENCE: ReadonlyArray<TileMaskStep> = [
  { pattern: "fullOn", opacity: 1, durationMs: 800 },
  { pattern: "frame2", opacity: 1, durationMs: 520 },
  { pattern: "frame3", opacity: 1, durationMs: 520 },
  { pattern: "frame4", opacity: 1, durationMs: 260, minDurationMs: 120 },
  { pattern: "frame4", opacity: 0.15, durationMs: 130, minDurationMs: 80 },
  { pattern: "frame5", opacity: 0.3, durationMs: 120, minDurationMs: 80 },
  { pattern: "frame6", opacity: 0.15, durationMs: 220, minDurationMs: 80 },
  { pattern: "fullOff", opacity: 0, durationMs: 380 },
] as const;

function buildTileMaskPlaybackSequence(baseSequence: ReadonlyArray<TileMaskStep>): ReadonlyArray<TileMaskPlaybackStep> {
  if (baseSequence.length === 0) {
    return [];
  }

  const steps: TileMaskPlaybackStep[] = [baseSequence[0]];

  for (let index = 1; index < baseSequence.length; index += 1) {
    const previousStep = baseSequence[index - 1];
    const nextStep = baseSequence[index];

    const shouldInsertLossPrecursor = previousStep.pattern !== nextStep.pattern;

    if (!shouldInsertLossPrecursor) {
      steps.push(nextStep);
      continue;
    }

    const precursorDurationMs = Math.max(1, Math.round(nextStep.durationMs * TILE_MASK_LOSS_PRECURSOR_DURATION_RATIO));
    const settleDurationMs = Math.max(1, nextStep.durationMs - precursorDurationMs);

    steps.push({
      ...nextStep,
      durationMs: precursorDurationMs,
      minDurationMs: undefined,
      isLossPrecursor: true,
      lossPrecursorFromPattern: previousStep.pattern,
      lossPrecursorFromOpacity: previousStep.opacity,
    });

    steps.push({
      ...nextStep,
      durationMs: settleDurationMs,
    });
  }

  return steps;
}

export const TILE_MASK_SEQUENCE: ReadonlyArray<TileMaskPlaybackStep> =
  buildTileMaskPlaybackSequence(TILE_MASK_BASE_SEQUENCE);

export function buildTileMaskPatterns(rows: number, cols: number): Record<TileMaskPatternKey, boolean[][]> {
  const safeRows = Math.max(2, Math.floor(rows));
  const safeCols = Math.max(2, Math.floor(cols));
  const topLeadWidth = Math.max(1, Math.round(safeCols * 0.38));
  const halfCol = Math.floor(safeCols / 2);
  const pivotCol = Math.min(safeCols - 1, Math.floor(safeCols * 0.38));
  const rightCol = safeCols - 1;
  const bandRowA = Math.min(safeRows - 1, Math.max(0, Math.round((safeRows - 1) * 0.14)));
  const bandRowB = Math.min(safeRows - 1, Math.max(0, Math.round((safeRows - 1) * 0.71)));
  const bandRowA2 = Math.min(safeRows - 1, bandRowA + 1);
  const bandRowB2 = Math.min(safeRows - 1, bandRowB + 1);

  const buildFrame = (predicate: (row: number, col: number) => boolean) =>
    Array.from({ length: safeRows }, (_, row) =>
      Array.from({ length: safeCols }, (_, col) => predicate(row, col)),
    );

  const fullOn = buildFrame(() => true);
  const fullOff = buildFrame(() => false);

  const frame2 = buildFrame((row, col) => {
    const checkerboard = (row + col) % 2 === 0;
    const accentBand = row % 4 === 3 && col % 4 !== 0;
    const topLead = row === 0 && col < topLeadWidth;
    return checkerboard || accentBand || topLead;
  });

  const frame3 = buildFrame((row, col) => {
    if (row === 0 && col < topLeadWidth) {
      return true;
    }

    const rowMod = row % 4;
    if (rowMod === 1) {
      return col % 2 === 1;
    }
    if (rowMod === 2) {
      return col % 4 === 0;
    }
    if (rowMod === 3) {
      return col % 4 === 3;
    }
    return col % 4 === 2;
  });

  const frame4 = buildFrame((row, col) => {
    if (row === bandRowA || row === bandRowB) {
      return col === 0 || col === halfCol;
    }
    if (row === bandRowA2 || row === bandRowB2) {
      return col === pivotCol || col === rightCol;
    }
    return false;
  });

  const frame5 = buildFrame((row, col) => {
    if (row === bandRowA || row === bandRowB) {
      return col === 0 || col === halfCol;
    }
    if (row === bandRowA2 || row === bandRowB2) {
      return col === pivotCol;
    }
    return false;
  });

  const frame6 = buildFrame((row, col) => {
    if (row === bandRowA || row === bandRowB) {
      return col === 0 || col === halfCol;
    }
    return false;
  });

  return {
    fullOn,
    frame2,
    frame3,
    frame4,
    frame5,
    frame6,
    fullOff,
  };
}

export function buildTileMaskOpacityFrame(
  patterns: Record<TileMaskPatternKey, boolean[][]>,
  step: TileMaskPlaybackStep,
): number[][] {
  const targetPattern = patterns[step.pattern];

  if (!step.isLossPrecursor || !step.lossPrecursorFromPattern) {
    return targetPattern.map((row) => row.map((isActive) => (isActive ? step.opacity : 0)));
  }

  const sourcePattern = patterns[step.lossPrecursorFromPattern];
  const sourceOpacity = step.lossPrecursorFromOpacity ?? step.opacity;
  const lossOpacity = sourceOpacity * TILE_MASK_LOSS_PRECURSOR_OPACITY_FACTOR;

  return targetPattern.map((row, rowIndex) =>
    row.map((isTargetActive, colIndex) => {
      if (isTargetActive) {
        return step.opacity;
      }

      const wasActive = sourcePattern[rowIndex]?.[colIndex] ?? false;
      return wasActive ? lossOpacity : 0;
    }),
  );
}
