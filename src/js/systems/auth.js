'use strict';
/* ═══════════════════════════════════════════════════════════════════════
   CyberZerØ — AUTH GATE v2  (Google Sign-In + Email OTP second factor)
   ─────────────────────────────────────────────────────────────────────
   FLOW:
     Page load → AUTH_LOADING (main menu stays hidden)
       → No Firebase user   → Login screen  (Google button only)
       → Firebase user +    → OTP screen    (if OTP not yet verified)
         OTP not verified
       → Firebase user +    → Show Main Menu
         OTP verified

   OTP SECURITY NOTE:
   ══════════════════
   The 6-digit code is generated and validated ENTIRELY on the server side
   via a Firebase Cloud Function endpoint (CYBERZERO_OTP_ENDPOINT).
   The frontend NEVER stores, receives, or compares the OTP value itself.
   It only:
     1. Sends a "send code" request  →  server generates code, emails it
     2. Sends a "verify code" request → server checks the code and returns
        { ok: true } or { ok: false, error: 'invalid' | 'expired' | 'locked' }

   Until CYBERZERO_OTP_ENDPOINT is deployed, the system will show a clear
   "Backend not configured" message and will NOT let players through with
   any fake code.  See section ▸ OTP BACKEND SETUP below.
   ─────────────────────────────────────────────────────────────────────
   OTP BACKEND SETUP (Firebase Cloud Functions — required):
     Deploy two HTTPS callable/REST functions:
       POST /sendOtp   body: { idToken }
                       → verifies idToken, generates 6-digit code,
                         stores hashed code+expiry in Firestore,
                         sends code via Firebase Auth Email or SendGrid,
                         returns { ok: true }

       POST /verifyOtp body: { idToken, code }
                       → verifies idToken, looks up stored hash,
                         checks expiry (<= 10 min), checks attempt count (<= 5),
                         if match → marks session verified, returns { ok: true }
                         else    → increments attempt count, returns
                                   { ok: false, error: 'invalid'|'expired'|'locked' }

   Set CYBERZERO_OTP_ENDPOINT (in firebase-config.js) to your function base URL:
       const CYBERZERO_OTP_ENDPOINT = 'https://us-central1-cyberzero-b9af9.cloudfunctions.net';

   Required Firebase Console steps:
     • Enable Google Sign-In provider (Authentication → Sign-in method)
     • Add your domain to "Authorized domains" (Authentication → Settings)
     • Deploy the Cloud Functions above
     • Enable Firestore in the project (for OTP storage)
═══════════════════════════════════════════════════════════════════════ */

(function () {

  /* ── 0. Guard: skip if auth is disabled ── */
  if (typeof CYBERZERO_AUTH_REQUIRED === 'undefined' || !CYBERZERO_AUTH_REQUIRED) return;
  if (typeof mainMenuStart !== 'function') {
    console.error('[auth] mainMenuStart not found — ensure main-menu.js loads before auth.js');
    return;
  }

  /* ── 1. Config checks ── */
  const cfg         = (typeof CYBERZERO_FIREBASE_CONFIG !== 'undefined') ? CYBERZERO_FIREBASE_CONFIG : null;
  const otpEndpoint = (typeof CYBERZERO_OTP_ENDPOINT   !== 'undefined') ? CYBERZERO_OTP_ENDPOINT   : null;
  const otpSkip     = (typeof CYBERZERO_OTP_SKIP        !== 'undefined') ? !!CYBERZERO_OTP_SKIP      : false;

  let setupProblem = null;
  if (!cfg || !cfg.apiKey || /^FILL/i.test(cfg.apiKey)) {
    setupProblem = 'Firebase is not configured. Fill in src/js/systems/firebase-config.js.';
  } else if (typeof firebase === 'undefined' || !firebase.auth) {
    setupProblem = 'Firebase SDK failed to load. Check your connection and reload.';
  } else if (location.protocol === 'file:') {
    setupProblem = 'Authentication requires the game to be served over http(s), not opened as a local file.';
  }

  /* ── 2. Firebase init ── */
  let auth = null;
  if (!setupProblem) {
    try {
      if (!firebase.apps.length) firebase.initializeApp(cfg);
      auth = firebase.auth();
    } catch (e) {
      console.error('[auth] Firebase init failed', e);
      setupProblem = 'Authentication service failed to start.';
    }
  }

  /* ── 3. Auth-state ready promise ── */
  let readyResolve;
  const authReady = new Promise(r => { readyResolve = r; });
  let initialCheckDone = false;

  /* ── 4. Session verification state ─────────────────────────────────
     We use sessionStorage (cleared on tab close) to track OTP completion.
     The key includes the Firebase UID so it cannot be spoofed cross-user.
     This does NOT store the OTP itself — just a boolean "OTP passed" flag.
     On logout the flag is explicitly cleared.
  ─────────────────────────────────────────────────────────────────────*/
  function otpKey(uid) { return 'czOtpVerified_' + uid; }
  function isOtpVerified(uid) { return sessionStorage.getItem(otpKey(uid)) === '1'; }
  function markOtpVerified(uid) { sessionStorage.setItem(otpKey(uid), '1'); }
  function clearOtpVerified(uid) { if (uid) sessionStorage.removeItem(otpKey(uid)); }

  /* ── 4b. Registered student progress backup & restore ─────────────────
     When a student plays as a guest on a shared computer, any existing
     registered student localStorage progress is safely backed up so that
     temporary guest play does not overwrite the registered student's account.
  ─────────────────────────────────────────────────────────────────────*/
  const REG_BACKUP_KEY = 'cyberzero_registered_student_backup';
  const LS_TRACKED_KEYS = [
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

  function _backupRegisteredStudentProgressIfNeeded() {
    try {
      if (!localStorage.getItem(REG_BACKUP_KEY)) {
        const backup = {};
        let hasData = false;
        LS_TRACKED_KEYS.forEach(key => {
          const val = localStorage.getItem(key);
          if (val !== null) {
            backup[key] = val;
            hasData = true;
          }
        });
        if (hasData) {
          localStorage.setItem(REG_BACKUP_KEY, JSON.stringify(backup));
          console.log('[auth] Registered student progress backed up before guest session.');
        }
      }
    } catch (e) {}
  }

  function _restoreRegisteredStudentProgress() {
    try {
      const raw = localStorage.getItem(REG_BACKUP_KEY);
      if (raw) {
        const backup = JSON.parse(raw);
        Object.keys(backup).forEach(key => {
          if (backup[key] !== null && backup[key] !== undefined) {
            localStorage.setItem(key, backup[key]);
          }
        });
        localStorage.removeItem(REG_BACKUP_KEY);
        console.log('[auth] Registered student progress restored from backup.');
      }
    } catch (e) {}
  }

  function _clearGuestProgressAndRestoreBackup() {
    try {
      const raw = localStorage.getItem(REG_BACKUP_KEY);
      if (raw) {
        _restoreRegisteredStudentProgress();
      } else {
        LS_TRACKED_KEYS.forEach(key => {
          try { localStorage.removeItem(key); } catch (e) {}
        });
        console.log('[auth] Guest transient progress cleared on logout.');
      }
    } catch (e) {}
  }

  window.czIsGuest = function () {
    try {
      if (window._czGuestSession) return true;
      const stored = sessionStorage.getItem('cyberzero_guest_session');
      if (stored) {
        window._czGuestSession = JSON.parse(stored);
        return true;
      }
    } catch (e) {}
    return false;
  };

  window.czGetGuestUser = function () {
    if (window._czGuestSession) return window._czGuestSession;
    try {
      const stored = sessionStorage.getItem('cyberzero_guest_session');
      if (stored) {
        window._czGuestSession = JSON.parse(stored);
        return window._czGuestSession;
      }
    } catch (e) {}
    return null;
  };

  /**
   * Updates guest user's display name and refreshes the UI tag.
   * Can be called with a custom name or will prompt the user if omitted.
   */
  window.czUpdateGuestName = function (newName) {
    if (!window.czIsGuest()) return;
    const guestUser = window.czGetGuestUser() || {};
    let name = newName;
    if (typeof name !== 'string') {
      const current = guestUser.name || guestUser.displayName || 'Guest';
      name = prompt('Enter your Guest display name:', current);
      if (name === null) return; // User cancelled
    }
    name = (name || '').trim();
    if (!name) return;
    if (name.length > 20) name = name.slice(0, 20);

    guestUser.name = name;
    guestUser.displayName = name;
    window._czGuestSession = guestUser;
    try {
      sessionStorage.setItem('cyberzero_guest_session', JSON.stringify(guestUser));
    } catch (e) {}

    updateChip(guestUser);
    console.log('[auth] Guest name updated to:', name);
  };

  window.czIsAdmin = function () {
    // Administrator features are completely inaccessible to guest users
    if (window.czIsGuest()) return false;
    return false;
  };

  window.czPlayAsGuest = function () {
    if (typeof stopMMBgMusic === 'function') stopMMBgMusic();

    // Create unique temporary guest session
    const randId = Math.floor(1000 + Math.random() * 9000);
    const guestUser = {
      isGuest: true,
      uid: 'guest_' + randId,
      id: 'guest_' + randId,
      displayName: 'Guest_' + randId,
      name: 'Guest_' + randId,
      isAnonymous: true,
      createdAt: Date.now()
    };

    window._czGuestSession = guestUser;
    try {
      sessionStorage.setItem('cyberzero_guest_session', JSON.stringify(guestUser));
    } catch (e) {}

    // Safeguard registered student progress
    _backupRegisteredStudentProgressIfNeeded();

    // Close the auth overlay
    closeOverlay();

    // Update user bar with guest display (HIDES the signout/logout button)
    updateChip(guestUser);

    // Enter Main Menu directly
    if (typeof showMainMenu === 'function') {
      showMainMenu();
    } else {
      const mm = document.getElementById('overlay-main-menu');
      if (mm) mm.classList.add('active');
    }

    if (typeof startMMBgMusic === 'function') {
      startMMBgMusic();
    }
  };

  /* ── 5. Error message map ── */
  const GOOGLE_ERRORS = {
    'auth/popup-closed-by-user':            'Google sign-in was cancelled.',
    'auth/popup-blocked':                   'Pop-up was blocked by your browser. Please allow pop-ups for this site and try again.',
    'auth/cancelled-popup-request':         'Sign-in cancelled.',
    'auth/account-exists-with-different-credential': 'An account already exists with a different sign-in method.',
    'auth/network-request-failed':          'Network error. Check your connection and try again.',
    'auth/too-many-requests':               'Too many sign-in attempts. Please wait a moment and try again.',
    'auth/unauthorized-domain':             'This domain is not authorized. Add it in Firebase Console → Authentication → Settings → Authorized Domains.',
    'auth/operation-not-allowed':           'Google Sign-In is not enabled. Enable it in Firebase Console → Authentication → Sign-in method → Google.',
    'auth/internal-error':                  'Firebase internal error. Check the browser console (F12) for details.',
    'auth/user-disabled':                   'This Google account has been disabled.',
    'auth/web-storage-unsupported':         'Your browser blocks storage required for sign-in. Disable private/incognito mode or allow cookies.',
    'auth/invalid-api-key':                 'Firebase API key is invalid. Check src/js/systems/firebase-config.js.',
    'auth/app-deleted':                     'Firebase app was deleted. Reload the page.',
    'auth/invalid-user-token':              'Session expired. Please sign in again.',
    'auth/user-token-expired':              'Session expired. Please sign in again.'
  };
  // Show the actual Firebase error code in the fallback so it's visible for debugging
  const googleErrText = e => {
    if (!e) return 'Sign-in failed. Please try again.';
    return GOOGLE_ERRORS[e.code] || `Sign-in failed (${e.code || 'unknown error'}). Check the browser console (F12) for details.`;
  };

  const OTP_ERRORS = {
    'invalid':  'Incorrect code. Please check and try again.',
    'expired':  'This code has expired. Please request a new one.',
    'locked':   'Too many incorrect attempts. Please request a new code.',
    'network':  'Network error. Check your connection and try again.',
    'backend':  'Verification service is not yet configured. See the setup guide.'
  };

  /* ── 6. DOM Builder ────────────────────────────────────────────────
     Builds the auth overlay with two panels:
       #cz-panel-google  → "Continue with Google" button
       #cz-panel-otp     → 6-digit OTP entry
  ─────────────────────────────────────────────────────────────────────*/
  let root = null;
  const $ = id => document.getElementById(id);

  function buildOverlay() {
    if (root) return;
    root = document.createElement('div');
    root.id = 'cz-auth';
    root.className = 'cz-auth';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.setAttribute('aria-label', 'CyberZerØ Authentication');

    root.innerHTML = `
      <div class="cz-auth-card">

        <!-- ═ LOGO HEADER BANNER ═ -->
        <div class="cz-auth-logo-wrap">
          <img src="assets/logo/cyber_logo1.png" alt="CyberZerØ" class="cz-auth-logo">
        </div>

        <!-- ═ STATUS + DIVIDER ═ -->
        <div class="cz-auth-sub" id="cz-sub">Checking session…</div>
        <div class="cz-auth-divider" aria-hidden="true"></div>
        <div class="cz-auth-problem" id="cz-problem" hidden></div>

        <!-- ═ PANEL 1: Google Sign-In & Guest Access ═ -->
        <div id="cz-panel-google" hidden>
          <button type="button" class="cz-google-btn" id="cz-google-btn" onclick="czSignInWithGoogle()">
            <svg class="cz-google-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span id="cz-google-label">Continue with Google</span>
          </button>

          <div class="cz-auth-or" aria-hidden="true"><span>OR</span></div>

          <button type="button" class="cz-guest-btn" id="cz-guest-btn" onclick="czPlayAsGuest()">
            <svg class="cz-guest-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
              <path d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>PLAY AS GUEST</span>
          </button>

          <div class="cz-auth-msg" id="cz-google-msg" role="alert"></div>
          <div class="cz-auth-footer">DIGITAL SAFETY SIMULATION GAME &nbsp;·&nbsp; STUDENT AWARENESS</div>
        </div>

        <!-- ═ PANEL 2: OTP Verification ═ -->
        <div id="cz-panel-otp" hidden>
          <div class="cz-otp-intro">
            <div class="cz-otp-email-label">Verification code sent to:</div>
            <div class="cz-otp-email" id="cz-otp-email">···</div>
            <div class="cz-otp-note">Enter the 6-digit code from your email.</div>
          </div>

          <div class="cz-otp-inputs" id="cz-otp-inputs" aria-label="6-digit verification code">
            <input type="text" inputmode="numeric" pattern="[0-9]" maxlength="1" class="cz-otp-digit" id="cz-otp-0" aria-label="Digit 1">
            <input type="text" inputmode="numeric" pattern="[0-9]" maxlength="1" class="cz-otp-digit" id="cz-otp-1" aria-label="Digit 2">
            <input type="text" inputmode="numeric" pattern="[0-9]" maxlength="1" class="cz-otp-digit" id="cz-otp-2" aria-label="Digit 3">
            <input type="text" inputmode="numeric" pattern="[0-9]" maxlength="1" class="cz-otp-digit" id="cz-otp-3" aria-label="Digit 4">
            <input type="text" inputmode="numeric" pattern="[0-9]" maxlength="1" class="cz-otp-digit" id="cz-otp-4" aria-label="Digit 5">
            <input type="text" inputmode="numeric" pattern="[0-9]" maxlength="1" class="cz-otp-digit" id="cz-otp-5" aria-label="Digit 6">
          </div>

          <div class="cz-auth-msg" id="cz-otp-msg" role="alert"></div>

          <button type="button" class="cz-auth-btn" id="cz-otp-verify-btn" onclick="czVerifyOtp()">
            Verify Code
          </button>

          <div class="cz-otp-resend-row">
            <span class="cz-otp-resend-label" id="cz-resend-label">Didn't receive the code?</span>
            <button type="button" class="cz-auth-link" id="cz-resend-btn" onclick="czResendOtp()">Resend Code</button>
          </div>

          <button type="button" class="cz-auth-link cz-auth-back" id="cz-otp-back-btn" onclick="czSignOut()">
            ← Back to Google Sign-In
          </button>
        </div>

      </div>
    `;

    document.body.appendChild(root);
    _initOtpInputs();
  }

  /* ── 7. OTP input keyboard handling ── */
  function _initOtpInputs() {
    const digits = root.querySelectorAll('.cz-otp-digit');
    digits.forEach((el, i) => {
      el.addEventListener('input', e => {
        // Allow only digits
        el.value = el.value.replace(/\D/g, '').slice(-1);
        if (el.value && i < digits.length - 1) digits[i + 1].focus();
      });
      el.addEventListener('keydown', e => {
        if (e.key === 'Backspace' && !el.value && i > 0) {
          digits[i - 1].focus();
        }
        if (e.key === 'Enter') czVerifyOtp();
      });
      // Allow paste of full 6-digit code into first input
      el.addEventListener('paste', e => {
        e.preventDefault();
        const pasted = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '');
        digits.forEach((d, j) => { d.value = pasted[j] || ''; });
        const next = Math.min(pasted.length, digits.length - 1);
        digits[next].focus();
      });
    });
  }

  function _getOtpCode() {
    return Array.from(root.querySelectorAll('.cz-otp-digit')).map(d => d.value).join('');
  }

  function _clearOtpInputs() {
    root.querySelectorAll('.cz-otp-digit').forEach(d => { d.value = ''; });
  }

  /* ── 8. UI helpers ── */
  function showPanel(name) {
    // name: 'loading' | 'google' | 'otp'
    $('cz-panel-google') && ($('cz-panel-google').hidden = name !== 'google');
    $('cz-panel-otp') && ($('cz-panel-otp').hidden = name !== 'otp');
  }

  function setSub(text) { const el = $('cz-sub'); if (el) el.textContent = text; }
  function setGoogleMsg(text, ok) {
    const el = $('cz-google-msg');
    if (!el) return;
    el.textContent = text || '';
    el.className = 'cz-auth-msg' + (ok ? ' ok' : '');
  }
  function setOtpMsg(text, ok) {
    const el = $('cz-otp-msg');
    if (!el) return;
    el.textContent = text || '';
    el.className = 'cz-auth-msg' + (ok ? ' ok' : '');
  }
  function setProblem(text) {
    const el = $('cz-problem');
    if (!el) return;
    el.hidden = !text;
    el.textContent = text || '';
  }

  function openOverlay() {
    buildOverlay();
    root.classList.add('active', 'locked');
    if (!window._czIsSigningOut) {
      if (typeof stopMMBgMusic === 'function') stopMMBgMusic();
      const mm = document.getElementById('overlay-main-menu');
      if (mm) mm.classList.remove('active');
    }
  }
  function closeOverlay() {
    if (root) root.classList.remove('active', 'locked');
  }

  function maskEmail(email) {
    if (!email) return '···';
    const [local, domain] = email.split('@');
    if (!domain) return email;
    const visible = local.length > 2 ? local[0] + '···' : local[0] + '·';
    return visible + '@' + domain;
  }

  /* ── 9. Resend cooldown ── */
  let _resendCooldownTimer = null;

  function startResendCooldown(seconds) {
    const btn = $('cz-resend-btn');
    const lbl = $('cz-resend-label');
    if (!btn) return;
    btn.disabled = true;
    let remaining = seconds;
    const tick = () => {
      if (lbl) lbl.textContent = `Resend available in ${remaining}s`;
      remaining--;
      if (remaining < 0) {
        clearInterval(_resendCooldownTimer);
        btn.disabled = false;
        if (lbl) lbl.textContent = "Didn't receive the code?";
      }
    };
    tick();
    _resendCooldownTimer = setInterval(tick, 1000);
  }

  /* ── 10. OTP backend calls ───────────────────────────────────────────
     These call the Firebase Cloud Function backend.
     If CYBERZERO_OTP_ENDPOINT is not set, they return { ok: false, error: 'backend' }.
     The OTP value itself is NEVER in this file or any frontend code.
  ─────────────────────────────────────────────────────────────────────*/
  async function callSendOtp(idToken) {
    if (!otpEndpoint) return { ok: false, error: 'backend' };
    try {
      const res = await fetch(`${otpEndpoint}/sendOtp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken })
      });
      return await res.json();
    } catch (e) {
      console.error('[auth] sendOtp network error', e);
      return { ok: false, error: 'network' };
    }
  }

  async function callVerifyOtp(idToken, code) {
    if (!otpEndpoint) return { ok: false, error: 'backend' };
    try {
      const res = await fetch(`${otpEndpoint}/verifyOtp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken, code })
      });
      return await res.json();
    } catch (e) {
      console.error('[auth] verifyOtp network error', e);
      return { ok: false, error: 'network' };
    }
  }

  /* ── 11. State machine ───────────────────────────────────────────────
     AUTH_LOADING → resolve() after first onAuthStateChanged
     AUTH_REQUIRED → show Google panel
     EMAIL_VERIFICATION_REQUIRED → show OTP panel
     AUTHENTICATED → show Main Menu
  ─────────────────────────────────────────────────────────────────────*/
  function enterAuthRequired() {
    openOverlay();
    setSub('Sign in to begin');
    setProblem(null);
    showPanel('google');
    setGoogleMsg('');
    setTimeout(() => { const btn = $('cz-google-btn'); if (btn) btn.focus(); }, 80);
  }

  function enterOtpRequired(user) {
    openOverlay();
    setSub('Verify your identity');
    setProblem(null);
    showPanel('otp');
    setOtpMsg('');
    _clearOtpInputs();
    const emailEl = $('cz-otp-email');
    if (emailEl) emailEl.textContent = maskEmail(user.email);
    setTimeout(() => { const d = $('cz-otp-0'); if (d) d.focus(); }, 80);
    // Start resend cooldown (60s on initial send)
    startResendCooldown(60);
  }

  async function enterAuthenticated() {
    updateChip(auth.currentUser);

    // If desktop was already restored immediately on page refresh,
    // sync Firestore save doc in the background without disturbing the player's desktop!
    let isDesktopActive = false;
    try {
      const rawSession = localStorage.getItem('cyberzero_session_state');
      const parsedSession = rawSession ? JSON.parse(rawSession) : null;
      // pretest/posttest run on top of an already-active desktop — treat the same
      const _liveScreensAuth = ['desktop', 'pretest', 'posttest'];
      if (parsedSession && _liveScreensAuth.indexOf(parsedSession.screen) !== -1 && !parsedSession.isShutdown) {
        isDesktopActive = true;
      }
    } catch (_) {}

    if (isDesktopActive) {
      closeOverlay();
      if (typeof window.loadAndApplyProgress === 'function') {
        try { await window.loadAndApplyProgress(); } catch (_) {}
      }
      return;
    }

    // Otherwise, hold the loading overlay while loading saved data from Firebase.
    // IMPORTANT: closeOverlay() must be called BEFORE showMainMenu() because
    // showMainMenu() checks for the active auth overlay and bails out if it finds it.
    openOverlay();
    setSub('Loading saved progress…');
    showPanel('loading');

    // Step 1: Load data from Firestore
    try {
      if (typeof window.loadAndApplyProgress === 'function') {
        await window.loadAndApplyProgress();
      }
      try {
        if (typeof updateStartButton === 'function') updateStartButton();
        else if (typeof window.updateStartButton === 'function') window.updateStartButton();
      } catch (_) {}
    } catch (e) {
      console.warn('[auth] enterAuthenticated: load failed', e);
    }

    // Step 2: Close overlay FIRST so showMainMenu() can run without the auth-active guard
    closeOverlay();

    // Step 3: Decide which screen to show
    let _restoredSession = null;
    try {
      const _raw = localStorage.getItem('cyberzero_session_state');
      if (_raw) _restoredSession = JSON.parse(_raw);
    } catch (_) {}

    if (_restoredSession && _restoredSession.screen && !_restoredSession.isShutdown) {
      // Active session — restore to saved screen (desktop, story-select, etc.)
      if (_restoredSession.screen === 'desktop' ||
          _restoredSession.screen === 'pretest'  ||
          _restoredSession.screen === 'posttest') {
        if (typeof resumeSavedGameSession === 'function') {
          resumeSavedGameSession(_restoredSession.activeChapter || 'phishing', _restoredSession);
        } else if (typeof showMainMenu === 'function') {
          showMainMenu();
        }
      } else if (_restoredSession.screen === 'story-select') {
        if (typeof showStorySelectionScreen === 'function') {
          showStorySelectionScreen(_restoredSession.activeChapter || 'phishing');
        } else if (typeof showMainMenu === 'function') {
          showMainMenu();
        }
      } else {
        if (typeof showMainMenu === 'function') showMainMenu();
        else { const mm = document.getElementById('overlay-main-menu'); if (mm) mm.classList.add('active'); }
      }
    } else {
      // No active session — normal main menu
      if (typeof showMainMenu === 'function') showMainMenu();
      else { const mm = document.getElementById('overlay-main-menu'); if (mm) mm.classList.add('active'); }
    }
  }

  /* ── 12. onAuthStateChanged — single source of truth ── */
  if (auth) {
    auth.onAuthStateChanged(async user => {
      if (!initialCheckDone) {
        initialCheckDone = true;
        readyResolve();
      }

      if (!user) {
        // If an active guest session exists in sessionStorage (e.g. page refresh during guest play),
        // restore guest state without kicking the player back to the sign-in screen
        if (typeof window.czIsGuest === 'function' && window.czIsGuest()) {
          const guestUser = window.czGetGuestUser();
          closeOverlay();
          updateChip(guestUser);
          if (typeof window._czLoadProgressAndShowMenu === 'function') {
            window._czLoadProgressAndShowMenu();
          } else if (typeof showMainMenu === 'function') {
            showMainMenu();
          }
          return;
        }

        // ── Signed out ──
        updateChip(null);
        if (!window._czIsSigningOut) {
          if (typeof stopMMBgMusic === 'function') stopMMBgMusic();
          // If main menu was visible, hide it
          const mm = document.getElementById('overlay-main-menu');
          if (mm) mm.classList.remove('active');
        }
        enterAuthRequired();
        return;
      }

      // ── Google user exists ──
      updateChip(user);

      // ── OTP SKIP MODE (backend not deployed yet) ─────────────────────
      // When CYBERZERO_OTP_SKIP = true in firebase-config.js,
      // Google Sign-In alone is sufficient — OTP is bypassed.
      // Set CYBERZERO_OTP_SKIP = false once Cloud Functions are deployed.
      if (otpSkip) {
        markOtpVerified(user.uid); // treat as verified for this session
        enterAuthenticated();
        return;
      }
      // ─────────────────────────────────────────────────────────────────

      if (isOtpVerified(user.uid)) {
        // Already fully authenticated this session
        enterAuthenticated();
      } else {
        // OTP not yet completed — need to send code and show OTP screen
        openOverlay();
        setSub('Sending verification code…');
        showPanel('loading');

        try {
          const idToken = await user.getIdToken();
          const result = await callSendOtp(idToken);

          if (result.ok) {
            enterOtpRequired(user);
          } else if (result.error === 'backend') {
            // Backend not deployed yet — show clear setup message
            setProblem(
              '⚙️ Email verification backend is not yet configured.\n' +
              'Deploy the Firebase Cloud Functions (sendOtp / verifyOtp) ' +
              'and set CYBERZERO_OTP_ENDPOINT in firebase-config.js to enable this step.'
            );
            setSub('Setup required');
            showPanel('google');
            // Offer a sign-out option since they can't proceed
            setGoogleMsg('You are signed in to Google but OTP verification is not available yet.', false);
          } else {
            setProblem(OTP_ERRORS[result.error] || 'Failed to send verification code.');
            setSub('Verification failed');
            showPanel('google');
          }
        } catch (err) {
          console.error('[auth] OTP send error', err);
          setProblem('Failed to send verification code. Please try again.');
          showPanel('google');
        }
      }
    });
  } else {
    // No auth (setup problem) — resolve ready immediately and show problem
    readyResolve();
    initialCheckDone = true;
    if (typeof stopMMBgMusic === 'function') stopMMBgMusic();
    const mm = document.getElementById('overlay-main-menu');
    if (mm) mm.classList.remove('active');
    openOverlay();
    setSub('Login unavailable');
    setProblem(setupProblem);
    showPanel('google');
  }

  /* ── 13. Public action functions (called from onclick) ── */

  /** Step 1: Google Sign-In */
  window.czSignInWithGoogle = async function () {
    // If a guest session was active, clear it and restore any registered student backup
    try { sessionStorage.removeItem('cyberzero_guest_session'); } catch (e) {}
    window._czGuestSession = null;
    _clearGuestProgressAndRestoreBackup();

    // Stop background music immediately when user initiates Google sign-in
    if (typeof stopMMBgMusic === 'function') stopMMBgMusic();
    const mm = document.getElementById('overlay-main-menu');
    if (mm) mm.classList.remove('active');
    if (!auth) {
      setGoogleMsg('Authentication service not available. Check the setup.');
      return;
    }
    const btn = $('cz-google-btn');
    const lbl = $('cz-google-label');
    setGoogleMsg('');
    if (btn) btn.disabled = true;
    if (lbl) lbl.textContent = 'Signing in…';
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await auth.signInWithPopup(provider);
      // onAuthStateChanged will fire and take over
    } catch (err) {
      // Log full error object so the developer can see it in F12 console
      console.error('[CyberZerØ Auth] Google sign-in error:', err);
      console.error('[CyberZerØ Auth] Error code:', err && err.code);
      console.error('[CyberZerØ Auth] Error message:', err && err.message);
      setGoogleMsg(googleErrText(err));
    } finally {
      if (btn) btn.disabled = false;
      if (lbl) lbl.textContent = 'Continue with Google';
    }
  };

  /** Step 2a: Verify OTP code entered by user */
  window.czVerifyOtp = async function () {
    const code = _getOtpCode();
    if (code.length < 6) {
      setOtpMsg('Please enter all 6 digits.');
      return;
    }
    const user = auth && auth.currentUser;
    if (!user) { setOtpMsg('Session expired. Please sign in again.'); return; }

    const verifyBtn = $('cz-otp-verify-btn');
    if (verifyBtn) { verifyBtn.disabled = true; verifyBtn.textContent = 'Verifying…'; }
    setOtpMsg('');

    try {
      const idToken = await user.getIdToken();
      const result = await callVerifyOtp(idToken, code);

      if (result.ok) {
        markOtpVerified(user.uid);
        setOtpMsg('✓ Verified! Loading game…', true);
        setTimeout(() => enterAuthenticated(), 700);
      } else {
        const errMsg = OTP_ERRORS[result.error] || 'Verification failed.';
        setOtpMsg(errMsg);
        if (result.error === 'locked') {
          // Disable verify and resend until they request new code
          if (verifyBtn) verifyBtn.disabled = true;
        }
        _clearOtpInputs();
        setTimeout(() => { const d = $('cz-otp-0'); if (d) d.focus(); }, 50);
      }
    } catch (err) {
      console.error('[auth] Verify OTP error', err);
      setOtpMsg('Network error. Please try again.');
    } finally {
      if (verifyBtn && verifyBtn.textContent === 'Verifying…') {
        verifyBtn.disabled = false;
        verifyBtn.textContent = 'Verify Code';
      }
    }
  };

  /** Step 2b: Resend OTP */
  window.czResendOtp = async function () {
    const user = auth && auth.currentUser;
    if (!user) return;
    const resendBtn = $('cz-resend-btn');
    if (resendBtn) { resendBtn.disabled = true; }
    setOtpMsg('');

    try {
      const idToken = await user.getIdToken();
      const result = await callSendOtp(idToken);

      if (result.ok) {
        setOtpMsg('A new code has been sent to your email.', true);
        _clearOtpInputs();
        setTimeout(() => { const d = $('cz-otp-0'); if (d) d.focus(); }, 50);
        startResendCooldown(60);
      } else {
        setOtpMsg(OTP_ERRORS[result.error] || 'Failed to send new code. Please try again.');
        if (resendBtn) resendBtn.disabled = false;
      }
    } catch (err) {
      console.error('[auth] Resend OTP error', err);
      setOtpMsg('Network error. Please try again.');
      if (resendBtn) resendBtn.disabled = false;
    }
  };

  /** Sign out — clears OTP state and Firebase session / Guest session */
  window.czSignOut = async function () {
    if (window._czIsSigningOut) return;
    window._czIsSigningOut = true;

    const isGuest = typeof window.czIsGuest === 'function' && window.czIsGuest();

    const mm = document.getElementById('overlay-main-menu');
    const isMMActive = mm && (mm.classList.contains('active') || mm.style.display === 'flex');
    const signoutBtn = document.getElementById('mm-signout-btn');
    const signoutLabel = signoutBtn ? signoutBtn.querySelector('.mm-signout-label') : null;

    if (isMMActive) {
      if (signoutBtn) signoutBtn.classList.add('is-signing-out');
      if (signoutLabel) signoutLabel.textContent = isGuest ? 'Logging out...' : 'Signing out...';
      if (mm) mm.classList.add('mm-signing-out');

      // Start smooth audio fade-out and cross-dissolve simultaneously
      const audioFade = (typeof fadeOutMMBgMusic === 'function')
        ? fadeOutMMBgMusic(380)
        : Promise.resolve();

      // Begin auth overlay reveal (cross-fading smoothly with main menu)
      enterAuthRequired();

      // Allow 380ms for the smooth visual dissolve and audio fade
      await Promise.all([
        audioFade,
        new Promise(r => setTimeout(r, 380))
      ]);

      if (mm) {
        mm.classList.remove('active');
        mm.classList.remove('mm-signing-out');
      }
      if (signoutBtn) signoutBtn.classList.remove('is-signing-out');
      if (signoutLabel) signoutLabel.textContent = isGuest ? 'Log out' : 'Sign out';
    } else {
      if (typeof stopMMBgMusic === 'function') stopMMBgMusic();
      enterAuthRequired();
    }

    if (isGuest) {
      try { sessionStorage.removeItem('cyberzero_guest_session'); } catch (e) {}
      window._czGuestSession = null;
      _clearGuestProgressAndRestoreBackup();
      updateChip(null);
      window._czIsSigningOut = false;
      console.log('[auth] Successfully logged out as guest.');
      return;
    }

    const user = auth && auth.currentUser;
    clearOtpVerified(user && user.uid);
    if (!auth) {
      if (typeof enterAuthRequired === 'function') enterAuthRequired();
      window._czIsSigningOut = false;
      return;
    }
    try {
      await auth.signOut();
    } catch (e) {
      console.error('[auth] Sign-out error', e);
      if (typeof enterAuthRequired === 'function') enterAuthRequired();
    } finally {
      window._czIsSigningOut = false;
    }
  };

  /** Alias for guest logout */
  window.czLogoutAsGuest = async function () {
    return window.czSignOut();
  };

  /* ── 14. Signed-in user bar on main menu (Top-Right Corner) ────────────
     Targets #mm-user-bar / #mm-user-name / #mm-user-avatar in index.html.
     The bar is inside #overlay-main-menu so it auto-hides with the menu.
     updateChip() is called by onAuthStateChanged; no observer needed.
  ─────────────────────────────────────────────────────────────────────*/
  function displayName(u) {
    if (!u) return '';
    return u.displayName || (u.email ? u.email.split('@')[0] : 'Agent');
  }

  function updateChip(u) {
    const bar         = document.getElementById('mm-user-bar');
    const avatarInner = document.querySelector('#mm-user-avatar .mm-avatar-inner');
    const signoutBtn  = document.getElementById('mm-signout-btn');
    const guestTag    = document.getElementById('mm-guest-tag');
    if (!bar) return;

    const isGuest = (u && u.isGuest) || (typeof window.czIsGuest === 'function' && window.czIsGuest());

    if (isGuest) {
      const guestInfo = (u && u.isGuest) ? u : (typeof window.czGetGuestUser === 'function' ? window.czGetGuestUser() : null);
      const guestName = (guestInfo && guestInfo.name) ? guestInfo.name : 'Guest';

      if (avatarInner) {
        avatarInner.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" style="color:#00f0ff;"><circle cx="12" cy="8" r="4" fill="currentColor"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/></svg>`;
      }
      // GUEST SESSION: Enable Log Out button for guest users
      if (signoutBtn) {
        signoutBtn.style.display = '';
        signoutBtn.removeAttribute('aria-hidden');
        signoutBtn.setAttribute('title', 'Log out as guest');
        signoutBtn.setAttribute('aria-label', 'Log out as guest');
        const signoutLabel = signoutBtn.querySelector('.mm-signout-label');
        if (signoutLabel) signoutLabel.textContent = 'Log out';
      }
      if (guestTag) {
        guestTag.style.display = 'inline-flex';
        guestTag.textContent = guestName;
        guestTag.setAttribute('title', 'Guest: ' + guestName + ' (Click to rename)');
      }
      bar.hidden = false;
      return;
    }

    // Registered user / Normal state:
    if (guestTag) guestTag.style.display = 'none';
    if (signoutBtn) {
      signoutBtn.style.display = '';
      signoutBtn.removeAttribute('aria-hidden');
      signoutBtn.setAttribute('title', 'Sign out');
      signoutBtn.setAttribute('aria-label', 'Sign out');
      const signoutLabel = signoutBtn.querySelector('.mm-signout-label');
      if (signoutLabel) signoutLabel.textContent = 'Sign out';
    }

    if (u) {
      // Inject photo into mm-avatar-inner if the user has one
      if (avatarInner && u.photoURL) {
        avatarInner.innerHTML = `<img src="${u.photoURL}" alt="" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" referrerpolicy="no-referrer">`;
      } else if (avatarInner) {
        avatarInner.innerHTML = `<svg width="26" height="26" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" fill="currentColor"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/></svg>`;
      }
      bar.hidden = false;
    } else {
      if (avatarInner) {
        avatarInner.innerHTML = `<svg width="26" height="26" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" fill="currentColor"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/></svg>`;
      }
      bar.hidden = false;
    }
  }

  /* ── 15. Gate: wrap mainMenuStart ───────────────────────────────────
     mainMenuStart is the START button on the main menu.
     We wrap it so it re-validates the session before proceeding.
     This prevents someone from calling mainMenuStart() from devtools.
  ─────────────────────────────────────────────────────────────────────*/
  const origStart = mainMenuStart;
  window.mainMenuStart = function () {
    authReady.then(() => {
      const user = auth && auth.currentUser;
      const isGuest = typeof window.czIsGuest === 'function' && window.czIsGuest();
      // Fully authenticated: Guest OR Google user AND (skip mode OR OTP verified)
      if (isGuest || (user && (otpSkip || isOtpVerified(user.uid)))) {
        origStart.apply(null, arguments);
      } else {
        // Kick back to auth
        const mm = document.getElementById('overlay-main-menu');
        if (mm) mm.classList.remove('active');
        if (!user) enterAuthRequired();
        else enterOtpRequired(user);
      }
    });
  };

  /* ── 16. Loading state: show overlay immediately while Firebase checks ── */
  if (typeof window.czIsGuest === 'function' && window.czIsGuest()) {
    const guestUser = window.czGetGuestUser();
    closeOverlay();
    updateChip(guestUser);
    if (typeof window._czLoadProgressAndShowMenu === 'function') {
      window._czLoadProgressAndShowMenu();
    } else if (typeof showMainMenu === 'function') {
      showMainMenu();
    }
  } else {
    // Ensure background sound is stopped and main menu is inactive during auth loading
    if (typeof stopMMBgMusic === 'function') stopMMBgMusic();
    const initMM = document.getElementById('overlay-main-menu');
    if (initMM) initMM.classList.remove('active');
    buildOverlay();
    root.classList.add('active', 'locked');
    setSub('Checking session…');
    showPanel('loading');
  }

})();
