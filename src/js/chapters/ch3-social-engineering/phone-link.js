'use strict';

// ── PHONELINK APP ─────────────────────────────────────────────

// ═══════════════════════════════════════════════════════════════
// NEWBIE GROUP CHAT: "Business Inc. — Newbie Squad 🚀"
// ═══════════════════════════════════════════════════════════════

const NEWBIE_GC_STORAGE_KEY = 'cyberzero_newbie_gc_state';

const NEWBIE_GC_INFO = {
  id: 'business_newbie_gc',
  name: 'Business Inc. — Newbie Squad 🚀',
  company: 'Business Inc.',
  subtitle: 'Official Company Onboarding & Cyber Defense Team',
  inviter: {
    name: 'Ryan',
    role: 'IT Support Mentor & Group Admin',
    avatar: 'assets/Character/Ryan.png'
  },
  members: [
    {
      id: 'ryan',
      name: 'Ryan',
      role: 'IT Support Mentor & Admin',
      roleTag: 'MENTOR',
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
  defaultMessages: [
    {
      id: 'm1',
      from: 'ryan',
      author: 'Ryan',
      roleTag: 'MENTOR',
      roleClass: 'pl-gc-role-mentor',
      avatar: 'assets/Character/Ryan.png',
      time: '10:45 AM',
      text: "Welcome to the team, Alex! 🎉 Everyone, our newest IT support trainee Alex just passed the email threat assessment with flying colors! 🏆"
    },
    {
      id: 'm2',
      from: 'ethan',
      author: 'Ethan',
      roleTag: 'SYSADMIN',
      roleClass: 'pl-gc-role-sysadmin',
      avatar: 'assets/Character/Ethan.png',
      time: '10:46 AM',
      text: "Welcome aboard, Alex! 💻 I've set up your security credentials and workstation access. Remember: strong passwords, check your certificates, and don't download unverified executables!"
    },
    {
      id: 'm3',
      from: 'pia',
      author: 'Pia',
      roleTag: 'ANALYST',
      roleClass: 'pl-gc-role-analyst',
      avatar: 'assets/Character/Pia.png',
      time: '10:47 AM',
      text: "Welcome Alex! 🛡️ Always great having you on the squad. If you spot weird links, urgent requests, or suspicious sender domains, drop them here anytime."
    },
    {
      id: 'm4',
      from: 'ryan',
      author: 'Ryan',
      roleTag: 'MENTOR',
      roleClass: 'pl-gc-role-mentor',
      avatar: 'assets/Character/Ryan.png',
      time: '10:48 AM',
      text: "Make yourself at home in the chat, Alex! Introduce yourself to Ethan and Pia below. 💬"
    }
  ]
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
    invited: false,
    accepted: false,
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
  if (state.invited || state.accepted) return true;
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

function setNewbieGcInvitePending(andHighlight = true) {
  const state = loadNewbieGcState();
  state.invited = true;
  if (!state.accepted) {
    state.hasUnread = true;
  }
  saveNewbieGcState(state);
  updatePhoneLinkBadges();
  if (andHighlight) {
    highlightPhoneLinkApp();
  }
}

function highlightPhoneLinkApp() {
  if (window._phoneLinkHighlightDismissed) return;
  const commsWin = document.getElementById('win-comms');
  if (commsWin && !commsWin.classList.contains('hidden')) return;

  const icon = document.getElementById('icon-comms');
  if (icon) {
    icon.classList.add('pl-icon-pulse');
    icon.setAttribute('data-badge', '1');
    icon.title = 'Phone Link — 1 Team Invitation Waiting!';
  }
  const taskbarBtn = document.getElementById('taskbar-comms');
  if (taskbarBtn) {
    taskbarBtn.classList.add('pl-icon-pulse');
  }
  updatePhoneLinkBadges();
}

function unhighlightPhoneLinkApp() {
  window._phoneLinkHighlightDismissed = true;
  const icon = document.getElementById('icon-comms');
  if (icon) {
    icon.classList.remove('pl-icon-pulse');
    icon.removeAttribute('data-badge');
    icon.title = 'Phone Link';
  }
  const taskbarBtn = document.getElementById('taskbar-comms');
  if (taskbarBtn) {
    taskbarBtn.classList.remove('pl-icon-pulse');
  }
}

function updatePhoneLinkBadges() {
  const state = loadNewbieGcState();
  const hasUnread = state.hasUnread || (state.invited && !state.accepted);

  const phoneBadge = document.getElementById('pl-notif-badge');
  if (phoneBadge) {
    if (hasUnread) {
      phoneBadge.textContent = '1';
      phoneBadge.classList.remove('hidden');
    } else {
      phoneBadge.classList.add('hidden');
    }
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
g4ActiveTab = 'messages';

function renderPhoneLinkApp() {
  unhighlightPhoneLinkApp();
  renderPhoneFrame();
  showPhoneHomeScreen();
  updatePhoneLinkBadges();
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

  if (isMsg && isNewbieGcActive()) {
    const gcState = loadNewbieGcState();
    const isPending = !gcState.accepted;
    phoneContent.innerHTML = `
      <div class="pl-phone-inapp-view">
        <div class="pl-phone-inapp-header">
          <button type="button" class="pl-phone-screen-back" onclick="returnPhoneHome()" title="Home Screen">‹</button>
          <span class="pl-phone-screen-title">${title}</span>
          <span style="width:36px"></span>
        </div>
        <div class="pl-phone-inapp-body" style="padding:8px;justify-content:flex-start;">
          <div style="background:rgba(255,255,255,0.06);border:1px solid ${isPending ? 'rgba(245,158,11,0.5)' : 'rgba(56,189,248,0.3)'};border-radius:10px;padding:8px 10px;cursor:pointer;width:100%;box-sizing:border-box;text-align:left;" onclick="openNewbieGcConversation()">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
              <span style="font-size:13px;">👥</span>
              <span style="font-size:10px;font-weight:800;color:#ffffff;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">Newbie Squad</span>
              ${isPending ? '<span style="font-size:7px;background:#f59e0b;color:#000;font-weight:900;padding:1px 3px;border-radius:3px;">INVITE</span>' : ''}
            </div>
            <div style="font-size:8.5px;color:#cbd5e1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
              ${isPending ? "Ryan: Alex, you're invited to join..." : 'Business Inc. Team Chat'}
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
  updatePhoneLinkBadges();
  const gcActive = isNewbieGcActive();
  const gcState = loadNewbieGcState();

  let html = '<div class="pl-contacts-list">';

  // 1. Group Chat Row (Pinned at top if active)
  if (gcActive) {
    const isPending = !gcState.accepted;
    const tagHtml = isPending
      ? `<span class="pl-gc-tag-invite">📩 INVITE PENDING</span>`
      : `<span class="pl-gc-tag-active">👥 4 MEMBERS</span>`;
    const preview = isPending
      ? `Ryan: Alex, you've been invited to join the team group chat!`
      : (gcState.playerMessages && gcState.playerMessages.length > 0
          ? `Alex: ${gcState.playerMessages[gcState.playerMessages.length - 1].text}`
          : `Ryan: Make yourself at home in the chat, Alex!`);
    const timeStr = '10:49 AM';

    html += `
      <div class="pl-contact-row ${isPending ? 'pl-msg-gc-invite' : ''}" onclick="openNewbieGcConversation()" title="${NEWBIE_GC_INFO.name}">
        <div class="pl-contact-avatar pl-gc-avatar-stack">👥</div>
        <div class="pl-contact-info">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2px;">
            <span class="pl-contact-name">${NEWBIE_GC_INFO.name}</span>
            ${tagHtml}
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
    container.innerHTML = `
      <div class="pl-empty-state">
        <div class="pl-empty-state-icon">💬</div>
        <div class="pl-empty-state-title">No messages</div>
        <div class="pl-empty-state-sub">No direct messages yet. New conversations and team invites will appear here.</div>
      </div>
    `;
  } else {
    container.innerHTML = html;
  }
}

function openNewbieGcConversation() {
  g4ActiveConvo = 'business_newbie_gc';
  switchPhoneTab('messages');

  const content = document.getElementById('pl-tab-content');
  if (!content) return;

  const state = loadNewbieGcState();
  if (!state.accepted) {
    renderNewbieGcInvite(content);
  } else {
    renderNewbieGcChat(content);
  }
}

function renderNewbieGcInvite(container) {
  container.innerHTML = `
    <div class="pl-gc-invite-view" style="flex:1;display:flex;flex-direction:column;justify-content:center;">
      <div class="pl-gc-invite-card">
        <div class="pl-gc-invite-icon-wrap">
          <span class="pl-gc-invite-badge-icon">👥</span>
        </div>
        <h2 class="pl-gc-invite-title">${NEWBIE_GC_INFO.name}</h2>
        <div class="pl-gc-invite-sub">${NEWBIE_GC_INFO.subtitle}</div>

        <div class="pl-gc-invite-inviter">
          <img src="${NEWBIE_GC_INFO.inviter.avatar}" class="pl-gc-inviter-avatar" alt="Ryan">
          <div style="flex:1;">
            <div class="pl-gc-inviter-name">Invited by ${NEWBIE_GC_INFO.inviter.name}</div>
            <div class="pl-gc-inviter-role">${NEWBIE_GC_INFO.inviter.role}</div>
          </div>
          <span style="font-size:11px;color:#38bdf8;font-weight:700;background:rgba(56,189,248,0.15);padding:3px 8px;border-radius:6px;">TEAM INVITE</span>
        </div>

        <p class="pl-gc-invite-desc">
          Outstanding work, Alex! Having demonstrated keen instincts in detecting phishing emails, you are officially welcomed to the <strong>Business Inc. Cyber Defense Team</strong>.
          Join our group chat to collaborate with Ryan, Ethan, and Pia, share threat intel, and coordinate security operations!
        </p>

        <!-- Members Box (All Characters Inside) -->
        <div class="pl-gc-members-box">
          <div class="pl-gc-members-header">Squad Members (4)</div>
          <div class="pl-gc-members-grid">
            ${NEWBIE_GC_INFO.members.map(m => `
              <div class="pl-gc-member-card ${m.isPlayer ? 'you' : ''}">
                <img src="${m.avatar}" class="pl-gc-member-avatar ${m.isPlayer ? 'avatar-you' : ''}" alt="${m.name}">
                <div class="pl-gc-member-info">
                  <div class="pl-gc-member-name">${m.name}</div>
                  <div class="pl-gc-member-role">${m.role}</div>
                </div>
                <span class="pl-gc-msg-role-tag ${m.roleClass}">${m.roleTag}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="pl-gc-invite-actions">
          <button type="button" class="pl-gc-btn-accept" onclick="acceptNewbieGcInvite()">
            🎉 Accept Invite &amp; Join Team
          </button>
          <button type="button" class="pl-gc-btn-decline" onclick="switchPhoneTab('messages')">
            Decide Later
          </button>
        </div>
      </div>
    </div>
  `;
}

function acceptNewbieGcInvite() {
  const state = loadNewbieGcState();
  state.invited = true;
  state.accepted = true;
  state.hasUnread = false;
  saveNewbieGcState(state);

  unhighlightPhoneLinkApp();
  updatePhoneLinkBadges();

  if (typeof AudioManager !== 'undefined' && AudioManager.playCorrect) {
    AudioManager.playCorrect();
  }

  if (typeof showToast === 'function') {
    showToast('🎉 Welcome to the team, Alex! You joined Business Inc. — Newbie Squad', 'success');
  }

  const content = document.getElementById('pl-tab-content');
  if (content) {
    renderNewbieGcChat(content);
  }
}

function renderNewbieGcChat(container) {
  const state = loadNewbieGcState();

  // Combine default messages with player messages and any dynamic replies
  const allMessages = [...NEWBIE_GC_INFO.defaultMessages, ...(state.playerMessages || [])];

  container.innerHTML = `
    <div class="pl-convo-view" style="display:flex;flex-direction:column;height:100%;background:#090e18;">
      <!-- Header -->
      <div class="pl-convo-header" style="background:#0f172a;border-bottom:1px solid rgba(255,255,255,0.08);padding:10px 16px;display:flex;align-items:center;gap:12px;">
        <button class="pl-back-btn" onclick="switchPhoneTab('messages')">← Back</button>
        <div class="pl-contact-avatar pl-gc-avatar-stack" style="width:34px;height:34px;font-size:16px;">👥</div>
        <div class="pl-gc-header-info">
          <div class="pl-convo-name" style="font-size:13.5px;font-weight:800;color:#ffffff;line-height:1.2;">${NEWBIE_GC_INFO.name}</div>
          <div class="pl-gc-members-summary">Ryan, Ethan, Pia, Alex (You) (4 members) · <span style="color:#22c55e;">🟢 Online</span></div>
        </div>
      </div>

      <!-- Messages Thread -->
      <div class="pl-convo-messages" id="pl-gc-messages-list" style="flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px;">
        <div class="pl-gc-system-banner">
          🎉 Alex (You) accepted Ryan's invitation and joined the group chat!
        </div>

        ${allMessages.map(msg => {
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
      <div class="pl-gc-input-area">
        <div class="pl-gc-quick-replies">
          <button type="button" class="pl-gc-chip" onclick="sendPlayerGcQuickReply('👋 Hey everyone! Alex here, excited to be on the squad!')">
            👋 Say Hi as Alex
          </button>
          <button type="button" class="pl-gc-chip" onclick="sendPlayerGcQuickReply('🛡️ Thanks Ryan! Ready to defend Business Inc. from threats!')">
            🛡️ Ready to Defend
          </button>
          <button type="button" class="pl-gc-chip" onclick="sendPlayerGcQuickReply('💻 Thanks Ethan and Pia! Looking forward to working with you both!')">
            💻 Ready for Intel
          </button>
          <button type="button" class="pl-gc-chip" onclick="sendPlayerGcQuickReply('🚀 Let\\'s protect the company together!')">
            🚀 Protect Together
          </button>
        </div>
        <div class="pl-gc-input-bar">
          <input type="text" id="pl-gc-text-input" placeholder="Type a message as Alex..." maxlength="200" onkeydown="if(event.key==='Enter') sendCustomPlayerGcMessage()">
          <button type="button" class="pl-gc-send-btn" onclick="sendCustomPlayerGcMessage()">Send as Alex 📨</button>
        </div>
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
  sendPlayerGcMessage(text);
}

function sendCustomPlayerGcMessage() {
  const input = document.getElementById('pl-gc-text-input');
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;
  input.value = '';
  sendPlayerGcMessage(text);
}

function sendPlayerGcMessage(text) {
  if (!text) return;
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
    text: text
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

  // Teammate dynamic response after 750ms
  scheduleTeammateResponse(text);
}

function scheduleTeammateResponse(playerText) {
  setTimeout(() => {
    const state = loadNewbieGcState();
    if (!state.playerMessages) state.playerMessages = [];

    const lower = playerText.toLowerCase();
    let replyObj = null;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (lower.includes('hi') || lower.includes('hey') || lower.includes('happy') || lower.includes('alex')) {
      replyObj = {
        id: 'r_' + Date.now(),
        from: 'pia',
        author: 'Pia',
        roleTag: 'ANALYST',
        roleClass: 'pl-gc-role-analyst',
        avatar: 'assets/Character/Pia.png',
        time: timeStr,
        text: "Hey Alex! ✋ Great to have you with us on the squad. Always remember: if an email sounds too good to be true, it definitely is!"
      };
    } else if (lower.includes('defend') || lower.includes('threat') || lower.includes('ready')) {
      replyObj = {
        id: 'r_' + Date.now(),
        from: 'ethan',
        author: 'Ethan',
        roleTag: 'SYSADMIN',
        roleClass: 'pl-gc-role-sysadmin',
        avatar: 'assets/Character/Ethan.png',
        time: timeStr,
        text: "That's the spirit, Alex! 🛡️ Always verify headers, hover over suspicious links, and never run unknown executables."
      };
    } else if (lower.includes('ethan') || lower.includes('intel') || lower.includes('work') || lower.includes('pia')) {
      replyObj = {
        id: 'r_' + Date.now(),
        from: 'pia',
        author: 'Pia',
        roleTag: 'ANALYST',
        roleClass: 'pl-gc-role-analyst',
        avatar: 'assets/Character/Pia.png',
        time: timeStr,
        text: "Looking forward to working with you, Alex! I'm tracking incoming phishing reports — feel free to drop anything strange here anytime. 🔍"
      };
    } else {
      replyObj = {
        id: 'r_' + Date.now(),
        from: 'ryan',
        author: 'Ryan',
        roleTag: 'MENTOR',
        roleClass: 'pl-gc-role-mentor',
        avatar: 'assets/Character/Ryan.png',
        time: timeStr,
        text: "Great attitude, Alex! Remember our core rule: Stop. Check. Verify. Report. You are going to do great here. 👍"
      };
    }

    state.playerMessages.push(replyObj);
    saveNewbieGcState(state);

    if (typeof AudioManager !== 'undefined' && AudioManager.playClick) {
      AudioManager.playClick();
    }

    const content = document.getElementById('pl-tab-content');
    if (content) {
      renderNewbieGcChat(content);
    }
  }, 750);
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
