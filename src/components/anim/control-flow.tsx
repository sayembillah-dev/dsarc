'use client';

import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import { Pause, Play, RotateCcw } from 'lucide-react';

const BASE_MS = 950;

/* ------------------------------ shared player ------------------------------ */

function useStepPlayer(total: number) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (!playing) return;
    if (step >= total) {
      setPlaying(false);
      return;
    }
    timer.current = window.setTimeout(() => {
      setStep((s) => Math.min(s + 1, total));
    }, BASE_MS);
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

  return { step, playing, toggle, reset, done: step >= total };
}

/* ------------------------------ shared pieces ------------------------------ */

function C({ t }: { t: string }) {
  return (
    <code className="rounded bg-zinc-200/70 px-1 py-0.5 font-mono text-[12px] text-zinc-800">
      {t}
    </code>
  );
}

function StatusChip({
  playing,
  done,
  started,
}: {
  playing: boolean;
  done: boolean;
  started: boolean;
}) {
  const { text, cls, pulse } = playing
    ? { text: 'চলছে', cls: 'bg-sky-100 text-sky-700', pulse: true }
    : done
      ? { text: 'শেষ', cls: 'bg-emerald-100 text-emerald-700', pulse: false }
      : started
        ? { text: 'থেমেছে', cls: 'bg-amber-100 text-amber-700', pulse: false }
        : { text: 'প্রস্তুত', cls: 'bg-zinc-100 text-zinc-500', pulse: false };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ${cls}`}
    >
      <span className={`size-1.5 rounded-full bg-current ${pulse ? 'animate-pulse' : ''}`} />
      {text}
    </span>
  );
}

function PlayControls({
  playing,
  done,
  onToggle,
  onReset,
}: {
  playing: boolean;
  done: boolean;
  onToggle: () => void;
  onReset: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      {done && (
        <button
          type="button"
          onClick={onReset}
          aria-label="আবার চালাও"
          className="inline-flex size-8 items-center justify-center rounded-full border border-zinc-300 text-zinc-500 transition hover:bg-zinc-100 active:scale-95"
        >
          <RotateCcw className="size-3.5" />
        </button>
      )}
      <button
        type="button"
        onClick={onToggle}
        aria-label={playing ? 'থামাও' : 'চালাও'}
        className="inline-flex size-9 items-center justify-center rounded-full bg-zinc-900 text-white shadow-sm transition hover:bg-zinc-700 active:scale-95"
      >
        {playing ? <Pause className="size-4" /> : <Play className="size-4 translate-x-[1px]" />}
      </button>
    </div>
  );
}

function Dots({ total, step }: { total: number; step: number }) {
  return (
    <span className="ml-auto inline-flex items-center gap-1.5">
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={`size-1.5 rounded-full transition-colors duration-300 ${
            i < step ? 'bg-zinc-800' : 'bg-zinc-300'
          }`}
        />
      ))}
    </span>
  );
}

function Stage({
  title,
  step,
  total,
  playing,
  done,
  onToggle,
  onReset,
  caption,
  children,
}: {
  title: string;
  step: number;
  total: number;
  playing: boolean;
  done: boolean;
  onToggle: () => void;
  onReset: () => void;
  caption: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="not-prose my-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-zinc-100 px-4 py-2.5">
        <div className="flex items-center gap-2.5">
          <span className="text-sm font-semibold text-zinc-800">{title}</span>
          <StatusChip playing={playing} done={done} started={step > 0} />
        </div>
        <PlayControls playing={playing} done={done} onToggle={onToggle} onReset={onReset} />
      </div>
      <div className="grid gap-4 p-4 lg:grid-cols-2">{children}</div>
      <div className="flex min-h-11 flex-wrap items-center gap-x-2 gap-y-1 border-t border-zinc-100 bg-zinc-50/70 px-4 py-2 text-[13px] text-zinc-700">
        {caption}
        <Dots total={total} step={step} />
      </div>
    </div>
  );
}

function CodePanel({ lines, active }: { lines: string[]; active: number }) {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50">
      <div className="border-b border-zinc-200 bg-zinc-100/70 px-3 py-1.5 text-[11px] font-medium uppercase tracking-wide text-zinc-500">
        কোড
      </div>
      <ol className="p-2 font-mono text-[13px] leading-6">
        {lines.map((ln, i) => (
          <li
            key={i}
            className={`flex gap-3 rounded-md px-2 transition-all duration-300 ${
              i === active
                ? 'translate-x-1 bg-sky-100/80 font-medium text-sky-950'
                : 'text-zinc-600'
            }`}
          >
            <span className="w-4 shrink-0 select-none text-right text-zinc-400">{i + 1}</span>
            <span className="whitespace-pre">{ln || ' '}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function VizPanel({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white">
      <div className="border-b border-zinc-100 px-3 py-1.5 text-[11px] font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </div>
      <div className="p-3">{children}</div>
    </div>
  );
}

function FlowArrow({ lit, label }: { lit: boolean; label?: string }) {
  return (
    <div className="flex items-center gap-2 py-0.5">
      <span className="ml-6 flex flex-col items-center">
        <span
          className={`block h-3.5 w-px transition-colors duration-300 ${
            lit ? 'bg-zinc-700' : 'bg-zinc-300'
          }`}
        />
        <span
          className={`block size-0 border-x-[5px] border-t-[6px] border-x-transparent transition-colors duration-300 ${
            lit ? 'border-t-zinc-700' : 'border-t-zinc-300'
          }`}
        />
      </span>
      {label ? (
        <span
          className={`rounded px-1.5 py-0.5 font-mono text-[10px] transition-colors duration-300 ${
            lit ? 'bg-rose-100 text-rose-700' : 'bg-zinc-100 text-zinc-400'
          }`}
        >
          {label}
        </span>
      ) : null}
    </div>
  );
}

function OutputBar({ printed, text }: { printed: boolean; text: string }) {
  return (
    <div
      className={`rounded-xl border p-3 transition-colors duration-300 ${
        printed ? 'border-emerald-300 bg-emerald-50' : 'border-dashed border-zinc-200 bg-zinc-50/50'
      }`}
    >
      <div className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">আউটপুট</div>
      {printed ? (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 font-mono text-sm font-semibold text-emerald-900"
        >
          {text}
        </motion.div>
      ) : (
        <div className="mt-1 font-mono text-sm text-zinc-400">...</div>
      )}
    </div>
  );
}

/* ------------------------------ branch pieces ------------------------------ */

type BranchStatus = 'upcoming' | 'checking' | 'rejected' | 'taken' | 'skipped';

function BranchTag({
  status,
  isElse,
  takenLabel,
}: {
  status: BranchStatus;
  isElse?: boolean;
  takenLabel?: string;
}) {
  if (status === 'checking')
    return (
      <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-medium text-sky-700">
        যাচাই চলছে
      </span>
    );
  if (status === 'rejected')
    return (
      <span className="rounded-full bg-rose-100 px-2 py-0.5 font-mono text-[10px] font-medium text-rose-700">
        false
      </span>
    );
  if (status === 'taken')
    return (
      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
        {takenLabel ?? (isElse ? 'চলবে' : 'true · চলবে')}
      </span>
    );
  if (status === 'skipped')
    return (
      <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] text-zinc-400">
        বাদ গেল
      </span>
    );
  return (
    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] text-zinc-400">অপেক্ষমাণ</span>
  );
}

function branchBox(status: BranchStatus): string {
  if (status === 'checking') return 'border-sky-300 bg-sky-50 shadow-[0_0_0_3px] shadow-sky-100';
  if (status === 'rejected') return 'border-rose-200 bg-rose-50/60';
  if (status === 'taken')
    return 'border-emerald-300 bg-emerald-50 shadow-[0_0_0_3px] shadow-emerald-100';
  if (status === 'skipped') return 'border-zinc-200 bg-zinc-50/50 opacity-50';
  return 'border-zinc-200 bg-zinc-50/50 opacity-60';
}

function BranchRow({
  condition,
  body,
  status,
  isElse,
}: {
  condition?: string;
  body: string;
  status: BranchStatus;
  isElse?: boolean;
}) {
  return (
    <motion.div
      animate={{ scale: status === 'checking' || status === 'taken' ? 1.02 : 1 }}
      transition={{ type: 'spring', stiffness: 320, damping: 22 }}
      className={`rounded-xl border p-3 transition-colors duration-300 ${branchBox(status)}`}
    >
      <div className="flex items-center justify-between gap-2">
        <code className="font-mono text-[13px] font-medium text-zinc-800">
          {isElse ? 'else' : condition}
        </code>
        <BranchTag status={status} isElse={isElse} />
      </div>
      <div
        className={`mt-1.5 rounded-lg px-2 py-1 font-mono text-xs transition-colors duration-300 ${
          status === 'taken'
            ? 'bg-emerald-100/80 font-semibold text-emerald-900'
            : 'bg-white/70 text-zinc-500'
        }`}
      >
        {body}
      </div>
    </motion.div>
  );
}

/* ------------------------------ if / else ------------------------------ */

const IF_LINES = [
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

const IF_TL = ['pick', 'q0', 'v0', 'q1', 'v1', 'body', 'print'] as const;
type IfEntry = (typeof IF_TL)[number];

const IF_CODE: Record<IfEntry, number> = {
  pick: 0,
  q0: 2,
  v0: 2,
  q1: 4,
  v1: 4,
  body: 5,
  print: 5,
};

function IfElseViz({ step }: { step: number }) {
  let picked = false;
  let bodyOn = false;
  let printed = false;
  const res: (boolean | null)[] = [null, null];
  const flash: boolean[] = [false, false];
  for (let k = 0; k < step; k++) {
    const e = IF_TL[k];
    if (e === 'pick') picked = true;
    else if (e === 'q0') flash[0] = true;
    else if (e === 'v0') {
      res[0] = false;
      flash[0] = false;
    } else if (e === 'q1') flash[1] = true;
    else if (e === 'v1') {
      res[1] = true;
      flash[1] = false;
    } else if (e === 'body') bodyOn = true;
    else if (e === 'print') printed = true;
  }

  const st0: BranchStatus = flash[0] ? 'checking' : res[0] === false ? 'rejected' : 'upcoming';
  const st1: BranchStatus = flash[1]
    ? 'checking'
    : res[1] === true
      ? 'taken'
      : res[1] === false
        ? 'rejected'
        : 'upcoming';
  const stE: BranchStatus = bodyOn
    ? res[0] === true || res[1] === true
      ? 'skipped'
      : 'taken'
    : 'upcoming';

  return (
    <div className="flex flex-col">
      <motion.div
        animate={{ scale: picked ? 1.03 : 1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 22 }}
        className={`w-fit rounded-lg px-3 py-1.5 font-mono text-xs transition-colors duration-300 ${
          picked ? 'bg-zinc-900 text-zinc-50 shadow' : 'bg-zinc-100 text-zinc-500'
        }`}
      >
        marks = 75
      </motion.div>
      <FlowArrow lit={picked} />
      <BranchRow condition="marks >= 80" body='console.log("A+ গ্রেড")' status={st0} />
      <FlowArrow lit={res[0] === false} label="false" />
      <BranchRow condition="marks >= 60" body='console.log("A গ্রেড")' status={st1} />
      <FlowArrow lit={res[1] === false} label="false" />
      <BranchRow isElse body='console.log("আরও চেষ্টা করো")' status={stE} />
      <FlowArrow lit={printed} />
      <OutputBar printed={printed} text="A গ্রেড" />
    </div>
  );
}

function IfCaption({ step }: { step: number }) {
  const e: IfEntry | null = step === 0 ? null : IF_TL[step - 1];
  if (e === null)
    return (
      <>
        প্লে চাপো: <C t="marks = 75" /> নিয়ে শর্তগুলো উপর থেকে নিচে চেক হবে।
      </>
    );
  if (e === 'pick')
    return (
      <>
        <C t="marks = 75" />, ভ্যারিয়েবলটা তৈরি হলো।
      </>
    );
  if (e === 'q0')
    return (
      <>
        প্রথম শর্ত যাচাই চলছে: <C t="75 >= 80" />
      </>
    );
  if (e === 'v0')
    return (
      <>
        <C t="75 >= 80 → false" />, তাই এই block বাদ। পরের শর্তে যাও।
      </>
    );
  if (e === 'q1')
    return (
      <>
        পরের শর্ত যাচাই চলছে: <C t="75 >= 60" />
      </>
    );
  if (e === 'v1')
    return (
      <>
        <C t="75 >= 60 → true" />, এই block-টাই চলবে।
      </>
    );
  if (e === 'body')
    return (
      <>
        <C t='console.log("A গ্রেড")' /> চলছে।
      </>
    );
  return (
    <>
      আউটপুটে <C t="A গ্রেড" /> ছাপা হলো। বাকি অংশ আর চলে না।
    </>
  );
}

export function IfElseAnim() {
  const total = IF_TL.length;
  const { step, playing, toggle, reset, done } = useStepPlayer(total);
  return (
    <Stage
      title="if / else ফ্লো"
      step={step}
      total={total}
      playing={playing}
      done={done}
      onToggle={toggle}
      onReset={reset}
      caption={<IfCaption step={step} />}
    >
      <CodePanel lines={IF_LINES} active={step === 0 ? -1 : IF_CODE[IF_TL[step - 1]]} />
      <VizPanel label="ফ্লোচার্ট">
        <IfElseViz step={step} />
      </VizPanel>
    </Stage>
  );
}

/* ------------------------------ switch ------------------------------ */

const SW_LINES = [
  'const day = 3;',
  'switch (day) {',
  '  case 1: console.log("শনিবার"); break;',
  '  case 3: console.log("সোমবার"); break;',
  '  default: console.log("অন্য দিন");',
  '}',
];

const SW_TL = ['pick', 'jump', 'q0', 'v0', 'q1', 'v1', 'run', 'print'] as const;
type SwEntry = (typeof SW_TL)[number];

const SW_CODE: Record<SwEntry, number> = {
  pick: 0,
  jump: 1,
  q0: 2,
  v0: 2,
  q1: 3,
  v1: 3,
  run: 3,
  print: 3,
};

function Station({
  head,
  compare,
  body,
  status,
  showBreak,
}: {
  head: string;
  compare?: string;
  body: string;
  status: BranchStatus;
  showBreak?: boolean;
}) {
  return (
    <motion.div
      animate={{ scale: status === 'checking' || status === 'taken' ? 1.04 : 1 }}
      transition={{ type: 'spring', stiffness: 320, damping: 22 }}
      className={`rounded-xl border p-2.5 transition-colors duration-300 ${branchBox(status)}`}
    >
      <div className="flex items-center justify-between gap-1">
        <code className="font-mono text-xs font-semibold text-zinc-800">{head}</code>
        <BranchTag status={status} takenLabel="মিললো · চলবে" />
      </div>
      {compare ? (
        <div className="mt-1 font-mono text-[11px] text-zinc-500">{compare}</div>
      ) : (
        <div className="mt-1 text-[11px] text-zinc-400">কোনোটাই না মিললে</div>
      )}
      <div
        className={`mt-1.5 rounded-lg px-2 py-1 font-mono text-[11px] transition-colors duration-300 ${
          status === 'taken'
            ? 'bg-emerald-100/80 font-semibold text-emerald-900'
            : 'bg-white/70 text-zinc-500'
        }`}
      >
        {body}
      </div>
      {showBreak && status === 'taken' && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1.5 inline-flex items-center gap-1 rounded bg-emerald-100 px-1.5 py-0.5 font-mono text-[10px] text-emerald-800"
        >
          break, থামো
        </motion.div>
      )}
    </motion.div>
  );
}

function SwitchViz({ step }: { step: number }) {
  let picked = false;
  let jumped = false;
  let runBody = false;
  let printed = false;
  const res: (boolean | null)[] = [null, null];
  const flash: boolean[] = [false, false];
  for (let k = 0; k < step; k++) {
    const e = SW_TL[k];
    if (e === 'pick') picked = true;
    else if (e === 'jump') jumped = true;
    else if (e === 'q0') flash[0] = true;
    else if (e === 'v0') {
      res[0] = false;
      flash[0] = false;
    } else if (e === 'q1') flash[1] = true;
    else if (e === 'v1') {
      res[1] = true;
      flash[1] = false;
    } else if (e === 'run') runBody = true;
    else if (e === 'print') printed = true;
  }

  const st0: BranchStatus = flash[0] ? 'checking' : res[0] === false ? 'rejected' : 'upcoming';
  const st1: BranchStatus = flash[1]
    ? 'checking'
    : res[1] === true
      ? 'taken'
      : res[1] === false
        ? 'rejected'
        : 'upcoming';
  const matched = res[0] === true || res[1] === true;
  const stD: BranchStatus = runBody || printed ? (matched ? 'skipped' : 'taken') : 'upcoming';

  return (
    <div className="flex flex-col">
      <motion.div
        animate={{ scale: picked ? 1.03 : 1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 22 }}
        className={`w-fit rounded-lg px-3 py-1.5 font-mono text-xs transition-colors duration-300 ${
          picked ? 'bg-zinc-900 text-zinc-50 shadow' : 'bg-zinc-100 text-zinc-500'
        }`}
      >
        day = 3
      </motion.div>
      <FlowArrow lit={picked} />
      <motion.div
        key={jumped ? 'value' : 'expr'}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className={`w-fit rounded-lg border px-3 py-1.5 font-mono text-xs transition-colors duration-300 ${
          jumped
            ? 'border-sky-300 bg-sky-50 text-sky-900 shadow-[0_0_0_3px] shadow-sky-100'
            : 'border-zinc-200 bg-zinc-50/60 text-zinc-500'
        }`}
      >
        {jumped ? 'switch (3)' : 'switch (day)'}
      </motion.div>
      <FlowArrow lit={jumped} />
      <div className="grid grid-cols-3 gap-2">
        <Station head="case 1" compare="3 === 1" body='console.log("শনিবার")' status={st0} />
        <Station
          head="case 3"
          compare="3 === 3"
          body='console.log("সোমবার")'
          status={st1}
          showBreak={runBody || printed}
        />
        <Station head="default" body='console.log("অন্য দিন")' status={stD} />
      </div>
      <FlowArrow lit={printed} />
      <OutputBar printed={printed} text="সোমবার" />
    </div>
  );
}

function SwCaption({ step }: { step: number }) {
  const e: SwEntry | null = step === 0 ? null : SW_TL[step - 1];
  if (e === null)
    return (
      <>
        প্লে চাপো: <C t="day = 3" /> কোন case-এ মেলে, একে একে দেখো।
      </>
    );
  if (e === 'pick')
    return (
      <>
        <C t="day = 3" />, ভ্যারিয়েবলটা তৈরি হলো।
      </>
    );
  if (e === 'jump')
    return (
      <>
        <C t="switch (3)" /> : এবার case-গুলোর সাথে মেলানো হবে।
      </>
    );
  if (e === 'q0')
    return (
      <>
        প্রথম case যাচাই চলছে: <C t="3 === 1" />
      </>
    );
  if (e === 'v0')
    return (
      <>
        <C t="3 === 1 → false" />, মেলেনি। পরের case-এ যাও।
      </>
    );
  if (e === 'q1')
    return (
      <>
        পরের case যাচাই চলছে: <C t="3 === 3" />
      </>
    );
  if (e === 'v1')
    return (
      <>
        <C t="3 === 3 → true" />, মিলে গেছে!
      </>
    );
  if (e === 'run')
    return (
      <>
        <C t='console.log("সোমবার")' /> চলছে, তারপর <C t="break" /> এ থামবে।
      </>
    );
  return (
    <>
      আউটপুটে <C t="সোমবার" /> ছাপা হলো। <C t="break" /> থাকায় বাকি case আর চলে না।
    </>
  );
}

export function SwitchAnim() {
  const total = SW_TL.length;
  const { step, playing, toggle, reset, done } = useStepPlayer(total);
  return (
    <Stage
      title="switch ম্যাচিং"
      step={step}
      total={total}
      playing={playing}
      done={done}
      onToggle={toggle}
      onReset={reset}
      caption={<SwCaption step={step} />}
    >
      <CodePanel lines={SW_LINES} active={step === 0 ? -1 : SW_CODE[SW_TL[step - 1]]} />
      <VizPanel label="case মেলানো">
        <SwitchViz step={step} />
      </VizPanel>
    </Stage>
  );
}
