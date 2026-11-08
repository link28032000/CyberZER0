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
    try {
      if (typeof window !== 'undefined' && window.czIsGuest && window.czIsGuest()) return null;
      return firebase.auth && firebase.auth().currentUser;
    } catch (e) { return null; }
  }

  /* ── All localStorage keys that form the save payload ──────────────────── */
  const LS_KEYS = [
    'cyberzero_categories',
    'cyberzero_phishing_progress',
    'cyberzero_claimed_achievements',
    'cyberzero_newbie_gc_state',
    'cyberzero_ch2_pretest',
    'cyberzero_ch2_mission',
    'cyberzero_session_state',
    'cyberzero_pretest_wip',
    'cyberzero_posttest_wip',
    'cyberzero_pretest_result_file',
    'cyberzero_posttest_result_file',
    'cyberzero_ch2_pretest_result_file'
  ];

  /* ── Detect currently active screen / view ────────────────────────────── */
  function _detectCurrentScreen() {
    const sd = document.getElementById('overlay-shutdown-screen');
    if (sd && (sd.classList.contains('sd-active') || sd.style.display === 'flex')) {
      return 'shutdown';
    }
    // ── Detect active pre/post test overlays ──
    const rptBd = document.getElementById('ryan-pretest-backdrop');
    if (rptBd && rptBd.classList.contains('rpt-active') && rptBd.style.display !== 'none') {
      return 'pretest';
    }
    const ch2pt = document.getElementById('overlay-ch2-pretest');
    if (ch2pt && (ch2pt.classList.contains('ch2pt-active') || (ch2pt.style.display && ch2pt.style.display !== 'none'))) {
      return 'pretest';
    }
    const rpostBd = document.getElementById('ryan-posttest-backdrop');
    if (rpostBd && rpostBd.classList.contains('rpost-active') && rpostBd.style.display !== 'none') {
      return 'posttest';
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

    const prevSession = _getSavedSessionState() || {};

    // Live Chapter 1 Phishing state
    const liveCh1Data = {
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
      ch1CompletedSandbox: !!window._ch1CompletedSandbox,
      preTestCompleted: !!((typeof RyanPretest !== 'undefined' && RyanPretest.getResult && RyanPretest.getResult()) || localStorage.getItem('cyberzero_pretest_result_file'))
    };

    // Live Chapter 2 Malware state
    const liveCh2Data = {
      mission: window._ch2Mission ? JSON.parse(JSON.stringify(window._ch2Mission)) : null,
      missionStarted: !!window._ch2MissionStarted,
      checklistUnlocked: !!window._ch2ChecklistUnlocked,
      introActive: !!window._ch2IntroActive,
      malwareQuarantined: (typeof gameState !== 'undefined') ? (gameState.malwareQuarantined || 0) : 0
    };

    // Desktop window state
    const snEl = document.getElementById('sticky-note');
    const liveDesktopData = {
      appState: (typeof appState !== 'undefined') ? JSON.parse(JSON.stringify(appState)) : {},
      focusedApp: _getFocusedApp(),
      stickyNote: {
        open: !!(snEl && !snEl.classList.contains('hidden')),
        collapsed: !!(snEl && snEl.classList.contains('collapsed'))
      }
    };

    // Mentor dialogue state
    let liveDialogueData = null;
    if (typeof RyanGuide !== 'undefined' && RyanGuide.getState) {
      liveDialogueData = RyanGuide.getState();
    }

    // Keep Ch1 and Ch2 completely separate to prevent cross-chapter progress loss
    let ch1Data = null;
    let ch2Data = null;
    let desktop_ch1 = prevSession.desktop_ch1 || null;
    let desktop_ch2 = prevSession.desktop_ch2 || null;
    let dialogue_ch1 = prevSession.dialogue_ch1 || null;
    let dialogue_ch2 = prevSession.dialogue_ch2 || null;

    if (activeCat === 'phishing') {
      ch1Data = liveCh1Data;
      desktop_ch1 = (!window._isShuttingDown || !desktop_ch1) ? liveDesktopData : desktop_ch1;
      dialogue_ch1 = (!window._isShuttingDown || !dialogue_ch1) ? liveDialogueData : dialogue_ch1;

      // Preserve Ch2 state from prevSession or localStorage
      if (prevSession.ch2 && (prevSession.ch2.mission || prevSession.ch2.missionStarted)) {
        ch2Data = JSON.parse(JSON.stringify(prevSession.ch2));
      } else {
        try {
          const rawCh2 = localStorage.getItem('cyberzero_ch2_mission');
          if (rawCh2) {
            ch2Data = { mission: JSON.parse(rawCh2), missionStarted: true, checklistUnlocked: true, introActive: false, malwareQuarantined: 0 };
          }
        } catch (e) {}
      }
      if (!ch2Data) ch2Data = prevSession.ch2 || null;

    } else if (activeCat === 'malware') {
      ch2Data = liveCh2Data;
      desktop_ch2 = (!window._isShuttingDown || !desktop_ch2) ? liveDesktopData : desktop_ch2;
      dialogue_ch2 = (!window._isShuttingDown || !dialogue_ch2) ? liveDialogueData : dialogue_ch2;

      // Preserve Ch1 state from prevSession or localStorage
      if (prevSession.ch1 && (prevSession.ch1.emailResults || prevSession.ch1.inboxEmailIds || prevSession.ch1.awardClaimed)) {
        ch1Data = JSON.parse(JSON.stringify(prevSession.ch1));
      } else {
        try {
          const rawPh = localStorage.getItem('cyberzero_phishing_progress');
          if (rawPh) {
            const ph = JSON.parse(rawPh);
            ch1Data = {
              currentEmail: ph.currentEmail || 0,
              emailResults: ph.emailResults || [],
              inboxEmailIds: ph.inboxEmailIds || [],
              resolvedEmailIds: ph.resolvedEmailIds || [],
              stage: ph.stage || 0,
              currentRound: ph.currentRound || 1,
              mistakeCount: ph.mistakeCount || 0,
              score: ph.score || 0,
              correctDecisions: ph.correctDecisions || 0,
              phishingDetected: ph.phishingDetected || 0,
              legitimateDetected: ph.legitimateDetected || 0,
              evidenceFoundTotal: ph.evidenceFoundTotal || 0,
              awardClaimed: !!ph.awardClaimed,
              postAwardTasks: ph.postAwardTasks || {},
              unlockedAchievements: ph.unlockedAchievements || [],
              trophyUnlockedDate: ph.trophyUnlockedDate || null,
              preTestCompleted: !!localStorage.getItem('cyberzero_pretest_result_file')
            };
          }
        } catch (e) {}
      }
      if (!ch1Data) ch1Data = prevSession.ch1 || null;

    } else {
      // Menu / Story Selection / Shutdown state: preserve both chapters
      ch1Data = prevSession.ch1 || liveCh1Data;
      ch2Data = prevSession.ch2 || liveCh2Data;
    }

    const currentDesktop = (activeCat === 'malware') ? (desktop_ch2 || liveDesktopData) : (desktop_ch1 || liveDesktopData);
    const currentDialogue = (activeCat === 'malware') ? (dialogue_ch2 || liveDialogueData) : (dialogue_ch1 || liveDialogueData);

    return {
      screen: curScreen,
      activeChapter: activeCat,
      isShutdown: !!window._isShutdownState,
      savedAt: new Date().toISOString(),
      ch1: ch1Data,
      ch2: ch2Data,
      desktop: currentDesktop,
      dialogue: currentDialogue,
      desktop_ch1: desktop_ch1,
      desktop_ch2: desktop_ch2,
      dialogue_ch1: dialogue_ch1,
      dialogue_ch2: dialogue_ch2
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
  let _isFlushing = false;
  function _flushToLocalStorage() {
    if (_isFlushing) return;
    _isFlushing = true;
    try {
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
    } finally {
      _isFlushing = false;
    }
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
      try {
        if (typeof initPretestResultDocument === 'function') initPretestResultDocument();
      } catch (e) {}
      try {
        if (typeof initPosttestResultDocument === 'function') initPosttestResultDocument();
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
   * Sets up desktop visual environment, icons, character profile, and app visibility
   * to strictly match the requested chapter (Chapter 1 = Alex, Chapter 2 = Ethan).
   */
  function setupChapterDesktop(targetCat) {
    const isCh1 = (targetCat === 'phishing');
    const isCh2 = (targetCat === 'malware');

    window._currentActiveScreen = 'desktop';
    window._currentChapterCategory = targetCat;
    if (typeof activeCategoryStory !== 'undefined') activeCategoryStory = targetCat;

    // 1. Sync Character Profile (Alex vs Ethan)
    if (typeof updateLoginScreenForChapter === 'function') {
      updateLoginScreenForChapter(targetCat);
    }
    // 2. Sync Desktop Wallpaper
    if (typeof updateDesktopBackgroundForPhase === 'function') {
      updateDesktopBackgroundForPhase(targetCat);
    }
    // 3. Sync GameState
    if (typeof gameState !== 'undefined') {
      gameState.phase = isCh1 ? 'phishing' : (isCh2 ? 'malware' : targetCat);
      gameState.currentChapter = isCh1 ? 1 : 2;
      gameState.playerName = isCh1 ? 'Alex' : 'Ethan';
    }

    if (isCh1) {
      // ── STRICTLY CONFIGURE ALEX'S DESKTOP (CHAPTER 1) ──
      // Hide all Chapter 2, 3, and 4 desktop icons
      document.querySelectorAll('.ch2-only, .ch3-only, .ch4-only, .ch2-not-ch3').forEach(el => {
        el.style.setProperty('display', 'none', 'important');
      });

      // Show Chapter 1 icons
      const ch1Icons = ['icon-gmail', 'icon-browser', 'icon-notes', 'icon-recycle', 'icon-folder', 'icon-antivirus', 'icon-comms'];
      ch1Icons.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.setProperty('display', 'flex', 'important');
      });

      // Hide all Ch2/Ch3/Ch4 tiles in Start Menu
      const ch2StartIds = ['start-app-thispc', 'start-app-taskmanager', 'start-app-control-panel', 'start-app-space-fighter', 'start-app-steam', 'rec-app-thispc', 'rec-app-taskmanager', 'rec-app-control-panel'];
      ch2StartIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.setProperty('display', 'none', 'important');
      });

      // Close Chapter 2 specific app windows
      const ch2Apps = ['steam', 'space-fighter', 'taskmanager', 'control-panel'];
      ch2Apps.forEach(a => {
        if (typeof appState !== 'undefined' && appState[a]) {
          appState[a].open = false;
          appState[a].minimized = false;
          appState[a].maximized = false;
        }
        const w = document.getElementById(`win-${a}`);
        if (w) {
          w.classList.add('hidden');
          w.classList.remove('maximized', 'focused', 'minimized');
        }
      });

      // App locks
      if (typeof updateAppLockStates === 'function') updateAppLockStates();

      // Clear any Ch2 intro timers
      if (window._ryanCh2IntroTimer) {
        clearTimeout(window._ryanCh2IntroTimer);
        window._ryanCh2IntroTimer = null;
      }

    } else if (isCh2) {
      // ── STRICTLY CONFIGURE ETHAN'S DESKTOP (CHAPTER 2) ──
      // Show Chapter 2 icons
      document.querySelectorAll('.ch2-only, .ch2-not-ch3').forEach(el => {
        el.style.setProperty('display', 'flex', 'important');
      });
      const gfIcon = document.getElementById('icon-games-folder');
      if (gfIcon && !gfIcon.classList.contains('uninstalled')) {
        gfIcon.style.setProperty('display', 'flex', 'important');
      }

      // Hide Chapter 3 and 4 icons
      document.querySelectorAll('.ch3-only, .ch4-only').forEach(el => {
        el.style.setProperty('display', 'none', 'important');
      });

      // Show Ch2 Start Menu tiles
      const ch2StartIds = ['start-app-thispc', 'start-app-taskmanager', 'start-app-control-panel', 'start-app-space-fighter', 'start-app-steam', 'rec-app-thispc', 'rec-app-taskmanager', 'rec-app-control-panel'];
      ch2StartIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.setProperty('display', '', 'important');
      });

      // Clear any Ch1 intro timers
      if (window._ryanMissionIntroTimer) {
        clearTimeout(window._ryanMissionIntroTimer);
        window._ryanMissionIntroTimer = null;
      }
    }

    if (typeof updateTaskbar === 'function') updateTaskbar();
  }
  window.setupChapterDesktop = setupChapterDesktop;

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

    // Completely configure desktop for the active chapter (Alex vs Ethan)
    setupChapterDesktop(targetCat);

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

        if (typeof _isInvestigationFinished === 'function' && _isInvestigationFinished()) {
          if (typeof _refreshPostAwardChecklist === 'function') _refreshPostAwardChecklist();
        } else if (typeof renderEmptyStickyNote === 'function') {
          renderEmptyStickyNote();
        }

        // Dismiss dialogue & tutorial highlights
        if (typeof RyanGuide !== 'undefined' && RyanGuide.dismiss) RyanGuide.dismiss(true);
        if (typeof _stripCh1TutorialHighlights === 'function') _stripCh1TutorialHighlights();

        // Default open Alex's Zmail so Alex's desktop is fully populated
        if (typeof openApp === 'function') {
          openApp('gmail');
        }

        if (typeof RyanGuide !== 'undefined' && RyanGuide.speak) {
          setTimeout(function() {
            RyanGuide.speak([{
              text: "If you want to practice identifying phishing emails again, just message me through Phone Link, and I'll help you retry the phishing activity!",
              state: 'speaking'
            }], { chapter: 'phishing' });
          }, 1200);
        }
      } else {
        // In-progress Chapter 1 mission
        // ── If player refreshed mid-test, the test overlay sits on top of the
        //    desktop. Lock the Ryan guide so it cannot fire "Click Flag..." etc.,
        //    restore the desktop silently, then re-open the WIP test on top. ──
        const _savedScreen = session.screen || 'desktop';
        const _hasPretestWip  = typeof RyanPretest  !== 'undefined' &&
                                 RyanPretest.hasWipProgress  && RyanPretest.hasWipProgress();
        const _hasPosttestWip = typeof RyanPosttest !== 'undefined' &&
                                 RyanPosttest.hasWipProgress && RyanPosttest.hasWipProgress();

        if (_savedScreen === 'posttest' && _hasPosttestWip) {
          // Lock the guide so it stays silent while the post-test is running
          if (typeof RyanGuide !== 'undefined' && RyanGuide.lockMainFlow) {
            RyanGuide.lockMainFlow();
          }
          if (typeof resumeChapter1Mission === 'function') {
            resumeChapter1Mission(session.ch1 || null);
          } else if (typeof startMission === 'function') {
            startMission(false);
          }
          // Relaunch the in-progress post-test after the desktop has fully restored
          setTimeout(function() {
            if (typeof RyanPosttest !== 'undefined' &&
                RyanPosttest.hasWipProgress && RyanPosttest.hasWipProgress()) {
              RyanPosttest.launch(null);
            }
            setTimeout(function() {
              if (typeof RyanGuide !== 'undefined' && RyanGuide.releaseMainFlow) {
                RyanGuide.releaseMainFlow();
              }
            }, 600);
          }, 500);
        } else if (_savedScreen === 'pretest') {
          // Pre-test refresh: always show Ryan intro dialogue (fresh pre-test from Q1).
          // Do NOT call resumeChapter1Mission — it skips the intro and fires "Click Flag".
          if (typeof startMission === 'function') {
            startMission(false, true);
          }
        } else {
          // Chapter 1 Phishing Investigation Resume
          const _ch1 = session.ch1 || {};
          let _hasEmailProgress = (
            (Array.isArray(_ch1.inboxEmailIds) && _ch1.inboxEmailIds.length > 0) ||
            (Array.isArray(_ch1.emailResults)  && _ch1.emailResults.length  > 0) ||
            !!_ch1.awardClaimed ||
            !!_ch1.currentEmail ||
            !!_ch1.stage
          );
          if (!_hasEmailProgress) {
            try {
              const rawPh = localStorage.getItem('cyberzero_phishing_progress');
              if (rawPh) {
                const phData = JSON.parse(rawPh);
                if (phData && ((phData.emailResults && phData.emailResults.length > 0) || phData.awardClaimed || phData.currentEmail > 0)) {
                  _hasEmailProgress = true;
                }
              }
            } catch (e) {}
          }
          const _preTestDone = !!_ch1.preTestCompleted || !!localStorage.getItem('cyberzero_pretest_result_file');

          if (_hasEmailProgress) {
            // Normal resume — email investigation progress restored
            if (typeof resumeChapter1Mission === 'function') {
              resumeChapter1Mission(_ch1);
            } else if (typeof startMission === 'function') {
              startMission(false);
            }
          } else if (_preTestDone) {
            // Pre-test already done, launch fresh mission without intro loop
            if (typeof startMission === 'function') startMission(false, false);
          } else {
            // Fresh start from intro & pre-test
            if (typeof startMission === 'function') startMission(false, true);
          }
        }
      }
    } else if (targetCat === 'malware') {
      let ch2Data = session.ch2;
      if (!ch2Data || (!ch2Data.missionStarted && !ch2Data.mission)) {
        try {
          const rawCh2 = localStorage.getItem('cyberzero_ch2_mission');
          if (rawCh2) {
            const m = JSON.parse(rawCh2);
            if (m) ch2Data = { mission: m, missionStarted: true, checklistUnlocked: true };
          }
        } catch (e) {}
      }
      const hasCh2Mission = ch2Data && (ch2Data.missionStarted || ch2Data.mission);
      if (hasCh2Mission) {
        if (typeof resumeChapter2Mission === 'function') {
          resumeChapter2Mission(ch2Data);
        } else if (typeof startMalwareMission === 'function') {
          startMalwareMission();
        }
      } else {
        // No mission active yet: start or restart Ethan's Chapter 2 intro & pretest flow
        if (typeof startMalwareChapter === 'function') {
          startMalwareChapter();
        } else if (typeof openChapterDesktopDirect === 'function') {
          openChapterDesktopDirect('malware');
        }
      }
    }

    // ── DESKTOP WINDOW RESTORATION (Scoped to Active Chapter) ──
    const targetDesktop = (targetCat === 'malware' ? (session.desktop_ch2 || session.desktop) : (session.desktop_ch1 || session.desktop));
    const disallowedApps = (targetCat === 'phishing') ? ['steam', 'space-fighter', 'taskmanager', 'control-panel'] : ['instagram', 'pictures'];
    let openedAnyApp = false;

    if (targetDesktop && targetDesktop.appState && typeof appState !== 'undefined') {
      const savedApps = targetDesktop.appState;
      Object.keys(savedApps).forEach(appName => {
        if (disallowedApps.indexOf(appName) !== -1) return;
        const info = savedApps[appName];
        if (info && info.open) {
          if (typeof openApp === 'function') {
            openApp(appName);
            openedAnyApp = true;
          }
          if (info.minimized && typeof minimizeApp === 'function') minimizeApp(appName);
          if (info.maximized && typeof maximizeApp === 'function') maximizeApp(appName);
        }
      });
      if (targetDesktop.focusedApp && disallowedApps.indexOf(targetDesktop.focusedApp) === -1 && typeof focusWindow === 'function') {
        focusWindow(targetDesktop.focusedApp);
      }
    }

    // Default: ensure relevant primary app is open if nothing else was restored
    if (!openedAnyApp) {
      if (targetCat === 'phishing' && typeof openApp === 'function') {
        openApp('gmail');
      }
    }

    // ── STICKY NOTE RESTORATION ──
    const targetSticky = targetDesktop && targetDesktop.stickyNote;
    const sNote = document.getElementById('sticky-note');
    if (sNote) {
      if (targetSticky && targetSticky.open === false) {
        sNote.classList.add('hidden');
      } else {
        sNote.classList.remove('hidden');
        if (targetCat === 'phishing') {
          if (typeof updateStickyNoteForPhase === 'function') {
            updateStickyNoteForPhase('phishing');
          }
        }
      }
    }

    // For Chapter 2, re-render the checklist with the restored _ch2Mission state.
    // This ensures Sticky Notes content reflects saved progress after page refresh.
    if (targetCat === 'malware' && !isCompleted) {
      setTimeout(function() {
        if (typeof updateStickyNoteForPhase === 'function') {
          updateStickyNoteForPhase('malware');
        }
        if (typeof updateStickyChecklist === 'function') {
          updateStickyChecklist();
        }
        if (typeof enableCh2DesktopApps === 'function') {
          enableCh2DesktopApps();
        }
      }, 150);
    }

    // ── DIALOGUE RESTORATION (Scoped to Active Chapter) ──
    const targetDialogue = (targetCat === 'malware' ? (session.dialogue_ch2 || session.dialogue) : (session.dialogue_ch1 || session.dialogue));
    const dCat = (targetDialogue && targetDialogue.chapter) ? targetDialogue.chapter : session.activeChapter;
    if (targetDialogue && targetDialogue.active && dCat === targetCat && typeof RyanGuide !== 'undefined' && RyanGuide.restoreState) {
      RyanGuide.restoreState(targetDialogue);
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

    if (screen === 'pretest') {
      const testCat = session.activeChapter || window._currentChapterCategory || 'phishing';
      if (testCat === 'malware') {
        if (typeof Ch2Pretest !== 'undefined' && Ch2Pretest.reset) {
          Ch2Pretest.reset();
        }
        resumeSavedGameSession('malware', session);
        return;
      }
      // On refresh during pre-test: clear WIP so Ryan intro dialogue shows fresh.
      // The intro leads to "Ready for your first activity?" + Let's Begin → fresh pre-test.
      if (typeof RyanPretest !== 'undefined' && RyanPretest.clearWipProgress) {
        RyanPretest.clearWipProgress();
      } else {
        try { localStorage.removeItem('cyberzero_pretest_wip'); } catch (_) {}
      }
      // Treat as desktop session — startMission will show the Ryan intro
      resumeSavedGameSession(testCat, session);
      return;
    }

    if (screen === 'posttest') {
      // On refresh during post-test: resume from exactly where the player left off.
      const testCat = session.activeChapter || 'phishing';
      resumeSavedGameSession(testCat, session);
      setTimeout(function() {
        if (typeof RyanPosttest !== 'undefined' &&
            RyanPosttest.hasWipProgress && RyanPosttest.hasWipProgress()) {
          RyanPosttest.launch(null);
        }
      }, 500);
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
          if (Array.isArray(session.ch1.emailResults) && session.ch1.emailResults.length > 0) return true;
          if (session.ch1.currentEmail > 0) return true;
          if (session.ch1.awardClaimed) return true;
          if (Array.isArray(session.ch1.unlockedAchievements) && session.ch1.unlockedAchievements.length > 0) return true;
          if (session.ch1.stage > 0) return true;
        }
        if (catId === 'malware' && session.ch2) {
          if (session.ch2.missionStarted) return true;
          if (session.ch2.malwareQuarantined && session.ch2.malwareQuarantined > 0) return true;
          if (session.ch2.mission) {
            const m = session.ch2.mission;
            if (m.currentMission > 1 || m.mission1Done || m.mission2Done || m.mission3Done || m.mission4Done || m.bmKilled || m.antivirusOff) return true;
            if (m.tasks && Object.values(m.tasks).some(Boolean)) return true;
          }
        }
      }
    } catch (e) {}

    // Check individual chapter persistence keys
    if (catId === 'phishing') {
      try {
        const ph = localStorage.getItem('cyberzero_phishing_progress');
        if (ph) {
          const pd = JSON.parse(ph);
          if (pd && ((pd.emailResults && pd.emailResults.length > 0) || pd.currentEmail > 0 || pd.awardClaimed || (pd.unlockedAchievements && pd.unlockedAchievements.length > 0))) {
            return true;
          }
        }
      } catch (e) {}
      if (localStorage.getItem('cyberzero_pretest_result_file')) return true;
    }

    if (catId === 'malware') {
      try {
        const ch2 = localStorage.getItem('cyberzero_ch2_mission');
        if (ch2) {
          const m = JSON.parse(ch2);
          if (m) {
            if (m.currentMission > 1 || m.mission1Done || m.mission2Done || m.mission3Done || m.mission4Done || m.bmKilled || m.antivirusOff) return true;
            if (m.tasks && Object.values(m.tasks).some(Boolean)) return true;
          }
        }
      } catch (e) {}
      if (localStorage.getItem('cyberzero_ch2_pretest')) return true;
      if (localStorage.getItem('cyberzero_ch2_pretest_result_file')) return true;
    }

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
   * deleteProgress(categoryToReset)
   * Deletes Firestore save doc + clears related localStorage.
   * If restarting Chapter 2, only resets Chapter 2 progress and preserves Chapter 1.
   */
  window.deleteProgress = async function (categoryToReset) {
    const db   = _db();
    const user = _user();

    const activeCat = categoryToReset || window._currentChapterCategory || (typeof activeCategoryStory !== 'undefined' ? activeCategoryStory : null);

    if (activeCat === 'malware') {
      // ONLY reset Chapter 2 progress; preserve Chapter 1 progress, dialogue, and unlocked categories
      try { localStorage.removeItem('cyberzero_ch2_mission'); } catch (e) {}
      try { localStorage.removeItem('cyberzero_ch2_pretest'); } catch (e) {}
      try { localStorage.removeItem('cyberzero_ch2_pretest_result_file'); } catch (e) {}
      try {
        const raw = localStorage.getItem('cyberzero_session_state');
        if (raw) {
          const sess = JSON.parse(raw);
          sess.ch2 = null;
          sess.desktop_ch2 = null;
          sess.dialogue_ch2 = null;
          sess.activeChapter = 'malware';
          localStorage.setItem('cyberzero_session_state', JSON.stringify(sess));
        }
      } catch (e) {}
      console.log('[deleteProgress] Chapter 2 localStorage cleared (Chapter 1 preserved).');

      if (db && user) {
        try {
          await db.collection('saves').doc(user.uid).set({
            sessionState: { activeChapter: 'malware', ch2: null, desktop_ch2: null, dialogue_ch2: null },
            ls: {
              cyberzero_ch2_mission: null,
              cyberzero_ch2_pretest: null,
              cyberzero_ch2_pretest_result_file: null
            }
          }, { merge: true });
          console.log('[deleteProgress] ✅ Chapter 2 progress reset in cloud save (Chapter 1 preserved).');
        } catch (e) {
          console.warn('[deleteProgress] Cloud reset warning:', e.message);
        }
      }
      return;
    }

    if (activeCat === 'phishing') {
      // ONLY reset Chapter 1 progress; preserve Chapter 2 progress, dialogue, and unlocked categories
      try { localStorage.removeItem('cyberzero_phishing_progress'); } catch (e) {}
      try { localStorage.removeItem('cyberzero_newbie_gc_state'); } catch (e) {}
      try { localStorage.removeItem('cyberzero_pretest_result_file'); } catch (e) {}
      try { localStorage.removeItem('cyberzero_posttest_result_file'); } catch (e) {}
      try { localStorage.removeItem('cyberzero_pretest_wip'); } catch (e) {}
      try { localStorage.removeItem('cyberzero_posttest_wip'); } catch (e) {}

      // Reset Chapter 1 achievements in localStorage
      try {
        const rawAch = localStorage.getItem('cyberzero_claimed_achievements');
        if (rawAch) {
          const achMap = JSON.parse(rawAch);
          delete achMap['ach_phishing'];
          localStorage.setItem('cyberzero_claimed_achievements', JSON.stringify(achMap));
        }
      } catch (e) {}

      // Reset Chapter 1 completion in CATEGORIES (preserve Chapter 2 and subsequent chapters)
      try {
        const rawCat = localStorage.getItem('cyberzero_categories');
        if (rawCat) {
          const cats = JSON.parse(rawCat);
          if (Array.isArray(cats) && cats.length > 0) {
            cats[0].completed = false;
            cats[0].score = 0;
            cats[0].rank = '';
            localStorage.setItem('cyberzero_categories', JSON.stringify(cats));
          }
        }
      } catch (e) {}

      try {
        const raw = localStorage.getItem('cyberzero_session_state');
        if (raw) {
          const sess = JSON.parse(raw);
          sess.ch1 = null;
          sess.desktop_ch1 = null;
          sess.dialogue_ch1 = null;
          sess.activeChapter = 'phishing';
          localStorage.setItem('cyberzero_session_state', JSON.stringify(sess));
        }
      } catch (e) {}
      console.log('[deleteProgress] Chapter 1 localStorage cleared (Chapter 2 preserved).');

      if (db && user) {
        try {
          const updatedAch = localStorage.getItem('cyberzero_claimed_achievements');
          const updatedCats = localStorage.getItem('cyberzero_categories');
          await db.collection('saves').doc(user.uid).set({
            sessionState: { activeChapter: 'phishing', ch1: null, desktop_ch1: null, dialogue_ch1: null },
            ls: {
              cyberzero_phishing_progress: null,
              cyberzero_newbie_gc_state: null,
              cyberzero_pretest_result_file: null,
              cyberzero_posttest_result_file: null,
              cyberzero_pretest_wip: null,
              cyberzero_posttest_wip: null,
              cyberzero_claimed_achievements: updatedAch,
              cyberzero_categories: updatedCats
            }
          }, { merge: true });
          console.log('[deleteProgress] ✅ Chapter 1 progress reset in cloud save (Chapter 2 preserved).');
        } catch (e) {
          console.warn('[deleteProgress] Cloud reset warning:', e.message);
        }
      }
      return;
    }

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
    const isGuest = typeof window.czIsGuest === 'function' && window.czIsGuest();
    if (isGuest) {
      const session = _getSavedSessionState();
      if (session && session.screen && !session.isShutdown) {
        console.log('[save-progress] Guest active session detected! Restoring screen:', session.screen);
        _restoreRefreshedSession(session);
      } else if (typeof showMainMenu === 'function') {
        showMainMenu();
      } else {
        const mm = document.getElementById('overlay-main-menu');
        if (mm) mm.classList.add('active');
      }
      return;
    }

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
    if (_isFlushing) return;
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
