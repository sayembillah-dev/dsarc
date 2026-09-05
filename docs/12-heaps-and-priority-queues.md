# ১২: Heaps & Priority Queues

Heap হলো এমন একটা tree-ভিত্তিক কাঠামো যা সবসময় সবচেয়ে বড়/ছোট উপাদান O(1)-এ দেয় ও O(log n)-এ যোগ/বাদ করে। এটাই Priority Queue-র ইঞ্জিন, আর Dijkstra (section 13), heap sort (section 09), "top-K" সমস্যার ভিত্তি।

> **Section Roadmap:** ধারণা, array-তে heap, insert (bubble up), extract (bubble down), MinHeap ক্লাস, Priority Queue, প্রয়োগ

---

## 12.1: Heap কী

**কী শিখব**
- Min-heap ও Max-heap-এর নিয়ম

**ধারণা**
Heap একটা **complete binary tree** (উপর থেকে বাঁ থেকে ডান পূর্ণ) যা একটা নিয়ম মানে:

- **Min-Heap:** প্রতিটা parent তার চাইল্ডদের চেয়ে **ছোট/সমান**, তাই সবচেয়ে ছোট মান root-এ।
- **Max-Heap:** প্রতিটা parent তার চাইল্ডদের চেয়ে **বড়/সমান**, তাই সবচেয়ে বড় মান root-এ।

> মনে রেখো: heap **পুরোপুরি sorted নয়**, শুধু parent-child সম্পর্ক মানা; তাই সবচেয়ে বড়/ছোট দ্রুত পাওয়া যায়, কিন্তু বাকি ক্রম নিশ্চিত নয়।

```
Min-Heap:      1
              / \
             3   6
            / \
           5   9
```

**কোড (ধারণা)**
```js
// root সবসময় সবচেয়ে ছোট (min-heap): peek(): O(1)
// insert/extract: O(log n)
```

**ব্রেকডাউন**
- BST-তে বাঁ<root<ডান; heap-এ শুধু parent vs child, নিয়ম ভিন্ন।
- BST দিয়ে min খুঁজতে O(log n); heap-এ min সবসময় root-এ, O(1)।

> **Animation Spec: Heap Property Check**
> - **দৃশ্য:** tree; প্রতিটা parent-child জোড়ায় নিয়ম মানছে কিনা সবুজ/লাল টিক।
> - **ইনপুট:** heap type (min/max) toggle।
> - **ধাপ:** নিয়ম-ভঙ্গ জোড়া লাল হবে; শিক্ষার্থী নিয়মটা বোঝে।
> - **লক্ষ্য:** heap নিয়ম বনাম BST নিয়ম আলাদা করা।

**অনুশীলন**
- একটা array heap-নিয়ম মানছে কিনা হাতে যাচাই করো।

---

## 12.2: Array-তে Heap (index গণিত)

**কী শিখব**
- কেন heap array দিয়ে বানানো হয়

**ধারণা**
Complete binary tree হওয়ায় heap-এ pointer লাগে না, একটা সাধারণ **array**-ই যথেষ্ট! index দিয়েই parent-child সম্পর্ক বের হয়:

- index `i`-এর **বাঁ চাইল্ড:** `2i + 1`
- index `i`-এর **ডান চাইল্ড:** `2i + 2`
- index `i`-এর **parent:** `Math.floor((i - 1) / 2)`

```
array:  [1, 3, 6, 5, 9]
index:   0  1  2  3  4
tree:        1(0)
            /     \
         3(1)     6(2)
         /  \
      5(3)  9(4)
```

**কোড উদাহরণ**
```js
const heap = [1, 3, 6, 5, 9];
const i = 1;                       // মান 3
console.log(heap[2 * i + 1]);      // বাঁ চাইল্ড: 5
console.log(heap[2 * i + 2]);      // ডান চাইল্ড: 9
console.log(heap[Math.floor((i - 1) / 2)]); // parent: 1
```

**ব্রেকডাউন**
- array-তে থাকায় memory ধারাবাহিক ও cache-friendly।
- index গণিত দিয়ে tree navigation, pointer-এর দরকার নেই।

> **Animation Spec: Array-Tree Sync**
> - **দৃশ্য:** উপরে tree, নিচে array; একটা index hover করলে দুই জায়গাতেই highlight, সাথে চাইল্ড/parent সূত্র দেখানো।
> - **ইনপুট:** index নির্বাচন।
> - **ধাপ:** সূত্র প্রয়োগ করে চাইল্ড/parent সেল চিহ্নিত হয়।
> - **লক্ষ্য:** array-heap দ্বৈততা।

**অনুশীলন**
- index 3-এর parent ও চাইল্ড সূত্র দিয়ে বের করো।

---

## 12.3: Insert (Bubble Up / Sift Up)

**কী শিখব**
- নতুন মান heap-এ যোগ ও নিয়ম রক্ষা

**ধারণা**
নতুন মান array-এর শেষে বসাই; তারপর যতক্ষণ parent-এর চেয়ে ছোট (min-heap), ততক্ষণ parent-এর সাথে swap করে উপরে তুলি (**bubble up**)। উচ্চতা log n বলে সর্বোচ্চ log n swap।

**কোড উদাহরণ**
```js
function insert(heap, value) {
  heap.push(value);                 // শেষে বসাই
  let i = heap.length - 1;
  while (i > 0) {
    const parent = Math.floor((i - 1) / 2);
    if (heap[parent] <= heap[i]) break; // নিয়ম ঠিক, থামি
    [heap[parent], heap[i]] = [heap[i], heap[parent]]; // swap up
    i = parent;
  }
}
const h = [1, 3, 6, 5, 9];
insert(h, 2);
console.log(h); // 2 উপরে উঠে সঠিক জায়গায় বসবে, যেমন [1,2,6,5,9,3]
```

**ব্রেকডাউন**
- শেষে যোগ করলে নিয়ম ভাঙতে পারে, তাই parent-এর সাথে তুলনা করে উপরে তোলা।
- ঠিক জায়গায় পৌঁছালে (parent ≤ value) থামে।

**Complexity:** O(log n)।

> **Animation Spec: Bubble Up**
> - **দৃশ্য:** tree/array; নতুন node শেষে যোগ, তারপর parent-এর সাথে তুলনা করে উপরে উঠতে থাকে।
> - **ইনপুট:** যোগ করার মান।
> - **ধাপ:** প্রতিটা তুলনা হলুদ, swap লাল; সঠিক জায়গায় সবুজ।
> - **লক্ষ্য:** insert মানে "শেষে বসাও, তারপর উপরে ভাসো"।

**অনুশীলন**
- খালি heap-এ 5,3,8,1 পরপর insert করে array অবস্থা লেখো।

---

## 12.4: Extract Min (Bubble Down / Heapify Down)

**কী শিখব**
- সবচেয়ে ছোট (root) বের করা ও নিয়ম রক্ষা

**ধারণা**
Root (min) বের করি; শেষ উপাদানকে root-এ বসাই; তারপর যতক্ষণ কোনো চাইল্ড তার চেয়ে ছোট, ততক্ষণ ছোট চাইল্ডের সাথে swap করে নিচে নামাই (**bubble down**)।

**কোড উদাহরণ**
```js
function extractMin(heap) {
  if (heap.length === 0) return undefined;
  const min = heap[0];
  const last = heap.pop();
  if (heap.length > 0) {
    heap[0] = last;                 // শেষটা root-এ
    let i = 0;
    const n = heap.length;
    while (true) {
      let smallest = i;
      const l = 2 * i + 1, r = 2 * i + 2;
      if (l < n && heap[l] < heap[smallest]) smallest = l;
      if (r < n && heap[r] < heap[smallest]) smallest = r;
      if (smallest === i) break;    // নিয়ম ঠিক, থামি
      [heap[i], heap[smallest]] = [heap[smallest], heap[i]]; // swap down
      i = smallest;
    }
  }
  return min;
}
const h2 = [1, 2, 6, 5, 9, 3];
console.log(extractMin(h2)); // 1 (min)
console.log(h2);             // পুনর্গঠিত heap
```

**ব্রেকডাউন**
- root সরানোর পর শেষটাকে root-এ তুলে **ছোট চাইল্ডের** সাথে swap করে নিচে নামানো।
- দুই চাইল্ডের মধ্যে ছোটটা বাছা জরুরি (min-heap নিয়ম রক্ষা)।

**Complexity:** O(log n)।

> **Animation Spec: Bubble Down**
> - **দৃশ্য:** root বের হয় (সবুজ, উঠে যায়); শেষ node root-এ বসে নিচে নামতে থাকে।
> - **ইনপুট:** extract বাটন।
> - **ধাপ:** প্রতি স্তরে দুই চাইল্ডের ছোটটার সাথে তুলনা/swap; জায়গা পেলে থামে।
> - **লক্ষ্য:** extract মানে "root নাও, শেষটা তোলো, নিচে ডুবাও"।

**অনুশীলন**
- extractMin পরপর ডাকলে কী sorted ক্রমে বের হয়? (এটাই heap sort-এর মূল)

---

## 12.5: MinHeap ক্লাস (সম্পূর্ণ)

**কী শিখব**
- পুনর্ব্যবহারযোগ্য heap class

**কোড উদাহরণ**
```js
class MinHeap {
  constructor() { this.data = []; }
  size()  { return this.data.length; }
  peek()  { return this.data[0]; }          // min, O(1)

  push(value) {
    this.data.push(value);
    let i = this.data.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;               // parent (fast /2)
      if (this.data[p] <= this.data[i]) break;
      [this.data[p], this.data[i]] = [this.data[i], this.data[p]];
      i = p;
    }
  }

  pop() {
    const n = this.data.length;
    if (n === 0) return undefined;
    const top = this.data[0];
    const last = this.data.pop();
    if (this.data.length) {
      this.data[0] = last;
      let i = 0, m = this.data.length;
      while (true) {
        let s = i, l = 2*i+1, r = 2*i+2;
        if (l < m && this.data[l] < this.data[s]) s = l;
        if (r < m && this.data[r] < this.data[s]) s = r;
        if (s === i) break;
        [this.data[i], this.data[s]] = [this.data[s], this.data[i]];
        i = s;
      }
    }
    return top;
  }
}

const mh = new MinHeap();
[5, 3, 8, 1, 2].forEach(v => mh.push(v));
console.log(mh.pop(), mh.pop(), mh.pop()); // 1 2 3
```

**ব্রেকডাউন**
- `push` = insert (bubble up), `pop` = extract-min (bubble down)।
- `(i-1) >> 1` = `Math.floor((i-1)/2)`-এর দ্রুত রূপ।
- Max-heap চাইলে সব তুলনায় `<` কে `>` করলেই হয়।

> **Animation Spec: Full Heap Ops**
> - **দৃশ্য:** array+tree সিঙ্ক; push/pop বাটন।
> - **ইনপুট:** মান; heap type।
> - **ধাপ:** push হলে bubble up, pop হলে bubble down; প্রতিটা swap গোনা হয়।
> - **লক্ষ্য:** সম্পূর্ণ heap lifecycle।

**অনুশীলন**
- এই class-কে MaxHeap-এ রূপান্তর করো।

---

## 12.6: Priority Queue ও প্রয়োগ

**কী শিখব**
- heap দিয়ে দক্ষ priority queue ও বাস্তব প্রয়োগ

**ধারণা**
Priority Queue = "সবচেয়ে গুরুত্বপূর্ণ আগে বের হয়", heap দিয়ে insert/extract O(log n)। section 06-এর sort-ভিত্তিক (O(n log n)) version-এর চেয়ে অনেক দক্ষ।

**ক্লাসিক প্রয়োগ:**
- **Top-K:** সবচেয়ে বড়/ছোট K উপাদান (size-K min-heap দিয়ে O(n log K))
- **Dijkstra** (section 13): সবচেয়ে কাছের node আগে
- **Heap sort** (section 09)
- **Median maintenance** (two heaps, section 16)

**কোড উদাহরণ (Top-K largest)**
```js
// array থেকে সবচেয়ে বড় k সংখ্যা: size-k min-heap
function topK(nums, k) {
  const heap = new MinHeap();
  for (const num of nums) {
    heap.push(num);
    if (heap.size() > k) heap.pop();  // ছোটটা ফেলে দিই, বড় k থাকে
  }
  return heap.data.sort((a, b) => b - a); // বড় থেকে ছোট
}
console.log(topK([3, 1, 5, 12, 2, 11], 3)); // [12, 11, 5]
```

**ব্রেকডাউন**
- min-heap-এ সবসময় সবচেয়ে বড় k রাখি; size k ছাড়ালে root (সবচেয়ে ছোট) ফেলে দিই।
- পুরো sort (O(n log n)) না করে O(n log k), k ছোট হলে বিশাল সাশ্রয়।

**Complexity:** Top-K: O(n log k)।

> **Animation Spec: Top-K Filter**
> - **দৃশ্য:** ইনপুট স্ট্রিম বাঁয়ে; ডানে size-k heap।
> - **ইনপুট:** সংখ্যা লিস্ট, k।
> - **ধাপ:** প্রতিটা সংখ্যা heap-এ ঢোকে; size>k হলে সবচেয়ে ছোটটা বেরিয়ে যায়; শেষে k বড় থাকে।
> - **লক্ষ্য:** কেন heap top-K সমস্যায় দক্ষ।

**অনুশীলন**
- Top-K smallest বের করতে max-heap কীভাবে ব্যবহার করবে ভাবো।

---

## Section সারাংশ

Heap = complete binary tree, parent-child নিয়মে; min/max root-এ (O(1))। array দিয়ে বানানো (2i+1, 2i+2)। insert=bubble up, extract=bubble down (O(log n))। Priority Queue-র ইঞ্জিন; Top-K, Dijkstra, heap sort-এ ব্যবহৃত।

**পরবর্তী:** [13: Graph Data Structures](13-graph-data-structures.md)
