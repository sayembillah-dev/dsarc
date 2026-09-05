# ০৬ — Stacks & Queues

এই দুটো হলো "নিয়ন্ত্রিত" data structure — এদের মধ্যে ডেটা ঢোকানো-বের করার নির্দিষ্ট নিয়ম আছে। এরা undo, browser history, task scheduling, BFS/DFS — সব জায়গায় লাগে।

> **Section Roadmap:** Stack (LIFO) → প্রয়োগ → Queue (FIFO) → Deque → Priority Queue (intro) → কখন কোনটা

---

## 6.1 — Stack (LIFO)

**🎯 কী শিখব**
- Last In, First Out নীতির stack

**💡 ধারণা**
Stack = থালার স্তূপের মতো। যেটা **শেষে** রাখো, সেটাই **আগে** নাও (LIFO — Last In First Out)। দুটো মূল অপারেশন: `push` (উপরে রাখা), `pop` (উপর থেকে নেওয়া)।

বাস্তব: বইয়ের স্তূপ, undo (Ctrl+Z), ব্রাউজারের back button।

**💻 কোড উদাহরণ**
```js
class Stack {
  constructor() { this.items = []; }

  push(x)  { this.items.push(x); }              // উপরে রাখি — O(1)
  pop()    { return this.items.pop(); }         // উপর থেকে নিই — O(1)
  peek()   { return this.items[this.items.length - 1]; } // উপরেরটা দেখি
  isEmpty(){ return this.items.length === 0; }
  size()   { return this.items.length; }
}

const s = new Stack();
s.push(10); s.push(20); s.push(30);
console.log(s.peek()); // 30 (সবার উপরে)
console.log(s.pop());  // 30 (শেষে ঢুকেছিল, আগে বের)
console.log(s.pop());  // 20
```

**🔍 ব্রেকডাউন**
- JavaScript array-এর `push/pop` শেষ প্রান্তে কাজ করে → O(1), তাই stack বানাতে আদর্শ।
- `peek` শুধু দেখে, বের করে না।

**⏱️ Complexity** — push/pop/peek O(1)।

> **🎬 Animation Spec: Plate Stack**
> - **দৃশ্য:** উল্লম্ব স্তূপ; উপরে top pointer।
> - **ইনপুট:** মান; push/pop বাটন।
> - **ধাপ:** push → নতুন plate উপরে নামে; pop → উপরের plate উঠে যায়। শুধু top-ই নাড়াচাড়া হয়।
> - **লক্ষ্য:** LIFO নীতি চোখে দেখা।

**📝 অনুশীলন**
- একটা string-এর বন্ধনী `()[]{}` সঠিকভাবে balanced কিনা stack দিয়ে চেক করো।

---

## 6.2 — Stack-এর প্রয়োগ: Balanced Parentheses

**🎯 কী শিখব**
- বাস্তব সমস্যায় stack প্রয়োগ

**💡 ধারণা**
প্রতিটা খোলা বন্ধনী stack-এ রাখি; বন্ধ বন্ধনী এলে দেখি উপরেরটা সঠিক জোড়া কিনা। শেষে stack খালি হলে balanced।

**💻 কোড উদাহরণ**
```js
function isBalanced(str) {
  const stack = [];
  const pairs = { ')': '(', ']': '[', '}': '{' };
  for (const ch of str) {
    if (ch === '(' || ch === '[' || ch === '{') {
      stack.push(ch);                 // খোলা → রাখি
    } else if (ch in pairs) {
      if (stack.pop() !== pairs[ch]) return false; // জোড়া মেলে না
    }
  }
  return stack.length === 0;          // সব বন্ধ হয়েছে?
}

console.log(isBalanced("({[]})")); // true
console.log(isBalanced("([)]"));   // false
```

**🔍 ব্রেকডাউন**
- খোলা bracket সবসময় push।
- বন্ধ bracket এলে top-এর সাথে জোড়া মেলাই; না মিললে ভুল।
- শেষে stack অ-খালি মানে কিছু বন্ধ হয়নি।

**⏱️ Complexity** — O(n), Space O(n)।

> **🎬 Animation Spec: Bracket Matcher**
> - **দৃশ্য:** উপরে string, নিচে stack।
> - **ইনপুট:** bracket string।
> - **ধাপ:** প্রতিটা char পড়ার সময় stack-এ push/pop দেখা যাবে; ভুল মিললে লাল flash।
> - **লক্ষ্য:** stack কীভাবে "মনে রাখে" শেষ খোলা bracket।

**📝 অনুশীলন**
- HTML tag `<div></div>` balanced কিনা একই ধারণায় ভাবো।

---

## 6.3 — Queue (FIFO)

**🎯 কী শিখব**
- First In, First Out নীতির queue

**💡 ধারণা**
Queue = লাইনে দাঁড়ানোর মতো। যে **আগে** আসে, সে **আগে** যায় (FIFO)। `enqueue` (পেছনে যোগ), `dequeue` (সামনে থেকে বের)।

বাস্তব: টিকিট কাউন্টারের লাইন, printer queue, BFS (section 13)।

**💻 কোড উদাহরণ (দক্ষ version)**
```js
// naive: arr.shift() O(n) — বড় queue-তে ধীর।
// দক্ষ: দুটো pointer দিয়ে O(1) dequeue।
class Queue {
  constructor() { this.items = {}; this.front = 0; this.back = 0; }

  enqueue(x) { this.items[this.back] = x; this.back++; }  // O(1)
  dequeue()  {
    if (this.isEmpty()) return undefined;
    const x = this.items[this.front];
    delete this.items[this.front];
    this.front++;
    return x;                                             // O(1)
  }
  peek()    { return this.items[this.front]; }
  isEmpty() { return this.back === this.front; }
  size()    { return this.back - this.front; }
}

const q = new Queue();
q.enqueue("A"); q.enqueue("B"); q.enqueue("C");
console.log(q.dequeue()); // A (আগে এসেছিল)
console.log(q.dequeue()); // B
console.log(q.peek());    // C
```

**🔍 ব্রেকডাউন**
- সহজ version: `arr.push()` + `arr.shift()`; কিন্তু `shift()` O(n)।
- দক্ষ version: object + front/back pointer → enqueue ও dequeue দুটোই O(1)।

**⏱️ Complexity** — enqueue/dequeue O(1) (এই version-এ)।

> **🎬 Animation Spec: Ticket Line**
> - **দৃশ্য:** অনুভূমিক লাইন; বাঁয়ে front, ডানে back।
> - **ইনপুট:** enqueue মান; dequeue বাটন।
> - **ধাপ:** enqueue → ডানে নতুন জন যোগ; dequeue → বাম থেকে একজন বেরিয়ে যায়, front pointer এগোয়।
> - **লক্ষ্য:** FIFO ও front/back pointer বোঝা।

**📝 অনুশীলন**
- একটা queue দিয়ে একটা "call center" simulation ভাবো (কে আগে সেবা পাবে)।

---

## 6.4 — Deque (দুই মুখের queue)

**🎯 কী শিখব**
- দুই প্রান্তেই যোগ/বাদ করা যায় এমন কাঠামো

**💡 ধারণা**
Deque (Double-Ended Queue) — সামনে ও পেছনে দুই দিকেই `add`/`remove` করা যায়। Sliding Window (section 16)-এর মতো সমস্যায় খুব দরকারি।

**💻 কোড উদাহরণ**
```js
class Deque {
  constructor() { this.items = []; }
  addFront(x)  { this.items.unshift(x); }
  addBack(x)   { this.items.push(x); }
  removeFront(){ return this.items.shift(); }
  removeBack() { return this.items.pop(); }
  peekFront()  { return this.items[0]; }
  peekBack()   { return this.items[this.items.length - 1]; }
}

const dq = new Deque();
dq.addBack(1); dq.addBack(2); dq.addFront(0);
console.log(dq.peekFront()); // 0
console.log(dq.peekBack());  // 2
```

**🔍 ব্রেকডাউন**
- চার প্রান্তিক অপারেশন: addFront/addBack/removeFront/removeBack।
- (array দিয়ে front অপারেশন O(n); performance-critical হলে doubly linked list দিয়ে O(1) করা যায়।)

**⏱️ Complexity** — array version: back O(1), front O(n); linked-list version: সব O(1)।

> **🎬 Animation Spec: Two-Ended Queue**
> - **দৃশ্য:** লাইন; দুই প্রান্তে add/remove বাটন।
> - **ইনপুট:** প্রান্ত ও মান নির্বাচন।
> - **ধাপ:** নির্বাচিত প্রান্তে এলিমেন্ট ঢোকে/বের হয়।
> - **লক্ষ্য:** deque-এর নমনীয়তা।

**📝 অনুশীলন**
- deque দিয়ে একটা string palindrome কিনা চেক করো (দুই প্রান্ত মিলিয়ে)।

---

## 6.5 — Priority Queue (পরিচিতি)

**🎯 কী শিখব**
- অগ্রাধিকার অনুযায়ী বের হওয়া queue-এর ধারণা

**💡 ধারণা**
সাধারণ queue-তে "আগে এলে আগে"। Priority Queue-তে **সবচেয়ে গুরুত্বপূর্ণ (highest/lowest priority)** আগে বের হয় — যেমন হাসপাতালের জরুরি রোগী আগে।

দক্ষ বাস্তবায়ন হয় **Heap** দিয়ে (section 12), যেখানে insert ও extract O(log n)। এখানে শুধু ধারণাটা একটা সরল (কম-দক্ষ) version দিয়ে দেখছি।

**💻 কোড উদাহরণ (সরল, ধারণার জন্য)**
```js
class PriorityQueue {
  constructor() { this.items = []; } // {value, priority}

  enqueue(value, priority) {
    this.items.push({ value, priority });
    this.items.sort((a, b) => a.priority - b.priority); // ছোট priority আগে
  }                                                     // sort → O(n log n)
  dequeue() { return this.items.shift(); }              // সর্বোচ্চ অগ্রাধিকার বের
}

const pq = new PriorityQueue();
pq.enqueue("সাধারণ রোগী", 5);
pq.enqueue("জরুরি রোগী", 1);
pq.enqueue("মাঝারি রোগী", 3);
console.log(pq.dequeue().value); // জরুরি রোগী (priority 1)
```

**🔍 ব্রেকডাউন**
- এই সরল version-এ প্রতিবার sort করায় enqueue O(n log n) — শেখার জন্য ঠিক, বাস্তবে heap ব্যবহার করব।
- section 12-এ heap দিয়ে দক্ষ version শিখব।

**⏱️ Complexity** — এই version: enqueue O(n log n); heap version: O(log n)।

> **🎬 Animation Spec: Priority Line**
> - **দৃশ্য:** লাইন, প্রতিটা এলিমেন্টে priority ব্যাজ; ছোট priority সামনে।
> - **ইনপুট:** value ও priority।
> - **ধাপ:** নতুন জন ঢুকে নিজের priority অনুযায়ী সঠিক জায়গায় বসে; dequeue-তে সামনেরটা বের।
> - **লক্ষ্য:** "অগ্রাধিকার আগে" ধারণা; heap-এর দিকে সেতু।

**📝 অনুশীলন**
- ভাবো: কেন প্রতিবার sort না করে heap ভালো (section 12-এ মিলিয়ে নেবে)।

---

## 6.6 — Stack vs Queue (সারসংক্ষেপ)

| দিক | Stack | Queue |
|-----|-------|-------|
| নীতি | LIFO | FIFO |
| যোগ | push (top) | enqueue (back) |
| বাদ | pop (top) | dequeue (front) |
| প্রয়োগ | undo, DFS, recursion | scheduling, BFS |

> **🎬 Animation Spec: LIFO vs FIFO**
> - **দৃশ্য:** পাশাপাশি stack ও queue; একই ক্রমে ডেটা ঢোকানো।
> - **ইনপুট:** একই input sequence।
> - **ধাপ:** একই ডেটা ঢুকিয়ে বের করলে stack উল্টো ক্রমে, queue একই ক্রমে বের করবে।
> - **লক্ষ্য:** দুই নীতির মৌলিক পার্থক্য।

**📝 অনুশীলন**
- দুটো stack দিয়ে একটা queue বানানো যায় কিনা ভাবো (ক্লাসিক interview প্রশ্ন)।

---

## ✅ Section সারাংশ

Stack = LIFO (push/pop, O(1)), undo/DFS-এ। Queue = FIFO (enqueue/dequeue, দক্ষ version O(1)), scheduling/BFS-এ। Deque = দুই মুখ। Priority Queue = অগ্রাধিকার আগে (heap দিয়ে দক্ষ)।

**পরবর্তী:** [07 — Hash Tables](07-hash-tables.md) →
