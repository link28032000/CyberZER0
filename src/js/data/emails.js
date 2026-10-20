/* ═══════════════════════════════════════════════════════════
   CYBERZERO — script.js
   Full game engine: state, data, systems, UI
═══════════════════════════════════════════════════════════ */

'use strict';

// ═══════════════════════════════════════════════════════════
// GAME DATA
// ═══════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════
// CHAPTER 1 — DYNAMIC EMAIL SIMULATION SYSTEM
// Flow: EMPTY INBOX → NOTIFICATION (1) → FIRST PHISHING EMAIL →
// INVESTIGATION → FLAG MODE → FEEDBACK → NEW EMAILS → MIXED EMAILS →
// TECHNICAL SOLUTIONS → FINAL SCENARIO → KNOWLEDGE CHECK → COMPLETE
// ═══════════════════════════════════════════════════════════

// Master email pool for Chapter 1 (9 emails, injected in 4 waves)
const EMAILS = [
  // === EMAIL 1: First phishing — loads on first Zmail open ===
  {
    id: 1,
    sender: { name: 'PayPal Rewards Claim', address: 'rewards-claim@paypa1.com' },
    subject: 'CONGRATULATIONS: You Won ₱1,000,000 Pesos! Claim Your Prize Now',
    time: '8:14 AM',
    preview: 'Congratulations! You have been selected as the grand winner of 1,000,000 Pesos (PHP 1,000,000.00). Click Claim Now within 30 minutes to transfer...',
    phishing: true,
    evidence: ['fake_sender', 'false_urgency', 'suspicious_link'],
    body: [
      { type: 'p', text: 'Dear Valued Winner,' },
      { type: 'p', text: 'Congratulations! Your account has been randomly chosen as the GRAND PRIZE WINNER of ₱1,000,000 Pesos (PHP 1,000,000.00) in the Annual International E-Wallet Promo Raffle!' },
      {
        type: 'p-flag',
        flagId: 'urgency',
        flagType: 'false_urgency',
        text: 'URGENT: You must claim your ₱1,000,000 pesos prize within 30 minutes, or your winnings will be permanently forfeited and transferred to an alternate winner!',
        label: 'FALSE URGENCY'
      },
      { type: 'p', text: 'To deposit your ₱1,000,000 cash prize directly into your PayPal account, click the official disbursement button below and log in to verify your identity:' },
      {
        type: 'link',
        flagId: 'link1',
        flagType: 'suspicious_link',
        text: 'Claim Now — Transfer ₱1,000,000 to PayPal',
        destination: 'https://paypa1.com/claim-reward',
        label: 'SUSPICIOUS LINK'
      },
      { type: 'p', text: 'Do not share this link. It is tied exclusively to your winning claim ticket.' },
      { type: 'p', text: 'Best regards,\nPayPal International Rewards Team\nPrize Disbursement Division' }
    ],
    capybaraAnalysis: {
      fake_sender: {
        correct: '🚩 SENDER — CORRECT\nThe domain <code>paypa1.com</code> uses the digit \'1\' instead of the letter \'l\' in \'paypal\' — a classic typosquatting attack! Authentic PayPal emails only originate from <code>@paypal.com</code>.',
        missed: '🚩 MISSED — FAKE SENDER\nThe sender <code>rewards-claim@paypa1.com</code> uses a fake typosquatted domain with the digit \'1\' instead of \'l\'. Real PayPal emails come from <code>@paypal.com</code>.'
      },
      false_urgency: {
        correct: '🚩 URGENCY — CORRECT\nThe 30-minute forfeiture threat and sudden ₱1,000,000 reward are classic social engineering tactics. Scammers manufacture extreme urgency so victims rush to click without verifying.',
        missed: '🚩 MISSED — FALSE URGENCY\nThe 30-minute deadline claiming you will lose your ₱1,000,000 prize is manufactured pressure designed to stop you from thinking critically.'
      },
      suspicious_link: {
        correct: '🚩 LINK — CORRECT\nThe \'Claim Now\' button leads to <code>https://paypa1.com/claim-reward</code> — a counterfeit typosquatted website (paypa1 with the digit \'1\') built to harvest your PayPal credentials.',
        missed: '🚩 MISSED — SUSPICIOUS LINK\nThe \'Claim Now\' button directs to <code>https://paypa1.com/claim-reward</code> instead of the authentic <code>paypal.com</code> domain. Always inspect link destination URLs before clicking.'
      }
    },
    ryanTutor: {
      correct: [
        { text: '✅ Outstanding catch! This was a classic prize scam phishing email. The sender domain is "paypa1.com" — notice the number "1" instead of the letter "l"! Attackers register look-alike typosquat domains to deceive you.', state: 'success' },
        { text: 'The "You won ₱1,000,000 Pesos" lure and "30-minute forfeiture deadline" are false urgency tactics — dangling huge sums of money with artificial pressure so you panic and act without thinking.', state: 'speaking' },
        { text: 'The "Claim Now" button directs to "paypa1.com" — a counterfeit phishing site created to harvest your PayPal login credentials. Always hover over links to inspect the actual web address!', state: 'thinking' }
      ],
      wrong: [
        { text: '⚠️ That was actually a phishing email! Look closely at the sender: "rewards-claim@paypa1.com". The domain uses the number "1" instead of the letter "l" — a deceptive typosquat!', state: 'concerned' },
        { text: 'Unsolicited emails claiming you won ₱1,000,000 Pesos with a 30-minute countdown are always phishing scams. Real organizations never give away money out of the blue or set panic ultimatums.', state: 'speaking' },
        { text: 'The "Claim Now" link pointed to "paypa1.com" to harvest your PayPal account credentials. Remember: Stop, Check, and Verify before trusting any links!', state: 'thinking' }
      ]
    }
  },

  // === EMAIL 2: Legitimate HR email — Wave 2 ===
  {
    id: 2,
    sender: { name: 'HR Department', address: 'hr@business.com' },
    subject: 'Updated Employee Benefits Information',
    time: '9:02 AM',
    preview: 'Please review the updated employee benefits package for the upcoming quarter...',
    phishing: false,
    evidence: [],
    body: [
      { type: 'p', text: 'Dear Team Member,' },
      { type: 'p', text: 'We are pleased to share the updated employee benefits package for the upcoming quarter. Please take a moment to review the changes.' },
      { type: 'p', text: 'Key updates include:\n\u2022 Enhanced health coverage options\n\u2022 Updated dental and vision plans\n\u2022 Expanded wellness program benefits\n\u2022 New remote work allowance policy' },
      { type: 'p', text: 'Full details are available through the company\'s internal HR portal using your standard work credentials. No password reset or account verification is required.' },
      { type: 'p', text: 'If you have questions, please contact HR directly at hr@business.com or visit us in Room 204.' },
      { type: 'p', text: 'Best regards,\nHR Department\nBusiness Inc.' }
    ],
    capybaraAnalysis: {},
    ryanTutor: {
      correct: [
        { text: '\u2705 Correct! This was a legitimate HR email. The sender \"hr@business.com\" uses the company\'s own official domain \u2014 that\'s a trusted, verified source.', state: 'success' },
        { text: 'It contained no urgency pressure, no suspicious external links, and no requests for your password. It simply informed you about benefits and directed you to the official internal HR portal. That\'s how real internal emails behave.', state: 'speaking' }
      ],
      wrong: [
        { text: '\u26a0\ufe0f That was actually a legitimate email! The sender \"hr@business.com\" uses the company\'s real domain \u2014 \"business.com\". That\'s a verified, trusted source.', state: 'concerned' },
        { text: 'It contained no urgency tactics, no external links asking for passwords, and no threats. It simply informed you of a benefits update. Not every email is a threat \u2014 always verify the sender\'s domain first before deciding.', state: 'speaking' }
      ]
    }
  },

  // === EMAIL 3: Phishing — Microsoft typosquat — Wave 2 ===
  {
    id: 3,
    sender: { name: 'Microsoft Security', address: 'security-alert@m1crosoft-support.com' },
    subject: 'Unusual Sign-In Detected on Your Account',
    time: '9:28 AM',
    preview: 'We detected a sign-in attempt from an unrecognized device. Your account may be at risk...',
    phishing: true,
    evidence: ['fake_sender', 'false_urgency', 'suspicious_link'],
    body: [
      { type: 'p', text: 'Dear Microsoft Account User,' },
      { type: 'p', text: 'We detected a sign-in attempt to your Microsoft account from an unrecognized device in an unusual geographic location.' },
      {
        type: 'p-flag',
        flagId: 'urgency',
        flagType: 'false_urgency',
        text: 'IMMEDIATE ACTION REQUIRED: Your account will be locked in 60 minutes unless you verify this activity and confirm your identity.',
        label: 'FALSE URGENCY'
      },
      { type: 'p', text: 'If this was not you, please secure your account immediately by reviewing the activity and changing your password.' },
      {
        type: 'link',
        flagId: 'link1',
        flagType: 'suspicious_link',
        text: 'Review Account Activity',
        destination: 'https://m1crosoft-account-verify.com/signin',
        label: 'SUSPICIOUS LINK'
      },
      { type: 'p', text: 'Regards,\nMicrosoft Account Security Team' }
    ],
    capybaraAnalysis: {
      fake_sender: {
        correct: '\ud83d\udea9 SENDER \u2014 CORRECT\nThe domain <code>m1crosoft-support.com</code> uses the digit \'1\' instead of the letter \'i\' in \'Microsoft\' \u2014 a typosquat attack. Real Microsoft emails come from <code>@microsoft.com</code>.',
        missed: '\ud83d\udea9 MISSED \u2014 FAKE SENDER\nThe sender domain <code>m1crosoft-support.com</code> substitutes the digit \'1\' for the letter \'i\' \u2014 a typosquat. Microsoft\'s real domain is <code>microsoft.com</code>.'
      },
      false_urgency: {
        correct: '\ud83d\udea9 URGENCY \u2014 CORRECT\nA 60-minute account lockout is manufactured urgency. Real Microsoft security alerts let you review activity at your own pace and do not impose hour-long ultimatums.',
        missed: '\ud83d\udea9 MISSED \u2014 FALSE URGENCY\nThe 60-minute countdown is social engineering pressure. Real security alerts do not force immediate action under artificial time limits.'
      },
      suspicious_link: {
        correct: '\ud83d\udea9 LINK \u2014 CORRECT\nThe link goes to <code>m1crosoft-account-verify.com</code> \u2014 a fake typosquat domain. Real Microsoft account management uses <code>account.microsoft.com</code>.',
        missed: '\ud83d\udea9 MISSED \u2014 SUSPICIOUS LINK\nThe button leads to <code>https://m1crosoft-account-verify.com/signin</code> \u2014 not Microsoft\'s real domain. Always verify the destination URL before clicking.'
      }
    },
    ryanTutor: {
      correct: [
        { text: '\u2705 Well spotted! This was a phishing email. Look closely at the sender: \"m1crosoft-support.com\" \u2014 that\'s the digit \"1\" (one) instead of the letter \"i\". This is called a typosquat attack.', state: 'success' },
        { text: 'Real Microsoft emails only ever come from \"@microsoft.com\". The 60-minute lockout threat is manufactured urgency \u2014 real Microsoft security alerts let you review activity at your own pace.', state: 'speaking' },
        { text: 'The link also went to \"m1crosoft-account-verify.com\" \u2014 same fake typosquat domain. Always read email addresses character by character. One digit difference can mean the difference between real and fake!', state: 'thinking' }
      ],
      wrong: [
        { text: '\u26a0\ufe0f That was actually a phishing email! Look at the sender: \"m1crosoft-support.com\" \u2014 that\'s the digit \"1\" (one) instead of the letter \"i\" in Microsoft. This typosquat trick is designed to fool you at a quick glance.', state: 'concerned' },
        { text: 'Always read email addresses character by character. Real Microsoft emails only come from \"@microsoft.com\". The 60-minute lockout was manufactured pressure to stop you from thinking clearly.', state: 'speaking' }
      ]
    }
  },

  // === EMAIL 4: Legitimate IT Maintenance — Wave 2 ===
  {
    id: 4,
    sender: { name: 'IT Support', address: 'it-support@business.com' },
    subject: 'Scheduled Network Maintenance \u2014 This Saturday',
    time: '10:15 AM',
    preview: 'The IT team will conduct scheduled network maintenance this Saturday from 10 PM to 2 AM...',
    phishing: false,
    evidence: [],
    body: [
      { type: 'p', text: 'Dear All Staff,' },
      { type: 'p', text: 'The IT Support team will be conducting scheduled network infrastructure maintenance this Saturday, from 10:00 PM to 2:00 AM.' },
      { type: 'p', text: 'Services temporarily unavailable during this window:\n\u2022 VPN access\n\u2022 Internal file server\n\u2022 Company intranet portal\n\u2022 Email (intermittent)' },
      { type: 'p', text: 'No action is required from you. Your files and credentials remain secure. You do NOT need to update your password after maintenance.' },
      { type: 'p', text: 'For urgent matters, contact on-call IT at: it-oncall@business.com or ext. 4400.' },
      { type: 'p', text: 'We apologize for any inconvenience.\n\nIT Support Team\nBusiness Inc.' }
    ],
    capybaraAnalysis: {},
    ryanTutor: {
      correct: [
        { text: '\u2705 Correct! This was a legitimate IT maintenance notice from \"it-support@business.com\" \u2014 the company\'s official IT domain.', state: 'success' },
        { text: 'It made no requests for your credentials, had no suspicious external links, and applied no pressure. It simply informed you of planned downtime. Real IT notices never ask for passwords during maintenance.', state: 'speaking' }
      ],
      wrong: [
        { text: '\u26a0\ufe0f That was a legitimate IT maintenance email! The sender \"it-support@business.com\" is on the company\'s real official domain \"business.com\".', state: 'concerned' },
        { text: 'It asked for nothing from you \u2014 no passwords, no clicks on external links, no urgent action. Legitimate IT notices just inform you of planned downtime. When an email only informs and asks for nothing, and the sender is on the official domain \u2014 it\'s legitimate.', state: 'speaking' }
      ]
    }
  },

  // === EMAIL 5: Technical Solutions legitimate — Wave 3 ===
  {
    id: 5,
    sender: { name: 'Technical Solutions Team', address: 'technical.solutions@business.com' },
    subject: 'System Maintenance and Technical Update',
    time: '11:00 AM',
    preview: 'Monthly system maintenance has been completed. Please review the update summary for your department...',
    phishing: false,
    evidence: [],
    body: [
      { type: 'p', text: 'Dear Department Staff,' },
      { type: 'p', text: 'This is a routine notification from the Technical Solutions Team confirming that the monthly system maintenance cycle has been completed successfully.' },
      { type: 'p', text: 'Updates completed this cycle:\n\u2022 Security patch KB-2024-09 applied to all workstations\n\u2022 Database backup verified and stored to secure off-site location\n\u2022 Network monitoring tools upgraded to version 4.2\n\u2022 Legacy software compatibility testing completed' },
      { type: 'p', text: 'No action is required from your end. All systems are operating normally. Your credentials, passwords, and access privileges are unchanged.' },
      { type: 'p', text: 'If you notice any technical issues after this update, please submit a support ticket at the IT help portal or email technical.solutions@business.com.' },
      { type: 'p', text: 'Thank you for your cooperation.\n\nTechnical Solutions Team\nBusiness Inc. IT Division' }
    ],
    capybaraAnalysis: {},
    ryanTutor: {
      correct: [
        { text: '\u2705 Good judgment! This was a legitimate system maintenance notification from \"technical.solutions@business.com\" \u2014 a verified official company address.', state: 'success' },
        { text: 'It reported completed maintenance work, made no credential requests, had no suspicious links, and directed any issues to official support channels. That\'s exactly how real IT update notifications look.', state: 'speaking' }
      ],
      wrong: [
        { text: '\u26a0\ufe0f That was actually a legitimate email! \"technical.solutions@business.com\" is an official company address on the real domain \"business.com\".', state: 'concerned' },
        { text: 'The email simply reported completed maintenance \u2014 no links to click, no passwords to enter, no threats. When an email only informs you without asking for anything, and the sender is on the official domain, it is almost always legitimate.', state: 'speaking' }
      ]
    }
  },

  // === EMAIL 6: Final Scenario — Legitimate payroll — Wave 4 ===
  {
    id: 6,
    sender: { name: 'Payroll Department', address: 'payroll@business.com' },
    subject: 'September Payroll Processing Confirmation',
    time: '11:45 AM',
    preview: 'Your September payroll has been processed and will be deposited within 1-2 business days...',
    phishing: false,
    evidence: [],
    body: [
      { type: 'p', text: 'Dear Team Member,' },
      { type: 'p', text: 'This is to confirm that September payroll has been successfully processed. Your salary will be deposited to your registered bank account within 1\u20132 business days.' },
      { type: 'p', text: 'Payroll details can be reviewed via the company HR portal using your standard employee credentials. No additional verification is required.' },
      { type: 'p', text: 'If you have payroll questions, contact us at payroll@business.com or visit HR between 9 AM and 5 PM on working days.' },
      { type: 'p', text: 'Regards,\nPayroll Department\nBusiness Inc.' }
    ],
    capybaraAnalysis: {},
    ryanTutor: {
      correct: [
        { text: '\u2705 Correct! This payroll confirmation from \"payroll@business.com\" is legitimate. It uses the company\'s official domain and requires nothing from you.', state: 'success' },
        { text: 'It simply confirms salary processing and refers you to the internal HR portal \u2014 no credentials to submit, no suspicious links, no urgency pressure. That\'s normal, routine business communication.', state: 'speaking' }
      ],
      wrong: [
        { text: '\u26a0\ufe0f That was actually a legitimate payroll email! \"payroll@business.com\" is on the company\'s real domain. It simply confirms your salary was processed \u2014 no action required from you.', state: 'concerned' },
        { text: 'Payroll confirmation emails are routine business notifications. They inform \u2014 they don\'t pressure. Ask yourself: Is the sender on the official domain? Does it ask for credentials or links? If no to both \u2014 it\'s legitimate.', state: 'speaking' }
      ]
    }
  },

  // === EMAIL 7: Final Scenario — Obvious phishing — Wave 4 ===
  {
    id: 7,
    sender: { name: 'BANK SECURITY', address: 'urgent-alert@bankng-secure-verify.xyz' },
    subject: '\u26a0\ufe0f FINAL WARNING: Account Suspended \u2014 Act NOW!',
    time: '12:10 PM',
    preview: 'Your bank account has been suspended. You have 15 minutes to verify or lose all access permanently...',
    phishing: true,
    evidence: ['fake_sender', 'false_urgency', 'suspicious_link'],
    body: [
      { type: 'p', text: 'ATTENTION ACCOUNT HOLDER,' },
      { type: 'p', text: '\u26a0\ufe0f Your bank account has been SUSPENDED due to multiple failed verification attempts. To restore access, you must confirm your identity IMMEDIATELY.' },
      {
        type: 'p-flag',
        flagId: 'urgency',
        flagType: 'false_urgency',
        text: '\ud83d\udd34 FINAL WARNING: You have 15 MINUTES to verify your account or you will permanently lose access to all your funds.',
        label: 'FALSE URGENCY'
      },
      { type: 'p', text: 'Click below NOW to restore your account before it is permanently closed and your balance is frozen.' },
      {
        type: 'link',
        flagId: 'link1',
        flagType: 'suspicious_link',
        text: 'RESTORE MY ACCOUNT IMMEDIATELY',
        destination: 'https://bankng-secure-verify.xyz/restore',
        label: 'SUSPICIOUS LINK'
      },
      { type: 'p', text: 'DO NOT IGNORE THIS MESSAGE.\nBank Security Division' }
    ],
    capybaraAnalysis: {
      fake_sender: {
        correct: '\ud83d\udea9 SENDER \u2014 CORRECT\nThe domain <code>bankng-secure-verify.xyz</code> misspells \'banking\' and uses a <code>.xyz</code> TLD. Real banks never use <code>.xyz</code> domains for official communications.',
        missed: '\ud83d\udea9 MISSED \u2014 FAKE SENDER\nThe sender <code>urgent-alert@bankng-secure-verify.xyz</code> is clearly fake. \'bankng\' misspells \'banking\' and <code>.xyz</code> is not used by real financial institutions.'
      },
      false_urgency: {
        correct: '\ud83d\udea9 URGENCY \u2014 CORRECT\n\'FINAL WARNING\' in all-caps with a 15-minute countdown is extreme psychological pressure. No real bank sends 15-minute ultimatums or threatens to permanently freeze funds via email.',
        missed: '\ud83d\udea9 MISSED \u2014 FALSE URGENCY\nThe 15-MINUTE countdown and \'FINAL WARNING\' all-caps language are extreme social engineering tactics. Real banks never impose 15-minute deadlines via email.'
      },
      suspicious_link: {
        correct: '\ud83d\udea9 LINK \u2014 CORRECT\nThe link leads to <code>bankng-secure-verify.xyz/restore</code> \u2014 the same misspelled fake domain as the sender. Attacker-controlled sender and link domains always match.',
        missed: '\ud83d\udea9 MISSED \u2014 SUSPICIOUS LINK\nThe button leads to <code>bankng-secure-verify.xyz</code> \u2014 a fake domain matching the fake sender. Always verify where links actually go.'
      }
    },
    ryanTutor: {
      correct: [
        { text: '\u2705 Caught it! The sender \"urgent-alert@bankng-secure-verify.xyz\" misspells \"banking\" as \"bankng\" and uses a \".xyz\" domain. No real bank ever uses \".xyz\" for official communications.', state: 'success' },
        { text: '\"FINAL WARNING\" in all caps with a 15-MINUTE countdown to freeze your funds is extreme social engineering. Real banks never send 15-minute ultimatums via email or threaten to permanently freeze your money.', state: 'speaking' },
        { text: 'The link went to \"bankng-secure-verify.xyz\" \u2014 the same fake domain as the sender. When the sender and link share the same non-official domain, it always confirms a phishing attack.', state: 'thinking' }
      ],
      wrong: [
        { text: '\u26a0\ufe0f That was a phishing email! The sender \"urgent-alert@bankng-secure-verify.xyz\" misspells \"banking\" as \"bankng\" and uses a \".xyz\" domain \u2014 no real bank ever uses that.', state: 'concerned' },
        { text: '\"FINAL WARNING\" and a 15-MINUTE threat to freeze your funds is extreme social engineering designed to cause panic. Stop and always ask: would my real bank actually send this? The answer is always no.', state: 'speaking' }
      ]
    }
  },

  // === EMAIL 8: Final Scenario — Sophisticated phishing — Wave 4 ===
  {
    id: 8,
    sender: { name: 'IT Security Operations', address: 'security-ops@business-it-support.com' },
    subject: 'Action Required: Security Policy Compliance Update',
    time: '12:35 PM',
    preview: 'All employees are required to complete mandatory security compliance verification before Friday...',
    phishing: true,
    evidence: ['fake_sender', 'false_urgency', 'suspicious_link'],
    body: [
      { type: 'p', text: 'Dear Employee,' },
      { type: 'p', text: 'As part of our annual cybersecurity compliance review, all employees are required to verify their account credentials through our updated secure portal.' },
      { type: 'p', text: 'This is a mandatory requirement under our updated IT Security Policy (ISP-2024-07). Non-compliance may result in temporary account restrictions.' },
      {
        type: 'p-flag',
        flagId: 'urgency',
        flagType: 'false_urgency',
        text: 'IMPORTANT: This compliance verification must be completed by this Friday, 5:00 PM. Accounts not verified by this deadline will be suspended pending manual review.',
        label: 'FALSE URGENCY'
      },
      { type: 'p', text: 'Please use the secure compliance portal link below to complete your verification. The process takes approximately 3 minutes.' },
      {
        type: 'link',
        flagId: 'link1',
        flagType: 'suspicious_link',
        text: 'Complete Security Compliance Verification',
        destination: 'https://business-it-support.com/compliance-portal',
        label: 'SUSPICIOUS LINK'
      },
      { type: 'p', text: 'Thank you for helping us maintain a secure workplace.\n\nIT Security Operations\nCompliance & Risk Management' }
    ],
    capybaraAnalysis: {
      fake_sender: {
        correct: '\ud83d\udea9 SENDER \u2014 CORRECT\nThe sender uses <code>business-it-support.com</code> \u2014 not the company\'s real domain <code>business.com</code>. Sophisticated phishers register plausible domains to impersonate internal IT departments.',
        missed: '\ud83d\udea9 MISSED \u2014 FAKE SENDER\nThe sender is <code>security-ops@business-it-support.com</code>. This looks official, but the domain is <code>business-it-support.com</code> \u2014 not the real company domain <code>business.com</code>.'
      },
      false_urgency: {
        correct: '\ud83d\udea9 URGENCY \u2014 CORRECT\nA Friday deadline with suspension threats is manufactured urgency \u2014 just more credible-sounding. Real compliance requirements are announced well in advance through multiple official channels.',
        missed: '\ud83d\udea9 MISSED \u2014 FALSE URGENCY\nThe \'Friday 5 PM deadline with suspension\' creates time pressure. Sophisticated phishing uses realistic-sounding deadlines. Real compliance notices go through multiple official channels.'
      },
      suspicious_link: {
        correct: '\ud83d\udea9 LINK \u2014 CORRECT\nThe compliance portal link goes to <code>business-it-support.com</code> \u2014 the same fake domain as the sender, not the real company domain <code>business.com</code>.',
        missed: '\ud83d\udea9 MISSED \u2014 SUSPICIOUS LINK\nThe link leads to <code>business-it-support.com/compliance-portal</code> \u2014 not <code>business.com</code>. The sender and link share the same fake domain, confirming a coordinated phishing attack.'
      }
    },
    ryanTutor: {
      correct: [
        { text: '\u2705 Excellent! This was a sophisticated phishing attempt \u2014 one of the hardest to catch. The sender \"security-ops@business-it-support.com\" looks official, but the domain is \"business-it-support.com\", NOT \"business.com\".', state: 'success' },
        { text: 'This is an advanced attack using a plausible domain. The \"Friday 5 PM deadline\" sounds like a real compliance notice \u2014 but real compliance updates are always announced through multiple official channels, not a single urgent email.', state: 'speaking' },
        { text: 'The compliance portal link also used \"business-it-support.com\" \u2014 same fake domain as the sender. Rule: always compare the sender domain against your company\'s REAL domain. Even one extra word in the domain makes it fake.', state: 'thinking' }
      ],
      wrong: [
        { text: '\u26a0\ufe0f That was a sophisticated phishing email \u2014 the hardest kind! The sender used \"business-it-support.com\" which looks like an IT address, but is NOT \"business.com\".', state: 'concerned' },
        { text: 'Always compare the sender\'s exact domain against your company\'s real official domain. \"business-it-support.com\" vs \"business.com\" \u2014 one extra phrase makes it a fake.', state: 'speaking' },
        { text: 'The \"Friday deadline\" and \"account suspension\" were pressure tactics. Real compliance requirements are always announced through multiple official channels \u2014 never a single urgent email. When in doubt, verify directly with IT.', state: 'thinking' }
      ]
    }
  },

  // === EMAIL 9: Final Scenario — Legitimate IT ticket — Wave 4 ===
  {
    id: 9,
    sender: { name: 'IT Help Desk', address: 'helpdesk@business.com' },
    subject: 'Your IT Support Ticket #4821 Has Been Resolved',
    time: '1:05 PM',
    preview: 'Your recent support ticket regarding email configuration has been resolved...',
    phishing: false,
    evidence: [],
    body: [
      { type: 'p', text: 'Dear Employee,' },
      { type: 'p', text: 'This is an automated notification from the IT Help Desk system. Your support ticket #4821 (Email Configuration Issue) has been resolved.' },
      { type: 'p', text: 'Resolution summary:\n\u2022 Mailbox synchronization settings have been corrected\n\u2022 Junk mail filters updated\n\u2022 Email signature template restored to default' },
      { type: 'p', text: 'If you continue to experience issues, please reply to this email or submit a new ticket via the company intranet. No credentials were modified during this process.' },
      { type: 'p', text: 'Thank you,\nIT Help Desk\nBusiness Inc. \u2014 Ticket System' }
    ],
    capybaraAnalysis: {},
    ryanTutor: {
      correct: [
        { text: '\u2705 Correct! This IT ticket confirmation from \"helpdesk@business.com\" is legitimate. It uses the company\'s official domain and simply notifies you of a resolved support ticket.', state: 'success' },
        { text: 'No credentials were requested, no suspicious external links, and no urgency threats. Automated ticket notifications are normal business processes. You verified correctly \u2014 well done!', state: 'speaking' }
      ],
      wrong: [
        { text: '\u26a0\ufe0f That was a legitimate IT Help Desk notification! \"helpdesk@business.com\" uses the company\'s official domain \"business.com\". It simply confirms a support ticket was resolved.', state: 'concerned' },
        { text: 'Ticket notifications are routine automated emails. No credential requests, no urgency threats. The key check: is the sender on the official domain, and does it ask for anything? If no to both \u2014 it\'s legitimate.', state: 'speaking' }
      ]
    }
  },

  // === EMAIL 10: Phishing Scholarship Lure with Malicious File Attachment — Wave 4 ===
  {
    id: 10,
    sender: { name: 'Northfield Scholarship Committee', address: 'grants-approval@northfield-scholarship.com' },
    subject: 'URGENT: Scholarship Grant Approval Form & Required Documents',
    time: '2:40 PM',
    preview: 'Congratulations! Your academic grant has been approved. Download and submit the attached verification form within 24 hours to secure your funds...',
    phishing: true,
    evidence: ['fake_sender', 'false_urgency', 'suspicious_link'],
    body: [
      { type: 'p', text: 'Dear Student / Grant Applicant,' },
      { type: 'p', text: 'We are pleased to inform you that your academic financial grant application has passed preliminary review and is eligible for immediate disbursement of ₱50,000.' },
      {
        type: 'p-flag',
        flagId: 'urgency',
        flagType: 'false_urgency',
        text: 'CRITICAL NOTICE: Due to strict grant cycle quotas, you must download and submit your signed verification form within 24 hours or your scholarship award will be permanently forfeited.',
        label: 'FALSE URGENCY'
      },
      { type: 'p', text: 'Please review and execute the required grant documentation and student agreement forms below:' },
      {
        type: 'attachment',
        flagId: 'attach1',
        flagType: 'suspicious_link',
        filename: 'Scholarship_Grant_Form.pdf.exe',
        size: '2.4 MB',
        label: 'SUSPICIOUS ATTACHMENT / MALICIOUS FILE',
        destination: 'https://northfield-scholarship.com/download/Scholarship_Grant_Form.pdf.exe'
      },
      { type: 'p', text: 'Ensure you open and run the form installer immediately to finalize your student grant records.\n\nNorthfield Scholarship Foundation\nFinancial Assistance & Awards Office' }
    ],
    capybaraAnalysis: {
      fake_sender: {
        correct: '🚩 SENDER — CORRECT\nThe sender uses <code>grants-approval@northfield-scholarship.com</code> — NOT the school\'s real official domain <code>northfield.edu.ph</code>. Attackers spoof scholarship committees using look-alike domain names.',
        missed: '🚩 MISSED — FAKE SENDER\nThe sender is <code>grants-approval@northfield-scholarship.com</code>. This external domain is not affiliated with the official school domain <code>northfield.edu.ph</code>.'
      },
      false_urgency: {
        correct: '🚩 URGENCY — CORRECT\nThe 24-hour deadline threatening permanent forfeiture is social engineering urgency designed to panic students into opening dangerous files without verification.',
        missed: '🚩 MISSED — FALSE URGENCY\nThe \'24 hours or award forfeited\' warning creates false urgency. Official scholarship programs provide ample notice and multiple verification channels.'
      },
      suspicious_link: {
        correct: '🚩 MALICIOUS FILE / LINK — CORRECT\nThe attachment appears to be a document but carries a dangerous double extension: <code>Scholarship_Grant_Form.pdf.exe</code>! This is an executable program (malware), not a legitimate PDF document.',
        missed: '🚩 MISSED — MALICIOUS FILE / LINK\nThe attached file has a hidden double extension (<code>.pdf.exe</code>). Opening executable files disguised as documents will compromise and infect the computer.'
      }
    },
    ryanTutor: {
      correct: [
        { text: '🎯 Outstanding observation! This was an extremely dangerous phishing email carrying a malicious file attachment!', state: 'success' },
        { text: 'Notice the double extension on "Scholarship_Grant_Form.pdf.exe"? Attackers disguise dangerous executable files as harmless PDFs to trick people into running malware.', state: 'speaking' },
        { text: 'Also notice the fake sender domain "northfield-scholarship.com" instead of the official school domain, paired with a panic-inducing 24-hour deadline. You caught all the red flags!', state: 'success' }
      ],
      wrong: [
        { text: '⚠️ Watch out! That was a high-risk phishing attack carrying malware disguised as a scholarship application!', state: 'concerned' },
        { text: 'The attachment looked like a PDF, but its real extension was ".pdf.exe" — an executable program that installs malware onto the computer when opened.', state: 'speaking' },
        { text: 'Combined with the fake domain "northfield-scholarship.com" and extreme 24-hour urgency, this is a classic spear-phishing attack. Always check file extensions before opening attachments!', state: 'thinking' }
      ]
    }
  }
];
