'use strict';

/* ═══════════════════════════════════════════════════════════════
   CYBERZERO — TASK MANAGER
   Realistic Windows 11 Inspired Task Manager Engine
   Responsive Grid, Hi-DPI Dynamic Canvases & Fullscreen Adaptation
═══════════════════════════════════════════════════════════════ */

var TM_APPS = [
  { name: 'Zmail',         icon: '<img src="assets/icons/apps/mail.svg" class="tm-icon-img" alt="Zmail">',            cpu: function(){ return _tmRand(0.1, 1.2);  }, mem: function(){ return _tmRand(80, 210);  }, disk: '0 MB/s', net: '0.0 Mbps', pid: 5820, user: 'Ethan',   status: 'Running' },
  { name: 'Browser',       icon: '<img src="assets/icons/apps/browser.svg" class="tm-icon-img" alt="Browser">',       cpu: function(){ return _tmRand(0.5, 4.2);  }, mem: function(){ return _tmRand(180, 420); }, disk: '0.1 MB/s', net: '0.1 Mbps', pid: 3412, user: 'Ethan', status: 'Running' },
  { name: 'File Explorer', icon: '<img src="assets/icons/apps/folder.svg" class="tm-icon-img" alt="File Explorer">',  cpu: function(){ return _tmRand(0.0, 0.8);  }, mem: function(){ return _tmRand(40, 90);   }, disk: '0 MB/s', net: '0.0 Mbps', pid: 2244, user: 'Ethan',   status: 'Running' },
  { name: 'Anti-Virus',    icon: '<img src="assets/icons/apps/windows_defender.svg" class="tm-icon-img" alt="AV">',   cpu: function(){ return _tmRand(0.2, 2.0);  }, mem: function(){ return _tmRand(100, 250); }, disk: '0 MB/s', net: '0.0 Mbps', pid: 1488, user: 'SYSTEM', status: 'Running' },
  { name: 'Task Manager',  icon: '<img src="assets/icons/Chapter 2 new apps/Task Manager.svg" class="tm-icon-img" alt="TM">', cpu: function(){ return _tmRand(0.1, 0.6); }, mem: function(){ return _tmRand(24, 55); }, disk: '0 MB/s', net: '0.0 Mbps', pid: 7760, user: 'Ethan', status: 'Running' },
  { name: 'Phone Link',    icon: '<img src="assets/icons/apps/Smartphone.svg" class="tm-icon-img" alt="Phone Link">', cpu: function(){ return _tmRand(0.0, 0.5);  }, mem: function(){ return _tmRand(30, 80);   }, disk: '0 MB/s', net: '0.0 Mbps', pid: 6104, user: 'Ethan',   status: 'Running' },
  { name: 'Steam',         icon: '<img src="assets/icons/Chapter 2 new apps/steam.svg" class="tm-icon-img" alt="Steam">',   cpu: function(){ return _tmRand(0.1, 1.8);  }, mem: function(){ return _tmRand(120, 300); }, disk: '0 MB/s', net: '0.2 Mbps', pid: 4480, user: 'Ethan', status: 'Running' },
  { name: 'GTA 6',         icon: '<img src="assets/icons/Chapter 2 new apps/GTA6.svg" class="tm-icon-img" alt="GTA 6">',    cpu: function(){ return _tmRand(0.0, 0.4);  }, mem: function(){ return _tmRand(50, 140);  }, disk: '0 MB/s', net: '0.0 Mbps', pid: 8120, user: 'Ethan', status: 'Running' }
];

var TM_BG = [
  { name: 'svchost.exe (LocalSystem)',    icon: '<img src="assets/icons/apps/settings.svg" class="tm-icon-img" alt="svc">', cpu: function(){ return _tmRand(0.0, 1.4); }, mem: function(){ return _tmRand(12, 60);  }, disk: '0 MB/s', net: '0.0 Mbps', pid: 840,  user: 'SYSTEM',        status: 'Running' },
  { name: 'svchost.exe (NetworkService)', icon: '<img src="assets/icons/apps/settings.svg" class="tm-icon-img" alt="svc">', cpu: function(){ return _tmRand(0.0, 0.8); }, mem: function(){ return _tmRand(8, 35);   }, disk: '0 MB/s', net: '0.0 Mbps', pid: 1024, user: 'SYSTEM',        status: 'Running' },
  { name: 'lsass.exe',                   icon: '<img src="assets/icons/apps/settings.svg" class="tm-icon-img" alt="lsass">', cpu: function(){ return _tmRand(0.0, 0.6); }, mem: function(){ return _tmRand(10, 28);  }, disk: '0 MB/s', net: '0.0 Mbps', pid: 752,  user: 'SYSTEM',        status: 'Running' },
  { name: 'dwm.exe',                     icon: '<img src="assets/icons/apps/settings.svg" class="tm-icon-img" alt="dwm">',  cpu: function(){ return _tmRand(0.1, 2.0); }, mem: function(){ return _tmRand(30, 120); }, disk: '0 MB/s', net: '0.0 Mbps', pid: 1200, user: 'DWM-1',         status: 'Running' },
  { name: 'explorer.exe',               icon: '<img src="assets/icons/apps/folder.svg" class="tm-icon-img" alt="exp">',    cpu: function(){ return _tmRand(0.0, 1.0); }, mem: function(){ return _tmRand(40, 90);  }, disk: '0 MB/s', net: '0.0 Mbps', pid: 3088, user: 'Ethan',         status: 'Running' },
  { name: 'WmiPrvSE.exe',               icon: '<img src="assets/icons/apps/settings.svg" class="tm-icon-img" alt="wmi">',  cpu: function(){ return _tmRand(0.0, 0.4); }, mem: function(){ return _tmRand(6, 22);   }, disk: '0 MB/s', net: '0.0 Mbps', pid: 2900, user: 'SYSTEM',        status: 'Running' },
  { name: 'RuntimeBroker.exe',          icon: '<img src="assets/icons/apps/settings.svg" class="tm-icon-img" alt="rb">',   cpu: function(){ return _tmRand(0.0, 0.3); }, mem: function(){ return _tmRand(8, 30);   }, disk: '0 MB/s', net: '0.0 Mbps', pid: 4320, user: 'Ethan',         status: 'Running' },
  { name: 'SearchIndexer.exe',          icon: '<img src="assets/icons/apps/search.svg" class="tm-icon-img" alt="idx">',    cpu: function(){ return _tmRand(0.0, 3.5); }, mem: function(){ return _tmRand(20, 80);  }, disk: '0.1 MB/s', net: '0.0 Mbps', pid: 2560, user: 'SYSTEM',     status: 'Running' },
  { name: 'MsMpEng.exe',               icon: '<img src="assets/icons/apps/windows_defender.svg" class="tm-icon-img" alt="av">', cpu: function(){ return _tmRand(0.0, 2.5); }, mem: function(){ return _tmRand(80, 200); }, disk: '0 MB/s', net: '0.0 Mbps', pid: 3600, user: 'SYSTEM',      status: 'Running' },
  { name: 'audiodg.exe',               icon: '<img src="assets/icons/apps/settings.svg" class="tm-icon-img" alt="audio">', cpu: function(){ return _tmRand(0.0, 0.8); }, mem: function(){ return _tmRand(10, 30);  }, disk: '0 MB/s', net: '0.0 Mbps', pid: 2048, user: 'LOCAL SERVICE', status: 'Running' },
  { name: 'ctfmon.exe',                icon: '<img src="assets/icons/apps/settings.svg" class="tm-icon-img" alt="ctf">',   cpu: function(){ return _tmRand(0.0, 0.2); }, mem: function(){ return _tmRand(4, 12);   }, disk: '0 MB/s', net: '0.0 Mbps', pid: 1780, user: 'Ethan',         status: 'Running' },
  { name: 'spoolsv.exe',               icon: '<img src="assets/icons/apps/settings.svg" class="tm-icon-img" alt="spool">',  cpu: function(){ return _tmRand(0.0, 0.1); }, mem: function(){ return _tmRand(4, 12);   }, disk: '0 MB/s', net: '0.0 Mbps', pid: 2220, user: 'SYSTEM',        status: 'Running' }
];

var TM_MALWARE_PROC = {
  name: 'PremiumDesignTool.exe',
  icon: '<img src="assets/icons/apps/browser.svg" class="tm-icon-img" alt="mal" style="filter:hue-rotate(270deg) saturate(3)">',
  cpu:  function(){ return (typeof g4State !== 'undefined' && g4State.processKilled) ? 0.0 : _tmRand(28, 48); },
  mem:  function(){ return (typeof g4State !== 'undefined' && g4State.processKilled) ? 0.0 : _tmRand(310, 540); },
  disk: '0.4 MB/s',
  net:  '1.8 Mbps',
  pid:  4092,
  user: 'Ethan',
  status: '⚠️ Suspicious',
  suspicious: true
};

var _tmIntervalId    = null;
var _tmPerfActive    = 'cpu';
var _tmUptimeSecs    = 0;
var _tmUptimeTimer   = null;
var _tmPerfHistory   = { cpu: [], mem: [], disk: [], net: [] };
var _tmActiveTab     = 'processes';
var _tmG4Mode        = false;
var _tmSearchFilter  = '';
var _tmSelectedPid   = null;
var _tmGroupExpanded = { apps: true, bg: true };
var _tmProcSort      = { col: 'name', dir: 'asc' };
var _tmDetailSort    = { col: 'name', dir: 'asc' };
var _tmResizeObserver = null;

var TM_GRAPH_COLORS = {
  cpu:  '#38bdf8',
  mem:  '#a78bfa',
  disk: '#34d399',
  net:  '#fb923c'
};

function _tmRand(min, max) {
  return Math.random() * (max - min) + min;
}

/* ─── Initialization ──────────────────────────────────────── */
function initTaskManager() {
  _tmRenderProcesses();
  _tmRenderDetails();
  _tmStartLiveUpdate();
  _tmStartUptime();
  _tmSetupResizeHandling();
  _tmUpdateCommandBar();

  if (_tmActiveTab === 'performance') {
    _tmDrawAllMiniGraphs();
    _tmDrawMainGraph();
    _tmUpdatePerfStats();
  }
}

/* Tab Navigation */
function tmSwitchTab(tab) {
  _tmActiveTab = tab;
  ['processes', 'performance', 'details'].forEach(function(t) {
    var panel = document.getElementById('tm-panel-' + t);
    var tabEl = document.getElementById('tm-tab-' + t);
    if (!panel || !tabEl) return;
    if (t === tab) {
      panel.classList.remove('hidden');
      tabEl.classList.add('active');
    } else {
      panel.classList.add('hidden');
      tabEl.classList.remove('active');
    }
  });

  if (tab === 'performance') {
    setTimeout(function() {
      _tmTickPerfHistory();
      _tmDrawAllMiniGraphs();
      _tmDrawMainGraph();
      _tmUpdatePerfStats();
    }, 20);
  } else if (tab === 'processes') {
    _tmRenderProcesses();
  } else if (tab === 'details') {
    _tmRenderDetails();
  }
}

/* ─── Group Toggle & Filtering ────────────────────────────── */
function tmToggleGroup(group) {
  _tmGroupExpanded[group] = !_tmGroupExpanded[group];
  var list = document.getElementById(group === 'apps' ? 'tm-process-list' : 'tm-bg-list');
  var header = document.getElementById(group === 'apps' ? 'tm-group-apps' : 'tm-group-bg');
  if (list) {
    list.style.display = _tmGroupExpanded[group] ? 'block' : 'none';
  }
  if (header) {
    if (_tmGroupExpanded[group]) header.classList.remove('collapsed');
    else header.classList.add('collapsed');
  }
}

function tmFilterProcesses(query) {
  _tmSearchFilter = (query || '').toLowerCase().trim();
  var clearBtn = document.getElementById('tm-search-clear');
  if (clearBtn) {
    if (_tmSearchFilter.length > 0) clearBtn.classList.remove('hidden');
    else clearBtn.classList.add('hidden');
  }
  _tmRenderProcesses();
  _tmRenderDetails();
}

function tmClearSearch() {
  var input = document.getElementById('tm-search-input');
  if (input) input.value = '';
  tmFilterProcesses('');
}

/* ─── Sorting Logic ───────────────────────────────────────── */
function tmSortProcesses(column) {
  if (_tmProcSort.col === column) {
    _tmProcSort.dir = (_tmProcSort.dir === 'asc') ? 'desc' : 'asc';
  } else {
    _tmProcSort.col = column;
    _tmProcSort.dir = (column === 'cpu' || column === 'mem') ? 'desc' : 'asc';
  }
  _updateSortArrow('tm-sort-arrow-', column, _tmProcSort.dir);
  _tmRenderProcesses();
}

function tmSortDetails(column) {
  if (_tmDetailSort.col === column) {
    _tmDetailSort.dir = (_tmDetailSort.dir === 'asc') ? 'desc' : 'asc';
  } else {
    _tmDetailSort.col = column;
    _tmDetailSort.dir = (column === 'cpu' || column === 'pid') ? 'desc' : 'asc';
  }
  _updateSortArrow('tm-details-sort-', column, _tmDetailSort.dir);
  _tmRenderDetails();
}

function _updateSortArrow(prefix, activeCol, dir) {
  ['name', 'cpu', 'mem', 'pid'].forEach(function(c) {
    var el = document.getElementById(prefix + c);
    if (!el) return;
    if (c === activeCol) el.textContent = (dir === 'asc') ? '▲' : '▼';
    else el.textContent = '';
  });
}

function _tmApplySort(list, sortConfig) {
  var col = sortConfig.col;
  var dir = sortConfig.dir === 'asc' ? 1 : -1;
  return list.slice().sort(function(a, b) {
    if (col === 'name') {
      return a.name.localeCompare(b.name) * dir;
    } else if (col === 'cpu') {
      var aCpu = typeof a.cpu === 'function' ? a.cpu() : parseFloat(a.cpu || 0);
      var bCpu = typeof b.cpu === 'function' ? b.cpu() : parseFloat(b.cpu || 0);
      return (aCpu - bCpu) * dir;
    } else if (col === 'mem') {
      var aMem = typeof a.mem === 'function' ? a.mem() : parseFloat(a.mem || 0);
      var bMem = typeof b.mem === 'function' ? b.mem() : parseFloat(b.mem || 0);
      return (aMem - bMem) * dir;
    } else if (col === 'pid') {
      return (a.pid - b.pid) * dir;
    }
    return 0;
  });
}

/* ─── Row Selection & End Task Action ─────────────────────── */
function tmSelectRow(pid) {
  _tmSelectedPid = String(pid);
  document.querySelectorAll('.tm-process-row, .tm-detail-row').forEach(function(r) {
    if (r.getAttribute('data-pid') === String(pid)) {
      r.classList.add('selected-row');
    } else {
      r.classList.remove('selected-row');
    }
  });
  _tmUpdateCommandBar();
}

function _tmUpdateCommandBar() {
  var endBtn = document.getElementById('tm-cmd-end-task');
  if (!endBtn) return;
  if (_tmSelectedPid) {
    endBtn.disabled = false;
  } else {
    endBtn.disabled = true;
  }
}

function tmEndSelectedTask() {
  if (!_tmSelectedPid) return;
  var pid = _tmSelectedPid;
  if (pid === '4092' || (TM_MALWARE_PROC && String(TM_MALWARE_PROC.pid) === pid)) {
    if (typeof g4KillProcess === 'function') {
      g4KillProcess(pid);
    } else {
      _tmSimulateProcessKill(pid);
    }
    return;
  }

  // Generic app termination simulation for realism
  if (typeof showToast === 'function') {
    showToast('Process PID ' + pid + ' terminated.', 'info');
  }
  _tmSimulateProcessKill(pid);
}

function _tmSimulateProcessKill(pid) {
  var row = document.querySelector('[data-pid="' + pid + '"]');
  if (row) {
    row.classList.add('terminated-process');
    row.style.opacity = '0.35';
    row.style.textDecoration = 'line-through';
  }
  _tmSelectedPid = null;
  _tmUpdateCommandBar();
}

function tmRunNewTask() {
  if (typeof showToast === 'function') {
    showToast('Run New Task dialog simulated — permissions verified.', 'info');
  }
}

/* ─── Rendering: Processes Tab ────────────────────────────── */
function _tmRenderProcesses() {
  var appListEl = document.getElementById('tm-process-list');
  var bgListEl  = document.getElementById('tm-bg-list');
  var noResEl   = document.getElementById('tm-no-results');
  if (!appListEl || !bgListEl) return;

  var isMalwareTerminated = (typeof g4State !== 'undefined' && g4State.processKilled);

  var apps = TM_APPS.slice();
  if (_tmG4Mode) {
    apps.push(TM_MALWARE_PROC);
  }

  // Filter
  if (_tmSearchFilter) {
    apps = apps.filter(function(p) {
      return p.name.toLowerCase().includes(_tmSearchFilter) || String(p.pid).includes(_tmSearchFilter);
    });
  }
  // Sort
  apps = _tmApplySort(apps, _tmProcSort);

  var bg = TM_BG.slice();
  if (_tmSearchFilter) {
    bg = bg.filter(function(p) {
      return p.name.toLowerCase().includes(_tmSearchFilter) || String(p.pid).includes(_tmSearchFilter);
    });
  }
  bg = _tmApplySort(bg, _tmProcSort);

  // Group counters
  var appsCountEl = document.getElementById('tm-apps-count');
  var bgCountEl   = document.getElementById('tm-bg-count');
  if (appsCountEl) appsCountEl.textContent = apps.length;
  if (bgCountEl)   bgCountEl.textContent   = bg.length;

  if (apps.length === 0 && bg.length === 0) {
    if (noResEl) noResEl.classList.remove('hidden');
  } else {
    if (noResEl) noResEl.classList.add('hidden');
  }

  appListEl.innerHTML = apps.map(function(p) { return _tmAppRow(p, isMalwareTerminated); }).join('');
  bgListEl.innerHTML  = bg.map(_tmBgRow).join('');

  _tmUpdateStatusBar();
}

function _tmAppRow(p, isTerminatedMalware) {
  var isSusp = !!p.suspicious;
  var isKilled = isSusp && isTerminatedMalware;
  var cpuVal = isKilled ? 0.0 : p.cpu();
  var memVal = isKilled ? 0 : p.mem();

  var cpu = cpuVal.toFixed(1);
  var mem = memVal.toFixed(0);

  var cpuBar = Math.min((parseFloat(cpu) / 50) * 100, 100).toFixed(0);
  var memBar = Math.min((parseFloat(mem) / 600) * 100, 100).toFixed(0);

  var isSelected = (_tmSelectedPid === String(p.pid));

  var statusTag = isKilled
    ? '<span class="tm-terminated-tag">✓ Terminated</span>'
    : (isSusp ? '<span class="tm-status-warn-tag">⚠️ Suspicious</span>' : '<span class="tm-status-running-tag">Running</span>');

  var actionBtn = '';
  if (isSusp) {
    if (isKilled) {
      actionBtn = '<span class="tm-terminated-tag">✓ Stopped</span>';
    } else {
      actionBtn = '<button type="button" class="tm-end-btn" onclick="event.stopPropagation(); g4KillProcess(\'' + p.pid + '\')">End Task</button>';
    }
  }

  var rowClasses = 'tm-process-row' +
    (isSusp ? ' suspicious-process' : '') +
    (isKilled ? ' terminated-process' : '') +
    (isSelected ? ' selected-row' : '');

  return '<div class="' + rowClasses + '" data-pid="' + p.pid + '" onclick="tmSelectRow(\'' + p.pid + '\')" title="' + p.name + ' (PID: ' + p.pid + ')">' +
    '<span class="tm-col-name"><span class="tm-proc-icon">' + p.icon + '</span>' +
    (isSusp && !isKilled ? '<span class="tm-warn-badge">⚠️</span>' : '') +
    '<span>' + p.name + '</span></span>' +
    '<span class="tm-col-status">' + statusTag + '</span>' +
    '<span class="tm-col-cpu"><span class="tm-bar-wrap"><span class="tm-bar' + (isSusp && !isKilled ? ' tm-bar-red' : '') +
    '" style="width:' + cpuBar + '%"></span></span>' + cpu + '%</span>' +
    '<span class="tm-col-mem"><span class="tm-bar-wrap"><span class="tm-bar tm-bar-blue" style="width:' + memBar +
    '%"></span></span>' + mem + ' MB</span>' +
    '<span class="tm-col-disk">' + (isKilled ? '0 MB/s' : (p.disk || '0 MB/s')) + '</span>' +
    '<span class="tm-col-net">'  + (isKilled ? '0.0 Mbps' : (p.net  || '0.0 Mbps')) + '</span>' +
    '<span class="tm-col-action">' + actionBtn + '</span>' +
  '</div>';
}

function _tmBgRow(p) {
  var cpuVal = p.cpu();
  var memVal = p.mem();
  var cpu = cpuVal.toFixed(1);
  var mem = memVal.toFixed(0);

  var cpuBar = Math.min((parseFloat(cpu) / 50) * 100, 100).toFixed(0);
  var isSelected = (_tmSelectedPid === String(p.pid));

  var rowClasses = 'tm-process-row tm-process-row-sm' + (isSelected ? ' selected-row' : '');

  return '<div class="' + rowClasses + '" data-pid="' + p.pid + '" onclick="tmSelectRow(\'' + p.pid + '\')" title="' + p.name + ' (PID: ' + p.pid + ')">' +
    '<span class="tm-col-name"><span class="tm-proc-icon">' + p.icon + '</span><span>' + p.name + '</span></span>' +
    '<span class="tm-col-status"><span class="tm-status-running-tag">Running</span></span>' +
    '<span class="tm-col-cpu"><span class="tm-bar-wrap"><span class="tm-bar" style="width:' + cpuBar + '%"></span></span>' + cpu + '%</span>' +
    '<span class="tm-col-mem">' + mem + ' MB</span>' +
    '<span class="tm-col-disk">' + (p.disk || '0 MB/s') + '</span>' +
    '<span class="tm-col-net">'  + (p.net  || '0.0 Mbps') + '</span>' +
    '<span class="tm-col-action"></span>' +
  '</div>';
}

/* ─── Rendering: Details Tab ──────────────────────────────── */
function _tmRenderDetails() {
  var list = document.getElementById('tm-details-list');
  var noRes = document.getElementById('tm-details-no-results');
  if (!list) return;

  var isMalwareTerminated = (typeof g4State !== 'undefined' && g4State.processKilled);

  var all = TM_APPS.concat(TM_BG);
  if (_tmG4Mode) all.push(TM_MALWARE_PROC);

  if (_tmSearchFilter) {
    all = all.filter(function(p) {
      return p.name.toLowerCase().includes(_tmSearchFilter) || String(p.pid).includes(_tmSearchFilter);
    });
  }

  all = _tmApplySort(all, _tmDetailSort);

  if (all.length === 0) {
    if (noRes) noRes.classList.remove('hidden');
  } else {
    if (noRes) noRes.classList.add('hidden');
  }

  list.innerHTML = all.map(function(p) {
    var isSusp = !!p.suspicious;
    var isKilled = isSusp && isMalwareTerminated;
    var cpu = (isKilled ? 0.0 : p.cpu()).toFixed(1);
    var mem = (isKilled ? 0 : p.mem()).toFixed(0);
    var isSelected = (_tmSelectedPid === String(p.pid));

    var statusDot = isKilled
      ? '<span class="tm-status-dot" style="background:#64748b;"></span>Terminated'
      : (isSusp ? '<span class="tm-status-dot dot-warn"></span>Suspicious' : '<span class="tm-status-dot"></span>Running');

    var rowClasses = 'tm-detail-row' +
      (isSusp ? ' suspicious-process' : '') +
      (isKilled ? ' terminated-process' : '') +
      (isSelected ? ' selected-row' : '');

    return '<div class="' + rowClasses + '" data-pid="' + p.pid + '" onclick="tmSelectRow(\'' + p.pid + '\')">' +
      '<span class="tm-col-name"><span class="tm-proc-icon">' + p.icon + '</span>' + p.name + '</span>' +
      '<span class="tm-col-pid" style="font-family:var(--font-mono,\'Consolas\',monospace)">' + p.pid + '</span>' +
      '<span class="tm-col-status">' + statusDot + '</span>' +
      '<span class="tm-col-user">' + p.user + '</span>' +
      '<span class="tm-col-cpu" style="font-family:var(--font-mono,\'Consolas\',monospace)">' + cpu + '%</span>' +
      '<span class="tm-col-mem" style="font-family:var(--font-mono,\'Consolas\',monospace)">' + mem + ' MB</span>' +
      '<span class="tm-col-arch" style="color:#64748b">x64</span>' +
    '</div>';
  }).join('');
}

/* ─── Live Updates & Periodic Tasks ───────────────────────── */
function _tmStartLiveUpdate() {
  if (_tmIntervalId) clearInterval(_tmIntervalId);
  _tmIntervalId = setInterval(function() {
    _tmTickPerfHistory();
    if (_tmActiveTab === 'processes')   _tmRenderProcesses();
    if (_tmActiveTab === 'details')     _tmRenderDetails();
    if (_tmActiveTab === 'performance') {
      _tmDrawAllMiniGraphs();
      _tmDrawMainGraph();
      _tmUpdatePerfStats();
    }
    _tmUpdateStatusBar();
  }, 1500);
}

function _tmStartUptime() {
  if (_tmUptimeSecs === 0) {
    _tmUptimeSecs = Math.floor(Math.random() * 3600 * 4) + 1800;
  }
  if (_tmUptimeTimer) clearInterval(_tmUptimeTimer);
  _tmUptimeTimer = setInterval(function() {
    _tmUptimeSecs++;
    var el = document.getElementById('tm-stat-uptime');
    if (!el) return;
    var h = Math.floor(_tmUptimeSecs / 3600);
    var m = Math.floor((_tmUptimeSecs % 3600) / 60);
    var s = _tmUptimeSecs % 60;
    el.textContent = h + ':' + String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0');
  }, 1000);
}

function _tmUpdateStatusBar() {
  var isMalwareActive = _tmG4Mode && !(typeof g4State !== 'undefined' && g4State.processKilled);

  var cpuVal = (isMalwareActive ? _tmRand(28, 58) : _tmRand(4, 18)).toFixed(0);
  var memVal = (isMalwareActive ? _tmRand(58, 80) : _tmRand(40, 62)).toFixed(0);
  var diskVal = (isMalwareActive ? _tmRand(4, 16) : _tmRand(0, 3)).toFixed(0);
  var netVal  = (isMalwareActive ? _tmRand(1.2, 3.8) : _tmRand(0.0, 0.4)).toFixed(1);

  var cpuEl = document.getElementById('tm-cpu-status');
  var memEl = document.getElementById('tm-mem-status');
  var diskEl = document.getElementById('tm-disk-status');
  var netEl = document.getElementById('tm-net-status');

  if (cpuEl) cpuEl.innerHTML = 'CPU <strong>' + cpuVal + '%</strong>';
  if (memEl) memEl.innerHTML = 'Memory <strong>' + memVal + '%</strong>';
  if (diskEl) diskEl.innerHTML = 'Disk <strong>' + diskVal + '%</strong>';
  if (netEl) netEl.innerHTML = 'Network <strong>' + netVal + ' Mbps</strong>';
}

function _tmTickPerfHistory() {
  function push(arr, val) {
    arr.push(val);
    if (arr.length > 60) arr.shift();
  }
  var isMalwareActive = _tmG4Mode && !(typeof g4State !== 'undefined' && g4State.processKilled);

  push(_tmPerfHistory.cpu,  isMalwareActive ? _tmRand(28, 62) : _tmRand(5, 20));
  push(_tmPerfHistory.mem,  isMalwareActive ? _tmRand(58, 82) : _tmRand(42, 60));
  push(_tmPerfHistory.disk, isMalwareActive ? _tmRand(5, 22)  : _tmRand(0, 8));
  push(_tmPerfHistory.net,  isMalwareActive ? _tmRand(6, 42)  : _tmRand(0, 4));
}

/* ─── Performance Tab: Resource Selection & Stats ─────────── */
function tmPerfSelect(key, el) {
  _tmPerfActive = key;
  document.querySelectorAll('.tm-perf-sidebar-item').forEach(function(i) {
    i.classList.remove('active');
  });
  if (el) el.classList.add('active');

  var titles = {
    cpu:  'CPU',
    mem:  'Memory',
    disk: 'Disk 0 (C:)',
    net:  'Ethernet'
  };
  var subs = {
    cpu:  'Intel® Core™ i5-12400F · 6 Cores, 12 Logical processors',
    mem:  '16.0 GB DDR4 · 3200 MHz · 2 of 2 slots used',
    disk: 'Samsung 980 Pro NVMe SSD 512 GB',
    net:  'Realtek PCIe GbE Family Controller · 1.0 Gbps'
  };

  var t = document.getElementById('tm-perf-main-title');
  var s = document.getElementById('tm-perf-main-sub');
  if (t) t.textContent = titles[key] || key;
  if (s) s.textContent = subs[key]   || '';

  _tmDrawMainGraph();
  _tmUpdatePerfStats();
}

function _tmUpdatePerfStats() {
  var h   = _tmPerfHistory[_tmPerfActive] || [];
  var cur = h.length ? h[h.length - 1] : 0;
  var key = _tmPerfActive;

  var utilEl     = document.getElementById('tm-stat-util');
  var speedEl    = document.getElementById('tm-stat-speed');
  var highValEl  = document.getElementById('tm-perf-highlight-val');
  var highSubEl  = document.getElementById('tm-perf-highlight-sub');
  var pctEl      = document.getElementById('tm-perf-' + key + '-pct');

  if (utilEl) utilEl.textContent = cur.toFixed(0) + '%';

  // Extra dynamic hardware stats
  var extraLabels = [];
  var extraValues = [];

  if (key === 'cpu') {
    var ghz = (2.5 + cur * 0.012).toFixed(2);
    if (speedEl)   speedEl.textContent = ghz + ' GHz';
    if (pctEl)     pctEl.textContent = cur.toFixed(0) + '%';
    if (highValEl) highValEl.textContent = cur.toFixed(0) + '%';
    if (highSubEl) highSubEl.textContent = ghz + ' GHz';

    extraLabels = ['Base speed', 'Sockets', 'Cores', 'Logical processors', 'Virtualization', 'L3 Cache'];
    extraValues = ['2.50 GHz', '1', '6', '12', 'Enabled', '18.0 MB'];
  } else if (key === 'mem') {
    var usedGB = (cur / 100 * 16.0).toFixed(1);
    if (speedEl)   speedEl.textContent = usedGB + ' / 16.0 GB (' + cur.toFixed(0) + '%)';
    if (pctEl)     pctEl.textContent = cur.toFixed(0) + '%';
    if (highValEl) highValEl.textContent = usedGB + ' GB';
    if (highSubEl) highSubEl.textContent = cur.toFixed(0) + '% In use';

    extraLabels = ['Speed', 'Slots used', 'Form factor', 'Hardware reserved', 'Available', 'Committed'];
    extraValues = ['3200 MHz', '2 of 2', 'DIMM', '148 MB', (16.0 - parseFloat(usedGB)).toFixed(1) + ' GB', usedGB + '/18.2 GB'];
  } else if (key === 'disk') {
    var dRate = (cur * 0.45).toFixed(1);
    if (speedEl)   speedEl.textContent = dRate + ' MB/s Active';
    if (pctEl)     pctEl.textContent = cur.toFixed(0) + '%';
    if (highValEl) highValEl.textContent = cur.toFixed(0) + '%';
    if (highSubEl) highSubEl.textContent = dRate + ' MB/s';

    extraLabels = ['Active time', 'Avg response', 'Read speed', 'Write speed', 'Capacity', 'Type'];
    extraValues = [cur.toFixed(0) + '%', (0.2 + cur * 0.05).toFixed(1) + ' ms', (dRate * 0.7).toFixed(1) + ' MB/s', (dRate * 0.3).toFixed(1) + ' MB/s', '500 GB', 'NVMe SSD'];
  } else if (key === 'net') {
    var mbps = (cur * 0.35).toFixed(1);
    if (speedEl)   speedEl.textContent = mbps + ' Mbps Throughput';
    if (pctEl)     pctEl.textContent = mbps + ' Mbps';
    if (highValEl) highValEl.textContent = mbps + ' Mbps';
    if (highSubEl) highSubEl.textContent = 'Ethernet 1 Gbps';

    extraLabels = ['Send', 'Receive', 'IPv4 address', 'Connection type', 'Adapter', 'Link speed'];
    extraValues = [(mbps * 0.3).toFixed(1) + ' Mbps', (mbps * 0.7).toFixed(1) + ' Mbps', '192.168.1.142', 'Ethernet', 'Realtek GbE', '1000/1000 (Mbps)'];
  }

  for (var i = 1; i <= 6; i++) {
    var lEl = document.getElementById('tm-stat-extra-lbl-' + i);
    var vEl = document.getElementById('tm-stat-extra-val-' + i);
    if (lEl && extraLabels[i - 1]) lEl.textContent = extraLabels[i - 1];
    if (vEl && extraValues[i - 1]) vEl.textContent = extraValues[i - 1];
  }
}

/* ─── High-DPI Dynamic Canvas Graph Rendering ─────────────── */
function _tmEnsureCanvasResolution(canvas) {
  if (!canvas) return false;
  var rect = canvas.getBoundingClientRect();
  var dpr = window.devicePixelRatio || 1;
  var w = Math.round(rect.width * dpr);
  var h = Math.round(rect.height * dpr);
  if (w <= 0 || h <= 0) return false;
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
    return true;
  }
  return false;
}

function _tmDrawGraph(canvas, data, color, isMini) {
  if (!canvas) return;
  _tmEnsureCanvasResolution(canvas);
  var ctx = canvas.getContext('2d');
  var w = canvas.width;
  var h = canvas.height;
  if (w <= 0 || h <= 0) return;

  var dpr = window.devicePixelRatio || 1;
  ctx.clearRect(0, 0, w, h);

  // Background Fill
  ctx.fillStyle = isMini ? '#0b101c' : '#080d19';
  ctx.fillRect(0, 0, w, h);

  // Horizontal Grid Lines
  ctx.strokeStyle = isMini ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.06)';
  ctx.lineWidth = 1 * dpr;

  var divisions = isMini ? 2 : 4;
  for (var gi = 1; gi <= divisions; gi++) {
    var gy = Math.round(h * gi / (divisions + 1));
    ctx.beginPath();
    ctx.moveTo(0, gy);
    ctx.lineTo(w, gy);
    ctx.stroke();
  }

  // Vertical Time Grid Lines for Main Graph
  if (!isMini) {
    var vertDivisions = 6;
    for (var vi = 1; vi <= vertDivisions; vi++) {
      var vx = Math.round(w * vi / (vertDivisions + 1));
      ctx.beginPath();
      ctx.moveTo(vx, 0);
      ctx.lineTo(vx, h);
      ctx.stroke();
    }
  }

  if (!data || data.length < 2) return;

  var maxVal = 100;
  var step = w / 60;
  var startX = Math.max(0, w - (data.length - 1) * step);

  // Smooth Area Gradient Fill
  var grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, color + (isMini ? '38' : '50'));
  grad.addColorStop(1, color + '00');

  ctx.beginPath();
  data.forEach(function(v, i) {
    var clamped = Math.max(0, Math.min(maxVal, v));
    var x = startX + i * step;
    var y = h - (clamped / maxVal) * (h - 6 * dpr) - 3 * dpr;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.lineTo(startX + (data.length - 1) * step, h);
  ctx.lineTo(startX, h);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // Graph Line
  ctx.beginPath();
  data.forEach(function(v, i) {
    var clamped = Math.max(0, Math.min(maxVal, v));
    var x = startX + i * step;
    var y = h - (clamped / maxVal) * (h - 6 * dpr) - 3 * dpr;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = color;
  ctx.lineWidth = (isMini ? 1.5 : 2.0) * dpr;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.stroke();

  // Glowing Endpoint Dot on Main Graph
  if (!isMini && data.length > 0) {
    var lastVal = Math.max(0, Math.min(maxVal, data[data.length - 1]));
    var lx = startX + (data.length - 1) * step;
    var ly = h - (lastVal / maxVal) * (h - 6 * dpr) - 3 * dpr;

    ctx.beginPath();
    ctx.arc(lx, ly, 3.5 * dpr, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2 * dpr;
    ctx.stroke();
  }
}

function _tmDrawAllMiniGraphs() {
  ['cpu', 'mem', 'disk', 'net'].forEach(function(k) {
    _tmDrawGraph(document.getElementById('tm-mini-' + k), _tmPerfHistory[k], TM_GRAPH_COLORS[k], true);
  });
}

function _tmDrawMainGraph() {
  _tmDrawGraph(document.getElementById('tm-main-graph'), _tmPerfHistory[_tmPerfActive], TM_GRAPH_COLORS[_tmPerfActive], false);
}

/* ─── Fullscreen & Window Resize Observer ─────────────────── */
function _tmSetupResizeHandling() {
  var win = document.getElementById('win-taskmanager');
  if (!win) return;

  function handleResize() {
    if (_tmActiveTab === 'performance') {
      _tmDrawAllMiniGraphs();
      _tmDrawMainGraph();
    }
  }

  if (typeof window !== 'undefined' && window.ResizeObserver && !_tmResizeObserver) {
    _tmResizeObserver = new window.ResizeObserver(function() {
      handleResize();
    });
    _tmResizeObserver.observe(win);
    var mainPerf = document.getElementById('tm-perf-main');
    if (mainPerf) _tmResizeObserver.observe(mainPerf);
  }

  window.addEventListener('resize', handleResize);
}

/* ─── Chapter 3 Integration & Historical Seed ─────────────── */
function renderG4TaskManager() {
  _tmG4Mode = true;
  initTaskManager();
}
window.renderG4TaskManager = renderG4TaskManager;

(function() {
  for (var i = 0; i < 40; i++) {
    _tmPerfHistory.cpu.push(_tmRand(5, 18));
    _tmPerfHistory.mem.push(_tmRand(42, 58));
    _tmPerfHistory.disk.push(_tmRand(0, 8));
    _tmPerfHistory.net.push(_tmRand(0, 3));
  }
})();
