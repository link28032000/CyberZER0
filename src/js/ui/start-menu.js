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

    if (window._awaitingShutdownForChapter2 && typeof window.updateShutdownGuideStep === 'function') {
      const curCat = window._currentChapterCategory || (typeof activeCategoryStory !== 'undefined' ? activeCategoryStory : null) || (typeof gameState !== 'undefined' ? gameState.phase : null);
      if (!curCat || curCat === 'phishing') {
        window.updateShutdownGuideStep(2);
      } else {
        if (typeof window.clearWorkstationLogoffGuide === 'function') window.clearWorkstationLogoffGuide();
      }
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

  if (window._awaitingShutdownForChapter2 && typeof window.updateShutdownGuideStep === 'function') {
    const curCat = window._currentChapterCategory || (typeof activeCategoryStory !== 'undefined' ? activeCategoryStory : null) || (typeof gameState !== 'undefined' ? gameState.phase : null);
    if (!curCat || curCat === 'phishing') {
      window.updateShutdownGuideStep(1);
    } else {
      if (typeof window.clearWorkstationLogoffGuide === 'function') window.clearWorkstationLogoffGuide();
    }
  }
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
  if (pMenu) {
    pMenu.classList.toggle('hidden');
    if (!pMenu.classList.contains('hidden')) {
      const restartBtn = pMenu.querySelector("button[onclick*='restart']");
      if (restartBtn) {
        restartBtn.setAttribute('title', 'Restart active chapter from the beginning');
        restartBtn.style.opacity = '1';
        restartBtn.disabled = false;
        restartBtn.innerHTML = '🔄 Restart (Mission)';
      }
    }
    if (window._awaitingShutdownForChapter2 && typeof window.updateShutdownGuideStep === 'function') {
      const curCat = window._currentChapterCategory || (typeof activeCategoryStory !== 'undefined' ? activeCategoryStory : null) || (typeof gameState !== 'undefined' ? gameState.phase : null);
      if (!curCat || curCat === 'phishing') {
        if (!pMenu.classList.contains('hidden')) {
          window.updateShutdownGuideStep(3);
        } else {
          window.updateShutdownGuideStep(2);
        }
      } else {
        if (typeof window.clearWorkstationLogoffGuide === 'function') window.clearWorkstationLogoffGuide();
      }
    }
  }
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

  // ── Pause Multi Media Player & Active Videos when terminal is locked ──
  if (typeof onMediaLock === 'function') {
    onMediaLock();
  } else {
    const vid = document.getElementById('videoplayer-video');
    if (vid && !vid.paused && !vid.ended) {
      window._mediaPlayerPausedByLock = true;
      vid.pause();
    }
  }

  // Also pause chapter awareness video if playing
  const avVid = document.getElementById('awareness-real-video');
  if (avVid && !avVid.paused && !avVid.ended) {
    window._awarenessPausedByLock = true;
    avVid.pause();
  }

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

  // ── Resume Multi Media Player if it was paused by terminal lock ──
  if (typeof onMediaUnlock === 'function') {
    onMediaUnlock();
  } else if (window._mediaPlayerPausedByLock) {
    window._mediaPlayerPausedByLock = false;
    const vid = document.getElementById('videoplayer-video');
    const win = document.getElementById('win-videoplayer');
    if (vid && win && !win.classList.contains('hidden')) {
      vid.play().catch(() => {});
    }
  }

  if (window._awarenessPausedByLock) {
    window._awarenessPausedByLock = false;
    const avVid = document.getElementById('awareness-real-video');
    const avOverlay = document.getElementById('overlay-awareness-video');
    if (avVid && avOverlay && !avOverlay.classList.contains('hidden')) {
      avVid.play().catch(() => {});
    }
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
    // Show confirm dialog if the user has cloud-saved progress for this mission
    _confirmRestartWithSaveCheck();
  } else if (action === 'lock') {
    lockTerminalPaused();
  } else if (action === 'shutdown') {
    shutdownGame();
  }
}

/**
 * Check whether a Firestore save exists for this user, then:
 *   - If yes  → show the restart-confirmation modal warning that progress will be deleted
 *   - If no   → restart immediately (no save to lose)
 */
function _confirmRestartWithSaveCheck() {
  const doRestart = function () {
    if (typeof restartCurrentChapterMission === 'function') {
      restartCurrentChapterMission();
    } else {
      restartEntireGame();
    }
  };

  if (typeof window.hasSavedProgress === 'function') {
    window.hasSavedProgress().then(function (hasSave) {
      if (hasSave) {
        _showRestartConfirmDialog(doRestart);
      } else {
        doRestart();
      }
    }).catch(function () {
      // Firestore check failed — just restart without blocking
      doRestart();
    });
  } else {
    // save-progress.js not loaded — restart immediately
    doRestart();
  }
}

/**
 * Render and show the restart-confirm modal.
 * @param {Function} onConfirm – called when player confirms restart
 */
function _showRestartConfirmDialog(onConfirm) {
  // Detect chapter name for the warning message
  const activeCat = window._currentChapterCategory ||
    (typeof activeCategoryStory !== 'undefined' ? activeCategoryStory : null) || 'phishing';
  const chapterLabels = {
    phishing:          'Chapter 1: Phishing Investigation',
    malware:           'Chapter 2: Malware Incident',
    social_engineering:'Chapter 3: Social Engineering',
    ransomware:        'Chapter 4: Ransomware Containment',
  };
  const chapterName = chapterLabels[activeCat] || 'this mission';

  const modal = document.getElementById('cz-restart-confirm-modal');
  const msgEl  = document.getElementById('cz-restart-confirm-msg');
  if (!modal) {
    // Fallback: browser confirm (should never happen if HTML is loaded)
    if (window.confirm('Your saved progress for ' + chapterName + ' will be permanently deleted. Continue?')) {
      window.deleteProgress ? window.deleteProgress().then(onConfirm) : onConfirm();
    }
    return;
  }

  if (msgEl) {
    msgEl.textContent = 'Your saved progress for ' + chapterName +
      ' will be permanently deleted from your account. This cannot be undone.';
  }

  modal.classList.add('cz-rcd-visible');

  // Wire buttons (clone to remove old listeners)
  const confirmBtn = document.getElementById('cz-restart-confirm-yes');
  const cancelBtn  = document.getElementById('cz-restart-confirm-no');

  function closeModal() {
    modal.classList.remove('cz-rcd-visible');
  }

  function handleConfirm() {
    closeModal();
    // Delete cloud save then restart
    if (typeof window.deleteProgress === 'function') {
      window.deleteProgress().then(function () {
        onConfirm();
      }).catch(function () {
        onConfirm(); // restart even if delete failed
      });
    } else {
      onConfirm();
    }
    cleanup();
  }

  function handleCancel() {
    closeModal();
    cleanup();
  }

  function cleanup() {
    if (confirmBtn) confirmBtn.removeEventListener('click', handleConfirm);
    if (cancelBtn)  cancelBtn.removeEventListener('click', handleCancel);
  }

  if (confirmBtn) confirmBtn.addEventListener('click', handleConfirm);
  if (cancelBtn)  cancelBtn.addEventListener('click', handleCancel);
}

function shutdownGame() {
  // 💾 Save progress to Firestore before anything else.
  // Suppress the success toast — the shutdown screen IS the visual feedback.
  if (typeof window.saveProgress === 'function') {
    window._suppressSaveToast = true;
    window.saveProgress().then(function() {
      window._suppressSaveToast = false;
      if (typeof updateStartButton === 'function') updateStartButton();
      else if (typeof window.updateStartButton === 'function') window.updateStartButton();
    }).catch(function() { window._suppressSaveToast = false; });
  }

  const sd = document.getElementById('overlay-shutdown-screen');
  const noteEl  = document.getElementById('shutdown-loading-note-text');
  const noteWrap = document.getElementById('shutdown-loading-note-wrap');

  const wasAwaitingCh2 = !!window._awaitingShutdownForChapter2;

  // Immediately clear logoff guide and notices before closing menus
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

  // Dismiss and remove logoff HUD notice
  const dsn = document.getElementById('desktop-shutdown-notice');
  if (dsn) dsn.remove();

  // Detect current active chapter before clearing category state
  const activeCat = window._currentChapterCategory || (typeof activeCategoryStory !== 'undefined' ? activeCategoryStory : null) || (typeof gameState !== 'undefined' ? gameState.phase : null) || 'phishing';
  const isCh2 = (activeCat === 'malware' || activeCat === 'ch2' || activeCat === 2);
  const isCh3 = (activeCat === 'social_engineering' || activeCat === 'social' || activeCat === 'social-engineering' || activeCat === 'ch3' || activeCat === 3);
  const isCh4 = (activeCat === 'ransomware' || activeCat === 'ch4' || activeCat === 4);

  let targetChapter = 'malware';
  let initialNote = 'Saving task completion… Returning to Story Selection for Chapter 2!';
  let midNote = 'Workstation secured! Transitioning to Chapter 2: The Hidden Threat…';

  if (isCh2) {
    const ch2Score = (typeof gameState !== 'undefined' && gameState.score) || 100;
    const ch2Complete = (typeof gameState !== 'undefined' && gameState.malwareQuarantined >= 4) || (typeof CATEGORIES !== 'undefined' && CATEGORIES[1] && CATEGORIES[1].completed);
    if (ch2Complete) {
      if (typeof completeCategory === 'function') {
        completeCategory('malware', ch2Score, 'S');
      }
      if (typeof CATEGORIES !== 'undefined' && CATEGORIES.length > 2) {
        CATEGORIES[0].completed = true;
        CATEGORIES[1].completed = true;
        CATEGORIES[2].unlocked = true;
      }
      targetChapter = 'social_engineering';
      initialNote = 'Saving Chapter 2 task completion… Returning to Story Selection for Chapter 3!';
      midNote = 'Workstation secured! Chapter 3 unlocked in Story Selection.';
    } else {
      if (typeof CATEGORIES !== 'undefined' && CATEGORIES.length > 1) {
        CATEGORIES[0].completed = true;
        CATEGORIES[1].unlocked = true;
      }
      targetChapter = 'malware';
      initialNote = "Saving Ethan's PC progress… Returning to Story Selection!";
      midNote = "Ethan's PC secured! Returning to Story Selection…";
    }
  } else if (isCh3) {
    const ch3Complete = (typeof CATEGORIES !== 'undefined' && CATEGORIES[2] && CATEGORIES[2].completed);
    if (ch3Complete) {
      if (typeof CATEGORIES !== 'undefined' && CATEGORIES.length > 3) {
        CATEGORIES[2].completed = true;
        CATEGORIES[3].unlocked = true;
      }
      targetChapter = 'ransomware';
      initialNote = 'Saving Chapter 3 task completion… Returning to Story Selection for Chapter 4!';
      midNote = 'Workstation secured! Chapter 4 unlocked in Story Selection.';
    } else {
      targetChapter = 'social_engineering';
      initialNote = "Saving Pia's PC progress… Returning to Story Selection!";
      midNote = "Pia's PC secured! Returning to Story Selection…";
    }
  } else if (isCh4) {
    targetChapter = 'ransomware';
    initialNote = 'Saving final mission progress… Returning to Story Selection!';
    midNote = 'Workstation secured! Returning to Story Selection…';
  } else {
    // Chapter 1 (phishing)
    // Detect whether Ch1 is already completed (player returning after finish)
    const ch1AlreadyDone = (typeof _isCategoryCompleted === 'function' && _isCategoryCompleted('phishing')) ||
      (typeof CATEGORIES !== 'undefined' && CATEGORIES[0] && CATEGORIES[0].completed);

    if (ch1AlreadyDone) {
      // Ch1 already completed — save & return to Story Selection, no re-award
      targetChapter = 'malware';
      initialNote = 'Saving progress… Returning to Story Selection!';
      midNote = 'Workstation secured! Returning to Story Selection…';
    } else {
      // Ch1 completing for the first time — award completion
      if (typeof completeCategory === 'function') {
        completeCategory('phishing', (typeof gameState !== 'undefined' && gameState.score) || 100, 'S');
      }
      if (typeof CATEGORIES !== 'undefined' && CATEGORIES.length > 1) {
        CATEGORIES[0].completed = true;
        CATEGORIES[1].unlocked = true;
      }
      targetChapter = 'malware';
      initialNote = 'Saving task completion… Returning to Story Selection for Chapter 2!';
      midNote = 'Workstation secured! Transitioning to Chapter 2: The Hidden Threat…';
    }
  }

  // Save categories progress and update locks
  if (typeof saveCategoriesProgress === 'function') saveCategoriesProgress();
  if (typeof refreshStorySelectLocks === 'function') refreshStorySelectLocks();

  // Save updated completion state and unlocked chapters to Firestore
  // Toast still suppressed at this point (shutdown screen is running)
  if (typeof window.saveProgress === 'function') {
    window._suppressSaveToast = true;
    window.saveProgress().then(function() {
      window._suppressSaveToast = false;
      if (typeof updateStartButton === 'function') updateStartButton();
      else if (typeof window.updateStartButton === 'function') window.updateStartButton();
    }).catch(function() { window._suppressSaveToast = false; });
  }

  // Dismiss and reset Ryan guide immediately — it will restart fresh for Chapter 1
  if (typeof RyanGuide !== 'undefined') {
    RyanGuide.reset();
  }

  // Set pending chapter for story selection
  window._pendingStoryChapter = targetChapter;
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

  if (!sd) {
    hideAllOverlays(false);
    if (desktop) {
      desktop.style.visibility = 'hidden';
      desktop.style.opacity = '0';
    }
    window._awaitingShutdownForChapter2 = false;
    if (typeof showStorySelectionScreen === 'function') {
      showStorySelectionScreen(targetChapter);
    } else {
      showMainMenu();
    }
    return;
  }

  // Play power-off descending tones
  _playLoadingBeep(320, 0.12, 0);
  _playLoadingBeep(240, 0.10, 0.18);
  _playLoadingBeep(160, 0.08, 0.38);

  // Show the shutdown overlay immediately
  sd.style.display = 'flex';
  sd.style.zIndex = '999999';
  sd.style.visibility = 'visible';
  sd.style.opacity = '1';
  sd.style.transition = 'none';
  sd.classList.remove('sd-leaving');
  sd.classList.add('sd-active');
  void sd.offsetWidth;
  sd.style.transition = '';

  // Exactly 15-second Windows shutdown sequence with original status messages and rotating educational tips
  const SHUTDOWN_DURATION = 15000;
  const stopTips = (typeof startRotatingCyberTips === 'function')
    ? startRotatingCyberTips(noteEl, noteWrap, SHUTDOWN_DURATION, 3800, initialNote, midNote)
    : (typeof window.startRotatingCyberTips === 'function' ? window.startRotatingCyberTips(noteEl, noteWrap, SHUTDOWN_DURATION, 3800, initialNote, midNote) : () => {});

  // After duration: smooth fade out of shutdown screen directly to Story Selection or Main Menu
  setTimeout(() => {
    stopTips();

    // Keep desktop hidden
    if (desktop) {
      desktop.style.visibility = 'hidden';
      desktop.style.opacity = '0';
    }

    // Fade overlay out
    sd.classList.add('sd-leaving');

    setTimeout(() => {
      // Remove overlay classes
      sd.classList.remove('sd-active', 'sd-leaving');
      sd.style.display = 'none';
      sd.style.visibility = 'hidden';
    }, 800);

    // Transition to Story Selection screen!
    window._awaitingShutdownForChapter2 = false;
    if (typeof showStorySelectionScreen === 'function') {
      showStorySelectionScreen(targetChapter);
    } else {
      showMainMenu();
    }
    // Refresh Start/Continue button after save has had 15s to commit to Firestore
    if (typeof updateStartButton === 'function') updateStartButton();
    else if (typeof window.updateStartButton === 'function') window.updateStartButton();

  }, SHUTDOWN_DURATION);
}

// Alt+L shortcut listener for Lock (Paused) terminal
window.addEventListener('keydown', (e) => {
  const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
  const isInput = activeTag === 'input' || activeTag === 'textarea' || (document.activeElement && document.activeElement.isContentEditable);
  if (isInput) return;

  if ((e.altKey && (e.key === 'l' || e.key === 'L')) || e.key === 'Pause') {
    e.preventDefault();
    lockTerminalPaused();
  }
});

// Global Window Exports
window.shutdownGame = shutdownGame;
window.startMenuPower = startMenuPower;
window.togglePowerMenu = togglePowerMenu;
window.toggleStartMenu = toggleStartMenu;
window.closeStartMenu = closeStartMenu;
