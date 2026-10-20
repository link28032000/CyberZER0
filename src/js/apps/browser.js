'use strict';

// ═══════════════════════════════════════════════════════════
// BROWSER
// ═══════════════════════════════════════════════════════════

let browserHistory = [];
let browserCurrentIdx = -1;
let browserBypassed = new Set(); // URLs the player chose to "Proceed (unsafe)" past the cert warning

// ── MULTI-TAB SYSTEM ──────────────────────────────────────
// Each tab: { id, url, title, icon, history, histIdx }
let browserTabs = [];
let browserActiveTabId = 0;
let browserTabCounter = 0;

function isPhishingUrl(url) {
  if (!url) return false;
  const lower = url.toLowerCase();
  if (lower.includes('canva-premium-free.example')) return true;
  return typeof getPhishingSiteForUrl === 'function' && getPhishingSiteForUrl(url) !== null;
}

let lastPhishingNoticeToastTime = 0;

function updateBrowserPhishingNotice(isPhishing, url) {
  const winCloseBtn = document.getElementById('browser-win-close');

  if (isPhishing) {
    if (winCloseBtn) {
      winCloseBtn.classList.add('phish-close-highlight');
      winCloseBtn.setAttribute('title', 'Close');
    }
  } else {
    if (winCloseBtn) {
      winCloseBtn.classList.remove('phish-close-highlight');
      winCloseBtn.setAttribute('title', 'Close');
    }
  }
}

const _lastPhishAwarenessTime = {};

function triggerRyanPhishingAwareness(url) {
  if (typeof RyanGuide === 'undefined') return;
  const curCat = window._currentChapterCategory || activeCategoryStory || 'phishing';
  if (curCat !== 'phishing') return;

  const host = extractHostFromUrl(url);
  const now = Date.now();
  if (_lastPhishAwarenessTime[host] && (now - _lastPhishAwarenessTime[host] < 20000)) {
    return; // Prevent duplicate rapid triggers on tab switches
  }
  _lastPhishAwarenessTime[host] = now;

  const lower = (url || '').toLowerCase();
  let dialogue;

  if (lower.includes('paypa1') || lower.includes('paypal1')) {
    dialogue = [
      { text: `⚠️ Typosquatting Alert! Look closely at the browser address bar: you're visiting "${host}" — notice the number "1" instead of the letter "l"!`, state: 'concerned' },
      { text: "This counterfeit site clones PayPal's login page and uses a fake prize claim of ₱1,000,000 Pesos to lure victims into surrendering their passwords.", state: 'speaking' },
      { text: "Authentic PayPal is strictly located at paypal.com. Never enter credentials or financial data on look-alike domains — close this tab immediately!", state: 'thinking' }
    ];
  } else if (lower.includes('business-account-verify.net')) {
    dialogue = [
      { text: `⚠️ Awareness Alert! Look at the browser address bar: you're visiting "${host}" — an unverified fake domain.`, state: 'concerned' },
      { text: "Notice how this page clones a corporate Single Sign-On (SSO) login. Attackers design these to trick employees into surrendering real workplace credentials.", state: 'speaking' },
      { text: "Always verify the address bar before typing passwords. If it's not the official organization domain, never type your password — close this tab immediately!", state: 'thinking' }
    ];
  } else if (lower.includes('m1crosoft')) {
    dialogue = [
      { text: `⚠️ Notice the URL bar! "${host}" replaces the letter "i" with the number "1" — this is called typosquatting!`, state: 'concerned' },
      { text: "It copies the official Microsoft 365 sign-in page, but any credentials entered here are captured directly by the adversary.", state: 'speaking' },
      { text: "Never judge a site by logos alone. Always scrutinize every character of the domain name in the address bar!", state: 'thinking' }
    ];
  } else if (lower.includes('bankng') || lower.includes('bpi-online-security')) {
    dialogue = [
      { text: `⚠️ High Alert! Look at the domain: "${host}". Legitimate financial institutions will never host verification pages on unverified or lookalike domains.`, state: 'concerned' },
      { text: "Attackers manufacture urgent account suspension warnings to scare you into entering your banking password and PINs.", state: 'speaking' },
      { text: "If you ever receive an urgent banking link, never log in through it. Open a fresh tab and navigate to the bank's official website directly.", state: 'thinking' }
    ];
  } else if (lower.includes('business-it-support.com')) {
    dialogue = [
      { text: `⚠️ Stay alert! This website pretends to be an IT Security compliance portal at "${host}".`, state: 'concerned' },
      { text: "Adversaries frequently impersonate internal IT staff to pressure workers into entering credentials under the guise of 'routine compliance'.", state: 'speaking' },
      { text: "Authentic IT departments never ask you to submit your password on an external, unverified link. Close this tab safely!", state: 'thinking' }
    ];
  } else {
    dialogue = [
      { text: `⚠️ Phishing Awareness Alert! Take a close look at the address bar: "${host}" is a simulated phishing website.`, state: 'concerned' },
      { text: "Notice how the page presents a login form designed to capture your credentials, personal info, or session tokens.", state: 'speaking' },
      { text: "Always verify the address bar before entering any information. When in doubt, close the browser tab!", state: 'thinking' }
    ];
  }

  setTimeout(() => {
    RyanGuide.speak(dialogue);
  }, 450);
}

function onPhishTabClosed() {
  if (typeof showToast === 'function') {
    showToast('🛡️ Excellent! You safely closed the suspicious phishing website.', 'success');
  }
  if (typeof RyanGuide !== 'undefined' && (window._currentChapterCategory || activeCategoryStory) === 'phishing') {
    RyanGuide.once('phish-tab-closed-reinforce', function() {
      setTimeout(function() {
        RyanGuide.speak([
          { text: "Good decision closing that phishing tab! 🛡️ In a real workplace, closing unverified sites prevents accidental credential theft.", state: 'success' }
        ]);
      }, 300);
    });
  }
}

function initBrowserTabs() {
  browserTabs = [];
  browserTabCounter = 0;
  browserActiveTabId = 0;
  const homeTab = createTabObj('https://www.google.com', 'Google', '🌐');
  browserTabs.push(homeTab);
  browserActiveTabId = homeTab.id;
  renderTabStrip();
  renderActiveTab();
}

function createTabObj(url, title, icon) {
  return {
    id: ++browserTabCounter,
    url: url,
    title: title,
    icon: icon,
    history: [url],
    histIdx: 0
  };
}

function getActiveTab() {
  return browserTabs.find(t => t.id === browserActiveTabId) || null;
}

function switchTab(tabId) {
  browserActiveTabId = tabId;
  renderTabStrip();
  renderActiveTab();
}

function closeTab(tabId, event) {
  if (event) event.stopPropagation();
  const idx = browserTabs.findIndex(t => t.id === tabId);
  if (idx === -1) return;
  const closedTab = browserTabs[idx];
  const wasPhish = closedTab && typeof isPhishingUrl === 'function' && isPhishingUrl(closedTab.url);

  browserTabs.splice(idx, 1);
  if (browserTabs.length === 0) {
    // Re-open a blank tab
    initBrowserTabs();
    if (wasPhish) onPhishTabClosed();
    return;
  }
  if (browserActiveTabId === tabId) {
    const newIdx = Math.min(idx, browserTabs.length - 1);
    browserActiveTabId = browserTabs[newIdx].id;
  }
  renderTabStrip();
  renderActiveTab();
  if (wasPhish) onPhishTabClosed();
}

function createNewBrowserTab(url) {
  url = url || 'https://www.google.com';
  const tab = createTabObj(url, 'New Tab', '🌐');
  browserTabs.push(tab);
  browserActiveTabId = tab.id;
  renderTabStrip();
  renderPageIntoTab(tab, url);
}

function renderTabStrip() {
  const strip = document.getElementById('browser-tabs-strip');
  if (!strip) return;
  strip.innerHTML = browserTabs.map(tab => `
    <div class="browser-tab${tab.id === browserActiveTabId ? ' active' : ''}" onclick="switchTab(${tab.id})" title="${escapeHtml(tab.url)}">
      <span class="browser-tab-favicon">${tab.icon}</span>
      <span class="browser-tab-title">${escapeHtml(tab.title)}</span>
      <button class="browser-tab-close" onclick="closeTab(${tab.id}, event)" title="Close tab">✕</button>
    </div>
  `).join('') +
  `<button class="browser-new-tab-btn" onclick="createNewBrowserTab()" title="New Tab">+</button>`;
}

function renderActiveTab() {
  const tab = getActiveTab();
  if (!tab) return;
  const urlInput = document.getElementById('browser-url-input');
  if (urlInput) urlInput.value = tab.url === 'https://www.google.com' ? '' : tab.url;
  // Sync global history vars for back/forward
  browserHistory = tab.history;
  browserCurrentIdx = tab.histIdx;
  updateBrowserNavBtns();
  _applyPageToContent(tab.url);
}

function renderPageIntoTab(tab, url) {
  tab.url = url;
  // Update tab history
  tab.history = tab.history.slice(0, tab.histIdx + 1);
  if (tab.history[tab.histIdx] !== url) {
    tab.history.push(url);
    tab.histIdx = tab.history.length - 1;
  }
  browserHistory = tab.history;
  browserCurrentIdx = tab.histIdx;
  const urlInput = document.getElementById('browser-url-input');
  if (urlInput) urlInput.value = url === 'https://www.google.com' ? '' : url;
  updateBrowserNavBtns();
  _applyPageToContent(url);
  // Update tab title/icon from security indicator side effect
  const tabTitle = document.getElementById('browser-tab-title-fake');
  renderTabStrip();
}

function extractHostFromUrl(url) {
  if (!url) return 'this site';
  try {
    const u = new URL(url);
    return u.hostname || url;
  } catch (e) {
    let clean = (url || '').replace(/^https?:\/\//i, '').trim();
    clean = clean.split('/')[0].split('?')[0].split('#')[0];
    return clean || url;
  }
}

function getPhishingSiteForUrl(url) {
  if (!url) return null;
  const lower = url.toLowerCase();

  // 1. Phishing PayPal Claim (Email 1) & Typosquat lookalikes
  if (lower.includes('paypa1') || lower.includes('paypal1')) {
    return {
      key: 'https://paypa1.com/claim-reward',
      title: 'Log in to your PayPal account — Claim ₱1,000,000',
      icon: '🅿️',
      html: FAKE_SITES['https://paypa1.com/claim-reward'] || FAKE_SITES['https://paypal-account-check.com/login']
    };
  }

  // 1b. Corporate SSO Phishing
  if (lower.includes('business-account-verify.net')) {
    return {
      key: 'https://business-account-verify.net/login',
      title: 'Business Inc. — SSO Verification',
      icon: '🏢',
      html: FAKE_SITES['https://business-account-verify.net/login']
    };
  }

  // 2. Microsoft 365 Typosquat Phishing (Email 3)
  if (lower.includes('m1crosoft')) {
    return {
      key: 'https://m1crosoft-account-verify.com/signin',
      title: 'Sign in to your Microsoft account',
      icon: '🪟',
      html: FAKE_SITES['https://m1crosoft-account-verify.com/signin']
    };
  }

  // 3. Urgent Bank Suspension Phishing (Email 7)
  if (lower.includes('bankng')) {
    return {
      key: 'https://bankng-secure-verify.xyz/restore',
      title: 'Secure Banking — Urgent Verification',
      icon: '🏦',
      html: FAKE_SITES['https://bankng-secure-verify.xyz/restore']
    };
  }

  // 4. IT Security Compliance Phishing (Email 8)
  if (lower.includes('business-it-support.com')) {
    return {
      key: 'https://business-it-support.com/compliance-portal',
      title: 'IT Security Operations — Compliance Hub',
      icon: '🛡️',
      html: FAKE_SITES['https://business-it-support.com/compliance-portal']
    };
  }

  // 5. Additional Demo Phishing Portals
  if (lower.includes('bpi-online-security.com')) {
    return {
      key: 'https://bpi-online-security.com/login',
      title: 'BPI Online — Security Verification',
      icon: '🏦',
      html: FAKE_SITES['https://bpi-online-security.com/login']
    };
  }
  if (lower.includes('paypal-account-check.com')) {
    return {
      key: 'https://paypal-account-check.com/login',
      title: 'Log in to your PayPal account',
      icon: '🅿️',
      html: FAKE_SITES['https://paypal-account-check.com/login']
    };
  }
  if (lower.includes('gcash-claim-rewards.com')) {
    return {
      key: 'https://gcash-claim-rewards.com/verify',
      title: 'GCash — Claim Rewards Portal',
      icon: '📱',
      html: FAKE_SITES['https://gcash-claim-rewards.com/verify']
    };
  }

  // 6. Direct match by exact URL in FAKE_SITES
  if (FAKE_SITES[url]) {
    return {
      key: url,
      title: 'Suspicious Portal — Verification Required',
      icon: '⚠️',
      html: FAKE_SITES[url]
    };
  }

  // 7. Dynamic fallback for any other suspicious simulation URL
  if (lower.includes('verify') || lower.includes('phish') || lower.includes('signin') || lower.includes('login') || lower.includes('restore')) {
    const host = extractHostFromUrl(url);
    return {
      key: url,
      title: `${host} — Security Portal`,
      icon: '⚠️',
      html: renderDynamicPhishingSite(url, host)
    };
  }

  return null;
}

function renderDynamicPhishingSite(url, host) {
  return `
    <div class="fakesite fakesite-corporate">
      <div class="phish-sim-banner">
        <span class="phish-banner-icon">🚨</span>
        <span class="phish-banner-text">Look at the browser URL bar: <code>${escapeHtml(host)}</code> is an unverified simulated domain!</span>
      </div>
      <div class="fakesite-header" style="background:#1e293b;">
        <div class="fakesite-header-inner">
          <div class="fakesite-logo">🔒 ${escapeHtml(host)} — Verification Center</div>
          <div class="fakesite-subtag">Online Identity &amp; Account Protection</div>
        </div>
      </div>
      <div class="fakesite-body">
        <div class="fakesite-card">
          <div class="fakesite-card-header">
            <h2>Account Security Verification</h2>
            <div class="fakesite-urgency-callout">
              ⚠️ Immediate authentication required to prevent suspension of your profile.
            </div>
          </div>
          <form onsubmit="event.preventDefault(); handlePhishingSubmit('${escapeHtml(host)}', '${escapeHtml(host)}');">
            <div class="fakesite-field">
              <label for="dyn-user">Account Email or Username</label>
              <input type="text" id="dyn-user" placeholder="Enter username or email" required autocomplete="off" />
            </div>
            <div class="fakesite-field">
              <label for="dyn-pass">Password</label>
              <input type="password" id="dyn-pass" placeholder="••••••••••••" required autocomplete="off" />
            </div>
            <button type="submit" class="fakesite-submit">
              Confirm Credentials &amp; Unlock Account
            </button>
          </form>
          <div class="fakesite-card-footer">
            <p>256-Bit SSL Encrypted Verification • Identity Shield Protection</p>
          </div>
        </div>
      </div>
      <div class="fakesite-footer">
        <p>© 2026 ${escapeHtml(host)}. All rights reserved.</p>
      </div>
    </div>
  `;
}

function isInternetConnected() {
  if (typeof networkSettings === 'undefined') return true;
  if (networkSettings.airplane) return false;
  if (!networkSettings.wifi) return false;
  if (!networkSettings.currentSsid) return false;
  return true;
}

function openWifiSettingsFromBrowser() {
  openApp('wifi-settings');
  focusWindow('wifi-settings');
  if (typeof switchWifiSettingsTab === 'function') {
    switchWifiSettingsTab('wifi');
  }
  showToast('📶 Opened Wi-Fi Settings — turn on Wi-Fi to reconnect.', 'info');
}

function renderChromeOfflineError(url) {
  return `
    <div class="chrome-error-page chrome-offline-page">
      <div class="chrome-error-container">
        <div class="chrome-error-icon chrome-dino-icon" aria-hidden="true">
          <svg width="56" height="56" viewBox="0 0 48 48" fill="#5f6368" style="display:block;">
            <path d="M30 4h14v4h2v8h-2v2h-6v4h6v2h-4v2h-4v2h-2v2h-2v4h2v2h4v2h-6v2h-2v2h-2v2h-2v2h-2v4h-2v4h-4v-4h2v-4h2v-2h2v-2h2v-2h2v-2h-2v-4h-2v-2h-2v-2h-2v-2h-2v-2h-2v-4h2v-2h2v-2h2v-4h2v-4h2v-2h2V4z M40 8h2v2h-2z"/>
            <rect x="22" y="24" width="4" height="2" fill="#5f6368"/>
            <rect x="20" y="32" width="2" height="6" fill="#5f6368"/>
            <rect x="26" y="32" width="2" height="6" fill="#5f6368"/>
          </svg>
        </div>
        <h1 class="chrome-error-heading">No internet</h1>
        <div class="chrome-error-suggestions">
          <p class="chrome-error-try" style="font-size:14px;color:#5f6368;margin-bottom:8px;font-weight:500;">Try:</p>
          <ul class="chrome-error-list">
            <li>Checking the network cables, modem, and router</li>
            <li><a href="#" class="chrome-diag-link" onclick="openWifiSettingsFromBrowser(); return false;">Reconnecting to Wi-Fi</a></li>
            <li><a href="#" class="chrome-diag-link" onclick="openNetworkDiagnostics('wifi'); return false;">Running Windows Network Diagnostics</a></li>
          </ul>
        </div>
        <div class="chrome-error-actions">
          <button class="chrome-reload-btn" id="chrome-reload-btn" onclick="triggerChromeReload('${escapeHtml(url)}')">
            <span class="chrome-reload-icon">🔄</span> Reload
          </button>
        </div>
        <div class="chrome-error-code">ERR_INTERNET_DISCONNECTED</div>
      </div>
    </div>
  `;
}

function renderChromeDnsError(url) {
  const hostname = extractHostFromUrl(url);
  return `
    <div class="chrome-error-page">
      <div class="chrome-error-container">
        <div class="chrome-error-icon" aria-hidden="true">
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#5f6368" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="12" y1="18" x2="12" y2="12"></line>
            <line x1="9" y1="15" x2="15" y2="15"></line>
          </svg>
        </div>
        <h1 class="chrome-error-heading">This site can’t be reached</h1>
        <p class="chrome-error-msg">
          Check if there is a typo in <strong class="chrome-error-domain">${escapeHtml(hostname)}</strong>.
        </p>
        <div class="chrome-error-suggestions">
          <ul class="chrome-error-list">
            <li>If spelling is correct, try <a href="#" class="chrome-diag-link" onclick="openNetworkDiagnostics('${escapeHtml(hostname)}'); return false;">running Windows Network Diagnostics</a>.</li>
          </ul>
        </div>
        <div class="chrome-error-actions">
          <button class="chrome-reload-btn" id="chrome-reload-btn" onclick="triggerChromeReload('${escapeHtml(url)}')">
            <span class="chrome-reload-icon">🔄</span> Reload
          </button>
        </div>
        <div class="chrome-error-code">DNS_PROBE_FINISHED_NXDOMAIN</div>
      </div>
    </div>
  `;
}

function triggerChromeReload(url) {
  const btn = document.getElementById('chrome-reload-btn');
  const tab = getActiveTab();
  const security = document.getElementById('browser-security');

  if (btn) {
    btn.classList.add('loading');
    btn.innerHTML = '<span class="chrome-reload-spinner"></span> Reloading...';
    btn.disabled = true;
  }

  if (tab) {
    tab.icon = '🔄';
    tab.title = 'Connecting...';
    renderTabStrip();
  }

  if (security) {
    security.textContent = '🔄 Resolving host...';
    security.className = 'browser-security-indicator';
  }

  if (typeof AudioManager !== 'undefined') AudioManager.playClick();

  setTimeout(() => {
    if (tab) {
      _applyPageToContent(url || tab.url);
    }
  }, 650);
}

function openNetworkDiagnostics(host) {
  if (!isInternetConnected()) {
    showToast('🔍 Windows Network Diagnostics: Your Wi-Fi network adapter is turned off or disconnected. Please reconnect to Wi-Fi to restore internet access (ERR_INTERNET_DISCONNECTED).', 'warning');
    if (typeof AudioManager !== 'undefined') AudioManager.playWrong();
    return;
  }
  showToast(`🔍 Windows Network Diagnostics: Internet connection is active, but "${host}" cannot be found on the DNS server (DNS_PROBE_FINISHED_NXDOMAIN).`, 'warning');
  if (typeof AudioManager !== 'undefined') AudioManager.playWrong();
}

function renderLegitSite(url) {
  const host = extractHostFromUrl(url).toLowerCase();
  if (host.includes('bpi.com.ph')) {
    return `
      <div class="legitsite">
        <div class="legitsite-header" style="background:#8a0011;color:white;">
          <div style="font-size:20px;font-weight:800;">🏦 BPI Online (Official)</div>
          <div style="font-size:12px;opacity:0.9;">bpi.com.ph • Official Portal</div>
        </div>
        <div class="legitsite-body">
          <div class="legitsite-advisory-banner">
            <div class="legitsite-advisory-title">🛡️ OFFICIAL BPI SECURITY ADVISORY</div>
            <p style="margin:6px 0 0 0;font-size:13.5px;line-height:1.5;">
              BPI will <strong>NEVER</strong> send emails, SMS, or messages with links asking you to log in, verify your account, or provide your password or One-Time PIN (OTP). The official BPI portal is strictly <strong>bpi.com.ph</strong>.
            </p>
          </div>
          <h2 style="font-size:22px;color:#1e293b;margin-bottom:12px;">Welcome to Bank of the Philippine Islands</h2>
          <p style="color:#475569;line-height:1.6;font-size:14px;">This is the legitimate, authentic Bank of the Philippine Islands online banking portal. Notice the secure padlock icon (🔒) and the official domain name in the address bar.</p>
          <div style="margin-top:20px;padding:16px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;">
            <h4 style="margin:0 0 8px 0;color:#0f172a;">How to Spot Fake BPI Websites:</h4>
            <ul style="margin:0;padding-left:20px;color:#475569;font-size:13.5px;line-height:1.6;">
              <li>Look for typos in the domain like <code>bpi-online-security.com</code> or <code>bpi-verify.com</code>.</li>
              <li>Official BPI domain will always end in <strong>.bpi.com.ph</strong>.</li>
              <li>Fake sites create false urgency claiming your account will be locked in 30 minutes.</li>
            </ul>
          </div>
        </div>
      </div>
    `;
  }
  if (host.includes('paypal.com')) {
    return `
      <div class="legitsite">
        <div class="legitsite-header" style="background:#003087;color:white;">
          <div style="font-size:20px;font-weight:800;">🅿️ PayPal (Official)</div>
          <div style="font-size:12px;opacity:0.9;">paypal.com • Official Site</div>
        </div>
        <div class="legitsite-body">
          <div class="legitsite-advisory-banner">
            <div class="legitsite-advisory-title">🛡️ OFFICIAL PAYPAL SECURITY NOTICE</div>
            <p style="margin:6px 0 0 0;font-size:13.5px;line-height:1.5;">
              Always verify you are on <strong>https://www.paypal.com</strong>. Legitimate PayPal communications will always address you by your real full name, never "Dear Customer" or "Dear User".
            </p>
          </div>
          <h2 style="font-size:22px;color:#1e293b;margin-bottom:12px;">PayPal Security &amp; Safety Center</h2>
          <p style="color:#475569;line-height:1.6;font-size:14px;">You have reached the authentic PayPal website. Protection against phishing and identity theft starts with verifying the domain name.</p>
        </div>
      </div>
    `;
  }
  if (host.includes('gcash.com')) {
    return `
      <div class="legitsite">
        <div class="legitsite-header" style="background:#005cfc;color:white;">
          <div style="font-size:20px;font-weight:800;">📱 GCash (Official)</div>
          <div style="font-size:12px;opacity:0.9;">gcash.com • Official Site</div>
        </div>
        <div class="legitsite-body">
          <div class="legitsite-advisory-banner">
            <div class="legitsite-advisory-title">🛡️ GCASH TRUST &amp; SECURITY REMINDER</div>
            <p style="margin:6px 0 0 0;font-size:13.5px;line-height:1.5;">
              <strong>NEVER share your MPIN or OTP.</strong> GCash will never send SMS or emails with links asking for your 4-digit MPIN or One-Time PIN.
            </p>
          </div>
          <h2 style="font-size:22px;color:#1e293b;margin-bottom:12px;">GCash Security Center</h2>
          <p style="color:#475569;line-height:1.6;font-size:14px;">Authentic GCash services are accessed through the official mobile app and <strong>gcash.com</strong>.</p>
        </div>
      </div>
    `;
  }
  return renderGenericSite(url);
}

function _applyPageToContent(url) {
  const content = document.getElementById('browser-content');
  const security = document.getElementById('browser-security');
  const tab = getActiveTab();
  if (!content) return;

  function setTabMeta(title, icon, secText, secClass) {
    if (tab) { tab.title = title; tab.icon = icon; }
    if (security) { security.textContent = secText; security.className = 'browser-security-indicator' + (secClass ? ' ' + secClass : ''); }
    renderTabStrip();
  }

  // 0. OFFLINE CHECK: If Wi-Fi is turned off or disconnected
  if (!isInternetConnected()) {
    updateBrowserPhishingNotice(false);
    setTabMeta('No internet', '🦖', '⚠️ Disconnected', 'not-secure');
    content.innerHTML = renderChromeOfflineError(url);
    return;
  }

  const isGoogleHome = url === 'https://www.google.com' || url === '';
  const isGoogleSearch = /^https:\/\/www\.google\.com\/search\?q=/i.test(url);

  // 1. Google Homepage
  if (isGoogleHome) {
    updateBrowserPhishingNotice(false);
    setTabMeta('Google', '🌐', '🔒 Secure', 'secure');
    content.innerHTML = BROWSER_HOME_HTML;
    return;
  }

  // 2. Real Phishing Website Examples (Directly displayed from email links or URLs)
  const phishSite = getPhishingSiteForUrl(url);
  if (phishSite) {
    setTabMeta(phishSite.title, phishSite.icon, '⚠️ Not Secure', 'not-secure');
    content.innerHTML = phishSite.html;
    updateBrowserPhishingNotice(true, url);
    triggerRyanPhishingAwareness(url);
    return;
  }

  updateBrowserPhishingNotice(false);

  // 3. Google Search Results
  if (isGoogleSearch) {
    const q = decodeURIComponent(url.split('q=')[1] || '');
    setTabMeta(`${q} — Google Search`, '🔍', '🔒 Secure', 'secure');
    content.innerHTML = renderGoogleResults(q);
    return;
  }

  // 4. Legitimate Bank & Service Portals
  if (/bpi\.com\.ph|paypal\.com|gcash\.com/i.test(url)) {
    const legitTitle = /bpi/i.test(url) ? 'BPI Online — Bank of the Philippine Islands' : (/paypal/i.test(url) ? 'PayPal — Official Security Center' : 'GCash — Official Site');
    const legitIcon = /bpi/i.test(url) ? '🏦' : (/paypal/i.test(url) ? '🅿️' : '📱');
    setTabMeta(legitTitle, legitIcon, '🔒 Secure', 'secure');
    content.innerHTML = renderLegitSite(url);
    return;
  }

  // 5. Official Threat Intel & Cybersecurity Guides
  if (/malware|trojan|ransomware|threat-intel/i.test(url)) {
    setTabMeta('Malware Intel & Defense | CISA', '🦠', '🔒 Secure', 'secure');
    content.innerHTML = renderMalwareIntelSite();
    return;
  }

  if (/cisa\.gov/i.test(url)) {
    setTabMeta('CISA — Cyber Defense Agency', '🛡️', '🔒 Secure', 'secure');
    content.innerHTML = renderCisaHomeSite();
    return;
  }

  if (/consumer\.ftc\.gov|how-recognize-phishing/i.test(url)) {
    setTabMeta('How to Recognize Phishing | FTC', '🎣', '🔒 Secure', 'secure');
    content.innerHTML = renderPhishingGuideSite();
    return;
  }

  if (/wikipedia\.org/i.test(url)) {
    setTabMeta('Wikipedia, the free encyclopedia', '📖', '🔒 Secure', 'secure');
    content.innerHTML = renderGenericSite(url);
    return;
  }

  // 6. IMPROPER / NON-EXISTENT DOMAIN: Chrome "This site can't be reached" (DNS_PROBE_FINISHED_NXDOMAIN)
  const displayHost = extractHostFromUrl(url);
  setTabMeta(displayHost, '📄', '⚠️ Not Secure', 'not-secure');
  content.innerHTML = renderChromeDnsError(url);
}

function openBrowserDefault() {
  openApp('browser');
  focusWindow('browser');
  if (!browserTabs || browserTabs.length === 0) {
    initBrowserTabs();
  }
}

function handlePhishingSubmit(domain, brand) {
  showToast(`🚨 PHISHING DETECTED! You just submitted credentials to "${domain}" — a fake ${brand} portal. Your credentials would now be stolen. Always verify the domain in the address bar!`, 'warning');
  if (typeof AudioManager !== 'undefined') AudioManager.playWrong();

  // Flash the security indicator red
  const security = document.getElementById('browser-security');
  if (security) {
    security.textContent = '🚨 PHISHING DETECTED';
    security.style.color = '#f28b82';
    security.style.fontWeight = '900';
    setTimeout(() => {
      security.textContent = '⚠️ Not Secure';
      security.style.color = '';
      security.style.fontWeight = '';
    }, 4000);
  }

  if (typeof RyanGuide !== 'undefined' && (window._currentChapterCategory || activeCategoryStory) === 'phishing') {
    setTimeout(function() {
      RyanGuide.speak([
        { text: `🚨 Stop! You just submitted credentials to "${domain}"!`, state: 'concerned' },
        { text: "On a real phishing site, your username and password would now be in the attacker's hands. Always verify the domain in the address bar before entering any data!", state: 'concerned' }
      ]);
    }, 400);
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Treat plain text (no scheme, has spaces, or no dot) as a Google search;
// anything that looks like a domain/URL is navigated to directly.
function isSearchQuery(str) {
  if (/^https?:\/\//i.test(str)) return false;
  if (/\s/.test(str)) return true;
  return !/\./.test(str);
}

function handleBrowserUrlKey(e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    browserGo(e.target.value);
  }
}

function handleHomeSearchKey(e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    submitHomeSearch();
  }
}

function submitHomeSearch() {
  const input = document.getElementById('browser-home-search');
  if (input) browserGo(input.value);
}

function submitBrowserUrl() {
  const input = document.getElementById('browser-url-input');
  if (input) browserGo(input.value);
}

function browserGo(raw) {
  const trimmed = (raw || '').trim();
  if (!trimmed) return;

  let url;
  if (isSearchQuery(trimmed)) {
    url = 'https://www.google.com/search?q=' + encodeURIComponent(trimmed);
  } else {
    url = /^https?:\/\//i.test(trimmed) ? trimmed : 'https://' + trimmed;
  }
  navigateBrowser(url);
}

function updateBrowserNavBtns() {
  const backBtn = document.getElementById('browser-back');
  const fwdBtn = document.getElementById('browser-forward');
  const tab = getActiveTab();
  if (tab) {
    if (backBtn) backBtn.disabled = (tab.histIdx <= 0);
    if (fwdBtn) fwdBtn.disabled = (tab.histIdx >= tab.history.length - 1);
  } else {
    if (backBtn) backBtn.disabled = true;
    if (fwdBtn) fwdBtn.disabled = true;
  }
}

function navigateBrowser(url) {
  const tab = getActiveTab();
  if (!tab) {
    createNewBrowserTab(url);
    return;
  }
  renderPageIntoTab(tab, url);
}

// Compatibility alias — renderBrowserPage now delegates to tab system
function renderBrowserPage(url) {
  navigateBrowser(url);
}

function browserBack() {
  const tab = getActiveTab();
  if (!tab || tab.histIdx <= 0) return;
  tab.histIdx--;
  const url = tab.history[tab.histIdx];
  tab.url = url;
  browserHistory = tab.history;
  browserCurrentIdx = tab.histIdx;
  const urlInput = document.getElementById('browser-url-input');
  if (urlInput) urlInput.value = url === 'https://www.google.com' ? '' : url;
  updateBrowserNavBtns();
  _applyPageToContent(url);
}

function browserForward() {
  const tab = getActiveTab();
  if (!tab || tab.histIdx >= tab.history.length - 1) return;
  tab.histIdx++;
  const url = tab.history[tab.histIdx];
  tab.url = url;
  browserHistory = tab.history;
  browserCurrentIdx = tab.histIdx;
  const urlInput = document.getElementById('browser-url-input');
  if (urlInput) urlInput.value = url === 'https://www.google.com' ? '' : url;
  updateBrowserNavBtns();
  _applyPageToContent(url);
}

function browserRefresh() {
  const tab = getActiveTab();
  if (tab) triggerChromeReload(tab.url);
}

function browserGoHome() {
  const tab = getActiveTab();
  if (tab) {
    renderPageIntoTab(tab, 'https://www.google.com');
  } else {
    initBrowserTabs();
  }
  const urlInput = document.getElementById('browser-url-input');
  if (urlInput) urlInput.value = '';
}


// ── AUTHENTIC MALWARE THREAT INTELLIGENCE WEBSITE ──
function renderMalwareIntelSite() {
  return `
    <div class="malwaresite">
      <div class="intel-banner">
        <div class="intel-banner-left">
          <span class="intel-banner-shield">🛡️</span>
          <div>
            <div class="intel-banner-title">CYBERSECURITY &amp; INFRASTRUCTURE SECURITY AGENCY</div>
            <div class="intel-banner-sub">NATIONAL THREAT ASSESSMENT DIVISION • OFFICIAL BULLETIN</div>
          </div>
        </div>
        <div class="intel-banner-badge">THREAT ADVISORY: ACTIVE MALWARE CAMPAIGNS</div>
      </div>

      <div class="intel-content">
        <div class="intel-breadcrumbs">
          <a href="#" onclick="browserGoHome()">Home</a> › 
          <a href="#" onclick="browserGo('https://www.cisa.gov')">CISA</a> › 
          <span>Malware Threat Intel &amp; Defense</span>
        </div>

        <h1 class="intel-h1">Malware Defense &amp; Threat Intelligence Guide</h1>
        <div class="intel-meta-bar">
          <span>📅 Updated: September 2026</span>
          <span>🏷️ Category: Threat Intelligence</span>
          <span>⏱️ 5 min read</span>
          <span class="verified-tag">✔ Verified Cyber Intelligence</span>
        </div>

        <div class="intel-alert-box">
          <strong>⚠️ Critical Threat Notice:</strong> Over 70% of organizational and student workstation breaches originate from deceptive file downloads and malicious email attachments. Attackers use social engineering to convince users to execute trojan droppers.
        </div>

        <div class="intel-section">
          <h2>1. What is Malware?</h2>
          <p>
            <strong>Malware</strong> (short for <em>malicious software</em>) is an overarching term for code or programs intentionally crafted to damage, disrupt, steal, or gain unauthorized access to computer systems, data, and networks.
          </p>
          <p>
            Unlike legitimate software, malware executes unauthorized tasks without the user's informed consent. Modern cyber threats frequently combine social engineering with multi-stage payloads.
          </p>
        </div>

        <div class="intel-section">
          <h2>2. Major Classifications of Malware</h2>
          <div class="intel-cards-grid">
            <div class="intel-threat-card card-trojan">
              <div class="threat-card-header">
                <span class="threat-card-name">🦠 Trojan Horse</span>
                <span class="threat-card-tag">High Danger</span>
              </div>
              <p class="threat-card-desc">
                Disguised as beneficial, free, or legitimate software (converters, games, PDF viewers). Once executed by the victim, it silently deploys backdoors, disables security software, or downloads secondary malware droppers.
              </p>
              <div class="threat-card-case">
                <strong>Field Case (Incident 3):</strong> A student downloaded a "free project tool" online. Moments later, their machine slowed down as the trojan installed unauthorized remote access tools.
              </div>
            </div>

            <div class="intel-threat-card card-ransom">
              <div class="threat-card-header">
                <span class="threat-card-name">🔒 Ransomware</span>
                <span class="threat-card-tag" style="background:#fee2e2;color:#b91c1c">Critical Danger</span>
              </div>
              <p class="threat-card-desc">
                Infiltrates the operating system and encrypts user documents, spreadsheets, and databases using strong military-grade cryptography (.locked, .crypted). Attackers demand cryptocurrency payments for the decryption key.
              </p>
              <div class="threat-card-case">
                <strong>Field Case (Incident 5):</strong> A school staff member opened an infected invoice file, triggering instant file encryption across their workstation.
              </div>
            </div>

            <div class="intel-threat-card card-spyware">
              <div class="threat-card-header">
                <span class="threat-card-name">🕵️ Spyware &amp; Keyloggers</span>
                <span class="threat-card-tag" style="background:#ede9fe;color:#6d28d9">Stealth Threat</span>
              </div>
              <p class="threat-card-desc">
                Operates invisibly in background memory, logging every keystroke, capturing browser cookies, stealing passwords, and streaming screen captures to adversary command-and-control servers.
              </p>
              <div class="threat-card-case">
                <strong>Threat Vector:</strong> Often bundled inside cracked pirated utilities and unauthorized browser extensions.
              </div>
            </div>

            <div class="intel-threat-card card-worm">
              <div class="threat-card-header">
                <span class="threat-card-name">🪱 Worms &amp; Botnets</span>
                <span class="threat-card-tag" style="background:#e0f2fe;color:#0369a1">Network Threat</span>
              </div>
              <p class="threat-card-desc">
                Self-replicating malicious programs that automatically propagate across network shares, open ports, and USB storage without requiring human interaction, enlisting computers into distributed botnets.
              </p>
              <div class="threat-card-case">
                <strong>Threat Vector:</strong> Exploits unpatched system vulnerabilities and weak default administrative credentials.
              </div>
            </div>
          </div>
        </div>

        <div class="intel-section">
          <h2>3. Common Infection Vectors &amp; Deceptive Disguises</h2>
          <ul class="intel-list">
            <li>
              <strong>Double File Extensions:</strong> Files named <code>project_document.pdf.exe</code> or <code>receipt.docx.scr</code>. Operating systems hide known extensions by default, tricking users into double-clicking executables.
            </li>
            <li>
              <strong>Compressed Archive Droppers (.zip, .iso, .vhd):</strong> Attackers place malicious scripts (<code>.vbs</code>, <code>.bat</code>, <code>.ps1</code>) inside archives to evade automatic web and email gateway scanners.
            </li>
            <li>
              <strong>Unverified "Free" Download Mirrors:</strong> Downloading tools, games, or patches from third-party forums or suspicious file-hosters rather than official vendor repositories.
            </li>
            <li>
              <strong>Macro-Enabled Documents:</strong> Microsoft Office files prompting users to "Enable Editing" or "Enable Macros" to execute embedded VBA downloader scripts.
            </li>
          </ul>
        </div>

        <div class="intel-section">
          <h2>4. Practical Malware Defense Checklist</h2>
          <div class="defense-steps-box">
            <div class="defense-step">
              <span class="step-num">1</span>
              <div>
                <strong>Enable File Name Extensions:</strong> Always configure your file manager to display full file extensions so disguised executables (<code>.exe</code>, <code>.scr</code>) are immediately visible.
              </div>
            </div>
            <div class="defense-step">
              <span class="step-num">2</span>
              <div>
                <strong>Inspect Digital Signatures &amp; File Hashes:</strong> Legitimate software from reputable vendors carries valid digital certificates. Unsigned executables should never be run without verification.
              </div>
            </div>
            <div class="defense-step">
              <span class="step-num">3</span>
              <div>
                <strong>Employ Active Real-Time Heuristic Protection:</strong> Keep your anti-virus software (such as ShieldAV) active with real-time heuristic monitoring and updated threat signature databases.
              </div>
            </div>
            <div class="defense-step">
              <span class="step-num">4</span>
              <div>
                <strong>Maintain Offline / Cold Backups:</strong> Keep regular backups on disconnected external storage to guarantee recovery in the event of a ransomware attack.
              </div>
            </div>
          </div>
        </div>

        <div class="intel-footer-nav">
          <button class="google-btn" onclick="browserGo('https://www.google.com/search?q=phishing+defense+guide')">🔍 Search Phishing Intelligence</button>
          <button class="google-btn" onclick="browserGo('https://www.cisa.gov')">🛡️ CISA Cyber Defense Home</button>
          <button class="google-btn" onclick="browserGoHome()">🏠 Return to Google</button>
        </div>
      </div>
    </div>`;
}

// ── CISA HOMEPAGE ──
function renderCisaHomeSite() {
  return `
    <div class="cisasite">
      <div class="intel-banner">
        <div class="intel-banner-left">
          <span class="intel-banner-shield">🛡️</span>
          <div>
            <div class="intel-banner-title">CYBERSECURITY &amp; INFRASTRUCTURE SECURITY AGENCY</div>
            <div class="intel-banner-sub">AMERICA'S CYBER DEFENSE AGENCY • DEFEND TODAY, SECURE TOMORROW</div>
          </div>
        </div>
        <div class="intel-banner-badge" style="background:#16a34a;color:#fff;border-color:#16a34a">SHIELDS UP: OPERATIONAL</div>
      </div>

      <div class="intel-content">
        <div class="intel-breadcrumbs">
          <a href="#" onclick="browserGoHome()">Home</a> › 
          <span>Official Cybersecurity Portal</span>
        </div>

        <h1 class="intel-h1">National Cyber Defense &amp; Digital Safety Resource Center</h1>
        <div class="intel-meta-bar">
          <span>Official Government Source (cisa.gov)</span>
          <span>🛡️ Cybersecurity Advisories</span>
          <span class="verified-tag">✔ Authenticated Domain</span>
        </div>

        <div class="intel-section">
          <h2>Shields Up: 4 Essential Steps for Every Digital Citizen</h2>
          <p>Cybersecurity is not just for technical experts. Following these four foundational habits prevents over 90% of opportunistic cyber attacks:</p>
          <div class="defense-steps-box">
            <div class="defense-step">
              <span class="step-num">1</span>
              <div><strong>Enable Multi-Factor Authentication (MFA):</strong> MFA makes it 99% harder for adversaries to compromise your accounts even if your password is stolen.</div>
            </div>
            <div class="defense-step">
              <span class="step-num">2</span>
              <div><strong>Recognize and Report Phishing:</strong> Think before you click. Be suspicious of unsolicited requests for personal info, urgency, and strange sender emails.</div>
            </div>
            <div class="defense-step">
              <span class="step-num">3</span>
              <div><strong>Update Your Software:</strong> Enable automatic operating system and browser updates to patch known vulnerabilities before attackers exploit them.</div>
            </div>
            <div class="defense-step">
              <span class="step-num">4</span>
              <div><strong>Use Strong, Unique Passwords:</strong> Never reuse passwords across email, banking, and school portals. Use passphrases or a password manager.</div>
            </div>
          </div>
        </div>

        <div class="intel-section">
          <h2>Featured Security Bulletins</h2>
          <ul class="intel-list">
            <li><strong>Malware &amp; Software Dropper Advisory:</strong> <a href="#" onclick="browserGo('https://www.cisa.gov/topics/malware'); return false;" style="color:#0284c7;font-weight:700;">Read the complete Malware Intel &amp; Classification Guide ➔</a></li>
            <li><strong>Phishing &amp; Social Engineering Trends:</strong> <a href="#" onclick="browserGo('https://www.consumer.ftc.gov/articles/how-recognize-phishing'); return false;" style="color:#0284c7;font-weight:700;">How to identify deceptive phishing domains and fake sender headers ➔</a></li>
          </ul>
        </div>
      </div>
    </div>`;
}

// ── FTC PHISHING RECOGNITION GUIDE ──
function renderPhishingGuideSite() {
  return `
    <div class="cisasite">
      <div class="intel-banner" style="background:#1e3a8a;border-bottom-color:#60a5fa">
        <div class="intel-banner-left">
          <span class="intel-banner-shield">🎣</span>
          <div>
            <div class="intel-banner-title">FEDERAL TRADE COMMISSION • CONSUMER ADVICE</div>
            <div class="intel-banner-sub">OFFICIAL FRAUD &amp; PHISHING PREVENTION DIVISION</div>
          </div>
        </div>
        <div class="intel-banner-badge" style="background:#2563eb;color:#fff;border-color:#60a5fa">CONSUMER SECURITY GUIDE</div>
      </div>

      <div class="intel-content">
        <div class="intel-breadcrumbs">
          <a href="#" onclick="browserGoHome()">Home</a> › 
          <span>How to Recognize and Avoid Phishing Scams</span>
        </div>

        <h1 class="intel-h1">How to Spot Phishing Emails &amp; Deceptive Links</h1>
        <div class="intel-meta-bar">
          <span>Federal Trade Commission (consumer.ftc.gov)</span>
          <span class="verified-tag">✔ Official Advisory</span>
        </div>

        <div class="intel-section">
          <h2>The 4 Red Flags of Phishing Emails</h2>
          <ul class="intel-list">
            <li><strong>1. Deceptive Sender Addresses:</strong> The sender name might say "IT Support" or "Bank Security", but the actual email address is <code>support@accounts-verification-service.com</code> instead of the legitimate organization domain.</li>
            <li><strong>2. Artificial &amp; High Urgency:</strong> Demands immediate action: "Your account will be suspended within 1 hour!" Designed to induce panic so the victim clicks before thinking.</li>
            <li><strong>3. Hidden Link Mismatches:</strong> The visible text says <code>https://www.paypal.com</code>, but hovering over the link reveals the actual destination leads to an untrusted external server.</li>
            <li><strong>4. Unexpected Attachments:</strong> Invoices or order confirmations with file names ending in <code>.zip</code>, <code>.exe</code>, or <code>.pdf.exe</code> containing malware droppers.</li>
          </ul>
        </div>

        <div class="intel-footer-nav">
          <button class="google-btn" onclick="browserGo('https://www.cisa.gov/topics/malware')">🦠 Learn About Malware Threats</button>
          <button class="google-btn" onclick="browserGoHome()">🏠 Return to Google Home</button>
        </div>
      </div>
    </div>`;
}

function renderGenericSite(url) {
  let hostname, pathname;
  try {
    const u = new URL(url);
    hostname = u.hostname;
    pathname = u.pathname;
  } catch (e) {
    hostname = url;
    pathname = '/';
  }

  if (/(^|\.)wikipedia\.org$/i.test(hostname)) {
    const slug = decodeURIComponent((pathname.split('/wiki/')[1] || 'Phishing').replace(/_/g, ' '));
    const title = slug || 'Phishing';
    return `
      <div class="wikisite">
        <div class="wikisite-header">
          <span class="wikisite-logo">📖</span>
          <span class="wikisite-wordmark">WIKIPEDIA</span>
          <span class="wikisite-tag">The Free Encyclopedia</span>
        </div>
        <div class="wikisite-body">
          <h1>${escapeHtml(title)}</h1>
          <p class="wikisite-sub">From Wikipedia, the free encyclopedia</p>
          <hr/>
          <p><strong>${escapeHtml(title)}</strong> is a prominent subject in cybersecurity and digital forensics. Understanding the anatomy of modern threats allows students and detectives to detect and mitigate unauthorized system intrusions.</p>
          <p>Key defensive practices include inspecting domain names, verifying SSL certificate validity, and quarantining suspicious attachments in isolated sandboxes.</p>
          <div style="margin-top:20px;padding:12px;background:#f0f9ff;border-radius:6px;border:1px solid #bae6fd;">
            <strong>Related Intelligence:</strong> <a href="#" onclick="browserGo('https://www.cisa.gov/topics/malware'); return false;" style="color:#0284c7;font-weight:700;">Explore CISA Malware &amp; Threat Intelligence ➔</a>
          </div>
        </div>
      </div>`;
  }

  const displayHost = hostname.replace(/^www\./i, '');
  const siteName = (displayHost.split('.')[0] || 'Website').replace(/[-_]/g, ' ');
  const capitalized = siteName.charAt(0).toUpperCase() + siteName.slice(1);

  return `
    <div class="genericsite">
      <div class="genericsite-header">
        <span class="genericsite-logo">${escapeHtml(capitalized.charAt(0))}</span>
        <span class="genericsite-name">${escapeHtml(capitalized)}</span>
        <nav class="genericsite-nav"><a href="#" onclick="browserGoHome()">Search</a><a href="#" onclick="browserGo('https://www.cisa.gov/topics/malware')">Threat Intel</a></nav>
      </div>
      <div class="genericsite-body">
        <h2>${escapeHtml(capitalized)} Secure Portal</h2>
        <p>You have navigated to <strong>${escapeHtml(displayHost)}</strong>. This authenticated website is functioning normally.</p>
        <div style="margin-top:20px;padding:14px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;">
          <h4>Cyber Threat Research Links:</h4>
          <p style="margin:8px 0;"><a href="#" onclick="browserGo('https://www.cisa.gov/topics/malware'); return false;" style="color:#0284c7;">🦠 View Official Malware Encyclopedia &amp; Trojan Analysis</a></p>
          <p style="margin:8px 0;"><a href="#" onclick="browserGo('https://www.consumer.ftc.gov/articles/how-recognize-phishing'); return false;" style="color:#0284c7;">🎣 View FTC Phishing Recognition Guidelines</a></p>
        </div>
      </div>
    </div>`;
}

function renderGoogleResults(query) {
  const q = escapeHtml(query);
  const qLower = query.toLowerCase();

  let mockResults = [];

  if (/malware|trojan|virus|spyware|worm|download/i.test(qLower)) {
    mockResults = [
      {
        url: 'www.cisa.gov › topics › malware-and-ransomware',
        link: 'https://www.cisa.gov/topics/malware',
        title: 'Malware Threat Intelligence & Defense Guide | CISA',
        desc: `Comprehensive official threat advisory on Trojans, Ransomware, Spyware, Worms, and how adversaries disguise executables (.exe, .scr) as harmless documents.`
      },
      {
        url: 'www.cisa.gov › news-events › news › safe-software-downloads',
        link: 'https://www.cisa.gov/topics/malware#trojans',
        title: 'Trojan Horses: The Danger of "Free Software" Downloads | Cyber Academy',
        desc: `Learn why downloading free utilities and game tools from online forums leads to Trojan dropper infections and system compromise.`
      },
      {
        url: 'www.consumer.ftc.gov › articles › ransomware-protection',
        link: 'https://www.cisa.gov/topics/malware#ransomware',
        title: 'Ransomware Prevention & Recovery Best Practices | CISA & FTC',
        desc: `Protecting personal and organizational files from cryptographic ransomware lockouts. Real-world mitigation and cold backup advice.`
      },
      {
        url: 'www.sans.org › resources › glossary › malware',
        link: 'https://www.cisa.gov/topics/malware',
        title: 'Malware Classifications & Threat Categories | SANS Institute',
        desc: `Authoritative cybersecurity glossary covering all major malware families, attack vectors, and prevention frameworks.`
      }
    ];
  } else if (/phishing|email|scam|spoof/i.test(qLower)) {
    mockResults = [
      {
        url: 'www.consumer.ftc.gov › articles › how-recognize-phishing',
        link: 'https://www.consumer.ftc.gov/articles/how-recognize-phishing',
        title: 'How to Recognize and Avoid Phishing Scams | Federal Trade Commission',
        desc: `Learn the 4 tell-tale signs of a phishing email: mismatched sender addresses, artificial urgency, deceptive hyperlinks, and generic greetings.`
      },
      {
        url: 'www.cisa.gov › news-events › news › avoiding-social-engineering',
        link: 'https://www.cisa.gov',
        title: 'Avoiding Social Engineering and Phishing Attacks | CISA',
        desc: `Attackers use email or malicious websites to solicit personal information by posing as a trustworthy organization.`
      },
      {
        url: 'www.ic3.gov › resources › phishing-prevention',
        link: 'https://www.consumer.ftc.gov/articles/how-recognize-phishing',
        title: 'Phishing & Email Spoofing | FBI Internet Crime Complaint Center',
        desc: `Report phishing and email spoofing attacks. FBI guidance on identifying lookalike sender addresses and fake login pages.`
      }
    ];
  } else if (/ransomware|encrypt|decrypt|ransom/i.test(qLower)) {
    mockResults = [
      {
        url: 'www.cisa.gov › stopransomware',
        link: 'https://www.cisa.gov/topics/malware#ransomware',
        title: 'Stop Ransomware | CISA',
        desc: `Official joint advisory on ransomware prevention, detection, and recovery. Includes offline backup strategies and incident response playbooks.`
      },
      {
        url: 'www.consumer.ftc.gov › topics › ransomware-protection',
        link: 'https://www.cisa.gov/topics/malware',
        title: 'Ransomware Protection & Recovery Guide | FTC Consumer Advice',
        desc: `Step-by-step guidance on protecting files from ransomware encryption and recovering after an attack without paying a ransom.`
      }
    ];
  } else if (/cybersecurity|cyber security|cyber defense|infosec/i.test(qLower)) {
    mockResults = [
      {
        url: 'www.cisa.gov',
        link: 'https://www.cisa.gov',
        title: 'Cybersecurity & Infrastructure Security Agency (CISA)',
        desc: `America's Cyber Defense Agency — providing resources, advisories, and guidelines to defend national and personal digital infrastructure.`
      },
      {
        url: 'www.consumer.ftc.gov › privacy-identity-online-security',
        link: 'https://www.consumer.ftc.gov/articles/how-recognize-phishing',
        title: 'Online Security & Identity Protection Tips | FTC',
        desc: `Expert advice on cybersecurity hygiene, password safety, phishing awareness, and protecting your digital identity online.`
      }
    ];
  } else {
    // Unknown query — show Google no-results page
    return `
      <div class="gresults">
        <div class="gresults-header">
          <div class="gresults-logo" onclick="browserGoHome()"><span style="color:#4285F4">G</span><span style="color:#EA4335">o</span><span style="color:#FBBC05">o</span><span style="color:#4285F4">g</span><span style="color:#34A853">l</span><span style="color:#EA4335">e</span></div>
          <div class="gresults-search-form">
            <input type="text" class="gresults-search-input" id="gresults-search-input" value="${q}" placeholder="Search Google..." onkeydown="if(event.key==='Enter'){browserGo(this.value);}" />
            <button class="gresults-search-btn" onclick="browserGo(document.getElementById('gresults-search-input').value)">Search</button>
          </div>
        </div>
        <div class="google-noresult-container">
          <div class="google-noresult-icon">🔍</div>
          <div class="google-noresult-heading">Your search — <em>${q}</em> — did not match any documents.</div>
          <div class="google-noresult-suggestions">
            <p>Suggestions:</p>
            <ul>
              <li>Make sure that all words are spelled correctly.</li>
              <li>Try different keywords.</li>
              <li>Try more general keywords.</li>
              <li>Try fewer keywords.</li>
            </ul>
          </div>
          <div class="google-noresult-tips">
            💡 <strong>Detective Tip:</strong> This browser is optimized for cybersecurity topics. Try searching for
            <a href="#" onclick="browserGo('https://www.google.com/search?q=malware'); return false;" style="color:#1a73e8;">malware</a>,
            <a href="#" onclick="browserGo('https://www.google.com/search?q=phishing'); return false;" style="color:#1a73e8;">phishing</a>, or
            <a href="#" onclick="browserGo('https://www.google.com/search?q=ransomware'); return false;" style="color:#1a73e8;">ransomware</a>.
          </div>
        </div>
      </div>`;
  }

  const items = mockResults.map(r => `
    <div class="gresult-item">
      <div class="gresult-url">${r.url}</div>
      <div class="gresult-title" onclick="navigateBrowser('${r.link}')">${r.title}</div>
      <div class="gresult-desc">${r.desc}</div>
    </div>`).join('');

  return `
    <div class="gresults">
      <div class="gresults-header">
        <div class="gresults-logo" onclick="browserGoHome()"><span style="color:#4285F4">G</span><span style="color:#EA4335">o</span><span style="color:#FBBC05">o</span><span style="color:#4285F4">g</span><span style="color:#34A853">l</span><span style="color:#EA4335">e</span></div>
        <div class="gresults-search-form">
          <input type="text" class="gresults-search-input" id="gresults-search-input" value="${q}" placeholder="Search Google or enter query..." onkeydown="if(event.key==='Enter'){browserGo(this.value);}" />
          <button class="gresults-search-btn" onclick="browserGo(document.getElementById('gresults-search-input').value)">Search</button>
        </div>
      </div>
      <div class="gresults-stats">About ${(Math.floor(Math.random()*9)+1)},${Math.floor(Math.random()*900+100)},000 results (0.${Math.floor(Math.random()*9)+1}${Math.floor(Math.random()*9)} seconds)</div>
      ${items}
    </div>`;
}

function returnToGmail() {
  openApp('gmail');
  focusWindow('gmail');
}
