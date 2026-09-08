'use client';

import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowDown, ArrowRight } from 'lucide-react';
import { C, Line, Stage, useStepPlayer } from './control-flow';

/* ------------------------------ functions ------------------------------ */

const FN_CODE = [
  'function add(a, b) {',
  '  return a + b;',
  '}',
  'console.log(add(3, 4));',
];

// 0 idle · 1 call · 2 enter(params) · 3 return · 4 back · 5 print
const FN_CURSOR = [-1, 3, 0, 1, 3, 3, -1];
const FN_TOTAL = 6;

const FN_CAPTIONS: ReactNode[] = [
  <>
    প্লে চাপলে <C t="add(3, 4)" /> ডাকা থেকে <C t="7" /> ফেরত আসা পর্যন্ত পুরো যাত্রা দেখো।
  </>,
  <>
    <C t="add(3, 4)" /> ডাকা হলো।
  </>,
  <>
    function-এ ঢুকল। parameter-এ মান বসল: <C t="a = 3, b = 4" />।
  </>,
  <>
    <C t="return 3 + 4" />, মানে <C t="7" /> ফেরত যাবে।
  </>,
  <>
    ফলাফল <C t="7" /> ডাকার জায়গায় ফিরে এলো: <C t="console.log(7)" />।
  </>,
  <>
    কনসোলে <C t="7" /> ছাপা হলো।
  </>,
];

export function FunctionAnim() {
  const { step, playing, toggle, reset, next, prev, done } = useStepPlayer(FN_TOTAL);
  const b0 = step >= 2 && step < 4 ? { expr: 'a = 3, b = 4', res: null } : undefined;
  const b1 = step >= 3 ? { expr: '3 + 4 = 7', res: true } : undefined;
  const b3 =
    step >= 4
      ? { expr: 'add(3, 4) = 7', res: true }
      : step >= 1
        ? { expr: 'add(3, 4)', res: null }
        : undefined;
  return (
    <Stage
      title="function call"
      step={step}
      total={FN_TOTAL}
      playing={playing}
      done={done}
      onToggle={toggle}
      onReset={reset}
      onNext={next}
      onPrev={prev}
      caption={FN_CAPTIONS[step]}
      consoleLines={step >= 5 ? ['7'] : []}
      lines={FN_CODE.map((code, i) => (
        <Line
          key={i}
          n={i + 1}
          code={code}
          cursorId="fn-cursor"
          active={FN_CURSOR[step] === i}
          bubble={i === 0 ? b0 : i === 1 ? b1 : i === 3 ? b3 : undefined}
        />
      ))}
    />
  );
}

/* ------------------------------ array ops (box / block) ------------------------------ */

const AR_CODE = [
  'const nums = [10, 20, 30];',
  'nums.push(40);',
  'nums.pop();',
  'nums.unshift(5);',
  'nums.shift();',
];

// 0 idle · 1 init · 2 push · 3 push done · 4 pop mark · 5 pop done ·
// 6 unshift mark (সবাই সরবে) · 7 unshift done · 8 shift mark · 9 shift done · 10 end
const AR_CURSOR = [-1, 0, 1, 1, 2, 2, 3, 3, 4, 4, -1];
const AR_TOTAL = 10;

const AR_VALUES: number[][] = [
  [],
  [10, 20, 30],
  [10, 20, 30, 40],
  [10, 20, 30, 40],
  [10, 20, 30, 40],
  [10, 20, 30],
  [10, 20, 30],
  [5, 10, 20, 30],
  [5, 10, 20, 30],
  [10, 20, 30],
  [10, 20, 30],
];

type Tone = 'default' | 'new' | 'leaving' | 'moving';

function arTone(step: number, v: number): Tone {
  if (step === 2 && v === 40) return 'new';
  if (step === 4 && v === 40) return 'leaving';
  if (step === 6) return 'moving';
  if (step === 7) return v === 5 ? 'new' : 'moving';
  if (step === 8) return v === 5 ? 'leaving' : 'moving';
  return 'default';
}

const AR_TONES: Record<Tone, string> = {
  default: 'border-zinc-300 bg-white text-zinc-800',
  new: 'border-emerald-400 bg-emerald-50 text-emerald-700',
  leaving: 'border-rose-400 bg-rose-50 text-rose-600',
  moving: 'border-amber-400 bg-amber-50 text-amber-700',
};

const AR_CAPTIONS: ReactNode[] = [
  <>
    প্লে চাপলে <C t="push" />, <C t="pop" />, <C t="unshift" />, <C t="shift" /> চারটা অপারেশনে{' '}
    <C t="nums" /> কীভাবে বদলায়, ঘরে ঘরে দেখো।
  </>,
  <>
    <C t="nums = [10, 20, 30]" /> তৈরি হলো, তিনটা ঘর পাশাপাশি বসল।
  </>,
  <>
    <C t="push(40)" /> : শেষ প্রান্তে নতুন ঘর <C t="40" /> ঢুকল।
  </>,
  <>
    এখন <C t="[10, 20, 30, 40]" />। শুধু শেষে কাজ হলো, বাকি ঘরগুলো অটল, তাই <C t="O(1)" />।
  </>,
  <>
    <C t="pop()" /> : শেষের ঘর <C t="40" /> বাদ যাচ্ছে।
  </>,
  <>
    আবার <C t="[10, 20, 30]" />। এটাও শুধু শেষ প্রান্তের কাজ, <C t="O(1)" />।
  </>,
  <>
    <C t="unshift(5)" /> : শুরুতে জায়গা বানাতে এবার সবাইকে এক ঘর ডানে সরাতে হবে।
  </>,
  <>
    সবাই সরে গেল, <C t="5" /> বসল শুরুতে: <C t="[5, 10, 20, 30]" />। n টা ঘর সরল, তাই{' '}
    <C t="O(n)" />।
  </>,
  <>
    <C t="shift()" /> : শুরুর ঘর <C t="5" /> বাদ, বাকিগুলোকে এক ঘর বামে সরাতে হবে।
  </>,
  <>
    আবার <C t="[10, 20, 30]" />। এখানেও সবাইকে সরাতে হলো, তাই <C t="O(n)" />।
  </>,
  <>
    মনে রাখো: <C t="push/pop" /> শেষ প্রান্তে কাজ করে <C t="O(1)" />, আর <C t="unshift/shift" />{' '}
    সবাইকে সরায় <C t="O(n)" />।
  </>,
];

function BigO({ t, on, warm }: { t: string; on: boolean; warm?: boolean }) {
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

function ArrayBlocks({ step }: { step: number }) {
  const values = AR_VALUES[step];
  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50/80 px-4 py-5">
      {values.length === 0 ? (
        <div className="flex h-[76px] items-center justify-center text-[13px] text-zinc-400">
          প্লে চাপলে nums-এর ঘরগুলো এখানে জমা হবে
        </div>
      ) : (
        <div className="flex h-[76px] items-start justify-center gap-3">
          <span className="mt-3 select-none font-mono text-sm text-zinc-400">nums =</span>
          <AnimatePresence mode="popLayout">
            {values.map((v, i) => (
              <motion.div
                key={v}
                layout
                initial={{ opacity: 0, scale: 0.5, y: -16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5, y: 16 }}
                transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                className="flex w-12 shrink-0 flex-col items-center gap-1"
              >
                <div
                  className={`flex size-12 items-center justify-center rounded-xl border-2 font-mono text-lg font-semibold transition-colors duration-300 ${AR_TONES[arTone(step, v)]}`}
                >
                  {v}
                </div>
                <span className="select-none font-mono text-[11px] text-zinc-400">{i}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

export function ArrayOpsAnim() {
  const { step, playing, toggle, reset, next, prev, done } = useStepPlayer(AR_TOTAL);
  return (
    <Stage
      title="array অপারেশন: ঘরে ঘরে"
      step={step}
      total={AR_TOTAL}
      playing={playing}
      done={done}
      onToggle={toggle}
      onReset={reset}
      onNext={next}
      onPrev={prev}
      caption={AR_CAPTIONS[step]}
      consoleLines={[]}
      hideConsole
      viz={<ArrayBlocks step={step} />}
      lines={AR_CODE.map((code, i) => (
        <Line
          key={i}
          n={i + 1}
          code={code}
          cursorId="ar-cursor"
          active={AR_CURSOR[step] === i}
          tag={
            i === 1 || i === 2 ? (
              <BigO t="O(1)" on={step >= (i === 1 ? 3 : 5)} />
            ) : i === 3 || i === 4 ? (
              <BigO t="O(n)" warm on={step >= (i === 3 ? 7 : 9)} />
            ) : undefined
          }
        />
      ))}
    />
  );
}

/* ------------------------------ OOP (blueprint → object) ------------------------------ */

const OOP_CODE = [
  'class Student {',
  '  constructor(name, roll) {',
  '    this.name = name;',
  '    this.roll = roll;',
  '  }',
  '  introduce() {',
  '    return `আমি ${this.name}, roll ${this.roll}`;',
  '  }',
  '}',
  'const s1 = new Student("Rahim", 5);',
  'console.log(s1.introduce());',
];

// cursor কখনো পেছনে যায় না: উপরে থেকে নিচে এক দিকে।
// call অন্য লাইন চালু করলে সেই লাইন amber হলোয় জ্বলে (running), cursor ডাকের জায়গায়ই থাকে।
// 0 idle · 1 class · 2 ctor · 3 this.name · 4 this.roll · 5 method · 6 return line ·
// 7 class শেষ · 8 new (ctor চলছে) · 9 name বসল · 10 roll বসল · 11 introduce() ডাক · 12 return · 13 print
const OOP_CURSOR = [-1, 0, 1, 2, 3, 5, 6, 8, 9, 9, 9, 10, 10, 10];
const OOP_TOTAL = 13;

const OOP_CAPTIONS: ReactNode[] = [
  <>
    প্লে চাপলে দেখো class (ছাঁচ) থেকে কীভাবে আসল object বানে, আর তার method চলে।
  </>,
  <>
    <C t="class Student" /> মানে একটা ছাঁচ তৈরি হলো। এখনো কোনো object নেই।
  </>,
  <>
    <C t="constructor" /> হলো object বানানোর নিয়ম: <C t="name" /> আর <C t="roll" /> নিয়ে বসাবে।{' '}
    <C t="new" /> ডাকলেই চলবে।
  </>,
  <>
    <C t="this" /> মানে "যে object বানছে ঠিক সেটা"। তার <C t="name" /> বসবে।
  </>,
  <>
    একইভাবে <C t="roll" /> বসবে। বানানোর নিয়ম লেখা শেষ।
  </>,
  <>
    <C t="introduce()" /> হলো method, মানে ভবিষ্যের object-গুলোর নিজের কাজ।
  </>,
  <>
    নিজের <C t="name" /> আর <C t="roll" /> দিয়ে একটা বাক্য <C t="return" /> করবে।
  </>,
  <>
    ছাঁচ সম্পূর্ণ! মনে রাখো: এখনো একটাও object নেই, শুধু নিয়ম লেখা আছে।
  </>,
  <>
    <C t='new Student("Rahim", 5)' /> ডাকতেই constructor চলে গেল (amber লাইন), <C t="s1" /> বানছে।
  </>,
  <>
    <C t='this.name = "Rahim"' /> বসে গেল <C t="s1" />-এ।
  </>,
  <>
    <C t="this.roll = 5" /> বসল। <C t="s1" /> এখন পূর্ণাঙ্গ object!
  </>,
  <>
    <C t="s1.introduce()" /> ডাকল। method-টা <C t="s1" />-এর নিজের ডেটা ব্যবহার করবে।
  </>,
  <>
    এখানে <C t="this" /> মানে <C t="s1" />, তাই বাক্যটা বানল তার নিজের name আর roll দিয়ে।
  </>,
  <>
    কনসোলে <C t="আমি Rahim, roll 5" />। একটা ছাঁচ থেকে যত খুশি object বানানো যায়!
  </>,
];

function oopRunning(step: number, i: number): boolean {
  if (step === 8) return i === 1;
  if (step === 9) return i === 2;
  if (step === 10) return i === 3;
  if (step === 11) return i === 5;
  if (step === 12) return i === 6;
  return false;
}

function OopChip({
  t,
  on,
  running,
}: {
  t: string;
  on: boolean;
  running?: boolean;
}) {
  return (
    <span
      className={`rounded-md border px-2 py-1 font-mono text-[11px] transition-colors duration-500 ${
        running
          ? 'border-amber-300 bg-amber-50 text-amber-700'
          : on
            ? 'border-zinc-300 bg-zinc-50 text-zinc-700'
            : 'border-dashed border-zinc-200 text-zinc-300'
      }`}
    >
      {t}
    </span>
  );
}

function OopViz({ step }: { step: number }) {
  if (step < 1) {
    return (
      <div className="flex h-[132px] items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50/80 px-4 text-center text-[13px] text-zinc-400">
        আগে ছাঁচ (class) বানবে, তারপর সেখান থেকে আসল object
      </div>
    );
  }
  const ctorBusy = step >= 8 && step <= 10;
  const methodBusy = step === 11 || step === 12;
  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50/80 px-4 py-4">
      <div className="flex min-h-[100px] flex-col items-center justify-center gap-3 sm:flex-row sm:gap-5">
        {/* ছাঁচ */}
        <div
          className={`w-full max-w-56 rounded-xl border-2 bg-white p-3 transition-colors duration-500 sm:w-52 ${
            step >= 7 ? 'border-zinc-400' : 'border-dashed border-zinc-300'
          }`}
        >
          <div className="font-mono text-[13px] font-semibold text-zinc-800">class Student</div>
          <div className="mt-0.5 text-[11px] text-zinc-400">ছাঁচ (blueprint)</div>
          <div className="mt-2 flex flex-col gap-1.5">
            <OopChip t="constructor(name, roll)" on={step >= 2} running={ctorBusy} />
            <OopChip t="introduce()" on={step >= 5} running={methodBusy} />
          </div>
        </div>

        {/* new এর তীর */}
        <AnimatePresence>
          {step >= 8 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ type: 'spring', stiffness: 380, damping: 26 }}
              className="flex flex-col items-center gap-0.5 text-emerald-600"
            >
              <ArrowRight className="hidden size-5 sm:block" />
              <ArrowDown className="size-5 sm:hidden" />
              <span className="font-mono text-[11px] font-semibold">new</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* object */}
        <AnimatePresence>
          {step >= 8 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.7, x: -20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ type: 'spring', stiffness: 320, damping: 26 }}
              className="w-full max-w-56 rounded-xl border-2 border-emerald-300 bg-white p-3 shadow-sm sm:w-52"
            >
              <div className="font-mono text-[13px] font-semibold text-emerald-700">
                s1: Student
              </div>
              <div className="mt-0.5 text-[11px] text-zinc-400">আসল object</div>
              <div className="mt-2 flex flex-col gap-1.5 font-mono text-[11px]">
                <div className="flex items-center justify-between rounded-md bg-zinc-50 px-2 py-1">
                  <span className="text-zinc-500">name</span>
                  <span
                    className={`transition-colors duration-500 ${step >= 9 ? 'font-semibold text-zinc-800' : 'text-zinc-300'}`}
                  >
                    {step >= 9 ? '"Rahim"' : '?'}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-md bg-zinc-50 px-2 py-1">
                  <span className="text-zinc-500">roll</span>
                  <span
                    className={`transition-colors duration-500 ${step >= 10 ? 'font-semibold text-zinc-800' : 'text-zinc-300'}`}
                  >
                    {step >= 10 ? '5' : '?'}
                  </span>
                </div>
                <OopChip t="introduce()" on running={methodBusy} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* return মান */}
      <AnimatePresence>
        {step >= 12 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            className="mt-3 flex justify-center"
          >
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 font-mono text-[11px] font-medium text-emerald-700">
              return "আমি Rahim, roll 5"
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function OopAnim() {
  const { step, playing, toggle, reset, next, prev, done } = useStepPlayer(OOP_TOTAL);
  return (
    <Stage
      title="class থেকে object"
      step={step}
      total={OOP_TOTAL}
      playing={playing}
      done={done}
      onToggle={toggle}
      onReset={reset}
      onNext={next}
      onPrev={prev}
      caption={OOP_CAPTIONS[step]}
      consoleLines={step >= 13 ? ['আমি Rahim, roll 5'] : []}
      viz={<OopViz step={step} />}
      lines={OOP_CODE.map((code, i) => (
        <Line
          key={i}
          n={i + 1}
          code={code}
          cursorId="oop-cursor"
          active={OOP_CURSOR[step] === i}
          running={oopRunning(step, i)}
          taken={step >= 13 && i === 10}
        />
      ))}
    />
  );
}
