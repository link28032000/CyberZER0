'use strict';

// ═══════════════════════════════════════════════════════════
// DEMO FLOW — Animated Guided Walkthrough
// ═══════════════════════════════════════════════════════════

/*
  Demo steps:
  0 — Welcome & intro speech
  1 — "Read the email" (scroll email into view, Capy points)
  2 — Flag Sender  (cursor moves to sender, flag mode activates, flag placed)
  3 — Flag Urgency (cursor moves to urgency text, flag placed)
  4 — Inspect Link (cursor moves to link button, link destination revealed)
  5 — Flag Link    (flag placed on link)
  6 — Report       (cursor to Report button, report modal opens)
  7 — Review       (Capy explains the verdict) → mission starts
*/

const DEMO_SCRIPT = [
  {
    step: 0,
    label: 'Welcome',
    objective: 'Meet your instructor',
    speech: `<strong>Hey there, Student! 🎓</strong><br><br>I'm <strong>Detective Zero</strong>. I'll walk you through <strong>2 emails</strong> — one <span style="color:#ff6b6b">phishing</span>, one <span style="color:#69db7c">legitimate</span> — so you know what to look for.`,
    btn: "Let's Begin →",
    action: null
  },
  {
    step: 1,
    label: 'Read Phishing',
    objective: 'Read the email before judging it',
    speech: `📧 <strong>READ EVERYTHING FIRST</strong><br><br>Never judge by the subject alone. Check the <strong>sender</strong>, <strong>subject</strong>, and <strong>body</strong> first.<br><br>This one already feels rushed and aggressive — that's a clue.`,
    btn: 'Show Me the Red Flags →',
    action: 'read'
  },
  {
    step: 2,
    label: 'Flag Sender',
    objective: 'Flag the fake sender address',
    speech: `🔴 <strong>RED FLAG #1 — FAKE SENDER</strong><br><br><em>bpi.security.verification@gmail.com</em> uses a free public <strong>@gmail.com</strong> address instead of the official bank domain (<em>@bpi.com.ph</em>)! Legitimate banks NEVER email you from Gmail.<br><br>First, click 🚩 <strong>Flag Evidence</strong> to turn on flag mode, then flag it →`,
    btn: 'Flag It & Continue →',
    action: 'flag-sender'
  },
  {
    step: 3,
    label: 'Flag Urgency',
    objective: 'Flag the false urgency tactic',
    speech: `⚡ <strong>RED FLAG #2 — FALSE URGENCY</strong><br><br>"30 minutes or suspended" is pressure meant to stop you thinking. Real banks don't do 30-minute countdowns.<br><br>Flagging it →`,
    btn: 'Flag It & Continue →',
    action: 'flag-urgency'
  },
  {
    step: 4,
    label: 'Inspect Link',
    objective: 'Reveal the link\u2019s real destination',
    speech: `🔗 <strong>RED FLAG #3 — INSPECT BEFORE YOU CLICK</strong><br><br>"Verify My BPI Account" is just a label — it can say anything. Let's reveal where it actually goes →`,
    btn: 'Inspect the Link →',
    action: 'inspect-link'
  },
  {
    step: 5,
    label: 'Flag Link',
    objective: 'Flag the mismatched link',
    speech: `🕵️ <strong>CAUGHT IT.</strong><br><br>The real destination is <em>https://bpi-online-security.com/login</em> — a fake phishing portal built to steal banking credentials.<br><br>Flagging it as evidence #3 →`,
    btn: 'Flag It & Continue →',
    action: 'flag-link'
  },
  {
    step: 6,
    label: 'Report Phishing',
    objective: 'Submit the verdict: Phishing',
    speech: `✅ <strong>3 FLAGS PLACED — EVIDENCE COMPLETE</strong><br><br>→ Fake sender<br>→ False urgency<br>→ Suspicious link<br><br>Time to report this as <strong>Phishing</strong>.`,
    btn: 'Submit Report →',
    action: 'report'
  },
  {
    step: 7,
    label: 'Legit Email',
    objective: 'Learn to recognize a safe email',
    speech: `🛡️ <strong>NOT EVERYTHING IS A THREAT</strong><br><br>Flagging every email is just as useless as flagging none. Here's a routine HR email — let's check it for safety signals instead →`,
    btn: 'Show Legit Email →',
    action: 'show-legit'
  },
  {
    step: 8,
    label: 'Report Legit',
    objective: 'Submit the verdict: Legitimate',
    speech: `✅ <strong>THE 5-POINT LEGITIMACY CHECK</strong><br><br>✔ Matching domain ✔ No urgency ✔ No shady links<br>✔ Routine content ✔ No credential requests<br><br>All clear — marking it <strong>Legitimate</strong>.`,
    btn: 'Mark as Legitimate →',
    action: 'check-legit'
  },
  {
    step: 9,
    label: 'Briefing',
    objective: 'Get ready for your real mission',
    speech: `🏆 <strong>TRAINING COMPLETE, STUDENT!</strong><br><br>🔎 <strong>Spot phishing</strong> — fake senders, pressure tactics, bad links<br>🛡️ <strong>Recognize legit</strong> — verified domain, no urgency<br><br><strong>Your mission:</strong> 5 real emails. Read, flag the evidence, and submit your verdict.`,
    btn: 'START MY MISSION →',
    action: 'done'
  }
];

let gdemoStep = 0;
let gdemoFlags = [];
let gdemoAutoTimer = null;

function startDemo() {
  hideAllOverlays();
  startMission(false);
}

function skipDemo() {
  hideAllOverlays();
  startMission(false);
}

function resetDemoVisuals() {
  // Cursor
  const cursor = document.getElementById('gdemo-cursor');
  cursor.className = 'gdemo-cursor';

  // Sender
  const sender = document.getElementById('gdemo-sender');
  if (sender) { sender.className = 'gdemo-meta-val'; }

  // Urgency
  const urgency = document.getElementById('gdemo-urgency');
  if (urgency) { urgency.className = ''; }

  // Link
  const link = document.getElementById('gdemo-link');
  if (link) { link.classList.remove('gdemo-flagged'); }
  const linkDest = document.getElementById('gdemo-link-dest');
  if (linkDest) { linkDest.classList.add('hidden'); }

  // Flag btn
  const flagBtn = document.getElementById('gdemo-flag-btn');
  if (flagBtn) {
    flagBtn.classList.remove('active');
    flagBtn.disabled = false;
    flagBtn.style.opacity = '1';
  }

  // Report modal (phishing)
  const modal = document.getElementById('gdemo-report-modal');
  if (modal) { modal.classList.add('hidden'); }

  // Report modal (legitimate)
  const legitModal = document.getElementById('gdemo-legit-report-modal');
  if (legitModal) { legitModal.classList.add('hidden'); }

  // Show phishing email, hide legit email
  const phishingEmail = document.getElementById('gdemo-email');
  const legitEmail = document.getElementById('gdemo-legit-email');
  if (phishingEmail) {
    phishingEmail.classList.remove('hidden');
    phishingEmail.style.opacity = '';
    phishingEmail.style.transform = '';
  }
  if (legitEmail) {
    legitEmail.classList.add('hidden');
    legitEmail.style.opacity = '';
    legitEmail.style.transform = '';
  }

  // Reset legit checklist
  const checklist = document.getElementById('gdemo-legit-checklist');
  if (checklist) { checklist.classList.add('hidden'); }

  // Reset legit check icons
  ['gdemo-lcheck-1','gdemo-lcheck-2','gdemo-lcheck-3','gdemo-lcheck-4','gdemo-lcheck-5'].forEach(id => {
    const item = document.getElementById(id);
    if (item) {
      item.classList.remove('gdemo-lcheck-passed');
      const icon = item.querySelector('.gdemo-lcheck-icon');
      if (icon) icon.textContent = '⬜';
    }
  });

  // Reset legit banner
  const banner = document.getElementById('gdemo-legit-banner');
  if (banner) {
    banner.style.background = '';
    banner.style.borderColor = '';
    banner.innerHTML = '<span class="gdemo-legit-banner-icon">🛡️</span><span>Checking legitimacy signals…</span>';
  }

  // Evidence panel
  const evPanel = document.getElementById('gdemo-evidence-panel');
  if (evPanel) evPanel.classList.remove('hidden');
  updateDemoEvidencePanel([]);
}

function renderDemoStep(stepIdx) {
  const script = DEMO_SCRIPT[stepIdx];
  if (!script) return;

  // Update speech bubble with typewriter effect, prefixed by a clear objective banner
  const objectiveHtml = `<div class="gdemo-objective"><span class="gdemo-objective-tag">STEP ${stepIdx + 1}/${DEMO_SCRIPT.length} · ${script.label}</span><span class="gdemo-objective-goal">🎯 ${script.objective}</span></div>`;
  setDemoSpeech(objectiveHtml + script.speech);

  // Update proceed button
  document.getElementById('btn-demo-next').textContent = script.btn;
}

function setDemoSpeech(html) {
  const el = document.getElementById('gdemo-speech-text');
  el.style.opacity = '0';
  el.style.transform = 'translateY(4px)';
  el.style.transition = 'opacity 250ms, transform 250ms';
  setTimeout(() => {
    el.innerHTML = html;
    el.style.opacity = '1';
    el.style.transform = 'translateY(0)';
  }, 200);
}

function demoProceed() {
  const script = DEMO_SCRIPT[gdemoStep];
  if (!script) return;

  if (script.action) {
    executeDemoAction(script.action, () => {
      gdemoStep++;
      renderDemoStep(gdemoStep);
    });
  } else {
    gdemoStep++;
    renderDemoStep(gdemoStep);
  }
}

function executeDemoAction(action, callback) {
  // Disable proceed button during animation
  const btn = document.getElementById('btn-demo-next');
  btn.disabled = true;
  btn.style.opacity = '0.5';

  const re = () => {
    btn.disabled = false;
    btn.style.opacity = '1';
    callback();
  };

  if (action === 'read') {
    // Animate cursor scanning the email
    animateCursorTo('gdemo-email-hdr', () => {
      setTimeout(() => animateCursorTo('gdemo-urgency', () => {
        hideCursor();
        setTimeout(re, 300);
      }), 600);
    });

  } else if (action === 'flag-sender') {
    // 1. Cursor visibly clicks the Flag Evidence button to turn it on
    const flagBtn = document.getElementById('gdemo-flag-btn');
    animateCursorTo('gdemo-flag-btn', () => {
      setTimeout(() => {
        clickEffect(() => {
          flagBtn.classList.add('active');

          // 2. Cursor to sender
          setTimeout(() => {
            animateCursorTo('gdemo-sender', () => {
              // 3. Click & flag
              setTimeout(() => {
                clickEffect(() => {
                  const sender = document.getElementById('gdemo-sender');
                  sender.classList.add('gdemo-flagged');
                  gdemoFlags.push({ icon: '🚩', label: 'FAKE SENDER', text: 'bpi.security.verification@gmail.com' });
                  updateDemoEvidencePanel(gdemoFlags);
                  hideCursor();
                  setTimeout(re, 500);
                });
              }, 400);
            });
          }, 300);
        });
      }, 400);
    });

  } else if (action === 'flag-urgency') {
    animateCursorTo('gdemo-urgency', () => {
      setTimeout(() => {
        clickEffect(() => {
          const urgency = document.getElementById('gdemo-urgency');
          urgency.classList.add('gdemo-flagged');
          gdemoFlags.push({ icon: '🚩', label: 'FALSE URGENCY', text: 'Verify within 30 minutes or be suspended' });
          updateDemoEvidencePanel(gdemoFlags);
          hideCursor();
          setTimeout(re, 500);
        });
      }, 400);
    });

  } else if (action === 'inspect-link') {
    animateCursorTo('gdemo-link', () => {
      // Hover — reveal destination
      setTimeout(() => {
        document.getElementById('gdemo-link-dest').classList.remove('hidden');
        hideCursor();
        setTimeout(re, 600);
      }, 500);
    });

  } else if (action === 'flag-link') {
    animateCursorTo('gdemo-link', () => {
      setTimeout(() => {
        clickEffect(() => {
          const link = document.getElementById('gdemo-link');
          link.classList.add('gdemo-flagged');
          gdemoFlags.push({ icon: '🚩', label: 'SUSPICIOUS LINK', text: 'https://bpi-online-security.com/login' });
          updateDemoEvidencePanel(gdemoFlags);
          hideCursor();
          setTimeout(re, 500);
        });
      }, 400);
    });

  } else if (action === 'report') {
    // Deactivate flag mode
    document.getElementById('gdemo-flag-btn').classList.remove('active');

    animateCursorTo('gdemo-report-btn', () => {
      setTimeout(() => {
        clickEffect(() => {
          // Show report modal
          const modal = document.getElementById('gdemo-report-modal');
          const flagsEl = document.getElementById('gdemo-rm-flags');
          flagsEl.innerHTML = gdemoFlags.map(f =>
            `<div class="gdemo-rm-flag-item">${f.icon} <strong style="color:var(--accent-orange);margin-right:4px">${f.label}</strong> — ${f.text}</div>`
          ).join('');
          modal.classList.remove('hidden');
          hideCursor();

          // After modal appears, move cursor to the REPORT AS PHISHING button
          setTimeout(() => {
            animateCursorTo('gdemo-report-phishing', () => {
              setTimeout(() => {
                // Click animation on the report button
                const reportBtn = document.getElementById('gdemo-report-phishing');
                reportBtn.classList.add('gdemo-clicking');
                clickEffect(() => {
                  reportBtn.classList.remove('gdemo-clicking');
                  modal.classList.add('hidden');
                  hideCursor();
                  setTimeout(re, 400);
                });
              }, 500);
            });
          }, 800);
        });
      }, 400);
    });

  } else if (action === 'show-legit') {
    // Switch from phishing email to legitimate email
    const phishingEmail = document.getElementById('gdemo-email');
    const legitEmail = document.getElementById('gdemo-legit-email');
    const flagBtn = document.getElementById('gdemo-flag-btn');

    // Fade out phishing email
    phishingEmail.style.transition = 'opacity 400ms, transform 400ms';
    phishingEmail.style.opacity = '0';
    phishingEmail.style.transform = 'translateX(-20px)';

    setTimeout(() => {
      phishingEmail.classList.add('hidden');
      phishingEmail.style.opacity = '';
      phishingEmail.style.transform = '';

      // Disable flag mode for legit email
      flagBtn.classList.remove('active');
      flagBtn.disabled = true;
      flagBtn.style.opacity = '0.4';

      const evPanel = document.getElementById('gdemo-evidence-panel');
      if (evPanel) evPanel.classList.add('hidden');

      // Show legit email with fade-in
      legitEmail.classList.remove('hidden');
      legitEmail.style.opacity = '0';
      legitEmail.style.transform = 'translateX(20px)';
      legitEmail.style.transition = 'opacity 400ms, transform 400ms';

      setTimeout(() => {
        legitEmail.style.opacity = '1';
        legitEmail.style.transform = 'translateX(0)';

        // Animate banner
        const banner = document.getElementById('gdemo-legit-banner');
        if (banner) {
          banner.style.animation = 'pulse-green 1s ease';
          setTimeout(() => {
            banner.innerHTML = '<span class="gdemo-legit-banner-icon">🛡️</span><span><strong>Legitimacy check in progress…</strong> Analyzing sender, content, and links.</span>';
          }, 800);
        }

        setTimeout(re, 600);
      }, 50);
    }, 450);

  } else if (action === 'check-legit') {
    // Reveal legitimacy checklist with staggered animations
    const checklist = document.getElementById('gdemo-legit-checklist');
    const banner = document.getElementById('gdemo-legit-banner');
    checklist.classList.remove('hidden');
    checklist.style.opacity = '0';
    checklist.style.transition = 'opacity 300ms';

    if (banner) {
      banner.innerHTML = '<span class="gdemo-legit-banner-icon">✅</span><span><strong>All checks passed!</strong> This email is LEGITIMATE.</span>';
      banner.style.background = 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05))';
      banner.style.borderColor = 'var(--accent-green)';
    }

    setTimeout(() => {
      checklist.style.opacity = '1';
    }, 100);

    // Stagger each checklist item to check off with green
    const checks = ['gdemo-lcheck-1','gdemo-lcheck-2','gdemo-lcheck-3','gdemo-lcheck-4','gdemo-lcheck-5'];
    checks.forEach((id, i) => {
      setTimeout(() => {
        const item = document.getElementById(id);
        if (item) {
          const icon = item.querySelector('.gdemo-lcheck-icon');
          if (icon) {
            icon.textContent = '✅';
            icon.style.animation = 'pop-in 300ms ease';
          }
          item.classList.add('gdemo-lcheck-passed');
        }
      }, 300 + i * 350);
    });

    // After all checks, move cursor to the legit report button
    setTimeout(() => {
      animateCursorTo('gdemo-report-btn', () => {
        setTimeout(() => {
          clickEffect(() => {
            const modal = document.getElementById('gdemo-legit-report-modal');
            modal.classList.remove('hidden');
            hideCursor();

            // Move cursor to "Mark as Legitimate" button
            setTimeout(() => {
              animateCursorTo('gdemo-report-legit', () => {
                setTimeout(() => {
                  const legitBtn = document.getElementById('gdemo-report-legit');
                  if (legitBtn) legitBtn.classList.add('gdemo-clicking');
                  clickEffect(() => {
                    if (legitBtn) legitBtn.classList.remove('gdemo-clicking');
                    modal.classList.add('hidden');
                    hideCursor();
                    setTimeout(re, 400);
                  });
                }, 500);
              });
            }, 800);
          });
        }, 400);
      });
    }, checks.length * 350 + 600);

  } else if (action === 'done') {
    startMission();
  }
}

function animateCursorTo(targetId, cb) {
  const cursor = document.getElementById('gdemo-cursor');
  const workspace = document.getElementById('gdemo-workspace') || document.querySelector('.gdemo-workspace');
  const target = document.getElementById(targetId);
  if (!target || !workspace || !cursor) { if (cb) cb(); return; }

  // Ensure target is scrolled into view if needed
  if (typeof target.scrollIntoView === 'function') {
    target.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  setTimeout(() => {
    const wsRect = workspace.getBoundingClientRect();
    const tRect = target.getBoundingClientRect();

    // Point precisely at the target with fingertip aligned, steady and fixed
    const left = tRect.left - wsRect.left + (tRect.width / 2) - 12;
    const top = tRect.top - wsRect.top + (tRect.height / 2);

    cursor.classList.add('visible');
    cursor.style.left = left + 'px';
    cursor.style.top = top + 'px';

    setTimeout(() => {
      // pulse highlight target
      target.classList.add('gdemo-highlight-pulse');
      setTimeout(() => target.classList.remove('gdemo-highlight-pulse'), 700);
      if (cb) cb();
    }, 700);
  }, 100);
}

function clickEffect(cb) {
  const cursor = document.getElementById('gdemo-cursor');
  // Fixed steady pointer: only apply subtle scale tap without changing emoji between up and down
  cursor.style.transform = 'scale(0.85)';
  setTimeout(() => {
    cursor.style.transform = 'scale(1)';
    if (cb) cb();
  }, 200);
}

function hideCursor() {
  const cursor = document.getElementById('gdemo-cursor');
  cursor.classList.remove('visible');
}

function updateDemoEvidencePanel(flags) {
  const list = document.getElementById('gdemo-evidence-list');
  const badge = document.getElementById('gdemo-evidence-count');
  badge.textContent = `${flags.length} FLAG${flags.length !== 1 ? 'S' : ''}`;

  if (flags.length === 0) {
    list.innerHTML = '<div class="evidence-empty">No flags yet…</div>';
    return;
  }
  list.innerHTML = flags.map(f => `
    <div class="evidence-item" style="animation:slide-in-up 250ms ease">
      <span class="evidence-item-icon">${f.icon}</span>
      <span class="evidence-item-text">${f.text}</span>
      <span class="evidence-item-type">${f.label}</span>
    </div>`).join('');
}
