const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { createWorker, fixture, invalid } = require('./helpers.cjs');

test('HTTP response status, HEAD fallback and network failures are classified conservatively', async t => {
  const server = http.createServer((req, res) => {
    if (req.url === '/fallback') res.writeHead(req.method === 'HEAD' ? 405 : 200);
    else res.writeHead(Number(req.url.slice(1)));
    res.end();
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const worker = createWorker({ fetch });
  await worker.ready;
  const base = `http://127.0.0.1:${server.address().port}`;
  for (const [code, expected] of [[200, 'valid'], [404, 'invalid'], [410, 'invalid'], [401, 'unknown'], [403, 'unknown'], [429, 'unknown'], [500, 'unknown']]) {
    const result = await worker.context.checkUrlValidity(`${base}/${code}`);
    assert.equal(result.status, expected, String(code));
    assert.equal(result.httpStatus, code);
  }
  assert.equal((await worker.context.checkUrlValidity(`${base}/fallback`)).status, 'valid');
  assert.deepEqual(worker.calls.requests.slice(-2).map(request => request.method), ['HEAD', 'GET']);
  assert.ok(worker.calls.requests.every(request => request.credentials === 'omit' && request.mode !== 'no-cors'));
  const offline = createWorker({ fetch: async () => { throw new TypeError('Offline'); } });
  assert.equal((await offline.context.checkUrlValidity(base)).status, 'unknown');
});

test('unsupported protocols never issue requests or become cleanup candidates', async () => {
  const worker = createWorker();
  for (const url of ['chrome://bookmarks/', 'edge://favorites/', 'javascript:alert(1)', 'file:///tmp/bookmarks.html', 'mailto:a@example.test']) {
    assert.equal((await worker.context.checkUrlValidity(url)).status, 'skipped');
  }
  assert.equal((await worker.context.checkUrlValidity('not a URL')).status, 'unknown');
  assert.equal(worker.calls.requests.length, 0);
});

test('timeouts abort requests and opaque responses remain unknown', async () => {
  let signal;
  const worker = createWorker({ shortTimeout: true, fetch: (url, init) => new Promise((resolve, reject) => {
    signal = init.signal;
    signal.addEventListener('abort', () => reject(new DOMException('Timed out', 'AbortError')));
  }) });
  const result = await worker.context.checkUrlValidity('https://example.test/');
  assert.equal(result.status, 'unknown');
  assert.equal(result.reason, 'timeout');
  assert.equal(signal.aborted, true);
  const opaque = createWorker({ fetch: async () => ({ type: 'opaque', status: 0 }) });
  assert.equal((await opaque.context.checkUrlValidity('https://example.test/')).status, 'unknown');
});

test('scan state recovers after restart and concurrent scan starts are coalesced', async () => {
  const worker = createWorker({ state: { isScanning: true, scanResults: [invalid()] } });
  await worker.ready;
  assert.equal(worker.state.isScanning, false);
  assert.equal(worker.state.scanStatus, 'interrupted');
  const results = await Promise.all([worker.context.startBookmarkScan(), worker.context.startBookmarkScan()]);
  await worker.scanDone();
  assert.equal(results.filter(result => result.started).length, 1);
  assert.equal(worker.calls.tree, 1);
  assert.equal(worker.state.scanStatus, 'complete');
  assert.equal(worker.state.scanCurrent, 2);
  assert.equal((await worker.context.getScanState()).isScanning, false);
});

test('scan records four states and only counts confirmed missing HTTP pages', async () => {
  const tree = fixture();
  tree[0].children[0].children.push({ id: '12', title: 'Internal', url: 'chrome://bookmarks/' });
  const worker = createWorker({ tree, fetch: async url => new Response(null, { status: url.endsWith('missing') ? 404 : 500 }) });
  await worker.context.startBookmarkScan(); await worker.scanDone();
  assert.deepEqual(worker.state.scanResults.map(result => result.status), ['invalid', 'unknown', 'skipped']);
  assert.equal(worker.state.invalidLinksCount, 1);
  assert.equal(worker.state.scanProgress, 100);
});

test('empty scans complete and scan failures allow retry', async () => {
  const empty = createWorker({ tree: [] });
  await empty.context.startBookmarkScan(); await empty.scanDone();
  assert.equal(empty.state.scanStatus, 'complete'); assert.equal(empty.state.scanProgress, 100);
  const failing = createWorker({ treeError: true });
  await failing.context.startBookmarkScan(); await failing.scanDone();
  assert.equal(failing.state.isScanning, false);
  assert.equal(failing.state.scanStatus, 'error');
  assert.equal((await failing.context.startBookmarkScan()).started, true);
  await failing.scanDone();
});

test('cleanup waits for the matching completed download and ignores duplicate events', async () => {
  const worker = createWorker({ state: { scanResults: [invalid()] } });
  await worker.context.backupAndCleanBooks(['10']); await worker.idle();
  assert.equal(worker.calls.removed.length, 0);
  worker.chrome.downloads.onChanged.emit({ id: 99, state: { current: 'complete' } });
  await worker.idle(); assert.equal(worker.calls.removed.length, 0);
  await worker.changeDownload(1, { state: 'complete' });
  assert.deepEqual(worker.calls.removed, ['10']);
  assert.equal(worker.state.lastOperation.type, 'cleanComplete');
  assert.equal(worker.state.backupJob, null);
  await worker.changeDownload(1, { state: 'complete' });
  assert.equal(worker.calls.removed.length, 1);
});

test('interrupted, erased and missing-file backups never authorize deletion', async () => {
  for (const failure of ['interrupted', 'erased', 'missing-file']) {
    const worker = createWorker({ state: { scanResults: [invalid()] } });
    await worker.context.backupAndCleanBooks(['10']); await worker.idle();
    if (failure === 'erased') {
      worker.downloads.delete(1); worker.chrome.downloads.onErased.emit(1); await worker.idle();
    } else await worker.changeDownload(1, failure === 'interrupted' ? { state: 'interrupted', error: 'FILE_NO_SPACE' } : { state: 'complete', exists: false });
    assert.equal(worker.calls.removed.length, 0, failure);
    assert.equal(worker.state.lastOperation.type, 'cleanError');
    assert.equal(worker.state.backupJob, null);
  }
});

test('immediate completion and manual backups are reported only after completion', async () => {
  const fast = createWorker({ instantDownload: true, state: { scanResults: [invalid()] } });
  await fast.context.backupAndCleanBooks(['10']); await fast.idle();
  assert.deepEqual(fast.calls.removed, ['10']);
  const manual = createWorker();
  await manual.context.backupBookmarks(); await manual.idle();
  assert.equal(manual.calls.messages.some(message => message.type === 'backupComplete'), false);
  await manual.changeDownload(1, { state: 'complete' });
  assert.equal(manual.state.lastOperation.status, 'success');
  assert.equal(manual.calls.removed.length, 0);
});

test('pending backups survive a worker restart; partially started deletion is not repeated', async () => {
  const first = createWorker({ state: { scanResults: [invalid()] } });
  await first.context.backupAndCleanBooks(['10']); await first.idle();
  const resumed = createWorker({ state: first.state, downloads: [...first.downloads.values()] });
  await resumed.idle(); assert.equal(resumed.calls.removed.length, 0);
  await resumed.changeDownload(1, { state: 'complete' });
  assert.deepEqual(resumed.calls.removed, ['10']);
  const interrupted = createWorker({ state: { backupJob: { kind: 'clean', phase: 'removing' }, scanResults: [invalid()] } });
  await interrupted.ready;
  assert.equal(interrupted.calls.removed.length, 0);
  assert.equal(interrupted.state.backupJob, null);
  assert.equal(interrupted.state.scanResults.length, 0);
});

test('legacy, unknown, skipped and changed bookmarks cannot be deleted', async () => {
  for (const result of [
    { ...invalid(), status: undefined }, { ...invalid(), status: 'unknown' },
    { ...invalid(), status: 'skipped', url: 'javascript:alert(1)' }, { ...invalid(), url: 'https://edited.test/' }
  ]) {
    const worker = createWorker({ state: { scanResults: [result] } });
    await assert.rejects(worker.context.backupAndCleanBooks(['10']));
    assert.equal(worker.calls.downloads.length, 0);
    assert.equal(worker.calls.removed.length, 0);
  }
  const changed = createWorker({ state: { scanResults: [invalid()] } });
  await changed.context.backupAndCleanBooks(['10']); await changed.idle();
  changed.tree[0].children[0].children[0].url = 'https://edited.test/';
  await changed.changeDownload(1, { state: 'complete' });
  assert.equal(changed.calls.removed.length, 0);
  assert.equal(changed.state.lastOperation.type, 'cleanError');
});

test('duplicate clean requests, download-start errors and partial deletion fail safely', async () => {
  const worker = createWorker({ state: { scanResults: [invalid()] } });
  const attempts = await Promise.allSettled([worker.context.backupAndCleanBooks(['10']), worker.context.backupAndCleanBooks(['10'])]);
  assert.equal(attempts.filter(result => result.status === 'fulfilled').length, 1);
  await assert.rejects(worker.context.startBookmarkScan());
  const denied = createWorker({ downloadError: true, state: { scanResults: [invalid()] } });
  await assert.rejects(denied.context.backupAndCleanBooks(['10']));
  assert.equal(denied.calls.removed.length, 0);
  assert.equal(denied.state.backupJob, null);
  const partial = createWorker({ removeError: '11', state: { scanResults: [invalid(), invalid('11', 'https://example.test/other')] } });
  await partial.context.backupAndCleanBooks(['10', '11']); await partial.idle();
  await partial.changeDownload(1, { state: 'complete' });
  assert.deepEqual(partial.calls.removed, ['10']);
  assert.equal(partial.state.lastOperation.removedCount, 1);
  assert.equal(partial.state.scanResults.length, 0);
});

test('backup HTML escapes folder names, titles and quoted bookmarklet URLs', () => {
  const worker = createWorker();
  const html = worker.context.bookmarksToHtml([{ id: '0', title: '', children: [{
    title: '<Work> & "Personal"', children: [{ title: '<script>alert(1)</script>', url: 'javascript:alert("hello & goodbye")' }]
  }] }]);
  assert.ok(html.includes('&lt;Work&gt; &amp; &quot;Personal&quot;'));
  assert.ok(html.includes('HREF="javascript:alert(&quot;hello &amp; goodbye&quot;)"'));
  assert.equal(html.includes('<script>'), false);
  assert.equal(html.includes('Untitled Folder'), false);
});
