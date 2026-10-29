const REQUEST_TIMEOUT_MS = 10000;
let scanTask = null;
let backupJob = null;
let backupQueue = Promise.resolve();

const messageText = (key, values = []) => chrome.i18n.getMessage(key, values.map(String));

async function notify(message) {
  try {
    await chrome.runtime.sendMessage(message);
  } catch {
    // Extension pages may be closed; durable state remains in storage.
  }
}

// Register download listeners synchronously so downloads can wake this worker.
chrome.downloads.onChanged.addListener(delta => {
  if (delta.state || delta.error || delta.exists) queueBackupCheck(delta.id);
});
chrome.downloads.onErased.addListener(id => queueBackupCheck(id));

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const handlers = {
    startScan: startBookmarkScan,
    getScanState: getScanState,
    getResults: async () => ({ results: (await getScanState()).scanResults || [] }),
    backupBookmarks: backupBookmarks,
    backupAndClean: () => backupAndCleanBooks(message.selectedIds)
  };
  if (!Object.hasOwn(handlers, message.type)) return false;
  Promise.resolve().then(handlers[message.type]).then(sendResponse, error => {
    sendResponse({ started: false, error: error.message });
  });
  return true;
});

async function initializeWorker() {
  const state = await chrome.storage.local.get(['isScanning', 'backupJob']);
  if (state.isScanning) {
    await chrome.storage.local.set({
      isScanning: false, scanStatus: 'interrupted', scanResults: [],
      scanError: messageText('scanInterrupted')
    });
  }
  backupJob = state.backupJob || null;
  if (backupJob && backupJob.phase !== 'downloading') {
    // Never repeat a partially completed deletion after a worker restart.
    if (backupJob.kind === 'clean') {
      await chrome.storage.local.set({ scanResults: [], scanStatus: 'ready', invalidLinksCount: 0 });
    }
    await finishBackupJob({
      type: backupJob.kind === 'clean' ? 'cleanError' : 'backupComplete',
      status: 'error', error: messageText('operationInterrupted')
    });
  }
}

const workerReady = initializeWorker();
workerReady.then(() => {
  if (backupJob) queueBackupCheck(backupJob.downloadId);
}).catch(error => console.error('Unable to restore extension state:', error));

async function getScanState() {
  await workerReady;
  const state = await chrome.storage.local.get([
    'scanStatus', 'scanResults', 'scanProgress', 'scanCurrent', 'scanTotal',
    'currentBookmark', 'invalidLinksCount', 'scanError', 'backupJob', 'lastOperation'
  ]);
  return { ...state, isScanning: Boolean(scanTask) && state.scanStatus === 'scanning' };
}

async function startBookmarkScan() {
  await workerReady;
  if (scanTask) return { started: false, isScanning: true };
  if (backupJob) throw new Error(messageText('operationBusy'));
  scanTask = runBookmarkScan().finally(() => { scanTask = null; });
  scanTask.catch(error => console.error('Unable to save scan state:', error));
  return { started: true };
}

async function runBookmarkScan() {
  try {
    await chrome.storage.local.set({
      isScanning: true, scanStatus: 'scanning', scanError: '', scanResults: [],
      scanProgress: 0, scanCurrent: 0, scanTotal: 0, currentBookmark: null, invalidLinksCount: 0
    });
    const bookmarks = flattenBookmarkTree(await chrome.bookmarks.getTree());
    await chrome.storage.local.set({ scanTotal: bookmarks.length });
    const results = [];
    let invalidCount = 0;
    for (const [index, bookmark] of bookmarks.entries()) {
      await chrome.storage.local.set({ currentBookmark: bookmark });
      const validity = await checkUrlValidity(bookmark.url);
      results.push({
        id: bookmark.id, title: bookmark.title, url: bookmark.url,
        folderPath: bookmark.folderPath, ...validity,
        isValid: validity.status === 'valid' ? true : validity.status === 'invalid' ? false : null
      });
      if (validity.status === 'invalid') invalidCount++;
      const progress = Math.round((index + 1) / bookmarks.length * 100);
      await chrome.storage.local.set({
        scanProgress: progress, scanCurrent: index + 1, invalidLinksCount: invalidCount
      });
      await notify({
        type: 'scanProgress', progress,
        details: { currentIndex: index + 1, total: bookmarks.length,
          currentTitle: bookmark.title, currentUrl: bookmark.url, invalidCount }
      });
      if (index + 1 < bookmarks.length) await new Promise(resolve => setTimeout(resolve, 300));
    }
    await chrome.storage.local.set({
      scanResults: results, isScanning: false, scanStatus: 'complete', scanProgress: 100,
      scanCurrent: bookmarks.length, invalidLinksCount: invalidCount
    });
    await notify({ type: 'scanComplete', results });
  } catch (error) {
    await chrome.storage.local.set({ isScanning: false, scanStatus: 'error', scanError: error.message });
    await notify({ type: 'scanError', error: error.message });
  }
}

function flattenBookmarkTree(nodes, path = []) {
  return nodes.flatMap(node => {
    if (node.children) return flattenBookmarkTree(node.children, node.title ? [...path, node.title] : path);
    return node.url ? [{ ...node, folderPath: path.join(' > ') || messageText('otherBookmarks') }] : [];
  });
}

async function requestStatus(url, method) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      method, signal: controller.signal, credentials: 'omit', cache: 'no-store', redirect: 'follow'
    });
    // GET is used only as a HEAD fallback; do not download the whole page body.
    if (response.body) response.body.cancel().catch(() => {});
    return response;
  } finally {
    clearTimeout(timeout);
    controller.abort();
  }
}

async function checkUrlValidity(url) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return { status: 'unknown', reason: 'invalidUrl' };
  }
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return { status: 'skipped', reason: 'unsupportedProtocol' };
  }
  try {
    let response = await requestStatus(url, 'HEAD');
    if ([405, 501].includes(response.status)) response = await requestStatus(url, 'GET');
    if (response.type === 'opaque' || response.status === 0) {
      return { status: 'unknown', reason: 'unreadableResponse' };
    }
    if (response.ok) return { status: 'valid', httpStatus: response.status };
    if ([404, 410].includes(response.status)) return { status: 'invalid', httpStatus: response.status };
    return { status: 'unknown', httpStatus: response.status, reason: 'httpError' };
  } catch (error) {
    return { status: 'unknown', reason: error.name === 'AbortError' ? 'timeout' : 'networkError' };
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
}

function bookmarksToHtml(bookmarkTree) {
  const title = escapeHtml(messageText('bookmarksHtmlTitle'));
  let html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>\n<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">\n<TITLE>${title}</TITLE>\n<H1>${title}</H1>\n<DL><p>\n`;
  function traverse(nodes, level = 1) {
    for (const node of nodes) {
      const indent = '  '.repeat(level);
      if (node.children) {
        if (node.id === '0') { traverse(node.children, level); continue; }
        html += `${indent}<DT><H3>${escapeHtml(node.title || messageText('untitledFolder'))}</H3>\n${indent}<DL><p>\n`;
        traverse(node.children, level + 1);
        html += `${indent}</DL><p>\n`;
      } else if (node.url) {
        html += `${indent}<DT><A HREF="${escapeHtml(node.url)}">${escapeHtml(node.title || messageText('untitledBookmark'))}</A>\n`;
      }
    }
  }
  traverse(bookmarkTree);
  return html + '</DL><p>\n';
}

function isConfirmedInvalid(bookmark) {
  return bookmark.status === 'invalid' && [404, 410].includes(bookmark.httpStatus) && /^https?:\/\//i.test(bookmark.url);
}

async function validateSelection(selectedIds, tree, originalSelection) {
  if (!Array.isArray(selectedIds) || !selectedIds.length || selectedIds.some(id => typeof id !== 'string')) {
    throw new Error(messageText('selectBookmarksToClean'));
  }
  const { scanResults = [] } = await chrome.storage.local.get('scanResults');
  const results = new Map(scanResults.filter(isConfirmedInvalid).map(bookmark => [bookmark.id, bookmark]));
  const current = new Map(flattenBookmarkTree(tree).map(bookmark => [bookmark.id, bookmark]));
  return [...new Set(selectedIds)].map(id => {
    const result = results.get(id);
    const bookmark = current.get(id);
    if (!result || !bookmark || result.url !== bookmark.url ||
        (originalSelection && !originalSelection.some(item => item.id === id && item.url === bookmark.url))) {
      throw new Error(messageText('staleSelection'));
    }
    return { id, url: bookmark.url };
  });
}

async function backupBookmarks() { return startBackup(); }
async function backupAndCleanBooks(selectedIds) { return startBackup(selectedIds); }

async function startBackup(selectedIds) {
  await workerReady;
  if (backupJob || scanTask) throw new Error(messageText('operationBusy'));
  backupJob = { kind: selectedIds === undefined ? 'backup' : 'clean', phase: 'starting' };
  try {
    await chrome.storage.local.set({ backupJob, lastOperation: null });
    const tree = await chrome.bookmarks.getTree();
    if (backupJob.kind === 'clean') backupJob.selectedBookmarks = await validateSelection(selectedIds, tree);
    const html = bookmarksToHtml(tree);
    const filename = `bookmarks_backup_${new Date().toISOString().replace(/[:.]/g, '-')}.html`;
    const downloadId = await chrome.downloads.download({
      url: `data:text/html;base64,${btoa(unescape(encodeURIComponent(html)))}`,
      filename, saveAs: false, conflictAction: 'uniquify'
    });
    backupJob = { ...backupJob, filename, downloadId, phase: 'downloading' };
    await chrome.storage.local.set({ backupJob });
    // A small data URL may finish before its id is persisted.
    queueBackupCheck(downloadId);
    return { started: true };
  } catch (error) {
    await finishBackupJob({
      type: backupJob.kind === 'clean' ? 'cleanError' : 'backupComplete', status: 'error', error: error.message
    });
    throw error;
  }
}

function queueBackupCheck(id) {
  backupQueue = backupQueue.then(async () => {
    await workerReady;
    if (backupJob && backupJob.downloadId === id) await checkBackupDownload();
  }).catch(async error => {
    console.error('Backup operation failed:', error);
    if (backupJob) {
      await finishBackupJob({
        type: backupJob.kind === 'clean' ? 'cleanError' : 'backupComplete', status: 'error', error: error.message
      });
    }
  });
  return backupQueue;
}

async function checkBackupDownload() {
  const job = backupJob;
  const [download] = await chrome.downloads.search({ id: job.downloadId });
  if (!download || download.state === 'interrupted' || download.exists === false) {
    throw new Error(messageText('backupFailed') + (download?.error ? ` (${download.error})` : ''));
  }
  if (download.state !== 'complete') return;
  if (job.kind === 'backup') {
    await finishBackupJob({ type: 'backupComplete', status: 'success', filename: job.filename });
    return;
  }
  const selection = await validateSelection(
    job.selectedBookmarks.map(bookmark => bookmark.id), await chrome.bookmarks.getTree(), job.selectedBookmarks
  );
  backupJob = { ...job, phase: 'removing' };
  await chrome.storage.local.set({ backupJob });
  let removedCount = 0;
  try {
    for (const bookmark of selection) {
      const [current] = await chrome.bookmarks.get(bookmark.id);
      if (current.url !== bookmark.url) throw new Error(messageText('staleSelection'));
      await chrome.bookmarks.remove(bookmark.id);
      removedCount++;
    }
    const { scanResults = [] } = await chrome.storage.local.get('scanResults');
    const removedIds = new Set(selection.map(bookmark => bookmark.id));
    const remaining = scanResults.filter(bookmark => !removedIds.has(bookmark.id));
    await chrome.storage.local.set({
      scanResults: remaining, invalidLinksCount: remaining.filter(isConfirmedInvalid).length
    });
    await finishBackupJob({ type: 'cleanComplete', removedCount, filename: job.filename });
  } catch (error) {
    await chrome.storage.local.set({ scanResults: [], scanStatus: 'ready', invalidLinksCount: 0 });
    await finishBackupJob({ type: 'cleanError', error: error.message, removedCount, filename: job.filename });
  }
}

async function finishBackupJob(message) {
  await chrome.storage.local.set({ backupJob: null, lastOperation: message });
  backupJob = null;
  await notify(message);
}
