'use strict';

// ═══════════════════════════════════════════════════════════
// THREAT CATEGORIES & PROGRESSION SYSTEM
// ═══════════════════════════════════════════════════════════

const CATEGORIES = [
  {
    id: 'phishing',
    num: 1,
    chapterRange: '1',
    chapterTag: 'CHAPTER 1',
    title: 'THE DECEPTIVE CLICK',
    subtitle: 'Chapter 1',
    accent: '#00e5ff',
    desc: 'A student clicked a suspicious scholarship email. Investigate the phishing trap, analyze email evidence, and secure the compromised account.',
    specs: {
      threatType: 'Email Phishing & Credential Theft',
      app: '📧 Email & 🌐 Browser',
      objective: 'Phishing Defense & Evidence Analysis'
    },
    character: { name: 'Alex', img: 'assets/Character/Alex.png' },
    unlocked: true,
    completed: false,
    score: 0,
    rank: null
  },
  {
    id: 'malware',
    num: 2,
    chapterRange: '2',
    chapterTag: 'CHAPTER 2',
    title: 'THE HIDDEN THREAT',
    subtitle: 'Chapter 2',
    accent: '#00e676',
    desc: 'Investigate suspicious downloads and unverified games. Safely configure ShieldAV Defender, inspect malware behaviors, and quarantine all malicious threats.',
    specs: {
      threatType: 'Trojan & Malware Investigation',
      app: '📁 Files & 🛡️ ShieldAV',
      objective: '4 Malware Threats Quarantined'
    },
    character: { name: 'Ethan', img: 'assets/Character/Ethan.png' },
    unlocked: true,
    completed: false,
    score: 0,
    rank: null
  }
];

/**
 * Update the login/password screen avatar and username,
 * the Windows 11 Start Menu profile, and taskbar,
 * to match the character for the selected chapter.
 */
function updateLoginScreenForChapter(categoryId) {
  const cat = (typeof CATEGORIES !== 'undefined' && CATEGORIES.find(c => c.id === categoryId));
  const char = (cat && cat.character) ? cat.character : { name: 'Alex', img: 'assets/Character/Alex.png' };

  window._currentChapterCategory = categoryId || 'phishing';
  window._currentChapterCharacter = char;
  activeCategoryStory = categoryId || 'phishing';

  // Blinking start menu notice is strictly for Chapter 1
  if (categoryId && categoryId !== 'phishing') {
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
  }

  // Windows 10 Login Screen (Overlay Title Menu) avatar & username
  const avatarImg = document.querySelector('#ls-user-avatar .ls-user-avatar-img');
  if (avatarImg) {
    avatarImg.src = char.img;
    avatarImg.alt = char.name;
    avatarImg.dataset.fallbackStep = '0';
  }

  const usernameEl = document.getElementById('ls-win10-username-display');
  if (usernameEl) usernameEl.textContent = char.name;

  // Windows 11 Start Menu profile avatar & username
  const startAvatar = document.querySelector('.start-avatar-img');
  if (startAvatar) {
    startAvatar.src = char.img;
    startAvatar.alt = char.name;
    startAvatar.dataset.fallbackStep = '0';
  }

  const startUserName = document.getElementById('start-user-name');
  if (startUserName) startUserName.textContent = char.name;

  // Windows Taskbar username & avatar
  const tbText = document.getElementById('tb-username-text');
  const tbAvatar = document.getElementById('tb-user-avatar-mini');
  if (tbText) tbText.textContent = char.name;
  if (tbAvatar) tbAvatar.textContent = char.name.charAt(0).toUpperCase();

  // Keep gameState playerName in sync
  if (typeof gameState !== 'undefined') {
    gameState.playerName = char.name;
  }
  if (typeof initChapterMissionNotifications === 'function') {
    initChapterMissionNotifications(categoryId, false);
  }

  // Synchronize player corporate email address across views
  const emailVal = getCurrentPlayerEmail();
  const gTo1 = document.getElementById('gdemo-to-user');
  const gTo2 = document.getElementById('gdemo-to-user-legit');
  if (gTo1) gTo1.textContent = emailVal;
  if (gTo2) gTo2.textContent = emailVal;

  // Keep Settings About device name in sync with character profile (e.g. Alex PC, Ethan PC)
  if (typeof updateSettingsAboutDeviceName === 'function') {
    updateSettingsAboutDeviceName();
  }
}

/**
 * Get the real corporate email address for the active chapter's character
 * E.g., Alex <alex@techsolutions.com>, Ethan <ethan@techsolutions.com>, etc.
 */
function getCurrentPlayerEmail() {
  const curCatId = window._currentChapterCategory || activeCategoryStory || 'phishing';
  const foundCat = (typeof CATEGORIES !== 'undefined' && CATEGORIES.find(c => c.id === curCatId));
  const charObj = (foundCat && foundCat.character) ? foundCat.character : (window._currentChapterCharacter || { name: 'Alex' });
  const name = charObj.name || (typeof gameState !== 'undefined' && gameState.playerName) || 'Alex';
  const handle = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  return `${name} <${handle}@techsolutions.com>`;
}

let activeCategoryStory = 'phishing';

function updateDesktopBackgroundForPhase(phase) {
  const desktop = document.getElementById('desktop');
  if (!desktop) return;
  // Always keep normal desktop background (CSS gradient), same as Chapter 1
  desktop.style.backgroundImage = "";
  desktop.style.backgroundSize = "";
  desktop.style.backgroundPosition = "";
}

function openCategoryHub(targetChapter) {
  if (typeof showStorySelectionScreen === 'function') {
    showStorySelectionScreen(targetChapter || 'malware');
  } else if (typeof _goToStorySelect === 'function') {
    _goToStorySelect(false);
  }
}

function openCategoryHubFromDesktop(targetChapter) {
  if (typeof showStorySelectionScreen === 'function') {
    showStorySelectionScreen(targetChapter || 'malware');
  } else if (typeof _goToStorySelect === 'function') {
    _goToStorySelect(true);
  }
}

function _openCategoryHubInternal(fromDesktop) {
  _goToStorySelect(fromDesktop);
}

function closeCategoryHubBack() {
  storySelectBack();
}

function closeCategoryHub() {
  const ss = document.getElementById('overlay-story-select');
  if (ss) {
    ss.classList.remove('active');
    ss.style.display = 'none';
  }
}

// renderCategoryHub / selectCategoryCard removed — Story Selection screen
// (overlay-story-select) is used exclusively via openCategoryHub() → _goToStorySelect()

function startCategoryChapter(categoryId) {
  closeCategoryHub();
  playCategoryStory(categoryId);
}

function proceedToNextCategory(nextCatId) {
  closeOverlay('overlay-results');
  closeOverlay('overlay-malware-results');
  closeOverlay('overlay-social-results');
  closeOverlay('overlay-ransomware-results');

  const cat = CATEGORIES.find(c => c.id === nextCatId);
  if (cat && cat.unlocked) {
    playCategoryStory(nextCatId);
  } else {
    openCategoryHub();
  }
}

function returnToTitleFromCategories() {
  closeCategoryHub();
  showOverlay('overlay-title-menu');
}

function retakeExamFromCategories() {
  closeCategoryHub();
  openPreAssessment();
}

function completeCategory(catId, score, rank) {
  const idx = CATEGORIES.findIndex(c => c.id === catId);
  if (idx !== -1) {
    CATEGORIES[idx].completed = true;
    CATEGORIES[idx].score = Math.max(CATEGORIES[idx].score || 0, score || 0);
    CATEGORIES[idx].rank = rank || 'S';

    // Unlock next category in sequence
    if (idx + 1 < CATEGORIES.length) {
      CATEGORIES[idx + 1].unlocked = true;
      showToast(`🎉 Unlocked Chapter ${CATEGORIES[idx + 1].chapterRange}: ${CATEGORIES[idx + 1].title}!`, 'success');
    }
  }
  saveCategoriesProgress();
  updateAppLockStates();
  refreshStorySelectLocks(); // keep Story Selection screen in sync
  if (typeof updateAchievementNotificationBadge === 'function') {
    updateAchievementNotificationBadge();
  }

  // Save completion & unlocked chapters to Firestore immediately
  if (typeof window.saveProgress === 'function') {
    window.saveProgress().catch(() => {});
  }
  if (typeof updateStartButton === 'function') {
    updateStartButton();
  } else if (typeof window.updateStartButton === 'function') {
    window.updateStartButton();
  }
}

/** Save CATEGORIES completion state to localStorage */
function saveCategoriesProgress() {
  try {
    const data = CATEGORIES.map(c => ({
      id: c.id,
      completed: c.completed,
      unlocked: c.unlocked,
      score: c.score,
      rank: c.rank
    }));
    localStorage.setItem('cyberzero_categories', JSON.stringify(data));
  } catch(e) { /* ignore */ }
}

/** Load CATEGORIES completion state from localStorage */
function loadCategoriesProgress() {
  try {
    const saved = localStorage.getItem('cyberzero_categories');
    if (!saved) return;
    const data = JSON.parse(saved);
    if (!Array.isArray(data)) return;
    data.forEach(saved => {
      const cat = CATEGORIES.find(c => c.id === saved.id);
      if (cat) {
        if (saved.completed) cat.completed = true;
        if (saved.unlocked) cat.unlocked = true;
        if (saved.score) cat.score = Math.max(cat.score || 0, saved.score || 0);
        if (saved.rank) cat.rank = saved.rank;
      }
    });
  } catch(e) { /* ignore */ }
}


/**
 * Opens a specific chapter directly onto the Windows desktop,
 * setting the active chapter, character profile, wallpaper, and desktop icons,
 * while ensuring all app windows and overlays remain closed.
 */
function openChapterDesktopDirect(categoryId) {
  const catId = categoryId || 'phishing';
  window._currentChapterCategory = catId;
  activeCategoryStory = catId;

  if (typeof updateLoginScreenForChapter === 'function') {
    updateLoginScreenForChapter(catId);
  }
  if (typeof updateDesktopBackgroundForPhase === 'function') {
    updateDesktopBackgroundForPhase(catId);
  }

  // Dismiss overlays
  if (typeof hideAllOverlays === 'function') {
    hideAllOverlays(false);
  }
  document.querySelectorAll('.overlay').forEach(o => {
    o.classList.remove('active');
    o.style.display = 'none';
  });

  // Ensure desktop element is visible
  const desktop = document.getElementById('desktop');
  if (desktop) {
    desktop.style.visibility = 'visible';
    desktop.style.opacity = '1';
  }

  // Close all open app windows cleanly
  ['gmail', 'browser', 'folder', 'antivirus', 'comms', 'ransomware', 'wifi-settings', 'security-settings', 'docviewer', 'imageviewer', 'videoplayer', 'taskmanager', 'scanner', 'control-panel', 'steam'].forEach(a => {
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
    }
  });
  if (typeof updateTaskbar === 'function') updateTaskbar();

  if (catId === 'phishing') {
    if (typeof startMission === 'function') startMission(false);
  } else if (catId === 'malware') {
    if (typeof startMalwareChapter === 'function') {
      startMalwareChapter();
    } else if (typeof startMalwareMission === 'function') {
      startMalwareMission();
    }
  } else if (catId === 'social_engineering' || catId === 'social' || catId === 'ch3') {
    if (typeof startGroup4Mission === 'function') {
      startGroup4Mission(false);
    }
  } else if (catId === 'ransomware' || catId === 'ch4') {
    if (typeof startRansomwareMission === 'function') {
      startRansomwareMission(false);
    }
  }
}
window.openChapterDesktopDirect = openChapterDesktopDirect;

window.openCategoryHub = openCategoryHub;
window.openCategoryHubFromDesktop = openCategoryHubFromDesktop;
