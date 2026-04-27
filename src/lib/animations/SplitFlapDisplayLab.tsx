'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const BOARD_ROWS = 7;
const BOARD_COLS = 10;
const RANDOM_START_DELAY_MAX_MS = 260;
const FLAP_GAP_PX = 1;
const HALF_FLAP_HEIGHT = `calc(50% - ${FLAP_GAP_PX / 2}px)`;
const FLAP_CELL_HEIGHT_CLASS = 'h-12 sm:h-12';
const FLAP_CHARS = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,!?-:/+&'{}[]()❤";
const RANDOM_INTERIM_STEPS = 5;
const DISPLAY_RANDOM_INTERIM_STEPS = 2;
const HIRAGANA_SHUFFLE_CHARS = 'あいうえおかきくけこさしすせそたちつてと';
const KATAKANA_SHUFFLE_CHARS = 'アイウエオカキクケコサシスセソタチツテト';
const RANDOM_FLAP_CHARS = `ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*-_=+[]{};:'",.<>/?\\|${HIRAGANA_SHUFFLE_CHARS}${KATAKANA_SHUFFLE_CHARS}`;
const SWEEP_SHARED_CHAR_POOL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#&?';
const TOP_FLIP_MS = 80;
const BOTTOM_FLIP_MS = 95;
const HOLD_AFTER_COMPLETE_MS = 6000;
const INITIAL_ACTIVE_START_DELAY_MS = 220;
const COLUMN_SWEEP_STEP_MS = 135;
const COLOR_FILL_HOLD_MS = 260;
const CASCADE_COLUMN_STEP_MS = 34;
const CASCADE_ROW_STAGGER_MS = 20;
const CASCADE_JITTER_MS = 18;
const CASCADE_INTERIM_STEPS = 3;
const DISPLAY_CASCADE_INTERIM_STEPS = 2;
const TRANSITION_VARIANTS = ['classic', 'column-sweep-green', 'center-out-color-fill', 'cascading-keys'] as const;
const DISPLAY_TRANSITION_VARIANTS = ['classic', 'cascading-keys'] as const;
const COLOR_FILL_TOKENS = ['{', '}', '[', ']', '>'] as const;

const COLOR_FLAP_LEGEND = [
  { token: '{', color: '#88ca5e', label: 'GREEN' },
  { token: '}', color: '#4a98f4', label: 'BLUE' },
  { token: '[', color: '#8f83ca', label: 'PURPLE' },
  { token: ']', color: '#ef4058', label: 'RED' },
  { token: '(', color: '#ffffff', label: 'WHITE' },
  { token: ')', color: '#000000', label: 'BLACK' },
  { token: '>', color: '#f5e211', label: 'YELLOW' },
] as const;

const COLOR_FLAP_MAP: Record<string, string> = COLOR_FLAP_LEGEND.reduce<Record<string, string>>(
  (accumulator, item) => {
    accumulator[item.token] = item.color;
    return accumulator;
  },
  {},
);

type ThemeMode = 'dark' | 'light';

type SplitFlapTheme = {
  pageBg: string;
  pageText: string;
  headerLabel: string;
  headerSubtext: string;
  panelBg: string;
  panelBorder: string;
  panelShadow: string;
  boardBg: string;
  boardBorder: string;
  boardInset: string;
  inputBg: string;
  inputBorder: string;
  inputText: string;
  inputFocus: string;
  primaryButtonBg: string;
  primaryButtonText: string;
  secondaryButtonBg: string;
  secondaryButtonBorder: string;
  secondaryButtonText: string;
  footnote: string;
  cellShellBg: string;
  cellShellBorder: string;
  cellShellText: string;
  cellShellShadow: string;
  staticFaceBg: string;
  flipFaceBg: string;
  seam: string;
};

const THEMES: Record<ThemeMode, SplitFlapTheme> = {
  dark: {
    pageBg: '#0a0a0a',
    pageText: '#ffffff',
    headerLabel: '#bfbfbf',
    headerSubtext: '#c7c7c7',
    panelBg: '#111111',
    panelBorder: 'rgba(255,255,255,0.1)',
    panelShadow: '0 16px 45px rgba(0,0,0,0.45)',
    boardBg: '#0b0b0b',
    boardBorder: 'rgba(0,0,0,0.4)',
    boardInset: 'inset 0 0 0 1px rgba(255,255,255,0.04)',
    inputBg: '#0f0f0f',
    inputBorder: 'rgba(255,255,255,0.15)',
    inputText: '#efefef',
    inputFocus: '#6faeff',
    primaryButtonBg: '#d7d1b6',
    primaryButtonText: '#000000',
    secondaryButtonBg: 'transparent',
    secondaryButtonBorder: 'rgba(255,255,255,0.2)',
    secondaryButtonText: '#ffffff',
    footnote: '#989898',
    cellShellBg: '#191919',
    cellShellBorder: 'rgba(0,0,0,0.4)',
    cellShellText: '#ece7cf',
    cellShellShadow: 'inset 0 1px 0 rgba(255,255,255,0.08), 0 6px 10px rgba(0,0,0,0.35)',
    staticFaceBg: '#121212',
    flipFaceBg: '#121212',
    seam: 'rgba(0,0,0,0.7)',
  },
  light: {
    pageBg: '#f2f1eb',
    pageText: '#151515',
    headerLabel: '#666666',
    headerSubtext: '#4f4f4f',
    panelBg: '#e8e6de',
    panelBorder: 'rgba(0,0,0,0.1)',
    panelShadow: '0 16px 40px rgba(0,0,0,0.12)',
    boardBg: '#dfddd4',
    boardBorder: 'rgba(0,0,0,0.15)',
    boardInset: 'inset 0 0 0 1px rgba(255,255,255,0.45)',
    inputBg: '#f7f6f2',
    inputBorder: 'rgba(0,0,0,0.18)',
    inputText: '#202020',
    inputFocus: '#3275d6',
    primaryButtonBg: '#1f1f1f',
    primaryButtonText: '#ffffff',
    secondaryButtonBg: 'transparent',
    secondaryButtonBorder: 'rgba(0,0,0,0.25)',
    secondaryButtonText: '#1f1f1f',
    footnote: '#555555',
    cellShellBg: '#f3f2ee',
    cellShellBorder: 'rgba(0,0,0,0.28)',
    cellShellText: '#202020',
    cellShellShadow: 'inset 0 1px 0 rgba(255,255,255,0.85), 0 4px 8px rgba(0,0,0,0.15)',
    staticFaceBg: '#e3e1da',
    flipFaceBg: '#e3e1da',
    seam: 'rgba(0,0,0,0.25)',
  },
};

type BoardPreset =
  | { type: 'static'; lines: string[] }
  | { type: 'clock' };

type TransitionVariant = (typeof TRANSITION_VARIANTS)[number];
type TransitionMode = 'random' | TransitionVariant;
type SplitFlapPerformanceMode = 'light' | 'full';

const TRANSITION_MODE_OPTIONS: Array<{ value: TransitionMode; label: string }> = [
  { value: 'random', label: 'RANDOM' },
  { value: 'classic', label: 'CLASSIC' },
  { value: 'column-sweep-green', label: 'LEFT TO RIGHT SWEEP' },
  { value: 'center-out-color-fill', label: 'CENTER OUT SWEEP' },
  { value: 'cascading-keys', label: 'CASCADING KEYS' },
];

type ApplyBoardOptions = {
  delayGrid?: number[][];
  sharedInterimSequence?: string[] | null;
  prependBlank?: boolean;
  stepsPerChangedCell?: number;
};

const boardPresets: BoardPreset[] = [
{
  type: 'static',
  lines: [
    '',
    '   ] ]    ',
    '  ] ] ]   ',
    '  ]   ]   ',
    '   ] ]    ',
    '    ]     ',
    '',
  ],
},
  { type: 'clock' },
  {
    type: 'static',
    lines: [
      '} Web Dev',
      '',
      '{ Branding',
      '',
      '] And',
      '',
      '[ Strategy',
    ],
  },
  {
    type: 'static',
    lines: [
      'WELCOME',
      'TO STRAND',
      ' > > > > >',
      '> > > > > ',
      '',
      '{ On Time',
      '] No Delay',
    ],
  },
];

function sanitizeChar(char: string) {
  const normalized = char.toUpperCase();
  return FLAP_CHARS.includes(normalized) || isColorFlapToken(normalized) ? normalized : ' ';
}

function isColorFlapToken(char: string) {
  return char in COLOR_FLAP_MAP;
}

function getFaceColorForChar(char: string, theme: SplitFlapTheme, state: 'static' | 'flip') {
  if (isColorFlapToken(char)) {
    return COLOR_FLAP_MAP[char];
  }
  return state === 'static' ? theme.staticFaceBg : theme.flipFaceBg;
}

function getDisplayChar(char: string) {
  return isColorFlapToken(char) ? ' ' : char;
}

function randomInterimChar(excluded: string[], charPool = RANDOM_FLAP_CHARS) {
  const pool = Array.from(new Set(charPool.split('')));
  const candidates = pool.filter((char) => !excluded.includes(char));
  const source = candidates.length > 0 ? candidates : pool;
  const index = Math.floor(Math.random() * source.length);
  return source[index] ?? ' ';
}

function buildSharedInterimSequence(count: number, charPool = RANDOM_FLAP_CHARS) {
  const sequence: string[] = [];
  let lastChar = ' ';

  for (let step = 0; step < count; step += 1) {
    const nextChar = randomInterimChar([lastChar], charPool);
    sequence.push(nextChar);
    lastChar = nextChar;
  }

  return sequence;
}

function buildFlipSequence(fromChar: string, toChar: string, interimSteps = RANDOM_INTERIM_STEPS) {
  if (fromChar === toChar) {
    return [];
  }

  const sequence: string[] = [];
  let lastChar = fromChar;

  for (let step = 0; step < interimSteps; step += 1) {
    const randomChar = randomInterimChar([lastChar, toChar]);
    sequence.push(randomChar);
    lastChar = randomChar;
  }

  sequence.push(toChar);
  return sequence;
}

function normalizeBoardLines(lines: string[]) {
  const normalized = lines.slice(0, BOARD_ROWS).map((line) => line.toUpperCase().slice(0, BOARD_COLS));
  while (normalized.length < BOARD_ROWS) {
    normalized.push('');
  }
  return normalized;
}

function boardLinesToText(lines: string[]) {
  return normalizeBoardLines(lines).join('\n');
}

function centerLine(line: string, width: number) {
  const clipped = line.slice(0, width);
  const leftPadding = Math.max(0, Math.floor((width - clipped.length) / 2));
  return `${' '.repeat(leftPadding)}${clipped}`;
}

function buildClockBoardLines(now: Date = new Date()) {
  const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(now);
  const month = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(now);
  const day = new Intl.DateTimeFormat('en-US', { day: 'numeric' }).format(now);
  const timeLabel = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
    .format(now)
    .replaceAll('\u202F', ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const timeZoneLabel = new Intl.DateTimeFormat('en-US', {
    timeZoneName: 'short',
  })
    .formatToParts(now)
    .find((part) => part.type === 'timeZoneName')
    ?.value.replaceAll('\u202F', ' ')
    .replace(/\s+/g, ' ')
    .trim() ?? '';

  const rows = Array.from({ length: BOARD_ROWS }, () => Array.from({ length: BOARD_COLS }, () => ' '));
  const blueToken = '}';
  const lastRow = BOARD_ROWS - 1;
  const lastCol = BOARD_COLS - 1;

  rows[0][0] = blueToken;
  rows[0][1] = blueToken;
  rows[1][0] = blueToken;

  rows[0][lastCol] = blueToken;
  rows[0][lastCol - 1] = blueToken;
  rows[1][lastCol] = blueToken;

  rows[lastRow][0] = blueToken;
  rows[lastRow][1] = blueToken;
  rows[lastRow - 1][0] = blueToken;

  rows[lastRow][lastCol] = blueToken;
  rows[lastRow][lastCol - 1] = blueToken;
  rows[lastRow - 1][lastCol] = blueToken;

  const startRow = Math.floor((BOARD_ROWS - 4) / 2);
  const writeCenteredRow = (rowIndex: number, value: string) => {
    const centered = centerLine(value, BOARD_COLS);
    for (let colIndex = 0; colIndex < BOARD_COLS; colIndex += 1) {
      const nextChar = centered[colIndex] ?? ' ';
      if (nextChar !== ' ') {
        rows[rowIndex][colIndex] = nextChar;
      }
    }
  };

  writeCenteredRow(startRow, weekday);
  writeCenteredRow(startRow + 1, `${month}, ${day}`);
  writeCenteredRow(startRow + 2, timeLabel);
  writeCenteredRow(startRow + 3, timeZoneLabel);
  const lines = rows.map((row) => row.join(''));
  return normalizeBoardLines(lines);
}

function resolvePresetLines(preset: BoardPreset) {
  if (preset.type === 'clock') {
    return buildClockBoardLines();
  }
  return normalizeBoardLines(preset.lines);
}

function buildRandomDelayGrid() {
  return Array.from({ length: BOARD_ROWS }, () =>
    Array.from({ length: BOARD_COLS }, () => Math.floor(Math.random() * (RANDOM_START_DELAY_MAX_MS + 1))),
  );
}

function buildColumnDelayGrid(stepMs: number) {
  return Array.from({ length: BOARD_ROWS }, (_, rowIndex) =>
    Array.from({ length: BOARD_COLS }, (_, colIndex) => colIndex * stepMs + rowIndex * 5),
  );
}

function buildCenterOutDelayGrid(stepMs: number) {
  const centerCol = Math.floor((BOARD_COLS - 1) / 2);
  return Array.from({ length: BOARD_ROWS }, (_, rowIndex) =>
    Array.from({ length: BOARD_COLS }, (_, colIndex) => {
      const distance = Math.abs(colIndex - centerCol);
      return distance * stepMs + rowIndex * 5;
    }),
  );
}

function buildCascadingKeysDelayGrid(direction: 'ltr' | 'rtl') {
  return Array.from({ length: BOARD_ROWS }, (_, rowIndex) =>
    Array.from({ length: BOARD_COLS }, (_, colIndex) => {
      const directionalCol = direction === 'ltr' ? colIndex : BOARD_COLS - 1 - colIndex;
      const diagonalWave = directionalCol * CASCADE_COLUMN_STEP_MS + rowIndex * CASCADE_ROW_STAGGER_MS;
      const deterministicJitter = (rowIndex * 13 + colIndex * 19) % CASCADE_JITTER_MS;
      return diagonalWave + deterministicJitter;
    }),
  );
}

function pickRandomItem<T>(items: readonly T[]): T {
  const index = Math.floor(Math.random() * items.length);
  return items[index] ?? items[0];
}

function buildSolidColorBoard(fillToken: string) {
  return Array.from({ length: BOARD_ROWS }, () => fillToken.repeat(BOARD_COLS));
}

function estimateBoardFlipDurationMs(
  fromLines: string[],
  toLines: string[],
  delayGrid: number[][],
  stepsPerChangedCell = RANDOM_INTERIM_STEPS + 1,
) {
  const flipDurationPerCell = stepsPerChangedCell * (TOP_FLIP_MS + BOTTOM_FLIP_MS);
  let maxDuration = 0;

  for (let rowIndex = 0; rowIndex < BOARD_ROWS; rowIndex += 1) {
    const fromLine = (fromLines[rowIndex] ?? '').padEnd(BOARD_COLS, ' ');
    const toLine = (toLines[rowIndex] ?? '').padEnd(BOARD_COLS, ' ');

    for (let colIndex = 0; colIndex < BOARD_COLS; colIndex += 1) {
      const currentChar = sanitizeChar(fromLine[colIndex]);
      const nextChar = sanitizeChar(toLine[colIndex]);

      if (currentChar === nextChar) {
        continue;
      }

      const duration = delayGrid[rowIndex][colIndex] + flipDurationPerCell;
      if (duration > maxDuration) {
        maxDuration = duration;
      }
    }
  }

  return maxDuration;
}

function FlapGlyphHalf({
  char,
  half,
}: {
  char: string;
  half: 'top' | 'bottom';
}) {
  return (
    <span
      className="pointer-events-none absolute inset-x-0 h-[200%] select-none font-mono text-[1.35rem] font-semibold leading-none sm:text-[1.5rem]"
      style={{
        top: half === 'top' ? '0%' : '-100%',
      }}
    >
      <span className="absolute inset-0 flex items-center justify-center">{char}</span>
    </span>
  );
}

function SplitFlapCell({
  targetChar,
  delayMs = 0,
  theme,
  sharedInterimSequence,
  prependBlank,
  isEnabled,
  interimSteps = RANDOM_INTERIM_STEPS,
}: {
  targetChar: string;
  delayMs?: number;
  theme: SplitFlapTheme;
  sharedInterimSequence: string[] | null;
  prependBlank: boolean;
  isEnabled: boolean;
  interimSteps?: number;
}) {
  const initialChar = sanitizeChar(targetChar);
  const [currentChar, setCurrentChar] = useState(initialChar);
  const [previousChar, setPreviousChar] = useState(initialChar);
  const [incomingChar, setIncomingChar] = useState(initialChar);
  const [phase, setPhase] = useState<'idle' | 'top' | 'bottom'>('idle');
  const [flipCycle, setFlipCycle] = useState(0);

  const timersRef = useRef<number[]>([]);
  const currentRef = useRef(currentChar);
  const phaseRef = useRef<'idle' | 'top' | 'bottom'>('idle');
  const queueRef = useRef<string[]>([]);
  const activeIncomingRef = useRef<string>(' ');
  const runNextFlipRef = useRef<() => void>(() => undefined);

  useEffect(() => {
    currentRef.current = currentChar;
  }, [currentChar]);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach((timerId) => window.clearTimeout(timerId));
      timersRef.current = [];
    };
  }, []);

  const scheduleTimeout = useCallback((callback: () => void, ms: number) => {
    let timerId = 0;
    timerId = window.setTimeout(() => {
      timersRef.current = timersRef.current.filter((id) => id !== timerId);
      callback();
    }, ms);
    timersRef.current.push(timerId);
    return timerId;
  }, []);

  const runNextFlip = useCallback(() => {
    if (phaseRef.current !== 'idle') {
      return;
    }

    let nextChar = queueRef.current.shift();

    while (nextChar !== undefined && nextChar === currentRef.current) {
      nextChar = queueRef.current.shift();
    }

    if (nextChar === undefined) {
      return;
    }

    setPreviousChar(currentRef.current);
    setIncomingChar(nextChar);
    activeIncomingRef.current = nextChar;
    phaseRef.current = 'top';
    setPhase('top');
    setFlipCycle((value) => value + 1);

    scheduleTimeout(() => {
      phaseRef.current = 'bottom';
      setPhase('bottom');
    }, TOP_FLIP_MS);

    scheduleTimeout(() => {
      setCurrentChar(nextChar);
      currentRef.current = nextChar;
      phaseRef.current = 'idle';
      setPhase('idle');
      scheduleTimeout(() => runNextFlipRef.current(), 0);
    }, TOP_FLIP_MS + BOTTOM_FLIP_MS);
  }, [scheduleTimeout]);

  useEffect(() => {
    runNextFlipRef.current = runNextFlip;
  }, [runNextFlip]);

  useEffect(() => {
    if (!isEnabled) {
      queueRef.current = [];
      return;
    }

    const nextChar = sanitizeChar(targetChar);
    const baseChar =
      phaseRef.current === 'idle' ? currentRef.current : activeIncomingRef.current || currentRef.current;
    if (sharedInterimSequence && sharedInterimSequence.length > 0) {
      if (baseChar === nextChar && !prependBlank) {
        queueRef.current = [];
        return;
      }

      const sequence = [
        ...(prependBlank ? [' '] : []),
        ...sharedInterimSequence,
        nextChar,
      ];
      queueRef.current = sequence;
    } else {
      queueRef.current = buildFlipSequence(baseChar, nextChar, interimSteps);
    }

    const delayTimer = scheduleTimeout(() => runNextFlipRef.current(), delayMs);

    return () => {
      window.clearTimeout(delayTimer);
      timersRef.current = timersRef.current.filter((id) => id !== delayTimer);
    };
  }, [delayMs, interimSteps, isEnabled, prependBlank, runNextFlip, scheduleTimeout, sharedInterimSequence, targetChar]);

  const staticTopChar = phase === 'bottom' ? incomingChar : currentChar;
  const staticBottomChar = phase === 'idle' ? currentChar : incomingChar;
  const staticTopFaceColor = getFaceColorForChar(staticTopChar, theme, 'static');
  const staticBottomFaceColor = getFaceColorForChar(staticBottomChar, theme, 'static');
  const topFlipFaceColor = getFaceColorForChar(previousChar, theme, 'flip');
  const bottomFlipFaceColor = getFaceColorForChar(incomingChar, theme, 'flip');

  return (
    <div
      className={`relative ${FLAP_CELL_HEIGHT_CLASS} w-10 rounded-[4px] border sm:w-11`}
      style={{
        perspective: 640,
        backgroundColor: theme.cellShellBg,
        borderColor: theme.cellShellBorder,
        color: theme.cellShellText,
        boxShadow: theme.cellShellShadow,
      }}
      aria-hidden="true"
    >
      <div
        className="absolute inset-x-0 top-0 overflow-hidden rounded-t-[4px]"
        style={{ height: HALF_FLAP_HEIGHT }}
      >
        <div className="absolute inset-0" style={{ backgroundColor: staticTopFaceColor }} />
        <FlapGlyphHalf char={getDisplayChar(staticTopChar)} half="top" />
      </div>

      <div
        className="absolute inset-x-0 bottom-0 overflow-hidden rounded-b-[4px]"
        style={{ height: HALF_FLAP_HEIGHT }}
      >
        <div className="absolute inset-0" style={{ backgroundColor: staticBottomFaceColor }} />
        <FlapGlyphHalf char={getDisplayChar(staticBottomChar)} half="bottom" />
      </div>

      <div
        className="absolute inset-x-0 top-1/2 -translate-y-1/2"
        style={{ height: `${FLAP_GAP_PX}px`, backgroundColor: theme.seam }}
      />

      {phase === 'top' && (
        <div
          key={`top-${flipCycle}`}
          className="absolute inset-x-0 top-0 origin-bottom overflow-hidden rounded-t-[4px] [animation:split-flap-top_80ms_cubic-bezier(0.4,0,1,1)_forwards]"
          style={{ height: HALF_FLAP_HEIGHT }}
        >
          <div className="absolute inset-0" style={{ backgroundColor: topFlipFaceColor }} />
          <FlapGlyphHalf char={getDisplayChar(previousChar)} half="top" />
        </div>
      )}

      {phase === 'bottom' && (
        <div
          key={`bottom-${flipCycle}`}
          className="absolute inset-x-0 bottom-0 origin-top overflow-hidden rounded-b-[4px] [animation:split-flap-bottom_95ms_cubic-bezier(0,0,0.2,1)_forwards]"
          style={{ height: HALF_FLAP_HEIGHT }}
        >
          <div className="absolute inset-0" style={{ backgroundColor: bottomFlipFaceColor }} />
          <FlapGlyphHalf char={getDisplayChar(incomingChar)} half="bottom" />
        </div>
      )}
    </div>
  );
}

export function SplitFlapDisplayOnly({
  className = '',
  isActive = true,
  performanceMode = 'full',
}: {
  className?: string;
  isActive?: boolean;
  performanceMode?: SplitFlapPerformanceMode;
}) {
  const [targetLines, setTargetLines] = useState(() => resolvePresetLines(boardPresets[0]));
  const [cellDelayGrid, setCellDelayGrid] = useState(() => buildRandomDelayGrid());
  const [sharedInterimSequence, setSharedInterimSequence] = useState<string[] | null>(null);
  const [prependBlank, setPrependBlank] = useState(false);
  const [isDocumentVisible, setIsDocumentVisible] = useState(() =>
    typeof document === 'undefined' ? true : document.visibilityState !== 'hidden',
  );
  const presetIndexRef = useRef(0);
  const targetLinesRef = useRef(targetLines);
  const queuedTransitionTimerRef = useRef<number | null>(null);
  const theme = THEMES.dark;
  const isLightMode = performanceMode === 'light';
  const effectiveIsActive = isActive && (!isLightMode || isDocumentVisible);
  const interimSteps = isLightMode ? DISPLAY_RANDOM_INTERIM_STEPS : RANDOM_INTERIM_STEPS;
  const cascadeInterimSteps = isLightMode ? DISPLAY_CASCADE_INTERIM_STEPS : CASCADE_INTERIM_STEPS;
  const transitionVariants = isLightMode ? DISPLAY_TRANSITION_VARIANTS : TRANSITION_VARIANTS;

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const handleVisibilityChange = () => {
      setIsDocumentVisible(document.visibilityState !== 'hidden');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    targetLinesRef.current = targetLines;
  }, [targetLines]);

  const applyBoard = useCallback((nextLines: string[], options: ApplyBoardOptions = {}) => {
    const normalized = normalizeBoardLines(nextLines);
    const nextDelayGrid = options.delayGrid ?? buildRandomDelayGrid();
    const transitionSequence = options.sharedInterimSequence ?? null;
    const includeBlankLeadIn = Boolean(options.prependBlank && transitionSequence);
    const stepsPerChangedCell =
      options.stepsPerChangedCell
      ?? (transitionSequence
        ? transitionSequence.length + (includeBlankLeadIn ? 1 : 0) + 1
        : RANDOM_INTERIM_STEPS + 1);
    const flipDuration = estimateBoardFlipDurationMs(
      targetLinesRef.current,
      normalized,
      nextDelayGrid,
      stepsPerChangedCell,
    );

    setTargetLines(normalized);
    setCellDelayGrid(nextDelayGrid);
    setSharedInterimSequence(transitionSequence);
    setPrependBlank(includeBlankLeadIn);
    targetLinesRef.current = normalized;

    return flipDuration;
  }, []);

  const goToNextPreset = useCallback(() => {
    if (queuedTransitionTimerRef.current !== null) {
      window.clearTimeout(queuedTransitionTimerRef.current);
      queuedTransitionTimerRef.current = null;
    }

    const nextPresetIndex = (presetIndexRef.current + 1) % boardPresets.length;
    presetIndexRef.current = nextPresetIndex;
    const nextBoard = resolvePresetLines(boardPresets[nextPresetIndex]);
    const transitionVariant = pickRandomItem(transitionVariants);

    if (transitionVariant === 'classic') {
      return applyBoard(nextBoard, {
        stepsPerChangedCell: interimSteps + 1,
      });
    }

    if (transitionVariant === 'cascading-keys') {
      const direction = Math.random() > 0.5 ? 'ltr' : 'rtl';
      const cascadeSequence = buildSharedInterimSequence(cascadeInterimSteps, SWEEP_SHARED_CHAR_POOL);
      const cascadeDelayGrid = buildCascadingKeysDelayGrid(direction);
      return applyBoard(nextBoard, {
        delayGrid: cascadeDelayGrid,
        sharedInterimSequence: cascadeSequence,
        prependBlank: false,
        stepsPerChangedCell: cascadeSequence.length + 1,
      });
    }

    const sharedSequence = buildSharedInterimSequence(interimSteps, SWEEP_SHARED_CHAR_POOL);
    const fillToken = transitionVariant === 'column-sweep-green' ? '{' : pickRandomItem(COLOR_FILL_TOKENS);
    const fillBoard = buildSolidColorBoard(fillToken);
    const phaseOneDelayGrid =
      transitionVariant === 'column-sweep-green'
        ? buildColumnDelayGrid(COLUMN_SWEEP_STEP_MS)
        : buildCenterOutDelayGrid(COLUMN_SWEEP_STEP_MS);

    const phaseOneDuration = applyBoard(fillBoard, {
      delayGrid: phaseOneDelayGrid,
      sharedInterimSequence: sharedSequence,
      prependBlank: true,
      stepsPerChangedCell: sharedSequence.length + 2,
    });

    const phaseTwoDelayGrid = buildRandomDelayGrid();
    const phaseTwoDuration = estimateBoardFlipDurationMs(targetLinesRef.current, nextBoard, phaseTwoDelayGrid);

    queuedTransitionTimerRef.current = window.setTimeout(() => {
      applyBoard(nextBoard, { delayGrid: phaseTwoDelayGrid });
      queuedTransitionTimerRef.current = null;
    }, phaseOneDuration + COLOR_FILL_HOLD_MS);

    return phaseOneDuration + COLOR_FILL_HOLD_MS + phaseTwoDuration;
  }, [applyBoard, cascadeInterimSteps, interimSteps, transitionVariants]);

  useEffect(() => {
    return () => {
      if (queuedTransitionTimerRef.current !== null) {
        window.clearTimeout(queuedTransitionTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (effectiveIsActive) {
      return;
    }

    if (queuedTransitionTimerRef.current !== null) {
      window.clearTimeout(queuedTransitionTimerRef.current);
      queuedTransitionTimerRef.current = null;
    }
  }, [effectiveIsActive]);

  useEffect(() => {
    if (!effectiveIsActive) {
      return;
    }

    let isCancelled = false;
    let timerId: number | null = null;

    const runNextCycle = () => {
      if (isCancelled) {
        return;
      }

      const flipDuration = goToNextPreset();
      timerId = window.setTimeout(runNextCycle, flipDuration + HOLD_AFTER_COMPLETE_MS);
    };

    timerId = window.setTimeout(runNextCycle, INITIAL_ACTIVE_START_DELAY_MS);

    return () => {
      isCancelled = true;
      if (timerId !== null) {
        window.clearTimeout(timerId);
      }
    };
  }, [effectiveIsActive, goToNextPreset]);

  const paddedGrid = useMemo(
    () => targetLines.map((line) => line.padEnd(BOARD_COLS, ' ').split('')),
    [targetLines],
  );

  return (
    <div className={className}>
      <div
        className="rounded-2xl border p-5 sm:p-6"
        style={{
          backgroundColor: theme.panelBg,
          borderColor: theme.panelBorder,
          boxShadow: theme.panelShadow,
        }}
      >
        <div
          className="rounded-xl border p-4 sm:p-5"
          style={{
            backgroundColor: theme.boardBg,
            borderColor: theme.boardBorder,
            boxShadow: theme.boardInset,
          }}
        >
          <div className="inline-flex min-w-max flex-col gap-6">
            {paddedGrid.map((row, rowIndex) => (
              <div key={`display-row-${rowIndex}`} className="flex items-center gap-6">
                {row.map((char, colIndex) => (
                  <SplitFlapCell
                    key={`display-cell-${rowIndex}-${colIndex}`}
                    targetChar={char}
                    delayMs={cellDelayGrid[rowIndex][colIndex]}
                    theme={theme}
                    sharedInterimSequence={sharedInterimSequence}
                    prependBlank={prependBlank}
                    isEnabled={effectiveIsActive}
                    interimSteps={interimSteps}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SplitFlapDisplayLab() {
  const [themeMode, setThemeMode] = useState<ThemeMode>('dark');
  const [targetLines, setTargetLines] = useState(() => resolvePresetLines(boardPresets[0]));
  const [cellDelayGrid, setCellDelayGrid] = useState(() => buildRandomDelayGrid());
  const [sharedInterimSequence, setSharedInterimSequence] = useState<string[] | null>(null);
  const [prependBlank, setPrependBlank] = useState(false);
  const [draftBoardText, setDraftBoardText] = useState(() => boardLinesToText(resolvePresetLines(boardPresets[0])));
  const [autoPlay, setAutoPlay] = useState(false);
  const [transitionMode, setTransitionMode] = useState<TransitionMode>('random');
  const presetIndexRef = useRef(0);
  const targetLinesRef = useRef(targetLines);
  const queuedTransitionTimerRef = useRef<number | null>(null);
  const theme = THEMES[themeMode];

  useEffect(() => {
    targetLinesRef.current = targetLines;
  }, [targetLines]);

  const applyBoard = useCallback((nextLines: string[], options: ApplyBoardOptions = {}) => {
    const normalized = normalizeBoardLines(nextLines);
    const nextDelayGrid = options.delayGrid ?? buildRandomDelayGrid();
    const transitionSequence = options.sharedInterimSequence ?? null;
    const includeBlankLeadIn = Boolean(options.prependBlank && transitionSequence);
    const stepsPerChangedCell =
      options.stepsPerChangedCell
      ?? (transitionSequence
        ? transitionSequence.length + (includeBlankLeadIn ? 1 : 0) + 1
        : RANDOM_INTERIM_STEPS + 1);
    const flipDuration = estimateBoardFlipDurationMs(
      targetLinesRef.current,
      normalized,
      nextDelayGrid,
      stepsPerChangedCell,
    );
    setTargetLines(normalized);
    setCellDelayGrid(nextDelayGrid);
    setSharedInterimSequence(transitionSequence);
    setPrependBlank(includeBlankLeadIn);
    targetLinesRef.current = normalized;
    return flipDuration;
  }, []);

  const goToNextPreset = useCallback(() => {
    if (queuedTransitionTimerRef.current !== null) {
      window.clearTimeout(queuedTransitionTimerRef.current);
      queuedTransitionTimerRef.current = null;
    }

    const nextPresetIndex = (presetIndexRef.current + 1) % boardPresets.length;
    presetIndexRef.current = nextPresetIndex;
    const nextBoard = resolvePresetLines(boardPresets[nextPresetIndex]);
    const transitionVariant: TransitionVariant =
      transitionMode === 'random' ? pickRandomItem(TRANSITION_VARIANTS) : transitionMode;

    if (transitionVariant === 'classic') {
      const flipDuration = applyBoard(nextBoard);
      setDraftBoardText(boardLinesToText(nextBoard));
      return flipDuration;
    }

    if (transitionVariant === 'cascading-keys') {
      const direction = Math.random() > 0.5 ? 'ltr' : 'rtl';
      const cascadeSequence = buildSharedInterimSequence(CASCADE_INTERIM_STEPS, SWEEP_SHARED_CHAR_POOL);
      const cascadeDelayGrid = buildCascadingKeysDelayGrid(direction);
      const flipDuration = applyBoard(nextBoard, {
        delayGrid: cascadeDelayGrid,
        sharedInterimSequence: cascadeSequence,
        prependBlank: false,
        stepsPerChangedCell: cascadeSequence.length + 1,
      });
      setDraftBoardText(boardLinesToText(nextBoard));
      return flipDuration;
    }

    const sharedSequence = buildSharedInterimSequence(RANDOM_INTERIM_STEPS, SWEEP_SHARED_CHAR_POOL);
    const fillToken = transitionVariant === 'column-sweep-green' ? '{' : pickRandomItem(COLOR_FILL_TOKENS);
    const fillBoard = buildSolidColorBoard(fillToken);
    const phaseOneDelayGrid =
      transitionVariant === 'column-sweep-green'
        ? buildColumnDelayGrid(COLUMN_SWEEP_STEP_MS)
        : buildCenterOutDelayGrid(COLUMN_SWEEP_STEP_MS);
    const phaseOneDuration = applyBoard(fillBoard, {
      delayGrid: phaseOneDelayGrid,
      sharedInterimSequence: sharedSequence,
      prependBlank: true,
      stepsPerChangedCell: sharedSequence.length + 2,
    });

    const phaseTwoDelayGrid = buildRandomDelayGrid();
    const phaseTwoDuration = estimateBoardFlipDurationMs(targetLinesRef.current, nextBoard, phaseTwoDelayGrid);

    queuedTransitionTimerRef.current = window.setTimeout(() => {
      applyBoard(nextBoard, { delayGrid: phaseTwoDelayGrid });
      setDraftBoardText(boardLinesToText(nextBoard));
      queuedTransitionTimerRef.current = null;
    }, phaseOneDuration + COLOR_FILL_HOLD_MS);

    return phaseOneDuration + COLOR_FILL_HOLD_MS + phaseTwoDuration;
  }, [applyBoard, transitionMode]);

  useEffect(() => {
    return () => {
      if (queuedTransitionTimerRef.current !== null) {
        window.clearTimeout(queuedTransitionTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!autoPlay) {
      return;
    }

    let isCancelled = false;
    let timerId: number | null = null;

    const runNextCycle = () => {
      if (isCancelled) {
        return;
      }

      const flipDuration = goToNextPreset();
      timerId = window.setTimeout(runNextCycle, flipDuration + HOLD_AFTER_COMPLETE_MS);
    };

    runNextCycle();

    return () => {
      isCancelled = true;
      if (timerId !== null) {
        window.clearTimeout(timerId);
      }
    };
  }, [autoPlay, goToNextPreset]);

  const paddedGrid = useMemo(
    () => targetLines.map((line) => line.padEnd(BOARD_COLS, ' ').split('')),
    [targetLines],
  );
  return (
    <section
      className="min-h-screen w-full px-6 pb-16 pt-28 sm:px-8"
      style={{ backgroundColor: theme.pageBg, color: theme.pageText }}
    >
      <div className="mx-auto w-full max-w-[1700px]">
        <header className="mb-10">
          <p className="font-mono text-xs tracking-[0.28em]" style={{ color: theme.headerLabel }}>
            /TEST ROUTE
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Split-flap display lab
          </h1>
          <p className="mt-3 max-w-2xl text-sm sm:text-base" style={{ color: theme.headerSubtext }}>
            Mechanical-style split-flap board running a full 6x20 matrix.
          </p>
        </header>

        <div
          className="rounded-2xl border p-5 sm:p-8"
          style={{
            backgroundColor: theme.panelBg,
            borderColor: theme.panelBorder,
            boxShadow: theme.panelShadow,
          }}
        >
          <div
            className="rounded-xl border p-4 sm:p-6"
            style={{
              backgroundColor: theme.boardBg,
              borderColor: theme.boardBorder,
              boxShadow: theme.boardInset,
            }}
          >
            <div className="overflow-x-auto pb-2">
              <div className="inline-flex min-w-max flex-col gap-6">
                {paddedGrid.map((row, rowIndex) => (
                  <div key={`row-${rowIndex}`} className="flex items-center gap-6">
                    {row.map((char, colIndex) => (
                      <SplitFlapCell
                        key={`cell-${rowIndex}-${colIndex}`}
                        targetChar={char}
                        delayMs={cellDelayGrid[rowIndex][colIndex]}
                        theme={theme}
                        sharedInterimSequence={sharedInterimSequence}
                        prependBlank={prependBlank}
                        isEnabled={autoPlay}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]">
            <div className="grid gap-3">
              <textarea
                value={draftBoardText}
                onChange={(event) => setDraftBoardText(event.target.value.toUpperCase())}
                rows={BOARD_ROWS}
                className="w-full resize-none rounded-lg border px-3 py-2 font-mono text-sm tracking-[0.08em] outline-none transition"
                style={{
                  backgroundColor: theme.inputBg,
                  borderColor: theme.inputBorder,
                  color: theme.inputText,
                }}
                onFocus={(event) => {
                  event.currentTarget.style.borderColor = theme.inputFocus;
                }}
                onBlur={(event) => {
                  event.currentTarget.style.borderColor = theme.inputBorder;
                }}
                placeholder={`TYPE UP TO ${BOARD_ROWS} LINES`}
              />
              <div className="grid gap-1">
                <label className="font-mono text-[10px] tracking-[0.14em]" style={{ color: theme.headerLabel }}>
                  TRANSITION MODE
                </label>
                <select
                  value={transitionMode}
                  onChange={(event) => setTransitionMode(event.target.value as TransitionMode)}
                  className="h-11 rounded-lg border px-3 font-mono text-xs tracking-[0.08em] outline-none transition"
                  style={{
                    backgroundColor: theme.inputBg,
                    borderColor: theme.inputBorder,
                    color: theme.inputText,
                  }}
                  onFocus={(event) => {
                    event.currentTarget.style.borderColor = theme.inputFocus;
                  }}
                  onBlur={(event) => {
                    event.currentTarget.style.borderColor = theme.inputBorder;
                  }}
                >
                  {TRANSITION_MODE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid gap-3 sm:content-start">
              <button
                type="button"
                onClick={goToNextPreset}
                className="h-11 rounded-lg px-4 font-mono text-xs font-semibold tracking-[0.1em] transition hover:opacity-90"
                style={{
                  backgroundColor: theme.primaryButtonBg,
                  color: theme.primaryButtonText,
                }}
              >
                NEXT PRESET
              </button>
              <button
                type="button"
                onClick={() => setAutoPlay((value) => !value)}
                className="h-11 rounded-lg border px-4 font-mono text-xs font-semibold tracking-[0.1em] transition hover:opacity-80"
                style={{
                  backgroundColor: theme.secondaryButtonBg,
                  borderColor: theme.secondaryButtonBorder,
                  color: theme.secondaryButtonText,
                }}
              >
                {autoPlay ? 'STOP AUTO' : 'AUTO CYCLE'}
              </button>
              <button
                type="button"
                onClick={() => setThemeMode((value) => (value === 'dark' ? 'light' : 'dark'))}
                className="h-11 rounded-lg border px-4 font-mono text-xs font-semibold tracking-[0.1em] transition hover:opacity-80"
                style={{
                  backgroundColor: theme.secondaryButtonBg,
                  borderColor: theme.secondaryButtonBorder,
                  color: theme.secondaryButtonText,
                }}
              >
                {themeMode === 'dark' ? 'LIGHT MODE' : 'DARK MODE'}
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {COLOR_FLAP_LEGEND.map((item) => (
              <span
                key={item.token}
                className="inline-flex items-center gap-1 rounded-md border px-2 py-1 font-mono text-[10px] tracking-[0.06em]"
                style={{
                  borderColor: theme.inputBorder,
                  backgroundColor: theme.inputBg,
                  color: theme.inputText,
                }}
              >
                <span
                  className="inline-block h-3 w-3 rounded-[2px] border"
                  style={{ backgroundColor: item.color, borderColor: 'rgba(0,0,0,0.25)' }}
                />
                {item.token}
              </span>
            ))}
          </div>

          <p className="mt-3 text-xs" style={{ color: theme.footnote }}>
            Board format: 6 rows x 20 columns. Color flaps: {'{'} {'}'} [ ] ( ) {'>'}. Extra lines and extra
            characters are clipped on flip.
          </p>
        </div>

      </div>
    </section>
  );
}
