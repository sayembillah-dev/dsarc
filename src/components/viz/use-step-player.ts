'use client';

import { useCallback, useEffect, useState } from 'react';

export interface StepPlayerApi {
  /** current frame index (always clamped to [0, total-1]) */
  index: number;
  /** total number of frames */
  total: number;
  playing: boolean;
  speed: number;
  atStart: boolean;
  atEnd: boolean;
  /** start playing; if at the last frame, restarts from 0 */
  play: () => void;
  pause: () => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  /** stop and go back to frame 0 */
  reset: () => void;
  goTo: (i: number) => void;
  setSpeed: (s: number) => void;
}

/**
 * The one non-negotiable controller: every visualizer records its algorithm
 * as an array of frames and renders frames[index]. This hook only advances
 * the index; the library (motion) tweens between renders.
 */
export function useStepPlayer(total: number, baseInterval = 850): StepPlayerApi {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const last = Math.max(total - 1, 0);
  const clamped = Math.min(index, last);

  // if the frame list shrinks (input changed), keep index valid
  useEffect(() => {
    if (index > last) setIndex(last);
  }, [index, last]);

  const goTo = useCallback(
    (i: number) => setIndex(Math.max(0, Math.min(i, last))),
    [last],
  );
  const next = useCallback(() => setIndex((i) => Math.min(i + 1, last)), [last]);
  const prev = useCallback(() => setIndex((i) => Math.max(i - 1, 0)), []);
  const reset = useCallback(() => {
    setPlaying(false);
    setIndex(0);
  }, []);
  const play = useCallback(() => {
    setIndex((i) => (i >= last ? 0 : i));
    setPlaying(true);
  }, [last]);
  const pause = useCallback(() => setPlaying(false), []);
  const toggle = useCallback(() => {
    setPlaying((p) => {
      if (!p) setIndex((i) => (i >= last ? 0 : i));
      return !p;
    });
  }, [last]);

  useEffect(() => {
    if (!playing) return;
    if (clamped >= last) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => setIndex((i) => i + 1), baseInterval / speed);
    return () => clearTimeout(t);
  }, [playing, clamped, last, speed, baseInterval]);

  return {
    index: clamped,
    total,
    playing,
    speed,
    atStart: clamped === 0,
    atEnd: clamped >= last,
    play,
    pause,
    toggle,
    next,
    prev,
    reset,
    goTo,
    setSpeed,
  };
}
