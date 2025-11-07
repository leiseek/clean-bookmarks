document.addEventListener('DOMContentLoaded', function() {
  // 设置国际化文本
  document.getElementById('popupTitle').textContent = chrome.i18n.getMessage('popupTitle');
  document.getElementById('scanBtn').textContent = chrome.i18n.getMessage('scanButton');
  document.getElementById('viewBtn').textContent = chrome.i18n.getMessage('viewResultsButton');
  document.getElementById('cleanBtn').textContent = chrome.i18n.getMessage('cleanButton');
  // 设置扫描详情中的标签文本
  document.getElementById('currentBookmarkLabel').textContent = chrome.i18n.getMessage('currentBookmarkLabel', '当前书签：');
  document.getElementById('urlLabel').textContent = chrome.i18n.getMessage('urlLabel', 'URL：');
  document.getElementById('invalidLinksLabel').textContent = chrome.i18n.getMessage('invalidLinksLabel', '已发现失效链接：');
  // 移除对status元素的引用

  const scanBtn = document.getElementById('scanBtn');
  const viewBtn = document.getElementById('viewBtn');
  const cleanBtn = document.getElementById('cleanBtn');
  const progressBar = document.getElementById('progressBar');
  const progress = document.getElementById('progress');
  // 移除status变量定义
  
  // 扫描详情元素
  const scanDetails = document.getElementById('scanDetails');
  const scanProgress = document.getElementById('scanProgress');
  const currentTitle = document.getElementById('currentTitle');
  const currentUrl = document.getElementById('currentUrl');
  const invalidCount = document.getElementById('invalidCount');
  
  // 恢复扫描状态
  restoreScanState();

  // 检查是否已有扫描结果
  chrome.storage.local.get(['scanResults'], function(result) {
    if (result.scanResults) {
      updateUIState(true, result.scanResults);
    }
  });

  // 监听来自background的消息
  chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.type === 'scanProgress') {
      updateProgress(message.progress, message.status, message.details);
    } else if (message.type === 'scanComplete') {
      updateUIState(true, message.results);
    }
  });

  // 扫描按钮点击事件
  scanBtn.addEventListener('click', function() {
    scanBtn.disabled = true;
    scanBtn.textContent = chrome.i18n.getMessage('scanningButton');
    progress.style.display = 'block';
    progressBar.style.width = '0%';
    // 移除status.textContent设置
    scanDetails.style.display = 'block';
    scanProgress.textContent = '0/0';
    currentTitle.textContent = '-';
    currentUrl.textContent = '-';
    invalidCount.textContent = '0';
    
    // 开始扫描，使用回调处理可能的错误
    chrome.runtime.sendMessage({ type: 'startScan' }, function(response) {
      if (chrome.runtime.lastError) {
        console.error('发送消息失败:', chrome.runtime.lastError.message);
        // 移除status.textContent设置
        scanBtn.disabled = false;
        scanBtn.textContent = chrome.i18n.getMessage('scanButton');
        scanDetails.style.display = 'none';
      }
    });
  });

  // 查看结果按钮点击事件
  viewBtn.addEventListener('click', function() {
    chrome.tabs.create({ url: 'results.html' });
  });

  // 清理按钮点击事件
  cleanBtn.addEventListener('click', function() {
    chrome.tabs.create({ url: 'results.html?action=clean' });
  });

  // 更新进度条和扫描详情
  function updateProgress(progressValue, statusText, details = {}) {
    progressBar.style.width = progressValue + '%';
    // 移除status.textContent设置
    
    // 更新扫描详情
    if (details && (details.currentIndex !== undefined || details.total !== undefined)) {
      scanDetails.style.display = 'block';
      
      // 显示进度信息
      if (details.currentIndex !== undefined && details.total !== undefined) {
        scanProgress.textContent = `${details.currentIndex}/${details.total}`;
      }
      
      // 显示当前书签标题
      if (details.currentTitle) {
        currentTitle.textContent = details.currentTitle.length > 20 
          ? details.currentTitle.substring(0, 20) + '...' 
          : details.currentTitle;
      }
      
      // 显示当前书签URL
      if (details.currentUrl) {
        currentUrl.textContent = details.currentUrl.length > 30 
          ? details.currentUrl.substring(0, 30) + '...' 
          : details.currentUrl;
      }
      
      // 显示已发现的无效链接数量
      if (details.invalidCount !== undefined) {
        invalidCount.textContent = details.invalidCount;
      }
    } else if (progressValue === 0 && !details.currentIndex) {
      // 如果是初始状态或错误状态，隐藏详情
      scanDetails.style.display = 'none';
    }
  }
  
  // 恢复扫描状态
  function restoreScanState() {
    chrome.storage.local.get(['isScanning', 'scanProgress', 'scanTotal', 'currentBookmark', 'invalidLinksCount'], function(result) {
      if (result.isScanning) {
        // 如果正在扫描，恢复进度和详情
        scanBtn.disabled = true;
        scanBtn.textContent = chrome.i18n.getMessage('scanningButton');
        progress.style.display = 'block';
        
        // 构建详情对象
        const details = {
          currentIndex: result.currentBookmark ? result.scanProgress * result.scanTotal / 100 : 0,
          total: result.scanTotal || 0,
          currentTitle: result.currentBookmark ? result.currentBookmark.title : '',
          currentUrl: result.currentBookmark ? result.currentBookmark.url : '',
          invalidCount: result.invalidLinksCount || 0
        };
        
        // 更新界面
        updateProgress(result.scanProgress || 0, chrome.i18n.getMessage('scanningButton'), details);
      }
    });
  }

  // 更新UI状态
  function updateUIState(hasResults, results) {
    scanBtn.disabled = false;
    scanBtn.textContent = chrome.i18n.getMessage('rescanButton');
    progress.style.display = 'none';
    scanDetails.style.display = 'none'; // 隐藏扫描详情
    
    if (hasResults && results) {
      // 移除status.textContent设置
      viewBtn.disabled = false;
      
      if (results.filter(item => !item.isValid).length > 0) {
        cleanBtn.disabled = false;
      } else {
        cleanBtn.disabled = true;
      }
    } else {
      // 移除status.textContent设置
      viewBtn.disabled = true;
      cleanBtn.disabled = true;
    }
  }
});