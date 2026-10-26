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

  // Dismiss taskbar pulse highlight immediately when player opens the note
  window._stickyNotesHighlightDismissed = true;
  const tbNotes = document.getElementById('taskbar-notes');
  if (tbNotes) {
    tbNotes.classList.remove('btn-pulse-highlight');
  }

  // Dismiss the icon attention glow when player opens the note
  if (typeof IconAttention !== 'undefined') IconAttention.hide('notes');

  const titleEl = document.getElementById('sticky-note-title');
  if (titleEl) titleEl.textContent = 'Sticky Notes';

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

  // ── Always show the live 4-task checklist based on email interaction ──
  if (!document.getElementById('sn-checklist-section')) {
    scrollEl.innerHTML = '<div id="sn-checklist-section"></div>';
  }
  updateStickyChecklist();
}


function closeStickyNote() {
  const note = document.getElementById('sticky-note');
  if (note) {
    note.classList.add('hidden');
    note.classList.remove('highlight-attention');
  }
  const tbNotes = document.getElementById('taskbar-notes');
  if (tbNotes) {
    tbNotes.classList.remove('btn-pulse-highlight');
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
  if (!gameState || !gameState.emailResults) return 0;
  return gameState.emailResults.filter(r =>
    r.isPhishing === true && r.playerDecision === true && r.correctDecision === true
  ).length;
}

// Helper: count correctly verified & approved clean / legitimate emails
function _countCorrectLegitimate() {
  if (!gameState || !gameState.emailResults) return 0;
  return gameState.emailResults.filter(r =>
    r.isPhishing === false && r.playerDecision === false && r.correctDecision === true
  ).length;
}

// Helper: count emails where player flagged fake_sender (live user interaction + saved cases)
function _countFakeSenderFound() {
  if (!gameState) return 0;
  const completed = (gameState.emailResults || []).filter(r =>
    r.isPhishing === true && r.correctDecision === true && r.savedFlags && r.savedFlags.some(f => f.type === 'fake_sender')
  ).length;

  const detailViewEl = document.getElementById('email-detail-view');
  const isDetailView = Boolean(detailViewEl && detailViewEl.classList.contains('active'));
  const curEmail = (typeof ch1InboxEmails !== 'undefined' && typeof gameState.currentEmail === 'number') ? ch1InboxEmails[gameState.currentEmail] : null;
  const isCurrentUnsubmitted = isDetailView && curEmail && !(gameState.emailResults || []).some(r => r.emailId === curEmail.id);
  const hasActiveFakeSender = isCurrentUnsubmitted && (curEmail.phishing === true) && (gameState.currentEmailFlags || []).some(f => f.type === 'fake_sender');

  return Math.min(5, completed + (hasActiveFakeSender ? 1 : 0));
}

// Helper: count phishing emails where player flagged false_urgency OR suspicious_link (live user interaction + saved cases)
function _countIndicatorsFound() {
  if (!gameState) return 0;
  const completed = (gameState.emailResults || []).filter(r =>
    r.isPhishing === true && r.correctDecision === true && r.savedFlags && r.savedFlags.some(f => f.type === 'false_urgency' || f.type === 'suspicious_link' || f.type === 'malicious_attachment')
  ).length;

  const detailViewEl = document.getElementById('email-detail-view');
  const isDetailView = Boolean(detailViewEl && detailViewEl.classList.contains('active'));
  const curEmail = (typeof ch1InboxEmails !== 'undefined' && typeof gameState.currentEmail === 'number') ? ch1InboxEmails[gameState.currentEmail] : null;
  const isCurrentUnsubmitted = isDetailView && curEmail && !(gameState.emailResults || []).some(r => r.emailId === curEmail.id);
  const hasActiveIndicator = isCurrentUnsubmitted && (curEmail.phishing === true) && (gameState.currentEmailFlags || []).some(f => f.type === 'false_urgency' || f.type === 'suspicious_link' || f.type === 'malicious_attachment');

  return Math.min(5, completed + (hasActiveIndicator ? 1 : 0));
}

const PHISHING_TASK_GOALS = { t1: 5, t2: 5, t3: 5, t4: 5 };

const SN_ACHIEVEMENTS = [
  {
    id: 'task_report_phishing',
    icon: '🚩',
    label: 'Report Phishing Emails',
    desc: 'Correctly identify & report 5 phishing emails.',
    check: () => _countCorrectPhishing() >= PHISHING_TASK_GOALS.t1,
    currentCount: () => Math.min(_countCorrectPhishing(), PHISHING_TASK_GOALS.t1),
    goal: 5,
    progress: () => `${Math.min(_countCorrectPhishing(), PHISHING_TASK_GOALS.t1)}/${PHISHING_TASK_GOALS.t1} phishing emails reported`
  },
  {
    id: 'task_verify_legit',
    icon: '🛡️',
    label: 'Verify Clean Emails',
    desc: 'Correctly identify & confirm 5 safe emails.',
    check: () => _countCorrectLegitimate() >= PHISHING_TASK_GOALS.t2,
    currentCount: () => Math.min(_countCorrectLegitimate(), PHISHING_TASK_GOALS.t2),
    goal: 5,
    progress: () => `${Math.min(_countCorrectLegitimate(), PHISHING_TASK_GOALS.t2)}/${PHISHING_TASK_GOALS.t2} clean emails verified`
  },
  {
    id: 'task_fake_sender',
    icon: '🌐',
    label: 'Document Fake Senders',
    desc: 'Identify & flag 5 suspicious sender addresses.',
    check: () => _countFakeSenderFound() >= PHISHING_TASK_GOALS.t3,
    currentCount: () => Math.min(_countFakeSenderFound(), PHISHING_TASK_GOALS.t3),
    goal: 5,
    progress: () => `${Math.min(_countFakeSenderFound(), PHISHING_TASK_GOALS.t3)}/${PHISHING_TASK_GOALS.t3} fake senders documented`
  },
  {
    id: 'task_phish_indicators',
    icon: '⚠️',
    label: 'Flag Threat Indicators',
    desc: 'Flag 5 clues (urgency, bad links, attachments).',
    check: () => _countIndicatorsFound() >= PHISHING_TASK_GOALS.t4,
    currentCount: () => Math.min(_countIndicatorsFound(), PHISHING_TASK_GOALS.t4),
    goal: 5,
    progress: () => `${Math.min(_countIndicatorsFound(), PHISHING_TASK_GOALS.t4)}/${PHISHING_TASK_GOALS.t4} indicators recorded`
  }
];

const _achievementUnlocked = new Set();
let _trophyUnlockedDate = null;
let _phishingEarnedAward = null;

// ─── 3 Achievement Tiers Based on the 4 Tasks ──────────────────────────────
const PHISHING_ACHIEVEMENT_TIERS = {
  trophy: {
    id: 'phish_trophy_master',
    tier: 'trophy',
    rank: '1st Place',
    icon: '🏆',
    title: 'Phishing Master Trophy',
    badge: '🏆 HIGHEST ACHIEVEMENT · 1ST PLACE',
    label: 'PHISHING MASTER',
    sub: '4/4 Tasks Completed · Flawless Investigation',
    desc: 'Exceptional mastery! You successfully completed all 4 investigation tasks with complete precision — detecting threats, verifying clean emails, documenting fake domains, and uncovering critical indicators.',
    requiredTasks: 4
  },
  medal: {
    id: 'phish_medal_investigator',
    tier: 'medal',
    rank: '2nd Place',
    icon: '🥈',
    title: 'Phishing Investigator Medal',
    badge: '🥈 SECOND PLACE ACHIEVEMENT · 2ND PLACE',
    label: 'PHISHING INVESTIGATOR',
    sub: '2–3 Tasks Completed · Distinguished Detective',
    desc: 'Impressive detective performance! You completed key investigation tasks with sharp cybersecurity instincts, isolating deceptive emails and collecting vital threat evidence.',
    requiredTasks: 2
  },
  ribbon: {
    id: 'phish_ribbon_sentinel',
    tier: 'ribbon',
    rank: 'Lower Tier',
    icon: '🎖️',
    title: 'Phishing Security Ribbon',
    badge: '🎖️ RECOGNITION OF MERIT · SECURITY RIBBON',
    label: 'PHISHING SENTINEL',
    sub: 'Investigation Completed · Awareness Merit',
    desc: 'Email investigation completed! You analyzed real-world scam indicators, practiced threat verification, and built essential cyber defense skills.',
    requiredTasks: 1
  }
};

function getCompletedTasksCount() {
  if (!Array.isArray(SN_ACHIEVEMENTS)) return 0;
  return SN_ACHIEVEMENTS.filter(ach => typeof ach.check === 'function' && ach.check()).length;
}

function getPhishingEarnedTier(count) {
  if (typeof count !== 'number') count = getCompletedTasksCount();
  if (count >= 4) return PHISHING_ACHIEVEMENT_TIERS.trophy;
  if (count >= 2) return PHISHING_ACHIEVEMENT_TIERS.medal;
  return PHISHING_ACHIEVEMENT_TIERS.ribbon;
}

function getPhishingEarnedAward() {
  if (_phishingEarnedAward) return _phishingEarnedAward;
  const count = getCompletedTasksCount();
  const tierObj = getPhishingEarnedTier(count);
  return {
    tier: tierObj.tier,
    title: tierObj.title,
    icon: tierObj.icon,
    badge: tierObj.badge,
    label: tierObj.label,
    rank: tierObj.rank,
    sub: tierObj.sub,
    desc: tierObj.desc,
    tasksCompleted: count,
    unlockedDate: _trophyUnlockedDate || new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })
  };
}

function savePhishingProgress() {
  try {
    const isTrophyUnlocked = isPhishingTrophyUnlocked();
    const data = {
      unlockedAchievements: Array.from(_achievementUnlocked),
      trophyUnlocked: isTrophyUnlocked,
      earnedAward: _phishingEarnedAward,
      unlockedDate: _trophyUnlockedDate || (_phishingEarnedAward ? _phishingEarnedAward.unlockedDate : (isTrophyUnlocked ? new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' }) : null))
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
      if (data.earnedAward) {
        _phishingEarnedAward = data.earnedAward;
      }
      if (data.trophyUnlocked) {
        _achievementUnlocked.add('task_all_complete');
        _trophyUnlockedDate = data.unlockedDate || new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });
      } else if (data.unlockedDate) {
        _trophyUnlockedDate = data.unlockedDate;
      }
    }
  } catch(e) {}
}

function isPhishingTrophyUnlocked() {
  return _achievementUnlocked.has('phish_trophy_master') ||
    _achievementUnlocked.has('phish_trophy_unlocked') ||
    _achievementUnlocked.has('task_all_complete') ||
    (Array.isArray(SN_ACHIEVEMENTS) && SN_ACHIEVEMENTS.length === 4 && SN_ACHIEVEMENTS.every(ach => ach.check()));
}

function updateStickyChecklist() {
  if (gameState.phase !== 'mission' && gameState.phase !== 'results' && gameState.phase !== 'phishing') return;
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
        <span class="sn-progress-title">📋 Checklist</span>
        <span class="sn-progress-count">${completedCount} of ${totalGoals} Done</span>
      </div>
      <div class="sn-progress-bar-track">
        <div class="sn-progress-bar-fill" style="width: ${progressPercent}%;"></div>
      </div>
    </div>
    <ul class="sn-checklist">`;

  SN_ACHIEVEMENTS.forEach(ach => {
    const done = ach.check();
    const curr = typeof ach.currentCount === 'function' ? ach.currentCount() : 0;
    const goal = ach.goal || 5;
    const progBadge = done ? `${goal} / ${goal} ✓` : `${curr} / ${goal}`;
    const progFull = ach.progress();
    html += `
      <li class="sn-ach-item ${done ? 'sn-ach-done' : ''}">
        <div class="sn-checkbox ${done ? 'checked' : ''}" aria-hidden="true">${done ? '✓' : ''}</div>
        <div class="sn-ach-body">
          <div class="sn-ach-header-row">
            <span class="sn-ach-label">${ach.icon} ${ach.label}</span>
            <span class="sn-ach-prog-badge ${done ? 'done' : ''}" title="${progFull}">${progBadge}</span>
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

  // Bottom "3 Achievements (4 Tasks)" text removed per user request for a simple, clean design
  section.innerHTML = html;
}

function showAchievementToast(ach) {
  const existing = document.getElementById('achievement-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'achievement-toast';
  toast.className = 'achievement-toast';
  const toastTitle = ach.isAwardToast ? '🏆 Achievement Award Unlocked!' : '🎯 Task Completed!';
  const toastDesc = typeof ach.progress === 'function' ? ach.progress() : (ach.desc || '');

  toast.innerHTML = `
    <div class="ach-toast-glow"></div>
    <div class="ach-toast-icon">${ach.icon}</div>
    <div class="ach-toast-body">
      <div class="ach-toast-title">${toastTitle}</div>
      <div class="ach-toast-name">${ach.label}</div>
      <div class="ach-toast-desc">${toastDesc}</div>
    </div>
  `;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add('ach-toast-show'));
  });

  setTimeout(() => {
    toast.classList.remove('ach-toast-show');
    setTimeout(() => toast.remove(), 400);
  }, 4500);

  if (typeof AudioManager !== 'undefined' && AudioManager.playCorrect) {
    AudioManager.playCorrect();
  }
}

// ─── Phishing Achievement Modal (Dynamic: Trophy, Medal, Ribbon) ─────────────
function showPhishingAchievementModal(customAward, customCount) {
  const existing = document.getElementById('phish-trophy-modal');
  if (existing) existing.remove();

  const count = typeof customCount === 'number' ? customCount : getCompletedTasksCount();
  const award = customAward || getPhishingEarnedAward();
  const tier = award.tier || 'ribbon';
  const dateStr = award.unlockedDate || _trophyUnlockedDate || new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });

  // Evaluation of the 4 tasks
  const t1Done = SN_ACHIEVEMENTS[0] ? SN_ACHIEVEMENTS[0].check() : false;
  const t2Done = SN_ACHIEVEMENTS[1] ? SN_ACHIEVEMENTS[1].check() : false;
  const t3Done = SN_ACHIEVEMENTS[2] ? SN_ACHIEVEMENTS[2].check() : false;
  const t4Done = SN_ACHIEVEMENTS[3] ? SN_ACHIEVEMENTS[3].check() : false;

  const t1Prog = SN_ACHIEVEMENTS[0] ? SN_ACHIEVEMENTS[0].progress() : '';
  const t2Prog = SN_ACHIEVEMENTS[1] ? SN_ACHIEVEMENTS[1].progress() : '';
  const t3Prog = SN_ACHIEVEMENTS[2] ? SN_ACHIEVEMENTS[2].progress() : '';
  const t4Prog = SN_ACHIEVEMENTS[3] ? SN_ACHIEVEMENTS[3].progress() : '';

  const accuracyPct = gameState && typeof gameState.correctDecisions === 'number' && typeof EMAILS !== 'undefined' && EMAILS.length > 0
    ? Math.round((gameState.correctDecisions / EMAILS.length) * 100)
    : 100;
  const correctDecisions = gameState && typeof gameState.correctDecisions === 'number'
    ? gameState.correctDecisions
    : (typeof EMAILS !== 'undefined' ? EMAILS.length : 10);
  const totalEmailsCount = typeof EMAILS !== 'undefined' ? EMAILS.length : 10;

  const modal = document.createElement('div');
  modal.id = 'phish-trophy-modal';
  modal.className = 'phish-trophy-modal';
  modal.innerHTML = `
    <div class="ptm-backdrop" onclick="closePhishingTrophy()"></div>
    <div class="ptm-card ptm-tier-${tier}">
      <div class="ptm-glow-ring"></div>
      <div class="ptm-header">
        <div class="ptm-trophy-icon">${award.icon}</div>
        <div class="ptm-confetti" id="ptm-confetti"></div>
      </div>
      <div class="ptm-body">
        <div class="ptm-badge">${award.badge}</div>
        <h2 class="ptm-title">${award.title}</h2>
        <div class="ptm-subtitle" style="font-size: 12px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 10px;">
          ${award.sub || (tier === 'trophy' ? '1st Place Honor · 4/4 Tasks' : tier === 'medal' ? '2nd Place Honor · 2–3/4 Tasks' : 'Lower Tier · Awareness Ribbon')}
        </div>
        <p class="ptm-desc">${award.desc}</p>
        <div class="ptm-date">🗓️ Awarded: ${dateStr}</div>

        <!-- 3-Tier Achievement Ladder -->
        <div class="ptm-tier-ladder">
          <div class="ptm-tier-ladder-step ${tier === 'ribbon' ? 'earned' : ''}">
            <span class="ptm-tls-icon">🎖️</span>
            <span class="ptm-tls-name">Ribbon</span>
            <span class="ptm-tls-req">1 Task (Lower)</span>
            ${tier === 'ribbon' ? '<span class="ptm-tls-badge">EARNED</span>' : ''}
          </div>
          <div class="ptm-tier-ladder-divider"></div>
          <div class="ptm-tier-ladder-step ${tier === 'medal' ? 'earned' : ''}">
            <span class="ptm-tls-icon">🥈</span>
            <span class="ptm-tls-name">Medal</span>
            <span class="ptm-tls-req">2–3 Tasks (2nd Place)</span>
            ${tier === 'medal' ? '<span class="ptm-tls-badge">EARNED</span>' : ''}
          </div>
          <div class="ptm-tier-ladder-divider"></div>
          <div class="ptm-tier-ladder-step ${tier === 'trophy' ? 'earned' : ''}">
            <span class="ptm-tls-icon">🏆</span>
            <span class="ptm-tls-name">Trophy</span>
            <span class="ptm-tls-req">4 Tasks (Highest)</span>
            ${tier === 'trophy' ? '<span class="ptm-tls-badge">EARNED</span>' : ''}
          </div>
        </div>

        <!-- Quick Stats Overview -->
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 14px; font-size: 11px;">
          <div style="background: rgba(15,23,42,0.6); padding: 6px 8px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
            <div style="color: #94a3b8; font-size: 9px; font-weight: 700; text-transform: uppercase;">Tasks Completed</div>
            <div style="font-size: 14px; font-weight: 900; color: #f8fafc;">${count} / 4</div>
          </div>
          <div style="background: rgba(15,23,42,0.6); padding: 6px 8px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
            <div style="color: #94a3b8; font-size: 9px; font-weight: 700; text-transform: uppercase;">Accuracy</div>
            <div style="font-size: 14px; font-weight: 900; color: #f8fafc;">${accuracyPct}%</div>
          </div>
          <div style="background: rgba(15,23,42,0.6); padding: 6px 8px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
            <div style="color: #94a3b8; font-size: 9px; font-weight: 700; text-transform: uppercase;">Decisions</div>
            <div style="font-size: 14px; font-weight: 900; color: #f8fafc;">${correctDecisions} / ${totalEmailsCount}</div>
          </div>
        </div>

        <!-- 4 Tasks Summary -->
        <div class="ptm-tasks-summary">
          <div class="ptm-task-row ${t1Done ? 'ptm-task-done' : 'ptm-task-incomplete'}">
            <span class="ptm-task-icon">🚩</span>
            <span>Task 1: Report Phishing Emails (${t1Prog})</span>
            <span class="ptm-task-check">${t1Done ? '✓ COMPLETED' : '✗ INCOMPLETE'}</span>
          </div>
          <div class="ptm-task-row ${t2Done ? 'ptm-task-done' : 'ptm-task-incomplete'}">
            <span class="ptm-task-icon">🛡️</span>
            <span>Task 2: Verify Clean Emails (${t2Prog})</span>
            <span class="ptm-task-check">${t2Done ? '✓ COMPLETED' : '✗ INCOMPLETE'}</span>
          </div>
          <div class="ptm-task-row ${t3Done ? 'ptm-task-done' : 'ptm-task-incomplete'}">
            <span class="ptm-task-icon">🌐</span>
            <span>Task 3: Document Fake Senders (${t3Prog})</span>
            <span class="ptm-task-check">${t3Done ? '✓ COMPLETED' : '✗ INCOMPLETE'}</span>
          </div>
          <div class="ptm-task-row ${t4Done ? 'ptm-task-done' : 'ptm-task-incomplete'}">
            <span class="ptm-task-icon">⚠️</span>
            <span>Task 4: Identify Phishing Indicators (${t4Prog})</span>
            <span class="ptm-task-check">${t4Done ? '✓ COMPLETED' : '✗ INCOMPLETE'}</span>
          </div>
        </div>
      </div>
      <div class="ptm-footer">
        <button class="ptm-close-btn" onclick="closePhishingTrophy()">🎉 Claim ${award.title} &amp; Continue</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const confettiEl = modal.querySelector('#ptm-confetti');
  const palette = tier === 'trophy'
    ? ['#ffd700', '#facc15', '#f59e0b', '#ffffff', '#fbbf24']
    : tier === 'medal'
    ? ['#e2e8f0', '#38bdf8', '#0ea5e9', '#ffffff', '#94a3b8']
    : ['#f59e0b', '#fbbf24', '#cd7f32', '#10b981', '#ffffff'];

  for (let i = 0; i < 40; i++) {
    const p = document.createElement('div');
    p.className = 'ptm-particle';
    p.style.cssText = `left:${Math.random()*100}%;background:${palette[Math.floor(Math.random()*palette.length)]};animation-delay:${Math.random()*1.2}s;animation-duration:${1.2+Math.random()*1.2}s;width:${6+Math.random()*8}px;height:${6+Math.random()*8}px;border-radius:${Math.random()>0.5?'50%':'2px'};`;
    confettiEl.appendChild(p);
  }

  requestAnimationFrame(() => {
    requestAnimationFrame(() => modal.classList.add('ptm-show'));
  });

  if (typeof AudioManager !== 'undefined' && AudioManager.playCorrect) {
    AudioManager.playCorrect();
  }
}

// Backward-compat alias:
function showPhishingInvestigatorTrophy() {
  showPhishingAchievementModal();
}

function closePhishingTrophy() {
  const modal = document.getElementById('phish-trophy-modal');
  if (!modal) return;
  modal.classList.remove('ptm-show');
  savePhishingProgress();
  setTimeout(() => modal.remove(), 400);

  // Trigger post-achievement dialogue: onboarding to team & Phone Link Group Chat
  setTimeout(() => {
    triggerPostAchievementPhoneLinkInvite();
  }, 450);
}

// ─── Post-Achievement Dialogue: Onboarding to Team & Phone Link Group Chat ────
function triggerPostAchievementPhoneLinkInvite() {
  const gcState = (typeof loadNewbieGcState === 'function') ? loadNewbieGcState() : { invited: false, accepted: false };
  const award = (typeof getPhishingEarnedAward === 'function') ? getPhishingEarnedAward() : null;
  const awardTitle = award ? award.title : 'Phishing Investigation Award';
  const awardIcon = award ? award.icon : '🏆';
  const completedCount = award ? (award.tasksCompleted || 0) : getCompletedTasksCount();

  // Mark invite pending in Phone Link and highlight the desktop / taskbar icon
  if (typeof setNewbieGcInvitePending === 'function') {
    setNewbieGcInvitePending(true);
  }

  // Mentor dialogue with Ryan welcoming to the team and instructing to open Phone Link
  if (typeof RyanGuide === 'undefined') {
    if (typeof showToast === 'function') {
      showToast('📱 New team invite received! Open Phone Link to join "Business Inc. — Newbie Squad 🚀"', 'info');
    }
    return;
  }

  if (!gcState.accepted) {
    RyanGuide.speak([
      {
        text: `Outstanding work on the email investigation, Alex! You completed ${completedCount}/4 investigation tasks and earned the ${awardIcon} ${awardTitle}!`,
        state: 'success'
      },
      {
        text: "The security team was watching your results, Alex. You've officially proven you're ready — you are now part of our Cyber Defense Team!",
        state: 'success'
      },
      {
        text: "I just sent an invite to your Phone Link for our company newbie group chat: Business Inc. — Newbie Squad 🚀.",
        state: 'speaking'
      },
      {
        text: "Open your Phone Link app now to accept the invite, Alex! Ethan, Pia, and I are all inside waiting to welcome you to the squad.",
        state: 'thinking'
      }
    ], {
      onDone: () => {
        if (typeof RyanGuide.ask === 'function') {
          RyanGuide.ask(
            "Ready to join the company newbie squad?",
            [
              { text: "📱 Open Phone Link Now", value: 'open' },
              { text: "I'll open it later", value: 'later' }
            ],
            function(choice) {
              if (choice === 'open') {
                if (typeof openApp === 'function') openApp('comms');
                if (typeof openNewbieGcConversation === 'function') {
                  setTimeout(() => openNewbieGcConversation(), 250);
                }
                if (typeof AudioManager !== 'undefined' && AudioManager.playClick) {
                  AudioManager.playClick();
                }
              } else {
                if (typeof showToast === 'function') {
                  showToast('📱 You can open Phone Link on your desktop or taskbar anytime to accept your team invite!', 'info');
                }
              }
            }
          );
        }
      }
    });
  } else {
    RyanGuide.speak([
      {
        text: "You're an active member of Business Inc. — Newbie Squad, Alex! Keep checking your apps as you advance in your training!",
        state: 'success'
      }
    ]);
  }
}



function toggleStickyNote() {
  // ── Block during pretest / Ryan intro dialogue ──
  const pretestRunning  = typeof RyanPretest !== 'undefined' && RyanPretest.isRunning && RyanPretest.isRunning();
  const ryanIntroActive = typeof RyanGuide   !== 'undefined' && RyanGuide.isActive   && RyanGuide.isActive()
                          && typeof gameState !== 'undefined' && gameState.phase === 'mission'
                          && typeof ch1InboxEmails !== 'undefined' && ch1InboxEmails.length === 0;
  if (pretestRunning || ryanIntroActive) {
    if (typeof showToast === 'function') showToast('Please complete the pre-test with Ryan first.', 'warning');
    const bd = document.getElementById('ryan-pretest-backdrop');
    if (bd && pretestRunning) bd.style.zIndex = '99999';
    return;
  }

  const note = document.getElementById('sticky-note');
  if (!note) return;
  if (note.classList.contains('hidden')) {
    showStickyNote();
  } else {
    closeStickyNote();
  }
}

// ─── Render Investigation Results and Tasks inside Sticky Note ────────────────
function renderStickyNoteResults(rank, rankLabel, rankClass, pct, correct, total, earnedTier, completedTasksCount) {
  const note = document.getElementById('sticky-note');
  const titleEl = document.getElementById('sticky-note-title');
  const scrollEl = document.querySelector('#sticky-note .sticky-note-scroll');
  if (!note || !scrollEl) return;

  const count = typeof completedTasksCount === 'number' ? completedTasksCount : getCompletedTasksCount();
  const award = earnedTier || getPhishingEarnedAward();
  const tier = award.tier || 'ribbon';

  if (titleEl) {
    titleEl.innerHTML = `${award.icon} <span>Investigation Complete — Results</span>`;
  }

  // Ensure note is visible, not collapsed
  note.classList.remove('hidden', 'collapsed');
  note.style.zIndex = '4600';

  const totalGoals = SN_ACHIEVEMENTS.length;
  const totalEvidence = (typeof EMAILS !== 'undefined') ? EMAILS.reduce((sum, e) => sum + e.evidence.length, 0) : 0;

  let html = `
    <!-- Task Progress Bar Card -->
    <div class="sn-progress-card" style="border-color: rgba(34, 197, 94, 0.4); background: rgba(34, 197, 94, 0.08); margin-bottom: 10px;">
      <div class="sn-progress-header">
        <span class="sn-progress-title" style="color: #15803d; font-weight: 800;">✅ Investigation Tasks</span>
        <span class="sn-progress-count" style="color: #15803d; font-weight: 800;">${count}/${totalGoals} (${Math.round((count/totalGoals)*100)}%)</span>
      </div>
      <div class="sn-progress-bar-track" style="background: rgba(34, 197, 94, 0.2);">
        <div class="sn-progress-bar-fill" style="width: ${Math.round((count/totalGoals)*100)}%; background: linear-gradient(90deg, #22c55e, #10b981);"></div>
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
          <div style="font-size: 13px; font-weight: 800; color: #0f172a;">${(gameState && gameState.evidenceFoundTotal) || 0} / ${totalEvidence}</div>
        </div>
        <div style="background: #f8fafc; padding: 6px 8px; border-radius: 6px; border: 1px solid #e2e8f0;">
          <div style="color: #64748b; font-size: 9px; font-weight: 700; text-transform: uppercase;">Phish / Clean</div>
          <div style="font-size: 13px; font-weight: 800; color: #0f172a;">${(gameState && gameState.phishingDetected) || 0} / ${(gameState && gameState.legitimateDetected) || 0}</div>
        </div>
      </div>
    </div>

    <!-- Achievement Earned Banner (Dynamic: Trophy, Medal, Ribbon) -->
    <div class="sn-ach-banner sn-ach-banner-${tier}">
      <div style="font-size: 26px; margin-bottom: 2px;">${award.icon}</div>
      <div class="sn-ach-banner-tag">${award.badge}</div>
      <div class="sn-ach-banner-title">${award.title}</div>
      <div class="sn-ach-banner-sub">${count}/4 Tasks Completed · ${award.rank}</div>
      <button type="button" onclick="showPhishingAchievementModal()" class="sn-ach-banner-btn">
        ${award.icon} View ${award.title}
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

    if (titleEl) titleEl.textContent = "Sticky Notes";
    if (!document.getElementById('sn-checklist-section')) {
      scrollEl.innerHTML = `<div id="sn-checklist-section"></div>`;
    }
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
