'use strict';
/* ═══════════════════════════════════════════════════════════
   FIREBASE CONFIG — CyberZerØ
   Loads after the Firebase compat SDK, before auth.js.
═══════════════════════════════════════════════════════════ */

// Set to false to bypass the login gate entirely (offline dev only).
const CYBERZERO_AUTH_REQUIRED = true;

// ── Firebase project credentials ──────────────────────────────────────
// The web apiKey is NOT a secret; access is controlled by Auth settings
// and Authorized Domains in the Firebase console.
const CYBERZERO_FIREBASE_CONFIG = {
  apiKey:     'AIzaSyASy2AmnSwTT9C49mGDIkxIPwhYB7feRfs',
  authDomain: 'cyberzero-b9af9.firebaseapp.com',
  projectId:  'cyberzero-b9af9',
  appId:      '1:1045412087738:web:c4491f40c81527fe41ff83'
};

// ── OTP Backend Endpoint ───────────────────────────────────────────────
// Set this to your Firebase Cloud Functions base URL once deployed.
// Example: 'https://us-central1-cyberzero-b9af9.cloudfunctions.net'
//
// Leave as null until the Cloud Functions are deployed.
const CYBERZERO_OTP_ENDPOINT = null; // FILL: set your Cloud Functions URL here

// ── OTP Skip Mode ─────────────────────────────────────────────────────
// true  → Google Sign-In alone grants access (OTP step is skipped).
//         Use this while the Cloud Functions backend is not yet deployed.
// false → OTP email verification is required after Google Sign-In.
//         Set to false once CYBERZERO_OTP_ENDPOINT is filled in above.
const CYBERZERO_OTP_SKIP = true; // ← set to false when backend is ready
