import type { Transition } from 'motion/react';

/**
 * DSArc visualizer color standard (locked).
 * Every visualizer across all sections uses these exact colors so learners
 * build one consistent mental mapping: color -> meaning.
 */
export const VIZ = {
  /** idle / default element */
  default: '#64748b',
  /** currently being compared */
  comparing: '#eab308',
  /** active element / pointer */
  active: '#f97316',
  /** swapping / error / destructive action */
  swapping: '#ef4444',
  /** sorted / done / success */
  done: '#22c55e',
  /** visited / processed */
  visited: '#a855f7',
} as const;

export type CellState = keyof typeof VIZ;

/** One spring feel for the whole site. */
export const spring: Transition = { type: 'spring', bounce: 0.2, duration: 0.5 };

/** Soft tint of a palette color for backgrounds (hex alpha suffix). */
export function tint(state: CellState, alpha = '16'): string {
  return `${VIZ[state]}${alpha}`;
}
