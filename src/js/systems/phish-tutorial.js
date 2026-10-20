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

    setTimeout(() => {
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
        if (lBtn) lBtn.classList.add('btn-pulse-highlight');

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
      setTimeout(() => _showStep(_step + 1), 160);
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
    setTimeout(() => {
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
   * All other emails:   buttons glow as soon as ANY flag exists,
   *                     and dim again if all flags are removed.
   */
  function updateVerdictBtnHighlight() {
    const rBtn = document.getElementById('report-btn');
    const lBtn = document.getElementById('legit-btn');
    if (!rBtn || !lBtn) return;

    const currentEmailObj = (ch1InboxEmails && ch1InboxEmails[gameState.currentEmail]) || (EMAILS && EMAILS[gameState.currentEmail]);
    const isEmail1 = (gameState.currentEmail === 0 || (currentEmailObj && currentEmailObj.id === 1));
    const flags = gameState.currentEmailFlags || [];
    const flagCount = flags.length;
    const EMAIL1_REQUIRED = 3; // all 3 evidence must be flagged on email 1

    // Email 1 tutorial: glow only after ALL 3 flags.
    // Email 2+: glow as soon as 1 flag is placed (first email already completed).
    const firstEmailCompleted = Boolean(gameState.emailResults && gameState.emailResults.length >= 1);
    let shouldGlow = false;
    if (isEmail1 && !firstEmailCompleted) {
      // Strict tutorial mode on email 1: need all 3 evidence flags
      shouldGlow = (flagCount >= EMAIL1_REQUIRED);
    } else {
      // After first email done: 1 flag is enough to enable phishing verdict glow
      shouldGlow = (flagCount >= 1);
    }

    if (shouldGlow) {
      rBtn.classList.add('btn-pulse-highlight');
      lBtn.classList.add('btn-pulse-highlight');
    } else {
      rBtn.classList.remove('btn-pulse-highlight', 'verdict-btn-highlight');
      lBtn.classList.remove('btn-pulse-highlight', 'verdict-btn-highlight');
    }
  }

  return {
    start,
    notify,
    isDone,
    isActive,
    finishTutorial,
    updateVerdictBtnHighlight
  };
})();
