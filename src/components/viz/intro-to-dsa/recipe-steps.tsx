'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrayRow, type ArrayCell } from '../array-row';
import { HintLine, ReadoutChip, Segmented } from '../controls';
import { VIZ } from '../palette';
import { StepPlayer } from '../step-player';
import { useStepPlayer } from '../use-step-player';

const PRESETS: Record<string, number[]> = {
  a: [10, 20, 30],
  b: [5, 15, 25, 35],
  c: [7, 7, 7, 7],
};

interface Frame {
  /** how many values have been added into total so far */
  added: number;
  phase: 'intro' | 'add' | 'divide' | 'done';
  total: number;
  caption: string;
}

/**
 * what-is-an-algorithm: average() as a recipe. Frame by frame the input
 * transforms: total grows one value at a time (step 1), then a single
 * divide (step 2) lands the answer. Teaches: algorithm = stepwise,
 * unambiguous, finite transformation of data.
 */
export function RecipeSteps() {
  const [preset, setPreset] = useState<keyof typeof PRESETS>('a');
  const values = PRESETS[preset];

  const frames = useMemo<Frame[]>(() => {
    const n = values.length;
    const out: Frame[] = [
      {
        added: 0,
        phase: 'intro',
        total: 0,
        caption: `কাজ: এই ${n}টা সংখ্যার গড় বের করা। রেসিপি ২ ধাপের, আগে সব যোগ, তারপর n দিয়ে ভাগ। ▶ চাপো।`,
      },
    ];
    let total = 0;
    values.forEach((v, i) => {
      total += v;
      out.push({
        added: i + 1,
        phase: 'add',
        total,
        caption: `ধাপ ১ (যোগ): ${v} এসে total-এ বসল, total = ${total - v} + ${v} = ${total}।`,
      });
    });
    out.push({
      added: n,
      phase: 'divide',
      total,
      caption: `ধাপ ২ (ভাগ): যোগ শেষ, এবার total ÷ n = ${total} ÷ ${n}।`,
    });
    out.push({
      added: n,
      phase: 'done',
      total,
      caption: `উত্তর ${total / n}! প্রতিটা ধাপ সুনির্দিষ্ট, কাজ সসীম, উত্তর সঠিক — ভালো algorithm-এর সব গুণ এখানে আছে।`,
    });
    return out;
  }, [values]);

  const player = useStepPlayer(frames.length, 1000);
  const frame = frames[player.index];

  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    player.reset();
    player.play();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preset]);

  const cells: ArrayCell[] = values.map((v, i) => ({
    id: `${preset}-${i}`,
    value: v,
    state:
      frame.phase === 'done'
        ? 'done'
        : i < frame.added
          ? 'visited'
          : i === frame.added && frame.phase === 'add'
            ? 'active'
            : 'default',
  }));

  const steps = [
    {
      label: '১. সব সংখ্যা total-এ যোগ করো',
      on: frame.phase === 'add',
      done: frame.phase === 'divide' || frame.phase === 'done',
    },
    {
      label: '২. total কে n দিয়ে ভাগ করো',
      on: frame.phase === 'divide',
      done: frame.phase === 'done',
    },
  ];

  return (
    <StepPlayer title="রেসিপির মতো Algorithm" player={player} caption={frame.caption}>
      <HintLine>অন্য array বেছে নাও বা ▶ চাপো — প্রতি ধাপে ডেটা রূপ বদলাবে</HintLine>

      <Segmented
        options={[
          { value: 'a', label: '[10, 20, 30]' },
          { value: 'b', label: '[5, 15, 25, 35]' },
          { value: 'c', label: '[7, 7, 7, 7]' },
        ]}
        value={preset}
        onChange={setPreset}
      />

      <ArrayRow cells={cells} />

      <div className="flex flex-wrap items-center justify-center gap-2">
        <ReadoutChip label="total" value={frame.total} color={VIZ.active} />
        <ReadoutChip label="n" value={values.length} />
        {(frame.phase === 'divide' || frame.phase === 'done') && (
          <ReadoutChip label="গড়" value={frame.total / values.length} color={VIZ.done} />
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {steps.map((s) => (
          <span
            key={s.label}
            className="rounded-md border px-2.5 py-1 text-xs font-medium"
            style={{
              borderColor: s.done ? VIZ.done : s.on ? VIZ.active : '#e2e8f0',
              backgroundColor: s.done
                ? `${VIZ.done}14`
                : s.on
                  ? `${VIZ.active}14`
                  : 'transparent',
              color: s.done ? VIZ.done : s.on ? VIZ.active : '#64748b',
            }}
          >
            {s.label}
          </span>
        ))}
      </div>

      {frame.phase === 'done' && (
        <p className="text-sm font-bold" style={{ color: VIZ.done }}>
          average([{values.join(', ')}]) = {frame.total / values.length}
        </p>
      )}
    </StepPlayer>
  );
}
