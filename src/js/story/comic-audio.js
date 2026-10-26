'use strict';

// ═══════════════════════════════════════════════════════════
// COMIC STRIP & CHAPTER TITLE BACKGROUND MUSIC ENGINE
// Professional Web Audio API Synthesizer — No external files
// ═══════════════════════════════════════════════════════════
//
//  ComicAudio.play('ch1')  — Ch1 Phishing: "Office Infiltration"
//  ComicAudio.play('ch2')  — Ch2 Malware:  "System Breach"
//  ComicAudio.play('ch3')  — Ch3 Safe Online: "Digital Shadows"
//  ComicAudio.play('ch4')  — Ch4 Ransomware: "Encrypted Nightmare"
//  ComicAudio.stop()       — graceful fade-out
//
// ═══════════════════════════════════════════════════════════

const ComicAudio = (() => {
  let _ctx = null;
  let _currentTrack = null;

  // Reuse the AudioContext that the panel chime system already created and unlocked.
  // This guarantees we're never blocked by the browser's autoplay policy.
  function _getCtx() {
    // 1. Prefer the already-warm comic panel audio context
    if (window._comicAudioCtx && window._comicAudioCtx.state !== 'closed') {
      if (window._comicAudioCtx.state === 'suspended') {
        window._comicAudioCtx.resume().catch(() => {});
      }
      return window._comicAudioCtx;
    }
    // 2. Fall back: create one ourselves and store it in the shared slot
    if (!_ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      _ctx = new AC();
      window._comicAudioCtx = _ctx; // share with panel chime system
    }
    if (_ctx.state === 'suspended') _ctx.resume().catch(() => {});
    return _ctx;
  }

  // Pre-unlock the AudioContext on the very first user interaction.
  // This ensures the context is warm well before the comic strip overlay opens.
  function _preUnlock() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    if (!window._comicAudioCtx) {
      window._comicAudioCtx = new AC();
    }
    if (window._comicAudioCtx.state === 'suspended') {
      window._comicAudioCtx.resume().catch(() => {});
    }
    document.removeEventListener('click', _preUnlock, true);
    document.removeEventListener('keydown', _preUnlock, true);
    document.removeEventListener('touchstart', _preUnlock, true);
  }
  document.addEventListener('click', _preUnlock, true);
  document.addEventListener('keydown', _preUnlock, true);
  document.addEventListener('touchstart', _preUnlock, { capture: true, passive: true });

  function _fadeIn(gainNode, targetVol, durationSec) {
    const ctx = _getCtx();
    if (!ctx || !gainNode) return;
    gainNode.gain.cancelScheduledValues(ctx.currentTime);
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(targetVol, ctx.currentTime + durationSec);
  }

  function _fadeOut(gainNode, durationSec, onDone) {
    const ctx = _getCtx();
    if (!ctx || !gainNode) { if (onDone) onDone(); return; }
    const cur = gainNode.gain.value;
    gainNode.gain.cancelScheduledValues(ctx.currentTime);
    gainNode.gain.setValueAtTime(cur || 0.01, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + durationSec);
    setTimeout(onDone || (() => {}), durationSec * 1000 + 80);
  }

  function _osc(type, freq, gainVal, dest, ctx) {
    const osc = ctx.createOscillator();
    const g   = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.value = gainVal;
    osc.connect(g);
    g.connect(dest);
    return { osc, g };
  }

  function _makeReverb(ctx, durationSec, decay) {
    const convolver = ctx.createConvolver();
    const length = Math.round(ctx.sampleRate * durationSec);
    const impulse = ctx.createBuffer(2, length, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const data = impulse.getChannelData(ch);
      for (let i = 0; i < length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
      }
    }
    convolver.buffer = impulse;
    return convolver;
  }

  function _lfo(rate, depth, target, ctx, now) {
    const lfoOsc = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfoOsc.type = 'sine';
    lfoOsc.frequency.value = rate;
    lfoGain.gain.value = depth;
    lfoOsc.connect(lfoGain);
    lfoGain.connect(target);
    lfoOsc.start(now);
    return lfoOsc;
  }

  // ════════════════════════════════════════════════
  // CH1 — "Office Infiltration" (Phishing)
  // Eerie Dm arpeggio · reverb pads · glitch blips
  // ════════════════════════════════════════════════
  function _buildCh1(dest, ctx) {
    const nodes = [];
    const timers = [];

    const reverb = _makeReverb(ctx, 2.8, 2.6);
    const wet = ctx.createGain(); wet.gain.value = 0.42;
    const dry = ctx.createGain(); dry.gain.value = 0.58;
    reverb.connect(wet); wet.connect(dest); dry.connect(dest);

    // Dm pad layers
    [146.83, 174.61, 220.00, 261.63].forEach((f, i) => {
      const { osc } = _osc('sine', f, 0.11 - i * 0.015, dry, ctx);
      const v = _lfo(0.22 + i * 0.07, f * 0.004, osc.frequency, ctx, ctx.currentTime);
      osc.start(ctx.currentTime);
      nodes.push(osc, v);
    });

    // Sub triangle warmth
    const { osc: sub } = _osc('triangle', 73.42, 0.12, dry, ctx);
    sub.start(ctx.currentTime);
    nodes.push(sub);

    // Slow eerie arpeggio
    const arpNotes = [220, 261.63, 293.66, 349.23, 392, 349.23, 293.66, 261.63];
    const arpInt = 0.5;
    let arpIdx = 0;
    function scheduleArp() {
      const now = ctx.currentTime;
      const freq = arpNotes[arpIdx++ % arpNotes.length];
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine'; o.frequency.value = freq;
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(0.09, now + 0.04);
      g.gain.exponentialRampToValueAtTime(0.0001, now + arpInt * 0.85);
      o.connect(g); g.connect(reverb); g.connect(dry);
      o.start(now); o.stop(now + arpInt);
      timers.push(setTimeout(scheduleArp, arpInt * 1000 - 12));
    }
    scheduleArp();

    // Glitch noise blip
    function glitch() {
      const now = ctx.currentTime;
      const sz = Math.round(ctx.sampleRate * 0.04);
      const buf = ctx.createBuffer(1, sz, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < sz; i++) d[i] = Math.random() * 2 - 1;
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const bpf = ctx.createBiquadFilter(); bpf.type = 'bandpass';
      bpf.frequency.value = 800 + Math.random() * 400; bpf.Q.value = 14;
      const g = ctx.createGain(); g.gain.value = 0.04;
      src.connect(bpf); bpf.connect(g); g.connect(dest);
      src.start(now);
      timers.push(setTimeout(glitch, 3200 + Math.random() * 2000));
    }
    glitch();

    return () => {
      timers.forEach(t => clearTimeout(t));
      nodes.forEach(n => { try { n.stop(); } catch(e) {} });
    };
  }

  // ════════════════════════════════════════════════
  // CH2 — "System Breach" (Malware)
  // Heavy saw bass · glitchy kick/snare · industrial
  // ════════════════════════════════════════════════
  function _buildCh2(dest, ctx) {
    const nodes = [];
    const timers = [];

    // Saw bass with LP filter
    [82.41, 110.00, 123.47].forEach((f, i) => {
      const osc = ctx.createOscillator();
      const lp = ctx.createBiquadFilter();
      const g = ctx.createGain();
      osc.type = 'sawtooth'; osc.frequency.value = f;
      lp.type = 'lowpass'; lp.frequency.value = 320; lp.Q.value = 3;
      g.gain.value = 0.09 - i * 0.02;
      osc.connect(lp); lp.connect(g); g.connect(dest);
      osc.start(ctx.currentTime);
      nodes.push(osc);
    });

    // Square drone pad
    const reverb = _makeReverb(ctx, 1.6, 4.0);
    const wet = ctx.createGain(); wet.gain.value = 0.28;
    reverb.connect(wet); wet.connect(dest);
    [164.81, 195.99, 246.94].forEach((f, i) => {
      const { osc } = _osc('square', f, 0.025 - i * 0.004, reverb, ctx);
      osc.start(ctx.currentTime);
      nodes.push(osc);
    });

    // Rhythmic percussion loop
    const BPM = 120;
    const beat = 60 / BPM;
    const pattern = [
      { delay: 0,          type: 'kick'   },
      { delay: beat * 0.5, type: 'glitch' },
      { delay: beat,       type: 'snare'  },
      { delay: beat * 1.5, type: 'glitch' },
      { delay: beat * 2,   type: 'kick'   },
      { delay: beat * 2.25,type: 'glitch' },
      { delay: beat * 3,   type: 'snare'  },
      { delay: beat * 3.75,type: 'glitch' },
    ];
    const loopLen = beat * 4;
    let loopStart = ctx.currentTime + 0.05;

    function scheduleLoop() {
      pattern.forEach(({ delay, type }) => {
        const t = loopStart + delay;
        if (t < ctx.currentTime - 0.05) return;
        if (type === 'kick') {
          const o = ctx.createOscillator(); const g = ctx.createGain();
          o.type = 'sine';
          o.frequency.setValueAtTime(160, t);
          o.frequency.exponentialRampToValueAtTime(40, t + 0.12);
          g.gain.setValueAtTime(0.5, t);
          g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
          o.connect(g); g.connect(dest); o.start(t); o.stop(t + 0.22);
        } else if (type === 'snare') {
          const sz = Math.round(ctx.sampleRate * 0.12);
          const buf = ctx.createBuffer(1, sz, ctx.sampleRate);
          const d = buf.getChannelData(0);
          for (let i = 0; i < sz; i++) d[i] = Math.random() * 2 - 1;
          const src = ctx.createBufferSource(); src.buffer = buf;
          const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 2400;
          const g = ctx.createGain();
          g.gain.setValueAtTime(0.22, t);
          g.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
          src.connect(hp); hp.connect(g); g.connect(dest); src.start(t);
        } else {
          const o = ctx.createOscillator(); const g = ctx.createGain();
          o.type = 'square'; o.frequency.value = 440 + Math.random() * 880;
          g.gain.setValueAtTime(0.06, t);
          g.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);
          o.connect(g); g.connect(dest); o.start(t); o.stop(t + 0.05);
        }
      });
      loopStart += loopLen;
      timers.push(setTimeout(scheduleLoop, loopLen * 1000 - 80));
    }
    scheduleLoop();

    return () => {
      timers.forEach(t => clearTimeout(t));
      nodes.forEach(n => { try { n.stop(); } catch(e) {} });
    };
  }

  // ════════════════════════════════════════════════
  // CH3 — "Digital Shadows" (Safe Online / Social Eng.)
  // Warm Am bells · ambient pads · creeping dissonance
  // ════════════════════════════════════════════════
  function _buildCh3(dest, ctx) {
    const nodes = [];
    const timers = [];

    const reverb = _makeReverb(ctx, 3.5, 2.0);
    const wet = ctx.createGain(); wet.gain.value = 0.5;
    reverb.connect(wet); wet.connect(dest);

    // Am chord pads
    [220, 261.63, 329.63, 392].forEach((f, i) => {
      const { osc } = _osc('sine', f, 0.10 - i * 0.018, reverb, ctx);
      const v = _lfo(0.3 + i * 0.05, f * 0.006, osc.frequency, ctx, ctx.currentTime);
      osc.start(ctx.currentTime);
      nodes.push(osc, v);
    });

    // Gentle bell melody
    const bellNotes = [523.25, 587.33, 659.26, 698.46, 783.99, 698.46, 659.26, 587.33];
    const bellInt = (60 / 72) * 0.75;
    let bellIdx = 0;
    function scheduleBell() {
      const now = ctx.currentTime;
      const freq = bellNotes[bellIdx++ % bellNotes.length];
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.type = 'triangle'; o.frequency.value = freq;
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(0.07, now + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, now + bellInt * 1.2);
      o.connect(g); g.connect(reverb); g.connect(dest);
      o.start(now); o.stop(now + bellInt * 1.5);
      timers.push(setTimeout(scheduleBell, bellInt * 1000 - 10));
    }
    scheduleBell();

    // Creeping dissonance: Bb/B tritone pair
    [233.08, 246.94].forEach((f, i) => {
      const { osc } = _osc('sine', f, 0.04, reverb, ctx);
      const v = _lfo(0.08 + i * 0.04, f * 0.01, osc.frequency, ctx, ctx.currentTime);
      osc.start(ctx.currentTime);
      nodes.push(osc, v);
    });

    // Social media "chatter" noise bed
    const nbuf = ctx.createBuffer(2, ctx.sampleRate * 2, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = nbuf.getChannelData(ch);
      for (let i = 0; i < nbuf.length; i++) d[i] = (Math.random() * 2 - 1) * 0.015;
    }
    const nsrc = ctx.createBufferSource(); nsrc.buffer = nbuf; nsrc.loop = true;
    const nbpf = ctx.createBiquadFilter(); nbpf.type = 'bandpass'; nbpf.frequency.value = 1200; nbpf.Q.value = 0.5;
    const ng = ctx.createGain(); ng.gain.value = 0.05;
    nsrc.connect(nbpf); nbpf.connect(ng); ng.connect(dest);
    nsrc.start(ctx.currentTime);
    nodes.push(nsrc);

    return () => {
      timers.forEach(t => clearTimeout(t));
      nodes.forEach(n => { try { n.stop(); } catch(e) {} });
    };
  }

  // ════════════════════════════════════════════════
  // CH4 — "Encrypted Nightmare" (Ransomware)
  // Sub drone · lub-dub heartbeat · alarm staccato
  // ════════════════════════════════════════════════
  function _buildCh4(dest, ctx) {
    const nodes = [];
    const timers = [];

    const reverb = _makeReverb(ctx, 4.0, 1.8);
    const wet = ctx.createGain(); wet.gain.value = 0.6;
    reverb.connect(wet); wet.connect(dest);

    // Sub drone — primal dread in C1
    [32.70, 38.89, 41.20].forEach((f, i) => {
      const { osc } = _osc('sine', f, 0.18 - i * 0.04, dest, ctx);
      const v = _lfo(0.05 + i * 0.03, f * 0.008, osc.frequency, ctx, ctx.currentTime);
      osc.start(ctx.currentTime);
      nodes.push(osc, v);
    });

    // Distorted "corrupted data" saw layer
    [164.81, 196, 207.65].forEach((f, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth'; osc.frequency.value = f * 0.5;
      const wave = ctx.createWaveShaper();
      const k = 120;
      const curve = new Float32Array(256);
      for (let j = 0; j < 256; j++) {
        const x = (j * 2) / 256 - 1;
        curve[j] = ((Math.PI + k) * x) / (Math.PI + k * Math.abs(x));
      }
      wave.curve = curve; wave.oversample = '4x';
      const g = ctx.createGain(); g.gain.value = 0.035 - i * 0.008;
      osc.connect(wave); wave.connect(g); g.connect(reverb);
      osc.start(ctx.currentTime);
      nodes.push(osc);
    });

    // Heartbeat / industrial thud (lub-dub)
    const heartBeat = 60 / 76;
    function scheduleHeart() {
      const t = ctx.currentTime;
      // Lub
      const o1 = ctx.createOscillator(); const g1 = ctx.createGain();
      o1.type = 'sine';
      o1.frequency.setValueAtTime(80, t);
      o1.frequency.exponentialRampToValueAtTime(35, t + 0.15);
      g1.gain.setValueAtTime(0.55, t);
      g1.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
      o1.connect(g1); g1.connect(dest); o1.start(t); o1.stop(t + 0.25);
      // Dub
      const o2 = ctx.createOscillator(); const g2 = ctx.createGain();
      o2.type = 'sine';
      o2.frequency.setValueAtTime(65, t + 0.18);
      o2.frequency.exponentialRampToValueAtTime(28, t + 0.30);
      g2.gain.setValueAtTime(0, t);
      g2.gain.setValueAtTime(0.35, t + 0.18);
      g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
      o2.connect(g2); g2.connect(dest); o2.start(t); o2.stop(t + 0.38);
      timers.push(setTimeout(scheduleHeart, heartBeat * 1000));
    }
    scheduleHeart();

    // Alarm staccato — tri-tone descending burst every 4 beats
    let alarmBeat = 0;
    const alarmNotes = [587.33, 554.37, 523.25];
    function scheduleAlarm() {
      alarmBeat++;
      if (alarmBeat % 4 === 0) {
        const now = ctx.currentTime;
        alarmNotes.forEach((f, i) => {
          const t = now + i * 0.12;
          const o = ctx.createOscillator(); const g = ctx.createGain();
          o.type = 'square'; o.frequency.value = f;
          g.gain.setValueAtTime(0, t);
          g.gain.linearRampToValueAtTime(0.08, t + 0.02);
          g.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
          o.connect(g); g.connect(reverb); g.connect(dest);
          o.start(t); o.stop(t + 0.12);
        });
      }
      timers.push(setTimeout(scheduleAlarm, heartBeat * 1000));
    }
    scheduleAlarm();

    // Tape hiss shimmer
    const hbuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const hd = hbuf.getChannelData(0);
    for (let i = 0; i < hbuf.length; i++) hd[i] = Math.random() * 2 - 1;
    const hsrc = ctx.createBufferSource(); hsrc.buffer = hbuf; hsrc.loop = true;
    const hhp = ctx.createBiquadFilter(); hhp.type = 'highpass'; hhp.frequency.value = 5000;
    const hg = ctx.createGain(); hg.gain.value = 0.04;
    hsrc.connect(hhp); hhp.connect(hg); hg.connect(dest);
    hsrc.start(ctx.currentTime);
    nodes.push(hsrc);

    return () => {
      timers.forEach(t => clearTimeout(t));
      nodes.forEach(n => { try { n.stop(); } catch(e) {} });
    };
  }

  // ═══════════════════════════════════════════════
  // PUBLIC API
  // ═══════════════════════════════════════════════
  const BUILDERS = { ch1: _buildCh1, ch2: _buildCh2, ch3: _buildCh3, ch4: _buildCh4 };

  function play(chapterId) {
    const builder = BUILDERS[chapterId];
    if (!builder) return;
    const ctx = _getCtx();
    if (!ctx) return;

    stop(() => {
      const gainNode = ctx.createGain();
      gainNode.gain.value = 0;
      gainNode.connect(ctx.destination);

      let targetVol = 0.55;
      try {
        if (typeof AudioManager !== 'undefined' && typeof AudioManager.getSettings === 'function') {
          const s = AudioManager.getSettings();
          if (s && (s.masterMuted || s.sfxMuted)) {
            targetVol = 0;
          } else if (s) {
            const mv = (s.masterVolume || 80) / 100;
            const sv = (s.sfxVolume || 80) / 100;
            targetVol = mv * sv * 0.65;
          }
        }
      } catch(e) {}

      const stopFn = builder(gainNode, ctx);
      _currentTrack = { id: chapterId, stopFn, gainNode };
      _fadeIn(gainNode, targetVol, 1.8);
    });
  }

  function stop(onDone) {
    if (!_currentTrack) { if (onDone) onDone(); return; }
    const track = _currentTrack;
    _currentTrack = null;
    _fadeOut(track.gainNode, 0.9, () => {
      try { track.stopFn(); } catch(e) {}
      try { track.gainNode.disconnect(); } catch(e) {}
      if (onDone) onDone();
    });
  }

  function isPlaying(chapterId) {
    return !!(chapterId ? _currentTrack && _currentTrack.id === chapterId : _currentTrack);
  }

  return { play, stop, isPlaying };
})();

window.ComicAudio = ComicAudio;
