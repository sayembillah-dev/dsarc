'use client';

import type { ReactNode } from 'react';
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
  const { step, playing, toggle, reset, done } = useStepPlayer(FN_TOTAL);
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

/* ------------------------------ array ops ------------------------------ */

const AR_CODE = ['const nums = [10, 20, 30];', 'nums.push(40);', 'nums.pop();'];

// 0 idle · 1 init · 2 push · 3 state · 4 pop · 5 state · 6 done
const AR_CURSOR = [-1, 0, 1, 0, 2, 0, -1];
const AR_TOTAL = 6;

const AR_CAPTIONS: ReactNode[] = [
  <>
    প্লে চাপলে <C t="push" /> আর <C t="pop" /> array-কে কীভাবে বদলায় দেখো।
  </>,
  <>
    <C t="nums = [10, 20, 30]" /> তৈরি হলো।
  </>,
  <>
    <C t="push(40)" /> : শেষে <C t="40" /> ঢুকছে।
  </>,
  <>
    এখন <C t="nums = [10, 20, 30, 40]" />।
  </>,
  <>
    <C t="pop()" /> : শেষেরটা বাদ।
  </>,
  <>
    আবার <C t="nums = [10, 20, 30]" />।
  </>,
  <>
    শেষ। <C t="push" /> শেষে যোগ করে, <C t="pop" /> শেষ থেকে বাদ দেয়। দুটোই O(1)।
  </>,
];

function arBubble(step: number): { expr: string; res: boolean | null } | undefined {
  if (step >= 5) return { expr: '[10, 20, 30]', res: null };
  if (step >= 3) return { expr: '[10, 20, 30, 40]', res: null };
  if (step >= 1) return { expr: '[10, 20, 30]', res: null };
  return undefined;
}

export function ArrayOpsAnim() {
  const { step, playing, toggle, reset, done } = useStepPlayer(AR_TOTAL);
  return (
    <Stage
      title="array অপারেশন"
      step={step}
      total={AR_TOTAL}
      playing={playing}
      done={done}
      onToggle={toggle}
      onReset={reset}
      caption={AR_CAPTIONS[step]}
      consoleLines={[]}
      lines={AR_CODE.map((code, i) => (
        <Line
          key={i}
          n={i + 1}
          code={code}
          cursorId="ar-cursor"
          active={AR_CURSOR[step] === i}
          bubble={i === 0 ? arBubble(step) : undefined}
        />
      ))}
    />
  );
}

/* ------------------------------ OOP ------------------------------ */

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

// 0 idle · 1 new · 2 ctor · 3 this.name · 4 this.roll · 5 s1 ready · 6 call · 7 enter method · 8 return · 9 back · 10 print
const OOP_CURSOR = [-1, 9, 1, 2, 3, 9, 10, 5, 6, 10, -1];
const OOP_TOTAL = 10;

const OOP_CAPTIONS: ReactNode[] = [
  <>
    প্লে চাপলে <C t="new Student(...)" /> থেকে object তৈরি হয়ে method চালানো পর্যন্ত দেখো।
  </>,
  <>
    <C t='new Student("Rahim", 5)' /> ডাকা হলো।
  </>,
  <>
    আগে <C t="constructor" /> চলে: <C t='name = "Rahim", roll = 5' />।
  </>,
  <>
    <C t='this.name = "Rahim"' /> বসল।
  </>,
  <>
    <C t="this.roll = 5" /> বসল। object প্রস্তুত।
  </>,
  <>
    <C t="s1" /> এখন পূর্ণাঙ্গ object।
  </>,
  <>
    <C t="s1.introduce()" /> ডাকা হলো।
  </>,
  <>
    method-এর ভেতরে ঢুকল।
  </>,
  <>
    <C t="return" /> হবে: <C t="আমি Rahim, roll 5" />।
  </>,
  <>
    ফলাফল ফিরে এলো ডাকার জায়গায়।
  </>,
  <>
    কনসোলে <C t="আমি Rahim, roll 5" />। class থেকে object, object থেকে কাজ।
  </>,
];

export function OopAnim() {
  const { step, playing, toggle, reset, done } = useStepPlayer(OOP_TOTAL);
  const ctor = step >= 2 && step < 5 ? { expr: 'name = "Rahim", roll = 5', res: null } : undefined;
  const s1 =
    step >= 5
      ? { expr: 's1 = Student { name: "Rahim", roll: 5 }', res: true }
      : step >= 1
        ? { expr: 'new Student("Rahim", 5)', res: null }
        : undefined;
  const ret = step >= 8 ? { expr: 'আমি Rahim, roll 5', res: true } : undefined;
  return (
    <Stage
      title="class থেকে object"
      step={step}
      total={OOP_TOTAL}
      playing={playing}
      done={done}
      onToggle={toggle}
      onReset={reset}
      caption={OOP_CAPTIONS[step]}
      consoleLines={step >= 10 ? ['আমি Rahim, roll 5'] : []}
      lines={OOP_CODE.map((code, i) => (
        <Line
          key={i}
          n={i + 1}
          code={code}
          cursorId="oop-cursor"
          active={OOP_CURSOR[step] === i}
          bubble={i === 1 ? ctor : i === 9 ? s1 : i === 6 ? ret : undefined}
        />
      ))}
    />
  );
}
