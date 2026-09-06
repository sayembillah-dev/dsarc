'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrayRow, type ArrayCell } from '../array-row';
import { BoolChip, ReadoutChip, Segmented } from '../controls';
import { VIZ } from '../palette';
import { StepPlayer } from '../step-player';
import { useStepPlayer } from '../use-step-player';

interface Frame {
  /** pointer position (== cells.length when the loop has ended) */
  pos: number;
  readout: { label: string; value: number };
  iterations: number;
  condition: boolean;
  caption: string;
}

const BASE_VALUES = [4, 7, 1, 9, 3, 6, 8, 2];

/**
 * loops: an orange pointer walks the array, one frame per iteration.
 * for-mode shows O(n) directly; while-mode halves n to preview O(log n).
 */
export function LoopTracer() {
  const [mode, setMode] = useState<'for' | 'while'>('for');
  const [size, setSize] = useState(5);
  const [startN, setStartN] = useState(16);

  const { cells, frames } = useMemo(() => {
    if (mode === 'for') {
      const values = BASE_VALUES.slice(0, size);
      const cells: ArrayCell[] = values.map((v, i) => ({
        id: `f-${i}`,
        value: v,
      }));
      const frames: Frame[] = values.map((v, i) => ({
        pos: i,
        readout: { label: 'i', value: i },
        iterations: i + 1,
        condition: true,
        caption: `i = ${i}: শর্ত ${i} < ${size} true, তাই body চলল (iteration ${i + 1})।`,
      }));
      frames.push({
        pos: values.length,
        readout: { label: 'i', value: size },
        iterations: size,
        condition: false,
        caption: `i = ${size}: শর্ত ${size} < ${size} false, loop থামল। মোট ${size} বার চলল, এটাই O(n)।`,
      });
      return { cells, frames };
    }

    const seq: number[] = [startN];
    while (seq[seq.length - 1] > 1) {
      seq.push(Math.floor(seq[seq.length - 1] / 2));
    }
    const cells: ArrayCell[] = seq.map((v, i) => ({ id: `w-${i}`, value: v }));
    const frames: Frame[] = seq.map((v, i) => {
      const last = i === seq.length - 1;
      return {
        pos: i,
        readout: { label: 'n', value: v },
        iterations: i,
        condition: v > 1,
        caption: last
          ? `n = ${v}: শর্ত ${v} > 1 false, থামল। ${startN} থেকে মাত্র ${i} বারে শেষ, এটাই O(log n)।`
          : `n = ${v}: শর্ত ${v} > 1 true, অর্ধেক করে আবার চলব (iteration ${i + 1})।`,
      };
    });
    return { cells, frames };
  }, [mode, size, startN]);

  const player = useStepPlayer(frames.length, 900);
  const frame = frames[player.index];

  // replay on any input change (skip first render)
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    player.reset();
    player.play();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, size, startN]);

  const coloredCells: ArrayCell[] = cells.map((c, i) => ({
    ...c,
    state: i < frame.pos ? 'visited' : i === frame.pos ? 'active' : 'default',
  }));

  return (
    <StepPlayer title="লুপ ট্রেসার" player={player} caption={frame.caption}>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Segmented
          options={[
            { value: 'for', label: 'for' },
            { value: 'while', label: 'while' },
          ]}
          value={mode}
          onChange={setMode}
        />
        {mode === 'for' ? (
          <label className="flex items-center gap-2 text-sm">
            size = {size}
            <input
              type="range"
              min={3}
              max={8}
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="h-1 w-28 cursor-pointer appearance-none rounded-full bg-fd-muted"
              style={{ accentColor: VIZ.active }}
            />
          </label>
        ) : (
          <Segmented
            options={[
              { value: '8', label: 'n = 8' },
              { value: '16', label: 'n = 16' },
              { value: '32', label: 'n = 32' },
            ]}
            value={String(startN) as '8' | '16' | '32'}
            onChange={(v) => setStartN(Number(v))}
          />
        )}
      </div>

      <ArrayRow
        cells={coloredCells}
        pointers={[{ index: frame.pos, label: frame.readout.label }]}
      />

      <div className="flex flex-wrap items-center justify-center gap-2">
        <ReadoutChip
          label={frame.readout.label}
          value={frame.readout.value}
          color={VIZ.active}
        />
        <ReadoutChip label="iteration" value={frame.iterations} />
        <BoolChip value={frame.condition} />
      </div>
    </StepPlayer>
  );
}
