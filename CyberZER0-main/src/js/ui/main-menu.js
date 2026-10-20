'use strict';

// ════════════════════════════════════════════════════════════
//  MAIN MENU FUNCTIONS
// ════════════════════════════════════════════════════════════

/** Show the main menu overlay */
function showMainMenu() {
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
}

/** Hide the main menu overlay */
function hideMainMenu() {
  const mm = document.getElementById('overlay-main-menu');
  if (mm) mm.classList.remove('active');
  // Close any open sub-modals
  closeMainMenuAbout();
  closeMainMenuAchievement();
  closeMainMenuExit();
}

/** START button — 5s loading, professional wipe transition into Enter Name */
function mainMenuStart() {
  closeMainMenuAbout();
  closeMainMenuAchievement();
  closeMainMenuExit();

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
  if (typeof AudioManager !== 'undefined') {
    try { AudioManager.playClick(); } catch(e) {}
  }

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
      if (typeof AudioManager !== 'undefined') {
        try { AudioManager.playWrong(); } catch(e) {}
      }
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
    if (typeof AudioManager !== 'undefined') {
      try { AudioManager.playWrong(); } catch(e) {}
    }
    storySelectLocked(chapterNum);
  } else {
    // Cyber chime sound for unlocked target lock
    if (typeof AudioManager !== 'undefined') {
      try { AudioManager.playChime(); } catch(e) {}
    }

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

          // Proceed to Chapter 1 Comic Strip or sign-in screen
          window._pendingStoryChapter = categoryId;
          updateLoginScreenForChapter(categoryId);
          if (categoryId === 'phishing') {
            // Show comic strip first BEFORE Alex enters password!
            showComicStrip();
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
      earned.push({ ...ach, score: cat.score || 0, rank: cat.rank || 'S' });
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
    const isTrophy  = ach.awardType === 'trophy' || isGrand;
    const awardEmoji = isGrand ? '🌟🏆' : (isTrophy ? '🏆' : '🎖️');
    const cardClass  = isGrand ? 'mm-ach-item ach-completed ach-grand'
                     : isTrophy ? 'mm-ach-item ach-completed ach-trophy'
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
        <div class="mm-ach-award-tag ${isGrand ? 'award-grand' : isTrophy ? 'award-trophy' : 'award-ribbon'}">
          ${isGrand ? '🌟 MASTER' : isTrophy ? '🏆 TROPHY' : '🎖️ RIBBON'}
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
