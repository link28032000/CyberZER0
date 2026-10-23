'use strict';

// ════════════════════════════════════════════════════════════
//  MAIN MENU FUNCTIONS
// ════════════════════════════════════════════════════════════

/** Show the main menu overlay */
function showMainMenu() {
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

/** START button — 5s loading, professional wipe transition into Enter Name */
function mainMenuStart() {
  closeMainMenuAbout();
  closeMainMenuAchievement();
  closeMainMenuExit();
  // Keep background music playing through loading into Story Selection
  if (typeof startMMBgMusic === 'function') startMMBgMusic();

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

  // 1. Slide & blur out the main menu buttons
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

    // Hide main menu behind once loading screen is visible
    setTimeout(() => {
      if (mm) { mm.style.display = 'none'; }
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

function selectStoryCard(cardEl, categoryId, chapterNum) {
  if (!cardEl) return;

  const isAlreadySelected = cardEl.classList.contains('ss-card-selected');
  const isLocked = cardEl.classList.contains('ss-card-locked') || !categoryId;

  // If already selected and clicked again:
  if (isAlreadySelected) {
    if (isLocked) {
      // Re-trigger locked shake & sound
      cardEl.classList.remove('ss-card-selected');
      void cardEl.offsetWidth;
      cardEl.classList.add('ss-card-selected');
      storySelectLocked(chapterNum);
    } else {
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

    // Immediately update profile to match the selected chapter
    updateLoginScreenForChapter(categoryId);

    // Add START MISSION button in footer
    const footer = cardEl.querySelector('.ss-card-footer');
    if (footer && !footer.querySelector('.ss-play-btn')) {
      const playBtn = document.createElement('button');
      playBtn.className = 'ss-play-btn';
      playBtn.innerHTML = `<span>START MISSION</span> <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`;
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
    const cat = (typeof CATEGORIES !== 'undefined' && CATEGORIES.find(c => c.id === categoryId)) || { num: 1, title: 'THE FIRST DAY' };
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
          } else if (categoryId === 'social_engineering' || categoryId === 'social' || categoryId === 'social-engineering') {
            // Show Chapter 3 comic strip first BEFORE Pia enters password!
            showComicStripCh3();
          } else if (categoryId === 'ransomware' || categoryId === 'ch4' || categoryId === 4) {
            // Show Chapter 4 comic strip first BEFORE Ryan enters password!
            showComicStripCh4();
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
      } else if (categoryId === 'social_engineering' || categoryId === 'social' || categoryId === 'social-engineering') {
        showComicStripCh3();
      } else if (categoryId === 'ransomware' || categoryId === 'ch4' || categoryId === 4) {
        showComicStripCh4();
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
  const messages = {
    2: '🔒 Complete Chapter 1 first to unlock Chapter 2!',
    3: '🔒 Complete Chapters 1–2 first to unlock Chapter 3!',
    4: '🔒 Complete all previous chapters to unlock Chapter 4!'
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
      selectStoryCard(targetCard, targetCatId, targetChapterNum);
    }
  } else if (_selectedStoryCard && _selectedStoryCard.categoryId) {
    updateLoginScreenForChapter(_selectedStoryCard.categoryId);
  }
}


/** ABOUT button — show the About modal */
function mainMenuAbout() {
  const modal = document.getElementById('mm-about-modal');
  if (modal) modal.classList.remove('hidden');
}

/** Close About modal */
function closeMainMenuAbout() {
  const modal = document.getElementById('mm-about-modal');
  if (modal) modal.classList.add('hidden');
}

/** ACHIEVEMENT button — show the Achievements modal */
function mainMenuAchievement() {
  if (typeof AudioManager !== 'undefined') {
    try { AudioManager.playClick(); } catch(e) {}
  }
  renderMainMenuAchievements();
  const modal = document.getElementById('mm-achievement-modal');
  if (modal) modal.classList.remove('hidden');
}

/** Close Achievement modal */
function closeMainMenuAchievement() {
  if (typeof AudioManager !== 'undefined') {
    try { AudioManager.playClick(); } catch(e) {}
  }
  const modal = document.getElementById('mm-achievement-modal');
  if (modal) modal.classList.add('hidden');
}

/** Render list of chapter and master achievements.
 *  Empty state when nothing completed; ribbon/trophy cards for each completed chapter. */
function renderMainMenuAchievements() {
  const listEl = document.getElementById('mm-ach-list');
  if (!listEl) return;

  // Achievement definitions — maps CATEGORIES ids to award metadata
  const achData = [
    {
      catId: 'phishing',
      icon: '🎣',
      awardType: 'ribbon',           // ribbon = 🎖️ | trophy = 🏆
      awardLabel: 'PHISHING SENTINEL',
      awardFull:  'Phishing Sentinel Ribbon',
      chapter: 'Chapter 1 · The First Day',
      desc: 'Exposed deceptive emails, identified fraudulent sender addresses, and reported all phishing traps.'
    },
    {
      catId: 'malware',
      icon: '🛡️',
      awardType: 'trophy',
      awardLabel: 'MALWARE HUNTER',
      awardFull:  'Malware Hunter Trophy',
      chapter: 'Chapter 2 · The Digital Trap',
      desc: 'Isolated disguised executable payloads, ran anti-virus sweeps, and secured the quarantine chamber.'
    },
    {
      catId: 'social_engineering',
      icon: '🎭',
      awardType: 'ribbon',
      awardLabel: 'SOCIAL SHIELD',
      awardFull:  'Social Shield Ribbon',
      chapter: 'Chapter 3 · The System Collapse',
      desc: 'Defended against pretexting, vishing, and credential harvesting schemes.'
    },
    {
      catId: 'ransomware',
      icon: '🔒',
      awardType: 'trophy',
      awardLabel: 'VAULT GUARDIAN',
      awardFull:  'Vault Guardian Trophy',
      chapter: 'Chapter 4 · The Last Login',
      desc: 'Isolated ransomware vectors, recovered encrypted project nodes, and restored all backups.'
    }
  ];

  // Collect completed chapter achievements
  const earned = [];
  achData.forEach(ach => {
    if (typeof CATEGORIES === 'undefined') return;
    const cat = CATEGORIES.find(c => c.id === ach.catId);
    if (cat && cat.completed) {
      let finalAch = { ...ach, score: cat.score || 0, rank: cat.rank || 'S' };

      // Dynamically load the user's earned achievement tier for Chapter 1
      if (ach.catId === 'phishing') {
        try {
          const phishSaved = localStorage.getItem('cyberzero_phishing_progress');
          if (phishSaved) {
            const pData = JSON.parse(phishSaved);
            const aw = pData.earnedAward || (pData.trophyUnlocked ? { tier: 'trophy' } : null);
            if (aw && aw.tier) {
              finalAch.awardType = aw.tier;
              if (aw.tier === 'trophy') {
                finalAch.awardLabel = 'PHISHING MASTER';
                finalAch.awardFull  = 'Phishing Master Trophy';
                finalAch.desc = 'Exposed deceptive emails, completed all 4 investigation tasks, and earned 1st place Master honors.';
              } else if (aw.tier === 'medal') {
                finalAch.awardLabel = 'PHISHING INVESTIGATOR';
                finalAch.awardFull  = 'Phishing Investigator Medal';
                finalAch.desc = 'Exposed deceptive emails, identified phishing indicators, and earned the 2nd place Investigator Medal.';
              } else {
                finalAch.awardLabel = 'PHISHING SENTINEL';
                finalAch.awardFull  = 'Phishing Security Ribbon';
                finalAch.desc = 'Completed email investigation, exposed phishing lures, and earned the Security Awareness Ribbon.';
              }
            }
          }
        } catch(e) {}
      }

      earned.push(finalAch);
    }
  });

  // Check grand master (all 4 done)
  const allDone = typeof CATEGORIES !== 'undefined' && CATEGORIES.every(c => c.completed);
  if (allDone) {
    earned.push({
      catId: null,
      icon: '🌟',
      awardType: 'grand',
      awardLabel: 'GRAND DETECTIVE',
      awardFull:  'CyberZerØ Grand Detective Trophy',
      chapter: 'Grand Finale Accolade',
      desc: 'All threat scenarios cleared with distinguished detective honors. Master Certificate awarded.',
      score: CATEGORIES.reduce((s, c) => s + (c.score || 0), 0),
      rank: 'S'
    });
  }

  // ── Empty state ──
  if (earned.length === 0) {
    listEl.innerHTML = `
      <div class="mm-ach-empty-state">
        <div class="mm-ach-empty-icon">
          <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
            <path d="M14 9 H42 V23 C42 31.8 35.7 38 28 38 C20.3 38 14 31.8 14 23 Z"
                  fill="none" stroke="#00b4f0" stroke-width="2.5" stroke-dasharray="5 3"/>
            <path d="M14 15 H9 C6.8 15 5 16.8 5 19 V21.5 C5 26.5 8.5 30.5 13.5 31"
                  stroke="#00b4f0" stroke-width="2" stroke-linecap="round" stroke-dasharray="4 3"/>
            <path d="M42 15 H47 C49.2 15 51 16.8 51 19 V21.5 C51 26.5 47.5 30.5 42.5 31"
                  stroke="#00b4f0" stroke-width="2" stroke-linecap="round" stroke-dasharray="4 3"/>
            <path d="M28 38 V46 M18 46 H38" stroke="#00b4f0" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="4 3"/>
          </svg>
        </div>
        <div class="mm-ach-empty-title">NO ACHIEVEMENTS YET</div>
        <div class="mm-ach-empty-sub">Complete mission chapters to earn honorary ribbons and trophies</div>
      </div>
    `;
    return;
  }

  // ── Render earned award cards ──
  let html = '';
  earned.forEach(ach => {
    const isGrand   = ach.awardType === 'grand';
    const isTrophy  = ach.awardType === 'trophy';
    const isMedal   = ach.awardType === 'medal';
    const awardEmoji = isGrand ? '🌟🏆' : (isTrophy ? '🏆' : isMedal ? '🥈' : '🎖️');
    const cardClass  = isGrand ? 'mm-ach-item ach-completed ach-grand'
                     : isTrophy ? 'mm-ach-item ach-completed ach-trophy'
                     : isMedal  ? 'mm-ach-item ach-completed ach-medal'
                     : 'mm-ach-item ach-completed ach-ribbon';

    const rankDisplay = ach.rank ? `Rank <strong>${ach.rank}</strong>` : '';
    const scoreDisplay = ach.score ? `${ach.score.toLocaleString()} pts` : '';
    const metaLine = [rankDisplay, scoreDisplay].filter(Boolean).join(' &nbsp;·&nbsp; ');

    html += `
      <div class="${cardClass}">
        <div class="mm-ach-award-badge" title="${ach.awardFull}">${awardEmoji}</div>
        <div class="mm-ach-info">
          <div class="mm-ach-name-row">
            <span class="mm-ach-name">${ach.awardLabel}</span>
            <span class="mm-ach-badge">${ach.chapter}</span>
          </div>
          <p class="mm-ach-desc">${ach.desc}</p>
          ${metaLine ? `<div class="mm-ach-meta">${metaLine}</div>` : ''}
        </div>
        <div class="mm-ach-award-tag ${isGrand ? 'award-grand' : isTrophy ? 'award-trophy' : isMedal ? 'award-medal' : 'award-ribbon'}">
          ${isGrand ? '🌟 MASTER' : isTrophy ? '🏆 TROPHY' : isMedal ? '🥈 MEDAL' : '🎖️ RIBBON'}
        </div>
      </div>
    `;
  });

  listEl.innerHTML = html;
}

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
  phishing:           'Ch.1 · The First Day',
  malware:            'Ch.2 · The Digital Trap',
  social_engineering: 'Ch.3 · The System Collapse',
  ransomware:         'Ch.4 · The Last Login'
};

/**
 * Detects whether the player has any saved progress in localStorage,
 * then updates the Start button to show "Continue" (with chapter hint)
 * or "New Game" for a fresh slate.
 */
function updateStartButton() {
  const labelEl    = document.getElementById('mm-start-label');
  const subEl      = document.getElementById('mm-start-sublabel');
  const wrapEl     = subEl && subEl.closest('.mm-btn-label-wrap');
  const iconNew    = document.querySelector('.mm-start-icon-new');
  const iconCont   = document.querySelector('.mm-start-icon-continue');

  if (!labelEl) return;

  // Detect saved progress
  let savedCatId = null;
  try {
    const raw = localStorage.getItem('cyberzero_categories');
    if (raw) {
      const data = JSON.parse(raw);
      if (Array.isArray(data)) {
        // Find the furthest unlocked (but not yet completed) chapter, or last completed
        const order = ['phishing', 'malware', 'social_engineering', 'ransomware'];
        let best = null;
        order.forEach(id => {
          const entry = data.find(c => c.id === id);
          if (entry && (entry.unlocked || entry.completed)) best = id;
        });
        savedCatId = best;
      }
    }
  } catch(e) { /* ignore */ }

  if (savedCatId) {
    // Has save data — show Continue
    labelEl.textContent = 'Continue';
    if (subEl) {
      subEl.textContent = _CHAPTER_LABELS[savedCatId] || savedCatId;
      if (wrapEl) wrapEl.classList.add('has-sublabel');
    }
    if (iconNew)  iconNew.style.display  = 'none';
    if (iconCont) iconCont.style.display = '';
    // Store the chapter to resume so mainMenuStart() can use it
    window._continueChapterId = savedCatId;
  } else {
    // No save — show New Game
    labelEl.textContent = 'New Game';
    if (subEl) {
      subEl.textContent = '';
      if (wrapEl) wrapEl.classList.remove('has-sublabel');
    }
    if (iconNew)  iconNew.style.display  = '';
    if (iconCont) iconCont.style.display = 'none';
    window._continueChapterId = null;
  }
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

  // ── Always keep standard Fullscreen label/title for windowed mode ──
  const btn = document.getElementById('mm-fullscreen-btn');
  if (btn) {
    btn.setAttribute('aria-label', 'Toggle fullscreen mode');
    btn.title = 'Fullscreen [F11]';
  }

  // Adjust all open windows dynamically on fullscreen enter/exit and window resize
  if (typeof adjustOpenWindowsForScreenChange === 'function') {
    adjustOpenWindowsForScreenChange();
    setTimeout(adjustOpenWindowsForScreenChange, 50);
    setTimeout(adjustOpenWindowsForScreenChange, 200);
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
//  Plays: assets/sounds/Background.mp3  (looping)
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
  function _muted() { return localStorage.getItem('czBgMusicMuted') === 'true'; }

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
    if (!ss || !btn) return;
    const isActive = ss.classList.contains('active') || ss.style.display === 'flex';
    btn.classList.toggle('ss-sound-visible', isActive);
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
  }

  /* ── Core: start or stop audio based on current state ── */
  function _apply() {
    const audio = _audio();
    if (!audio) return;
    const muted = _muted();
    if (_isBgmActive() && !muted) {
      // Main menu, Loading, or Story selection is active AND user wants music → play
      audio.play().catch(() => {});
    } else {
      // Any other page, Google Sign-in screen, gameplay, OR user muted → silence
      audio.pause();
    }
    _syncIcon(muted);
    _syncStorySoundBtn();
    localStorage.setItem('czBgMusicMuted', muted ? 'true' : 'false');
  }

  /* ── Toggle called by the 🔊 button (Main Menu & Story Selection) ── */
  window.toggleMMBgMusic = function () {
    const audio = _audio();
    if (!audio) return;
    const currentMuted = _muted();
    const nowMuted = !currentMuted;
    localStorage.setItem('czBgMusicMuted', nowMuted ? 'true' : 'false');
    _apply();
  };

  /* ── Called by showMainMenu(), mainMenuStart(), etc. ── */
  window.startMMBgMusic = function () {
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

  /* ── Watch overlay active changes & Google auth overlay ──
     Music plays while Main Menu, Loading, or Story Selection is active and auth is NOT active.
  ────────────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    _syncStorySoundBtn();
    _syncIcon(_muted());

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
          window.stopMMBgMusic();
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
  }

  _syncStoryFsBtn();

  new MutationObserver(function (mutations) {
    mutations.forEach(function (m) {
      if (m.type === 'attributes' &&
          (m.attributeName === 'class' || m.attributeName === 'style')) {
        _syncStoryFsBtn();
      }
    });
  }).observe(storyOverlay, { attributes: true });
});






