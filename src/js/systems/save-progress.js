'use strict';
/* ═══════════════════════════════════════════════════════════════════════════
   CyberZerØ — Firestore Save / Load / Delete Progress  (v3 — fixed)
   ─────────────────────────────────────────────────────────────────────────
   Collection : saves
   Document   : {uid}   (one doc per signed-in Google account)

   Payload:
     • CATEGORIES completion state   (cyberzero_categories)
     • Chapter 1 phishing progress   (cyberzero_phishing_progress)
     • Claimed achievements          (cyberzero_claimed_achievements)
     • Newbie GC state               (cyberzero_newbie_gc_state)
     • Ch2 pretest result            (cyberzero_ch2_pretest)
     • Active chapter pointer        (window._currentChapterCategory)
     • gameState snapshot

   Public API (all attached to window):
     window.saveProgress()            → flush + upload current state → Firestore
     window.loadAndApplyProgress()    → fetch from Firestore → restore state
     window.deleteProgress()          → delete Firestore doc + clear localStorage
     window.hasSavedProgress()        → Promise<boolean>

   FIXED bugs:
     ① _buildPayload() now calls savePhishingProgress/saveCategoriesProgress
        first so localStorage is always current before reading it.
     ② _applyPayload() defers live-state restore with setTimeout so game
        scripts (sticky-note.js, category-hub.js) are definitely loaded.
     ③ window._czLoadProgressAndShowMenu() helper allows auth.js to trigger
        a load+menu even if save-progress.js loaded after auth.js.
     ④ Comprehensive error logging so failures are visible in DevTools.
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
  ];

  /* ── Step 1: flush live state → localStorage, then read blobs ──────────── */
  function _flushToLocalStorage() {
    // Flush phishing progress (sticky-note.js global)
    try {
      if (typeof savePhishingProgress === 'function') {
        savePhishingProgress();
      }
    } catch (e) {}

    // Flush category progress (category-hub.js global)
    try {
      if (typeof saveCategoriesProgress === 'function') {
        saveCategoriesProgress();
      }
    } catch (e) {}
  }

  function _buildPayload() {
    // Always flush live state first so localStorage is current
    _flushToLocalStorage();

    const payload = {
      savedAt:       new Date().toISOString(),
      schemaVersion: 3,
      activeChapter: window._currentChapterCategory || null,
      gameState:     null,
      ls:            {}
    };

    // gameState snapshot
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

    // Read localStorage blobs (now guaranteed to be fresh after flush)
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

    // 1. Write localStorage blobs immediately — cheapest and instant
    if (data.ls && typeof data.ls === 'object') {
      LS_KEYS.forEach(key => {
        if (data.ls[key] !== undefined && data.ls[key] !== null) {
          try { localStorage.setItem(key, data.ls[key]); } catch (e) {}
        }
      });
    }

    // 2. Restore active chapter pointer
    if (data.activeChapter) {
      window._currentChapterCategory = data.activeChapter;
      try {
        if (typeof activeCategoryStory !== 'undefined') activeCategoryStory = data.activeChapter;
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

    // 4. Defer live-state hydration with setTimeout(0) so all chapter scripts
    //    (sticky-note.js, category-hub.js, etc.) are guaranteed to be parsed.
    setTimeout(() => {
      // Restore phishing live state from localStorage
      try {
        if (typeof loadPhishingProgress === 'function') {
          loadPhishingProgress();
        }
      } catch (e) {
        console.warn('[loadAndApplyProgress] loadPhishingProgress failed:', e);
      }

      // Restore CATEGORIES live state from localStorage
      try {
        if (typeof loadCategoriesProgress === 'function') {
          loadCategoriesProgress();
        }
      } catch (e) {
        console.warn('[loadAndApplyProgress] loadCategoriesProgress failed:', e);
      }

      // Refresh achievement badge
      try {
        if (typeof updateAchievementNotificationBadge === 'function') {
          updateAchievementNotificationBadge();
        }
      } catch (e) {}

      // Refresh the Start/Continue button now that localStorage is populated
      try {
        if (typeof updateStartButton === 'function') {
          updateStartButton();
        } else if (typeof window.updateStartButton === 'function') {
          window.updateStartButton();
        }
      } catch (e) {}

      console.log('[loadAndApplyProgress] Live state restored from cloud save ✓');
    }, 0);

    console.log('[loadAndApplyProgress] localStorage restored from Firestore ✓', data.savedAt);
  }

  /* ══════════════════════════════════════════════════════════════════════
     PUBLIC API
  ══════════════════════════════════════════════════════════════════════ */

  /**
   * saveProgress()
   * Flushes live state → localStorage, then uploads everything to Firestore.
   * Called automatically on Shutdown (Save). Also safe to call anytime.
   * @returns {Promise<boolean>}
   */
  window.saveProgress = async function () {
    const db   = _db();
    const user = _user();

    if (!db || !user) {
      console.warn('[saveProgress] Not signed in or Firestore unavailable. db:', !!db, 'user:', !!user);
      if (typeof showToast === 'function') {
        showToast('⚠️ Sign in to save progress to your account.', 'warning');
      }
      return false;
    }

    const payload = _buildPayload();
    console.log('[saveProgress] Uploading payload…', {
      uid: user.uid,
      savedAt: payload.savedAt,
      activeChapter: payload.activeChapter,
      lsKeys: Object.keys(payload.ls)
    });

    try {
      // Use set() with merge:false to replace the entire doc atomically
      // so stale keys from old sessions can't linger
      await db.collection('saves').doc(user.uid).set(payload);
      console.log('[saveProgress] ✅ Progress saved to Firestore for uid:', user.uid);
      // Show toast only when NOT suppressed (e.g. during shutdown screen)
      if (!window._suppressSaveToast && typeof showToast === 'function') {
        showToast('💾 Progress saved to your account!', 'success');
      }
      window._suppressSaveToast = false; // always reset after use
      // Update the Start/Continue button immediately after a successful save
      try {
        if (typeof updateStartButton === 'function') updateStartButton();
        else if (typeof window.updateStartButton === 'function') window.updateStartButton();
      } catch (_) {}
      return true;
    } catch (e) {
      console.error('[saveProgress] ❌ Save failed. Code:', e.code, 'Message:', e.message);
      if (e.code === 'permission-denied') {
        console.error('[saveProgress] Check Firestore Security Rules — writes are blocked!');
        if (typeof showToast === 'function') {
          showToast('❌ Save blocked: Check Firestore Security Rules in Firebase Console.', 'error');
        }
      } else {
        if (typeof showToast === 'function') {
          showToast('⚠️ Could not save progress. Check your connection.', 'warning');
        }
      }
      return false;
    }
  };

  /**
   * loadAndApplyProgress()
   * Fetches the user's Firestore save doc and restores all state.
   * Called automatically after sign-in.
   * @returns {Promise<boolean>} true if a save was found and applied
   */
  window.loadAndApplyProgress = async function () {
    const db   = _db();
    const user = _user();

    if (!db || !user) {
      console.warn('[loadAndApplyProgress] Not signed in or Firestore unavailable. db:', !!db, 'user:', !!user);
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
      if (e.code === 'permission-denied') {
        console.error('[loadAndApplyProgress] Check Firestore Security Rules — reads are blocked!');
      }
      return false;
    }
  };

  /**
   * hasSavedProgress()
   * Returns true if Firestore has a save doc for the current user.
   * @returns {Promise<boolean>}
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
   * Deletes the user's Firestore save doc + clears all related localStorage.
   * Called when the player confirms a Mission Restart.
   * @returns {Promise<void>}
   */
  window.deleteProgress = async function () {
    const db   = _db();
    const user = _user();

    // Always clear localStorage regardless of Firestore availability
    LS_KEYS.forEach(key => {
      try { localStorage.removeItem(key); } catch (e) {}
    });
    console.log('[deleteProgress] localStorage cleared.');

    if (!db || !user) {
      console.warn('[deleteProgress] Firestore unavailable — only cleared localStorage.');
      return;
    }

    try {
      await db.collection('saves').doc(user.uid).delete();
      console.log('[deleteProgress] ✅ Cloud save deleted for uid:', user.uid);
    } catch (e) {
      console.error('[deleteProgress] ❌ Delete failed. Code:', e.code, 'Message:', e.message);
    }
  };

  /**
   * window._czLoadProgressAndShowMenu()
   * Called by auth.js's enterAuthenticated() to load cloud save then show Main Menu.
   * Defined HERE so auth.js can safely reference it regardless of load order —
   * even if auth.js runs before save-progress.js, auth.js uses window._czLoadProgressAndShowMenu
   * which will be defined by the time auth fires (scripts are synchronous in order).
   */
  window._czLoadProgressAndShowMenu = async function () {
    try {
      await window.loadAndApplyProgress();
      // ── KEY FIX ────────────────────────────────────────────────────────
      // loadAndApplyProgress() has now restored localStorage from Firestore.
      // Call updateStartButton() NOW (synchronously, before showMainMenu)
      // so the button label is correct when showMainMenu() renders it.
      // ──────────────────────────────────────────────────────────────────
      try {
        if (typeof updateStartButton === 'function') updateStartButton();
        else if (typeof window.updateStartButton === 'function') window.updateStartButton();
      } catch (_) {}
    } catch (e) {
      console.warn('[_czLoadProgressAndShowMenu] Load failed, proceeding to main menu:', e);
    }
    // Always show main menu after load (success or failure)
    if (typeof showMainMenu === 'function') {
      showMainMenu();
    } else {
      const mm = document.getElementById('overlay-main-menu');
      if (mm) mm.classList.add('active');
    }
  };

  // Legacy alias
  window.loadProgress = window.loadAndApplyProgress;

  console.log('[save-progress] ✅ Firestore save system ready (v3)');

})();
