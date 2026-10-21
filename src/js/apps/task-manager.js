'use strict';

var TM_APPS = [
  { name: 'Zmail',        icon: '<img src="assets/icons/apps/mail.svg" class="tm-icon-img" alt="Zmail">',            cpu: function(){ return _tmRand(0.1, 1.2);  }, mem: function(){ return _tmRand(80, 210);  }, disk: '0 MB/s', net: '0.0 Mbps', pid: 5820, user: 'Ethan',   status: 'Running' },
  { name: 'Browser',      icon: '<img src="assets/icons/apps/browser.svg" class="tm-icon-img" alt="Browser">',       cpu: function(){ return _tmRand(0.5, 4.2);  }, mem: function(){ return _tmRand(180,420);  }, disk: '0 MB/s', net: '0.1 Mbps', pid: 3412, user: 'Ethan',   status: 'Running' },
  { name: 'File Explorer',icon: '<img src="assets/icons/apps/folder.svg" class="tm-icon-img" alt="File Explorer">',  cpu: function(){ return _tmRand(0.0, 0.8);  }, mem: function(){ return _tmRand(40,  90);  }, disk: '0 MB/s', net: '0.0 Mbps', pid: 2244, user: 'Ethan',   status: 'Running' },
  { name: 'Anti-Virus',   icon: '<img src="assets/icons/apps/windows_defender.svg" class="tm-icon-img" alt="AV">',   cpu: function(){ return _tmRand(0.2, 2.0);  }, mem: function(){ return _tmRand(100,250);  }, disk: '0 MB/s', net: '0.0 Mbps', pid: 1488, user: 'SYSTEM', status: 'Running' },
  { name: 'Task Manager', icon: '<img src="assets/icons/Chapter 2 new apps/Task Manager.svg" class="tm-icon-img" alt="TM">', cpu: function(){ return _tmRand(0.1, 0.6); }, mem: function(){ return _tmRand(20, 55); },  disk: '0 MB/s', net: '0.0 Mbps', pid: 7760, user: 'Ethan',   status: 'Running' },
  { name: 'Phone Link',   icon: '<img src="assets/icons/apps/Smartphone.svg" class="tm-icon-img" alt="Phone Link">', cpu: function(){ return _tmRand(0.0, 0.5);  }, mem: function(){ return _tmRand(30,  80);  }, disk: '0 MB/s', net: '0.0 Mbps', pid: 6104, user: 'Ethan',   status: 'Running' },
  { name: 'Steam',        icon: '<img src="assets/icons/Chapter 2 new apps/steam.svg" class="tm-icon-img" alt="Steam">',   cpu: function(){ return _tmRand(0.1, 1.8);  }, mem: function(){ return _tmRand(120,300);  }, disk: '0 MB/s', net: '0.2 Mbps', pid: 4480, user: 'Ethan',   status: 'Running' },
  { name: 'GTA 6',        icon: '<img src="assets/icons/Chapter 2 new apps/GTA6.svg" class="tm-icon-img" alt="GTA 6">',    cpu: function(){ return _tmRand(0.0, 0.4);  }, mem: function(){ return _tmRand(50, 140);  }, disk: '0 MB/s', net: '0.0 Mbps', pid: 8120, user: 'Ethan',   status: 'Running' }
];

var TM_BG = [
  { name: 'svchost.exe (LocalSystem)',    icon: '<img src="assets/icons/apps/settings.svg" class="tm-icon-img" alt="svc">', cpu: function(){ return _tmRand(0.0,1.4); }, mem: function(){ return _tmRand(12,60);  }, pid: 840,  user: 'SYSTEM',        status: 'Running' },
  { name: 'svchost.exe (NetworkService)', icon: '<img src="assets/icons/apps/settings.svg" class="tm-icon-img" alt="svc">', cpu: function(){ return _tmRand(0.0,0.8); }, mem: function(){ return _tmRand(8, 35);  }, pid: 1024, user: 'SYSTEM',        status: 'Running' },
  { name: 'lsass.exe',                   icon: '<img src="assets/icons/apps/settings.svg" class="tm-icon-img" alt="lsass">', cpu: function(){ return _tmRand(0.0,0.6); }, mem: function(){ return _tmRand(10,28);  }, pid: 752,  user: 'SYSTEM',        status: 'Running' },
  { name: 'dwm.exe',                     icon: '<img src="assets/icons/apps/settings.svg" class="tm-icon-img" alt="dwm">',  cpu: function(){ return _tmRand(0.1,2.0); }, mem: function(){ return _tmRand(30,120); }, pid: 1200, user: 'DWM-1',         status: 'Running' },
  { name: 'explorer.exe',               icon: '<img src="assets/icons/apps/folder.svg" class="tm-icon-img" alt="exp">',    cpu: function(){ return _tmRand(0.0,1.0); }, mem: function(){ return _tmRand(40,90);  }, pid: 3088, user: 'Ethan',          status: 'Running' },
  { name: 'WmiPrvSE.exe',               icon: '<img src="assets/icons/apps/settings.svg" class="tm-icon-img" alt="wmi">',  cpu: function(){ return _tmRand(0.0,0.4); }, mem: function(){ return _tmRand(6, 22);  }, pid: 2900, user: 'SYSTEM',        status: 'Running' },
  { name: 'RuntimeBroker.exe',          icon: '<img src="assets/icons/apps/settings.svg" class="tm-icon-img" alt="rb">',   cpu: function(){ return _tmRand(0.0,0.3); }, mem: function(){ return _tmRand(8, 30);  }, pid: 4320, user: 'Ethan',          status: 'Running' },
  { name: 'SearchIndexer.exe',          icon: '<img src="assets/icons/apps/search.svg" class="tm-icon-img" alt="idx">',    cpu: function(){ return _tmRand(0.0,3.5); }, mem: function(){ return _tmRand(20,80);  }, pid: 2560, user: 'SYSTEM',        status: 'Running' },
  { name: 'MsMpEng.exe',               icon: '<img src="assets/icons/apps/windows_defender.svg" class="tm-icon-img" alt="av">', cpu: function(){ return _tmRand(0.0,2.5); }, mem: function(){ return _tmRand(80,200); }, pid: 3600, user: 'SYSTEM',        status: 'Running' },
  { name: 'audiodg.exe',               icon: '<img src="assets/icons/apps/settings.svg" class="tm-icon-img" alt="audio">', cpu: function(){ return _tmRand(0.0,0.8); }, mem: function(){ return _tmRand(10,30);  }, pid: 2048, user: 'LOCAL SERVICE', status: 'Running' },
  { name: 'ctfmon.exe',                icon: '<img src="assets/icons/apps/settings.svg" class="tm-icon-img" alt="ctf">',   cpu: function(){ return _tmRand(0.0,0.2); }, mem: function(){ return _tmRand(4, 12);  }, pid: 1780, user: 'Ethan',          status: 'Running' },
  { name: 'spoolsv.exe',               icon: '<img src="assets/icons/apps/settings.svg" class="tm-icon-img" alt="spool">',  cpu: function(){ return _tmRand(0.0,0.1); }, mem: function(){ return _tmRand(4, 12);  }, pid: 2220, user: 'SYSTEM',        status: 'Running' }
];

var TM_MALWARE_PROC = {
  name: 'PremiumDesignTool.exe',
  icon: '<img src="assets/icons/apps/browser.svg" class="tm-icon-img" alt="mal" style="filter:hue-rotate(270deg) saturate(3)">',
  cpu:  function(){ return _tmRand(18, 45); },
  mem:  function(){ return _tmRand(280,520); },
  disk: '0.2 MB/s', net: '1.2 Mbps', pid: 4092,
  user: 'Ethan', status: 'Running', suspicious: true
};

var _tmIntervalId  = null;
var _tmPerfActive  = 'cpu';
var _tmUptimeSecs  = 0;
var _tmUptimeTimer = null;
var _tmPerfHistory = { cpu: [], mem: [], disk: [], net: [] };
var _tmActiveTab   = 'processes';
var _tmG4Mode      = false;
var TM_GRAPH_COLORS = { cpu: '#38bdf8', mem: '#a78bfa', disk: '#34d399', net: '#fb923c' };

function _tmRand(min, max) { return Math.random() * (max - min) + min; }

function initTaskManager() {
  _tmRenderProcesses();
  _tmRenderDetails();
  _tmStartLiveUpdate();
  _tmStartUptime();
}

function tmSwitchTab(tab) {
  _tmActiveTab = tab;
  ['processes', 'performance', 'details'].forEach(function(t) {
    var panel = document.getElementById('tm-panel-' + t);
    var tabEl = document.getElementById('tm-tab-' + t);
    if (!panel || !tabEl) return;
    if (t === tab) { panel.classList.remove('hidden'); tabEl.classList.add('active'); }
    else           { panel.classList.add('hidden');    tabEl.classList.remove('active'); }
  });
  if (tab === 'performance') {
    _tmTickPerfHistory();
    _tmDrawAllMiniGraphs();
    _tmDrawMainGraph();
    _tmUpdatePerfStats();
  }
}

function _tmRenderProcesses() {
  var appList = document.getElementById('tm-process-list');
  var bgList  = document.getElementById('tm-bg-list');
  if (!appList || !bgList) return;
  var apps = TM_APPS.slice();
  if (_tmG4Mode) apps.push(TM_MALWARE_PROC);
  appList.innerHTML = apps.map(_tmAppRow).join('');
  bgList.innerHTML  = TM_BG.map(_tmBgRow).join('');
  _tmUpdateStatusBar();
}

function _tmAppRow(p) {
  var cpu    = p.cpu().toFixed(1);
  var mem    = p.mem().toFixed(0);
  var cpuBar = Math.min((parseFloat(cpu) / 50) * 100, 100).toFixed(0);
  var memBar = Math.min((parseFloat(mem) / 600) * 100, 100).toFixed(0);
  var isSusp = !!p.suspicious;
  return '<div class="tm-process-row' + (isSusp ? ' suspicious-process' : '') + '" title="' + p.name + '">' +
    '<span class="tm-col-name"><span class="tm-proc-icon">' + p.icon + '</span>' +
    (isSusp ? '<span class="tm-warn-badge">&#9888;</span>' : '') + p.name + '</span>' +
    '<span class="tm-col-cpu"><span class="tm-bar-wrap"><span class="tm-bar' + (isSusp ? ' tm-bar-red' : '') +
    '" style="width:' + cpuBar + '%"></span></span>' + cpu + '%</span>' +
    '<span class="tm-col-mem"><span class="tm-bar-wrap"><span class="tm-bar tm-bar-blue" style="width:' + memBar +
    '%"></span></span>' + mem + ' MB</span>' +
    '<span class="tm-col-disk">' + (p.disk || '0 MB/s') + '</span>' +
    '<span class="tm-col-net">'  + (p.net  || '0 Mbps') + '</span>' +
    '<span class="tm-col-action">' +
    (isSusp ? '<button class="tm-end-btn" onclick="g4KillProcess(\'' + p.pid + '\')">End Task</button>' : '') +
    '</span></div>';
}

function _tmBgRow(p) {
  var cpu    = p.cpu().toFixed(1);
  var mem    = p.mem().toFixed(0);
  var cpuBar = Math.min((parseFloat(cpu) / 50) * 100, 100).toFixed(0);
  return '<div class="tm-process-row tm-process-row-sm" title="' + p.name + '">' +
    '<span class="tm-col-name"><span class="tm-proc-icon">' + p.icon + '</span>' + p.name + '</span>' +
    '<span class="tm-col-cpu"><span class="tm-bar-wrap"><span class="tm-bar" style="width:' + cpuBar + '%"></span></span>' + cpu + '%</span>' +
    '<span class="tm-col-mem">' + mem + ' MB</span>' +
    '<span class="tm-col-disk">0 MB/s</span><span class="tm-col-net">0 Mbps</span>' +
    '<span class="tm-col-action"></span></div>';
}

function _tmRenderDetails() {
  var list = document.getElementById('tm-details-list');
  if (!list) return;
  var all = TM_APPS.concat(TM_BG);
  if (_tmG4Mode) all.push(TM_MALWARE_PROC);
  all.sort(function(a,b){ return a.pid - b.pid; });
  list.innerHTML = all.map(function(p) {
    var cpu = p.cpu().toFixed(1);
    return '<div class="tm-process-row tm-detail-row' + (p.suspicious ? ' suspicious-process' : '') +
      '" style="grid-template-columns:2fr .7fr .7fr 1.5fr 1fr;">' +
      '<span class="tm-col-name"><span class="tm-proc-icon">' + p.icon + '</span>' + p.name + '</span>' +
      '<span>' + p.pid + '</span>' +
      '<span><span class="tm-status-dot"></span>' + p.status + '</span>' +
      '<span>' + p.user + '</span>' +
      '<span>' + cpu + '%</span></div>';
  }).join('');
}

function _tmStartLiveUpdate() {
  if (_tmIntervalId) clearInterval(_tmIntervalId);
  _tmIntervalId = setInterval(function() {
    _tmTickPerfHistory();
    if (_tmActiveTab === 'processes')   _tmRenderProcesses();
    if (_tmActiveTab === 'details')     _tmRenderDetails();
    if (_tmActiveTab === 'performance') { _tmDrawAllMiniGraphs(); _tmDrawMainGraph(); _tmUpdatePerfStats(); }
    _tmUpdateStatusBar();
  }, 1500);
}

function _tmStartUptime() {
  _tmUptimeSecs = Math.floor(Math.random() * 3600 * 4);
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
  var cpuEl = document.getElementById('tm-cpu-status');
  var memEl = document.getElementById('tm-mem-status');
  var cpuVal = (_tmG4Mode ? _tmRand(25,60) : _tmRand(4,18)).toFixed(0);
  var memVal = (_tmG4Mode ? _tmRand(55,82) : _tmRand(40,65)).toFixed(0);
  if (cpuEl) cpuEl.innerHTML = 'CPU <strong>' + cpuVal + '%</strong>';
  if (memEl) memEl.innerHTML = 'Memory <strong>' + memVal + '%</strong>';
}

function _tmTickPerfHistory() {
  function push(arr, val) { arr.push(val); if (arr.length > 60) arr.shift(); }
  push(_tmPerfHistory.cpu,  _tmG4Mode ? _tmRand(25,65) : _tmRand(4,20));
  push(_tmPerfHistory.mem,  _tmG4Mode ? _tmRand(58,82) : _tmRand(40,62));
  push(_tmPerfHistory.disk, _tmRand(0,15));
  push(_tmPerfHistory.net,  _tmG4Mode ? _tmRand(5,40)  : _tmRand(0,5));
}

function tmPerfSelect(key, el) {
  _tmPerfActive = key;
  document.querySelectorAll('.tm-perf-sidebar-item').forEach(function(i){ i.classList.remove('active'); });
  if (el) el.classList.add('active');
  var titles = { cpu:'CPU', mem:'Memory', disk:'Disk 0 (C:)', net:'Ethernet' };
  var subs = {
    cpu:  'Intel Core i5-12400F  6 Cores, 12 Logical processors',
    mem:  '16.0 GB DDR4  3200 MHz  2 of 2 slots used',
    disk: 'SSD Samsung 980 Pro 512 GB  NVMe',
    net:  'Realtek PCIe GBE Family Controller  1 Gbps'
  };
  var t = document.getElementById('tm-perf-main-title');
  var s = document.getElementById('tm-perf-main-sub');
  if (t) t.textContent = titles[key] || key;
  if (s) s.textContent = subs[key]   || '';
  _tmDrawMainGraph();
  _tmUpdatePerfStats();
}

function _tmUpdatePerfStats() {
  var h   = _tmPerfHistory[_tmPerfActive];
  var cur = h.length ? h[h.length - 1] : 0;
  var key = _tmPerfActive;
  var utilEl  = document.getElementById('tm-stat-util');
  var speedEl = document.getElementById('tm-stat-speed');
  if (utilEl) utilEl.textContent = cur.toFixed(0) + '%';
  var pctEl = document.getElementById('tm-perf-' + key + '-pct');
  if (key === 'cpu') {
    if (speedEl) speedEl.textContent = (2.5 + cur * 0.01).toFixed(2) + ' GHz';
    if (pctEl) pctEl.textContent = cur.toFixed(0) + '%';
  } else if (key === 'mem') {
    if (speedEl) speedEl.textContent = (cur / 100 * 16).toFixed(1) + ' / 16.0 GB';
    if (pctEl) pctEl.textContent = cur.toFixed(0) + '%';
  } else if (key === 'disk') {
    if (speedEl) speedEl.textContent = cur.toFixed(1) + ' MB/s';
    if (pctEl) pctEl.textContent = cur.toFixed(0) + '%';
  } else if (key === 'net') {
    if (speedEl) speedEl.textContent = cur.toFixed(1) + ' Mbps';
    if (pctEl) pctEl.textContent = cur.toFixed(0) + ' Mbps';
  }
}

function _tmDrawGraph(canvas, data, color) {
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var w = canvas.width, h = canvas.height;
  ctx.clearRect(0,0,w,h);
  ctx.fillStyle = '#0f172a'; ctx.fillRect(0,0,w,h);
  ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 1;
  for (var gi = 1; gi < 4; gi++) {
    ctx.beginPath(); ctx.moveTo(0, h*gi/4); ctx.lineTo(w, h*gi/4); ctx.stroke();
  }
  if (!data || data.length < 2) return;
  var grad = ctx.createLinearGradient(0,0,0,h);
  grad.addColorStop(0, color + '55');
  grad.addColorStop(1, color + '00');
  var step = w / 60, startX = w - data.length * step;
  ctx.beginPath();
  data.forEach(function(v,i){ var x=startX+i*step, y=h-(v/100)*h; if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y); });
  ctx.lineTo(startX+(data.length-1)*step, h); ctx.lineTo(startX, h); ctx.closePath();
  ctx.fillStyle = grad; ctx.fill();
  ctx.beginPath();
  data.forEach(function(v,i){ var x=startX+i*step, y=h-(v/100)*h; if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y); });
  ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.stroke();
}

function _tmDrawAllMiniGraphs() {
  ['cpu','mem','disk','net'].forEach(function(k){
    _tmDrawGraph(document.getElementById('tm-mini-'+k), _tmPerfHistory[k], TM_GRAPH_COLORS[k]);
  });
}

function _tmDrawMainGraph() {
  _tmDrawGraph(document.getElementById('tm-main-graph'), _tmPerfHistory[_tmPerfActive], TM_GRAPH_COLORS[_tmPerfActive]);
}

window.renderG4TaskManager = function() { _tmG4Mode = true; initTaskManager(); };

(function() {
  for (var i = 0; i < 30; i++) {
    _tmPerfHistory.cpu.push(_tmRand(4,18));
    _tmPerfHistory.mem.push(_tmRand(40,62));
    _tmPerfHistory.disk.push(_tmRand(0,8));
    _tmPerfHistory.net.push(_tmRand(0,3));
  }
})();
