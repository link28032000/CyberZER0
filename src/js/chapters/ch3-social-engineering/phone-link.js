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
    quickReplies: [
      "Alex, it’s me, your high school classmate!",
      "Team, my workstation is detecting strange background processes.",
      "Anyone want to grab lunch after checking the network logs?",
      "SysAdmin station is up and running!"
    ],
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
  const isCh2 = (typeof _isChapter2Active === 'function' && _isChapter2Active());
  const curCatId = window._currentChapterCategory || (typeof activeCategoryStory !== 'undefined' ? activeCategoryStory : null) || (typeof gameState !== 'undefined' ? gameState.phase : null) || 'phishing';

  if (isCh2 || curCatId === 'malware' || curCatId === 2 || curCatId === 'ch2') {
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
  let isUnlocked = false;
  try {
    if (localStorage.getItem('cyberzero_gc_unlocked') === 'true') isUnlocked = true;
    if (typeof isChapter1CompletedAndSaved === 'function' && isChapter1CompletedAndSaved()) isUnlocked = true;
  } catch(e) {}

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
        if (isUnlocked) {
          parsed.created = true;
          parsed.joined = true;
        }
        return parsed;
      }
    }
  } catch (e) {}
  return {
    created: isUnlocked,
    joined: isUnlocked,
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
  // 1. In Chapter 2, Chapter 3, and Chapter 4, Phone Link group chat is always active!
  if (curCatId !== 'phishing' && curCatId !== 'mission') {
    return true;
  }
  // 2. If Chapter 1 was ever completed and saved, group chat is permanently restored
  if (typeof isChapter1CompletedAndSaved === 'function' && isChapter1CompletedAndSaved()) {
    return true;
  }
  // 3. If group chat was ever unlocked in storage or award was claimed
  try {
    if (localStorage.getItem('cyberzero_gc_unlocked') === 'true') return true;
    const rawGc = localStorage.getItem(NEWBIE_GC_STORAGE_KEY);
    if (rawGc) {
      const gc = JSON.parse(rawGc);
      if (gc && (gc.created || gc.joined || gc.accepted || (Array.isArray(gc.playerMessages) && gc.playerMessages.length > 0))) {
        return true;
      }
    }
    const rawAch = localStorage.getItem('cyberzero_claimed_achievements');
    if (rawAch) {
      const ach = JSON.parse(rawAch);
      if (ach && (ach['ach_phishing'] || ach['task_all_complete'])) return true;
    }
  } catch(e) {}
  // 4. During Chapter 1 / first checklist, Phone Link group chat is strictly INACTIVE until the award is claimed
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
  try {
    localStorage.setItem('cyberzero_gc_unlocked', 'true');
  } catch(e) {}
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

function isChapter1CompletedAndSaved() {
  let ch1Done = false;

  // 1. In-memory category completion
  if (typeof CATEGORIES !== 'undefined' && Array.isArray(CATEGORIES) && CATEGORIES[0] && CATEGORIES[0].completed) {
    ch1Done = true;
  }

  // 2. LocalStorage category completion
  if (!ch1Done) {
    try {
      const rawCat = localStorage.getItem('cyberzero_categories');
      if (rawCat) {
        const cats = JSON.parse(rawCat);
        if (Array.isArray(cats) && cats[0] && cats[0].completed) {
          ch1Done = true;
        }
      }
    } catch(e) {}
  }

  // 3. Claimed achievements or trophy
  if (!ch1Done && typeof _achievementUnlocked !== 'undefined' && _achievementUnlocked.has('ach_phishing')) {
    ch1Done = true;
  }
  if (!ch1Done) {
    try {
      const rawAch = localStorage.getItem('cyberzero_claimed_achievements');
      if (rawAch) {
        const achMap = JSON.parse(rawAch);
        if (achMap && (achMap['ach_phishing'] || achMap['task_all_complete'])) {
          ch1Done = true;
        }
      }
    } catch(e) {}
  }

  // 4. Post-test completed and award claimed
  if (!ch1Done) {
    const postTestFile = localStorage.getItem('cyberzero_posttest_result_file');
    const isAwardDone = (typeof window !== 'undefined' && window._awardClaimed) || (function(){
      try {
        const p = localStorage.getItem('cyberzero_phishing_progress');
        return p && JSON.parse(p).awardClaimed;
      } catch(e){ return false; }
    })();
    if (postTestFile && isAwardDone) {
      ch1Done = true;
    }
  }

  if (!ch1Done) return false;

  // Check saved progress
  let isSaved = false;
  try {
    const rawSess = localStorage.getItem('cyberzero_session_state');
    if (rawSess) {
      const sess = JSON.parse(rawSess);
      if (sess && (sess.savedAt || sess.ch1 || sess.activeChapter)) isSaved = true;
    }
  } catch(e) {}
  if (!isSaved) {
    try {
      if (localStorage.getItem('cyberzero_phishing_progress') || localStorage.getItem('cyberzero_categories')) {
        isSaved = true;
      }
    } catch(e) {}
  }

  return isSaved;
}
window.isChapter1CompletedAndSaved = isChapter1CompletedAndSaved;

// ── RYAN MENTOR & ALEX FRIEND DIRECT MESSAGE STORAGE ───────────
const RYAN_MENTOR_STORAGE_KEY = 'cyberzero_pl_ryan_mentor_msgs';
const RYAN_ETHAN_STORAGE_KEY = 'cyberzero_pl_ryan_ethan_msgs';
const ALEX_FRIEND_STORAGE_KEY = 'cyberzero_pl_alex_ethan_msgs';

function loadRyanMentorMessages() {
  const curChar = getCurrentPhoneCharacter();
  const isEthan = curChar.id === 'ethan';
  const storageKey = isEthan ? RYAN_ETHAN_STORAGE_KEY : RYAN_MENTOR_STORAGE_KEY;

  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch(e) {}

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (isEthan) {
    return [
      {
        id: 'init_ryan_mentor_ethan',
        from: 'ryan',
        author: 'Ryan',
        roleTag: 'IT SUPPORT MENTOR',
        roleClass: 'pl-gc-role-mentor',
        avatar: 'assets/Character/Ryan.png',
        time: timeStr,
        text: "Hey Ethan! Welcome to your SysAdmin & infrastructure station. I'm here as your IT Support Mentor. If you have questions about malware analysis, suspicious processes, trojans, network security, or IT career paths, feel free to ask me anytime!"
      }
    ];
  }

  return [
    {
      id: 'init_ryan_mentor',
      from: 'ryan',
      author: 'Ryan',
      roleTag: 'IT SUPPORT MENTOR',
      roleClass: 'pl-gc-role-mentor',
      avatar: 'assets/Character/Ryan.png',
      time: timeStr,
      text: "If you want to practice identifying phishing emails again, just message me through Phone Link, and I'll help you retry the phishing activity!"
    }
  ];
}

function saveRyanMentorMessages(msgs) {
  const curChar = getCurrentPhoneCharacter();
  const storageKey = curChar.id === 'ethan' ? RYAN_ETHAN_STORAGE_KEY : RYAN_MENTOR_STORAGE_KEY;
  try {
    localStorage.setItem(storageKey, JSON.stringify(msgs));
  } catch(e) {}
}

window._ryanMentorIsTyping = false;
window._alexFriendIsTyping = false;

function loadAlexFriendMessages() {
  try {
    const raw = localStorage.getItem(ALEX_FRIEND_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch(e) {}

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return [
    {
      id: 'init_alex_ethan_1',
      from: 'alex',
      author: 'Alex',
      roleTag: 'FRIEND',
      roleClass: 'pl-gc-role-newbie',
      avatar: 'assets/Character/Alex.png',
      time: timeStr,
      text: "Yo Ethan! Dude, can you believe we actually survived high school and made it into this internship together? Still feels unreal haha."
    }
  ];
}

function saveAlexFriendMessages(msgs) {
  try {
    localStorage.setItem(ALEX_FRIEND_STORAGE_KEY, JSON.stringify(msgs));
  } catch(e) {}
}

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
  const conn = getPhoneLinkConnectionStatus();
  let reasonText = "Messages can't be sent right now. Check your Wi-Fi connection.";
  let btnText = "Turn on Wi-Fi";
  let btnIcon = "📶";
  let iconSymbol = "⚠️";
  let btnAction = "turnOnWifiFromPhoneLink()";

  if (conn.isAirplane) {
    reasonText = "Airplane Mode is turned on. Wireless communication and internet access are suspended.";
    btnText = "Turn off Airplane Mode";
    btnIcon = "✈️";
    iconSymbol = "✈️";
    btnAction = "turnOffAirplaneFromPhoneLink()";
  } else if (typeof networkSettings !== 'undefined' && !networkSettings.wifi) {
    reasonText = "Wi-Fi is turned off. Turn on Wi-Fi to send and receive messages.";
    btnText = "Turn on Wi-Fi";
    btnIcon = "📶";
    iconSymbol = "📡";
    btnAction = "turnOnWifiFromPhoneLink()";
  } else if (typeof networkSettings !== 'undefined' && !networkSettings.currentSsid) {
    reasonText = "Not connected to any Wi-Fi network. Connect to a network to message teammates.";
    btnText = "Connect to Wi-Fi";
    btnIcon = "📶";
    iconSymbol = "⚠️";
    btnAction = "turnOnWifiFromPhoneLink()";
  } else if (typeof networkSettings !== 'undefined' && networkSettings.noInternet) {
    reasonText = "Connected without internet access. Check your router or connection.";
    btnText = "Reconnect Wi-Fi";
    btnIcon = "🔄";
    iconSymbol = "⚠️";
    btnAction = "turnOnWifiFromPhoneLink()";
  }

  return `
    <div class="pl-no-internet-banner" id="pl-no-internet-banner">
      <div class="pl-no-internet-content">
        <div class="pl-banner-icon-badge">
          <span class="pl-banner-radar-ring"></span>
          <span class="pl-banner-icon-symbol">${iconSymbol}</span>
        </div>
        <div class="pl-banner-text-group">
          <div class="pl-banner-title-row">
            <span class="pl-banner-title">No Internet Connection</span>
            <span class="pl-banner-status-chip">OFFLINE</span>
          </div>
          <div class="pl-banner-desc">${reasonText}</div>
        </div>
      </div>
      <button type="button" class="pl-no-internet-btn" onclick="${btnAction}">
        <span>${btnIcon}</span>
        <span>${btnText}</span>
      </button>
    </div>
  `;
}

function syncPhoneLinkOfflineBanner() {
  const conn = getPhoneLinkConnectionStatus();
  const bannerSlot = document.querySelector('.pl-banner-slot');
  if (bannerSlot) {
    const existingBanner = bannerSlot.querySelector('.pl-no-internet-banner');
    if (!conn.isInternetConnected) {
      const newBannerHtml = renderNoInternetBannerHtml();
      if (!existingBanner) {
        bannerSlot.innerHTML = newBannerHtml;
      } else {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = newBannerHtml;
        const newInner = tempDiv.firstElementChild ? tempDiv.firstElementChild.innerHTML : '';
        if (newInner && existingBanner.innerHTML !== newInner) {
          existingBanner.innerHTML = newInner;
        }
      }
    } else {
      if (existingBanner && !existingBanner.classList.contains('pl-banner-leaving')) {
        existingBanner.classList.add('pl-banner-leaving');
        setTimeout(() => {
          const slot = document.querySelector('.pl-banner-slot');
          if (slot) slot.innerHTML = '';
        }, 290);
      }
    }
  }

  // Live update header status pill
  const headerSummary = document.querySelector('.pl-gc-members-summary');
  if (headerSummary) {
    const isOffline = !conn.isInternetConnected;
    if (isOffline) {
      headerSummary.innerHTML = headerSummary.innerHTML
        .replace(/🟢\s*Online/g, '🟡 Offline')
        .replace(/color:#22c55e;/g, 'color:#f59e0b;');
    } else {
      headerSummary.innerHTML = headerSummary.innerHTML
        .replace(/🟡\s*Offline/g, '🟢 Online')
        .replace(/color:#f59e0b;/g, 'color:#22c55e;');
    }
  }

  // Live update Ryan mentor row in contacts list if present
  const ryanRow = document.querySelector('.pl-ryan-mentor-row');
  if (ryanRow) {
    const statusText = ryanRow.querySelector('.pl-contact-meta span:last-child');
    if (statusText) {
      statusText.textContent = conn.isInternetConnected ? '● Online' : '● Offline';
      statusText.style.color = conn.isInternetConnected ? '#22c55e' : '#f59e0b';
    }
    const dot = ryanRow.querySelector('.pl-ryan-status-dot');
    if (dot) {
      dot.style.background = conn.isInternetConnected ? '#22c55e' : '#f59e0b';
      dot.style.boxShadow = conn.isInternetConnected ? '0 0 5px #22c55e' : '0 0 5px #f59e0b';
    }
  }

  // Live update Alex friend row in contacts list if present
  const alexRow = document.querySelector('.pl-alex-friend-row');
  if (alexRow) {
    const statusText = alexRow.querySelector('.pl-contact-meta span:last-child');
    if (statusText) {
      statusText.textContent = conn.isInternetConnected ? '● Online' : '● Offline';
      statusText.style.color = conn.isInternetConnected ? '#22c55e' : '#f59e0b';
    }
    const dot = alexRow.querySelector('.pl-ryan-status-dot');
    if (dot) {
      dot.style.background = conn.isInternetConnected ? '#22c55e' : '#f59e0b';
      dot.style.boxShadow = conn.isInternetConnected ? '0 0 5px #22c55e' : '0 0 5px #f59e0b';
    }
  }
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
        renderNewbieGcChat(content);
      } else if (g4ActiveConvo === 'ryan_mentor') {
        renderRyanMentorChat(content);
      } else if (g4ActiveConvo === 'alex_friend') {
        renderAlexFriendChat(content);
      } else if (g4ActiveConvo) {
        renderIndividualConvo(g4ActiveConvo, content);
      } else {
        renderPhoneMessages(content);
      }
    }
  } else {
    // Already viewing active view: smoothly sync the offline banner without rebuilding DOM
    syncPhoneLinkOfflineBanner();
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

  const ch1Unlocked = isChapter1CompletedAndSaved();
  const curChar = getCurrentPhoneCharacter();
  const isEthan = curChar.id === 'ethan';
  const gcActive = isNewbieGcActive() || ch1Unlocked || isEthan || (typeof window !== 'undefined' && Boolean(window._awardClaimed));

  if (isMsg && (gcActive || ch1Unlocked || isEthan)) {
    const gcState = loadNewbieGcState();
    const hasPlayerMsgs = gcState.playerMessages && gcState.playerMessages.length > 0;
    const lastMsg = hasPlayerMsgs ? gcState.playerMessages[gcState.playerMessages.length - 1] : null;
    const lastSender = lastMsg ? (lastMsg.from === curChar.id ? curChar.displayName : (lastMsg.author || lastMsg.from)) : '';
    const lastMsgPreview = lastMsg
      ? `${lastSender}: ${lastMsg.text}`
      : 'Ryan added you';

    const ryanMsgs = loadRyanMentorMessages();
    const lastRyanMsg = ryanMsgs.length > 0 ? ryanMsgs[ryanMsgs.length - 1] : null;
    const lastRyanPreview = lastRyanMsg
      ? lastRyanMsg.text
      : (isEthan
          ? "Welcome to your SysAdmin station! Ask me about malware analysis, trojans, and IT careers."
          : "If you want to practice identifying phishing emails again, just message me through Phone Link, and I'll help you retry the phishing activity!");

    let alexCardHtml = '';
    if (isEthan) {
      const alexMsgs = loadAlexFriendMessages();
      const lastAlexMsg = alexMsgs.length > 0 ? alexMsgs[alexMsgs.length - 1] : null;
      const lastAlexPreview = lastAlexMsg ? lastAlexMsg.text : 'Yo Ethan! Still feels unreal haha.';
      alexCardHtml = `
        <!-- Alex (Best Friend) Card -->
        <div style="background:rgba(234,179,8,0.14);border:1px solid rgba(250,204,21,0.4);border-radius:10px;padding:7px 9px;cursor:pointer;width:100%;box-sizing:border-box;text-align:left;transition:all 0.15s ease;" onclick="openAlexFriendConversation()" title="Alex (Best Friend) — Message">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:2px;">
            <img src="assets/Character/Alex.png" alt="Alex" style="width:16px;height:16px;border-radius:50%;object-fit:cover;border:1px solid #facc15;">
            <span style="font-size:10px;font-weight:800;color:#ffffff;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">Alex</span>
            <span style="font-size:7.5px;background:#ca8a04;color:#fff;border-radius:3px;padding:1px 4px;margin-left:auto;font-weight:700;">FRIEND</span>
          </div>
          <div style="font-size:8px;color:#fde047;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
            ${escapeHtml(lastAlexPreview)}
          </div>
        </div>
      `;
    }

    phoneContent.innerHTML = `
      <div class="pl-phone-inapp-view">
        <div class="pl-phone-inapp-header">
          <button type="button" class="pl-phone-screen-back" onclick="returnPhoneHome()" title="Home Screen">‹</button>
          <span class="pl-phone-screen-title">${title}</span>
          <span style="width:36px"></span>
        </div>
        <div class="pl-phone-inapp-body" style="padding:8px;justify-content:flex-start;gap:6px;">
          ${alexCardHtml}
          <!-- Ryan (IT Mentor) Card placed directly ABOVE new intern team 2027 -->
          <div style="background:rgba(2,132,199,0.18);border:1px solid rgba(56,189,248,0.4);border-radius:10px;padding:7px 9px;cursor:pointer;width:100%;box-sizing:border-box;text-align:left;transition:all 0.15s ease;" onclick="openRyanMentorConversation()" title="Ryan (IT Mentor) — Message">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:2px;">
              <img src="assets/Character/Ryan.png" alt="Ryan" style="width:16px;height:16px;border-radius:50%;object-fit:cover;border:1px solid #38bdf8;">
              <span style="font-size:10px;font-weight:800;color:#ffffff;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">Ryan (IT Mentor)</span>
              <span style="font-size:7.5px;background:#0284c7;color:#fff;border-radius:3px;padding:1px 4px;margin-left:auto;font-weight:700;">MENTOR</span>
            </div>
            <div style="font-size:8px;color:#93c5fd;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
              ${escapeHtml(lastRyanPreview)}
            </div>
          </div>

          <!-- new intern team 2027 card -->
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
    if (g4ActiveConvo === 'alex_friend') {
      renderAlexFriendChat(content);
    } else if (g4ActiveConvo === 'ryan_mentor') {
      renderRyanMentorChat(content);
    } else if (g4ActiveConvo === 'business_newbie_gc') {
      renderNewbieGcChat(content);
    } else if (g4ActiveConvo) {
      renderIndividualConvo(g4ActiveConvo, content);
    } else {
      renderPhoneMessages(content);
    }
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
  const curChar = getCurrentPhoneCharacter();
  const isEthan = curChar.id === 'ethan';
  const ch1Unlocked = isChapter1CompletedAndSaved();
  const gcActive = isNewbieGcActive() || ch1Unlocked || isEthan || (typeof window !== 'undefined' && Boolean(window._awardClaimed));
  const gcState = loadNewbieGcState();
  const conn = getPhoneLinkConnectionStatus();

  let bannerHtml = '';
  if (!conn.isInternetConnected) {
    bannerHtml = renderNoInternetBannerHtml();
  }

  let html = `<div id="pl-messages-banner-slot" class="pl-banner-slot">${bannerHtml}</div><div class="pl-contacts-list">`;

  // 1. IF CHAPTER 2 (ETHAN): Alex (Best Friend) Contact Row at Top
  if (isEthan) {
    const alexMsgs = loadAlexFriendMessages();
    const lastAlexMsg = alexMsgs.length > 0 ? alexMsgs[alexMsgs.length - 1] : null;
    const lastAlexSender = lastAlexMsg ? (lastAlexMsg.from === 'ethan' ? 'You' : 'Alex') : '';
    const lastAlexPreview = lastAlexMsg
      ? `${lastAlexSender ? lastAlexSender + ': ' : ''}${lastAlexMsg.text}`
      : 'Yo Ethan! Still feels unreal haha.';
    const alexTime = lastAlexMsg ? lastAlexMsg.time : '10:42 AM';

    html += `
      <div class="pl-contact-row pl-alex-friend-row" onclick="openAlexFriendConversation()" title="Alex — Best Friend &amp; High School Classmate">
        <div style="position:relative;margin-right:12px;flex-shrink:0;">
          <img src="assets/Character/Alex.png" alt="Alex" style="width:42px;height:42px;border-radius:50%;object-fit:cover;border:2px solid #eab308;box-shadow:0 0 10px rgba(234,179,8,0.4);display:block;">
          <span class="pl-ryan-status-dot" style="position:absolute;bottom:0;right:0;width:10px;height:10px;background:${conn.isInternetConnected ? '#22c55e' : '#f59e0b'};border:2px solid #0f172a;border-radius:50%;box-shadow:0 0 5px ${conn.isInternetConnected ? '#22c55e' : '#f59e0b'};"></span>
        </div>
        <div class="pl-contact-info" style="flex:1;min-width:0;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2px;">
            <span class="pl-contact-name" style="font-size:13.5px;font-weight:700;color:#f8fafc;display:flex;align-items:center;gap:6px;">
              Alex
              <span style="background:rgba(234,179,8,0.22);border:1px solid rgba(234,179,8,0.5);color:#facc15;font-size:9.5px;font-weight:700;padding:1px 6px;border-radius:4px;letter-spacing:0.5px;">FRIEND</span>
            </span>
            <span style="font-size:10px;font-weight:600;color:#facc15;">${alexTime}</span>
          </div>
          <div class="pl-contact-meta" style="display:flex;justify-content:space-between;align-items:center;">
            <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:320px;color:#cbd5e1;font-size:11.5px;">${escapeHtml(lastAlexPreview)}</span>
            <span class="pl-ryan-status-text" style="font-size:10px;color:${conn.isInternetConnected ? '#22c55e' : '#f59e0b'};font-weight:600;margin-left:8px;white-space:nowrap;">● ${conn.isInternetConnected ? 'Online' : 'Offline'}</span>
          </div>
        </div>
      </div>
    `;
  }

  // 2. Ryan (IT Mentor) Contact Row
  const ryanMsgs = loadRyanMentorMessages();
  const lastRyanMsg = ryanMsgs.length > 0 ? ryanMsgs[ryanMsgs.length - 1] : null;
  const lastRyanSender = lastRyanMsg ? (lastRyanMsg.from === curChar.id ? 'You' : 'Ryan') : '';
  const lastRyanPreview = lastRyanMsg
    ? `${lastRyanSender ? lastRyanSender + ': ' : ''}${lastRyanMsg.text}`
    : (isEthan
        ? "Welcome to your SysAdmin station! Ask me about malware analysis, trojans, and IT careers."
        : "If you want to practice identifying phishing emails again, just message me through Phone Link, and I'll help you retry the phishing activity!");
  const ryanTime = lastRyanMsg ? lastRyanMsg.time : '10:45 AM';

  html += `
    <div class="pl-contact-row pl-ryan-mentor-row ${(!isEthan && !ch1Unlocked) ? 'pl-mentor-locked' : ''}" onclick="openRyanMentorConversation()" title="Ryan (IT Mentor) — ${isEthan ? 'Malware &amp; IT Mentorship' : 'Phishing Practice &amp; Retries'}">
      <div style="position:relative;margin-right:12px;flex-shrink:0;">
        <img src="assets/Character/Ryan.png" alt="Ryan" style="width:42px;height:42px;border-radius:50%;object-fit:cover;border:2px solid #38bdf8;box-shadow:0 0 10px rgba(56,189,248,0.4);display:block;">
        <span class="pl-ryan-status-dot" style="position:absolute;bottom:0;right:0;width:10px;height:10px;background:${conn.isInternetConnected ? '#22c55e' : '#f59e0b'};border:2px solid #0f172a;border-radius:50%;box-shadow:0 0 5px ${conn.isInternetConnected ? '#22c55e' : '#f59e0b'};"></span>
      </div>
      <div class="pl-contact-info" style="flex:1;min-width:0;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2px;">
          <span class="pl-contact-name" style="font-size:13.5px;font-weight:700;color:#f8fafc;display:flex;align-items:center;gap:6px;">
            Ryan (IT Mentor)
            <span style="background:rgba(2,132,199,0.25);border:1px solid #38bdf8;color:#7dd3fc;font-size:9.5px;font-weight:700;padding:1px 6px;border-radius:4px;letter-spacing:0.5px;">MENTOR</span>
          </span>
          <span style="font-size:10px;font-weight:600;color:#38bdf8;">${ryanTime}</span>
        </div>
        <div class="pl-contact-meta" style="display:flex;justify-content:space-between;align-items:center;">
          <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:320px;color:#cbd5e1;font-size:11.5px;">${escapeHtml(lastRyanPreview)}</span>
          <span class="pl-ryan-status-text" style="font-size:10px;color:${conn.isInternetConnected ? '#22c55e' : '#f59e0b'};font-weight:600;margin-left:8px;white-space:nowrap;">● ${conn.isInternetConnected ? 'Online' : 'Offline'}</span>
        </div>
      </div>
    </div>
  `;

  // 3. Group Chat Row ("new intern team 2027")
  if (gcActive) {
    const hasPlayerMsgs = gcState.playerMessages && gcState.playerMessages.length > 0;
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

  const hasContacts = html.includes('pl-contact-row');
  if (!hasContacts) {
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
  const ch1Unlocked = isChapter1CompletedAndSaved();
  const gcActive = isNewbieGcActive() || ch1Unlocked || (typeof window !== 'undefined' && Boolean(window._awardClaimed));
  if (!gcActive) {
    g4ActiveConvo = null;
    const content = document.getElementById('pl-tab-content');
    if (content) renderPhoneMessages(content);
    return;
  }

  g4ActiveConvo = 'business_newbie_gc';
  g4ActiveTab = 'messages';

  const tabs = document.querySelectorAll('.pl-tab');
  tabs.forEach(t => {
    const id = t.id.replace('pl-tab-', '');
    t.classList.toggle('active', id === 'messages');
  });

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
  const isOffline = !conn.isInternetConnected;
  const bannerHtml = isOffline ? renderNoInternetBannerHtml() : '';
  const curChar = getCurrentPhoneCharacter();

  const allMessages = state.playerMessages || [];

  const existingInput = document.getElementById('pl-gc-text-input');
  const preservedText = existingInput ? existingInput.value : '';

  container.innerHTML = `
    <div class="pl-convo-view" style="display:flex;flex-direction:column;height:100%;background:#090e18;">
      <!-- Header -->
      <div class="pl-convo-header" style="background:#0f172a;border-bottom:1px solid rgba(255,255,255,0.08);padding:10px 16px;display:flex;align-items:center;gap:12px;">
        <button class="pl-back-btn" onclick="g4ActiveConvo = null; switchPhoneTab('messages')">← Back</button>
        <div class="pl-contact-avatar pl-gc-avatar-stack" style="width:34px;height:34px;font-size:16px;">👥</div>
        <div class="pl-gc-header-info">
          <div class="pl-convo-name" style="font-size:13.5px;font-weight:800;color:#ffffff;line-height:1.2;">${NEWBIE_GC_INFO.name}</div>
          <div class="pl-gc-members-summary">Group created by <span onclick="openRyanMentorConversation()" title="Click Ryan's profile to message him" style="color:#38bdf8;font-weight:700;cursor:pointer;text-decoration:underline;text-underline-offset:2px;">Ryan</span> · 4 members (<span onclick="openRyanMentorConversation()" title="Click Ryan's profile to message him" style="color:#38bdf8;font-weight:700;cursor:pointer;text-decoration:underline;text-underline-offset:2px;">Ryan</span>, Ethan, Pia, Alex) · ${isOffline ? '<span style="color:#f59e0b;">🟡 Offline</span>' : '<span style="color:#22c55e;">🟢 Online</span>'}</div>
        </div>
      </div>

      <!-- Optional No Internet Banner -->
      <div id="pl-gc-banner-slot" class="pl-banner-slot">${bannerHtml}</div>

      <!-- Messages Thread -->
      <div class="pl-convo-messages" id="pl-gc-messages-list" style="flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px;">
        <!-- Group system creation event -->
        <div class="pl-gc-system-events-container">
          <div class="pl-gc-system-pill">
            👑 <strong onclick="openRyanMentorConversation()" title="Click Ryan's profile to message him" style="cursor:pointer;color:#38bdf8;text-decoration:underline;text-underline-offset:2px;">Ryan${curChar.id === 'ryan' ? ' (You)' : ''}</strong> created group <strong>"${NEWBIE_GC_INFO.name}"</strong>
          </div>
          ${curChar.id === 'alex' ? `
            <div class="pl-gc-system-pill pl-gc-pill-you">
              👋 <strong onclick="openRyanMentorConversation()" title="Click Ryan's profile to message him" style="cursor:pointer;color:#38bdf8;text-decoration:underline;text-underline-offset:2px;">Ryan</strong> added <strong>Alex (You)</strong>
            </div>
          ` : curChar.id === 'ethan' ? `
            <div class="pl-gc-system-pill">
              👋 <strong onclick="openRyanMentorConversation()" title="Click Ryan's profile to message him" style="cursor:pointer;color:#38bdf8;text-decoration:underline;text-underline-offset:2px;">Ryan</strong> added <strong>Alex</strong>
            </div>
            <div class="pl-gc-system-pill pl-gc-pill-you">
              👋 <strong onclick="openRyanMentorConversation()" title="Click Ryan's profile to message him" style="cursor:pointer;color:#38bdf8;text-decoration:underline;text-underline-offset:2px;">Ryan</strong> added <strong>Ethan (You)</strong>
            </div>
          ` : curChar.id === 'pia' ? `
            <div class="pl-gc-system-pill">
              👋 <strong onclick="openRyanMentorConversation()" title="Click Ryan's profile to message him" style="cursor:pointer;color:#38bdf8;text-decoration:underline;text-underline-offset:2px;">Ryan</strong> added <strong>Alex</strong> and <strong>Ethan</strong>
            </div>
            <div class="pl-gc-system-pill pl-gc-pill-you">
              👋 <strong onclick="openRyanMentorConversation()" title="Click Ryan's profile to message him" style="cursor:pointer;color:#38bdf8;text-decoration:underline;text-underline-offset:2px;">Ryan</strong> added <strong>Pia (You)</strong>
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
            if (msg.notDelivered) {
              seenReceiptHtml = `
                <div class="pl-gc-seen-row pl-msg-failed-row" style="color:#ef4444;font-size:11px;font-weight:700;display:flex;align-items:center;gap:4px;margin-top:2px;" title="Not delivered — no internet connection">
                  <span>⚠️ Not Delivered • No internet connection</span>
                </div>
              `;
            } else if (isLatestMine) {
              if (state.seenByRyan) {
                seenReceiptHtml = `
                  <div class="pl-gc-seen-row" title="Seen by Team">
                    <span class="pl-gc-seen-label">Seen</span>
                    <img src="assets/Character/Ryan.png" class="pl-gc-seen-avatar" alt="Ryan" title="Seen by Ryan (Click to message)" onclick="openRyanMentorConversation()" style="cursor:pointer;">
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

          const isRyan = (msg.from === 'ryan') || (authorName.toLowerCase().startsWith('ryan'));
          const ryanAvatarClick = isRyan ? 'onclick="openRyanMentorConversation()" title="Click Ryan\'s profile to message him" style="cursor:pointer;border:2px solid #38bdf8;"' : '';
          const ryanAuthorClick = isRyan ? 'onclick="openRyanMentorConversation()" title="Click Ryan\'s profile to message him" style="cursor:pointer;color:#38bdf8;text-decoration:underline;text-underline-offset:2px;"' : '';

          return `
            <div class="pl-gc-msg-item ${isMine ? 'mine' : 'theirs'} ${animClass}">
              <img src="${avatarSrc}" class="pl-gc-msg-avatar ${isMine ? 'avatar-mine' : ''}" alt="${escapeHtml(authorName)}" ${ryanAvatarClick}>
              <div class="pl-gc-msg-col">
                <div class="pl-gc-msg-meta">
                  <span class="pl-gc-msg-author" ${ryanAuthorClick}>${escapeHtml(authorName)}</span>
                  <span class="pl-gc-msg-role-tag ${roleClass}">${escapeHtml(roleTag)}</span>
                  <span class="pl-gc-msg-time-inline">${msg.time}</span>
                </div>
                <div class="pl-gc-bubble ${msg.notDelivered ? 'pl-gc-bubble-error' : ''}">${escapeHtml(msg.text)}</div>
                ${seenReceiptHtml}
              </div>
            </div>
          `;
        }).join('')}

        ${state.typingMember ? `
          <div class="pl-gc-msg-item theirs pl-typing-active" id="pl-gc-typing-item">
            <img src="${state.typingMember.avatar}" class="pl-gc-msg-avatar" alt="${escapeHtml(state.typingMember.name)}" ${state.typingMember.id === 'ryan' ? 'onclick="openRyanMentorConversation()" title="Click Ryan\'s profile to message him" style="cursor:pointer;"' : ''}>
            <div class="pl-gc-msg-col">
              <div class="pl-gc-msg-meta">
                <span class="pl-gc-msg-author" ${state.typingMember.id === 'ryan' ? 'onclick="openRyanMentorConversation()" title="Click Ryan\'s profile to message him" style="cursor:pointer;color:#38bdf8;"' : ''}>${escapeHtml(state.typingMember.name)}</span>
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
            <img src="assets/Character/Ryan.png" class="pl-gc-msg-avatar" alt="Ryan" onclick="openRyanMentorConversation()" title="Click Ryan's profile to message him" style="cursor:pointer;border:2px solid #38bdf8;">
            <div class="pl-gc-msg-col">
              <div class="pl-gc-msg-meta">
                <span class="pl-gc-msg-author" onclick="openRyanMentorConversation()" title="Click Ryan's profile to message him" style="cursor:pointer;color:#38bdf8;text-decoration:underline;text-underline-offset:2px;">Ryan</span>
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

  const conn = getPhoneLinkConnectionStatus();
  if (!conn.isInternetConnected) {
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
      isNew: true,
      notDelivered: true
    };
    state.playerMessages.push(playerMsg);
    saveNewbieGcState(state);

    const content = document.getElementById('pl-tab-content');
    if (content && g4ActiveConvo === 'business_newbie_gc') {
      renderNewbieGcChat(content, { smoothScroll: true });
    }

    const bar = document.querySelector('#pl-tab-content .pl-gc-input-bar');
    if (bar) {
      bar.classList.remove('pl-input-bar-error');
      void bar.offsetWidth;
      bar.classList.add('pl-input-bar-error');
      setTimeout(() => bar.classList.remove('pl-input-bar-error'), 500);
    }
    const inp = document.getElementById('pl-gc-text-input');
    if (inp) {
      inp.classList.remove('pl-input-error');
      void inp.offsetWidth;
      inp.classList.add('pl-input-error');
      setTimeout(() => inp.classList.remove('pl-input-error'), 500);
    }
    const banner = document.getElementById('pl-no-internet-banner');
    if (banner) {
      banner.classList.remove('pl-banner-flash-attention');
      void banner.offsetWidth;
      banner.classList.add('pl-banner-flash-attention');
      setTimeout(() => banner.classList.remove('pl-banner-flash-attention'), 700);
    }

    const reason = conn.isAirplane
      ? '✈️ Message not delivered: Airplane Mode is active. Turn off Airplane Mode to send messages.'
      : (typeof networkSettings !== 'undefined' && !networkSettings.wifi
          ? '📶 Message not delivered: Wi-Fi is turned off. Turn on Wi-Fi to send messages.'
          : '📶 Message not delivered: No internet connection. Please connect to Wi-Fi to send messages.');
    if (typeof showToast === 'function') {
      showToast(reason, 'error');
    }
    if (typeof AudioManager !== 'undefined' && AudioManager.playWarning) {
      AudioManager.playWarning();
    }
    return;
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
    // ── Chapter 2: Ethan’s Message in Group Chat ──
    const lowerText = (msgText || '').toLowerCase();
    if (lowerText.includes('classmate') || lowerText.includes('high school') || !state.alexRepliedEthan) {
      state.alexRepliedEthan = true;
      saveNewbieGcState(state);
      repliers.push({
        member: CHAR_ROSTER.alex,
        text: 'What, Ryan? Wait— Ethan?! No way! You\'re the SysAdmin intern here?!',
        delay: 850,
        typingDuration: 1100
      });
      repliers.push({
        member: CHAR_ROSTER.ryan,
        text: 'Haha yes! Ethan and Alex, glad you two already know each other. Welcome aboard team!',
        delay: 2400,
        typingDuration: 1200
      });
    } else if (lowerText.includes('process') || lowerText.includes('malware') || lowerText.includes('strange') || lowerText.includes('background')) {
      repliers.push({
        member: CHAR_ROSTER.alex,
        text: 'Check the Task Manager and Process Viewer! Don\'t let it run wild bro!',
        delay: 850,
        typingDuration: 1100
      });
      repliers.push({
        member: CHAR_ROSTER.ryan,
        text: 'Good eye, Ethan. Inspect the CPU usage and memory footprint. If it looks unsigned or suspicious, analyze the executable.',
        delay: 2400,
        typingDuration: 1300
      });
    } else if (lowerText.includes('lunch') || lowerText.includes('food') || lowerText.includes('eat') || lowerText.includes('ramen')) {
      repliers.push({
        member: CHAR_ROSTER.alex,
        text: 'Count me in! There\'s a good ramen place right around the corner 🍜',
        delay: 850,
        typingDuration: 1000
      });
      repliers.push({
        member: CHAR_ROSTER.pia,
        text: 'Save me a seat! Need a break from documentation.',
        delay: 2200,
        typingDuration: 1000
      });
    } else if (lowerText.includes('sysadmin') || lowerText.includes('station') || lowerText.includes('running') || lowerText.includes('up')) {
      repliers.push({
        member: CHAR_ROSTER.ryan,
        text: 'Awesome job Ethan. Keep your eyes on the system health and alert logs.',
        delay: 850,
        typingDuration: 1100
      });
      repliers.push({
        member: CHAR_ROSTER.alex,
        text: 'Let\'s crush this internship bro! 💪',
        delay: 2300,
        typingDuration: 1000
      });
    } else {
      repliers.push({
        member: CHAR_ROSTER.alex,
        text: 'Haha nice one Ethan! Let\'s get through these morning tasks first.',
        delay: 850,
        typingDuration: 1000
      });
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
  window._ryanMentorIsTyping = false;
  window._alexFriendIsTyping = false;
  if (Array.isArray(window._plTypingTimers)) {
    window._plTypingTimers.forEach(id => clearTimeout(id));
    window._plTypingTimers = [];
  }
  try {
    localStorage.removeItem(NEWBIE_GC_STORAGE_KEY);
    localStorage.removeItem(RYAN_MENTOR_STORAGE_KEY);
    localStorage.removeItem(RYAN_ETHAN_STORAGE_KEY);
    localStorage.removeItem(ALEX_FRIEND_STORAGE_KEY);
  } catch(e) {}
  const content = document.getElementById('pl-tab-content');
  if (content) {
    if (g4ActiveConvo === 'business_newbie_gc') {
      renderNewbieGcChat(content);
    } else if (g4ActiveConvo === 'ryan_mentor') {
      renderRyanMentorChat(content);
    } else if (g4ActiveConvo === 'alex_friend') {
      renderAlexFriendChat(content);
    }
  }
}
window.resetPhoneLinkChat = resetPhoneLinkChat;
window.sendPlayerGcQuickReply = sendPlayerGcQuickReply;
window.sendPlayerGcMessage = sendPlayerGcMessage;
window.sendCustomPlayerGcMessage = sendCustomPlayerGcMessage;

// ═══════════════════════════════════════════════════════════════
// ALEX (CLOSE FRIEND & HIGH SCHOOL CLASSMATE) DIRECT CHAT (CHAPTER 2)
// ═══════════════════════════════════════════════════════════════

function openAlexFriendConversation() {
  g4ActiveConvo = 'alex_friend';
  g4ActiveTab = 'messages';

  const tabs = document.querySelectorAll('.pl-tab');
  tabs.forEach(t => {
    const id = t.id.replace('pl-tab-', '');
    t.classList.toggle('active', id === 'messages');
  });

  const content = document.getElementById('pl-tab-content');
  if (!content) return;

  renderAlexFriendChat(content);

  if (g4PhoneScreenView !== 'home') {
    showPhoneInAppScreen('messages');
  }
}

function getAlexFriendQuickReplies(allMessages) {
  const ethanMsgs = (allMessages || []).filter(m => (m.from === 'ethan') || (m.from === 'player') || (m.isPlayer));
  if (!ethanMsgs || ethanMsgs.length === 0) {
    return [
      { icon: '🎓', label: 'Remember our capstone all-nighter?', text: 'Remember our capstone project all-nighter with only 3 hours left? 😂' },
      { icon: '🎮', label: '1v1 in Space Fighter tonight?', text: '1v1 in Space Fighter tonight? I beat your high score by 5,000 points!' },
      { icon: '🚀', label: "What's your dream IT role?", text: "What's your dream IT role once we finish college, Alex?" },
      { icon: '🏢', label: "How's your station feeling?", text: "How's your station feeling so far? Getting used to office life?" },
      { icon: '🤝', label: "We've got this, Alex!", text: "We’ve got this, Alex. Step by step, we're becoming real IT pros." }
    ];
  }

  const lastEthan = ethanMsgs[ethanMsgs.length - 1];
  const lastText = (lastEthan.text || '').toLowerCase();

  if (lastText.includes('capstone') || lastText.includes('all-nighter')) {
    return [
      { icon: '💻', label: 'Compiler hated us personally', text: 'We really thought the compiler hated us personally.' },
      { icon: '🙌', label: 'Peak teamwork', text: 'Honestly, that thesis was peak teamwork.' },
      { icon: '🎮', label: '1v1 in Space Fighter tonight?', text: '1v1 in Space Fighter tonight? I beat your high score by 5,000 points!' },
      { icon: '🏢', label: "How's your station feeling?", text: "How's your station feeling so far? Getting used to office life?" }
    ];
  }

  if (lastText.includes('compiler') || lastText.includes('teamwork')) {
    return [
      { icon: '🎮', label: '1v1 in Space Fighter tonight?', text: '1v1 in Space Fighter tonight? I beat your high score by 5,000 points!' },
      { icon: '🚀', label: "What's your dream IT role?", text: "What's your dream IT role once we finish college, Alex?" },
      { icon: '🏢', label: "How's your station feeling?", text: "How's your station feeling so far? Getting used to office life?" },
      { icon: '🤝', label: "We've got this, Alex!", text: "We’ve got this, Alex. Step by step, we're becoming real IT pros." }
    ];
  }

  if (lastText.includes('space fighter') || lastText.includes('high score') || lastText.includes('1v1')) {
    return [
      { icon: '🍜', label: 'Deal! Get your wallet ready', text: 'Deal! Get your wallet ready for ramen tomorrow, Alex 🍜' },
      { icon: '🛡️', label: 'Don\'t download shady mods', text: 'Just don\'t download any suspicious game mods like last time!' },
      { icon: '🎓', label: 'Remember our capstone all-nighter?', text: 'Remember our capstone project all-nighter with only 3 hours left? 😂' },
      { icon: '🚀', label: "What's your dream IT role?", text: "What's your dream IT role once we finish college, Alex?" }
    ];
  }

  if (lastText.includes('wallet') || lastText.includes('mods')) {
    return [
      { icon: '🚀', label: "What's your dream IT role?", text: "What's your dream IT role once we finish college, Alex?" },
      { icon: '🏢', label: "How's your station feeling?", text: "How's your station feeling so far? Getting used to office life?" },
      { icon: '🎓', label: 'Remember our capstone all-nighter?', text: 'Remember our capstone project all-nighter with only 3 hours left? 😂' },
      { icon: '🤝', label: "We've got this, Alex!", text: "We’ve got this, Alex. Step by step, we're becoming real IT pros." }
    ];
  }

  if (lastText.includes('dream it role') || lastText.includes('finish college') || lastText.includes('dream role')) {
    return [
      { icon: '☁️', label: 'SysAdmin & Cloud Security', text: 'Definitely SysAdmin & Cloud Security. I love architecting and securing networks.' },
      { icon: '🛡️', label: 'SOC Analyst sounds amazing', text: 'Security Operations Center (SOC) analyst sounds amazing too.' },
      { icon: '🏢', label: "How's your station feeling?", text: "How's your station feeling so far? Getting used to office life?" },
      { icon: '🎮', label: '1v1 in Space Fighter tonight?', text: '1v1 in Space Fighter tonight? I beat your high score by 5,000 points!' }
    ];
  }

  if (lastText.includes('sysadmin') || lastText.includes('soc analyst') || lastText.includes('cloud')) {
    return [
      { icon: '🏢', label: "How's your station feeling?", text: "How's your station feeling so far? Getting used to office life?" },
      { icon: '🎮', label: '1v1 in Space Fighter tonight?', text: '1v1 in Space Fighter tonight? I beat your high score by 5,000 points!' },
      { icon: '🎓', label: 'Remember our capstone all-nighter?', text: 'Remember our capstone project all-nighter with only 3 hours left? 😂' },
      { icon: '🤝', label: "We've got this, Alex!", text: "We’ve got this, Alex. Step by step, we're becoming real IT pros." }
    ];
  }

  if (lastText.includes('station feeling') || lastText.includes('office life')) {
    return [
      { icon: '🔍', label: 'Found suspicious processes', text: 'Found some weird suspicious processes already. Digging into the memory dump.' },
      { icon: '⚡', label: 'Loving dual monitors & fiber', text: 'Loving the dual monitors and fast fiber line!' },
      { icon: '🎮', label: '1v1 in Space Fighter tonight?', text: '1v1 in Space Fighter tonight? I beat your high score by 5,000 points!' },
      { icon: '🤝', label: "We've got this, Alex!", text: "We’ve got this, Alex. Step by step, we're becoming real IT pros." }
    ];
  }

  return [
    { icon: '🎓', label: 'Remember our capstone all-nighter?', text: 'Remember our capstone project all-nighter with only 3 hours left? 😂' },
    { icon: '🎮', label: '1v1 in Space Fighter tonight?', text: '1v1 in Space Fighter tonight? I beat your high score by 5,000 points!' },
    { icon: '🚀', label: "What's your dream IT role?", text: "What's your dream IT role once we finish college, Alex?" },
    { icon: '🏢', label: "How's your station feeling?", text: "How's your station feeling so far? Getting used to office life?" },
    { icon: '🤝', label: "We've got this, Alex!", text: "We’ve got this, Alex. Step by step, we're becoming real IT pros." }
  ];
}

function getAlexFriendReply(ethanText) {
  const lower = (ethanText || '').toLowerCase();

  if (lower.includes('capstone') || lower.includes('all-nighter')) {
    return "Bro don't remind me 😂! You were debugging the database in full panic mode while I was frantically printing our documentation at 5 AM!\n\nWalking up that graduation stage with our diplomas in front of our parents made all those sleepless nights worth it though. Do you still remember that compiler bug?";
  }
  if (lower.includes('compiler') || lower.includes('semicolon')) {
    return "100%! 99 errors in the terminal, you fix one missing semicolon, and suddenly there's 102 errors lmao! But look at us now, working on real enterprise tech stations!";
  }
  if (lower.includes('teamwork') || lower.includes('thesis')) {
    return "Fr! That’s why when Ryan accepted us both as interns, I was so hyped. We’ve always had each other’s backs, from high school projects to corporate cybersecurity.";
  }
  if (lower.includes('space fighter') || lower.includes('high score') || lower.includes('1v1')) {
    return "Wait WHAT?! No way, I held that leaderboard spot for 3 whole weeks! 😤 You definitely got lucky on the asteroid wave.\n\nRematch at 8 PM tonight, no excuses. Loser buys lunch tomorrow!";
  }
  if (lower.includes('wallet') || lower.includes('ramen')) {
    return "Keep talking Ethan! I discovered a secret laser power-up route on Stage 4. You’re definitely treating me to extra chashu ramen tomorrow! 🍜";
  }
  if (lower.includes('mod') || lower.includes('pirated') || lower.includes('cracked')) {
    return "Hahaha fair point! Remember that shady 'infinite ammo' mod that turned my old PC into a jet engine? My fans were screaming at 100%! Never again. Now I check hashes and scan everything before running it.";
  }
  if (lower.includes('dream it role') || lower.includes('finish college') || lower.includes('dream role')) {
    return "Man, I really want to specialize in ethical hacking and penetration testing. Finding security holes before bad actors exploit them sounds so awesome.\n\nWhat about you? Still aiming for Cloud Infrastructure or SysAdmin?";
  }
  if (lower.includes('sysadmin') || lower.includes('cloud')) {
    return "That fits you so well, Ethan! You were always the guy fixing everyone's Wi-Fi routers and setting up home servers in school haha. We’re gonna build a crazy good IT startup together someday!";
  }
  if (lower.includes('soc analyst') || lower.includes('soc')) {
    return "Yesss! Threat hunting, reading live packet logs, incident response... We're gonna crush it. Let's make sure we both get certified while we're young!";
  }
  if (lower.includes('station feeling') || lower.includes('office life')) {
    return "It's so weird having a set 8-to-5 schedule instead of school bells, not gonna lie! But having free coffee and crazy fast fiber internet is a massive upgrade. Ryan is super chill as a mentor too.\n\nHow's your malware investigation station going?";
  }
  if (lower.includes('suspicious') || lower.includes('dump') || lower.includes('process')) {
    return "Ooh SysAdmin detective mode! Be careful with live payloads though. Don't blow up the network subnet yet bro! 🕵️ Let me know if you need a second pair of eyes.";
  }
  if (lower.includes('dual monitor') || lower.includes('fiber')) {
    return "Right?! At home I had to wait 2 hours just to download a 10 GB patch. Here it downloads before I finish stirring my coffee. Blessed enterprise bandwidth!";
  }
  if (lower.includes('we\'ve got this') || lower.includes('we’ve got this') || lower.includes('real it pros') || lower.includes('encourag')) {
    return "Always, bro! From cramming for finals together in the library to protecting real company systems. Let’s do our best and make everyone proud! 💪";
  }
  if (lower.includes('lunch') || lower.includes('food') || lower.includes('eat') || lower.includes('coffee')) {
    return "Bro I'm starving! Let's definitely grab lunch together once we wrap up this morning's investigation tasks. Spicy ramen is calling our names!";
  }
  if (lower.includes('graduat') || lower.includes('diploma') || lower.includes('ceremony')) {
    return "Seeing our families in the crowd when they called our names was unforgettable. After all the grinding in high school, seeing us both here feels like Chapter 2 of our lives.";
  }
  if (lower.includes('haha') || lower.includes('lol') || lower.includes('bro') || lower.includes('dude') || lower.includes('yo')) {
    return "Haha classic! Seriously glad we're doing this internship side by side. Makes the whole corporate environment way less intimidating.";
  }

  return "Totally with you, Ethan! Having you as a teammate here makes this whole internship way more fun. Let's keep our momentum going!";
}

function renderAlexFriendChat(container, options = {}) {
  const conn = getPhoneLinkConnectionStatus();
  const isOffline = !conn.isInternetConnected;
  const bannerHtml = isOffline ? renderNoInternetBannerHtml() : '';
  const allMessages = loadAlexFriendMessages();

  const existingInput = document.getElementById('pl-alex-text-input');
  const preservedText = existingInput ? existingInput.value : '';

  container.innerHTML = `
    <div class="pl-convo-view" style="display:flex;flex-direction:column;height:100%;background:#090e18;">
      <!-- Header -->
      <div class="pl-convo-header" style="background:#0f172a;border-bottom:1px solid rgba(255,255,255,0.08);padding:10px 16px;display:flex;align-items:center;gap:12px;">
        <button class="pl-back-btn" onclick="g4ActiveConvo = null; switchPhoneTab('messages')">← Back</button>
        <div style="position:relative;width:36px;height:36px;flex-shrink:0;">
          <img src="assets/Character/Alex.png" alt="Alex" style="width:36px;height:36px;border-radius:50%;object-fit:cover;border:2px solid #eab308;">
          <span style="position:absolute;bottom:0;right:0;width:9px;height:9px;background:${isOffline ? '#f59e0b' : '#22c55e'};border:1.5px solid #0f172a;border-radius:50%;"></span>
        </div>
        <div class="pl-gc-header-info">
          <div class="pl-convo-name" style="font-size:13.5px;font-weight:800;color:#ffffff;line-height:1.2;display:flex;align-items:center;gap:6px;">
            <span>Alex</span>
            <span class="pl-gc-msg-role-tag" style="background:rgba(234,179,8,0.22);color:#facc15;border:1px solid rgba(234,179,8,0.5);">FRIEND</span>
          </div>
          <div class="pl-gc-members-summary">Best Friend &amp; High School Classmate · ${isOffline ? '<span style="color:#f59e0b;">🟡 Offline</span>' : '<span style="color:#22c55e;">🟢 Online</span>'}</div>
        </div>
      </div>

      <!-- Optional No Internet Banner -->
      <div id="pl-gc-banner-slot" class="pl-banner-slot">${bannerHtml}</div>

      <!-- Messages Thread -->
      <div class="pl-convo-messages" id="pl-alex-messages-list" style="flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px;">
        <!-- System event pills -->
        <div class="pl-gc-system-events-container">
          <div class="pl-gc-system-pill">
            🎓 <strong>Alex</strong> is your close friend &amp; high school classmate
          </div>
          <div class="pl-gc-system-pill pl-gc-pill-you">
            💬 Personal chat · Catching up after graduation &amp; internship banter
          </div>
        </div>

        ${allMessages.map((msg, idx) => {
          const isMine = (msg.from === 'ethan') || (msg.from === 'player') || (msg.isPlayer);
          const authorName = isMine ? 'Ethan (You)' : 'Alex';
          const avatarSrc = isMine ? 'assets/Character/Ethan.png' : 'assets/Character/Alex.png';
          const roleTag = isMine ? 'ETHAN (YOU)' : 'FRIEND';
          const roleClass = isMine ? 'pl-gc-role-sysadmin' : 'pl-gc-role-you';

          let seenReceiptHtml = '';
          if (isMine) {
            const isLatestMine = !allMessages.slice(idx + 1).some(m => (m.from === 'ethan') || (m.from === 'player') || (m.isPlayer));
            if (msg.notDelivered) {
              seenReceiptHtml = `
                <div class="pl-gc-seen-row pl-msg-failed-row" style="color:#ef4444;font-size:11px;font-weight:700;display:flex;align-items:center;gap:4px;margin-top:2px;" title="Not delivered — no internet connection">
                  <span>⚠️ Not Delivered • No internet connection</span>
                </div>
              `;
            } else if (isLatestMine) {
              if (!_alexFriendIsTyping) {
                seenReceiptHtml = `
                  <div class="pl-gc-seen-row" title="Seen by Alex">
                    <span class="pl-gc-seen-label">Seen</span>
                    <img src="assets/Character/Alex.png" class="pl-gc-seen-avatar" alt="Alex">
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
                <div class="pl-gc-bubble ${msg.notDelivered ? 'pl-gc-bubble-error' : ''}">${escapeHtml(msg.text)}</div>
                ${seenReceiptHtml}
              </div>
            </div>
          `;
        }).join('')}

        ${_alexFriendIsTyping ? `
          <div class="pl-gc-msg-item theirs pl-typing-active" id="pl-alex-typing-item">
            <img src="assets/Character/Alex.png" class="pl-gc-msg-avatar" alt="Alex">
            <div class="pl-gc-msg-col">
              <div class="pl-gc-msg-meta">
                <span class="pl-gc-msg-author">Alex</span>
                <span class="pl-gc-msg-role-tag pl-gc-role-you">FRIEND</span>
              </div>
              <div class="pl-gc-bubble pl-gc-typing-bubble">
                <span class="pl-typing-dots" aria-hidden="true">
                  <span class="pl-typing-dot"></span>
                  <span class="pl-typing-dot"></span>
                  <span class="pl-typing-dot"></span>
                </span>
                <span class="pl-typing-label">Alex is typing…</span>
              </div>
            </div>
          </div>
        ` : ''}
      </div>

      <!-- Quick Replies & Input Bar -->
      <div class="pl-gc-input-area">
        <div class="pl-gc-quick-replies" style="display:flex;gap:8px;padding:4px 0;flex-wrap:wrap;align-items:center;">
          ${getAlexFriendQuickReplies(allMessages).map(qr => `
            <button type="button" class="pl-gc-chip" data-qr="${escapeHtml(qr.text)}" onclick="sendCustomAlexFriendMessage(this.getAttribute('data-qr'))" style="cursor:pointer;background:rgba(234,179,8,0.18);border:1px solid rgba(234,179,8,0.45);color:#fef08a;font-weight:600;display:inline-flex;align-items:center;gap:6px;border-radius:14px;padding:5px 12px;font-size:12px;" title="${escapeHtml(qr.text)}">
              <span>${qr.icon}</span> <span>${escapeHtml(qr.label)}</span>
            </button>
          `).join('')}
        </div>
        <div class="pl-gc-input-bar">
          <input
            type="text"
            id="pl-alex-text-input"
            class="pl-gc-input"
            placeholder="Message Alex..."
            maxlength="200"
            autocomplete="off"
            value="${escapeHtml(preservedText)}"
            onkeydown="if(event.key==='Enter') sendCustomAlexFriendMessage();"
          >
          <button type="button" class="pl-gc-send-btn" onclick="sendCustomAlexFriendMessage()">
            Send 📨
          </button>
        </div>
      </div>
    </div>
  `;

  // Restore preserved input text if user had already begun typing
  const inp = document.getElementById('pl-alex-text-input');
  if (inp && preservedText) {
    inp.value = preservedText;
  }

  // Auto-scroll to latest message
  const isSmooth = !!options.smoothScroll;
  const list = document.getElementById('pl-alex-messages-list');
  if (list) {
    if (isSmooth) {
      list.scrollTo({ top: list.scrollHeight, behavior: 'smooth' });
      setTimeout(() => {
        const l2 = document.getElementById('pl-alex-messages-list');
        if (l2) l2.scrollTo({ top: l2.scrollHeight, behavior: 'smooth' });
      }, 70);
    } else {
      list.scrollTop = list.scrollHeight;
      setTimeout(() => {
        const l2 = document.getElementById('pl-alex-messages-list');
        if (l2) l2.scrollTop = l2.scrollHeight;
      }, 40);
    }
  }

  if (inp && options.focusInput !== false) {
    setTimeout(() => {
      const i2 = document.getElementById('pl-alex-text-input');
      if (i2 && document.activeElement !== i2 && !options.noFocus) {
        i2.focus();
      }
    }, 60);
  }

  // Clear isNew flag on messages after animation finishes
  let hadNew = false;
  allMessages.forEach(m => {
    if (m.isNew) {
      hadNew = true;
      m.isNew = false;
    }
  });
  if (hadNew) {
    setTimeout(() => {
      saveAlexFriendMessages(allMessages);
    }, 450);
  }
}

function sendAlexFriendMessage(customText) {
  sendCustomAlexFriendMessage(customText);
}

function sendCustomAlexFriendMessage(overrideText) {
  if (_alexFriendIsTyping) return;
  const input = document.getElementById('pl-alex-text-input');
  let typed = (typeof overrideText === 'string' && overrideText.trim())
    ? overrideText.trim()
    : (input ? (input.value || '').trim() : '');

  if (!typed) {
    if (input) input.focus();
    return;
  }
  if (input) input.value = '';

  const conn = getPhoneLinkConnectionStatus();
  if (!conn.isInternetConnected) {
    const msgs = loadAlexFriendMessages();
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    msgs.push({
      id: 'ethan_msg_' + Date.now(),
      from: 'ethan',
      author: 'Ethan',
      roleTag: 'ETHAN (YOU)',
      roleClass: 'pl-gc-role-sysadmin',
      avatar: 'assets/Character/Ethan.png',
      time: timeStr,
      text: typed,
      isNew: true,
      notDelivered: true
    });
    saveAlexFriendMessages(msgs);

    const content = document.getElementById('pl-tab-content');
    if (content && g4ActiveConvo === 'alex_friend') {
      renderAlexFriendChat(content, { smoothScroll: true });
    }

    const bar = document.querySelector('#pl-tab-content .pl-gc-input-bar');
    if (bar) {
      bar.classList.remove('pl-input-bar-error');
      void bar.offsetWidth;
      bar.classList.add('pl-input-bar-error');
      setTimeout(() => bar.classList.remove('pl-input-bar-error'), 500);
    }
    const inp = document.getElementById('pl-alex-text-input');
    if (inp) {
      inp.classList.remove('pl-input-error');
      void inp.offsetWidth;
      inp.classList.add('pl-input-error');
      setTimeout(() => inp.classList.remove('pl-input-error'), 500);
    }
    const banner = document.getElementById('pl-no-internet-banner');
    if (banner) {
      banner.classList.remove('pl-banner-flash-attention');
      void banner.offsetWidth;
      banner.classList.add('pl-banner-flash-attention');
      setTimeout(() => banner.classList.remove('pl-banner-flash-attention'), 700);
    }

    const reason = conn.isAirplane
      ? '✈️ Message not delivered: Airplane Mode is active. Turn off Airplane Mode to message Alex.'
      : (typeof networkSettings !== 'undefined' && !networkSettings.wifi
          ? '📶 Message not delivered: Wi-Fi is turned off. Turn on Wi-Fi to message Alex.'
          : '📶 Message not delivered: No internet connection. Please connect to Wi-Fi to message Alex.');
    if (typeof showToast === 'function') {
      showToast(reason, 'error');
    }
    if (typeof AudioManager !== 'undefined' && AudioManager.playWarning) {
      AudioManager.playWarning();
    }
    return;
  }

  const msgs = loadAlexFriendMessages();
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  msgs.push({
    id: 'ethan_msg_' + Date.now(),
    from: 'ethan',
    author: 'Ethan',
    roleTag: 'ETHAN (YOU)',
    roleClass: 'pl-gc-role-sysadmin',
    avatar: 'assets/Character/Ethan.png',
    time: timeStr,
    text: typed,
    isNew: true
  });
  saveAlexFriendMessages(msgs);

  if (typeof AudioManager !== 'undefined' && AudioManager.playClick) {
    AudioManager.playClick();
  }

  _alexFriendIsTyping = true;
  const content = document.getElementById('pl-tab-content');
  if (content && g4ActiveConvo === 'alex_friend') {
    renderAlexFriendChat(content, { smoothScroll: true });
  }

  setTimeout(() => {
    _alexFriendIsTyping = false;
    const alexReplyText = getAlexFriendReply(typed);

    const replyNow = new Date();
    const replyTime = replyNow.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const updatedMsgs = loadAlexFriendMessages();
    updatedMsgs.push({
      id: 'alex_reply_' + Date.now(),
      from: 'alex',
      author: 'Alex',
      roleTag: 'FRIEND',
      roleClass: 'pl-gc-role-newbie',
      avatar: 'assets/Character/Alex.png',
      time: replyTime,
      text: alexReplyText,
      isNew: true
    });
    saveAlexFriendMessages(updatedMsgs);

    if (content && g4ActiveConvo === 'alex_friend') {
      renderAlexFriendChat(content, { smoothScroll: true });
    }

    if (typeof AudioManager !== 'undefined' && AudioManager.playNotification) {
      AudioManager.playNotification();
    }
  }, 1000);
}

// ═══════════════════════════════════════════════════════════════
// RYAN (IT SUPPORT MENTOR) DIRECT CHAT & CYBERSECURITY MENTORSHIP
// ═══════════════════════════════════════════════════════════════

function getRyanMentorQuickRepliesForEthan(allMessages) {
  const ethanMsgs = (allMessages || []).filter(m => (m.from === 'ethan') || (m.from === 'player') || (m.isPlayer));
  if (!ethanMsgs || ethanMsgs.length === 0) {
    return [
      { icon: '🦠', label: 'Trojans & Ransomware threats', text: 'How do Trojans and Ransomware sneak past defenses?' },
      { icon: '🛡️', label: 'Password security & MFA', text: "What's the best strategy for password security & MFA?" },
      { icon: '🌐', label: 'Safe browsing habits', text: 'Any advice for safe browsing habits and avoiding drive-by downloads?' },
      { icon: '🎓', label: 'Certifications & IT career advice', text: 'What certifications or skills should an IT student prioritize?' },
      { icon: '📜', label: 'Real incident experience', text: 'Have you ever handled a real cyber attack in your career?' }
    ];
  }

  const lastEthan = ethanMsgs[ethanMsgs.length - 1];
  const lastText = (lastEthan.text || '').toLowerCase();

  if (lastText.includes('trojan') || lastText.includes('ransomware') || lastText.includes('malware')) {
    return [
      { icon: '🚨', label: 'What to do when ransomware suspected?', text: 'What should a SysAdmin do first when ransomware is suspected?' },
      { icon: '⛏️', label: 'How to detect hidden cryptominers?', text: 'How can we detect hidden cryptominers on a workstation?' },
      { icon: '🛡️', label: 'Password security & MFA', text: "What's the best strategy for password security & MFA?" },
      { icon: '🎓', label: 'Certifications & IT careers', text: 'What certifications or skills should an IT student prioritize?' }
    ];
  }

  if (lastText.includes('isolate') || lastText.includes('first') || lastText.includes('cryptominer')) {
    return [
      { icon: '⛏️', label: 'How to detect hidden cryptominers?', text: 'How can we detect hidden cryptominers on a workstation?' },
      { icon: '🛡️', label: 'Password security & MFA', text: "What's the best strategy for password security & MFA?" },
      { icon: '🌐', label: 'Safe browsing habits', text: 'Any advice for safe browsing habits and avoiding drive-by downloads?' },
      { icon: '📜', label: 'Real incident experience', text: 'Have you ever handled a real cyber attack in your career?' }
    ];
  }

  if (lastText.includes('password') || lastText.includes('mfa')) {
    return [
      { icon: '📲', label: 'How attackers exploit MFA fatigue?', text: 'How do attackers exploit MFA fatigue?' },
      { icon: '🔑', label: 'Are password managers safe?', text: 'What about password managers — are they completely safe?' },
      { icon: '🌐', label: 'Safe browsing habits', text: 'Any advice for safe browsing habits and avoiding drive-by downloads?' },
      { icon: '🎓', label: 'Certifications & IT careers', text: 'What certifications or skills should an IT student prioritize?' }
    ];
  }

  if (lastText.includes('mfa fatigue') || lastText.includes('password manager')) {
    return [
      { icon: '🌐', label: 'Safe browsing habits', text: 'Any advice for safe browsing habits and avoiding drive-by downloads?' },
      { icon: '🦠', label: 'Trojans & Ransomware threats', text: 'How do Trojans and Ransomware sneak past defenses?' },
      { icon: '🎓', label: 'Certifications & IT careers', text: 'What certifications or skills should an IT student prioritize?' },
      { icon: '📜', label: 'Real incident experience', text: 'Have you ever handled a real cyber attack in your career?' }
    ];
  }

  if (lastText.includes('browsing') || lastText.includes('drive-by')) {
    return [
      { icon: '⚡', label: 'How do drive-by downloads work?', text: 'How do drive-by downloads work without clicking?' },
      { icon: '🔒', label: 'Checking SSL/TLS certificates', text: 'What should I look for in SSL/TLS certificates?' },
      { icon: '🦠', label: 'Trojans & Ransomware threats', text: 'How do Trojans and Ransomware sneak past defenses?' },
      { icon: '🎓', label: 'Certifications & IT careers', text: 'What certifications or skills should an IT student prioritize?' }
    ];
  }

  if (lastText.includes('cert') || lastText.includes('career') || lastText.includes('prioritize') || lastText.includes('skills')) {
    return [
      { icon: '🖥️', label: 'Home lab projects to stand out', text: 'What projects can I build in a home lab to stand out?' },
      { icon: '⚔️', label: 'Blue Team vs Red Team roles', text: 'What is the difference between Blue Team and Red Team roles?' },
      { icon: '📜', label: 'Real incident experience', text: 'Have you ever handled a real cyber attack in your career?' },
      { icon: '🛡️', label: 'Password security & MFA', text: "What's the best strategy for password security & MFA?" }
    ];
  }

  if (lastText.includes('home lab') || lastText.includes('blue team') || lastText.includes('red team')) {
    return [
      { icon: '📜', label: 'Real incident experience', text: 'Have you ever handled a real cyber attack in your career?' },
      { icon: '🦠', label: 'Trojans & Ransomware threats', text: 'How do Trojans and Ransomware sneak past defenses?' },
      { icon: '🛡️', label: 'Password security & MFA', text: "What's the best strategy for password security & MFA?" },
      { icon: '🌐', label: 'Safe browsing habits', text: 'Any advice for safe browsing habits and avoiding drive-by downloads?' }
    ];
  }

  if (lastText.includes('attack') || lastText.includes('experience') || lastText.includes('incident')) {
    return [
      { icon: '🧹', label: 'Hardest part of remediation?', text: 'What was the hardest part of cleaning up that incident?' },
      { icon: '🦠', label: 'Trojans & Ransomware threats', text: 'How do Trojans and Ransomware sneak past defenses?' },
      { icon: '🎓', label: 'Certifications & IT careers', text: 'What certifications or skills should an IT student prioritize?' },
      { icon: '🌐', label: 'Safe browsing habits', text: 'Any advice for safe browsing habits and avoiding drive-by downloads?' }
    ];
  }

  return [
    { icon: '🦠', label: 'Trojans & Ransomware threats', text: 'How do Trojans and Ransomware sneak past defenses?' },
    { icon: '🛡️', label: 'Password security & MFA', text: "What's the best strategy for password security & MFA?" },
    { icon: '🌐', label: 'Safe browsing habits', text: 'Any advice for safe browsing habits and avoiding drive-by downloads?' },
    { icon: '🎓', label: 'Certifications & IT careers', text: 'What certifications or skills should an IT student prioritize?' },
    { icon: '📜', label: 'Real incident experience', text: 'Have you ever handled a real cyber attack in your career?' }
  ];
}

function getRyanMentorReplyForEthan(typed) {
  const lower = (typed || '').toLowerCase();

  if (lower.includes('isolate') || (lower.includes('first') && lower.includes('ransomware'))) {
    return "Immediate step #1: DISCONNECT the affected machine from the network immediately! Unplug the Ethernet cable or turn off Wi-Fi.\n\nThis prevents the ransomware from spreading laterally via SMB/shares to other department computers or contacting its Command & Control (C2) servers. Next, take a memory dump (RAM) if possible before powering off, because encryption keys might still linger in volatile memory. Never pay the ransom — rely on immutable offline backups!";
  }

  if (lower.includes('cryptominer') || lower.includes('cpu spike')) {
    return "To spot cryptominers:\n\n1. Look for unexplained high CPU/GPU utilization (often pinned at 90-100%) during idle hours.\n2. Inspect outbound network connections on common mining pool ports (like 3333, 4444, 5555, or 14444).\n3. Check Windows Task Scheduler and registry Run keys for scripts downloading random base64 payloads.\n4. Watch for processes masquerading with names similar to Windows services (like 'scvhost.exe' or 'svch0st.exe').";
  }

  if (lower.includes('trojan') || lower.includes('ransomware') || lower.includes('sneak') || lower.includes('malware')) {
    return "Trojans are masters of disguise. They usually arrive hidden inside pirated software, cracked game utilities, fake browser updates, or phishing invoice attachments. Once the user double-clicks, the dropper quietly executes in the background, disables defenses, and downloads the actual payload — which could be ransomware that encrypts your files or an infostealer.\n\nAs a SysAdmin, always verify file hashes (SHA-256), inspect digital signatures, and enforce application whitelisting!";
  }

  if (lower.includes('mfa fatigue') || lower.includes('push bombing')) {
    return "MFA fatigue (or push bombing) happens when attackers obtain stolen passwords and flood the victim's phone with login approval notifications at 2:00 AM. The victim, exhausted or confused, eventually taps 'Approve' just to silence the alerts.\n\nThe modern defense is 'Number Matching': the login screen displays a two-digit number that the user must manually enter inside the authenticator app. That completely stops blind approvals!";
  }

  if (lower.includes('password manager') || lower.includes('managers')) {
    return "Password managers are arguably the most effective daily security tool! They let you use unique, 20+ character random passwords for every single service. If one company suffers a database breach, none of your other accounts are compromised.\n\nJust ensure you secure your master vault with a long passphrase and hardware-based MFA (FIDO2 or TOTP authenticator).";
  }

  if (lower.includes('password') || lower.includes('passphrase') || lower.includes('mfa') || lower.includes('2fa') || lower.includes('account protection')) {
    return "Passphrases beat complex passwords every time! A random 4-word passphrase like 'walrus-guitar-galaxy-apricot' has over 50 bits of entropy and is practically impossible to brute-force, while being easy for humans to remember.\n\nCombine passphrases with Multi-Factor Authentication (MFA). App-based authenticators (like Google Authenticator or Microsoft Authenticator) or hardware security keys (YubiKeys) are vastly superior to SMS, which is susceptible to SIM-swapping.";
  }

  if (lower.includes('drive-by') || lower.includes('drive by')) {
    return "A drive-by download happens without you ever clicking 'Download'. You visit a legitimate website that was compromised or hosting malicious ads (malvertising). Hidden exploit kits scan your browser and operating system for unpatched security flaws and silently inject shellcode into memory.\n\nThe #1 defense? Keep your browser, OS, and software updated immediately whenever security patches release!";
  }

  if (lower.includes('ssl') || lower.includes('tls') || lower.includes('certificate')) {
    return "When inspecting SSL/TLS certificates, look beyond just the green padlock: click the padlock to view the issued certificate. Verify who the certificate was issued to, check the Certificate Authority (CA) validity, and beware of lookalike domains (e.g. 'paypa1.com' or 'account-update-support.xyz'). Never click past browser certificate warning errors on enterprise machines!";
  }

  if (lower.includes('browsing') || lower.includes('safe habits') || lower.includes('download')) {
    return "Safe browsing essentials for IT professionals:\n\n1. Keep browser extensions minimal. Shady extensions can read cookies, passwords, and inject ads.\n2. Never download game cracks or keygens — telemetry shows over 60% carry bundled malware.\n3. Always hover over hyperlinks to verify the true destination URL before clicking.\n4. Use DNS protection (like Quad9 9.9.9.9 or Cloudflare 1.1.1.2) that automatically blocks known malicious domains.";
  }

  if (lower.includes('home lab') || lower.includes('lab project') || lower.includes('projects')) {
    return "Building a home lab is the single best way to learn! Here are high-impact projects:\n\n1. Install VirtualBox or Proxmox (free).\n2. Spin up Windows Server and configure Active Directory Domain Services with users, groups, and Group Policies (GPO).\n3. Set up a Linux server running pfSense or OPNsense as a virtual firewall.\n4. Deploy an open-source SIEM like Wazuh to ingest security logs from your virtual machines.\n\nDocument these on GitHub and you'll stand out from 95% of job applicants!";
  }

  if (lower.includes('blue team') || lower.includes('red team') || lower.includes('roles') || lower.includes('difference')) {
    return "Great question! In cybersecurity:\n\n🛡️ Blue Team (Defensive): Focuses on protecting assets. Roles include SOC Analysts, Incident Responders, and Security Engineers who monitor logs, hunt threats, and harden servers.\n\n⚔️ Red Team (Offensive): Focuses on testing defenses by simulating adversary tactics. Roles include Penetration Testers and Ethical Hackers.\n\nI always advise beginners to start in Blue Team defense or SysAdmin infrastructure — knowing how systems are built and defended makes you far more effective in any security role!";
  }

  if (lower.includes('cert') || lower.includes('certification') || lower.includes('career') || lower.includes('student') || lower.includes('prioritize') || lower.includes('advice')) {
    return "For an aspiring IT and cybersecurity student, here's my roadmap:\n\n1. Foundational Certs: Start with CompTIA Network+ to master networking, then CompTIA Security+ for core security concepts. These certs satisfy DoD 8570 baseline requirements and bypass automated HR filters.\n2. Hands-on Skills: Learn Linux command line basics and either Python or PowerShell scripting for automation.\n3. Networking Intuition: Understand how packets move, what DNS does, and how firewalls filter traffic.\n\nMost importantly: stay curious, experiment in virtual labs, and never stop learning!";
  }

  if (lower.includes('hardest part') || lower.includes('cleaning up') || lower.includes('remediation')) {
    return "The hardest part of remediation isn't killing the malware — it's ensuring total eradication of persistence! Attackers often plant secondary backdoors, create stealthy scheduled tasks, and add unauthorized user accounts. If you don't find all of them, they'll simply reinfect the network next week. That's why thorough log analysis and forensic root cause analysis are crucial.";
  }

  if (lower.includes('attack') || lower.includes('incident') || lower.includes('experience') || lower.includes('story')) {
    return "Early in my career, an employee found an unlabelled USB flash drive in our company parking lot and plugged it in out of curiosity — classic baiting attack! A cryptominer and backdoor immediately began running across the subnet.\n\nWe had to isolate the entire VLAN segment, analyze the memory artifacts, and reconstruct the incident timeline. It proved to me that the human element is the ultimate security perimeter. That's why awareness training is so vital.";
  }

  if (lower.includes('phish') || lower.includes('email') || lower.includes('link') || lower.includes('suspicious link')) {
    return "Phishing remains the #1 initial access vector for ransomware and data breaches worldwide. Threat actors use lookalike domains (typosquatting), forged headers, and emotional triggers like urgent fear or executive authority. As IT staff, always inspect the full email headers, check the Return-Path, and analyze hyperlinks in an isolated sandbox.";
  }

  if (lower.includes('privacy') || lower.includes('digital footprint') || lower.includes('online safety')) {
    return "Digital privacy starts with understanding your attack surface: review what third-party apps have access to your Google/Microsoft accounts, use encrypted messaging (like Signal), never reuse passwords across services, and avoid public Wi-Fi without an encrypted tunnel. What you keep private cannot be breached!";
  }

  if (lower.includes('thanks') || lower.includes('thank you') || lower.includes('appreciate') || lower.includes('got it')) {
    return "You're very welcome, Ethan! You're asking the exact right questions for a budding SysAdmin. Keep that curiosity burning — security is all about understanding how things work underneath the hood!";
  }

  return "Good question, Ethan! As a SysAdmin, seeing how operating system processes, network sockets, and user permissions interlock is fundamental to securing any environment. Let me know if you want to explore malware persistence, firewall policies, or certifications next!";
}

function openRyanMentorConversation() {
  g4ActiveConvo = 'ryan_mentor';
  g4ActiveTab = 'messages';

  const tabs = document.querySelectorAll('.pl-tab');
  tabs.forEach(t => {
    const id = t.id.replace('pl-tab-', '');
    t.classList.toggle('active', id === 'messages');
  });

  const content = document.getElementById('pl-tab-content');
  if (!content) return;

  renderRyanMentorChat(content);

  if (g4PhoneScreenView !== 'home') {
    showPhoneInAppScreen('messages');
  }
}

function renderRyanMentorChat(container, options = {}) {
  const conn = getPhoneLinkConnectionStatus();
  const isOffline = !conn.isInternetConnected;
  const bannerHtml = isOffline ? renderNoInternetBannerHtml() : '';
  const isCh1Unlocked = isChapter1CompletedAndSaved();
  const curChar = getCurrentPhoneCharacter();
  const isEthan = curChar.id === 'ethan';
  const allMessages = loadRyanMentorMessages();

  const existingInput = document.getElementById('pl-ryan-text-input');
  const preservedText = existingInput ? existingInput.value : '';

  container.innerHTML = `
    <div class="pl-convo-view" style="display:flex;flex-direction:column;height:100%;background:#090e18;">
      <!-- Header -->
      <div class="pl-convo-header" style="background:#0f172a;border-bottom:1px solid rgba(255,255,255,0.08);padding:10px 16px;display:flex;align-items:center;gap:12px;">
        <button class="pl-back-btn" onclick="g4ActiveConvo = null; switchPhoneTab('messages')">← Back</button>
        <div style="position:relative;width:36px;height:36px;flex-shrink:0;">
          <img src="assets/Character/Ryan.png" alt="Ryan" style="width:36px;height:36px;border-radius:50%;object-fit:cover;border:2px solid #38bdf8;">
          <span style="position:absolute;bottom:0;right:0;width:9px;height:9px;background:${isOffline ? '#f59e0b' : '#22c55e'};border:1.5px solid #0f172a;border-radius:50%;"></span>
        </div>
        <div class="pl-gc-header-info">
          <div class="pl-convo-name" style="font-size:13.5px;font-weight:800;color:#ffffff;line-height:1.2;display:flex;align-items:center;gap:6px;">
            <span>Ryan (IT Support Mentor)</span>
            <span class="pl-gc-msg-role-tag pl-gc-role-mentor">MENTOR</span>
          </div>
          <div class="pl-gc-members-summary">IT Support Mentor · ${isOffline ? '<span style="color:#f59e0b;">🟡 Offline</span>' : '<span style="color:#22c55e;">🟢 Online</span>'}</div>
        </div>
      </div>

      <!-- Optional No Internet Banner -->
      <div id="pl-gc-banner-slot" class="pl-banner-slot">${bannerHtml}</div>

      <!-- Messages Thread -->
      <div class="pl-convo-messages" id="pl-ryan-messages-list" style="flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px;">
        <!-- System event pills -->
        <div class="pl-gc-system-events-container">
          <div class="pl-gc-system-pill">
            🛡️ <strong>Ryan</strong> is your assigned <strong>IT Support Mentor</strong>
          </div>
          <div class="pl-gc-system-pill pl-gc-pill-you">
            ${isEthan
              ? '🔒 Direct support line · SysAdmin, Malware Analysis &amp; Cybersecurity Mentorship'
              : '🔒 Direct support line · Phishing training &amp; simulation assistance'}
          </div>
        </div>

        ${allMessages.map((msg, idx) => {
          const isMine = (msg.from === curChar.id) || (msg.from === 'player') || (msg.isPlayer) || (isEthan && msg.from === 'ethan') || (!isEthan && msg.from === 'alex');
          const authorName = isMine ? curChar.displayName : 'Ryan';
          const avatarSrc = isMine ? curChar.avatar : 'assets/Character/Ryan.png';
          const roleTag = isMine ? (isEthan ? 'SYSADMIN' : 'RECRUIT') : (msg.roleTag || 'MENTOR');
          const roleClass = isMine ? (isEthan ? 'pl-gc-role-sysadmin' : 'pl-gc-role-you') : 'pl-gc-role-mentor';

          let seenReceiptHtml = '';
          if (isMine) {
            const isLatestMine = !allMessages.slice(idx + 1).some(m => (m.from === curChar.id) || (m.from === 'player') || (m.isPlayer) || (isEthan && m.from === 'ethan') || (!isEthan && m.from === 'alex'));
            if (msg.notDelivered) {
              seenReceiptHtml = `
                <div class="pl-gc-seen-row pl-msg-failed-row" style="color:#ef4444;font-size:11px;font-weight:700;display:flex;align-items:center;gap:4px;margin-top:2px;" title="Not delivered — no internet connection">
                  <span>⚠️ Not Delivered • No internet connection</span>
                </div>
              `;
            } else if (isLatestMine) {
              if (!_ryanMentorIsTyping) {
                seenReceiptHtml = `
                  <div class="pl-gc-seen-row" title="Seen by Ryan">
                    <span class="pl-gc-seen-label">Seen</span>
                    <img src="assets/Character/Ryan.png" class="pl-gc-seen-avatar" alt="Ryan">
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
                <div class="pl-gc-bubble ${msg.notDelivered ? 'pl-gc-bubble-error' : ''}">${escapeHtml(msg.text)}</div>
                ${seenReceiptHtml}
              </div>
            </div>
          `;
        }).join('')}

        ${_ryanMentorIsTyping ? `
          <div class="pl-gc-msg-item theirs pl-typing-active" id="pl-ryan-typing-item">
            <img src="assets/Character/Ryan.png" class="pl-gc-msg-avatar" alt="Ryan">
            <div class="pl-gc-msg-col">
              <div class="pl-gc-msg-meta">
                <span class="pl-gc-msg-author">Ryan</span>
                <span class="pl-gc-msg-role-tag pl-gc-role-mentor">MENTOR</span>
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
        ` : ''}
      </div>

      <!-- Quick Replies & Input Bar -->
      <div class="pl-gc-input-area">
        <div class="pl-gc-quick-replies" style="display:flex;gap:8px;padding:4px 0;flex-wrap:wrap;align-items:center;">
          ${isEthan ? `
            ${getRyanMentorQuickRepliesForEthan(allMessages).map(qr => `
              <button type="button" class="pl-gc-chip" data-qr="${escapeHtml(qr.text)}" onclick="sendCustomRyanMentorMessage(this.getAttribute('data-qr'))" style="cursor:pointer;background:rgba(56,189,248,0.18);border:1px solid rgba(56,189,248,0.45);color:#f0f9ff;font-weight:600;display:inline-flex;align-items:center;gap:6px;border-radius:14px;padding:5px 12px;font-size:12px;" title="${escapeHtml(qr.text)}">
                <span>${qr.icon}</span> <span>${escapeHtml(qr.label)}</span>
              </button>
            `).join('')}
          ` : (isCh1Unlocked ? `
            <button type="button" class="pl-gc-chip pl-gc-chip-highlight" data-action="retry_investigation" onclick="sendRyanMentorRequest('retry_investigation')" style="cursor:pointer;background:rgba(56,189,248,0.2);border:1.5px solid #38bdf8;color:#f0f9ff;font-weight:700;display:inline-flex;align-items:center;gap:6px;border-radius:14px;padding:5px 12px;font-size:12px;box-shadow:0 2px 8px rgba(56,189,248,0.25);" title="Restart all 5 emails in Zmail &amp; reset checklist for a full retry">
              <span>🔁</span> <span>Retry Phishing Investigation</span> <span style="font-size:10px;color:#7dd3fc;margin-left:2px;">(Click to retry)</span>
            </button>
            <button type="button" class="pl-gc-chip" data-qr="How do I spot phishing clues, Ryan?" onclick="sendCustomRyanMentorMessage('How do I spot phishing clues, Ryan?')" style="cursor:pointer;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.15);color:#cbd5e1;font-weight:600;display:inline-flex;align-items:center;gap:6px;border-radius:14px;padding:5px 12px;font-size:12px;" title="Ask for phishing tips">
              <span>💡</span> <span>How do I spot phishing clues?</span>
            </button>
          ` : `
            <div style="font-size:11px;color:#94a3b8;display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);padding:4px 10px;border-radius:12px;">
              <span>🔒</span> <span>Complete Chapter 1 &amp; save desktop progress to unlock Phishing Retries</span>
            </div>
          `)}
        </div>
        <div class="pl-gc-input-bar">
          <input
            type="text"
            id="pl-ryan-text-input"
            class="pl-gc-input"
            placeholder="Message Ryan (IT Support Mentor)..."
            maxlength="200"
            autocomplete="off"
            value="${escapeHtml(preservedText)}"
            onkeydown="if(event.key==='Enter') sendCustomRyanMentorMessage();"
          >
          <button type="button" class="pl-gc-send-btn" onclick="sendCustomRyanMentorMessage()">
            Send 📨
          </button>
        </div>
      </div>
    </div>
  `;

  // Restore preserved input text if user had already begun typing
  const inp = document.getElementById('pl-ryan-text-input');
  if (inp && preservedText) {
    inp.value = preservedText;
  }

  // Auto-scroll to latest message: smooth on send/receive/typing, instant on initial open
  const isSmooth = !!options.smoothScroll;
  const list = document.getElementById('pl-ryan-messages-list');
  if (list) {
    if (isSmooth) {
      list.scrollTo({ top: list.scrollHeight, behavior: 'smooth' });
      setTimeout(() => {
        const l2 = document.getElementById('pl-ryan-messages-list');
        if (l2) l2.scrollTo({ top: l2.scrollHeight, behavior: 'smooth' });
      }, 70);
    } else {
      list.scrollTop = list.scrollHeight;
      setTimeout(() => {
        const l2 = document.getElementById('pl-ryan-messages-list');
        if (l2) l2.scrollTop = l2.scrollHeight;
      }, 40);
    }
  }

  if (inp && options.focusInput !== false) {
    setTimeout(() => {
      const i2 = document.getElementById('pl-ryan-text-input');
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
      saveRyanMentorMessages(allMessages);
    }, 450);
  }
}

function sendRyanMentorRequest(type, customText) {
  if (_ryanMentorIsTyping) return;

  const curChar = getCurrentPhoneCharacter();
  if (curChar.id === 'ethan') {
    sendCustomRyanMentorMessage(customText);
    return;
  }

  const conn = getPhoneLinkConnectionStatus();
  if (!conn.isInternetConnected) {
    const reason = conn.isAirplane
      ? '✈️ Cannot reach Ryan: Airplane Mode is active. Turn off Airplane Mode to contact your mentor.'
      : (typeof networkSettings !== 'undefined' && !networkSettings.wifi
          ? '📶 Cannot reach Ryan: Wi-Fi is turned off. Turn on Wi-Fi to contact your mentor.'
          : '📶 Cannot reach Ryan: No internet connection. Please connect to Wi-Fi to contact your mentor.');
    if (typeof showToast === 'function') {
      showToast(reason, 'error');
    }
    if (typeof AudioManager !== 'undefined' && AudioManager.playWarning) {
      AudioManager.playWarning();
    }
    const bar = document.querySelector('#pl-tab-content .pl-gc-input-bar');
    if (bar) {
      bar.classList.remove('pl-input-bar-error');
      void bar.offsetWidth;
      bar.classList.add('pl-input-bar-error');
      setTimeout(() => bar.classList.remove('pl-input-bar-error'), 500);
    }
    const inp = document.getElementById('pl-ryan-text-input');
    if (inp) {
      inp.classList.remove('pl-input-error');
      void inp.offsetWidth;
      inp.classList.add('pl-input-error');
      setTimeout(() => inp.classList.remove('pl-input-error'), 500);
    }
    const banner = document.getElementById('pl-no-internet-banner');
    if (banner) {
      banner.classList.remove('pl-banner-flash-attention');
      void banner.offsetWidth;
      banner.classList.add('pl-banner-flash-attention');
      setTimeout(() => banner.classList.remove('pl-banner-flash-attention'), 700);
    }
    return;
  }

  const msgs = loadRyanMentorMessages();
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  let playerText = customText || '';
  if (!playerText) {
    playerText = "Ryan, can I retry the phishing investigation from the beginning?";
  }

  msgs.push({
    id: 'alex_req_' + Date.now(),
    from: 'alex',
    author: 'Alex',
    roleTag: 'RECRUIT',
    roleClass: 'pl-gc-role-you',
    avatar: 'assets/Character/Alex.png',
    time: timeStr,
    text: playerText,
    isNew: true
  });
  saveRyanMentorMessages(msgs);

  if (typeof AudioManager !== 'undefined' && AudioManager.playClick) {
    AudioManager.playClick();
  }

  _ryanMentorIsTyping = true;
  const content = document.getElementById('pl-tab-content');
  if (content && g4ActiveConvo === 'ryan_mentor') {
    renderRyanMentorChat(content, { smoothScroll: true });
  }

  setTimeout(() => {
    _ryanMentorIsTyping = false;
    retryPhishingActivity();
    const ryanReplyText = "Ok. Good luck! Here are some tips to help with your investigation:\n\n" +
      "💡 Inspect the Sender: Always check the sender's full email address carefully for slight typos, numbers, or lookalike domains (e.g. paypa1.com).\n" +
      "💡 Watch for Urgency: Phishing emails often pressure you with urgent deadlines, threats of account lockout, or fear.\n" +
      "💡 Check Links & Attachments: Hover over links to preview the real destination URL, and be suspicious of unexpected file attachments.\n" +
      "💡 Flag Clues First: Use Flag Mode in Zmail to pinpoint evidence before submitting your verdict.\n\n" +
      "I've reset all 5 emails in Zmail and your Sticky Note checklist goals. Head over to Zmail and take your time!";

    const replyNow = new Date();
    const replyTime = replyNow.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const updatedMsgs = loadRyanMentorMessages();
    updatedMsgs.push({
      id: 'ryan_reply_' + Date.now(),
      from: 'ryan',
      author: 'Ryan',
      roleTag: 'IT SUPPORT MENTOR',
      roleClass: 'pl-gc-role-mentor',
      avatar: 'assets/Character/Ryan.png',
      time: replyTime,
      text: ryanReplyText,
      isNew: true
    });
    saveRyanMentorMessages(updatedMsgs);

    if (content && g4ActiveConvo === 'ryan_mentor') {
      renderRyanMentorChat(content, { smoothScroll: true });
    }

    if (typeof AudioManager !== 'undefined' && AudioManager.playNotification) {
      AudioManager.playNotification();
    }
  }, 1000);
}

function sendCustomRyanMentorMessage(overrideText) {
  if (_ryanMentorIsTyping) return;
  const curChar = getCurrentPhoneCharacter();
  const isEthan = curChar.id === 'ethan';
  const input = document.getElementById('pl-ryan-text-input');
  let typed = (typeof overrideText === 'string' && overrideText.trim())
    ? overrideText.trim()
    : (input ? (input.value || '').trim() : '');

  if (!typed) {
    if (input) input.focus();
    return;
  }
  if (input) input.value = '';

  const conn = getPhoneLinkConnectionStatus();
  if (!conn.isInternetConnected) {
    const msgs = loadRyanMentorMessages();
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    msgs.push({
      id: (isEthan ? 'ethan_msg_' : 'alex_msg_') + Date.now(),
      from: isEthan ? 'ethan' : 'alex',
      author: isEthan ? 'Ethan' : 'Alex',
      roleTag: isEthan ? 'SYSADMIN' : 'RECRUIT',
      roleClass: isEthan ? 'pl-gc-role-sysadmin' : 'pl-gc-role-you',
      avatar: isEthan ? 'assets/Character/Ethan.png' : 'assets/Character/Alex.png',
      time: timeStr,
      text: typed,
      isNew: true,
      notDelivered: true
    });
    saveRyanMentorMessages(msgs);

    const content = document.getElementById('pl-tab-content');
    if (content && g4ActiveConvo === 'ryan_mentor') {
      renderRyanMentorChat(content, { smoothScroll: true });
    }

    const bar = document.querySelector('#pl-tab-content .pl-gc-input-bar');
    if (bar) {
      bar.classList.remove('pl-input-bar-error');
      void bar.offsetWidth;
      bar.classList.add('pl-input-bar-error');
      setTimeout(() => bar.classList.remove('pl-input-bar-error'), 500);
    }
    const inp = document.getElementById('pl-ryan-text-input');
    if (inp) {
      inp.classList.remove('pl-input-error');
      void inp.offsetWidth;
      inp.classList.add('pl-input-error');
      setTimeout(() => inp.classList.remove('pl-input-error'), 500);
    }
    const banner = document.getElementById('pl-no-internet-banner');
    if (banner) {
      banner.classList.remove('pl-banner-flash-attention');
      void banner.offsetWidth;
      banner.classList.add('pl-banner-flash-attention');
      setTimeout(() => banner.classList.remove('pl-banner-flash-attention'), 700);
    }

    const reason = conn.isAirplane
      ? '✈️ Message not delivered: Airplane Mode is active. Turn off Airplane Mode to message Ryan.'
      : (typeof networkSettings !== 'undefined' && !networkSettings.wifi
          ? '📶 Message not delivered: Wi-Fi is turned off. Turn on Wi-Fi to message Ryan.'
          : '📶 Message not delivered: No internet connection. Please connect to Wi-Fi to message Ryan.');
    if (typeof showToast === 'function') {
      showToast(reason, 'error');
    }
    if (typeof AudioManager !== 'undefined' && AudioManager.playWarning) {
      AudioManager.playWarning();
    }
    return;
  }

  const msgs = loadRyanMentorMessages();
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  msgs.push({
    id: (isEthan ? 'ethan_msg_' : 'alex_msg_') + Date.now(),
    from: isEthan ? 'ethan' : 'alex',
    author: isEthan ? 'Ethan' : 'Alex',
    roleTag: isEthan ? 'SYSADMIN' : 'RECRUIT',
    roleClass: isEthan ? 'pl-gc-role-sysadmin' : 'pl-gc-role-you',
    avatar: isEthan ? 'assets/Character/Ethan.png' : 'assets/Character/Alex.png',
    time: timeStr,
    text: typed,
    isNew: true
  });
  saveRyanMentorMessages(msgs);

  if (typeof AudioManager !== 'undefined' && AudioManager.playClick) {
    AudioManager.playClick();
  }

  _ryanMentorIsTyping = true;
  const content = document.getElementById('pl-tab-content');
  if (content && g4ActiveConvo === 'ryan_mentor') {
    renderRyanMentorChat(content, { smoothScroll: true });
  }

  setTimeout(() => {
    _ryanMentorIsTyping = false;
    let ryanReplyText = "";

    if (isEthan) {
      ryanReplyText = getRyanMentorReplyForEthan(typed);
    } else {
      const lower = typed.toLowerCase();
      const isCh1Unlocked = isChapter1CompletedAndSaved();

      if (!isCh1Unlocked) {
        ryanReplyText = "Hey Alex! Make sure to complete Chapter 1 (Phishing Investigation) and save your desktop progress first. Once that's done, you can message me here anytime to retry the phishing activity or restart the Zmail investigation!";
      } else if (lower.includes('retry') || lower.includes('practice') || lower.includes('start over') || lower.includes('again')) {
        retryPhishingActivity();
        ryanReplyText = "Ok. Good luck! Here are some tips to help with your investigation:\n\n" +
          "💡 Inspect the Sender: Always check the sender's full email address carefully for slight typos, numbers, or lookalike domains (e.g. paypa1.com).\n" +
          "💡 Watch for Urgency: Phishing emails often pressure you with urgent deadlines, threats of account lockout, or fear.\n" +
          "💡 Check Links & Attachments: Hover over links to preview the real destination URL, and be suspicious of unexpected file attachments.\n" +
          "💡 Flag Clues First: Use Flag Mode in Zmail to pinpoint evidence before submitting your verdict.\n\n" +
          "I've reset all 5 emails in Zmail and your Sticky Note checklist goals. Head over to Zmail and take your time!";
      } else if (lower.includes('zmail') || lower.includes('email') || lower.includes('inbox')) {
        ryanReplyText = "In Zmail, remember to inspect the sender domain, check for urgent or threatening language, and hover over links before clicking. Click 'Retry Phishing Investigation' below anytime to restart your practice!";
      } else if (lower.includes('checklist') || lower.includes('sticky') || lower.includes('notes') || lower.includes('goal')) {
        ryanReplyText = "Your Sticky Notes checklist tracks all 5 phishing mission goals. You can click 'Retry Phishing Investigation' below to clear your checklist goals and practice again from scratch!";
      } else if (lower.includes('help') || lower.includes('tip') || lower.includes('how')) {
        ryanReplyText = "Pro tip: Phishers love using lookalike domains (like paypa1.com or support-secure.net) and creating fake urgency. Always check the full sender address and inspect links carefully!";
      } else {
        ryanReplyText = "I'm right here if you need anything! If you want to practice identifying phishing emails again, just message me through Phone Link, and I'll help you retry the phishing activity!";
      }
    }

    const replyNow = new Date();
    const replyTime = replyNow.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const updatedMsgs = loadRyanMentorMessages();
    updatedMsgs.push({
      id: 'ryan_reply_' + Date.now(),
      from: 'ryan',
      author: 'Ryan',
      roleTag: 'IT SUPPORT MENTOR',
      roleClass: 'pl-gc-role-mentor',
      avatar: 'assets/Character/Ryan.png',
      time: replyTime,
      text: ryanReplyText,
      isNew: true
    });
    saveRyanMentorMessages(updatedMsgs);

    if (content && g4ActiveConvo === 'ryan_mentor') {
      renderRyanMentorChat(content, { smoothScroll: true });
    }

    if (typeof AudioManager !== 'undefined' && AudioManager.playNotification) {
      AudioManager.playNotification();
    }
  }, 1000);
}

// ── THREE PHISHING RETRY ACTIONS (STRICT CHAPTER 1 SCOPE ONLY) ──

function retryPhishingActivity() {
  // 1. Reset Zmail interface completely
  if (typeof resetCh1ZmailInterface === 'function') {
    resetCh1ZmailInterface();
  }
  // 2. Clear gameState phishing variables
  if (typeof gameState !== 'undefined') {
    gameState.score = 0;
    gameState.correctDecisions = 0;
    gameState.phishingDetected = 0;
    gameState.legitimateDetected = 0;
    gameState.evidenceFoundTotal = 0;
    gameState.currentEmail = 0;
    gameState.emailResults = [];
    gameState.flagModeActive = false;
    gameState.currentEmailFlags = [];
    gameState.pendingLinkUrl = null;
    gameState.pendingLinkFlagId = null;
    gameState.pendingLinkFlagType = null;
    gameState.phase = 'mission';
  }
  window._isPhishingRetryActive = true;
  window._currentChapterCategory = 'phishing';
  window._awardClaimed = false;
  window._ch1CompletedSandbox = false;
  window._phishAutoModalShown = false;
  if (typeof _phishingEarnedAward !== 'undefined') {
    _phishingEarnedAward = null;
  }

  // 3. Reset Wave 1 emails in Zmail
  if (typeof ch1InjectWave === 'function') {
    ch1InjectWave(1);
  }
  // 4. Reset checklist achievements
  if (typeof _achievementUnlocked !== 'undefined') {
    _achievementUnlocked.delete('task_report_phishing');
    _achievementUnlocked.delete('task_verify_legit');
    _achievementUnlocked.delete('task_fake_sender');
    _achievementUnlocked.delete('task_phish_indicators');
    _achievementUnlocked.delete('task_submit_all_verdicts');
    _achievementUnlocked.delete('task_all_complete');
    _achievementUnlocked.delete('phish_trophy_unlocked');
    _achievementUnlocked.delete('ach_phishing');
  }
  // Ensure the intern group chat in Phone Link remains restored and active
  try {
    localStorage.setItem('cyberzero_gc_unlocked', 'true');
  } catch(e) {}
  if (typeof setNewbieGcCreated === 'function') {
    setNewbieGcCreated(false);
  }

  // 5. Reset desktop trophy visual
  if (typeof updateDesktopTrophyDisplay === 'function') {
    updateDesktopTrophyDisplay();
  }
  // 6. Update Sticky Notes to show the phishing investigation checklist
  if (typeof renderPhishingChecklist === 'function') {
    renderPhishingChecklist();
  } else if (typeof updateStickyNoteForPhase === 'function') {
    updateStickyNoteForPhase('phishing');
  } else if (typeof updateStickyChecklist === 'function') {
    updateStickyChecklist();
  }
  if (typeof showStickyNote === 'function') {
    showStickyNote();
  }
  // 7. Save phishing state locally
  if (typeof savePhishingProgress === 'function') {
    savePhishingProgress();
  }
  // 8. Open Zmail app
  if (typeof openApp === 'function') {
    openApp('email');
  }
  if (typeof showToast === 'function') {
    showToast('🔄 Phishing investigation reset! All emails and checklist refreshed.', 'info');
  }
}

function restartPhishingInvestigationZmail() {
  // 1. Reset Zmail interface completely
  if (typeof resetCh1ZmailInterface === 'function') {
    resetCh1ZmailInterface();
  }
  // 2. Clear Zmail email results & active email
  if (typeof gameState !== 'undefined') {
    gameState.currentEmail = 0;
    gameState.emailResults = [];
    gameState.phishingDetected = 0;
    gameState.legitimateDetected = 0;
    gameState.evidenceFoundTotal = 0;
    gameState.flagModeActive = false;
    gameState.currentEmailFlags = [];
    gameState.phase = 'mission';
  }
  window._isPhishingRetryActive = true;
  window._currentChapterCategory = 'phishing';
  window._awardClaimed = false;
  window._ch1CompletedSandbox = false;
  window._phishAutoModalShown = false;
  // 3. Clear dynamic inbox & re-inject Wave 1
  if (typeof ch1InjectWave === 'function') {
    ch1InjectWave(1);
  }
  // 4. Update Sticky Notes
  if (typeof renderPhishingChecklist === 'function') {
    renderPhishingChecklist();
  }
  if (typeof showStickyNote === 'function') {
    showStickyNote();
  }
  // 5. Save progress
  if (typeof savePhishingProgress === 'function') {
    savePhishingProgress();
  }
  // 6. Open Zmail app
  if (typeof openApp === 'function') {
    openApp('email');
  }
  if (typeof showToast === 'function') {
    showToast('📧 Zmail emails & investigation refreshed! Ready for practice.', 'info');
  }
}

function restartPhishingChecklistOnly() {
  // 1. Reset only checklist achievements
  if (typeof _achievementUnlocked !== 'undefined') {
    _achievementUnlocked.delete('task_report_phishing');
    _achievementUnlocked.delete('task_verify_legit');
    _achievementUnlocked.delete('task_fake_sender');
    _achievementUnlocked.delete('task_phish_indicators');
    _achievementUnlocked.delete('task_submit_all_verdicts');
    _achievementUnlocked.delete('task_all_complete');
    _achievementUnlocked.delete('phish_trophy_unlocked');
    _achievementUnlocked.delete('ach_phishing');
  }
  if (typeof gameState !== 'undefined') {
    gameState.phase = 'mission';
  }
  window._isPhishingRetryActive = true;
  window._currentChapterCategory = 'phishing';
  window._awardClaimed = false;
  window._ch1CompletedSandbox = false;
  window._phishAutoModalShown = false;
  if (typeof _phishingEarnedAward !== 'undefined') {
    _phishingEarnedAward = null;
  }
  // Ensure the intern group chat in Phone Link remains restored and active
  try {
    localStorage.setItem('cyberzero_gc_unlocked', 'true');
  } catch(e) {}
  if (typeof setNewbieGcCreated === 'function') {
    setNewbieGcCreated(false);
  }
  // 2. Reset desktop trophy visual
  if (typeof updateDesktopTrophyDisplay === 'function') {
    updateDesktopTrophyDisplay();
  }
  // 3. Re-render Sticky Note checklist
  if (typeof renderPhishingChecklist === 'function') {
    renderPhishingChecklist();
  }
  if (typeof showStickyNote === 'function') {
    showStickyNote();
  }
  // 4. Save progress
  if (typeof savePhishingProgress === 'function') {
    savePhishingProgress();
  }
  // 5. Open Sticky Notes app
  if (typeof openApp === 'function') {
    openApp('notes');
  }
  if (typeof showToast === 'function') {
    showToast('📝 Phishing checklist reset! Opening Sticky Notes...', 'info');
  }
}

window.openRyanMentorConversation = openRyanMentorConversation;
window.renderRyanMentorChat = renderRyanMentorChat;
window.sendRyanMentorRequest = sendRyanMentorRequest;
window.sendCustomRyanMentorMessage = sendCustomRyanMentorMessage;
window.loadRyanMentorMessages = loadRyanMentorMessages;
window.saveRyanMentorMessages = saveRyanMentorMessages;
window.retryPhishingActivity = retryPhishingActivity;
window.retryPhishingInvestigation = retryPhishingActivity;
window.restartPhishingInvestigationZmail = restartPhishingInvestigationZmail;
window.restartPhishingChecklistOnly = restartPhishingChecklistOnly;
window.renderPhoneMessages = renderPhoneMessages;
window.switchPhoneTab = switchPhoneTab;
window.showPhoneInAppScreen = showPhoneInAppScreen;
window.openNewbieGcConversation = openNewbieGcConversation;
window.renderNewbieGcChat = renderNewbieGcChat;
window.openPhoneConversation = openPhoneConversation;
window.getPhoneLinkConnectionStatus = getPhoneLinkConnectionStatus;
window.renderNoInternetBannerHtml = renderNoInternetBannerHtml;
window.updatePhoneLinkConnectionState = updatePhoneLinkConnectionState;
window.turnOnWifiFromPhoneLink = turnOnWifiFromPhoneLink;
window.turnOffAirplaneFromPhoneLink = turnOffAirplaneFromPhoneLink;
window.openAlexFriendConversation = openAlexFriendConversation;
window.renderAlexFriendChat = renderAlexFriendChat;
window.sendAlexFriendMessage = sendAlexFriendMessage;
window.sendCustomAlexFriendMessage = sendCustomAlexFriendMessage;
window.loadAlexFriendMessages = loadAlexFriendMessages;
window.saveAlexFriendMessages = saveAlexFriendMessages;


function renderIndividualConvo(contactId, content) {
  const conn = getPhoneLinkConnectionStatus();
  const contact = G4_CONTACTS.find(c => c.id === contactId);
  const bannerHtml = !conn.isInternetConnected ? renderNoInternetBannerHtml() : '';

  content.innerHTML = `
    <div class="pl-convo-view">
      <div class="pl-convo-header">
        <button class="pl-back-btn" onclick="g4ActiveConvo = null; switchPhoneTab('messages')">← Back</button>
        <div class="pl-convo-name">${contact?.name || contactId}</div>
      </div>
      <div class="pl-banner-slot">${bannerHtml}</div>
      <div class="pl-empty-state" style="flex:1;">
        <div class="pl-empty-state-icon">💬</div>
        <div class="pl-empty-state-title">No messages</div>
        <div class="pl-empty-state-sub">This conversation is currently empty.</div>
      </div>
    </div>
  `;
}

function openPhoneConversation(contactId) {
  const conn = getPhoneLinkConnectionStatus();
  if (!conn.isBluetoothConnected) {
    updatePhoneLinkConnectionState();
    return;
  }

  g4ActiveConvo = contactId;
  g4ActiveTab = 'messages';

  const tabs = document.querySelectorAll('.pl-tab');
  tabs.forEach(t => {
    const id = t.id.replace('pl-tab-', '');
    t.classList.toggle('active', id === 'messages');
  });

  const content = document.getElementById('pl-tab-content');
  if (!content) return;

  renderIndividualConvo(contactId, content);
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
