import { readFileSync, readdirSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, posix, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const { marked } = await (process.argv[2]
  ? import(pathToFileURL(resolve(process.argv[2])).href)
  : import('marked'));

const root = fileURLToPath(new URL('../', import.meta.url));
const read = (file) => readFileSync(resolve(root, file), 'utf8').replace(/\r\n/g, '\n');
const write = (file, text) => {
  const path = resolve(root, file);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, text, 'utf8');
};
const relative = (from, to) => posix.relative(posix.dirname(from), to);
const escape = (value) => value.replace(/[&<>"]/g, (c) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;',
})[c]);
const listMarkdown = (dir) => readdirSync(resolve(root, dir))
  .filter((name) => name.endsWith('.md')).sort().map((name) => dir + '/' + name);

const topics = listMarkdown('wiki/topics');
const cards = listMarkdown('cards');
const pages = [...topics, ...cards, 'wiki/index.md', 'wiki/sources.md', 'wiki/log.md'];
const htmlPath = (file) => file.replace(/\.md$/, '.html');
const refPattern = /\[(S\d+), p\. (\d+)\]/g;
const anchors = new Map();
const publisher = {
  '10.3390/diagnostics15010036': 'https://www.mdpi.com/2075-4418/15/1/36',
  '10.3390/s19010038': 'https://www.mdpi.com/1424-8220/19/1/38',
  '10.3390/s21082727': 'https://www.mdpi.com/1424-8220/21/8/2727',
};

function renderRef(file, topic, id, page, anchor = '') {
  const url = topic
    ? relative(file, htmlPath(topic)) + '#' + anchor
    : relative(file, 'wiki/sources.html') + '#' + id;
  return '<a class="citation" href="' + escape(url) + '">[' + id + ', p. ' + page + ']</a>';
}

function topicMarkdown(file) {
  let section = '';
  const locations = new Map();
  const counts = new Map();
  anchors.set(file, locations);
  return read(file).split('\n').map((line) => {
    const heading = /^#{2,} (.+)$/.exec(line);
    if (heading) section = heading[1];
    return line.replace(refPattern, (_match, id, page) => {
      const key = id + ':' + page;
      const count = (counts.get(key) ?? 0) + 1;
      counts.set(key, count);
      const anchor = id + '-p' + page + '-' + count;
      const placements = locations.get(key) ?? [];
      placements.push({ section, anchor });
      locations.set(key, placements);
      return '<span id="' + anchor + '" class="ref-target">' +
        renderRef(file, null, id, page) + '</span>';
    });
  }).join('\n');
}

function linksForClaim(topic, sectionNames, id, page) {
  const placements = anchors.get(topic)?.get(id + ':' + page);
  const placement = placements?.find((entry) => sectionNames.includes(entry.section));
  if (!placement) {
    throw Error('Missing Wiki citation in declared section: ' + [topic, sectionNames, id, page].join(' '));
  }
  return placement.anchor;
}

const articleMarkdown = new Map(topics.map((topic) => [topic, topicMarkdown(topic)]));
const cardClaims = new Map();

for (const card of cards) {
  let topic;
  let sections;
  const refs = [];
  const body = read(card).split('\n').map((line) => {
    const wiki = /^\s*-\s*Wiki：.*?\]\(\.\.\/(wiki\/topics\/[^)]+)\) · (.+)$/.exec(line);
    if (wiki) {
      [, topic, sections] = wiki;
      sections = sections.split('、');
      return line;
    }
    return line.replace(refPattern, (_match, id, page) => {
      const anchor = linksForClaim(topic, sections, id, page);
      refs.push({ topic, id, page, anchor });
      return renderRef(card, topic, id, page, anchor);
    });
  }).join('\n');
  articleMarkdown.set(card, body);
  cardClaims.set(card, refs);
}

function publicationLinks(file, markdown) {
  return markdown.replace(/(?<!!)\[([^\]\n]+)\]\(([^)\s]+)\)/g, (match, label, target) => {
    const doi = target.replace('https://doi.org/', '');
    if (publisher[doi]) return '[' + label + '](' + publisher[doi] + ')';
    if (target.startsWith('https://')) return match;
    const normalized = posix.normalize(posix.join(posix.dirname(file), target));
    if (normalized.startsWith('raw/')) return '`' + label + '`';
    if (normalized.startsWith('reports/')) return label + '（專案內）';
    if (!pages.includes(normalized)) throw Error('Unexpected publication link: ' + file + ' -> ' + target);
    return '[' + label + '](' + relative(file, htmlPath(normalized)) + ')';
  });
}

function pageShell(file, title, body) {
  return '<!doctype html>\n<html lang="zh-Hant">\n<head>\n<meta charset="utf-8">\n' +
    '<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>' +
    escape(title) + '</title>\n<link rel="stylesheet" href="' +
    relative(file, 'assets/pages.css') + '">\n</head>\n<body>\n<nav aria-label="網站導覽">' +
    '<a href="' + relative(file, 'deck.html') + '">教學簡報</a>' +
    '<a href="' + relative(file, 'wiki/index.html') + '">Wiki 主題</a>' +
    '<a href="' + relative(file, 'wiki/sources.html') + '">來源登錄表</a>' +
    '</nav>\n<main>\n' + body + '\n</main>\n</body>\n</html>\n';
}

for (const file of pages) {
  const original = articleMarkdown.get(file) ?? read(file);
  const title = /^# (.+)$/m.exec(original)[1];
  let markdown = publicationLinks(file, original);
  if (file === 'wiki/sources.md') {
    markdown = markdown
      .replace(/^\| (S\d+) \|/gm, '| <span id="$1" class="ref-target">$1</span> |')
      .replace('| raw/ 路徑 |', '| 本機原始檔名 |')
      .replace(refPattern, (_match, id, page) => renderRef(file, null, id, page));
  }
  const body = marked.parse(markdown).replace(/<table>[\s\S]*?<\/table>/g, (table) =>
    '<div class="table-scroll" role="region" aria-label="資料表" tabindex="0">' + table + '</div>');
  write('docs/' + htmlPath(file), pageShell(htmlPath(file), title, body));
}

const deck = read('deck.html');
let slideCount = 0;
let citationCount = 0;
const published = deck.replace(/<section class="slide\b[\s\S]*?<\/section>/g, (section) => {
  slideCount++;
  const number = String(slideCount).padStart(2, '0');
  const refs = cardClaims.get('cards/' + number + '.md');
  let index = 0;
  const linked = section.replace(/href="(?:docs\/)?(wiki\/topics\/[^"#]+\.(?:md|html))(?:#[^"]+)?" data-ref="(S\d+):(\d+)"/g,
    (_match, path, id, page) => {
      const claim = refs[index++];
      if (claim?.id !== id || claim.page !== page || htmlPath(claim.topic) !== htmlPath(path)) {
        throw Error('Deck and evidence card disagree on slide ' + number + ', cite ' + index);
      }
      citationCount++;
      return 'href="' + htmlPath(claim.topic) + '#' + claim.anchor + '" data-ref="' + id + ':' + page + '"';
    });
  if (index !== refs.length) throw Error('Missing deck references on slide ' + number);
  return linked.replace(/href="(?:docs\/)?((?:cards|wiki)\/[^"#]+\.(?:md|html))"/g,
    (_match, path) => 'href="' + htmlPath(path) + '"');
});
if (slideCount !== 10 || citationCount !== 48) throw Error('Unexpected slide/citation count');
write('docs/deck.html', published);
write('deck.html', published.replace(/href="((?:wiki|cards)\/)/g, 'href="docs/$1'));
write('docs/.nojekyll', '');
write('docs/index.html', pageShell('index.html', 'IMU 穿戴式感測器與步態分析入門',
  '<h1>IMU 穿戴式感測器與步態分析入門</h1>\n' +
  '<p>從感測器訊號、三軸方向和步態週期，學會閱讀步態分析的量測結果。</p>\n' +
  '<p><a class="start" href="deck.html">開始 10 頁教學簡報 →</a></p>'));
console.log('Built ' + pages.length + ' reading pages, ' + slideCount + ' slides, ' + citationCount + ' anchored citations.');
