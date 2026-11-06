/**
 * Windows Recycle Bin System
 * Chapter 2: The Hidden Threat — Virtual File System Simulation
 * 
 * Features:
 * - Familiar Windows File Explorer Recycle Bin UI
 * - Deletes files/folders to the virtual Recycle Bin (never touches real PC files)
 * - Displays original filenames, file types, original locations, and deletion dates
 * - Restore selected item, Restore all items, Delete Permanently, Empty Recycle Bin
 * - Windows File Properties modal with file metadata
 * - Purely in-memory simulation within browser JavaScript state
 */

(function () {
  'use strict';

  // In-memory Recycle Bin items storage
  window.recycleBinItems = [];
  window._selectedRecycleItemId = null;
  window._rcbSortCol = 'dateDeleted';
  window._rcbSortAsc = false;

  // Backup of pristine virtual file system for clean restarts
  let _pristineFilesBackup = null;

  function _backupPristineFiles() {
    if (_pristineFilesBackup) return;
    try {
      const src = (typeof EXPLORER_ADDITIONAL_FILES !== 'undefined')
        ? EXPLORER_ADDITIONAL_FILES
        : (window.EXPLORER_ADDITIONAL_FILES || null);
      if (src) {
        _pristineFilesBackup = JSON.parse(JSON.stringify(src));
      }
    } catch (e) {
      console.warn('Recycle Bin backup error:', e);
    }
  }

  // Map folder keys to realistic Windows paths
  function getFolderDisplayPath(folderKey) {
    const paths = {
      games: 'C:\\Users\\Ethan\\Downloads\\Games',
      desktop: 'C:\\Users\\Ethan\\Desktop',
      documents: 'C:\\Users\\Ethan\\Documents',
      downloads: 'C:\\Users\\Ethan\\Downloads',
      pictures: 'C:\\Users\\Ethan\\Pictures',
      videos: 'C:\\Users\\Ethan\\Videos',
      music: 'C:\\Users\\Ethan\\Music',
      thispc: 'C:\\',
      thispc_contents: 'C:\\',
      usb: 'E:\\',
      usb_contents: 'E:\\'
    };
    return paths[folderKey] || ('C:\\Users\\Ethan\\' + (folderKey || 'Desktop'));
  }
  window.getFolderDisplayPath = getFolderDisplayPath;

  // ══════════════════════════════════════════════════════════════
  // MOVE FILE TO RECYCLE BIN (VIRTUAL DELETE)
  // ══════════════════════════════════════════════════════════════
  window.deleteFileToRecycleBin = function (fileId, sourceFolder) {
    if (!fileId) {
      if (typeof showToast === 'function') showToast('Please select a file to delete.', 'warning');
      return;
    }

    // Safety: Protect the Recycle Bin shortcut itself from deletion
    if (fileId === 'desk_app_recycle') {
      if (typeof showToast === 'function') {
        showToast('⚠️ System Policy: The Recycle Bin itself cannot be deleted.', 'warning');
      }
      if (typeof AudioManager !== 'undefined' && AudioManager.playWrong) AudioManager.playWrong();
      return;
    }

    // Preserve Chapter 1 phishing scholarship form quarantine behavior
    const isCh1Phishing = (window._currentChapterCategory !== 'malware' &&
                           (typeof gameState === 'undefined' || gameState.phase !== 'malware'));
    if (isCh1Phishing && (fileId === 'f_scholarship_grant' || (sourceFolder === 'downloads' && fileId.includes('scholarship')))) {
      if (typeof quarantineFile === 'function') {
        quarantineFile('f_scholarship_grant');
        return;
      }
    }

    _backupPristineFiles();

    // Locate the file in EXPLORER_ADDITIONAL_FILES
    const addFiles = (typeof EXPLORER_ADDITIONAL_FILES !== 'undefined')
      ? EXPLORER_ADDITIONAL_FILES
      : (window.EXPLORER_ADDITIONAL_FILES || {});

    let foundFile = null;
    let actualFolder = sourceFolder || 'downloads';
    let foundIndex = -1;

    // Check specified source folder first
    if (actualFolder && Array.isArray(addFiles[actualFolder])) {
      foundIndex = addFiles[actualFolder].findIndex(f => f.id === fileId);
      if (foundIndex !== -1) {
        foundFile = addFiles[actualFolder][foundIndex];
        addFiles[actualFolder].splice(foundIndex, 1);
      }
    }

    // If not found in sourceFolder, search across all folders
    if (!foundFile) {
      for (const [fKey, list] of Object.entries(addFiles)) {
        if (Array.isArray(list)) {
          const idx = list.findIndex(f => f.id === fileId);
          if (idx !== -1) {
            foundFile = list[idx];
            actualFolder = fKey;
            list.splice(idx, 1);
            break;
          }
        }
      }
    }

    // Also check FOLDER_FILES if still not found
    if (!foundFile && typeof FOLDER_FILES !== 'undefined' && Array.isArray(FOLDER_FILES)) {
      const idx = FOLDER_FILES.findIndex(f => f.id === fileId);
      if (idx !== -1) {
        foundFile = FOLDER_FILES[idx];
        actualFolder = 'downloads';
        FOLDER_FILES.splice(idx, 1);
      }
    }

    if (!foundFile) {
      if (typeof showToast === 'function') {
        showToast('⚠️ Could not locate file to delete.', 'warning');
      }
      return;
    }

    // Format human-readable location
    const locationStr = getFolderDisplayPath(actualFolder);
    const now = new Date();
    const dateDeletedStr = now.toLocaleDateString([], { year: 'numeric', month: 'numeric', day: 'numeric' }) +
      ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // Build deleted item record
    const deletedItem = {
      id: 'rcb_' + foundFile.id + '_' + Date.now(),
      origId: foundFile.id,
      name: foundFile.name,
      originalFolder: actualFolder,
      originalLocation: locationStr,
      dateDeleted: dateDeletedStr,
      dateDeletedMs: now.getTime(),
      size: foundFile.size || '1 KB',
      type: foundFile.type || 'File',
      icon: foundFile.icon || '📄',
      file: JSON.parse(JSON.stringify(foundFile))
    };

    window.recycleBinItems.unshift(deletedItem);

    // Deselect from File Explorer
    if (typeof gameState !== 'undefined') {
      gameState.selectedFolderFileId = null;
    }

    // Play subtle window/deletion tone
    if (typeof AudioManager !== 'undefined' && AudioManager.playWindowSound) {
      AudioManager.playWindowSound(false);
    }

    if (typeof showToast === 'function') {
      showToast(`🗑️ Moved "${foundFile.name}" to the Recycle Bin.`, 'info');
    }

    // Refresh File Explorer if open
    if (typeof renderFolderFiles === 'function') {
      renderFolderFiles(document.getElementById('folder-search-input')?.value || '');
    }

    // Refresh Recycle Bin if open
    renderRecycleBin();
  };

  // ══════════════════════════════════════════════════════════════
  // RENDER RECYCLE BIN WINDOW
  // ══════════════════════════════════════════════════════════════
  function renderRecycleBin(filterQuery = '') {
    const listEl = document.getElementById('recycle-file-list');
    if (!listEl) return;

    listEl.innerHTML = '';
    const q = (filterQuery || '').toLowerCase().trim();

    // Filter items
    let items = (window.recycleBinItems || []).slice();
    if (q) {
      items = items.filter(item =>
        item.name.toLowerCase().includes(q) ||
        item.originalLocation.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q)
      );
    }

    // Sort items
    items.sort((a, b) => {
      let valA = a[window._rcbSortCol] || '';
      let valB = b[window._rcbSortCol] || '';
      if (window._rcbSortCol === 'dateDeleted') {
        valA = a.dateDeletedMs || 0;
        valB = b.dateDeletedMs || 0;
      } else if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }
      if (valA < valB) return window._rcbSortAsc ? -1 : 1;
      if (valA > valB) return window._rcbSortAsc ? 1 : -1;
      return 0;
    });

    // Update empty state vs list
    if (items.length === 0) {
      listEl.innerHTML = `
        <div class="recycle-empty-state">
          <img src="assets/icons/apps/recycle.svg" class="recycle-empty-icon" alt="Empty Recycle Bin" />
          <div class="recycle-empty-text">${q ? 'No matching items in the Recycle Bin.' : 'This folder is empty.'}</div>
          <div class="recycle-empty-sub">${q ? 'Try a different search term.' : 'Items you delete in File Explorer will appear here.'}</div>
        </div>`;
    } else {
      items.forEach(item => {
        const isSelected = (window._selectedRecycleItemId === item.id);
        const row = document.createElement('div');
        row.className = `recycle-file-row ${isSelected ? 'selected' : ''}`;
        row.dataset.itemId = item.id;

        row.onclick = (e) => {
          e.stopPropagation();
          selectRecycleBinItem(item.id);
        };

        row.ondblclick = (e) => {
          e.stopPropagation();
          showRecycleItemProperties(item);
        };

        row.oncontextmenu = (e) => {
          e.preventDefault();
          e.stopPropagation();
          selectRecycleBinItem(item.id);
          showRecycleContextMenu(e.clientX, e.clientY, item);
        };

        row.innerHTML = `
          <div class="rcb-cell-name">
            <span class="rcb-row-icon">${item.icon}</span>
            <span class="rcb-row-title" title="${item.name}">${item.name}</span>
          </div>
          <div class="rcb-cell-loc" title="${item.originalLocation}">${item.originalLocation}</div>
          <div class="rcb-cell-date" title="${item.dateDeleted}">${item.dateDeleted}</div>
          <div class="rcb-cell-size" title="${item.size}">${item.size}</div>
          <div class="rcb-cell-type" title="${item.type}">${item.type}</div>
        `;

        listEl.appendChild(row);
      });
    }

    // Update Toolbar Buttons (enabled / disabled)
    const hasSelection = !!window._selectedRecycleItemId;
    const hasItems = (window.recycleBinItems && window.recycleBinItems.length > 0);

    const btnEmpty = document.getElementById('rcb-btn-empty');
    const btnRestoreAll = document.getElementById('rcb-btn-restore-all');
    const btnRestoreSel = document.getElementById('rcb-btn-restore-sel');
    const btnDelPerm = document.getElementById('rcb-btn-delete-perm');
    const btnProps = document.getElementById('rcb-btn-properties');

    if (btnEmpty) btnEmpty.classList.toggle('disabled', !hasItems);
    if (btnRestoreAll) btnRestoreAll.classList.toggle('disabled', !hasItems);
    if (btnRestoreSel) btnRestoreSel.classList.toggle('disabled', !hasSelection);
    if (btnDelPerm) btnDelPerm.classList.toggle('disabled', !hasSelection);
    if (btnProps) btnProps.classList.toggle('disabled', !hasSelection);

    // Update Status Bar
    const totalCount = (window.recycleBinItems || []).length;
    const itemsEl = document.getElementById('recycle-status-items');
    const selEl = document.getElementById('recycle-status-selected');

    if (itemsEl) {
      itemsEl.textContent = `${totalCount} item${totalCount === 1 ? '' : 's'}`;
    }
    if (selEl) {
      if (hasSelection) {
        const selItem = (window.recycleBinItems || []).find(i => i.id === window._selectedRecycleItemId);
        selEl.textContent = `1 item selected (${selItem ? selItem.size : ''})`;
      } else {
        selEl.textContent = '0 items selected';
      }
    }

    // Update Sort Headers
    ['name', 'originalLocation', 'dateDeleted', 'size', 'type'].forEach(col => {
      const el = document.getElementById(`rcb-sort-${col}`);
      if (el) {
        el.textContent = (window._rcbSortCol === col) ? (window._rcbSortAsc ? ' ▲' : ' ▼') : '';
      }
    });
  }
  window.renderRecycleBin = renderRecycleBin;

  // ══════════════════════════════════════════════════════════════
  // SELECTION & SORTING
  // ══════════════════════════════════════════════════════════════
  window.selectRecycleBinItem = function (itemId) {
    window._selectedRecycleItemId = itemId;
    document.querySelectorAll('.recycle-file-row').forEach(row => {
      row.classList.toggle('selected', row.dataset.itemId === itemId);
    });

    const hasSelection = !!itemId;
    const btnRestoreSel = document.getElementById('rcb-btn-restore-sel');
    const btnDelPerm = document.getElementById('rcb-btn-delete-perm');
    const btnProps = document.getElementById('rcb-btn-properties');

    if (btnRestoreSel) btnRestoreSel.classList.toggle('disabled', !hasSelection);
    if (btnDelPerm) btnDelPerm.classList.toggle('disabled', !hasSelection);
    if (btnProps) btnProps.classList.toggle('disabled', !hasSelection);

    const selEl = document.getElementById('recycle-status-selected');
    if (selEl) {
      if (hasSelection) {
        const item = (window.recycleBinItems || []).find(i => i.id === itemId);
        selEl.textContent = `1 item selected (${item ? item.size : ''})`;
      } else {
        selEl.textContent = '0 items selected';
      }
    }
  };

  window.sortRecycleBin = function (col) {
    if (window._rcbSortCol === col) {
      window._rcbSortAsc = !window._rcbSortAsc;
    } else {
      window._rcbSortCol = col;
      window._rcbSortAsc = (col === 'name');
    }
    renderRecycleBin(document.getElementById('recycle-search-input')?.value || '');
  };

  window.filterRecycleBin = function (val) {
    renderRecycleBin(val);
  };

  window.clearRecycleSearch = function () {
    const input = document.getElementById('recycle-search-input');
    if (input) input.value = '';
    renderRecycleBin('');
  };

  // ══════════════════════════════════════════════════════════════
  // RESTORE ACTIONS
  // ══════════════════════════════════════════════════════════════
  window.restoreSelectedRecycleBinItem = function () {
    if (!window._selectedRecycleItemId) {
      if (typeof showToast === 'function') showToast('Please select an item from the Recycle Bin first.', 'warning');
      return;
    }
    restoreRecycleBinItem(window._selectedRecycleItemId);
  };

  function restoreRecycleBinItem(itemId) {
    const index = (window.recycleBinItems || []).findIndex(i => i.id === itemId);
    if (index === -1) return;

    const item = window.recycleBinItems[index];
    const addFiles = (typeof EXPLORER_ADDITIONAL_FILES !== 'undefined')
      ? EXPLORER_ADDITIONAL_FILES
      : (window.EXPLORER_ADDITIONAL_FILES || {});

    // Return to original folder
    if (item.originalFolder && Array.isArray(addFiles[item.originalFolder])) {
      const alreadyThere = addFiles[item.originalFolder].some(f => f.id === item.file.id);
      if (!alreadyThere) {
        addFiles[item.originalFolder].push(item.file);
      }
    } else if (item.originalFolder === 'downloads' && typeof FOLDER_FILES !== 'undefined' && Array.isArray(FOLDER_FILES)) {
      const alreadyThere = FOLDER_FILES.some(f => f.id === item.file.id);
      if (!alreadyThere) {
        FOLDER_FILES.push(item.file);
      }
    }

    // Remove from Recycle Bin
    window.recycleBinItems.splice(index, 1);
    window._selectedRecycleItemId = null;

    if (typeof AudioManager !== 'undefined' && AudioManager.playCorrect) {
      AudioManager.playCorrect();
    }

    if (typeof showToast === 'function') {
      showToast(`↩️ Restored "${item.name}" to ${item.originalLocation}.`, 'success');
    }

    // Refresh File Explorer and Recycle Bin
    if (typeof renderFolderFiles === 'function') {
      renderFolderFiles(document.getElementById('folder-search-input')?.value || '');
    }
    renderRecycleBin();
  }
  window.restoreRecycleBinItem = restoreRecycleBinItem;

  window.restoreAllRecycleBinItems = function () {
    if (!window.recycleBinItems || window.recycleBinItems.length === 0) {
      if (typeof showToast === 'function') showToast('Recycle Bin is already empty.', 'info');
      return;
    }

    const count = window.recycleBinItems.length;
    const addFiles = (typeof EXPLORER_ADDITIONAL_FILES !== 'undefined')
      ? EXPLORER_ADDITIONAL_FILES
      : (window.EXPLORER_ADDITIONAL_FILES || {});

    window.recycleBinItems.forEach(item => {
      if (item.originalFolder && Array.isArray(addFiles[item.originalFolder])) {
        const alreadyThere = addFiles[item.originalFolder].some(f => f.id === item.file.id);
        if (!alreadyThere) {
          addFiles[item.originalFolder].push(item.file);
        }
      }
    });

    window.recycleBinItems = [];
    window._selectedRecycleItemId = null;

    if (typeof AudioManager !== 'undefined' && AudioManager.playSuccessChime) {
      AudioManager.playSuccessChime();
    }

    if (typeof showToast === 'function') {
      showToast(`↩️ Restored all ${count} item${count > 1 ? 's' : ''} to their original folders.`, 'success');
    }

    if (typeof renderFolderFiles === 'function') {
      renderFolderFiles(document.getElementById('folder-search-input')?.value || '');
    }
    renderRecycleBin();
  };

  // ══════════════════════════════════════════════════════════════
  // PERMANENT DELETION & EMPTY RECYCLE BIN
  // ══════════════════════════════════════════════════════════════
  window.deletePermanentlySelectedRecycleBinItem = function () {
    if (!window._selectedRecycleItemId) {
      if (typeof showToast === 'function') showToast('Please select an item to delete permanently.', 'warning');
      return;
    }

    const item = (window.recycleBinItems || []).find(i => i.id === window._selectedRecycleItemId);
    if (!item) return;

    const ok = confirm(`Are you sure you want to permanently delete "${item.name}"?\n\nThis item will be permanently removed from this simulated computer.`);
    if (!ok) return;

    window.recycleBinItems = (window.recycleBinItems || []).filter(i => i.id !== window._selectedRecycleItemId);
    window._selectedRecycleItemId = null;

    if (typeof showToast === 'function') {
      showToast(`🗑️ Permanently deleted "${item.name}".`, 'info');
    }
    renderRecycleBin();
  };

  window.emptyRecycleBin = function () {
    if (!window.recycleBinItems || window.recycleBinItems.length === 0) {
      if (typeof showToast === 'function') showToast('Recycle Bin is already empty.', 'info');
      return;
    }

    const count = window.recycleBinItems.length;
    const ok = confirm(`Are you sure you want to permanently delete all ${count} item${count > 1 ? 's' : ''} in the Recycle Bin?\n\nThis cannot be undone.`);
    if (!ok) return;

    window.recycleBinItems = [];
    window._selectedRecycleItemId = null;

    if (typeof showToast === 'function') {
      showToast(`🗑️ Recycle Bin emptied.`, 'info');
    }
    renderRecycleBin();
  };

  // ══════════════════════════════════════════════════════════════
  // FILE PROPERTIES MODAL
  // ══════════════════════════════════════════════════════════════
  window.viewSelectedRecycleBinProperties = function () {
    if (!window._selectedRecycleItemId) {
      if (typeof showToast === 'function') showToast('Please select an item first.', 'warning');
      return;
    }
    const item = (window.recycleBinItems || []).find(i => i.id === window._selectedRecycleItemId);
    if (!item) return;
    showRecycleItemProperties(item);
  };

  let _activePropertyItemId = null;

  function showRecycleItemProperties(item) {
    if (!item) return;
    _activePropertyItemId = item.id;

    const modal = document.getElementById('recycle-properties-modal');
    if (!modal) return;

    const titleEl = document.getElementById('rcb-prop-head-title');
    const nameInput = document.getElementById('rcb-prop-name');
    const iconEl = document.getElementById('rcb-prop-icon');
    const typeEl = document.getElementById('rcb-prop-type');
    const locEl = document.getElementById('rcb-prop-loc');
    const dateEl = document.getElementById('rcb-prop-deleted');
    const sizeEl = document.getElementById('rcb-prop-size');
    const diskSizeEl = document.getElementById('rcb-prop-disk-size');

    if (titleEl) titleEl.textContent = `${item.name} Properties`;
    if (nameInput) nameInput.value = item.name;
    if (iconEl) iconEl.innerHTML = item.icon || '📄';
    if (typeEl) typeEl.textContent = item.type || 'File';
    if (locEl) locEl.textContent = item.originalLocation || 'Unknown Location';
    if (dateEl) dateEl.textContent = item.dateDeleted || 'Unknown Date';
    if (sizeEl) sizeEl.textContent = item.size || '0 KB';
    if (diskSizeEl) diskSizeEl.textContent = item.size || '0 KB';

    modal.classList.remove('hidden');
  }
  window.showRecycleItemProperties = showRecycleItemProperties;

  function closeRecycleProperties() {
    const modal = document.getElementById('recycle-properties-modal');
    if (modal) modal.classList.add('hidden');
    _activePropertyItemId = null;
  }
  window.closeRecycleProperties = closeRecycleProperties;

  window.restoreFromProperties = function () {
    if (_activePropertyItemId) {
      restoreRecycleBinItem(_activePropertyItemId);
    }
    closeRecycleProperties();
  };

  // ══════════════════════════════════════════════════════════════
  // CONTEXT MENU FOR RECYCLE BIN
  // ══════════════════════════════════════════════════════════════
  let _ctxTargetItem = null;

  function showRecycleContextMenu(x, y, item) {
    _ctxTargetItem = item;
    let menu = document.getElementById('recycle-context-menu');
    if (!menu) {
      menu = document.createElement('div');
      menu.id = 'recycle-context-menu';
      menu.className = 'recycle-context-menu';
      menu.innerHTML = `
        <div class="rcb-ctx-item" onclick="rcbCtxAction('restore')"><span>↩️</span> Restore</div>
        <div class="rcb-ctx-divider"></div>
        <div class="rcb-ctx-item" onclick="rcbCtxAction('delete')"><span>❌</span> Delete Permanently</div>
        <div class="rcb-ctx-divider"></div>
        <div class="rcb-ctx-item" onclick="rcbCtxAction('properties')"><span>📋</span> Properties</div>
      `;
      document.body.appendChild(menu);
    }

    // Keep menu on screen
    const maxX = window.innerWidth - 180;
    const maxY = window.innerHeight - 140;
    menu.style.left = Math.min(x, maxX) + 'px';
    menu.style.top = Math.min(y, maxY) + 'px';
    menu.classList.add('active');
  }

  window.rcbCtxAction = function (action) {
    const menu = document.getElementById('recycle-context-menu');
    if (menu) menu.classList.remove('active');
    if (!_ctxTargetItem) return;

    if (action === 'restore') {
      restoreRecycleBinItem(_ctxTargetItem.id);
    } else if (action === 'delete') {
      window._selectedRecycleItemId = _ctxTargetItem.id;
      deletePermanentlySelectedRecycleBinItem();
    } else if (action === 'properties') {
      showRecycleItemProperties(_ctxTargetItem);
    }
  };

  // Dismiss context menu on click anywhere
  document.addEventListener('click', (e) => {
    const menu = document.getElementById('recycle-context-menu');
    if (menu && menu.classList.contains('active')) {
      if (!menu.contains(e.target)) {
        menu.classList.remove('active');
      }
    }
  });

  // ══════════════════════════════════════════════════════════════
  // KEYBOARD SHORTCUTS (Delete key deletes selected file)
  // ══════════════════════════════════════════════════════════════
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Delete') {
      // If File Explorer is open and focused, delete selected file
      const folderWin = document.getElementById('win-folder');
      if (folderWin && !folderWin.classList.contains('hidden') && folderWin.classList.contains('focused')) {
        if (typeof gameState !== 'undefined' && gameState.selectedFolderFileId) {
          if (typeof explorerDelete === 'function') {
            explorerDelete();
          }
        }
      }

      // If Recycle Bin is open and focused, permanently delete selected item
      const rcbWin = document.getElementById('win-recycle');
      if (rcbWin && !rcbWin.classList.contains('hidden') && rcbWin.classList.contains('focused')) {
        if (window._selectedRecycleItemId) {
          deletePermanentlySelectedRecycleBinItem();
        }
      }
    }
  });

  // ══════════════════════════════════════════════════════════════
  // RESTART & REMEDIATION RESET
  // ══════════════════════════════════════════════════════════════
  window.resetRecycleBinToInitial = function () {
    window.recycleBinItems = [];
    window._selectedRecycleItemId = null;
    closeRecycleProperties();

    // Close Recycle Bin window if open
    if (typeof closeApp === 'function') {
      closeApp('recycle');
    }

    // Restore pristine virtual files if backup exists
    if (_pristineFilesBackup && typeof EXPLORER_ADDITIONAL_FILES !== 'undefined') {
      try {
        for (const [key, files] of Object.entries(_pristineFilesBackup)) {
          EXPLORER_ADDITIONAL_FILES[key] = JSON.parse(JSON.stringify(files));
        }
      } catch (e) {
        console.warn('Recycle Bin restore error:', e);
      }
    }

    if (typeof renderFolderFiles === 'function') {
      try { renderFolderFiles(''); } catch (e) {}
    }
    renderRecycleBin();
  };

  // Initialize backup on startup
  setTimeout(_backupPristineFiles, 800);

})();
