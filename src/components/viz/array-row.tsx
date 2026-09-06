'use client';

import { AnimatePresence, motion } from 'motion/react';
import type { ReactNode } from 'react';
import { type CellState, spring, tint, VIZ } from './palette';

export interface ArrayCell {
  /** stable id so motion's layout can track the cell across frames */
  id: string;
  value: ReactNode;
  state?: CellState;
}

export interface ArrayPointer {
  /** which cell the pointer sits on */
  index: number;
  label?: string;
  color?: string;
}

interface ArrayRowProps {
  cells: ArrayCell[];
  pointers?: ArrayPointer[];
  showIndices?: boolean;
  /** px, width and height of one cell box */
  cellSize?: number;
  emptyText?: string;
}

const GAP = 8;

/**
 * The reusable array strip: boxes with index labels, optional pointers above.
 * Cells carry stable ids, so swaps / inserts / removals animate automatically
 * via motion's layout prop. This one component serves arrays, sorting, heaps,
 * pointers and grids across the whole course.
 */
export function ArrayRow({
  cells,
  pointers = [],
  showIndices = true,
  cellSize = 48,
  emptyText = 'খালি',
}: ArrayRowProps) {
  const pitch = cellSize + GAP;

  return (
    <div className="flex flex-col items-center">
      {/* pointer track */}
      <div
        className="relative w-full"
        style={{ height: 30, marginBottom: 2 }}
      >
        {pointers.map((p, i) =>
          p.index >= 0 && p.index < cells.length ? (
            <motion.div
              key={`${p.label ?? 'p'}-${i}`}
              className="absolute flex flex-col items-center"
              initial={false}
              animate={{ left: p.index * pitch + cellSize / 2 }}
              transition={spring}
              style={{ x: '-50%' }}
            >
              <span
                className="rounded px-1 text-[11px] font-bold leading-4"
                style={{
                  color: p.color ?? VIZ.active,
                  backgroundColor: `${p.color ?? VIZ.active}1a`,
                }}
              >
                {p.label ?? 'i'}
              </span>
              <svg width="10" height="8" viewBox="0 0 10 8" aria-hidden>
                <path d="M5 8 0 0h10z" fill={p.color ?? VIZ.active} />
              </svg>
            </motion.div>
          ) : null,
        )}
      </div>

      {/* cells */}
      {cells.length === 0 ? (
        <div className="flex h-12 items-center text-sm text-fd-muted-foreground">
          {emptyText}
        </div>
      ) : (
        <div className="flex" style={{ gap: GAP }}>
          <AnimatePresence mode="popLayout" initial={false}>
            {cells.map((cell, idx) => {
              const state = cell.state ?? 'default';
              return (
                <motion.div
                  key={cell.id}
                  layout
                  initial={{ opacity: 0, y: 18, scale: 0.7 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -18, scale: 0.6 }}
                  transition={spring}
                  className="flex flex-col items-center gap-1"
                >
                  <div
                    className="flex items-center justify-center rounded-lg border-2 text-base font-semibold tabular-nums"
                    style={{
                      width: cellSize,
                      height: cellSize,
                      borderColor: VIZ[state],
                      backgroundColor: tint(state),
                      color: '#1e293b',
                    }}
                  >
                    {cell.value}
                  </div>
                  {showIndices && (
                    <span className="text-[11px] tabular-nums text-fd-muted-foreground">
                      {idx}
                    </span>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
