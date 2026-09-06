// Static crawl: inspect prerendered HTML in .next/server/app/docs for unresolved hrefs.
// A page existing here means it prerendered successfully (equiv. 200). Check href="./", "../", "*.mdx".
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '.next', 'server', 'app', 'docs');

function* walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (e.name.endsWith('.html')) yield p;
  }
}

let pages = 0, badPages = 0, rawCount = 0;
for (const f of walk(root)) {
  pages++;
  const html = fs.readFileSync(f, 'utf8');
  const raws = (html.match(/href="(\.\.?\/)[^"]*"/g) || []).concat(html.match(/href="[^"]*\.mdx"/g) || []);
  if (raws.length) {
    badPages++; rawCount += raws.length;
    console.log(path.relative(root, f) + ' RAW(' + raws.length + '): ' + raws.slice(0, 4).join(' , '));
  }
}
console.log('---');
console.log('pages: ' + pages + ', pagesWithRawHrefs: ' + badPages + ', rawHrefCount: ' + rawCount);
