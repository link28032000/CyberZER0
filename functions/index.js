/**
 * CyberZerØ — OTP Email Verification Cloud Functions
 * ════════════════════════════════════════════════════════════════════
 *
 * Endpoints:
 *   POST /sendOtp   — Verifies Google ID token, generates 6-digit OTP,
 *                     stores hashed code in Firestore, sends email via Gmail.
 *   POST /verifyOtp — Verifies Google ID token + user-submitted code against
 *                     the stored hash. Returns ok:true on match.
 *
 * Security:
 *   • OTP is generated server-side using crypto.randomInt (CSPRNG)
 *   • Only the SHA-256 hash is stored in Firestore — the plaintext is never persisted
 *   • Code expires in 10 minutes
 *   • Max 5 incorrect attempts before lockout
 *   • Single-use: code is deleted from Firestore after successful verification
 *   • Clients receive only { ok: true/false } — never the code or hash
 *
 * Environment variables (set via Firebase Functions config):
 *   GMAIL_USER   — Gmail address to send from (e.g. yourapp@gmail.com)
 *   GMAIL_PASS   — Gmail App Password (NOT your main Gmail password)
 *
 * Setup:
 *   firebase functions:config:set gmail.user="you@gmail.com" gmail.pass="xxxx xxxx xxxx xxxx"
 *   firebase deploy --only functions,firestore
 * ════════════════════════════════════════════════════════════════════
 */

'use strict';

const functions  = require('firebase-functions');
const admin      = require('firebase-admin');
const crypto     = require('crypto');
const nodemailer = require('nodemailer');

admin.initializeApp();
const db = admin.firestore();

// ── CORS helper — only allow requests from your own domain ──────────
// Add your production domain here if needed (e.g. 'https://yourgame.web.app')
const ALLOWED_ORIGINS = [
  'http://localhost:5500',
  'http://localhost:3000',
  'http://127.0.0.1:5500',
  'http://127.0.0.1:3000',
  'https://cyberzero-b9af9.web.app',
  'https://cyberzero-b9af9.firebaseapp.com'
];

function setCors(req, res) {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.set('Access-Control-Allow-Origin', origin);
  }
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
}

// ── Nodemailer transporter (Gmail SMTP) ─────────────────────────────
function createTransporter() {
  const cfg = functions.config();
  const user = cfg.gmail && cfg.gmail.user;
  const pass = cfg.gmail && cfg.gmail.pass;

  if (!user || !pass) {
    throw new Error(
      'Gmail credentials not set. Run:\n' +
      '  firebase functions:config:set gmail.user="you@gmail.com" gmail.pass="your-app-password"'
    );
  }

  return nodemailer.createTransporter({
    service: 'gmail',
    auth: { user, pass }
  });
}

// ── OTP helpers ──────────────────────────────────────────────────────
const OTP_EXPIRY_MS  = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS   = 5;

function hashCode(code) {
  return crypto.createHash('sha256').update(code).digest('hex');
}

function generateOtp() {
  // crypto.randomInt is CSPRNG — safe for OTP generation
  return String(crypto.randomInt(100000, 999999));
}

function maskEmail(email) {
  if (!email || !email.includes('@')) return '···';
  const [local, domain] = email.split('@');
  const visible = local.length > 2 ? local[0] + '···' : local[0] + '·';
  return `${visible}@${domain}`;
}

// ── Email template ───────────────────────────────────────────────────
function buildEmailHtml(code, email) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#020c1b;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:480px;margin:40px auto;background:#08122e;border:1px solid rgba(0,229,255,0.2);border-radius:16px;overflow:hidden;">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#041026,#0d1b3e);padding:32px 32px 20px;text-align:center;border-bottom:1px solid rgba(0,229,255,0.15);">
      <div style="font-size:28px;font-weight:900;letter-spacing:4px;color:#ffffff;text-shadow:0 0 20px rgba(0,229,255,0.5);">
        CYBERZER<span style="color:#00e5ff;">Ø</span>
      </div>
      <div style="font-size:12px;letter-spacing:2px;color:rgba(0,229,255,0.6);margin-top:4px;text-transform:uppercase;">
        Cybersecurity Simulation
      </div>
    </div>

    <!-- Body -->
    <div style="padding:32px;">
      <p style="color:rgba(255,255,255,0.8);font-size:15px;margin:0 0 20px;">
        Your login verification code for <strong style="color:#00e5ff;">${maskEmail(email)}</strong>:
      </p>

      <!-- OTP Code Box -->
      <div style="text-align:center;margin:24px 0;">
        <div style="display:inline-block;background:#041026;border:2px solid rgba(0,229,255,0.4);border-radius:12px;padding:16px 36px;">
          <div style="font-size:42px;font-weight:900;letter-spacing:12px;color:#00e5ff;font-family:monospace;text-shadow:0 0 20px rgba(0,229,255,0.6);">
            ${code}
          </div>
        </div>
      </div>

      <p style="color:rgba(255,255,255,0.55);font-size:13px;margin:20px 0 0;text-align:center;">
        This code expires in <strong style="color:#ffffff;">10 minutes</strong>.<br>
        Do not share this code with anyone.
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#041026;padding:16px 32px;border-top:1px solid rgba(0,229,255,0.1);">
      <p style="color:rgba(255,255,255,0.3);font-size:11px;margin:0;text-align:center;">
        If you did not request this code, you can safely ignore this email.<br>
        CyberZerØ — Cybersecurity Simulation Game
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

// ════════════════════════════════════════════════════════════════════
// POST /sendOtp
// Body: { idToken: string }
// Returns: { ok: true } | { ok: false, error: string }
// ════════════════════════════════════════════════════════════════════
exports.sendOtp = functions.https.onRequest(async (req, res) => {
  setCors(req, res);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(204).send('');
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ ok: false, error: 'missing_token' });

    // 1. Verify Firebase ID token — confirms this is a real Google-authenticated user
    let decoded;
    try {
      decoded = await admin.auth().verifyIdToken(idToken);
    } catch (e) {
      console.error('[sendOtp] Invalid ID token:', e.message);
      return res.status(401).json({ ok: false, error: 'invalid_token' });
    }

    const uid   = decoded.uid;
    const email = decoded.email;

    if (!email) {
      return res.status(400).json({ ok: false, error: 'no_email' });
    }

    // 2. Rate-limit resend: check if an unexpired code was sent recently (< 60s ago)
    const existingDoc = await db.collection('otpCodes').doc(uid).get();
    if (existingDoc.exists) {
      const existing = existingDoc.data();
      const sentAt   = existing.sentAt || 0;
      const cooldown = 60 * 1000; // 60 seconds
      if (Date.now() - sentAt < cooldown) {
        const waitSec = Math.ceil((cooldown - (Date.now() - sentAt)) / 1000);
        return res.status(429).json({ ok: false, error: 'cooldown', waitSeconds: waitSec });
      }
    }

    // 3. Generate OTP — plaintext code is ONLY used here to email it and hash it
    const code = generateOtp();
    const hash = hashCode(code);

    // 4. Store ONLY the hash + metadata in Firestore — plaintext code is discarded
    await db.collection('otpCodes').doc(uid).set({
      hash,
      attempts: 0,
      sentAt:   Date.now(),
      expires:  Date.now() + OTP_EXPIRY_MS,
      email     // stored for audit/logging only
    });

    // 5. Send email with plaintext code
    const transporter = createTransporter();
    await transporter.sendMail({
      from:    `"CyberZerØ" <${functions.config().gmail.user}>`,
      to:      email,
      subject: `${code} — Your CyberZerØ Verification Code`,
      text:    `Your CyberZerØ verification code is: ${code}\n\nThis code expires in 10 minutes. Do not share it with anyone.`,
      html:    buildEmailHtml(code, email)
    });

    console.log(`[sendOtp] Code sent to ${maskEmail(email)} (uid: ${uid})`);

    // Plaintext code is now out of scope — never logged or stored
    return res.status(200).json({ ok: true });

  } catch (err) {
    console.error('[sendOtp] Unexpected error:', err);
    return res.status(500).json({ ok: false, error: 'server_error' });
  }
});


// ════════════════════════════════════════════════════════════════════
// POST /verifyOtp
// Body: { idToken: string, code: string }
// Returns: { ok: true } | { ok: false, error: 'invalid'|'expired'|'locked' }
// ════════════════════════════════════════════════════════════════════
exports.verifyOtp = functions.https.onRequest(async (req, res) => {
  setCors(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(204).send('');
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  try {
    const { idToken, code } = req.body;
    if (!idToken || !code) {
      return res.status(400).json({ ok: false, error: 'missing_params' });
    }

    // 1. Sanitize: code must be exactly 6 digits
    const sanitized = String(code).replace(/\D/g, '');
    if (sanitized.length !== 6) {
      return res.status(400).json({ ok: false, error: 'invalid' });
    }

    // 2. Verify Firebase ID token
    let decoded;
    try {
      decoded = await admin.auth().verifyIdToken(idToken);
    } catch (e) {
      console.error('[verifyOtp] Invalid ID token:', e.message);
      return res.status(401).json({ ok: false, error: 'invalid_token' });
    }

    const uid = decoded.uid;

    // 3. Fetch stored OTP record
    const docRef = db.collection('otpCodes').doc(uid);
    const doc    = await docRef.get();

    if (!doc.exists) {
      return res.status(200).json({ ok: false, error: 'expired' });
    }

    const { hash, attempts, expires } = doc.data();

    // 4. Check expiry
    if (Date.now() > expires) {
      await docRef.delete();
      return res.status(200).json({ ok: false, error: 'expired' });
    }

    // 5. Check attempt limit
    if (attempts >= MAX_ATTEMPTS) {
      return res.status(200).json({ ok: false, error: 'locked' });
    }

    // 6. Compare hash — timing-safe comparison
    const inputHash   = hashCode(sanitized);
    const storedBuf   = Buffer.from(hash, 'hex');
    const inputBuf    = Buffer.from(inputHash, 'hex');
    const isCorrect   = storedBuf.length === inputBuf.length &&
                        crypto.timingSafeEqual(storedBuf, inputBuf);

    if (!isCorrect) {
      // Increment attempt count
      await docRef.update({ attempts: admin.firestore.FieldValue.increment(1) });
      const remaining = MAX_ATTEMPTS - (attempts + 1);
      console.log(`[verifyOtp] Wrong code for uid ${uid}. Attempts remaining: ${remaining}`);
      return res.status(200).json({ ok: false, error: 'invalid', attemptsRemaining: remaining });
    }

    // 7. SUCCESS — delete the OTP record immediately (single-use)
    await docRef.delete();
    console.log(`[verifyOtp] OTP verified for uid: ${uid}`);
    return res.status(200).json({ ok: true });

  } catch (err) {
    console.error('[verifyOtp] Unexpected error:', err);
    return res.status(500).json({ ok: false, error: 'server_error' });
  }
});
