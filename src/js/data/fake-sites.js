'use strict';





// Fake websites for the browser
// Fake websites for the browser (Authentic Phishing Website Examples)
const FAKE_SITES = {
  'https://paypa1.com/claim-reward': `
    <div class="fakesite fakesite-paypal">
      <div class="phish-sim-banner">
        <span class="phish-banner-icon">🚨</span>
        <span class="phish-banner-text">Look at the browser URL bar: <code>paypa1.com</code> uses the digit <strong>1</strong> instead of the letter <strong>l</strong>! This is a fake phishing clone. Real PayPal is <code>paypal.com</code>.</span>
      </div>
      <div class="fakesite-header" style="background:#ffffff;border-bottom:1px solid #e2e8f0;">
        <div class="fakesite-header-inner">
          <div class="fakesite-logo" style="color:#003087;">🅿️ PayPal</div>
          <div class="fakesite-subtag" style="color:#0070ba;font-weight:600;">🎁 ₱1,000,000 Pesos Prize Disbursement Center</div>
        </div>
      </div>
      <div class="fakesite-body">
        <div class="fakesite-card">
          <div class="fakesite-card-header">
            <div style="background:#e0f2fe;color:#0369a1;padding:8px 12px;border-radius:8px;font-size:13px;font-weight:700;margin-bottom:12px;text-align:center;">
              🎉 Prize Disbursement: ₱1,000,000.00 PHP Ready for Transfer
            </div>
            <h2 style="color:#003087;">Log in to your PayPal account</h2>
            <p>Enter your PayPal credentials below to confirm your identity and claim your ₱1,000,000 cash prize.</p>
          </div>
          <form onsubmit="event.preventDefault(); handlePhishingSubmit('paypa1.com', 'PayPal');">
            <div class="fakesite-field">
              <label for="paypal-claim-email">Email address or mobile number</label>
              <input type="text" id="paypal-claim-email" placeholder="Email or mobile number" required autocomplete="off" />
            </div>
            <div class="fakesite-field">
              <label for="paypal-claim-pass">PayPal Password</label>
              <input type="password" id="paypal-claim-pass" placeholder="Password" required autocomplete="off" />
            </div>
            <div class="fakesite-row">
              <label class="fakesite-remember">
                <input type="checkbox" checked /> Remember this device
              </label>
              <a href="#" class="fakesite-link" onclick="event.preventDefault(); showToast('⚠️ Fake link: Attackers only collect submitted credentials.', 'warning');">Having trouble logging in?</a>
            </div>
            <button type="submit" class="fakesite-submit" style="background:linear-gradient(90deg, #003087, #0070ba);">
              Claim ₱1,000,000 &amp; Deposit to Wallet
            </button>
            <div style="margin-top:14px;text-align:center;">
              <button type="button" class="fakesite-secondary-btn" onclick="event.preventDefault(); showToast('⚠️ Fake link on phishing portal.', 'warning');">Create an Account</button>
            </div>
          </form>
        </div>
      </div>
      <div class="fakesite-footer">
        <p>English | Filipino | Español | Privacy | Legal</p>
        <p style="margin-top:4px;">Copyright © 1999–2026 PayPal. All rights reserved.</p>
      </div>
    </div>`,

  'https://business-account-verify.net/login': `
    <div class="fakesite fakesite-corporate">
      <div class="phish-sim-banner">
        <span class="phish-banner-icon">🚨</span>
        <span class="phish-banner-text">Look at the browser URL bar: <code>business-account-verify.net</code> is a fake phishing website, NOT the official company domain <code>business.com</code>!</span>
      </div>
      <div class="fakesite-header" style="background:#0f172a;">
        <div class="fakesite-header-inner">
          <div class="fakesite-logo">🏢 Business Inc. — Employee SSO</div>
          <div class="fakesite-subtag">Identity &amp; Access Management Portal</div>
        </div>
      </div>
      <div class="fakesite-body">
        <div class="fakesite-card">
          <div class="fakesite-card-header">
            <h2>Single Sign-On (SSO) Verification</h2>
            <div class="fakesite-urgency-callout">
              ⚠️ <strong>URGENT:</strong> Account access restricted due to suspicious sign-in. Verify credentials within 30 minutes to prevent permanent suspension.
            </div>
          </div>
          <form onsubmit="event.preventDefault(); handlePhishingSubmit('business-account-verify.net', 'Business Inc. SSO');">
            <div class="fakesite-field">
              <label for="corp-user">Corporate Email or Employee ID</label>
              <input type="text" id="corp-user" placeholder="user@business.com or EMP-ID" required autocomplete="off" />
            </div>
            <div class="fakesite-field">
              <label for="corp-pass">Current Work Password</label>
              <input type="password" id="corp-pass" placeholder="••••••••••••" required autocomplete="off" />
            </div>
            <div class="fakesite-field">
              <label for="corp-pin">Employee PIN / Security Token</label>
              <input type="password" id="corp-pin" placeholder="6-digit PIN" maxlength="6" autocomplete="off" />
            </div>
            <div class="fakesite-row">
              <label class="fakesite-remember">
                <input type="checkbox" checked /> Keep this workstation authenticated
              </label>
              <a href="#" class="fakesite-link" onclick="event.preventDefault(); showToast('⚠️ Fake link: Attackers only collect submitted credentials.', 'warning');">Forgot password?</a>
            </div>
            <button type="submit" class="fakesite-submit">
              Verify Employee Identity &amp; Restore Access
            </button>
          </form>
          <div class="fakesite-card-footer">
            <p>Protected by Enterprise Multi-Factor Authentication • ISO 27001 Certified</p>
          </div>
        </div>
      </div>
      <div class="fakesite-footer">
        <p>© 2026 Business Inc. Global IT &amp; Information Security Systems. All rights reserved.</p>
      </div>
    </div>`,

  'https://m1crosoft-account-verify.com/signin': `
    <div class="fakesite fakesite-microsoft">
      <div class="phish-sim-banner">
        <span class="phish-banner-icon">🚨</span>
        <span class="phish-banner-text">Look at the browser URL bar: <code>m1crosoft-account-verify.com</code> uses a digit "1" instead of the letter "i"! Real Microsoft is <code>microsoft.com</code>.</span>
      </div>
      <div class="fakesite-ms-container">
        <div class="fakesite-ms-card">
          <div class="ms-logo-wrap">
            <div class="ms-logo-grid">
              <span style="background:#f25022;"></span>
              <span style="background:#7fba00;"></span>
              <span style="background:#00a4ef;"></span>
              <span style="background:#ffb900;"></span>
            </div>
            <span class="ms-brand-name">Microsoft</span>
          </div>
          <h2 class="ms-signin-title">Sign in</h2>
          <div class="ms-security-warning">
            ⚠️ <strong>Unusual sign-in activity detected.</strong> Enter your credentials to confirm your identity and prevent account lockout within 60 minutes.
          </div>
          <form onsubmit="event.preventDefault(); handlePhishingSubmit('m1crosoft-account-verify.com', 'Microsoft 365');">
            <div class="ms-field">
              <label for="ms-email" style="font-size:12px;color:#505050;display:block;margin-bottom:4px;">Email, phone, or Skype</label>
              <input type="text" id="ms-email" placeholder="someone@example.com" required autocomplete="off" />
            </div>
            <div class="ms-field" style="margin-top:16px;">
              <label for="ms-pwd" style="font-size:12px;color:#505050;display:block;margin-bottom:4px;">Password</label>
              <input type="password" id="ms-pwd" placeholder="Enter password" required autocomplete="off" />
            </div>
            <div class="ms-trouble-links">
              <p style="margin:6px 0;"><a href="#" onclick="event.preventDefault(); showToast('⚠️ Fake link on phishing portal.', 'warning');">No account? Create one!</a></p>
              <p style="margin:6px 0;"><a href="#" onclick="event.preventDefault(); showToast('⚠️ Fake link on phishing portal.', 'warning');">Can’t access your account?</a></p>
            </div>
            <div class="ms-btn-row">
              <button type="submit" class="ms-submit-btn">Next</button>
            </div>
          </form>
        </div>
        <div class="ms-footer">
          <span>Terms of use</span>
          <span>Privacy &amp; cookies</span>
          <span>...</span>
        </div>
      </div>
    </div>`,

  'https://bankng-secure-verify.xyz/restore': `
    <div class="fakesite fakesite-banking">
      <div class="phish-sim-banner">
        <span class="phish-banner-icon">🚨</span>
        <span class="phish-banner-text">Look at the browser URL bar: <code>bankng-secure-verify.xyz</code> misspells "banking" and uses a cheap <code>.xyz</code> domain! Real banks never use .xyz domains.</span>
      </div>
      <div class="fakesite-header bankng-header">
        <div class="fakesite-header-inner">
          <div class="fakesite-logo">🔒 Secure Bank Online — Risk Management</div>
          <div class="fakesite-subtag">Emergency Account Restoration Portal</div>
        </div>
      </div>
      <div class="fakesite-body">
        <div class="fakesite-card">
          <div class="fakesite-card-header">
            <span class="bankng-alert-badge">⚠️ SUSPENSION ORDER #BK-99214</span>
            <h2 style="color:#b91c1c;">Account Access Frozen</h2>
            <div class="bankng-timer-box">
              <span>⏳</span> <strong>TIME REMAINING: 14:48</strong> until permanent fund closure.
            </div>
          </div>
          <form onsubmit="event.preventDefault(); handlePhishingSubmit('bankng-secure-verify.xyz', 'Bank Security Portal');">
            <div class="fakesite-field">
              <label for="bank-user">Online Banking User ID / Username</label>
              <input type="text" id="bank-user" placeholder="Enter online banking ID" required autocomplete="off" />
            </div>
            <div class="fakesite-field">
              <label for="bank-acc">16-Digit Debit / Account Card Number</label>
              <input type="text" id="bank-acc" placeholder="XXXX XXXX XXXX XXXX" maxlength="19" required autocomplete="off" />
            </div>
            <div class="fakesite-field">
              <label for="bank-pin">ATM PIN / Security Password</label>
              <input type="password" id="bank-pin" placeholder="Enter ATM PIN or Password" required autocomplete="off" />
            </div>
            <div class="fakesite-field">
              <label for="bank-ssn">Mother's Maiden Name (Identity Verification)</label>
              <input type="text" id="bank-ssn" placeholder="Security answer" required autocomplete="off" />
            </div>
            <button type="submit" class="fakesite-submit bankng-submit">
              RESTORE MY ACCOUNT IMMEDIATELY
            </button>
          </form>
          <div class="fakesite-card-footer">
            <p>Federal Deposit Insurance Protection • 256-Bit SSL Encrypted Verification</p>
          </div>
        </div>
      </div>
      <div class="fakesite-footer">
        <p>© 2026 Interbank Security Network. All rights reserved.</p>
      </div>
    </div>`,

  'https://business-it-support.com/compliance-portal': `
    <div class="fakesite fakesite-it">
      <div class="phish-sim-banner">
        <span class="phish-banner-icon">🚨</span>
        <span class="phish-banner-text">Look at the browser URL bar: <code>business-it-support.com</code> is a spear-phishing domain! Official company portal is <code>business.com</code>.</span>
      </div>
      <div class="fakesite-header it-header">
        <div class="fakesite-header-inner">
          <div class="fakesite-logo">🛡️ IT Security Operations | Compliance Hub</div>
          <div class="fakesite-subtag">Mandatory Employee Security Review (ISP-2024-07)</div>
        </div>
      </div>
      <div class="fakesite-body">
        <div class="fakesite-card">
          <div class="fakesite-card-header">
            <span class="it-policy-pill">POLICY ISP-2024-07</span>
            <h2 style="margin-top:8px;">Annual IT Security Compliance Verification</h2>
            <p>Mandatory certification for all corporate staff. Must be completed by Friday 5:00 PM to maintain VPN and workstation privileges.</p>
          </div>
          <form onsubmit="event.preventDefault(); handlePhishingSubmit('business-it-support.com', 'IT Security Operations');">
            <div class="fakesite-field">
              <label for="it-email">Corporate Work Email (@business.com)</label>
              <input type="email" id="it-email" placeholder="name@business.com" required autocomplete="off" />
            </div>
            <div class="fakesite-field">
              <label for="it-pwd">Active Directory / Domain Password</label>
              <input type="password" id="it-pwd" placeholder="Enter corporate password" required autocomplete="off" />
            </div>
            <div class="fakesite-field">
              <label for="it-dept">Department / Division</label>
              <input type="text" id="it-dept" placeholder="e.g. Sales, Operations, Finance" required autocomplete="off" />
            </div>
            <div class="fakesite-field">
              <label for="it-otp">Two-Factor Authentication (2FA) Code</label>
              <input type="text" id="it-otp" placeholder="6-digit authenticator code" maxlength="6" autocomplete="off" />
            </div>
            <button type="submit" class="fakesite-submit" style="background:linear-gradient(90deg, #0369a1, #0284c7);">
              Complete Security Compliance Verification
            </button>
          </form>
          <div class="fakesite-card-footer">
            <p>Internal Security Audit System • Global Information Security Office</p>
          </div>
        </div>
      </div>
      <div class="fakesite-footer">
        <p>© 2026 Business Inc. Global IT &amp; Information Security Systems. All rights reserved.</p>
      </div>
    </div>`,

  'https://bpi-online-security.com/login': `
    <div class="fakesite fakesite-bpi">
      <div class="phish-sim-banner">
        <span class="phish-banner-icon">🚨</span>
        <span class="phish-banner-text">Look at the browser URL bar: <code>bpi-online-security.com</code> is a fake phishing website, NOT the authentic <code>bpi.com.ph</code>!</span>
      </div>
      <div class="fakesite-header" style="background:linear-gradient(90deg, #8a0011, #b3001b);">
        <div class="fakesite-header-inner">
          <div class="fakesite-logo">🏦 BPI Online</div>
          <div class="fakesite-subtag">Personal &amp; Corporate Banking</div>
        </div>
      </div>
      <div class="fakesite-body">
        <div class="fakesite-card">
          <div class="fakesite-card-header">
            <h2>Log In to BPI Online</h2>
            <p>Security Alert: Confirm your account credentials to avoid immediate account restriction.</p>
          </div>
          <form onsubmit="event.preventDefault(); handlePhishingSubmit('bpi-online-security.com', 'BPI Online');">
            <div class="fakesite-field">
              <label for="bpi-user">Username or User ID</label>
              <input type="text" id="bpi-user" placeholder="Enter username" required autocomplete="off" />
            </div>
            <div class="fakesite-field">
              <label for="bpi-pass">Password</label>
              <input type="password" id="bpi-pass" placeholder="Enter password" required autocomplete="off" />
            </div>
            <div class="fakesite-row">
              <label class="fakesite-remember">
                <input type="checkbox" checked /> Remember User ID
              </label>
              <a href="#" class="fakesite-link" onclick="event.preventDefault(); showToast('⚠️ Fake link: Phishing sites only harvest submitted passwords.', 'warning');">Forgot Password?</a>
            </div>
            <button type="submit" class="fakesite-submit" style="background:linear-gradient(90deg, #8a0011, #b3001b);">
              Log In &amp; Verify Account
            </button>
          </form>
          <div class="fakesite-card-footer">
            <p>Don't have an account? <a href="#" onclick="event.preventDefault(); showToast('⚠️ Fake link on phishing portal.', 'warning');">Register for BPI Online</a></p>
          </div>
        </div>
      </div>
      <div class="fakesite-footer">
        <p>© 2026 Bank of the Philippine Islands. Regulated by the Bangko Sentral ng Pilipinas.</p>
      </div>
    </div>`,

  'https://paypal-account-check.com/login': `
    <div class="fakesite fakesite-paypal">
      <div class="phish-sim-banner">
        <span class="phish-banner-icon">🚨</span>
        <span class="phish-banner-text">Look at the browser URL bar: <code>paypal-account-check.com</code> is a fake clone! Real PayPal is <code>paypal.com</code>.</span>
      </div>
      <div class="fakesite-header" style="background:#ffffff;border-bottom:1px solid #e2e8f0;">
        <div class="fakesite-header-inner">
          <div class="fakesite-logo" style="color:#003087;">🅿️ PayPal</div>
          <div class="fakesite-subtag" style="color:#64748b;">Security &amp; Verification Center</div>
        </div>
      </div>
      <div class="fakesite-body">
        <div class="fakesite-card">
          <div class="fakesite-card-header">
            <h2 style="color:#003087;">Log in to your PayPal account</h2>
            <p>We detected unauthorized activity. Please verify your credentials to restore wallet access.</p>
          </div>
          <form onsubmit="event.preventDefault(); handlePhishingSubmit('paypal-account-check.com', 'PayPal');">
            <div class="fakesite-field">
              <label for="paypal-email">Email address or mobile number</label>
              <input type="text" id="paypal-email" placeholder="Email or mobile number" required autocomplete="off" />
            </div>
            <div class="fakesite-field">
              <label for="paypal-pass">PayPal Password</label>
              <input type="password" id="paypal-pass" placeholder="Password" required autocomplete="off" />
            </div>
            <div class="fakesite-row">
              <label class="fakesite-remember">
                <input type="checkbox" checked /> Stay logged in
              </label>
              <a href="#" class="fakesite-link" onclick="event.preventDefault(); showToast('⚠️ Fake link: Attackers only collect submitted credentials.', 'warning');">Having trouble logging in?</a>
            </div>
            <button type="submit" class="fakesite-submit" style="background:linear-gradient(90deg, #003087, #0070ba);">
              Log In &amp; Restore Access
            </button>
            <div style="margin-top:14px;text-align:center;">
              <button type="button" class="fakesite-secondary-btn" onclick="event.preventDefault(); showToast('⚠️ Fake link on phishing portal.', 'warning');">Sign Up</button>
            </div>
          </form>
        </div>
      </div>
      <div class="fakesite-footer">
        <p>English | Español | Français | Contact Us | Privacy | Legal</p>
        <p style="margin-top:4px;">Copyright © 1999–2026 PayPal. All rights reserved.</p>
      </div>
    </div>`,

  'https://gcash-claim-rewards.com/verify': `
    <div class="fakesite fakesite-gcash">
      <div class="phish-sim-banner">
        <span class="phish-banner-icon">🚨</span>
        <span class="phish-banner-text">Look at the browser URL bar: <code>gcash-claim-rewards.com</code> is an MPIN harvesting scam! Authentic GCash is <code>gcash.com</code>.</span>
      </div>
      <div class="fakesite-header" style="background:linear-gradient(90deg,#005cfc,#007dfc);">
        <div class="fakesite-header-inner">
          <div class="fakesite-logo">📱 GCash</div>
          <div class="fakesite-subtag">Rewards &amp; Cash Rebates</div>
        </div>
      </div>
      <div class="fakesite-body">
        <div class="fakesite-card">
          <div class="fakesite-card-header">
            <h2 style="color:#005cfc;">🎉 Claim Your ₱5,000 Cash Reward</h2>
            <p>Special loyalty reward for verified GCash accounts. Enter details below to deposit directly into your wallet.</p>
          </div>
          <form onsubmit="event.preventDefault(); handlePhishingSubmit('gcash-claim-rewards.com', 'GCash');">
            <div class="fakesite-field">
              <label for="gcash-phone">Registered Mobile Number</label>
              <div class="fakesite-phone-wrap">
                <span class="fakesite-phone-prefix">+63</span>
                <input type="tel" id="gcash-phone" placeholder="9XX XXX XXXX" maxlength="12" required autocomplete="off" />
              </div>
            </div>
            <div class="fakesite-field">
              <label for="gcash-mpin">4-Digit MPIN (Security Code)</label>
              <input type="password" id="gcash-mpin" maxlength="4" placeholder="••••" required autocomplete="off" style="letter-spacing:6px;font-size:18px;text-align:center;" />
            </div>
            <div class="fakesite-field">
              <label for="gcash-otp">One-Time PIN (OTP) from SMS</label>
              <input type="password" id="gcash-otp" maxlength="6" placeholder="6-digit OTP" autocomplete="off" style="letter-spacing:4px;text-align:center;" />
            </div>
            <button type="submit" class="fakesite-submit" style="background:linear-gradient(90deg,#005cfc,#007dfc);">
              Verify &amp; Claim ₱5,000 Reward
            </button>
          </form>
        </div>
      </div>
      <div class="fakesite-footer">
        <p>GCash is regulated by the Bangko Sentral ng Pilipinas (BSP).</p>
      </div>
    </div>`,

  'https://northfield-scholarship.com/download/Scholarship_Grant_Form.pdf.exe': `
    <div class="fakesite fakesite-corporate">
      <div class="phish-sim-banner">
        <span class="phish-banner-icon">🚨</span>
        <span class="phish-banner-text">Look at the browser URL bar: <code>northfield-scholarship.com</code> is a fake phishing website attempting to distribute malware disguised as a PDF (.pdf.exe)!</span>
      </div>
      <div class="fakesite-header" style="background:#1e293b;">
        <div class="fakesite-header-inner">
          <div class="fakesite-logo" style="color:#38bdf8;">🎓 Northfield Scholarship Foundation (SIMULATED MALICIOUS DOMAIN)</div>
          <div class="fakesite-subtag">Student Financial Assistance Portal</div>
        </div>
      </div>
      <div class="fakesite-body" style="text-align:center;padding:48px 24px;">
        <div class="fakesite-card" style="max-width:520px;margin:0 auto;">
          <div style="font-size:42px;margin-bottom:12px;">⚠️</div>
          <h2 style="color:#ef4444;font-size:20px;margin-bottom:12px;">High-Risk Download Blocked</h2>
          <p style="color:#cbd5e1;line-height:1.6;margin-bottom:20px;font-size:14px;">
            The file <code>Scholarship_Grant_Form.pdf.exe</code> contains a dangerous double extension. Attackers disguise executable files as PDF documents to deploy spyware, trojans, or ransomware.
          </p>
          <div style="background:#0f172a;border:1px solid #334155;border-radius:8px;padding:16px;text-align:left;font-size:12px;color:#94a3b8;line-height:1.8;">
            <div><strong>Threat Classification:</strong> Malicious Executable (.EXE Trojan)</div>
            <div><strong>Sender Domain:</strong> northfield-scholarship.com (Spoofed)</div>
            <div><strong>Official School Domain:</strong> northfield.edu.ph</div>
            <div><strong>Action:</strong> Flagged as suspicious evidence in CyberZerØ Sandbox.</div>
          </div>
        </div>
      </div>
      <div class="fakesite-footer">
        <p>CyberZerØ Threat Intelligence Simulation • Northfield High School Security Lab</p>
      </div>
    </div>`
};

// The browser's default "home" page — a mock Google search homepage
var BROWSER_HOME_HTML = `
  <div class="browser-home">
    <div class="google-logo"><span style="color:#4285F4">G</span><span style="color:#EA4335">o</span><span style="color:#FBBC05">o</span><span style="color:#4285F4">g</span><span style="color:#34A853">l</span><span style="color:#EA4335">e</span></div>
    <div class="google-search-box">
      <span class="google-search-icon">🔍</span>
      <input type="text" id="browser-home-search" class="google-search-input" placeholder="Search Google or type a URL" autocomplete="off" spellcheck="false" onkeydown="handleHomeSearchKey(event)" oninput="handleHomeSearchInput(this)" />
      <button type="button" class="google-search-clear" id="browser-home-search-clear" style="display:none;" onclick="clearHomeSearch()" title="Clear">✕</button>
    </div>
    <div class="google-search-actions">
      <button class="google-btn" onclick="submitHomeSearch()">Google Search</button>
    </div>
  </div>`;
window.BROWSER_HOME_HTML = BROWSER_HOME_HTML;
