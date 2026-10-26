'use strict';

function handleFlaggableClick(el) {
  const currentEmailObj = ch1InboxEmails[gameState.currentEmail];
  if (currentEmailObj && gameState.emailResults.some(r => r.emailId === currentEmailObj.id)) {
    showToast('🔒 This email has already been reported. Case is closed.', 'warning');
    return;
  }
  // If already flagged, always allow unflagging (regardless of flag mode)
  if (el.classList.contains('flagged')) {
    removeFlag(el.dataset.flagType);
    return;
  }
  // Not flagged — require flag mode to be active
  if (!gameState.flagModeActive) {
    showToast('💡 Activate 🚩 Flag Evidence first, then click suspicious elements.', 'warning');
    return;
  }
  placeFlag(el);
}

function handleEmailLinkRightClick(event, el) {
  event.preventDefault();
  const destination = el.dataset.destination;
  if (destination) {
    showLinkPopup(el, destination);
  }
}

function handleEmailLinkClick(event, el) {
  event.preventDefault();
  if (gameState.flagModeActive) {
    placeFlag(el);
    return;
  }
  // Outside flag mode: direct user straight to browser to see the website (no preview popup)
  const destination = el.dataset.destination;
  if (destination) {
    closeLinkPopup();
    openSuspiciousSite(destination);
  }
}

// Double-click on a link: open the phishing site in the simulated browser
function handleEmailLinkDblClick(event, el) {
  event.preventDefault();
  event.stopPropagation();
  const destination = el.dataset.destination;
  if (destination) {
    openSuspiciousSite(destination);
  }
}

function showLinkPopup(el, url) {
  gameState.pendingLinkUrl = url;
  gameState.pendingLinkFlagId = el.dataset.flagId;
  gameState.pendingLinkFlagType = el.dataset.flagType;

  const popup = document.getElementById('link-inspect-popup');
  popup.classList.remove('hidden');
  document.getElementById('lip-url').textContent = url;

  // Position near the link
  const rect = el.getBoundingClientRect();
  popup.style.top = (rect.bottom + 10) + 'px';
  popup.style.left = Math.min(rect.left, window.innerWidth - 420) + 'px';
}

function closeLinkPopup() {
  document.getElementById('link-inspect-popup').classList.add('hidden');
  gameState.pendingLinkUrl = null;
}

function flagFromPopup() {
  const email = ch1InboxEmails[gameState.currentEmail];
  if (email && gameState.emailResults.some(r => r.emailId === email.id)) {
    showToast('🔒 This email has already been reported. Case is closed.', 'warning');
    closeLinkPopup();
    return;
  }
  const el = document.querySelector(`[data-flag-id="${gameState.pendingLinkFlagId}"]`);
  if (el) {
    if (!gameState.flagModeActive) {
      // Auto-enable flag mode when flagging from popup
      gameState.flagModeActive = true;
      const btn = document.getElementById('flag-mode-btn');
      const body = document.querySelector('.gmail-body');
      if (btn) btn.classList.add('active');
      if (body) body.classList.add('flag-mode-active');
    }
    placeFlag(el);
  }
  closeLinkPopup();
}

function openInBrowser() {
  const url = gameState.pendingLinkUrl;
  closeLinkPopup();
  openSuspiciousSite(url);
}

function openSuspiciousSite(url) {
  closeLinkPopup();
  // Notify tutorial that the website was opened
  if (typeof PhishTutorial !== 'undefined' && PhishTutorial.isActive()) {
    PhishTutorial.notify('websiteOpened');
  }
  const win = document.getElementById('win-browser');
  if (win) {
    win.classList.remove('hidden', 'minimized');
  }
  if (appState.browser) {
    appState.browser.open = true;
    appState.browser.minimized = false;
  }

  openApp('browser');
  focusWindow('browser');

  // If browser is floating (not maximized), center it prominently so the user immediately sees it pop up
  if (win && (!appState.browser || !appState.browser.maximized)) {
    centerWindow('browser');
  }

  if (!browserTabs || browserTabs.length === 0) {
    initBrowserTabs();
  }

  const existingTab = browserTabs ? browserTabs.find(t => t.url === url) : null;
  if (existingTab) {
    switchTab(existingTab.id);
  } else {
    const activeTab = getActiveTab();
    if (activeTab && (activeTab.url === 'https://www.google.com' || activeTab.url === '') && activeTab.history.length <= 1) {
      navigateBrowser(url);
    } else {
      createNewBrowserTab(url);
    }
  }

  // Visual pop-in animation to give responsive feedback
  if (win) {
    win.classList.remove('window-pop-in');
    void win.offsetWidth;
    win.classList.add('window-pop-in');
  }
}

// ═══════════════════════════════════════════════════════════
// FLAG SYSTEM
// ═══════════════════════════════════════════════════════════

function toggleFlagMode() {
  const currentEmailObj = EMAILS[gameState.currentEmail];
  if (currentEmailObj && gameState.emailResults.some(r => r.emailId === currentEmailObj.id)) {
    showToast('🔒 This email has already been reported. Case is closed.', 'warning');
    return;
  }

  gameState.flagModeActive = !gameState.flagModeActive;
  const btn = document.getElementById('flag-mode-btn');
  const body = document.querySelector('.gmail-body');

  if (gameState.flagModeActive) {
    btn.classList.add('active');
    btn.classList.remove('btn-pulse-highlight', 'tutorial-flag-blink');
    body.classList.add('flag-mode-active');
    showToast('🚩 Flag Mode ON — click suspicious elements to flag them.', 'warning');
    // Notify tutorial that flag mode was turned on
    if (typeof PhishTutorial !== 'undefined' && PhishTutorial.isActive()) {
      PhishTutorial.notify('flagModeOn');
    } else if (typeof RyanGuide !== 'undefined' && gameState.phase === 'mission') {
      RyanGuide.once('flag-mode-guide', function() {
        setTimeout(function() {
          RyanGuide.speak(RYAN_DIALOGUES.firstEmailRead);
        }, 200);
      });
    }
  } else {
    btn.classList.remove('active');
    body.classList.remove('flag-mode-active');
    closeLinkPopup();
    showToast('Flag Mode OFF', '');
  }

  // Live react to Flag Mode toggle on Sticky Notes
  if (typeof updateStickyChecklist === 'function') updateStickyChecklist();
}

function placeFlag(el) {
  const currentEmailObj = ch1InboxEmails[gameState.currentEmail];
  if (currentEmailObj && gameState.emailResults.some(r => r.emailId === currentEmailObj.id)) {
    showToast('🔒 This email has already been reported. Case is closed.', 'warning');
    return;
  }

  const flagId   = el.dataset.flagId;
  const flagType = el.dataset.flagType;
  const flagLabel = el.dataset.flagLabel;
  const flagText  = el.dataset.flagText || el.textContent.trim();

  // Toggle — if already flagged, remove it
  if (el.classList.contains('flagged')) {
    removeFlag(flagType);
    return;
  }

  // Check if this type is already flagged on another element
  const existing = gameState.currentEmailFlags.find(f => f.type === flagType);
  if (existing) {
    showToast('⚠ This type of evidence is already flagged.', 'warning');
    return;
  }

  const flag = { id: flagId, type: flagType, label: flagLabel || flagType.replace('_', ' ').toUpperCase(), text: flagText };
  gameState.currentEmailFlags.push(flag);

  el.classList.add('flagged');
  renderEvidencePanel();
  const evPanel = document.getElementById('evidence-panel');
  if (evPanel) {
    evPanel.classList.remove('hidden');
    evPanel.classList.remove('collapsed');
  }
  if (typeof toggleEvidencePanel === 'function') toggleEvidencePanel(true);
  if (typeof AudioManager !== 'undefined') AudioManager.playFlagChirp();
  showToast(`🚩 Flagged: ${flag.label}`, 'success');

  // Live react to flag placement on Sticky Notes
  if (typeof updateStickyChecklist === 'function') updateStickyChecklist();

  // ── Notify tutorial of which flag was placed ─────────────────────────────
  if (typeof PhishTutorial !== 'undefined' && PhishTutorial.isActive()) {
    if (flagType === 'fake_sender')     PhishTutorial.notify('senderFlagged');
    if (flagType === 'false_urgency')   PhishTutorial.notify('urgencyFlagged');
    if (flagType === 'suspicious_link') PhishTutorial.notify('linkFlagged');
  }

  // ── Update verdict button highlight based on flagged evidence count ───────
  if (typeof PhishTutorial !== 'undefined') {
    PhishTutorial.updateVerdictBtnHighlight();
  }

  // ── Ryan explains the flag — only when tutorial is not actively guiding ─
  if ((typeof PhishTutorial === 'undefined' || !PhishTutorial.isActive()) && gameState.currentEmail === 0 && gameState.phase === 'mission') {
    clearTimeout(placeFlag._ryanTimer);
    placeFlag._ryanTimer = setTimeout(function() {
      ryanExplainFlag(flagType, flagText, flag.label);
    }, 600);
  }
}

// Dialogue map: Ryan explains each type of suspicious flag
function ryanExplainFlag(flagType, flagText, flagLabel) {
  if (typeof RyanGuide === 'undefined') return;
  const dialogues = {
    fake_sender: [
      { text: "Good catch! 🎯 You flagged the sender's address. Phishers often use domains that look real at a glance — like 'paypa1.com' instead of 'paypal.com'. Always read the full email address carefully!", state: 'speaking' },
      { text: "Real companies will never ask for sensitive info from a free email domain like Gmail or Hotmail. A spoofed sender is one of the strongest signs of phishing.", state: 'thinking' }
    ],
    false_urgency: [
      { text: "Nice! ⚠️ You spotted the urgency tactic. Phrases like 'Act immediately', 'Your account will be closed', or 'Verify now' are designed to panic you into clicking without thinking.", state: 'speaking' },
      { text: "Attackers use urgency to bypass your logical thinking. Pause. A real organization gives you time to verify through official channels.", state: 'thinking' }
    ],
    suspicious_link: [
      { text: "Great eye! 🔗 You flagged a suspicious link. Before clicking any link, hover over it to see the real destination URL. If the domain doesn't match the supposed sender — it's a trap.", state: 'speaking' },
      { text: "Phishing links often use subdomains or misspelled names to look legitimate. For example: 'login.paypal.com.evil.net' is NOT a PayPal link — 'evil.net' is the real domain here.", state: 'thinking' }
    ]
  };

  const slides = dialogues[flagType] ? [...dialogues[flagType]] : [
    { text: `Good find! You flagged "${flagLabel}". Every red flag you identify builds a stronger case.`, state: 'speaking' }
  ];

  // First email only: guide the player that they need to submit Phishing or Non-phishing
  slides.push({
    text: "Now that you've flagged evidence, you need to submit your verdict! Click 'Phishing' if you believe this email is an attack, or 'Non-phishing' if you think it's safe.",
    state: 'success'
  });

  RyanGuide.speak(slides);
}


function removeFlag(flagType) {
  const currentEmailObj = ch1InboxEmails[gameState.currentEmail];
  if (currentEmailObj && gameState.emailResults.some(r => r.emailId === currentEmailObj.id)) {
    return;
  }


  const idx = gameState.currentEmailFlags.findIndex(f => f.type === flagType);
  if (idx === -1) return;
  const [removed] = gameState.currentEmailFlags.splice(idx, 1);

  // Remove visual flag from element in email body
  const el = document.querySelector(`[data-flag-type="${flagType}"]`);
  if (el) {
    el.classList.remove('flagged');
    // Brief unflag flash
    el.classList.add('unflagging');
    setTimeout(() => el.classList.remove('unflagging'), 400);
  }

  renderEvidencePanel();
  if (gameState.currentEmailFlags.length === 0) {
    const evPanel = document.getElementById('evidence-panel');
    if (evPanel) {
      evPanel.classList.add('hidden');
      evPanel.classList.add('collapsed');
      const label = document.getElementById('evidence-toggle-label');
      const arrow = document.getElementById('evidence-toggle-arrow');
      if (label) label.textContent = 'Show';
      if (arrow) arrow.textContent = '▲';
    }
  }
  showToast(`🗑 Unflagged: ${removed.label}`, '');

  // Live react to flag removal on Sticky Notes
  if (typeof updateStickyChecklist === 'function') updateStickyChecklist();

  // ── Update verdict button highlight (may need to remove glow if flags cleared) ─
  if (typeof PhishTutorial !== 'undefined') {
    PhishTutorial.updateVerdictBtnHighlight();
  }
}

function getEmailMissedFlagInfo(email, evType) {
  let label = evType ? evType.replace(/_/g, ' ').toUpperCase() : 'RED FLAG';
  let text = '';
  let reason = '';
  let icon = '⚠️';

  if (!email) return { type: evType, label, text, reason, icon };

  if (evType === 'fake_sender') {
    label = 'FAKE SENDER';
    icon = '👤';
    text = email.sender ? `${email.sender.name} <${email.sender.address}>` : 'Sender Address';
    if (email.capybaraAnalysis && email.capybaraAnalysis.fake_sender && email.capybaraAnalysis.fake_sender.missed) {
      reason = email.capybaraAnalysis.fake_sender.missed.replace(/^🚩\s*MISSED\s*—\s*[^\n]+\n?/, '').trim();
    } else {
      reason = 'The sender domain does not match the official organization domain.';
    }
  } else if (evType === 'false_urgency') {
    label = 'FALSE URGENCY';
    icon = '⏰';
    const part = (email.body || []).find(b => b.flagType === 'false_urgency');
    text = part ? part.text : 'Urgent deadline or account suspension threat';
    if (part && part.label) label = part.label;
    if (email.capybaraAnalysis && email.capybaraAnalysis.false_urgency && email.capybaraAnalysis.false_urgency.missed) {
      reason = email.capybaraAnalysis.false_urgency.missed.replace(/^🚩\s*MISSED\s*—\s*[^\n]+\n?/, '').trim();
    } else {
      reason = 'Manufactured time pressure designed to cause panic before verification.';
    }
  } else if (evType === 'suspicious_link') {
    label = 'SUSPICIOUS LINK';
    icon = '🔗';
    const part = (email.body || []).find(b => b.flagType === 'suspicious_link');
    text = part ? (part.destination || part.text) : 'Suspicious link destination';
    if (part && part.label) label = part.label;
    if (email.capybaraAnalysis && email.capybaraAnalysis.suspicious_link && email.capybaraAnalysis.suspicious_link.missed) {
      reason = email.capybaraAnalysis.suspicious_link.missed.replace(/^🚩\s*MISSED\s*—\s*[^\n]+\n?/, '').trim();
    } else {
      reason = 'Link leads to an unverified external portal designed to capture credentials.';
    }
  } else {
    const part = (email.body || []).find(b => b.flagType === evType);
    if (part) {
      label = part.label || label;
      text = part.text || part.destination || '';
    }
    reason = 'Suspicious indicator that should be flagged.';
  }

  reason = reason.replace(/<code>/g, '“').replace(/<\/code>/g, '”');
  return { type: evType, label, text, reason, icon };
}

function renderEvidencePanel() {
  const list = document.getElementById('evidence-list');
  const badge = document.getElementById('evidence-count-badge');
  if (!list || !badge) return;

  const currentEmailObj = (ch1InboxEmails && ch1InboxEmails[gameState.currentEmail]) || (EMAILS && EMAILS[gameState.currentEmail]);
  const res = currentEmailObj && gameState.emailResults && gameState.emailResults.find(r => r.emailId === currentEmailObj.id);
  const isClosed = !!res;
  const flags = (isClosed && res && res.savedFlags) ? res.savedFlags : (gameState.currentEmailFlags || []);

  // Reset classes on badge
  badge.className = 'evidence-count-badge';

  if (!isClosed) {
    badge.textContent = `${flags.length} FLAG${flags.length !== 1 ? 'S' : ''}`;
    list.innerHTML = '';
    if (flags.length === 0) {
      list.innerHTML = '<div class="evidence-empty">No flags placed yet. Click <strong>Flag Evidence</strong> to mark clues.</div>';
    } else {
      flags.forEach(flag => {
        const item = document.createElement('div');
        item.className = 'evidence-item';
        item.innerHTML = `
          <span class="evidence-item-icon">🚩</span>
          <span class="evidence-item-text">${flag.text.length > 60 ? flag.text.slice(0,60)+'…' : flag.text}</span>
          <span class="evidence-item-type">${flag.label}</span>
          <button class="evidence-remove-btn" onclick="removeFlag('${flag.type}')" title="Remove flag">✕</button>`;
        list.appendChild(item);
      });
    }
  } else {
    // ── Case is closed / submitted: show found vs missed flags ──
    const expected = (currentEmailObj && currentEmailObj.evidence) ? currentEmailObj.evidence : [];
    const flaggedTypes = flags.map(f => f.type);
    const foundTypes = expected.filter(t => flaggedTypes.includes(t));
    const missedTypes = expected.filter(t => !flaggedTypes.includes(t));

    list.innerHTML = '';

    if (currentEmailObj && currentEmailObj.phishing) {
      // Phishing email
      if (missedTypes.length === 0) {
        badge.textContent = `${flags.length}/${expected.length} ALL FLAGS FOUND 🚩✅`;
        badge.classList.add('badge-all-found');
      } else {
        badge.textContent = `${foundTypes.length}/${expected.length} FLAGS (${missedTypes.length} MISSED 🚩)`;
        badge.classList.add('badge-has-missed');
      }

      // Render flags found by player
      flags.forEach(flag => {
        const isLegitFlag = expected.includes(flag.type);
        const item = document.createElement('div');
        item.className = 'evidence-item ' + (isLegitFlag ? 'evidence-item-found' : 'evidence-item-fp');
        item.innerHTML = `
          <span class="evidence-item-icon">🚩</span>
          <div class="evidence-item-body">
            <div class="evidence-item-header">
              <span class="evidence-status-pill ${isLegitFlag ? 'pill-found' : 'pill-fp'}">${isLegitFlag ? 'FLAGGED (FOUND)' : 'EXTRA FLAG'}</span>
              <span class="evidence-item-type">${flag.label}</span>
            </div>
            <span class="evidence-item-text">${flag.text}</span>
            ${!isLegitFlag ? '<div class="evidence-item-hint">This element was normal and safe.</div>' : ''}
          </div>`;
        list.appendChild(item);
      });

      // Render flags missed by player
      missedTypes.forEach(mType => {
        const mInfo = getEmailMissedFlagInfo(currentEmailObj, mType);
        const item = document.createElement('div');
        item.className = 'evidence-item evidence-item-missed';
        item.innerHTML = `
          <span class="evidence-item-icon">🚩</span>
          <div class="evidence-item-body">
            <div class="evidence-item-header">
              <span class="evidence-status-pill pill-missed">🚩 MISSED FLAG</span>
              <span class="evidence-item-type">${mInfo.label}</span>
            </div>
            <span class="evidence-item-text">${mInfo.text}</span>
          </div>`;
        list.appendChild(item);
      });

    } else {
      // Legitimate email
      if (flags.length === 0) {
        badge.textContent = 'CLEAN EMAIL (0 FLAGS) ✅';
        badge.classList.add('badge-all-found');
        const item = document.createElement('div');
        item.className = 'evidence-item evidence-item-clean';
        item.innerHTML = `
          <span class="evidence-item-icon">🛡️</span>
          <div class="evidence-item-body">
            <div class="evidence-item-header">
              <span class="evidence-status-pill pill-found">SAFE &amp; VERIFIED</span>
            </div>
            <span class="evidence-item-text">Clean message — no phishing red flags present.</span>
            <div class="evidence-item-hint">Verified sender domain with standard non-urgent communication.</div>
          </div>`;
        list.appendChild(item);
      } else {
        badge.textContent = `${flags.length} FALSE FLAG${flags.length > 1 ? 'S' : ''} ⚠️`;
        badge.classList.add('badge-has-missed');
        flags.forEach(flag => {
          const item = document.createElement('div');
          item.className = 'evidence-item evidence-item-fp';
          item.innerHTML = `
            <span class="evidence-item-icon">⚠️</span>
            <div class="evidence-item-body">
              <div class="evidence-item-header">
                <span class="evidence-status-pill pill-fp">FALSE ALARM</span>
                <span class="evidence-item-type">${flag.label}</span>
              </div>
              <span class="evidence-item-text">${flag.text}</span>
              <div class="evidence-item-hint">This email was legitimate. This element was safe.</div>
            </div>`;
          list.appendChild(item);
        });
      }
    }
  }

  if (typeof updateVerdictButtonsHighlight === 'function') {
    updateVerdictButtonsHighlight();
  }
}

function updateVerdictButtonsHighlight() {
  const reportBtn = document.getElementById('report-btn');
  const legitBtn  = document.getElementById('legit-btn');
  if (!reportBtn || !legitBtn) return;

  const currentEmailObj = (ch1InboxEmails && ch1InboxEmails[gameState.currentEmail]) || (EMAILS && EMAILS[gameState.currentEmail]);
  const isFirstEmail = (gameState.currentEmail === 0 || (currentEmailObj && currentEmailObj.id === 1));
  const isClosed = currentEmailObj && gameState.emailResults && gameState.emailResults.some(r => r.emailId === currentEmailObj.id);
  const flagCount = (gameState.currentEmailFlags && gameState.currentEmailFlags.length) || 0;

  // Tutorial active on email 1: require ALL 3 evidence flags before highlighting
  const tutorialActive = (typeof PhishTutorial !== 'undefined' && PhishTutorial.isActive());
  const FIRST_EMAIL_REQUIRED = 3;

  // Email 1 (tutorial): glow only after ALL 3 flags.
  // After the first email is completed: glow as soon as 1 flag is placed.
  const firstEmailCompleted = Boolean(gameState.emailResults && gameState.emailResults.length >= 1);
  let shouldHighlight = false;

  if (!isClosed && currentEmailObj) {
    if (isFirstEmail && !firstEmailCompleted) {
      // Email 1 strict tutorial mode — need all 3 flags
      if (currentEmailObj.evidence && currentEmailObj.evidence.length > 0) {
        shouldHighlight = (flagCount >= FIRST_EMAIL_REQUIRED);
      }
    } else {
      // Email 2+ (or email 1 revisited after first submit): 1 flag is enough to glow
      shouldHighlight = (flagCount >= 1);
    }
  }

  if (shouldHighlight) {
    reportBtn.classList.add('verdict-btn-highlight');
    legitBtn.classList.add('verdict-btn-highlight');
  } else {
    reportBtn.classList.remove('verdict-btn-highlight', 'btn-pulse-highlight');
    legitBtn.classList.remove('verdict-btn-highlight', 'btn-pulse-highlight');
  }
}

function toggleEvidencePanel(forceOpen) {
  const panel = document.getElementById('evidence-panel');
  if (!panel) return;

  const isCurrentlyCollapsed = panel.classList.contains('collapsed') || panel.classList.contains('hidden');
  const shouldCollapse = (forceOpen !== undefined) ? !forceOpen : !isCurrentlyCollapsed;

  if (shouldCollapse) {
    panel.classList.add('collapsed');
  } else {
    panel.classList.remove('collapsed');
    panel.classList.remove('hidden');
  }

  const label = document.getElementById('evidence-toggle-label');
  const arrow = document.getElementById('evidence-toggle-arrow');
  if (label) label.textContent = shouldCollapse ? 'Show' : 'Hide';
  if (arrow) arrow.textContent = shouldCollapse ? '▲' : '▼';
}

// ═══════════════════════════════════════════════════════════
// RETURN TO INBOX
// ═══════════════════════════════════════════════════════════

let ch1AutoAdvanceTimer = null;

function returnToInbox() {
  if (ch1AutoAdvanceTimer) {
    clearTimeout(ch1AutoAdvanceTimer);
    ch1AutoAdvanceTimer = null;
  }

  document.getElementById('email-detail-view').classList.remove('active');
  document.getElementById('email-list-view').classList.add('active');
  gameState.flagModeActive = false;
  const flagModeBtn = document.getElementById('flag-mode-btn');
  if (flagModeBtn) flagModeBtn.classList.remove('active');
  const reportBtn = document.getElementById('report-btn');
  const legitBtn  = document.getElementById('legit-btn');
  if (reportBtn) reportBtn.classList.remove('verdict-btn-highlight');
  if (legitBtn) legitBtn.classList.remove('verdict-btn-highlight');
  const gmailBody = document.querySelector('.gmail-body');
  if (gmailBody) gmailBody.classList.remove('flag-mode-active');
  renderEmailList();
  updateHUD();

  // Live react to returning to inbox on Sticky Notes
  if (typeof updateStickyChecklist === 'function') updateStickyChecklist();

  // If in mission and all emails in current inbox are reviewed, trigger next wave!
  if (gameState.phase === 'mission' && ch1InboxEmails.length > 0) {
    const allReviewed = ch1InboxEmails.every(e => gameState.emailResults.some(r => r.emailId === e.id));
    if (allReviewed) {
      if (gameState.emailResults.length >= EMAILS.length) {
        finishMission();
      } else {
        const nextWave = Math.max(ch1Stage + 1, 2);
        if (nextWave <= 4 && CH1_WAVE_DEFS[nextWave]) {
          ch1InjectWave(nextWave);
        }
      }
    }
  }
}
