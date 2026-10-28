'use strict';

// ── WINDOWS UPDATE — Full Windows 10 interactive state machine ───────────────

let _wuState = 'idle'; // idle | checking | paused

function wuSetRing(mode) {
  // mode: 'idle' | 'spin' | 'done' | 'paused'
  const ringFill = document.getElementById('wu-ring-fill');
  const ringSvg  = document.getElementById('wu-ring-svg');
  const ringPct  = document.getElementById('wu-ring-pct');
  const ringCheck = document.getElementById('wu-ring-check');
  const ringIcon  = document.getElementById('wu-ring-icon');
  if (!ringFill) return;

  if (mode === 'spin') {
    ringFill.classList.add('spin-anim');
    ringSvg && ringSvg.classList.add('spin');
    if (ringPct) ringPct.textContent = '';
    if (ringIcon) { ringIcon.classList.add('spinning'); ringIcon.classList.remove('hidden'); }
    if (ringCheck) ringCheck.classList.add('hidden');
  } else if (mode === 'paused') {
    ringFill.classList.remove('spin-anim');
    ringSvg && ringSvg.classList.remove('spin');
    ringFill.style.strokeDashoffset = 60;
    if (ringPct) ringPct.textContent = '⏸';
    if (ringIcon) ringIcon.classList.add('hidden');
    if (ringCheck) ringCheck.classList.add('hidden');
  } else {
    // done or idle
    ringFill.classList.remove('spin-anim');
    ringSvg && ringSvg.classList.remove('spin');
    ringFill.style.strokeDashoffset = 0;
    if (ringPct) ringPct.textContent = '';
    if (ringIcon) ringIcon.classList.add('hidden');
    if (ringCheck) ringCheck.classList.remove('hidden');
  }
}

function wuSetHeader(title, sub) {
  const t = document.getElementById('wu-main-status');
  const s = document.getElementById('wu-sub-status');
  if (t) t.textContent = title;
  if (s) s.textContent = sub;
}

function wuCheckForUpdates() {
  if (_wuState === 'checking') return;
  _wuState = 'checking';

  const btn = document.getElementById('wu-btn-main');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<svg class="spin-anim" width="14" height="14" viewBox="0 0 24 24" fill="none" style="flex-shrink:0"><path d="M23 4v6h-6M1 20v-6h6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 0 1 3.51 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> Checking for updates…`;
  }

  wuSetRing('spin');
  wuSetHeader('Checking for updates…', 'Looking for the latest security and quality updates for your PC.');

  setTimeout(() => {
    _wuState = 'idle';
    wuSetRing('done');
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    wuSetHeader("✓ You're up to date", `Last checked: Today, ${timeStr}`);

    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" style="flex-shrink:0"><path d="M23 4v6h-6M1 20v-6h6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 0 1 3.51 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> Check for updates`;
    }
    showToast("🔄 Windows Update: You're up to date. No new updates available.", 'success');
  }, 2200);
}

function wuPauseUpdates(btn) {
  if (_wuState === 'paused') {
    _wuState = 'idle';
    wuSetRing('done');
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    wuSetHeader("✓ You're up to date", `Last checked: Today, ${timeStr}`);
    if (btn) btn.textContent = 'Pause updates for 7 days';
    showToast('▶️ Windows Update resumed.', 'info');
  } else {
    _wuState = 'paused';
    wuSetRing('paused');
    wuSetHeader('Updates paused', 'Updates will resume in 7 days. You can resume at any time.');
    if (btn) btn.textContent = 'Resume updates';
    showToast('⏸️ Windows Update paused for 7 days.', 'info');
  }
}

function wuToggleHistory() {
  const panel   = document.getElementById('wu-history-panel');
  const toggle  = document.getElementById('wu-history-toggle');
  if (!panel) return;
  const isHidden = panel.classList.toggle('hidden');
  if (toggle) toggle.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" id="wu-hist-chevron"><polyline points="${isHidden ? '6,9 12,15 18,9' : '6,15 12,9 18,15'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> ${isHidden ? 'Show' : 'Hide'}`;
}

// ── SYSTEM SETTINGS INTERACTIVE TOGGLES & DEVICE PROFILE ─────────────────────

const systemSettingsState = {
  nightLight: false,
  scaleIndex: 2, // 150% (Recommended)
  speakerMuted: false,
  microphone: true,
  batterySaver: false,
  sleepIndex: 1, // 30 minutes
  location: true,
  camera: true,
  privacyMic: true,
  firewall: true,
  smartScreen: false
};

const _SCALE_OPTIONS = [
  '100%',
  '125%',
  '150% (Recommended)',
  '175%'
];

const _SLEEP_OPTIONS = [
  '15 minutes',
  '30 minutes',
  '1 hour',
  'Never'
];

function getSettingsDeviceName() {
  const curCatId = window._currentChapterCategory || (typeof activeCategoryStory !== 'undefined' ? activeCategoryStory : null) || (typeof gameState !== 'undefined' ? gameState.phase : null) || 'phishing';
  const foundCat = (typeof CATEGORIES !== 'undefined' && CATEGORIES.find(c => c.id === curCatId));
  const currentChar = (foundCat && foundCat.character) ? foundCat.character : (window._currentChapterCharacter || { name: 'Alex' });
  const charName = (currentChar && currentChar.name) ? currentChar.name : 'Alex';
  return `${charName} PC`;
}

function updateSettingsAboutDeviceName() {
  const devName = getSettingsDeviceName();
  const heroNameEl = document.getElementById('about10-pc-name-display') || document.querySelector('.about10-pc-name');
  if (heroNameEl) heroNameEl.textContent = devName;
  const specNameEl = document.getElementById('abt-devname');
  if (specNameEl) specNameEl.textContent = devName;
}

function applySettingsToggleBtnStyle(btn, isOn) {
  if (!btn) return;
  btn.textContent = isOn ? 'Turn Off' : 'Turn On';
  btn.style.background = isOn ? 'rgba(56,189,248,0.15)' : 'rgba(255,255,255,0.08)';
  btn.style.borderColor = isOn ? 'rgba(56,189,248,0.4)' : 'rgba(255,255,255,0.15)';
  btn.style.color = isOn ? '#38bdf8' : 'var(--text-secondary)';
}

// Display: Night Light
function wsToggleNightLight() {
  systemSettingsState.nightLight = !systemSettingsState.nightLight;
  const isOn = systemSettingsState.nightLight;
  const btn = document.getElementById('ws-nightlight-btn');
  const label = document.getElementById('ws-nightlight-label');
  applySettingsToggleBtnStyle(btn, isOn);
  if (label) {
    label.textContent = isOn ? 'On — Warmer colors reduce eye strain' : 'Off — Reduces blue light in the evening';
    label.style.color = isOn ? '#38bdf8' : 'var(--text-muted)';
  }
  document.body.classList.toggle('night-light-active', isOn);
  if (typeof AudioManager !== 'undefined') AudioManager.playMouseClick();
  showToast(isOn ? '🌙 Night Light turned On.' : '☀️ Night Light turned Off.', 'info');
}

// Display: Scale
function wsToggleScale() {
  systemSettingsState.scaleIndex = (systemSettingsState.scaleIndex + 1) % _SCALE_OPTIONS.length;
  const scale = _SCALE_OPTIONS[systemSettingsState.scaleIndex];
  const label = document.getElementById('ws-scale-label');
  const btn = document.getElementById('ws-scale-btn');
  if (label) label.textContent = `Change the size of text and apps: ${scale}`;
  if (btn) btn.textContent = scale.split(' ')[0];
  if (typeof AudioManager !== 'undefined') AudioManager.playMouseClick();
  showToast(`📐 Display scale set to ${scale}.`, 'info');
}

// Sound: Speakers
function wsToggleSpeakers() {
  systemSettingsState.speakerMuted = !systemSettingsState.speakerMuted;
  const isMuted = systemSettingsState.speakerMuted;
  const btn = document.getElementById('ws-speakers-btn');
  const label = document.getElementById('ws-speakers-label');
  applySettingsToggleBtnStyle(btn, !isMuted);
  if (label) {
    label.textContent = isMuted ? 'Off — Speakers are muted' : 'On — Realtek HD Audio (Speakers)';
    label.style.color = isMuted ? '#fb923c' : 'var(--text-muted)';
  }
  if (typeof AudioManager !== 'undefined') {
    if (typeof AudioManager.setMuted === 'function') {
      AudioManager.setMuted(isMuted);
    } else {
      AudioManager.playMouseClick();
    }
  }
  showToast(isMuted ? '🔇 Speakers turned Off (Muted).' : '🔊 Speakers turned On.', isMuted ? 'warning' : 'info');
}

// Sound: Microphone
function wsToggleMicrophone() {
  systemSettingsState.microphone = !systemSettingsState.microphone;
  const isOn = systemSettingsState.microphone;
  const btn = document.getElementById('ws-mic-btn');
  const label = document.getElementById('ws-mic-label');
  applySettingsToggleBtnStyle(btn, isOn);
  if (label) {
    label.textContent = isOn ? 'On — Internal Microphone active' : 'Off — Microphone is disabled';
    label.style.color = isOn ? 'var(--text-muted)' : '#fb923c';
  }
  if (typeof AudioManager !== 'undefined') AudioManager.playMouseClick();
  showToast(isOn ? '🎤 Microphone turned On.' : '🎤 Microphone turned Off.', isOn ? 'info' : 'warning');
}

// Power: Battery Saver
function wsToggleBatterySaver() {
  systemSettingsState.batterySaver = !systemSettingsState.batterySaver;
  const isOn = systemSettingsState.batterySaver;
  const btn = document.getElementById('ws-battery-btn');
  const label = document.getElementById('ws-battery-label');
  applySettingsToggleBtnStyle(btn, isOn);
  if (label) {
    label.textContent = isOn ? 'On — Conserving battery life & background sync' : 'Off — Turns on automatically at 20%';
    label.style.color = isOn ? '#38bdf8' : 'var(--text-muted)';
  }
  if (typeof AudioManager !== 'undefined') AudioManager.playMouseClick();
  showToast(isOn ? '🔋 Battery Saver turned On.' : '🔋 Battery Saver turned Off.', 'info');
}

// Power: Sleep Timer
function wsToggleSleepTimer() {
  systemSettingsState.sleepIndex = (systemSettingsState.sleepIndex + 1) % _SLEEP_OPTIONS.length;
  const sleepTime = _SLEEP_OPTIONS[systemSettingsState.sleepIndex];
  const label = document.getElementById('ws-sleep-label');
  const btn = document.getElementById('ws-sleep-btn');
  if (label) label.textContent = `When plugged in: ${sleepTime}`;
  if (btn) btn.textContent = `Change (${sleepTime})`;
  if (typeof AudioManager !== 'undefined') AudioManager.playMouseClick();
  showToast(`⚡ Screen sleep timer set to ${sleepTime}.`, 'info');
}

// Privacy: Location / Camera / Microphone
function wsTogglePrivacy(type) {
  let isOn;
  let btnId;
  let labelId;
  let onText;
  let offText;
  let icon;

  if (type === 'location') {
    systemSettingsState.location = !systemSettingsState.location;
    isOn = systemSettingsState.location;
    btnId = 'ws-priv-location-btn';
    labelId = 'ws-priv-location-label';
    onText = 'On — Apps can access your location';
    offText = 'Off — Location access blocked';
    icon = '📍 Location';
  } else if (type === 'camera') {
    systemSettingsState.camera = !systemSettingsState.camera;
    isOn = systemSettingsState.camera;
    btnId = 'ws-priv-camera-btn';
    labelId = 'ws-priv-camera-label';
    onText = 'On — Apps can use your camera';
    offText = 'Off — Camera access blocked';
    icon = '📷 Camera';
  } else if (type === 'microphone') {
    systemSettingsState.privacyMic = !systemSettingsState.privacyMic;
    isOn = systemSettingsState.privacyMic;
    btnId = 'ws-priv-microphone-btn';
    labelId = 'ws-priv-microphone-label';
    onText = 'On — Apps can use your microphone';
    offText = 'Off — Microphone access blocked';
    icon = '🎤 Microphone';
  }

  const btn = document.getElementById(btnId);
  const label = document.getElementById(labelId);
  applySettingsToggleBtnStyle(btn, isOn);
  if (label) {
    label.textContent = isOn ? onText : offText;
    label.style.color = isOn ? 'var(--text-muted)' : '#fb923c';
  }
  if (typeof AudioManager !== 'undefined') AudioManager.playMouseClick();
  showToast(isOn ? `${icon} turned On.` : `${icon} turned Off.`, isOn ? 'info' : 'warning');
}

// Security: Windows Firewall
function wsToggleFirewall() {
  systemSettingsState.firewall = !systemSettingsState.firewall;
  const isOn = systemSettingsState.firewall;
  const btn = document.getElementById('ws-firewall-btn');
  const label = document.getElementById('ws-firewall-label');
  applySettingsToggleBtnStyle(btn, isOn);
  if (label) {
    label.textContent = isOn ? '✓ Active on all networks' : '⚠️ Firewall is turned off — Device is vulnerable';
    label.style.color = isOn ? '#4ade80' : '#fb923c';
  }
  if (typeof AudioManager !== 'undefined') AudioManager.playMouseClick();
  showToast(isOn ? '🛡️ Windows Firewall turned On.' : '⚠️ Windows Firewall turned Off.', isOn ? 'success' : 'warning');
}

// Security: SmartScreen
function wsToggleSmartScreen() {
  systemSettingsState.smartScreen = !systemSettingsState.smartScreen;
  const isOn = systemSettingsState.smartScreen;
  const btn = document.getElementById('ws-smartscreen-btn');
  const label = document.getElementById('ws-smartscreen-label');
  applySettingsToggleBtnStyle(btn, isOn);
  if (label) {
    label.textContent = isOn ? '✓ SmartScreen is active and protecting your PC' : '⚠️ SmartScreen is off — Warnings suspended';
    label.style.color = isOn ? '#4ade80' : '#fb923c';
  }
  if (typeof AudioManager !== 'undefined') AudioManager.playMouseClick();
  showToast(isOn ? '🛡️ SmartScreen turned On.' : '⚠️ SmartScreen turned Off.', isOn ? 'success' : 'warning');
}

// ── ABOUT page — copy helpers ────────────────────────────────────────────────

function aboutCopyWinSpecs(btn) {
  const text = [
    'Edition:      Windows 10 Pro',
    'Version:      22H2',
    'Installed on: 3/15/2026',
    'OS build:     19045.3803',
    'Experience:   Windows Feature Experience Pack 1000.19041.1000.0'
  ].join('\n');
  _aboutCopy(btn, text);
}

function aboutCopyDevSpecs(btn) {
  const devName = getSettingsDeviceName();
  const text = [
    `Device name:  ${devName}`,
    'Processor:    Intel(R) Core(TM) i5-1235U CPU @ 1.30GHz',
    'RAM:          8.00 GB (7.79 GB usable)',
    'Device ID:    A3F2-7B14-C901-D487-9EFA-2C10-B847',
    'Product ID:   00330-80000-00000-AA579',
    'System type:  64-bit operating system, x64-based processor'
  ].join('\n');
  _aboutCopy(btn, text);
}

function _aboutCopy(btn, text) {
  try {
    navigator.clipboard.writeText(text).then(() => {
      if (btn) { btn.classList.add('copied'); btn.innerHTML = btn.innerHTML.replace('Copy', '✓ Copied'); }
      showToast('📋 System info copied to clipboard!', 'success');
      setTimeout(() => {
        if (btn) { btn.classList.remove('copied'); btn.innerHTML = btn.innerHTML.replace('✓ Copied', 'Copy'); }
      }, 2000);
    });
  } catch(e) {
    showToast('📋 Copy: ' + text.substring(0, 60) + '…', 'info');
  }
}

// Auto-sync device name on load
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateSettingsAboutDeviceName);
  } else {
    updateSettingsAboutDeviceName();
  }
}
