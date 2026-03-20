#!/usr/bin/env node

/**
 * Golf Swing Analysis App - Validation Script
 * Checks HTML files, asset references, internal links, and cross-language consistency.
 * Run: node validate.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = __dirname;

let totalErrors = 0;
let totalWarnings = 0;
let totalPassed = 0;

function pass(msg) {
    console.log(`  \u2705 ${msg}`);
    totalPassed++;
}

function fail(msg) {
    console.log(`  \u274C ${msg}`);
    totalErrors++;
}

function warn(msg) {
    console.log(`  \u26A0\uFE0F  ${msg}`);
    totalWarnings++;
}

function fileExistsAt(relPath) {
    return fs.existsSync(path.join(ROOT, relPath));
}

function readFile(relPath) {
    return fs.readFileSync(path.join(ROOT, relPath), 'utf-8');
}

// ============================================================
// 1. Check that all expected HTML files exist for all 3 languages
// ============================================================
console.log('\n[1] HTML files exist for all 3 languages');

const expectedHtmlFiles = [
    'index.html',
    'index-en.html',
    'index-jp.html',
    'analysis.html',
    'analysis-en.html',
    'analysis-jp.html',
];

for (const file of expectedHtmlFiles) {
    if (fileExistsAt(file)) {
        pass(`${file} exists`);
    } else {
        fail(`${file} is MISSING`);
    }
}

// ============================================================
// 2. service-worker.js exists
// ============================================================
console.log('\n[2] service-worker.js exists');

if (fileExistsAt('service-worker.js')) {
    pass('service-worker.js exists');
} else {
    fail('service-worker.js is MISSING');
}

// ============================================================
// 3 & 5. HTML script/CSS references match actual files
// ============================================================
console.log('\n[3] HTML script/CSS/asset references resolve to actual files');

/**
 * Extract local asset references from an HTML file.
 * Returns { scripts: string[], stylesheets: string[] }
 * Strips query strings (?v=...) before returning paths.
 */
function extractAssetRefs(rawHtml) {
    const scripts = [];
    const stylesheets = [];

    // Strip HTML comments so commented-out references are not matched
    const html = rawHtml.replace(/<!--[\s\S]*?-->/g, '');

    // Match <script src="..."> (not external http/https/protocol-relative)
    const scriptRegex = /<script[^>]+src\s*=\s*["']([^"']+)["']/gi;
    let m;
    while ((m = scriptRegex.exec(html)) !== null) {
        const src = m[1];
        if (/^(https?:)?\/\//.test(src)) continue; // skip external
        scripts.push(src.split('?')[0]);
    }

    // Match <link rel="stylesheet" href="..."> (local only)
    // Handle both orderings: rel before href and href before rel
    const cssRegex = /<link[^>]+rel\s*=\s*["']stylesheet["'][^>]+href\s*=\s*["']([^"']+)["']/gi;
    while ((m = cssRegex.exec(html)) !== null) {
        const href = m[1];
        if (/^(https?:)?\/\//.test(href)) continue;
        stylesheets.push(href.split('?')[0]);
    }
    const cssRegex2 = /<link[^>]+href\s*=\s*["']([^"']+)["'][^>]+rel\s*=\s*["']stylesheet["']/gi;
    while ((m = cssRegex2.exec(html)) !== null) {
        const href = m[1];
        if (/^(https?:)?\/\//.test(href)) continue;
        const clean = href.split('?')[0];
        if (!stylesheets.includes(clean)) {
            stylesheets.push(clean);
        }
    }

    return { scripts, stylesheets };
}

const htmlAssets = {}; // filename -> { scripts, stylesheets }

for (const file of expectedHtmlFiles) {
    if (!fileExistsAt(file)) continue;
    const html = readFile(file);
    const refs = extractAssetRefs(html);
    htmlAssets[file] = refs;

    for (const s of refs.scripts) {
        if (fileExistsAt(s)) {
            pass(`${file} -> script "${s}" exists`);
        } else {
            fail(`${file} -> script "${s}" NOT FOUND on disk`);
        }
    }

    for (const s of refs.stylesheets) {
        if (fileExistsAt(s)) {
            pass(`${file} -> stylesheet "${s}" exists`);
        } else {
            fail(`${file} -> stylesheet "${s}" NOT FOUND on disk`);
        }
    }
}

// ============================================================
// 4. Multi-language HTML files have consistent script/CSS references
//    (same set of base asset paths across language variants)
// ============================================================
console.log('\n[4] Cross-language consistency of script/CSS references');

const langGroups = [
    { name: 'index pages', files: ['index.html', 'index-en.html', 'index-jp.html'] },
    { name: 'analysis pages', files: ['analysis.html', 'analysis-en.html', 'analysis-jp.html'] },
];

for (const group of langGroups) {
    const available = group.files.filter(f => htmlAssets[f]);
    if (available.length < 2) {
        warn(`${group.name}: fewer than 2 files available, skipping consistency check`);
        continue;
    }

    // Compare scripts
    const scriptSets = available.map(f => htmlAssets[f].scripts.slice().sort().join('|'));
    const allScriptsSame = scriptSets.every(s => s === scriptSets[0]);
    if (allScriptsSame) {
        pass(`${group.name}: all language variants reference the same scripts`);
    } else {
        fail(`${group.name}: script references DIFFER across languages`);
        for (const f of available) {
            console.log(`      ${f}: [${htmlAssets[f].scripts.join(', ')}]`);
        }
    }

    // Compare stylesheets
    const cssSets = available.map(f => htmlAssets[f].stylesheets.slice().sort().join('|'));
    const allCssSame = cssSets.every(s => s === cssSets[0]);
    if (allCssSame) {
        pass(`${group.name}: all language variants reference the same stylesheets`);
    } else {
        fail(`${group.name}: stylesheet references DIFFER across languages`);
        for (const f of available) {
            console.log(`      ${f}: [${htmlAssets[f].stylesheets.join(', ')}]`);
        }
    }
}

// ============================================================
// 5. No broken internal links between pages
// ============================================================
console.log('\n[5] Internal links between pages (no broken links)');

/**
 * Extract internal href links from anchor tags.
 * Skips external URLs, mailto:, javascript:, #fragments.
 */
function extractInternalLinks(rawHtml) {
    const links = [];
    // Strip HTML comments
    const html = rawHtml.replace(/<!--[\s\S]*?-->/g, '');
    const hrefRegex = /<a[^>]+href\s*=\s*["']([^"']+)["']/gi;
    let m;
    while ((m = hrefRegex.exec(html)) !== null) {
        let href = m[1];
        if (/^(https?:)?\/\//.test(href)) continue;  // external
        if (/^mailto:/i.test(href)) continue;
        if (/^javascript:/i.test(href)) continue;
        if (href.startsWith('#')) continue;
        // Strip fragment
        href = href.split('#')[0];
        if (!href) continue;
        links.push(href);
    }
    return [...new Set(links)];
}

/**
 * Resolve a link target to a file path.
 * Links like "analysis-en" need to check for "analysis-en.html".
 * Links like "/" resolve to "index.html".
 */
function resolveLink(link) {
    if (link === '/') return 'index.html';

    // Remove leading slash if present
    let target = link.replace(/^\//, '');

    // If it already has an extension, use as-is
    if (path.extname(target)) return target;

    // Try adding .html
    return target + '.html';
}

for (const file of expectedHtmlFiles) {
    if (!fileExistsAt(file)) continue;
    const html = readFile(file);
    const links = extractInternalLinks(html);

    for (const link of links) {
        const resolved = resolveLink(link);
        if (fileExistsAt(resolved)) {
            pass(`${file} -> link "${link}" resolves to "${resolved}"`);
        } else {
            fail(`${file} -> link "${link}" (resolved: "${resolved}") NOT FOUND`);
        }
    }
}

// ============================================================
// 6. Check manifest.json files referenced in HTML exist
// ============================================================
console.log('\n[6] Manifest JSON files referenced in HTML exist');

for (const file of expectedHtmlFiles) {
    if (!fileExistsAt(file)) continue;
    const html = readFile(file);
    const manifestRegex = /<link[^>]+rel\s*=\s*["']manifest["'][^>]+href\s*=\s*["']([^"']+)["']/gi;
    let m;
    while ((m = manifestRegex.exec(html)) !== null) {
        const href = m[1];
        if (fileExistsAt(href)) {
            pass(`${file} -> manifest "${href}" exists`);
        } else {
            fail(`${file} -> manifest "${href}" NOT FOUND`);
        }
    }
}

// ============================================================
// Summary
// ============================================================
console.log('\n' + '='.repeat(60));
console.log(`  Passed: ${totalPassed}  |  Errors: ${totalErrors}  |  Warnings: ${totalWarnings}`);
console.log('='.repeat(60));

if (totalErrors > 0) {
    console.log('\nValidation FAILED.\n');
    process.exit(1);
} else {
    console.log('\nValidation PASSED.\n');
    process.exit(0);
}
