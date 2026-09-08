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
  sub?: string;
  tone?: NodeTone;
  badge?: string;
  badgeTone?: BadgeTone;
  order?: number;
};

type TreeFlowNode = Node<TreeNodeData, 'treeNode'>;

function TreeNodeView({ data }: NodeProps<TreeFlowNode>) {
  const tone = data.tone ?? 'default';
  return (
    <div className="relative w-fit min-w-11">
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
        className={`relative flex h-11 min-w-11 flex-col items-center justify-center rounded-full border-2 px-3 py-1 font-mono text-sm font-semibold transition-colors duration-300 ${NODE_TONES[tone]}`}
      >
        <span className="leading-none">{data.label}</span>
        {data.sub && (
          <span className="mt-0.5 text-[9px] font-medium uppercase leading-none tracking-wide opacity-60">
            {data.sub}
          </span>
        )}
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

type TreeSpec = { id: string; label: string; sub?: string; left?: string; right?: string };

const X_GAP = 58;
const Y_GAP = 76;

/** tidy binary-tree layout: x from in-order index, y from depth */
function layoutBinaryTree(
  spec: TreeSpec[],
  gaps: { x?: number; y?: number } = {},
): { nodes: TreeFlowNode[]; links: [string, string][] } {
  const xGap = gaps.x ?? X_GAP;
  const yGap = gaps.y ?? Y_GAP;
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
    position: { x: (xIdx.get(s.id) ?? 0) * xGap, y: (depth.get(s.id) ?? 0) * yGap },
    data: { label: s.label, sub: s.sub },
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
              className="flex h-7 min-w-7 shrink-0 items-center justify-center rounded-lg border border-zinc-300 bg-white px-2 font-mono text-xs font-semibold text-zinc-700 shadow-sm"
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

/** dsarc(src(app, components), content) — this repo's folder tree, used by the traversal / level-order / bfs-dfs pages */
const REPO_TREE = layoutBinaryTree(
  [
    { id: 'dsarc', label: 'dsarc', left: 'src', right: 'content' },
    { id: 'src', label: 'src', left: 'app', right: 'components' },
    { id: 'content', label: 'content' },
    { id: 'app', label: 'app' },
    { id: 'components', label: 'components' },
  ],
  { x: 118, y: 78 },
);
const REPO_PARENT: Record<string, string | null> = {
  dsarc: null,
  src: 'dsarc',
  content: 'dsarc',
  app: 'src',
  components: 'src',
};
const REPO_EDGES = applyEdgeTones(REPO_TREE.links, {});

/* ================================================================== */
/*  1. tree-terminology: anatomy of one tree                           */
/* ================================================================== */

const ANATOMY = layoutBinaryTree(
  [
    { id: 'dsarc', label: 'dsarc/', left: 'src', right: 'content' },
    { id: 'src', label: 'src/', left: 'app', right: 'lib' },
    { id: 'content', label: 'content/', right: 'docs' },
    { id: 'app', label: 'app/', left: 'page.tsx' },
    { id: 'lib', label: 'lib/' },
    { id: 'docs', label: 'docs/', left: 'trees.mdx' },
    { id: 'page.tsx', label: 'page.tsx' },
    { id: 'trees.mdx', label: 'trees.mdx' },
  ],
  { x: 118, y: 84 },
);

const ANATOMY_LINES = [
  'dsarc/                        ← root',
  'src/   content/               ← depth 1',
  'app/  lib/     docs/          ← depth 2',
  'page.tsx       trees.mdx      ← leaves · depth 3',
];
const ANATOMY_CURSOR = [-1, 0, 1, 3, -1, 0, 1, -1];
const ANATOMY_TOTAL = 7;

const ANATOMY_CAPTIONS: ReactNode[] = [
  <>
    এই ছোট্ট প্রজেক্ট-ফোল্ডারটা দিয়েই আমরা tree-এর পুরো পরিভাষা শিখব — কারণ যেকোনো
    রিপোজিটরির ফোল্ডার-কাঠামোই আসলে একটা tree। পরের ধাপে চাপো — প্রতি ধাপে একটা করে
    ধারণা গাছের ওপর রং করে দেখিয়ে দেব, আর এখানে তার সহজ ব্যাখ্যা থাকবে।
  </>,
  <>
    সবার উপরের <C t="dsarc/" /> হলো <b>root</b> (শিকড়) — প্রজেক্টের মূল ফোল্ডার। root-ই
    একমাত্র node যার কোনো parent নেই — বাকি সবার ঠিক একটা করে parent আছে। গাছের যেকোনো
    node-এ যাওয়ার পথ শুরু হয় এই root থেকেই।
  </>,
  <>
    <C t="dsarc/" />-এর সরাসরি ভেতরে আছে <C t="src/" /> আর <C t="content/" /> — ওরা
    dsarc-এর <b>child</b>, আর dsarc ওদের <b>parent</b>। একই parent-এর child-রা, যেমন src
    আর content, পরস্পরের <b>sibling</b>। নীল লাইন দুটো দেখাচ্ছে কার সাথে কার parent-child
    সম্পর্ক।
  </>,
  <>
    <C t="page.tsx" />, <C t="lib/" />, <C t="trees.mdx" /> — এই তিনটার নিচে আর কিছু নেই।
    যেসব node-এর কোনো child নেই, তাদের বলে <b>leaf</b> (পাতা)। ফাইল স্বভাবতই leaf —
    ফাইলের ভেতরে তো আর ফোল্ডার থাকে না।
  </>,
  <>
    প্রতিটা node-এর নিচের চিপটা দেখাচ্ছে ওর <b>depth</b>: root থেকে ওখানে আসতে কয়টা edge
    পার হতে হয়। depth সবসময় উপর থেকে নিচে মাপা হয় — root-এর depth 0, তার child-দের 1,
    পরের স্তরে 2, একেবারে নিচে 3।
  </>,
  <>
    নীল করে দেখানো হলো গাছের সবচেয়ে গভীর পথ: <C t="dsarc → src → app → page.tsx" /> —
    মোট ৩টা edge। এই সবচেয়ে লম্বা পথের edge-সংখ্যাই tree-এর <b>height</b>, তাই height =
    3। Editor-এ এই ফাইলটা খুলতেও তোমাকে ঠিক ৩টা ফোল্ডার ঢুকতে হয়।
  </>,
  <>
    হলুদ করা অংশটা দেখো: শুধু <C t="src/" /> আর তার ভেতরের সবাই (app, lib, page.tsx)। এই
    টুকরো নিজেই একটা পূর্ণ গাছ, যার root হলো src — একেই বলে src-এর <b>subtree</b>। আসলে
    প্রতিটা ফোল্ডারই তার ভেতরের অংশ নিয়ে একটা subtree-এর root।
  </>,
  <>
    সবুজ লাইনগুলো গুনে দেখো: node ৮টা, edge ৭টা। এটা কাকতাল নয় — root ছাড়া প্রতিটা
    node-এর ঠিক একটা parent, আর প্রতিটা parent–child সম্পর্কই একটা edge। তাই n-টা node-এর
    যেকোনো tree-তে edge থাকবে হুবহু <b>n − 1</b>-টা।
  </>,
];

function anatomyNodes(step: number): TreeFlowNode[] {
  if (step === 1)
    return applyNodeState(ANATOMY.nodes, {
      dsarc: { tone: 'walk', badge: 'depth 0', badgeTone: 'sky' },
    });
  if (step === 2)
    return applyNodeState(ANATOMY.nodes, {
      dsarc: { tone: 'visited' },
      src: { tone: 'walk', badge: 'depth 1', badgeTone: 'sky' },
      content: { tone: 'walk', badge: 'depth 1', badgeTone: 'sky' },
    });
  if (step === 3)
    return applyNodeState(ANATOMY.nodes, {
      'page.tsx': { tone: 'visited', badge: 'leaf', badgeTone: 'emerald' },
      lib: { tone: 'visited', badge: 'leaf', badgeTone: 'emerald' },
      'trees.mdx': { tone: 'visited', badge: 'leaf', badgeTone: 'emerald' },
    });
  if (step === 4)
    return applyNodeState(ANATOMY.nodes, {
      dsarc: { badge: 'd0' },
      src: { badge: 'd1' },
      content: { badge: 'd1' },
      app: { badge: 'd2' },
      lib: { badge: 'd2' },
      docs: { badge: 'd2' },
      'page.tsx': { badge: 'd3' },
      'trees.mdx': { badge: 'd3' },
    });
  if (step === 5)
    return applyNodeState(ANATOMY.nodes, {
      dsarc: { tone: 'walk' },
      src: { tone: 'walk' },
      app: { tone: 'walk' },
      'page.tsx': { tone: 'walk', badge: 'height 3', badgeTone: 'sky' },
    });
  if (step === 6)
    return applyNodeState(ANATOMY.nodes, {
      src: { tone: 'warm' },
      app: { tone: 'warm' },
      lib: { tone: 'warm' },
      'page.tsx': { tone: 'warm' },
    });
  return ANATOMY.nodes;
}

function anatomyEdges(step: number): Edge[] {
  if (step === 2)
    return applyEdgeTones(ANATOMY.links, { 'dsarc-src': 'walk', 'dsarc-content': 'walk' });
  if (step === 5)
    return applyEdgeTones(ANATOMY.links, {
      'dsarc-src': 'walk',
      'src-app': 'walk',
      'app-page.tsx': 'walk',
    });
  if (step === 7) return applyEdgeTones(ANATOMY.links, {
    'dsarc-src': 'ok', 'dsarc-content': 'ok', 'src-app': 'ok', 'src-lib': 'ok',
    'content-docs': 'ok', 'app-page.tsx': 'ok', 'docs-trees.mdx': 'ok',
  });
  return applyEdgeTones(ANATOMY.links, {});
}

export function TreeAnatomyAnim() {
  const { step, playing, toggle, reset, next, prev, done } = useStepPlayer(ANATOMY_TOTAL);
  return (
    <Stage
      title="একটা প্রজেক্ট ফোল্ডারে সব পরিভাষা"
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
  pre: ['dsarc', 'src', 'app', 'components', 'content'],
  in: ['app', 'src', 'components', 'dsarc', 'content'],
  post: ['app', 'components', 'src', 'content', 'dsarc'],
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
      শুরু root dsarc দিয়ে। Pre-order-এ node-এ পৌঁছামাত্রই সেটি visit হয় — তাই dsarc-ই
      প্রথম। এবার নামা হবে ওর বাম দিকে, src-এ।
    </>,
    <>
      বামে নেমে src-এ। নিয়ম একই: পৌঁছামাত্র src visit হলো (২য়), তারপর আবার ওর বামে নামা
      হবে — app-এ।
    </>,
    <>
      app-এর কোনো child নেই, তাই ও পৌঁছেই visit (৩য়) — এখানে আর করার কিছু নেই। এবার ফিরে
      যাব parent src-এর কাছে, কারণ ওর ডান দিক (components) এখনো দেখা হয়নি।
    </>,
    <>
      src-এর ডান child components visit হলো (৪র্থ)। এর মানে src-এর নিচের পুরো অংশ — app,
      src, components — দেখা শেষ।
    </>,
    <>
      সবশেষে root-এর ডান দিকের content। চূড়ান্ত ক্রম:{' '}
      <C t="dsarc, src, app, components, content" />। লক্ষ্য করো — প্রতিটা ফোল্ডারই তার
      ভেতরের সবার আগে এসেছে। কোনো প্রজেক্ট কপি করার সময়ও parent ফোল্ডার আগে বানাতে হয়,
      তারপর ভেতরেরগুলো — এটাই pre-order-এর চেনা ছাপ।
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
      Root dsarc-এ এসেও visit করা যাচ্ছে না — নিয়ম বলে আগে বামে নামতে হবে। src-এও একই
      অবস্থা। একেবারে বামে গিয়ে app পেলাম: ওর বামে কিছু নেই, তাই app-ই প্রথম visit।
    </>,
    <>
      app-এর ডানেও কিছু নেই, তাই ফিরে এলাম parent src-এ। src-এর বাম দিক শেষ — এবার src
      নিজে visit হলো (২য়)।
    </>,
    <>
      এবার src-এর ডান দিক: components। ওরও child নেই, তাই পৌঁছেই visit (৩য়)। এর সাথে
      src-এর নিচের পুরো অংশ শেষ: app, src, components।
    </>,
    <>
      পুরো বাম দিক শেষ, তাই এবার root dsarc নিজে visit হলো (৪র্থ)। In-order-এ root বসে ঠিক
      মাঝখানে — বামের সবাই তার আগে, ডানের সবাই তার পরে।
    </>,
    <>
      শেষে ডান দিকের content। চূড়ান্ত ক্রম: <C t="app, src, components, dsarc, content" />
      । গাছটা যদি BST হতো, এই ক্রমেই ছোট থেকে বড় সাজানো মান পেতে — BST অধ্যায়ে এটা আবার
      কাজে লাগবে।
    </>,
  ],
  post: [
    <>
      <b>Post-order</b>-এর নিয়ম: আগে বামের সবাই, তারপর ডানের সবাই, সবশেষে node নিজে (
      <C t="L → R → N" />)। অর্থাৎ দুই child-এর কাজ শেষ না হলে parent visit হয় না।{' '}
      <C t="du" /> দিয়ে ফোল্ডারের মোট size বের করা বা <C t="rm -rf" /> দিয়ে পুরো ফোল্ডার
      মোছা — যে কাজে child-দের কাজ আগে শেষ চাই, সেখানেই এই ক্রম লাগে।
    </>,
    <>
      Root dsarc থেকে নামা শুরু, কিন্তু ওর visit অনেক পরে — আগে বামে। একই কারণে src-ও
      অপেক্ষায়। গভীরতম বামের app-এর কোনো child নেই, তাই app-ই প্রথম visit।
    </>,
    <>ফিরে এসে এবার src-এর ডান দিক: components visit হলো (২য়)।</>,
    <>
      src-এর দুই child-ই শেষ — এখনই src visit হলো (৩য়)। খেয়াল করো: দুই child-এর ঠিক
      পরেই parent এলো, এটাই post-order।
    </>,
    <>এবার root-এর ডান দিক: content visit হলো (৪র্থ)।</>,
    <>
      বামও শেষ, ডানও শেষ — সবার শেষে root dsarc। চূড়ান্ত ক্রম:{' '}
      <C t="app, components, src, content, dsarc" />। প্রতিটা parent-ই তার child-দের পরে
      এসেছে — তাই ফোল্ডার মোছার সময়ও ভেতরের জিনিসগুলো আগে মুছে শেষে ফোল্ডারটা মোছা
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
  const nodes = applyNodeState(REPO_TREE.nodes, states);
  const edges = applyEdgeTones(REPO_TREE.links, current ? pathEdgeTones(REPO_PARENT, current) : {});

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

const LO_ORDER = ['dsarc', 'src', 'content', 'app', 'components'];
const LO_QUEUE: string[][] = [
  ['dsarc'],
  ['src', 'content'],
  ['content', 'app', 'components'],
  ['app', 'components'],
  ['components'],
  [],
];
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
    Level-order মানে স্তর বাই স্তর visit: আগে root ফোল্ডার, তারপর ওর child-রা, তারপর তাদের
    child-রা। এই ক্রম রাখার হাতিয়ার হলো <b>queue</b>, যেটা নিচে লাইভ দেখা যাবে। নিয়ম
    সহজ: সামনে থেকে <C t="shift()" /> করে একটা বের করো, তার child-গুলো <C t="push()" />{' '}
    করে পেছনে জমা দাও। শুরুতে queue-তে শুধু root: <C t="[dsarc]" />।
  </>,
  <>
    dsarc queue থেকে বের হয়ে visit হলো (১ম)। বের হওয়ামাত্র ওর child src আর content
    পেছনে দাঁড়াল — queue এখন <C t="[src, content]" />। লক্ষ্য করো: স্তর 0 শেষ হওয়ামাত্র
    স্তর 1 queue-তে প্রস্তুত।
  </>,
  <>
    এবার সামনের src বের হলো (২য় visit), আর ওর child app, components ঢুকল পেছনে — queue{' '}
    <C t="[content, app, components]" />। দেখো, বের হচ্ছে এক স্তরের node, ঢুকছে পরের
    স্তরের — এভাবেই স্তরগুলো কখনো মিশে যায় না।
  </>,
  <>
    content বের হলো (৩য় visit)। ওর কোনো child নেই, তাই নতুন কিছু ঢুকল না — queue{' '}
    <C t="[app, components]" />। এর সাথে স্তর 1-ও পুরো শেষ, result-এ{' '}
    <C t="[src, content]" />।
  </>,
  <>
    app বের হলো (৪র্থ visit)। queue-তে এখন শুধু components।
  </>,
  <>
    শেষে components বের হলো, queue খালি — traversal শেষ। ক্রম{' '}
    <C t="dsarc → src → content → app → components" />, হুবহু স্তর বাই স্তর। এই নিখুঁত
    ক্রমের কারণ queue-এর FIFO নিয়ম: যে আগে ঢুকেছে, সে আগেই বেরিয়েছে।
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
  const nodes = applyNodeState(REPO_TREE.nodes, states);

  const consoleLines =
    step >= 5
      ? ['[dsarc]', '[src, content]', '[app, components]']
      : step >= 3
        ? ['[dsarc]', '[src, content]']
        : step >= 1
          ? ['[dsarc]']
          : [];

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
          <TreeFlow nodes={nodes} edges={REPO_EDGES} height={250} />
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
/*  4 + 5. binary-search-tree: search(5432) and insert(2375)           */
/* ================================================================== */

/* open ports on a server, kept sorted in a BST: 6379(80(22, 3000(443, 5432)), 8080(·, 27017)) */
const BST_TREE = layoutBinaryTree(
  [
    { id: '6379', label: '6379', sub: 'redis', left: '80', right: '8080' },
    { id: '80', label: '80', sub: 'http', left: '22', right: '3000' },
    { id: '8080', label: '8080', sub: 'proxy', right: '27017' },
    { id: '22', label: '22', sub: 'ssh' },
    { id: '3000', label: '3000', sub: 'dev', left: '443', right: '5432' },
    { id: '27017', label: '27017', sub: 'mongo' },
    { id: '443', label: '443', sub: 'https' },
    { id: '5432', label: '5432', sub: 'postgres' },
  ],
  { x: 106, y: 96 },
);
const BST_PARENT: Record<string, string | null> = {
  '6379': null,
  '80': '6379',
  '8080': '6379',
  '22': '80',
  '3000': '80',
  '443': '3000',
  '5432': '3000',
  '27017': '8080',
  '2375': '443',
};

/* ---- search(5432) ---- */

const BSTS_PATH = ['6379', '80', '3000', '5432'];
const BSTS_CURSOR = [-1, 3, 3, 3, 2];
const BSTS_BUBBLES: ({ expr: string; res: boolean } | undefined)[] = [
  undefined,
  { expr: '5432 < 6379', res: true },
  { expr: '5432 < 80', res: false },
  { expr: '5432 < 3000', res: false },
  { expr: '5432 === 5432', res: true },
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
    সার্ভারে কোন কোন port খোলা আছে, সেগুলো এই BST-তে সাজানো — প্রতিটা node-এ port নম্বর,
    নিচের ছোট্ট লেখায় সার্ভিসের নাম। এবার চেক করব <b>5432</b> (PostgreSQL) খোলা আছে
    কিনা। BST-এর নিয়ম: প্রতিটা node-এর বামের সবাই ওর চেয়ে ছোট, ডানের সবাই বড়। তাই প্রতি
    node-এ একটাই প্রশ্ন — 5432 ওর চেয়ে ছোট না বড়? উত্তরমতো একদিকে নামব, অন্যদিকের পুরো
    subtree না দেখেই বাদ দেব। <b>নীল ঘের</b> দেখাবে এখন কোথায় দাঁড়িয়ে আছি।
  </>,
  <>
    Root 6379 (Redis)-এ তুলনা: <C t="5432 < 6379" /> — ছোট, তাই বামে নামলাম। এখানেই জাদু:
    ডানের 8080 আর 27017 আর কখনোই দেখা হবে না — 6379-এর চেয়ে বড় সব port ওই দিকে, 5432
    সেখানে থাকাই অসম্ভব।
  </>,
  <>
    80 (HTTP)-এ তুলনা: <C t="5432 > 80" /> — বড়, তাই ডানে। একই যুক্তিতে বামের 22 (SSH)-ও
    চিরদিনের জন্য বাদ।
  </>,
  <>
    3000 (dev server)-এ তুলনা: <C t="5432 > 3000" /> — আবার ডানে নামলাম।
  </>,
  <>
    <C t="5432 === 5432" /> — <b>পেয়ে গেছি!</b> PostgreSQL-এর port খোলা আছে। গাছে node
    ছিল ৮টা, অথচ দেখা লাগল মাত্র ৪টায়। প্রতি ধাপে অর্ধেকটা গাছ বাদ পড়ে যায় বলেই BST-এর
    search এত দ্রুত — হুবহু binary search-এর মতো।
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
      title="BST-এ search(5432)"
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
          <VizLabel t="লক্ষ্য: 5432 (postgres)" />
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

/* ---- insert(2375) ---- */

const BSTI_FINAL = layoutBinaryTree(
  [
    { id: '6379', label: '6379', sub: 'redis', left: '80', right: '8080' },
    { id: '80', label: '80', sub: 'http', left: '22', right: '3000' },
    { id: '8080', label: '8080', sub: 'proxy', right: '27017' },
    { id: '22', label: '22', sub: 'ssh' },
    { id: '3000', label: '3000', sub: 'dev', left: '443', right: '5432' },
    { id: '27017', label: '27017', sub: 'mongo' },
    { id: '443', label: '443', sub: 'https', right: '2375' },
    { id: '5432', label: '5432', sub: 'postgres' },
    { id: '2375', label: '2375', sub: 'docker' },
  ],
  { x: 106, y: 96 },
);

const BSTI_PATH = ['6379', '80', '3000', '443'];
const BSTI_CURSOR = [-1, 2, 3, 2, 3, 1, 1];
const BSTI_BUBBLES: ({ expr: string; res: boolean } | undefined)[] = [
  undefined,
  { expr: '2375 < 6379', res: true },
  { expr: '2375 < 80', res: false },
  { expr: '2375 < 3000', res: true },
  { expr: '2375 < 443', res: false },
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
    এবার Docker daemon চালু হলো — port <b>2375</b> BST-তে ঢোকাতে হবে। কৌশল সহজ:
    search-এর মতো তুলনা করে নামতে থাকো; যেখানে ফাঁকা জায়গা (<C t="null" />) পাবে,
    সেখানেই নতুন node বসে যাবে। <b>নীল ঘের</b> দেখাবে এখন কোন node-এর সাথে তুলনা হচ্ছে।
  </>,
  <>
    Root 6379-এ তুলনা: <C t="2375 < 6379" /> — ছোট, তাই বামে নামলাম।
  </>,
  <>
    80-এ: <C t="2375 > 80" /> — বড়, তাই ডানে।
  </>,
  <>
    3000-এ: <C t="2375 < 3000" /> — ছোট, তাই বামে; পৌঁছে গেলাম 443 (HTTPS)-এর কাছে।
  </>,
  <>
    443-এ: <C t="2375 > 443" /> — বড়, তাই ডানে যেতে চাই…
  </>,
  <>
    …কিন্তু 443-এর ডানে কিছু নেই, <C t="null" />! ড্যাশ করা ফাঁকা গোলটাই 2375-এর ভবিষ্যৎ
    জায়গা। খেয়াল করো — অন্য কোনো node-কে একচুলও সরাতে হয়নি।
  </>,
  <>
    সেই জায়গাতেই <C t="new TreeNode(2375)" /> বসে গেল, আর গাছ নিজেকে নতুন আকারে সাজিয়ে
    নিল। পুরো insert-এ বদলাল মাত্র একটা pointer (443-এর right) — তাই খরচ <C t="O(h)" />,
    অর্থাৎ গাছের height সমান ধাপ।
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
        const spot = BSTI_FINAL.nodes.find((n) => n.id === '2375') as TreeFlowNode;
        return [
          ...base,
          { ...spot, id: 'g2375', data: { label: '2375', sub: 'docker', tone: 'ghost' as NodeTone } },
        ];
      }
      return base;
    }
    return applyNodeState(BSTI_FINAL.nodes, {
      ...bstiStates(walked, null),
      '2375': { tone: 'new', badge: 'বসল!', badgeTone: 'emerald' },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, placed]);

  const nodes = useTweenedNodes(target);

  const edges = useMemo(() => {
    if (!placed) {
      const base = applyEdgeTones(
        BST_TREE.links,
        current ? pathEdgeTones(BST_PARENT, current) : step === 5 ? pathEdgeTones(BST_PARENT, '443') : {},
      );
      return step === 5 ? [...base, mkEdge('443', 'g2375', 'ghost')] : base;
    }
    return applyEdgeTones(BSTI_FINAL.links, { ...pathEdgeTones(BST_PARENT, '443'), '443-2375': 'ok' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, placed]);

  return (
    <Stage
      title="BST-এ insert(2375)"
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
          <VizLabel t="ঢুকছে: 2375 (docker)" />
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
/*  6. avl-tree: services boot in sorted order (22,80,443) → RR break  */
/* ================================================================== */

const AVL_CHAIN = layoutBinaryTree(
  [
    { id: '22', label: '22', sub: 'ssh', right: '80' },
    { id: '80', label: '80', sub: 'http', right: '443' },
    { id: '443', label: '443', sub: 'https' },
  ],
  { x: 106, y: 96 },
);
const AVL_FIXED = layoutBinaryTree(
  [
    { id: '80', label: '80', sub: 'http', left: '22', right: '443' },
    { id: '22', label: '22', sub: 'ssh' },
    { id: '443', label: '443', sub: 'https' },
  ],
  { x: 106, y: 96 },
);

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
    সার্ভার বুট হলে সার্ভিসগুলো একে একে উঠে আসে: আগে SSH (22), তারপর HTTP (80), তারপর
    HTTPS (443) — মানে port-গুলো sorted ক্রমেই insert হচ্ছে। একে একে insert করি, আর দেখি
    AVL কীভাবে নিজে থেকেই ভারসাম্য ঠিক করে। প্রতিটা node-এর নিচের চিপে <b>bf</b> =
    balance factor, অর্থাৎ বাম দিক আর ডান দিকের height-এর পার্থক্য। bf যদি কখনো 2 বা −2
    ছোঁয়, AVL সঙ্গে সঙ্গে গাছ ঘুরিয়ে (rotation) ঠিক করে দেয়।
  </>,
  <>
    <C t="insert(22)" />: গাছে এটাই প্রথম node — SSH root হয়ে বসল। ভারসাম্য নিয়ে এখন
    ভাবার কিছু নেই।
  </>,
  <>
    <C t="insert(80)" />: 80 &gt; 22, তাই 22-এর ডানে বসল। এখন 22-এর <C t="bf = −1" />,
    মানে ডান দিক এক ধাপ লম্বা। bf যতক্ষণ −1, 0 বা +1-এর মধ্যে, গাছ balanced ধরা হয় —
    এখনো সব ঠিক।
  </>,
  <>
    <C t="insert(443)" />: আবারও ডানে! এবার 22-এর <C t="bf = −2" /> — সীমা ছাড়াল, তাই
    node-টা লাল হয়ে সতর্ক করছে। এই ভাঙনের নাম <b>RR case</b> (ডানে-ডানে ভারী), আর এর
    ফিক্স একটাই: <b>left rotation</b>।
  </>,
  <>
    Rotation শুরু। pivot হিসেবে নেওয়া হলো <C t="x = 80" /> (নীল ঘের): 80 উঠে নতুন root
    হবে, আর 22 নেমে যাবে ওর বামে। 22–80-এর কাটা লাল লাইনটা দেখাচ্ছে কোন সংযোগটা আলগা হয়ে
    নতুন করে বাঁধবে।
  </>,
  <>
    Rotation শেষ: 80 উপরে উঠে root, আর 22 বসে গেল ওর বামে (কোডের <C t="x.left = y" />{' '}
    লাইনটা)। খেয়াল করো, BST নিয়ম কিন্তু অক্ষত আছে — এখনো <C t="22 < 80 < 443" />।
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
      1: { '22': { tone: 'new' } },
      2: { '22': { badge: 'bf −1' }, '80': { tone: 'new' } },
      3: {
        '22': { tone: 'alarm', badge: 'bf −2', badgeTone: 'rose' },
        '80': { badge: 'bf −1' },
        '443': { tone: 'new' },
      },
    };
    const shown = new Set([
      ...(step >= 1 ? ['22'] : []),
      ...(step >= 2 ? ['80'] : []),
      ...(step >= 3 ? ['443'] : []),
    ]);
    const states = chain[step] ?? {};
    return applyNodeState(AVL_CHAIN.nodes, states).filter((n) => shown.has(n.id));
  }
  if (step === 4)
    return applyNodeState(AVL_CHAIN.nodes, {
      '22': { tone: 'alarm', badge: 'bf −2', badgeTone: 'rose' },
      '80': { tone: 'walk', badge: 'pivot', badgeTone: 'sky' },
      '443': {},
    });
  if (step === 5) return AVL_FIXED.nodes;
  return applyNodeState(AVL_FIXED.nodes, {
    '22': { tone: 'visited', badge: 'bf 0', badgeTone: 'emerald' },
    '80': { tone: 'visited', badge: 'bf 0', badgeTone: 'emerald' },
    '443': { tone: 'visited', badge: 'bf 0', badgeTone: 'emerald' },
  });
}

function avlEdges(step: number): Edge[] {
  if (step <= 1) return [];
  if (step <= 3) return applyEdgeTones(AVL_CHAIN.links.slice(0, step - 1), {});
  if (step === 4) return applyEdgeTones(AVL_CHAIN.links, { '22-80': 'cut' });
  return applyEdgeTones(AVL_FIXED.links, { '80-22': 'ok', '80-443': 'ok' });
}

export function AvlRotationAnim() {
  const { step, playing, toggle, reset, next, prev, done } = useStepPlayer(AVL_TOTAL);
  const target = useMemo(() => avlNodes(step), [step]);
  const nodes = useTweenedNodes(target);
  const edges = useMemo(() => avlEdges(step), [step]);

  return (
    <Stage
      title="AVL: 22, 80, 443 insert আর left rotation"
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

const DFS_ORDER = ['dsarc', 'src', 'app', 'components', 'content'];
const BFS_ORDER = ['dsarc', 'src', 'content', 'app', 'components'];
const DFS_STACK: string[][] = [
  ['dsarc'],
  ['content', 'src'],
  ['content', 'components', 'app'],
  ['content', 'components'],
  ['content'],
  [],
];
const BFS_QUEUE: string[][] = [
  ['dsarc'],
  ['src', 'content'],
  ['content', 'app', 'components'],
  ['app', 'components'],
  ['components'],
  [],
];
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
    ধরো তুমি প্রজেক্টে একটা ফাইল খুঁজছ। একই ফোল্ডার-গাছের ওপর পাশাপাশি দৌড়াবে দুই
    কৌশল: বামে <b>DFS</b> (আগে গভীরে — <C t="grep -r" /> যেমন এক ফোল্ডারের তল্লাশি শেষ
    করে তবে পরেরটায় যায়), ডানে <b>BFS</b> (আগে পাশে — সব সরাসরি subfolder আগে, তারপর এক
    লেভেল নিচে)। পার্থক্য আসে তাদের হাতিয়ার থেকে — DFS-এর <b>stack</b>-এ শেষে ঢুকা আগে
    বের হয় (LIFO), BFS-এর <b>queue</b>-তে আগে ঢুকা আগে বের হয় (FIFO)। নিচে দুটোর stack
    আর queue লাইভ দেখা যাবে। প্লে চাপো!
  </>,
  <>
    দুটোই root dsarc দিয়ে শুরু করল। এবার child জমা দেওয়ার পালা: DFS ডান child (content)
    আগে push করে, তাই বাম child src stack-এর top-এ উঠে এসেছে — stack-এ পরে ঢুকলেই top। আর
    BFS বাম থেকে ডানে ঢুকিয়েছে, তাই queue-র সামনে src, পেছনে content।
  </>,
  <>
    দুটোই src visit করল, কিন্তু এখন থেকে পথ আলাদা। DFS-এর stack-এ src-এর child-রা উপরে
    উঠে গেছে — top-এ এখন গভীরের app। আর BFS-এর queue-র সামনে এখনো সেই পুরনো content,
    কারণ ও আগে ঢুকেছিল।
  </>,
  <>
    তাই DFS ঝাঁপ দিল একেবারে গভীরের app-এ, আর BFS নিল পাশের content-কে — BFS-এর কাছে পুরো
    স্তর 1 শেষ করা আগে।
  </>,
  <>
    DFS এগিয়ে components-এ, BFS এসে app-এ। দুটোরই আর একটা করে node বাকি, কিন্তু ক্রম
    এতক্ষণে পুরো ভিন্ন হয়ে গেছে।
  </>,
  <>
    শেষ ধাপ: DFS সবশেষে নিল content-কে — ডান subtree-টা সে পুরোটা শেষের দিকে ঠেলে
    দিয়েছিল; আর BFS-এর শেষে components। নিচের কনসোলে দুটোর পুরো ক্রম মিলিয়ে দেখো: একই
    গাছ, একই node-গুলো — শুধু stack আর queue-র ফারাকে ক্রম বদলে গেল।
  </>,
];

function cmpNodes(order: string[], step: number): TreeFlowNode[] {
  const states: Record<string, Partial<TreeNodeData>> = {};
  order.slice(0, step).forEach((id, i) => {
    states[id] = { tone: 'visited', order: i + 1 };
  });
  if (step >= 1) states[order[step - 1]] = { tone: 'walk', order: step };
  return applyNodeState(REPO_TREE.nodes, states);
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
            <TreeFlow nodes={cmpNodes(DFS_ORDER, step)} edges={REPO_EDGES} height={205} />
            <ChipRow label="stack" chips={DFS_STACK[step]} />
          </div>
          <div className="flex flex-col gap-2">
            <VizLabel t="BFS — queue (FIFO)" />
            <TreeFlow nodes={cmpNodes(BFS_ORDER, step)} edges={REPO_EDGES} height={205} />
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
