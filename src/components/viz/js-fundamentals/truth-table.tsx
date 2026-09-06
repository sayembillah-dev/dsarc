'use client';

import { motion } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';
import { BoolChip, OpButton, Toggle } from '../controls';
import { spring, VIZ } from '../palette';
import { StepPlayer } from '../step-player';
import { useStepPlayer } from '../use-step-player';

interface Combo {
  a: boolean;
  b: boolean;
}

interface Frame extends Combo {
  caption: string;
}

function captionFor({ a, b }: Combo): string {
  return `A = ${a}, B = ${b} → A && B = ${a && b}, A || B = ${a || b}, !A = ${!a}`;
}

const ALL_COMBOS: Combo[] = [
  { a: false, b: false },
  { a: true, b: false },
  { a: false, b: true },
  { a: true, b: true },
];

/**
 * operators: two switches feed three bulbs (AND / OR / NOT).
 * Every toggle is recorded as a frame; play replays your exploration.
 */
export function TruthTableExplorer() {
  const [history, setHistory] = useState<Combo[]>([{ a: false, b: false }]);

  const frames = useMemo<Frame[]>(
    () => history.map((c) => ({ ...c, caption: captionFor(c) })),
    [history],
  );

  const player = useStepPlayer(frames.length, 900);
  const frame = frames[player.index];
  const current = history[history.length - 1];

  useEffect(() => {
    player.goTo(history.length - 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history]);

  const toggle = (key: keyof Combo) => {
    setHistory((h) => [...h, { ...current, [key]: !current[key] }]);
  };

  const bulbs: { expr: string; on: boolean }[] = [
    { expr: 'A && B', on: frame.a && frame.b },
    { expr: 'A || B', on: frame.a || frame.b },
    { expr: '!A', on: !frame.a },
  ];

  return (
    <StepPlayer
      title="ট্রুথ টেবিল এক্সপ্লোরার"
      player={player}
      caption={frame.caption}
    >
      <div className="flex items-start justify-center gap-8">
        <Toggle on={frame.a} onToggle={() => toggle('a')} label="A" />
        <Toggle on={frame.b} onToggle={() => toggle('b')} label="B" />
      </div>

      <div className="flex flex-wrap items-stretch justify-center gap-3">
        {bulbs.map((bulb) => (
          <div
            key={bulb.expr}
            className="flex w-28 flex-col items-center gap-2 rounded-xl border border-fd-border bg-fd-background p-3"
          >
            <motion.div
              className="size-9 rounded-full border-2"
              animate={{
                backgroundColor: bulb.on ? VIZ.done : '#e2e8f0',
                borderColor: bulb.on ? VIZ.done : '#cbd5e1',
                boxShadow: bulb.on
                  ? `0 0 16px 2px ${VIZ.done}66`
                  : '0 0 0px 0px #00000000',
              }}
              transition={spring}
            />
            <span className="font-mono text-sm font-bold">{bulb.expr}</span>
            <BoolChip value={bulb.on} />
          </div>
        ))}
      </div>

      <OpButton
        onClick={() => {
          setHistory(ALL_COMBOS);
          player.goTo(0);
          player.play();
        }}
      >
        সব কম্বিনেশন চালাও
      </OpButton>
    </StepPlayer>
  );
}
