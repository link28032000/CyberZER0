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
window.RANSOMWARE_NODES = RANSOMWARE_NODES;

function startRansomwareMission(autoOpenApp = true) {
  closeOverlay('overlay-results');
  closeOverlay('overlay-malware-results');
  closeOverlay('overlay-social-results');
  closeOverlay('overlay-ransomware-results');
  gameState.phase = 'ransomware';
  window._currentChapterCategory = 'ransomware';
  if (typeof activeCategoryStory !== 'undefined') activeCategoryStory = 'ransomware';
  updateDesktopBackgroundForPhase('ransomware');

  if (typeof gameState !== 'undefined') {
    gameState.score = 0;
  }
  if (typeof updateHUD === 'function') {
    updateHUD();
  }
  const hudEl = document.getElementById('hud');
  if (hudEl) hudEl.classList.add('hidden');

  RANSOMWARE_NODES.forEach((n, idx) => {
    if (idx === 3) {
      n.status = 'clean';
      n.actionPhase = 'verify';
    } else {
      n.status = 'infected';
      n.actionPhase = idx === 1 ? 'kill' : 'isolate';
    }
  });

  const logsEl = document.getElementById('rw-term-logs');
  if (logsEl) {
    logsEl.innerHTML = `
      <div class="rw-log-line rw-log-alert">[ALERT] Ransomware signature detected in project storage subsystem!</div>
      <div class="rw-log-line rw-log-warn">[WARN] Immediate action required: Isolate nodes and kill malicious payload droppers.</div>
      <div class="rw-log-line">[SYS] Emergency Immutable Cloud Backup connected at vault.cloud.backup</div>
    `;
  }

  renderRansomwareNodes();

  // Desktop icons configuration for Chapter 4 (Ryan)
  document.querySelectorAll('.ch2-only').forEach(el => {
    el.style.setProperty('display', 'flex', 'important');
  });
  document.querySelectorAll('.ch2-not-ch3').forEach(el => {
    el.style.setProperty('display', 'none', 'important');
  });
  document.querySelectorAll('.ch3-only').forEach(el => {
    el.style.setProperty('display', 'none', 'important');
  });
  document.querySelectorAll('.ch4-only').forEach(el => {
    el.style.setProperty('display', 'flex', 'important');
  });

  // Ensure File Explorer & Anti-Virus are unlocked
  ['folder', 'antivirus'].forEach(appName => {
    const icon = document.getElementById(`icon-${appName}`);
    if (icon) {
      icon.classList.remove('locked');
      icon.title = appName === 'folder' ? 'File Explorer' : 'Anti-Virus';
    }
    const tb = document.getElementById(`taskbar-${appName}`);
    if (tb) {
      tb.classList.remove('locked');
      tb.title = appName === 'folder' ? 'File Explorer' : 'Anti-Virus';
    }
  });

  if (autoOpenApp) {
    openApp('ransomware');
    const winRw = document.getElementById('win-ransomware');
    if (winRw) {
      winRw.style.left = '60px';
      winRw.style.top = '50px';
    }
    showToast('🔒 Chapter 4: Respond to ransomware, isolate infected drives, and restore the vault!', 'warning');
    if (typeof initChapterMissionNotifications === 'function') initChapterMissionNotifications('ransomware', true);
  } else {
    // When restarting or returning to desktop directly:
    // Keep apps closed and leave user cleanly on desktop
    if (typeof hideAllOverlays === 'function') hideAllOverlays();
    if (typeof initChapterMissionNotifications === 'function') initChapterMissionNotifications('ransomware', false);
  }
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

function isChapter4Complete() {
  if (Array.isArray(RANSOMWARE_NODES) && RANSOMWARE_NODES.length > 0) {
    return RANSOMWARE_NODES.every(n => n.status === 'clean' || n.status === 'restored');
  }
  return false;
}
window.isChapter4Complete = isChapter4Complete;

function finishRansomwareMission() {
  const recEl = document.getElementById('res-rw-recovered');
  if (recEl) recEl.textContent = `100% (4 / 4 Nodes)`;
  const scoreEl = document.getElementById('res-rw-score');
  if (scoreEl) scoreEl.textContent = gameState.score;

  const rank = 'S';
  const rankEl = document.getElementById('ransomware-results-rank');
  const labelEl = document.getElementById('ransomware-results-rank-label');
  if (rankEl) rankEl.textContent = rank;
  if (labelEl) labelEl.textContent = 'RANSOMWARE INCIDENT COMMANDER';

  if (typeof completeCategory === 'function') {
    completeCategory('ransomware', gameState.score, rank);
  }

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

  if (typeof AudioManager !== 'undefined' && AudioManager.playMissionComplete) {
    AudioManager.playMissionComplete();
  }

  // Completion dialogue from Ryan (IT Support Mentor)
  const ryanCompletionLines = [
    {
      text: "Outstanding work, Alex! You've successfully contained the ransomware incident across all systems!",
      state: 'success',
      label: 'TAP TO CONTINUE'
    },
    {
      text: "You isolated every compromised storage volume, terminated the malicious dropper payload before it could spread laterally, and restored critical project data from our immutable offline backups.",
      state: 'speaking',
      label: 'TAP TO CONTINUE'
    },
    {
      text: "Best of all, you proved that proactive defense, rapid incident response, and reliable cold backups beat cyber extortion every time — zero dollars paid in ransom!",
      state: 'speaking',
      label: 'TAP TO CONTINUE'
    },
    {
      text: "As your IT Support Mentor, I'm proud to award you the <strong>Malware Trophy</strong> for mastering threat mitigation and ransomware defense. Claim your reward!",
      state: 'success',
      label: 'CLAIM REWARD'
    }
  ];

  if (typeof RyanGuide !== 'undefined' && RyanGuide.speak) {
    RyanGuide.releaseMainFlow();
    RyanGuide.speak(ryanCompletionLines, {
      mainFlow: true,
      chapter: 'ransomware',
      onDone: function() {
        if (typeof RyanGuide !== 'undefined' && RyanGuide.dismiss) {
          RyanGuide.dismiss(true);
          RyanGuide.releaseMainFlow();
        }
        showMalwareTrophyModal();
      }
    });
  } else {
    showMalwareTrophyModal();
  }
}
window.finishRansomwareMission = finishRansomwareMission;

// ─── Malware Trophy Modal (Big Medal + Confetti Celebration) ───────────
function showMalwareTrophyModal() {
  const curCat = window._currentChapterCategory || (typeof activeCategoryStory !== 'undefined' ? activeCategoryStory : null) || (typeof gameState !== 'undefined' ? gameState.phase : null) || 'malware';
  const isCh2 = curCat === 'malware';
  const isClaimed = (typeof isAchievementClaimed === 'function' && isAchievementClaimed('ach_malware')) || Boolean(window._malwareAwardClaimed);

  let isComplete = false;
  let count = 0;
  let total = 0;
  let rankLabel = '';

  if (isCh2) {
    const prog = typeof getChapter2Missions1to4Progress === 'function' ? getChapter2Missions1to4Progress() : { count: 0, total: 11, isComplete: false };
    isComplete = prog.isComplete;
    count = prog.count;
    total = prog.total;
    rankLabel = `${count} / ${total} MISSIONS 1–4 TASKS COMPLETED`;
  } else {
    // Chapter 4 (ransomware) or general
    isComplete = (typeof isChapter4Complete === 'function' && isChapter4Complete()) || (typeof isChapter2Missions1to4Complete === 'function' && isChapter2Missions1to4Complete());
    if (typeof RANSOMWARE_NODES !== 'undefined' && Array.isArray(RANSOMWARE_NODES)) {
      count = RANSOMWARE_NODES.filter(n => n.status === 'clean' || n.status === 'restored').length;
      total = RANSOMWARE_NODES.length;
      rankLabel = `${count} / ${total} THREAT NODES &amp; INCIDENT MISSIONS COMPLETED`;
    } else {
      count = 4;
      total = 4;
      rankLabel = `CHAPTER MISSIONS COMPLETED`;
    }
  }

  if (!isComplete && !isClaimed) {
    if (typeof showToast === 'function') {
      showToast(isCh2 ? '🔒 Complete all Chapter 2 Missions 1–4 tasks first!' : '🔒 Complete all Chapter 4 tasks and incident missions first!', 'warning');
    }
    return;
  }

  const existing = document.getElementById('malware-trophy-modal');
  if (existing) {
    if (typeof existing.remove === 'function') existing.remove();
    else if (existing.parentElement) existing.parentElement.removeChild(existing);
  }

  const descText = isClaimed
    ? 'You have claimed the Malware Trophy! Collectible trophy is preserved in your trophies.'
    : (isCh2
        ? 'All Chapter 2 Missions 1–4 tasks successfully completed! Workstation threat neutralized. Claim your collectible trophy.'
        : 'All Chapter 4 tasks and incident response missions successfully completed! Claim your collectible trophy.');

  const modal = document.createElement('div');
  modal.id = 'malware-trophy-modal';
  modal.className = 'phish-trophy-modal';
  modal.innerHTML = `
    <div class="ptm-backdrop" onclick="closeMalwareTrophyModal(false)"></div>
    <div class="ptm-confetti-fullscreen" id="mtm-confetti"></div>
    <div class="ptm-card ptm-card-clean">
      <div class="ptm-glow-ring"></div>
      <div class="ptm-big-medal-container">
        <div class="ptm-big-award-backlight ${isComplete || isClaimed ? 'is-claimed' : 'is-silhouette'}"></div>
        <img src="assets/Achievement/Malware.png" class="ptm-big-award-img ${isComplete || isClaimed ? 'is-claimed' : 'is-silhouette'}" alt="Malware Trophy" />
      </div>
      <h2 class="ptm-big-title">Malware Protection Award</h2>
      <div class="ptm-big-rank">${rankLabel}</div>
      <div class="ptm-desc" style="font-size:12px;color:#94a3b8;margin:8px 0 16px;text-align:center;max-width:380px;">
        ${descText}
      </div>
      <div class="ptm-footer" style="margin-top: 14px;">
        <button class="ptm-close-btn" onclick="${isClaimed ? "closeMalwareTrophyModal(true)" : "attemptClaimMalwareAward()"}">${isClaimed ? 'Award Claimed (Close)' : 'Claim Reward'}</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const confettiEl = modal.querySelector('#mtm-confetti');
  if (isComplete && confettiEl) {
    const palette = ['#00e676', '#ffd700', '#facc15', '#00f0ff', '#ffffff', '#10b981'];
    for (let i = 0; i < 75; i++) {
      const p = document.createElement('div');
      p.className = 'ptm-confetti-particle';
      const size = 7 + Math.random() * 9;
      const isRound = Math.random() > 0.6;
      const isRibbon = !isRound && Math.random() > 0.5;
      p.style.cssText = `
        left: ${Math.random() * 100}%;
        background: ${palette[Math.floor(Math.random() * palette.length)]};
        animation-delay: ${Math.random() * 2.5}s;
        animation-duration: ${2.4 + Math.random() * 2}s;
        width: ${isRibbon ? size * 0.45 : size}px;
        height: ${isRibbon ? size * 1.8 : size}px;
        border-radius: ${isRound ? '50%' : '2px'};
        opacity: ${0.85 + Math.random() * 0.15};
      `;
      confettiEl.appendChild(p);
    }
  }

  requestAnimationFrame(() => {
    requestAnimationFrame(() => modal.classList.add('ptm-show'));
  });

  if (isComplete && typeof AudioManager !== 'undefined') {
    if (AudioManager.playTrophyFanfare) AudioManager.playTrophyFanfare();
    else if (AudioManager.playCorrect) AudioManager.playCorrect();
  }
}
window.showMalwareTrophyModal = showMalwareTrophyModal;

function attemptClaimMalwareAward() {
  const isClaimed = (typeof isAchievementClaimed === 'function' && isAchievementClaimed('ach_malware')) || Boolean(window._malwareAwardClaimed);
  if (isClaimed) {
    closeMalwareTrophyModal(true);
    if (typeof showToast === 'function') {
      showToast('✓ Malware Trophy already claimed!', 'info');
    }
    return;
  }

  const curCat = window._currentChapterCategory || (typeof activeCategoryStory !== 'undefined' ? activeCategoryStory : null) || (typeof gameState !== 'undefined' ? gameState.phase : null) || 'malware';
  const isCh2 = curCat === 'malware';

  const ch2Complete = typeof isChapter2Missions1to4Complete === 'function' && isChapter2Missions1to4Complete();
  const ch4Complete = typeof isChapter4Complete === 'function' && isChapter4Complete();

  if (!ch2Complete && !ch4Complete) {
    if (typeof showToast === 'function') {
      showToast(isCh2 ? '⚠️ Complete all Chapter 2 Missions 1–4 tasks first!' : '⚠️ Complete all Chapter 4 tasks and incident missions first!', 'warning');
    }
    return;
  }

  window._malwareAwardClaimed = true;

  // Persist claimed status to Main Menu achievements map
  try {
    const raw = localStorage.getItem('cyberzero_claimed_achievements');
    const map = raw ? JSON.parse(raw) : {};
    map['ach_malware'] = {
      claimed: true,
      chapter: isCh2 ? 2 : 4,
      title: 'Malware Protection Award',
      claimedAt: Date.now(),
      claimedDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    };
    localStorage.setItem('cyberzero_claimed_achievements', JSON.stringify(map));
  } catch (e) {}

  // Audio fanfare for successful claim
  if (typeof AudioManager !== 'undefined') {
    try {
      if (typeof AudioManager.playTrophyFanfare === 'function') AudioManager.playTrophyFanfare();
      else if (typeof AudioManager.playPerfectFanfare === 'function') AudioManager.playPerfectFanfare();
      else if (typeof AudioManager.playMissionComplete === 'function') AudioManager.playMissionComplete();
      if (typeof AudioManager.playChime === 'function') setTimeout(() => AudioManager.playChime(true), 320);
    } catch (e) {}
  }

  // Preserve Chapter 2 progress
  if (window._ch2Mission) {
    window._ch2Mission.malwareAwardClaimed = true;
    if (typeof _persistCh2Mission === 'function') {
      _persistCh2Mission();
    } else {
      try { localStorage.setItem('cyberzero_ch2_mission', JSON.stringify(window._ch2Mission)); } catch (e) {}
    }
  }

  // Save session & progress
  try {
    const sess = JSON.parse(localStorage.getItem('cyberzero_session_state') || '{}');
    if (isCh2) {
      if (!sess.ch2) sess.ch2 = {};
      sess.ch2.malwareAwardClaimed = true;
      sess.ch2.completed = true;
    } else {
      if (!sess.ch4) sess.ch4 = {};
      sess.ch4.malwareAwardClaimed = true;
      sess.ch4.completed = true;
    }
    localStorage.setItem('cyberzero_session_state', JSON.stringify(sess));
  } catch (e) {}

  if (typeof completeCategory === 'function') {
    completeCategory(isCh2 ? 'malware' : 'ransomware', (typeof gameState !== 'undefined' && gameState.score) || 400, 'S');
  }

  if (typeof window.saveProgress === 'function') {
    window.saveProgress().catch(() => {});
  }
  if (typeof updateStartButton === 'function') {
    updateStartButton();
  }
  if (typeof updateStickyChecklist === 'function') {
    try { updateStickyChecklist(); } catch (e) {}
  }

  if (typeof showToast === 'function') {
    showToast('🏆 Malware Trophy Claimed! Preserved in your Trophy Cabinet.', 'success');
  }

  closeMalwareTrophyModal(true);

  // If in Chapter 2, guide Ethan to Mission 5 (Knowledge Assessment)
  if (isCh2 && window._ch2Mission && !window._ch2Mission.assessmentCompleted) {
    setTimeout(() => {
      if (typeof RyanGuide !== 'undefined' && RyanGuide.speak) {
        RyanGuide.speak([
          {
            text: "Congratulations on claiming your Malware Trophy! Before we finish, let's take a quick 4-question Knowledge Assessment to test what you learned about Bitcoin Miner trojans.",
            state: 'speaking',
            label: 'START ASSESSMENT'
          }
        ], {
          onDone: function() {
            if (typeof updateStickyChecklist === 'function') updateStickyChecklist();
            if (typeof window.launchCh2KnowledgeAssessment === 'function') {
              window.launchCh2KnowledgeAssessment();
            }
          }
        });
      }
    }, 600);
  }
}
window.attemptClaimMalwareAward = attemptClaimMalwareAward;

function closeMalwareTrophyModal(showResults = true) {
  const modal = document.getElementById('malware-trophy-modal');
  if (modal) {
    modal.classList.remove('ptm-show');
    setTimeout(() => {
      if (modal.parentElement) modal.parentElement.removeChild(modal);
    }, 400);
  }
  const curCat = window._currentChapterCategory || (typeof activeCategoryStory !== 'undefined' ? activeCategoryStory : null);
  if (showResults && curCat === 'ransomware' && typeof showOverlay === 'function') {
    showOverlay('overlay-ransomware-results');
  }
}
window.closeMalwareTrophyModal = closeMalwareTrophyModal;
