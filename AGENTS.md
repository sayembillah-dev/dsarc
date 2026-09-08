<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Content Guidelines — READ BEFORE WRITING OR EDITING ANY DOCS CONTENT

These rules apply to everything under `content/docs/` (prose, code snippets, ASCII
diagrams, tables) and to every visualization/animation in `src/components/anim/`.

## 1. Examples and analogies must be technical

Every example, analogy, or motivating story must come from software / CS practice:
things a CSE student or developer actually touches every day — browser history and
the back button, undo/redo, the call stack, file systems and terminal commands
(`tree`, `du`, `rm -rf`, `grep -r`), the DOM, git (branches, merge-base), well-known
ports and services, databases (indexes, AUTO_INCREMENT ids), VS Code, dev servers.

NEVER use non-technical "real-world" analogies — no bazar lines, no plate stacks,
no family trees, no classroom queues, no "you went to the market and saw...".
If a concept can be motivated by a technical scenario, it MUST be.

Gold standard: `content/docs/stacks/stack-lifo.mdx` — the "বাস্তবে stack কোথায়
কোথায়" section (undo/redo, browser back button, call stack). Match that register.

## 2. Node values/labels must carry technical meaning

Never use throwaway labels like `A, B, C` or `1, 2, 3` as node values in trees,
graphs, heaps, or their code/animations. Values must be meaningful and tell one
coherent story across a chapter.

Running examples currently in use (reuse them, don't invent new ones):

- **Trees chapter structure/traversal pages** — this very repo's folder tree:
  `dsarc(src(app, components), content)` for 5-node demos, and the 8-node variant
  `dsarc(src(app(page.tsx), lib), content(docs(trees.mdx)))` for terminology.
  Files are leaves, folders are internal nodes.
- **BST / AVL pages** — well-known port numbers as keys, each with its service:
  22 SSH, 80 HTTP, 443 HTTPS, 2375 Docker, 3000 dev server, 5432 PostgreSQL,
  6379 Redis, 8080 proxy, 27017 MongoDB. BST demo tree:
  `6379(80(22, 3000(443, 5432)), 8080(·, 27017))`; search story: is 5432 open;
  insert story: open 2375. AVL story: services boot in sorted order 22 → 80 → 443,
  causing an RR break that a left rotation fixes.
- **LCA page** — folder tree (`modal.tsx` vs `blog` → LCA `dsarc`) framed as
  git merge-base / common directory of two paths.

## 3. Prose ↔ visual consistency

Animations must match the prose exactly: same values, same order, same colors the
text refers to. Captions follow the established style: step 0 orients the reader
and explains the color legend; every step states what visibly changed and why, in
full plain Bengali sentences.

## 4. Language

Prose is Bengali with English technical terms kept in English (existing site
register). Code, identifiers, and file names stay in English.
