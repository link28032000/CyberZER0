'use strict';

// ── STAGE 5: INFECTION SIMULATION ─────────────────────────────

const G4_SYMPTOMS = [
  { icon: '📁', text: 'Project Folder is responding slowly...', delay: 800 },
  { icon: '⚙️', text: 'Unknown process "PremiumDesignTool.exe" is running at high CPU...', delay: 2000 },
  { icon: '🌐', text: 'Browser opened unexpected tab: "ads.malware-domain.ru"', delay: 3500 },
  { icon: '🔒', text: 'Project files are becoming difficult to access...', delay: 5000 }
];

function g4StartInfection() {
  g4State.stage = 5;
  const contentEl = document.getElementById('browser-content');
  if (contentEl) {
    contentEl.innerHTML = `
      <div class="g4-infection-wrap" id="g4-infection-wrap">
        <div class="g4-infection-header">
          <div class="g4-infection-alert">⚠️ UNKNOWN APPLICATION RUNNING...</div>
          <div class="g4-narrator-box">🎙️ "Something isn't behaving normally."</div>
        </div>
        <div class="g4-symptom-list" id="g4-symptom-list"></div>
        <div class="g4-investigation-tools hidden" id="g4-investigation-tools">
          <div style="font-weight:700;color:var(--text-primary);margin-bottom:10px;">🔧 Investigation Tools</div>
          <div class="g4-tools-grid">
            <button class="g4-tool-btn" onclick="openApp('taskmanager'); renderG4TaskManager()">📊 Task Manager</button>
            <button class="g4-tool-btn" onclick="g4CheckDownloads()">📁 Downloads</button>
            <button class="g4-tool-btn" onclick="g4CheckProjectFolder()">📂 Project Folder</button>
            <button class="g4-tool-btn" onclick="g4DisconnectWifi()">📶 Disconnect Wi-Fi</button>
            <button class="g4-tool-btn" onclick="openApp('scanner'); renderG4Scanner()">🔍 Security Scanner</button>
          </div>
        </div>
      </div>
    `;
  }

  // Apply visual glitch effect
  document.body.classList.add('g4-infected');

  // Reveal symptoms one by one
  let shown = 0;
  G4_SYMPTOMS.forEach((s, i) => {
    setTimeout(() => {
      const list = document.getElementById('g4-symptom-list');
      if (list) {
        const div = document.createElement('div');
        div.className = 'g4-symptom-row';
        div.innerHTML = `<span class="g4-sym-icon">${s.icon}</span><span>${s.text}</span>`;
        div.style.animation = 'g4-sym-appear 400ms ease';
        list.appendChild(div);
        shown++;
        if (shown === G4_SYMPTOMS.length) {
          setTimeout(() => {
            const tools = document.getElementById('g4-investigation-tools');
            if (tools) tools.classList.remove('hidden');
          }, 600);
        }
      }
    }, s.delay);
  });
}

function renderG4TaskManager() {
  const list = document.getElementById('tm-process-list');
  if (!list) return;

  list.innerHTML = G4_PROCESSES.map(p => `
    <div class="tm-process-row ${p.suspicious ? 'suspicious-process' : ''}">
      <span class="tm-col-name">${p.suspicious ? '⚠️ ' : ''}${p.name}</span>
      <span class="tm-col-cpu ${p.suspicious ? 'text-danger' : ''}">${p.cpu}</span>
      <span class="tm-col-mem">${p.mem}</span>
      <span class="tm-col-status">${p.status}</span>
      ${p.suspicious ? `<button class="btn-danger btn-sm" onclick="g4KillProcess('${p.pid}')">End Task</button>` : '<span style="width:80px"></span>'}
    </div>
  `).join('');
}

function g4KillProcess(pid) {
  g4State.processKilled = true;
  g4State.infectionInvestigated = true;
  g4State.score += 75;
  showToast('✅ Suspicious process terminated! (+75 pts)', 'success');
  const list = document.getElementById('tm-process-list');
  if (list) {
    renderG4TaskManager();
    const rows = list.querySelectorAll('.suspicious-process');
    rows.forEach(r => { r.style.opacity = '0.3'; r.style.textDecoration = 'line-through'; });
    setTimeout(() => {
      list.innerHTML = list.innerHTML.replace('suspicious-process', '') + `<div style="padding:8px;color:var(--accent-green);font-size:12px">✓ PremiumDesignTool.exe (PID 4092) terminated.</div>`;
    }, 400);
  }
  g4CheckAllInfectionSteps();
}

function g4CheckDownloads() {
  g4State.infectionInvestigated = true;
  showToast('📁 Downloads folder: Found "PremiumDesignTool.exe" — source: canva-premium-free.example (Unverified)', 'warning');
}

function g4CheckProjectFolder() {
  showToast('📂 Project Folder: Files responding slowly. 2 files show access errors. Disconnect network to limit damage.', 'warning');
}

function g4DisconnectWifi() {
  g4State.wifiDisconnected = true;
  g4State.score += 50;
  showToast('📶 Wi-Fi disconnected. Network communication limited. (+50 pts)', 'success');

  // Update tray icon
  const wifiIcon = document.getElementById('tray-wifi-icon');
  if (wifiIcon) wifiIcon.innerHTML = `<img src="assets/icons/networks/wi-fi.svg" alt="Wi-Fi" style="width:18px;height:18px;vertical-align:middle;opacity:0.4;filter:grayscale(1)">`;

  showToast('🎙️ "Disconnecting the laptop can help limit further network communication while the incident is investigated."', 'info');
  g4CheckAllInfectionSteps();
}

function renderG4Scanner() {
  const title = document.getElementById('scanner-title');
  const sub = document.getElementById('scanner-sub');
  if (title) title.textContent = 'Security Scanner — Threat Analysis';
  if (sub) sub.textContent = g4State.fileDecision === 'open' ? '⚠️ Suspicious activity detected. Run a full scan.' : 'No active threat. Run scan to verify.';
}

function runSecurityScan() {
  const btn = document.getElementById('scanner-run-btn');
  const progress = document.getElementById('scanner-progress');
  const fill = document.getElementById('scanner-progress-fill');
  const text = document.getElementById('scanner-progress-text');
  const pct = document.getElementById('scanner-progress-pct');
  const results = document.getElementById('scanner-results');

  if (btn) btn.disabled = true;
  if (progress) progress.classList.remove('hidden');
  if (results) results.innerHTML = '';

  let p = 0;
  const scanSteps = ['Checking startup programs...', 'Scanning running processes...', 'Inspecting downloaded files...', 'Analyzing network connections...'];
  const interval = setInterval(() => {
    p += 4;
    if (fill) fill.style.width = p + '%';
    if (pct) pct.textContent = p + '%';
    if (text) text.textContent = scanSteps[Math.floor(p / 25)] || 'Finalizing scan...';
    if (p >= 100) {
      clearInterval(interval);
      g4State.scannerRan = true;
      g4State.score += 50;
      if (progress) progress.classList.add('hidden');
      if (results) {
        results.innerHTML = g4State.fileDecision === 'open' ? `
          <div class="scanner-threat-found">
            <div style="font-weight:700;color:var(--accent-red)">⚠️ THREAT DETECTED</div>
            <div class="scanner-threat-item">
              <strong>PremiumDesignTool.exe</strong><br>
              Threat: Trojan.Downloader.Unknown<br>
              Action: <button class="btn-danger btn-sm" onclick="g4ScannerQuarantine()">Quarantine</button>
            </div>
          </div>
        ` : `<div class="scanner-clean"><span>✅</span> No threats found. Device appears clean.</div>`;
      }
      g4CheckAllInfectionSteps();
    }
  }, 60);
}

function g4ScannerQuarantine() {
  g4State.score += 50;
  showToast('✅ Threat quarantined by Security Scanner! (+50 pts)', 'success');
  const results = document.getElementById('scanner-results');
  if (results) results.innerHTML = `<div class="scanner-clean">🛡️ Threat quarantined. File removed from system.</div>`;
  document.body.classList.remove('g4-infected');
  g4CheckAllInfectionSteps();
}

function g4CheckAllInfectionSteps() {
  const allDone = g4State.wifiDisconnected || g4State.scannerRan || g4State.processKilled;
  if (allDone && g4State.fileDecision === 'open') {
    setTimeout(() => {
      showToast('🔍 Investigation complete. Proceeding to results...', 'info');
      setTimeout(() => g4ShowConsequences(), 2000);
    }, 1000);
  }
}

// ── CONSEQUENCES & RESULTS ─────────────────────────────────────

function g4ShowConsequences() {
  document.body.classList.remove('g4-infected');
  if (g4InfectionTimer) { clearInterval(g4InfectionTimer); g4InfectionTimer = null; }

  // Compute result tier
  const saferDecisions = [
    !!g4State.wifiChoice, // connected (any)
    g4State.securedLaptop,
    g4State.miaAction === 'reported' || g4State.miaAction === 'ignored',
    g4State.fileDecision === 'delete' || g4State.fileDecision === 'report'
  ];
  const saferCount = saferDecisions.filter(Boolean).length;
  const isSaferPath = saferCount >= 3;

  const rank = isSaferPath ? (g4State.score >= 300 ? 'S' : 'A') : 'B';
  completeCategory('social_engineering', g4State.score, rank);

  if (typeof addSimulationNotification === 'function') {
    addSimulationNotification({
      id: 'notif-ch3-complete',
      source: 'Mission Control',
      icon: '🏆',
      iconType: 'shield',
      title: 'Chapter 3 Completed — Rank ' + rank,
      body: `Safer decisions: ${saferCount}/4. Campus Wi-Fi vulnerabilities & social engineering contained.`,
      time: 'Just now'
    });
  }

  const overlay = document.getElementById('overlay-social-results');
  if (overlay) {
    // Update results content
    const blockedEl = document.getElementById('res-social-blocked');
    const scoreEl = document.getElementById('res-social-score');
    const rankEl = document.getElementById('social-results-rank');
    const labelEl = document.getElementById('social-results-rank-label');

    if (blockedEl) blockedEl.textContent = `${saferCount} / 4 Safer Decisions`;
    if (scoreEl) scoreEl.textContent = g4State.score;
    if (rankEl) rankEl.textContent = rank;
    if (labelEl) labelEl.textContent = isSaferPath ? 'CYBER AWARE INVESTIGATOR' : 'LEARNING SECURITY BASICS';

    // Inject consequence summary into overlay
    const card = overlay.querySelector('.results-card');
    if (card) {
      const existing = card.querySelector('.g4-consequence-card');
      if (existing) existing.remove();

      const conseq = document.createElement('div');
      conseq.className = 'g4-consequence-card';
      conseq.innerHTML = isSaferPath ? `
        <div class="g4-conseq-safer">
          <div class="g4-conseq-title">✅ Project Progress Maintained</div>
          <div class="g4-conseq-body">Threats identified and handled. Project files secure. Good investigation!</div>
          <div class="g4-conseq-steps">
            ${g4State.wifiChoice ? '✓ Verified network before connecting' : '✗ Chose a network'}<br>
            ${g4State.securedLaptop ? '✓ Secured laptop settings' : '✗ Left sharing enabled'}<br>
            ${g4State.miaAction !== 'sent' ? '✓ Verified Pia\'s identity' : '✗ Sent personal information'}<br>
            ${g4State.fileDecision !== 'open' ? '✓ Rejected unknown file' : '✗ Opened unknown file'}
          </div>
        </div>
      ` : `
        <div class="g4-conseq-risky">
          <div class="g4-conseq-title">⚠️ Security Risk Increased</div>
          <div class="g4-conseq-body">Some decisions increased exposure. Laptop potentially compromised. Project files affected.</div>
          <div class="g4-conseq-steps">
            ${g4State.securedLaptop ? '✓ Secured laptop settings' : '✗ Left File Sharing / Discovery enabled'}<br>
            ${g4State.miaAction !== 'sent' ? '✓ Protected personal information' : '✗ Shared student ID and birthday'}<br>
            ${g4State.fileDecision !== 'open' ? '✓ Handled unknown file safely' : '✗ Opened unknown .exe — Infection triggered'}
          </div>
        </div>
      `;
      card.insertBefore(conseq, card.querySelector('.results-actions') || card.lastChild);
    }

    showOverlay('overlay-social-results');
    if (typeof AudioManager !== 'undefined') AudioManager.playMissionComplete();
  }
}
