'use strict';

// ═══════════════════════════════════════════════════════════
// NETWORK & QUICK SETTINGS FLYOUT CONTROLS
// ═══════════════════════════════════════════════════════════

let networkSettings = {
  wifi: true,
  bluetooth: true,
  airplane: false,
  guard: true,
  currentSsid: 'HomeNetwork_5G',
  noInternet: false   // wifi ON but no internet access (shows warning badge icon)
};

/**
 * Set the "WiFi connected but no internet" state.
 * Usage: setWifiNoInternet(true)  → shows warning icon in taskbar tray
 *        setWifiNoInternet(false) → restores normal WiFi icon
 */
function setWifiNoInternet(state) {
  networkSettings.noInternet = !!state;
  if (typeof updateNetworkUI === 'function') updateNetworkUI();
}

function toggleNetworkFlyout(event) {
  if (event) event.stopPropagation();
  if (typeof AudioManager !== 'undefined') AudioManager.unlock();
  const flyout = document.getElementById('desktop-network-flyout');
  const trayBtn = document.getElementById('tray-wifi-btn');
  if (!flyout) return;

  const isHidden = flyout.classList.contains('hidden');
  if (isHidden) {
    closeVolumeFlyout();
    closeCalendarFlyout();
    const startMenu = document.getElementById('desktop-start-menu');
    if (startMenu && !startMenu.classList.contains('hidden')) toggleStartMenu();

    flyout.classList.remove('hidden');
    if (trayBtn) trayBtn.classList.add('active');
    updateNetworkUI();
    if (typeof AudioManager !== 'undefined') AudioManager.playMouseClick();
  } else {
    closeNetworkFlyout();
  }
}

function closeNetworkFlyout(event) {
  if (event) event.stopPropagation();
  const flyout = document.getElementById('desktop-network-flyout');
  const trayBtn = document.getElementById('tray-wifi-btn');
  if (flyout) flyout.classList.add('hidden');
  if (trayBtn) trayBtn.classList.remove('active');
}

function openWifiSettingsFromFlyout(event) {
  if (event) event.stopPropagation();
  closeNetworkFlyout();
  openApp('wifi-settings');
  renderG4WiFiSettings();
  switchWifiSettingsTab('wifi');
  showToast('⚙️ Opened Wi-Fi Settings.', 'info');
}

// ── WIFI SETTINGS WINDOW TAB SWITCHING ──────────────────────────────────────

function switchWifiSettingsTab(tab) {
  const tabs = ['wifi', 'bluetooth', 'airplane', 'display', 'sound', 'power', 'privacy', 'firewall', 'winupdate', 'about'];
  tabs.forEach(t => {
    const tabEl = document.getElementById('wstab-' + t);
    const navEl = document.getElementById('wsnav-' + t);
    if (tabEl) {
      if (t === tab) {
        tabEl.classList.remove('hidden-init');
        tabEl.style.display = 'block';
      } else {
        tabEl.style.display = 'none';
      }
    }
    if (navEl) {
      navEl.classList.toggle('active', t === tab);
    }
  });
  // Update window title bar to reflect active section
  const titleMap = {
    wifi: 'Settings \u2014 Network & Internet \u2014 Wi-Fi',
    bluetooth: 'Settings \u2014 Network & Internet \u2014 Bluetooth',
    airplane: 'Settings \u2014 Network & Internet \u2014 Airplane Mode',
    display: 'Settings \u2014 System \u2014 Display',
    sound: 'Settings \u2014 System \u2014 Sound',
    power: 'Settings \u2014 System \u2014 Power & Sleep',
    privacy: 'Settings \u2014 Privacy & Security',
    firewall: 'Settings \u2014 Privacy & Security \u2014 Windows Security',
    winupdate: 'Settings \u2014 Windows Update',
    about: 'Settings \u2014 System \u2014 About'
  };
  const titleEl = document.querySelector('#titlebar-wifi-settings .win-title span:last-child');
  if (titleEl && titleMap[tab]) titleEl.textContent = titleMap[tab];
  // Sync tab states with current networkSettings
  if (tab === 'wifi') wsUpdateWifiTab();
  if (tab === 'airplane') wsUpdateAirplaneTab();
  if (tab === 'bluetooth') wsUpdateBluetoothTab();
  if (typeof updateSettingsAboutDeviceName === 'function') updateSettingsAboutDeviceName();
}

function wsUpdateWifiTab() {
  const label = document.getElementById('ws-wifi-state-label');
  const btn = document.getElementById('ws-wifi-toggle-btn');
  const list = document.getElementById('wifi-networks-settings-list');
  const isOn = networkSettings.wifi && !networkSettings.airplane;

  if (label) {
    if (networkSettings.airplane) {
      label.textContent = 'Disabled by Airplane Mode';
      label.style.color = '#fb923c';
    } else if (isOn) {
      label.textContent = 'On';
      label.style.color = 'var(--text-muted)';
    } else {
      label.textContent = 'Off';
      label.style.color = 'var(--text-muted)';
    }
  }

  if (btn) {
    btn.textContent = isOn ? 'Turn Off' : 'Turn On';
    btn.style.background = isOn ? 'rgba(56,189,248,0.15)' : 'rgba(255,255,255,0.08)';
    btn.style.borderColor = isOn ? 'rgba(56,189,248,0.4)' : 'rgba(255,255,255,0.15)';
    btn.style.color = isOn ? '#38bdf8' : 'var(--text-secondary)';
  }

  if (list) {
    list.style.opacity = isOn ? '1' : '0.35';
    list.style.pointerEvents = isOn ? 'auto' : 'none';
  }
}

function wsToggleWifi() {
  toggleWifiSetting();
}

function wsUpdateBluetoothTab() {
  const label = document.getElementById('ws-bt-state-label');
  const btn = document.getElementById('ws-bt-toggle-btn');
  const isOn = networkSettings.bluetooth;
  if (label) label.textContent = isOn ? 'On — Mobile Phone connected' : 'Off — No devices connected';
  if (btn) {
    btn.textContent = isOn ? 'Turn Off' : 'Turn On';
    btn.style.background = isOn ? 'rgba(56,189,248,0.15)' : 'rgba(255,255,255,0.08)';
    btn.style.borderColor = isOn ? 'rgba(56,189,248,0.4)' : 'rgba(255,255,255,0.15)';
    btn.style.color = isOn ? '#38bdf8' : 'var(--text-secondary)';
  }

  // Update paired phone status based on Bluetooth state
  const devStatus = document.querySelector('#wstab-bluetooth .bt-device-status-connected, #wstab-bluetooth .bt-device-status-muted');
  const devBtn = document.querySelector('#wstab-bluetooth .bt-btn-connected, #wstab-bluetooth .bt-btn-pair');
  if (devStatus && devBtn) {
    if (isOn) {
      devStatus.className = 'bt-device-status-connected';
      devStatus.textContent = 'Connected • Paired phone';
      devBtn.className = 'bt-btn-connected';
      devBtn.textContent = 'Connected';
      devBtn.setAttribute('onclick', "showToast('📱 Mobile Phone is already connected.','info')");
    } else {
      devStatus.className = 'bt-device-status-muted';
      devStatus.textContent = 'Paired • Bluetooth is off';
      devBtn.className = 'bt-btn-pair';
      devBtn.textContent = 'Disconnected';
      devBtn.setAttribute('onclick', "showToast('📡 Turn on Bluetooth to connect your phone.','warning')");
    }
  }
}

function wsToggleBluetooth() {
  if (networkSettings.airplane) {
    showToast('✈️ Turn off Airplane Mode first to enable Bluetooth.', 'warning');
    return;
  }
  networkSettings.bluetooth = !networkSettings.bluetooth;
  updateNetworkUI();
  if (typeof AudioManager !== 'undefined') AudioManager.playMouseClick();
  showToast(networkSettings.bluetooth ? '📡 Bluetooth On • Mobile Phone Connected.' : '📡 Bluetooth Off.', networkSettings.bluetooth ? 'success' : 'info');
  wsUpdateBluetoothTab();
}

function wsUpdateAirplaneTab() {
  const label = document.getElementById('ws-air-state-label');
  const btn = document.getElementById('ws-air-toggle-btn');
  const wifiStatus = document.getElementById('ws-air-wifi-status');
  const btStatus = document.getElementById('ws-air-bt-status');
  const isOn = networkSettings.airplane;
  if (label) {
    label.textContent = isOn ? 'On — All wireless transmitters suspended' : 'Off — All wireless transmitters active';
    label.style.color = isOn ? '#fb923c' : '#94a3b8';
  }
  if (btn) {
    btn.textContent = isOn ? 'Turn Off' : 'Turn On';
    btn.style.background = isOn ? 'rgba(251,146,60,0.2)' : 'rgba(56,189,248,0.15)';
    btn.style.borderColor = isOn ? '#fb923c' : '#38bdf8';
    btn.style.color = isOn ? '#ffedd5' : '#e0f2fe';
  }
  if (wifiStatus) {
    const isWifiActive = networkSettings.wifi && !isOn;
    wifiStatus.textContent = isOn ? 'Suspended' : (networkSettings.wifi ? 'Active' : 'Disabled');
    wifiStatus.style.color = isWifiActive ? '#4ade80' : '#fb923c';
    wifiStatus.style.background = isWifiActive ? 'rgba(74,222,128,0.12)' : 'rgba(251,146,60,0.15)';
    wifiStatus.style.borderColor = isWifiActive ? 'rgba(74,222,128,0.3)' : 'rgba(251,146,60,0.4)';
  }
  if (btStatus) {
    const isBtActive = networkSettings.bluetooth && !isOn;
    btStatus.textContent = isOn ? 'Suspended' : (networkSettings.bluetooth ? 'Active' : 'Disabled');
    btStatus.style.color = isBtActive ? '#4ade80' : '#fb923c';
    btStatus.style.background = isBtActive ? 'rgba(74,222,128,0.12)' : 'rgba(251,146,60,0.15)';
    btStatus.style.borderColor = isBtActive ? 'rgba(74,222,128,0.3)' : 'rgba(251,146,60,0.4)';
  }
}

function wsToggleAirplane() {
  networkSettings.airplane = !networkSettings.airplane;
  updateNetworkUI();
  if (typeof AudioManager !== 'undefined') AudioManager.playMouseClick();
  showToast(networkSettings.airplane ? '✈️ Airplane Mode Activated — Wireless transmitters suspended.' : '✈️ Airplane Mode Disabled — Wireless restored.', networkSettings.airplane ? 'warning' : 'success');
  wsUpdateAirplaneTab();
}

function updateNetworkUI() {
  const tileWifi = document.getElementById('tile-wifi');
  const tileWifiStatus = document.getElementById('tile-wifi-status');
  const tileWifiBadge = document.getElementById('tile-wifi-badge');
  const trayWifiIcon = document.getElementById('tray-wifi-icon');
  const trayWifiBtn = document.getElementById('tray-wifi-btn');
  if (trayWifiBtn) trayWifiBtn.title = '📶 Wi-Fi, Bluetooth & Quick Settings';
  const wifiList = document.getElementById('wifi-networks-list');

  const tileBt = document.getElementById('tile-bluetooth');
  const tileBtStatus = document.getElementById('tile-bt-status');
  const tileBtBadge = document.getElementById('tile-bt-badge');

  const tileAir = document.getElementById('tile-airplane');
  const tileAirStatus = document.getElementById('tile-airplane-status');
  const tileAirBadge = document.getElementById('tile-airplane-badge');

  const tileGuard = document.getElementById('tile-guard');
  const tileGuardStatus = document.getElementById('tile-guard-status');
  const tileGuardBadge = document.getElementById('tile-guard-badge');

  if (networkSettings.airplane) {
    if (trayWifiIcon) trayWifiIcon.innerHTML = '<img src="assets/icons/networks/airlane mode.svg" alt="Airplane Mode" style="width:18px;height:18px;vertical-align:middle;">';
    if (tileAir) tileAir.classList.add('active');
    if (tileAirStatus) tileAirStatus.textContent = 'On';
    if (tileAirBadge) tileAirBadge.textContent = 'ON';

    if (tileWifi) tileWifi.classList.remove('active');
    if (tileWifiStatus) tileWifiStatus.textContent = 'Off';
    if (tileWifiBadge) tileWifiBadge.textContent = 'OFF';

    if (tileBt) tileBt.classList.remove('active');
    if (tileBtStatus) tileBtStatus.textContent = 'Off';
    if (tileBtBadge) tileBtBadge.textContent = 'OFF';

    if (wifiList) {
      wifiList.style.opacity = '0.35';
      wifiList.style.pointerEvents = 'none';
    }
    wsUpdateWifiTab();
    wsUpdateAirplaneTab();
    wsUpdateBluetoothTab();
    if (typeof updatePhoneLinkConnectionState === 'function') {
      updatePhoneLinkConnectionState();
    }
    return;
  }

  // Airplane is OFF
  if (tileAir) tileAir.classList.remove('active');
  if (tileAirStatus) tileAirStatus.textContent = 'Off';
  if (tileAirBadge) tileAirBadge.textContent = 'OFF';

  // Wi-Fi
  if (networkSettings.wifi) {
    // Determine connection quality: connected to an SSID AND internet reachable
    const isConnected = !!networkSettings.currentSsid;
    const hasInternet  = isConnected && !networkSettings.noInternet;

    if (hasInternet) {
      // Fully connected with internet — normal WiFi icon
      if (trayWifiIcon) trayWifiIcon.innerHTML = '<img src="assets/icons/networks/wi-fi.svg" alt="Wi-Fi" class="taskbar-icon-img" style="width:18px;height:18px;vertical-align:middle;" title="Connected">';
      if (tileWifiStatus) tileWifiStatus.textContent = 'On';
      if (tileWifiBadge) tileWifiBadge.textContent = 'ON';
    } else {
      // WiFi ON but not connected to any network, OR connected but no internet
      if (trayWifiIcon) trayWifiIcon.innerHTML = '<img src="assets/icons/networks/no_internet.svg" alt="No Internet" class="taskbar-icon-img" style="width:18px;height:18px;vertical-align:middle;" title="Wi-Fi on — no internet access">';
      if (tileWifiStatus) tileWifiStatus.textContent = isConnected ? 'No Internet' : 'Not Connected';
      if (tileWifiBadge) tileWifiBadge.textContent = 'LIMITED';
    }
    if (tileWifi) tileWifi.classList.add('active');
    if (wifiList) {
      wifiList.style.opacity = '1';
      wifiList.style.pointerEvents = 'auto';
    }
  } else {
    // WiFi switched OFF entirely
    if (trayWifiIcon) trayWifiIcon.innerHTML = '<img src="assets/icons/networks/wi-fi_off.svg" alt="No Wi-Fi" class="taskbar-icon-img" style="width:18px;height:18px;vertical-align:middle;" title="Wi-Fi off">';
    if (tileWifi) tileWifi.classList.remove('active');
    if (tileWifiStatus) tileWifiStatus.textContent = 'Off';
    if (tileWifiBadge) tileWifiBadge.textContent = 'OFF';
    if (wifiList) {
      wifiList.style.opacity = '0.35';
      wifiList.style.pointerEvents = 'none';
    }
  }

  // Bluetooth
  if (networkSettings.bluetooth) {
    if (tileBt) tileBt.classList.add('active');
    if (tileBtStatus) tileBtStatus.textContent = 'On';
    if (tileBtBadge) tileBtBadge.textContent = 'ON';
  } else {
    if (tileBt) tileBt.classList.remove('active');
    if (tileBtStatus) tileBtStatus.textContent = 'Off';
    if (tileBtBadge) tileBtBadge.textContent = 'OFF';
  }

  // Guard
  if (networkSettings.guard) {
    if (tileGuard) tileGuard.classList.add('active');
    if (tileGuardStatus) tileGuardStatus.textContent = 'Secured';
    if (tileGuardBadge) tileGuardBadge.textContent = 'ON';
  } else {
    if (tileGuard) tileGuard.classList.remove('active');
    if (tileGuardStatus) tileGuardStatus.textContent = 'Paused';
    if (tileGuardBadge) tileGuardBadge.textContent = 'OFF';
  }

  // Anti-Virus Quick Tile
  const tileAv = document.getElementById('tile-antivirus');
  const tileAvStatus = document.getElementById('tile-antivirus-status');
  const tileAvBadge = document.getElementById('tile-antivirus-badge');
  if (tileAv) {
    if (gameState.antivirusProtection) {
      tileAv.classList.add('active');
      if (tileAvStatus) tileAvStatus.textContent = 'On';
      if (tileAvBadge) tileAvBadge.textContent = 'ON';
    } else {
      tileAv.classList.remove('active');
      if (tileAvStatus) tileAvStatus.textContent = 'Off';
      if (tileAvBadge) tileAvBadge.textContent = 'OFF';
    }
  }

  // Live sync open browser with network status
  if (typeof appState !== 'undefined' && appState.browser && appState.browser.open) {
    if (typeof renderActiveTab === 'function') {
      renderActiveTab();
    }
  }

  // Live sync flyout Wi-Fi list items
  updateFlyoutWifiList();

  // Live sync Settings window tabs with current network state
  wsUpdateWifiTab();
  wsUpdateAirplaneTab();
  wsUpdateBluetoothTab();

  // Live sync Phone Link connection status
  if (typeof updatePhoneLinkConnectionState === 'function') {
    updatePhoneLinkConnectionState();
  }
}

function toggleWifiSetting() {
  if (networkSettings.airplane) {
    showToast('✈️ Turn off Airplane Mode first to enable Wi-Fi.', 'warning');
    return;
  }
  networkSettings.wifi = !networkSettings.wifi;
  updateNetworkUI();
  if (typeof AudioManager !== 'undefined') AudioManager.playMouseClick();
  showToast(networkSettings.wifi ? '📶 Wi-Fi turned On.' : '📶 Wi-Fi turned Off.', networkSettings.wifi ? 'success' : 'info');
}

function toggleBluetoothSetting() {
  if (networkSettings.airplane) {
    showToast('✈️ Turn off Airplane Mode first to enable Bluetooth.', 'warning');
    return;
  }
  networkSettings.bluetooth = !networkSettings.bluetooth;
  updateNetworkUI();
  if (typeof AudioManager !== 'undefined') AudioManager.playMouseClick();
  showToast(networkSettings.bluetooth ? '📡 Bluetooth On • Mobile Phone Connected.' : '📡 Bluetooth Off.', networkSettings.bluetooth ? 'success' : 'info');
}

function toggleAirplaneSetting() {
  networkSettings.airplane = !networkSettings.airplane;
  updateNetworkUI();
  if (typeof AudioManager !== 'undefined') AudioManager.playMouseClick();
  showToast(networkSettings.airplane ? '✈️ Airplane Mode Activated — Wireless transmitters suspended.' : '✈️ Airplane Mode Disabled — Wireless restored.', networkSettings.airplane ? 'warning' : 'success');
}

function toggleAntiVirusSetting() {
  if (typeof AudioManager !== 'undefined') AudioManager.playMouseClick();
  toggleAntiVirusProtection();
}

function toggleGuardSetting() {
  networkSettings.guard = !networkSettings.guard;
  updateNetworkUI();
  if (typeof AudioManager !== 'undefined') AudioManager.playMouseClick();
  showToast(networkSettings.guard ? '🛡️ Cyber Defense Shield Active.' : '⚠️ Cyber Defense Shield Paused.', networkSettings.guard ? 'success' : 'warning');
}

function updateFlyoutWifiList() {
  const list = document.getElementById('wifi-networks-list');
  if (list) {
    const items = list.querySelectorAll('.wifi-net-item');
    items.forEach(item => {
      const nameEl = item.querySelector('.wifi-net-name');
      const btn = item.querySelector('.wifi-net-action-btn');
      const metaEl = item.querySelector('.wifi-net-meta');
      if (!nameEl || !btn) return;
      const name = nameEl.textContent.trim();
      const isCurrent = networkSettings.wifi && !networkSettings.airplane && (networkSettings.currentSsid === name);
      if (isCurrent) {
        item.classList.add('connected');
        btn.textContent = 'Disconnect';
        btn.className = 'wifi-net-action-btn disconnect';
        if (metaEl) metaEl.textContent = 'Connected';
      } else {
        item.classList.remove('connected');
        btn.textContent = 'Connect';
        btn.className = 'wifi-net-action-btn connect';
        if (metaEl) metaEl.textContent = '';
      }
    });
  }

  // Also sync Settings window if it's open
  const settingsList = document.getElementById('wifi-networks-settings-list');
  if (settingsList) {
    const items = settingsList.querySelectorAll('.wifi-net-item');
    items.forEach(item => {
      const nameEl = item.querySelector('.wifi-net-name');
      const btn = item.querySelector('.wifi-net-action-btn:last-child');
      const metaEl = item.querySelector('.wifi-net-meta');
      if (!nameEl || !btn) return;
      const name = nameEl.textContent.trim();
      const isCurrent = networkSettings.wifi && !networkSettings.airplane && (networkSettings.currentSsid === name);
      if (isCurrent) {
        item.classList.add('connected');
        btn.textContent = 'Disconnect';
        btn.className = 'wifi-net-action-btn disconnect';
        if (metaEl) metaEl.textContent = 'Connected';
      } else {
        item.classList.remove('connected');
        btn.textContent = 'Connect';
        btn.className = 'wifi-net-action-btn connect';
        if (metaEl) metaEl.textContent = '';
      }
    });
  }
}

function toggleCybernetConnect() {
  connectToWifi('HomeNetwork_5G');
}

function connectToWifi(ssid) {
  if (networkSettings.currentSsid === ssid) {
    networkSettings.currentSsid = null;
    if (typeof g4State !== 'undefined') g4State.wifiChoice = null;
  } else {
    networkSettings.currentSsid = ssid;
    if (typeof g4State !== 'undefined' && typeof G4_WIFI_NETWORKS !== 'undefined') {
      const g4Net = G4_WIFI_NETWORKS.find(n => n.name === ssid);
      if (g4Net) g4State.wifiChoice = g4Net.id;
    }

    if (typeof addSimulationNotification === 'function') {
      addSimulationNotification({
        id: 'notif-wifi-' + Date.now(),
        source: 'Network Monitor',
        icon: '📶',
        iconType: 'vpn',
        title: 'Connected: ' + ssid,
        body: `Wi-Fi connection established. Security: ${ssid.includes('Free') ? 'UNENCRYPTED PUBLIC AP - HIGH RISK' : 'WPA2/WPA3 ENCRYPTED'}.`,
        time: 'Just now',
        app: 'wifi-settings'
      }, false);
    }
  }
  updateNetworkUI();
}

function warnPublicWifi() {
  if (typeof AudioManager !== 'undefined') AudioManager.playAlert();
  showToast('⚠️ SECURITY WARNING: "Free Wifi" lacks encryption! Man-in-the-Middle (MITM) attacks can intercept passwords. Never connect without a VPN.', 'warning');
}

function refreshWifiNetworks() {
  const btn = document.querySelector('.flyout-refresh-btn');
  if (btn) btn.textContent = '⏳ Scanning...';
  if (typeof AudioManager !== 'undefined') AudioManager.playSliderTick();
  setTimeout(() => {
    if (btn) btn.textContent = '🔄 Scan';
    showToast('📡 Wi-Fi scan complete. 4 access points in range.', 'info');
  }, 600);
}
