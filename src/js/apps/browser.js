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
  if (lower.includes('cisa.gov') || lower.includes('consumer.ftc.gov') || lower.includes('wikipedia.org') || lower.includes('google.com')) return false;
  if (lower.includes('canva-premium-free.example')) return true;
  return typeof getPhishingSiteForUrl === 'function' && getPhishingSiteForUrl(url) !== null;
}

let lastPhishingNoticeToastTime = 0;

function updateBrowserPhishingNotice(isPhishing, url) {
  const winCloseBtn = document.getElementById('browser-win-close');
  const activeTabCloseBtn = document.querySelector('.browser-tab.active .browser-tab-close');

  if (isPhishing) {
    if (winCloseBtn) {
      winCloseBtn.classList.add('phish-close-highlight');
      winCloseBtn.setAttribute('title', 'Close window');
    }
    if (activeTabCloseBtn) {
      activeTabCloseBtn.classList.add('phish-close-highlight');
      activeTabCloseBtn.setAttribute('title', 'Close phishing tab');
    }
  } else {
    if (winCloseBtn) {
      winCloseBtn.classList.remove('phish-close-highlight');
      winCloseBtn.setAttribute('title', 'Close');
    }
    document.querySelectorAll('.browser-tab-close.phish-close-highlight').forEach(btn => {
      btn.classList.remove('phish-close-highlight');
      btn.setAttribute('title', 'Close tab');
    });
  }
}

// Fires ONCE for the very first phishing site visit — all others are silent
let _phishAwarenessShown = false;

function triggerRyanPhishingAwareness(url) {
  if (typeof RyanGuide === 'undefined') return;
  const curCat = window._currentChapterCategory || activeCategoryStory || 'phishing';
  if (curCat !== 'phishing') return;

  // Show dialogue ONCE ever (first phishing site only) — all others are silent
  if (_phishAwarenessShown) return;
  _phishAwarenessShown = true;
  const host = extractHostFromUrl(url);

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

// Show the "good practice" close feedback ONCE only per session
let _phishTabCloseFeedbackShown = false;

function onPhishTabClosed() {
  // Toast and dialogue only fire the very first time a phishing tab is closed
  if (_phishTabCloseFeedbackShown) return;
  _phishTabCloseFeedbackShown = true;

  if (typeof showToast === 'function') {
    showToast('🛡️ Excellent! You safely closed the suspicious phishing website.', 'success');
  }
  if (typeof RyanGuide !== 'undefined' && (window._currentChapterCategory || activeCategoryStory) === 'phishing') {
    setTimeout(function() {
      RyanGuide.speak([
        { text: "Good decision closing that phishing tab! 🛡️ In a real workplace, closing unverified sites prevents accidental credential theft.", state: 'success' }
      ]);
    }, 300);
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
  strip.innerHTML = browserTabs.map(tab => {
    const isPhish = typeof isPhishingUrl === 'function' && isPhishingUrl(tab.url);
    const isActive = tab.id === browserActiveTabId;
    const isHighlight = isPhish && isActive;
    return `
      <div class="browser-tab${isActive ? ' active' : ''}" onclick="switchTab(${tab.id})" title="${escapeHtml(tab.url)}">
        <span class="browser-tab-favicon">${tab.icon}</span>
        <span class="browser-tab-title">${escapeHtml(tab.title)}</span>
        <button class="browser-tab-close${isHighlight ? ' phish-close-highlight' : ''}" onclick="closeTab(${tab.id}, event)" title="${isHighlight ? 'Close phishing tab' : 'Close tab'}">✕</button>
      </div>
    `;
  }).join('') +
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

  // Notify post-award mission checklist for any URL loaded
  if (typeof window._notifyPostAwardBrowserNav === 'function') {
    window._notifyPostAwardBrowserNav(url);
  }

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

  // Exclude legitimate government, educational and authenticated portals
  if (lower.includes('cisa.gov') || lower.includes('consumer.ftc.gov') || lower.includes('wikipedia.org') || lower.includes('google.com')) {
    return null;
  }

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
        <div class="legitsite-header">
          <div class="legitsite-header-left">
            <div style="font-size:22px;font-weight:900;color:#8a0011;display:flex;align-items:center;gap:8px;">
              <span>🏦</span> BPI Online
            </div>
            <span class="legitsite-badge">✔ Official Verified Portal</span>
          </div>
          <div style="font-size:12.5px;color:#64748b;display:flex;align-items:center;gap:12px;">
            <span>🔒 TLS 1.3 Verified</span>
            <span>Regulated by BSP</span>
          </div>
        </div>
        <div class="legitsite-body">
          <div class="legitsite-advisory-banner">
            <div class="legitsite-advisory-title">🛡️ OFFICIAL BPI CYBER DEFENSE ADVISORY</div>
            <p style="margin:6px 0 0;font-size:14px;line-height:1.6;color:#065f46;">
              BPI will <strong>NEVER</strong> send unsolicited emails, SMS messages, or social links demanding that you verify credentials or enter your One-Time PIN (OTP). The authentic online portal is strictly <strong>bpi.com.ph</strong>.
            </p>
          </div>
          
          <div class="legitsite-hero">
            <h2 style="font-size:24px;font-weight:800;color:#0f172a;margin:0 0 10px;">Welcome to Bank of the Philippine Islands</h2>
            <p style="color:#475569;font-size:14.5px;line-height:1.65;margin:0 0 16px;">
              You have navigated to the authentic BPI online portal. Notice the secure padlock icon (🔒) and the exact <code>bpi.com.ph</code> domain in your browser omnibox.
            </p>
            <div class="legitsite-cards-grid">
              <div class="legitsite-card">
                <span class="legitsite-card-icon">🔍</span>
                <h3>1. Scrutinize the Address Bar</h3>
                <p>Counterfeit domains use lookalike terms such as <code>bpi-online-security.com</code> or <code>bpi-verify.xyz</code>. Official BPI addresses strictly terminate in <strong>.bpi.com.ph</strong>.</p>
              </div>
              <div class="legitsite-card">
                <span class="legitsite-card-icon">⏳</span>
                <h3>2. Reject Manufactured Panic</h3>
                <p>Phishing campaigns claim "Account Locked within 30 Minutes" to provoke hasty clicks. BPI never imposes emergency countdowns via email.</p>
              </div>
              <div class="legitsite-card">
                <span class="legitsite-card-icon">🔐</span>
                <h3>3. Protect Your OTP &amp; MPIN</h3>
                <p>Never disclose your One-Time PIN to anyone—not even someone claiming to be a bank officer. Enter OTPs only inside verified apps.</p>
              </div>
            </div>
          </div>

          <div class="intel-footer-nav" style="border-top:1px solid #e2e8f0;padding-top:16px;">
            <button class="google-btn" onclick="browserGo('https://www.cisa.gov/secure-our-world/recognize-and-report-phishing')">🛡️ CISA Phishing Defense Guide</button>
            <button class="google-btn" onclick="browserGoHome()">🏠 Return to Google Home</button>
          </div>
        </div>
      </div>
    `;
  }
  if (host.includes('paypal.com')) {
    return `
      <div class="legitsite">
        <div class="legitsite-header">
          <div class="legitsite-header-left">
            <div style="font-size:22px;font-weight:900;color:#003087;display:flex;align-items:center;gap:8px;">
              <span>🅿️</span> PayPal
            </div>
            <span class="legitsite-badge">✔ Official Security Center</span>
          </div>
          <div style="font-size:12.5px;color:#64748b;">
            <span>🔒 https://www.paypal.com</span>
          </div>
        </div>
        <div class="legitsite-body">
          <div class="legitsite-advisory-banner">
            <div class="legitsite-advisory-title">🛡️ OFFICIAL PAYPAL SECURITY ADVISORY</div>
            <p style="margin:6px 0 0;font-size:14px;line-height:1.6;color:#065f46;">
              Legitimate PayPal emails will always address you by your verified full legal name—never "Dear Customer", "Dear User", or "Valued Member". Real PayPal transactions appear automatically in your account dashboard.
            </p>
          </div>
          
          <div class="legitsite-hero">
            <h2 style="font-size:24px;font-weight:800;color:#0f172a;margin:0 0 10px;">PayPal Official Security &amp; Safety Center</h2>
            <p style="color:#475569;font-size:14.5px;line-height:1.65;margin:0 0 16px;">
              Learn how to detect fraudulent PayPal impersonations and counterfeit payment notifications.
            </p>
            <div class="legitsite-cards-grid">
              <div class="legitsite-card">
                <span class="legitsite-card-icon">🚩</span>
                <h3>Typosquatting Detection</h3>
                <p>Fraudulent clones replace the letter <strong>l</strong> with the digit <strong>1</strong> (e.g. <code>paypa1.com</code>). Check every character before logging in!</p>
              </div>
              <div class="legitsite-card">
                <span class="legitsite-card-icon">🎁</span>
                <h3>Fake Prize Disbursements</h3>
                <p>Emails promising "₱1,000,000 Cash Claim" or lottery windfalls are credential harvesters. PayPal does not issue unearned prize transfers.</p>
              </div>
              <div class="legitsite-card">
                <span class="legitsite-card-icon">📧</span>
                <h3>Forwarding Phishing Samples</h3>
                <p>If you suspect an email impersonating PayPal, forward the full message with headers to <code>spoof@paypal.com</code> for automated analysis.</p>
              </div>
            </div>
          </div>

          <div class="intel-footer-nav" style="border-top:1px solid #e2e8f0;padding-top:16px;">
            <button class="google-btn" onclick="browserGo('https://www.cisa.gov/secure-our-world/recognize-and-report-phishing')">🛡️ CISA Phishing Defense Guide</button>
            <button class="google-btn" onclick="browserGoHome()">🏠 Return to Google Home</button>
          </div>
        </div>
      </div>
    `;
  }
  if (host.includes('gcash.com')) {
    return `
      <div class="legitsite">
        <div class="legitsite-header">
          <div class="legitsite-header-left">
            <div style="font-size:22px;font-weight:900;color:#005cfc;display:flex;align-items:center;gap:8px;">
              <span>📱</span> GCash
            </div>
            <span class="legitsite-badge">✔ Official Trust &amp; Safety</span>
          </div>
          <div style="font-size:12.5px;color:#64748b;">
            <span>🔒 gcash.com</span>
          </div>
        </div>
        <div class="legitsite-body">
          <div class="legitsite-advisory-banner">
            <div class="legitsite-advisory-title">🛡️ GCASH TRUST &amp; SECURITY PROTOCOL</div>
            <p style="margin:6px 0 0;font-size:14px;line-height:1.6;color:#065f46;">
              <strong>NEVER share your 4-digit MPIN or One-Time PIN.</strong> GCash support representatives will never contact you asking for security codes, passwords, or recovery seeds.
            </p>
          </div>

          <div class="legitsite-hero">
            <h2 style="font-size:24px;font-weight:800;color:#0f172a;margin:0 0 10px;">GCash Customer Protection Center</h2>
            <p style="color:#475569;font-size:14.5px;line-height:1.65;margin:0 0 16px;">
              Authentic GCash transactions are strictly processed through the official mobile application and verified <strong>gcash.com</strong> channels.
            </p>
            <div class="legitsite-cards-grid">
              <div class="legitsite-card">
                <span class="legitsite-card-icon">📵</span>
                <h3>Smishing &amp; Text Scams</h3>
                <p>Beware of text messages claiming your account was deactivated. Check the sender ID and never click external links in SMS.</p>
              </div>
              <div class="legitsite-card">
                <span class="legitsite-card-icon">🔒</span>
                <h3>Biometrics &amp; MPIN</h3>
                <p>Enable fingerprint and facial recognition login on your mobile phone to prevent unauthorized physical device access.</p>
              </div>
              <div class="legitsite-card">
                <span class="legitsite-card-icon">🚨</span>
                <h3>Instant Hotline</h3>
                <p>Report unauthorized account activity immediately through 2882 or the official Help Center in the GCash app.</p>
              </div>
            </div>
          </div>

          <div class="intel-footer-nav" style="border-top:1px solid #e2e8f0;padding-top:16px;">
            <button class="google-btn" onclick="browserGo('https://www.cisa.gov/secure-our-world/recognize-and-report-phishing')">🛡️ CISA Phishing Defense Guide</button>
            <button class="google-btn" onclick="browserGoHome()">🏠 Return to Google Home</button>
          </div>
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

  const isGoogleHome = url === 'https://www.google.com' || url === '' || url === 'about:blank';
  const isGoogleSearch = /^https:\/\/www\.google\.com\/search/i.test(url);

  // 1. Google Homepage
  if (isGoogleHome) {
    updateBrowserPhishingNotice(false);
    setTabMeta('Google', '🌐', '🔒 Secure', 'secure');
    content.innerHTML = renderGoogleHome();
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

  // 3. Google Search Results with Media Tabs (All, Images, News, Videos)
  if (isGoogleSearch) {
    let q = '';
    let tabName = 'all';
    try {
      const u = new URL(url);
      q = u.searchParams.get('q') || '';
      tabName = u.searchParams.get('tab') || 'all';
    } catch (e) {
      const parts = url.split('q=')[1] || '';
      q = decodeURIComponent(parts.split('&')[0] || '');
      if (url.includes('tab=')) {
        tabName = url.split('tab=')[1].split('&')[0];
      }
    }
    const tabSuffix = tabName === 'all' ? '' : ` (${tabName.charAt(0).toUpperCase() + tabName.slice(1)})`;
    setTabMeta(`${q}${tabSuffix} — Google Search`, '🔍', '🔒 Secure', 'secure');
    content.innerHTML = renderGoogleResults(q, tabName);
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

  // 4b. Instagram Simulated Web App (Pia's Social Media Profile)
  if (/instagram\.com/i.test(url)) {
    setTabMeta('Pia (@pia.cyber) • Instagram photos and videos', '📸', '🔒 Secure', 'secure');
    content.innerHTML = renderInstagramSite();
    return;
  }

  // 5. Official Threat Intel & Cybersecurity Guides
  if (/recognize-and-report-phishing|secure-our-world/i.test(url)) {
    setTabMeta('Recognize and Report Phishing | CISA', '🛡️', '🔒 Secure', 'secure');
    content.innerHTML = renderCisaPhishingSite();
    return;
  }

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
  // If user is on the post-award checklist, ensure any lingering phishing tabs are closed
  if (window._awardClaimed && Array.isArray(browserTabs)) {
    const hasPhish = browserTabs.some(t => typeof isPhishingUrl === 'function' && isPhishingUrl(t.url));
    if (hasPhish) {
      browserTabs = browserTabs.filter(t => typeof isPhishingUrl === 'function' && !isPhishingUrl(t.url));
      if (browserTabs.length === 0) {
        initBrowserTabs();
      } else {
        if (!browserTabs.some(t => t.id === browserActiveTabId)) {
          browserActiveTabId = browserTabs[0].id;
        }
        renderTabStrip();
        renderActiveTab();
      }
    }
  }
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
  if (str === null || str === undefined) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
window.escapeHtml = escapeHtml;

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

function clearHomeSearch() {
  const input = document.getElementById('browser-home-search');
  if (input) {
    input.value = '';
    input.focus();
  }
  const clearBtn = document.getElementById('browser-home-search-clear');
  if (clearBtn) clearBtn.style.display = 'none';
}
window.clearHomeSearch = clearHomeSearch;

function handleHomeSearchInput(input) {
  const clearBtn = document.getElementById('browser-home-search-clear');
  if (clearBtn) {
    clearBtn.style.display = (input && input.value.trim().length > 0) ? 'inline-flex' : 'none';
  }
}
window.handleHomeSearchInput = handleHomeSearchInput;

function clearResultsSearch() {
  const input = document.getElementById('gresults-search-input');
  if (input) {
    input.value = '';
    input.focus();
  }
  const clearBtn = document.getElementById('gresults-clear-btn');
  if (clearBtn) clearBtn.style.display = 'none';
}
window.clearResultsSearch = clearResultsSearch;

function handleResultsSearchInput(input) {
  const clearBtn = document.getElementById('gresults-clear-btn');
  if (clearBtn) {
    clearBtn.style.display = (input && input.value.trim().length > 0) ? 'inline-flex' : 'none';
  }
}
window.handleResultsSearchInput = handleResultsSearchInput;

function submitBrowserUrl() {
  const input = document.getElementById('browser-url-input');
  if (input) browserGo(input.value);
}

function browserGo(raw) {
  const trimmed = (raw || '').trim();
  if (!trimmed) return;

  const isPhish = typeof isPhishingUrl === 'function' && isPhishingUrl(trimmed);
  const isSearch = isSearchQuery(trimmed) || /^https?:\/\/(www\.)?google\.com\/search/i.test(trimmed);

  // User need to search: only mark checklist complete if they actually performed a search, NOT opening a phishing link
  if (window._awardClaimed && window._postAwardTasks && !isPhish && isSearch) {
    window._postAwardTasks.phishingSearched = true;
    if (typeof _refreshPostAwardChecklist === 'function') _refreshPostAwardChecklist();
  }

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
  // Notify post-award mission checklist
  if (typeof window._notifyPostAwardBrowserNav === 'function') {
    window._notifyPostAwardBrowserNav(url);
  }
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
          <button class="google-btn" onclick="browserGo('https://www.cisa.gov/secure-our-world/recognize-and-report-phishing')">🎣 CISA Phishing Guide</button>
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
              <div><strong>Recognize and Report Phishing:</strong> Think before you click. Be suspicious of unsolicited requests for personal info, urgency, and strange sender emails. <a href="#" onclick="browserGo('https://www.cisa.gov/secure-our-world/recognize-and-report-phishing'); return false;" style="color:#0284c7;font-weight:700;margin-left:4px;">Read Secure Our World Guide ➔</a></div>
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
            <li><strong>Phishing &amp; Social Engineering Advisory (Secure Our World):</strong> <a href="#" onclick="browserGo('https://www.cisa.gov/secure-our-world/recognize-and-report-phishing'); return false;" style="color:#0284c7;font-weight:700;">Recognize and Report Phishing — CISA Official Guide ➔</a></li>
            <li><strong>Malware &amp; Software Dropper Advisory:</strong> <a href="#" onclick="browserGo('https://www.cisa.gov/topics/malware'); return false;" style="color:#0284c7;font-weight:700;">Read the complete Malware Intel &amp; Classification Guide ➔</a></li>
            <li><strong>FTC Consumer Guidance:</strong> <a href="#" onclick="browserGo('https://www.consumer.ftc.gov/articles/how-recognize-phishing'); return false;" style="color:#0284c7;font-weight:700;">How to identify deceptive phishing domains and fake sender headers ➔</a></li>
          </ul>
        </div>
      </div>
    </div>`;
}

// ── CISA SECURE OUR WORLD: RECOGNIZE AND REPORT PHISHING ──
function renderCisaPhishingSite() {
  return `
    <div class="cisasite">
      <div class="intel-banner" style="background: linear-gradient(135deg, #091e3a 0%, #173866 100%); border-bottom: 3px solid #00c0f7;">
        <div class="intel-banner-left">
          <span class="intel-banner-shield" style="font-size:30px;">🛡️</span>
          <div>
            <div class="intel-banner-title" style="letter-spacing:0.8px;font-weight:900;">CYBERSECURITY &amp; INFRASTRUCTURE SECURITY AGENCY</div>
            <div class="intel-banner-sub" style="color:#7dd3fc;font-weight:600;">AMERICA'S CYBER DEFENSE AGENCY • SECURE OUR WORLD</div>
          </div>
        </div>
        <div class="intel-banner-badge" style="background:rgba(0,192,247,0.18);border:1px solid #00c0f7;color:#e0f2fe;font-weight:700;">
          SECURE OUR WORLD: PHISHING DEFENSE
        </div>
      </div>

      <div class="intel-content">
        <div class="intel-breadcrumbs">
          <a href="#" onclick="browserGoHome(); return false;">Home</a> › 
          <a href="#" onclick="browserGo('https://www.cisa.gov'); return false;">CISA</a> › 
          <a href="#" onclick="browserGo('https://www.cisa.gov'); return false;">Secure Our World</a> › 
          <span>Recognize and Report Phishing</span>
        </div>

        <h1 class="intel-h1" style="font-size:28px;color:#0c2340;margin-bottom:8px;">
          Recognize and Report Phishing
        </h1>
        <div class="intel-meta-bar">
          <span>🏛️ Official Government Source (cisa.gov)</span>
          <span>🛡️ Program: Secure Our World</span>
          <span>⏱️ 4 min read</span>
          <span class="verified-tag">✔ Verified Cyber Defense Guidance</span>
        </div>

        <div class="intel-alert-box" style="background:#eff6ff;border-left:4px solid #0284c7;color:#0c4a6e;">
          <strong>⚠️ The Frontline of Cyber Defense:</strong> More than 90% of successful cyberattacks and organizational security incidents begin with a phishing email. Attackers manipulate emotions—such as fear, urgency, curiosity, or greed—to trick individuals into surrendering login credentials, wire transfers, or downloading destructive malware droppers.
        </div>

        <div class="intel-section">
          <h2>1. What is Phishing?</h2>
          <p>
            <strong>Phishing</strong> is when cyber criminals send deceptive emails, messages (<em>smishing</em>), or make telephone calls (<em>vishing</em>) attempting to lure victims into clicking malicious links, sharing confidential passwords, or downloading dangerous files.
          </p>
          <p>
            Attackers frequently impersonate legitimate, trusted organizations such as financial institutions, popular software platforms (PayPal, Microsoft 365, Canva), or internal workplace departments (HR, IT Helpdesk). By disguising their identity, they bypass normal skepticism.
          </p>
        </div>

        <div class="intel-section">
          <h2>2. How to Recognize Phishing: The 4 Core Red Flags</h2>
          <p>CISA urges everyone to slow down and scrutinize incoming messages for these four telltale warning signs:</p>
          
          <div class="intel-cards-grid">
            <div class="intel-threat-card card-trojan">
              <div class="threat-card-header">
                <span class="threat-card-name">🚩 1. Suspicious Senders &amp; Typosquatting</span>
                <span class="threat-card-tag" style="background:#fef3c7;color:#b45309;">Primary Clue</span>
              </div>
              <p class="threat-card-desc">
                Attackers customize display names (e.g., "PayPal Billing" or "IT Support") to seem authentic, but the address behind the @ symbol reveals the fraud. Check for lookalike domains (<strong>typosquatting</strong>), such as substituting the letter "l" with the number "1" (e.g., <code>paypa1.com</code>) or unauthorized webmail domains.
              </p>
              <div class="threat-card-case">
                <strong>In CyberZER0 (Incident 1):</strong> Look closely at the sender header in Zmail. A message claiming a ₱1,000,000 prize originates from <code>paypa1.com</code>, a counterfeit domain!
              </div>
            </div>

            <div class="intel-threat-card card-ransom">
              <div class="threat-card-header">
                <span class="threat-card-name">⏰ 2. Artificial Urgency &amp; Panic</span>
                <span class="threat-card-tag" style="background:#fee2e2;color:#b91c1c;">Psychological Tactic</span>
              </div>
              <p class="threat-card-desc">
                Demands instant action under threat of penalty: "Your account will be suspended within 24 hours!", "Urgent payment required immediately!", or "Security alert: unauthorized login detected!". Cyber criminals invent artificial urgency so you act on emotion before your analytical thinking engages.
              </p>
              <div class="threat-card-case">
                <strong>Defense Rule:</strong> Authentic institutions will never demand you verify passwords within minutes to prevent account destruction.
              </div>
            </div>

            <div class="intel-threat-card card-spyware">
              <div class="threat-card-header">
                <span class="threat-card-name">🔗 3. Mismatched Links &amp; Hidden URLs</span>
                <span class="threat-card-tag" style="background:#ede9fe;color:#6d28d9;">Technical Trap</span>
              </div>
              <p class="threat-card-desc">
                The visible text in an email can say anything—such as <code>https://www.paypal.com</code> or <code>https://bpi.com.ph</code>. However, hovering your cursor over the link reveals the actual destination URL pointing to a completely unrelated malicious or unverified website.
              </p>
              <div class="threat-card-case">
                <strong>Inspection Method:</strong> Always hover over links before clicking. In Zmail, look at the URL preview bar to inspect destination hosts.
              </div>
            </div>

            <div class="intel-threat-card card-worm">
              <div class="threat-card-header">
                <span class="threat-card-name">📎 4. Unexpected Attachments &amp; Droppers</span>
                <span class="threat-card-tag" style="background:#e0f2fe;color:#0369a1;">Payload Risk</span>
              </div>
              <p class="threat-card-desc">
                Unsolicited attachments—such as unexpected invoices, receipts, or job resumes—packaged as <code>.zip</code>, <code>.iso</code>, <code>.exe</code>, <code>.scr</code>, or macro-enabled documents (<code>.docm</code>). Opening these executes malware droppers that infect the operating system.
              </p>
              <div class="threat-card-case">
                <strong>Threat Advisory:</strong> Never open unexpected email attachments without verifying the sender through a separate, trusted channel.
              </div>
            </div>
          </div>
        </div>

        <div class="intel-section">
          <h2>3. What to Do When You Spot Phishing: CISA Action Plan</h2>
          <div class="defense-steps-box">
            <div class="defense-step">
              <span class="step-num">1</span>
              <div>
                <strong>Stop and Think — Do Not Click, Reply, or Enter Data:</strong> If an email feels urgent, strange, or too good to be true, pause. Never enter your credentials, passwords, or One-Time PINs (OTPs) on forms linked from emails.
              </div>
            </div>
            <div class="defense-step">
              <span class="step-num">2</span>
              <div>
                <strong>Verify Through an Independent Channel:</strong> If an email claims your account is locked or asks for payment, navigate directly to the company's authentic website by typing their known domain into your browser, or contact them via a verified telephone number.
              </div>
            </div>
            <div class="defense-step">
              <span class="step-num">3</span>
              <div>
                <strong>Report the Phishing Attempt:</strong>
                <ul style="margin:6px 0 0;padding-left:18px;line-height:1.6;font-size:13px;">
                  <li><strong>In CyberZER0:</strong> Activate <strong>Flag Mode</strong> in Zmail to tag red flags, then submit a <strong>Phishing Verdict</strong>.</li>
                  <li><strong>In the Workplace / School:</strong> Click the "Report Phishing" button in your email client or forward the email to your internal IT Security department.</li>
                  <li><strong>Government Reporting:</strong> Forward phishing emails to CISA at <code>phishing-report@us-cert.gov</code> and report online scams to the FTC at <code>reportfraud.ftc.gov</code>.</li>
                </ul>
              </div>
            </div>
            <div class="defense-step">
              <span class="step-num">4</span>
              <div>
                <strong>Immediate Mitigation if Compromised:</strong> If you accidentally entered information on a suspicious website: change your password immediately, revoke active sessions, enable Multi-Factor Authentication (MFA), and inform your IT administrator.
              </div>
            </div>
          </div>
        </div>

        <div class="intel-section" style="background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%); border: 1px solid #86efac;">
          <h2 style="color:#166534;border-bottom-color:#bbf7d0;">🎯 Apply What You Learned in CyberZER0</h2>
          <p style="color:#14532d;">
            Ready to test your skills? Return to <strong>Zmail</strong> to inspect the employee inbox and protect the company from unauthorized intrusions:
          </p>
          <div style="display:flex;flex-wrap:wrap;gap:12px;margin-top:10px;">
            <div style="background:#fff;padding:12px 16px;border-radius:8px;border:1px solid #bbf7d0;flex:1;min-width:220px;">
              <strong style="color:#15803d;">1. Inspect the Sender</strong>
              <p style="margin:4px 0 0;font-size:12.5px;color:#4b5563;">Examine the email address for typosquatting, lookalike letters, or external domains.</p>
            </div>
            <div style="background:#fff;padding:12px 16px;border-radius:8px;border:1px solid #bbf7d0;flex:1;min-width:220px;">
              <strong style="color:#15803d;">2. Activate Flag Mode</strong>
              <p style="margin:4px 0 0;font-size:12.5px;color:#4b5563;">Click the Flag Mode button in Zmail to tag suspicious headers, body urgency, and URLs.</p>
            </div>
            <div style="background:#fff;padding:12px 16px;border-radius:8px;border:1px solid #bbf7d0;flex:1;min-width:220px;">
              <strong style="color:#15803d;">3. Submit Your Verdict</strong>
              <p style="margin:4px 0 0;font-size:12.5px;color:#4b5563;">Mark as Phishing or Legitimate to protect the organization and score detective points!</p>
            </div>
          </div>
        </div>

        <div class="intel-footer-nav">
          <button class="google-btn" onclick="browserGo('https://www.cisa.gov')">🛡️ CISA Cyber Defense Home</button>
          <button class="google-btn" onclick="browserGo('https://www.cisa.gov/topics/malware')">🦠 Malware Intel Guide</button>
          <button class="google-btn" onclick="browserGoHome()">🏠 Return to Google</button>
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
          <button class="google-btn" onclick="browserGo('https://www.cisa.gov/secure-our-world/recognize-and-report-phishing')">🛡️ CISA Recognize &amp; Report Phishing</button>
          <button class="google-btn" onclick="browserGo('https://www.cisa.gov/topics/malware')">🦠 Learn About Malware Threats</button>
          <button class="google-btn" onclick="browserGoHome()">🏠 Return to Google Home</button>
        </div>
      </div>
    </div>`;
}

// ── AUTHENTIC GOOGLE HOMEPAGE RENDERER ──
function renderGoogleHome() {
  return `
    <div class="browser-home">
      <div class="ghome-topbar">
        <a class="ghome-link" href="#" onclick="browserGo('https://www.google.com/search?q=phishing'); return false;">Gmail</a>
        <a class="ghome-link" href="#" onclick="switchGoogleSearchTab('images', 'cybersecurity'); return false;">Images</a>
        <span class="ghome-app-icon" title="Google Apps" onclick="showToast('Google Apps: Docs, Drive, Mail', 'info')">⠿</span>
      </div>
      <div class="ghome-main">
        <div class="google-logo">
          <span class="gl-blue">G</span><span class="gl-red">o</span><span class="gl-yellow">o</span><span class="gl-blue">g</span><span class="gl-green">l</span><span class="gl-red">e</span>
        </div>
        <div class="google-search-box">
          <span class="google-search-icon">🔍</span>
          <input type="text" id="browser-home-search" class="google-search-input" placeholder="Search Google or type a URL (e.g. phishing, malware, cisa.gov)" autocomplete="off" spellcheck="false" onkeydown="handleHomeSearchKey(event)" oninput="handleHomeSearchInput(this)">
          <button type="button" class="google-search-clear" id="browser-home-search-clear" style="display:none;" onclick="clearHomeSearch()" title="Clear">✕</button>
          <span class="google-search-mic" title="Search by voice" onclick="showToast('🎤 Voice Search: Listening for cybersecurity queries...', 'info')">🎙️</span>
          <span class="google-search-lens" title="Search by image" onclick="switchGoogleSearchTab('images', 'phishing red flags')">📷</span>
        </div>
        <div class="google-search-actions">
          <button type="button" class="google-btn" onclick="submitHomeSearch()">Google Search</button>
          <button type="button" class="google-btn" onclick="browserGo('https://www.cisa.gov/secure-our-world/recognize-and-report-phishing')">I'm Feeling Lucky (CISA Guide)</button>
        </div>
      </div>
      <div class="ghome-footer">
        <div class="ghome-footer-top">Philippines</div>
        <div class="ghome-footer-links">
          <div>
            <a href="#" onclick="showToast('Google Search Simulator — CyberZER0 Edition', 'info'); return false;">About</a>
            <a href="#" onclick="showToast('CyberZER0 Detective Training Module', 'info'); return false;">Advertising</a>
            <a href="#" onclick="showToast('Enterprise Cyber Defense Solutions', 'info'); return false;">Business</a>
            <a href="#" onclick="showToast('SafeSearch filtering active locally.', 'info'); return false;">How Search works</a>
          </div>
          <div>
            <a href="#" onclick="showToast('Privacy: Local client sandbox isolation.', 'info'); return false;">Privacy</a>
            <a href="#" onclick="showToast('Terms: Educational interactive demo.', 'info'); return false;">Terms</a>
            <a href="#" onclick="showToast('Settings: High-speed local rendering enabled.', 'info'); return false;">Settings</a>
          </div>
        </div>
      </div>
  `;
}
BROWSER_HOME_HTML = renderGoogleHome();
window.BROWSER_HOME_HTML = BROWSER_HOME_HTML;

// ── TAB SWITCHER FOR GOOGLE SEARCH (All / Images / News / Videos) ──
function switchGoogleSearchTab(tabName, query) {
  const cleanQ = (query || 'phishing').trim();
  const targetUrl = `https://www.google.com/search?q=${encodeURIComponent(cleanQ)}&tab=${encodeURIComponent(tabName)}`;
  if (window._awardClaimed && window._postAwardTasks) {
    window._postAwardTasks.phishingSearched = true;
    if (typeof _refreshPostAwardChecklist === 'function') _refreshPostAwardChecklist();
  }
  const tab = getActiveTab();
  if (tab) {
    renderPageIntoTab(tab, targetUrl);
  } else {
    browserGo(targetUrl);
  }
}
window.switchGoogleSearchTab = switchGoogleSearchTab;

// ── BOOKMARK TOGGLE HELPER ──
function toggleBrowserBookmark() {
  const tab = getActiveTab();
  const title = tab ? tab.title : 'Current Website';
  if (typeof showToast === 'function') {
    showToast(`⭐ Saved to Bookmarks: ${title}`, 'success');
  }
}
window.toggleBrowserBookmark = toggleBrowserBookmark;

// ── MASTER BROWSER IMAGES DATABASE (assets/Browser/Images/) ──
const BROWSER_IMAGE_DATABASE = [
  // ── MALWARE INFOGRAPHICS ──
  {
    id: 'malware-1',
    category: 'malware',
    src: 'assets/Browser/Images/Malware 1.png',
    title: 'Types of Malware: Ransomware, Spyware, Adware, Worms, Trojans & Botnets',
    tag: 'Infographic',
    res: '1672 × 941',
    source: 'cisa.gov',
    link: 'https://www.cisa.gov/topics/malware',
    desc: 'Educational visual breakdown detailing the core categories of malicious software: Ransomware, Spyware, Adware, Worms, Trojans, and Botnet networks.',
    keywords: ['malware', 'types of malware', 'ransomware', 'spyware', 'adware', 'worms', 'trojans', 'trojan', 'botnets', 'botnet', 'virus', 'infection']
  },
  {
    id: 'malware-2',
    category: 'malware',
    src: 'assets/Browser/Images/Malware 2.png',
    title: 'Common Types of Malware: Definitions, Behaviors & Infection Vectors',
    tag: 'Linprofs Intel',
    res: '1672 × 941',
    source: 'linprofs.com',
    link: 'https://www.cisa.gov/topics/malware',
    desc: 'Comprehensive threat guide by Linprofs classifying Virus, Worm, Trojan, Ransomware, Spyware, and Adware replication mechanisms.',
    keywords: ['malware', 'common types of malware', 'virus', 'worm', 'trojan', 'ransomware', 'spyware', 'adware', 'linprofs', 'vectors']
  },
  {
    id: 'malware-3',
    category: 'malware',
    src: 'assets/Browser/Images/Malware 3.png',
    title: 'Malware Taxonomy: Fileless Threats, Rootkits, Botnets & Keyloggers',
    tag: 'Architecture',
    res: '1672 × 941',
    source: 'sans.org',
    link: 'https://www.cisa.gov/topics/malware',
    desc: 'In-depth taxonomy examining advanced persistence threats: Fileless In-Memory Malware, Kernel Rootkits, Botnet Command Nodes, and Keystroke Loggers.',
    keywords: ['malware', 'fileless malware', 'rootkit', 'keylogger', 'botnet', 'virus', 'worm', 'trojan', 'spyware', 'adware', 'ransomware']
  },
  {
    id: 'malware-4',
    category: 'malware',
    src: 'assets/Browser/Images/Malware 4.png',
    title: 'Virus vs. Malware: Comparison, User Triggering & Self-Replication',
    tag: 'Concepts',
    res: '1672 × 941',
    source: 'cisa.gov',
    link: 'https://www.cisa.gov/topics/malware',
    desc: 'Clear comparative diagram distinguishing user-executed viruses from broader autonomous malware classifications like Trojans and spyware.',
    keywords: ['malware', 'virus vs malware', 'virus', 'trojan', 'self-replicating', 'concepts', 'difference']
  },
  {
    id: 'malware-5',
    category: 'malware',
    src: 'assets/Browser/Images/Malware 5.png',
    title: 'Business Impact of Malware: Financial Losses, Downtime & Legal Liability',
    tag: 'Risk Analysis',
    res: '1672 × 941',
    source: 'cisa.gov',
    link: 'https://www.cisa.gov/topics/malware',
    desc: 'Enterprise impact analysis highlighting four catastrophic attack outcomes: Direct Financial Loss, Extended Downtime, Reputation Harm, and Regulatory Fines.',
    keywords: ['malware', 'impact of malware', 'financial loss', 'downtime', 'reputation damage', 'legal consequences', 'business risk']
  },
  {
    id: 'malware-6',
    category: 'malware',
    src: 'assets/Browser/Images/Malware 6.png',
    title: 'Malware Protection Best Practices & Endpoint Hardening Framework',
    tag: 'Defense',
    res: '1672 × 941',
    source: 'cisa.gov',
    link: 'https://www.cisa.gov/topics/malware',
    desc: 'Multi-layered defense strategy: active antivirus protection, systematic system patches, automated cold backups, MFA, and download scrutiny.',
    keywords: ['malware', 'malware protection', 'best practices', 'defense', 'antivirus', 'updates', 'backups', 'passwords', 'mfa', 'network security']
  },
  {
    id: 'malware-7',
    category: 'malware',
    src: 'assets/Browser/Images/Malware 7.png',
    title: 'Signs of Malware Infection: Sluggish Performance, Crashes & Popup Ads',
    tag: 'Detection',
    res: '1672 × 941',
    source: 'cisa.gov',
    link: 'https://www.cisa.gov/topics/malware',
    desc: 'Warning indicators that an endpoint has been compromised: frequent blue screens, disabled security scanners, unauthorized toolbars, and disk throttling.',
    keywords: ['malware', 'signs of malware', 'symptoms', 'infection', 'slowdown', 'crashes', 'blue screen', 'popups', 'antivirus disabled', 'disk space']
  },
  {
    id: 'malware-8',
    category: 'malware',
    src: 'assets/Browser/Images/Malware 8.png',
    title: 'How to Prevent Malware: Multi-Factor Authentication & Link Hygiene',
    tag: 'Prevention',
    res: '1672 × 941',
    source: 'cisa.gov',
    link: 'https://www.cisa.gov/topics/malware',
    desc: 'Practical 6-pillar defense guide: enforce MFA, avoid clicking untrusted links, configure email filtering, maintain offline backups, and purge risky downloads.',
    keywords: ['malware', 'how to prevent malware', 'prevention', 'mfa', 'suspicious links', 'email security', 'backup', 'updates', 'hygiene']
  },

  // ── PHISHING INFOGRAPHICS ──
  {
    id: 'phishing-1',
    category: 'phishing',
    src: 'assets/Browser/Images/Phishing 1.png',
    title: 'Visualizing Phishing: Deceptive Baiting of Passwords, Emails & SMS',
    tag: 'Illustration',
    res: '1672 × 941',
    source: 'cisa.gov',
    link: 'https://www.cisa.gov/secure-our-world/recognize-and-report-phishing',
    desc: 'Conceptual illustration of cyber adversaries using deceptive email lures, phone numbers, and harvested credential portals to compromise employee workstations.',
    keywords: ['phishing', 'visualizing phishing', 'baiting', 'credentials', 'password', 'email lure', 'scam', 'social engineering']
  },
  {
    id: 'phishing-2',
    category: 'phishing',
    src: 'assets/Browser/Images/Phishing 2.png',
    title: 'What is Phishing? Brand Impersonation, Data Theft & Social Engineering',
    tag: 'Overview',
    res: '1672 × 941',
    source: 'cisa.gov',
    link: 'https://www.cisa.gov/secure-our-world/recognize-and-report-phishing',
    desc: 'Core educational definition covering entity impersonation (banks, executive colleagues), credential theft, and psychological manipulation tactics.',
    keywords: ['phishing', 'what is phishing', 'impersonation', 'data theft', 'social engineering', 'credentials', 'human psychology']
  },
  {
    id: 'phishing-3',
    category: 'phishing',
    src: 'assets/Browser/Images/Phishing 3.png',
    title: 'Personal Data Theft via Phishing Hooks & Counterfeit Web Portals',
    tag: 'Threat Model',
    res: '1672 × 941',
    source: 'consumer.ftc.gov',
    link: 'https://www.consumer.ftc.gov/articles/how-recognize-phishing',
    desc: 'Diagram depicting how malicious actors angle for sensitive corporate records, personal identity data, and banking credentials over unauthorized remote sessions.',
    keywords: ['phishing', 'personal data', 'data theft', 'phishing hook', 'fake portal', 'identity theft', 'scam']
  },
  {
    id: 'phishing-4',
    category: 'phishing',
    src: 'assets/Browser/Images/Phishing 4.png',
    title: 'Protect Yourself from Phishing on Facebook & Social Media (DICT Advisory)',
    tag: 'DICT Advisory',
    res: '1672 × 941',
    source: 'dict.gov.ph',
    link: 'https://www.cisa.gov/secure-our-world/recognize-and-report-phishing',
    desc: 'Official advisory from DICT Cybersecurity Bureau on social media phishing: never click account verification links, always use official apps, and update patches.',
    keywords: ['phishing', 'facebook phishing', 'social media', 'dict', 'philippines', 'account verification', 'scam links', 'social engineering']
  },
  {
    id: 'phishing-5',
    category: 'phishing',
    src: 'assets/Browser/Images/Phishing 5.png',
    title: '8 Red Flags of Phishing Scams: Sender Spoofing to Urgent Threats (DICT)',
    tag: 'Red Flags',
    res: '1672 × 941',
    source: 'dict.gov.ph',
    link: 'https://www.cisa.gov/secure-our-world/recognize-and-report-phishing',
    desc: 'Essential 8-point detection checklist by DICT: suspicious sender emails, generic greetings, artificial urgency, data requests, grammar flaws, and fake offers.',
    keywords: ['phishing', 'red flags', 'phishing scams', '8 red flags', 'sender spoofing', 'urgency', 'generic greetings', 'fake offers', 'email red flags', 'dict']
  },
  {
    id: 'phishing-6',
    category: 'phishing',
    src: 'assets/Browser/Images/Phishing 6.png',
    title: 'The Phishing Spectrum: Email Phishing vs. Vishing (Phone) vs. Smishing (SMS)',
    tag: 'Channels',
    res: '1672 × 941',
    source: 'cisa.gov',
    link: 'https://www.cisa.gov/secure-our-world',
    desc: 'Comprehensive multi-channel comparison explaining traditional email phishing, phone call voice phishing (vishing), and mobile SMS text phishing (smishing).',
    keywords: ['phishing', 'vishing', 'smishing', 'voice phishing', 'sms phishing', 'channels', 'phone scam', 'text scam', 'social engineering']
  },
  {
    id: 'phishing-7',
    category: 'phishing',
    src: 'assets/Browser/Images/Phishing 7.png',
    title: 'Understanding Vishing: Voice Phishing Phone Scams & Prevention (DICT)',
    tag: 'Vishing Guide',
    res: '1672 × 941',
    source: 'dict.gov.ph',
    link: 'https://www.cisa.gov/secure-our-world',
    desc: 'Official DICT Cybersecurity Bureau public advisory defining vishing phone deception and providing reporting hotlines for reporting fraudulent callers.',
    keywords: ['phishing', 'vishing', 'voice phishing', 'phone call', 'dict', 'philippines', 'cert-ph', 'telecom fraud', 'social engineering']
  },
  {
    id: 'phishing-8',
    category: 'phishing',
    src: 'assets/Browser/Images/Phishing 8.png',
    title: 'Quishing: QR-Code Based Phishing Scams & Prevention Guidelines (DICT #40)',
    tag: 'Quishing Guide',
    res: '1672 × 941',
    source: 'dict.gov.ph',
    link: 'https://www.cisa.gov/secure-our-world',
    desc: 'DICT Cybersecurity Pagebook #40 advisory on Quishing: dangers of scanning public stickers/posters, downloading payload via QR, and using preview scanners.',
    keywords: ['phishing', 'quishing', 'qr code', 'qr phishing', 'dict', 'pagebook', 'scan scam', 'malicious qr', 'social engineering']
  }
];

// Helper to filter and rank images according to user search query
function getFilteredBrowserImages(query) {
  const qClean = (query || '').trim().toLowerCase();
  if (!qClean || qClean === 'all' || qClean === 'cyber' || qClean === 'cybersecurity' || qClean === 'security') {
    return BROWSER_IMAGE_DATABASE.slice();
  }

  // Exact base query matches preserve natural catalog sequence
  if (qClean === 'phishing' || qClean === 'phish') {
    return BROWSER_IMAGE_DATABASE.filter(img => img.category === 'phishing');
  }
  if (qClean === 'malware') {
    return BROWSER_IMAGE_DATABASE.filter(img => img.category === 'malware');
  }

  const tokens = qClean.split(/[\s,+-]+/).filter(Boolean);

  const isPhishingQuery = /phish|email|vishing|smishing|quishing|social(\s+engineering)?|bait|spoof/i.test(qClean);
  const isMalwareQuery = /malware|virus|trojan|worm|ransomware|spyware|adware|botnet|rootkit|keylogger|dropper/i.test(qClean);

  if (isPhishingQuery && !isMalwareQuery) {
    const list = BROWSER_IMAGE_DATABASE.filter(img => img.category === 'phishing');
    return list.sort((a, b) => scoreImageRelevance(b, tokens, qClean) - scoreImageRelevance(a, tokens, qClean));
  }

  if (isMalwareQuery && !isPhishingQuery) {
    const list = BROWSER_IMAGE_DATABASE.filter(img => img.category === 'malware');
    return list.sort((a, b) => scoreImageRelevance(b, tokens, qClean) - scoreImageRelevance(a, tokens, qClean));
  }

  const scored = BROWSER_IMAGE_DATABASE.map(img => ({
    img,
    score: scoreImageRelevance(img, tokens, qClean)
  }));

  const positive = scored.filter(s => s.score > 0).sort((a, b) => b.score - a.score).map(s => s.img);
  if (positive.length > 0) {
    return positive;
  }

  return BROWSER_IMAGE_DATABASE.slice();
}

function scoreImageRelevance(img, tokens, fullQuery) {
  let score = 0;
  const titleLower = img.title.toLowerCase();
  const descLower = img.desc.toLowerCase();
  const tagLower = img.tag.toLowerCase();

  if (titleLower.includes(fullQuery)) score += 35;
  if (descLower.includes(fullQuery)) score += 15;

  tokens.forEach(t => {
    if (t.length < 2) return;
    if (img.category === t) score += 20;
    if (img.keywords.some(k => k === t || k.includes(t))) score += 25;
    if (titleLower.includes(t)) score += 12;
    if (tagLower.includes(t)) score += 10;
    if (descLower.includes(t)) score += 6;
  });

  return score;
}

// ── IMAGE PREVIEW LIGHTBOX HELPER ──
function openImagePreviewModal(title, source, res, iconOrTag, desc, link, imgSrc) {
  const modalId = 'browser-image-preview-modal';
  let modal = document.getElementById(modalId);
  if (!modal) {
    modal = document.createElement('div');
    modal.id = modalId;
    modal.style.cssText = `
      position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 100050;
      display: flex; align-items: center; justify-content: center; padding: 20px;
      backdrop-filter: blur(4px);
    `;
    document.body.appendChild(modal);
  }

  // Determine actual image source
  let resolvedImg = imgSrc;
  if (!resolvedImg && iconOrTag && (iconOrTag.includes('.png') || iconOrTag.includes('assets/'))) {
    resolvedImg = iconOrTag;
  }

  // Backdrop click closes modal
  modal.onclick = (e) => {
    if (e.target === modal) modal.remove();
  };

  // Escape key closes modal
  const handleEsc = (e) => {
    if (e.key === 'Escape') {
      const m = document.getElementById(modalId);
      if (m) m.remove();
      document.removeEventListener('keydown', handleEsc);
    }
  };
  document.addEventListener('keydown', handleEsc);

  modal.innerHTML = `
    <div style="background:#ffffff;border-radius:14px;max-width:860px;width:100%;max-height:92vh;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 24px 50px rgba(0,0,0,0.6);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
      <div style="background:#0f172a;color:#ffffff;padding:14px 20px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,0.1);">
        <div style="display:flex;align-items:center;gap:10px;">
          <span style="font-size:18px;">🖼️</span>
          <strong style="font-size:14.5px;letter-spacing:0.2px;">Google Images — Intelligence Inspection</strong>
        </div>
        <button onclick="document.getElementById('${modalId}').remove()" style="background:transparent;border:none;color:#94a3b8;font-size:20px;cursor:pointer;padding:2px 8px;border-radius:4px;transition:color 0.15s;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#94a3b8'" title="Close">✕</button>
      </div>

      <div style="background:#020617;padding:12px;display:flex;align-items:center;justify-content:center;max-height:55vh;min-height:220px;overflow:hidden;position:relative;">
        ${resolvedImg ? `
          <img src="${resolvedImg}" alt="${escapeHtml(title)}" style="max-height:53vh;max-width:100%;object-fit:contain;border-radius:6px;box-shadow:0 6px 20px rgba(0,0,0,0.5);" />
        ` : `
          <div style="font-size:64px;color:#fff;">${iconOrTag || '🛡️'}</div>
        `}
      </div>

      <div style="padding:18px 22px;background:#ffffff;overflow-y:auto;display:flex;flex-direction:column;gap:10px;">
        <div>
          <div style="font-size:16px;font-weight:700;color:#0f172a;line-height:1.35;">${escapeHtml(title)}</div>
          <div style="margin-top:6px;font-size:12px;color:#64748b;display:flex;gap:14px;flex-wrap:wrap;">
            <span>Resolution: <strong style="color:#0f172a;">${res || '1672 × 941'}</strong></span>
            <span>Source: <strong style="color:#0f172a;">${source || 'cisa.gov'}</strong></span>
            <span>Format: <strong style="color:#0284c7;">PNG Infographic</strong></span>
          </div>
        </div>
        <p style="font-size:13px;line-height:1.55;color:#475569;margin:2px 0 10px;">${desc || 'Official visual diagram illustrating cybersecurity threat vectors, defensive indicators, and red-flag identification techniques.'}</p>
        <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:auto;padding-top:10px;border-top:1px solid #f1f5f9;">
          <button onclick="document.getElementById('${modalId}').remove()" style="padding:8px 18px;background:#f1f5f9;border:1px solid #cbd5e1;border-radius:6px;font-size:12.5px;font-weight:600;cursor:pointer;color:#475569;transition:all 0.15s;" onmouseover="this.style.background='#e2e8f0'" onmouseout="this.style.background='#f1f5f9'">Close</button>
          <button onclick="document.getElementById('${modalId}').remove(); browserGo('${link || 'https://www.cisa.gov/secure-our-world/recognize-and-report-phishing'}');" style="padding:8px 20px;background:#1a73e8;border:none;border-radius:6px;font-size:12.5px;font-weight:700;color:#ffffff;cursor:pointer;transition:all 0.15s;" onmouseover="this.style.background='#1557b0'" onmouseout="this.style.background='#1a73e8'">Visit Website ➔</button>
        </div>
      </div>
    </div>
  `;
}
window.openImagePreviewModal = openImagePreviewModal;
window.BROWSER_IMAGE_DATABASE = BROWSER_IMAGE_DATABASE;
window.getFilteredBrowserImages = getFilteredBrowserImages;

// ── VIDEO PLAY HELPER ──
function playGoogleVideoDemo(title, channel, duration, link) {
  if (typeof showToast === 'function') {
    showToast(`▶️ Playing: "${title}" (${duration})`, 'info');
  }
  setTimeout(() => {
    browserGo(link || 'https://www.cisa.gov/secure-our-world/recognize-and-report-phishing');
  }, 400);
}
window.playGoogleVideoDemo = playGoogleVideoDemo;

// ── AUTHENTIC WIKIPEDIA & ENTERPRISE PORTALS ──
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

  // 1. Wikipedia Article
  if (/(^|\.)wikipedia\.org$/i.test(hostname)) {
    const slug = decodeURIComponent((pathname.split('/wiki/')[1] || 'Phishing').replace(/_/g, ' '));
    const title = slug || 'Phishing';
    return `
      <div class="wikisite">
        <div class="wikisite-header">
          <div class="wikisite-brand" onclick="browserGo('https://en.wikipedia.org/wiki/Phishing')">
            <span class="wikisite-logo">📖</span>
            <div>
              <div class="wikisite-wordmark">WIKIPEDIA</div>
              <div class="wikisite-tag">The Free Encyclopedia</div>
            </div>
          </div>
          <div class="wikisite-actions">
            <a href="#" onclick="browserGoHome(); return false;">Article</a>
            <a href="#" onclick="showToast('Discussion page archived.', 'info'); return false;">Talk</a>
            <a href="#" onclick="showToast('Viewing full edit history.', 'info'); return false;">View history</a>
            <button class="google-btn" style="padding:4px 10px;font-size:12px;" onclick="browserGoHome()">🏠 Return Home</button>
          </div>
        </div>

        <div class="wikisite-body">
          <div class="wikisite-title-row">
            <h1>${escapeHtml(title)}</h1>
            <span class="wikisite-lang-badge">🌐 48 languages</span>
          </div>
          <p class="wikisite-sub">From Wikipedia, the free encyclopedia</p>

          <div class="wikisite-layout">
            <div class="wikisite-main">
              <p>
                <strong>${escapeHtml(title)}</strong> is a form of social engineering and cyberattack whereby an attacker masquerades as a trusted entity in an electronic communication, typically an email, SMS message (<em>smishing</em>), or phone call (<em>vishing</em>)<sup>[1]</sup>. The goal is to deceive victims into handing over sensitive information such as usernames, passwords, credit card numbers, or cryptographic keys, or to facilitate malware downloads.
              </p>

              <div class="wikisite-toc">
                <div class="wikisite-toc-title">Contents</div>
                <ul>
                  <li><a href="#wiki-history">1. History &amp; Origin</a></li>
                  <li><a href="#wiki-techniques">2. Modern Attack Techniques</a>
                    <ul>
                      <li><a href="#wiki-typo">2.1 Typosquatting &amp; Look-Alike Domains</a></li>
                      <li><a href="#wiki-spear">2.2 Spear Phishing &amp; Whaling</a></li>
                    </ul>
                  </li>
                  <li><a href="#wiki-countermeasures">3. Technical Countermeasures</a></li>
                  <li><a href="#wiki-references">4. References &amp; Official Agencies</a></li>
                </ul>
              </div>

              <h2 class="wikisite-section-heading" id="wiki-history">1. History &amp; Origin</h2>
              <p>
                The earliest recorded occurrence of the term "phishing" traces back to 1996, when hacker groups on America Online (AOL) created automated script bots to harvest user account credentials by impersonating AOL customer service representatives<sup>[2]</sup>. As electronic commerce and online banking proliferated in the 2000s, financial institutions became the primary targets.
              </p>

              <h2 class="wikisite-section-heading" id="wiki-techniques">2. Modern Attack Techniques</h2>
              <p id="wiki-typo">
                <strong>Typosquatting:</strong> Adversaries register domain names that are visually identical or slight misspellings of popular legitimate services. For example, replacing the lowercase letter "l" with the numerical digit "1" (e.g. <code>paypa1.com</code> instead of <code>paypal.com</code>) or substituting characters with homoglyphs. Victims visiting these domains encounter counterfeit authentication portals designed to capture keystrokes.
              </p>
              <p id="wiki-spear">
                <strong>Spear Phishing:</strong> Unlike generic mass-market spam, spear phishing attacks involve targeted intelligence gathering on specific employees within an organization. Attackers craft messages referencing internal project codes, upcoming payroll disbursements, or impersonating IT helpdesk personnel.
              </p>

              <h2 class="wikisite-section-heading" id="wiki-countermeasures">3. Technical Countermeasures</h2>
              <p>
                Effective organizational defense incorporates multi-layered security controls:
              </p>
              <ul style="padding-left:22px;line-height:1.7;font-size:14px;color:#202122;">
                <li><strong>Domain Scrutiny:</strong> Inspecting the full URL and verified TLS certificate subject in the browser omnibox before submitting credentials.</li>
                <li><strong>Multi-Factor Authentication (MFA):</strong> Enforcing FIDO2/WebAuthn hardware keys to render stolen passwords useless.</li>
                <li><strong>Email Authentication:</strong> Enforcing Sender Policy Framework (SPF), DomainKeys Identified Mail (DKIM), and DMARC policies.</li>
                <li><strong>Workplace Training:</strong> Interactive flagging drills, such as the detective simulations in CyberZER0, to develop employee vigilance.</li>
              </ul>

              <h2 class="wikisite-section-heading" id="wiki-references">4. References &amp; Official Agencies</h2>
              <ol style="padding-left:22px;line-height:1.7;font-size:12.5px;color:#54595d;">
                <li>Cybersecurity and Infrastructure Security Agency (CISA). "Recognize and Report Phishing". <em>Secure Our World</em>. <a href="#" onclick="browserGo('https://www.cisa.gov/secure-our-world/recognize-and-report-phishing'); return false;">cisa.gov</a></li>
                <li>Federal Trade Commission (FTC). "How to Recognize and Avoid Phishing Scams". <em>Consumer Advice</em>. <a href="#" onclick="browserGo('https://www.consumer.ftc.gov/articles/how-recognize-phishing'); return false;">consumer.ftc.gov</a></li>
                <li>Internet Crime Complaint Center (IC3). "2025 Annual Cybercrime Report: Phishing &amp; Business Email Compromise". FBI.</li>
              </ol>
            </div>

            <div class="wikisite-infobox">
              <div class="wikisite-infobox-title">Phishing</div>
              <div class="wikisite-infobox-image">🎣</div>
              <table class="wikisite-infobox-table">
                <tr>
                  <th>Type</th>
                  <td>Social engineering, Cybercrime</td>
                </tr>
                <tr>
                  <th>Attack vectors</th>
                  <td>Email, SMS, Voice, QR Codes</td>
                </tr>
                <tr>
                  <th>Key targets</th>
                  <td>Credentials, Banking PINs, Session cookies</td>
                </tr>
                <tr>
                  <th>First recorded</th>
                  <td>1996 (AOL Crackers)</td>
                </tr>
                <tr>
                  <th>Key indicator</th>
                  <td>Typosquatting (e.g. <code>paypa1.com</code>)</td>
                </tr>
                <tr>
                  <th>Countermeasures</th>
                  <td>MFA, Flag mode in Zmail, Domain scrutiny</td>
                </tr>
                <tr>
                  <th>Agency</th>
                  <td><a href="#" onclick="browserGo('https://www.cisa.gov'); return false;">CISA (DHS)</a></td>
                </tr>
              </table>
              <div style="margin-top:14px;padding-top:10px;border-top:1px solid #eaecf0;text-align:center;">
                <button class="google-btn" style="width:100%;font-size:12px;padding:6px;" onclick="browserGo('https://www.cisa.gov/secure-our-world/recognize-and-report-phishing')">Explore CISA Guide ➔</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // 2. Enterprise Single Sign-On Portal / Generic Corporate Site
  const displayHost = hostname.replace(/^www\./i, '');
  const siteName = (displayHost.split('.')[0] || 'Enterprise').replace(/[-_]/g, ' ');
  const capitalized = siteName.charAt(0).toUpperCase() + siteName.slice(1);

  return `
    <div class="genericsite">
      <div class="genericsite-header">
        <div class="genericsite-header-left">
          <div class="genericsite-logo">${escapeHtml(capitalized.charAt(0))}</div>
          <div>
            <div class="genericsite-name">${escapeHtml(capitalized)} Corporate Portal</div>
            <div style="font-size:11.5px;color:#94a3b8;">Authenticated Workforce Gateway</div>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:14px;">
          <span class="genericsite-status-pill">🟢 SSO Operational</span>
          <nav class="genericsite-nav">
            <a href="#" onclick="browserGoHome()">Search</a>
            <a href="#" onclick="browserGo('https://www.cisa.gov/topics/malware')">Threat Intel</a>
            <a href="#" onclick="browserGo('https://www.cisa.gov/secure-our-world/recognize-and-report-phishing')">Security Hub</a>
          </nav>
        </div>
      </div>

      <div class="genericsite-body">
        <div class="genericsite-dashboard">
          <div>
            <div class="genericsite-card">
              <h3>Workplace Security Protocol Notice</h3>
              <p>You have navigated to <strong>${escapeHtml(displayHost)}</strong>. This website is operating under active corporate cybersecurity surveillance.</p>
              <div style="background:#f0fdf4;border-left:4px solid #16a34a;padding:12px 16px;border-radius:0 8px 8px 0;margin:14px 0;font-size:13.5px;color:#166534;">
                <strong>🛡️ Cyber Defense Reminder:</strong> Internal IT will never send emergency emails demanding instant password entry on external domains. Always verify the address bar.
              </div>
              <p style="font-size:13px;color:#64748b;margin:0;">Current session: <strong>alex.intern@cyberzer0.local</strong> (Security Detective Clearance)</p>
            </div>

            <div class="genericsite-card">
              <h3>Mandatory Cybersecurity Training Links</h3>
              <p>Employees are required to review the following official guidelines to identify spear-phishing attacks:</p>
              <div class="genericsite-quick-links">
                <a href="#" onclick="browserGo('https://www.cisa.gov/secure-our-world/recognize-and-report-phishing'); return false;">
                  <span>🛡️</span> CISA Secure Our World: 4 Red Flags of Phishing
                </a>
                <a href="#" onclick="browserGo('https://www.cisa.gov/topics/malware'); return false;">
                  <span>🦠</span> CISA Malware Threat Intelligence &amp; Trojan Defense
                </a>
                <a href="#" onclick="browserGo('https://www.consumer.ftc.gov/articles/how-recognize-phishing'); return false;">
                  <span>🎣</span> Federal Trade Commission Phishing Prevention Guidelines
                </a>
              </div>
            </div>
          </div>

          <div>
            <div class="genericsite-card">
              <h3>Quick Diagnostic</h3>
              <div style="font-size:13px;line-height:1.6;color:#475569;">
                <p><strong>Host:</strong> ${escapeHtml(displayHost)}</p>
                <p><strong>TLS Status:</strong> Secure Connection (TLS 1.3)</p>
                <p><strong>Certificate Authority:</strong> DigiCert Global Root G2</p>
                <p><strong>Flag Mode:</strong> Active in Zmail</p>
              </div>
              <div style="margin-top:14px;">
                <button class="google-btn" style="width:100%;" onclick="browserGoHome()">🏠 Return to Google Search</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ── COMPREHENSIVE GOOGLE SEARCH RESULTS WITH ALL / IMAGES / NEWS / VIDEOS TABS ──
function renderGoogleResults(query, activeTab = 'all') {
  const cleanQ = (query || 'phishing').trim();
  const q = escapeHtml(cleanQ);
  const qLower = cleanQ.toLowerCase();
  const currentTab = (activeTab || 'all').toLowerCase();

  // Header and Tabs Strip
  const headerHtml = `
    <div class="gresults-header">
      <div class="gresults-logo" onclick="browserGoHome()" title="Google Home">
        <span class="gl-blue">G</span><span class="gl-red">o</span><span class="gl-yellow">o</span><span class="gl-blue">g</span><span class="gl-green">l</span><span class="gl-red">e</span>
      </div>
      <div class="gresults-search-form">
        <div class="gresults-input-wrap">
          <input type="text" class="gresults-search-input" id="gresults-search-input" value="${q}" placeholder="Search Google or enter query..." onkeydown="if(event.key==='Enter'){ switchGoogleSearchTab('${currentTab}', this.value); }" oninput="handleResultsSearchInput(this)" />
          <button type="button" class="gresults-clear-btn" id="gresults-clear-btn" style="display:${cleanQ ? 'inline-flex' : 'none'};" onclick="clearResultsSearch()" title="Clear">✕</button>
        </div>
        <button type="button" class="gresults-search-btn" onclick="const i=document.getElementById('gresults-search-input'); switchGoogleSearchTab('${currentTab}', i ? i.value : '${escapeHtml(cleanQ)}');">Search</button>
      </div>
    </div>

    <div class="gsearch-tabs-strip">
      <button type="button" class="gsearch-tab ${currentTab === 'all' ? 'active' : ''}" onclick="switchGoogleSearchTab('all', '${escapeHtml(cleanQ)}')">
        <span class="gtab-icon">🔍</span> All
      </button>
      <button type="button" class="gsearch-tab ${currentTab === 'images' ? 'active' : ''}" onclick="switchGoogleSearchTab('images', '${escapeHtml(cleanQ)}')">
        <span class="gtab-icon">🖼️</span> Images
      </button>
      <button type="button" class="gsearch-tab ${currentTab === 'news' ? 'active' : ''}" onclick="switchGoogleSearchTab('news', '${escapeHtml(cleanQ)}')">
        <span class="gtab-icon">📰</span> News
      </button>
      <button type="button" class="gsearch-tab ${currentTab === 'videos' ? 'active' : ''}" onclick="switchGoogleSearchTab('videos', '${escapeHtml(cleanQ)}')">
        <span class="gtab-icon">▶️</span> Videos
      </button>
    </div>
  `;

  // ──────────────────────────────────────────────────────────
  // 1. IMAGES TAB
  // ──────────────────────────────────────────────────────────
  if (currentTab === 'images') {
    const images = getFilteredBrowserImages(cleanQ);

    const isPhishingQuery = /phish|email|vishing|smishing|quishing|social(\s+engineering)?|bait|spoof/i.test(cleanQ);
    const isMalwareQuery = /malware|virus|trojan|worm|ransomware|spyware|adware|botnet|rootkit|keylogger|dropper/i.test(cleanQ);

    let chips = [];
    if (isPhishingQuery && !isMalwareQuery) {
      chips = [
        { label: 'All Phishing', q: 'phishing', active: (cleanQ === 'phishing') },
        { label: 'Red Flags', q: 'phishing red flags', active: cleanQ.includes('red flag') },
        { label: 'Social Media', q: 'phishing facebook social media', active: cleanQ.includes('facebook') || cleanQ.includes('social') },
        { label: 'Vishing & Smishing', q: 'vishing smishing phone phishing', active: cleanQ.includes('vishing') || cleanQ.includes('smishing') },
        { label: 'Quishing (QR)', q: 'quishing qr code phishing', active: cleanQ.includes('quishing') || cleanQ.includes('qr') },
        { label: 'Switch to Malware', q: 'malware', active: false }
      ];
    } else if (isMalwareQuery && !isPhishingQuery) {
      chips = [
        { label: 'All Malware', q: 'malware', active: (cleanQ === 'malware') },
        { label: 'Types of Malware', q: 'types of malware classifications', active: cleanQ.includes('types') },
        { label: 'Trojans & Viruses', q: 'malware trojan virus dropper', active: cleanQ.includes('trojan') || cleanQ.includes('virus') },
        { label: 'Infection Signs', q: 'signs of malware infection symptoms', active: cleanQ.includes('signs') || cleanQ.includes('symptoms') },
        { label: 'Prevention & Defense', q: 'malware protection prevention best practices', active: cleanQ.includes('protect') || cleanQ.includes('prevent') },
        { label: 'Switch to Phishing', q: 'phishing', active: false }
      ];
    } else {
      chips = [
        { label: 'All Infographics', q: 'cybersecurity', active: true },
        { label: 'Phishing', q: 'phishing', active: false },
        { label: 'Malware', q: 'malware', active: false },
        { label: 'Red Flags', q: 'red flags phishing', active: false },
        { label: 'Ransomware', q: 'ransomware malware', active: false },
        { label: 'Vishing & Voice', q: 'vishing phone phishing', active: false },
        { label: 'Protection & Defense', q: 'malware protection prevention', active: false }
      ];
    }

    const chipsHtml = `
      <div class="gimages-filter-chips">
        ${chips.map(c => `
          <button type="button" class="gfilter-chip ${c.active ? 'active' : ''}" onclick="switchGoogleSearchTab('images', '${escapeHtml(c.q)}')">
            ${escapeHtml(c.label)}
          </button>
        `).join('')}
      </div>
    `;

    const cardsHtml = images.map(img => `
      <div class="gimage-card" onclick="openImagePreviewModal('${escapeHtml(img.title)}', '${img.source}', '${img.res}', '${escapeHtml(img.tag)}', '${escapeHtml(img.desc)}', '${img.link}', '${encodeURI(img.src)}')">
        <div class="gimage-thumb-box">
          <img src="${encodeURI(img.src)}" alt="${escapeHtml(img.title)}" class="gimage-thumb-img" loading="lazy" />
          <span class="gimage-tag-badge">${escapeHtml(img.tag)}</span>
          <span class="gimage-res-badge">${img.res}</span>
        </div>
        <div class="gimage-info">
          <div class="gimage-title" title="${escapeHtml(img.title)}">${escapeHtml(img.title)}</div>
          <div class="gimage-source-row">
            <span class="gimage-source">${img.source}</span>
            <span class="gimage-click-hint">Click to inspect ➔</span>
          </div>
        </div>
      </div>
    `).join('');

    const statsText = images.length > 0
      ? `Showing ${images.length} visual cyber intelligence results for "${q}"`
      : `No direct image matches found for "${q}". Showing essential cyber threat diagrams:`;

    return `
      <div class="gresults">
        ${headerHtml}
        <div class="gresults-inner">
          ${chipsHtml}
          <div class="gresults-stats">${statsText}</div>
          <div class="gimages-grid">
            ${cardsHtml}
          </div>
        </div>
      </div>
    `;
  }

  // ──────────────────────────────────────────────────────────
  // 2. NEWS TAB
  // ──────────────────────────────────────────────────────────
  if (currentTab === 'news') {
    const newsArticles = [
      {
        publisher: 'CISA Cyber Defense Alerts',
        logo: '🛡️',
        time: '2 hours ago',
        title: 'CISA & FBI Issue Advisory on Emerging AI-Crafted Spear Phishing Campaigns',
        desc: "America's Cyber Defense Agency warns organizations of threat actors leveraging large language models to construct hyper-personalized workplace pretexts mimicking internal corporate communications.",
        link: 'https://www.cisa.gov/secure-our-world/recognize-and-report-phishing',
        thumbBg: 'background:linear-gradient(135deg,#0c2340,#173866);',
        thumbIcon: '🛡️'
      },
      {
        publisher: 'ThreatWatch Cyber Weekly',
        logo: '📡',
        time: '5 hours ago',
        title: 'Global Incident Telemetry: Over 85% of Workplace Breaches Initiated via Email Links',
        desc: 'New enterprise telemetry confirms lookalike typosquatted domains and fake IT verification portals remain the highest-yield attack vectors against corporate employees and new interns.',
        link: 'https://www.cisa.gov/topics/malware',
        thumbBg: 'background:linear-gradient(135deg,#7f1d1d,#991b1b);',
        thumbIcon: '🚨'
      },
      {
        publisher: 'Wired InfoSec Dispatch',
        logo: '⚡',
        time: '18 hours ago',
        title: 'New Trojan Dropper Masquerading as Office Productivity Utility Discovered in the Wild',
        desc: 'Researchers have analyzed an executable dropper named "SystemOptimizer.exe" distributed through online forums that installs hidden keyloggers and credential harvesters.',
        link: 'https://www.cisa.gov/topics/malware#trojans',
        thumbBg: 'background:linear-gradient(135deg,#451a03,#b45309);',
        thumbIcon: '🦠'
      },
      {
        publisher: 'FTC Consumer Protection Bureau',
        logo: '🏛️',
        time: '1 day ago',
        title: 'FTC Unveils "Spot the Red Flags Before You Click" Public Cyber Education Blitz',
        desc: 'A nationwide campaign provides hands-on interactive exercises to help employees flag spoofed sender addresses, high-pressure deadlines, and deceptive prize disbursements.',
        link: 'https://www.consumer.ftc.gov/articles/how-recognize-phishing',
        thumbBg: 'background:linear-gradient(135deg,#1e3a8a,#2563eb);',
        thumbIcon: '🎣'
      },
      {
        publisher: 'SANS CyberCast Review',
        logo: '🔒',
        time: '2 days ago',
        title: 'Why Scrutinizing Domain Characters Remains the Top Defense Against Credential Theft',
        desc: 'Security researchers illustrate why careful inspection of domain spelling (such as detecting paypa1.com with digit 1) combined with MFA neutralizes credential theft campaigns.',
        link: 'https://www.cisa.gov/secure-our-world/recognize-and-report-phishing',
        thumbBg: 'background:linear-gradient(135deg,#052e16,#16a34a);',
        thumbIcon: '🔍'
      },
      {
        publisher: 'BleepingComputer',
        logo: '💻',
        time: '3 days ago',
        title: 'Ransomware Gangs Target Unpatched Endpoints: Why Immutable Cold Backups are Vital',
        desc: 'Detailed retrospective on incident containment illustrates why offline data isolation and rapid employee reporting prevent operational catastrophes during ransomware incursions.',
        link: 'https://www.cisa.gov/topics/malware#ransomware',
        thumbBg: 'background:linear-gradient(135deg,#2e1065,#7e22ce);',
        thumbIcon: '💾'
      }
    ];

    const newsCardsHtml = newsArticles.map(art => `
      <div class="gnews-card" onclick="browserGo('${art.link}')">
        <div class="gnews-content">
          <div class="gnews-source-row">
            <span class="gnews-source-logo">${art.logo}</span>
            <span class="gnews-source-name">${art.publisher}</span>
            <span>•</span>
            <span class="gnews-time">${art.time}</span>
          </div>
          <div class="gnews-title">${escapeHtml(art.title)}</div>
          <div class="gnews-desc">${escapeHtml(art.desc)}</div>
        </div>
        <div class="gnews-thumb" style="${art.thumbBg}">
          ${art.thumbIcon}
        </div>
      </div>
    `).join('');

    return `
      <div class="gresults">
        ${headerHtml}
        <div class="gresults-inner">
          <div class="gresults-stats">Latest cybersecurity advisories and intelligence reports for "${q}"</div>
          <div class="gnews-stream">
            ${newsCardsHtml}
          </div>
        </div>
      </div>
    `;
  }

  // ──────────────────────────────────────────────────────────
  // 3. VIDEOS TAB
  // ──────────────────────────────────────────────────────────
  if (currentTab === 'videos') {
    const videoItems = [
      {
        title: 'How Phishing Actually Works: Live Red Team Simulation & Email Breakdown',
        channel: 'CISA Cyber Defense',
        views: '542K views',
        time: '2 weeks ago',
        duration: '12:45',
        desc: 'Watch cyber defense specialists analyze live phishing samples, deconstruct deceptive sender addresses, and demonstrate the exact mechanics of credential harvesting.',
        thumbBg: 'background:linear-gradient(135deg,#0c2340,#1e3a8a);',
        thumbIcon: '🛡️',
        link: 'https://www.cisa.gov/secure-our-world/recognize-and-report-phishing'
      },
      {
        title: 'Spotting Typosquatting and Spoofed Sender Domains in Under 5 Minutes',
        channel: 'CyberZER0 Academy',
        views: '230K views',
        time: '3 weeks ago',
        duration: '05:18',
        desc: 'Master the quick visual inspection techniques needed to identify lookalike letters, numbers masquerading as characters, and unauthorized domain extensions in your inbox.',
        thumbBg: 'background:linear-gradient(135deg,#7f1d1d,#b91c1c);',
        thumbIcon: '🔍',
        link: 'https://www.cisa.gov/secure-our-world/recognize-and-report-phishing'
      },
      {
        title: 'Malware Analysis 101: Understanding Trojans, Worms, Spyware & Ransomware',
        channel: 'SANS Threat Series',
        views: '890K views',
        time: '1 month ago',
        duration: '18:30',
        desc: 'From deceptive trojan droppers to cryptographic lockouts: learn how malicious code executes on Windows systems and how endpoint defenses isolate threats.',
        thumbBg: 'background:linear-gradient(135deg,#451a03,#d97706);',
        thumbIcon: '🦠',
        link: 'https://www.cisa.gov/topics/malware'
      },
      {
        title: 'The Psychology of Social Engineering: Why Urgency Trumps Logic',
        channel: 'Infosec Institute',
        views: '145K views',
        time: '1 month ago',
        duration: '09:12',
        desc: 'An exploration into psychological pretexts: how urgency, authority impersonation, and scarcity are weaponized by adversaries to cause panic clicks.',
        thumbBg: 'background:linear-gradient(135deg,#2e1065,#9333ea);',
        thumbIcon: '🧠',
        link: 'https://www.consumer.ftc.gov/articles/how-recognize-phishing'
      },
      {
        title: 'Secure Our World: 4 Universal Pillars for Enterprise & Home Digital Safety',
        channel: 'CISA Official',
        views: '1.2M views',
        time: '2 months ago',
        duration: '07:40',
        desc: "America's Cyber Defense Agency walks through the four key cyber hygiene habits: strong passwords, MFA, recognizing phishing, and updating software regularly.",
        thumbBg: 'background:linear-gradient(135deg,#052e16,#15803d);',
        thumbIcon: '🌟',
        link: 'https://www.cisa.gov/secure-our-world'
      }
    ];

    const videoCardsHtml = videoItems.map(vid => `
      <div class="gvideo-card" onclick="playGoogleVideoDemo('${escapeHtml(vid.title)}', '${escapeHtml(vid.channel)}', '${vid.duration}', '${vid.link}')">
        <div class="gvideo-thumb-wrap" style="${vid.thumbBg}">
          <div class="gvideo-play-btn">▶</div>
          <span class="gvideo-duration">${vid.duration}</span>
        </div>
        <div class="gvideo-info">
          <div class="gvideo-title">${escapeHtml(vid.title)}</div>
          <div class="gvideo-channel-row">
            <span class="gvideo-channel-name">${escapeHtml(vid.channel)}</span>
            <span class="gvideo-verified">✔</span>
            <span>•</span>
            <span class="gvideo-views-time">${vid.views} • ${vid.time}</span>
          </div>
          <div class="gvideo-desc">${escapeHtml(vid.desc)}</div>
        </div>
      </div>
    `).join('');

    return `
      <div class="gresults">
        ${headerHtml}
        <div class="gresults-inner">
          <div class="gresults-stats">Cybersecurity awareness video briefings and simulations for "${q}"</div>
          <div class="gvideos-stream">
            ${videoCardsHtml}
          </div>
        </div>
      </div>
    `;
  }

  // ──────────────────────────────────────────────────────────
  // 4. "ALL" SEARCH TAB (Comprehensive Search Results)
  // ──────────────────────────────────────────────────────────
  let mockResults = [];
  let isPhishingTopic = /phish|phising|pisihing|email|scam|spoof|social-?engineering|fake login/i.test(qLower);
  let isMalwareTopic = /malware|trojan|virus|spyware|worm|download/i.test(qLower);
  let isRansomwareTopic = /ransomware|encrypt|decrypt|ransom/i.test(qLower);
  let isCyberSecurityTopic = /cybersecurity|cyber security|cyber defense|infosec|security/i.test(qLower);

  if (isMalwareTopic) {
    mockResults = [
      {
        url: 'www.cisa.gov › topics › malware-and-ransomware',
        link: 'https://www.cisa.gov/topics/malware',
        title: 'Malware Threat Intelligence & Defense Guide | CISA',
        desc: 'Comprehensive official threat advisory on Trojans, Ransomware, Spyware, Worms, and how adversaries disguise executables (.exe, .scr) as harmless documents.'
      },
      {
        url: 'www.cisa.gov › news-events › news › safe-software-downloads',
        link: 'https://www.cisa.gov/topics/malware#trojans',
        title: 'Trojan Horses: The Danger of "Free Software" Downloads | Cyber Academy',
        desc: 'Learn why downloading free utilities and game tools from online forums leads to Trojan dropper infections and system compromise.'
      },
      {
        url: 'www.consumer.ftc.gov › articles › ransomware-protection',
        link: 'https://www.cisa.gov/topics/malware#ransomware',
        title: 'Ransomware Prevention & Recovery Best Practices | CISA & FTC',
        desc: 'Protecting personal and organizational files from cryptographic ransomware lockouts. Real-world mitigation and cold backup advice.'
      },
      {
        url: 'www.sans.org › resources › glossary › malware',
        link: 'https://www.cisa.gov/topics/malware',
        title: 'Malware Classifications & Threat Categories | SANS Institute',
        desc: 'Authoritative cybersecurity glossary covering all major malware families, attack vectors, and prevention frameworks.'
      }
    ];
  } else if (isPhishingTopic) {
    mockResults = [
      {
        url: 'www.cisa.gov › secure-our-world › recognize-and-report-phishing',
        link: 'https://www.cisa.gov/secure-our-world/recognize-and-report-phishing',
        title: 'Recognize and Report Phishing | CISA (Secure Our World)',
        desc: "Official cyber defense guidance from America's Cyber Defense Agency. Learn how to recognize the 4 red flags of phishing: lookalike domains, artificial urgency, mismatched hyperlinks, and malicious attachments."
      },
      {
        url: 'www.consumer.ftc.gov › articles › how-recognize-phishing',
        link: 'https://www.consumer.ftc.gov/articles/how-recognize-phishing',
        title: 'How to Recognize and Avoid Phishing Scams | Federal Trade Commission',
        desc: 'Learn the 4 tell-tale signs of a phishing email: mismatched sender addresses, artificial urgency, deceptive hyperlinks, and generic greetings.'
      },
      {
        url: 'www.cisa.gov › secure-our-world',
        link: 'https://www.cisa.gov',
        title: 'Secure Our World: 4 Easy Ways to Stay Safe Online | CISA',
        desc: "America's Cyber Defense Agency flagship program: Use strong passwords, enable MFA, recognize & report phishing, and update software."
      },
      {
        url: 'www.ic3.gov › resources › phishing-prevention',
        link: 'https://www.cisa.gov/secure-our-world/recognize-and-report-phishing',
        title: 'Phishing & Email Spoofing Defense | FBI Internet Crime Complaint Center',
        desc: 'Report phishing and email spoofing attacks. FBI guidance on identifying lookalike sender addresses and fake login pages.'
      },
      {
        url: 'en.wikipedia.org › wiki › Phishing',
        link: 'https://en.wikipedia.org/wiki/Phishing',
        title: 'Phishing — Techniques, History and Countermeasures | Wikipedia',
        desc: 'Comprehensive encyclopedia article covering social engineering, typosquatting domains, credential harvesting, and technical email defenses.'
      }
    ];
  } else if (isRansomwareTopic) {
    mockResults = [
      {
        url: 'www.cisa.gov › stopransomware',
        link: 'https://www.cisa.gov/topics/malware#ransomware',
        title: 'Stop Ransomware | CISA',
        desc: 'Official joint advisory on ransomware prevention, detection, and recovery. Includes offline backup strategies and incident response playbooks.'
      },
      {
        url: 'www.consumer.ftc.gov › topics › ransomware-protection',
        link: 'https://www.cisa.gov/topics/malware',
        title: 'Ransomware Protection & Recovery Guide | FTC Consumer Advice',
        desc: 'Step-by-step guidance on protecting files from ransomware encryption and recovering after an attack without paying a ransom.'
      }
    ];
  } else if (isCyberSecurityTopic) {
    mockResults = [
      {
        url: 'www.cisa.gov',
        link: 'https://www.cisa.gov',
        title: 'Cybersecurity & Infrastructure Security Agency (CISA)',
        desc: "America's Cyber Defense Agency — providing resources, advisories, and guidelines to defend national and personal digital infrastructure."
      },
      {
        url: 'www.consumer.ftc.gov › privacy-identity-online-security',
        link: 'https://www.consumer.ftc.gov/articles/how-recognize-phishing',
        title: 'Online Security & Identity Protection Tips | FTC',
        desc: 'Expert advice on cybersecurity hygiene, password safety, phishing awareness, and protecting your digital identity online.'
      },
      {
        url: 'en.wikipedia.org › wiki › Computer_security',
        link: 'https://en.wikipedia.org/wiki/Computer_security',
        title: 'Computer security & Cyber Defense Systems | Wikipedia',
        desc: 'Protection of computer systems and networks from attacks by malicious actors that may result in unauthorized information disclosure.'
      }
    ];
  } else {
    // Unknown query — show Google no-results page
    return `
      <div class="gresults">
        ${headerHtml}
        <div class="gresults-inner">
          <div class="google-noresult-container">
            <div class="google-noresult-icon">🔍</div>
            <div class="google-noresult-heading">Your search — <em>${q}</em> — did not match any documents.</div>
            <div class="google-noresult-suggestions">
              <p>Suggestions:</p>
              <ul>
                <li>Make sure that all words are spelled correctly.</li>
                <li>Try different keywords.</li>
                <li>Try more general cybersecurity keywords.</li>
              </ul>
            </div>
            <div class="google-noresult-tips">
              💡 <strong>Detective Training Tip:</strong> This simulated browser is loaded with real cybersecurity defense curricula. Try exploring:
              <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;">
                <button class="google-btn" onclick="browserGo('https://www.google.com/search?q=phishing')">🎣 Phishing</button>
                <button class="google-btn" onclick="browserGo('https://www.google.com/search?q=malware')">🦠 Malware</button>
                <button class="google-btn" onclick="browserGo('https://www.google.com/search?q=ransomware')">🔒 Ransomware</button>
                <button class="google-btn" onclick="switchGoogleSearchTab('images', 'phishing')">🖼️ View Images</button>
                <button class="google-btn" onclick="switchGoogleSearchTab('news', 'cybersecurity')">📰 Cyber News</button>
              </div>
            </div>
          </div>
        </div>
      </div>`;
  }

  // Feature Snippet / Knowledge Alert
  let featureSnippetHtml = '';
  if (isPhishingTopic) {
    featureSnippetHtml = `
      <div class="gfeature-snippet">
        <div class="gfeature-badge"><span>🛡️ Official Cyber Alert</span> • CISA Secure Our World</div>
        <div class="gfeature-title">The 4 Core Red Flags of Phishing Attacks</div>
        <p class="gfeature-text">Over 90% of organizational cyber breaches originate with a deceptive email. Scrutinize incoming messages for these four telltale warning signs:</p>
        <ul class="gfeature-list">
          <li><strong>1. Suspicious Senders &amp; Typosquatting:</strong> Look for lookalike domains (e.g. <code>paypa1.com</code> with digit 1 instead of letter l) or mismatched addresses.</li>
          <li><strong>2. Manufactured Urgency:</strong> Threats of account suspension or claims of ₱1,000,000 lottery prizes designed to induce panic.</li>
          <li><strong>3. Deceptive Hyperlinks:</strong> Visible text that looks legitimate but hover reveals an untrusted external server.</li>
          <li><strong>4. Dangerous Attachments:</strong> Executables disguised as invoices (.exe, .scr, .zip).</li>
        </ul>
        <button type="button" class="gfeature-btn" onclick="browserGo('https://www.cisa.gov/secure-our-world/recognize-and-report-phishing')">Read Full CISA Phishing Defense Guide ➔</button>
      </div>
    `;
  } else if (isMalwareTopic) {
    featureSnippetHtml = `
      <div class="gfeature-snippet">
        <div class="gfeature-badge"><span>🦠 Threat Intelligence</span> • CISA &amp; SANS Institute</div>
        <div class="gfeature-title">Malware Classifications &amp; Infection Vectors</div>
        <p class="gfeature-text">Malicious software is engineered to gain unauthorized administrative access, spy on keystrokes, or hold critical files hostage:</p>
        <ul class="gfeature-list">
          <li><strong>Trojans:</strong> Masquerade as free game tools or productivity utilities while secretly installing persistent backdoors.</li>
          <li><strong>Ransomware:</strong> Cryptographically locks personal and organizational files to extort payment.</li>
          <li><strong>Spyware &amp; Keyloggers:</strong> Silently monitors browser logins and clipboard tokens.</li>
          <li><strong>Worms:</strong> Self-replicating threats that propagate across networks without user action.</li>
        </ul>
        <button type="button" class="gfeature-btn" onclick="browserGo('https://www.cisa.gov/topics/malware')">Explore Malware Encyclopedia &amp; Defense ➔</button>
      </div>
    `;
  }

  // Organic Results
  const itemsHtml = mockResults.map((r, idx) => `
    <div class="gresult-item">
      <div class="gresult-url-wrap">
        <span class="gresult-favicon">🌐</span>
        <span class="gresult-site-name">${r.url.split('›')[0].trim()}</span>
        <span class="gresult-url">${r.url}</span>
      </div>
      <div class="gresult-title" onclick="browserGo('${r.link}')">${escapeHtml(r.title)}</div>
      <div class="gresult-desc">${escapeHtml(r.desc)}</div>
      ${idx === 0 && isPhishingTopic ? `
        <div class="gsitelinks-grid">
          <div class="gsitelink-card">
            <a href="#" onclick="browserGo('https://www.cisa.gov/secure-our-world/recognize-and-report-phishing'); return false;">Inspect Senders &amp; Typosquatting</a>
            <p>Spot letter substitutions like paypa1.com and unverified webmail domains.</p>
          </div>
          <div class="gsitelink-card">
            <a href="#" onclick="browserGo('https://www.cisa.gov/secure-our-world/recognize-and-report-phishing'); return false;">Activate Flag Mode in Zmail</a>
            <p>Tag suspicious headers, body urgency, and URLs to protect the company.</p>
          </div>
          <div class="gsitelink-card">
            <a href="#" onclick="browserGo('https://www.consumer.ftc.gov/articles/how-recognize-phishing'); return false;">Federal Trade Commission Guidelines</a>
            <p>Consumer protections against online lottery fraud and credential harvesting.</p>
          </div>
          <div class="gsitelink-card">
            <a href="#" onclick="switchGoogleSearchTab('images', '${escapeHtml(cleanQ)}'); return false;">Browse Phishing Infographics</a>
            <p>Inspect visual diagrams, red flags checklists, and attack flowcharts.</p>
          </div>
        </div>
      ` : ''}
    </div>
  `).join('');

  // People Also Ask Accordion
  const peopleAskHtml = isPhishingTopic ? `
    <div class="gpeople-ask">
      <div class="gpeople-ask-header">People also ask</div>
      <div class="gask-item">
        <div class="gask-question" onclick="const a=this.nextElementSibling; a.style.display=a.style.display==='none'?'block':'none';">
          <span>How can you tell if an email is a phishing attempt?</span>
          <span>▾</span>
        </div>
        <div class="gask-answer" style="display:none;">
          Check the sender's exact email address (not just display name), look for artificial urgency or threats of account suspension, inspect hyperlink destinations by hovering before clicking, and never download unexpected attachments.
        </div>
      </div>
      <div class="gask-item">
        <div class="gask-question" onclick="const a=this.nextElementSibling; a.style.display=a.style.display==='none'?'block':'none';">
          <span>What is typosquatting and why is it dangerous?</span>
          <span>▾</span>
        </div>
        <div class="gask-answer" style="display:none;">
          Typosquatting is when attackers register lookalike domain names with slight spelling mistakes (e.g., substituting "1" for "l" in <code>paypa1.com</code>). Because the domain looks authentic at a glance, victims unknowingly surrender real credentials on counterfeit login forms.
        </div>
      </div>
      <div class="gask-item">
        <div class="gask-question" onclick="const a=this.nextElementSibling; a.style.display=a.style.display==='none'?'block':'none';">
          <span>What should you do immediately if you entered passwords on a fake website?</span>
          <span>▾</span>
        </div>
        <div class="gask-answer" style="display:none;">
          Immediately change the compromised password from a clean, verified device, notify your organizational IT security department, and enable multi-factor authentication (MFA) on the official account portal.
        </div>
      </div>
    </div>
  ` : '';

  // Related Searches Section
  const relatedSearchesHtml = `
    <div class="grelated-section">
      <div class="grelated-title">Related searches</div>
      <div class="grelated-grid">
        <div class="grelated-chip" onclick="browserGo('https://www.google.com/search?q=cisa recognize and report phishing')">🔍 cisa recognize and report phishing</div>
        <div class="grelated-chip" onclick="browserGo('https://www.google.com/search?q=typosquatting examples')">🔍 typosquatting domain examples</div>
        <div class="grelated-chip" onclick="browserGo('https://www.google.com/search?q=malware trojan dropper defense')">🔍 malware trojan dropper defense</div>
        <div class="grelated-chip" onclick="switchGoogleSearchTab('images', '${escapeHtml(cleanQ)}')">🖼️ ${escapeHtml(cleanQ)} diagrams &amp; infographics</div>
        <div class="grelated-chip" onclick="switchGoogleSearchTab('news', 'cybersecurity')">📰 cyber threat news alerts</div>
        <div class="grelated-chip" onclick="switchGoogleSearchTab('videos', '${escapeHtml(cleanQ)}')">▶️ phishing awareness video briefing</div>
      </div>
    </div>
  `;

  return `
    <div class="gresults">
      ${headerHtml}
      <div class="gresults-inner">
        <div class="gresults-stats">About ${(Math.floor(Math.random()*8)+2)},${Math.floor(Math.random()*800+100)},000 results (0.${Math.floor(Math.random()*6)+2}${Math.floor(Math.random()*9)} seconds)</div>
        ${featureSnippetHtml}
        ${itemsHtml}
        ${peopleAskHtml}
        ${relatedSearchesHtml}
      </div>
    </div>
  `;
}

function returnToGmail() {
  openApp('gmail');
  focusWindow('gmail');
}

// ── INSTAGRAM SIMULATED PROFILE (PIA'S SOCIAL MEDIA) ──
function renderInstagramSite() {
  return `
    <div class="insta-app-wrap" style="background:#090e18;color:#f1f5f9;min-height:100%;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;padding-bottom:40px;">
      <!-- Instagram Header -->
      <header style="position:sticky;top:0;z-index:100;background:rgba(15,23,42,0.95);backdrop-filter:blur(10px);border-bottom:1px solid rgba(255,255,255,0.08);padding:10px 24px;display:flex;align-items:center;justify-content:space-between;">
        <div style="display:flex;align-items:center;gap:10px;cursor:pointer;" onclick="browserGo('https://www.instagram.com/pia.cyber/')">
          <img src="assets/icons/Chapter 3 new apps/instagram.svg" alt="Instagram" style="width:28px;height:28px;">
          <span style="font-size:20px;font-weight:800;letter-spacing:-0.5px;background:linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">Instagram</span>
        </div>
        <div style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:6px 14px;font-size:12.5px;color:#94a3b8;display:flex;align-items:center;gap:8px;width:240px;">
          <span>🔍</span> <span>Search</span>
        </div>
        <div style="display:flex;align-items:center;gap:18px;font-size:18px;">
          <span style="cursor:pointer;" title="Home" onclick="showToast('🏠 Home feed refreshed','info')">🏠</span>
          <span style="cursor:pointer;" title="Direct Messages" onclick="openApp('comms')">💬</span>
          <span style="cursor:pointer;" title="Explore" onclick="showToast('🧭 Explore feed: #cybersecurity #manila','info')">🧭</span>
          <span style="cursor:pointer;" title="Activity" onclick="showToast('❤️ 14 new likes on your posts','info')">❤️</span>
          <img src="assets/Character/Pia.png" alt="Profile" style="width:26px;height:26px;border-radius:50%;object-fit:cover;border:1.5px solid #38bdf8;">
        </div>
      </header>

      <div style="max-width:880px;margin:0 auto;padding:24px 20px;">
        <!-- Cyber Security Warning Banner -->
        <div style="background:linear-gradient(135deg,rgba(234,179,8,0.12),rgba(245,158,11,0.06));border:1px solid rgba(234,179,8,0.3);border-radius:12px;padding:12px 18px;margin-bottom:24px;display:flex;align-items:flex-start;gap:12px;">
          <span style="font-size:22px;flex-shrink:0;">⚠️</span>
          <div style="font-size:12.5px;line-height:1.45;color:#fef08a;">
            <strong style="color:#fbbf24;">Social Engineering Vulnerability Note:</strong>
            Oversharing work locations, routine schedules, and equipment on public profiles provides attackers with Open-Source Intelligence (OSINT) to launch targeted pretexting and identity impersonation.
          </div>
        </div>

        <!-- Profile Header Block -->
        <div style="display:flex;gap:40px;align-items:center;padding-bottom:28px;border-bottom:1px solid rgba(255,255,255,0.08);flex-wrap:wrap;">
          <!-- Avatar with Story Ring -->
          <div style="position:relative;width:120px;height:120px;border-radius:50%;padding:3px;background:linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888);flex-shrink:0;">
            <img src="assets/Character/Pia.png" alt="Pia" style="width:100%;height:100%;border-radius:50%;object-fit:cover;background:#0f172a;border:2px solid #090e18;">
            <div style="position:absolute;bottom:4px;right:4px;background:#22c55e;width:16px;height:16px;border-radius:50%;border:2px solid #090e18;" title="Online"></div>
          </div>

          <!-- Profile Details -->
          <div style="flex:1;min-width:260px;">
            <div style="display:flex;align-items:center;gap:16px;margin-bottom:14px;flex-wrap:wrap;">
              <h2 style="font-size:20px;font-weight:700;margin:0;color:#ffffff;">pia.cyber</h2>
              <span style="background:rgba(56,189,248,0.2);color:#38bdf8;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:700;">Verified Intern</span>
              <button type="button" style="background:#0284c7;color:#fff;border:none;padding:6px 16px;border-radius:6px;font-weight:700;font-size:13px;cursor:pointer;" onclick="showToast('Following @pia.cyber','success')">Following</button>
              <button type="button" style="background:rgba(255,255,255,0.1);color:#fff;border:none;padding:6px 14px;border-radius:6px;font-weight:700;font-size:13px;cursor:pointer;" onclick="openApp('comms')">Message</button>
            </div>

            <!-- Stats -->
            <div style="display:flex;gap:24px;margin-bottom:14px;font-size:14px;">
              <span><strong>6</strong> posts</span>
              <span><strong>3,842</strong> followers</span>
              <span><strong>419</strong> following</span>
            </div>

            <!-- Bio -->
            <div style="font-size:13.5px;line-height:1.5;color:#cbd5e1;">
              <div style="font-weight:700;color:#ffffff;">Pia | Threat Intel Trainee 🔍</div>
              <div>🛡️ Cybersecurity Recruit @ Business Inc.</div>
              <div>☕ Coffee fanatic · Tech & travel enthusiast 📸</div>
              <div>📍 Manila, Philippines · Exploring wireless security</div>
              <a href="#" onclick="showToast('🔗 Corporate directory profile verified','info');return false;" style="color:#38bdf8;text-decoration:none;font-weight:600;">business-inc.example/team/pia</a>
            </div>
          </div>
        </div>

        <!-- Highlights Row -->
        <div style="display:flex;gap:20px;padding:20px 0;overflow-x:auto;">
          <div style="text-align:center;font-size:11.5px;color:#cbd5e1;cursor:pointer;" onclick="showToast('☕ Highlight: Coffee runs & study sessions','info')">
            <div style="width:58px;height:58px;border-radius:50%;background:#1e293b;border:1.5px solid rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:24px;margin:0 auto 6px;">☕</div>
            <span>Café</span>
          </div>
          <div style="text-align:center;font-size:11.5px;color:#cbd5e1;cursor:pointer;" onclick="showToast('💻 Highlight: Security Operations Center','info')">
            <div style="width:58px;height:58px;border-radius:50%;background:#1e293b;border:1.5px solid rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:24px;margin:0 auto 6px;">💻</div>
            <span>Lab</span>
          </div>
          <div style="text-align:center;font-size:11.5px;color:#cbd5e1;cursor:pointer;" onclick="showToast('🎓 Highlight: Security Certifications','info')">
            <div style="width:58px;height:58px;border-radius:50%;background:#1e293b;border:1.5px solid rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:24px;margin:0 auto 6px;">🎓</div>
            <span>Certs</span>
          </div>
          <div style="text-align:center;font-size:11.5px;color:#cbd5e1;cursor:pointer;" onclick="showToast('🌆 Highlight: Manila Tech Scene','info')">
            <div style="width:58px;height:58px;border-radius:50%;background:#1e293b;border:1.5px solid rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:24px;margin:0 auto 6px;">🌆</div>
            <span>Manila</span>
          </div>
          <div style="text-align:center;font-size:11.5px;color:#cbd5e1;cursor:pointer;" onclick="showToast('🛡️ Highlight: Social Engineering Defense','info')">
            <div style="width:58px;height:58px;border-radius:50%;background:#1e293b;border:1.5px solid rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:24px;margin:0 auto 6px;">🛡️</div>
            <span>Defend</span>
          </div>
        </div>

        <!-- Feed Tabs -->
        <div style="border-top:1px solid rgba(255,255,255,0.08);display:flex;justify-content:center;gap:36px;font-size:12.5px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">
          <div style="padding:12px 0;border-top:2px solid #ffffff;color:#ffffff;display:flex;align-items:center;gap:6px;cursor:pointer;">
            <span>▦</span> <span>POSTS</span>
          </div>
          <div style="padding:12px 0;color:#64748b;display:flex;align-items:center;gap:6px;cursor:pointer;" onclick="showToast('Reels section is empty','info')">
            <span>🎬</span> <span>REELS</span>
          </div>
          <div style="padding:12px 0;color:#64748b;display:flex;align-items:center;gap:6px;cursor:pointer;" onclick="showToast('Saved posts are private','info')">
            <span>🔖</span> <span>SAVED</span>
          </div>
          <div style="padding:12px 0;color:#64748b;display:flex;align-items:center;gap:6px;cursor:pointer;" onclick="showToast('No tagged posts yet','info')">
            <span>🏷️</span> <span>TAGGED</span>
          </div>
        </div>

        <!-- Posts Grid (3 Columns) -->
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:16px;">
          <!-- Post 1 (Crucial Chapter 3 Connection: Coffee Shop & Free Wi-Fi) -->
          <div class="insta-post-card" style="background:#111827;border:1px solid rgba(255,255,255,0.08);border-radius:10px;overflow:hidden;cursor:pointer;" onclick="showToast('💡 Threat Insight: Pia tagged her café location and announced using Free Public Wi-Fi — a prime target for Wi-Fi sniffing attacks!','warning')">
            <div style="position:relative;padding-top:100%;background:#1e293b;">
              <img src="assets/background/Coffe shop.png" alt="Coffee Shop" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;">
              <div style="position:absolute;top:8px;right:8px;background:rgba(0,0,0,0.65);padding:2px 7px;border-radius:4px;font-size:10px;color:#facc15;">📍 Location Tag</div>
            </div>
            <div style="padding:10px 12px;font-size:12px;color:#cbd5e1;line-height:1.4;">
              <div style="display:flex;justify-content:space-between;color:#94a3b8;font-size:11px;margin-bottom:4px;">
                <span>❤️ 248 likes</span>
                <span>💬 19 comments</span>
              </div>
              <div><strong style="color:#fff;">pia.cyber</strong> Study session at local café ☕ Loving the free public Wi-Fi! Time to finish the security report 💻 #coffee #remoteWork</div>
            </div>
          </div>

          <!-- Post 2: Badge & Workstation -->
          <div class="insta-post-card" style="background:#111827;border:1px solid rgba(255,255,255,0.08);border-radius:10px;overflow:hidden;cursor:pointer;" onclick="showToast('💡 Threat Insight: Posting workplace ID badges or company doors reveals physical security protocols to attackers!','info')">
            <div style="position:relative;padding-top:100%;background:#1e293b;">
              <img src="assets/Cover.png" alt="Office Entrance" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;">
            </div>
            <div style="padding:10px 12px;font-size:12px;color:#cbd5e1;line-height:1.4;">
              <div style="display:flex;justify-content:space-between;color:#94a3b8;font-size:11px;margin-bottom:4px;">
                <span>❤️ 412 likes</span>
                <span>💬 38 comments</span>
              </div>
              <div><strong style="color:#fff;">pia.cyber</strong> Day 1 at Business Inc.! Orientation complete with Alex, Ethan, and mentor Ryan. Ready to monitor threat feeds 🛡️</div>
            </div>
          </div>

          <!-- Post 3: Portrait Selfie -->
          <div class="insta-post-card" style="background:#111827;border:1px solid rgba(255,255,255,0.08);border-radius:10px;overflow:hidden;cursor:pointer;" onclick="showToast('❤️ Liked Pia\'s post!','success')">
            <div style="position:relative;padding-top:100%;background:#0f172a;">
              <img src="assets/Character/Pia.png" alt="Pia Portrait" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;">
            </div>
            <div style="padding:10px 12px;font-size:12px;color:#cbd5e1;line-height:1.4;">
              <div style="display:flex;justify-content:space-between;color:#94a3b8;font-size:11px;margin-bottom:4px;">
                <span>❤️ 519 likes</span>
                <span>💬 27 comments</span>
              </div>
              <div><strong style="color:#fff;">pia.cyber</strong> Morning team sync ready! Working on digital forensics and social engineering awareness. ✨📸</div>
            </div>
          </div>

          <!-- Post 4: Team Retreat -->
          <div class="insta-post-card" style="background:#111827;border:1px solid rgba(255,255,255,0.08);border-radius:10px;overflow:hidden;cursor:pointer;" onclick="showToast('❤️ Liked team retreat photo!','success')">
            <div style="position:relative;padding-top:100%;background:#1e293b;">
              <img src="assets/background/Coffe shop.png" alt="Team Meetup" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;filter:hue-rotate(30deg);">
            </div>
            <div style="padding:10px 12px;font-size:12px;color:#cbd5e1;line-height:1.4;">
              <div style="display:flex;justify-content:space-between;color:#94a3b8;font-size:11px;margin-bottom:4px;">
                <span>❤️ 310 likes</span>
                <span>💬 14 comments</span>
              </div>
              <div><strong style="color:#fff;">pia.cyber</strong> Weekend team building with the cohort! Great energy all around 🎉 #teambuilding #cybersecurity</div>
            </div>
          </div>

          <!-- Post 5: Multi-monitor Setup -->
          <div class="insta-post-card" style="background:#111827;border:1px solid rgba(255,255,255,0.08);border-radius:10px;overflow:hidden;cursor:pointer;" onclick="showToast('❤️ Liked setup post!','success')">
            <div style="position:relative;padding-top:100%;background:#1e293b;">
              <img src="assets/Desktop/Default.png" alt="Monitoring Station" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;">
            </div>
            <div style="padding:10px 12px;font-size:12px;color:#cbd5e1;line-height:1.4;">
              <div style="display:flex;justify-content:space-between;color:#94a3b8;font-size:11px;margin-bottom:4px;">
                <span>❤️ 195 likes</span>
                <span>💬 8 comments</span>
              </div>
              <div><strong style="color:#fff;">pia.cyber</strong> Multi-monitor monitoring station setup complete 🖥️ Watching network telemetry live! #sysadmin #threatintel</div>
            </div>
          </div>

          <!-- Post 6: Cyber Tip & Infosec -->
          <div class="insta-post-card" style="background:#111827;border:1px solid rgba(255,255,255,0.08);border-radius:10px;overflow:hidden;cursor:pointer;" onclick="showToast('🛡️ Security Tip: Always verify identity before sharing sensitive credentials!','info')">
            <div style="position:relative;padding-top:100%;background:linear-gradient(135deg,#0284c7,#1e1b4b);display:flex;align-items:center;justify-content:center;text-align:center;padding:16px;">
              <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:80%;">
                <div style="font-size:32px;margin-bottom:6px;">🔐</div>
                <div style="font-size:12px;font-weight:800;color:#ffffff;line-height:1.3;">NEVER SHARE MFA CODES</div>
                <div style="font-size:10px;color:#93c5fd;margin-top:4px;">#CyberTip</div>
              </div>
            </div>
            <div style="padding:10px 12px;font-size:12px;color:#cbd5e1;line-height:1.4;">
              <div style="display:flex;justify-content:space-between;color:#94a3b8;font-size:11px;margin-bottom:4px;">
                <span>❤️ 521 likes</span>
                <span>💬 42 comments</span>
              </div>
              <div><strong style="color:#fff;">pia.cyber</strong> Reminder to everyone: Use strong passphrases and MFA! Never share verification codes over the phone 🔐 #CyberSecurityTips</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ── DESKTOP APP LAUNCHERS FOR CHAPTER 3 ──
function openInstagramApp() {
  openApp('browser');
  const win = document.getElementById('win-browser');
  if (win) {
    win.style.left = '120px';
    win.style.top = '70px';
  }
  if (typeof browserGo === 'function') {
    browserGo('https://www.instagram.com/pia.cyber/');
  }
  if (typeof showToast === 'function') {
    showToast('📸 Opened Instagram — Pia\'s Social Profile', 'info');
  }
}
window.openInstagramApp = openInstagramApp;

function openPicturesFolder() {
  openApp('folder');
  if (typeof switchExplorerFolder === 'function') {
    switchExplorerFolder('pictures');
  }
  if (typeof showToast === 'function') {
    showToast('🖼️ Opened Pictures folder', 'info');
  }
}
window.openPicturesFolder = openPicturesFolder;
