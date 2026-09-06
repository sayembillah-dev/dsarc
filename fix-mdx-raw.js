// One-off fixer for MDX-breaking raw chars:
// 1) raw {...} spans outside code fences/inline backticks -> wrap in backticks
// 2) raw '<' followed by non-letter non-space (digit, '=', Bangla) -> '&lt;'
// 3) unquoted frontmatter title/description containing ': ' -> wrap in double quotes
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

let changedFiles = 0, braceFix = 0, ltFix = 0, yamlFix = 0;

for (const f of walk(root)) {
  const rel = path.relative(root, f);
  const lines = fs.readFileSync(f, 'utf8').split('\n');
  let inCode = false, dirty = false;

  for (let i = 0; i < lines.length; i++) {
    let l = lines[i];
    // frontmatter quoting (before fence tracking; frontmatter is at top)
    if (i > 0 && lines[0] === '---' && lines.slice(1, i).indexOf('---') === -1) {
      const m = l.match(/^(title|description):\s*(.*)$/);
      if (m && /:\s/.test(m[2]) && !/^["']/.test(m[2])) {
        lines[i] = m[1] + ': "' + m[2].replace(/"/g, "'") + '"';
        yamlFix++; dirty = true;
      }
      continue;
    }
    if (/^```/.test(l)) { inCode = !inCode; continue; }
    if (inCode) continue;

    let out = '', inTick = false, j = 0, lineDirty = false;
    while (j < l.length) {
      const ch = l[j];
      if (ch === '`') { inTick = !inTick; out += ch; j++; continue; }
      if (!inTick && ch === '{') {
        const close = l.indexOf('}', j);
        if (close !== -1) { out += '`' + l.slice(j, close + 1) + '`'; j = close + 1; braceFix++; lineDirty = true; continue; }
      }
      if (!inTick && ch === '<' && j + 1 < l.length && !/[a-zA-Z\s/!]/.test(l[j + 1])) {
        out += '&lt;'; j++; ltFix++; lineDirty = true; continue;
      }
      out += ch; j++;
    }
    if (lineDirty) { lines[i] = out; dirty = true; }
  }

  if (dirty) { fs.writeFileSync(f, lines.join('\n'), 'utf8'); changedFiles++; console.log('fixed: ' + rel); }
}
console.log('---');
console.log('files: ' + changedFiles + ', braces: ' + braceFix + ', lt: ' + ltFix + ', yaml: ' + yamlFix);
