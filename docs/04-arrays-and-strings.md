# ০৪: Arrays & Strings

Array হলো সবচেয়ে মৌলিক ও সবচেয়ে বেশি ব্যবহৃত data structure। প্রায় সব DSA সমস্যার ভিত্তি এখানে। String-ও আসলে character-এর array, তাই একসাথে শিখব।

> **Section Roadmap:** Array কী, memory-তে array, অপারেশন ও complexity, 2D Array, Strings, common patterns (intro)

---

## 4.1: Array কী ও Memory-তে কীভাবে থাকে

**কী শিখব**
- Array-এর গঠন ও কেন index access এত দ্রুত

**ধারণা**
Array হলো একই ধরনের ডেটার একটা ধারাবাহিক (contiguous) তালিকা, যেখানে প্রতিটা উপাদানের একটা **index** (অবস্থান নম্বর) আছে, শুরু হয় **0** থেকে।

মেমরিতে array-এর উপাদানগুলো **পাশাপাশি** থাকে। তাই index দিলে কম্পিউটার সরাসরি হিসাব করে ঠিক জায়গায় পৌঁছায়, এজন্যই index access **O(1)**।

```
index:   0    1    2    3
value: [ 10 , 20 , 30 , 40 ]
```

**কোড উদাহরণ**
```js
const arr = [10, 20, 30, 40];

console.log(arr[0]);       // 10, সরাসরি, O(1)
console.log(arr[2]);       // 30
console.log(arr.length);   // 4

arr[1] = 99;               // মান বদলানো, O(1)
console.log(arr);          // [10, 99, 30, 40]
```

**ব্রেকডাউন**
- `arr[2]` অর্থাৎ শুরুর ঠিকানা + (2 × প্রতি উপাদানের আকার) = সরাসরি জায়গা, তাই O(1)।
- index সবসময় 0 থেকে শুরু, তাই শেষ index = `length - 1`।

**Complexity:** access/update O(1)।

> **Animation Spec: Memory Layout**
> - **দৃশ্য:** পাশাপাশি মেমরি সেল, প্রতিটার নিচে address ও index।
> - **ইনপুট:** index টাইপ করে "access" চাপা।
> - **ধাপ:** address গণনা (base + index × size) দেখিয়ে সরাসরি সেল highlight, কোনো scan ছাড়াই।
> - **লক্ষ্য:** কেন index access O(1) তা বোঝা।

**অনুশীলন**
- একটা array-এর শেষ উপাদান length ব্যবহার করে বের করো।

---

## 4.2: Array অপারেশন ও তাদের Complexity

**কী শিখব**
- insert, delete, search-এর খরচ

**ধারণা**
কোথায় কাজ করছ তার উপর খরচ নির্ভর করে:

| অপারেশন | Complexity | কেন |
|---------|-----------|-----|
| Access `arr[i]` | O(1) | সরাসরি |
| Update `arr[i]=x` | O(1) | সরাসরি |
| Push (শেষে যোগ) | O(1) | কাউকে সরাতে হয় না |
| Pop (শেষে বাদ) | O(1) | কাউকে সরাতে হয় না |
| Unshift (শুরুতে যোগ) | O(n) | সবাইকে ডানে সরাতে হয় |
| Shift (শুরুতে বাদ) | O(n) | সবাইকে বামে সরাতে হয় |
| Search (মান খোঁজা) | O(n) | একটা একটা দেখতে হয় |
| Insert মাঝে | O(n) | পরের সবাইকে সরাতে হয় |

**কোড উদাহরণ**
```js
const arr = [10, 20, 30];

arr.push(40);       // [10,20,30,40], O(1)
arr.pop();          // [10,20,30], O(1)
arr.unshift(5);     // [5,10,20,30], O(n)
arr.shift();        // [10,20,30], O(n)

// মাঝে insert (index 1-এ 15 বসাই)
arr.splice(1, 0, 15); // [10,15,20,30], O(n)

// খোঁজা
console.log(arr.indexOf(20)); // 2, O(n)
console.log(arr.includes(99)); // false, O(n)
```

**ব্রেকডাউন**
- শুরুতে বা মাঝে কিছু করলে বাকিদের **সরাতে** হয়, তাই O(n)।
- শেষে করলে কাউকে সরাতে হয় না, তাই O(1)।
- `splice(start, deleteCount, ...items)` বহুমুখী: বাদ দেওয়া ও যোগ করা, দুটোই করে।

> **Animation Spec: Insert/Delete Shifting**
> - **দৃশ্য:** array box সারি; একটা "insert at index" নিয়ন্ত্রণ।
> - **ইনপুট:** index ও মান; অপারেশন নির্বাচন।
> - **ধাপ:** মাঝে insert করলে ডান পাশের সব box এক ঘর ডানে স্লাইড করবে (এই স্লাইডই O(n)); শেষে insert করলে কেউ সরবে না।
> - **লক্ষ্য:** "সরানোর খরচ"-ই complexity-র উৎস, এটা দেখা।

**অনুশীলন**
- কেন `push` O(1) কিন্তু `unshift` O(n), নিজের ভাষায় ব্যাখ্যা করো।

---

## 4.3: Array-তে ঘোরাঘুরি (Traversal ও Iteration)

**কী শিখব**
- array-এর উপর কার্যকরভাবে loop চালানো

**ধারণা**
DSA সমস্যার ৮০% array traversal দিয়ে শুরু হয়। কয়েকটা প্যাটার্ন জানা দরকার।

**কোড উদাহরণ**
```js
const arr = [5, 8, 2, 10, 1];

// ১) সাধারণ traversal
for (let i = 0; i < arr.length; i++) console.log(arr[i]);

// ২) দুই দিক থেকে (two pointer, section 16-এ কাজে লাগবে)
let left = 0, right = arr.length - 1;
while (left < right) {
  console.log(arr[left], arr[right]);
  left++; right--;
}

// ৩) সর্বোচ্চ ও সর্বনিম্ন এক pass-এ
let max = arr[0], min = arr[0];
for (const x of arr) {
  if (x > max) max = x;
  if (x < min) min = x;
}
console.log("max:", max, "min:", min); // max: 10 min: 1
```

**ব্রেকডাউন**
- একবার loop মানে O(n), বেশিরভাগ সমস্যার আদর্শ লক্ষ্য এটাই।
- two-pointer অনেক সমস্যা O(n²) থেকে O(n)-এ নামিয়ে আনে (পরে বিস্তারিত)।

**Complexity:** O(n), Space O(1)।

> **Animation Spec: Traversal Patterns**
> - **দৃশ্য:** array; একটা pointer (single) অথবা দুটো pointer (left/right)।
> - **ইনপুট:** pattern নির্বাচন (single / two-pointer); speed।
> - **ধাপ:** pointer সরবে, দেখা উপাদান রঙ বদলাবে; max/min আলাদা রঙে ট্র্যাক হবে।
> - **লক্ষ্য:** traversal প্যাটার্নগুলো ভিজ্যুয়ালি চেনা।

**অনুশীলন**
- এক pass-এ array-এর যোগফল ও সর্বোচ্চ, দুটোই বের করো।

---

## 4.4: 2D Arrays (Matrix / Grid)

**কী শিখব**
- সারি-কলামের গ্রিড, যা image, game, graph-এ লাগে

**ধারণা**
2D array হলো array-এর ভেতরে array, একটা টেবিল বা গ্রিড। `matrix[row][col]` দিয়ে অ্যাক্সেস করা যায়।

**কোড উদাহরণ**
```js
// 3×3 গ্রিড
const grid = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
];

console.log(grid[1][2]); // 6 (২য় সারি, ৩য় কলাম)

// প্রতিটা ঘরে ঘোরা
for (let r = 0; r < grid.length; r++) {
  let line = "";
  for (let c = 0; c < grid[r].length; c++) {
    line += grid[r][c] + " ";
  }
  console.log(line);
}

// খালি m×n গ্রিড বানানো (সব 0)
const rows = 2, cols = 3;
const empty = Array.from({ length: rows }, () => Array(cols).fill(0));
console.log(empty); // [ [0, 0, 0], [0, 0, 0] ]
```

**ব্রেকডাউন**
- `grid[row][col]` অর্থাৎ আগে সারি, পরে কলাম।
- নেস্টেড loop অর্থাৎ m×n ঘর, তাই **O(m·n)**।
- `Array.from({ length }, () => Array(cols).fill(0))` হলো নিরাপদভাবে খালি গ্রিড বানানোর নিয়ম (একই array শেয়ার এড়াতে)।

**Complexity:** পুরো গ্রিড ঘুরলে O(m·n)।

> **Animation Spec: Grid Walker**
> - **দৃশ্য:** m×n রঙিন গ্রিড; একটা কমলা highlight ঘর ঘর সরে।
> - **ইনপুট:** rows, cols; traversal order (row-wise / column-wise)।
> - **ধাপ:** নির্বাচিত ক্রমে ঘর highlight হবে, visited ঘর হালকা রঙে।
> - **লক্ষ্য:** 2D indexing ও O(m·n) বোঝা; পরে island/graph সমস্যায় কাজে দেবে।

**অনুশীলন**
- একটা 3×3 grid-এর মূল কর্ণ (diagonal) উপাদানগুলোর যোগফল বের করো।

---

## 4.5: Strings (character-এর array)

**কী শিখব**
- String অপারেশন ও অপরিবর্তনীয়তা (immutability)

**ধারণা**
String হলো character-এর ক্রম। JavaScript-এ string **immutable**, একবার বানালে ভেতরের character বদলানো যায় না; বদলাতে হলে নতুন string বানাতে হয়।

**কোড উদাহরণ**
```js
const s = "hello";

console.log(s[0]);          // "h"
console.log(s.length);      // 5
console.log(s.toUpperCase()); // "HELLO" (নতুন string)
console.log(s.slice(1, 4)); // "ell"
console.log(s.includes("ell")); // true

// string থেকে array, আবার array থেকে string (খুব দরকারি)
const arr = s.split("");    // ['h','e','l','l','o']
const back = arr.join("");  // "hello"

// string উল্টানো
const reversed = s.split("").reverse().join(""); // "olleh"
console.log(reversed);
```

**ব্রেকডাউন**
- `s[0]` পড়া যায়, কিন্তু `s[0] = "H"` কাজ করবে না (immutable)।
- বদলানোর কাজে: string থেকে array, তারপর পরিবর্তন, তারপর আবার array থেকে string।
- `split`/`join` জোড়া string সমস্যায় বারবার লাগবে।

**Complexity:** বেশিরভাগ string অপারেশন O(n) (n = দৈর্ঘ্য); concatenation-এ সাবধান, বারবার করলে O(n²) হতে পারে।

> **Animation Spec: String as Char Boxes**
> - **দৃশ্য:** প্রতিটা character আলাদা box-এ, নিচে index।
> - **ইনপুট:** string টাইপ; অপারেশন (reverse / slice / uppercase)।
> - **ধাপ:** reverse করলে box গুলো animation-এ জায়গা বদলাবে; immutable বোঝাতে "নতুন string তৈরি হচ্ছে" লেবেল।
> - **লক্ষ্য:** string = char array; পরিবর্তন = নতুন কপি।

**অনুশীলন**
- একটা string palindrome কিনা two-pointer দিয়ে চেক করো।

---

## Section সারাংশ

Array অর্থাৎ ধারাবাহিক index-ভিত্তিক তালিকা; access O(1), শুরুতে বা মাঝে insert/delete O(n)। 2D array অর্থাৎ গ্রিড, পুরোটা ঘুরলে O(m·n)। String অর্থাৎ immutable char array; বদলাতে split/join। Two-pointer ও single-pass প্যাটার্ন এখানেই শুরু।

**পরবর্তী:** [05: Linked Lists](05-linked-lists.md)
