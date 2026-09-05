# ০৫ — Linked Lists

Array-তে শুরুতে insert/delete O(n)। Linked List এই সমস্যার সমাধান দেয়। এটা pointer-ভিত্তিক চিন্তার প্রথম ধাপ, যা পরে Tree ও Graph-এ কাজে লাগবে।

> **Section Roadmap:** ধারণা → Node → Singly Linked List → অপারেশন → Doubly Linked List → Circular Linked List → Array vs Linked List

---

## 5.1 — Linked List কী

**🎯 কী শিখব**
- pointer দিয়ে জোড়া লাগানো নোডের ধারণা

**💡 ধারণা**
Linked List হলো নোডের একটা শৃঙ্খল। প্রতিটা **node** দুটো জিনিস রাখে: (১) **data**, (২) পরের node-এর **reference (next)**। মেমরিতে node গুলো ছড়িয়ে থাকতে পারে — শুধু "next" pointer দিয়ে জোড়া।

```
[10|•] → [20|•] → [30|null]
 head
```

**সুবিধা:** শুরুতে insert/delete O(1)। **অসুবিধা:** index দিয়ে সরাসরি access নেই (খুঁজতে হয়, O(n))।

**💻 কোড উদাহরণ (Node)**
```js
class Node {
  constructor(value) {
    this.value = value;   // ডেটা
    this.next = null;     // পরের node-এর দিকে তীর
  }
}

// হাতে জোড়া লাগাই: 10 → 20 → 30
const a = new Node(10);
const b = new Node(20);
const c = new Node(30);
a.next = b;
b.next = c;

console.log(a.value);           // 10
console.log(a.next.value);      // 20
console.log(a.next.next.value); // 30
```

**🔍 ব্রেকডাউন**
- `Node` = data + next।
- `a.next = b` → a থেকে b-তে তীর টানা।
- শেষ node-এর `next` হয় `null` (শৃঙ্খলের শেষ)।

> **🎬 Animation Spec: Nodes & Pointers**
> - **দৃশ্য:** ভাসমান node box; প্রতিটার data ও next-তীর।
> - **ইনপুট:** node যোগ; একটা `next` তীর টেনে অন্য node-এ জোড়া।
> - **ধাপ:** তীর জুড়লে শৃঙ্খল তৈরি হবে; head থেকে শুরু করে তীর ধরে "ট্রাভার্স" আলোকিত হবে।
> - **লক্ষ্য:** pointer = "পরেরটার ঠিকানা" — এই মূল ধারণা।

**📝 অনুশীলন**
- হাতে ৪টা node জোড়া লাগিয়ে ৩য় node-এর value ছাপাও।

---

## 5.2 — Singly Linked List (পূর্ণ ক্লাস)

**🎯 কী শিখব**
- একটা কাজের singly linked list class বানানো

**💡 ধারণা**
`head` (প্রথম node) ধরে রাখলে পুরো তালিকায় পৌঁছানো যায়। আমরা `prepend` (শুরুতে), `append` (শেষে), `print`, `find` যোগ করব।

**💻 কোড উদাহরণ**
```js
class Node {
  constructor(value) { this.value = value; this.next = null; }
}

class LinkedList {
  constructor() { this.head = null; this.size = 0; }

  // শুরুতে যোগ — O(1)
  prepend(value) {
    const node = new Node(value);
    node.next = this.head;   // নতুন node পুরনো head-কে দেখায়
    this.head = node;        // নতুন node-ই এখন head
    this.size++;
  }

  // শেষে যোগ — O(n) (শেষ node খুঁজতে হয়)
  append(value) {
    const node = new Node(value);
    if (!this.head) { this.head = node; this.size++; return; }
    let current = this.head;
    while (current.next) current = current.next; // শেষে পৌঁছাই
    current.next = node;
    this.size++;
  }

  // মান খোঁজা — O(n)
  find(value) {
    let current = this.head;
    while (current) {
      if (current.value === value) return current;
      current = current.next;
    }
    return null;
  }

  print() {
    const parts = [];
    let current = this.head;
    while (current) { parts.push(current.value); current = current.next; }
    console.log(parts.join(" → ") + " → null");
  }
}

const list = new LinkedList();
list.append(10); list.append(20); list.prepend(5);
list.print();               // 5 → 10 → 20 → null
console.log(list.find(20)); // Node { value: 20, ... }
```

**🔍 ব্রেকডাউন**
- `prepend`: নতুন node → head; পুরনো head-কে next বানায়। কাউকে সরাতে হয় না → O(1)।
- `append`: শেষ node খুঁজতে পুরো তালিকা হাঁটতে হয় → O(n)।
- traversal প্যাটার্ন: `current = head; while(current) current = current.next;` — মনে রাখো।

**⏱️ Complexity** — prepend O(1); append/find/print O(n); space O(n)।

> **🎬 Animation Spec: Prepend vs Append**
> - **দৃশ্য:** node শৃঙ্খল, head লেবেল।
> - **ইনপুট:** মান; prepend/append নির্বাচন।
> - **ধাপ:** prepend → নতুন node সামনে বসে head তীর ঘুরে যায় (এক ধাপ); append → pointer শেষ পর্যন্ত হেঁটে তারপর জোড়া (n ধাপ)।
> - **লক্ষ্য:** কেন prepend O(1) আর append O(n)।

**📝 অনুশীলন**
- `insertAt(index, value)` মেথড যোগ করো।

---

## 5.3 — Node মুছে ফেলা (Deletion)

**🎯 কী শিখব**
- pointer ঘুরিয়ে node বাদ দেওয়া

**💡 ধারণা**
কোনো node মুছতে হলে তার **আগের** node-এর `next`-কে **পরের** node-এ জোড়া দিতে হয়। মাঝের node "বাইপাস" হয়ে যায়, তাই আর শৃঙ্খলে থাকে না।

```
মুছি 20:  [10|•] → [20|•] → [30]
পরে:      [10|•] ─────────→ [30]
```

**💻 কোড উদাহরণ**
```js
// LinkedList ক্লাসে যোগ করো:
remove(value) {
  if (!this.head) return;
  if (this.head.value === value) {        // head-ই মুছতে হলে
    this.head = this.head.next;
    this.size--; return;
  }
  let current = this.head;
  while (current.next && current.next.value !== value) {
    current = current.next;               // আগের node খুঁজি
  }
  if (current.next) {                      // পেলে বাইপাস করি
    current.next = current.next.next;
    this.size--;
  }
}
```

**🔍 ব্রেকডাউন**
- head মুছলে: `head = head.next`।
- মাঝেরটা মুছলে: আগের node-এর `next` = মুছে-ফেলা node-এর `next`।
- বাদ পড়া node-এর reference আর কেউ রাখে না → garbage collector মুছে দেয়।

**⏱️ Complexity** — খুঁজে বের করা O(n), pointer বদল O(1)।

> **🎬 Animation Spec: Node Deletion Bypass**
> - **দৃশ্য:** শৃঙ্খল; মুছতে চাওয়া node লাল।
> - **ইনপুট:** মুছতে চাওয়া value।
> - **ধাপ:** আগের node খুঁজে তার তীর বাঁকিয়ে পরের node-এ যাবে; লাল node ধূসর হয়ে "উধাও" হবে।
> - **লক্ষ্য:** deletion = pointer rewiring।

**📝 অনুশীলন**
- একটা মান তালিকায় না থাকলে remove কী করবে — টেস্ট করো।

---

## 5.4 — Doubly Linked List

**🎯 কী শিখব**
- সামনে ও পেছনে দুই দিকে চলা যায় এমন তালিকা

**💡 ধারণা**
প্রতিটা node-এ `next`-এর পাশাপাশি `prev` (আগের node-এর তীর) থাকে। ফলে দুই দিকে যাওয়া যায়, আর কোনো node পেলে তাকে O(1)-এ মুছে ফেলা যায় (আগেরটা `prev` দিয়ে জানা)।

```
null ← [10] ⇄ [20] ⇄ [30] → null
```

**💻 কোড উদাহরণ**
```js
class DNode {
  constructor(value) { this.value = value; this.prev = null; this.next = null; }
}

class DoublyLinkedList {
  constructor() { this.head = null; this.tail = null; }

  append(value) {                 // শেষে যোগ — এখন O(1)! (tail আছে)
    const node = new DNode(value);
    if (!this.head) { this.head = this.tail = node; return; }
    node.prev = this.tail;        // নতুন node-এর prev = পুরনো tail
    this.tail.next = node;        // পুরনো tail-এর next = নতুন node
    this.tail = node;             // tail আপডেট
  }

  printForward() {
    let c = this.head, out = [];
    while (c) { out.push(c.value); c = c.next; }
    console.log(out.join(" ⇄ "));
  }
  printBackward() {
    let c = this.tail, out = [];
    while (c) { out.push(c.value); c = c.prev; }
    console.log(out.join(" ⇄ "));
  }
}

const dll = new DoublyLinkedList();
dll.append(10); dll.append(20); dll.append(30);
dll.printForward();  // 10 ⇄ 20 ⇄ 30
dll.printBackward(); // 30 ⇄ 20 ⇄ 10
```

**🔍 ব্রেকডাউন**
- `tail` রাখায় append হলো O(1)।
- `prev` থাকায় পেছনে হাঁটা যায় ও দ্রুত delete করা যায়।
- খরচ: প্রতিটা node-এ অতিরিক্ত একটা pointer (বেশি memory)।

**⏱️ Complexity** — append/prepend O(1); search O(n)।

> **🎬 Animation Spec: Two-way Chain**
> - **দৃশ্য:** node শৃঙ্খল, প্রতিটার মাঝে দুমুখী তীর (prev/next)।
> - **ইনপুট:** direction toggle (forward/backward)।
> - **ধাপ:** নির্বাচিত দিকে pointer হাঁটবে; delete দেখালে দুই দিকের তীরই পুনঃসংযোগ হবে।
> - **লক্ষ্য:** dobly-র দ্বিমুখীতা ও দ্রুত delete।

**📝 অনুশীলন**
- Doubly list-এ `prepend` মেথড লেখো।

---

## 5.5 — Circular Linked List

**🎯 কী শিখব**
- শেষ node আবার প্রথমকে দেখায় — এমন বৃত্তাকার তালিকা

**💡 ধারণা**
সাধারণ list-এ শেষ node-এর next = null। Circular-এ শেষ node-এর next = **head** (প্রথম)। ফলে অবিরাম ঘোরা যায় — round-robin scheduling, buffer ইত্যাদিতে কাজে লাগে।

```
[10] → [20] → [30] ─┐
 ↑                  │
 └──────────────────┘
```

**💻 কোড উদাহরণ**
```js
class CircularList {
  constructor() { this.head = null; }

  append(value) {
    const node = new Node(value);
    if (!this.head) { this.head = node; node.next = node; return; } // নিজেকেই দেখায়
    let c = this.head;
    while (c.next !== this.head) c = c.next; // শেষ node খুঁজি
    c.next = node;
    node.next = this.head;                    // বৃত্ত সম্পূর্ণ
  }

  // n বার ঘুরে ঘুরে ছাপাই (নাহলে infinite!)
  printOnce() {
    if (!this.head) return;
    let c = this.head, out = [];
    do { out.push(c.value); c = c.next; } while (c !== this.head);
    console.log(out.join(" → ") + " → (back to head)");
  }
}

const cll = new CircularList();
cll.append(10); cll.append(20); cll.append(30);
cll.printOnce(); // 10 → 20 → 30 → (back to head)
```

**🔍 ব্রেকডাউন**
- একটামাত্র node হলে সে নিজেকেই next হিসেবে দেখায়।
- traversal-এ শর্ত `c !== this.head` — নাহলে infinite loop।
- `do...while` ব্যবহার করলাম যাতে প্রথম node অন্তত একবার ছাপে।

**⏱️ Complexity** — append O(n), traversal O(n)।

> **🎬 Animation Spec: The Loop**
> - **দৃশ্য:** node গুলো বৃত্তে সাজানো; শেষ থেকে head-এ তীর।
> - **ইনপুট:** কতবার ঘুরবে (rounds)।
> - **ধাপ:** একটা pointer বৃত্ত ধরে ঘুরবে; head পেরোলে "round complete" গোনা হবে।
> - **লক্ষ্য:** circularity ও কেন থামার শর্ত দরকার।

**📝 অনুশীলন**
- circular list-এ node সংখ্যা গোনার মেথড লেখো।

---

## 5.6 — Array vs Linked List (কখন কোনটা)

**🎯 কী শিখব**
- সঠিক কাঠামো বাছাই

**💡 ধারণা**

| দিক | Array | Linked List |
|-----|-------|-------------|
| Index access | O(1) ✅ | O(n) |
| শুরুতে insert/delete | O(n) | O(1) ✅ |
| Memory | কম, ধারাবাহিক | বেশি (pointer) |
| Cache-friendly | হ্যাঁ ✅ | না |
| আকার | সাধারণত fixed-ভিত্তিক | সহজে বাড়ে |

**নিয়ম:** বেশি **random access** লাগলে Array; বেশি **শুরুতে/মাঝে insert-delete** লাগলে Linked List।

> **🎬 Animation Spec: Side-by-side Decision**
> - **দৃশ্য:** বাঁয়ে array, ডানে linked list; একই অপারেশন দুদিকে চালানো।
> - **ইনপুট:** অপারেশন (access i / insert front / delete front)।
> - **ধাপ:** দুই কাঠামোয় step-counter চলবে; কে কম ধাপে করল highlight।
> - **লক্ষ্য:** কাঠামো-ভিত্তিক trade-off আত্মস্থ করা।

**📝 অনুশীলন**
- একটা "playlist" অ্যাপে গান আগে-পরে সরানো দরকার — কোন কাঠামো ভালো, যুক্তি দাও।

---

## ✅ Section সারাংশ

Linked list = data+next নোডের শৃঙ্খল; prepend O(1), access O(n)। Doubly = দুমুখী + tail দিয়ে O(1) append। Circular = শেষ→head বৃত্ত। কাঠামো বাছাই নির্ভর করে access বনাম insert-প্যাটার্নের উপর।

**পরবর্তী:** [06 — Stacks & Queues](06-stacks-and-queues.md) →
