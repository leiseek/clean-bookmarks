document.addEventListener('DOMContentLoaded', function() {
  // 设置国际化文本
  document.getElementById('pageTitle').textContent = chrome.i18n.getMessage('resultsPageTitle');
  document.getElementById('pageHeader').textContent = chrome.i18n.getMessage('resultsPageHeader');
  document.getElementById('refreshBtn').textContent = chrome.i18n.getMessage('refreshButton');
  document.getElementById('loadingState').textContent = chrome.i18n.getMessage('loadingResults');
  document.getElementById('selectAllLabel').textContent = chrome.i18n.getMessage('selectAllInvalid');
  document.getElementById('backupBtn').textContent = chrome.i18n.getMessage('backupButton');
  document.getElementById('cleanBtn').textContent = chrome.i18n.getMessage('cleanButton');
  document.getElementById('emptyStateIcon').textContent = chrome.i18n.getMessage('emptyStateIcon');
  document.getElementById('emptyStateTitle').textContent = chrome.i18n.getMessage('emptyStateTitle');
  document.getElementById('emptyStateText').textContent = chrome.i18n.getMessage('emptyStateText');
  document.getElementById('scanNowBtn').textContent = chrome.i18n.getMessage('scanNowButton');
  document.getElementById('confirmCleanTitle').textContent = chrome.i18n.getMessage('confirmCleanTitle');
  document.getElementById('confirmCleanActionsTitle').textContent = chrome.i18n.getMessage('confirmCleanActionsTitle');
  document.getElementById('cancelBtn').textContent = chrome.i18n.getMessage('cancelButton');
  document.getElementById('confirmCleanBtn').textContent = chrome.i18n.getMessage('confirmCleanButton');
  document.getElementById('cleanCompleteTitle').textContent = chrome.i18n.getMessage('cleanCompleteTitle');
  document.getElementById('closeResultBtn').textContent = chrome.i18n.getMessage('closeButton');
  document.getElementById('confirmCleanAction1').textContent = chrome.i18n.getMessage('confirmCleanActions1');
  document.getElementById('confirmCleanAction2').textContent = chrome.i18n.getMessage('confirmCleanActions2');
  document.getElementById('confirmCleanAction3').textContent = chrome.i18n.getMessage('confirmCleanActions3');
  document.getElementById('backupSavedText').textContent = chrome.i18n.getMessage('backupSavedText');
  
  // DOM元素
  const loadingState = document.getElementById('loadingState');
  const resultsContainer = document.getElementById('resultsContainer');
  const emptyState = document.getElementById('emptyState');
  const bookmarkList = document.getElementById('bookmarkList');
  const selectAll = document.getElementById('selectAll');
  const cleanBtn = document.getElementById('cleanBtn');
  const backupBtn = document.getElementById('backupBtn');
  const confirmModal = document.getElementById('confirmModal');
  const resultModal = document.getElementById('resultModal');
  const confirmCleanText = document.getElementById('confirmCleanText'); // 修正变量名
  const cleanCompleteText = document.getElementById('cleanCompleteText'); // 修正变量名
  
  let scanResults = [];
  let isAutoClean = false; // 用于标识是否自动进入清理模式
  
  // 检查URL参数，判断是否自动进入清理模式
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('action') === 'clean') {
    isAutoClean = true;
  }
  
  // 加载扫描结果
  loadScanResults();
  
  // 事件监听
  document.getElementById('refreshBtn').addEventListener('click', function() {
    chrome.runtime.sendMessage({ type: 'startScan' });
    window.close();
  });
  
  document.getElementById('scanNowBtn').addEventListener('click', function() {
    chrome.runtime.sendMessage({ type: 'startScan' });
    window.close();
  });
  
  selectAll.addEventListener('change', function() {
    const checkboxes = document.querySelectorAll('.bookmark-checkbox.invalid');
    checkboxes.forEach(checkbox => {
      checkbox.checked = selectAll.checked;
    });
    updateCleanButton();
  });
  
  backupBtn.addEventListener('click', backupBookmarks);
  cleanBtn.addEventListener('click', showConfirmDialog);
  document.getElementById('confirmCleanBtn').addEventListener('click', cleanSelectedBookmarks);
  document.getElementById('cancelBtn').addEventListener('click', hideConfirmDialog);
  document.getElementById('closeResultBtn').addEventListener('click', function() {
    resultModal.style.display = 'none';
    window.location.href = 'results.html'; // 刷新页面
  });
  
  // 监听来自background的消息
  chrome.runtime.onMessage.addListener(function(message) {
    if (message.type === 'cleanComplete') {
        hideConfirmDialog();
        cleanCompleteText.textContent = chrome.i18n.getMessage('cleanCompleteText', [message.removedCount]);
        resultModal.style.display = 'block';
    } else if (message.type === 'cleanError') {
      hideConfirmDialog();
      alert(chrome.i18n.getMessage('cleanError') + message.error);
    } else if (message.type === 'backupComplete') {
      // 处理备份完成消息
      if (message.status === 'success') {
        alert(chrome.i18n.getMessage('backupSuccess') || message.message || '书签备份成功');
      } else if (message.status === 'empty') {
        alert(chrome.i18n.getMessage('backupEmpty') || message.message || '没有找到可备份的书签内容');
      } else if (message.status === 'error') {
        alert(chrome.i18n.getMessage('backupFailed') || message.message || '书签备份失败');
      }
    }
  });
  
  // 加载扫描结果
  function loadScanResults() {
    chrome.storage.local.get(['scanResults'], function(result) {
      if (result.scanResults && result.scanResults.length > 0) {
        scanResults = result.scanResults;
        displayResults();
        loadingState.style.display = 'none';
        resultsContainer.style.display = 'block';
        
        // 如果是自动进入清理模式，自动选中所有失效链接
        if (isAutoClean) {
          selectAll.checked = true;
          selectAll.dispatchEvent(new Event('change'));
          updateCleanButton();
        }
      } else {
        loadingState.style.display = 'none';
        emptyState.style.display = 'block';
      }
    });
  }
  
  // 显示结果
  function displayResults() {
    // 更新统计数据
const totalCount = scanResults.length;
const invalidCount = scanResults.filter(item => !item.isValid).length;
const validCount = totalCount - invalidCount;

document.getElementById('totalText').textContent = chrome.i18n.getMessage('totalBookmarks', [totalCount]);
document.getElementById('invalidText').textContent = chrome.i18n.getMessage('invalidBookmarks', [invalidCount]);
document.getElementById('validText').textContent = chrome.i18n.getMessage('validBookmarks', [validCount]);
    
    // 清空列表
    bookmarkList.innerHTML = '';
    
    // 按文件夹分组
    const bookmarksByFolder = {};
    scanResults.forEach(bookmark => {
      const folder = bookmark.folderPath || '其他书签';
      if (!bookmarksByFolder[folder]) {
        bookmarksByFolder[folder] = [];
      }
      bookmarksByFolder[folder].push(bookmark);
    });
    
    // 按文件夹名称排序
    const sortedFolders = Object.keys(bookmarksByFolder).sort();
    
    // 创建文件夹分组
    sortedFolders.forEach(folderName => {
      const folderSection = createFolderSection(folderName, bookmarksByFolder[folderName]);
      bookmarkList.appendChild(folderSection);
    });
    
    // 初始化全选复选框状态
    updateCleanButton();
  }
  
  // 创建文件夹分组
  function createFolderSection(folderName, bookmarks) {
    const section = document.createElement('div');
    section.className = 'folder-section';
    
    const folderHeader = document.createElement('div');
    folderHeader.className = 'folder-header';
    
    const folderTitle = document.createElement('h3');
    folderTitle.className = 'folder-title';
    folderTitle.textContent = folderName;
    
    // 统计文件夹中的失效链接数
    const invalidCount = bookmarks.filter(item => !item.isValid).length;
    const totalCount = bookmarks.length;
    
    const folderStats = document.createElement('span');
    folderStats.className = 'folder-stats';
    folderStats.textContent = `${invalidCount}/${totalCount} 失效`;
    
    folderHeader.appendChild(folderTitle);
    folderHeader.appendChild(folderStats);
    section.appendChild(folderHeader);
    
    // 按状态排序，失效的在前面
    const sortedBookmarks = [...bookmarks].sort((a, b) => {
      if (a.isValid === b.isValid) return 0;
      return a.isValid ? 1 : -1;
    });
    
    // 创建书签项
    sortedBookmarks.forEach(bookmark => {
      const bookmarkItem = createBookmarkItem(bookmark);
      section.appendChild(bookmarkItem);
    });
    
    return section;
  }
  
  // 创建书签项
  function createBookmarkItem(bookmark) {
    const item = document.createElement('div');
    item.className = `bookmark-item ${bookmark.isValid ? '' : 'invalid'}`;
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = `bookmark-checkbox ${bookmark.isValid ? '' : 'invalid'}`;
    checkbox.value = bookmark.id;
    
    // 只有失效的书签可以选择
    if (!bookmark.isValid) {
      checkbox.checked = selectAll.checked;
    } else {
      checkbox.disabled = true;
      checkbox.style.display = 'none';
    }
    
    checkbox.addEventListener('change', updateCleanButton);
    
    const info = document.createElement('div');
    info.className = 'bookmark-info';
    
    const title = document.createElement('div');
    title.className = 'bookmark-title';
    title.textContent = bookmark.title;
    
    const url = document.createElement('div');
    url.className = 'bookmark-url';
    url.textContent = bookmark.url;
    
    info.appendChild(title);
    info.appendChild(url);
    
    const status = document.createElement('div');
    status.className = `bookmark-status ${bookmark.isValid ? 'status-valid' : 'status-invalid'}`;
    status.textContent = bookmark.isValid ? chrome.i18n.getMessage('statusValid') : chrome.i18n.getMessage('statusInvalid');
    
    // 添加点击事件，在item上创建一个可点击的链接
    item.style.cursor = 'pointer';
    item.addEventListener('click', function(e) {
      // 如果点击的是复选框，不处理打开链接
      if (e.target === checkbox) {
        return;
      }
      
      // 在新标签页打开链接
      chrome.tabs.create({ url: bookmark.url });
    });
    
    item.appendChild(checkbox);
    item.appendChild(info);
    item.appendChild(status);
    
    return item;
  }
  
  // 更新清理按钮状态
  function updateCleanButton() {
    const checkboxes = document.querySelectorAll('.bookmark-checkbox.invalid:checked');
    cleanBtn.disabled = checkboxes.length === 0;
    
    // 更新全选复选框状态
    const allInvalidCheckboxes = document.querySelectorAll('.bookmark-checkbox.invalid');
    const checkedInvalidCheckboxes = document.querySelectorAll('.bookmark-checkbox.invalid:checked');
    
    // 如果没有失效复选框，全选复选框禁用
    if (allInvalidCheckboxes.length === 0) {
      selectAll.disabled = true;
      selectAll.checked = false;
    } else {
      selectAll.disabled = false;
      // 如果所有失效复选框都被选中，则全选复选框也选中
      selectAll.checked = allInvalidCheckboxes.length === checkedInvalidCheckboxes.length;
    }
  }
  
  // 备份书签
  function backupBookmarks() {
    chrome.runtime.sendMessage({ type: 'backupBookmarks' }, function(response) {
      if (chrome.runtime.lastError) {
        console.error('备份请求发送失败:', chrome.runtime.lastError);
        alert(chrome.i18n.getMessage('backupFailed') || '备份失败，请稍后重试');
      } else if (response && response.started) {
        // 显示更明确的备份进行中消息，而不是简单的'备份已开始'
        alert(chrome.i18n.getMessage('backupInProgress') || '书签备份正在进行中，文件将自动下载到您的下载文件夹');
      }
    });
  }
  
  // 显示确认对话框
  function showConfirmDialog() {
    const checkboxes = document.querySelectorAll('.bookmark-checkbox.invalid:checked');
    const count = checkboxes.length;
    
    if (count === 0) {
      alert(chrome.i18n.getMessage('selectBookmarksToClean'));
      return;
    }
    
    confirmCleanText.textContent = chrome.i18n.getMessage('confirmCleanText', [count]);
    confirmModal.style.display = 'block';
  }
  
  // 隐藏确认对话框
  function hideConfirmDialog() {
    confirmModal.style.display = 'none';
  }
  
  // 清理选中的书签
  function cleanSelectedBookmarks() {
    const checkboxes = document.querySelectorAll('.bookmark-checkbox.invalid:checked');
    const selectedIds = Array.from(checkboxes).map(cb => cb.value);
    
    if (selectedIds.length === 0) {
      return;
    }
    
    chrome.runtime.sendMessage({ 
      type: 'backupAndClean', 
      selectedIds: selectedIds 
    });
  }
});