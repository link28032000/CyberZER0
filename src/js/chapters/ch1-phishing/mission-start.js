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
  window._ryanFirstEmailSpoken = false;

  // Immediately inject Wave 1 so the first email is ready in the inbox without requiring notes first
  ch1InjectWave(1);

  hideAllOverlays(true);
  const desktop = document.getElementById('desktop');
  if (desktop) {
    desktop.style.visibility = 'visible';
    desktop.style.opacity = '1';
  }
  renderEmailList();
  updateHUD();
  updateFolderCounts();        // Will show (1) notification
  updateAppLockStates();
  if (typeof initChapterMissionNotifications === 'function') initChapterMissionNotifications('phishing', false);

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
      RyanGuide.speak([
        // === Introduction ===
        { text: "Hi! 👋 I'm Ryan, your cybersecurity mentor here at Technical Solutions — it's great to have you on board!", state: 'speaking' },
        { text: "Before we get started, let's explore why cybersecurity matters to everyone here.", state: 'speaking' },
        { text: "Cyber threats aren't always about complicated technology.", state: 'thinking' },
        { text: "Attackers often target people using trust, urgency, fear, curiosity, or deception.", state: 'concerned' },
        // === Common Threats ===
        { text: "First, there's phishing. An attacker pretends to be someone you trust and tries to get you to click a link, open a file, or reveal information.", state: 'speaking' },
        { text: "Vishing is voice phishing. An attacker may call pretending to be IT support, your manager, a bank, or another trusted person.", state: 'speaking' },
        { text: "Smishing is phishing through text messages or SMS.", state: 'speaking' },
        { text: "Attackers can also use malicious attachments, fake websites, impersonation, social engineering, and stolen passwords.", state: 'concerned' },
        // === Why It Matters ===
        { text: "Your account and your decisions can affect more than just you.", state: 'thinking' },
        { text: "One successful attack could expose company information, customer data, employee accounts, or important business systems.", state: 'concerned' },
        { text: "Cybersecurity isn't only an IT responsibility. Everyone has a role in keeping the organization safe.", state: 'speaking' },
        { text: "Your awareness can help protect you, your coworkers, and the entire organization.", state: 'success' },
        // === STOP → CHECK → VERIFY → ACT ===
        { text: "Whenever something feels suspicious, remember four simple steps.", state: 'thinking' },
        { text: "STOP before reacting.", state: 'speaking' },
        { text: "CHECK the details.", state: 'speaking' },
        { text: "VERIFY through a trusted method.", state: 'speaking' },
        { text: "Then ACT safely.", state: 'speaking' },
        { text: "Don't let urgency make the decision for you.", state: 'concerned' },
        // === Transition to Zmail ===
        { text: "Now let's put that knowledge into practice.", state: 'speaking' },
        { text: "Open Zmail to inspect incoming cases. You can also refer to your Detective's Notes on the desktop anytime for tips and checklist items!", state: 'thinking' }
      ], {
        onDone: function() {
          if (typeof IconAttention !== 'undefined') IconAttention.show('gmail');
          updateFolderCounts();
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
}
