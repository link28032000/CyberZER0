const fs = require('fs');
const path = require('path');
const assert = require('assert');
const vm = require('vm');

console.log('=== RUNNING CHAPTER 1 COMIC STRIP BACKGROUND AUDIO TESTS ===\n');

// ── Test 1: Verify audio files on disk ──
console.log('--- Test 1: Audio file existence & integrity ---');
const pathWithSpace = path.resolve('CyberZER0-main/assets/sounds/Chapter 1/Chapter1.wav');
const pathWithoutSpace = path.resolve('CyberZER0-main/assets/sounds/Chapter1/Chapter1.wav');

assert(fs.existsSync(pathWithSpace), 'Path with space (assets/sounds/Chapter 1/Chapter1.wav) must exist');
assert(fs.existsSync(pathWithoutSpace), 'Path without space (assets/sounds/Chapter1/Chapter1.wav) must exist');

const stat1 = fs.statSync(pathWithSpace);
const stat2 = fs.statSync(pathWithoutSpace);
assert(stat1.size > 5000000, 'Audio file size should be > 5MB');
assert.strictEqual(stat1.size, stat2.size, 'Both file paths should be identical in size');
console.log(`✓ Audio files verified: ${stat1.size} bytes (~30s PCM WAV)`);

// ── Test 2: Verify HTML tag in index.html ──
console.log('\n--- Test 2: HTML Audio Element in index.html ---');
const indexHtml = fs.readFileSync('CyberZER0-main/index.html', 'utf8');
assert(indexHtml.includes('id="comic-ch1-audio"'), 'index.html must include #comic-ch1-audio');
assert(indexHtml.includes('src="assets/sounds/Chapter 1/Chapter1.wav"'), 'index.html must reference assets/sounds/Chapter 1/Chapter1.wav');
assert(indexHtml.includes('assets/sounds/Chapter1/Chapter1.wav'), 'index.html must also include alternate path as fallback source');
console.log('✓ index.html contains properly configured <audio id="comic-ch1-audio"> with fallback source.');

// ── Test 3: ComicAudio engine simulation ──
console.log('\n--- Test 3: ComicAudio play, volume, and stop lifecycle ---');

// Mock browser DOM and Audio
class MockAudio {
  constructor(src) {
    this.src = src || '';
    this.id = '';
    this.loop = false;
    this.preload = '';
    this.volume = 1;
    this.currentTime = 0;
    this.paused = true;
    this._listeners = {};
  }
  addEventListener(event, fn) {
    if (!this._listeners[event]) this._listeners[event] = [];
    this._listeners[event].push(fn);
  }
  removeEventListener(event, fn) {
    if (!this._listeners[event]) return;
    this._listeners[event] = this._listeners[event].filter(f => f !== fn);
  }
  play() {
    this.paused = false;
    return Promise.resolve();
  }
  pause() {
    this.paused = true;
  }
  load() {}
}

const mockCh1Audio = new MockAudio('assets/sounds/Chapter 1/Chapter1.wav');
mockCh1Audio.id = 'comic-ch1-audio';

const mockMMAudio = new MockAudio('assets/sounds/Background.wav');
mockMMAudio.id = 'mm-bg-audio';
mockMMAudio.paused = false; // pretend main menu was playing

let mmMusicStopped = false;
const sandbox = {
  window: {},
  document: {
    getElementById(id) {
      if (id === 'comic-ch1-audio') return mockCh1Audio;
      if (id === 'mm-bg-audio') return mockMMAudio;
      return null;
    },
    addEventListener() {},
    removeEventListener() {}
  },
  Audio: MockAudio,
  AudioContext: class {
    constructor() { this.currentTime = 0; this.destination = {}; }
    createGain() { return { gain: { value: 0, setValueAtTime() {}, linearRampToValueAtTime() {}, cancelScheduledValues() {} }, connect() {}, disconnect() {} }; }
    createOscillator() { return { frequency: { value: 0 }, connect() {}, start() {}, stop() {} }; }
    createConvolver() { return { connect() {} }; }
    createBuffer() { return { getChannelData() { return new Float32Array(100); } }; }
  },
  AudioManager: {
    getSettings() {
      return { masterVolume: 80, sfxVolume: 80, masterMuted: false, sfxMuted: false };
    }
  },
  stopMMBgMusic: () => { mmMusicStopped = true; mockMMAudio.pause(); },
  console,
  setTimeout,
  clearTimeout,
  performance: { now: () => Date.now() },
  requestAnimationFrame: (cb) => setTimeout(cb, 16)
};
sandbox.window = sandbox;

const comicAudioCode = fs.readFileSync('CyberZER0-main/src/js/story/comic-audio.js', 'utf8');
vm.runInNewContext(comicAudioCode, sandbox);

const ComicAudio = sandbox.ComicAudio;
assert(ComicAudio, 'ComicAudio should be defined');

// Test play('ch1')
ComicAudio.play('ch1');
assert(mmMusicStopped, 'Starting Chapter 1 comic audio must stop Main Menu BGM to prevent overlap');
assert(mockMMAudio.paused, 'Main menu audio must be paused');
assert(!mockCh1Audio.paused, 'Chapter 1 comic audio must be playing');
assert(mockCh1Audio.loop, 'Chapter 1 comic audio must be set to loop throughout panels');
assert(mockCh1Audio.volume <= 0.45 && mockCh1Audio.volume >= 0.15, `Volume should be set to comfortable level so dialogue is clear (got ${mockCh1Audio.volume})`);
assert(ComicAudio.isPlaying('ch1'), 'ComicAudio.isPlaying("ch1") should return true while playing');
console.log(`✓ ComicAudio.play('ch1') started audio at comfortable volume (${mockCh1Audio.volume}) with loop=true.`);

// Test stop()
ComicAudio.stop();
assert(mockCh1Audio.paused, 'Chapter 1 audio must be paused after ComicAudio.stop()');
assert.strictEqual(mockCh1Audio.currentTime, 0, 'Audio currentTime should reset to 0');
assert(!ComicAudio.isPlaying('ch1'), 'ComicAudio.isPlaying("ch1") should return false after stop');
console.log('✓ ComicAudio.stop() paused audio and reset currentTime.');

// ── Test 4: Mute Settings Integration ──
console.log('\n--- Test 4: Volume mute handling ---');
sandbox.AudioManager.getSettings = () => ({ masterVolume: 80, sfxVolume: 80, masterMuted: true, sfxMuted: false });
ComicAudio.play('ch1');
assert.strictEqual(mockCh1Audio.volume, 0, 'Audio volume must be 0 when masterMuted is true');
ComicAudio.stop();
console.log('✓ Master mute properly silences comic audio.');

// ── Test 5: Comic Strip lifecycle in comic-strips.js ──
console.log('\n--- Test 5: comic-strips.js integration ---');
const comicStripsCode = fs.readFileSync('CyberZER0-main/src/js/story/comic-strips.js', 'utf8');
assert(comicStripsCode.includes("ComicAudio.play('ch1')"), 'showComicStrip must trigger ComicAudio.play("ch1")');
assert(comicStripsCode.includes("stopMMBgMusic()"), 'showComicStrip must stop Main Menu background music');
assert(comicStripsCode.includes("ComicAudio.stop()"), 'comicStripFinish must trigger ComicAudio.stop()');
assert(comicStripsCode.includes("stopChapter1ComicAudio"), 'Helper stopChapter1ComicAudio must be present');
console.log('✓ comic-strips.js verified for automatic start, continuous playback, and clean transition stop.');

// ── Test 6: Main Menu non-overlap verification ──
console.log('\n--- Test 6: main-menu.js non-overlap verification ---');
const mainMenuCode = fs.readFileSync('CyberZER0-main/src/js/ui/main-menu.js', 'utf8');
assert(mainMenuCode.includes("ComicAudio.stop()"), 'main-menu.js must stop ComicAudio to prevent overlap');
console.log('✓ main-menu.js guaranteed to prevent audio overlap.');

console.log('\n=== ALL CHAPTER 1 COMIC STRIP BACKGROUND AUDIO TESTS PASSED! ===\n');

