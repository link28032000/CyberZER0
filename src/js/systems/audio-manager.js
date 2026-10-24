'use strict';


// ═══════════════════════════════════════════════════════════
// AUDIO ENGINE (Web Audio API Synthesizer & Sound System)
// ═══════════════════════════════════════════════════════════

const AudioManager = (() => {
  let ctx = null;

  // Settings with defaults
  const settings = {
    masterVolume: 80,
    clicksVolume: 85,
    sfxVolume: 80,
    typingVolume: 75,
    masterMuted: false,
    clicksMuted: false,
    sfxMuted: false,
    typingMuted: false
  };

  // Load persisted settings
  try {
    const saved = localStorage.getItem('cyberzero_audio_settings');
    if (saved) {
      Object.assign(settings, JSON.parse(saved));
    }
  } catch (e) {
    console.warn('Audio settings localStorage access failed:', e);
  }

  function saveSettings() {
    try {
      localStorage.setItem('cyberzero_audio_settings', JSON.stringify(settings));
    } catch (e) {}
  }

  function getContext() {
    if (!ctx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        ctx = new AudioContextClass();
      }
    }
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    return ctx;
  }

  function unlock() {
    getContext();
  }

  function getEffectiveClickGain() {
    if (settings.masterMuted || settings.clicksMuted) return 0;
    return (settings.masterVolume / 100) * (settings.clicksVolume / 100);
  }

  function getEffectiveSfxGain() {
    if (settings.masterMuted || settings.sfxMuted) return 0;
    return (settings.masterVolume / 100) * (settings.sfxVolume / 100);
  }

  function getEffectiveTypingGain() {
    if (settings.masterMuted || settings.typingMuted) return 0;
    return (settings.masterVolume / 100) * (settings.typingVolume / 100);
  }

  // Realistic mechanical mouse click sound
  function playMouseClick() {
    const effGain = getEffectiveClickGain();
    if (effGain <= 0.001) return;
    const ac = getContext();
    if (!ac) return;

    try {
      const now = ac.currentTime;
      // Slight pitch variance for natural organic feel
      const pitchVariance = 0.96 + Math.random() * 0.08;

      // 1. High transient snap (contact click)
      const osc = ac.createOscillator();
      const oscGain = ac.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(2600 * pitchVariance, now);
      osc.frequency.exponentialRampToValueAtTime(320 * pitchVariance, now + 0.009);

      oscGain.gain.setValueAtTime(0.38 * effGain, now);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.011);

      const highpass = ac.createBiquadFilter();
      highpass.type = 'highpass';
      highpass.frequency.setValueAtTime(1400, now);

      osc.connect(highpass);
      highpass.connect(oscGain);
      oscGain.connect(ac.destination);

      osc.start(now);
      osc.stop(now + 0.012);

      // 2. Plastic casing resonant body "thump"
      const bodyOsc = ac.createOscillator();
      const bodyGain = ac.createGain();
      bodyOsc.type = 'sine';
      bodyOsc.frequency.setValueAtTime(190 * pitchVariance, now);
      bodyOsc.frequency.exponentialRampToValueAtTime(65 * pitchVariance, now + 0.018);

      bodyGain.gain.setValueAtTime(0.2 * effGain, now);
      bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.02);

      bodyOsc.connect(bodyGain);
      bodyGain.connect(ac.destination);

      bodyOsc.start(now);
      bodyOsc.stop(now + 0.021);

      // 3. Crisp white noise micro-impulse
      const bufferSize = Math.floor(ac.sampleRate * 0.005);
      const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }
      const noise = ac.createBufferSource();
      noise.buffer = buffer;

      const noiseFilter = ac.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(3400, now);
      noiseFilter.Q.setValueAtTime(2.2, now);

      const noiseGain = ac.createGain();
      noiseGain.gain.setValueAtTime(0.24 * effGain, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.006);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(ac.destination);

      noise.start(now);
      noise.stop(now + 0.007);
    } catch (err) {}
  }

  // Brief slider tick
  function playSliderTick() {
    const effGain = getEffectiveClickGain();
    if (effGain <= 0.001) return;
    const ac = getContext();
    if (!ac) return;

    try {
      const now = ac.currentTime;
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1600, now);
      gain.gain.setValueAtTime(0.08 * effGain, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.006);
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.start(now);
      osc.stop(now + 0.007);
    } catch (e) {}
  }

  // Window Open/Close Cyber Swoosh
  function playWindowSound(isOpen) {
    const effGain = getEffectiveSfxGain();
    if (effGain <= 0.001) return;
    const ac = getContext();
    if (!ac) return;

    try {
      const now = ac.currentTime;
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = 'sine';

      if (isOpen) {
        osc.frequency.setValueAtTime(240, now);
        osc.frequency.exponentialRampToValueAtTime(640, now + 0.12);
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.18 * effGain, now + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.13);
      } else {
        osc.frequency.setValueAtTime(540, now);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.1);
        gain.gain.setValueAtTime(0.15 * effGain, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.11);
      }

      osc.connect(gain);
      gain.connect(ac.destination);
      osc.start(now);
      osc.stop(now + 0.14);
    } catch (e) {}
  }

  // Flag Chirp / Radar Ping
  function playFlagChirp() {
    const effGain = getEffectiveSfxGain();
    if (effGain <= 0.001) return;
    const ac = getContext();
    if (!ac) return;

    try {
      const now = ac.currentTime;
      [880, 1320].forEach((freq, idx) => {
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.04);
        gain.gain.setValueAtTime(0.18 * effGain, now + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.04 + 0.08);
        osc.connect(gain);
        gain.connect(ac.destination);
        osc.start(now + idx * 0.04);
        osc.stop(now + idx * 0.04 + 0.09);
      });
    } catch (e) {}
  }

  // Toast / System Notification Chime
  function playNotification() {
    const effGain = getEffectiveSfxGain();
    if (effGain <= 0.001) return;
    const ac = getContext();
    if (!ac) return;

    try {
      const now = ac.currentTime;
      [587.33, 880].forEach((freq, idx) => {
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);
        gain.gain.setValueAtTime(0.15 * effGain, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.06 + 0.16);
        osc.connect(gain);
        gain.connect(ac.destination);
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.18);
      });
    } catch (e) {}
  }

  // Cyber Victory / Pass Chime
  function playChime(isPositive = true) {
    const effGain = getEffectiveSfxGain();
    if (effGain <= 0.001) return;
    const ac = getContext();
    if (!ac) return;

    try {
      const now = ac.currentTime;
      const notes = isPositive ? [523.25, 659.25, 783.99, 1046.50] : [587.33, 440];
      notes.forEach((freq, idx) => {
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);
        gain.gain.setValueAtTime(0.18 * effGain, now + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.07 + 0.22);
        osc.connect(gain);
        gain.connect(ac.destination);
        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.24);
      });
    } catch (e) {}
  }

  // Warning / Wrong Verdict Alert Sound
  function playAlert() {
    const effGain = getEffectiveSfxGain();
    if (effGain <= 0.001) return;
    const ac = getContext();
    if (!ac) return;

    try {
      const now = ac.currentTime;
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(130, now + 0.16);

      const filter = ac.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(550, now);

      gain.gain.setValueAtTime(0.16 * effGain, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ac.destination);

      osc.start(now);
      osc.stop(now + 0.19);
    } catch (e) {}
  }

  // Keyboard / input field typing sound — mechanical clatter
  function playTypingKey() {
    const effGain = getEffectiveTypingGain();
    if (effGain <= 0.001) return;
    const ac = getContext();
    if (!ac) return;
    try {
      const now = ac.currentTime;
      // Randomise pitch slightly so rapid typing sounds natural
      const pitchVar = 0.90 + Math.random() * 0.22;

      // Sharp high-click transient
      const osc = ac.createOscillator();
      const oscGain = ac.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(3200 * pitchVar, now);
      osc.frequency.exponentialRampToValueAtTime(480 * pitchVar, now + 0.007);
      oscGain.gain.setValueAtTime(0.22 * effGain, now);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.009);
      const hp = ac.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.setValueAtTime(1800, now);
      osc.connect(hp); hp.connect(oscGain); oscGain.connect(ac.destination);
      osc.start(now); osc.stop(now + 0.01);

      // Soft body thud
      const body = ac.createOscillator();
      const bodyGain = ac.createGain();
      body.type = 'sine';
      body.frequency.setValueAtTime(160 * pitchVar, now);
      body.frequency.exponentialRampToValueAtTime(55 * pitchVar, now + 0.014);
      bodyGain.gain.setValueAtTime(0.12 * effGain, now);
      bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.015);
      body.connect(bodyGain); bodyGain.connect(ac.destination);
      body.start(now); body.stop(now + 0.016);
    } catch (e) {}
  }

  // Narrator / typewriter text animation sound — soft electronic taptap
  function playNarratorTyping() {
    const effGain = getEffectiveTypingGain();
    if (effGain <= 0.001) return;
    const ac = getContext();
    if (!ac) return;
    try {
      const now = ac.currentTime;
      const pitchVar = 0.92 + Math.random() * 0.18;

      // Soft sine blip — like an old terminal cursor blink
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(900 * pitchVar, now);
      osc.frequency.exponentialRampToValueAtTime(560 * pitchVar, now + 0.008);
      gain.gain.setValueAtTime(0.07 * effGain, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.01);
      osc.connect(gain); gain.connect(ac.destination);
      osc.start(now); osc.stop(now + 0.011);
    } catch (e) {}
  }

  // Correct Answer / Verdict Sound — Uplifting Cyber Chime
  function playCorrect() {
    const effGain = getEffectiveSfxGain();
    if (effGain <= 0.001) return;
    const ac = getContext();
    if (!ac) return;

    try {
      const now = ac.currentTime;
      // Dual-oscillator chime: G5 (783.99Hz) -> C6 (1046.50Hz) -> E6 (1318.51Hz)
      const notes = [
        { freq: 783.99, delay: 0.0, duration: 0.25 },
        { freq: 1046.50, delay: 0.08, duration: 0.35 },
        { freq: 1318.51, delay: 0.16, duration: 0.50 }
      ];

      notes.forEach(note => {
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note.freq, now + note.delay);

        gain.gain.setValueAtTime(0.22 * effGain, now + note.delay);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + note.delay + note.duration);

        osc.connect(gain);
        gain.connect(ac.destination);
        osc.start(now + note.delay);
        osc.stop(now + note.delay + note.duration + 0.02);
      });
    } catch (e) {}
  }

  // Wrong Answer / Verdict Sound — Harsh Error Buzz
  function playWrong() {
    const effGain = getEffectiveSfxGain();
    if (effGain <= 0.001) return;
    const ac = getContext();
    if (!ac) return;

    try {
      const now = ac.currentTime;
      // Double low saw-pulse drop: Eb3 (155.56Hz) -> C3 (130.81Hz)
      const pulses = [
        { freq: 185.00, endFreq: 130.81, delay: 0.0, duration: 0.16 },
        { freq: 155.56, endFreq: 110.00, delay: 0.18, duration: 0.22 }
      ];

      pulses.forEach(p => {
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        const filter = ac.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(p.freq, now + p.delay);
        osc.frequency.exponentialRampToValueAtTime(p.endFreq, now + p.delay + p.duration);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(700, now + p.delay);

        gain.gain.setValueAtTime(0.22 * effGain, now + p.delay);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + p.delay + p.duration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ac.destination);

        osc.start(now + p.delay);
        osc.stop(now + p.delay + p.duration + 0.02);
      });
    } catch (e) {}
  }

  // Mission Complete Fanfare Sound — Triumphant Victory Arpeggio
  function playMissionComplete() {
    const effGain = getEffectiveSfxGain();
    if (effGain <= 0.001) return;
    const ac = getContext();
    if (!ac) return;

    try {
      const now = ac.currentTime;
      // Triumphant cyber arpeggio: C5, E5, G5, C6, G5, C6, E6 sustain chord
      const seq = [
        { freq: 523.25, time: 0.0, dur: 0.15 },
        { freq: 659.25, time: 0.10, dur: 0.15 },
        { freq: 783.99, time: 0.20, dur: 0.15 },
        { freq: 1046.50, time: 0.30, dur: 0.22 },
        { freq: 783.99, time: 0.42, dur: 0.15 },
        { freq: 1046.50, time: 0.52, dur: 0.25 },
        { freq: 1318.51, time: 0.65, dur: 0.85 },
        { freq: 1567.98, time: 0.65, dur: 0.85 }
      ];

      seq.forEach(s => {
        const osc = ac.createOscillator();
        const gain = ac.createGain();

        osc.type = s.time >= 0.65 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(s.freq, now + s.time);

        const vol = s.time >= 0.65 ? 0.25 : 0.20;
        gain.gain.setValueAtTime(vol * effGain, now + s.time);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + s.time + s.dur);

        osc.connect(gain);
        gain.connect(ac.destination);
        osc.start(now + s.time);
        osc.stop(now + s.time + s.dur + 0.02);
      });
    } catch (e) {}
  }

  // Exam Paper Option Selection Sound — Tactile Pencil Mark / Bubble Pop
  function playExamChoice() {
    const effGain = getEffectiveClickGain();
    if (effGain <= 0.001) return;
    const ac = getContext();
    if (!ac) return;

    try {
      const now = ac.currentTime;
      const pitchVar = 0.95 + Math.random() * 0.10;

      // Soft paper-pencil bubble pop
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(860 * pitchVar, now);
      osc.frequency.exponentialRampToValueAtTime(430 * pitchVar, now + 0.04);
      gain.gain.setValueAtTime(0.20 * effGain, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.start(now);
      osc.stop(now + 0.05);

      // Light pencil graphite scratch transient
      const click = ac.createOscillator();
      const clickGain = ac.createGain();
      click.type = 'triangle';
      click.frequency.setValueAtTime(2600 * pitchVar, now);
      click.frequency.exponentialRampToValueAtTime(1100 * pitchVar, now + 0.016);
      clickGain.gain.setValueAtTime(0.12 * effGain, now);
      clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.018);
      click.connect(clickGain);
      clickGain.connect(ac.destination);
      click.start(now);
      click.stop(now + 0.02);
    } catch (e) {}
  }

  // Mission Card Target Lock / Selection Sound — Sci-Fi Holographic Ping
  function playMissionSelect() {
    const effGain = getEffectiveSfxGain();
    if (effGain <= 0.001) return;
    const ac = getContext();
    if (!ac) return;

    try {
      const now = ac.currentTime;

      // 1. Crisp transient snap (digital click)
      const clickOsc = ac.createOscillator();
      const clickGain = ac.createGain();
      clickOsc.type = 'triangle';
      clickOsc.frequency.setValueAtTime(2800, now);
      clickOsc.frequency.exponentialRampToValueAtTime(450, now + 0.012);
      clickGain.gain.setValueAtTime(0.25 * effGain, now);
      clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.014);
      clickOsc.connect(clickGain);
      clickGain.connect(ac.destination);
      clickOsc.start(now);
      clickOsc.stop(now + 0.016);

      // 2. Rising dual cyber chime arpeggio (target lock-on)
      const tones = [
        { freq: 659.25, time: 0.01, dur: 0.12, vol: 0.18 }, // E5
        { freq: 987.77, time: 0.055, dur: 0.16, vol: 0.22 }, // B5
        { freq: 1318.51, time: 0.105, dur: 0.24, vol: 0.25 }  // E6
      ];

      tones.forEach(t => {
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(t.freq, now + t.time);

        gain.gain.setValueAtTime(0.0001, now + t.time);
        gain.gain.linearRampToValueAtTime(t.vol * effGain, now + t.time + 0.006);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + t.time + t.dur);

        osc.connect(gain);
        gain.connect(ac.destination);
        osc.start(now + t.time);
        osc.stop(now + t.time + t.dur + 0.02);
      });

      // 3. Low resonant body thump for tactile weight
      const thump = ac.createOscillator();
      const thumpGain = ac.createGain();
      thump.type = 'triangle';
      thump.frequency.setValueAtTime(140, now);
      thump.frequency.exponentialRampToValueAtTime(50, now + 0.05);
      thumpGain.gain.setValueAtTime(0.18 * effGain, now);
      thumpGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.055);
      thump.connect(thumpGain);
      thumpGain.connect(ac.destination);
      thump.start(now);
      thump.stop(now + 0.06);
    } catch (e) {}
  }

  // ── Pre-test sound set (calm, friendly, synthesized) ───────────────
  function _tone(ac, o) {
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = o.type || 'sine';
    osc.frequency.setValueAtTime(o.freq, o.t);
    if (o.end) osc.frequency.exponentialRampToValueAtTime(o.end, o.t + o.dur);
    g.gain.setValueAtTime(0.0001, o.t);
    g.gain.linearRampToValueAtTime(o.vol, o.t + (o.attack || 0.005));
    g.gain.exponentialRampToValueAtTime(0.0001, o.t + o.dur);
    osc.connect(g);
    g.connect(ac.destination);
    osc.start(o.t);
    osc.stop(o.t + o.dur + 0.03);
  }

  // Soft two-note welcome chime when the pre-test opens
  function playPretestStart() {
    const eff = getEffectiveSfxGain();
    if (eff <= 0.001) return;
    const ac = getContext();
    if (!ac) return;
    try {
      const now = ac.currentTime;
      _tone(ac, { freq: 523.25, t: now,        dur: 0.55, vol: 0.11 * eff, attack: 0.02 });
      _tone(ac, { freq: 783.99, t: now + 0.13, dur: 0.70, vol: 0.10 * eff, attack: 0.02 });
    } catch (e) {}
  }

  // Tiny rising tick while the score counts up
  function playResultTick(step, total) {
    const eff = getEffectiveSfxGain();
    if (eff <= 0.001) return;
    const ac = getContext();
    if (!ac) return;
    try {
      const now = ac.currentTime;
      const f = 480 + 560 * (total ? step / total : 0);
      _tone(ac, { freq: f, t: now, dur: 0.07, vol: 0.07 * eff, type: 'triangle' });
    } catch (e) {}
  }

  // Confetti cannon pop: noise burst + low thump
  function playConfettiPop() {
    const eff = getEffectiveSfxGain();
    if (eff <= 0.001) return;
    const ac = getContext();
    if (!ac) return;
    try {
      const now = ac.currentTime;
      const len = Math.floor(ac.sampleRate * 0.14);
      const buf = ac.createBuffer(1, len, ac.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.2);
      const src = ac.createBufferSource();
      src.buffer = buf;
      const bp = ac.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(1800, now);
      bp.Q.value = 0.7;
      const g = ac.createGain();
      g.gain.setValueAtTime(0.28 * eff, now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);
      src.connect(bp); bp.connect(g); g.connect(ac.destination);
      src.start(now);
      _tone(ac, { freq: 190, end: 60, t: now, dur: 0.12, vol: 0.22 * eff });
    } catch (e) {}
  }

  // Perfect score: arpeggio, full chord, shimmering sparkles
  function playPerfectFanfare() {
    const eff = getEffectiveSfxGain();
    if (eff <= 0.001) return;
    const ac = getContext();
    if (!ac) return;
    try {
      const now = ac.currentTime;
      [523.25, 659.25, 783.99, 1046.50].forEach((f, i) => {
        _tone(ac, { freq: f, t: now + i * 0.11, dur: 0.28, vol: 0.18 * eff, type: 'triangle' });
      });
      const t = now + 0.52;
      [523.25, 659.25, 783.99, 1046.50, 1318.51].forEach((f) => {
        _tone(ac, { freq: f, t: t, dur: 1.7, vol: 0.12 * eff, type: 'sine', attack: 0.015 });
      });
      _tone(ac, { freq: 130.81, t: t, dur: 1.4, vol: 0.16 * eff, type: 'triangle' });
      [2637.02, 3135.96, 4186.01, 3135.96, 2637.02].forEach((f, i) => {
        _tone(ac, { freq: f, t: t + 0.25 + i * 0.13, dur: 0.30, vol: 0.05 * eff });
      });
    } catch (e) {}
  }

  // Great / good result: bright, short major chime
  function playResultGood() {
    const eff = getEffectiveSfxGain();
    if (eff <= 0.001) return;
    const ac = getContext();
    if (!ac) return;
    try {
      const now = ac.currentTime;
      [523.25, 659.25, 783.99].forEach((f, i) => {
        _tone(ac, { freq: f, t: now + i * 0.10, dur: 0.75, vol: 0.14 * eff, type: 'triangle', attack: 0.01 });
      });
    } catch (e) {}
  }

  // Low result: warm, calm, rising and hopeful (never harsh)
  function playResultEncourage() {
    const eff = getEffectiveSfxGain();
    if (eff <= 0.001) return;
    const ac = getContext();
    if (!ac) return;
    try {
      const now = ac.currentTime;
      _tone(ac, { freq: 196.00, t: now, dur: 1.6, vol: 0.06 * eff, attack: 0.08 });
      [392.00, 493.88, 587.33].forEach((f, i) => {
        _tone(ac, { freq: f, t: now + i * 0.24, dur: 1.0, vol: 0.12 * eff, attack: 0.04 });
      });
    } catch (e) {}
  }

  return {
    settings,
    unlock,
    saveSettings,
    playMouseClick,
    playSliderTick,
    playWindowSound,
    playFlagChirp,
    playNotification,
    playChime,
    playAlert,
    playCorrect,
    playWrong,
    playMissionComplete,
    playTypingKey,
    playNarratorTyping,
    playExamChoice,
    playPretestStart,
    playResultTick,
    playConfettiPop,
    playPerfectFanfare,
    playResultGood,
    playResultEncourage,
    playMissionSelect
  };
})();
