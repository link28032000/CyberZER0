'use strict';

// ═══════════════════════════════════════════════════════════
// OPEN FILE HANDLERS (DOCX, IMAGE, VIDEO, SMARTSCREEN)
// ═══════════════════════════════════════════════════════════

let smartscreenTargetFile = null;

function openFileFromFolder(fileId) {
  const file = getExplorerFileById(fileId);
  if (!file) return;

  // App shortcuts in Desktop folder
  if (file.appId) {
    if (file.appId === 'notes') {
      toggleStickyNote();
    } else {
      // Pre-load this shortcut into the AV target card when opening antivirus
      if (file.appId === 'antivirus') {
        // Just open the app — target card stays as default Quick scan
      }
      openApp(file.appId);
    }
    return;
  }
  if (file.id === 'desk_app_recycle') {
    showToast('🗑️ Recycle Bin is currently empty.', 'info');
    return;
  }

  if (file.quarantined) {
    showToast(`🛡️ Access Denied: "${file.name}" is quarantined in the Anti-Virus security vault!`, 'warning');
    if (typeof AudioManager !== 'undefined') AudioManager.playWrong();
    return;
  }

  const ext = file.realExt.toLowerCase();

  // 1. DANGEROUS MALWARE / EXECUTABLE / SCRIPT
  if (file.isMalware || ext === 'exe' || ext === 'scr' || ext === 'vbs' || file.id === 'f_scholarship_grant') {
    showSmartScreenWarning(file);
    return;
  }

  // 2. DOCX / WORD DOCUMENT
  if (ext === 'docx' || ext === 'doc' || ext === 'txt' || ext === 'pdf' || ext === 'xlsx') {
    openDocViewer(file);
    return;
  }

  // 3. IMAGE FILES
  if (ext === 'jpg' || ext === 'jpeg' || ext === 'png' || ext === 'gif' || ext === 'svg' || ext === 'webp') {
    openImageViewer(file);
    return;
  }

  // 4. AUDIO FILES (MP3, WAV, OGG, M4A)
  if (ext === 'mp3' || ext === 'wav' || ext === 'ogg' || ext === 'm4a') {
    openAudioPlayer(file);
    return;
  }

  // 5. VIDEO FILES
  if (ext === 'mp4' || ext === 'webm' || ext === 'mov' || ext === 'mkv') {
    openVideoPlayer(file);
    return;
  }

  // 6. NETWORK RESOURCES & SHARES
  if (ext === 'srv' || ext === 'nas' || ext === 'ws' || ext === 'prt' || ext === 'mob' || ext === 'share') {
    showToast(`🌐 Connected to ${file.name} (${file.size || 'Local Subnet'}). Resource active.`, 'success');
    return;
  }

  // 7. DISK IMAGES & CAPTURES
  if (ext === 'iso') {
    showToast(`💿 Mounted "${file.name}" as virtual optical disc. Image clean.`, 'info');
    return;
  }
  if (ext === 'pcap') {
    showToast(`📊 Analyzed "${file.name}": 14,200 local packets verified clean.`, 'info');
    return;
  }
  if (ext === 'bin' || ext === 'inf' || ext === 'sys' || ext === 'log') {
    showToast(`⚙️ Inspected system file: "${file.name}" (${file.type}).`, 'info');
    return;
  }
  if (ext === 'dir') {
    // If this folder has a defined sub-folder, navigate into it
    if (file.subFolderKey) {
      switchExplorerFolder(file.subFolderKey);
    } else {
      showToast(`📁 "${file.name}" is empty or a protected system folder.`, 'info');
    }
    return;
  }

  showToast(`Opened "${file.name}" with default handler.`, 'info');
}

// ─── 1. MICROSOFT WORD (DOCX VIEWER) ────────────────────────
function openDocViewer(file) {
  const titleText = document.getElementById('docviewer-title-text');

  // Text File / Diagnostic Log View
  if (file.realExt === 'txt' || file.name.endsWith('.txt')) {
    if (titleText) titleText.textContent = `Notepad — ${file.name}`;
    const page = document.getElementById('docviewer-page-content');
    if (page) {
      page.innerHTML = `
        <div style="font-family:var(--font-mono, monospace); font-size:12px; line-height:1.6; color:#0f172a; white-space:pre-wrap; padding:10px;">
================================================================
USB FLASH DRIVE HARDWARE DIAGNOSTIC REPORT
Device: SanDisk Ultra USB 3.0 (16GB FAT32)
Volume Serial Number: 84B2-79F1
Scan Date: 2026-09-06 09:30:14 UTC
================================================================
[INFO] Bus Type: USB 3.2 Gen 1 (5.0 Gbps)
[INFO] Controller: Phison PS2251-09 (Verified OEM Firmware)
[INFO] Sector Size: 512 bytes | Cluster Size: 4096 bytes
[INFO] Bad Blocks / Sectors: 0 (Health Status: 100% HEALTHY)
[PASS] S.M.A.R.T. Self-Test Completed: PASSED
[PASS] Integrity Hash Check: No Bit Rot Detected
[PASS] File System Verification: 0 corrupt directory records
----------------------------------------------------------------
Security Telemetry (ShieldAV Storage Sentinel):
[✓] Hidden partitions: None
[✓] MBR / Boot Sector: Clean (Standard MS-DOS 5.0 boot record)
[✓] Malicious autorun payload: NOT DETECTED
================================================================
Status: DEVICE HARDWARE IS HEALTHY AND AUTHORIZED FOR USE.
================================================================
        </div>`;
    }
    openApp('docviewer');
    focusWindow('docviewer');
    showToast(`📝 Opened "${file.name}" in Text Viewer.`, 'success');
    return;
  }

  // Confidential Field Case Notes
  if (file.id === 'usb_notes') {
    if (titleText) titleText.textContent = `Microsoft Word — ${file.name}`;
    const page = document.getElementById('docviewer-page-content');
    if (page) {
      page.innerHTML = `
        <div class="word-doc-header-banner">
          <div>
            <div class="word-doc-title">CYBER INVESTIGATION FIELD NOTES</div>
            <div class="word-doc-subtitle">Incident Case #2026-004 • Confidential Forensic Journal</div>
          </div>
          <div style="font-size:32px">🕵️</div>
        </div>
        <div class="word-doc-meta-strip">
          <span><strong>Investigator:</strong> Alex (IT Support Trainee)</span>
          <span><strong>Location:</strong> Campus Library & Server Room Perimeter</span>
          <span><strong>Security:</strong> AES-256 Passphrase Protected</span>
        </div>
        <h3 style="color:#1e40af;margin-top:0">Field Timeline</h3>
        <p><strong>08:30 AM:</strong> Identified rogue Wi-Fi beacon emitting SSID "CAMPUS_FREE_STUDENT_WIFI" near cafeteria.</p>
        <p><strong>08:45 AM:</strong> Packet capture initiated. Signal triangulation points to an unauthorized battery-powered ESP32/Pineapple access point.</p>
        <p><strong>09:15 AM:</strong> Intercepted credential phishing templates targeting campus student portal logins.</p>
        <div class="word-callout-box" style="margin-top:16px">
          <strong>✓ Action Plan:</strong> Alert students not to connect to unencrypted networks; advise Ms. Santos in IT to locate physical transmitter.
        </div>`;
    }
    openApp('docviewer');
    focusWindow('docviewer');
    showToast(`📄 Opened "${file.name}" in Microsoft Word.`, 'success');
    return;
  }

  if (titleText) titleText.textContent = `Microsoft Word — ${file.name}`;

  const page = document.getElementById('docviewer-page-content');
  if (page) {
    page.innerHTML = `
      <div class="word-doc-header-banner">
        <div>
          <div class="word-doc-title">CYBERZERØ CAMPUS DEFENSE ARCHITECTURE</div>
          <div class="word-doc-subtitle">High School Cyber Security Division • Technical Specification v2.6</div>
        </div>
        <div style="font-size:32px">🛡️</div>
      </div>

      <div class="word-doc-meta-strip">
        <span><strong>Author:</strong> Alex (IT Support Trainee)</span>
        <span><strong>Reviewer:</strong> Ms. Santos (IT Dept)</span>
        <span><strong>Classification:</strong> VERIFIED CLEAN</span>
        <span><strong>Status:</strong> Approved</span>
      </div>

      <h3 style="color:#1e40af;margin-top:0">1. Executive Overview</h3>
      <p>This document outlines the multi-layered cyber defense architecture deployed across campus student workstations. The primary mission is early threat detection, neutralization of spear-phishing campaigns, and real-time endpoint malware quarantine.</p>

      <h3 style="color:#1e40af">2. File Extension & Attachment Protocols</h3>
      <p>Attackers commonly exploit default operating system configurations that conceal known extensions. A double-extension file such as <code>document.pdf.exe</code> is technically an executable binary. Staff and students must enforce full file extension visibility.</p>

      <div class="word-callout-warning">
        <strong>⚠️ MANDATORY MACRO SECURITY POLICY:</strong><br>
        Legitimate official school documents will <strong>NEVER</strong> prompt users to "Enable Content", execute Visual Basic macros, or disable security sandboxing to read basic text. Any document demanding macro activation must be quarantined immediately.
      </div>

      <h3 style="color:#1e40af">3. Antivirus Integration & Digital Signatures</h3>
      <p>All downloaded attachments undergo automated SHA-256 hashing. The cryptographic signature for this document is verified as:</p>
      <div style="background:#f1f5f9;padding:8px 12px;border-radius:4px;font-family:var(--font-mono);font-size:10.5px;color:#0f172a;word-break:break-all">
        SHA-256: a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e (Clean)
      </div>

      <div class="word-callout-box" style="margin-top:20px">
        <strong>✓ Document Verified:</strong> Clean Office OpenXML document structure. Zero obfuscated payloads or remote templates detected.
      </div>`;
  }

  openApp('docviewer');
  focusWindow('docviewer');
  showToast(`📄 Opened "${file.name}" in Microsoft Word.`, 'success');
}

function scanCurrentDocumentInAV() {
  if (gameState.selectedFolderFileId) {
    scanFileInAntivirus(gameState.selectedFolderFileId);
  } else {
    showToast('Document already verified clean by ShieldAV.', 'success');
  }
}

function setWordZoom(val) {
  const page = document.getElementById('docviewer-page-content');
  if (page) {
    page.style.transform = `scale(${val / 100})`;
    page.style.transformOrigin = 'top center';
  }
}
