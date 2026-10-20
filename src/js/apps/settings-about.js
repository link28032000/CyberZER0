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

  const CIRC = 138.23; // 2π × 22

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
  const text = [
    'Device name:  CYBERZERO-PC',
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

