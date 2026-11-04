'use strict';

if (typeof escapeHtml !== 'function') {
  var escapeHtml = function(str) {
    if (str === null || str === undefined) return '';
    return String(str).replace(/[&<>"']/g, function(c) {
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  };
}

// ═══════════════════════════════════════════════════════════
// DYNAMIC SIMULATION NOTIFICATION ENGINE
// ═══════════════════════════════════════════════════════════

let simNotifications = [];

function initSimulationNotifications() {
  const currentCat = window._currentChapterCategory || activeCategoryStory || (typeof gameState !== 'undefined' && gameState.phase) || 'phishing';
  initChapterMissionNotifications(currentCat, false);
}

function initChapterMissionNotifications(chapterId, playChime = false) {
  simNotifications = [];
  const cat = (chapterId === 'mission' || chapterId === 'phishing') ? 'phishing' : chapterId;

  if (cat === 'phishing') {
    simNotifications.push({
      id: 'notif-ch1-zmail-wave1',
      source: 'Zmail',
      icon: '📧',
      iconType: 'mail',
      title: 'New Email: PayPal Rewards Prize Alert',
      body: 'Subject: CONGRATULATIONS: You Won ₱1,000,000 Pesos! Claim Your Prize Now. Click to inspect in Zmail.',
      time: 'Just now',
      app: 'gmail',
      emailId: 1
    });
    simNotifications.push({
      id: 'notif-ch1-directive',
      source: 'Mission Directive',
      icon: '🔍',
      iconType: 'shield',
      title: 'Chapter 1: The First Day',
      body: 'Investigate incoming emails, inspect sender domains, and flag deceptive phishing attacks.',
      time: '1m ago',
      app: 'gmail'
    });
  } else if (cat === 'malware') {
    // No active mission notifications for Chapter 2
  } else if (cat === 'social_engineering') {
    simNotifications.push({
      id: 'notif-ch3-zmail-advisory',
      source: 'Zmail',
      icon: '📧',
      iconType: 'mail',
      title: 'New Email: Campus Wi-Fi Security Advisory',
      body: 'Warning: Rogue public Wi-Fi hotspot detected on campus. MITM risk active.',
      time: 'Just now',
      app: 'gmail'
    });
    simNotifications.push({
      id: 'notif-ch3-wifi',
      source: 'Network Monitor',
      icon: '📶',
      iconType: 'vpn',
      title: 'Chapter 3: The System Collapse',
      body: 'Unsecured Wi-Fi access points detected in vicinity. Check Wi-Fi Settings.',
      time: '1m ago',
      app: 'wifi-settings'
    });
    simNotifications.push({
      id: 'notif-ch3-comms',
      source: 'Comms / Pia',
      icon: '💬',
      iconType: 'info',
      title: 'Support Request from Pia',
      body: 'Suspected credential theft after connecting to open campus network.',
      time: '3m ago',
      app: 'comms'
    });
  } else if (cat === 'ransomware') {
    simNotifications.push({
      id: 'notif-ch4-zmail-emergency',
      source: 'Zmail',
      icon: '📧',
      iconType: 'mail',
      title: 'New Email: EMERGENCY - System Outage',
      body: 'Critical: Coordinated ransomware campaign targeting school storage servers.',
      time: 'Just now',
      app: 'gmail'
    });
    simNotifications.push({
      id: 'notif-ch4-console',
      source: 'Incident Response',
      icon: '🚨',
      iconType: 'warning',
      title: 'Chapter 4: The Last Login',
      body: 'Launch Ransomware Console, isolate infected storage nodes, and restore offline backups.',
      time: '1m ago',
      app: 'ransomware'
    });
  } else {
    simNotifications.push({
      id: 'notif-init-zmail',
      source: 'Zmail',
      icon: '📧',
      iconType: 'mail',
      title: 'New Email: Welcome to CyberZerØ',
      body: 'Workstation ready. Check Zmail regularly for incoming incident communications.',
      time: 'Just now',
      app: 'gmail'
    });
    simNotifications.push({
      id: 'notif-init-assessment',
      source: 'CyberZerØ Simulation',
      icon: '🛡️',
      iconType: 'shield',
      title: 'Simulation Ready',
      body: 'Complete the pre-assessment exam to unlock active chapter investigations.',
      time: '2m ago'
    });
  }

  renderSimulationNotifications();
  if (playChime && typeof AudioManager !== 'undefined') {
    AudioManager.playNotification();
  }
}

function addSimulationNotification(notif, playChime = true) {
  if (!notif || !notif.id) return;
  simNotifications = simNotifications.filter(n => n.id !== notif.id);
  simNotifications.unshift(notif);
  if (simNotifications.length > 25) simNotifications.pop();

  renderSimulationNotifications();
  if (playChime && typeof AudioManager !== 'undefined') {
    AudioManager.playNotification();
  }
}

function renderSimulationNotifications() {
  const list = document.getElementById('notif-list');
  if (!list) return;

  if (!simNotifications || simNotifications.length === 0) {
    list.innerHTML = `
      <div class="notif-empty-state" style="text-align:center;padding:24px 10px;color:var(--text-muted);font-size:12px;">
        <div style="font-size:24px;margin-bottom:6px;">🔔</div>
        <div>No new notifications</div>
        <div style="font-size:10px;margin-top:2px;color:var(--accent-cyan);">Simulation notifications up to date</div>
      </div>`;
    updateNotifCount();
    return;
  }

  list.innerHTML = simNotifications.map(n => {
    const iconClass = n.iconType ? `notif-icon-${n.iconType}` : 'notif-icon-mail';
    const appHint = n.app === 'gmail' ? 'Open in Zmail' : n.app ? `Open ${n.app}` : '';
    return `
      <div class="notif-card" id="${n.id}" onclick="handleNotificationClick('${n.id}')" role="button" tabindex="0" title="${appHint ? 'Click to ' + appHint : ''}">
        <div class="notif-card-icon ${iconClass}">${n.icon || '🔔'}</div>
        <div class="notif-card-content">
          <div class="notif-card-top">
            <span class="notif-card-source">${escapeHtml(n.source || 'Zmail')}</span>
            <span class="notif-card-time">${escapeHtml(n.time || 'Just now')}</span>
          </div>
          <div class="notif-card-title">${escapeHtml(n.title || '')}</div>
          <div class="notif-card-body">${escapeHtml(n.body || '')}</div>
        </div>
        <button type="button" class="notif-dismiss-btn" onclick="dismissNotification('${n.id}', event)" title="Dismiss notification">✕</button>
      </div>
    `;
  }).join('');

  updateNotifCount();
}

function handleNotificationClick(notifId) {
  const notif = simNotifications.find(n => n.id === notifId);
  if (!notif) return;
  closeCalendarFlyout();

  if (notif.app === 'gmail') {
    openApp('gmail');
    if (typeof notif.emailId !== 'undefined' && notif.emailId !== null) {
      const idx = ch1InboxEmails.findIndex(e => e.id === notif.emailId);
      if (idx !== -1) {
        openEmail(idx);
      }
    }
  } else if (notif.app) {
    openApp(notif.app);
  }
}

function dismissNotification(id, event) {
  if (event) event.stopPropagation();
  const card = document.getElementById(id);
  simNotifications = simNotifications.filter(n => n.id !== id);
  if (card) {
    card.style.opacity = '0';
    card.style.transform = 'translateX(20px)';
    setTimeout(() => {
      card.remove();
      updateNotifCount();
      if (simNotifications.length === 0) {
        renderSimulationNotifications();
      }
    }, 200);
  } else {
    renderSimulationNotifications();
  }
}

function clearAllNotifications(event) {
  if (event) event.stopPropagation();
  simNotifications = [];
  renderSimulationNotifications();
  if (typeof AudioManager !== 'undefined') AudioManager.playMouseClick();
  showToast('🧹 All notifications cleared.', 'info');
}

function updateNotifCount() {
  const count = simNotifications.length;
  const badge = document.getElementById('notif-count-badge');
  if (badge) badge.textContent = count;
}
