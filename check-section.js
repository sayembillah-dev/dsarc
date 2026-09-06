// Usage: node check-section.js <section-name>
// Checks: em-dash/en-dash/FFFD, relative links end .mdx + exist, frontmatter colon quoting, skeleton completeness.
const fs = require('fs');
const path = require('path');
const EM = String.fromCharCode(0x2014);
const EN = String.fromCharCode(0x2013);
const FFFD = String.fromCharCode(0xFFFD);
const section = process.argv[2];
if (!section) { console.log('usage: node check-section.js <section>'); process.exit(1); }
const dir = path.join(__dirname, 'content', 'docs', section);
const files = fs.readdirSync(dir).filter(f => f.endsWith('.mdx'));
const problems = [];
const need = ['কী শিখব', 'ধারণা', 'ধাপে ধাপে', 'কোড', 'ভ্যারিয়েন্ট', 'কোড ব্রেকডাউন', 'Complexity', 'সাধারণ ভুল আর edge case', 'অনুশীলন', 'সারসংক্ষেপ'];
for (const f of files) {
  const txt = fs.readFileSync(path.join(dir, f), 'utf8');
  for (const [name, ch] of [['em-dash', EM], ['en-dash', EN], ['fffd', FFFD]]) {
    const i = txt.indexOf(ch);
    if (i !== -1) problems.push(`${f}: ${name} at char ${i}`);
  }
  const links = [...txt.matchAll(/\]\(([^)]+)\)/g)].map(m => m[1]);
  for (const l of links) {
    if (l.startsWith('http') || l.startsWith('#') || l.startsWith('/docs/')) continue;
    if (!l.endsWith('.mdx')) { problems.push(`${f}: link missing .mdx -> ${l}`); continue; }
    if (!fs.existsSync(path.normalize(path.join(dir, l)))) problems.push(`${f}: BROKEN -> ${l}`);
  }
  const fm = txt.split('---')[1] || '';
  for (const line of fm.split('\n')) {
    const m = line.match(/^(title|description):\s*(.+)$/);
    if (m && m[2].includes(':') && !/^["'].*["']$/.test(m[2].trim())) problems.push(`${f}: unquoted colon in frontmatter: ${line.trim()}`);
  }
  if (f !== 'index.mdx') {
    const heads = [...txt.matchAll(/^## .+$/gm)].map(m => m[0].slice(3));
    const mistakes = (txt.match(/\*\*[১২৩৪৫০-৯]+\./g) || []).length;
    const tiers = ['সহজ ১', 'সহজ ২', 'মাঝারি ১', 'মাঝারি ২', 'কঠিন'].filter(x => txt.includes(x)).length;
    const missing = need.filter(h => !heads.some(x => x.startsWith(h)));
    if (mistakes < 5) problems.push(`${f}: only ${mistakes} mistakes`);
    if (tiers < 5) problems.push(`${f}: only ${tiers}/5 practice tiers`);
    if (missing.length) problems.push(`${f}: missing headings: ${missing.join(', ')}`);
  }
}
console.log(files.map(f => `${f}: ${fs.readFileSync(path.join(dir, f), 'utf8').split('\n').length}`).join('\n'));
console.log(problems.length ? '\nPROBLEMS:\n' + problems.join('\n') : '\nALL CLEAN');
