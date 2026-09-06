'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { VIZ } from '../palette';
import { StepPlayer } from '../step-player';
import { useStepPlayer } from '../use-step-player';

type NodeId = 'start' | 'c1' | 'c2' | 'g1' | 'g2' | 'g3';
type EdgeId = 'start-c1' | 'c1-g1' | 'c1-c2' | 'c2-g2' | 'c2-g3';

interface Frame {
  node: NodeId;
  caption: string;
}

const NODE_STYLE_TRANSITION = 'stroke .3s ease, fill .3s ease, opacity .3s ease';

/**
 * control-structures: an if / else-if / else flowchart. A slider sets marks,
 * the evaluation path lights up frame by frame, ending at the grade output.
 */
export function DecisionFlow() {
  const [marks, setMarks] = useState(75);

  const frames = useMemo<Frame[]>(() => {
    const out: Frame[] = [
      { node: 'start', caption: `marks = ${marks}। চলো শর্তগুলো একটা একটা করে দেখি।` },
      {
        node: 'c1',
        caption:
          marks >= 80
            ? `প্রথম শর্ত: ${marks} >= 80 → true, তাই if block-এ ঢুকব।`
            : `প্রথম শর্ত: ${marks} >= 80 → false, পরের শর্তে যাই।`,
      },
    ];
    if (marks >= 80) {
      out.push({
        node: 'g1',
        caption: 'output: "A+ গ্রেড" ছাপা হলো। বাকি শর্ত আর চেক হয় না।',
      });
      return out;
    }
    out.push({
      node: 'c2',
      caption:
        marks >= 60
          ? `দ্বিতীয় শর্ত: ${marks} >= 60 → true, else if block-এ ঢুকব।`
          : `দ্বিতীয় শর্ত: ${marks} >= 60 → false, else-এ যাই।`,
    });
    out.push(
      marks >= 60
        ? { node: 'g2', caption: 'output: "A গ্রেড" ছাপা হলো।' }
        : { node: 'g3', caption: 'output: "আরও চেষ্টা করো" ছাপা হলো।' },
    );
    return out;
  }, [marks]);

  const player = useStepPlayer(frames.length, 900);
  const frame = frames[player.index];

  // replay whenever marks change (but not on first render)
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    player.reset();
    player.play();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marks]);

  const pathNodes = frames.map((f) => f.node);
  const pathEdges: EdgeId[] = [];
  for (let i = 0; i < pathNodes.length - 1; i++) {
    pathEdges.push(`${pathNodes[i]}-${pathNodes[i + 1]}` as EdgeId);
  }

  const nodeColor = (id: NodeId): { stroke: string; fill: string } => {
    const pos = pathNodes.indexOf(id);
    if (pos === -1 || pos > player.index) {
      return { stroke: '#cbd5e1', fill: '#ffffff' };
    }
    if (pos === player.index) {
      const isOutput = id === 'g1' || id === 'g2' || id === 'g3';
      const c = isOutput ? VIZ.done : VIZ.active;
      return { stroke: c, fill: `${c}1a` };
    }
    return { stroke: VIZ.visited, fill: `${VIZ.visited}0d` };
  };

  const edgeActive = (id: EdgeId) => {
    const pos = pathEdges.indexOf(id);
    return pos !== -1 && pos < player.index;
  };

  const edge = (
    id: EdgeId,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    label: string,
    lx: number,
    ly: number,
  ) => {
    const active = edgeActive(id);
    const color = active ? VIZ.active : '#cbd5e1';
    return (
      <g key={id} style={{ transition: NODE_STYLE_TRANSITION }}>
        <line
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={color}
          strokeWidth={2}
          markerEnd={active ? 'url(#df-arrow-active)' : 'url(#df-arrow-idle)'}
          style={{ transition: NODE_STYLE_TRANSITION }}
        />
        <text
          x={lx}
          y={ly}
          textAnchor="middle"
          fontSize={11}
          fontWeight={700}
          fill={active ? VIZ.active : '#94a3b8'}
          style={{ transition: NODE_STYLE_TRANSITION }}
        >
          {label}
        </text>
      </g>
    );
  };

  const box = (
    id: NodeId,
    x: number,
    y: number,
    w: number,
    h: number,
    rx: number,
    text: string,
    mono = false,
  ) => {
    const { stroke, fill } = nodeColor(id);
    const pos = pathNodes.indexOf(id);
    const dim = pos === -1 || pos > player.index;
    return (
      <g style={{ transition: NODE_STYLE_TRANSITION }}>
        <rect
          x={x}
          y={y}
          width={w}
          height={h}
          rx={rx}
          fill={fill}
          stroke={stroke}
          strokeWidth={2}
          style={{ transition: NODE_STYLE_TRANSITION }}
        />
        <text
          x={x + w / 2}
          y={y + h / 2 + 4}
          textAnchor="middle"
          fontSize={12}
          fontWeight={600}
          fill={dim ? '#94a3b8' : '#1e293b'}
          fontFamily={mono ? 'var(--font-mono, monospace)' : undefined}
          style={{ transition: NODE_STYLE_TRANSITION }}
        >
          {text}
        </text>
      </g>
    );
  };

  const diamond = (id: NodeId, cx: number, cy: number, text: string) => {
    const { stroke, fill } = nodeColor(id);
    const pos = pathNodes.indexOf(id);
    const dim = pos === -1 || pos > player.index;
    return (
      <g style={{ transition: NODE_STYLE_TRANSITION }}>
        <polygon
          points={`${cx},${cy - 46} ${cx + 58},${cy} ${cx},${cy + 46} ${cx - 58},${cy}`}
          fill={fill}
          stroke={stroke}
          strokeWidth={2}
          style={{ transition: NODE_STYLE_TRANSITION }}
        />
        <text
          x={cx}
          y={cy + 4}
          textAnchor="middle"
          fontSize={11}
          fontWeight={600}
          fill={dim ? '#94a3b8' : '#1e293b'}
          fontFamily="var(--font-mono, monospace)"
          style={{ transition: NODE_STYLE_TRANSITION }}
        >
          {text}
        </text>
      </g>
    );
  };

  return (
    <StepPlayer title="ডিসিশন ফ্লো" player={player} caption={frame.caption}>
      <div className="flex w-full max-w-md items-center gap-3">
        <span className="font-mono text-sm font-bold">marks = {marks}</span>
        <input
          type="range"
          min={0}
          max={100}
          value={marks}
          onChange={(e) => setMarks(Number(e.target.value))}
          className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-fd-muted"
          style={{ accentColor: VIZ.active }}
          aria-label="marks"
        />
      </div>

      <svg viewBox="0 0 640 380" className="w-full max-w-xl" role="img">
        <defs>
          <marker
            id="df-arrow-idle"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M0 0L10 5L0 10z" fill="#cbd5e1" />
          </marker>
          <marker
            id="df-arrow-active"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M0 0L10 5L0 10z" fill={VIZ.active} />
          </marker>
        </defs>

        {edge('start-c1', 320, 52, 320, 77, '', 0, 0)}
        {edge('c1-g1', 378, 125, 451, 125, 'হ্যাঁ', 416, 114)}
        {edge('c1-c2', 320, 171, 320, 197, 'না', 336, 190)}
        {edge('c2-g2', 378, 245, 451, 245, 'হ্যাঁ', 416, 234)}
        {edge('c2-g3', 320, 291, 320, 326, 'না', 336, 312)}

        {box('start', 240, 16, 160, 36, 18, `শুরু (marks = ${marks})`)}
        {diamond('c1', 320, 125, 'marks >= 80?')}
        {box('g1', 455, 101, 130, 48, 10, '"A+ গ্রেড" ছাপাও')}
        {diamond('c2', 320, 245, 'marks >= 60?')}
        {box('g2', 455, 221, 130, 48, 10, '"A গ্রেড" ছাপাও')}
        {box('g3', 250, 328, 140, 42, 10, '"আরও চেষ্টা করো"')}
      </svg>
    </StepPlayer>
  );
}
