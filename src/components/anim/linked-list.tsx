'use client';

import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { C, Line, Stage, useStepPlayer } from './control-flow';

/* ================================================================== */
/*  shared: node chain atoms                                           */
/* ================================================================== */

type NodeTone = 'default' | 'new' | 'leaving' | 'walk';

const NODE_TONES: Record<NodeTone, string> = {
  default: 'border-zinc-300 bg-white text-zinc-800',
  new: 'border-emerald-400 bg-emerald-50 text-emerald-700',
  leaving: 'border-rose-400 bg-rose-50 text-rose-600',
  walk: 'border-sky-400 bg-sky-50 text-sky-700',
};

const NW = 68; // node box width
const GP = 34; // gap (arrow) width
const STRIDE = NW + GP;

type ChainNode = {
  key: string;
  value: ReactNode;
  tone?: NodeTone;
  label?: string; // variable name above node
  addr?: string; // memory address under node
};

type Gap = { on?: boolean; fresh?: boolean; back?: boolean; backFresh?: boolean };

function Cost({ t, on, warm }: { t: string; on: boolean; warm?: boolean }) {
  return (
    <span
      className={`inline-flex h-6 items-center rounded-full border px-2.5 font-mono text-[11px] font-medium transition-colors duration-500 ${
        on
          ? warm
            ? 'border-amber-300 bg-amber-50 text-amber-700'
            : 'border-emerald-300 bg-emerald-50 text-emerald-700'
          : 'border-zinc-200 text-zinc-400'
      }`}
    >
      {t}
    </span>
  );
}

function Mark({ id, t, tone }: { id: string; t: string; tone: 'head' | 'cur' | 'tail' }) {
  const cls =
    tone === 'head'
      ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
      : tone === 'cur'
        ? 'border-sky-300 bg-sky-50 text-sky-700'
        : 'border-zinc-700 bg-zinc-800 text-white';
  return (
    <motion.span
      layoutId={id}
      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
      className={`select-none rounded-full border px-2 py-px font-mono text-[10px] font-medium ${cls}`}
    >
      {t}
    </motion.span>
  );
}

function HeadChip({ t = 'head' }: { t?: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-emerald-300 bg-emerald-50 px-2 py-px font-mono text-[10px] font-medium text-emerald-700">
      {t}
    </span>
  );
}

function TailChip() {
  return (
    <span className="inline-flex items-center rounded-full border border-zinc-700 bg-zinc-800 px-2 py-px font-mono text-[10px] font-medium text-white">
      tail
    </span>
  );
}

function NullChip() {
  return (
    <span className="inline-flex items-center rounded-lg border-2 border-dashed border-zinc-200 px-2 py-0.5 font-mono text-[11px] text-zinc-400">
      null
    </span>
  );
}

function LLNode({ n, wired, freshWire }: { n: ChainNode; wired: boolean; freshWire?: boolean }) {
  return (
    <div className="flex w-[68px] shrink-0 flex-col items-center">
      <span className="h-4 select-none font-mono text-[10px] leading-4 text-zinc-400">
        {n.label ?? ''}
      </span>
      <div
        className={`flex h-11 w-[68px] overflow-hidden rounded-xl border-2 transition-colors duration-300 ${NODE_TONES[n.tone ?? 'default']}`}
      >
        <div className="flex w-[46px] items-center justify-center font-mono text-base font-semibold">
          {n.value}
        </div>
        <div className="flex flex-1 items-center justify-center border-l border-inherit">
          <span
            className={`size-1.5 rounded-full transition-colors duration-300 ${
              wired ? (freshWire ? 'bg-emerald-500' : 'bg-zinc-500') : 'bg-zinc-300'
            }`}
          />
        </div>
      </div>
      <span className="mt-0.5 h-4 select-none font-mono text-[10px] leading-4 text-zinc-400">
        {n.addr ?? ''}
      </span>
    </div>
  );
}

function GapArrow({ on, fresh, back, backFresh }: Gap) {
  const col = (f?: boolean) => (f ? '#10b981' : '#a1a1aa');
  return (
    <div className="mt-4 flex h-11 w-[34px] shrink-0 items-center justify-center">
      {back !== undefined ? (
        <svg width="30" height="14" viewBox="0 0 30 14">
          {on ? (
            <>
              <line x1="2" y1="4" x2="23" y2="4" stroke={col(fresh)} strokeWidth="1.6" />
              <path d="M 20 1 L 26 4 L 20 7" fill="none" stroke={col(fresh)} strokeWidth="1.6" />
            </>
          ) : null}
          {back ? (
            <>
              <line x1="28" y1="10" x2="7" y2="10" stroke={col(backFresh)} strokeWidth="1.6" />
              <path d="M 10 7 L 4 10 L 10 13" fill="none" stroke={col(backFresh)} strokeWidth="1.6" />
            </>
          ) : null}
        </svg>
      ) : on ? (
        <svg width="30" height="8" viewBox="0 0 30 8">
          <line x1="2" y1="4" x2="23" y2="4" stroke={col(fresh)} strokeWidth="1.6" />
          <path d="M 20 1 L 26 4 L 20 7" fill="none" stroke={col(fresh)} strokeWidth="1.6" />
        </svg>
      ) : null}
    </div>
  );
}

/* generic chain renderer: nodes in a row, arrows in gaps, markers below,
   optional arc above (bypass / circular wrap / self loop) */
function Chain({
  nodes,
  gaps = [],
  double,
  headIdx = null,
  tailIdx = null,
  curIdx = null,
  curLabel = 'current',
  extraChip = null,
  nullAtEnd = true,
  nullActive,
  empty,
  arc = null,
  prefix,
  bare,
}: {
  nodes: ChainNode[];
  gaps?: Gap[];
  double?: boolean;
  headIdx?: number | null;
  tailIdx?: number | null;
  curIdx?: number | 'null' | null;
  curLabel?: string;
  extraChip?: { idx: number; t: string } | null;
  nullAtEnd?: boolean;
  nullActive?: boolean;
  empty?: ReactNode;
  arc?: { from: number; to: number; fresh?: boolean } | null;
  prefix: string;
  bare?: boolean;
}) {
  const box = bare
    ? 'overflow-x-auto'
    : 'overflow-x-auto rounded-xl border border-zinc-200 bg-zinc-50/80 px-4 py-3';
  if (nodes.length === 0) {
    return (
      <div
        className={`flex items-center justify-center text-center text-[13px] text-zinc-400 ${bare ? 'h-[120px]' : `h-[200px] ${box}`}`}
      >
        {empty ?? 'প্লে চাপলে node-গুলো এখানে জুড়তে শুরু করবে'}
      </div>
    );
  }
  const pill = nullAtEnd;
  const W = nodes.length * NW + (nodes.length - 1) * GP + (pill ? GP + 52 : 0);
  const cx = (i: number) => i * STRIDE + NW / 2;
  const arcCol = arc?.fresh ? '#10b981' : '#a1a1aa';
  const lastWired = arc !== null && arc.from === nodes.length - 1;
  return (
    <div className={box}>
      <div className="relative mx-auto" style={{ width: W, paddingTop: 56 }}>
        <AnimatePresence>
          {arc && (
            <motion.svg
              key={`${prefix}-arc-${arc.from}-${arc.to}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none absolute left-0 top-0"
              width={W}
              height={72}
              viewBox={`0 0 ${W} 72`}
            >
              {arc.from === arc.to ? (
                <>
                  <motion.path
                    d={`M ${cx(arc.from) + 14} 68 C ${cx(arc.from) + 32} 20, ${cx(arc.from) - 32} 20, ${cx(arc.from) - 14} 68`}
                    fill="none"
                    stroke={arcCol}
                    strokeWidth="1.6"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                  <path
                    d={`M ${cx(arc.from) - 19} 61 L ${cx(arc.from) - 14} 68 L ${cx(arc.from) - 9} 61`}
                    fill="none"
                    stroke={arcCol}
                    strokeWidth="1.6"
                  />
                </>
              ) : (
                <>
                  <motion.path
                    d={`M ${cx(arc.from)} 68 C ${cx(arc.from)} 16, ${cx(arc.to)} 16, ${cx(arc.to)} 62`}
                    fill="none"
                    stroke={arcCol}
                    strokeWidth="1.6"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                  <path
                    d={`M ${cx(arc.to) - 5} 57 L ${cx(arc.to)} 64 L ${cx(arc.to) + 5} 57`}
                    fill="none"
                    stroke={arcCol}
                    strokeWidth="1.6"
                  />
                </>
              )}
            </motion.svg>
          )}
        </AnimatePresence>
        <div className="flex items-start">
          <AnimatePresence mode="popLayout">
            {nodes.map((n, i) => {
              const g = gaps[i];
              const isLast = i === nodes.length - 1;
              const wired = isLast ? lastWired || !!g?.on : !!g?.on;
              return (
                <motion.div
                  key={n.key}
                  layout
                  initial={{ opacity: 0, scale: 0.6, y: -14 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.6, y: 18 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                  className="flex items-start"
                >
                  <div className="flex flex-col items-center">
                    <LLNode n={n} wired={wired} freshWire={g?.fresh} />
                    <div className="mt-1 flex h-[44px] flex-col items-center justify-start gap-1">
                      {headIdx === i && <Mark id={`${prefix}-head`} t="head" tone="head" />}
                      {tailIdx === i && <Mark id={`${prefix}-tail`} t="tail" tone="tail" />}
                      {extraChip && extraChip.idx === i && (
                        <Mark id={`${prefix}-extra`} t={extraChip.t} tone="head" />
                      )}
                      {curIdx === i && <Mark id={`${prefix}-cur`} t={curLabel} tone="cur" />}
                    </div>
                  </div>
                  {!isLast && (
                    <GapArrow
                      on={g?.on}
                      fresh={g?.fresh}
                      back={double ? g?.back : undefined}
                      backFresh={g?.backFresh}
                    />
                  )}
                  {isLast && pill && (
                    <>
                      <GapArrow on />
                      <div className="flex flex-col items-center">
                        <span className="h-4" />
                        <span
                          className={`flex h-11 w-[52px] items-center justify-center rounded-xl border-2 border-dashed font-mono text-[11px] transition-colors duration-300 ${
                            nullActive
                              ? 'border-sky-300 bg-sky-50 text-sky-600'
                              : 'border-zinc-200 text-zinc-400'
                          }`}
                        >
                          null
                        </span>
                        <div className="mt-1 flex h-[44px] flex-col items-center justify-start gap-1">
                          {curIdx === 'null' && (
                            <Mark id={`${prefix}-cur`} t={curLabel} tone="cur" />
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  1. what-is-linked-list: manual wiring + traversal                  */
/* ================================================================== */

const WI_CODE = [
  'class Node {',
  '  constructor(value) { this.value = value; this.next = null; }',
  '}',
  'const a = new Node(10);',
  'const b = new Node(20);',
  'const c = new Node(30);',
  'a.next = b;',
  'b.next = c;',
  'const head = a;',
  'let current = head;',
  'while (current !== null) {',
  '  console.log(current.value);',
  '  current = current.next;',
  '}',
];

// 0 idle · 1 class · 2 a · 3 b · 4 c · 5 a.next=b · 6 b.next=c · 7 head ·
// 8 current=head · 9 check · 10 print 10 · 11 hop · 12 check · 13 print 20 ·
// 14 hop · 15 check · 16 print 30 · 17 current=null · 18 check false · 19 done
const WI_CURSOR = [-1, 0, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 10, 11, 12, 10, 11, 12, 10, -1];
const WI_TOTAL = 19;

const WI_CAPTIONS: ReactNode[] = [
  <>
    প্লে চাপলে তিনটা node বানিয়ে pointer দিয়ে জুড়ব, তারপর <C t="head" /> ধরে পুরো লিস্ট হেঁটে
    দেখব।
  </>,
  <>
    <C t="class Node" /> হলো ছাঁচ: প্রতিটা node-এ থাকবে একটা <C t="value" /> আর পরেরটার ঠিকানা{' '}
    <C t="next" />।
  </>,
  <>
    <C t="new Node(10)" /> ডাকতেই constructor চলল (amber লাইন), <C t="next = null" /> দিয়ে শুরু।
    ধরো ঠিকানা <C t="@1000" />।
  </>,
  <>
    <C t="b" /> তৈরি হলো <C t="@2040" />-এ। লক্ষ করো, address-এর কোনো ধারাবাহিকতা নেই, মেমরিতে
    সবাই ছড়ানো।
  </>,
  <>
    <C t="c" /> তৈরি <C t="@1400" />-এ। তিনটা node তিন জায়গায়, এখনো কেউ কাউকে চেনে না।
  </>,
  <>
    <C t="a.next = b" />: a-র ভেতরে b-র ঠিকানা বসল। b কোথাও সরেনি, শুধু তীর টানা হলো।
  </>,
  <>
    <C t="b.next = c" />: দ্বিতীয় তীর। c-র next কেউ ছোঁয়েনি, তাই সেটা <C t="null" />-ই, মানে
    এখানেই শেষ।
  </>,
  <>
    <C t="const head = a" />: প্রথম node-এর ঠিকানাটা আলাদা মনে রাখলাম। এই এক লেবেলেই পুরো শৃঙ্খল
    হাতে।
  </>,
  <>
    <C t="let current = head" />: হাঁটার pointer আলাদা। <C t="head" /> অক্ষত রাখো, head হারালে
    পুরো লিস্ট হারানো।
  </>,
  <>
    while চেক: <C t="current" /> 10-কে দেখাচ্ছে, null নয়, তাই লুপে ঢুকব।
  </>,
  <>
    <C t="console.log(current.value)" />: 10 ছাপলো।
  </>,
  <>
    <C t="current = current.next" />: পরের node-এর ঠিকানাটাই নতুন current, এক ঘর এগিয়ে 20-এ।
  </>,
  <>
    আবার চেক: current এখন 20-এ, null নয়, চলো।
  </>,
  <>20 ছাপলো।</>,
  <>
    আরেক ধাপ: current এখন 30-এ।
  </>,
  <>
    চেক: 30 null নয়, শেষবারের মতো লুপে ঢুকল।
  </>,
  <>30 ছাপলো।</>,
  <>
    <C t="current = current.next" />: 30-এর next তো <C t="null" />, তাই current এখন null।
  </>,
  <>
    চেক: <C t="null !== null" /> মিথ্যে, লুপ শেষ।
  </>,
  <>
    তিনটা node-এ ঠিক তিন ধাপ হাঁটা। n টা node হলে ঠিক n ধাপ, এজন্যই traversal <C t="O(n)" />।
  </>,
];

export function WhatIsLinkedListAnim() {
  const { step, playing, toggle, reset, done } = useStepPlayer(WI_TOTAL);

  const nodes: ChainNode[] = [];
  if (step >= 2)
    nodes.push({
      key: 'a',
      value: 10,
      label: 'a',
      addr: '@1000',
      tone: step === 2 ? 'new' : step === 10 ? 'walk' : 'default',
    });
  if (step >= 3)
    nodes.push({
      key: 'b',
      value: 20,
      label: 'b',
      addr: '@2040',
      tone: step === 3 ? 'new' : step === 13 ? 'walk' : 'default',
    });
  if (step >= 4)
    nodes.push({
      key: 'c',
      value: 30,
      label: 'c',
      addr: '@1400',
      tone: step === 4 ? 'new' : step === 16 ? 'walk' : 'default',
    });

  const gaps: Gap[] = [
    { on: step >= 5, fresh: step === 5 },
    { on: step >= 6, fresh: step === 6 },
  ];

  const headIdx = step >= 7 ? 0 : null;
  const curIdx: number | 'null' | null =
    step < 8 ? null : step <= 10 ? 0 : step <= 13 ? 1 : step <= 16 ? 2 : 'null';

  const bubbles: Record<number, { expr: string; res: boolean | null }> = {};
  if (step === 9) bubbles[10] = { expr: '10 !== null', res: true };
  if (step === 12) bubbles[10] = { expr: '20 !== null', res: true };
  if (step === 15) bubbles[10] = { expr: '30 !== null', res: true };
  if (step === 18) bubbles[10] = { expr: 'null !== null', res: false };

  const consoleLines =
    step >= 16 ? ['10', '20', '30'] : step >= 13 ? ['10', '20'] : step >= 10 ? ['10'] : [];

  return (
    <Stage
      title="node জোড়া লাগানো আর traversal"
      step={step}
      total={WI_TOTAL}
      playing={playing}
      done={done}
      onToggle={toggle}
      onReset={reset}
      caption={WI_CAPTIONS[step]}
      consoleLines={consoleLines}
      viz={
        <Chain
          prefix="wi"
          nodes={nodes}
          gaps={gaps}
          headIdx={headIdx}
          curIdx={curIdx}
          nullActive={step >= 17}
          empty="প্লে চাপলে তিনটা node বানিয়ে pointer দিয়ে জুড়ব"
        />
      }
      lines={WI_CODE.map((code, i) => (
        <Line
          key={i}
          n={i + 1}
          code={code}
          cursorId="ll-wi"
          active={WI_CURSOR[step] === i}
          running={step >= 2 && step <= 4 && i === 1}
          bubble={bubbles[i]}
        />
      ))}
    />
  );
}

/* ================================================================== */
/*  2. singly-linked-list: prepend O(1) vs append O(n)                 */
/* ================================================================== */

const SG_CODE = [
  'const list = new LinkedList();',
  'list.append(10);',
  'list.append(20);',
  'list.prepend(5);',
  'list.append(30);',
  'list.print();',
  'console.log(list.find(20));',
  'console.log(list.size);',
];

// 0 idle · 1 new · 2 append10 · 3 append20 খোঁজা · 4 append20 জোড়া ·
// 5 prepend তীর · 6 prepend লেবেল · 7-9 append30 হাঁটা · 10 append30 জোড়া ·
// 11 print · 12-14 find · 15 size
const SG_CURSOR = [-1, 0, 1, 2, 2, 3, 3, 4, 4, 4, 4, 5, 6, 6, 6, 7];
const SG_TOTAL = 15;

const SG_CAPTIONS: ReactNode[] = [
  <>
    প্লে চাপলে খালি লিস্টে append আর prepend চালিয়ে লিস্ট বানাব, তারপর print আর find। কোন
    অপারেশনে কত কাজ লাগে গুনে দেখো।
  </>,
  <>
    <C t="new LinkedList()" />: <C t="head = null" />, <C t="size = 0" />। এখনো একটাও node নেই।
  </>,
  <>
    <C t="append(10)" />: খালি লিস্টের আলাদা কেস, <C t="if (!this.head)" /> ধরে নতুন node-ই
    সরাসরি head হলো। হাঁটাই লাগল না।
  </>,
  <>
    <C t="append(20)" />: আগে শেষ node খুঁজি। current দাঁড়াল 10-এ, তার <C t="next" /> তো null,
    মানে 10-ই শেষ।
  </>,
  <>
    <C t="current.next = node" />: 20 জুড়ে গেল শেষে, size = 2।
  </>,
  <>
    <C t="prepend(5)" />, ধাপ ১: <C t="node.next = this.head" />। নতুন node 5 পুরনো head
    (10)-কে দেখাল। সোনার নিয়ম: আগে তীর টানো।
  </>,
  <>
    ধাপ ২: <C t="this.head = node" />। এবার লেবেল সরল। মোট দুটো pointer বদল, লিস্ট যত লম্বাই হোক
    এই দাম একই: <C t="O(1)" />।
  </>,
  <>
    <C t="append(30)" />: শেষ খুঁজতে হাঁটা শুরু। 5-এর next আছে (10), তাই এগিয়ে যাই।
  </>,
  <>
    10-এর next আছে (20), আবার এগোই।
  </>,
  <>
    20-এর next null, থামো। ৩টা node-এর লিস্টে ২ ধাপ হাঁটা লাগল, n বাড়লে হাঁটাও বাড়ে।
  </>,
  <>
    <C t="current.next = node" />: 30 জুড়ল। খোঁজার হাঁটা <C t="O(n)" />, জোড়া লাগানো{' '}
    <C t="O(1)" />।
  </>,
  <>
    <C t="print()" />: পুরো লিস্ট এক পাক ঘুরে ছাপলো।
  </>,
  <>
    <C t="find(20)" />: current = 5, মেলে না। এগোই।
  </>,
  <>
    current = 10, এটাও 20 নয়।
  </>,
  <>
    current = 20, মিলে গেল! সাথে সাথে return, বাকি লিস্ট আর দেখা লাগল না।
  </>,
  <>
    <C t="size" /> = 4: প্রতিটা insert-এ <C t="size++" /> হয়েছিল, তাই হিসাব ঠিকঠাক মিলছে।
  </>,
];

export function SinglyLinkedListAnim() {
  const { step, playing, toggle, reset, done } = useStepPlayer(SG_TOTAL);

  const toneOf = (key: string): NodeTone => {
    if (key === 'n10' && step === 2) return 'new';
    if (key === 'n20' && step === 4) return 'new';
    if (key === 'n5' && step === 5) return 'new';
    if (key === 'n30' && step === 10) return 'new';
    if (key === 'n5' && step === 12) return 'walk';
    if (key === 'n10' && step === 13) return 'walk';
    if (key === 'n20' && step === 14) return 'new';
    return 'default';
  };

  const nodes: ChainNode[] = [];
  const push = (key: string, value: number) => nodes.push({ key, value, tone: toneOf(key) });
  if (step >= 2 && step <= 3) push('n10', 10);
  else if (step === 4) {
    push('n10', 10);
    push('n20', 20);
  } else if (step >= 5 && step <= 9) {
    push('n5', 5);
    push('n10', 10);
    push('n20', 20);
  } else if (step >= 10) {
    push('n5', 5);
    push('n10', 10);
    push('n20', 20);
    push('n30', 30);
  }

  const gaps: Gap[] = [];
  for (let i = 0; i < nodes.length - 1; i++) {
    const a = nodes[i].key;
    const b = nodes[i + 1].key;
    if (a === 'n10' && b === 'n20') gaps.push({ on: step >= 4, fresh: step === 4 });
    else if (a === 'n5' && b === 'n10') gaps.push({ on: step >= 5, fresh: step === 5 });
    else if (a === 'n20' && b === 'n30') gaps.push({ on: step >= 10, fresh: step === 10 });
    else gaps.push({});
  }

  const headIdx = step >= 2 ? (step === 5 ? 1 : 0) : null;
  const curIdx: number | 'null' | null =
    step === 3 || step === 4
      ? 0
      : step === 7
        ? 0
        : step === 8
          ? 1
          : step === 9 || step === 10
            ? 2
            : step === 12
              ? 0
              : step === 13
                ? 1
                : step === 14
                  ? 2
                  : null;

  const bubbles: Record<number, { expr: string; res: boolean | null }> = {};
  if (step === 3) bubbles[2] = { expr: 'current.next', res: false };
  if (step === 7 || step === 8) bubbles[4] = { expr: 'current.next', res: true };
  if (step === 9) bubbles[4] = { expr: 'current.next', res: false };
  if (step === 12) bubbles[6] = { expr: '5 === 20', res: false };
  if (step === 13) bubbles[6] = { expr: '10 === 20', res: false };
  if (step === 14) bubbles[6] = { expr: '20 === 20', res: true };

  const consoleLines =
    step >= 15
      ? ['5 -> 10 -> 20 -> 30 -> null', 'Node { value: 20, ... }', '4']
      : step >= 14
        ? ['5 -> 10 -> 20 -> 30 -> null', 'Node { value: 20, ... }']
        : step >= 11
          ? ['5 -> 10 -> 20 -> 30 -> null']
          : [];

  return (
    <Stage
      title="prepend বনাম append: দামের তুলনা"
      step={step}
      total={SG_TOTAL}
      playing={playing}
      done={done}
      onToggle={toggle}
      onReset={reset}
      caption={SG_CAPTIONS[step]}
      consoleLines={consoleLines}
      viz={
        <Chain
          prefix="sg"
          nodes={nodes}
          gaps={gaps}
          headIdx={headIdx}
          curIdx={curIdx}
          empty={
            <span className="flex flex-wrap items-center justify-center gap-2">
              <HeadChip />
              <span className="text-zinc-300">→</span>
              <NullChip />
              <span className="basis-full pt-1 text-[12px]">খালি লিস্ট: head = null, size = 0</span>
            </span>
          }
        />
      }
      lines={SG_CODE.map((code, i) => (
        <Line
          key={i}
          n={i + 1}
          code={code}
          cursorId="ll-sg"
          active={SG_CURSOR[step] === i}
          bubble={bubbles[i]}
          tag={
            i === 3 ? (
              <Cost t="O(1)" on={step >= 6} />
            ) : i === 4 ? (
              <Cost t="O(n)" warm on={step >= 10} />
            ) : i === 6 ? (
              <Cost t="O(n)" warm on={step >= 14} />
            ) : undefined
          }
        />
      ))}
    />
  );
}

/* ================================================================== */
/*  3. deletion: middle bypass + head case                             */
/* ================================================================== */

const DL_CODE = [
  'const list = new LinkedList();',
  'list.append(10); list.append(20); list.append(30);',
  'list.print();',
  'list.remove(20);',
  'list.print();',
  'list.remove(10);',
  'list.print();',
];

// 0 idle · 1 new · 2 appends · 3 print · 4 remove20 থামা · 5 bypass arc ·
// 6 20 বাদ · 7 print · 8 remove10 head চেক · 9 head সরল · 10 print
const DL_CURSOR = [-1, 0, 1, 2, 3, 3, 3, 4, 5, 5, 6];
const DL_TOTAL = 10;

const DL_CAPTIONS: ReactNode[] = [
  <>
    প্লে চাপলে <C t="10 -> 20 -> 30" /> লিস্ট বানিয়ে দুইবার remove চালাব: একবার মাঝের node,
    একবার head।
  </>,
  <>
    <C t="new LinkedList()" />: খালি লিস্ট, <C t="head = null" />।
  </>,
  <>
    তিনবার <C t="append" /> চালিয়ে <C t="10 -> 20 -> 30" /> বানালাম। append-এর ভেতরের হাঁটা
    আগের পেজে দেখে এসেছ।
  </>,
  <>
    <C t="print()" />: লিস্ট ঠিকঠাক আছে। এবার <C t="remove(20)" /> ডাকি।
  </>,
  <>
    লুপের শর্ত দেখো: current-এর <C t="next.value" />-ই 20, মানে লুপে ঢোকার আগেই থামো। current
    দাঁড়াল টার্গেটের আগের node-এ, এই থামার জায়গাটাই সব।
  </>,
  <>
    <C t="current.next = current.next.next" />: 10-এর তীর এখন 20-কে লাফ দিয়ে সরাসরি 30-কে
    দেখায়। 20 নিজে অক্ষতই আছে, শুধু আর কেউ তাকে চেনে না।
  </>,
  <>
    শৃঙ্খল থেকে বাদ, <C t="size--" /> = 2। মেমরি পরিষ্কারের ঝামেলা garbage collector-এর, আমাদের
    কিছু করতে হয় না।
  </>,
  <>
    <C t="print()" />: <C t="10 -> 30 -> null" />। মাঝের node মুছতে খোঁজার হাঁটা <C t="O(n)" />,
    আসল rewiring <C t="O(1)" />।
  </>,
  <>
    এবার <C t="remove(10)" />। <C t="head.value === 10" /> মিলে গেল, মানে টার্গেটই head।
    head-এর আগে কেউ নেই, তাই কেসটা আলাদা।
  </>,
  <>
    <C t="this.head = this.head.next" />: লেবেলটাই সরে গেল 30-এ। একটাই pointer বদল, লুপ একদম
    শুন্য, তাই head deletion <C t="O(1)" />।
  </>,
  <>
    <C t="print()" />: <C t="30 -> null" />। মনে রাখো: মুছার আসল কাজ pointer ঘোরানো, দাম পড়ে
    খোঁজার হাঁটায়।
  </>,
];

export function DeletionAnim() {
  const { step, playing, toggle, reset, done } = useStepPlayer(DL_TOTAL);

  const nodes: ChainNode[] = [];
  if (step >= 2 && step <= 5) {
    nodes.push({ key: 'n10', value: 10, tone: step === 2 ? 'new' : 'default' });
    nodes.push({
      key: 'n20',
      value: 20,
      tone: step === 2 ? 'new' : step === 4 || step === 5 ? 'leaving' : 'default',
    });
    nodes.push({ key: 'n30', value: 30, tone: step === 2 ? 'new' : 'default' });
  } else if (step >= 6 && step <= 8) {
    nodes.push({ key: 'n10', value: 10, tone: step === 8 ? 'leaving' : 'default' });
    nodes.push({ key: 'n30', value: 30 });
  } else if (step >= 9) {
    nodes.push({ key: 'n30', value: 30 });
  }

  const gaps: Gap[] =
    step >= 2 && step <= 4
      ? [
          { on: true, fresh: step === 2 },
          { on: true, fresh: step === 2 },
        ]
      : step === 5
        ? [{ on: false }, { on: true }]
        : step >= 6 && step <= 8
          ? [{ on: true, fresh: step === 6 }]
          : [];

  const bubbles: Record<number, { expr: string; res: boolean | null }> = {};
  if (step === 4) bubbles[3] = { expr: 'next.value !== 20', res: false };
  if (step === 8) bubbles[5] = { expr: 'head.value === 10', res: true };

  const consoleLines =
    step >= 10
      ? ['10 -> 20 -> 30 -> null', '10 -> 30 -> null', '30 -> null']
      : step >= 7
        ? ['10 -> 20 -> 30 -> null', '10 -> 30 -> null']
        : step >= 3
          ? ['10 -> 20 -> 30 -> null']
          : [];

  return (
    <Stage
      title="node মোছা: pointer বাইপাস"
      step={step}
      total={DL_TOTAL}
      playing={playing}
      done={done}
      onToggle={toggle}
      onReset={reset}
      caption={DL_CAPTIONS[step]}
      consoleLines={consoleLines}
      viz={
        <Chain
          prefix="dl"
          nodes={nodes}
          gaps={gaps}
          headIdx={step >= 2 ? 0 : null}
          curIdx={step === 4 || step === 5 ? 0 : null}
          arc={step === 5 ? { from: 0, to: 2, fresh: true } : null}
          empty={
            <span className="flex flex-wrap items-center justify-center gap-2">
              <HeadChip />
              <span className="text-zinc-300">→</span>
              <NullChip />
              <span className="basis-full pt-1 text-[12px]">খালি লিস্ট: head = null</span>
            </span>
          }
        />
      }
      lines={DL_CODE.map((code, i) => (
        <Line
          key={i}
          n={i + 1}
          code={code}
          cursorId="ll-dl"
          active={DL_CURSOR[step] === i}
          bubble={bubbles[i]}
          tag={
            i === 3 ? (
              <Cost t="O(n)" warm on={step >= 6} />
            ) : i === 5 ? (
              <Cost t="O(1)" on={step >= 9} />
            ) : undefined
          }
        />
      ))}
    />
  );
}

/* ================================================================== */
/*  4. doubly-linked-list: tail দিয়ে O(1) append + দুই দিকের হাঁটা      */
/* ================================================================== */

const DB_CODE = [
  'const dll = new DoublyLinkedList();',
  'dll.append(10);',
  'dll.append(20);',
  'dll.append(30);',
  'dll.printForward();',
  'dll.printBackward();',
];

// 0 idle · 1 new · 2 append10 · 3 append20 prev · 4 append20 next · 5 tail সরল ·
// 6 append30 prev · 7 append30 next · 8 tail সরল · 9 forward · 10 backward
const DB_CURSOR = [-1, 0, 1, 2, 2, 2, 3, 3, 3, 4, 5];
const DB_TOTAL = 10;

const DB_CAPTIONS: ReactNode[] = [
  <>
    প্লে চাপলে doubly linked list-এ তিনবার <C t="append" /> চালাব। <C t="tail" /> pointer
    থাকায় কোনো হাঁটাই লাগে না, সেটাই দেখো।
  </>,
  <>
    <C t="new DoublyLinkedList()" />: <C t="head" /> আর <C t="tail" /> দুটোই null।
  </>,
  <>
    <C t="append(10)" />: খালি লিস্ট, তাই প্রথম node-ই একসাথে head আর tail।
  </>,
  <>
    <C t="append(20)" />, ধাপ ১: <C t="node.prev = this.tail" />। নতুন node-এর পেছনের তীর
    10-কে দেখাল।
  </>,
  <>
    ধাপ ২: <C t="this.tail.next = node" />। 10-এর সামনের তীর 20-কে দেখাল। দুই দিকের তীরই জুড়ল।
  </>,
  <>
    ধাপ ৩: <C t="this.tail = node" />। tail লেবেল সরে এলো 20-এ। তিনটা pointer বদল, হাঁটা শুন্য:{' '}
    <C t="O(1)" />।
  </>,
  <>
    <C t="append(30)" />, ধাপ ১: নতুন node-এর <C t="prev" /> আগের tail (20)-কে দেখাল।
  </>,
  <>
    ধাপ ২: 20-এর <C t="next" /> এখন 30-কে দেখায়।
  </>,
  <>
    ধাপ ৩: <C t="tail" /> সরে গেল 30-এ। singly-তে এই একই append-এ পুরো লিস্ট হাঁটা লাগত।
  </>,
  <>
    <C t="printForward()" />: head থেকে <C t="next" /> ধরে সামনে।
  </>,
  <>
    <C t="printBackward()" />: tail থেকে <C t="prev" /> ধরে পেছনে। একই লিস্ট, দুই দিকের হাঁটা, এই
    ছকই ব্রাউজারের Back/Forward বাটনে।
  </>,
];

export function DoublyLinkedListAnim() {
  const { step, playing, toggle, reset, done } = useStepPlayer(DB_TOTAL);

  const nodes: ChainNode[] = [];
  if (step >= 2) nodes.push({ key: 'n10', value: 10, tone: step === 2 ? 'new' : 'default' });
  if (step >= 3) nodes.push({ key: 'n20', value: 20, tone: step === 3 ? 'new' : 'default' });
  if (step >= 6) nodes.push({ key: 'n30', value: 30, tone: step === 6 ? 'new' : 'default' });

  const gaps: Gap[] = [];
  if (step >= 3) gaps.push({ on: step >= 4, fresh: step === 4, back: true, backFresh: step === 3 });
  if (step >= 6) gaps.push({ on: step >= 7, fresh: step === 7, back: true, backFresh: step === 6 });

  const tailIdx = step < 2 ? null : step <= 4 ? 0 : step <= 7 ? 1 : 2;

  const consoleLines =
    step >= 10
      ? ['10 <-> 20 <-> 30', '30 <-> 20 <-> 10']
      : step >= 9
        ? ['10 <-> 20 <-> 30']
        : [];

  return (
    <Stage
      title="doubly list: দুই দিকের তীর"
      step={step}
      total={DB_TOTAL}
      playing={playing}
      done={done}
      onToggle={toggle}
      onReset={reset}
      caption={DB_CAPTIONS[step]}
      consoleLines={consoleLines}
      viz={
        <Chain
          prefix="db"
          nodes={nodes}
          gaps={gaps}
          double
          headIdx={step >= 2 ? 0 : null}
          tailIdx={tailIdx}
          empty={
            <span className="flex flex-wrap items-center justify-center gap-2">
              <HeadChip />
              <TailChip />
              <span className="text-zinc-300">→</span>
              <NullChip />
              <span className="basis-full pt-1 text-[12px]">
                খালি লিস্ট: head আর tail দুটোই null
              </span>
            </span>
          }
        />
      }
      lines={DB_CODE.map((code, i) => (
        <Line
          key={i}
          n={i + 1}
          code={code}
          cursorId="ll-db"
          active={DB_CURSOR[step] === i}
          tag={
            i === 1 ? (
              <Cost t="O(1)" on={step >= 2} />
            ) : i === 2 ? (
              <Cost t="O(1)" on={step >= 5} />
            ) : i === 3 ? (
              <Cost t="O(1)" on={step >= 8} />
            ) : undefined
          }
        />
      ))}
    />
  );
}

/* ================================================================== */
/*  5. circular-linked-list: বৃত্ত + থামার শর্ত                          */
/* ================================================================== */

const CR_CODE = [
  'const cll = new CircularList();',
  'cll.append(10);',
  'cll.append(20);',
  'cll.append(30);',
  'cll.printOnce();',
];

// 0 idle · 1 new · 2 append10 self-loop · 3 append20 শেষ খোঁজা · 4 append20 জোড়া ·
// 5 append30 খোঁজা · 6 append30 জোড়া · 7 print 10 · 8 print 20 · 9 print 30 · 10 ফিরে head
const CR_CURSOR = [-1, 0, 1, 2, 2, 3, 3, 4, 4, 4, 4];
const CR_TOTAL = 10;

const CR_CAPTIONS: ReactNode[] = [
  <>
    প্লে চাপলে circular list-এ তিনবার <C t="append" /> করে এক পাক ঘুরে ছাপাব। দেখো থামার শর্তটা
    কীভাবে বানাতে হয়।
  </>,
  <>
    <C t="new CircularList()" />: <C t="head = null" />।
  </>,
  <>
    <C t="append(10)" />: খালি লিস্টে প্রথম node নিজেকেই দেখায়: <C t="node.next = node" />। এক
    node-এর লিস্টও পূর্ণ বৃত্ত।
  </>,
  <>
    <C t="append(20)" />: আগে শেষ node খুঁজি। এখানে null খোঁজা যায় না, খুঁজি যার next আবার
    head। 10-এর next তো head নিজে, মানে 10-ই শেষ।
  </>,
  <>
    দুটো তীর ঠিক করি: 10-এর next এখন 20, আর 20-এর next আবার head। বৃত্ত সম্পূর্ণ।
  </>,
  <>
    <C t="append(30)" />: 10-এ চেক, পরেরটা 20, head নয়, এগোই। 20-এ এসে চেক, পরেরটা আবার head,
    থামো।
  </>,
  <>
    আবার দুটো তীর: 20-এর next 30, 30-এর next head।
  </>,
  <>
    <C t="printOnce()" />: <C t="do...while" /> আগে একবার চালায়, তারপর শর্ত দেখে। while দিলে c
    শুরুতেই head, লুপ একবারও ঘুরত না। 10 ছাপলো।
  </>,
  <>
    <C t="c = c.next" />: 20 ছাপলো।
  </>,
  <>
    আরেক ধাপ: 30 ছাপলো।
  </>,
  <>
    <C t="c = c.next" /> করতেই আবার head-এ ফিরে এলাম। শর্ত মিথ্যে, থামো। এখানে null বলে কেউ নেই,
    তাই এই থামার শর্তটাই সব, ভুল হলে চিরকালের লুপ।
  </>,
];

export function CircularLinkedListAnim() {
  const { step, playing, toggle, reset, done } = useStepPlayer(CR_TOTAL);

  const nodes: ChainNode[] = [];
  if (step >= 2)
    nodes.push({ key: 'n10', value: 10, tone: step === 2 ? 'new' : step === 7 ? 'walk' : 'default' });
  if (step >= 4)
    nodes.push({ key: 'n20', value: 20, tone: step === 4 ? 'new' : step === 8 ? 'walk' : 'default' });
  if (step >= 6)
    nodes.push({ key: 'n30', value: 30, tone: step === 6 ? 'new' : step === 9 ? 'walk' : 'default' });

  const gaps: Gap[] = [];
  if (step >= 4) gaps.push({ on: true, fresh: step === 4 });
  if (step >= 6) gaps.push({ on: true, fresh: step === 6 });

  const arc =
    step < 2
      ? null
      : step <= 3
        ? { from: 0, to: 0, fresh: step === 2 }
        : step <= 5
          ? { from: 1, to: 0, fresh: step === 4 }
          : { from: 2, to: 0, fresh: step === 6 };

  const curIdx: number | 'null' | null =
    step === 3
      ? 0
      : step === 5
        ? 1
        : step === 7
          ? 0
          : step === 8
            ? 1
            : step === 9
              ? 2
              : step === 10
                ? 0
                : null;

  const bubbles: Record<number, { expr: string; res: boolean | null }> = {};
  if (step === 3) bubbles[2] = { expr: 'c.next !== head', res: false };
  if (step === 5) bubbles[3] = { expr: 'c.next !== head', res: false };
  if (step === 10) bubbles[4] = { expr: 'c !== head', res: false };

  const consoleLines =
    step >= 10
      ? ['10 -> 20 -> 30 -> (back to head)']
      : step === 9
        ? ['10 -> 20 -> 30']
        : step === 8
          ? ['10 -> 20']
          : step === 7
            ? ['10']
            : [];

  return (
    <Stage
      title="circular list: বৃত্তে এক পাক"
      step={step}
      total={CR_TOTAL}
      playing={playing}
      done={done}
      onToggle={toggle}
      onReset={reset}
      caption={CR_CAPTIONS[step]}
      consoleLines={consoleLines}
      viz={
        <Chain
          prefix="cr"
          nodes={nodes}
          gaps={gaps}
          arc={arc}
          headIdx={step >= 2 ? 0 : null}
          curIdx={curIdx}
          curLabel="c"
          nullAtEnd={false}
          empty={
            <span className="flex flex-wrap items-center justify-center gap-2">
              <HeadChip />
              <span className="text-zinc-300">→</span>
              <NullChip />
              <span className="basis-full pt-1 text-[12px]">খালি লিস্ট: head = null</span>
            </span>
          }
        />
      }
      lines={CR_CODE.map((code, i) => (
        <Line
          key={i}
          n={i + 1}
          code={code}
          cursorId="ll-cr"
          active={CR_CURSOR[step] === i}
          bubble={bubbles[i]}
        />
      ))}
    />
  );
}

/* ================================================================== */
/*  6. array-vs-linked-list: একই কাজ, দুই দাম                           */
/* ================================================================== */

const AV_CODE = [
  'const arr = [2, 3, 4];',
  'arr.unshift(1);',
  'const head = { value: 2,',
  '  next: { value: 3,',
  '    next: { value: 4, next: null } } };',
  'const newHead = { value: 1, next: head };',
  'console.log(arr[2]);',
  'console.log(newHead.next.next.value);',
];

// 0 idle · 1 arr তৈরি · 2 unshift সরানো · 3 unshift শেষ · 4 chain তৈরি ·
// 5 newHead জোড়া · 6 arr[2] লাফ · 7 হাঁটা ধাপ ১ · 8 হাঁটা ধাপ ২ · 9 হিসাব
const AV_CURSOR = [-1, 0, 1, 1, 2, 5, 6, 7, 7, -1];
const AV_TOTAL = 9;

const AV_CAPTIONS: ReactNode[] = [
  <>
    প্লে চাপলে একই দুটো কাজ দুই কাঠামোয় চালাব: আগে শুরুতে 1 ঢোকানো, তারপর তৃতীয় উপাদান পড়া। ধাপ
    গুনে দেখো কোনটায় কত দাম।
  </>,
  <>
    array তৈরি: <C t="[2, 3, 4]" />, সব ঘর পাশাপাশি।
  </>,
  <>
    <C t="unshift(1)" />: শুরুতে জায়গা বানাতে 4, 3, 2 সবাইকে এক ঘর ডানে সরাতে হবে।
  </>,
  <>
    সবাই সরে গেল, 1 বসল শুরুতে। n টা ঘর সরল, তাই <C t="O(n)" />।
  </>,
  <>
    linked list: <C t="2 -> 3 -> 4" />। ঘরগুলো ছড়ানো, জোড় শুধু pointer-এ।
  </>,
  <>
    <C t="newHead = { value: 1, next: head }" />: নতুন node পুরনো head-কে দেখাল, ব্যস। কাউকে
    সরাতে হয়নি, দুটো pointer বদল: <C t="O(1)" />।
  </>,
  <>
    <C t="arr[2]" />: address হিসাব করে সরাসরি লাফ, ফল 3। <C t="O(1)" />।
  </>,
  <>
    <C t="newHead.next.next" />: এখানে লাফানোর ছক নেই, হেঁটে যেতে হয়। প্রথম ধাপে 2-এ এলাম।
  </>,
  <>
    দ্বিতীয় ধাপে 3-এ। ফল একই 3, কিন্তু i-তমটার জন্য i ধাপ হাঁটা: <C t="O(n)" />।
  </>,
  <>
    হিসাব পরিষ্কার: শুরুতে insert-এ list জেতে (১ ধাপ বনাম ৩ ধাপ), index access-এ array জেতে (১ ধাপ
    বনাম ২ ধাপ)। বেশি যেটা করবে, সেটা দেখেই কাঠামো বাছো।
  </>,
];

function AvBlocks({ step }: { step: number }) {
  const vals = step < 1 ? [] : step < 3 ? [2, 3, 4] : [1, 2, 3, 4];
  if (vals.length === 0) {
    return (
      <div className="flex h-[62px] items-center text-[13px] text-zinc-400">
        array-এর ঘরগুলো এখানে পাশাপাশি বসবে
      </div>
    );
  }
  const tone = (v: number): string => {
    if (step === 2) return 'border-amber-400 bg-amber-50 text-amber-700';
    if (step === 3 && v === 1) return 'border-emerald-400 bg-emerald-50 text-emerald-700';
    if (step >= 6 && v === 3) return 'border-emerald-400 bg-emerald-50 text-emerald-700';
    return 'border-zinc-300 bg-white text-zinc-800';
  };
  return (
    <div className="flex h-[62px] items-start gap-2">
      <AnimatePresence mode="popLayout">
        {vals.map((v, i) => (
          <motion.div
            key={v}
            layout
            initial={{ opacity: 0, scale: 0.5, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 12 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            className="flex w-10 shrink-0 flex-col items-center gap-1"
          >
            <div
              className={`flex size-10 items-center justify-center rounded-lg border-2 font-mono text-sm font-semibold transition-colors duration-300 ${tone(v)}`}
            >
              {v}
            </div>
            <span className="select-none font-mono text-[10px] text-zinc-400">{i}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function AvViz({ step }: { step: number }) {
  const nodes: ChainNode[] = [];
  if (step === 4) {
    nodes.push({ key: 'v2', value: 2 }, { key: 'v3', value: 3 }, { key: 'v4', value: 4 });
  } else if (step >= 5) {
    nodes.push(
      { key: 'v1', value: 1, tone: step === 5 ? 'new' : 'default' },
      { key: 'v2', value: 2 },
      { key: 'v3', value: 3, tone: step === 8 ? 'new' : 'default' },
      { key: 'v4', value: 4 },
    );
  }
  const gaps: Gap[] =
    step === 4
      ? [{ on: true }, { on: true }]
      : step >= 5
        ? [{ on: true, fresh: step === 5 }, { on: true }, { on: true }]
        : [];
  const headIdx = step === 4 ? 0 : step >= 5 ? 1 : null;
  const curIdx: number | 'null' | null = step === 7 ? 1 : step === 8 ? 2 : null;
  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50/80 px-4 py-4">
      <div className="text-[11px] font-medium uppercase tracking-widest text-zinc-400">array</div>
      <AvBlocks step={step} />
      <div className="mt-2 border-t border-dashed border-zinc-200 pt-3 text-[11px] font-medium uppercase tracking-widest text-zinc-400">
        linked list
      </div>
      <Chain
        bare
        prefix="av"
        nodes={nodes}
        gaps={gaps}
        headIdx={headIdx}
        curIdx={curIdx}
        extraChip={step >= 5 ? { idx: 0, t: 'newHead' } : null}
        empty="linked list-এর node-গুলো এখানে জুড়বে"
      />
    </div>
  );
}

export function ArrayVsLinkedListAnim() {
  const { step, playing, toggle, reset, done } = useStepPlayer(AV_TOTAL);
  const consoleLines = step >= 8 ? ['3', '3'] : step >= 6 ? ['3'] : [];
  return (
    <Stage
      title="একই কাজ, দুই কাঠামো"
      step={step}
      total={AV_TOTAL}
      playing={playing}
      done={done}
      onToggle={toggle}
      onReset={reset}
      caption={AV_CAPTIONS[step]}
      consoleLines={consoleLines}
      viz={<AvViz step={step} />}
      lines={AV_CODE.map((code, i) => (
        <Line
          key={i}
          n={i + 1}
          code={code}
          cursorId="ll-av"
          active={AV_CURSOR[step] === i}
          tag={
            i === 1 ? (
              <Cost t="O(n)" warm on={step >= 3} />
            ) : i === 5 ? (
              <Cost t="O(1)" on={step >= 5} />
            ) : i === 6 ? (
              <Cost t="O(1)" on={step >= 6} />
            ) : i === 7 ? (
              <Cost t="O(n)" warm on={step >= 8} />
            ) : undefined
          }
        />
      ))}
    />
  );
}
