'use strict';

// ═══════════════════════════════════════════════════════════
// CHAPTER 1 COMIC STRIP VIEWER (PRO PANEL-BY-PANEL)
// ═══════════════════════════════════════════════════════════

const COMIC_PANEL_COUNT = 6;
const comicState = {
  panel: 0,
  autoTimer: null,
  isFinished: false,
  keyHandlerAttached: false
};

// Panel read durations in milliseconds for automatic show
const COMIC_PANEL_DELAYS = [2700, 2400, 2400, 2400, 2600, 2500];

/** Play a subtle futuristic chime when revealing each panel */
function _playComicPanelSound(index) {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    if (!window._comicAudioCtx) {
      window._comicAudioCtx = new AudioCtx();
    }
    const ctx = window._comicAudioCtx;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    // Harmonic arpeggio scale for panels 1 through 7
    const notes = [329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99];
    const freq = notes[index] || 440;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(0.09, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.22);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.24);
  } catch (e) {
    // Audio context may be restricted before user gesture
  }
}

/**
 * Image fallback handler for GitHub / Linux servers where case sensitivity matters (.png vs .PNG vs .jpg)
 * Also tries alternate folder casing (e.g. Character vs character).
 */
function imgCaseFallback(img, basePath, baseName) {
  if (!img) return;
  const currentSrc = img.getAttribute('src') || '';
  const step = parseInt(img.dataset.fallbackStep || '0', 10);
  // Build alternate folder path (toggle first-letter case)
  const altPath = basePath.replace(/([^/]+)$/, seg =>
    seg[0] === seg[0].toUpperCase()
      ? seg[0].toLowerCase() + seg.slice(1)
      : seg[0].toUpperCase() + seg.slice(1)
  );
  const candidates = [
    `${basePath}/${baseName}.png`,
    `${basePath}/${baseName}.PNG`,
    `${altPath}/${baseName}.png`,
    `${altPath}/${baseName}.PNG`,
    `${basePath}/${baseName.toLowerCase()}.png`,
    `${basePath}/${baseName.toLowerCase()}.PNG`,
    `${basePath}/${baseName}.jpg`,
    `${basePath}/${baseName}.JPG`
  ].filter(src => src !== currentSrc);

  if (step < candidates.length) {
    img.dataset.fallbackStep = String(step + 1);
    img.src = candidates[step];
  }
}

function comicPanelFallback(img, panelName) {
  imgCaseFallback(img, 'assets/Chapter1', panelName);
}

function comicPanelCh3Fallback(img, panelName) {
  imgCaseFallback(img, 'assets/Chapter3', panelName);
}

function comicPanelCh4Fallback(img, panelName) {
  imgCaseFallback(img, 'assets/Chapter4', panelName);
}

function profileAvatarFallback(img) {
  if (!img) return;
  const baseName = (img.alt && img.alt.trim()) ? img.alt.trim() : 'Alex';
  imgCaseFallback(img, 'assets/Character', baseName);
}

/** Global keyboard handler for comic viewer */
function _comicKeyHandler(e) {
  const overlay = document.getElementById('overlay-comic-strip');
  if (!overlay || !overlay.classList.contains('active')) return;

  if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') {
    e.preventDefault();
    if (!comicState.isFinished) {
      comicStripAdvance();
    }
  } else if (e.key === 'Escape') {
    e.preventDefault();
    comicStripFinish();
  }
}

/** Open the Chapter 1 Comic Strip Viewer and start automatic playback */
function showComicStrip(chapter) {
  if (chapter === 'malware' || chapter === 2 || chapter === 'Chapter2' || chapter === 'ch2') {
    showComicStripCh2();
    return;
  }
  if (chapter === 'social_engineering' || chapter === 'social-engineering' || chapter === 'social' || chapter === 3 || chapter === 'Chapter3' || chapter === 'ch3') {
    showComicStripCh3();
    return;
  }
  if (chapter === 'ransomware' || chapter === 4 || chapter === 'Chapter4' || chapter === 'ch4') {
    showComicStripCh4();
    return;
  }

  const overlay = document.getElementById('overlay-comic-strip');
  if (!overlay) {
    _proceedToAlexPassword();
    return;
  }

  // Hide desktop behind overlay
  const desktop = document.getElementById('desktop');
  if (desktop) desktop.style.visibility = 'hidden';

  // Deactivate any other overlays cleanly
  document.querySelectorAll('.overlay').forEach(o => {
    o.classList.remove('active');
    if (o.id !== 'overlay-comic-strip') o.style.display = 'none';
  });
  overlay.style.display = 'flex';
  overlay.classList.add('active');

  // Synchronize fullscreen button visibility
  if (typeof _syncComicFsBtn === 'function') _syncComicFsBtn();

  // Clear any existing timer
  if (comicState.autoTimer) {
    clearTimeout(comicState.autoTimer);
    comicState.autoTimer = null;
  }

  comicState.panel = 0;
  comicState.isFinished = false;

  // Reset the finish button to hidden
  const finishWrap = document.getElementById('comic-finish-wrap');
  if (finishWrap) {
    finishWrap.style.opacity = '0';
    finishWrap.style.pointerEvents = 'none';
  }

  // Reset all panel card states
  for (let i = 0; i < COMIC_PANEL_COUNT; i++) {
    const card = document.getElementById(`comic-panel-${i}`);
    if (card) {
      card.classList.remove('revealed', 'active');
    }
  }

  // Attach keyboard controls once
  if (!comicState.keyHandlerAttached) {
    window.addEventListener('keydown', _comicKeyHandler);
    comicState.keyHandlerAttached = true;
  }

  // Reset scroll position to top
  const stage = document.getElementById('comic-stage');
  if (stage) {
    stage.scrollTop = 0;
    stage.classList.remove('finished');
  }

  // Reveal the first panel automatically
  comicStripShowPanel(0);

  // Start Chapter 1 background music — "Office Infiltration" (Phishing suspense)
  if (typeof ComicAudio !== 'undefined') ComicAudio.play('ch1');
}

/** Show a specific comic panel (0-indexed: 0 to 5) and schedule the next panel automatically */
function comicStripShowPanel(index) {
  if (index < 0 || index >= COMIC_PANEL_COUNT) return;
  comicState.panel = index;

  // Update panel card states — revealed panels stay visible (dimmed), active panel glows
  for (let i = 0; i < COMIC_PANEL_COUNT; i++) {
    const card = document.getElementById(`comic-panel-${i}`);
    if (!card) continue;
    if (i < index) {
      card.classList.add('revealed');
      card.classList.remove('active');
    } else if (i === index) {
      card.classList.add('revealed', 'active');
    } else {
      card.classList.remove('revealed', 'active');
    }
  }

  // Update panel counter (e.g. "2 / 6")
  const counter = document.getElementById('comic-panel-counter');
  if (counter) {
    counter.textContent = `${index + 1} / ${COMIC_PANEL_COUNT}`;
    counter.classList.add('visible');
  }


  // Play audio chime
  _playComicPanelSound(index);

  // Clear any existing auto-timer before scheduling next
  if (comicState.autoTimer) {
    clearTimeout(comicState.autoTimer);
    comicState.autoTimer = null;
  }

  // If this is the last panel (all panels shown)
  if (index === COMIC_PANEL_COUNT - 1) {
    // Reveal the "Tap to continue" button with desktop icon after a brief pause
    comicState.autoTimer = setTimeout(() => {
      _showComicFinishButton();
    }, 900);
  } else {
    // Show tap hint on first panel, hide afterwards
    const hint = document.getElementById('comic-tap-hint');
    if (hint) {
      if (index === 0) {
        setTimeout(() => hint.classList.add('visible'), 1200);
      } else {
        hint.classList.remove('visible');
      }
    }
    // Automatically advance to the next panel after delay
    const delay = COMIC_PANEL_DELAYS[index] || 2500;
    comicState.autoTimer = setTimeout(() => {
      comicStripShowPanel(index + 1);
    }, delay);
  }
}

/** Reveal the finish button (Tap to continue + desktop icon) */
function _showComicFinishButton() {
  comicState.isFinished = true;
  const finishWrap = document.getElementById('comic-finish-wrap');
  if (finishWrap) {
    finishWrap.style.opacity = '1';
    finishWrap.style.pointerEvents = 'auto';
  }
  const stage = document.getElementById('comic-stage');
  if (stage) {
    stage.classList.add('finished');
  }
  // Hide tap hint when finish button appears
  const hint = document.getElementById('comic-tap-hint');
  if (hint) hint.classList.remove('visible');
}

/** Advance to next panel on tap/click or finish if all panels are done */
function comicStripAdvance(e) {
  // If all panels are finished, user must click the "Tap to continue" button directly
  if (comicState.isFinished) {
    return;
  }

  // If still revealing panels, tapping allows user to advance immediately without waiting
  if (comicState.autoTimer) {
    clearTimeout(comicState.autoTimer);
    comicState.autoTimer = null;
  }

  const next = comicState.panel + 1;
  if (next >= COMIC_PANEL_COUNT) {
    _showComicFinishButton();
  } else {
    comicStripShowPanel(next);
  }
}

/** Finish comic strip and proceed to Alex password sign-in */
function comicStripFinish() {
  // Stop Chapter 1 comic background music
  if (typeof ComicAudio !== 'undefined') ComicAudio.stop();

  if (comicState.autoTimer) {
    clearTimeout(comicState.autoTimer);
    comicState.autoTimer = null;
  }

  const stage = document.getElementById('comic-stage');
  if (stage) stage.classList.remove('finished');

  const overlay = document.getElementById('overlay-comic-strip');
  if (overlay) {
    overlay.classList.remove('active');
    overlay.style.display = 'none';
  }
  if (typeof _syncComicFsBtn === 'function') _syncComicFsBtn();

  // Reset counter and hint
  const counter = document.getElementById('comic-panel-counter');
  if (counter) counter.classList.remove('visible');
  const hint = document.getElementById('comic-tap-hint');
  if (hint) hint.classList.remove('visible');

  // Remove keydown handler
  if (comicState.keyHandlerAttached) {
    window.removeEventListener('keydown', _comicKeyHandler);
    comicState.keyHandlerAttached = false;
  }

  // Proceed directly to the Windows 10 Alex password login screen
  _proceedToAlexPassword();
}

/** Helper to show the Windows 10 login screen for Alex to enter password */
function _proceedToAlexPassword() {
  window._pendingStoryChapter = 'phishing';
  updateLoginScreenForChapter('phishing');
  const tm = document.getElementById('overlay-title-menu');
  if (tm) {
    tm.style.display = '';
    tm.classList.add('active');
  }
  if (typeof lsDismissError === 'function') lsDismissError();
  setTimeout(() => {
    const inp = document.getElementById('ls-name-input');
    if (inp) {
      inp.value = '';
      inp.focus();
    }
  }, 380);
}

// ═══════════════════════════════════════════════════════════
// CHAPTER 2 COMIC STRIP VIEWER (ETHAN GAMING & MALWARE SETUP)
// ═══════════════════════════════════════════════════════════

const COMIC_CH2_PANEL_COUNT = 5;
const comicStateCh2 = {
  panel: 0,
  autoTimer: null,
  isFinished: false,
  keyHandlerAttached: false
};

// Panel read durations in milliseconds for automatic show
const COMIC_CH2_PANEL_DELAYS = [2800, 2600, 2600, 2600, 2800];

function comicPanelCh2Fallback(img, panelName) {
  imgCaseFallback(img, 'assets/Chapter2', panelName);
}

/** Global keyboard handler for Chapter 2 comic viewer */
function _comicKeyHandlerCh2(e) {
  const overlay = document.getElementById('overlay-comic-strip-ch2');
  if (!overlay || !overlay.classList.contains('active')) return;

  if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') {
    e.preventDefault();
    if (!comicStateCh2.isFinished) {
      comicStripCh2Advance();
    }
  } else if (e.key === 'Escape') {
    e.preventDefault();
    comicStripCh2Finish();
  }
}

/** Open the Chapter 2 Comic Strip Viewer and start automatic playback */
function showComicStripCh2() {
  const overlay = document.getElementById('overlay-comic-strip-ch2');
  if (!overlay) {
    _launchChapter2FromComic();
    return;
  }

  // Hide desktop behind overlay
  const desktop = document.getElementById('desktop');
  if (desktop) desktop.style.visibility = 'hidden';

  // Deactivate any other overlays cleanly
  document.querySelectorAll('.overlay').forEach(o => {
    o.classList.remove('active');
    if (o.id !== 'overlay-comic-strip-ch2') o.style.display = 'none';
  });
  overlay.style.display = 'flex';
  overlay.classList.add('active');

  // Synchronize fullscreen button visibility
  if (typeof _syncComicFsBtn === 'function') _syncComicFsBtn();

  // Clear any existing timer
  if (comicStateCh2.autoTimer) {
    clearTimeout(comicStateCh2.autoTimer);
    comicStateCh2.autoTimer = null;
  }

  comicStateCh2.panel = 0;
  comicStateCh2.isFinished = false;

  // Reset the finish button to hidden
  const finishWrap = document.getElementById('comic-finish-wrap-ch2');
  if (finishWrap) {
    finishWrap.style.opacity = '0';
    finishWrap.style.pointerEvents = 'none';
  }

  // Reset all panel card states
  for (let i = 0; i < COMIC_CH2_PANEL_COUNT; i++) {
    const card = document.getElementById(`comic-panel-ch2-${i}`);
    if (card) {
      card.classList.remove('revealed', 'active');
    }
  }

  // Attach keyboard controls once
  if (!comicStateCh2.keyHandlerAttached) {
    window.addEventListener('keydown', _comicKeyHandlerCh2);
    comicStateCh2.keyHandlerAttached = true;
  }

  // Reset scroll position to top
  const stage = document.getElementById('comic-stage-ch2');
  if (stage) {
    stage.scrollTop = 0;
    stage.classList.remove('finished');
  }

  // Reveal the first panel automatically
  comicStripCh2ShowPanel(0);

  // Start Chapter 2 background music — "System Breach" (Malware dark-tech)
  if (typeof ComicAudio !== 'undefined') ComicAudio.play('ch2');
}

/** Show a specific Chapter 2 comic panel (0-indexed: 0 to 4) and schedule the next panel automatically */
function comicStripCh2ShowPanel(index) {
  if (index < 0 || index >= COMIC_CH2_PANEL_COUNT) return;
  comicStateCh2.panel = index;

  // Update panel card states — revealed panels stay visible (dimmed), active panel glows
  for (let i = 0; i < COMIC_CH2_PANEL_COUNT; i++) {
    const card = document.getElementById(`comic-panel-ch2-${i}`);
    if (!card) continue;
    if (i < index) {
      card.classList.add('revealed');
      card.classList.remove('active');
    } else if (i === index) {
      card.classList.add('revealed', 'active');
    } else {
      card.classList.remove('revealed', 'active');
    }
  }

  // Play audio chime
  _playComicPanelSound(index);

  // Clear any existing auto-timer before scheduling next
  if (comicStateCh2.autoTimer) {
    clearTimeout(comicStateCh2.autoTimer);
    comicStateCh2.autoTimer = null;
  }

  // If this is the last panel (all panels shown)
  if (index === COMIC_CH2_PANEL_COUNT - 1) {
    // Reveal the "Tap to continue" button with desktop icon after a brief pause
    comicStateCh2.autoTimer = setTimeout(() => {
      _showComicCh2FinishButton();
    }, 900);
  } else {
    // Show tap hint on first panel, hide afterwards
    const hint = document.getElementById('comic-tap-hint-ch2');
    if (hint) {
      if (index === 0) {
        setTimeout(() => hint.classList.add('visible'), 1200);
      } else {
        hint.classList.remove('visible');
      }
    }
    // Automatically advance to the next panel after delay
    const delay = COMIC_CH2_PANEL_DELAYS[index] || 2600;
    comicStateCh2.autoTimer = setTimeout(() => {
      comicStripCh2ShowPanel(index + 1);
    }, delay);
  }
}

/** Reveal Chapter 2 finish button (Tap to continue + desktop icon) */
function _showComicCh2FinishButton() {
  comicStateCh2.isFinished = true;
  const finishWrap = document.getElementById('comic-finish-wrap-ch2');
  if (finishWrap) {
    finishWrap.style.opacity = '1';
    finishWrap.style.pointerEvents = 'auto';
  }
  const stage = document.getElementById('comic-stage-ch2');
  if (stage) {
    stage.classList.add('finished');
  }
  // Hide tap hint when finish button appears
  const hint = document.getElementById('comic-tap-hint-ch2');
  if (hint) hint.classList.remove('visible');
}

/** Advance Chapter 2 comic to next panel on tap/click or finish if all panels are done */
function comicStripCh2Advance(e) {
  // If all panels are finished, user must click the "Tap to continue" button directly
  if (comicStateCh2.isFinished) {
    return;
  }

  // If still revealing panels, tapping allows user to advance immediately without waiting
  if (comicStateCh2.autoTimer) {
    clearTimeout(comicStateCh2.autoTimer);
    comicStateCh2.autoTimer = null;
  }

  const next = comicStateCh2.panel + 1;
  if (next >= COMIC_CH2_PANEL_COUNT) {
    _showComicCh2FinishButton();
  } else {
    comicStripCh2ShowPanel(next);
  }
}

/** Finish Chapter 2 comic strip and launch Chapter 2 mission */
function comicStripCh2Finish() {
  // Stop Chapter 2 comic background music
  if (typeof ComicAudio !== 'undefined') ComicAudio.stop();

  if (comicStateCh2.autoTimer) {
    clearTimeout(comicStateCh2.autoTimer);
    comicStateCh2.autoTimer = null;
  }

  const stage = document.getElementById('comic-stage-ch2');
  if (stage) stage.classList.remove('finished');

  const overlay = document.getElementById('overlay-comic-strip-ch2');
  if (overlay) {
    overlay.classList.remove('active');
    overlay.style.display = 'none';
  }
  if (typeof _syncComicFsBtn === 'function') _syncComicFsBtn();

  const hint = document.getElementById('comic-tap-hint-ch2');
  if (hint) hint.classList.remove('visible');

  if (comicStateCh2.keyHandlerAttached) {
    window.removeEventListener('keydown', _comicKeyHandlerCh2);
    comicStateCh2.keyHandlerAttached = false;
  }

  // Proceed directly to the Windows 10 Ethan password login screen
  _proceedToEthanPassword();
}

/** Helper to show the Windows 10 login screen for Ethan to enter password */
function _proceedToEthanPassword() {
  window._pendingStoryChapter = 'malware';
  updateLoginScreenForChapter('malware');
  const tm = document.getElementById('overlay-title-menu');
  if (tm) {
    tm.style.display = '';
    tm.classList.add('active');
  }
  if (typeof lsDismissError === 'function') lsDismissError();
  setTimeout(() => {
    const inp = document.getElementById('ls-name-input');
    if (inp) {
      inp.value = '';
      inp.focus();
    }
  }, 380);
}

/** Smooth transition into Chapter 2 desktop with Windows 10 loading screen */
function _launchChapter2FromComic() {
  if (typeof window.clearWorkstationLogoffGuide === 'function') {
    window.clearWorkstationLogoffGuide();
  }
  const ls = document.getElementById('overlay-loading-screen');
  if (ls) {
    ls.style.display = 'flex';
    const titleEl = document.getElementById('win-loading-title');
    if (titleEl) titleEl.textContent = 'Just a moment...';
    ls.classList.remove('ls-leaving');
    ls.classList.add('ls-active');
    if (typeof _playLoadingBeep === 'function') _playLoadingBeep(320, 0.12, 0);

    const DURATION = 3200;
    const noteEl = document.getElementById('win-loading-note-text');
    if (typeof LOADING_TIPS !== 'undefined' && LOADING_TIPS.length > 0) {
      let tipIdx = Math.floor(Math.random() * LOADING_TIPS.length);
      if (noteEl) noteEl.textContent = LOADING_TIPS[tipIdx].text;
    }

    setTimeout(() => {
      if (typeof _playLoadingBeep === 'function') {
        _playLoadingBeep(440, 0.12, 0);
        _playLoadingBeep(660, 0.12, 0.12);
        _playLoadingBeep(880, 0.18, 0.24);
      }
      openChapterDesktopDirect('malware');
      setTimeout(() => {
        ls.classList.add('ls-leaving');
        setTimeout(() => ls.classList.remove('ls-active', 'ls-leaving'), 800);
      }, 300);
    }, DURATION);
  } else {
    openChapterDesktopDirect('malware');
  }
}

// ═══════════════════════════════════════════════════════════
// CHAPTER 3 COMIC STRIP VIEWER (PIA SOCIAL MEDIA & STALKER)
// ═══════════════════════════════════════════════════════════

const COMIC_CH3_PANEL_COUNT = 7;
const comicStateCh3 = {
  panel: 0,
  autoTimer: null,
  isFinished: false,
  keyHandlerAttached: false
};

// Panel read durations in milliseconds for automatic show
const COMIC_CH3_PANEL_DELAYS = [2800, 2600, 2600, 2600, 2700, 2800, 3400];

/** Global keyboard handler for Chapter 3 comic viewer */
function _comicKeyHandlerCh3(e) {
  const overlay = document.getElementById('overlay-comic-strip-ch3');
  if (!overlay || !overlay.classList.contains('active')) return;

  if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') {
    e.preventDefault();
    if (!comicStateCh3.isFinished) {
      comicStripCh3Advance();
    }
  } else if (e.key === 'Escape') {
    e.preventDefault();
    comicStripCh3Finish();
  }
}

/** Open the Chapter 3 Comic Strip Viewer and start automatic playback */
function showComicStripCh3() {
  const overlay = document.getElementById('overlay-comic-strip-ch3');
  if (!overlay) {
    _proceedToPiaPassword();
    return;
  }

  // Hide desktop behind overlay
  const desktop = document.getElementById('desktop');
  if (desktop) desktop.style.visibility = 'hidden';

  // Deactivate any other overlays cleanly
  document.querySelectorAll('.overlay').forEach(o => {
    o.classList.remove('active');
    if (o.id !== 'overlay-comic-strip-ch3') o.style.display = 'none';
  });
  overlay.style.display = 'flex';
  overlay.classList.add('active');

  // Synchronize fullscreen button visibility
  if (typeof _syncComicFsBtn === 'function') _syncComicFsBtn();

  // Clear any existing timer
  if (comicStateCh3.autoTimer) {
    clearTimeout(comicStateCh3.autoTimer);
    comicStateCh3.autoTimer = null;
  }

  comicStateCh3.panel = 0;
  comicStateCh3.isFinished = false;

  // Reset the finish button to hidden
  const finishWrap = document.getElementById('comic-finish-wrap-ch3');
  if (finishWrap) {
    finishWrap.style.opacity = '0';
    finishWrap.style.pointerEvents = 'none';
  }

  // Reset all panel card states
  for (let i = 0; i < COMIC_CH3_PANEL_COUNT; i++) {
    const card = document.getElementById(`comic-panel-ch3-${i}`);
    if (card) {
      card.classList.remove('revealed', 'active');
    }
  }

  // Attach keyboard controls once
  if (!comicStateCh3.keyHandlerAttached) {
    window.addEventListener('keydown', _comicKeyHandlerCh3);
    comicStateCh3.keyHandlerAttached = true;
  }

  // Reset scroll position to top
  const stage = document.getElementById('comic-stage-ch3');
  if (stage) {
    stage.scrollTop = 0;
    stage.classList.remove('finished');
  }

  // Reveal the first panel automatically
  comicStripCh3ShowPanel(0);

  // Start Chapter 3 background music — "Digital Shadows" (Social engineering)
  if (typeof ComicAudio !== 'undefined') ComicAudio.play('ch3');
}

/** Show a specific Chapter 3 comic panel (0-indexed: 0 to 6) and schedule the next panel automatically */
function comicStripCh3ShowPanel(index) {
  if (index < 0 || index >= COMIC_CH3_PANEL_COUNT) return;
  comicStateCh3.panel = index;

  // Update panel card states — revealed panels stay visible, active panel pops
  for (let i = 0; i < COMIC_CH3_PANEL_COUNT; i++) {
    const card = document.getElementById(`comic-panel-ch3-${i}`);
    if (!card) continue;
    if (i < index) {
      card.classList.add('revealed');
      card.classList.remove('active');
    } else if (i === index) {
      card.classList.add('revealed', 'active');
    } else {
      card.classList.remove('revealed', 'active');
    }
  }

  // Play audio chime
  _playComicPanelSound(index);

  // Clear any existing auto-timer before scheduling next
  if (comicStateCh3.autoTimer) {
    clearTimeout(comicStateCh3.autoTimer);
    comicStateCh3.autoTimer = null;
  }

  // If this is the last panel (all panels shown)
  if (index === COMIC_CH3_PANEL_COUNT - 1) {
    // Reveal the "Tap to continue" button with desktop icon after a brief pause
    comicStateCh3.autoTimer = setTimeout(() => {
      _showComicCh3FinishButton();
    }, 900);
  } else {
    // Show tap hint on first panel, hide afterwards
    const hint = document.getElementById('comic-tap-hint-ch3');
    if (hint) {
      if (index === 0) {
        setTimeout(() => hint.classList.add('visible'), 1200);
      } else {
        hint.classList.remove('visible');
      }
    }
    // Automatically advance to the next panel after delay
    const delay = COMIC_CH3_PANEL_DELAYS[index] || 2700;
    comicStateCh3.autoTimer = setTimeout(() => {
      comicStripCh3ShowPanel(index + 1);
    }, delay);
  }
}

/** Reveal Chapter 3 finish button (Tap to continue + desktop icon) */
function _showComicCh3FinishButton() {
  comicStateCh3.isFinished = true;
  const finishWrap = document.getElementById('comic-finish-wrap-ch3');
  if (finishWrap) {
    finishWrap.style.opacity = '1';
    finishWrap.style.pointerEvents = 'auto';
  }
  const stage = document.getElementById('comic-stage-ch3');
  if (stage) {
    stage.classList.add('finished');
  }
  // Hide tap hint when finish button appears
  const hint = document.getElementById('comic-tap-hint-ch3');
  if (hint) hint.classList.remove('visible');
}

/** Advance Chapter 3 comic to next panel on tap/click or finish if all panels are done */
function comicStripCh3Advance(e) {
  if (comicStateCh3.isFinished) {
    return;
  }

  if (comicStateCh3.autoTimer) {
    clearTimeout(comicStateCh3.autoTimer);
    comicStateCh3.autoTimer = null;
  }

  const next = comicStateCh3.panel + 1;
  if (next >= COMIC_CH3_PANEL_COUNT) {
    _showComicCh3FinishButton();
  } else {
    comicStripCh3ShowPanel(next);
  }
}

/** Finish Chapter 3 comic strip and proceed to Pia password login screen */
function comicStripCh3Finish() {
  // Stop Chapter 3 comic background music
  if (typeof ComicAudio !== 'undefined') ComicAudio.stop();

  if (comicStateCh3.autoTimer) {
    clearTimeout(comicStateCh3.autoTimer);
    comicStateCh3.autoTimer = null;
  }

  const stage = document.getElementById('comic-stage-ch3');
  if (stage) stage.classList.remove('finished');

  const overlay = document.getElementById('overlay-comic-strip-ch3');
  if (overlay) {
    overlay.classList.remove('active');
    overlay.style.display = 'none';
  }
  if (typeof _syncComicFsBtn === 'function') _syncComicFsBtn();

  const hint = document.getElementById('comic-tap-hint-ch3');
  if (hint) hint.classList.remove('visible');

  if (comicStateCh3.keyHandlerAttached) {
    window.removeEventListener('keydown', _comicKeyHandlerCh3);
    comicStateCh3.keyHandlerAttached = false;
  }

  // Proceed directly to the Windows 10 Pia password login screen
  _proceedToPiaPassword();
}

/** Helper to show the Windows 10 login screen for Pia to enter password */
function _proceedToPiaPassword() {
  window._pendingStoryChapter = 'social_engineering';
  updateLoginScreenForChapter('social_engineering');
  const tm = document.getElementById('overlay-title-menu');
  if (tm) {
    tm.style.display = '';
    tm.classList.add('active');
  }
  if (typeof lsDismissError === 'function') lsDismissError();
  setTimeout(() => {
    const inp = document.getElementById('ls-name-input');
    if (inp) {
      inp.value = '';
      inp.focus();
    }
  }, 380);
}

/** Smooth transition into Chapter 3 desktop with Windows 10 loading screen */
function _launchChapter3FromComic() {
  const ls = document.getElementById('overlay-loading-screen');
  if (ls) {
    ls.style.display = 'flex';
    const titleEl = document.getElementById('win-loading-title');
    if (titleEl) titleEl.textContent = 'Just a moment...';
    ls.classList.remove('ls-leaving');
    ls.classList.add('ls-active');
    if (typeof _playLoadingBeep === 'function') _playLoadingBeep(320, 0.12, 0);

    const DURATION = 3200;
    const noteEl = document.getElementById('win-loading-note-text');
    if (typeof LOADING_TIPS !== 'undefined' && LOADING_TIPS.length > 0) {
      let tipIdx = Math.floor(Math.random() * LOADING_TIPS.length);
      if (noteEl) noteEl.textContent = LOADING_TIPS[tipIdx].text;
    }

    setTimeout(() => {
      if (typeof _playLoadingBeep === 'function') {
        _playLoadingBeep(440, 0.12, 0);
        _playLoadingBeep(660, 0.12, 0.12);
        _playLoadingBeep(880, 0.18, 0.24);
      }
      openChapterDesktopDirect('social_engineering');
      setTimeout(() => {
        ls.classList.add('ls-leaving');
        setTimeout(() => ls.classList.remove('ls-active', 'ls-leaving'), 800);
      }, 300);
    }, DURATION);
  } else {
    openChapterDesktopDirect('social_engineering');
  }
}

// ═══════════════════════════════════════════════════════════
// CHAPTER 4 COMIC STRIP VIEWER (RANSOMWARE ATTACK)
// ═══════════════════════════════════════════════════════════

const COMIC_CH4_PANEL_COUNT = 9;
const comicStateCh4 = {
  panel: 0,
  autoTimer: null,
  isFinished: false,
  keyHandlerAttached: false
};

// Panel read durations in milliseconds for automatic show
const COMIC_CH4_PANEL_DELAYS = [2800, 2400, 2800, 2800, 2800, 2800, 2800, 2800, 3200];

/** Global keyboard handler for Chapter 4 comic viewer */
function _comicKeyHandlerCh4(e) {
  const overlay = document.getElementById('overlay-comic-strip-ch4');
  if (!overlay || !overlay.classList.contains('active')) return;

  if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') {
    e.preventDefault();
    if (!comicStateCh4.isFinished) {
      comicStripCh4Advance();
    }
  } else if (e.key === 'Escape') {
    e.preventDefault();
    comicStripCh4Finish();
  }
}

/** Open the Chapter 4 Comic Strip Viewer and start automatic playback */
function showComicStripCh4() {
  const overlay = document.getElementById('overlay-comic-strip-ch4');
  if (!overlay) {
    _proceedToRyanPassword();
    return;
  }

  // Hide desktop behind overlay
  const desktop = document.getElementById('desktop');
  if (desktop) desktop.style.visibility = 'hidden';

  // Deactivate any other overlays cleanly
  document.querySelectorAll('.overlay').forEach(o => {
    o.classList.remove('active');
    if (o.id !== 'overlay-comic-strip-ch4') o.style.display = 'none';
  });
  overlay.style.display = 'flex';
  overlay.classList.add('active');

  // Synchronize fullscreen button visibility
  if (typeof _syncComicFsBtn === 'function') _syncComicFsBtn();

  // Clear any existing timer
  if (comicStateCh4.autoTimer) {
    clearTimeout(comicStateCh4.autoTimer);
    comicStateCh4.autoTimer = null;
  }

  comicStateCh4.panel = 0;
  comicStateCh4.isFinished = false;

  // Reset the finish button to hidden
  const finishWrap = document.getElementById('comic-finish-wrap-ch4');
  if (finishWrap) {
    finishWrap.style.opacity = '0';
    finishWrap.style.pointerEvents = 'none';
  }

  // Reset all panel card states
  for (let i = 0; i < COMIC_CH4_PANEL_COUNT; i++) {
    const card = document.getElementById(`comic-panel-ch4-${i}`);
    if (card) {
      card.classList.remove('revealed', 'active');
    }
  }

  // Attach keyboard controls once
  if (!comicStateCh4.keyHandlerAttached) {
    window.addEventListener('keydown', _comicKeyHandlerCh4);
    comicStateCh4.keyHandlerAttached = true;
  }

  // Reset scroll position to top
  const stage = document.getElementById('comic-stage-ch4');
  if (stage) {
    stage.scrollTop = 0;
    stage.classList.remove('finished');
  }

  // Reveal the first panel automatically
  comicStripCh4ShowPanel(0);

  // Start Chapter 4 background music — "Encrypted Nightmare" (Ransomware horror)
  if (typeof ComicAudio !== 'undefined') ComicAudio.play('ch4');
}

/** Show a specific Chapter 4 comic panel (0-indexed: 0 to 8) and schedule the next panel automatically */
function comicStripCh4ShowPanel(index) {
  if (index < 0 || index >= COMIC_CH4_PANEL_COUNT) return;
  comicStateCh4.panel = index;

  // Update panel card states — revealed panels stay visible, active panel pops
  for (let i = 0; i < COMIC_CH4_PANEL_COUNT; i++) {
    const card = document.getElementById(`comic-panel-ch4-${i}`);
    if (!card) continue;
    if (i < index) {
      card.classList.add('revealed');
      card.classList.remove('active');
    } else if (i === index) {
      card.classList.add('revealed', 'active');
    } else {
      card.classList.remove('revealed', 'active');
    }
  }

  // Play audio chime
  _playComicPanelSound(index % 7);

  // Clear any existing auto-timer before scheduling next
  if (comicStateCh4.autoTimer) {
    clearTimeout(comicStateCh4.autoTimer);
    comicStateCh4.autoTimer = null;
  }

  // If this is the last panel (all panels shown)
  if (index === COMIC_CH4_PANEL_COUNT - 1) {
    // Reveal the "Tap to continue" button with desktop icon after a brief pause
    comicStateCh4.autoTimer = setTimeout(() => {
      _showComicCh4FinishButton();
    }, 900);
  } else {
    // Show tap hint on first panel, hide afterwards
    const hint = document.getElementById('comic-tap-hint-ch4');
    if (hint) {
      if (index === 0) {
        setTimeout(() => hint.classList.add('visible'), 1200);
      } else {
        hint.classList.remove('visible');
      }
    }
    // Automatically advance to the next panel after delay
    const delay = COMIC_CH4_PANEL_DELAYS[index] || 2800;
    comicStateCh4.autoTimer = setTimeout(() => {
      comicStripCh4ShowPanel(index + 1);
    }, delay);
  }
}

/** Reveal Chapter 4 finish button (Tap to continue + desktop icon) */
function _showComicCh4FinishButton() {
  comicStateCh4.isFinished = true;
  const finishWrap = document.getElementById('comic-finish-wrap-ch4');
  if (finishWrap) {
    finishWrap.style.opacity = '1';
    finishWrap.style.pointerEvents = 'auto';
  }
  const stage = document.getElementById('comic-stage-ch4');
  if (stage) {
    stage.classList.add('finished');
  }
  // Hide tap hint when finish button appears
  const hint = document.getElementById('comic-tap-hint-ch4');
  if (hint) hint.classList.remove('visible');
}

/** Advance Chapter 4 comic to next panel on tap/click or finish if all panels are done */
function comicStripCh4Advance(e) {
  if (comicStateCh4.isFinished) {
    return;
  }

  if (comicStateCh4.autoTimer) {
    clearTimeout(comicStateCh4.autoTimer);
    comicStateCh4.autoTimer = null;
  }

  const next = comicStateCh4.panel + 1;
  if (next >= COMIC_CH4_PANEL_COUNT) {
    _showComicCh4FinishButton();
  } else {
    comicStripCh4ShowPanel(next);
  }
}

/** Finish Chapter 4 comic strip and proceed to Ryan password login screen */
function comicStripCh4Finish() {
  // Stop Chapter 4 comic background music
  if (typeof ComicAudio !== 'undefined') ComicAudio.stop();

  if (comicStateCh4.autoTimer) {
    clearTimeout(comicStateCh4.autoTimer);
    comicStateCh4.autoTimer = null;
  }

  const stage = document.getElementById('comic-stage-ch4');
  if (stage) stage.classList.remove('finished');

  const overlay = document.getElementById('overlay-comic-strip-ch4');
  if (overlay) {
    overlay.classList.remove('active');
    overlay.style.display = 'none';
  }

  const hint = document.getElementById('comic-tap-hint-ch4');
  if (hint) hint.classList.remove('visible');

  if (comicStateCh4.keyHandlerAttached) {
    window.removeEventListener('keydown', _comicKeyHandlerCh4);
    comicStateCh4.keyHandlerAttached = false;
  }

  if (typeof _syncComicFsBtn === 'function') _syncComicFsBtn();

  // Proceed directly to the Windows 10 Ryan password login screen
  _proceedToRyanPassword();
}

/** Helper to show the Windows 10 login screen for Ryan to enter password */
function _proceedToRyanPassword() {
  window._pendingStoryChapter = 'ransomware';
  updateLoginScreenForChapter('ransomware');
  const tm = document.getElementById('overlay-title-menu');
  if (tm) {
    tm.style.display = '';
    tm.classList.add('active');
  }
  if (typeof lsDismissError === 'function') lsDismissError();
  setTimeout(() => {
    const inp = document.getElementById('ls-name-input');
    if (inp) {
      inp.value = '';
      inp.focus();
    }
  }, 380);
}

/** Synchronize comic fullscreen button visibility across all chapters */
function _syncComicFsBtn() {
  const btn = document.getElementById('comic-fs-btn');
  if (!btn) return;
  const overlays = [
    'overlay-comic-strip',
    'overlay-comic-strip-ch2',
    'overlay-comic-strip-ch3',
    'overlay-comic-strip-ch4'
  ];
  const isAnyActive = overlays.some(id => {
    const el = document.getElementById(id);
    return el && (el.classList.contains('active') || el.style.display === 'flex');
  });
  btn.classList.toggle('comic-fs-visible', isAnyActive);
}

// Observe comic overlays to automatically sync fullscreen button visibility
(function initComicFsObserver() {
  function setup() {
    _syncComicFsBtn();
    const overlayIds = [
      'overlay-comic-strip',
      'overlay-comic-strip-ch2',
      'overlay-comic-strip-ch3',
      'overlay-comic-strip-ch4'
    ];
    overlayIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        new MutationObserver(function () {
          _syncComicFsBtn();
        }).observe(el, { attributes: true, attributeFilter: ['class', 'style'] });
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup);
  } else {
    setup();
  }
})();
