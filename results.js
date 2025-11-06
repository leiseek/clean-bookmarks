document.addEventListener('DOMContentLoaded', function() {
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
  const confirmCount = document.getElementById('confirmCount');
  const cleanedCount = document.getElementById('cleanedCount');
  
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
      cleanedCount.textContent = message.removedCount;
      resultModal.style.display = 'block';
    } else if (message.type === 'cleanError') {
      hideConfirmDialog();
      alert('清理过程中出错: ' + message.error);
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
    
    document.getElementById('totalCount').textContent = totalCount;
    document.getElementById('invalidCount').textContent = invalidCount;
    document.getElementById('validCount').textContent = validCount;
    
    // 清空列表
    bookmarkList.innerHTML = '';
    
    // 按状态排序，失效的在前面
    const sortedResults = [...scanResults].sort((a, b) => {
      if (a.isValid === b.isValid) return 0;
      return a.isValid ? 1 : -1;
    });
    
    // 创建书签项
    sortedResults.forEach(bookmark => {
      const bookmarkItem = createBookmarkItem(bookmark);
      bookmarkList.appendChild(bookmarkItem);
    });
    
    // 初始化全选复选框状态
    updateCleanButton();
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
    status.textContent = bookmark.isValid ? '正常' : '失效';
    
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
    chrome.runtime.sendMessage({ type: 'backupBookmarks' });
    alert('收藏夹备份已开始，请查看下载列表');
  }
  
  // 显示确认对话框
  function showConfirmDialog() {
    const checkboxes = document.querySelectorAll('.bookmark-checkbox.invalid:checked');
    const count = checkboxes.length;
    
    if (count === 0) {
      alert('请选择要清理的书签');
      return;
    }
    
    confirmCount.textContent = count;
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