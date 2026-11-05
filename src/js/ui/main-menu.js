'use strict';

// ════════════════════════════════════════════════════════════
//  MAIN MENU FUNCTIONS
// ════════════════════════════════════════════════════════════

/** Show the main menu overlay */
function showMainMenu() {
  // Ensure any active comic audio is stopped when main menu appears
  if (typeof ComicAudio !== 'undefined') ComicAudio.stop(); // Stop comic audio in main menu
  // If Google sign-in auth overlay is active, do not show main menu or start background sound
  const authEl = document.getElementById('cz-auth');
  if (authEl && authEl.classList.contains('active')) {
    if (typeof stopMMBgMusic === 'function') stopMMBgMusic();
    return;
  }

  const mm = document.getElementById('overlay-main-menu');
  if (mm) {
    // Restore any inline styles that were force-set when hiding
    mm.style.display = '';
    mm.style.zIndex  = '';
    mm.style.pointerEvents = '';
    mm.style.opacity = '';
    mm.style.visibility = '';
    mm.style.transform = '';
    mm.classList.add('active');
    // Restore the nav buttons if they were mid-exit
    const mmNav = mm.querySelector('.mm-nav');
    if (mmNav) mmNav.classList.remove('mm-nav-exiting');
  }
  // Make sure title-menu & story-select are hidden
  const tm = document.getElementById('overlay-title-menu');
  if (tm) tm.classList.remove('active');
  const ss = document.getElementById('overlay-story-select');
  if (ss) { ss.classList.remove('active'); ss.style.display = 'none'; }

  // ── Reset loading bar so START plays cleanly next time ──
  const barFill  = document.getElementById('loading-bar-fill');
  const barShell = document.getElementById('loading-bar-shell');
  const statusText = document.getElementById('loading-status-text');
  const statusLabel = document.getElementById('loading-status-label');
  const pctVal   = document.getElementById('loading-pct-val');
  const loadScreen = document.getElementById('overlay-loading');
  if (barFill)   { barFill.style.width = '0%'; barFill.style.background = ''; barFill.style.boxShadow = ''; }
  if (pctVal)    {
    pctVal.textContent = '0%';
    pctVal.style.color = '#00f0ff';
    pctVal.style.borderColor = 'rgba(0, 240, 255, 0.6)';
    pctVal.style.boxShadow = '0 0 16px rgba(0, 240, 255, 0.4), inset 0 0 12px rgba(0, 240, 255, 0.25)';
    pctVal.style.textShadow = '0 0 14px rgba(0, 240, 255, 0.9)';
  }
  // statusLabel removed
  if (barShell)  { barShell.classList.remove('loading-complete'); }
  if (statusText){ statusText.classList.remove('loading-complete'); }
  if (loadScreen){ loadScreen.style.display = 'none'; loadScreen.classList.remove('active', 'exiting'); loadScreen.style.opacity = ''; loadScreen.style.filter = ''; }

  // ── Resume/respect background music preference on every return to main menu ──
  if (typeof startMMBgMusic === 'function') startMMBgMusic();
  if (typeof updateAchievementNotificationBadge === 'function') {
    updateAchievementNotificationBadge();
  }
  const userBar = document.getElementById('mm-user-bar');
  if (userBar) userBar.hidden = false;
  if (typeof _syncUserBarModalVisibility === 'function') _syncUserBarModalVisibility();

  // ── Refresh Start/Continue button state on every main-menu show ──
  if (typeof updateStartButton === 'function') updateStartButton();
}

/** Hide the main menu overlay */
function hideMainMenu() {
  const mm = document.getElementById('overlay-main-menu');
  if (mm) mm.classList.remove('active');
  // Close any open sub-modals
  closeMainMenuAbout();
  closeMainMenuAchievement();
  closeMainMenuExit();
  // ── Stop background music when leaving the main menu ──
  if (typeof stopMMBgMusic === 'function') stopMMBgMusic();
}

/** Show Story Selection screen directly, unlocking and selecting the target chapter (e.g. Chapter 2) */
function showStorySelectionScreen(selectChapterId = 'malware') {
  if (typeof hideAllOverlays === 'function') {
    hideAllOverlays(false);
  }
  const mm = document.getElementById('overlay-main-menu');
  if (mm) {
    mm.classList.remove('active');
    mm.style.display = 'none';
  }
  const tm = document.getElementById('overlay-title-menu');
  if (tm) {
    tm.classList.remove('active');
    tm.style.display = 'none';
  }
  const desktop = document.getElementById('desktop');
  if (desktop) {
    desktop.style.visibility = 'hidden';
    desktop.style.opacity = '0';
  }

  // Normalize target chapter id
  let targetId = selectChapterId || 'malware';
  if (targetId === 'malware' || targetId === 2) {
    targetId = 'malware';
  } else {
    targetId = 'phishing';
  }

  // Set pending chapter so refreshStorySelectLocks picks it up
  window._pendingStoryChapter = targetId;

  // Deselect previous selection so target card can be cleanly selected
  _selectedStoryCard = null;
  document.querySelectorAll('.ss-card').forEach(c => {
    c.classList.remove('ss-card-selected');
    const existingBtn = c.querySelector('.ss-play-btn');
    if (existingBtn) existingBtn.remove();
    const existingBadge = c.querySelector('.ss-selected-badge');
    if (existingBadge) existingBadge.remove();
  });

  // Reveal Story Selection screen
  const ss = document.getElementById('overlay-story-select');
  if (ss) {
    ss.style.display = 'flex';
    ss.style.opacity = '1';
    void ss.offsetWidth;
    ss.classList.add('active');
    if (typeof refreshStorySelectLocks === 'function') {
      refreshStorySelectLocks();
    }
  }

  const bd = document.getElementById('overlay-backdrop');
  if (bd) bd.classList.add('active');
  if (typeof startMMBgMusic === 'function') startMMBgMusic();
  if (typeof updateAchievementNotificationBadge === 'function') {
    updateAchievementNotificationBadge();
  }
  // Pre-refresh Start/Continue button so it reads from Firestore while Story Select is visible,
  // ensuring it shows "Continue" by the time the user clicks Back to Main Menu.
  if (typeof updateStartButton === 'function') updateStartButton();
  else if (typeof window.updateStartButton === 'function') window.updateStartButton();
}
window.showStorySelectionScreen = showStorySelectionScreen;


/** START button — 5s loading, professional wipe transition into Enter Name */
function mainMenuStart() {
  closeMainMenuAbout();
  closeMainMenuAchievement();
  closeMainMenuExit();
  // Keep background music playing through loading into Story Selection
  if (typeof startMMBgMusic === 'function') startMMBgMusic();

  // ── CONTINUE FAST-PATH ───────────────────────────────────────────────────
  // If the player has saved progress, resume directly into where they left off!
  if (window._continueChapterId) {
    const contCatId = window._continueChapterId;
    // Hide main menu
    const mmEl = document.getElementById('overlay-main-menu');
    if (mmEl) {
      mmEl.classList.remove('active');
      mmEl.style.display = 'none';
    }
    // Resume directly into saved desktop & mission state
    if (typeof resumeSavedGameSession === 'function') {
      resumeSavedGameSession(contCatId);
    } else if (typeof _continueSavedGame === 'function') {
      _continueSavedGame(contCatId);
    } else if (typeof showStorySelectionScreen === 'function') {
      showStorySelectionScreen(contCatId);
    }
    return;
  }

  const mm = document.getElementById('overlay-main-menu');
  const mmNav = document.querySelector('.mm-nav');
  const loadScreen = document.getElementById('overlay-loading');
  const barFill = document.getElementById('loading-bar-fill');
  const barShell = document.getElementById('loading-bar-shell');
  const statusText = document.getElementById('loading-status-text');
  const statusLabel = document.getElementById('loading-status-label');
  const pctVal = document.getElementById('loading-pct-val');
  const flashOverlay = document.getElementById('loading-flash-overlay');

  if (!loadScreen || !barFill) {
    if (mm) mm.classList.remove('active');
    // Fallback: show story select if it exists, otherwise title menu
    const ss = document.getElementById('overlay-story-select');
    if (ss) { ss.style.display = 'flex'; ss.classList.add('active'); refreshStorySelectLocks(); }
    else {
      const tm = document.getElementById('overlay-title-menu');
      if (tm) tm.classList.add('active');
    }
    return;
  }

  // 1. Hide main menu IMMEDIATELY so it cannot show through the loading screen fade-in
  if (mm) { mm.classList.remove('active'); mm.style.display = 'none'; }

  // Slide & blur out the main menu buttons
  if (mmNav) mmNav.classList.add('mm-nav-exiting');

  // Reset state
  barFill.style.width = '0%';
  barFill.style.background = '';
  barFill.style.boxShadow = '';
  if (barShell) barShell.classList.remove('loading-complete');
  if (statusText) statusText.classList.remove('loading-complete');
  if (pctVal) {
    pctVal.textContent = '0%';
    pctVal.style.color = '#00f0ff';
    pctVal.style.borderColor = 'rgba(0, 240, 255, 0.6)';
    pctVal.style.boxShadow = '0 0 16px rgba(0, 240, 255, 0.4), inset 0 0 12px rgba(0, 240, 255, 0.25)';
    pctVal.style.textShadow = '0 0 14px rgba(0, 240, 255, 0.9)';
  }
  loadScreen.classList.remove('exiting');

  // 2. Fade in loading screen over the main menu
  setTimeout(() => {
    loadScreen.style.display = 'flex';
    void loadScreen.offsetWidth;
    loadScreen.classList.add('active');

    // Clean up nav exiting state once loading screen is fully visible
    setTimeout(() => {
      if (mmNav) mmNav.classList.remove('mm-nav-exiting');
    }, 450);

    // 3. Animate progress bar over 5 seconds
    const startTime = performance.now();
    const duration = 5000; // 5 seconds

    function stepProgress(now) {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);

      // Authentic sci-fi 3-stage curve: fast → plateau → final burst
      let pct;
      if (t < 0.3) {
        pct = (t / 0.3) * 42;               // 0–42% fast initial load
      } else if (t < 0.7) {
        pct = 42 + ((t - 0.3) / 0.4) * 38; // 42–80% steady middle
      } else {
        pct = 80 + ((t - 0.7) / 0.3) * 20; // 80–100% final burst
      }
      pct = Math.min(pct, 100);
      barFill.style.width = pct.toFixed(1) + '%';
      
      const currentPct = Math.min(Math.floor(pct), 100);
      if (pctVal) {
        pctVal.textContent = currentPct + '%';
      }

      if (t < 1) {
        requestAnimationFrame(stepProgress);
      } else {
        // Complete — stay consistent, just trigger transition
        barFill.style.width = '100%';
        setTimeout(doTransition, 400);
      }
    }

    requestAnimationFrame(stepProgress);

    // Simple fade transition into Story Selection
    function doTransition() {
      loadScreen.style.transition = 'opacity 0.5s ease';
      loadScreen.style.opacity = '0';

      setTimeout(() => {
        loadScreen.style.transition = '';
        loadScreen.style.opacity = '';
        loadScreen.classList.remove('active', 'exiting');
        loadScreen.style.display = 'none';

        // Show Story Selection screen
        const ss = document.getElementById('overlay-story-select');
        if (ss) {
          ss.style.display = 'flex';
          void ss.offsetWidth;
          ss.classList.add('active');
          refreshStorySelectLocks();
        }
        const bd = document.getElementById('overlay-backdrop');
        if (bd) bd.classList.add('active');
      }, 520);
    }
  }, 200);
}

/** Story Selection — BACK button → go to Main Menu with smooth crossfade */
function storySelectBack() {
  const ss = document.getElementById('overlay-story-select');
  if (!ss) return;

  if (typeof AudioManager !== 'undefined') {
    try { AudioManager.playClick(); } catch(e) {}
  }

  // Deselect cards and clean up buttons
  document.querySelectorAll('.ss-card').forEach(c => {
    c.classList.remove('ss-card-selected');
    const b = c.querySelector('.ss-play-btn');
    if (b) b.remove();
    const bd = c.querySelector('.ss-selected-badge');
    if (bd) bd.remove();
  });

  // 1. Immediately reveal Main Menu underneath Story Selection for seamless cross-fade
  const mm = document.getElementById('overlay-main-menu');
  if (mm) {
    mm.style.display = 'flex';
    mm.style.opacity = '1';
    mm.classList.add('active');
    const mmNav = mm.querySelector('.mm-nav');
    if (mmNav) mmNav.classList.remove('mm-nav-exiting');
  }

  // 2. Smoothly fade out Story Selection over the Main Menu
  ss.style.transition = 'opacity 0.45s ease';
  ss.style.opacity = '0';

  // 3. Complete transition and clean up
  setTimeout(() => {
    ss.style.transition = '';
    ss.style.opacity = '';
    ss.style.transform = '';
    ss.classList.remove('active');
    ss.style.display = 'none';

    // Fully sync and reset Main Menu state
    showMainMenu();
  }, 460);
}

/** Enter Password screen — BACK button: return to Story Selection */
function lsGoBack() {
  const tm = document.getElementById('overlay-title-menu');
  const ss = document.getElementById('overlay-story-select');

  // Clear password input and hide error
  const inp = document.getElementById('ls-name-input');
  if (inp) inp.value = '';
  const errBox = document.getElementById('ls-win10-error-box');
  if (errBox) errBox.classList.add('hidden');

  // Fade out the login screen
  if (tm) {
    tm.style.transition = 'opacity 0.35s ease';
    tm.style.opacity = '0';
  }

  setTimeout(() => {
    if (tm) {
      tm.style.transition = '';
      tm.style.opacity = '';
      tm.classList.remove('active');
      tm.style.display = 'none';
    }

    // Reopen Story Selection
    if (ss) {
      ss.style.display = 'flex';
      void ss.offsetWidth;
      ss.classList.add('active');
      refreshStorySelectLocks();
    }
  }, 360);
}

/**
 * Story Selection — Select a chapter card with corner targeting borders & effects
 */
let _selectedStoryCard = null;

function selectStoryCard(cardEl, categoryId, chapterNum, playSound = true, allowLaunch = false) {
  if (!cardEl) return;

  const isAlreadySelected = cardEl.classList.contains('ss-card-selected');
  const isLocked = cardEl.classList.contains('ss-card-locked') || !categoryId;

  // If already selected:
  if (isAlreadySelected) {
    if (isLocked) {
      // Re-trigger locked shake & sound
      cardEl.classList.remove('ss-card-selected');
      void cardEl.offsetWidth;
      cardEl.classList.add('ss-card-selected');
      storySelectLocked(chapterNum);
    } else if (allowLaunch) {
      storySelectPlay(categoryId);
    }
    return;
  }

  // Deselect all cards and remove previous dynamic elements
  document.querySelectorAll('.ss-card').forEach(c => {
    c.classList.remove('ss-card-selected');
    const existingBtn = c.querySelector('.ss-play-btn');
    if (existingBtn) existingBtn.remove();
    const existingBadge = c.querySelector('.ss-selected-badge');
    if (existingBadge) existingBadge.remove();
  });

  // Select this card
  cardEl.classList.add('ss-card-selected');
  _selectedStoryCard = { element: cardEl, categoryId, chapterNum };

  // Retrigger scan line animation
  const scanLine = cardEl.querySelector('.ss-scan-line');
  if (scanLine) {
    scanLine.style.animation = 'none';
    void scanLine.offsetWidth;
    scanLine.style.animation = '';
  }

  if (isLocked) {
    // Sound & toast for locked
    storySelectLocked(chapterNum);
  } else {
    // Cyber chime sound for unlocked target lock
    if (playSound && typeof AudioManager !== 'undefined') {
      AudioManager.unlock();
      if (typeof AudioManager.playMissionSelect === 'function') {
        AudioManager.playMissionSelect();
      } else {
        AudioManager.playChime(true);
      }
    }

    // Immediately update profile to match the selected chapter
    updateLoginScreenForChapter(categoryId);

    // Add START MISSION / RESUME DESKTOP button in footer
    const footer = cardEl.querySelector('.ss-card-footer');
    if (footer && !footer.querySelector('.ss-play-btn')) {
      const playBtn = document.createElement('button');
      playBtn.className = 'ss-play-btn';
      const isChapterDone = (typeof _isCategoryCompleted === 'function') && _isCategoryCompleted(categoryId);
      const btnLabel = isChapterDone ? 'RESUME DESKTOP' : 'START MISSION';
      playBtn.innerHTML = `<span>${btnLabel}</span> <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`;
      playBtn.onclick = (e) => {
        e.stopPropagation();
        storySelectPlay(categoryId);
      };
      footer.appendChild(playBtn);
    }
  }
}

/** Story Selection — play unlocked chapter */
function storySelectPlay(categoryId) {
  if (typeof AudioManager !== 'undefined') {
    AudioManager.unlock();
    AudioManager.playMouseClick();
  }

  // ── Resume Fast-Path: completed OR in-progress saved chapter ───────
  // If this chapter has active saved progress or is finished, resume where they left off!
  const hasSavedProg = (typeof hasChapterProgress === 'function' && hasChapterProgress(categoryId)) ||
                       (typeof _isCategoryCompleted === 'function' && _isCategoryCompleted(categoryId));

  if (hasSavedProg) {
    const ss = document.getElementById('overlay-story-select');
    if (ss) {
      ss.style.transition = 'opacity 0.4s ease';
      ss.style.opacity = '0';
      setTimeout(() => {
        ss.style.transition = '';
        ss.style.opacity = '';
        ss.classList.remove('active');
        ss.style.display = 'none';
        if (typeof stopMMBgMusic === 'function') stopMMBgMusic();
        if (typeof resumeSavedGameSession === 'function') {
          resumeSavedGameSession(categoryId);
        } else {
          _continueSavedGame(categoryId);
        }
      }, 420);
    } else {
      if (typeof stopMMBgMusic === 'function') stopMMBgMusic();
      if (typeof resumeSavedGameSession === 'function') {
        resumeSavedGameSession(categoryId);
      } else {
        _continueSavedGame(categoryId);
      }
    }
    return;
  }
  // ─────────────────────────────────────────────────────────────────────

  // Stop background music as mission intro begins
  if (typeof stopMMBgMusic === 'function') stopMMBgMusic();

  const ss = document.getElementById('overlay-story-select');
  if (!ss) return;

  // Fade out story selection overlay
  ss.style.transition = 'opacity 0.4s ease';
  ss.style.opacity = '0';

  setTimeout(() => {
    ss.style.transition = '';
    ss.style.opacity = '';
    ss.classList.remove('active');
    ss.style.display = 'none';

    // Retrieve chapter info dynamically
    const cat = (typeof CATEGORIES !== 'undefined' && CATEGORIES.find(c => c.id === categoryId)) || { num: 1, title: 'THE DECEPTIVE CLICK' };
    const ccNum = document.getElementById('cc-chapter-num');
    const ccTitle = document.getElementById('cc-chapter-title');
    if (ccNum) ccNum.textContent = `CHAPTER ${cat.num}`;
    if (ccTitle) ccTitle.textContent = cat.title;

    // Show Cinematic Chapter Title Card (matching user's design reference)
    const cc = document.getElementById('overlay-chapter-card');
    if (cc) {
      cc.style.display = 'flex';
      void cc.offsetWidth; // force layout
      cc.classList.add('active', 'visible');

      // Hold title card for 1.8s, then smoothly transition into Enter Name
      setTimeout(() => {
        cc.classList.remove('visible');

        setTimeout(() => {
          cc.classList.remove('active');
          cc.style.display = 'none';

          // Proceed to Comic Strip or sign-in screen
          window._pendingStoryChapter = categoryId;
          updateLoginScreenForChapter(categoryId);
          if (categoryId === 'phishing') {
            // Show Chapter 1 comic strip first BEFORE Alex enters password!
            showComicStrip();
          } else if (categoryId === 'malware') {
            // Show Chapter 2 comic strip first BEFORE Ethan enters password!
            showComicStripCh2();
          } else {
            const tm = document.getElementById('overlay-title-menu');
            if (tm) {
              tm.style.display = 'flex';
              tm.classList.add('active');
            }
            setTimeout(() => {
              const inp = document.getElementById('ls-name-input');
              if (inp) { inp.value = ''; inp.focus(); }
            }, 380);
          }
        }, 450);
      }, 1800);
    } else {
      // Fallback
      window._pendingStoryChapter = categoryId;
      updateLoginScreenForChapter(categoryId);
      if (categoryId === 'phishing') {
        showComicStrip();
      } else if (categoryId === 'malware') {
        showComicStripCh2();
      } else {
        const tm = document.getElementById('overlay-title-menu');
        if (tm) {
          tm.style.display = 'flex';
          tm.classList.add('active');
        }
        setTimeout(() => {
          const inp = document.getElementById('ls-name-input');
          if (inp) { inp.value = ''; inp.focus(); }
        }, 380);
      }
    }
  }, 420);
}

/** Story Selection — clicked a locked chapter */
function storySelectLocked(chapterNum) {
  if (typeof AudioManager !== 'undefined') {
    AudioManager.unlock();
    AudioManager.playWrong();
  }
  const messages = {
    2: '🔒 Complete Chapter 1 first to unlock Chapter 2!'
  };
  showToast(messages[chapterNum] || '🔒 This chapter is locked.', 'warning');
}

/** Refresh Story Selection card states based on CATEGORIES unlock data */
function refreshStorySelectLocks() {
  CATEGORIES.forEach((cat, idx) => {
    const chapterNum = idx + 1;
    const card = document.getElementById(`ss-card-${chapterNum}`);
    if (!card) return;

    const isUnlocked = !!(cat.unlocked || cat.completed);

    const titleEl = card.querySelector('.ss-chapter-title');
    if (titleEl && cat.title) {
      titleEl.textContent = cat.title;
    }

    if (isUnlocked) {
      card.classList.remove('ss-card-locked');
      card.classList.add('ss-card-unlocked');
      card.setAttribute('onclick', `selectStoryCard(this, '${cat.id}', ${chapterNum})`);
      // Remove lock label if present
      const lockLabel = card.querySelector('.ss-lock-label');
      if (lockLabel) lockLabel.style.display = 'none';
    } else {
      card.classList.remove('ss-card-unlocked');
      card.classList.add('ss-card-locked');
      card.setAttribute('onclick', `selectStoryCard(this, null, ${chapterNum})`);
      const lockLabel = card.querySelector('.ss-lock-label');
      if (lockLabel) lockLabel.style.display = '';
    }

    // Dynamic dots: Chapter 1 has 1 dot, Chapter 2 has 2 dots, Chapter 3 has 3 dots, Chapter 4 has 4 dots
    // When opened/unlocked, all dots illuminate in bright neon cyan
    const dotsContainer = card.querySelector('.ss-card-dots');
    if (dotsContainer) {
      dotsContainer.innerHTML = '';
      for (let d = 0; d < chapterNum; d++) {
        const dot = document.createElement('span');
        dot.className = isUnlocked ? 'ss-dot ss-dot-active' : 'ss-dot';
        dotsContainer.appendChild(dot);
      }
    }
  });

  // Automatically select the appropriate card: preserve previously chosen card or default to first unlocked
  const selectedExisting = document.querySelector('.ss-card-selected');
  if (!selectedExisting) {
    let targetCard = null;
    let targetCatId = null;
    let targetChapterNum = 1;

    const targetCat = window._currentChapterCategory || window._pendingStoryChapter;
    if (targetCat) {
      const catIdx = CATEGORIES.findIndex(c => c.id === targetCat);
      if (catIdx !== -1) {
        const cardCandidate = document.getElementById(`ss-card-${catIdx + 1}`);
        if (cardCandidate && cardCandidate.classList.contains('ss-card-unlocked')) {
          targetCard = cardCandidate;
          targetCatId = targetCat;
          targetChapterNum = catIdx + 1;
        }
      }
    }

    if (!targetCard) {
      // Always default to Chapter 1 (Alex) on fresh page load
      targetCard = document.getElementById('ss-card-1') || document.querySelector('.ss-card-unlocked');
      targetCatId = 'phishing';
      targetChapterNum = 1;
    }

    if (targetCard) {
      selectStoryCard(targetCard, targetCatId, targetChapterNum, false);
    }
  } else if (_selectedStoryCard && _selectedStoryCard.categoryId) {
    updateLoginScreenForChapter(_selectedStoryCard.categoryId);
  }
}


/** Sync visibility of the user avatar & sign out bar when sub-modals (About / Achievements) open or close */
function _syncUserBarModalVisibility() {
  const mm = document.getElementById('overlay-main-menu');
  const userBar = document.getElementById('mm-user-bar');
  const aboutModal = document.getElementById('mm-about-modal');
  const achModal = document.getElementById('mm-achievement-modal');

  const isAboutOpen = !!(aboutModal && !aboutModal.classList.contains('hidden'));
  const isAchOpen = !!(achModal && !achModal.classList.contains('hidden'));
  const isModalOpen = isAboutOpen || isAchOpen;

  if (mm) {
    mm.classList.toggle('mm-modal-open', isModalOpen);
  }
  if (userBar) {
    userBar.classList.toggle('mm-user-bar-modal-hidden', isModalOpen);
    userBar.style.display = isModalOpen ? 'none' : '';
  }
}

/** ABOUT button — show the About modal */
function mainMenuAbout() {
  const modal = document.getElementById('mm-about-modal');
  if (modal) modal.classList.remove('hidden');
  _syncUserBarModalVisibility();
}

/** Close About modal */
function closeMainMenuAbout() {
  const modal = document.getElementById('mm-about-modal');
  if (modal) modal.classList.add('hidden');
  _syncUserBarModalVisibility();
}

// ════════════════════════════════════════════════════════════
//  CYBERZERO CHAPTER AWARDS ENGINE (4 UNIQUE CHAPTER AWARDS)
// ════════════════════════════════════════════════════════════

const ACH_CLAIMED_STORAGE_KEY = 'cyberzero_claimed_achievements';

/**
 * Exactly 2 Unique Awards, one for each Chapter:
 * - Chapter 1: Phishing Investigation Award (assets/Achievement/Phishing.png)
 * - Chapter 2: Malware Protection Award (assets/Achievement/Malware.png)
 */
const MISSION_ACHIEVEMENTS = [
  {
    id: 'ach_phishing',
    chapter: 1,
    catId: 'phishing',
    chapterTag: 'CHAPTER 1 · PHISHING DEFENSE',
    threatCategory: 'PHISHING',
    title: 'Phishing Investigation Award',
    shortName: 'Phishing Award',
    image: 'assets/Achievement/Phishing.png',
    objective: 'Awarded for analyzing suspicious emails, exposing deceptive phishing lures, documenting spoofed senders, and safeguarding authentic communications.',
    description: 'Awarded for analyzing suspicious emails, exposing deceptive phishing lures, documenting spoofed senders, and safeguarding authentic communications.',
    checklist: [
      { id: 'task_report_phishing', label: 'Report 5 Phishing Emails' },
      { id: 'task_verify_legit', label: 'Verify 5 Clean Emails' },
      { id: 'task_fake_sender', label: 'Document 5 Fake Senders' },
      { id: 'task_phish_indicators', label: 'Flag 5 Threat Indicators' },
      { id: 'task_submit_all_verdicts', label: 'Submit all email verdicts' },
    ]
  },
  {
    id: 'ach_malware',
    chapter: 2,
    catId: 'malware',
    chapterTag: 'CHAPTER 2 · MALWARE PROTECTION',
    threatCategory: 'MALWARE',
    title: 'Malware Protection Award',
    shortName: 'Malware Award',
    image: 'assets/Achievement/Malware.png',
    objective: 'Awarded for investigating suspicious software, safely configuring ShieldAV Defender, and neutralizing all 4 simulated malware payloads.',
    description: 'Awarded for investigating suspicious software, safely configuring ShieldAV Defender, and neutralizing all 4 simulated malware payloads.',
    checklist: [
      { id: 'ch2_games', label: 'Open & Inspect Games Folder' },
      { id: 'ch2_av', label: 'Configure ShieldAV Defender' },
      { id: 'ch2_quarantine', label: 'Neutralize & Quarantine 4 Malware Threats' },
      { id: 'ch2_cleared', label: 'Complete Chapter 2 Incident Response' }
    ]
  }
];

/**
 * Check whether a chapter's required mission checklist is complete.
 * The award must remain locked and unclaimable until ALL required checklist missions are completed!
 */
function isChapterChecklistComplete(ach) {
  if (!ach) return false;
  const catId = ach.catId;

  if (typeof loadCategoriesProgress === 'function') loadCategoriesProgress();
  const cats = typeof CATEGORIES !== 'undefined' ? CATEGORIES : [];
  const cat = cats.find(c => c.id === catId);

  if (catId === 'phishing') {
    // CHAPTER 1: Strictly requires ALL 5 investigation checklist tasks AND all evidence collected
    let liveAllTasks = false;
    if (typeof SN_ACHIEVEMENTS !== 'undefined' && Array.isArray(SN_ACHIEVEMENTS) && SN_ACHIEVEMENTS.length >= 5) {
      liveAllTasks = SN_ACHIEVEMENTS.every(t => typeof t.check === 'function' && t.check());
    } else if (typeof isPhishingTrophyUnlocked === 'function') {
      liveAllTasks = isPhishingTrophyUnlocked();
    }

    let savedAllTasks = false;
    try {
      const phishSaved = localStorage.getItem('cyberzero_phishing_progress');
      if (phishSaved) {
        const pData = JSON.parse(phishSaved);
        const unl = Array.isArray(pData.unlockedAchievements) ? pData.unlockedAchievements : [];
        const requiredTaskIds = ['task_report_phishing', 'task_verify_legit', 'task_fake_sender', 'task_phish_indicators', 'task_submit_all_verdicts'];
        const allPresent = requiredTaskIds.every(id => unl.includes(id));
        if (pData.trophyUnlocked || unl.includes('task_all_complete') || allPresent) {
          savedAllTasks = true;
        }
      }
    } catch (e) {}

    // Also unlock if the award was already claimed (desktop or Main Menu) — avoids double-claim
    const alreadyClaimed = isAchievementClaimed('ach_phishing');
    const isComplete = alreadyClaimed || ((liveAllTasks || savedAllTasks) && (cat && cat.completed));
    return !!isComplete;
  }

  if (catId === 'malware') {
    // CHAPTER 2: Requires completing Chapter 2 (all 4 malware quarantined)
    return !!(cat && cat.completed);
  }

  return false;
}

/** Check status of an individual checklist item for display */
function isChecklistItemDone(ach, item, itemIndex) {
  if (!ach || !item) return false;
  if (isAchievementClaimed(ach.id)) return true;
  if (isChapterChecklistComplete(ach)) return true;

  if (ach.catId === 'phishing') {
    try {
      if (typeof SN_ACHIEVEMENTS !== 'undefined') {
        const match = SN_ACHIEVEMENTS.find(t => t.id === item.id) || SN_ACHIEVEMENTS[itemIndex];
        if (match && typeof match.check === 'function') {
          return !!match.check();
        }
      }
    } catch(e) {}
    try {
      const phishSaved = localStorage.getItem('cyberzero_phishing_progress');
      if (phishSaved) {
        const pData = JSON.parse(phishSaved);
        const unl = pData.unlockedAchievements || [];
        return unl.includes(item.id) || unl.includes('task_all_complete') || !!pData.trophyUnlocked;
      }
    } catch(e) {}
  }

  if (ach.catId === 'malware') {
    try {
      if (typeof gameState !== 'undefined') {
        if (item.id === 'ch2_games') return !!(gameState.malwareExaminedCount > 0 || gameState.malwareQuarantined > 0);
        if (item.id === 'ch2_av') return !!(gameState.malwareQuarantined > 0);
        if (item.id === 'ch2_quarantine') return typeof TOTAL_MALWARE_COUNT !== 'undefined' ? gameState.malwareQuarantined >= TOTAL_MALWARE_COUNT : gameState.malwareQuarantined >= 4;
      }
    } catch(e) {}
  }



  return false;
}

/** Claimed achievements stored in localStorage */
function getClaimedAchievementsMap() {
  try {
    const raw = localStorage.getItem(ACH_CLAIMED_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveClaimedAchievementsMap(map) {
  try {
    localStorage.setItem(ACH_CLAIMED_STORAGE_KEY, JSON.stringify(map));
  } catch (e) {}
}

function isAchievementClaimed(achId) {
  const map = getClaimedAchievementsMap();
  if (!map || !map[achId]) return false;
  return !!(map[achId].claimed || map[achId].tier);
}

/**
 * Claim an achievement award when its chapter checklist is completed.
 * Prevents duplicate claims and permanently persists claimed status.
 */
function claimAchievement(achId) {
  if (typeof AudioManager !== 'undefined') {
    try { AudioManager.playClick(); } catch (e) {}
  }

  const ach = MISSION_ACHIEVEMENTS.find(a => a.id === achId);
  if (!ach) return;

  // Prevent duplicate claims
  if (isAchievementClaimed(achId)) {
    if (typeof showToast === 'function') {
      showToast(`✓ ${ach.title} has already been claimed!`, 'info');
    }
    return;
  }

  // Must have completed all required checklist missions and collected all required evidence
  if (!isChapterChecklistComplete(ach)) {
    // DENIED: Do NOT play reward-claim sound! Keep trophy locked as silhouette.
    if (achId === 'ach_phishing' && typeof showIncompletePhishingClaimDialogue === 'function') {
      const missing = [];
      if (typeof SN_ACHIEVEMENTS !== 'undefined') {
        SN_ACHIEVEMENTS.forEach(t => {
          if (!t.check()) missing.push(t.label);
        });
      }
      showIncompletePhishingClaimDialogue(missing);
    } else if (typeof showToast === 'function') {
      showToast(`🔒 Incomplete: Complete all Chapter ${ach.chapter} missions and collect all required evidence to claim!`, 'warning');
      if (achId === 'ach_phishing' && typeof simulateIncomingPhishingEmail === 'function') {
        simulateIncomingPhishingEmail();
      }
    }
    return;
  }

  const map = getClaimedAchievementsMap();
  map[achId] = {
    claimed: true,
    chapter: ach.chapter,
    title: ach.title,
    claimedAt: Date.now(),
    claimedDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  };
  saveClaimedAchievementsMap(map);
  // Save to Firestore & update Start/Continue button immediately
  if (typeof window.saveProgress === 'function') {
    window.saveProgress().catch(() => {});
  }
  if (typeof updateStartButton === 'function') {
    updateStartButton();
  }

  // If claiming phishing, also sync with chapter 1 in-game award state
  if (achId === 'ach_phishing') {
    window._awardClaimed = true;
    if (typeof savePhishingProgress === 'function') {
      try { savePhishingProgress(); } catch(e) {}
    }
    if (typeof updateDesktopTrophyDisplay === 'function') {
      try { updateDesktopTrophyDisplay(); } catch(e) {}
    }
    // Update sticky note to reveal 3 post-award checklist tasks and Ryan dialogue
    if (typeof renderStickyNoteResults === 'function') {
      try { renderStickyNoteResults(); } catch(e) {}
    }
    if (typeof _isChapter1Active === 'function' && _isChapter1Active()) {
      if (typeof showStickyNote === 'function') {
        try { showStickyNote(); } catch(e) {}
      }
      setTimeout(() => {
        if (typeof triggerPostAchievementPostTestPrompt === 'function') {
          triggerPostAchievementPostTestPrompt();
        }
      }, 500);
    }
  }

  // Audio fanfare
  if (typeof AudioManager !== 'undefined') {
    try {
      if (typeof AudioManager.playPerfectFanfare === 'function') {
        AudioManager.playPerfectFanfare();
      } else if (typeof AudioManager.playMissionComplete === 'function') {
        AudioManager.playMissionComplete();
      }
      if (typeof AudioManager.playChime === 'function') {
        setTimeout(() => AudioManager.playChime(true), 320);
      }
    } catch (e) {}
  }

  // Particle burst animation
  const cardEl = document.querySelector(`[data-ach-id="${achId}"]`) || document.querySelector('.ach-detail-panel');
  if (cardEl) {
    spawnAchParticles(cardEl, 'cyan');
  }

  // Toast notification
  if (typeof showToast === 'function') {
    showToast(`🎉 Claimed ${ach.title}! Award proudly displayed on your shelf!`, 'success');
  }

  // Smoothly update UI
  setTimeout(() => {
    renderMainMenuAchievements();
    updateAchievementNotificationBadge();
  }, 250);
}

/**
 * Claim all available completed achievements at once
 */
function claimAllAchievements() {
  if (typeof AudioManager !== 'undefined') {
    try { AudioManager.playClick(); } catch (e) {}
  }

  const map = getClaimedAchievementsMap();
  let newlyClaimed = 0;

  MISSION_ACHIEVEMENTS.forEach(ach => {
    if (isChapterChecklistComplete(ach) && !isAchievementClaimed(ach.id)) {
      map[ach.id] = {
        claimed: true,
        chapter: ach.chapter,
        title: ach.title,
        claimedAt: Date.now(),
        claimedDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
      };
      if (ach.id === 'ach_phishing') {
        window._awardClaimed = true;
        if (typeof savePhishingProgress === 'function') {
          try { savePhishingProgress(); } catch(e) {}
        }
      }
      newlyClaimed++;
    }
  });

  if (newlyClaimed === 0) return;

  saveClaimedAchievementsMap(map);

  // Save to Firestore & update Start/Continue button immediately
  if (typeof window.saveProgress === 'function') {
    window.saveProgress().catch(() => {});
  }
  if (typeof updateStartButton === 'function') {
    updateStartButton();
  }

  if (typeof AudioManager !== 'undefined') {
    try {
      if (typeof AudioManager.playPerfectFanfare === 'function') {
        AudioManager.playPerfectFanfare();
      } else if (typeof AudioManager.playMissionComplete === 'function') {
        AudioManager.playMissionComplete();
      }
    } catch (e) {}
  }

  const listEl = document.getElementById('mm-ach-list');
  if (listEl) {
    spawnAchParticles(listEl, 'cyan');
  }

  if (typeof showToast === 'function') {
    showToast(`🌟 Claimed all ${newlyClaimed} unlocked chapter awards! Outstanding cyber defense!`, 'success');
  }

  setTimeout(() => {
    renderMainMenuAchievements();
    updateAchievementNotificationBadge();
  }, 300);
}

function updateAchievementNotificationBadge() {
  const badgeEl = document.getElementById('mm-ach-claim-badge');
  if (badgeEl) {
    badgeEl.classList.add('hidden');
    badgeEl.style.display = 'none';
  }
}

/** Particle burst celebration on achievement claim */
function spawnAchParticles(container, colorTheme = 'cyan') {
  if (!container) return;
  const colors = ['#00f0ff', '#38bdf8', '#00e5ff', '#ffffff', '#ffd700', '#facc15'];

  const particleBox = document.createElement('div');
  particleBox.className = 'mm-ach-particles-wrap';
  container.appendChild(particleBox);

  for (let i = 0; i < 24; i++) {
    const p = document.createElement('div');
    p.className = 'mm-ach-particle';
    const angle = (i / 24) * 2 * Math.PI + (Math.random() - 0.5) * 0.3;
    const distance = 35 + Math.random() * 75;
    const destX = Math.cos(angle) * distance;
    const destY = Math.sin(angle) * distance;
    const size = 4 + Math.random() * 5;
    const color = colors[Math.floor(Math.random() * colors.length)];

    p.style.setProperty('--dest-x', `${destX}px`);
    p.style.setProperty('--dest-y', `${destY}px`);
    p.style.backgroundColor = color;
    p.style.width = `${size}px`;
    p.style.height = `${size}px`;
    p.style.boxShadow = `0 0 10px ${color}`;

    particleBox.appendChild(p);
  }

  setTimeout(() => {
    if (particleBox && particleBox.parentNode) {
      particleBox.parentNode.removeChild(particleBox);
    }
  }, 1200);
}

// Track currently selected achievement in showcase (defaults to 'ach_phishing')
let _selectedAchId = 'ach_phishing';

function selectAchCard(achId, event) {
  if (event && event.target && (event.target.closest('.ach-claim-btn') || event.target.closest('.mm-ach-claim-all-btn'))) {
    return;
  }
  if (typeof AudioManager !== 'undefined') {
    try { AudioManager.playClick(); } catch (e) {}
  }
  _selectedAchId = achId;
  renderMainMenuAchievements();
}
window.selectAchCard = selectAchCard;

/**
 * Render the 4 Chapter Awards on the shelves:
 * - 4 unique awards, one for each chapter (Phishing, Malware, Safe Online, Ransomware).
 * - Shelf slot: dark silhouette when unclaimed; full image with cyan aura when claimed.
 * - Right panel: detailed view with objective, chapter mission checklist breakdown, and claim button.
 */
function renderMainMenuAchievements() {
  const listEl = document.getElementById('mm-ach-list');
  if (!listEl) return;

  if (typeof loadCategoriesProgress === 'function') loadCategoriesProgress();
  const claimedMap = getClaimedAchievementsMap();

  const totalAwards = MISSION_ACHIEVEMENTS.length;
  const claimedCount = MISSION_ACHIEVEMENTS.filter(a => isAchievementClaimed(a.id)).length;
  const unlockedCount = MISSION_ACHIEVEMENTS.filter(a => isChapterChecklistComplete(a)).length;
  const canClaimAny = MISSION_ACHIEVEMENTS.some(a => isChapterChecklistComplete(a) && !isAchievementClaimed(a.id));
  const pct = Math.round((claimedCount / totalAwards) * 100);

  // Stats header
  const statsEl = document.getElementById('mm-ach-stats');
  if (statsEl) {
    statsEl.innerHTML = `
      <div class="mm-ach-stat-row">
        <div class="mm-ach-stat-pill">
          <span class="mm-ach-stat-label">CLAIMED</span>
          <span class="mm-ach-stat-val ${claimedCount > 0 ? 'highlight-cyan' : ''}">${claimedCount} / ${totalAwards}</span>
        </div>
        <div class="mm-ach-progress-wrap" title="${pct}% Completed">
          <div class="mm-ach-progress-track">
            <div class="mm-ach-progress-fill" style="width: ${pct}%;"></div>
          </div>
          <span class="mm-ach-progress-pct">${pct}%</span>
        </div>
        <div class="mm-ach-stat-pill">
          <span class="mm-ach-stat-label">UNLOCKED</span>
          <span class="mm-ach-stat-val ${unlockedCount > 0 ? 'highlight-gold' : ''}">${unlockedCount} / ${totalAwards}</span>
        </div>
        ${canClaimAny ? `
          <button class="mm-ach-claim-all-btn" onclick="claimAllAchievements()" title="Claim all unlocked chapter awards">
            ★ CLAIM ALL
          </button>
        ` : ''}
      </div>
    `;
  }

  // Ensure valid selection
  let selectedAch = MISSION_ACHIEVEMENTS.find(a => a.id === _selectedAchId);
  if (!selectedAch) {
    selectedAch = MISSION_ACHIEVEMENTS[0];
    _selectedAchId = selectedAch.id;
  }

  // Trophy Shelf: 2 Chapter Awards side by side (Chapter 1: Phishing, Chapter 2: Malware)
  function buildSlot(ach) {
    const isClaimed = isAchievementClaimed(ach.id);
    const isUnlocked = isChapterChecklistComplete(ach);
    const isSelected = ach.id === _selectedAchId;

    return `
      <div class="ach-shelf-slot ${isClaimed ? 'is-claimed' : (isUnlocked ? 'is-unlocked' : 'is-locked')} ${isSelected ? 'is-selected' : ''}"
           data-ach-id="${ach.id}"
           onclick="selectAchCard('${ach.id}', event)"
           title="${ach.title} (${isClaimed ? 'Claimed' : (isUnlocked ? 'Ready to Claim' : 'Locked')})">
        <div class="ach-slot-inner">
          <div class="ach-slot-pedestal">
            <div class="ach-trophy-backlight"></div>
            <div class="ach-slot-icon">
              <img src="${ach.image}" 
                   class="ach-shelf-img ${isClaimed ? 'is-claimed' : 'is-silhouette'}" 
                   alt="${ach.title}" />
            </div>
            <div class="ach-slot-shelf-light"></div>
          </div>
          <div class="ach-slot-plaque">
            <div class="ach-plaque-ch">CHAPTER ${ach.chapter}</div>
            <div class="ach-plaque-title">${ach.shortName || ach.title}</div>
            <div class="ach-plaque-status ${isClaimed ? 'claimed' : (isUnlocked ? 'ready' : 'locked')}">
              ${isClaimed ? 'CLAIMED ✓' : (isUnlocked ? '★ READY' : '')}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  const shelfRow = `
    <div class="ach-shelf-row">
      <div class="ach-shelf-slots">
        ${MISSION_ACHIEVEMENTS.map(buildSlot).join('')}
      </div>
      <div class="ach-shelf-plank"></div>
    </div>
  `;

  // Detail panel for selected achievement (Collectible dossier - checklist section removed)
  const selClaimed = isAchievementClaimed(selectedAch.id);
  const selUnlocked = isChapterChecklistComplete(selectedAch);
  const selClaimedData = claimedMap[selectedAch.id] || null;

  let actionBtnHtml = '';
  if (selClaimed) {
    const claimDate = (selClaimedData && selClaimedData.claimedDate) ? ` · ${selClaimedData.claimedDate}` : '';
    actionBtnHtml = `<button class="ach-claim-btn is-claimed" disabled>CLAIMED ✓${claimDate}</button>`;
  } else if (selUnlocked) {
    actionBtnHtml = `<button class="ach-claim-btn is-ready" onclick="claimAchievement('${selectedAch.id}')">★ CLAIM AWARD</button>`;
  } else {
    actionBtnHtml = `<button class="ach-claim-btn is-locked" disabled>COMPLETE CHAPTER ${selectedAch.chapter} TO UNLOCK</button>`;
  }

  const detailHtml = `
    <div class="ach-detail-panel ${selClaimed ? 'is-claimed-panel' : (selUnlocked ? 'is-ready-panel' : 'is-locked-panel')}">
      <div class="ach-detail-emblem">
        <div class="ach-detail-backlight"></div>
        <img src="${selectedAch.image}" 
             class="ach-detail-img ${selClaimed ? 'is-claimed' : 'is-silhouette'}" 
             alt="${selectedAch.title}" />
      </div>
      <div class="ach-detail-info">
        <h3 class="ach-detail-name">${selectedAch.title}</h3>
        <div class="ach-detail-chapter-tag">${selectedAch.chapterTag}</div>
        <div class="ach-detail-desc-box">
          <p class="ach-detail-desc">${selectedAch.description || selectedAch.objective}</p>
        </div>

        ${actionBtnHtml}
      </div>
    </div>
  `;

  listEl.innerHTML = `
    <div class="ach-shelf-layout">
      <!-- Left: Trophy Cabinet Shelves -->
      <div class="ach-shelf-left">
        <div class="ach-shelf-cabinet">
          <div class="ach-cabinet-canopy">
            <span class="ach-canopy-badge">CYBER COMMENDATION VAULT</span>
          </div>
          ${shelfRow}
        </div>
      </div>
      <!-- Right: Detailed Award Dossier -->
      <div class="ach-shelf-right">
        ${detailHtml}
      </div>
    </div>
  `;
}

/** ACHIEVEMENT button — show the Achievements modal */
function mainMenuAchievement() {
  if (typeof AudioManager !== 'undefined') {
    try { AudioManager.playClick(); } catch(e) {}
  }
  renderMainMenuAchievements();
  const modal = document.getElementById('mm-achievement-modal');
  if (modal) modal.classList.remove('hidden');
  _syncUserBarModalVisibility();
}

/** Close Achievement modal */
function closeMainMenuAchievement() {
  if (typeof AudioManager !== 'undefined') {
    try { AudioManager.playClick(); } catch(e) {}
  }
  const modal = document.getElementById('mm-achievement-modal');
  if (modal) modal.classList.add('hidden');
  updateAchievementNotificationBadge();
  _syncUserBarModalVisibility();
}

/**
 * Dev utility functions to test achievement claims & checklists
 */
window.devUnlockAchievements = function() {
  if (typeof CATEGORIES !== 'undefined') {
    CATEGORIES.forEach(cat => {
      cat.completed = true;
      cat.unlocked = true;
      cat.rank = 'S';
      cat.score = 500;
    });
    if (typeof saveCategoriesProgress === 'function') saveCategoriesProgress();
  }

  // Mark all 4 phishing checklist tasks done in localStorage
  try {
    const pData = {
      unlockedAchievements: ['task_report_phishing', 'task_verify_legit', 'task_fake_sender', 'task_phish_indicators', 'task_collect_evidence', 'task_all_complete', 'phish_trophy_unlocked'],
      trophyUnlocked: true,
      awardClaimed: false
    };
    localStorage.setItem('cyberzero_phishing_progress', JSON.stringify(pData));
  } catch(e) {}

  renderMainMenuAchievements();
  updateAchievementNotificationBadge();
  console.log('%c[ACHIEVEMENT DEV] All 4 chapters & checklist missions set to COMPLETE (ready to claim)!', 'color:#00f0ff; font-weight:bold;');
};

window.devResetAchievements = function() {
  localStorage.removeItem(ACH_CLAIMED_STORAGE_KEY);
  localStorage.removeItem('cyberzero_phishing_progress');
  if (typeof CATEGORIES !== 'undefined') {
    CATEGORIES.forEach((c, idx) => {
      c.completed = false;
      c.unlocked = (idx === 0);
      c.rank = null;
      c.score = 0;
    });
    if (typeof saveCategoriesProgress === 'function') saveCategoriesProgress();
  }
  window._awardClaimed = false;
  renderMainMenuAchievements();
  updateAchievementNotificationBadge();
  console.log('%c[ACHIEVEMENT DEV] All achievements & chapter progress reset to LOCKED.', 'color:#ffd700; font-weight:bold;');
};

window.toggleDevAchievements = function() {
  const map = getClaimedAchievementsMap();
  const hasClaimed = Object.keys(map).length > 0;
  if (hasClaimed) {
    window.devResetAchievements();
    if (typeof showToast === 'function') showToast('Achievements Reset to Locked State', 'info');
  } else {
    window.devUnlockAchievements();
    if (typeof showToast === 'function') showToast('🏆 All Chapter Awards Ready to Claim!', 'success');
  }
};

window.claimAchievement = claimAchievement;
window.claimAllAchievements = claimAllAchievements;
window.renderMainMenuAchievements = renderMainMenuAchievements;
window.updateAchievementNotificationBadge = updateAchievementNotificationBadge;

/** EXIT button — show exit confirmation modal */
function mainMenuExit() {
  const modal = document.getElementById('mm-exit-modal');
  if (modal) modal.classList.remove('hidden');
}

/** Close Exit confirmation modal */
function closeMainMenuExit() {
  const modal = document.getElementById('mm-exit-modal');
  if (modal) modal.classList.add('hidden');
}

// ════════════════════════════════════════════════════════════
//  START / CONTINUE BUTTON LOGIC
// ════════════════════════════════════════════════════════════

/**
 * Chapter name map for display in the sublabel.
 * Keys match CATEGORIES id values.
 */
const _CHAPTER_LABELS = {
  phishing: 'Ch.1 · The Deceptive Click',
  malware:  'Ch.2 · The Hidden Threat'
};

/**
 * Detects whether the player has any saved progress in localStorage,
 * then updates the Start button to show "Continue" (with chapter hint)
 * or "New Game" for a fresh slate.
 */
window.updateStartButton = function() { return updateStartButton(); };

function updateStartButton() {
  const startBtn = document.getElementById('mm-btn-start');
  const labelEl = document.getElementById('mm-start-label') || (startBtn && startBtn.querySelector('.mm-btn-label'));
  if (!labelEl) return;

  // ─── Helper: Apply button text and resume chapter pointer ─────────────
  function _applyButtonState(savedCatId) {
    if (savedCatId) {
      labelEl.textContent = 'Continue';
      window._continueChapterId = savedCatId;
    } else {
      labelEl.textContent = 'Start';
      window._continueChapterId = null;
    }
  }

  // ─── Helper: extract furthest active/unlocked chapter from array ───────
  function _extractCatId(data) {
    if (!Array.isArray(data)) return null;
    const order = ['phishing', 'malware'];
    // Prefer unfinished unlocked chapter to resume
    for (const id of order) {
      const entry = data.find(c => c.id === id);
      if (entry && entry.unlocked && !entry.completed) return id;
    }
    // Else last completed chapter
    let lastComp = null;
    for (const id of order) {
      const entry = data.find(c => c.id === id);
      if (entry && entry.completed) lastComp = id;
    }
    if (lastComp) return lastComp;
    // Else any unlocked chapter
    for (let i = order.length - 1; i >= 0; i--) {
      const entry = data.find(c => c.id === order[i]);
      if (entry && entry.unlocked) return order[i];
    }
    return null;
  }

  // ─── Helper: check if any reward has been claimed ─────────────────────
  function _hasAnyClaimedReward() {
    try {
      const raw = localStorage.getItem('cyberzero_claimed_achievements');
      if (raw) {
        const map = JSON.parse(raw);
        if (map && typeof map === 'object') {
          if (Object.values(map).some(v => v && (v.claimed === true || v.tier))) return true;
        }
      }
    } catch (e) {}
    try {
      const ph = localStorage.getItem('cyberzero_phishing_progress');
      if (ph) {
        const pd = JSON.parse(ph);
        if (pd && pd.awardClaimed) return true;
      }
    } catch (e) {}
    if (window._awardClaimed) return true;
    return false;
  }

  // ─── Helper: check if any local progress exists ────────────────────────
  function _hasAnyLocalProgress() {
    if (_hasAnyClaimedReward()) return true;
    try {
      const raw = localStorage.getItem('cyberzero_categories');
      if (raw) {
        const data = JSON.parse(raw);
        if (Array.isArray(data)) {
          if (data.some(c => c.completed || (c.id !== 'phishing' && c.unlocked) || (c.score && c.score > 0))) {
            return true;
          }
        }
      }
    } catch (e) {}
    try {
      const ph = localStorage.getItem('cyberzero_phishing_progress');
      if (ph) {
        const pd = JSON.parse(ph);
        if (pd && ((pd.unlockedAchievements && pd.unlockedAchievements.length > 0) || pd.trophyUnlocked)) {
          return true;
        }
      }
    } catch (e) {}
    return false;
  }

  // ─── PASS 1: Immediate local check (synchronous, instant UI response) ───
  let localCatId = null;
  if (_hasAnyLocalProgress()) {
    try {
      const raw = localStorage.getItem('cyberzero_categories');
      if (raw) localCatId = _extractCatId(JSON.parse(raw));
    } catch (e) {}
    if (!localCatId && (typeof window._currentChapterCategory !== 'undefined' && window._currentChapterCategory)) {
      localCatId = window._currentChapterCategory;
    }
    if (!localCatId) localCatId = 'phishing';
  }
  _applyButtonState(localCatId);

  // ─── PASS 2: Async Firestore check (Firestore is single source of truth) ─
  (async function _firestorePass() {
    try {
      if (typeof firebase === 'undefined' || !firebase.apps || !firebase.apps.length) return;
      const auth = firebase.auth && firebase.auth();
      if (!auth) return;
      const user = auth.currentUser;
      if (!user) return; // not authenticated yet

      const db = firebase.firestore();
      const doc = await db.collection('saves').doc(user.uid).get();

      if (!doc.exists) {
        // Firestore says no save document exists in cloud.
        // If there is neither a claimed reward NOR local chapter progress, show Start.
        if (!_hasAnyLocalProgress()) {
          console.log('[updateStartButton] Firestore: No save document for user ' + user.uid + ' -> Start');
          _applyButtonState(null);
        } else {
          console.log('[updateStartButton] Local progress found without Firestore doc -> Keeping Continue and syncing to Firestore');
          if (typeof window.saveProgress === 'function') {
            window.saveProgress().catch(() => {});
          }
        }
        return;
      }

      // Cloud save document exists in Firestore!
      const data = doc.data() || {};
      console.log('[updateStartButton] Firestore: Save document found for user ' + user.uid + ' -> Continue');

      let fsCatId = null;
      if (data.ls && data.ls['cyberzero_categories']) {
        try {
          fsCatId = _extractCatId(JSON.parse(data.ls['cyberzero_categories']));
        } catch (e) {}
      }
      if (!fsCatId && data.activeChapter) fsCatId = data.activeChapter;
      if (!fsCatId) fsCatId = 'phishing';

      // Restore localStorage blobs so game state stays synchronized
      if (data.ls && typeof data.ls === 'object') {
        const FS_LS_KEYS = [
          'cyberzero_categories', 'cyberzero_phishing_progress',
          'cyberzero_claimed_achievements', 'cyberzero_newbie_gc_state', 'cyberzero_ch2_pretest'
        ];
        FS_LS_KEYS.forEach(function(key) {
          if (data.ls[key] !== undefined && data.ls[key] !== null) {
            try { localStorage.setItem(key, data.ls[key]); } catch (_) {}
          }
        });
      }
      if (data.gameState && data.gameState.awardClaimed) {
        window._awardClaimed = true;
      }

      _applyButtonState(fsCatId);
    } catch (err) {
      console.warn('[updateStartButton] Firestore pass error:', err);
    }
  })();
}

// ════════════════════════════════════════════════════════════
//  CONTINUE SAVED GAME — HELPERS
// ════════════════════════════════════════════════════════════

/**
 * Returns true if the given chapter category has been completed
 * (checks live CATEGORIES array first, then localStorage as fallback).
 */
function _isCategoryCompleted(catId) {
  try {
    if (typeof CATEGORIES !== 'undefined' && Array.isArray(CATEGORIES)) {
      const cat = CATEGORIES.find(c => c.id === catId);
      if (cat && cat.completed) return true;
    }
  } catch (e) {}

  try {
    const raw = localStorage.getItem('cyberzero_categories');
    if (raw) {
      const data = JSON.parse(raw);
      if (Array.isArray(data)) {
        const entry = data.find(c => c.id === catId);
        if (entry && entry.completed) return true;
      }
    }
  } catch (e) {}

  // For phishing (Ch.1): also check claimed achievements as a completion signal
  if (catId === 'phishing') {
    try {
      const ach = localStorage.getItem('cyberzero_claimed_achievements');
      if (ach) {
        const map = JSON.parse(ach);
        if (map && map['ach_phishing'] && (map['ach_phishing'].claimed || map['ach_phishing'].tier)) {
          return true;
        }
      }
    } catch (e) {}
    // Also check phishing progress trophy flag
    try {
      const ph = localStorage.getItem('cyberzero_phishing_progress');
      if (ph) {
        const pd = JSON.parse(ph);
        if (pd && pd.awardClaimed) return true;
      }
    } catch (e) {}
  }

  return false;
}

/**
 * Resume a saved game by going directly to the correct chapter desktop.
 * Skips comic strips, pretest, mission intro, and login screen.
 * For completed Chapter 1: shows empty sticky-note checklist (post-award state).
 */
function _continueSavedGame(catId) {
  if (typeof resumeSavedGameSession === 'function') {
    resumeSavedGameSession(catId);
    return;
  }
  const mm = document.getElementById('overlay-main-menu');
  const mmNav = mm && mm.querySelector('.mm-nav');

  if (mmNav) mmNav.classList.add('mm-nav-exiting');
  if (typeof stopMMBgMusic === 'function') stopMMBgMusic();
  if (typeof AudioManager !== 'undefined') {
    try { AudioManager.unlock(); } catch (e) {}
  }

  setTimeout(() => {
    if (mm) {
      mm.classList.remove('active');
      mm.style.display = 'none';
    }
    if (mmNav) mmNav.classList.remove('mm-nav-exiting');

    try { if (typeof loadCategoriesProgress === 'function') loadCategoriesProgress(); } catch (e) {}
    try { if (typeof loadPhishingProgress === 'function') loadPhishingProgress(); } catch (e) {}

    const isCompleted = _isCategoryCompleted(catId);

    if (catId === 'phishing') {
      window._currentChapterCategory = 'phishing';
      if (typeof activeCategoryStory !== 'undefined') activeCategoryStory = 'phishing';
      if (typeof updateLoginScreenForChapter === 'function') updateLoginScreenForChapter('phishing');
      if (typeof updateDesktopBackgroundForPhase === 'function') updateDesktopBackgroundForPhase('phishing');

      // Open desktop overlay directly
      if (typeof hideAllOverlays === 'function') hideAllOverlays(false);
      document.querySelectorAll('.overlay').forEach(o => {
        o.classList.remove('active');
        o.style.display = 'none';
      });
      const desktop = document.getElementById('desktop');
      if (desktop) {
        desktop.style.visibility = 'visible';
        desktop.style.opacity = '1';
      }

      // Close all app windows
      ['gmail','browser','folder','antivirus','comms','ransomware','wifi-settings','docviewer','imageviewer','videoplayer','taskmanager','scanner','control-panel'].forEach(a => {
        if (typeof appState !== 'undefined' && appState[a]) {
          appState[a].open = false; appState[a].minimized = false; appState[a].maximized = false;
        }
        const w = document.getElementById('win-' + a);
        if (w) { w.classList.add('hidden'); w.classList.remove('maximized','focused','minimized'); }
      });
      if (typeof updateTaskbar === 'function') updateTaskbar();

      if (isCompleted) {
        // ── Chapter 1 fully COMPLETED ── load directly into simulated desktop ──
        // Do NOT restart mission, do NOT show intro, tests, dialogue, or checklist items
        window._awardClaimed = true;
        window._ryanGuideDismissed = true;
        window._phishAutoModalShown = true;
        // Mark as "completed sandbox mode" so sticky note shows empty (not checklist)
        window._ch1CompletedSandbox = true;
        // Do NOT set _postAwardPostTestDialogueFired; Shutdown (Save) must remain accessible

        if (typeof updateDesktopTrophyDisplay === 'function') {
          updateDesktopTrophyDisplay();
        }

        // Keep _awaitingShutdownForChapter2 FALSE on the completed desktop.
        // Shutdown (Save) still works; this flag only drives guide highlights
        // which we explicitly do NOT want on a completed-chapter free desktop.
        window._awaitingShutdownForChapter2 = false;

        // Render clean empty Sticky Note (no checklist items) and close it
        if (typeof renderEmptyStickyNote === 'function') {
          renderEmptyStickyNote();
        } else {
          const scrollEl = document.querySelector('#sticky-note .sticky-note-scroll');
          if (scrollEl) {
            scrollEl.innerHTML = `<div id="sticky-note-content" class="sticky-note-content" contenteditable="true" spellcheck="false" aria-label="Sticky note text" data-placeholder="Take a note..."></div>`;
          }
        }
        if (typeof closeStickyNote === 'function') {
          closeStickyNote();
        }

        // Dismiss & reset any active mentor dialogue, pretest, posttest, audio
        if (typeof RyanGuide !== 'undefined' && RyanGuide.dismiss) {
          try { RyanGuide.dismiss(true); } catch (e) {}
        }
        if (typeof RyanPretest !== 'undefined' && RyanPretest.reset) {
          try { RyanPretest.reset(); } catch (e) {}
        }
        if (typeof RyanPosttest !== 'undefined' && RyanPosttest.reset) {
          try { RyanPosttest.reset(); } catch (e) {}
        }
        if (typeof ComicAudio !== 'undefined' && ComicAudio.stop) {
          try { ComicAudio.stop(); } catch (e) {}
        }
        const ryanModal = document.getElementById('ryan-guide-modal') || document.querySelector('.ryan-guide-container');
        if (ryanModal) ryanModal.remove();

        // ── Strip ALL tutorial highlights / glows from the desktop ──────────
        // Run immediately and again after a short delay to catch anything
        // that is added asynchronously (e.g. by startWorkstationLogoffGuide).
        function _stripCh1TutorialHighlights() {
          const HIGHLIGHT_CLASSES = [
            'btn-pulse-highlight', 'start-attention', 'power-attention',
            'power-item-attention', 'icon-attention', 'icon-attention-dismiss',
            'highlight-attention', 'tutorial-flag-blink', 'phish-tutorial-highlight',
            'verdict-btn-highlight', 'pl-icon-pulse'
          ];

          // Every element in the DOM that might carry a highlight class
          const candidateIds = [
            'start-btn', 'start-power-btn', 'start-shutdown-btn',
            'taskbar-gmail', 'taskbar-notes', 'taskbar-comms',
            'icon-gmail', 'icon-notes', 'icon-comms', 'icon-browser',
            'icon-folder', 'icon-antivirus', 'icon-desktop',
            'flag-mode-btn', 'report-btn', 'legit-btn',
            'sticky-note', 'overlay-welcome',
            'taskbar-phone-link', 'icon-phone-link'
          ];

          candidateIds.forEach(function(id) {
            const el = document.getElementById(id);
            if (el) el.classList.remove(...HIGHLIGHT_CLASSES);
          });

          // Also sweep any element currently carrying one of these classes
          HIGHLIGHT_CLASSES.forEach(function(cls) {
            document.querySelectorAll('.' + cls).forEach(function(el) {
              el.classList.remove(...HIGHLIGHT_CLASSES);
            });
          });

          // Remove any injected logoff notice panel
          const notice = document.getElementById('desktop-shutdown-notice');
          if (notice) notice.remove();

          // Clear the logoff guide state WITHOUT re-triggering highlights
          window._awaitingShutdownForChapter2 = false;

          // Stop any PhishTutorial that might re-add highlight classes
          if (typeof PhishTutorial !== 'undefined' && PhishTutorial.reset) {
            try { PhishTutorial.reset(); } catch (e) {}
          }
          // Stop ryan-welcome icon pulse
          if (typeof RyanWelcome !== 'undefined' && RyanWelcome.stop) {
            try { RyanWelcome.stop(); } catch (e) {}
          }
        }

        _stripCh1TutorialHighlights();
        // Run again after 300ms and 800ms to catch async highlight re-additions
        setTimeout(_stripCh1TutorialHighlights, 300);
        setTimeout(_stripCh1TutorialHighlights, 800);

        // No toast — user already sees the desktop appearing; silent load.
      } else {
        // ── Chapter 1 UNFINISHED ── resume mission from latest saved progress ──
        window._ryanGuideDismissed = true;
        if (typeof startMission === 'function') {
          startMission(false);
        }
        // Silent resume — no toast cluttering the desktop
      }

    } else {
      // ── Chapters 2-4 ──
      if (typeof openChapterDesktopDirect === 'function') {
        openChapterDesktopDirect(catId);
      }
      if (isCompleted) {
        if (typeof renderEmptyStickyNote === 'function') renderEmptyStickyNote();
        if (typeof closeStickyNote === 'function') closeStickyNote();
        if (typeof RyanGuide !== 'undefined' && RyanGuide.dismiss) {
          try { RyanGuide.dismiss(true); } catch (e) {}
        }
      }
      // Silent resume for chapters 2–4 — no toast
    }
  }, 220);
}

// ════════════════════════════════════════════════════════════
//  FULLSCREEN TOGGLE
// ════════════════════════════════════════════════════════════

/** Toggle browser fullscreen mode. Works from the main menu fullscreen button or F11. */
function toggleMainMenuFullscreen() {
  const isFs = !!(
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement
  );

  if (!isFs) {
    // Enter fullscreen
    const el = document.documentElement;
    if (el.requestFullscreen)            el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    else if (el.mozRequestFullScreen)    el.mozRequestFullScreen();
    else if (el.msRequestFullscreen)     el.msRequestFullscreen();
  } else {
    // Exit fullscreen
    if (document.exitFullscreen)            document.exitFullscreen();
    else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    else if (document.mozCancelFullScreen)  document.mozCancelFullScreen();
    else if (document.msExitFullscreen)     document.msExitFullscreen();
  }
}

/** Sync the fullscreen button icon & body class whenever fullscreen state changes */
function _syncFullscreenState() {
  const isFs = !!(
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement ||
    (window.matchMedia && window.matchMedia('(display-mode: fullscreen)').matches)
  );

  document.body.classList.toggle('is-fullscreen', isFs);

  // ── Sync Fullscreen button: hide exit fullscreen button in fullscreen mode ──
  const btn = document.getElementById('mm-fullscreen-btn');
  if (btn) {
    btn.setAttribute('aria-label', isFs ? 'Exit fullscreen mode' : 'Toggle fullscreen mode');
    btn.title = isFs ? 'Exit Fullscreen [F11]' : 'Fullscreen [F11]';
    btn.style.display = isFs ? 'none' : '';
  }

  // Adjust all open windows dynamically on fullscreen enter/exit and window resize
  if (typeof adjustOpenWindowsForScreenChange === 'function') {
    adjustOpenWindowsForScreenChange();
    setTimeout(adjustOpenWindowsForScreenChange, 50);
    setTimeout(adjustOpenWindowsForScreenChange, 200);
  }

  // Smoothly update Achievement modal layout if currently open
  const achModal = document.getElementById('mm-achievement-modal');
  if (achModal && achModal.classList && typeof achModal.classList.contains === 'function' && !achModal.classList.contains('hidden')) {
    if (typeof renderMainMenuAchievements === 'function') {
      renderMainMenuAchievements();
    }
  }
}

// Listen for all fullscreen change events (cross-browser)
['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange']
  .forEach(ev => document.addEventListener(ev, _syncFullscreenState));

window.addEventListener('resize', _syncFullscreenState);

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', _syncFullscreenState);
} else {
  _syncFullscreenState();
}

// F11 keyboard shortcut — intercept and use our own fullscreen logic
document.addEventListener('keydown', function(e) {
  if (e.key === 'F11') {
    e.preventDefault(); // prevent the browser's native F11 behaviour
    toggleMainMenuFullscreen();
  }
});

// ════════════════════════════════════════════════════════════
//  BACKGROUND MUSIC — Main Menu ONLY
//  Plays: assets/sounds/Background.wav  (looping)
//  Preference: localStorage key 'czBgMusicMuted'
//
// ════════════════════════════════════════════════════════════
//  BACKGROUND MUSIC SYSTEM (MAIN MENU, LOADING, STORY SELECT)
//  Plays during:
//    - Main Menu (#overlay-main-menu)
//    - Game Loading Screen (#overlay-loading)
//    - Story Selection Screen (#overlay-story-select)
//  Stops when:
//    - User enters a mission / chapter gameplay / title card
//    - Google Auth screen is active
//    - User clicks the mute button (synced across all screens)
// ════════════════════════════════════════════════════════════

(function initMMBgMusic() {
  function _audio() { return document.getElementById('mm-bg-audio'); }
  function _btns()  {
    return [
      document.getElementById('mm-sound-btn'),
      document.getElementById('story-sound-btn')
    ].filter(Boolean);
  }
  function _widgets() {
    return [
      document.getElementById('mm-sound-widget'),
      document.getElementById('story-sound-widget')
    ].filter(Boolean);
  }
  function _muted() { return localStorage.getItem('czBgMusicMuted') === 'true'; }

  function _volume() {
    const saved = localStorage.getItem('czBgMusicVolume');
    if (saved !== null) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) return parsed;
    }
    return 70; // 70% default
  }

  function _syncVolumeSliders(val) {
    const sliders = [
      document.getElementById('mm-volume-slider'),
      document.getElementById('story-volume-slider')
    ].filter(Boolean);

    const labels = [
      document.getElementById('mm-volume-val'),
      document.getElementById('story-volume-val')
    ].filter(Boolean);

    const isMuted = _muted();
    sliders.forEach(slider => {
      slider.value = val;
      slider.style.setProperty('--fill-pct', `${val}%`);
    });

    labels.forEach(label => {
      label.textContent = isMuted ? 'Muted' : `${val}%`;
    });
  }

  function _isBgmActive() {
    // Background sound must NEVER play while the Google sign-in auth overlay is open
    const authEl = document.getElementById('cz-auth');
    if (authEl && authEl.classList.contains('active')) return false;

    // Never play during gameplay overlays (chapter title card, comic strips, login screen, etc.)
    const gameOverlays = [
      'overlay-chapter-card',
      'overlay-comic-strip',
      'overlay-comic-strip-ch2',
      'overlay-comic-strip-ch3',
      'overlay-comic-strip-ch4',
      'overlay-title-menu'
    ];
    for (let i = 0; i < gameOverlays.length; i++) {
      const el = document.getElementById(gameOverlays[i]);
      if (el && (el.classList.contains('active') || el.classList.contains('visible') || el.style.display === 'flex')) {
        return false;
      }
    }

    const mm = document.getElementById('overlay-main-menu');
    const isMM = !!mm && (mm.classList.contains('active') || mm.style.display === 'flex');

    const loadScreen = document.getElementById('overlay-loading');
    const isLoading = !!loadScreen && (loadScreen.classList.contains('active') || loadScreen.style.display === 'flex');

    const ss = document.getElementById('overlay-story-select');
    const isSS = !!ss && (ss.classList.contains('active') || ss.style.display === 'flex');

    return !!(isMM || isLoading || isSS);
  }

  /* ── Sync Story Selection sound button visibility ── */
  function _syncStorySoundBtn() {
    const ss = document.getElementById('overlay-story-select');
    const btn = document.getElementById('story-sound-btn');
    const widget = document.getElementById('story-sound-widget');
    if (!ss) return;
    const isActive = ss.classList.contains('active') || ss.style.display === 'flex';
    if (btn) btn.classList.toggle('ss-sound-visible', isActive);
    if (widget) widget.classList.toggle('ss-sound-visible', isActive);
  }

  /* ── Sync button icon only (no playback side-effects) ── */
  function _syncIcon(muted) {
    const isPlaying = !muted && _isBgmActive();
    _btns().forEach(btn => {
      btn.classList.toggle('mm-sound-muted',   muted);
      btn.classList.toggle('mm-sound-playing', isPlaying);
      btn.title = muted
        ? 'Background Music: OFF — Click to turn on'
        : 'Background Music: ON — Click to turn off';
      btn.setAttribute('aria-label', muted ? 'Turn on background music' : 'Turn off background music');
      const onIcon  = btn.querySelector('.mm-sound-on');
      const offIcon = btn.querySelector('.mm-sound-off');
      if (onIcon)  onIcon.style.display  = muted ? 'none' : '';
      if (offIcon) offIcon.style.display = muted ? ''     : 'none';
    });
    _widgets().forEach(w => {
      w.classList.toggle('mm-sound-muted', muted);
    });
    _syncVolumeSliders(_volume());
  }

  /* ── Core: start or stop audio based on current state ── */
  function _apply() {
    const audio = _audio();
    if (!audio) return;
    const muted = _muted();
    const vol = _volume();
    try {
      audio.volume = muted ? 0 : (vol / 100);
    } catch (e) {}

    if (_isBgmActive() && !muted) {
      // Main menu, Loading, or Story selection is active AND user wants music → play
      audio.play().catch(() => {});
    } else {
      // Any other page, Google Sign-in screen, gameplay, OR user muted → silence
      audio.pause();
    }
    _syncIcon(muted);
    _syncStorySoundBtn();
    _syncVolumeSliders(vol);
    localStorage.setItem('czBgMusicMuted', muted ? 'true' : 'false');
  }

  /* ── Volume Slider Change Handler ── */
  window.setMMBgMusicVolume = function (val) {
    const audio = _audio();
    const num = Math.max(0, Math.min(100, parseInt(val, 10) || 0));
    localStorage.setItem('czBgMusicVolume', num);

    if (num === 0) {
      localStorage.setItem('czBgMusicMuted', 'true');
      if (audio) {
        try { audio.volume = 0; } catch (e) {}
      }
      _syncIcon(true);
    } else {
      const wasMuted = _muted();
      if (wasMuted) {
        localStorage.setItem('czBgMusicMuted', 'false');
        _syncIcon(false);
      }
      if (audio) {
        try {
          audio.volume = num / 100;
          if (wasMuted && _isBgmActive()) {
            audio.play().catch(() => {});
          }
        } catch (e) {}
      }
    }

    _syncVolumeSliders(num);
    if (typeof AudioManager !== 'undefined') {
      try { AudioManager.playSliderTick(); } catch (e) {}
    }
  };

  /* ── Toggle called by the 🔊 button (Main Menu & Story Selection) ── */
  window.toggleMMBgMusic = function () {
    const audio = _audio();
    if (!audio) return;
    const currentMuted = _muted();
    const nowMuted = !currentMuted;
    localStorage.setItem('czBgMusicMuted', nowMuted ? 'true' : 'false');
    if (!nowMuted && _volume() === 0) {
      localStorage.setItem('czBgMusicVolume', '70');
      _syncVolumeSliders(70);
    }
    _apply();
  };

  /* ── Called by showMainMenu(), mainMenuStart(), etc. ── */
  window.startMMBgMusic = function () {
  if (typeof ComicAudio !== 'undefined') ComicAudio.stop(); // Prevent overlap with main menu audio
    const authEl = document.getElementById('cz-auth');
    if (authEl && authEl.classList.contains('active')) {
      const audio = _audio();
      if (audio) audio.pause();
      return;
    }
    _apply();
  };

  /* ── Called by hideMainMenu(), storySelectPlay(), sign-in, etc. ── */
  window.stopMMBgMusic = function () {
    const audio = _audio();
    if (audio) {
      audio.pause();
      try { audio.currentTime = 0; } catch (e) {}
    }
    _btns().forEach(btn => btn.classList.remove('mm-sound-playing'));
  };

  /* ── Smooth volume fade out (e.g. on sign out) ── */
  window.fadeOutMMBgMusic = function (durationMs) {
    const ms = typeof durationMs === 'number' ? durationMs : 380;
    return new Promise(function (resolve) {
      const audio = _audio();
      if (!audio || audio.paused || _muted() || audio.volume <= 0) {
        window.stopMMBgMusic();
        return resolve();
      }
      const initialVol = audio.volume;
      const startTime = performance.now();
      function tick(now) {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / ms);
        // Sinusoidal ease-out curve
        const factor = 1 - Math.sin((progress * Math.PI) / 2);
        try {
          audio.volume = Math.max(0, initialVol * factor);
        } catch (e) {}
        if (progress < 1) {
          requestAnimationFrame(tick);
        } else {
          window.stopMMBgMusic();
          try {
            audio.volume = _muted() ? 0 : (_volume() / 100);
          } catch (e) {}
          resolve();
        }
      }
      requestAnimationFrame(tick);
    });
  };

  /* ── Watch overlay active changes & Google auth overlay ──
     Music plays while Main Menu, Loading, or Story Selection is active and auth is NOT active.
  ────────────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    _syncStorySoundBtn();
    _syncIcon(_muted());
    _syncVolumeSliders(_volume());

    // Dismiss active mobile slider if touched outside
    document.addEventListener('pointerdown', function (e) {
      if (!e.target.closest('.mm-sound-widget')) {
        _widgets().forEach(w => w.classList.remove('active'));
      }
    });

    const mm = document.getElementById('overlay-main-menu');
    const loadScreen = document.getElementById('overlay-loading');
    const ss = document.getElementById('overlay-story-select');
    const cc = document.getElementById('overlay-chapter-card');

    let _gestureUnlocked = false;
    function _onGesture() {
      const authEl = document.getElementById('cz-auth');
      if (authEl && authEl.classList.contains('active')) {
        return;
      }

      if (_gestureUnlocked) return;
      _gestureUnlocked = true;
      document.removeEventListener('click',   _onGesture, true);
      document.removeEventListener('keydown', _onGesture, true);
      _apply();
    }
    document.addEventListener('click',   _onGesture, true);
    document.addEventListener('keydown', _onGesture, true);

    function _syncAllState() {
      _syncStorySoundBtn();
      if (_gestureUnlocked) _apply();
      else _syncIcon(_muted());
    }

    [mm, loadScreen, ss, cc].filter(Boolean).forEach(el => {
      new MutationObserver(_syncAllState).observe(el, {
        attributes: true,
        attributeFilter: ['class', 'style']
      });
    });

    /* MutationObserver on Google Sign-In auth overlay — stops sound immediately on auth */
    function _attachAuthObserver(authEl) {
      if (!authEl) return;
      if (authEl.classList.contains('active')) {
        window.stopMMBgMusic();
      }
      new MutationObserver(function () {
        if (authEl.classList.contains('active')) {
          if (!window._czIsSigningOut) window.stopMMBgMusic();
        } else if (_gestureUnlocked) {
          _apply();
        }
      }).observe(authEl, { attributes: true, attributeFilter: ['class'] });
    }

    const authEl = document.getElementById('cz-auth');
    if (authEl) {
      _attachAuthObserver(authEl);
    } else {
      const bodyObs = new MutationObserver(function () {
        const el = document.getElementById('cz-auth');
        if (el) {
          _attachAuthObserver(el);
          bodyObs.disconnect();
        }
      });
      bodyObs.observe(document.body, { childList: true });
    }
  });
})();


// ════════════════════════════════════════════════════════════
//  LOGIN PAGE — FULLSCREEN BUTTON VISIBILITY
//  #login-fs-btn lives OUTSIDE #overlay-title-menu so the
//  parent's transform:scale() cannot trap it.
//  We show/hide it by toggling .ls-fs-visible via a
//  MutationObserver watching the overlay's class list.
// ════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', function () {
  const titleMenu = document.getElementById('overlay-title-menu');
  const fsBtn     = document.getElementById('login-fs-btn');
  if (!titleMenu || !fsBtn) return;

  function _syncLoginFsBtn() {
    const isActive = titleMenu.classList.contains('active');
    fsBtn.classList.toggle('ls-fs-visible', isActive);
  }

  // Sync immediately in case the overlay is already active on load
  _syncLoginFsBtn();

  new MutationObserver(function (mutations) {
    mutations.forEach(function (m) {
      if (m.type === 'attributes' && m.attributeName === 'class') {
        _syncLoginFsBtn();
      }
    });
  }).observe(titleMenu, { attributes: true });
});

// ════════════════════════════════════════════════════════════
//  STORY SELECT PAGE — FULLSCREEN BUTTON VISIBILITY
//  Same pattern: #story-fs-btn is OUTSIDE #overlay-story-select.
//  The overlay uses both classList.active AND style.display,
//  so we watch both attribute types.
// ════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', function () {
  const storyOverlay = document.getElementById('overlay-story-select');
  const storyFsBtn   = document.getElementById('story-fs-btn');
  if (!storyOverlay || !storyFsBtn) return;

  function _syncStoryFsBtn() {
    const isActive = storyOverlay.classList.contains('active') ||
                     storyOverlay.style.display === 'flex';
    storyFsBtn.classList.toggle('ss-fs-visible', isActive);
    const storySoundWidget = document.getElementById('story-sound-widget');
    if (storySoundWidget) {
      storySoundWidget.classList.toggle('ss-sound-visible', isActive);
    }
  }

  _syncStoryFsBtn();
  if (typeof updateAchievementNotificationBadge === 'function') {
    updateAchievementNotificationBadge();
  }

  new MutationObserver(function (mutations) {
    mutations.forEach(function (m) {
      if (m.type === 'attributes' &&
          (m.attributeName === 'class' || m.attributeName === 'style')) {
        _syncStoryFsBtn();
      }
    });
  }).observe(storyOverlay, { attributes: true });
});







// ── Auto-sync user bar visibility whenever About or Achievement modal attributes change ──
if (typeof MutationObserver !== 'undefined' && typeof window !== 'undefined') {
  const _attachModalUserBarObserver = () => {
    ['mm-about-modal', 'mm-achievement-modal'].forEach(id => {
      const el = document.getElementById(id);
      if (el && !el._userBarObserverAttached) {
        el._userBarObserverAttached = true;
        new MutationObserver(() => {
          if (typeof _syncUserBarModalVisibility === 'function') _syncUserBarModalVisibility();
        }).observe(el, { attributes: true, attributeFilter: ['class', 'style'] });
      }
    });
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _attachModalUserBarObserver);
  } else {
    _attachModalUserBarObserver();
  }
}
