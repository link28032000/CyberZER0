'use strict';

// ═══════════════════════════════════════════════════════════
// CHAPTER 1 — DYNAMIC INBOX STATE
// Inbox starts with initial wave. Emails are injected in 4 waves based on
// player progress.
// ═══════════════════════════════════════════════════════════

// Live inbox — populated dynamically as player progresses
let ch1InboxEmails               = [];    // emails currently visible in the inbox
let ch1AnimatedEmailIds          = new Set(); // tracks emails already animated in inbox
let ch1PendingNotification       = false; // true = show badge (1) before player opens Zmail
let ch1Stage                     = 0;     // 0=start,1=wave1,2=wave2,3=wave3,4=wave4
let ch1MistakeCount              = 0;     // adaptive mentor coaching tracker
let ch1InvestigationTutorialDone = false; // true after first-email investigation lesson is shown
let ch1FlaggedLegitWarnedOnce    = false; // tracks if user has been cautioned once about legit email flags
let ch1CloserLookWarnedOnce      = false; // tracks if "Take a closer look before deciding" was shown once on email 1
let ch1SecondEmailNotesHintDone  = false; // tracks if second email sticky notes dialogue was shown

// Wave definitions: which email IDs are injected at each stage
const CH1_WAVE_DEFS = {
  1: [1],                 // First phishing email (injected on start)
  2: [2, 3, 4],           // After email 1 reported: HR legit + Microsoft phish + IT legit
  3: [5],                 // After wave 2 cleared: Technical Solutions legit
  4: [6, 7, 8, 9, 10]     // Final scenario: payroll legit + obvious phish + sophisticated phish + IT ticket legit + scholarship file phish
};

function ch1GetEmailDef(id) {
  return EMAILS.find(e => e.id === id) || null;
}

function ch1InjectWave(waveNum) {
  ch1Stage = waveNum;
  const ids = (CH1_WAVE_DEFS[waveNum] || []).filter(id => !ch1InboxEmails.some(e => e.id === id));
  if (ids.length === 0) return;

  // Add all incoming wave emails so they arrive in the inbox together
  ids.forEach(id => {
    const def = ch1GetEmailDef(id);
    if (def && !ch1InboxEmails.some(e => e.id === id)) {
      ch1InboxEmails.push(def);
    }
  });

  renderEmailList();
  updateFolderCounts();

  setTimeout(() => {
    if (waveNum > 1) {
      showToast('📧 New emails arrived in your inbox.', 'success');
      if (typeof AudioManager !== 'undefined') AudioManager.playNotification();
    }

    // Push dynamic Zmail simulation notifications based on wave
    if (typeof addSimulationNotification === 'function') {
      if (waveNum === 1) {
        addSimulationNotification({
          id: 'notif-zmail-wave1',
          source: 'Zmail',
          icon: '📧',
          iconType: 'mail',
          title: 'New Email: PayPal Rewards Prize Alert',
          body: 'Subject: CONGRATULATIONS: You Won ₱1,000,000 Pesos! Claim Your Prize Now. Click to inspect in Zmail.',
          time: 'Just now',
          app: 'gmail',
          emailId: 1
        }, false);
      } else if (waveNum === 2) {
        addSimulationNotification({
          id: 'notif-zmail-wave2',
          source: 'Zmail',
          icon: '📧',
          iconType: 'mail',
          title: 'Zmail: 3 New Incident Emails',
          body: 'New messages from HR (Benefits), Microsoft Security, and IT Support waiting in inbox.',
          time: 'Just now',
          app: 'gmail'
        }, false);
      } else if (waveNum === 3) {
        addSimulationNotification({
          id: 'notif-zmail-wave3',
          source: 'Zmail',
          icon: '📧',
          iconType: 'mail',
          title: 'New Email: Technical Solutions',
          body: 'Subject: System Maintenance Completed Successfully. Routine confirmation from verified domain.',
          time: 'Just now',
          app: 'gmail',
          emailId: 5
        }, false);
      } else if (waveNum === 4) {
        addSimulationNotification({
          id: 'notif-zmail-wave4',
          source: 'Zmail',
          icon: '📧',
          iconType: 'mail',
          title: 'Zmail: 4 Final Scenario Emails Arrived',
          body: 'Direct deposit payroll notice, urgent security patch, bank notice, and IT Help Desk ticket arrived.',
          time: 'Just now',
          app: 'gmail'
        }, false);
      }
    }
  }, 200);
}

// Perfect-run score computed over all 9 emails
const MAX_SCORE = EMAILS.reduce((sum, e) => sum + (e.phishing ? 100 + e.evidence.length * 25 : 50), 0);

// Emails already sent by the player — viewable in the Sent folder
const SENT_EMAILS = [];
