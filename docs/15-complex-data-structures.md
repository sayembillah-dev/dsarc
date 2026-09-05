# ১৫: Complex & Disk-based Data Structures

এই কাঠামোগুলো মূলত **বড় ডেটা ও disk/database**-এর প্রেক্ষাপটে গুরুত্বপূর্ণ, যেখানে ডেটা memory-তে আঁটে না এবং disk read কমানোই আসল লক্ষ্য। এরা তত্ত্বীয় ও ব্যবহারিক, দুই দিক থেকেই মূল্যবান।

> **Section Roadmap:** 2-3 Tree, B-Tree/B+ Tree, Skip List, ISAM, Indexing (Linear, Tree-Based)

---

## 15.1: 2-3 Tree

**কী শিখব**
- সবসময় balanced থাকা multi-way search tree-র ধারণা

**ধারণা**
2-3 Tree একটা balanced search tree যেখানে প্রতিটা internal node হয়:
- **2-node:** ১টা key, ২টা চাইল্ড, অথবা
- **3-node:** ২টা key, ৩টা চাইল্ড

**সব leaf সবসময় একই স্তরে**, তাই perfectly balanced, উচ্চতা সবসময় O(log n)। AVL-এর মতোই লক্ষ্য (ভারসাম্য), কিন্তু rotation-এর বদলে node **split/merge** দিয়ে ভারসাম্য রাখে। এটাই B-Tree-র (নিচে) সরলতম রূপ।

```
2-node:  [10]        3-node:  [10 | 20]
        /    \               /    |    \
     <10     >10          <10  10-20  >20
```

**কোড উদাহরণ (node গঠন, ধারণা)**
```js
class TwoThreeNode {
  constructor() {
    this.keys = [];       // 1 বা 2 টা key (sorted)
    this.children = [];   // 2 বা 3 টা চাইল্ড
  }
  isLeaf() { return this.children.length === 0; }
  is3Node() { return this.keys.length === 2; }
}
// insert: সঠিক leaf খুঁজে key বসাও; node-এ 3 key হলে split করে
// মাঝের key parent-এ তুলে দাও (এতে height সমানভাবে বাড়ে)।
```

**ব্রেকডাউন**
- insert-এ leaf-এ key যোগ; 3টা key হয়ে গেলে **split**, মাঝেরটা উপরে ওঠে।
- split উপরের দিকে ছড়াতে পারে, root split হলে height বাড়ে (সবার জন্য সমান)।
- কখনো একপাশে হেলে না, তাই worst case-ও O(log n)।

**Complexity:** search/insert/delete O(log n) নিশ্চিত।

> **Animation Spec: Split & Grow**
> - **দৃশ্য:** 2-3 tree; একটা full (3-key) node-এ insert করলে split হয়ে মাঝের key উপরে ওঠে।
> - **ইনপুট:** insert sequence।
> - **ধাপ:** node overflow, তারপর split animation; height সমানভাবে বাড়া।
> - **লক্ষ্য:** rotation-হীন ভারসাম্য (split/merge) বোঝা।

**অনুশীলন**
- 1..7 পরপর insert করলে height কীভাবে বাড়ে ভাবো।

---

## 15.2: B-Tree ও B+ Tree

**কী শিখব**
- database ও file system-এর মূল index কাঠামো

**ধারণা**
2-3 Tree-কে সাধারণীকরণ করলেই **B-Tree** (section 11.6-এ পরিচয়): প্রতিটা node-এ **অনেক key ও অনেক চাইল্ড** (order m)। উদ্দেশ্য: গাছ যতটা সম্ভব **কম গভীর** রাখা, কারণ disk থেকে প্রতিটা node পড়া ব্যয়বহুল; কম height = কম disk read।

**B+ Tree** (বাস্তবে database index যা ব্যবহার করে): B-Tree-র উন্নত রূপ।
- **সব actual data শুধু leaf-এ** থাকে (internal node শুধু "রাস্তা দেখানোর" key)
- **সব leaf একটা linked list-এ জোড়া**, তাই range query (`WHERE age BETWEEN 20 AND 30`) খুব দ্রুত (এক leaf থেকে পরের leaf-এ হাঁটা)

```
B+ Tree:
            [30 | 60]              (internal: শুধু guide)
           /    |    \
     [10 20]->[30 40 50]->[60 70]  (leaf: actual data, পরস্পর linked)
```

**কোড উদাহরণ (ধারণা, কেন B+ Tree)**
```js
// SELECT * FROM users WHERE age BETWEEN 25 AND 40;
// B+ Tree: 25-এর leaf খুঁজে (O(log n)), তারপর leaf-linked-list ধরে
//          40 পর্যন্ত sequential পড়া, খুবই দক্ষ range scan।
```

**ব্রেকডাউন**
- বড় fan-out (অনেক চাইল্ড): লাখো row-এও height মাত্র ৩-৪, তাই ৩-৪ disk read-এ যেকোনো row।
- B+ Tree-এর linked leaf sorted scan ও range query সহজ করে; এজন্য MySQL (InnoDB), PostgreSQL সবই B+ Tree index ব্যবহার করে।

**Complexity:** search/insert/delete O(log n); disk-access-এ বিশাল সুবিধা।

> **Animation Spec: B+ Tree Range Scan**
> - **দৃশ্য:** B+ tree; internal node "guide", leaf-এ data ও leaf-লিঙ্ক তীর।
> - **ইনপুট:** range query [lo, hi]।
> - **ধাপ:** lo খুঁজে নামা, তারপর leaf-linked-list ধরে hi পর্যন্ত হাঁটা (সবুজ)।
> - **লক্ষ্য:** কেন database index-এ B+ Tree, binary tree নয়।

**অনুশীলন**
- কেন range query-তে B+ Tree, B-Tree-র চেয়ে ভালো, নিজের ভাষায় লেখো।

---

## 15.3: Skip List

**কী শিখব**
- linked list-এ "express lane" বসিয়ে O(log n) search

**ধারণা**
সাধারণ sorted linked list-এ search O(n) (index নেই)। **Skip List** কয়েকটা অতিরিক্ত স্তর (express lane) যোগ করে: উপরের স্তরে কম node (কিছু "লাফিয়ে" যায়), নিচের স্তরে সব node। খোঁজার সময় উপরে দ্রুত এগিয়ে দরকারমতো নিচে নামা, ফলে গড়ে **O(log n)**। randomness দিয়ে স্তর ঠিক হয় (তাই সহজ, balanced tree-র বিকল্প)।

```
L2:  1 --------> 9 --------> 25
L1:  1 ----> 6 -> 9 ----> 17 -> 25
L0:  1 -> 6 -> 9 -> 12 -> 17 -> 20 -> 25   (সব node)
```

**কোড উদাহরণ (সরলীকৃত search ধারণা)**
```js
class SkipNode {
  constructor(value, level) {
    this.value = value;
    this.next = new Array(level + 1).fill(null); // প্রতি স্তরে next
  }
}
// search: সবচেয়ে উপরের স্তর থেকে শুরু;
//   পরের node ছোট/সমান হলে সামনে এগোও (express),
//   নাহলে এক স্তর নিচে নামো; নিচে নামতে নামতে target পাও।
function search(head, target, maxLevel) {
  let node = head;
  for (let level = maxLevel; level >= 0; level--) {
    while (node.next[level] && node.next[level].value < target) {
      node = node.next[level];          // এই স্তরে সামনে এগোই
    }                                    // পরের বড়, তাই নিচে নামি
  }
  node = node.next[0];
  return node && node.value === target;
}
```

**ব্রেকডাউন**
- উপরের স্তর "দূরপাল্লার" লাফ; নিচের স্তর "লোকাল"।
- নতুন node-এর স্তর সাধারণত coin-flip (random) দিয়ে ঠিক হয়, ফলে গড়ে ভারসাম্য।
- Redis-এর sorted set (ZSET) skip list ব্যবহার করে।

**Complexity:** গড় search/insert/delete O(log n); space O(n)।

> **Animation Spec: Express Lanes**
> - **দৃশ্য:** বহু-স্তর linked list; search-এ pointer উপরে দ্রুত এগোয়, দরকারে নিচে নামে।
> - **ইনপুট:** target; insert (random level সহ)।
> - **ধাপ:** "সামনে নাকি নিচে" সিদ্ধান্ত highlight; পথ ট্রেস।
> - **লক্ষ্য:** কেন express lane search দ্রুত করে।

**অনুশীলন**
- coin-flip স্তর কেন ভারসাম্য দেয়, সম্ভাবনার দিক থেকে ভাবো।

---

## 15.4: ISAM (Indexed Sequential Access Method)

**কী শিখব**
- পুরনো কিন্তু শিক্ষণীয় disk index পদ্ধতি

**ধারণা**
ISAM একটা পুরনো disk-based indexing পদ্ধতি (B+ Tree-র পূর্বসূরি ভাবা যায়)। ডেটা **sequential**-ভাবে (sorted) disk-এ রাখা হয়, আর তার উপরে একটা **static (স্থির) index** বসানো হয় যা দ্রুত মোটামুটি জায়গায় পৌঁছে দেয়, তারপর sequential পড়া।

মূল বৈশিষ্ট্য:
- **index স্থির:** একবার বানানো, ডেটা বদলালেও index কাঠামো বদলায় না
- নতুন record-এর জন্য **overflow area** ব্যবহার হয়
- বেশি insert হলে overflow বড় হয়ে performance পড়ে যায়, তাই periodic **reorganization** লাগে

**কোড উদাহরণ (ধারণা)**
```text
Index:   [A -> page1] [F -> page2] [M -> page3]   (স্থির, sorted key থেকে page)
Data:    page1: A,B,C  |  page2: F,G  |  page3: M,N,O  |  overflow: (নতুনগুলো)
খোঁজা "G": index-এ F-এর page পাই -> page2 sequential scan -> G
```

**ব্রেকডাউন**
- static index-এর সুবিধা: সরল, দ্রুত পঠনভিত্তিক (read-heavy) কাজে ভালো।
- অসুবিধা: বেশি লেখালেখি (write-heavy)-তে overflow জমে ধীর; এই সমস্যাই B+ Tree (dynamic, self-balancing) সমাধান করেছে।
- তাই আধুনিক DBMS-এ ISAM প্রায় নেই, কিন্তু "কেন dynamic index দরকার" বুঝতে এটা শেখা মূল্যবান।

**Complexity:** ভালো অবস্থায় O(log n)-এর কাছাকাছি; overflow বাড়লে খারাপ।

> **Animation Spec: Static Index + Overflow**
> - **দৃশ্য:** স্থির index টেবিল ও sequential data page ও overflow area।
> - **ইনপুট:** search key; নতুন record insert।
> - **ধাপ:** search: index, page, scan; insert বারবার করলে overflow বাড়া ও performance পড়া দেখানো।
> - **লক্ষ্য:** static বনাম dynamic index-এর trade-off (B+ Tree-র প্রেরণা)।

**অনুশীলন**
- ISAM বনাম B+ Tree: read-heavy বনাম write-heavy-তে কোনটা ভালো, ব্যাখ্যা করো।

---

## 15.5: Indexing (Linear ও Tree-Based)

**কী শিখব**
- database কীভাবে দ্রুত খোঁজে, indexing-এর দুই ঘরানা

**ধারণা**
**Index** মানে ডেটার উপর একটা অতিরিক্ত কাঠামো যা খোঁজা দ্রুত করে (বইয়ের পেছনের index-এর মতো)। মূল দুই ঘরানা:

**১) Linear / Hash-based Indexing**
- key থেকে সরাসরি জায়গা (hash table-এর মতো)
- **সমতা (equality) query**-তে দুর্দান্ত: `WHERE id = 42`, O(1)
- কিন্তু **range query**-তে অকার্যকর (`WHERE id > 42`, hash-এ ক্রম নেই)

**২) Tree-based Indexing (B/B+ Tree)**
- key গুলো sorted কাঠামোতে
- equality **ও** range, দুটোই ভালো: `WHERE age BETWEEN 20 AND 30`
- এজন্য বেশিরভাগ database-এর default index tree-based (B+ Tree)

**কোড উদাহরণ (ধারণা, কোন index কখন)**
```sql
-- Hash index আদর্শ:
SELECT * FROM users WHERE id = 42;          -- O(1) equality

-- B+ Tree index আদর্শ:
SELECT * FROM users WHERE age BETWEEN 20 AND 30;  -- range
SELECT * FROM users ORDER BY name;                -- sorted scan
```

**ব্রেকডাউন**
- Hash: দ্রুততম equality, কিন্তু ক্রম/range নেই।
- Tree (B+): সামান্য ধীর equality, কিন্তু range/sort/prefix সবই ভালো, তাই বেশি বহুমুখী।
- বাস্তবে DBA কোন column-এ কোন ধরনের index দেবে, তা query-প্যাটার্ন দেখে ঠিক করে।

**Complexity:** Hash: equality O(1); Tree: O(log n) কিন্তু range-সক্ষম।

> **Animation Spec: Query অনুযায়ী Index Choice**
> - **দৃশ্য:** একটা query; বাঁয়ে hash index, ডানে tree index; কোনটা কীভাবে সাড়া দেয়।
> - **ইনপুট:** query type (equality / range / sort)।
> - **ধাপ:** equality-তে hash ঝলসে ওঠে; range-এ tree leaf-scan করে; hash "পারছি না" দেখায়।
> - **লক্ষ্য:** index বাছাই query-প্যাটার্নের উপর নির্ভরশীল।

**অনুশীলন**
- তোমার একটা টেবিলে কোন column-এ hash, কোনটায় B+ Tree index দেবে, যুক্তিসহ ভাবো।

---

## Section সারাংশ

2-3 Tree = split/merge-ভিত্তিক balanced tree (B-Tree-র বীজ)। B/B+ Tree = কম-height, disk-বান্ধব; B+ Tree-র linked leaf range query-তে সেরা (database default)। Skip List = express-lane linked list, গড়ে O(log n)। ISAM = static index (read-heavy-তে ভালো, write-heavy-তে দুর্বল)। Indexing: hash (equality O(1)) বনাম tree (equality+range)।

**পরবর্তী:** [১৬: Problem Solving Techniques](16-problem-solving-techniques.md)
