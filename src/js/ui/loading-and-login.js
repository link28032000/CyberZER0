'use strict';

// ═══════════════════════════════════════════════════════════
// MAIN MENU / TITLE SCREEN CONTROLS
// ═══════════════════════════════════════════════════════════


// ── LOADING SCREEN KNOWLEDGE TIPS ──
const LOADING_TIPS = [
  {
    text: 'Phishing is a trick to steal your personal information, like passwords and bank details.'
  },
  {
    text: 'Check the sender\'s email address carefully. Attackers often use lookalike domains to fool you.'
  },
  {
    text: 'Urgency is a red flag. Scammers create panic to prevent you from thinking clearly.'
  },
  {
    text: 'Hover over links before clicking to verify where they actually lead.'
  },
  {
    text: 'Banks, e-wallets, and services will never ask for your passwords, OTPs, or MPINs.'
  },
  {
    text: 'Multi-factor authentication (MFA) adds an essential extra layer of defense to your accounts.'
  },
  {
    text: 'Files disguised as invoices or receipts (e.g. .pdf.exe) can secretly harbor malware.'
  },
  {
    text: 'Keep your operating system and security software up to date against emerging threats.'
  }
];

// Simple beep for loading screen — bypasses AudioManager (may not be unlocked yet)
function _playLoadingBeep(freq, gain, delay) {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ac = new AudioCtx();
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ac.currentTime + delay);
    g.gain.setValueAtTime(gain, ac.currentTime + delay);
    g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + delay + 0.18);
    osc.connect(g);
    g.connect(ac.destination);
    osc.start(ac.currentTime + delay);
    osc.stop(ac.currentTime + delay + 0.2);
    setTimeout(() => { try { ac.close(); } catch(e){} }, (delay + 0.3) * 1000);
  } catch(e) {}
}

// ═══════════════════════════════════════════════════════════
// LOCK SCREEN — Name Input & Sign-In
// ═══════════════════════════════════════════════════════════

function lsStartClock() {
  function updateLsClock() {
    const now = new Date();
    const timeEl = document.getElementById('ls-clock-display');
    const dateEl = document.getElementById('ls-date-display');
    if (timeEl) {
      const h = now.getHours();
      const m = String(now.getMinutes()).padStart(2, '0');
      const ampm = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 || 12;
      timeEl.textContent = `${h12}:${m}`;
    }
    if (dateEl) {
      const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
      const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
      dateEl.textContent = `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
    }
  }
  updateLsClock();
  setInterval(updateLsClock, 1000);
}

function lsHandleNameInput(val) {
  // No-op: username is fixed to Alex; input is now a password field
}

function applyPlayerName(name, charImg) {
  // Update Start Menu footer username
  const startUserName = document.getElementById('start-user-name');
  if (startUserName) startUserName.textContent = name;

  // Update Start Menu footer avatar
  const startAvatar = document.querySelector('.start-avatar-img');
  if (startAvatar) {
    if (charImg) {
      startAvatar.src = charImg;
      startAvatar.alt = name;
      startAvatar.dataset.fallbackStep = '0';
    } else {
      const foundCat = (typeof CATEGORIES !== 'undefined' && CATEGORIES.find(c => c.character && c.character.name === name));
      if (foundCat && foundCat.character) {
        startAvatar.src = foundCat.character.img;
        startAvatar.alt = foundCat.character.name;
        startAvatar.dataset.fallbackStep = '0';
      }
    }
  }

  // Update taskbar username pill
  const tbPill   = document.getElementById('taskbar-username-pill');
  const tbText   = document.getElementById('tb-username-text');
  const tbAvatar = document.getElementById('tb-user-avatar-mini');
  if (tbText)   tbText.textContent = name;
  if (tbAvatar) tbAvatar.textContent = name.charAt(0).toUpperCase();
  if (tbPill)   tbPill.classList.remove('hidden');

  // Persist to gameState
  if (typeof gameState !== 'undefined') {
    gameState.playerName = name;
  }
}

function lsShowError() {
  const inputWrap = document.getElementById('ls-name-input-wrap');
  const errorBox = document.getElementById('ls-win10-error-box');
  const hint = document.getElementById('ls-signin-hint');
  const errorBtn = document.getElementById('ls-win10-error-btn');



  if (inputWrap) inputWrap.style.display = 'none';
  if (hint) hint.style.display = 'none';
  if (errorBox) {
    errorBox.classList.remove('hidden');
    errorBox.style.display = 'flex';
  }
  if (errorBtn) {
    setTimeout(() => errorBtn.focus(), 60);
  }

  const handleErrKey = (e) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
      e.preventDefault();
      window.removeEventListener('keydown', handleErrKey);
      lsDismissError();
    }
  };
  window.addEventListener('keydown', handleErrKey, { once: true });
}

function lsDismissError() {
  const inputWrap = document.getElementById('ls-name-input-wrap');
  const errorBox = document.getElementById('ls-win10-error-box');
  const hint = document.getElementById('ls-signin-hint');
  const pwdInput = document.getElementById('ls-name-input');

  if (errorBox) {
    errorBox.classList.add('hidden');
    errorBox.style.display = 'none';
  }
  if (inputWrap) inputWrap.style.display = '';
  if (hint) hint.style.display = '';

  if (pwdInput) {
    pwdInput.value = '';
    pwdInput.focus();
  }
}

function lsSignIn() {
  const pwdInput = document.getElementById('ls-name-input');
  const password = pwdInput ? pwdInput.value : '';

  // User must enter any password — if empty, show Windows 10 error
  if (!password || password.trim().length === 0) {
    lsShowError();
    return;
  }

  const currentCatId = window._pendingStoryChapter || window._currentChapterCategory || activeCategoryStory || 'phishing';
  const cat = (typeof CATEGORIES !== 'undefined' && CATEGORIES.find(c => c.id === currentCatId));
  const char = (cat && cat.character) ? cat.character : { name: 'Alex', img: 'assets/Character/Alex.png' };
  const name = char.name;

  applyPlayerName(name, char.img);

  // If the player came here via Story Selection → Chapter card, show loading then go to chapter (no narrator)
  if (window._pendingStoryChapter) {
    const catId = window._pendingStoryChapter;
    window._pendingStoryChapter = null;

    // Close title menu / login overlay
    const tm = document.getElementById('overlay-title-menu');
    if (tm) tm.classList.remove('active');

    // Show "Just a moment..." loading screen, then launch chapter directly
    const ls = document.getElementById('overlay-loading-screen');
    if (ls) {
      const titleEl = document.getElementById('win-loading-title');
      if (titleEl) titleEl.textContent = 'Just a moment...';
      ls.classList.remove('ls-leaving');
      ls.classList.add('ls-active');
      // (login beep removed)

      const DURATION = 10000;
      const noteEl = document.getElementById('win-loading-note-text');
      let tipIdx = Math.floor(Math.random() * LOADING_TIPS.length);
      if (noteEl) noteEl.textContent = LOADING_TIPS[tipIdx].text;

      const midTimer = setTimeout(() => {
        const noteWrap = document.getElementById('win-loading-note-wrap');
        if (noteWrap && noteEl) {
          noteWrap.classList.add('transitioning');
          setTimeout(() => {
            let nextIdx = (tipIdx + 1 + Math.floor(Math.random() * (LOADING_TIPS.length - 1))) % LOADING_TIPS.length;
            if (noteEl) noteEl.textContent = LOADING_TIPS[nextIdx].text;
            noteWrap.classList.remove('transitioning');
          }, 350);
        }
      }, 5000);

      setTimeout(() => {
        clearTimeout(midTimer);
        // (login complete beeps removed)

        // Reveal desktop then dismiss loading
        const desktop = document.getElementById('desktop');
        updateDesktopBackgroundForPhase(catId);
        if (desktop) {
          desktop.style.opacity = '0';
          desktop.style.transition = 'opacity 0.6s ease';
          desktop.style.visibility = 'visible';
          requestAnimationFrame(() => {
            requestAnimationFrame(() => { desktop.style.opacity = '1'; });
          });
        }
        document.querySelectorAll('.overlay').forEach(o => o.classList.remove('active'));
        const bd = document.getElementById('overlay-backdrop');
        if (bd) bd.classList.remove('active');

        // Start Chapter 1 mission, Chapter 2 mentor intro & desktop, or open desktop for Chapters 3, 4
        closeCategoryHub();
        if (catId === 'phishing') {
          startMission(false);
        } else if (catId === 'malware') {
          if (typeof startMalwareChapter === 'function') {
            startMalwareChapter();
          } else {
            openChapterDesktopDirect('malware');
          }
        } else if (catId === 'social_engineering' || catId === 'ransomware') {
          if (typeof window.clearWorkstationLogoffGuide === 'function') {
            window.clearWorkstationLogoffGuide();
          }
          openChapterDesktopDirect(catId);
        } else {
          openCategoryHub();
        }

        setTimeout(() => {
          ls.classList.add('ls-leaving');
          setTimeout(() => ls.classList.remove('ls-active', 'ls-leaving'), 800);
        }, 300);
      }, DURATION);
    } else {
      // No loading screen — just go directly
      closeCategoryHub();
      if (catId === 'phishing') {
        startMission(false);
      } else if (catId === 'malware') {
        if (typeof startMalwareChapter === 'function') {
          startMalwareChapter();
        } else {
          openChapterDesktopDirect('malware');
        }
      } else if (catId === 'social_engineering' || catId === 'ransomware') {
        openChapterDesktopDirect(catId);
      } else {
        openCategoryHub();
      }
    }
    return;
  }

  startFromTitleMenu();
}

function startFromTitleMenu() {

  // Hide desktop immediately — prevents any flash of desktop behind overlays
  const desktop = document.getElementById('desktop');
  if (desktop) desktop.style.visibility = 'hidden';

  // Show the loading screen immediately
  const ls = document.getElementById('overlay-loading-screen');
  if (!ls) {
    _doStartFromTitleMenu();
    return;
  }

  // Ensure title is 'Just a moment...' for sign-in
  const titleEl = document.getElementById('win-loading-title');
  if (titleEl) titleEl.textContent = 'Just a moment...';

  // Activate loading overlay smoothly FIRST, then close title menu
  ls.classList.remove('ls-leaving');
  ls.classList.add('ls-active');

  // Play start-of-loading beep
  _playLoadingBeep(320, 0.12, 0);

  // Now safely close title menu — loading screen is already covering everything
  closeOverlay('overlay-title-menu');

  // ── Select initial cyber note for loading screen ──
  const noteEl = document.getElementById('win-loading-note-text');
  const noteWrap = document.getElementById('win-loading-note-wrap');
  let tipIdx = Math.floor(Math.random() * LOADING_TIPS.length);
  if (typeof window._lastLoadingTipIdx === 'number' && LOADING_TIPS.length > 1) {
    while (tipIdx === window._lastLoadingTipIdx) {
      tipIdx = Math.floor(Math.random() * LOADING_TIPS.length);
    }
  }
  window._lastLoadingTipIdx = tipIdx;
  if (noteEl) {
    noteEl.textContent = LOADING_TIPS[tipIdx].text;
  }

  // Midway note rotation at 5 seconds with a smooth fade
  const DURATION = 10000; // 10 seconds
  const midTimer = setTimeout(() => {
    if (noteWrap && noteEl) {
      noteWrap.classList.add('transitioning');
      setTimeout(() => {
        let nextIdx = (tipIdx + 1 + Math.floor(Math.random() * (LOADING_TIPS.length - 1))) % LOADING_TIPS.length;
        noteEl.textContent = LOADING_TIPS[nextIdx].text;
        noteWrap.classList.remove('transitioning');
      }, 350);
    }
  }, 5000);

  // ── After 10 seconds: complete & smooth fade transition into game ──
  setTimeout(() => {
    clearTimeout(midTimer);

    // Play subtle success chime: three ascending beeps
    _playLoadingBeep(440, 0.12, 0);
    _playLoadingBeep(660, 0.12, 0.12);
    _playLoadingBeep(880, 0.18, 0.24);

    // Launch game prologue
    _doStartFromTitleMenu();

    // Smoothly dissolve loading screen over 800ms
    setTimeout(() => {
      ls.classList.add('ls-leaving');
      setTimeout(() => {
        ls.classList.remove('ls-active', 'ls-leaving');
      }, 800);
    }, 300);

  }, DURATION);
}

function _doStartFromTitleMenu() {
  // Skip narrator — go straight to desktop after loading
  const titleMenu = document.getElementById('overlay-title-menu');
  if (titleMenu) titleMenu.classList.remove('active');
  updateDesktopBackgroundForPhase('prologue');

  // Initialize mission environment with all apps closed
  startMission(false);

  // Reveal desktop directly — no narrator / VN overlay
  const desktop = document.getElementById('desktop');
  if (desktop) {
    desktop.style.opacity = '0';
    desktop.style.transition = 'opacity 0.6s ease';
    desktop.style.visibility = 'visible';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => { desktop.style.opacity = '1'; });
    });
  }

  // Remove all overlays cleanly
  document.querySelectorAll('.overlay').forEach(o => o.classList.remove('active'));
  document.getElementById('overlay-backdrop') && document.getElementById('overlay-backdrop').classList.remove('active');

}


function replayPrologueVN() {
  closeOverlay('overlay-category-select');
  playCategoryStory('prologue');
  showToast('🎬 Replaying CyberZerØ Visual Novel Orientation.', 'info');
}

function proceedFromIntroToExam() {
  closeOverlay('overlay-game-intro');
  closeOverlay('overlay-welcome');
  showOverlay('overlay-pre-assessment');

  const shell = document.getElementById('exam-paper-shell');
  if (shell) shell.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Dynamically set today's date on the paper
  const dateEl = document.getElementById('exam-paper-date');
  if (dateEl) {
    const now = new Date();
    dateEl.textContent = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }

  // Focus the name input on the exam paper
  setTimeout(() => {
    const nameInput = document.getElementById('exam-input-name');
    if (nameInput) {
      nameInput.focus();
    }
  }, 200);

  showToast('📝 Step 1: Write your name and complete the Pre-Assessment Exam.', 'info');
}

function openExitModal() {
  const modal = document.getElementById('title-exit-modal');
  if (modal) modal.classList.remove('hidden');
}

function closeExitModal() {
  const modal = document.getElementById('title-exit-modal');
  if (modal) modal.classList.add('hidden');
}

function confirmExitGame() {
  closeExitModal();
  closeMainMenuExit();

  // Attempt to close tab via standard and window-replacement methods
  try { window.close(); } catch (e) {}
  try { window.open('', '_self', ''); window.close(); } catch (e) {}
  try { self.close(); } catch (e) {}
  try { if (window.top) window.top.close(); } catch (e) {}

  // If browser blocks closing user-opened tabs, navigate to about:blank to totally exit
  setTimeout(() => {
    try {
      window.location.replace('about:blank');
    } catch (e) {
      window.location.href = 'about:blank';
    }
  }, 100);
}

function reconnectTerminal() {
  const discScreen = document.getElementById('title-disconnected-screen');
  if (discScreen) discScreen.classList.add('hidden');
  closeExitModal();
  const desktop = document.getElementById('desktop');
  if (desktop) desktop.style.visibility = 'visible';
  showOverlay('overlay-title-menu');
  showToast('⚡ Terminal reconnected. Welcome back, Student.', 'success');
}

function initTitleParticles() {
  // Try new lock screen container first, fall back to old title-particles
  const container = document.getElementById('ls-bg-particles') || document.getElementById('title-particles');
  if (!container) return;
  container.innerHTML = '';
  const count = 28;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'vn-particle';
    p.style.left = Math.random() * 100 + '%';
    p.style.bottom = Math.random() * 100 + '%';
    p.style.animationDelay = (Math.random() * 8) + 's';
    p.style.animationDuration = (5 + Math.random() * 8) + 's';
    p.style.opacity = (0.1 + Math.random() * 0.35).toString();
    container.appendChild(p);
  }
}
