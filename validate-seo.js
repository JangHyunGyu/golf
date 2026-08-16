#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const SITE = 'https://golf.archerlab.dev';
const TODAY = '2026-08-16';
const CHECK_DIST = process.argv.includes('--dist');

const INDEXABLE = new Map([
  ['index.html', { url: `${SITE}/`, lang: 'ko', alternates: {} }],
  ['analysis.html', {
    url: `${SITE}/analysis`,
    lang: 'ko',
    alternates: {
      ko: `${SITE}/analysis`,
      en: `${SITE}/analysis-en`,
      ja: `${SITE}/analysis-jp`,
      'x-default': `${SITE}/analysis-en`,
    },
  }],
  ['analysis-en.html', {
    url: `${SITE}/analysis-en`,
    lang: 'en',
    alternates: {
      ko: `${SITE}/analysis`,
      en: `${SITE}/analysis-en`,
      ja: `${SITE}/analysis-jp`,
      'x-default': `${SITE}/analysis-en`,
    },
  }],
  ['analysis-jp.html', {
    url: `${SITE}/analysis-jp`,
    lang: 'ja',
    alternates: {
      ko: `${SITE}/analysis`,
      en: `${SITE}/analysis-en`,
      ja: `${SITE}/analysis-jp`,
      'x-default': `${SITE}/analysis-en`,
    },
  }],
  ['seo/golf-dokak.html', {
    url: `${SITE}/seo/golf-dokak`,
    lang: 'ko',
    alternates: {
      ko: `${SITE}/seo/golf-dokak`,
      ja: `${SITE}/seo/golf-dokugaku`,
      'x-default': `${SITE}/seo/golf-dokak`,
    },
  }],
  ['seo/driver-slice-gyojung.html', {
    url: `${SITE}/seo/driver-slice-gyojung`,
    lang: 'ko',
    alternates: {
      ko: `${SITE}/seo/driver-slice-gyojung`,
      en: `${SITE}/seo/fix-driver-slice`,
      ja: `${SITE}/seo/driver-slice-naoshikata`,
      'x-default': `${SITE}/seo/fix-driver-slice`,
    },
  }],
  ['seo/fix-driver-slice.html', {
    url: `${SITE}/seo/fix-driver-slice`,
    lang: 'en',
    alternates: {
      ko: `${SITE}/seo/driver-slice-gyojung`,
      en: `${SITE}/seo/fix-driver-slice`,
      ja: `${SITE}/seo/driver-slice-naoshikata`,
      'x-default': `${SITE}/seo/fix-driver-slice`,
    },
  }],
  ['seo/golf-dokugaku.html', {
    url: `${SITE}/seo/golf-dokugaku`,
    lang: 'ja',
    alternates: {
      ko: `${SITE}/seo/golf-dokak`,
      ja: `${SITE}/seo/golf-dokugaku`,
      'x-default': `${SITE}/seo/golf-dokak`,
    },
  }],
  ['seo/driver-slice-naoshikata.html', {
    url: `${SITE}/seo/driver-slice-naoshikata`,
    lang: 'ja',
    alternates: {
      ko: `${SITE}/seo/driver-slice-gyojung`,
      en: `${SITE}/seo/fix-driver-slice`,
      ja: `${SITE}/seo/driver-slice-naoshikata`,
      'x-default': `${SITE}/seo/fix-driver-slice`,
    },
  }],
  ['seo/golf-swing-video-checklist.html', {
    url: `${SITE}/seo/golf-swing-video-checklist.html`,
    lang: 'ko',
    alternates: {},
  }],
  ['seo/online-golf-swing-analysis-guide.html', {
    url: `${SITE}/seo/online-golf-swing-analysis-guide.html`,
    lang: 'ko',
    alternates: {},
  }],
]);

const LEGAL = new Map([
  ['privacy.html', `${SITE}/privacy`],
  ['privacy-en.html', `${SITE}/privacy-en`],
  ['privacy-jp.html', `${SITE}/privacy-jp`],
  ['terms.html', `${SITE}/terms`],
  ['terms-en.html', `${SITE}/terms-en`],
  ['terms-jp.html', `${SITE}/terms-jp`],
]);

const UTILITY = new Map([
  ['index-en.html', { url: `${SITE}/index-en`, lang: 'en', analyze: '/analysis-en' }],
  ['index-jp.html', { url: `${SITE}/index-jp`, lang: 'ja', analyze: '/analysis-jp' }],
]);

const RETIRED = new Map([
  ['/seo/golf-swing-bunseok-muryo', '/analysis'],
  ['/seo/free-golf-swing-analysis', '/analysis-en'],
  ['/seo/golf-swing-analyzer-online', '/analysis-en'],
  ['/seo/golf-swing-shindan-muryo', '/analysis-jp'],
  ['/seo/golf-swing-app-muryo', '/analysis-jp'],
]);

let passed = 0;
let errors = 0;
const pass = message => { console.log(`  ✅ ${message}`); passed++; };
const fail = message => { console.log(`  ❌ ${message}`); errors++; };
const check = (condition, message) => condition ? pass(message) : fail(message);
const section = title => console.log(`\n[${title}]`);
const read = file => fs.readFileSync(path.join(ROOT, file), 'utf8');
const exists = file => fs.existsSync(path.join(ROOT, file));

function tags(html, tagName) {
  return html.match(new RegExp(`<${tagName}\\b[^>]*>`, 'gi')) || [];
}

function attr(tag, name) {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*(["'])(.*?)\\1`, 'i'));
  return match ? match[2] : null;
}

function linksByRel(html, rel) {
  return tags(html, 'link').filter(tag =>
    (attr(tag, 'rel') || '').toLowerCase().split(/\s+/).includes(rel));
}

function metaBy(html, key, value) {
  return tags(html, 'meta').filter(tag =>
    (attr(tag, key) || '').toLowerCase() === value.toLowerCase());
}

function mapAlternates(html) {
  return new Map(
    linksByRel(html, 'alternate')
      .filter(tag => attr(tag, 'hreflang'))
      .map(tag => [attr(tag, 'hreflang'), attr(tag, 'href')]),
  );
}

function sortedEntries(value) {
  return [...value.entries()].sort(([a], [b]) => a.localeCompare(b));
}

function sameMap(actual, expectedObject) {
  return JSON.stringify(sortedEntries(actual)) ===
    JSON.stringify(Object.entries(expectedObject).sort(([a], [b]) => a.localeCompare(b)));
}

function structuredData(html, file) {
  const scripts = html.match(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi) || [];
  const types = new Set();
  check(scripts.length > 0, `${file}: JSON-LD exists`);
  scripts.forEach((script, index) => {
    const raw = script.replace(/^<script\b[^>]*>/i, '').replace(/<\/script>$/i, '').trim();
    try {
      const data = JSON.parse(raw);
      const visit = value => {
        if (!value || typeof value !== 'object') return;
        if (Array.isArray(value)) return value.forEach(visit);
        const ownTypes = Array.isArray(value['@type']) ? value['@type'] : [value['@type']];
        ownTypes.filter(Boolean).forEach(type => types.add(type));
        Object.values(value).forEach(visit);
      };
      visit(data);
      pass(`${file}: JSON-LD ${index + 1} parses`);
    } catch (error) {
      fail(`${file}: JSON-LD ${index + 1} invalid (${error.message})`);
    }
  });
  return types;
}

section('indexable pages');
const pagesByUrl = new Map();
for (const [file, expected] of INDEXABLE) {
  check(exists(file), `${file}: exists`);
  if (!exists(file)) continue;
  const bytes = fs.readFileSync(path.join(ROOT, file));
  check(!(bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf), `${file}: no UTF-8 BOM`);
  const html = bytes.toString('utf8');
  check(!html.includes('\uFFFD'), `${file}: no replacement character`);
  check(html.toLowerCase().indexOf('<meta charset') >= 0 &&
    html.toLowerCase().indexOf('<meta charset') < 1024, `${file}: early charset`);

  const titles = html.match(/<title\b[^>]*>[\s\S]*?<\/title>/gi) || [];
  const descriptions = metaBy(html, 'name', 'description');
  const robots = metaBy(html, 'name', 'robots');
  const canonicals = linksByRel(html, 'canonical');
  const ogUrls = metaBy(html, 'property', 'og:url');
  const sitemapLinks = linksByRel(html, 'sitemap');
  const language = attr(tags(html, 'html')[0] || '', 'lang');
  const alternates = mapAlternates(html);

  check(titles.length === 1 && /\S/.test(titles[0].replace(/<[^>]+>/g, '')), `${file}: one title`);
  check(descriptions.length === 1 && /\S/.test(attr(descriptions[0], 'content') || ''), `${file}: one description`);
  check(robots.length === 1 && !/noindex/i.test(attr(robots[0], 'content') || ''), `${file}: indexable robots`);
  check(canonicals.length === 1 && attr(canonicals[0], 'href') === expected.url, `${file}: canonical`);
  check(ogUrls.length === 1 && attr(ogUrls[0], 'content') === expected.url, `${file}: og:url`);
  check(sitemapLinks.length === 1 && attr(sitemapLinks[0], 'href') === `${SITE}/sitemap.xml`, `${file}: sitemap discovery`);
  check(language === expected.lang, `${file}: lang=${expected.lang}`);
  check(sameMap(alternates, expected.alternates), `${file}: exact hreflang set`);

  const types = structuredData(html, file);
  if (file.startsWith('seo/')) {
    const isIntentGuide = file === 'seo/golf-swing-video-checklist.html'
      || file === 'seo/online-golf-swing-analysis-guide.html';
    if (isIntentGuide) {
      check(types.has('WebPage') && types.has('FAQPage'), `${file}: page and visible FAQ structured data`);
      check(/href="\/analysis"/.test(html), `${file}: crawlable analyzer CTA`);
    } else {
      check(types.has('WebPage') && types.has('Article') && types.has('WebApplication'), `${file}: guide structured data`);
      check(!types.has('FAQPage'), `${file}: no obsolete FAQ rich-result markup`);
      check(/\/privacy(?:-en|-jp)?/.test(html) && /\/terms(?:-en|-jp)?/.test(html), `${file}: trust links`);
    }
  }
  if (file.startsWith('analysis')) {
    check(html.includes('analysis-resource-guide'), `${file}: crawlable analysis guide`);
    check(/\/privacy(?:-en|-jp)?/.test(html), `${file}: privacy link`);
  }
  pagesByUrl.set(expected.url, { file, alternates, lang: expected.lang });
}

section('hreflang reciprocity');
for (const [url, page] of pagesByUrl) {
  const ownCode = page.lang === 'ja' ? 'ja' : page.lang;
  for (const [code, targetUrl] of page.alternates) {
    if (code === 'x-default') continue;
    const target = pagesByUrl.get(targetUrl);
    check(Boolean(target), `${page.file}: ${code} resolves locally`);
    if (target) check(target.alternates.get(ownCode) === url, `${page.file}: ${code} links back`);
  }
}

section('legal and processing disclosures');
for (const [file, canonical] of LEGAL) {
  check(exists(file), `${file}: exists`);
  if (!exists(file)) continue;
  const html = read(file);
  const robots = metaBy(html, 'name', 'robots');
  const canonicals = linksByRel(html, 'canonical');
  check(robots.length === 1 && /noindex/i.test(attr(robots[0], 'content') || '') &&
    /follow/i.test(attr(robots[0], 'content') || ''), `${file}: noindex,follow`);
  check(canonicals.length === 1 && attr(canonicals[0], 'href') === canonical, `${file}: canonical`);
  check(!html.includes('\uFFFD'), `${file}: valid text`);
}
for (const file of ['privacy.html', 'privacy-en.html', 'privacy-jp.html']) {
  if (!exists(file)) continue;
  const html = read(file);
  check(/30/.test(html), `${file}: 30-day result retention disclosed`);
  check(/Cloudflare/i.test(html) && /OpenRouter/i.test(html), `${file}: processors disclosed`);
}

section('localized utility hubs');
for (const [file, expected] of UTILITY) {
  check(exists(file), `${file}: exists`);
  if (!exists(file)) continue;
  const html = read(file);
  const robots = metaBy(html, 'name', 'robots');
  const canonicals = linksByRel(html, 'canonical');
  check(robots.length === 1 && /noindex/i.test(attr(robots[0], 'content') || '') &&
    /follow/i.test(attr(robots[0], 'content') || ''), `${file}: noindex,follow`);
  check(canonicals.length === 1 && attr(canonicals[0], 'href') === expected.url, `${file}: self canonical`);
  check(mapAlternates(html).size === 0, `${file}: no indexable hreflang cluster`);
  check(html.includes(`href="${expected.analyze.replace(/^\//, '')}"`) ||
    html.includes(`href="${expected.analyze}"`), `${file}: links to localized analyzer`);
}

section('sitemap');
const sitemap = read('sitemap.xml');
const blocks = sitemap.match(/<url>[\s\S]*?<\/url>/g) || [];
const sitemapEntries = new Map();
for (const block of blocks) {
  const loc = (block.match(/<loc>([^<]+)<\/loc>/) || [])[1];
  if (!loc) {
    fail('sitemap block has loc');
    continue;
  }
  check(!sitemapEntries.has(loc), `${loc}: unique sitemap URL`);
  const lastmods = [...block.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map(match => match[1]);
  const alternates = new Map(tags(block, 'xhtml:link').map(tag => [attr(tag, 'hreflang'), attr(tag, 'href')]));
  sitemapEntries.set(loc, { lastmods, alternates });
}
check(sitemapEntries.size === INDEXABLE.size, `sitemap has exactly ${INDEXABLE.size} URLs`);
for (const [, expected] of INDEXABLE) {
  const entry = sitemapEntries.get(expected.url);
  check(Boolean(entry), `${expected.url}: present in sitemap`);
  if (!entry) continue;
  check(entry.lastmods.length === 1 && /^\d{4}-\d{2}-\d{2}$/.test(entry.lastmods[0]) &&
    entry.lastmods[0] <= TODAY, `${expected.url}: valid lastmod`);
  check(sameMap(entry.alternates, expected.alternates), `${expected.url}: sitemap hreflang`);
}
for (const retired of RETIRED.keys()) {
  check(!sitemap.includes(`${SITE}${retired}`), `${retired}: absent from sitemap`);
}
for (const canonical of LEGAL.values()) {
  check(!sitemap.includes(`<loc>${canonical}</loc>`), `${canonical}: noindex page absent from sitemap`);
}
for (const [, expected] of UTILITY) {
  check(!sitemap.includes(`<loc>${expected.url}</loc>`), `${expected.url}: noindex hub absent from sitemap`);
}

section('redirect consolidation');
const redirectLines = read('_redirects').split(/\r?\n/)
  .map(line => line.trim())
  .filter(line => line && !line.startsWith('#'));
const actualRedirects = new Map();
for (const line of redirectLines) {
  const [source, destination, status, ...rest] = line.split(/\s+/);
  check(Boolean(source && destination && status) && rest.length === 0, `${line}: valid redirect syntax`);
  check(!actualRedirects.has(source), `${source}: redirect source unique`);
  actualRedirects.set(source, { destination, status });
}
const expectedRedirects = new Map();
for (const [source, destination] of RETIRED) {
  expectedRedirects.set(source, { destination, status: '301' });
  expectedRedirects.set(`${source}.html`, { destination, status: '301' });
  expectedRedirects.set(`${source}/`, { destination, status: '301' });
}
check(actualRedirects.size === expectedRedirects.size, `exactly ${expectedRedirects.size} redirect rules`);
for (const [source, expected] of expectedRedirects) {
  const actual = actualRedirects.get(source);
  check(Boolean(actual) && actual.destination === expected.destination && actual.status === expected.status,
    `${source} -> ${expected.destination} 301`);
}
check(!redirectLines.some(line => line.includes('*')), 'no wildcard redirect');

section('crawl controls and build configuration');
const notFound = read('404.html');
const notFoundRobots = metaBy(notFound, 'name', 'robots');
check(notFoundRobots.length === 1 && /noindex/i.test(attr(notFoundRobots[0], 'content') || '') &&
  /follow/i.test(attr(notFoundRobots[0], 'content') || ''), '404 is noindex,follow');
const robotsTxt = read('robots.txt');
check(robotsTxt.includes(`Sitemap: ${SITE}/sitemap.xml`), 'robots advertises sitemap');
check(!/Disallow:\s*\/seo\/\s*$/m.test(robotsTxt), 'retired SEO URLs remain crawlable for 301 discovery');
const headers = read('_headers');
check(headers.includes('https://golf-3xe.pages.dev/*') &&
  headers.includes('X-Robots-Tag: noindex, nofollow'), 'Pages alias is noindex');

const vite = read('vite.config.js').replace(/\\/g, '/');
for (const required of ["'_redirects'", "'_headers'", "'seo/*.html'", "'privacy*.html'", "'terms*.html'"]) {
  check(vite.includes(required), `Vite copies ${required.slice(1, -1)}`);
}
check(vite.includes("resolve(import.meta.dirname, 'index-en.html')") &&
  vite.includes("resolve(import.meta.dirname, 'index-jp.html')"), 'localized utility hubs remain build inputs');

const generatedGuides = fs.readdirSync(path.join(ROOT, 'seo'))
  .filter(file => file.endsWith('.html'))
  .sort();
const expectedGuides = [...INDEXABLE.keys()]
  .filter(file => file.startsWith('seo/'))
  .map(file => path.basename(file))
  .sort();
check(JSON.stringify(generatedGuides) === JSON.stringify(expectedGuides), 'only intended SEO guides exist');

section('unsupported claims');
const claimFiles = [...INDEXABLE.keys(), ...UTILITY.keys()];
const prohibited = [
  /PGA\/LPGA Tour Pros/i,
  /roughly on par with a pro/i,
  /프로 수준의 코칭/,
  /프로와 거의 동일/,
  /プロとほぼ同等/,
  /not stored on the server/i,
  /서버에 저장되지 않습니다/,
  /サーバーには保存されません/,
];
for (const file of claimFiles) {
  const html = read(file);
  check(prohibited.every(pattern => !pattern.test(html)), `${file}: no unsupported pro/storage claim`);
}

if (CHECK_DIST) {
  section('production build output');
  const distRoot = path.join(ROOT, 'dist', 'web');
  const required = [
    ...INDEXABLE.keys(),
    ...UTILITY.keys(),
    ...LEGAL.keys(),
    '_headers',
    '_redirects',
    '404.html',
    'robots.txt',
    'sitemap.xml',
  ];
  for (const file of required) {
    check(fs.existsSync(path.join(distRoot, file)), `dist/web/${file} exists`);
  }
  for (const retiredFile of [
    'seo/golf-swing-bunseok-muryo.html',
    'seo/free-golf-swing-analysis.html',
    'seo/golf-swing-analyzer-online.html',
    'seo/golf-swing-shindan-muryo.html',
    'seo/golf-swing-app-muryo.html',
  ]) {
    check(!fs.existsSync(path.join(distRoot, retiredFile)), `dist/web/${retiredFile} absent`);
  }
}

console.log(`\n${'='.repeat(60)}`);
console.log(`SEO validation: ${passed} passed | ${errors} errors`);
console.log('='.repeat(60));
process.exit(errors ? 1 : 0);
