'use strict';


function toggleAntiVirusProtection() {
  // ── Chapter 2: use a SEPARATE AV flag — never touch gameState.antivirusProtection ──
  if (window._currentChapterCategory === 'malware' && window._ch2Mission) {
    const wasOff = !!window._ch2Mission.antivirusOff;
    window._ch2Mission.antivirusOff = !wasOff;
    updateAntiVirusProtectionUI();

    if (!window._ch2Mission.antivirusOff) {
      // Turned back ON
      showToast('🛡️ Real-Time Protection ENABLED. Threat scanner active.', 'success');
    } else {
      // Turned OFF — Ch2 simulation mode
      showToast('⚠️ Real-Time Protection DISABLED. Simulations can now run.', 'warning');
      // Re-render sticky note if open
      var note = document.getElementById('sticky-note');
      if (note && !note.classList.contains('hidden')) {
        if (typeof updateStickyNoteForPhase === 'function') {
          updateStickyNoteForPhase('malware');
        }
      }
      // Ryan confirms Antivirus is off
      setTimeout(function() {
        if (typeof RyanGuide !== 'undefined' && RyanGuide.speak) {
          RyanGuide.speak([
            {
              text: 'The antivirus is now turned off. The simulations can run without being blocked so you can observe their behavior.',
              state: 'speaking',
              label: 'TAP TO CONTINUE'
            },
            {
              text: 'Head back to the Games folder and <strong>click on the simulation files</strong> to see how each malware type behaves.',
              state: 'success',
              label: 'GOT IT'
            }
          ]);
        }
      }, 500);
    }
    return; // ← Ch2 handled — Ch1 state untouched
  }

  // ── Chapter 1 (and default): use gameState.antivirusProtection as normal ──
  gameState.antivirusProtection = !gameState.antivirusProtection;
  updateAntiVirusProtectionUI();
  if (gameState.antivirusProtection) {
    showToast('🛡️ Real-Time Protection ENABLED. Threat scanner active.', 'success');
  } else {
    showToast('⚠️ Real-Time Protection DISABLED. Turn ON to scan files.', 'warning');
  }
}

function updateAntiVirusProtectionUI() {
  const toggleBtn = document.getElementById('av-realtime-toggle');
  const toggleText = document.getElementById('av-toggle-text');
  const banner = document.getElementById('av-status-banner');
  const shieldIcon = document.getElementById('av-shield-icon');
  const title = document.getElementById('av-status-title');
  const sub = document.getElementById('av-status-sub');
  const statusText = document.getElementById('av-quarantine-status-text');
  const statsBadge = document.getElementById('av-stats-badge');

  // Determine effective protection state:
  // Ch2 uses its own separate flag; Ch1 uses gameState.antivirusProtection
  const _isCh2 = window._currentChapterCategory === 'malware' && window._ch2Mission;
  const _avOn = _isCh2 ? !window._ch2Mission.antivirusOff : !!gameState.antivirusProtection;

  if (_avOn) {
    if (toggleBtn) toggleBtn.classList.add('active');
    if (toggleText) toggleText.textContent = 'ON';
    if (banner) banner.classList.remove('disabled');
    if (shieldIcon) shieldIcon.textContent = '🛡️';
    if (title) title.textContent = 'DEFENSE ENGINE ACTIVE';
    if (statsBadge) statsBadge.classList.remove('unprotected');
    if (statusText) {
      const quarantinedFiles = (typeof FOLDER_FILES !== 'undefined') ? FOLDER_FILES.filter(f => f.quarantined) : [];
      statusText.textContent = quarantinedFiles.length > 0
        ? `${quarantinedFiles.length} THREAT${quarantinedFiles.length > 1 ? 'S' : ''} SECURED`
        : 'SYSTEM PROTECTED';
    }
  } else {
    if (toggleBtn) toggleBtn.classList.remove('active');
    if (toggleText) toggleText.textContent = 'OFF';
    if (banner) banner.classList.add('disabled');
    if (shieldIcon) shieldIcon.textContent = '⚠️';
    if (title) title.textContent = 'DEFENSE ENGINE DISABLED';
    if (statsBadge) statsBadge.classList.add('unprotected');
    if (statusText) statusText.textContent = 'YOUR SYSTEM IS NOT PROTECTED';
  }

  // Synchronize Quick Settings Anti-Virus Tile
  const tileAv = document.getElementById('tile-antivirus');
  const tileAvStatus = document.getElementById('tile-antivirus-status');
  const tileAvBadge = document.getElementById('tile-antivirus-badge');
  if (tileAv) {
    if (_avOn) {
      tileAv.classList.add('active');
      if (tileAvStatus) tileAvStatus.textContent = 'On';
      if (tileAvBadge) tileAvBadge.textContent = 'ON';
    } else {
      tileAv.classList.remove('active');
      if (tileAvStatus) tileAvStatus.textContent = 'Off';
      if (tileAvBadge) tileAvBadge.textContent = 'OFF';
    }
  }
}

// ── Called every time the Antivirus app window is opened ──────────────────────
// Ensures Ch1 always shows ON + disabled toggle; Ch2 shows its own state
function refreshAvForCurrentChapter() {
  const isCh2 = window._currentChapterCategory === 'malware' && window._ch2Mission;

  if (!isCh2) {
    // Chapter 1: default AV to ON when app opens — user can still toggle it
    gameState.antivirusProtection = true;
  }
  // Both chapters: toggle button is always enabled and clickable
  const toggleBtn = document.getElementById('av-realtime-toggle');
  if (toggleBtn) {
    toggleBtn.disabled = false;
    toggleBtn.title = 'Click to turn Real-Time Protection ON or OFF';
    toggleBtn.style.opacity = '';
    toggleBtn.style.cursor = '';
  }

  // Always refresh the UI to show the correct state
  updateAntiVirusProtectionUI();
}

let scanInProgress = false;
let activeScanInterval = null;
let activeScanTickerInterval = null;

function cancelActiveScan() {
  if (!scanInProgress) return;
  scanInProgress = false;
  if (activeScanInterval) {
    clearInterval(activeScanInterval);
    activeScanInterval = null;
  }
  if (activeScanTickerInterval) {
    clearInterval(activeScanTickerInterval);
    activeScanTickerInterval = null;
  }

  const progressWrap = document.getElementById('av-progress-wrap');
  const targetCard = document.getElementById('av-target-card');
  const scanBtn = document.getElementById('av-scan-btn');

  if (progressWrap) progressWrap.classList.add('hidden');
  if (targetCard) targetCard.classList.remove('hidden');
  if (scanBtn) scanBtn.disabled = false;

  showToast('ℹ️ Quick scan cancelled.', 'info');
}

function startActiveScan() {
  if (scanInProgress) return;
  if (!gameState.antivirusProtection) {
    showToast('⚠️ Anti-Virus Real-Time Protection is OFF! Turn it ON to scan files.', 'warning');
    const toggleBtn = document.getElementById('av-realtime-toggle');
    if (toggleBtn) {
      toggleBtn.classList.add('highlight-pulse');
      setTimeout(() => toggleBtn.classList.remove('highlight-pulse'), 1200);
    }
    return;
  }

  // In Chapter 1 (phishing), the AV always shows a clean system — no malware in this chapter
  const isPhishingChapter = (window._currentChapterCategory || activeCategoryStory || 'phishing') === 'phishing';

  // Determine target file: either explicitly selected file or a scan target
  let fileId = gameState.selectedFolderFileId;
  let file = FOLDER_FILES.find(f => f.id === fileId);

  if (!file) {
    if (isPhishingChapter) {
      // Chapter 1: scan picks only clean files — no malware
      file = FOLDER_FILES.find(f => !f.isMalware) || null;
    } else {
      // Chapter 2+: prioritize finding an unquarantined malware
      const firstMalware = FOLDER_FILES.find(f => f.isMalware && !f.quarantined);
      file = firstMalware || FOLDER_FILES.find(f => f.isMalware) || FOLDER_FILES[0];
    }
  }

  scanInProgress = true;
  const progressWrap = document.getElementById('av-progress-wrap');
  const progressFill = document.getElementById('av-progress-fill');
  const progressPct = document.getElementById('av-progress-pct');
  const progressText = document.getElementById('av-progress-text');
  const tickerEl = document.getElementById('av-scanning-filepath');
  const timerEl = document.getElementById('av-scan-timer');
  const filesCountEl = document.getElementById('av-files-scanned-count');
  const threatsCountEl = document.getElementById('av-threats-found-count');
  const resultCard = document.getElementById('av-result-card');
  const scanBtn = document.getElementById('av-scan-btn');
  const targetCard = document.getElementById('av-target-card');

  if (progressWrap) progressWrap.classList.remove('hidden');
  if (resultCard) resultCard.classList.add('hidden');
  if (scanBtn) scanBtn.disabled = true;

  // Initialize Windows Defender metrics
  let pct = 0;
  let filesScanned = 118;
  let threatsFound = 0;
  if (progressFill) progressFill.style.width = '0%';
  if (progressPct) progressPct.textContent = '0%';
  if (progressText) progressText.textContent = file ? `Quick scan: scanning ${file.name}…` : 'Quick scan in progress…';
  if (timerEl) timerEl.textContent = '00:03';
  if (filesCountEl) filesCountEl.textContent = filesScanned.toLocaleString();
  if (threatsCountEl) {
    threatsCountEl.textContent = '0';
    threatsCountEl.classList.remove('threat-detected');
  }

  // Windows Defender live file path ticker
  let pathIdx = 0;
  const scanPaths = (typeof WIN_DEFENDER_SCAN_PATHS !== 'undefined' && WIN_DEFENDER_SCAN_PATHS.length > 0)
    ? [...WIN_DEFENDER_SCAN_PATHS]
    : [
        'C:\\Windows\\System32\\ntoskrnl.exe',
        'C:\\Windows\\System32\\drivers\\etc\\hosts',
        'C:\\Users\\Alex\\Downloads\\' + (file ? file.name : 'bonus_payroll_sept.pdf.exe'),
        'C:\\Windows\\System32\\winlogon.exe',
        'C:\\Program Files\\Windows Defender\\MsMpEng.exe'
      ];

  if (file && !scanPaths.some(p => p.includes(file.name))) {
    scanPaths.splice(4, 0, `C:\\Users\\Alex\\Downloads\\${file.name}`);
  }

  if (activeScanTickerInterval) clearInterval(activeScanTickerInterval);
  activeScanTickerInterval = setInterval(() => {
    pathIdx = (pathIdx + 1) % scanPaths.length;
    if (tickerEl) {
      tickerEl.textContent = scanPaths[pathIdx];
    }
  }, 65);

  if (activeScanInterval) clearInterval(activeScanInterval);

  // Main scan progress loop: 45 ticks x 60ms = ~2.7s
  const totalTicks = 45;
  let currentTick = 0;

  activeScanInterval = setInterval(() => {
    currentTick++;
    pct = Math.min(100, Math.round((currentTick / totalTicks) * 100));

    // Rapid increment of files scanned
    filesScanned += Math.floor(Math.random() * 85) + 42;
    if (filesCountEl) filesCountEl.textContent = filesScanned.toLocaleString();

    // Live countdown timer
    if (timerEl) {
      if (pct < 35) timerEl.textContent = '00:03';
      else if (pct < 70) timerEl.textContent = '00:02';
      else if (pct < 98) timerEl.textContent = '00:01';
      else timerEl.textContent = '00:00';
    }

    // Threats discovered trigger halfway through if target is malware AND not in phishing chapter
    if (pct >= 55 && file && file.isMalware && !file.quarantined && threatsFound === 0 && !isPhishingChapter) {
      threatsFound = 1;
      if (threatsCountEl) {
        threatsCountEl.textContent = '1';
        threatsCountEl.classList.add('threat-detected');
      }
    }

    if (progressFill) progressFill.style.width = pct + '%';
    if (progressPct) progressPct.textContent = pct + '%';

    if (currentTick >= totalTicks) {
      clearInterval(activeScanInterval);
      clearInterval(activeScanTickerInterval);
      activeScanInterval = null;
      activeScanTickerInterval = null;

      if (progressFill) progressFill.style.width = '100%';
      if (progressPct) progressPct.textContent = '100%';
      if (timerEl) timerEl.textContent = '00:00';

      setTimeout(() => {
        scanInProgress = false;
        if (file) {
          file.scanned = true;
          gameState.selectedFolderFileId = file.id;
        }

        if (progressWrap) progressWrap.classList.add('hidden');
        if (scanBtn) scanBtn.disabled = false;


        renderFolderFiles(document.getElementById('folder-search-input')?.value || '');
        if (isPhishingChapter) {
          // Chapter 1: always show a clean system result
          displayCleanSystemResult();
        } else if (file) {
          selectFolderFile(file.id);
          displayScanResult(file);
        }
      }, 400);
    }
  }, 60);
}

function displayCleanSystemResult() {
  const resultCard = document.getElementById('av-result-card');
  if (!resultCard) return;
  resultCard.classList.remove('hidden', 'threat');
  resultCard.classList.add('clean');
  resultCard.innerHTML = `
    <div class="av-result-left">
      <div class="av-threat-title">✅ NO THREATS FOUND</div>
      <div class="av-threat-desc">Quick scan complete. All scanned files are clean — no malware, ransomware, or suspicious executables detected. Your system is protected.</div>
    </div>
    <div><span style="font-size:12px;color:var(--accent-green);font-weight:700">✓ SYSTEM CLEAN</span></div>`;
}

function displayScanResult(file) {
  const resultCard = document.getElementById('av-result-card');
  if (!resultCard) return;

  // In phishing chapter, always force clean result
  const isPhishingChapter = (window._currentChapterCategory || activeCategoryStory || 'phishing') === 'phishing';
  if (isPhishingChapter) {
    displayCleanSystemResult();
    return;
  }

  resultCard.classList.remove('hidden', 'threat', 'clean');
  resultCard.classList.add(file.isMalware ? 'threat' : 'clean');

  let actionBtn = '';
  if (file.quarantined) {
    actionBtn = '<span style="font-size:12px;color:var(--text-muted);font-weight:700">✓ ALREADY QUARANTINED</span>';
  } else if (file.isMalware) {
    actionBtn = `<button class="btn-danger btn-sm" onclick="quarantineFile('${file.id}')">🚩 QUARANTINE THREAT</button>`;
  } else {
    actionBtn = '<span style="font-size:12px;color:var(--accent-green);font-weight:700">✓ NO ACTION NEEDED</span>';
  }

  resultCard.innerHTML = `
    <div class="av-result-left">
      <div class="av-threat-title">${file.isMalware ? '⚠️ THREAT IDENTIFIED: ' + file.threatName : '✅ FILE IS CLEAN: ' + file.threatName}</div>
      <div class="av-threat-desc">${file.analysis}</div>
    </div>
    <div>${actionBtn}</div>`;
}

function quarantineFile(fileId) {
  if (fileId === 'f_scholarship_grant') {
    window.ch1DownloadsList = [];
    gameState.selectedFolderFileId = null;
    const dlBadge = document.getElementById('downloads-badge');
    if (dlBadge) {
      dlBadge.textContent = '0';
      dlBadge.style.display = 'none';
      dlBadge.classList.add('hidden-init');
    }
    renderFolderFiles(document.getElementById('folder-search-input')?.value || '');
    const emptyEl = document.getElementById('fdp-empty');
    const contentEl = document.getElementById('fdp-content');
    if (emptyEl) emptyEl.classList.remove('hidden');
    if (contentEl) contentEl.classList.add('hidden');
    if (typeof AudioManager !== 'undefined' && AudioManager.playCorrect) {
      AudioManager.playCorrect();
    }
    showToast('🛡️ Threat Neutralized: "Scholarship_Form.pdf.exe" deleted from Downloads folder.', 'success');
    if (typeof RyanGuide !== 'undefined') {
      RyanGuide.speak([
        {
          text: "🎯 <strong>Threat Neutralized!</strong> You safely deleted the malicious file from your Downloads folder.",
          state: 'success'
        },
        {
          text: "Great job keeping your workstation clean! Now head back to Zmail to report the phishing incident.",
          state: 'speaking'
        }
      ]);
    }
    return;
  }

  const file = FOLDER_FILES.find(f => f.id === fileId);
  if (!file) return;

  if (file.quarantined) {
    showToast('🛡️ This file is already quarantined.', 'warning');
    return;
  }

  if (!gameState.antivirusProtection) {
    showToast('⚠️ Anti-Virus Real-Time Protection is OFF! Turn it ON to quarantine threats.', 'warning');
    const toggleBtn = document.getElementById('av-realtime-toggle');
    if (toggleBtn) {
      toggleBtn.classList.add('highlight-pulse');
      setTimeout(() => toggleBtn.classList.remove('highlight-pulse'), 1200);
    }
    return;
  }

  if (file.isMalware) {
    file.quarantined = true;
    file.scanned = true;
    gameState.malwareQuarantined++;
    gameState.score += 100;
    updateHUD();
    updateAntivirusUI();
    renderFolderFiles(document.getElementById('folder-search-input')?.value || '');
    selectFolderFile(file.id);
    displayScanResult(file);

    showToast(`🛡️ Neutralized ${file.name}!`, 'success');
    if (typeof AudioManager !== 'undefined') AudioManager.playCorrect();

    if (typeof addSimulationNotification === 'function') {
      addSimulationNotification({
        id: 'notif-malware-' + file.id,
        source: 'ShieldAV Defender',
        icon: '🛡️',
        iconType: 'av',
        title: 'Threat Neutralized: ' + file.name,
        body: `Malware quarantined safely into isolated vault. Threat level: Critical.`,
        time: 'Just now',
        app: 'antivirus'
      }, false);
    }

    if (gameState.malwareQuarantined >= TOTAL_MALWARE_COUNT) {
      setTimeout(finishMalwareMission, 1000);
    }
  } else {
    gameState.malwareFalsePositives++;
    gameState.score = Math.max(0, gameState.score - 25);
    updateHUD();
    if (typeof AudioManager !== 'undefined') AudioManager.playWrong();
    showToast(`⚠️ False Positive! "${file.name}" is a clean, legitimate file.`, 'warning');

    if (typeof addSimulationNotification === 'function') {
      addSimulationNotification({
        id: 'notif-fp-' + file.id,
        source: 'ShieldAV Defender',
        icon: '⚠️',
        iconType: 'warning',
        title: 'False Positive: ' + file.name,
        body: `Clean legitimate file was quarantined. Verify extensions before quarantine.`,
        time: 'Just now',
        app: 'antivirus'
      }, false);
    }
  }
}

function updateAntivirusUI() {
  const statusText = document.getElementById('av-quarantine-status-text');
  const statsBadge = document.getElementById('av-stats-badge');
  const countBadge = document.getElementById('av-quarantine-count');
  const logCount = document.getElementById('av-log-count');
  const threatsList = document.getElementById('av-threats-list');
  const banner = document.getElementById('av-status-banner');

  const quarantinedFiles = FOLDER_FILES.filter(f => f.quarantined);

  if (statusText) {
    if (!gameState.antivirusProtection) {
      statusText.textContent = 'YOUR SYSTEM IS NOT PROTECTED';
      if (statsBadge) statsBadge.classList.add('unprotected');
    } else if (quarantinedFiles.length > 0) {
      statusText.textContent = `${quarantinedFiles.length} THREAT${quarantinedFiles.length > 1 ? 'S' : ''} SECURED`;
      if (statsBadge) statsBadge.classList.remove('unprotected');
    } else {
      statusText.textContent = 'SYSTEM PROTECTED';
      if (statsBadge) statsBadge.classList.remove('unprotected');
    }
  }
  if (countBadge) {
    countBadge.textContent = quarantinedFiles.length;
  }
  if (logCount) {
    logCount.textContent = quarantinedFiles.length === 0
      ? 'Protection Active'
      : `${quarantinedFiles.length} Threat${quarantinedFiles.length > 1 ? 's' : ''} Secured`;
  }

  if (quarantinedFiles.length > 0 && banner) {
    banner.classList.add('alert');
  }

  if (threatsList) {
    if (quarantinedFiles.length === 0) {
      threatsList.innerHTML = '<div class="av-threats-empty">No quarantined files yet. Inspect suspicious files in the Folder!</div>';
    } else {
      threatsList.innerHTML = quarantinedFiles.map(f => `
        <div class="av-threat-item quarantined">
          <div>
            <strong>${f.name}</strong>
            <div style="font-size:11px;color:var(--text-muted)">${f.threatName} • Quarantined into Vault</div>
          </div>
          <span style="color:#b388ff;font-weight:700;font-size:11px">🛡️ SECURED</span>
        </div>`).join('');
    }
  }
}
