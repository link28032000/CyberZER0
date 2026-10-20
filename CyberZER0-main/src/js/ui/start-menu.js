'use strict';

// ═══════════════════════════════════════════════════════════
// WINDOWS START MENU CONTROLS
// ═══════════════════════════════════════════════════════════

function toggleStartMenu(event) {
  if (event) event.stopPropagation();
  if (typeof AudioManager !== 'undefined') AudioManager.unlock();
  const menu = document.getElementById('desktop-start-menu');
  const startBtn = document.getElementById('start-btn');
  if (!menu) return;

  const isHidden = menu.classList.contains('hidden');
  if (isHidden) {
    closeVolumeFlyout();
    closeNetworkFlyout();
    closeCalendarFlyout();
    menu.classList.remove('hidden');
    if (startBtn) startBtn.classList.add('active');
    if (typeof AudioManager !== 'undefined') AudioManager.playWindowSound();

    const input = document.getElementById('start-search-input');
    if (input) {
      input.value = '';
      filterStartMenuApps('');
      setTimeout(() => input.focus(), 60);
    }
    const nameDisplay = document.getElementById('start-user-name');
    const startAvatar = document.querySelector('.start-avatar-img');
    const curCatId = window._currentChapterCategory || activeCategoryStory || 'phishing';
    const foundCat = (typeof CATEGORIES !== 'undefined' && CATEGORIES.find(c => c.id === curCatId));
    const currentChar = (foundCat && foundCat.character) ? foundCat.character : (window._currentChapterCharacter || { name: 'Alex', img: 'assets/Character/Alex.png' });
    if (nameDisplay && currentChar) nameDisplay.textContent = currentChar.name;
    if (startAvatar && currentChar) {
      startAvatar.src = currentChar.img;
      startAvatar.alt = currentChar.name;
    }
  } else {
    closeStartMenu();
  }
}

function closeStartMenu(event) {
  if (event) event.stopPropagation();
  const menu = document.getElementById('desktop-start-menu');
  const startBtn = document.getElementById('start-btn');
  if (menu) menu.classList.add('hidden');
  if (startBtn) startBtn.classList.remove('active');

  const pMenu = document.getElementById('start-power-dropdown');
  if (pMenu) pMenu.classList.add('hidden');
}

function filterStartMenuApps(query) {
  const q = query.toLowerCase().trim();
  const tiles = document.querySelectorAll('.start-app-tile');
  tiles.forEach(tile => {
    const text = tile.textContent.toLowerCase();
    tile.style.display = (!q || text.includes(q)) ? 'flex' : 'none';
  });
}

function startMenuOpenApp(appName) {
  closeStartMenu();
  if (typeof AudioManager !== 'undefined') {
    AudioManager.unlock();
    if (!isAppLocked(appName)) {
      AudioManager.playWindowSound(true);
    } else {
      AudioManager.playWrong();
    }
  }
  taskbarClick(appName);
}

function startMenuAction(action) {
  closeStartMenu();
  if (typeof AudioManager !== 'undefined') {
    AudioManager.unlock();
    AudioManager.playWindowSound(true);
  }
  if (action === 'exam') {
    showOverlay('overlay-pre-assessment');
  } else if (action === 'volume') {
    toggleVolumeFlyout();
  } else if (action === 'notes' || action === 'sticky_note') {
    toggleStickyNote();
  }
}

function startMenuFileClick(fileType) {
  closeStartMenu();
  if (typeof AudioManager !== 'undefined') {
    AudioManager.unlock();
    AudioManager.playWindowSound(true);
  }
  if (fileType === 'malware_sample') {
    showToast('📄 Opened suspicious_invoice.pdf.exe in analysis buffer!', 'info');
  } else if (fileType === 'case_log') {
    showToast('📋 Case 001 log loaded.', 'info');
  }
}

function togglePowerMenu(event) {
  if (event) event.stopPropagation();
  const pMenu = document.getElementById('start-power-dropdown');
  if (pMenu) pMenu.classList.toggle('hidden');
}

let pausedLockInterval = null;

function updatePausedLockClock() {
  const timeEl = document.getElementById('lock-paused-time');
  const dateEl = document.getElementById('lock-paused-date');
  if (!timeEl && !dateEl) return;

  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  if (timeEl) timeEl.textContent = `${h}:${m}`;

  if (dateEl) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    dateEl.textContent = `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]}`;
  }
}

function lockTerminalPaused() {
  closeStartMenu();
  const powerMenu = document.getElementById('start-power-dropdown');
  if (powerMenu) powerMenu.classList.add('hidden');

  const lockEl = document.getElementById('overlay-lock-paused');
  if (!lockEl) return;

  updatePausedLockClock();
  if (pausedLockInterval) clearInterval(pausedLockInterval);
  pausedLockInterval = setInterval(updatePausedLockClock, 1000);

  // Reveal paused lock screen — force reflow so CSS transition fires cleanly
  lockEl.classList.remove('hidden');
  lockEl.classList.remove('is-visible'); // reset in case it was previously visible
  // eslint-disable-next-line no-unused-expressions
  lockEl.offsetHeight; // force reflow — triggers CSS paint before transition starts
  lockEl.classList.remove('slide-up');
  lockEl.classList.add('is-visible'); // triggers .lock-paused-bg fade-in

  if (typeof AudioManager !== 'undefined') {
    AudioManager.playWindowSound(false);
  }

  // Allow pressing any key to resume
  const onKeyResume = () => {
    window.removeEventListener('keydown', onKeyResume);
    unlockPausedTerminal();
  };
  window.addEventListener('keydown', onKeyResume, { once: true });
}

function unlockPausedTerminal() {
  const lockEl = document.getElementById('overlay-lock-paused');
  if (!lockEl || lockEl.classList.contains('hidden') || lockEl.classList.contains('slide-up')) return;

  if (pausedLockInterval) {
    clearInterval(pausedLockInterval);
    pausedLockInterval = null;
  }

  // Smooth slide-up transition to reveal desktop
  lockEl.classList.add('slide-up');

  // Subtle unlock chime
  _playLoadingBeep(523, 0.08, 0);
  _playLoadingBeep(659, 0.08, 0.08);

  setTimeout(() => {
    lockEl.classList.add('hidden');
    lockEl.classList.remove('slide-up');
    lockEl.classList.remove('is-visible'); // reset bg opacity for next show
  }, 420);
}

function startMenuPower(action) {
  closeStartMenu();
  if (action === 'restart') {
    restartEntireGame();
  } else if (action === 'lock') {
    lockTerminalPaused();
  } else if (action === 'shutdown') {
    shutdownGame();
  }
}

function shutdownGame() {
  const sd = document.getElementById('overlay-shutdown-screen');
  const noteEl  = document.getElementById('shutdown-loading-note-text');
  const noteWrap = document.getElementById('shutdown-loading-note-wrap');

  // Dismiss and reset Ryan guide immediately — it will restart fresh for Chapter 1
  if (typeof RyanGuide !== 'undefined') {
    RyanGuide.reset();
  }

  // Reset chapter tracking so Ryan fires fresh next time Chapter 1 is loaded
  window._currentChapterCategory = null;
  window._currentChapterCharacter = null;

  // Immediately hide desktop so it can NEVER pop in or flash
  const desktop = document.getElementById('desktop');
  if (desktop) {
    desktop.style.visibility = 'hidden';
    desktop.style.opacity = '0';
  }

  // Close start menu/power dropdown immediately
  closeStartMenu();
  const powerMenu = document.getElementById('start-power-dropdown');
  if (powerMenu) powerMenu.classList.add('hidden');

  // Immediately kill any active VN narration and typing text
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

  // Close open app windows
  ['gmail', 'browser', 'folder', 'antivirus'].forEach(a => {
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

  if (!sd) {
    hideAllOverlays(false);
    if (desktop) {
      desktop.style.visibility = 'hidden';
      desktop.style.opacity = '0';
    }
    showMainMenu();
    return;
  }

  // Shutdown-specific awareness tips
  const SHUTDOWN_NOTES = [
    'Saving your progress and securing all open files…',
    'Tip: Always log out of shared computers to protect your accounts.',
    'Tip: Never leave your workstation unlocked — even for a moment.',
    'Tip: Clearing your browser history and cache protects your privacy.',
    'Tip: Strong passwords use 12+ characters with letters, numbers, and symbols.',
    'Shutting down terminal… Returning to Main Menu.'
  ];

  const selected = SHUTDOWN_NOTES[Math.floor(Math.random() * SHUTDOWN_NOTES.length)];
  if (noteEl) noteEl.textContent = selected;

  // Play power-off descending tones
  _playLoadingBeep(320, 0.12, 0);
  _playLoadingBeep(240, 0.10, 0.18);
  _playLoadingBeep(160, 0.08, 0.38);

  // Show the shutdown overlay immediately
  sd.style.transition = 'none';
  sd.classList.remove('sd-leaving');
  sd.classList.add('sd-active');
  void sd.offsetWidth;
  sd.style.transition = '';

  const SHUTDOWN_DURATION = 3200; // 3.2 seconds

  // Mid-point note transition at 1.6s
  const midTimer = setTimeout(() => {
    if (noteWrap && noteEl) {
      noteWrap.classList.add('transitioning');
      setTimeout(() => {
        noteEl.textContent = 'Shutting down CyberZerØ terminal… Returning to Main Menu.';
        noteWrap.classList.remove('transitioning');
      }, 300);
    }
  }, 1600);

  // After duration: smooth fade out of shutdown screen directly to Main Menu
  setTimeout(() => {
    clearTimeout(midTimer);

    // Keep desktop hidden
    if (desktop) {
      desktop.style.visibility = 'hidden';
      desktop.style.opacity = '0';
    }

    // Ensure Main Menu is active and ready underneath
    showMainMenu();

    // Fade overlay out
    sd.classList.add('sd-leaving');

    setTimeout(() => {
      // Remove overlay classes
      sd.classList.remove('sd-active', 'sd-leaving');
    }, 800);

  }, SHUTDOWN_DURATION);
}
