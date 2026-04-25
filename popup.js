document.addEventListener('DOMContentLoaded', () => {
    const toggleCheckbox = document.getElementById('enableToggle');
    const statusText = document.getElementById('statusText');
    const sizeSlider = document.getElementById('sizeSlider');
    const sizeValue = document.getElementById('sizeValue');
    const sizeMinus = document.getElementById('sizeMinus');
    const sizePlus = document.getElementById('sizePlus');
  
    // بارگذاری وضعیت ذخیره شده
    chrome.storage.local.get(['rtlEnabled', 'rtlFontSize'], (result) => {
      const isEnabled = result.rtlEnabled !== undefined ? result.rtlEnabled : true;
      toggleCheckbox.checked = isEnabled;
      updateStatusUI(isEnabled);
      
      const savedSize = result.rtlFontSize || 16;
      sizeSlider.value = savedSize;
      updateSizeDisplay(savedSize);
    });
  
    function updateStatusUI(isEnabled) {
      if (isEnabled) {
        statusText.innerHTML = '✅ فعال';
        statusText.className = 'status-badge status-active';
      } else {
        statusText.innerHTML = '❌ غیرفعال';
        statusText.className = 'status-badge status-inactive';
      }
    }
  
    function updateSizeDisplay(size) {
      if (size <= 13) sizeValue.innerText = 'ریز';
      else if (size <= 16) sizeValue.innerText = 'متوسط';
      else if (size <= 19) sizeValue.innerText = 'بزرگ';
      else sizeValue.innerText = 'خیلی بزرگ';
    }
  
    // تغییر وضعیت فعال/غیرفعال
    toggleCheckbox.addEventListener('change', (e) => {
      const isEnabled = e.target.checked;
      updateStatusUI(isEnabled);
      
      chrome.runtime.sendMessage({ type: 'toggleStatus', enabled: isEnabled });
      chrome.storage.local.set({ rtlEnabled: isEnabled });
    });
  
    // تغییر سایز
    function sendSizeChange(size) {
      chrome.storage.local.set({ rtlFontSize: size });
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, { type: 'changeFontSize', size: size });
        }
      });
    }
  
    sizeSlider.addEventListener('input', (e) => {
      const size = parseInt(e.target.value);
      updateSizeDisplay(size);
      sendSizeChange(size);
    });
  
    sizeMinus.addEventListener('click', () => {
      let newSize = parseInt(sizeSlider.value) - 1;
      if (newSize < 12) newSize = 12;
      sizeSlider.value = newSize;
      updateSizeDisplay(newSize);
      sendSizeChange(newSize);
    });
  
    sizePlus.addEventListener('click', () => {
      let newSize = parseInt(sizeSlider.value) + 1;
      if (newSize > 22) newSize = 22;
      sizeSlider.value = newSize;
      updateSizeDisplay(newSize);
      sendSizeChange(newSize);
    });
  });