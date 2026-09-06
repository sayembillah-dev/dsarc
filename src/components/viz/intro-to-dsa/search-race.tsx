'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrayRow, type ArrayCell } from '../array-row';
import { HintLine, ReadoutChip, Segmented } from '../controls';
import { VIZ } from '../palette';
import { StepPlayer } from '../step-player';
import { useStepPlayer } from '../use-step-player';

interface Frame {
  /** array pointer position; -1 before the race starts */
  pos: number;
  arraySteps: number;
  setDone: boolean;
  finished: boolean;
  caption: string;
}

/**
 * why-dsa-matters: array linear search vs Set.has, same target (worst case,
 * last cell). The Set lane finishes on frame 1 and just sits there while
 * the array keeps sweeping, so the gap is visible, not just stated.
 */
export function SearchRace() {
  const [size, setSize] = useState(16);

  const frames = useMemo<Frame[]>(() => {
    const target = size - 1;
    const out: Frame[] = [
      {
        pos: -1,
        arraySteps: 0,
        setDone: false,
        finished: false,
        caption: `দুই লেনেই একই খোঁজা: target = ${target} (একদম শেষ ঘরে, worst case)। ▶ চাপলে রেস শুরু।`,
      },
    ];
    for (let i = 1; i <= size; i++) {
      const finished = i === size;
      out.push({
        pos: i - 1,
        arraySteps: i,
        setDone: true,
        finished,
        caption: finished
          ? `শেষ! Array: ${size}টা তুলনা, Set: মাত্র ১টা। n যত বাড়ে এই ফাঁক তত বাড়ে — এটাই O(n) বনাম O(1)।`
          : `Array ${i}বার তুলনা করেও এখনো পায়নি... আর Set প্রথমবারেই পেয়ে বসে আছে।`,
      });
    }
    return out;
  }, [size]);

  const player = useStepPlayer(frames.length, 450);
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
  }, [size]);

  const cells: ArrayCell[] = useMemo(
    () =>
      Array.from({ length: size }, (_, i) => ({
        id: `r-${i}`,
        value: i,
        state:
          frame.finished && i === size - 1
            ? ('done' as const)
            : i < frame.pos
              ? ('visited' as const)
              : i === frame.pos
                ? ('comparing' as const)
                : ('default' as const),
      })),
    [size, frame],
  );

  return (
    <StepPlayer title="Array বনাম Set: খোঁজার রেস" player={player} caption={frame.caption}>
      <HintLine>size বদলাও বা ▶ চাপো — দুই লেনে একই target খোঁজা হবে, তুলনা-গোনাকারী দেখো</HintLine>

      <Segmented
        options={[
          { value: '8', label: 'n = 8' },
          { value: '16', label: 'n = 16' },
          { value: '24', label: 'n = 24' },
        ]}
        value={String(size) as '8' | '16' | '24'}
        onChange={(v) => setSize(Number(v))}
      />

      <div className="w-full space-y-1">
        <p className="text-xs font-bold" style={{ color: VIZ.comparing }}>
          Array — একটা একটা করে খোঁজে, O(n)
        </p>
        <ArrayRow
          cells={cells}
          pointers={
            frame.pos >= 0
              ? [{ index: frame.pos, label: 'i', color: VIZ.comparing }]
              : []
          }
          cellSize={26}
        />
      </div>

      <div className="w-full space-y-1">
        <p className="text-xs font-bold" style={{ color: VIZ.done }}>
          Set — সোজা উত্তর, O(1)
        </p>
        <div
          className="flex items-center justify-center gap-2 rounded-lg border px-3 py-3 text-sm font-semibold transition-colors"
          style={{
            borderColor: frame.setDone ? VIZ.done : '#cbd5e1',
            backgroundColor: frame.setDone ? `${VIZ.done}14` : 'transparent',
            color: frame.setDone ? VIZ.done : '#64748b',
          }}
        >
          set.has({size - 1})
          <span>{frame.setDone ? '→ true, প্রথমবারেই পেয়ে গেছে' : '→ অপেক্ষা করছে...'}</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <ReadoutChip label="Array-এর তুলনা" value={frame.arraySteps} color={VIZ.comparing} />
        <ReadoutChip label="Set-এর তুলনা" value={frame.setDone ? 1 : 0} color={VIZ.done} />
      </div>
    </StepPlayer>
  );
}
