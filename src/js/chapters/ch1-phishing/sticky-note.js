'use strict';

// ═══════════════════════════════════════════════════════════
// STICKY NOTE — Scoring Reminder
// ═══════════════════════════════════════════════════════════

function showStickyNote() {
  const note = document.getElementById('sticky-note');
  const icon = document.getElementById('icon-notes');
  if (!note) return;

  note.classList.remove('hidden', 'collapsed', 'sticky-note-pop', 'sticky-note-highlight', 'sticky-note-pulse-once');
  note.style.zIndex = '4500';

  // Apply the attention ring on open only if the hint was already triggered
  if (typeof _stickyHintShownOnce !== 'undefined' && _stickyHintShownOnce) {
    note.classList.add('highlight-attention');
    // Remove the ring after 4 seconds so it doesn't stay forever
    setTimeout(() => note.classList.remove('highlight-attention'), 4000);
  } else {
    note.classList.remove('highlight-attention');
  }

  if (icon) icon.classList.remove('hidden');

  // Dismiss the icon attention glow when player opens the note
  if (typeof IconAttention !== 'undefined') IconAttention.hide('notes');

  const titleEl = document.getElementById('sticky-note-title');
  if (titleEl) titleEl.textContent = '📒 Phishing Investigation Tasks';

  const scrollEl = document.querySelector('#sticky-note .sticky-note-scroll');
  if (!scrollEl) return;

  // ── If all emails are completed, display the final results & achievements in Sticky Note ──
  if (gameState.emailResults && gameState.emailResults.length >= EMAILS.length) {
    const total = EMAILS.length;
    const correct = gameState.correctDecisions;
    const pct = correct / total;
    let rank, rankClass, rankLabel;
    if (pct >= 1.0)       { rank = 'S'; rankClass = 'rank-s'; rankLabel = 'CYBER DETECTIVE'; }
    else if (pct >= 0.85) { rank = 'A'; rankClass = '';       rankLabel = 'EXCELLENT DETECTIVE'; }
    else if (pct >= 0.70) { rank = 'B'; rankClass = 'rank-b'; rankLabel = 'GOOD DETECTIVE'; }
    else if (pct >= 0.50) { rank = 'C'; rankClass = 'rank-c'; rankLabel = 'KEEP PRACTICING'; }
    else                  { rank = 'D'; rankClass = 'rank-d'; rankLabel = 'NEEDS MORE TRAINING'; }

    renderStickyNoteResults(rank, rankLabel, rankClass, pct, correct, total);
    return;
  }

  // ── Hide the task list when user has not completed the first email ──
  const isFirstEmailCompleted = Boolean(gameState.emailResults && gameState.emailResults.length >= 1);
  if (!isFirstEmailCompleted && gameState.phase === 'mission') {
    scrollEl.innerHTML = `
      <div class="sn-locked-container">
        <div class="sn-locked-icon-bubble">🔒</div>
        <div class="sn-locked-title">Tasks Locked</div>
        <div class="sn-locked-desc">
          Complete your first email investigation in Zmail to unlock your live <strong>Mission Task List</strong>.
        </div>
        <div class="sn-locked-hint">
          👉 <span>Inspect email #1 to unlock tracking</span>
        </div>
      </div>`;
    return;
  }

  if (!document.getElementById('sn-checklist-section')) {
    scrollEl.innerHTML = '<div id="sn-checklist-section"></div>';
  }

  updateStickyChecklist();

  // If inbox was somehow empty on mission start, inject wave 1 as safety fallback
  if (gameState.phase === 'mission' && ch1InboxEmails.length === 0) {
    ch1InjectWave(1);
    updateFolderCounts();
  }
}


function closeStickyNote() {
  const note = document.getElementById('sticky-note');
  if (note) {
    note.classList.add('hidden');
    note.classList.remove('highlight-attention');
  }
  if (typeof IconAttention !== 'undefined') IconAttention.hide('notes');
}

// Guard: only show the sticky note highlight hint ONCE per session
let _stickyHintShownOnce = false;

function highlightStickyNotesHint() {
  if (_stickyHintShownOnce) return;
  _stickyHintShownOnce = true;

  const note = document.getElementById('sticky-note');
  const isNoteOpen = note && !note.classList.contains('hidden');

  if (isNoteOpen) {
    // If sticky note was already opened and is staying open:
    // No need to show highlights in app icons.
    if (typeof IconAttention !== 'undefined') {
      IconAttention.hide('notes');
    }
    // Briefly highlight the already open sticky note itself so player notices unlocked tasks
    note.classList.remove('highlight-attention');
    void note.offsetWidth;
    note.classList.add('highlight-attention');
    setTimeout(() => {
      if (note) note.classList.remove('highlight-attention');
    }, 4000);
  } else {
    // Show highlights on app icons ONLY if sticky note is not open
    if (typeof IconAttention !== 'undefined') {
      IconAttention.show('notes');
    }
  }
}

function toggleStickyNoteCollapse() {
  const note = document.getElementById('sticky-note');
  if (note) note.classList.toggle('collapsed');
}

// ─── Phishing Investigation Task Achievements ────────────────────────────────
// Helper: count correctly flagged & reported phishing emails
function _countCorrectPhishing() {
  return gameState.emailResults.filter(r =>
    r.isPhishing === true && r.playerDecision === true && r.correctDecision === true && r.savedFlags && r.savedFlags.length > 0
  ).length;
}

// Helper: count investigated emails where required evidence/verification was submitted
function _countInvestigatedWithEvidence() {
  return gameState.emailResults.filter(r => {
    if (r.isPhishing) {
      return r.correctDecision === true && r.savedFlags && r.savedFlags.length > 0;
    } else {
      return r.correctDecision === true && !r.isPhishing;
    }
  }).length;
}

// Helper: count emails where player flagged fake_sender
function _countFakeSenderFound() {
  return gameState.emailResults.filter(r =>
    r.isPhishing === true && r.correctDecision === true && r.savedFlags && r.savedFlags.some(f => f.type === 'fake_sender')
  ).length;
}

// Helper: count phishing emails where player flagged false_urgency OR suspicious_link
function _countIndicatorsFound() {
  return gameState.emailResults.filter(r =>
    r.isPhishing === true && r.correctDecision === true && r.savedFlags && r.savedFlags.some(f => f.type === 'false_urgency' || f.type === 'suspicious_link' || f.type === 'malicious_attachment')
  ).length;
}

const PHISHING_TASK_GOALS = { t1: 5, t2: 10, t3: 5, t4: 5, t5_total: 10 };

const SN_ACHIEVEMENTS = [
  {
    id: 'task_report_phishing',
    icon: '🚩',
    label: 'Task 1: Report Phishing Emails',
    desc: 'Report at least 5 confirmed phishing emails.',
    check: () => _countCorrectPhishing() >= PHISHING_TASK_GOALS.t1,
    progress: () => `${Math.min(_countCorrectPhishing(), PHISHING_TASK_GOALS.t1)}/${PHISHING_TASK_GOALS.t1} phishing emails reported`
  },
  {
    id: 'task_collect_evidence',
    icon: '🔍',
    label: 'Task 2: Collect Investigation Evidence',
    desc: 'Complete at least 10 investigations with supporting evidence.',
    check: () => _countInvestigatedWithEvidence() >= PHISHING_TASK_GOALS.t2,
    progress: () => `${Math.min(_countInvestigatedWithEvidence(), PHISHING_TASK_GOALS.t2)}/${PHISHING_TASK_GOALS.t2} investigations completed`
  },
  {
    id: 'task_fake_sender',
    icon: '🌐',
    label: 'Task 3: Identify Fake Sender Domains',
    desc: 'Identify and document suspicious sender addresses or domains.',
    check: () => _countFakeSenderFound() >= PHISHING_TASK_GOALS.t3,
    progress: () => `${Math.min(_countFakeSenderFound(), PHISHING_TASK_GOALS.t3)}/${PHISHING_TASK_GOALS.t3} fake senders documented`
  },
  {
    id: 'task_phish_indicators',
    icon: '⚠️',
    label: 'Task 4: Identify Phishing Indicators',
    desc: 'Identify and document phishing indicators.',
    check: () => _countIndicatorsFound() >= PHISHING_TASK_GOALS.t4,
    progress: () => `${Math.min(_countIndicatorsFound(), PHISHING_TASK_GOALS.t4)}/${PHISHING_TASK_GOALS.t4} indicators recorded`
  },
  {
    id: 'task_all_complete',
    icon: '🏆',
    label: 'Task 5: Complete All Investigations',
    desc: 'Submit the required investigation evidence and reports.',
    check: () => _countCorrectPhishing() >= PHISHING_TASK_GOALS.t1 &&
                 _countInvestigatedWithEvidence() >= PHISHING_TASK_GOALS.t2 &&
                 _countFakeSenderFound() >= PHISHING_TASK_GOALS.t3 &&
                 _countIndicatorsFound() >= PHISHING_TASK_GOALS.t4 &&
                 gameState.emailResults.length >= PHISHING_TASK_GOALS.t5_total,
    progress: () => `${Math.min(gameState.emailResults.length, PHISHING_TASK_GOALS.t5_total)}/${PHISHING_TASK_GOALS.t5_total} evidence submissions completed`
  }
];

const _achievementUnlocked = new Set();
let _trophyUnlockedDate = null;

function savePhishingProgress() {
  try {
    const isTrophyUnlocked = _achievementUnlocked.has('task_all_complete') ||
      (_countCorrectPhishing() >= PHISHING_TASK_GOALS.t1 &&
       _countInvestigatedWithEvidence() >= PHISHING_TASK_GOALS.t2 &&
       _countFakeSenderFound() >= PHISHING_TASK_GOALS.t3 &&
       _countIndicatorsFound() >= PHISHING_TASK_GOALS.t4 &&
       gameState.emailResults.length >= PHISHING_TASK_GOALS.t5_total);

    const data = {
      unlockedAchievements: Array.from(_achievementUnlocked),
      trophyUnlocked: isTrophyUnlocked,
      unlockedDate: _trophyUnlockedDate || (isTrophyUnlocked ? new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' }) : null)
    };
    localStorage.setItem('cyberzero_phishing_progress', JSON.stringify(data));
  } catch(e) {}
}

function loadPhishingProgress() {
  try {
    const saved = localStorage.getItem('cyberzero_phishing_progress');
    if (saved) {
      const data = JSON.parse(saved);
      if (Array.isArray(data.unlockedAchievements)) {
        data.unlockedAchievements.forEach(id => _achievementUnlocked.add(id));
      }
      if (data.trophyUnlocked) {
        _achievementUnlocked.add('task_all_complete');
        _trophyUnlockedDate = data.unlockedDate || new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });
      }
    }
  } catch(e) {}
}

function isPhishingTrophyUnlocked() {
  return _achievementUnlocked.has('task_all_complete') ||
    (SN_ACHIEVEMENTS && SN_ACHIEVEMENTS[4] && SN_ACHIEVEMENTS[4].check());
}

function updateStickyChecklist() {
  if (gameState.phase !== 'mission' && gameState.phase !== 'results') return;
  const section = document.getElementById('sn-checklist-section');
  if (!section) return;

  const totalGoals = SN_ACHIEVEMENTS.length;
  let completedCount = 0;
  SN_ACHIEVEMENTS.forEach(ach => {
    if (ach.check()) completedCount++;
  });
  const progressPercent = Math.round((completedCount / totalGoals) * 100);

  let html = `
    <div class="sn-progress-card">
      <div class="sn-progress-header">
        <span class="sn-progress-title">Awareness Checklist</span>
        <span class="sn-progress-count">${completedCount}/${totalGoals} (${progressPercent}%)</span>
      </div>
      <div class="sn-progress-bar-track">
        <div class="sn-progress-bar-fill" style="width: ${progressPercent}%;"></div>
      </div>
    </div>
    <ul class="sn-checklist">`;

  SN_ACHIEVEMENTS.forEach(ach => {
    const done = ach.check();
    const prog = ach.progress();
    html += `
      <li class="sn-ach-item ${done ? 'sn-ach-done' : ''}">
        <div class="sn-checkbox ${done ? 'checked' : ''}" aria-hidden="true">${done ? '✓' : ''}</div>
        <div class="sn-ach-body">
          <div class="sn-ach-header-row">
            <span class="sn-ach-label">${ach.icon} ${ach.label}</span>
            <span class="sn-ach-prog-badge ${done ? 'done' : ''}" title="${prog}">${prog}</span>
          </div>
          <div class="sn-ach-desc">${ach.desc}</div>
        </div>
      </li>`;

    // Fire achievement toast on first unlock
    if (done && !_achievementUnlocked.has(ach.id)) {
      _achievementUnlocked.add(ach.id);
      savePhishingProgress();
      setTimeout(() => showAchievementToast(ach), 500);
    }
  });

  html += '</ul>';
  section.innerHTML = html;

  // Update trophy tip in Sticky Note if present
  const trophyTip = document.getElementById('sn-trophy-tip');
  if (trophyTip) {
    const isUnlocked = isPhishingTrophyUnlocked();
    if (isUnlocked) {
      trophyTip.style.borderLeft = '3px solid #16a34a';
      trophyTip.style.background = 'rgba(34, 197, 94, 0.12)';
      trophyTip.style.color = '#14532d';
      trophyTip.innerHTML = `<span>🏆 <strong>Phishing Investigator Trophy:</strong> <span style="color:#16a34a; font-weight:800;">UNLOCKED</span></span><button type="button" class="sn-trophy-btn" onclick="showPhishingInvestigatorTrophy()" style="background:#f59e0b; color:#000; border:none; border-radius:4px; padding:3px 8px; font-size:10px; font-weight:800; cursor:pointer; margin-left:6px;">VIEW 🏆</button>`;
    } else {
      trophyTip.style.borderLeft = '3px solid #f59e0b';
      trophyTip.style.background = 'rgba(245, 158, 11, 0.08)';
      trophyTip.style.color = '#78350f';
      trophyTip.innerHTML = `🏆 <strong>Goal:</strong> Complete all 5 Investigation Tasks to unlock the <em>Phishing Investigator</em> trophy! (${completedCount}/${totalGoals} Complete)`;
    }
  }
}

function showAchievementToast(ach) {
  // Task 5 (all complete) gets the full trophy modal
  if (ach.id === 'task_all_complete') {
    _trophyUnlockedDate = new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });
    savePhishingProgress();
    setTimeout(() => showPhishingInvestigatorTrophy(), 600);
    return;
  }

  const existing = document.getElementById('achievement-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'achievement-toast';
  toast.className = 'achievement-toast';
  toast.innerHTML = `
    <div class="ach-toast-glow"></div>
    <div class="ach-toast-icon">${ach.icon}</div>
    <div class="ach-toast-body">
      <div class="ach-toast-title">🎯 Task Completed!</div>
      <div class="ach-toast-name">${ach.label}</div>
      <div class="ach-toast-desc">${ach.progress()}</div>
    </div>
  `;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add('ach-toast-show'));
  });

  setTimeout(() => {
    toast.classList.remove('ach-toast-show');
    setTimeout(() => toast.remove(), 400);
  }, 4000);

  if (typeof AudioManager !== 'undefined' && AudioManager.playCorrect) {
    AudioManager.playCorrect();
  }
}

// ─── Phishing Investigator Trophy Modal ──────────────────────────────────────
function showPhishingInvestigatorTrophy() {
  if (document.getElementById('phish-trophy-modal')) return;

  const dateStr = _trophyUnlockedDate || new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });

  const modal = document.createElement('div');
  modal.id = 'phish-trophy-modal';
  modal.className = 'phish-trophy-modal';
  modal.innerHTML = `
    <div class="ptm-backdrop" onclick="closePhishingTrophy()"></div>
    <div class="ptm-card">
      <div class="ptm-glow-ring"></div>
      <div class="ptm-header">
        <div class="ptm-trophy-icon">🏆</div>
        <div class="ptm-confetti" id="ptm-confetti"></div>
      </div>
      <div class="ptm-body">
        <div class="ptm-badge">🔓 ACHIEVEMENT UNLOCKED</div>
        <h2 class="ptm-title">Phishing Investigator</h2>
        <p class="ptm-desc">Congratulations! You have completed all phishing investigation tasks, identified suspicious emails, collected evidence, and submitted your reports.</p>
        <div class="ptm-date">🗓️ Completed: ${dateStr}</div>
        <div class="ptm-tasks-summary">
          <div class="ptm-task-row"><span class="ptm-task-icon">🚩</span><span>5 Phishing Emails Correctly Reported</span><span class="ptm-task-check">✓</span></div>
          <div class="ptm-task-row"><span class="ptm-task-icon">🔍</span><span>10 Emails Investigated with Evidence</span><span class="ptm-task-check">✓</span></div>
          <div class="ptm-task-row"><span class="ptm-task-icon">🌐</span><span>Fake Sender Domains Identified</span><span class="ptm-task-check">✓</span></div>
          <div class="ptm-task-row"><span class="ptm-task-icon">⚠️</span><span>Phishing Indicators Flagged</span><span class="ptm-task-check">✓</span></div>
          <div class="ptm-task-row"><span class="ptm-task-icon">📋</span><span>All Investigations Submitted</span><span class="ptm-task-check">✓</span></div>
        </div>
      </div>
      <div class="ptm-footer">
        <button class="ptm-close-btn" onclick="closePhishingTrophy()">🎉 Claim Trophy &amp; Continue</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const confettiEl = modal.querySelector('#ptm-confetti');
  const colors = ['#ffd700','#ff6b6b','#4fc3f7','#69db7c','#f9ca24','#ff9ff3'];
  for (let i = 0; i < 40; i++) {
    const p = document.createElement('div');
    p.className = 'ptm-particle';
    p.style.cssText = `left:${Math.random()*100}%;background:${colors[Math.floor(Math.random()*colors.length)]};animation-delay:${Math.random()*1.2}s;animation-duration:${1.2+Math.random()*1.2}s;width:${6+Math.random()*8}px;height:${6+Math.random()*8}px;border-radius:${Math.random()>0.5?'50%':'2px'};`;
    confettiEl.appendChild(p);
  }

  requestAnimationFrame(() => {
    requestAnimationFrame(() => modal.classList.add('ptm-show'));
  });

  if (typeof AudioManager !== 'undefined' && AudioManager.playCorrect) {
    AudioManager.playCorrect();
  }
}

function closePhishingTrophy() {
  const modal = document.getElementById('phish-trophy-modal');
  if (!modal) return;
  modal.classList.remove('ptm-show');
  savePhishingProgress();
  setTimeout(() => modal.remove(), 400);
}


function toggleStickyNote() {
  const note = document.getElementById('sticky-note');
  if (!note) return;
  if (note.classList.contains('hidden')) {
    showStickyNote();
  } else {
    closeStickyNote();
  }
}

// ─── Render Investigation Results and Tasks inside Sticky Note ────────────────
function renderStickyNoteResults(rank, rankLabel, rankClass, pct, correct, total) {
  const note = document.getElementById('sticky-note');
  const titleEl = document.getElementById('sticky-note-title');
  const scrollEl = document.querySelector('#sticky-note .sticky-note-scroll');
  if (!note || !scrollEl) return;

  if (titleEl) {
    titleEl.innerHTML = '🏆 <span>Investigation Complete — Results</span>';
  }

  // Ensure note is visible, not collapsed
  note.classList.remove('hidden', 'collapsed');
  note.style.zIndex = '4600';

  const totalGoals = SN_ACHIEVEMENTS.length;
  const totalEvidence = EMAILS.reduce((sum, e) => sum + e.evidence.length, 0);

  let html = `
    <!-- Task Progress Bar Card -->
    <div class="sn-progress-card" style="border-color: rgba(34, 197, 94, 0.4); background: rgba(34, 197, 94, 0.08); margin-bottom: 10px;">
      <div class="sn-progress-header">
        <span class="sn-progress-title" style="color: #15803d; font-weight: 800;">✅ Investigation Tasks Complete</span>
        <span class="sn-progress-count" style="color: #15803d; font-weight: 800;">${totalGoals}/${totalGoals} (100%)</span>
      </div>
      <div class="sn-progress-bar-track" style="background: rgba(34, 197, 94, 0.2);">
        <div class="sn-progress-bar-fill" style="width: 100%; background: linear-gradient(90deg, #22c55e, #10b981);"></div>
      </div>
    </div>

    <!-- Final Results Summary Card -->
    <div style="background: #ffffff; border: 1.5px solid rgba(234, 179, 8, 0.5); border-radius: 8px; padding: 12px; margin-bottom: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.06);">
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 10px; border-bottom: 1px dashed rgba(234, 179, 8, 0.6); padding-bottom: 8px;">
        <div class="results-rank-circle ${rankClass}" style="width: 48px; height: 48px; font-size: 24px; flex-shrink: 0; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">${rank}</div>
        <div>
          <div style="font-size: 10px; font-weight: 800; letter-spacing: 0.8px; color: #b45309; text-transform: uppercase;">Final Mission Rank</div>
          <div style="font-size: 14px; font-weight: 900; color: #1e293b;">${rankLabel}</div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 11px;">
        <div style="background: #f8fafc; padding: 6px 8px; border-radius: 6px; border: 1px solid #e2e8f0;">
          <div style="color: #64748b; font-size: 9px; font-weight: 700; text-transform: uppercase;">Accuracy</div>
          <div style="font-size: 13px; font-weight: 800; color: #0f172a;">${Math.round(pct * 100)}%</div>
        </div>
        <div style="background: #f8fafc; padding: 6px 8px; border-radius: 6px; border: 1px solid #e2e8f0;">
          <div style="color: #64748b; font-size: 9px; font-weight: 700; text-transform: uppercase;">Decisions</div>
          <div style="font-size: 13px; font-weight: 800; color: #0f172a;">${correct} / ${total}</div>
        </div>
        <div style="background: #f8fafc; padding: 6px 8px; border-radius: 6px; border: 1px solid #e2e8f0;">
          <div style="color: #64748b; font-size: 9px; font-weight: 700; text-transform: uppercase;">Evidence Found</div>
          <div style="font-size: 13px; font-weight: 800; color: #0f172a;">${gameState.evidenceFoundTotal || 0} / ${totalEvidence}</div>
        </div>
        <div style="background: #f8fafc; padding: 6px 8px; border-radius: 6px; border: 1px solid #e2e8f0;">
          <div style="color: #64748b; font-size: 9px; font-weight: 700; text-transform: uppercase;">Phish / Clean</div>
          <div style="font-size: 13px; font-weight: 800; color: #0f172a;">${gameState.phishingDetected || 0} / ${gameState.legitimateDetected || 0}</div>
        </div>
      </div>
    </div>

    <!-- Achievement Trophy Banner -->
    <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 1.5px solid #f59e0b; border-radius: 8px; padding: 10px; margin-bottom: 10px; text-align: center;">
      <div style="font-size: 22px; margin-bottom: 2px;">🏆</div>
      <div style="font-size: 10px; font-weight: 800; color: #92400e; letter-spacing: 0.5px;">ACHIEVEMENT UNLOCKED</div>
      <div style="font-size: 13px; font-weight: 900; color: #78350f; margin-bottom: 6px;">Phishing Investigator</div>
      <button type="button" onclick="showPhishingInvestigatorTrophy()" style="width: 100%; background: #f59e0b; color: #000; font-size: 11px; font-weight: 800; border: none; border-radius: 6px; padding: 7px 10px; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        🏆 Open Trophy &amp; Badge
      </button>
    </div>
  `;

  scrollEl.innerHTML = html;
}

// ─── Toggle Results Full Overlay from Taskbar or Sticky Note ─────────────────
function toggleResultsOverlay() {
  const resultsOv = document.getElementById('overlay-results');
  if (!resultsOv) return;
  if (resultsOv.classList.contains('active')) {
    closeOverlay('overlay-results');
    const desktop = document.getElementById('desktop');
    if (desktop) {
      desktop.style.visibility = 'visible';
      desktop.style.opacity = '1';
    }
  } else {
    showOverlay('overlay-results');
  }
}

function updateStickyNoteForPhase(phase) {
  const titleEl = document.getElementById('sticky-note-title');
  const scrollEl = document.querySelector('#sticky-note .sticky-note-scroll');
  if (!scrollEl) return;

  const currentCat = window._currentChapterCategory || activeCategoryStory || 'phishing';

  // In Chapter 1 (phishing), show locked card until first email is completed
  if (currentCat === 'phishing' || phase === 'phishing') {
    // If all emails completed, show the results
    if (gameState.emailResults && gameState.emailResults.length >= EMAILS.length) {
      const total = EMAILS.length;
      const correct = gameState.correctDecisions;
      const pct = correct / total;
      let rank, rankClass, rankLabel;
      if (pct >= 1.0)       { rank = 'S'; rankClass = 'rank-s'; rankLabel = 'CYBER DETECTIVE'; }
      else if (pct >= 0.85) { rank = 'A'; rankClass = '';       rankLabel = 'EXCELLENT DETECTIVE'; }
      else if (pct >= 0.70) { rank = 'B'; rankClass = 'rank-b'; rankLabel = 'GOOD DETECTIVE'; }
      else if (pct >= 0.50) { rank = 'C'; rankClass = 'rank-c'; rankLabel = 'KEEP PRACTICING'; }
      else                  { rank = 'D'; rankClass = 'rank-d'; rankLabel = 'NEEDS MORE TRAINING'; }
      renderStickyNoteResults(rank, rankLabel, rankClass, pct, correct, total);
      return;
    }

    if (titleEl) titleEl.textContent = "📒 Phishing Investigation Tasks";
    const isFirstEmailCompleted = Boolean(gameState.emailResults && gameState.emailResults.length >= 1);
    if (!isFirstEmailCompleted && gameState.phase === 'mission') {
      scrollEl.innerHTML = `
        <div class="sn-locked-container">
          <div class="sn-locked-icon-bubble">🔒</div>
          <div class="sn-locked-title">Tasks Locked</div>
          <div class="sn-locked-desc">
            Complete your first email investigation in Zmail to unlock your live <strong>Mission Task List</strong>.
          </div>
          <div class="sn-locked-hint">
            👉 <span>Inspect email #1 to unlock tracking</span>
          </div>
        </div>`;
      return;
    }
    scrollEl.innerHTML = `<div id="sn-checklist-section"></div>`;
    updateStickyChecklist();
    return;
  }

  // Chapter 2 (malware) notes
  if (phase === 'malware' || currentCat === 'malware') {
    if (titleEl) titleEl.textContent = "🛡️ Malware Hunter Notes";
    scrollEl.innerHTML = `
      <div class="sn-progress-card" style="border-color: rgba(168, 85, 247, 0.4);">
        <div class="sn-progress-header">
          <span class="sn-progress-title" style="color: #6b21a8;">🛡️ Chapter 2: Malware Goals</span>
          <span class="sn-progress-count" style="color: #6b21a8; background: #f3e8ff; border-color: rgba(168, 85, 247, 0.3);">${gameState.malwareQuarantined || 0}/4</span>
        </div>
      </div>
      <div class="sn-rules-card">
        <div class="sn-rules-title" style="color: #6b21a8;">🛡️ Malware Guidelines</div>
        <ul class="sticky-note-list">
          <li><span class="sn-icon sn-good">🛡️</span><span>Quarantine real Malware safely</span></li>
          <li><span class="sn-icon sn-bad">⚠️</span><span>Verify clean files before quarantining</span></li>
          <li><span class="sn-icon sn-good">⚡</span><span>Anti-Virus Scan: <strong>Free check</strong></span></li>
          <li><span class="sn-icon sn-good">🎯</span><span>Goal: Neutralize all <strong>4 threats</strong></span></li>
          <li><span class="sn-icon sn-good">🏆</span><span>Target: <strong>4/4 Threats Neutralized</strong></span></li>
        </ul>
      </div>
      <div class="sticky-note-tip" style="border-left: 3px solid #9333ea; background: rgba(147, 51, 234, 0.08); color: #581c87;">
        💡 <strong>Detective Tip:</strong> Check actual extension in Folder (e.g. <code>.pdf.exe</code>, <code>.vbs</code>) and run an Anti-Virus scan before clicking Quarantine!
      </div>`;
    // Sticky note opens manually — do NOT auto-open
  }
}

// Drag-to-move + click-to-rename for the sticky note
function initStickyNote() {
  const note = document.getElementById('sticky-note');
  const handles = [
    document.getElementById('sticky-note-drag-handle'),
    document.getElementById('sticky-note-drag-handle-2')
  ].filter(Boolean);
  if (!note || handles.length === 0) return;

  let dragging = false;
  let offsetX = 0;
  let offsetY = 0;

  function startDrag(e) {
    const parent = note.offsetParent || document.getElementById('desktop');
    const parentRect = parent.getBoundingClientRect();
    const noteRect = note.getBoundingClientRect();

    // The note starts out anchored with only `bottom`/`right` in CSS (no
    // `top`), with its height auto-computed from its content. Before we
    // can drag it we need to switch it to `top`-anchored positioning —
    // but if we only clear `bottom` without also freezing `top`, the note
    // has neither anchor for an instant and snaps to its static in-flow
    // position (up near the desktop icons), which looks like it suddenly
    // jumped. Freeze top and left first so the switch is visually a
    // no-op. Height is intentionally left alone (no explicit height is
    // ever set) so the note always keeps its natural, default height.
    note.style.top = (noteRect.top - parentRect.top) + 'px';
    note.style.left = (noteRect.left - parentRect.left) + 'px';
    note.style.bottom = 'auto';

    dragging = true;
    offsetX = e.clientX - noteRect.left;
    offsetY = e.clientY - noteRect.top;
    note.classList.add('dragging');
    // Bring sticky note to front of all app windows on drag start
    focusStickyNote();
    e.preventDefault();
  }

  function onMove(e) {
    if (!dragging) return;
    const parent = note.offsetParent || document.getElementById('desktop');
    const parentRect = parent.getBoundingClientRect();

    let left = e.clientX - parentRect.left - offsetX;
    let top = e.clientY - parentRect.top - offsetY;

    left = Math.max(0, Math.min(left, parentRect.width - note.offsetWidth));
    top = Math.max(0, Math.min(top, parentRect.height - note.offsetHeight));

    note.style.left = left + 'px';
    note.style.top = top + 'px';
  }

  function endDrag() {
    if (dragging) {
      dragging = false;
      note.classList.remove('dragging');
    }
  }

  handles.forEach(h => h.addEventListener('pointerdown', startDrag));
  // Bring to front whenever the sticky note itself is clicked/touched
  note.addEventListener('pointerdown', () => focusStickyNote());
  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', endDrag);
  window.addEventListener('pointercancel', endDrag);
}
