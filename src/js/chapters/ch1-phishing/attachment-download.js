'use strict';

// ─── 5. DOWNLOAD TRAY & SCHOLARSHIP THREAT SIMULATION ──────
function downloadEmailAttachment(filename, size) {
  if (window._isDownloadingAttachment) {
    showToast('⏳ Download already in progress...', 'info');
    return;
  }
  window._isDownloadingAttachment = true;

  const tray = document.getElementById('browser-download-tray');
  const nameEl = document.getElementById('bdt-file-name');
  const metaEl = document.getElementById('bdt-file-meta');
  const fillEl = document.getElementById('bdt-progress-fill');
  const actionsEl = document.getElementById('bdt-actions');

  const fname = filename || 'Scholarship_Form.pdf.exe';
  const fsize = size || '2.4 MB';

  if (nameEl) nameEl.textContent = fname;
  if (metaEl) metaEl.textContent = 'Connecting to download server... 0%';
  if (fillEl) fillEl.style.width = '0%';
  if (actionsEl) actionsEl.classList.add('hidden');
  if (tray) tray.classList.remove('hidden');

  if (typeof AudioManager !== 'undefined' && AudioManager.playClick) {
    AudioManager.playClick();
  }

  showToast(`⬇️ Starting download: "${fname}" (${fsize})...`, 'warning');

  // Immediately warn the player to be careful downloading attachments
  if (typeof RyanGuide !== 'undefined' && RyanGuide.speak) {
    RyanGuide.speak([
      {
        text: "⚠️ <strong>Be careful downloading attachments!</strong> Look closely at that file: <code>" + fname + "</code>. Notice that double extension? Attackers disguise dangerous executables (.exe) as PDF documents!",
        state: 'concerned'
      }
    ]);
  }

  let pct = 0;
  const interval = setInterval(() => {
    pct += Math.floor(Math.random() * 8) + 7;
    if (pct > 100) pct = 100;

    if (fillEl) fillEl.style.width = `${pct}%`;
    if (metaEl) {
      if (pct < 100) {
        const mb = ((pct / 100) * 2.4).toFixed(1);
        metaEl.textContent = `Downloading... ${pct}% (${mb} MB / ${fsize} • 3.4 MB/s)`;
      } else {
        metaEl.innerHTML = `<strong style="color:#ef4444">⚠️ Suspicious File Detected — Possible Malware</strong> • ${fsize} • Saved to Downloads`;
      }
    }

    if (pct >= 100) {
      clearInterval(interval);
      window._isDownloadingAttachment = false;

      // Add to Chapter 1 downloads list if not already there
      const fileObj = getScholarshipGrantFileDef();
      if (!window.ch1DownloadsList || !window.ch1DownloadsList.some(f => f.id === fileObj.id)) {
        window.ch1DownloadsList = [fileObj];
      }

      if (actionsEl) actionsEl.classList.remove('hidden');

      // Update badge and file list if explorer is active
      const dlBadge = document.getElementById('downloads-badge');
      if (dlBadge) {
        dlBadge.textContent = '1';
        dlBadge.style.display = '';
        dlBadge.classList.remove('hidden-init');
      }

      if (currentExplorerFolder === 'downloads') {
        renderFolderFiles();
      }

      // Play threat alert sound
      if (typeof AudioManager !== 'undefined' && AudioManager.playWrong) {
        AudioManager.playWrong();
      }

      // Windows Defender Malicious Threat Notification
      showToast('🛡️ Windows Security: Threat detected! "Trojan:Win32/DisguisedExecutable" in Downloads folder.', 'error');

      // Ryan Mentor warning dialogue
      if (typeof RyanGuide !== 'undefined') {
        RyanGuide.speak([
          {
            text: "🛑 <strong>STOP! Do not open that file!</strong><br><code>Scholarship_Form.pdf.exe</code> ends in <strong>.exe</strong> — attackers disguised malware as a PDF!",
            state: 'concerned'
          },
          {
            text: "⚠️ <strong>Double Extension Trap:</strong> Delete this dangerous file immediately.<div style=\"margin-top:8px;\"><button type=\"button\" onclick=\"quarantineFile('f_scholarship_grant'); if (typeof RyanGuide !== 'undefined' &amp;&amp; RyanGuide.dismiss) RyanGuide.dismiss();\" style=\"background:linear-gradient(135deg,#ef4444,#dc2626);color:#ffffff;border:1px solid rgba(255,255,255,0.35);padding:5px 14px;border-radius:6px;cursor:pointer;font-weight:700;font-size:12px;display:inline-flex;align-items:center;gap:6px;box-shadow:0 2px 8px rgba(220,38,38,0.4);\">🗑️ Delete Malicious File Now</button></div>",
            state: 'concerned'
          }
        ]);
      }
    }
  }, 160);
}

function closeDownloadTray() {
  const tray = document.getElementById('browser-download-tray');
  if (tray) tray.classList.add('hidden');
}

function openFolderFromTray() {
  closeDownloadTray();
  openApp('folder');
  switchExplorerFolder('downloads');
  showToast('📁 Opened Downloads folder: 1 file ready.', 'info');
}

function deleteDownloadedFileFromTray() {
  closeDownloadTray();
  if (typeof quarantineFile === 'function') {
    quarantineFile('f_scholarship_grant');
  } else if (typeof quarantineScholarshipMalware === 'function') {
    quarantineScholarshipMalware();
  }
  showToast('🗑️ Deleted: "Scholarship_Form.pdf.exe" has been removed.', 'success');
}

function openDownloadedFileFromTray() {
  closeDownloadTray();
  const file = getScholarshipGrantFileDef();
  showSmartScreenWarning(file);
}

function openScholarshipInstallerModal() {
  const modal = document.getElementById('modal-scholarship-installer');
  if (!modal) return;

  // Reset to Step 1
  document.getElementById('installer-step-1')?.classList.remove('hidden');
  document.getElementById('installer-step-2')?.classList.add('hidden');
  document.getElementById('installer-step-3')?.classList.add('hidden');

  const fill = document.getElementById('inst-progress-fill');
  if (fill) fill.style.width = '0%';
  const label = document.getElementById('inst-status-label');
  if (label) label.textContent = 'Connecting to server...';

  modal.classList.remove('hidden');
  if (typeof AudioManager !== 'undefined' && AudioManager.playClick) {
    AudioManager.playClick();
  }
}

function closeScholarshipInstallerModal() {
  const modal = document.getElementById('modal-scholarship-installer');
  if (modal) modal.classList.add('hidden');
}

function startScholarshipInstallation() {
  const s1 = document.getElementById('installer-step-1');
  const s2 = document.getElementById('installer-step-2');
  const s3 = document.getElementById('installer-step-3');
  const fill = document.getElementById('inst-progress-fill');
  const label = document.getElementById('inst-status-label');
  const logBox = document.getElementById('inst-log-box');

  if (s1) s1.classList.add('hidden');
  if (s2) s2.classList.remove('hidden');
  if (s3) s3.classList.add('hidden');

  if (logBox) {
    logBox.innerHTML = `
      <div class="log-line">[0.00s] Initializing setup extraction engine...</div>
    `;
  }

  const logs = [
    { p: 20, text: 'Connecting to remote host: northfield-scholarship.com...', log: '[0.35s] Established socket connection to 198.51.100.89:443' },
    { p: 45, text: 'Extracting package: grant_agreement_v2.dll...', log: '[0.70s] Dropping payload to AppData\\Local\\Temp\\NorthfieldGrantSvc.exe' },
    { p: 70, text: 'Creating autorun registry keys...', log: '[1.10s] Added HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run entry' },
    { p: 90, text: 'Executing payload binary (Scholarship_Form.pdf.exe)...', log: '[1.45s] Process spawned with elevated system privileges PID: 4892' },
    { p: 100, text: 'Installation complete. Launching payload...', log: '[1.70s] ⚠️ Trojan Dropper execution triggered!' }
  ];

  let stepIdx = 0;
  const interval = setInterval(() => {
    if (stepIdx < logs.length) {
      const cur = logs[stepIdx];
      if (fill) fill.style.width = `${cur.p}%`;
      if (label) label.textContent = cur.text;
      if (logBox) {
        logBox.innerHTML += `<div class="log-line">${cur.log}</div>`;
        logBox.scrollTop = logBox.scrollHeight;
      }
      stepIdx++;
    } else {
      clearInterval(interval);
      setTimeout(() => {
        if (s2) s2.classList.add('hidden');
        if (s3) s3.classList.remove('hidden');
        if (typeof AudioManager !== 'undefined' && AudioManager.playWrong) {
          AudioManager.playWrong();
        }
      }, 500);
    }
  }, 350);
}

function quarantineScholarshipMalware() {
  const file = getScholarshipGrantFileDef();
  file.quarantined = true;
  if (window.ch1DownloadsList && window.ch1DownloadsList.length > 0) {
    window.ch1DownloadsList[0].quarantined = true;
  }
  closeScholarshipInstallerModal();
  updateAntiVirusProtectionUI();
  if (currentExplorerFolder === 'downloads') {
    renderFolderFiles();
  }
  if (typeof AudioManager !== 'undefined' && AudioManager.playCorrect) {
    AudioManager.playCorrect();
  }
  showToast('🛡️ Threat Neutralized: "Scholarship_Form.pdf.exe" has been quarantined.', 'success');
}

function returnToZmailFromInstaller() {
  closeScholarshipInstallerModal();
  openApp('gmail');
  showToast('📧 Returned to Zmail. Flag the suspicious attachment and fake sender to report the attack!', 'info');
}
