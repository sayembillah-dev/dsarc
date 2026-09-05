# ১০ — Searching Algorithms

কোনো ডেটা খুঁজে বের করা প্রায় প্রতিটা প্রোগ্রামে লাগে। এখানে দুটো মৌলিক search — Linear ও Binary — শিখব, আর Binary Search-এর শক্তিশালী প্রয়োগ দেখব।

> **Section Roadmap:** Linear Search → Binary Search → Binary Search variants → Binary Search on Answer (intro)

---

## 10.1 — Linear Search

**🎯 কী শিখব**
- একটা একটা করে খোঁজা

**💡 ধারণা**
শুরু থেকে শেষ পর্যন্ত প্রতিটা উপাদান পরীক্ষা করি যতক্ষণ না target পাই। **সবচেয়ে সরল**, কোনো পূর্বশর্ত নেই — array sorted না হলেও চলে।

**💻 কোড উদাহরণ**
```js
function linearSearch(arr, target) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) return i;  // পেলে index ফেরত
  }
  return -1;                           // না পেলে -1
}
console.log(linearSearch([4, 2, 7, 1, 9], 7)); // 2
console.log(linearSearch([4, 2, 7, 1, 9], 5)); // -1
```

**🔍 ব্রেকডাউন**
- প্রথম মিলেই থেমে index দেয়।
- worst case: target নেই বা শেষে → পুরো array।

**⏱️ Complexity** — worst/avg O(n); best O(1); space O(1)।

> **🎬 Animation Spec: Linear Scan**
> - **দৃশ্য:** box সারি; বাম থেকে ডানে কমলা pointer।
> - **ইনপুট:** array, target।
> - **ধাপ:** প্রতিটা box-এ থামে (হলুদ), মিললে সবুজ, না মিললে ধূসর করে পরেরটায়।
> - **লক্ষ্য:** কেন worst case O(n)।

**📝 অনুশীলন**
- target-এর সব index (একাধিক থাকলে) বের করার version লেখো।

---

## 10.2 — Binary Search

**🎯 কী শিখব**
- sorted ডেটায় অর্ধেক-অর্ধেক করে O(log n)-এ খোঁজা

**💡 ধারণা**
**পূর্বশর্ত: array sorted থাকতে হবে।** প্রতিবার মাঝের উপাদান দেখি:
- target == mid → পেলাম
- target < mid → বাঁ অর্ধেকে খুঁজি
- target > mid → ডান অর্ধেকে খুঁজি

প্রতি ধাপে অর্ধেক বাদ যায় → O(log n)। ১০ লাখ উপাদানে মাত্র ~২০ ধাপ!

**💻 কোড উদাহরণ (iterative)**
```js
function binarySearch(arr, target) {
  let low = 0, high = arr.length - 1;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2); // মাঝের index
    if (arr[mid] === target) return mid;       // পেলাম
    else if (arr[mid] < target) low = mid + 1; // ডান অর্ধেক
    else high = mid - 1;                        // বাঁ অর্ধেক
  }
  return -1;
}
const sorted = [1, 3, 5, 7, 9, 11, 13];
console.log(binarySearch(sorted, 9)); // 4
console.log(binarySearch(sorted, 4)); // -1
```

**🔍 ব্রেকডাউন**
- `low`/`high` খোঁজার পরিসর; `mid` মাঝ।
- মিলিয়ে দেখে অর্ধেক বাদ দিই — এটাই log n-এর রহস্য।
- `mid = Math.floor((low+high)/2)` — বড় সংখ্যায় overflow এড়াতে `low + (high-low)/2`-ও লেখা যায়।

**⏱️ Complexity** — O(log n); space O(1)।

> **🎬 Animation Spec: Halving Search**
> - **দৃশ্য:** sorted bar; low/high সীমা রঙিন; mid highlight।
> - **ইনপুট:** sorted array, target, speed।
> - **ধাপ:** প্রতি ধাপে mid দেখা, অর্ধেক অংশ ধূসর (বাদ); পরিসর ছোট হতে থাকবে।
> - **লক্ষ্য:** প্রতি ধাপে অর্ধেক বাদ → log n অনুভব।

**📝 অনুশীলন**
- binary search-এর recursive version লেখো।

---

## 10.3 — Binary Search Variants (Lower/Upper Bound)

**🎯 কী শিখব**
- target-এর প্রথম/শেষ অবস্থান, বা insert-পয়েন্ট খোঁজা

**💡 ধারণা**
অনেক সমস্যায় শুধু "আছে কিনা" নয়, বরং "কোথায় বসবে" বা "প্রথম যেখানে শর্ত পূরণ হয়" জানতে হয়। দুটো দরকারি রূপ:
- **lower bound:** ≥ target প্রথম index
- **upper bound:** > target প্রথম index

(duplicate থাকা array-তে গণনা/range খুঁজতে এগুলো লাগে।)

**💻 কোড উদাহরণ**
```js
// প্রথম index যেখানে arr[i] >= target
function lowerBound(arr, target) {
  let low = 0, high = arr.length; // high = length (exclusive)
  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    if (arr[mid] < target) low = mid + 1;
    else high = mid;              // mid প্রার্থী হতে পারে, তাই রাখি
  }
  return low;
}
const a = [1, 2, 2, 2, 3, 5];
console.log(lowerBound(a, 2)); // 1 (প্রথম 2)
console.log(lowerBound(a, 4)); // 5 (4 বসত এখানে)

// একটি sorted array-তে target কতবার আছে
function countOccurrences(arr, target) {
  return lowerBound(arr, target + 1) - lowerBound(arr, target);
}
console.log(countOccurrences(a, 2)); // 3
```

**🔍 ব্রেকডাউন**
- `high = length` ও `high = mid` (mid+1 নয়) — এই ছোট পার্থক্যই lower bound-কে সঠিক করে।
- upper − lower = কতবার আছে — একটা পরিষ্কার কৌশল।

**⏱️ Complexity** — O(log n)।

> **🎬 Animation Spec: Boundary Finder**
> - **দৃশ্য:** duplicate-সহ sorted bar; lower ও upper সীমা দুই রঙে চিহ্নিত হয়।
> - **ইনপুট:** array, target।
> - **ধাপ:** দুটো binary search চলে; দুই সীমার মাঝের অংশ = target-এর range।
> - **লক্ষ্য:** boundary-ভিত্তিক binary search বোঝা।

**📝 অনুশীলন**
- `upperBound` নিজে লেখো (`arr[mid] <= target` কন্ডিশনে ভাবো)।

---

## 10.4 — Binary Search on Answer (পরিচিতি)

**🎯 কী শিখব**
- শুধু array নয় — "উত্তরের পরিসরে" binary search

**💡 ধারণা**
Binary search শুধু array-তে না, যেকোনো **monotonic** (একমুখী) শর্তে চলে। যদি "উত্তর X হলে সম্ভব, X-এর বেশি হলেও সম্ভব" — এমন প্যাটার্ন থাকে, তাহলে উত্তরের পরিসরে binary search করে সর্বোত্তম উত্তর পাওয়া যায়। (advanced; section 16-এও ফিরব।)

**💻 কোড উদাহরণ (√n-এর floor বের করা)**
```js
// n-এর বর্গমূলের floor — binary search on answer
function sqrtFloor(n) {
  if (n < 2) return n;
  let low = 1, high = n, ans = 1;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (mid * mid <= n) { ans = mid; low = mid + 1; } // এখনো বাড়ানো যায়
    else high = mid - 1;                               // বেশি হয়ে গেছে
  }
  return ans;
}
console.log(sqrtFloor(17)); // 4  (4²=16 ≤ 17 < 25=5²)
```

**🔍 ব্রেকডাউন**
- "mid² ≤ n" শর্তটা monotonic — একটা সীমা পর্যন্ত true, তারপর false।
- সেই সীমাই আমরা binary search-এ খুঁজি → O(log n)।

**⏱️ Complexity** — O(log n)।

> **🎬 Animation Spec: Search the Answer Range**
> - **দৃশ্য:** সংখ্যারেখা (1..n); true অংশ সবুজ, false অংশ লাল; সীমারেখা খোঁজা।
> - **ইনপুট:** n।
> - **ধাপ:** mid পরীক্ষা করে অর্ধেক বাদ, true/false সীমা কাছে আসে।
> - **লক্ষ্য:** "monotonic শর্তে binary search" — শক্তিশালী প্যাটার্নের সূচনা।

**📝 অনুশীলন**
- একই ধারণায় একটা সংখ্যার cube root-এর floor বের করো।

---

## ✅ Section সারাংশ

Linear search O(n), sorted না হলেও চলে। Binary search O(log n), কিন্তু sorted দরকার — প্রতি ধাপে অর্ধেক বাদ। lower/upper bound দিয়ে range/count। "Binary search on answer" monotonic শর্তে সর্বোত্তম উত্তর দেয়।

**পরবর্তী:** [11 — Tree Data Structures](11-tree-data-structures.md) →
