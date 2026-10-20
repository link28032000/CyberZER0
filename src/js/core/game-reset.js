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
