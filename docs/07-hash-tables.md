# ০৭: Hash Tables

Hash Table হলো DSA-র "জাদু", গড়ে O(1)-এ খোঁজা, যোগ, বাদ। JavaScript-এর `Map`, `Set`, আর object এর উপরই দাঁড়িয়ে। interview-তে অসংখ্য সমস্যা hash দিয়ে সহজ হয়ে যায়।

> **Section Roadmap:** ধারণা, Hash Function, Collision, নিজে বানানো, Map ও Set, প্রয়োগ প্যাটার্ন

---

## 7.1: Hash Table কী ও কেন এত দ্রুত

**কী শিখব**
- key থেকে value দ্রুত ম্যাপিংয়ের ধারণা

**ধারণা**
Array-তে খুঁজতে index লাগে (সংখ্যা)। কিন্তু আমরা প্রায়ই **নাম/শব্দ** দিয়ে খুঁজতে চাই, যেমন "Rahim-এর roll কত?"। Hash Table এটা করে: একটা **hash function** key-কে একটা array-index-এ রূপান্তর করে, ফলে সরাসরি সেই index-এ গিয়ে মান পাওয়া যায়, গড়ে **O(1)**।

বাস্তব: অভিধান (শব্দ থেকে অর্থ), ফোনবুক (নাম থেকে নম্বর)।

**কোড উদাহরণ (ধারণা, Map দিয়ে)**
```js
const rollBook = new Map();
rollBook.set("Rahim", 5);   // key থেকে value, O(1)
rollBook.set("Karim", 8);

console.log(rollBook.get("Rahim")); // 5, O(1)
console.log(rollBook.has("Karim")); // true, O(1)
```

**ব্রেকডাউন**
- `set(key, value)` দিয়ে জমা রাখে।
- `get(key)` key-এর hash হিসাব করে সরাসরি জায়গায় পৌঁছায়।
- সংখ্যা index না লাগিয়ে যেকোনো key দিয়ে O(1) access, এটাই মূল শক্তি।

**Complexity:** গড়ে O(1); worst case O(n) (collision বেশি হলে)।

> **Animation Spec: Key থেকে Bucket**
> - **দৃশ্য:** বাঁয়ে key, মাঝে "hash function" মেশিন, ডানে bucket array।
> - **ইনপুট:** key টাইপ।
> - **ধাপ:** key মেশিনে ঢুকে একটা সংখ্যা (index) বের হবে, তীর গিয়ে সেই bucket-এ মান বসবে।
> - **লক্ষ্য:** hashing = key কে index-এ রূপান্তর।

**অনুশীলন**
- একটা Map বানিয়ে ৫টা দেশ-রাজধানী রাখো ও খোঁজো।

---

## 7.2: Hash Function

**কী শিখব**
- key কীভাবে সংখ্যায় (index) রূপান্তরিত হয়

**ধারণা**
Hash function key নেয়, একটা সংখ্যা (index) ফেরত দেয়। ভালো hash function-এর গুণ: (১) দ্রুত, (২) একই key-তে সবসময় একই ফলাফল, (৩) মানগুলো সমানভাবে ছড়িয়ে দেয় (কম collision)।

**কোড উদাহরণ (সরল hash function)**
```js
function simpleHash(key, size) {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash + key.charCodeAt(i) * (i + 1)) % size; // অক্ষরের কোড যোগ
  }
  return hash;                       // 0 .. size-1 এর মধ্যে একটা index
}

console.log(simpleHash("Rahim", 10)); // যেমন 3
console.log(simpleHash("Karim", 10)); // যেমন 7
```

**ব্রেকডাউন**
- `charCodeAt(i)` দেয় প্রতিটা অক্ষরের সংখ্যা-কোড।
- `* (i + 1)` দেয় অবস্থানভেদে ওজন, যাতে "abc" ও "cba" আলাদা hash পায়।
- `% size` ফলাফলকে array-এর সীমার ভেতরে রাখে।

**Complexity:** key-দৈর্ঘ্য k হলে O(k) (সাধারণত ছোট, ধ্রুবকের মতো)।

> **Animation Spec: Hash Computation**
> - **দৃশ্য:** key-এর প্রতিটা অক্ষর থেকে charCode, তারপর চলমান যোগফল, শেষে % size।
> - **ইনপুট:** key ও table size।
> - **ধাপ:** অক্ষর ধরে ধরে হিসাব দেখা যাবে, শেষে final index highlight।
> - **লক্ষ্য:** hash কোনো জাদু নয়, নির্দিষ্ট গণনা, এটা বোঝা।

**অনুশীলন**
- size বদলালে একই key-এর index কীভাবে বদলায় দেখো।

---

## 7.3: Collision ও তার সমাধান

**কী শিখব**
- দুই key একই index পেলে কী হয়

**ধারণা**
ভিন্ন key কখনো একই index পেতে পারে, এটাই **collision**। মূল দুটো সমাধান:

1. **Chaining:** প্রতিটা bucket-এ একটা list রাখা; collision হলে সেই list-এ যোগ। (সবচেয়ে প্রচলিত)
2. **Open Addressing:** collision হলে পরের খালি ঘর খোঁজা (linear/quadratic probing)।

**কোড উদাহরণ (chaining দৃষ্টান্ত)**
```js
// bucket[index] = [ [key,value], [key,value], ... ]
const size = 4;
const buckets = Array.from({ length: size }, () => []);

function put(key, value) {
  const idx = simpleHash(key, size);
  const bucket = buckets[idx];
  const found = bucket.find(pair => pair[0] === key);
  if (found) found[1] = value;      // থাকলে আপডেট
  else bucket.push([key, value]);   // নাহলে যোগ (chain)
}
function get(key) {
  const idx = simpleHash(key, size);
  const found = buckets[idx].find(pair => pair[0] === key);
  return found ? found[1] : undefined;
}

put("a", 1); put("b", 2);
console.log(get("a")); // 1
```

**ব্রেকডাউন**
- একই index-এ একাধিক key থাকলে সেই bucket-এর ছোট list-এ খুঁজতে হয়।
- collision কম রাখতে "load factor" (entry/size) নির্দিষ্টের বেশি হলে table **resize** করা হয়।
- collision বেশি হলে সব এক bucket-এ জমে O(n) হয়ে যেতে পারে, তাই ভালো hash জরুরি।

**Complexity:** গড় O(1); খারাপ hash-এ worst O(n)।

> **Animation Spec: Collision & Chaining**
> - **দৃশ্য:** bucket array; একটা bucket-এ একাধিক entry chain হয়ে ঝুলছে।
> - **ইনপুট:** এমন দুটো key যাদের hash একই।
> - **ধাপ:** দ্বিতীয় key একই bucket-এ গিয়ে chain-এ যোগ হবে; get করলে chain ধরে খোঁজা দেখা যাবে।
> - **লক্ষ্য:** collision বাস্তব ও কীভাবে সামলানো হয়।

**অনুশীলন**
- ইচ্ছাকৃতভাবে ছোট size দিয়ে collision ঘটাও ও observe করো।

---

## 7.4: JavaScript-এ Map ও Set (বাস্তবে যা ব্যবহার করব)

**কী শিখব**
- built-in `Map` ও `Set`-এর দক্ষ ব্যবহার

**ধারণা**
বাস্তব কোডে আমরা নিজে hash table বানাই না, JavaScript-এর দক্ষ `Map` ও `Set` ব্যবহার করি।

- **Map**: key-value; যেকোনো টাইপ key হতে পারে; ক্রম বজায় থাকে
- **Set**: শুধু ইউনিক মান; দ্রুত membership চেক

> object-ও ব্যবহার করা যায় (`{}`), তবে DSA-তে `Map`/`Set` বেশি নিরাপদ ও দ্রুত (বিশেষত অনেক ডেটায়)।

**কোড উদাহরণ**
```js
// Map
const freq = new Map();
for (const ch of "banana") {
  freq.set(ch, (freq.get(ch) || 0) + 1); // অক্ষর গণনা
}
console.log(freq); // Map { 'b'=>1, 'a'=>3, 'n'=>2 }

// Set
const unique = new Set([1, 2, 2, 3, 3, 3]);
console.log([...unique]);      // [1, 2, 3]
console.log(unique.has(2));    // true, O(1)

// iterate
for (const [key, count] of freq) console.log(key, count);
```

**ব্রেকডাউন**
- `map.get(k) || 0` মানে না থাকলে 0 ধরে গণনা শুরুর প্রচলিত কৌশল।
- `Set` দিয়ে duplicate সরানো এক লাইনে: `[...new Set(arr)]`।
- `Map`/`Set`-এর `get/set/has/add` সবই গড়ে O(1)।

**Complexity:** get/set/has/add গড়ে O(1)।

> **Animation Spec: Frequency Counter**
> - **দৃশ্য:** উপরে input string, নিচে Map entries (key থেকে count) বার সহ।
> - **ইনপুট:** string।
> - **ধাপ:** প্রতিটা অক্ষরে সংশ্লিষ্ট count বার এক ধাপ বাড়বে।
> - **লক্ষ্য:** frequency counting প্যাটার্ন (interview-তে অতি প্রচলিত)।

**অনুশীলন**
- একটা string-এ সবচেয়ে বেশি আসা অক্ষরটি বের করো।

---

## 7.5: Hash Table প্রয়োগ প্যাটার্ন

**কী শিখব**
- interview-তে বারবার আসা hash প্যাটার্ন

**ধারণা**
Hash Table দিয়ে অনেক O(n²) সমস্যা O(n)-এ নামে। তিনটা ক্লাসিক প্যাটার্ন:

1. **Frequency counting** (উপরে দেখেছি)
2. **Seen-set** (আগে দেখেছি কিনা)
3. **Complement lookup** (Two Sum)

**কোড উদাহরণ (Two Sum, ক্লাসিক)**
```js
// target যোগফল দেয় এমন দুটো সংখ্যার index খুঁজি, O(n)
function twoSum(nums, target) {
  const seen = new Map();            // value থেকে index
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];   // যা দরকার
    if (seen.has(need)) return [seen.get(need), i]; // আগে দেখেছি?
    seen.set(nums[i], i);
  }
  return [];                         // পাওয়া যায়নি
}

console.log(twoSum([2, 7, 11, 15], 9)); // [0, 1]  (2+7=9)
```

**ব্রেকডাউন**
- naive হতো nested loop, O(n²)।
- এখানে প্রতিটা সংখ্যার "প্রয়োজনীয় জোড়া" (complement) আগে দেখেছি কিনা map-এ চেক, তাই O(n)।
- এক pass, এক map, hash-এর শক্তির সেরা উদাহরণ।

**Complexity:** O(n) time, O(n) space।

> **Animation Spec: Two Sum Lookup**
> - **দৃশ্য:** array; নিচে একটা map (value থেকে index); উপরে target।
> - **ইনপুট:** array ও target।
> - **ধাপ:** প্রতিটা সংখ্যায় complement হিসাব করে map-এ আছে কিনা চেক (হলুদ), পেলে দুই index সবুজ; না পেলে map-এ যোগ।
> - **লক্ষ্য:** complement-lookup প্যাটার্ন আত্মস্থ করা।

**অনুশীলন**
- দুটো array-এর common উপাদান O(n)-এ বের করো (Set ব্যবহার করে)।

---

## Section সারাংশ

Hash Table = hash function দিয়ে key থেকে index, গড়ে O(1) access। Collision সামলাতে chaining/open addressing। বাস্তবে `Map`/`Set` ব্যবহার। প্যাটার্ন: frequency count, seen-set, complement lookup, অনেক O(n²) সমস্যা O(n) করে।

**পরবর্তী:** [08: Recursion](08-recursion.md)
