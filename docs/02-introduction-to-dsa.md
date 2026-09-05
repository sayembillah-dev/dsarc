# ০২ — Introduction to Data Structures & Algorithms

এবার আসল যাত্রা শুরু। এই ছোট section-এ আমরা বুঝব DSA আসলে কী, কেন এত গুরুত্বপূর্ণ, আর কীভাবে চিন্তা করতে হয়।

> **Section Roadmap:** Data Structure কী → Algorithm কী → কেন গুরুত্বপূর্ণ → কীভাবে চিন্তা করব

---

## 2.1 — Data Structure কী? (What are Data Structures?)

**🎯 কী শিখব**
- Data structure-এর সংজ্ঞা ও প্রকারভেদের ধারণা

**💡 ধারণা**
**Data Structure** = ডেটা সাজিয়ে রাখার একটা নির্দিষ্ট পদ্ধতি, যাতে সেই ডেটা দ্রুত ও সহজে ব্যবহার করা যায়।

বাস্তব উদাহরণ ভাবো — একটা লাইব্রেরি:
- বই যদি এলোমেলো স্তূপে থাকে → খুঁজে পেতে ঘণ্টা লাগবে
- বই যদি বিষয় অনুযায়ী তাক-এ সাজানো থাকে → মিনিটে পেয়ে যাবে

ডেটাও তেমনি। **একই ডেটা, ভিন্ন কাঠামোতে রাখলে ভিন্ন গতি পাওয়া যায়।**

**দুই ধরনের data structure:**
- **Linear** — একটার পর একটা: Array, Linked List, Stack, Queue
- **Non-linear** — শাখা-প্রশাখা/জাল: Tree, Graph, Hash Table

**💻 কোড উদাহরণ (একই ডেটা, তিন কাঠামো)**
```js
// একই ৩ জন ছাত্রের নাম, তিনভাবে রাখা:
const asArray  = ["Rahim", "Karim", "Jamal"];             // ক্রম আছে
const asObject = { s1: "Rahim", s2: "Karim", s3: "Jamal" }; // key দিয়ে
const asSet    = new Set(["Rahim", "Karim", "Jamal"]);      // ইউনিক মান
```

**🔍 ব্রেকডাউন**
- Array → ক্রম ও index গুরুত্বপূর্ণ হলে ভালো।
- Object/Map → নাম/key দিয়ে দ্রুত খুঁজতে ভালো।
- Set → শুধু ইউনিক মান রাখতে ভালো।

> **🎬 Animation Spec: One Data, Many Shapes**
> - **দৃশ্য:** একই কয়েকটা ডেটা এলিমেন্ট তিনটা ভিন্ন কাঠামোতে (list, tree, key-value) morph হয়।
> - **ইনপুট:** কাঠামো নির্বাচন dropdown।
> - **ধাপ:** নির্বাচন বদলালে একই এলিমেন্টগুলো নতুন বিন্যাসে সাজবে (smooth transition)।
> - **লক্ষ্য:** "ডেটা এক, কাঠামো অনেক" — এই মূল ধারণা।

**📝 অনুশীলন**
- তোমার ফোনের contact list কোন কাঠামোতে সাজানো ভালো হবে ভাবো ও যুক্তি দাও।

---

## 2.2 — Algorithm কী?

**🎯 কী শিখব**
- Algorithm-এর সংজ্ঞা ও গুণাবলি

**💡 ধারণা**
**Algorithm** = কোনো সমস্যা সমাধানের ধাপে ধাপে নির্দেশনা — একটা **রেসিপির** মতো।

চা বানানোর রেসিপি একটা algorithm:
1. পানি গরম করো
2. চা পাতা দাও
3. চিনি/দুধ মেশাও
4. ছেঁকে পরিবেশন করো

ভালো algorithm-এর গুণ:
- **সঠিক** (correct) — ঠিক উত্তর দেয়
- **সুনির্দিষ্ট** (unambiguous) — প্রতিটা ধাপ পরিষ্কার
- **সসীম** (finite) — একসময় শেষ হয়
- **কার্যকর** (efficient) — কম সময়/জায়গা নেয়

**💻 কোড উদাহরণ**
```js
// Algorithm: array-এর সব সংখ্যার গড় বের করা
function average(numbers) {
  let total = 0;
  for (const n of numbers) total += n; // ধাপ ১: যোগ
  return total / numbers.length;        // ধাপ ২: ভাগ
}
console.log(average([10, 20, 30])); // 20
```

**🔍 ব্রেকডাউন**
- প্রতিটা ধাপ পরিষ্কার ও নির্দিষ্ট → এটাই algorithm।
- একই সমস্যার একাধিক algorithm থাকতে পারে; কোনটা efficient সেটাই আসল প্রশ্ন।

> **🎬 Animation Spec: Recipe Steps**
> - **দৃশ্য:** কার্ডে ধাপগুলো ক্রমান্বয়ে; ইনপুট ডেটা ধাপে ধাপে রূপান্তরিত হচ্ছে।
> - **ইনপুট:** input array; "Next Step" বাটন।
> - **ধাপ:** প্রতিটা ধাপে ডেটার বর্তমান অবস্থা দেখা যাবে (total বাড়ছে, শেষে ভাগ)।
> - **লক্ষ্য:** algorithm = ধাপে ধাপে রূপান্তর।

**📝 অনুশীলন**
- "দুটো সংখ্যার মধ্যে বড়টা খোঁজা"-র algorithm ধাপে ধাপে লেখো।

---

## 2.3 — কেন DSA গুরুত্বপূর্ণ? (Why are Data Structures Important?)

**🎯 কী শিখব**
- সঠিক DSA বাছাই কতটা পার্থক্য গড়ে

**💡 ধারণা**
একই কাজ করা যায় ভালো বা খারাপ উপায়ে। DSA শেখায় **efficient** উপায় বাছতে। বাস্তব প্রভাব:

- ১০ লাখ ইউজারের অ্যাপে ভুল কাঠামো = অ্যাপ হ্যাং
- সঠিক কাঠামো = একই কাজ হাজার গুণ দ্রুত
- চাকরির interview-তে DSA প্রায় বাধ্যতামূলক

**একটা নাটকীয় উদাহরণ — খোঁজা:**
```js
// ১) Array-তে খোঁজা (একটা একটা করে) — ধীর
function findInArray(arr, target) {
  for (const x of arr) if (x === target) return true;
  return false;                       // worst case: পুরো array — O(n)
}

// ২) Set-এ খোঁজা — বিদ্যুৎগতি
const set = new Set([1, 2, 3, /* ...10 লাখ... */]);
console.log(set.has(999999));         // গড়ে O(1)
```

**🔍 ব্রেকডাউন**
- ১০ লাখ উপাদানে array খুঁজলে ১০ লাখ তুলনা লাগতে পারে।
- একই কাজ Set-এ প্রায় সাথে সাথে — শুধু **কাঠামো বদলে** এত পার্থক্য!

> **🎬 Animation Spec: Race — Array vs Set Search**
> - **দৃশ্য:** উপরে-নিচে দুটো ট্র্যাক; একই target দুই কাঠামোয় খোঁজা।
> - **ইনপুট:** ডেটার আকার (slider), target।
> - **ধাপ:** দুটো search একসাথে চলবে; step-counter দেখাবে কে কত ধাপে পৌঁছাল।
> - **লক্ষ্য:** সঠিক DSA বাছাই = বিশাল গতি পার্থক্য।

**📝 অনুশীলন**
- ভাবো: বইয়ের index কোন সমস্যা সমাধান করে (linear search বনাম দ্রুত খোঁজা)?

---

## 2.4 — কীভাবে DSA নিয়ে চিন্তা করব (Problem-Solving Mindset)

**🎯 কী শিখব**
- যেকোনো সমস্যা ভাঙার একটা কাঠামোগত পদ্ধতি

**💡 ধারণা**
DSA মুখস্থ করার জিনিস নয়, **চিন্তা করার জিনিস**। প্রতিটা সমস্যায় ৫ ধাপ অনুসরণ করো:

1. **বুঝো (Understand):** input কী, output কী, constraint কী?
2. **উদাহরণ (Examples):** ছোট ইনপুট নিয়ে হাতে সমাধান করো
3. **পরিকল্পনা (Plan):** pseudo code-এ ধাপ লেখো
4. **বাস্তবায়ন (Code):** JavaScript-এ রূপ দাও
5. **যাচাই (Test & Optimize):** edge case টেস্ট করো, দ্রুত করা যায় কিনা ভাবো

**💻 উদাহরণ প্রয়োগ — "array-তে duplicate আছে কিনা"**
```js
// ধাপ ৩-৪: পরিকল্পনা ও কোড
function hasDuplicate(arr) {
  const seen = new Set();          // যা দেখেছি জমা রাখি
  for (const x of arr) {
    if (seen.has(x)) return true;  // আগে দেখেছি → duplicate
    seen.add(x);
  }
  return false;                    // কোনো duplicate নেই
}

// ধাপ ৫: টেস্ট
console.log(hasDuplicate([1, 2, 3, 2])); // true
console.log(hasDuplicate([1, 2, 3]));    // false
```

**🔍 ব্রেকডাউন**
- naive উপায় হতো nested loop (O(n²))।
- Set ব্যবহারে হলো O(n) — সঠিক DSA বাছাইয়ের সুফল।
- edge case: খালি array, সব একই মান — টেস্ট করা জরুরি।

> **🎬 Animation Spec: 5-Step Solver Flow**
> - **দৃশ্য:** ৫টা ধাপের progress bar; বর্তমান ধাপ highlight।
> - **ইনপুট:** একটা sample problem নির্বাচন।
> - **ধাপ:** প্রতিটা ধাপে সংশ্লিষ্ট কাজ (understand → examples → plan → code → test) দেখানো হবে।
> - **লক্ষ্য:** সমস্যা সমাধানের কাঠামোগত অভ্যাস গড়া।

**📝 অনুশীলন**
- "একটা string palindrome কিনা" — ৫ ধাপে সমাধান করার চেষ্টা করো।

---

## ✅ Section সারাংশ

Data Structure = ডেটা সাজানোর উপায়; Algorithm = সমস্যা সমাধানের ধাপ; সঠিক DSA = বিশাল গতি পার্থক্য; সমাধান = ৫ ধাপে চিন্তা।

**পরবর্তী:** [03 — Algorithmic Complexity (Big-O)](03-algorithmic-complexity.md) →
