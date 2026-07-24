#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const SITE = 'https://golf.archerlab.dev';
const CHECK_DIST = process.argv.includes('--dist');
const TODAY = new Date().toISOString().slice(0, 10);

let passed = 0;
let errors = 0;

function pass(message) {
  console.log(`  ✅ ${message}`);
  passed++;
}

function fail(message) {
  console.log(`  ❌ ${message}`);
  errors++;
}

function check(condition, message) {
  condition ? pass(message) : fail(message);
}

function section(message) {
  console.log(`\n[SEO] ${message}`);
}

function read(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), 'utf8');
}

function tags(html, tagName) {
  return html.match(new RegExp(`<${tagName}\\b[^>]*>`, 'gi')) || [];
}

function attr(tag, name) {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*["']([^"']*)["']`, 'i'));
  return match ? match[1] : null;
}

function metaBy(html, attribute, value) {
  return tags(html, 'meta').filter(tag => (attr(tag, attribute) || '').toLowerCase() === value.toLowerCase());
}

function linksByRel(html, rel) {
  return tags(html, 'link').filter(tag => (attr(tag, 'rel') || '').toLowerCase() === rel.toLowerCase());
}

function expectedLanguage(file) {
  if (/-en\.html$/.test(file) || /\/(free-golf|fix-driver|golf-swing-analyzer)/.test(file)) return 'en';
  if (/-jp\.html$/.test(file) || /\/(golf-dokugaku|golf-swing-(?:app|shindan)|driver-slice-naoshikata)/.test(file)) return 'ja';
  return 'ko';
}

const corePages = new Map([
  ['index.html', `${SITE}/`],
  ['index-en.html', `${SITE}/index-en`],
  ['index-jp.html', `${SITE}/index-jp`],
  ['analysis.html', `${SITE}/analysis`],
  ['analysis-en.html', `${SITE}/analysis-en`],
  ['analysis-jp.html', `${SITE}/analysis-jp`],
]);

const seoFiles = fs.readdirSync(path.join(ROOT, 'seo'))
  .filter(file => file.endsWith('.html'))
  .sort()
  .map(file => `seo/${file}`);

const expectedUrls = new Map(corePages);
for (const file of seoFiles) {
  expectedUrls.set(file, `${SITE}/${file.replace(/\.html$/, '')}`);
}

const pagesByUrl = new Map();

section('HTML encoding and metadata');
for (const [file, expectedUrl] of expectedUrls) {
  const absolute = path.join(ROOT, file);
  const bytes = fs.readFileSync(absolute);
  let html;

  check(!(bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf), `${file}: no UTF-8 BOM`);
  try {
    html = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    pass(`${file}: valid UTF-8`);
  } catch {
    fail(`${file}: invalid UTF-8`);
    continue;
  }
  check(!html.includes('\uFFFD'), `${file}: no replacement character`);

  const charsetIndex = html.toLowerCase().indexOf('<meta charset');
  const charsetByte = charsetIndex < 0 ? -1 : Buffer.byteLength(html.slice(0, charsetIndex), 'utf8');
  check(charsetByte >= 0 && charsetByte < 1024, `${file}: charset declared within first 1024 bytes`);

  const titleMatches = html.match(/<title\b[^>]*>[\s\S]*?<\/title>/gi) || [];
  const descriptions = metaBy(html, 'name', 'description');
  const canonicals = linksByRel(html, 'canonical');
  const robots = metaBy(html, 'name', 'robots');
  const sitemapLinks = linksByRel(html, 'sitemap');
  const ogUrls = metaBy(html, 'property', 'og:url');

  check(titleMatches.length === 1 && /\S/.test(titleMatches[0].replace(/<[^>]+>/g, '')), `${file}: one non-empty title`);
  check(descriptions.length === 1 && /\S/.test(attr(descriptions[0], 'content') || ''), `${file}: one description`);
  check(canonicals.length === 1, `${file}: one canonical`);
  check(robots.length === 1 && !/noindex/i.test(attr(robots[0], 'content') || ''), `${file}: indexable robots directive`);
  check(sitemapLinks.length === 1 && attr(sitemapLinks[0], 'href') === `${SITE}/sitemap.xml`, `${file}: sitemap discovery link`);

  const canonical = canonicals.length === 1 ? attr(canonicals[0], 'href') : null;
  check(canonical === expectedUrl, `${file}: canonical matches extensionless production URL`);
  check(ogUrls.length === 1 && attr(ogUrls[0], 'content') === canonical, `${file}: og:url matches canonical`);

  const htmlTag = tags(html, 'html')[0] || '';
  const language = expectedLanguage(file);
  check(attr(htmlTag, 'lang') === language, `${file}: html lang is ${language}`);

  const alternateTags = linksByRel(html, 'alternate').filter(tag => attr(tag, 'hreflang'));
  const alternates = new Map(alternateTags.map(tag => [attr(tag, 'hreflang'), attr(tag, 'href')]));
  const ownHreflang = language === 'ja' ? 'ja' : language;
  check(alternates.get(ownHreflang) === canonical, `${file}: hreflang contains self-reference`);
  check(alternates.has('x-default'), `${file}: hreflang contains x-default`);
  check([...alternates.keys()].every(code => ['ko', 'en', 'ja', 'x-default'].includes(code)), `${file}: hreflang codes are supported`);

  const jsonLdScripts = (html.match(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi) || []);
  check(jsonLdScripts.length > 0, `${file}: JSON-LD exists`);
  const structuredTypes = new Set();
  for (let index = 0; index < jsonLdScripts.length; index++) {
    const json = jsonLdScripts[index].replace(/^<script\b[^>]*>/i, '').replace(/<\/script>$/i, '').trim();
    try {
      const data = JSON.parse(json);
      const collectTypes = value => {
        if (!value || typeof value !== 'object') return;
        if (Array.isArray(value)) {
          value.forEach(collectTypes);
          return;
        }
        const types = Array.isArray(value['@type']) ? value['@type'] : [value['@type']];
        types.filter(Boolean).forEach(type => structuredTypes.add(type));
        Object.values(value).forEach(collectTypes);
      };
      collectTypes(data);
      pass(`${file}: JSON-LD ${index + 1} parses`);
    } catch (error) {
      fail(`${file}: JSON-LD ${index + 1} invalid (${error.message})`);
    }
  }

  const body = (html.match(/<body\b[\s\S]*<\/body>/i) || [''])[0];
  for (const anchor of tags(body, 'a').filter(tag => attr(tag, 'hreflang'))) {
    const code = attr(anchor, 'hreflang');
    const href = attr(anchor, 'href');
    const absoluteHref = href && href.startsWith('/') ? `${SITE}${href}` : href;
    check(alternates.get(code) === absoluteHref, `${file}: body ${code} language link matches head alternate`);
  }
  if (file.startsWith('seo/')) {
    check(structuredTypes.has('WebPage') && structuredTypes.has('WebApplication') && structuredTypes.has('FAQPage'), `${file}: structured data describes the page, app, and visible FAQ`);
    const contextualLinks = tags(body, 'a').filter(tag => {
      const href = attr(tag, 'href') || '';
      return !attr(tag, 'hreflang') && href.startsWith('/seo/') && href !== `/${file.replace(/\.html$/, '')}`;
    });
    check(contextualLinks.length > 0, `${file}: has a contextual crawlable link to related SEO content`);
  }

  pagesByUrl.set(expectedUrl, { file, html, canonical, language, alternates });
}

section('hreflang reciprocity');
for (const [url, page] of pagesByUrl) {
  const sourceCode = page.language === 'ja' ? 'ja' : page.language;
  for (const [code, targetUrl] of page.alternates) {
    if (code === 'x-default') continue;
    const target = pagesByUrl.get(targetUrl);
    check(Boolean(target), `${page.file}: ${code} alternate resolves locally`);
    if (target) {
      check(target.alternates.get(sourceCode) === url, `${page.file}: ${code} alternate links back`);
    }
  }
}

section('sitemap consistency');
const sitemap = read('sitemap.xml');
const urlBlocks = sitemap.match(/<url>[\s\S]*?<\/url>/g) || [];
const sitemapEntries = new Map();
for (const block of urlBlocks) {
  const loc = (block.match(/<loc>([^<]+)<\/loc>/) || [])[1];
  const lastmods = [...block.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map(match => match[1]);
  if (!loc) {
    fail('sitemap entry has a loc');
    continue;
  }
  check(!sitemapEntries.has(loc), `${loc}: sitemap URL is unique`);
  const alternates = new Map(tags(block, 'xhtml:link').map(tag => [attr(tag, 'hreflang'), attr(tag, 'href')]));
  sitemapEntries.set(loc, { lastmods, alternates });
}

check(sitemapEntries.size === expectedUrls.size, `sitemap contains all ${expectedUrls.size} canonical pages`);
for (const [file, expectedUrl] of expectedUrls) {
  const entry = sitemapEntries.get(expectedUrl);
  check(Boolean(entry), `${file}: canonical is present in sitemap`);
  if (!entry) continue;
  check(entry.lastmods.length === 1 && /^\d{4}-\d{2}-\d{2}$/.test(entry.lastmods[0]), `${file}: one valid lastmod`);
  if (entry.lastmods.length === 1) {
    check(entry.lastmods[0] <= TODAY, `${file}: lastmod is not in the future`);
  }
  const htmlAlternates = pagesByUrl.get(expectedUrl)?.alternates || new Map();
  check(JSON.stringify([...entry.alternates].sort()) === JSON.stringify([...htmlAlternates].sort()), `${file}: sitemap hreflang matches HTML`);
}

section('404, crawl controls, and build configuration');
const notFound = read('404.html');
const notFoundRobots = metaBy(notFound, 'name', 'robots');
check(notFoundRobots.length === 1 && /noindex/i.test(attr(notFoundRobots[0], 'content') || '') && /follow/i.test(attr(notFoundRobots[0], 'content') || ''), '404.html is noindex,follow');
check(notFound.toLowerCase().indexOf('<meta charset') < 1024, '404.html charset is early');

const robotsTxt = read('robots.txt');
check(robotsTxt.includes(`Sitemap: ${SITE}/sitemap.xml`), 'robots.txt advertises sitemap');
check(robotsTxt.includes('Disallow: /seo/_') && robotsTxt.includes('Disallow: /swing-ai.ait'), 'robots.txt excludes repository/build inputs');

const headers = read('_headers');
check(headers.includes('https://golf-3xe.pages.dev/*') && headers.includes('X-Robots-Tag: noindex, nofollow'), '_headers noindexes Pages aliases');
check(headers.includes('/seo/_*') && headers.includes('/swing-ai.ait'), '_headers noindexes published source artifacts');

const vite = read('vite.config.js').replace(/\\/g, '/');
for (const required of ["'_headers'", "'404.html'", "'llms.txt'", "'seo/*.html'", "'favicon.svg'"]) {
  check(vite.includes(required), `vite copies ${required.slice(1, -1)}`);
}

if (CHECK_DIST) {
  section('production build output');
  const distRequired = [
    ...corePages.keys(),
    ...seoFiles,
    '404.html',
    '_headers',
    'llms.txt',
    'favicon.svg',
    'robots.txt',
    'sitemap.xml',
  ];
  for (const file of distRequired) {
    check(fs.existsSync(path.join(ROOT, 'dist', 'web', file)), `dist/web/${file} exists`);
  }
}

console.log(`\n${'='.repeat(60)}`);
console.log(`SEO validation: ${passed} passed | ${errors} errors`);
console.log('='.repeat(60));

process.exit(errors ? 1 : 0);
