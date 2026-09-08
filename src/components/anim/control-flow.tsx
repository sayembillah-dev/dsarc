'use client';

import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from 'lucide-react';

const BASE_MS = 1150;

/* ------------------------------ player ------------------------------ */

export function useStepPlayer(total: number) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (!playing) return;
    if (step >= total) {
      setPlaying(false);
      return;
    }
    timer.current = window.setTimeout(() => setStep((s) => Math.min(s + 1, total)), BASE_MS);
    return () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    };
  }, [playing, step, total]);

  const toggle = () => {
    if (!playing && step >= total) setStep(0);
    setPlaying((p) => !p);
  };
  const reset = () => {
    setPlaying(false);
    setStep(0);
  };
  const next = () => {
    setPlaying(false);
    setStep((s) => Math.min(s + 1, total));
  };
  const prev = () => {
    setPlaying(false);
    setStep((s) => Math.max(s - 1, 0));
  };
  return { step, playing, toggle, reset, next, prev, done: step >= total };
}

/* ------------------------------ atoms ------------------------------ */

export function C({ t }: { t: string }) {
  return (
    <code className="rounded bg-zinc-200/70 px-1 py-0.5 font-mono text-[12px] text-zinc-800">
      {t}
    </code>
  );
}

function EvalBubble({ expr, res }: { expr: string; res: boolean | null }) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 5, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 420, damping: 28 }}
      className="ml-auto inline-flex h-6 shrink-0 items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-2.5 font-mono text-xs shadow-sm"
    >
      <span className="text-zinc-500">{expr}</span>
      <AnimatePresence mode="popLayout">
        {res !== null && (
          <motion.span
            key="result"
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            className={`font-semibold ${res ? 'text-emerald-600' : 'text-rose-600'}`}
          >
            → {res ? 'true' : 'false'}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.span>
  );
}

export function Line({
  n,
  code,
  cursorId,
  active,
  dim,
  taken,
  bubble,
  tag,
  running,
}: {
  n: number;
  code: string;
  cursorId: string;
  active?: boolean;
  dim?: boolean;
  taken?: boolean;
  running?: boolean;
  bubble?: { expr: string; res: boolean | null };
  tag?: ReactNode;
}) {
  return (
    <li
      className={`relative flex h-9 items-center gap-3 rounded-lg px-2 transition-all duration-500 ${
        dim ? 'opacity-35' : 'opacity-100'
      } ${taken ? 'bg-emerald-50' : ''} ${running ? 'bg-amber-50 ring-1 ring-amber-200' : ''}`}
    >
      {active && (
        <motion.span
          layoutId={cursorId}
          transition={{ type: 'spring', stiffness: 340, damping: 32 }}
          className="absolute inset-0 rounded-lg bg-sky-100/80 ring-1 ring-sky-200"
        />
      )}
      {taken && (
        <motion.span
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          className="absolute inset-y-1 left-0 w-[3px] rounded-full bg-emerald-500"
        />
      )}
      {running && (
        <motion.span
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          className="absolute inset-y-1 left-0 w-[3px] rounded-full bg-amber-400"
        />
      )}
      <span className="relative z-10 w-5 shrink-0 select-none text-right text-xs text-zinc-300">
        {n}
      </span>
      <code
        className={`relative z-10 font-mono text-sm sm:text-[15px] ${
          taken ? 'font-medium text-emerald-950' : 'text-zinc-700'
        }`}
      >
        {code}
      </code>
      <AnimatePresence>
        {bubble && (
          <span className="relative z-10 ml-auto">
            <EvalBubble expr={bubble.expr} res={bubble.res} />
          </span>
        )}
      </AnimatePresence>
      {!bubble && tag && <span className="relative z-10 ml-auto">{tag}</span>}
    </li>
  );
}

function Console({ lines }: { lines: string[] }) {
  return (
    <div className="rounded-xl bg-zinc-950 px-4 py-3">
      <div className="text-[10px] font-medium uppercase tracking-widest text-zinc-500">কনসোল</div>
      <div className="mt-1 min-h-7 font-mono text-sm">
        {lines.length === 0 ? (
          <span className="text-zinc-600">...</span>
        ) : (
          lines.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 24 }}
              className="flex items-center gap-2 text-emerald-300"
            >
              <span className="select-none text-zinc-500">&gt;</span>
              {t}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

export function Stage({
  title,
  step,
  total,
  playing,
  done,
  onToggle,
  onReset,
  onNext,
  onPrev,
  caption,
  lines,
  consoleLines,
  viz,
  hideConsole,
}: {
  title: string;
  step: number;
  total: number;
  playing: boolean;
  done: boolean;
  onToggle: () => void;
  onReset: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  caption: ReactNode;
  lines: ReactNode;
  consoleLines: string[];
  viz?: ReactNode;
  hideConsole?: boolean;
}) {
  return (
    <div className="not-prose my-8 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <div className="h-[3px] bg-zinc-100">
        <motion.div
          className="h-full bg-zinc-800"
          style={{ transformOrigin: 'left' }}
          animate={{ scaleX: total === 0 ? 0 : step / total }}
          transition={{ type: 'spring', stiffness: 120, damping: 24 }}
        />
      </div>
      <div className="flex items-center justify-between gap-3 px-5 pt-4">
        <span className="text-sm font-semibold text-zinc-900">{title}</span>
        <div className="flex items-center gap-2">
          {done && (
            <motion.button
              type="button"
              onClick={onReset}
              aria-label="আবার চালাও"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex size-9 items-center justify-center rounded-full border border-zinc-200 text-zinc-500 transition hover:bg-zinc-100 active:scale-95"
            >
              <RotateCcw className="size-4" />
            </motion.button>
          )}
          {onPrev && (
            <motion.button
              type="button"
              onClick={onPrev}
              disabled={step <= 0}
              aria-label="আগের ধাপ"
              whileTap={{ scale: 0.92 }}
              className="inline-flex size-9 items-center justify-center rounded-full border border-zinc-200 text-zinc-500 transition hover:bg-zinc-100 active:scale-95 disabled:pointer-events-none disabled:opacity-30"
            >
              <ChevronLeft className="size-4" />
            </motion.button>
          )}
          <motion.button
            type="button"
            onClick={onToggle}
            aria-label={playing ? 'থামাও' : 'চালাও'}
            whileTap={{ scale: 0.92 }}
            className="inline-flex size-10 items-center justify-center rounded-full bg-zinc-900 text-white shadow-sm transition hover:bg-zinc-700"
          >
            {playing ? (
              <Pause className="size-4" />
            ) : (
              <Play className="size-4 translate-x-[1px]" />
            )}
          </motion.button>
          {onNext && (
            <motion.button
              type="button"
              onClick={onNext}
              disabled={step >= total}
              aria-label="পরের ধাপ"
              whileTap={{ scale: 0.92 }}
              className="inline-flex size-9 items-center justify-center rounded-full border border-zinc-200 text-zinc-500 transition hover:bg-zinc-100 active:scale-95 disabled:pointer-events-none disabled:opacity-30"
            >
              <ChevronRight className="size-4" />
            </motion.button>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-3 px-3 pb-1 pt-3 lg:flex-row lg:items-stretch">
        <ol className="min-w-0 flex-1 overflow-x-auto">{lines}</ol>
        <aside className="mx-2 shrink-0 rounded-xl border border-zinc-200 bg-zinc-50/80 p-4 lg:mx-0 lg:mr-2 lg:flex lg:w-72 lg:flex-col xl:w-80">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
              ব্যাখ্যা
            </span>
            <span className="font-mono text-[11px] tabular-nums text-zinc-400">
              {step} / {total}
            </span>
          </div>
          <div className="mt-2 text-sm leading-relaxed text-zinc-700">
            <AnimatePresence mode="wait">
              <motion.span
                key={step}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18 }}
                className="block"
              >
                {caption}
              </motion.span>
            </AnimatePresence>
          </div>
        </aside>
      </div>
      {viz && <div className={`px-5 pt-1 ${hideConsole ? 'pb-5' : 'pb-2'}`}>{viz}</div>}
      {!hideConsole && (
        <div className="px-5 pb-5 pt-2">
          <Console lines={consoleLines} />
        </div>
      )}
    </div>
  );
}

/* ------------------------------ if / else ------------------------------ */

const IF_CODE = [
  'const marks = 75;',
  '',
  'if (marks >= 80) {',
  '  console.log("A+ গ্রেড");',
  '} else if (marks >= 60) {',
  '  console.log("A গ্রেড");',
  '} else {',
  '  console.log("আরও চেষ্টা করো");',
  '}',
];

// step: 0 idle · 1 pick · 2 q0 · 3 v0 · 4 q1 · 5 v1 · 6 body · 7 print
const IF_CURSOR = [-1, 0, 2, 2, 4, 4, -1, -1];
const IF_TOTAL = 7;

const IF_CAPTIONS: ReactNode[] = [
  <>
    প্লে চাপলে <C t="marks = 75" /> দিয়ে পুরো চেইনটা এক লাইন করে চলবে।
  </>,
  <>
    <C t="marks = 75" /> তৈরি হলো।
  </>,
  <>
    প্রথম শর্ত চেক হচ্ছে: <C t="75 >= 80" /> ?
  </>,
  <>
    <C t="false" />। তাই <C t='console.log("A+ গ্রেড")' /> বাদ।
  </>,
  <>
    পরের শর্ত চেক হচ্ছে: <C t="75 >= 60" /> ?
  </>,
  <>
    <C t="true" />। আর নিচে যাওয়া হবে না, এই block-টাই চলবে।
  </>,
  <>
    <C t='console.log("A গ্রেড")' /> চলছে। বাকি block গুলো বাদ পড়ল।
  </>,
  <>
    কনসোলে <C t="A গ্রেড" />। if / else চেইন শেষ।
  </>,
];

export function IfElseAnim() {
  const { step, playing, toggle, reset, next, prev, done } = useStepPlayer(IF_TOTAL);
  const cursor = IF_CURSOR[step];

  const bubbles: Record<number, { expr: string; res: boolean | null }> = {};
  if (step >= 2) bubbles[2] = { expr: '75 >= 80', res: step >= 3 ? false : null };
  if (step >= 4) bubbles[4] = { expr: '75 >= 60', res: step >= 5 ? true : null };

  return (
    <Stage
      title="if / else চেইন"
      step={step}
      total={IF_TOTAL}
      playing={playing}
      done={done}
      onToggle={toggle}
      onReset={reset}
      onNext={next}
      onPrev={prev}
      caption={IF_CAPTIONS[step]}
      consoleLines={step >= 7 ? ['A গ্রেড'] : []}
      lines={IF_CODE.map((code, i) => (
        <Line
          key={i}
          n={i + 1}
          code={code}
          cursorId="if-cursor"
          active={cursor === i}
          bubble={bubbles[i]}
          dim={(step >= 3 && i === 3) || (step >= 6 && (i === 6 || i === 7 || i === 8))}
          taken={step >= 6 && i === 5}
        />
      ))}
    />
  );
}

/* ------------------------------ switch ------------------------------ */

const SW_CODE = [
  'const day = 3;',
  'switch (day) {',
  '  case 1: console.log("শনিবার"); break;',
  '  case 3: console.log("সোমবার"); break;',
  '  default: console.log("অন্য দিন");',
  '}',
];

// step: 0 idle · 1 pick · 2 jump · 3 q0 · 4 v0 · 5 q1 · 6 v1 · 7 run · 8 print
const SW_CURSOR = [-1, 0, 1, 2, 2, 3, 3, -1, -1];
const SW_TOTAL = 8;

const SW_CAPTIONS: ReactNode[] = [
  <>
    প্লে চাপলে <C t="day = 3" /> কোন case-এ মেলে, একটা একটা করে দেখা যাবে।
  </>,
  <>
    <C t="day = 3" /> তৈরি হলো।
  </>,
  <>
    <C t="switch (3)" /> : মেলানো শুরু হলো।
  </>,
  <>
    প্রথম case চেক হচ্ছে: <C t="3 === 1" /> ?
  </>,
  <>
    <C t="false" />। <C t="case 1" /> বাদ, পরের case-এ যাও।
  </>,
  <>
    পরের case চেক হচ্ছে: <C t="3 === 3" /> ?
  </>,
  <>
    <C t="true" />। এই case-টাই চলবে।
  </>,
  <>
    <C t='console.log("সোমবার")' /> চলছে, তারপর <C t="break" /> থামিয়ে দেবে।
  </>,
  <>
    কনসোলে <C t="সোমবার" />। <C t="break" /> থাকায় <C t="default" /> আর চলেনি।
  </>,
];

export function SwitchAnim() {
  const { step, playing, toggle, reset, next, prev, done } = useStepPlayer(SW_TOTAL);
  const cursor = SW_CURSOR[step];

  const bubbles: Record<number, { expr: string; res: boolean | null }> = {};
  if (step >= 3) bubbles[2] = { expr: '3 === 1', res: step >= 4 ? false : null };
  if (step >= 5) bubbles[3] = { expr: '3 === 3', res: step >= 6 ? true : null };

  return (
    <Stage
      title="switch ম্যাচিং"
      step={step}
      total={SW_TOTAL}
      playing={playing}
      done={done}
      onToggle={toggle}
      onReset={reset}
      onNext={next}
      onPrev={prev}
      caption={SW_CAPTIONS[step]}
      consoleLines={step >= 8 ? ['সোমবার'] : []}
      lines={SW_CODE.map((code, i) => (
        <Line
          key={i}
          n={i + 1}
          code={code}
          cursorId="sw-cursor"
          active={cursor === i}
          bubble={bubbles[i]}
          dim={(step >= 4 && i === 2) || (step >= 7 && i === 4)}
          taken={step >= 7 && i === 3}
        />
      ))}
    />
  );
}
