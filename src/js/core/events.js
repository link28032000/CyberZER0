'use strict';

// Close flyouts when clicking outside
document.addEventListener('click', (e) => {
  // Volume flyout
  const flyout = document.getElementById('desktop-volume-flyout');
  const trayBtn = document.getElementById('tray-volume-btn');
  if (flyout && !flyout.classList.contains('hidden')) {
    if (!flyout.contains(e.target) && (!trayBtn || !trayBtn.contains(e.target))) {
      closeVolumeFlyout();
    }
  }

  // Network & Quick Settings flyout
  const netFlyout = document.getElementById('desktop-network-flyout');
  const wifiBtn = document.getElementById('tray-wifi-btn');
  if (netFlyout && !netFlyout.classList.contains('hidden')) {
    if (!netFlyout.contains(e.target) && (!wifiBtn || !wifiBtn.contains(e.target))) {
      closeNetworkFlyout();
    }
  }

  // Calendar & Notifications flyout
  const calFlyout = document.getElementById('desktop-calendar-flyout');
  const clockBtn = document.getElementById('taskbar-clock-btn');
  if (calFlyout && !calFlyout.classList.contains('hidden')) {
    if (!calFlyout.contains(e.target) && (!clockBtn || !clockBtn.contains(e.target))) {
      closeCalendarFlyout();
    }
  }

  // Start Power Dropdown
  const pMenu = document.getElementById('start-power-dropdown');
  const pWrap = document.querySelector('.start-power-wrap');
  if (pMenu && !pMenu.classList.contains('hidden')) {
    if (!pWrap || !pWrap.contains(e.target)) {
      pMenu.classList.add('hidden');
    }
  }
});

// Automatic tactile mouse click sound on interactive elements
document.addEventListener('pointerdown', (e) => {
  if (typeof AudioManager !== 'undefined') {
    AudioManager.unlock();

    // Prevent double clicking inside the volume slider thumb itself during drag
    if (e.target && e.target.classList && e.target.classList.contains('cyber-slider')) {
      return;
    }

    const interactive = e.target.closest(
      'button, a, input, select, textarea, label, [role="button"], ' +
      '.desktop-icon, .taskbar-app-btn, .tray-btn, .tray-icon, .win-btn, .tab-item, ' +
      '.browser-tab, .email-item, .email-row, .choice-card, .btn-primary, ' +
      '.btn-ghost, .btn-danger, .btn-success, .btn-title-play, .btn-title-exit, ' +
      '.vn-btn, .sn-action-btn, .sticky-note-tape, .custom-checkbox, .flag-pill, ' +
      '.flag-opt, .link-hover-btn, .vol-test-btn, .file-item, .av-btn'
    );

    if (interactive) {
      AudioManager.playMouseClick();
    }
  }
}, true);

// Keyboard typing sound on input/textarea keydown — DISABLED
// (removed to silence key-press audio as requested)

// ═══════════════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════════════

// Start game with Title Menu on load
window.addEventListener('DOMContentLoaded', () => {
  // ── Reset chapter tracking so login screen always defaults to Alex on page load/refresh ──
  window._currentChapterCategory  = null;
  window._pendingStoryChapter     = null;
  window._currentChapterCharacter = null;

  loadCategoriesProgress();
  loadPhishingProgress();
  initTitleParticles();
  initPreAssessment();
  initSimulationNotifications();
  // Show main menu first (before name input)
  showMainMenu();
  renderEmailList();
  initStickyNote();
  updateAppLockStates();
  updateVolumeUI();
  updateNetworkUI();
  // Start lock screen clock
  lsStartClock();

  // ── Ensure login screen always starts with Alex (Chapter 1) ──
  if (typeof updateLoginScreenForChapter === 'function') {
    updateLoginScreenForChapter('phishing');
  }
});

