'use strict';

// ═══════════════════════════════════════════════════════════
// WINDOW MANAGEMENT & APP LOCKS
// ═══════════════════════════════════════════════════════════

function isAppLocked(appName) {
  // All apps are always unlocked — no chapter prerequisites required
  return false;
}

function updateAppLockStates() {
  const appsToCheck = [
    { name: 'folder', req: 'Chapter 1 (Phishing)' },
    { name: 'antivirus', req: 'Chapter 1 (Phishing)' },
    { name: 'comms', req: 'Chapter 2 (Malware)' },
    { name: 'ransomware', req: 'Chapter 3 (Social Engineering)' }
  ];

  appsToCheck.forEach(({ name: appName, req }) => {
    const isLocked = isAppLocked(appName);
    const icon = document.getElementById(`icon-${appName}`);
    const taskbarBtn = document.getElementById(`taskbar-${appName}`);
    const startCard = document.getElementById(`start-app-${appName}`);
    const startBadge = document.getElementById(`start-badge-${appName}`);
    const recItem = document.getElementById(`rec-app-${appName}`);
    const titleText = isLocked ? `🔒 Locked — Complete ${req} first to unlock` : '';

    if (icon) {
      if (isLocked) {
        icon.classList.add('locked');
        icon.title = titleText;
      } else {
        icon.classList.remove('locked');
        icon.title = '';
      }
    }
    if (taskbarBtn) {
      if (isLocked) {
        taskbarBtn.classList.add('locked');
        taskbarBtn.title = titleText;
      } else {
        taskbarBtn.classList.remove('locked');
        taskbarBtn.title = '';
      }
    }
    if (startCard) {
      if (isLocked) {
        startCard.classList.add('locked');
        if (startBadge) {
          startBadge.className = 'start-tile-status lock';
          startBadge.textContent = '🔒 Locked';
        }
      } else {
        startCard.classList.remove('locked');
        if (startBadge) {
          startBadge.className = 'start-tile-status hidden';
          startBadge.textContent = '';
        }
      }
    }
    if (recItem) {
      if (isLocked) {
        recItem.classList.add('hidden');
      } else {
        recItem.classList.remove('hidden');
      }
    }
  });
}

function openApp(appName) {
  // ── Block all apps while the pretest or posttest is running ──
  const pretestRunning = typeof RyanPretest !== 'undefined' && RyanPretest.isRunning && RyanPretest.isRunning();
  const posttestRunning = typeof RyanPosttest !== 'undefined' && RyanPosttest.isRunning && RyanPosttest.isRunning();
  const ryanIntroActive = typeof RyanGuide !== 'undefined' && RyanGuide.isActive && RyanGuide.isActive()
                          && gameState.phase === 'mission' && ch1InboxEmails.length === 0;
  if (pretestRunning || ryanIntroActive) {
    if (typeof showToast === 'function') {
      showToast('Please complete the pre-test with Ryan before opening other apps.', 'warning');
    }
    // Bring the pretest panel to front if it exists
    const bd = document.getElementById('ryan-pretest-backdrop');
    if (bd && pretestRunning) {
      bd.style.zIndex = '99999';
    }
    return;
  }
  if (posttestRunning) {
    if (typeof showToast === 'function') {
      showToast('Please complete your post-test before opening other apps.', 'warning');
    }
    const pbd = document.getElementById('ryan-posttest-backdrop');
    if (pbd) pbd.style.zIndex = '99999';
    return;
  }

  if (isAppLocked(appName)) {
    const remaining = EMAILS.length - (gameState.emailResults ? gameState.emailResults.length : 0);
    showToast(`🔒 Locked: Complete all 5 email investigations first (${remaining} remaining) to unlock ${appName === 'folder' ? 'File Explorer' : appName === 'comms' ? 'Phone Link' : 'Anti-Virus'}!`, 'warning');
    if (typeof AudioManager !== 'undefined') AudioManager.playWrong();
    return;
  }

  const win = document.getElementById(`win-${appName}`);
  const state = appState[appName];

  if (state.open && !state.minimized) {
    centerWindow(appName);
    focusWindow(appName);
    return;
  }

  state.open = true;
  state.minimized = false;
  win.classList.remove('hidden', 'minimized');
  focusWindow(appName);
  updateTaskbar();
  // Refresh AV state for the current chapter when AV app opens
  if (appName === 'antivirus' && typeof refreshAvForCurrentChapter === 'function') {
    setTimeout(refreshAvForCurrentChapter, 50);
  }
  if (typeof AudioManager !== 'undefined') AudioManager.playWindowSound(true);

  // Notify post-award mission checklist
  if (typeof window._notifyPostAwardAppOpen === 'function') {
    window._notifyPostAwardAppOpen(appName);
  }

  if (appName === 'gmail') {
    if (typeof IconAttention !== 'undefined') {
      IconAttention.hide('gmail');
    }
    const iconG = document.getElementById('icon-gmail');
    if (iconG) iconG.classList.remove('icon-attention', 'btn-pulse-highlight');
    const taskbarGmail = document.getElementById('taskbar-gmail');
    if (taskbarGmail) taskbarGmail.classList.remove('btn-pulse-highlight');
    if (typeof ch1InboxEmails !== 'undefined' && ch1InboxEmails.length === 0) {
      const listView = document.getElementById('email-list-view');
      const detailView = document.getElementById('email-detail-view');
      const sentView = document.getElementById('sent-detail-view');
      if (listView) listView.classList.add('active');
      if (detailView) detailView.classList.remove('active');
      if (sentView) sentView.classList.remove('active');
    }
    updateFolderCounts();
    renderEmailList();
  }

  if (appName === 'browser') {
    // If on post-award checklist, ensure any lingering phishing tabs are closed
    if (window._awardClaimed && typeof browserTabs !== 'undefined' && Array.isArray(browserTabs)) {
      const hasPhish = browserTabs.some(t => typeof isPhishingUrl === 'function' && isPhishingUrl(t.url));
      if (hasPhish) {
        browserTabs = browserTabs.filter(t => typeof isPhishingUrl === 'function' && !isPhishingUrl(t.url));
        if (browserTabs.length === 0) {
          if (typeof initBrowserTabs === 'function') initBrowserTabs();
        } else {
          if (!browserTabs.some(t => t.id === browserActiveTabId)) {
            browserActiveTabId = browserTabs[0].id;
          }
          if (typeof renderTabStrip === 'function') renderTabStrip();
          if (typeof renderActiveTab === 'function') renderActiveTab();
        }
      }
    }
    if (!browserTabs || browserTabs.length === 0) {
      initBrowserTabs();
    } else {
      renderActiveTab();
    }
  }

  if (appName === 'wifi-settings') {
    renderG4WiFiSettings();
    if (typeof wsUpdateWifiTab === 'function') wsUpdateWifiTab();
    if (typeof wsUpdateBluetoothTab === 'function') wsUpdateBluetoothTab();
    if (typeof wsUpdateAirplaneTab === 'function') wsUpdateAirplaneTab();
    if (typeof switchWifiSettingsTab === 'function') switchWifiSettingsTab('wifi');
  }

  if (appName === 'videoplayer') {
    if (typeof syncMediaPlayerVolume === 'function') syncMediaPlayerVolume();
  }

  if (appName === 'comms') {
    if (typeof unhighlightPhoneLinkApp === 'function') unhighlightPhoneLinkApp();
    if (typeof renderPhoneLinkApp === 'function') renderPhoneLinkApp();
  }

  if (appName === 'taskmanager') {
    if (typeof initTaskManager === 'function') initTaskManager();
  }

  // Clear manual drag tracker so window auto-centers properly
  delete win.dataset.userDragged;

  // Always center window on screen when opened
  centerWindow(appName);
  state.hasBeenPositioned = true;
}

// Centers a window on the desktop, always ensuring it fits within available space.
function centerWindow(appName) {
  const win = document.getElementById(`win-${appName}`);
  const desktop = document.getElementById('desktop');
  const taskbar = document.getElementById('taskbar');
  if (!win || !desktop || win.classList.contains('maximized')) return;

  const viewportW = desktop.clientWidth || window.innerWidth;
  const taskbarH = taskbar ? taskbar.offsetHeight : 48;
  const viewportH = (desktop.clientHeight || window.innerHeight) - taskbarH;

  const maxW = Math.max(320, viewportW - 24);
  const maxH = Math.max(240, viewportH - 24);

  // If window is wider or taller than available viewport, constrain it
  if (win.offsetWidth > maxW) {
    win.style.width = maxW + 'px';
    win.dataset.autoAdjustedSize = 'true';
  }
  if (win.offsetHeight > maxH) {
    win.style.height = maxH + 'px';
    win.dataset.autoAdjustedSize = 'true';
  }

  const w = win.offsetWidth || 840;
  const h = win.offsetHeight || 520;

  const left = Math.max(0, Math.round((viewportW - w) / 2));
  const top  = Math.max(0, Math.round((viewportH - h) / 2));

  win.style.left = left + 'px';
  win.style.top  = top  + 'px';
}

/**
 * Adjusts all open windows dynamically when entering or exiting fullscreen mode,
 * or when the viewport is resized.
 */
function adjustOpenWindowsForScreenChange() {
  const desktop = document.getElementById('desktop');
  const taskbar = document.getElementById('taskbar');
  if (!desktop) return;

  const viewportW = desktop.clientWidth || window.innerWidth;
  const taskbarH = taskbar ? taskbar.offsetHeight : 48;
  const viewportH = (desktop.clientHeight || window.innerHeight) - taskbarH;

  const maxW = Math.max(320, viewportW - 24);
  const maxH = Math.max(240, viewportH - 24);

  document.querySelectorAll('.app-window').forEach(win => {
    // Only adjust visible, open windows that are not minimized or maximized
    if (win.classList.contains('hidden') || win.classList.contains('minimized')) return;
    if (win.classList.contains('maximized')) return;

    const appName = win.dataset.app;
    const state = (typeof appState !== 'undefined' && appName) ? appState[appName] : null;
    if (state && (!state.open || state.minimized)) return;

    // Adjust width and height to fit screen
    if (win.offsetWidth > maxW) {
      win.style.width = maxW + 'px';
      win.dataset.autoAdjustedSize = 'true';
    } else if (win.dataset.autoAdjustedSize === 'true' && !win.dataset.userResized) {
      // If we previously auto-clamped and now screen is larger, release clamped size
      win.style.width = '';
      win.style.height = '';
      delete win.dataset.autoAdjustedSize;
    }

    if (win.offsetHeight > maxH) {
      win.style.height = maxH + 'px';
      win.dataset.autoAdjustedSize = 'true';
    }

    const curW = win.offsetWidth;
    const curH = win.offsetHeight;
    const maxLeft = Math.max(0, viewportW - curW);
    const maxTop = Math.max(0, viewportH - curH);

    if (!win.dataset.userDragged) {
      // Keep un-dragged windows centered
      if (appName) {
        centerWindow(appName);
      } else {
        win.style.left = Math.max(0, Math.round((viewportW - curW) / 2)) + 'px';
        win.style.top  = Math.max(0, Math.round((viewportH - curH) / 2)) + 'px';
      }
    } else {
      // For dragged windows, clamp within desktop boundaries so they don't clip offscreen
      let curLeft = parseInt(win.style.left, 10);
      let curTop = parseInt(win.style.top, 10);
      if (isNaN(curLeft)) curLeft = Math.round((viewportW - curW) / 2);
      if (isNaN(curTop))  curTop  = Math.round((viewportH - curH) / 2);

      win.style.left = Math.max(0, Math.min(maxLeft, curLeft)) + 'px';
      win.style.top  = Math.max(0, Math.min(maxTop,  curTop))  + 'px';
    }
  });

  // Also adjust Sticky Note if visible
  const sNote = document.getElementById('sticky-note');
  if (sNote && !sNote.classList.contains('hidden')) {
    const sW = sNote.offsetWidth || 330;
    const sH = sNote.offsetHeight || 480;
    const maxLeft = Math.max(0, viewportW - sW);
    const maxTop = Math.max(0, viewportH - sH);

    if (sNote.style.left) {
      const curL = parseInt(sNote.style.left, 10);
      if (!isNaN(curL)) sNote.style.left = Math.max(0, Math.min(maxLeft, curL)) + 'px';
    }
    if (sNote.style.top) {
      const curT = parseInt(sNote.style.top, 10);
      if (!isNaN(curT)) sNote.style.top = Math.max(0, Math.min(maxTop, curT)) + 'px';
    }
    if (sNote.offsetHeight > viewportH - 24) {
      sNote.style.maxHeight = Math.max(260, viewportH - 24) + 'px';
    }
  }
}
window.adjustOpenWindowsForScreenChange = adjustOpenWindowsForScreenChange;

// adjustAppsForDialogue is kept for compatibility but no longer repositions windows.
// The Ryan dialogue panel (z-index: 100010) always floats on top of all app windows,
// so apps can be freely dragged, resized, or maximized even while Ryan is speaking.
function adjustAppsForDialogue(hasDialogue) {
  // No-op: windows are no longer forced to move around the dialogue strip.
}

function closeApp(appName) {
  const win = document.getElementById(`win-${appName}`);
  if (!win) return;
  if (appName === 'videoplayer') {
    const vid = document.getElementById('videoplayer-video');
    if (vid) vid.pause();
  }
  if (appName === 'browser') {
    const activeTab = typeof getActiveTab === 'function' ? getActiveTab() : null;
    const isPhishTab = activeTab && typeof isPhishingUrl === 'function' && isPhishingUrl(activeTab.url);
    const hasAnyPhishTab = Array.isArray(window.browserTabs) && window.browserTabs.some(t => typeof isPhishingUrl === 'function' && isPhishingUrl(t.url));
    const wasPhish = isPhishTab || hasAnyPhishTab;
    if (wasPhish) {
      // Only show this good defensive practice toast ONCE per Chapter 1 session
      if (!window._phishBrowserCloseToastShown) {
        window._phishBrowserCloseToastShown = true;
        if (typeof showToast === 'function') {
          showToast('🛡️ Good defensive practice: You closed the browser to exit the phishing site!', 'success');
        }
      }
    }
    if (typeof updateBrowserPhishingNotice === 'function') {
      updateBrowserPhishingNotice(false);
    }
  }
  if (appName === 'comms') {
    const gcState = (typeof loadNewbieGcState === 'function') ? loadNewbieGcState() : null;
    const hasPlayerMsg = gcState && Array.isArray(gcState.playerMessages) && gcState.playerMessages.some(m => m.from === 'player');
    if (hasPlayerMsg && !window._hasTriggeredPostPhoneLinkSave && typeof window.triggerPostPhoneLinkSaveDialogue === 'function') {
      setTimeout(() => {
        window.triggerPostPhoneLinkSaveDialogue();
      }, 400);
    }
  }
  appState[appName].open = false;

  appState[appName].minimized = false;
  appState[appName].maximized = false;
  win.classList.add('hidden');
  win.classList.remove('maximized', 'focused');
  delete win.dataset.preDialogueTop;
  updateTaskbar();
  if (typeof AudioManager !== 'undefined') AudioManager.playWindowSound(false);
}

function minimizeApp(appName) {
  const win = document.getElementById(`win-${appName}`);
  appState[appName].minimized = true;
  win.classList.add('minimized');
  win.classList.remove('focused');
  updateTaskbar();
  if (typeof AudioManager !== 'undefined') AudioManager.playWindowSound(false);
}

function toggleMaximize(appName) {
  const win = document.getElementById(`win-${appName}`);
  const state = appState[appName];
  const maxBtn = win.querySelector('.win-maximize');
  if (state.maximized) {
    // Restore to saved size/position
    state.maximized = false;
    win.classList.remove('maximized');
    if (state._savedPos) {
      win.style.left   = state._savedPos.left;
      win.style.top    = state._savedPos.top;
      win.style.width  = state._savedPos.width;
      win.style.height = state._savedPos.height;
    }
    if (maxBtn) maxBtn.textContent = '□';
  } else {
    // Save current position/size before maximizing
    const rect = win.getBoundingClientRect();
    state._savedPos = {
      left:   win.style.left   || rect.left + 'px',
      top:    win.style.top    || rect.top  + 'px',
      width:  win.style.width  || rect.width  + 'px',
      height: win.style.height || rect.height + 'px'
    };
    state.maximized = true;
    win.classList.add('maximized');
    if (maxBtn) maxBtn.textContent = '❐';
  }
  focusWindow(appName);
}

let highestWindowZIndex = 220;

function focusWindow(appName) {
  if (!appName) return;
  document.querySelectorAll('.app-window').forEach(w => w.classList.remove('focused'));
  const win = document.getElementById(`win-${appName}`);
  if (win) {
    win.classList.add('focused');
    highestWindowZIndex += 2;
    if (highestWindowZIndex > 4000) {
      const allWins = Array.from(document.querySelectorAll('.app-window'))
        .sort((a, b) => (parseInt(a.style.zIndex || 200, 10)) - (parseInt(b.style.zIndex || 200, 10)));
      allWins.forEach((w, idx) => {
        w.style.zIndex = 210 + idx * 2;
      });
      highestWindowZIndex = 210 + allWins.length * 2;
    }
    win.style.zIndex = highestWindowZIndex;
  }
  updateTaskbar();
}

// Bring sticky note above all current app windows (but below modals/ryan)
function focusStickyNote() {
  const note = document.getElementById('sticky-note');
  if (!note || note.classList.contains('hidden')) return;
  // Always stay in 4500 tier — safely above app windows (200-4000)
  // and below modals (10500) and ryan (100010)
  const stickyZ = Math.max(4500, highestWindowZIndex + 100);
  note.style.zIndex = Math.min(stickyZ, 4999).toString();
}

function taskbarClick(appName) {
  if (appName === 'comms' && typeof unhighlightPhoneLinkApp === 'function') {
    unhighlightPhoneLinkApp();
  }

  if (isAppLocked(appName)) {
    const remaining = EMAILS.length - (gameState.emailResults ? gameState.emailResults.length : 0);
    showToast(`🔒 Locked: Complete all 5 email investigations first (${remaining} remaining) to unlock ${appName === 'folder' ? 'File Explorer' : 'Anti-Virus'}!`, 'warning');
    return;
  }

  const state = appState[appName];
  if (!state.open) {
    if (appName === 'browser') {
      openBrowserDefault();
    } else {
      openApp(appName);
    }
  } else if (state.minimized) {
    minimizeApp_restore(appName);
  } else {
    const win = document.getElementById(`win-${appName}`);
    if (win.classList.contains('focused')) {
      minimizeApp(appName);
    } else {
      focusWindow(appName);
    }
  }
}

function minimizeApp_restore(appName) {
  const win = document.getElementById(`win-${appName}`);
  appState[appName].minimized = false;
  win.classList.remove('minimized');
  focusWindow(appName);
  updateTaskbar();
}

function updateTaskbar() {
  updateAppLockStates();
  ['gmail', 'browser', 'folder', 'antivirus', 'comms', 'ransomware', 'wifi-settings', 'docviewer', 'imageviewer', 'videoplayer'].forEach(appName => {
    const btn = document.getElementById(`taskbar-${appName}`);
    if (!btn) return;
    const state = appState[appName];
    const win = document.getElementById(`win-${appName}`);

    btn.classList.remove('open', 'active', 'minimized');
    if (state.open) {
      btn.classList.remove('hidden');
      btn.classList.add('open');
      if (state.minimized) {
        btn.classList.add('minimized');
      } else if (win && win.classList.contains('focused')) {
        btn.classList.add('active');
      }
    } else {
      if (appName === 'docviewer' || appName === 'imageviewer' || appName === 'videoplayer') {
        btn.classList.add('hidden');
      }
    }
  });
}

// ── Window Dragging ──
(function setupDragging() {
  let dragging = false, startX, startY, origLeft, origTop, target;

  document.addEventListener('mousedown', e => {
    const titlebar = e.target.closest('.win-titlebar');
    if (!titlebar) return;
    if (e.target.closest('button') || e.target.closest('input')) return;
    const win = titlebar.closest('.app-window');
    if (!win || win.classList.contains('maximized')) return;

    dragging = true;
    target = win;
    startX = e.clientX;
    startY = e.clientY;
    origLeft = win.offsetLeft;
    origTop = win.offsetTop;
    win.classList.add('dragging');

    const appName = win.dataset.app;
    focusWindow(appName);
    e.preventDefault();
  });

  document.addEventListener('mousemove', e => {
    if (!dragging || !target) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      target.dataset.userDragged = 'true';
    }

    const desktop = document.getElementById('desktop');
    const taskbar = document.getElementById('taskbar');
    const desktopW = desktop ? desktop.clientWidth : window.innerWidth;
    const taskbarH = taskbar ? taskbar.offsetHeight : 48;

    // Allow dragging freely into dialogue area — windows sit behind it (lower z-index)
    const desktopH = (desktop ? desktop.clientHeight : window.innerHeight) - taskbarH;

    const maxLeft = Math.max(0, desktopW - target.offsetWidth);
    const maxTop = Math.max(0, desktopH - target.offsetHeight);

    target.style.left = Math.min(maxLeft, Math.max(0, origLeft + dx)) + 'px';
    target.style.top = Math.min(maxTop, Math.max(0, origTop + dy)) + 'px';
  });

  document.addEventListener('mouseup', () => {
    if (target) target.classList.remove('dragging');
    dragging = false;
    target = null;
  });

  // Double click titlebar to toggle maximize (desktop experience)
  document.addEventListener('dblclick', e => {
    const titlebar = e.target.closest('.win-titlebar');
    if (!titlebar || e.target.closest('button') || e.target.closest('input')) return;
    const win = titlebar.closest('.app-window');
    if (!win) return;
    const appName = win.dataset.app;
    if (appName) toggleMaximize(appName);
  });
})();

// ── Click to focus ──
document.querySelectorAll('.app-window').forEach(win => {
  win.addEventListener('mousedown', () => {
    const appName = win.dataset.app;
    focusWindow(appName);
  });
});

// ═══════════════════════════════════════════════════════════
// CLOCK
// ═══════════════════════════════════════════════════════════

function updateClock() {
  const now = new Date();
  const rawHours = now.getHours();
  const ampm = rawHours >= 12 ? 'PM' : 'AM';
  const hours12 = (rawHours % 12) || 12;
  const m = now.getMinutes().toString().padStart(2, '0');
  const s = now.getSeconds().toString().padStart(2, '0');
  
  const timeEl = document.getElementById('taskbar-time');
  if (timeEl) timeEl.textContent = `${hours12}:${m} ${ampm}`;
  const dateEl = document.getElementById('taskbar-date');
  if (dateEl) dateEl.textContent = `${now.getMonth()+1}/${now.getDate()}/${now.getFullYear()}`;

  // Live seconds and full date in words for the calendar flyout
  const calLiveTime = document.getElementById('cal-live-time');
  if (calLiveTime) {
    calLiveTime.textContent = `${hours12.toString().padStart(2, '0')}:${m}:${s} ${ampm}`;
  }

  const calDateWords = document.getElementById('cal-date-words');
  if (calDateWords) {
    calDateWords.textContent = now.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  }
}
updateClock();
setInterval(updateClock, 1000);

// ═══════════════════════════════════════════════════════════
// OVERLAY SYSTEM
// ═══════════════════════════════════════════════════════════

function showOverlay(id) {
  // Hide desktop immediately so it never bleeds through during transition
  const desktop = document.getElementById('desktop');
  if (desktop) desktop.style.visibility = 'hidden';

  document.querySelectorAll('.overlay').forEach(o => {
    o.classList.remove('active');
    if (o.id !== id) o.style.display = 'none';
  });
  const target = document.getElementById(id);
  if (target) {
    target.style.display = '';
    target.classList.add('active');
  }
  const bd = document.getElementById('overlay-backdrop');
  if (bd) bd.classList.add('active');
}

function closeOverlay(id) {
  document.getElementById(id).classList.remove('active');
  const anyActive = document.querySelectorAll('.overlay.active').length > 0;
  if (!anyActive) {
    document.getElementById('overlay-backdrop').classList.remove('active');
    // Reveal desktop only when no overlays remain AND loading screen is not active
    const ls = document.getElementById('overlay-loading-screen');
    const loadingActive = ls && ls.classList.contains('ls-active');
    if (!loadingActive) {
      const desktop = document.getElementById('desktop');
      if (desktop) desktop.style.visibility = 'visible';
    }
  }
}

function hideAllOverlays(revealDesktop = false) {
  document.querySelectorAll('.overlay').forEach(o => {
    // Keep story select and main menu active if they are intentionally open
    if (o.id !== 'overlay-story-select' && o.id !== 'overlay-main-menu') {
      o.classList.remove('active');
    }
  });
  const bd = document.getElementById('overlay-backdrop');
  if (bd) bd.classList.remove('active');
  const av = document.getElementById('overlay-awareness-video');
  if (av) {
    av.classList.add('hidden');
    av.classList.remove('active');
    const vid = document.getElementById('awareness-real-video');
    if (vid) vid.pause();
  }
  const lp = document.getElementById('overlay-lock-paused');
  if (lp) {
    lp.classList.add('hidden');
    lp.classList.remove('slide-up');
  }

  // Only reveal desktop if explicitly requested AND neither loading/shutdown/story-select/main-menu is active
  const ls = document.getElementById('overlay-loading-screen');
  const loadingActive = ls && (ls.classList.contains('ls-active') || ls.classList.contains('ls-leaving'));
  const sd = document.getElementById('overlay-shutdown-screen');
  const shutdownActive = sd && (sd.classList.contains('sd-active') || sd.classList.contains('sd-leaving'));
  const ss = document.getElementById('overlay-story-select');
  const storyActive = ss && ss.classList.contains('active');
  const mm = document.getElementById('overlay-main-menu');
  const mmActive = mm && mm.classList.contains('active');
  const tm = document.getElementById('overlay-title-menu');
  const tmActive = tm && tm.classList.contains('active');

  if (revealDesktop && !loadingActive && !shutdownActive && !storyActive && !mmActive && !tmActive) {
    const desktop = document.getElementById('desktop');
    if (desktop) desktop.style.visibility = 'visible';
  }
}
