'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Background,
  BackgroundVariant,
  Handle,
  Position,
  ReactFlow,
  useReactFlow,
} from '@xyflow/react';
import type { Edge, Node, NodeProps, XYPosition } from '@xyflow/react';
import { C, Line, Stage, useStepPlayer } from './control-flow';

/* ================================================================== */
/*  react flow setup: custom circular tree node                        */
/* ================================================================== */

type NodeTone = 'default' | 'walk' | 'visited' | 'new' | 'warm' | 'alarm' | 'ghost';

const NODE_TONES: Record<NodeTone, string> = {
  default: 'border-zinc-300 bg-white text-zinc-800',
  walk: 'border-sky-400 bg-sky-50 text-sky-700 shadow-[0_0_0_5px] shadow-sky-100/80',
  visited: 'border-emerald-400 bg-emerald-50 text-emerald-700',
  new: 'border-emerald-400 bg-emerald-50 text-emerald-700',
  warm: 'border-amber-400 bg-amber-50 text-amber-700',
  alarm: 'border-rose-400 bg-rose-50 text-rose-600',
  ghost: 'border-dashed border-zinc-200 bg-transparent text-zinc-300',
};

type BadgeTone = 'zinc' | 'rose' | 'emerald' | 'sky';

const BADGE_TONES: Record<BadgeTone, string> = {
  zinc: 'border-zinc-200 bg-white/95 text-zinc-500',
  rose: 'border-rose-300 bg-rose-50 text-rose-600',
  emerald: 'border-emerald-300 bg-emerald-50 text-emerald-700',
  sky: 'border-sky-300 bg-sky-50 text-sky-700',
};

type TreeNodeData = {
  label: string;
  tone?: NodeTone;
  badge?: string;
  badgeTone?: BadgeTone;
  order?: number;
};

type TreeFlowNode = Node<TreeNodeData, 'treeNode'>;

function TreeNodeView({ data }: NodeProps<TreeFlowNode>) {
  const tone = data.tone ?? 'default';
  return (
    <div className="relative size-11">
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={false}
        style={{ opacity: 0, pointerEvents: 'none' }}
      />
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 24 }}
        className={`absolute inset-0 flex items-center justify-center rounded-full border-2 font-mono text-sm font-semibold transition-colors duration-300 ${NODE_TONES[tone]}`}
      >
        {data.label}
        <AnimatePresence>
          {data.order != null && (
            <motion.span
              key="order"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: 'spring', stiffness: 480, damping: 24 }}
              className="absolute -right-2 -top-2 flex size-5 items-center justify-center rounded-full bg-zinc-900 font-mono text-[10px] font-bold text-white shadow-md"
            >
              {data.order}
            </motion.span>
          )}
        </AnimatePresence>
        {data.badge && (
          <span
            className={`absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border px-1.5 py-px font-mono text-[9px] font-medium shadow-sm ${BADGE_TONES[data.badgeTone ?? 'zinc']}`}
          >
            {data.badge}
          </span>
        )}
      </motion.div>
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={false}
        style={{ opacity: 0, pointerEvents: 'none' }}
      />
    </div>
  );
}

const nodeTypes = { treeNode: TreeNodeView };

/* ================================================================== */
/*  layout + edge helpers                                              */
/* ================================================================== */

type TreeSpec = { id: string; label: string; left?: string; right?: string };

const X_GAP = 58;
const Y_GAP = 76;

/** tidy binary-tree layout: x from in-order index, y from depth */
function layoutBinaryTree(spec: TreeSpec[]): { nodes: TreeFlowNode[]; links: [string, string][] } {
  const byId = new Map(spec.map((s) => [s.id, s]));
  const childIds = new Set(
    spec.flatMap((s) => [s.left, s.right].filter((x): x is string => Boolean(x))),
  );
  const root = spec.find((s) => !childIds.has(s.id)) ?? spec[0];
  const depth = new Map<string, number>();
  const xIdx = new Map<string, number>();
  const links: [string, string][] = [];
  let counter = 0;
  const walk = (id: string, d: number) => {
    const s = byId.get(id);
    if (!s) return;
    depth.set(id, d);
    if (s.left) {
      links.push([id, s.left]);
      walk(s.left, d + 1);
    }
    xIdx.set(id, counter++);
    if (s.right) {
      links.push([id, s.right]);
      walk(s.right, d + 1);
    }
  };
  walk(root.id, 0);
  const nodes: TreeFlowNode[] = spec.map((s) => ({
    id: s.id,
    type: 'treeNode',
    position: { x: (xIdx.get(s.id) ?? 0) * X_GAP, y: (depth.get(s.id) ?? 0) * Y_GAP },
    data: { label: s.label },
  }));
  return { nodes, links };
}

type EdgeTone = 'default' | 'walk' | 'ok' | 'cut' | 'ghost';

const EDGE_STROKES: Record<EdgeTone, { stroke: string; width: number; animated: boolean; dash?: string }> = {
  default: { stroke: '#d4d4d8', width: 1.5, animated: false },
  walk: { stroke: '#38bdf8', width: 2.5, animated: true },
  ok: { stroke: '#34d399', width: 2, animated: false },
  cut: { stroke: '#fb7185', width: 2, animated: true, dash: '7 5' },
  ghost: { stroke: '#e4e4e7', width: 1.5, animated: false, dash: '5 5' },
};

function mkEdge(source: string, target: string, tone: EdgeTone = 'default'): Edge {
  const t = EDGE_STROKES[tone];
  return {
    id: `e-${source}-${target}`,
    source,
    target,
    animated: t.animated,
    style: {
      stroke: t.stroke,
      strokeWidth: t.width,
      ...(t.dash ? { strokeDasharray: t.dash } : {}),
    },
  };
}

function applyEdgeTones(links: [string, string][], tones: Record<string, EdgeTone>): Edge[] {
  return links.map(([a, b]) => mkEdge(a, b, tones[`${a}-${b}`] ?? 'default'));
}

function applyNodeState(
  nodes: TreeFlowNode[],
  states: Record<string, Partial<TreeNodeData>>,
): TreeFlowNode[] {
  return nodes.map((n) => (states[n.id] ? { ...n, data: { ...n.data, ...states[n.id] } } : n));
}

/** sky tones for every edge on the root→node path */
function pathEdgeTones(parent: Record<string, string | null>, id: string): Record<string, EdgeTone> {
  const tones: Record<string, EdgeTone> = {};
  let cur = id;
  while (parent[cur]) {
    const p = parent[cur] as string;
    tones[`${p}-${cur}`] = 'walk';
    cur = p;
  }
  return tones;
}

/* ================================================================== */
/*  smooth position tween (AVL rotation, BST growth)                   */
/* ================================================================== */

function useTweenedNodes(target: TreeFlowNode[], duration = 520): TreeFlowNode[] {
  const [rendered, setRendered] = useState(target);
  const prev = useRef<Map<string, XYPosition>>(
    new Map(target.map((n) => [n.id, n.position])),
  );

  useEffect(() => {
    const from = prev.current;
    prev.current = new Map(target.map((n) => [n.id, n.position]));
    const moving = target.some((n) => {
      const f = from.get(n.id);
      return f !== undefined && (f.x !== n.position.x || f.y !== n.position.y);
    });
    if (!moving) {
      setRendered(target);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const k = Math.min(1, (now - start) / duration);
      const e = 1 - Math.pow(1 - k, 3);
      setRendered(
        target.map((n) => {
          const f = from.get(n.id);
          if (!f) return n;
          return {
            ...n,
            position: {
              x: f.x + (n.position.x - f.x) * e,
              y: f.y + (n.position.y - f.y) * e,
            },
          };
        }),
      );
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return rendered;
}

/* ================================================================== */
/*  flow shell: fixed-height framed canvas over the docs page          */
/* ================================================================== */

function Refit({ dep }: { dep: unknown }) {
  const rf = useReactFlow();
  useEffect(() => {
    const t = window.setTimeout(() => {
      void rf.fitView({ padding: 0.18, duration: 400, maxZoom: 1 });
    }, 60);
    return () => window.clearTimeout(t);
  }, [dep, rf]);
  return null;
}

function TreeFlow({
  nodes,
  edges,
  height = 280,
  refitDep,
}: {
  nodes: TreeFlowNode[];
  edges: Edge[];
  height?: number;
  refitDep?: unknown;
}) {
  return (
    <div
      className="overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50/70"
      style={{ height }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.18, maxZoom: 1 }}
        minZoom={0.3}
        maxZoom={1.3}
        colorMode="light"
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        panOnDrag={false}
        nodesFocusable={false}
        edgesFocusable={false}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1.3} color="#e4e4e7" />
        {refitDep !== undefined && <Refit dep={refitDep} />}
      </ReactFlow>
    </div>
  );
}

/* ------------------------------ viz atoms ------------------------------ */

function ChipRow({ label, chips }: { label: string; chips: string[] }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-11 shrink-0 text-right font-mono text-[10px] uppercase tracking-wider text-zinc-400">
        {label}
      </span>
      <div className="flex min-h-7 flex-1 items-center gap-1 overflow-x-auto">
        <AnimatePresence mode="popLayout" initial={false}>
          {chips.map((c) => (
            <motion.span
              key={c}
              layout
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ type: 'spring', stiffness: 420, damping: 30 }}
              className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-zinc-300 bg-white font-mono text-xs font-semibold text-zinc-700 shadow-sm"
            >
              {c}
            </motion.span>
          ))}
        </AnimatePresence>
        {chips.length === 0 && (
          <span className="font-mono text-[11px] text-zinc-400">খালি</span>
        )}
      </div>
    </div>
  );
}

function VizLabel({ t }: { t: string }) {
  return (
    <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
      {t}
    </span>
  );
}

function ModeTabs({
  modes,
  active,
  onPick,
}: {
  modes: { id: string; label: string }[];
  active: string;
  onPick: (id: string) => void;
}) {
  return (
    <div className="inline-flex items-center gap-1 self-start rounded-full border border-zinc-200 bg-zinc-100/80 p-1">
      {modes.map((m) => (
        <button
          key={m.id}
          type="button"
          onClick={() => onPick(m.id)}
          className={`relative rounded-full px-3 py-1 font-mono text-[11px] font-medium transition ${active === m.id ? 'text-white' : 'text-zinc-500 hover:text-zinc-800'}`}
        >
          {active === m.id && (
            <motion.span
              layoutId="trav-mode"
              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              className="absolute inset-0 rounded-full bg-zinc-900"
            />
          )}
          <span className="relative z-10">{m.label}</span>
        </button>
      ))}
    </div>
  );
}

/* ================================================================== */
/*  shared demo trees                                                  */
/* ================================================================== */

/** 1(2(4,5), 3) — the tree used by the traversal / level-order / bfs-dfs pages */
const FIVE_TREE = layoutBinaryTree([
  { id: '1', label: '1', left: '2', right: '3' },
  { id: '2', label: '2', left: '4', right: '5' },
  { id: '3', label: '3' },
  { id: '4', label: '4' },
  { id: '5', label: '5' },
]);
const FIVE_PARENT: Record<string, string | null> = {
  '1': null,
  '2': '1',
  '3': '1',
  '4': '2',
  '5': '2',
};
const FIVE_EDGES = applyEdgeTones(FIVE_TREE.links, {});

/* ================================================================== */
/*  1. tree-terminology: anatomy of one tree                           */
/* ================================================================== */

const ANATOMY = layoutBinaryTree([
  { id: 'A', label: 'A', left: 'B', right: 'C' },
  { id: 'B', label: 'B', left: 'D', right: 'E' },
  { id: 'C', label: 'C', right: 'F' },
  { id: 'D', label: 'D', left: 'G' },
  { id: 'E', label: 'E' },
  { id: 'F', label: 'F', left: 'H' },
  { id: 'G', label: 'G' },
  { id: 'H', label: 'H' },
]);

const ANATOMY_LINES = [
  'A                ← root',
  'B   C            ← depth 1',
  'D   E   F        ← depth 2',
  'G       H        ← leaves · depth 3',
];
const ANATOMY_CURSOR = [-1, 0, 1, 3, -1, 0, 1, -1];
const ANATOMY_TOTAL = 7;

const ANATOMY_CAPTIONS: ReactNode[] = [
  <>
    এই একটা গাছ দিয়েই আমরা tree-এর পুরো পরিভাষা শিখব। পরের ধাপে চাপো — প্রতি ধাপে একটা
    করে ধারণা গাছের ওপর রং করে দেখিয়ে দেব, আর এখানে তার সহজ ব্যাখ্যা থাকবে।
  </>,
  <>
    সবার উপরের <C t="A" /> হলো <b>root</b> (শিকড়)। root-ই একমাত্র node যার কোনো parent
    নেই — বাকি সবার ঠিক একটা করে parent আছে। গাছের যেকোনো node-এ যাওয়ার পথ শুরু হয় এই
    root থেকেই।
  </>,
  <>
    <C t="A" />-এর সরাসরি নিচে জুড়ে আছে <C t="B" /> আর <C t="C" /> — ওরা A-এর <b>child</b>,
    আর A ওদের <b>parent</b>। একই parent-এর child-রা, যেমন B আর C, পরস্পরের{' '}
    <b>sibling</b>। নীল লাইন দুটো দেখাচ্ছে কার সাথে কার parent-child সম্পর্ক।
  </>,
  <>
    <C t="G" />, <C t="E" />, <C t="H" /> — এই তিনটার নিচে আর কেউ নেই। যেসব node-এর কোনো
    child নেই, তাদের বলে <b>leaf</b> (পাতা)। root থেকে নামা যেকোনো পথ শেষ হয় কোনো না
    কোনো leaf-এ গিয়েই।
  </>,
  <>
    প্রতিটা node-এর নিচের চিপটা দেখাচ্ছে ওর <b>depth</b>: root থেকে ওখানে আসতে কয়টা edge
    পার হতে হয়। depth সবসময় উপর থেকে নিচে মাপা হয় — root-এর depth 0, তার child-দের 1,
    পরের স্তরে 2, একেবারে নিচে 3।
  </>,
  <>
    নীল করে দেখানো হলো গাছের সবচেয়ে লম্বা পথ: <C t="A → B → D → G" /> — মোট ৩টা edge।
    এই সবচেয়ে লম্বা পথের edge-সংখ্যাই tree-এর <b>height</b>। তাই এই গাছের height = 3।
  </>,
  <>
    হলুদ করা অংশটা দেখো: শুধু <C t="B" /> আর তার নিচের সবাই (D, E, G)। এই টুকরো নিজেই
    একটা পূর্ণ গাছ, যার root হলো B — একেই বলে B-এর <b>subtree</b>। আসলে প্রতিটা node-ই তার
    নিচের অংশ নিয়ে একটা subtree-এর root।
  </>,
  <>
    সবুজ লাইনগুলো গুনে দেখো: node ৮টা, edge ৭টা। এটা কাকতাল নয় — root ছাড়া প্রতিটা
    node-এর ঠিক একটা parent, আর প্রতিটা parent–child সম্পর্কই একটা edge। তাই n-টা node-এর
    যেকোনো tree-তে edge থাকবে হুবহু <b>n − 1</b>-টা।
  </>,
];

function anatomyNodes(step: number): TreeFlowNode[] {
  if (step === 1) return applyNodeState(ANATOMY.nodes, { A: { tone: 'walk', badge: 'depth 0', badgeTone: 'sky' } });
  if (step === 2)
    return applyNodeState(ANATOMY.nodes, {
      A: { tone: 'visited' },
      B: { tone: 'walk', badge: 'depth 1', badgeTone: 'sky' },
      C: { tone: 'walk', badge: 'depth 1', badgeTone: 'sky' },
    });
  if (step === 3)
    return applyNodeState(ANATOMY.nodes, {
      G: { tone: 'visited', badge: 'leaf', badgeTone: 'emerald' },
      E: { tone: 'visited', badge: 'leaf', badgeTone: 'emerald' },
      H: { tone: 'visited', badge: 'leaf', badgeTone: 'emerald' },
    });
  if (step === 4)
    return applyNodeState(ANATOMY.nodes, {
      A: { badge: 'd0' },
      B: { badge: 'd1' },
      C: { badge: 'd1' },
      D: { badge: 'd2' },
      E: { badge: 'd2' },
      F: { badge: 'd2' },
      G: { badge: 'd3' },
      H: { badge: 'd3' },
    });
  if (step === 5)
    return applyNodeState(ANATOMY.nodes, {
      A: { tone: 'walk' },
      B: { tone: 'walk' },
      D: { tone: 'walk' },
      G: { tone: 'walk', badge: 'height 3', badgeTone: 'sky' },
    });
  if (step === 6)
    return applyNodeState(ANATOMY.nodes, {
      B: { tone: 'warm' },
      D: { tone: 'warm' },
      E: { tone: 'warm' },
      G: { tone: 'warm' },
    });
  return ANATOMY.nodes;
}

function anatomyEdges(step: number): Edge[] {
  if (step === 2) return applyEdgeTones(ANATOMY.links, { 'A-B': 'walk', 'A-C': 'walk' });
  if (step === 5)
    return applyEdgeTones(ANATOMY.links, { 'A-B': 'walk', 'B-D': 'walk', 'D-G': 'walk' });
  if (step === 7) return applyEdgeTones(ANATOMY.links, {
    'A-B': 'ok', 'A-C': 'ok', 'B-D': 'ok', 'B-E': 'ok', 'C-F': 'ok', 'D-G': 'ok', 'F-H': 'ok',
  });
  return applyEdgeTones(ANATOMY.links, {});
}

export function TreeAnatomyAnim() {
  const { step, playing, toggle, reset, next, prev, done } = useStepPlayer(ANATOMY_TOTAL);
  return (
    <Stage
      title="এক গাছে সব পরিভাষা"
      step={step}
      total={ANATOMY_TOTAL}
      playing={playing}
      done={done}
      onToggle={toggle}
      onReset={reset}
      onNext={next}
      onPrev={prev}
      caption={ANATOMY_CAPTIONS[step]}
      consoleLines={[]}
      hideConsole
      viz={<TreeFlow nodes={anatomyNodes(step)} edges={anatomyEdges(step)} height={330} />}
      lines={ANATOMY_LINES.map((code, i) => (
        <Line key={i} n={i + 1} code={code} cursorId="anat-cursor" active={ANATOMY_CURSOR[step] === i} />
      ))}
    />
  );
}

/* ================================================================== */
/*  2. binary-tree-traversal: pre / in / post with mode tabs           */
/* ================================================================== */

type TravMode = 'pre' | 'in' | 'post';

const TRAV_ORDER: Record<TravMode, string[]> = {
  pre: ['1', '2', '4', '5', '3'],
  in: ['4', '2', '5', '1', '3'],
  post: ['4', '5', '2', '3', '1'],
};
const TRAV_VISIT_LINE: Record<TravMode, number> = { pre: 2, in: 3, post: 4 };
const TRAV_TOTAL = 5;

function travCode(mode: TravMode): string[] {
  const moves: Record<TravMode, [string, string, string]> = {
    pre: ['visit(node);', 'dfs(node.left);', 'dfs(node.right);'],
    in: ['dfs(node.left);', 'visit(node);', 'dfs(node.right);'],
    post: ['dfs(node.left);', 'dfs(node.right);', 'visit(node);'],
  };
  const [a, b, c] = moves[mode];
  return ['function dfs(node) {', '  if (node === null) return;', `  ${a}`, `  ${b}`, `  ${c}`, '}'];
}

const TRAV_CAPTIONS: Record<TravMode, ReactNode[]> = {
  pre: [
    <>
      <b>Pre-order</b>-এর নিয়ম: আগে node নিজে, তারপর বামের সবাই, সবশেষে ডানের সবাই (
      <C t="N → L → R" />)। প্লে চাপো — <b>নীল ঘের</b> দেখাবে কোনটা এখন visit হচ্ছে,{' '}
      <b>সবুজ</b> মানে visit শেষ, আর node-এর ডান-উপরে কালো গোল সংখ্যাটা বলে দেবে সেটি
      কততম visit। উপরের তিনটা চিপ বদলে তিন রকম ক্রমই দেখে নিতে পারো।
    </>,
    <>
      শুরু root 1 দিয়ে। Pre-order-এ node-এ পৌঁছামাত্রই সেটি visit হয় — তাই 1-ই প্রথম।
      এবার নামা হবে ওর বাম দিকে।
    </>,
    <>
      বামে নেমে 2-তে। নিয়ম একই: পৌঁছামাত্র 2 visit হলো (২য়), তারপর আবার ওর বামে নামা
      হবে।
    </>,
    <>
      4-এর কোনো child নেই, তাই ও পৌঁছেই visit (৩য়) — এখানে আর করার কিছু নেই। এবার ফিরে
      যাব parent 2-এর কাছে, কারণ ওর ডান দিক এখনো দেখা হয়নি।
    </>,
    <>
      2-এর ডান child 5 visit হলো (৪র্থ)। এর মানে 2-এর নিচের পুরো অংশ — 4, 2, 5 — দেখা
      শেষ।
    </>,
    <>
      সবশেষে root-এর ডান দিকের 3। চূড়ান্ত ক্রম: <C t="1, 2, 4, 5, 3" />। লক্ষ্য করো —
      প্রতিটা node-ই তার নিচের অংশের সবার আগে এসেছে; এটাই pre-order-এর চেনা ছাপ।
    </>,
  ],
  in: [
    <>
      <b>In-order</b>-এর নিয়ম: আগে বামের সবাই, তারপর node নিজে, তারপর ডানের সবাই (
      <C t="L → N → R" />)। এই ক্রমের বিশেষ গুণ — BST-তে (যেখানে বামে ছোট, ডানে বড়) এটা
      চালালে মানগুলো ছোট থেকে বড় সাজানো হয়ে বেরিয়ে আসে। প্লে চাপো আর কালো সংখ্যাগুলো
      দেখো কে কততমে এলো।
    </>,
    <>
      Root 1-এ এসেও visit করা যাচ্ছে না — নিয়ম বলে আগে বামে নামতে হবে। 2-তেও একই অবস্থা।
      একেবারে বামে গিয়ে leaf 4 পেলাম: ওর বামে কিছু নেই, তাই 4-ই প্রথম visit।
    </>,
    <>
      4-এর ডানেও কিছু নেই, তাই ফিরে এলাম parent 2-তে। 2-এর বাম দিক শেষ — এবার 2 নিজে
      visit হলো (২য়)।
    </>,
    <>
      এবার 2-এর ডান দিক: 5। ওরও child নেই, তাই পৌঁছেই visit (৩য়)। এর সাথে 2-এর নিচের
      পুরো অংশ শেষ: 4, 2, 5।
    </>,
    <>
      পুরো বাম দিক শেষ, তাই এবার root 1 নিজে visit হলো (৪র্থ)। In-order-এ root বসে ঠিক
      মাঝখানে — বামের সবাই তার আগে, ডানের সবাই তার পরে।
    </>,
    <>
      শেষে ডান দিকের 3। চূড়ান্ত ক্রম: <C t="4, 2, 5, 1, 3" />। গাছটা যদি BST হতো, এই
      ক্রমেই ছোট থেকে বড় সাজানো মান পেতে — BST অধ্যায়ে এটা আবার কাজে লাগবে।
    </>,
  ],
  post: [
    <>
      <b>Post-order</b>-এর নিয়ম: আগে বামের সবাই, তারপর ডানের সবাই, সবশেষে node নিজে (
      <C t="L → R → N" />)। অর্থাৎ দুই child-এর কাজ শেষ না হলে parent visit হয় না। height
      বের করা বা পুরো tree delete — যে কাজে child-এর তথ্য আগে চাই, সেখানেই এই ক্রম লাগে।
    </>,
    <>
      Root 1 থেকে নামা শুরু, কিন্তু ওর visit অনেক পরে — আগে বামে। একই কারণে 2-ও অপেক্ষায়।
      গভীরতম বামের leaf 4-এর কোনো child নেই, তাই 4-ই প্রথম visit।
    </>,
    <>ফিরে এসে এবার 2-এর ডান দিক: leaf 5 visit হলো (২য়)।</>,
    <>
      2-এর দুই child-ই শেষ — এখনই 2 visit হলো (৩য়)। খেয়াল করো: দুই child-এর ঠিক পরেই
      parent এলো, এটাই post-order।
    </>,
    <>এবার root-এর ডান দিক: leaf 3 visit হলো (৪র্থ)।</>,
    <>
      বামও শেষ, ডানও শেষ — সবার শেষে root 1। চূড়ান্ত ক্রম: <C t="4, 5, 2, 3, 1" />।
      প্রতিটা parent-ই তার child-দের পরে এসেছে — তাই পুরো গাছ মুছতে হলে এই ক্রমেই মোছা
      নিরাপদ।
    </>,
  ],
};

export function TreeTraversalAnim() {
  const [mode, setMode] = useState<TravMode>('pre');
  const { step, playing, toggle, reset, next, prev, done } = useStepPlayer(TRAV_TOTAL);
  const order = TRAV_ORDER[mode];
  const visited = order.slice(0, step);
  const current = step >= 1 ? order[step - 1] : null;

  const states: Record<string, Partial<TreeNodeData>> = {};
  visited.forEach((id, i) => {
    states[id] = { tone: 'visited', order: i + 1 };
  });
  if (current) states[current] = { tone: 'walk', order: step };
  const nodes = applyNodeState(FIVE_TREE.nodes, states);
  const edges = applyEdgeTones(FIVE_TREE.links, current ? pathEdgeTones(FIVE_PARENT, current) : {});

  const code = travCode(mode);
  const visitLine = TRAV_VISIT_LINE[mode];
  const cursor = step >= 1 ? visitLine : -1;

  return (
    <Stage
      title="তিন রকম DFS: Pre / In / Post"
      step={step}
      total={TRAV_TOTAL}
      playing={playing}
      done={done}
      onToggle={toggle}
      onReset={reset}
      onNext={next}
      onPrev={prev}
      caption={TRAV_CAPTIONS[mode][step]}
      consoleLines={visited}
      viz={
        <div className="flex flex-col gap-3">
          <ModeTabs
            modes={[
              { id: 'pre', label: 'Pre-order' },
              { id: 'in', label: 'In-order' },
              { id: 'post', label: 'Post-order' },
            ]}
            active={mode}
            onPick={(id) => {
              setMode(id as TravMode);
              reset();
            }}
          />
          <TreeFlow nodes={nodes} edges={edges} height={250} />
        </div>
      }
      lines={code.map((c, i) => (
        <Line
          key={i}
          n={i + 1}
          code={c}
          cursorId="trav-cursor"
          active={cursor === i}
          tag={i === visitLine && current ? <C t={`node = ${current}`} /> : undefined}
        />
      ))}
    />
  );
}

/* ================================================================== */
/*  3. level-order-traversal: BFS with a live queue                    */
/* ================================================================== */

const LO_ORDER = ['1', '2', '3', '4', '5'];
const LO_QUEUE: string[][] = [['1'], ['2', '3'], ['3', '4', '5'], ['4', '5'], ['5'], []];
const LO_CURSOR = [2, 5, 5, 5, 5, 5];
const LO_TOTAL = 5;

const LO_CODE = [
  'function levelOrder(root) {',
  '  if (root === null) return;',
  '  const q = [root];',
  '  while (q.length > 0) {',
  '    const node = q.shift();',
  '    visit(node);',
  '    if (node.left) q.push(node.left);',
  '    if (node.right) q.push(node.right);',
  '  }',
  '}',
];

const LO_CAPTIONS: ReactNode[] = [
  <>
    Level-order মানে স্তর বাই স্তর visit: আগে root, তারপর ওর child-রা, তারপর তাদের
    child-রা। এই ক্রম রাখার হাতিয়ার হলো <b>queue</b>, যেটা নিচে লাইভ দেখা যাবে। নিয়ম
    সহজ: সামনে থেকে <C t="shift()" /> করে একটা বের করো, তার child-গুলো <C t="push()" />{' '}
    করে পেছনে জমা দাও। শুরুতে queue-তে শুধু root: <C t="[1]" />।
  </>,
  <>
    1 queue থেকে বের হয়ে visit হলো (১ম)। বের হওয়ামাত্র ওর child 2 আর 3 পেছনে দাঁড়াল —
    queue এখন <C t="[2, 3]" />। লক্ষ্য করো: স্তর 0 শেষ হওয়ামাত্র স্তর 1 queue-তে প্রস্তুত।
  </>,
  <>
    এবার সামনের 2 বের হলো (২য় visit), আর ওর child 4, 5 ঢুকল পেছনে — queue{' '}
    <C t="[3, 4, 5]" />। দেখো, বের হচ্ছে এক স্তরের node, ঢুকছে পরের স্তরের — এভাবেই
    স্তরগুলো কখনো মিশে যায় না।
  </>,
  <>
    3 বের হলো (৩য় visit)। ওর কোনো child নেই, তাই নতুন কিছু ঢুকল না — queue{' '}
    <C t="[4, 5]" />। এর সাথে স্তর 1-ও পুরো শেষ, result-এ <C t="[2, 3]" />।
  </>,
  <>
    4 বের হলো (৪র্থ visit)। queue-তে এখন শুধু 5।
  </>,
  <>
    শেষে 5 বের হলো, queue খালি — traversal শেষ। ক্রম <C t="1 → 2 → 3 → 4 → 5" />, হুবহু
    স্তর বাই স্তর। এই নিখুঁত ক্রমের কারণ queue-এর FIFO নিয়ম: যে আগে ঢুকেছে, সে আগেই
    বেরিয়েছে।
  </>,
];

export function LevelOrderAnim() {
  const { step, playing, toggle, reset, next, prev, done } = useStepPlayer(LO_TOTAL);
  const visited = LO_ORDER.slice(0, step);
  const current = step >= 1 ? LO_ORDER[step - 1] : null;

  const states: Record<string, Partial<TreeNodeData>> = {};
  visited.forEach((id, i) => {
    states[id] = { tone: 'visited', order: i + 1 };
  });
  if (current) states[current] = { tone: 'walk', order: step };
  const nodes = applyNodeState(FIVE_TREE.nodes, states);

  const consoleLines =
    step >= 5 ? ['[1]', '[2, 3]', '[4, 5]'] : step >= 3 ? ['[1]', '[2, 3]'] : step >= 1 ? ['[1]'] : [];

  return (
    <Stage
      title="Level-order: queue দিয়ে স্তরে স্তরে"
      step={step}
      total={LO_TOTAL}
      playing={playing}
      done={done}
      onToggle={toggle}
      onReset={reset}
      onNext={next}
      onPrev={prev}
      caption={LO_CAPTIONS[step]}
      consoleLines={consoleLines}
      viz={
        <div className="flex flex-col gap-2.5">
          <TreeFlow nodes={nodes} edges={FIVE_EDGES} height={250} />
          <ChipRow label="queue" chips={LO_QUEUE[step]} />
        </div>
      }
      lines={LO_CODE.map((c, i) => (
        <Line
          key={i}
          n={i + 1}
          code={c}
          cursorId="lo-cursor"
          active={LO_CURSOR[step] === i}
          tag={i === 5 && current ? <C t={`node = ${current}`} /> : undefined}
        />
      ))}
    />
  );
}

/* ================================================================== */
/*  4 + 5. binary-search-tree: search(7) and insert(5)                 */
/* ================================================================== */

const BST_TREE = layoutBinaryTree([
  { id: '8', label: '8', left: '3', right: '10' },
  { id: '3', label: '3', left: '1', right: '6' },
  { id: '10', label: '10', right: '14' },
  { id: '1', label: '1' },
  { id: '6', label: '6', left: '4', right: '7' },
  { id: '14', label: '14' },
  { id: '4', label: '4' },
  { id: '7', label: '7' },
]);
const BST_PARENT: Record<string, string | null> = {
  '8': null,
  '3': '8',
  '10': '8',
  '1': '3',
  '6': '3',
  '4': '6',
  '7': '6',
  '14': '10',
  '5': '4',
};

/* ---- search(7) ---- */

const BSTS_PATH = ['8', '3', '6', '7'];
const BSTS_CURSOR = [-1, 3, 3, 3, 2];
const BSTS_BUBBLES: ({ expr: string; res: boolean } | undefined)[] = [
  undefined,
  { expr: '7 < 8', res: true },
  { expr: '7 < 3', res: false },
  { expr: '7 < 6', res: false },
  { expr: '7 === 7', res: true },
];
const BSTS_TOTAL = 4;

const BSTS_CODE = [
  'function search(node, key) {',
  '  if (node === null) return null;',
  '  if (key === node.value) return node;',
  '  if (key < node.value) return search(node.left);',
  '  return search(node.right);',
  '}',
];

const BSTS_CAPTIONS: ReactNode[] = [
  <>
    এই গাছে <b>7</b> খুঁজব। BST-এর নিয়ম: প্রতিটা node-এর বামের সবাই ওর চেয়ে ছোট, ডানের
    সবাই বড়। তাই প্রতি node-এ একটাই প্রশ্ন — 7 ওর চেয়ে ছোট না বড়? উত্তরমতো একদিকে
    নামব, আর অন্যদিকের পুরো subtree না দেখেই বাদ দেব। <b>নীল ঘের</b> দেখাবে এখন কোথায়
    দাঁড়িয়ে আছি।
  </>,
  <>
    Root 8-এ তুলনা: <C t="7 < 8" /> — ছোট, তাই বামে নামলাম। এখানেই জাদু: ডানের 10 আর 14
    আর কখনোই দেখা হবে না, কারণ 8-এর চেয়ে বড় সব মান ওই দিকে — 7 সেখানে থাকাই অসম্ভব।
  </>,
  <>
    3-এ তুলনা: <C t="7 > 3" /> — বড়, তাই ডানে। একই যুক্তিতে বামের 1-ও চিরদিনের জন্য বাদ।
  </>,
  <>
    6-এ তুলনা: <C t="7 > 6" /> — আবার ডানে নামলাম।
  </>,
  <>
    <C t="7 === 7" /> — <b>পেয়ে গেছি!</b> গাছে node ছিল 9টা, অথচ দেখা লাগল মাত্র 4টায়।
    প্রতি ধাপে অর্ধেকটা গাছ বাদ পড়ে যায় বলেই BST-এর search এত দ্রুত — হুবহু binary
    search-এর মতো।
  </>,
];

export function BstSearchAnim() {
  const { step, playing, toggle, reset, next, prev, done } = useStepPlayer(BSTS_TOTAL);
  const walked = BSTS_PATH.slice(0, step);
  const current = step >= 1 ? BSTS_PATH[step - 1] : null;

  const states: Record<string, Partial<TreeNodeData>> = {};
  walked.forEach((id) => {
    states[id] = { tone: 'visited' };
  });
  if (current) states[current] = step === BSTS_TOTAL
    ? { tone: 'walk', badge: 'পেলে!', badgeTone: 'emerald' }
    : { tone: 'walk' };
  const nodes = applyNodeState(BST_TREE.nodes, states);
  const edges = applyEdgeTones(BST_TREE.links, current ? pathEdgeTones(BST_PARENT, current) : {});

  return (
    <Stage
      title="BST-এ search(7)"
      step={step}
      total={BSTS_TOTAL}
      playing={playing}
      done={done}
      onToggle={toggle}
      onReset={reset}
      onNext={next}
      onPrev={prev}
      caption={BSTS_CAPTIONS[step]}
      consoleLines={[]}
      hideConsole
      viz={
        <div className="flex flex-col gap-2.5">
          <VizLabel t="লক্ষ্য: 7" />
          <TreeFlow nodes={nodes} edges={edges} height={310} />
        </div>
      }
      lines={BSTS_CODE.map((c, i) => (
        <Line
          key={i}
          n={i + 1}
          code={c}
          cursorId="bsts-cursor"
          active={BSTS_CURSOR[step] === i}
          bubble={BSTS_CURSOR[step] === i ? BSTS_BUBBLES[step] : undefined}
        />
      ))}
    />
  );
}

/* ---- insert(5) ---- */

const BSTI_FINAL = layoutBinaryTree([
  { id: '8', label: '8', left: '3', right: '10' },
  { id: '3', label: '3', left: '1', right: '6' },
  { id: '10', label: '10', right: '14' },
  { id: '1', label: '1' },
  { id: '6', label: '6', left: '4', right: '7' },
  { id: '14', label: '14' },
  { id: '4', label: '4', right: '5' },
  { id: '7', label: '7' },
  { id: '5', label: '5' },
]);

const BSTI_PATH = ['8', '3', '6', '4'];
const BSTI_CURSOR = [-1, 2, 3, 2, 3, 1, 1];
const BSTI_BUBBLES: ({ expr: string; res: boolean } | undefined)[] = [
  undefined,
  { expr: '5 < 8', res: true },
  { expr: '5 < 3', res: false },
  { expr: '5 < 6', res: true },
  { expr: '5 < 4', res: false },
  undefined,
  undefined,
];
const BSTI_TOTAL = 6;

const BSTI_CODE = [
  'function insert(node, key) {',
  '  if (node === null) return new TreeNode(key);',
  '  if (key < node.value) node.left = insert(node.left, key);',
  '  else node.right = insert(node.right, key);',
  '  return node;',
  '}',
];

const BSTI_CAPTIONS: ReactNode[] = [
  <>
    এই BST-তে নতুন মান <b>5</b> ঢোকাব। কৌশল সহজ: search-এর মতো তুলনা করে নামতে থাকো;
    যেখানে ফাঁকা জায়গা (<C t="null" />) পাবে, সেখানেই নতুন node বসে যাবে।{' '}
    <b>নীল ঘের</b> দেখাবে এখন কোন node-এর সাথে তুলনা হচ্ছে।
  </>,
  <>
    Root 8-এ তুলনা: <C t="5 < 8" /> — ছোট, তাই বামে নামলাম।
  </>,
  <>
    3-এ: <C t="5 > 3" /> — বড়, তাই ডানে।
  </>,
  <>
    6-এ: <C t="5 < 6" /> — ছোট, তাই বামে; পৌঁছে গেলাম 4-এর কাছে।
  </>,
  <>
    4-এ: <C t="5 > 4" /> — বড়, তাই ডানে যেতে চাই…
  </>,
  <>
    …কিন্তু 4-এর ডানে কিছু নেই, <C t="null" />! ড্যাশ করা ফাঁকা গোলটাই 5-এর ভবিষ্যৎ জায়গা।
    খেয়াল করো — অন্য কোনো node-কে একচুলও সরাতে হয়নি।
  </>,
  <>
    সেই জায়গাতেই <C t="new TreeNode(5)" /> বসে গেল, আর গাছ নিজেকে নতুন আকারে সাজিয়ে নিল।
    পুরো insert-এ বদলাল মাত্র একটা pointer (4-এর right) — তাই খরচ <C t="O(h)" />, অর্থাৎ
    গাছের height সমান ধাপ।
  </>,
];

export function BstInsertAnim() {
  const { step, playing, toggle, reset, next, prev, done } = useStepPlayer(BSTI_TOTAL);
  const walked = BSTI_PATH.slice(0, Math.min(step, 4));
  const current = step >= 1 && step <= 4 ? BSTI_PATH[step - 1] : null;
  const placed = step >= BSTI_TOTAL;

  const target = useMemo(() => {
    if (!placed) {
      const base = applyNodeState(BST_TREE.nodes, bstiStates(walked, current));
      if (step === 5) {
        const spot = BSTI_FINAL.nodes.find((n) => n.id === '5') as TreeFlowNode;
        return [
          ...base,
          { ...spot, id: 'g5', data: { label: '5', tone: 'ghost' as NodeTone } },
        ];
      }
      return base;
    }
    return applyNodeState(BSTI_FINAL.nodes, {
      ...bstiStates(walked, null),
      '5': { tone: 'new', badge: 'বসল!', badgeTone: 'emerald' },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, placed]);

  const nodes = useTweenedNodes(target);

  const edges = useMemo(() => {
    if (!placed) {
      const base = applyEdgeTones(
        BST_TREE.links,
        current ? pathEdgeTones(BST_PARENT, current) : step === 5 ? pathEdgeTones(BST_PARENT, '4') : {},
      );
      return step === 5 ? [...base, mkEdge('4', 'g5', 'ghost')] : base;
    }
    return applyEdgeTones(BSTI_FINAL.links, { ...pathEdgeTones(BST_PARENT, '4'), '4-5': 'ok' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, placed]);

  return (
    <Stage
      title="BST-এ insert(5)"
      step={step}
      total={BSTI_TOTAL}
      playing={playing}
      done={done}
      onToggle={toggle}
      onReset={reset}
      onNext={next}
      onPrev={prev}
      caption={BSTI_CAPTIONS[step]}
      consoleLines={[]}
      hideConsole
      viz={
        <div className="flex flex-col gap-2.5">
          <VizLabel t="ঢুকছে: 5" />
          <TreeFlow nodes={nodes} edges={edges} height={350} refitDep={placed || step === 5} />
        </div>
      }
      lines={BSTI_CODE.map((c, i) => (
        <Line
          key={i}
          n={i + 1}
          code={c}
          cursorId="bsti-cursor"
          active={BSTI_CURSOR[step] === i}
          bubble={BSTI_CURSOR[step] === i ? BSTI_BUBBLES[step] : undefined}
        />
      ))}
    />
  );
}

function bstiStates(
  walked: string[],
  current: string | null,
): Record<string, Partial<TreeNodeData>> {
  const states: Record<string, Partial<TreeNodeData>> = {};
  walked.forEach((id) => {
    states[id] = { tone: 'visited' };
  });
  if (current) states[current] = { tone: 'walk' };
  return states;
}

/* ================================================================== */
/*  6. avl-tree: 1,2,3 insert → RR break → left rotation               */
/* ================================================================== */

const AVL_CHAIN = layoutBinaryTree([
  { id: '1', label: '1', right: '2' },
  { id: '2', label: '2', right: '3' },
  { id: '3', label: '3' },
]);
const AVL_FIXED = layoutBinaryTree([
  { id: '2', label: '2', left: '1', right: '3' },
  { id: '1', label: '1' },
  { id: '3', label: '3' },
]);

const AVL_CURSOR = [-1, -1, -1, -1, 1, 3, 5];
const AVL_TOTAL = 6;

const AVL_CODE = [
  'function rotateLeft(y) {',
  '  const x = y.right;',
  '  const t2 = x.left;',
  '  x.left = y;',
  '  y.right = t2;',
  '  return x;   // subtree-এর নতুন root',
  '}',
];

const AVL_CAPTIONS: ReactNode[] = [
  <>
    একে একে 1, 2, 3 insert করি, আর দেখি AVL কীভাবে নিজে থেকেই ভারসাম্য ঠিক করে। প্রতিটা
    node-এর নিচের চিপে <b>bf</b> = balance factor, অর্থাৎ বাম দিক আর ডান দিকের height-এর
    পার্থক্য। bf যদি কখনো 2 বা −2 ছোঁয়, AVL সঙ্গে সঙ্গে গাছ ঘুরিয়ে (rotation) ঠিক করে দেয়।
  </>,
  <>
    <C t="insert(1)" />: গাছে এটাই প্রথম node, root হয়ে বসল। ভারসাম্য নিয়ে এখন ভাবার
    কিছু নেই।
  </>,
  <>
    <C t="insert(2)" />: 2 &gt; 1, তাই 1-এর ডানে বসল। এখন 1-এর <C t="bf = −1" />, মানে ডান
    দিক এক ধাপ লম্বা। bf যতক্ষণ −1, 0 বা +1-এর মধ্যে, গাছ balanced ধরা হয় — এখনো সব ঠিক।
  </>,
  <>
    <C t="insert(3)" />: আবারও ডানে! এবার 1-এর <C t="bf = −2" /> — সীমা ছাড়াল, তাই node-টা
    লাল হয়ে সতর্ক করছে। এই ভাঙনের নাম <b>RR case</b> (ডানে-ডানে ভারী), আর এর ফিক্স একটাই:{' '}
    <b>left rotation</b>।
  </>,
  <>
    Rotation শুরু। pivot হিসেবে নেওয়া হলো <C t="x = 2" /> (নীল ঘের): 2 উঠে নতুন root হবে,
    আর 1 নেমে যাবে ওর বামে। 1–2-এর কাটা লাল লাইনটা দেখাচ্ছে কোন সংযোগটা আলগা হয়ে নতুন করে
    বাঁধবে।
  </>,
  <>
    Rotation শেষ: 2 উপরে উঠে root, আর 1 বসে গেল ওর বামে (কোডের <C t="x.left = y" /> লাইনটা)।
    খেয়াল করো, BST নিয়ম কিন্তু অক্ষত আছে — এখনো <C t="1 < 2 < 3" />।
  </>,
  <>
    ফলাফল: তিনটা node-এরই bf এখন <C t="0" />, আর গাছের height কমে 3 থেকে 2-তে। মাত্র একটা
    ঘূর্ণনে ডানে-ঝুঁকে-থাকা শিকলি বদলে গেল ভারসাম্যপূর্ণ গাছে — AVL-এর গতি আসে এই ছোট্ট
    ফিক্স থেকেই।
  </>,
];

function avlNodes(step: number): TreeFlowNode[] {
  if (step <= 3) {
    const chain: Record<number, Record<string, Partial<TreeNodeData>>> = {
      1: { '1': { tone: 'new' } },
      2: { '1': { badge: 'bf −1' }, '2': { tone: 'new' } },
      3: {
        '1': { tone: 'alarm', badge: 'bf −2', badgeTone: 'rose' },
        '2': { badge: 'bf −1' },
        '3': { tone: 'new' },
      },
    };
    const shown = new Set([
      ...(step >= 1 ? ['1'] : []),
      ...(step >= 2 ? ['2'] : []),
      ...(step >= 3 ? ['3'] : []),
    ]);
    const states = chain[step] ?? {};
    return applyNodeState(AVL_CHAIN.nodes, states).filter((n) => shown.has(n.id));
  }
  if (step === 4)
    return applyNodeState(AVL_CHAIN.nodes, {
      '1': { tone: 'alarm', badge: 'bf −2', badgeTone: 'rose' },
      '2': { tone: 'walk', badge: 'pivot', badgeTone: 'sky' },
      '3': {},
    });
  if (step === 5) return AVL_FIXED.nodes;
  return applyNodeState(AVL_FIXED.nodes, {
    '1': { tone: 'visited', badge: 'bf 0', badgeTone: 'emerald' },
    '2': { tone: 'visited', badge: 'bf 0', badgeTone: 'emerald' },
    '3': { tone: 'visited', badge: 'bf 0', badgeTone: 'emerald' },
  });
}

function avlEdges(step: number): Edge[] {
  if (step <= 1) return [];
  if (step <= 3) return applyEdgeTones(AVL_CHAIN.links.slice(0, step - 1), {});
  if (step === 4) return applyEdgeTones(AVL_CHAIN.links, { '1-2': 'cut' });
  return applyEdgeTones(AVL_FIXED.links, { '2-1': 'ok', '2-3': 'ok' });
}

export function AvlRotationAnim() {
  const { step, playing, toggle, reset, next, prev, done } = useStepPlayer(AVL_TOTAL);
  const target = useMemo(() => avlNodes(step), [step]);
  const nodes = useTweenedNodes(target);
  const edges = useMemo(() => avlEdges(step), [step]);

  return (
    <Stage
      title="AVL: 1, 2, 3 insert আর left rotation"
      step={step}
      total={AVL_TOTAL}
      playing={playing}
      done={done}
      onToggle={toggle}
      onReset={reset}
      onNext={next}
      onPrev={prev}
      caption={AVL_CAPTIONS[step]}
      consoleLines={[]}
      hideConsole
      viz={<TreeFlow nodes={nodes} edges={edges} height={260} />}
      lines={AVL_CODE.map((c, i) => (
        <Line key={i} n={i + 1} code={c} cursorId="avl-cursor" active={AVL_CURSOR[step] === i} />
      ))}
    />
  );
}

/* ================================================================== */
/*  7. bfs-dfs-on-tree: same tree, stack vs queue, side by side        */
/* ================================================================== */

const DFS_ORDER = ['1', '2', '4', '5', '3'];
const BFS_ORDER = ['1', '2', '3', '4', '5'];
const DFS_STACK: string[][] = [['1'], ['3', '2'], ['3', '5', '4'], ['3', '5'], ['3'], []];
const BFS_QUEUE: string[][] = [['1'], ['2', '3'], ['3', '4', '5'], ['4', '5'], ['5'], []];
const CMP_TOTAL = 5;

const CMP_LINES = [
  'const stack = [root];   // DFS-এর হাতিয়ার — LIFO',
  'const queue = [root];   // BFS-এর হাতিয়ার — FIFO',
  '',
  '// DFS: pop → visit → child push (ডান আগে, তাই বাম top-এ)',
  '// BFS: shift → visit → child push (বাম থেকে ডানে সিরিয়ালে)',
];

const CMP_CAPTIONS: ReactNode[] = [
  <>
    একই গাছের ওপর পাশাপাশি দৌড়াবে দুই কৌশল: বামে <b>DFS</b> (আগে গভীরে), ডানে <b>BFS</b>{' '}
    (আগে পাশে)। পার্থক্য আসে তাদের হাতিয়ার থেকে — DFS-এর <b>stack</b>-এ শেষে ঢুকা আগে বের
    হয় (LIFO), BFS-এর <b>queue</b>-তে আগে ঢুকা আগে বের হয় (FIFO)। নিচে দুটোর stack আর
    queue লাইভ দেখা যাবে। প্লে চাপো!
  </>,
  <>
    দুটোই root 1 দিয়ে শুরু করল। এবার child জমা দেওয়ার পালা: DFS ডান child (3) আগে push
    করে, তাই বাম child 2 stack-এর top-এ উঠে এসেছে — stack-এ পরে ঢুকলেই top। আর BFS বাম
    থেকে ডানে ঢুকিয়েছে, তাই queue-র সামনে 2, পেছনে 3।
  </>,
  <>
    দুটোই 2 visit করল, কিন্তু এখন থেকে পথ আলাদা। DFS-এর stack-এ 2-এর child-রা উপরে উঠে
    গেছে — top-এ এখন গভীরের 4। আর BFS-এর queue-র সামনে এখনো সেই পুরনো 3, কারণ ও আগে
    ঢুকেছিল।
  </>,
  <>
    তাই DFS ঝাঁপ দিল একেবারে গভীরের 4-এ, আর BFS নিল পাশের 3-কে — BFS-এর কাছে পুরো স্তর 1
    শেষ করা আগে।
  </>,
  <>
    DFS এগিয়ে 5-এ, BFS এসে 4-এ। দুটোরই আর একটা করে node বাকি, কিন্তু ক্রম এতক্ষণে পুরো
    ভিন্ন হয়ে গেছে।
  </>,
  <>
    শেষ ধাপ: DFS সবশেষে নিল 3-কে — ডান subtree-টা সে পুরোটা শেষের দিকে ঠেলে দিয়েছিল; আর
    BFS-এর শেষে 5। নিচের কনসোলে দুটোর পুরো ক্রম মিলিয়ে দেখো: একই গাছ, একই node-গুলো —
    শুধু stack আর queue-র ফারাকে ক্রম বদলে গেল।
  </>,
];

function cmpNodes(order: string[], step: number): TreeFlowNode[] {
  const states: Record<string, Partial<TreeNodeData>> = {};
  order.slice(0, step).forEach((id, i) => {
    states[id] = { tone: 'visited', order: i + 1 };
  });
  if (step >= 1) states[order[step - 1]] = { tone: 'walk', order: step };
  return applyNodeState(FIVE_TREE.nodes, states);
}

export function BfsDfsTreeAnim() {
  const { step, playing, toggle, reset, next, prev, done } = useStepPlayer(CMP_TOTAL);
  const consoleLines =
    step === 0
      ? []
      : [
          `DFS   ${DFS_ORDER.slice(0, step).join(' → ')}`,
          `BFS   ${BFS_ORDER.slice(0, step).join(' → ')}`,
        ];

  return (
    <Stage
      title="DFS বনাম BFS: একই গাছ, দুই পথ"
      step={step}
      total={CMP_TOTAL}
      playing={playing}
      done={done}
      onToggle={toggle}
      onReset={reset}
      onNext={next}
      onPrev={prev}
      caption={CMP_CAPTIONS[step]}
      consoleLines={consoleLines}
      viz={
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <VizLabel t="DFS — stack (LIFO)" />
            <TreeFlow nodes={cmpNodes(DFS_ORDER, step)} edges={FIVE_EDGES} height={205} />
            <ChipRow label="stack" chips={DFS_STACK[step]} />
          </div>
          <div className="flex flex-col gap-2">
            <VizLabel t="BFS — queue (FIFO)" />
            <TreeFlow nodes={cmpNodes(BFS_ORDER, step)} edges={FIVE_EDGES} height={205} />
            <ChipRow label="queue" chips={BFS_QUEUE[step]} />
          </div>
        </div>
      }
      lines={CMP_LINES.map((c, i) => (
        <Line key={i} n={i + 1} code={c} cursorId="cmp-cursor" active={false} />
      ))}
    />
  );
}
