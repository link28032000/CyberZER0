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

        <!-- ═ PANEL 1: Google Sign-In ═ -->
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

  function enterAuthenticated() {
    closeOverlay();
    updateChip(auth.currentUser);
    // Reveal main menu
    const mm = document.getElementById('overlay-main-menu');
    if (mm) mm.classList.add('active');
  }

  /* ── 12. onAuthStateChanged — single source of truth ── */
  if (auth) {
    auth.onAuthStateChanged(async user => {
      if (!initialCheckDone) {
        initialCheckDone = true;
        readyResolve();
      }

      if (!user) {
        // ── Signed out ──
        updateChip(null);
        // If main menu was visible, hide it
        const mm = document.getElementById('overlay-main-menu');
        if (mm) mm.classList.remove('active');
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
    openOverlay();
    setSub('Login unavailable');
    setProblem(setupProblem);
    showPanel('google');
  }

  /* ── 13. Public action functions (called from onclick) ── */

  /** Step 1: Google Sign-In */
  window.czSignInWithGoogle = async function () {
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

  /** Sign out — clears OTP state and Firebase session */
  window.czSignOut = async function () {
    if (!auth) return;
    const user = auth.currentUser;
    clearOtpVerified(user && user.uid);
    try {
      await auth.signOut();
      // onAuthStateChanged → enterAuthRequired()
    } catch (e) {
      console.error('[auth] Sign-out error', e);
    }
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
    const bar      = document.getElementById('mm-user-bar');
    const nameEl   = document.getElementById('mm-user-name');
    const avatarEl = document.getElementById('mm-user-avatar');
    if (!bar) return;

    if (u) {
      if (nameEl) nameEl.textContent = displayName(u);
      if (avatarEl) {
        avatarEl.innerHTML = u.photoURL
          ? `<img src="${u.photoURL}" alt="" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" referrerpolicy="no-referrer">`
          : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" fill="currentColor"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/></svg>`;
      }
      bar.hidden = false;
    } else {
      bar.hidden = true;
      if (nameEl) nameEl.textContent = '—';
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
      // Fully authenticated: Google user AND (skip mode OR OTP verified)
      if (user && (otpSkip || isOtpVerified(user.uid))) {
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
  // The main menu is already hidden (class="overlay" without "active").
  // Show auth overlay in loading state immediately.
  buildOverlay();
  root.classList.add('active', 'locked');
  setSub('Checking session…');
  showPanel('loading');

})();
