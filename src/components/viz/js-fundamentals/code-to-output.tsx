'use client';

import { motion } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';
import { OpButton, MiniInput } from '../controls';
import { spring, VIZ } from '../palette';
import { StepPlayer } from '../step-player';
import { useStepPlayer } from '../use-step-player';

interface Frame {
  phase: 'edit' | 'run' | 'type';
  /** how many characters are visible in the console */
  chars: number;
  caption: string;
}

/**
 * why-javascript: code on the left, console on the right.
 * Run types the output character by character (each char = one frame).
 */
export function CodeToOutput() {
  const [text, setText] = useState('আসসালামু আলাইকুম, DSA শুরু করছি!');

  const frames = useMemo<Frame[]>(() => {
    const out: Frame[] = [
      { phase: 'edit', chars: 0, caption: 'কোড লেখা হয়েছে। Run চাপো।' },
      {
        phase: 'run',
        chars: 0,
        caption: 'console.log(...) লাইনটা execute হচ্ছে...',
      },
    ];
    for (let i = 1; i <= text.length; i++) {
      out.push({
        phase: 'type',
        chars: i,
        caption:
          i === text.length
            ? 'পুরো string console-এ ছেপে গেল। কোড লিখলেই output আসে।'
            : 'একটা একটা করে অক্ষর console-এ যাচ্ছে...',
      });
    }
    return out;
  }, [text]);

  const player = useStepPlayer(frames.length, 70);
  const frame = frames[player.index];

  useEffect(() => {
    player.pause();
    player.goTo(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  return (
    <StepPlayer title="কোড থেকে আউটপুট" player={player} caption={frame.caption}>
      <div className="grid w-full max-w-2xl gap-3 sm:grid-cols-2">
        {/* editor panel */}
        <div className="overflow-hidden rounded-lg border border-fd-border">
          <div className="border-b border-fd-border bg-fd-muted/60 px-3 py-1.5 text-xs font-medium text-fd-muted-foreground">
            main.js
          </div>
          <div className="flex bg-fd-background font-mono text-sm">
            <span className="select-none border-r border-fd-border px-2 py-3 text-fd-muted-foreground">
              1
            </span>
            <motion.div
              className="flex-1 px-2 py-3"
              animate={
                frame.phase === 'run'
                  ? { backgroundColor: `${VIZ.active}22` }
                  : { backgroundColor: '#00000000' }
              }
              transition={spring}
            >
              <span className="text-fd-muted-foreground">console.</span>
              <span className="font-semibold">log</span>
              <span className="text-fd-muted-foreground">(</span>
              <span style={{ color: VIZ.done }}>&quot;{text}&quot;</span>
              <span className="text-fd-muted-foreground">);</span>
            </motion.div>
          </div>
        </div>

        {/* console panel */}
        <div className="overflow-hidden rounded-lg border border-fd-border">
          <div className="border-b border-fd-border bg-fd-muted/60 px-3 py-1.5 text-xs font-medium text-fd-muted-foreground">
            console
          </div>
          <div className="min-h-[72px] bg-fd-background px-3 py-3 font-mono text-sm">
            <span className="mr-1 select-none text-fd-muted-foreground">&gt;</span>
            {text.slice(0, frame.chars)}
            {frame.phase === 'type' && (
              <motion.span
                className="ml-0.5 inline-block h-4 w-2 align-text-bottom"
                style={{ backgroundColor: VIZ.active }}
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <MiniInput
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-64"
          aria-label="আউটপুট টেক্সট"
        />
        <OpButton onClick={player.play}>Run</OpButton>
      </div>
    </StepPlayer>
  );
}
