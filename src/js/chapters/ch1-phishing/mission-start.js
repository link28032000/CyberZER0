'use strict';



// ═══════════════════════════════════════════════════════════
// ZMAIL INTERFACE COMPLETE CLEANUP & RESET
// ═══════════════════════════════════════════════════════════

function resetCh1ZmailInterface() {
  // 1. Clear active investigation timers & auto-advance timeouts
  if (typeof ch1AutoAdvanceTimer !== 'undefined' && ch1AutoAdvanceTimer) {
    clearTimeout(ch1AutoAdvanceTimer);
    ch1AutoAdvanceTimer = null;
  }
  if (typeof placeFlag !== 'undefined' && placeFlag && placeFlag._ryanTimer) {
    clearTimeout(placeFlag._ryanTimer);
    placeFlag._ryanTimer = null;
  }
  if (window._ryanMissionIntroTimer) {
    clearTimeout(window._ryanMissionIntroTimer);
    window._ryanMissionIntroTimer = null;
  }

  // 2. Clear PhishTutorial
  if (typeof PhishTutorial !== 'undefined' && PhishTutorial.reset) {
    PhishTutorial.reset();
  }

  // 3. Clear all flagging state in gameState
  if (typeof gameState !== 'undefined') {
    gameState.flagModeActive = false;
    gameState.flagBtnFirstEmailBlinked = false;
    gameState.currentEmailFlags = [];
    gameState.pendingLinkUrl = null;
    gameState.pendingLinkFlagId = null;
    gameState.pendingLinkFlagType = null;
  }

  // 4. Reset Zmail views back to Inbox list view
  const listView = document.getElementById('email-list-view');
  const detailView = document.getElementById('email-detail-view');
  const sentView = document.getElementById('sent-detail-view');
  if (listView) listView.classList.add('active');
  if (detailView) detailView.classList.remove('active');
  if (sentView) sentView.classList.remove('active');

  // Reset folder navigation tabs
  const navInbox = document.getElementById('nav-inbox');
  const navSent = document.getElementById('nav-sent');
  const navTrash = document.getElementById('nav-trash');
  if (navInbox) navInbox.classList.add('active');
  if (navSent) navSent.classList.remove('active');
  if (navTrash) navTrash.classList.remove('active');

  const titleEl = document.getElementById('gmail-toolbar-title');
  if (titleEl) titleEl.textContent = 'Inbox';

  // 5. Clean up buttons and controls in Zmail (remove all blinking and active classes)
  const flagBtn = document.getElementById('flag-mode-btn');
  if (flagBtn) {
    flagBtn.classList.remove('active', 'btn-pulse-highlight', 'tutorial-flag-blink', 'phish-tutorial-highlight');
    flagBtn.disabled = false;
    flagBtn.title = '';
    flagBtn.style.display = '';
  }

  const reportBtn = document.getElementById('report-btn');
  if (reportBtn) {
    reportBtn.classList.remove('btn-pulse-highlight', 'verdict-btn-highlight');
    reportBtn.disabled = false;
    reportBtn.title = 'Flag and submit as Phishing';
    reportBtn.style.display = '';
  }

  const legitBtn = document.getElementById('legit-btn');
  if (legitBtn) {
    legitBtn.classList.remove('btn-pulse-highlight', 'verdict-btn-highlight');
    legitBtn.disabled = false;
    legitBtn.title = 'Confirm and submit as Non-phishing';
    legitBtn.style.display = '';
  }

  const verdictGroup = document.querySelector('.verdict-btn-group');
  if (verdictGroup) verdictGroup.style.display = '';

  const ch2Action = document.getElementById('ch2-toolbar-action');
  if (ch2Action) ch2Action.style.display = 'none';

  const gmailBody = document.querySelector('.gmail-body');
  if (gmailBody) gmailBody.classList.remove('flag-mode-active');

  const emailContent = document.getElementById('email-content');
  if (emailContent) emailContent.innerHTML = '';

  // Clear any tutorial callout / highlights inside Zmail or document
  const callout = document.getElementById('ptt-inline-callout');
  if (callout) callout.remove();
  document.querySelectorAll('.phish-tutorial-highlight').forEach(el => {
    el.classList.remove('phish-tutorial-highlight');
  });

  // 6. Reset badges
  const inboxCount = document.getElementById('inbox-count');
  if (inboxCount) {
    inboxCount.textContent = '0';
    inboxCount.classList.add('hidden-init');
  }
  const trashCount = document.getElementById('trash-count');
  if (trashCount) {
    trashCount.textContent = '0';
    trashCount.classList.add('hidden-init');
  }
  const sentCount = document.getElementById('sent-count');
  if (sentCount) {
    sentCount.textContent = '2';
    sentCount.classList.remove('hidden-init');
  }

  // 7. Remove any pulse or attention classes from icons and taskbar
  const iconG = document.getElementById('icon-gmail');
  if (iconG) iconG.classList.remove('icon-attention', 'btn-pulse-highlight');
  const taskbarGmail = document.getElementById('taskbar-gmail');
  if (taskbarGmail) taskbarGmail.classList.remove('btn-pulse-highlight');

  const iconNotes = document.getElementById('icon-notes');
  if (iconNotes) iconNotes.classList.remove('icon-attention', 'btn-pulse-highlight');
  const taskbarNotes = document.getElementById('taskbar-notes');
  if (taskbarNotes) taskbarNotes.classList.remove('btn-pulse-highlight');

  const iconComms = document.getElementById('icon-comms');
  if (iconComms) iconComms.classList.remove('icon-attention', 'btn-pulse-highlight');
  const taskbarComms = document.getElementById('taskbar-comms');
  if (taskbarComms) taskbarComms.classList.remove('btn-pulse-highlight');

  const startBtn = document.getElementById('start-btn');
  if (startBtn) startBtn.classList.remove('start-attention', 'btn-pulse-highlight', 'active');
  const powerBtn = document.getElementById('start-power-btn');
  if (powerBtn) powerBtn.classList.remove('power-attention');

  const stickyNote = document.getElementById('sticky-note');
  if (stickyNote) stickyNote.classList.remove('highlight-attention');

  if (typeof IconAttention !== 'undefined' && IconAttention.hideAll) {
    IconAttention.hideAll();
  }
}
window.resetCh1ZmailInterface = resetCh1ZmailInterface;

// ═══════════════════════════════════════════════════════════
// MISSION
// ═══════════════════════════════════════════════════════════

function startMission(openGmail = false) {
  gameState.phase = 'mission';
  window._currentChapterCategory = 'phishing';
  gameState.currentEmail = 0;
  gameState.score = 0;
  gameState.correctDecisions = 0;
  gameState.phishingDetected = 0;
  gameState.legitimateDetected = 0;
  gameState.evidenceFoundTotal = 0;
  gameState.emailResults = [];
  gameState.currentFolder = 'inbox';
  gameState.trashedSentIds = [];
  gameState.readSentIds = [];
  gameState.flagBtnFirstEmailBlinked = false;
  gameState.flagModeActive = false;
  gameState.currentEmailFlags = [];
  gameState.pendingLinkUrl = null;
  gameState.pendingLinkFlagId = null;
  gameState.pendingLinkFlagType = null;
  gameState.selectedFolderFileId = null;
  gameState.activeScanFileId = null;

  // ── Reset Zmail interface completely (removes all blinking animations & views) ──
  resetCh1ZmailInterface();

  // ── Chapter 1 dynamic inbox reset ──────────────────────────
  ch1InboxEmails               = [];    // Dynamic inbox
  ch1AnimatedEmailIds.clear();
  ch1Stage                     = 0;     
  ch1PendingNotification       = false; 
  ch1MistakeCount              = 0;
  ch1InvestigationTutorialDone = false; // Reset investigation tutorial flag
  ch1CloserLookWarnedOnce      = false; // Reset closer look warning tracker
  window._ch1CloserLookDialogueShown = false;
  window._downloadAttachmentWarnedOnce = false;
  ch1FlaggedLegitWarnedOnce    = false;
  ch1SecondEmailNotesHintDone  = false;
  window._stickyHintShownOnce  = false;
  if (typeof _stickyHintShownOnce !== 'undefined') _stickyHintShownOnce = false;
  if (typeof isSubmittingReport !== 'undefined') isSubmittingReport = false;

  const tbNotesInit = document.getElementById('taskbar-notes');
  if (tbNotesInit) {
    tbNotesInit.classList.remove('btn-pulse-highlight');
  }
  window._stickyNotesHighlightDismissed = false;
  window._phoneLinkHighlightDismissed = true;
  if (typeof unhighlightPhoneLinkApp === 'function') unhighlightPhoneLinkApp();
  window._ryanFirstEmailSpoken = false;

  // ── Mission / First Checklist: Award is NOT claimed yet, Phone Link is empty ──
  window._awardClaimed = false;
  window._postAwardPostTestDialogueFired = false;
  window._hasTriggeredPostTestSave = false;
  window._awaitingShutdownForChapter2 = false;
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

  try {
    localStorage.removeItem('cyberzero_phishing_progress');
  } catch(e) {}
  try {
    localStorage.removeItem('cyberzero_newbie_gc_state');
  } catch(e) {}

  if (typeof _achievementUnlocked !== 'undefined' && _achievementUnlocked.clear) _achievementUnlocked.clear();
  if (typeof _phishingEarnedAward !== 'undefined') _phishingEarnedAward = null;
  if (typeof _trophyUnlockedDate !== 'undefined') _trophyUnlockedDate = null;

  // ── Reset Browser tabs & notifications ──
  if (typeof initBrowserTabs === 'function') initBrowserTabs();
  if (typeof updateBrowserPhishingNotice === 'function') updateBrowserPhishingNotice(false);

  // ── Reset Phone Link GC state ──
  if (typeof resetPhoneLinkChat === 'function') resetPhoneLinkChat();

  // ── Clear any saved pretest & mentor guide result so it always runs fresh ──
  if (typeof RyanPretest !== 'undefined' && RyanPretest.reset) RyanPretest.reset();
  if (typeof RyanGuide !== 'undefined' && RyanGuide.reset) RyanGuide.reset();

  // ── Inbox starts EMPTY — emails are injected after Ryan's full dialogue ends ──

  hideAllOverlays(true);
  const desktop = document.getElementById('desktop');
  if (desktop) {
    desktop.style.visibility = 'visible';
    desktop.style.opacity = '1';
  }
  renderEmailList();
  updateHUD();
  updateFolderCounts();
  updateAppLockStates();
  if (typeof initChapterMissionNotifications === 'function') initChapterMissionNotifications('phishing', false);

  // Always hide Ch2-only and Ch3-only desktop icons during Chapter 1
  document.querySelectorAll('.ch2-only, .ch3-only, .ch2-not-ch3').forEach(el => {
    el.style.setProperty('display', 'none', 'important');
  });

  const hudEl = document.getElementById('hud');
  if (hudEl) hudEl.classList.remove('hidden');

  // Close all open apps so the desktop starts completely clean
  ['gmail', 'browser', 'folder', 'antivirus', 'comms', 'ransomware', 'wifi-settings', 'docviewer', 'imageviewer', 'videoplayer'].forEach(a => {
    if (typeof appState !== 'undefined' && appState[a]) {
      appState[a].open = false;
      appState[a].minimized = false;
      appState[a].maximized = false;
      appState[a].hasBeenPositioned = false;
    }
    const w = document.getElementById(`win-${a}`);
    if (w) {
      w.classList.add('hidden');
      w.classList.remove('maximized', 'focused', 'minimized');
      w.style.left = '';
      w.style.top = '';
    }
  });
  if (typeof updateTaskbar === 'function') updateTaskbar();

  closeStickyNote();

  // ── Ryan full awareness lesson — starts after desktop appears ──
  if (window._ryanMissionIntroTimer) {
    clearTimeout(window._ryanMissionIntroTimer);
    window._ryanMissionIntroTimer = null;
  }
  if (typeof RyanGuide !== 'undefined') {
    window._ryanMissionIntroTimer = setTimeout(function() {
      if (gameState.phase !== 'mission') return;
      // Ryan's intro is calm and friendly, and is written to lead straight
      // into the 20-question pre-test. After the test he reacts to the score
      // (see RYAN_PRETEST_REACTIONS) and then bridges into the lesson.
      var ryanIntroPart1 = [
        { text: "Hi there. I'm Ryan, your IT support mentor here at Technical Solutions. Welcome to the team! I'm glad you're here.", state: 'speaking' },
        { text: "Before we dive in, I want to get a sense of what you already know so I can guide you at the right pace.", state: 'speaking' },
        { text: "I've put together twenty quick questions on common online threats to establish your baseline.", state: 'thinking' },
        { text: "There's no pass or fail, and nobody is judging you. If you're unsure about an answer, just make your best guess. Honest answers help us most.", state: 'speaking' },
        { text: "Take your time and breathe. Whenever you're ready, let's begin.", state: 'success', label: "Let's Begin" }
      ];

      // What Ryan says right after the result screen, by score tier
      var ryanReactions = {
        perfect: [
          { text: "Twenty out of twenty! Outstanding work.", state: 'success' },
          { text: "You clearly have strong security instincts already. We will still explore how attackers operate in practice, because the best defenders always stay sharp.", state: 'speaking' }
        ],
        great: [
          { text: "Great job! You have a solid grasp of cybersecurity basics.", state: 'success' },
          { text: "A few tricky scenarios might still need fine-tuning, and that is completely normal. We will work through them together.", state: 'speaking' }
        ],
        ok: [
          { text: "Good effort on the pretest. You have a workable foundation to build on.", state: 'success' },
          { text: "Some of these concepts may be brand new to you, and that is exactly why I'm here. We will take everything step by step.", state: 'speaking' }
        ],
        low: [
          { text: "Thank you for answering honestly. That is exactly what this pretest is designed for.", state: 'speaking' },
          { text: "This score is just a starting baseline, not a reflection of your potential. Everyone begins somewhere.", state: 'speaking' },
          { text: "Stay curious, and you will be surprised how quickly everything starts to make sense. I'll be right beside you the whole way.", state: 'success' }
        ]
      };

      var ryanIntroPart2 = [
        // === Bridge from the pre-test into the lesson ===
        { text: "Here is an important takeaway: cyber threats are rarely just about complex code or hacking tools.", state: 'thinking' },
        { text: "Attackers usually target people directly, exploiting trust, urgency, fear, or simple curiosity.", state: 'concerned' },
        // === Common Threats ===
        { text: "That brings us to phishing. An attacker impersonates a trusted entity to lure you into clicking a link, downloading a file, or sharing credentials.", state: 'speaking' },
        { text: "When they attempt this through phone calls, it is called vishing. When it arrives through text messages, it is smishing.", state: 'speaking' },
        { text: "Beyond fraudulent messages, attackers deploy weaponized attachments, spoofed login portals, and social engineering ploys.", state: 'concerned' },
        // === Why It Matters ===
        { text: "Your daily decisions have a real impact on our security perimeter.", state: 'thinking' },
        { text: "A single compromised login can expose company records, client data, and internal networks.", state: 'concerned' },
        { text: "Cybersecurity is not just an IT department task. Every team member serves as an active defender.", state: 'speaking' },
        { text: "Your vigilance helps keep you, your teammates, and the entire organization safe.", state: 'success' },
        // === STOP → CHECK → VERIFY → ACT ===
        { text: "Whenever an email or message feels slightly unusual, remember four simple steps.", state: 'thinking' },
        { text: "First, STOP before reacting. Never let manufactured urgency force a hasty decision.", state: 'speaking' },
        { text: "Second, CHECK the details. Inspect sender addresses, hover over links, and verify the context.", state: 'speaking' },
        { text: "Third, VERIFY through an official, independent channel if anything seems off.", state: 'speaking' },
        { text: "Fourth, ACT safely by reporting confirmed threats to IT.", state: 'speaking' },
        // === Transition to Zmail ===
        { text: "Now, let's put these principles into practice.", state: 'speaking' },
        { text: "Open Zmail on your desktop to begin reviewing incoming cases. You can also refer to your Sticky Notes anytime for tips and your checklist.", state: 'thinking' }
      ];

      var ryanFinishLesson = function() {
        if (gameState.phase !== 'mission') return;
        // Release the main-flow lock so reactive app-open dialogues work after this
        if (typeof RyanGuide !== 'undefined' && RyanGuide.releaseMainFlow) RyanGuide.releaseMainFlow();
        // ch1InjectWave calls renderEmailList + updateFolderCounts internally
        if (ch1InboxEmails.length === 0) {
          ch1InjectWave(1);
        }
        if (typeof IconAttention !== 'undefined') IconAttention.show('gmail');
      };

      // Pre-test always runs — Ryan reacts to the actual score, then continues with the lesson.
      var ryanContinueLesson = function(result, info) {
        if (gameState.phase !== 'mission') return;
        // Release the main-flow lock — pretest is done, gameplay dialogues must work freely
        if (typeof RyanGuide !== 'undefined' && RyanGuide.releaseMainFlow) RyanGuide.releaseMainFlow();
        var key = null;
        if (result && typeof RyanPretest !== 'undefined') {
          key = RyanPretest.tierOf(result);
        }
        var reaction = key && ryanReactions[key] ? ryanReactions[key] : [];
        RyanGuide.speak(reaction.concat(ryanIntroPart2), { mainFlow: true, onDone: ryanFinishLesson });
      };

      RyanGuide.speak(ryanIntroPart1, {
        mainFlow: true,
        moreAfter: true,
        onDone: function() {
          if (gameState.phase !== 'mission') return;
          if (typeof RyanPretest !== 'undefined') {
            RyanPretest.launch(ryanContinueLesson);
          } else {
            ryanContinueLesson(null);
          }
        }
      });
    }, 2000);
  }

  if (openGmail) {
    openApp('gmail');
    updateStickyNoteForPhase('phishing');
    // Sticky note opens manually — do NOT auto-open here
  }
}

/**

 * Opens a clean desktop view for Chapter 2, Chapter 3, or Chapter 4 with NO mission.
 * Ensures no mission popups, no demo overlays, and Ryan mentor guide is disabled (only Chapter 1 has Ryan).
 */
function openChapterDesktopDirect(chapterId) {
  closeCategoryHub();
  hideAllOverlays();
  if (chapterId === 'phishing') {
    if (typeof RyanGuide !== 'undefined' && RyanGuide.reset) {
      RyanGuide.reset();
    } else if (typeof RyanGuide !== 'undefined' && RyanGuide.dismiss) {
      RyanGuide.dismiss(true);
    }
    if (typeof resetCh1ZmailInterface === 'function') {
      resetCh1ZmailInterface();
    }
  } else if (chapterId === 'malware') {
    if (typeof RyanGuide !== 'undefined' && RyanGuide.reset) {
      RyanGuide.reset();
    } else if (typeof RyanGuide !== 'undefined' && RyanGuide.dismiss) {
      RyanGuide.dismiss(true);
    }
  } else {
    if (window._ryanCh2IntroTimer) {
      clearTimeout(window._ryanCh2IntroTimer);
      window._ryanCh2IntroTimer = null;
    }
    if (typeof RyanGuide !== 'undefined' && RyanGuide.dismiss) {
      RyanGuide.dismiss(true);
    }
  }

  // Set phase and desktop background
  gameState.phase = chapterId;
  window._currentChapterCategory = chapterId;
  updateDesktopBackgroundForPhase(chapterId);

  // Clear any Chapter 1 logoff / start menu blinking notice on Chapter 2+ desktop
  if (chapterId !== 'phishing') {
    if (typeof window.clearWorkstationLogoffGuide === 'function') {
      window.clearWorkstationLogoffGuide();
    } else {
      window._awaitingShutdownForChapter2 = false;
      const startBtn = document.getElementById('start-btn');
      if (startBtn) startBtn.classList.remove('start-attention', 'btn-pulse-highlight', 'active');
      const powerBtn = document.getElementById('start-power-btn');
      if (powerBtn) powerBtn.classList.remove('power-attention');
      const shutdownBtn = document.querySelector("#start-power-dropdown button[onclick*='shutdown']");
      if (shutdownBtn) shutdownBtn.classList.remove('power-item-attention');
    }
  }

  // Close all app windows to ensure completely clean desktop view
  ['gmail', 'browser', 'folder', 'antivirus', 'comms', 'ransomware', 'wifi-settings', 'docviewer', 'imageviewer', 'videoplayer', 'taskmanager', 'scanner'].forEach(a => {
    if (typeof appState !== 'undefined' && appState[a]) {
      appState[a].open = false;
      appState[a].minimized = false;
      appState[a].maximized = false;
      appState[a].hasBeenPositioned = false;
    }
    const w = document.getElementById(`win-${a}`);
    if (w) {
      w.classList.add('hidden');
      w.classList.remove('maximized', 'focused', 'minimized');
      w.style.left = '';
      w.style.top = '';
    }
  });

  if (typeof updateTaskbar === 'function') updateTaskbar();
  closeStickyNote();

  // Make desktop visible cleanly
  const desktop = document.getElementById('desktop');
  if (desktop) {
    desktop.style.visibility = 'visible';
    desktop.style.opacity = '1';
  }

  // HUD
  const hudEl = document.getElementById('hud');
  if (hudEl) {
    if (chapterId === 'malware') {
      hudEl.classList.add('hidden');
    } else {
      hudEl.classList.remove('hidden');
    }
  }

  // Keep Chapter profile in sync
  updateLoginScreenForChapter(chapterId);
  if (typeof initChapterMissionNotifications === 'function') initChapterMissionNotifications(chapterId, false);

  // Show/hide chapter-specific desktop icons
  const isCh2 = (chapterId === 'malware' || chapterId === 'ch2' || chapterId === 2);
  const isCh3 = (chapterId === 'social-engineering' || chapterId === 'social_engineering' || chapterId === 'social' || chapterId === 'ch3' || chapterId === 3);
  const isCh2Plus = isCh2 || isCh3 || (chapterId === 'ransomware' || chapterId === 'ch4' || chapterId === 4);

  // Column 3 container: visible in Chapter 2, Chapter 3, etc.
  document.querySelectorAll('.ch2-only').forEach(el => {
    el.style.setProperty('display', isCh2Plus ? 'flex' : 'none', 'important');
  });
  // Gaming icons (Steam, GTA 6, Games): hidden in Chapter 3 only (visible in Chapter 2)
  document.querySelectorAll('.ch2-not-ch3').forEach(el => {
    el.style.setProperty('display', (isCh2Plus && !isCh3) ? 'flex' : 'none', 'important');
  });
  // Chapter 3 apps (Instagram, Pictures): visible in Chapter 3 only
  document.querySelectorAll('.ch3-only').forEach(el => {
    el.style.setProperty('display', isCh3 ? 'flex' : 'none', 'important');
  });
}
