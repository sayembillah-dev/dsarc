'use client';

import type { ReactNode } from 'react';
import { C, Line, Stage, useStepPlayer } from './control-flow';

/* ------------------------------ for loop ------------------------------ */

const FOR_CODE = ['for (let i = 0; i < 5; i++) {', '  console.log("i =", i);', '}'];

// step: 0 idle · 1 init · 2 check · 3 body · 4 update+check · 5 body · ... · 12 last check false · 13 done
const FOR_CURSOR = [-1, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, -1];
const FOR_TOTAL = 13;

const FOR_CAPTIONS: ReactNode[] = [
  <>
    প্লে চাপলে <C t="i" /> কীভাবে 0 থেকে 4 পর্যন্ত ঘুরে আসে, লাইনে লাইনে দেখো।
  </>,
  <>
    শুরু: <C t="let i = 0" /> বসল।
  </>,
  <>
    শর্ত চেক: <C t="0 < 5 → true" />, ভেতরে ঢুকো।
  </>,
  <>
    <C t="console.log" /> চলল, কনসোলে <C t="i = 0" />।
  </>,
  <>
    <C t="i++" /> করে <C t="i = 1" />, শর্ত <C t="1 < 5 → true" />।
  </>,
  <>
    কনসোলে <C t="i = 1" />।
  </>,
  <>
    <C t="i++" /> করে <C t="i = 2" />, শর্ত <C t="2 < 5 → true" />।
  </>,
  <>
    কনসোলে <C t="i = 2" />।
  </>,
  <>
    <C t="i++" /> করে <C t="i = 3" />, শর্ত <C t="3 < 5 → true" />।
  </>,
  <>
    কনসোলে <C t="i = 3" />।
  </>,
  <>
    <C t="i++" /> করে <C t="i = 4" />, শর্ত <C t="4 < 5 → true" />।
  </>,
  <>
    কনসোলে <C t="i = 4" />।
  </>,
  <>
    <C t="i++" /> করে <C t="i = 5" />, কিন্তু এবার <C t="5 < 5 → false" />।
  </>,
  <>
    শর্ত false, loop শেষ। মোট <C t="5" /> বার ঘুরল।
  </>,
];

function forBubble(step: number): { expr: string; res: boolean | null } | undefined {
  if (step >= 12) return { expr: 'i = 5 · 5 < 5', res: false };
  if (step >= 10) return { expr: 'i = 4 · 4 < 5', res: true };
  if (step >= 8) return { expr: 'i = 3 · 3 < 5', res: true };
  if (step >= 6) return { expr: 'i = 2 · 2 < 5', res: true };
  if (step >= 4) return { expr: 'i = 1 · 1 < 5', res: true };
  if (step >= 2) return { expr: '0 < 5', res: true };
  if (step >= 1) return { expr: 'let i = 0', res: null };
  return undefined;
}

export function ForLoopAnim() {
  const { step, playing, toggle, reset, done } = useStepPlayer(FOR_TOTAL);
  const consoleLines: string[] = [];
  if (step >= 3) consoleLines.push('i = 0');
  if (step >= 5) consoleLines.push('i = 1');
  if (step >= 7) consoleLines.push('i = 2');
  if (step >= 9) consoleLines.push('i = 3');
  if (step >= 11) consoleLines.push('i = 4');

  return (
    <Stage
      title="for loop"
      step={step}
      total={FOR_TOTAL}
      playing={playing}
      done={done}
      onToggle={toggle}
      onReset={reset}
      caption={FOR_CAPTIONS[step]}
      consoleLines={consoleLines}
      lines={FOR_CODE.map((code, i) => (
        <Line
          key={i}
          n={i + 1}
          code={code}
          cursorId="for-cursor"
          active={FOR_CURSOR[step] === i}
          bubble={i === 0 ? forBubble(step) : undefined}
          taken={step >= 13 && i === 2}
        />
      ))}
    />
  );
}

/* ------------------------------ while loop ------------------------------ */

const WHILE_CODE = [
  'let n = 8;',
  'while (n > 1) {',
  '  n = Math.floor(n / 2);',
  '  console.log(n);',
  '}',
];

// step: 0 idle · 1 init · 2 check · 3 halve · 4 print · 5 check · 6 halve · 7 print · 8 check · 9 halve · 10 print · 11 check false · 12 done
const WHILE_CURSOR = [-1, 0, 1, 2, 3, 1, 2, 3, 1, 2, 3, 1, -1];
const WHILE_TOTAL = 12;

const WHILE_CAPTIONS: ReactNode[] = [
  <>
    প্লে চাপলে <C t="n" /> অর্ধেক হয়ে 1-এ পৌঁছানো পর্যন্ত loop ঘুরবে।
  </>,
  <>
    শুরু: <C t="n = 8" /> বসল।
  </>,
  <>
    শর্ত চেক: <C t="8 > 1 → true" />, ভেতরে ঢুকো।
  </>,
  <>
    <C t="n" /> অর্ধেক হলো: <C t="n = 4" />।
  </>,
  <>
    কনসোলে <C t="4" /> ছাপা হলো।
  </>,
  <>
    আবার শর্ত চেক: <C t="4 > 1 → true" />।
  </>,
  <>
    <C t="n = 2" />।
  </>,
  <>
    কনসোলে <C t="2" /> ছাপা হলো।
  </>,
  <>
    আবার শর্ত চেক: <C t="2 > 1 → true" />।
  </>,
  <>
    <C t="n = 1" />।
  </>,
  <>
    কনসোলে <C t="1" /> ছাপা হলো।
  </>,
  <>
    এবার শর্ত <C t="1 > 1 → false" />।
  </>,
  <>
    শর্ত false, loop শেষ। প্রতিবার <C t="n" /> অর্ধেক হয়ে 8 থেকে 1-এ নেমেছে।
  </>,
];

function whileCondBubble(step: number): { expr: string; res: boolean | null } | undefined {
  if (step >= 11) return { expr: '1 > 1', res: false };
  if (step >= 8) return { expr: '2 > 1', res: true };
  if (step >= 5) return { expr: '4 > 1', res: true };
  if (step >= 2) return { expr: '8 > 1', res: true };
  return undefined;
}

function whileHalveBubble(step: number): { expr: string; res: boolean | null } | undefined {
  if (step >= 9) return { expr: 'n = 1', res: null };
  if (step >= 6) return { expr: 'n = 2', res: null };
  if (step >= 3) return { expr: 'n = 4', res: null };
  return undefined;
}

export function WhileLoopAnim() {
  const { step, playing, toggle, reset, done } = useStepPlayer(WHILE_TOTAL);
  const consoleLines: string[] = [];
  if (step >= 4) consoleLines.push('4');
  if (step >= 7) consoleLines.push('2');
  if (step >= 10) consoleLines.push('1');

  return (
    <Stage
      title="while loop"
      step={step}
      total={WHILE_TOTAL}
      playing={playing}
      done={done}
      onToggle={toggle}
      onReset={reset}
      caption={WHILE_CAPTIONS[step]}
      consoleLines={consoleLines}
      lines={WHILE_CODE.map((code, i) => (
        <Line
          key={i}
          n={i + 1}
          code={code}
          cursorId="while-cursor"
          active={WHILE_CURSOR[step] === i}
          bubble={
            i === 0
              ? step >= 1
                ? { expr: 'n = 8', res: null }
                : undefined
              : i === 1
                ? whileCondBubble(step)
                : i === 2
                  ? whileHalveBubble(step)
                  : undefined
          }
          taken={step >= 12 && i === 4}
        />
      ))}
    />
  );
}
