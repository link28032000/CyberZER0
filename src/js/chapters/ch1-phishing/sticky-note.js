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
  videoPlayed:      false,  // watched required video completely (Chapter 1)
  gcOpened:         false,  // opened the "new intern team 2027" GC in Phone Link
  postTestDone:     false   // completed post-test
};

// ── Chapter 1 Video Playback Progress & Completion Tracking ──
window._ch1VideoTracker = {
  duration: 0,
  currentTime: 0,
  actualSecondsWatched: 0,
  lastPlayheadTime: 0,
  hasSkippedForward: false,
  completed: false,
  _lastRefresh: 0
};

function _isChapter1Active() {
  const cat = window._currentChapterCategory ||
              (typeof activeCategoryStory !== 'undefined' ? activeCategoryStory : null) ||
              (typeof gameState !== 'undefined' ? gameState.phase : null) ||
              'phishing';
  return cat === 'phishing';
}

function _ch1FmtTime(sec) {
  if (isNaN(sec) || sec < 0) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

window._ch1OnVideoMetadataLoaded = function(vid) {
  if (!_isChapter1Active() || !vid) return;
  const dur = vid.duration || 0;
  if (dur > 0) {
    window._ch1VideoTracker.duration = dur;
    _refreshPostAwardChecklist();
  }
};

window._ch1OnVideoTimeUpdate = function(vid) {
  if (!_isChapter1Active() || !vid) return;
  const cur = vid.currentTime || 0;
  const dur = vid.duration || 0;
  const tracker = window._ch1VideoTracker;

  if (dur > 0) tracker.duration = dur;
  tracker.currentTime = cur;

  if (!tracker.completed && !window._postAwardTasks.videoPlayed) {
    const delta = cur - tracker.lastPlayheadTime;
    if (delta > 0) {
      if (delta > 1.35) {
        // Forward jump / skip detected
        tracker.hasSkippedForward = true;
      } else {
        tracker.actualSecondsWatched += delta;
      }
    }
    // If user rewinds back to the beginning (<= 1.5s), give them a fresh chance to watch properly
    if (cur <= 1.5 && tracker.hasSkippedForward) {
      tracker.hasSkippedForward = false;
      tracker.actualSecondsWatched = cur;
    }
  }
  tracker.lastPlayheadTime = cur;

  // Throttle checklist refresh so sticky note updates smoothly while playing
  const now = Date.now();
  if (!tracker._lastRefresh || now - tracker._lastRefresh > 700) {
    tracker._lastRefresh = now;
    _refreshPostAwardChecklist();
  }
};

window._ch1OnVideoSkip = function(secs) {
  if (!_isChapter1Active()) return;
  if (secs > 0) {
    window._ch1VideoTracker.hasSkippedForward = true;
    _refreshPostAwardChecklist();
  }
};

window._ch1OnVideoSeek = function(newTime, oldTime) {
  if (!_isChapter1Active()) return;
  if (newTime > oldTime + 1.25) {
    window._ch1VideoTracker.hasSkippedForward = true;
    _refreshPostAwardChecklist();
  }
};

window._ch1OnVideoEnded = function(vid) {
  if (!_isChapter1Active()) return;
  const tracker = window._ch1VideoTracker;
  const dur = (vid && vid.duration) ? vid.duration : (tracker.duration || 0);
  const cur = vid ? vid.currentTime : tracker.currentTime;

  // Fully watched requirements:
  // 1. Did not skip forward
  // 2. Actually watched accumulated seconds close to full duration
  // 3. Reached end of video (vid.ended || cur >= dur - 1.5)
  const isFinished = !tracker.hasSkippedForward &&
                     dur > 0 &&
                     tracker.actualSecondsWatched >= Math.max(1, dur - 2.5) &&
                     ((vid && vid.ended) || cur >= dur - 1.5);

  if (isFinished) {
    tracker.completed = true;
    tracker.currentTime = dur;
    window._postAwardTasks.videoPlayed = true;
    if (typeof showToast === 'function') {
      showToast('🎬 Awareness video watched completely! (+Checklist updated)', 'success');
    }
    _refreshPostAwardChecklist();
  } else {
    if (tracker.hasSkippedForward) {
      if (typeof showToast === 'function') {
        showToast('⚠️ Skipping detected: Please watch the video from beginning to end without skipping.', 'warning');
      }
    } else if (cur < dur - 2) {
      if (typeof showToast === 'function') {
        showToast('⚠️ Video ended before finishing. Please watch completely.', 'warning');
      }
    }
    _refreshPostAwardChecklist();
  }
};

// Checklist tasks are NOT clickable — user opens apps manually from the taskbar/desktop.
// This stub is kept for safety in case old HTML references it.
window.quickOpenChecklistTask = function() { /* no-op */ };

// Called by openApp wrapper
window._notifyPostAwardAppOpen = function(appName) {
  if (!window._awardClaimed) return;
  const t = window._postAwardTasks;
  // Do NOT auto-check browser here — only real navigation counts (see _notifyPostAwardBrowserNav)
  if (appName === 'folder') { t.explorerOpened = true; }
  // Chapter 1 videoplayer must be watched completely to complete task — do not auto-check on open
  _refreshPostAwardChecklist();
};

// Called by navigateBrowser wrapper
window._notifyPostAwardBrowserNav = function(url) {
  if (!window._awardClaimed) return;
  const t = window._postAwardTasks;
  const trimmed = (url || '').trim();
  if (!trimmed || trimmed === 'about:blank' || trimmed === '#') return;

  // Never check if the user is merely opening or visiting a phishing link
  if (typeof isPhishingUrl === 'function' && isPhishingUrl(trimmed)) {
    return;
  }
  if (typeof getPhishingSiteForUrl === 'function' && getPhishingSiteForUrl(trimmed)) {
    return;
  }

  // User must actually search: verify it is a search query in Google
  const isSearch = /^https?:\/\/(www\.)?google\.com\/search/i.test(trimmed);
  if (isSearch) {
    t.phishingSearched = true;
    _refreshPostAwardChecklist();
  }
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
  // For Chapter 1, playing alone does NOT complete the video; must watch completely.
  if (!_isChapter1Active()) {
    window._postAwardTasks.videoPlayed = true;
    _refreshPostAwardChecklist();
  }
};

// Called when player opens the "new intern team 2027" GC in Phone Link
window._notifyPostAwardGcOpen = function() {
  if (!window._awardClaimed) return;
  window._postAwardTasks.gcOpened = true;
  _refreshPostAwardChecklist();
};

// Check if all post-award checklist tasks are complete
function _allChecklistTasksDone() {
  const t = window._postAwardTasks;
  if (!t) return false;
  // User must actually search in browser — opening phishing links does NOT count
  const browserDone = !!t.phishingSearched;
  const videoDone   = !!t.videoPlayed;
  const gcDone      = !!t.gcOpened;
  return !!(browserDone && videoDone && gcDone);
}

window._postAwardPostTestDialogueFired = false;

window._checkAndTriggerPostTestDialogue = function() {
  if (!window._awardClaimed) return;
  if (window._postAwardPostTestDialogueFired) return;
  if (!_allChecklistTasksDone()) return;

  window._postAwardPostTestDialogueFired = true;

  // Short delay so the player sees the task tick off in the UI
  setTimeout(() => {
    if (typeof RyanGuide !== 'undefined' && RyanGuide.speak) {
      RyanGuide.speak(
        [
          {
            text: "Before you head out, Alex, I have a quick final quiz for you. Let's see what you picked up today!",
            state: 'speaking',
            label: 'TAP TO CONTINUE'
          },
          {
            text: "Take your time and trust your instincts. Whenever you're ready, let's begin!",
            state: 'success',
            label: "LET'S BEGIN"
          }
        ],
        {
          onDone: function() {
            if (typeof RyanPosttest !== 'undefined') {
              RyanPosttest.launch(function(res) {
                updateStickyNoteAfterPostTest(res);
              });
            }
          }
        }
      );
    }
  }, 1000);
};

function _refreshPostAwardChecklist() {
  const section = document.getElementById('sn-post-award-checklist');
  if (section) {
    section.innerHTML = _buildPostAwardChecklistHTML();
  }
  const scrollEl = document.querySelector('#sticky-note .sticky-note-scroll');
  if (scrollEl) {
    scrollEl.style.overflowY = 'hidden';
  }
  if (_allChecklistTasksDone()) {
    _checkAndTriggerPostTestDialogue();
  }
}

function _buildPostAwardChecklistHTML() {
  const t = window._postAwardTasks;
  const postDone = typeof RyanPosttest !== 'undefined' && RyanPosttest.getResult && RyanPosttest.getResult();
  t.postTestDone = !!postDone;

  const browserDone = !!t.phishingSearched;
  const videoDone   = !!t.videoPlayed;
  const gcDone      = !!t.gcOpened;

  const tracker = window._ch1VideoTracker || {};
  if (!tracker.duration) {
    const vEl = document.getElementById('videoplayer-video');
    if (vEl && vEl.duration && !isNaN(vEl.duration)) {
      tracker.duration = vEl.duration;
    }
  }

  const curSec = tracker.currentTime || 0;
  const durSec = tracker.duration || 0;
  const curFmt = _ch1FmtTime(curSec);
  const durFmt = durSec > 0 ? _ch1FmtTime(durSec) : '--:--';

  let videoDesc = 'Open File Explorer → Videos folder → watch the awareness video.';
  let videoBadge = videoDone ? '✓ Done' : 'Pending';

  if (videoDone) {
    videoBadge = '✓ Done';
    videoDesc += `<div class="sn-video-progress-line" style="margin-top:3px;font-size:11px;font-family:var(--font-mono,'Consolas',monospace);color:#4ade80;font-weight:600;">⏱ ${durFmt} / ${durFmt} (Completed)</div>`;
  } else if (durSec > 0) {
    if (tracker.hasSkippedForward) {
      videoBadge = `${curFmt} / ${durFmt}`;
      videoDesc += `<div class="sn-video-progress-line" style="margin-top:3px;font-size:11px;font-family:var(--font-mono,'Consolas',monospace);color:#f59e0b;font-weight:500;">⏱ ${curFmt} / ${durFmt} (Skipping detected, please replay from the start)</div>`;
    } else if (curSec > 0) {
      const pctWatch = Math.min(99, Math.round((curSec / durSec) * 100));
      videoBadge = `${curFmt} / ${durFmt}`;
      videoDesc += `<div class="sn-video-progress-line" style="margin-top:3px;font-size:11px;font-family:var(--font-mono,'Consolas',monospace);color:#38bdf8;font-weight:500;">⏱ ${curFmt} / ${durFmt} (${pctWatch}%)</div>`;
    } else {
      videoBadge = `0:00 / ${durFmt}`;
      videoDesc += `<div class="sn-video-progress-line" style="margin-top:3px;font-size:11px;font-family:var(--font-mono,'Consolas',monospace);color:#8b9bb4;">⏱ 0:00 / ${durFmt} (Watch completely from start to end)</div>`;
    }
  } else {
    videoDesc += `<div class="sn-video-progress-line" style="margin-top:3px;font-size:11px;font-family:var(--font-mono,'Consolas',monospace);color:#8b9bb4;">⏱ 0:00 / 0:00 (Watch completely from start to end)</div>`;
  }

  const tasks = [
    {
      id: 'browser',
      icon: '🌐',
      label: 'Open Browser &amp; Try to Search',
      desc: 'Open the Browser and search to explore cybersecurity tips.',
      done: browserDone
    },
    {
      id: 'explorer',
      icon: '📁',
      label: 'Open File Explorer &amp; Watch Video',
      desc: videoDesc,
      badgeText: videoBadge,
      done: videoDone
    },
    {
      id: 'phonelink',
      icon: '💬',
      label: 'Open Phone Link &amp; Open Your GC',
      desc: 'Open Phone Link → open team GC → send "Hello po." to Ryan.',
      done: gcDone
    }
  ];

  const doneCount = tasks.filter(task => task.done).length;
  const pct = Math.round((doneCount / tasks.length) * 100);

  let html = `
    <div style="display:flex;flex-direction:column;gap:6px;overflow:hidden;">
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
    const badgeText = task.badgeText || (task.done ? '&#10003; Done' : 'Pending');
    html += `
        <li class="sn-ach-item${task.done ? ' sn-ach-done' : ''}">
          <div class="sn-checkbox${task.done ? ' checked' : ''}" aria-hidden="true">${task.done ? '&#10003;' : ''}</div>
          <div class="sn-ach-body">
            <div class="sn-ach-header-row">
              <span class="sn-ach-label">${task.icon} ${task.label}</span>
              <span class="sn-ach-prog-badge${task.done ? ' done' : ''}">${badgeText}</span>
            </div>
            <div class="sn-ach-desc">${task.desc}</div>
          </div>
        </li>`;
  });

  html += `
      </ul>
    </div>`;

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
  // Also explicitly clear pulse classes added directly to the desktop icon
  if (icon) icon.classList.remove('icon-attention', 'btn-pulse-highlight');

  // Ch2: mark sticky note as opened for the mission checklist tracker
  if (window._currentChapterCategory === 'malware' || (typeof gameState !== 'undefined' && gameState.phase === 'malware')) {
    if (!window._ch2Mission) window._ch2Mission = { stickyOpened: false, gamesOpened: false };
    window._ch2Mission.stickyOpened = true;
  }

  const titleEl = document.getElementById('sticky-note-title');
  if (titleEl) titleEl.textContent = 'Sticky Notes';

  const scrollEl = document.querySelector('#sticky-note .sticky-note-scroll');
  if (!scrollEl) return;

  // ── If all emails are completed and award claimed, display the post-award checklist ──
  if (gameState.emailResults && gameState.emailResults.length >= EMAILS.length && window._awardClaimed) {
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

  // ── Chapter 2 (malware) — show mission checklist instead of Ch1 tasks ──
  if (window._currentChapterCategory === 'malware' ||
      (typeof gameState !== 'undefined' && gameState.phase === 'malware')) {
    updateStickyNoteForPhase('malware');
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

// ─── 3 Achievement Tiers: Gold / Silver / Bronze Medal ─────────────────────
const PHISHING_ACHIEVEMENT_TIERS = {
  gold: {
    id: 'phish_gold_medal',
    tier: 'gold',
    rank: 'Gold Medal',
    icon: '🥇',
    title: 'Phishing Gold Medal',
    badge: '🥇 GOLD MEDAL · TOP DETECTIVE',
    label: 'PHISHING MASTER',
    sub: '4/4 Tasks Completed · Flawless Investigation',
    desc: 'Exceptional mastery! You successfully completed all 4 investigation tasks with complete precision by detecting threats, verifying clean emails, documenting fake domains, and uncovering critical indicators.',
    requiredTasks: 4
  },
  silver: {
    id: 'phish_silver_medal',
    tier: 'silver',
    rank: 'Silver Medal',
    icon: '🥈',
    title: 'Phishing Silver Medal',
    badge: '🥈 SILVER MEDAL · DISTINGUISHED DETECTIVE',
    label: 'PHISHING INVESTIGATOR',
    sub: '2 to 3 Tasks Completed · Distinguished Detective',
    desc: 'Impressive detective performance! You completed key investigation tasks with sharp cybersecurity instincts, isolating deceptive emails and collecting vital threat evidence.',
    requiredTasks: 2
  },
  bronze: {
    id: 'phish_bronze_medal',
    tier: 'bronze',
    rank: 'Bronze Medal',
    icon: '🥉',
    title: 'Phishing Bronze Medal',
    badge: '🥉 BRONZE MEDAL · CYBER AWARENESS',
    label: 'PHISHING SENTINEL',
    sub: 'Investigation Completed · Awareness Merit',
    desc: 'Email investigation completed! You analyzed real world scam indicators, practiced threat verification, and built essential cyber defense skills.',
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
  // Gold Medal: 4 tasks OR >= 90% accuracy
  if (count >= 4 || accuracy >= 0.90) return PHISHING_ACHIEVEMENT_TIERS.gold;
  // Silver Medal: 2-3 tasks OR >= 70% accuracy
  if (count >= 2 || accuracy >= 0.70) return PHISHING_ACHIEVEMENT_TIERS.silver;
  // Bronze Medal: minimum — everyone who completes the mission earns at least a bronze
  return PHISHING_ACHIEVEMENT_TIERS.bronze;
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
      } else {
        window._awardClaimed = false;
        try { localStorage.removeItem('cyberzero_newbie_gc_state'); } catch(e) {}
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
  return _achievementUnlocked.has('phish_gold_medal') ||
    _achievementUnlocked.has('phish_trophy_master') ||   // legacy key compat
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

  // Hide Sticky Note so player focuses on Claim Reward modal
  const sNote = document.getElementById('sticky-note');
  if (sNote) {
    sNote.classList.add('hidden');
    sNote.classList.remove('highlight-attention');
  }

  const count = typeof customCount === 'number' ? customCount : getCompletedTasksCount();
  const award = customAward || getPhishingEarnedAward();
  const tier = award.tier || 'bronze';

  const modal = document.createElement('div');
  modal.id = 'phish-trophy-modal';
  modal.className = 'phish-trophy-modal';
  modal.innerHTML = `
    <div class="ptm-backdrop"></div>
    <div class="ptm-confetti-fullscreen" id="ptm-confetti"></div>
    <div class="ptm-card ptm-tier-${tier} ptm-card-clean">
      <div class="ptm-glow-ring"></div>
      <div class="ptm-big-medal-container">
        <div class="ptm-big-medal-icon">${award.icon}</div>
      </div>
      <h2 class="ptm-big-title">${award.title}</h2>
      <div class="ptm-big-rank">${award.rank || ''}</div>
      <div class="ptm-footer" style="margin-top: 26px;">
        <button class="ptm-close-btn" onclick="closePhishingTrophy()">Claim Reward</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const confettiEl = modal.querySelector('#ptm-confetti');

  // Confetti for Gold Medal (top achievement)
  if (tier === 'gold') {
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
  window._postAwardPostTestDialogueFired = false;

  // Close any lingering phishing tabs so the browser is fresh and clean for the new checklist
  try {
    if (typeof browserTabs !== 'undefined' && Array.isArray(browserTabs)) {
      const hasPhish = browserTabs.some(t => typeof isPhishingUrl === 'function' && isPhishingUrl(t.url));
      if (hasPhish) {
        browserTabs = browserTabs.filter(t => typeof isPhishingUrl === 'function' && !isPhishingUrl(t.url));
        if (browserTabs.length === 0) {
          if (typeof initBrowserTabs === 'function') initBrowserTabs();
        } else {
          if (!browserTabs.some(t => t.id === browserActiveTabId)) {
            browserActiveTabId = browserTabs[0].id;
          }
          if (typeof renderTabStrip === 'function') renderTabStrip();
          if (typeof renderActiveTab === 'function') renderActiveTab();
        }
      }
    }
  } catch(e) {}

  // Reset all post-award task tracking so only actions AFTER claim count
  window._postAwardTasks = {
    browserOpened:    false,
    browserNavigated: false,
    phishingSearched: false,
    phishingVisited:  false,
    explorerOpened:   false,
    videoFolderOpen:  false,
    videoPlayed:      false,
    gcOpened:         false,
    postTestDone:     false
  };
  window._ch1VideoTracker = {
    duration: 0,
    currentTime: 0,
    actualSecondsWatched: 0,
    lastPlayheadTime: 0,
    hasSkippedForward: false,
    completed: false,
    _lastRefresh: 0
  };

  // Reset newbie GC state with clean empty messages
  try {
    const freshGc = {
      created: true,
      joined: true,
      accepted: true,
      hasUnread: false,
      seenByRyan: false,
      ryanHasWelcomed: false,
      playerMessages: []
    };
    localStorage.setItem('cyberzero_newbie_gc_state', JSON.stringify(freshGc));
  } catch(e) {}

  savePhishingProgress();

  // ── Auto-claim the main menu Chapter 1 achievement (ach_phishing) ──
  // Map in-game tier → main menu medal tier and write to localStorage
  try {
    const earned = _phishingEarnedAward || getPhishingEarnedAward();
    // New tier system: gold/silver/bronze map 1-to-1
    // Legacy compat: trophy→gold, medal→silver, ribbon→bronze
    let mainMenuTier = 'bronze';
    const t = earned && earned.tier;
    if (t === 'gold' || t === 'trophy') mainMenuTier = 'gold';
    else if (t === 'silver' || t === 'medal') mainMenuTier = 'silver';
    else mainMenuTier = 'bronze';

    // Use the tier object's title as the canonical medal name so the
    // main menu achievement display matches the in-game award popup exactly.
    const tierObj = PHISHING_ACHIEVEMENT_TIERS[mainMenuTier] || PHISHING_ACHIEVEMENT_TIERS.bronze;
    const medalTitle = earned && earned.title ? earned.title : tierObj.title;

    const ACH_KEY = 'cyberzero_claimed_achievements';
    let claimedMap = {};
    try { claimedMap = JSON.parse(localStorage.getItem(ACH_KEY) || '{}'); } catch(e) {}
    if (!claimedMap['ach_phishing']) {
      claimedMap['ach_phishing'] = {
        tier: mainMenuTier,
        medalTitle: medalTitle,
        claimedAt: Date.now(),
        claimedDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
      };
      localStorage.setItem(ACH_KEY, JSON.stringify(claimedMap));
    }
  } catch(e) {}

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
  const awardTitle = award ? award.title : 'Phishing Bronze Medal';
  const awardIcon = award ? award.icon : '🥉';
  const tier = award ? award.tier : 'bronze';

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
  if (tier === 'gold' || (award && award.rank && award.rank.includes('Gold'))) {
    congratsIntro = `Congratulations on claiming your 🥇 <strong>${awardTitle}</strong>! Flawless investigation work, Alex!`;
  } else if (tier === 'silver' || (award && award.rank && award.rank.includes('Silver'))) {
    congratsIntro = `Congratulations on claiming your 🥈 <strong>${awardTitle}</strong>! Outstanding effort uncovering email threats, Alex!`;
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
        text: "Before the final quiz, check the <strong>Mission Checklist</strong> in your Sticky Notes \uD83D\uDCCB. Complete all 3 tasks first!",
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
        text: "📱 <strong>Task 3:</strong> Follow your Sticky Notes checklist to open <strong>Phone Link</strong>, open your group chat, and send \"Hello po.\" to Ryan.",
        state: 'thinking',
        label: 'TAP TO CONTINUE'
      },
      {
        text: "Follow the checklist in your Sticky Notes! Once all 3 tasks are complete, I will guide you straight into your final quiz! 📝",
        state: 'success',
        label: 'GOT IT!'
      }
    ],
    {
      onDone: function() {
        if (typeof showToast === 'function') {
          showToast('📋 Check Sticky Notes: complete all 3 tasks to unlock the final quiz!', 'info');
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
    showToast('\uD83D\uDCCB Complete the Mission Checklist in Sticky Notes first, then take the final quiz!', 'info');
  }

  if (typeof RyanGuide !== 'undefined') {
    RyanGuide.speak([
      {
        text: "Take your time! Reviewing before the quiz is a great idea.",
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
        text: "Whenever you feel ready, open your Sticky Notes and click Begin to start!",
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
          text: "You did it, Alex! 🎉 Outstanding job completing the quiz! You really got the hang of spotting deceptive phishing indicators.",
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

// ─── Post-Test Dialogue: Ryan guides Alex to Start Menu -> Power -> Shutdown (Save) ────
window.triggerPostTestSaveDialogue = window.triggerPostPhoneLinkSaveDialogue = function() {
  if (window._hasTriggeredPostTestSave) return;
  window._hasTriggeredPostTestSave = true;

  // Close sticky note and minimize apps so Alex's desktop and taskbar are clearly visible
  if (typeof closeStickyNote === 'function') closeStickyNote();
  if (typeof minimizeApp === 'function') {
    minimizeApp('comms');
    minimizeApp('browser');
    minimizeApp('folder');
  }

  // Play notification chime
  if (typeof AudioManager !== 'undefined' && AudioManager.playNotification) {
    AudioManager.playNotification();
  }

  // Pre-highlight the Windows Start menu button on the taskbar immediately
  window._awaitingShutdownForChapter2 = true;
  const startBtn = document.getElementById('start-btn');
  if (startBtn) {
    startBtn.classList.add('start-attention', 'btn-pulse-highlight');
  }

  // Ryan's dialogue guiding Alex before leaving the workstation
  if (typeof RyanGuide !== 'undefined') {
    RyanGuide.speak(
      [
        {
          text: "Outstanding work completing your evaluation, Alex! 🎉 You've learned so much today from your phishing investigation.",
          state: 'success',
          label: 'TAP TO CONTINUE'
        },
        {
          text: "Before you step away from your PC, remember good cybersecurity hygiene: never walk away from an active workstation unattended.",
          state: 'speaking',
          label: 'TAP TO CONTINUE'
        },
        {
          text: "To save your completed progress and secure this terminal, click the <strong>Windows Start menu (⊞)</strong> highlighted on the taskbar below.",
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

window.clearWorkstationLogoffGuide = function() {
  window._awaitingShutdownForChapter2 = false;
  const startBtn  = document.getElementById('start-btn');
  const powerBtn  = document.getElementById('start-power-btn');
  const shutdownBtn = document.querySelector("#start-power-dropdown button[onclick*='shutdown']");
  if (startBtn) startBtn.classList.remove('start-attention', 'btn-pulse-highlight', 'active');
  if (powerBtn) powerBtn.classList.remove('power-attention');
  if (shutdownBtn) shutdownBtn.classList.remove('power-item-attention');
  const notice = document.getElementById('desktop-shutdown-notice');
  if (notice) notice.remove();
};

window.startWorkstationLogoffGuide = function() {
  const curCat = window._currentChapterCategory || (typeof activeCategoryStory !== 'undefined' ? activeCategoryStory : null) || (typeof gameState !== 'undefined' ? gameState.phase : null);
  // Log-off guide is strictly ONLY for Chapter 1 (phishing)
  if (curCat && curCat !== 'phishing') {
    if (typeof window.clearWorkstationLogoffGuide === 'function') window.clearWorkstationLogoffGuide();
    return;
  }
  window._awaitingShutdownForChapter2 = true;
  // Just highlight the Start button — no panel, dialogue already guides the user
  const startBtn = document.getElementById('start-btn');
  if (startBtn) startBtn.classList.add('start-attention', 'btn-pulse-highlight');
};

window.updateShutdownGuideStep = function(step) {
  const curCat = window._currentChapterCategory || (typeof activeCategoryStory !== 'undefined' ? activeCategoryStory : null) || (typeof gameState !== 'undefined' ? gameState.phase : null);
  // Blinking notice is strictly ONLY for Chapter 1
  if (curCat && curCat !== 'phishing') {
    if (typeof window.clearWorkstationLogoffGuide === 'function') window.clearWorkstationLogoffGuide();
    return;
  }

  if (!window._awaitingShutdownForChapter2 && step !== 0) return;

  // Remove any existing panel (legacy cleanup)
  const notice = document.getElementById('desktop-shutdown-notice');
  if (notice) notice.remove();

  const startBtn  = document.getElementById('start-btn');
  const powerBtn  = document.getElementById('start-power-btn');
  const shutdownBtn = document.querySelector("#start-power-dropdown button[onclick*='shutdown']");

  if (step === 1) {
    if (startBtn) startBtn.classList.add('start-attention', 'btn-pulse-highlight');
    if (powerBtn) powerBtn.classList.remove('power-attention');
    if (shutdownBtn) shutdownBtn.classList.remove('power-item-attention');
  } else if (step === 2) {
    if (startBtn) startBtn.classList.remove('start-attention', 'btn-pulse-highlight');
    if (powerBtn) powerBtn.classList.add('power-attention');
    if (shutdownBtn) shutdownBtn.classList.remove('power-item-attention');
  } else if (step === 3) {
    if (startBtn) startBtn.classList.remove('start-attention', 'btn-pulse-highlight');
    if (powerBtn) powerBtn.classList.remove('power-attention');
    if (shutdownBtn) shutdownBtn.classList.add('power-item-attention');
  } else if (step === 0) {
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
    if (typeof showToast === 'function') showToast('Please complete the initial quiz with Ryan first.', 'warning');
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
    // Hook video tracking events once
    setTimeout(function() {
      var vid = document.getElementById('videoplayer-video');
      if (vid && !vid._postAwardHooked) {
        vid._postAwardHooked = true;
        vid.addEventListener('timeupdate', function() {
          if (typeof window._ch1OnVideoTimeUpdate === 'function') {
            window._ch1OnVideoTimeUpdate(vid);
          }
        });
        vid.addEventListener('ended', function() {
          if (typeof window._ch1OnVideoEnded === 'function') {
            window._ch1OnVideoEnded(vid);
          }
        });
        vid.addEventListener('loadedmetadata', function() {
          if (typeof window._ch1OnVideoMetadataLoaded === 'function') {
            window._ch1OnVideoMetadataLoaded(vid);
          }
        });
      }
    }, 500);
    return;
  }

  // ── Pre-claim: keep showing live 4-task checklist until award is claimed ──────────────
  if (!document.getElementById('sn-checklist-section')) {
    scrollEl.innerHTML = '<div id="sn-checklist-section"></div>';
  }
  updateStickyChecklist();
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

  // Gate: all 3 checklist tasks must be done first
  if (window._awardClaimed && !_allChecklistTasksDone()) {
    const t = window._postAwardTasks || {};
    const browserDone = !!t.phishingSearched;
    const pending = [];
    if (!browserDone)    pending.push('🌐 Open Browser & Try to Search');
    if (!t.videoPlayed)  pending.push('📁 Watch awareness video in File Explorer');
    if (!t.gcOpened)     pending.push('💬 Open Phone Link & open your GC');
    if (typeof showToast === 'function') {
      showToast('⚠️ Complete the checklist first: ' + pending.join(' • '), 'warning');
    }
    return;
  }

  // Show Ryan dialogue: "Are you ready to begin?"
  if (typeof RyanGuide !== 'undefined' && RyanGuide.ask) {
    RyanGuide.ask(
      "Are you ready to begin?",
      [
        { text: "Yes, I'm ready!", className: "rpost-dialogue-begin-btn", value: true },
        { text: "Review first", value: false }
      ],
      function(ready) {
        if (ready && typeof RyanPosttest !== 'undefined') {
          RyanPosttest.launch(function(res) {
            updateStickyNoteAfterPostTest(res);
          });
        }
      }
    );
  } else if (typeof RyanGuide !== 'undefined' && RyanGuide.speak) {
    RyanGuide.speak(
      [
        { text: "Are you ready to begin?", state: 'speaking' }
      ],
      {
        onDone: function() {
          if (typeof RyanPosttest !== 'undefined') {
            RyanPosttest.launch(function(res) {
              updateStickyNoteAfterPostTest(res);
            });
          }
        }
      }
    );
  } else if (typeof RyanPosttest !== 'undefined') {
    RyanPosttest.launch(function(res) {
      updateStickyNoteAfterPostTest(res);
    });
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

  // Trigger guidance dialogue to highlights border of Windows Start menu -> Power -> Shutdown (Save)
  setTimeout(() => {
    if (typeof window.triggerPostTestSaveDialogue === 'function') {
      window.triggerPostTestSaveDialogue();
    }
  }, 400);
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

  // Chapter 2 (malware) notes — Mission checklist (Ch1-style UI)
  if (phase === 'malware' || currentCat === 'malware') {
    const _m = window._ch2Mission || { stickyOpened: false, gamesOpened: false, antivirusOff: false };
    if (titleEl) titleEl.textContent = 'Sticky Notes';

    const doneGames = !!_m.gamesOpened;
    const doneAv    = !!_m.antivirusOff;
    const completedCount = (doneGames ? 1 : 0) + (doneAv ? 1 : 0);
    const totalGoals = 2;
    const progressPercent = Math.round((completedCount / totalGoals) * 100);

    // No button — player must open Antivirus app on desktop and turn it off there

    scrollEl.innerHTML =
      '<div class="sn-progress-card">' +
        '<div class="sn-progress-header">' +
          '<span class="sn-progress-title">📋 Checklist</span>' +
          '<span class="sn-progress-count">' + completedCount + ' of ' + totalGoals + ' Done</span>' +
        '</div>' +
        '<div class="sn-progress-bar-track">' +
          '<div class="sn-progress-bar-fill" style="width:' + progressPercent + '%;"></div>' +
        '</div>' +
      '</div>' +
      '<ul class="sn-checklist">' +
        // Task 1 — Open Games Folder
        '<li class="sn-ach-item' + (doneGames ? ' sn-ach-done' : '') + '">' +
          '<div class="sn-checkbox' + (doneGames ? ' checked' : '') + '" aria-hidden="true">' + (doneGames ? '✓' : '') + '</div>' +
          '<div class="sn-ach-body">' +
            '<div class="sn-ach-header-row">' +
              '<span class="sn-ach-label">📁 Open Games Folder</span>' +
              '<span class="sn-ach-prog-badge' + (doneGames ? ' done' : '') + '">' + (doneGames ? '1 / 1 ✓' : '0 / 1') + '</span>' +
            '</div>' +
            '<div class="sn-ach-desc">Open the Games folder on your desktop to explore the malware simulations.</div>' +
          '</div>' +
        '</li>' +
        // Task 2 — Turn Off Antivirus
        '<li class="sn-ach-item' + (doneAv ? ' sn-ach-done' : '') + '">' +
          '<div class="sn-checkbox' + (doneAv ? ' checked' : '') + '" aria-hidden="true">' + (doneAv ? '✓' : '') + '</div>' +
          '<div class="sn-ach-body">' +
            '<div class="sn-ach-header-row">' +
              '<span class="sn-ach-label">🛡️ Turn Off Antivirus</span>' +
              '<span class="sn-ach-prog-badge' + (doneAv ? ' done' : '') + '">' + (doneAv ? '1 / 1 ✓' : '0 / 1') + '</span>' +
            '</div>' +
            '<div class="sn-ach-desc">Open the <strong>Anti-Virus</strong> app on your desktop and turn off the Protection toggle.</div>' +
          '</div>' +
        '</li>' +
      '</ul>';
    return;
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
