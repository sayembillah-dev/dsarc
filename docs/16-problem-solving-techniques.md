# ১৬: Problem Solving Techniques (Patterns)

DSA-র আসল খেলা শুরু এখানে। কাঠামো শেখা হয়ে গেছে; এবার শিখব **প্যাটার্ন** - যেসব বারবার ঘুরেফিরে আসে interview ও বাস্তব সমস্যায়। এই প্যাটার্নগুলো চিনতে পারলে নতুন সমস্যাও দ্রুত সমাধান হয়।

> **Section Roadmap:** Brute Force, Divide & Conquer, Greedy, Backtracking, Dynamic Programming, Two Pointer, Fast & Slow Pointer, Sliding Window, Merge Intervals, Cyclic Sort, Kth Element, Two Heaps, Island (Grid) Traversal, Randomised, Multi-threaded

> **নোট:** Recursion (ভিত্তি) বিস্তারিত [section 08](08-recursion.md)-এ; এখানে ধরে নিচ্ছি তা জানা।

---

## 16.1: Brute Force

**কী শিখব**
- সব সম্ভাবনা পরীক্ষা - সরল কিন্তু ধীর বেসলাইন

**ধারণা**
Brute force = কোনো চালাকি ছাড়া সব সম্ভাব্য উত্তর একে একে পরীক্ষা করা। প্রায়ই ধীর (O(n²), O(2ⁿ)), কিন্তু (১) সবসময় সঠিক উত্তর দেয়, (২) সমস্যা বোঝার প্রথম ধাপ, (৩) optimize করার বেসলাইন।

**নিয়ম:** আগে brute force ভাবো, তারপর optimize করো।

**কোড উদাহরণ (Two Sum - brute force)**
```js
function twoSumBrute(nums, target) {
  for (let i = 0; i < nums.length; i++)
    for (let j = i + 1; j < nums.length; j++)
      if (nums[i] + nums[j] === target) return [i, j];
  return [];                          // সব জোড়া পরীক্ষা -> O(n²)
}
console.log(twoSumBrute([2, 7, 11, 15], 9)); // [0,1]
// তুলনা: hash version (section 07) একই কাজ O(n)-এ করে
```

**কোড ব্রেকডাউন**
- সব জোড়া (i, j) পরীক্ষা -> O(n²)।
- section 07-এ দেখেছি hash দিয়ে এটা O(n) হয় - brute force থেকে optimize-এর ক্লাসিক উদাহরণ।

**Complexity** - সমস্যাভেদে O(n²)-O(2ⁿ)।

> **Animation Spec: Exhaustive Pairs**
> - **দৃশ্য:** array; দুটো pointer (i, j) সব জোড়া ঘোরে; পরীক্ষিত জোড়া গোনা।
> - **ইনপুট:** array, target।
> - **ধাপ:** প্রতিটা জোড়া হলুদ; মিললে সবুজ; counter মোট চেষ্টা দেখায়।
> - **নিয়ন্ত্রণ:** speed, step, reset।
> - **লক্ষ্য:** O(n²)-এর "সব জোড়া" অনুভূতি ও optimize-এর প্রেরণা।

**অনুশীলন**
- একটা array-তে সবচেয়ে বড় জোড়ার গুণফল brute force-এ বের করো।

---

## 16.2: Divide & Conquer

**কী শিখব**
- সমস্যা ভাগ, সমাধান, জোড়া - তিন ধাপের কাঠামো

**ধারণা**
তিন ধাপ: (১) **Divide** - সমস্যাকে ছোট উপ-সমস্যায় ভাগ, (২) **Conquer** - উপ-সমস্যা recursively সমাধান, (৩) **Combine** - ফলাফল জোড়া। Merge Sort ([section 09](09-sorting-algorithms.md)), Binary Search ([section 10](10-searching-algorithms.md)) এর উদাহরণ।

**কোড উদাহরণ (Divide & Conquer দিয়ে array-এর max)**
```js
function maxDC(arr, low = 0, high = arr.length - 1) {
  if (low === high) return arr[low];              // base: একটা উপাদান
  const mid = Math.floor((low + high) / 2);
  const leftMax = maxDC(arr, low, mid);           // বাঁ ভাগের max
  const rightMax = maxDC(arr, mid + 1, high);     // ডান ভাগের max
  return Math.max(leftMax, rightMax);             // combine
}
console.log(maxDC([3, 7, 2, 9, 4])); // 9
```

**কোড ব্রেকডাউন**
- মাঝ থেকে দুই ভাগ, প্রতি ভাগে recursion, শেষে দুই ফল থেকে সেরা।
- অনেক D&C algorithm-এর complexity **Master Theorem** দিয়ে বের হয় (যেমন merge sort O(n log n))।

**Complexity** - সমস্যাভেদে; এখানে O(n)।

> **Animation Spec: Divide Tree**
> - **দৃশ্য:** array উপরে; নিচে নামতে নামতে ভাগ, তারপর নিচ থেকে উপরে combine।
> - **ইনপুট:** array।
> - **ধাপ:** divide পর্বে টুকরো আলাদা; combine পর্বে জোড়ার ফল উপরে ওঠে।
> - **নিয়ন্ত্রণ:** speed, step, reset।
> - **লক্ষ্য:** divide-conquer-combine চক্র।

**অনুশীলন**
- D&C দিয়ে array-এর যোগফল বের করো।

---

## 16.3: Greedy Algorithms

**কী শিখব**
- প্রতিটা ধাপে "এই মুহূর্তে সেরা" বেছে নেওয়া

**ধারণা**
Greedy প্রতিটা ধাপে সাময়িকভাবে সবচেয়ে ভালো (locally optimal) সিদ্ধান্ত নেয়, এই আশায় যে তা global-ভাবেও সেরা হবে। **সব সমস্যায় কাজ করে না** - শুধু "greedy choice property" থাকলে। কাজ করলে খুব সরল ও দ্রুত (Kruskal, Prim, Dijkstra সবই greedy, দেখো [section 13](13-graph-data-structures.md))।

**কোড উদাহরণ (Coin change - greedy, নির্দিষ্ট মুদ্রায়)**
```js
// বাংলাদেশি নোট: কম সংখ্যক নোটে amount ভাঙা
function minNotes(amount) {
  const notes = [1000, 500, 100, 50, 20, 10, 5, 2, 1]; // বড় থেকে ছোট
  const used = [];
  for (const note of notes) {
    while (amount >= note) { used.push(note); amount -= note; } // যত বড় নোট সম্ভব
  }
  return used;
}
console.log(minNotes(1270)); // [1000, 100, 100, 50, 20]
```

**কোড ব্রেকডাউন**
- প্রতিবার সবচেয়ে বড় সম্ভব নোট নেওয়া -> কম নোট।
- **সতর্কতা:** এই greedy শুধু "canonical" মুদ্রা-সিস্টেমে সঠিক; অদ্ভুত মুদ্রায় (যেমন [1,3,4], amount 6) greedy ভুল করে - তখন DP লাগে (16.5)।

**Complexity** - এখানে O(amount/note); সাধারণত sort-এর জন্য O(n log n)।

> **Animation Spec: Greedy Picker**
> - **দৃশ্য:** নোটের সারি; amount কমতে থাকে যত বড় নোট বাছা হয়।
> - **ইনপুট:** amount; মুদ্রা-সেট।
> - **ধাপ:** প্রতি ধাপে সেরা নোট highlight ও amount থেকে বিয়োগ; "greedy fails" case-ও দেখানো যায়।
> - **নিয়ন্ত্রণ:** speed, step, reset; canonical বনাম tricky মুদ্রা-সেট toggle।
> - **লক্ষ্য:** greedy কখন কাজ করে, কখন নয়।

**অনুশীলন**
- [1,3,4] মুদ্রায় amount=6-এ greedy vs optimal - পার্থক্য দেখাও।

---

## 16.4: Backtracking

**কী শিখব**
- সম্ভাবনা "চেষ্টা করো, না হলে ফিরে এসো"

**ধারণা**
Backtracking = সম্ভাব্য সমাধান ধাপে ধাপে বানানো; কোনো ধাপ ভুল বুঝলে **ফিরে গিয়ে (backtrack)** অন্য পথ চেষ্টা। brute force-এর "চালাক" রূপ - অসম্ভব শাখা আগেই ছেঁটে ফেলে (pruning)। permutations, N-Queens, Sudoku, subset - সব এতে।

**কোড উদাহরণ (সব permutation)**
```js
function permutations(arr) {
  const result = [];
  function backtrack(current, remaining) {
    if (remaining.length === 0) { result.push([...current]); return; } // পূর্ণ সমাধান
    for (let i = 0; i < remaining.length; i++) {
      current.push(remaining[i]);                                  // চেষ্টা করি
      const rest = [...remaining.slice(0, i), ...remaining.slice(i + 1)];
      backtrack(current, rest);                                   // গভীরে
      current.pop();                                              // backtrack (ফিরি)
    }
  }
  backtrack([], arr);
  return result;
}
console.log(permutations([1, 2, 3]));
// [[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]
```

**কোড ব্রেকডাউন**
- `push` = সিদ্ধান্ত নিই; recursion = গভীরে যাই; `pop` = সিদ্ধান্ত বাতিল করে ফিরি।
- এই "choose - explore - un-choose" ছন্দটাই backtracking-এর হৃদয়।

**Complexity** - সমস্যাভেদে (permutation O(n * n!)); pruning অনেক কমায়।

> **Animation Spec: Decision Tree Walk**
> - **দৃশ্য:** সিদ্ধান্ত-গাছ; একটা পথ ধরে নামা, ডেড-এন্ডে লাল হয়ে backtrack।
> - **ইনপুট:** সমস্যা (permutation / N-Queens preset)।
> - **ধাপ:** choose (নিচে), explore, un-choose (উপরে) - ছন্দ দৃশ্যমান; pruning-এ শাখা কাটা।
> - **নিয়ন্ত্রণ:** speed, step, reset; preset বদলানো।
> - **লক্ষ্য:** backtracking = গাছ-অন্বেষণ + pruning।

**অনুশীলন**
- একটা set-এর সব subset backtracking-এ বের করো।

---

## 16.5: Dynamic Programming (DP)

**কী শিখব**
- পুনরাবৃত্ত উপ-সমস্যার ফল জমিয়ে রেখে optimize

**ধারণা**
DP তখন কাজে লাগে যখন সমস্যায় (১) **overlapping subproblems** (একই ছোট সমস্যা বারবার) ও (২) **optimal substructure** (ছোট সমাধান দিয়ে বড় সমাধান) - দুটোই থাকে। কৌশল দুই ধরনের:

- **Top-down (Memoization):** recursion + cache ([section 08](08-recursion.md))
- **Bottom-up (Tabulation):** ছোট থেকে বড় টেবিল পূরণ

**কোড উদাহরণ (Coin change - কম মুদ্রায়, DP; greedy যেখানে ফেল)**
```js
// যেকোনো মুদ্রা-সেটে amount বানাতে সর্বনিম্ন কয়টি মুদ্রা
function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;                                  // 0 বানাতে 0 মুদ্রা
  for (let a = 1; a <= amount; a++) {
    for (const coin of coins) {
      if (coin <= a) dp[a] = Math.min(dp[a], dp[a - coin] + 1); // এই মুদ্রা নিলে?
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}
console.log(coinChange([1, 3, 4], 6)); // 2  (3+3), greedy দিত 3 (4+1+1)!
```

**কোড ব্রেকডাউন**
- `dp[a]` = amount `a` বানানোর সর্বনিম্ন মুদ্রা।
- প্রতিটা amount-এর জন্য সব মুদ্রা চেষ্টা করে সেরা নেওয়া; ছোট থেকে বড়।
- greedy যেখানে ভুল করে, DP সব সম্ভাবনা মিলিয়ে সঠিক দেয়।

**Complexity** - এখানে O(amount * coins)।

> **Animation Spec: DP Table Fill**
> - **দৃশ্য:** dp array (0..amount); প্রতিটা ঘর পূরণে কোন আগের ঘর ব্যবহার হচ্ছে তীর দিয়ে।
> - **ইনপুট:** coins, amount।
> - **ধাপ:** বাঁ থেকে ডানে ঘর পূরণ; প্রতিটা ঘরে সেরা পছন্দ highlight।
> - **নিয়ন্ত্রণ:** speed, step, reset।
> - **লক্ষ্য:** "ছোট সমাধান জমিয়ে বড় সমাধান" বোঝা।

**অনুশীলন**
- fibonacci-কে bottom-up DP-তে (টেবিল দিয়ে) লেখো।

---

## 16.6: Two Pointer Technique

**কী শিখব**
- দুটো pointer দিয়ে O(n²) কাজ O(n)-এ নামানো

**ধারণা**
sorted array বা string-এ দুটো pointer (সাধারণত দুই প্রান্ত থেকে, বা একই দিকে) একসাথে সরিয়ে অনেক nested-loop সমস্যা এক pass-এ সমাধান। "জোড়া খোঁজা", palindrome, sorted-এ pair-sum - সব এতে।

**কোড উদাহরণ (sorted-এ pair sum)**
```js
// sorted array-তে target যোগফলের জোড়া - O(n)
function pairSum(sorted, target) {
  let left = 0, right = sorted.length - 1;
  while (left < right) {
    const sum = sorted[left] + sorted[right];
    if (sum === target) return [left, right];
    else if (sum < target) left++;    // ছোট -> বাঁ pointer ডানে (বড় মান দরকার)
    else right--;                     // বড় -> ডান pointer বাঁয়ে (ছোট মান দরকার)
  }
  return [];
}
console.log(pairSum([1, 3, 4, 6, 8, 11], 10)); // [2, 3]  (4+6=10)
```

**কোড ব্রেকডাউন**
- sorted বলে: sum ছোট হলে বড় মান দরকার -> left++; বড় হলে right--।
- প্রতিটা pointer সর্বোচ্চ একবার পুরো array পার হয় -> O(n)।

**Complexity** - O(n) (sorted হলে); নাহলে sort O(n log n)।

> **Animation Spec: Converging Pointers**
> - **দৃশ্য:** sorted bar; left ও right pointer দুই প্রান্তে, কাছে আসে।
> - **ইনপুট:** array, target।
> - **ধাপ:** প্রতিবার sum হিসাব; কোন pointer সরবে তার সিদ্ধান্ত highlight।
> - **নিয়ন্ত্রণ:** speed, step, reset।
> - **লক্ষ্য:** কেন sorted-এ two pointer O(n)।

**অনুশীলন**
- two pointer দিয়ে array in-place reverse করো।

---

## 16.7: Fast & Slow Pointers (Floyd's)

**কী শিখব**
- linked list/cycle-এ দুই গতির pointer

**ধারণা**
দুটো pointer - একটা এক ধাপে (slow), একটা দুই ধাপে (fast)। cycle থাকলে fast একসময় slow-কে ধরে ফেলে (দুজন একই node-এ মেলে)। linked list-এ cycle detection, মাঝের node খোঁজা, ইত্যাদিতে ক্লাসিক।

**কোড উদাহরণ (linked list-এ cycle আছে কিনা)**
```js
function hasCycle(head) {
  let slow = head, fast = head;
  while (fast && fast.next) {
    slow = slow.next;               // ১ ধাপ
    fast = fast.next.next;          // ২ ধাপ
    if (slow === fast) return true; // মিলে গেছে -> cycle
  }
  return false;                     // fast শেষে পৌঁছেছে -> cycle নেই
}
// মাঝের node খোঁজা: fast শেষে গেলে slow ঠিক মাঝে থাকে
function middleNode(head) {
  let slow = head, fast = head;
  while (fast && fast.next) { slow = slow.next; fast = fast.next.next; }
  return slow;
}
// ডেমো: 1 -> 2 -> 3 -> 4
const n1 = { val: 1 }, n2 = { val: 2 }, n3 = { val: 3 }, n4 = { val: 4 };
n1.next = n2; n2.next = n3; n3.next = n4; n4.next = null;
console.log(middleNode(n1).val); // 3
console.log(hasCycle(n1));       // false
n4.next = n2;                    // cycle বানালাম (4 আবার 2-তে)
console.log(hasCycle(n1));       // true
```

**কোড ব্রেকডাউন**
- cycle থাকলে fast "ল্যাপ" দিয়ে slow-কে ধরে (দৌড়ের ট্র্যাকের মতো)।
- fast দ্বিগুণ গতিতে যায় বলে সে শেষে পৌঁছালে slow অর্ধেক পথে = মাঝ।

**Complexity** - O(n) time, O(1) space।

> **Animation Spec: Tortoise & Hare**
> - **দৃশ্য:** linked list (cycle সহ/ছাড়া); দুটো pointer ভিন্ন গতিতে।
> - **ইনপুট:** cycle on/off।
> - **ধাপ:** slow ১, fast ২ ধাপ; cycle থাকলে মিলন highlight।
> - **নিয়ন্ত্রণ:** speed, step, reset।
> - **লক্ষ্য:** দুই গতির pointer-এর কৌশল।

**অনুশীলন**
- cycle-এর শুরুর node কীভাবে বের করা যায় ভাবো (Floyd-এর ২য় পর্ব)।

---

## 16.8: Sliding Window

**কী শিখব**
- ধারাবাহিক subarray/substring-এ চলমান জানালা

**ধারণা**
একটা "জানালা" (window) array-এর উপর দিয়ে সরে; প্রতিবার পুরো window আবার হিসাব না করে শুধু **যোগ-বিয়োগ** করে আপডেট -> O(n)। "k-আকারের সর্বোচ্চ যোগফল", "সবচেয়ে বড় distinct substring" জাতীয় সমস্যায়।

**কোড উদাহরণ (k-আকারের window-এর সর্বোচ্চ যোগফল)**
```js
function maxSumWindow(arr, k) {
  let windowSum = 0;
  for (let i = 0; i < k; i++) windowSum += arr[i];  // প্রথম window
  let maxSum = windowSum;
  for (let i = k; i < arr.length; i++) {
    windowSum += arr[i] - arr[i - k];               // নতুন ঢুকল, পুরনো বেরোল
    maxSum = Math.max(maxSum, windowSum);
  }
  return maxSum;
}
console.log(maxSumWindow([2, 1, 5, 1, 3, 2], 3)); // 9  (5+1+3)
```

**কোড ব্রেকডাউন**
- প্রতিবার window সরানোয় নতুন উপাদান যোগ, বেরিয়ে-যাওয়া উপাদান বিয়োগ -> O(1) আপডেট।
- naive হতো প্রতিটা window O(k) -> মোট O(n * k); sliding window -> O(n)।
- **variable-size window** (শর্তভিত্তিক) সমস্যায় right বাড়াও, শর্ত ভাঙলে left বাড়াও।

**Complexity** - O(n)।

> **Animation Spec: Sliding Window**
> - **দৃশ্য:** array; একটা রঙিন window k-ঘর জুড়ে, ডানে সরে; running sum দেখানো।
> - **ইনপুট:** array, k (বা শর্ত)।
> - **ধাপ:** window সরানোয় বাঁ উপাদান বিয়োগ (লাল), ডান উপাদান যোগ (সবুজ); max ট্র্যাক।
> - **নিয়ন্ত্রণ:** speed, step, reset; k স্লাইডার।
> - **লক্ষ্য:** "পুরো নয়, শুধু পরিবর্তন হিসাব" - O(n)-এর চাবি।

**অনুশীলন**
- variable-size window দিয়ে "সর্বনিম্ন subarray যার যোগফল ≥ target" ভাবো।

---

## 16.9: Merge Intervals

**কী শিখব**
- sort + sweep দিয়ে overlapping রেঞ্জ একত্র করা

**ধারণা**
বেশ কিছু interval (যেমন মিটিংয়ের সময়সীমা) দেওয়া আছে; যেগুলো overlap করে সেগুলো জোড়া লাগিয়ে একটা করে বড় interval বানাতে হয়। চাবি: **শুরু অনুযায়ী sort** - তারপর বাঁ থেকে ডানে এক pass-এ শুধু শেষ merged interval-এর সাথে তুলনা করলেই চলে। মিটিং রুম, ক্যালেন্ডার merge, রেঞ্জ-কভারেজ সমস্যায় সরাসরি লাগে।

**কোড উদাহরণ (overlap জোড়া লাগানো)**
```js
function mergeIntervals(intervals) {
  const sorted = [...intervals].sort((a, b) => a[0] - b[0]); // শুরু অনুযায়ী sort
  const merged = [sorted[0]];
  for (let i = 1; i < sorted.length; i++) {
    const last = merged[merged.length - 1];
    const [start, end] = sorted[i];
    if (start <= last[1]) last[1] = Math.max(last[1], end); // overlap -> জোড়া
    else merged.push([start, end]);                          // আলাদা interval
  }
  return merged;
}
console.log(mergeIntervals([[1, 3], [8, 10], [2, 6], [15, 18]]));
// [[1,6],[8,10],[15,18]]
```

**কোড ব্রেকডাউন**
- sort-এর পর কোনো interval-এর শুরু আগেরটার শেষের আগে হলেই overlap নিশ্চিত।
- merge করার সময় শেষ হিসেবে দুটোর বড়টা রাখি (একটা আরেকটাকে পুরো ঢাকতে পারে)।
- sort না করলে প্রতি জোড়াকে সবার সাথে মেলাতে হতো -> O(n²); sort করলেই sweep O(n)।

**Complexity** - sort O(n log n) + sweep O(n) = O(n log n)।

> **Animation Spec: Interval Merger**
> - **দৃশ্য:** সংখ্যারেখায় রঙিন interval বার; sort-এর পর sweep cursor বাঁ থেকে ডানে।
> - **ইনপুট:** interval সেট (preset / কাস্টম যোগ করা)।
> - **ধাপ:** sort হওয়া, cursor এগোনো, overlap-এ দুটো বার মিলে লম্বা বার (সবুজ)।
> - **নিয়ন্ত্রণ:** speed, step, reset; interval যোগ/বাদ।
> - **লক্ষ্য:** sort করলেই জটিল সমস্যা এক pass-এ নেমে আসে।

**অনুশীলন**
- একটা নতুন interval insert করার পর merge করো (insert interval সমস্যা)।

---

## 16.10: Cyclic Sort

**কী শিখব**
- 1..n রেঞ্জের সংখ্যা নিজের ঘরে বসিয়ে sort করা

**ধারণা**
array-এ ঠিক 1..n (বা 0..n-1) রেঞ্জের সংখ্যা থাকলে একটা সরল কৌশল: প্রতিটা সংখ্যাকে তার **নিজের index-এ** (value - 1) swap করে পাঠাও। কোনো তুলনা ছাড়াই, in-place, O(n)-এ সাজানো হয়। শেষে যে ঘরে মিল নেই সেটাই missing; যেটা দুইবার চায় সেটাই duplicate - এই ধরনের সমস্যায় সেরা বন্ধু।

**কোড উদাহরণ (সাজানো + missing খোঁজা)**
```js
function cyclicSort(nums) {
  let i = 0;
  const n = nums.length;
  while (i < n) {
    const correct = nums[i] - 1;             // এই সংখ্যার সঠিক ঘর
    if (nums[i] >= 1 && nums[i] <= n && nums[i] !== nums[correct]) {
      [nums[i], nums[correct]] = [nums[correct], nums[i]]; // ঘরে পাঠাই
    } else {
      i++;                                    // ঠিক আছে (বা রেঞ্জের বাইরে), পরের ঘরে
    }
  }
  return nums;
}
console.log(cyclicSort([3, 1, 5, 4, 2])); // [1,2,3,4,5]

// প্রয়োগ: missing সংখ্যা - sort-এর পর যে ঘরে মিল নেই
function findMissing(nums) {
  cyclicSort(nums);
  for (let i = 0; i < nums.length; i++) if (nums[i] !== i + 1) return i + 1;
  return nums.length + 1;
}
console.log(findMissing([4, 1, 2])); // 3
```

**কোড ব্রেকডাউন**
- প্রতিটা swap অন্তত একটা সংখ্যাকে সঠিক ঘরে বসায়, তাই swap সর্বোচ্চ n-1 বার।
- রেঞ্জের বাইরের মান (যেমন missing-সমস্যায় n+1) থাকলে সেটা স্থির রেখে এগিয়ে যাই - নাহলে infinite loop।
- sort-এর পর এক pass: যে index-এ `nums[i] !== i+1`, সেটাই উত্তরের ইঙ্গিত।

**Complexity** - O(n) time, O(1) space।

> **Animation Spec: Everyone Home**
> - **দৃশ্য:** index-চিহ্নিত ঘরের সারি; ভুল ঘরের সংখ্যা তীর দিয়ে সঠিক ঘরে swap হয়।
> - **ইনপুট:** 1..n রেঞ্জের array (missing / duplicate preset)।
> - **ধাপ:** প্রতিটা swap-এ একটা সংখ্যা সবুজ (ঠিক ঘরে); শেষে অমিলের ঘর লাল -> missing/duplicate প্রকাশ।
> - **নিয়ন্ত্রণ:** speed, step, reset।
> - **লক্ষ্য:** রেঞ্জ জানা থাকলে তুলনা-ভিত্তিক sort ছাড়াই O(n) সম্ভব।

**অনুশীলন**
- একই ছাঁচে duplicate সংখ্যা বের করো (ইঙ্গিত: যে সংখ্যার ঘরে আগে থেকেই সে বসে আছে)।

---

## 16.11: Kth Element (Quickselect ও Heap)

**কী শিখব**
- পুরো sort ছাড়াই k-তম বড়/ছোট উপাদান

**ধারণা**
"k-তম বৃহত্তম" চাইলে পুরো array sort করা অপচয়। **Quickselect** quick sort-এর partition-ই ব্যবহার করে: pivot একটা ঠিক ঘরে বসে গেলে দেখা যায় উত্তর কোন ভাগে - অন্য ভাগ ফেলে দিই (পুরো sort নয়, এক ভাগেই খোঁজ)। বিকল্প: k-আকারের একটা **heap** রেখে সবাইকে একবার ঢুকালে top-k আয়ত্তে (stream-এ এটাই ভালো, দেখো [section 12](12-heaps-and-priority-queues.md))।

**কোড উদাহরণ (quickselect)**
```js
function kthLargest(nums, k) {
  const target = nums.length - k; // sorted হলে এই index-এ থাকত
  let left = 0, right = nums.length - 1;
  while (left <= right) {
    const p = partition(nums, left, right);
    if (p === target) return nums[p];
    else if (p < target) left = p + 1;  // ডান ভাগে খোঁজো
    else right = p - 1;                 // বাঁ ভাগে খোঁজো
  }
}
function partition(nums, left, right) {
  const pivot = nums[right];
  let i = left;
  for (let j = left; j < right; j++) {
    if (nums[j] <= pivot) { [nums[i], nums[j]] = [nums[j], nums[i]]; i++; }
  }
  [nums[i], nums[right]] = [nums[right], nums[i]];
  return i;                             // pivot-এর চূড়ান্ত ঘর
}
console.log(kthLargest([3, 2, 1, 5, 6, 4], 2)); // 5
```

**কোড ব্রেকডাউন**
- partition pivot-কে চূড়ান্ত ঘরে বসায়: বাঁয়ে ছোট/সমান, ডানে বড়।
- সেই ঘর target হলেই উত্তর; নাহলে ঠিক একটা ভাগে খোঁজ চলে - গড়ে প্রতি ধাপে অর্ধেক ফেলে দিই।
- k-আকারের min-heap রাখলে top-k মিলে O(n log k)-এ; চলমান stream-এ সেটাই সুবিধাজনক।

**Complexity** - গড়ে O(n), worst O(n²) (দুর্ভাগ্যজনক pivot); heap-পথ O(n log k)।

> **Animation Spec: Quickselect**
> - **দৃশ্য:** bar array; pivot highlight; partition-এর পর ছোটগুলো বাঁয়ে, বড়গুলো ডানে; ফেলে-দেওয়া ভাগ ধুসর।
> - **ইনপুট:** array, k।
> - **ধাপ:** প্রতি round-এ pivot সবুজ চূড়ান্ত ঘরে; অনুসন্ধান-এলাকা সঙ্কুচিত হওয়া দৃশ্যমান।
> - **নিয়ন্ত্রণ:** speed, step, reset; heap-পথ toggle।
> - **লক্ষ্য:** পুরো sort না করেও k-তম পাওয়া যায় - কাজ কমানোই গতি।

**অনুশীলন**
- quickselect দিয়ে median (k = n/2) বের করো।

---

## 16.12: Two Heaps

**কী শিখব**
- max-heap + min-heap মিলিয়ে চলমান median

**ধারণা**
সংখ্যা একটা একটা আসতে থাকে (stream), আর যেকোনো মুহূর্তে median জানতে চাই। কৌশল: ছোট অর্ধেক রাখি **max-heap**-এ (শীর্ষে সেই অর্ধেকের সবচেয়ে বড়), বড় অর্ধেক **min-heap**-এ (শীর্ষে সেই অর্ধেকের সবচেয়ে ছোট)। দুটোর size-এর পার্থক্য সর্বোচ্চ ১ রাখলে median সবসময় heap-দুটোর শীর্ষে - O(1)।

**কোড উদাহরণ (চলমান median)**
```js
// ছোট generic heap (comparator দিয়ে min/max দুটোই)
class Heap {
  constructor(cmp) { this.a = []; this.cmp = cmp; }
  size() { return this.a.length; }
  peek() { return this.a[0]; }
  push(x) {
    this.a.push(x);
    let i = this.a.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.cmp(this.a[i], this.a[p]) < 0) { [this.a[i], this.a[p]] = [this.a[p], this.a[i]]; i = p; }
      else break;
    }
  }
  pop() {
    const top = this.a[0], last = this.a.pop();
    if (this.a.length) {
      this.a[0] = last;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1, r = l + 1;
        let m = i;
        if (l < this.a.length && this.cmp(this.a[l], this.a[m]) < 0) m = l;
        if (r < this.a.length && this.cmp(this.a[r], this.a[m]) < 0) m = r;
        if (m === i) break;
        [this.a[i], this.a[m]] = [this.a[m], this.a[i]];
        i = m;
      }
    }
    return top;
  }
}

class MedianFinder {
  constructor() {
    this.low = new Heap((a, b) => b - a);  // ছোট অর্ধেক - max-heap
    this.high = new Heap((a, b) => a - b); // বড় অর্ধেক - min-heap
  }
  addNum(x) {
    this.low.push(x);
    this.high.push(this.low.pop());        // low-র সবচেয়ে বড়টা high-তে
    if (this.high.size() > this.low.size()) {
      this.low.push(this.high.pop());      // ভারসাম্য: low-তে আগে
    }
  }
  findMedian() {
    if (this.low.size() > this.high.size()) return this.low.peek();
    return (this.low.peek() + this.high.peek()) / 2;
  }
}
const mf = new MedianFinder();
[5, 2, 10, 3].forEach(n => mf.addNum(n));
console.log(mf.findMedian()); // 4  (3 ও 5-এর গড়)
```

**কোড ব্রেকডাউন**
- নতুন সংখ্যা আগে low-তে; তারপর low-র শীর্ষ (ছোট অর্ধেকের সবচেয়ে বড়) high-তে - এতে সব ছোট বাঁয়ে, সব বড় ডানে থাকে নিশ্চিত।
- high বড় হয়ে গেলে শীর্ষটা low-তে ফেরত - দুই পাশের পার্থক্য সর্বোচ্চ ১।
- মাঝের মান (বা মাঝের দুটোর গড়) সবসময় heap-দুটোর শীর্ষে তৈরি।

**Complexity** - insert O(log n), median O(1)।

> **Animation Spec: Balanced Halves**
> - **দৃশ্য:** মাঝখানে median-রেখা; বাঁয়ে max-heap (ছোট অর্ধেক), ডানে min-heap (বড় অর্ধেক)।
> - **ইনপুট:** সংখ্যার stream (একটা একটা যোগ)।
> - **ধাপ:** insert -> rebalance -> median হিসাব, তিন ধাপ আলাদা রঙে; heap-এ bubble up দৃশ্যমান।
> - **নিয়ন্ত্রণ:** speed, step, reset; পরের সংখ্যা নিজে দেওয়া।
> - **লক্ষ্য:** দুই বিপরীত heap রাখলে মাঝ সবসময় হাতের কাছে।

**অনুশীলন**
- ভারসাম্যের শর্ত উল্টে দিলে (high-তে একটা বেশি) কোথায় কী বদলাতে হবে, লিখে দেখাও।

---

## 16.13: Island (Grid) Traversal

**কী শিখব**
- 2D grid-কে graph ভেবে flood fill

**ধারণা**
'1' = স্থল, '0' = পানি; উপর-নিচ-বাঁ-ডানে সংযুক্ত স্থল একটা island। মোট কয়টা island? প্রতিটা অপরিদর্শিত স্থল ঘর থেকে **DFS/BFS দিয়ে পুরো island-টা visited** করে দিলে (flood fill), পরে সেই ঘর আর নতুন island ধরে না। মূলত graph-এর connected components গোনা ([section 13](13-graph-data-structures.md)) - grid-ই এখানে graph, প্রতিবেশীই edge।

**কোড উদাহরণ (island গোনা)**
```js
function numIslands(grid) {
  if (!grid.length) return 0;
  const rows = grid.length, cols = grid[0].length;
  let count = 0;
  function sink(r, c) {
    if (r < 0 || c < 0 || r >= rows || c >= cols || grid[r][c] !== '1') return;
    grid[r][c] = '0';               // ডুবিয়ে দিই = visited চিহ্ন
    sink(r + 1, c); sink(r - 1, c); // উপর-নিচ
    sink(r, c + 1); sink(r, c - 1); // বাঁ-ডান
  }
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === '1') { count++; sink(r, c); } // নতুন island, পুরোটা ডুবাও
    }
  }
  return count;
}
console.log(numIslands([
  ['1', '1', '0', '0'],
  ['1', '0', '0', '1'],
  ['0', '0', '1', '1'],
])); // 2
```

**কোড ব্রেকডাউন**
- বাইরের দুই loop প্রতিটা ঘর একবার দেখে; '1' পেলেই একটা নতুন island।
- `sink` পুরো island-টা recursion দিয়ে '0' বানিয়ে দেয় - বাউন্ডারি ও পানি-চেক আগে।
- BFS দিয়েও একই কাজ: queue-তে প্রতিবেশী রাখো। grid না বদলাতে চাইলে আলাদা visited set রাখো।

**Complexity** - O(rows * cols); প্রতিটা ঘর সর্বোচ্চ একবার।

> **Animation Spec: Flood Fill**
> - **দৃশ্য:** 2D grid; স্থল সবুজ, পানি নীল; DFS ঢেউ একটা island জুড়ে ছড়ায় (বেগুনি visited), শেষে island-এ নম্বর বসে।
> - **ইনপুট:** grid (preset / কাস্টম), DFS বা BFS পছন্দ।
> - **ধাপ:** scan cursor ঘরে ঘরে; '1' পেলে flood শুরু; island counter বাড়ে।
> - **নিয়ন্ত্রণ:** speed, step, reset; grid size।
> - **লক্ষ্য:** flood fill = grid-এ graph traversal - একই ছাঁচে অনেক সমস্যা।

**অনুশীলন**
- সবচেয়ে বড় island-এর আয়তন (ঘর-সংখ্যা) বের করো।

---

## 16.14: Randomised Algorithms

**কী শিখব**
- এলোমেলোতা দিয়ে adversarial input থেকে রক্ষা

**ধারণা**
এলোমেলো পছন্দ ব্যবহার করে এমন algorithm, যার গতি/ফল খারাপ-ইচ্ছুক ইনপুটের (adversarial) হাতে ধরা পড়ে না। দুই ধরনের: **Las Vegas** - ফল সবসময় সঠিক, সময় এলোমেলো (random-pivot quicksort); **Monte Carlo** - সময় নিশ্চিত, ফলে ছোট ভুল-সম্ভাবনা। quick sort-এ random pivot নিলে worst case O(n²) প্রায় অসম্ভব হয়ে যায় - তাই quicksort/quickselect-এ এটা প্রায় বাধ্যতামূলক অভ্যাস।

**কোড উদাহরণ (Fisher-Yates shuffle)**
```js
// প্রতিটা permutation সম-সম্ভাব্য - unbiased shuffle-এর স্ট্যান্ডার্ড
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // 0..i-এর যেকোনো একটা
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
console.log(shuffle([1, 2, 3, 4, 5])); // যেমন [3,1,5,2,4] - প্রতিবার আলাদা
```

**কোড ব্রেকডাউন**
- শেষ থেকে প্রতিটা ঘরে 0..i রেঞ্জের random index-এর সাথে swap; প্রতিটা অবস্থান সম-সম্ভাব্য বলেই এটা unbiased।
- naive "random দুই ঘর বারবার swap" biased ফল দেয় - তাই Fisher-Yates-ই স্ট্যান্ডার্ড।
- একই ধারণা quickselect-এ (16.11): pivot বাছাইয়ের আগে random index-টা শেষে swap করে নাও।

**Complexity** - Fisher-Yates O(n); random-pivot quicksort প্রত্যাশিত O(n log n)।

> **Animation Spec: Fair Shuffle**
> - **দৃশ্য:** কার্ড-সারি; i pointer ডান থেকে বাঁয়ে; প্রতি ধাপে 0..i রেঞ্ই highlight হয়ে random j বাছাই ও swap।
> - **ইনপুট:** array; seed (একই shuffle পুনরুত্পাদনের জন্য)।
> - **ধাপ:** প্রতি swap-এর পর রেঞ্ই এক ঘর সঙ্কুচিত; শেষে অনেকবার চালিয়ে permutation-এর uniformity চার্ট।
> - **নিয়ন্ত্রণ:** speed, step, reset; reshuffle।
> - **লক্ষ্য:** নিয়ন্ত্রিত এলোমেলোতা adversarial input থেকে রক্ষা করে।

**অনুশীলন**
- quickselect-এ (16.11) random pivot যোগ করো: Math.random দিয়ে pivot index বেছে সেটাকে শেষে swap করে নাও।

---

## 16.15: Multi-threaded (Concurrency-এর পরিচিতি)

**কী শিখব**
- কাজ ভাগ করে সমান্তরালে চালানোর ধারণা

**ধারণা**
বড় কাজ টুকরো করে একাধিক thread-এ একসাথে চালালে সময় কমে - যেমন merge sort-এর দুই অর্ধেক আলাদা thread-এ। JavaScript মূলত **single-threaded** (event loop), তবু browser-এ Web Worker ও Node-এ worker_threads দিয়ে আসল parallelism পাওয়া যায়। DSA interview-তে গভীরে আসে না, কিন্তু মূল ধারণাগুলো জানা দরকার: race condition (একই ডেটা একসাথে পাল্টানোর বিপদ), shared state, আর divide & conquer-এর সাথে মিল।

**কোড উদাহরণ (কাজ টুকরো করে সমান্তরালে)**
```js
// বড় যোগফল ৪ টুকরোয় ভাগ করে সমান্তরালে, শেষে combine
function sumChunk(arr, from, to) {
  return new Promise(resolve => {
    let s = 0;
    for (let i = from; i < to; i++) s += arr[i];
    setTimeout(() => resolve(s), 0); // event loop-কে সুযোগ দিলাম
  });
}
async function parallelSum(arr, chunks = 4) {
  const size = Math.ceil(arr.length / chunks);
  const parts = [];
  for (let c = 0; c < chunks; c++) {
    parts.push(sumChunk(arr, c * size, Math.min(arr.length, (c + 1) * size)));
  }
  const sums = await Promise.all(parts); // সব টুকরো শেষ হলে combine
  return sums.reduce((a, b) => a + b, 0);
}
parallelSum(Array.from({ length: 1000000 }, (_, i) => i + 1))
  .then(total => console.log(total)); // 500000500000
```

**কোড ব্রেকডাউন**
- divide & conquer-এরই সমান্তরাল রূপ: কাজ ভাগ, আলাদা আলাদা সমাধান, শেষে combine।
- `Promise.all` সব টুকরো শেষ না হওয়া পর্যন্ত অপেক্ষা করে; আসল CPU-parallelism চাইলে worker_threads (Node) বা Web Worker (browser) - ভাগ-কর-combine-কর ছাঁচ একই।
- সাবধানতা: একই ডেটা একসাথে পাল্টালে race condition - তাই প্রতিটা worker আলাদা ডেটা-অংশে কাজ করে।

**Complexity** - আদর্শে সময় ~T/p (p = worker-সংখ্যা) + ভাগ/জোড়ার overhead; বাস্তবে overhead মাথায় রাখো।

> **Animation Spec: Parallel Lanes**
> - **দৃশ্য:** একটা বড় কাজ-বার চারটা worker লেনে ভাগ; লেনগুলো সমান্তরালে ভরে ওঠে; শেষে combine ধাপ।
> - **ইনপুট:** কাজের আকার, worker-সংখ্যা।
> - **ধাপ:** ভাগ -> সমান্তরাল অগ্রগতি (সব লেন একসাথে) -> combine।
> - **নিয়ন্ত্রণ:** worker-সংখ্যা বাড়ানো/কমানো, speed।
> - **লক্ষ্য:** parallelism কেন রৈখিক গতি দেয় না - ভাগ ও জোড়ার overhead।

**অনুশীলন**
- একই যোগফল chunks=1 বনাম chunks=8-এ চালিয়ে সময় মাপো (console.time) - পার্থক্য কেন?

---

## Section সারাংশ

প্যাটার্ন চেনাই interview-এর অর্ধেক প্রস্তুতি। Brute force সবসময় বেসলাইন। Divide & Conquer অর্থাৎ ভাগ-জয়-জোড়া। Greedy প্রতি ধাপে সেরা (সব সমস্যায় কাজ করে না)। Backtracking অর্থাৎ চেষ্টা করে ফিরে আসা, pruning সহ। DP অর্থাৎ overlapping subproblem-এর ফল জমিয়ে optimize। Two Pointer sorted-এ জোড়ায়; Fast & Slow cycle/মাঝে; Sliding Window টানা অংশে O(n) দেয়। Merge Intervals = sort + sweep; Cyclic Sort = 1..n রেঞ্জে নিজের ঘরে; Kth Element = quickselect বা heap; Two Heaps = চলমান median; Island = grid-এ flood fill; Randomised = এলোমেলোতা দিয়ে adversarial প্রতিরোধ; Multi-threaded = ভাগ করে সমান্তরালে। কোন প্যাটার্ন কখন লাগবে - তার চিটশিট [section 17](17-practice-and-roadmap.md)-এ।
