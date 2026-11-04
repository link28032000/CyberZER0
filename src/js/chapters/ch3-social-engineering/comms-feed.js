'use strict';


function renderCommsFeed() {
  const listEl = document.getElementById('comms-msg-list');
  if (!listEl) return;

  const resolvedCount = COMMS_ITEMS.filter(c => c.resolved).length;
  const badgeEl = document.getElementById('comms-badge-count');
  const filterBadge = document.getElementById('comms-filter-badge');
  if (badgeEl) badgeEl.textContent = 4 - resolvedCount;
  if (filterBadge) filterBadge.textContent = `${resolvedCount} / 4 Resolved`;

  listEl.innerHTML = COMMS_ITEMS.map(item => {
    const isActive = item.id === selectedCommId;
    let statusPill = '<span class="comm-status-pill comm-pill-pending">⏳ Pending</span>';
    if (item.resolved) {
      statusPill = item.playerVerdict === 'flagged'
        ? '<span class="comm-status-pill comm-pill-blocked">🚩 Blocked (Threat)</span>'
        : '<span class="comm-status-pill comm-pill-safe">✓ Verified Safe</span>';
    }

    const preview = item.audioTranscript || item.messageText || item.subject;

    return `
      <div class="comm-item-row ${isActive ? 'active' : ''} ${item.resolved ? 'resolved' : ''}" onclick="selectCommItem('${item.id}')">
        <div class="comm-item-icon">${item.icon}</div>
        <div class="comm-item-content">
          <div class="comm-item-top">
            <span class="comm-item-sender">${item.sender}</span>
            <span class="comm-item-time">${item.time}</span>
          </div>
          <div class="comm-item-preview">${preview}</div>
          ${statusPill}
        </div>
      </div>
    `;
  }).join('');
}

function selectCommItem(commId) {
  selectedCommId = commId;
  renderCommsFeed();

  const item = COMMS_ITEMS.find(c => c.id === commId);
  const emptyState = document.getElementById('comms-empty-state');
  const detailView = document.getElementById('comms-detail-view');

  if (!item || !detailView) return;
  if (emptyState) emptyState.classList.add('hidden');
  detailView.classList.remove('hidden');

  let bodyContent = '';
  if (item.type === 'vishing') {
    bodyContent = `
      <div class="comm-audio-box">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span style="font-size:12px;font-weight:700;color:#ea80fc">🎙️ VOICE CALL RECORDING • DURATION: 0:42</span>
          <span style="font-size:11px;color:var(--text-muted)">AUDIO PLAYBACK</span>
        </div>
        <div class="comm-audio-wave">
          <span class="comm-audio-bar"></span>
          <span class="comm-audio-bar"></span>
          <span class="comm-audio-bar"></span>
          <span class="comm-audio-bar"></span>
          <span class="comm-audio-bar"></span>
          <span class="comm-audio-bar"></span>
          <span class="comm-audio-bar"></span>
          <span class="comm-audio-bar"></span>
        </div>
        <div class="comm-transcript-box">
          <strong>Automated Transcript:</strong><br>${item.audioTranscript}
        </div>
      </div>
    `;
  } else {
    bodyContent = `
      <div class="comm-sms-bubble">
        <strong>${item.channel}:</strong><br>
        ${item.messageText}
      </div>
    `;
  }

  let actionHtml = '';
  if (!item.resolved) {
    actionHtml = `
      <div class="comm-actions-bar">
        <button class="comm-btn-flag" onclick="flagCommItem('${item.id}', true)">
          🚩 FLAG AS SOCIAL ENGINEERING ATTACK (+100)
        </button>
        <button class="comm-btn-safe" onclick="flagCommItem('${item.id}', false)">
          ✓ VERIFY AS SAFE COMMUNICATION (+50)
        </button>
      </div>
    `;
  } else {
    actionHtml = `
      <div style="background:rgba(0,0,0,0.3);padding:12px;border-radius:8px;border:1px solid ${item.isSocialEngineering ? 'rgba(255,82,82,0.3)' : 'rgba(0,230,118,0.3)'};font-size:12px">
        <strong style="color:${item.isSocialEngineering ? '#ff5252' : '#00e676'}">${item.isSocialEngineering ? '⚠️ Threat Analysis Verdict:' : '✓ Safe Verification Verdict:'}</strong>
        <p style="margin:4px 0 0;color:#b0bec5">${item.explanation}</p>
      </div>
    `;
  }

  detailView.innerHTML = `
    <div class="comm-header-card">
      <div class="comm-header-badge">${item.channel} • INTERCEPT ID: ${item.id.toUpperCase()}</div>
      <div class="comm-header-title">${item.subject}</div>
      <div class="comm-meta-grid">
        <div><span>FROM:</span> <strong>${item.sender}</strong></div>
        <div><span>ADDRESS:</span> <strong>${item.address}</strong></div>
        <div><span>TIME:</span> <strong>${item.time}</strong></div>
        <div><span>TACTIC:</span> <strong>${item.tactic}</strong></div>
      </div>
    </div>

    ${bodyContent}
    ${actionHtml}
  `;
}

function flagCommItem(commId, playerFlaggedThreat) {
  const item = COMMS_ITEMS.find(c => c.id === commId);
  if (!item || item.resolved) return;

  item.resolved = true;
  item.playerVerdict = playerFlaggedThreat ? 'flagged' : 'verified';

  if (playerFlaggedThreat === item.isSocialEngineering) {
    gameState.score += 100;
    if (typeof AudioManager !== 'undefined') AudioManager.playCorrect();
    showToast(`🎯 Correct! ${item.threatVector} identified (+100 pts).`, 'success');
  } else {
    gameState.score = Math.max(0, gameState.score - 25);
    if (typeof AudioManager !== 'undefined') AudioManager.playWrong();
    showToast(`⚠️ Incorrect assessment! Review the CyberZerØ analysis (-25 pts).`, 'warning');
  }

  renderCommsFeed();
  selectCommItem(commId);
  updateHUD();

  // Check if all 4 communications resolved
  if (COMMS_ITEMS.every(c => c.resolved)) {
    setTimeout(finishSocialEngineeringMission, 1200);
  }
}

function finishSocialEngineeringMission() {
  const blocked = COMMS_ITEMS.filter(c => c.isSocialEngineering && c.playerVerdict === 'flagged').length;
  document.getElementById('res-social-blocked').textContent = `${blocked} / 3 Threats Blocked`;
  document.getElementById('res-social-score').textContent = gameState.score;

  const rank = blocked >= 3 ? 'S' : 'A';
  const rankEl = document.getElementById('social-results-rank');
  const labelEl = document.getElementById('social-results-rank-label');
  if (rankEl) rankEl.textContent = rank;
  if (labelEl) labelEl.textContent = rank === 'S' ? 'SOCIAL DEFENSE MASTER' : 'COMMUNICATIONS GUARDIAN';

  completeCategory('social_engineering', gameState.score, rank);
  showOverlay('overlay-social-results');
  if (typeof AudioManager !== 'undefined') AudioManager.playMissionComplete();
}
