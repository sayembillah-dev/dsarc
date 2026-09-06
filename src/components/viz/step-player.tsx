'use client';

import { cn } from 'cn';
import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  RotateCcw,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { VIZ } from './palette';
import type { StepPlayerApi } from './use-step-player';

const SPEEDS = [0.5, 1, 2];

interface StepPlayerProps {
  /** card title, e.g. "লুপ ট্রেসার" */
  title: string;
  player: StepPlayerApi;
  /** one-line explanation of the current frame */
  caption?: ReactNode;
  /** the stage: render frames[player.index] here */
  children: ReactNode;
  stageClassName?: string;
}

/**
 * Shared chrome for every visualizer: title bar, stage, caption line and the
 * transport controls (reset / step / play-pause / scrub / speed).
 * Visualizers only supply frames + how to render one frame.
 */
export function StepPlayer({
  title,
  player,
  caption,
  children,
  stageClassName,
}: StepPlayerProps) {
  const speedLabel = `${player.speed}x`;

  return (
    <div className="not-prose my-6 overflow-hidden rounded-xl border border-fd-border bg-fd-card shadow-sm">
      <div className="flex items-center justify-between border-b border-fd-border px-4 py-2.5">
        <span className="text-sm font-semibold">{title}</span>
        <span className="text-xs tabular-nums text-fd-muted-foreground">
          ধাপ {player.index + 1}/{player.total}
        </span>
      </div>

      <div
        className={cn(
          'flex min-h-[220px] flex-col items-center justify-center gap-4 p-6',
          stageClassName,
        )}
      >
        {children}
      </div>

      <div className="flex min-h-10 items-center justify-center border-t border-fd-border px-4 py-2 text-center text-sm text-fd-muted-foreground">
        {caption}
      </div>

      <div className="flex items-center gap-1.5 border-t border-fd-border bg-fd-muted/40 px-3 py-2">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={player.reset}
          disabled={player.atStart && !player.playing}
          aria-label="রিসেট"
          title="রিসেট"
        >
          <RotateCcw />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={player.prev}
          disabled={player.atStart}
          aria-label="আগের ধাপ"
          title="আগের ধাপ"
        >
          <ChevronLeft />
        </Button>
        <Button
          size="icon-sm"
          onClick={player.toggle}
          className="rounded-full"
          aria-label={player.playing ? 'থামাও' : 'চালাও'}
          title={player.playing ? 'থামাও' : 'চালাও'}
        >
          {player.playing ? <Pause /> : <Play className="translate-x-px" />}
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={player.next}
          disabled={player.atEnd}
          aria-label="পরের ধাপ"
          title="পরের ধাপ"
        >
          <ChevronRight />
        </Button>

        <input
          type="range"
          min={0}
          max={Math.max(player.total - 1, 0)}
          value={player.index}
          onChange={(e) => {
            player.pause();
            player.goTo(Number(e.target.value));
          }}
          className="mx-2 h-1 flex-1 cursor-pointer appearance-none rounded-full bg-fd-muted"
          style={{ accentColor: VIZ.active }}
          aria-label="ধাপ সিলেক্টর"
        />

        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const i = SPEEDS.indexOf(player.speed);
            player.setSpeed(SPEEDS[(i + 1) % SPEEDS.length]);
          }}
          className="w-10 tabular-nums"
          aria-label="স্পিড"
          title="স্পিড"
        >
          {speedLabel}
        </Button>
      </div>
    </div>
  );
}
