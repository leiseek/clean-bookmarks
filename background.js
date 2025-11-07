// 监听来自popup的消息
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.type === 'startScan') {
    // 直接调用扫描函数
    startBookmarkScan();
    sendResponse({ started: true });
    return true;
  } else if (message.type === 'getResults') {
    // 从存储中获取结果
    chrome.storage.local.get(['scanResults'], function(result) {
      sendResponse({ results: result.scanResults || [] });
    });
    return true;
  } else if (message.type === 'backupAndClean') {
    backupAndCleanBooks(message.selectedIds);
    sendResponse({ started: true });
    return true;
  } else if (message.type === 'backupBookmarks') {
    backupBookmarks();
    sendResponse({ started: true });
    return true;
  }
  return false;
});

// 使用storage来维护状态，而不是全局变量
// 这样service worker被重新激活时也能恢复状态

// 开始扫描收藏夹
async function startBookmarkScan() {
  // 首先检查是否已经在扫描中
  const storageResult = await new Promise(resolve => {
    chrome.storage.local.get(['isScanning'], resolve);
  });
  
  if (storageResult.isScanning) return;
  
  // 初始化状态
  const scanData = {
    isScanning: true,
    scanResults: [],
    scanProgress: 0,
    invalidLinksCount: 0
  };
  
  try {
    // 获取所有书签
    const bookmarkTree = await chrome.bookmarks.getTree();
    const allBookmarks = flattenBookmarkTree(bookmarkTree);
    
    // 过滤出有URL的书签
    const urlBookmarks = allBookmarks.filter(bookmark => bookmark.url);
    scanData.scanTotal = urlBookmarks.length;
    
    // 保存扫描状态到本地存储
    await new Promise(resolve => {
      chrome.storage.local.set({
        isScanning: true,
        scanProgress: 0,
        scanTotal: scanData.scanTotal,
        scanStatus: 'scanning',
        scanResults: [],
        invalidLinksCount: 0
      }, resolve);
    });
    
    // 发送初始进度
    sendProgressUpdate(0, chrome.i18n.getMessage('preparingScan', [scanData.scanTotal]));
    
    // 逐个检查URL
    for (let i = 0; i < urlBookmarks.length; i++) {
      const bookmark = urlBookmarks[i];
      const progress = Math.round(((i + 1) / scanData.scanTotal) * 100);
      
      // 更新进度数据
      scanData.scanProgress = progress;
      
      // 更新当前书签和进度到本地存储
      await new Promise(resolve => {
        chrome.storage.local.set({
          currentBookmark: bookmark,
          scanProgress: progress,
          invalidLinksCount: scanData.invalidLinksCount
        }, resolve);
      });
      
      // 发送详细进度信息
      sendProgressUpdate(progress, 
        chrome.i18n.getMessage('scanningProgress', [i + 1, scanData.scanTotal, bookmark.title, bookmark.url, scanData.invalidLinksCount]),
        {
          currentIndex: i + 1,
          total: scanData.scanTotal,
          currentTitle: bookmark.title,
          currentUrl: bookmark.url,
          invalidCount: scanData.invalidLinksCount
        }
      );
      
      try {
        // 检查URL是否可访问
        const isValid = await checkUrlValidity(bookmark.url);
        
        const resultItem = {
          id: bookmark.id,
          title: bookmark.title,
          url: bookmark.url,
          folderPath: bookmark.folderPath,
          isValid: isValid,
          error: isValid ? null : '无法访问'
        };
        
        scanData.scanResults.push(resultItem);
        
        if (!isValid) {
          scanData.invalidLinksCount++;
        }
      } catch (error) {
        scanData.scanResults.push({
          id: bookmark.id,
          title: bookmark.title,
          url: bookmark.url,
          folderPath: bookmark.folderPath,
          isValid: false,
          error: error.message
        });
        scanData.invalidLinksCount++;
      }
      
      // 避免请求过于频繁，添加小延迟
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    // 保存扫描结果
    await new Promise(resolve => {
      chrome.storage.local.set({
        scanResults: scanData.scanResults,
        isScanning: false,
        scanStatus: 'complete',
        invalidLinksCount: scanData.invalidLinksCount
      }, resolve);
    });
    
    sendProgressUpdate(100, 
      chrome.i18n.getMessage('scanCompleteWithResults', [scanData.invalidLinksCount]),
      {
        currentIndex: scanData.scanTotal,
        total: scanData.scanTotal,
        invalidCount: scanData.invalidLinksCount
      }
    );
    
    // 通知popup扫描完成
    try {
      await chrome.runtime.sendMessage({
        type: 'scanComplete',
        results: scanData.scanResults
      });
    } catch (err) {
      // popup可能已关闭，忽略错误
    }
    
  } catch (error) {
    console.error('扫描过程中出错:', error);
    // 保存错误状态
    await new Promise(resolve => {
      chrome.storage.local.set({
        isScanning: false,
        scanStatus: 'ready',
        scanError: error.message
      }, resolve);
    });
    
    sendProgressUpdate(0, chrome.i18n.getMessage('scanFailed', [error.message]));
  }
}

// 扁平化书签树结构
function flattenBookmarkTree(bookmarkNodes) {
  let result = [];
  
  function traverse(nodes, path = []) {
    for (const node of nodes) {
      if (node.children) {
        // 如果是文件夹，继续递归，并将当前文件夹名称添加到路径中
        traverse(node.children, [...path, node.title]);
      } else if (node.url) {
        // 如果是书签，添加到结果中，并包含路径信息
        result.push({
          ...node,
          folderPath: path.length > 0 ? path.join(' > ') : '其他书签'
        });
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
    }, 30000); // 30秒超时
    
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
async function sendProgressUpdate(progress, status, details = {}) {
  try {
    // 尝试发送消息，但不阻塞执行
    await chrome.runtime.sendMessage({
      type: 'scanProgress',
      progress: progress,
      status: status,
      details: details
    });
  } catch (error) {
    // 忽略错误，可能是popup已关闭或其他通信问题
    console.log('发送进度更新失败（可能是popup已关闭）:', error.message);
  }
}

// 将书签树转换为HTML格式
function bookmarksToHtml(bookmarkTree) {
  // 生成HTML头部
  let html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file.
     It will be read and overwritten.
     DO NOT EDIT! -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>书签备份</TITLE>
<H1>书签备份</H1>
<DL><p>
`;

  // 递归生成HTML内容
  function traverseNodes(nodes, level = 0) {
    for (const node of nodes) {
      if (node.children) {
        // 文件夹
        const indent = '  '.repeat(level);
        html += `${indent}<DT><H3>${node.title || '未命名文件夹'}</H3>
${indent}<DL><p>
`;
        traverseNodes(node.children, level + 1);
        html += `${indent}</DL><p>
`;
      } else if (node.url) {
        // 书签
        const indent = '  '.repeat(level);
        // 处理特殊字符
        const title = node.title.replace(/[<>&]/g, char => {
          return char === '<' ? '&lt;' : char === '>' ? '&gt;' : '&amp;';
        });
        html += `${indent}<DT><A HREF="${node.url}">${title || '未命名书签'}</A>
`;
      }
    }
  }

  // 开始遍历书签树
  traverseNodes(bookmarkTree);
  
  // 结束HTML文档
  html += `</DL><p>
`;
  return html;
}

// 备份书签
async function backupBookmarks() {
  try {
    // 获取所有书签数据用于备份
    const bookmarkTree = await chrome.bookmarks.getTree();
    
    // 检查书签树是否为空
    if (!bookmarkTree || bookmarkTree.length === 0) {
      console.warn('没有找到书签数据');
      // 发送备份完成但无内容的消息
      chrome.runtime.sendMessage({
        type: 'backupComplete',
        status: 'empty',
        message: '没有找到可备份的书签'
      }).catch(() => {}); // 忽略发送失败的错误
      return;
    }
    
    // 将书签转换为HTML格式
    const htmlContent = bookmarksToHtml(bookmarkTree);
    
    // 检查生成的HTML内容是否为空
    if (!htmlContent || htmlContent.trim().length === 0) {
      console.error('生成的书签HTML内容为空');
      chrome.runtime.sendMessage({
        type: 'backupComplete',
        status: 'error',
        message: '生成的书签内容为空'
      }).catch(() => {}); // 忽略发送失败的错误
      return;
    }
    
    // 将HTML内容转换为base64编码
    const base64 = btoa(unescape(encodeURIComponent(htmlContent)));
    const dataUrl = `data:text/html;base64,${base64}`;
    
    // 下载备份文件到桌面
    const filename = `bookmarks_backup_${new Date().toISOString().slice(0, 10)}.html`;
    
    // 使用Promise封装下载操作，以便更好地处理完成和错误情况
    await new Promise((resolve, reject) => {
      chrome.downloads.download({
        url: dataUrl,
        filename: filename,
        saveAs: false
      }, (downloadId) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(downloadId);
        }
      });
    });
    
    // 备份成功后发送通知
    chrome.runtime.sendMessage({
      type: 'backupComplete',
      status: 'success',
      message: `书签备份成功，文件名为: ${filename}`
    }).catch(() => {}); // 忽略发送失败的错误
    
  } catch (error) {
    console.error('备份过程中出错:', error);
    // 发送错误通知
    chrome.runtime.sendMessage({
      type: 'backupComplete',
      status: 'error',
      message: '备份过程中出错: ' + error.message
    }).catch(() => {}); // 忽略发送失败的错误
  }
}

// 备份并清理书签
async function backupAndCleanBooks(selectedIds) {
  try {
    // 1. 获取所有书签数据用于备份
    const bookmarkTree = await chrome.bookmarks.getTree();
    
    // 2. 将书签转换为HTML格式
    const htmlContent = bookmarksToHtml(bookmarkTree);
    
    // 3. 将HTML内容转换为base64编码
    const base64 = btoa(unescape(encodeURIComponent(htmlContent)));
    const dataUrl = `data:text/html;base64,${base64}`;
    
    // 4. 下载备份文件到桌面
    const filename = `bookmarks_backup_${new Date().toISOString().slice(0, 10)}.html`;
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