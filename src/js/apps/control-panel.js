'use strict';

// ══════════════════════════════════════════════════════════════════
// 🎛️ CONTROL PANEL CONTROLLER — Chapter 2+ System App
// ══════════════════════════════════════════════════════════════════

let cpCurrentView = 'category'; // 'category' | 'large_icons' | 'small_icons'
let cpCurrentPage = 'main';     // 'main' | 'programs' | 'system' | 'device_mgr' | 'uac'
let cpSelectedProgramId = null; // currently selected row in Programs & Features
let _cpUninstallTimer = null;   // uninstaller progress step timer

// ── Complete Master List of Desktop Applications ──────────────────
const CP_MASTER_PROGRAMS = [
  {
    id: 'gta6',
    name: 'Grand Theft Auto VI (GTA VI Installer)',
    shortName: 'Grand Theft Auto VI',
    desktopIconId: 'icon-gta6',
    icon: 'assets/icons/Chapter 2 new apps/GTA6.svg',
    publisher: 'Rockstar Games, Inc.',
    date: '10/28/2026',
    size: '64.2 GB',
    version: '1.0.4.22',
    removable: true,
    path: 'C:\\Program Files\\Rockstar Games\\Grand Theft Auto VI',
    uninstallSteps: [
      { pct: 12, msg: 'Initializing Rockstar Games uninstaller engine...' },
      { pct: 28, msg: 'Terminating active GTA VI background processes and services...' },
      { pct: 46, msg: 'Deleting core game binaries (GTA6.exe, RockstarService.exe)...' },
      { pct: 72, msg: 'Purging high-resolution textures and audio archives (64.2 GB)...' },
      { pct: 86, msg: 'Cleaning registry entries under HKLM\\Software\\Rockstar Games...' },
      { pct: 94, msg: 'Removing desktop shortcuts, start tiles, and file associations...' },
      { pct: 100, msg: 'Uninstallation completed successfully.' }
    ]
  },
  {
    id: 'steam',
    name: 'Steam Game Platform',
    shortName: 'Steam',
    desktopIconId: 'icon-steam',
    icon: 'assets/icons/Chapter 2 new apps/steam.svg',
    publisher: 'Valve Corporation',
    date: '9/15/2026',
    size: '1.85 GB',
    version: '1.0.8',
    removable: true,
    path: 'C:\\Program Files (x86)\\Steam',
    uninstallSteps: [
      { pct: 15, msg: 'Stopping Steam client bootstrapper and services...' },
      { pct: 40, msg: 'Removing Steam executable binaries (steam.exe, steamclient.dll)...' },
      { pct: 70, msg: 'Purging package caches and app manifests...' },
      { pct: 90, msg: 'Cleaning user registry keys and desktop shortcuts...' },
      { pct: 100, msg: 'Steam uninstallation completed.' }
    ]
  },
  {
    id: 'space-fighter',
    name: 'Space Fighter — Arcade Edition',
    shortName: 'Space Fighter',
    desktopIconId: 'icon-space-fighter',
    icon: 'assets/icons/Chapter 2 new apps/Space Fighter.svg',
    publisher: 'Galactic Arcade Studio',
    date: '8/22/2026',
    size: '142 MB',
    version: '1.4.0',
    removable: true,
    path: 'C:\\Program Files\\SpaceFighter',
    uninstallSteps: [
      { pct: 20, msg: 'Terminating active arcade rendering engine...' },
      { pct: 50, msg: 'Removing space-fighter.exe and sound assets...' },
      { pct: 80, msg: 'Clearing local high scores and sector data...' },
      { pct: 100, msg: 'Space Fighter uninstallation completed.' }
    ]
  },
  {
    id: 'bm',
    name: 'BM',
    shortName: 'BM',
    desktopIconId: null,
    icon: 'assets/icons/Chapter 2 new apps/BM.svg',
    publisher: 'Decentralized CoinPool Mining Network',
    date: '10/28/2026',
    size: '48.6 MB',
    version: '1.0.4',
    removable: true,
    path: 'C:\\Users\\Ethan\\AppData\\Roaming\\BM',
    uninstallSteps: [
      { pct: 15, msg: 'Stopping hidden background mining threads and daemon...' },
      { pct: 40, msg: 'Deleting CoinBitMiner binaries (CoinBitMiner.exe, miner.dll)...' },
      { pct: 75, msg: 'Removing startup registry keys under HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run...' },
      { pct: 100, msg: 'BM successfully removed from system.' }
    ]
  },
    {
    id: 'antivirus',
    name: 'ShieldAV Endpoint Protection',
    shortName: 'Anti-Virus',
    desktopIconId: 'icon-antivirus',
    icon: 'assets/icons/apps/windows_defender.svg',
    publisher: 'CyberZero Security Labs',
    date: '9/1/2026',
    size: '210 MB',
    version: '4.2.1',
    removable: false,
    path: 'C:\\Program Files\\ShieldAV'
  },
  {
    id: 'gmail',
    name: 'Zmail Phishing Investigation Suite',
    shortName: 'Zmail',
    desktopIconId: 'icon-gmail',
    icon: 'assets/icons/apps/mail.svg',
    publisher: 'CyberDefense Corp',
    date: '9/1/2026',
    size: '84.5 MB',
    version: '2.4.1',
    removable: false,
    path: 'C:\\Program Files\\CyberZero\\Zmail'
  },
  {
    id: 'browser',
    name: 'Cyber-Net Web Browser',
    shortName: 'Browser',
    desktopIconId: 'icon-browser',
    icon: 'assets/icons/apps/browser.svg',
    publisher: 'CyberNet Systems',
    date: '9/1/2026',
    size: '142 MB',
    version: '11.4.0',
    removable: false,
    path: 'C:\\Program Files\\CyberNet\\Browser'
  },
  {
    id: 'folder',
    name: 'Windows File Explorer',
    shortName: 'File Explorer',
    desktopIconId: 'icon-folder',
    icon: 'assets/icons/apps/folder.svg',
    publisher: 'Microsoft Corporation',
    date: '9/1/2026',
    size: '58.3 MB',
    version: '10.0.22621',
    removable: false,
    path: 'C:\\Windows\\explorer.exe'
  },
  {
    id: 'taskmanager',
    name: 'Windows Task Manager',
    shortName: 'Task Manager',
    desktopIconId: 'icon-taskmanager',
    icon: 'assets/icons/Chapter 2 new apps/Task Manager.svg',
    publisher: 'Microsoft Corporation',
    date: '9/1/2026',
    size: '18.2 MB',
    version: '10.0.22621',
    removable: false,
    path: 'C:\\Windows\\System32\\Taskmgr.exe'
  },
  {
    id: 'comms',
    name: 'Phone Link (CyberComms)',
    shortName: 'Phone Link',
    desktopIconId: 'icon-comms',
    icon: 'assets/icons/apps/Smartphone.svg',
    publisher: 'CyberComms Inc.',
    date: '9/1/2026',
    size: '68.4 MB',
    version: '1.2305',
    removable: false,
    path: 'C:\\Program Files\\WindowsApps\\CyberComms'
  },
  {
    id: 'notes',
    name: 'Microsoft Sticky Notes',
    shortName: 'Sticky Notes',
    desktopIconId: 'icon-notes',
    icon: 'assets/icons/apps/note.svg',
    publisher: 'Microsoft Corporation',
    date: '9/1/2026',
    size: '24.1 MB',
    version: '4.1.0',
    removable: false,
    path: 'C:\\Program Files\\WindowsApps\\StickyNotes'
  },
  {
    id: 'control-panel',
    name: 'Windows Control Panel',
    shortName: 'Control Panel',
    desktopIconId: 'icon-control-panel',
    icon: 'assets/icons/Chapter 2 new apps/control_panel.svg',
    publisher: 'Microsoft Corporation',
    date: '9/1/2026',
    size: '12.4 MB',
    version: '10.0.22621',
    removable: false,
    path: 'C:\\Windows\\System32\\control.exe'
  },
  {
    id: 'thispc',
    name: 'This PC (Storage Manager)',
    shortName: 'This PC',
    desktopIconId: 'icon-this-pc',
    icon: 'assets/icons/Chapter 2 new apps/This PC.svg',
    publisher: 'Microsoft Corporation',
    date: '9/1/2026',
    size: '32.0 MB',
    version: '10.0.22621',
    removable: false,
    path: 'C:\\Windows\\System32'
  }
];

// Helper to retrieve persisted uninstalled app IDs
function getUninstalledAppIds() {
  try {
    let list = JSON.parse(localStorage.getItem('cyberzero_uninstalled_apps') || '[]');
    if (!Array.isArray(list)) list = [];
    // Ensure games-folder is never treated as an uninstalled program
    if (list.includes('games-folder') || list.includes('games')) {
      list = list.filter(id => id !== 'games-folder' && id !== 'games');
      try {
        localStorage.setItem('cyberzero_uninstalled_apps', JSON.stringify(list));
      } catch (e) {}
    }
    return list;
  } catch (e) {
    return [];
  }
}

// Helper to detect if Chapter 2 (Ethan / Malware) is currently active
function _cpIsChapter2Active() {
  if (window._currentChapterCategory === 'malware') return true;
  if (typeof activeCategoryStory !== 'undefined' && activeCategoryStory === 'malware') return true;
  if (typeof gameState !== 'undefined' && gameState && (gameState.phase === 'malware' || gameState.chapter === 'malware')) return true;
  try {
    const raw = localStorage.getItem('cyberzero_session_state');
    if (raw) {
      const sess = JSON.parse(raw);
      if (sess && sess.activeChapter === 'malware' && window._currentChapterCategory !== 'phishing') return true;
    }
  } catch (e) {}
  return false;
}

// Helper to get currently installed programs (filtered by uninstalled state + chapter context)
function getEffectiveInstalledPrograms() {
  let uninstalled = getUninstalledAppIds();
  const isCh2 = _cpIsChapter2Active();

  // Check if BM has been uninstalled in Chapter 2
  const isBmUninstalled = !!(
    (window._ch2Mission && window._ch2Mission.bmUninstalled) ||
    (function() {
      try {
        var _m = JSON.parse(localStorage.getItem('cyberzero_ch2_mission') || 'null');
        return _m && _m.bmUninstalled;
      } catch (e) { return false; }
    })()
  );

  // In Chapter 2: ensure BM is not blocked by stale uninstalled_apps localStorage if not actually uninstalled
  if (isCh2 && !isBmUninstalled && uninstalled.includes('bm')) {
    uninstalled = uninstalled.filter(id => id !== 'bm');
    try {
      localStorage.setItem('cyberzero_uninstalled_apps', JSON.stringify(uninstalled));
    } catch (e) {}
  }

  return CP_MASTER_PROGRAMS.filter(p => {
    // BM (Bitcoin Miner) is strictly for Chapter 2 — hide it in Chapter 1
    if (p.id === 'bm') {
      if (!isCh2) return false;
      return !isBmUninstalled;
    }

    return !uninstalled.includes(p.id);
  });
}

// Synchronize desktop screen icons with uninstalled state (persists across reloads/chapters)
function syncUninstalledAppsState() {
  const uninstalled = getUninstalledAppIds();
  uninstalled.forEach(appId => {
    // Only genuine removable programs in CP_MASTER_PROGRAMS can be uninstalled/hidden
    const prog = CP_MASTER_PROGRAMS.find(p => p.id === appId && p.removable);
    if (!prog) return;
    const iconId = prog.desktopIconId || ('icon-' + appId);
    const el = document.getElementById(iconId);
    if (el) {
      el.style.setProperty('display', 'none', 'important');
      el.classList.add('uninstalled');
    }
    // Also check start menu tiles if any
    const startTile = document.getElementById('start-app-' + appId);
    if (startTile) startTile.style.setProperty('display', 'none', 'important');
    const recTile = document.getElementById('rec-app-' + appId);
    if (recTile) recTile.style.setProperty('display', 'none', 'important');
  });

  // Always preserve and restore Games Folder desktop icon in Chapter 2
  const gamesFolderEl = document.getElementById('icon-games-folder');
  if (gamesFolderEl) {
    gamesFolderEl.classList.remove('uninstalled');
    const isCh2 = (window._currentChapterCategory === 'malware' || 
                   (typeof gameState !== 'undefined' && (gameState.phase === 'malware' || gameState.phase === 'ch2')) ||
                   (typeof activeCategoryStory !== 'undefined' && activeCategoryStory === 'malware'));
    const isCh3 = (window._currentChapterCategory === 'social_engineering' || 
                   (typeof gameState !== 'undefined' && (gameState.phase === 'social' || gameState.phase === 'ch3')) ||
                   (typeof activeCategoryStory !== 'undefined' && (activeCategoryStory === 'social' || activeCategoryStory === 'social_engineering')));
    if (isCh2 && !isCh3) {
      gamesFolderEl.style.setProperty('display', 'flex', 'important');
    }
  }

  // Update dynamic badge in Category view
  const progCat = CP_CATEGORIES.find(c => c.id === 'prog');
  if (progCat && progCat.links && progCat.links[0]) {
    const activeCount = getEffectiveInstalledPrograms().length;
    progCat.links[0].badge = activeCount + ' Apps';
  }
}

const CP_CATEGORIES = [
  {
    id: 'sec',
    icon: '🛡️',
    title: 'System and Security',
    page: 'system',
    links: [
      { text: "Review your computer's status", action: () => openCpSubpage('system') },
      { text: 'Windows Defender Antivirus', badge: 'Active', badgeClass: 'safe', action: () => { if (typeof openApp === 'function') openApp('antivirus'); } },
      { text: 'Task Manager & Performance', action: () => { if (typeof openApp === 'function') openApp('taskmanager'); } },
      { text: 'Windows Defender Firewall', action: () => { if (typeof openApp === 'function') openApp('security-settings'); } }
    ]
  },
  {
    id: 'net',
    icon: '🌐',
    title: 'Network and Internet',
    page: 'network',
    links: [
      { text: 'View network status and tasks', action: () => { if (typeof openApp === 'function') openApp('wifi-settings'); } },
      { text: 'Network and Sharing Center', action: () => { if (typeof openApp === 'function') openApp('security-settings'); } },
      { text: 'Internet Options (Cyber-Net)', action: () => { if (typeof openApp === 'function') openApp('browser'); } }
    ]
  },
  {
    id: 'prog',
    icon: '📦',
    title: 'Programs',
    page: 'programs',
    links: [
      { text: 'Programs and Features (Installed Apps)', badge: '11 Apps', action: () => openCpSubpage('programs') },
      { text: 'Turn Windows features on or off', action: () => openCpSubpage('programs') },
      { text: 'Default Programs configuration', action: () => openCpSubpage('programs') }
    ]
  },
  {
    id: 'user',
    icon: '👤',
    title: 'User Accounts',
    page: 'uac',
    links: [
      { text: 'Change User Account Control (UAC) settings', action: () => openCpSubpage('uac') },
      { text: 'User Profile: Ethan (Trainee)', action: () => openCpSubpage('uac') },
      { text: 'Credential Manager', action: () => openCpSubpage('uac') }
    ]
  },
  {
    id: 'hw',
    icon: '🔊',
    title: 'Hardware and Sound',
    page: 'device_mgr',
    links: [
      { text: 'Device Manager', badge: 'Verified', badgeClass: 'safe', action: () => openCpSubpage('device_mgr') },
      { text: 'Adjust system volume', action: () => { if (typeof toggleVolumeFlyout === 'function') toggleVolumeFlyout(); } },
      { text: 'Power Options (Balanced)', action: () => openCpSubpage('system') }
    ]
  },
  {
    id: 'app',
    icon: '🎨',
    title: 'Appearance and Personalization',
    links: [
      { text: 'Taskbar and Navigation', action: () => { if (typeof showToast === 'function') showToast('Taskbar is locked and managed by CyberZero OS.', 'info'); } },
      { text: 'File Explorer Options', action: () => { if (typeof openApp === 'function') openApp('folder'); } },
      { text: 'Fonts & High-DPI Scaling', action: () => { if (typeof showToast === 'function') showToast('Display scaling is automatically tuned for your screen.', 'info'); } }
    ]
  },
  {
    id: 'clk',
    icon: '🕒',
    title: 'Clock and Region',
    page: 'clock_region',
    links: [
      { text: 'Date and Time (CyberZero Time: UTC+8)', action: () => openCpSubpage('clock_region') },
      { text: 'Change date, time, or number formats', action: () => openCpSubpage('clock_region') }
    ]
  },
  {
    id: 'acc',
    icon: '♿',
    title: 'Ease of Access',
    page: 'ease_access',
    links: [
      { text: 'Let Windows suggest accessibility settings', action: () => openCpSubpage('ease_access') },
      { text: 'Optimize visual display and text size', action: () => openCpSubpage('ease_access') }
    ]
  }
];

function initControlPanel() {
  syncUninstalledAppsState();
  renderControlPanel();
  if (typeof window.ch2OnControlPanelOpened === 'function') {
    window.ch2OnControlPanelOpened();
  }
  if (typeof window.ch2OnControlPanelChecked === 'function') {
    window.ch2OnControlPanelChecked();
  }
}

function renderControlPanel() {
  const container = document.getElementById('cp-main-scroll');
  const crumbEl = document.getElementById('cp-breadcrumb-content');
  const searchInput = document.getElementById('cp-search-input');
  const q = searchInput ? searchInput.value.toLowerCase().trim() : '';

  if (!container) return;

  syncUninstalledAppsState();

  if (cpCurrentPage === 'main') {
    if (crumbEl) {
      crumbEl.innerHTML = `<span class="cp-crumb-current">Control Panel</span>`;
    }
    const backBtn = document.getElementById('cp-btn-back');
    if (backBtn) backBtn.disabled = true;

    if (cpCurrentView === 'category') {
      renderCpCategories(container, q);
    } else {
      renderCpIcons(container, q);
    }
  } else if (cpCurrentPage === 'programs') {
    if (typeof window.ch2OnProgramsFeaturesOpened === 'function') {
      window.ch2OnProgramsFeaturesOpened();
    }
    renderCpProgramsPage(container, q);
  } else if (cpCurrentPage === 'system') {
    renderCpSystemPage(container);
  } else if (cpCurrentPage === 'device_mgr') {
    renderCpDeviceMgrPage(container);
  } else if (cpCurrentPage === 'uac') {
    renderCpUacPage(container);
  } else if (cpCurrentPage === 'clock_region') {
    renderCpClockRegionPage(container);
  } else if (cpCurrentPage === 'ease_access') {
    renderCpEaseOfAccessPage(container);
  }
}

function renderCpCategories(container, q) {
  let filtered = CP_CATEGORIES;
  if (q) {
    filtered = CP_CATEGORIES.filter(cat => {
      const matchCat = cat.title.toLowerCase().includes(q);
      const matchLink = cat.links.some(l => l.text.toLowerCase().includes(q));
      return matchCat || matchLink;
    });
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="text-align:center;padding:40px 20px;color:#64748b;">
        <div style="font-size:32px;margin-bottom:8px;">🔍</div>
        <div style="font-size:13px;font-weight:600;color:#cbd5e1;">No Control Panel items match "${escapeCp(q)}"</div>
        <div style="font-size:11.5px;margin-top:4px;">Try searching for "Antivirus", "Firewall", "Sound", or "Programs"</div>
      </div>`;
    return;
  }

  let html = `<div class="cp-cat-grid">`;
  filtered.forEach((cat, idx) => {
    html += `
      <div class="cp-cat-card">
        <div class="cp-cat-icon">${cat.icon}</div>
        <div class="cp-cat-info">
          <div class="cp-cat-title" onclick="cpCatClick(${idx})">${cat.title}</div>
          <div class="cp-cat-links">
            ${cat.links.map((l, lIdx) => `
              <span class="cp-link" onclick="cpLinkClick(${idx}, ${lIdx})">
                ${l.text}
                ${l.badge ? `<span class="cp-link-badge ${l.badgeClass || ''}">${l.badge}</span>` : ''}
              </span>
            `).join('')}
          </div>
        </div>
      </div>`;
  });
  html += `</div>`;
  container.innerHTML = html;
}

function renderCpIcons(container, q) {
  const allTiles = [];
  CP_CATEGORIES.forEach(cat => {
    cat.links.forEach(l => {
      allTiles.push({
        name: l.text,
        icon: cat.icon,
        action: l.action
      });
    });
  });

  const filtered = q ? allTiles.filter(t => t.name.toLowerCase().includes(q)) : allTiles;

  let html = `<div class="cp-icons-grid">`;
  filtered.forEach((t, i) => {
    html += `
      <div class="cp-icon-tile" onclick="cpTileClick(${i})">
        <div class="cp-icon-tile-glyph">${t.icon}</div>
        <div class="cp-icon-tile-name">${t.name}</div>
      </div>`;
  });
  html += `</div>`;
  container.innerHTML = html;

  window._cpFilteredTiles = filtered;
}

function cpTileClick(i) {
  if (window._cpFilteredTiles && window._cpFilteredTiles[i] && window._cpFilteredTiles[i].action) {
    window._cpFilteredTiles[i].action();
  }
}

function cpCatClick(idx) {
  const cat = CP_CATEGORIES[idx];
  if (cat && cat.page) {
    openCpSubpage(cat.page);
  } else if (cat && cat.links && cat.links[0] && cat.links[0].action) {
    cat.links[0].action();
  }
}

function cpLinkClick(catIdx, linkIdx) {
  const cat = CP_CATEGORIES[catIdx];
  if (cat && cat.links && cat.links[linkIdx] && cat.links[linkIdx].action) {
    cat.links[linkIdx].action();
  }
}

function openCpSubpage(page) {
  cpCurrentPage = page;
  const backBtn = document.getElementById('cp-btn-back');
  if (backBtn) backBtn.disabled = false;

  const crumbEl = document.getElementById('cp-breadcrumb-content');
  const pageNames = {
    programs: 'Programs and Features',
    system: 'System and Security',
    device_mgr: 'Device Manager',
    uac: 'User Accounts (UAC)',
    clock_region: 'Clock and Region',
    ease_access: 'Ease of Access'
  };

  if (crumbEl) {
    crumbEl.innerHTML = `
      <span class="cp-crumb-link" onclick="openCpSubpage('main')">Control Panel</span>
      <span class="cp-crumb-sep">›</span>
      <span class="cp-crumb-current">${pageNames[page] || 'Details'}</span>`;
  }

  renderControlPanel();
}

// ── Programs and Features View ────────────────────────────────────
function renderCpProgramsPage(container, q) {
  const installed = getEffectiveInstalledPrograms();
  const searchFilter = q ? q.toLowerCase() : '';
  const displayList = searchFilter
    ? installed.filter(p => p.name.toLowerCase().includes(searchFilter) || p.publisher.toLowerCase().includes(searchFilter))
    : installed;

  const selectedProg = cpSelectedProgramId ? installed.find(p => p.id === cpSelectedProgramId) : null;
  const isUninstallActive = selectedProg && selectedProg.removable;

  container.innerHTML = `
    <div class="cp-subpage">
      <div class="cp-subpage-header">
        <div style="font-size:28px;">📦</div>
        <div>
          <div class="cp-subpage-title">Programs and Features</div>
          <div class="cp-subpage-desc">Uninstall or change a program installed on Ethan's desktop. To uninstall a program, select it from the list and then click Uninstall.</div>
        </div>
      </div>

      <!-- Action Toolbar -->
      <div class="cp-prog-toolbar">
        <div class="cp-prog-toolbar-left">
          <button type="button" class="cp-toolbar-action-btn ${isUninstallActive ? 'active-uninstall' : ''}" 
                  id="cp-tb-uninstall-btn" 
                  ${selectedProg ? '' : 'disabled'}
                  onclick="handleToolbarUninstallClick()">
            <span>🗑️</span> Uninstall
          </button>
          <button type="button" class="cp-toolbar-action-btn" disabled>Change</button>
          <button type="button" class="cp-toolbar-action-btn" disabled>Repair</button>
        </div>
        <div class="cp-prog-count-badge">
          ${displayList.length} ${displayList.length === 1 ? 'Program' : 'Programs'} Installed
        </div>
      </div>

      <!-- Installed Programs Table -->
      <table class="cp-programs-table" id="cp-programs-table">
        <thead>
          <tr>
            <th style="width: 38%;">Name</th>
            <th style="width: 22%;">Publisher</th>
            <th style="width: 14%;">Installed On</th>
            <th style="width: 11%;">Size</th>
            <th style="width: 15%; text-align: center;">Action</th>
          </tr>
        </thead>
        <tbody>
          ${displayList.length === 0 ? `
            <tr>
              <td colspan="5" style="text-align:center; padding: 24px; color: #94a3b8;">
                No matching applications found.
              </td>
            </tr>
          ` : displayList.map(p => `
            <tr class="${p.id === cpSelectedProgramId ? 'selected' : ''}" onclick="selectCpProgram('${p.id}')">
              <td>
                <div class="cp-prog-name">
                  <img src="${p.icon}" alt="${p.name}" class="cp-prog-icon-img">
                  <span>${p.name}</span>
                </div>
              </td>
              <td>${p.publisher}</td>
              <td>${p.date}</td>
              <td>${p.size}</td>
              <td style="text-align: center;" onclick="event.stopPropagation()">
                <button type="button" 
                        class="cp-uninstall-btn ${p.removable ? '' : 'protected'}" 
                        onclick="promptUninstall('${p.id}', event)">
                  ${p.removable ? 'Uninstall' : 'System'}
                </button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>`;
}

function selectCpProgram(appId) {
  cpSelectedProgramId = (cpSelectedProgramId === appId) ? null : appId;
  if (appId && typeof window.ch2OnProgramSelected === 'function') {
    window.ch2OnProgramSelected(appId);
  }
  const container = document.getElementById('cp-main-scroll');
  if (container && cpCurrentPage === 'programs') {
    renderCpProgramsPage(container, document.getElementById('cp-search-input')?.value);
  }
}

function handleToolbarUninstallClick() {
  if (cpSelectedProgramId) {
    promptUninstall(cpSelectedProgramId);
  }
}

// ── Uninstall Handling & Wizard ───────────────────────────────────
function promptUninstall(appId, event) {
  if (event) event.stopPropagation();
  const prog = CP_MASTER_PROGRAMS.find(p => p.id === appId);
  if (!prog) return;

  cpSelectedProgramId = appId;
  if (typeof window.ch2OnProgramSelected === 'function') {
    window.ch2OnProgramSelected(appId);
  }

  if (!prog.removable) {
    showCpSystemAlert(prog);
    return;
  }

  openCpUninstallWizard(prog);
}

function showCpSystemAlert(prog) {
  ensureUninstallerModalExists();
  const modal = document.getElementById('cp-uninstaller-modal');
  const titleText = document.getElementById('cp-uninst-title-text');
  const titleIcon = document.getElementById('cp-uninst-title-icon');
  const body = document.getElementById('cp-uninstaller-body');

  if (titleText) titleText.textContent = 'Windows System Protection';
  if (titleIcon) titleIcon.src = 'assets/icons/Chapter 2 new apps/control_panel.svg';

  body.innerHTML = `
    <div class="cp-uninst-phase">
      <div class="cp-alert-content">
        <div class="cp-alert-icon">🛡️</div>
        <div>
          <div class="cp-alert-heading">${prog.name} is Protected</div>
          <div class="cp-alert-msg">
            This application is an essential system component managed by CyberZero OS endpoint policies and your IT Support Mentor (Ryan).
            <br><br>
            It is required for ongoing defense training and cannot be uninstalled from this workstation.
          </div>
        </div>
      </div>
      <div class="cp-uninst-actions" style="margin-top: 18px;">
        <button type="button" class="cp-btn-primary" onclick="cancelCpUninstall()">OK</button>
      </div>
    </div>`;

  modal.classList.remove('hidden');
  if (typeof AudioManager !== 'undefined' && AudioManager.playWrong) AudioManager.playWrong();
}

function openCpUninstallWizard(prog) {
  ensureUninstallerModalExists();
  const modal = document.getElementById('cp-uninstaller-modal');
  const titleText = document.getElementById('cp-uninst-title-text');
  const titleIcon = document.getElementById('cp-uninst-title-icon');
  const body = document.getElementById('cp-uninstaller-body');

  if (titleText) titleText.textContent = `${prog.shortName || prog.name} Uninstaller`;
  if (titleIcon) titleIcon.src = prog.icon;

  // Phase 1: Confirmation
  body.innerHTML = `
    <div class="cp-uninst-phase cp-uninst-confirm">
      <div class="cp-uninst-hero">
        <img src="${prog.icon}" class="cp-uninst-hero-icon" alt="${prog.name}">
        <div>
          <div class="cp-uninst-heading">Uninstall ${prog.name}</div>
          <div class="cp-uninst-sub">Are you sure you want to completely remove this program and all of its components from your computer?</div>
        </div>
      </div>

      <div class="cp-uninst-box">
        <div class="cp-uninst-row"><span>Installation Path:</span> <strong>${prog.path}</strong></div>
        <div class="cp-uninst-row"><span>Disk Space to Free:</span> <strong style="color:#38bdf8;">${prog.size}</strong></div>
        <div class="cp-uninst-row"><span>Publisher:</span> <strong>${prog.publisher}</strong></div>
        <div class="cp-uninst-row"><span>Version:</span> <strong>${prog.version}</strong></div>
      </div>

      <div class="cp-uninst-actions">
        <button type="button" class="cp-btn-secondary" onclick="cancelCpUninstall()">Cancel</button>
        <button type="button" class="cp-btn-danger" onclick="startCpUninstall('${prog.id}')">Uninstall</button>
      </div>
    </div>`;

  modal.classList.remove('hidden');
}

function startCpUninstall(appId) {
  const prog = CP_MASTER_PROGRAMS.find(p => p.id === appId);
  if (!prog) return;

  if (appId === 'bm' && typeof window.ch2OnProgramUninstallStarted === 'function') {
    window.ch2OnProgramUninstallStarted('bm');
  }

  const body = document.getElementById('cp-uninstaller-body');
  const closeBtn = document.getElementById('cp-uninst-close-btn');
  if (closeBtn) closeBtn.style.display = 'none';

  // Phase 2: Progress Animation
  body.innerHTML = `
    <div class="cp-uninst-phase cp-uninst-progress">
      <div class="cp-uninst-hero">
        <img src="${prog.icon}" class="cp-uninst-hero-icon" alt="${prog.name}" style="animation: cpPulse 1s infinite alternate;">
        <div>
          <div class="cp-uninst-heading">Uninstalling ${prog.name}...</div>
          <div class="cp-uninst-sub">Please wait while the uninstaller removes files, registry keys, and shortcuts.</div>
        </div>
      </div>

      <div class="cp-progress-wrap">
        <div class="cp-progress-bar">
          <div class="cp-progress-fill" id="cp-uninst-progress-fill" style="width: 0%;"></div>
        </div>
        <div class="cp-progress-meta">
          <span id="cp-uninst-status-msg" class="cp-status-text">Initializing uninstaller...</span>
          <span id="cp-uninst-pct" class="cp-pct-text">0%</span>
        </div>
      </div>

      <div class="cp-uninst-log-box" id="cp-uninst-log-box">
        <div>[00:00:01] Preparing uninstallation manifest...</div>
      </div>

      <div class="cp-uninst-actions">
        <button type="button" class="cp-btn-secondary" disabled>Uninstalling...</button>
      </div>
    </div>`;

  const steps = prog.uninstallSteps || [
    { pct: 20, msg: 'Stopping active application processes...' },
    { pct: 50, msg: 'Deleting program files and binaries...' },
    { pct: 80, msg: 'Cleaning registry entries...' },
    { pct: 100, msg: 'Uninstallation completed.' }
  ];

  let stepIdx = 0;
  if (_cpUninstallTimer) clearInterval(_cpUninstallTimer);

  _cpUninstallTimer = setInterval(() => {
    if (stepIdx >= steps.length) {
      clearInterval(_cpUninstallTimer);
      _cpUninstallTimer = null;
      renderCpUninstallComplete(prog);
      return;
    }

    const currentStep = steps[stepIdx];
    const fillEl = document.getElementById('cp-uninst-progress-fill');
    const msgEl = document.getElementById('cp-uninst-status-msg');
    const pctEl = document.getElementById('cp-uninst-pct');
    const logBox = document.getElementById('cp-uninst-log-box');

    if (fillEl) fillEl.style.width = currentStep.pct + '%';
    if (msgEl) msgEl.textContent = currentStep.msg;
    if (pctEl) pctEl.textContent = currentStep.pct + '%';

    if (logBox) {
      const timeStr = new Date().toTimeString().split(' ')[0];
      const logLine = document.createElement('div');
      logLine.textContent = `[${timeStr}] ${currentStep.msg}`;
      logBox.appendChild(logLine);
      logBox.scrollTop = logBox.scrollHeight;
    }

    if (typeof AudioManager !== 'undefined' && AudioManager.playResultTick) {
      AudioManager.playResultTick();
    }

    stepIdx++;
  }, 550);
}

function renderCpUninstallComplete(prog) {
  const body = document.getElementById('cp-uninstaller-body');
  const closeBtn = document.getElementById('cp-uninst-close-btn');
  if (closeBtn) closeBtn.style.display = 'block';

  // Phase 3: Completion Notification
  body.innerHTML = `
    <div class="cp-uninst-phase cp-uninst-complete-wrap">
      <div class="cp-uninst-complete-icon">✅</div>
      <div class="cp-uninst-heading" style="color:#34d399; font-size: 17px;">Uninstallation Complete</div>
      <div class="cp-uninst-sub" style="margin-top: 6px; font-size: 13px;">
        <strong>${prog.name}</strong> was successfully removed from your computer.
        <br><br>
        <span style="color:#94a3b8; font-size: 12px;">All program binaries (${prog.size}), desktop shortcuts, and cached game assets have been deleted.</span>
      </div>
      <div class="cp-uninst-actions" style="justify-content: center; margin-top: 22px;">
        <button type="button" class="cp-btn-primary" onclick="finishCpUninstall('${prog.id}')">Finish</button>
      </div>
    </div>`;

  if (typeof AudioManager !== 'undefined') {
    if (AudioManager.playSuccess) AudioManager.playSuccess();
    else if (AudioManager.playToastSound) AudioManager.playToastSound();
  }
}

function finishCpUninstall(appId) {
  const prog = CP_MASTER_PROGRAMS.find(p => p.id === appId);
  if (appId === 'bm' && typeof window.ch2OnProgramUninstalled === 'function') {
    window.ch2OnProgramUninstalled('bm');
  }

  // 1. Persist uninstallation in localStorage
  let uninstalled = getUninstalledAppIds();
  if (!uninstalled.includes(appId)) {
    uninstalled.push(appId);
  }
  try {
    localStorage.setItem('cyberzero_uninstalled_apps', JSON.stringify(uninstalled));
  } catch (e) {}

  // 2. Hide desktop icon immediately with animation
  const iconId = prog ? prog.desktopIconId : ('icon-' + appId);
  const desktopIcon = document.getElementById(iconId);
  if (desktopIcon) {
    desktopIcon.style.transition = 'all 0.3s ease';
    desktopIcon.style.opacity = '0';
    desktopIcon.style.transform = 'scale(0.8)';
    setTimeout(() => {
      desktopIcon.style.setProperty('display', 'none', 'important');
      desktopIcon.classList.add('uninstalled');
    }, 300);
  }

  // 3. Close uninstaller modal
  cancelCpUninstall();

  // Close app window if it's currently open
  if (typeof closeApp === 'function' && typeof appState !== 'undefined' && appState[appId] && appState[appId].open) {
    closeApp(appId);
  }

  // 4. Synchronize all uninstalled apps across UI
  syncUninstalledAppsState();

  // 5. Re-render Programs & Features table so the program is removed
  cpSelectedProgramId = null;
  const container = document.getElementById('cp-main-scroll');
  if (container && cpCurrentPage === 'programs') {
    renderCpProgramsPage(container, document.getElementById('cp-search-input')?.value);
  }

  // 6. User toast notification
  if (typeof showToast === 'function') {
    showToast(`🗑️ ${prog ? prog.name : 'Application'} successfully uninstalled.`, 'success');
  }
}

function cancelCpUninstall() {
  if (_cpUninstallTimer) {
    clearInterval(_cpUninstallTimer);
    _cpUninstallTimer = null;
  }
  const modal = document.getElementById('cp-uninstaller-modal');
  if (modal) modal.classList.add('hidden');
  const closeBtn = document.getElementById('cp-uninst-close-btn');
  if (closeBtn) closeBtn.style.display = 'block';
}

function ensureUninstallerModalExists() {
  if (document.getElementById('cp-uninstaller-modal')) return;

  const modal = document.createElement('div');
  modal.id = 'cp-uninstaller-modal';
  modal.className = 'cp-uninstaller-overlay hidden';
  modal.innerHTML = `
    <div class="cp-uninstaller-window">
      <div class="cp-uninstaller-titlebar">
        <div class="cp-uninstaller-title">
          <img id="cp-uninst-title-icon" src="assets/icons/Chapter 2 new apps/control_panel.svg" alt="" class="cp-uninst-title-img">
          <span id="cp-uninst-title-text">Control Panel Uninstaller</span>
        </div>
        <button type="button" class="cp-uninst-close-btn" id="cp-uninst-close-btn" onclick="cancelCpUninstall()" title="Close">✕</button>
      </div>
      <div class="cp-uninstaller-body" id="cp-uninstaller-body"></div>
    </div>`;

  document.body.appendChild(modal);
}

// ── System Specs & Details Pages ──────────────────────────────────
function renderCpSystemPage(container) {
  container.innerHTML = `
    <div class="cp-subpage">
      <div class="cp-subpage-header">
        <div style="font-size:28px;">🛡️</div>
        <div>
          <div class="cp-subpage-title">System and Security Overview</div>
          <div class="cp-subpage-desc">Real-time status of endpoint protection and core workstation specifications.</div>
        </div>
      </div>

      <div class="cp-spec-grid">
        <div class="cp-spec-card">
          <div class="cp-spec-label">Device Name</div>
          <div class="cp-spec-val">DESKTOP-ETHAN-CYBER0</div>
        </div>
        <div class="cp-spec-card">
          <div class="cp-spec-label">Processor</div>
          <div class="cp-spec-val">Intel(R) Core(TM) i7-13700H @ 3.40 GHz</div>
        </div>
        <div class="cp-spec-card">
          <div class="cp-spec-label">Installed RAM</div>
          <div class="cp-spec-val">16.0 GB (DDR5 Dual-Channel)</div>
        </div>
        <div class="cp-spec-card">
          <div class="cp-spec-label">Operating System</div>
          <div class="cp-spec-val">CyberZero Windows OS (64-bit Endpoint)</div>
        </div>
        <div class="cp-spec-card">
          <div class="cp-spec-label">Antivirus Protection</div>
          <div class="cp-spec-val" style="color:#34d399;">ShieldAV Endpoint v4.2.1 (Active)</div>
        </div>
        <div class="cp-spec-card">
          <div class="cp-spec-label">Assigned IT Mentor</div>
          <div class="cp-spec-val" style="color:#38bdf8;">Ryan · IT Support Mentor</div>
        </div>
      </div>
    </div>`;
}

function renderCpDeviceMgrPage(container) {
  container.innerHTML = `
    <div class="cp-subpage">
      <div class="cp-subpage-header">
        <div style="font-size:28px;">⚙️</div>
        <div>
          <div class="cp-subpage-title">Device Manager</div>
          <div class="cp-subpage-desc">Hardware components and system device drivers.</div>
        </div>
      </div>

      <div style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:6px;padding:12px;font-size:12px;line-height:1.9;">
        <div>💻 <strong>DESKTOP-ETHAN-CYBER0</strong></div>
        <div style="padding-left:18px;">🔲 Audio inputs and outputs (Realtek High Definition Audio)</div>
        <div style="padding-left:18px;">🖥️ Display adapters (NVIDIA GeForce RTX 4060 Laptop GPU)</div>
        <div style="padding-left:18px;">💾 Disk drives (Samsung NVMe SSD 1TB)</div>
        <div style="padding-left:18px;">⌨️ Keyboards (Standard PS/2 Keyboard)</div>
        <div style="padding-left:18px;">🖱️ Mice and other pointing devices (HID-compliant mouse)</div>
        <div style="padding-left:18px;">📶 Network adapters (Intel Wi-Fi 6E AX211 160MHz)</div>
        <div style="padding-left:18px;">🧠 Processors (16 CPUs ~3.4GHz)</div>
      </div>
    </div>`;
}

function renderCpUacPage(container) {
  container.innerHTML = `
    <div class="cp-subpage">
      <div class="cp-subpage-header">
        <div style="font-size:28px;">👤</div>
        <div>
          <div class="cp-subpage-title">User Accounts &amp; Access Control</div>
          <div class="cp-subpage-desc">Account privileges and security escalation boundaries.</div>
        </div>
      </div>

      <div class="cp-spec-grid">
        <div class="cp-spec-card">
          <div class="cp-spec-label">Current User</div>
          <div class="cp-spec-val">Ethan (Student / Trainee)</div>
        </div>
        <div class="cp-spec-card">
          <div class="cp-spec-label">Privilege Level</div>
          <div class="cp-spec-val">Standard User (Restricted Admin Elevation)</div>
        </div>
        <div class="cp-spec-card">
          <div class="cp-spec-label">UAC Setting</div>
          <div class="cp-spec-val" style="color:#34d399;">Always Notify (Recommended)</div>
        </div>
        <div class="cp-spec-card">
          <div class="cp-spec-label">Supervising Mentor</div>
          <div class="cp-spec-val" style="color:#38bdf8;">Ryan · IT Support Mentor</div>
        </div>
      </div>
    </div>`;
}

function setCpViewMode(mode) {
  cpCurrentView = mode;
  renderControlPanel();
}

function filterControlPanel(val) {
  renderControlPanel();
}

function escapeCp(str) {
  return String(str).replace(/[&<>"']/g, s => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[s]));
}

// ── Clock and Region Page ─────────────────────────────────────────
let _cpClockInterval = null;

function renderCpClockRegionPage(container) {
  const now = new Date();
  const locale = 'en-PH';
  const dateStr = now.toLocaleDateString(locale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = now.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

  // Calendar grid
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();
  const monthName = now.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const dayNames = ['Su','Mo','Tu','We','Th','Fr','Sa'];
  let calCells = dayNames.map(d => `<div class="cp-cal-head">${d}</div>`).join('');
  for (let i = 0; i < firstDay; i++) calCells += '<div class="cp-cal-cell cp-cal-empty"></div>';
  for (let d = 1; d <= daysInMonth; d++) {
    calCells += `<div class="cp-cal-cell${d === today ? ' cp-cal-today' : ''}">${d}</div>`;
  }

  container.innerHTML = `
    <div class="cp-subpage cp-clk-page">
      <div class="cp-subpage-header">
        <div style="font-size:28px;">&#128336;</div>
        <div>
          <div class="cp-subpage-title">Clock and Region</div>
          <div class="cp-subpage-desc">Set the date, time, timezone, and locale number formats for this CyberZero workstation.</div>
        </div>
      </div>
      <div class="cp-clk-layout">
        <div class="cp-clk-left">
          <div class="cp-clock-widget">
            <div class="cp-clock-dial" id="cp-clock-display">${timeStr}</div>
            <div class="cp-clock-date" id="cp-clock-date">${dateStr}</div>
            <div class="cp-clock-tz"><span class="cp-tz-dot"></span>UTC+08:00 &middot; CyberZero Standard Time (CST)</div>
          </div>
          <div class="cp-clk-section">
            <div class="cp-clk-section-title">&#128197; Date &amp; Time</div>
            <div class="cp-clk-row"><span class="cp-clk-label">Current Date</span><span class="cp-clk-val" id="cp-date-val">${now.toLocaleDateString(locale)}</span></div>
            <div class="cp-clk-row"><span class="cp-clk-label">Current Time</span><span class="cp-clk-val" id="cp-time-val">${timeStr}</span></div>
            <div class="cp-clk-row"><span class="cp-clk-label">Time Zone</span><span class="cp-clk-val">(UTC+08:00) Manila, Hong Kong, Taipei</span></div>
            <div class="cp-clk-row"><span class="cp-clk-label">Sync Status</span><span class="cp-clk-val cp-clk-synced">&#10003; Synchronized with time.windows.com</span></div>
            <div class="cp-clk-row"><span class="cp-clk-label">Daylight Saving</span><span class="cp-clk-val">Not Observed (Philippines)</span></div>
          </div>
          <div class="cp-clk-section">
            <div class="cp-clk-section-title">&#128290; Region &amp; Number Formats</div>
            <div class="cp-clk-row"><span class="cp-clk-label">Region</span><span class="cp-clk-val">Philippines (en-PH)</span></div>
            <div class="cp-clk-row"><span class="cp-clk-label">Short Date</span><span class="cp-clk-val">${now.toLocaleDateString('en-PH',{month:'2-digit',day:'2-digit',year:'numeric'})}</span></div>
            <div class="cp-clk-row"><span class="cp-clk-label">Long Date</span><span class="cp-clk-val">${dateStr}</span></div>
            <div class="cp-clk-row"><span class="cp-clk-label">Currency</span><span class="cp-clk-val">Philippine Peso (&#8369;) &mdash; PHP</span></div>
            <div class="cp-clk-row"><span class="cp-clk-label">First Day of Week</span><span class="cp-clk-val">Sunday</span></div>
            <div class="cp-clk-row"><span class="cp-clk-label">Decimal Symbol</span><span class="cp-clk-val">. (period) &nbsp; e.g. 1,234.56</span></div>
          </div>
        </div>
        <div class="cp-clk-right">
          <div class="cp-cal-widget">
            <div class="cp-cal-header">
              <button class="cp-cal-nav" onclick="cpCalPrev()">&#9664;</button>
              <span class="cp-cal-month-name" id="cp-cal-month-name">${monthName}</span>
              <button class="cp-cal-nav" onclick="cpCalNext()">&#9654;</button>
            </div>
            <div class="cp-cal-grid" id="cp-cal-grid">${calCells}</div>
          </div>
          <div class="cp-clk-section" style="margin-top:14px;">
            <div class="cp-clk-section-title">&#127759; World Clocks</div>
            <div class="cp-world-clocks" id="cp-world-clocks"></div>
          </div>
        </div>
      </div>
    </div>
  `;

  if (_cpClockInterval) clearInterval(_cpClockInterval);
  _cpClockInterval = setInterval(() => {
    const n = new Date();
    const tStr = n.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    const dStr = n.toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const el1 = document.getElementById('cp-clock-display');
    const el2 = document.getElementById('cp-clock-date');
    const el3 = document.getElementById('cp-time-val');
    const el4 = document.getElementById('cp-date-val');
    if (el1) el1.textContent = tStr;
    if (el2) el2.textContent = dStr;
    if (el3) el3.textContent = tStr;
    if (el4) el4.textContent = n.toLocaleDateString('en-PH');
    renderCpWorldClocks();
  }, 1000);
  renderCpWorldClocks();
}

function renderCpWorldClocks() {
  const el = document.getElementById('cp-world-clocks');
  if (!el) return;
  const zones = [
    { city: 'Manila (Local)', offset: 8, flag: '&#127477;&#127469;' },
    { city: 'Tokyo', offset: 9, flag: '&#127471;&#127477;' },
    { city: 'London', offset: 0, flag: '&#127468;&#127463;' },
    { city: 'New York', offset: -4, flag: '&#127482;&#127480;' },
    { city: 'Los Angeles', offset: -7, flag: '&#127482;&#127480;' }
  ];
  const now = new Date();
  el.innerHTML = zones.map(z => {
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const zTime = new Date(utc + z.offset * 3600000);
    const tStr = zTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    return `<div class="cp-world-row"><span class="cp-world-flag">${z.flag}</span><span class="cp-world-city">${z.city}</span><span class="cp-world-time">${tStr}</span></div>`;
  }).join('');
}

let _cpCalOffset = 0;
function cpCalPrev() { _cpCalOffset--; cpRenderCal(); }
function cpCalNext() { _cpCalOffset++; cpRenderCal(); }
function cpRenderCal() {
  const base = new Date();
  base.setDate(1);
  base.setMonth(base.getMonth() + _cpCalOffset);
  const year = base.getFullYear();
  const month = base.getMonth();
  const todayNow = new Date();
  const isCurrentMonth = (year === todayNow.getFullYear() && month === todayNow.getMonth());
  const todayDate = todayNow.getDate();
  const monthName = base.toLocaleDateString('en-PH', { month: 'long', year: 'numeric' });
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const dayNames = ['Su','Mo','Tu','We','Th','Fr','Sa'];
  let cells = dayNames.map(d => `<div class="cp-cal-head">${d}</div>`).join('');
  for (let i = 0; i < firstDay; i++) cells += '<div class="cp-cal-cell cp-cal-empty"></div>';
  for (let d = 1; d <= daysInMonth; d++) {
    cells += `<div class="cp-cal-cell${isCurrentMonth && d === todayDate ? ' cp-cal-today' : ''}">${d}</div>`;
  }
  const g = document.getElementById('cp-cal-grid');
  const mn = document.getElementById('cp-cal-month-name');
  if (g) g.innerHTML = cells;
  if (mn) mn.textContent = monthName;
}
window.cpCalPrev = cpCalPrev;
window.cpCalNext = cpCalNext;

// ── Ease of Access Page ───────────────────────────────────────────
const _easeSettings = {
  highContrast: false, magnifier: false, narrator: false, largeText: false,
  stickyKeys: false, filterKeys: false, toggleKeys: false, mouseKeys: false,
  showFocusRect: true, cursorSize: 1
};

function renderCpEaseOfAccessPage(container) {
  const s = _easeSettings;
  function tog(key, id, label, desc) {
    return `<div class="cp-ease-row">
      <div class="cp-ease-info"><div class="cp-ease-name">${label}</div><div class="cp-ease-desc">${desc}</div></div>
      <label class="cp-toggle-switch">
        <input type="checkbox" id="${id}" ${s[key] ? 'checked' : ''} onchange="easeToggle('${key}', this.checked)">
        <span class="cp-toggle-track"><span class="cp-toggle-thumb"></span></span>
      </label>
    </div>`;
  }

  container.innerHTML = `
    <div class="cp-subpage cp-ease-page">
      <div class="cp-subpage-header">
        <div style="font-size:28px;">&#9855;</div>
        <div>
          <div class="cp-subpage-title">Ease of Access</div>
          <div class="cp-subpage-desc">Customize your CyberZero workstation for visual, hearing, and interaction accessibility needs.</div>
        </div>
      </div>
      <div class="cp-ease-layout">
        <div class="cp-ease-section">
          <div class="cp-ease-section-title"><span class="cp-ease-icon">&#128065;</span> Vision</div>
          ${tog('highContrast','ease-hc','High Contrast','Make text and apps easier to see with more distinct colors.')}
          ${tog('magnifier','ease-mag','Magnifier','Zoom in on parts of the screen to see content more clearly.')}
          ${tog('largeText','ease-lt','Larger Text Size','Increase font size across apps and the desktop interface.')}
          ${tog('showFocusRect','ease-fr','Show Focus Rectangle','Highlight the focused item with a visible border rectangle.')}
          <div class="cp-ease-row cp-ease-slider-row">
            <div class="cp-ease-info">
              <div class="cp-ease-name">Mouse Cursor Size</div>
              <div class="cp-ease-desc">Adjust the pointer size (1 = default, 5 = largest).</div>
            </div>
            <div class="cp-ease-slider-wrap">
              <input type="range" min="1" max="5" value="${s.cursorSize}" class="cp-ease-slider" id="ease-cursor-size" oninput="easeCursorSize(this.value)">
              <span class="cp-ease-slider-val" id="ease-cursor-val">${s.cursorSize}</span>
            </div>
          </div>
        </div>
        <div class="cp-ease-section">
          <div class="cp-ease-section-title"><span class="cp-ease-icon">&#128266;</span> Hearing</div>
          ${tog('narrator','ease-narr','Narrator (Screen Reader)','Read aloud text on screen and describe events like notifications.')}
          <div class="cp-ease-info-box"><span style="color:#38bdf8;">&#8505;</span> Narrator is a basic screen reader. For full accessibility, consider NVDA or JAWS.</div>
        </div>
        <div class="cp-ease-section">
          <div class="cp-ease-section-title"><span class="cp-ease-icon">&#9000;</span> Keyboard</div>
          ${tog('stickyKeys','ease-sk','Sticky Keys','Press one key at a time for keyboard shortcuts (Shift, Ctrl, Alt).')}
          ${tog('filterKeys','ease-fk','Filter Keys','Ignore or slow down brief or repeated keystrokes.')}
          ${tog('toggleKeys','ease-tk','Toggle Keys','Hear a tone when pressing Caps Lock, Num Lock, or Scroll Lock.')}
        </div>
        <div class="cp-ease-section">
          <div class="cp-ease-section-title"><span class="cp-ease-icon">&#128432;</span> Mouse</div>
          ${tog('mouseKeys','ease-mk','Mouse Keys','Control the mouse pointer using the numeric keypad.')}
        </div>
        <div class="cp-ease-recommend">
          <div class="cp-ease-recommend-icon">&#10024;</div>
          <div>
            <div class="cp-ease-recommend-title">Let Windows suggest settings</div>
            <div class="cp-ease-recommend-desc">Answer a few questions and Windows will recommend the best accessibility settings for your needs.</div>
          </div>
          <button class="cp-ease-recommend-btn" onclick="easeGetSuggestions()">Get Started</button>
        </div>
      </div>
    </div>
  `;
}

function easeToggle(key, val) {
  _easeSettings[key] = val;
  const names = { highContrast:'High Contrast', magnifier:'Magnifier', narrator:'Narrator',
    largeText:'Larger Text', stickyKeys:'Sticky Keys', filterKeys:'Filter Keys',
    toggleKeys:'Toggle Keys', mouseKeys:'Mouse Keys', showFocusRect:'Focus Rectangle' };
  if (typeof showToast === 'function') showToast(`${val ? '✅' : '⬛'} ${names[key]||key} ${val ? 'enabled' : 'disabled'}.`, 'info');
}

function easeCursorSize(val) {
  _easeSettings.cursorSize = parseInt(val);
  const el = document.getElementById('ease-cursor-val');
  if (el) el.textContent = val;
  if (typeof showToast === 'function') showToast(`Mouse cursor size set to ${val}.`, 'info');
}

function easeGetSuggestions() {
  if (typeof showToast === 'function') {
    showToast('Accessibility wizard: Based on your usage, High Contrast and Larger Text are recommended.', 'info');
  }
}

window.easeToggle = easeToggle;
window.easeCursorSize = easeCursorSize;
window.easeGetSuggestions = easeGetSuggestions;
window.renderCpClockRegionPage = renderCpClockRegionPage;
window.renderCpEaseOfAccessPage = renderCpEaseOfAccessPage;

// Auto-run on DOM ready to preserve desktop icon removals across sessions
document.addEventListener('DOMContentLoaded', () => {
  syncUninstalledAppsState();
});

// Window exports
window.initControlPanel = initControlPanel;
window.renderControlPanel = renderControlPanel;
window.setCpViewMode = setCpViewMode;
window.filterControlPanel = filterControlPanel;
window.openCpSubpage = openCpSubpage;
window.cpCatClick = cpCatClick;
window.cpLinkClick = cpLinkClick;
window.cpTileClick = cpTileClick;
window.selectCpProgram = selectCpProgram;
window.promptUninstall = promptUninstall;
window.startCpUninstall = startCpUninstall;
window.finishCpUninstall = finishCpUninstall;
window.cancelCpUninstall = cancelCpUninstall;
window.syncUninstalledAppsState = syncUninstalledAppsState;
window.handleToolbarUninstallClick = handleToolbarUninstallClick;

window.getUninstalledAppIds = getUninstalledAppIds;
window.CP_MASTER_PROGRAMS = CP_MASTER_PROGRAMS;
