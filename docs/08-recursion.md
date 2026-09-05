# ০৮: Recursion

Recursion (পুনরাবৃত্ত-নিজেকে-ডাকা) হলো এমন একটা ধারণা যা প্রথমে কঠিন লাগে, কিন্তু একবার বুঝলে Tree, Graph, Sorting, Dynamic Programming, সব সহজ হয়ে যায়। তাই এটা আগে শিখছি।

> **Section Roadmap:** ধারণা, Base Case, Call Stack, ক্লাসিক উদাহরণ, Recursion vs Iteration, Memoization (intro)

---

## 8.1: Recursion কী

**কী শিখব**
- একটা function নিজেকে ডাকা মানে কী

**ধারণা**
Recursion = একটা function নিজের ভেতরেই নিজেকে ডাকে, কিন্তু একটু **ছোট সমস্যা** নিয়ে, যতক্ষণ না সমস্যাটা এত ছোট হয় যে সরাসরি উত্তর জানা (**base case**)।

বাস্তব উপমা: দুই আয়নার মাঝে দাঁড়ালে ছোট থেকে ছোট প্রতিফলন; অথবা রুশ পুতুল (matryoshka), অর্থাৎ ভেতরে ভেতরে ছোট পুতুল।

**দুটো অংশ সবসময় লাগবে:**
1. **Base case:** কখন থামবে (নাহলে infinite)
2. **Recursive case:** ছোট সমস্যায় নিজেকে ডাকা

**কোড উদাহরণ (countdown)**
```js
function countdown(n) {
  if (n === 0) {              // base case: থামার শর্ত
    console.log("শেষ!");
    return;
  }
  console.log(n);
  countdown(n - 1);          // recursive case: ছোট সমস্যা
}

countdown(3); // 3, 2, 1, শেষ!
```

**ব্রেকডাউন**
- `if (n === 0) return` অর্থাৎ base case; না থাকলে অসীম বার ডাকবে (stack overflow)।
- `countdown(n - 1)` অর্থাৎ প্রতিবার সমস্যা এক ধাপ ছোট।
- প্রতিটা recursion-এ সমস্যা base case-এর দিকে এগোতেই হবে।

**Complexity:** এখানে O(n)।

> **Animation Spec: Nested Dolls**
> - **দৃশ্য:** n থেকে শুরু করে ভেতরে ভেতরে ছোট box (প্রতিটা call)।
> - **ইনপুট:** n।
> - **ধাপ:** প্রতিটা call ভেতরে নতুন box খোলে; base case-এ পৌঁছালে ভেতর থেকে বাইরে return হতে হতে box বন্ধ হয়।
> - **লক্ষ্য:** "নিচে নামা, base, ফিরে আসা" চক্র।

**অনুশীলন**
- 1 থেকে n পর্যন্ত recursion দিয়ে ছাপাও (উল্টো দিকে)।

---

## 8.2: Call Stack বোঝা

**কী শিখব**
- recursion মেমরিতে কীভাবে চলে

**ধারণা**
প্রতিবার function ডাকলে সেটা **call stack**-এ (একটা stack!) জমা হয়। base case-এ পৌঁছালে stack উপর থেকে একে একে খালি হয় (return)। এজন্য recursion আসলে stack-এর উপর দাঁড়িয়ে।

**কোড উদাহরণ (factorial দিয়ে stack বোঝা)**
```js
function factorial(n) {
  if (n <= 1) return 1;          // base case
  return n * factorial(n - 1);   // n কে ছোট factorial দিয়ে গুণ
}

console.log(factorial(4)); // 24
/*
factorial(4) = 4 * factorial(3)
             = 4 * (3 * factorial(2))
             = 4 * (3 * (2 * factorial(1)))
             = 4 * (3 * (2 * 1)) = 24
প্রথমে নিচে নামে (call), base-এ পৌঁছে উপরে ফেরে (return)।
*/
```

**ব্রেকডাউন**
- প্রতিটা call `n` মনে রেখে অপেক্ষায় থাকে যতক্ষণ ভেতরের call শেষ না হয়।
- base case থেকে 1 return, পিছাতে পিছাতে গুণ হয়।
- খুব বেশি গভীর recursion মানে **stack overflow** (মেমরি শেষ)।

**Complexity:** time O(n), space O(n) (stack গভীরতা)।

> **Animation Spec: Call Stack Visualizer**
> - **দৃশ্য:** ডান পাশে উল্লম্ব stack; প্রতিটা call একটা frame হিসেবে উপরে জমে।
> - **ইনপুট:** n।
> - **ধাপ:** call হলে frame push (নিচে নামা); base-এ পৌঁছালে frame গুলো একে একে pop হয়ে return-মান উপরে যায়।
> - **লক্ষ্য:** recursion = call stack, এই যোগসূত্র স্পষ্ট করা।

**অনুশীলন**
- `factorial(5)`-এর সম্পূর্ণ stack ধাপ হাতে লেখো।

---

## 8.3: ক্লাসিক Recursion উদাহরণ

**কী শিখব**
- sum, reverse, fibonacci, প্রচলিত recursion

**ধারণা**
"বড় সমস্যা = ছোট সমস্যা + একটু কাজ", এই দৃষ্টিভঙ্গিতে অনেক সমস্যা লেখা যায়।

**কোড উদাহরণ**
```js
// ১) array যোগফল
function sum(arr, i = 0) {
  if (i === arr.length) return 0;      // base
  return arr[i] + sum(arr, i + 1);     // প্রথমটা + বাকির যোগফল
}
console.log(sum([1, 2, 3, 4])); // 10

// ২) string উল্টানো
function reverse(str) {
  if (str.length <= 1) return str;                 // base
  return reverse(str.slice(1)) + str[0];           // বাকিটা উল্টে + প্রথম অক্ষর
}
console.log(reverse("hello")); // "olleh"

// ৩) Fibonacci (naive, শিক্ষার জন্য)
function fib(n) {
  if (n < 2) return n;                 // base: fib(0)=0, fib(1)=1
  return fib(n - 1) + fib(n - 2);      // আগের দুই সংখ্যার যোগ
}
console.log(fib(7)); // 13
```

**ব্রেকডাউন**
- প্রতিটাতে: base case + "ছোট সমস্যায় নিজেকে ডাকা"।
- `fib` naive version **O(2ⁿ)**, একই মান বারবার হিসাব হয় (নিচে ঠিক করব)।

**Complexity:** sum/reverse O(n); naive fib O(2ⁿ)।

> **Animation Spec: Recursion Tree (Fibonacci)**
> - **দৃশ্য:** fib(n) থেকে দুই শাখা fib(n-1), fib(n-2), গাছের মতো ছড়িয়ে পড়ে।
> - **ইনপুট:** n।
> - **ধাপ:** গাছ বাড়তে থাকবে; একই মান (যেমন fib(2)) বহুবার এলে সেগুলো একই রঙে highlight, অপচয় দেখানো।
> - **লক্ষ্য:** কেন naive fib এত ধীর তা চোখে দেখা।

**অনুশীলন**
- recursion দিয়ে একটা সংখ্যার সব অঙ্কের যোগফল বের করো।

---

## 8.4: Recursion vs Iteration

**কী শিখব**
- কখন recursion, কখন loop

**ধারণা**
যা recursion-এ করা যায়, তা প্রায়ই loop-এও করা যায়। পার্থক্য:

| দিক | Recursion | Iteration (loop) |
|-----|-----------|------------------|
| পাঠযোগ্যতা | Tree/Graph-এ সুন্দর | সরল সমস্যায় সহজ |
| Memory | call stack (O(depth)) | সাধারণত O(1) |
| ঝুঁকি | stack overflow | নেই |

**নিয়ম:** সমস্যাটা স্বাভাবিকভাবে "ছোট একই সমস্যায়" ভাঙে (tree, divide-and-conquer) তাহলে recursion; সরল রৈখিক হলে loop।

**কোড উদাহরণ (একই factorial, দুইভাবে)**
```js
// recursion
function factRec(n) { return n <= 1 ? 1 : n * factRec(n - 1); }

// iteration
function factIter(n) {
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;                       // Space O(1), stack নেই
}
console.log(factRec(5), factIter(5)); // 120 120
```

**ব্রেকডাউন**
- দুটোই সঠিক; iteration-এ extra stack memory লাগে না।
- Tree/Graph traversal recursion-এ অনেক পরিষ্কার, তাই সেখানে recursion পছন্দ।

> **Animation Spec: Two Paths**
> - **দৃশ্য:** বাঁয়ে recursion (stack বাড়ছে), ডানে loop (একটাই accumulator)।
> - **ইনপুট:** n।
> - **ধাপ:** দুই পদ্ধতি পাশাপাশি চলবে; memory ব্যবহারের পার্থক্য দেখা যাবে।
> - **লক্ষ্য:** trade-off বোঝা।

**অনুশীলন**
- section 8.3-এর `sum`-কে loop দিয়ে লেখো।

---

## 8.5: Memoization (Recursion দ্রুত করা)

**কী শিখব**
- আগে হিসাব করা ফলাফল জমিয়ে রাখা (DP-র বীজ)

**ধারণা**
Naive fib বারবার একই মান হিসাব করে (অপচয়)। **Memoization** = হিসাব করা ফলাফল একটা cache-এ (Map) রেখে দেওয়া; পরে দরকার হলে হিসাব না করে সরাসরি ফেরত। এটাই Dynamic Programming-এর ভিত্তি (section 16)।

**কোড উদাহরণ**
```js
function fibMemo(n, cache = new Map()) {
  if (n < 2) return n;
  if (cache.has(n)) return cache.get(n);   // আগে হিসাব করা? সরাসরি দাও
  const result = fibMemo(n - 1, cache) + fibMemo(n - 2, cache);
  cache.set(n, result);                    // পরের জন্য জমা রাখি
  return result;
}

console.log(fibMemo(40)); // 102334155, সাথে সাথে (naive হলে বহু সেকেন্ড)
```

**ব্রেকডাউন**
- `cache.has(n)` মানে আগে হিসাব করা থাকলে তৎক্ষণাৎ return।
- প্রতিটা `n` একবারই হিসাব হয়, অর্থাৎ **O(2ⁿ) থেকে O(n)**-এ নেমে আসে!
- এই কৌশলই "top-down DP"।

**Complexity:** O(n) time, O(n) space।

> **Animation Spec: Cached Recursion Tree**
> - **দৃশ্য:** fib recursion tree; প্রথমবার হিসাব হলে node সবুজ ও cache-এ যোগ; পুনরায় লাগলে cache থেকে সরাসরি (গাছ আর বাড়ে না)।
> - **ইনপুট:** n; memoization on/off toggle।
> - **ধাপ:** off হলে বিশাল গাছ; on হলে ছোট গাছ + cache hits।
> - **লক্ষ্য:** memoization কীভাবে পুনরাবৃত্ত কাজ কাটে।

**অনুশীলন**
- memoization দিয়ে "n-ধাপ সিঁড়ি কতভাবে ওঠা যায়" সমস্যা ভাবো (fib-এর মতোই)।

---

## Section সারাংশ

Recursion = base case + ছোট সমস্যায় নিজেকে ডাকা; call stack-এর উপর চলে। ক্লাসিক: factorial, sum, reverse, fibonacci। Iteration কম memory নেয়; recursion tree/graph-এ পরিষ্কার। Memoization দিয়ে O(2ⁿ) থেকে O(n), DP-র সূচনা।

**পরবর্তী:** [09: Sorting Algorithms](09-sorting-algorithms.md)
