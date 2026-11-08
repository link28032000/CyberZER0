'use strict';

// ═══════════════════════════════════════════════════════════
// CHAPTER 1 — DYNAMIC SHUFFLED INBOX & RESEND ENGINE
// 1. Shuffled emails sent to inbox until all investigated and given verdicts.
// 2. Resend only incorrectly identified emails in randomized order.
// 3. Correctly identified emails are NEVER resent.
// 4. Repeat cycle until all emails correctly identified & checklist complete.
// 5. Once complete, stop sending emails and allow reward claim.
// ═══════════════════════════════════════════════════════════

// Live inbox — populated dynamically as player progresses
let ch1InboxEmails               = [];    // emails currently visible in the inbox
let ch1AnimatedEmailIds          = new Set(); // tracks emails already animated in inbox
let ch1PendingNotification       = false; // true = show badge (1) before player opens Zmail
let ch1Stage                     = 0;     // current stage / round
let ch1MistakeCount              = 0;     // adaptive mentor coaching tracker
let ch1InvestigationTutorialDone = false; // true after first-email investigation lesson is shown
let ch1FlaggedLegitWarnedOnce    = false; // tracks if user has been cautioned once about legit email flags
let ch1CloserLookWarnedOnce      = false; // tracks if "Take a closer look before deciding" was shown once on email 1
let ch1SecondEmailNotesHintDone  = false; // tracks if second email sticky notes dialogue was shown

// Shuffled engine state
let ch1ResolvedEmailIds          = new Set(); // IDs of emails correctly identified (NEVER resent)
let ch1CurrentRound              = 1;         // current investigation round
let ch1InvestigationComplete     = false;     // true when all emails solved and checklist complete

// Preserved for backwards compatibility with legacy tests
const CH1_WAVE_DEFS = {
  1: [1],
  2: [2, 3, 4],
  3: [5],
  4: [6, 7, 8, 9, 10, 11, 12]
};

function ch1GetEmailDef(id) {
  if (typeof EMAILS === 'undefined' || !Array.isArray(EMAILS)) return null;
  return EMAILS.find(e => e.id === id) || null;
}

/**
 * Standard Fisher-Yates shuffle algorithm to randomize email order.
 */
function ch1Shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Start Round 1: Deliver initial wave with the demo email (Email 1) first.
 * Do not shuffle emails immediately. Shuffle only triggers after all emails
 * in the current round receive verdicts, for incorrect emails.
 */
function ch1StartInitialInbox() {
  ch1InjectWave(1);
}

function ch1StartShuffledInbox() {
  ch1InjectWave(1);
}

/**
 * Resend ONLY the incorrectly identified emails in a new shuffled order.
 * Correctly identified emails are NEVER resent.
 */
function ch1ResendIncorrectEmails(emailsToResend) {
  if (!emailsToResend || emailsToResend.length === 0) return;

  // 1. Shuffle only the emails that were incorrectly identified
  const shuffled = ch1Shuffle(emailsToResend);

  // 2. Remove previous results for these resent emails so they can be re-investigated fresh
  const resendIds = new Set(shuffled.map(e => e.id));
  if (typeof gameState !== 'undefined' && Array.isArray(gameState.emailResults)) {
    gameState.emailResults = gameState.emailResults.filter(r => !resendIds.has(r.emailId));
  }

  // 3. Keep resolved emails below (marked ✓ CORRECT), place resent emails at the top
  const alreadyResolved = ch1InboxEmails.filter(e => ch1ResolvedEmailIds.has(e.id));
  ch1InboxEmails = [...shuffled, ...alreadyResolved];

  // 4. Reset animated IDs for the resent emails so they get fresh arrival animation
  shuffled.forEach(e => {
    ch1AnimatedEmailIds.delete(e.id);
  });

  // 5. Point to the first unreviewed email
  if (typeof gameState !== 'undefined') {
    gameState.currentEmail = 0;
    gameState.currentEmailFlags = [];
    gameState.flagModeActive = false;
  }

  // 6. Return view to inbox list view
  const detailView = document.getElementById('email-detail-view');
  const listView   = document.getElementById('email-list-view');
  if (detailView) detailView.classList.remove('active');
  if (listView)   listView.classList.add('active');

  if (typeof renderEmailList === 'function') renderEmailList();
  if (typeof updateFolderCounts === 'function') updateFolderCounts();
  if (typeof updateHUD === 'function') updateHUD();
  if (typeof updateStickyChecklist === 'function') updateStickyChecklist();

  // 7. Audio & Toast feedback
  if (typeof AudioManager !== 'undefined' && AudioManager.playNotification) {
    AudioManager.playNotification();
  }

  const count = shuffled.length;
  if (typeof showToast === 'function') {
    showToast(`📧 Round ${ch1CurrentRound}: ${count} incorrectly identified email${count > 1 ? 's' : ''} resent in shuffled order.`, 'warning');
  }

  // 8. Simulation notification
  if (typeof addSimulationNotification === 'function') {
    addSimulationNotification({
      id: 'notif-resend-' + Date.now(),
      source: 'Zmail',
      icon: '🔄',
      iconType: 'mail',
      title: `Zmail: ${count} Case${count > 1 ? 's' : ''} Returned for Re-investigation`,
      body: 'Inspect headers, check for spoofed domains and false urgency, and submit your updated verdict.',
      time: 'Just now',
      app: 'gmail'
    }, false);
  }

  // 9. Ryan encouragement dialogue
  if (typeof RyanGuide !== 'undefined') {
    setTimeout(() => {
      RyanGuide.speak([
        {
          text: `Solid effort on that round, Alex! You nailed ${ch1ResolvedEmailIds.size} email${ch1ResolvedEmailIds.size !== 1 ? 's' : ''}, but ${count} tricky case${count > 1 ? 's' : ''} slipped through.`,
          state: 'concerned'
        },
        {
          text: `I popped those ${count} email${count > 1 ? 's' : ''} back into your inbox in a shuffled order. Take your time, look closely at what's in front of you, and let's clear 'em all!`,
          state: 'speaking'
        }
      ], { autoDismiss: 6500 });
    }, 350);
  }

  // 10. Pulse-highlight the first resent email in the inbox list
  setTimeout(() => {
    const firstRow = document.getElementById(`email-item-${shuffled[0].id}`);
    if (firstRow) {
      firstRow.classList.remove('email-row-pulse');
      void firstRow.offsetWidth;
      firstRow.classList.add('email-row-pulse');
      firstRow.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, 200);
}

/**
 * Check whether all emails in the current round have been reviewed.
 * If all reviewed:
 * - Mark newly correct emails as resolved (NEVER to be resent).
 * - If any are incorrect or checklist incomplete -> resend only the incorrect ones shuffled!
 * - If all emails are correctly identified and checklist complete -> finish investigation and unlock reward!
 */
function ch1CheckRoundCompletion() {
  if (ch1InvestigationComplete) return true;
  if (!ch1InboxEmails || ch1InboxEmails.length === 0) return false;
  if (typeof gameState === 'undefined' || !Array.isArray(gameState.emailResults)) return false;

  // Check if every email currently in ch1InboxEmails has a verdict in gameState.emailResults
  const allCurrentReviewed = ch1InboxEmails.every(e =>
    gameState.emailResults.some(r => r.emailId === e.id)
  );

  if (!allCurrentReviewed) {
    return false; // Still have unreviewed emails in current inbox
  }

  // 1. If in Round 1 and there are subsequent waves remaining to inject, deliver next wave in sequence
  const totalEmailsInPool = (typeof EMAILS !== 'undefined' && Array.isArray(EMAILS)) ? EMAILS.length : 12;
  const hasMoreWaves = (ch1CurrentRound === 1 && ch1Stage < 4 && ch1InboxEmails.length < totalEmailsInPool);

  if (hasMoreWaves) {
    if (typeof ch1InjectWave === 'function') {
      ch1InjectWave(ch1Stage + 1);
    }
    return false;
  }

  // 2. ALL emails in the current round have received verdicts!
  // Evaluate correctness:
  const incorrectEmails = [];

  ch1InboxEmails.forEach(email => {
    const res = gameState.emailResults.find(r => r.emailId === email.id);
    if (!res) return;

    if (res.correctDecision) {
      ch1ResolvedEmailIds.add(email.id);
    } else {
      incorrectEmails.push(email);
    }
  });

  // Check checklist completion (requires all 5 checklist items)
  const checklistCount = (typeof getCompletedTasksCount === 'function') ? getCompletedTasksCount() : 0;
  const totalTasks = (typeof SN_ACHIEVEMENTS !== 'undefined' && Array.isArray(SN_ACHIEVEMENTS)) ? SN_ACHIEVEMENTS.length : 5;
  const isChecklistDone = (typeof isPhishingTrophyUnlocked === 'function')
    ? isPhishingTrophyUnlocked()
    : (checklistCount >= totalTasks);

  // If all checklist items are fulfilled (including 12 email verdicts), investigation is complete!
  if (isChecklistDone) {
    ch1InvestigationComplete = true;
    ch1FinishInvestigationPhase();
    return true;
  }

  // 3. Are there any incorrectly identified emails?
  // TRIGGER THE SHUFFLE NOW and resend ONLY the incorrect emails in randomized order!
  // Correctly identified emails are NEVER resent.
  if (incorrectEmails.length > 0) {
    ch1CurrentRound++;
    ch1ResendIncorrectEmails(incorrectEmails);
    return false;
  }

  // If any emails from the EMAILS pool were somehow not resolved yet, send them (NEVER resending resolved emails)
  const remainingUnresolved = (typeof EMAILS !== 'undefined' && Array.isArray(EMAILS))
    ? EMAILS.filter(e => !ch1ResolvedEmailIds.has(e.id))
    : [];

  if (remainingUnresolved.length > 0) {
    ch1CurrentRound++;
    ch1ResendIncorrectEmails(remainingUnresolved);
    return false;
  }

  // Ensure current checklist is 100% complete before advancing or concluding
  if (!isChecklistDone) {
    return false;
  }

  // 4. ALL emails are correctly identified AND checklist is 5/5!
  ch1InvestigationComplete = true;
  ch1FinishInvestigationPhase();
  return true;
}

/**
 * Finish the investigation phase: stop sending emails, unlock trophy, and prompt reward claim.
 */
function ch1FinishInvestigationPhase() {
  ch1InvestigationComplete = true;

  // Unlock trophy achievements without prematurely claiming the award
  if (typeof _achievementUnlocked !== 'undefined') {
    _achievementUnlocked.add('task_all_complete');
    _achievementUnlocked.add('phish_trophy_unlocked');
    _achievementUnlocked.add('ach_phishing');
  }

  if (typeof updateDesktopTrophyDisplay === 'function') {
    updateDesktopTrophyDisplay();
  }

  if (typeof renderEmailList === 'function') renderEmailList();
  if (typeof updateFolderCounts === 'function') updateFolderCounts();
  if (typeof updateHUD === 'function') updateHUD();

  // Keep the 5/5 completed checklist visible with Claim Award button until claimed
  if (typeof updateStickyChecklist === 'function') {
    updateStickyChecklist();
  }
  if (typeof showStickyNote === 'function') {
    showStickyNote();
  }

  if (typeof savePhishingProgress === 'function') {
    savePhishingProgress();
  }
  if (typeof window.saveSessionLocally === 'function') {
    window.saveSessionLocally();
  }
  if (typeof window.saveProgress === 'function') {
    window.saveProgress().catch(() => {});
  }
  if (typeof updateStartButton === 'function') {
    updateStartButton();
  } else if (typeof window.updateStartButton === 'function') {
    window.updateStartButton();
  }

  // Audio fanfare
  if (typeof AudioManager !== 'undefined') {
    if (AudioManager.playMissionComplete) AudioManager.playMissionComplete();
    else if (AudioManager.playChime) AudioManager.playChime();
  }

  // Toast
  if (typeof showToast === 'function') {
    showToast('🏆 Phishing investigation complete! 12/12 verdicts submitted. Claim your award!', 'success');
  }

  // Display the earned trophy reward modal with Claim Reward button!
  setTimeout(() => {
    if (typeof showPhishingAchievementModal === 'function') {
      showPhishingAchievementModal();
    }
  }, 350);
}

/**
 * Legacy ch1InjectWave compatibility wrapper.
 * Wave 1 starts the shuffled inbox.
 */
function ch1InjectWave(waveNum) {
  ch1Stage = waveNum;

  if (waveNum === 1) {
    ch1CurrentRound = 1;
    ch1ResolvedEmailIds.clear();
    ch1InvestigationComplete = false;
    ch1InboxEmails = [];
    ch1AnimatedEmailIds.clear();
  }

  const ids = (CH1_WAVE_DEFS[waveNum] || []).filter(id => !ch1InboxEmails.some(e => e.id === id));
  if (ids.length === 0) return;

  ids.forEach(id => {
    const def = ch1GetEmailDef(id);
    if (def && !ch1InboxEmails.some(e => e.id === id)) {
      ch1InboxEmails.push(def);
    }
  });

  const detailView = document.getElementById('email-detail-view');
  const listView   = document.getElementById('email-list-view');
  if (detailView) detailView.classList.remove('active');
  if (listView)   listView.classList.add('active');

  if (typeof renderEmailList === 'function') renderEmailList();
  if (typeof updateFolderCounts === 'function') updateFolderCounts();
  if (typeof updateHUD === 'function') updateHUD();

  setTimeout(() => {
    if (waveNum > 1) {
      if (typeof showToast === 'function') showToast('📧 New emails arrived in your inbox.', 'success');
      if (typeof AudioManager !== 'undefined' && AudioManager.playNotification) AudioManager.playNotification();
    } else {
      if (typeof showToast === 'function') {
        showToast('📧 Incoming case files arrived in your inbox. Investigate each message and submit your verdict.', 'info');
      }
      if (typeof AudioManager !== 'undefined' && AudioManager.playNotification) {
        AudioManager.playNotification();
      }
      if (typeof addSimulationNotification === 'function') {
        addSimulationNotification({
          id: 'notif-zmail-start',
          source: 'Zmail',
          icon: '📧',
          iconType: 'mail',
          title: 'Zmail: New Investigation Cases Arrived',
          body: 'Investigate incoming emails, inspect sender domains, flag suspicious clues, and submit verdicts.',
          time: 'Just now',
          app: 'gmail'
        }, false);
      }
    }
  }, 200);
}

// Perfect-run score computed over all emails
const MAX_SCORE = (typeof EMAILS !== 'undefined' && Array.isArray(EMAILS))
  ? EMAILS.reduce((sum, e) => sum + (e.phishing ? 100 + (e.evidence ? e.evidence.length * 25 : 0) : 50), 0)
  : 900;

// Emails already sent by the player — viewable in the Sent folder
const SENT_EMAILS = [];
