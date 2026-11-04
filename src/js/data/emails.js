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

// Master email pool for Chapter 1 (12 emails, injected in 4 waves)
const EMAILS = [
  // === EMAIL 1: First phishing: loads on first Zmail open ===
  {
    id: 1,
    sender: { name: 'PayPal Rewards Claim', address: 'rewards-claim@paypa1.com' },
    subject: 'Your PayPal Rewards prize: ₱1,000,000',
    date: 'Mon, Oct 27, 2026',
    time: '8:14 AM',
    preview: "Good news. Your account was picked in this quarter's rewards draw. Please confirm your details within 30 minutes to receive your prize...",
    phishing: true,
    evidence: ['fake_sender', 'false_urgency', 'suspicious_link'],
    body: [
      { type: 'p', text: 'Hello,' },
      { type: 'p', text: "Good news! Your PayPal account was randomly selected in our Digital Wallet Rewards draw, and you've won ₱1,000,000." },
      {
        type: 'p-flag',
        flagId: 'urgency',
        flagType: 'false_urgency',
        text: "Prizes that aren't claimed within 30 minutes of this notice are passed on to the next winner, so please confirm your details as soon as you can.",
        label: 'FALSE URGENCY'
      },
      { type: 'p', text: "To have the prize sent to your PayPal balance, use the button below and log in so we can confirm it's really you:" },
      {
        type: 'link',
        flagId: 'link1',
        flagType: 'suspicious_link',
        text: 'Claim Now',
        destination: 'https://paypa1.com/claim-reward',
        label: 'SUSPICIOUS LINK'
      },
      { type: 'p', text: "This link is tied to your winning ticket, so please don't forward it to anyone." },
      { type: 'p', text: 'Regards,\nPayPal Rewards Team\nPrize Disbursement' }
    ],
    capybaraAnalysis: {
      fake_sender: {
        correct: "🚩 SENDER: CORRECT\nThe domain <code>paypa1.com</code> uses the number '1' in place of the letter 'l'. That's a lookalike trick called typosquatting. Real PayPal emails come from <code>@paypal.com</code>.",
        missed: "🚩 MISSED: FAKE SENDER\nThe sender <code>rewards-claim@paypa1.com</code> uses the number '1' instead of the letter 'l'. Real PayPal emails come from <code>@paypal.com</code>."
      },
      false_urgency: {
        correct: '🚩 URGENCY: CORRECT\nA huge prize with a 30 minute deadline is a pressure tactic. Scammers want you to click before you have time to check anything.',
        missed: '🚩 MISSED: FALSE URGENCY\nThe 30 minute deadline is there to rush you. A real prize would not disappear in half an hour.'
      },
      suspicious_link: {
        correct: '🚩 LINK: CORRECT\nThe Claim Now button goes to <code>https://paypa1.com/claim-reward</code>, a fake site made to collect PayPal logins.',
        missed: '🚩 MISSED: SUSPICIOUS LINK\nThe Claim Now button goes to <code>https://paypa1.com/claim-reward</code>, not <code>paypal.com</code>. Always check where a link leads before you click.'
      }
    },
    ryanTutor: {
      correct: [
        { text: "Nice, that's exactly right. Look at the sender: paypa1.com, with a number 1 where the \"l\" should be. Super easy to miss when you're reading fast.", state: 'success' },
        { text: "And nobody gives away a million pesos out of the blue, then gives you 30 minutes to collect it. The rush is there so you won't stop and think.", state: 'speaking' },
        { text: "The Claim Now button goes to that same fake domain. When you're not sure about a link, skip it and type the real website in yourself.", state: 'thinking' }
      ],
      wrong: [
        { text: "Ah, that one slipped past you. Don't worry, it's built to. Check the sender: paypa1.com, with a 1 instead of an \"l\".", state: 'concerned' },
        { text: "A surprise million pesos with a 30 minute deadline should make you pause. Real prizes don't expire before lunch.", state: 'speaking' },
        { text: "The button leads to a lookalike site that steals logins. Next time, check the address before you click anything.", state: 'thinking' }
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
    preview: "Hi team, here's a summary of the updated benefits package for next quarter...",
    phishing: false,
    evidence: [],
    body: [
      { type: 'p', text: 'Hi team,' },
      { type: 'p', text: "Here's a quick summary of the updated employee benefits package for next quarter." },
      { type: 'p', text: "What's new:\n• More health coverage options\n• Updated dental and vision plans\n• Expanded wellness program\n• A new remote work allowance" },
      { type: 'p', text: 'The full details are on the HR portal. Just sign in with your usual work account. Nothing else is needed from you.' },
      { type: 'p', text: "If you have questions, email us at hr@business.com or drop by Room 204." },
      { type: 'p', text: 'Best regards,\nHR Department\nBusiness Inc.' }
    ],
    capybaraAnalysis: {},
    ryanTutor: {
      correct: [
        { text: "Yep, that one's legit. The sender is hr@business.com, which is our real company domain.", state: 'success' },
        { text: "Notice what's missing: no countdown, no strange links, no request for your password. That's what normal office email looks like.", state: 'speaking' }
      ],
      wrong: [
        { text: "That one was actually fine. The sender is hr@business.com, our real company domain, so there was nothing to flag.", state: 'concerned' },
        { text: "It didn't rush you or ask for a login, and that's a good sign. Not every email is a trap, so check the domain first and then decide.", state: 'speaking' }
      ]
    }
  },

  // === EMAIL 3: Phishing: Microsoft typosquat: Wave 2 ===
  {
    id: 3,
    sender: { name: 'Microsoft Security', address: 'security-alert@m1crosoft-support.com' },
    subject: 'Unusual sign-in activity on your Microsoft account',
    date: 'Mon, Oct 27, 2026',
    time: '9:28 AM',
    preview: 'We noticed a sign-in from a device we don\'t recognize. Please review the activity to keep your account secure...',
    phishing: true,
    evidence: ['fake_sender', 'false_urgency', 'suspicious_link'],
    body: [
      { type: 'p', text: 'Hello,' },
      { type: 'p', text: "We noticed a sign-in to your Microsoft account from a device we don't recognize, in a location you don't usually sign in from." },
      {
        type: 'p-flag',
        flagId: 'urgency',
        flagType: 'false_urgency',
        text: 'Please confirm this activity within 60 minutes. If we do not hear from you, your account will be locked to protect it.',
        label: 'FALSE URGENCY'
      },
      { type: 'p', text: "If this wasn't you, please review the activity and change your password right away." },
      {
        type: 'link',
        flagId: 'link1',
        flagType: 'suspicious_link',
        text: 'Review Account Activity',
        destination: 'https://m1crosoft-account-verify.com/signin',
        label: 'SUSPICIOUS LINK'
      },
      { type: 'p', text: 'Thanks,\nMicrosoft Account Security Team' }
    ],
    capybaraAnalysis: {
      fake_sender: {
        correct: "🚩 SENDER: CORRECT\nThe domain <code>m1crosoft-support.com</code> swaps the letter 'i' for the number '1'. Real Microsoft emails come from <code>@microsoft.com</code>.",
        missed: "🚩 MISSED: FAKE SENDER\nThe sender domain <code>m1crosoft-support.com</code> swaps the letter 'i' for the number '1'. Microsoft's real domain is <code>microsoft.com</code>."
      },
      false_urgency: {
        correct: '🚩 URGENCY: CORRECT\nA 60 minute lockout is made-up pressure. Real security alerts let you check your account calmly instead of forcing a quick decision.',
        missed: '🚩 MISSED: FALSE URGENCY\nThe 60 minute lockout is there to rush you. Real security alerts do not put your account on a short timer.'
      },
      suspicious_link: {
        correct: '🚩 LINK: CORRECT\nThe link goes to <code>m1crosoft-account-verify.com</code>, a fake lookalike. Real Microsoft account pages are on <code>account.microsoft.com</code>.',
        missed: '🚩 MISSED: SUSPICIOUS LINK\nThe button leads to <code>https://m1crosoft-account-verify.com/signin</code>, not a real Microsoft address. Check the destination before you click.'
      }
    },
    ryanTutor: {
      correct: [
        { text: "Good eye. The sender says m1crosoft, with a number 1 where the \"i\" should be. It's an old trick, but it still works on a lot of people.", state: 'success' },
        { text: "Real Microsoft email comes from @microsoft.com. And that 60 minute lockout? That's just there to make you panic.", state: 'speaking' },
        { text: "The button also pointed to a lookalike site. Reading addresses slowly, one character at a time, is what saved you here.", state: 'thinking' }
      ],
      wrong: [
        { text: "That was a tricky one. Look at the sender again: m1crosoft, with a 1 instead of an \"i\". Super easy to miss when you're moving fast.", state: 'concerned' },
        { text: "Real Microsoft email ends in @microsoft.com. The 60 minute lockout warning was meant to rush you into clicking, so whenever you feel rushed, slow down.", state: 'speaking' }
      ]
    }
  },

  // === EMAIL 4: Legitimate IT Maintenance: Wave 2 ===
  {
    id: 4,
    sender: { name: 'IT Support', address: 'it-support@business.com' },
    subject: 'Scheduled network maintenance this Saturday',
    date: 'Mon, Oct 27, 2026',
    time: '10:15 AM',
    preview: 'Heads up: we will be doing network maintenance this Saturday from 10 PM to 2 AM...',
    phishing: false,
    evidence: [],
    body: [
      { type: 'p', text: 'Hi everyone,' },
      { type: 'p', text: 'Quick heads up: IT will be doing scheduled network maintenance this Saturday from 10:00 PM to 2:00 AM.' },
      { type: 'p', text: 'These services will be down for a while:\n• VPN access\n• Internal file server\n• Company intranet\n• Email (on and off)' },
      { type: 'p', text: "You don't need to do anything. Your files and passwords aren't affected, and there's no need to change your password afterward." },
      { type: 'p', text: 'For anything urgent, contact the on-call team at it-oncall@business.com or extension 4400.' },
      { type: 'p', text: 'Thanks for your patience,\nIT Support Team\nBusiness Inc.' }
    ],
    capybaraAnalysis: {},
    ryanTutor: {
      correct: [
        { text: "Right, this one's real. IT Support is writing from our own business.com domain.", state: 'success' },
        { text: "It doesn't ask for your password or send you to any link. It just tells you about weekend downtime. That's an ordinary heads-up.", state: 'speaking' }
      ],
      wrong: [
        { text: "That one was actually genuine. IT Support wrote from our own business.com domain.", state: 'concerned' },
        { text: "It never asked for a password or told you to click anything. If an email from a verified domain only gives you info, it's usually fine.", state: 'speaking' }
      ]
    }
  },

  // === EMAIL 5: Technical Solutions legitimate: Wave 3 ===
  {
    id: 5,
    sender: { name: 'Technical Solutions Team', address: 'technical.solutions@business.com' },
    subject: 'Monthly system maintenance completed',
    date: 'Mon, Oct 27, 2026',
    time: '11:00 AM',
    preview: 'This month\'s system maintenance finished successfully. Here is a summary of what was updated...',
    phishing: false,
    evidence: [],
    body: [
      { type: 'p', text: 'Hi team,' },
      { type: 'p', text: 'Just letting you know that our monthly system maintenance wrapped up successfully.' },
      { type: 'p', text: "What we completed:\n• Security patch KB 2024 installed on all workstations\n• Database backup checked and stored offsite\n• Network monitoring tools upgraded to version 4.2\n• Compatibility testing for older software" },
      { type: 'p', text: "You don't need to do anything. Everything is running normally, and your passwords and access are unchanged." },
      { type: 'p', text: 'If something looks off after the update, submit a ticket on the IT help portal or email technical.solutions@business.com.' },
      { type: 'p', text: 'Thanks, everyone.\n\nTechnical Solutions Team\nBusiness Inc. IT Division' }
    ],
    capybaraAnalysis: {},
    ryanTutor: {
      correct: [
        { text: "Yep, safe. It's from technical.solutions@business.com, our own domain, and it's just a status update.", state: 'success' },
        { text: "It tells you what was done, says your passwords aren't changing, and gives a real way to reach IT if something breaks. That's what a normal update looks like.", state: 'speaking' }
      ],
      wrong: [
        { text: "This one was actually clean. technical.solutions@business.com is our own company domain.", state: 'concerned' },
        { text: "It's a plain report on patches, with no links to click, no login and no pressure. Emails like that from a verified domain are generally safe.", state: 'speaking' }
      ]
    }
  },

  // === EMAIL 6: Final Scenario: Legitimate payroll: Wave 4 ===
  {
    id: 6,
    sender: { name: 'Payroll Department', address: 'payroll@business.com' },
    subject: 'September payroll processed',
    date: 'Mon, Oct 27, 2026',
    time: '11:45 AM',
    preview: 'September payroll has been processed. Your pay should arrive in one to two business days...',
    phishing: false,
    evidence: [],
    body: [
      { type: 'p', text: 'Hi everyone,' },
      { type: 'p', text: "September payroll has been processed. Your salary should arrive in your registered bank account within one to two business days." },
      { type: 'p', text: 'You can see your payroll details on the HR portal with your regular employee login. No extra verification is needed.' },
      { type: 'p', text: 'Questions? Email payroll@business.com or stop by HR on weekdays between 9:00 AM and 5:00 PM.' },
      { type: 'p', text: 'Regards,\nPayroll Department\nBusiness Inc.' }
    ],
    capybaraAnalysis: {},
    ryanTutor: {
      correct: [
        { text: "Right call. payroll@business.com is our real payroll team, and the email doesn't ask you to do anything.", state: 'success' },
        { text: "It just says pay is on the way. No login link, no panic. That's a routine internal notice.", state: 'speaking' }
      ],
      wrong: [
        { text: "That one was safe. payroll@business.com is our real payroll department.", state: 'concerned' },
        { text: "Here's a quick check you can use: is the sender on our real domain, and does the email ask for a password or a click? If both answers are no, you're probably fine.", state: 'speaking' }
      ]
    }
  },

  // === EMAIL 7: Final Scenario: BPI phishing: Wave 4 ===
  {
    id: 7,
    sender: { name: 'BPI Online Security', address: 'security-alert@bpi-online-security.com' },
    subject: 'Your BPI Online access has been suspended',
    date: 'Mon, Oct 27, 2026',
    time: '12:10 PM',
    preview: 'We found suspicious activity on your BPI Online account and limited your access. Please verify your identity within 15 minutes to restore it...',
    phishing: true,
    evidence: ['fake_sender', 'false_urgency', 'suspicious_link'],
    body: [
      { type: 'p', text: 'Dear BPI Customer,' },
      { type: 'p', text: "We found suspicious login activity on your BPI Online account. To protect your funds, we've temporarily suspended your online banking access." },
      { type: 'p', text: 'Reference no.: BPI-SEC-2026-10-99214\nActivity: Login attempt from an unrecognized device\nLocation: Outside the Philippines' },
      {
        type: 'p-flag',
        flagId: 'urgency',
        flagType: 'false_urgency',
        text: 'Please verify your identity within 15 minutes. If we do not receive your verification, your account will be closed and your balance frozen for a 30 day review.',
        label: 'FALSE URGENCY'
      },
      { type: 'p', text: 'Use the button below to verify your identity and restore your access:' },
      {
        type: 'link',
        flagId: 'link1',
        flagType: 'suspicious_link',
        text: 'Restore My BPI Account Now',
        destination: 'https://bankng-secure-verify.xyz/restore',
        label: 'SUSPICIOUS LINK'
      },
      { type: 'p', text: "If you did not try to log in, please verify now so we can secure your account.\n\nThank you,\nBPI Online Security Team\nBank of the Philippine Islands\n\nThis is an automated message. Please do not reply." }
    ],
    capybaraAnalysis: {
      fake_sender: {
        correct: '🚩 SENDER: CORRECT\nThe sender <code>security-alert@bpi-online-security.com</code> is not BPI. Real BPI emails come from <code>@bpi.com.ph</code>. Attackers register names like <code>bpi-online-security.com</code> so they look official at a glance.',
        missed: '🚩 MISSED: FAKE SENDER\nThe sender <code>security-alert@bpi-online-security.com</code> looks official, but it is not. Real BPI emails come from <code>@bpi.com.ph</code>, so any other domain claiming to be BPI is fake.'
      },
      false_urgency: {
        correct: '🚩 URGENCY: CORRECT\nA 15 minute deadline backed by threats of account closure and a frozen balance is meant to scare you. Banks do not handle account problems with a short email countdown.',
        missed: '🚩 MISSED: FALSE URGENCY\nThe 15 minute deadline and the threat of closure are pressure tactics. Banks do not freeze accounts over an email deadline like that.'
      },
      suspicious_link: {
        correct: "🚩 LINK: CORRECT\nThe button goes to <code>bankng-secure-verify.xyz</code>. 'Bankng' is misspelled, the <code>.xyz</code> ending is unusual for a bank, and the domain doesn't even match the sender's. BPI's real site is <code>bpi.com.ph</code>.",
        missed: "🚩 MISSED: SUSPICIOUS LINK\nThe button goes to <code>bankng-secure-verify.xyz</code> instead of <code>bpi.com.ph</code>. 'Bankng' is misspelled and the domain has nothing to do with BPI. Hover over links to see the real address before clicking."
      }
    },
    ryanTutor: {
      correct: [
        { text: "Great catch. That sender, bpi-online-security.com, isn't BPI at all. Real BPI emails come from bpi.com.ph.", state: 'success' },
        { text: "A 15 minute countdown with a threat to freeze your money? Banks don't work like that. It's meant to scare you into clicking.", state: 'speaking' },
        { text: "And check that link: \"bankng\" is misspelled, and it ends in .xyz. You caught all three signs.", state: 'thinking' }
      ],
      wrong: [
        { text: "That one's a nasty one, and plenty of people fall for it. The sender, bpi-online-security.com, isn't BPI. The real domain is bpi.com.ph.", state: 'concerned' },
        { text: "The 15 minute deadline is the scare part. Scammers use fear so you'll click before you think.", state: 'speaking' },
        { text: "The link also goes to a random .xyz site. If you ever get a message like this, open your bank's app or type its website yourself instead of using the email.", state: 'thinking' }
      ]
    }
  },

  // === EMAIL 8: Final Scenario: GCash Quishing (QR phishing): Wave 4 ===
  {
    id: 8,
    sender: { name: 'GCash Security Team', address: 'security-alert@gcash-secure-verification.com' },
    subject: 'Verify your GCash account with the QR code below',
    date: 'Mon, Oct 27, 2026',
    time: '12:35 PM',
    preview: "We noticed unusual activity on your GCash wallet. Scan the QR code below to complete a quick identity check...",
    phishing: true,
    evidence: ['fake_sender', 'false_urgency', 'suspicious_link'],
    body: [
      { type: 'p', text: 'Hi GCash User,' },
      { type: 'p', text: "We noticed unusual activity on your GCash wallet. As part of our KYC compliance policy (GC-SEC-2024-11), we need you to re-verify your identity." },
      {
        type: 'p-flag',
        flagId: 'urgency',
        flagType: 'false_urgency',
        text: 'Please complete the verification within 24 hours. After that, your wallet will be locked and pending transactions will be cancelled.',
        label: 'FALSE URGENCY'
      },
      { type: 'p', text: 'Scan the QR code below with your phone camera. It takes about 3 minutes. Please keep this code private.' },
      {
        type: 'qr',
        flagId: 'link1',
        flagType: 'suspicious_link',
        destination: 'https://gcash-secure-verification.com/kyc-portal',
        label: 'SUSPICIOUS QR CODE'
      },
      { type: 'p', text: "Thank you for helping us keep your wallet secure.\n\nGCash Security Team\nGlobe Fintech Innovations, Inc.\n\nThis is an automated message. Please do not reply." }
    ],
    capybaraAnalysis: {
      fake_sender: {
        correct: '🚩 SENDER: CORRECT\nThe sender uses <code>gcash-secure-verification.com</code> instead of GCash\'s real domain, <code>gcash.com.ph</code>. Attackers register convincing lookalike names to pose as GCash.',
        missed: '🚩 MISSED: FAKE SENDER\nThe sender <code>security-alert@gcash-secure-verification.com</code> looks official, but the domain belongs to an attacker. Real GCash emails come from <code>@gcash.com.ph</code>.'
      },
      false_urgency: {
        correct: '🚩 URGENCY: CORRECT\nA 24 hour lock threat is made-up pressure. Real GCash security and KYC requests go through the official app, not a single email with a deadline.',
        missed: '🚩 MISSED: FALSE URGENCY\nThe 24 hour lock threat is there to rush you. GCash does not lock wallets because of one email deadline.'
      },
      suspicious_link: {
        correct: '🚩 QR CODE: CORRECT\nThis is quishing, which is phishing through a QR code. You cannot hover over a QR code to see where it leads, so think before you scan. This one goes to a fake site at <code>gcash-secure-verification.com</code>.',
        missed: '🚩 MISSED: SUSPICIOUS QR CODE\nThis is quishing, which is phishing through a QR code. It leads to a fake GCash site at <code>gcash-secure-verification.com</code> built to steal your login details. Think before you scan.'
      }
    },
    ryanTutor: {
      correct: [
        { text: "Nice one. That's called quishing, phishing through a QR code. Scammers like it because email filters can't easily read what's inside an image.", state: 'success' },
        { text: "You can't hover over a QR code to check where it goes, so think before you scan. GCash won't ask you to verify your wallet from a QR code in an email. If you get a message like this, open the app and check there.", state: 'speaking' }
      ],
      wrong: [
        { text: "That one's called quishing, phishing through a QR code, and it's sneaky. Think about it: why would a real company ask you to scan a code inside an email?", state: 'concerned' },
        { text: "Scanning it would send your phone to a fake GCash page that steals your number and MPIN. A good habit: if you're not sure, don't scan, and open the official app yourself.", state: 'speaking' }
      ]
    }
  },

  // === EMAIL 9: Final Scenario: Legitimate IT ticket: Wave 4 ===
  {
    id: 9,
    sender: { name: 'IT Help Desk', address: 'helpdesk@business.com' },
    subject: 'Ticket #4821 has been resolved',
    date: 'Mon, Oct 27, 2026',
    time: '1:05 PM',
    preview: 'Your support ticket about email configuration has been resolved...',
    phishing: false,
    evidence: [],
    body: [
      { type: 'p', text: 'Hi there,' },
      { type: 'p', text: 'This is an automated message from the IT Help Desk. Your ticket #4821 about email configuration has been resolved.' },
      { type: 'p', text: "Here's what we fixed:\n• Mailbox sync settings corrected\n• Junk mail filters updated\n• Email signature template restored to default" },
      { type: 'p', text: "If you still have problems, just reply to this email or open a new ticket on the intranet. We didn't change any of your login details." },
      { type: 'p', text: 'Thanks,\nIT Help Desk\nBusiness Inc.' }
    ],
    capybaraAnalysis: {},
    ryanTutor: {
      correct: [
        { text: "That's right. helpdesk@business.com is our real ticketing system, so this one's fine.", state: 'success' },
        { text: "It's basically an automatic receipt saying a ticket was closed. No password requests, no pressure. Good job checking.", state: 'speaking' }
      ],
      wrong: [
        { text: "That one was actually real. helpdesk@business.com is our own ticketing system.", state: 'concerned' },
        { text: "Automatic ticket emails just tell you an issue was fixed. If it doesn't push you to click or give up a password, you're usually fine.", state: 'speaking' }
      ]
    }
  },

  // === EMAIL 10: Phishing Scholarship Lure with Malicious File Attachment: Wave 4 ===
  {
    id: 10,
    sender: { name: 'Northfield Scholarship Committee', address: 'grants-approval@northfield-scholarship.com' },
    subject: 'Scholarship grant approved: form needed to release funds',
    date: 'Mon, Oct 27, 2026',
    time: '2:40 PM',
    preview: 'Congratulations, your grant application has been approved. Please complete the attached form within 24 hours so we can release your funds...',
    phishing: true,
    evidence: ['fake_sender', 'false_urgency', 'suspicious_link'],
    body: [
      { type: 'p', text: 'Dear Applicant,' },
      { type: 'p', text: 'Congratulations! Your academic grant application has passed the initial review, and you are eligible for a ₱50,000 disbursement.' },
      {
        type: 'p-flag',
        flagId: 'urgency',
        flagType: 'false_urgency',
        text: 'Because of limited slots this cycle, we need your completed form within 24 hours. After that, your award goes to the next applicant on the list.',
        label: 'FALSE URGENCY'
      },
      { type: 'p', text: 'Please open the attached grant form, fill it out, and send it back so we can process your award:' },
      {
        type: 'attachment',
        flagId: 'attach1',
        flagType: 'suspicious_link',
        filename: 'Scholarship_Form.pdf.exe',
        size: '2.4 MB',
        label: 'SUSPICIOUS ATTACHMENT / MALICIOUS FILE',
        destination: 'https://northfield-scholarship.com/download/Scholarship_Form.pdf.exe'
      },
      { type: 'p', text: 'If the form asks to install anything, just follow the steps so your student record is updated.\n\nNorthfield Scholarship Foundation\nFinancial Assistance and Awards Office' }
    ],
    capybaraAnalysis: {
      fake_sender: {
        correct: "🚩 SENDER: CORRECT\nThe sender uses <code>grants-approval@northfield-scholarship.com</code>, not the school's real domain, <code>northfield.edu.ph</code>. Scammers often pose as scholarship offices with lookalike names.",
        missed: '🚩 MISSED: FAKE SENDER\nThe sender is <code>grants-approval@northfield-scholarship.com</code>. That outside domain is not the school\'s official <code>northfield.edu.ph</code>.'
      },
      false_urgency: {
        correct: '🚩 URGENCY: CORRECT\nThe 24 hour deadline is pressure meant to make students open a file without checking it first.',
        missed: '🚩 MISSED: FALSE URGENCY\nThe 24 hour deadline is there to rush you. Real scholarship offices give you time and more than one way to verify.'
      },
      suspicious_link: {
        correct: '🚩 MALICIOUS ATTACHMENT: CORRECT\nThe file looks like a PDF, but its name is <code>Scholarship_Form.pdf.exe</code>. The real extension is <code>.exe</code>, which means it is a program that can install malware, not a document.',
        missed: '🚩 MISSED: MALICIOUS ATTACHMENT\nThe file is named <code>Scholarship_Form.pdf.exe</code>. The real extension is <code>.exe</code>, so it is a program, not a PDF. Opening it could infect your computer.'
      }
    },
    ryanTutor: {
      correct: [
        { text: "Sharp catch. Fake attachments are one of the most dangerous tricks out there.", state: 'success' },
        { text: "Look at the file name again: Scholarship_Form.pdf.exe. The .exe at the end means it's a program, not a PDF. Opening it could put malware on your computer.", state: 'speaking' },
        { text: "Add a sender that isn't the school's domain and a 24 hour deadline, and the whole thing falls apart. Nicely done.", state: 'success' }
      ],
      wrong: [
        { text: "Careful with attachments. Look at the file name: Scholarship_Form.pdf.exe. See that .exe at the end?", state: 'concerned' },
        { text: "That means it's a program that can install malware, not a PDF. Before you open anything from an email you didn't expect, check the very end of the file name.", state: 'speaking' }
      ]
    }
  },

  // === EMAIL 11: Additional Phishing Simulation (MFA Token Phishing) ===
  {
    id: 11,
    sender: { name: 'IT Security Operations', address: 'admin@techso1utions-portal.com' },
    subject: 'Action needed: re-sync your MFA token',
    date: 'Mon, Oct 27, 2026',
    time: '3:15 PM',
    preview: 'Our system could not verify the MFA token on your workstation. Please re-sync it within 15 minutes to avoid being locked out...',
    phishing: true,
    evidence: ['fake_sender', 'false_urgency', 'suspicious_link'],
    body: [
      { type: 'p', text: 'Hi team member,' },
      { type: 'p', text: 'Our security gateway could not verify the multi-factor authentication (MFA) token on your workstation during its routine integrity check.' },
      {
        type: 'p-flag',
        flagId: 'urgency_mfa',
        flagType: 'false_urgency',
        text: 'Please re-sync your token within 15 minutes. Workstations that are not verified by then will be locked and their access removed.',
        label: 'FALSE URGENCY'
      },
      { type: 'p', text: 'To keep working without interruption, use the button below and sign in with your work credentials:' },
      {
        type: 'link',
        flagId: 'link_mfa',
        flagType: 'suspicious_link',
        text: 'Re-Verify Corporate MFA Token Now',
        destination: 'https://auth-techso1utions-portal.com/mfa-sync',
        label: 'SUSPICIOUS LINK'
      },
      { type: 'p', text: 'Unverified access will be suspended under Security Policy §4.1.' },
      { type: 'p', text: 'Best regards,\nIT Security & Identity Management\nTechnical Solutions Corp.' }
    ],
    capybaraAnalysis: {
      fake_sender: {
        correct: "🚩 SENDER: CORRECT\nThe sender <code>admin@techso1utions-portal.com</code> uses the number '1' in place of the letter 'l'. Real internal email comes from <code>@business.com</code>.",
        missed: "🚩 MISSED: FAKE SENDER\nThe sender <code>admin@techso1utions-portal.com</code> swaps the letter 'l' for the number '1'. Our real internal email comes from <code>@business.com</code>."
      },
      false_urgency: {
        correct: '🚩 URGENCY: CORRECT\nA 15 minute deadline with a lockout threat is made to rush you past your better judgment.',
        missed: '🚩 MISSED: FALSE URGENCY\nThe 15 minute deadline is there to rush you into entering your credentials without checking.'
      },
      suspicious_link: {
        correct: '🚩 SUSPICIOUS LINK: CORRECT\nThe link <code>https://auth-techso1utions-portal.com/mfa-sync</code> goes to an outside server built to collect logins, not our company intranet.',
        missed: '🚩 MISSED: SUSPICIOUS LINK\nThe link goes to <code>auth-techso1utions-portal.com</code>, an outside lookalike domain made to steal your credentials.'
      }
    },
    ryanTutor: {
      correct: [
        { text: "Great catch. Look at the sender: techso1utions has a number 1 where the \"l\" should be, and it's not our business.com domain either.", state: 'success' },
        { text: "The 15 minute lockout threat and the outside login link were the other big clues. You just kept our company accounts safe.", state: 'speaking' }
      ],
      wrong: [
        { text: "That one was a credential-stealing attack aimed at MFA codes. Check the sender again: techso1utions uses a 1 instead of an \"l\".", state: 'concerned' },
        { text: "They tried to rush you with a 15 minute lockout. Whenever an email wants your password or security token on a timer, stop and check with IT directly first.", state: 'thinking' }
      ]
    }
  },

  // === EMAIL 12: Additional Legitimate Clean Email ===
  {
    id: 12,
    sender: { name: 'Facilities Management', address: 'facilities@business.com' },
    subject: 'Ergonomics checks and HVAC maintenance this Wednesday',
    date: 'Mon, Oct 27, 2026',
    time: '3:30 PM',
    preview: 'Facilities will be replacing air filters and doing quick workstation checks this Wednesday afternoon...',
    phishing: false,
    evidence: [],
    body: [
      { type: 'p', text: 'Hello everyone,' },
      { type: 'p', text: 'Facilities Management will be replacing air filters and doing workstation ergonomic checks this Wednesday between 2:00 PM and 4:00 PM.' },
      { type: 'p', text: "You shouldn't see any interruptions, and nobody needs to move desks. If you'd like your desk height adjusted, let your floor coordinator know." },
      { type: 'p', text: 'Thanks for your cooperation.\n\nFacilities & Building Operations Team\nBusiness Inc.' }
    ],
    capybaraAnalysis: {},
    ryanTutor: {
      correct: [
        { text: "Right on. That's a real facilities notice from our @business.com domain.", state: 'success' },
        { text: "No countdown, no outside links and no password request. Just a routine building update.", state: 'speaking' }
      ],
      wrong: [
        { text: "That one was actually safe and routine, so you can relax on this one.", state: 'concerned' },
        { text: "It's just Facilities letting everyone know about Wednesday's maintenance, sent from our real @business.com address. Nothing suspicious in it.", state: 'thinking' }
      ]
    }
  }
];
