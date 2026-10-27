'use strict';

// ═══════════════════════════════════════════════════════════
// STICKY NOTE — Scoring Reminder
// ═══════════════════════════════════════════════════════════

// ── Post-Award Mission Checklist Tracking ──────────────────
window._awardClaimed        = false;
window._postAwardTasks      = {
  browserOpened:    false,  // opened browser
  phishingSearched: false,  // searched phishing in browser
  phishingVisited:  false,  // visited a phishing site in browser
  explorerOpened:   false,  // opened File Explorer
  videoFolderOpen:  false,  // navigated to Videos folder
  videoPlayed:      false,  // played a video
  postTestDone:     false   // completed post-test
};

// Quick launcher from Sticky Notes tasks
window.quickOpenChecklistTask = function(taskId) {
  if (taskId === 'browser') {
    if (typeof openApp === 'function') openApp('browser');
    if (typeof focusWindow === 'function') focusWindow('browser');
    if (typeof showToast === 'function') {
      showToast('🌐 Browser opened! Search "phishing" to complete this checklist task.', 'info');
    }
  } else if (taskId === 'explorer') {
    if (typeof openApp === 'function') {
      openApp('folder');
      if (typeof switchExplorerFolder === 'function') {
        switchExplorerFolder('videos');
      }
      if (typeof focusWindow === 'function') focusWindow('folder');
    }
    if (typeof showToast === 'function') {
      showToast('📁 Videos folder opened! Click cyber_awareness_clip.mp4 to watch.', 'info');
    }
  }
};

// Called by openApp wrapper
window._notifyPostAwardAppOpen = function(appName) {
  if (!window._awardClaimed) return;
  const t = window._postAwardTasks;
  if (appName === 'browser')    { t.browserOpened = true; }
  if (appName === 'folder')     { t.explorerOpened = true; }
  if (appName === 'videoplayer'){ t.videoPlayed = true; }
  _refreshPostAwardChecklist();
};

// Called by navigateBrowser wrapper
window._notifyPostAwardBrowserNav = function(url) {
  if (!window._awardClaimed) return;
  const t = window._postAwardTasks;
  t.browserOpened = true;
  const lower = (url || '').toLowerCase();
  if (lower.includes('phish') || (typeof getPhishingSiteForUrl === 'function' && getPhishingSiteForUrl(url))) {
    t.phishingSearched = true;
    t.phishingVisited  = true;
  }
  _refreshPostAwardChecklist();
};

// Called by switchExplorerFolder wrapper
window._notifyPostAwardFolderSwitch = function(folderId) {
  if (!window._awardClaimed) return;
  const t = window._postAwardTasks;
  t.explorerOpened = true;
  if ((folderId || '').toLowerCase().includes('video')) {
    t.videoFolderOpen = true;
  }
  _refreshPostAwardChecklist();
};

// Called when video plays
window._notifyPostAwardVideoPlay = function() {
  if (!window._awardClaimed) return;
  window._postAwardTasks.videoPlayed = true;
  _refreshPostAwardChecklist();
};

// Check if all post-award checklist tasks are complete (Browser & File Explorer Video)
function _allChecklistTasksDone() {
  const t = window._postAwardTasks;
  if (!t) return false;
  const browserDone = !!(t.phishingSearched || t.phishingVisited);
  const videoDone   = !!t.videoPlayed;
  return !!(browserDone && videoDone);
}

function _refreshPostAwardChecklist() {
  const section = document.getElementById('sn-post-award-checklist');
  if (!section) return;
  section.innerHTML = _buildPostAwardChecklistHTML();
}

function _buildPostAwardChecklistHTML() {
  const t = window._postAwardTasks;
  const postDone = typeof RyanPosttest !== 'undefined' && RyanPosttest.getResult && RyanPosttest.getResult();
  t.postTestDone = !!postDone;

  const browserDone = !!(t.phishingSearched || t.phishingVisited);
  const videoDone   = !!t.videoPlayed;

  const tasks = [
    {
      id: 'browser',
      icon: '🌐',
      label: 'Open Browser &amp; Search Phishing',
      desc: 'Open the Browser and search <strong>"phishing"</strong> on Google to learn about deceptive threat indicators.',
      done: browserDone
    },
    {
      id: 'explorer',
      icon: '📁',
      label: 'Open File Explorer &amp; Watch Phishing Short Video',
      desc: 'Open File Explorer, go to the <strong>Videos</strong> folder, and watch the short video about phishing (<code>cyber_awareness_clip.mp4</code>).',
      done: videoDone
    }
  ];

  const doneCount = tasks.filter(task => task.done).length;
  const pct = Math.round((doneCount / tasks.length) * 100);
  const allDone = doneCount === tasks.length;

  let html = `
    <div class="sn-progress-card">
      <div class="sn-progress-header">
        <span class="sn-progress-title">&#128203; Mission Checklist</span>
        <span class="sn-progress-count">${doneCount} of ${tasks.length} Done</span>
      </div>
      <div class="sn-progress-bar-track">
        <div class="sn-progress-bar-fill" style="width:${pct}%;"></div>
      </div>
    </div>
    <ul class="sn-checklist">`;

  tasks.forEach(function(task) {
    html += `
      <li class="sn-ach-item${task.done ? ' sn-ach-done' : ''}" onclick="quickOpenChecklistTask('${task.id}')" title="Click to open ${task.id === 'browser' ? 'Browser' : 'File Explorer'}" style="cursor:pointer;">
        <div class="sn-checkbox${task.done ? ' checked' : ''}" aria-hidden="true">${task.done ? '&#10003;' : ''}</div>
        <div class="sn-ach-body">
          <div class="sn-ach-header-row">
            <span class="sn-ach-label">${task.icon} ${task.label}</span>
            <span class="sn-ach-prog-badge${task.done ? ' done' : ''}">${task.done ? '&#10003; Done' : 'Pending'}</span>
          </div>
          <div class="sn-ach-desc">${task.desc}</div>
        </div>
      </li>`;
  });

  html += '</ul>';

  if (allDone) {
    html += `
      <div style="margin-top:12px;padding:12px 10px;background:rgba(16,185,129,.12);border-radius:10px;border:1.5px solid rgba(16,185,129,.35);text-align:center;">
        <div style="font-size:12.5px;color:#065f46;font-weight:800;margin-bottom:6px;">&#127881; Checklist Complete! All tasks followed!</div>
        <div style="font-size:11.5px;color:#047857;margin-bottom:10px;">Ready to test your knowledge in the post-investigation evaluation.</div>
        <button type="button" onclick="startPostTestFromSticky(event)" style="background:linear-gradient(135deg,#10b981,#059669);color:#fff;border:none;border-radius:8px;padding:10px 18px;font-size:13px;font-weight:700;cursor:pointer;width:100%;box-shadow:0 4px 12px rgba(16,185,129,.3);display:flex;align-items:center;justify-content:center;gap:8px;">
          <span>&#128221; Begin Post-Test (20 Questions)</span><span>&#10145;</span>
        </button>
      </div>`;
  } else {
    html += `
      <div style="margin-top:10px;padding:8px 10px;background:rgba(245,158,11,.08);border-radius:8px;border:1px solid rgba(245,158,11,.25);text-align:center;font-size:11.5px;color:#92400e;line-height:1.5;">
        &#128203; <strong>Guide:</strong> Complete both tasks above to continue to the Post-Test. Click a task to open the app!
      </div>`;
  }

  return html;
}

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

function getPhishingEarnedTier(count, pct) {
  if (typeof count !== 'number') count = getCompletedTasksCount();
  const accuracy = (typeof pct === 'number')
    ? pct
    : ((gameState && typeof gameState.correctDecisions === 'number' && typeof EMAILS !== 'undefined' && EMAILS.length > 0)
        ? (gameState.correctDecisions / EMAILS.length)
        : 0);
  // 1st Place / Highest: 4 tasks OR >= 90% accuracy
  if (count >= 4 || accuracy >= 0.90) return PHISHING_ACHIEVEMENT_TIERS.trophy;
  // 2nd Place / Medal: 2-3 tasks OR >= 70% accuracy
  if (count >= 2 || accuracy >= 0.70) return PHISHING_ACHIEVEMENT_TIERS.medal;
  // Merit Ribbon / Medal: 1 task or lower
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
      awardClaimed: !!window._awardClaimed,
      postAwardTasks: window._postAwardTasks || {},
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
      if (data.awardClaimed) {
        window._awardClaimed = true;
      }
      if (data.postAwardTasks) {
        window._postAwardTasks = Object.assign(window._postAwardTasks || {}, data.postAwardTasks);
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

// ─── Phishing Achievement Modal (Big Medal + Confetti Celebration) ───────────
function showPhishingAchievementModal(customAward, customCount) {
  const existing = document.getElementById('phish-trophy-modal');
  if (existing) existing.remove();

  const count = typeof customCount === 'number' ? customCount : getCompletedTasksCount();
  const award = customAward || getPhishingEarnedAward();
  const tier = award.tier || 'ribbon';

  const modal = document.createElement('div');
  modal.id = 'phish-trophy-modal';
  modal.className = 'phish-trophy-modal';
  modal.innerHTML = `
    <div class="ptm-backdrop" onclick="closePhishingTrophy()"></div>
    <div class="ptm-confetti-fullscreen" id="ptm-confetti"></div>
    <div class="ptm-card ptm-tier-${tier} ptm-card-clean">
      <div class="ptm-glow-ring"></div>
      <div class="ptm-big-medal-container">
        <div class="ptm-big-medal-icon">${award.icon}</div>
      </div>
      <h2 class="ptm-big-title">${award.title}</h2>
      <div class="ptm-big-rank">${award.rank || ''}</div>
      <div class="ptm-footer" style="margin-top: 26px;">
        <button class="ptm-close-btn" onclick="closePhishingTrophy()">🎉 Claim Award &amp; Continue</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const confettiEl = modal.querySelector('#ptm-confetti');

  // Confetti only for Trophy (1st place) — not for medal or ribbon
  if (tier === 'trophy') {
    const palette = ['#ffd700', '#facc15', '#f59e0b', '#ffffff', '#fbbf24', '#f43f5e', '#10b981'];
    for (let i = 0; i < 75; i++) {
      const p = document.createElement('div');
      p.className = 'ptm-confetti-particle';
      const size = 7 + Math.random() * 9;
      const isRound = Math.random() > 0.6;
      const isRibbon = !isRound && Math.random() > 0.5;
      p.style.cssText = `
        left: ${Math.random() * 100}%;
        background: ${palette[Math.floor(Math.random() * palette.length)]};
        animation-delay: ${Math.random() * 2.5}s;
        animation-duration: ${2.4 + Math.random() * 2}s;
        width: ${isRibbon ? size * 0.45 : size}px;
        height: ${isRibbon ? size * 1.8 : size}px;
        border-radius: ${isRound ? '50%' : '2px'};
        opacity: ${0.85 + Math.random() * 0.15};
      `;
      confettiEl.appendChild(p);
    }
  }

  requestAnimationFrame(() => {
    requestAnimationFrame(() => modal.classList.add('ptm-show'));
  });

  if (typeof AudioManager !== 'undefined' && AudioManager.playTrophyFanfare) {
    AudioManager.playTrophyFanfare();
  } else if (typeof AudioManager !== 'undefined' && AudioManager.playCorrect) {
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

  // Mark award as claimed — switches sticky note to post-award checklist
  window._awardClaimed = true;
  savePhishingProgress();

  // Ensure Phone Link desktop icon has NO glowing notice or blinking highlight
  if (typeof unhighlightPhoneLinkApp === 'function') {
    unhighlightPhoneLinkApp();
  }
  const commsIcon = document.getElementById('icon-comms');
  if (commsIcon) {
    commsIcon.classList.remove('icon-attention', 'pl-icon-pulse');
    commsIcon.removeAttribute('data-badge');
  }

  // User only guide is checklist sticky notes — dismiss RyanGuide dialogue
  if (typeof RyanGuide !== 'undefined' && RyanGuide.dismiss) {
    RyanGuide.dismiss();
  }

  // Open and show sticky note immediately as the player's primary guide
  showStickyNote();
  if (typeof focusStickyNote === 'function') {
    focusStickyNote();
  }

  // Refresh sticky note immediately to show the new mission checklist
  setTimeout(() => {
    if (typeof renderStickyNoteResults === 'function') {
      renderStickyNoteResults();
    }
    showStickyNote();
    if (typeof focusStickyNote === 'function') {
      focusStickyNote();
    }
  }, 420);

  // Silently prepare newbie group without any desktop icon glow or Ryan speech popup
  setTimeout(() => {
    if (typeof _silentlyCreatePhoneLinkGroup === 'function') {
      _silentlyCreatePhoneLinkGroup();
    }
  }, 600);
}

// ─── Post-Achievement Dialogue: Checklist Guide + Post-Test Prompt ────────────
function triggerPostAchievementPostTestPrompt() {
  const award = (typeof getPhishingEarnedAward === 'function') ? getPhishingEarnedAward() : null;
  const awardTitle = award ? award.title : 'Phishing Security Ribbon';
  const awardIcon = award ? award.icon : '\uD83C\uDF96\uFE0F';
  const tier = award ? award.tier : 'ribbon';

  // If already taken post-test, jump straight to team onboarding
  if (typeof RyanPosttest !== 'undefined' && RyanPosttest.getResult && RyanPosttest.getResult()) {
    triggerPostAchievementPhoneLinkInvite();
    return;
  }

  if (typeof RyanGuide === 'undefined') {
    if (typeof RyanPosttest !== 'undefined') {
      RyanPosttest.confirmAndLaunch(() => triggerPostAchievementPhoneLinkInvite());
    }
    return;
  }

  // Dismiss any active dialogue first
  RyanGuide.dismiss();

  // Congratulate Alex based on award tier
  let congratsIntro = '';
  if (tier === 'trophy' || (award && award.rank && award.rank.includes('1st'))) {
    congratsIntro = `Congratulations on claiming your \uD83C\uDFC6 <strong>${awardTitle}</strong>! Flawless investigation work, Alex!`;
  } else if (tier === 'medal' || (award && award.rank && award.rank.includes('2nd'))) {
    congratsIntro = `Congratulations on claiming your \uD83E\uDD48 <strong>${awardTitle}</strong>! Outstanding effort uncovering email threats, Alex!`;
  } else {
    congratsIntro = `Congratulations on claiming your ${awardIcon} <strong>${awardTitle}</strong>! Great job learning email threat indicators, Alex!`;
  }

  RyanGuide.speak(
    [
      {
        text: congratsIntro,
        state: 'success',
        label: 'TAP TO CONTINUE'
      },
      {
        text: "Before the Post-Test, complete the <strong>Mission Checklist</strong> in your Sticky Notes \uD83D\uDCCB. Complete all 3 tasks first!",
        state: 'speaking',
        label: 'TAP TO CONTINUE'
      },
      {
        text: "🌐 <strong>Task 1:</strong> Open the <strong>Browser</strong> and search for <strong>\"phishing\"</strong> to learn more about deceptive threat indicators.",
        state: 'thinking',
        label: 'TAP TO CONTINUE'
      },
      {
        text: "📁 <strong>Task 2:</strong> Open <strong>File Explorer</strong> → go to the <strong>Videos</strong> folder → watch the short video about phishing.",
        state: 'speaking',
        label: 'TAP TO CONTINUE'
      },
      {
        text: "📱 <strong>Task 3:</strong> Follow your Sticky Notes checklist to open <strong>Phone Link</strong> and send \"Hello!\" to meet your new team in the group chat.",
        state: 'thinking',
        label: 'TAP TO CONTINUE'
      },
      {
        text: "Follow the checklist in your Sticky Notes! Once all tasks are checked off, click <strong>Begin Post-Test</strong> to start! 📝",
        state: 'success',
        label: 'GOT IT!'
      }
    ],
    {
      onDone: function() {
        if (typeof showToast === 'function') {
          showToast('📋 Check Sticky Notes — complete all 3 tasks to unlock the Post-Test!', 'info');
        }
        // Silently create Phone Link group with NO glowing notice on desktop
        setTimeout(function() {
          _silentlyCreatePhoneLinkGroup();
        }, 800);
      }
    }
  );
}

// Notify checklist that the Phone Link task is done
window._notifyPostAwardPhoneLinkGroupJoin = function() {
  if (!window._awardClaimed) return;
  window._postAwardTasks.phoneLinkOpened = true;
  _refreshPostAwardChecklist();
};

// Silent group creator — fires right after award claim, NO celebration dialogue, NO desktop glow
function _silentlyCreatePhoneLinkGroup() {
  if (typeof AudioManager !== 'undefined' && AudioManager.playNotification) {
    AudioManager.playNotification();
  }
  if (typeof setNewbieGcCreated === 'function') {
    setNewbieGcCreated(false); // false = do not highlight phone link desktop icon
  } else if (typeof setNewbieGcInvitePending === 'function') {
    setNewbieGcInvitePending(false);
  }
  if (typeof unhighlightPhoneLinkApp === 'function') {
    unhighlightPhoneLinkApp();
  }
  const commsIcon = document.getElementById('icon-comms');
  if (commsIcon) {
    commsIcon.classList.remove('icon-attention', 'pl-icon-pulse');
    commsIcon.removeAttribute('data-badge');
  }
}

// ─── Post-Test Review Later Guidance Dialogue ────
function triggerPostTestReviewLaterGuide() {
  if (typeof showToast === 'function') {
    showToast('\uD83D\uDCCB Complete the Mission Checklist in Sticky Notes first, then take the Post-Test!', 'info');
  }

  if (typeof RyanGuide !== 'undefined') {
    RyanGuide.speak([
      {
        text: "Take your time! Reviewing before the Post-Test is a great idea.",
        state: 'speaking'
      },
      {
        text: "You can open the Browser to search and review phishing clues and concepts.",
        state: 'thinking'
      },
      {
        text: "You can also open File Explorer and check the Videos folder to play the short video about phishing.",
        state: 'speaking'
      },
      {
        text: "Whenever you feel ready, open your Sticky Notes and click Begin Post-Test to start!",
        state: 'success'
      }
    ]);
  }
}

// ─── Post-Achievement Dialogue: Onboarding to "new intern team 2027" on Phone Link ────
function triggerPostAchievementPhoneLinkInvite() {
  // Play phone notification chime
  if (typeof AudioManager !== 'undefined' && AudioManager.playNotification) {
    AudioManager.playNotification();
  }

  // Create group chat "new intern team 2027"
  if (typeof setNewbieGcCreated === 'function') {
    setNewbieGcCreated(true);
  } else if (typeof setNewbieGcInvitePending === 'function') {
    setNewbieGcInvitePending(true);
  }

  if (typeof showToast === 'function') {
    showToast('\uD83D\uDCF1 Ding! Ryan created group "new intern team 2027" and added you!', 'info');
  }

  // Ryan's human, conversational dialogue celebrating post-test finish & guiding to Phone Link
  if (typeof RyanGuide !== 'undefined') {
    RyanGuide.speak(
      [
        {
          text: "You did it, Alex! 🎉 Outstanding job completing the Post-Test! You've really mastered spotting deceptive phishing indicators.",
          state: 'success',
          label: 'TAP TO CONTINUE'
        },
        {
          text: "I just created a group chat for our new batch called <strong>\"new intern team 2027\"</strong>, and I added you to it, Alex!",
          state: 'speaking',
          label: 'TAP TO CONTINUE'
        },
        {
          text: "Open up your <strong>Phone Link</strong> app now so you can meet the team and say hello. Pia and Ethan are already in there!",
          state: 'speaking',
          label: 'OPEN PHONE LINK'
        }
      ],
      {
        onDone: function() {
          if (typeof openApp === 'function') {
            openApp('comms');
          }
        }
      }
    );
  }
}

// ─── Post-Phone Link Dialogue: Ryan guides Alex before leaving PC workstation ────
window.triggerPostPhoneLinkSaveDialogue = function() {
  if (window._hasTriggeredPostPhoneLinkSave) return;
  window._hasTriggeredPostPhoneLinkSave = true;

  // Minimize or close Phone Link window so Alex's desktop and taskbar are clearly visible
  if (typeof minimizeApp === 'function') {
    minimizeApp('comms');
  } else if (typeof closeApp === 'function') {
    closeApp('comms');
  }

  // Play notification chime
  if (typeof AudioManager !== 'undefined' && AudioManager.playNotification) {
    AudioManager.playNotification();
  }

  // Ryan's dialogue guiding Alex before leaving the workstation
  if (typeof RyanGuide !== 'undefined') {
    RyanGuide.speak(
      [
        {
          text: "Terrific job introducing yourself to the team, Alex! 🎉 Ethan and Pia have confirmed your workstation access and credentials.",
          state: 'success',
          label: 'TAP TO CONTINUE'
        },
        {
          text: "Before you step away from your PC, remember good cybersecurity hygiene: never walk away from an active workstation unattended.",
          state: 'speaking',
          label: 'TAP TO CONTINUE'
        },
        {
          text: "To save your completed task and secure this terminal, click the <strong>Windows Start menu (⊞)</strong> on the taskbar below.",
          state: 'speaking',
          label: 'TAP TO CONTINUE'
        },
        {
          text: "From the Start Menu, open <strong>Power &amp; Terminal Controls (⏻)</strong> and select <strong>'Shutdown (Save)'</strong> to log off and proceed to Chapter 2!",
          state: 'speaking',
          label: 'LOG OFF & SAVE'
        }
      ],
      {
        onDone: function() {
          if (typeof window.startWorkstationLogoffGuide === 'function') {
            window.startWorkstationLogoffGuide();
          }
        }
      }
    );
  } else {
    if (typeof window.startWorkstationLogoffGuide === 'function') {
      window.startWorkstationLogoffGuide();
    }
  }
};

window.startWorkstationLogoffGuide = function() {
  window._awaitingShutdownForChapter2 = true;
  if (typeof window.updateShutdownGuideStep === 'function') {
    window.updateShutdownGuideStep(1);
  }
  if (typeof showToast === 'function') {
    showToast('👉 Click the Windows Start menu (⊞) on the taskbar to begin saving', 'info');
  }
};

window.updateShutdownGuideStep = function(step) {
  if (!window._awaitingShutdownForChapter2 && step !== 0) return;

  // Render/update HUD notice on desktop
  let notice = document.getElementById('desktop-shutdown-notice');
  if (!notice && step !== 0) {
    notice = document.createElement('div');
    notice.id = 'desktop-shutdown-notice';
    notice.className = 'desktop-shutdown-notice';
    notice.innerHTML = `
      <div class="dsn-header">
        <div class="dsn-title">
          <span class="dsn-pulse-dot"></span>
          <span>WORKSTATION LOG-OFF PROTOCOL</span>
        </div>
        <span class="dsn-badge">CHAPTER 1 SAVE</span>
      </div>
      <div class="dsn-desc">Save your task completion before leaving Alex's PC to unlock Chapter 2:</div>
      <div class="dsn-steps">
        <div class="dsn-step active" id="dsn-step-1">
          <span class="dsn-step-num">1</span>
          <span class="dsn-step-text">Click the <strong>Windows Start menu (⊞)</strong> on the taskbar</span>
          <span class="dsn-step-status" id="dsn-status-1">Action Required</span>
        </div>
        <div class="dsn-step" id="dsn-step-2">
          <span class="dsn-step-num">2</span>
          <span class="dsn-step-text">Click <strong>Power &amp; Terminal Controls (⏻)</strong></span>
          <span class="dsn-step-status" id="dsn-status-2">Waiting</span>
        </div>
        <div class="dsn-step" id="dsn-step-3">
          <span class="dsn-step-num">3</span>
          <span class="dsn-step-text">Click <strong>Shutdown (Save)</strong> to open Chapter 2</span>
          <span class="dsn-step-status" id="dsn-status-3">Waiting</span>
        </div>
      </div>
    `;
    const desktop = document.getElementById('desktop');
    if (desktop) desktop.appendChild(notice);
  }

  if (notice) {
    if (step === 0) {
      notice.classList.add('hidden');
    } else {
      notice.classList.remove('hidden');
    }
  }

  const s1 = document.getElementById('dsn-step-1');
  const s2 = document.getElementById('dsn-step-2');
  const s3 = document.getElementById('dsn-step-3');
  const stat1 = document.getElementById('dsn-status-1');
  const stat2 = document.getElementById('dsn-status-2');
  const stat3 = document.getElementById('dsn-status-3');

  const startBtn = document.getElementById('start-btn');
  const powerBtn = document.getElementById('start-power-btn');
  const shutdownBtn = document.querySelector("#start-power-dropdown button[onclick*='shutdown']");

  // Step 1: Click Windows Start Menu
  if (step === 1) {
    if (s1) { s1.className = 'dsn-step active'; if (stat1) stat1.textContent = 'Action Required'; }
    if (s2) { s2.className = 'dsn-step'; if (stat2) stat2.textContent = 'Waiting'; }
    if (s3) { s3.className = 'dsn-step'; if (stat3) stat3.textContent = 'Waiting'; }

    if (startBtn) startBtn.classList.add('start-attention', 'btn-pulse-highlight');
    if (powerBtn) powerBtn.classList.remove('power-attention');
    if (shutdownBtn) shutdownBtn.classList.remove('power-item-attention');
  }
  // Step 2: Click Power & Terminal Controls
  else if (step === 2) {
    if (s1) { s1.className = 'dsn-step completed'; if (stat1) stat1.textContent = '✓ Done'; }
    if (s2) { s2.className = 'dsn-step active'; if (stat2) stat2.textContent = 'Action Required'; }
    if (s3) { s3.className = 'dsn-step'; if (stat3) stat3.textContent = 'Waiting'; }

    if (startBtn) startBtn.classList.remove('start-attention', 'btn-pulse-highlight');
    if (powerBtn) powerBtn.classList.add('power-attention');
    if (shutdownBtn) shutdownBtn.classList.remove('power-item-attention');
  }
  // Step 3: Click Shutdown (Save)
  else if (step === 3) {
    if (s1) { s1.className = 'dsn-step completed'; if (stat1) stat1.textContent = '✓ Done'; }
    if (s2) { s2.className = 'dsn-step completed'; if (stat2) stat2.textContent = '✓ Done'; }
    if (s3) { s3.className = 'dsn-step active'; if (stat3) stat3.textContent = 'Action Required'; }

    if (startBtn) startBtn.classList.remove('start-attention', 'btn-pulse-highlight');
    if (powerBtn) powerBtn.classList.remove('power-attention');
    if (shutdownBtn) shutdownBtn.classList.add('power-item-attention');
  }
  // Step 0: Clear all
  else if (step === 0) {
    if (startBtn) startBtn.classList.remove('start-attention', 'btn-pulse-highlight');
    if (powerBtn) powerBtn.classList.remove('power-attention');
    if (shutdownBtn) shutdownBtn.classList.remove('power-item-attention');
  }
};

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

  if (titleEl) {
    titleEl.textContent = 'Sticky Notes';
  }

  // Ensure note is visible, not collapsed
  note.classList.remove('hidden', 'collapsed');
  note.style.zIndex = '4600';

  const totalGoals = (Array.isArray(SN_ACHIEVEMENTS) && SN_ACHIEVEMENTS.length) ? SN_ACHIEVEMENTS.length : 4;
  const calculatedPct = (typeof pct === 'number')
    ? pct
    : ((gameState && typeof gameState.correctDecisions === 'number' && typeof EMAILS !== 'undefined' && EMAILS.length > 0)
        ? (gameState.correctDecisions / EMAILS.length)
        : 0.6);
  const accuracyPct = Math.round(calculatedPct * 100);
  const correctCount = (typeof correct === 'number') ? correct : (gameState && typeof gameState.correctDecisions === 'number' ? gameState.correctDecisions : 6);
  const totalEmails = (typeof total === 'number') ? total : ((typeof EMAILS !== 'undefined') ? EMAILS.length : 10);

  // ── After award is claimed: hide medal/stats, show mission checklist ────────
  if (window._awardClaimed) {
    scrollEl.innerHTML = `<div id="sn-post-award-checklist">${_buildPostAwardChecklistHTML()}</div>`;
    // Hook video play event once
    setTimeout(function() {
      var vid = document.getElementById('videoplayer-video');
      if (vid && !vid._postAwardHooked) {
        vid._postAwardHooked = true;
        vid.addEventListener('play', function() { window._notifyPostAwardVideoPlay(); });
      }
    }, 500);
    return;
  }

  // ── Pre-claim: show a simple "complete the checklist" reminder ──────────────
  let html = `
    <div class="sn-progress-card">
      <div class="sn-progress-header">
        <span class="sn-progress-title">&#128203; Mission Checklist</span>
        <span class="sn-progress-count">Claim your award to begin</span>
      </div>
    </div>
    <div style="padding:12px 4px;font-size:12px;color:#78716c;text-align:center;line-height:1.6;">
      &#127942; Complete all investigation tasks above,<br/>then claim your award to unlock the Mission Checklist.
    </div>
  `;
  scrollEl.innerHTML = html;
}

// ─── Render Pre-Test vs Post-Test Comparison Card in Sticky Notes ────────────
function renderPostTestComparisonHTML(preResult, postResult) {
  if (!postResult) return '';

  const preTotal = preResult ? (preResult.total || 20) : 20;
  const preScore = preResult ? (typeof preResult.score === 'number' ? preResult.score : 0) : 0;
  const prePct = preResult ? (typeof preResult.percent === 'number' ? preResult.percent : Math.round((preScore / preTotal) * 100)) : 0;
  const preRank = preResult ? (preResult.rank || 'Recruit') : 'Baseline';

  const postTotal = postResult.total || 20;
  const postScore = typeof postResult.score === 'number' ? postResult.score : 0;
  const postPct = typeof postResult.percent === 'number' ? postResult.percent : Math.round((postScore / postTotal) * 100);
  const postRank = postResult.rank || 'Cyber Sentinel';
  const postTier = postResult.tier || 'mastery';

  const diff = postPct - prePct;
  const isGain = diff > 0;
  const isSame = diff === 0;

  const deltaBadge = isGain
    ? `<span class="sn-comp-growth-pill gain">▲ +${diff}% Improvement</span>`
    : (isSame ? `<span class="sn-comp-growth-pill same">★ Baseline Matched</span>` : `<span class="sn-comp-growth-pill review">${diff}% · Keep Training</span>`);

  const tierIcons = { mastery: '🏆', expert: '🥈', competent: '🛡️', developing: '🌱' };
  const icon = tierIcons[postTier] || '🎯';

  return `
    <div class="sn-posttest-comp-card">
      <div class="sn-comp-header">
        <div class="sn-comp-header-title">
          <span class="sn-comp-header-icon">📈</span>
          <span>Pre-Test vs Post-Test</span>
        </div>
        ${deltaBadge}
      </div>

      <!-- 2 Columns: Pre-Test vs Post-Test -->
      <div class="sn-comp-grid">
        <div class="sn-comp-col sn-comp-pre">
          <div class="sn-comp-col-tag">PRE-TEST BASELINE</div>
          <div class="sn-comp-col-score">
            <span class="sn-comp-col-num">${preScore}</span>
            <span class="sn-comp-col-denom">/ ${preTotal}</span>
          </div>
          <div class="sn-comp-col-pct">${prePct}%</div>
          <div class="sn-comp-col-rank" title="${preRank}">🔰 ${preRank}</div>
        </div>

        <div class="sn-comp-arrow-wrap">
          <span class="sn-comp-arrow">➔</span>
          <span class="sn-comp-arrow-delta ${isGain ? 'gain' : ''}">${isGain ? `+${diff}%` : (isSame ? '0%' : `${diff}%`)}</span>
        </div>

        <div class="sn-comp-col sn-comp-post">
          <div class="sn-comp-col-tag">POST-TEST FINAL</div>
          <div class="sn-comp-col-score">
            <span class="sn-comp-col-num">${postScore}</span>
            <span class="sn-comp-col-denom">/ ${postTotal}</span>
          </div>
          <div class="sn-comp-col-pct">${postPct}%</div>
          <div class="sn-comp-col-rank" title="${postRank}">${icon} ${postRank}</div>
        </div>
      </div>

      <!-- Dual Comparison Bar -->
      <div class="sn-comp-bars-block">
        <div class="sn-comp-bar-row">
          <div class="sn-comp-bar-label">
            <span>Pre-Test Baseline</span>
            <span>${prePct}%</span>
          </div>
          <div class="sn-comp-track">
            <div class="sn-comp-fill-pre" style="width: ${Math.max(4, prePct)}%;"></div>
          </div>
        </div>
        <div class="sn-comp-bar-row">
          <div class="sn-comp-bar-label">
            <span>Post-Test Growth</span>
            <span class="sn-comp-bar-val-highlight">${postPct}%</span>
          </div>
          <div class="sn-comp-track">
            <div class="sn-comp-fill-post" style="width: ${Math.max(4, postPct)}%;"></div>
          </div>
        </div>
      </div>

      <!-- Ryan's remark note -->
      <div class="sn-comp-note">
        <div class="sn-comp-note-icon">${icon}</div>
        <div class="sn-comp-note-body">
          <div class="sn-comp-note-title">${postRank} (${postPct}%)</div>
          <div class="sn-comp-note-text">${isGain ? `Outstanding progress, Alex! You improved by +${diff}% from your baseline.` : `Post-test completed! You demonstrated sharp phishing detection awareness.`}</div>
        </div>
      </div>

      <!-- Action: Retake Post-Test -->
      <div class="sn-comp-actions">
        <button type="button" class="sn-comp-retake-btn" onclick="retakePostTestFromSticky(event)">
          <span>🔄 Retake Post-Test</span>
        </button>
      </div>
    </div>
  `;
}

// ─── Sticky Notes Interactive Post-Test Controllers ──────────────────────────
function toggleStickyPostTestItem(event) {
  if (event) event.stopPropagation();
  window._snPostTestExpanded = !window._snPostTestExpanded;
  if (gameState && gameState.emailResults && typeof EMAILS !== 'undefined' && gameState.emailResults.length >= EMAILS.length) {
    const total = EMAILS.length;
    const correct = gameState.correctDecisions;
    const pct = total > 0 ? (correct / total) : 0.6;
    let rank, rankClass, rankLabel;
    if (pct >= 1.0)       { rank = 'S'; rankClass = 'rank-s'; rankLabel = 'CYBER DETECTIVE'; }
    else if (pct >= 0.85) { rank = 'A'; rankClass = '';       rankLabel = 'EXCELLENT DETECTIVE'; }
    else if (pct >= 0.70) { rank = 'B'; rankClass = 'rank-b'; rankLabel = 'GOOD DETECTIVE'; }
    else if (pct >= 0.50) { rank = 'C'; rankClass = 'rank-c'; rankLabel = 'KEEP PRACTICING'; }
    else                  { rank = 'D'; rankClass = 'rank-d'; rankLabel = 'NEEDS MORE TRAINING'; }
    renderStickyNoteResults(rank, rankLabel, rankClass, pct, correct, total);
  }
}

function startPostTestFromSticky(event) {
  if (event) event.stopPropagation();

  // Gate: both checklist tasks must be done first
  if (window._awardClaimed && !_allChecklistTasksDone()) {
    const t = window._postAwardTasks || {};
    const pending = [];
    if (!t.phishingSearched && !t.phishingVisited) pending.push('🌐 Search "phishing" in the Browser');
    if (!t.videoPlayed)                            pending.push('📁 Watch phishing short video in File Explorer');
    if (typeof showToast === 'function') {
      showToast('⚠️ Complete the checklist first: ' + pending.join(' • '), 'warning');
    }
    return;
  }

  if (typeof RyanPosttest !== 'undefined') {
    RyanPosttest.confirmAndLaunch(
      function(res) {
        updateStickyNoteAfterPostTest(res);
        if (typeof triggerPostAchievementPhoneLinkInvite === 'function') {
          setTimeout(() => triggerPostAchievementPhoneLinkInvite(), 600);
        }
      },
      function() {
        if (typeof triggerPostTestReviewLaterGuide === 'function') {
          triggerPostTestReviewLaterGuide();
        }
      }
    );
  }
}

function retakePostTestFromSticky(event) {
  if (event) event.stopPropagation();
  if (typeof RyanPosttest !== 'undefined') {
    RyanPosttest.launch(function(res) {
      updateStickyNoteAfterPostTest(res);
    });
  }
}

function updateStickyNoteAfterPostTest(res) {
  window._snPostTestExpanded = true;
  const total = (typeof EMAILS !== 'undefined') ? EMAILS.length : 10;
  const correct = (gameState && typeof gameState.correctDecisions === 'number') ? gameState.correctDecisions : 6;
  const pct = total > 0 ? (correct / total) : 0.6;
  let rank, rankClass, rankLabel;
  if (pct >= 1.0)       { rank = 'S'; rankClass = 'rank-s'; rankLabel = 'CYBER DETECTIVE'; }
  else if (pct >= 0.85) { rank = 'A'; rankClass = '';       rankLabel = 'EXCELLENT DETECTIVE'; }
  else if (pct >= 0.70) { rank = 'B'; rankClass = 'rank-b'; rankLabel = 'GOOD DETECTIVE'; }
  else if (pct >= 0.50) { rank = 'C'; rankClass = 'rank-c'; rankLabel = 'KEEP PRACTICING'; }
  else                  { rank = 'D'; rankClass = 'rank-d'; rankLabel = 'NEEDS MORE TRAINING'; }
  renderStickyNoteResults(rank, rankLabel, rankClass, pct, correct, total);
  showStickyNote();
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
