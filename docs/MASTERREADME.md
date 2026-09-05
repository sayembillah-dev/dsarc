# A-Z Data Structures & Algorithms - বাংলায় (JavaScript দিয়ে)

> **একদম শূন্য থেকে এক্সপার্ট** - JavaScript-এর বেসিক থেকে শুরু করে Advanced DSA পর্যন্ত, সম্পূর্ণ বাংলায়, বাংলাদেশি শিক্ষার্থীদের জন্য তৈরি।

এই কোর্সটা এমনভাবে সাজানো যাতে তুমি প্রোগ্রামিং-এ একদম নতুন হলেও ধাপে ধাপে শিখে DSA-তে দক্ষ হয়ে উঠতে পারো। প্রতিটা টপিকে আছে সহজ ভাষায় ব্যাখ্যা, চলমান (runnable) JavaScript কোড, লাইন-বাই-লাইন ব্রেকডাউন, complexity বিশ্লেষণ, এবং একটা **Animation Spec** - যেটা দিয়ে ভবিষ্যতে interactive web app-এ ভিজ্যুয়াল অ্যানিমেশন বানানো যাবে।

---

## এই কোর্স কাদের জন্য

- যারা প্রোগ্রামিং-এ একদম নতুন এবং JavaScript দিয়ে শুরু করতে চায়
- যারা DSA শিখে ভালো software developer হতে চায়
- যারা interview / competitive programming-এর প্রস্তুতি নিচ্ছে
- যারা বাংলায় গুছানো, ধারাবাহিক একটা রিসোর্স খুঁজছে

---

## কোর্সের কাঠামো (Curriculum)

প্রতিটা **Section = একটি Markdown ফাইল** (`content/` ফোল্ডারে)। প্রতিটা ফাইলের ভেতরে থাকে একাধিক **Subsection**।

| # | Section | কী শিখবে |
|---|---------|----------|
| 00 | [কোর্স গাইড](00-how-to-use.md) | কীভাবে পড়বে, কনভেনশন, Animation Spec ফরম্যাট |
| 01 | [JavaScript Fundamentals](01-javascript-fundamentals.md) | ভাষার বেসিক, syntax, functions, OOP |
| 02 | [Introduction to DSA](02-introduction-to-dsa.md) | Data Structure কী, কেন দরকার |
| 03 | [Algorithmic Complexity (Big-O)](03-algorithmic-complexity.md) | Time/Space complexity, asymptotic notation |
| 04 | [Arrays & Strings](04-arrays-and-strings.md) | Array, string, প্রয়োজনীয় অপারেশন |
| 05 | [Linked Lists](05-linked-lists.md) | Singly, Doubly, Circular linked list |
| 06 | [Stacks & Queues](06-stacks-and-queues.md) | Stack, Queue, Deque, Priority Queue |
| 07 | [Hash Tables](07-hash-tables.md) | Hashing, collision, Map/Set |
| 08 | [Recursion](08-recursion.md) | Recursion, backtracking-এর ভিত্তি |
| 09 | [Sorting Algorithms](09-sorting-algorithms.md) | Bubble, Merge, Quick, Heap sort সহ সব |
| 10 | [Searching Algorithms](10-searching-algorithms.md) | Linear & Binary search |
| 11 | [Tree Data Structures](11-tree-data-structures.md) | Binary Tree, BST, AVL, B-Tree, traversal |
| 12 | [Heaps & Priority Queues](12-heaps-and-priority-queues.md) | Min/Max heap, heapify |
| 13 | [Graph Data Structures](13-graph-data-structures.md) | BFS, DFS, Dijkstra, MST |
| 14 | [Advanced Data Structures](14-advanced-data-structures.md) | Trie, Segment Tree, Fenwick, DSU, Suffix |
| 15 | [Complex & Disk-based Structures](15-complex-data-structures.md) | 2-3 Tree, B+ Tree, Skip List, Indexing |
| 16 | [Problem Solving Techniques](16-problem-solving-techniques.md) | Two Pointer, Sliding Window, DP, Greedy সহ সব প্যাটার্ন |
| 17 | [Practice & Roadmap to Expertise](17-practice-and-roadmap.md) | LeetCode, অনুশীলন, expert হওয়ার পথ |

> **নোট:** roadmap.sh-এর ছবিতে **Recursion** ছিল "Problem Solving"-এর ভেতরে। কিন্তু শেখার সুবিধার জন্য আমরা এটাকে আগে (Section 08) আলাদা করে রেখেছি, কারণ Merge Sort, Quick Sort, Tree, Graph - সবকিছুতেই recursion লাগে।

---

##  শেখার পথ (Learning Path)

```
Beginner        JS Fundamentals -> Intro to DSA -> Big-O
   |
Core Structures Arrays -> Linked Lists -> Stacks/Queues -> Hash Tables
   |
Core Algorithms Recursion -> Sorting -> Searching
   |
Hierarchical    Trees -> Heaps -> Graphs
   |
Advanced        Trie/Segment/Fenwick/DSU -> Complex/Disk structures
   |
Mastery         Problem Solving Patterns -> Practice -> Interview Ready
```

---

## Animation Spec কী?

ভবিষ্যতে এই কোর্স একটা **interactive web app** হবে (course + documentation স্টাইল)। প্রতিটা subsection-এ একটা **Animation Spec** ব্লক আছে, যেটা ফ্রন্টএন্ড ডেভেলপারকে বলে দেয়:

- **কী দেখানো হবে** (visual)
- **ইউজার কী কী ইনপুট পাল্টাতে পারবে** (configurable inputs)
- **অ্যানিমেশনের ধাপগুলো কী** (steps/states)
- **শিক্ষার্থী কী বুঝবে** (learning goal)

বিস্তারিত ফরম্যাট দেখো: [00-how-to-use.md](00-how-to-use.md)

---

## প্রতিটা Subsection-এ যা থাকবে

1. **কী শিখব** - এক নজরে লক্ষ্য
2. **ধারণা** - সহজ বাংলায় ব্যাখ্যা + বাস্তব উদাহরণ
3. **কোড উদাহরণ** - চলমান JavaScript
4. **কোড ব্রেকডাউন** - লাইন-বাই-লাইন
5. **Complexity** - Time ও Space
6. **Animation Spec** - ভিজ্যুয়ালাইজেশনের ব্লুপ্রিন্ট
7. **অনুশীলন** - প্র্যাকটিস সমস্যা

---

##  কীভাবে কোড চালাবে

- ব্রাউজারের **Console** (F12 -> Console) - দ্রুত টেস্টের জন্য
- **Node.js** ইনস্টল করে `.js` ফাইল রান: `node file.js`
- অনলাইন: [replit.com](https://replit.com), [codesandbox.io](https://codesandbox.io)

---

*License: শিক্ষামূলক ব্যবহারের জন্য উন্মুক্ত।*
