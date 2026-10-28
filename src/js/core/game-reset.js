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

  // Cyber awareness notes
  const RESTART_NOTES = [
    'Resetting detective environment, threat logs, and quarantine database…',
    'Tip: Phishing attacks often create a false sense of urgency to trick you.',
    "Tip: Always verify the sender's email address before clicking any links or opening attachments.",
    'Tip: Legitimate services and banks will never request your passwords, MPINs, or OTPs.',
    'Tip: Disguised file extensions like .pdf.exe can secretly harbor malicious payloads.',
    'Tip: Multi-factor authentication (MFA) adds a vital layer of defense to all your accounts.'
  ];

  let selectedNote = RESTART_NOTES[Math.floor(Math.random() * RESTART_NOTES.length)];
  if (noteEl) noteEl.textContent = selectedNote;

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

  // Midway status note update
  const RESTART_DURATION = 3600; // 3.6 seconds
  const midTimer = setTimeout(() => {
    if (noteWrap && noteEl) {
      noteWrap.classList.add('transitioning');
      setTimeout(() => {
        noteEl.textContent = 'Restoring mission environment… Returning to Story Selection.';
        noteWrap.classList.remove('transitioning');
      }, 300);
    }
  }, 1800);

  // Complete restart after duration
  setTimeout(() => {
    clearTimeout(midTimer);

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
  const isCh3 = (activeCat === 'social_engineering' || activeCat === 'social' || activeCat === 'social-engineering' || activeCat === 'ch3' || activeCat === 3);
  const isCh4 = (activeCat === 'ransomware' || activeCat === 'ch4' || activeCat === 4);

  let chapterName = 'Chapter 1: Phishing Investigation';
  let restartNote = 'Restarting Chapter 1… Resetting inbox, threat logs, and mission tasks…';

  if (isCh2) {
    chapterName = 'Chapter 2: Malware Incident';
    restartNote = 'Restarting Chapter 2… Resetting workstation environment and system state…';
  } else if (isCh3) {
    chapterName = 'Chapter 3: Social Engineering';
    restartNote = 'Restarting Chapter 3… Resetting network settings and communications feed…';
  } else if (isCh4) {
    chapterName = 'Chapter 4: Ransomware Containment';
    restartNote = 'Restarting Chapter 4… Resetting drive nodes, terminal logs, and system defense…';
  }

  if (titleEl) titleEl.textContent = 'Restarting';
  if (noteEl) noteEl.textContent = restartNote;

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

  // Play subtle restart tone
  if (typeof _playLoadingBeep === 'function') {
    _playLoadingBeep(320, 0.12, 0);
  }

  const RESTART_DURATION = 2200; // 2.2 seconds Windows restart

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
      if (typeof openChapterDesktopDirect === 'function') {
        openChapterDesktopDirect('malware');
      }
      if (typeof startMalwareMission === 'function') {
        startMalwareMission();
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

    } else if (isCh3) {
      // ── Restart Chapter 3 (Pia) from beginning ──
      window._currentChapterCategory = 'social_engineering';
      if (typeof g4State !== 'undefined') {
        Object.assign(g4State, {
          stage: 1, wifiChoice: null, securedLaptop: false,
          fileSharingOff: false, deviceDiscoveryOff: false,
          miaAction: null, fileDecision: null,
          infectionInvestigated: false, wifiDisconnected: false,
          processKilled: false, scannerRan: false, score: 0
        });
      }
      if (typeof G4_SECURITY_SETTINGS !== 'undefined') {
        G4_SECURITY_SETTINGS.forEach(s => { s.state = true; });
      }
      if (typeof g4InfectionSymptoms !== 'undefined') g4InfectionSymptoms = 0;
      if (typeof g4InfectionTimer !== 'undefined' && g4InfectionTimer) {
        clearInterval(g4InfectionTimer);
        g4InfectionTimer = null;
      }
      if (typeof openChapterDesktopDirect === 'function') {
        openChapterDesktopDirect('social_engineering');
      }
      if (typeof startGroup4Mission === 'function') {
        startGroup4Mission();
      }

    } else if (isCh4) {
      // ── Restart Chapter 4 (Ryan) from beginning ──
      window._currentChapterCategory = 'ransomware';
      if (typeof openChapterDesktopDirect === 'function') {
        openChapterDesktopDirect('ransomware');
      }
      if (typeof startRansomwareMission === 'function') {
        startRansomwareMission();
      }

    } else {
      // ── Restart Chapter 1 (Alex) from beginning ──
      window._currentChapterCategory = 'phishing';
      if (typeof openChapterDesktopDirect === 'function') {
        openChapterDesktopDirect('phishing');
      }
      if (typeof startMission === 'function') {
        startMission();
      }
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
