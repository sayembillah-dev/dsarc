'use client';

import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { C, Line, Stage, useStepPlayer } from './control-flow';

/* ================================================================== */
/*  shared atoms                                                       */
/* ================================================================== */

type Tone = 'default' | 'fresh' | 'leaving' | 'peek' | 'scan';

const TONES: Record<Tone, string> = {
  default: 'border-zinc-300 bg-white text-zinc-800',
  fresh: 'border-emerald-400 bg-emerald-50 text-emerald-700',
  leaving: 'border-rose-400 bg-rose-50 text-rose-600',
  peek: 'border-sky-400 bg-sky-50 text-sky-700',
  scan: 'border-amber-400 bg-amber-50 text-amber-700',
};

const I1 = '  ';
const I2 = I1 + I1;
const I3 = I1 + I2;

const SPRING = { type: 'spring', stiffness: 400, damping: 30 } as const;

function PtrChip({
  id,
  t,
  tone,
}: {
  id: string;
  t: string;
  tone: 'front' | 'back' | 'best' | 'i' | 'top';
}) {
  const cls =
    tone === 'front'
      ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
      : tone === 'back'
        ? 'border-zinc-700 bg-zinc-800 text-white'
        : tone === 'best'
          ? 'border-amber-300 bg-amber-50 text-amber-700'
          : tone === 'i'
            ? 'border-sky-300 bg-sky-50 text-sky-700'
            : 'border-zinc-300 bg-white text-zinc-500';
  return (
    <motion.span
      layoutId={id}
      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
      className={`select-none whitespace-nowrap rounded-full border px-2 py-px font-mono text-[10px] font-medium ${cls}`}
    >
      {t}
    </motion.span>
  );
}

function OpChip({ t, on }: { t: string; on: boolean }) {
  return (
    <span
      className={`inline-flex h-6 items-center rounded-full border px-2.5 font-mono text-[11px] font-medium transition-colors duration-500 ${
        on ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-zinc-200 text-zinc-400'
      }`}
    >
      {t}
    </span>
  );
}

type Item = { key: string; label: ReactNode; tone?: Tone };

/* vertical stack: items[0] = bottom, last = top. top chip glides */
function StackCol({
  items,
  prefix,
  topMark = 'top',
  height = 200,
  width = 56,
  emptyText = 'খালি stack',
}: {
  items: Item[];
  prefix: string;
  topMark?: string | null;
  height?: number;
  width?: number;
  emptyText?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-end" style={{ height }}>
      {items.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center rounded-lg border-2 border-dashed border-zinc-200 px-3 font-mono text-[11px] text-zinc-400"
          style={{ width: width + 46, height: 34 }}
        >
          {emptyText}
        </motion.div>
      )}
      <div className="flex flex-col-reverse">
        <AnimatePresence mode="popLayout">
          {items.map((it, i) => (
            <motion.div
              key={it.key}
              layout
              initial={{ opacity: 0, y: -22, scale: 0.85 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.8 }}
              transition={SPRING}
              className="mt-1.5 flex items-center gap-2"
            >
              <div
                className={`flex items-center justify-center rounded-lg border-2 font-mono text-sm font-semibold transition-colors duration-300 ${TONES[it.tone ?? 'default']}`}
                style={{ width, height: 34 }}
              >
                {it.label}
              </div>
              <span className="flex h-5 w-12 items-center">
                {topMark && i === items.length - 1 && (
                  <PtrChip id={`${prefix}-top`} t={topMark} tone="top" />
                )}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* horizontal lane with numbered slots, ghost cells, gliding pointer chips */
type LaneSlot = { idx: number; cell: Item | null; ghost?: string };

function Lane({
  slots,
  marks,
  cellW = 44,
}: {
  slots: LaneSlot[];
  marks: { idx: number; chip: ReactNode }[];
  cellW?: number;
}) {
  return (
    <div className="overflow-x-auto">
      <div className="mx-auto flex w-fit items-start gap-2">
        {slots.map((s) => (
          <div key={s.idx} className="flex flex-col items-center">
            <div
              className={`relative flex items-center justify-center rounded-lg ${
                s.cell ? '' : 'border-2 border-dashed border-zinc-200'
              }`}
              style={{ width: cellW, height: cellW }}
            >
              <AnimatePresence mode="popLayout">
                {s.cell && (
                  <motion.div
                    key={s.cell.key}
                    initial={{ opacity: 0, x: 26, scale: 0.8 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -26, scale: 0.8 }}
                    transition={SPRING}
                    className={`flex items-center justify-center rounded-lg border-2 font-mono text-sm font-semibold ${TONES[s.cell.tone ?? 'default']}`}
                    style={{ width: cellW, height: cellW }}
                  >
                    {s.cell.label}
                  </motion.div>
                )}
              </AnimatePresence>
              {!s.cell && s.ghost !== undefined && (
                <motion.span
                  initial={{ opacity: 0.7 }}
                  animate={{ opacity: 0.35 }}
                  className="font-mono text-sm text-zinc-400 line-through"
                >
                  {s.ghost}
                </motion.span>
              )}
            </div>
            <span className="mt-1 h-3.5 select-none font-mono text-[10px] leading-[14px] text-zinc-400">
              {s.idx}
            </span>
            <div className="mt-1 flex h-12 flex-col items-center justify-start gap-1">
              {marks
                .filter((m) => m.idx === s.idx)
                .map((m, i) => (
                  <span key={i} className="flex">
                    {m.chip}
                  </span>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

type CellDef = { v: string; tone?: Tone; gone?: boolean };

function toSlots(idxs: number[], cells: Record<number, CellDef>): LaneSlot[] {
  return idxs.map((idx) => {
    const c = cells[idx];
    if (!c) return { idx, cell: null };
    if (c.gone) return { idx, cell: null, ghost: c.v };
    return { idx, cell: { key: `c${idx}:${c.v}`, label: c.v, tone: c.tone } };
  });
}

/* simple horizontal queue for the vs page: in from right, out to left */
function MiniQ({ items, emptyText = 'খালি' }: { items: Item[]; emptyText?: string }) {
  return (
    <div className="flex h-11 items-center gap-1.5">
      <AnimatePresence mode="popLayout">
        {items.map((it) => (
          <motion.div
            key={it.key}
            layout
            initial={{ opacity: 0, x: 24, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -24, scale: 0.8 }}
            transition={SPRING}
            className={`flex h-10 w-10 items-center justify-center rounded-lg border-2 font-mono text-sm font-semibold ${TONES[it.tone ?? 'default']}`}
          >
            {it.label}
          </motion.div>
        ))}
      </AnimatePresence>
      {items.length === 0 && (
        <span className="font-mono text-[11px] text-zinc-400">{emptyText}</span>
      )}
    </div>
  );
}

function OutRow({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="flex h-8 items-center gap-1.5">
      <span className="font-mono text-[11px] text-zinc-400">{label}</span>
      <AnimatePresence mode="popLayout">
        {items.map((v, i) => (
          <motion.span
            key={`${i}-${v}`}
            initial={{ opacity: 0, scale: 0.5, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={SPRING}
            className="flex h-7 min-w-7 items-center justify-center rounded-md border border-emerald-300 bg-emerald-50 px-1 font-mono text-xs font-semibold text-emerald-700"
          >
            {v}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ================================================================== */
/*  1. stack-lifo: push / pop / peek walkthrough                       */
/* ================================================================== */

const SO_CODE = [
  'const s = new Stack();',
  's.push(10);',
  's.push(20);',
  's.push(30);',
  'console.log(s.peek());',
  'console.log(s.pop());',
  'console.log(s.pop());',
  'console.log(s.size());',
];

const SO_CURSOR = [-1, 0, 1, 2, 3, 4, 5, 6, 7];
const SO_TOTAL = 8;

const SO_CAPTIONS: ReactNode[] = [
  <>
    প্লে চাপলে <C t="Stack" /> class-টা লাইভ চলবে। খেয়াল করো, প্রতি অপারেশনে শুধু top নড়ে,
    বাকিরা জায়গায়ই থাকে।
  </>,
  <>
    <C t="new Stack()" /> তৈরি হলো, ভেতরে খালি array। top বলতে এখন কিছুই নেই।
  </>,
  <>
    <C t="push(10)" />: 10 বসল top-এ। কাউকে সরাতে হয়নি, তাই <C t="O(1)" />।
  </>,
  <>
    <C t="push(20)" />: এবার 20 top, 10 চেপে রইল তলায়।
  </>,
  <>
    <C t="push(30)" />: স্তূপ তিন তলা, top এখন 30।
  </>,
  <>
    <C t="peek()" /> শুধু দেখে নিল: top-এ 30। কিছু বের হলো না, তবু কনসোলে 30।
  </>,
  <>
    <C t="pop()" />: শেষে ঢুকা 30-ই আগে বের হলো। এই-ই LIFO।
  </>,
  <>
    আরেক <C t="pop()" />: এবার 20 বের হলো, রইল শুধু 10।
  </>,
  <>
    <C t="size()" /> বলছে 1। পুরো খেলা এক প্রান্তে, কেউ কোথাও সরেনি।
  </>,
];

function soStack(step: number): Item[] {
  const items: Item[] = [];
  if (step >= 2) items.push({ key: 'a', label: '10' });
  if (step >= 3) items.push({ key: 'b', label: '20', tone: step === 3 ? 'fresh' : 'default' });
  if (step >= 4 && step < 6)
    items.push({
      key: 'c',
      label: '30',
      tone: step === 4 ? 'fresh' : step === 5 ? 'peek' : 'default',
    });
  if (step >= 6 && step < 7) items[1] = { key: 'b', label: '20' };
  if (step >= 7) items.pop();
  if (step === 2) items[0] = { key: 'a', label: '10', tone: 'fresh' };
  return items;
}

export function StackOpsAnim() {
  const { step, playing, toggle, reset, next, prev, done } = useStepPlayer(SO_TOTAL);
  const cursor = SO_CURSOR[step];
  const consoleLines =
    step >= 8
      ? ['30', '30', '20', '1']
      : step >= 7
        ? ['30', '30', '20']
        : step >= 6
          ? ['30', '30']
          : step >= 5
            ? ['30']
            : [];

  return (
    <Stage
      title="Stack লাইভ: push / pop / peek"
      step={step}
      total={SO_TOTAL}
      playing={playing}
      done={done}
      onToggle={toggle}
      onReset={reset}
      onNext={next}
      onPrev={prev}
      caption={SO_CAPTIONS[step]}
      consoleLines={consoleLines}
      viz={<StackCol items={soStack(step)} prefix="so" height={190} />}
      lines={SO_CODE.map((code, i) => (
        <Line
          key={i}
          n={i + 1}
          code={code}
          cursorId="so-cursor"
          active={cursor === i}
          tag={i >= 1 ? <OpChip t="O(1)" on={step > i} /> : undefined}
        />
      ))}
    />
  );
}

/* ================================================================== */
/*  2. queue-fifo: two-pointer queue, nobody moves                     */
/* ================================================================== */

const QO_CODE = [
  'const q = new Queue();',
  'q.enqueue("A");',
  'q.enqueue("B");',
  'q.enqueue("C");',
  'console.log(q.dequeue());',
  'console.log(q.dequeue());',
  'console.log(q.peek());',
  'console.log(q.size());',
];

const QO_CURSOR = [-1, 0, 1, 2, 3, 4, 5, 6, 7];
const QO_TOTAL = 8;
const QO_IDXS = [0, 1, 2, 3];

const QO_CAPTIONS: ReactNode[] = [
  <>
    প্লে চাপলে দুই pointer-এর <C t="Queue" /> চলবে। dequeue-তে কেউ সরে না, শুধু{' '}
    <C t="front" /> এগিয়ে যায়, সেটাই দেখার বিষয়।
  </>,
  <>
    <C t="new Queue()" />: <C t="front" /> আর <C t="back" /> দুটোই 0-এ, লাইন খালি।
  </>,
  <>
    <C t='enqueue("A")' />: A দাঁড়াল 0 নম্বর ঘরে, <C t="back" /> সরে 1-এ।
  </>,
  <>
    <C t='enqueue("B")' />: B দাঁড়াল 1 নম্বরে, <C t="back" /> এখন 2-এ।
  </>,
  <>
    <C t='enqueue("C")' />: C দাঁড়াল 2 নম্বরে, <C t="back" /> 3-এ। তিনজন ঢুকল, সরানো শূন্য।
  </>,
  <>
    <C t="dequeue()" />: front-এর A বের হলো, 0 নম্বর ঘর <C t="delete" />। B আর C এক চুলও নড়ল
    না, <C t="front" /> শুধু 1 হলো। এই যে কেউ সরে না, এজন্যই <C t="O(1)" />।
  </>,
  <>
    আরেক <C t="dequeue()" />: B বের হলো, <C t="front" /> এখন 2-এ, C-র পালা।
  </>,
  <>
    <C t="peek()" />: front-এ C বসে আছে, শুধু দেখা হলো, বের হয়নি।
  </>,
  <>
    <C t="size()" /> = <C t="back - front" /> = 3 - 2 = 1। পুরো সময়ে একটাও সরানো লাগেনি।
  </>,
];

function qoState(step: number) {
  const cells: Record<number, CellDef> = {};
  let front = 0;
  let back = 0;
  if (step >= 2) {
    cells[0] = { v: 'A', tone: step === 2 ? 'fresh' : 'default' };
    back = 1;
  }
  if (step >= 3) {
    cells[1] = { v: 'B', tone: step === 3 ? 'fresh' : 'default' };
    back = 2;
  }
  if (step >= 4) {
    cells[2] = { v: 'C', tone: step === 4 ? 'fresh' : 'default' };
    back = 3;
  }
  if (step >= 5) {
    cells[0].gone = true;
    front = 1;
  }
  if (step >= 6) {
    cells[1].gone = true;
    front = 2;
  }
  if (step === 7) cells[2].tone = 'peek';
  return { cells, front, back };
}

export function QueueOpsAnim() {
  const { step, playing, toggle, reset, next, prev, done } = useStepPlayer(QO_TOTAL);
  const cursor = QO_CURSOR[step];
  const { cells, front, back } = qoState(step);
  const consoleLines =
    step >= 8
      ? ['A', 'B', 'C', '1']
      : step >= 7
        ? ['A', 'B', 'C']
        : step >= 6
          ? ['A', 'B']
          : step >= 5
            ? ['A']
            : [];

  return (
    <Stage
      title="Queue লাইভ: দুই pointer, শূন্য সরানো"
      step={step}
      total={QO_TOTAL}
      playing={playing}
      done={done}
      onToggle={toggle}
      onReset={reset}
      onNext={next}
      onPrev={prev}
      caption={QO_CAPTIONS[step]}
      consoleLines={consoleLines}
      viz={
        <Lane
          slots={toSlots(QO_IDXS, cells)}
          marks={[
            { idx: front, chip: <PtrChip id="qo-f" t={`front ${front}`} tone="front" /> },
            { idx: back, chip: <PtrChip id="qo-b" t={`back ${back}`} tone="back" /> },
          ]}
        />
      }
      lines={QO_CODE.map((code, i) => (
        <Line
          key={i}
          n={i + 1}
          code={code}
          cursorId="qo-cursor"
          active={cursor === i}
          tag={i >= 1 ? <OpChip t="O(1)" on={step > i} /> : undefined}
        />
      ))}
    />
  );
}

/* ================================================================== */
/*  3. stack-vs-queue: same input, two fates                           */
/* ================================================================== */

const SV_CODE = [
  'const stack = [];',
  'const queue = [];',
  'stack.push(1); queue.push(1);',
  'stack.push(2); queue.push(2);',
  'stack.push(3); queue.push(3);',
  'const fromStack = [];',
  'const fromQueue = [];',
  'fromStack.push(stack.pop());',
  'fromStack.push(stack.pop());',
  'fromStack.push(stack.pop());',
  'fromQueue.push(queue.shift());',
  'fromQueue.push(queue.shift());',
  'fromQueue.push(queue.shift());',
  'console.log(fromStack);',
  'console.log(fromQueue);',
];

const SV_CURSOR = [-1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
const SV_TOTAL = 15;

const SV_CAPTIONS: ReactNode[] = [
  <>
    প্লে চাপলে একই input <C t="1, 2, 3" /> দুই কাঠামোয় ঢুকবে, তারপর দুটোই শেষ পর্যন্ত বের
    হবে। আউটপুটের দিকে তাকাও।
  </>,
  <>
    খালি <C t="stack" /> তৈরি।
  </>,
  <>
    খালি <C t="queue" /> তৈরি।
  </>,
  <>
    1 ঢুকল: stack-এ উপরে, queue-তে পেছনে।
  </>,
  <>
    2 ঢুকল দুই জায়গায়।
  </>,
  <>
    3 ঢুকল। দুটোর ভেতরেই এখন <C t="[1, 2, 3]" />, এখনও কোনো পার্থক্য নেই।
  </>,
  <>
    বের হওয়ার ফল জমাতে <C t="fromStack" /> খালি array।
  </>,
  <>
    <C t="fromQueue" />-ও প্রস্তুত।
  </>,
  <>
    <C t="stack.pop()" />: শেষে ঢুকা 3-ই আগে বের হলো।
  </>,
  <>
    এবার 2।
  </>,
  <>
    শেষে 1। stack ক্রমটা উল্টে দিল: <C t="fromStack = [3, 2, 1]" />।
  </>,
  <>
    <C t="queue.shift()" />: আগে ঢুকা 1-ই আগে বের হলো। (demo-র খাতিরে <C t="shift()" />,
    বাস্তবে pointer version, মনে আছে তো?)
  </>,
  <>
    এবার 2।
  </>,
  <>
    শেষে 3। queue ক্রম অক্ষত রাখল: <C t="fromQueue = [1, 2, 3]" />।
  </>,
  <>
    কনসোলে fromStack: <C t="[ 3, 2, 1 ]" />, হুবহু উল্টো।
  </>,
  <>
    আর fromQueue: <C t="[ 1, 2, 3 ]" />, ঠিক যেমন ঢুকেছিল। পার্থক্য সংরক্ষণে না, বের হওয়ার
    দরজায়।
  </>,
];

function svState(step: number) {
  const st: Item[] = [];
  const q: Item[] = [];
  const pushBoth = (v: string, at: number) => {
    if (step < at) return;
    const tone = step === at ? 'fresh' : 'default';
    st.push({ key: `s${v}`, label: v, tone });
    q.push({ key: `q${v}`, label: v, tone });
  };
  pushBoth('1', 3);
  pushBoth('2', 4);
  pushBoth('3', 5);
  if (step >= 8) st.pop();
  if (step >= 9) st.pop();
  if (step >= 10) st.pop();
  if (step >= 11) q.shift();
  if (step >= 12) q.shift();
  if (step >= 13) q.shift();
  const fs = step >= 8 ? ['3', '2', '1'].slice(0, step - 7) : [];
  const fq = step >= 11 ? ['1', '2', '3'].slice(0, step - 10) : [];
  return { st, q, fs, fq };
}

const SV_BUBBLES: Record<number, { line: number; expr: string }> = {
  8: { line: 7, expr: 'pop() = 3' },
  9: { line: 8, expr: 'pop() = 2' },
  10: { line: 9, expr: 'pop() = 1' },
  11: { line: 10, expr: 'shift() = 1' },
  12: { line: 11, expr: 'shift() = 2' },
  13: { line: 12, expr: 'shift() = 3' },
};

export function StackVsQueueAnim() {
  const { step, playing, toggle, reset, next, prev, done } = useStepPlayer(SV_TOTAL);
  const cursor = SV_CURSOR[step];
  const { st, q, fs, fq } = svState(step);
  const bub = SV_BUBBLES[step];
  const consoleLines =
    step >= 15
      ? ['[ 3, 2, 1 ]', '[ 1, 2, 3 ]']
      : step >= 14
        ? ['[ 3, 2, 1 ]']
        : [];

  return (
    <Stage
      title="একই input, দুই জগৎ"
      step={step}
      total={SV_TOTAL}
      playing={playing}
      done={done}
      onToggle={toggle}
      onReset={reset}
      onNext={next}
      onPrev={prev}
      caption={SV_CAPTIONS[step]}
      consoleLines={consoleLines}
      viz={
        <div className="overflow-x-auto">
          <div className="grid min-w-[440px] grid-cols-2 gap-5">
            <div>
              <div className="mb-1 text-center font-mono text-[11px] text-zinc-500">
                stack · LIFO
              </div>
              <StackCol items={st} prefix="svs" height={152} width={44} topMark="top" />
              <OutRow label="fromStack" items={fs} />
            </div>
            <div>
              <div className="mb-1 flex font-mono text-[11px] text-zinc-500">
                <span>front · বের হয়</span>
                <span className="ml-auto">back · ঢোকে</span>
              </div>
              <div className="flex h-[152px] items-center justify-center rounded-xl border border-zinc-100 bg-zinc-50/60 px-3">
                <MiniQ items={q} />
              </div>
              <OutRow label="fromQueue" items={fq} />
            </div>
          </div>
        </div>
      }
      lines={SV_CODE.map((code, i) => (
        <Line
          key={i}
          n={i + 1}
          code={code}
          cursorId="sv-cursor"
          active={cursor === i}
          bubble={bub && bub.line === i ? { expr: bub.expr, res: null } : undefined}
        />
      ))}
    />
  );
}

/* ================================================================== */
/*  4. stack-vs-queue: two stacks make a queue                         */
/* ================================================================== */

const TS_CODE = [
  'const q = new QueueWithStacks();',
  'q.enqueue(1);',
  'q.enqueue(2);',
  'q.enqueue(3);',
  'console.log(q.dequeue());',
  'q.enqueue(4);',
  'console.log(q.dequeue());',
  'console.log(q.dequeue());',
];

const TS_CURSOR = [-1, 0, 1, 2, 3, 4, 4, 5, 6, 7];
const TS_TOTAL = 9;

const TS_CAPTIONS: ReactNode[] = [
  <>
    প্লে চাপলে দুই stack দিয়ে বানানো queue চলবে। জাদুটা ঘটে <C t="dequeue()" />-এর ভেতরে,
    তাই ওই লাইনের দিকে তাকিয়ে থাকো।
  </>,
  <>
    <C t="QueueWithStacks" /> তৈরি: <C t="inbox" /> আর <C t="outbox" />, দুটোই খালি stack।
  </>,
  <>
    <C t="enqueue(1)" />: নতুনজন সোজা inbox-এ।
  </>,
  <>
    <C t="enqueue(2)" />: 1-এর উপরে 2।
  </>,
  <>
    <C t="enqueue(3)" />: inbox এখন <C t="[1, 2, 3]" />, top-এ 3।
  </>,
  <>
    <C t="dequeue()" />: outbox খালি দেখে সবাই উল্টে সরছে: 3, তারপর 2, তারপর 1। উল্টানোর ফলে
    outbox-এর top-এ এখন 1, সে-ই সবার আগে এসেছিল।
  </>,
  <>
    <C t="outbox.pop()" />: ফেরত 1। stack দুটো দিয়েই FIFO ঠিকঠাক!
  </>,
  <>
    <C t="enqueue(4)" />: 4 inbox-এ। outbox-এ আগেরজন বাকি, তাই 4-কে নিয়ে কেউ সরায়নি।
  </>,
  <>
    <C t="dequeue()" />: outbox-এ এখনও জিনিস আছে, তাই কোনো সরানো ছাড়াই top থেকে 2।
  </>,
  <>
    আরেক <C t="dequeue()" />: 3 বের হলো। পরের dequeue-এ outbox খালি, তখন 4 উল্টে আসবে। প্রতি
    উপাদান জীবনে সর্বোচ্চ একবার সরে, তাই amortized <C t="O(1)" />।
  </>,
];

type TsItem = { key: string; label: string; col: 0 | 1; lvl: number; delay?: number; tone?: Tone };

function tsState(step: number): TsItem[] {
  const items: TsItem[] = [];
  const put = (label: string, col: 0 | 1, lvl: number, delay = 0, tone?: Tone) =>
    items.push({ key: `t${label}`, label, col, lvl, delay, tone });
  if (step < 2) return items;
  if (step < 5) {
    put('1', 0, 0, 0, step === 2 ? 'fresh' : 'default');
    if (step >= 3) put('2', 0, 1, 0, step === 3 ? 'fresh' : 'default');
    if (step >= 4) put('3', 0, 2, 0, step === 4 ? 'fresh' : 'default');
    return items;
  }
  if (step === 5) {
    put('3', 1, 0, 0);
    put('2', 1, 1, 0.15);
    put('1', 1, 2, 0.3);
    return items;
  }
  if (step === 6 || step === 7) {
    put('3', 1, 0);
    put('2', 1, 1);
    if (step === 7) put('4', 0, 0, 0, 'fresh');
    return items;
  }
  if (step === 8) {
    put('3', 1, 0);
    put('4', 0, 0);
    return items;
  }
  put('4', 0, 0);
  return items;
}

function TwoStackViz({ items, pouring }: { items: TsItem[]; pouring: boolean }) {
  const COLX = [64, 216];
  const Y = (lvl: number) => 128 - lvl * 36;
  return (
    <div className="relative mx-auto h-[196px] w-[320px]">
      {[0, 1].map((c) => (
        <div key={c}>
          <div
            className="absolute rounded-xl border-2 border-dashed border-zinc-200"
            style={{ left: COLX[c] - 32, top: 12, width: 64, height: 152 }}
          />
          <span
            className="absolute select-none font-mono text-[10px] text-zinc-500"
            style={{ left: COLX[c] - 45, top: 172, width: 90, textAlign: 'center' }}
          >
            {c === 0 ? 'inbox · push' : 'outbox · pop'}
          </span>
        </div>
      ))}
      <AnimatePresence>
        {pouring && (
          <motion.svg
            key="pour"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute left-0 top-0"
            width={320}
            height={196}
            viewBox="0 0 320 196"
          >
            <motion.path
              d="M 100 32 C 140 8, 160 8, 200 32"
              fill="none"
              stroke="#10b981"
              strokeWidth="1.8"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
            <path d="M 194 24 L 202 33 L 192 36" fill="none" stroke="#10b981" strokeWidth="1.8" />
          </motion.svg>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {items.map((it) => (
          <motion.div
            key={it.key}
            initial={{ opacity: 0, x: COLX[it.col] - 28, y: Y(it.lvl) - 26 }}
            animate={{ opacity: 1, x: COLX[it.col] - 28, y: Y(it.lvl) }}
            exit={{ opacity: 0, y: -30, scale: 0.8 }}
            transition={{ ...SPRING, delay: it.delay ?? 0 }}
            className={`absolute flex h-[30px] w-14 items-center justify-center rounded-lg border-2 font-mono text-sm font-semibold ${TONES[it.tone ?? 'default']}`}
          >
            {it.label}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export function TwoStackQueueAnim() {
  const { step, playing, toggle, reset, next, prev, done } = useStepPlayer(TS_TOTAL);
  const cursor = TS_CURSOR[step];
  const consoleLines =
    step >= 9 ? ['1', '2', '3'] : step >= 8 ? ['1', '2'] : step >= 6 ? ['1'] : [];

  return (
    <Stage
      title="দুই stack দিয়ে queue"
      step={step}
      total={TS_TOTAL}
      playing={playing}
      done={done}
      onToggle={toggle}
      onReset={reset}
      onNext={next}
      onPrev={prev}
      caption={TS_CAPTIONS[step]}
      consoleLines={consoleLines}
      viz={<TwoStackViz items={tsState(step)} pouring={step === 5} />}
      lines={TS_CODE.map((code, i) => (
        <Line
          key={i}
          n={i + 1}
          code={code}
          cursorId="ts-cursor"
          active={cursor === i}
          running={i === 4 && (step === 5 || step === 6)}
        />
      ))}
    />
  );
}

/* ================================================================== */
/*  5. balanced-parentheses: pair matching live                        */
/* ================================================================== */

const BP_CODE = [
  'function isBalanced(str) {',
  I1 + 'const stack = [];',
  I1 + 'const pairs = { ")": "(", "]": "[", "}": "{" };',
  I1 + 'for (const ch of str) {',
  I2 + 'if (ch === "(" || ch === "[" || ch === "{") {',
  I3 + 'stack.push(ch);',
  I2 + '} else if (ch in pairs) {',
  I3 + 'if (stack.pop() !== pairs[ch]) return false;',
  I2 + '}',
  I1 + '}',
  I1 + 'return stack.length === 0;',
  '}',
  'isBalanced("({[]})");',
  'isBalanced("([)]");',
  'isBalanced("(((");',
  'isBalanced("(a + b) * [c]");',
];

type BpCharSt = 'pending' | 'waiting' | 'matched' | 'skipped' | 'bad';
type BpChar = { ch: string; st: BpCharSt };
type BpFrame = {
  kind: 'push' | 'match' | 'mismatch' | 'skip' | 'verdict';
  ci: number | null;
  ch?: string;
  top?: string | null;
  count?: number;
  chars: BpChar[];
  stack: string[];
  verdict?: boolean;
  failed?: boolean;
};

const BP_PAIRS: Record<string, string> = { ')': '(', ']': '[', '}': '{' };
const BP_OPEN = ['(', '[', '{'];

function bpSimulate(str: string): BpFrame[] {
  const chars: BpChar[] = [...str].map((ch) => ({ ch, st: 'pending' as BpCharSt }));
  const st: { ch: string; ci: number }[] = [];
  const frames: BpFrame[] = [];
  const snap = (f: Partial<BpFrame> & { kind: BpFrame['kind'] }) =>
    frames.push({
      ci: null,
      chars: chars.map((c) => ({ ...c })),
      stack: st.map((s) => s.ch),
      ...f,
    } as BpFrame);
  let failed = false;
  let i = 0;
  while (i < str.length) {
    const ch = str[i];
    if (BP_OPEN.includes(ch)) {
      st.push({ ch, ci: i });
      chars[i].st = 'waiting';
      snap({ kind: 'push', ci: i, ch });
      i++;
    } else if (ch in BP_PAIRS) {
      const top = st.pop();
      if (top && top.ch === BP_PAIRS[ch]) {
        chars[top.ci].st = 'matched';
        chars[i].st = 'matched';
        snap({ kind: 'match', ci: i, ch, top: top.ch });
        i++;
      } else {
        if (top) chars[top.ci].st = 'bad';
        chars[i].st = 'bad';
        snap({ kind: 'mismatch', ci: i, ch, top: top ? top.ch : null });
        failed = true;
        break;
      }
    } else {
      let j = i;
      while (j < str.length && !BP_OPEN.includes(str[j]) && !(str[j] in BP_PAIRS)) {
        chars[j].st = 'skipped';
        j++;
      }
      snap({ kind: 'skip', count: j - i });
      i = j;
    }
  }
  snap({ kind: 'verdict', verdict: !failed && st.length === 0, failed });
  return frames;
}

const BP_CASES = ['({[]})', '([)]', '(((', '(a + b) * [c]'];
const BP_DATA = BP_CASES.map(bpSimulate);
const BP_PLAN: { c: number; f: number }[] = [];
BP_DATA.forEach((fs, c) => fs.forEach((_, f) => BP_PLAN.push({ c, f })));
const BP_TOTAL = BP_PLAN.length;

const BP_CHAR_STYLES: Record<BpCharSt, string> = {
  pending: 'border-zinc-200 text-zinc-500',
  waiting: 'border-sky-300 bg-sky-50 text-sky-700',
  matched: 'border-emerald-300 bg-emerald-50 text-emerald-700',
  skipped: 'border-transparent text-zinc-300',
  bad: 'border-rose-400 bg-rose-50 text-rose-600',
};

const BP_IDLE_CHARS: BpChar[] = [...BP_CASES[0]].map((ch) => ({ ch, st: 'pending' as BpCharSt }));

function bpCaption(frame: BpFrame | null): ReactNode {
  if (!frame) {
    return (
      <>
        প্লে চাপলে <C t="isBalanced" /> চারটা string-এর উপর একে একে চলবে। খোলা বন্ধনী stack-এ
        জমে, বন্ধ এলে top-এর সঙ্গে জোড়া মেলে।
      </>
    );
  }
  switch (frame.kind) {
    case 'push':
      return (
        <>
          খোলা <C t={frame.ch!} /> এলো: stack-এ push, এখন সে অপেক্ষারত।
        </>
      );
    case 'match':
      return (
        <>
          বন্ধ <C t={frame.ch!} />: top-এ <C t={frame.top!} /> বসে আছে, জোড়া মিলে গেল, pop।
        </>
      );
    case 'mismatch':
      return frame.top ? (
        <>
          বন্ধ <C t={frame.ch!} /> চায় <C t={BP_PAIRS[frame.ch!]} />, কিন্তু top-এ{' '}
          <C t={frame.top} />। জোড়া মেলে না, এখানেই <C t="return false" />।
        </>
      ) : (
        <>
          বন্ধ <C t={frame.ch!} /> এলো, কিন্তু stack একদম খালি। মেলানোর কেউ নেই,{' '}
          <C t="return false" />।
        </>
      );
    case 'skip':
      return (
        <>
          {frame.count}টা অন্য character (অক্ষর, operator, space): loop ঘুরল, কিন্তু stack-কে
          কিছুই করতে হলো না।
        </>
      );
    case 'verdict':
      if (frame.failed) {
        return (
          <>
            একটা অমিলই যথেষ্ট: <C t="return false" />। বাকি string আর দেখার দরকার নেই, এটাই
            early exit।
          </>
        );
      }
      return frame.verdict ? (
        <>
          সব character দেখা শেষ, stack খালি: <C t="return true" />। balanced।
        </>
      ) : (
        <>
          বন্ধ সব মিলেছে ঠিকই, কিন্তু stack-এ খোলা রয়ে গেছে:{' '}
          <C t="stack.length === 0" /> false।
        </>
      );
  }
}

export function BalancedParenAnim() {
  const { step, playing, toggle, reset, next, prev, done } = useStepPlayer(BP_TOTAL);
  const cur = step === 0 ? null : BP_PLAN[step - 1];
  const frame = cur ? BP_DATA[cur.c][cur.f] : null;

  const consoleLines: string[] = [];
  for (let k = 0; k < step; k++) {
    const p = BP_PLAN[k];
    const fr = BP_DATA[p.c][p.f];
    if (fr.kind === 'verdict') consoleLines.push(String(fr.verdict));
  }

  const cursor = !frame
    ? -1
    : frame.kind === 'push'
      ? 5
      : frame.kind === 'skip'
        ? 3
        : frame.kind === 'verdict'
          ? frame.failed
            ? 7
            : 10
          : 7;

  const bubbles: Record<number, { expr: string; res: boolean | null }> = {};
  if (frame && (frame.kind === 'match' || frame.kind === 'mismatch')) {
    bubbles[7] = {
      expr: `${frame.ch} ↔ ${frame.top ?? 'খালি'}`,
      res: frame.kind === 'match',
    };
  }
  if (frame && frame.kind === 'verdict' && !frame.failed) {
    bubbles[10] = { expr: 'stack.length === 0', res: frame.verdict! };
  }

  const caseStr = cur ? BP_CASES[cur.c] : BP_CASES[0];
  const chars = frame ? frame.chars : BP_IDLE_CHARS;
  const stackItems: Item[] = (frame ? frame.stack : []).map((ch, i) => ({
    key: `bp${cur?.c ?? 0}-${i}-${ch}`,
    label: ch,
  }));

  return (
    <Stage
      title="জোড়া মেলানো লাইভ"
      step={step}
      total={BP_TOTAL}
      playing={playing}
      done={done}
      onToggle={toggle}
      onReset={reset}
      onNext={next}
      onPrev={prev}
      caption={bpCaption(frame)}
      consoleLines={consoleLines}
      viz={
        <div className="flex flex-wrap items-start gap-4">
          <div className="min-w-[230px] flex-1">
            <div className="mb-2 flex h-6 items-center gap-2">
              <code className="font-mono text-xs text-zinc-500">
                isBalanced(&quot;{caseStr}&quot;)
              </code>
              <AnimatePresence>
                {frame?.kind === 'verdict' && (
                  <motion.span
                    key={`v${cur!.c}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className={`rounded-full border px-2 py-px font-mono text-[10px] font-semibold ${
                      frame.verdict
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                        : 'border-rose-300 bg-rose-50 text-rose-600'
                    }`}
                  >
                    {frame.verdict ? 'true · balanced' : 'false'}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
            <div className="flex flex-wrap gap-1">
              {chars.map((c, i) => (
                <span
                  key={i}
                  className={`flex h-8 w-7 items-center justify-center rounded-md border font-mono text-sm transition-all duration-300 ${BP_CHAR_STYLES[c.st]} ${
                    frame?.ci === i ? 'ring-2 ring-sky-300' : ''
                  }`}
                >
                  {c.ch === ' ' ? '␣' : c.ch}
                </span>
              ))}
            </div>
          </div>
          <StackCol items={stackItems} prefix="bp" height={170} width={38} emptyText="খালি" />
        </div>
      }
      lines={BP_CODE.map((code, i) => (
        <Line
          key={i}
          n={i + 1}
          code={code}
          cursorId="bp-cursor"
          active={cursor === i}
          bubble={bubbles[i]}
          running={i >= 12 && cur !== null && i === 12 + cur.c}
          taken={i >= 12 && cur !== null && i < 12 + cur.c}
          dim={i >= 12 && cur !== null && i > 12 + cur.c}
        />
      ))}
    />
  );
}

/* ================================================================== */
/*  6. deque: front goes negative                                      */
/* ================================================================== */

const DQ_CODE = [
  'const dq = new Deque();',
  'dq.addBack(1);',
  'dq.addBack(2);',
  'dq.addFront(0);',
  'console.log(dq.peekFront());',
  'console.log(dq.peekBack());',
  'console.log(dq.removeFront());',
  'console.log(dq.size());',
];

const DQ_CURSOR = [-1, 0, 1, 2, 3, 4, 5, 6, 7];
const DQ_TOTAL = 8;
const DQ_IDXS = [-2, -1, 0, 1, 2, 3];

const DQ_CAPTIONS: ReactNode[] = [
  <>
    প্লে চাপলে দুই pointer-এর <C t="Deque" /> চলবে। দুই মুখে যোগ-বাদ, আর{' '}
    <C t="front" />-এর ঋণাত্মকে যাওয়ার দৃশ্যটাও দেখা যাবে।
  </>,
  <>
    <C t="new Deque()" />: <C t="front" /> আর <C t="back" /> দুটোই 0-এ।
  </>,
  <>
    <C t="addBack(1)" />: 1 বসল 0 নম্বরে, <C t="back" /> এগিয়ে 1-এ।
  </>,
  <>
    <C t="addBack(2)" />: 2 বসল 1 নম্বরে, <C t="back" /> 2-এ।
  </>,
  <>
    <C t="addFront(0)" />: আগে <C t="front" /> কমে -1, তারপর সেখানে 0 বসল। array হলে এখানেই
    বিস্ফোরণ, কিন্তু object-এ চাবি যেকোনো সংখ্যাই হতে পারে।
  </>,
  <>
    <C t="peekFront()" />: front-এ, মানে -1 নম্বর ঘরে 0 বসে আছে।
  </>,
  <>
    <C t="peekBack()" />: back সবসময় এক ঘর এগিয়ে থাকে, তাই শেষ মান <C t="back - 1" /> = 1
    নম্বরে: 2।
  </>,
  <>
    <C t="removeFront()" />: front-এর 0 বের হলো, ঘর <C t="delete" />, <C t="front" /> ফিরে এলো
    0-এ।
  </>,
  <>
    <C t="size()" /> = <C t="back - front" /> = 2 - 0 = 2। দুই মুখ নিয়েও কেউ সরল না।
  </>,
];

function dqState(step: number) {
  const cells: Record<number, CellDef> = {};
  let front = 0;
  let back = 0;
  if (step >= 2) {
    cells[0] = { v: '1', tone: step === 2 ? 'fresh' : 'default' };
    back = 1;
  }
  if (step >= 3) {
    cells[1] = { v: '2', tone: step === 3 ? 'fresh' : 'default' };
    back = 2;
  }
  if (step >= 4) {
    cells[-1] = { v: '0', tone: step === 4 ? 'fresh' : 'default' };
    front = -1;
  }
  if (step === 5) cells[-1].tone = 'peek';
  if (step === 6) cells[1].tone = 'peek';
  if (step >= 7) {
    cells[-1].gone = true;
    front = 0;
  }
  return { cells, front, back };
}

export function DequeOpsAnim() {
  const { step, playing, toggle, reset, next, prev, done } = useStepPlayer(DQ_TOTAL);
  const cursor = DQ_CURSOR[step];
  const { cells, front, back } = dqState(step);
  const consoleLines =
    step >= 8
      ? ['0', '2', '0', '2']
      : step >= 7
        ? ['0', '2', '0']
        : step >= 6
          ? ['0', '2']
          : step >= 5
            ? ['0']
            : [];

  return (
    <Stage
      title="Deque লাইভ: দুই মুখে দুই কাজ"
      step={step}
      total={DQ_TOTAL}
      playing={playing}
      done={done}
      onToggle={toggle}
      onReset={reset}
      onNext={next}
      onPrev={prev}
      caption={DQ_CAPTIONS[step]}
      consoleLines={consoleLines}
      viz={
        <Lane
          slots={toSlots(DQ_IDXS, cells)}
          marks={[
            { idx: front, chip: <PtrChip id="dq-f" t={`front ${front}`} tone="front" /> },
            { idx: back, chip: <PtrChip id="dq-b" t={`back ${back}`} tone="back" /> },
          ]}
        />
      }
      lines={DQ_CODE.map((code, i) => (
        <Line
          key={i}
          n={i + 1}
          code={code}
          cursorId="dq-cursor"
          active={cursor === i}
          tag={i >= 1 && i <= 3 ? <OpChip t="O(1)" on={step > i} /> : undefined}
        />
      ))}
    />
  );
}

/* ================================================================== */
/*  7. monotonic-stack: next greater in one pass                       */
/* ================================================================== */

const MS_CODE = [
  'function nextGreater(arr) {',
  I1 + 'const result = Array(arr.length).fill(-1);',
  I1 + 'const stack = [];',
  I1 + 'for (let i = 0; i < arr.length; i++) {',
  I2 + 'while (stack.length > 0 && arr[i] > arr[stack[stack.length - 1]]) {',
  I3 + 'const j = stack.pop();',
  I3 + 'result[j] = arr[i];',
  I2 + '}',
  I1 + 'stack.push(i);',
  I1 + '}',
  I1 + 'return result;',
  '}',
  'console.log(nextGreater([2, 1, 5, 6, 2, 3]));',
];

const MS_CURSOR = [-1, 12, 8, 8, 6, 6, 8, 6, 8, 8, 6, 8, 12];
const MS_TOTAL = 12;
const MS_VALS = [2, 1, 5, 6, 2, 3];

const MS_CAPTIONS: ReactNode[] = [
  <>
    প্লে চাপলে <C t="nextGreater([2, 1, 5, 6, 2, 3])" /> এক পাসে চলবে। stack-এ থাকে
    অপেক্ষারতদের index, নতুন মান এলে ছোটদের উত্তর পাইকারি দিয়ে দেওয়া হয়।
  </>,
  <>
    ডাক পড়ল। <C t="result" /> শুরুতেই -1 ভরা, stack খালি।
  </>,
  <>
    i=0, মান 2। stack খালি, তাই while-এ ঢোকারই প্রশ্ন নেই: index 0 সরাসরি push।
  </>,
  <>
    i=1, মান 1। <C t="1 < arr[0] = 2" />, top বড়, তাই আবার push: index 1। stack-এর মান ক্রমশ
    কমছে, খেয়াল করো।
  </>,
  <>
    i=2, মান 5। <C t="5 > arr[1] = 1" />: index 1-এর অপেক্ষা শেষ, উত্তর 5, pop।
  </>,
  <>
    while আবার ঘুরল: <C t="5 > arr[0] = 2" />: index 0-এর উত্তরও 5। এক মান একা দুজনের উত্তর
    দিল, এটাই পাইকারি বিতরণ।
  </>,
  <>
    stack খালি, এবার index 2 push।
  </>,
  <>
    i=3, মান 6। <C t="6 > arr[2] = 5" />: index 2-এর উত্তর 6, pop।
  </>,
  <>
    index 3 push।
  </>,
  <>
    i=4, মান 2। <C t="2 < arr[3] = 6" />: while একবারও ঘুরল না, index 4 সরাসরি push।
  </>,
  <>
    i=5, মান 3। <C t="3 > arr[4] = 2" />: index 4-এর উত্তর 3, pop।
  </>,
  <>
    কিন্তু <C t="3 < arr[3] = 6" />: while থামল, index 5 push। stack আবার ক্রমশ কমতে থাকা।
  </>,
  <>
    loop শেষ। stack-এ 3 আর 5 রয়ে গেল, তাদের ডানে বড় কেউ নেই, তাই -1-ই থাকে। মোট কাজ প্রায়
    2n, কারণ প্রতি index জীবনে একবার push, সর্বোচ্চ একবার pop।
  </>,
];

const MS_BUBBLES: Record<number, { expr: string; res: boolean }> = {
  4: { expr: '5 > arr[1] = 1', res: true },
  5: { expr: '5 > arr[0] = 2', res: true },
  7: { expr: '6 > arr[2] = 5', res: true },
  10: { expr: '3 > arr[4] = 2', res: true },
  11: { expr: '3 > arr[3] = 6', res: false },
};

function msState(step: number) {
  const stack: number[] = [];
  const result: (number | null)[] = [null, null, null, null, null, null];
  let curI: number | null = null;
  let justSet: number | null = null;
  if (step >= 2) {
    stack.push(0);
    curI = 0;
  }
  if (step >= 3) {
    stack.push(1);
    curI = 1;
  }
  if (step >= 4) {
    stack.pop();
    result[1] = 5;
    curI = 2;
    justSet = 1;
  }
  if (step >= 5) {
    stack.pop();
    result[0] = 5;
    justSet = 0;
  }
  if (step >= 6) {
    stack.push(2);
    justSet = null;
  }
  if (step >= 7) {
    stack.pop();
    result[2] = 6;
    curI = 3;
    justSet = 2;
  }
  if (step >= 8) {
    stack.push(3);
    justSet = null;
  }
  if (step >= 9) {
    stack.push(4);
    curI = 4;
  }
  if (step >= 10) {
    stack.pop();
    result[4] = 3;
    curI = 5;
    justSet = 4;
  }
  if (step >= 11) {
    stack.push(5);
    justSet = null;
  }
  if (step >= 12) curI = null;
  return { stack, result, curI, justSet };
}

export function MonotonicStackAnim() {
  const { step, playing, toggle, reset, next, prev, done } = useStepPlayer(MS_TOTAL);
  const cursor = MS_CURSOR[step];
  const ms = msState(step);
  const bub = MS_BUBBLES[step];
  const running = [4, 5, 7, 10, 11].includes(step);

  return (
    <Stage
      title="Next Greater: এক পাসের জাদু"
      step={step}
      total={MS_TOTAL}
      playing={playing}
      done={done}
      onToggle={toggle}
      onReset={reset}
      onNext={next}
      onPrev={prev}
      caption={MS_CAPTIONS[step]}
      consoleLines={step >= 12 ? ['[ 5, 5, 6, -1, 3, -1 ]'] : []}
      viz={
        <div className="flex flex-wrap items-end gap-6">
          <div>
            <div className="flex items-end gap-1.5">
              {MS_VALS.map((v, i) => (
                <div key={i} className="flex w-11 flex-col items-center">
                  <span className="flex h-5 items-center">
                    {ms.curI === i && <PtrChip id="ms-i" t="i" tone="i" />}
                  </span>
                  <motion.div
                    animate={{ height: 14 + v * 8 }}
                    transition={SPRING}
                    className={`w-11 rounded-t-lg border-2 transition-colors duration-300 ${
                      ms.curI === i
                        ? 'border-sky-400 bg-sky-100'
                        : ms.result[i] !== null
                          ? 'border-emerald-300 bg-emerald-50'
                          : 'border-zinc-300 bg-zinc-100'
                    }`}
                  />
                  <span className="mt-0.5 font-mono text-xs font-semibold text-zinc-700">{v}</span>
                  <span className="select-none font-mono text-[10px] text-zinc-400">i={i}</span>
                </div>
              ))}
            </div>
            <div className="mt-2 flex gap-1.5">
              {ms.result.map((r, i) => (
                <motion.span
                  key={i}
                  animate={ms.justSet === i ? { scale: [1.3, 1] } : { scale: 1 }}
                  transition={SPRING}
                  className={`flex h-7 w-11 items-center justify-center rounded-md border font-mono text-xs font-semibold transition-colors duration-300 ${
                    r !== null
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                      : 'border-zinc-200 text-zinc-400'
                  }`}
                >
                  {r === null ? -1 : r}
                </motion.span>
              ))}
            </div>
            <div className="mt-1 select-none font-mono text-[10px] text-zinc-400">result</div>
          </div>
          <div>
            <StackCol
              items={ms.stack.map((idx) => ({
                key: `ms${idx}`,
                label: `${idx}·${MS_VALS[idx]}`,
              }))}
              prefix="ms"
              height={150}
              width={52}
              emptyText="খালি"
            />
            <div className="mt-1 select-none text-center font-mono text-[10px] text-zinc-400">
              stack (index·মান)
            </div>
          </div>
        </div>
      }
      lines={MS_CODE.map((code, i) => (
        <Line
          key={i}
          n={i + 1}
          code={code}
          cursorId="ms-cursor"
          active={cursor === i}
          bubble={bub && i === 4 ? { expr: bub.expr, res: bub.res } : undefined}
          running={i === 4 && running}
        />
      ))}
    />
  );
}

/* ================================================================== */
/*  8. priority-queue: scan-on-dequeue                                 */
/* ================================================================== */

const PQ_CODE = [
  'const pq = new PriorityQueue();',
  'pq.enqueue("B", 3);',
  'pq.enqueue("A", 5);',
  'pq.enqueue("C", 1);',
  'console.log(pq.dequeue());',
  'pq.enqueue("D", 2);',
  'console.log(pq.dequeue());',
];

const PQ_CURSOR = [-1, 0, 1, 2, 3, 4, 4, 4, 4, 5, 6, 6, 6, 6, -1];
const PQ_TOTAL = 14;

const PQ_CAPTIONS: ReactNode[] = [
  <>
    প্লে চাপলে scan-on-dequeue version-টা চলবে। ঢোকানো ফটকা, খরচটা বের হওয়ার সময়ের স্ক্যানে,
    সেটাই দেখো।
  </>,
  <>
    খালি <C t="PriorityQueue" />।
  </>,
  <>
    <C t='enqueue("B", 3)' />: শেষে বসে গেল, <C t="O(1)" />।
  </>,
  <>
    <C t='enqueue("A", 5)' />: A-ও শেষে। তালিকা এখনও unsorted, এটাই এখানে ঠিক।
  </>,
  <>
    <C t='enqueue("C", 1)' />: সবচেয়ে জরুরি হয়েও C লাইনের শেষে। ভেতরে সাজানোর বাধ্যবাধকতা
    নেই।
  </>,
  <>
    <C t="dequeue()" />: এবার স্ক্যান। <C t="best" /> ধরে নিল প্রথমজনকে: B (priority 3)।
  </>,
  <>
    A-র সঙ্গে তুলনা: <C t="5 < 3" /> না, <C t="best" /> অটল।
  </>,
  <>
    C-র সঙ্গে তুলনা: <C t="1 < 3" />, নতুন চ্যাম্পিয়ন C। Traversal-এর max-খোঁজা প্যাটার্নের
    হুবহু রূপ।
  </>,
  <>
    C কে মাঝ থেকে কেটে (<C t="splice" />) বের করা হলো। দেরিতে ঢুকেও জরুরি বলে আগে গেল।
  </>,
  <>
    <C t='enqueue("D", 2)' />: আবার শেষে বসল, <C t="O(1)" />।
  </>,
  <>
    আরেক <C t="dequeue()" />: <C t="best" /> আবার B থেকে শুরু।
  </>,
  <>
    A: <C t="5 < 3" /> না।
  </>,
  <>
    D: <C t="2 < 3" />, <C t="best" /> এখন D।
  </>,
  <>
    D বের হলো। dequeue <C t="O(n)" />, কারণ প্রতিবার পুরো স্ক্যান। দুটোই <C t="O(log n)" /> করা
    যায় heap দিয়ে, সেই গল্প Heaps section-এ।
  </>,
  <>
    শেষ। মনে রাখো: বের হওয়ার মুহূর্তে শুধু সঠিকটা দরকার, ভেতরের ক্রম রাখার বাধ্যবাধকতা নেই।
  </>,
];

type PqItem = { key: string; v: string; p: number; tone?: Tone };

function pqState(step: number) {
  const items: PqItem[] = [];
  let best: number | null = null;
  let scan: number | null = null;
  const add = (v: string, p: number, at: number) => {
    if (step >= at) items.push({ key: `pq${v}`, v, p, tone: step === at ? 'fresh' : 'default' });
  };
  add('B', 3, 2);
  add('A', 5, 3);
  add('C', 1, 4);
  if (step >= 8) items.splice(items.findIndex((x) => x.v === 'C'), 1);
  add('D', 2, 9);
  if (step >= 13) items.splice(items.findIndex((x) => x.v === 'D'), 1);
  if (step === 5 || step === 10) {
    best = 0;
    scan = 0;
  }
  if (step === 6 || step === 11) {
    best = 0;
    scan = 1;
  }
  if (step === 7 || step === 12) {
    best = 2;
    scan = 2;
  }
  if (scan !== null && items[scan]) items[scan].tone = 'scan';
  return { items, best, scan };
}

const PQ_BUBBLES: Record<number, { expr: string; res: boolean | null }> = {
  5: { expr: 'best = B(3)', res: null },
  6: { expr: 'A(5) < B(3)', res: false },
  7: { expr: 'C(1) < B(3)', res: true },
  10: { expr: 'best = B(3)', res: null },
  11: { expr: 'A(5) < B(3)', res: false },
  12: { expr: 'D(2) < B(3)', res: true },
};

export function PriorityQueueAnim() {
  const { step, playing, toggle, reset, next, prev, done } = useStepPlayer(PQ_TOTAL);
  const cursor = PQ_CURSOR[step];
  const { items, best } = pqState(step);
  const bub = PQ_BUBBLES[step];
  const consoleLines = step >= 13 ? ['C', 'D'] : step >= 8 ? ['C'] : [];
  const scanLine = step >= 5 && step <= 8 ? 4 : step >= 10 && step <= 13 ? 6 : null;

  return (
    <Stage
      title="Priority Queue: জরুরি আগে"
      step={step}
      total={PQ_TOTAL}
      playing={playing}
      done={done}
      onToggle={toggle}
      onReset={reset}
      onNext={next}
      onPrev={prev}
      caption={PQ_CAPTIONS[step]}
      consoleLines={consoleLines}
      viz={
        <div className="flex min-h-[92px] flex-wrap items-start gap-3">
          <AnimatePresence mode="popLayout">
            {items.map((it, i) => (
              <motion.div
                key={it.key}
                layout
                initial={{ opacity: 0, y: 18, scale: 0.85 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -26, scale: 0.8 }}
                transition={SPRING}
                className="flex flex-col items-center"
              >
                <div
                  className={`flex h-14 w-16 flex-col items-center justify-center rounded-xl border-2 transition-colors duration-300 ${TONES[it.tone ?? 'default']}`}
                >
                  <span className="font-mono text-base font-bold">{it.v}</span>
                  <span className="mt-0.5 rounded-full bg-zinc-900/5 px-1.5 font-mono text-[10px]">
                    p:{it.p}
                  </span>
                </div>
                <span className="mt-1 flex h-5 items-center">
                  {best === i && <PtrChip id="pq-best" t="best" tone="best" />}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
          {items.length === 0 && (
            <span className="flex h-14 items-center rounded-xl border-2 border-dashed border-zinc-200 px-4 font-mono text-[11px] text-zinc-400">
              খালি queue
            </span>
          )}
        </div>
      }
      lines={PQ_CODE.map((code, i) => (
        <Line
          key={i}
          n={i + 1}
          code={code}
          cursorId="pq-cursor"
          active={cursor === i}
          bubble={bub && cursor === i ? { expr: bub.expr, res: bub.res } : undefined}
          running={scanLine === i && step !== 8 && step !== 13}
        />
      ))}
    />
  );
}
