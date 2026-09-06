'use client';

import { cn } from 'cn';
import { motion } from 'motion/react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { spring } from './palette';

/** Small outline button for visualizer actions (push, assign, create...). */
export function OpButton({
  children,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button variant="outline" size="sm" {...props}>
      {children}
    </Button>
  );
}

/** Compact text/number input that matches the visualizer chrome. */
export function MiniInput({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'h-7 w-28 rounded-md border border-fd-border bg-fd-background px-2 text-sm outline-none focus:border-fd-primary',
        className,
      )}
      {...props}
    />
  );
}

/** Readout like `i = 3` shown beside a visualization. */
export function ReadoutChip({
  label,
  value,
  color = '#64748b',
}: {
  label: string;
  value: ReactNode;
  color?: string;
}) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium tabular-nums"
      style={{ borderColor: color, backgroundColor: `${color}14`, color: '#1e293b' }}
    >
      <span className="text-fd-muted-foreground">{label}</span>
      <span className="font-bold">{value}</span>
    </span>
  );
}

/** Boolean pill: green true / red false. */
export function BoolChip({ value }: { value: boolean }) {
  const color = value ? '#22c55e' : '#ef4444';
  return (
    <span
      className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-bold"
      style={{ borderColor: color, backgroundColor: `${color}14`, color }}
    >
      {value ? 'true' : 'false'}
    </span>
  );
}

/** Segmented control for picking one of a few options. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex rounded-lg border border-fd-border bg-fd-muted/50 p-0.5">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={cn(
              'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
              active
                ? 'bg-fd-background text-fd-foreground shadow-sm'
                : 'text-fd-muted-foreground hover:text-fd-foreground',
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/** On/off switch (truth table style). */
export function Toggle({
  on,
  onToggle,
  label,
}: {
  on: boolean;
  onToggle: () => void;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <button
        type="button"
        onClick={onToggle}
        aria-label={label}
        className={cn(
          'flex h-7 w-12 items-center rounded-full p-1 transition-colors',
          on ? 'justify-end' : 'justify-start',
        )}
        style={{ backgroundColor: on ? '#22c55e' : '#cbd5e1' }}
      >
        <motion.span
          layout
          transition={spring}
          className="size-5 rounded-full bg-white shadow"
        />
      </button>
      <span className="text-sm font-bold">{label}</span>
      <BoolChip value={on} />
    </div>
  );
}
