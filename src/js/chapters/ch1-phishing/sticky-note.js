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
  const palette = tier === 'trophy'
    ? ['#ffd700', '#facc15', '#f59e0b', '#ffffff', '#fbbf24', '#f43f5e', '#10b981']
    : tier === 'medal'
    ? ['#e2e8f0', '#38bdf8', '#0ea5e9', '#ffffff', '#94a3b8', '#a855f7', '#fbbf24']
    : ['#f59e0b', '#fbbf24', '#cd7f32', '#10b981', '#ffffff', '#f43f5e', '#38bdf8'];

  // Generate 75 festive confetti particles across full screen
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

  // Trigger post-achievement dialogue: concise reward result + Phishing Post-Test prompt
  setTimeout(() => {
    triggerPostAchievementPostTestPrompt();
  }, 450);
}

// ─── Post-Achievement Dialogue: Reward Result + Phishing Post-Test Prompt ────
function triggerPostAchievementPostTestPrompt() {
  const award = (typeof getPhishingEarnedAward === 'function') ? getPhishingEarnedAward() : null;
  const awardTitle = award ? award.title : 'Phishing Security Ribbon';
  const awardIcon = award ? award.icon : '🎖️';
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

  // Dismiss any active dialogue first to guarantee a clean slate
  RyanGuide.dismiss();

  // Congratulate Alex based on the specific medal/award claimed!
  let congratsIntro = '';
  if (tier === 'trophy' || (award && award.rank && award.rank.includes('1st'))) {
    congratsIntro = `Congratulations on claiming your 🏆 <strong>${awardTitle}</strong>! Flawless investigation work, Alex!`;
  } else if (tier === 'medal' || (award && award.rank && award.rank.includes('2nd'))) {
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
        text: "Now that you've claimed your award, you need to take a 20-question multiple-choice Post-Test based on what you learned.",
        state: 'speaking',
        label: 'TAP TO CONTINUE'
      }
    ],
    {
      onDone: function() {
        if (typeof RyanPosttest !== 'undefined') {
          RyanPosttest.confirmAndLaunch(
            function(res) {
              // On post-test completion, proceed to team group chat on Phone Link
              setTimeout(() => triggerPostAchievementPhoneLinkInvite(), 500);
            },
            function() {
              triggerPostTestReviewLaterGuide();
            }
          );
        } else {
          triggerPostAchievementPhoneLinkInvite();
        }
      }
    }
  );
}

// ─── Post-Test Review Later Guidance Dialogue ────
function triggerPostTestReviewLaterGuide() {
  if (typeof showToast === 'function') {
    showToast('📝 Post-Test saved. Take your time to review before starting!', 'info');
  }

  // Highlight Browser and File Explorer icons on desktop to guide review
  if (typeof IconAttention !== 'undefined') {
    IconAttention.show('browser');
    IconAttention.show('folder');
  }

  // Clear icon highlights after a short period if not clicked
  setTimeout(() => {
    if (typeof IconAttention !== 'undefined') {
      IconAttention.hide('browser');
      IconAttention.hide('folder');
    }
  }, 15000);

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

  // Create group chat "new intern team 2027" and highlight desktop icon
  if (typeof setNewbieGcCreated === 'function') {
    setNewbieGcCreated(true);
  } else if (typeof setNewbieGcInvitePending === 'function') {
    setNewbieGcInvitePending(true);
  }

  if (typeof highlightPhoneLinkApp === 'function') {
    highlightPhoneLinkApp();
  }
  if (typeof IconAttention !== 'undefined') {
    IconAttention.show('comms');
  }

  if (typeof showToast === 'function') {
    showToast('📱 Ding! Ryan created group "new intern team 2027" and added you!', 'info');
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

  // 1. Stats row directly on yellow sticky notes paper (no white background)
  let html = `
    <div class="sn-finish-stats">
      <div class="sn-stat-col">
        <div class="sn-stat-label">Completed</div>
        <div class="sn-stat-val">${count} / ${totalGoals}</div>
      </div>
      <div class="sn-stat-col">
        <div class="sn-stat-label">Accuracy</div>
        <div class="sn-stat-val">${accuracyPct}%</div>
      </div>
      <div class="sn-stat-col">
        <div class="sn-stat-label">Decisions</div>
        <div class="sn-stat-val">${correctCount} / ${totalEmails}</div>
      </div>
    </div>
  `;

  // 2. Big Medal Hero Display (Checklist is hidden after investigations finish)
  const tier = award.tier || 'ribbon';
  const rankText = award.rank || (rank ? `Rank ${rank}` : '1st Place');

  html += `
    <div class="sn-big-medal-card sn-tier-${tier}" onclick="showPhishingAchievementModal()" role="button" tabindex="0" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();showPhishingAchievementModal();}" aria-label="View Rewards: ${award.title}" title="Click medal to view rewards">
      <div class="sn-medal-top-badge">🎖️ INVESTIGATION COMPLETE</div>
      <div class="sn-big-medal-emblem-wrap">
        <div class="sn-big-medal-glow"></div>
        <div class="sn-big-medal-icon">${award.icon}</div>
      </div>
      <div class="sn-big-medal-title">${award.title}</div>
      <div class="sn-big-medal-sub">${rankText} · ${rankLabel || 'CYBER DETECTIVE'}</div>
      <button type="button" class="sn-big-medal-cta-btn" onclick="event.stopPropagation(); showPhishingAchievementModal();">
        <span>🏆 Click Medal to View Rewards</span>
        <span>➔</span>
      </button>
    </div>
  `;

  const postTestDone = typeof RyanPosttest !== 'undefined' && RyanPosttest.getResult && RyanPosttest.getResult();
  if (!postTestDone) {
    const isExpanded = window._snPostTestExpanded !== false;
    html += `
      <div class="sn-posttest-card-wrap">
        <div class="sn-posttest-checklist-card">
          <div class="sn-progress-header" style="margin-bottom:6px;">
            <span class="sn-progress-title">📋 Next Mission Task</span>
            <span class="sn-progress-count" style="background:#e0f2fe; color:#0369a1; border-color:rgba(2,132,199,0.3);">20 Questions</span>
          </div>
          <div class="sn-ach-item sn-posttest-checklist-item ${isExpanded ? 'expanded' : ''}" onclick="toggleStickyPostTestItem(event)" role="button" tabindex="0" title="Click to show Begin Post-Test">
            <div class="sn-checkbox" aria-hidden="true"></div>
            <div class="sn-ach-body">
              <div class="sn-ach-header-row">
                <span class="sn-ach-label">📝 Phishing Post-Test</span>
                <span class="sn-ach-prog-badge ${isExpanded ? 'done' : ''}">${isExpanded ? 'Ready' : 'Click to Begin'}</span>
              </div>
              <div class="sn-ach-desc">Click this task to show Begin Post-Test and assess your awareness!</div>
            </div>
          </div>
          <div id="sn-posttest-begin-box" class="sn-posttest-begin-box ${isExpanded ? 'active' : ''}">
            <div class="sn-posttest-begin-desc">Ready after reviewing? Answer 20 questions to evaluate your cyber defense growth against your pre-test baseline.</div>
            <button type="button" class="sn-posttest-btn" onclick="startPostTestFromSticky(event)">
              <span>✓ Begin Post-Test (20 Questions)</span>
              <span>➔</span>
            </button>
          </div>
        </div>
      </div>
    `;
  } else {
    const preResult = (typeof RyanPretest !== 'undefined' && RyanPretest.getResult)
      ? RyanPretest.getResult()
      : (typeof gameState !== 'undefined' ? gameState.preTestResult : null);
    html += renderPostTestComparisonHTML(preResult, postTestDone);
  }

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
  } else {
    updateStickyChecklist();
  }
}

function startPostTestFromSticky(event) {
  if (event) event.stopPropagation();
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
