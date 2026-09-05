# ০৩ — Algorithmic Complexity (Big-O)

কোনো algorithm "ভালো" না "খারাপ" তা মাপার উপায় হলো complexity analysis। এই section-টা DSA-র সবচেয়ে গুরুত্বপূর্ণ ভিত্তি — এখানে ভালো করে সময় দাও।

> **Section Roadmap:** Complexity কেন → Time vs Space → কীভাবে হিসাব → Asymptotic Notation (Big-O, θ, Ω) → Common Runtimes (Constant → Factorial)

---

## 3.1 — Complexity কেন লাগে?

**🎯 কী শিখব**
- কেন "কত সেকেন্ড লাগল" দিয়ে মাপা যায় না

**💡 ধারণা**
তোমার আর আমার কম্পিউটারের গতি আলাদা। তাই "৩ সেকেন্ড লাগল" — এই মাপ অর্থহীন। বদলে আমরা মাপি: **input বড় হলে কাজের পরিমাণ কত দ্রুত বাড়ে।**

এটাই **Big-O** — input `n`-এর সাথে algorithm-এর গতি কেমন বাড়ে তার একটা ভাষা।

**💻 কোড উদাহরণ**
```js
// n যত বড়, কাজ তত বেশি — কতটা বেশি সেটাই প্রশ্ন
function printAll(n) {
  for (let i = 0; i < n; i++) {  // n বার চলে → কাজ ∝ n
    console.log(i);
  }
}
// n=10 → 10 বার; n=1000 → 1000 বার → O(n)
```

**🔍 ব্রেকডাউন**
- Big-O হার্ডওয়্যার-নিরপেক্ষ — শুধু **বৃদ্ধির হার** মাপে।
- আমরা সবসময় **worst case** ধরি (সবচেয়ে খারাপ পরিস্থিতি)।

> **🎬 Animation Spec: Growth Race**
> - **দৃশ্য:** একটা গ্রাফ, x-অক্ষ = n, y-অক্ষ = operations; কয়েকটা curve (O(1), O(n), O(n²)...)।
> - **ইনপুট:** n বাড়ানোর slider।
> - **ধাপ:** n বাড়ালে curve গুলো ভিন্ন গতিতে উঠবে; O(n²) দ্রুত আকাশে উঠবে।
> - **লক্ষ্য:** বৃদ্ধির হারের পার্থক্য চোখে দেখা।

**📝 অনুশীলন**
- ভাবো: input দ্বিগুণ করলে কোন algorithm-এ কাজ দ্বিগুণ, কোনটায় চারগুণ হয়?

---

## 3.2 — Time Complexity vs Space Complexity

**🎯 কী শিখব**
- সময় বনাম মেমরি — দুই ধরনের খরচ

**💡 ধারণা**
- **Time Complexity** → কত ধাপ/অপারেশন লাগে (গতি)
- **Space Complexity** → কত অতিরিক্ত মেমরি লাগে (জায়গা)

অনেক সময় এদের মধ্যে **trade-off** থাকে: বেশি মেমরি খরচ করে গতি বাড়ানো যায় (যেমন cache/Set ব্যবহার)।

**💻 কোড উদাহরণ**
```js
// কম space, কিন্তু নেস্টেড loop → বেশি time (O(n²))
function hasDupSlow(arr) {
  for (let i = 0; i < arr.length; i++)
    for (let j = i + 1; j < arr.length; j++)
      if (arr[i] === arr[j]) return true;
  return false;              // Space: O(1), Time: O(n²)
}

// বেশি space (Set), কিন্তু কম time (O(n))
function hasDupFast(arr) {
  const seen = new Set();    // অতিরিক্ত মেমরি
  for (const x of arr) {
    if (seen.has(x)) return true;
    seen.add(x);
  }
  return false;              // Space: O(n), Time: O(n)
}
```

**🔍 ব্রেকডাউন**
- প্রথমটা মেমরি কম নেয় কিন্তু ধীর।
- দ্বিতীয়টা মেমরি বেশি নেয় কিন্তু দ্রুত — এটাই **time-space trade-off**।

> **🎬 Animation Spec: Time vs Space Balance**
> - **দৃশ্য:** একটা দাঁড়িপাল্লা; এক পাল্লায় "Time", অন্যটায় "Space"।
> - **ইনপুট:** algorithm variant নির্বাচন।
> - **ধাপ:** variant বদলালে পাল্লা হেলবে; পাশে দুই metric-এর মান দেখাবে।
> - **লক্ষ্য:** trade-off ধারণা।

**📝 অনুশীলন**
- উপরের দুই version-এ input বড় হলে কোনটা তাড়াতাড়ি চলবে, ভাবো।

---

## 3.3 — কীভাবে Complexity হিসাব করব

**🎯 কী শিখব**
- কোড দেখে Big-O বের করার নিয়ম

**💡 ধারণা — ৩টা সহজ নিয়ম:**

1. **ধ্রুবককে বাদ দাও:** O(2n) → O(n), O(500) → O(1)
2. **শুধু সবচেয়ে বড় term রাখো:** O(n² + n) → O(n²)
3. **Loop গোনো:**
   - একটা loop → O(n)
   - loop-এর ভেতর loop → O(n²)
   - প্রতিবার অর্ধেক হলে → O(log n)

**💻 কোড উদাহরণ**
```js
// উদাহরণ ১ — দুটো আলাদা loop → O(n + n) = O(n)
function example1(arr) {
  for (const x of arr) console.log(x);   // O(n)
  for (const x of arr) console.log(x*2); // O(n)
}                                        // মোট O(n)

// উদাহরণ ২ — নেস্টেড loop → O(n²)
function example2(arr) {
  for (const a of arr)
    for (const b of arr)
      console.log(a, b);
}

// উদাহরণ ৩ — প্রতিবার অর্ধেক → O(log n)
function example3(n) {
  while (n > 1) n = Math.floor(n / 2);
}
```

**🔍 ব্রেকডাউন**
- example1: দুটো O(n) যোগ = O(2n) → ধ্রুবক বাদ → **O(n)**।
- example2: প্রতিটা উপাদানের জন্য পুরো array → **O(n²)**।
- example3: n → n/2 → n/4 ... → **O(log n)**।

> **🎬 Animation Spec: Big-O Detector**
> - **দৃশ্য:** কোড ব্লক; loop গুলোর চারপাশে রঙিন বক্স, পাশে "এই loop = O(?)" লেবেল।
> - **ইনপুট:** কয়েকটা প্রস্তুত কোড snippet নির্বাচন।
> - **ধাপ:** প্রতিটা loop highlight হবে, নিচে term যোগ হবে, শেষে নিয়ম প্রয়োগ করে final Big-O দেখাবে।
> - **লক্ষ্য:** কোড → Big-O রূপান্তরের নিয়ম শেখা।

**📝 অনুশীলন**
- একটা তিন-স্তরের নেস্টেড loop-এর complexity কত?

---

## 3.4 — Asymptotic Notation: Big-O, Big-θ, Big-Ω

**🎯 কী শিখব**
- তিনটা notation-এর পার্থক্য

**💡 ধারণা**
এগুলো algorithm-এর গতির সীমা বর্ণনা করে:

| Notation | নাম | বোঝায় | সাধারণ ভাষায় |
|----------|-----|--------|----------------|
| **O (Big-O)** | Upper bound | worst case | "সর্বোচ্চ এত খারাপ হতে পারে" |
| **Ω (Omega)** | Lower bound | best case | "সর্বনিম্ন এত ভালো হতে পারে" |
| **θ (Theta)** | Tight bound | average/উভয় সমান | "মোটামুটি এতটাই" |

**উদাহরণ — Linear Search:**
- **best case (Ω):** target প্রথমেই পাওয়া গেল → Ω(1)
- **worst case (O):** target নেই/শেষে → O(n)
- **θ:** যখন best ও worst একই স্তরের, তখন θ ব্যবহার হয়

**💻 কোড উদাহরণ**
```js
function linearSearch(arr, target) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) return i; // ভাগ্য ভালো হলে প্রথমেই → Ω(1)
  }
  return -1;                          // না পেলে পুরোটা → O(n)
}
```

**🔍 ব্রেকডাউন**
- বাস্তবে আমরা প্রায় সবসময় **Big-O (worst case)** নিয়ে কথা বলি — কারণ নিরাপদ দিকটা জানা দরকার।
- θ ব্যবহার হয় যখন best ও worst একই (যেমন সবসময় পুরো array-তে loop)।

> **🎬 Animation Spec: Three Bounds**
> - **দৃশ্য:** একটা গ্রাফ; একটাই algorithm curve, তার উপরে O ও নিচে Ω-এর সীমারেখা; θ হলে দুই রেখা কাছাকাছি।
> - **ইনপুট:** best/average/worst scenario toggle।
> - **ধাপ:** scenario বদলালে pointer curve-এর ভিন্ন অংশে যাবে ও সংশ্লিষ্ট notation highlight।
> - **লক্ষ্য:** কোন notation কখন প্রযোজ্য।

**📝 অনুশীলন**
- Binary search-এর best ও worst case কী হবে ভাবো (পরে section 10-এ মিলিয়ে নেবে)।

---

## 3.5 — Common Runtimes (সব গুরুত্বপূর্ণ complexity)

এই subsection-টা roadmap-এর "Common Runtimes" — Constant থেকে Factorial পর্যন্ত। প্রতিটার একটা করে বাস্তব উদাহরণ দিচ্ছি।

**🎯 কী শিখব**
- সবচেয়ে দরকারি ৬টা runtime, ভালো থেকে খারাপ ক্রমে

**💡 ধারণা — ক্রম (ভালো → খারাপ):**
```
O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(2ⁿ) < O(n!)
```

**💻 প্রতিটার উদাহরণ**
```js
// O(1) — Constant: input যত বড়ই হোক, একই কাজ
function first(arr) { return arr[0]; }

// O(log n) — Logarithmic: প্রতিবার অর্ধেক (binary search-এর মতো)
function halve(n) { let c = 0; while (n > 1) { n = Math.floor(n/2); c++; } return c; }

// O(n) — Linear: একবার loop
function sum(arr) { let t = 0; for (const x of arr) t += x; return t; }

// O(n log n) — merge/quick sort-এর গতি (section 09)
// arr.sort() মোটামুটি এই complexity

// O(n²) — Quadratic: নেস্টেড loop
function allPairs(arr) {
  const pairs = [];
  for (const a of arr) for (const b of arr) pairs.push([a, b]);
  return pairs;
}

// O(2ⁿ) — Exponential: naive Fibonacci (section 08)
function fib(n) { return n < 2 ? n : fib(n-1) + fib(n-2); }

// O(n!) — Factorial: সব permutation বানানো
function permutations(arr) {
  if (arr.length <= 1) return [arr];
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
    for (const p of permutations(rest)) result.push([arr[i], ...p]);
  }
  return result;
}
```

**🔍 ব্রেকডাউন (কোনটা কেমন)**

| Runtime | নাম | কেমন | উদাহরণ |
|---------|-----|------|--------|
| O(1) | Constant | চমৎকার | array index, Map.get |
| O(log n) | Logarithmic | দারুণ | binary search, balanced tree |
| O(n) | Linear | ভালো | একবার loop |
| O(n log n) | Linearithmic | মোটামুটি ভালো | efficient sort |
| O(n²) | Quadratic/Polynomial | দুর্বল | নেস্টেড loop |
| O(2ⁿ) | Exponential | খারাপ | naive recursion, subset |
| O(n!) | Factorial | ভয়ংকর | সব permutation |

> 💡 **বাস্তব অনুভূতি:** n = 20 হলে O(n²) = 400 অপারেশন (তুচ্ছ), কিন্তু O(2ⁿ) ≈ ১০ লাখ, আর O(n!) ≈ ২৪ কোটি কোটি! তাই বড় input-এ exponential/factorial প্রায় অচল।

> **🎬 Animation Spec: Runtime Comparison Dashboard**
> - **দৃশ্য:** ৭টা curve একসাথে গ্রাফে; নিচে একটা টেবিলে প্রতিটা n-এর জন্য অপারেশন সংখ্যা।
> - **ইনপুট:** n-এর slider (1 → 50); কোন কোন curve দেখাবে তার checkbox।
> - **ধাপ:** n বাড়ালে প্রতিটা curve নিজ গতিতে উঠবে; exponential/factorial দ্রুত "ছাদ" ভেদ করবে (log-scale toggle)।
> - **লক্ষ্য:** runtime-গুলোর আপেক্ষিক ভয়াবহতা অনুভব করা।

**📝 অনুশীলন**
- প্রতিটা runtime-এর একটা করে বাস্তব উদাহরণ নিজে খুঁজে লেখো।

---

## ✅ Section সারাংশ

Complexity = বৃদ্ধির হার (হার্ডওয়্যার-নিরপেক্ষ)। Time vs Space trade-off আছে। নিয়ম: ধ্রুবক বাদ, বড় term রাখো, loop গোনো। Big-O (worst) সবচেয়ে ব্যবহৃত। runtime ক্রম: O(1) → O(n!)।

**পরবর্তী:** [04 — Arrays & Strings](04-arrays-and-strings.md) →
