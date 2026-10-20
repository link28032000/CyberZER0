'use strict';

// ── PHONELINK APP ─────────────────────────────────────────────

const G4_CONTACTS = [
  { id: 'pia_fake', name: 'Pia — New Account', avatar: '👤', joined: 'Today', type: 'suspicious', isGroup4: true },
  { id: 'carlo', name: 'Carlo', avatar: '👦', joined: '2 years ago', type: 'known', isGroup4: true },
  { id: 'real_pia', name: 'Pia (Verified)', avatar: '👧', joined: '1 year ago', type: 'known', isGroup4: true }
];

const G4_MESSAGES = {
  pia_fake: [
    { from: 'them', text: 'Hey, can you send me your student number and birthday? I need them to recover our project account. Please hurry.', time: '2:47 PM', urgent: true }
  ],
  carlo: [
    { from: 'them', text: 'I found a free premium design tool. Download this so we can finish the presentation faster.', time: '3:05 PM', link: 'canva-premium-free.example' }
  ],
  real_pia: [
    { from: 'them', text: "Hey! Did someone contact you pretending to be me? That account isn't mine.", time: '2:48 PM', verified: true }
  ]
};

let g4ActiveConvo = null;
let g4PiaInspected = false;
let g4GroupChecked = false;
let g4PhoneScreenView = 'home'; // 'home' | 'messages' | 'calls'

function renderPhoneLinkApp() {
  renderPhoneFrame();
  showPhoneHomeScreen();
  switchPhoneTab('messages');
}

function renderPhoneFrame() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

  const timeEl = document.getElementById('pl-phone-time');
  if (timeEl) timeEl.textContent = timeStr;

  const widgetTime = document.getElementById('pl-phone-widget-time');
  if (widgetTime) widgetTime.textContent = timeStr;

  const widgetDate = document.getElementById('pl-phone-widget-date');
  if (widgetDate) widgetDate.textContent = dateStr;
}

function showPhoneHomeScreen() {
  g4PhoneScreenView = 'home';
  const phoneContent = document.getElementById('pl-phone-content');
  if (!phoneContent) return;

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

  phoneContent.innerHTML = `
    <div class="pl-phone-home-view">
      <div class="pl-phone-widget">
        <div class="pl-phone-widget-time" id="pl-phone-widget-time">${timeStr}</div>
        <div class="pl-phone-widget-date" id="pl-phone-widget-date">${dateStr}</div>
      </div>
      <div class="pl-phone-apps-container">
        <div class="pl-phone-apps-grid">
          <div class="pl-phone-app-item" id="pl-phone-app-messages" onclick="clickPhoneScreenApp('messages')" title="Messages">
            <div class="pl-phone-app-icon pl-app-icon-messages">
              <span>💬</span>
            </div>
            <span class="pl-phone-app-label">Messages</span>
          </div>
          <div class="pl-phone-app-item" id="pl-phone-app-calls" onclick="clickPhoneScreenApp('calls')" title="Calls">
            <div class="pl-phone-app-icon pl-app-icon-calls">
              <span>📞</span>
            </div>
            <span class="pl-phone-app-label">Calls</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

function showPhoneInAppScreen(app) {
  g4PhoneScreenView = app;
  const phoneContent = document.getElementById('pl-phone-content');
  if (!phoneContent) return;

  const isMsg = app === 'messages';
  const title = isMsg ? 'Messages' : 'Calls';
  const icon = isMsg ? '💬' : '📞';
  const emptyTitle = isMsg ? 'No Messages' : 'No Recent Calls';
  const emptyDesc = isMsg ? 'Your inbox is empty' : 'Call history is empty';

  phoneContent.innerHTML = `
    <div class="pl-phone-inapp-view">
      <div class="pl-phone-inapp-header">
        <button type="button" class="pl-phone-screen-back" onclick="returnPhoneHome()" title="Home Screen">‹ Home</button>
        <span class="pl-phone-screen-title">${title}</span>
        <span style="width:36px"></span>
      </div>
      <div class="pl-phone-inapp-body">
        <div class="pl-phone-screen-empty-icon">${icon}</div>
        <div class="pl-phone-screen-empty-title">${emptyTitle}</div>
        <div class="pl-phone-screen-empty-desc">${emptyDesc}</div>
        <button type="button" class="pl-phone-screen-home-btn" onclick="returnPhoneHome()">Home Screen</button>
      </div>
    </div>
  `;
}

function clickPhoneScreenApp(app) {
  if (typeof AudioManager !== 'undefined' && typeof AudioManager.playClick === 'function') AudioManager.playClick();
  showPhoneInAppScreen(app);
  switchPhoneTab(app);
}

function returnPhoneHome() {
  if (typeof AudioManager !== 'undefined' && typeof AudioManager.playClick === 'function') AudioManager.playClick();
  showPhoneHomeScreen();
}

function switchPhoneTab(tab) {
  g4ActiveTab = tab;
  const tabs = document.querySelectorAll('.pl-tab');
  tabs.forEach(t => {
    const id = t.id.replace('pl-tab-', '');
    t.classList.toggle('active', id === tab);
  });

  const content = document.getElementById('pl-tab-content');
  if (!content) return;

  if (tab === 'messages') {
    renderPhoneMessages(content);
    if (g4PhoneScreenView !== 'home') {
      showPhoneInAppScreen('messages');
    }
  } else if (tab === 'calls') {
    content.innerHTML = `
      <div class="pl-empty-state">
        <div class="pl-empty-state-icon">📞</div>
        <div class="pl-empty-state-title">No recent calls</div>
        <div class="pl-empty-state-sub">Recent phone and audio calls will appear here.</div>
      </div>
    `;
    if (g4PhoneScreenView !== 'home') {
      showPhoneInAppScreen('calls');
    }
  }
}

function renderPhoneMessages(container) {
  const badge = document.getElementById('pl-msg-badge');
  if (badge) {
    badge.textContent = '';
    badge.classList.add('hidden');
  }

  container.innerHTML = `
    <div class="pl-empty-state">
      <div class="pl-empty-state-icon">💬</div>
      <div class="pl-empty-state-title">No messages</div>
      <div class="pl-empty-state-sub">No direct messages yet. New conversations will appear here.</div>
    </div>
  `;
}

function openPhoneConversation(contactId) {
  g4ActiveConvo = contactId;
  switchPhoneTab('messages');

  const content = document.getElementById('pl-tab-content');
  if (!content) return;

  const contact = G4_CONTACTS.find(c => c.id === contactId);

  content.innerHTML = `
    <div class="pl-convo-view">
      <div class="pl-convo-header">
        <button class="pl-back-btn" onclick="switchPhoneTab('messages')">← Back</button>
        <div class="pl-convo-name">${contact?.name || contactId}</div>
      </div>
      <div class="pl-empty-state" style="flex:1;">
        <div class="pl-empty-state-icon">💬</div>
        <div class="pl-empty-state-title">No messages</div>
        <div class="pl-empty-state-sub">This conversation is currently empty.</div>
      </div>
    </div>
  `;
}

function buildPhoneActionHtml(contactId) {
  if (contactId === 'pia_fake' && !g4State.miaAction) {
    return `
      <div class="pl-action-bar">
        <div class="pl-action-header">🎙️ <em>"A familiar name does not guarantee a legitimate request. Verify through another trusted method."</em></div>
        <div class="pl-action-btns">
          <button class="pl-action-btn pl-btn-danger" onclick="g4PiaDecision('sent')">📤 Send Info (Student ID + Birthday)</button>
          <button class="pl-action-btn pl-btn-report" onclick="g4PiaDecision('reported')">🚩 Stop & Report Account</button>
          <button class="pl-action-btn pl-btn-ghost" onclick="g4PiaDecision('ignored')">🚫 Ignore & Warn Group</button>
        </div>
      </div>
    `;
  } else if (contactId === 'carlo' && !g4State.fileDecision) {
    return `
      <div class="pl-action-bar">
        <button class="pl-action-btn pl-btn-primary" onclick="g4OpenCarloLink()">🌐 Open Browser to Investigate</button>
      </div>
    `;
  }
  return '';
}

function g4InspectProfile(contactId) {
  if (contactId !== 'pia_fake') {
    showToast(`ℹ️ ${G4_CONTACTS.find(c => c.id === contactId)?.name}: Known contact. Account verified.`, 'info');
    return;
  }
  showToast('⚠️ Profile "Pia — New Account" was created TODAY. Different from the real Pia\'s account. Investigate further!', 'warning');
  g4PiaInspected = true;
}

function g4PiaDecision(action) {
  g4State.miaAction = action;
  const badge = document.getElementById('pl-notif-badge');
  if (badge) badge.classList.add('hidden');

  if (action === 'reported') {
    g4State.score += 100;
    showToast('✅ Threat Identified: Social Engineering. Personal Information Protected. (+100 pts)', 'success');
    openPhoneConversation('mia_fake');
    setTimeout(() => g4ProceedToStage4(), 1500);
  } else if (action === 'ignored') {
    g4State.score += 50;
    showToast('⚠️ Smart to ignore — but reporting would help protect others too. (+50 pts)', 'info');
    openPhoneConversation('mia_fake');
    setTimeout(() => g4ProceedToStage4(), 1500);
  } else if (action === 'sent') {
    showToast('⚠️ You shared personal information! This was a social engineering attack. Be cautious next time.', 'warning');
    openPhoneConversation('mia_fake');
    setTimeout(() => g4ProceedToStage4(), 1500);
  }
}

function g4ProceedToStage4() {
  g4State.stage = 4;
  showToast('⬇️ Stage 4: Carlo sent a download link. Open Browser to investigate the file.', 'info');
  // Show Carlo message
  setTimeout(() => {
    openPhoneConversation('carlo');
  }, 500);
}

function g4OpenCarloLink() {
  openApp('browser');
  const win = document.getElementById('win-browser');
  if (win) { win.style.left = '160px'; win.style.top = '80px'; }
  setTimeout(() => {
    browserGo('canva-premium-free.example');
    renderG4MaliciousSite();
  }, 300);
}

// ── STAGE 4: MALICIOUS DOWNLOAD ───────────────────────────────

function renderG4MaliciousSite() {
  const contentEl = document.getElementById('browser-content');
  if (!contentEl) return;

  const urlBar = document.getElementById('browser-url-input');
  if (urlBar) urlBar.value = 'http://canva-premium-free.example/download';

  const secIndicator = document.getElementById('browser-security');
  if (secIndicator) {
    secIndicator.textContent = '⚠️ Not Secure';
    secIndicator.style.color = 'var(--accent-red)';
  }

  if (typeof updateBrowserPhishingNotice === 'function') {
    updateBrowserPhishingNotice(true, 'http://canva-premium-free.example/download');
  }

  contentEl.innerHTML = `
    <div class="g4-malsite-wrap">
      <div class="g4-malsite-header">
        <div class="g4-malsite-logo">Canva<span style="color:#ff5252">-premium</span>-free</div>
        <div style="font-size:11px;color:rgba(255,255,255,0.4);margin-top:4px">⚠️ Unofficial — Not affiliated with Canva</div>
      </div>
      <div class="g4-malsite-hero">
        <div class="g4-malsite-title">FREE PREMIUM DESIGN TOOL</div>
        <div class="g4-malsite-bullets">
          <div>✓ Premium Features — FREE</div>
          <div>✓ No Registration Required!</div>
          <div>✓ Unlimited Templates &amp; Exports</div>
        </div>
        <button class="g4-download-btn" onclick="g4TriggerDownload()">⬇ DOWNLOAD NOW</button>
        <div class="g4-malsite-counter">Downloaded by 4,892 users today!</div>
      </div>

      <!-- Narrator practice tip -->
      <div class="g4-narrator-tip" style="max-width:600px;margin:16px auto 0;">
        <span class="g4-narrator-icon">🎙️</span>
        <p>"A useful-looking file can still be unsafe. Check the source, file type, and publisher before opening it."</p>
      </div>
    </div>
  `;
}

function g4TriggerDownload() {
  const contentEl = document.getElementById('browser-content');
  if (!contentEl) return;

  contentEl.innerHTML += `
    <div class="g4-download-complete" id="g4-download-complete">
      <div style="font-size:16px;font-weight:700;color:var(--text-primary)">⬇️ Download Complete</div>
      <div class="g4-file-props">
        <div style="font-size:14px;font-weight:700;color:var(--text-primary);margin-bottom:12px">📄 File Properties — Inspection Required</div>
        <table class="g4-props-table">
          <tr><td class="g4-prop-label">File Name</td><td class="g4-prop-val">PremiumDesignTool.exe</td></tr>
          <tr><td class="g4-prop-label">File Type</td><td class="g4-prop-val" style="color:var(--accent-orange)">Application (.exe) ⚠️</td></tr>
          <tr><td class="g4-prop-label">Publisher</td><td class="g4-prop-val" style="color:var(--accent-red)">Unknown ⚠️</td></tr>
          <tr><td class="g4-prop-label">Source</td><td class="g4-prop-val" style="color:var(--accent-red)">Unverified — canva-premium-free.example</td></tr>
          <tr><td class="g4-prop-label">Size</td><td class="g4-prop-val">3.4 MB</td></tr>
          <tr><td class="g4-prop-label">SHA-256</td><td class="g4-prop-val" style="font-family:var(--font-mono);font-size:11px">f7e4b2c1a0d8e9f3...</td></tr>
        </table>
      </div>
      <div class="g4-file-decision-btns">
        <button class="btn-success btn-sm" onclick="g4FileDecision('delete')">🗑️ Delete File</button>
        <button class="btn-ghost btn-sm" onclick="g4FileDecision('report')">🚩 Report File</button>
        <button class="btn-danger btn-sm" onclick="g4FileDecision('open')">▶ Open File</button>
      </div>
    </div>
  `;
}

function g4FileDecision(decision) {
  g4State.fileDecision = decision;

  if (decision === 'delete') {
    g4State.score += 100;
    showToast('✅ Correct! Deleted unknown .exe from unverified source. (+100 pts)', 'success');
    setTimeout(() => g4ShowConsequences(), 1200);
  } else if (decision === 'report') {
    g4State.score += 75;
    showToast('✅ Good decision! Reported the suspicious file. (+75 pts)', 'success');
    setTimeout(() => g4ShowConsequences(), 1200);
  } else if (decision === 'open') {
    showToast('⚠️ You opened an unknown .exe! Watch what happens next...', 'warning');
    setTimeout(() => g4StartInfection(), 1000);
  }
}
