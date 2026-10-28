'use strict';

// Ad click handler — Northfield (last) site only
function handleFakeAdClick(adName) {
  if (typeof showToast === 'function') showToast('&#128680; FAKE AD: &ldquo;' + adName + '&rdquo; &mdash; Real phishing pages are packed with malicious ads. Never click them!', 'warning');
}

/* ────────────────────────────────────────────────
   Northfield-only: sidebar ads + casino popup
──────────────────────────────────────────────── */
var _NF_AD_STYLES = `<style>
  @keyframes ad-flash   { 0%,100%{opacity:1}50%{opacity:.5} }
  @keyframes ad-pulse   { 0%,100%{transform:scale(1)}50%{transform:scale(1.06)} }
  @keyframes ad-slidein { from{transform:translateY(60px);opacity:0}to{transform:translateY(0);opacity:1} }
  @keyframes ad-rainbow { 0%{background-position:0%}50%{background-position:100%}100%{background-position:0%} }
  @keyframes ad-spin    { from{transform:rotate(0deg)}to{transform:rotate(360deg)} }
  .nf-page-wrap  { display:flex; gap:10px; align-items:flex-start; padding:16px; }
  .nf-main-col   { flex:1; min-width:0; }
  .nf-ad-sidebar { width:152px; flex-shrink:0; display:flex; flex-direction:column; gap:8px; }
  .nf-ad { border-radius:7px; overflow:hidden; cursor:pointer; font-size:11px; font-weight:700;
           text-align:center; user-select:none; transition:transform .15s; }
  .nf-ad:hover { transform:scale(1.03); }
  .nf-ad-casino { background:linear-gradient(135deg,#0d0d0d,#1a0a00); border:2px solid #f59e0b; color:#fef3c7; padding:10px 6px; }
  .nf-ad-casino .adc { display:block;margin-top:5px;background:linear-gradient(90deg,#d97706,#f59e0b,#d97706);background-size:200%;animation:ad-rainbow 2s linear infinite;color:#000;padding:5px;border-radius:4px; }
  .nf-ad-app { background:linear-gradient(135deg,#0f172a,#1e3a5f); border:1px solid #3b82f6; color:#e0f2fe; padding:10px 6px; }
  .nf-ad-app .adv { background:#ef4444;color:#fff;border-radius:4px;padding:2px 6px;margin:4px 0;font-size:10px;animation:ad-flash .8s ease-in-out infinite; }
  .nf-ad-app .adc { display:block;background:#2563eb;color:#fff;padding:5px;border-radius:4px;margin-top:5px;animation:ad-pulse 1.5s ease-in-out infinite; }
  .nf-ad-prize { background:linear-gradient(135deg,#4c0070,#7c3aed); border:2px solid #a855f7; color:#f3e8ff; padding:10px 6px; }
  .nf-ad-prize .adi { font-size:20px;animation:ad-spin 3s linear infinite;display:inline-block; }
  .nf-ad-prize .adc { display:block;background:linear-gradient(90deg,#7c3aed,#ec4899,#7c3aed);background-size:200%;animation:ad-rainbow 2s linear infinite;color:#fff;padding:5px;border-radius:4px;margin-top:5px; }
  .nf-ad-crypto { background:linear-gradient(135deg,#052e16,#14532d); border:1px solid #22c55e; color:#dcfce7; padding:10px 6px; }
  .nf-ad-crypto .adp { font-size:15px;font-weight:900;color:#4ade80;animation:ad-flash 1.2s ease-in-out infinite; }
  .nf-ad-crypto .adc { display:block;background:#16a34a;color:#fff;padding:5px;border-radius:4px;margin-top:5px;animation:ad-pulse 2s ease-in-out infinite; }
  /* popup */
  .nf-popup-ad { display:none; position:fixed; top:50%; left:50%; transform:translate(-50%,-50%);
                 z-index:9999; background:#0d0d0d; border:3px solid #f59e0b; border-radius:12px;
                 padding:22px; width:260px; text-align:center; color:#fff;
                 box-shadow:0 0 40px rgba(245,158,11,.6); }
  .nf-popup-ad.visible { display:block; animation:ad-slidein .4s cubic-bezier(.34,1.56,.64,1) both; }
  .nf-popup-ad .pop-x { position:absolute;top:7px;right:12px;cursor:pointer;font-size:18px;color:#aaa;line-height:1; }
  .nf-popup-ad .pop-x:hover { color:#fff; }
  .nf-popup-ad .pop-t { font-size:15px;font-weight:900;color:#fbbf24;animation:ad-flash 1s ease-in-out infinite;margin-bottom:8px; }
  .nf-popup-ad .pop-c { display:block;margin-top:10px;background:linear-gradient(90deg,#d97706,#f59e0b,#d97706);background-size:200%;animation:ad-rainbow 2s linear infinite;color:#000;font-weight:900;padding:10px;border-radius:8px;font-size:14px;cursor:pointer; }
  .nf-overlay { display:none;position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:9998; }
  .nf-overlay.visible { display:block; }
</style>`;

var _NF_SIDEBAR = `
<div class="nf-ad-sidebar">
  <div class="nf-ad nf-ad-casino" onclick="handleFakeAdClick('Lucky Casino &#8369;50,000 Jackpot')">
    <div style="font-size:22px;animation:ad-flash 1s ease-in-out infinite;">&#127920;&#127920;&#127920;</div>
    <div style="font-size:12px;color:#fbbf24;animation:ad-flash 1s ease-in-out infinite;">LUCKY CASINO</div>
    <div style="font-size:10px;color:#fde68a;">&#8369;50,000 JACKPOT</div>
    <span class="adc">&#9658; SPIN NOW</span>
  </div>
  <div class="nf-ad nf-ad-app" onclick="handleFakeAdClick('17 Viruses Detected! Clean Now')">
    <div style="font-size:22px;animation:ad-pulse 2s ease-in-out infinite;">&#128241;</div>
    <div class="adv">&#9888; 17 VIRUSES!</div>
    <div style="font-size:10px;color:#93c5fd;">Phone at risk!</div>
    <span class="adc">&#128640; Clean FREE</span>
  </div>
  <div class="nf-ad nf-ad-prize" onclick="handleFakeAdClick('You Are Visitor 1,000,000!')">
    <div class="adi">&#127881;</div>
    <div style="font-size:12px;font-weight:900;color:#f0abfc;">YOU WON!</div>
    <div style="font-size:10px;">#1,000,000 Visitor</div>
    <span class="adc">CLAIM PRIZE</span>
  </div>
  <div class="nf-ad nf-ad-crypto" onclick="handleFakeAdClick('Bitcoin +2400% Invest Now')">
    <div style="font-size:11px;color:#86efac;">&#129689; CRYPTO ALERT</div>
    <div class="adp">+2,400%</div>
    <div style="font-size:10px;color:#bbf7d0;">Bitcoin x10!</div>
    <span class="adc">INVEST &#8369;500</span>
  </div>
  <div class="nf-ad nf-ad-casino" onclick="handleFakeAdClick('Sabong Live Bet Now')" style="background:linear-gradient(135deg,#1a0000,#3b0000);border-color:#ef4444;">
    <div style="font-size:20px;animation:ad-flash .6s ease-in-out infinite;">&#127953;</div>
    <div style="font-size:12px;color:#fca5a5;font-weight:900;">SABONG LIVE</div>
    <div style="font-size:10px;color:#fecaca;">LIVE matches!</div>
    <span class="adc" style="background:linear-gradient(90deg,#dc2626,#ef4444,#dc2626);color:#fff;">&#9654; BET NOW</span>
  </div>
  <div class="nf-ad nf-ad-app" onclick="handleFakeAdClick('Fast Loan &#8369;20,000 in 5 Min')" style="background:linear-gradient(135deg,#0c0a1e,#1e1b4b);border-color:#818cf8;">
    <div style="font-size:20px;">&#128178;</div>
    <div style="font-size:12px;color:#a5b4fc;font-weight:900;">FAST LOAN</div>
    <div style="font-size:10px;color:#c7d2fe;">&#8369;20,000 in 5min!</div>
    <span class="adc" style="background:#4f46e5;color:#fff;animation:ad-pulse 1.5s ease-in-out infinite;">APPLY &rarr;</span>
  </div>
</div>`;

var _NF_POPUP = `
<div class="nf-overlay" id="nf-ov" onclick="this.classList.remove('visible');document.getElementById('nf-pop').classList.remove('visible');"></div>
<div class="nf-popup-ad" id="nf-pop">
  <span class="pop-x" onclick="document.getElementById('nf-ov').classList.remove('visible');this.parentElement.classList.remove('visible');">&#10005;</span>
  <div style="font-size:28px;animation:ad-spin 3s linear infinite;display:inline-block;">&#127920;</div>
  <div class="pop-t">&#127381; YOU ARE WINNER! &#127381;</div>
  <div style="font-size:12px;color:#fde68a;margin-bottom:6px;">Spin &amp; win up to<br><strong style="font-size:18px;color:#fbbf24;">&#8369;1,000,000</strong></div>
  <div style="font-size:10px;color:#aaa;">Expires in <span id="nf-ptimer" style="color:#f87171;font-weight:900;">04:59</span></div>
  <span class="pop-c" onclick="handleFakeAdClick('Casino Wheel &#8369;1,000,000')">&#9658; SPIN THE WHEEL NOW &#9656;</span>
</div>
<script>
(function(){
  setTimeout(function(){
    var p=document.getElementById('nf-pop'),o=document.getElementById('nf-ov');
    if(p){p.classList.add('visible');o.classList.add('visible');}
    var t=document.getElementById('nf-ptimer'),s=299;
    if(!t)return;
    var iv=setInterval(function(){
      s--;if(s<=0){clearInterval(iv);return;}
      var m=Math.floor(s/60),sec=s%60;
      t.textContent=(m<10?'0':'')+m+':'+(sec<10?'0':'')+sec;
    },1000);
  },1800);
})();
</script>`;

/* ═══════════════════════════════════════════════════════════
   FAKE SITES — each styled exactly like the real site
═══════════════════════════════════════════════════════════ */
const FAKE_SITES = {

/* ─── 1. PayPal prize phishing ─────────────────────────── */
'https://paypa1.com/claim-reward': `
<style>
  .pp-page { min-height:100%; background:#f5f7fa; display:flex; flex-direction:column;
             align-items:center; justify-content:flex-start; padding:40px 16px 24px;
             font-family:'Helvetica Neue',Arial,sans-serif; box-sizing:border-box; }
  .pp-card { background:#fff; border:1px solid #dde0e4; border-radius:6px; width:100%;
             max-width:460px; padding:32px 40px 28px; box-sizing:border-box;
             box-shadow:0 2px 10px rgba(0,0,0,.06); }
  .pp-logo { display:flex; align-items:center; justify-content:center; gap:10px; margin-bottom:24px; }
  .pp-p-mark { width:34px; height:34px; }
  .pp-wordmark { font-size:26px; font-weight:700; color:#003087; letter-spacing:-.5px; font-family:'Arial Black',Arial,sans-serif; }
  .pp-wordmark span { color:#009cde; }
  .pp-prize-badge { background:#e6f4ea; border:1px solid #34a853; border-radius:20px;
                    color:#1e7e34; font-size:12px; font-weight:700; padding:5px 16px;
                    text-align:center; margin-bottom:20px; }
  .pp-field { margin-bottom:14px; }
  .pp-field input { width:100%; padding:12px 14px; border:1.5px solid #cbd0d8; border-radius:5px;
                    font-size:15px; box-sizing:border-box; outline:none; color:#1c2127;
                    font-family:inherit; transition:border-color .2s, box-shadow .2s; }
  .pp-field input:focus { border-color:#0070ba; box-shadow:0 0 0 2px rgba(0,112,186,.18); }
  .pp-field input.filled { background:#eef3fb; border-color:#afc8e8; }
  .pp-btn-primary { width:100%; background:#0070ba; color:#fff; border:none; border-radius:25px;
                    padding:14px; font-size:16px; font-weight:700; cursor:pointer;
                    font-family:inherit; margin-top:4px; letter-spacing:.3px; }
  .pp-btn-primary:hover { background:#005ea6; }
  .pp-trouble { display:block; text-align:center; color:#0070ba; font-size:13px;
                text-decoration:none; margin:14px 0; }
  .pp-trouble:hover { text-decoration:underline; }
  .pp-divider { display:flex; align-items:center; gap:10px; margin:6px 0 14px; }
  .pp-divider hr { flex:1; border:none; border-top:1px solid #dde0e4; }
  .pp-divider span { font-size:13px; color:#8a8a8a; }
  .pp-btn-secondary { width:100%; background:#f5f7fa; color:#2c2e2f; border:1.5px solid #cbd0d8;
                      border-radius:25px; padding:13px; font-size:15px; font-weight:700;
                      cursor:pointer; font-family:inherit; }
  .pp-btn-secondary:hover { background:#eef0f3; }
  .pp-footer { margin-top:20px; text-align:center; font-size:11px; color:#9da3ae; }
  .pp-footer a { color:#0070ba; text-decoration:none; }
</style>
<div class="fakesite" style="background:#f5f7fa;">
  <div class="phish-sim-banner">
    <span class="phish-banner-icon">&#128680;</span>
    <span class="phish-banner-text">URL bar shows <code>paypa1.com</code> &mdash; digit &ldquo;1&rdquo; faking letter &ldquo;l&rdquo;! Real PayPal = <code>paypal.com</code>.</span>
  </div>
  <div class="pp-page">
    <div class="pp-card">
      <div class="pp-logo">
        <svg class="pp-p-mark" viewBox="0 0 24 24" fill="none">
          <path d="M7.5 21H4.5L7 6h5.5c2.5 0 4 1.2 4 3.5 0 3.5-2.5 5-5.5 5H9.5L7.5 21z" fill="#009cde"/>
          <path d="M10 17H7L9.5 2h5.5c2.5 0 4 1.2 4 3.5 0 3.5-2.5 5-5.5 5H12L10 17z" fill="#003087"/>
        </svg>
        <span class="pp-wordmark">Pay<span>Pal</span></span>
      </div>
      <div class="pp-prize-badge">&#127873; &#8369;1,000,000 Prize &mdash; Confirm your identity to claim</div>
      <form onsubmit="event.preventDefault(); handlePhishingSubmit('paypa1.com','PayPal');">
        <div class="pp-field">
          <input type="text" id="pp1-email" placeholder="Email or mobile number" required autocomplete="off" />
        </div>
        <div class="pp-field">
          <input type="password" id="pp1-pass" class="filled" placeholder="Password" required autocomplete="off" />
        </div>
        <button type="submit" class="pp-btn-primary">Log In</button>
      </form>
      <a href="#" class="pp-trouble" onclick="event.preventDefault(); showToast('&#9888;&#65039; Fake link.','warning');">Having trouble logging in?</a>
      <div class="pp-divider"><hr /><span>or</span><hr /></div>
      <button type="button" class="pp-btn-secondary" onclick="showToast('&#9888;&#65039; Fake link.','warning');">Sign Up</button>
    </div>
    <div class="pp-footer">
      <a href="#" onclick="event.preventDefault();">Privacy</a> &nbsp;&bull;&nbsp;
      <a href="#" onclick="event.preventDefault();">Legal</a> &nbsp;&bull;&nbsp;
      <a href="#" onclick="event.preventDefault();">Contact</a><br/>
      &copy; 1999&ndash;2026 PayPal, Inc. All rights reserved.
    </div>
  </div>
</div>`,

/* ─── 2. Corporate SSO phishing ─────────────────────────── */
'https://business-account-verify.net/login': `
<style>
  @keyframes scan-bar { 0%{top:0%}100%{top:100%} }
  @keyframes urg-blink { 0%,100%{background:#7f1d1d}50%{background:#b91c1c} }
  @keyframes corp-in { from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)} }
  .corp-page { min-height:100%; background:#0f172a; display:flex; flex-direction:column;
               font-family:'Segoe UI',Arial,sans-serif; }
  .corp-topbar { background:#1e293b; border-bottom:1px solid #334155; padding:14px 24px;
                 display:flex; align-items:center; gap:12px; position:relative; overflow:hidden; }
  .corp-scan { position:absolute; left:0; width:100%; height:2px; background:rgba(239,68,68,.7);
               animation:scan-bar 2.5s linear infinite; pointer-events:none; }
  .corp-logo { font-size:17px; font-weight:800; color:#f1f5f9; }
  .corp-badge { background:#1d4ed8; color:#bfdbfe; font-size:10px; font-weight:700;
                padding:2px 10px; border-radius:20px; }
  .corp-body { flex:1; display:flex; align-items:center; justify-content:center; padding:30px 16px; }
  .corp-card { background:#1e293b; border:1px solid #334155; border-radius:10px; width:100%;
               max-width:400px; padding:32px 28px; box-shadow:0 8px 32px rgba(0,0,0,.4);
               animation:corp-in .45s cubic-bezier(.34,1.56,.64,1) both; }
  .corp-card h2 { color:#f1f5f9; font-size:20px; margin:0 0 4px 0; }
  .corp-sub { font-size:12px; color:#64748b; margin:0 0 16px 0; }
  .corp-urg { animation:urg-blink 1.2s ease-in-out infinite; border-radius:7px;
              padding:10px 14px; color:#fff; font-size:12px; font-weight:700; margin-bottom:16px; }
  .corp-field { margin-bottom:13px; }
  .corp-field label { display:block; font-size:11px; color:#94a3b8; font-weight:600;
                      text-transform:uppercase; letter-spacing:.5px; margin-bottom:5px; }
  .corp-field input { width:100%; padding:11px 14px; background:#0f172a; border:1.5px solid #334155;
                      border-radius:7px; font-size:14px; color:#f1f5f9; box-sizing:border-box; outline:none; }
  .corp-field input:focus { border-color:#3b82f6; box-shadow:0 0 0 3px rgba(59,130,246,.2); }
  .corp-field input::placeholder { color:#475569; }
  .corp-row { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; font-size:12px; }
  .corp-submit { width:100%; background:linear-gradient(90deg,#1d4ed8,#2563eb); color:#fff;
                 border:none; padding:12px; border-radius:7px; font-size:14px; font-weight:700; cursor:pointer; }
  .corp-submit:hover { background:linear-gradient(90deg,#1e40af,#1d4ed8); }
  .corp-note { margin-top:14px; text-align:center; font-size:11px; color:#475569; }
  .corp-footer { background:#0a0f1a; border-top:1px solid #1e293b; padding:12px 24px;
                 text-align:center; font-size:11px; color:#475569; }
</style>
<div class="fakesite" style="background:#0f172a;">
  <div class="phish-sim-banner">
    <span class="phish-banner-icon">&#128680;</span>
    <span class="phish-banner-text">URL <code>business-account-verify.net</code> is NOT <code>business.com</code> &mdash; fake corporate phishing portal!</span>
  </div>
  <div class="corp-page">
    <div class="corp-topbar">
      <div class="corp-scan"></div>
      <span class="corp-logo">&#127970; Business Inc.</span>
      <span class="corp-badge">ENTERPRISE SSO</span>
    </div>
    <div class="corp-body">
      <div class="corp-card">
        <h2>Single Sign-On</h2>
        <p class="corp-sub">Identity &amp; Access Management Portal</p>
        <div class="corp-urg">&#9888;&#65039; <strong>URGENT:</strong> Account locked. Verify within 30 minutes to prevent permanent suspension.</div>
        <form onsubmit="event.preventDefault(); handlePhishingSubmit('business-account-verify.net','Business Inc. SSO');">
          <div class="corp-field"><label for="c-user">Corporate Email or Employee ID</label>
            <input type="text" id="c-user" placeholder="user@business.com" required autocomplete="off" /></div>
          <div class="corp-field"><label for="c-pass">Work Password</label>
            <input type="password" id="c-pass" placeholder="Enter password" required autocomplete="off" /></div>
          <div class="corp-field"><label for="c-pin">Security Token / PIN</label>
            <input type="password" id="c-pin" placeholder="6-digit PIN" maxlength="6" autocomplete="off" /></div>
          <div class="corp-row">
            <label style="display:flex;align-items:center;gap:6px;color:#94a3b8;"><input type="checkbox" checked /> Stay authenticated</label>
            <a href="#" onclick="event.preventDefault(); showToast('&#9888;&#65039; Fake link.','warning');" style="color:#60a5fa;text-decoration:none;font-size:12px;">Forgot password?</a>
          </div>
          <button type="submit" class="corp-submit">Verify Identity &amp; Restore Access</button>
        </form>
        <div class="corp-note">&#128274; Enterprise MFA Protected &bull; ISO 27001 Certified</div>
      </div>
    </div>
    <div class="corp-footer">&copy; 2026 Business Inc. Global IT &amp; Information Security Systems.</div>
  </div>
</div>`,

/* ─── 3. Microsoft phishing — matches the screenshot exactly ─── */
'https://m1crosoft-account-verify.com/signin': `
<style>
  @keyframes ms-in   { from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)} }
  @keyframes ms-prog { 0%{width:0%}55%{width:80%}100%{width:100%} }
  .ms-page { min-height:100%; display:flex; flex-direction:column; align-items:stretch;
             background:linear-gradient(135deg,#f3d9d5 0%,#dce8f5 30%,#d5ecd5 60%,#f0e6d0 100%);
             font-family:'Segoe UI',system-ui,Arial,sans-serif; }
  .ms-main { flex:1; display:flex; flex-direction:column; align-items:center;
             justify-content:center; padding:24px 16px; gap:10px; }
  .ms-card { background:#fff; width:100%; max-width:460px; padding:44px 44px 36px;
             box-sizing:border-box; box-shadow:0 2px 16px rgba(0,0,0,.12);
             animation:ms-in .4s cubic-bezier(.34,1.56,.64,1) both; }
  .ms-logo-row { display:flex; align-items:center; gap:10px; margin-bottom:20px; }
  .ms-logo-grid { display:grid; grid-template-columns:1fr 1fr; gap:3px; width:21px; height:21px; }
  .ms-logo-grid span { border-radius:1px; display:block; }
  .ms-brand { font-size:18px; font-weight:600; color:#1b1b1b; }
  .ms-progress { height:2px; background:#e0e0e0; margin-bottom:24px; overflow:hidden; border-radius:2px; }
  .ms-pb { height:100%; background:#0067b8; animation:ms-prog 2s ease-out forwards; border-radius:2px; }
  .ms-warn { border:1px solid #ffb900; background:#fffbe6; border-radius:2px; padding:10px 12px;
             font-size:12px; color:#7a4a00; margin-bottom:20px; }
  .ms-card h1 { font-size:26px; font-weight:600; color:#1b1b1b; margin:0 0 20px 0; letter-spacing:-.3px; }
  .ms-field { margin-bottom:8px; position:relative; }
  .ms-field input { width:100%; padding:10px 0 8px; border:none; border-bottom:1.5px solid #999;
                    font-size:15px; box-sizing:border-box; outline:none; background:transparent;
                    color:#1b1b1b; font-family:inherit; }
  .ms-field input:focus { border-bottom:2px solid #0067b8; }
  .ms-field input::placeholder { color:#767676; font-size:14px; }
  .ms-links { margin:18px 0 24px; }
  .ms-links a { display:block; font-size:13px; color:#0067b8; text-decoration:none; margin-bottom:10px; }
  .ms-links a:hover { text-decoration:underline; }
  .ms-links p { font-size:13px; color:#1b1b1b; margin:0 0 6px; }
  .ms-btn-row { display:flex; justify-content:flex-end; }
  .ms-next { background:#0067b8; color:#fff; border:none; padding:8px 22px; font-size:15px;
             cursor:pointer; font-family:inherit; min-width:108px; }
  .ms-next:hover { background:#005a9e; }
  .ms-options-card { background:#fff; width:100%; max-width:460px; padding:16px 22px;
                     box-sizing:border-box; box-shadow:0 2px 10px rgba(0,0,0,.1);
                     display:flex; align-items:center; gap:14px; cursor:pointer;
                     font-size:14px; color:#1b1b1b; }
  .ms-options-card:hover { background:#f3f3f3; }
  .ms-key-icon { font-size:22px; opacity:.7; }
  .ms-footer { display:flex; gap:20px; justify-content:flex-end; padding:14px 20px 16px;
               font-size:12px; }
  .ms-footer a { color:#0067b8; text-decoration:none; }
  .ms-footer a:hover { text-decoration:underline; }
</style>
<div class="fakesite" style="background:linear-gradient(135deg,#f3d9d5 0%,#dce8f5 30%,#d5ecd5 60%,#f0e6d0 100%);">
  <div class="phish-sim-banner">
    <span class="phish-banner-icon">&#128680;</span>
    <span class="phish-banner-text">URL <code>m1crosoft-account-verify.com</code> uses digit &ldquo;1&rdquo; not letter &ldquo;i&rdquo;! Real Microsoft = <code>microsoft.com</code>.</span>
  </div>
  <div class="ms-page">
    <div class="ms-main">
      <div class="ms-card">
        <div class="ms-logo-row">
          <div class="ms-logo-grid">
            <span style="background:#f25022;"></span><span style="background:#7fba00;"></span>
            <span style="background:#00a4ef;"></span><span style="background:#ffb900;"></span>
          </div>
          <span class="ms-brand">Microsoft</span>
        </div>
        <div class="ms-progress"><div class="ms-pb"></div></div>
        <div class="ms-warn">&#9888; <strong>Unusual sign-in detected.</strong> Verify your credentials within 60 minutes to prevent lockout.</div>
        <h1>Sign in</h1>
        <form onsubmit="event.preventDefault(); handlePhishingSubmit('m1crosoft-account-verify.com','Microsoft 365');">
          <div class="ms-field">
            <input type="text" id="ms-email" placeholder="Email, phone, or Skype" required autocomplete="off" />
          </div>
          <div class="ms-field" style="margin-top:14px;">
            <input type="password" id="ms-pwd" placeholder="Password" required autocomplete="off" />
          </div>
          <div class="ms-links">
            <p>No account? <a href="#" onclick="event.preventDefault(); showToast('&#9888;&#65039; Fake link.','warning');">Create one!</a></p>
            <a href="#" onclick="event.preventDefault(); showToast('&#9888;&#65039; Fake link.','warning');">Can&rsquo;t access your account?</a>
          </div>
          <div class="ms-btn-row">
            <button type="submit" class="ms-next">Next</button>
          </div>
        </form>
      </div>
      <div class="ms-options-card" onclick="showToast('&#9888;&#65039; Fake link.','warning');">
        <span class="ms-key-icon">&#128273;</span>
        <span>Sign-in options</span>
      </div>
    </div>
    <div class="ms-footer">
      <a href="#" onclick="event.preventDefault();">Terms of use</a>
      <a href="#" onclick="event.preventDefault();">Privacy &amp; cookies</a>
      <a href="#" onclick="event.preventDefault();">...</a>
    </div>
  </div>
</div>`,

/* --- 4. BPI phishing (via bankng-secure-verify.xyz) --- */
'https://bankng-secure-verify.xyz/restore': `
<style>
  @keyframes bk-in    { from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)} }
  @keyframes bk-timer { 0%,100%{color:#fca5a5}50%{color:#ef4444;text-shadow:0 0 8px rgba(239,68,68,.8)} }
  @keyframes bk-badge { 0%,100%{opacity:1}50%{opacity:.4} }
  @keyframes bk-btn   { 0%,100%{filter:brightness(1)}50%{filter:brightness(1.12)} }
  .bk-page { min-height:100%; background:#f5f5f5; display:flex; flex-direction:column; font-family:Arial,sans-serif; }
  .bk-alert { background:#b91c1c; padding:9px 24px; display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
  .bk-badge { background:#fef2f2; color:#b91c1c; font-size:10px; font-weight:900; padding:2px 10px; border-radius:20px; animation:bk-badge 1.5s ease-in-out infinite; white-space:nowrap; }
  .bk-alert-text { color:#fff; font-size:12px; font-weight:700; flex:1; }
  .bk-timer { background:rgba(0,0,0,.35); font-size:12px; font-weight:800; font-family:monospace; padding:3px 12px; border-radius:20px; white-space:nowrap; animation:bk-timer 1s ease-in-out infinite; }
  .bk-body { flex:1; display:flex; align-items:flex-start; justify-content:center; padding:28px 16px; }
  .bk-card { background:#fff; border-radius:4px; box-shadow:0 2px 16px rgba(0,0,0,.14); width:100%; max-width:400px; overflow:hidden; animation:bk-in .45s cubic-bezier(.34,1.56,.64,1) both; }
  .bk-card-hd { background:linear-gradient(90deg,#8a0011,#b3001b); padding:18px 22px; }
  .bk-card-hd h2 { margin:0 0 3px; font-size:17px; color:#fff; }
  .bk-card-hd p  { margin:0; font-size:11px; color:rgba(255,255,255,.75); }
  .bk-card-bd { padding:20px 22px; }
  .bk-ref { background:#f1f5f9; border-radius:6px; padding:10px 12px; font-size:11px; color:#475569; margin-bottom:14px; line-height:1.8; font-family:monospace; }
  .bk-field { margin-bottom:13px; }
  .bk-field label { display:block; font-size:12px; color:#374151; font-weight:700; margin-bottom:5px; }
  .bk-field input { width:100%; padding:10px 12px; border:1px solid #d1d5db; border-radius:3px; font-size:14px; box-sizing:border-box; outline:none; }
  .bk-field input:focus { border-color:#8a0011; box-shadow:0 0 0 2px rgba(138,0,17,.12); }
  .bk-row { display:flex; align-items:center; justify-content:space-between; margin-bottom:14px; font-size:12px; }
  .bk-submit { width:100%; background:linear-gradient(90deg,#8a0011,#b3001b); color:#fff; border:none; padding:12px; border-radius:3px; font-size:14px; font-weight:700; cursor:pointer; animation:bk-btn 2s ease-in-out infinite; }
  .bk-submit:hover { background:linear-gradient(90deg,#6d000d,#8a0011); }
  .bk-sec { display:flex; align-items:center; justify-content:center; gap:6px; margin-top:12px; font-size:11px; color:#6b7280; }
  .bk-footer { background:#1a1a1a; padding:14px 24px; text-align:center; font-size:11px; color:#9ca3af; }
  .bk-footer a { color:#d4a0a0; text-decoration:none; margin:0 6px; }
</style>
<div class="fakesite" style="background:#f5f5f5;">
  <div class="phish-sim-banner">
    <span class="phish-banner-icon">&#128680;</span>
    <span class="phish-banner-text">URL <code>bankng-secure-verify.xyz</code> is NOT <code>bpi.com.ph</code> &mdash; misspelled domain &amp; fake <code>.xyz</code> TLD!</span>
  </div>
  <div class="bk-page">
    <header style="background:linear-gradient(90deg,#8a0011,#b3001b);padding:0 24px;height:64px;display:flex;align-items:center;justify-content:space-between;box-shadow:0 2px 12px rgba(138,0,17,.4);">
      <div style="display:flex;align-items:center;gap:10px;">
        <div style="background:#fff;color:#8a0011;width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:900;flex-shrink:0;">B</div>
        <div><div style="color:#fff;font-size:20px;font-weight:900;letter-spacing:1px;">BPI Online</div><div style="color:rgba(255,255,255,.7);font-size:10px;letter-spacing:.5px;">BANK OF THE PHILIPPINE ISLANDS</div></div>
      </div>
      <nav style="display:flex;gap:16px;">
        <a href="#" onclick="event.preventDefault();" style="color:rgba(255,255,255,.8);font-size:12px;text-decoration:none;">Personal</a>
        <a href="#" onclick="event.preventDefault();" style="color:rgba(255,255,255,.8);font-size:12px;text-decoration:none;">Business</a>
        <a href="#" onclick="event.preventDefault();" style="color:rgba(255,255,255,.8);font-size:12px;text-decoration:none;">Help</a>
      </nav>
    </header>
    <div class="bk-alert">
      <span class="bk-badge">&#9888; INCIDENT REF: BPI-SEC-2026-10-99214</span>
      <span class="bk-alert-text">BPI Account SUSPENDED &mdash; Immediate verification required.</span>
      <span class="bk-timer" id="bankng-countdown">14:59</span>
    </div>
    <div class="bk-body">
      <div class="bk-card">
        <div class="bk-card-hd"><h2>BPI Account Restoration Portal</h2><p>Emergency Identity Verification &mdash; BSP Supervised</p></div>
        <div class="bk-card-bd">
          <div class="bk-ref">Detected: Unauthorized access &mdash; Unrecognized device<br/>Location: Outside Philippines (IP flagged)<br/>Status: <strong style="color:#b91c1c;">ACCOUNT SUSPENDED</strong></div>
          <form onsubmit="event.preventDefault(); handlePhishingSubmit('bankng-secure-verify.xyz','BPI Online');">
            <div class="bk-field"><label for="bk-user">BPI Online Username / User ID</label><input type="text" id="bk-user" placeholder="Enter username" required autocomplete="off" /></div>
            <div class="bk-field"><label for="bk-acc">16-Digit Account / Card Number</label><input type="text" id="bk-acc" placeholder="XXXX XXXX XXXX XXXX" maxlength="19" required autocomplete="off" /></div>
            <div class="bk-field"><label for="bk-pin">ATM PIN / Internet Banking Password</label><input type="password" id="bk-pin" placeholder="Enter PIN or password" required autocomplete="off" /></div>
            <div class="bk-field"><label for="bk-ssn">Mother's Maiden Name (Security Verification)</label><input type="text" id="bk-ssn" placeholder="Enter maiden name" required autocomplete="off" /></div>
            <div class="bk-row">
              <label style="display:flex;align-items:center;gap:6px;color:#374151;"><input type="checkbox" checked /> Stay logged in</label>
              <a href="#" onclick="event.preventDefault(); showToast('&#9888;&#65039; Fake link.','warning');" style="color:#8a0011;text-decoration:none;">Forgot Password?</a>
            </div>
            <button type="submit" class="bk-submit">Restore My BPI Account Now</button>
          </form>
          <div class="bk-sec">&#128274; 256-bit SSL Encrypted &bull; BSP Regulated &bull; Verified Secure</div>
        </div>
      </div>
    </div>
    <div class="bk-footer"><div><a href="#" onclick="event.preventDefault();">Privacy Policy</a><a href="#" onclick="event.preventDefault();">Terms of Use</a><a href="#" onclick="event.preventDefault();">Security</a></div><div style="margin-top:5px;">&copy; 2026 Bank of the Philippine Islands. Regulated by the Bangko Sentral ng Pilipinas (BSP).</div></div>
  </div>
</div>
<script>
(function(){
  var el=document.getElementById('bankng-countdown');
  if(!el)return;
  var s=14*60+59,iv=setInterval(function(){
    s--;if(s<=0){clearInterval(iv);el.textContent='00:00';return;}
    var m=Math.floor(s/60),sec=s%60;
    el.textContent=(m<10?'0':'')+m+':'+(sec<10?'0':'')+sec;
  },1000);
})();
</script>`,

/* ─── 5. IT Compliance phishing ─────────────────────────── */
'https://business-it-support.com/compliance-portal': `
<style>
  @keyframes it-in   { from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)} }
  @keyframes it-prog { 0%{width:5%}70%{width:90%}85%{width:75%}100%{width:100%} }
  @keyframes it-pill { 0%,100%{background:#1e3a5f;color:#60a5fa}50%{background:#1d4ed8;color:#fff} }
  @keyframes it-dead { 0%,100%{color:#dc2626}50%{color:#f87171} }
  .it-page { min-height:100%; background:#f8fafc; display:flex; flex-direction:column;
             font-family:'Segoe UI',Arial,sans-serif; }
  .it-header { background:linear-gradient(90deg,#0f172a,#1e293b); padding:0 24px; height:56px;
               display:flex; align-items:center; justify-content:space-between; border-bottom:2px solid #0369a1; }
  .it-logo { color:#f1f5f9; font-size:15px; font-weight:700; display:flex; align-items:center; gap:8px; }
  .it-logo-b { background:#0369a1; color:#fff; font-size:10px; padding:2px 8px; border-radius:4px; }
  .it-sub { color:#94a3b8; font-size:11px; }
  .it-body { flex:1; display:flex; align-items:flex-start; justify-content:center; padding:28px 16px; }
  .it-card { background:#fff; border:1px solid #e2e8f0; border-radius:10px; width:100%;
             max-width:460px; overflow:hidden; box-shadow:0 4px 16px rgba(0,0,0,.07);
             animation:it-in .45s cubic-bezier(.34,1.56,.64,1) both; }
  .it-card-top { background:linear-gradient(90deg,#0f172a,#1e293b); padding:18px 24px; }
  .it-pill { animation:it-pill 2s ease-in-out infinite; padding:3px 12px; border-radius:20px;
             font-size:10px; font-weight:800; letter-spacing:.8px; display:inline-block; margin-bottom:8px; }
  .it-card-top h2 { color:#f1f5f9; font-size:17px; margin:0 0 3px 0; }
  .it-card-top p  { color:#94a3b8; font-size:12px; margin:0; }
  .it-bar { height:3px; background:#334155; overflow:hidden; }
  .it-bar-fill { height:100%; background:linear-gradient(90deg,#0369a1,#0ea5e9); animation:it-prog 3s ease-in-out forwards; }
  .it-card-body { padding:22px 24px; }
  .it-dead { animation:it-dead 1s ease-in-out infinite; font-weight:700; }
  .it-field { margin-bottom:13px; }
  .it-field label { display:block; font-size:11px; color:#64748b; font-weight:600;
                    text-transform:uppercase; letter-spacing:.4px; margin-bottom:5px; }
  .it-field input { width:100%; padding:10px 14px; border:1.5px solid #e2e8f0; border-radius:6px;
                    font-size:14px; color:#1e293b; box-sizing:border-box; outline:none; }
  .it-field input:focus { border-color:#0369a1; box-shadow:0 0 0 3px rgba(3,105,161,.1); }
  .it-submit { width:100%; background:linear-gradient(90deg,#0369a1,#0284c7); color:#fff;
               border:none; padding:12px; border-radius:6px; font-size:14px; font-weight:700; cursor:pointer; }
  .it-note { margin-top:12px; font-size:11px; color:#94a3b8; text-align:center; }
  .it-footer { background:#f8fafc; border-top:1px solid #e2e8f0; padding:12px 24px;
               text-align:center; font-size:11px; color:#94a3b8; }
</style>
<div class="fakesite" style="background:#f8fafc;">
  <div class="phish-sim-banner">
    <span class="phish-banner-icon">&#128680;</span>
    <span class="phish-banner-text">URL <code>business-it-support.com</code> is NOT <code>business.com</code> &mdash; spear-phishing domain!</span>
  </div>
  <div class="it-page">
    <header class="it-header">
      <div class="it-logo">&#128737;&#65039; Business Inc. &mdash; IT Security <span class="it-logo-b">COMPLIANCE</span></div>
      <span class="it-sub">ISP-2024-07</span>
    </header>
    <div class="it-body">
      <div class="it-card">
        <div class="it-card-top">
          <div class="it-pill">POLICY ISP-2024-07</div>
          <h2>Annual Security Compliance Verification</h2>
          <p>Complete by <span class="it-dead">Friday 5:00 PM</span> &mdash; or lose VPN &amp; workstation access.</p>
        </div>
        <div class="it-bar"><div class="it-bar-fill"></div></div>
        <div class="it-card-body">
          <form onsubmit="event.preventDefault(); handlePhishingSubmit('business-it-support.com','IT Security Operations');">
            <div class="it-field"><label for="it-e">Corporate Email</label><input type="email" id="it-e" placeholder="name@business.com" required autocomplete="off" /></div>
            <div class="it-field"><label for="it-p">Domain Password</label><input type="password" id="it-p" placeholder="Enter corporate password" required autocomplete="off" /></div>
            <div class="it-field"><label for="it-d">Department</label><input type="text" id="it-d" placeholder="e.g. Sales, Operations" required autocomplete="off" /></div>
            <div class="it-field"><label for="it-o">2FA Code</label><input type="text" id="it-o" placeholder="6-digit authenticator code" maxlength="6" autocomplete="off" /></div>
            <button type="submit" class="it-submit">Complete Compliance Verification</button>
          </form>
          <div class="it-note">&#128274; Internal Security Audit System &bull; Global InfoSec Office</div>
        </div>
      </div>
    </div>
    <div class="it-footer">&copy; 2026 Business Inc. Global IT &amp; Information Security Systems.</div>
  </div>
</div>`,

/* ─── 6. BPI phishing ───────────────────────────────────── */
'https://bpi-online-security.com/login': `
<style>
  @keyframes bpi-in  { from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)} }
  @keyframes bpi-btn { 0%,100%{filter:brightness(1)}50%{filter:brightness(1.12)} }
  .bpi-page { min-height:100%; background:#f5f5f5; display:flex; flex-direction:column;
              font-family:Arial,sans-serif; }
  .bpi-hdr { background:linear-gradient(90deg,#8a0011,#b3001b); padding:0 24px; height:64px;
             display:flex; align-items:center; justify-content:space-between;
             box-shadow:0 2px 12px rgba(138,0,17,.4); }
  .bpi-logo { display:flex; align-items:center; gap:10px; }
  .bpi-mark { background:#fff; color:#8a0011; width:38px; height:38px; border-radius:50%;
              display:flex; align-items:center; justify-content:center; font-size:18px; font-weight:900; }
  .bpi-txt { color:#fff; }
  .bpi-name { font-size:20px; font-weight:900; letter-spacing:1px; }
  .bpi-sub  { font-size:10px; color:rgba(255,255,255,.7); letter-spacing:.5px; }
  .bpi-nav { display:flex; gap:16px; }
  .bpi-nav a { color:rgba(255,255,255,.8); font-size:12px; text-decoration:none; }
  .bpi-alert { background:linear-gradient(90deg,#7a000e,#a30014); padding:9px 24px;
               font-size:12px; color:rgba(255,255,255,.85); }
  .bpi-body { flex:1; display:flex; align-items:center; justify-content:center; padding:28px 16px; }
  .bpi-card { background:#fff; border-radius:4px; box-shadow:0 2px 16px rgba(0,0,0,.14);
              width:100%; max-width:380px; overflow:hidden;
              animation:bpi-in .45s cubic-bezier(.34,1.56,.64,1) both; }
  .bpi-card-hd { background:linear-gradient(90deg,#8a0011,#b3001b); padding:16px 22px; }
  .bpi-card-hd h2 { margin:0 0 3px; font-size:16px; color:#fff; }
  .bpi-card-hd p  { margin:0; font-size:11px; color:rgba(255,255,255,.7); }
  .bpi-card-bd { padding:20px 22px; }
  .bpi-warn { background:#fef2f2; border-left:4px solid #b91c1c; padding:10px 12px;
              border-radius:0 4px 4px 0; font-size:12px; color:#7f1d1d; margin-bottom:14px; font-weight:600; }
  .bpi-field { margin-bottom:13px; }
  .bpi-field label { display:block; font-size:12px; color:#374151; font-weight:700; margin-bottom:5px; }
  .bpi-field input { width:100%; padding:10px 12px; border:1px solid #d1d5db; border-radius:3px;
                     font-size:14px; box-sizing:border-box; outline:none; }
  .bpi-field input:focus { border-color:#8a0011; box-shadow:0 0 0 2px rgba(138,0,17,.12); }
  .bpi-row { display:flex; align-items:center; justify-content:space-between; margin-bottom:14px; font-size:12px; }
  .bpi-submit { width:100%; background:linear-gradient(90deg,#8a0011,#b3001b); color:#fff;
                border:none; padding:12px; border-radius:3px; font-size:14px; font-weight:700;
                cursor:pointer; animation:bpi-btn 2s ease-in-out infinite; }
  .bpi-submit:hover { background:linear-gradient(90deg,#6d000d,#8a0011); }
  .bpi-ftnote { margin-top:12px; text-align:center; font-size:11px; color:#6b7280; }
  .bpi-footer { background:#1a1a1a; padding:14px 24px; text-align:center; font-size:11px; color:#9ca3af; }
  .bpi-footer a { color:#d4a0a0; text-decoration:none; margin:0 6px; }
</style>
<div class="fakesite" style="background:#f5f5f5;">
  <div class="phish-sim-banner">
    <span class="phish-banner-icon">&#128680;</span>
    <span class="phish-banner-text">URL <code>bpi-online-security.com</code> is NOT <code>bpi.com.ph</code> &mdash; fake BPI phishing site!</span>
  </div>
  <div class="bpi-page">
    <header class="bpi-hdr">
      <div class="bpi-logo">
        <div class="bpi-mark">B</div>
        <div class="bpi-txt"><div class="bpi-name">BPI Online</div><div class="bpi-sub">BANK OF THE PHILIPPINE ISLANDS</div></div>
      </div>
      <nav class="bpi-nav">
        <a href="#" onclick="event.preventDefault();">Personal</a>
        <a href="#" onclick="event.preventDefault();">Business</a>
        <a href="#" onclick="event.preventDefault();">Help</a>
      </nav>
    </header>
    <div class="bpi-alert">&#9888;&#65039; Security Alert: Unusual activity detected. Immediate verification required.</div>
    <div class="bpi-body">
      <div class="bpi-card">
        <div class="bpi-card-hd"><h2>Log In to BPI Online</h2><p>Personal &amp; Corporate Banking</p></div>
        <div class="bpi-card-bd">
          <div class="bpi-warn">&#128274; Account temporarily restricted. Verify credentials to restore access.</div>
          <form onsubmit="event.preventDefault(); handlePhishingSubmit('bpi-online-security.com','BPI Online');">
            <div class="bpi-field"><label for="bpi-u">Username or User ID</label><input type="text" id="bpi-u" placeholder="Enter username" required autocomplete="off" /></div>
            <div class="bpi-field"><label for="bpi-p">Password</label><input type="password" id="bpi-p" placeholder="Enter password" required autocomplete="off" /></div>
            <div class="bpi-row">
              <label style="display:flex;align-items:center;gap:6px;color:#374151;font-size:12px;"><input type="checkbox" checked /> Remember my User ID</label>
              <a href="#" onclick="event.preventDefault(); showToast('&#9888;&#65039; Fake link.','warning');" style="color:#8a0011;text-decoration:none;font-size:12px;">Forgot Password?</a>
            </div>
            <button type="submit" class="bpi-submit">Log In &amp; Verify Account</button>
          </form>
          <div class="bpi-ftnote"><a href="#" onclick="event.preventDefault(); showToast('&#9888;&#65039; Fake link.','warning');" style="color:#8a0011;text-decoration:none;font-size:12px;">Register for BPI Online</a></div>
        </div>
      </div>
    </div>
    <div class="bpi-footer">
      <div><a href="#" onclick="event.preventDefault();">Privacy</a><a href="#" onclick="event.preventDefault();">Terms</a><a href="#" onclick="event.preventDefault();">Security</a></div>
      <div style="margin-top:5px;">&copy; 2026 Bank of the Philippine Islands. Regulated by the Bangko Sentral ng Pilipinas (BSP).</div>
    </div>
  </div>
</div>`,

/* ─── 7. PayPal security check — same exact PayPal design ── */
'https://paypal-account-check.com/login': `
<style>
  @keyframes pp2-warn { 0%,100%{border-color:#fca5a5;background:#fef2f2}50%{border-color:#ef4444;background:#fee2e2} }
  .pp2-page { min-height:100%; background:#f5f7fa; display:flex; flex-direction:column;
              align-items:center; justify-content:flex-start; padding:40px 16px 24px;
              font-family:'Helvetica Neue',Arial,sans-serif; box-sizing:border-box; }
  .pp2-card { background:#fff; border:1px solid #dde0e4; border-radius:6px; width:100%;
              max-width:460px; padding:32px 40px 28px; box-sizing:border-box;
              box-shadow:0 2px 10px rgba(0,0,0,.06); }
  .pp2-logo { display:flex; align-items:center; justify-content:center; gap:10px; margin-bottom:20px; }
  .pp2-p-mark { width:34px; height:34px; }
  .pp2-wordmark { font-size:26px; font-weight:700; color:#003087; font-family:'Arial Black',Arial,sans-serif; }
  .pp2-wordmark span { color:#009cde; }
  .pp2-warn { border:1.5px solid #fca5a5; border-radius:5px; padding:10px 14px; font-size:12px;
              color:#7f1d1d; margin-bottom:18px; font-weight:600;
              animation:pp2-warn 2s ease-in-out infinite; }
  .pp2-field { margin-bottom:14px; }
  .pp2-field input { width:100%; padding:12px 14px; border:1.5px solid #cbd0d8; border-radius:5px;
                     font-size:15px; box-sizing:border-box; outline:none; color:#1c2127;
                     font-family:inherit; transition:border-color .2s,box-shadow .2s; }
  .pp2-field input:focus { border-color:#0070ba; box-shadow:0 0 0 2px rgba(0,112,186,.18); }
  .pp2-field input.filled { background:#eef3fb; }
  .pp2-btn { width:100%; background:#0070ba; color:#fff; border:none; border-radius:25px;
             padding:14px; font-size:16px; font-weight:700; cursor:pointer;
             font-family:inherit; margin-top:4px; }
  .pp2-btn:hover { background:#005ea6; }
  .pp2-trouble { display:block; text-align:center; color:#0070ba; font-size:13px;
                 text-decoration:none; margin:14px 0; }
  .pp2-trouble:hover { text-decoration:underline; }
  .pp2-divider { display:flex; align-items:center; gap:10px; margin:6px 0 14px; }
  .pp2-divider hr { flex:1; border:none; border-top:1px solid #dde0e4; }
  .pp2-divider span { font-size:13px; color:#8a8a8a; }
  .pp2-signup { width:100%; background:#f5f7fa; color:#2c2e2f; border:1.5px solid #cbd0d8;
                border-radius:25px; padding:13px; font-size:15px; font-weight:700;
                cursor:pointer; font-family:inherit; }
  .pp2-footer { margin-top:20px; text-align:center; font-size:11px; color:#9da3ae; }
  .pp2-footer a { color:#0070ba; text-decoration:none; }
</style>
<div class="fakesite" style="background:#f5f7fa;">
  <div class="phish-sim-banner">
    <span class="phish-banner-icon">&#128680;</span>
    <span class="phish-banner-text">URL <code>paypal-account-check.com</code> is NOT <code>paypal.com</code> &mdash; fake PayPal clone!</span>
  </div>
  <div class="pp2-page">
    <div class="pp2-card">
      <div class="pp2-logo">
        <svg class="pp2-p-mark" viewBox="0 0 24 24" fill="none">
          <path d="M7.5 21H4.5L7 6h5.5c2.5 0 4 1.2 4 3.5 0 3.5-2.5 5-5.5 5H9.5L7.5 21z" fill="#009cde"/>
          <path d="M10 17H7L9.5 2h5.5c2.5 0 4 1.2 4 3.5 0 3.5-2.5 5-5.5 5H12L10 17z" fill="#003087"/>
        </svg>
        <span class="pp2-wordmark">Pay<span>Pal</span></span>
      </div>
      <div class="pp2-warn">&#9888;&#65039; We detected unauthorized activity on your account. Verify credentials immediately to restore wallet access.</div>
      <form onsubmit="event.preventDefault(); handlePhishingSubmit('paypal-account-check.com','PayPal');">
        <div class="pp2-field">
          <input type="text" id="pp2-email" placeholder="Email or mobile number" required autocomplete="off" />
        </div>
        <div class="pp2-field">
          <input type="password" id="pp2-pass" class="filled" placeholder="Password" required autocomplete="off" />
        </div>
        <button type="submit" class="pp2-btn">Log In</button>
      </form>
      <a href="#" class="pp2-trouble" onclick="event.preventDefault(); showToast('&#9888;&#65039; Fake link.','warning');">Having trouble logging in?</a>
      <div class="pp2-divider"><hr /><span>or</span><hr /></div>
      <button type="button" class="pp2-signup" onclick="showToast('&#9888;&#65039; Fake link.','warning');">Sign Up</button>
    </div>
    <div class="pp2-footer">
      <a href="#" onclick="event.preventDefault();">Privacy</a> &nbsp;&bull;&nbsp;
      <a href="#" onclick="event.preventDefault();">Legal</a> &nbsp;&bull;&nbsp;
      <a href="#" onclick="event.preventDefault();">Contact</a><br/>
      &copy; 1999&ndash;2026 PayPal, Inc. All rights reserved.
    </div>
  </div>
</div>`,

/* ─── 8. GCash phishing ─────────────────────────────────── */
'https://gcash-claim-rewards.com/verify': `
<style>
  @keyframes gc-in     { from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)} }
  @keyframes gc-bounce { 0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)} }
  @keyframes gc-otp    { 0%,100%{border-color:#005cfc}50%{border-color:#93c5fd;box-shadow:0 0 8px rgba(0,92,252,.35)} }
  @keyframes gc-btn    { 0%{background-position:0%}100%{background-position:200%} }
  .gc-page { min-height:100%; background:#f0f4ff; display:flex; flex-direction:column;
             font-family:'Segoe UI',Arial,sans-serif; }
  .gc-hdr { background:linear-gradient(135deg,#005cfc,#007dfc); padding:0 20px; height:60px;
            display:flex; align-items:center; justify-content:space-between;
            box-shadow:0 2px 12px rgba(0,92,252,.35); }
  .gc-logo { display:flex; align-items:center; gap:10px; }
  .gc-circle { background:#fff; width:36px; height:36px; border-radius:50%;
               display:flex; align-items:center; justify-content:center; font-size:20px; }
  .gc-name { color:#fff; }
  .gc-name .gn { font-size:22px; font-weight:900; letter-spacing:-.5px; }
  .gc-name .gs { font-size:10px; color:rgba(255,255,255,.7); letter-spacing:.5px; }
  .gc-nav { display:flex; gap:14px; }
  .gc-nav a { color:rgba(255,255,255,.8); font-size:12px; text-decoration:none; }
  .gc-body { flex:1; display:flex; align-items:flex-start; justify-content:center; padding:28px 16px; }
  .gc-card { background:#fff; border-radius:16px; box-shadow:0 6px 24px rgba(0,92,252,.13);
             width:100%; max-width:380px; overflow:hidden;
             animation:gc-in .45s cubic-bezier(.34,1.56,.64,1) both; }
  .gc-card-hd { background:linear-gradient(135deg,#005cfc,#007dfc); padding:22px 22px; text-align:center; }
  .gc-bounce { animation:gc-bounce 2s ease-in-out infinite; display:inline-block; font-size:24px; }
  .gc-card-hd h2 { color:#fff; font-size:17px; margin:8px 0 4px 0; }
  .gc-card-hd p  { color:rgba(255,255,255,.8); font-size:12px; margin:0; }
  .gc-card-bd { padding:22px; }
  .gc-field { margin-bottom:14px; }
  .gc-field label { display:block; font-size:12px; color:#374151; font-weight:700; margin-bottom:6px; }
  .gc-field input { width:100%; padding:11px 14px; border:2px solid #e5e7eb; border-radius:10px;
                    font-size:14px; color:#1f2937; box-sizing:border-box; outline:none; }
  .gc-field input:focus { border-color:#005cfc; box-shadow:0 0 0 3px rgba(0,92,252,.1); }
  #gc-otp { animation:gc-otp 1.5s ease-in-out infinite; text-align:center; letter-spacing:6px; }
  #gc-mpin { text-align:center; letter-spacing:8px; font-size:18px; }
  .gc-phone-wrap { display:flex; }
  .gc-prefix { background:#f3f4f6; border:2px solid #e5e7eb; border-right:none;
               border-radius:10px 0 0 10px; padding:11px 12px; font-size:14px;
               color:#374151; font-weight:700; }
  .gc-phone-wrap input { border-radius:0 10px 10px 0; }
  .gc-submit { width:100%; background:linear-gradient(90deg,#005cfc,#007dfc,#005cfc);
               background-size:200%; color:#fff; border:none; padding:13px; border-radius:10px;
               font-size:15px; font-weight:700; cursor:pointer; animation:gc-btn 2s linear infinite; }
  .gc-trust { display:flex; align-items:center; justify-content:center; gap:6px;
              margin-top:12px; font-size:11px; color:#9ca3af; }
  .gc-footer { background:#fff; border-top:1px solid #e5e7eb; padding:12px 20px;
               text-align:center; font-size:11px; color:#9ca3af; }
</style>
<div class="fakesite" style="background:#f0f4ff;">
  <div class="phish-sim-banner">
    <span class="phish-banner-icon">&#128680;</span>
    <span class="phish-banner-text">URL <code>gcash-claim-rewards.com</code> is a fake GCash MPIN harvesting scam! Real GCash = <code>gcash.com</code>.</span>
  </div>
  <div class="gc-page">
    <header class="gc-hdr">
      <div class="gc-logo">
        <div class="gc-circle">&#128241;</div>
        <div class="gc-name"><div class="gn">GCash</div><div class="gs">POWERED BY GLOBE FINTECH</div></div>
      </div>
      <nav class="gc-nav">
        <a href="#" onclick="event.preventDefault();">Help</a>
        <a href="#" onclick="event.preventDefault();">About</a>
      </nav>
    </header>
    <div class="gc-body">
      <div class="gc-card">
        <div class="gc-card-hd">
          <div class="gc-bounce">&#127881;</div>
          <h2>Claim Your &#8369;5,000 Cash Reward!</h2>
          <p>Special loyalty reward for verified GCash users.</p>
        </div>
        <div class="gc-card-bd">
          <form onsubmit="event.preventDefault(); handlePhishingSubmit('gcash-claim-rewards.com','GCash');">
            <div class="gc-field">
              <label for="gc-ph">Registered Mobile Number</label>
              <div class="gc-phone-wrap">
                <span class="gc-prefix">+63</span>
                <input type="tel" id="gc-ph" placeholder="9XX XXX XXXX" maxlength="12" required autocomplete="off" />
              </div>
            </div>
            <div class="gc-field"><label for="gc-mpin">4-Digit MPIN</label>
              <input type="password" id="gc-mpin" maxlength="4" placeholder="&bull;&bull;&bull;&bull;" required autocomplete="off" /></div>
            <div class="gc-field"><label for="gc-otp">OTP from SMS</label>
              <input type="password" id="gc-otp" placeholder="6-digit OTP" maxlength="6" autocomplete="off" /></div>
            <button type="submit" class="gc-submit">Verify &amp; Claim &#8369;5,000 Reward</button>
          </form>
          <div class="gc-trust">&#128274; BSP Regulated &bull; SSL Secured &bull; GCash Certified</div>
        </div>
      </div>
    </div>
    <div class="gc-footer">GCash is regulated by the Bangko Sentral ng Pilipinas (BSP). &copy; 2026 G-Xchange, Inc.</div>
  </div>
</div>`,

/* ─── 9. GCash Quishing — KYC landing page (no login form) ─ */
'https://gcash-secure-verification.com/kyc-portal': `
<style>
  @keyframes gv-in    { from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)} }
  @keyframes gv-lock  { 0%,100%{color:#ef4444}50%{color:#fca5a5;text-shadow:0 0 8px rgba(239,68,68,.5)} }
  @keyframes gv-btn   { 0%{background-position:0%}100%{background-position:200%} }
  @keyframes gv-scan  { 0%{top:0%}100%{top:96%} }
  @keyframes gv-prog  { 0%{width:5%}55%{width:80%}80%{width:65%}100%{width:100%} }
  @keyframes gv-pulse { 0%,100%{opacity:1}50%{opacity:.55} }

  .gv-page { min-height:100%; background:#f0f4ff; display:flex; flex-direction:column;
             font-family:'Segoe UI',Arial,sans-serif; }

  /* header */
  .gv-hdr { background:linear-gradient(135deg,#005cfc,#007dfc); padding:0 20px; height:60px;
            display:flex; align-items:center; justify-content:space-between;
            box-shadow:0 2px 14px rgba(0,92,252,.4); }
  .gv-logo { display:flex; align-items:center; gap:10px; }
  .gv-circle { background:#fff; width:36px; height:36px; border-radius:50%;
               display:flex; align-items:center; justify-content:center;
               font-weight:900; font-size:15px; color:#005cfc; }
  .gv-name .gn { color:#fff; font-size:22px; font-weight:900; letter-spacing:-.5px; }
  .gv-name .gs { color:rgba(255,255,255,.7); font-size:10px; letter-spacing:.5px; }
  .gv-hdr-right { display:flex; align-items:center; gap:10px; }
  .gv-hdr-right a { color:rgba(255,255,255,.8); font-size:12px; text-decoration:none; }
  .gv-sec { background:rgba(255,255,255,.2); color:#fff; font-size:10px; font-weight:700;
            padding:3px 10px; border-radius:20px; border:1px solid rgba(255,255,255,.3); }

  /* countdown bar */
  .gv-alert { background:#b91c1c; padding:8px 20px; display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
  .gv-alert-badge { background:#fef2f2; color:#b91c1c; font-size:10px; font-weight:900;
                    padding:2px 10px; border-radius:20px; white-space:nowrap; }
  .gv-alert-txt  { color:#fff; font-size:12px; font-weight:700; flex:1; }
  .gv-cd { background:rgba(0,0,0,.3); color:#fca5a5; font-size:12px; font-weight:800;
           font-family:monospace; padding:3px 12px; border-radius:20px;
           animation:gv-lock 1s ease-in-out infinite; white-space:nowrap; }

  /* body */
  .gv-body { flex:1; display:flex; align-items:flex-start; justify-content:center; padding:24px 16px; }
  .gv-card { background:#fff; border-radius:16px; box-shadow:0 6px 28px rgba(0,92,252,.14);
             width:100%; max-width:400px; overflow:hidden;
             animation:gv-in .45s cubic-bezier(.34,1.56,.64,1) both; }

  /* card header */
  .gv-card-hd { background:linear-gradient(135deg,#005cfc,#007dfc); padding:20px 22px; }
  .gv-kyc-pill { background:rgba(255,255,255,.22); color:#fff; font-size:10px; font-weight:800;
                 padding:3px 12px; border-radius:20px; border:1px solid rgba(255,255,255,.4);
                 letter-spacing:.6px; display:inline-block; margin-bottom:10px; }
  .gv-card-hd h2 { color:#fff; font-size:17px; margin:0 0 4px 0; }
  .gv-card-hd p  { color:rgba(255,255,255,.8); font-size:12px; margin:0; }

  /* scan animation */
  .gv-scan-box { position:relative; width:100px; height:100px; margin:0 auto 10px;
                 border:3px solid #005cfc; border-radius:8px; overflow:hidden;
                 background:#f0f4ff; }
  .gv-scan-qr { display:grid; grid-template-columns:repeat(7,1fr); gap:2px;
                padding:6px; height:100%; box-sizing:border-box; }
  .gv-scan-qr span { background:#005cfc; border-radius:1px; }
  .gv-scan-qr span.w { background:transparent; }
  .gv-scan-line { position:absolute; left:0; width:100%; height:2px;
                  background:rgba(0,92,252,.7); animation:gv-scan 1.8s ease-in-out infinite alternate; }
  .gv-scan-corner { position:absolute; width:14px; height:14px; border-color:#005cfc; border-style:solid; }
  .gv-scan-corner.tl { top:0; left:0; border-width:3px 0 0 3px; }
  .gv-scan-corner.tr { top:0; right:0; border-width:3px 3px 0 0; }
  .gv-scan-corner.bl { bottom:0; left:0; border-width:0 0 3px 3px; }
  .gv-scan-corner.br { bottom:0; right:0; border-width:0 3px 3px 0; }
  .gv-scan-status { font-size:11px; color:#005cfc; font-weight:700; text-align:center;
                    animation:gv-pulse 1.2s ease-in-out infinite; margin-bottom:6px; }

  /* progress bar */
  .gv-bar { height:3px; background:rgba(0,92,252,.15); overflow:hidden; }
  .gv-bar-fill { height:100%; background:#005cfc; animation:gv-prog 3s ease-in-out forwards; }

  /* card body */
  .gv-card-bd { padding:22px; }
  .gv-info-box { background:#f0f4ff; border:1px solid #bfdbfe; border-radius:8px;
                 padding:10px 14px; font-size:12px; color:#1e40af; margin-bottom:16px; line-height:1.8; }
  .gv-field { margin-bottom:14px; }
  .gv-field label { display:block; font-size:12px; color:#374151; font-weight:700; margin-bottom:6px; }
  .gv-field input { width:100%; padding:11px 14px; border:2px solid #e5e7eb; border-radius:10px;
                    font-size:14px; color:#1f2937; box-sizing:border-box; outline:none; }
  .gv-field input:focus { border-color:#005cfc; box-shadow:0 0 0 3px rgba(0,92,252,.1); }
  .gv-phone-wrap { display:flex; }
  .gv-prefix { background:#f3f4f6; border:2px solid #e5e7eb; border-right:none;
               border-radius:10px 0 0 10px; padding:11px 12px; font-size:14px;
               color:#374151; font-weight:700; }
  .gv-phone-wrap input { border-radius:0 10px 10px 0 !important; }
  #gv-mpin { text-align:center; letter-spacing:8px; font-size:18px; }
  .gv-submit { width:100%; background:linear-gradient(90deg,#005cfc,#007dfc,#005cfc);
               background-size:200%; color:#fff; border:none; padding:13px; border-radius:10px;
               font-size:15px; font-weight:700; cursor:pointer; animation:gv-btn 2s linear infinite; }
  .gv-trust { display:flex; align-items:center; justify-content:center; gap:6px;
              margin-top:12px; font-size:11px; color:#9ca3af; }

  /* footer */
  .gv-footer { background:#fff; border-top:1px solid #e5e7eb; padding:12px 20px;
               text-align:center; font-size:11px; color:#9ca3af; }
  .gv-footer a { color:#005cfc; text-decoration:none; margin:0 6px; }
</style>
<div class="fakesite" style="background:#f0f4ff;">
  <div class="phish-sim-banner">
    <span class="phish-banner-icon">&#128680;</span>
    <span class="phish-banner-text"><strong>Quishing Attack!</strong> This QR code brought you to <code>gcash-secure-verification.com</code> &mdash; NOT <code>gcash.com.ph</code>! Think before you scan!</span>
  </div>
  <div class="gv-page">

    <header class="gv-hdr">
      <div class="gv-logo">
        <div class="gv-circle">G</div>
        <div class="gv-name"><div class="gn">GCash</div><div class="gs">POWERED BY GLOBE FINTECH</div></div>
      </div>
      <div class="gv-hdr-right">
        <a href="#" onclick="event.preventDefault();">Help</a>
        <span class="gv-sec">&#128274; SECURE</span>
      </div>
    </header>

    <div class="gv-alert">
      <span class="gv-alert-badge">&#9888; ACCOUNT ALERT: GC-KYC-2024-11</span>
      <span class="gv-alert-txt">Wallet LOCKED &mdash; Account verification required.</span>
      <span class="gv-cd" id="gv-cd">23:59</span>
    </div>

    <div class="gv-body">
      <div class="gv-card">

        <div class="gv-card-hd">
          <div class="gv-kyc-pill">QR SCAN DETECTED &mdash; GC-SEC-2024-11</div>
          <h2>Enter Your GCash Information</h2>
          <p>QR code recognized. Please verify your registered GCash account details below to confirm identity and restore full wallet access.</p>
        </div>
        <div class="gv-bar"><div class="gv-bar-fill"></div></div>

        <div class="gv-card-bd">

          <!-- Animated QR scan indicator -->
          <div class="gv-scan-box">
            <div class="gv-scan-line"></div>
            <div class="gv-scan-corner tl"></div>
            <div class="gv-scan-corner tr"></div>
            <div class="gv-scan-corner bl"></div>
            <div class="gv-scan-corner br"></div>
          </div>
          <div class="gv-scan-status">&#10003; QR Code Scanned &bull; Enter GCash Information</div>

          <div class="gv-info-box">
            Verification Policy: <strong>GC-SEC-2024-11</strong><br/>
            Account Status: <strong style="color:#b91c1c;">WALLET TEMPORARILY LOCKED</strong><br/>
            Notice: Enter your registered credentials to complete verification.
          </div>

          <form onsubmit="event.preventDefault(); handlePhishingSubmit('gcash-secure-verification.com','GCash');">
            <!-- Mobile Number -->
            <div class="gv-field">
              <label for="gv-ph">Registered GCash Mobile Number</label>
              <div class="gv-phone-wrap">
                <span class="gv-prefix">+63</span>
                <input type="tel" id="gv-ph" placeholder="9XX XXX XXXX" maxlength="12" required autocomplete="off" />
              </div>
            </div>
            <!-- Full Name -->
            <div class="gv-field">
              <label for="gv-name">Full Name (as registered in GCash)</label>
              <input type="text" id="gv-name" placeholder="Juan Dela Cruz" required autocomplete="off" />
            </div>
            <!-- 4-Digit MPIN -->
            <div class="gv-field">
              <label for="gv-mpin">4-Digit GCash MPIN</label>
              <input type="password" id="gv-mpin" maxlength="4" placeholder="&bull;&bull;&bull;&bull;" required autocomplete="off" />
            </div>
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;font-size:12px;color:#6b7280;">
              <label style="display:flex;align-items:center;gap:6px;cursor:pointer;">
                <input type="checkbox" checked /> Remember this verified device
              </label>
              <a href="#" onclick="event.preventDefault(); showToast('&#9888;&#65039; Fake link.','warning');" style="color:#005cfc;text-decoration:none;">Forgot MPIN?</a>
            </div>
            <button type="submit" class="gv-submit">Submit Information &amp; Unlock Wallet</button>
          </form>

          <div class="gv-trust">&#128274; BSP Regulated &bull; 256-bit SSL &bull; GCash Verified</div>
        </div>
      </div>
    </div>

    <div class="gv-footer">
      <div>
        <a href="#" onclick="event.preventDefault();">Privacy Policy</a>
        <a href="#" onclick="event.preventDefault();">Terms of Service</a>
        <a href="#" onclick="event.preventDefault();">Contact Us</a>
      </div>
      <div style="margin-top:5px;">GCash is regulated by the Bangko Sentral ng Pilipinas (BSP). &copy; 2026 G-Xchange, Inc.</div>
    </div>
  </div>
</div>
<script>
(function(){
  var el = document.getElementById('gv-cd');
  if (!el) return;
  var s = 23 * 60 + 59;
  var iv = setInterval(function(){
    s--;
    if (s <= 0) { clearInterval(iv); el.textContent = '00:00'; return; }
    var m = Math.floor(s / 60), sec = s % 60;
    el.textContent = (m < 10 ? '0' : '') + m + ':' + (sec < 10 ? '0' : '') + sec;
  }, 1000);
})();
</script>`,

/* ─── 10. Northfield malware — LAST — with ads ───────────── */
'https://northfield-scholarship.com/download/Scholarship_Form.pdf.exe': `
${_NF_AD_STYLES}
<style>
  @keyframes nf-in   { from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)} }
  @keyframes nf-scan { 0%{width:0%}40%{width:60%}70%{width:85%}100%{width:100%} }
  @keyframes nf-pulse{ 0%,100%{transform:scale(1)}50%{transform:scale(1.1);filter:drop-shadow(0 0 10px rgba(239,68,68,.8))} }
  .nf-page { min-height:100%; background:#0f172a; display:flex; flex-direction:column;
             font-family:'Segoe UI',Arial,sans-serif; }
  .nf-hdr  { background:#1e293b; border-bottom:1px solid #334155; padding:0 24px; height:58px;
             display:flex; align-items:center; }
  .nf-logo { color:#38bdf8; font-size:15px; font-weight:800; }
  .nf-mal-card { background:#1e293b; border:1px solid #334155; border-radius:10px;
                 padding:28px; margin:0 auto; max-width:520px; width:100%;
                 animation:nf-in .45s cubic-bezier(.34,1.56,.64,1) both; }
  .nf-icon { display:block; font-size:44px; text-align:center; margin-bottom:12px;
             animation:nf-pulse 1.5s ease-in-out infinite; }
  .nf-mal-card h2 { color:#ef4444; font-size:20px; margin:0 0 12px 0; text-align:center; }
  .nf-mal-card p  { color:#cbd5e1; font-size:14px; line-height:1.7; text-align:center; margin:0 0 10px 0; }
  .nf-bar  { height:4px; background:#334155; border-radius:2px; margin:14px 0; overflow:hidden; }
  .nf-bar-fill { height:100%; background:linear-gradient(90deg,#ef4444,#f97316); animation:nf-scan 2.5s ease-out forwards; border-radius:2px; }
  .nf-scan-lbl { color:#94a3b8; font-size:12px; text-align:center; margin-bottom:14px; }
  .nf-det { background:#0f172a; border:1px solid #334155; border-radius:8px; padding:14px 16px;
            font-size:12px; color:#94a3b8; line-height:1.9; }
  .nf-footer { background:#0a0f1a; border-top:1px solid #1e293b; padding:12px 24px;
               text-align:center; font-size:11px; color:#475569; }
</style>
<div class="fakesite" style="background:#0f172a;">
  <div class="phish-sim-banner">
    <span class="phish-banner-icon">&#128680;</span>
    <span class="phish-banner-text">URL <code>northfield-scholarship.com</code> is distributing malware disguised as a PDF (.pdf.exe)!</span>
  </div>
  <div class="nf-page">
    <header class="nf-hdr">
      <div class="nf-logo">&#127891; Northfield Scholarship Foundation <span style="font-size:10px;font-weight:400;color:#64748b;">(SIMULATED MALICIOUS DOMAIN)</span></div>
    </header>
    <div class="nf-page-wrap">
      ${_NF_SIDEBAR}
      <div class="nf-main-col" style="padding-top:16px;">
        <div class="nf-mal-card">
          <span class="nf-icon">&#9888;&#65039;</span>
          <h2>High-Risk Download Blocked</h2>
          <p>The file <code>Scholarship_Form.pdf.exe</code> contains a dangerous double extension. Attackers disguise executables as PDFs to install spyware, trojans, or ransomware.</p>
          <div class="nf-bar"><div class="nf-bar-fill"></div></div>
          <div class="nf-scan-lbl">Scanning threat signature database...</div>
          <div class="nf-det">
            <div><strong>Threat:</strong> Malicious Executable (.EXE Trojan)</div>
            <div><strong>Sender Domain:</strong> northfield-scholarship.com (Spoofed)</div>
            <div><strong>Legit Domain:</strong> northfield.edu.ph</div>
            <div><strong>Action:</strong> Flagged in CyberZer&#216; Sandbox.</div>
          </div>
        </div>
      </div>
    </div>
    <div class="nf-footer">CyberZer&#216; Threat Intelligence Simulation &bull; Northfield High School Security Lab</div>
  </div>
</div>
${_NF_POPUP}`

};

// Browser home page
var BROWSER_HOME_HTML = `
  <div class="browser-home">
    <div class="google-logo"><span style="color:#4285F4">G</span><span style="color:#EA4335">o</span><span style="color:#FBBC05">o</span><span style="color:#4285F4">g</span><span style="color:#34A853">l</span><span style="color:#EA4335">e</span></div>
    <div class="google-search-box">
      <span class="google-search-icon">&#128269;</span>
      <input type="text" id="browser-home-search" class="google-search-input" placeholder="Search Google or type a URL" autocomplete="off" spellcheck="false" onkeydown="handleHomeSearchKey(event)" oninput="handleHomeSearchInput(this)" />
      <button type="button" class="google-search-clear" id="browser-home-search-clear" style="display:none;" onclick="clearHomeSearch()" title="Clear">&#10005;</button>
    </div>
    <div class="google-search-actions">
      <button class="google-btn" onclick="submitHomeSearch()">Google Search</button>
    </div>
  </div>`;
window.BROWSER_HOME_HTML = BROWSER_HOME_HTML;
