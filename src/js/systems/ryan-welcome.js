'use strict';

// Helper: Check if the desktop view has finished loading onto the screen
function isDesktopViewFullyLoaded() {
  const desktop = document.getElementById('desktop');
  if (!desktop) return false;

  // Desktop must have visibility 'visible', not 'hidden' or 'none'
  const style = window.getComputedStyle ? window.getComputedStyle(desktop) : desktop.style;
  if (style.visibility === 'hidden' || style.display === 'none') return false;
  if (parseFloat(style.opacity || '1') <= 0.1) return false;

  // Loading screen ("Just a moment..." spinning ring) must NOT be active
  const ls = document.getElementById('overlay-loading-screen');
  if (ls && (ls.classList.contains('ls-active') || ls.classList.contains('ls-leaving'))) return false;

  // Shutdown screen must not be active
  const sd = document.getElementById('overlay-shutdown-screen');
  if (sd && (sd.classList.contains('sd-active') || sd.classList.contains('sd-leaving'))) return false;

  // Full-screen overlays (title menu, lockscreen, comic strip, etc.) must not be active
  const blockingOverlays = [
    'overlay-title-menu',
    'overlay-main-menu',
    'overlay-comic-strip',
    'overlay-comic-strip-ch2',
    'overlay-comic-strip-ch3',
    'overlay-comic-strip-ch4',
    'overlay-loading',
    'overlay-pre-assessment',
    'overlay-game-intro',
    'overlay-welcome'
  ];
  for (let i = 0; i < blockingOverlays.length; i++) {
    const o = document.getElementById(blockingOverlays[i]);
    if (o && o.classList.contains('active')) return false;
  }

  return true;
}

// Welcome trigger: Handled cleanly and solely by startMission() to prevent duplicate intro speech.
(function initRyanWelcome() {
  // No-op: startMission() is the single source of truth for the Chapter 1 intro dialogue.
})();


/* ===========================================================
   ICON ATTENTION SYSTEM
   Adds a simple glowing border to a desktop icon when Ryan
   tells the player to open an app.
   Usage:
     IconAttention.show('gmail')   — glow the Email icon
     IconAttention.hide('gmail')   — remove glow
     IconAttention.hideAll()       — clear all
=========================================================== */
const IconAttention = (() => {
  const idMap = { gmail: 'icon-gmail', browser: 'icon-browser', folder: 'icon-folder', antivirus: 'icon-antivirus', comms: 'icon-comms', notes: 'icon-notes' };

  function _getIcon(appName) {
    return document.getElementById(idMap[appName] || ('icon-' + appName));
  }

  function show(appName) {
    const icon = _getIcon(appName);
    if (!icon) return;
    icon.classList.remove('icon-attention', 'icon-attention-dismiss');
    void icon.offsetWidth; // restart animation
    icon.classList.add('icon-attention');
  }

  function hide(appName) {
    const icon = _getIcon(appName);
    if (!icon) return;
    icon.classList.add('icon-attention-dismiss');
    icon.classList.remove('icon-attention');
    setTimeout(() => icon.classList.remove('icon-attention-dismiss'), 350);
  }

  function hideAll() {
    document.querySelectorAll('.desktop-icon.icon-attention').forEach(el => {
      el.classList.add('icon-attention-dismiss');
      el.classList.remove('icon-attention');
      setTimeout(() => el.classList.remove('icon-attention-dismiss'), 350);
    });
  }

  return { show, hide, hideAll };
})();


/* ===========================================================
   RYAN + ICON ATTENTION — wiring
   When Ryan says "Open Gmail…" in his welcome sequence,
   we highlight the Email icon. It clears the moment the
   player actually opens Gmail.
=========================================================== */
(function wireIconAttentionToRyan() {

  // Patch the welcome dialogue: after last slide show() the email icon
  const _origSpeak = RyanGuide.speak;

  // We intercept openApp('gmail') to auto-dismiss the hint
  const _origOpen = window.openApp;
  if (typeof _origOpen === 'function') {
    window.openApp = function(appName) {
      if (appName === 'gmail') {
        IconAttention.hide('gmail');
      }
      return _origOpen.apply(this, arguments);
    };
  }

  // Trigger attention effect when Ryan finishes the last welcome slide
  // The welcome dialogue has 3 slides; the last one says "Open Gmail…"
  // We hook into the welcome 'once' trigger that was already set up.
  // To do this cleanly, we watch for when the welcome sequence finishes
  // by observing when #ryan-continue-btn is shown AND the last welcome text is displayed.

  function tryAttachWelcomeWatcher() {
    const textEl = document.getElementById('ryan-dialogue-text');
    const continueBtn = document.getElementById('ryan-continue-btn');
    if (!textEl || !continueBtn) { setTimeout(tryAttachWelcomeWatcher, 500); return; }

    const observer = new MutationObserver(() => {
      const txt = textEl.textContent || '';
      // Last slide of welcome dialogue contains "Open Gmail" or "Open Email"
      if (
        (txt.includes('Open Gmail') || txt.includes('Open Email') || txt.includes('when you\'re ready')) &&
        !continueBtn.classList.contains('hidden')
      ) {
        // Slight delay so the user first reads Ryan, THEN sees the icon glow
        setTimeout(() => { IconAttention.show('gmail'); }, 600);
      } else if (txt.includes('investigating') || txt.includes('mission') || txt.includes('recognize')) {
        // After welcome, stop hint (shouldn't be needed, but safety net)
        // don't clear here — wait for gmailOpen
      }
    });

    observer.observe(textEl, { childList: true, characterData: true, subtree: true });
    observer.observe(continueBtn, { attributes: true, attributeFilter: ['class'] });
  }

  // Start watching once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryAttachWelcomeWatcher);
  } else {
    tryAttachWelcomeWatcher();
  }

})();
