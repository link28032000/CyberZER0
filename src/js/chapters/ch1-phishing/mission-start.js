'use strict';



// ═══════════════════════════════════════════════════════════
// MISSION
// ═══════════════════════════════════════════════════════════

function startMission(openGmail = false) {
  gameState.phase = 'mission';
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

  // ── Chapter 1 dynamic inbox reset ──────────────────────────
  ch1InboxEmails               = [];    // Dynamic inbox
  ch1AnimatedEmailIds.clear();
  ch1Stage                     = 0;     
  ch1PendingNotification       = false; 
  ch1MistakeCount              = 0;
  ch1InvestigationTutorialDone = false; // Reset investigation tutorial flag
  ch1CloserLookWarnedOnce      = false; // Reset closer look warning tracker
  const tbNotesInit = document.getElementById('taskbar-notes');
  if (tbNotesInit) {
    tbNotesInit.classList.remove('btn-pulse-highlight');
  }
  window._stickyNotesHighlightDismissed = false;
  window._phoneLinkHighlightDismissed = false;
  window._ryanFirstEmailSpoken = false;

  // ── Clear any saved pretest result so it always runs fresh ──
  if (typeof RyanPretest !== 'undefined' && RyanPretest.reset) RyanPretest.reset();

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

  // Always hide Ch2-only desktop icons during Chapter 1
  document.querySelectorAll('.ch2-only').forEach(el => {
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
        { text: "Hi there! 👋 I'm Ryan, your cybersecurity mentor here at Technical Solutions. Welcome to the team, I'm really glad you're here.", state: 'speaking' },
        { text: "Before we dive in, I'd like to know where you're starting from. That way I can guide you at a pace that feels right for you.", state: 'speaking' },
        { text: "So I've put together a short pre-test: twenty quick questions about staying safe online.", state: 'thinking' },
        { text: "There's no pass or fail, and nobody is judging you. If you're not sure about one, just pick your best guess. Honest answers help me the most.", state: 'speaking' },
        { text: "Take your time and breathe. Whenever you're ready, let's begin!", state: 'success', label: 'TAP TO BEGIN' }
      ];

      // What Ryan says right after the result screen, by score tier
      var ryanReactions = {
        perfect: [
          { text: "Twenty out of twenty! Wow, that is really impressive.", state: 'success' },
          { text: "You clearly know your stuff already. I will still walk you through how attackers think, because the best defenders never stop learning.", state: 'speaking' }
        ],
        great: [
          { text: "Great job! You already know a good amount, and that is a solid start.", state: 'success' },
          { text: "A few things might still feel a bit unclear, and that is perfectly fine. We will work through them together.", state: 'speaking' }
        ],
        ok: [
          { text: "Nice work. You have a good base to build on.", state: 'success' },
          { text: "Some of these topics might be new to you, and that is exactly why I am here. We will go step by step, no rush at all.", state: 'speaking' }
        ],
        low: [
          { text: "Thank you for being honest. That is exactly what this test is for.", state: 'speaking' },
          { text: "This score is just your starting point, not a measure of what you can do. Everyone begins somewhere.", state: 'speaking' },
          { text: "Stay curious and keep at it, and you will be surprised how fast things click. I will be right here with you.", state: 'success' }
        ]
      };

      var ryanIntroPart2 = [
        // === Bridge from the pre-test into the lesson ===
        { text: "Here is an important idea: cyber threats are not always about complicated technology.", state: 'thinking' },
        { text: "Attackers often go after people directly, using trust, urgency, fear, curiosity, or plain deception.", state: 'concerned' },
        // === Common Threats ===
        { text: "Remember the very first question on the test? Phishing. An attacker pretends to be someone you trust and tries to get you to click a link, open a file, or give away information.", state: 'speaking' },
        { text: "Vishing is voice phishing. An attacker might call you pretending to be IT support, your manager, a bank, or someone else you trust.", state: 'speaking' },
        { text: "Smishing is phishing through text messages or SMS.", state: 'speaking' },
        { text: "Attackers also use malicious attachments, fake websites, impersonation, social engineering, and stolen passwords.", state: 'concerned' },
        // === Why It Matters ===
        { text: "Your account and your choices can affect more than just you.", state: 'thinking' },
        { text: "One successful attack could expose company information, customer data, employee accounts, or important business systems.", state: 'concerned' },
        { text: "Cybersecurity is not only an IT thing. Everyone has a role in keeping the organization safe.", state: 'speaking' },
        { text: "Your awareness can help protect you, your coworkers, and the whole organization.", state: 'success' },
        // === STOP → CHECK → VERIFY → ACT ===
        { text: "Whenever something feels off, remember four simple steps. They cover most of the situations you will face.", state: 'thinking' },
        { text: "STOP before reacting.", state: 'speaking' },
        { text: "CHECK the details.", state: 'speaking' },
        { text: "VERIFY through a trusted method.", state: 'speaking' },
        { text: "Then ACT safely.", state: 'speaking' },
        { text: "Do not let urgency make the decision for you.", state: 'concerned' },
        // === Transition to Zmail ===
        { text: "Now let's put that to the test.", state: 'speaking' },
        { text: "Open Zmail to start going through the incoming cases. You can also check your Detective's Notes on the desktop anytime for tips and your checklist.", state: 'thinking' }
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
    }, 3000);
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
  if (typeof RyanGuide !== 'undefined' && RyanGuide.dismiss) {
    RyanGuide.dismiss();
  }

  // Set phase and desktop background
  gameState.phase = chapterId;
  updateDesktopBackgroundForPhase(chapterId);

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
  if (hudEl) hudEl.classList.remove('hidden');

  // Keep Chapter profile in sync
  updateLoginScreenForChapter(chapterId);
  if (typeof initChapterMissionNotifications === 'function') initChapterMissionNotifications(chapterId, false);

  // Show Ch2-only desktop icons in Chapter 2+, hide them in Chapter 1
  const isCh2Plus = (chapterId === 'malware' || chapterId === 'social-engineering' || chapterId === 'social_engineering' || chapterId === 'ransomware');
  document.querySelectorAll('.ch2-only').forEach(el => {
    el.style.setProperty('display', isCh2Plus ? 'flex' : 'none', 'important');
  });
}
