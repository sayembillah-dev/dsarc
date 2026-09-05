# ০১ — JavaScript Fundamentals

DSA শেখার আগে ভাষাটা ভালোভাবে জানা দরকার। এই section-এ আমরা JavaScript-এর সেই অংশগুলো শিখব যেগুলো DSA-তে বারবার লাগবে। প্রোগ্রামিং একদম নতুন হলেও চিন্তা নেই — একদম গোড়া থেকে শুরু করছি।

> **Section Roadmap:** Pick a Language → Syntax → Variables & Types → Operators → Control Structures → Loops → Functions → Arrays & Objects → OOP Basics → Pseudo Code

---

## 1.1 — কেন JavaScript? (Pick a Language)

**🎯 কী শিখব**
- কেন DSA শেখার জন্য JavaScript ভালো পছন্দ
- কোথায় কোড চালানো যায়

**💡 ধারণা**
Data Structure ও Algorithm হলো *ধারণা* (concept) — এগুলো যেকোনো ভাষায় শেখা যায় (C++, Java, Python, JavaScript)। ছবির roadmap-এ অনেকগুলো ভাষার অপশন আছে। আমরা বেছে নিয়েছি **JavaScript**, কারণ:

- **শেখা সহজ** — syntax সরল, দ্রুত শুরু করা যায়
- **কোথাও ইনস্টল ছাড়াই চলে** — ব্রাউজারের console-এই টেস্ট করা যায়
- **web development-এ সরাসরি কাজে লাগে** — বাংলাদেশে চাকরির বাজারে চাহিদা বেশি
- **আমাদের ভবিষ্যৎ interactive web app-ও JavaScript-এই বানানো হবে**

**💻 কোড উদাহরণ**
```js
// তোমার প্রথম প্রোগ্রাম
console.log("আসসালামু আলাইকুম, DSA শুরু করছি!");
```

**🔍 কোড ব্রেকডাউন**
- `console.log(...)` → স্ক্রিনে (console-এ) কিছু ছাপায়। এটা তোমার সবচেয়ে বড় বন্ধু হবে — কোড কী করছে দেখার জন্য।
- `"..."` → double quote-এর ভেতরে যা থাকে সেটা **string** (লেখা/টেক্সট)।

**⏱️ Complexity** — প্রযোজ্য নয় (এটা শুধু ভাষা পরিচিতি)।

> **🎬 Animation Spec: Code → Output**
> - **দৃশ্য:** বাঁয়ে code editor, ডানে console output প্যানেল।
> - **ইনপুট:** ইউজার `console.log()`-এর ভেতরের text এডিট করতে পারবে।
> - **ধাপ:** "Run" চাপলে code লাইন highlight হয়ে ডান পাশে output টাইপরাইটার-স্টাইলে দেখা যাবে।
> - **লক্ষ্য:** code লিখলে output আসে — এই cause-effect বোঝা।

**📝 অনুশীলন**
- নিজের নাম console-এ ছাপাও।
- দুটো আলাদা `console.log` লিখে দেখো ক্রম বজায় থাকে কিনা।

---

## 1.2 — Variables ও Data Types

**🎯 কী শিখব**
- ডেটা কোথায় জমা রাখব (`let`, `const`)
- প্রধান data type গুলো

**💡 ধারণা**
**Variable** হলো একটা নামওয়ালা box, যেখানে ডেটা জমা রাখা যায়। পরে সেই নাম দিয়ে ডেটা ফেরত পাওয়া যায়।

- `const` → এমন box যার মান একবার দিলে আর বদলাবে না (constant)
- `let` → এমন box যার মান পরে বদলানো যায়

**প্রধান Data Type:**

| Type | উদাহরণ | মানে |
|------|--------|------|
| Number | `42`, `3.14` | সংখ্যা |
| String | `"hello"` | লেখা |
| Boolean | `true`, `false` | হ্যাঁ/না |
| null | `null` | ইচ্ছাকৃত খালি |
| undefined | `undefined` | মান দেওয়া হয়নি |
| Object | `{ }` | key-value জোড়া |
| Array | `[ ]` | তালিকা |

**💻 কোড উদাহরণ**
```js
const name = "Rahim";      // string — বদলাবে না
let age = 20;              // number — বদলাতে পারে
age = 21;                 // ঠিক আছে, let বলে বদলানো গেল

const isStudent = true;    // boolean
const marks = [80, 75, 90]; // array (তালিকা)
const student = { name: "Rahim", age: 21 }; // object

console.log(typeof name);   // "string"
console.log(typeof age);    // "number"
console.log(typeof marks);  // "object" (array-ও object)
```

**🔍 কোড ব্রেকডাউন**
- `const name = "Rahim"` → `name` box-এ "Rahim" রাখলাম, আর বদলাবে না।
- `let age = 20; age = 21;` → `let` বলে মান বদলানো গেল।
- `typeof x` → x-এর টাইপ কী তা বলে দেয়।

**⏱️ Complexity** — variable-এ মান রাখা/পড়া O(1)।

> **🎬 Animation Spec: Variable Boxes**
> - **দৃশ্য:** কয়েকটা লেবেলযুক্ত box (name, age...)। প্রতিটার ভেতরে বর্তমান মান।
> - **ইনপুট:** ইউজার মান টাইপ করে box-এ "assign" করতে পারবে।
> - **ধাপ:** assign করলে মান box-এ উড়ে ঢুকবে; `const` box-এ বদলাতে চাইলে লাল "❌ locked" দেখাবে।
> - **লক্ষ্য:** `const` vs `let`-এর পার্থক্য এবং variable = named box ধারণা।

**📝 অনুশীলন**
- একটা `const` দিয়ে তোমার জন্মসাল রাখো, `let` দিয়ে বয়স রাখো।

---

## 1.3 — Operators (অপারেটর)

**🎯 কী শিখব**
- গণিত, তুলনা, ও লজিক অপারেটর

**💡 ধারণা**
Operator দিয়ে মানের উপর কাজ করা হয়।

- **Arithmetic:** `+ - * / %` (`%` = ভাগশেষ/modulo)
- **Comparison:** `=== !== > < >= <=` (ফলাফল boolean)
- **Logical:** `&&` (AND), `||` (OR), `!` (NOT)

> ⚠️ সবসময় `===` ব্যবহার করবে, `==` নয়। `===` টাইপসহ মিলিয়ে দেখে (strict), তাই ভুল কম হয়।

**💻 কোড উদাহরণ**
```js
console.log(10 + 3);   // 13
console.log(10 % 3);   // 1  (10 ÷ 3-এর ভাগশেষ)
console.log(10 === 10);// true
console.log(5 > 3 && 2 < 1); // false (AND: দুটোই true হতে হবে)
console.log(5 > 3 || 2 < 1); // true  (OR: একটা true হলেই চলে)
console.log(!true);    // false (NOT: উল্টে দেয়)
```

**🔍 কোড ব্রেকডাউন**
- `%` (modulo) → জোড়/বিজোড় বের করতে খুব কাজে লাগে: `n % 2 === 0` মানে জোড়।
- `&&` → দুই দিকই true হলে true।
- `||` → যেকোনো একদিক true হলেই true।

**⏱️ Complexity** — O(1)।

> **🎬 Animation Spec: Truth Table Explorer**
> - **দৃশ্য:** দুটো toggle switch (A, B) আর তিনটা bulb (`A && B`, `A || B`, `!A`)।
> - **ইনপুট:** A ও B on/off করা।
> - **ধাপ:** switch বদলালে bulb জ্বলবে/নিভবে অনুযায়ী।
> - **লক্ষ্য:** AND/OR/NOT-এর আচরণ হাতে-কলমে বোঝা।

**📝 অনুশীলন**
- একটা সংখ্যা জোড় কিনা `%` দিয়ে চেক করো।

---

## 1.4 — Control Structures (if / else / switch)

**🎯 কী শিখব**
- শর্ত অনুযায়ী সিদ্ধান্ত নেওয়া

**💡 ধারণা**
প্রোগ্রামকে "যদি এমন হয়, তাহলে এটা করো" শেখাতে হয় **conditional** দিয়ে। এটা DSA-তে অসংখ্যবার লাগবে (যেমন: "যদি target পেয়ে যাই, থেমে যাও")।

**💻 কোড উদাহরণ**
```js
const marks = 75;

if (marks >= 80) {
  console.log("A+ গ্রেড");
} else if (marks >= 60) {
  console.log("A গ্রেড");        // এটা ছাপাবে
} else {
  console.log("আরও চেষ্টা করো");
}

// switch — একই মানের অনেক case-এর জন্য পরিষ্কার
const day = 3;
switch (day) {
  case 1: console.log("শনিবার"); break;
  case 3: console.log("সোমবার"); break; // এটা ছাপাবে
  default: console.log("অন্য দিন");
}
```

**🔍 কোড ব্রেকডাউন**
- `if` → শর্ত true হলে ভেতরের block চলে।
- `else if` → আগের শর্ত false হলে পরের শর্ত দেখে।
- `else` → কোনোটাই না মিললে এটা চলে।
- `switch/case` → একই variable-এর অনেকগুলো নির্দিষ্ট মান চেক করতে সুবিধাজনক। `break` না দিলে পরের case-ও চলে যায় (fall-through)।

**⏱️ Complexity** — O(1) (শর্ত সংখ্যা নির্দিষ্ট হলে)।

> **🎬 Animation Spec: Decision Flow**
> - **দৃশ্য:** flowchart — diamond (শর্ত) থেকে দুটো তীর (true/false)।
> - **ইনপুট:** `marks`-এর মান slider দিয়ে বদলানো।
> - **ধাপ:** মান বদলালে কোন path আলোকিত হচ্ছে ও কোন output আসছে দেখা যাবে।
> - **লক্ষ্য:** শর্ত অনুযায়ী নিয়ন্ত্রণ কোন পথে যায় তা দেখা।

**📝 অনুশীলন**
- একটা সংখ্যা positive, negative না zero — if/else দিয়ে বলো।

---

## 1.5 — Loops (পুনরাবৃত্তি)

**🎯 কী শিখব**
- একই কাজ বারবার করা: `for`, `while`, `for...of`

**💡 ধারণা**
Loop DSA-র প্রাণ। array-এর প্রতিটা উপাদানে যেতে, বারবার তুলনা করতে — সব জায়গায় loop লাগে।

**💻 কোড উদাহরণ**
```js
// ১) সাধারণ for loop — index দরকার হলে
for (let i = 0; i < 5; i++) {
  console.log("i =", i); // 0,1,2,3,4
}

// ২) for...of — array-এর মান সরাসরি চাই
const fruits = ["আম", "জাম", "কাঁঠাল"];
for (const fruit of fruits) {
  console.log(fruit);
}

// ৩) while — কতবার চলবে আগে জানা নেই
let n = 8;
while (n > 1) {
  n = Math.floor(n / 2); // অর্ধেক করতে থাকি
  console.log(n);        // 4, 2, 1
}
```

**🔍 কোড ব্রেকডাউন**
- `for (let i = 0; i < 5; i++)` → শুরু (`i=0`), শর্ত (`i<5`), প্রতিবার শেষে (`i++` মানে `i` এক বাড়ে)।
- `for...of` → প্রতিটা মান একবার করে দেয়, index লাগে না।
- `while` → শর্ত true থাকা পর্যন্ত চলে। শর্ত কখনো false না হলে **infinite loop** হবে — সাবধান!

**⏱️ Complexity** — `n` বার চললে O(n)। loop-এর ভেতর loop হলে O(n²)।

> **🎬 Animation Spec: Loop Tracer**
> - **দৃশ্য:** array-এর উপরে একটা কমলা pointer, পাশে `i`-এর মান, নিচে execution counter।
> - **ইনপুট:** array size, loop type (for / while) নির্বাচন।
> - **ধাপ:** প্রতিটা iteration-এ pointer এক ঘর সরবে, counter বাড়বে; কতবার চলল গোনা হবে।
> - **লক্ষ্য:** loop কতবার চলে → complexity-র সাথে সংযোগ তৈরি।

**📝 অনুশীলন**
- ১ থেকে ১০০ পর্যন্ত সব জোড় সংখ্যার যোগফল বের করো।

---

## 1.6 — Functions

**🎯 কী শিখব**
- কোড পুনর্ব্যবহারযোগ্য করা, parameter ও return

**💡 ধারণা**
Function হলো নাম দেওয়া কোডের একটা প্যাকেট। একবার লিখে বারবার ব্যবহার করা যায়। DSA-তে প্রতিটা অ্যালগরিদম আমরা function হিসেবে লিখব।

**💻 কোড উদাহরণ**
```js
// declaration
function add(a, b) {
  return a + b;   // ফলাফল ফেরত পাঠায়
}

// arrow function (আধুনিক, সংক্ষিপ্ত)
const multiply = (a, b) => a * b;

console.log(add(3, 4));       // 7
console.log(multiply(3, 4));  // 12

// default parameter
function greet(name = "বন্ধু") {
  return `হ্যালো, ${name}!`;
}
console.log(greet());        // হ্যালো, বন্ধু!
console.log(greet("Karim")); // হ্যালো, Karim!
```

**🔍 কোড ব্রেকডাউন**
- `function add(a, b)` → `a`, `b` হলো **parameter** (input)।
- `return` → ফলাফল ফেরত দেয়; `return`-এর পরের কোড আর চলে না।
- Arrow function `(a,b) => a*b` → এক লাইনের হলে `{}` আর `return` লাগে না।
- `` `হ্যালো, ${name}!` `` → **template literal**, backtick-এর ভেতরে `${}` দিয়ে variable বসানো যায়।

**⏱️ Complexity** — function-এর ভেতরের কাজের উপর নির্ভর করে।

> **🎬 Animation Spec: Function Machine**
> - **দৃশ্য:** একটা "মেশিন" box; বাঁয়ে input ঢোকে, ভেতরে প্রসেস হয়, ডানে output বের হয়।
> - **ইনপুট:** ইউজার parameter মান দেবে।
> - **ধাপ:** input মেশিনে ঢুকবে → ভেতরে গণনা highlight → return মান বেরিয়ে আসবে।
> - **লক্ষ্য:** input → process → output ধারণা।

**📝 অনুশীলন**
- এমন function লেখো যা দুটো সংখ্যার মধ্যে বড়টা return করে।

---

## 1.7 — Arrays ও Objects (গভীরে)

**🎯 কী শিখব**
- Array ও Object-এর মূল অপারেশন (DSA-র বেসিক building block)

**💡 ধারণা**
- **Array** → ক্রমানুসারে সাজানো তালিকা, index দিয়ে অ্যাক্সেস (`arr[0]`)।
- **Object** → key দিয়ে মান খোঁজা যায় (`student.name`)।

**💻 কোড উদাহরণ**
```js
const nums = [10, 20, 30];
console.log(nums[0]);      // 10 (প্রথম index 0)
console.log(nums.length);  // 3

nums.push(40);   // শেষে যোগ → [10,20,30,40]
nums.pop();      // শেষেরটা বাদ → [10,20,30]
nums.unshift(5); // শুরুতে যোগ → [5,10,20,30]
nums.shift();    // শুরুরটা বাদ → [10,20,30]

// ঘুরে ঘুরে কাজ (খুব দরকারি)
const doubled = nums.map(x => x * 2);        // [20,40,60]
const bigs = nums.filter(x => x > 15);       // [20,30]
const total = nums.reduce((sum, x) => sum + x, 0); // 60

// Object
const student = { name: "Rahim", roll: 5 };
console.log(student.name);   // Rahim
student.dept = "CSE";        // নতুন key যোগ
```

**🔍 কোড ব্রেকডাউন**
- `push/pop` → শেষ প্রান্তে যোগ/বাদ (O(1))।
- `unshift/shift` → শুরুতে যোগ/বাদ (O(n), কারণ সবাইকে সরাতে হয়)।
- `map` → প্রতিটা মান রূপান্তর করে নতুন array।
- `filter` → শর্ত মেলে এমন মান নিয়ে নতুন array।
- `reduce` → সব মান মিলিয়ে একটা ফলাফল (যেমন যোগফল)।

**⏱️ Complexity** — index access O(1); `map/filter/reduce` O(n)।

> **🎬 Animation Spec: Array Ops Playground**
> - **দৃশ্য:** একসারি box (array), index লেখা নিচে।
> - **ইনপুট:** push/pop/shift/unshift বাটন, মান টাইপ করার ঘর।
> - **ধাপ:** push হলে ডান পাশে box স্লাইড করে ঢুকবে; shift হলে বাম box বেরিয়ে বাকিরা এক ঘর সরবে (এই "সরানো"-ই O(n))।
> - **লক্ষ্য:** কেন শুরুতে যোগ/বাদ ব্যয়বহুল তা দেখা।

**📝 অনুশীলন**
- একটা array থেকে শুধু জোড় সংখ্যা `filter` দিয়ে বের করো।

---

## 1.8 — OOP Basics (Class, Object)

**🎯 কী শিখব**
- `class` দিয়ে নিজের data structure বানানোর ভিত্তি

**💡 ধারণা**
আমরা Linked List, Stack, Tree ইত্যাদি **class** দিয়ে বানাব। Class হলো একটা "blueprint" (নকশা), আর object হলো সেই নকশা থেকে বানানো জিনিস।

**💻 কোড উদাহরণ**
```js
class Student {
  constructor(name, roll) {   // object বানানোর সময় চলে
    this.name = name;         // this = এই object
    this.roll = roll;
  }

  introduce() {               // method (object-এর কাজ)
    return `আমি ${this.name}, roll ${this.roll}`;
  }
}

const s1 = new Student("Rahim", 5); // new দিয়ে object তৈরি
console.log(s1.introduce());        // আমি Rahim, roll 5
console.log(s1.name);               // Rahim
```

**🔍 কোড ব্রেকডাউন**
- `class Student` → blueprint সংজ্ঞা।
- `constructor` → `new Student(...)` করলে এটাই প্রথমে চলে, initial মান সেট করে।
- `this` → বর্তমান object-কে বোঝায়।
- `method` → object-এর ভেতরের function (যেমন `introduce`)।
- `new` → blueprint থেকে বাস্তব object বানায়।

**⏱️ Complexity** — object তৈরি O(1)।

> **🎬 Animation Spec: Class Blueprint → Objects**
> - **দৃশ্য:** বাঁয়ে একটা "blueprint" কার্ড; ডানে `new` চাপলে বাস্তব object কার্ড তৈরি হয়।
> - **ইনপুট:** name, roll ফিল্ড; "Create Object" বাটন।
> - **ধাপ:** blueprint থেকে তীর গিয়ে নতুন object কার্ড বানাবে, তার মান পূরণ হবে।
> - **লক্ষ্য:** class (নকশা) vs object (বাস্তব জিনিস) পার্থক্য।

**📝 অনুশীলন**
- একটা `Rectangle` class বানাও যার `area()` method আছে।

---

## 1.9 — Pseudo Code (ছদ্মকোড)

**🎯 কী শিখব**
- কোড লেখার আগে ভাষা-নিরপেক্ষ চিন্তা করা

**💡 ধারণা**
Pseudo code হলো "কোড আর ইংরেজি/বাংলার মাঝামাঝি" — কোনো ভাষার syntax ছাড়া শুধু ধাপগুলো লেখা। DSA-তে সমাধান আগে pseudo code-এ ভাবলে বাস্তব কোড লেখা সহজ হয়।

**💻 উদাহরণ (কোড নয়, চিন্তা)**
```text
FUNCTION findMax(list):
    max = list-এর প্রথম উপাদান
    FOR list-এর প্রতিটা উপাদান x:
        IF x > max:
            max = x
    RETURN max
```

এখন এটাকে JavaScript-এ রূপ দিই:
```js
function findMax(list) {
  let max = list[0];
  for (const x of list) {
    if (x > max) max = x;
  }
  return max;
}
console.log(findMax([3, 9, 2, 7])); // 9
```

**🔍 ব্রেকডাউন**
- pseudo code-এ syntax নিয়ে চিন্তা নেই, শুধু **যুক্তি**।
- একই pseudo code যেকোনো ভাষায় (C++, Python) রূপ দেওয়া যায়।

> **🎬 Animation Spec: Pseudo → Real Code**
> - **দৃশ্য:** বাঁয়ে pseudo code, ডানে JavaScript; লাইন-ম্যাপিং তীর।
> - **ইনপুট:** ভাষা বদলানোর dropdown (JS / Python view)।
> - **ধাপ:** pseudo-র প্রতিটা লাইন hover করলে সংশ্লিষ্ট real-code লাইন highlight।
> - **লক্ষ্য:** যুক্তি এক, শুধু ভাষা আলাদা — এটা বোঝা।

**📝 অনুশীলন**
- "একটা array উল্টো করা"-র pseudo code লেখো, তারপর JS-এ রূপ দাও।

---

## ✅ Section সারাংশ

এই section-এ শিখলে: variable, type, operator, condition, loop, function, array/object, class, pseudo code। এগুলোই সব DSA-র ভিত্তি।

**পরবর্তী:** [02 — Introduction to DSA](02-introduction-to-dsa.md) →
