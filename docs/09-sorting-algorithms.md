# ০৯: Sorting Algorithms

সাজানো (sorting) DSA-র সবচেয়ে শেখনীয় বিষয়, কারণ একই সমস্যার অনেক সমাধান, প্রতিটার complexity আলাদা। এখানে ছবির ৬টা algorithm-ই শিখব।

> **Section Roadmap:** কেন sorting, Bubble, Selection, Insertion, Merge, Quick, Heap, তুলনা টেবিল

**সাধারণ swap হেল্পার (সব জায়গায় লাগবে):**
```js
function swap(arr, i, j) { [arr[i], arr[j]] = [arr[j], arr[i]]; }
```

---

## 9.1: কেন Sorting শিখব ও কী কী বিবেচ্য

**কী শিখব**
- stability, in-place, comparison-ভিত্তিক ধারণা

**ধারণা**
Sorting শুধু "সাজানো" নয়, এটা binary search, duplicate খোঁজা, interval merge ইত্যাদির পূর্বশর্ত। algorithm বিচারে দেখি:
- **Time complexity** (দ্রুততা)
- **Space** (in-place = অতিরিক্ত মেমরি লাগে না)
- **Stability** (সমান মানের আপেক্ষিক ক্রম বজায় থাকে কিনা)

**কোড উদাহরণ (JS built-in, বাস্তবে যা ব্যবহার করি)**
```js
const nums = [5, 2, 9, 1];
nums.sort((a, b) => a - b);  // ছোট থেকে বড় (comparator জরুরি!)
console.log(nums);           // [1, 2, 5, 9]
// শুধু nums.sort() করলে string হিসেবে তুলনা করে ভুল হয় সংখ্যায়
```

**ব্রেকডাউন**
- `sort((a,b) => a-b)` ফলাফল <0 হলে a আগে; সংখ্যা sort-এ comparator বাধ্যতামূলক।
- আমরা নিচে হাতে বানানো algorithm শিখব বোঝার জন্য; production-এ built-in `sort` (সাধারণত O(n log n))।

> **Animation Spec: Sorting Sandbox (মাস্টার)**
> - **দৃশ্য:** উচ্চতাভিত্তিক bar array; নিচে algorithm নির্বাচন dropdown।
> - **ইনপুট:** array মান/আকার, speed, algorithm।
> - **ধাপ:** নির্বাচিত algorithm অনুযায়ী compare (হলুদ)/swap (লাল)/sorted (সবুজ) রঙে চলবে; comparison ও swap counter দেখাবে।
> - **লক্ষ্য:** এক জায়গায় সব sort তুলনা করা।

**অনুশীলন**
- comparator বদলে বড় থেকে ছোট sort করো।

---

## 9.2: Bubble Sort

**কী শিখব**
- পাশাপাশি তুলনা করে বড়টা ধীরে ধীরে শেষে ঠেলা

**ধারণা**
পাশাপাশি দুটো উপাদান তুলনা করি; বাঁ-টা বড় হলে swap। প্রতিটা pass-এ সবচেয়ে বড় উপাদান "bubble" হয়ে শেষে চলে যায়। সহজ, কিন্তু ধীর।

**কোড উদাহরণ**
```js
function bubbleSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    for (let j = 0; j < n - 1 - i; j++) {   // -i: শেষেরগুলো ইতিমধ্যে sorted
      if (arr[j] > arr[j + 1]) {
        swap(arr, j, j + 1);
        swapped = true;
      }
    }
    if (!swapped) break;                     // কোনো swap নেই অর্থাৎ sorted, থামি
  }
  return arr;
}
console.log(bubbleSort([5, 1, 4, 2, 8])); // [1,2,4,5,8]
```

**ব্রেকডাউন**
- ভেতরের loop পাশাপাশি জোড়া তুলনা করে swap।
- `swapped` flag: ইতিমধ্যে sorted হলে আগেভাগে থামা (best case O(n))।
- `n-1-i`: প্রতি pass-এ শেষের অংশ নিশ্চিত sorted।

**Complexity:** worst/avg O(n²); best O(n); space O(1); stable।

> **Animation Spec: Bubbling Up**
> - **দৃশ্য:** bar; পাশাপাশি জোড়া হলুদ, swap হলে লাল, প্রতি pass শেষে ডান প্রান্তের bar সবুজ।
> - **ইনপুট:** array, speed।
> - **ধাপ:** বড় bar ধাপে ধাপে ডানে "ভেসে" যাবে।
> - **লক্ষ্য:** কেন O(n²): অনেক তুলনা/swap।

**অনুশীলন**
- `swapped` flag ছাড়া ও সহ, best case-এ পার্থক্য observe করো।

---

## 9.3: Selection Sort

**কী শিখব**
- প্রতিবার সবচেয়ে ছোটটা খুঁজে সামনে বসানো

**ধারণা**
বাকি অংশ থেকে সবচেয়ে ছোট উপাদান খুঁজি, তারপর সেটা সঠিক জায়গায় (সামনে) একবার swap করি। swap সংখ্যা কম, কিন্তু তুলনা বেশি।

**কোড উদাহরণ**
```js
function selectionSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    let minIndex = i;
    for (let j = i + 1; j < n; j++) {
      if (arr[j] < arr[minIndex]) minIndex = j;  // ছোটতম খুঁজি
    }
    if (minIndex !== i) swap(arr, i, minIndex);  // একবার swap
  }
  return arr;
}
console.log(selectionSort([64, 25, 12, 22, 11])); // [11,12,22,25,64]
```

**ব্রেকডাউন**
- বাইরের loop = কোন জায়গা পূরণ করছি।
- ভেতরের loop = বাকির মধ্যে ছোটতম খুঁজে minIndex।
- প্রতি pass-এ মাত্র একটা swap, তাই swap ব্যয়বহুল হলে ভালো।

**Complexity:** সব ক্ষেত্রে O(n²); space O(1); unstable।

> **Animation Spec: Find-Min & Place**
> - **দৃশ্য:** bar; বর্তমান minimum tracker (কমলা) বাকির উপর হাঁটে।
> - **ইনপুট:** array, speed।
> - **ধাপ:** ছোটতম খুঁজে সেটা সামনের অবস্থানে swap; সামনের অংশ সবুজ (sorted) হতে থাকে।
> - **লক্ষ্য:** "খুঁজি একবার, swap একবার" প্যাটার্ন।

**অনুশীলন**
- selection sort-এ সর্বোচ্চ কতটা swap হয় ভাবো।

---

## 9.4: Insertion Sort

**কী শিখব**
- তাস সাজানোর মতো, একটা একটা করে সঠিক জায়গায় বসানো

**ধারণা**
হাতে তাস সাজানোর মতো: প্রতিটা নতুন উপাদানকে আগে-sorted অংশে সঠিক জায়গায় ঢুকিয়ে দিই। প্রায়-sorted ডেটায় খুব দ্রুত (best O(n))।

**কোড উদাহরণ**
```js
function insertionSort(arr) {
  for (let i = 1; i < arr.length; i++) {
    const key = arr[i];          // যাকে বসাতে হবে
    let j = i - 1;
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];       // বড়গুলো ডানে সরাই
      j--;
    }
    arr[j + 1] = key;            // সঠিক জায়গায় বসাই
  }
  return arr;
}
console.log(insertionSort([5, 2, 4, 6, 1, 3])); // [1,2,3,4,5,6]
```

**ব্রেকডাউন**
- বাঁ দিকটা সবসময় sorted থাকে; ডান থেকে একটা করে key নিয়ে সেখানে ঢোকাই।
- `while` loop key-এর জায়গা বানাতে বড়গুলো ডানে ঠেলে।
- প্রায়-sorted হলে while প্রায় চলে না, তাই O(n)।

**Complexity:** worst/avg O(n²); best O(n); space O(1); stable।

> **Animation Spec: Card Insertion**
> - **দৃশ্য:** বাঁয়ে sorted অংশ (সবুজ), ডানে unsorted; একটা key তুলে সঠিক জায়গায় বসছে।
> - **ইনপুট:** array (near-sorted preset সহ), speed।
> - **ধাপ:** key বাঁয়ে হাঁটে, বড়গুলো ডানে সরে, জায়গা পেলে বসে।
> - **লক্ষ্য:** near-sorted ডেটায় কেন দ্রুত।

**অনুশীলন**
- ইতিমধ্যে sorted array দিলে ক'টা shift হয় দেখো।

---

## 9.5: Merge Sort (Divide & Conquer)

**কী শিখব**
- ভাগ করো, সাজাও, মেলাও: O(n log n)

**ধারণা**
Array-কে বারবার অর্ধেক ভাগ করি যতক্ষণ প্রতিটা টুকরো ১টা উপাদান (তা তো sorted!); তারপর টুকরোগুলো **merge** করে সাজিয়ে জোড়া লাগাই। recursion-এর সুন্দর প্রয়োগ। বড় ডেটায় নির্ভরযোগ্য।

**কোড উদাহরণ**
```js
function mergeSort(arr) {
  if (arr.length <= 1) return arr;                 // base: একটা অর্থাৎ sorted
  const mid = Math.floor(arr.length / 2);
  const left  = mergeSort(arr.slice(0, mid));      // বাঁ অর্ধেক sort
  const right = mergeSort(arr.slice(mid));         // ডান অর্ধেক sort
  return merge(left, right);                       // দুটো sorted জোড়া
}

function merge(left, right) {
  const result = [];
  let i = 0, j = 0;
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) result.push(left[i++]); // ছোটটা আগে
    else result.push(right[j++]);
  }
  return result.concat(left.slice(i)).concat(right.slice(j)); // বাকি জুড়ে দাও
}
console.log(mergeSort([5, 2, 9, 1, 7])); // [1,2,5,7,9]
```

**ব্রেকডাউন**
- **Divide:** মাঝ থেকে দুই ভাগ, recursive sort।
- **Conquer/merge:** দুটো sorted array-কে দুই pointer দিয়ে O(n)-এ মেলানো।
- log n স্তর ভাগ × প্রতি স্তরে O(n) merge = O(n log n)।

**Complexity:** সব ক্ষেত্রে O(n log n); space O(n); stable।

> **Animation Spec: Divide & Merge Tree**
> - **দৃশ্য:** array উপরে; নিচে নামতে নামতে ভাগ হয়ে ছোট টুকরো; তারপর নিচ থেকে উপরে merge।
> - **ইনপুট:** array, speed।
> - **ধাপ:** ভাগের সময় টুকরো আলাদা হয়; merge-এ দুই টুকরো তুলনা করে sorted হয়ে উপরে ওঠে।
> - **লক্ষ্য:** divide-and-conquer ও O(n log n) স্তর-অনুভূতি।

**অনুশীলন**
- `merge` function আলাদা করে দুটো sorted array মেলাও।

---

## 9.6: Quick Sort

**কী শিখব**
- pivot বেছে ভাগ করা, বাস্তবে দ্রুততম গড়ে

**ধারণা**
একটা **pivot** বেছে নিই; pivot-এর চেয়ে ছোট সব বাঁয়ে, বড় সব ডানে সাজাই (**partition**)। তারপর বাঁ ও ডান অংশে recursively একই কাজ। গড়ে O(n log n), in-place।

**কোড উদাহরণ (in-place, Lomuto partition)**
```js
function quickSort(arr, low = 0, high = arr.length - 1) {
  if (low < high) {
    const p = partition(arr, low, high);  // pivot সঠিক জায়গায়
    quickSort(arr, low, p - 1);           // বাঁ অংশ
    quickSort(arr, p + 1, high);          // ডান অংশ
  }
  return arr;
}

function partition(arr, low, high) {
  const pivot = arr[high];       // শেষটাকে pivot ধরি
  let i = low - 1;               // ছোট অংশের সীমানা
  for (let j = low; j < high; j++) {
    if (arr[j] < pivot) { i++; swap(arr, i, j); } // ছোট হলে বাঁয়ে আনি
  }
  swap(arr, i + 1, high);        // pivot-কে মাঝে বসাই
  return i + 1;                  // pivot-এর চূড়ান্ত index
}
console.log(quickSort([8, 3, 1, 7, 0, 10, 2])); // [0,1,2,3,7,8,10]
```

**ব্রেকডাউন**
- `partition` pivot-কে তার চূড়ান্ত জায়গায় বসায়; বাঁয়ে ছোট, ডানে বড়।
- এরপর দুই পাশে recursion।
- **worst case O(n²)** হয় যদি pivot বাজে হয় (যেমন already-sorted-এ শেষ pivot); random pivot দিয়ে এড়ানো যায়।

**Complexity:** avg/best O(n log n); worst O(n²); space O(log n); unstable।

> **Animation Spec: Pivot Partition**
> - **দৃশ্য:** bar; pivot আলাদা রঙ; দুটো pointer (i, j) হাঁটে; ছোটগুলো বাঁয়ে জড়ো হয়।
> - **ইনপুট:** array, pivot কৌশল (last / random)।
> - **ধাপ:** partition-এ swap দেখা যায়; pivot মাঝে বসে; পরে দুই পাশে recursion।
> - **লক্ষ্য:** partition যুক্তি ও কেন pivot পছন্দ গুরুত্বপূর্ণ।

**অনুশীলন**
- random pivot যোগ করে already-sorted array-তে worst case এড়াও।

---

## 9.7: Heap Sort

**কী শিখব**
- heap দিয়ে সাজানো: O(n log n), in-place

**ধারণা**
প্রথমে array-কে একটা **max-heap**-এ রূপ দিই (সবচেয়ে বড় উপরে)। তারপর বারবার উপরের (সবচেয়ে বড়) উপাদান শেষে সরিয়ে heap ছোট করি ও ঠিক করি (**heapify**)। heap সম্পর্কে বিস্তারিত section 12-এ।

**কোড উদাহরণ**
```js
function heapSort(arr) {
  const n = arr.length;
  // ১) max-heap বানাই (শেষ parent থেকে শুরু)
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) heapify(arr, n, i);
  // ২) একে একে বড়টা শেষে সরাই
  for (let end = n - 1; end > 0; end--) {
    swap(arr, 0, end);           // সবচেয়ে বড় (root) শেষে
    heapify(arr, end, 0);        // ছোট-হওয়া heap ঠিক করি
  }
  return arr;
}

function heapify(arr, size, root) {
  let largest = root;
  const left = 2 * root + 1, right = 2 * root + 2;
  if (left < size && arr[left] > arr[largest]) largest = left;
  if (right < size && arr[right] > arr[largest]) largest = right;
  if (largest !== root) { swap(arr, root, largest); heapify(arr, size, largest); }
}
console.log(heapSort([4, 10, 3, 5, 1])); // [1,3,4,5,10]
```

**ব্রেকডাউন**
- heap array-তে: parent `i`-এর চাইল্ড `2i+1`, `2i+2`।
- `heapify` root-কে তার চাইল্ডদের সাথে তুলনা করে বড়টা উপরে তোলে।
- বারবার root (max) শেষে সরিয়ে sorted অংশ বাড়ে।

**Complexity:** সব ক্ষেত্রে O(n log n); space O(1); unstable।

> **Animation Spec: Heapify & Extract**
> - **দৃশ্য:** উপরে গাছ (heap), নিচে array, দুটো সিঙ্ক।
> - **ইনপুট:** array, speed।
> - **ধাপ:** build-heap পর্বে node উপরে ওঠে; extract পর্বে root শেষে যায়, heapify পুনর্গঠন করে।
> - **লক্ষ্য:** array-heap দ্বৈততা ও heapify বোঝা।

**অনুশীলন**
- min-heap দিয়ে বড় থেকে ছোট sort করতে কী বদলাতে হবে ভাবো।

---

## 9.8: সব Sort-এর তুলনা

| Algorithm | Best | Average | Worst | Space | Stable |
|-----------|------|---------|-------|-------|--------|
| Bubble | O(n) | O(n²) | O(n²) | O(1) | হ্যাঁ |
| Selection | O(n²) | O(n²) | O(n²) | O(1) | না |
| Insertion | O(n) | O(n²) | O(n²) | O(1) | হ্যাঁ |
| Merge | O(n log n) | O(n log n) | O(n log n) | O(n) | হ্যাঁ |
| Quick | O(n log n) | O(n log n) | O(n²) | O(log n) | না |
| Heap | O(n log n) | O(n log n) | O(n log n) | O(1) | না |

**নিয়ম:** সাধারণ ব্যবহারে built-in `sort` (dual-pivot quick/merge)। স্থিতিশীলতা লাগলে merge; মেমরি কম ও নিশ্চিত O(n log n) লাগলে heap।

> **Animation Spec: Grand Race**
> - **দৃশ্য:** ৬টা panel একসাথে, একই input, প্রতিটায় ভিন্ন algorithm।
> - **ইনপুট:** একই array, speed।
> - **ধাপ:** সব একসাথে চলবে; কে আগে শেষ করে ও কতটা কাজ করে counter-এ।
> - **লক্ষ্য:** একই ডেটায় গতির নাটকীয় পার্থক্য।

**অনুশীলন**
- ১০০০ এলোমেলো সংখ্যায় কোন algorithm সবচেয়ে কম comparison করে, পরীক্ষা করো।

---

## Section সারাংশ

O(n²): Bubble, Selection, Insertion (সহজ, শেখার জন্য)। O(n log n): Merge (stable, O(n) space), Quick (গড়ে দ্রুত, worst O(n²)), Heap (in-place, নিশ্চিত O(n log n))। স্থিতিশীলতা ও space অনুযায়ী বাছাই।

**পরবর্তী:** [10: Searching Algorithms](10-searching-algorithms.md)
