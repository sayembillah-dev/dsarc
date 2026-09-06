// One-off scanner: find MDX-breaking raw chars outside code fences/inline backticks.
// Flags: raw '{' (expression attempt) and raw '<' immediately followed by non-space (JSX attempt).
// Also flags unquoted frontmatter title/description containing ': '.
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, 'content', 'docs');

function* walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (e.name.endsWith('.mdx')) yield p;
  }
}

let total = 0;
for (const f of walk(root)) {
  const rel = path.relative(root, f);
  const text = fs.readFileSync(f, 'utf8');
  const lines = text.split('\n');
  // frontmatter check
  if (lines[0] === '---') {
    for (let i = 1; i < lines.length && lines[i] !== '---'; i++) {
      const m = lines[i].match(/^(title|description):\s*(.*)$/);
      if (m) {
        const v = m[2];
        const quoted = (v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"));
        if (!quoted && /:\s/.test(v)) { console.log(rel + ' :' + (i + 1) + ' YAML unquoted colon -> ' + v.slice(0, 60)); total++; }
      }
    }
  }
  let inCode = false;
  lines.forEach((l, i) => {
    if (/^```/.test(l)) { inCode = !inCode; return; }
    if (inCode) return;
    // strip inline backtick spans
    const stripped = l.replace(/`[^`]*`/g, '');
    for (let c = 0; c < stripped.length; c++) {
      const ch = stripped[c];
      if (ch === '{') { console.log(rel + ' :' + (i + 1) + ' RAW { -> ' + l.trim().slice(0, 100)); total++; break; }
      if (ch === '<' && c + 1 < stripped.length && !/[\s|]/.test(stripped[c + 1]) && !/^<!--/.test(stripped.slice(c))) {
        // allow '<' at line start followed by space handled above; also allow html-ish closing like </ in comments? still flag
        console.log(rel + ' :' + (i + 1) + ' RAW <x -> ' + l.trim().slice(0, 100)); total++; break;
      }
    }
  });
}
console.log('---'); console.log('TOTAL: ' + total);
