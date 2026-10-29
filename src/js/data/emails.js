/* ═══════════════════════════════════════════════════════════
   CYBERZERO: emails.js
   Full game engine: state, data, systems, UI
═══════════════════════════════════════════════════════════ */

'use strict';

// ═══════════════════════════════════════════════════════════
// GAME DATA
// ═══════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════
// CHAPTER 1: DYNAMIC EMAIL SIMULATION SYSTEM
// Flow: EMPTY INBOX → NOTIFICATION (1) → FIRST PHISHING EMAIL →
// INVESTIGATION → FLAG MODE → FEEDBACK → NEW EMAILS → MIXED EMAILS →
// TECHNICAL SOLUTIONS → FINAL SCENARIO → KNOWLEDGE CHECK → COMPLETE
// ═══════════════════════════════════════════════════════════

// Master email pool for Chapter 1 (9 emails, injected in 4 waves)
const EMAILS = [
  // === EMAIL 1: First phishing: loads on first Zmail open ===
  {
    id: 1,
    sender: { name: 'PayPal Rewards Claim', address: 'rewards-claim@paypa1.com' },
    subject: 'CONGRATULATIONS: You Won ₱1,000,000 Pesos! Claim Your Prize Now',
    date: 'Mon, Oct 27, 2026',
    time: '8:14 AM',
    preview: 'Congratulations! You have been selected as the grand winner of 1,000,000 Pesos. Click Claim Now within 30 minutes to transfer your prize...',
    phishing: true,
    evidence: ['fake_sender', 'false_urgency', 'suspicious_link'],
    body: [
      { type: 'p', text: 'Dear Valued Winner,' },
      { type: 'p', text: 'Congratulations! Your account has been randomly chosen as the grand prize winner of ₱1,000,000 Pesos in our Annual International Digital Wallet Promo Raffle!' },
      {
        type: 'p-flag',
        flagId: 'urgency',
        flagType: 'false_urgency',
        text: 'URGENT: You must claim your ₱1,000,000 prize within 30 minutes, or your winnings will be permanently forfeited and transferred to an alternate winner!',
        label: 'FALSE URGENCY'
      },
      { type: 'p', text: 'To deposit your ₱1,000,000 cash prize directly into your PayPal account, click the official disbursement button below and log in to verify your identity:' },
      {
        type: 'link',
        flagId: 'link1',
        flagType: 'suspicious_link',
        text: 'Claim Now',
        destination: 'https://paypa1.com/claim-reward',
        label: 'SUSPICIOUS LINK'
      },
      { type: 'p', text: 'Please do not share this link. It is tied exclusively to your winning claim ticket.' },
      { type: 'p', text: 'Best regards,\nPayPal International Rewards Team\nPrize Disbursement Division' }
    ],
    capybaraAnalysis: {
      fake_sender: {
        correct: '🚩 SENDER: CORRECT\nThe domain <code>paypa1.com</code> uses the digit \'1\' instead of the letter \'l\' in \'paypal\', which is a classic typosquatting attack! Authentic PayPal emails only originate from <code>@paypal.com</code>.',
        missed: '🚩 MISSED: FAKE SENDER\nThe sender <code>rewards-claim@paypa1.com</code> uses a fake typosquatted domain with the digit \'1\' instead of \'l\'. Real PayPal emails come from <code>@paypal.com</code>.'
      },
      false_urgency: {
        correct: '🚩 URGENCY: CORRECT\nThe 30 minute forfeiture threat and sudden ₱1,000,000 reward are classic social engineering tactics. Scammers manufacture extreme urgency so victims rush to click without verifying.',
        missed: '🚩 MISSED: FALSE URGENCY\nThe 30 minute deadline claiming you will lose your ₱1,000,000 prize is manufactured pressure designed to stop you from thinking critically.'
      },
      suspicious_link: {
        correct: '🚩 LINK: CORRECT\nThe \'Claim Now\' button leads to <code>https://paypa1.com/claim-reward</code>, a counterfeit lookalike website built to harvest your PayPal credentials.',
        missed: '🚩 MISSED: SUSPICIOUS LINK\nThe \'Claim Now\' button directs to <code>https://paypa1.com/claim-reward</code> instead of the authentic <code>paypal.com</code> domain. Always inspect link destination URLs before clicking.'
      }
    },
    ryanTutor: {
      correct: [
        { text: '✅ Nice catch! That was a classic prize scam. Look at the sender: "paypa1.com" uses the number 1 instead of the letter l. Attackers register fake lookalike domains like this to trick you.', state: 'success' },
        { text: 'The promise of winning ₱1,000,000 and that 30 minute deadline are both pressure tricks. They want you to panic and click without thinking. Real companies never work like that.', state: 'speaking' },
        { text: 'That Claim Now button goes to "paypa1.com", which is a fake site built to steal your login. Always check where a link actually goes before you click!', state: 'thinking' }
      ],
      wrong: [
        { text: '⚠️ That was a phishing email. Take a closer look at the sender: "rewards-claim@paypa1.com" has a 1 instead of l in PayPal. Easy to miss, but that is the whole point.', state: 'concerned' },
        { text: 'Any email saying you won a million pesos with a 30 minute countdown is always a scam. Legit companies do not give away money like that or threaten to take it back in minutes.', state: 'speaking' },
        { text: 'The link goes to "paypa1.com", which is a fake site meant to steal your PayPal password. Stop, Check, and Verify before trusting any link!', state: 'thinking' }
      ]
    }
  },

  // === EMAIL 2: Legitimate HR email: Wave 2 ===
  {
    id: 2,
    sender: { name: 'HR Department', address: 'hr@business.com' },
    subject: 'Updated Employee Benefits Information',
    date: 'Mon, Oct 27, 2026',
    time: '9:02 AM',
    preview: 'Please review the updated employee benefits package for the upcoming quarter...',
    phishing: false,
    evidence: [],
    body: [
      { type: 'p', text: 'Hi team,' },
      { type: 'p', text: 'We are pleased to share the updated employee benefits package for the upcoming quarter. Please take a moment to review the summary below.' },
      { type: 'p', text: 'Key updates include:\n• Enhanced health coverage options\n• Updated dental and vision plans\n• Expanded wellness program benefits\n• New remote work allowance policy' },
      { type: 'p', text: 'Full details are available through our internal HR portal using your standard work credentials. No password reset or account verification is required.' },
      { type: 'p', text: 'If you have any questions, feel free to contact HR directly at hr@business.com or visit us in Room 204.' },
      { type: 'p', text: 'Best regards,\nHR Department\nBusiness Inc.' }
    ],
    capybaraAnalysis: {},
    ryanTutor: {
      correct: [
        { text: '✅ Good call! That HR email was real. "hr@business.com" is the company official domain, so that sender checks out completely.', state: 'success' },
        { text: 'No strange urgency, no links asking for your password, and nothing suspicious at all. It just told you about a benefits update. That is exactly how a normal internal email looks.', state: 'speaking' }
      ],
      wrong: [
        { text: '⚠️ That one was actually a real email. "hr@business.com" is on the company official domain, which is a verified trusted sender.', state: 'concerned' },
        { text: 'It had no pressure, no scary deadlines, and no links asking for your password. It just shared a benefits update. Not every email is a threat. Always check the sender domain first.', state: 'speaking' }
      ]
    }
  },

  // === EMAIL 3: Phishing: Microsoft typosquat: Wave 2 ===
  {
    id: 3,
    sender: { name: 'Microsoft Security', address: 'security-alert@m1crosoft-support.com' },
    subject: 'Unusual Sign In Detected on Your Account',
    date: 'Mon, Oct 27, 2026',
    time: '9:28 AM',
    preview: 'We detected a sign in attempt from an unrecognized device. Your account may be at risk...',
    phishing: true,
    evidence: ['fake_sender', 'false_urgency', 'suspicious_link'],
    body: [
      { type: 'p', text: 'Dear Microsoft Account User,' },
      { type: 'p', text: 'We detected a sign in attempt to your Microsoft account from an unrecognized device in an unusual location.' },
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
        correct: '🚩 SENDER: CORRECT\nThe domain <code>m1crosoft-support.com</code> uses the digit \'1\' instead of the letter \'i\' in \'Microsoft\', which is a typosquat attack. Real Microsoft emails come from <code>@microsoft.com</code>.',
        missed: '🚩 MISSED: FAKE SENDER\nThe sender domain <code>m1crosoft-support.com</code> substitutes the digit \'1\' for the letter \'i\'. Microsoft real domain is <code>microsoft.com</code>.'
      },
      false_urgency: {
        correct: '🚩 URGENCY: CORRECT\nA 60 minute account lockout is manufactured urgency. Real Microsoft security alerts let you review activity at your own pace and never impose sudden one hour ultimatums.',
        missed: '🚩 MISSED: FALSE URGENCY\nThe 60 minute countdown is social engineering pressure. Real security alerts do not force immediate action under artificial time limits.'
      },
      suspicious_link: {
        correct: '🚩 LINK: CORRECT\nThe link goes to <code>m1crosoft-account-verify.com</code>, a fake typosquat domain. Real Microsoft account management uses <code>account.microsoft.com</code>.',
        missed: '🚩 MISSED: SUSPICIOUS LINK\nThe button leads to <code>https://m1crosoft-account-verify.com/signin</code>, not Microsoft real domain. Always verify the destination URL before clicking.'
      }
    },
    ryanTutor: {
      correct: [
        { text: '✅ Good eye! That was a phishing email. The sender says "m1crosoft-support.com", but take a close look. That is a number 1 instead of the letter i in Microsoft. Classic typosquatting.', state: 'success' },
        { text: 'Real Microsoft emails only ever come from "@microsoft.com". And that 60 minute lockout threat? That is just pressure to stop you from thinking it through. Microsoft does not do that.', state: 'speaking' },
        { text: 'The link also went to "m1crosoft-account-verify.com", which is another fake domain. Always read email addresses character by character because one swapped digit can look convincing at first glance!', state: 'thinking' }
      ],
      wrong: [
        { text: '⚠️ That was a phishing email. Look closely at the sender: "m1crosoft-support.com" has a 1 instead of the letter i. That kind of swap is designed to fool you at a quick glance.', state: 'concerned' },
        { text: 'Read email addresses carefully, one character at a time. Real Microsoft emails only come from "@microsoft.com". That 60 minute lockout warning was just pressure to make you click without thinking.', state: 'speaking' }
      ]
    }
  },

  // === EMAIL 4: Legitimate IT Maintenance: Wave 2 ===
  {
    id: 4,
    sender: { name: 'IT Support', address: 'it-support@business.com' },
    subject: 'Scheduled Network Maintenance this Saturday',
    date: 'Mon, Oct 27, 2026',
    time: '10:15 AM',
    preview: 'The IT team will conduct scheduled network maintenance this Saturday from 10 PM to 2 AM...',
    phishing: false,
    evidence: [],
    body: [
      { type: 'p', text: 'Hi everyone,' },
      { type: 'p', text: 'Our IT Support team will be conducting scheduled network maintenance this Saturday between 10:00 PM and 2:00 AM.' },
      { type: 'p', text: 'The following services will be temporarily unavailable during this window:\n• VPN access\n• Internal file server\n• Company intranet portal\n• Email access (intermittent)' },
      { type: 'p', text: 'No action is required from you. Your files and credentials remain secure. You do not need to update your password after maintenance.' },
      { type: 'p', text: 'For urgent matters, please contact on call IT support at it-oncall@business.com or extension 4400.' },
      { type: 'p', text: 'We appreciate your patience,\n\nIT Support Team\nBusiness Inc.' }
    ],
    capybaraAnalysis: {},
    ryanTutor: {
      correct: [
        { text: '✅ That is right! That IT maintenance email was real. "it-support@business.com" is on the company official domain, so it checks out.', state: 'success' },
        { text: 'It did not ask for your password, had no sketchy links, and put zero pressure on you. It just told you about planned downtime. Real IT notices never ask for passwords during maintenance.', state: 'speaking' }
      ],
      wrong: [
        { text: '⚠️ That was actually a real IT maintenance email. "it-support@business.com" is on the company real domain, so that sender is legit.', state: 'concerned' },
        { text: 'It asked absolutely nothing from you. No passwords, no links to click, and no scary deadlines. When an email just informs you and asks for nothing, and the sender is on the official domain, it is almost always safe.', state: 'speaking' }
      ]
    }
  },

  // === EMAIL 5: Technical Solutions legitimate: Wave 3 ===
  {
    id: 5,
    sender: { name: 'Technical Solutions Team', address: 'technical.solutions@business.com' },
    subject: 'System Maintenance and Technical Update',
    date: 'Mon, Oct 27, 2026',
    time: '11:00 AM',
    preview: 'Monthly system maintenance has been completed. Please review the update summary for your department...',
    phishing: false,
    evidence: [],
    body: [
      { type: 'p', text: 'Hi team,' },
      { type: 'p', text: 'This is a routine update from Technical Solutions to confirm that our monthly system maintenance cycle finished successfully.' },
      { type: 'p', text: 'Updates completed this cycle:\n• Security patch KB 2024 applied to all workstations\n• Database backup verified and stored in a secure offsite location\n• Network monitoring tools upgraded to version 4.2\n• Legacy software compatibility testing completed' },
      { type: 'p', text: 'No action is required from your end. All systems are operating normally. Your credentials, passwords, and access privileges are unchanged.' },
      { type: 'p', text: 'If you notice any technical issues after this update, please submit a support ticket at the IT help portal or email technical.solutions@business.com.' },
      { type: 'p', text: 'Thank you for your cooperation.\n\nTechnical Solutions Team\nBusiness Inc. IT Division' }
    ],
    capybaraAnalysis: {},
    ryanTutor: {
      correct: [
        { text: '✅ Well done! That was a legit maintenance email from "technical.solutions@business.com", which is on the company real domain.', state: 'success' },
        { text: 'It told you what work was done, did not ask for any credentials, had no suspicious links, and pointed you to official support if needed. That is exactly what a real IT update looks like.', state: 'speaking' }
      ],
      wrong: [
        { text: '⚠️ That was a legitimate email. "technical.solutions@business.com" is on the real company domain "business.com", so that sender is verified.', state: 'concerned' },
        { text: 'The email just told you maintenance was done. No links to click, no passwords to give, and no threats at all. When an email only gives you information and asks for nothing back, and the sender is on the official domain, that is a safe email.', state: 'speaking' }
      ]
    }
  },

  // === EMAIL 6: Final Scenario: Legitimate payroll: Wave 4 ===
  {
    id: 6,
    sender: { name: 'Payroll Department', address: 'payroll@business.com' },
    subject: 'September Payroll Processing Confirmation',
    date: 'Mon, Oct 27, 2026',
    time: '11:45 AM',
    preview: 'Your September payroll has been processed and will be deposited within one to two business days...',
    phishing: false,
    evidence: [],
    body: [
      { type: 'p', text: 'Hi everyone,' },
      { type: 'p', text: 'This is to confirm that September payroll has been successfully processed. Your salary will be deposited into your registered bank account within one to two business days.' },
      { type: 'p', text: 'Payroll details can be reviewed via the company HR portal using your standard employee credentials. No additional verification is required.' },
      { type: 'p', text: 'If you have payroll questions, contact us at payroll@business.com or visit HR between 9:00 AM and 5:00 PM on weekdays.' },
      { type: 'p', text: 'Regards,\nPayroll Department\nBusiness Inc.' }
    ],
    capybaraAnalysis: {},
    ryanTutor: {
      correct: [
        { text: '✅ Right call! That payroll email from "payroll@business.com" was real. Official domain, and it did not ask you to do anything at all.', state: 'success' },
        { text: 'It just confirmed your salary was processed and pointed you to the HR portal if you had questions. No weird links, no password requests, and no pressure. That is a normal business email.', state: 'speaking' }
      ],
      wrong: [
        { text: '⚠️ That was a real payroll email. "payroll@business.com" is on the company real domain, and it just told you your salary was processed. Nothing suspicious about it.', state: 'concerned' },
        { text: 'Payroll emails just inform you. They do not pressure you or ask for anything. Quick check: Is the sender on the official domain? Does it ask for a password or link click? If the answer is no to both, it is almost certainly safe.', state: 'speaking' }
      ]
    }
  },

  // === EMAIL 7: Final Scenario: BPI phishing: Wave 4 ===
  {
    id: 7,
    sender: { name: 'BPI Online Security', address: 'security-alert@bpi-online-security.com' },
    subject: '⚠️ FINAL WARNING: Your BPI Account Has Been Suspended! Act NOW',
    date: 'Mon, Oct 27, 2026',
    time: '12:10 PM',
    preview: 'Your BPI Online account has been suspended due to suspicious activity. Verify your identity within 15 minutes to avoid permanent account closure...',
    phishing: true,
    evidence: ['fake_sender', 'false_urgency', 'suspicious_link'],
    body: [
      { type: 'p', text: 'Dear BPI Account Holder,' },
      { type: 'p', text: 'We have detected suspicious login activity on your BPI Online account. To protect your funds, your online banking access has been temporarily SUSPENDED effective immediately.' },
      { type: 'p', text: 'Incident Reference: BPI-SEC-2026-10-99214\nDetected: Unauthorized access attempt from an unrecognized device\nLocation: Outside Philippines (IP flagged)' },
      {
        type: 'p-flag',
        flagId: 'urgency',
        flagType: 'false_urgency',
        text: '🔴 FINAL WARNING: You have 15 MINUTES to verify your identity. Failure to act will result in PERMANENT ACCOUNT CLOSURE and your balance will be frozen pending a 30 day manual review by our Risk Management Team.',
        label: 'FALSE URGENCY'
      },
      { type: 'p', text: 'Click the secure verification button below to restore your BPI Online access immediately.' },
      {
        type: 'link',
        flagId: 'link1',
        flagType: 'suspicious_link',
        text: 'Restore My BPI Account Now',
        destination: 'https://bankng-secure-verify.xyz/restore',
        label: 'SUSPICIOUS LINK'
      },
      { type: 'p', text: 'If you did not initiate any login attempts, verify immediately to secure your account.\n\nThank you,\nBPI Online Security Team\nBank of the Philippine Islands\nBSP Supervised Financial Institution\n\nThis is an automated security notification. Do not reply to this email.' }
    ],
    capybaraAnalysis: {
      fake_sender: {
        correct: '🚩 SENDER: CORRECT\nThe sender <code>security-alert@bpi-online-security.com</code> is NOT from BPI. Real BPI emails come from <code>@bpi.com.ph</code> only. The domain <code>bpi-online-security.com</code> is registered by attackers to impersonate the bank.',
        missed: '🚩 MISSED: FAKE SENDER\nThe sender <code>security-alert@bpi-online-security.com</code> looks official but is 100% fake. Real BPI only sends emails from <code>@bpi.com.ph</code>. Any other domain claiming to be BPI is a scam.'
      },
      false_urgency: {
        correct: '🚩 URGENCY: CORRECT\nA 15 minute countdown with threats of permanent account closure and 30 day fund freezing is extreme psychological pressure. No real bank including BPI sends 15 minute email ultimatums. Real account issues are handled through official channels with proper notice.',
        missed: '🚩 MISSED: FALSE URGENCY\nThe 15 minutes or permanent closure threat is classic social engineering. BPI and all real banks never impose 15 minute email deadlines to freeze accounts. That extreme pressure is designed to stop you from thinking critically.'
      },
      suspicious_link: {
        correct: '🚩 LINK: CORRECT\nThe button leads to <code>bankng-secure-verify.xyz</code>, which misspells \'banking\' as \'bankng\' and uses a fake <code>.xyz</code> domain. BPI real online banking is at <code>bpi.com.ph</code>. The sender domain and link domain also do not match, which is another red flag.',
        missed: '🚩 MISSED: SUSPICIOUS LINK\nThe button links to <code>bankng-secure-verify.xyz</code> instead of <code>bpi.com.ph</code>. \'Bankng\' misspells \'banking\' and real BPI never uses a <code>.xyz</code> domain. Always hover over links to check the real URL before clicking.'
      }
    },
    ryanTutor: {
      correct: [
        { text: '✅ Great catch! That was a BPI phishing email. The sender is "security-alert@bpi-online-security.com", which is definitely not bpi.com.ph. Attackers register lookalike domains like this to impersonate real banks.', state: 'success' },
        { text: 'A 15 minute countdown with threats of permanent account closure is extreme pressure. BPI and any real bank would never give you a 15 minute email ultimatum to save your account. That is designed to make you panic and click without verifying.', state: 'speaking' },
        { text: 'The button goes to "bankng-secure-verify.xyz", which misspells banking as "bankng" and uses a fake .xyz domain. BPI only uses bpi.com.ph. Always check where a link actually leads before you click!', state: 'thinking' }
      ],
      wrong: [
        { text: '⚠️ That was a BPI phishing email. The sender is "security-alert@bpi-online-security.com", which is not bpi.com.ph. No matter how official it looks, real BPI emails only ever come from @bpi.com.ph.', state: 'concerned' },
        { text: 'Threatening permanent closure in 15 minutes is a scare tactic, not a real bank policy. BPI would never threaten to freeze your money via a 15 minute email countdown. That pressure is the scammer weapon.', state: 'speaking' },
        { text: 'The link goes to "bankng-secure-verify.xyz", which is a fake domain. BPI real site is bpi.com.ph. Always verify the sender domain and the link destination before taking any action in an email.', state: 'thinking' }
      ]
    }
  },

  // === EMAIL 8: Final Scenario: GCash Quishing (QR phishing): Wave 4 ===
  {
    id: 8,
    sender: { name: 'GCash Security Team', address: 'security-alert@gcash-secure-verification.com' },
    subject: 'Action Required: Scan QR Code to Verify Your GCash Account',
    date: 'Mon, Oct 27, 2026',
    time: '12:35 PM',
    preview: 'Unusual activity detected on your GCash wallet. Scan the QR code below to complete mandatory identity verification...',
    phishing: true,
    evidence: ['fake_sender', 'false_urgency', 'suspicious_link'],
    body: [
      { type: 'p', text: 'Dear GCash User,' },
      { type: 'p', text: 'We have detected unusual activity on your GCash wallet. To protect your funds, your account has been flagged for mandatory identity re-verification under GCash KYC Compliance Policy (GC-SEC-2024-11).' },
      {
        type: 'p-flag',
        flagId: 'urgency',
        flagType: 'false_urgency',
        text: 'IMPORTANT: Your GCash wallet will be LOCKED and all transactions CANCELLED if verification is not completed within 24 hours.',
        label: 'FALSE URGENCY'
      },
      { type: 'p', text: 'Use your phone camera to scan the QR code below and complete your identity verification in 3 minutes. Do not share this QR code with anyone.' },
      {
        type: 'qr',
        flagId: 'link1',
        flagType: 'suspicious_link',
        destination: 'https://gcash-secure-verification.com/kyc-portal',
        label: 'SUSPICIOUS QR CODE'
      },
      { type: 'p', text: 'Thank you for keeping your GCash wallet secure.\n\nGCash Security Team\nGlobe Fintech Innovations, Inc.\n\nThis is an automated security alert. Do not reply to this email.' }
    ],
    capybaraAnalysis: {
      fake_sender: {
        correct: '🚩 SENDER: CORRECT\nThe sender uses <code>gcash-secure-verification.com</code> instead of GCash real domain <code>gcash.com.ph</code>. Attackers register convincing lookalike domains to impersonate GCash.',
        missed: '🚩 MISSED: FAKE SENDER\nThe sender <code>security-alert@gcash-secure-verification.com</code> looks official, but <code>gcash-secure-verification.com</code> is a fake attacker domain. Real GCash emails only come from <code>@gcash.com.ph</code>.'
      },
      false_urgency: {
        correct: '🚩 URGENCY: CORRECT\nA 24 hour wallet lockout threat is manufactured urgency. Real GCash security and KYC requests are communicated through the official app, never a single urgent email with a countdown.',
        missed: '🚩 MISSED: FALSE URGENCY\nThe 24 hour lock threat is social engineering. GCash never suspends wallets via a single urgent email. That extreme pressure exists to stop you from verifying the source.'
      },
      suspicious_link: {
        correct: '🚩 QR CODE: CORRECT\nThis is Quishing, which means QR code phishing. Attackers hide malicious sites behind QR codes. Remember to think before you scan because you cannot hover over a QR code to verify the link destination.',
        missed: '🚩 MISSED: SUSPICIOUS QR CODE\nThis attack is Quishing, or QR phishing. Think before you scan! The QR code redirects to a fake GCash site at <code>gcash-secure-verification.com</code> to harvest your credentials.'
      }
    },
    ryanTutor: {
      correct: [
        { text: '✅ Spot on! That was Quishing, or QR code phishing. Scammers hide phishing links inside QR codes because email security filters cannot easily inspect image content.', state: 'success' },
        { text: 'Golden rule: Think before you scan! You cannot hover over a QR code to preview where it goes. Real GCash verifications only happen inside the official app, never through email QR codes.', state: 'speaking' }
      ],
      wrong: [
        { text: '⚠️ That was a Quishing attack, or QR code phishing. The QR code leads to a fake GCash website built to harvest your registered mobile number and MPIN.', state: 'concerned' },
        { text: 'Always remember to think before you scan! Attackers exploit QR codes because you cannot preview the destination URL. Real GCash will never ask you to scan an email QR code.', state: 'speaking' }
      ]
    }
  },

  // === EMAIL 9: Final Scenario: Legitimate IT ticket: Wave 4 ===
  {
    id: 9,
    sender: { name: 'IT Help Desk', address: 'helpdesk@business.com' },
    subject: 'Your IT Support Ticket #4821 Has Been Resolved',
    date: 'Mon, Oct 27, 2026',
    time: '1:05 PM',
    preview: 'Your recent support ticket regarding email configuration has been resolved...',
    phishing: false,
    evidence: [],
    body: [
      { type: 'p', text: 'Hi there,' },
      { type: 'p', text: 'This is an automated notification from the IT Help Desk system. Your support ticket #4821 regarding email configuration has been resolved.' },
      { type: 'p', text: 'Resolution summary:\n• Mailbox synchronization settings have been corrected\n• Junk mail filters updated\n• Email signature template restored to default' },
      { type: 'p', text: 'If you continue to experience issues, please reply to this email or submit a new ticket via the company intranet. No credentials were modified during this process.' },
      { type: 'p', text: 'Thank you,\nIT Help Desk\nBusiness Inc.' }
    ],
    capybaraAnalysis: {},
    ryanTutor: {
      correct: [
        { text: '✅ Right! That IT help desk email from "helpdesk@business.com" was real. It is on the company official domain and just told you a ticket was resolved.', state: 'success' },
        { text: 'No passwords needed, no suspicious links, and no pressure at all. Automated ticket emails are totally normal. You spotted it correctly, nice work!', state: 'speaking' }
      ],
      wrong: [
        { text: '⚠️ That was a real IT Help Desk email. "helpdesk@business.com" is on the company actual domain and it just let you know a support ticket was closed.', state: 'concerned' },
        { text: 'Ticket confirmation emails are just routine automated messages. No credential requests, no pressure. Quick check: is the sender on the official domain, and does it ask for anything from you? If the answer is no to both, it is almost certainly legit.', state: 'speaking' }
      ]
    }
  },

  // === EMAIL 10: Phishing Scholarship Lure with Malicious File Attachment: Wave 4 ===
  {
    id: 10,
    sender: { name: 'Northfield Scholarship Committee', address: 'grants-approval@northfield-scholarship.com' },
    subject: 'URGENT: Scholarship Grant Approval Form and Required Documents',
    date: 'Mon, Oct 27, 2026',
    time: '2:40 PM',
    preview: 'Congratulations! Your academic grant has been approved. Download and submit the attached verification form within 24 hours to secure your funds...',
    phishing: true,
    evidence: ['fake_sender', 'false_urgency', 'suspicious_link'],
    body: [
      { type: 'p', text: 'Dear Student and Grant Applicant,' },
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
        filename: 'Scholarship_Form.pdf.exe',
        size: '2.4 MB',
        label: 'SUSPICIOUS ATTACHMENT / MALICIOUS FILE',
        destination: 'https://northfield-scholarship.com/download/Scholarship_Form.pdf.exe'
      },
      { type: 'p', text: 'Ensure you open and run the form installer immediately to finalize your student grant records.\n\nNorthfield Scholarship Foundation\nFinancial Assistance and Awards Office' }
    ],
    capybaraAnalysis: {
      fake_sender: {
        correct: '🚩 SENDER: CORRECT\nThe sender uses <code>grants-approval@northfield-scholarship.com</code> instead of the school real official domain <code>northfield.edu.ph</code>. Attackers spoof scholarship committees using lookalike domain names.',
        missed: '🚩 MISSED: FAKE SENDER\nThe sender is <code>grants-approval@northfield-scholarship.com</code>. This external domain is not affiliated with the official school domain <code>northfield.edu.ph</code>.'
      },
      false_urgency: {
        correct: '🚩 URGENCY: CORRECT\nThe 24 hour deadline threatening permanent forfeiture is social engineering urgency designed to panic students into opening dangerous files without verification.',
        missed: '🚩 MISSED: FALSE URGENCY\nThe warning that you have only 24 hours before your award is forfeited creates false urgency. Official scholarship programs provide ample notice and multiple verification channels.'
      },
      suspicious_link: {
        correct: '🚩 MALICIOUS ATTACHMENT: CORRECT\nBe careful downloading attachments! The file appears to be a PDF but carries a dangerous double extension: <code>Scholarship_Form.pdf.exe</code>! This is an executable program that installs malware, not a document.',
        missed: '🚩 MISSED: MALICIOUS ATTACHMENT\nBe careful downloading attachments! The attached file has a hidden double extension. Opening executable files disguised as documents will compromise and infect the computer.'
      }
    },
    ryanTutor: {
      correct: [
        { text: '✅ Really good catch! Always be careful downloading attachments, especially when files are disguised with double extensions.', state: 'success' },
        { text: 'Look closely at "Scholarship_Form.pdf.exe". That double extension gives it away. It looks like a PDF at first, but the ".exe" at the end means it is an executable program that installs malware.', state: 'speaking' },
        { text: 'The fake domain "northfield-scholarship.com" and that 24 hour deadline were designed to make you panic and download right away. Outstanding work spotting all the clues!', state: 'success' }
      ],
      wrong: [
        { text: '⚠️ Be careful downloading attachments! That was a dangerous phishing email with malware hiding inside the file.', state: 'concerned' },
        { text: 'The file was named "Scholarship_Form.pdf.exe". That ".exe" at the end means it is an executable program, not a PDF. Running it would install malware on the computer.', state: 'speaking' },
        { text: 'Always check the full file extension before downloading any attachment. If an unexpected email pushes you to download an executable, it is a dangerous scam.', state: 'thinking' }
      ]
    }
  }
];
