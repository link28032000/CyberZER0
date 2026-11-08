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
  helloSent:        false,  // sent "Hello po." in newbie GC
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

function _isChapter2Active() {
  if (window._isPhishingRetryActive) return false;
  if (window._currentChapterCategory === 'malware') return true;
  if (typeof activeCategoryStory !== 'undefined' && activeCategoryStory === 'malware') return true;
  if (typeof gameState !== 'undefined' && gameState && (gameState.phase === 'malware' || gameState.chapter === 'malware')) return true;
  if (Boolean(window._ch2MissionStarted) || Boolean(window._ch2IntroActive) || Boolean(window._ch2Mission) || Boolean(window._ch2FreeExploration)) return true;
  return false;
}
window._isChapter2Active = _isChapter2Active;

function _isChapter1Active() {
  if (window._isPhishingRetryActive) return true;
  if (_isChapter2Active()) return false;
  if (window._currentChapterCategory === 'social_engineering' || window._currentChapterCategory === 'ransomware') return false;
  const cat = window._currentChapterCategory ||
              (typeof activeCategoryStory !== 'undefined' ? activeCategoryStory : null) ||
              (typeof gameState !== 'undefined' && gameState ? (gameState.phase || gameState.chapter) : null) ||
              'phishing';
  return cat === 'phishing' || cat === 'mission';
}
window._isChapter1Active = _isChapter1Active;

function _ch1FmtTime(sec) {
  if (isNaN(sec) || sec < 0) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

/**
 * Validates whether the given element is the genuine awareness video briefing,
 * strictly separating video events from the Music Player (audio playback).
 */
function _isAwarenessVideo(vid) {
  if (!vid) return false;
  // 1. Direct awareness overlay video element
  if (vid.id === 'awareness-real-video') return true;

  // 2. Media Player video element
  if (vid.id === 'videoplayer-video') {
    // If Media Player is in audio / music mode, reject immediately
    if (window._vpCurrentMediaType === 'audio' || vid._vpMediaType === 'audio') {
      return false;
    }
    // Check current source file for audio formats
    const src = (vid.currentSrc || vid.src || '').toLowerCase();
    if (src.includes('.mp3') || src.includes('.wav') || src.includes('.ogg') || src.includes('.m4a') || src.includes('sounds/')) {
      return false;
    }
    // If explicitly flagged or awareness clip media source
    if (vid._isAwarenessVideo === true) return true;
    if (src.includes('video3.mp4') || src.includes('cyber_awareness') || vid._vpMediaType === 'video') {
      return true;
    }
  }

  return false;
}

window._ch1OnVideoMetadataLoaded = function(vid) {
  if (!_isChapter1Active() || !vid || !_isAwarenessVideo(vid)) return;
  const dur = vid.duration || 0;
  if (dur > 0) {
    window._ch1VideoTracker.duration = dur;
    _refreshPostAwardChecklist();
  }
};

window._ch1OnVideoTimeUpdate = function(vid) {
  if (!_isChapter1Active() || !vid || !_isAwarenessVideo(vid)) return;
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

window._ch1OnVideoSkip = function(secs, vid) {
  if (!_isChapter1Active()) return;
  if (vid && !_isAwarenessVideo(vid)) return;
  if (window._vpCurrentMediaType === 'audio') return;
  if (secs > 0) {
    window._ch1VideoTracker.hasSkippedForward = true;
    _refreshPostAwardChecklist();
  }
};

window._ch1OnVideoSeek = function(newTime, oldTime, vid) {
  if (!_isChapter1Active()) return;
  if (vid && !_isAwarenessVideo(vid)) return;
  if (window._vpCurrentMediaType === 'audio') return;
  if (newTime > oldTime + 1.25) {
    window._ch1VideoTracker.hasSkippedForward = true;
    _refreshPostAwardChecklist();
  }
};

window._ch1OnVideoEnded = function(vid) {
  if (!_isChapter1Active() || !vid || !_isAwarenessVideo(vid)) return;
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
  if (!_isChapter1Active()) {
    if (_isChapter2Active() && appName === 'folder') {
      const note = document.getElementById('sticky-note');
      if (note && !note.classList.contains('hidden') && typeof updateStickyNoteForPhase === 'function') {
        updateStickyNoteForPhase('malware');
      }
    }
    return;
  }
  if (!window._awardClaimed) return;
  const t = window._postAwardTasks;
  if (!t) return;
  if (appName === 'browser') {
    t.browserOpened = true;
    // Note: Do NOT complete checklist on opening browser; user must search in browser!
  }
  if (appName === 'folder') { t.explorerOpened = true; }
  if (appName === 'comms') {
    t.phoneLinkOpened = true;
    // Note: Do NOT complete checklist on opening comms; user must send "Hello po."!
  }
  _refreshPostAwardChecklist();
};

// Called by navigateBrowser wrapper
window._notifyPostAwardBrowserNav = function(url) {
  if (!_isChapter1Active()) return;
  if (!window._awardClaimed) return;
  const t = window._postAwardTasks;
  if (!t) return;
  t.browserOpened = true;
  const trimmed = (url || '').trim();
  if (!trimmed || trimmed === 'about:blank' || trimmed === '#') return;

  // Never check if the user is merely opening or visiting a phishing link
  if (typeof isPhishingUrl === 'function' && isPhishingUrl(trimmed)) {
    return;
  }
  if (typeof getPhishingSiteForUrl === 'function' && getPhishingSiteForUrl(trimmed)) {
    return;
  }

  // User must actually search AND the query must be a known cyber topic.
  // Searches that return "did not match any documents" (random/unrelated words) do NOT count.
  const isSearch = /^https?:\/\/(www\.)?google\.com\/search/i.test(trimmed);
  if (isSearch) {
    // Extract the query string from the URL
    let _searchQ = '';
    try {
      const _urlObj = new URL(trimmed);
      _searchQ = (_urlObj.searchParams.get('q') || '').toLowerCase();
    } catch (e) {
      const _qMatch = trimmed.match(/[?&]q=([^&]*)/i);
      _searchQ = _qMatch ? decodeURIComponent(_qMatch[1].replace(/\+/g, ' ')).toLowerCase() : '';
    }
    // Only count if the query matches a known cyber topic that returns real results
    const _hasCyberResults = /cyber|phish|malware|trojan|virus|spyware|worm|ransomware|encrypt|ransom|scam|spoof|social.?engineer|fake.?login|infosec|security|email|download|cisa|tips?/i.test(_searchQ);
    if (_hasCyberResults) {
      const wasAlreadyDone = t.phishingSearched;
      t.phishingSearched = true;
      if (!wasAlreadyDone && typeof showToast === 'function') {
        showToast('🌐 Searched in browser! (+Checklist updated)', 'success');
      }
    }
  }
  _refreshPostAwardChecklist();
};

// Called by switchExplorerFolder wrapper
window._notifyPostAwardFolderSwitch = function(folderId) {
  if (!_isChapter1Active()) {
    if (_isChapter2Active()) {
      const note = document.getElementById('sticky-note');
      if (note && !note.classList.contains('hidden') && typeof updateStickyNoteForPhase === 'function') {
        updateStickyNoteForPhase('malware');
      }
    }
    return;
  }
  if (!window._awardClaimed) return;
  const t = window._postAwardTasks;
  if (!t) return;
  t.explorerOpened = true;
  if ((folderId || '').toLowerCase().includes('video')) {
    t.videoFolderOpen = true;
  }
  _refreshPostAwardChecklist();
};

// Called when video plays
window._notifyPostAwardVideoPlay = function() {
  if (!_isChapter1Active()) return;
  if (!window._awardClaimed) return;
  // For Chapter 1, playing alone does NOT complete the video; must watch completely.
};

// Called when player opens the "new intern team 2027" GC in Phone Link
window._notifyPostAwardGcOpen = function() {
  if (!_isChapter1Active()) return;
  if (!window._awardClaimed) return;
  if (!window._postAwardTasks) return;
  window._postAwardTasks.gcOpened = true;
  // Opening the GC alone does NOT mark the checklist task done; player must send "Hello po."!
  _refreshPostAwardChecklist();
};

// Called when player sends "Hello po." in newbie GC
window._notifyPostAwardHelloSent = function() {
  if (!_isChapter1Active()) return;
  if (!window._awardClaimed) return;
  const t = window._postAwardTasks;
  if (!t) return;
  const wasAlreadyDone = t.helloSent;
  t.helloSent = true;
  if (!wasAlreadyDone && typeof showToast === 'function') {
    showToast('💬 "Hello po." sent! (+Checklist updated)', 'success');
  }
  _refreshPostAwardChecklist();
};

// Dynamic hook to ensure any message sent in Phone Link triggers helloSent
(function _initPhoneLinkChecklistHook() {
  function hookSend() {
    if (typeof window.sendPlayerGcMessage === 'function' && !window.sendPlayerGcMessage._postAwardHooked) {
      const origSend = window.sendPlayerGcMessage;
      window.sendPlayerGcMessage = function(text) {
        const res = origSend.apply(this, arguments);
        try {
          if (typeof window._notifyPostAwardHelloSent === 'function') {
            const msg = (typeof text === 'string' ? text : '').toLowerCase();
            if (msg.includes('hello') || !msg || typeof loadNewbieGcState === 'function') {
              window._notifyPostAwardHelloSent();
            }
          }
        } catch(e) {}
        return res;
      };
      window.sendPlayerGcMessage._postAwardHooked = true;
    }
  }
  hookSend();
  window.addEventListener('load', hookSend);
  document.addEventListener('DOMContentLoaded', hookSend);
})();

// Helper to determine if player has sent "hello" in GC
function _isGcHelloSent() {
  const t = window._postAwardTasks;
  if (t && t.helloSent) return true;
  if (typeof loadNewbieGcState === 'function') {
    try {
      const s = loadNewbieGcState();
      if (s && Array.isArray(s.playerMessages)) {
        const hasHello = s.playerMessages.some(m =>
          (m.from === 'alex' || m.isPlayer) && (m.text || '').toLowerCase().includes('hello')
        );
        if (hasHello) {
          if (t) t.helloSent = true;
          return true;
        }
      }
    } catch(e) {}
  }
  return false;
}

// Check if all post-award checklist tasks are complete
function _allChecklistTasksDone() {
  const t = window._postAwardTasks;
  if (!t) return false;

  // Browser: Must have performed a search
  const browserDone = !!t.phishingSearched;

  // Video: Must have watched the awareness video completely without skipping
  const videoDone   = !!t.videoPlayed;

  // Phone Link: Must have sent "Hello po."
  const gcDone      = _isGcHelloSent();

  return !!(browserDone && videoDone && gcDone);
}

window._postAwardPostTestDialogueFired = false;

window._checkAndTriggerPostTestDialogue = function() {
  const activeCat = window._currentChapterCategory || (typeof activeCategoryStory !== 'undefined' ? activeCategoryStory : null);
  if (activeCat && activeCat !== 'phishing') return;
  if (!window._awardClaimed) return;
  if (window._postAwardPostTestDialogueFired) return;
  if (!_allChecklistTasksDone()) return;

  window._postAwardPostTestDialogueFired = true;

  // Short delay so the player sees the task tick off in the UI
  setTimeout(() => {
    const curCat = window._currentChapterCategory || (typeof activeCategoryStory !== 'undefined' ? activeCategoryStory : null);
    if (curCat && curCat !== 'phishing') return;
    if (typeof RyanGuide !== 'undefined' && RyanGuide.speak) {
      RyanGuide.speak(
        [
         {
  text: "Great job, Alex! You've completed your Task. Now, let's see what you've learned in this post-test.",
  state: 'speaking',
  label: 'TAP TO CONTINUE'
},
{
  text: "Take your time and answer each question carefully. Good luck, Alex!",
  state: 'success',
  label: "START POST-TEST"
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

function _isInvestigationFinished() {
  return Boolean(window._awardClaimed);
}
window._isInvestigationFinished = _isInvestigationFinished;

function _refreshPostAwardChecklist() {
  if (!_isChapter1Active()) {
    if (_isChapter2Active() && typeof updateStickyNoteForPhase === 'function') {
      updateStickyNoteForPhase('malware');
    }
    return;
  }
  const titleEl = document.getElementById('sticky-note-title');
  if (titleEl) titleEl.textContent = 'Sticky Notes';

  if (!window._postAwardTasks) {
    window._postAwardTasks = {
      browserOpened:    false,
      browserNavigated: false,
      phishingSearched: false,
      phishingVisited:  false,
      explorerOpened:   false,
      videoFolderOpen:  false,
      videoPlayed:      false,
      gcOpened:         false,
      helloSent:        false,
      postTestDone:     false
    };
  }

  const scrollEl = document.querySelector('#sticky-note .sticky-note-scroll');
  let section = document.getElementById('sn-post-award-checklist');
  if (!section && scrollEl) {
    scrollEl.innerHTML = '<div id="sn-post-award-checklist"></div>';
    section = document.getElementById('sn-post-award-checklist');
  }
  if (section) {
    section.innerHTML = _buildPostAwardChecklistHTML();
  }
  if (scrollEl) {
    scrollEl.style.overflowY = 'hidden';
  }
  if (typeof savePhishingProgress === 'function') { savePhishingProgress(); }
  if (_allChecklistTasksDone()) {
    _checkAndTriggerPostTestDialogue();
  }
}
window._refreshPostAwardChecklist = _refreshPostAwardChecklist;

function _buildPostAwardChecklistHTML() {
  const t = window._postAwardTasks;
  const postDone = typeof RyanPosttest !== 'undefined' && RyanPosttest.getResult && RyanPosttest.getResult();
  t.postTestDone = !!postDone;

  const browserDone = !!t.phishingSearched;
  const videoDone   = !!t.videoPlayed;
  const gcDone      = _isGcHelloSent();

  const tracker = window._ch1VideoTracker || {};
  if (!tracker.duration) {
    const vEl = document.getElementById('videoplayer-video');
    if (vEl && vEl.duration && !isNaN(vEl.duration) && _isAwarenessVideo(vEl)) {
      tracker.duration = vEl.duration;
    }
  }

  const curSec = tracker.currentTime || 0;
  const durSec = tracker.duration || 0;
  const curFmt = _ch1FmtTime(curSec);
  const durFmt = durSec > 0 ? _ch1FmtTime(durSec) : '--:--';

  let videoDesc = 'Watch video in File Explorer → Videos.';
  let videoBadge = videoDone ? '✓ Done' : 'Pending';

  if (videoDone) {
    videoBadge = '✓ Done';
    videoDesc = 'Awareness video watched completely.';
  } else if (durSec > 0) {
    if (tracker.hasSkippedForward) {
      videoBadge = 'Replay';
      videoDesc = 'Skipping detected. Replay from the start.';
    } else if (curSec > 0) {
      videoBadge = curFmt + ' / ' + durFmt;
      videoDesc = 'Watching awareness video...';
    } else {
      videoBadge = '0:00 / ' + durFmt;
      videoDesc = 'Watch video in File Explorer → Videos.';
    }
  }

  const tasks = [
    {
      id: 'browser',
      icon: '🌐',
      label: 'Open Browser &amp; Search',
      desc: browserDone ? 'Search performed in browser.' : 'Search for cyber tips in browser.',
      done: browserDone
    },
    {
      id: 'explorer',
      icon: '📁',
      label: 'Watch Awareness Video',
      desc: videoDesc,
      badgeText: videoBadge,
      done: videoDone
    },
    {
      id: 'phonelink',
      icon: '💬',
      label: 'Open Phone Link &amp; Say "Hello po"',
      desc: gcDone ? '"Hello po." sent in team GC.' : 'Open team GC and send "Hello po."',
      done: gcDone
    }
  ];

  const doneCount = tasks.filter(task => task.done).length;
  const pct = Math.round((doneCount / tasks.length) * 100);

  let html =
    '<div style="display:flex;flex-direction:column;gap:6px;overflow:hidden;">' +
      '<div class="sn-progress-card">' +
        '<div class="sn-progress-header">' +
          '<span class="sn-progress-title">📋 Checklist</span>' +
          '<span class="sn-progress-count">' + doneCount + ' of ' + tasks.length + ' Done</span>' +
        '</div>' +
        '<div class="sn-progress-bar-track">' +
          '<div class="sn-progress-bar-fill" style="width:' + pct + '%;"></div>' +
        '</div>' +
      '</div>' +
      '<ul class="sn-checklist">';

  tasks.forEach(function(task) {
    const badgeText = task.badgeText || (task.done ? '&#10003; Done' : 'Pending');
    html +=
      '<li class="sn-ach-item' + (task.done ? ' sn-ach-done' : '') + '" onclick="_onPostAwardTaskClick(\'' + task.id + '\')" style="cursor:pointer;" title="Click to open ' + task.label + '">' +
        '<div class="sn-checkbox' + (task.done ? ' checked' : '') + '" aria-hidden="true">' + (task.done ? '&#10003;' : '') + '</div>' +
        '<div class="sn-ach-body">' +
          '<div class="sn-ach-header-row">' +
            '<span class="sn-ach-label">' + task.icon + ' ' + task.label + '</span>' +
            '<span class="sn-ach-prog-badge' + (task.done ? ' done' : '') + '">' + badgeText + '</span>' +
          '</div>' +
          '<div class="sn-ach-desc">' + task.desc + '</div>' +
        '</div>' +
      '</li>';
  });

  html +=
      '</ul>' +
    '</div>';

  return html;
}

// Interactive quick launcher for the 3 post-award checklist tasks
window._onPostAwardTaskClick = function(taskId) {
  if (!_isChapter1Active()) return;
  if (taskId === 'browser') {
    // No auto-open: user opens the Browser manually from the desktop or taskbar.
  } else if (taskId === 'explorer') {
    if (typeof openApp === 'function') openApp('explorer');
    else if (typeof openExplorer === 'function') openExplorer();
  } else if (taskId === 'phonelink') {
    // No auto-open: user opens Phone Link manually from the desktop or taskbar.
  }
};


function renderEmptyStickyNote() {
  const note = document.getElementById('sticky-note');
  const titleEl = document.getElementById('sticky-note-title');
  const scrollEl = document.querySelector('#sticky-note .sticky-note-scroll');
  if (!scrollEl) return;
  if (titleEl) titleEl.textContent = 'Sticky Notes';
  scrollEl.innerHTML = `<div id="sticky-note-content" class="sticky-note-content" contenteditable="true" spellcheck="false" aria-label="Sticky note text" data-placeholder="Take a note..."></div>`;
}
window.renderEmptyStickyNote = renderEmptyStickyNote;

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
  if (icon) icon.classList.remove('icon-attention', 'btn-pulse-highlight', 'tutorial-highlight');

  // Ch2: mark sticky note as opened for the mission checklist tracker
  if (_isChapter2Active()) {
    if (!window._ch2Mission) window._ch2Mission = { stickyOpened: false, gamesOpened: false };
    window._ch2Mission.stickyOpened = true;
  }

  const titleEl = document.getElementById('sticky-note-title');
  if (titleEl) titleEl.textContent = 'Sticky Notes';

  const scrollEl = document.querySelector('#sticky-note .sticky-note-scroll');
  if (!scrollEl) return;

  // ── Chapter 2 (malware) — check FIRST so Ch1 results never leak into Ch2 ──
  if (!window._isPhishingRetryActive && _isChapter2Active()) {
    updateStickyNoteForPhase('malware');
    return;
  }

  // ── Other Chapters (Ch3, Ch4, etc.): show empty editable note ──
  if (!window._isPhishingRetryActive && !_isChapter1Active()) {
    renderEmptyStickyNote();
    return;
  }

  // ── Chapter 1: If desktop was loaded via Continue for an ALREADY COMPLETED chapter, show empty note ──
  if (!window._isPhishingRetryActive && _isChapter1Active() && window._ch1CompletedSandbox) {
    renderEmptyStickyNote();
    return;
  }

  // ── Chapter 1: If investigation complete or award claimed, display the 3-task post-award checklist ──
  if (!window._isPhishingRetryActive && _isChapter1Active() && _isInvestigationFinished()) {
    _refreshPostAwardChecklist();
    return;
  }

  // ── Always show the live 5-task checklist based on email interaction ──
  if (!document.getElementById('sn-checklist-section')) {
    scrollEl.innerHTML = '<div id="sn-checklist-section"></div>';
  }
  updateStickyChecklist();
}
window.showStickyNote = showStickyNote;


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
window.closeStickyNote = closeStickyNote;

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
// Helper: count phishing emails that received any verdict (correct or not)
function _countCorrectPhishing() {
  if (!gameState || !gameState.emailResults) return 0;
  return gameState.emailResults.filter(r =>
    r.isPhishing === true
  ).length;
}

// Helper: count legitimate emails that received any verdict (correct or not)
function _countCorrectLegitimate() {
  if (!gameState || !gameState.emailResults) return 0;
  return gameState.emailResults.filter(r =>
    r.isPhishing === false
  ).length;
}

// Helper: count emails where player flagged fake_sender (live user interaction + saved cases)
function _countFakeSenderFound() {
  if (!gameState) return 0;
  const completed = (gameState.emailResults || []).filter(r =>
    r.isPhishing === true && r.savedFlags && r.savedFlags.some(f => f.type === 'fake_sender')
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
    r.isPhishing === true && r.savedFlags && r.savedFlags.some(f => f.type === 'false_urgency' || f.type === 'suspicious_link' || f.type === 'malicious_attachment')
  ).length;

  const detailViewEl = document.getElementById('email-detail-view');
  const isDetailView = Boolean(detailViewEl && detailViewEl.classList.contains('active'));
  const curEmail = (typeof ch1InboxEmails !== 'undefined' && typeof gameState.currentEmail === 'number') ? ch1InboxEmails[gameState.currentEmail] : null;
  const isCurrentUnsubmitted = isDetailView && curEmail && !(gameState.emailResults || []).some(r => r.emailId === curEmail.id);
  const hasActiveIndicator = isCurrentUnsubmitted && (curEmail.phishing === true) && (gameState.currentEmailFlags || []).some(f => f.type === 'false_urgency' || f.type === 'suspicious_link' || f.type === 'malicious_attachment');

  return Math.min(5, completed + (hasActiveIndicator ? 1 : 0));
}

// Evidence counting helpers
function _countTotalEvidenceCollected() {
  if (!gameState) return 0;
  let count = 0;
  if (Array.isArray(gameState.emailResults)) {
    gameState.emailResults.forEach(r => {
      if (r.isPhishing && Array.isArray(r.savedFlags)) {
        const validTypes = new Set(['fake_sender', 'false_urgency', 'suspicious_link', 'malicious_attachment']);
        const found = new Set(r.savedFlags.map(f => f.type).filter(t => validTypes.has(t)));
        count += found.size;
      }
    });
  }
  const detailViewEl = document.getElementById('email-detail-view');
  const isDetailView = Boolean(detailViewEl && detailViewEl.classList.contains('active'));
  const curEmail = (typeof ch1InboxEmails !== 'undefined' && typeof gameState.currentEmail === 'number') ? ch1InboxEmails[gameState.currentEmail] : null;
  const isCurrentUnsubmitted = isDetailView && curEmail && !(gameState.emailResults || []).some(r => r.emailId === curEmail.id);
  if (isCurrentUnsubmitted && curEmail.phishing && Array.isArray(gameState.currentEmailFlags)) {
    const validTypes = new Set(['fake_sender', 'false_urgency', 'suspicious_link', 'malicious_attachment']);
    const activeFound = new Set(gameState.currentEmailFlags.map(f => f.type).filter(t => validTypes.has(t)));
    count += activeFound.size;
  }
  return Math.min(15, count);
}

function _countAllEmailVerdicts() {
  const total = (typeof EMAILS !== 'undefined' && Array.isArray(EMAILS) && EMAILS.length > 0) ? EMAILS.length : 12;
  if (typeof ch1InvestigationComplete !== 'undefined' && ch1InvestigationComplete) {
    return total;
  }
  const submittedIds = new Set();
  if (typeof ch1ResolvedEmailIds !== 'undefined' && ch1ResolvedEmailIds instanceof Set) {
    ch1ResolvedEmailIds.forEach(id => submittedIds.add(id));
  }
  if (typeof gameState !== 'undefined' && Array.isArray(gameState.emailResults)) {
    gameState.emailResults.forEach(r => {
      if (r && r.emailId) submittedIds.add(r.emailId);
    });
  }
  return Math.min(total, submittedIds.size);
}

function _isAllEmailVerdictsSubmitted() {
  const total = (typeof EMAILS !== 'undefined' && Array.isArray(EMAILS) && EMAILS.length > 0) ? EMAILS.length : 12;
  if (typeof ch1InvestigationComplete !== 'undefined' && ch1InvestigationComplete) {
    return true;
  }
  if (typeof ch1ResolvedEmailIds !== 'undefined' && ch1ResolvedEmailIds instanceof Set && ch1ResolvedEmailIds.size >= total) {
    return true;
  }
  if (typeof gameState !== 'undefined' && Array.isArray(gameState.emailResults)) {
    if (gameState.emailResults.length >= total) {
      return true;
    }
  }
  return _countAllEmailVerdicts() >= total;
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
  },
  {
    id: 'task_submit_all_verdicts',
    icon: '⚖️',
    label: 'Submit all email verdicts',
    desc: 'Investigate and submit verdicts for all 12 emails in the investigation.',
    check: () => _isAllEmailVerdictsSubmitted(),
    currentCount: () => _countAllEmailVerdicts(),
    goal: 12,
    progress: () => `${_countAllEmailVerdicts()}/12 email verdicts submitted`
  }
];

const _achievementUnlocked = new Set();
let _trophyUnlockedDate = null;
let _phishingEarnedAward = null;

// ─── Chapter 1 Unique Award: Phishing Investigation Award (Single Award Trophy) ───
const PHISHING_AWARD = {
  id: 'ach_phishing',
  chapter: 1,
  title: 'Phishing Investigation Award',
  image: 'assets/Achievement/Phishing.png',
  badge: 'CHAPTER 1 · INVESTIGATION AWARD',
  rank: '5/5 Missions Completed',
  sub: 'All 5 Investigation Checklist Tasks Completed',
  desc: 'Outstanding detective work! You successfully analyzed all suspicious emails, exposed deceptive phishing lures, documented spoofed senders, and safeguarded authentic communications.',
  requiredTasks: 5
};

function getCompletedTasksCount() {
  if (!Array.isArray(SN_ACHIEVEMENTS)) return 0;
  return SN_ACHIEVEMENTS.filter(ach => typeof ach.check === 'function' && ach.check()).length;
}

function getPhishingEarnedTier(count) {
  return PHISHING_AWARD;
}

function getPhishingEarnedAward() {
  if (_phishingEarnedAward) return _phishingEarnedAward;
  const count = getCompletedTasksCount();
  const totalReq = Array.isArray(SN_ACHIEVEMENTS) ? SN_ACHIEVEMENTS.length : 5;
  if (count < totalReq && !isPhishingTrophyUnlocked()) return null;
  return {
    id: PHISHING_AWARD.id,
    title: PHISHING_AWARD.title,
    image: PHISHING_AWARD.image,
    badge: PHISHING_AWARD.badge,
    rank: PHISHING_AWARD.rank,
    sub: PHISHING_AWARD.sub,
    desc: PHISHING_AWARD.desc,
    tasksCompleted: count,
    unlockedDate: _trophyUnlockedDate || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  };
}

function savePhishingProgress() {
  try {
    const isTrophyUnlocked = isPhishingTrophyUnlocked();
    const isDone = Boolean(window._awardClaimed);
    const data = {
      unlockedAchievements: Array.from(_achievementUnlocked),
      trophyUnlocked: isTrophyUnlocked,
      earnedAward: _phishingEarnedAward,
      awardClaimed: isDone,
      postAwardTasks: window._postAwardTasks ? Object.assign({}, window._postAwardTasks) : {},
      ch1VideoTracker: window._ch1VideoTracker ? Object.assign({}, window._ch1VideoTracker) : {},
      unlockedDate: _trophyUnlockedDate || (_phishingEarnedAward ? _phishingEarnedAward.unlockedDate : (isTrophyUnlocked ? new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' }) : null)),
      currentEmail: (typeof gameState !== 'undefined' && typeof gameState.currentEmail === 'number') ? gameState.currentEmail : 0,
      emailResults: (typeof gameState !== 'undefined' && Array.isArray(gameState.emailResults)) ? [...gameState.emailResults] : [],
      inboxEmailIds: (typeof ch1InboxEmails !== 'undefined' && Array.isArray(ch1InboxEmails)) ? ch1InboxEmails.map(e => e.id) : [],
      resolvedEmailIds: (typeof ch1ResolvedEmailIds !== 'undefined' && ch1ResolvedEmailIds && ch1ResolvedEmailIds.size) ? Array.from(ch1ResolvedEmailIds) : [],
      score: (typeof gameState !== 'undefined') ? gameState.score : 0,
      correctDecisions: (typeof gameState !== 'undefined') ? gameState.correctDecisions : 0,
      phishingDetected: (typeof gameState !== 'undefined') ? gameState.phishingDetected : 0,
      legitimateDetected: (typeof gameState !== 'undefined') ? gameState.legitimateDetected : 0,
      evidenceFoundTotal: (typeof gameState !== 'undefined') ? gameState.evidenceFoundTotal : 0
    };
    localStorage.setItem('cyberzero_phishing_progress', JSON.stringify(data));
    if (typeof window.saveSessionLocally === 'function') {
      window.saveSessionLocally();
    }
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
      if (data.ch1VideoTracker) {
        window._ch1VideoTracker = Object.assign(window._ch1VideoTracker || {}, data.ch1VideoTracker);
      }
      if (data.trophyUnlocked) {
        _achievementUnlocked.add('task_all_complete');
        _trophyUnlockedDate = data.unlockedDate || new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });
      } else if (data.unlockedDate) {
        _trophyUnlockedDate = data.unlockedDate;
      }

      // Restore mission progress fields
      if (Array.isArray(data.emailResults) && typeof gameState !== 'undefined' && data.emailResults.length > 0) {
        gameState.emailResults = [...data.emailResults];
      }
      if (typeof data.currentEmail === 'number' && typeof gameState !== 'undefined') {
        gameState.currentEmail = data.currentEmail;
      }
      if (typeof data.score === 'number' && typeof gameState !== 'undefined') {
        gameState.score = data.score;
      }
      if (typeof data.correctDecisions === 'number' && typeof gameState !== 'undefined') {
        gameState.correctDecisions = data.correctDecisions;
      }
      if (typeof data.phishingDetected === 'number' && typeof gameState !== 'undefined') {
        gameState.phishingDetected = data.phishingDetected;
      }
      if (typeof data.legitimateDetected === 'number' && typeof gameState !== 'undefined') {
        gameState.legitimateDetected = data.legitimateDetected;
      }
      if (typeof data.evidenceFoundTotal === 'number' && typeof gameState !== 'undefined') {
        gameState.evidenceFoundTotal = data.evidenceFoundTotal;
      }
      if (Array.isArray(data.resolvedEmailIds) && typeof ch1ResolvedEmailIds !== 'undefined') {
        ch1ResolvedEmailIds = new Set(data.resolvedEmailIds);
      }
      if (Array.isArray(data.inboxEmailIds) && data.inboxEmailIds.length > 0 && typeof ch1InboxEmails !== 'undefined' && ch1InboxEmails.length === 0) {
        ch1InboxEmails = data.inboxEmailIds.map(function(id) {
          return typeof ch1GetEmailDef === 'function' ? ch1GetEmailDef(id) : null;
        }).filter(Boolean);
      }
    }
  } catch(e) {}

  // Check persistent claimed status from Main Menu achievements map
  try {
    const rawAch = localStorage.getItem('cyberzero_claimed_achievements');
    if (rawAch) {
      const achMap = JSON.parse(rawAch);
      if (achMap && achMap['ach_phishing'] && (achMap['ach_phishing'].claimed || achMap['ach_phishing'].tier)) {
        window._awardClaimed = true;
        _achievementUnlocked.add('task_all_complete');
        _achievementUnlocked.add('phish_trophy_unlocked');
        _achievementUnlocked.add('ach_phishing');
      }
    }
  } catch(e) {}

  if (typeof updateDesktopTrophyDisplay === 'function') {
    updateDesktopTrophyDisplay();
  }
}

function isPhishingTrophyUnlocked() {
  const count = getCompletedTasksCount();
  const total = Array.isArray(SN_ACHIEVEMENTS) ? SN_ACHIEVEMENTS.length : 5;
  const allDone = (Array.isArray(SN_ACHIEVEMENTS) && SN_ACHIEVEMENTS.length >= 5 && SN_ACHIEVEMENTS.every(ach => typeof ach.check === 'function' && ach.check()));
  return count >= total ||
    allDone ||
    _achievementUnlocked.has('task_all_complete');
}

function renderPhishingChecklist() {
  window._isPhishingRetryActive = true;
  window._awardClaimed = false;
  window._ch1CompletedSandbox = false;
  window._phishAutoModalShown = false;
  _phishingEarnedAward = null;
  _trophyUnlockedDate = null;

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
  window._currentChapterCategory = 'phishing';

  const note = document.getElementById('sticky-note');
  const titleEl = document.getElementById('sticky-note-title');
  const scrollEl = document.querySelector('#sticky-note .sticky-note-scroll');

  if (titleEl) {
    titleEl.textContent = 'Sticky Notes';
  }

  if (scrollEl) {
    scrollEl.style.overflowY = 'auto';
    scrollEl.innerHTML = '<div id="sn-checklist-section"></div>';
  }

  if (note) {
    note.classList.remove('hidden', 'collapsed', 'sticky-note-pop', 'sticky-note-highlight');
    note.style.zIndex = '4500';
  }

  const icon = document.getElementById('icon-notes');
  if (icon) icon.classList.remove('hidden');

  updateStickyChecklist();

  if (typeof updateDesktopTrophyDisplay === 'function') {
    updateDesktopTrophyDisplay();
  }
}
window.renderPhishingChecklist = renderPhishingChecklist;
window.updateStickyNoteProgress = renderPhishingChecklist;

function updateStickyChecklist() {
  if (_isChapter2Active()) {
    if (typeof updateStickyNoteForPhase === 'function') {
      updateStickyNoteForPhase('malware');
    }
    return;
  }
  if (!_isChapter1Active()) {
    return;
  }
  if (_isInvestigationFinished() && !window._isPhishingRetryActive) {
    _refreshPostAwardChecklist();
    return;
  }
  if (gameState && gameState.phase !== 'mission' && gameState.phase !== 'results' && gameState.phase !== 'phishing') {
    if (!window._isPhishingRetryActive) return;
    gameState.phase = 'mission';
  }
  let section = document.getElementById('sn-checklist-section');
  if (!section) {
    const scrollEl = document.querySelector('#sticky-note .sticky-note-scroll');
    if (scrollEl) {
      scrollEl.innerHTML = '<div id="sn-checklist-section"></div>';
      section = document.getElementById('sn-checklist-section');
    }
  }
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
  section.innerHTML = html;
}
window.updateStickyChecklist = updateStickyChecklist;

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
  const isClaimed = Boolean(window._awardClaimed) || (typeof isAchievementClaimed === 'function' && isAchievementClaimed('ach_phishing'));
  const isComplete = typeof isPhishingTrophyUnlocked === 'function' && isPhishingTrophyUnlocked();

  if (!isComplete && !isClaimed) {
    const missing = [];
    if (typeof SN_ACHIEVEMENTS !== 'undefined') {
      SN_ACHIEVEMENTS.forEach(ach => {
        if (!ach.check()) missing.push(ach.label);
      });
    }
    if (typeof showIncompletePhishingClaimDialogue === 'function') {
      showIncompletePhishingClaimDialogue(missing);
    } else if (typeof showToast === 'function') {
      showToast('⚠️ Complete all checklist missions first!', 'warning');
    }
    return;
  }

  const existing = document.getElementById('phish-trophy-modal');
  if (existing) existing.remove();

  // Hide Sticky Note so player focuses on Claim Reward modal
  const sNote = document.getElementById('sticky-note');
  if (sNote) {
    sNote.classList.add('hidden');
    sNote.classList.remove('highlight-attention');
  }

  const count = typeof customCount === 'number' ? customCount : getCompletedTasksCount();
  const award = customAward || getPhishingEarnedAward() || PHISHING_AWARD;

  const modal = document.createElement('div');
  modal.id = 'phish-trophy-modal';
  modal.className = 'phish-trophy-modal';
  modal.innerHTML = `
    <div class="ptm-backdrop" onclick="this.parentElement.remove(); if (typeof showStickyNote === 'function') showStickyNote();"></div>
    <div class="ptm-confetti-fullscreen" id="ptm-confetti"></div>
    <div class="ptm-card ptm-card-clean">
      <div class="ptm-glow-ring"></div>
      <div class="ptm-big-medal-container">
        <div class="ptm-big-award-backlight ${isComplete || isClaimed ? 'is-claimed' : 'is-silhouette'}"></div>
        <img src="assets/Achievement/Phishing.png" class="ptm-big-award-img ${isComplete || isClaimed ? 'is-claimed' : 'is-silhouette'}" alt="Phishing Investigation Award" />
      </div>
      <h2 class="ptm-big-title">Phishing Investigation Award</h2>
      <div class="ptm-big-rank">${count} / ${Array.isArray(SN_ACHIEVEMENTS) ? SN_ACHIEVEMENTS.length : 5} CHECKLIST MISSIONS &amp; EVIDENCE COMPLETED</div>
      <div class="ptm-desc" style="font-size:12px;color:#94a3b8;margin:8px 0 16px;text-align:center;max-width:380px;">
        ${isClaimed ? 'You have claimed the Phishing Investigation Award! Collectible trophy is preserved in your trophies.' : 'All Phishing missions and required evidence successfully completed! Claim your collectible trophy.'}
      </div>
      <div class="ptm-footer" style="margin-top: 14px;">
        <button class="ptm-close-btn" onclick="${isClaimed ? "this.closest('.phish-trophy-modal').remove(); if (typeof showStickyNote === 'function') showStickyNote();" : "attemptClaimPhishingAward()"}">${isClaimed ? 'Award Claimed (Close)' : 'Claim Reward'}</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const confettiEl = modal.querySelector('#ptm-confetti');
  if (isComplete && confettiEl) {
    const palette = ['#00f0ff', '#ffd700', '#facc15', '#38bdf8', '#ffffff', '#10b981'];
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

  if (isComplete && typeof AudioManager !== 'undefined') {
    if (AudioManager.playTrophyFanfare) AudioManager.playTrophyFanfare();
    else if (AudioManager.playCorrect) AudioManager.playCorrect();
  }
}

function attemptClaimPhishingAward() {
  // Prevent duplicate claims
  if (window._awardClaimed || (typeof isAchievementClaimed === 'function' && isAchievementClaimed('ach_phishing'))) {
    const modal = document.getElementById('phish-trophy-modal');
    if (modal) modal.remove();
    if (typeof showToast === 'function') {
      showToast('Award already claimed!', 'info');
    }
    return;
  }
  if (!isPhishingTrophyUnlocked()) {
    // DENIED: Do not play reward-claim sound! Keep trophy locked as silhouette.
    const missing = [];
    if (typeof SN_ACHIEVEMENTS !== 'undefined') {
      SN_ACHIEVEMENTS.forEach(ach => {
        if (!ach.check()) missing.push(ach.label);
      });
    }
    const modal = document.getElementById('phish-trophy-modal');
    if (modal) modal.remove();

    if (typeof showIncompletePhishingClaimDialogue === 'function') {
      showIncompletePhishingClaimDialogue(missing);
    } else if (typeof showToast === 'function') {
      showToast('⚠️ Complete all checklist missions first!', 'warning');
    }
    return;
  }

  closePhishingTrophy();
}
window.attemptClaimPhishingAward = attemptClaimPhishingAward;

function closePhishingTrophy() {
  const modal = document.getElementById('phish-trophy-modal');
  if (modal) {
    modal.classList.remove('ptm-show');
    setTimeout(() => modal.remove(), 400);
  }

  // Mark award as claimed — switches sticky note to post-award checklist
  window._awardClaimed = true;
  window._postAwardPostTestDialogueFired = false;

  // Audio fanfare for successful claim
  if (typeof AudioManager !== 'undefined') {
    try {
      if (typeof AudioManager.playTrophyFanfare === 'function') AudioManager.playTrophyFanfare();
      else if (typeof AudioManager.playPerfectFanfare === 'function') AudioManager.playPerfectFanfare();
      else if (typeof AudioManager.playMissionComplete === 'function') AudioManager.playMissionComplete();
      if (typeof AudioManager.playChime === 'function') setTimeout(() => AudioManager.playChime(true), 320);
    } catch(e) {}
  }

  // Sync claimed status to Main Menu achievements map
  try {
    const raw = localStorage.getItem('cyberzero_claimed_achievements');
    const map = raw ? JSON.parse(raw) : {};
    map['ach_phishing'] = {
      claimed: true,
      chapter: 1,
      title: 'Phishing Investigation Award',
      claimedAt: Date.now(),
      claimedDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    };
    localStorage.setItem('cyberzero_claimed_achievements', JSON.stringify(map));
  } catch(e) {}

  // Reveal desktop trophy
  if (typeof updateDesktopTrophyDisplay === 'function') {
    updateDesktopTrophyDisplay();
  }

  savePhishingProgress();
  // Save progress to Firestore + update Start/Continue button immediately
  if (typeof window.saveProgress === 'function') {
    window.saveProgress().catch(() => {});
  }
  if (typeof updateStartButton === 'function') {
    updateStartButton();
  } else if (typeof window.updateStartButton === 'function') {
    window.updateStartButton();
  }

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

  // Initialize post-award task tracking if not already set (preserve existing progress)
  if (!window._postAwardTasks) {
    window._postAwardTasks = {
      browserOpened:    false,
      browserNavigated: false,
      phishingSearched: false,
      phishingVisited:  false,
      explorerOpened:   false,
      videoFolderOpen:  false,
      videoPlayed:      false,
      gcOpened:         false,
      helloSent:        false,
      postTestDone:     false
    };
  }
  if (!window._ch1VideoTracker) {
    window._ch1VideoTracker = {
      duration: 0,
      currentTime: 0,
      actualSecondsWatched: 0,
      lastPlayheadTime: 0,
      hasSkippedForward: false,
      completed: false,
      _lastRefresh: 0
    };
  }

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

  // ── Claim the main menu Chapter 1 achievement (ach_phishing) ──
  try {
    const ACH_KEY = 'cyberzero_claimed_achievements';
    let claimedMap = {};
    try { claimedMap = JSON.parse(localStorage.getItem(ACH_KEY) || '{}'); } catch(e) {}
    if (!claimedMap['ach_phishing']) {
      claimedMap['ach_phishing'] = {
        claimed: true,
        chapter: 1,
        title: 'Phishing Investigation Award',
        claimedAt: Date.now(),
        claimedDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
      };
      localStorage.setItem(ACH_KEY, JSON.stringify(claimedMap));
    }
    if (typeof renderMainMenuAchievements === 'function') {
      renderMainMenuAchievements();
    }
    if (typeof updateAchievementNotificationBadge === 'function') {
      updateAchievementNotificationBadge();
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

  // Refresh sticky note immediately to show the 3 new post-award mission checklist tasks
  if (typeof _refreshPostAwardChecklist === 'function') {
    _refreshPostAwardChecklist();
  } else if (typeof renderStickyNoteResults === 'function') {
    renderStickyNoteResults();
  }
  showStickyNote();
  if (typeof focusStickyNote === 'function') {
    focusStickyNote();
  }

  // Trigger Ryan mentor dialogue AFTER modal fully closes (modal fade-out = 400ms)
  setTimeout(() => {
    if (typeof triggerPostAchievementPostTestPrompt === 'function') {
      triggerPostAchievementPostTestPrompt();
    }
  }, 900);

  // Prepare newbie group for Task 3
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

  window._postAwardPromptSpoken = true;
  // Congratulate Alex on claiming the Phishing award
  const congratsIntro = `Congratulations on claiming your 🏆 <strong>${awardTitle || 'Phishing Investigation Award'}</strong>! Seriously awesome detective work, Alex!`;

  RyanGuide.speak(
    [
      {
        text: congratsIntro,
        state: 'success',
        label: 'TAP TO CONTINUE'
      },
      {
        text: "Before we jump into your final quiz, check your <strong>Sticky Notes</strong> 📋. You've got 3 quick prep tasks to knock out first!",
        state: 'speaking',
        label: 'TAP TO CONTINUE'
      },
      {
        text: "🌐 <strong>Task 1:</strong> Hop into the <strong>Browser</strong> and search for <strong>\"phishing\"</strong> to read up on sneaky red flags.",
        state: 'thinking',
        label: 'TAP TO CONTINUE'
      },
      {
        text: "📁 <strong>Task 2:</strong> Open <strong>File Explorer</strong>, head to your <strong>Videos</strong> folder, and watch the quick awareness clip.",
        state: 'speaking',
        label: 'TAP TO CONTINUE'
      },
      {
        text: "📱 <strong>Task 3:</strong> Open <strong>Phone Link</strong>, find our team group chat, and drop a friendly \"Hello po.\" to say hi to the crew!",
        state: 'thinking',
        label: 'TAP TO CONTINUE'
      },
      {
        text: "Knock out those 3 tasks on your Sticky Notes, and I'll jump right back in to start your final quiz! 📝",
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
  if (!_isChapter1Active()) return;
  if (!window._awardClaimed) return;
  if (!window._postAwardTasks) return;
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
        text: "No rush at all! Brushing up beforehand is super smart.",
        state: 'speaking'
      },
      {
        text: "Feel free to search around in the Browser or rewatch the clip in your Videos folder.",
        state: 'thinking'
      },
      {
        text: "Whenever you're ready to show what you've learned, open your Sticky Notes and hit Begin!",
        state: 'success'
      }
    ]);
  }
}

// ─── Post-Achievement Dialogue: Onboarding to "new intern team 2027" on Phone Link ────
function triggerPostAchievementPhoneLinkInvite() {
  const curCat = window._currentChapterCategory || (typeof activeCategoryStory !== 'undefined' ? activeCategoryStory : null);
  if (curCat && curCat !== 'phishing') return;

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
          text: "Alex, you crushed it! 🎉 Awesome job on the quiz, you have got real deal scam radar now!",
          state: 'success',
          label: 'TAP TO CONTINUE'
        },
        {
          text: "I just set up a group chat for our intern batch called <strong>\"new intern team 2027\"</strong> and added you to it!",
          state: 'speaking',
          label: 'TAP TO CONTINUE'
        },
        {
          text: "Open up your <strong>Phone Link</strong> app whenever you're ready and say hi to the crew, Pia and Ethan are already hanging out in there!",
          state: 'speaking',
          label: 'CONTINUE'
        }
      ],
      {
        onDone: function() {
          // Manual open: do not automatically launch Phone Link app
        }
      }
    );
  }
}

// ─── Post-Test Dialogue: Ryan guides Alex to Start Menu -> Power -> Shutdown (Save) ────
window.triggerPostTestSaveDialogue = window.triggerPostPhoneLinkSaveDialogue = function() {
  const curCat = window._currentChapterCategory || (typeof activeCategoryStory !== 'undefined' ? activeCategoryStory : null);
  if (curCat && curCat !== 'phishing') return;
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
          text: "What a day, Alex! 🎉 You did incredible work spotting all those phishing scams today.",
          state: 'success',
          label: 'TAP TO CONTINUE'
        },
        {
          text: "If you want to practice identifying phishing emails again, just message me through Phone Link, and I'll help you retry the phishing activity!",
          state: 'speaking',
          label: 'TAP TO CONTINUE'
        },
        {
          text: "Before you leave your desk, golden rule of office security: never leave an unlocked PC unattended. Anyone walking by could mess with your files!",
          state: 'speaking',
          label: 'TAP TO CONTINUE'
        },
        {
          text: "To save your progress and lock down your terminal, click the <strong>Windows Start button (⊞)</strong> glowing down on your taskbar.",
          state: 'speaking',
          label: 'TAP TO CONTINUE'
        },
        {
          text: "Open up <strong>Power Controls (⏻)</strong> and hit <strong>'Shutdown (Save)'</strong> to log off safely and head into Chapter 2!",
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
  const shutdownBtn = document.getElementById("start-shutdown-btn") || document.querySelector("#start-power-dropdown button[onclick*='shutdown']");
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
  const shutdownBtn = document.getElementById("start-shutdown-btn") || document.querySelector("#start-power-dropdown button[onclick*='shutdown']");

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

  const ch2IntroActive = typeof isCh2IntroActive === 'function' ? isCh2IntroActive() : !!window._ch2IntroActive;
  const ch2PretestRunning = typeof Ch2Pretest !== 'undefined' && Ch2Pretest.isRunning && Ch2Pretest.isRunning();
  if (ch2PretestRunning) {
    if (typeof showToast === 'function') showToast('Please complete the pre-test with Ryan before opening other apps.', 'warning');
    const bd2 = document.getElementById('overlay-ch2-pretest');
    if (bd2) bd2.style.zIndex = '99999';
    if (typeof AudioManager !== 'undefined') AudioManager.playWrong();
    return;
  }
  if (ch2IntroActive) {
    if (typeof showToast === 'function') showToast('Please finish the introduction dialogue with Ryan before opening apps.', 'warning');
    if (typeof AudioManager !== 'undefined') AudioManager.playWrong();
    return;
  }

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
  if (!_isChapter1Active()) {
    if (_isChapter2Active() && typeof updateStickyNoteForPhase === 'function') {
      updateStickyNoteForPhase('malware');
    }
    return;
  }
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

  // ── After award is claimed / investigation finished: show mission checklist ────────
  if (_isInvestigationFinished()) {
    _refreshPostAwardChecklist();
    // Hook video tracking events once
    setTimeout(function() {
      var vid = document.getElementById('videoplayer-video');
      if (vid && !vid._postAwardHooked) {
        vid._postAwardHooked = true;
        vid.addEventListener('timeupdate', function() {
          if (_isAwarenessVideo(vid) && typeof window._ch1OnVideoTimeUpdate === 'function') {
            window._ch1OnVideoTimeUpdate(vid);
          }
        });
        vid.addEventListener('ended', function() {
          if (_isAwarenessVideo(vid) && typeof window._ch1OnVideoEnded === 'function') {
            window._ch1OnVideoEnded(vid);
          }
        });
        vid.addEventListener('loadedmetadata', function() {
          if (_isAwarenessVideo(vid) && typeof window._ch1OnVideoMetadataLoaded === 'function') {
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
    const videoDone   = !!t.videoPlayed;
    const gcDone      = _isGcHelloSent();
    const pending = [];
    if (!browserDone) pending.push('🌐 Open Browser & Search');
    if (!videoDone)   pending.push('📁 Watch awareness video');
    if (!gcDone)      pending.push('💬 Say "Hello po" in Phone Link');
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

  const currentCat = window._currentChapterCategory || (typeof activeCategoryStory !== 'undefined' ? activeCategoryStory : null) || 'phishing';

  // In Chapter 1 (phishing), show checklist or post-award checklist
  if (_isChapter1Active() && (phase === 'phishing' || !phase || currentCat === 'phishing')) {
    if (titleEl) titleEl.textContent = "Sticky Notes";

    if (_isInvestigationFinished() && !window._isPhishingRetryActive) {
      _refreshPostAwardChecklist();
      return;
    }

    if (!document.getElementById('sn-checklist-section')) {
      scrollEl.innerHTML = `<div id="sn-checklist-section"></div>`;
    }
    updateStickyChecklist();
    return;
  }

  // Chapter 2 (malware) notes — TrojanCoinBitMiner Interactive Checklist
  if (_isChapter2Active() || phase === 'malware' || currentCat === 'malware') {
    if (titleEl) titleEl.textContent = 'Sticky Notes';
    window._ch2ChecklistUnlocked = true;

    if (typeof TrojanInvestigation !== 'undefined' && TrojanInvestigation.renderChecklist) {
      TrojanInvestigation.renderChecklist(scrollEl);
      return;
    }

    // Fallback if TrojanInvestigation not loaded yet
    scrollEl.innerHTML = '<div style="padding:14px; text-align:center; color:#78350f;">Loading Chapter 2 Investigation...</div>';
    return;
  }

  // Other chapters: default to clean editable notepad
  renderEmptyStickyNote();
}
window.updateStickyNoteForPhase = updateStickyNoteForPhase;

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


// ─── Desktop Screen Trophy Display System ──────────────────────────────────
function updateDesktopTrophyDisplay() {
  const trophyEl = document.getElementById('desktop-phishing-trophy');
  if (!trophyEl) return;

  const isClaimed = !!window._awardClaimed;
  const isUnlocked = typeof isPhishingTrophyUnlocked === 'function' && isPhishingTrophyUnlocked();

  trophyEl.className = `desktop-trophy-widget ${isClaimed ? 'is-claimed' : (isUnlocked ? 'is-ready' : 'is-locked')}`;
  trophyEl.setAttribute('title', isClaimed ? 'Phishing Investigation Award (Claimed)' : (isUnlocked ? 'Phishing Award (Ready to Claim)' : 'Phishing Award (Locked - Complete all missions & evidence)'));
  
  const imgEl = trophyEl.querySelector('.dtw-img');
  if (imgEl) {
    imgEl.className = `dtw-img ${isClaimed ? 'is-claimed' : 'is-silhouette'}`;
  }
  const badgeEl = trophyEl.querySelector('.dtw-badge');
  if (badgeEl) {
    badgeEl.className = `dtw-badge ${isClaimed ? 'badge-claimed' : (isUnlocked ? 'badge-ready' : 'badge-locked')}`;
    badgeEl.textContent = isClaimed ? '🏆 CLAIMED' : (isUnlocked ? '✨ READY' : '🔒 LOCKED');
  }
}
window.updateDesktopTrophyDisplay = updateDesktopTrophyDisplay;

function handleDesktopTrophyClick() {
  const isClaimed = !!window._awardClaimed;
  const isUnlocked = typeof isPhishingTrophyUnlocked === 'function' && isPhishingTrophyUnlocked();

  if (isClaimed) {
    showPhishingAchievementModal();
    return;
  }

  if (isUnlocked) {
    showPhishingAchievementModal();
    return;
  }

  // Incomplete requirements: deny claim, show dialogue, trigger new phishing email simulation!
  const missing = [];
  if (typeof SN_ACHIEVEMENTS !== 'undefined') {
    SN_ACHIEVEMENTS.forEach(ach => {
      if (!ach.check()) missing.push(ach.label);
    });
  }
  if (typeof showIncompletePhishingClaimDialogue === 'function') {
    showIncompletePhishingClaimDialogue(missing);
  } else if (typeof showToast === 'function') {
    showToast('⚠️ Complete all checklist missions first!', 'warning');
  }
}
window.handleDesktopTrophyClick = handleDesktopTrophyClick;

// Automatically update desktop trophy when checklist changes
(function() {
  const origUpdateChecklist = updateStickyChecklist;
  updateStickyChecklist = function() {
    origUpdateChecklist.apply(this, arguments);
    if (typeof updateDesktopTrophyDisplay === 'function') {
      updateDesktopTrophyDisplay();
    }
  };
})();

// ─── Incomplete Claim Dialogue & Simulated Phishing Email Injection ───────────
function showIncompletePhishingClaimDialogue(missing) {
  // DENIED: Do NOT play reward-claim sound! Keep trophy locked as silhouette.
  let missingItems = [];
  if (Array.isArray(missing) && missing.length > 0) {
    missingItems = missing;
  } else if (typeof SN_ACHIEVEMENTS !== 'undefined') {
    SN_ACHIEVEMENTS.forEach(ach => {
      if (!ach.check()) missingItems.push(ach.label);
    });
  }
  if (missingItems.length === 0) {
    missingItems = ['Complete all remaining checklist missions'];
  }

  const missingListText = missingItems.map(m => `• ${m}`).join('\n');

  // Display dialogue explaining that some missions or evidence are still incomplete
  if (typeof RyanGuide !== 'undefined' && typeof RyanGuide.speak === 'function') {
    RyanGuide.speak([
      {
        text: "Hold on! Your Phishing Investigation Award is still locked. You must complete all checklist missions first.",
        state: 'concerned'
      },
      {
        text: `Here's what you still need to finish:\n${missingListText}\nGlance at your Sticky Notes to check your live progress!`,
        state: 'thinking'
      },
      {
        text: "I sent another case to your Zmail inbox. Open it up and flag those red flags!",
        state: 'speaking'
      }
    ], {
      autoDismiss: 9000
    });
  } else if (typeof showToast === 'function') {
    showToast('⚠️ Claim Denied: Complete all remaining checklist missions first!', 'warning');
  }

  // Trigger the new phishing email simulation in desktop Mail/Inbox
  if (typeof simulateIncomingPhishingEmail === 'function') {
    simulateIncomingPhishingEmail();
  }

  // Open / show Sticky Note so player sees the checklist objectives
  if (typeof showStickyNote === 'function') {
    showStickyNote();
  } else {
    const sNote = document.getElementById('sticky-note');
    if (sNote) sNote.classList.remove('hidden');
  }

  // Ensure desktop trophy reflects locked silhouette state
  if (typeof updateDesktopTrophyDisplay === 'function') {
    updateDesktopTrophyDisplay();
  }
}
window.showIncompletePhishingClaimDialogue = showIncompletePhishingClaimDialogue;

function simulateIncomingPhishingEmail() {
  if (typeof EMAILS === 'undefined' || !Array.isArray(EMAILS)) return;

  const email11 = EMAILS.find(e => e.id === 11);
  if (!email11) return;

  const alreadyHas11 = ch1InboxEmails.some(e => e.id === 11);

  // If email 11 is not in inbox yet, inject it!
  if (!alreadyHas11) {
    ch1InboxEmails.push(email11);
    if (typeof ch1AnimatedEmailIds !== 'undefined' && ch1AnimatedEmailIds.delete) {
      ch1AnimatedEmailIds.delete(11);
    }
  }

  // Also ensure Email 12 (Legitimate clean advisory) is injected if player needs clean email or extra practice
  const email12 = EMAILS.find(e => e.id === 12);
  if (email12 && !ch1InboxEmails.some(e => e.id === 12)) {
    ch1InboxEmails.push(email12);
    if (typeof ch1AnimatedEmailIds !== 'undefined' && ch1AnimatedEmailIds.delete) {
      ch1AnimatedEmailIds.delete(12);
    }
  }

  // Enable mission interaction so player can investigate, flag, and report
  if (typeof gameState !== 'undefined' && gameState) {
    gameState.phase = 'mission';
  }

  // Refresh Zmail inbox UI if open
  if (typeof renderEmailList === 'function') {
    renderEmailList();
  }
  if (typeof updateFolderCounts === 'function') {
    updateFolderCounts();
  }
  if (typeof updateHUD === 'function') {
    updateHUD();
  }

  // Incoming email simulation notification
  if (typeof addSimulationNotification === 'function') {
    addSimulationNotification({
      id: 'notif-zmail-mfa-phish',
      source: 'Zmail',
      icon: '📧',
      iconType: 'mail',
      title: '🚨 New Email: Corporate MFA Security Alert',
      body: 'URGENT: IT Security Operations — Your workstation MFA token requires immediate re-synchronization. Click to inspect in Zmail.',
      time: 'Just now',
      app: 'gmail',
      emailId: 11
    }, true);
  }

  // Play realistic incoming email sound
  if (typeof AudioManager !== 'undefined' && typeof AudioManager.playNotification === 'function') {
    try { AudioManager.playNotification(); } catch (e) {}
  }

  // Show toast notification
  if (typeof showToast === 'function') {
    showToast('📧 New incoming email: Corporate MFA Security Alert arrived in Zmail!', 'warning');
  }

  // Red border highlight on Zmail desktop icon and taskbar removed per design.

  // Update desktop trophy display to reflect locked state
  if (typeof updateDesktopTrophyDisplay === 'function') {
    updateDesktopTrophyDisplay();
  }
}
window.simulateIncomingPhishingEmail = simulateIncomingPhishingEmail;

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      loadPhishingProgress();
      if (typeof updateDesktopTrophyDisplay === 'function') updateDesktopTrophyDisplay();
    });
  } else {
    loadPhishingProgress();
    if (typeof updateDesktopTrophyDisplay === 'function') updateDesktopTrophyDisplay();
  }
}

window.showPhishingAchievementModal = showPhishingAchievementModal;
