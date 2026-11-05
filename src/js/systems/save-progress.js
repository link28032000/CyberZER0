'use strict';
/* ═══════════════════════════════════════════════════════════════════════════
   CyberZerØ — Firestore & LocalStorage Master Save / Resume Engine (v4)
   ─────────────────────────────────────────────────────────────────────────
   Features:
     • Full game state & session persistence across page refresh & re-login.
     • Lossless mission progress restoration: emails, verdicts, dynamic inbox,
       evidence panel, checklist goals, post-award tasks, and trophies.
     • Chapter 2 (Malware) mission, tasks, and system state restoration.
     • Desktop window state restoration: open apps, minimization, focus, notes.
     • Dialogue state restoration for Ryan IT mentor guidance.
     • Safe Shutdown (Save) flow without premature chapter completion.
     • Seamless page refresh returning directly to active desktop/screen.
     • Firestore cloud synchronization + atomic local caching.
═══════════════════════════════════════════════════════════════════════════ */

(function () {

  /* ── Firestore + Auth helpers ─────────────────────────────────────────── */
  function _db() {
    if (typeof firebase === 'undefined' || !firebase.apps || !firebase.apps.length) return null;
    try { return firebase.firestore(); } catch (e) { return null; }
  }
  function _user() {
    try { return firebase.auth && firebase.auth().currentUser; } catch (e) { return null; }
  }

  /* ── All localStorage keys that form the save payload ──────────────────── */
  const LS_KEYS = [
    'cyberzero_categories',
    'cyberzero_phishing_progress',
    'cyberzero_claimed_achievements',
    'cyberzero_newbie_gc_state',
    'cyberzero_ch2_pretest',
    'cyberzero_ch2_mission',
    'cyberzero_session_state'
  ];

  /* ── Detect currently active screen / view ────────────────────────────── */
  function _detectCurrentScreen() {
    const sd = document.getElementById('overlay-shutdown-screen');
    if (sd && (sd.classList.contains('sd-active') || sd.style.display === 'flex')) {
      return 'shutdown';
    }
    const ss = document.getElementById('overlay-story-select');
    if (ss && ss.classList.contains('active') && ss.style.display !== 'none') {
      return 'story-select';
    }
    const mm = document.getElementById('overlay-main-menu');
    if (mm && mm.classList.contains('active') && mm.style.display !== 'none') {
      return 'main-menu';
    }
    const tm = document.getElementById('overlay-title-menu');
    if (tm && tm.classList.contains('active') && tm.style.display !== 'none') {
      return 'title-menu';
    }
    const desktop = document.getElementById('desktop');
    if (desktop && (desktop.style.visibility === 'visible' || desktop.style.opacity === '1')) {
      return 'desktop';
    }
    return 'main-menu';
  }

  /* ── Get focused app window name ──────────────────────────────────────── */
  function _getFocusedApp() {
    const focusedWin = document.querySelector('.app-window.focused');
    if (!focusedWin || !focusedWin.id) return null;
    return focusedWin.id.replace('win-', '');
  }

  /* ── Master Game Session Snapshot ─────────────────────────────────────── */
  function _getSessionState() {
    const curScreen = window._currentActiveScreen || _detectCurrentScreen();
    const activeCat = window._currentChapterCategory ||
                      (typeof activeCategoryStory !== 'undefined' ? activeCategoryStory : null) ||
                      (typeof gameState !== 'undefined' ? gameState.phase : null) ||
                      'phishing';

    // Chapter 1 Phishing state
    const ch1Data = {
      currentEmail: (typeof gameState !== 'undefined' && typeof gameState.currentEmail === 'number') ? gameState.currentEmail : 0,
      emailResults: (typeof gameState !== 'undefined' && Array.isArray(gameState.emailResults)) ? [...gameState.emailResults] : [],
      inboxEmailIds: (typeof ch1InboxEmails !== 'undefined' && Array.isArray(ch1InboxEmails)) ? ch1InboxEmails.map(e => e.id) : [],
      resolvedEmailIds: (typeof ch1ResolvedEmailIds !== 'undefined' && ch1ResolvedEmailIds && ch1ResolvedEmailIds.size) ? Array.from(ch1ResolvedEmailIds) : [],
      stage: (typeof ch1Stage !== 'undefined') ? ch1Stage : 0,
      currentRound: (typeof ch1CurrentRound !== 'undefined') ? ch1CurrentRound : 1,
      mistakeCount: (typeof ch1MistakeCount !== 'undefined') ? ch1MistakeCount : 0,
      investigationTutorialDone: !!window.ch1InvestigationTutorialDone,
      secondEmailNotesHintDone: !!window.ch1SecondEmailNotesHintDone,
      score: (typeof gameState !== 'undefined') ? gameState.score : 0,
      correctDecisions: (typeof gameState !== 'undefined') ? gameState.correctDecisions : 0,
      phishingDetected: (typeof gameState !== 'undefined') ? gameState.phishingDetected : 0,
      legitimateDetected: (typeof gameState !== 'undefined') ? gameState.legitimateDetected : 0,
      evidenceFoundTotal: (typeof gameState !== 'undefined') ? gameState.evidenceFoundTotal : 0,
      currentFolder: (typeof gameState !== 'undefined') ? (gameState.currentFolder || 'inbox') : 'inbox',
      trashedSentIds: (typeof gameState !== 'undefined' && Array.isArray(gameState.trashedSentIds)) ? [...gameState.trashedSentIds] : [],
      readSentIds: (typeof gameState !== 'undefined' && Array.isArray(gameState.readSentIds)) ? [...gameState.readSentIds] : [],
      awardClaimed: !!window._awardClaimed,
      postAwardTasks: window._postAwardTasks ? Object.assign({}, window._postAwardTasks) : {},
      ch1VideoTracker: window._ch1VideoTracker ? Object.assign({}, window._ch1VideoTracker) : {},
      unlockedAchievements: (typeof _achievementUnlocked !== 'undefined' && _achievementUnlocked && _achievementUnlocked.size) ? Array.from(_achievementUnlocked) : [],
      earnedAward: (typeof _phishingEarnedAward !== 'undefined') ? _phishingEarnedAward : null,
      trophyUnlockedDate: (typeof _trophyUnlockedDate !== 'undefined') ? _trophyUnlockedDate : null,
      postAwardPostTestDialogueFired: !!window._postAwardPostTestDialogueFired,
      awaitingShutdownForChapter2: !!window._awaitingShutdownForChapter2,
      ch1CompletedSandbox: !!window._ch1CompletedSandbox
    };

    // Chapter 2 Malware state
    const ch2Data = {
      mission: window._ch2Mission ? JSON.parse(JSON.stringify(window._ch2Mission)) : null,
      missionStarted: !!window._ch2MissionStarted,
      checklistUnlocked: !!window._ch2ChecklistUnlocked,
      introActive: !!window._ch2IntroActive,
      malwareQuarantined: (typeof gameState !== 'undefined') ? (gameState.malwareQuarantined || 0) : 0
    };

    // Desktop window state
    const snEl = document.getElementById('sticky-note');
    const desktopData = {
      appState: (typeof appState !== 'undefined') ? JSON.parse(JSON.stringify(appState)) : {},
      focusedApp: _getFocusedApp(),
      stickyNote: {
        open: !!(snEl && !snEl.classList.contains('hidden')),
        collapsed: !!(snEl && snEl.classList.contains('collapsed'))
      }
    };

    // Mentor dialogue state
    let dialogueData = null;
    if (typeof RyanGuide !== 'undefined' && RyanGuide.getState) {
      dialogueData = RyanGuide.getState();
    }

    return {
      screen: curScreen,
      activeChapter: activeCat,
      isShutdown: !!window._isShutdownState,
      savedAt: new Date().toISOString(),
      ch1: ch1Data,
      ch2: ch2Data,
      desktop: desktopData,
      dialogue: dialogueData
    };
  }

  /* ── Read cached session state ────────────────────────────────────────── */
  function _getSavedSessionState() {
    try {
      const raw = localStorage.getItem('cyberzero_session_state');
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return null;
  }

  /* ── Step 1: flush live state → localStorage, then read blobs ──────────── */
  function _flushToLocalStorage() {
    // Flush phishing progress (sticky-note.js)
    try {
      if (typeof savePhishingProgress === 'function') {
        savePhishingProgress();
      }
    } catch (e) {}

    // Flush category progress (category-hub.js)
    try {
      if (typeof saveCategoriesProgress === 'function') {
        saveCategoriesProgress();
      }
    } catch (e) {}

    // Flush chapter 2 malware mission
    try {
      if (window._ch2Mission) {
        localStorage.setItem('cyberzero_ch2_mission', JSON.stringify(window._ch2Mission));
      }
    } catch (e) {}

    // Flush master session state
    try {
      const snapshot = _getSessionState();
      localStorage.setItem('cyberzero_session_state', JSON.stringify(snapshot));
    } catch (e) {}
  }

  function _buildPayload() {
    // Always flush live state first so localStorage is current
    _flushToLocalStorage();

    const snapshot = _getSessionState();
    const payload = {
      savedAt:       new Date().toISOString(),
      schemaVersion: 4,
      activeChapter: snapshot.activeChapter || window._currentChapterCategory || 'phishing',
      sessionState:  snapshot,
      gameState:     null,
      ls:            {}
    };

    // Basic gameState snapshot
    try {
      if (typeof gameState !== 'undefined') {
        payload.gameState = {
          phase:               gameState.phase              || null,
          currentChapter:      gameState.currentChapter     || null,
          completedChapters:   Array.isArray(gameState.completedChapters) ? gameState.completedChapters : [],
          correctDecisions:    gameState.correctDecisions   || 0,
          phishingDetected:    gameState.phishingDetected   || 0,
          legitimateDetected:  gameState.legitimateDetected || 0,
          evidenceFoundTotal:  gameState.evidenceFoundTotal || 0,
          preTestResult:       gameState.preTestResult      || null,
          postTestResult:      gameState.postTestResult     || null,
          postTestCompleted:   !!gameState.postTestCompleted,
          postTestScore:       gameState.postTestScore      || 0,
          malwareQuarantined:  gameState.malwareQuarantined || 0,
          score:               gameState.score              || 0,
          awardClaimed:        !!window._awardClaimed,
        };
      }
    } catch (e) {
      console.warn('[saveProgress] gameState snapshot failed:', e);
    }

    // Read localStorage blobs
    LS_KEYS.forEach(key => {
      try {
        const val = localStorage.getItem(key);
        if (val !== null) payload.ls[key] = val;
      } catch (e) {}
    });

    return payload;
  }

  /* ── Restore localStorage + schedule live-state restore ──────────────── */
  function _applyPayload(data) {
    if (!data) return;

    // 1. Write localStorage blobs immediately
    if (data.ls && typeof data.ls === 'object') {
      LS_KEYS.forEach(key => {
        if (data.ls[key] !== undefined && data.ls[key] !== null) {
          try { localStorage.setItem(key, data.ls[key]); } catch (e) {}
        }
      });
    }

    // Write sessionState directly if present in payload root
    if (data.sessionState && typeof data.sessionState === 'object') {
      try {
        localStorage.setItem('cyberzero_session_state', JSON.stringify(data.sessionState));
      } catch (e) {}
    }

    // 2. Restore active chapter pointer
    const activeCat = data.activeChapter || (data.sessionState && data.sessionState.activeChapter);
    if (activeCat) {
      window._currentChapterCategory = activeCat;
      try {
        if (typeof activeCategoryStory !== 'undefined') activeCategoryStory = activeCat;
      } catch (e) {}
    }

    // 3. Restore gameState fields
    try {
      if (data.gameState && typeof gameState !== 'undefined') {
        const gs = data.gameState;
        if (gs.phase)              gameState.phase              = gs.phase;
        if (gs.currentChapter)     gameState.currentChapter     = gs.currentChapter;
        if (gs.completedChapters)  gameState.completedChapters  = gs.completedChapters;
        if (gs.correctDecisions)   gameState.correctDecisions   = gs.correctDecisions;
        if (gs.phishingDetected)   gameState.phishingDetected   = gs.phishingDetected;
        if (gs.legitimateDetected) gameState.legitimateDetected = gs.legitimateDetected;
        if (gs.evidenceFoundTotal) gameState.evidenceFoundTotal = gs.evidenceFoundTotal;
        if (gs.preTestResult)      gameState.preTestResult      = gs.preTestResult;
        if (gs.postTestResult)     gameState.postTestResult     = gs.postTestResult;
        gameState.postTestCompleted = !!gs.postTestCompleted;
        if (gs.postTestScore)      gameState.postTestScore      = gs.postTestScore;
        if (gs.malwareQuarantined) gameState.malwareQuarantined = gs.malwareQuarantined;
        if (gs.score)              gameState.score              = gs.score;
        if (gs.awardClaimed)       window._awardClaimed         = true;
      }
    } catch (e) {
      console.warn('[loadAndApplyProgress] gameState restore failed:', e);
    }

    // 4. Defer live-state hydration with setTimeout(0)
    setTimeout(() => {
      // Restore phishing live state
      try {
        if (typeof loadPhishingProgress === 'function') loadPhishingProgress();
      } catch (e) {}

      // Restore CATEGORIES live state
      try {
        if (typeof loadCategoriesProgress === 'function') loadCategoriesProgress();
      } catch (e) {}

      // Restore Chapter 2 Malware live state
      try {
        const rawCh2 = localStorage.getItem('cyberzero_ch2_mission');
        if (rawCh2 && window._ch2Mission) {
          window._ch2Mission = Object.assign(window._ch2Mission, JSON.parse(rawCh2));
        }
      } catch (e) {}

      // Refresh achievement badge
      try {
        if (typeof updateAchievementNotificationBadge === 'function') {
          updateAchievementNotificationBadge();
        }
      } catch (e) {}

      // Refresh Start/Continue button
      try {
        if (typeof updateStartButton === 'function') updateStartButton();
        else if (typeof window.updateStartButton === 'function') window.updateStartButton();
      } catch (e) {}

      console.log('[loadAndApplyProgress] Live state restored from cloud save ✓');
    }, 0);

    console.log('[loadAndApplyProgress] localStorage restored from Firestore ✓', data.savedAt);
  }

  /* ══════════════════════════════════════════════════════════════════════
     RESUME ENGINE — Restores Game Directly to Saved Screen & State
  ══════════════════════════════════════════════════════════════════════ */

  /**
   * Resumes the player into the exact chapter, mission, open apps,
   * checklist tasks, and dialogue state.
   */
  function resumeSavedGameSession(catId, optionalSession) {
    const session = optionalSession || _getSavedSessionState() || {};
    const targetCat = catId || session.activeChapter || window._continueChapterId || 'phishing';

    console.log('[resumeSavedGameSession] Resuming chapter:', targetCat);

    // Dismiss overlays cleanly
    if (typeof hideAllOverlays === 'function') {
      hideAllOverlays(false);
    }
    document.querySelectorAll('.overlay').forEach(o => {
      o.classList.remove('active');
      o.style.display = 'none';
    });

    if (typeof stopMMBgMusic === 'function') stopMMBgMusic();
    if (typeof AudioManager !== 'undefined') {
      try { AudioManager.unlock(); } catch (e) {}
    }

    // Reveal desktop
    const desktop = document.getElementById('desktop');
    if (desktop) {
      desktop.style.visibility = 'visible';
      desktop.style.opacity = '1';
    }

    window._currentActiveScreen = 'desktop';
    window._currentChapterCategory = targetCat;
    if (typeof activeCategoryStory !== 'undefined') activeCategoryStory = targetCat;

    if (typeof updateLoginScreenForChapter === 'function') {
      updateLoginScreenForChapter(targetCat);
    }
    if (typeof updateDesktopBackgroundForPhase === 'function') {
      updateDesktopBackgroundForPhase(targetCat);
    }

    // ── CHAPTER RESUME LOGIC ──
    const isCompleted = (typeof _isCategoryCompleted === 'function' && _isCategoryCompleted(targetCat));

    if (targetCat === 'phishing') {
      if (isCompleted) {
        // Completed sandbox mode
        window._awardClaimed = true;
        window._ryanGuideDismissed = true;
        window._phishAutoModalShown = true;
        window._ch1CompletedSandbox = true;
        window._awaitingShutdownForChapter2 = false;

        if (typeof updateDesktopTrophyDisplay === 'function') updateDesktopTrophyDisplay();

        if (typeof renderEmptyStickyNote === 'function') {
          renderEmptyStickyNote();
        }
        if (typeof closeStickyNote === 'function') {
          closeStickyNote();
        }

        // Dismiss dialogue & tutorial highlights
        if (typeof RyanGuide !== 'undefined' && RyanGuide.dismiss) RyanGuide.dismiss(true);
        if (typeof _stripCh1TutorialHighlights === 'function') _stripCh1TutorialHighlights();
      } else {
        // In-progress Chapter 1 mission
        if (typeof resumeChapter1Mission === 'function') {
          resumeChapter1Mission(session.ch1 || null);
        } else if (typeof startMission === 'function') {
          startMission(false);
        }
      }
    } else if (targetCat === 'malware') {
      if (typeof resumeChapter2Mission === 'function') {
        resumeChapter2Mission(session.ch2 || null);
      } else if (typeof startMalwareMission === 'function') {
        startMalwareMission();
      }
    }

    // ── DESKTOP WINDOW RESTORATION ──
    if (session.desktop && session.desktop.appState && typeof appState !== 'undefined') {
      const savedApps = session.desktop.appState;
      Object.keys(savedApps).forEach(appName => {
        const info = savedApps[appName];
        if (info && info.open) {
          if (typeof openApp === 'function') openApp(appName);
          if (info.minimized && typeof minimizeApp === 'function') minimizeApp(appName);
          if (info.maximized && typeof maximizeApp === 'function') maximizeApp(appName);
        }
      });
      if (session.desktop.focusedApp && typeof focusWindow === 'function') {
        focusWindow(session.desktop.focusedApp);
      }
    } else {
      // Default: ensure relevant primary app is open
      if (targetCat === 'phishing' && !isCompleted && typeof openApp === 'function') {
        openApp('gmail');
      }
    }

    // ── STICKY NOTE RESTORATION ──
    const sNote = document.getElementById('sticky-note');
    if (sNote) {
      if (session.desktop && session.desktop.stickyNote && !session.desktop.stickyNote.open) {
        sNote.classList.add('hidden');
      } else if (!isCompleted) {
        sNote.classList.remove('hidden');
      }
    }

    // ── DIALOGUE RESTORATION ──
    if (session.dialogue && session.dialogue.active && typeof RyanGuide !== 'undefined' && RyanGuide.restoreState) {
      RyanGuide.restoreState(session.dialogue);
    } else if (typeof RyanGuide !== 'undefined' && RyanGuide.dismiss) {
      RyanGuide.dismiss(true);
    }

    if (typeof updateTaskbar === 'function') updateTaskbar();
    window._isShutdownState = false; // Reset shutdown flag after resume
  }
  window.resumeSavedGameSession = resumeSavedGameSession;

  /* ── Restore Refreshed Session Screen ─────────────────────────────────── */
  function _restoreRefreshedSession(session) {
    if (!session) return;
    const screen = session.screen || 'desktop';

    console.log('[_restoreRefreshedSession] Direct restoration to screen:', screen);

    if (screen === 'desktop') {
      const cat = session.activeChapter || 'phishing';
      resumeSavedGameSession(cat, session);
      return;
    }

    if (screen === 'story-select') {
      if (typeof showStorySelectionScreen === 'function') {
        showStorySelectionScreen(session.activeChapter || 'malware');
      }
      return;
    }

    if (screen === 'main-menu') {
      if (typeof showMainMenu === 'function') {
        showMainMenu();
      }
      return;
    }

    // Fallback
    if (typeof showMainMenu === 'function') {
      showMainMenu();
    }
  }

  /* ── Helper: Does chapter have saved progress? ────────────────────────── */
  window.hasChapterProgress = function(catId) {
    try {
      const session = _getSavedSessionState();
      if (session) {
        if (catId === 'phishing' && session.ch1) {
          if (session.ch1.emailResults && session.ch1.emailResults.length > 0) return true;
          if (session.ch1.awardClaimed || session.ch1.unlockedAchievements.length > 0) return true;
        }
        if (catId === 'malware' && session.ch2) {
          if (session.ch2.missionStarted || (session.ch2.malwareQuarantined && session.ch2.malwareQuarantined > 0)) return true;
          if (session.ch2.mission && session.ch2.mission.stage > 1) return true;
        }
      }
    } catch (e) {}

    try {
      const rawCat = localStorage.getItem('cyberzero_categories');
      if (rawCat) {
        const cats = JSON.parse(rawCat);
        if (Array.isArray(cats)) {
          const c = cats.find(entry => entry.id === catId);
          if (c && (c.completed || (c.score && c.score > 0))) return true;
        }
      }
    } catch (e) {}

    return false;
  };

  /* ══════════════════════════════════════════════════════════════════════
     PUBLIC API
  ══════════════════════════════════════════════════════════════════════ */

  /**
   * saveProgress()
   * Flushes master snapshot to localStorage and Firestore.
   */
  window.saveProgress = async function () {
    const db   = _db();
    const user = _user();

    // Flush locally first regardless of network
    _flushToLocalStorage();

    if (!db || !user) {
      console.warn('[saveProgress] Not signed in or Firestore unavailable. Progress cached locally.');
      if (typeof showToast === 'function' && !window._suppressSaveToast) {
        showToast('💾 Progress saved locally.', 'info');
      }
      return false;
    }

    const payload = _buildPayload();
    console.log('[saveProgress] Uploading payload…', {
      uid: user.uid,
      savedAt: payload.savedAt,
      activeChapter: payload.activeChapter,
      screen: payload.sessionState ? payload.sessionState.screen : null
    });

    try {
      await db.collection('saves').doc(user.uid).set(payload);
      console.log('[saveProgress] ✅ Progress saved to Firestore for uid:', user.uid);
      if (!window._suppressSaveToast && typeof showToast === 'function') {
        showToast('💾 Progress saved to your account!', 'success');
      }
      window._suppressSaveToast = false;
      try {
        if (typeof updateStartButton === 'function') updateStartButton();
        else if (typeof window.updateStartButton === 'function') window.updateStartButton();
      } catch (_) {}
      return true;
    } catch (e) {
      console.error('[saveProgress] ❌ Save failed. Code:', e.code, 'Message:', e.message);
      if (e.code === 'permission-denied') {
        if (typeof showToast === 'function' && !window._suppressSaveToast) {
          showToast('❌ Save blocked: Check Firestore Security Rules in Firebase Console.', 'error');
        }
      } else {
        if (typeof showToast === 'function' && !window._suppressSaveToast) {
          showToast('⚠️ Could not sync save to cloud. Cached locally.', 'warning');
        }
      }
      return false;
    }
  };

  /**
   * loadAndApplyProgress()
   * Fetches the user's Firestore save doc and restores all state.
   */
  window.loadAndApplyProgress = async function () {
    const db   = _db();
    const user = _user();

    if (!db || !user) {
      console.warn('[loadAndApplyProgress] Not signed in or Firestore unavailable.');
      return false;
    }

    console.log('[loadAndApplyProgress] Fetching save for uid:', user.uid);

    try {
      const doc = await db.collection('saves').doc(user.uid).get();
      if (!doc.exists) {
        console.log('[loadAndApplyProgress] No cloud save found — fresh start for', user.uid);
        return false;
      }
      const data = doc.data();
      console.log('[loadAndApplyProgress] Save doc found (savedAt:', data.savedAt, ')');
      _applyPayload(data);
      return true;
    } catch (e) {
      console.error('[loadAndApplyProgress] ❌ Load failed. Code:', e.code, 'Message:', e.message);
      return false;
    }
  };

  /**
   * hasSavedProgress()
   */
  window.hasSavedProgress = async function () {
    const db   = _db();
    const user = _user();
    if (!db || !user) return false;
    try {
      const doc = await db.collection('saves').doc(user.uid).get();
      return doc.exists;
    } catch (e) {
      console.warn('[hasSavedProgress] Check failed:', e.message);
      return false;
    }
  };

  /**
   * deleteProgress()
   * Deletes Firestore save doc + clears all related localStorage.
   */
  window.deleteProgress = async function () {
    const db   = _db();
    const user = _user();

    LS_KEYS.forEach(key => {
      try { localStorage.removeItem(key); } catch (e) {}
    });
    console.log('[deleteProgress] localStorage cleared.');

    if (!db || !user) return;

    try {
      await db.collection('saves').doc(user.uid).delete();
      console.log('[deleteProgress] ✅ Cloud save deleted for uid:', user.uid);
    } catch (e) {
      console.error('[deleteProgress] ❌ Delete failed:', e.message);
    }
  };

  /**
   * window._czLoadProgressAndShowMenu()
   * Master auth transition handler.
   */
  window._czLoadProgressAndShowMenu = async function () {
    try {
      await window.loadAndApplyProgress();
      try {
        if (typeof updateStartButton === 'function') updateStartButton();
        else if (typeof window.updateStartButton === 'function') window.updateStartButton();
      } catch (_) {}
    } catch (e) {
      console.warn('[_czLoadProgressAndShowMenu] Load failed:', e);
    }

    const session = _getSavedSessionState();

    // Check for page refresh restoration (user was actively playing without shutting down)
    if (session && session.screen && !session.isShutdown) {
      console.log('[save-progress] Active session detected! Restoring screen:', session.screen);
      _restoreRefreshedSession(session);
    } else {
      // Normal Main Menu flow
      if (typeof showMainMenu === 'function') {
        showMainMenu();
      } else {
        const mm = document.getElementById('overlay-main-menu');
        if (mm) mm.classList.add('active');
      }
    }
  };

  // Fast local storage session flusher for instant persistence on user actions
  window.saveSessionLocally = function () {
    try {
      _flushToLocalStorage();
    } catch (e) {}
  };

  // Legacy alias
  window.loadProgress = window.loadAndApplyProgress;

  /* ── Lossless Auto-Flush on Page Refresh or Tab Close ─────────────────── */
  if (typeof window.addEventListener === 'function') {
    window.addEventListener('beforeunload', function () {
      try {
        _flushToLocalStorage();
      } catch (e) {}
    });

    window.addEventListener('pagehide', function () {
      try {
        _flushToLocalStorage();
      } catch (e) {}
    });
  }

  console.log('[save-progress] ✅ Master Save & Resume Engine ready (v4)');

})();
