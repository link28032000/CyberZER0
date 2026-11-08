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
    },

    bossAlarm() {
      const g = this.getGain();
      if (g <= 0.001) return;
      const ac = this.getContext();
      if (!ac) return;
      try {
        const now = ac.currentTime;
        [0, 0.22, 0.44].forEach(tOffset => {
          const osc = ac.createOscillator();
          const gain = ac.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(680, now + tOffset);
          osc.frequency.linearRampToValueAtTime(320, now + tOffset + 0.18);
          gain.gain.setValueAtTime(0.35 * g, now + tOffset);
          gain.gain.exponentialRampToValueAtTime(0.001, now + tOffset + 0.2);
          osc.connect(gain);
          gain.connect(ac.destination);
          osc.start(now + tOffset);
          osc.stop(now + tOffset + 0.21);
        });
      } catch (e) {}
    },

    bossDefeated() {
      const g = this.getGain();
      if (g <= 0.001) return;
      const ac = this.getContext();
      if (!ac) return;
      try {
        const now = ac.currentTime;
        const notes = [261.6, 329.6, 392.0, 523.25, 659.25, 783.99];
        notes.forEach((freq, idx) => {
          const osc = ac.createOscillator();
          const gain = ac.createGain();
          const t = now + idx * 0.07;
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, t);
          gain.gain.setValueAtTime(0.3 * g, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
          osc.connect(gain);
          gain.connect(ac.destination);
          osc.start(t);
          osc.stop(t + 0.36);
        });
        this.explosion(true);
      } catch (e) {}
    },

    lockdownWarning() {
      const g = this.getGain();
      if (g <= 0.001) return;
      const ac = this.getContext();
      if (!ac) return;
      try {
        const now = ac.currentTime;
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(45, now + 0.35);
        gain.gain.setValueAtTime(0.4 * g, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.connect(gain);
        gain.connect(ac.destination);
        osc.start(now);
        osc.stop(now + 0.36);
      } catch (e) {}
    },

    lockdownClear() {
      const g = this.getGain();
      if (g <= 0.001) return;
      const ac = this.getContext();
      if (!ac) return;
      try {
        const now = ac.currentTime;
        const notes = [587.33, 880, 1174.66];
        notes.forEach((freq, i) => {
          const osc = ac.createOscillator();
          const gain = ac.createGain();
          const t = now + i * 0.06;
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, t);
          gain.gain.setValueAtTime(0.25 * g, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
          osc.connect(gain);
          gain.connect(ac.destination);
          osc.start(t);
          osc.stop(t + 0.19);
        });
      } catch (e) {}
    }
  };

  // ═══════════════════════════════════════════════════════════════════
  // MALWARE BOSS BATTLE CONFIGURATION (CONFIGURABLE LEVEL PROGRESSION)
  // ═══════════════════════════════════════════════════════════════════
  const BOSS_CONFIG = {
    5: {
      id: 'worm',
      name: 'WORM-X',
      type: 'Computer Worm',
      icon: '🐛',
      desc: 'An enemy that replicates itself and spreads across the battlefield!',
      introSubtitle: 'BOSS BATTLE – LEVEL 5',
      hp: 85,
      color: '#00ff88',
      victoryMsg: 'Computer worms can replicate themselves and spread across networks. Keep your system updated and use security software to reduce the risk.'
    },
    10: {
      id: 'trojan',
      name: 'TROJAN-X',
      type: 'Trojan Horse',
      icon: '🐴',
      desc: 'Initially disguises itself as a harmless enemy before revealing its true hostile form!',
      introSubtitle: 'BOSS BATTLE – LEVEL 10',
      hp: 150,
      color: '#ffcc00',
      victoryMsg: 'Trojan horses pretend to be harmless files or software to deceive users into running them. Always verify downloads and avoid unofficial download sites.'
    },
    15: {
      id: 'virus',
      name: 'VIRUS-X',
      type: 'Computer Virus',
      icon: '🦠',
      desc: 'Infects other enemies, strengthening them and spreading its effects through contact!',
      introSubtitle: 'BOSS BATTLE – LEVEL 15',
      hp: 220,
      color: '#ff0055',
      victoryMsg: 'Computer viruses attach to clean files and spread from program to program when executed. Regular antivirus scans and real-time defense keep systems protected.'
    },
    20: {
      id: 'ransom',
      name: 'RANSOM-X',
      type: 'Ransomware',
      icon: '🔒',
      desc: 'Temporarily restricts your spaceship movement and demands survival under intense attacks!',
      introSubtitle: 'BOSS BATTLE – LEVEL 20',
      hp: 300,
      color: '#ff2222',
      victoryMsg: 'Ransomware encrypts valuable files and demands payment to restore access. Maintain regular offline and cloud backups so you can always recover your files without paying.'
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
    highestWave: 1,
    wave: 1,
    waveEnemiesTarget: 8,
    waveEnemiesSpawned: 0,
    waveKills: 0,
    waveTransitionTimer: 0,
    lives: 3,
    bombs: 2,
    screenShake: 0,
    width: 800,
    height: 560,
    // Boss system states
    bossActive: false,
    bossIntroActive: false,
    currentBoss: null,
    defeatedBosses: new Set()
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

  // Progression & High score persistence
  function loadProgress() {
    try {
      const saved = localStorage.getItem('cyberzero_space_fighter_progress');
      if (saved) {
        const data = JSON.parse(saved);
        if (data.highScore) state.highScore = data.highScore;
        if (data.highestWave) state.highestWave = data.highestWave;
        if (Array.isArray(data.defeatedBosses)) {
          state.defeatedBosses = new Set(data.defeatedBosses);
        }
      } else {
        const legacyHigh = localStorage.getItem('cyberzero_space_fighter_highscore');
        if (legacyHigh) state.highScore = parseInt(legacyHigh, 10) || 0;
      }
    } catch (e) {}
  }

  function saveProgress() {
    if (state.score > state.highScore) {
      state.highScore = state.score;
    }
    state.highestWave = Math.max(state.highestWave || 1, state.wave);
    try {
      const data = {
        highScore: state.highScore,
        highestWave: state.highestWave,
        defeatedBosses: Array.from(state.defeatedBosses || [])
      };
      localStorage.setItem('cyberzero_space_fighter_progress', JSON.stringify(data));
      localStorage.setItem('cyberzero_space_fighter_highscore', String(state.highScore));
    } catch (e) {}
  }

  function saveHighScore() {
    saveProgress();
  }

  loadProgress();

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

    // Always reset and show the loading screen on every fresh open.
    // Cancel any running game loop first so there's no stale animation frame.
    if (animFrameId) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }
    if (loadingInterval) {
      clearInterval(loadingInterval);
      loadingInterval = null;
    }
    state.isRunning = false;
    state.isGameOver = false;
    state.isPaused = false;
    // Reset all keys so held keys from before closing don't persist
    keys.left = false;
    keys.right = false;
    keys.up = false;
    keys.down = false;
    keys.fire = false;
    startLoadingSequence();
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
        // Scale mouse coords to canvas logical pixels (handles CSS scaling)
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        player.targetX = (e.clientX - rect.left) * scaleX;
        player.targetY = (e.clientY - rect.top)  * scaleY;
        player.mouseActive = true;
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
      mouseActive: false,
      tilt: 0,
      isLocked: false,
      lockTimer: 0
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

    // Ensure downward velocity is always positive to prevent asteroids moving up forever
    const safeVy = Math.abs(vy !== null ? vy : Math.random() * 1.5 + 1.0 + (state.wave * 0.12));

    asteroids.push({
      size,
      radius,
      hp,
      maxHp: hp,
      points,
      x: x !== null ? x : Math.random() * (state.width - 60) + 30,
      y: y !== null ? y : -radius - 10,
      vx: vx !== null ? vx : (Math.random() - 0.5) * 1.6,
      vy: safeVy,
      rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.04
    });
  }

  function spawnEnemy(type = 'scout', x = null, y = null) {
    if (type === 'worm_minion') {
      enemies.push({
        type: 'worm_minion',
        x: x !== null ? x : Math.random() * (state.width - 80) + 40,
        y: y !== null ? y : -30,
        targetY: Math.random() * 160 + 60,
        width: 24,
        height: 24,
        hp: 3,
        maxHp: 3,
        vx: (Math.random() > 0.5 ? 1 : -1) * 2.8,
        vy: 1.6,
        fireTimer: Math.floor(Math.random() * 40) + 35,
        fireInterval: 65,
        phase: Math.random() * Math.PI * 2
      });
      return;
    }

    if (type === 'trojan_minion') {
      enemies.push({
        type: 'trojan_minion',
        x: x !== null ? x : Math.random() * (state.width - 80) + 40,
        y: y !== null ? y : -35,
        targetY: Math.random() * 180 + 70,
        width: 28,
        height: 26,
        hp: 4,
        maxHp: 4,
        vx: (Math.random() > 0.5 ? 1 : -1) * 2.2,
        vy: 1.5,
        fireTimer: Math.floor(Math.random() * 35) + 30,
        fireInterval: 55,
        phase: Math.random() * Math.PI * 2
      });
      return;
    }

    if (type === 'virus_host') {
      enemies.push({
        type: 'virus_host',
        x: x !== null ? x : Math.random() * (state.width - 80) + 40,
        y: y !== null ? y : -35,
        targetY: Math.random() * 160 + 70,
        width: 32,
        height: 30,
        hp: 5,
        maxHp: 5,
        isInfected: true,
        vx: (Math.random() > 0.5 ? 1 : -1) * 2.4,
        vy: 1.4,
        fireTimer: Math.floor(Math.random() * 35) + 30,
        fireInterval: 60,
        phase: Math.random() * Math.PI * 2
      });
      return;
    }

    const isBoss = type === 'boss';
    const isCruiser = type === 'cruiser';

    const enemy = {
      type,
      x: x !== null ? x : Math.random() * (state.width - 120) + 60,
      y: isBoss ? -100 : (y !== null ? y : -50),
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

  function spawnMalwareBoss(level) {
    const cfg = BOSS_CONFIG[level] || BOSS_CONFIG[5];

    // Clear normal enemies and bullets for a clean boss arena
    enemies = [];
    enemyBullets = [];

    const boss = {
      isBoss: true,
      bossId: cfg.id,
      bossLevel: level,
      type: 'boss',
      name: cfg.name,
      malwareType: cfg.type,
      color: cfg.color,
      x: state.width / 2,
      y: -110,
      targetY: 90,
      width: cfg.id === 'ransom' ? 110 : cfg.id === 'virus' ? 95 : cfg.id === 'trojan' ? 100 : 90,
      height: cfg.id === 'ransom' ? 80 : cfg.id === 'virus' ? 95 : cfg.id === 'trojan' ? 70 : 60,
      hp: cfg.hp,
      maxHp: cfg.hp,
      vx: 2.0,
      vy: 1.4,
      fireTimer: 45,
      fireInterval: 50,
      phase: 0,
      // WORM-X
      segments: (cfg.id === 'worm') ? [
        { x: state.width / 2, y: -140 },
        { x: state.width / 2, y: -170 },
        { x: state.width / 2, y: -200 },
        { x: state.width / 2, y: -230 }
      ] : [],
      replicateTimer: 240,
      // TROJAN-X
      disguised: (cfg.id === 'trojan'),
      disguiseTimer: 210,
      dashTimer: 200,
      isDashing: false,
      dashTargetX: 0,
      dashTargetY: 0,
      summonTimer: 240,
      // VIRUS-X
      infectTimer: 160,
      radialTimer: 140,
      tendrilTarget: null,
      tendrilTimer: 0,
      // RANSOM-X
      lockdownTimer: 360,
      lockdownActive: false
    };

    state.currentBoss = boss;
    state.bossActive = true;
    enemies.push(boss);

    // Update Boss HUD
    const hudBar = document.getElementById('sf-boss-hud');
    const hudName = document.getElementById('sf-boss-hud-name');
    const hudType = document.getElementById('sf-boss-hud-type');
    const hudPct = document.getElementById('sf-boss-hud-pct');
    const hudFill = document.getElementById('sf-boss-hud-fill');

    if (hudName) hudName.textContent = cfg.name;
    if (hudType) hudType.textContent = `(${cfg.type.toUpperCase()})`;
    if (hudPct) hudPct.textContent = '100%';
    if (hudFill) {
      hudFill.style.width = '100%';
      hudFill.style.background = `linear-gradient(90deg, ${cfg.color}, #ff5500, #ffeb3b)`;
    }
    if (hudBar) hudBar.classList.remove('hidden');

    updateHud();
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
  // GAMEPLAY LIFECYCLE & MALWARE BOSS CONTROLLERS
  // ═══════════════════════════════════════════════════════════════════
  function startNewGame() {
    state.isRunning = true;
    state.isPaused = false;
    state.isGameOver = false;
    state.bossActive = false;
    state.bossIntroActive = false;
    state.currentBoss = null;
    state.defeatedBosses = new Set();
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

    // Reset controls
    keys.left = false;
    keys.right = false;
    keys.up = false;
    keys.down = false;
    keys.fire = false;

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
    if (!state.isRunning || state.isGameOver || state.isLoading || state.bossIntroActive) return;
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

  function showBossIntroduction(level) {
    state.bossIntroActive = true;
    state.isPaused = true;

    // Clear normal enemies and bullets
    enemies = [];
    enemyBullets = [];

    const cfg = BOSS_CONFIG[level] || BOSS_CONFIG[5];

    // Play warning alarm sound
    SFX.bossAlarm();

    // Populate boss intro modal
    const modal = document.getElementById('sf-boss-intro-modal');
    const nameEl = document.getElementById('sf-boss-intro-name');
    const typeEl = document.getElementById('sf-boss-intro-type');
    const descEl = document.getElementById('sf-boss-intro-desc');
    const subEl = document.getElementById('sf-boss-intro-sub');
    const iconEl = document.getElementById('sf-boss-intro-icon');

    if (nameEl) {
      nameEl.textContent = cfg.name;
      nameEl.style.color = cfg.color;
      nameEl.style.textShadow = `0 0 25px ${cfg.color}`;
    }
    if (typeEl) typeEl.textContent = `MALWARE TYPE: ${cfg.type.toUpperCase()}`;
    if (descEl) descEl.textContent = `"${cfg.desc}"`;
    if (subEl) subEl.textContent = cfg.introSubtitle;
    if (iconEl) iconEl.textContent = cfg.icon;

    if (modal) modal.classList.remove('hidden');
  }

  function startBossBattle() {
    const modal = document.getElementById('sf-boss-intro-modal');
    if (modal) modal.classList.add('hidden');

    state.bossIntroActive = false;
    spawnMalwareBoss(state.wave);

    addFloatingText(state.width / 2, state.height / 2 - 40, `BATTLE STARTED: ${BOSS_CONFIG[state.wave] ? BOSS_CONFIG[state.wave].name : 'BOSS'}!`, '#ff0055');

    state.isPaused = false;
    if (animFrameId) cancelAnimationFrame(animFrameId);
    animFrameId = requestAnimationFrame(gameLoop);
  }

  function onBossDefeated(boss) {
    boss.destroyed = true;
    state.bossActive = false;
    state.currentBoss = null;

    const level = boss.bossLevel || state.wave;
    const cfg = BOSS_CONFIG[level] || BOSS_CONFIG[5];

    // Sound and epic explosions
    SFX.bossDefeated();
    state.screenShake = 30;
    createExplosion(boss.x, boss.y, 50, boss.color || '#ff00aa', true);
    createExplosion(boss.x - 25, boss.y + 15, 30, '#ffeb3b', true);
    createExplosion(boss.x + 25, boss.y - 15, 30, '#00f0ff', true);

    const bonusPts = level * 1000 + 4000;
    state.score += bonusPts;
    addFloatingText(boss.x, boss.y, `🏆 ${boss.name} DESTROYED! +${bonusPts} PTS`, '#ffeb3b');

    // Boss drops guaranteed powerups
    spawnPowerup(boss.x - 25, boss.y);
    spawnPowerup(boss.x + 25, boss.y);

    // Clear enemy bullets and minions
    enemyBullets = [];
    enemies = enemies.filter(e => e !== boss && !e.type.includes('minion') && e.type !== 'virus_host');

    // Unlock player if locked by Ransomware
    if (player) {
      player.isLocked = false;
      player.lockTimer = 0;
    }

    // Hide HUD boss bar
    const bossHud = document.getElementById('sf-boss-hud');
    if (bossHud) bossHud.classList.add('hidden');

    saveProgress();
    updateHud();

    // Pause normal gameplay and show victory modal after short delay
    setTimeout(() => {
      showBossVictory(level);
    }, 700);
  }

  function showBossVictory(level) {
    state.isPaused = true;
    const cfg = BOSS_CONFIG[level] || BOSS_CONFIG[5];

    const modal = document.getElementById('sf-boss-victory-modal');
    const nameEl = document.getElementById('sf-boss-victory-name');
    const descEl = document.getElementById('sf-boss-victory-desc');
    const btnContinue = document.getElementById('sf-btn-continue-level');

    if (nameEl) nameEl.textContent = `${cfg.name} DESTROYED`;
    if (descEl) descEl.textContent = cfg.victoryMsg;
    if (btnContinue) btnContinue.textContent = `CONTINUE TO LEVEL ${level + 1} ➔`;

    if (modal) modal.classList.remove('hidden');
  }

  function continueAfterBoss() {
    const modal = document.getElementById('sf-boss-victory-modal');
    if (modal) modal.classList.add('hidden');

    // Mark boss defeated
    state.defeatedBosses.add(state.wave);
    saveProgress();

    // Reward player: heal + 1 EMP bomb
    if (player) {
      player.hp = Math.min(player.maxHp, player.hp + 50);
      player.isLocked = false;
      player.lockTimer = 0;
    }
    state.bombs = Math.min(5, state.bombs + 1);

    // Advance to next wave
    state.wave++;
    state.waveKills = 0;
    state.waveEnemiesSpawned = 0;
    state.waveEnemiesTarget = 8 + state.wave * 2;
    state.waveTransitionTimer = 0;

    addFloatingText(state.width / 2, state.height / 2 - 40, `ENTERING SECTOR ${state.wave}!`, '#ffb74d');

    updateHud();
    state.isPaused = false;
    if (animFrameId) cancelAnimationFrame(animFrameId);
    animFrameId = requestAnimationFrame(gameLoop);
  }

  function resumeGameOnWindowRestore() {
    if (!state.isRunning || state.isGameOver || state.isLoading) return;

    const pModal = document.getElementById('sf-pause-modal');
    const bIntroModal = document.getElementById('sf-boss-intro-modal');
    const bVicModal = document.getElementById('sf-boss-victory-modal');

    const isModalOpen = (pModal && !pModal.classList.contains('hidden')) ||
                        (bIntroModal && !bIntroModal.classList.contains('hidden')) ||
                        (bVicModal && !bVicModal.classList.contains('hidden'));

    if (!isModalOpen) {
      state.isPaused = false;
    }
    resizeCanvas();
    if (!animFrameId && state.isRunning) {
      animFrameId = requestAnimationFrame(gameLoop);
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
        if (e.isBoss) {
          onBossDefeated(e);
        } else {
          createExplosion(e.x, e.y, 24, '#ff0055', true);
          state.score += 400;
          state.waveKills++;
          e.destroyed = true;
        }
      } else {
        createExplosion(e.x, e.y, 8, '#ff9900');
        if (e.bossId === 'trojan' && e.disguised) {
          e.disguised = false;
        }
      }
    });
    enemies = enemies.filter(e => !e.destroyed && e.hp > 0);

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
      player.isLocked = false;
      player.lockTimer = 0;
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
    const bIntroModal = document.getElementById('sf-boss-intro-modal');
    const bVicModal = document.getElementById('sf-boss-victory-modal');
    const bossHud = document.getElementById('sf-boss-hud');

    if (goModal) goModal.classList.add('hidden');
    if (pModal) pModal.classList.add('hidden');
    if (hModal) hModal.classList.add('hidden');
    if (bIntroModal) bIntroModal.classList.add('hidden');
    if (bVicModal) bVicModal.classList.add('hidden');
    if (bossHud && !state.bossActive) bossHud.classList.add('hidden');
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
    // If boss intro or boss battle is active, halt normal wave progression and enemy spawning
    if (state.bossIntroActive || state.bossActive) return;

    // Check if this wave is a configured boss wave that has not yet been defeated
    const bossCfg = BOSS_CONFIG[state.wave];
    if (bossCfg && !state.defeatedBosses.has(state.wave)) {
      enemies = [];
      enemyBullets = [];
      showBossIntroduction(state.wave);
      return;
    }

    // Normal wave completion: all required enemies killed and no enemies left on screen
    // (Notice: fixed bug where asteroids.length <= 1 previously softlocked the game!)
    if (state.waveKills >= state.waveEnemiesTarget && enemies.length === 0) {
      if (state.waveTransitionTimer === 0) {
        state.waveTransitionTimer = 130;
        SFX.waveClear();
        state.score += state.wave * 1000;
        addFloatingText(state.width / 2, state.height / 2 - 40, `SECTOR ${state.wave} CLEARED! +${state.wave * 1000} PTS`, '#50fa7b');
        saveProgress();
      }
    }

    if (state.waveTransitionTimer > 0) {
      state.waveTransitionTimer--;
      if (state.waveTransitionTimer === 1) {
        state.wave++;
        state.waveKills = 0;
        state.waveEnemiesSpawned = 0;
        state.waveEnemiesTarget = 8 + state.wave * 2;
        addFloatingText(state.width / 2, state.height / 2 - 40, `ENTERING SECTOR ${state.wave}!`, '#ffb74d');

        // Check if next wave is a boss wave
        const nextBoss = BOSS_CONFIG[state.wave];
        if (nextBoss && !state.defeatedBosses.has(state.wave)) {
          showBossIntroduction(state.wave);
          updateHud();
          return;
        }

        updateHud();
      }
      return;
    }

    // Normal enemy spawning
    if (state.waveEnemiesSpawned < state.waveEnemiesTarget) {
      if (Math.random() < 0.022 + state.wave * 0.003 && enemies.length < 5) {
        state.waveEnemiesSpawned++;
        const spawnCruiser = state.wave >= 2 && Math.random() < 0.35;
        spawnEnemy(spawnCruiser ? 'cruiser' : 'scout');
      }
    }

    // Continuous asteroid hazard (capped at 4)
    if (asteroids.length < 3 + Math.min(state.wave, 4) && Math.random() < 0.02) {
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

      // Mouse steering — directly drive the ship toward the cursor.
      // Only apply when no keyboard key overrides that axis, so keyboard still works normally.
      if (player.targetX !== null) {
        const dx = player.targetX - player.x;
        const dy = player.targetY !== null ? player.targetY - player.y : 0;

        if (!keys.left && !keys.right) {
          if (Math.abs(dx) > 3) ax += Math.sign(dx) * Math.min(1, Math.abs(dx) / 60);
        }
        if (!keys.up && !keys.down) {
          if (Math.abs(dy) > 3) ay += Math.sign(dy) * Math.min(1, Math.abs(dy) / 60);
        }
      }

      const isMalwareLag = typeof window.ch2IsMalwareLagActive === 'function' && window.ch2IsMalwareLagActive();
      let accelScale = isMalwareLag ? 0.65 : 1.4;
      let maxSpd = isMalwareLag ? 3.2 : 6.5;

      if (player.isLocked) {
        maxSpd = 1.3; // 80% speed restriction during Ransomware lockdown
        accelScale *= 0.3;
      }
      player.speed = maxSpd;
      player.fireRate = isMalwareLag ? 22 : 9;

      player.vx += ax * accelScale;
      player.vy += ay * accelScale;

      if (keys.left || keys.right || keys.up || keys.down || keys.fire || player.mouseActive) {
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

      // Clamping within bounds and safety guard against NaN
      const pad = 24;
      if (isNaN(player.x) || !isFinite(player.x)) player.x = state.width / 2;
      if (isNaN(player.y) || !isFinite(player.y)) player.y = state.height - 70;
      if (isNaN(player.vx)) player.vx = 0;
      if (isNaN(player.vy)) player.vy = 0;

      if (player.x < pad) { player.x = pad; player.vx = 0; }
      if (player.x > state.width - pad) { player.x = state.width - pad; player.vx = 0; }
      if (player.y < pad + 30) { player.y = pad + 30; player.vy = 0; }
      if (player.y > state.height - pad) { player.y = state.height - pad; player.vy = 0; }

      // Ransomware simulated lockdown: restricts movement speed
      if (player.isLocked) {
        player.lockTimer--;
        player.speed = 1.3; // 80% speed restriction
        if (player.lockTimer <= 0) {
          player.isLocked = false;
          SFX.lockdownClear();
          addFloatingText(player.x, player.y - 30, '🔓 DECRYPTED! MOBILITY RESTORED!', '#50fa7b');
        }
      }

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

              // Split asteroid with guaranteed downward motion
              if (a.size === 'large') {
                spawnAsteroid('medium', a.x - 12, a.y, -1.2, Math.abs(a.vy * 1.1) + 0.3);
                spawnAsteroid('medium', a.x + 12, a.y, 1.2, Math.abs(a.vy * 1.1) + 0.3);
              } else if (a.size === 'medium') {
                spawnAsteroid('small', a.x - 8, a.y, -1.8, Math.abs(a.vy * 1.2) + 0.4);
                spawnAsteroid('small', a.x + 8, a.y, 1.8, Math.abs(a.vy * 1.2) + 0.4);
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

      if (e.isBoss) {
        // ── WORM-X (LEVEL 5 - COMPUTER WORM) ──
        if (e.bossId === 'worm') {
          e.x = (state.width / 2) + Math.sin(e.phase * 0.9) * (state.width * 0.38);
          e.y = e.targetY + Math.cos(e.phase * 1.6) * 22;

          // Trailing segments follow head
          if (e.segments && e.segments.length > 0) {
            let prevX = e.x;
            let prevY = e.y;
            e.segments.forEach((seg, i) => {
              const dx = prevX - seg.x;
              const dy = prevY - seg.y;
              seg.x += dx * 0.28;
              seg.y += dy * 0.28;
              prevX = seg.x;
              prevY = seg.y;
            });
          }

          // Replication: replicates into mini worm minions
          e.replicateTimer--;
          if (e.replicateTimer <= 0) {
            e.replicateTimer = 260;
            spawnEnemy('worm_minion', e.x + (Math.random() - 0.5) * 40, e.y + 25);
            addFloatingText(e.x, e.y + 20, '⚡ WORM REPLICATION!', '#00ff88');
            SFX.powerup();
          }

          // Firing: dual acid bolts
          e.fireTimer--;
          if (e.fireTimer <= 0) {
            e.fireTimer = e.fireInterval;
            SFX.enemyLaser();
            [-16, 16].forEach(offset => {
              enemyBullets.push({
                x: e.x + offset,
                y: e.y + 22,
                vx: (player ? (player.x - (e.x + offset)) * 0.015 : 0),
                vy: 5.2,
                color: '#00ff88'
              });
            });
          }
        }

        // ── TROJAN-X (LEVEL 10 - TROJAN HORSE) ──
        else if (e.bossId === 'trojan') {
          if (e.disguised) {
            // Disguised cargo/upgrade craft slowly descending
            if (e.y < 105) e.y += 0.7;
            e.x += Math.sin(e.phase * 0.8) * 1.2;
            e.disguiseTimer--;
            if (e.disguiseTimer <= 0 || e.hp < e.maxHp) {
              e.disguised = false;
              SFX.explosion(true);
              SFX.bossAlarm();
              state.screenShake = 18;
              createExplosion(e.x, e.y, 30, '#ffcc00', true);
              addFloatingText(e.x, e.y - 30, '⚠️ TROJAN DISGUISE SHATTERED!', '#ffcc00');
              // Summons initial backdoor drones
              spawnEnemy('trojan_minion', e.x - 40, e.y + 10);
              spawnEnemy('trojan_minion', e.x + 40, e.y + 10);
            }
          } else {
            // Revealed form: dash attack and summoning
            if (e.isDashing) {
              e.x += (e.dashTargetX - e.x) * 0.08;
              e.y += e.vy * 4;
              if (e.y > state.height - 120 || e.y < e.targetY - 10) {
                e.vy *= -1;
                if (e.y <= e.targetY) {
                  e.isDashing = false;
                  e.y = e.targetY;
                  e.vy = 1.2;
                }
              }
            } else {
              e.x += e.vx;
              if (e.x < 70 || e.x > state.width - 70) e.vx *= -1;
              if (e.y < e.targetY) e.y += e.vy;

              e.dashTimer--;
              if (e.dashTimer <= 0) {
                e.dashTimer = 280;
                e.isDashing = true;
                e.dashTargetX = player ? player.x : e.x;
                e.vy = 2.2;
                addFloatingText(e.x, e.y - 25, '⚡ SURPRISE DASH ATTACK!', '#ff3366');
              }
            }

            // Summon backdoor minions
            e.summonTimer--;
            if (e.summonTimer <= 0) {
              e.summonTimer = 320;
              spawnEnemy('trojan_minion', e.x + (Math.random() > 0.5 ? 40 : -40), e.y + 20);
              addFloatingText(e.x, e.y + 30, '👾 BACKDOOR PAYLOAD DEPLOYED!', '#fbbf24');
            }

            // Firing: spread cluster
            e.fireTimer--;
            if (e.fireTimer <= 0) {
              e.fireTimer = e.fireInterval;
              SFX.enemyLaser();
              const angle = Math.atan2((player ? player.y : state.height) - e.y, (player ? player.x : e.x) - e.x);
              [-0.25, 0, 0.25].forEach(offset => {
                enemyBullets.push({
                  x: e.x,
                  y: e.y + 24,
                  vx: Math.cos(angle + offset) * 5.4,
                  vy: Math.sin(angle + offset) * 5.4,
                  color: '#fbbf24'
                });
              });
            }
          }
        }

        // ── VIRUS-X (LEVEL 15 - COMPUTER VIRUS) ──
        else if (e.bossId === 'virus') {
          if (e.y < e.targetY) e.y += e.vy;
          e.x += e.vx;
          if (e.x < 80 || e.x > state.width - 80) e.vx *= -1;

          // Infection mechanic: infects other enemies and strengthens them
          e.infectTimer--;
          if (e.infectTimer <= 0) {
            e.infectTimer = 190;
            const target = enemies.find(en => !en.isBoss && !en.isInfected);
            if (target) {
              target.isInfected = true;
              target.hp = Math.min(target.hp * 2, 14);
              target.maxHp = target.hp;
              target.vx *= 1.4;
              e.tendrilTarget = target;
              e.tendrilTimer = 35;
              addFloatingText(target.x, target.y - 15, '☣️ ENEMY INFECTED (+50% SPD, 2x HP)!', '#ff0055');
              SFX.hit();
            } else if (enemies.filter(en => !en.isBoss).length < 2) {
              // Spawn a host cell and infect it
              spawnEnemy('virus_host', e.x + (Math.random() - 0.5) * 60, e.y + 35);
              addFloatingText(e.x, e.y + 30, '🦠 HOST CELL SPAWNED & INFECTED!', '#ff00aa');
            }
          }

          if (e.tendrilTimer > 0) e.tendrilTimer--;

          // Radial spore burst
          e.radialTimer--;
          if (e.radialTimer <= 0) {
            e.radialTimer = 150;
            SFX.enemyLaser();
            for (let i = 0; i < 8; i++) {
              const ang = (i / 8) * Math.PI * 2 + e.phase;
              enemyBullets.push({
                x: e.x,
                y: e.y,
                vx: Math.cos(ang) * 4.4,
                vy: Math.sin(ang) * 4.4,
                color: '#ff0055'
              });
            }
          }
        }

        // ── RANSOM-X (LEVEL 20 - RANSOMWARE) ──
        else if (e.bossId === 'ransom') {
          if (e.y < e.targetY) e.y += e.vy;
          e.x += e.vx;
          if (e.x < 90 || e.x > state.width - 90) e.vx *= -1;

          // Simulated Ransomware Lockdown on player
          e.lockdownTimer--;
          if (e.lockdownTimer <= 0) {
            e.lockdownTimer = 480; // every 8 seconds
            if (player) {
              player.isLocked = true;
              player.lockTimer = 240; // 4 seconds
              SFX.lockdownWarning();
              state.screenShake = 16;
              addFloatingText(player.x, player.y - 30, '🔒 RANSOMWARE SPEED LOCKDOWN!', '#ff0000');
            }
          }

          // Heavy cipher cannon
          e.fireTimer--;
          if (e.fireTimer <= 0) {
            e.fireTimer = e.fireInterval;
            SFX.enemyLaser();
            [-22, 22].forEach(offset => {
              enemyBullets.push({
                x: e.x + offset,
                y: e.y + 30,
                vx: (player ? (player.x - (e.x + offset)) * 0.016 : 0),
                vy: 5.6,
                color: '#ff2222'
              });
            });
          }
        }
      } else if (e.type === 'worm_minion' || e.type === 'trojan_minion' || e.type === 'virus_host' || e.isInfected) {
        // Minions and infected enemies movement
        if (e.y < e.targetY) e.y += e.vy;
        e.x += e.vx;
        if (e.x < 25 || e.x > state.width - 25) e.vx *= -1;

        e.fireTimer--;
        if (e.fireTimer <= 0) {
          e.fireTimer = e.fireInterval;
          SFX.enemyLaser();
          const targetX = player ? player.x : e.x;
          const targetY = player ? player.y : state.height;
          const angle = Math.atan2(targetY - e.y, targetX - e.x);
          const color = e.isInfected ? '#ff0055' : e.type === 'worm_minion' ? '#00ff88' : '#fbbf24';
          enemyBullets.push({
            x: e.x,
            y: e.y + 12,
            vx: Math.cos(angle) * 4.8,
            vy: Math.sin(angle) * 4.8,
            color
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
            if (e.isBoss) updateHud();

            if (e.bossId === 'trojan' && e.disguised) {
              e.disguised = false;
              createExplosion(e.x, e.y, 25, '#ffcc00', true);
              addFloatingText(e.x, e.y - 25, '⚠️ TROJAN DISGUISE BROKEN!', '#ffcc00');
            }

            if (e.hp <= 0) {
              if (e.isBoss) {
                onBossDefeated(e);
              } else {
                e.destroyed = true;
                state.waveKills++;
                SFX.explosion(false);
                createExplosion(e.x, e.y, 18, e.isInfected ? '#ff0055' : '#ff4400');

                const pts = e.type === 'cruiser' ? 500 : e.type === 'worm_minion' ? 300 : e.type === 'trojan_minion' ? 350 : 250;
                state.score += pts;
                addFloatingText(e.x, e.y, `+${pts}`, e.isInfected ? '#ff0055' : '#00f0ff');

                if (Math.random() < 0.28) {
                  spawnPowerup(e.x, e.y);
                }
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
            if (e.isBoss) {
              onBossDefeated(e);
            } else {
              e.destroyed = true;
              state.waveKills++;
            }
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

    // Memory limit safety clamps to prevent crashes
    if (particles.length > 100) particles = particles.slice(particles.length - 100);
    if (bullets.length > 40) bullets = bullets.slice(bullets.length - 40);
    if (enemyBullets.length > 60) enemyBullets = enemyBullets.slice(enemyBullets.length - 60);
    if (floatingTexts.length > 20) floatingTexts = floatingTexts.slice(floatingTexts.length - 20);

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

      // Infection Aura (if infected by VIRUS-X)
      if (e.isInfected) {
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 0, 85, 0.75)';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#ff0055';
        ctx.shadowBlur = 10;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(0, 0, (e.width || 36) * 0.65 + Math.sin(e.phase * 3) * 3, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      if (e.isBoss) {
        const hpPct = Math.max(0, e.hp / e.maxHp);

        // ════════════════════════════════════════
        // BOSS 1: WORM-X (LEVEL 5 - COMPUTER WORM)
        // ════════════════════════════════════════
        if (e.bossId === 'worm') {
          // 1. Draw Trailing Body Segments (connecting back to head)
          if (e.segments && e.segments.length > 0) {
            e.segments.forEach((seg, idx) => {
              const relX = seg.x - e.x;
              const relY = seg.y - e.y;
              const segR = Math.max(8, 20 - idx * 2.5);

              // Segment connection beam
              ctx.save();
              ctx.strokeStyle = 'rgba(0, 255, 136, 0.5)';
              ctx.lineWidth = 3;
              ctx.beginPath();
              ctx.moveTo(idx === 0 ? 0 : e.segments[idx - 1].x - e.x, idx === 0 ? 0 : e.segments[idx - 1].y - e.y);
              ctx.lineTo(relX, relY);
              ctx.stroke();

              // Segment chitinous armor shell
              ctx.fillStyle = idx % 2 === 0 ? '#052614' : '#08331b';
              ctx.strokeStyle = '#00ff88';
              ctx.lineWidth = 2;
              ctx.shadowColor = '#00ff88';
              ctx.shadowBlur = 8;
              ctx.beginPath();
              ctx.arc(relX, relY, segR, 0, Math.PI * 2);
              ctx.fill();
              ctx.stroke();

              // Segment core glowing node
              ctx.fillStyle = '#39ff14';
              ctx.beginPath();
              ctx.arc(relX, relY, segR * 0.45, 0, Math.PI * 2);
              ctx.fill();
              ctx.restore();
            });
          }

          // 2. Draw Worm-X Head
          ctx.save();
          ctx.fillStyle = '#0a3319';
          ctx.strokeStyle = '#00ff88';
          ctx.lineWidth = 2.5;
          ctx.shadowColor = '#00ff88';
          ctx.shadowBlur = 12;

          // Armored head carapace
          ctx.beginPath();
          ctx.moveTo(0, 34); // head snout
          ctx.lineTo(-32, 10);
          ctx.lineTo(-24, -26);
          ctx.lineTo(24, -26);
          ctx.lineTo(32, 10);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Acid Mandibles (predatory claws)
          ctx.strokeStyle = '#70ffb0';
          ctx.lineWidth = 3;
          ctx.beginPath();
          // Left mandible
          ctx.moveTo(-16, 20);
          ctx.quadraticCurveTo(-38, 38, -26, 48);
          ctx.lineTo(-18, 32);
          // Right mandible
          ctx.moveTo(16, 20);
          ctx.quadraticCurveTo(38, 38, 26, 48);
          ctx.lineTo(18, 32);
          ctx.stroke();

          // Compound cyber-eyes
          ctx.fillStyle = '#ff0055';
          ctx.shadowColor = '#ff0055';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(-14, 8, 4.5, 0, Math.PI * 2);
          ctx.arc(14, 8, 4.5, 0, Math.PI * 2);
          ctx.fill();

          // Antennae
          ctx.strokeStyle = '#00ff88';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(-14, -24);
          ctx.quadraticCurveTo(-28, -42, -38, -36);
          ctx.moveTo(14, -24);
          ctx.quadraticCurveTo(28, -42, 38, -36);
          ctx.stroke();
          ctx.restore();

          // Boss Tag
          ctx.font = 'bold 10px "JetBrains Mono", monospace';
          ctx.fillStyle = '#00ff88';
          ctx.textAlign = 'center';
          ctx.fillText('WORM-X [COMPUTER WORM]', 0, -44);
        }

        // ════════════════════════════════════════
        // BOSS 2: TROJAN-X (LEVEL 10 - TROJAN HORSE)
        // ════════════════════════════════════════
        else if (e.bossId === 'trojan') {
          if (e.disguised) {
            // DISGUISED FORM: Innocent supply craft
            ctx.save();
            ctx.fillStyle = '#0d2d4a';
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 2;
            ctx.shadowColor = '#38bdf8';
            ctx.shadowBlur = 8;

            // Sleek cargo shuttle
            ctx.beginPath();
            ctx.moveTo(0, 24);
            ctx.lineTo(-28, 4);
            ctx.lineTo(-18, -20);
            ctx.lineTo(18, -20);
            ctx.lineTo(28, 4);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Friendly cockpit
            ctx.fillStyle = '#38bdf8';
            ctx.beginPath();
            ctx.ellipse(0, 0, 7, 10, 0, 0, Math.PI * 2);
            ctx.fill();

            // Deceptive cargo box / gift symbol
            ctx.font = '14px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('📦', 0, 2);

            // Subtle glitch hint
            if (Math.random() < 0.15) {
              ctx.strokeStyle = '#ff3366';
              ctx.strokeRect(-22, -14, 44, 28);
            }
            ctx.restore();

            ctx.font = 'bold 9px "JetBrains Mono", monospace';
            ctx.fillStyle = '#38bdf8';
            ctx.textAlign = 'center';
            ctx.fillText('[SYSTEM_UPDATE.EXE]', 0, -32);
          } else {
            // REVEALED FORM: Menacing armored Trojan Dreadnought
            ctx.save();
            ctx.fillStyle = '#2b0c16';
            ctx.strokeStyle = '#fbbf24';
            ctx.lineWidth = 2.8;
            ctx.shadowColor = '#fbbf24';
            ctx.shadowBlur = 14;

            // Armored Warship Hull
            ctx.beginPath();
            ctx.moveTo(0, 36); // Ramming prow
            ctx.lineTo(-45, -6);
            ctx.lineTo(-35, -28);
            ctx.lineTo(-12, -22);
            ctx.lineTo(0, -30);
            ctx.lineTo(12, -22);
            ctx.lineTo(35, -28);
            ctx.lineTo(45, -6);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Trojan Horse War Crest (Armor crest in center)
            ctx.fillStyle = '#ff3366';
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(0, 22);
            ctx.lineTo(-14, 2);
            ctx.lineTo(0, -14);
            ctx.lineTo(14, 2);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Heavy Twin Flank Turrets
            ctx.fillStyle = '#fbbf24';
            ctx.fillRect(-42, 4, 8, 14);
            ctx.fillRect(34, 4, 8, 14);
            ctx.restore();

            ctx.font = 'bold 10px "JetBrains Mono", monospace';
            ctx.fillStyle = '#fbbf24';
            ctx.textAlign = 'center';
            ctx.fillText('TROJAN-X [TROJAN HORSE]', 0, -44);
          }
        }

        // ════════════════════════════════════════
        // BOSS 3: VIRUS-X (LEVEL 15 - COMPUTER VIRUS)
        // ════════════════════════════════════════
        else if (e.bossId === 'virus') {
          // 1. Draw Electric Contagion Beam to target
          if (e.tendrilTimer > 0 && e.tendrilTarget) {
            ctx.save();
            ctx.strokeStyle = '#ff0055';
            ctx.lineWidth = 3;
            ctx.shadowColor = '#ff0055';
            ctx.shadowBlur = 12;

            const tx = e.tendrilTarget.x - e.x;
            const ty = e.tendrilTarget.y - e.y;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            const midX = tx * 0.5 + (Math.random() - 0.5) * 20;
            const midY = ty * 0.5 + (Math.random() - 0.5) * 20;
            ctx.lineTo(midX, midY);
            ctx.lineTo(tx, ty);
            ctx.stroke();

            ctx.fillStyle = '#ff00aa';
            ctx.beginPath();
            ctx.arc(midX, midY, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }

          // 2. Viral Capsid & Radiating Spike Proteins
          ctx.save();
          ctx.fillStyle = '#330822';
          ctx.strokeStyle = '#ff0055';
          ctx.lineWidth = 2.6;
          ctx.shadowColor = '#ff0055';
          ctx.shadowBlur = 14;

          // Draw 10 Radiating Spike Proteins
          const spikeCount = 10;
          for (let i = 0; i < spikeCount; i++) {
            const ang = (i / spikeCount) * Math.PI * 2 + e.phase * 0.6;
            const spikeLen = 38 + Math.sin(e.phase * 2 + i) * 5;
            const sx = Math.cos(ang) * spikeLen;
            const sy = Math.sin(ang) * spikeLen;

            // Spike stalk
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(sx, sy);
            ctx.stroke();

            // Glycoprotein receptor knob
            ctx.fillStyle = '#ff00aa';
            ctx.beginPath();
            ctx.arc(sx, sy, 4.5, 0, Math.PI * 2);
            ctx.fill();
          }

          // Central Viral Capsid
          ctx.fillStyle = '#26061a';
          ctx.beginPath();
          ctx.arc(0, 0, 24, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Contaminated Genetic Core
          ctx.fillStyle = '#ff0055';
          ctx.shadowColor = '#ff0055';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(0, 0, 11, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          ctx.font = 'bold 10px "JetBrains Mono", monospace';
          ctx.fillStyle = '#ff0055';
          ctx.textAlign = 'center';
          ctx.fillText('VIRUS-X [COMPUTER VIRUS]', 0, -48);
        }

        // ════════════════════════════════════════
        // BOSS 4: RANSOM-X (LEVEL 20 - RANSOMWARE)
        // ════════════════════════════════════════
        else if (e.bossId === 'ransom') {
          ctx.save();
          ctx.fillStyle = '#1c0507';
          ctx.strokeStyle = '#ff2222';
          ctx.lineWidth = 3;
          ctx.shadowColor = '#ff2222';
          ctx.shadowBlur = 16;

          // Armored Fortress Hull
          ctx.beginPath();
          ctx.moveTo(0, 38);
          ctx.lineTo(-52, 10);
          ctx.lineTo(-44, -28);
          ctx.lineTo(-18, -22);
          ctx.lineTo(0, -34);
          ctx.lineTo(18, -22);
          ctx.lineTo(44, -28);
          ctx.lineTo(52, 10);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Symmetrical Cipher Shield Plates
          ctx.fillStyle = '#3a0c10';
          ctx.strokeStyle = '#ff5555';
          ctx.lineWidth = 1.5;
          ctx.fillRect(-38, -12, 18, 22);
          ctx.strokeRect(-38, -12, 18, 22);
          ctx.fillRect(20, -12, 18, 22);
          ctx.strokeRect(20, -12, 18, 22);

          // Central Padlock Core Emblem
          ctx.fillStyle = '#ff2222';
          ctx.shadowColor = '#ff0000';
          ctx.shadowBlur = 14;
          ctx.beginPath();
          ctx.arc(0, 2, 12, 0, Math.PI * 2);
          ctx.fill();

          ctx.font = '16px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🔒', 0, 2);

          // Heavy Cipher Cannon Barrels
          ctx.fillStyle = '#ff2222';
          ctx.fillRect(-26, 26, 6, 12);
          ctx.fillRect(20, 26, 6, 12);
          ctx.restore();

          ctx.font = 'bold 10px "JetBrains Mono", monospace';
          ctx.fillStyle = '#ff2222';
          ctx.textAlign = 'center';
          ctx.fillText('RANSOM-X [RANSOMWARE]', 0, -46);
        }

        // Generic fallback boss
        else {
          ctx.fillStyle = '#2d113d';
          ctx.strokeStyle = '#e040fb';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(0, 32);
          ctx.lineTo(-44, -12);
          ctx.lineTo(-24, -30);
          ctx.lineTo(24, -30);
          ctx.lineTo(44, -12);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }

        // On-Canvas Boss Health Bar
        const barW = 80;
        const barH = 6;
        ctx.fillStyle = 'rgba(0,0,0,0.75)';
        ctx.fillRect(-barW / 2, -34, barW, barH);
        ctx.fillStyle = e.color || '#ff0055';
        ctx.fillRect(-barW / 2, -34, barW * hpPct, barH);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(-barW / 2, -34, barW, barH);

      } else if (e.type === 'worm_minion') {
        // Worm Minion: small segmented neon crawler
        ctx.fillStyle = '#052614';
        ctx.strokeStyle = '#00ff88';
        ctx.lineWidth = 1.8;
        ctx.shadowColor = '#00ff88';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.ellipse(0, 0, 8, 14, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#39ff14';
        ctx.beginPath();
        ctx.arc(0, 6, 3, 0, Math.PI * 2);
        ctx.fill();

      } else if (e.type === 'trojan_minion') {
        // Trojan Minion: sharp angular gold backdoor drone
        ctx.fillStyle = '#261805';
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 1.8;
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.moveTo(0, 14);
        ctx.lineTo(-14, -10);
        ctx.lineTo(0, -4);
        ctx.lineTo(14, -10);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ff3366';
        ctx.beginPath();
        ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
        ctx.fill();

      } else if (e.type === 'virus_host') {
        // Virus Host: infected biological spore cell
        ctx.fillStyle = '#26061a';
        ctx.strokeStyle = '#ff0055';
        ctx.lineWidth = 1.8;
        ctx.shadowColor = '#ff0055';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(0, 0, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Mini spikes
        for (let i = 0; i < 6; i++) {
          const ang = (i / 6) * Math.PI * 2 + e.phase;
          ctx.beginPath();
          ctx.moveTo(Math.cos(ang) * 12, Math.sin(ang) * 12);
          ctx.lineTo(Math.cos(ang) * 18, Math.sin(ang) * 18);
          ctx.stroke();
        }

        ctx.fillStyle = '#ff00aa';
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fill();

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

      // Ransomware simulated lockdown: red containment padlock & restriction barrier
      if (player.isLocked && player.lockTimer > 0) {
        ctx.save();
        ctx.strokeStyle = '#ff2222';
        ctx.fillStyle = 'rgba(255, 34, 34, 0.18)';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#ff0000';
        ctx.shadowBlur = 12;

        const pulseR = 30 + Math.sin(Date.now() * 0.008) * 3;
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
          const ang = (i / 8) * Math.PI * 2;
          const px = Math.cos(ang) * pulseR;
          const py = Math.sin(ang) * pulseR;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🔒', 0, -2);

        ctx.font = 'bold 11px "JetBrains Mono", monospace';
        ctx.fillStyle = '#ff4444';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 5;
        const lockSecs = (player.lockTimer / 60).toFixed(1);
        ctx.fillText(`LOCKED: ${lockSecs}s`, 0, -36);
        ctx.restore();
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
    if (_sfLagTick % 4 === 0) {
      updateHud();
    }
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

    // Boss Health Bar HUD
    const hudBar = document.getElementById('sf-boss-hud');
    const hudPct = document.getElementById('sf-boss-hud-pct');
    const hudFill = document.getElementById('sf-boss-hud-fill');
    if (state.bossActive && state.currentBoss && !state.currentBoss.destroyed) {
      if (hudBar) hudBar.classList.remove('hidden');
      const bPct = Math.max(0, Math.min(100, (state.currentBoss.hp / state.currentBoss.maxHp) * 100));
      if (hudPct) hudPct.textContent = `${Math.ceil(bPct)}%`;
      if (hudFill) hudFill.style.width = `${bPct}%`;
    } else {
      if (hudBar && !state.bossIntroActive) hudBar.classList.add('hidden');
    }

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
      } else if (player && player.isLocked && player.lockTimer > 0) {
        elBuff.style.display = 'inline-block';
        elBuff.textContent = `🔒 RANSOMWARE LOCKDOWN: ${Math.ceil(player.lockTimer / 60)}s`;
        elBuff.style.color = '#ff4444';
        elBuff.style.borderColor = 'rgba(255, 68, 68, 0.6)';
        elBuff.style.background = 'rgba(255, 68, 68, 0.2)';
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
  window.sfResumeGameOnRestore = resumeGameOnWindowRestore;
  window.sfStartBossBattle = startBossBattle;
  window.sfContinueAfterBoss = continueAfterBoss;

})();

