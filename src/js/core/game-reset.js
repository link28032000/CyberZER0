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

  // Dismiss and reset guide, pretest, and Chapter 1 interface immediately
  if (typeof RyanGuide !== 'undefined' && RyanGuide.reset) {
    RyanGuide.reset();
  } else if (typeof RyanGuide !== 'undefined' && RyanGuide.dismiss) {
    RyanGuide.dismiss(true);
  }
  if (typeof RyanPretest !== 'undefined' && RyanPretest.reset) {
    RyanPretest.reset();
  }
  if (typeof resetCh1ZmailInterface === 'function') {
    resetCh1ZmailInterface();
  }
  if (typeof resetPhoneLinkChat === 'function') {
    resetPhoneLinkChat();
  }

  // Detect active chapter category
  const activeCat = window._currentChapterCategory ||
                    (typeof activeCategoryStory !== 'undefined' ? activeCategoryStory : null) ||
                    (typeof gameState !== 'undefined' ? gameState.phase : null) ||
                    'phishing';

  const isCh2 = (activeCat === 'malware' || activeCat === 'ch2' || activeCat === 2);

  let chapterName = 'Chapter 1: The Deceptive Click';
  let restartNote = 'Restarting Chapter 1… Resetting inbox, threat logs, and mission tasks…';

  if (isCh2) {
    chapterName = 'Chapter 2: The Hidden Threat';
    restartNote = 'Restarting Chapter 2… Resetting workstation environment and system state…';
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

  // Close open app windows
  ['gmail', 'browser', 'folder', 'antivirus', 'comms', 'ransomware', 'wifi-settings', 'security-settings', 'docviewer', 'imageviewer', 'videoplayer', 'taskmanager', 'scanner', 'control-panel', 'steam'].forEach(a => {
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
      // ── Restart Chapter 2 (Ethan) from beginning ──
      window._currentChapterCategory = 'malware';

      // ── Clear all saved Ch2 progress so the checklist starts completely fresh ──
      try { localStorage.removeItem('cyberzero_session_state'); } catch (e) {}
      try { localStorage.removeItem('cyberzero_ch2_mission'); } catch (e) {}

      // Reset all in-memory Chapter 2 flags before starting fresh
      window._ch2Mission = null;
      window._ch2MissionStarted = false;
      window._ch2IntroActive = false;
      window._ch2ChecklistUnlocked = false;

      if (typeof Ch2Pretest !== 'undefined' && Ch2Pretest.reset) {
        Ch2Pretest.reset();
      }
      if (typeof TrojanInvestigation !== 'undefined' && TrojanInvestigation.reset) {
        TrojanInvestigation.reset();
      }
      if (typeof startMalwareChapter === 'function') {
        startMalwareChapter();
      } else {
        if (typeof openChapterDesktopDirect === 'function') {
          openChapterDesktopDirect('malware');
        }
        if (typeof startMalwareMission === 'function') {
          startMalwareMission();
        }
      }

      // Reset Phone Link group chat state to Chapter 2 baseline
      const initialCh2GcState = {
        created: true,
        joined: true,
        accepted: true,
        hasUnread: false,
        seenByRyan: true,
        alexRepliedEthan: false,
        ryanWelcomedAlex: true,
        typingMember: null,
        playerMessages: [
          {
            id: 'ch1_alex_hello',
            from: 'alex',
            author: 'Alex',
            roleTag: 'ALEX',
            roleClass: 'pl-gc-role-you',
            avatar: 'assets/Character/Alex.png',
            time: '9:00 AM',
            text: 'Hello po.'
          },
          {
            id: 'ch1_ryan_welcome',
            from: 'ryan',
            author: 'Ryan',
            roleTag: 'CREATOR',
            roleClass: 'pl-gc-role-mentor',
            avatar: 'assets/Character/Ryan.png',
            time: '9:01 AM',
            text: 'Welcome to the group, Alex!'
          }
        ]
      };
      try {
        localStorage.setItem('cyberzero_newbie_gc_state', JSON.stringify(initialCh2GcState));
      } catch (e) {}

      if (Array.isArray(window._plTypingTimers)) {
        window._plTypingTimers.forEach(id => clearTimeout(id));
        window._plTypingTimers = [];
      }

      const plContent = document.getElementById('pl-tab-content');
      if (plContent && typeof renderNewbieGcChat === 'function') {
        renderNewbieGcChat(plContent);
      }

      // Reset Chapter 2 emails (inbox empty)
      if (typeof renderCh2EmailList === 'function') {
        renderCh2EmailList();
      }
      if (typeof CH2_EMAILS !== 'undefined' && Array.isArray(CH2_EMAILS)) {
        CH2_EMAILS.forEach(e => { e.read = false; });
      }

      // Reset files / antivirus quarantine
      if (typeof FOLDER_FILES !== 'undefined' && Array.isArray(FOLDER_FILES)) {
        FOLDER_FILES.forEach(f => { f.quarantined = false; });
      }
      if (typeof gameState !== 'undefined') {
        gameState.antivirusProtection = true;
        gameState.malwareQuarantined = 0;
        gameState.malwareFalsePositives = 0;
        gameState.selectedFolderFileId = null;
      }
      if (typeof updateQuarantineUI === 'function') {
        updateQuarantineUI();
      }

      // Hide HUD since Chapter 2 has no mission active
      const hudEl = document.getElementById('hud');
      if (hudEl) hudEl.classList.add('hidden');



    } else {
      // ── Restart Chapter 1 (Alex) from beginning ──
      window._phishBrowserCloseToastShown = false;
      window._currentChapterCategory = 'phishing';

      // ── Clear all saved progress so startMission() starts FRESH ──
      // Without clearing these, startMission()'s resume-guard finds stale
      // localStorage data and calls resumeChapter1Mission() instead of
      // doing a true reset, leaving the checklist empty or in a stale state.
      try { localStorage.removeItem('cyberzero_session_state'); } catch (e) {}
      try { localStorage.removeItem('cyberzero_phishing_progress'); } catch (e) {}
      try { localStorage.removeItem('cyberzero_claimed_achievements'); } catch (e) {}

      // Reset all in-memory Chapter 1 progress flags so nothing leaks into the fresh start
      window._awardClaimed = false;
      window._phishAutoModalShown = false;
      window._ch1CompletedSandbox = false;
      window._awaitingShutdownForChapter2 = false;
      window._postAwardPostTestDialogueFired = false;
      window._postAwardTasks = {
        browserOpened: false, browserNavigated: false, phishingSearched: false,
        phishingVisited: false, explorerOpened: false, videoFolderOpen: false,
        videoPlayed: false, gcOpened: false, postTestDone: false
      };
      window._ch1VideoTracker = {
        duration: 0, currentTime: 0, actualSecondsWatched: 0,
        lastPlayheadTime: 0, hasSkippedForward: false, completed: false, _lastRefresh: 0
      };
      if (typeof _achievementUnlocked !== 'undefined' && _achievementUnlocked.clear) {
        _achievementUnlocked.clear();
      }
      if (typeof _phishingEarnedAward !== 'undefined') _phishingEarnedAward = null;
      if (typeof _trophyUnlockedDate !== 'undefined') _trophyUnlockedDate = null;

      if (typeof openChapterDesktopDirect === 'function') {
        openChapterDesktopDirect('phishing');
      }

      // Pass forceFresh=true so startMission() bypasses its resume-guard entirely
      if (typeof startMission === 'function') {
        startMission(false, true);
      }

      // After a fresh start, force the sticky note to render the full fresh checklist
      setTimeout(function() {
        if (typeof updateStickyNoteForPhase === 'function') updateStickyNoteForPhase('phishing');
        if (typeof updateStickyChecklist === 'function') updateStickyChecklist();
      }, 100);
    }

    // Startup chimes
    if (typeof _playLoadingBeep === 'function') {
      _playLoadingBeep(440, 0.1, 0);
      _playLoadingBeep(660, 0.12, 0.12);
    }

    if (typeof showToast === 'function') {
      showToast(`🔄 ${chapterName} restarted from the beginning.`, 'info');
    }
  };

  if (!ls) {
    performChapterRestart();
    return;
  }

  // Activate Windows circle loading screen
  ls.style.transition = 'none';
  ls.classList.remove('ls-leaving');
  ls.classList.add('ls-active');
  void ls.offsetWidth;
  ls.style.transition = '';

  setTimeout(() => {
    stopTips();
    performChapterRestart();

    // Smoothly dissolve loading screen to reveal the restarted chapter
    setTimeout(() => {
      ls.classList.add('ls-leaving');
      setTimeout(() => {
        ls.classList.remove('ls-active', 'ls-leaving');
        if (titleEl) titleEl.textContent = 'Just a moment...';
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
