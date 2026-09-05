# ১৪: Advanced Data Structures

এই কাঠামোগুলো নির্দিষ্ট ধরনের সমস্যা অসাধারণ দক্ষতায় সমাধান করে: autocomplete, range query, dynamic connectivity, string matching। competitive programming ও বড় সিস্টেমে এদের ভূমিকা বিশাল।

> **Section Roadmap:** Trie, Segment Tree, Fenwick Tree (BIT), Disjoint Set (Union-Find), Suffix Trees & Arrays

---

## 14.1: Trie (Prefix Tree)

**কী শিখব**
- prefix-ভিত্তিক দ্রুত শব্দ খোঁজা/autocomplete

**ধারণা**
Trie হলো এমন tree যেখানে প্রতিটা edge একটা অক্ষর, আর root থেকে কোনো node পর্যন্ত পথ অর্থাৎ একটা prefix। একই prefix-এর শব্দগুলো পথ **শেয়ার** করে। ফলে prefix খোঁজা/autocomplete হয় শব্দের সংখ্যা নয়, বরং **শব্দের দৈর্ঘ্যের** সমান দ্রুত, O(L)।

```
       (root)
        /  \
       c    d
      /      \
     a        o
    / \        \
   t   r        g
 (cat)(car)   (dog)
```

**কোড উদাহরণ**
```js
class TrieNode {
  constructor() { this.children = {}; this.isEnd = false; }
}
class Trie {
  constructor() { this.root = new TrieNode(); }

  insert(word) {
    let node = this.root;
    for (const ch of word) {
      if (!node.children[ch]) node.children[ch] = new TrieNode();
      node = node.children[ch];
    }
    node.isEnd = true;                 // শব্দ শেষ চিহ্ন
  }

  search(word) {
    const node = this._walk(word);
    return node !== null && node.isEnd; // পুরো শব্দ থাকতে হবে
  }

  startsWith(prefix) { return this._walk(prefix) !== null; }

  _walk(str) {                          // str ধরে নামা
    let node = this.root;
    for (const ch of str) {
      if (!node.children[ch]) return null;
      node = node.children[ch];
    }
    return node;
  }
}

const trie = new Trie();
["cat", "car", "dog"].forEach(w => trie.insert(w));
console.log(trie.search("car"));      // true
console.log(trie.search("ca"));       // false (শব্দ নয়, শুধু prefix)
console.log(trie.startsWith("ca"));   // true
```

**ব্রেকডাউন**
- `children` অর্থাৎ অক্ষর থেকে পরের node।
- `isEnd` না থাকলে "cat" থাকলেও "ca" শব্দ হিসেবে গণ্য হতো, তাই জরুরি।
- prefix শেয়ার হওয়ায় memory সাশ্রয় ও দ্রুত prefix query।

**Complexity:** insert/search O(L) (L = শব্দের দৈর্ঘ্য)।

> **Animation Spec: Autocomplete Trie**
> - **দৃশ্য:** trie গাছ; একটা prefix টাইপ করলে সেই পথ আলোকিত হয়ে নিচের সব সম্ভাব্য শব্দ (suggestions) দেখায়।
> - **ইনপুট:** শব্দ insert; prefix টাইপ।
> - **ধাপ:** টাইপের সাথে সাথে পথ highlight; matching subtree-র শব্দগুলো লিস্টে।
> - **লক্ষ্য:** কেন autocomplete-এ Trie আদর্শ।

**অনুশীলন**
- একটা `autocomplete(prefix)` মেথড লেখো যা সব matching শব্দ ফেরত দেয়।

---

## 14.2: Segment Tree

**কী শিখব**
- range query (যেমন range sum/min) ও update দুটোই O(log n)

**ধারণা**
"index 2 থেকে 7 পর্যন্ত যোগফল কত?", এমন **range query** array-তে O(n)। প্রতিবার element বদলালেও আবার O(n)। **Segment Tree** array-কে recursively অর্ধেক ভাগ করে প্রতিটা অংশের সারাংশ (sum/min/max) node-এ রাখে, ফলে query ও update দুটোই **O(log n)**।

```
             [0-3]:সব যোগ
            /          \
        [0-1]          [2-3]
        /   \          /   \
      [0]   [1]      [2]   [3]
```

**কোড উদাহরণ (range sum)**
```js
class SegmentTree {
  constructor(arr) {
    this.n = arr.length;
    this.tree = new Array(2 * this.n).fill(0);
    for (let i = 0; i < this.n; i++) this.tree[this.n + i] = arr[i]; // leaves
    for (let i = this.n - 1; i > 0; i--)                              // internal
      this.tree[i] = this.tree[2 * i] + this.tree[2 * i + 1];
  }

  update(index, value) {
    let i = index + this.n;
    this.tree[i] = value;
    while (i > 1) { i = i >> 1; this.tree[i] = this.tree[2*i] + this.tree[2*i+1]; }
  }

  query(left, right) {                 // [left, right)  যোগফল
    let sum = 0, l = left + this.n, r = right + this.n;
    while (l < r) {
      if (l & 1) sum += this.tree[l++];
      if (r & 1) sum += this.tree[--r];
      l >>= 1; r >>= 1;
    }
    return sum;
  }
}

const st = new SegmentTree([1, 2, 3, 4, 5]);
console.log(st.query(1, 4)); // 2+3+4 = 9
st.update(2, 10);            // index 2-এ 10
console.log(st.query(1, 4)); // 2+10+4 = 16
```

**ব্রেকডাউন**
- নিচের অর্ধেক (leaves) মূল array; উপরের node তাদের যোগফল।
- update-এ শুধু পথ ধরে উপরে গিয়ে সারাংশ ঠিক করা (log n)।
- query-এ প্রয়োজনীয় কয়েকটা node-এর সারাংশ মিলিয়ে নেওয়া (log n)।
- sum-এর জায়গায় `Math.min`/`Math.max` দিলে range-min/max tree।

**Complexity:** build O(n); query/update O(log n)।

> **Animation Spec: Range Query Path**
> - **দৃশ্য:** segment tree; query range-এর জন্য কোন node গুলো "যথেষ্ট" তা সবুজে highlight।
> - **ইনপুট:** array; query range; update।
> - **ধাপ:** query-তে log n node নির্বাচন; update-এ leaf থেকে root পর্যন্ত পথ আপডেট।
> - **লক্ষ্য:** কেন range query O(log n)।

**অনুশীলন**
- এই tree-কে range-min query-তে রূপান্তর করো।

---

## 14.3: Fenwick Tree (Binary Indexed Tree / BIT)

**কী শিখব**
- prefix sum ও update, কম কোডে O(log n)

**ধারণা**
Fenwick Tree segment tree-র হালকা বিকল্প: **prefix sum** ও **point update** দুটোই O(log n), কিন্তু কোড ছোট ও memory কম। কৌশলটা binary-এর "lowest set bit"-এর উপর দাঁড়ানো: প্রতিটা index একটা নির্দিষ্ট range-এর যোগফল রাখে।

**কোড উদাহরণ**
```js
class FenwickTree {
  constructor(size) { this.tree = new Array(size + 1).fill(0); } // 1-indexed

  update(i, delta) {                   // index i-তে delta যোগ
    i++;                               // 1-indexed
    for (; i < this.tree.length; i += i & -i) this.tree[i] += delta;
  }

  prefixSum(i) {                        // 0..i পর্যন্ত যোগফল
    i++;
    let sum = 0;
    for (; i > 0; i -= i & -i) sum += this.tree[i];
    return sum;
  }

  rangeSum(l, r) { return this.prefixSum(r) - this.prefixSum(l - 1); }
}

const ft = new FenwickTree(5);
[1, 2, 3, 4, 5].forEach((v, i) => ft.update(i, v));
console.log(ft.prefixSum(2)); // 1+2+3 = 6
console.log(ft.rangeSum(1, 3)); // 2+3+4 = 9
ft.update(2, 7);              // index 2-তে +7 (3 থেকে 10)
console.log(ft.rangeSum(1, 3)); // 2+10+4 = 16
```

**ব্রেকডাউন**
- `i & -i` অর্থাৎ সবচেয়ে ডানের set bit: এটাই কোন range কতটুকু ঢাকে ঠিক করে।
- update-এ bit যোগ করে উপরে, query-তে bit বিয়োগ করে নিচে যাই।
- range sum = দুই prefix sum-এর বিয়োগ।

**Complexity:** update/query O(log n); space O(n)।

> **Animation Spec: Bit-Range Coverage**
> - **দৃশ্য:** array ও BIT; প্রতিটা BIT index কোন range ঢাকে তা রঙিন bracket-এ।
> - **ইনপুট:** update index/delta; prefixSum i।
> - **ধাপ:** update/query-তে `i & -i` লাফগুলো animate হবে (কোন index গুলো ছোঁয়া হচ্ছে)।
> - **লক্ষ্য:** lowbit-জাম্পের যুক্তি ও কেন এত সংক্ষিপ্ত।

**অনুশীলন**
- Fenwick vs Segment Tree: কখন কোনটা, তুলনা লেখো।

---

## 14.4: Disjoint Set (Union-Find / DSU)

**কী শিখব**
- গোষ্ঠী (set) দ্রুত মেলানো ও "একই গোষ্ঠীতে কিনা" চেক

**ধারণা**
Union-Find অনেকগুলো উপাদানকে অ-ছেদী (disjoint) গোষ্ঠীতে রাখে ও দুটো মূল অপারেশন দেয়:
- **find(x):** x কোন গোষ্ঠীতে (root/representative)
- **union(a, b):** দুই গোষ্ঠী মেলানো

দুটো অপ্টিমাইজেশন (**path compression** ও **union by rank/size**) এদের প্রায় O(1) করে (α, প্রায়-ধ্রুবক)। Kruskal MST (section 13), cycle detection, connectivity-তে অপরিহার্য।

**কোড উদাহরণ (দুই অপ্টিমাইজেশন সহ)**
```js
class DSU {
  constructor(n) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.rank = new Array(n).fill(0);
  }
  find(x) {
    if (this.parent[x] !== x) this.parent[x] = this.find(this.parent[x]); // path compression
    return this.parent[x];
  }
  union(a, b) {
    const ra = this.find(a), rb = this.find(b);
    if (ra === rb) return false;              // ইতিমধ্যে একই গোষ্ঠী
    if (this.rank[ra] < this.rank[rb]) this.parent[ra] = rb;   // union by rank
    else if (this.rank[ra] > this.rank[rb]) this.parent[rb] = ra;
    else { this.parent[rb] = ra; this.rank[ra]++; }
    return true;
  }
  connected(a, b) { return this.find(a) === this.find(b); }
}

const dsu = new DSU(5);
dsu.union(0, 1); dsu.union(1, 2);
console.log(dsu.connected(0, 2)); // true  (0-1-2 এক গোষ্ঠী)
console.log(dsu.connected(0, 3)); // false
```

**ব্রেকডাউন**
- **path compression:** find-এর সময় প্রতিটা node সরাসরি root-এ জোড়া, ফলে পরের find দ্রুত।
- **union by rank:** ছোট গাছকে বড় গাছের নিচে জোড়া, ফলে গাছ চ্যাপ্টা থাকে।
- `union` false দিলে দুই প্রান্ত আগেই এক গোষ্ঠীতে (Kruskal-এ cycle সংকেত)।

**Complexity:** প্রতি অপারেশন প্রায় O(α(n)) ≈ O(1)।

> **Animation Spec: Grouping Forest**
> - **দৃশ্য:** node গুলো ছোট গাছ (গোষ্ঠী); union করলে দুই গাছ জোড়ে; find-এ path compression চ্যাপ্টা করে।
> - **ইনপুট:** union(a,b); find(x)।
> - **ধাপ:** union-এ root জোড়া; find-এ pointer সরাসরি root-এ পুনঃসংযুক্ত (দৃশ্যমান compression)।
> - **লক্ষ্য:** dynamic connectivity ও অপ্টিমাইজেশনের প্রভাব।

**অনুশীলন**
- DSU দিয়ে একটা undirected graph-এ connected component গোনো।

---

## 14.5: Suffix Trees & Suffix Arrays

**কী শিখব**
- string-এর সব suffix গুছিয়ে দ্রুত pattern matching

**ধারণা**
কোনো string-এর সব **suffix** (শেষাংশ) নিয়ে কাজ করলে অনেক string-সমস্যা (substring খোঁজা, longest repeated substring, longest common substring) দ্রুত হয়।

- **Suffix Array:** সব suffix-কে বর্ণানুক্রমে sort করে তাদের শুরুর index-এর array। সহজ, memory-সাশ্রয়ী; binary search দিয়ে pattern খোঁজা O(m log n)।
- **Suffix Tree:** সব suffix-কে একটা compressed trie-তে রাখা; খোঁজা O(m) কিন্তু গঠন জটিল ও memory-বহুল।

বাস্তবে বেশিরভাগ সময় **suffix array** ব্যবহার হয় (সরল ও যথেষ্ট দ্রুত)।

**কোড উদাহরণ (সরল suffix array, শেখার জন্য)**
```js
function buildSuffixArray(s) {
  const suffixes = [];
  for (let i = 0; i < s.length; i++) {
    suffixes.push({ index: i, suffix: s.slice(i) }); // O(n²), শেখার version
  }
  suffixes.sort((a, b) => a.suffix < b.suffix ? -1 : 1); // বর্ণানুক্রমে
  return suffixes.map(x => x.index);
}

// suffix array + binary search দিয়ে substring আছে কিনা
function contains(s, pattern) {
  const sa = buildSuffixArray(s);
  let lo = 0, hi = sa.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const suf = s.slice(sa[mid], sa[mid] + pattern.length);
    if (suf === pattern) return true;
    if (suf < pattern) lo = mid + 1; else hi = mid - 1;
  }
  return false;
}

console.log(buildSuffixArray("banana")); // suffix-দের sorted index
console.log(contains("banana", "nan"));  // true
console.log(contains("banana", "xyz"));  // false
```

**ব্রেকডাউন**
- সব suffix sort করলে একই prefix-ওয়ালা suffix পাশাপাশি আসে, তাই binary search দিয়ে pattern খোঁজা যায়।
- এই সরল version O(n² log n); বাস্তবে O(n log n)/O(n) construction algorithm আছে (advanced)।
- Suffix tree আরও ক্ষমতাশালী কিন্তু implement করা কঠিন, তাই সাধারণত suffix array।

**Complexity:** সরল build O(n² log n); খোঁজা O(m log n)। (উন্নত build O(n log n)।)

> **Animation Spec: Suffix Sort & Search**
> - **দৃশ্য:** string-এর সব suffix লিস্ট; sort হয়ে বর্ণানুক্রমে সাজে; pattern binary search-এ highlight।
> - **ইনপুট:** string ও pattern।
> - **ধাপ:** suffix গুলো sort animate; খোঁজার সময় অর্ধেক-অর্ধেক বাদ।
> - **লক্ষ্য:** সব suffix গুছিয়ে রাখলে string search কেন সহজ হয়।

**অনুশীলন**
- suffix array দিয়ে "longest repeated substring" কীভাবে বের করা যায় ভাবো (পাশাপাশি suffix-এর common prefix)।

---

## Section সারাংশ

Trie = prefix tree, autocomplete O(L)। Segment Tree = range query ও update O(log n)। Fenwick/BIT = হালকা prefix-sum O(log n)। Union-Find = dynamic grouping প্রায় O(1) (path compression ও rank)। Suffix Array/Tree = string pattern matching-এর শক্তিশালী হাতিয়ার।

**পরবর্তী:** [১৫: Complex & Disk-based Data Structures](15-complex-data-structures.md)
