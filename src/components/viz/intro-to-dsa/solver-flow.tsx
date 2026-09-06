'use client';

import { useEffect, useRef, useState } from 'react';
import { HintLine, Segmented } from '../controls';
import { VIZ } from '../palette';
import { StepPlayer } from '../step-player';
import { useStepPlayer } from '../use-step-player';

type Problem = 'duplicate' | 'palindrome';

interface StepWork {
  title: string;
  lines: string[];
  code?: boolean;
  caption: string;
}

const STEP_LABELS = ['বুঝো', 'উদাহরণ', 'পরিকল্পনা', 'কোড', 'যাচাই'];

const WORK: Record<Problem, StepWork[]> = {
  duplicate: [
    {
      title: 'প্রশ্নটা আগে পরিষ্কার করো',
      lines: [
        'input: [1, 2, 3, 2]  (একটা array)',
        'output: true / false',
        'প্রশ্ন: কোনো মান কি দুইবার এসেছে?',
      ],
      caption: 'ধাপ ১ (বুঝো): প্রশ্ন না বুঝে কোড লিখলে ভুল রাস্তায় যাবে। input, output, আসল প্রশ্ন — তিনটা আগে ঠিক করো।',
    },
    {
      title: 'ছোট একটা উদাহরণ হাতে চালাও',
      lines: [
        'seen = {}  (শুরুতে খালি)',
        '1 → seen-এ নেই, যোগ করো: {1}',
        '2 → নেই, যোগ: {1, 2}',
        '3 → নেই, যোগ: {1, 2, 3}',
        '2 → আগেই seen-এ আছে! উত্তর true',
      ],
      caption: 'ধাপ ২ (উদাহরণ): হাতে চালালে সমাধানের ছাপ নিজে চোখে পড়ে — প্রতিবার দেখা মান জমা রাখলেই duplicate ধরা পড়ে।',
    },
    {
      title: 'পরিকল্পনা লিখে ফেলো (pseudo code)',
      lines: [
        '১) খালি একটা seen সেট বানাও',
        '২) প্রতিটা x-এর জন্য:',
        '৩)    x seen-এ থাকলে → true রিটার্ন',
        '৪)    না থাকলে → seen-এ যোগ করো',
        '৫) লুপ শেষ → false রিটার্ন',
      ],
      caption: 'ধাপ ৩ (পরিকল্পনা): ভাষায় নয়, ধাপে ভাবো। পরিকল্পনা ঠিক থাকলে কোড লেখা প্রায় অনুবাদমাত্র।',
    },
    {
      title: 'এবার JavaScript-এ রূপ দাও',
      code: true,
      lines: [
        'function hasDuplicate(arr) {',
        '  const seen = new Set();',
        '  for (const x of arr) {',
        '    if (seen.has(x)) return true;',
        '    seen.add(x);',
        '  }',
        '  return false;',
        '}',
      ],
      caption: 'ধাপ ৪ (কোড): উপরের ৫টা ধাপ হুবহু বসে গেছে — পরিকল্পনার প্রতিটা লাইনের একটা করে কোড-লাইন।',
    },
    {
      title: 'টেস্ট করো, আর ভালো করা যায় কিনা ভাবো',
      lines: [
        'hasDuplicate([1, 2, 3, 2])  →  true',
        'hasDuplicate([1, 2, 3])     →  false',
        'hasDuplicate([])            →  false  (edge case)',
        'nested loop করলে O(n²) লাগত, Set-এ নেমে এলো O(n)।',
      ],
      caption: 'ধাপ ৫ (যাচাই): edge case ধরো আর হিসাব করো — Set বেছে নেওয়াতেই O(n²) থেকে O(n), এটাই সঠিক DSA বাছাইয়ের সুফল।',
    },
  ],
  palindrome: [
    {
      title: 'প্রশ্নটা আগে পরিষ্কার করো',
      lines: [
        'input: "madam"  (একটা string)',
        'output: true / false',
        'প্রশ্ন: উল্টে পড়লেও কি একই থাকে?',
      ],
      caption: 'ধাপ ১ (বুঝো): palindrome মানে দুই দিক থেকে একই পড়া যায় — এই সংজ্ঞাটাই পরে দুই-প্রান্তের পরিকল্পনা দেবে।',
    },
    {
      title: 'ছোট একটা উদাহরণ হাতে চালাও',
      lines: [
        'বাঁ প্রান্ত i, ডান প্রান্ত j ধরো',
        'm ↔ m  মিলেছে',
        'a ↔ a  মিলেছে',
        'd একাই মাঝখানে',
        'সব জোড়া মিলেছে → true',
      ],
      caption: 'ধাপ ২ (উদাহরণ): দুই পাশ থেকে অক্ষর মেলাতেই উত্তর বেরিয়ে এলো — পুরো string উল্টাতে হলো না।',
    },
    {
      title: 'পরিকল্পনা লিখে ফেলো (pseudo code)',
      lines: [
        '১) i = 0, j = শেষ index',
        '২) i < j থাকা পর্যন্ত:',
        '৩)    s[i] ≠ s[j] হলে → false রিটার্ন',
        '৪)    i বাড়াও, j কমাও',
        '৫) শেষে → true রিটার্ন',
      ],
      caption: 'ধাপ ৩ (পরিকল্পনা): উদাহরণে যা করলে, সেটাই ধাপে ধাপে লেখা — এটাই two-pointer ভাবনার শুরু।',
    },
    {
      title: 'এবার JavaScript-এ রূপ দাও',
      code: true,
      lines: [
        'function isPalindrome(s) {',
        '  let i = 0, j = s.length - 1;',
        '  while (i < j) {',
        '    if (s[i] !== s[j]) return false;',
        '    i++; j--;',
        '  }',
        '  return true;',
        '}',
      ],
      caption: 'ধাপ ৪ (কোড): পরিকল্পনার প্রতিটা ধাপ সরাসরি কোড হয়ে গেছে, কিছুই আড়াল নেই।',
    },
    {
      title: 'টেস্ট করো, আর ভালো করা যায় কিনা ভাবো',
      lines: [
        'isPalindrome("madam")  →  true',
        'isPalindrome("hello")  →  false',
        'isPalindrome("")       →  true  (edge case)',
        'প্রতিটা অক্ষর সর্বোচ্চ একবার মেলে → O(n)।',
      ],
      caption: 'ধাপ ৫ (যাচাই): খালি string-ও palindrome, edge case মাথায় রাখো। প্রতি অক্ষর একবার, তাই O(n)।',
    },
  ],
};

/**
 * problem-solving-mindset: the locked 5-step method as a progress stepper.
 * Each frame highlights one step and shows the actual work done in that
 * step for the chosen sample problem.
 */
export function SolverFlow() {
  const [problem, setProblem] = useState<Problem>('duplicate');
  const steps = WORK[problem];

  const player = useStepPlayer(steps.length, 1600);
  const step = steps[player.index];

  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    player.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problem]);

  return (
    <StepPlayer title="৫ ধাপের সমাধান পদ্ধতি" player={player} caption={step.caption}>
      <HintLine>ধাপের গোলাগুলোয় ক্লিক করো বা ▶ চাপো — প্রতি ধাপে আসলে কী কাজ হয় দেখো</HintLine>

      <Segmented
        options={[
          { value: 'duplicate', label: 'duplicate খোঁজা' },
          { value: 'palindrome', label: 'palindrome যাচাই' },
        ]}
        value={problem}
        onChange={setProblem}
      />

      <div className="flex flex-wrap items-center justify-center gap-y-3">
        {STEP_LABELS.map((label, i) => {
          const done = i < player.index;
          const on = i === player.index;
          return (
            <div key={label} className="flex items-center">
              <button
                type="button"
                onClick={() => player.goTo(i)}
                className="flex flex-col items-center gap-1"
                aria-label={`ধাপ ${i + 1}: ${label}`}
              >
                <span
                  className="flex size-8 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors"
                  style={{
                    borderColor: done ? VIZ.done : on ? VIZ.active : '#cbd5e1',
                    backgroundColor: done ? VIZ.done : on ? `${VIZ.active}14` : 'transparent',
                    color: done ? '#ffffff' : on ? VIZ.active : '#64748b',
                  }}
                >
                  {i + 1}
                </span>
                <span
                  className="text-xs font-medium"
                  style={{ color: on ? VIZ.active : done ? VIZ.done : '#64748b' }}
                >
                  {label}
                </span>
              </button>
              {i < STEP_LABELS.length - 1 && (
                <span
                  className="mx-1 mb-5 h-0.5 w-6 rounded-full sm:w-10"
                  style={{ backgroundColor: i < player.index ? VIZ.done : '#e2e8f0' }}
                />
              )}
            </div>
          );
        })}
      </div>

      <div
        className="w-full max-w-lg rounded-lg border px-4 py-3"
        style={{ borderColor: `${VIZ.active}66`, backgroundColor: `${VIZ.active}0a` }}
      >
        <p className="mb-2 text-sm font-bold">
          ধাপ {player.index + 1} ({STEP_LABELS[player.index]}): {step.title}
        </p>
        {step.code ? (
          <pre className="overflow-x-auto rounded-md bg-fd-muted/60 p-3 text-xs leading-relaxed">
            {step.lines.join('\n')}
          </pre>
        ) : (
          <ul className="space-y-1 text-sm text-fd-muted-foreground">
            {step.lines.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
        )}
      </div>
    </StepPlayer>
  );
}
