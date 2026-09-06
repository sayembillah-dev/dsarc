'use client';

import { Cog } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ReadoutChip, Segmented } from '../controls';
import { spring, VIZ } from '../palette';
import { StepPlayer } from '../step-player';
import { useStepPlayer } from '../use-step-player';

type FnKind = 'add' | 'multiply';

interface Frame {
  phase: 'ready' | 'in' | 'process' | 'out';
  caption: string;
}

/**
 * functions: a machine box. Inputs go in on the left, the machine computes,
 * the return value pops out on the right. Four frames, one idea per frame.
 */
export function FunctionMachine() {
  const [fn, setFn] = useState<FnKind>('add');
  const [a, setA] = useState(3);
  const [b, setB] = useState(4);

  const result = fn === 'add' ? a + b : a * b;
  const symbol = fn === 'add' ? '+' : '×';

  const frames = useMemo<Frame[]>(
    () => [
      {
        phase: 'ready',
        caption: `${fn}(a, b) মেশিন তৈরি। parameter বদলে দেখো, তারপর চালাও।`,
      },
      { phase: 'in', caption: `input ঢুকল: a = ${a}, b = ${b}` },
      {
        phase: 'process',
        caption: `ভেতরে হিসাব চলছে: ${a} ${symbol} ${b}`,
      },
      {
        phase: 'out',
        caption: `return ${result}: ফলাফল মেশিন থেকে বেরিয়ে এলো।`,
      },
    ],
    [fn, a, b, symbol, result],
  );

  const player = useStepPlayer(frames.length, 1000);
  const frame = frames[player.index];
  const phase = frame.phase;

  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    player.reset();
    player.play();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fn, a, b]);

  const arrow = (lit: boolean) => (
    <svg
      width="34"
      height="16"
      viewBox="0 0 34 16"
      aria-hidden
      style={{ transition: 'opacity .3s', opacity: lit ? 1 : 0.25 }}
    >
      <path
        d="M0 8h26m0 0-6-6m6 6-6 6"
        stroke={lit ? VIZ.active : '#94a3b8'}
        strokeWidth={2}
        fill="none"
      />
    </svg>
  );

  const inputChip = (name: string, value: number) => (
    <motion.div
      key={`${name}-${phase}`}
      className="rounded-lg border-2 bg-fd-background px-3 py-2 text-center"
      animate={{
        borderColor: phase === 'ready' ? '#e2e8f0' : VIZ.active,
        scale: phase === 'in' ? [1, 1.08, 1] : 1,
      }}
      transition={spring}
    >
      <div className="text-[10px] font-bold text-fd-muted-foreground">{name}</div>
      <div className="font-mono text-lg font-bold tabular-nums">{value}</div>
    </motion.div>
  );

  return (
    <StepPlayer title="ফাংশন মেশিন" player={player} caption={frame.caption}>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Segmented
          options={[
            { value: 'add', label: 'add(a, b)' },
            { value: 'multiply', label: 'multiply(a, b)' },
          ]}
          value={fn}
          onChange={setFn}
        />
        {([
          ['a', a, setA],
          ['b', b, setB],
        ] as const).map(([name, val, set]) => (
          <label key={name} className="flex items-center gap-2 text-sm">
            {name} = {val}
            <input
              type="range"
              min={1}
              max={9}
              value={val}
              onChange={(e) => set(Number(e.target.value))}
              className="h-1 w-20 cursor-pointer appearance-none rounded-full bg-fd-muted"
              style={{ accentColor: VIZ.active }}
            />
          </label>
        ))}
      </div>

      <div className="flex items-center justify-center gap-2 sm:gap-3">
        <div className="flex gap-2">
          {inputChip('a', a)}
          {inputChip('b', b)}
        </div>

        {arrow(phase !== 'ready')}

        <motion.div
          className="flex w-36 flex-col items-center gap-2 rounded-2xl border-2 bg-fd-background p-4"
          animate={{
            borderColor: phase === 'process' ? VIZ.active : '#e2e8f0',
            scale: phase === 'process' ? [1, 1.05, 1] : 1,
          }}
          transition={{ ...spring, scale: { duration: 0.6, repeat: phase === 'process' ? Infinity : 0 } }}
        >
          <motion.div
            animate={{ rotate: phase === 'process' ? 360 : 0 }}
            transition={{ duration: 1, repeat: phase === 'process' ? Infinity : 0, ease: 'linear' }}
          >
            <Cog className="size-6 text-fd-muted-foreground" />
          </motion.div>
          <div className="font-mono text-xs font-bold">{fn}(a, b)</div>
          <div className="min-h-5 text-center font-mono text-sm tabular-nums">
            {phase === 'ready' && <span className="text-fd-muted-foreground">...</span>}
            {phase === 'in' && (
              <span>
                {a}, {b}
              </span>
            )}
            {phase === 'process' && (
              <span style={{ color: VIZ.active }}>
                {a} {symbol} {b}
              </span>
            )}
            {phase === 'out' && (
              <span style={{ color: VIZ.done }}>return {result}</span>
            )}
          </div>
        </motion.div>

        {arrow(phase === 'out')}

        <motion.div
          className="flex size-14 items-center justify-center rounded-lg border-2 font-mono text-lg font-bold tabular-nums"
          animate={{
            borderColor: phase === 'out' ? VIZ.done : '#e2e8f0',
            backgroundColor: phase === 'out' ? `${VIZ.done}14` : '#00000000',
            scale: phase === 'out' ? [0.6, 1.1, 1] : 1,
          }}
          transition={spring}
        >
          {phase === 'out' ? (
            result
          ) : (
            <span className="text-fd-muted-foreground">?</span>
          )}
        </motion.div>
      </div>

      <div className="flex justify-center">
        <ReadoutChip label="ফলাফল" value={phase === 'out' ? result : '...'} color={VIZ.done} />
      </div>
    </StepPlayer>
  );
}
