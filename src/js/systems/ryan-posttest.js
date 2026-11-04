'use strict';

/* ===========================================================
   RYAN POST-TEST - 20-Question Phishing Defense Assessment
   -----------------------------------------------------------
   Evaluates the trainee's cybersecurity knowledge & awareness
   gained during the Chapter 1 Zmail Phishing Investigation.

   - 20 multiple-choice questions (1 per panel, choices A-D).
   - Confirmation modal ("Are you sure you want to begin?").
   - Anti-copy and anti-selection enabled.
   - Result screen with animated circular score ring, confetti,
     and pre-test vs. post-test growth comparison.
   - Saves results to gameState and localStorage.
=========================================================== */

const RyanPosttest = (() => {

  const QUESTIONS = [
    // ── Fundamentals adapted from baseline Pre-Test ──────────────
    {
      q: "What is phishing?",
      c: [
        "A type of computer hardware device",
        "An attempt to trick someone into revealing sensitive information or credentials",
        "A standard method of backing up corporate files",
        "A type of high-speed fiber internet connection"
      ],
      a: 1
    },
    {
      q: "What is malware and how does it compromise computer systems?",
      c: [
        "A cooling device installed inside a desktop computer",
        "A utility software that speeds up internet bandwidth",
        "Harmful software designed to infiltrate, damage devices, or steal private data",
        "An official application store provided by operating systems"
      ],
      a: 2
    },
    {
      q: "What is ransomware and how does it extort victims?",
      c: [
        "It encrypts and locks your files, demanding a ransom payment to unlock them",
        "It automatically cleans malicious viruses from hard drives",
        "It compresses large video files to make computer storage faster",
        "It sends promotional shopping discounts to your inbox"
      ],
      a: 0
    },
    {
      q: "What is social engineering in the context of cybersecurity?",
      c: [
        "Architecting physical local area network cables",
        "Writing complex backend computer programming code",
        "An academic degree covering civil engineering",
        "Psychological manipulation to trick people into giving away access or confidential information"
      ],
      a: 3
    },
    {
      q: "Which of the following demonstrates the strongest password defense?",
      c: [
        "password123",
        "B@yan1han#2026!",
        "Your birthday and pet name",
        "qwerty2026"
      ],
      a: 1
    },
    {
      q: "Why is reusing the same password across multiple online accounts dangerous?",
      c: [
        "Passwords expire automatically after 48 hours",
        "It creates high network latency during logins",
        "If one account is breached, attackers can use that password to access all your other accounts",
        "Web browsers do not permit saving identical passwords"
      ],
      a: 2
    },
    {
      q: "What is Multi-Factor Authentication (MFA) and why is it effective against phishing?",
      c: [
        "An extra verification step, beyond just a password, confirming it is really you",
        "A backup password written on a sticky note",
        "A harmful program that monitors keystrokes",
        "A software tool that conceals your IP address"
      ],
      a: 0
    },
    {
      q: "What is a major cybersecurity risk when using unencrypted public Wi-Fi networks?",
      c: [
        "The router causes your device hardware to overheat",
        "Public Wi-Fi is always significantly faster than private networks",
        "Attackers on the same network may intercept unencrypted data, passwords, and sessions",
        "It automatically uninstalls your security software"
      ],
      a: 2
    },
    {
      q: "Why is it essential to regularly install operating system and security software updates?",
      c: [
        "They only change the desktop wallpaper and icons",
        "They consume system memory without offering protection",
        "They patch known vulnerabilities to defend against new security exploits",
        "Operating systems do not require software updates"
      ],
      a: 2
    },
    {
      q: "Why are regular, secure data backups critical for recovering from cyber attacks?",
      c: [
        "They allow you to restore your files if they are corrupted, lost, or locked by ransomware",
        "They permanently boost computer CPU processing speeds",
        "They hide confidential documents from antivirus scans",
        "They eliminate the need to ever use passwords"
      ],
      a: 0
    },

    // ── Chapter 1 Phishing Investigation & Indicator Analysis ───
    {
      q: "In the investigation, the sender address was rewards-claim@paypa1.com. What threat indicator does this demonstrate?",
      c: [
        "A legitimate internal corporate domain",
        "Typosquatting: replacing the letter 'l' with the digit '1' to deceive victims",
        "A standard encrypted security certificate",
        "A harmless server display formatting error"
      ],
      a: 1
    },
    {
      q: "An email claims you have 'only 30 minutes to claim ₱1,000,000 or your prize is forfeited.' What psychological tactic is being used?",
      c: [
        "False Urgency: creating panic so the recipient acts before thinking or verifying",
        "Standard customer loyalty disbursement procedure",
        "Two-factor authentication enrollment deadline",
        "Routine digital identity synchronization"
      ],
      a: 0
    },
    {
      q: "Before clicking any hyperlink inside an email, what is the best security practice?",
      c: [
        "Click immediately to see where the page redirects",
        "Hover your cursor over the link to preview and verify the actual destination URL",
        "Forward the link to coworkers so they can test it first",
        "Copy and paste the URL into your browser without inspecting it"
      ],
      a: 1
    },
    {
      q: "When classifying an email as 'Non-phishing' (Legitimate), which condition must be met?",
      c: [
        "The email promises unexpected lottery cash or prizes",
        "The sender domain is authentic, all links match official domains, and there is zero malicious intent",
        "The email includes an urgent 10-minute countdown warning",
        "The sender requests your login credentials for account maintenance"
      ],
      a: 1
    },
    {
      q: "Why is relying solely on the sender's display name (e.g. 'IT Support') dangerous?",
      c: [
        "Display names can be easily forged or spoofed to impersonate trusted companies or colleagues",
        "Display names are always digitally encrypted by mail servers",
        "Display names cannot be read by email clients",
        "Only verified organizations are allowed to use display names"
      ],
      a: 0
    },
    {
      q: "What should you do immediately upon identifying a phishing email in your inbox?",
      c: [
        "Reply directly to the scammer asking them to remove your address",
        "Click all attachments to inspect their source code",
        "Flag and report the email through your organization's security reporting tool",
        "Forward the phishing email to your personal personal accounts"
      ],
      a: 2
    },
    {
      q: "An email from an unknown sender includes an attachment named 'Invoice_Payment.pdf.exe'. Why is this hazardous?",
      c: [
        "The file is too compressed to open on modern systems",
        "It is an executable malware program disguised with a double file extension",
        "PDF files are no longer supported over email protocols",
        "It is an automatic operating system diagnostic report"
      ],
      a: 1
    },
    {
      q: "A link inside an email opens a counterfeit login page requesting your corporate password. What attack is this?",
      c: [
        "Credential Harvesting",
        "Ransomware Decryption",
        "Hardware Virtualization",
        "Network Defragmentation"
      ],
      a: 0
    },
    {
      q: "If an email claims your account is locked and demands immediate action, how should you safely verify it?",
      c: [
        "Call the customer service phone number printed inside the suspicious email",
        "Reply to the email asking if the message is real",
        "Contact the organization directly through their known official website or verified phone number",
        "Click the embedded 'Verify Account' button immediately"
      ],
      a: 2
    },
    {
      q: "What is Ryan's core golden defense rule taught throughout your email investigation?",
      c: [
        "Click first, verify later",
        "Trust any message that displays a familiar brand logo",
        "Stop. Check. Verify. Report.",
        "Delete all unread emails every morning"
      ],
      a: 2
    }
  ];

  const LETTERS = ['A', 'B', 'C', 'D'];
  const STORAGE_PREFIX = 'cyberzero_posttest_';

  const RESULT = {
    mastery: {
      icon: '🏆', rank: 'Cyber Sentinel', headline: 'Mastery Level!',
      ryan: 'Twenty out of twenty! Outstanding work, Alex. You demonstrated flawless cybersecurity and phishing detection instincts.'
    },
    expert: {
      icon: '🥈', rank: 'Phishing Specialist', headline: 'Excellent Defense!',
      ryan: 'Great awareness! You caught almost every threat indicator and think like a true cyber defender.'
    },
    competent: {
      icon: '🛡️', rank: 'Vigilant Analyst', headline: 'Solid Awareness!',
      ryan: 'Good job! You have built solid phishing defense habits. Always remember: Stop. Check. Verify. Report.'
    },
    developing: {
      icon: '🌱', rank: 'Developing Defender', headline: 'Good Effort!',
      ryan: 'You have taken your first big step in email security. Keep practicing and your defense instincts will sharpen.'
    }
  };

  const RING_R = 54;
  const RING_C = 2 * Math.PI * RING_R;

  let _index = 0;
  let _answers = [];
  let _onDone = null;
  let _running = false;
  let _mode = 'question';
  let _result = null;
  let _timers = [];
  let _activeQuestions = [];

  const $ = (id) => document.getElementById(id);

  function _getShuffledQuestions() {
    // Clone each question and randomize choice order while maintaining correct answer index
    const list = QUESTIONS.map((item, origIdx) => {
      const correctChoiceText = item.c[item.a];
      const shuffledChoices = [...item.c];
      for (let i = shuffledChoices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledChoices[i], shuffledChoices[j]] = [shuffledChoices[j], shuffledChoices[i]];
      }
      return {
        q: item.q,
        c: shuffledChoices,
        a: shuffledChoices.indexOf(correctChoiceText),
        origIdx: origIdx
      };
    });

    // Randomize question sequence so users cannot memorize question order
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }

    return list;
  }

  function _sfx(name) {
    if (typeof AudioManager === 'undefined' || typeof AudioManager[name] !== 'function') return;
    try { AudioManager[name](); } catch (e) {}
  }

  function _el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  function tierOf(score, total) {
    const p = total > 0 ? (score / total) : 0;
    if (p >= 1.0) return 'mastery';
    if (p >= 0.8) return 'expert';
    if (p >= 0.6) return 'competent';
    return 'developing';
  }

  function _playerKey() {
    let id = 'guest';
    try {
      if (typeof firebase !== 'undefined' && firebase.auth && firebase.auth().currentUser) {
        id = firebase.auth().currentUser.uid || id;
      }
    } catch (e) {}
    return STORAGE_PREFIX + id;
  }

  function getResult() {
    if (typeof gameState !== 'undefined' && gameState.postTestResult) return gameState.postTestResult;
    try {
      const raw = localStorage.getItem(_playerKey());
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  function _save(result) {
    if (typeof gameState !== 'undefined') {
      gameState.postTestCompleted = true;
      gameState.postTestScore = result.score;
      gameState.postTestTotal = result.total;
      gameState.postTestResult = result;
    }
    try { localStorage.setItem(_playerKey(), JSON.stringify(result)); } catch (e) {}
  }

  function isRunning() {
    return _running;
  }

  // ══════════════════════════════════════════════════════════
  // CONFIRMATION MODAL ("Are you sure?")
  // ══════════════════════════════════════════════════════════
  function showConfirmation(onConfirm, onCancel) {
    const bd = $('ryan-posttest-confirm-backdrop');
    if (!bd) {
      if (typeof onConfirm === 'function') onConfirm();
      return;
    }

    bd.style.display = 'flex';
    void bd.offsetHeight;
    bd.classList.add('active');
    _sfx('playPrompt');

    const yesBtn = $('rpost-confirm-yes-btn');
    const noBtn  = $('rpost-confirm-no-btn');

    const cleanup = () => {
      bd.classList.remove('active');
      setTimeout(() => { bd.style.display = 'none'; }, 220);
      if (yesBtn) yesBtn.onclick = null;
      if (noBtn) noBtn.onclick = null;
    };

    if (yesBtn) {
      yesBtn.onclick = () => {
        _sfx('playClick');
        cleanup();
        if (typeof onConfirm === 'function') onConfirm();
      };
    }

    if (noBtn) {
      noBtn.onclick = () => {
        _sfx('playClick');
        cleanup();
        if (typeof onCancel === 'function') {
          onCancel();
        } else if (typeof triggerPostTestReviewLaterGuide === 'function') {
          triggerPostTestReviewLaterGuide();
        }
      };
    }
  }

  // ══════════════════════════════════════════════════════════
  // POST-TEST EXECUTION
  // ══════════════════════════════════════════════════════════
  function launch(onDone) {
    if (_running) return;

    const bd = $('ryan-posttest-backdrop');
    if (!bd) {
      console.warn('[RyanPosttest] backdrop not found, skipping');
      if (typeof onDone === 'function') onDone(null);
      return;
    }

    _activeQuestions = _getShuffledQuestions();
    _index = 0;
    _answers = [];
    _mode = 'question';
    _result = null;
    _onDone = onDone || null;
    _running = true;

    const panel = $('ryan-posttest-panel');
    if (panel) {
      panel.classList.remove(
        'rpost-result-mode',
        'rpost-tier-mastery',
        'rpost-tier-expert',
        'rpost-tier-competent',
        'rpost-tier-developing'
      );
    }

    _render();

    bd.style.display = 'flex';
    void bd.offsetHeight;
    bd.classList.add('rpost-active');
    document.addEventListener('keydown', _onKey, true);

    _sfx('playPretestStart');
  }

  function confirmAndLaunch(onDone, onCancel) {
    showConfirmation(
      () => launch(onDone),
      onCancel
    );
  }

  function _close(fadeConfetti) {
    if (_raf) { cancelAnimationFrame(_raf); _raf = 0; }
    _timers.forEach(clearTimeout);
    _timers = [];
    Confetti.stop(!fadeConfetti);
    const bd = $('ryan-posttest-backdrop');
    if (bd) {
      bd.classList.remove('rpost-active');
      bd.style.display = 'none';
    }
    const panel = $('ryan-posttest-panel');
    if (panel) {
      panel.classList.remove('rpost-result-mode', 'rpost-celebrate', 'rpost-tier-mastery', 'rpost-tier-expert', 'rpost-tier-competent', 'rpost-tier-developing');
    }
    document.removeEventListener('keydown', _onKey, true);
    _running = false;
  }

  function _render() {
    const body = $('rpost-body');
    if (!body) return;
    const questionsList = (_activeQuestions && _activeQuestions.length > 0) ? _activeQuestions : QUESTIONS;
    const item = questionsList[_index];
    const total = questionsList.length;
    const isLast = _index === total - 1;

    const counter = $('rpost-q-counter');
    if (counter) counter.textContent = `Question ${_index + 1} / ${total}`;
    const totalEl = document.querySelector('.rpost-q-total');
    if (totalEl) totalEl.textContent = `Post-Test · ${total} Questions`;
    const fill = $('rpost-progress-fill');
    if (fill) fill.style.width = Math.round((_index / total) * 100) + '%';

    body.innerHTML = '';

    const qEl = _el('p', 'rpost-question', item.q);
    body.appendChild(qEl);

    const group = _el('div', 'rpost-choices');
    group.setAttribute('role', 'radiogroup');

    const next = _el('button', 'rpost-next', isLast ? 'Submit Post-Test' : 'Next Question');
    next.type = 'button';
    next.disabled = _answers[_index] === undefined;
    next.addEventListener('click', _next);

    item.c.forEach((text, i) => {
      const isSelected = _answers[_index] === i;
      const b = _el('button', 'rpost-choice' + (isSelected ? ' rpost-selected' : ''));
      b.type = 'button';
      b.setAttribute('role', 'radio');
      b.setAttribute('aria-checked', isSelected ? 'true' : 'false');
      b.appendChild(_el('span', 'rpost-letter', LETTERS[i]));
      b.appendChild(_el('span', 'rpost-choice-text', text));
      b.addEventListener('click', () => _select(i));
      group.appendChild(b);
    });
    body.appendChild(group);

    const foot = _el('div', 'rpost-footer');
    foot.appendChild(next);
    body.appendChild(foot);
  }

  function _select(i) {
    if (_mode !== 'question') return;
    _answers[_index] = i;
    const body = $('rpost-body');
    if (!body) return;
    body.querySelectorAll('.rpost-choice').forEach((el, idx) => {
      el.classList.toggle('rpost-selected', idx === i);
      el.setAttribute('aria-checked', idx === i ? 'true' : 'false');
    });
    const next = body.querySelector('.rpost-next');
    if (next) next.disabled = false;
    _sfx('playExamChoice');
  }

  function _next() {
    if (_mode !== 'question' || _answers[_index] === undefined) return;
    const questionsList = (_activeQuestions && _activeQuestions.length > 0) ? _activeQuestions : QUESTIONS;
    if (_index < questionsList.length - 1) {
      _index++;
      _render();
      const panel = $('ryan-posttest-panel');
      if (panel) panel.scrollTop = 0;
    } else {
      _finish();
    }
  }

  function _onKey(e) {
    if (!_running) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const k = String(e.key).toLowerCase();

    if (_mode === 'result') {
      if ((k === 'enter' || k === ' ') && _canContinue) {
        e.preventDefault();
        e.stopPropagation();
        _complete();
      }
      return;
    }

    const map = { a: 0, b: 1, c: 2, d: 3, 1: 0, 2: 1, 3: 2, 4: 3 };
    if (Object.prototype.hasOwnProperty.call(map, k)) {
      e.preventDefault();
      _select(map[k]);
    } else if (k === 'enter') {
      e.preventDefault();
      _next();
    }
  }

  // ══════════════════════════════════════════════════════════
  // RESULTS SCREEN
  // ══════════════════════════════════════════════════════════
  function _finish() {
    let score = 0;
    const questionsList = (_activeQuestions && _activeQuestions.length > 0) ? _activeQuestions : QUESTIONS;
    const detail = questionsList.map((item, i) => {
      const ok = _answers[i] === item.a;
      if (ok) score++;
      return { q: i + 1, chosen: LETTERS[_answers[i]], correct: LETTERS[item.a], isCorrect: ok };
    });

    const tier = tierOf(score, questionsList.length);
    const result = {
      score: score,
      total: questionsList.length,
      percent: Math.round((score / questionsList.length) * 100),
      tier: tier,
      rank: RESULT[tier].rank,
      answers: detail,
      completedAt: new Date().toISOString()
    };

    _save(result);
    _showResult(result);
  }

  // ══════════════════════════════════════════════════════════
  // CONFETTI CELEBRATION ENGINE
  // ══════════════════════════════════════════════════════════
  const Confetti = (() => {
    const COLORS = ['#38bdf8', '#ffd700', '#10b981', '#f472b6', '#a78bfa', '#fb923c', '#f8fafc'];
    const MAX = 450;
    let canvas = null, ctx = null, parts = [], raf = 0, last = 0;
    let w = 0, h = 0, dpr = 1, rainUntil = 0, fading = false, fadeAlpha = 1;

    const rand = (a, b) => a + Math.random() * (b - a);

    function resize() {
      if (!canvas) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function ensure() {
      if (canvas) return;
      canvas = document.createElement('canvas');
      canvas.id = 'rpost-confetti';
      canvas.setAttribute('aria-hidden', 'true');
      document.body.appendChild(canvas);
      ctx = canvas.getContext('2d');
      resize();
      window.addEventListener('resize', resize);
    }

    function add(x, y, vx, vy, life) {
      if (parts.length >= MAX) return;
      parts.push({
        x: x, y: y, vx: vx, vy: vy,
        rot: rand(0, Math.PI * 2), vr: rand(-9, 9),
        tilt: rand(0, Math.PI * 2), vt: rand(5, 11),
        w: rand(7, 13), h: rand(4, 8),
        color: COLORS[(Math.random() * COLORS.length) | 0],
        shape: Math.random() < 0.25 ? 1 : 0,
        life: life, max: life, sway: rand(0, Math.PI * 2)
      });
    }

    function cannon(x, y, angleDeg, count) {
      for (let i = 0; i < count; i++) {
        const a = (angleDeg + rand(-24, 24)) * Math.PI / 180;
        const v = rand(0.9, 1.7) * h;
        add(x, y, Math.cos(a) * v, Math.sin(a) * v, rand(3.2, 5.2));
      }
    }

    function burst() {
      ensure();
      cannon(w * 0.05, h * 0.98, -60, 65);
      cannon(w * 0.95, h * 0.98, -120, 65);
      _sfx('playConfettiPop');
      start();
    }

    function rain(ms) {
      ensure();
      rainUntil = performance.now() + ms;
      start();
    }

    function start() {
      if (raf) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }

    function frame(now) {
      const dt = Math.min((now - last) / 1000, 0.033);
      last = now;

      if (now < rainUntil) {
        const n = Math.round(100 * dt + (Math.random() < 0.5 ? 1 : 0));
        for (let i = 0; i < n; i++) add(rand(0, w), -14, rand(-60, 60), rand(40, 160), rand(4.5, 7));
      }

      ctx.clearRect(0, 0, w, h);
      if (fading) {
        fadeAlpha -= dt * 2.2;
        if (fadeAlpha <= 0) { teardown(); return; }
      }

      const g = 1100 * (h / 800);
      const drag = Math.pow(0.05, dt);
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.life -= dt;
        p.vx *= drag;
        p.vy = p.vy * drag + g * dt;
        p.sway += dt * 3;
        p.x += (p.vx + Math.sin(p.sway) * 38) * dt;
        p.y += p.vy * dt;
        p.rot += p.vr * dt;
        p.tilt += p.vt * dt;

        if (p.life <= 0 || p.y > h + 30) { parts.splice(i, 1); continue; }

        const alpha = Math.min(1, p.life / 0.8) * (fading ? Math.max(fadeAlpha, 0) : 1);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.scale(1, Math.cos(p.tilt));
        ctx.fillStyle = p.color;
        if (p.shape === 1) {
          ctx.beginPath();
          ctx.arc(0, 0, p.h * 0.6, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        }
        ctx.restore();
      }

      if (parts.length === 0 && now >= rainUntil) { teardown(); return; }
      raf = requestAnimationFrame(frame);
    }

    function teardown() {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      parts = [];
      rainUntil = 0;
      fading = false;
      fadeAlpha = 1;
      window.removeEventListener('resize', resize);
      if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
      canvas = null;
      ctx = null;
    }

    function stop(immediate) {
      if (!canvas) return;
      rainUntil = 0;
      if (immediate) teardown();
      else { fading = true; }
    }

    return { burst, rain, stop };
  })();

  let _raf = 0;
  let _canContinue = false;

  function _countUp(result, tier, numEl, barEl, contBtn) {
    const total = result.total || 20;
    const dur = 1200;
    const delay = 350;

    const setVal = (v) => {
      if (numEl) numEl.textContent = String(Math.round(v));
      if (barEl) {
        const offset = RING_C * (1 - Math.min(v, total) / total);
        barEl.style.strokeDashoffset = offset.toFixed(2);
      }
    };

    setVal(0);

    setTimeout(() => {
      const t0 = performance.now();
      let lastInt = -1;
      let lastTick = 0;

      const step = (now) => {
        const t = Math.min((now - t0) / dur, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        const v = result.score * eased;
        setVal(v);
        const iv = Math.round(v);
        if (iv !== lastInt) {
          lastInt = iv;
          if (iv > 0 && now - lastTick > 50) {
            lastTick = now;
            _sfx('playResultTick', iv, result.score || 1);
          }
        }
        if (t < 1) {
          _raf = requestAnimationFrame(step);
        } else {
          _raf = 0;
          setVal(result.score);
          _celebrate(tier, contBtn);
        }
      };
      _raf = requestAnimationFrame(step);
    }, delay);
  }

  function _celebrate(tier, contBtn) {
    const panel = $('ryan-posttest-panel');
    if (panel) panel.classList.add('rpost-celebrate');

    if (tier === 'mastery') {
      _sfx('playPerfectFanfare');
      Confetti.burst();
      setTimeout(() => { if (_running) Confetti.burst(); }, 650);
      setTimeout(() => { if (_running) Confetti.rain(2400); }, 900);
    } else if (tier === 'expert') {
      _sfx('playResultGood');
      Confetti.burst();
      setTimeout(() => { if (_running) Confetti.rain(1600); }, 500);
    } else if (tier === 'competent') {
      _sfx('playResultGood');
    } else {
      _sfx('playResultEncourage');
    }

    setTimeout(() => {
      _canContinue = true;
      if (contBtn) {
        contBtn.disabled = false;
        contBtn.classList.add('rpost-btn-ready');
        try { contBtn.focus({ preventScroll: true }); } catch (e) {}
      }
    }, 500);
  }

  function _showResult(result) {
    _mode = 'result';
    _result = result;
    _canContinue = false;

    const tier = result.tier;
    const copy = RESULT[tier];
    const panel = $('ryan-posttest-panel');
    const body = $('rpost-body');
    if (!panel || !body) return;

    panel.classList.remove('rpost-tier-mastery', 'rpost-tier-expert', 'rpost-tier-competent', 'rpost-tier-developing', 'rpost-celebrate');
    panel.classList.add('rpost-result-mode', 'rpost-tier-' + tier);

    const fill = $('rpost-progress-fill');
    if (fill) fill.style.width = '100%';
    const sub = $('rpost-subtitle');
    if (sub) sub.textContent = 'Mission Assessment Complete · Phishing Defense Evaluation';

    body.innerHTML = '';

    const wrap = _el('div', 'rpost-result');

    // ── Left Column: Hero Score & Rank ──
    const hero = _el('div', 'rpost-result-hero');

    const badge = _el('div', 'rpost-badge');
    const icon = _el('div', 'rpost-badge-icon', copy.icon);
    badge.appendChild(icon);

    // Sparkles circling badge for high scores
    if (tier === 'mastery' || tier === 'expert') {
      const angles = [15, 60, 120, 165, 210, 255, 300, 345];
      angles.forEach((a, idx) => {
        const s = _el('span', 'rpost-spark', '✦');
        s.style.setProperty('--a', a + 'deg');
        s.style.setProperty('--d', (idx * 0.22) + 's');
        badge.appendChild(s);
      });
    }

    const ringBox = _el('div', 'rpost-ring-box');
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('class', 'rpost-ring');
    svg.setAttribute('viewBox', '0 0 150 150');

    const track = document.createElementNS(svgNS, 'circle');
    track.setAttribute('class', 'rpost-ring-track');
    track.setAttribute('cx', '75');
    track.setAttribute('cy', '75');
    track.setAttribute('r', String(RING_R));
    svg.appendChild(track);

    const bar = document.createElementNS(svgNS, 'circle');
    bar.setAttribute('class', 'rpost-ring-bar');
    bar.setAttribute('cx', '75');
    bar.setAttribute('cy', '75');
    bar.setAttribute('r', String(RING_R));
    bar.setAttribute('stroke-dasharray', String(RING_C));
    bar.setAttribute('stroke-dashoffset', String(RING_C));
    svg.appendChild(bar);

    ringBox.appendChild(svg);

    const numWrap = _el('div', 'rpost-score-num');
    const num = _el('span', 'rpost-num', '0');
    const denom = _el('span', 'rpost-denom', `/ ${result.total}`);
    numWrap.appendChild(num);
    numWrap.appendChild(denom);
    ringBox.appendChild(numWrap);

    badge.appendChild(ringBox);
    hero.appendChild(badge);

    const rankTag = _el('div', 'rpost-rank-tag', copy.rank);
    hero.appendChild(rankTag);

    const head = _el('div', 'rpost-headline', copy.headline);
    hero.appendChild(head);

    // Tactical HUD Stat Chips
    const hudStats = _el('div', 'rpost-hud-stats');
    const statAcc = _el('div', 'rpost-hud-chip');
    statAcc.appendChild(_el('span', 'rpost-hud-lbl', 'Accuracy'));
    statAcc.appendChild(_el('span', 'rpost-hud-val', `${result.percent}%`));
    hudStats.appendChild(statAcc);

    const statStatus = _el('div', 'rpost-hud-chip');
    statStatus.appendChild(_el('span', 'rpost-hud-lbl', 'Status'));
    const statusText = (result.score >= 16) ? 'Verified' : (result.score >= 12 ? 'Passed' : 'Reviewed');
    statStatus.appendChild(_el('span', 'rpost-hud-val rpost-hud-status', statusText));
    hudStats.appendChild(statStatus);

    hero.appendChild(hudStats);
    wrap.appendChild(hero);

    // ── Right Column: Growth Progression Card & Actions ──
    const details = _el('div', 'rpost-result-details');

    // Growth comparison card against pre-test baseline
    const preResult = (typeof RyanPretest !== 'undefined' && RyanPretest.getResult)
      ? RyanPretest.getResult()
      : (typeof gameState !== 'undefined' ? gameState.preTestResult : null);

    const prePct = preResult ? (preResult.percent || Math.round((preResult.score / preResult.total) * 100)) : null;
    const postPct = result.percent;

    const growthCard = _el('div', 'rpost-growth-card');
    const gHeader = _el('div', 'rpost-growth-header');
    const gTitle = _el('div', 'rpost-growth-title', '⚡ Defense Capability Progression');
    const gBadge = _el('div', 'rpost-growth-badge', 'Training Impact');
    gHeader.appendChild(gTitle);
    gHeader.appendChild(gBadge);
    growthCard.appendChild(gHeader);

    const gRow = _el('div', 'rpost-growth-row');

    const preCol = _el('div', 'rpost-growth-col');
    preCol.appendChild(_el('span', 'rpost-growth-label', 'Baseline Pre-Test'));
    preCol.appendChild(_el('span', 'rpost-growth-val', prePct !== null ? `${prePct}%` : 'Baseline'));
    gRow.appendChild(preCol);

    const arrowWrap = _el('div', 'rpost-growth-arrow-wrap');
    arrowWrap.appendChild(_el('div', 'rpost-growth-arrow', '➔'));
    gRow.appendChild(arrowWrap);

    const postCol = _el('div', 'rpost-growth-col');
    postCol.appendChild(_el('span', 'rpost-growth-label', 'Post-Test'));
    postCol.appendChild(_el('span', 'rpost-growth-val rpost-growth-post-val', `${postPct}%`));
    gRow.appendChild(postCol);

    growthCard.appendChild(gRow);

    // Mini comparison progress bars
    const barsWrap = _el('div', 'rpost-growth-bars');

    const preBarRow = _el('div', 'rpost-growth-bar-row');
    preBarRow.appendChild(_el('span', 'rpost-growth-bar-name', 'Baseline'));
    const preTrack = _el('div', 'rpost-growth-bar-track');
    const preFill = _el('div', 'rpost-growth-bar-fill-pre');
    preFill.style.width = `${Math.max(4, prePct !== null ? prePct : 50)}%`;
    preTrack.appendChild(preFill);
    preBarRow.appendChild(preTrack);
    barsWrap.appendChild(preBarRow);

    const postBarRow = _el('div', 'rpost-growth-bar-row');
    postBarRow.appendChild(_el('span', 'rpost-growth-bar-name', 'Post-Test'));
    const postTrack = _el('div', 'rpost-growth-bar-track');
    const postFill = _el('div', 'rpost-growth-bar-fill-post');
    postFill.style.width = '0%';
    postTrack.appendChild(postFill);
    postBarRow.appendChild(postTrack);
    barsWrap.appendChild(postBarRow);

    growthCard.appendChild(barsWrap);

    // Animate post-test bar width slightly after open
    setTimeout(() => {
      if (postFill) postFill.style.width = `${Math.max(4, postPct)}%`;
    }, 400);

    const diff = prePct !== null ? (postPct - prePct) : null;
    let deltaText = '';
    if (diff !== null && diff > 0) {
      deltaText = `▲ +${diff}% Awareness Improvement after Investigation!`;
    } else if (diff !== null && diff === 0 && postPct >= 90) {
      deltaText = `★ Maintained Flawless Defense Proficiency across All Scenarios!`;
    } else {
      deltaText = `✓ Phishing Defense Training Completed & Evaluated`;
    }
    const gDelta = _el('div', 'rpost-growth-delta', deltaText);
    growthCard.appendChild(gDelta);

    details.appendChild(growthCard);

    // 3. Continue button: Guide to shutdown & save
    const contBtn = _el('button', 'rpost-continue-btn', 'Proceed to Save Progress ➔');
    contBtn.type = 'button';
    contBtn.disabled = true;
    contBtn.addEventListener('click', _complete);
    details.appendChild(contBtn);

    wrap.appendChild(details);
    body.appendChild(wrap);

    panel.scrollTop = 0;

    // Run score count up and trigger celebrations
    _countUp(result, tier, num, bar, contBtn);
  }

  function _complete() {
    if (_mode !== 'result' || !_canContinue) return;
    const cb = _onDone;
    const res = _result;
    _close(true);
    if (typeof updateStickyNoteAfterPostTest === 'function') {
      try { updateStickyNoteAfterPostTest(res); } catch (e) {}
    } else if (typeof updateStickyChecklist === 'function') {
      try { updateStickyChecklist(); } catch (e) {}
    }
    if (typeof cb === 'function') {
      try { cb(res); } catch (e) { console.error('[RyanPosttest] callback failed:', e); }
    }

    // Trigger guidance dialogue to highlights border of Windows Start menu -> Power -> Shutdown (Save)
    setTimeout(() => {
      if (typeof window.triggerPostTestSaveDialogue === 'function') {
        window.triggerPostTestSaveDialogue();
      }
    }, 400);
  }

  function reset() {
    try { localStorage.removeItem(_playerKey()); } catch (e) {}
    if (typeof gameState !== 'undefined') {
      delete gameState.postTestCompleted;
      delete gameState.postTestScore;
      delete gameState.postTestTotal;
      delete gameState.postTestResult;
    }
    _close();
  }

  /**
   * QA & Preview Helper: jump straight to the post-test result screen with a mock score.
   * e.g. RyanPosttest.preview(20) -> perfect score with confetti & fanfare
   */
  function preview(score, onDone) {
    if (_running) return;
    const bd = $('ryan-posttest-backdrop');
    if (!bd || !$('rpost-body')) return;
    const questionsList = QUESTIONS;
    const total = questionsList.length;
    const s = Math.max(0, Math.min(total, Math.round(Number(score) || 0)));
    const tier = tierOf(s, total);
    const result = {
      score: s,
      total: total,
      percent: Math.round((s / total) * 100),
      tier: tier,
      rank: RESULT[tier].rank,
      answers: [],
      completedAt: new Date().toISOString()
    };
    _timers.forEach(clearTimeout);
    _timers = [];
    _onDone = onDone || null;
    _running = true;
    _index = 0;
    
    bd.style.display = 'flex';
    void bd.offsetHeight;
    bd.classList.add('rpost-active');
    document.addEventListener('keydown', _onKey, true);

    _showResult(result);
  }

  return {
    launch,
    confirmAndLaunch,
    showConfirmation,
    getResult,
    isRunning,
    tierOf,
    reset,
    preview
  };

})();

if (typeof window !== 'undefined') {
  window.RyanPosttest = RyanPosttest;
}

