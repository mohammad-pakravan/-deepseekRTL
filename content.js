// ========== تنظیمات ==========
let isEnabled = true;
let currentFontSize = 16;

const MESSAGE_CLASSES = [
  '.ds-markdown-paragraph',
  '.fbb737a4',
  '.ds-message .ds-markdown p',
  'ol', 'ul', 'li',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'table', 'th', 'td'
];

const IGNORE_SELECTORS = [
  '.md-code-block', '.md-code-block-light', 'pre', 'code',
  '.ds-sidebar', 'nav', 'button', '.ds-icon-button',
  'input', 'textarea', '.ds-icon', '.ds-flex',
  '.db183363', '.d4910adc',
  '.timestamp', '.time', '.date'
];

// ========== توابع ==========
function hasPersian(text) {
  if (!text) return false;
  const onlyEnglish = /^[a-zA-Z0-9\s\n\t\r.,!?(){}[\]<>;:'"`~@#$%^&*_+=|\\/-]+$/;
  if (onlyEnglish.test(text.trim())) return false;
  return /[\u0600-\u06FF]/.test(text);
}

function shouldIgnore(el) {
  for (const sel of IGNORE_SELECTORS) {
    if (el.closest?.(sel) || el.matches?.(sel)) return true;
  }
  return false;
}

// اعمال سایز به یک المان
function applySizeToElement(el) {
  if (!isEnabled) return;
  const text = el.innerText || el.textContent;
  if (hasPersian(text)) {
    el.style.fontSize = currentFontSize + 'px';
  }
}

// تنظیم سایز هدینگ‌ها
function applyHeadingSizes() {
  if (!isEnabled) return;
  
  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
  headings.forEach(heading => {
    if (shouldIgnore(heading)) return;
    
    let relativeSize = currentFontSize;
    switch(heading.tagName) {
      case 'H1': relativeSize = currentFontSize * 1.8; break;
      case 'H2': relativeSize = currentFontSize * 1.5; break;
      case 'H3': relativeSize = currentFontSize * 1.3; break;
      case 'H4': relativeSize = currentFontSize * 1.1; break;
      case 'H5': relativeSize = currentFontSize * 1.0; break;
      case 'H6': relativeSize = currentFontSize * 0.9; break;
    }
    heading.style.fontSize = relativeSize + 'px';
  });
}

// راست‌چین کردن
function fixMessages() {
  if (!isEnabled) return;
  
  for (const sel of MESSAGE_CLASSES) {
    document.querySelectorAll(sel).forEach(el => {
      if (shouldIgnore(el)) return;
      const text = el.innerText || el.textContent;
      if (hasPersian(text)) {
        el.style.direction = 'rtl';
        el.style.textAlign = 'right';
        el.style.unicodeBidi = 'isolate';
        el.style.fontSize = currentFontSize + 'px';
      } else if (el.style.direction === 'rtl') {
        el.style.direction = '';
        el.style.textAlign = '';
        el.style.unicodeBidi = '';
        el.style.fontSize = '';
      }
      
      if (el.tagName === 'OL' || el.tagName === 'UL') {
        el.style.paddingRight = '25px';
        el.style.paddingLeft = '0';
      }
      if (el.tagName === 'LI') {
        el.style.marginRight = '20px';
        el.style.marginLeft = '0';
      }
    });
  }
  
  applyHeadingSizes();
}

// اعمال سایز به همه
function applySizeToAll() {
  if (!isEnabled) return;
  
  for (const sel of MESSAGE_CLASSES) {
    document.querySelectorAll(sel).forEach(el => {
      const text = el.innerText || el.textContent;
      if (hasPersian(text)) {
        el.style.fontSize = currentFontSize + 'px';
      }
    });
  }
  applyHeadingSizes();
}

// حذف همه تغییرات (وقتی افزونه غیرفعال میشه)
function removeAllChanges() {
  for (const sel of MESSAGE_CLASSES) {
    document.querySelectorAll(sel).forEach(el => {
      el.style.direction = '';
      el.style.textAlign = '';
      el.style.unicodeBidi = '';
      el.style.fontSize = '';
    });
  }
  document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(el => {
    el.style.fontSize = '';
  });
}

// ========== دریافت وضعیت ==========
chrome.runtime.sendMessage({ type: 'getStatus' }, (response) => {
  if (response) {
    isEnabled = response.enabled;
    if (isEnabled) {
      fixMessages();
    } else {
      removeAllChanges();
    }
  }
});

// دریافت تغییرات
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'statusChanged') {
    isEnabled = request.enabled;
    if (isEnabled) {
      fixMessages();
    } else {
      removeAllChanges();
    }
  } else if (request.type === 'changeFontSize') {
    currentFontSize = request.size;
    if (isEnabled) {
      applySizeToAll();
    }
  }
  sendResponse({});
  return true;
});

// بارگذاری سایز ذخیره شده
chrome.storage.local.get(['rtlFontSize'], (result) => {
  if (result.rtlFontSize) {
    currentFontSize = result.rtlFontSize;
  }
});

// ========== اجرا ==========
setTimeout(() => {
  if (isEnabled) fixMessages();
  
  const observer = new MutationObserver(() => {
    if (isEnabled) setTimeout(fixMessages, 50);
  });
  
  observer.observe(document.body, { 
    childList: true, 
    subtree: true, 
    characterData: true 
  });
  
  console.log('✅ Persian RTL Fixer Active');
}, 500);