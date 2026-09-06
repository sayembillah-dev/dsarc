'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';
import { MiniInput, OpButton, Segmented } from '../controls';
import { spring, VIZ } from '../palette';
import { StepPlayer } from '../step-player';
import { useStepPlayer } from '../use-step-player';

interface BoxDef {
  name: string;
  kind: 'const' | 'let';
  initial: string;
}

const BOXES: BoxDef[] = [
  { name: 'name', kind: 'const', initial: '"Rahim"' },
  { name: 'age', kind: 'let', initial: '20' },
  { name: 'isStudent', kind: 'const', initial: 'true' },
];

interface Action {
  box: string;
  value: string;
}

interface Frame {
  values: Record<string, string>;
  target: string | null;
  locked: boolean;
  caption: string;
}

/**
 * variables-data-types: named boxes you assign values into.
 * const boxes refuse reassignment (shake + lock), let boxes accept it.
 * Every assign appends a frame, so play/scrub replays the whole history.
 */
export function VariableBoxes() {
  const [actions, setActions] = useState<Action[]>([]);
  const [selected, setSelected] = useState('age');
  const [value, setValue] = useState('21');

  const frames = useMemo<Frame[]>(() => {
    const values: Record<string, string> = {};
    for (const b of BOXES) values[b.name] = b.initial;

    const out: Frame[] = [
      {
        values: { ...values },
        target: null,
        locked: false,
        caption: 'তিনটা নামওয়ালা বাক্স। মান বসাতে নিচের কন্ট্রোল ব্যবহার করো।',
      },
    ];

    for (const action of actions) {
      const box = BOXES.find((b) => b.name === action.box)!;
      if (box.kind === 'const') {
        out.push({
          values: { ...values },
          target: box.name,
          locked: true,
          caption: `${box.name} = ${action.value}: ${box.name} একটা const বাক্স, তাই বদলালো না।`,
        });
      } else {
        values[box.name] = action.value;
        out.push({
          values: { ...values },
          target: box.name,
          locked: false,
          caption: `${box.name} = ${action.value}: let বাক্স, তাই মান বদলে গেল।`,
        });
      }
    }
    return out;
  }, [actions]);

  const player = useStepPlayer(frames.length, 900);
  const frame = frames[player.index];

  // jump to the newest frame when the script grows
  useEffect(() => {
    player.goTo(actions.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actions]);

  const assign = () => {
    const v = value.trim();
    if (!v) return;
    setActions((a) => [...a, { box: selected, value: v }]);
  };

  return (
    <StepPlayer title="ভেরিয়েবল বাক্স" player={player} caption={frame.caption}>
      <div className="grid w-full max-w-xl grid-cols-3 gap-3">
        {BOXES.map((box) => {
          const isTarget = frame.target === box.name;
          const lockedHere = isTarget && frame.locked;
          const borderColor = lockedHere
            ? VIZ.swapping
            : isTarget
              ? VIZ.active
              : '#e2e8f0';
          return (
            <motion.div
              key={box.name}
              animate={
                lockedHere ? { x: [0, -8, 8, -6, 6, 0] } : { x: 0 }
              }
              transition={{ duration: 0.4 }}
              className="rounded-xl border-2 bg-fd-background p-3 transition-colors"
              style={{ borderColor }}
            >
              <div className="mb-2 flex items-center justify-between gap-1">
                <span className="font-mono text-sm font-bold">{box.name}</span>
                <span
                  className="rounded px-1.5 py-0.5 text-[10px] font-bold"
                  style={{
                    color: box.kind === 'const' ? VIZ.visited : VIZ.default,
                    backgroundColor:
                      box.kind === 'const' ? `${VIZ.visited}1a` : `${VIZ.default}1a`,
                  }}
                >
                  {box.kind}
                </span>
              </div>
              <div
              className="flex h-10 items-center justify-center overflow-hidden rounded-md bg-fd-muted/60 font-mono text-sm font-semibold">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={frame.values[box.name]}
                    initial={{ y: 14, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -14, opacity: 0 }}
                    transition={spring}
                  >
                    {frame.values[box.name]}
                  </motion.span>
                </AnimatePresence>
              </div>
              {lockedHere && (
                <div
                  className="mt-2 text-center text-[11px] font-bold"
                  style={{ color: VIZ.swapping }}
                >
                  locked!
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <Segmented
          options={BOXES.map((b) => ({ value: b.name, label: b.name }))}
          value={selected}
          onChange={setSelected}
        />
        <MiniInput
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="নতুন মান"
          aria-label="নতুন মান"
        />
        <OpButton onClick={assign}>বসাও</OpButton>
        <OpButton onClick={() => setActions([])} disabled={actions.length === 0}>
          নতুন করে
        </OpButton>
      </div>
    </StepPlayer>
  );
}
