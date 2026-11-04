/**
 * Space Fighter — Arcade Space Combat Engine
 * Chapter 2 Desktop Game for CyberZero
 */

(function () {
  'use strict';

  // ═══════════════════════════════════════════════════════════════════
  // SOUND SYNTHESIZER (Low-latency Web Audio API)
  // ═══════════════════════════════════════════════════════════════════
  const SFX = {
    getGain() {
      if (typeof AudioManager !== 'undefined') {
        if (typeof AudioManager.getEffectiveSfxGain === 'function') {
          return AudioManager.getEffectiveSfxGain();
        }
      }
      return 0.65;
    },

    getContext() {
      if (typeof AudioManager !== 'undefined' && AudioManager.getContext) {
        return AudioManager.getContext();
      }
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      return AudioCtx ? new AudioCtx() : null;
    },

    laser() {
      const g = this.getGain();
      if (g <= 0.001) return;
      const ac = this.getContext();
      if (!ac) return;

      try {
        const now = ac.currentTime;
        const osc = ac.createOscillator();
        const gain = ac.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.12);

        gain.gain.setValueAtTime(0.22 * g, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        osc.connect(gain);
        gain.connect(ac.destination);

        osc.start(now);
        osc.stop(now + 0.13);
      } catch (e) {}
    },

    enemyLaser() {
      const g = this.getGain();
      if (g <= 0.001) return;
      const ac = this.getContext();
      if (!ac) return;

      try {
        const now = ac.currentTime;
        const osc = ac.createOscillator();
        const gain = ac.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(360, now);
        osc.frequency.exponentialRampToValueAtTime(90, now + 0.16);

        gain.gain.setValueAtTime(0.25 * g, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

        osc.connect(gain);
        gain.connect(ac.destination);

        osc.start(now);
        osc.stop(now + 0.17);
      } catch (e) {}
    },

    hit() {
      const g = this.getGain();
      if (g <= 0.001) return;
      const ac = this.getContext();
      if (!ac) return;

      try {
        const now = ac.currentTime;
        const osc = ac.createOscillator();
        const gain = ac.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.08);

        gain.gain.setValueAtTime(0.3 * g, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc.connect(gain);
        gain.connect(ac.destination);

        osc.start(now);
        osc.stop(now + 0.09);
      } catch (e) {}
    },

    explosion(isHeavy = false) {
      const g = this.getGain();
      if (g <= 0.001) return;
      const ac = this.getContext();
      if (!ac) return;

      try {
        const dur = isHeavy ? 0.45 : 0.28;
        const bufSize = Math.floor(ac.sampleRate * dur);
        const buffer = ac.createBuffer(1, bufSize, ac.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-3.5 * (i / bufSize));
        }

        const noise = ac.createBufferSource();
        noise.buffer = buffer;

        const filter = ac.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(isHeavy ? 420 : 680, ac.currentTime);
        filter.frequency.exponentialRampToValueAtTime(70, ac.currentTime + dur);

        const gain = ac.createGain();
        gain.gain.setValueAtTime((isHeavy ? 0.45 : 0.3) * g, ac.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + dur);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ac.destination);

        noise.start();
      } catch (e) {}
    },

    powerup() {
      const g = this.getGain();
      if (g <= 0.001) return;
      const ac = this.getContext();
      if (!ac) return;

      try {
        const notes = [440, 554, 659, 880];
        const now = ac.currentTime;
        notes.forEach((freq, idx) => {
          const osc = ac.createOscillator();
          const gain = ac.createGain();
          const t = now + idx * 0.06;

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, t);

          gain.gain.setValueAtTime(0.2 * g, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

          osc.connect(gain);
          gain.connect(ac.destination);

          osc.start(t);
          osc.stop(t + 0.11);
        });
      } catch (e) {}
    },

    bomb() {
      const g = this.getGain();
      if (g <= 0.001) return;
      const ac = this.getContext();
      if (!ac) return;

      try {
        const now = ac.currentTime;
        // Low rumble sine
        const osc = ac.createOscillator();
        const gain = ac.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(35, now + 0.6);

        gain.gain.setValueAtTime(0.48 * g, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

        osc.connect(gain);
        gain.connect(ac.destination);

        osc.start(now);
        osc.stop(now + 0.65);
        this.explosion(true);
      } catch (e) {}
    },

    waveClear() {
      const g = this.getGain();
      if (g <= 0.001) return;
      const ac = this.getContext();
      if (!ac) return;

      try {
        const notes = [523.25, 659.25, 783.99, 1046.5];
        const now = ac.currentTime;
        notes.forEach((freq, i) => {
          const osc = ac.createOscillator();
          const gain = ac.createGain();
          const t = now + i * 0.08;

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, t);

          gain.gain.setValueAtTime(0.25 * g, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

          osc.connect(gain);
          gain.connect(ac.destination);

          osc.start(t);
          osc.stop(t + 0.23);
        });
      } catch (e) {}
    },

    gameOver() {
      const g = this.getGain();
      if (g <= 0.001) return;
      const ac = this.getContext();
      if (!ac) return;

      try {
        const notes = [440, 415, 392, 349];
        const now = ac.currentTime;
        notes.forEach((freq, i) => {
          const osc = ac.createOscillator();
          const gain = ac.createGain();
          const t = now + i * 0.14;

          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, t);

          gain.gain.setValueAtTime(0.22 * g, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

          osc.connect(gain);
          gain.connect(ac.destination);

          osc.start(t);
          osc.stop(t + 0.26);
        });
      } catch (e) {}
    }
  };

  // ═══════════════════════════════════════════════════════════════════
  // SPACE FIGHTER GAME ENGINE
  // ═══════════════════════════════════════════════════════════════════
  let canvas = null;
  let ctx = null;
  let animFrameId = null;

  // Game state
  const state = {
    isRunning: false,
    isPaused: false,
    isGameOver: false,
    isLoading: true,
    score: 0,
    highScore: 0,
    wave: 1,
    waveEnemiesTarget: 8,
    waveEnemiesSpawned: 0,
    waveKills: 0,
    waveTransitionTimer: 0,
    lives: 3,
    bombs: 2,
    screenShake: 0,
    width: 800,
    height: 560
  };

  // Inputs
  const keys = {
    left: false,
    right: false,
    up: false,
    down: false,
    fire: false
  };

  // Game entities
  let player = null;
  let bullets = [];
  let enemyBullets = [];
  let asteroids = [];
  let enemies = [];
  let particles = [];
  let powerups = [];
  let stars = [];
  let shockwaves = [];
  let floatingTexts = [];

  // High score persistence
  try {
    const saved = localStorage.getItem('cyberzero_space_fighter_highscore');
    if (saved) state.highScore = parseInt(saved, 10) || 0;
  } catch (e) {}

  function saveHighScore() {
    if (state.score > state.highScore) {
      state.highScore = state.score;
      try {
        localStorage.setItem('cyberzero_space_fighter_highscore', String(state.highScore));
      } catch (e) {}
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // INITIALIZATION & LOADING SCREEN
  // ═══════════════════════════════════════════════════════════════════
  let loadingInterval = null;
  let loadingProgress = 0;

  function initSpaceFighterApp() {
    const win = document.getElementById('win-space-fighter');
    if (!win) return;

    canvas = document.getElementById('sf-canvas');
    if (canvas) {
      ctx = canvas.getContext('2d');
    }

    bindControlsOnce();
    resizeCanvas();

    // Protect desktop icons from accidental selection while SF is open
    const desktop = document.getElementById('desktop');
    if (desktop) desktop.classList.add('desktop-sf-active');

    // Chapter 2 Trojan Investigation hook
    if (typeof window.ch2OnSpaceFighterOpened === 'function') {
      window.ch2OnSpaceFighterOpened();
    }

    // Start realistic loading sequence every fresh open unless already playing
    if (!state.isRunning || state.isGameOver) {
      startLoadingSequence();
    }
  }

  function startLoadingSequence() {
    state.isLoading = true;
    loadingProgress = 0;

    const overlay = document.getElementById('sf-loading-overlay');
    const fill = document.getElementById('sf-load-fill');
    const pct = document.getElementById('sf-load-pct');
    const logs = document.getElementById('sf-load-logs');
    const btnLaunch = document.getElementById('sf-btn-launch');

    if (!overlay) return;

    overlay.classList.remove('fade-out', 'hidden');
    if (btnLaunch) {
      btnLaunch.disabled = true;
      btnLaunch.innerHTML = '<span>LAUNCH MISSION</span> <span>⏳</span>';
    }

    if (logs) {
      logs.innerHTML = '<div class="sf-terminal-line">[SYSTEM] Booting CyberZero Space Fighter Hypervisor...</div>';
    }

    const logSteps = [
      { at: 15, msg: '[00.12s] INITIALIZING QUANTUM DRIVE CORE... <span class="ok">[OK]</span>' },
      { at: 35, msg: '[00.45s] CALIBRATING DUAL PHOTON CANNONS... <span class="ok">[OK]</span>' },
      { at: 55, msg: '[00.78s] SYNCHRONIZING DEFLECTOR SHIELD MATRIX... <span class="ok">[OK]</span>' },
      { at: 75, msg: '[01.12s] SCANNING ASTEROID SECTOR ALPHA-9... <span class="warn">[CAUTION: DENSE FIELD]</span>' },
      { at: 90, msg: '[01.48s] HOSTILE ENEMY SQUADRONS DETECTED... <span class="alert">[RED ALERT]</span>' },
      { at: 100, msg: '[01.80s] SYSTEM ARMED. READY FOR COMBAT LAUNCH!' }
    ];

    let stepIndex = 0;
    if (loadingInterval) clearInterval(loadingInterval);

    loadingInterval = setInterval(() => {
      loadingProgress += Math.floor(Math.random() * 6) + 4;
      if (loadingProgress > 100) loadingProgress = 100;

      if (fill) fill.style.width = loadingProgress + '%';
      if (pct) pct.textContent = loadingProgress + '%';

      while (stepIndex < logSteps.length && loadingProgress >= logSteps[stepIndex].at) {
        if (logs) {
          const div = document.createElement('div');
          div.className = 'sf-terminal-line';
          div.innerHTML = logSteps[stepIndex].msg;
          logs.appendChild(div);
          logs.scrollTop = logs.scrollHeight;
        }
        stepIndex++;
      }

      if (loadingProgress >= 100) {
        clearInterval(loadingInterval);
        loadingInterval = null;
        if (btnLaunch) {
          btnLaunch.disabled = false;
          btnLaunch.innerHTML = '<span>LAUNCH MISSION</span> <span>🚀</span>';
        }
        // Auto-launch after brief delay
        setTimeout(() => {
          if (state.isLoading) launchGame();
        }, 450);
      }
    }, 55);
  }

  function launchGame() {
    if (loadingInterval) {
      clearInterval(loadingInterval);
      loadingInterval = null;
    }
    state.isLoading = false;

    const overlay = document.getElementById('sf-loading-overlay');
    if (overlay) {
      overlay.classList.add('fade-out');
      setTimeout(() => overlay.classList.add('hidden'), 400);
    }

    startNewGame();
  }

  // ═══════════════════════════════════════════════════════════════════
  // CONTROLS & EVENT BINDINGS
  // ═══════════════════════════════════════════════════════════════════
  let controlsBound = false;

  function bindControlsOnce() {
    if (controlsBound) return;
    controlsBound = true;

    // Window keyboard events
    window.addEventListener('keydown', e => {
      const win = document.getElementById('win-space-fighter');
      if (!win || win.classList.contains('hidden') || !win.classList.contains('focused')) {
        // Allow playing if the click was inside the space-fighter window
        if (!win || win.classList.contains('hidden')) return;
      }

      if (state.isLoading) {
        if (e.code === 'Space' || e.code === 'Enter') {
          e.preventDefault();
          launchGame();
        }
        return;
      }

      if (state.isGameOver) {
        if (e.code === 'KeyR' || e.code === 'Space' || e.code === 'Enter') {
          e.preventDefault();
          restartGame();
        }
        return;
      }

      switch (e.code) {
        case 'ArrowLeft':
        case 'KeyA':
          keys.left = true;
          e.preventDefault();
          break;
        case 'ArrowRight':
        case 'KeyD':
          keys.right = true;
          e.preventDefault();
          break;
        case 'ArrowUp':
        case 'KeyW':
          keys.up = true;
          e.preventDefault();
          break;
        case 'ArrowDown':
        case 'KeyS':
          keys.down = true;
          e.preventDefault();
          break;
        case 'Space':
          keys.fire = true;
          e.preventDefault();
          break;
        case 'KeyB':
        case 'KeyX':
          triggerBomb();
          e.preventDefault();
          break;
        case 'KeyP':
        case 'Escape':
          togglePause();
          e.preventDefault();
          break;
      }
    });

    window.addEventListener('keyup', e => {
      switch (e.code) {
        case 'ArrowLeft':
        case 'KeyA':
          keys.left = false;
          break;
        case 'ArrowRight':
        case 'KeyD':
          keys.right = false;
          break;
        case 'ArrowUp':
        case 'KeyW':
          keys.up = false;
          break;
        case 'ArrowDown':
        case 'KeyS':
          keys.down = false;
          break;
        case 'Space':
          keys.fire = false;
          break;
      }
    });

    // Mouse canvas shooting & steering + context-menu block
    if (canvas) {
      canvas.addEventListener('contextmenu', e => e.preventDefault());
      canvas.addEventListener('selectstart', e => e.preventDefault());
      canvas.addEventListener('dragstart', e => e.preventDefault());
      canvas.addEventListener('mousedown', e => {
        if (e.button === 0) {
          keys.fire = true;
        }
        if (e.button === 2) return; // ignore right-click
      });
      window.addEventListener('mouseup', () => {
        keys.fire = false;
      });

      canvas.addEventListener('mousemove', e => {
        if (!player || state.isPaused || state.isGameOver || state.isLoading) return;
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        // Smooth target steering towards mouse if mouse is moving
        player.targetX = mx;
        player.targetY = my;
      });
    }

    // Window resize — use ResizeObserver on the game area for accuracy
    window.addEventListener('resize', resizeCanvas);
    const area = document.getElementById('sf-game-area');
    if (area && typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(() => {
        requestAnimationFrame(resizeCanvas);
      });
      ro.observe(area);
    }
  }

  function resizeCanvas() {
    const area = document.getElementById('sf-game-area');
    if (!area || !canvas) return;

    const w = Math.max(400, area.offsetWidth || area.clientWidth || 800);
    const h = Math.max(300, area.offsetHeight || area.clientHeight || 560);

    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      state.width = w;
      state.height = h;
      initStars();
      if (player) {
        player.x = Math.min(player.x, w - 30);
        player.y = Math.min(player.y, h - 30);
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // ENTITIES & FACTORIES
  // ═══════════════════════════════════════════════════════════════════
  function initStars() {
    stars = [];
    const count = Math.floor((state.width * state.height) / 2800);
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * state.width,
        y: Math.random() * state.height,
        size: Math.random() * 2 + 0.6,
        speed: Math.random() * 1.8 + 0.4,
        brightness: Math.random() * 0.7 + 0.3
      });
    }
  }

  function createPlayer() {
    return {
      x: state.width / 2,
      y: state.height - 70,
      vx: 0,
      vy: 0,
      speed: 6.5,
      width: 38,
      height: 42,
      hp: 100,
      maxHp: 100,
      invulnerableTimer: 90, // invulnerable frames on spawn
      fireCooldown: 0,
      fireRate: 9, // frames between shots
      weaponType: 'standard', // 'standard' | 'triple' | 'plasma'
      weaponTimer: 0,
      targetX: null,
      targetY: null,
      tilt: 0
    };
  }

  function spawnAsteroid(size = 'large', x = null, y = null, vx = null, vy = null) {
    const isL = size === 'large';
    const isM = size === 'medium';
    const radius = isL ? 32 : isM ? 20 : 12;
    const hp = isL ? 3 : isM ? 2 : 1;

    // Generate irregular polygon vertices
    const vertexCount = 8;
    const points = [];
    for (let i = 0; i < vertexCount; i++) {
      const angle = (i / vertexCount) * Math.PI * 2;
      const r = radius * (0.8 + Math.random() * 0.4);
      points.push({ x: Math.cos(angle) * r, y: Math.sin(angle) * r });
    }

    asteroids.push({
      size,
      radius,
      hp,
      maxHp: hp,
      points,
      x: x !== null ? x : Math.random() * (state.width - 60) + 30,
      y: y !== null ? y : -radius - 10,
      vx: vx !== null ? vx : (Math.random() - 0.5) * 1.6,
      vy: vy !== null ? vy : Math.random() * 1.5 + 1.0 + (state.wave * 0.15),
      rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.04
    });
  }

  function spawnEnemy(type = 'scout') {
    const isBoss = type === 'boss';
    const isCruiser = type === 'cruiser';

    const enemy = {
      type,
      x: Math.random() * (state.width - 120) + 60,
      y: isBoss ? -100 : -50,
      targetY: isBoss ? 90 : Math.random() * 140 + 50,
      width: isBoss ? 90 : isCruiser ? 52 : 36,
      height: isBoss ? 64 : isCruiser ? 42 : 32,
      hp: isBoss ? (22 + state.wave * 6) : isCruiser ? 6 : 2,
      maxHp: isBoss ? (22 + state.wave * 6) : isCruiser ? 6 : 2,
      vx: (Math.random() > 0.5 ? 1 : -1) * (isBoss ? 1.2 : isCruiser ? 1.6 : 2.4),
      vy: 1.5,
      fireTimer: Math.floor(Math.random() * 40) + 30,
      fireInterval: isBoss ? 45 : isCruiser ? 75 : 85,
      phase: Math.random() * Math.PI * 2
    };

    enemies.push(enemy);
  }

  function spawnPowerup(x, y) {
    const rand = Math.random();
    let type = 'shield';
    if (rand < 0.35) type = 'triple';
    else if (rand < 0.6) type = 'shield';
    else if (rand < 0.8) type = 'bomb';
    else type = 'star';

    powerups.push({
      type,
      x,
      y,
      vy: 1.4,
      pulse: 0
    });
  }

  function createExplosion(x, y, count = 16, color = '#ff9900', isLarge = false) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * (isLarge ? 6.5 : 4.0) + 1.0;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: i % 3 === 0 ? '#ffffff' : i % 3 === 1 ? '#00f0ff' : color,
        size: Math.random() * (isLarge ? 5 : 3.5) + 1.5,
        alpha: 1,
        life: Math.floor(Math.random() * 20) + (isLarge ? 28 : 18)
      });
    }
  }

  function addFloatingText(x, y, text, color = '#ffffff') {
    floatingTexts.push({
      x,
      y,
      text,
      color,
      alpha: 1,
      vy: -1.2,
      life: 45
    });
  }

  // ═══════════════════════════════════════════════════════════════════
  // GAMEPLAY LIFECYCLE
  // ═══════════════════════════════════════════════════════════════════
  function startNewGame() {
    state.isRunning = true;
    state.isPaused = false;
    state.isGameOver = false;
    state.score = 0;
    state.wave = 1;
    state.waveEnemiesTarget = 10;
    state.waveEnemiesSpawned = 0;
    state.waveKills = 0;
    state.waveTransitionTimer = 0;
    state.lives = 3;
    state.bombs = 2;

    bullets = [];
    enemyBullets = [];
    asteroids = [];
    enemies = [];
    particles = [];
    powerups = [];
    shockwaves = [];
    floatingTexts = [];

    resizeCanvas();
    player = createPlayer();

    // Spawn initial asteroids
    for (let i = 0; i < 4; i++) {
      spawnAsteroid('large');
    }

    hideModals();
    updateHud();

    if (animFrameId) cancelAnimationFrame(animFrameId);
    animFrameId = requestAnimationFrame(gameLoop);
  }

  function restartGame() {
    hideModals();
    startNewGame();
  }

  function togglePause() {
    if (!state.isRunning || state.isGameOver || state.isLoading) return;
    state.isPaused = !state.isPaused;

    const modal = document.getElementById('sf-pause-modal');
    if (modal) {
      if (state.isPaused) {
        modal.classList.remove('hidden');
        const pScore = document.getElementById('sf-pause-score');
        if (pScore) pScore.textContent = state.score.toLocaleString();
      } else {
        modal.classList.add('hidden');
      }
    }
  }

  function resumeGame() {
    if (state.isPaused) {
      togglePause();
    }
  }

  function triggerBomb() {
    if (!player || state.isPaused || state.isGameOver || state.bombs <= 0) return;

    state.bombs--;
    SFX.bomb();
    state.screenShake = 18;

    // Create expanding shockwave
    shockwaves.push({
      x: player.x,
      y: player.y,
      radius: 10,
      maxRadius: Math.max(state.width, state.height) * 0.95,
      speed: 18,
      alpha: 1
    });

    // Wipe all enemy bullets
    enemyBullets = [];

    // Damage / destroy all asteroids
    asteroids.forEach(a => {
      createExplosion(a.x, a.y, 10, '#888888');
      state.score += 50;
    });
    asteroids = [];

    // Damage / destroy all enemies
    enemies.forEach(e => {
      e.hp -= 20;
      if (e.hp <= 0) {
        createExplosion(e.x, e.y, 24, '#ff0055', true);
        state.score += e.type === 'boss' ? 2500 : 400;
        state.waveKills++;
      } else {
        createExplosion(e.x, e.y, 8, '#ff9900');
      }
    });
    enemies = enemies.filter(e => e.hp > 0);

    saveHighScore();
    updateHud();
    addFloatingText(player.x, player.y - 30, '⚡ EMP DETONATED!', '#00f0ff');
  }

  function handlePlayerDeath() {
    state.lives--;
    SFX.explosion(true);
    state.screenShake = 22;
    createExplosion(player.x, player.y, 35, '#ff2200', true);

    if (state.lives <= 0) {
      gameOver();
    } else {
      // Respawn player
      player.x = state.width / 2;
      player.y = state.height - 70;
      player.vx = 0;
      player.vy = 0;
      player.hp = 100;
      player.weaponType = 'standard';
      player.weaponTimer = 0;
      player.invulnerableTimer = 110;
      addFloatingText(player.x, player.y - 20, 'RESPAWNING...', '#ffeb3b');
      updateHud();
    }
  }

  function gameOver() {
    state.isGameOver = true;
    state.isRunning = false;
    SFX.gameOver();
    saveHighScore();

    const modal = document.getElementById('sf-gameover-modal');
    const finalScore = document.getElementById('sf-final-score');
    const finalHigh = document.getElementById('sf-final-high');
    const finalWave = document.getElementById('sf-final-wave');
    const highBadge = document.getElementById('sf-high-badge');

    if (finalScore) finalScore.textContent = state.score.toLocaleString();
    if (finalHigh) finalHigh.textContent = state.highScore.toLocaleString();
    if (finalWave) finalWave.textContent = 'Sector ' + state.wave;

    if (highBadge) {
      if (state.score >= state.highScore && state.score > 0) {
        highBadge.style.display = 'inline-block';
      } else {
        highBadge.style.display = 'none';
      }
    }

    if (modal) modal.classList.remove('hidden');
    updateHud();
  }

  function hideModals() {
    const goModal = document.getElementById('sf-gameover-modal');
    const pModal = document.getElementById('sf-pause-modal');
    const hModal = document.getElementById('sf-help-modal');
    if (goModal) goModal.classList.add('hidden');
    if (pModal) pModal.classList.add('hidden');
    if (hModal) hModal.classList.add('hidden');
  }

  function showHelpModal() {
    const modal = document.getElementById('sf-help-modal');
    if (modal) modal.classList.remove('hidden');
  }

  function closeHelpModal() {
    const modal = document.getElementById('sf-help-modal');
    if (modal) modal.classList.add('hidden');
  }

  // ═══════════════════════════════════════════════════════════════════
  // WAVE PROGRESSION & SPAWNING
  // ═══════════════════════════════════════════════════════════════════
  function updateWaveSystem() {
    // If wave goal reached
    if (state.waveKills >= state.waveEnemiesTarget && enemies.length === 0 && asteroids.length <= 1) {
      if (state.waveTransitionTimer === 0) {
        state.waveTransitionTimer = 130;
        SFX.waveClear();
        state.score += state.wave * 1000;
        addFloatingText(state.width / 2, state.height / 2 - 40, `SECTOR ${state.wave} CLEARED! +${state.wave * 1000} PTS`, '#50fa7b');
        saveHighScore();
      }
    }

    if (state.waveTransitionTimer > 0) {
      state.waveTransitionTimer--;
      if (state.waveTransitionTimer === 1) {
        state.wave++;
        state.waveKills = 0;
        state.waveEnemiesSpawned = 0;
        state.waveEnemiesTarget = 8 + state.wave * 3;
        addFloatingText(state.width / 2, state.height / 2 - 40, `ENTERING SECTOR ${state.wave}!`, '#ffb74d');

        // Check if boss wave (every 3 waves)
        if (state.wave % 3 === 0) {
          spawnEnemy('boss');
        }
        updateHud();
      }
      return;
    }

    // Normal spawning cadence
    if (state.waveEnemiesSpawned < state.waveEnemiesTarget) {
      if (Math.random() < 0.02 + state.wave * 0.003 && enemies.length < 5) {
        state.waveEnemiesSpawned++;
        const spawnCruiser = state.wave >= 2 && Math.random() < 0.35;
        spawnEnemy(spawnCruiser ? 'cruiser' : 'scout');
      }
    }

    // Continuous asteroid hazard
    if (asteroids.length < 3 + Math.min(state.wave, 5) && Math.random() < 0.025) {
      spawnAsteroid('large');
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // UPDATE LOOP (60 FPS)
  // ═══════════════════════════════════════════════════════════════════
  function update() {
    if (state.isPaused || state.isGameOver || state.isLoading) return;

    // Stars background scrolling
    stars.forEach(s => {
      s.y += s.speed;
      if (s.y > state.height) {
        s.y = 0;
        s.x = Math.random() * state.width;
      }
    });

    // Screen shake decay
    if (state.screenShake > 0) {
      state.screenShake *= 0.9;
      if (state.screenShake < 0.4) state.screenShake = 0;
    }

    // Player update
    if (player) {
      // Movement acceleration
      let ax = 0;
      let ay = 0;

      if (keys.left) ax -= 1;
      if (keys.right) ax += 1;
      if (keys.up) ay -= 1;
      if (keys.down) ay += 1;

      // Mouse steering assistance
      if (player.targetX !== null && !keys.left && !keys.right) {
        const dx = player.targetX - player.x;
        if (Math.abs(dx) > 6) ax += Math.sign(dx) * 0.7;
      }
      if (player.targetY !== null && !keys.up && !keys.down) {
        const dy = player.targetY - player.y;
        if (Math.abs(dy) > 6) ay += Math.sign(dy) * 0.7;
      }

      const isMalwareLag = typeof window.ch2IsMalwareLagActive === 'function' && window.ch2IsMalwareLagActive();
      const accelScale = isMalwareLag ? 0.65 : 1.4;
      player.speed = isMalwareLag ? 3.2 : 6.5;
      player.fireRate = isMalwareLag ? 22 : 9;

      player.vx += ax * accelScale;
      player.vy += ay * accelScale;

      if (keys.left || keys.right || keys.up || keys.down || keys.fire) {
        if (typeof window.ch2OnSpaceFighterPlayed === 'function') {
          window.ch2OnSpaceFighterPlayed({ lagged: isMalwareLag });
        }
      }

      // Clamp velocity to max speed
      const spd = Math.hypot(player.vx, player.vy);
      if (spd > player.speed) {
        const scale = player.speed / spd;
        player.vx *= scale;
        player.vy *= scale;
      }

      // Friction (snappier deceleration)
      player.vx *= 0.84;
      player.vy *= 0.84;

      // Zero out tiny drift
      if (Math.abs(player.vx) < 0.05) player.vx = 0;
      if (Math.abs(player.vy) < 0.05) player.vy = 0;

      player.x += player.vx;
      player.y += player.vy;

      // Tilt based on horizontal velocity
      const targetTilt = (player.vx / player.speed) * 0.45;
      player.tilt += (targetTilt - player.tilt) * 0.18;

      // Clamping within bounds
      const pad = 24;
      if (player.x < pad) { player.x = pad; player.vx = 0; }
      if (player.x > state.width - pad) { player.x = state.width - pad; player.vx = 0; }
      if (player.y < pad + 30) { player.y = pad + 30; player.vy = 0; }
      if (player.y > state.height - pad) { player.y = state.height - pad; player.vy = 0; }

      // Invulnerability timer
      if (player.invulnerableTimer > 0) player.invulnerableTimer--;

      // Weapon buff timer
      if (player.weaponTimer > 0) {
        player.weaponTimer--;
        if (player.weaponTimer <= 0) {
          player.weaponType = 'standard';
          updateHud();
        }
      }

      // Thruster flame particles (only when moving)
      const isMoving = Math.abs(player.vx) > 0.2 || Math.abs(player.vy) > 0.2 || keys.fire;
      if (Math.random() < (isMoving ? 0.9 : 0.35)) {
        particles.push({
          x: player.x + (Math.random() - 0.5) * 8,
          y: player.y + 20,
          vx: (Math.random() - 0.5) * 1.2,
          vy: Math.random() * 3 + 2,
          color: Math.random() > 0.5 ? '#00f0ff' : '#ffaa00',
          size: Math.random() * 3 + 1.5,
          alpha: 1,
          life: 14
        });
      }

      // Firing
      if (player.fireCooldown > 0) player.fireCooldown--;

      if (keys.fire && player.fireCooldown <= 0) {
        player.fireCooldown = player.fireRate;
        SFX.laser();

        if (player.weaponType === 'triple') {
          // 3 spread shots
          bullets.push({ x: player.x, y: player.y - 18, vx: 0, vy: -12, color: '#00f0ff' });
          bullets.push({ x: player.x - 10, y: player.y - 14, vx: -2.8, vy: -11.5, color: '#50fa7b' });
          bullets.push({ x: player.x + 10, y: player.y - 14, vx: 2.8, vy: -11.5, color: '#50fa7b' });
        } else {
          // Standard twin blasters
          bullets.push({ x: player.x - 9, y: player.y - 16, vx: 0, vy: -12, color: '#00f0ff' });
          bullets.push({ x: player.x + 9, y: player.y - 16, vx: 0, vy: -12, color: '#00f0ff' });
        }
      }
    }

    // Player bullets update
    bullets.forEach(b => {
      b.x += b.vx;
      b.y += b.vy;
    });
    bullets = bullets.filter(b => b.y > -20 && b.x > -20 && b.x < state.width + 20);

    // Enemy bullets update
    enemyBullets.forEach(b => {
      b.x += b.vx;
      b.y += b.vy;

      // Collision with player
      if (player && player.invulnerableTimer <= 0) {
        const dist = Math.hypot(b.x - player.x, b.y - player.y);
        if (dist < 20) {
          b.hit = true;
          player.hp -= 15;
          SFX.hit();
          state.screenShake = 9;
          createExplosion(b.x, b.y, 8, '#ff5555');
          if (player.hp <= 0) {
            handlePlayerDeath();
          } else {
            updateHud();
          }
        }
      }
    });
    enemyBullets = enemyBullets.filter(b => !b.hit && b.y < state.height + 20 && b.x > -20 && b.x < state.width + 20);

    // Asteroids update & collision
    asteroids.forEach(a => {
      a.x += a.vx;
      a.y += a.vy;
      a.rot += a.rotSpeed;

      // Wrap horizontal bounds slightly
      if (a.x < -a.radius) a.x = state.width + a.radius;
      if (a.x > state.width + a.radius) a.x = -a.radius;

      // Bullet collision
      bullets.forEach(b => {
        if (!b.hit) {
          const dist = Math.hypot(b.x - a.x, b.y - a.y);
          if (dist < a.radius + 6) {
            b.hit = true;
            a.hp--;
            createExplosion(b.x, b.y, 5, '#cccccc');
            SFX.hit();

            if (a.hp <= 0) {
              a.destroyed = true;
              SFX.explosion(a.size === 'large');
              createExplosion(a.x, a.y, a.size === 'large' ? 18 : 10, '#888888');

              const pts = a.size === 'large' ? 50 : a.size === 'medium' ? 100 : 150;
              state.score += pts;
              addFloatingText(a.x, a.y, `+${pts}`, '#70f3ff');

              // Split asteroid
              if (a.size === 'large') {
                spawnAsteroid('medium', a.x - 12, a.y, -1.2, a.vy * 1.1);
                spawnAsteroid('medium', a.x + 12, a.y, 1.2, a.vy * 1.1);
              } else if (a.size === 'medium') {
                spawnAsteroid('small', a.x - 8, a.y, -1.8, a.vy * 1.2);
                spawnAsteroid('small', a.x + 8, a.y, 1.8, a.vy * 1.2);
              }

              // Powerup drop
              if (Math.random() < 0.2) spawnPowerup(a.x, a.y);
            }
          }
        }
      });

      // Player collision
      if (player && player.invulnerableTimer <= 0 && !a.destroyed) {
        const dist = Math.hypot(player.x - a.x, player.y - a.y);
        if (dist < a.radius + 16) {
          a.destroyed = true;
          player.hp -= a.radius > 25 ? 40 : 25;
          SFX.explosion(true);
          state.screenShake = 14;
          createExplosion(a.x, a.y, 15, '#ffaa00');

          if (player.hp <= 0) {
            handlePlayerDeath();
          } else {
            updateHud();
          }
        }
      }
    });
    asteroids = asteroids.filter(a => !a.destroyed && a.y < state.height + 60);

    // Filter out hit bullets
    bullets = bullets.filter(b => !b.hit);

    // Enemies update & AI
    enemies.forEach(e => {
      e.phase += 0.04;

      if (e.type === 'boss') {
        // Move towards targetY then hover and sweep
        if (e.y < e.targetY) e.y += e.vy;
        e.x += e.vx;
        if (e.x < 70 || e.x > state.width - 70) e.vx *= -1;

        // Boss firing pattern
        e.fireTimer--;
        if (e.fireTimer <= 0) {
          e.fireTimer = e.fireInterval;
          SFX.enemyLaser();
          // Triple aimed shot
          const angle = Math.atan2((player ? player.y : state.height) - e.y, (player ? player.x : e.x) - e.x);
          [-0.3, 0, 0.3].forEach(offset => {
            enemyBullets.push({
              x: e.x,
              y: e.y + 24,
              vx: Math.cos(angle + offset) * 5.2,
              vy: Math.sin(angle + offset) * 5.2,
              color: '#ff0055'
            });
          });
        }
      } else {
        // Scout / Cruiser AI
        if (e.y < e.targetY) {
          e.y += e.vy;
        } else {
          // Sweep side to side with slight drift down
          e.x += e.vx;
          e.y += Math.sin(e.phase) * 0.8 + 0.15;
          if (e.x < 30 || e.x > state.width - 30) e.vx *= -1;
        }

        // Firing logic
        e.fireTimer--;
        if (e.fireTimer <= 0) {
          e.fireTimer = e.fireInterval;
          SFX.enemyLaser();

          if (e.type === 'cruiser') {
            // Twin straight lasers
            enemyBullets.push({ x: e.x - 12, y: e.y + 16, vx: 0, vy: 5.5, color: '#ff3366' });
            enemyBullets.push({ x: e.x + 12, y: e.y + 16, vx: 0, vy: 5.5, color: '#ff3366' });
          } else {
            // Aimed single laser
            const targetX = player ? player.x : e.x;
            const targetY = player ? player.y : state.height;
            const angle = Math.atan2(targetY - e.y, targetX - e.x);
            enemyBullets.push({
              x: e.x,
              y: e.y + 12,
              vx: Math.cos(angle) * 5.0,
              vy: Math.sin(angle) * 5.0,
              color: '#ff5555'
            });
          }
        }
      }

      // Bullet hits on enemies
      bullets.forEach(b => {
        if (!b.hit) {
          const w = e.width / 2;
          const h = e.height / 2;
          if (b.x > e.x - w && b.x < e.x + w && b.y > e.y - h && b.y < e.y + h) {
            b.hit = true;
            e.hp--;
            SFX.hit();
            createExplosion(b.x, b.y, 6, '#ffff00');

            if (e.hp <= 0) {
              e.destroyed = true;
              state.waveKills++;
              const isBoss = e.type === 'boss';
              SFX.explosion(isBoss);
              createExplosion(e.x, e.y, isBoss ? 36 : 18, isBoss ? '#ff00aa' : '#ff4400', isBoss);

              const pts = isBoss ? 2500 : e.type === 'cruiser' ? 500 : 250;
              state.score += pts;
              addFloatingText(e.x, e.y, `+${pts}`, isBoss ? '#ffeb3b' : '#00f0ff');

              // Boss drops shield and bomb
              if (isBoss) {
                spawnPowerup(e.x - 20, e.y);
                spawnPowerup(e.x + 20, e.y);
              } else if (Math.random() < 0.28) {
                spawnPowerup(e.x, e.y);
              }
            }
          }
        }
      });

      // Enemy ramming player
      if (player && player.invulnerableTimer <= 0 && !e.destroyed) {
        const dist = Math.hypot(player.x - e.x, player.y - e.y);
        if (dist < (e.width / 2) + 16) {
          e.hp -= 5;
          player.hp -= 35;
          SFX.explosion(true);
          state.screenShake = 16;
          createExplosion(player.x, player.y, 16, '#ff5500');

          if (e.hp <= 0) {
            e.destroyed = true;
            state.waveKills++;
          }

          if (player.hp <= 0) {
            handlePlayerDeath();
          } else {
            updateHud();
          }
        }
      }
    });
    enemies = enemies.filter(e => !e.destroyed && e.y < state.height + 60);

    // Powerups update & pickup
    powerups.forEach(p => {
      p.y += p.vy;
      p.pulse += 0.08;

      if (player) {
        const dist = Math.hypot(player.x - p.x, player.y - p.y);
        if (dist < 26) {
          p.collected = true;
          SFX.powerup();

          if (p.type === 'triple') {
            player.weaponType = 'triple';
            player.weaponTimer = 60 * 12; // 12 seconds
            addFloatingText(player.x, player.y - 25, '⚡ TRIPLE CANNONS!', '#50fa7b');
          } else if (p.type === 'shield') {
            player.hp = Math.min(player.maxHp, player.hp + 35);
            addFloatingText(player.x, player.y - 25, '🛡️ SHIELD REPAIRED!', '#00f0ff');
          } else if (p.type === 'bomb') {
            state.bombs = Math.min(5, state.bombs + 1);
            addFloatingText(player.x, player.y - 25, '💣 +1 EMP BOMB!', '#ffaa00');
          } else if (p.type === 'star') {
            state.score += 500;
            addFloatingText(player.x, player.y - 25, '⭐ BONUS +500!', '#ffeb3b');
          }
          saveHighScore();
          updateHud();
        }
      }
    });
    powerups = powerups.filter(p => !p.collected && p.y < state.height + 30);

    // Shockwaves update
    shockwaves.forEach(sw => {
      sw.radius += sw.speed;
      sw.alpha = 1 - (sw.radius / sw.maxRadius);
    });
    shockwaves = shockwaves.filter(sw => sw.radius < sw.maxRadius);

    // Particles update
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
      p.alpha = Math.max(0, p.life / 25);
    });
    particles = particles.filter(p => p.life > 0);

    // Floating text update
    floatingTexts.forEach(ft => {
      ft.y += ft.vy;
      ft.life--;
      ft.alpha = Math.max(0, ft.life / 45);
    });
    floatingTexts = floatingTexts.filter(ft => ft.life > 0);

    // Wave spawning & progression
    updateWaveSystem();
  }

  // ═══════════════════════════════════════════════════════════════════
  // RENDER LOOP (HTML5 Canvas)
  // ═══════════════════════════════════════════════════════════════════
  function render() {
    if (!ctx) return;

    ctx.save();

    // Clear canvas
    ctx.clearRect(0, 0, state.width, state.height);

    // Screen shake offset
    if (state.screenShake > 0) {
      const sx = (Math.random() - 0.5) * state.screenShake * 1.5;
      const sy = (Math.random() - 0.5) * state.screenShake * 1.5;
      ctx.translate(sx, sy);
    }

    // 1. Draw Starfield
    stars.forEach(s => {
      ctx.fillStyle = `rgba(255, 255, 255, ${s.brightness})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fill();
    });

    // 2. Draw Shockwaves (EMP bomb effect)
    shockwaves.forEach(sw => {
      ctx.save();
      ctx.strokeStyle = `rgba(0, 240, 255, ${sw.alpha * 0.8})`;
      ctx.lineWidth = 4;
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    });

    // 3. Draw Powerups
    powerups.forEach(p => {
      ctx.save();
      ctx.translate(p.x, p.y);
      const scale = 1 + Math.sin(p.pulse) * 0.12;
      ctx.scale(scale, scale);

      // Outer glow circle
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.fillStyle = p.type === 'triple' ? 'rgba(80, 250, 123, 0.25)' :
                      p.type === 'shield' ? 'rgba(0, 229, 255, 0.25)' :
                      p.type === 'bomb' ? 'rgba(255, 170, 0, 0.25)' : 'rgba(255, 235, 59, 0.25)';
      ctx.fill();
      ctx.strokeStyle = p.type === 'triple' ? '#50fa7b' :
                        p.type === 'shield' ? '#00e5ff' :
                        p.type === 'bomb' ? '#ffaa00' : '#ffeb3b';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // Icon symbol
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const icon = p.type === 'triple' ? '⚡' : p.type === 'shield' ? '🛡️' : p.type === 'bomb' ? '💣' : '⭐';
      ctx.fillText(icon, 0, 1);
      ctx.restore();
    });

    // 4. Draw Asteroids
    asteroids.forEach(a => {
      ctx.save();
      ctx.translate(a.x, a.y);
      ctx.rotate(a.rot);

      ctx.fillStyle = '#222838';
      ctx.strokeStyle = '#5a6885';
      ctx.lineWidth = 2;

      ctx.beginPath();
      a.points.forEach((pt, idx) => {
        if (idx === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Crater details
      ctx.fillStyle = '#141926';
      ctx.beginPath();
      ctx.arc(-a.radius * 0.3, -a.radius * 0.2, a.radius * 0.22, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });

    // 5. Draw Enemies
    enemies.forEach(e => {
      ctx.save();
      ctx.translate(e.x, e.y);

      if (e.type === 'boss') {
        // Flagship Boss
        ctx.fillStyle = '#2d113d';
        ctx.strokeStyle = '#e040fb';
        ctx.lineWidth = 2.5;

        // Armored hull
        ctx.beginPath();
        ctx.moveTo(0, 32);
        ctx.lineTo(-44, -12);
        ctx.lineTo(-24, -30);
        ctx.lineTo(24, -30);
        ctx.lineTo(44, -12);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Glowing core
        ctx.fillStyle = '#00f0ff';
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.fill();

        // Boss Health Bar above ship
        ctx.shadowBlur = 0;
        const barW = 70;
        const barH = 5;
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(-barW / 2, -42, barW, barH);
        const hpPct = Math.max(0, e.hp / e.maxHp);
        ctx.fillStyle = '#e040fb';
        ctx.fillRect(-barW / 2, -42, barW * hpPct, barH);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(-barW / 2, -42, barW, barH);
      } else if (e.type === 'cruiser') {
        // Heavy Cruiser
        ctx.fillStyle = '#3a1c28';
        ctx.strokeStyle = '#ff3366';
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(0, 20);
        ctx.lineTo(-24, -6);
        ctx.lineTo(-14, -20);
        ctx.lineTo(14, -20);
        ctx.lineTo(24, -6);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Cockpit light
        ctx.fillStyle = '#ffb74d';
        ctx.beginPath();
        ctx.arc(0, -4, 4, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Scout Fighter
        ctx.fillStyle = '#421616';
        ctx.strokeStyle = '#ff4444';
        ctx.lineWidth = 1.8;

        ctx.beginPath();
        ctx.moveTo(0, 16);
        ctx.lineTo(-16, -14);
        ctx.lineTo(0, -6);
        ctx.lineTo(16, -14);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Red visor glow
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(0, 0, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    });

    // 6. Draw Player Ship
    if (player) {
      ctx.save();
      ctx.translate(player.x, player.y);
      ctx.rotate(player.tilt);

      // Flashing invulnerability aura
      if (player.invulnerableTimer > 0) {
        if (Math.floor(player.invulnerableTimer / 4) % 2 === 0) {
          ctx.strokeStyle = 'rgba(0, 240, 255, 0.7)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, 26, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // Ship Wings & Body
      ctx.fillStyle = '#0d223a';
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.moveTo(0, -22); // nose
      ctx.lineTo(18, 16); // right wingtip
      ctx.lineTo(12, 18);
      ctx.lineTo(5, 12);
      ctx.lineTo(0, 16); // center tail
      ctx.lineTo(-5, 12);
      ctx.lineTo(-12, 18);
      ctx.lineTo(-18, 16); // left wingtip
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Cockpit Canopy Glass
      ctx.fillStyle = '#70f3ff';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.ellipse(0, -4, 4, 9, 0, 0, Math.PI * 2);
      ctx.fill();

      // Wingtip pulse lights
      ctx.shadowBlur = 4;
      ctx.fillStyle = '#ffeb3b';
      ctx.beginPath();
      ctx.arc(17, 15, 2, 0, Math.PI * 2);
      ctx.arc(-17, 15, 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    // 7. Draw Player Bullets
    bullets.forEach(b => {
      ctx.save();
      ctx.fillStyle = b.color;
      ctx.shadowColor = b.color;
      ctx.shadowBlur = 8;
      ctx.fillRect(b.x - 2, b.y - 7, 4, 14);
      ctx.restore();
    });

    // 8. Draw Enemy Bullets
    enemyBullets.forEach(b => {
      ctx.save();
      ctx.fillStyle = b.color;
      ctx.shadowColor = b.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(b.x, b.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // 9. Draw Particles (Sparks & Debris)
    particles.forEach(p => {
      ctx.save();
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // 10. Draw Floating Combat Texts
    floatingTexts.forEach(ft => {
      ctx.save();
      ctx.globalAlpha = ft.alpha;
      ctx.fillStyle = ft.color;
      ctx.font = 'bold 13px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 6;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    });

    ctx.restore();
  }

  // ═══════════════════════════════════════════════════════════════════
  // MAIN GAME LOOP (requestAnimationFrame)
  // ═══════════════════════════════════════════════════════════════════
  let _sfLagTick = 0;
  function gameLoop() {
    const isLag = typeof window.ch2IsMalwareLagActive === 'function' && window.ch2IsMalwareLagActive();
    _sfLagTick++;
    if (isLag && (_sfLagTick % 2 === 0)) {
      if (state.isRunning) {
        animFrameId = requestAnimationFrame(gameLoop);
      }
      return;
    }
    update();
    render();
    if (state.isRunning) {
      animFrameId = requestAnimationFrame(gameLoop);
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // HUD UI UPDATER
  // ═══════════════════════════════════════════════════════════════════
  function updateHud() {
    const elHpBar = document.getElementById('sf-hud-hp-bar');
    const elHpVal = document.getElementById('sf-hud-hp-val');
    const elScore = document.getElementById('sf-hud-score');
    const elHigh = document.getElementById('sf-hud-high');
    const elWave = document.getElementById('sf-hud-wave');
    const elLives = document.getElementById('sf-hud-lives');
    const elBombs = document.getElementById('sf-hud-bombs');
    const elBuff = document.getElementById('sf-hud-buff');
    const btnBomb = document.getElementById('sf-btn-bomb');

    const hp = player ? Math.max(0, player.hp) : 0;
    if (elHpBar) {
      elHpBar.style.width = hp + '%';
      if (hp <= 30) elHpBar.classList.add('low');
      else elHpBar.classList.remove('low');
    }
    if (elHpVal) elHpVal.textContent = Math.round(hp) + '%';
    if (elScore) elScore.textContent = state.score.toLocaleString();
    if (elHigh) elHigh.textContent = state.highScore.toLocaleString();
    if (elWave) elWave.textContent = `SECTOR ${state.wave}`;

    if (elLives) {
      let livesHtml = '';
      for (let i = 0; i < 3; i++) {
        livesHtml += i < state.lives ? '❤️ ' : '🖤 ';
      }
      elLives.innerHTML = livesHtml;
    }

    if (elBombs) elBombs.textContent = `x${state.bombs}`;
    if (btnBomb) btnBomb.disabled = state.bombs <= 0;

    if (elBuff) {
      const isMalwareLag = typeof window.ch2IsMalwareLagActive === 'function' && window.ch2IsMalwareLagActive();
      if (isMalwareLag) {
        elBuff.style.display = 'inline-block';
        elBuff.textContent = '⚠️ CPU 92% | LAG DETECTED';
        elBuff.style.color = '#ff5555';
        elBuff.style.borderColor = 'rgba(255,85,85,0.5)';
        elBuff.style.background = 'rgba(255,85,85,0.2)';
      } else if (player && player.weaponType === 'triple' && player.weaponTimer > 0) {
        elBuff.style.display = 'inline-block';
        elBuff.textContent = `⚡ TRIPLE LASER: ${Math.ceil(player.weaponTimer / 60)}s`;
        elBuff.style.color = '#50fa7b';
        elBuff.style.borderColor = 'rgba(80, 250, 123, 0.4)';
        elBuff.style.background = 'rgba(80, 250, 123, 0.15)';
      } else {
        elBuff.style.display = 'none';
      }
    }
  }

  // Pause / mute when window is closed or minimized
  function stopGameOnWindowClose() {
    state.isPaused = true;
    if (animFrameId) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }
    // Restore desktop icon interaction
    const desktop = document.getElementById('desktop');
    if (desktop) desktop.classList.remove('desktop-sf-active');
  }

  // ═══════════════════════════════════════════════════════════════════
  // EXPORT TO GLOBAL SCOPE
  // ═══════════════════════════════════════════════════════════════════
  window.initSpaceFighterApp = initSpaceFighterApp;
  window.sfLaunchGame = launchGame;
  window.sfRestartGame = restartGame;
  window.sfTogglePause = togglePause;
  window.sfResumeGame = resumeGame;
  window.sfTriggerBomb = triggerBomb;
  window.sfShowHelp = showHelpModal;
  window.sfCloseHelp = closeHelpModal;
  window.sfStopGameOnClose = stopGameOnWindowClose;

})();

