document.addEventListener('DOMContentLoaded', function() {
  const scanBtn = document.getElementById('scanBtn');
  const viewBtn = document.getElementById('viewBtn');
  const cleanBtn = document.getElementById('cleanBtn');
  const progressBar = document.getElementById('progressBar');
  const progress = document.getElementById('progress');
  const status = document.getElementById('status');

  // 检查是否已有扫描结果
  chrome.storage.local.get(['scanResults'], function(result) {
    if (result.scanResults) {
      updateUIState(true, result.scanResults);
    }
  });

  // 监听来自background的消息
  chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.type === 'scanProgress') {
      updateProgress(message.progress, message.status);
    } else if (message.type === 'scanComplete') {
      updateUIState(true, message.results);
    }
  });

  // 扫描按钮点击事件
  scanBtn.addEventListener('click', function() {
    scanBtn.disabled = true;
    scanBtn.textContent = '正在扫描...';
    progress.style.display = 'block';
    status.textContent = '正在获取收藏夹...';
    
    // 开始扫描
    chrome.runtime.sendMessage({ type: 'startScan' });
  });

  // 查看结果按钮点击事件
  viewBtn.addEventListener('click', function() {
    chrome.tabs.create({ url: 'results.html' });
  });

  // 清理按钮点击事件
  cleanBtn.addEventListener('click', function() {
    chrome.tabs.create({ url: 'results.html?action=clean' });
  });

  // 更新进度条
  function updateProgress(progressValue, statusText) {
    progressBar.style.width = progressValue + '%';
    status.textContent = statusText;
  }

  // 更新UI状态
  function updateUIState(hasResults, results) {
    scanBtn.disabled = false;
    scanBtn.textContent = '重新扫描';
    progress.style.display = 'none';
    
    if (hasResults && results) {
      const invalidLinks = results.filter(item => !item.isValid);
      status.textContent = `扫描完成: 发现 ${invalidLinks.length} 个失效链接`;
      viewBtn.disabled = false;
      
      if (invalidLinks.length > 0) {
        cleanBtn.disabled = false;
      } else {
        cleanBtn.disabled = true;
      }
    } else {
      status.textContent = '准备就绪';
      viewBtn.disabled = true;
      cleanBtn.disabled = true;
    }
  }
});