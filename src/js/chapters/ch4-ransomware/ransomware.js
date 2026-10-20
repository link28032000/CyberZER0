'use strict';

// ═══════════════════════════════════════════════════════════
// CHAPTER 4: RANSOMWARE INCIDENT CONSOLE (JONALD)
// ═══════════════════════════════════════════════════════════

const RANSOMWARE_NODES = [
  {
    id: 'node_db',
    name: 'Shared Project Database (NAS-01)',
    icon: '🗄️',
    path: '/mnt/vault/project_db.enc',
    status: 'infected',
    threatName: 'Crypto.Locky.Payload',
    details: 'Files encrypted with .locky extension. Extortion demand left on volume.',
    actionPhase: 'isolate' // isolate -> restore -> clean
  },
  {
    id: 'node_dropper',
    name: 'Presentation Assets (Drive E:)',
    icon: '📊',
    path: '/srv/assets/crypt_dropper.exe',
    status: 'infected',
    threatName: 'Ransom.Dropper.Process (PID 4092)',
    details: 'Active malicious process detected attempting lateral network infection.',
    actionPhase: 'kill' // kill -> clean
  },
  {
    id: 'node_repo',
    name: 'Source Code Repository (Git-Srv)',
    icon: '💻',
    path: '/var/git/cyberzero_core.locked',
    status: 'infected',
    threatName: 'Ransom.Crypt.Payload',
    details: 'Repository volume locked by ransomware key. Encryption active.',
    actionPhase: 'isolate' // isolate -> restore -> clean
  },
  {
    id: 'node_logs',
    name: 'System Security Audit Logs (SysLog-04)',
    icon: '📜',
    path: '/var/log/audit.log',
    status: 'clean',
    threatName: 'Clean & Verified',
    details: 'Write-once immutable audit log stream. Uncompromised.',
    actionPhase: 'verify'
  }
];

function startRansomwareMission() {
  closeOverlay('overlay-results');
  closeOverlay('overlay-malware-results');
  closeOverlay('overlay-social-results');
  closeOverlay('overlay-ransomware-results');
  gameState.phase = 'ransomware';
  updateDesktopBackgroundForPhase('ransomware');

  RANSOMWARE_NODES.forEach((n, idx) => {
    if (idx === 3) {
      n.status = 'clean';
      n.actionPhase = 'verify';
    } else {
      n.status = 'infected';
      n.actionPhase = idx === 1 ? 'kill' : 'isolate';
    }
  });

  openApp('ransomware');
  const winRw = document.getElementById('win-ransomware');
  if (winRw) {
    winRw.style.left = '60px';
    winRw.style.top = '50px';
  }

  const logsEl = document.getElementById('rw-term-logs');
  if (logsEl) {
    logsEl.innerHTML = `
      <div class="rw-log-line rw-log-alert">[ALERT] Ransomware signature detected in project storage subsystem!</div>
      <div class="rw-log-line rw-log-warn">[WARN] Immediate action required: Isolate nodes and kill malicious payload droppers.</div>
      <div class="rw-log-line">[SYS] Emergency Immutable Cloud Backup connected at vault.cloud.backup</div>
    `;
  }

  renderRansomwareNodes();
  showToast('🔒 Chapter 4: Respond to ransomware, isolate infected drives, and restore the vault!', 'warning');
  if (typeof initChapterMissionNotifications === 'function') initChapterMissionNotifications('ransomware', true);
}

function renderRansomwareNodes() {
  const grid = document.getElementById('rw-nodes-grid');
  if (!grid) return;

  const restoredCount = RANSOMWARE_NODES.filter(n => n.status === 'clean' || n.status === 'restored').length;
  const pct = Math.round((restoredCount / RANSOMWARE_NODES.length) * 100);
  const healthEl = document.getElementById('rw-health-pct');
  if (healthEl) healthEl.textContent = `${pct}%`;

  grid.innerHTML = RANSOMWARE_NODES.map(node => {
    let statusClass = 'rw-status-infected';
    let statusText = '🚨 INFECTED / ENCRYPTED';
    let cardClass = 'infected';
    let buttonsHtml = '';

    if (node.status === 'clean' || node.status === 'restored') {
      statusClass = 'rw-status-restored';
      statusText = '✓ SECURED & RESTORED';
      cardClass = 'restored';
      buttonsHtml = '<span style="font-size:10px;color:#00e676;font-weight:700">✓ Immutable Snapshot Live</span>';
    } else if (node.status === 'isolated') {
      statusClass = 'rw-status-isolated';
      statusText = '⚠️ ISOLATED FROM NETWORK';
      cardClass = 'isolated';
      buttonsHtml = `
        <button class="rw-btn-action" onclick="executeNodeAction('${node.id}', 'restore')">
          📦 RESTORE FROM IMMUTABLE BACKUP (+100)
        </button>
      `;
    } else {
      if (node.actionPhase === 'kill') {
        buttonsHtml = `
          <button class="rw-btn-action" style="border-color:#ff5252;color:#ff5252" onclick="executeNodeAction('${node.id}', 'kill')">
            ⛔ TERMINATE PROCESS PID 4092 (+100)
          </button>
        `;
      } else if (node.actionPhase === 'verify') {
        buttonsHtml = `
          <button class="rw-btn-action" onclick="executeNodeAction('${node.id}', 'verify')">
            🔍 VERIFY AUDIT SIGNATURE (+50)
          </button>
        `;
      } else {
        buttonsHtml = `
          <button class="rw-btn-action" onclick="executeNodeAction('${node.id}', 'isolate')">
            🔒 ISOLATE COMPROMISED NODE
          </button>
        `;
      }
    }

    return `
      <div class="rw-node-card ${cardClass}">
        <div>
          <div class="rw-node-header">
            <span class="rw-node-icon">${node.icon}</span>
            <span class="rw-node-name">${node.name}</span>
          </div>
          <div class="rw-node-status ${statusClass}">${statusText}</div>
          <p style="font-size:10px;color:#90a4ae;margin:0 0 6px">${node.details}</p>
        </div>
        <div class="rw-node-actions">
          ${buttonsHtml}
        </div>
      </div>
    `;
  }).join('');
}

function executeNodeAction(nodeId, action) {
  const node = RANSOMWARE_NODES.find(n => n.id === nodeId);
  if (!node) return;

  if (action === 'isolate') {
    node.status = 'isolated';
    node.actionPhase = 'restore';
    appendRwTerminalLog(`[CONTAINMENT] Node ${node.name} successfully severed from network.`, 'warn');
    if (typeof AudioManager !== 'undefined') AudioManager.playExamChoice();
    showToast(`🔒 Node isolated! Now deploy clean backup restoration.`, 'info');
  } else if (action === 'restore') {
    node.status = 'restored';
    gameState.score += 100;
    appendRwTerminalLog(`[RECOVERY] Immutable snapshot deployed to ${node.name}. 100% data integrity verified.`, 'success');
    if (typeof AudioManager !== 'undefined') AudioManager.playCorrect();
    showToast(`🎉 Clean snapshot restored without paying any ransom (+100 pts)!`, 'success');
  } else if (action === 'kill') {
    node.status = 'restored';
    gameState.score += 100;
    appendRwTerminalLog(`[KILL-SWITCH] Process PID 4092 (crypt_dropper.exe) terminated. Threat neutralized.`, 'success');
    if (typeof AudioManager !== 'undefined') AudioManager.playCorrect();
    showToast(`⛔ Malicious dropper process neutralized (+100 pts)!`, 'success');
  } else if (action === 'verify') {
    node.status = 'restored';
    gameState.score += 50;
    appendRwTerminalLog(`[AUDIT] Audit logs signature cryptographic SHA-256 verified. No tampering detected.`, 'success');
    if (typeof AudioManager !== 'undefined') AudioManager.playCorrect();
    showToast(`✓ Audit logs verified clean (+50 pts)!`, 'success');
  }

  renderRansomwareNodes();
  updateHUD();

  if (typeof addSimulationNotification === 'function') {
    addSimulationNotification({
      id: 'notif-rw-' + nodeId + '-' + action,
      source: 'Ransomware Console',
      icon: action === 'restore' ? '💾' : action === 'kill' ? '⛔' : action === 'isolate' ? '🔒' : '✓',
      iconType: action === 'restore' ? 'shield' : action === 'isolate' ? 'warning' : 'av',
      title: (action === 'isolate' ? 'Node Isolated: ' : action === 'restore' ? 'Snapshot Restored: ' : action === 'kill' ? 'Process Neutralized: ' : 'Audit Verified: ') + node.name,
      body: action === 'isolate' ? `Storage node severed from network to prevent ransomware spread.` : action === 'restore' ? `Clean backup snapshot restored. Zero ransom paid.` : action === 'kill' ? `Malicious crypt_dropper payload terminated.` : `Cryptographic log audit verified clean.`,
      time: 'Just now',
      app: 'ransomware'
    }, false);
  }

  if (RANSOMWARE_NODES.every(n => n.status === 'clean' || n.status === 'restored')) {
    appendRwTerminalLog(`[SUCCESS] 100% System Vault Recovery Achieved! ZERO dollars paid in ransom!`, 'success');
    setTimeout(finishRansomwareMission, 1400);
  }
}

function appendRwTerminalLog(msg, type = 'info') {
  const logs = document.getElementById('rw-term-logs');
  if (!logs) return;
  const line = document.createElement('div');
  line.className = `rw-log-line ${type === 'alert' ? 'rw-log-alert' : type === 'warn' ? 'rw-log-warn' : type === 'success' ? 'rw-log-success' : ''}`;
  line.textContent = msg;
  logs.appendChild(line);
  logs.scrollTop = logs.scrollHeight;
}

function finishRansomwareMission() {
  document.getElementById('res-rw-recovered').textContent = `100% (4 / 4 Nodes)`;
  document.getElementById('res-rw-score').textContent = gameState.score;

  const rank = 'S';
  const rankEl = document.getElementById('ransomware-results-rank');
  const labelEl = document.getElementById('ransomware-results-rank-label');
  if (rankEl) rankEl.textContent = rank;
  if (labelEl) labelEl.textContent = 'RANSOMWARE INCIDENT COMMANDER';

  completeCategory('ransomware', gameState.score, rank);

  if (typeof addSimulationNotification === 'function') {
    addSimulationNotification({
      id: 'notif-ch4-complete',
      source: 'Mission Control',
      icon: '🏆',
      iconType: 'shield',
      title: 'Chapter 4 Completed — Case Closed',
      body: '100% of storage nodes recovered without ransom. Coordinated incident contained!',
      time: 'Just now'
    });
  }

  showOverlay('overlay-ransomware-results');
  if (typeof AudioManager !== 'undefined') AudioManager.playMissionComplete();
}
