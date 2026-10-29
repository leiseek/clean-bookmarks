const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createPage, invalid, flush, root } = require('./helpers.cjs');

test('opening popup during a scan retains progress despite empty stored results', async () => {
  const page = createPage('popup', {
    isScanning: true, scanStatus: 'scanning', scanResults: [], scanCurrent: 1, scanTotal: 3, scanProgress: 33
  });
  await flush();
  assert.equal(page.elements.get('scanBtn').disabled, true);
  assert.equal(page.elements.get('progress').style.display, 'block');
  assert.equal(page.elements.get('scanProgress').textContent, '1/3');
  assert.equal(page.elements.get('viewBtn').disabled, true);
});

test('popup can retry after an interrupted or failed scan and displays completed results', async () => {
  const page = createPage('popup', { isScanning: false, scanStatus: 'interrupted', scanError: 'Scan interrupted' });
  await flush();
  assert.equal(page.elements.get('scanBtn').disabled, false);
  assert.equal(page.elements.get('scanStatus').textContent, 'Scan interrupted');
  await page.update({ isScanning: false, scanStatus: 'complete', scanResults: [invalid()], invalidLinksCount: 1 });
  assert.equal(page.elements.get('viewBtn').disabled, false);
  assert.equal(page.elements.get('cleanBtn').disabled, false);
  assert.equal(page.elements.get('progress').style.display, 'none');
});

test('results show all four states and auto-select only confirmed invalid URLs', async () => {
  const page = createPage('results', { scanStatus: 'complete', scanResults: [
    invalid(), { ...invalid('11'), status: 'valid', httpStatus: 200 },
    { ...invalid('12'), status: 'unknown', reason: 'networkError', httpStatus: undefined },
    { ...invalid('13'), status: 'skipped', reason: 'unsupportedProtocol', url: 'chrome://bookmarks/' },
    { ...invalid('14'), status: undefined }
  ] }, '?action=clean');
  await flush();
  assert.equal(page.elements.get('unknownText').textContent, 'Unknown: 2');
  assert.equal(page.elements.get('skippedText').textContent, 'Skipped: 1');
  const checkboxes = page.document.querySelectorAll('.bookmark-checkbox');
  assert.equal(checkboxes.filter(checkbox => checkbox.checked).length, 1);
  assert.equal(checkboxes.filter(checkbox => !checkbox.disabled).length, 1);
  await page.elements.get('confirmCleanBtn').trigger('click');
  await page.elements.get('confirmCleanBtn').trigger('click');
  assert.equal(page.messages.filter(message => message.type === 'backupAndClean').length, 1);
  assert.deepEqual([...page.messages[0].selectedIds], ['10']);
  assert.equal(page.elements.get('confirmCleanBtn').disabled, true);
});

test('results retain the page while scanning and render an empty completed scan', async () => {
  const page = createPage('results', { scanStatus: 'scanning', isScanning: true, scanResults: [] });
  await flush();
  assert.equal(page.elements.get('loadingState').style.display, 'block');
  assert.equal(page.elements.get('refreshBtn').disabled, true);
  await page.update({ scanStatus: 'complete', isScanning: false, scanResults: [] });
  assert.equal(page.elements.get('resultsContainer').style.display, 'block');
  assert.equal(page.elements.get('totalText').textContent, 'Total: 0 bookmarks');
  assert.equal(page.elements.get('selectAll').disabled, true);
});

test('manifest assets and all locale catalogs are consistent', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));
  for (const filename of [manifest.background.service_worker, manifest.action.default_popup, ...Object.values(manifest.icons)]) {
    assert.ok(fs.existsSync(path.join(root, filename)), filename);
  }
  let reference;
  for (const locale of fs.readdirSync(path.join(root, '_locales'))) {
    const catalog = JSON.parse(fs.readFileSync(path.join(root, '_locales', locale, 'messages.json'), 'utf8'));
    const keys = Object.keys(catalog).sort();
    if (!reference) reference = keys;
    assert.deepEqual(keys, reference, locale);
    for (const [key, entry] of Object.entries(catalog)) {
      assert.ok(entry.message, `${locale}: ${key}`);
      for (const match of entry.message.matchAll(/\$(\w+)\$/g)) assert.ok(entry.placeholders?.[match[1]], `${locale}: ${key}: ${match[1]}`);
    }
  }
});
