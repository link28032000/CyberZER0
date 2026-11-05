'use strict';

// ═══════════════════════════════════════════════════════════
// REPORT / VERDICT ACTIONS
// ═══════════════════════════════════════════════════════════

// ── Direct phishing report ──────────────────────────────────────────
function submitReportPhishing() {
  // Primary lookup: by current index
  let email = ch1InboxEmails[gameState.currentEmail];

  // Fallback: find first unreviewed email if index is stale
  if (!email) {
    email = ch1InboxEmails.find(e => !gameState.emailResults.some(r => r.emailId === e.id));
    if (email) {
      gameState.currentEmail = ch1InboxEmails.indexOf(email);
    }
  }

  if (!email) {
    showToast('⚠️ No active email to report. Please open an email from your inbox first.', 'warning');
    return;
  }

  if (window._awardClaimed) {
    showToast('🏆 Chapter 1 investigation is complete and rewards are claimed.', 'info');
    return;
  }

  // ── FIRST EMAIL ONLY: require ALL evidence to be flagged before submitting phishing ──
  const _isFirstEmailSubmit = (email.id === 1 && email.phishing === true);
  if (_isFirstEmailSubmit) {
    const _requiredEvidence = (email.evidence && email.evidence.length > 0) ? email.evidence : ['fake_sender', 'false_urgency', 'suspicious_link'];
    const _flaggedTypes = (gameState.currentEmailFlags || []).map(f => f.type);
    const _missingFlags = _requiredEvidence.filter(ev => !_flaggedTypes.includes(ev));

    if (_missingFlags.length > 0) {
      const flagBtn = document.getElementById('flag-mode-btn');
      if (flagBtn) {
        flagBtn.classList.remove('btn-pulse-highlight');
        void flagBtn.offsetWidth;
        flagBtn.classList.add('btn-pulse-highlight');
        setTimeout(() => flagBtn.classList.remove('btn-pulse-highlight'), 3200);
      }

      if (typeof RyanGuide !== 'undefined' && gameState.phase === 'mission') {
        const toast = document.getElementById('toast');
        if (toast) toast.classList.add('hidden');

        if (_flaggedTypes.length === 0) {
          // No flags at all yet
          RyanGuide.speak([
            { text: "Whoa, hold up! For this first email, you need to flag the suspicious clues before reporting it.", state: 'concerned' },
            { text: "In a real investigation, IT needs actual proof. You can't just call it a scam without pointing out why!", state: 'thinking' },
            { text: "Turn on 🚩 <strong>Flag Mode</strong> and tag the clues: the fake sender, that pushy countdown, and the shady link.", state: 'speaking' }
          ]);
        } else {
          // Some flags placed but not all
          const _missingLabels = _missingFlags.map(f => f.replace(/_/g, ' ')).join(', ');
          RyanGuide.speak([
            { text: `Nice start! But you're still missing: <strong>${_missingLabels}</strong>. Look a little closer!`, state: 'thinking' },
            { text: "Tag every suspicious clue on this first email to build an airtight case. You've got this!", state: 'speaking' }
          ]);
        }
      } else {
        showToast('Flag all suspicious evidence before reporting the first email as phishing.', 'warning');
      }
      return;
    }
  } else {
    // ── ALL OTHER EMAILS (except first email): require AT LEAST ONE evidence flagged before submitting phishing ──
    if (!gameState.currentEmailFlags || gameState.currentEmailFlags.length === 0) {
      const flagBtn = document.getElementById('flag-mode-btn');
      if (flagBtn) {
        flagBtn.classList.remove('btn-pulse-highlight');
        void flagBtn.offsetWidth;
        flagBtn.classList.add('btn-pulse-highlight');
        setTimeout(() => flagBtn.classList.remove('btn-pulse-highlight'), 3200);
      }

      // User requirement: show "Hold on! You need to flag at least one suspicious clue..." dialogue ONLY ONCE
      if (typeof RyanGuide !== 'undefined' && gameState.phase === 'mission' && !window._phishClueWarnedOnce) {
        window._phishClueWarnedOnce = true;
        const toast = document.getElementById('toast');
        if (toast) toast.classList.add('hidden');

        RyanGuide.speak([
          { text: "Hold on! You need to flag at least one suspicious clue before reporting an email as phishing.", state: 'concerned' },
          { text: "Never report on a wild guess. Turn on 🚩 <strong>Flag Mode</strong> and tag what tipped you off: the sender, the rush, or the link!", state: 'thinking' }
        ]);
      } else {
        showToast('Flag at least one suspicious clue before reporting as phishing.', 'warning');
      }
      return;
    }
  }

  submitReport(true);
}

// ── Direct legitimate email mark ────────────────────────────────────
function submitMarkLegitimate() {
  let email = ch1InboxEmails[gameState.currentEmail];

  if (!email) {
    email = ch1InboxEmails.find(e => !gameState.emailResults.some(r => r.emailId === e.id));
    if (email) {
      gameState.currentEmail = ch1InboxEmails.indexOf(email);
    }
  }

  if (!email) {
    showToast('⚠️ No active email to mark. Please open an email from your inbox first.', 'warning');
    return;
  }

  if (window._awardClaimed) {
    showToast('🏆 Chapter 1 investigation is complete and rewards are claimed.', 'info');
    return;
  }

  // ── FIRST EMAIL GUARD: Cannot submit first email as Non-phishing! ──
  // The first email is a confirmed phishing attack — player can ONLY submit as Phishing
  const _isFirstEmail = (email.id === 1 && email.phishing === true);
  if (_isFirstEmail) {
    const reportBtn = document.getElementById('report-btn');
    if (reportBtn) {
      reportBtn.classList.remove('btn-pulse-highlight');
      void reportBtn.offsetWidth;
      reportBtn.classList.add('btn-pulse-highlight');
      setTimeout(() => reportBtn.classList.remove('btn-pulse-highlight'), 3200);
    }

    if (typeof RyanGuide !== 'undefined' && gameState.phase === 'mission') {
      const toast = document.getElementById('toast');
      if (toast) toast.classList.add('hidden');

      RyanGuide.speak([
        { text: "Wait a second, Alex! This first email is definitely a phishing scam, do not let it fool you!", state: 'concerned' },
        { text: "Look at that weird sender address, the crazy 30 minute deadline, and the fake link. Flag those 3 clues and report it as Phishing!", state: 'thinking' }
      ]);
    } else {
      showToast('⚠️ The first email is a phishing threat. You can only submit it as Phishing.', 'warning');
    }
    return;
  }

  // All other emails: player can submit Non-phishing freely, even if evidence was flagged!
  submitReport(false);
}

// Legacy stubs kept for backward-compat
function showConfirmReport(isPhishing) { if (isPhishing) submitReportPhishing(); else submitMarkLegitimate(); }
function confirmReportYes() {}
function cancelConfirmReport() {}
function showReportDialog() { submitReportPhishing(); }

let isSubmittingReport = false;
function submitReport(isPhishing) {
  if (isSubmittingReport) return;

  if (ch1AutoAdvanceTimer) {
    clearTimeout(ch1AutoAdvanceTimer);
    ch1AutoAdvanceTimer = null;
  }

  // Primary lookup by index; fallback to first unreviewed
  let email = ch1InboxEmails[gameState.currentEmail];
  if (!email) {
    email = ch1InboxEmails.find(e => !gameState.emailResults.some(r => r.emailId === e.id));
    if (email) gameState.currentEmail = ch1InboxEmails.indexOf(email);
  }
  if (!email) {
    showToast('⚠️ Could not find the active email. Please open an email from the inbox.', 'warning');
    return;
  }

  if (window._awardClaimed) {
    showToast('🏆 Chapter 1 investigation is complete and rewards are claimed.', 'info');
    return;
  }

  isSubmittingReport = true;
  try {
    const correctDecision = (isPhishing === email.phishing);

    // ── First email guard: only applies if specifically on the PayPal phishing tutorial email ──
    const isFirstEmail = (email.id === 1 && email.phishing === true && gameState.emailResults.length === 0);
    if (!isPhishing && isFirstEmail) {
      const reportBtn = document.getElementById('report-btn');
      if (reportBtn) {
        reportBtn.classList.remove('btn-pulse-highlight');
        void reportBtn.offsetWidth;
        reportBtn.classList.add('btn-pulse-highlight');
        setTimeout(() => reportBtn.classList.remove('btn-pulse-highlight'), 3200);
      }
      if (typeof RyanGuide !== 'undefined' && gameState.phase === 'mission') {
        const toast = document.getElementById('toast');
        if (toast) toast.classList.add('hidden');
        RyanGuide.speak([
          { text: "Hold on! This first email is a confirmed phishing attack, so you cannot submit it as clean.", state: 'concerned' },
          { text: "Notice the fake sender address, the urgency pressure, and the suspicious link. Flag all 3 clues and submit it as Phishing!", state: 'thinking' }
        ]);
      } else {
        showToast('⚠️ The first email is a phishing threat. You can only submit it as Phishing.', 'warning');
      }
      return;
    }

    // All other emails: user can submit Non-phishing freely, even if evidence was flagged!
    // ── First Email Tutorial: show "Take a closer look before deciding" ONLY ONCE ──
    if (!correctDecision && isFirstEmail && !ch1CloserLookWarnedOnce) {
      ch1CloserLookWarnedOnce = true;
      if (typeof AudioManager !== 'undefined') AudioManager.playWrong();

      const explainText = "Take a closer look before deciding. The sender address 'rewards-claim@paypa1.com' uses a '1' instead of 'l', creates urgency with a 30-minute deadline, and the link leads to an unverified domain. Review the email and try again.";

      if (typeof RyanGuide !== 'undefined') {
        RyanGuide.speak([{ text: explainText, state: 'concerned' }]);
      } else {
        showToast(explainText, 'warning');
      }

      // Do NOT save result, allow one retry on the first email only
      return;
    }

    // ── WHEN DECISION IS RECORDED (Correct or Incorrect) ──
    if (correctDecision) {
      if (typeof AudioManager !== 'undefined') AudioManager.playCorrect();
      gameState.correctDecisions++;
      if (isPhishing) gameState.phishingDetected++;
      else gameState.legitimateDetected++;
    } else {
      if (typeof AudioManager !== 'undefined') AudioManager.playWrong();
      ch1MistakeCount++;
    }

    // Store verified result (replace if retried in a new round)
    const result = {
      emailId: email.id,
      emailIdx: gameState.currentEmail,
      isPhishing: email.phishing,
      playerDecision: isPhishing,
      correctDecision: correctDecision,
      playerFlags: gameState.currentEmailFlags.map(f => f.type),
      savedFlags: [...gameState.currentEmailFlags]
    };
    const existingResIdx = gameState.emailResults.findIndex(r => r.emailId === email.id);
    if (existingResIdx !== -1) {
      gameState.emailResults[existingResIdx] = result;
    } else {
      gameState.emailResults.push(result);
    }
    if (correctDecision && typeof ch1ResolvedEmailIds !== 'undefined') {
      ch1ResolvedEmailIds.add(email.id);
    }
    gameState.correctDecisions = gameState.emailResults.filter(r => r.correctDecision).length;
    gameState.phishingDetected = gameState.emailResults.filter(r => r.isPhishing && r.correctDecision).length;
    gameState.legitimateDetected = gameState.emailResults.filter(r => !r.isPhishing && r.correctDecision).length;

    // ── Update report & flag buttons on this email (keep active unless reward claimed) ──
    const reportBtn = document.getElementById('report-btn');
    const legitBtn  = document.getElementById('legit-btn');
    const isClosed = Boolean(window._awardClaimed);

    if (reportBtn) {
      reportBtn.disabled = isClosed;
      if (isPhishing) {
        reportBtn.innerHTML = '<img src="assets/icons/email/Phishing.png" alt="" class="verdict-btn-icon"> Phishing';
        reportBtn.classList.add('reported');
      } else {
        reportBtn.innerHTML = '<img src="assets/icons/email/Phishing.png" alt="" class="verdict-btn-icon"> Phishing';
        reportBtn.classList.remove('reported');
      }
    }
    if (legitBtn) {
      legitBtn.disabled = isClosed;
      if (!isPhishing) {
        legitBtn.innerHTML = '<img src="assets/icons/email/Legitimate.png" alt="" class="verdict-btn-icon"> Non-phishing';
        legitBtn.classList.add('reported');
      } else {
        legitBtn.innerHTML = '<img src="assets/icons/email/Legitimate.png" alt="" class="verdict-btn-icon"> Non-phishing';
        legitBtn.classList.remove('reported');
      }
    }
    if (typeof updateVerdictButtonsHighlight === 'function') {
      updateVerdictButtonsHighlight();
    }
    const flagModeBtn = document.getElementById('flag-mode-btn');
    if (flagModeBtn) {
      flagModeBtn.disabled = isClosed;
      if (isClosed) flagModeBtn.classList.remove('active');
    }

    // ── Inject verdict banner at the top of the email view ──
    const emailContent = document.getElementById('email-content');
    if (emailContent) {
      const old = emailContent.querySelector('.verdict-banner');
      if (old) old.remove();
      const banner = document.createElement('div');
      banner.className = `verdict-banner ${correctDecision ? 'verdict-banner-correct' : 'verdict-banner-wrong'}`;
      let bannerTitle = '';
      let bannerMsg = '';
      if (correctDecision) {
        bannerTitle = isPhishing ? 'CORRECT: PHISHING' : 'CORRECT: NON-PHISHING';
        bannerMsg = isPhishing ? 'Good catch! You correctly identified this as a phishing email.' : 'Correct! This email is safe and legitimate.';
      } else {
        bannerTitle = isPhishing ? 'INCORRECT: NOT PHISHING' : 'INCORRECT: THIS WAS PHISHING';
        bannerMsg = isPhishing ? 'This email was actually legitimate, not phishing.' : 'This was actually a phishing attempt that went undetected.';
      }
      banner.innerHTML = `
        <span class="vb-icon">${correctDecision ? '✅' : '❌'}</span>
        <div style="flex:1;">
          <strong>${bannerTitle}:</strong> ${bannerMsg}
        </div>
        <button type="button" class="btn btn-primary" onclick="nextEmail()" style="font-size:12px;padding:6px 14px;border-radius:6px;cursor:pointer;background:var(--accent-blue,#4fc3f7);color:#000;font-weight:700;border:none;white-space:nowrap;align-self:center;">
          Next Email ➔
        </button>`;
      emailContent.insertBefore(banner, emailContent.firstChild);
    }

    if (typeof addSimulationNotification === 'function') {
      const subjShort = email.subject.length > 30 ? email.subject.slice(0, 30) + '…' : email.subject;
      addSimulationNotification({
        id: 'notif-verdict-' + email.id,
        source: 'Investigation Log',
        icon: correctDecision ? '✅' : '❌',
        iconType: 'shield',
        title: (correctDecision ? '✅ Correct: ' : '❌ Incorrect: ') + (email.phishing ? 'Phishing' : 'Non-phishing') + ': ' + subjShort,
        body: correctDecision ? 'Decision recorded successfully.' : 'Decision recorded as incorrect.',
        time: 'Just now',
        app: 'gmail',
        emailId: email.id
      }, false);
    }

    updateHUD();
    updateFolderCounts();
    if (gameState.emailResults.length >= 1) {
      updateStickyNoteForPhase('phishing');
    }
    updateStickyChecklist();
    savePhishingProgress();

    // If tutorial was active on email 1, finish tutorial
    if (typeof PhishTutorial !== 'undefined' && PhishTutorial.isActive()) {
      PhishTutorial.finishTutorial();
    }

    // ── Update and expand Investigation Evidence panel ──
    renderEvidencePanel();
    const evPanel = document.getElementById('evidence-panel');
    if (evPanel) {
      evPanel.classList.remove('hidden');
      evPanel.classList.remove('collapsed');
      const label = document.getElementById('evidence-toggle-label');
      const arrow = document.getElementById('evidence-toggle-arrow');
      if (label) label.textContent = 'Hide';
      if (arrow) arrow.textContent = '▼';
    }

    if (ch1AutoAdvanceTimer) {
      clearTimeout(ch1AutoAdvanceTimer);
      ch1AutoAdvanceTimer = null;
    }

    // Return to list view
    const detailView = document.getElementById('email-detail-view');
    const listView   = document.getElementById('email-list-view');
    if (detailView) detailView.classList.remove('active');
    if (listView)   listView.classList.add('active');

    gameState.currentEmailFlags = [];
    gameState.flagModeActive = false;
    if (flagModeBtn) flagModeBtn.classList.remove('active');
    const gmailBody = document.querySelector('.gmail-body');
    if (gmailBody) gmailBody.classList.remove('flag-mode-active');

    // Ryan gives his educational briefing in real-time above the inbox list
    if (typeof RyanGuide !== 'undefined') {
      const tutor = email.ryanTutor;
      let messages;

      if (tutor) {
        messages = correctDecision ? tutor.correct : tutor.wrong;
      } else {
        const addr = email.sender ? email.sender.address : 'unknown';
        if (isPhishing && correctDecision) {
          messages = [
            { text: `Nice catch! "${addr}" is a fake domain built to look like the real thing. That was a phishing email.`, state: 'success' },
            { text: 'Always verify sender domains character by character. Attackers register lookalike domains to steal your credentials.', state: 'speaking' }
          ];
        } else if (isPhishing && !correctDecision) {
          messages = [
            { text: `"${addr}" is actually a real, verified sender. That email was legitimate.`, state: 'concerned' },
            { text: 'Before flagging, ask yourself: is the domain official? Is there real urgency or suspicious links? Not every unexpected email is a threat.', state: 'speaking' }
          ];
        } else if (!isPhishing && correctDecision) {
          messages = [
            { text: `Right call! "${addr}" is a verified, trusted sender with no suspicious urgency or links. That was a safe, legitimate email.`, state: 'success' }
          ];
        } else {
          messages = [
            { text: `That was actually a phishing email. "${addr}" is a fake domain impersonating a real organization.`, state: 'concerned' },
            { text: 'Key red flags to watch: fake sender domain, urgency pressure, suspicious links. Review each email carefully before deciding.', state: 'speaking' }
          ];
        }
      }

      // If this was the first email submitted, guide player to Sticky Notes
      if (gameState.emailResults.length === 1) {
        const sNote = document.getElementById('sticky-note');
        const isNoteOpen = sNote && !sNote.classList.contains('hidden');
        if (isNoteOpen) {
          messages = [
            ...messages,
            {
              text: "Good work on your first email! Your live Mission Checklist in Sticky Notes is now active with your investigation tasks.",
              state: 'speaking'
            },
            {
              text: "Keep an eye on your Sticky Notes checklist as you go through the rest of the emails.",
              state: 'success'
            }
          ];
        } else {
          messages = [
            ...messages,
            {
              text: "Good work on your first email! The next incoming emails have arrived. Check your Sticky Notes on the desktop, I highlighted it for you.",
              state: 'speaking'
            },
            {
              text: "Open your Sticky Notes to check your live Mission Checklist before opening the next email.",
              state: 'success'
            }
          ];
        }

        setTimeout(() => {
          highlightStickyNotesHint();
        }, 400);
      }

      // ── User requirement: ONLY First, Second, Quishing, and Last emails have verdict dialogue ──
      const isFirstEmail    = (email.id === 1 || gameState.emailResults.length === 1);
      const isSecondEmail   = (email.id === 2);
      const isQuishingEmail = (email.id === 8 || (email.body && email.body.some(b => b.type === 'qr')));
      const isLastEmail     = (email.id === 10) || (gameState.emailResults.length >= EMAILS.length);

      const hasVerdictDialogue = isFirstEmail || isSecondEmail || isQuishingEmail || isLastEmail;

      if (hasVerdictDialogue) {
        setTimeout(() => {
          RyanGuide.speak(messages, {
            autoDismiss: 6000
          });
        }, 150);
      }
    }

    // Check if all emails in the current round have received verdicts
    const reviewedInWave = ch1InboxEmails.length > 0 && ch1InboxEmails.every(e => gameState.emailResults.some(r => r.emailId === e.id));
    if (reviewedInWave) {
      if (typeof ch1CheckRoundCompletion === 'function') {
        const isDone = ch1CheckRoundCompletion();
        return;
      }
    }

    // Still have unreviewed emails in current wave
    const nextIdx = ch1InboxEmails.findIndex(e => !gameState.emailResults.some(r => r.emailId === e.id));
    if (nextIdx !== -1) {
      gameState.currentEmail = nextIdx;
    }

    renderEmailList();
    updateHUD();

    if (nextIdx !== -1) {
      setTimeout(() => {
        const nextRow = document.getElementById(`email-item-${ch1InboxEmails[nextIdx].id}`);
        if (nextRow) {
          nextRow.classList.remove('email-row-pulse');
          void nextRow.offsetWidth;
          nextRow.classList.add('email-row-pulse');
          nextRow.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 80);
    }

  } finally {
    isSubmittingReport = false;
  }
}

// ─── Ryan explains each email result with educational content ─────────────────
function showRyanExplanation(email, correctDecision) {
  if (typeof RyanGuide === 'undefined') {
    setTimeout(nextEmail, 1000);
    return;
  }

  const tutor = email.ryanTutor;
  if (!tutor) {
    // Fallback generic message if no ryanTutor defined
    const fallback = correctDecision
      ? [{ text: '✅ ' + (email.phishing ? 'That was a phishing email, and you got it right.' : 'That was a legitimate email and you called it correctly.'), state: 'success' }]
      : [{ text: '⚠️ ' + (email.phishing ? 'That was actually a phishing email. Always check the sender domain and look for urgency pressure.' : 'That was actually a legitimate email. Verify the sender domain before deciding.'), state: 'concerned' }];
    RyanGuide.speak(fallback, { onDone: nextEmail });
    return;
  }

  const messages = correctDecision ? tutor.correct : tutor.wrong;
  RyanGuide.speak(messages, { onDone: nextEmail });
}

// ─── Brief non-blocking coaching note delivered from the inbox after case closes ─
function showRyanExplanationBrief(email, correctDecision, playerSaidPhishing) {
  if (typeof RyanGuide === 'undefined') return;
  let text, state;
  if (correctDecision) {
    text = playerSaidPhishing
      ? `Great call! That was a scam. The address "${email.sender ? email.sender.address : ''}" is totally fake.`
      : `Spot on! Clean internal email with zero red flags.`;
    state = 'success';
  } else {
    text = playerSaidPhishing
      ? `Oops, that was actually a real email! The sender "${email.sender ? email.sender.address : ''}" is verified.`
      : `Heads up, that was actually a phishing attack. Watch out for fake sender domains and forced panic!`;
    state = 'concerned';
  }
  RyanGuide.speak([{ text, state }]);
}

// ═══════════════════════════════════════════════════════════
// CAPYBARA REVIEW
// ═══════════════════════════════════════════════════════════

function showCapybaraResult(result, email) {
  const { correctDecision, isPhishing, playerDecision, correctFlags, incorrectFlags, missedEvidence, score } = result;

  // Verdict
  const verdictTitle = document.getElementById('review-verdict-title');
  const decisionRow = document.getElementById('review-decision-row');

  if (isPhishing) {
    if (correctDecision) {
      verdictTitle.textContent = '✓ PHISHING CONFIRMED';
      verdictTitle.className = 'correct';
      decisionRow.className = 'review-decision-row correct';
      decisionRow.innerHTML = '✓ Correct decision: You correctly identified this as a phishing email.';
    } else {
      verdictTitle.textContent = '✗ MISSED PHISHING';
      verdictTitle.className = 'incorrect';
      decisionRow.className = 'review-decision-row incorrect';
      decisionRow.innerHTML = '✗ Incorrect: This was a phishing email. You marked it as non-phishing.';
    }
  } else {
    if (correctDecision) {
      verdictTitle.textContent = '✓ NON-PHISHING EMAIL';
      verdictTitle.className = 'correct';
      decisionRow.className = 'review-decision-row correct';
      decisionRow.innerHTML = '✓ Correct: You correctly identified this as a non-phishing email.';
    } else {
      verdictTitle.textContent = '✗ FALSE POSITIVE';
      verdictTitle.className = 'incorrect';
      decisionRow.className = 'review-decision-row incorrect';
      decisionRow.innerHTML = '✗ Incorrect: This was a non-phishing email. You marked it as phishing.';
    }
  }

  // Correct flags
  const flagsList = document.getElementById('review-flags-list');
  flagsList.innerHTML = '';

  if (isPhishing && correctFlags.length > 0) {
    correctFlags.forEach(f => {
      const analysis = email.capybaraAnalysis[f];
      if (!analysis) return;
      const item = document.createElement('div');
      item.className = 'review-flag-item correct';
      item.innerHTML = `
        <div class="review-flag-icon">✅</div>
        <div>
          <div class="review-flag-title">CORRECT FLAG (+25)</div>
          <div class="review-flag-desc">${formatAnalysisText(analysis.correct)}</div>
        </div>`;
      flagsList.appendChild(item);
    });
  }

  // Legitimate email — correct identification
  if (!isPhishing && correctDecision) {
    const item = document.createElement('div');
    item.className = 'review-flag-item correct';
    item.innerHTML = `
      <div class="review-flag-icon">✅</div>
      <div>
        <div class="review-flag-title">GOOD INVESTIGATION</div>
        <div class="review-flag-desc">There was no suspicious sender, false urgency, or mismatched link. You correctly avoided flagging normal business communication.</div>
      </div>`;
    flagsList.appendChild(item);
  }

  // Incorrect flags
  const incorrectEl = document.getElementById('review-incorrect-flags');
  incorrectEl.innerHTML = '';
  if (incorrectFlags.length > 0) {
    incorrectEl.classList.remove('hidden');
    incorrectFlags.forEach(f => {
      const item = document.createElement('div');
      item.className = 'review-flag-item incorrect';
      item.innerHTML = `
        <div class="review-flag-icon">⚠️</div>
        <div>
          <div class="review-flag-title">INCORRECT FLAG: ${f.replace('_', ' ').toUpperCase()} (−10)</div>
          <div class="review-flag-desc">${isPhishing
            ? 'This was not a recognised red flag for this email. Focus on fake sender addresses, false urgency, and suspicious links.'
            : 'This is a legitimate email. This element does not indicate phishing. Look for specific, concrete indicators, not general content.'
          }</div>
        </div>`;
      incorrectEl.appendChild(item);
    });
  } else {
    incorrectEl.classList.add('hidden');
  }

  // Missed evidence
  const missedEl = document.getElementById('review-missed');
  missedEl.innerHTML = '';
  if (missedEvidence.length > 0) {
    missedEl.classList.remove('hidden');
    missedEvidence.forEach(f => {
      const analysis = email.capybaraAnalysis[f];
      if (!analysis) return;
      const item = document.createElement('div');
      item.className = 'review-flag-item missed';
      item.innerHTML = `
        <div class="review-flag-icon">🚩</div>
        <div>
          <div class="review-flag-title">MISSED EVIDENCE${correctDecision ? ' (−25)' : ''}</div>
          <div class="review-flag-desc">${formatAnalysisText(analysis.missed)}</div>
        </div>`;
      missedEl.appendChild(item);
    });
  } else {
    missedEl.classList.add('hidden');
  }

  // showCapybaraResult is kept for compatibility but overlay-review has been removed.
  // All feedback is now delivered via Ryan's inline dialogue (showRyanExplanation).
}


function formatAnalysisText(text) {
  return text.replace(/\n/g, '<br>');
}

// ═══════════════════════════════════════════════════════════
// NEXT EMAIL / FINISH
// ═══════════════════════════════════════════════════════════

function nextEmail() {
  if (ch1AutoAdvanceTimer) {
    clearTimeout(ch1AutoAdvanceTimer);
    ch1AutoAdvanceTimer = null;
  }

  // Dismiss any active Ryan dialogue so it doesn't block the screen
  if (typeof RyanGuide !== 'undefined') {
    RyanGuide.dismiss();
  }

  // Check if all emails in the current round have received verdicts
  const reviewedInWave = ch1InboxEmails.length > 0 && ch1InboxEmails.every(e => gameState.emailResults.some(r => r.emailId === e.id));
  if (reviewedInWave) {
    if (typeof ch1CheckRoundCompletion === 'function') {
      ch1CheckRoundCompletion();
      return;
    }
  }

  // Still have unreviewed emails in the current wave — navigate back to inbox list
  const nextIdx = ch1InboxEmails.findIndex(e => !gameState.emailResults.some(r => r.emailId === e.id));
  if (nextIdx === -1) {
    if (typeof ch1CheckRoundCompletion === 'function') {
      ch1CheckRoundCompletion();
    }
    return;
  }

  gameState.currentEmail = nextIdx;
  gameState.currentEmailFlags = [];
  gameState.flagModeActive = false;

  // Switch to inbox list view first
  document.getElementById('email-detail-view').classList.remove('active');
  document.getElementById('email-list-view').classList.add('active');

  renderEmailList();
  updateHUD();

  // Pulse-highlight the next unread email so the player sees it
  setTimeout(() => {
    const nextRow = document.getElementById(`email-item-${ch1InboxEmails[nextIdx].id}`);
    if (nextRow) {
      nextRow.classList.remove('email-row-pulse');
      void nextRow.offsetWidth;
      nextRow.classList.add('email-row-pulse');
      setTimeout(() => nextRow.classList.remove('email-row-pulse'), 3000);
      nextRow.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, 200);

  const remaining = EMAILS.length - gameState.emailResults.length;
  showToast(`📧 Next email is waiting. ${remaining} case${remaining !== 1 ? 's' : ''} remaining.`, 'info');
}

// ═══════════════════════════════════════════════════════════
// FINAL RESULTS
// ═══════════════════════════════════════════════════════════

function finishMission() {
  gameState.phase = 'results';

  // Rank is based purely on decision accuracy (no scoring)
  const total = EMAILS.length;
  const correct = gameState.correctDecisions;
  const pct = correct / total;
  let rank, rankClass, rankLabel;
  if (pct >= 1.0)   { rank = 'S'; rankClass = 'rank-s'; rankLabel = 'CYBER DETECTIVE'; }
  else if (pct >= 0.85) { rank = 'A'; rankClass = '';       rankLabel = 'EXCELLENT DETECTIVE'; }
  else if (pct >= 0.70) { rank = 'B'; rankClass = 'rank-b'; rankLabel = 'GOOD DETECTIVE'; }
  else if (pct >= 0.50) { rank = 'C'; rankClass = 'rank-c'; rankLabel = 'KEEP PRACTICING'; }
  else               { rank = 'D'; rankClass = 'rank-d'; rankLabel = 'NEEDS MORE TRAINING'; }

  const totalEvidence = EMAILS.reduce((sum, e) => sum + e.evidence.length, 0);

  // ── Calculate total evidence found ──
  let totalFoundAcrossAll = 0;
  EMAILS.forEach(email => {
    const res = gameState.emailResults.find(r => r.emailId === email.id);
    const playerFlags = (res && res.savedFlags) ? res.savedFlags : [];
    const flaggedTypes = playerFlags.map(f => f.type);
    const expected = email.evidence || [];
    const foundTypes = expected.filter(t => flaggedTypes.includes(t));
    totalFoundAcrossAll += foundTypes.length;
  });

  gameState.evidenceFoundTotal = totalFoundAcrossAll;

  const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setEl('res-emails',    `${gameState.emailResults.length} / ${total}`);
  setEl('res-decisions', `${correct} / ${total}`);
  setEl('res-evidence',  `${gameState.evidenceFoundTotal} / ${totalEvidence}`);
  setEl('res-phishing',  gameState.phishingDetected);
  setEl('res-legit',     gameState.legitimateDetected);
  setEl('res-accuracy',  `${Math.round(pct * 100)}%`);
  setEl('res-correct-count', correct);
  setEl('res-max-score', total);

  const rankEl = document.getElementById('results-rank');
  if (rankEl) {
    rankEl.textContent = rank;
    rankEl.className = `results-rank-circle ${rankClass}`;
  }
  // Apply tier class to overlay so CSS colour tokens activate (res-rank-s/b/c/d)
  const overlayResultsEl = document.getElementById('overlay-results');
  if (overlayResultsEl) {
    overlayResultsEl.classList.remove('res-rank-s', 'res-rank-b', 'res-rank-c', 'res-rank-d');
    if (rankClass) overlayResultsEl.classList.add('res-rank-' + rank.toLowerCase());
  }
  setEl('results-rank-label', rankLabel);

  // ── Ryan one-liner: gentle score-based message ──
  const ryanLine = document.getElementById('results-ryan-line');
  if (ryanLine) {
    const ryanMsgs = {
      S: '"Flawless. You are thinking like a real security analyst now."',
      A: '"Great work. You caught the threats that matter most. Keep that instinct sharp."',
      B: '"Solid investigation. A few near misses, but your instincts are getting there."',
      C: '"Good start. Every mistake is a lesson. Review the ones you missed and try again."',
      D: '"Do not worry. Phishing is tricky by design. That is exactly why we practice."'
    };
    ryanLine.textContent = ryanMsgs[rank] || ryanMsgs['B'];
  }

  completeCategory('phishing', correct * 100, rank);
  updateAppLockStates();

  // ── Show Sticky Note with the full Task Bar Results & Progress ──
  // ── 1. Evaluate User's Actual Results on All Phishing Checklist Missions & Evidence ──
  if (typeof SN_ACHIEVEMENTS !== 'undefined' && Array.isArray(SN_ACHIEVEMENTS)) {
    SN_ACHIEVEMENTS.forEach(ach => {
      if (typeof ach.check === 'function' && ach.check()) {
        _achievementUnlocked.add(ach.id);
      }
    });
  }

  const completedTasksCount = (typeof getCompletedTasksCount === 'function')
    ? getCompletedTasksCount()
    : (typeof SN_ACHIEVEMENTS !== 'undefined' ? SN_ACHIEVEMENTS.filter(ach => ach.check()).length : 0);
  const totalTasks = (typeof SN_ACHIEVEMENTS !== 'undefined' && Array.isArray(SN_ACHIEVEMENTS)) ? SN_ACHIEVEMENTS.length : 6;
  const allTasksDone = (completedTasksCount >= totalTasks) && (typeof isPhishingTrophyUnlocked === 'function' ? isPhishingTrophyUnlocked() : true);

  if (allTasksDone) {
    _achievementUnlocked.add('task_all_complete');
    _achievementUnlocked.add('phish_trophy_unlocked');
    _achievementUnlocked.add('ach_phishing');
  }

  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  _trophyUnlockedDate = allTasksDone ? dateStr : null;
  _phishingEarnedAward = allTasksDone ? {
    id: 'ach_phishing',
    chapter: 1,
    title: 'Phishing Investigation Award',
    image: 'assets/Achievement/Phishing.png',
    badge: 'CHAPTER 1 · INVESTIGATION AWARD',
    rank: '${totalTasks}/${totalTasks} Missions Completed',
    sub: 'All ${totalTasks} Investigation Checklist Tasks & Evidence Completed',
    desc: 'Outstanding detective work! You successfully analyzed all suspicious emails, exposed deceptive phishing lures, documented spoofed senders, and safeguarded authentic communications.',
    tasksCompleted: totalTasks,
    unlockedDate: dateStr
  } : null;
  savePhishingProgress();

  if (typeof updateDesktopTrophyDisplay === 'function') {
    updateDesktopTrophyDisplay();
  }

  // ── 3. Keep Sticky Note hidden so player focuses on Results / Award modal ──
  if (typeof closeStickyNote === 'function') {
    closeStickyNote();
  } else {
    const sNote = document.getElementById('sticky-note');
    if (sNote) sNote.classList.add('hidden');
  }

  // ── 4. Award unlocked ONLY if all 5 checklist missions & evidence completed ──
  if (allTasksDone) {
    showAchievementToast({
      id: 'ach_phishing',
      label: '🏆 Phishing Investigation Award Unlocked!',
      icon: '🏆',
      isAwardToast: true,
      progress: () => `All ${totalTasks}/${totalTasks} Investigation Checklist Tasks & Evidence Completed!`
    });

    showPhishingAchievementModal(_phishingEarnedAward, completedTasksCount);
  } else {
    // Incomplete requirements: Keep trophy locked as silhouette, do NOT play claim sound, simulate new incoming email
    const missing = [];
    if (typeof SN_ACHIEVEMENTS !== 'undefined') {
      SN_ACHIEVEMENTS.forEach(ach => {
        if (!ach.check()) missing.push(ach.label);
      });
    }
    if (typeof showIncompletePhishingClaimDialogue === 'function') {
      showIncompletePhishingClaimDialogue(missing);
    } else if (typeof showToast === 'function') {
      showToast(`⚠️ Chapter 1 finished (${completedTasksCount}/5 checklist tasks). Collect all required evidence to unlock the Phishing Award.`, 'warning');
      if (typeof simulateIncomingPhishingEmail === 'function') {
        simulateIncomingPhishingEmail();
      }
    }
  }

  if (typeof addSimulationNotification === 'function') {
    addSimulationNotification({
      id: 'notif-ch1-complete',
      source: 'Mission Control',
      icon: allTasksDone ? '🏆' : '📧',
      iconType: 'shield',
      title: 'Chapter 1 Completed: Rank ' + rank,
      body: allTasksDone
        ? `All ${EMAILS.length} emails analyzed with ${Math.round(pct * 100)}% accuracy. Earned Phishing Investigation Award!`
        : `Emails analyzed with ${Math.round(pct * 100)}% accuracy. Checklist: ${completedTasksCount}/5 tasks completed.`,
      time: 'Just now'
    });
  }



  // Close Zmail window so Ryan mentor and Sticky Note are prominently visible
  const gmailWin = document.getElementById('win-gmail');
  if (gmailWin) {
    gmailWin.classList.add('hidden');
    if (typeof appState !== 'undefined' && appState['gmail']) appState['gmail'].open = false;
    if (typeof updateTaskbar === 'function') updateTaskbar();
  }

  if (typeof AudioManager !== 'undefined') AudioManager.playMissionComplete();

  // Pre-arm the Phone Link Newbie Squad invite
  if (typeof setNewbieGcInvitePending === 'function') {
    setNewbieGcInvitePending(false);
  }

  // Save final investigation results for reference
  window._ch1FinalResults = {
    rank,
    rankLabel,
    pct,
    correct,
    total: EMAILS.length,
    earnedTier,
    completedTasksCount
  };
}

// ═══════════════════════════════════════════════════════════
// PLAY AGAIN
// ═══════════════════════════════════════════════════════════

function playAgain(showVN = false) {
  const tbNotes = document.getElementById('taskbar-notes');
  if (tbNotes) {
    tbNotes.classList.remove('btn-pulse-highlight');
  }
  closeOverlay('overlay-results');
  const desktop = document.getElementById('desktop');
  if (desktop) {
    desktop.style.visibility = 'visible';
    desktop.style.opacity = '1';
  }
  // Reset state
  window._phishBrowserCloseToastShown = false;
  updateStickyNoteForPhase('phishing');
  gameState.phase = 'welcome';
  gameState.currentEmail = 0;
  gameState.score = 0;
  gameState.correctDecisions = 0;
  gameState.phishingDetected = 0;
  gameState.legitimateDetected = 0;
  gameState.evidenceFoundTotal = 0;
  gameState.emailResults = [];
  gameState.currentEmailFlags = [];
  gameState.flagModeActive = false;
  gameState.currentFolder = 'inbox';
  gameState.trashedSentIds = [];
  gameState.readSentIds = [];
  gameState.trainingSlide = 0;
  gameState.demoStep = 0;
  gdemoStep = 0;
  gdemoFlags = [];
  gameState.malwareQuarantined = 0;
  gameState.malwareFalsePositives = 0;
  gameState.selectedFolderFileId = null;
  gameState.activeScanFileId = null;
  // Reset Chapter 1 dynamic inbox state
  ch1InboxEmails               = [];
  ch1AnimatedEmailIds.clear();
  ch1PendingNotification       = false;
  ch1Stage                     = 0;
  ch1MistakeCount              = 0;
  ch1InvestigationTutorialDone = false;
  ch1FlaggedLegitWarnedOnce    = false;
  ch1CloserLookWarnedOnce      = false;
  ch1SecondEmailNotesHintDone  = false;
  if (typeof _phishingEarnedAward !== 'undefined') _phishingEarnedAward = null;
  if (typeof FOLDER_FILES !== 'undefined') {
    FOLDER_FILES.forEach(f => { f.quarantined = false; f.scanned = false; });
  }

  // Close apps
  ['gmail', 'browser', 'folder', 'antivirus'].forEach(a => {
    appState[a].open = false;
    appState[a].minimized = false;
    appState[a].maximized = false;
    appState[a].hasBeenPositioned = false;
    const w = document.getElementById(`win-${a}`);
    if (w) {
      w.classList.add('hidden');
      w.classList.remove('maximized', 'focused', 'minimized');
      w.style.left = '';
      w.style.top = '';
    }
  });
  updateTaskbar();

  const hudEl = document.getElementById('hud');
  if (hudEl) hudEl.classList.add('hidden');

  // Reset email list view
  document.getElementById('email-detail-view').classList.remove('active');
  document.getElementById('email-list-view').classList.add('active');
  renderEmailList();
  updateHUD();

  // Reset browser
  browserTabs = [];
  browserActiveTabId = 0;
  browserTabCounter = 0;
  browserHistory = [];
  browserCurrentIdx = -1;
  browserBypassed = new Set();
  document.getElementById('browser-content').innerHTML = BROWSER_HOME_HTML;
  document.getElementById('browser-url-input').value = '';
  document.getElementById('browser-security').textContent = '🔒 Secure';
  document.getElementById('browser-security').className = 'browser-security-indicator secure';
  const strip = document.getElementById('browser-tabs-strip');
  if (strip) strip.innerHTML = '';

  if (showVN) {
    showOverlay('overlay-welcome');
    vnInit();
  }
}
