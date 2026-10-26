'use strict';

// ── PHONELINK APP ─────────────────────────────────────────────

// ═══════════════════════════════════════════════════════════════
// NEW INTERN GROUP CHAT: "new intern team 2027"
// ═══════════════════════════════════════════════════════════════

const NEWBIE_GC_STORAGE_KEY = 'cyberzero_newbie_gc_state';

const NEWBIE_GC_INFO = {
  id: 'business_newbie_gc',
  name: 'new intern team 2027',
  company: 'Business Inc.',
  subtitle: 'Group created by Ryan · 4 members',
  creator: {
    name: 'Ryan',
    role: 'IT Support Mentor & Group Creator',
    avatar: 'assets/Character/Ryan.png'
  },
  members: [
    {
      id: 'ryan',
      name: 'Ryan',
      role: 'IT Support Mentor & Group Creator',
      roleTag: 'CREATOR',
      roleClass: 'pl-gc-role-mentor',
      avatar: 'assets/Character/Ryan.png',
      status: 'Online'
    },
    {
      id: 'ethan',
      name: 'Ethan',
      role: 'SysAdmin & Network Infrastructure',
      roleTag: 'SYSADMIN',
      roleClass: 'pl-gc-role-sysadmin',
      avatar: 'assets/Character/Ethan.png',
      status: 'Online'
    },
    {
      id: 'pia',
      name: 'Pia',
      role: 'Threat Intelligence Analyst',
      roleTag: 'ANALYST',
      roleClass: 'pl-gc-role-analyst',
      avatar: 'assets/Character/Pia.png',
      status: 'Online'
    },
    {
      id: 'alex',
      name: 'Alex (You)',
      role: 'IT Support Trainee & Security Recruit',
      roleTag: 'ALEX (YOU)',
      roleClass: 'pl-gc-role-you',
      avatar: 'assets/Character/Alex.png',
      isPlayer: true,
      status: 'Active Now'
    }
  ],
  // Real messaging app experience: no pre-filled fake messages, starts clean with creation event
  defaultMessages: []
};

function loadNewbieGcState() {
  try {
    const raw = localStorage.getItem(NEWBIE_GC_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed === 'object' && parsed !== null) return parsed;
    }
  } catch (e) {}
  return {
    created: false,
    joined: false,
    hasUnread: false,
    playerMessages: []
  };
}

function saveNewbieGcState(state) {
  try {
    localStorage.setItem(NEWBIE_GC_STORAGE_KEY, JSON.stringify(state));
  } catch (e) {}
}

function isNewbieGcActive() {
  const state = loadNewbieGcState();
  if (state.created || state.joined || state.invited || state.accepted) return true;
  // If player already completed Chapter 1 or unlocked an achievement
  try {
    const phishProgress = localStorage.getItem('cyberzero_phishing_progress');
    if (phishProgress) {
      const p = JSON.parse(phishProgress);
      if (p.trophyUnlocked || p.earnedAward || (Array.isArray(p.unlockedAchievements) && p.unlockedAchievements.length > 0)) {
        return true;
      }
    }
  } catch(e) {}
  return false;
}

function setNewbieGcCreated(andHighlight = true) {
  const state = loadNewbieGcState();
  state.created = true;
  state.joined = true;
  state.accepted = true;
  state.hasUnread = true;
  saveNewbieGcState(state);
  updatePhoneLinkBadges();
  if (andHighlight) {
    highlightPhoneLinkApp();
  }
}

// Backward-compatibility alias
function setNewbieGcInvitePending(andHighlight = true) {
  setNewbieGcCreated(andHighlight);
}

function highlightPhoneLinkApp() {
  const commsWin = document.getElementById('win-comms');
  if (commsWin && !commsWin.classList.contains('hidden')) return;

  // Highlight Phone Link ONLY on desktop app icon with blinking attention border
  const icon = document.getElementById('icon-comms');
  if (icon) {
    icon.classList.remove('pl-icon-pulse');
    icon.classList.add('icon-attention');
    icon.setAttribute('data-badge', '1');
    icon.title = 'Phone Link — Added to "new intern team 2027"!';
  }
  const taskbarBtn = document.getElementById('taskbar-comms');
  if (taskbarBtn) {
    taskbarBtn.classList.remove('icon-attention', 'pl-icon-pulse');
  }
  if (typeof IconAttention !== 'undefined') {
    IconAttention.show('comms');
  }
  updatePhoneLinkBadges();
}

function unhighlightPhoneLinkApp() {
  window._phoneLinkHighlightDismissed = true;
  if (typeof IconAttention !== 'undefined') {
    IconAttention.hide('comms');
  }
  const icon = document.getElementById('icon-comms');
  if (icon) {
    icon.classList.remove('icon-attention', 'pl-icon-pulse');
    icon.removeAttribute('data-badge');
    icon.title = 'Phone Link';
  }
  const taskbarBtn = document.getElementById('taskbar-comms');
  if (taskbarBtn) {
    taskbarBtn.classList.remove('icon-attention', 'pl-icon-pulse');
  }
}

function updatePhoneLinkBadges() {
  const state = loadNewbieGcState();
  const hasUnread = !!state.hasUnread;

  const phoneBadge = document.getElementById('pl-notif-badge');
  if (phoneBadge) {
    phoneBadge.classList.add('hidden');
  }

  const tabBadge = document.getElementById('pl-msg-badge');
  if (tabBadge) {
    if (hasUnread) {
      tabBadge.textContent = '1';
      tabBadge.classList.remove('hidden');
    } else {
      tabBadge.textContent = '';
      tabBadge.classList.add('hidden');
    }
  }
}

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
// g4ActiveTab declared in data.js
g4ActiveTab = 'messages';

// ── CONNECTION STATUS HELPERS ─────────────────────────────────

function getPhoneLinkConnectionStatus() {
  if (typeof networkSettings === 'undefined') {
    return { isBluetoothConnected: true, isInternetConnected: true, isAirplane: false };
  }
  const isAirplane = !!networkSettings.airplane;
  const isBtOn = !!(networkSettings.bluetooth && !isAirplane);
  const isWifiOn = !!(networkSettings.wifi && !isAirplane && networkSettings.currentSsid && !networkSettings.noInternet);
  return {
    isBluetoothConnected: isBtOn,
    isInternetConnected: isWifiOn,
    isAirplane: isAirplane
  };
}

function turnOnBluetoothFromPhoneLink() {
  if (typeof networkSettings !== 'undefined') {
    if (networkSettings.airplane) {
      networkSettings.airplane = false;
    }
    networkSettings.bluetooth = true;
    if (typeof updateNetworkUI === 'function') {
      updateNetworkUI();
    }
    if (typeof showToast === 'function') {
      showToast('📡 Bluetooth turned On • Mobile phone connected.', 'success');
    }
    if (typeof AudioManager !== 'undefined' && AudioManager.playClick) {
      AudioManager.playClick();
    }
  }
  updatePhoneLinkConnectionState();
}

function turnOffAirplaneFromPhoneLink() {
  if (typeof networkSettings !== 'undefined') {
    networkSettings.airplane = false;
    networkSettings.bluetooth = true;
    networkSettings.wifi = true;
    if (typeof updateNetworkUI === 'function') {
      updateNetworkUI();
    }
    if (typeof showToast === 'function') {
      showToast('✈️ Airplane Mode turned off • Wireless restored.', 'success');
    }
    if (typeof AudioManager !== 'undefined' && AudioManager.playClick) {
      AudioManager.playClick();
    }
  }
  updatePhoneLinkConnectionState();
}

function turnOnWifiFromPhoneLink() {
  if (typeof networkSettings !== 'undefined') {
    if (networkSettings.airplane) {
      networkSettings.airplane = false;
    }
    networkSettings.wifi = true;
    if (!networkSettings.currentSsid) {
      networkSettings.currentSsid = 'HomeNetwork_5G';
    }
    networkSettings.noInternet = false;
    if (typeof updateNetworkUI === 'function') {
      updateNetworkUI();
    }
    if (typeof showToast === 'function') {
      showToast('📶 Connected to ' + networkSettings.currentSsid + ' • Internet connection restored.', 'success');
    }
    if (typeof AudioManager !== 'undefined' && AudioManager.playClick) {
      AudioManager.playClick();
    }
  }
  updatePhoneLinkConnectionState();
}

function renderDisconnectedHeroView(isAirplane) {
  const reasonTitle = isAirplane
    ? "Airplane Mode is turned on"
    : "We can't connect to your phone";
  const reasonDesc = isAirplane
    ? "All wireless communication including Bluetooth is currently suspended by Airplane Mode. Turn off Airplane Mode to restore connection with your phone."
    : "Bluetooth is turned off on your PC. Phone Link requires Bluetooth to link with your mobile phone, sync conversations, and receive live notifications.";
  const primaryBtnText = isAirplane ? "✈️ Turn off Airplane Mode" : "📡 Turn on Bluetooth";
  const primaryAction = isAirplane ? "turnOffAirplaneFromPhoneLink()" : "turnOnBluetoothFromPhoneLink()";

  return `
    <div class="pl-disconnected-main-view">
      <div class="pl-dc-hero-graphic">
        <div class="pl-dc-circle-pulse"></div>
        <div class="pl-dc-hero-icon">📱⃠</div>
      </div>
      <h2 class="pl-dc-title">${reasonTitle}</h2>
      <p class="pl-dc-desc">${reasonDesc}</p>
      <div class="pl-dc-actions">
        <button type="button" class="pl-dc-btn-primary" onclick="${primaryAction}">
          ${primaryBtnText}
        </button>
        <button type="button" class="pl-dc-btn-secondary" onclick="openWifiSettingsFromFlyout()">
          ⚙️ Network &amp; Bluetooth Settings
        </button>
      </div>
      <div class="pl-dc-troubleshoot-hint">
        💡 <strong>Quick Fix:</strong> Check the Windows taskbar tray icon in the bottom right corner to verify Bluetooth is enabled.
      </div>
    </div>
  `;
}

function renderNoInternetBannerHtml() {
  return `
    <div class="pl-no-internet-banner" id="pl-no-internet-banner">
      <div class="pl-no-internet-content">
        <span class="pl-no-internet-icon">⚠️</span>
        <div class="pl-no-internet-text">
          <strong>No internet connection</strong> — Messages can't be sent or synced right now. Check your Wi-Fi connection.
        </div>
      </div>
      <button type="button" class="pl-no-internet-btn" onclick="turnOnWifiFromPhoneLink()">
        Turn on Wi-Fi
      </button>
    </div>
  `;
}

function updatePhoneLinkConnectionState() {
  const conn = getPhoneLinkConnectionStatus();

  // 1. Device status label in left sidebar
  const statusEl = document.getElementById('pl-device-status');
  const labelEl = document.querySelector('.pl-device-label');
  if (statusEl) {
    if (conn.isBluetoothConnected) {
      statusEl.textContent = '🟢 Connected';
      statusEl.className = 'pl-device-status pl-status-connected';
      if (labelEl) labelEl.title = 'Mobile Phone connected via Bluetooth';
    } else {
      statusEl.textContent = '🔴 Disconnected';
      statusEl.className = 'pl-device-status pl-status-disconnected';
      if (labelEl) labelEl.title = conn.isAirplane ? 'Disconnected (Airplane Mode active)' : 'Disconnected (Bluetooth is off)';
    }
  }

  // 2. Status bar signal icon inside left phone screen
  const signalEl = document.getElementById('pl-phone-signal');
  if (signalEl) {
    if (!conn.isBluetoothConnected) {
      signalEl.textContent = '📵';
      signalEl.title = 'Bluetooth disconnected';
    } else if (!conn.isInternetConnected) {
      signalEl.textContent = '⚠️';
      signalEl.title = 'Connected via Bluetooth, but No internet connection';
    } else {
      signalEl.textContent = '📶';
      signalEl.title = 'Wi-Fi & Bluetooth Connected';
    }
  }

  // 3. Left phone screen disconnected overlay
  const phoneScreen = document.getElementById('pl-phone-screen');
  if (phoneScreen) {
    let overlay = document.getElementById('pl-phone-disconnected-overlay');
    if (!conn.isBluetoothConnected) {
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'pl-phone-disconnected-overlay';
        overlay.className = 'pl-phone-disconnected-overlay';
        phoneScreen.appendChild(overlay);
      }
      overlay.innerHTML = `
        <div class="pl-phone-dc-inner">
          <div class="pl-phone-dc-icon">📡⃠</div>
          <div class="pl-phone-dc-title">Phone Disconnected</div>
          <div class="pl-phone-dc-sub">${conn.isAirplane ? 'Airplane Mode active on PC' : 'Turn on Bluetooth to reconnect'}</div>
          <button type="button" class="pl-phone-dc-btn" onclick="turnOnBluetoothFromPhoneLink()">
            ${conn.isAirplane ? 'Turn Off Airplane' : 'Connect'}
          </button>
        </div>
      `;
      overlay.style.display = 'flex';
    } else {
      if (overlay) {
        overlay.style.display = 'none';
      }
    }
  }

  // 4. Main Right Panel
  const content = document.getElementById('pl-tab-content');
  if (!content) return;

  if (!conn.isBluetoothConnected) {
    content.innerHTML = renderDisconnectedHeroView(conn.isAirplane);
    return;
  }

  // Bluetooth is connected:
  const isShowingDcHero = content.querySelector('.pl-disconnected-main-view');
  if (isShowingDcHero) {
    // Was showing disconnected hero screen, now restore active view
    if (g4ActiveTab === 'calls') {
      switchPhoneTab('calls');
    } else {
      if (g4ActiveConvo === 'business_newbie_gc') {
        openNewbieGcConversation();
      } else if (g4ActiveConvo) {
        openPhoneConversation(g4ActiveConvo);
      } else {
        switchPhoneTab('messages');
      }
    }
  } else {
    // Re-sync no internet banner if already viewing messages or group chat
    if (g4ActiveTab === 'messages') {
      const bannerExists = !!content.querySelector('.pl-no-internet-banner');
      if (!conn.isInternetConnected && !bannerExists) {
        // Needs banner
        if (g4ActiveConvo === 'business_newbie_gc') {
          openNewbieGcConversation();
        } else if (g4ActiveConvo) {
          openPhoneConversation(g4ActiveConvo);
        } else {
          renderPhoneMessages(content);
        }
      } else if (conn.isInternetConnected && bannerExists) {
        // Needs banner removed
        if (g4ActiveConvo === 'business_newbie_gc') {
          openNewbieGcConversation();
        } else if (g4ActiveConvo) {
          openPhoneConversation(g4ActiveConvo);
        } else {
          renderPhoneMessages(content);
        }
      }
    }
  }
}

function renderPhoneLinkApp() {
  unhighlightPhoneLinkApp();
  renderPhoneFrame();
  showPhoneHomeScreen();
  updatePhoneLinkBadges();
  switchPhoneTab('messages');
  if (typeof isNewbieGcActive === 'function' && isNewbieGcActive()) {
    openNewbieGcConversation();
  }
  updatePhoneLinkConnectionState();
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

  if (isMsg && isNewbieGcActive()) {
    const gcState = loadNewbieGcState();
    const hasPlayerMsgs = gcState.playerMessages && gcState.playerMessages.length > 0;
    const lastMsgPreview = hasPlayerMsgs
      ? gcState.playerMessages[gcState.playerMessages.length - 1].text
      : 'Ryan added you';

    phoneContent.innerHTML = `
      <div class="pl-phone-inapp-view">
        <div class="pl-phone-inapp-header">
          <button type="button" class="pl-phone-screen-back" onclick="returnPhoneHome()" title="Home Screen">‹</button>
          <span class="pl-phone-screen-title">${title}</span>
          <span style="width:36px"></span>
        </div>
        <div class="pl-phone-inapp-body" style="padding:8px;justify-content:flex-start;">
          <div style="background:rgba(255,255,255,0.06);border:1px solid rgba(56,189,248,0.3);border-radius:10px;padding:8px 10px;cursor:pointer;width:100%;box-sizing:border-box;text-align:left;" onclick="openNewbieGcConversation()">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
              <span style="font-size:13px;">👥</span>
              <span style="font-size:10px;font-weight:800;color:#ffffff;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">new intern team 2027</span>
            </div>
            <div style="font-size:8.5px;color:#cbd5e1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
              ${lastMsgPreview}
            </div>
          </div>
          <button type="button" class="pl-phone-screen-home-btn" onclick="returnPhoneHome()" style="margin-top:auto;">⌂</button>
        </div>
      </div>
    `;
    return;
  }

  const icon = isMsg ? '💬' : '📞';
  const emptyTitle = isMsg ? 'No Messages' : 'No Recent Calls';
  const emptyDesc = isMsg ? 'Your inbox is empty' : 'Call history is empty';

  phoneContent.innerHTML = `
    <div class="pl-phone-inapp-view">
      <div class="pl-phone-inapp-header">
        <button type="button" class="pl-phone-screen-back" onclick="returnPhoneHome()" title="Home Screen">‹</button>
        <span class="pl-phone-screen-title">${title}</span>
        <span style="width:36px"></span>
      </div>
      <div class="pl-phone-inapp-body">
        <div class="pl-phone-screen-empty-icon">${icon}</div>
        <div class="pl-phone-screen-empty-title">${emptyTitle}</div>
        <div class="pl-phone-screen-empty-desc">${emptyDesc}</div>
        <button type="button" class="pl-phone-screen-home-btn" onclick="returnPhoneHome()">⌂</button>
      </div>
    </div>
  `;
}

function clickPhoneScreenApp(app) {
  const conn = getPhoneLinkConnectionStatus();
  if (!conn.isBluetoothConnected) {
    if (typeof showToast === 'function') {
      showToast('🔴 Phone disconnected. Turn on Bluetooth on your PC to interact with phone.', 'warning');
    }
    return;
  }
  if (typeof AudioManager !== 'undefined' && typeof AudioManager.playClick === 'function') AudioManager.playClick();
  showPhoneInAppScreen(app);
  switchPhoneTab(app);
}

function returnPhoneHome() {
  const conn = getPhoneLinkConnectionStatus();
  if (!conn.isBluetoothConnected) return;
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

  const conn = getPhoneLinkConnectionStatus();
  if (!conn.isBluetoothConnected) {
    updatePhoneLinkConnectionState();
    return;
  }

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
  updatePhoneLinkBadges();
  const gcActive = isNewbieGcActive();
  const gcState = loadNewbieGcState();
  const conn = getPhoneLinkConnectionStatus();

  let bannerHtml = '';
  if (!conn.isInternetConnected) {
    bannerHtml = renderNoInternetBannerHtml();
  }

  let html = bannerHtml + '<div class="pl-contacts-list">';

  // 1. Group Chat Row (Pinned at top if active)
  if (gcActive) {
    const hasPlayerMsgs = gcState.playerMessages && gcState.playerMessages.length > 0;
    const preview = hasPlayerMsgs
      ? `${gcState.playerMessages[gcState.playerMessages.length - 1].author}: ${gcState.playerMessages[gcState.playerMessages.length - 1].text}`
      : `Ryan added you`;
    const timeStr = '10:49 AM';

    html += `
      <div class="pl-contact-row" onclick="openNewbieGcConversation()" title="${NEWBIE_GC_INFO.name}">
        <div class="pl-contact-avatar pl-gc-avatar-stack">👥</div>
        <div class="pl-contact-info">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2px;">
            <span class="pl-contact-name">${NEWBIE_GC_INFO.name}</span>
            <span class="pl-gc-tag-active">👥 4 MEMBERS</span>
          </div>
          <div class="pl-contact-meta" style="display:flex;justify-content:space-between;align-items:center;">
            <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:320px;">${preview}</span>
            <span style="font-size:10px;color:#94a3b8;margin-left:8px;">${timeStr}</span>
          </div>
        </div>
      </div>
    `;
  }

  // 2. Stage 3/4 Phishing/Social Engineering Contacts (if relevant)
  if (typeof g4State !== 'undefined' && g4State.stage >= 3) {
    G4_CONTACTS.forEach(contact => {
      const msgs = G4_MESSAGES[contact.id] || [];
      const lastMsg = msgs[msgs.length - 1];
      const preview = lastMsg ? lastMsg.text : 'No messages';
      const time = lastMsg ? lastMsg.time : '';
      html += `
        <div class="pl-contact-row" onclick="openPhoneConversation('${contact.id}')">
          <div class="pl-contact-avatar">${contact.avatar}</div>
          <div class="pl-contact-info">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <span class="pl-contact-name">${contact.name}</span>
              <span style="font-size:10px;color:#94a3b8;">${time}</span>
            </div>
            <div class="pl-contact-meta">${preview}</div>
          </div>
        </div>
      `;
    });
  }

  html += '</div>';

  if (!gcActive && (!g4State || g4State.stage < 3)) {
    container.innerHTML = bannerHtml + `
      <div class="pl-empty-state">
        <div class="pl-empty-state-icon">💬</div>
        <div class="pl-empty-state-title">No messages</div>
        <div class="pl-empty-state-sub">No direct messages yet. New conversations will appear here.</div>
      </div>
    `;
  } else {
    container.innerHTML = html;
  }
}

function openNewbieGcConversation() {
  const conn = getPhoneLinkConnectionStatus();
  if (!conn.isBluetoothConnected) {
    updatePhoneLinkConnectionState();
    return;
  }
  g4ActiveConvo = 'business_newbie_gc';
  switchPhoneTab('messages');

  const content = document.getElementById('pl-tab-content');
  if (!content) return;

  const state = loadNewbieGcState();
  state.hasUnread = false;
  saveNewbieGcState(state);
  updatePhoneLinkBadges();

  renderNewbieGcChat(content);
}

// Backward-compat aliases
function renderNewbieGcInvite(container) {
  renderNewbieGcChat(container);
}

function acceptNewbieGcInvite() {
  openNewbieGcConversation();
}

function renderNewbieGcChat(container) {
  const state = loadNewbieGcState();
  const conn = getPhoneLinkConnectionStatus();
  const isOffline = !conn.isInternetConnected;
  const bannerHtml = isOffline ? renderNoInternetBannerHtml() : '';

  const playerMessages = state.playerMessages || [];
  const hasMessages = playerMessages.length > 0;

  container.innerHTML = `
    <div class="pl-convo-view" style="display:flex;flex-direction:column;height:100%;background:#090e18;">
      <!-- Header -->
      <div class="pl-convo-header" style="background:#0f172a;border-bottom:1px solid rgba(255,255,255,0.08);padding:10px 16px;display:flex;align-items:center;gap:12px;">
        <button class="pl-back-btn" onclick="switchPhoneTab('messages')">← Back</button>
        <div class="pl-contact-avatar pl-gc-avatar-stack" style="width:34px;height:34px;font-size:16px;">👥</div>
        <div class="pl-gc-header-info">
          <div class="pl-convo-name" style="font-size:13.5px;font-weight:800;color:#ffffff;line-height:1.2;">${NEWBIE_GC_INFO.name}</div>
          <div class="pl-gc-members-summary">Group created by Ryan · 4 members (Ryan, Ethan, Pia, Alex) · <span style="color:${isOffline ? '#f59e0b' : '#22c55e'};">${isOffline ? '⚠️ Offline' : '🟢 Online'}</span></div>
        </div>
      </div>

      <!-- Optional No Internet Banner -->
      ${bannerHtml}

      <!-- Messages Thread -->
      <div class="pl-convo-messages" id="pl-gc-messages-list" style="flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px;">
        <!-- Real messaging app system events -->
        <div class="pl-gc-system-events-container">
          <div class="pl-gc-system-pill">
            👑 <strong>Ryan</strong> created group <strong>"${NEWBIE_GC_INFO.name}"</strong>
          </div>
          <div class="pl-gc-system-pill">
            👥 <strong>Ryan</strong> added <strong>Ethan</strong> and <strong>Pia</strong>
          </div>
          <div class="pl-gc-system-pill pl-gc-pill-you">
            👋 <strong>Ryan</strong> added <strong>you</strong>
          </div>
        </div>

        ${!hasMessages ? `
          <div class="pl-gc-start-hint">
            <span style="font-size:22px;">💬</span>
            <div style="font-weight:700;color:#f1f5f9;">No messages yet</div>
            <div style="font-size:11px;color:#94a3b8;">Say hi to Ethan, Pia, and Ryan to start the team conversation!</div>
          </div>
        ` : ''}

        ${playerMessages.map(msg => {
          const isMine = msg.from === 'player' || msg.from === 'alex' || msg.isPlayer;
          const authorName = isMine ? 'Alex (You)' : msg.author;
          const avatarSrc = isMine ? 'assets/Character/Alex.png' : msg.avatar;
          const roleTag = isMine ? 'ALEX (YOU)' : msg.roleTag;
          const roleClass = isMine ? 'pl-gc-role-you' : msg.roleClass;
          return `
            <div class="pl-gc-msg-item ${isMine ? 'mine' : 'theirs'}">
              <img src="${avatarSrc}" class="pl-gc-msg-avatar ${isMine ? 'avatar-mine' : ''}" alt="${authorName}">
              <div class="pl-gc-msg-col">
                <div class="pl-gc-msg-meta">
                  <span class="pl-gc-msg-author">${authorName}</span>
                  <span class="pl-gc-msg-role-tag ${roleClass}">${roleTag}</span>
                  <span class="pl-gc-msg-time-inline">${msg.time}</span>
                </div>
                <div class="pl-gc-bubble">${msg.text}</div>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Quick Replies & Input Bar -->
      <div class="pl-gc-input-area ${isOffline ? 'pl-offline-input-area' : ''}">
        ${!hasMessages ? `
          <div class="pl-gc-quick-replies">
            <button type="button" class="pl-gc-chip ${isOffline ? 'pl-chip-disabled' : ''}" onclick="sendPlayerGcQuickReply('Hello!')" ${isOffline ? 'title="No internet connection"' : ''}>
              👋 Hello!
            </button>
          </div>
          <div class="pl-gc-input-bar">
            <input type="text" id="pl-gc-text-input" placeholder="${isOffline ? '⚠️ Offline — Connect to Wi-Fi to send messages...' : 'Say \"Hello\" to greet the team...'}" maxlength="200" onkeydown="if(event.key==='Enter') sendCustomPlayerGcMessage()">
            <button type="button" class="pl-gc-send-btn ${isOffline ? 'pl-btn-offline' : ''}" onclick="sendCustomPlayerGcMessage()">
              ${isOffline ? 'Offline ⚠️' : 'Send 📨'}
            </button>
          </div>
        ` : `
          <div style="padding:4px 8px;text-align:center;">
            <span style="font-size:12px;color:#86efac;font-weight:600;">✓ You greeted the team! Welcome to the squad, Alex.</span>
          </div>
        `}
      </div>
    </div>
  `;

  // Auto-scroll to bottom of messages
  setTimeout(() => {
    const list = document.getElementById('pl-gc-messages-list');
    if (list) list.scrollTop = list.scrollHeight;
  }, 60);
}

function sendPlayerGcQuickReply(text) {
  sendPlayerGcMessage('Hello!');
}

function sendCustomPlayerGcMessage() {
  const input = document.getElementById('pl-gc-text-input');
  if (input) input.value = '';
  sendPlayerGcMessage('Hello!');
}

function sendPlayerGcMessage(text) {
  if (!text) return;

  const conn = getPhoneLinkConnectionStatus();
  if (!conn.isBluetoothConnected) {
    if (typeof showToast === 'function') {
      showToast('🔴 Phone disconnected. Turn on Bluetooth on your PC to connect your phone.', 'error');
    }
    return;
  }
  if (!conn.isInternetConnected) {
    if (typeof showToast === 'function') {
      showToast('⚠️ No internet connection. Turn on Wi-Fi to send messages.', 'warning');
    }
    if (typeof AudioManager !== 'undefined' && AudioManager.playAlert) {
      AudioManager.playAlert();
    }
    const input = document.getElementById('pl-gc-text-input');
    if (input) {
      input.classList.add('pl-input-error');
      setTimeout(() => input.classList.remove('pl-input-error'), 600);
    }
    return;
  }

  const state = loadNewbieGcState();
  if (!state.playerMessages) state.playerMessages = [];

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const playerMsg = {
    id: 'p_' + Date.now(),
    from: 'alex',
    isPlayer: true,
    author: 'Alex (You)',
    roleTag: 'ALEX (YOU)',
    roleClass: 'pl-gc-role-you',
    avatar: 'assets/Character/Alex.png',
    time: timeStr,
    text: 'Hello!'
  };

  state.playerMessages.push(playerMsg);
  saveNewbieGcState(state);

  if (typeof AudioManager !== 'undefined' && AudioManager.playClick) {
    AudioManager.playClick();
  }

  const content = document.getElementById('pl-tab-content');
  if (content) {
    renderNewbieGcChat(content);
  }

  // Teammates dynamic multi-step response with typing indicators and notification sounds
  scheduleTeammateResponse('Hello!');
}

function showGcTypingIndicator(name) {
  const list = document.getElementById('pl-gc-messages-list');
  if (!list) return;
  const existing = document.getElementById('pl-gc-typing-row');
  if (existing) existing.remove();
  const typing = document.createElement('div');
  typing.id = 'pl-gc-typing-row';
  typing.className = 'pl-gc-typing-pill';
  typing.innerHTML = `<span>💬</span> <span>${escapeHtml(name)} is typing...</span>`;
  list.appendChild(typing);
  list.scrollTop = list.scrollHeight;
}

function removeGcTypingIndicator() {
  const existing = document.getElementById('pl-gc-typing-row');
  if (existing) existing.remove();
}

function scheduleTeammateResponse(playerText) {
  showGcTypingIndicator('Ryan');

  // Step 1: Ryan warmly welcomes Alex to the team
  setTimeout(() => {
    removeGcTypingIndicator();
    const state = loadNewbieGcState();
    if (!state.playerMessages) state.playerMessages = [];

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const ryanReply = {
      id: 'r_' + Date.now(),
      from: 'ryan',
      author: 'Ryan',
      roleTag: 'CREATOR',
      roleClass: 'pl-gc-role-mentor',
      avatar: 'assets/Character/Ryan.png',
      time: timeStr,
      text: "Welcome, new intern! 🎉 So glad you're officially on the team, Alex! You handled those phishing threats like a pro today. Take a quick breather—we're excited to work with you!"
    };

    state.playerMessages.push(ryanReply);
    saveNewbieGcState(state);

    if (typeof AudioManager !== 'undefined' && AudioManager.playNotification) {
      AudioManager.playNotification();
    }

    const content = document.getElementById('pl-tab-content');
    if (content) renderNewbieGcChat(content);

    // Step 2: Pia welcomes Alex
    setTimeout(() => {
      showGcTypingIndicator('Pia');

      setTimeout(() => {
        removeGcTypingIndicator();
        const pState = loadNewbieGcState();
        if (!pState.playerMessages) pState.playerMessages = [];
        const pNow = new Date();
        const pTime = pNow.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const piaReply = {
          id: 'r_' + Date.now(),
          from: 'pia',
          author: 'Pia',
          roleTag: 'ANALYST',
          roleClass: 'pl-gc-role-analyst',
          avatar: 'assets/Character/Pia.png',
          time: pTime,
          text: "Welcome aboard, Alex! 😄 Don't hesitate to reach out if you ever need a second pair of eyes on suspicious links or weird emails. We've got your back!"
        };

        pState.playerMessages.push(piaReply);
        saveNewbieGcState(pState);

        if (typeof AudioManager !== 'undefined' && AudioManager.playNotification) {
          AudioManager.playNotification();
        }

        const pContent = document.getElementById('pl-tab-content');
        if (pContent) renderNewbieGcChat(pContent);

        // Step 3: Ethan adds SysAdmin welcome
        setTimeout(() => {
          showGcTypingIndicator('Ethan');

          setTimeout(() => {
            removeGcTypingIndicator();
            const eState = loadNewbieGcState();
            if (!eState.playerMessages) eState.playerMessages = [];
            const eNow = new Date();
            const eTime = eNow.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            const ethanReply = {
              id: 'r_' + Date.now(),
              from: 'ethan',
              author: 'Ethan',
              roleTag: 'SYSADMIN',
              roleClass: 'pl-gc-role-sysadmin',
              avatar: 'assets/Character/Ethan.png',
              time: eTime,
              text: "Welcome to the squad, Alex! 💻 Your security clearance and workstation accounts are all set up. Glad to have you with us!"
            };

            eState.playerMessages.push(ethanReply);
            saveNewbieGcState(eState);

            if (typeof AudioManager !== 'undefined' && AudioManager.playNotification) {
              AudioManager.playNotification();
            }

            const eContent = document.getElementById('pl-tab-content');
            if (eContent) renderNewbieGcChat(eContent);
          }, 850);
        }, 700);
      }, 850);
    }, 700);
  }, 850);
}

function openPhoneConversation(contactId) {
  const conn = getPhoneLinkConnectionStatus();
  if (!conn.isBluetoothConnected) {
    updatePhoneLinkConnectionState();
    return;
  }

  g4ActiveConvo = contactId;
  switchPhoneTab('messages');

  const content = document.getElementById('pl-tab-content');
  if (!content) return;

  const contact = G4_CONTACTS.find(c => c.id === contactId);
  const bannerHtml = !conn.isInternetConnected ? renderNoInternetBannerHtml() : '';

  content.innerHTML = `
    <div class="pl-convo-view">
      <div class="pl-convo-header">
        <button class="pl-back-btn" onclick="switchPhoneTab('messages')">← Back</button>
        <div class="pl-convo-name">${contact?.name || contactId}</div>
      </div>
      ${bannerHtml}
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
