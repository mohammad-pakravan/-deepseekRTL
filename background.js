let isEnabled = true;

chrome.storage.local.get(['rtlEnabled'], (result) => {
  if (result.rtlEnabled !== undefined) {
    isEnabled = result.rtlEnabled;
  } else {
    chrome.storage.local.set({ rtlEnabled: true });
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'getStatus') {
    sendResponse({ enabled: isEnabled });
  } else if (request.type === 'toggleStatus') {
    isEnabled = request.enabled;
    chrome.storage.local.set({ rtlEnabled: isEnabled });
    
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'statusChanged', enabled: isEnabled });
      }
    });
    sendResponse({ enabled: isEnabled });
  }
  return true;
});