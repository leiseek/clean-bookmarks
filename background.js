// 存储扫描结果
let scanResults = [];
let isScanning = false;

// 监听来自popup的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'startScan') {
    startBookmarkScan();
    return true;
  } else if (message.type === 'getResults') {
    sendResponse({ results: scanResults });
    return true;
  } else if (message.type === 'backupAndClean') {
    backupAndCleanBooks(message.selectedIds);
    return true;
  } else if (message.type === 'backupBookmarks') {
    backupBookmarks();
    return true;
  }
});

// 开始扫描收藏夹
async function startBookmarkScan() {
  if (isScanning) return;
  isScanning = true;
  scanResults = [];
  
  try {
    // 获取所有书签
    const bookmarkTree = await chrome.bookmarks.getTree();
    const allBookmarks = flattenBookmarkTree(bookmarkTree);
    
    // 过滤出有URL的书签
    const urlBookmarks = allBookmarks.filter(bookmark => bookmark.url);
    
    // 发送初始进度
    sendProgressUpdate(0, `准备扫描 ${urlBookmarks.length} 个书签...`);
    
    // 逐个检查URL
    for (let i = 0; i < urlBookmarks.length; i++) {
      const bookmark = urlBookmarks[i];
      const progress = Math.round((i / urlBookmarks.length) * 100);
      
      sendProgressUpdate(progress, `正在检查: ${bookmark.title}`);
      
      try {
        // 检查URL是否可访问
        const isValid = await checkUrlValidity(bookmark.url);
        
        scanResults.push({
          id: bookmark.id,
          title: bookmark.title,
          url: bookmark.url,
          isValid: isValid,
          error: isValid ? null : '无法访问'
        });
      } catch (error) {
        scanResults.push({
          id: bookmark.id,
          title: bookmark.title,
          url: bookmark.url,
          isValid: false,
          error: error.message
        });
      }
      
      // 避免请求过于频繁，添加小延迟
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    // 保存扫描结果
    chrome.storage.local.set({ scanResults: scanResults }, function() {
      sendProgressUpdate(100, `扫描完成! 发现 ${scanResults.filter(item => !item.isValid).length} 个失效链接`);
      
      // 通知popup扫描完成
      chrome.runtime.sendMessage({
        type: 'scanComplete',
        results: scanResults
      });
    });
    
  } catch (error) {
    console.error('扫描过程中出错:', error);
    sendProgressUpdate(0, `扫描失败: ${error.message}`);
  } finally {
    isScanning = false;
  }
}

// 扁平化书签树结构
function flattenBookmarkTree(bookmarkNodes) {
  let result = [];
  
  function traverse(nodes) {
    for (const node of nodes) {
      if (node.children) {
        traverse(node.children);
      } else if (node.url) {
        result.push(node);
      }
    }
  }
  
  traverse(bookmarkNodes);
  return result;
}

// 检查URL有效性
async function checkUrlValidity(url) {
  return new Promise((resolve) => {
    // 创建一个超时定时器
    const timeoutId = setTimeout(() => {
      resolve(false);
    }, 5000); // 5秒超时
    
    // 使用fetch尝试访问URL
    fetch(url, { 
      method: 'HEAD',
      mode: 'no-cors'
    })
    .then(() => {
      clearTimeout(timeoutId);
      // 对于no-cors模式，我们只能判断请求是否发送成功
      // 不能准确判断HTTP状态码，但这对于大多数情况已经足够
      resolve(true);
    })
    .catch(() => {
      clearTimeout(timeoutId);
      resolve(false);
    });
  });
}

// 发送进度更新到popup
function sendProgressUpdate(progress, status) {
  chrome.runtime.sendMessage({
    type: 'scanProgress',
    progress: progress,
    status: status
  }).catch(() => {
    // 忽略错误，可能是popup已关闭
  });
}

// 备份书签
async function backupBookmarks() {
  try {
    // 获取所有书签数据用于备份
    const bookmarkTree = await chrome.bookmarks.getTree();
    const backupData = {
      timestamp: new Date().toISOString(),
      bookmarks: bookmarkTree
    };
    
    // 将数据转换为base64编码，避免使用URL.createObjectURL
    const jsonStr = JSON.stringify(backupData, null, 2);
    const base64 = btoa(unescape(encodeURIComponent(jsonStr)));
    const dataUrl = `data:application/json;base64,${base64}`;
    
    // 下载备份文件到桌面
    const filename = `bookmarks_backup_${new Date().toISOString().slice(0, 10)}.json`;
    chrome.downloads.download({
      url: dataUrl,
      filename: filename,
      saveAs: false
    });
    
  } catch (error) {
    console.error('备份过程中出错:', error);
    chrome.runtime.sendMessage({
      type: 'cleanError',
      error: '备份过程中出错: ' + error.message
    });
  }
}

// 备份并清理书签
async function backupAndCleanBooks(selectedIds) {
  try {
    // 1. 获取所有书签数据用于备份
    const bookmarkTree = await chrome.bookmarks.getTree();
    const backupData = {
      timestamp: new Date().toISOString(),
      bookmarks: bookmarkTree
    };
    
    // 2. 将数据转换为base64编码，避免使用URL.createObjectURL
    const jsonStr = JSON.stringify(backupData, null, 2);
    const base64 = btoa(unescape(encodeURIComponent(jsonStr)));
    const dataUrl = `data:application/json;base64,${base64}`;
    
    // 3. 下载备份文件到桌面
    const filename = `bookmarks_backup_${new Date().toISOString().slice(0, 10)}.json`;
    chrome.downloads.download({
      url: dataUrl,
      filename: filename,
      saveAs: false
    }, function(downloadId) {
      // 4. 备份完成后开始删除失效书签
      if (chrome.runtime.lastError) {
        console.error('下载备份文件失败:', chrome.runtime.lastError);
        chrome.runtime.sendMessage({
          type: 'cleanError',
          error: '备份文件下载失败: ' + chrome.runtime.lastError.message
        });
        return;
      }
      
      // 添加一个短暂延迟，确保文件已完全下载
      setTimeout(() => {
        removeInvalidBookmarks(selectedIds);
      }, 1000);
    });
    
  } catch (error) {
    console.error('备份和清理过程中出错:', error);
    chrome.runtime.sendMessage({
      type: 'cleanError',
      error: error.message
    });
  }
}

// 删除失效书签
async function removeInvalidBookmarks(bookmarkIds) {
  try {
    let removedCount = 0;
    
    for (const id of bookmarkIds) {
      await chrome.bookmarks.remove(id);
      removedCount++;
    }
    
    // 清理本地存储的扫描结果
    chrome.storage.local.remove('scanResults');
    
    // 通知清理完成
    chrome.runtime.sendMessage({
      type: 'cleanComplete',
      removedCount: removedCount
    });
    
  } catch (error) {
    console.error('删除书签过程中出错:', error);
    chrome.runtime.sendMessage({
      type: 'cleanError',
      error: error.message
    });
  }
}