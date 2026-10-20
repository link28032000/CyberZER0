'use strict';

/* ===========================================================
   RYAN PRE-TEST - 20-Question Cybersecurity Baseline
   -----------------------------------------------------------
   Shown by Ryan right after his introduction (see
   chapters/ch1-phishing/mission-start.js).

   - One question per panel, 4 choices (A-D), Next button.
   - No correct answers or explanations are shown during the test.
   - Baseline only: no pass/fail. After Question 20 a result screen
     shows the score, a rank, and a short message from Ryan:
       perfect -> confetti + fanfare + trophy
       great   -> sparkles + chime
       ok      -> encouragement
       low     -> calm motivation note to study hard
   - Result is stored on gameState and in localStorage.

   Markup lives in index.html (#ryan-pretest-backdrop).

   API:
     RyanPretest.launch(onDone)      show the test, then onDone(result, info)
                                     info.alreadyTaken is true when a saved
                                     result existed and the test was skipped
     RyanPretest.getResult()         saved result for the current player, or null
     RyanPretest.tierOf(result)      'perfect' | 'great' | 'ok' | 'low'
     RyanPretest.preview(score, cb)  show ONLY the result screen for a fake
                                     score (QA / tuning). Nothing is saved.
     RyanPretest.reset()             forget the saved result (full game restart)
=========================================================== */

const RyanPretest = (() => {

  // c = choices A-D in order, a = index of the single correct choice
  const QUESTIONS = [
    { q: 'What is phishing?',
      c: ['A type of computer hardware', 'An attempt to trick someone into giving sensitive information', 'A method of backing up files', 'A type of internet connection'], a: 1 },
    { q: 'What is malware?',
      c: ['A device that cools your computer', 'A program that makes your internet faster', 'Harmful software made to damage devices or steal information', 'A free app store'], a: 2 },
    { q: 'What does ransomware do?',
      c: ['Locks your files and demands payment to unlock them', 'Removes viruses from your computer', 'Makes your files load faster', 'Sends you free gifts'], a: 0 },
    { q: 'What is social engineering?',
      c: ['Building computer networks', 'Writing computer code', 'A school subject about engineering', 'Tricking people into giving away access or information'], a: 3 },
    { q: 'Which of these is the strongest password?',
      c: ['password123', 'T7!rain&Kite92', 'Your birthday', 'qwerty'], a: 1 },
    { q: 'Why is it risky to use the same password on many websites?',
      c: ['Passwords expire faster', 'It slows down your login', 'If one site is hacked, attackers can try that password on your other accounts', 'It is not risky at all'], a: 2 },
    { q: 'You get an unexpected message with a link. What should you do first?',
      c: ['Check if the link looks suspicious and verify who sent it', 'Click it quickly to see what it is', 'Forward it to all your friends', 'Reply with your password'], a: 0 },
    { q: 'An email says "You won a prize! Send your bank details to claim it." What is the best action?',
      c: ['Send your bank details', 'Reply and ask for more information', 'Click the link to check if it is real', 'Do not respond, and delete or report the email'], a: 3 },
    { q: 'Where is the safest place to download an app or program?',
      c: ['A pop-up ad', 'The official app store or the official website', 'A link sent by a stranger', 'Any free-download website'], a: 1 },
    { q: 'What is a risk of using public Wi-Fi?',
      c: ['It makes your device overheat', 'It is always faster than home Wi-Fi', 'Other people on the network may be able to spy on your activity', 'It deletes your files'], a: 2 },
    { q: 'What is multi-factor authentication (MFA)?',
      c: ['An extra step, besides your password, to prove it is really you', 'A password written on paper', 'A type of virus', 'A way to hide your username'], a: 0 },
    { q: 'Which information should you avoid posting publicly online?',
      c: ['Your favorite food', 'Your favorite color', 'A game you like', 'Your home address and phone number'], a: 3 },
    { q: 'What does antivirus or security software do?',
      c: ['Makes your internet faster', 'Helps detect and remove harmful software', 'Stores your homework', 'Makes your screen brighter'], a: 1 },
    { q: 'Why should you install software updates?',
      c: ['They only change the colors of apps', 'They only use up storage space', 'They often fix security weaknesses', 'They are never needed'], a: 2 },
    { q: 'Which is a sign of a fake or suspicious website?',
      c: ['A misspelled web address and pressure to quickly enter login or payment details', 'The address matches the official company name and you typed it yourself', 'It has a privacy policy page', 'It is shown in your language'], a: 0 },
    { q: 'You find an unknown USB flash drive on the school grounds. What should you do?',
      c: ['Plug it into your computer to find the owner', 'Plug it into a friend\'s computer instead', 'Keep it and share it with classmates', 'Do not plug it in, and hand it to a teacher or IT staff'], a: 3 },
    { q: 'You think your account has been hacked. What should you do first?',
      c: ['Ignore it and hope it goes away', 'Change your password right away, turn on MFA, and report it', 'Delete your phone', 'Post your password online to ask for help'], a: 1 },
    { q: 'A classmate is receiving hurtful messages online. What is a good response?',
      c: ['Reply with even meaner messages', 'Share screenshots to make fun of them', 'Do not engage, save the evidence, block the sender, and tell a trusted adult', 'Delete everything and say nothing'], a: 2 },
    { q: 'Why is it important to back up your files?',
      c: ['So you can recover them if they are lost, damaged, or locked by ransomware', 'It makes your computer faster', 'It hides your files from others', 'It increases your internet speed'], a: 0 },
    { q: 'Which habit best helps keep you safe online?',
      c: ['Sharing passwords with friends', 'Using one password everywhere', 'Ignoring software updates', 'Thinking before you click, using strong unique passwords, and turning on MFA'], a: 3 }
  ];

  const LETTERS = ['A', 'B', 'C', 'D'];
  const STORAGE_PREFIX = 'cyberzero_pretest_';

  // ── Ryan's calm coaching line under the title (by question index) ──
  const COACH = {
    0:  "Take your time. There's no pressure, just answer honestly.",
    4:  "Nice and steady. You're doing great!",
    9:  "Halfway there. Keep going at your own pace.",
    14: "Only five more to go. You've got this.",
    19: "Last one! Almost done."
  };

  // ── Result screen copy, per tier ───────────────────────────────────
  const RESULT = {
    perfect: {
      icon: '\uD83C\uDFC6', rank: 'Cyber Guardian', headline: 'Perfect score!',
      ryan: "Twenty out of twenty! You really know your way around online safety. I'm impressed."
    },
    great: {
      icon: '\uD83D\uDEE1\uFE0F', rank: 'Sharp Defender', headline: 'Great job!',
      ryan: "That's a really strong start. You already think like a defender."
    },
    ok: {
      icon: '\uD83D\uDE80', rank: 'Rising Analyst', headline: 'Good start!',
      ryan: "You have a solid foundation. Keep studying and we'll build on it together, one step at a time."
    },
    low: {
      icon: '\uD83C\uDF31', rank: 'Fresh Recruit', headline: 'Everyone starts somewhere',
      ryan: "Thanks for being honest. This is just your starting point, and I'll be with you the whole way."
    }
  };




  const RING_R = 54;
  const RING_C = 2 * Math.PI * RING_R;

  let _index = 0;
  let _answers = [];
  let _onDone = null;
  let _running = false;
  let _mode = 'question';          // 'question' | 'result'
  let _result = null;
  let _preview = false;
  let _canContinue = false;
  let _raf = 0;
  let _timers = [];

  const $ = (id) => document.getElementById(id);

  function _reduced() {
    try { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); }
    catch (e) { return false; }
  }

  function _later(fn, ms) {
    const t = setTimeout(fn, ms);
    _timers.push(t);
    return t;
  }

  function _clearTimers() {
    _timers.forEach(clearTimeout);
    _timers = [];
    if (_raf) { cancelAnimationFrame(_raf); _raf = 0; }
  }

  function _sfx(name) {
    if (typeof AudioManager === 'undefined' || typeof AudioManager[name] !== 'function') return;
    try { AudioManager[name].apply(AudioManager, Array.prototype.slice.call(arguments, 1)); }
    catch (e) { /* sound is optional */ }
  }

  function _el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  // ── Tier logic ─────────────────────────────────────────────────────
  function tierOf(r) {
    if (!r || !r.total) return 'low';
    if (r.score >= r.total) return 'perfect';
    const p = r.score / r.total;
    if (p >= 0.8) return 'great';
    if (p >= 0.5) return 'ok';
    return 'low';
  }

  // ── Persistence ────────────────────────────────────────────────────
  function _playerKey() {
    let id = 'guest';
    try {
      if (typeof firebase !== 'undefined' && firebase.auth && firebase.auth().currentUser) {
        id = firebase.auth().currentUser.uid || id;
      }
    } catch (e) { /* auth not ready, use guest */ }
    return STORAGE_PREFIX + id;
  }

  function _decorate(r) {
    if (r && !r.tier) {
      r.tier = tierOf(r);
      r.rank = RESULT[r.tier].rank;
    }
    return r;
  }

  function getResult() {
    if (typeof gameState !== 'undefined' && gameState.preTestResult) return _decorate(gameState.preTestResult);
    try {
      const raw = localStorage.getItem(_playerKey());
      return raw ? _decorate(JSON.parse(raw)) : null;
    } catch (e) { return null; }
  }

  function _save(result) {
    if (typeof gameState !== 'undefined') {
      gameState.preTestCompleted = true;
      gameState.preTestScore = result.score;
      gameState.preTestTotal = result.total;
      gameState.preTestResult = result;
    }
    try { localStorage.setItem(_playerKey(), JSON.stringify(result)); } catch (e) { /* storage blocked */ }
  }

  function reset() {
    try { localStorage.removeItem(_playerKey()); } catch (e) { /* ignore */ }
    if (typeof gameState !== 'undefined') {
      delete gameState.preTestCompleted;
      delete gameState.preTestScore;
      delete gameState.preTestTotal;
      delete gameState.preTestResult;
    }
    _close();
    _running = false;
    _onDone = null;
  }

  function _close(fadeConfetti) {
    _clearTimers();
    Confetti.stop(!fadeConfetti);
    const bd = $('ryan-pretest-backdrop');
    if (bd) {
      bd.classList.remove('rpt-active');
      bd.style.display = 'none';
    }
    const panel = $('ryan-pretest-panel');
    if (panel) panel.classList.remove('rpt-result-mode', 'rpt-tier-perfect', 'rpt-tier-great', 'rpt-tier-ok', 'rpt-tier-low');
    document.removeEventListener('keydown', _onKey, true);
  }

  // ══════════════════════════════════════════════════════════
  // CONFETTI (canvas, self-contained, auto-cleans up)
  // ══════════════════════════════════════════════════════════
  const Confetti = (() => {
    const COLORS = ['#38bdf8', '#fcd34d', '#34d399', '#f472b6', '#a78bfa', '#fb923c', '#f8fafc'];
    const MAX = 480;
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
      canvas.id = 'rpt-confetti';
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
        shape: Math.random() < 0.22 ? 1 : 0,
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
      cannon(w * 0.04, h * 0.98, -62, 70);
      cannon(w * 0.96, h * 0.98, -118, 70);
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
        const n = Math.round(110 * dt + (Math.random() < 0.5 ? 1 : 0));
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

    return { burst: burst, rain: rain, stop: stop };
  })();

  // ══════════════════════════════════════════════════════════
  // QUESTION VIEW
  // ══════════════════════════════════════════════════════════
  function _coach(i) {
    const sub = $('rpt-subtitle');
    if (!sub || !Object.prototype.hasOwnProperty.call(COACH, i)) return;
    sub.classList.remove('rpt-swap');
    void sub.offsetWidth;
    sub.textContent = COACH[i];
    sub.classList.add('rpt-swap');
  }

  function _render() {
    const body = $('rpt-body');
    if (!body) return;
    const item = QUESTIONS[_index];
    const total = QUESTIONS.length;
    const isLast = _index === total - 1;

    const counter = $('rpt-q-counter');
    if (counter) counter.textContent = 'Question ' + (_index + 1) + ' / ' + total;
    const fill = $('rpt-progress-fill');
    if (fill) fill.style.width = Math.round((_index / total) * 100) + '%';
    _coach(_index);

    body.innerHTML = '';
    body.classList.remove('rpt-enter');

    const qEl = _el('p', 'rpt-question', item.q);
    body.appendChild(qEl);

    const group = _el('div', 'rpt-choices');
    group.setAttribute('role', 'radiogroup');
    group.setAttribute('aria-label', 'Question ' + (_index + 1));

    const next = _el('button', 'rpt-next', isLast ? 'Finish' : 'Next');
    next.type = 'button';
    next.disabled = _answers[_index] === undefined;
    next.addEventListener('click', _next);

    item.c.forEach((text, i) => {
      const b = _el('button', 'rpt-choice' + (_answers[_index] === i ? ' rpt-selected' : ''));
      b.type = 'button';
      b.style.setProperty('--i', i);
      b.setAttribute('role', 'radio');
      b.setAttribute('aria-checked', _answers[_index] === i ? 'true' : 'false');
      b.appendChild(_el('span', 'rpt-letter', LETTERS[i]));
      b.appendChild(_el('span', 'rpt-choice-text', text));
      b.addEventListener('click', () => _select(i));
      group.appendChild(b);
    });
    body.appendChild(group);

    const foot = _el('div', 'rpt-footer');
    foot.appendChild(next);
    body.appendChild(foot);

    void body.offsetWidth;
    body.classList.add('rpt-enter');
  }

  function _select(i) {
    if (_mode !== 'question') return;
    _answers[_index] = i;
    const body = $('rpt-body');
    if (!body) return;
    body.querySelectorAll('.rpt-choice').forEach((el, idx) => {
      el.classList.toggle('rpt-selected', idx === i);
      el.setAttribute('aria-checked', idx === i ? 'true' : 'false');
      el.classList.remove('rpt-pop');
      if (idx === i) { void el.offsetWidth; el.classList.add('rpt-pop'); }
    });
    const next = body.querySelector('.rpt-next');
    if (next) next.disabled = false;
    _sfx('playExamChoice');
  }

  function _next() {
    if (_mode !== 'question' || _answers[_index] === undefined) return;
    if (_index < QUESTIONS.length - 1) {
      _index++;
      _render();
      const panel = $('ryan-pretest-panel');
      if (panel) panel.scrollTop = 0;
    } else {
      _finish();
    }
  }

  function _onKey(e) {
    if (!_running) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;   // never swallow browser shortcuts
    const k = String(e.key).toLowerCase();

    if (_mode === 'result') {
      if (k === 'enter' || k === ' ') {
        e.preventDefault();
        e.stopPropagation();
        _complete();
      } else if (k === 'escape') {
        e.preventDefault();
        e.stopPropagation();
      }
      return;
    }

    const map = { a: 0, b: 1, c: 2, d: 3, 1: 0, 2: 1, 3: 2, 4: 3 };
    if (Object.prototype.hasOwnProperty.call(map, k)) {
      e.preventDefault();
      e.stopPropagation();
      _select(map[k]);
    } else if (k === 'enter') {
      e.preventDefault();
      e.stopPropagation();
      _next();
    } else if (k === 'escape') {
      // the test cannot be dismissed
      e.preventDefault();
      e.stopPropagation();
    }
  }

  // ══════════════════════════════════════════════════════════
  // RESULT VIEW
  // ══════════════════════════════════════════════════════════
  function _finish() {
    let score = 0;
    const detail = QUESTIONS.map((item, i) => {
      const ok = _answers[i] === item.a;
      if (ok) score++;
      return { q: i + 1, chosen: LETTERS[_answers[i]], correct: LETTERS[item.a], isCorrect: ok };
    });
    const result = {
      score: score,
      total: QUESTIONS.length,
      percent: Math.round((score / QUESTIONS.length) * 100),
      answers: detail,
      completedAt: new Date().toISOString()
    };
    _decorate(result);
    _save(result);       // saved first, so a refresh on the result screen loses nothing
    _showResult(result);
  }

  function _showResult(result) {
    _mode = 'result';
    _result = result;
    _canContinue = false;

    const tier = result.tier || tierOf(result);
    const copy = RESULT[tier];
    const panel = $('ryan-pretest-panel');
    const body = $('rpt-body');
    if (!panel || !body) return;

    panel.classList.remove('rpt-tier-perfect', 'rpt-tier-great', 'rpt-tier-ok', 'rpt-tier-low');
    panel.classList.add('rpt-result-mode', 'rpt-tier-' + tier);

    const fill = $('rpt-progress-fill');
    if (fill) fill.style.width = '100%';
    const sub = $('rpt-subtitle');
    if (sub) { sub.classList.remove('rpt-swap'); void sub.offsetWidth; sub.textContent = 'Pre-test complete. Here is your starting point.'; sub.classList.add('rpt-swap'); }

    body.innerHTML = '';
    body.classList.remove('rpt-enter');

    const wrap = _el('div', 'rpt-result');
    wrap.setAttribute('role', 'status');

    // badge: floating icon + score ring
    const badge = _el('div', 'rpt-badge');
    badge.appendChild(_el('div', 'rpt-badge-icon', copy.icon));
    const ringBox = _el('div', 'rpt-ring-box');
    ringBox.innerHTML =
      '<svg class="rpt-ring" viewBox="0 0 120 120" aria-hidden="true">' +
        '<circle class="rpt-ring-track" cx="60" cy="60" r="' + RING_R + '"/>' +
        '<circle class="rpt-ring-bar" id="rpt-ring-bar" cx="60" cy="60" r="' + RING_R + '" ' +
          'stroke-dasharray="' + RING_C.toFixed(2) + '" stroke-dashoffset="' + RING_C.toFixed(2) + '"/>' +
      '</svg>';
    const num = _el('div', 'rpt-ring-num');
    const big = _el('span', 'rpt-score-big', '0');
    big.id = 'rpt-score-num';
    num.appendChild(big);
    num.appendChild(_el('span', 'rpt-score-of', '/ ' + result.total));
    ringBox.appendChild(num);
    badge.appendChild(ringBox);
    for (let i = 0; i < 6; i++) {
      const s = _el('span', 'rpt-spark', '\u2726');
      s.style.setProperty('--a', (i * 60) + 'deg');
      s.style.setProperty('--d', (i * 0.18) + 's');
      badge.appendChild(s);
    }
    wrap.appendChild(badge);

    const rank = _el('div', 'rpt-rank', copy.rank);
    rank.style.setProperty('--s', '0.15s');
    wrap.appendChild(rank);

    const head = _el('h2', 'rpt-headline', copy.headline);
    head.style.setProperty('--s', '0.25s');
    wrap.appendChild(head);

    const stats = _el('div', 'rpt-stats');
    stats.style.setProperty('--s', '0.35s');
    [
      [String(result.score), 'Correct'],
      [String(result.total - result.score), 'To learn'],
      [result.percent + '%', 'Accuracy']
    ].forEach((s) => {
      const box = _el('div', 'rpt-stat');
      box.appendChild(_el('div', 'rpt-stat-val', s[0]));
      box.appendChild(_el('div', 'rpt-stat-lbl', s[1]));
      stats.appendChild(box);
    });
    wrap.appendChild(stats);

    const say = _el('div', 'rpt-ryan-say');
    say.style.setProperty('--s', '0.45s');
    say.appendChild(_el('span', 'rpt-ryan-say-name', 'Ryan'));
    say.appendChild(_el('span', 'rpt-ryan-say-text', copy.ryan));
    wrap.appendChild(say);



    const foot = _el('div', 'rpt-footer rpt-footer-result');
    const go = _el('button', 'rpt-next rpt-go', 'Continue with Ryan');
    go.type = 'button';
    go.id = 'rpt-continue';
    go.disabled = true;
    go.addEventListener('click', _complete);
    foot.appendChild(go);
    wrap.appendChild(foot);

    body.appendChild(wrap);
    panel.scrollTop = 0;

    _countUp(result, tier);
  }

  function _countUp(result, tier) {
    const numEl = $('rpt-score-num');
    const bar = $('rpt-ring-bar');
    const total = result.total || 1;
    const dur = _reduced() ? 0 : 1300;
    const delay = _reduced() ? 0 : 450;

    const setVal = (v) => {
      if (numEl) numEl.textContent = String(Math.round(v));
      if (bar) bar.style.strokeDashoffset = (RING_C * (1 - Math.min(v, total) / total)).toFixed(2);
    };

    if (dur === 0) {
      setVal(result.score);
      _celebrate(tier);
      return;
    }

    _later(() => {
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
          if (iv > 0 && now - lastTick > 55) { lastTick = now; _sfx('playResultTick', iv, result.score || 1); }
        }
        if (t < 1) { _raf = requestAnimationFrame(step); }
        else { _raf = 0; setVal(result.score); _celebrate(tier); }
      };
      _raf = requestAnimationFrame(step);
    }, delay);
  }

  function _celebrate(tier) {
    const panel = $('ryan-pretest-panel');
    if (panel) panel.classList.add('rpt-celebrate');
    const reduced = _reduced();

    if (tier === 'perfect') {
      _sfx('playPerfectFanfare');
      if (!reduced) {
        Confetti.burst();
        _later(() => { if (_running) Confetti.burst(); }, 650);
        _later(() => { if (_running) Confetti.rain(2600); }, 900);
      }
    } else if (tier === 'great') {
      _sfx('playResultGood');
    } else if (tier === 'ok') {
      _sfx('playResultGood');
    } else {
      _sfx('playResultEncourage');
    }

    _later(() => {
      _canContinue = true;
      const go = $('rpt-continue');
      if (go) { go.disabled = false; try { go.focus({ preventScroll: true }); } catch (e) { /* ignore */ } }
    }, reduced ? 0 : 700);
  }

  function _complete() {
    if (_mode !== 'result' || !_canContinue) return;
    const result = _result;
    const cb = _onDone;
    const wasPreview = _preview;
    _onDone = null;
    _running = false;
    _mode = 'question';
    _preview = false;
    _close(true);   // confetti still in the air fades out on its own
    const panel = $('ryan-pretest-panel');
    if (panel) panel.classList.remove('rpt-celebrate');
    if (typeof cb === 'function') {
      try { cb(result, { alreadyTaken: false, preview: wasPreview }); }
      catch (e) { console.error('[RyanPretest] onDone failed:', e); }
    }
  }

  function _open() {
    const bd = $('ryan-pretest-backdrop');
    bd.style.display = 'flex';
    void bd.offsetHeight;
    bd.classList.add('rpt-active');
    document.addEventListener('keydown', _onKey, true);
  }

  function _resetView() {
    const panel = $('ryan-pretest-panel');
    if (panel) panel.classList.remove('rpt-result-mode', 'rpt-celebrate', 'rpt-tier-perfect', 'rpt-tier-great', 'rpt-tier-ok', 'rpt-tier-low');
    const sub = $('rpt-subtitle');
    if (sub) { sub.classList.remove('rpt-swap'); sub.textContent = COACH[0]; }
  }

  /**
   * Show the 20-question pre-test. onDone(result, info) runs after the
   * player taps Continue on the result screen.
   * The pretest always runs — saved results from previous sessions are cleared.
   */
  function launch(onDone) {
    if (_running) return;

    // Always clear any previously saved result so the test always runs fresh.
    try {
      localStorage.removeItem(_playerKey());
    } catch (e) { /* storage blocked */ }
    if (typeof gameState !== 'undefined') {
      delete gameState.preTestCompleted;
      delete gameState.preTestScore;
      delete gameState.preTestTotal;
      delete gameState.preTestResult;
    }

    const bd = $('ryan-pretest-backdrop');
    if (!bd || !$('rpt-body')) {
      // markup missing: never block the simulation
      console.warn('[RyanPretest] markup not found, skipping pre-test');
      if (typeof onDone === 'function') onDone(null, { alreadyTaken: false });
      return;
    }

    _clearTimers();
    _index = 0;
    _answers = [];
    _mode = 'question';
    _result = null;
    _preview = false;
    _canContinue = false;
    _onDone = onDone || null;
    _running = true;

    _resetView();
    _render();
    _open();
    _sfx('playPretestStart');
  }

  /**
   * QA helper: jump straight to the result screen with a fake score.
   *   RyanPretest.preview(20)  -> perfect (confetti + fanfare)
   *   RyanPretest.preview(17)  -> great
   *   RyanPretest.preview(12)  -> ok
   *   RyanPretest.preview(5)   -> low (motivation note)
   * Nothing is saved.
   */
  function preview(score, onDone) {
    if (_running) return;
    const bd = $('ryan-pretest-backdrop');
    if (!bd || !$('rpt-body')) return;
    const total = QUESTIONS.length;
    const s = Math.max(0, Math.min(total, Math.round(Number(score) || 0)));
    const result = _decorate({
      score: s, total: total, percent: Math.round((s / total) * 100),
      answers: [], completedAt: new Date().toISOString()
    });
    _clearTimers();
    _onDone = onDone || null;
    _running = true;
    _preview = true;
    _resetView();
    _open();
    _showResult(result);
  }

  return { launch, getResult, reset, tierOf, preview, isRunning: () => _running, QUESTION_COUNT: QUESTIONS.length };
})();
