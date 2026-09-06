'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrayRow, type ArrayCell } from '../array-row';
import { MiniInput, OpButton, ReadoutChip } from '../controls';
import { VIZ } from '../palette';
import { StepPlayer } from '../step-player';
import { useStepPlayer } from '../use-step-player';

type Op = 'push' | 'pop' | 'shift' | 'unshift';

interface Action {
  op: Op;
  value?: number;
}

interface Frame {
  cells: ArrayCell[];
  moved: number;
  caption: string;
}

const MAX_LEN = 8;

/**
 * arrays-objects: push / pop / shift / unshift playground.
 * Cells carry stable ids, so motion's layout animates every slide. The
 * "ঘর সরল" counter makes the O(1) vs O(n) difference visible.
 */
export function ArrayOpsPlayground() {
  const [actions, setActions] = useState<Action[]>([]);
  const [value, setValue] = useState('40');

  const frames = useMemo<Frame[]>(() => {
    let cells: ArrayCell[] = [
      { id: 'c0', value: 10 },
      { id: 'c1', value: 20 },
      { id: 'c2', value: 30 },
    ];
    let nextId = 3;

    const out: Frame[] = [
      {
        cells,
        moved: 0,
        caption: 'শুরুর array: [10, 20, 30]। নিচের বাটন দিয়ে অপারেশন করো।',
      },
    ];

    for (const action of actions) {
      const v = action.value ?? 0;
      if (action.op === 'push') {
        cells = [...cells, { id: `c${nextId++}`, value: v, state: 'active' }];
        out.push({
          cells,
          moved: 0,
          caption: `push(${v}): ডান প্রান্তে বসে গেল, কাউকে সরাতে হলো না। এজন্যই push O(1)।`,
        });
      } else if (action.op === 'pop') {
        const removed = cells[cells.length - 1];
        cells = cells.slice(0, -1);
        out.push({
          cells,
          moved: 0,
          caption: `pop(): শেষের ${removed?.value} বেরিয়ে গেল, বাকিরা অটল। এটাও O(1)।`,
        });
      } else if (action.op === 'unshift') {
        const n = cells.length;
        cells = [
          { id: `c${nextId++}`, value: v, state: 'active' },
          ...cells.map((c) => ({ ...c, state: 'comparing' as const })),
        ];
        out.push({
          cells,
          moved: n,
          caption: `unshift(${v}): আগে ${n}টা ঘর সব ডানে সরল। দেখো, এটাই O(n)।`,
        });
      } else {
        const removed = cells[0];
        const n = cells.length - 1;
        cells = cells.slice(1).map((c) => ({ ...c, state: 'comparing' as const }));
        out.push({
          cells,
          moved: n,
          caption: `shift(): ${removed?.value} বের হলো, বাকি ${n}টা ঘর বামে সরল। তাই shift O(n)।`,
        });
      }
    }
    return out;
  }, [actions]);

  const player = useStepPlayer(frames.length, 1000);
  const frame = frames[player.index];

  useEffect(() => {
    player.goTo(actions.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actions]);

  const act = (op: Op) => {
    const v = Number(value);
    setActions((a) => [
      ...a,
      op === 'push' || op === 'unshift'
        ? { op, value: Number.isFinite(v) ? v : 0 }
        : { op },
    ]);
  };

  const len = frame.cells.length;

  return (
    <StepPlayer
      title="অ্যারে অপস প্লেগ্রাউন্ড"
      player={player}
      caption={frame.caption}
    >
      <div className="flex flex-wrap items-center justify-center gap-2">
        <MiniInput
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-20"
          aria-label="মান"
        />
        <OpButton onClick={() => act('push')} disabled={len >= MAX_LEN}>
          push
        </OpButton>
        <OpButton onClick={() => act('pop')} disabled={len === 0}>
          pop
        </OpButton>
        <OpButton onClick={() => act('unshift')} disabled={len >= MAX_LEN}>
          unshift
        </OpButton>
        <OpButton onClick={() => act('shift')} disabled={len === 0}>
          shift
        </OpButton>
        <OpButton onClick={() => setActions([])} disabled={actions.length === 0}>
          নতুন করে
        </OpButton>
      </div>

      <ArrayRow cells={frame.cells} />

      <div className="flex items-center justify-center gap-2">
        <ReadoutChip label="দৈর্ঘ্য" value={len} />
        <ReadoutChip
          label="ঘর সরল"
          value={frame.moved}
          color={frame.moved > 0 ? VIZ.swapping : VIZ.done}
        />
      </div>
    </StepPlayer>
  );
}
