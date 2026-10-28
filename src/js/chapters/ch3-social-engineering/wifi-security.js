'use strict';

function startSocialEngineeringMission() {
  startGroup4Mission();
}


function startGroup4Mission() {
  // Reset state
  Object.assign(g4State, {
    stage: 1, wifiChoice: null, securedLaptop: false,
    fileSharingOff: false, deviceDiscoveryOff: false,
    miaAction: null, fileDecision: null,
    infectionInvestigated: false, wifiDisconnected: false,
    processKilled: false, scannerRan: false, score: 0
  });
  G4_SECURITY_SETTINGS.forEach(s => { s.state = true; });
  g4InfectionSymptoms = 0;
  if (g4InfectionTimer) { clearInterval(g4InfectionTimer); g4InfectionTimer = null; }

  gameState.phase = 'social_engineering';
  updateDesktopBackgroundForPhase('social_engineering');

  // Show Ch2-only column (it contains both Ch2 and Ch3 icons)
  document.querySelectorAll('.ch2-only').forEach(el => {
    el.style.setProperty('display', 'flex', 'important');
  });
  // Hide Ch2-not-Ch3 gaming icons (Steam, GTA6, Games) — Chapter 3 replaces them
  document.querySelectorAll('.ch2-not-ch3').forEach(el => {
    el.style.setProperty('display', 'none', 'important');
  });
  // Show Ch3-only social icons (Instagram, Pictures)
  document.querySelectorAll('.ch3-only').forEach(el => {
    el.style.setProperty('display', 'flex', 'important');
  });

  // Show desktop and open Wi-Fi Settings for Stage 1
  hideAllOverlays();
  showToast('📶 Stage 1: Open Wi-Fi Settings and inspect the available networks before connecting.', 'info');
  if (typeof initChapterMissionNotifications === 'function') initChapterMissionNotifications('social_engineering', true);
  setTimeout(() => {
    openApp('wifi-settings');
    renderG4WiFiSettings();
    const win = document.getElementById('win-wifi-settings');
    if (win) { win.style.left = '100px'; win.style.top = '60px'; win.style.width = '860px'; win.style.height = '580px'; }
    // Also open Phone app for context
    setTimeout(() => {
      renderPhoneLinkApp();
    }, 400);
  }, 300);
}

// ── STAGE 1: WI-FI SETTINGS ──────────────────────────────────

function renderG4WiFiSettings() {
  const list = document.getElementById('wifi-networks-settings-list');
  if (!list) return;

  const isHomeConn = networkSettings.wifi && !networkSettings.airplane && (networkSettings.currentSsid === 'HomeNetwork_5G');

  // Same available networks as taskbar panel: HomeNetwork_5G, PLDT-Home-5A3B, GLOBE_BROADBAND_2G, Free Wifi
  const homeNetwork = `
    <div class="wifi-net-item ${isHomeConn ? 'connected' : ''}" id="ws-wifi-item-cybernet" onclick="connectToWifi('HomeNetwork_5G')">
      <div class="wifi-net-icon"><img src="assets/icons/networks/wi-fi.svg" alt="Wi-Fi" style="width:20px;height:20px;"></div>
      <div class="wifi-net-details">
        <div class="wifi-net-name">HomeNetwork_5G</div>
        <div class="wifi-net-meta">${isHomeConn ? 'Connected' : ''}</div>
      </div>
      <button class="wifi-net-action-btn ${isHomeConn ? 'disconnect' : 'connect'}" onclick="event.stopPropagation(); connectToWifi('HomeNetwork_5G')">${isHomeConn ? 'Disconnect' : 'Connect'}</button>
    </div>
  `;

  const otherNetworks = [
    {
      id: 'coffeeshop_secure',
      name: 'PLDT-Home-5A3B',
      risk: 'low'
    },
    {
      id: 'sjshs_free',
      name: 'GLOBE_BROADBAND_2G',
      risk: 'high'
    },
    {
      id: 'coffeeshop_guest',
      name: 'Free Wifi',
      risk: 'high'
    }
  ];

  const scenarioNetworks = otherNetworks.map(net => {
    const isConn = networkSettings.wifi && !networkSettings.airplane && (networkSettings.currentSsid === net.name);
    return `
      <div class="wifi-net-item ${isConn ? 'connected' : ''} ${net.risk === 'high' ? 'warning-net' : ''}" onclick="connectToWifi('${net.name}')">
        <div class="wifi-net-icon"><img src="assets/icons/networks/wi-fi.svg" alt="Wi-Fi" style="width:20px;height:20px;"></div>
        <div class="wifi-net-details">
          <div class="wifi-net-name">${net.name}</div>
          <div class="wifi-net-meta">${isConn ? 'Connected' : ''}</div>
        </div>
        <button class="wifi-net-action-btn ${isConn ? 'disconnect' : 'connect'}" onclick="event.stopPropagation(); connectToWifi('${net.name}')">${isConn ? 'Disconnect' : 'Connect'}</button>
      </div>
    `;
  }).join('');

  list.innerHTML = homeNetwork + scenarioNetworks;
}

function g4SelectNetwork(netId) {
  g4SelectedNetwork = netId;
  renderG4WiFiSettings();
}

function g4InspectNetwork(netId) {
  const net = G4_WIFI_NETWORKS.find(n => n.id === netId);
  if (!net) return;
  g4SelectedNetwork = netId;
  renderG4WiFiSettings();

  const panel = document.getElementById('wifi-props-panel');
  if (!panel) return;
  panel.classList.remove('hidden');

  const signalBars = '●'.repeat(net.signal) + '<span style="opacity:0.25">' + '●'.repeat(4 - net.signal) + '</span>';

  panel.innerHTML = `
    <div class="wifi-props-header">
      <div class="wifi-props-icon">📶</div>
      <div>
        <div class="wifi-props-name">${net.name}</div>
        <div style="font-size:11px;color:var(--text-muted)">Network Properties</div>
      </div>
      <button class="btn-ghost btn-sm" onclick="document.getElementById('wifi-props-panel').classList.add('hidden')">✕ Close</button>
    </div>
    <div class="wifi-props-table">
      <div class="wifi-props-row"><span class="wifi-props-label">Network Name (SSID)</span><span class="wifi-props-val">${net.name}</span></div>
      <div class="wifi-props-row"><span class="wifi-props-label">Security</span><span class="wifi-props-val ${net.security === 'Open' ? 'text-danger' : 'text-safe'}">${net.security}</span></div>
      <div class="wifi-props-row"><span class="wifi-props-label">Password</span><span class="wifi-props-val ${net.password === 'None' ? 'text-danger' : 'text-safe'}">${net.password}</span></div>
      <div class="wifi-props-row"><span class="wifi-props-label">Device Visibility</span><span class="wifi-props-val">${net.deviceVisibility}</span></div>
      <div class="wifi-props-row"><span class="wifi-props-label">Signal Strength</span><span class="wifi-props-val">${signalBars}</span></div>
    </div>
    <div class="wifi-props-note ${net.risk === 'high' ? 'note-warning' : 'note-safe'}">
      ${net.risk === 'high' ? '⚠️' : '✓'} ${net.note}
    </div>
    <div class="wifi-props-actions">
      <button class="btn-ghost btn-sm" onclick="document.getElementById('wifi-props-panel').classList.add('hidden')">Cancel</button>
      <button class="btn-primary btn-sm" onclick="g4ConnectNetwork('${net.id}')">Connect to ${net.name}</button>
    </div>
  `;
}

function g4ConnectNetwork(netId) {
  const net = G4_WIFI_NETWORKS.find(n => n.id === netId);
  if (!net) return;
  g4State.wifiChoice = netId;
  networkSettings.currentSsid = net.name;
  updateNetworkUI();

  const panel = document.getElementById('wifi-props-panel');
  if (panel) {
    panel.classList.remove('hidden');
    panel.innerHTML = `
      <div style="text-align:center;padding:20px;display:flex;flex-direction:column;align-items:center;gap:12px;">
        <div style="font-size:32px">📶</div>
        <div style="font-weight:700;color:var(--text-primary)">Connected to ${net.name}</div>
        <div class="g4-status-badge" style="background:rgba(0,229,255,0.1);border:1px solid rgba(0,229,255,0.3);padding:8px 16px;border-radius:8px;font-size:12px;">
          <div>Status: <strong style="color:var(--accent-cyan)">Connected</strong></div>
          <div>Network Type: <strong style="color:${net.risk === 'high' ? 'var(--accent-orange)' : 'var(--accent-green)'}">Public${net.risk === 'high' ? ' (Open)' : ' (Secured)'}</strong></div>
        </div>
        <button class="btn-primary" onclick="g4ProceedToStage2()">Continue → Check Laptop Security</button>
      </div>
    `;
  }

  const wifiIcon = document.getElementById('tray-wifi-icon');
  if (wifiIcon) wifiIcon.innerHTML = `<img src="assets/icons/networks/wi-fi.svg" alt="Wi-Fi" style="width:18px;height:18px;vertical-align:middle;">`;

  if (net.risk === 'high') {
    showToast(`⚠️ Connected to ${net.name} — Open network. Check your security settings!`, 'warning');
  } else {
    showToast(`✓ Connected to ${net.name} — Password-protected network.`, 'success');
  }

  // Update phone signal
  const phoneSignal = document.getElementById('pl-phone-signal');
  if (phoneSignal) phoneSignal.textContent = '📶';
}

function g4ProceedToStage2() {
  g4State.stage = 2;
  closeApp('wifi-settings');
  setTimeout(() => {
    openApp('security-settings');
    renderG4SecuritySettings();
    const win = document.getElementById('win-security-settings');
    if (win) { win.style.left = '120px'; win.style.top = '70px'; win.style.width = '860px'; win.style.height = '580px'; }
    showToast('🛡️ Stage 2: Check your sharing settings. Disable unnecessary exposure on public networks.', 'info');
  }, 300);
}

// ── STAGE 2: SECURITY SETTINGS ───────────────────────────────

function renderG4SecuritySettings() {
  const list = document.getElementById('security-settings-list');
  if (!list) return;

  list.innerHTML = G4_SECURITY_SETTINGS.map(s => `
    <div class="g4-setting-row" id="g4-setting-${s.id}">
      <div class="g4-setting-icon">${s.icon}</div>
      <div class="g4-setting-info">
        <div class="g4-setting-name">${s.label}</div>
        <div class="g4-setting-hint">${s.hint}</div>
      </div>
      <div class="g4-toggle-wrap" onclick="g4ToggleSetting('${s.id}')">
        <div class="g4-toggle ${s.state ? 'on' : 'off'}" id="g4-toggle-${s.id}">
          <div class="g4-toggle-knob"></div>
        </div>
        <span class="g4-toggle-label" id="g4-tlabel-${s.id}">${s.state ? 'ON' : 'OFF'}</span>
      </div>
    </div>
  `).join('');
}

function g4ToggleSetting(settingId) {
  const setting = G4_SECURITY_SETTINGS.find(s => s.id === settingId);
  if (!setting) return;
  setting.state = !setting.state;

  const toggle = document.getElementById(`g4-toggle-${settingId}`);
  const label = document.getElementById(`g4-tlabel-${settingId}`);
  if (toggle) { toggle.classList.toggle('on', setting.state); toggle.classList.toggle('off', !setting.state); }
  if (label) label.textContent = setting.state ? 'ON' : 'OFF';

  // Track risky settings
  if (settingId === 'file_sharing') g4State.fileSharingOff = !setting.state;
  if (settingId === 'device_discovery') g4State.deviceDiscoveryOff = !setting.state;

  if (typeof AudioManager !== 'undefined') AudioManager.playClickSound();

  // Show feedback when both risky ones are disabled
  const bothDisabled = g4State.fileSharingOff && g4State.deviceDiscoveryOff;
  const feedback = document.getElementById('sec-feedback');
  const stageNav = document.getElementById('sec-stage-nav');

  if (bothDisabled && !g4State.securedLaptop) {
    g4State.securedLaptop = true;
    g4State.score += 100;
    if (feedback) {
      feedback.classList.remove('hidden');
      feedback.innerHTML = `
        <div class="g4-success-box">
          <span style="font-size:20px">✅</span>
          <div>
            <div style="font-weight:700;color:var(--accent-green)">Security Action Completed</div>
            <div style="font-size:12px;color:var(--text-secondary)">File Sharing and Device Discovery are now OFF. Device Protected.</div>
          </div>
        </div>
      `;
    }
    if (stageNav) stageNav.style.display = 'flex';
    showToast('✅ Laptop secured! File Sharing and Device Discovery disabled.', 'success');
  } else if (!bothDisabled && stageNav) {
    stageNav.style.display = 'none';
    if (feedback) {
      feedback.classList.remove('hidden');
      feedback.innerHTML = `<div class="g4-warning-box">⚠️ Some risky settings are still enabled. Disable File Sharing and Device Discovery to protect your laptop on a public network.</div>`;
    }
  }
}

function group4NextStage() {
  g4ProceedToStage3();
}

function g4ProceedToStage3() {
  g4State.stage = 3;
  closeApp('security-settings');
  showToast('💬 Stage 3: You received a new chat message. Open Phone Link to investigate.', 'info');
  setTimeout(() => {
    openApp('comms');
    renderPhoneLinkApp();
    const win = document.getElementById('win-comms');
    if (win) { win.style.left = '90px'; win.style.top = '50px'; win.style.width = '720px'; win.style.height = '500px'; }
    // Show Pia chat notification
    setTimeout(() => {
      showToast('📱 New message from "Pia — New Account". Open Phone Link to investigate.', 'warning');
      const badge = document.getElementById('pl-notif-badge');
      if (badge) badge.classList.add('hidden');
    }, 600);
  }, 300);
}
