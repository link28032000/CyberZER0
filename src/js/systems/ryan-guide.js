'use strict';

/* ===========================================================
   RYAN GUIDE SYSTEM - IT Support Mentor
   -----------------------------------------------------------
   Ryan is the trainee's personal IT Support Mentor.
   He guides them with professional, patient coaching:
   "Stop. Check. Verify. Report."
=========================================================== */

const RyanGuide = (() => {
  // DOM references
  const el = () => ({
    overlay:       document.getElementById('ryan-guide-overlay'),
    text:          document.getElementById('ryan-dialogue-text'),
    choices:       document.getElementById('ryan-choices'),
    continueBtn:   document.getElementById('ryan-continue-btn'),
    continueLabel: document.getElementById('ryan-continue-label'),
    portrait:      document.getElementById('ryan-portrait'),
  });

  // Internal state
  let _queue          = [];
  let _typing         = false;
  let _typeTimeout    = null;
  let _cursorEl       = null;
  let _onDoneCallback = null;
  let _seen           = {};
  let _dismissTimer   = null;
  let _opts           = {};

  const CHAR_DELAY  = 18;  // responsive, smooth typing speed
  const MAX_CHARS   = 1000; // allow full text animation for long coaching messages

  // Show / hide overlay
  function _show() {
    const activeCat = window._currentChapterCategory || activeCategoryStory || 'phishing';
    if (activeCat !== 'phishing') return; // Only Chapter 1 has mentor guide Ryan
    const o = el().overlay;
    if (!o) return;
    const toast = document.getElementById('toast');
    if (toast) toast.classList.add('hidden'); // Clear any toast behind Ryan's dialogue
    document.body.classList.add('has-ryan-dialogue');
    if (typeof adjustAppsForDialogue === 'function') adjustAppsForDialogue(true);
    o.classList.remove('hidden', 'ryan-animate-out');
    void o.offsetHeight; // trigger reflow
    o.classList.add('ryan-animate-in');
    o.addEventListener('animationend', () => {
      o.classList.remove('ryan-animate-in');
    }, { once: true });
  }

  function _hide() {
    clearTimeout(_dismissTimer);
    _dismissTimer = null;
    document.body.classList.remove('has-ryan-dialogue');
    if (typeof adjustAppsForDialogue === 'function') adjustAppsForDialogue(false);
    const o = el().overlay;
    if (!o || o.classList.contains('hidden')) return;
    o.classList.add('ryan-animate-out');
    o.addEventListener('animationend', () => {
      o.classList.add('hidden');
      o.classList.remove('ryan-animate-out', 'ryan-speaking', 'ryan-thinking', 'ryan-concerned', 'ryan-success');
    }, { once: true });
  }

  // Portrait state (normal, speaking, thinking, concerned, success)
  function _setState(state) {
    const o = el().overlay;
    if (!o) return;
    o.classList.remove('ryan-speaking', 'ryan-thinking', 'ryan-concerned', 'ryan-success');
    if (state && state !== 'normal') {
      o.classList.add('ryan-' + state);
    }
  }

  // Typewriter effect
  function _typeText(fullText, onComplete) {
    const textEl = el().text;
    if (!textEl) return;
    textEl.innerHTML = '';

    if (fullText.length > MAX_CHARS || fullText.includes('<')) {
      textEl.innerHTML = fullText;
      if (onComplete) onComplete();
      return;
    }

    _typing = true;
    let i = 0;

    _cursorEl = document.createElement('span');
    _cursorEl.className = 'ryan-cursor';
    textEl.appendChild(_cursorEl);

    function tick() {
      if (i >= fullText.length) {
        _typing = false;
        if (_cursorEl && _cursorEl.parentNode) _cursorEl.parentNode.removeChild(_cursorEl);
        if (onComplete) onComplete();
        return;
      }
      textEl.insertBefore(document.createTextNode(fullText[i]), _cursorEl);
      i++;
      _typeTimeout = setTimeout(tick, CHAR_DELAY);
    }
    tick();
  }

  function _skipTyping() {
    if (!_typing) return;
    clearTimeout(_typeTimeout);
    _typing = false;
    const textEl = el().text;
    if (!textEl) return;
    const step = _queue[0];
    if (_cursorEl && _cursorEl.parentNode) _cursorEl.parentNode.removeChild(_cursorEl);
    if (step && step._fullText) textEl.innerHTML = step._fullText;

    // After skipping typing, schedule smart auto-advance if enabled
    if (_opts && _opts.autoDismiss) {
      clearTimeout(_dismissTimer);
      if (_queue.length > 1) {
        _dismissTimer = setTimeout(function() { advance(); }, 3800);
      } else {
        _dismissTimer = setTimeout(function() { advance(); }, 4500);
      }
    }
  }

  // Display current message in queue
  function _showStep() {
    if (_queue.length === 0) return;
    clearTimeout(_dismissTimer);
    _dismissTimer = null;

    const step = _queue[0];
    const refs = el();

    _setState(step.state || 'speaking');
    if (refs.choices) {
      refs.choices.classList.add('hidden');
      refs.choices.innerHTML = '';
    }
    refs.continueBtn.classList.remove('hidden');

    const isLast = _queue.length === 1;
    refs.continueLabel.textContent = (isLast && !(_opts && _opts.moreAfter)) ? 'TAP / CLICK TO CLOSE' : 'TAP TO CONTINUE';

    // Guard: ensure text is always a valid string before typing
    const safeText = (step.text !== undefined && step.text !== null) ? String(step.text) : '';
    step._fullText = safeText;
    _typeText(safeText, function() {
      // Called when message typing is completely finished
      if (_opts && _opts.autoDismiss) {
        clearTimeout(_dismissTimer);
        if (_queue.length > 1) {
          // Auto-advance to the next message in queue so all points are heard
          _dismissTimer = setTimeout(function() { advance(); }, 4000);
        } else {
          // Last message in queue: auto-close after reading time
          _dismissTimer = setTimeout(function() { advance(); }, 4800);
        }
      }
    });
  }

  // Public API

  /**
   * Speak a series of coaching statements
   * @param {Array} messages - [{text, state}] or string[]
   * @param {Object} [opts] - { onDone, autoDismiss }
   */
  function speak(messages, opts) {
    const activeCat = window._currentChapterCategory || activeCategoryStory || 'phishing';
    if (activeCat !== 'phishing') {
      dismiss();
      return;
    }
    _opts = opts || {};
    if (!messages || messages.length === 0) return;

    // ── FIX: Clear any running typing animation to prevent race conditions ──
    clearTimeout(_typeTimeout);
    clearTimeout(_dismissTimer);
    _dismissTimer = null;
    _typing = false;
    if (_cursorEl && _cursorEl.parentNode) {
      _cursorEl.parentNode.removeChild(_cursorEl);
      _cursorEl = null;
    }

    // ── FIX: Sanitize every message text — never allow undefined/null/object ──
    _queue = messages.map(function(m) {
      if (typeof m === 'string') {
        return { text: String(m), state: 'speaking' };
      }
      if (m && typeof m === 'object') {
        return {
          text: (m.text !== undefined && m.text !== null) ? String(m.text) : '',
          state: (typeof m.state === 'string') ? m.state : 'speaking',
          action: m.action || null
        };
      }
      return { text: '', state: 'speaking' };
    }).filter(function(m) { return m.text.length > 0; });

    if (_queue.length === 0) return;

    _onDoneCallback = _opts.onDone || null;

    _show();
    _showStep();
  }

  /**
   * Advance to next dialogue or close if finished
   */
  function advance() {
    clearTimeout(_dismissTimer);
    _dismissTimer = null;
    if (_typing) {
      _skipTyping();
      return;
    }
    const current = _queue.shift();
    if (current && typeof current.action === 'function') {
      try { current.action(); } catch(e) {}
    }
    if (_queue.length > 0) {
      _showStep();
    } else {
      _hide();
      if (typeof _onDoneCallback === 'function') {
        const cb = _onDoneCallback;
        _onDoneCallback = null;
        try { cb(); } catch(e) {}
      }
    }
  }

  function ask(question, choices, callback) {
    speak([{ text: question, state: 'thinking' }]);
    const refs = el();
    if (refs.continueBtn) refs.continueBtn.classList.add('hidden');
    if (refs.choices) {
      refs.choices.classList.remove('hidden');
      refs.choices.innerHTML = '';
      (choices || []).forEach(c => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'ryan-choice-btn' + (c && c.className ? ' ' + c.className : '');
        btn.textContent = (c && c.text) ? c.text : c;
        btn.onclick = () => {
          refs.choices.classList.add('hidden');
          if (typeof callback === 'function') callback(c && c.value !== undefined ? c.value : c);
        };
        refs.choices.appendChild(btn);
      });
    }
  }

  function dismiss() {
    clearTimeout(_typeTimeout);
    clearTimeout(_dismissTimer);
    _dismissTimer = null;
    _typing = false;
    _queue = [];
    _hide();
  }

  function once(key, fn) {
    if (_seen[key]) return false;
    _seen[key] = true;
    if (typeof fn === 'function') fn();
    return true;
  }

  function reset() {
    _seen = {};
    dismiss();
  }

  return { speak, advance, ask, dismiss, once, reset };
})();


/* ===========================================================
   RYAN GUIDE - Dialogue Scripts (IT Support Mentorship)
   Featuring Ryan's signature coaching phrases:
   "Take a closer look." | "What stands out to you?" |
   "Good observation." | "Don't rush. Verify first." |
   "That's a good catch." | "Try checking the sender." |
   "What would you do in a real workplace?"
=========================================================== */

const RYAN_DIALOGUES = {

  // Welcome on initial desktop display
  welcome: [
    { text: "Hi! 👋 I'm Ryan, your cybersecurity mentor here at Technical Solutions — it's great to have you on board!", state: 'speaking' },
    { text: "I'll be guiding you through your training and teaching you how to recognize common cyber threats — starting today!", state: 'speaking' },
    { text: "Your first mission is to investigate suspicious emails in your company inbox. Think carefully before acting — just like you would in a real workplace.", state: 'thinking' },
    { text: "First, open your Detective's Notes on your desktop to review your tips and checklist. Opening your notes will unlock your first email! 💪", state: 'success' }
  ],

  // First time opening Gmail
  gmailOpen: [
    { text: "Good observation opening the inbox first. This is where most attacks attempt to breach an organization.", state: 'speaking' },
    { text: "Take a closer look at the emails waiting in your inbox. What stands out to you about them?", state: 'thinking' }
  ],

  // First time opening Detective Notes / Sticky Notes
  stickyNoteOpen: [
    { text: "Good observation checking your notes! 📒 Keep this checklist open as your guide.", state: 'speaking' },
    { text: "I've sent your first email to Zmail. Open your Inbox (1 new email) to start investigating!", state: 'thinking' }
  ],

  // First email detail view
  firstEmailRead: [
    { text: "Take a closer look at this message. Always think carefully before you report or mark an email as legitimate!", state: 'thinking' },
    { text: "Does the sender's actual address match the company they claim to represent? What stands out to you?", state: 'speaking' },
    { text: "Remember: you need to add a flag to report as phishing. Click '🚩 Flag Mode' to tag suspicious clues first!", state: 'speaking' }
  ],

  // Player clicked an unverified or phishing link
  linkClicked: [
    { text: "Careful! You just clicked a link inside an unverified email.", state: 'concerned' },
    { text: "In a real workplace, never click links before verifying them. What would you do if this were real malware?", state: 'speaking' },
    { text: "Hover over links first to inspect the destination domain. Notice how attackers use deceptive lookalike URLs.", state: 'thinking' }
  ],

  // Player correctly identified and flagged phishing
  correctPhishing: [
    { text: "That's a good catch! You identified the phishing indicators and took the right action.", state: 'success' },
    { text: "Fake sender domains and manufactured urgency are classic social engineering tactics. Excellent investigation.", state: 'speaking' }
  ],

  // Player missed phishing (marked as legitimate)
  missedPhishing: [
    { text: "Let's investigate that before making a final conclusion. That email actually had phishing indicators.", state: 'concerned' },
    { text: "Notice the sender address and the urgent threat to suspend the account. Attackers create panic so users don't think.", state: 'speaking' },
    { text: "Don't worry - this is what training is for. Try checking the sender even more closely on the next one.", state: 'thinking' }
  ],

  // Player marked a legitimate email as phishing (false positive)
  falsePositive: [
    { text: "Take a closer look - this was actually a legitimate internal message.", state: 'concerned' },
    { text: "Not every urgent or administrative notice is malicious. Verify the domain and technical indicators first.", state: 'speaking' },
    { text: "In IT Support, false alarms disrupt coworkers. You'll get sharper with each email.", state: 'thinking' }
  ],

  // Player correctly verified a legitimate email
  correctLegit: [
    { text: "Good observation. You verified the sender and didn't fall for a false alarm.", state: 'success' },
    { text: "Knowing what IS safe is just as vital as catching threats in real IT support. Solid work.", state: 'speaking' }
  ],

  // All emails investigated
  allEmailsDone: [
    { text: "Great work today. You've completed your initial inbox investigation.", state: 'speaking' },
    { text: "You didn't just learn what phishing is. You practiced how to recognize it.", state: 'success' },
    { text: "Remember: Stop. Check. Verify. Report. Let's see your final report card!", state: 'thinking' }
  ]
};
