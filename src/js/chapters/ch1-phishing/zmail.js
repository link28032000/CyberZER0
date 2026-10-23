'use strict';

// ═══════════════════════════════════════════════════════════
// HUD
// ═══════════════════════════════════════════════════════════

function updateHUD() {
  const hudType = document.getElementById('hud-type-label');
  const hudCount = document.getElementById('hud-email-count');
  const hudScore = document.getElementById('hud-score');

  if (gameState.phase === 'malware') {
    if (hudType) hudType.textContent = 'MALWARE';
    if (hudCount) hudCount.textContent = `${gameState.malwareQuarantined} / ${TOTAL_MALWARE_COUNT}`;
  } else {
    if (hudType) hudType.textContent = 'EMAIL';
    const activeMissionIdx = EMAILS.findIndex(e => !gameState.emailResults.some(r => r.emailId === e.id));
    const currentNum = activeMissionIdx === -1 ? EMAILS.length : activeMissionIdx + 1;
    if (hudCount) hudCount.textContent = `${currentNum} / ${EMAILS.length}`;
  }
  if (hudScore) hudScore.textContent = `${gameState.correctDecisions}/${gameState.emailResults.length || 0}`;
  updateAppLockStates();
}

// ═══════════════════════════════════════════════════════════
// GMAIL — EMAIL LIST
// ═══════════════════════════════════════════════════════════

function switchGmailFolder(folder) {
  gameState.currentFolder = folder;

  document.querySelectorAll('.gmail-nav-item').forEach(el => el.classList.remove('active'));
  const navEl = document.getElementById(`nav-${folder}`);
  if (navEl) navEl.classList.add('active');

  const titles = { inbox: 'Inbox', sent: 'Sent', trash: 'Trash' };
  const titleEl = document.getElementById('gmail-toolbar-title');
  if (titleEl) titleEl.textContent = titles[folder] || 'Inbox';

  // Always land back on the list view when switching folders
  document.getElementById('sent-detail-view').classList.remove('active');
  document.getElementById('email-detail-view').classList.remove('active');
  document.getElementById('email-list-view').classList.add('active');

  renderEmailList();
}

function updateFolderCounts() {
  const inboxBadge = document.getElementById('inbox-count');
  const sentBadge = document.getElementById('sent-count');
  const trashBadge = document.getElementById('trash-count');

  // Inbox badge — hide only during intro phase (pretest/Ryan talking before any emails arrive)
  if (inboxBadge) {
    const noEmailsYet = ch1InboxEmails.length === 0 && (!gameState.emailResults || gameState.emailResults.length === 0);
    const pretestOn   = noEmailsYet && typeof RyanPretest !== 'undefined' && RyanPretest.isRunning && RyanPretest.isRunning();
    const ryanIntroOn = noEmailsYet && typeof RyanGuide   !== 'undefined' && RyanGuide.isActive   && RyanGuide.isActive();
    if (pretestOn || ryanIntroOn) {
      inboxBadge.style.display = 'none';
    } else {
      let remainingInbox = ch1InboxEmails.filter(e => !gameState.emailResults.some(r => r.emailId === e.id)).length;
      inboxBadge.textContent = remainingInbox;
      inboxBadge.style.display = remainingInbox > 0 ? 'inline-block' : 'none';
    }
  }

  // Sent badge: count unread/unopened sent emails (excluding trashed ones)
  if (sentBadge) {
    if (!gameState.readSentIds) gameState.readSentIds = [];
    const unreadSent = SENT_EMAILS.filter(e => !gameState.trashedSentIds.includes(e.id) && !gameState.readSentIds.includes(e.id)).length;
    sentBadge.textContent = unreadSent;
    sentBadge.style.display = unreadSent > 0 ? 'inline-block' : 'none';
  }

  // Trash badge: count trashed items
  if (trashBadge) {
    const trashCount = gameState.trashedSentIds ? gameState.trashedSentIds.length : 0;
    trashBadge.textContent = trashCount;
    trashBadge.style.display = trashCount > 0 ? 'inline-block' : 'none';
  }
}

function renderEmailList() {
  const folder = gameState.currentFolder || 'inbox';
  updateFolderCounts();

  if (folder === 'sent') return renderSentOrTrashList(SENT_EMAILS.filter(e => !gameState.trashedSentIds.includes(e.id)), 'sent');
  if (folder === 'trash') return renderSentOrTrashList(SENT_EMAILS.filter(e => gameState.trashedSentIds.includes(e.id)), 'trash');

  const list = document.getElementById('email-list');
  list.innerHTML = '';

  // ── Only hide inbox during the intro phase (no emails injected yet, none completed yet) ──
  const noEmailsYet    = ch1InboxEmails.length === 0 && (!gameState.emailResults || gameState.emailResults.length === 0);
  const pretestRunning = noEmailsYet && typeof RyanPretest !== 'undefined' && RyanPretest.isRunning && RyanPretest.isRunning();
  const ryanIntroOn    = noEmailsYet && typeof RyanGuide   !== 'undefined' && RyanGuide.isActive   && RyanGuide.isActive();
  if (pretestRunning || ryanIntroOn) {
    list.innerHTML = `<div class="email-empty-state">Your inbox is empty.</div>`;
    return;
  }

  // If no emails in inbox, show empty state
  if (ch1InboxEmails.length === 0) {
    list.innerHTML = `<div class="email-empty-state">Your inbox is empty.</div>`;
    return;
  }

  // Use the live dynamic inbox (ch1InboxEmails) instead of the full EMAILS pool
  const activeMissionIdx = ch1InboxEmails.findIndex(e => !gameState.emailResults.some(r => r.emailId === e.id));

  let staggerIndex = 0;
  ch1InboxEmails.forEach((email, idx) => {
    const result = gameState.emailResults.find(r => r.emailId === email.id);

    const isCurrent = (activeMissionIdx !== -1 && idx === activeMissionIdx);
    const isRead = !!result;
    const isNewlyInjected = !ch1AnimatedEmailIds.has(email.id);

    const item = document.createElement('div');
    item.className = `email-list-item ${isRead ? 'read' : 'unread'}${isNewlyInjected ? ' ch1-new-email' : ''}`;
    item.id = `email-item-${email.id}`;

    if (isNewlyInjected) {
      item.style.animationDelay = `${staggerIndex * 90}ms`;
      staggerIndex++;
      ch1AnimatedEmailIds.add(email.id);
    }

    // Avatar letter
    const initial = email.sender.name[0].toUpperCase();
    const avatarColors = ['#5c6bc0','#0288d1','#00897b','#7b1fa2','#c62828'];
    const avatarColor = avatarColors[idx % avatarColors.length];

    let badgeHtml = '';
    if (result) {
      const isCorrect = result.correctDecision;
      const actualType = result.isPhishing ? 'Phishing' : 'Non-phishing';
      const label = isCorrect ? '✓ CORRECT' : '✗ WRONG';
      const cls   = isCorrect ? 'correct' : 'wrong';
      badgeHtml = `<span class="email-done-badge ${cls}" title="${isCorrect ? 'Correct' : 'Wrong'} — ${actualType}">${label}</span>`;
    } else if (isCurrent) {
      badgeHtml = `<div class="email-status-dot"></div>`;
    }

    item.innerHTML = `
      <div class="email-list-avatar" style="background:${avatarColor}">${initial}</div>
      <div class="email-list-content">
        <div class="email-list-sender">${email.sender.name}</div>
        <div class="email-list-subject">${email.subject}</div>
        <div class="email-list-preview">${email.preview}</div>
      </div>
      <div class="email-list-meta">
        <span class="email-list-time">${email.time}</span>
        ${badgeHtml}
      </div>`;

    // Allow clicking any email in the current inbox
    item.style.cursor = 'pointer';
    item.addEventListener('click', () => openEmail(idx));

    list.appendChild(item);
  });
}


// ═══════════════════════════════════════════════════════════
// GMAIL — SENT & TRASH
// ═══════════════════════════════════════════════════════════

function renderSentOrTrashList(items, folder) {
  const list = document.getElementById('email-list');
  list.innerHTML = '';

  if (items.length === 0) {
    list.innerHTML = `<div class="email-empty-state">${folder === 'trash' ? '🗑 Trash is empty' : '📤 No sent mail'}</div>`;
    return;
  }

  items.forEach((email, idx) => {
    const initial = gameState.playerName ? gameState.playerName.charAt(0).toUpperCase() : 'S'; // Student — the player is the sender
    const avatarColors = ['#5c6bc0', '#00897b'];
    const avatarColor = avatarColors[idx % avatarColors.length];

    const isRead = (folder === 'sent') ? (gameState.readSentIds && gameState.readSentIds.includes(email.id)) : true;
    const item = document.createElement('div');
    item.className = `email-list-item ${isRead ? 'read' : 'unread'}`;

    let actionBtn = '';
    if (folder === 'sent') {
      actionBtn = `<button class="email-action-btn email-delete-btn" title="Delete" onclick="event.stopPropagation(); deleteSentEmail(${email.id})">🗑</button>`;
    } else {
      actionBtn = `<button class="email-action-btn email-restore-btn" title="Restore" onclick="event.stopPropagation(); restoreSentEmail(${email.id})">↩ Restore</button>`;
    }

    let dotHtml = '';
    if (!isRead && folder === 'sent') {
      dotHtml = `<div class="email-status-dot"></div>`;
    }

    item.innerHTML = `
      <div class="email-list-avatar" style="background:${avatarColor}">${initial}</div>
      <div class="email-list-content">
        <div class="email-list-sender">To: ${email.to}</div>
        <div class="email-list-subject">${email.subject}</div>
        <div class="email-list-preview">${email.preview}</div>
      </div>
      <div class="email-list-meta">
        <span class="email-list-time">${email.time}</span>
        ${dotHtml}
        ${actionBtn}
      </div>`;

    item.style.cursor = 'pointer';
    item.addEventListener('click', () => openSentOrTrashEmail(email.id, folder));

    list.appendChild(item);
  });
}

function openSentOrTrashEmail(id, folder) {
  const email = SENT_EMAILS.find(e => e.id === id);
  if (!email) return;

  // If opening a sent email, mark as read/seen and update folder badges
  if (folder === 'sent') {
    if (!gameState.readSentIds) gameState.readSentIds = [];
    if (!gameState.readSentIds.includes(id)) {
      gameState.readSentIds.push(id);
    }
    updateFolderCounts();
  }

  // Switch view: list -> reading pane (same visual treatment as Inbox)
  document.getElementById('email-list-view').classList.remove('active');
  document.getElementById('sent-detail-view').classList.add('active');

  const backBtn = document.getElementById('sent-detail-back-btn');
  backBtn.textContent = folder === 'trash' ? '← Back' : '← Back';

  const content = document.getElementById('sent-detail-content');
  content.innerHTML = '';

  // Header block — mirrors the Inbox email-header-block markup
  const header = document.createElement('div');
  header.className = 'email-header-block';
  header.innerHTML = `
    <div class="email-subject-line">${email.subject}</div>
    <div class="email-meta-row">
      <span class="email-meta-label">FROM</span>
      <span class="email-meta-value">${escapeHtml(gameState.playerName || 'Student')} (You)</span>
    </div>
    <div class="email-meta-row">
      <span class="email-meta-label">TO</span>
      <span class="email-meta-value" style="color:var(--text-muted)">${email.to}</span>
    </div>
    <div class="email-meta-row">
      <span class="email-meta-label">DATE</span>
      <span class="email-meta-value" style="color:var(--text-muted)">${email.time}</span>
    </div>`;
  content.appendChild(header);

  // Body — mirrors the Inbox email-body-text markup
  const body = document.createElement('div');
  body.className = 'email-body-text';
  email.body.forEach(part => {
    const p = document.createElement('p');
    p.style.whiteSpace = 'pre-line';
    p.textContent = part.text;
    body.appendChild(p);
  });
  content.appendChild(body);

  // Action button — Delete for Sent, Restore for Trash
  const actionBtn = document.getElementById('sent-detail-action-btn');
  if (folder === 'sent') {
    actionBtn.textContent = '🗑 Delete';
    actionBtn.setAttribute('aria-label', 'Delete email');
    actionBtn.className = 'report-btn sent-detail-action-btn-delete';
    actionBtn.onclick = () => { deleteSentEmail(email.id); closeSentDetailView(); };
  } else {
    actionBtn.textContent = '↩ Restore';
    actionBtn.setAttribute('aria-label', 'Restore email to Sent');
    actionBtn.className = 'report-btn sent-detail-action-btn-restore';
    actionBtn.onclick = () => { restoreSentEmail(email.id); closeSentDetailView(); };
  }
}

function closeSentDetailView() {
  document.getElementById('sent-detail-view').classList.remove('active');
  document.getElementById('email-list-view').classList.add('active');
  renderEmailList();
}

function deleteSentEmail(id) {
  if (!gameState.trashedSentIds.includes(id)) {
    gameState.trashedSentIds.push(id);
  }
  showToast('🗑 Moved to Trash', 'success');
  updateFolderCounts();
  renderEmailList();
}

function restoreSentEmail(id) {
  gameState.trashedSentIds = gameState.trashedSentIds.filter(x => x !== id);
  showToast('↩ Restored to Sent', 'success');
  updateFolderCounts();
  renderEmailList();
}

// ═══════════════════════════════════════════════════════════
// GMAIL — EMAIL DETAIL
// ═══════════════════════════════════════════════════════════

function openEmail(idx) {
  // ── Block email opening while the pre-test is still in progress ──
  if (typeof RyanPretest !== 'undefined' && RyanPretest.isRunning && RyanPretest.isRunning()) return;

  const email = ch1InboxEmails[idx];
  if (!email) return;
  gameState.currentEmail = idx;
  const existingResult = gameState.emailResults.find(r => r.emailId === email.id);

  // ── Investigation tutorial — start inline tutorial directly on first email ──
  if (!ch1InvestigationTutorialDone && !existingResult && gameState.phase === 'mission' && email.id === 1) {
    ch1InvestigationTutorialDone = true;
    setTimeout(function() {
      if (typeof PhishTutorial !== 'undefined') PhishTutorial.start();
    }, 250);
  }

  // ── Second email: guide player to open Sticky Notes & highlight it ───────────
  if (!ch1SecondEmailNotesHintDone && gameState.emailResults.length === 1 && !existingResult && gameState.phase === 'mission') {
    ch1SecondEmailNotesHintDone = true;
    if (typeof RyanGuide !== 'undefined') {
      setTimeout(function() {
        highlightStickyNotesHint();
        const note = document.getElementById('sticky-note');
        const isNoteOpen = note && !note.classList.contains('hidden');
        if (isNoteOpen) {
          RyanGuide.speak([
            {
              text: "Here is your second email case. Check your live Mission Checklist in Sticky Notes to keep track of your tasks as you inspect this one.",
              state: 'speaking'
            }
          ]);
        } else {
          RyanGuide.speak([
            {
              text: "Here is your second email case. Your Sticky Notes app is on the desktop and I highlighted it for you.",
              state: 'speaking'
            },
            {
              text: "Open your Sticky Notes to check your live Mission Checklist progress as you inspect this message.",
              state: 'success'
            }
          ]);
        }
      }, 400);
    }
  }

  if (existingResult) {
    gameState.currentEmailFlags = existingResult.savedFlags ? [...existingResult.savedFlags] : [];
  } else {
    gameState.currentEmailFlags = [];
  }
  gameState.flagModeActive = false;

  // Switch view
  document.getElementById('email-list-view').classList.remove('active');
  document.getElementById('email-detail-view').classList.add('active');

  const flagModeBtn = document.getElementById('flag-mode-btn');
  const reportBtn   = document.getElementById('report-btn');
  const legitBtn    = document.getElementById('legit-btn');

  flagModeBtn.classList.remove('active', 'btn-pulse-highlight', 'tutorial-flag-blink');
  if (reportBtn) reportBtn.classList.remove('verdict-btn-highlight', 'btn-pulse-highlight');
  if (legitBtn) legitBtn.classList.remove('verdict-btn-highlight', 'btn-pulse-highlight');
  document.querySelector('.gmail-body').classList.remove('flag-mode-active');

  if (existingResult) {
    if (reportBtn) {
      reportBtn.disabled = true;
      if (existingResult.playerDecision) {
        reportBtn.innerHTML = '<img src="assets/icons/email/Phishing.png" alt="" class="verdict-btn-icon"> Phishing';
        reportBtn.classList.add('reported');
      } else {
        reportBtn.innerHTML = '<img src="assets/icons/email/Phishing.png" alt="" class="verdict-btn-icon"> Phishing';
        reportBtn.classList.remove('reported');
      }
      reportBtn.title = 'Verdict already submitted for this email.';
    }
    if (legitBtn) {
      legitBtn.disabled = true;
      if (!existingResult.playerDecision) {
        legitBtn.innerHTML = '<img src="assets/icons/email/Legitimate.png" alt="" class="verdict-btn-icon"> Non-phishing';
        legitBtn.classList.add('reported');
      } else {
        legitBtn.innerHTML = '<img src="assets/icons/email/Legitimate.png" alt="" class="verdict-btn-icon"> Non-phishing';
        legitBtn.classList.remove('reported');
      }
      legitBtn.title = 'Verdict already submitted for this email.';
    }
    flagModeBtn.disabled = true;
    flagModeBtn.title = 'Investigation concluded — verdict already submitted.';
  } else {
    if (reportBtn) {
      reportBtn.disabled = false;
      reportBtn.innerHTML = '<img src="assets/icons/email/Phishing.png" alt="" class="verdict-btn-icon"> Phishing';
      reportBtn.classList.remove('reported');
      reportBtn.title = 'Flag and submit this email as Phishing';
    }
    if (legitBtn) {
      legitBtn.disabled = false;
      legitBtn.innerHTML = '<img src="assets/icons/email/Legitimate.png" alt="" class="verdict-btn-icon"> Non-phishing';
      legitBtn.classList.remove('reported');
      legitBtn.title = 'Confirm and submit this email as Non-phishing';
    }
    flagModeBtn.disabled = false;
    flagModeBtn.title = '';
  }

  renderEmailContent(email);
  renderEvidencePanel();
  if (typeof updateVerdictButtonsHighlight === 'function') updateVerdictButtonsHighlight();
  updateHUD();

  // ── Default hide investigation evidence on email open unless flags exist or already submitted ──
  const evPanel = document.getElementById('evidence-panel');
  if (evPanel) {
    if (existingResult) {
      evPanel.classList.remove('hidden');
      evPanel.classList.remove('collapsed');
      const label = document.getElementById('evidence-toggle-label');
      const arrow = document.getElementById('evidence-toggle-arrow');
      if (label) label.textContent = 'Hide';
      if (arrow) arrow.textContent = '▼';
    } else if (gameState.currentEmailFlags.length === 0) {
      evPanel.classList.add('hidden');
      evPanel.classList.add('collapsed');
      const label = document.getElementById('evidence-toggle-label');
      const arrow = document.getElementById('evidence-toggle-arrow');
      if (label) label.textContent = 'Show';
      if (arrow) arrow.textContent = '▲';
    } else {
      evPanel.classList.remove('hidden');
      evPanel.classList.remove('collapsed');
      const label = document.getElementById('evidence-toggle-label');
      const arrow = document.getElementById('evidence-toggle-arrow');
      if (label) label.textContent = 'Hide';
      if (arrow) arrow.textContent = '▼';
    }
  }

  // ── Highlight Flag Mode btn ONLY on first email ──────
  const isFirstEmail = (email.id === 1 && gameState.currentEmail === 0 && (!gameState.emailResults || gameState.emailResults.length === 0));
  if (isFirstEmail && !existingResult && gameState.phase === 'mission') {
    setTimeout(function() {
      // Pulse the Flag Mode button to guide the player on first email
      const flagBtn = document.getElementById('flag-mode-btn');
      if (flagBtn) {
        flagBtn.classList.remove('btn-pulse-highlight');
        void flagBtn.offsetWidth;
        flagBtn.classList.add('btn-pulse-highlight');
        setTimeout(function() { flagBtn.classList.remove('btn-pulse-highlight'); }, 3200);
      }
    }, 350);
  } else {
    const flagBtn = document.getElementById('flag-mode-btn');
    if (flagBtn) flagBtn.classList.remove('btn-pulse-highlight', 'tutorial-flag-blink');
  }

  // Live react to opening an email on Sticky Notes
  if (typeof updateStickyChecklist === 'function') {
    updateStickyChecklist();
  }
}

function renderEmailContent(email) {
  const content = document.getElementById('email-content');
  content.innerHTML = '';

  const existingResult = gameState.emailResults.find(r => r.emailId === email.id);
  if (existingResult) {
    content.classList.add('case-closed-reviewed');
    const isCorrect = existingResult.correctDecision;
    const actualType = existingResult.isPhishing ? 'Phishing' : 'Non-phishing';
    const verdictText = isCorrect ? '✅ Correct' : '❌ Wrong';
    const verdictClass = isCorrect ? 'correct' : 'wrong';
    const banner = document.createElement('div');
    banner.className = `case-closed-banner ${verdictClass}`;
    banner.innerHTML = `🔒 ${verdictText}: ${actualType}. You can review this email, but verdicts can only be submitted once.`;
    content.appendChild(banner);
  } else {
    content.classList.remove('case-closed-reviewed');
  }

  // Header block
  const isSenderFlagged = gameState.currentEmailFlags.some(f => f.type === 'fake_sender');
  const senderClass = 'flaggable' + (isSenderFlagged ? ' flagged' : '');
  const header = document.createElement('div');
  header.className = 'email-header-block';
  header.innerHTML = `
    <div class="email-subject-line">${email.subject}</div>
    <div class="email-meta-row">
      <span class="email-meta-label">FROM</span>
      <span class="email-meta-value">
        <span class="${senderClass}" data-flag-id="sender" data-flag-type="fake_sender" data-flag-label="FAKE SENDER"
          data-flag-text="${email.sender.address}"
          onclick="handleFlaggableClick(this)">${email.sender.name} &lt;${email.sender.address}&gt;</span>
      </span>
    </div>
    <div class="email-meta-row">
      <span class="email-meta-label">TO</span>
      <span class="email-meta-value" style="color:var(--text-muted)">${getCurrentPlayerEmail()}</span>
    </div>
    <div class="email-meta-row">
      <span class="email-meta-label">DATE</span>
      <span class="email-meta-value" style="color:var(--text-muted)">${email.time}</span>
    </div>`;
  content.appendChild(header);

  // Body
  const body = document.createElement('div');
  body.className = 'email-body-text';

  email.body.forEach(part => {
    if (part.type === 'p') {
      const p = document.createElement('p');
      p.style.whiteSpace = 'pre-line';
      p.textContent = part.text;
      body.appendChild(p);

    } else if (part.type === 'p-flag') {
      const p = document.createElement('p');
      const span = document.createElement('span');
      const isFlagged = gameState.currentEmailFlags.some(f => f.type === part.flagType);
      span.className = 'flaggable' + (isFlagged ? ' flagged' : '');
      span.dataset.flagId = part.flagId;
      span.dataset.flagType = part.flagType;
      span.dataset.flagLabel = part.label;
      span.dataset.flagText = part.text;
      span.textContent = part.text;
      span.setAttribute('onclick', 'handleFlaggableClick(this)');
      p.appendChild(span);
      body.appendChild(p);

    } else if (part.type === 'link') {
      const wrap = document.createElement('div');
      wrap.className = 'email-link-wrap';

      const actionsRow = document.createElement('div');
      actionsRow.className = 'email-link-actions-row';

      // Flaggable link — single-click flags (when flag mode is ON) or opens safe browser directly (when flag mode is OFF).
      const link = document.createElement('a');
      const isFlagged = gameState.currentEmailFlags.some(f => f.type === part.flagType);
      link.className = 'email-link flaggable' + (isFlagged ? ' flagged' : '');
      link.href = '#';
      link.dataset.flagId = part.flagId;
      link.dataset.flagType = part.flagType;
      link.dataset.flagLabel = part.label;
      link.dataset.flagText = part.destination;
      link.dataset.destination = part.destination;
      link.textContent = part.text;
      link.title = 'Click to open in safe browser (or turn on Flag Evidence to flag)';
      link.setAttribute('onclick', 'handleEmailLinkClick(event, this)');
      link.setAttribute('ondblclick', 'handleEmailLinkDblClick(event, this)');
      link.setAttribute('oncontextmenu', 'handleEmailLinkRightClick(event, this)');
      actionsRow.appendChild(link);

      // Hint label below the link
      const hint = document.createElement('div');
      hint.className = 'email-link-dblclick-hint';
      hint.textContent = '🌐 Click to open in browser';
      actionsRow.appendChild(hint);

      wrap.appendChild(actionsRow);
      body.appendChild(wrap);

    } else if (part.type === 'attachment') {
      const attachBox = document.createElement('div');
      attachBox.className = 'email-attachment-card';
      const isFlagged = gameState.currentEmailFlags.some(f => f.type === part.flagType);

      attachBox.innerHTML = `
        <div class="email-attachment-header">
          <div class="email-attachment-header-left">
            <span class="email-attach-icon">📎</span>
            <span class="email-attach-title">1 Attachment</span>
          </div>
        </div>
        <div class="email-attachment-body flaggable ${isFlagged ? 'flagged' : ''}"
             data-flag-id="${part.flagId || 'attach1'}"
             data-flag-type="${part.flagType || 'suspicious_link'}"
             data-flag-label="${part.label || 'MALICIOUS ATTACHMENT'}"
             data-flag-text="${part.filename}">
          <div class="email-attach-preview-thumb">
            <div class="email-attach-thumb-paper">
              <div class="thumb-paper-lines">
                <div class="thumb-paper-line"></div>
                <div class="thumb-paper-line"></div>
                <div class="thumb-paper-line"></div>
              </div>
              <span class="thumb-ext-badge">PDF</span>
            </div>
          </div>
          <div class="email-attach-file-info">
            <div class="email-attach-filename-row">
              <span class="email-attach-filename">${part.filename}</span>
            </div>
            <div class="email-attach-meta-row">
              <span class="email-attach-filesize">${part.size || '2.4 MB'}</span>
            </div>
          </div>
          <div class="email-attach-actions">
            <button type="button" class="email-attach-download-btn" onclick="event.stopPropagation(); downloadEmailAttachment('${part.filename}', '${part.size || '2.4 MB'}');" title="Download ${part.filename}">
              <svg class="dl-svg-icon" viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
              </svg>
              <span>Download</span>
            </button>
          </div>
        </div>
      `;
      const attachBody = attachBox.querySelector('.email-attachment-body');
      if (attachBody) {
        attachBody.setAttribute('onclick', 'handleFlaggableClick(this)');
      }
      body.appendChild(attachBox);
    }
  });

  content.appendChild(body);
}
