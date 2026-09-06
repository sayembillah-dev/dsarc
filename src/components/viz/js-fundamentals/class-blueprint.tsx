'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';
import { MiniInput, OpButton } from '../controls';
import { spring, VIZ } from '../palette';
import { StepPlayer } from '../step-player';
import { useStepPlayer } from '../use-step-player';

interface Obj {
  id: string;
  name: string;
  roll: number;
}

interface Frame {
  count: number;
  caption: string;
}

const MAX_OBJECTS = 6;

/**
 * oop-basics: a blueprint card on the left, real object cards on the right.
 * "নতুন Object" presses append frames, so scrubbing replays each `new`.
 */
export function ClassBlueprint() {
  const [objects, setObjects] = useState<Obj[]>([]);
  const [name, setName] = useState('Karim');
  const [roll, setRoll] = useState('6');

  const frames = useMemo<Frame[]>(() => {
    const out: Frame[] = [
      {
        count: 0,
        caption: 'বাঁ পাশে শুধু নকশা (class) আছে, এখনো কোনো বাস্তব object নেই।',
      },
    ];
    objects.forEach((o, i) => {
      out.push({
        count: i + 1,
        caption: `new Student("${o.name}", ${o.roll}): নকশা দেখে object #${i + 1} বানল। নকশা একটাই, object অনেক।`,
      });
    });
    return out;
  }, [objects]);

  const player = useStepPlayer(frames.length, 900);
  const frame = frames[player.index];

  useEffect(() => {
    player.goTo(objects.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [objects]);

  const create = () => {
    const n = objects.length;
    setObjects((prev) => [
      ...prev,
      {
        id: `o${n}`,
        name: name.trim() || `Student${n + 1}`,
        roll: Number(roll) || n + 1,
      },
    ]);
    setRoll(String((Number(roll) || n + 1) + 1));
  };

  const visible = objects.slice(0, frame.count);

  return (
    <StepPlayer
      title="ক্লাস ব্লুপ্রিন্ট থেকে অবজেক্ট"
      player={player}
      caption={frame.caption}
    >
      <div className="flex w-full max-w-2xl flex-col items-center gap-4 sm:flex-row sm:items-start sm:justify-center">
        {/* blueprint card */}
        <div
          className="w-56 shrink-0 rounded-xl border-2 border-dashed bg-fd-background p-3 font-mono text-xs"
          style={{ borderColor: VIZ.visited }}
        >
          <div className="mb-1 text-sm font-bold" style={{ color: VIZ.visited }}>
            class Student
          </div>
          <div className="text-fd-muted-foreground">{'constructor(name, roll) {'}</div>
          <div className="pl-3 text-fd-muted-foreground">this.name = name</div>
          <div className="pl-3 text-fd-muted-foreground">this.roll = roll</div>
          <div className="text-fd-muted-foreground">{'}'}</div>
          <div className="text-fd-muted-foreground">introduce() {'{ ... }'}</div>
        </div>

        {/* objects area */}
        <div className="grid min-h-32 w-full max-w-xs grid-cols-2 content-start gap-2">
          <AnimatePresence mode="popLayout" initial={false}>
            {visible.map((o, i) => (
              <motion.div
                key={o.id}
                layout
                initial={{ opacity: 0, scale: 0.6, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={spring}
                className="rounded-xl border-2 bg-fd-background p-2.5 text-xs"
                style={{
                  borderColor: i === frame.count - 1 ? VIZ.active : '#e2e8f0',
                }}
              >
                <div className="mb-1 font-mono font-bold">student{i + 1}</div>
                <div className="font-mono text-fd-muted-foreground">
                  name: &quot;{o.name}&quot;
                </div>
                <div className="font-mono text-fd-muted-foreground">roll: {o.roll}</div>
                <div className="mt-1 border-t border-fd-border pt-1">
                  আমি {o.name}, roll {o.roll}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {visible.length === 0 && (
            <div className="col-span-2 flex h-32 items-center justify-center rounded-xl border border-fd-border border-dashed text-sm text-fd-muted-foreground">
              এখনো কোনো object নেই
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <MiniInput
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="name"
          aria-label="name"
        />
        <MiniInput
          type="number"
          value={roll}
          onChange={(e) => setRoll(e.target.value)}
          className="w-20"
          aria-label="roll"
        />
        <OpButton onClick={create} disabled={objects.length >= MAX_OBJECTS}>
          নতুন Object
        </OpButton>
        <OpButton onClick={() => setObjects([])} disabled={objects.length === 0}>
          নতুন করে
        </OpButton>
      </div>
    </StepPlayer>
  );
}
