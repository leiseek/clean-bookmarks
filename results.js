document.addEventListener('DOMContentLoaded', function() {
  const element = id => document.getElementById(id);
  const text = (key, values = []) => chrome.i18n.getMessage(key, values.map(String));
  const labels = {
    pageTitle: 'resultsPageTitle', pageHeader: 'resultsPageHeader', refreshBtn: 'refreshButton',
    loadingState: 'loadingResults', selectAllLabel: 'selectAllInvalid', backupBtn: 'backupButton',
    cleanBtn: 'cleanButton', emptyStateIcon: 'emptyStateIcon', emptyStateTitle: 'emptyStateTitle',
    emptyStateText: 'emptyStateText', scanNowBtn: 'scanNowButton', confirmCleanTitle: 'confirmCleanTitle',
    confirmCleanActionsTitle: 'confirmCleanActionsTitle', cancelBtn: 'cancelButton',
    confirmCleanBtn: 'confirmCleanButton', cleanCompleteTitle: 'cleanCompleteTitle',
    closeResultBtn: 'closeButton', confirmCleanAction1: 'confirmCleanActions1',
    confirmCleanAction2: 'confirmCleanActions2', confirmCleanAction3: 'confirmCleanActions3',
    backupSavedText: 'backupSavedText'
  };
  for (const [id, key] of Object.entries(labels)) element(id).textContent = text(key);

  const autoClean = new URLSearchParams(window.location.search).get('action') === 'clean';
  let initialLoad = true;
  let scanResults = [];
  const selectedIds = new Set();
  let state = {};
  let requestPending = false;
  let stateVersion = 0;
  function statusOf(bookmark) {
    // Old versions did not distinguish unreachable from invalid. Require a new scan.
    if (!['valid', 'invalid', 'unknown', 'skipped'].includes(bookmark.status)) return 'unknown';
    if (bookmark.status === 'invalid' && (![404, 410].includes(bookmark.httpStatus) || !/^https?:\/\//i.test(bookmark.url))) return 'unknown';
    return bookmark.status;
  }
  function isBusy() { return requestPending || Boolean(state.backupJob) || state.isScanning; }
  function updateButtons() {
    const invalid = scanResults.filter(bookmark => statusOf(bookmark) === 'invalid');
    const selected = invalid.filter(bookmark => selectedIds.has(bookmark.id));
    element('selectAll').disabled = isBusy() || invalid.length === 0;
    element('selectAll').checked = invalid.length > 0 && selected.length === invalid.length;
    element('selectAll').indeterminate = selected.length > 0 && selected.length < invalid.length;
    element('cleanBtn').disabled = isBusy() || !selected.length;
    element('backupBtn').disabled = isBusy();
    element('confirmCleanBtn').disabled = isBusy();
    element('cancelBtn').disabled = isBusy();
    element('refreshBtn').disabled = isBusy();
    element('scanNowBtn').disabled = isBusy();
    element('confirmCleanBtn').textContent = text(isBusy() ? 'cleaningInProgress' : 'confirmCleanButton');
    document.querySelectorAll('.bookmark-checkbox.invalid').forEach(checkbox => { checkbox.disabled = isBusy(); });
  }

  function operationText() {
    if (state.backupJob) return text(state.backupJob.kind === 'clean' ? 'cleaningInProgress' : 'backupInProgress');
    const operation = state.lastOperation;
    if (!operation) return '';
    if (operation.type === 'cleanError' || operation.status === 'error') return operation.error || text('backupFailed');
    if (operation.type === 'cleanComplete') return text('cleanCompleteText', [operation.removedCount]);
    return text('backupSuccess');
  }

  async function loadScanResults() {
    const version = ++stateVersion;
    try {
      const nextState = await chrome.runtime.sendMessage({ type: 'getScanState' });
      if (version !== stateVersion) return;
      if (nextState.error) throw new Error(nextState.error);
      state = nextState;
      scanResults = state.scanStatus === 'complete' ? state.scanResults || [] : [];
      if (initialLoad && !state.isScanning) {
        if (autoClean) scanResults.filter(bookmark => statusOf(bookmark) === 'invalid').forEach(bookmark => selectedIds.add(bookmark.id));
        initialLoad = false;
      }
      element('loadingState').style.display = state.isScanning ? 'block' : 'none';
      element('loadingState').textContent = text('scanningButton');
      element('resultsContainer').style.display = !state.isScanning && state.scanStatus === 'complete' ? 'block' : 'none';
      element('emptyState').style.display = !state.isScanning && state.scanStatus !== 'complete' ? 'block' : 'none';
      element('emptyStateText').textContent = state.scanError || text('emptyStateText');
      element('operationStatus').textContent = operationText();
      displayResults();
    } catch (error) {
      element('loadingState').style.display = 'none';
      element('operationStatus').textContent = error.message;
    }
    updateButtons();
  }

  function displayResults() {
    const counts = { valid: 0, invalid: 0, unknown: 0, skipped: 0 };
    scanResults.forEach(bookmark => counts[statusOf(bookmark)]++);
    element('totalText').textContent = text('totalBookmarks', [scanResults.length]);
    for (const status of Object.keys(counts)) element(`${status}Text`).textContent = text(`${status}Bookmarks`, [counts[status]]);
    element('bookmarkList').replaceChildren();
    const folders = new Map();
    for (const bookmark of scanResults) {
      const folder = bookmark.folderPath || text('otherBookmarks');
      if (!folders.has(folder)) folders.set(folder, []);
      folders.get(folder).push(bookmark);
    }
    for (const name of [...folders.keys()].sort()) {
      const bookmarks = folders.get(name);
      const section = document.createElement('div');
      section.className = 'folder-section';
      const header = document.createElement('div');
      header.className = 'folder-header';
      const title = document.createElement('h3');
      title.className = 'folder-title';
      title.textContent = name;
      const stats = document.createElement('span');
      stats.className = 'folder-stats';
      stats.textContent = text('folderStats', [bookmarks.filter(bookmark => statusOf(bookmark) === 'invalid').length, bookmarks.length]);
      header.append(title, stats);
      section.append(header);
      const order = { invalid: 0, unknown: 1, valid: 2, skipped: 3 };
      bookmarks.sort((a, b) => order[statusOf(a)] - order[statusOf(b)]);
      bookmarks.forEach(bookmark => section.append(createBookmarkItem(bookmark)));
      element('bookmarkList').append(section);
    }
  }

  function createBookmarkItem(bookmark) {
    const status = statusOf(bookmark);
    const item = document.createElement('div');
    item.className = `bookmark-item ${status}`;
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = `bookmark-checkbox ${status}`;
    checkbox.value = bookmark.id;
    checkbox.checked = selectedIds.has(bookmark.id);
    checkbox.disabled = status !== 'invalid' || isBusy();
    checkbox.setAttribute('aria-label', bookmark.title || bookmark.url);
    if (status !== 'invalid') checkbox.style.display = 'none';
    checkbox.addEventListener('change', () => {
      if (checkbox.checked) selectedIds.add(bookmark.id); else selectedIds.delete(bookmark.id);
      updateButtons();
    });
    const info = document.createElement('div');
    info.className = 'bookmark-info';
    const title = document.createElement('div');
    title.className = 'bookmark-title';
    title.textContent = bookmark.title || text('untitledBookmark');
    const url = document.createElement('div');
    url.className = 'bookmark-url';
    url.textContent = bookmark.url;
    info.append(title, url);
    const reason = bookmark.status ? bookmark.reason : 'legacyResult';
    if (reason) {
      const note = document.createElement('div');
      note.className = 'bookmark-note';
      note.textContent = text(`reason${reason[0].toUpperCase()}${reason.slice(1)}`);
      info.append(note);
    }
    const badge = document.createElement('div');
    badge.className = `bookmark-status status-${status}`;
    badge.textContent = text(`status${status[0].toUpperCase()}${status.slice(1)}`) +
      (bookmark.httpStatus ? ` (HTTP ${bookmark.httpStatus})` : '');
    item.addEventListener('click', event => {
      if (event.target !== checkbox) chrome.tabs.create({ url: bookmark.url });
    });
    item.append(checkbox, info, badge);
    return item;
  }

  element('selectAll').addEventListener('change', () => {
    document.querySelectorAll('.bookmark-checkbox.invalid').forEach(checkbox => {
      checkbox.checked = element('selectAll').checked;
      if (checkbox.checked) selectedIds.add(checkbox.value); else selectedIds.delete(checkbox.value);
    });
    updateButtons();
  });
  element('cleanBtn').addEventListener('click', () => {
    element('confirmCleanText').textContent = text('confirmCleanText', [selectedIds.size]);
    element('confirmModal').style.display = 'block';
  });
  element('cancelBtn').addEventListener('click', () => { element('confirmModal').style.display = 'none'; });
  element('closeResultBtn').addEventListener('click', () => { element('resultModal').style.display = 'none'; });

  async function sendAction(message) {
    if (isBusy()) return;
    requestPending = true;
    updateButtons();
    try {
      const response = await chrome.runtime.sendMessage(message);
      if (response.error) throw new Error(response.error);
    } catch (error) {
      element('confirmModal').style.display = 'none';
      element('operationStatus').textContent = error.message;
    } finally {
      requestPending = false;
      await loadScanResults();
    }
  }
  element('confirmCleanBtn').addEventListener('click', () => sendAction({ type: 'backupAndClean', selectedIds: [...selectedIds] }));
  element('backupBtn').addEventListener('click', () => sendAction({ type: 'backupBookmarks' }));
  element('refreshBtn').addEventListener('click', () => sendAction({ type: 'startScan' }));
  element('scanNowBtn').addEventListener('click', () => sendAction({ type: 'startScan' }));

  chrome.runtime.onMessage.addListener(message => {
    if (message.type === 'cleanComplete') {
      element('confirmModal').style.display = 'none';
      element('cleanCompleteText').textContent = text('cleanCompleteText', [message.removedCount]);
      element('resultModal').style.display = 'block';
      selectedIds.clear();
    } else if (message.type === 'cleanError') {
      element('confirmModal').style.display = 'none';
    }
    if (['scanComplete', 'scanError', 'cleanComplete', 'cleanError', 'backupComplete'].includes(message.type)) loadScanResults();
  });
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && ['scanStatus', 'scanResults', 'backupJob', 'lastOperation'].some(key => key in changes)) loadScanResults();
  });
  loadScanResults();
});
