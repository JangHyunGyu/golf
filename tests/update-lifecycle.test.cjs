const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const pages = [
    'index.html',
    'index-en.html',
    'index-jp.html',
    'analysis.html',
    'analysis-en.html',
    'analysis-jp.html'
];

const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('all application pages use the shared update lifecycle', () => {
    for (const page of pages) {
        const html = read(page);
        assert.match(html, /assets\/js\/app-update\.js\?v=1\.0\.3/);
        assert.doesNotMatch(html, /getRegistrations\s*\(/);
        assert.doesNotMatch(html, /registration\.unregister\s*\(/);
        assert.doesNotMatch(html, /reload\s*\(\s*true\s*\)/);
        assert.doesNotMatch(html, /http-equiv=["'](?:Cache-Control|Pragma|Expires)["']/i);
    }
});

test('published and client versions agree', () => {
    const version = JSON.parse(read('version.json')).version;
    const client = read('assets/js/app-update.js');
    const worker = read('service-worker.js');
    assert.equal(version, '1.0.3');
    assert.match(client, new RegExp(`CURRENT_VERSION = ['"]${version.replaceAll('.', '\\.')}['"]`));
    assert.match(worker, new RegExp(`golf-v${version.replaceAll('.', '\\.')}`));
});

test('service worker only retires its own caches and updates with consent', () => {
    const worker = read('service-worker.js');
    const client = read('assets/js/app-update.js');
    assert.match(worker, /key\.startsWith\(CACHE_PREFIX\)/);
    assert.doesNotMatch(worker, /keys\.map\([^\n]*caches\.delete/);
    assert.match(worker, /SKIP_WAITING/);
    assert.match(client, /button\.addEventListener\(['"]click['"], applyUpdate\)/);
    assert.match(client, /controllerchange/);
    assert.doesNotMatch(client, /getRegistrations\s*\(/);
});
