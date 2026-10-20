'use strict';

// ═══════════════════════════════════════════════════════════
// THREAT CATEGORIES & PROGRESSION SYSTEM
// ═══════════════════════════════════════════════════════════

const CATEGORIES = [
  {
    id: 'phishing',
    num: 1,
    chapterRange: '1-3',
    chapterTag: 'CHAPTER 1-3',
    title: 'THE FIRST DAY',
    subtitle: 'Chapters 1-3',
    accent: '#00e5ff',
    desc: 'A student clicked a suspicious scholarship email. Investigate the phishing trap, remove malware from the attachment, and recover the compromised account.',
    specs: {
      threatType: 'Email Phishing & Credential Theft',
      app: '📧 Email & 🌐 Browser',
      objective: '3 Incidents Resolved'
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
    chapterRange: '4-6',
    chapterTag: 'CHAPTER 4-6',
    title: 'THE DIGITAL TRAP',
    subtitle: 'Chapters 4-6',
    accent: '#00e676',
    desc: 'More incidents arrive. Investigate a fake delivery SMS, expose a fraudulent online store, and recover a hijacked school account.',
    specs: {
      threatType: 'SMS Scam & Account Hijacking',
      app: '📱 Messages & 🌐 Browser',
      objective: '3 Threats Neutralized'
    },
    character: { name: 'Ethan', img: 'assets/Character/Ethan.png' },
    unlocked: true,
    completed: false,
    score: 0,
    rank: null
  },
  {
    id: 'social_engineering',
    num: 3,
    chapterRange: '7-9',
    chapterTag: 'CHAPTER 7-9',
    title: 'THE SYSTEM COLLAPSE',
    subtitle: 'Chapters 7-9',
    accent: '#ea80fc',
    desc: 'A local business reports ransomware. Investigate locked files, uncover spyware, and respond to suspicious network activity targeting the school.',
    specs: {
      threatType: 'Ransomware & Network Intrusion',
      app: '📂 Files & 🛡️ Anti-Virus',
      objective: '3 Systems Secured'
    },
    character: { name: 'Pia', img: 'assets/Character/Pia.png' },
    unlocked: true,
    completed: false,
    score: 0,
    rank: null
  },
  {
    id: 'ransomware',
    num: 4,
    chapterRange: '10-12',
    chapterTag: 'CHAPTER 10-12',
    title: 'THE LAST LOGIN',
    subtitle: 'Chapters 10-12',
    accent: '#ff5252',
    desc: 'The final investigation. Trace the leaked data, secure compromised accounts, and submit the complete incident report to close the case.',
    specs: {
      threatType: 'Data Breach & Incident Response',
      app: '🔒 Security Console',
      objective: 'Final Report Submitted'
    },
    character: { name: 'Ryan', img: 'assets/Character/Ryan.png' },
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

function openCategoryHub() {
  _goToStorySelect(false);
}

function openCategoryHubFromDesktop() {
  _goToStorySelect(true);
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
