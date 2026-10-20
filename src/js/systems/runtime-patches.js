'use strict';


/* ===========================================================
   RYAN GUIDE - Event Hooks & Integration
=========================================================== */

// Hook: openApp — only fires Ryan for Chapter 1 (phishing), and only AFTER the intro/pretest is done
(function patchOpenApp() {
  const _orig = window.openApp;
  if (typeof _orig !== 'function') return;
  window.openApp = function(appName) {
    _orig.apply(this, arguments);
    const curCat = window._currentChapterCategory || activeCategoryStory || 'phishing';
    if (curCat !== 'phishing') return;

    // ── Skip reactive dialogues while pretest OR Ryan intro is still active ──
    const pretestOn  = typeof RyanPretest !== 'undefined' && RyanPretest.isRunning && RyanPretest.isRunning();
    const introOn    = typeof ch1InboxEmails !== 'undefined' && ch1InboxEmails.length === 0
                       && typeof gameState !== 'undefined' && gameState.phase === 'mission';
    if (pretestOn || introOn) return;

    if (appName === 'gmail') {
      RyanGuide.once('gmail-open', function() {
        setTimeout(function() {
          if ((window._currentChapterCategory || activeCategoryStory) === 'phishing') {
            RyanGuide.speak(RYAN_DIALOGUES.gmailOpen);
          }
        }, 700);
      });
    }
  };
})();

// Hook: toggleStickyNote — only fires Ryan for Chapter 1 (phishing), and only AFTER the intro/pretest is done
(function patchStickyNote() {
  const _orig = window.toggleStickyNote;
  if (typeof _orig !== 'function') return;
  window.toggleStickyNote = function() {
    _orig.apply(this, arguments);
    const curCat = window._currentChapterCategory || activeCategoryStory || 'phishing';
    if (curCat !== 'phishing') return;

    // ── Skip reactive dialogues while pretest OR Ryan intro is still active ──
    const pretestOn  = typeof RyanPretest !== 'undefined' && RyanPretest.isRunning && RyanPretest.isRunning();
    const introOn    = typeof ch1InboxEmails !== 'undefined' && ch1InboxEmails.length === 0
                       && typeof gameState !== 'undefined' && gameState.phase === 'mission';
    if (pretestOn || introOn) return;

    RyanGuide.once('sticky-open', function() {
      setTimeout(function() {
        if ((window._currentChapterCategory || activeCategoryStory) === 'phishing') {
          RyanGuide.speak(RYAN_DIALOGUES.stickyNoteOpen);
        }
      }, 450);
    });
  };
})();

// Hook: renderEmailContent — only fires for Chapter 1
(function patchRenderEmailContent() {
  const _orig = window.renderEmailContent;
  if (typeof _orig !== 'function') return;
  window.renderEmailContent = function(email) {
    _orig.apply(this, arguments);
  };
})();

// Hook: handleEmailLinkClick — only fires Ryan for Chapter 1 (phishing)
(function patchEmailLinkClick() {
  const _orig = window.handleEmailLinkClick;
  if (typeof _orig !== 'function') return;
  window.handleEmailLinkClick = function(event, el) {
    _orig.apply(this, arguments);
    const curCat = window._currentChapterCategory || activeCategoryStory || 'phishing';
    if (curCat !== 'phishing') return;
    RyanGuide.once('link-click-warn', function() {
      setTimeout(function() {
        if ((window._currentChapterCategory || activeCategoryStory) === 'phishing') {
          RyanGuide.speak(RYAN_DIALOGUES.linkClicked);
        }
      }, 350);
    });
  };
})();

// Hook: showCapybaraResult — only fires Ryan for Chapter 1 (phishing)
(function patchCapybaraResult() {
  const _orig = window.showCapybaraResult;
  if (typeof _orig !== 'function') return;
  window.showCapybaraResult = function(result, email) {
    _orig.apply(this, arguments);
    const curCat = window._currentChapterCategory || activeCategoryStory || 'phishing';
    if (curCat !== 'phishing') return;
    const isLast = (typeof gameState !== 'undefined' && typeof EMAILS !== 'undefined')
                  ? gameState.emailResults.length >= EMAILS.length
                  : false;
    let lines;
    if (isLast) {
      lines = RYAN_DIALOGUES.allEmailsDone;
    } else if (result.isPhishing && result.correctDecision) {
      lines = RYAN_DIALOGUES.correctPhishing;
    } else if (result.isPhishing && !result.correctDecision) {
      lines = RYAN_DIALOGUES.missedPhishing;
    } else if (!result.isPhishing && !result.correctDecision) {
      lines = RYAN_DIALOGUES.falsePositive;
    } else {
      lines = RYAN_DIALOGUES.correctLegit;
    }
    setTimeout(function() {
      RyanGuide.speak(lines);
    }, 550);
  };
})();
