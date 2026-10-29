document.addEventListener('DOMContentLoaded', function() {
  const element = id => document.getElementById(id);
  const text = (key, values = []) => chrome.i18n.getMessage(key, values.map(String));
  for (const [id, key] of Object.entries({
    popupTitle: 'popupTitle', scanBtn: 'scanButton', viewBtn: 'viewResultsButton', cleanBtn: 'cleanButton',
    currentBookmarkLabel: 'currentBookmarkLabel', urlLabel: 'urlLabel', invalidLinksLabel: 'invalidLinksLabel',
    scanProgressLabel: 'scanProgressLabel'
  })) element(id).textContent = text(key);

  let stateVersion = 0;
  function render(state) {
    const scanning = state.isScanning;
    const busy = Boolean(state.backupJob);
    const completed = state.scanStatus === 'complete';
    element('scanBtn').disabled = scanning || busy;
    element('scanBtn').textContent = text(scanning ? 'scanningButton' : completed ? 'rescanButton' : 'scanButton');
    element('viewBtn').disabled = scanning || !completed;
    element('cleanBtn').disabled = scanning || busy || !completed ||
      !(state.scanResults || []).some(bookmark => bookmark.status === 'invalid');
    element('progress').style.display = scanning ? 'block' : 'none';
    element('scanDetails').style.display = scanning ? 'block' : 'none';
    element('progressBar').style.width = `${state.scanProgress || 0}%`;
    element('scanProgress').textContent = `${state.scanCurrent || 0}/${state.scanTotal || 0}`;
    element('currentTitle').textContent = state.currentBookmark?.title || '-';
    element('currentUrl').textContent = state.currentBookmark?.url || '-';
    element('invalidCount').textContent = state.invalidLinksCount || 0;
    element('scanStatus').textContent = busy ? text('backupInProgress') : state.scanError ||
      (completed ? text('scanComplete', [state.invalidLinksCount || 0]) : '');
  }

  async function refreshState() {
    const version = ++stateVersion;
    try {
      const state = await chrome.runtime.sendMessage({ type: 'getScanState' });
      if (version === stateVersion) {
        if (state.error) throw new Error(state.error);
        render(state);
      }
    } catch (error) {
      element('scanBtn').disabled = false;
      element('scanStatus').textContent = text('scanFailed', [error.message]);
    }
  }

  chrome.runtime.onMessage.addListener(message => {
    if (['scanProgress', 'scanComplete', 'scanError', 'cleanComplete', 'cleanError', 'backupComplete'].includes(message.type)) refreshState();
  });
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && ['isScanning', 'backupJob'].some(key => key in changes)) refreshState();
  });
  element('scanBtn').addEventListener('click', async () => {
    element('scanBtn').disabled = true;
    try {
      const response = await chrome.runtime.sendMessage({ type: 'startScan' });
      if (response.error) throw new Error(response.error);
      await refreshState();
    } catch (error) {
      element('scanBtn').disabled = false;
      element('scanStatus').textContent = text('scanFailed', [error.message]);
    }
  });
  element('viewBtn').addEventListener('click', () => chrome.tabs.create({ url: 'results.html' }));
  element('cleanBtn').addEventListener('click', () => chrome.tabs.create({ url: 'results.html?action=clean' }));
  refreshState();
});
