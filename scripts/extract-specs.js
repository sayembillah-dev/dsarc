// Extract every "Animation Spec" blockquote from content/docs MDX pages.
// Usage: node scripts/extract-specs.js [section-folder]
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', 'content', 'docs');
const only = process.argv[2];

const sections = fs
  .readdirSync(root, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .filter((n) => !only || n === only);

let count = 0;
for (const section of sections) {
  const dir = path.join(root, section);
  const pages = fs.readdirSync(dir).filter((f) => f.endsWith('.mdx') && f !== 'index.mdx');
  for (const page of pages) {
    const text = fs.readFileSync(path.join(dir, page), 'utf8');
    const idx = text.indexOf('Animation Spec');
    if (idx < 0) continue;
    // Rewind to start of the line so the leading '>' is kept.
    const lineStart = text.lastIndexOf('\n', idx) + 1;
    const lines = text.slice(lineStart).split('\n');
    const out = [];
    for (const line of lines) {
      const t = line.trim();
      if (out.length > 0 && !t.startsWith('>')) break;
      out.push(line);
    }
    count++;
    console.log(`### ${section}/${page}`);
    console.log(out.join('\n').trim());
    console.log();
  }
}
console.error(`total specs: ${count}`);
