# ১১: Tree Data Structures

এতক্ষণ ছিল রৈখিক (linear) কাঠামো। এবার শাখা-প্রশাখাওয়ালা **Tree**, যা file system, DOM, database index, decision-making, সব জায়গায়। recursion (section 08) এখানে দারুণ কাজে লাগবে।

> **Section Roadmap:** পরিভাষা, Binary Tree, Traversal (Pre/In/Post/Level), BST, AVL (balanced), B-Tree (intro), BFS/DFS on tree

---

## 11.1: Tree পরিভাষা

**কী শিখব**
- root, node, child, leaf, height ইত্যাদি

**ধারণা**
Tree = নোডের একটা শ্রেণিবদ্ধ (hierarchical) কাঠামো, উল্টো গাছের মতো, **root** উপরে, **leaf** নিচে।

- **Root:** সবার উপরের node
- **Parent / Child:** উপর-নিচ সম্পর্ক
- **Leaf:** চাইল্ডহীন node
- **Edge:** দুই node-এর সংযোগ
- **Height:** root থেকে সবচেয়ে দূরের leaf পর্যন্ত edge সংখ্যা
- **Depth:** কোনো node root থেকে কত দূরে
- **Subtree:** কোনো node ও তার নিচের সব

```
        A          <- root (depth 0)
       / \
      B   C        <- depth 1
     / \
    D   E          <- leaf (depth 2)
```

**কোড উদাহরণ (node)**
```js
class TreeNode {
  constructor(value) {
    this.value = value;
    this.left = null;    // বাঁ চাইল্ড
    this.right = null;   // ডান চাইল্ড
  }
}
const root = new TreeNode("A");
root.left = new TreeNode("B");
root.right = new TreeNode("C");
```

**ব্রেকডাউন**
- এখানে **binary tree**, প্রতিটা node-এর সর্বোচ্চ ২টা চাইল্ড (`left`, `right`)।
- `null` মানে সেদিকে চাইল্ড নেই।

> **Animation Spec: Tree Anatomy**
> - **দৃশ্য:** একটা tree; hover করলে প্রতিটা অংশের লেবেল (root/leaf/height) দেখা যায়।
> - **ইনপুট:** node নির্বাচন।
> - **ধাপ:** নির্বাচিত node-এর depth, subtree, ancestors highlight।
> - **লক্ষ্য:** পরিভাষা ভিজ্যুয়ালি চেনা।

**অনুশীলন**
- উপরের গাছের height কত? leaf ক'টা?

---

## 11.2: Binary Tree Traversal (Pre / In / Post-Order)

**কী শিখব**
- Depth-First traversal-এর তিন রূপ (recursion)

**ধারণা**
Tree-র সব node ঘুরে দেখার (traversal) তিনটা DFS রূপ, পার্থক্য শুধু **কখন root প্রসেস করি**:

- **Pre-order:** Root, Left, Right (কপি/prefix-এ)
- **In-order:** Left, Root, Right (BST-তে sorted ক্রম দেয়!)
- **Post-order:** Left, Right, Root (delete/subtree হিসাবে)

**কোড উদাহরণ**
```js
function preOrder(node, out = []) {
  if (!node) return out;
  out.push(node.value);        // root আগে
  preOrder(node.left, out);
  preOrder(node.right, out);
  return out;
}
function inOrder(node, out = []) {
  if (!node) return out;
  inOrder(node.left, out);
  out.push(node.value);        // root মাঝে
  inOrder(node.right, out);
  return out;
}
function postOrder(node, out = []) {
  if (!node) return out;
  postOrder(node.left, out);
  postOrder(node.right, out);
  out.push(node.value);        // root শেষে
  return out;
}

//        1
//       / \
//      2   3
//     / \
//    4   5
const r = new TreeNode(1);
r.left = new TreeNode(2); r.right = new TreeNode(3);
r.left.left = new TreeNode(4); r.left.right = new TreeNode(5);

console.log(preOrder(r));  // [1,2,4,5,3]
console.log(inOrder(r));   // [4,2,5,1,3]
console.log(postOrder(r)); // [4,5,2,3,1]
```

**ব্রেকডাউন**
- তিনটার গঠন প্রায় এক; শুধু `push` কোথায় বসছে সেটাই পার্থক্য।
- recursion call stack tree-র গভীরতা অনুসরণ করে।

**Complexity:** O(n) time; space O(h) (h = height, stack)।

> **Animation Spec: DFS Order Player**
> - **দৃশ্য:** tree; একটা "visitor" node ধরে ধরে ঘোরে; নিচে output list তৈরি হয়।
> - **ইনপুট:** traversal type (pre/in/post), speed।
> - **ধাপ:** নির্বাচিত ক্রমে node visit ও output-এ যোগ; visited node রঙ বদলায়।
> - **লক্ষ্য:** তিন order-এর পার্থক্য একই গাছে দেখা।

**অনুশীলন**
- একই গাছে in-order কেন 4,2,5,1,3, হাতে মিলাও।

---

## 11.3: Level-Order Traversal (BFS on Tree)

**কী শিখব**
- স্তরে স্তরে (queue দিয়ে) ঘোরা

**ধারণা**
DFS গভীরে নামে; **BFS (level-order)** স্তরে স্তরে বাঁ থেকে ডানে ঘোরে, **queue** ব্যবহার করে (section 06)। "প্রতিটা স্তরে কী আছে" জাতীয় সমস্যায় লাগে।

**কোড উদাহরণ**
```js
function levelOrder(root) {
  if (!root) return [];
  const result = [], queue = [root];
  while (queue.length) {
    const levelSize = queue.length, level = [];
    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift();       // সামনেরটা বের
      level.push(node.value);
      if (node.left) queue.push(node.left);   // চাইল্ডদের পেছনে যোগ
      if (node.right) queue.push(node.right);
    }
    result.push(level);
  }
  return result;
}
console.log(levelOrder(r)); // [[1],[2,3],[4,5]]
```

**ব্রেকডাউন**
- queue-তে root দিয়ে শুরু; প্রতিবার সামনেরটা বের করে তার চাইল্ড পেছনে যোগ।
- `levelSize` ধরে রাখায় প্রতিটা স্তর আলাদা করা যায়।

**Complexity:** O(n) time; space O(n) (queue)।

> **Animation Spec: Level Sweep**
> - **দৃশ্য:** tree; একটা অনুভূমিক "স্ক্যান লাইন" উপর থেকে নিচে নামে; পাশে queue-এর অবস্থা।
> - **ইনপুট:** speed।
> - **ধাপ:** প্রতিটা স্তর বাঁ থেকে ডান visit; queue-তে enqueue/dequeue দেখা যায়।
> - **লক্ষ্য:** BFS = queue-ভিত্তিক স্তর-ভ্রমণ।

**অনুশীলন**
- একটা tree-র সর্বোচ্চ height BFS দিয়ে বের করো।

---

## 11.4: Binary Search Tree (BST)

**কী শিখব**
- সাজানো tree, দ্রুত search/insert/delete

**ধারণা**
BST = এমন binary tree যেখানে প্রতিটা node-এর জন্য: **বাঁ subtree-র সব ছোট, ডান subtree-র সব বড়**। এই নিয়মে search/insert গড়ে O(log n), কারণ প্রতি ধাপে অর্ধেক বাদ (binary search-এর মতো)।

```
       8
      / \
     3   10
    / \    \
   1   6    14
```

**কোড উদাহরণ**
```js
class BST {
  constructor() { this.root = null; }

  insert(value) {
    const node = new TreeNode(value);
    if (!this.root) { this.root = node; return; }
    let current = this.root;
    while (true) {
      if (value < current.value) {              // বাঁয়ে যাও
        if (!current.left) { current.left = node; return; }
        current = current.left;
      } else {                                  // ডানে যাও
        if (!current.right) { current.right = node; return; }
        current = current.right;
      }
    }
  }

  search(value) {
    let current = this.root;
    while (current) {
      if (value === current.value) return true;
      current = value < current.value ? current.left : current.right;
    }
    return false;
  }
}

const bst = new BST();
[8, 3, 10, 1, 6, 14].forEach(v => bst.insert(v));
console.log(bst.search(6));  // true
console.log(bst.search(7));  // false
console.log(inOrder(bst.root)); // [1,3,6,8,10,14] sorted!
```

**ব্রেকডাউন**
- insert/search-এ ছোট হলে বাঁয়ে, বড় হলে ডানে, অর্ধেক বাদ।
- **in-order traversal সবসময় sorted ক্রম দেয়**, BST-র চমৎকার ধর্ম।
- **সতর্কতা:** sorted ডেটা insert করলে গাছ একপাশে হেলে (linked list-এর মতো), complexity হয়ে যায় O(n)। সমাধান: balancing (নিচে AVL)।

**Complexity:** গড় O(log n); worst (skewed) O(n)।

> **Animation Spec: BST Insert & Search**
> - **দৃশ্য:** tree; নতুন মান root থেকে বাঁ/ডান সিদ্ধান্ত নিয়ে নিচে নামে।
> - **ইনপুট:** insert/search মান।
> - **ধাপ:** প্রতিটা তুলনায় "< না >" দেখিয়ে পথ highlight; জায়গা পেলে বসে।
> - **লক্ষ্য:** BST নিয়ম ও কেন গড়ে O(log n)।

**অনুশীলন**
- BST-তে সর্বনিম্ন মান খোঁজার মেথড লেখো (সবসময় বাঁয়ে যাও)।

---

## 11.5: AVL Tree (Self-Balancing BST)

**কী শিখব**
- গাছ ভারসাম্যে রেখে worst case এড়ানো

**ধারণা**
BST একপাশে হেললে O(n)। **AVL Tree** প্রতিটা insert/delete-এর পর নিশ্চিত করে যে কোনো node-এর বাঁ ও ডান subtree-র height-এর পার্থক্য (**balance factor**) সর্বোচ্চ 1। বেশি হলে **rotation** দিয়ে ঠিক করে, ফলে সবসময় O(log n)।

**চার ধরনের ভারসাম্যহীনতা ও সমাধান:**
- LL: ডানে rotate (right rotation)
- RR: বাঁয়ে rotate (left rotation)
- LR: বাঁয়ে তারপর ডানে
- RL: ডানে তারপর বাঁয়ে

**কোড উদাহরণ (rotation-এর মূল অংশ)**
```js
function height(node) { return node ? node.height : 0; }
function balanceFactor(node) { return node ? height(node.left) - height(node.right) : 0; }
function update(node) { node.height = 1 + Math.max(height(node.left), height(node.right)); }

// right rotation (LL ঠিক করে)
function rotateRight(y) {
  const x = y.left;
  y.left = x.right;      // x-এর ডান subtree y-এর বাঁয়ে
  x.right = y;           // y এখন x-এর ডানে
  update(y); update(x);
  return x;             // নতুন root
}
// left rotation (RR ঠিক করে)
function rotateLeft(x) {
  const y = x.right;
  x.right = y.left;
  y.left = x;
  update(x); update(y);
  return y;
}
// insert-এর পর balance:
function rebalance(node) {
  update(node);
  const bf = balanceFactor(node);
  if (bf > 1 && balanceFactor(node.left) >= 0) return rotateRight(node);        // LL
  if (bf > 1 && balanceFactor(node.left) < 0) { node.left = rotateLeft(node.left); return rotateRight(node); }  // LR
  if (bf < -1 && balanceFactor(node.right) <= 0) return rotateLeft(node);       // RR
  if (bf < -1 && balanceFactor(node.right) > 0) { node.right = rotateRight(node.right); return rotateLeft(node); } // RL
  return node;
}
```

**ব্রেকডাউন**
- প্রতিটা node তার height মনে রাখে; balance factor = বাঁ height বিয়োগ ডান height।
- balance factor-এর পরম মান 1-এর বেশি হলে rotation দিয়ে পুনর্বিন্যাস, মান/BST-নিয়ম অক্ষুণ্ণ রেখে।
- rotation একটা O(1) pointer-পুনর্বিন্যাস।

**Complexity:** insert/search/delete সব O(log n) নিশ্চিত।

> **Animation Spec: Rotation Fixer**
> - **দৃশ্য:** unbalanced tree; হেলে-পড়া অংশ লাল।
> - **ইনপুট:** insert sequence; rotation type auto-detect।
> - **ধাপ:** insert-এর পর ভারসাম্য মাপা হয়; দরকারে rotation animation-এ node গুলো ঘুরে balanced হয় (সবুজ)।
> - **লক্ষ্য:** rotation কীভাবে height নিয়ন্ত্রণে রাখে।

**অনুশীলন**
- 1,2,3 ক্রমে insert করলে কোন rotation লাগবে ভাবো (RR, অর্থাৎ left rotation)।

---

## 11.6: B-Tree (পরিচিতি)

**কী শিখব**
- database/disk-এর জন্য বহু-চাইল্ডওয়ালা balanced tree

**ধারণা**
Binary tree-র প্রতিটা node-এ ১টা key, ২টা চাইল্ড। **B-Tree**-তে প্রতিটা node-এ **অনেক key ও অনেক চাইল্ড** থাকতে পারে। এতে গাছ কম গভীর হয়, ফলে disk থেকে কম বার পড়তে হয়। এজন্য database index ও file system (section 15-এ B+ Tree) এতে দাঁড়িয়ে।

মূল ধর্ম (order m-এর B-Tree):
- প্রতিটা node-এ সর্বোচ্চ m-1 key, m চাইল্ড
- সব leaf একই স্তরে (perfectly balanced)
- node-এর key গুলো sorted

```
        [ 10 | 20 ]
       /     |     \
   [<10]  [10-20]  [>20]
```

**কোড উদাহরণ (node গঠন, ধারণা)**
```js
class BTreeNode {
  constructor(isLeaf = true) {
    this.keys = [];      // sorted key লিস্ট (একাধিক)
    this.children = [];  // চাইল্ড লিস্ট (keys+1 টা)
    this.isLeaf = isLeaf;
  }
}
// খোঁজা: node-এর keys-এ কোথায় fit করে দেখে সঠিক child-এ নামা
// (পূর্ণ insert/split বাস্তবায়ন advanced, section 15-এ B+ Tree বিস্তারিত)
```

**ব্রেকডাউন**
- অনেক key/চাইল্ড মানে কম height, মানে disk read কম।
- "node full হলে split", এই কৌশলে সবসময় balanced থাকে।
- বাস্তবে disk-page-এর আকারের সাথে node আকার মেলানো হয়।

**Complexity:** search/insert/delete O(log n); কিন্তু disk-access-এ বিশাল সুবিধা।

> **Animation Spec: Multi-key Node & Split**
> - **দৃশ্য:** প্রতিটা node-এ একাধিক key; একটা full node-এ insert করলে **split** হয়ে মাঝের key উপরে ওঠে।
> - **ইনপুট:** order m; insert sequence।
> - **ধাপ:** node full হলে split animation; height কীভাবে কম থাকে দেখা।
> - **লক্ষ্য:** কেন database-এ B-Tree, binary tree নয়।

**অনুশীলন**
- কেন কম height মানে কম disk read, নিজের ভাষায় লেখো।

---

## 11.7: Tree-তে BFS ও DFS (সারসংক্ষেপ)

**কী শিখব**
- দুই traversal কৌশল এক নজরে

**ধারণা**
- **DFS** (pre/in/post) চলে recursion বা **stack** দিয়ে; গভীরে আগে।
- **BFS** (level-order) চলে **queue** দিয়ে; স্তরে স্তরে।

দুটোই graph-এও (section 13) একই ধারণায় চলবে, tree আসলে graph-এরই বিশেষ রূপ (cycle-হীন)।

**কোড উদাহরণ (DFS iterative, stack দিয়ে)**
```js
function dfsIterative(root) {
  if (!root) return [];
  const stack = [root], out = [];
  while (stack.length) {
    const node = stack.pop();       // উপরেরটা নিই (LIFO, অর্থাৎ গভীরে আগে)
    out.push(node.value);
    if (node.right) stack.push(node.right); // ডান আগে push (বাঁ আগে বের হবে)
    if (node.left) stack.push(node.left);
  }
  return out;
}
console.log(dfsIterative(r)); // [1,2,4,5,3] (pre-order)
```

**ব্রেকডাউন**
- recursion-এর call stack-ই আসলে DFS-এর stack; এখানে হাতে stack দিয়ে করলাম।
- stack মানে DFS, queue মানে BFS, এই জোড়া মনে রাখো।

> **Animation Spec: Stack vs Queue Traversal**
> - **দৃশ্য:** একই tree, পাশে একবার stack (DFS), একবার queue (BFS)।
> - **ইনপুট:** DFS/BFS toggle।
> - **ধাপ:** data structure-এর push/pop অনুযায়ী node visit ক্রম আলাদা দেখা যাবে।
> - **লক্ষ্য:** কাঠামো (stack/queue) কীভাবে traversal ক্রম ঠিক করে।

**অনুশীলন**
- BFS iterative আর DFS iterative, কোনটায় কোন structure, মিলাও।

---

## Section সারাংশ

Tree = শ্রেণিবদ্ধ কাঠামো (root/leaf/height)। DFS: pre/in/post (recursion/stack), in-order BST-তে sorted। BFS: level-order (queue)। BST গড়ে O(log n) কিন্তু skew হলে O(n); AVL rotation দিয়ে সবসময় O(log n)। B-Tree বহু-key, database/disk-এর জন্য। stack মানে DFS, queue মানে BFS।

**পরবর্তী:** [12: Heaps & Priority Queues](12-heaps-and-priority-queues.md)
