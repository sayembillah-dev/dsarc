'use client';

import { useMemo } from 'react';
import { VIZ } from '../palette';
import { StepPlayer } from '../step-player';
import { useStepPlayer } from '../use-step-player';

const PSEUDO_LINES = [
  'FUNCTION findMax(list):',
  'max = list-এর প্রথম উপাদান',
  'FOR list-এর প্রতিটা উপাদান x:',
  'IF x > max: max = x',
  'RETURN max',
];

const JS_LINES = [
  'function findMax(list) {',
  '  let max = list[0];',
  '  for (const x of list) {',
  '    if (x > max) max = x;',
  '  }',
  '  return max;',
  '}',
];

/** js line index -> pseudo line index (-1 = syntax-only line) */
const JS_TO_PSEUDO = [0, 1, 2, 3, -1, 4, -1];

const CAPTIONS = [
  'প্রথমে function-এর নাম আর input ঠিক করি। দুই ভাষায় লাইনটা প্রায় একই।',
  'শুরুতে ধরে নিই প্রথম উপাদানটাই সবচেয়ে বড়।',
  'তারপর বাকি প্রতিটা উপাদানে একবার করে ঘুরে দেখি।',
  'কেউ max-কে হারিয়ে দিলে max বদলে যায়।',
  'সব শেষে max-টাই return করি। যুক্তি এক, শুধু ভাষা আলাদা।',
];

interface Frame {
  line: number;
  caption: string;
}

/**
 * pseudo-code: pseudo on the left, real JS on the right. Each frame maps one
 * pseudo line to its JS counterpart. Hovering a pseudo line jumps there too.
 */
export function PseudoToCode() {
  const frames = useMemo<Frame[]>(
    () => CAPTIONS.map((caption, line) => ({ line, caption })),
    [],
  );

  const player = useStepPlayer(frames.length, 1100);
  const frame = frames[player.index];

  const jump = (i: number) => {
    player.pause();
    player.goTo(i);
  };

  const lineBase = 'rounded px-2 py-1.5 transition-colors duration-200';
  const activeStyle = {
    backgroundColor: `${VIZ.active}1a`,
    boxShadow: `inset 2px 0 0 ${VIZ.active}`,
  };

  return (
    <StepPlayer
      title="সিউডো থেকে আসল কোড"
      player={player}
      caption={frame.caption}
    >
      <div className="grid w-full max-w-2xl gap-3 sm:grid-cols-2">
        <div className="overflow-hidden rounded-lg border border-fd-border">
          <div className="border-b border-fd-border bg-fd-muted/60 px-3 py-1.5 text-xs font-medium text-fd-muted-foreground">
            Pseudo Code
          </div>
          <div className="p-2 text-sm">
            {PSEUDO_LINES.map((line, i) => (
              <div
                key={line}
                role="button"
                tabIndex={0}
                onMouseEnter={() => jump(i)}
                onClick={() => jump(i)}
                onKeyDown={(e) => e.key === 'Enter' && jump(i)}
                className={`${lineBase} cursor-pointer font-medium`}
                style={i === frame.line ? activeStyle : undefined}
              >
                {line}
              </div>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-fd-border">
          <div className="border-b border-fd-border bg-fd-muted/60 px-3 py-1.5 text-xs font-medium text-fd-muted-foreground">
            JavaScript
          </div>
          <div className="p-2 font-mono text-sm">
            {JS_LINES.map((line, i) => {
              const mapped = JS_TO_PSEUDO[i];
              const active = mapped === frame.line;
              return (
                <div
                  key={line}
                  className={lineBase}
                  style={{
                    ...(active ? activeStyle : {}),
                    opacity: mapped === -1 ? 0.4 : 1,
                  }}
                >
                  {line}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </StepPlayer>
  );
}
