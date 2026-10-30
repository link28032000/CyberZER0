'use strict';

// ── PHONELINK APP ─────────────────────────────────────────────

// ═══════════════════════════════════════════════════════════════
// NEW INTERN GROUP CHAT: "new intern team 2027"
// ═══════════════════════════════════════════════════════════════

const NEWBIE_GC_STORAGE_KEY = 'cyberzero_newbie_gc_state';

// ── 4-CHARACTER ROSTER FOR PHONE LINK SIMULATION ──────────────
const CHAR_ROSTER = {
  alex: {
    id: 'alex',
    name: 'Alex',
    displayName: 'Alex (You)',
    avatar: 'assets/Character/Alex.png',
    roleTag: 'ALEX (YOU)',
    roleClass: 'pl-gc-role-you',
    phoneDeviceName: "Alex's Phone",
    quickReplies: ['Hello po.'],
    chapterNum: 1
  },
  ethan: {
    id: 'ethan',
    name: 'Ethan',
    displayName: 'Ethan (You)',
    avatar: 'assets/Character/Ethan.png',
    roleTag: 'ETHAN (YOU)',
    roleClass: 'pl-gc-role-sysadmin',
    phoneDeviceName: "Ethan's Phone",
    quickReplies: ["Alex, it’s me, your high school classmate!"],
    chapterNum: 2
  },
  pia: {
    id: 'pia',
    name: 'Pia',
    displayName: 'Pia (You)',
    avatar: 'assets/Character/Pia.png',
    roleTag: 'PIA (YOU)',
    roleClass: 'pl-gc-role-analyst',
    phoneDeviceName: "Pia's Phone",
    quickReplies: ['Hi team,'],
    chapterNum: 3
  },
  ryan: {
    id: 'ryan',
    name: 'Ryan',
    displayName: 'Ryan (You)',
    avatar: 'assets/Character/Ryan.png',
    roleTag: 'RYAN (YOU)',
    roleClass: 'pl-gc-role-mentor',
    phoneDeviceName: "Ryan's Phone",
    quickReplies: ['Team, status report on incident containment!'],
    chapterNum: 4
  }
};

function getCurrentPhoneCharacter() {
  const curCatId = window._currentChapterCategory || (typeof activeCategoryStory !== 'undefined' ? activeCategoryStory : null) || (typeof gameState !== 'undefined' ? gameState.phase : null) || 'phishing';

  if (curCatId === 'malware' || curCatId === 2 || curCatId === 'ch2') {
    return CHAR_ROSTER.ethan;
  }
  if (curCatId === 'social_engineering' || curCatId === 'social' || curCatId === 'social-engineering' || curCatId === 3 || curCatId === 'ch3') {
    return CHAR_ROSTER.pia;
  }
  if (curCatId === 'ransomware' || curCatId === 4 || curCatId === 'ch4') {
    return CHAR_ROSTER.ryan;
  }
  return CHAR_ROSTER.alex;
}

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
      name: 'Alex',
      role: 'IT Support Trainee & Security Recruit',
      roleTag: 'ALEX',
      roleClass: 'pl-gc-role-you',
      avatar: 'assets/Character/Alex.png',
      status: 'Online'
    }
  ],
  defaultMessages: []
};

function loadNewbieGcState() {
  try {
    const raw = localStorage.getItem(NEWBIE_GC_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed === 'object' && parsed !== null) {
        if (!Array.isArray(parsed.playerMessages)) parsed.playerMessages = [];
        parsed.playerMessages = parsed.playerMessages.filter(m =>
          m.id !== 'ryan_initial_welcome' &&
          m.text !== 'I created this group for new interns welcoming them.' &&
          m.id !== 'init_ryan_1' &&
          m.id !== 'init_alex_1'
        );
        return parsed;
      }
    }
  } catch (e) {}
  return {
    created: false,
    joined: false,
    hasUnread: false,
    seenByRyan: false,
    playerMessages: []
  };
}

function saveNewbieGcState(state) {
  try {
    localStorage.setItem(NEWBIE_GC_STORAGE_KEY, JSON.stringify(state));
  } catch (e) {}
}

function isNewbieGcActive() {
  const curCatId = window._currentChapterCategory || (typeof activeCategoryStory !== 'undefined' ? activeCategoryStory : null) || (typeof gameState !== 'undefined' ? gameState.phase : null) || 'phishing';
  // In Chapter 2, Chapter 3, and Chapter 4, Phone Link group chat is always active!
  if (curCatId !== 'phishing' && curCatId !== 'mission') {
    return true;
  }
  // During Chapter 1 / first checklist, Phone Link group chat is strictly INACTIVE until the award is claimed
  if (typeof window !== 'undefined' && !window._awardClaimed) {
    return false;
  }
  return true;
}

function setNewbieGcCreated(andHighlight = false) {
  const state = loadNewbieGcState();
  state.created = true;
  state.joined = true;
  state.accepted = true;
  state.hasUnread = false;
  saveNewbieGcState(state);
  updatePhoneLinkBadges();
  // Never glow phone link desktop icon — user follows sticky notes checklist
  unhighlightPhoneLinkApp();
}

// Backward-compatibility alias
function setNewbieGcInvitePending(andHighlight = false) {
  setNewbieGcCreated(andHighlight);
}

function highlightPhoneLinkApp() {
  // Glowing notice on Phone Link desktop icon is removed — user follows sticky notes checklist
  unhighlightPhoneLinkApp();
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
  const curChar = getCurrentPhoneCharacter();
  const devNameEl = document.querySelector('.pl-device-name');
  if (devNameEl) {
    devNameEl.textContent = `📱 ${curChar.phoneDeviceName}`;
  }
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
  updatePhoneLinkConnectionState();
}

function renderPhoneFrame() {
  const curChar = getCurrentPhoneCharacter();
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

  const timeEl = document.getElementById('pl-phone-time');
  if (timeEl) timeEl.textContent = timeStr;

  const widgetTime = document.getElementById('pl-phone-widget-time');
  if (widgetTime) widgetTime.textContent = timeStr;

  const widgetDate = document.getElementById('pl-phone-widget-date');
  if (widgetDate) widgetDate.textContent = dateStr;

  const devNameEl = document.querySelector('.pl-device-name');
  if (devNameEl) {
    devNameEl.textContent = `📱 ${curChar.phoneDeviceName}`;
  }
}

function showPhoneHomeScreen() {
  g4PhoneScreenView = 'home';
  const phoneContent = document.getElementById('pl-phone-content');
  if (!phoneContent) return;

  const curChar = getCurrentPhoneCharacter();
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

  phoneContent.innerHTML = `
    <div class="pl-phone-home-view">
      <!-- Active User Profile Chip -->
      <div class="pl-phone-user-chip" style="display:flex;align-items:center;gap:6px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);border-radius:20px;padding:3px 8px;margin-bottom:8px;">
        <img src="${curChar.avatar}" alt="${curChar.name}" style="width:18px;height:18px;border-radius:50%;object-fit:cover;border:1px solid #38bdf8;">
        <span style="font-size:9.5px;font-weight:700;color:#f8fafc;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${curChar.displayName}</span>
      </div>
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
    const curChar = getCurrentPhoneCharacter();
    const hasPlayerMsgs = gcState.playerMessages && gcState.playerMessages.length > 0;
    const lastMsg = hasPlayerMsgs ? gcState.playerMessages[gcState.playerMessages.length - 1] : null;
    const lastSender = lastMsg ? (lastMsg.from === curChar.id ? curChar.displayName : (lastMsg.author || lastMsg.from)) : '';
    const lastMsgPreview = lastMsg
      ? `${lastSender}: ${lastMsg.text}`
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
              ${escapeHtml(lastMsgPreview)}
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
    const curChar = getCurrentPhoneCharacter();
    const lastMsg = hasPlayerMsgs ? gcState.playerMessages[gcState.playerMessages.length - 1] : null;
    const lastSender = lastMsg ? (lastMsg.from === curChar.id ? curChar.displayName : (lastMsg.author || lastMsg.from)) : '';
    const preview = lastMsg
      ? `${lastSender}: ${lastMsg.text}`
      : `Ryan added you`;
    const timeStr = lastMsg ? lastMsg.time : '10:49 AM';

    html += `
      <div class="pl-contact-row" onclick="openNewbieGcConversation()" title="${NEWBIE_GC_INFO.name}">
        <div class="pl-contact-avatar pl-gc-avatar-stack">👥</div>
        <div class="pl-contact-info">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2px;">
            <span class="pl-contact-name">${NEWBIE_GC_INFO.name}</span>
            <span class="pl-gc-tag-active">👥 4 MEMBERS</span>
          </div>
          <div class="pl-contact-meta" style="display:flex;justify-content:space-between;align-items:center;">
            <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:320px;">${escapeHtml(preview)}</span>
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
  if (!isNewbieGcActive()) {
    switchPhoneTab('messages');
    return;
  }

  // Ensure network and bluetooth connections are active so group chat opens seamlessly
  if (typeof networkSettings !== 'undefined') {
    if (!networkSettings.bluetooth) networkSettings.bluetooth = true;
    if (!networkSettings.wifi) networkSettings.wifi = true;
    if (!networkSettings.currentSsid) networkSettings.currentSsid = 'HomeNetwork_5G';
    networkSettings.noInternet = false;
    networkSettings.airplane = false;
  }
  g4ActiveConvo = 'business_newbie_gc';
  switchPhoneTab('messages');

  const content = document.getElementById('pl-tab-content');
  if (!content) return;

  const curChar = getCurrentPhoneCharacter();
  const state = loadNewbieGcState();
  if (!Array.isArray(state.playerMessages)) state.playerMessages = [];

  // Remove any old dummy test messages
  state.playerMessages = state.playerMessages.filter(m =>
    m.id !== 'ryan_initial_welcome' &&
    m.text !== 'I created this group for new interns welcoming them.' &&
    m.id !== 'init_ryan_1' &&
    m.id !== 'init_alex_1'
  );

  // Chapter 1: Strictly NO messages initially. Alex (You) must manually send "Hello po."
  if (curChar.id === 'alex') {
    const hasAlexHello = state.playerMessages.some(m => (m.from === 'alex' || m.isPlayer) && m.text.toLowerCase().includes('hello'));
    if (!hasAlexHello) {
      state.playerMessages = [];
      state.ryanWelcomedAlex = false;
    }
  } else if (curChar.id === 'ethan') {
    // In Chapter 2 (Ethan): ensure Chapter 1 history is present
    const hasCh1Hello = state.playerMessages.some(m => m.from === 'alex' && m.text.toLowerCase().includes('hello'));
    if (!hasCh1Hello) {
      state.playerMessages = [
        {
          id: 'ch1_alex_hello',
          from: 'alex',
          author: 'Alex',
          roleTag: 'ALEX',
          roleClass: 'pl-gc-role-you',
          avatar: 'assets/Character/Alex.png',
          time: '9:00 AM',
          text: 'Hello po.'
        },
        {
          id: 'ch1_ryan_welcome',
          from: 'ryan',
          author: 'Ryan',
          roleTag: 'CREATOR',
          roleClass: 'pl-gc-role-mentor',
          avatar: 'assets/Character/Ryan.png',
          time: '9:01 AM',
          text: 'Welcome to the group, Alex!'
        }
      ];
      state.ryanWelcomedAlex = true;
    }
  } else if (curChar.id === 'pia') {
    // In Chapter 3 (Pia): ensure Chapter 1 & 2 history is present
    const hasCh2Ethan = state.playerMessages.some(m => m.from === 'ethan');
    if (!hasCh2Ethan) {
      state.playerMessages = [
        {
          id: 'ch1_alex_hello',
          from: 'alex',
          author: 'Alex',
          roleTag: 'ALEX',
          roleClass: 'pl-gc-role-you',
          avatar: 'assets/Character/Alex.png',
          time: '9:00 AM',
          text: 'Hello po.'
        },
        {
          id: 'ch1_ryan_welcome',
          from: 'ryan',
          author: 'Ryan',
          roleTag: 'CREATOR',
          roleClass: 'pl-gc-role-mentor',
          avatar: 'assets/Character/Ryan.png',
          time: '9:01 AM',
          text: 'Welcome to the group, Alex!'
        },
        {
          id: 'ch2_ethan_msg',
          from: 'ethan',
          author: 'Ethan',
          roleTag: 'SYSADMIN',
          roleClass: 'pl-gc-role-sysadmin',
          avatar: 'assets/Character/Ethan.png',
          time: '9:15 AM',
          text: 'Alex, it’s me, your high school classmate!'
        },
        {
          id: 'ch2_alex_reply',
          from: 'alex',
          author: 'Alex',
          roleTag: 'ALEX',
          roleClass: 'pl-gc-role-you',
          avatar: 'assets/Character/Alex.png',
          time: '9:16 AM',
          text: 'What, Ryan?'
        }
      ];
      state.ryanWelcomedAlex = true;
      state.alexRepliedEthan = true;
    }
  }

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

function renderNewbieGcChat(container, options = {}) {
  const state = loadNewbieGcState();
  const conn = getPhoneLinkConnectionStatus();
  const isOffline = !conn.isInternetConnected && !conn.isBluetoothConnected;
  const bannerHtml = isOffline ? renderNoInternetBannerHtml() : '';
  const curChar = getCurrentPhoneCharacter();

  const allMessages = state.playerMessages || [];

  const existingInput = document.getElementById('pl-gc-text-input');
  const preservedText = existingInput ? existingInput.value : '';

  container.innerHTML = `
    <div class="pl-convo-view" style="display:flex;flex-direction:column;height:100%;background:#090e18;">
      <!-- Header -->
      <div class="pl-convo-header" style="background:#0f172a;border-bottom:1px solid rgba(255,255,255,0.08);padding:10px 16px;display:flex;align-items:center;gap:12px;">
        <button class="pl-back-btn" onclick="switchPhoneTab('messages')">← Back</button>
        <div class="pl-contact-avatar pl-gc-avatar-stack" style="width:34px;height:34px;font-size:16px;">👥</div>
        <div class="pl-gc-header-info">
          <div class="pl-convo-name" style="font-size:13.5px;font-weight:800;color:#ffffff;line-height:1.2;">${NEWBIE_GC_INFO.name}</div>
          <div class="pl-gc-members-summary">Group created by Ryan · 4 members (Ryan, Ethan, Pia, Alex) · <span style="color:#22c55e;">🟢 Online</span></div>
        </div>
      </div>

      <!-- Optional No Internet Banner -->
      ${bannerHtml}

      <!-- Messages Thread -->
      <div class="pl-convo-messages" id="pl-gc-messages-list" style="flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px;">
        <!-- Group system creation event -->
        <div class="pl-gc-system-events-container">
          <div class="pl-gc-system-pill">
            👑 <strong>Ryan${curChar.id === 'ryan' ? ' (You)' : ''}</strong> created group <strong>"${NEWBIE_GC_INFO.name}"</strong>
          </div>
          ${curChar.id === 'alex' ? `
            <div class="pl-gc-system-pill pl-gc-pill-you">
              👋 <strong>Ryan</strong> added <strong>Alex (You)</strong>
            </div>
          ` : curChar.id === 'ethan' ? `
            <div class="pl-gc-system-pill">
              👋 <strong>Ryan</strong> added <strong>Alex</strong>
            </div>
            <div class="pl-gc-system-pill pl-gc-pill-you">
              👋 <strong>Ryan</strong> added <strong>Ethan (You)</strong>
            </div>
          ` : curChar.id === 'pia' ? `
            <div class="pl-gc-system-pill">
              👋 <strong>Ryan</strong> added <strong>Alex</strong> and <strong>Ethan</strong>
            </div>
            <div class="pl-gc-system-pill pl-gc-pill-you">
              👋 <strong>Ryan</strong> added <strong>Pia (You)</strong>
            </div>
          ` : `
            <div class="pl-gc-system-pill pl-gc-pill-you">
              👋 <strong>Ryan (You)</strong> added <strong>Alex, Ethan, Pia</strong>
            </div>
          `}
        </div>

        ${allMessages.map((msg, idx) => {
          const isMine = (msg.from === curChar.id) || (msg.isPlayer && msg.playerCharId === curChar.id) || (msg.from === 'player' && (!msg.playerCharId || msg.playerCharId === curChar.id));

          let authorName = '';
          let avatarSrc = '';
          let roleTag = '';
          let roleClass = '';

          if (isMine) {
            authorName = curChar.displayName;
            avatarSrc = curChar.avatar;
            roleTag = curChar.roleTag;
            roleClass = curChar.roleClass;
          } else {
            const senderRoster = CHAR_ROSTER[msg.from];
            authorName = senderRoster ? senderRoster.name : (msg.author || 'Teammate');
            avatarSrc = senderRoster ? senderRoster.avatar : (msg.avatar || 'assets/Character/Ryan.png');
            roleTag = senderRoster ? senderRoster.roleTag.replace(' (YOU)', '') : (msg.roleTag || 'MEMBER');
            roleClass = senderRoster ? senderRoster.roleClass : (msg.roleClass || 'pl-gc-role-mentor');
          }

          let seenReceiptHtml = '';
          if (isMine) {
            const isLatestMine = !allMessages.slice(idx + 1).some(m => (m.from === curChar.id) || (m.isPlayer && m.playerCharId === curChar.id));
            if (isLatestMine) {
              if (state.seenByRyan) {
                seenReceiptHtml = `
                  <div class="pl-gc-seen-row" title="Seen by Team">
                    <span class="pl-gc-seen-label">Seen</span>
                    <img src="assets/Character/Ryan.png" class="pl-gc-seen-avatar" alt="Ryan" title="Seen by Ryan">
                  </div>
                `;
              } else {
                seenReceiptHtml = `
                  <div class="pl-gc-seen-row" title="Sent">
                    <span class="pl-gc-seen-label" style="color:#64748b;">✓ Sent</span>
                  </div>
                `;
              }
            }
          }

          const isNew = !!msg.isNew;
          const animClass = isNew ? 'pl-msg-new' : '';

          return `
            <div class="pl-gc-msg-item ${isMine ? 'mine' : 'theirs'} ${animClass}">
              <img src="${avatarSrc}" class="pl-gc-msg-avatar ${isMine ? 'avatar-mine' : ''}" alt="${escapeHtml(authorName)}">
              <div class="pl-gc-msg-col">
                <div class="pl-gc-msg-meta">
                  <span class="pl-gc-msg-author">${escapeHtml(authorName)}</span>
                  <span class="pl-gc-msg-role-tag ${roleClass}">${escapeHtml(roleTag)}</span>
                  <span class="pl-gc-msg-time-inline">${msg.time}</span>
                </div>
                <div class="pl-gc-bubble">${escapeHtml(msg.text)}</div>
                ${seenReceiptHtml}
              </div>
            </div>
          `;
        }).join('')}

        ${state.typingMember ? `
          <div class="pl-gc-msg-item theirs pl-typing-active" id="pl-gc-typing-item">
            <img src="${state.typingMember.avatar}" class="pl-gc-msg-avatar" alt="${escapeHtml(state.typingMember.name)}">
            <div class="pl-gc-msg-col">
              <div class="pl-gc-msg-meta">
                <span class="pl-gc-msg-author">${escapeHtml(state.typingMember.name)}</span>
                <span class="pl-gc-msg-role-tag ${state.typingMember.roleClass}">${escapeHtml(state.typingMember.roleTag)}</span>
              </div>
              <div class="pl-gc-bubble pl-gc-typing-bubble">
                <span class="pl-typing-dots" aria-hidden="true">
                  <span class="pl-typing-dot"></span>
                  <span class="pl-typing-dot"></span>
                  <span class="pl-typing-dot"></span>
                </span>
                <span class="pl-typing-label">${escapeHtml(state.typingMember.name)} is typing…</span>
              </div>
            </div>
          </div>
        ` : (state.ryanIsTyping ? `
          <div class="pl-gc-msg-item theirs pl-typing-active" id="pl-gc-typing-item">
            <img src="assets/Character/Ryan.png" class="pl-gc-msg-avatar" alt="Ryan">
            <div class="pl-gc-msg-col">
              <div class="pl-gc-msg-meta">
                <span class="pl-gc-msg-author">Ryan</span>
                <span class="pl-gc-msg-role-tag pl-gc-role-mentor">CREATOR</span>
              </div>
              <div class="pl-gc-bubble pl-gc-typing-bubble">
                <span class="pl-typing-dots" aria-hidden="true">
                  <span class="pl-typing-dot"></span>
                  <span class="pl-typing-dot"></span>
                  <span class="pl-typing-dot"></span>
                </span>
                <span class="pl-typing-label">Ryan is typing…</span>
              </div>
            </div>
          </div>
        ` : '')}
      </div>

      <!-- Quick Replies & Input Bar -->
      <div class="pl-gc-input-area">
        <div class="pl-gc-quick-replies" style="display:flex;gap:8px;padding:4px 0;flex-wrap:wrap;">
          ${curChar.quickReplies.map(qr => `
            <button type="button" class="pl-gc-chip ${((curChar.id === 'alex' && allMessages.length === 0) || (curChar.id === 'ethan' && !state.alexRepliedEthan) || (curChar.id === 'pia' && !state.piaWelcomed)) ? 'pl-gc-chip-highlight' : ''}" data-qr="${escapeHtml(qr)}" onclick="sendPlayerGcQuickReply(this.getAttribute('data-qr'))" style="cursor:pointer;background:rgba(56,189,248,0.2);border:1.5px solid #38bdf8;color:#f0f9ff;font-weight:700;display:inline-flex;align-items:center;gap:6px;border-radius:14px;padding:5px 12px;font-size:12px;box-shadow:0 2px 8px rgba(56,189,248,0.25);" title="Click to send">
              <span>💬</span> <span>${escapeHtml(qr)}</span> <span style="font-size:10px;color:#7dd3fc;margin-left:2px;">(Click to send)</span>
            </button>
          `).join('')}
        </div>
        <div class="pl-gc-input-bar">
          <input type="text" id="pl-gc-text-input" placeholder="${curChar.id === 'alex' ? 'Click &quot;Hello po.&quot; above or type here...' : curChar.id === 'ethan' ? 'Click message above or type here...' : curChar.id === 'pia' ? 'Click &quot;Hi team,&quot; above or type here...' : `Message as ${curChar.name}...`}" maxlength="200" autocomplete="off" onkeydown="if(event.key==='Enter') sendCustomPlayerGcMessage()">
          <button type="button" class="pl-gc-send-btn" onclick="sendCustomPlayerGcMessage()">
            Send 📨
          </button>
        </div>
      </div>
    </div>
  `;

  // Explicitly wire quick reply buttons to guarantee automatic sending on click
  const targetWrap = container || document.getElementById('pl-tab-content');
  if (targetWrap && typeof targetWrap.querySelectorAll === 'function') {
    targetWrap.querySelectorAll('.pl-gc-chip').forEach(btn => {
      btn.onclick = function(e) {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        const text = this.getAttribute('data-qr') || (curChar.quickReplies && curChar.quickReplies[0]) || 'Hello po.';
        sendPlayerGcQuickReply(text);
      };
    });
  }

  // Restore preserved input text if user had already begun typing
  const inp = document.getElementById('pl-gc-text-input');
  if (inp && preservedText) {
    inp.value = preservedText;
  }

  // Auto-scroll to latest message: smooth on send/receive/typing, instant on initial open
  const isSmooth = !!options.smoothScroll;
  const list = document.getElementById('pl-gc-messages-list');
  if (list) {
    if (isSmooth) {
      list.scrollTo({ top: list.scrollHeight, behavior: 'smooth' });
      setTimeout(() => {
        const l2 = document.getElementById('pl-gc-messages-list');
        if (l2) l2.scrollTo({ top: l2.scrollHeight, behavior: 'smooth' });
      }, 70);
    } else {
      list.scrollTop = list.scrollHeight;
      setTimeout(() => {
        const l2 = document.getElementById('pl-gc-messages-list');
        if (l2) l2.scrollTop = l2.scrollHeight;
      }, 40);
    }
  }

  if (inp && options.focusInput !== false) {
    setTimeout(() => {
      const i2 = document.getElementById('pl-gc-text-input');
      if (i2 && document.activeElement !== i2 && !options.noFocus) {
        i2.focus();
      }
    }, 60);
  }

  // Clear isNew flag on messages after their animation finishes (400ms)
  let hadNew = false;
  allMessages.forEach(m => {
    if (m.isNew) {
      hadNew = true;
      m.isNew = false;
    }
  });
  if (hadNew) {
    setTimeout(() => {
      saveNewbieGcState(state);
    }, 450);
  }
}

function sendPlayerGcQuickReply(text) {
  const curChar = getCurrentPhoneCharacter();
  let msg = text;
  if (!msg || typeof msg !== 'string') {
    msg = (curChar && curChar.quickReplies && curChar.quickReplies[0]) ? curChar.quickReplies[0] : 'Hello po.';
  }
  const input = document.getElementById('pl-gc-text-input');
  if (input) input.value = '';
  sendPlayerGcMessage(msg);
}

function sendCustomPlayerGcMessage() {
  const input = document.getElementById('pl-gc-text-input');
  let typed = input ? (input.value || '').trim() : '';
  const curChar = getCurrentPhoneCharacter();
  if (!typed) {
    if (curChar.id === 'alex') {
      typed = 'Hello po.';
    } else if (curChar.id === 'ethan') {
      typed = "Alex, it\u2019s me, your high school classmate!";
    } else if (curChar.id === 'pia') {
      typed = 'Hi team,';
    } else {
      if (input) input.focus();
      return;
    }
  }
  if (input) input.value = '';
  sendPlayerGcMessage(typed);
}

function sendPlayerGcMessage(text) {
  if (window._isSendingGcMessage) return;
  window._isSendingGcMessage = true;
  setTimeout(() => { window._isSendingGcMessage = false; }, 400);

  const curChar = getCurrentPhoneCharacter();
  const state = loadNewbieGcState();
  const msgText = (text && typeof text === 'string' && text.trim().length > 0)
    ? text.trim()
    : curChar.quickReplies[0];

  if (!msgText) return;

  // Auto-ensure connection state is restored
  if (typeof networkSettings !== 'undefined') {
    if (!networkSettings.bluetooth) networkSettings.bluetooth = true;
    if (!networkSettings.wifi) networkSettings.wifi = true;
    if (!networkSettings.currentSsid) networkSettings.currentSsid = 'HomeNetwork_5G';
    networkSettings.noInternet = false;
    networkSettings.airplane = false;
  }

  if (!state.playerMessages) state.playerMessages = [];

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const playerMsg = {
    id: 'p_' + Date.now(),
    from: curChar.id,
    playerCharId: curChar.id,
    isPlayer: true,
    author: curChar.displayName,
    roleTag: curChar.roleTag,
    roleClass: curChar.roleClass,
    avatar: curChar.avatar,
    time: timeStr,
    text: msgText,
    isNew: true
  };

  state.playerMessages.push(playerMsg);
  state.seenByRyan = false;
  saveNewbieGcState(state);

  if (typeof AudioManager !== 'undefined' && AudioManager.playClick) {
    AudioManager.playClick();
  }

  const content = document.getElementById('pl-tab-content');
  if (content) {
    renderNewbieGcChat(content, { smoothScroll: true });
  }

  if (typeof showToast === 'function') {
    showToast(`💬 Sent: "${msgText}"`, 'success');
  }

  // Notify Chapter 1 post-award checklist that player sent a message in Phone Link
  if (typeof window._notifyPostAwardHelloSent === 'function') {
    const isHello = (msgText || '').toLowerCase().includes('hello');
    if (isHello || (curChar && curChar.id === 'alex')) {
      window._notifyPostAwardHelloSent();
    }
  }

  // Trigger simulated teammate replies
  triggerTeammateReplies(curChar, msgText);
}

function triggerTeammateReplies(curChar, msgText) {
  const state = loadNewbieGcState();
  let repliers = [];
  const lower = (msgText || '').toLowerCase();

  if (curChar.id === 'alex') {
    // ── Chapter 1: Ryan’s Group Chat ──
    // - Alex (You) must manually send the first message: “Hello po.”
    // - After Alex sends the message, show the typing indicator (“Ryan is typing…”).
    // - Ryan should automatically reply with: “Welcome to the group, Alex!”
    // - All other messages must be sent manually by the user. Do not automate any additional replies.
    if (!state.ryanWelcomedAlex) {
      state.ryanWelcomedAlex = true;
      saveNewbieGcState(state);
      repliers.push({
        member: CHAR_ROSTER.ryan,
        text: 'Welcome to the group, Alex!',
        delay: 850,
        typingDuration: 1200
      });
    } else {
      // Do not automate any additional replies
      setTimeout(() => {
        const sState = loadNewbieGcState();
        sState.seenByRyan = true;
        saveNewbieGcState(sState);
        const c = document.getElementById('pl-tab-content');
        if (c && g4ActiveConvo === 'business_newbie_gc') renderNewbieGcChat(c, { smoothScroll: true });
      }, 700);
      return;
    }
  } else if (curChar.id === 'ethan') {
    // ── Chapter 2: Ethan’s Message ──
    // - Ethan manually sends Alex this message: “Alex, it’s me, your high school classmate!”
    // - Alex automatically replies: “What, Ryan?”
    if (!state.alexRepliedEthan) {
      state.alexRepliedEthan = true;
      saveNewbieGcState(state);
      repliers.push({
        member: CHAR_ROSTER.alex,
        text: 'What, Ryan?',
        delay: 850,
        typingDuration: 1100
      });
    } else {
      // All other messages must be sent manually by the user. Do not automate any additional replies.
      setTimeout(() => {
        const sState = loadNewbieGcState();
        sState.seenByRyan = true;
        saveNewbieGcState(sState);
        const c = document.getElementById('pl-tab-content');
        if (c && g4ActiveConvo === 'business_newbie_gc') renderNewbieGcChat(c, { smoothScroll: true });
      }, 700);
      return;
    }
  } else if (curChar.id === 'pia') {
    // ── Chapter 3: Pia ──
    if (!state.piaWelcomed) {
      state.piaWelcomed = true;
      saveNewbieGcState(state);
      repliers.push({
        member: CHAR_ROSTER.ryan,
        text: 'Welcome to the group, Pia!',
        delay: 850,
        typingDuration: 1200
      });
    } else {
      setTimeout(() => {
        const sState = loadNewbieGcState();
        sState.seenByRyan = true;
        saveNewbieGcState(sState);
        const c = document.getElementById('pl-tab-content');
        if (c && g4ActiveConvo === 'business_newbie_gc') renderNewbieGcChat(c, { smoothScroll: true });
      }, 700);
      return;
    }
  } else if (curChar.id === 'ryan') {
    // ── Chapter 4: Ryan ──
    if (!state.ryanCh4Prompted) {
      state.ryanCh4Prompted = true;
      saveNewbieGcState(state);
      repliers.push({
        member: CHAR_ROSTER.ethan,
        text: 'Workstations secure, Ryan!',
        delay: 850,
        typingDuration: 1100
      });
      repliers.push({
        member: CHAR_ROSTER.alex,
        text: 'Threats isolated, sir!',
        delay: 2400,
        typingDuration: 1100
      });
    }
  }

  repliers.forEach((rep) => {
    window._plTypingTimers = window._plTypingTimers || [];
    const t1 = setTimeout(() => {
      // Show typing indicator
      const tState = loadNewbieGcState();
      tState.seenByRyan = true;
      tState.typingMember = {
        name: rep.member.name,
        avatar: rep.member.avatar,
        roleTag: rep.member.roleTag.replace(' (YOU)', ''),
        roleClass: rep.member.roleClass
      };
      saveNewbieGcState(tState);
      const c1 = document.getElementById('pl-tab-content');
      if (c1 && g4ActiveConvo === 'business_newbie_gc') {
        renderNewbieGcChat(c1, { smoothScroll: true });
      }

      // Deliver message after typing duration
      const duration = rep.typingDuration || 1100;
      const t2 = setTimeout(() => {
        const sState = loadNewbieGcState();
        sState.typingMember = null;
        sState.seenByRyan = true;

        const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        sState.playerMessages.push({
          id: 'reply_' + rep.member.id + '_' + Date.now(),
          from: rep.member.id,
          author: rep.member.name,
          roleTag: rep.member.roleTag.replace(' (YOU)', ''),
          roleClass: rep.member.roleClass,
          avatar: rep.member.avatar,
          time: replyTime,
          text: rep.text,
          isNew: true
        });
        saveNewbieGcState(sState);

        const c2 = document.getElementById('pl-tab-content');
        if (c2 && g4ActiveConvo === 'business_newbie_gc') {
          renderNewbieGcChat(c2, { smoothScroll: true });
        }

        if (typeof AudioManager !== 'undefined' && AudioManager.playNotification) {
          AudioManager.playNotification();
        }

        if (typeof window._notifyPostAwardGcOpen === 'function') {
          window._notifyPostAwardGcOpen();
        }
      }, duration);
      window._plTypingTimers.push(t2);
    }, rep.delay);
    window._plTypingTimers.push(t1);
  });
}

function resetPhoneLinkChat() {
  if (Array.isArray(window._plTypingTimers)) {
    window._plTypingTimers.forEach(id => clearTimeout(id));
    window._plTypingTimers = [];
  }
  try {
    localStorage.removeItem(NEWBIE_GC_STORAGE_KEY);
  } catch(e) {}
  const content = document.getElementById('pl-tab-content');
  if (content && g4ActiveConvo === 'business_newbie_gc') {
    renderNewbieGcChat(content);
  }
}
window.resetPhoneLinkChat = resetPhoneLinkChat;
window.sendPlayerGcQuickReply = sendPlayerGcQuickReply;
window.sendPlayerGcMessage = sendPlayerGcMessage;
window.sendCustomPlayerGcMessage = sendCustomPlayerGcMessage;


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
