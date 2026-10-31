'use strict';

function getScholarshipGrantFileDef() {
  return {
    id: 'f_scholarship_grant',
    name: 'Scholarship_Form.pdf.exe',
    fakeExt: 'pdf',
    realExt: 'exe',
    type: 'Executable Application (.exe)',
    size: '2.4 MB',
    date: 'Today, 2:40 PM',
    icon: '⚙️',
    isMalware: true,
    threatName: 'Trojan.Win32.DoubleExt.Dropper',
    threatCategory: 'TROJAN DROPPER',
    hash: 'e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7',
    analysis: '⚠️ DOUBLE EXTENSION: Disguised as a PDF document, but the real file extension is .exe. Executing this will launch an unauthorized malware dropper.',
    quarantined: false,
    scanned: false,
    isInstaller: true
  };
}

function getExplorerCurrentFiles() {
  // 'downloads' shows only its static folder entries (e.g. Games subfolder)
  if (currentExplorerFolder === 'downloads') {
    const _dlFiles = EXPLORER_ADDITIONAL_FILES['downloads'] || [];
    // Hide Games folder and simulation files in Chapter 1 — Ch2 only
    if (window._currentChapterCategory !== 'malware') {
      return _dlFiles.filter(function(f) { return f.id !== 'dl_games_folder' && !f.isSimulation; });
    }
    return _dlFiles;
  }
  // thispc_contents shows the actual C: folder list
  if (currentExplorerFolder === 'thispc_contents') {
    return EXPLORER_ADDITIONAL_FILES['thispc'] || [];
  }
  // usb_contents shows the USB drive folder list (empty)
  if (currentExplorerFolder === 'usb_contents') {
    return EXPLORER_ADDITIONAL_FILES['usb'] || [];
  }
  return EXPLORER_ADDITIONAL_FILES[currentExplorerFolder] || [];
}

function getExplorerFileById(fileId) {
  if (fileId === 'f_scholarship_grant') {
    if (window.ch1DownloadsList && window.ch1DownloadsList.length > 0) {
      const f = window.ch1DownloadsList.find(x => x.id === 'f_scholarship_grant');
      if (f) return f;
    }
    return getScholarshipGrantFileDef();
  }

  // First check FOLDER_FILES
  let found = FOLDER_FILES.find(f => f.id === fileId);
  if (found) return found;

  // Check additional folder collections
  for (const list of Object.values(EXPLORER_ADDITIONAL_FILES)) {
    found = list.find(f => f.id === fileId);
    if (found) return found;
  }
  return null;
}

function renderFolderFiles(filterQuery = '') {
  const list = document.getElementById('folder-file-list');
  if (!list) return;
  list.innerHTML = '';
  list.removeAttribute('style');

  // ── SPECIAL VIEW: "This PC" — Devices and Drives ──────────────
  if (currentExplorerFolder === 'thispc') {
    list.className = 'folder-file-list thispc-view';
    list.innerHTML = `
      <div style="padding:8px 14px 0">
        <div class="thispc-section-label">Devices and drives</div>
        <div class="thispc-drives-grid">
          <div class="thispc-drive-card" id="drive-card-c" ondblclick="switchExplorerFolder('thispc_contents')" onclick="document.querySelectorAll('.thispc-drive-card').forEach(c=>c.classList.remove('selected'));this.classList.add('selected')" title="Double-click to open Windows (C:)">
            <div class="thispc-drive-card-top">
              <div class="thispc-drive-icon">💻<span class="drive-badge">C</span></div>
              <div class="thispc-drive-info">
                <div class="thispc-drive-name">Windows (C:)</div>
                <div class="thispc-drive-free">182 GB free of 512 GB</div>
              </div>
            </div>
            <div class="thispc-drive-bar"><div class="thispc-drive-bar-fill" style="width:64%"></div></div>
          </div>
          <div class="thispc-drive-card" id="drive-card-e" onclick="document.querySelectorAll('.thispc-drive-card').forEach(c=>c.classList.remove('selected'));this.classList.add('selected')" ondblclick="switchExplorerFolder('usb_contents')" title="Double-click to open USB Drive (E:)">
            <div class="thispc-drive-card-top">
              <div class="thispc-drive-icon">💾<span class="drive-badge">E</span></div>
              <div class="thispc-drive-info">
                <div class="thispc-drive-name">USB Drive (E:)</div>
                <div class="thispc-drive-free">16.0 GB free of 16.0 GB</div>
              </div>
            </div>
            <div class="thispc-drive-bar"><div class="thispc-drive-bar-fill empty" style="width:0%"></div></div>
          </div>
        </div>
        <div class="thispc-section-label">Network locations</div>
        <div class="thispc-drives-grid">
          <div class="thispc-drive-card" id="drive-card-net" ondblclick="switchExplorerFolder('network')" onclick="document.querySelectorAll('.thispc-drive-card').forEach(c=>c.classList.remove('selected'));this.classList.add('selected')" title="Double-click to open Network">
            <div class="thispc-drive-card-top">
              <div class="thispc-drive-icon">🌐</div>
              <div class="thispc-drive-info">
                <div class="thispc-drive-name">Network</div>
              </div>
            </div>
          </div>
        </div>
      </div>`;
    updateFolderStatusBar(3, null);
    return;
  }

  // ── SPECIAL VIEW: "USB Drive" root — show as drive card ──────
  if (currentExplorerFolder === 'usb') {
    list.className = 'folder-file-list thispc-view';
    list.innerHTML = `
      <div style="padding:8px 14px 0">
        <div class="thispc-section-label">USB Drive (E:)</div>
        <div class="thispc-drives-grid">
          <div class="thispc-drive-card" id="usb-open-card" ondblclick="switchExplorerFolder('usb_contents')" onclick="document.querySelectorAll('.thispc-drive-card').forEach(c=>c.classList.remove('selected'));this.classList.add('selected')" title="Double-click to open USB Drive (E:)">
            <div class="thispc-drive-card-top">
              <div class="thispc-drive-icon">💾<span class="drive-badge">E</span></div>
              <div class="thispc-drive-info">
                <div class="thispc-drive-name">USB Drive (E:)</div>
                <div class="thispc-drive-free">16.0 GB free of 16.0 GB</div>
              </div>
            </div>
            <div class="thispc-drive-bar"><div class="thispc-drive-bar-fill empty" style="width:0%"></div></div>
          </div>
        </div>
      </div>`;
    updateFolderStatusBar(1, null);
    return;
  }

  const isDesktop = (currentExplorerFolder === 'desktop');

  // ── SPECIAL VIEW: Desktop folder — Windows desktop icon layout ─
  if (isDesktop) {
    list.className = 'folder-file-list desktop-folder-view';

    const currentFiles = getExplorerCurrentFiles();
    const q = filterQuery.toLowerCase().trim();
    const filtered = currentFiles.filter(f => f.name.toLowerCase().includes(q) || f.type.toLowerCase().includes(q));

    if (filtered.length === 0) {
      list.className = 'folder-file-list empty-folder-view';
      list.innerHTML = `
        <div class="folder-empty-state">
          <div class="folder-empty-icon">🔍</div>
          <div class="folder-empty-text">No matching items.</div>
        </div>`;
      updateFolderStatusBar(0, null);
      return;
    }

    // Build column-flow grid of desktop icons
    list.innerHTML = `<div class="desk-folder-grid">${filtered.map(file => `
      <div class="desk-folder-icon ${file.id === gameState.selectedFolderFileId ? 'selected' : ''}"
           id="dfi-${file.id}"
           onclick="selectFolderFile('${file.id}')"
           ondblclick="openFileFromFolder('${file.id}')"
           title="${file.name}">
        <div class="dfi-icon">${file.icon}</div>
        <div class="dfi-name">${file.name}</div>
      </div>`).join('')}
    </div>`;

    updateFolderStatusBar(filtered.length, getExplorerFileById(gameState.selectedFolderFileId));
    return;
  }

  // Desktop folder is always shown in icon grid view
  const effectiveViewMode = explorerViewMode;
  list.className = `folder-file-list view-${effectiveViewMode}`;

  const currentFiles = getExplorerCurrentFiles();
  const q = filterQuery.toLowerCase().trim();
  let filtered = currentFiles.filter(f => f.name.toLowerCase().includes(q) || f.type.toLowerCase().includes(q));

  // Sort files
  filtered.sort((a, b) => {
    let valA = a[explorerSortCol] || '';
    let valB = b[explorerSortCol] || '';
    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();
    if (valA < valB) return explorerSortAsc ? -1 : 1;
    if (valA > valB) return explorerSortAsc ? 1 : -1;
    return 0;
  });

  if (filtered.length === 0) {
    const isUsb = (currentExplorerFolder === 'usb_contents');
    const emptyMsg = q ? 'No matching files found.' : (isUsb ? 'This drive is empty.' : 'This folder is empty.');
    const emptyIcon = q ? '🔍' : (isUsb ? '💾' : '📁');
    list.className = 'folder-file-list empty-folder-view';
    list.innerHTML = `
      <div class="folder-empty-state">
        <div class="folder-empty-icon">${emptyIcon}</div>
        <div class="folder-empty-text">${emptyMsg}</div>
      </div>`;
    updateFolderStatusBar(0, null);
    return;
  }

  filtered.forEach(file => {
    if (effectiveViewMode === 'details') {
      const row = document.createElement('div');
      row.className = `folder-file-row ${file.id === gameState.selectedFolderFileId ? 'selected' : ''} ${file.quarantined ? 'quarantined' : ''}`;
      row.onclick = () => selectFolderFile(file.id);
      row.ondblclick = () => openFileFromFolder(file.id);

      row.innerHTML = `
        <div class="file-name-cell">
          <span class="file-icon">${file.icon}</span>
          <span class="file-name-text" title="${file.name}">${file.name}</span>
        </div>
        <div>${file.date}</div>
        <div>${file.type}</div>
        <div>${file.size}</div>`;

      list.appendChild(row);
    } else {
      // Large Icons Grid View
      const card = document.createElement('div');
      card.className = `grid-file-card ${file.id === gameState.selectedFolderFileId ? 'selected' : ''} ${file.quarantined ? 'quarantined' : ''}`;
      card.onclick = () => selectFolderFile(file.id);
      card.ondblclick = () => openFileFromFolder(file.id);

      card.innerHTML = `
        <div class="grid-card-icon">${file.icon}</div>
        <div class="grid-card-name" title="${file.name}">${file.name}</div>
        ${isDesktop ? '' : `<div class="grid-card-tag">${file.size}</div>`}`;

      list.appendChild(card);
    }
  });

  const selectedFile = getExplorerFileById(gameState.selectedFolderFileId);
  updateFolderStatusBar(filtered.length, selectedFile);
}

function updateFolderStatusBar(itemCount, selectedFile) {
  const itemsEl = document.getElementById('explorer-status-items');
  const selEl = document.getElementById('explorer-status-selected');
  if (itemsEl) itemsEl.textContent = `${itemCount} item${itemCount === 1 ? '' : 's'}`;
  if (selEl) {
    if (selectedFile) {
      selEl.textContent = `1 item selected (${selectedFile.size})`;
    } else {
      selEl.textContent = `0 items selected`;
    }
  }
}

function filterFolderFiles(val) {
  renderFolderFiles(val);
}

function clearFolderSearch() {
  const inp = document.getElementById('folder-search-input');
  if (inp) {
    inp.value = '';
    renderFolderFiles('');
  }
}

function switchExplorerFolder(folderKey) {
  if (typeof isCh2IntroActive === 'function' && isCh2IntroActive()) {
    return;
  }
  // Block Games folder access in Chapter 1 — Ch2 only
  if (folderKey === 'games' && window._currentChapterCategory !== 'malware') {
    if (typeof showToast === 'function') {
      showToast('📁 Games folder is not available in this chapter.', 'info');
    }
    return;
  }
  currentExplorerFolder = folderKey;

  // Notify post-award mission checklist (Chapter 1)
  if (typeof window._notifyPostAwardFolderSwitch === 'function') {
    window._notifyPostAwardFolderSwitch(folderKey);
  }

  // Notify Chapter 2 mission tracker
  if (typeof window._ch2NotifyFolderOpen === 'function') {
    window._ch2NotifyFolderOpen(folderKey);
  }

  // Update history
  if (explorerHistory[explorerHistoryIdx] !== folderKey) {
    explorerHistory = explorerHistory.slice(0, explorerHistoryIdx + 1);
    explorerHistory.push(folderKey);
    explorerHistoryIdx = explorerHistory.length - 1;
  }

  // Update sidebar active class
  document.querySelectorAll('.explorer-sidebar .sidebar-item').forEach(el => el.classList.remove('active'));
  const _sidebarKey = (folderKey === 'thispc' || folderKey === 'thispc_contents' || folderKey.startsWith('dir_'))
    ? 'c'
    : (folderKey === 'usb' || folderKey === 'usb_contents') ? 'usb'
    : folderKey;
  const activeSidebarItem = document.getElementById(`sidebar-folder-${_sidebarKey}`) || document.getElementById(`sidebar-folder-${folderKey}`);
  if (activeSidebarItem) activeSidebarItem.classList.add('active');

  // Update downloads badge count (Ch2 malware files)
  const dlBadge = document.getElementById('downloads-badge');
  if (dlBadge) {
    dlBadge.textContent = FOLDER_FILES.length;
    dlBadge.style.display = FOLDER_FILES.length > 0 ? '' : 'none';
  }



  // Render Drive & Network Location Banners
  const bannerEl = document.getElementById('explorer-banner-area');
  if (bannerEl) {
    bannerEl.classList.add('hidden');
    bannerEl.innerHTML = '';
  }

  // Update breadcrumb
  const pathEl = document.getElementById('folder-active-path');
  const tabTitle = document.getElementById('explorer-tab-title');
  const searchInput = document.getElementById('folder-search-input');

  const folderNames = {
    downloads:             'Downloads',
    documents: 'Documents',
    pictures: 'Pictures',
    videos: 'Videos',
    music: 'Music',
    desktop: 'Desktop',
    thispc: 'This PC',
    thispc_contents: 'Windows (C:)',
    usb: 'USB Drive (E:)',
    usb_contents: 'USB Drive (E:)',
    network: 'Network',
    games: 'Games',
    // Windows C sub-folders
    dir_perflogs:   'PerfLogs',
    dir_progfiles:  'Program Files',
    dir_progfiles86:'Program Files (x86)',
    dir_users:      'Users',
    dir_windows:    'Windows'
  };

  // Map sub-folder keys back to their parent drive banner
  const subFolderParent = {
    dir_perflogs:   'thispc_contents',
    dir_progfiles:  'thispc_contents',
    dir_progfiles86:'thispc_contents',
    dir_users:      'thispc_contents',
    dir_windows:    'thispc_contents',
    thispc_contents: 'thispc',
    usb_contents:   'thispc',
    games:          'downloads'
  };
  const parentKey = subFolderParent[folderKey] || null;

  const displayName = folderNames[folderKey] || folderKey;
  const parentDriveName = parentKey ? (folderNames[parentKey] || parentKey) : null;
  const breadcrumb = parentDriveName ? `${parentDriveName} › ${displayName}` : displayName;
  if (pathEl) pathEl.textContent = breadcrumb;
  if (tabTitle) tabTitle.textContent = `${displayName} — File Explorer`;
  if (searchInput) searchInput.placeholder = `Search ${displayName}...`;

  // Reset search
  if (searchInput) searchInput.value = '';

  // Reset file selection
  gameState.selectedFolderFileId = null;
  const emptyEl = document.getElementById('fdp-empty');
  const contentEl = document.getElementById('fdp-content');
  if (emptyEl) emptyEl.classList.remove('hidden');
  if (contentEl) contentEl.classList.add('hidden');

  // Show/hide the details column header (Name / Date / Type / Size)
  const tableHeader = document.getElementById('explorer-table-header');
  if (tableHeader) {
    const hideHeader = (folderKey === 'desktop' || folderKey === 'thispc' || folderKey === 'usb');
    tableHeader.style.display = hideHeader ? 'none' : (explorerViewMode === 'details' ? 'grid' : 'none');
  }

  renderFolderFiles('');
}

function explorerGoBack() {
  if (explorerHistoryIdx > 0) {
    explorerHistoryIdx--;
    switchExplorerFolder(explorerHistory[explorerHistoryIdx]);
  }
}

function explorerGoForward() {
  if (explorerHistoryIdx < explorerHistory.length - 1) {
    explorerHistoryIdx++;
    switchExplorerFolder(explorerHistory[explorerHistoryIdx]);
  }
}

function explorerGoUp() {
  switchExplorerFolder('thispc');
}

function refreshExplorerFolder() {
  renderFolderFiles(document.getElementById('folder-search-input')?.value || '');
  showToast('📁 Folder refreshed.', 'info');
}

function setExplorerViewMode(mode) {
  explorerViewMode = mode;
  const btnDetails = document.getElementById('cmd-view-details');
  const btnGrid = document.getElementById('cmd-view-grid');
  const statBtnDetails = document.getElementById('stat-btn-details');
  const statBtnGrid = document.getElementById('stat-btn-grid');
  const header = document.getElementById('explorer-table-header');

  if (btnDetails) btnDetails.classList.toggle('active', mode === 'details');
  if (btnGrid) btnGrid.classList.toggle('active', mode === 'grid');
  if (statBtnDetails) statBtnDetails.classList.toggle('active', mode === 'details');
  if (statBtnGrid) statBtnGrid.classList.toggle('active', mode === 'grid');

  if (header) {
    header.style.display = (mode === 'details') ? 'grid' : 'none';
  }

  renderFolderFiles(document.getElementById('folder-search-input')?.value || '');
}

function toggleExplorerPreviewPane() {
  previewPaneVisible = !previewPaneVisible;
  const pane = document.getElementById('folder-detail-pane');
  const btn = document.getElementById('cmd-toggle-preview');
  if (pane) pane.classList.toggle('collapsed', !previewPaneVisible);
  if (btn) btn.classList.toggle('active', previewPaneVisible);
}


function sortExplorerFiles(col) {
  if (explorerSortCol === col) {
    explorerSortAsc = !explorerSortAsc;
  } else {
    explorerSortCol = col;
    explorerSortAsc = true;
  }
  renderFolderFiles(document.getElementById('folder-search-input')?.value || '');
}

function createNewExplorerTab() {
  showToast('📁 New File Explorer tab opened.', 'info');
}

function explorerNewItem() {
  showToast('ℹ️ System policy: Creating new files is restricted in simulation sandbox.', 'info');
}
function explorerCut() { showToast('Selected file cut to clipboard', 'info'); }
function explorerCopy() { showToast('Selected file copied to clipboard', 'info'); }
function explorerRename() { showToast('Rename file: Access denied (File locked by system)', 'warning'); }
function explorerDelete() {
  if (!gameState.selectedFolderFileId) {
    showToast('Please select a file first.', 'warning');
    return;
  }
  if (gameState.selectedFolderFileId === 'f_scholarship_grant') {
    quarantineFile('f_scholarship_grant');
    return;
  }
  if (currentExplorerFolder === 'downloads') {
    quarantineFile(gameState.selectedFolderFileId);
  } else {
    showToast('⚠️ Access Denied: Cannot delete protected system files. You can only delete downloaded files.', 'warning');
  }
}

function openSelectedExplorerFile() {
  if (!gameState.selectedFolderFileId) {
    showToast('⚠️ Please select a file from the list first.', 'warning');
    return;
  }
  openFileFromFolder(gameState.selectedFolderFileId);
}

function scanSelectedExplorerFile() {
  if (!gameState.selectedFolderFileId) {
    showToast('⚠️ Please select a file from the list first.', 'warning');
    return;
  }
  scanFileInAntivirus(gameState.selectedFolderFileId);
}

function quarantineSelectedExplorerFile() {
  if (!gameState.selectedFolderFileId) {
    showToast('⚠️ Please select a file from the list first.', 'warning');
    return;
  }
  quarantineFile(gameState.selectedFolderFileId);
}

function selectFolderFile(fileId) {
  gameState.selectedFolderFileId = fileId;
  const file = getExplorerFileById(fileId);
  renderFolderFiles(document.getElementById('folder-search-input')?.value || '');

  const emptyEl = document.getElementById('fdp-empty');
  const contentEl = document.getElementById('fdp-content');
  if (!file || !contentEl) return;

  emptyEl.classList.add('hidden');
  contentEl.classList.remove('hidden');

  // Determine analysis visual style
  let analysisClass = 'suspicious';
  if (file.scanned) {
    analysisClass = file.isMalware ? 'threat' : 'clean';
  }

  // Generate In-Pane Live Preview Widget based on file type
  let quickPreviewHtml = '';
  const ext = file.realExt.toLowerCase();

  if (ext === 'docx') {
    quickPreviewHtml = `
      <div class="fdp-quick-preview">
        <div class="fdp-preview-doc-card">
          <div class="fdp-preview-doc-title">📄 Microsoft Word Document</div>
          <div class="fdp-preview-doc-snippet">
            <strong>CyberZerØ Student Defense Architecture</strong><br>
            Technical specifications & endpoint guidelines v2.4. Zero macro triggers found.
          </div>
        </div>
        <button class="fdp-preview-open-btn" onclick="openFileFromFolder('${file.id}')">
          <span>📂</span> Open in Microsoft Word
        </button>
      </div>`;
  } else if (ext === 'jpg' || ext === 'png') {
    const imgSrc = file.mediaSrc || 'assets/background/Coffe shop.png';
    quickPreviewHtml = `
      <div class="fdp-quick-preview">
        <img class="fdp-preview-img" src="${imgSrc}" alt="${file.name}" />
        <button class="fdp-preview-open-btn" onclick="openFileFromFolder('${file.id}')">
          <span>🖼️</span> View in Photos App
        </button>
      </div>`;
  } else if (ext === 'mp4') {
    quickPreviewHtml = `
      <div class="fdp-quick-preview">
        <div class="fdp-preview-video-wrap">
          <video class="fdp-preview-video" src="${file.mediaSrc || 'assets/video/video3.mp4'}" muted preload="metadata"></video>
        </div>
        <button class="fdp-preview-open-btn" onclick="openFileFromFolder('${file.id}')">
          <span>🎬</span> Play in Media Player
        </button>
      </div>`;
  } else if (ext === 'mp3' || ext === 'wav' || ext === 'ogg' || ext === 'm4a') {
    quickPreviewHtml = `
      <div class="fdp-quick-preview" style="background:linear-gradient(135deg, rgba(30,58,138,0.25), rgba(139,92,246,0.25)); border:1px solid rgba(139,92,246,0.3); border-radius:8px; padding:16px 12px; text-align:center;">
        <div style="font-size:38px; margin-bottom:6px">🎵</div>
        <div style="font-size:12px; font-weight:700; color:#00e5ff; word-break:break-all">${file.name}</div>
        <div style="font-size:10.5px; color:#94a3b8; margin:4px 0 10px 0">${file.artist || 'CyberZero Soundtrack • 320 kbps MP3'}</div>
        <button class="fdp-preview-open-btn" onclick="openFileFromFolder('${file.id}')">
          <span>▶</span> Play in Media Player
        </button>
      </div>`;
  } else if (ext === 'srv' || ext === 'nas' || ext === 'ws' || ext === 'prt' || ext === 'mob' || ext === 'share') {
    quickPreviewHtml = `
      <div class="fdp-quick-preview" style="background:rgba(59,130,246,0.12); border:1px solid rgba(59,130,246,0.3); border-radius:8px; padding:16px 12px; text-align:center;">
        <div style="font-size:38px; margin-bottom:6px">${file.icon}</div>
        <div style="font-size:12px; font-weight:700; color:#60a5fa">${file.name}</div>
        <div style="font-size:10.5px; color:#94a3b8; margin:4px 0 10px 0">${file.type} • Status: ${file.date}</div>
        <button class="fdp-preview-open-btn" onclick="openFileFromFolder('${file.id}')">
          <span>🔗</span> Connect / Explore Resource
        </button>
      </div>`;
  } else if (ext === 'iso' || ext === 'pcap' || ext === 'bin' || ext === 'inf' || ext === 'log') {
    quickPreviewHtml = `
      <div class="fdp-quick-preview" style="background:rgba(0,229,255,0.08); border:1px solid rgba(0,229,255,0.25); border-radius:8px; padding:16px 12px; text-align:center;">
        <div style="font-size:38px; margin-bottom:6px">${file.icon}</div>
        <div style="font-size:12px; font-weight:700; color:#00e5ff">${file.name}</div>
        <div style="font-size:10.5px; color:#94a3b8; margin:4px 0 10px 0">${file.type} • ${file.size}</div>
        <button class="fdp-preview-open-btn" onclick="openFileFromFolder('${file.id}')">
          <span>📂</span> Inspect File
        </button>
      </div>`;
  } else if (file.isMalware || ext === 'exe' || ext === 'scr' || ext === 'vbs') {
    quickPreviewHtml = `
      <div class="fdp-quick-preview" style="background:rgba(255,82,82,0.08);border-color:rgba(255,82,82,0.3)">
        <div style="font-size:32px;margin-bottom:6px">⚠️</div>
        <div style="font-size:11px;font-weight:700;color:#ff5252">UNTRUSTED EXECUTABLE BINARY</div>
        <div style="font-size:10px;color:#94a3b8;margin-top:2px;text-align:center">Execution blocked by Defender SmartScreen</div>
      </div>`;
  }

  contentEl.innerHTML = `
    <div class="fdp-header">
      <div class="fdp-icon-large">${file.icon}</div>
      <div>
        <div class="fdp-name">${file.name}</div>
        <div style="font-size:11px;color:var(--text-muted);margin-top:2px">${file.type} • ${file.size}</div>
      </div>
    </div>

    ${quickPreviewHtml}

    <div class="fdp-meta-table">
      <div class="fdp-meta-row">
        <span class="fdp-meta-label">Date Modified</span>
        <span class="fdp-meta-val">${file.date}</span>
      </div>
      <div class="fdp-meta-row">
        <span class="fdp-meta-label">File Type</span>
        <span class="fdp-meta-val">${file.type}</span>
      </div>
      <div class="fdp-meta-row">
        <span class="fdp-meta-label">File Size</span>
        <span class="fdp-meta-val">${file.size}</span>
      </div>
      <div class="fdp-meta-row">
        <span class="fdp-meta-label">Extension</span>
        <span class="fdp-meta-val" style="color:${file.realExt === 'exe' || file.realExt === 'scr' || file.realExt === 'vbs' ? 'var(--accent-red)' : 'var(--accent-cyan)'}">.${file.realExt}</span>
      </div>
      <div class="fdp-meta-row">
        <span class="fdp-meta-label">SHA-256</span>
        <span class="fdp-meta-val">${file.hash ? file.hash.slice(0, 16) + '…' : 'N/A'}</span>
      </div>
    </div>

    <div class="fdp-analysis-box ${analysisClass}">
      ${file.analysis}
    </div>`;
}



function scanFileInAntivirus(fileId) {
  selectFolderFile(fileId);
  openApp('antivirus');
  focusWindow('antivirus');
  startActiveScan();
}
