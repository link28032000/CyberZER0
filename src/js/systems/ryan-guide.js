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
  let _transitioning  = false;  // true while moving between dialogue steps
  let _mainFlowLocked = false;  // true while the mission intro/pretest flow owns the dialogue
  let _typeTimeout    = null;
  let _cursorEl       = null;
  let _onDoneCallback = null;
  let _seen           = {};
  let _dismissTimer   = null;
  let _opts           = {};

  const CHAR_DELAY  = 22;  // smooth video-game dialogue speed (22ms per char)
  const MAX_CHARS   = 2000; // animate up to 2000 chars before going instant

  let _animHandler = null;

  function _clearAnimHandler() {
    const o = el().overlay;
    if (o && _animHandler) {
      o.removeEventListener('animationend', _animHandler);
      _animHandler = null;
    }
  }

  // Show / hide overlay
  function _show() {
    const activeCat = window._currentChapterCategory || activeCategoryStory || 'phishing';
    if (activeCat !== 'phishing' && activeCat !== 'malware') return; // Allow Chapter 1 and Chapter 2 mentor guide Ryan
    const o = el().overlay;
    if (!o) return;
    const roleEl = o.querySelector('.ryan-role');
    if (roleEl) {
      roleEl.textContent = 'IT SUPPORT MENTOR';
    }
    _clearAnimHandler();
    const toast = document.getElementById('toast');
    if (toast) toast.classList.add('hidden'); // Clear any toast behind Ryan's dialogue
    document.body.classList.add('has-ryan-dialogue');
    if (typeof adjustAppsForDialogue === 'function') adjustAppsForDialogue(true);
    o.classList.remove('hidden', 'ryan-animate-out');
    void o.offsetHeight; // trigger reflow
    o.classList.add('ryan-animate-in');
    _animHandler = () => {
      o.classList.remove('ryan-animate-in');
      _animHandler = null;
    };
    o.addEventListener('animationend', _animHandler, { once: true });
  }

  function _hide() {
    _transitioning = false;
    clearTimeout(_dismissTimer);
    _dismissTimer = null;
    document.body.classList.remove('has-ryan-dialogue');
    if (typeof adjustAppsForDialogue === 'function') adjustAppsForDialogue(false);
    const o = el().overlay;
    if (!o || o.classList.contains('hidden')) return;
    _clearAnimHandler();
    o.classList.add('ryan-animate-out');
    _animHandler = () => {
      o.classList.add('hidden');
      o.classList.remove('ryan-animate-out', 'ryan-speaking', 'ryan-thinking', 'ryan-concerned', 'ryan-success');
      _animHandler = null;
    };
    o.addEventListener('animationend', _animHandler, { once: true });
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

  // Typewriter effect — smooth rAF-based video-game dialogue
  function _typeText(fullText, onComplete) {
    const textEl = el().text;
    if (!textEl) return;
    textEl.innerHTML = '';

    // Very long texts: show instantly
    if (fullText.length > MAX_CHARS) {
      textEl.innerHTML = fullText;
      if (onComplete) onComplete();
      return;
    }

    _typing  = true;
    _typeTimeout = null;

    // ── Smooth plain-text typewriter (requestAnimationFrame) ──────────────
    // Handles both plain text and HTML content uniformly via a char array.
    // rAF fires every ~16ms; we accumulate elapsed time to print the right
    // number of characters per frame — silky, jitter-free animation.

    // Flatten HTML into a sequence of [char|tag] tokens
    const tokens = [];
    if (fullText.includes('<')) {
      const re = /(<[^>]+>|[^<]+)/g;
      let mm;
      while ((mm = re.exec(fullText)) !== null) {
        if (mm[0].startsWith('<')) {
          tokens.push({ tag: true, val: mm[0] });
        } else {
          for (const ch of mm[0]) tokens.push({ tag: false, val: ch });
        }
      }
    } else {
      for (const ch of fullText) tokens.push({ tag: false, val: ch });
    }

    let pos      = 0;          // next token index
    let built    = '';         // HTML string built so far
    let lastTime = null;       // timestamp of last rAF callback
    let rafId    = null;       // current rAF handle

    _cursorEl = document.createElement('span');
    _cursorEl.className = 'ryan-cursor';

    function rafTick(ts) {
      if (!_typing) return;   // cancelled by skip/dismiss

      if (lastTime === null) lastTime = ts;
      const elapsed = ts - lastTime;

      // How many chars to print this frame (at least 1 so it always moves)
      let toAdd = Math.max(1, Math.round(elapsed / CHAR_DELAY));

      while (toAdd > 0 && pos < tokens.length) {
        const t = tokens[pos];
        pos++;
        if (t.tag) {
          built += t.val;   // insert whole HTML tag instantly, no count
        } else {
          built += t.val;
          toAdd--;
        }
      }

      textEl.innerHTML = built;
      textEl.appendChild(_cursorEl);
      lastTime = ts;

      if (pos < tokens.length) {
        rafId = requestAnimationFrame(rafTick);
        _typeTimeout = { _raf: true, _id: rafId };
      } else {
        // Done — clean up cursor and fire callback
        _typing = false;
        textEl.innerHTML = fullText;   // ensure final HTML is exact
        if (_cursorEl && _cursorEl.parentNode) _cursorEl.parentNode.removeChild(_cursorEl);
        if (onComplete) onComplete();
      }
    }

    rafId = requestAnimationFrame(rafTick);
    _typeTimeout = { _raf: true, _id: rafId };
  }

  function _skipTyping() {
    if (!_typing) return;
    (function(h){ if(h && h._raf){ cancelAnimationFrame(h._id); } else { clearTimeout(h); } })(_typeTimeout);
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
    _transitioning = false;  // step is now being shown
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
    const defaultLabel = (isLast && !(_opts && _opts.moreAfter)) ? 'TAP / CLICK TO CLOSE' : 'TAP TO CONTINUE';
    refs.continueLabel.textContent = step.label || defaultLabel;

    // Guard: ensure text is always a valid string before typing
    const safeText = (step.text !== undefined && step.text !== null) ? String(step.text) : '';
    step._fullText = safeText;

    // Trigger step onShow callback if present
    if (typeof step.onShow === 'function') {
      try { step.onShow(); } catch (e) { console.error('[RyanGuide] step.onShow failed:', e); }
    }
    // Chapter 2: trigger checklist unlock when Ryan talks about opening Sticky Notes
    if (safeText.includes('Sticky Notes') && (window._currentChapterCategory === 'malware' || (typeof gameState !== 'undefined' && gameState.phase === 'malware'))) {
      window._ch2ChecklistUnlocked = true;
      if (typeof updateStickyNoteForPhase === 'function') updateStickyNoteForPhase('malware');
    }
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
    if (activeCat !== 'phishing' && activeCat !== 'malware') {
      dismiss();
      return;
    }
    _opts = opts || {};

    // ── If the main mission-intro flow owns the dialogue, block all other callers ──
    if (_mainFlowLocked && !(_opts && _opts.mainFlow)) return;

    // ── mainFlow=true: this caller IS the main flow — acquire the lock ──
    if (_opts && _opts.mainFlow) _mainFlowLocked = true;

    if (!messages || messages.length === 0) return;

    // ── Single-show guard: "Take a closer look at this message..." only shows ONCE per session ──
    if (Array.isArray(messages)) {
      const hasCloserLook = messages.some(function(m) {
        const txt = (typeof m === 'string') ? m : (m && m.text ? String(m.text) : '');
        return txt.includes('Take a closer look at this message') ||
               txt.includes('Always think carefully before you report or mark an email as legitimate!');
      });
      if (hasCloserLook) {
        if (window._ch1CloserLookDialogueShown) {
          return; // Strictly show once only!
        }
        window._ch1CloserLookDialogueShown = true;
      }
    }

    // ── FIX: Clear any running typing animation to prevent race conditions ──
    (function(h){ if(h && h._raf){ cancelAnimationFrame(h._id); } else { clearTimeout(h); } })(_typeTimeout);
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
          action: m.action || null,
          label: (typeof m.label === 'string' && m.label.length > 0) ? m.label : null,
          onShow: typeof m.onShow === 'function' ? m.onShow : null
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
   * Advance to next dialogue or close if finished.
   * One click always moves forward — if typing is in progress it is skipped
   * and the next message loads immediately.
   */
  function advance() {
    clearTimeout(_dismissTimer);
    _dismissTimer = null;

    _transitioning = true;  // between steps — keep isActive() = true

    // If still typing, stop immediately and show full text
    if (_typing) {
      (function(h){ if(h && h._raf){ cancelAnimationFrame(h._id); } else { clearTimeout(h); } })(_typeTimeout);
      _typing = false;
      const textEl = el().text;
      const step = _queue[0];
      if (_cursorEl && _cursorEl.parentNode) _cursorEl.parentNode.removeChild(_cursorEl);
      if (textEl && step && step._fullText) textEl.innerHTML = step._fullText;
      // Fall through — do NOT return, proceed to advance the queue
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

  function ask(question, choices, callback, state) {
    speak([{ text: question, state: state || 'thinking' }]);
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
          dismiss();
          if (typeof callback === 'function') callback(c && c.value !== undefined ? c.value : c);
        };
        refs.choices.appendChild(btn);
      });
    }
  }

  function dismiss(skipCallback = false) {
    (function(h){ if(h && h._raf){ cancelAnimationFrame(h._id); } else { clearTimeout(h); } })(_typeTimeout);
    clearTimeout(_dismissTimer);
    _dismissTimer = null;
    _typing = false;
    _queue = [];
    _hide();
    if (!skipCallback && typeof _onDoneCallback === 'function') {
      const cb = _onDoneCallback;
      _onDoneCallback = null;
      try { cb(); } catch(e) {}
    } else {
      _onDoneCallback = null;
    }
  }

  function once(key, fn) {
    if (_seen[key]) return false;
    _seen[key] = true;
    if (typeof fn === 'function') fn();
    return true;
  }

  function reset() {
    _seen = {};
    _mainFlowLocked = false;
    _onDoneCallback = null;
    dismiss(true);
  }

  function lockMainFlow()    { _mainFlowLocked = true; }
  function releaseMainFlow() { _mainFlowLocked = false; }

  return { speak, advance, ask, dismiss, once, reset,
           lockMainFlow, releaseMainFlow,
           isActive: () => _typing || _transitioning || _queue.length > 0 };
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
    { text: "Hi. I'm Ryan, your IT support mentor here at Technical Solutions. It's great to have you on board!", state: 'speaking' },
    { text: "I'll be guiding you through your training and showing you how to spot common cyber threats.", state: 'speaking' },
    { text: "Your first mission is to investigate suspicious emails in your company inbox. Think carefully before taking action, just like you would in a real workplace.", state: 'thinking' },
    { text: "First, open your Detective's Notes on your desktop to review your tips and checklist. Opening your notes will unlock your first email.", state: 'success' }
  ],

  // First time opening Gmail
  gmailOpen: [
    { text: "Good observation opening the inbox first. This is where most attacks attempt to breach an organization.", state: 'speaking' },
    { text: "Take a closer look at the emails waiting in your inbox. What stands out to you about them?", state: 'thinking' }
  ],

  // First time opening Detective Notes / Sticky Notes
  stickyNoteOpen: [
    { text: "Good observation checking your notes. Keep this checklist open as your guide.", state: 'speaking' }
  ],

  // First email detail view
  firstEmailRead: [
    { text: "Take a closer look at this message. Always think carefully before you report or mark an email as legitimate!", state: 'thinking' },
    { text: "Does the sender's actual address match the company they claim to represent? What stands out to you?", state: 'speaking' },
    { text: "Remember: you need to add a flag to report as phishing. Click 'Flag Mode' to tag suspicious clues first.", state: 'speaking' }
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
    { text: "Don't worry, this is what training is for! Try checking the sender even more closely on the next one.", state: 'thinking' }
  ],

  // Player marked a legitimate email as phishing (false positive)
  falsePositive: [
    { text: "Take a closer look here. This was actually a safe internal message.", state: 'concerned' },
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
