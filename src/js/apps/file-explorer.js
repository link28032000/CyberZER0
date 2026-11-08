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

function _getExplorerAdditionalFiles() {
  if (typeof EXPLORER_ADDITIONAL_FILES !== 'undefined') return EXPLORER_ADDITIONAL_FILES;
  if (typeof window !== 'undefined' && window.EXPLORER_ADDITIONAL_FILES) return window.EXPLORER_ADDITIONAL_FILES;
  return {};
}

function _applyWannaCrySimulation(files, folderKey) {
  if (!window._wannaCryActive || !Array.isArray(files)) return files;

  const encFiles = files.map(file => {
    if (file.realExt === 'dir' || file.subFolderKey) return file;
    if (file.isEncrypted) return file;

    return Object.assign({}, file, {
      name: file.name.endsWith('.WNCRY') ? file.name : (file.name + '.WNCRY'),
      fakeExt: 'wncry',
      realExt: 'wncry',
      type: 'WannaCry Encrypted File (.WNCRY)',
      icon: '<span style="font-size:30px;display:inline-block;filter:drop-shadow(0 0 5px rgba(239,68,68,0.7));">🔒</span>',
      isEncrypted: true,
      threatName: 'Ransom.WannaCry.Encrypted',
      threatCategory: 'ENCRYPTED',
      analysis: '🔒 ENCRYPTED: Locked by WanaCrypt0r RSA-2048 cryptosystem. Key held by Wana Decrypt0r 3.0.'
    });
  });

  const readme = {
    id: 'wncry_readme_' + (folderKey || 'folder'),
    name: '@Please_Read_Me@.txt',
    fakeExt: 'txt',
    realExt: 'txt',
    type: 'Text Document (.txt)',
    size: '4 KB',
    date: new Date().toLocaleDateString() + ' 12:00 PM',
    icon: '📄',
    isMalware: false,
    threatName: 'Ransom Instructions',
    threatCategory: 'WARNING',
    analysis: '⚠️ Official WanaCrypt0r Ransom Note containing instructions and decryption service requirements.',
    content: window.WANNA_CRY_README_CONTENT || 'Your files are encrypted.'
  };

  return [readme, ...encFiles];
}

function getExplorerCurrentFiles() {
  const _additionalFiles = _getExplorerAdditionalFiles();
  let result = [];

  // 'downloads' shows only its static folder entries (e.g. Games subfolder)
  if (currentExplorerFolder === 'downloads') {
    const _dlFiles = _additionalFiles['downloads'] || [];
    // Hide Games folder and simulation files in Chapter 1 — Ch2 only
    if (window._currentChapterCategory !== 'malware') {
      result = _dlFiles.filter(function(f) { return f.id !== 'dl_games_folder' && !f.isSimulation; });
    } else {
      result = _dlFiles;
    }
  } else if (currentExplorerFolder === 'thispc_contents') {
    result = _additionalFiles['thispc'] || [];
  } else if (currentExplorerFolder === 'usb_contents') {
    result = _additionalFiles['usb'] || [];
  } else if (currentExplorerFolder === 'documents') {
    const isCh2 = (window._currentChapterCategory === 'malware' ||
                   (typeof activeCategoryStory !== 'undefined' && activeCategoryStory === 'malware') ||
                   (typeof gameState !== 'undefined' && gameState.phase === 'malware'));
    if (!isCh2) {
      if (typeof initPretestResultDocument === 'function') {
        initPretestResultDocument();
      } else if (typeof window !== 'undefined' && typeof window.initPretestResultDocument === 'function') {
        window.initPretestResultDocument();
      }
      if (typeof initPosttestResultDocument === 'function') {
        initPosttestResultDocument();
      } else if (typeof window !== 'undefined' && typeof window.initPosttestResultDocument === 'function') {
        window.initPosttestResultDocument();
      }
    } else {
      if (typeof initCh2PretestResultDocument === 'function') {
        initCh2PretestResultDocument();
      } else if (typeof window !== 'undefined' && typeof window.initCh2PretestResultDocument === 'function') {
        window.initCh2PretestResultDocument();
      }
      if (typeof initCh2AssessmentResultDocument === 'function') {
        initCh2AssessmentResultDocument();
      } else if (typeof window !== 'undefined' && typeof window.initCh2AssessmentResultDocument === 'function') {
        window.initCh2AssessmentResultDocument();
      }
      if (typeof initCh2PosttestResultDocument === 'function') {
        initCh2PosttestResultDocument();
      } else if (typeof window !== 'undefined' && typeof window.initCh2PosttestResultDocument === 'function') {
        window.initCh2PosttestResultDocument();
      }
    }
    const docFiles = _additionalFiles['documents'] || [];
    if (isCh2) {
      // Hide Chapter 1 pre-test and post-test results in Chapter 2, show Chapter 2 documents
      result = docFiles.filter(function(f) {
        return f.id !== 'doc_pretest_result' && f.id !== 'doc_posttest_result' && f.chapter !== 1;
      });
    } else {
      // Hide Chapter 2 pre-test result, assessment result, and post-test result in Chapter 1
      result = docFiles.filter(function(f) {
        return f.id !== 'doc_ch2_pretest_result' && f.id !== 'doc_ch2_assessment_result' && f.id !== 'doc_ch2_posttest_result' && f.chapter !== 2;
      });
    }
  } else if (currentExplorerFolder === 'desktop') {
    const isCh2 = (window._currentChapterCategory === 'malware' ||
                   (typeof activeCategoryStory !== 'undefined' && activeCategoryStory === 'malware') ||
                   (typeof gameState !== 'undefined' && (gameState.phase === 'malware' || gameState.chapter === 'malware')));
    const deskFiles = _additionalFiles['desktop'] || [];
    if (!isCh2) {
      result = deskFiles.filter(function(f) { return !f.chapter || f.chapter === 1; });
    } else {
      result = deskFiles;
    }
  } else if (currentExplorerFolder === 'pictures') {
    // Pictures folder: Chapter 2 has Ethan's personal photos; Chapter 1 has an empty pictures folder (no pictures)
    const isCh2 = (window._currentChapterCategory === 'malware' ||
                   (typeof activeCategoryStory !== 'undefined' && activeCategoryStory === 'malware') ||
                   (typeof gameState !== 'undefined' && (gameState.phase === 'malware' || gameState.chapter === 'malware')));
    const picFiles = _additionalFiles['pictures'] || [];
    if (isCh2) {
      result = picFiles; // show all 3 personal photos in Chapter 2
    } else {
      // In Chapter 1 and other chapters: folder is available, but has no pictures
      result = [];
    }
  } else if (currentExplorerFolder === 'videos') {
    // Chapter isolation for Videos folder:
    // Chapter 2 shows "What Is Malware.mp4" for learning activity.
    // Chapter 1 shows "cyber_awareness_clip.mp4".
    const isCh2 = (window._currentChapterCategory === 'malware' ||
                   (typeof activeCategoryStory !== 'undefined' && activeCategoryStory === 'malware') ||
                   (typeof gameState !== 'undefined' && (gameState.phase === 'malware' || gameState.chapter === 'malware')) ||
                   (typeof _isChapter2Active === 'function' && _isChapter2Active()));
    const vidFiles = _additionalFiles['videos'] || [];
    if (isCh2) {
      result = vidFiles.filter(function(f) {
        return f.id === 'vid_what_is_malware' || (f.name && f.name.toLowerCase().includes('malware'));
      });
    } else {
      result = vidFiles.filter(function(f) {
        return f.id !== 'vid_what_is_malware' && (!f.name || !f.name.toLowerCase().includes('malware'));
      });
    }
  } else {
    result = _additionalFiles[currentExplorerFolder] || [];
  }

  return _applyWannaCrySimulation(result, currentExplorerFolder);
}

function getExplorerFileById(fileId) {
  if (fileId && fileId.startsWith('wncry_readme')) {
    return {
      id: fileId,
      name: '@Please_Read_Me@.txt',
      fakeExt: 'txt',
      realExt: 'txt',
      type: 'Text Document (.txt)',
      size: '4 KB',
      date: new Date().toLocaleDateString() + ' 12:00 PM',
      icon: '📄',
      isMalware: false,
      threatName: 'Ransom Instructions',
      threatCategory: 'WARNING',
      analysis: '⚠️ Official WanaCrypt0r Ransom Note containing instructions and decryption service requirements.',
      content: window.WANNA_CRY_README_CONTENT || 'Your files are encrypted.'
    };
  }

  // Hide Chapter 1 pre-test and post-test results in Chapter 2, and Chapter 2 results in Chapter 1
  const isCh2 = (window._currentChapterCategory === 'malware' ||
                 (typeof activeCategoryStory !== 'undefined' && activeCategoryStory === 'malware') ||
                 (typeof gameState !== 'undefined' && (gameState.phase === 'malware' || gameState.chapter === 'malware')));
  if (isCh2 && (fileId === 'doc_pretest_result' || fileId === 'doc_posttest_result')) {
    return null;
  }
  if (!isCh2 && (fileId === 'doc_ch2_pretest_result' || fileId === 'ch2_pretest_result_report.docx' ||
                 fileId === 'doc_ch2_assessment_result' || fileId === 'ch2_assessment_result_report.docx')) {
    return null;
  }

  // Chapter 2 Pictures isolation: only available in Chapter 2
  const ch2PictureIds = ['pic_cat', 'pic_dog', 'pic_selfie', 'cat.png', 'my_dog.png', 'selfie.png'];
  if (!isCh2 && ch2PictureIds.includes(fileId)) {
    return null;
  }

  if (fileId === 'doc_ch2_assessment_result' || fileId === 'ch2_assessment_result_report.docx') {
    const _additionalFiles = _getExplorerAdditionalFiles();
    const docs = _additionalFiles.documents || [];
    let foundDoc = docs.find(f => f.id === 'doc_ch2_assessment_result');
    if (!foundDoc && typeof _findCh2AssessmentResultData === 'function') {
      foundDoc = _findCh2AssessmentResultData();
      if (foundDoc && typeof EXPLORER_ADDITIONAL_FILES !== 'undefined' && Array.isArray(EXPLORER_ADDITIONAL_FILES.documents)) {
        EXPLORER_ADDITIONAL_FILES.documents.push(foundDoc);
      }
    }
    if (foundDoc) return foundDoc;
  }

  if (fileId === 'doc_ch2_pretest_result' || fileId === 'ch2_pretest_result_report.docx' || (isCh2 && fileId === 'pretest_result_report.docx')) {
    const _additionalFiles = _getExplorerAdditionalFiles();
    const docs = _additionalFiles.documents || [];
    let foundDoc = docs.find(f => f.id === 'doc_ch2_pretest_result');
    if (!foundDoc && typeof _findCh2PretestResultData === 'function') {
      foundDoc = _findCh2PretestResultData();
      if (foundDoc && typeof EXPLORER_ADDITIONAL_FILES !== 'undefined' && Array.isArray(EXPLORER_ADDITIONAL_FILES.documents)) {
        EXPLORER_ADDITIONAL_FILES.documents.push(foundDoc);
      }
    }
    if (foundDoc) return foundDoc;
  }

  if (fileId === 'doc_ch2_posttest_result' || fileId === 'ch2_posttest_result_report.docx' || fileId === 'ch2_posttest_report.docx' || fileId === 'Cybersecurity Malware Post-Test Assessment Report.docx' || (isCh2 && fileId === 'posttest_result_report.docx')) {
    const _additionalFiles = _getExplorerAdditionalFiles();
    const docs = _additionalFiles.documents || [];
    let foundDoc = docs.find(f => f.id === 'doc_ch2_posttest_result');
    if (!foundDoc && typeof _findCh2PosttestResultData === 'function') {
      foundDoc = _findCh2PosttestResultData();
      if (foundDoc && typeof EXPLORER_ADDITIONAL_FILES !== 'undefined' && Array.isArray(EXPLORER_ADDITIONAL_FILES.documents)) {
        EXPLORER_ADDITIONAL_FILES.documents.push(foundDoc);
      }
    }
    if (foundDoc) return foundDoc;
  }

  if (fileId === 'f_scholarship_grant') {
    if (window.ch1DownloadsList && window.ch1DownloadsList.length > 0) {
      const f = window.ch1DownloadsList.find(x => x.id === 'f_scholarship_grant');
      if (f) return f;
    }
    return getScholarshipGrantFileDef();
  }

  // First check FOLDER_FILES
  let found = FOLDER_FILES.find(f => f.id === fileId);
  if (!found) {
    // Check additional folder collections
    const _additionalFiles = _getExplorerAdditionalFiles();
    for (const list of Object.values(_additionalFiles)) {
      if (Array.isArray(list)) {
        found = list.find(f => f.id === fileId);
        if (found) break;
      }
    }
  }

  if (found && window._wannaCryActive && found.realExt !== 'dir' && !found.subFolderKey) {
    return Object.assign({}, found, {
      name: found.name.endsWith('.WNCRY') ? found.name : (found.name + '.WNCRY'),
      fakeExt: 'wncry',
      realExt: 'wncry',
      type: 'WannaCry Encrypted File (.WNCRY)',
      icon: '<span style="font-size:30px;display:inline-block;filter:drop-shadow(0 0 5px rgba(239,68,68,0.7));">🔒</span>',
      isEncrypted: true,
      threatName: 'Ransom.WannaCry.Encrypted',
      threatCategory: 'ENCRYPTED',
      analysis: '🔒 ENCRYPTED: Locked by WanaCrypt0r RSA-2048 cryptosystem. Key held by Wana Decrypt0r 3.0.'
    });
  }

  return found || null;
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
           oncontextmenu="event.preventDefault(); event.stopPropagation(); selectFolderFile('${file.id}'); if(typeof showExplorerFileContextMenu==='function') showExplorerFileContextMenu(event.clientX, event.clientY, '${file.id}');"
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
      row.oncontextmenu = (e) => {
        e.preventDefault();
        e.stopPropagation();
        selectFolderFile(file.id);
        if (typeof showExplorerFileContextMenu === 'function') {
          showExplorerFileContextMenu(e.clientX, e.clientY, file.id);
        }
      };

      const isPictureFile = (file.realExt === 'png' || file.realExt === 'jpg' || file.realExt === 'jpeg' || file.realExt === 'gif' || file.realExt === 'webp');
      let rowIcon = file.icon;
      if (!rowIcon) {
        if (file.fakeExt === 'dir' || file.realExt === 'dir') {
          rowIcon = '📁';
        } else if (file.realExt === 'docx' || file.realExt === 'doc') {
          rowIcon = '<img src="assets/Desktop/Word.png" alt="Word" style="width:16px;height:16px;object-fit:contain;vertical-align:middle;display:inline-block;" onerror="this.onerror=null;this.parentElement.textContent=\'📄\';" />';
        } else {
          rowIcon = '📄';
        }
      } else if (typeof rowIcon === 'string' && (rowIcon.startsWith('assets/') || rowIcon.endsWith('.png') || rowIcon.endsWith('.svg'))) {
        rowIcon = `<img src="${rowIcon}" alt="" style="width:16px;height:16px;object-fit:contain;vertical-align:middle;display:inline-block;" onerror="this.onerror=null;this.parentElement.textContent=\'📄\';" />`;
      }
      if (isPictureFile && currentExplorerFolder === 'pictures') {
        rowIcon = '<img class="explorer-detail-photo-icon" src="assets/Pictures/image.svg" alt="Photo" style="width:16px;height:16px;object-fit:contain;vertical-align:middle;display:inline-block;" />';
      }

      const fileDate = file.date || file.dateModified || '—';
      const fileType = file.type || (file.realExt ? `${file.realExt.toUpperCase()} File` : 'File');
      const fileSize = file.size || '—';

      row.innerHTML = `
        <div class="file-name-cell">
          <span class="file-icon">${rowIcon}</span>
          <span class="file-name-text" title="${file.name}">${file.name}</span>
        </div>
        <div>${fileDate}</div>
        <div>${fileType}</div>
        <div>${fileSize}</div>`;

      list.appendChild(row);
    } else {
      // Large Icons Grid View
      const card = document.createElement('div');
      card.className = `grid-file-card ${file.id === gameState.selectedFolderFileId ? 'selected' : ''} ${file.quarantined ? 'quarantined' : ''}`;
      card.onclick = () => selectFolderFile(file.id);
      card.ondblclick = () => openFileFromFolder(file.id);
      card.oncontextmenu = (e) => {
        e.preventDefault();
        e.stopPropagation();
        selectFolderFile(file.id);
        if (typeof showExplorerFileContextMenu === 'function') {
          showExplorerFileContextMenu(e.clientX, e.clientY, file.id);
        }
      };

      let cardIcon = file.icon;
      if (!cardIcon) {
        if (file.fakeExt === 'dir' || file.realExt === 'dir') {
          cardIcon = '📁';
        } else if (file.realExt === 'docx' || file.realExt === 'doc') {
          cardIcon = '<img src="assets/Desktop/Word.png" alt="Word" style="width:38px;height:38px;object-fit:contain;display:block;margin:0 auto;" onerror="this.onerror=null;this.parentElement.textContent=\'📄\';" />';
        } else {
          cardIcon = '📄';
        }
      } else if (typeof cardIcon === 'string' && (cardIcon.startsWith('assets/') || cardIcon.endsWith('.png') || cardIcon.endsWith('.svg'))) {
        cardIcon = `<img src="${cardIcon}" alt="" style="width:38px;height:38px;object-fit:contain;display:block;margin:0 auto;" onerror="this.onerror=null;this.parentElement.textContent=\'📄\';" />`;
      }

      card.innerHTML = `
        <div class="grid-card-icon">${cardIcon}</div>
        <div class="grid-card-name" title="${file.name}">${file.name}</div>
        ${isDesktop ? '' : `<div class="grid-card-tag">${file.size || ''}</div>`}`;

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
  const isCh2FolderCheck = (window._currentChapterCategory === 'malware' ||
                            (typeof activeCategoryStory !== 'undefined' && activeCategoryStory === 'malware') ||
                            (typeof gameState !== 'undefined' && (gameState.phase === 'malware' || gameState.chapter === 'malware')));
  // Block Games folder access in Chapter 1 — Ch2 only
  if (folderKey === 'games' && !isCh2FolderCheck) {
    if (typeof showToast === 'function') {
      showToast('📁 Games folder is not available in this chapter.', 'info');
    }
    return;
  }
  currentExplorerFolder = folderKey;
  if (typeof window !== 'undefined') window.currentExplorerFolder = folderKey;

  // Auto-switch view mode: Pictures -> grid, Documents/Downloads -> details
  if (folderKey === 'pictures') {
    if (typeof setExplorerViewMode === 'function') {
      setExplorerViewMode('grid');
    } else {
      explorerViewMode = 'grid';
      if (typeof window !== 'undefined') window.explorerViewMode = 'grid';
    }
  } else if (folderKey === 'documents' || folderKey === 'downloads' || folderKey === 'thispc_contents') {
    if (typeof setExplorerViewMode === 'function') {
      setExplorerViewMode('details');
    } else {
      explorerViewMode = 'details';
      if (typeof window !== 'undefined') window.explorerViewMode = 'details';
    }
  }

  // Notify post-award mission checklist (Chapter 1)
  if (typeof window._notifyPostAwardFolderSwitch === 'function') {
    window._notifyPostAwardFolderSwitch(folderKey);
  }

  // Notify Chapter 2 mission tracker
  const _isCh2Active = typeof _isChapter2Active === 'function' ? _isChapter2Active() : (window._currentChapterCategory === 'malware');
  if (_isCh2Active) {
    if (folderKey === 'pictures' && typeof window.ch2OnPicturesFolderOpened === 'function') {
      window.ch2OnPicturesFolderOpened();
    }
    if (typeof window._ch2NotifyFolderOpen === 'function') {
      window._ch2NotifyFolderOpen(folderKey);
    }
    const note = document.getElementById('sticky-note');
    if (note && !note.classList.contains('hidden') && typeof updateStickyNoteForPhase === 'function') {
      updateStickyNoteForPhase('malware');
    }
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

  // Update documents badge count (hide Chapter 1 documents in Chapter 2, hide Chapter 2 in Chapter 1)
  const docBadge = document.getElementById('sidebar-documents-badge');
  const isCh2 = (window._currentChapterCategory === 'malware' ||
                 (typeof activeCategoryStory !== 'undefined' && activeCategoryStory === 'malware') ||
                 (typeof gameState !== 'undefined' && (gameState.phase === 'malware' || gameState.chapter === 'malware')));
  const _additionalFiles = _getExplorerAdditionalFiles();
  const allDocs = Array.isArray(_additionalFiles.documents) ? _additionalFiles.documents : [];
  const visibleDocs = isCh2
    ? allDocs.filter(f => f.id !== 'doc_pretest_result' && f.id !== 'doc_posttest_result' && f.chapter !== 1)
    : allDocs.filter(f => f.id !== 'doc_ch2_pretest_result' && f.id !== 'doc_ch2_assessment_result' && f.id !== 'doc_ch2_posttest_result' && f.chapter !== 2);
  const docCount = visibleDocs.length;
  if (docBadge) {
    docBadge.textContent = docCount;
    docBadge.style.display = docCount > 0 ? '' : 'none';
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

  // Update Tab & Address Bar icon for Pictures folder
  const tabIcon = (typeof document !== 'undefined' && document.querySelector) ? document.querySelector('#explorer-active-tab .tab-icon') : null;
  const addrIcon = (typeof document !== 'undefined' && document.querySelector) ? document.querySelector('.explorer-address-bar .address-icon') : null;
  if (folderKey === 'pictures') {
    if (tabIcon) tabIcon.innerHTML = '<img src="assets/Pictures/image.svg" alt="Pictures" style="width:14px;height:14px;object-fit:contain;vertical-align:middle;display:inline-block;" />';
    if (addrIcon) addrIcon.innerHTML = '<img src="assets/Pictures/image.svg" alt="Pictures" style="width:14px;height:14px;object-fit:contain;vertical-align:middle;display:inline-block;" />';
  } else {
    const defaultIcon = (folderKey === 'usb' || folderKey === 'usb_contents') ? '💾' : '📁';
    if (tabIcon) tabIcon.textContent = defaultIcon;
    if (addrIcon) addrIcon.textContent = defaultIcon;
  }

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
  if (typeof window !== 'undefined') window.explorerViewMode = mode;
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

  // Preserve Chapter 1 phishing scholarship quarantine flow
  const isCh1Phishing = (window._currentChapterCategory !== 'malware' &&
                         (typeof gameState === 'undefined' || gameState.phase !== 'malware'));
  if (isCh1Phishing && gameState.selectedFolderFileId === 'f_scholarship_grant') {
    quarantineFile('f_scholarship_grant');
    return;
  }
  if (isCh1Phishing && currentExplorerFolder === 'downloads') {
    quarantineFile(gameState.selectedFolderFileId);
    return;
  }

  // Chapter 2 simulated Recycle Bin deletion
  if (typeof deleteFileToRecycleBin === 'function') {
    deleteFileToRecycleBin(gameState.selectedFolderFileId, currentExplorerFolder);
  } else {
    showToast('🗑️ Deleted item.', 'info');
  }
}

// ── Explorer Right-Click Context Menu ──
let _ctxExplorerFileId = null;

function showExplorerFileContextMenu(x, y, fileId) {
  _ctxExplorerFileId = fileId;
  const file = getExplorerFileById(fileId);
  if (!file) return;

  let menu = document.getElementById('explorer-file-context-menu');
  if (!menu) {
    menu = document.createElement('div');
    menu.id = 'explorer-file-context-menu';
    menu.className = 'recycle-context-menu';
    menu.innerHTML = `
      <div class="rcb-ctx-item" onclick="explorerCtxAction('open')"><span>📂</span> Open</div>
      <div class="rcb-ctx-item" onclick="explorerCtxAction('scan')"><span>🛡️</span> Scan with ShieldAV</div>
      <div class="rcb-ctx-divider"></div>
      <div class="rcb-ctx-item" onclick="explorerCtxAction('delete')"><span>🗑️</span> Delete</div>
      <div class="rcb-ctx-divider"></div>
      <div class="rcb-ctx-item" onclick="explorerCtxAction('properties')"><span>📋</span> Properties</div>
    `;
    document.body.appendChild(menu);
  }

  const maxX = window.innerWidth - 180;
  const maxY = window.innerHeight - 170;
  menu.style.left = Math.min(x, maxX) + 'px';
  menu.style.top = Math.min(y, maxY) + 'px';
  menu.classList.add('active');
}
window.showExplorerFileContextMenu = showExplorerFileContextMenu;

window.explorerCtxAction = function (action) {
  const menu = document.getElementById('explorer-file-context-menu');
  if (menu) menu.classList.remove('active');
  if (!_ctxExplorerFileId) return;

  const file = getExplorerFileById(_ctxExplorerFileId);
  const targetId = _ctxExplorerFileId;

  if (action === 'open') {
    openFileFromFolder(targetId);
  } else if (action === 'scan') {
    if (typeof scanFileInAntivirus === 'function') {
      scanFileInAntivirus(targetId);
    }
  } else if (action === 'delete') {
    if (typeof deleteFileToRecycleBin === 'function') {
      deleteFileToRecycleBin(targetId, currentExplorerFolder);
    }
  } else if (action === 'properties' && file) {
    if (typeof showRecycleItemProperties === 'function') {
      const mockItem = {
        name: file.name,
        icon: file.icon || '📄',
        type: file.type || 'File',
        originalLocation: (typeof getFolderDisplayPath === 'function') ? getFolderDisplayPath(currentExplorerFolder) : currentExplorerFolder,
        dateDeleted: 'Active (Not Deleted)',
        size: file.size || '0 KB'
      };
      showRecycleItemProperties(mockItem);
      // Hide the restore button since it is not deleted
      const resBtn = document.getElementById('rcb-prop-restore-btn');
      if (resBtn) resBtn.style.display = 'none';
    }
  }
};

document.addEventListener('click', (e) => {
  const menu = document.getElementById('explorer-file-context-menu');
  if (menu && menu.classList.contains('active')) {
    if (!menu.contains(e.target)) {
      menu.classList.remove('active');
    }
  }
});

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
    const isPretestDoc = file.id === 'doc_pretest_result' || file.id === 'doc_ch2_pretest_result';
    const isPosttestDoc = file.id === 'doc_posttest_result' || file.id === 'doc_ch2_posttest_result';
    const isCh2Pretest = file.id === 'doc_ch2_pretest_result';
    const isCh2Posttest = file.id === 'doc_ch2_posttest_result';
    const docTitle = isCh2Posttest
      ? 'Chapter 2 Malware Post-Test Assessment Report'
      : (isPosttestDoc
          ? 'Cybersecurity Post-Test Assessment Report'
          : (isCh2Pretest ? 'Chapter 2 Malware Pre-Test Assessment Report' : (isPretestDoc ? 'Cybersecurity Pre-Test Assessment Report' : file.name)));
    const docSnippet = (isPosttestDoc || isCh2Posttest)
      ? 'Official final mastery score & evaluation report. Verified clean.'
      : (isPretestDoc ? 'Official baseline score & evaluation report. Verified clean.' : (file.analysis || 'Verified clean document.'));
    quickPreviewHtml = `
      <div class="fdp-quick-preview">
        <div class="fdp-preview-doc-card">
          <div class="fdp-preview-doc-title">📄 Microsoft Word Document</div>
          <div class="fdp-preview-doc-snippet">
            <strong>${docTitle}</strong><br>
            ${docSnippet}
          </div>
        </div>
        <button class="fdp-preview-open-btn" onclick="openFileFromFolder('${file.id}')">
          <span>📂</span> Open in Microsoft Word
        </button>
      </div>`;
  } else if (ext === 'jpg' || ext === 'png') {
    const imgSrc = file.mediaSrc || 'assets/Pictures/cat.png';
    quickPreviewHtml = `
      <div class="fdp-quick-preview">
        <img class="fdp-preview-img" src="${imgSrc}" alt="${file.name}" />
        <button class="fdp-preview-open-btn" onclick="openFileFromFolder('${file.id}')">
          <img src="assets/Pictures/image.svg" alt="" style="width:14px;height:14px;vertical-align:middle;display:inline-block;margin-right:4px;" /> View in Photos App
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
  } else if (file.id === 'game_gta6' || (file.name && file.name.includes('GTA VI')) || (file.name && file.name.toLowerCase() === 'gta 6')) {
    quickPreviewHtml = `
      <div class="fdp-quick-preview fdp-preview-gta-advisory">
        <div class="fdp-gta-hero-badge">
          <span class="fdp-gta-hero-icon">⚠️</span>
          <div>
            <div class="fdp-gta-hero-title">UNVERIFIED FAKE GAME INSTALLER</div>
            <div class="fdp-gta-hero-sub">Grand Theft Auto VI is not released on PC yet</div>
          </div>
        </div>

        <div class="fdp-gta-card">
          <div class="fdp-gta-card-hdr">📁 About Your File</div>
          <div class="fdp-gta-card-body">
            This file points to a counterfeit installer downloaded from an unofficial site. Attackers use unreleased gaming hype as a <strong>Trojan Horse trap</strong> to infect PCs with cryptominers (like the BM app) and ransomware.
          </div>
        </div>

        <div class="fdp-gta-card">
          <div class="fdp-gta-card-hdr">🛡️ How to Prevent Infection</div>
          <div class="fdp-gta-card-body">
            • <strong>Never download cracked or unreleased games:</strong> Torrents and unofficial "free leaks" are prime malware distribution traps.<br>
            • <strong>Keep Antivirus (ShieldAV) active:</strong> Never turn off real-time protection to run a suspicious setup file.<br>
            • <strong>Verify release dates:</strong> Always check official publisher channels (Rockstar Games) before trusting downloads.
          </div>
        </div>

        <div class="fdp-gta-card fdp-gta-card-support">
          <div class="fdp-gta-card-hdr">🎮 Download Officially &amp; Support Game Developers</div>
          <div class="fdp-gta-card-body">
            If you want a game, <strong>always download it through the official website or verified platforms like Steam</strong>. This guarantees 100% clean, virus-free game files and directly supports the developers who spent years creating the game!
          </div>
        </div>

        <div class="fdp-gta-actions">
          <button type="button" class="fdp-gta-btn-steam" onclick="openApp('steam'); if(typeof steamFocusGame==='function') steamFocusGame('gta6');">
            <img src="assets/icons/Chapter 2 new apps/steam.svg" alt="" style="width:13px;height:13px;vertical-align:middle;margin-right:5px;" />
            View Official Steam Store Page
          </button>
          <button type="button" class="fdp-gta-btn-advisory" onclick="showGtaSecurityAdvisoryModal()">
            <span>🛡️</span> Full Security Advisory
          </button>
        </div>
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

  // Trigger Ryan Guide dialogue and advisory when GTA VI is clicked/selected
  if (file.id === 'game_gta6' || (file.name && file.name.includes('GTA VI')) || (file.name && file.name.toLowerCase() === 'gta 6')) {
    if (typeof showGtaEducationalDialogue === 'function') {
      showGtaEducationalDialogue();
    }
  }
}
window.selectFolderFile = selectFolderFile;



function scanFileInAntivirus(fileId) {
  selectFolderFile(fileId);
  openApp('antivirus');
  focusWindow('antivirus');
  startActiveScan();
}

// ══════════════════════════════════════════════════════════════
// GTA VI SECURITY & EDUCATIONAL ADVISORY
// ══════════════════════════════════════════════════════════════
window.showGtaEducationalDialogue = function () {
  if (typeof RyanGuide !== 'undefined' && RyanGuide.speak) {
    RyanGuide.speak([
      {
        text: "Hold on, Ethan! That GTA VI download is a trap—attackers disguised dangerous <strong>WannaCry Ransomware</strong> as a fake game installer!",
        state: 'alert',
        label: 'CONTINUE'
      },
      {
        text: "<strong>Ransomware</strong> is malicious software that secretly encrypts your files and locks you out until you pay a ransom.",
        state: 'speaking',
        label: 'IS IT SAFE?'
      },
      {
        text: "🛡️ Don't worry—this is a <strong>harmless educational simulation</strong> designed to teach you how ransomware works.",
        state: 'thinking',
        label: 'CONTINUE'
      },
      {
        text: "No real files on your computer will be affected! Double-click it to start the simulation safely.",
        state: 'success',
        label: 'UNDERSTOOD'
      }
    ], { chapter: 'malware' });
  }
  if (typeof showToast === 'function') {
    showToast('⚠️ GTA VI: Ransomware simulation. Double-click to launch safely.', 'warning');
  }
};

window.showGtaSecurityAdvisoryModal = function () {
  const modal = document.getElementById('gta-security-modal');
  if (modal) {
    modal.classList.remove('hidden');
  } else if (typeof showGtaEducationalDialogue === 'function') {
    showGtaEducationalDialogue();
  }
};

window.closeGtaSecurityAdvisoryModal = function () {
  const modal = document.getElementById('gta-security-modal');
  if (modal) {
    modal.classList.add('hidden');
  }
};

// Dismiss GTA security advisory modal on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const modal = document.getElementById('gta-security-modal');
    if (modal && !modal.classList.contains('hidden')) {
      closeGtaSecurityAdvisoryModal();
    }
  }
});
