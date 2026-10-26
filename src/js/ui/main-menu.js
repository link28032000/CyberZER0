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
  if (typeof updateAchievementNotificationBadge === 'function') {
    updateAchievementNotificationBadge();
  }
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

function selectStoryCard(cardEl, categoryId, chapterNum, playSound = true) {
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
  if (typeof AudioManager !== 'undefined') {
    AudioManager.unlock();
    AudioManager.playMouseClick();
  }
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
  if (typeof AudioManager !== 'undefined') {
    AudioManager.unlock();
    AudioManager.playWrong();
  }
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
      selectStoryCard(targetCard, targetCatId, targetChapterNum, false);
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

// ════════════════════════════════════════════════════════════
//  MISSION ACHIEVEMENTS ENGINE (4 CHAPTER MEDALS + 1 TROPHY)
// ════════════════════════════════════════════════════════════

const ACH_CLAIMED_STORAGE_KEY = 'cyberzero_claimed_achievements';

/**
 * The 5 Core Mission Achievements:
 * - 4 Chapter Threat Medals (Phishing, Malware, Safe Online, Ransomware)
 * - 1 Grand Master Trophy for clearing all 4 Chapters
 */
const MISSION_ACHIEVEMENTS = [
  {
    id: 'ach_phishing',
    catId: 'phishing',
    type: 'medal',
    num: 1,
    chapterTag: 'CHAPTER 1 · PHISHING DEFENSE',
    threatCategory: 'PHISHING',
    title: 'Phishing Sentinel Medal',
    objective: 'Awarded for detecting spoofed domains, identifying deceptive email traps, and securing credentials.',
    iconSymbol: '🎣',
    tiers: {
      gold: {
        label: 'Gold Medal',
        tag: '🥇 GOLD MEDAL',
        badgeTitle: 'Gold Phishing Sentinel',
        detail: 'Rank S · Flawless Phishing Detection'
      },
      silver: {
        label: 'Silver Medal',
        tag: '🥈 SILVER MEDAL',
        badgeTitle: 'Silver Phishing Sentinel',
        detail: 'Rank A/B · Commended Threat Triage'
      },
      bronze: {
        label: 'Bronze Medal',
        tag: '🥉 BRONZE MEDAL',
        badgeTitle: 'Bronze Phishing Sentinel',
        detail: 'Cleared · Threat Traps Reported'
      }
    }
  },
  {
    id: 'ach_malware',
    catId: 'malware',
    type: 'medal',
    num: 2,
    chapterTag: 'CHAPTER 2 · MALWARE PROTECTION',
    threatCategory: 'MALWARE',
    title: 'Malware Hunter Medal',
    objective: 'Awarded for scanning suspicious payloads, executing antivirus sweeps, and quarantining infections.',
    iconSymbol: '🛡️',
    tiers: {
      gold: {
        label: 'Gold Medal',
        tag: '🥇 GOLD MEDAL',
        badgeTitle: 'Gold Malware Hunter',
        detail: 'Rank S · Zero False Positives'
      },
      silver: {
        label: 'Silver Medal',
        tag: '🥈 SILVER MEDAL',
        badgeTitle: 'Silver Malware Hunter',
        detail: 'Rank A/B · Precision Quarantine'
      },
      bronze: {
        label: 'Bronze Medal',
        tag: '🥉 BRONZE MEDAL',
        badgeTitle: 'Bronze Malware Hunter',
        detail: 'Cleared · Payloads Neutralized'
      }
    }
  },
  {
    id: 'ach_safe_online',
    catId: 'social_engineering',
    type: 'medal',
    num: 3,
    chapterTag: 'CHAPTER 3 · SAFE ONLINE BROWSING',
    threatCategory: 'SAFE ONLINE',
    title: 'Safe Online Guardian Medal',
    objective: 'Awarded for securing public Wi-Fi traffic, blocking network sniffing, and resisting pretexting scams.',
    iconSymbol: '🌐',
    tiers: {
      gold: {
        label: 'Gold Medal',
        tag: '🥇 GOLD MEDAL',
        badgeTitle: 'Gold Safe Online Guardian',
        detail: 'Rank S · Flawless Cyber Hygiene'
      },
      silver: {
        label: 'Silver Medal',
        tag: '🥈 SILVER MEDAL',
        badgeTitle: 'Silver Safe Online Guardian',
        detail: 'Rank A/B · Safe Decisions Executed'
      },
      bronze: {
        label: 'Bronze Medal',
        tag: '🥉 BRONZE MEDAL',
        badgeTitle: 'Bronze Safe Online Guardian',
        detail: 'Cleared · Network Secured'
      }
    }
  },
  {
    id: 'ach_ransomware',
    catId: 'ransomware',
    type: 'medal',
    num: 4,
    chapterTag: 'CHAPTER 4 · RANSOMWARE RESPONSE',
    threatCategory: 'RANSOMWARE',
    title: 'Ransomware Vanguard Medal',
    objective: 'Awarded for containing crypto-locking attack vectors, refusing extortion, and restoring storage nodes from clean backups.',
    iconSymbol: '🔒',
    tiers: {
      gold: {
        label: 'Gold Medal',
        tag: '🥇 GOLD MEDAL',
        badgeTitle: 'Gold Ransomware Vanguard',
        detail: 'Rank S · 100% Data Recovery Without Ransom'
      },
      silver: {
        label: 'Silver Medal',
        tag: '🥈 SILVER MEDAL',
        badgeTitle: 'Silver Ransomware Vanguard',
        detail: 'Rank A/B · Storage Volumes Restored'
      },
      bronze: {
        label: 'Bronze Medal',
        tag: '🥉 BRONZE MEDAL',
        badgeTitle: 'Bronze Ransomware Vanguard',
        detail: 'Cleared · Critical Files Salvaged'
      }
    }
  },
  {
    id: 'ach_trophy_master',
    catId: null,
    type: 'trophy',
    num: 5,
    chapterTag: 'MASTER ACCOLADE · ALL CHAPTERS',
    threatCategory: 'ALL THREATS',
    title: 'Cyber Defense Master Trophy',
    objective: 'Awarded for mastering all four threat defense operations—Phishing, Malware, Safe Online, and Ransomware.',
    iconSymbol: '🏆',
    tiers: {
      gold: {
        label: 'Gold Grand Trophy',
        tag: '🏆🥇 GOLD GRAND TROPHY',
        badgeTitle: 'Apex Cyber Legend Trophy',
        detail: 'All Gold Medals Across All 4 Chapters'
      },
      silver: {
        label: 'Silver Grand Trophy',
        tag: '🏆🥈 SILVER GRAND TROPHY',
        badgeTitle: 'Senior Cyber Investigator Trophy',
        detail: 'Silver or Higher Medals in All Chapters'
      },
      bronze: {
        label: 'Bronze Grand Trophy',
        tag: '🏆🥉 BRONZE GRAND TROPHY',
        badgeTitle: 'Accredited Cyber Specialist Trophy',
        detail: 'All 4 Chapters Successfully Completed'
      }
    }
  }
];

/** Evaluate chapter medal tier (Bronze, Silver, Gold, or null if locked) */
function getChapterMedalTier(cat) {
  if (!cat || !cat.completed) return null;

  // Chapter 1 check for saved award tier in localStorage
  if (cat.id === 'phishing') {
    try {
      const phishSaved = localStorage.getItem('cyberzero_phishing_progress');
      if (phishSaved) {
        const pData = JSON.parse(phishSaved);
        const aw = pData.earnedAward || (pData.trophyUnlocked ? { tier: 'trophy' } : null);
        if (aw && aw.tier) {
          if (aw.tier === 'trophy') return 'gold';
          if (aw.tier === 'medal') return 'silver';
          return 'bronze';
        }
      }
    } catch(e) {}
  }

  const rank = (cat.rank || '').toUpperCase();
  if (rank === 'S') return 'gold';
  if (rank === 'A' || rank === 'B') return 'silver';
  return 'bronze';
}

/** Evaluate 3 kinds of Master Trophy based on medals earned across all 4 chapters */
function getMasterTrophyTier(allCategories) {
  if (!Array.isArray(allCategories) || allCategories.length < 4) return null;
  const allDone = allCategories.every(c => c && c.completed);
  if (!allDone) return null;

  const medalTiers = allCategories.map(c => getChapterMedalTier(c));
  if (medalTiers.some(t => !t)) return null;

  // 1. Gold Trophy: All 4 medals are Gold
  if (medalTiers.every(t => t === 'gold')) {
    return 'gold';
  }
  // 2. Silver Trophy: All 4 medals are at least Silver (Gold or Silver)
  if (medalTiers.every(t => t === 'gold' || t === 'silver')) {
    return 'silver';
  }
  // 3. Bronze Trophy: All 4 chapters completed (with at least Bronze medals)
  return 'bronze';
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
  return !!(map && map[achId]);
}

/**
 * Claim a completed achievement
 */
function claimAchievement(achId) {
  if (typeof AudioManager !== 'undefined') {
    try { AudioManager.playClick(); } catch (e) {}
  }

  const ach = MISSION_ACHIEVEMENTS.find(a => a.id === achId);
  if (!ach) return;

  if (typeof loadCategoriesProgress === 'function') loadCategoriesProgress();
  const cats = typeof CATEGORIES !== 'undefined' ? CATEGORIES : [];
  let currentTier = null;
  if (ach.catId) {
    const cat = cats.find(c => c.id === ach.catId);
    currentTier = getChapterMedalTier(cat);
  } else {
    currentTier = getMasterTrophyTier(cats);
  }

  if (!currentTier) {
    if (typeof showToast === 'function') {
      const msg = ach.catId
        ? `Complete Chapter ${ach.num} to claim this medal!`
        : 'Complete all 4 Chapters to claim the Master Trophy!';
      showToast(`🎯 ${msg}`, 'warning');
    }
    return;
  }

  const map = getClaimedAchievementsMap();
  map[achId] = {
    tier: currentTier,
    claimedAt: Date.now(),
    claimedDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  };
  saveClaimedAchievementsMap(map);

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

  // Particle burst animation on the card
  const cardEl = document.querySelector(`[data-ach-id="${achId}"]`);
  if (cardEl) {
    spawnAchParticles(cardEl, currentTier);
  }

  // Toast notification
  const tierData = ach.tiers[currentTier];
  const medalEmoji = currentTier === 'gold' ? '🥇' : currentTier === 'silver' ? '🥈' : '🥉';
  const awardType = ach.type === 'trophy' ? 'Trophy' : 'Medal';
  if (typeof showToast === 'function') {
    showToast(`🎉 Claimed ${medalEmoji} ${tierData.badgeTitle}! Reward secured!`, 'success');
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

  if (typeof loadCategoriesProgress === 'function') loadCategoriesProgress();
  const cats = typeof CATEGORIES !== 'undefined' ? CATEGORIES : [];
  const map = getClaimedAchievementsMap();
  let newlyClaimed = 0;

  MISSION_ACHIEVEMENTS.forEach(ach => {
    let tier = null;
    if (ach.catId) {
      const cat = cats.find(c => c.id === ach.catId);
      tier = getChapterMedalTier(cat);
    } else {
      tier = getMasterTrophyTier(cats);
    }
    if (tier && !map[ach.id]) {
      map[ach.id] = {
        tier: tier,
        claimedAt: Date.now(),
        claimedDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
      };
      newlyClaimed++;
    }
  });

  if (newlyClaimed === 0) return;

  saveClaimedAchievementsMap(map);

  if (typeof AudioManager !== 'undefined') {
    try {
      if (typeof AudioManager.playPerfectFanfare === 'function') {
        AudioManager.playPerfectFanfare();
      } else if (typeof AudioManager.playMissionComplete === 'function') {
        AudioManager.playMissionComplete();
      }
    } catch (e) {}
  }

  // Particle bursts across cards
  document.querySelectorAll('.mm-ach-item.ach-unclaimed').forEach(card => {
    spawnAchParticles(card, 'gold');
  });

  if (typeof showToast === 'function') {
    showToast(`🌟 Claimed all ${newlyClaimed} unlocked threat achievements! Outstanding detective work!`, 'success');
  }

  setTimeout(() => {
    renderMainMenuAchievements();
    updateAchievementNotificationBadge();
  }, 300);
}

/**
 * Update the notification badge on the Achievement button in Main Menu
 */
function updateAchievementNotificationBadge() {
  const badgeEl = document.getElementById('mm-ach-claim-badge');
  if (!badgeEl) return;

  if (typeof loadCategoriesProgress === 'function') loadCategoriesProgress();
  const cats = typeof CATEGORIES !== 'undefined' ? CATEGORIES : [];
  const map = getClaimedAchievementsMap();

  let unclaimedCount = 0;
  MISSION_ACHIEVEMENTS.forEach(ach => {
    let tier = null;
    if (ach.catId) {
      const cat = cats.find(c => c.id === ach.catId);
      tier = getChapterMedalTier(cat);
    } else {
      tier = getMasterTrophyTier(cats);
    }
    if (tier && !map[ach.id]) {
      unclaimedCount++;
    }
  });

  if (unclaimedCount > 0) {
    badgeEl.textContent = `${unclaimedCount} CLAIM`;
    badgeEl.classList.remove('hidden');
  } else {
    badgeEl.classList.add('hidden');
  }
}

/**
 * Particle burst celebration on achievement claim
 */
function spawnAchParticles(container, tier) {
  if (!container) return;
  const colors = tier === 'gold'
    ? ['#ffd700', '#fff3a8', '#ffb700', '#00f0ff', '#ffffff']
    : tier === 'silver'
    ? ['#ffffff', '#cbd5e1', '#94a3b8', '#00f0ff', '#e0f2fe']
    : ['#cd7f32', '#fbd38d', '#b87333', '#ffffff', '#ffedd5'];

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

/**
 * Generate vector SVG badge for Medals (Bronze, Silver, Gold, or Locked)
 */
function renderAchMedalSVG(tier, iconSymbol, achId) {
  if (!tier) {
    // Locked Medal
    return `
      <svg class="mm-ach-badge-svg" viewBox="0 0 76 92" width="62" height="74" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="lockL-${achId}" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#1e293b"/>
            <stop offset="100%" stop-color="#0f172a"/>
          </linearGradient>
        </defs>
        <path d="M26 4 L38 22 L22 22 Z" fill="#334155" opacity="0.6"/>
        <path d="M50 4 L38 22 L54 22 Z" fill="#334155" opacity="0.6"/>
        <circle cx="38" cy="52" r="30" fill="url(#lockL-${achId})" stroke="#475569" stroke-width="2" stroke-dasharray="4 3"/>
        <circle cx="38" cy="52" r="23" fill="#090d16" stroke="#334155" stroke-width="1.5"/>
        <path d="M32 49 V44 C32 40.7 34.7 38 38 38 C41.3 38 44 40.7 44 44 V49 M29 49 H47 V63 H29 Z" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="38" cy="55" r="1.8" fill="#64748b"/>
      </svg>
    `;
  }

  const isGold   = tier === 'gold';
  const isSilver = tier === 'silver';

  // Palette tokens
  const rimGradStart = isGold ? '#fff4a3' : isSilver ? '#ffffff' : '#fbd38d';
  const rimGradMid   = isGold ? '#ffd700' : isSilver ? '#cbd5e1' : '#cd7f32';
  const rimGradEnd   = isGold ? '#b37400' : isSilver ? '#64748b' : '#6d3007';

  const coreGradStart = isGold ? '#ffe066' : isSilver ? '#f1f5f9' : '#df9b58';
  const coreGradEnd   = isGold ? '#784400' : isSilver ? '#334155' : '#4a1e05';

  const strokeColor = isGold ? '#ffd700' : isSilver ? '#e2e8f0' : '#d97706';
  const ribbonL = isGold ? '#00b4f0' : isSilver ? '#38bdf8' : '#0284c7';
  const ribbonR = isGold ? '#ffd700' : isSilver ? '#94a3b8' : '#cd7f32';

  return `
    <svg class="mm-ach-badge-svg tier-${tier}" viewBox="0 0 76 92" width="62" height="74" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="medRim-${achId}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${rimGradStart}"/>
          <stop offset="50%" stop-color="${rimGradMid}"/>
          <stop offset="100%" stop-color="${rimGradEnd}"/>
        </linearGradient>
        <linearGradient id="medCore-${achId}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${coreGradStart}"/>
          <stop offset="100%" stop-color="${coreGradEnd}"/>
        </linearGradient>
      </defs>
      <!-- Top Chevron Ribbon -->
      <path d="M26 3 L38 23 L20 23 Z" fill="${ribbonL}"/>
      <path d="M50 3 L38 23 L56 23 Z" fill="${ribbonR}"/>
      <path d="M33 3 L38 18 L43 3 Z" fill="#ffffff" opacity="0.75"/>
      <!-- Outer Metal Rim -->
      <circle cx="38" cy="52" r="30" fill="url(#medRim-${achId})" stroke="${strokeColor}" stroke-width="2.5"/>
      <!-- Inner Sunken Core -->
      <circle cx="38" cy="52" r="23" fill="url(#medCore-${achId})" stroke="rgba(255,255,255,0.45)" stroke-width="1.2"/>
      <!-- Center Emblem Backdrop -->
      <circle cx="38" cy="52" r="17" fill="rgba(0, 15, 30, 0.45)"/>
      <!-- Central Threat Symbol -->
      <text x="38" y="58" text-anchor="middle" font-size="18">${iconSymbol}</text>
      <!-- Specular Arc Highlight -->
      <path d="M22 40 A 24 24 0 0 1 54 40" stroke="#ffffff" stroke-width="2" stroke-linecap="round" opacity="0.6"/>
    </svg>
  `;
}

/**
 * Generate vector SVG badge for Trophies (Bronze, Silver, Gold, or Locked)
 */
function renderAchTrophySVG(tier, achId) {
  if (!tier) {
    // Locked Trophy
    return `
      <svg class="mm-ach-badge-svg" viewBox="0 0 80 94" width="66" height="78" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="lockTr-${achId}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#1e293b"/>
            <stop offset="100%" stop-color="#0b1120"/>
          </linearGradient>
        </defs>
        <!-- Wireframe Cup -->
        <path d="M22 18 H58 V40 C58 50 49 58 40 58 C31 58 22 50 22 40 Z" fill="url(#lockTr-${achId})" stroke="#475569" stroke-width="2" stroke-dasharray="4 3"/>
        <!-- Handles -->
        <path d="M22 25 H14 C11 25 9 27 9 30 V34 C9 41 15 46 22 47" stroke="#475569" stroke-width="2" stroke-dasharray="3 3"/>
        <path d="M58 25 H66 C69 25 71 27 71 30 V34 C71 41 65 46 58 47" stroke="#475569" stroke-width="2" stroke-dasharray="3 3"/>
        <!-- Stem & Base -->
        <path d="M40 58 V70 M26 70 H54 V78 H26 Z" stroke="#475569" stroke-width="2"/>
        <!-- Padlock in Cup -->
        <path d="M35 34 V31 C35 28.5 37 26.5 40 26.5 C43 26.5 45 28.5 45 31 V34 M32 34 H48 V44 H32 Z" stroke="#64748b" stroke-width="1.8" stroke-linecap="round"/>
      </svg>
    `;
  }

  const isGold   = tier === 'gold';
  const isSilver = tier === 'silver';

  const goldStart = isGold ? '#fff4a3' : isSilver ? '#ffffff' : '#fbd38d';
  const goldMid   = isGold ? '#ffd700' : isSilver ? '#cbd5e1' : '#cd7f32';
  const goldEnd   = isGold ? '#996300' : isSilver ? '#475569' : '#5c2306';
  const strokeCol = isGold ? '#ffd700' : isSilver ? '#e2e8f0' : '#f59e0b';
  const starCol   = isGold ? '#fff59d' : isSilver ? '#f8fafc' : '#fed7aa';

  return `
    <svg class="mm-ach-badge-svg tier-${tier}" viewBox="0 0 80 94" width="66" height="78" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="trGrad-${achId}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${goldStart}"/>
          <stop offset="45%" stop-color="${goldMid}"/>
          <stop offset="100%" stop-color="${goldEnd}"/>
        </linearGradient>
      </defs>
      <!-- Trophy Cup Outer Shell -->
      <path d="M22 16 H58 V38 C58 49 49.5 57 40 57 C30.5 57 22 49 22 38 Z" fill="url(#trGrad-${achId})" stroke="${strokeCol}" stroke-width="2.2"/>
      <!-- Handles -->
      <path d="M22 22 H14 C11 22 9 24 9 27 V32 C9 39 15 44 22 45" stroke="url(#trGrad-${achId})" stroke-width="3" stroke-linecap="round"/>
      <path d="M58 22 H66 C69 22 71 24 71 27 V32 C71 39 65 44 58 45" stroke="url(#trGrad-${achId})" stroke-width="3" stroke-linecap="round"/>
      <!-- Stem & Plinth Base -->
      <path d="M37 57 H43 V70 H37 Z" fill="url(#trGrad-${achId})" stroke="${strokeCol}" stroke-width="1.5"/>
      <polygon points="24,70 56,70 60,82 20,82" fill="url(#trGrad-${achId})" stroke="${strokeCol}" stroke-width="1.8"/>
      <!-- Plaque Label -->
      <rect x="28" y="73" width="24" height="6" rx="2" fill="#0b1120" stroke="rgba(255,255,255,0.4)" stroke-width="1"/>
      <circle cx="40" cy="76" r="1.5" fill="${strokeCol}"/>
      <!-- Cup Laurels / Star -->
      <path d="M40 23 L42.5 28.5 L48 29.5 L44 33.5 L45 39 L40 36 L35 39 L36 33.5 L32 29.5 L37.5 28.5 Z" fill="${starCol}" stroke="rgba(0,0,0,0.3)" stroke-width="0.8"/>
      <!-- Top Specular Highlight -->
      <path d="M26 19 H54" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" opacity="0.75"/>
    </svg>
  `;
}

// Track currently selected achievement in showcase (defaults to 'ach_phishing')
let _selectedAchId = 'ach_phishing';

function selectAchCard(achId, event) {
  if (event && event.target && event.target.closest('.mm-ach-nav-claim-btn')) {
    return; // Don't interrupt direct claim action
  }
  if (typeof AudioManager !== 'undefined') {
    try { AudioManager.playClick(); } catch (e) {}
  }
  _selectedAchId = achId;
  renderMainMenuAchievements();
}
window.selectAchCard = selectAchCard;

/**
 * Render list of chapter and master achievements.
 * Professional Master-Detail Layout:
 * - Left: Sleek dossier navigation list (all 5 achievements with medals and tiers)
 * - Right: High-fidelity selected medal showcase with objective, criteria, and claim button
 */
function renderMainMenuAchievements() {
  const listEl = document.getElementById('mm-ach-list');
  if (!listEl) return;

  // Ensure latest chapter completion data is loaded
  if (typeof loadCategoriesProgress === 'function') loadCategoriesProgress();
  const cats = typeof CATEGORIES !== 'undefined' ? CATEGORIES : [];
  const claimedMap = getClaimedAchievementsMap();

  let completedCount = 0;
  let claimedCount = 0;
  let unclaimedCount = 0;

  // Process data for all 5 achievements
  const renderedItems = MISSION_ACHIEVEMENTS.map(ach => {
    let earnedTier = null;
    let score = 0;
    let rank = null;

    if (ach.catId) {
      const cat = cats.find(c => c.id === ach.catId);
      if (cat && cat.completed) {
        earnedTier = getChapterMedalTier(cat);
        score = cat.score || 0;
        rank = cat.rank || 'S';
      }
    } else {
      // Grand Master Trophy (All 4 Chapters)
      earnedTier = getMasterTrophyTier(cats);
      if (earnedTier) {
        score = cats.reduce((sum, c) => sum + (c.score || 0), 0);
        rank = 'S';
      }
    }

    const isCompleted = !!earnedTier;
    if (isCompleted) completedCount++;

    const isClaimed = isCompleted && !!claimedMap[ach.id];
    if (isClaimed) claimedCount++;
    if (isCompleted && !isClaimed) unclaimedCount++;

    return {
      ach,
      isCompleted,
      earnedTier,
      isClaimed,
      claimedData: claimedMap[ach.id] || null,
      score,
      rank
    };
  });

  // ── Render Stats Header Bar (No MISSION PTS, Clean Game Progress Bar) ──
  const statsEl = document.getElementById('mm-ach-stats');
  if (statsEl) {
    const pct = Math.round((completedCount / 5) * 100);
    const claimAllBtnHtml = unclaimedCount >= 1
      ? `<button type="button" class="mm-ach-claim-all-btn" onclick="claimAllAchievements()">✨ CLAIM ALL (${unclaimedCount})</button>`
      : '';

    statsEl.innerHTML = `
      <div class="mm-ach-stat-row">
        <div class="mm-ach-stat-pill">
          <span class="mm-ach-stat-label">COMPLETED</span>
          <span class="mm-ach-stat-val ${completedCount > 0 ? 'highlight-cyan' : ''}">${completedCount} / 5</span>
        </div>
        <div class="mm-ach-progress-wrap" title="${pct}% Completed">
          <div class="mm-ach-progress-track">
            <div class="mm-ach-progress-fill" style="width: ${pct}%;"></div>
          </div>
          <span class="mm-ach-progress-pct">${pct}%</span>
        </div>
        <div class="mm-ach-stat-pill">
          <span class="mm-ach-stat-label">CLAIMED</span>
          <span class="mm-ach-stat-val ${claimedCount > 0 ? 'highlight-gold' : ''}">${claimedCount} / 5</span>
        </div>
      </div>
      ${claimAllBtnHtml}
    `;
  }

  // Ensure valid selection for right-hand showcase
  let selectedItem = renderedItems.find(item => item.ach.id === _selectedAchId);
  if (!selectedItem) {
    selectedItem = renderedItems[0];
    _selectedAchId = selectedItem.ach.id;
  }

  // ── Render Left Navigation Column ──
  const navListHtml = renderedItems.map(item => {
    const ach = item.ach;
    const isCompleted = item.isCompleted;
    const tier = item.earnedTier;
    const isClaimed = item.isClaimed;
    const isTrophy = ach.type === 'trophy';
    const isSelected = ach.id === _selectedAchId;

    const tierData = tier ? ach.tiers[tier] : null;
    const tierTag = tier ? tierData.tag : 'LOCKED';
    const cardTitle = tier ? tierData.badgeTitle : ach.title;

    // Small SVG for nav item
    const miniSvg = isTrophy
      ? renderAchTrophySVG(tier, 'nav-' + ach.id)
      : renderAchMedalSVG(tier, ach.iconSymbol, 'nav-' + ach.id);

    // Status Badge in Nav item
    let statusBadge = '';
    if (!isCompleted) {
      statusBadge = `<span class="mm-ach-nav-pill is-locked" title="Mission Locked"></span>`;
    } else if (!isClaimed) {
      statusBadge = `
        <button type="button" class="mm-ach-nav-claim-btn" onclick="claimAchievement('${ach.id}')" title="Claim reward">
          CLAIM
        </button>
      `;
    } else {
      statusBadge = `<span class="mm-ach-nav-pill is-claimed" title="Reward Claimed">✓</span>`;
    }

    const itemClasses = [
      'mm-ach-nav-item',
      isTrophy ? 'is-trophy' : 'is-medal',
      isCompleted ? 'is-completed' : 'is-locked',
      tier ? `tier-${tier}` : 'tier-locked',
      isSelected ? 'is-selected' : ''
    ].filter(Boolean).join(' ');

    return `
      <div class="${itemClasses}" onclick="selectAchCard('${ach.id}', event)" role="button" tabindex="0">
        <div class="mm-ach-nav-visual">
          ${miniSvg}
        </div>
        <div class="mm-ach-nav-info">
          <div class="mm-ach-nav-title">${cardTitle}</div>
          <div class="mm-ach-nav-meta">
            <span class="mm-ach-nav-tier ${tier ? 'tag-' + tier : 'tag-locked'}">${tierTag}</span>
            <span class="mm-ach-nav-chap">${ach.threatCategory}</span>
          </div>
        </div>
        <div class="mm-ach-nav-right">
          ${statusBadge}
          <span class="mm-ach-nav-arrow ${isSelected ? 'active' : ''}">›</span>
        </div>
      </div>
    `;
  }).join('');

  // ── Render Right Showcase Column ──
  const selAch = selectedItem.ach;
  const selTier = selectedItem.earnedTier;
  const selTierData = selTier ? selAch.tiers[selTier] : null;
  const selIsCompleted = selectedItem.isCompleted;
  const selIsClaimed = selectedItem.isClaimed;
  const selIsTrophy = selAch.type === 'trophy';

  // Large SVG emblem for showcase
  const showcaseSvg = selIsTrophy
    ? renderAchTrophySVG(selTier, 'dossier-' + selAch.id)
    : renderAchMedalSVG(selTier, selAch.iconSymbol, 'dossier-' + selAch.id);

  // Performance Meta Line
  let performanceHtml = '';
  if (selIsCompleted) {
    const parts = [`<span class="mm-ach-dossier-pill tier-pill">🎯 ${selTierData.detail}</span>`];
    if (selectedItem.rank) parts.push(`<span class="mm-ach-dossier-pill rank-pill">Rank <strong>${selectedItem.rank}</strong></span>`);
    if (selectedItem.score) parts.push(`<span class="mm-ach-dossier-pill score-pill">Score <strong>${selectedItem.score.toLocaleString()} pts</strong></span>`);
    if (selectedItem.claimedData && selectedItem.claimedData.claimedDate) {
      parts.push(`<span class="mm-ach-dossier-pill date-pill">Claimed on ${selectedItem.claimedData.claimedDate}</span>`);
    }
    performanceHtml = parts.join('');
  } else {
    const unlockHint = selAch.catId
      ? `Complete Chapter ${selAch.num} with Rank C (Bronze), Rank A/B (Silver), or Rank S (Gold)`
      : `Complete all 4 Chapters with detective honors to unlock Trophy`;
    performanceHtml = `<span class="mm-ach-dossier-pill lock-pill">Requirement: ${unlockHint}</span>`;
  }

  // Showcase Action Button
  let showcaseActionHtml = '';
  if (!selIsCompleted) {
    showcaseActionHtml = `
      <button type="button" class="mm-ach-showcase-btn is-unready" onclick="claimAchievement('${selAch.id}')" title="Complete mission to claim">
        CLAIM REWARD
      </button>
    `;
  } else if (!selIsClaimed) {
    showcaseActionHtml = `
      <button type="button" class="mm-ach-showcase-btn is-ready" onclick="claimAchievement('${selAch.id}')" title="Claim your ${selTier.toUpperCase()} reward!">
        ✨ CLAIM ${selTier.toUpperCase()} REWARD
      </button>
    `;
  } else {
    showcaseActionHtml = `
      <div class="mm-ach-showcase-claimed">
        <span class="claimed-check">✓</span> REWARD SECURED & RECORDED ${selectedItem.claimedData && selectedItem.claimedData.claimedDate ? '· ' + selectedItem.claimedData.claimedDate : ''}
      </div>
    `;
  }

  // Inject Two-Panel Master-Detail Layout
  listEl.innerHTML = `
    <div class="mm-ach-master-detail-wrap">
      <!-- Left Column: Navigation Index -->
      <div class="mm-ach-nav-col">
        <div class="mm-ach-nav-col-header">
          <span>THREAT DOSSIER INDEX</span>
          <span class="mm-ach-nav-count">${completedCount} / 5</span>
        </div>
        <div class="mm-ach-nav-scroll">
          ${navListHtml}
        </div>
      </div>

      <!-- Right Column: Detailed Showcase -->
      <div class="mm-ach-showcase-col ${selTier ? 'tier-' + selTier : 'tier-locked'}">
        <!-- Showcase Header -->
        <div class="mm-ach-showcase-top">
          <div class="mm-ach-showcase-visual">
            ${showcaseSvg}
          </div>
          <div class="mm-ach-showcase-header-info">
            <div class="mm-ach-showcase-tags">
              <span class="mm-ach-chapter-tag">${selAch.chapterTag}</span>
              <span class="mm-ach-threat-pill">${selAch.threatCategory || (selIsTrophy ? 'ALL THREATS' : 'THREAT')}</span>
            </div>
            <h3 class="mm-ach-showcase-title">${selTier ? selTierData.badgeTitle : selAch.title}</h3>
            <div class="mm-ach-showcase-tier-row">
              <span class="mm-ach-tier-tag ${selTier ? 'tag-' + selTier : 'tag-locked'}">
                ${selTier ? selTierData.tag : 'CHAPTER UNLOCKED ON MISSION CLEAR'}
              </span>
            </div>
          </div>
        </div>

        <div class="mm-ach-showcase-divider"></div>

        <!-- Medal Purpose & Objective Box -->
        <div class="mm-ach-showcase-block">
          <div class="mm-ach-block-label">MEDAL PURPOSE & OBJECTIVE</div>
          <p class="mm-ach-showcase-objective">${selAch.objective}</p>
        </div>

        <!-- Detective Standing & Criteria -->
        <div class="mm-ach-showcase-block">
          <div class="mm-ach-block-label">STATUS & RECORD</div>
          <div class="mm-ach-performance-row">
            ${performanceHtml}
          </div>
        </div>

        <!-- 3-Tier Criteria Matrix -->
        <div class="mm-ach-showcase-block">
          <div class="mm-ach-block-label">TIER REQUIREMENTS & HONORS</div>
          <div class="mm-ach-tier-matrix-row">
            <div class="mm-ach-tier-card ${selTier === 'bronze' ? 'is-current-tier' : ''}">
              <div class="mm-ach-tier-card-head">
                <span class="matrix-tag tag-bronze">🥉 BRONZE</span>
                ${selTier === 'bronze' ? '<span class="matrix-current-badge">EARNED</span>' : ''}
              </div>
              <div class="mm-ach-tier-card-desc">${selAch.tiers.bronze.detail}</div>
            </div>

            <div class="mm-ach-tier-card ${selTier === 'silver' ? 'is-current-tier' : ''}">
              <div class="mm-ach-tier-card-head">
                <span class="matrix-tag tag-silver">🥈 SILVER</span>
                ${selTier === 'silver' ? '<span class="matrix-current-badge">EARNED</span>' : ''}
              </div>
              <div class="mm-ach-tier-card-desc">${selAch.tiers.silver.detail}</div>
            </div>

            <div class="mm-ach-tier-card ${selTier === 'gold' ? 'is-current-tier' : ''}">
              <div class="mm-ach-tier-card-head">
                <span class="matrix-tag tag-gold">🥇 GOLD</span>
                ${selTier === 'gold' ? '<span class="matrix-current-badge">EARNED</span>' : ''}
              </div>
              <div class="mm-ach-tier-card-desc">${selAch.tiers.gold.detail}</div>
            </div>
          </div>
        </div>

        <!-- Showcase Footer Action -->
        <div class="mm-ach-showcase-footer">
          ${showcaseActionHtml}
        </div>
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
}

/** Close Achievement modal */
function closeMainMenuAchievement() {
  if (typeof AudioManager !== 'undefined') {
    try { AudioManager.playClick(); } catch(e) {}
  }
  const modal = document.getElementById('mm-achievement-modal');
  if (modal) modal.classList.add('hidden');
  updateAchievementNotificationBadge();
}

/**
 * Dev utility functions to test achievement tiers and claims in console
 */
window.devUnlockAchievements = function(targetTier = 'gold') {
  if (typeof CATEGORIES === 'undefined') return;
  const rank = targetTier === 'gold' ? 'S' : targetTier === 'silver' ? 'A' : 'C';
  const score = targetTier === 'gold' ? 500 : targetTier === 'silver' ? 350 : 200;

  CATEGORIES.forEach(cat => {
    cat.completed = true;
    cat.unlocked = true;
    cat.rank = rank;
    cat.score = score;
  });
  if (typeof saveCategoriesProgress === 'function') saveCategoriesProgress();
  renderMainMenuAchievements();
  updateAchievementNotificationBadge();
  console.log(`%c[ACHIEVEMENT DEV] All chapters set to ${targetTier.toUpperCase()} (${rank} Rank, ${score} pts)`, 'color:#00f0ff; font-weight:bold;');
};

window.devResetAchievements = function() {
  localStorage.removeItem(ACH_CLAIMED_STORAGE_KEY);
  if (typeof CATEGORIES !== 'undefined') {
    CATEGORIES.forEach((c, idx) => {
      c.completed = false;
      c.unlocked = (idx === 0);
      c.rank = null;
      c.score = 0;
    });
    if (typeof saveCategoriesProgress === 'function') saveCategoriesProgress();
  }
  renderMainMenuAchievements();
  updateAchievementNotificationBadge();
  console.log('%c[ACHIEVEMENT DEV] All achievements & chapter progress reset.', 'color:#ffd700; font-weight:bold;');
};

window.toggleDevAchievements = function() {
  if (typeof CATEGORIES === 'undefined') return;
  const isAllGold = CATEGORIES.length > 0 && CATEGORIES.every(c => c.completed && c.rank === 'S');
  if (isAllGold) {
    window.devResetAchievements();
    if (typeof showToast === 'function') showToast('Achievements Reset to Locked State', 'info');
  } else {
    window.devUnlockAchievements('gold');
    if (typeof showToast === 'function') showToast('🏆 All Gold Accolades Unlocked!', 'success');
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






