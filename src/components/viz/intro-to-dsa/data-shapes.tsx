'use client';

import { motion } from 'motion/react';
import { HintLine, Segmented } from '../controls';
import { spring, VIZ } from '../palette';
import { StepPlayer } from '../step-player';
import { useStepPlayer } from '../use-step-player';

type Shape = 'array' | 'object' | 'set';
const SHAPES: Shape[] = ['array', 'object', 'set'];

const NAMES = [
  { id: 'n1', key: 's1', value: 'Rahim' },
  { id: 'n2', key: 's2', value: 'Karim' },
  { id: 'n3', key: 's3', value: 'Jamal' },
];

const INFO: Record<Shape, { caption: string; code: string; note: string }> = {
  array: {
    caption: "Array: মানগুলো ক্রম ধরে পাশাপাশি বসে, index দিয়ে তোলা যায় — names[1] = 'Karim'।",
    code: 'names[1]  →  "Karim"',
    note: 'ক্রম আছে, index 0 থেকে',
  },
  object: {
    caption: "Object: প্রতিটা মান একটা key-র সাথে বাঁধা — roster.s2 = 'Karim', index গুনতে হয় না।",
    code: 'roster.s2  →  "Karim"',
    note: 'key দিয়ে সোজা খোঁজা',
  },
  set: {
    caption: "Set: শুধু ইউনিক মান, ক্রমের কোনো প্রতিশ্রুতি নেই — set.has('Karim') মুহূর্তেই true বলে দেয়।",
    code: 'set.has("Karim")  →  true',
    note: 'ইউনিক মান, ক্রম নেই',
  },
};

/** Set view deliberately shows a shuffled order: a Set promises uniqueness, not order. */
const SET_ORDER = ['n2', 'n1', 'n3'];

/**
 * what-are-data-structures: the same three names morph between Array,
 * Object and Set layouts. One player index = one shape, so the transport
 * and the segmented picker stay in sync.
 */
export function DataShapes() {
  const player = useStepPlayer(SHAPES.length, 1400);
  const shape = SHAPES[player.index];

  const ordered =
    shape === 'set'
      ? SET_ORDER.map((id) => NAMES.find((n) => n.id === id)!)
      : NAMES;

  return (
    <StepPlayer title="একই ডেটা, তিন কাঠামো" player={player} caption={INFO[shape].caption}>
      <HintLine>নিচের বাটনে (বা ▶ এ) কাঠামো বদলাও — নাম ৩টা একই থাকে, শুধু বিন্যাস বদলায়</HintLine>

      <Segmented
        options={[
          { value: 'array', label: 'Array' },
          { value: 'object', label: 'Object' },
          { value: 'set', label: 'Set' },
        ]}
        value={shape}
        onChange={(v) => player.goTo(SHAPES.indexOf(v))}
      />

      <div
        className={
          shape === 'object'
            ? 'flex flex-col items-stretch gap-2'
            : 'flex flex-wrap items-center justify-center gap-3'
        }
        style={
          shape === 'set'
            ? { border: `1.5px dashed ${VIZ.default}`, borderRadius: 12, padding: '14px 18px' }
            : undefined
        }
      >
        {ordered.map((n, i) => (
          <motion.div
            key={n.id}
            layout
            transition={spring}
            className="flex items-center gap-2 rounded-lg border bg-fd-background px-3 py-1.5"
            style={{ borderColor: `${VIZ.default}55` }}
          >
            {shape === 'object' && (
              <span
                className="rounded border px-1.5 py-0.5 text-xs font-bold"
                style={{ borderColor: VIZ.active, color: VIZ.active, backgroundColor: `${VIZ.active}14` }}
              >
                {n.key}
              </span>
            )}
            <span className="text-sm font-semibold">{n.value}</span>
            {shape === 'array' && (
              <span className="text-xs text-fd-muted-foreground">index {i}</span>
            )}
          </motion.div>
        ))}
      </div>

      <code
        className="rounded-md border px-3 py-1.5 text-xs font-semibold"
        style={{ borderColor: VIZ.done, backgroundColor: `${VIZ.done}14`, color: '#1e293b' }}
      >
        {INFO[shape].code}
      </code>
      <span className="text-xs text-fd-muted-foreground">{INFO[shape].note}</span>
    </StepPlayer>
  );
}
