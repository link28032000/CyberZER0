'use strict';

// ═══════════════════════════════════════════════════════════
// GRAND VICTORY & ALL-MODULES MASTER CERTIFICATION
// ═══════════════════════════════════════════════════════════

function showGrandCertificate() {
  hideAllOverlays();

  const nameEl = document.getElementById('grand-cert-name');
  if (nameEl) nameEl.textContent = gameState.playerName || 'Alex';

  const totalScore = CATEGORIES.reduce((sum, c) => sum + (c.score || 0), 0) + gameState.score;
  const scoreEl = document.getElementById('grand-total-score');
  if (scoreEl) scoreEl.textContent = `${totalScore} pts`;

  showOverlay('overlay-grand-results');
  if (typeof AudioManager !== 'undefined') {
    AudioManager.playMissionComplete();
  }
  showToast('🏆 CONGRATULATIONS! You completed all 4 CyberZerØ Threat Chapters!', 'success');
}

function restartEntireGame() {
  const ls = document.getElementById('overlay-loading-screen');
  const titleEl = document.getElementById('win-loading-title');
  const noteEl = document.getElementById('win-loading-note-text');
  const noteWrap = document.getElementById('win-loading-note-wrap');

  // Dismiss and reset Ryan guide immediately — it will restart fresh for Chapter 1
  if (typeof RyanGuide !== 'undefined') {
    RyanGuide.reset();
  }
  if (typeof RyanPretest !== 'undefined') {
    RyanPretest.reset(); // fresh baseline on a full restart
  }
  if (typeof resetCh1ZmailInterface === 'function') {
    resetCh1ZmailInterface();
  }
  try { localStorage.removeItem('cyberzero_uninstalled_apps'); } catch (e) {}
  try { localStorage.removeItem('cyberzero_ch2_pretest_result_file'); } catch (e) {}
  if (typeof EXPLORER_ADDITIONAL_FILES !== 'undefined' && Array.isArray(EXPLORER_ADDITIONAL_FILES.documents)) {
    EXPLORER_ADDITIONAL_FILES.documents = EXPLORER_ADDITIONAL_FILES.documents.filter(f => f.id !== 'doc_ch2_pretest_result');
  }
  if (typeof resetPhoneLinkChat === 'function') {
    resetPhoneLinkChat();
  }

  // Immediately hide desktop so it can NEVER pop in or flash
  const desktop = document.getElementById('desktop');
  if (desktop) {
    desktop.style.visibility = 'hidden';
    desktop.style.opacity = '0';
  }

  // Immediately kill any active VN narration, typing text loops, and typing audio
  if (typeof vnState !== 'undefined') {
    if (vnState.typingTimer) {
      clearTimeout(vnState.typingTimer);
      vnState.typingTimer = null;
    }
    vnState.typing = false;
    vnState.done = true;
  }
  const welcomeOv = document.getElementById('overlay-welcome');
  if (welcomeOv) {
    welcomeOv.classList.remove('active');
    welcomeOv.style.display = 'none';
  }

  // Close start menu and power dropdown immediately
  closeStartMenu();
  const powerMenu = document.getElementById('start-power-dropdown');
  if (powerMenu) powerMenu.classList.add('hidden');

  if (!ls) {
    hideAllOverlays(false);
    retakePreAssessment(true);
    playAgain(false);
    _goToStorySelect();
    return;
  }

  // Set Windows 10 restart title
  if (titleEl) titleEl.textContent = 'Restarting';

  // Ensure Story Selection is completely hidden while restarting
  const ss = document.getElementById('overlay-story-select');
  if (ss) {
    ss.classList.remove('active');
    ss.style.display = 'none';
    ss.style.opacity = '0';
  }

  // Activate Windows circle loading screen immediately
  ls.style.transition = 'none';
  ls.classList.remove('ls-leaving');
  ls.classList.add('ls-active');
  void ls.offsetWidth;
  ls.style.transition = '';

  // ── Stop Chapter 2 Bitcoin Miner mouse-lag simulation on restart ──
  // Removes the lag cursor overlay and body class so the mouse behaves normally.
  // Safe to call even if Ch2 mouse lag was never activated (window.ch2StopMouseLag
  // is a no-op when the lag cursor is not present).
  if (typeof window.sfStopGameOnClose === 'function') {
    try { window.sfStopGameOnClose(); } catch (e) {}
  }
  if (typeof window.tmStopAllIntervals === 'function') {
    try { window.tmStopAllIntervals(); } catch (e) {}
  }
  if (typeof window.ch2StopMouseLag === 'function') {
    try { window.ch2StopMouseLag(); } catch (e) {}
  }
  // Belt-and-suspenders: also clear the class and hide the cursor element directly
  document.body.classList.remove('ch2-mouse-lag-active');
  const _lagCursorEl = document.getElementById('ch2-simulated-lag-cursor');
  if (_lagCursorEl) _lagCursorEl.style.display = 'none';

  // ── Neutralize WannaCry ransomware simulation on restart ──
  // Clears all in-memory encrypted state, stops countdown timers, closes the
  // WannaCry window, removes any access-denied modals, and removes all desktop
  // infection effects. No real files are ever touched.
  (function _resetWannaCrySim() {
    // Always reset the flag — harmless if simulation was never triggered
    window._wannaCryActive = false;

    // Dismiss any open access-denied encrypted file modal
    const deniedModal = document.getElementById('wncry-access-denied-modal');
    if (deniedModal) deniedModal.remove();

    // Hide desktop banner if it was ever shown
    const banner = document.getElementById('wannacry-desktop-banner');
    if (banner) banner.style.display = 'none';

    // Remove red desktop infection class (belt-and-suspenders)
    const desktopEl = document.getElementById('desktop');
    if (desktopEl) desktopEl.classList.remove('wannacry-infected');

    // Hide and fully reset the WannaCry window element
    const wncryWin = document.getElementById('win-wannacry');
    if (wncryWin) {
      wncryWin.classList.add('hidden');
      wncryWin.classList.remove('maximized', 'focused', 'minimized');
      wncryWin.style.left = '';
      wncryWin.style.top = '';
    }

    // Reset WannaCry appState for window manager
    if (typeof appState !== 'undefined' && appState.wannacry) {
      appState.wannacry.open = false;
      appState.wannacry.minimized = false;
      appState.wannacry.maximized = false;
      appState.wannacry.hasBeenPositioned = false;
    }
    // Reset GTA VI & in-app WannaCry simulation state
    window._gtaWannaCrySimActive = false;
    const gtaModal = document.getElementById('gta-security-modal');
    if (gtaModal) gtaModal.classList.add('hidden');
    const gtaNormView = document.getElementById('gta-normal-view');
    const gtaWncryView = document.getElementById('gta-ransomware-view');
    if (gtaWncryView) gtaWncryView.classList.add('hidden');
    if (gtaNormView) gtaNormView.classList.remove('hidden');
    const gtaTitle = document.getElementById('gta6-window-title');
    if (gtaTitle) gtaTitle.textContent = 'Grand Theft Auto VI';
    const gtaWin = document.getElementById('win-gta6');
    if (gtaWin) {
      gtaWin.classList.add('hidden');
      gtaWin.classList.remove('maximized', 'focused', 'minimized');
      gtaWin.style.left = '';
      gtaWin.style.top = '';
    }
    if (typeof appState !== 'undefined' && appState.gta6) {
      appState.gta6.open = false;
      appState.gta6.minimized = false;
      appState.gta6.maximized = false;
      appState.gta6.hasBeenPositioned = false;
    }

    // Refresh File Explorer so .WNCRY encrypted icons are removed
    if (typeof renderFolderFiles === 'function') {
      try { renderFolderFiles(''); } catch (e) {}
    }

    // Reset simulated Recycle Bin to fresh initial state
    if (typeof window.resetRecycleBinToInitial === 'function') {
      try { window.resetRecycleBinToInitial(); } catch (e) {}
    }
  })();

  // Play subtle restart tone
  _playLoadingBeep(320, 0.12, 0);

  // Exactly 15-second Windows restart sequence with original status text and rotating educational tips
  const RESTART_DURATION = 15000;
  const restartNote = 'Restarting CyberZerØ… Resetting system state…';
  const stopTips = (typeof startRotatingCyberTips === 'function')
    ? startRotatingCyberTips(noteEl, noteWrap, RESTART_DURATION, 3800, restartNote)
    : (typeof window.startRotatingCyberTips === 'function' ? window.startRotatingCyberTips(noteEl, noteWrap, RESTART_DURATION, 3800, restartNote) : () => {});

  // Complete restart after 10 seconds duration
  setTimeout(() => {
    stopTips();

    // Make sure VN narration and typing are completely dead
    if (typeof vnState !== 'undefined') {
      if (vnState.typingTimer) {
        clearTimeout(vnState.typingTimer);
        vnState.typingTimer = null;
      }
      vnState.typing = false;
      vnState.done = true;
    }
    const welcomeOv2 = document.getElementById('overlay-welcome');
    if (welcomeOv2) {
      welcomeOv2.classList.remove('active');
      welcomeOv2.style.display = 'none';
    }

    // Reset game state WITHOUT revealing desktop
    hideAllOverlays(false);
    retakePreAssessment(true);
    playAgain(false);

    // Reset player name state so selecting chapter will show lock screen again
    if (typeof playerName !== 'undefined') playerName = '';
    if (typeof gameState !== 'undefined') gameState.playerName = '';
    const passInp = document.getElementById('ls-name-input');
    if (passInp) passInp.value = '';

    // Reset chapter tracking so Ryan fires fresh next time Chapter 1 is loaded
    window._phishBrowserCloseToastShown = false;
    window._currentChapterCategory = null;
    window._currentChapterCharacter = null;

    // Re-ensure desktop is hidden and Story Selection is active and visible underneath
    if (desktop) {
      desktop.style.visibility = 'hidden';
      desktop.style.opacity = '0';
    }
    if (ss) {
      ss.style.display = 'flex';
      ss.style.opacity = '1';
      ss.classList.add('active');
      refreshStorySelectLocks();
    }

    // Startup chime
    _playLoadingBeep(440, 0.1, 0);
    _playLoadingBeep(660, 0.12, 0.12);

    // Smoothly dissolve loading screen directly to reveal Story Selection
    setTimeout(() => {
      ls.classList.add('ls-leaving');
      setTimeout(() => {
        ls.classList.remove('ls-active', 'ls-leaving');
        if (titleEl) titleEl.textContent = 'Just a moment...';
      }, 800);
    }, 200);

  }, RESTART_DURATION);
}

/**
 * Restart the current chapter mission from the beginning.
 * Resets all messages, interactions, files, and mission progress for the active chapter.
 * Keeps the player inside the same chapter on the desktop — never returns to Story Selection or Chapter 1.
 */
function restartCurrentChapterMission() {
  const ls = document.getElementById('overlay-loading-screen');
  const titleEl = document.getElementById('win-loading-title');
  const noteEl = document.getElementById('win-loading-note-text');
  const noteWrap = document.getElementById('win-loading-note-wrap');

  // Close start menu and power dropdown immediately
  if (typeof closeStartMenu === 'function') closeStartMenu();
  const powerMenu = document.getElementById('start-power-dropdown');
  if (powerMenu) powerMenu.classList.add('hidden');

  // Dismiss any active guide speech bubbles immediately
  if (window._ryanMissionIntroTimer) {
    clearTimeout(window._ryanMissionIntroTimer);
    window._ryanMissionIntroTimer = null;
  }
  if (window._ryanCh2IntroTimer) {
    clearTimeout(window._ryanCh2IntroTimer);
    window._ryanCh2IntroTimer = null;
  }
  if (typeof RyanGuide !== 'undefined' && RyanGuide.dismiss) {
    RyanGuide.dismiss(true);
  }

  // Close any open pretest/posttest modal without destroying user test results
  if (typeof RyanPretest !== 'undefined' && RyanPretest.close) {
    try { RyanPretest.close(); } catch (e) {}
  }
  if (typeof RyanPosttest !== 'undefined' && RyanPosttest.close) {
    try { RyanPosttest.close(); } catch (e) {}
  }

  // Detect active chapter category
  const activeCat = window._currentChapterCategory ||
                    (typeof activeCategoryStory !== 'undefined' ? activeCategoryStory : null) ||
                    (typeof gameState !== 'undefined' ? gameState.phase : null) ||
                    'phishing';

  const isCh2 = (activeCat === 'malware' || activeCat === 'ch2' || activeCat === 2 || (typeof gameState !== 'undefined' && gameState.currentChapter === 2));

  if (isCh2) {
    if (typeof Ch2Pretest !== 'undefined' && Ch2Pretest.close) {
      try { Ch2Pretest.close(); } catch (e) {}
    }
    if (typeof window.closeCh2Assessment === 'function') {
      try { window.closeCh2Assessment(); } catch (e) {}
    }
  }

  let chapterName = 'Chapter 1: The Deceptive Click';
  let restartNote = 'Restarting Chapter 1… Resetting mission to intro dialogue…';

  if (isCh2) {
    chapterName = 'Chapter 2: The Hidden Threat';
    restartNote = 'Restarting Chapter 2… Resetting mission to intro dialogue…';
  }

  if (titleEl) titleEl.textContent = 'Restarting';

  // Exactly 15-second Windows restart sequence with original status text and rotating educational tips
  const RESTART_DURATION = 15000;
  const stopTips = (typeof startRotatingCyberTips === 'function')
    ? startRotatingCyberTips(noteEl, noteWrap, RESTART_DURATION, 3800, restartNote)
    : (typeof window.startRotatingCyberTips === 'function' ? window.startRotatingCyberTips(noteEl, noteWrap, RESTART_DURATION, 3800, restartNote) : () => {});

  // Ensure Story Selection and Visual Novel overlays remain completely hidden
  const ss = document.getElementById('overlay-story-select');
  if (ss) {
    ss.classList.remove('active');
    ss.style.display = 'none';
  }
  const welcomeOv = document.getElementById('overlay-welcome');
  if (welcomeOv) {
    welcomeOv.classList.remove('active');
    welcomeOv.style.display = 'none';
  }

  // Stop Space Fighter game loop before closing its window
  if (typeof window.sfStopGameOnClose === 'function') {
    try { window.sfStopGameOnClose(); } catch (e) {}
  }
  const desktopEl1 = document.getElementById('desktop');
  if (desktopEl1) desktopEl1.classList.remove('desktop-sf-active');

  // Stop Task Manager live-update intervals so they don't keep firing after restart
  if (typeof window.tmStopAllIntervals === 'function') {
    try { window.tmStopAllIntervals(); } catch (e) {}
  }

  // Close open app windows (including WannaCry, Recycle Bin, GTA VI & Space Fighter if open)
  ['gmail', 'browser', 'folder', 'antivirus', 'comms', 'ransomware', 'wifi-settings', 'security-settings', 'docviewer', 'imageviewer', 'videoplayer', 'taskmanager', 'scanner', 'control-panel', 'steam', 'wannacry', 'recycle', 'space-fighter', 'gta6'].forEach(a => {
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

  // ── Stop Chapter 2 Bitcoin Miner mouse-lag simulation on restart ──
  if (typeof window.ch2StopMouseLag === 'function') {
    try { window.ch2StopMouseLag(); } catch (e) {}
  }
  document.body.classList.remove('ch2-mouse-lag-active');
  const _lagCursorEl = document.getElementById('ch2-simulated-lag-cursor');
  if (_lagCursorEl) _lagCursorEl.style.display = 'none';

  // ── Remove photos slow-loading simulation overlay ──
  const _photosSlowOverlayInit = document.getElementById('photos-slow-loading-overlay');
  if (_photosSlowOverlayInit) _photosSlowOverlayInit.remove();

  // ── Stop video playback if videoplayer was active ──
  const vidEl = document.getElementById('videoplayer-video');
  if (vidEl) {
    try { vidEl.pause(); } catch (e) {}
  }
  if (typeof window.vpExitFullscreen === 'function') {
    try { window.vpExitFullscreen(); } catch (e) {}
  }

  // ── Neutralize WannaCry ransomware simulation on restart ──
  (function _resetWannaCrySim() {
    window._wannaCryActive = false;
    const deniedModal = document.getElementById('wncry-access-denied-modal');
    if (deniedModal) deniedModal.remove();
    const banner = document.getElementById('wannacry-desktop-banner');
    if (banner) banner.style.display = 'none';
    const desktopEl = document.getElementById('desktop');
    if (desktopEl) desktopEl.classList.remove('wannacry-infected');
    const wncryWin = document.getElementById('win-wannacry');
    if (wncryWin) {
      wncryWin.classList.add('hidden');
      wncryWin.classList.remove('maximized', 'focused', 'minimized');
      wncryWin.style.left = '';
      wncryWin.style.top = '';
    }
    if (typeof appState !== 'undefined' && appState.wannacry) {
      appState.wannacry.open = false;
      appState.wannacry.minimized = false;
      appState.wannacry.maximized = false;
      appState.wannacry.hasBeenPositioned = false;
    }
    // Reset GTA VI & in-app WannaCry simulation state
    window._gtaWannaCrySimActive = false;
    const gtaModal = document.getElementById('gta-security-modal');
    if (gtaModal) gtaModal.classList.add('hidden');
    const gtaNormView = document.getElementById('gta-normal-view');
    const gtaWncryView = document.getElementById('gta-ransomware-view');
    if (gtaWncryView) gtaWncryView.classList.add('hidden');
    if (gtaNormView) gtaNormView.classList.remove('hidden');
    const gtaTitle = document.getElementById('gta6-window-title');
    if (gtaTitle) gtaTitle.textContent = 'Grand Theft Auto VI';
    const gtaWin = document.getElementById('win-gta6');
    if (gtaWin) {
      gtaWin.classList.add('hidden');
      gtaWin.classList.remove('maximized', 'focused', 'minimized');
      gtaWin.style.left = '';
      gtaWin.style.top = '';
    }
    if (typeof appState !== 'undefined' && appState.gta6) {
      appState.gta6.open = false;
      appState.gta6.minimized = false;
      appState.gta6.maximized = false;
      appState.gta6.hasBeenPositioned = false;
    }
    if (typeof renderFolderFiles === 'function') {
      try { renderFolderFiles(''); } catch (e) {}
    }
    if (typeof window.resetRecycleBinToInitial === 'function') {
      try { window.resetRecycleBinToInitial(); } catch (e) {}
    }
  })();

  // Play subtle restart tone
  if (typeof _playLoadingBeep === 'function') {
    _playLoadingBeep(320, 0.12, 0);
  }

  const performChapterRestart = () => {
    // Hide all overlay result modals
    if (typeof hideAllOverlays === 'function') {
      hideAllOverlays(false);
    }
    ['overlay-results', 'overlay-malware-results', 'overlay-social-results', 'overlay-ransomware-results', 'overlay-grand-results', 'overlay-comic-strip'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.classList.remove('active');
        el.style.display = 'none';
      }
    });

    if (isCh2) {
      // ════════════════════════════════════════════════════════════════════
      // RESTART CHAPTER 2 TO INTRO DIALOGUE (ETHAN)
      // ════════════════════════════════════════════════════════════════════
      window._currentChapterCategory = 'malware';
      if (typeof activeCategoryStory !== 'undefined') activeCategoryStory = 'malware';
      if (typeof gameState !== 'undefined') gameState.phase = 'malware';

      // Clear any pending intro timers defensively
      if (window._ryanMissionIntroTimer) {
        clearTimeout(window._ryanMissionIntroTimer);
        window._ryanMissionIntroTimer = null;
      }
      if (window._ryanCh2IntroTimer) {
        clearTimeout(window._ryanCh2IntroTimer);
        window._ryanCh2IntroTimer = null;
      }

      // ── Clean up Chapter 2 saved progress from localStorage (preserve Chapter 1) ──
      try { localStorage.removeItem('cyberzero_ch2_mission'); } catch (e) {}
      try { localStorage.removeItem('cyberzero_ch2_pretest'); } catch (e) {}
      try { localStorage.removeItem('cyberzero_ch2_pretest_result_file'); } catch (e) {}

      // Restore BM process in uninstalled apps so it appears in Task Manager
      try {
        let uninstalled = JSON.parse(localStorage.getItem('cyberzero_uninstalled_apps') || '[]');
        uninstalled = uninstalled.filter(id => id !== 'bm' && id !== 'trojancoinbitminer');
        localStorage.setItem('cyberzero_uninstalled_apps', JSON.stringify(uninstalled));
      } catch (e) {}

      // Update session state: reset ch2 data, preserve ch1 data
      try {
        const raw = localStorage.getItem('cyberzero_session_state');
        if (raw) {
          const sess = JSON.parse(raw);
          sess.ch2 = null;
          sess.desktop_ch2 = null;
          sess.dialogue_ch2 = null;
          sess.activeChapter = 'malware';
          localStorage.setItem('cyberzero_session_state', JSON.stringify(sess));
        }
      } catch (e) {}

      // Reset in-memory Chapter 2 variables
      window._ch2Mission = null;
      window._ch2MissionStarted = false;
      window._ch2ChecklistUnlocked = false;
      if (typeof gameState !== 'undefined') {
        gameState.antivirusProtection = true;
        gameState.malwareQuarantined = 0;
        gameState.malwareFalsePositives = 0;
        gameState.selectedFolderFileId = null;
      }
      if (typeof updateQuarantineUI === 'function') updateQuarantineUI();

      // Clean up temporary malware effects
      if (typeof window.ch2StopMouseLag === 'function') {
        try { window.ch2StopMouseLag(); } catch (e) {}
      }
      document.body.classList.remove('ch2-mouse-lag-active');
      const lagCursor = document.getElementById('ch2-simulated-lag-cursor');
      if (lagCursor) lagCursor.style.display = 'none';

      const photosSlowOverlay = document.getElementById('photos-slow-loading-overlay');
      if (photosSlowOverlay) photosSlowOverlay.remove();

      // Reset Phone Link group chat timers
      if (Array.isArray(window._plTypingTimers)) {
        window._plTypingTimers.forEach(id => clearTimeout(id));
        window._plTypingTimers = [];
      }
      const plContent = document.getElementById('pl-tab-content');
      if (plContent && typeof renderNewbieGcChat === 'function') {
        renderNewbieGcChat(plContent);
      }

      // Hide HUD since Chapter 2 has no mission banner
      const hudEl = document.getElementById('hud');
      if (hudEl) hudEl.classList.add('hidden');

      // Setup Ethan's desktop
      if (typeof setupChapterDesktop === 'function') {
        setupChapterDesktop('malware');
      } else {
        if (typeof updateDesktopBackgroundForPhase === 'function') {
          updateDesktopBackgroundForPhase('malware');
        }
        if (typeof updateLoginScreenForChapter === 'function') {
          updateLoginScreenForChapter('malware');
        }
      }

      const desktopEl = document.getElementById('desktop');
      if (desktopEl) {
        desktopEl.style.visibility = 'visible';
        desktopEl.style.opacity = '1';
        desktopEl.style.pointerEvents = 'auto';
      }

      // Show Ethan's apps & tools
      document.querySelectorAll('.ch2-only, .ch2-not-ch3').forEach(el => {
        el.style.setProperty('display', 'flex', 'important');
      });
      const gfIcon = document.getElementById('icon-games-folder');
      if (gfIcon) {
        gfIcon.classList.remove('uninstalled');
        gfIcon.style.setProperty('display', 'flex', 'important');
      }
      document.querySelectorAll('.ch3-only, .ch4-only').forEach(el => {
        el.style.setProperty('display', 'none', 'important');
      });

      if (typeof syncUninstalledAppsState === 'function') {
        syncUninstalledAppsState();
      }

      // Reset desktop icon selection state
      document.querySelectorAll('.desktop-icon.selected').forEach(el => el.classList.remove('selected'));

      // Close Sticky Notes (locked during intro)
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

      // Reset pre-test for Ethan
      if (typeof Ch2Pretest !== 'undefined' && Ch2Pretest.reset) {
        try { Ch2Pretest.reset(); } catch (e) {}
      }

      // Disable apps during intro
      if (typeof disableCh2DesktopApps === 'function') {
        disableCh2DesktopApps();
      }

      // Reset mentor guide
      if (typeof RyanGuide !== 'undefined' && RyanGuide.reset) {
        RyanGuide.reset();
      }

    } else {
      // ════════════════════════════════════════════════════════════════════
      // RESTART CHAPTER 1 TO INTRO DIALOGUE (ALEX)
      // ════════════════════════════════════════════════════════════════════
      window._phishBrowserCloseToastShown = false;
      window._currentChapterCategory = 'phishing';
      if (typeof activeCategoryStory !== 'undefined') activeCategoryStory = 'phishing';

      if (typeof gameState !== 'undefined') {
        gameState.phase = 'mission';
        gameState.currentChapter = 1;
        gameState.playerName = 'Alex';
        gameState.score = 0;
        gameState.correctDecisions = 0;
        gameState.phishingDetected = 0;
        gameState.legitimateDetected = 0;
        gameState.evidenceFoundTotal = 0;
        gameState.emailResults = [];
        gameState.currentEmail = 0;
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
      }

      if (typeof setupChapterDesktop === 'function') {
        setupChapterDesktop('phishing');
      }

      // Clear any pending intro timers defensively
      if (window._ryanMissionIntroTimer) {
        clearTimeout(window._ryanMissionIntroTimer);
        window._ryanMissionIntroTimer = null;
      }
      if (window._ryanCh2IntroTimer) {
        clearTimeout(window._ryanCh2IntroTimer);
        window._ryanCh2IntroTimer = null;
      }

      // ── Clean up Chapter 1 saved progress from localStorage (preserve Chapter 2) ──
      try { localStorage.removeItem('cyberzero_phishing_progress'); } catch (e) {}
      try { localStorage.removeItem('cyberzero_newbie_gc_state'); } catch (e) {}
      try { localStorage.removeItem('cyberzero_pretest_result_file'); } catch (e) {}
      try { localStorage.removeItem('cyberzero_posttest_result_file'); } catch (e) {}
      try { localStorage.removeItem('cyberzero_pretest_wip'); } catch (e) {}
      try { localStorage.removeItem('cyberzero_posttest_wip'); } catch (e) {}

      // Reset Chapter 1 achievements in localStorage (preserve Chapter 2 achievements)
      try {
        const rawAch = localStorage.getItem('cyberzero_claimed_achievements');
        if (rawAch) {
          const achMap = JSON.parse(rawAch);
          delete achMap['ach_phishing'];
          localStorage.setItem('cyberzero_claimed_achievements', JSON.stringify(achMap));
        }
      } catch (e) {}

      // Reset Chapter 1 in-memory unlocked achievements set
      if (typeof _achievementUnlocked !== 'undefined' && _achievementUnlocked) {
        const ch1AchKeys = ['ach_phishing', 'task_report_phishing', 'task_verify_legit', 'task_fake_sender', 'task_phish_indicators', 'task_submit_all_verdicts', 'task_all_complete', 'phish_trophy_unlocked', 'first_verdict'];
        ch1AchKeys.forEach(k => _achievementUnlocked.delete(k));
      }
      if (typeof updateAchievementNotificationBadge === 'function') {
        updateAchievementNotificationBadge();
      }

      // Reset Chapter 1 completion in CATEGORIES (preserve Chapter 2 unlock/completion)
      if (typeof CATEGORIES !== 'undefined' && CATEGORIES.length > 0) {
        CATEGORIES[0].completed = false;
        CATEGORIES[0].score = 0;
        CATEGORIES[0].rank = '';
        if (typeof saveCategoriesProgress === 'function') saveCategoriesProgress();
        if (typeof refreshStorySelectLocks === 'function') refreshStorySelectLocks();
      }

      // Reset pretest/posttest, phone link, and Zmail interfaces
      if (typeof RyanPretest !== 'undefined' && RyanPretest.reset) RyanPretest.reset();
      if (typeof RyanPosttest !== 'undefined' && RyanPosttest.reset) RyanPosttest.reset();
      if (typeof resetPhoneLinkChat === 'function') resetPhoneLinkChat();
      if (typeof resetCh1ZmailInterface === 'function') resetCh1ZmailInterface();
      if (typeof RyanGuide !== 'undefined' && RyanGuide.reset) RyanGuide.reset();

      // Reset in-memory Chapter 1 mission checklist & investigation state
      window._awardClaimed = false;
      window._phishingEarnedAward = null;
      window._trophyUnlockedDate = null;
      window._postAwardTasks = {};
      window._ch1VideoTracker = {};
      window._postAwardPostTestDialogueFired = false;
      window._awaitingShutdownForChapter2 = false;
      window._ch1CompletedSandbox = false;
      window.ch1InvestigationTutorialDone = false;
      window.ch1SecondEmailNotesHintDone = false;
      window.ch1InvestigationComplete = false;
      window._stickyNotesHighlightDismissed = false;
      window._phoneLinkHighlightDismissed = true;
      window._stickyHintShownOnce = false;
      window._phishClueWarnedOnce = false;
      window._phishAutoModalShown = false;
      window._ryanFirstEmailSpoken = false;
      window.ch1MistakeCount = 0;
      window.ch1Stage = 0;
      window.ch1CurrentRound = 1;
      if (typeof ch1ResolvedEmailIds !== 'undefined' && ch1ResolvedEmailIds.clear) ch1ResolvedEmailIds.clear();
      if (typeof ch1AnimatedEmailIds !== 'undefined' && ch1AnimatedEmailIds.clear) ch1AnimatedEmailIds.clear();
      if (typeof ch1InboxEmails !== 'undefined') ch1InboxEmails = [];

      // Update trophy display to locked state
      if (typeof updateDesktopTrophyDisplay === 'function') updateDesktopTrophyDisplay();

      // Update session state: reset ch1 data, strictly preserve ch2 data
      try {
        const raw = localStorage.getItem('cyberzero_session_state');
        if (raw) {
          const sess = JSON.parse(raw);
          sess.ch1 = null;
          sess.desktop_ch1 = null;
          sess.dialogue_ch1 = null;
          sess.activeChapter = 'phishing';
          localStorage.setItem('cyberzero_session_state', JSON.stringify(sess));
        }
      } catch (e) {}

      // Close Sticky Notes (will be refreshed with initial checklist)
      if (typeof closeStickyNote === 'function') closeStickyNote();

      // Reset Chapter 1 mission state (intro dialogue delayed until 3s after restart)
      if (typeof startMission === 'function') {
        startMission(false, true, true);
      }

      // Re-initialize Sticky Note for Chapter 1 initial mission checklist
      if (typeof updateStickyNoteForPhase === 'function') updateStickyNoteForPhase('phishing');
      if (typeof updateStickyChecklist === 'function') updateStickyChecklist();

      // Sync updated state to cloud save
      if (typeof window.saveProgress === 'function') {
        window._suppressSaveToast = true;
        window.saveProgress().then(function() {
          window._suppressSaveToast = false;
          if (typeof updateStartButton === 'function') updateStartButton();
          else if (typeof window.updateStartButton === 'function') window.updateStartButton();
        }).catch(function() { window._suppressSaveToast = false; });
      }
    }

    // Startup chimes
    if (typeof _playLoadingBeep === 'function') {
      _playLoadingBeep(440, 0.1, 0);
      _playLoadingBeep(660, 0.12, 0.12);
    }

    if (typeof showToast === 'function') {
      showToast('🔄 Chapter mission restarted to intro dialogue.', 'info');
    }
  };

  if (!ls) {
    performChapterRestart();
    setTimeout(() => {
      if (isCh2) {
        const ch2Fn = (typeof window.startCh2RyanIntro === 'function')
          ? window.startCh2RyanIntro
          : (typeof startCh2RyanIntro === 'function' ? startCh2RyanIntro : null);
        if (ch2Fn) ch2Fn();
      } else {
        const ch1Fn = (typeof window.startCh1RyanIntro === 'function')
          ? window.startCh1RyanIntro
          : (typeof startCh1RyanIntro === 'function' ? startCh1RyanIntro : null);
        if (ch1Fn) ch1Fn();
      }
    }, 3000);
    return;
  }

  // Activate Windows circle loading screen
  ls.style.display = 'flex';
  ls.style.transition = 'none';
  ls.classList.remove('ls-leaving');
  ls.classList.add('ls-active');
  void ls.offsetWidth;
  ls.style.transition = '';

  setTimeout(() => {
    stopTips();
    performChapterRestart();

    // Ensure all potential blocking backdrops and modals are closed and hidden
    const blockingModals = [
      'cz-restart-confirm-modal',
      'overlay-shutdown-screen',
      'ryan-pretest-backdrop',
      'ryan-posttest-backdrop',
      'overlay-ch2-pretest',
      'overlay-ch2-assessment',
      'overlay-story-select',
      'overlay-welcome',
      'wncry-access-denied-modal'
    ];
    blockingModals.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.classList.remove('active', 'sd-active', 'rpt-active', 'rpost-active', 'ch2pt-active', 'cz-rcd-visible');
        el.style.display = 'none';
      }
    });

    // Smoothly dissolve loading screen to reveal the restarted workstation
    setTimeout(() => {
      ls.classList.add('ls-leaving');
      setTimeout(() => {
        ls.classList.remove('ls-active', 'ls-leaving');
        ls.style.display = 'none';
        if (titleEl) titleEl.textContent = 'Just a moment...';

        // ── 3 seconds after restart, dialogue pops up ──
        setTimeout(() => {
          if (isCh2) {
            const ch2Fn = (typeof window.startCh2RyanIntro === 'function')
              ? window.startCh2RyanIntro
              : (typeof startCh2RyanIntro === 'function' ? startCh2RyanIntro : null);
            if (ch2Fn) {
              ch2Fn();
            } else {
              console.error('[restartCurrentChapterMission] startCh2RyanIntro function not found!');
            }
          } else {
            const ch1Fn = (typeof window.startCh1RyanIntro === 'function')
              ? window.startCh1RyanIntro
              : (typeof startCh1RyanIntro === 'function' ? startCh1RyanIntro : null);
            if (ch1Fn) {
              ch1Fn();
            } else {
              console.error('[restartCurrentChapterMission] startCh1RyanIntro function not found!');
            }
          }
        }, 3000);

      }, 800);
    }, 200);
  }, RESTART_DURATION);
}

window.restartCurrentChapterMission = restartCurrentChapterMission;
window.restartCurrentMission = restartCurrentChapterMission;

/** Navigate to Story Selection with a smooth cross-fade transition */
function _goToStorySelect() {
  // Ensure VN narration and typing text are completely stopped and hidden
  if (typeof vnState !== 'undefined') {
    if (vnState.typingTimer) {
      clearTimeout(vnState.typingTimer);
      vnState.typingTimer = null;
    }
    vnState.typing = false;
    vnState.done = true;
  }
  const welcomeOv = document.getElementById('overlay-welcome');
  if (welcomeOv) {
    welcomeOv.classList.remove('active');
    welcomeOv.style.display = 'none';
  }

  // Hide all other overlays cleanly
  document.querySelectorAll('.overlay').forEach(o => {
    o.classList.remove('active');
    if (o.id !== 'overlay-story-select') {
      o.style.display = 'none';
    }
  });
  const bd = document.getElementById('overlay-backdrop');
  if (bd) bd.classList.remove('active');

  // Reset desktop visibility
  const desktop = document.getElementById('desktop');
  if (desktop) {
    desktop.style.visibility = 'hidden';
    desktop.style.opacity = '0';
  }

  // Fade in story select
  const ss = document.getElementById('overlay-story-select');
  if (ss) {
    ss.style.opacity = '0';
    ss.style.display = 'flex';
    ss.classList.add('active');
    refreshStorySelectLocks();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        ss.style.transition = 'opacity 0.55s ease';
        ss.style.opacity = '1';
        setTimeout(() => { ss.style.transition = ''; ss.style.opacity = ''; }, 600);
      });
    });
  }
}
