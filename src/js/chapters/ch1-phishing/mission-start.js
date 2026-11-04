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
  window._phishClueWarnedOnce  = false;
  window._phishAutoModalShown  = false;
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
  if (typeof updateDesktopTrophyDisplay === 'function') updateDesktopTrophyDisplay();

  // Always hide Ch2-only, Ch3-only, and Ch4-only desktop icons during Chapter 1
  document.querySelectorAll('.ch2-only, .ch3-only, .ch4-only, .ch2-not-ch3').forEach(el => {
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
  { text: "Hey Alex! Welcome to Technical Solutions!. I'm Ryan, your IT support mentor. It's your first day as our new intern, right? Glad to have you on board!", state: 'speaking' },
  { text: "Before we get started with your tasks, I'd like you to take a short pre-test about cybersecurity. It's just to see what you already know about online threats and scams.", state: 'speaking' },
  { text: "Don't worry, Alex. This isn't a graded exam, so there's no pressure to get everything right. Just answer based on what you know.", state: 'thinking' },
  { text: "Ready for your first activity? Let's see what you've got!", state: 'success', label: "Let's Begin" }
];
var ryanReactions = {
  perfect: [
    { text: "Wow, Alex! 20 out of 20! That's impressive. Looks like you already know your way around cybersecurity!", state: 'success' },
    { text: "Great job! Now let's see how you handle some real situations. Things can get a little tricky from here!", state: 'speaking' }
  ],
  great: [
    { text: "Nice work, Alex! You've got a pretty good understanding of online safety.", state: 'success' },
    { text: "You missed a few tricky ones, but that's okay. We'll go over those as we work through your training.", state: 'speaking' }
  ],
  ok: [
    { text: "Not bad, Alex! You've got the basics down, and that's a good start.", state: 'success' },
    { text: "There are still a few things to learn, but don't worry. I'll help you get better at spotting online threats.", state: 'speaking' }
  ],
  low: [
    { text: "Hey, Alex, don't let the score get you down. It's your first day, after all!", state: 'speaking' },
    { text: "You're here to learn, and that's what matters. We'll take it one step at a time, and I'll help you spot those threats along the way.", state: 'success' }
  ]
};

    var ryanIntroPart2 = [
  // === Bridge from the pre-test into the lesson ===
  { text: "So, Alex, here's something you should know. Hackers don't always use complicated tricks to break into systems. Sometimes, they just trick people into giving away important information.", state: 'thinking' },
  { text: "They might send messages that make you panic, rush into something, or get excited about winning a free prize. That's how they catch people off guard.", state: 'concerned' },

  // === Common Threats ===
  { text: "One common trick is called <strong>Phishing</strong>. Scammers pretend to be someone you trust, like a bank, a company, or even a coworker, just to steal your information.", state: 'speaking' },
  { text: "They can also use phone calls. That's called <strong>Vishing</strong>. When they do it through text messages, it's called <strong>Smishing</strong>. Different methods, but the same goal: to trick you.", state: 'speaking' },
  { text: "Be careful with links and login pages, too. Some fake websites look almost exactly like the real ones. They can even contain harmful files called <strong>Malware</strong>.", state: 'concerned' },

  // === Why It Matters ===
  { text: "Here's why this matters, Alex. Imagine someone in this office clicks a dangerous link. It could put their computer and even the company's network at risk.", state: 'thinking' },
  { text: "That's why we need you to stay alert. As part of the team, you can help keep our systems and everyone's information safe.", state: 'success' },

  // === STOP → CHECK → VERIFY → ACT ===
  { text: "Now, whenever you receive a suspicious email, remember these four simple steps. They'll help you make safer decisions.", state: 'thinking' },
  { text: "<strong>1. STOP:</strong> Don't rush to click anything. Take a moment to think.", state: 'speaking' },
  { text: "<strong>2. CHECK:</strong> Look at the sender's email address, check the links, and watch out for spelling mistakes.", state: 'speaking' },
  { text: "<strong>3. VERIFY:</strong> If something seems suspicious, contact the person or company through their official channels. You can also ask the IT team.", state: 'speaking' },
  { text: "<strong>4. ACT:</strong> If you confirm that the email is suspicious, report it to the IT team. Never click the links or share your information.", state: 'speaking' },

  // === Transition to Zmail ===
  { text: "Alright, Alex! That's enough for our little lesson. Let's put what you've learned into practice.", state: 'speaking' },
  { text: "Open <strong>Zmail</strong> on your desktop. You'll find your first set of emails there. Don't forget to check your <strong>Sticky Notes</strong> for your mission goals and helpful reminders!", state: 'success' }
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
    window._ch2ChecklistUnlocked = false;
    if (typeof closeStickyNote === 'function') closeStickyNote();
    const sNote = document.getElementById('sticky-note');
    if (sNote) {
      sNote.classList.add('hidden');
      sNote.classList.remove('highlight-attention');
      const sScroll = sNote.querySelector('.sticky-note-scroll');
      if (sScroll) sScroll.innerHTML = '';
    }
    const notesIcon = document.getElementById('icon-notes');
    if (notesIcon) notesIcon.classList.remove('icon-attention', 'btn-pulse-highlight');
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
      const shutdownBtn = document.getElementById("start-shutdown-btn") || document.querySelector("#start-power-dropdown button[onclick*='shutdown']");
      if (shutdownBtn) shutdownBtn.classList.remove('power-item-attention');
    }
  }

  // Close all app windows to ensure completely clean desktop view
  ['gmail', 'browser', 'folder', 'antivirus', 'comms', 'ransomware', 'wifi-settings', 'docviewer', 'imageviewer', 'videoplayer', 'taskmanager', 'scanner', 'control-panel'].forEach(a => {
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
  const isCh4 = (chapterId === 'ransomware' || chapterId === 'ch4' || chapterId === 4);
  const isCh2Plus = isCh2 || isCh3 || isCh4;

  // Column 3 container: visible in Chapter 2, Chapter 3, Chapter 4
  document.querySelectorAll('.ch2-only').forEach(el => {
    el.style.setProperty('display', isCh2Plus ? 'flex' : 'none', 'important');
  });
  // Gaming icons (Steam, GTA 6, Games): hidden in Chapter 3 and 4 (visible in Chapter 2)
  document.querySelectorAll('.ch2-not-ch3').forEach(el => {
    el.style.setProperty('display', (isCh2Plus && !isCh3 && !isCh4) ? 'flex' : 'none', 'important');
  });
  // Chapter 3 apps (Instagram, Pictures): visible in Chapter 3 only
  document.querySelectorAll('.ch3-only').forEach(el => {
    el.style.setProperty('display', isCh3 ? 'flex' : 'none', 'important');
  });
  // Chapter 4 apps (Ransomware Console): visible in Chapter 4 only
  document.querySelectorAll('.ch4-only').forEach(el => {
    el.style.setProperty('display', isCh4 ? 'flex' : 'none', 'important');
  });
}
