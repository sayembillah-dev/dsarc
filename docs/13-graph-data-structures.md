# ১৩ — Graph Data Structures

Graph হলো সবচেয়ে শক্তিশালী ও বহুমুখী কাঠামো — সোশ্যাল নেটওয়ার্ক, ম্যাপ/GPS, ইন্টারনেট, নির্ভরতা (dependency) — সব graph। Tree আসলে graph-এরই বিশেষ রূপ। এই section-এ ছবির সব graph টপিক শিখব।

> **Section Roadmap:** পরিভাষা → Directed/Undirected → উপস্থাপন (adjacency list/matrix) → BFS → DFS → Shortest Path (Dijkstra, Bellman-Ford, A*) → MST (Prim, Kruskal)

---

## 13.1 — Graph পরিভাষা ও প্রকার

**🎯 কী শিখব**
- vertex, edge, directed/undirected, weighted

**💡 ধারণা**
Graph = কতগুলো **vertex** (node) ও তাদের সংযোগকারী **edge**-এর সমষ্টি।

- **Undirected:** edge দুমুখী (বন্ধুত্ব — A বন্ধু হলে B-ও বন্ধু)
- **Directed (digraph):** edge একমুখী (Twitter follow — A→B মানে B→A নয়)
- **Weighted:** edge-এ একটা মান/ওজন (দূরত্ব, খরচ)
- **Cycle:** ঘুরে আবার শুরুতে ফেরা যায় এমন পথ
- **Connected:** সব vertex একে অপরের থেকে পৌঁছানো যায়

```
Undirected:  A — B        Directed:  A → B
             |   |                    ↑   ↓
             C — D                    C ← D
```

**💻 (ধারণা)**
```js
// vertices: A,B,C,D ; edges: A-B, A-C, B-D, C-D
```

**🔍 ব্রেকডাউন**
- Tree = connected, acyclic (cycle নেই), n node হলে n−1 edge।
- Graph-এ cycle থাকতে পারে → traversal-এ "visited" ট্র্যাক করা **আবশ্যক** (নাহলে infinite loop)।

> **🎬 Animation Spec: Graph Explorer**
> - **দৃশ্য:** node ও edge; toggle দিয়ে directed/undirected, weighted রূপ বদলানো।
> - **ইনপুট:** node/edge যোগ-বাদ; edge weight।
> - **ধাপ:** নির্বাচন বদলালে তীর/লাইন ও weight লেবেল আপডেট।
> - **লক্ষ্য:** graph-এর ধরন ও পরিভাষা চেনা।

**📝 অনুশীলন**
- তোমার বন্ধু-তালিকা directed না undirected graph — যুক্তি দাও।

---

## 13.2 — Graph উপস্থাপন (Adjacency List vs Matrix)

**🎯 কী শিখব**
- graph কোডে কীভাবে রাখব

**💡 ধারণা**
দুই প্রধান উপায়:
- **Adjacency List:** প্রতিটা vertex-এর প্রতিবেশীদের তালিকা (`Map`)। কম edge (sparse) হলে দক্ষ — জায়গা O(V+E)।
- **Adjacency Matrix:** V×V গ্রিড; `matrix[i][j]=1` মানে edge আছে। edge চেক O(1), কিন্তু জায়গা O(V²) (dense-এ ভালো)।

বাস্তবে বেশিরভাগ সমস্যায় **adjacency list** ব্যবহার হয়।

**💻 কোড উদাহরণ (Adjacency List)**
```js
class Graph {
  constructor() { this.adj = new Map(); }

  addVertex(v) { if (!this.adj.has(v)) this.adj.set(v, []); }

  addEdge(u, v) {                 // undirected
    this.addVertex(u); this.addVertex(v);
    this.adj.get(u).push(v);
    this.adj.get(v).push(u);      // directed হলে এই লাইন বাদ
  }

  neighbors(v) { return this.adj.get(v) || []; }
}

const g = new Graph();
g.addEdge("A", "B"); g.addEdge("A", "C");
g.addEdge("B", "D"); g.addEdge("C", "D");
console.log(g.neighbors("A")); // ['B','C']
```

**🔍 ব্রেকডাউন**
- `Map<vertex, neighbors[]>` — প্রতিটা vertex-এর সরাসরি প্রতিবেশী।
- undirected-এ দুই দিকেই edge যোগ; directed-এ এক দিকে।

**⏱️ Complexity** — list: space O(V+E); matrix: space O(V²)।

> **🎬 Animation Spec: List vs Matrix**
> - **দৃশ্য:** বাঁয়ে গ্রাফ, ডানে একই graph-এর adjacency list ও matrix পাশাপাশি।
> - **ইনপুট:** edge যোগ।
> - **ধাপ:** edge যোগ করলে list-এ entry ও matrix-এ cell একসাথে আপডেট।
> - **লক্ষ্য:** দুই উপস্থাপনের trade-off।

**📝 অনুশীলন**
- ওপরের graph-এর adjacency matrix হাতে আঁকো।

---

## 13.3 — Breadth First Search (BFS)

**🎯 কী শিখব**
- স্তরে স্তরে ঘোরা; unweighted shortest path

**💡 ধারণা**
BFS শুরু node থেকে **স্তরে স্তরে** ছড়ায় (queue দিয়ে) — আগে ১ ধাপ দূরের সব, তারপর ২ ধাপ... তাই unweighted graph-এ **সবচেয়ে কম edge-এর পথ** (shortest path) দেয়। "visited" set দিয়ে cycle সামলাই।

**💻 কোড উদাহরণ**
```js
function bfs(graph, start) {
  const visited = new Set([start]);
  const queue = [start], order = [];
  while (queue.length) {
    const node = queue.shift();          // FIFO
    order.push(node);
    for (const next of graph.neighbors(node)) {
      if (!visited.has(next)) {          // আগে দেখিনি?
        visited.add(next);
        queue.push(next);                // পেছনে যোগ
      }
    }
  }
  return order;
}
console.log(bfs(g, "A")); // ['A','B','C','D']

// unweighted shortest path (কত ধাপ দূরে)
function shortestPathBFS(graph, start, target) {
  const visited = new Set([start]);
  const queue = [[start, 0]];            // [node, distance]
  while (queue.length) {
    const [node, dist] = queue.shift();
    if (node === target) return dist;
    for (const next of graph.neighbors(node)) {
      if (!visited.has(next)) { visited.add(next); queue.push([next, dist + 1]); }
    }
  }
  return -1;
}
console.log(shortestPathBFS(g, "A", "D")); // 2
```

**🔍 ব্রেকডাউন**
- **queue** → স্তরভিত্তিক প্রসার।
- **visited** → পুনরাবৃত্তি/cycle বন্ধ (graph-এ অপরিহার্য)।
- প্রতিটা node-এর সাথে distance রাখলে shortest path।

**⏱️ Complexity** — O(V + E) time; O(V) space।

> **🎬 Animation Spec: BFS Ripple**
> - **দৃশ্য:** graph; start থেকে ঢেউয়ের মতো স্তরে স্তরে রঙ ছড়ায়; পাশে queue।
> - **ইনপুট:** start node।
> - **ধাপ:** প্রতিটা স্তর একই রঙে; visited node বেগুনি; queue-এর enqueue/dequeue দেখা যায়।
> - **লক্ষ্য:** BFS = স্তর-ভিত্তিক প্রসার = shortest (unweighted)।

**📝 অনুশীলন**
- BFS দিয়ে graph connected কিনা বের করো।

---

## 13.4 — Depth First Search (DFS)

**🎯 কী শিখব**
- এক পথ ধরে যতদূর যাওয়া যায়

**💡 ধারণা**
DFS একটা পথ ধরে **যতদূর সম্ভব গভীরে** যায়, আর যেতে না পারলে পিছিয়ে (backtrack) অন্য পথ ধরে। recursion বা **stack** দিয়ে। cycle detection, connected components, topological sort-এ কাজে লাগে।

**💻 কোড উদাহরণ**
```js
// recursive
function dfs(graph, start, visited = new Set(), order = []) {
  visited.add(start);
  order.push(start);
  for (const next of graph.neighbors(start)) {
    if (!visited.has(next)) dfs(graph, next, visited, order);
  }
  return order;
}
console.log(dfs(g, "A")); // যেমন ['A','B','D','C']

// iterative (stack)
function dfsIter(graph, start) {
  const visited = new Set(), stack = [start], order = [];
  while (stack.length) {
    const node = stack.pop();            // LIFO → গভীরে
    if (visited.has(node)) continue;
    visited.add(node); order.push(node);
    for (const next of graph.neighbors(node)) {
      if (!visited.has(next)) stack.push(next);
    }
  }
  return order;
}
```

**🔍 ব্রেকডাউন**
- recursion-এর call stack-ই DFS-এর stack।
- BFS ও DFS-এর কোড প্রায় এক — শুধু **queue (BFS) বনাম stack (DFS)**।

**⏱️ Complexity** — O(V + E) time; O(V) space।

> **🎬 Animation Spec: DFS Deep Dive**
> - **দৃশ্য:** graph; একটা path ধরে গভীরে নামা, ডেড-এন্ডে backtrack (তীর পিছায়)।
> - **ইনপুট:** start node।
> - **ধাপ:** current পথ কমলা; visited বেগুনি; backtrack স্পষ্ট দেখানো।
> - **লক্ষ্য:** "গভীরে যাও, আটকালে ফিরে এসো" ধারণা; BFS-এর সাথে তুলনা।

**📝 অনুশীলন**
- DFS দিয়ে directed graph-এ cycle আছে কিনা বের করার কৌশল ভাবো।

---

## 13.5 — Dijkstra's Algorithm (Weighted Shortest Path)

**🎯 কী শিখব**
- ওজনসহ graph-এ সবচেয়ে কম খরচের পথ

**💡 ধারণা**
BFS unweighted-এ shortest দেয়, কিন্তু edge-এ ওজন থাকলে (রাস্তার দূরত্ব) BFS যথেষ্ট নয়। **Dijkstra** প্রতিবার **এখন পর্যন্ত সবচেয়ে কাছের** node বেছে (min-heap/priority queue দিয়ে) তার প্রতিবেশীদের দূরত্ব হালনাগাদ করে (**relaxation**)।

> **সীমা:** edge weight **negative** হলে Dijkstra ভুল করতে পারে → তখন Bellman-Ford (নিচে)।

**💻 কোড উদাহরণ**
```js
// graph: Map<node, [[neighbor, weight], ...]>
function dijkstra(graph, start) {
  const dist = new Map();
  for (const node of graph.keys()) dist.set(node, Infinity);
  dist.set(start, 0);

  // সরল priority queue (বড় graph-এ MinHeap ব্যবহার করো, section 12)
  const pq = [[0, start]];             // [distance, node]
  while (pq.length) {
    pq.sort((a, b) => a[0] - b[0]);    // সবচেয়ে কাছেরটা আগে
    const [d, node] = pq.shift();
    if (d > dist.get(node)) continue;  // পুরনো/বাসি entry বাদ
    for (const [next, weight] of graph.get(node)) {
      const newDist = d + weight;
      if (newDist < dist.get(next)) {  // relaxation: ছোট পথ পেলাম
        dist.set(next, newDist);
        pq.push([newDist, next]);
      }
    }
  }
  return dist;                          // start থেকে সবার সর্বনিম্ন দূরত্ব
}

const wg = new Map([
  ["A", [["B", 1], ["C", 4]]],
  ["B", [["C", 2], ["D", 5]]],
  ["C", [["D", 1]]],
  ["D", []],
]);
console.log(dijkstra(wg, "A")); // A:0, B:1, C:3, D:4
```

**🔍 ব্রেকডাউন**
- `dist` — start থেকে প্রতিটা node-এ এখন পর্যন্ত জানা সর্বনিম্ন দূরত্ব।
- **relaxation:** `d + weight < dist[next]` হলে ছোট পথ পাওয়া গেছে, আপডেট।
- সবসময় সবচেয়ে কাছের unprocessed node আগে — priority queue-এর কাজ।

**⏱️ Complexity** — min-heap দিয়ে O((V+E) log V)।

> **🎬 Animation Spec: Dijkstra Wavefront**
> - **দৃশ্য:** weighted graph; প্রতিটা node-এ current best distance লেবেল; priority queue পাশে।
> - **ইনপুট:** start node; edge weight editable।
> - **ধাপ:** সবচেয়ে কাছের node "settle" (সবুজ); প্রতিবেশী distance relax (হলুদ flash)।
> - **লক্ষ্য:** greedy "কাছেরটা আগে" ও relaxation বোঝা।

**📝 অনুশীলন**
- একটা edge weight negative করে দেখো কেন Dijkstra ভুল করতে পারে।

---

## 13.6 — Bellman-Ford Algorithm

**🎯 কী শিখব**
- negative weight সামলানো shortest path

**💡 ধারণা**
Bellman-Ford সব edge-কে **V−1 বার** relax করে। এটা ধীর (O(V·E)) কিন্তু **negative weight** সামলায়, এমনকি **negative cycle** (যেখানে ঘুরলে খরচ কমতেই থাকে) সনাক্ত করে।

**💻 কোড উদাহরণ**
```js
// edges: [[u, v, weight], ...]
function bellmanFord(vertices, edges, start) {
  const dist = new Map(vertices.map(v => [v, Infinity]));
  dist.set(start, 0);

  // V-1 বার সব edge relax করি
  for (let i = 0; i < vertices.length - 1; i++) {
    for (const [u, v, w] of edges) {
      if (dist.get(u) + w < dist.get(v)) dist.set(v, dist.get(u) + w);
    }
  }
  // আরেকবার relax হলে → negative cycle আছে
  for (const [u, v, w] of edges) {
    if (dist.get(u) + w < dist.get(v)) throw new Error("Negative cycle!");
  }
  return dist;
}
console.log(bellmanFord(
  ["A", "B", "C"],
  [["A", "B", 4], ["A", "C", 5], ["B", "C", -3]],
  "A"
)); // A:0, B:4, C:1
```

**🔍 ব্রেকডাউন**
- V−1 বার কেন? — সবচেয়ে দীর্ঘ shortest path-এ সর্বোচ্চ V−1 edge থাকতে পারে।
- V-তম বারেও উন্নতি হলে নিশ্চিত negative cycle।

**⏱️ Complexity** — O(V·E)।

> **🎬 Animation Spec: Repeated Relaxation**
> - **দৃশ্য:** graph; প্রতিটা "round"-এ সব edge একে একে relax; distance টেবিল আপডেট।
> - **ইনপুট:** graph (negative weight সহ)।
> - **ধাপ:** round-by-round distance কমা; শেষ round-এ negative cycle সনাক্ত (লাল)।
> - **লক্ষ্য:** Dijkstra-র সাথে trade-off ও negative weight।

**📝 অনুশীলন**
- Dijkstra vs Bellman-Ford: কখন কোনটা — তালিকা করো।

---

## 13.7 — A* Search Algorithm

**🎯 কী শিখব**
- heuristic দিয়ে দ্রুত shortest path (গেম/ম্যাপ-এ)

**💡 ধারণা**
Dijkstra সব দিকে সমানভাবে খোঁজে। **A\*** একটা **heuristic** (আন্দাজ — যেমন সরলরেখা দূরত্ব) যোগ করে target-এর দিকে খোঁজাকে "পক্ষপাতী" করে, ফলে অনেক দ্রুত। মূল সূত্র:

```
f(n) = g(n) + h(n)
g = start থেকে n পর্যন্ত বাস্তব খরচ
h = n থেকে target পর্যন্ত আন্দাজ খরচ (heuristic)
```

**h সঠিক (admissible — কখনো overestimate করে না) হলে A\* সবচেয়ে ভালো পথ নিশ্চিত করে।**

**💻 কোড উদাহরণ (গ্রিডে, সরল কাঠামো)**
```js
function aStar(grid, start, goal, h) {
  const key = ([r, c]) => `${r},${c}`;
  const open = [[h(start, goal), 0, start]]; // [f, g, node]
  const gScore = new Map([[key(start), 0]]);
  while (open.length) {
    open.sort((a, b) => a[0] - b[0]);        // ছোট f আগে
    const [, g, node] = open.shift();
    if (key(node) === key(goal)) return g;   // পৌঁছেছি
    for (const next of neighbors(grid, node)) {
      const tentative = g + 1;               // প্রতি পদক্ষেপ খরচ 1
      if (tentative < (gScore.get(key(next)) ?? Infinity)) {
        gScore.set(key(next), tentative);
        open.push([tentative + h(next, goal), tentative, next]); // f = g + h
      }
    }
  }
  return -1;
}
// Manhattan distance heuristic (গ্রিডের জন্য)
const manhattan = (a, b) => Math.abs(a[0]-b[0]) + Math.abs(a[1]-b[1]);
```

**🔍 ব্রেকডাউন**
- `h=0` দিলে A\* ঠিক Dijkstra হয়ে যায়।
- ভালো heuristic → কম node explore → দ্রুত।
- গেম pathfinding, GPS routing-এ ব্যাপক ব্যবহৃত।

**⏱️ Complexity** — heuristic-নির্ভর; ভালো h-এ Dijkstra-র চেয়ে অনেক কম node।

> **🎬 Animation Spec: A\* vs Dijkstra Race**
> - **দৃশ্য:** গ্রিড-ম্যাপ (দেয়াল সহ); দুটো search পাশাপাশি — একটায় h=0 (Dijkstra), একটায় Manhattan।
> - **ইনপুট:** start/goal/দেয়াল আঁকা; heuristic নির্বাচন।
> - **ধাপ:** explored cell রঙ পায়; A\* goal-এর দিকে ঝুঁকে কম cell খোঁজে।
> - **লক্ষ্য:** heuristic কীভাবে খোঁজা "গাইড" করে।

**📝 অনুশীলন**
- একটা inadmissible (অতিরঞ্জিত) heuristic দিলে কী সমস্যা হতে পারে ভাবো।

---

## 13.8 — Minimum Spanning Tree: Prim ও Kruskal

**🎯 কী শিখব**
- সব node-কে সবচেয়ে কম মোট ওজনে জোড়া

**💡 ধারণা**
**MST** = একটা connected weighted undirected graph-এর এমন উপগ্রাফ যা সব vertex জোড়ে, cycle ছাড়া, ন্যূনতম মোট edge-ওজনে। (যেমন: সব শহরে সবচেয়ে কম তারে বিদ্যুৎ পৌঁছানো।)

দুই ক্লাসিক greedy algorithm:
- **Prim:** এক vertex থেকে শুরু, প্রতিবার সবচেয়ে সস্তা edge দিয়ে নতুন vertex যোগ (min-heap)।
- **Kruskal:** সব edge ওজন-অনুসারে sort, ছোট থেকে নিতে থাকো — cycle না বানালে নাও (**Union-Find** দিয়ে cycle চেক, section 14)।

**💻 কোড উদাহরণ (Kruskal — Union-Find সহ)**
```js
// সরল Union-Find (DSU) — section 14-এ বিস্তারিত
class DSU {
  constructor(n) { this.parent = Array.from({length: n}, (_, i) => i); }
  find(x) { return this.parent[x] === x ? x : (this.parent[x] = this.find(this.parent[x])); }
  union(a, b) { const ra = this.find(a), rb = this.find(b); if (ra === rb) return false; this.parent[ra] = rb; return true; }
}

function kruskal(n, edges) {          // edges: [u, v, weight]
  edges.sort((a, b) => a[2] - b[2]);  // ওজন-অনুসারে sort
  const dsu = new DSU(n);
  const mst = []; let total = 0;
  for (const [u, v, w] of edges) {
    if (dsu.union(u, v)) {            // cycle না বানালে নাও
      mst.push([u, v, w]); total += w;
    }
  }
  return { mst, total };
}

const result = kruskal(4, [
  [0, 1, 1], [1, 2, 2], [0, 2, 4], [2, 3, 1], [1, 3, 5],
]);
console.log(result.total); // 4  (edges: 0-1, 2-3, 1-2)
```

**🔍 ব্রেকডাউন**
- Kruskal: সস্তা edge আগে; **Union-Find** দিয়ে দেখি দুই প্রান্ত ইতিমধ্যে একই গোষ্ঠীতে কিনা (হলে cycle → বাদ)।
- V−1 edge নিলেই MST সম্পূর্ণ।
- Prim ঘন (dense) graph-এ ভালো; Kruskal পাতলা (sparse) graph-এ ভালো।

**⏱️ Complexity** — Kruskal O(E log E); Prim (heap) O(E log V)।

> **🎬 Animation Spec: MST Builder**
> - **দৃশ্য:** weighted graph; নির্বাচিত edge সবুজ, প্রত্যাখ্যাত (cycle) লাল।
> - **ইনপুট:** algorithm (Prim/Kruskal); graph।
> - **ধাপ:** Kruskal — sorted edge একে একে চেক; Prim — vertex-set থেকে সস্তা edge দিয়ে প্রসার। running total দেখানো।
> - **লক্ষ্য:** দুই greedy পদ্ধতির পার্থক্য ও cycle-এড়ানো।

**📝 অনুশীলন**
- একই graph-এ Prim ও Kruskal একই total দেয় কিনা যাচাই করো।

---

## ✅ Section সারাংশ

Graph = vertex+edge (directed/undirected/weighted)। উপস্থাপন: adjacency list (সাধারণ)। BFS (queue) = unweighted shortest; DFS (stack/recursion) = গভীর অন্বেষণ; দুটোই visited লাগে। Shortest path: Dijkstra (non-negative, heap), Bellman-Ford (negative সামলায়), A* (heuristic-গাইডেড)। MST: Prim ও Kruskal (greedy)।

**পরবর্তী:** [14 — Advanced Data Structures](14-advanced-data-structures.md) →
