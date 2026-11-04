const fs = require('fs');
const path = require('path');

// ════════════════════════════════════════════════════════════
// 1. UPDATE index.html
// ════════════════════════════════════════════════════════════
const indexPath = path.resolve('CyberZER0-main/index.html');
let indexContent = fs.readFileSync(indexPath, 'utf8');
const isCrlf = indexContent.includes('\r\n');
const eol = isCrlf ? '\r\n' : '\n';

const audioTag = [
  '<!-- Chapter 1 Comic Strip Background Audio (assets/sounds/Chapter 1/Chapter1.wav) -->',
  '<audio id="comic-ch1-audio" src="assets/sounds/Chapter 1/Chapter1.wav" loop preload="auto">',
  '  <source src="assets/sounds/Chapter 1/Chapter1.wav" type="audio/wav">',
  '  <source src="assets/sounds/Chapter1/Chapter1.wav" type="audio/wav">',
  '</audio>'
].join(eol);

if (!indexContent.includes('id="comic-ch1-audio"')) {
  const mmAudioClose = '</audio>' + eol + eol + '<!-- ── CYBERZERO MAIN MENU';
  if (!indexContent.includes(mmAudioClose)) {
    throw new Error('Could not find mm-bg-audio close in index.html');
  }
  indexContent = indexContent.replace(
    mmAudioClose,
    '</audio>' + eol + eol + audioTag + eol + eol + '<!-- ── CYBERZERO MAIN MENU'
  );
  fs.writeFileSync(indexPath, indexContent, 'utf8');
  console.log('✓ Added #comic-ch1-audio to index.html');
} else {
  console.log('✓ #comic-ch1-audio already in index.html');
}

// ════════════════════════════════════════════════════════════
// 2. UPDATE comic-audio.js
// ════════════════════════════════════════════════════════════
const comicAudioPath = path.resolve('CyberZER0-main/src/js/story/comic-audio.js');
let comicAudioContent = fs.readFileSync(comicAudioPath, 'utf8');

const ch1Replacement = `  // ════════════════════════════════════════════════
  // CH1 — Chapter 1 Phishing Comic Strip Background Music
  // Audio file: assets/sounds/Chapter 1/Chapter1.wav
  // ════════════════════════════════════════════════
  let _ch1Audio = null;

  function _getCh1Audio() {
    if (typeof document !== 'undefined') {
      const el = document.getElementById('comic-ch1-audio');
      if (el) return el;
    }
    if (!_ch1Audio && typeof Audio !== 'undefined') {
      _ch1Audio = new Audio('assets/sounds/Chapter 1/Chapter1.wav');
      _ch1Audio.id = 'comic-ch1-audio';
      _ch1Audio.loop = true;
      _ch1Audio.preload = 'auto';
      _ch1Audio.addEventListener('error', function onCh1Err() {
        if (!_ch1Audio._retried) {
          _ch1Audio._retried = true;
          _ch1Audio.src = 'assets/sounds/Chapter1/Chapter1.wav';
          _ch1Audio.load();
        }
      });
    }
    return _ch1Audio;
  }

  function _getComfortableVolumeCh1() {
    // 0.35 provides a comfortable ambient volume so narration & dialogue remain crystal clear
    let baseVol = 0.35;
    try {
      if (typeof AudioManager !== 'undefined' && typeof AudioManager.getSettings === 'function') {
        const s = AudioManager.getSettings();
        if (s && (s.masterMuted || s.sfxMuted)) {
          return 0;
        } else if (s) {
          const mv = (typeof s.masterVolume === 'number' ? s.masterVolume : 80) / 100;
          const sv = (typeof s.sfxVolume === 'number' ? s.sfxVolume : 80) / 100;
          return Math.max(0.04, Math.min(0.55, baseVol * mv * sv));
        }
      }
    } catch (e) {}
    return baseVol;
  }

  function _playCh1(onReady) {
    // Immediately stop other background music (e.g. main menu) to prevent overlap
    if (typeof stopMMBgMusic === 'function') {
      try { stopMMBgMusic(); } catch (e) {}
    }
    if (typeof document !== 'undefined') {
      const mm = document.getElementById('mm-bg-audio');
      if (mm && !mm.paused) {
        try { mm.pause(); mm.currentTime = 0; } catch (e) {}
      }
    }

    const audio = _getCh1Audio();
    if (!audio) {
      if (onReady) onReady();
      return;
    }

    audio.loop = true;
    const targetVol = _getComfortableVolumeCh1();
    audio.volume = targetVol;
    try { audio.currentTime = 0; } catch (e) {}

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // If autoplay policy restricts playback, automatically resume on first user interaction
        const resumeOnGesture = () => {
          if (_currentTrack && _currentTrack.id === 'ch1' && audio.paused) {
            audio.play().catch(() => {});
          }
          document.removeEventListener('click', resumeOnGesture, true);
          document.removeEventListener('keydown', resumeOnGesture, true);
          document.removeEventListener('touchstart', resumeOnGesture, true);
        };
        document.addEventListener('click', resumeOnGesture, true);
        document.addEventListener('keydown', resumeOnGesture, true);
        document.addEventListener('touchstart', resumeOnGesture, { capture: true, passive: true });
      });
    }

    _currentTrack = {
      id: 'ch1',
      type: 'audio-element',
      audio: audio,
      stopFn: () => {
        try {
          audio.pause();
          audio.currentTime = 0;
        } catch (e) {}
      }
    };

    if (onReady) onReady();
  }`;

// Find _buildCh1 block and replace it
const oldCh1Regex = /\/\/\s*═+\s*\r?\n\s*\/\/\s*CH1[\s\S]*?return\s*\(\)\s*=>\s*\{[\s\S]*?nodes\.forEach[\s\S]*?\};\s*\r?\n\s*\}/;
if (!oldCh1Regex.test(comicAudioContent)) {
  console.log('Checking alternative match for _buildCh1...');
} else {
  comicAudioContent = comicAudioContent.replace(oldCh1Regex, ch1Replacement);
  console.log('✓ Replaced _buildCh1 with _playCh1 using Chapter1.wav');
}

// Update play, stop, and isPlaying in comic-audio.js
const oldPlayRegex = /function play\(chapterId\) \{[\s\S]*?const builder = BUILDERS\[chapterId\];[\s\S]*?_fadeIn\(gainNode, targetVol, 1\.8\);\s*\r?\n\s*\}\);?\s*\r?\n\s*\}/;

const newPlayFn = `function play(chapterId) {
    if (chapterId === 'ch1' || chapterId === 'chapter1' || chapterId === 1) {
      stop(() => {
        _playCh1();
      });
      return;
    }

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
      _currentTrack = { id: chapterId, type: 'synth', stopFn, gainNode };
      _fadeIn(gainNode, targetVol, 1.8);
    });
  }`;

if (oldPlayRegex.test(comicAudioContent)) {
  comicAudioContent = comicAudioContent.replace(oldPlayRegex, newPlayFn);
  console.log('✓ Updated ComicAudio.play()');
} else {
  console.log('Could not match oldPlayRegex');
}

const oldStopRegex = /function stop\(onDone\) \{[\s\S]*?if \(!_currentTrack\) \{[\s\S]*?_fadeOut\(track\.gainNode, 0\.9, \(\) => \{[\s\S]*?if \(onDone\) onDone\(\);\s*\r?\n\s*\}\);\s*\r?\n\s*\}/;

const newStopFn = `function stop(onDone) {
    // Always make sure Chapter 1 audio element is stopped
    const ch1Audio = _getCh1Audio();

    if (!_currentTrack) {
      if (ch1Audio && !ch1Audio.paused) {
        try { ch1Audio.pause(); ch1Audio.currentTime = 0; } catch (e) {}
      }
      if (onDone) onDone();
      return;
    }

    const track = _currentTrack;
    _currentTrack = null;

    if (track.id === 'ch1' || track.type === 'audio-element') {
      const el = track.audio || ch1Audio;
      if (el) {
        try {
          el.pause();
          el.currentTime = 0;
        } catch (e) {}
      }
      try { track.stopFn(); } catch (e) {}
      if (onDone) onDone();
      return;
    }

    if (track.gainNode) {
      _fadeOut(track.gainNode, 0.9, () => {
        try { track.stopFn(); } catch(e) {}
        try { track.gainNode.disconnect(); } catch(e) {}
        if (onDone) onDone();
      });
    } else {
      try { track.stopFn(); } catch(e) {}
      if (onDone) onDone();
    }
  }`;

if (oldStopRegex.test(comicAudioContent)) {
  comicAudioContent = comicAudioContent.replace(oldStopRegex, newStopFn);
  console.log('✓ Updated ComicAudio.stop()');
} else {
  console.log('Could not match oldStopRegex');
}

const oldIsPlayingRegex = /function isPlaying\(chapterId\) \{[\s\S]*?return !!\(chapterId \? _currentTrack && _currentTrack\.id === chapterId : _currentTrack\);\s*\r?\n\s*\}/;

const newIsPlayingFn = `function isPlaying(chapterId) {
    if (chapterId === 'ch1' || (!chapterId && _currentTrack && _currentTrack.id === 'ch1')) {
      const a = _getCh1Audio();
      return !!(_currentTrack && _currentTrack.id === 'ch1' && a && !a.paused);
    }
    return !!(chapterId ? _currentTrack && _currentTrack.id === chapterId : _currentTrack);
  }`;

if (oldIsPlayingRegex.test(comicAudioContent)) {
  comicAudioContent = comicAudioContent.replace(oldIsPlayingRegex, newIsPlayingFn);
  console.log('✓ Updated ComicAudio.isPlaying()');
} else {
  console.log('Could not match oldIsPlayingRegex');
}

// Fix BUILDERS in comic-audio.js
comicAudioContent = comicAudioContent.replace(
  'const BUILDERS = { ch1: _buildCh1, ch2: _buildCh2, ch3: _buildCh3, ch4: _buildCh4 };',
  'const BUILDERS = { ch2: _buildCh2, ch3: _buildCh3, ch4: _buildCh4 };'
);

fs.writeFileSync(comicAudioPath, comicAudioContent, 'utf8');
console.log('✓ comic-audio.js successfully written!');

// ════════════════════════════════════════════════════════════
// 3. UPDATE comic-strips.js
// ════════════════════════════════════════════════════════════
const comicStripsPath = path.resolve('CyberZER0-main/src/js/story/comic-strips.js');
let comicStripsContent = fs.readFileSync(comicStripsPath, 'utf8');

// In showComicStrip: Ensure stopMMBgMusic is called before starting comic audio
if (!comicStripsContent.includes("if (typeof stopMMBgMusic === 'function') stopMMBgMusic(); // Prevent music overlap")) {
  comicStripsContent = comicStripsContent.replace(
    "// Start Chapter 1 background music — \"Office Infiltration\" (Phishing suspense)",
    "// Stop any other background audio to prevent overlap\n  if (typeof stopMMBgMusic === 'function') stopMMBgMusic(); // Prevent music overlap\n\n  // Start Chapter 1 background audio (assets/sounds/Chapter 1/Chapter1.wav)"
  );
  console.log('✓ Updated showComicStrip() in comic-strips.js');
}

// In _proceedToAlexPassword: Ensure comic audio stops when transitioning
if (!comicStripsContent.includes("if (typeof ComicAudio !== 'undefined') ComicAudio.stop(); // Stop comic audio on transition")) {
  comicStripsContent = comicStripsContent.replace(
    "function _proceedToAlexPassword() {",
    "function _proceedToAlexPassword() {\n  // Ensure comic audio is completely stopped when transitioning to the login scene\n  if (typeof ComicAudio !== 'undefined') ComicAudio.stop(); // Stop comic audio on transition\n  if (typeof stopChapter1ComicAudio === 'function') stopChapter1ComicAudio();"
  );
  console.log('✓ Updated _proceedToAlexPassword() in comic-strips.js');
}

// In initComicFsObserver: Stop comic audio if overlay is hidden or closed
const oldObserverSnippet = `        new MutationObserver(function () {
          _syncComicFsBtn();
        }).observe(el, { attributes: true, attributeFilter: ['class', 'style'] });`;

const newObserverSnippet = `        new MutationObserver(function () {
          _syncComicFsBtn();
          if (id === 'overlay-comic-strip' && (el.style.display === 'none' || !el.classList.contains('active'))) {
            if (typeof ComicAudio !== 'undefined' && typeof ComicAudio.isPlaying === 'function' && ComicAudio.isPlaying('ch1')) {
              ComicAudio.stop();
            }
          }
        }).observe(el, { attributes: true, attributeFilter: ['class', 'style'] });`;

if (comicStripsContent.includes(oldObserverSnippet)) {
  comicStripsContent = comicStripsContent.replace(oldObserverSnippet, newObserverSnippet);
  console.log('✓ Updated MutationObserver in comic-strips.js');
}

// Expose helper functions on window
if (!comicStripsContent.includes('window.playChapter1ComicAudio =')) {
  comicStripsContent += `\n\n// ── HELPER EXPORTS FOR CHAPTER 1 COMIC AUDIO ──
window.playChapter1ComicAudio = function () {
  if (typeof ComicAudio !== 'undefined' && typeof ComicAudio.play === 'function') {
    ComicAudio.play('ch1');
  }
};
window.stopChapter1ComicAudio = function () {
  if (typeof ComicAudio !== 'undefined' && typeof ComicAudio.stop === 'function') {
    ComicAudio.stop();
  }
};\n`;
  console.log('✓ Added helper exports to comic-strips.js');
}

fs.writeFileSync(comicStripsPath, comicStripsContent, 'utf8');

// ════════════════════════════════════════════════════════════
// 4. UPDATE main-menu.js
// ════════════════════════════════════════════════════════════
const mainMenuPath = path.resolve('CyberZER0-main/src/js/ui/main-menu.js');
let mainMenuContent = fs.readFileSync(mainMenuPath, 'utf8');

// In showMainMenu: Stop comic audio when entering main menu
if (!mainMenuContent.includes("if (typeof ComicAudio !== 'undefined') ComicAudio.stop(); // Stop comic audio in main menu")) {
  mainMenuContent = mainMenuContent.replace(
    "function showMainMenu() {",
    "function showMainMenu() {\n  // Ensure any active comic audio is stopped when main menu appears\n  if (typeof ComicAudio !== 'undefined') ComicAudio.stop(); // Stop comic audio in main menu"
  );
  console.log('✓ Updated showMainMenu() in main-menu.js');
}

// In startMMBgMusic: Stop comic audio before starting main menu music
if (!mainMenuContent.includes("if (typeof ComicAudio !== 'undefined') ComicAudio.stop(); // Prevent overlap with main menu audio")) {
  mainMenuContent = mainMenuContent.replace(
    "window.startMMBgMusic = function () {",
    "window.startMMBgMusic = function () {\n  if (typeof ComicAudio !== 'undefined') ComicAudio.stop(); // Prevent overlap with main menu audio"
  );
  console.log('✓ Updated startMMBgMusic() in main-menu.js');
}

fs.writeFileSync(mainMenuPath, mainMenuContent, 'utf8');
console.log('✓ main-menu.js successfully written!');
console.log('\nALL CHAPTER 1 COMIC AUDIO UPDATES COMPLETED SUCCESSFULLY!\n');
