'use strict';

/* ===========================================================
   PHISH TUTORIAL — Inline Guided Walkthrough
   Pure inline text highlights & direct element instructions.
   NO step modals, NO popup containers, NO screen overlays.
=========================================================== */

const PhishTutorial = (() => {
  let _active = false;
  let _step = 0;
  let _currentTarget = null;
  let _done = false;
  let _stepTimer = null;
  let _finishTimer = null;

  const STEPS = [
    // 1. Ryan: "Click Flag to mark this suspicious email for investigation."
    {
      id: 'flag_intro',
      targetId: 'flag-mode-btn',
      text: 'Click Flag to mark this suspicious email for investigation.',
      requireAction: 'flagModeOn',
      state: 'speaking'
    },
    // 2. Ryan: "Check the sender's address for unusual spelling or a suspicious domain."
    {
      id: 'flag_sender',
      targetSelector: '.email-meta-value .flaggable',
      text: "Check the sender's address for unusual spelling or a suspicious domain.",
      requireAction: 'senderFlagged',
      state: 'speaking'
    },
    // 3. Ryan: "Scammers use urgency to pressure you into acting quickly."
    {
      id: 'flag_urgency',
      targetSelector: '.email-body-text .flaggable[data-flag-type="false_urgency"]',
      text: 'Scammers use urgency to pressure you into acting quickly.',
      requireAction: 'urgencyFlagged',
      state: 'speaking'
    },
    // 4. Ryan: "Inspect the suspicious link — hover or flag it to see where it really goes."
    {
      id: 'flag_link',
      targetSelector: '.email-body-text .flaggable[data-flag-type="suspicious_link"]',
      text: 'Inspect the suspicious link — hover or flag it to see where it really goes.',
      requireAction: 'linkFlagged',
      state: 'speaking'
    },
    // 5. Decision — all 3 evidence flags done; highlight classification buttons and show final message.
    {
      id: 'decision',
      text: "Great job investigating the evidence! Now decide whether this email is phishing or legitimate. Choose one of the highlighted buttons.",
      requireAction: 'verdictSubmitted',
      state: 'speaking'
    }
  ];

  function _getTarget(step) {
    if (step.targetId) return document.getElementById(step.targetId);
    if (step.targetSelector) return document.querySelector(step.targetSelector);
    return null;
  }

  function _clearHighlight() {
    if (_currentTarget) {
      _currentTarget.classList.remove('phish-tutorial-highlight');
      _currentTarget = null;
    }
    // Always clear the flag-button blink in case we are leaving step 1
    const flagBtn = document.getElementById('flag-mode-btn');
    if (flagBtn) flagBtn.classList.remove('tutorial-flag-blink');
    const oldCallout = document.getElementById('ptt-inline-callout');
    if (oldCallout) oldCallout.remove();
  }

  function _showStep(idx) {
    if (idx >= STEPS.length) {
      _finish();
      return;
    }

    _step = idx;
    const step = STEPS[idx];

    _clearHighlight();

    if (_stepTimer) clearTimeout(_stepTimer);
    _stepTimer = setTimeout(() => {
      // Step 5: browser inspection
      if (step.id === 'browser_url_inspect') {
        const win = document.getElementById('win-browser');
        if (win) {
          win.classList.remove('hidden', 'minimized');
          focusWindow('browser');
        }
      }

      // Step 7: decision — all 6 evidence steps completed
      if (step.id === 'decision') {
        // Bring Gmail back into front/focus
        openApp('gmail');
        focusWindow('gmail');

        // Only now — after all evidence is investigated — add the tutorial highlight to both
        // classification buttons. Visibility and layout are unchanged; only the highlight class
        // is added here.
        const rBtn = document.getElementById('report-btn');
        const lBtn = document.getElementById('legit-btn');
        if (rBtn) rBtn.classList.add('btn-pulse-highlight');
        // Email 1 tutorial: only highlight the Phishing button — keep Non-Phishing dark
        if (lBtn) lBtn.classList.remove('btn-pulse-highlight', 'verdict-btn-highlight');

        // Show Ryan's final instruction through his existing dialogue interface.
        // The Phishing / Non-phishing buttons are NOT placed inside the dialogue box.
        if (typeof RyanGuide !== 'undefined') {
          RyanGuide.speak([{ text: step.text, state: 'speaking' }]);
        }
        return;
      }

      const target = _getTarget(step);
      if (target) {
        _currentTarget = target;
        target.classList.add('phish-tutorial-highlight');
        // Step 1 only: also add the vivid amber border-blink so the flag button is unmissable
        if (step.id === 'flag_intro') {
          target.classList.add('tutorial-flag-blink');
        }
        target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

      // Display dialogue through Ryan's character interface
      if (typeof RyanGuide !== 'undefined') {
        RyanGuide.speak([{ text: step.text, state: step.state || 'speaking' }]);

        const continueBtn = document.getElementById('ryan-continue-btn');
        if (step.id === 'browser_url_inspect') {
          // Allow player to inspect URL by clicking URL bar OR dialogue continue button
          if (continueBtn) {
            continueBtn.classList.remove('hidden');
            const label = document.getElementById('ryan-continue-label');
            if (label) label.textContent = 'URL INSPECTED ➔';
            continueBtn.onclick = function() {
              continueBtn.onclick = () => RyanGuide.advance();
              notify('urlInspected');
            };
          }
          const urlInput = document.getElementById('browser-url-input');
          const omnibox = document.querySelector('.browser-omnibox-wrap');
          const onInspect = () => {
            if (urlInput) urlInput.removeEventListener('click', onInspect);
            if (omnibox) omnibox.removeEventListener('click', onInspect);
            notify('urlInspected');
          };
          if (urlInput) urlInput.addEventListener('click', onInspect, { once: true });
          if (omnibox) omnibox.addEventListener('click', onInspect, { once: true });
        } else {
          // For interactive steps 1-4, advance only upon required interaction
          if (continueBtn) continueBtn.classList.add('hidden');
        }
      }
    }, step.id === 'browser_url_inspect' ? 250 : 50);
  }

  function notify(event) {
    if (!_active || _done) return;
    const step = STEPS[_step];
    if (!step) return;

    if (step.requireAction === event) {
      if (_stepTimer) clearTimeout(_stepTimer);
      _stepTimer = setTimeout(() => _showStep(_step + 1), 160);
    }
  }

  function finishTutorial() {
    _finish();
  }

  function _finish() {
    _done = true;
    _active = false;
    _clearHighlight();

    const rBtn = document.getElementById('report-btn');
    const lBtn = document.getElementById('legit-btn');
    if (rBtn) rBtn.classList.remove('btn-pulse-highlight', 'verdict-btn-highlight');
    if (lBtn) lBtn.classList.remove('btn-pulse-highlight', 'verdict-btn-highlight');

    // Clean up any remaining legacy elements if present
    const oldOverlay = document.getElementById('phish-tutorial-overlay');
    if (oldOverlay) oldOverlay.remove();
    const oldTooltip = document.getElementById('phish-tutorial-tooltip');
    if (oldTooltip) oldTooltip.remove();
    const oldCallout = document.getElementById('ptt-inline-callout');
    if (oldCallout) oldCallout.remove();
    const oldModal = document.getElementById('phish-edu-summary-modal');
    if (oldModal) oldModal.remove();
    const oldWidget = document.getElementById('url-investigation-widget');
    if (oldWidget) oldWidget.remove();

    // Unlock sticky notes checklist — update content but do NOT auto-open.
    // Highlight the desktop icon so the player knows to open it manually.
    if (_finishTimer) clearTimeout(_finishTimer);
    _finishTimer = setTimeout(() => {
      updateStickyNoteForPhase('phishing');
      // Only update the open note's content if it's already visible
      const sNote = document.getElementById('sticky-note');
      if (sNote && !sNote.classList.contains('hidden')) {
        if (typeof updateStickyChecklist === 'function') updateStickyChecklist();
      }
      if (typeof highlightStickyNotesHint === 'function') highlightStickyNotesHint();

      openApp('gmail');
      focusWindow('gmail');
    }, 200);
  }

  function start() {
    if (_done || _active) return;
    if (gameState.emailResults.length > 0) return;
    const emailObj = ch1InboxEmails[gameState.currentEmail];
    if (!emailObj || emailObj.id !== 1) return;

    if (typeof RyanGuide !== 'undefined') {
      RyanGuide.dismiss();
    }

    _active = true;
    _showStep(0);
  }

  function isDone() { return _done; }
  function isActive() { return _active; }

  /**
   * updateVerdictBtnHighlight — called by placeFlag / removeFlag.
   * Email 1 (tutorial): buttons glow only after ALL 3 evidence flags.
   * First email (email 1): ONLY the Phishing button glows, and only after ALL 3
   *                        required evidence flags are placed. Non-phishing button never glows.
   * Other emails (email 2+): NO glowing effects at all, even if evidence is flagged.
   */
  function updateVerdictBtnHighlight() {
    const rBtn = document.getElementById('report-btn');
    const lBtn = document.getElementById('legit-btn');
    if (!rBtn || !lBtn) return;

    const currentEmailObj = (ch1InboxEmails && ch1InboxEmails[gameState.currentEmail]) || (EMAILS && EMAILS[gameState.currentEmail]);
    const isEmail1 = Boolean(currentEmailObj && currentEmailObj.id === 1) || (gameState.currentEmail === 0 && (!gameState.emailResults || gameState.emailResults.length === 0));
    const firstEmailCompleted = Boolean(gameState.emailResults && gameState.emailResults.some(r => r.emailId === 1));

    // Other emails: NO glowing effects even if you flagged any evidence.
    // Also remove glow if first email is already completed.
    if (!isEmail1 || firstEmailCompleted) {
      rBtn.classList.remove('btn-pulse-highlight', 'verdict-btn-highlight');
      lBtn.classList.remove('btn-pulse-highlight', 'verdict-btn-highlight');
      return;
    }

    const flags = gameState.currentEmailFlags || [];
    const EMAIL1_REQUIRED = 3; // all 3 evidence must be flagged on email 1

    // Email 1 only: glow ONLY after ALL 3 flags are placed
    const flaggedTypes = flags.map(f => f.type);
    const allFound = (currentEmailObj && currentEmailObj.evidence && currentEmailObj.evidence.length > 0)
      ? currentEmailObj.evidence.every(ev => flaggedTypes.includes(ev))
      : (flags.length >= EMAIL1_REQUIRED);

    if (allFound) {
      rBtn.classList.add('btn-pulse-highlight', 'verdict-btn-highlight');
      // Email 1: guide player to Phishing — keep Non-Phishing button dark
      lBtn.classList.remove('btn-pulse-highlight', 'verdict-btn-highlight');
    } else {
      rBtn.classList.remove('btn-pulse-highlight', 'verdict-btn-highlight');
      lBtn.classList.remove('btn-pulse-highlight', 'verdict-btn-highlight');
    }
  }

  function reset() {
    if (_stepTimer) {
      clearTimeout(_stepTimer);
      _stepTimer = null;
    }
    if (_finishTimer) {
      clearTimeout(_finishTimer);
      _finishTimer = null;
    }
    _active = false;
    _step = 0;
    _done = false;
    _clearHighlight();

    // Strip tutorial highlight from any flaggable elements across the entire document
    document.querySelectorAll('.phish-tutorial-highlight').forEach(el => {
      el.classList.remove('phish-tutorial-highlight');
    });

    const rBtn = document.getElementById('report-btn');
    const lBtn = document.getElementById('legit-btn');
    if (rBtn) rBtn.classList.remove('btn-pulse-highlight', 'verdict-btn-highlight');
    if (lBtn) lBtn.classList.remove('btn-pulse-highlight', 'verdict-btn-highlight');

    const flagBtn = document.getElementById('flag-mode-btn');
    if (flagBtn) {
      flagBtn.classList.remove('active', 'btn-pulse-highlight', 'tutorial-flag-blink', 'phish-tutorial-highlight');
    }

    const oldOverlay = document.getElementById('phish-tutorial-overlay');
    if (oldOverlay) oldOverlay.remove();
    const oldTooltip = document.getElementById('phish-tutorial-tooltip');
    if (oldTooltip) oldTooltip.remove();
    const oldCallout = document.getElementById('ptt-inline-callout');
    if (oldCallout) oldCallout.remove();
    const oldModal = document.getElementById('phish-edu-summary-modal');
    if (oldModal) oldModal.remove();
    const oldWidget = document.getElementById('url-investigation-widget');
    if (oldWidget) oldWidget.remove();
  }

  return {
    start,
    notify,
    isDone,
    isActive,
    finishTutorial,
    updateVerdictBtnHighlight,
    reset
  };
})();
