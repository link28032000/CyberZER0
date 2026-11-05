'use strict';

// ═══════════════════════════════════════════════════════════
// REAL WINDOWS FILE EXPLORER & MULTI-VIEWER SYSTEM
// ═══════════════════════════════════════════════════════════

let currentExplorerFolder = 'downloads';
let explorerViewMode = 'details'; // 'details' | 'grid'
let previewPaneVisible = false;
let explorerHistory = ['downloads'];
let explorerHistoryIdx = 0;
let explorerSortCol = 'name';
let explorerSortAsc = true;

// Additional folder virtual files for non-Downloads folders
const EXPLORER_ADDITIONAL_FILES = {
  documents: [],
  pictures: [
    {
      id: 'pic_retreat',
      name: 'annual_team_retreat.jpg',
      fakeExt: 'jpg',
      realExt: 'jpg',
      type: 'JPEG Image',
      size: '1.2 MB',
      date: '9/4/2026 02:22 PM',
      icon: '🖼️',
      isMalware: false,
      threatName: 'Clean File',
      threatCategory: 'SAFE',
      hash: '098f6bcd4621d373cade4e832627b4f6cf4c45a76e9c60e34c98f98c4f74d081',
      analysis: '✅ Standard digital photograph. Valid JFIF/EXIF header metadata, zero steganographic payloads.',
      quarantined: false,
      scanned: true,
      mediaSrc: 'assets/background/Coffe shop.png'
    }
  ],
  videos: [
    {
      id: 'vid_awareness',
      name: 'cyber_awareness_clip.mp4',
      fakeExt: 'mp4',
      realExt: 'mp4',
      type: 'MP4 Video File (.mp4)',
      size: '17.3 MB',
      date: '9/6/2026 10:20 AM',
      icon: '🎬',
      isMalware: false,
      threatName: 'Clean File',
      threatCategory: 'SAFE',
      hash: '7c91a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f99aa',
      analysis: '✅ Standard H.264 / AAC multimedia file. Verified digital container structure with no malicious buffer overflow triggers.',
      quarantined: false,
      scanned: false,
      mediaSrc: 'assets/video/video3.mp4'
    }
  ],
  desktop: [
    {
      id: 'desk_app_gmail',
      name: 'Zmail',
      fakeExt: 'lnk',
      realExt: 'lnk',
      type: 'Application Shortcut',
      size: '2 KB',
      date: '9/6/2026 08:00 AM',
      icon: '<img src="assets/icons/apps/mail.svg" alt="Zmail" />',
      appId: 'gmail',
      isMalware: false,
      threatName: 'Application',
      threatCategory: 'SAFE',
      hash: 'EMAIL-APP-SHORTCUT-CYBERZERO',
      analysis: 'System shortcut for Zmail (Phishing Investigation Suite).',
      quarantined: false,
      scanned: true
    },
    {
      id: 'desk_app_browser',
      name: 'Browser',
      fakeExt: 'lnk',
      realExt: 'lnk',
      type: 'Application Shortcut',
      size: '2 KB',
      date: '9/6/2026 08:00 AM',
      icon: '<img src="assets/icons/apps/browser.svg" alt="Browser" />',
      appId: 'browser',
      isMalware: false,
      threatName: 'Application',
      threatCategory: 'SAFE',
      hash: 'BROWSER-APP-SHORTCUT-CYBERZERO',
      analysis: 'System shortcut for Cyber-Net Web Browser.',
      quarantined: false,
      scanned: true
    },
    {
      id: 'desk_app_notes',
      name: 'Sticky Notes',
      fakeExt: 'lnk',
      realExt: 'lnk',
      type: 'Application Shortcut',
      size: '1 KB',
      date: '9/6/2026 08:00 AM',
      icon: '<img src="assets/icons/apps/note.svg" alt="Sticky Notes" />',
      appId: 'notes',
      isMalware: false,
      threatName: 'Application',
      threatCategory: 'SAFE',
      hash: 'NOTES-APP-SHORTCUT-CYBERZERO',
      analysis: 'System shortcut for Sticky Notes application.',
      quarantined: false,
      scanned: true
    },
    {
      id: 'desk_app_folder',
      name: 'File Explorer',
      fakeExt: 'lnk',
      realExt: 'lnk',
      type: 'Application Shortcut',
      size: '2 KB',
      date: '9/6/2026 08:00 AM',
      icon: '<img src="assets/icons/apps/folder.svg" alt="File Explorer" />',
      appId: 'folder',
      isMalware: false,
      threatName: 'Application',
      threatCategory: 'SAFE',
      hash: 'EXPLORER-APP-SHORTCUT-CYBERZERO',
      analysis: 'System shortcut for Windows File Explorer.',
      quarantined: false,
      scanned: true
    },
    {
      id: 'desk_app_antivirus',
      name: 'ShieldAV Anti-Virus',
      fakeExt: 'lnk',
      realExt: 'lnk',
      type: 'Application Shortcut',
      size: '3 KB',
      date: '9/6/2026 08:00 AM',
      icon: '<img src="assets/icons/apps/windows_defender.svg" alt="ShieldAV Anti-Virus" />',
      appId: 'antivirus',
      isMalware: false,
      threatName: 'Application',
      threatCategory: 'SAFE',
      hash: 'SHIELDAV-APP-SHORTCUT-CYBERZERO',
      analysis: 'System shortcut for ShieldAV Endpoint Protection.',
      quarantined: false,
      scanned: true
    },
    {
      id: 'desk_app_comms',
      name: 'Phone Link',
      fakeExt: 'lnk',
      realExt: 'lnk',
      type: 'Application Shortcut',
      size: '2 KB',
      date: '9/6/2026 08:00 AM',
      icon: '<img src="assets/icons/apps/Smartphone.svg" alt="Phone Link" />',
      appId: 'comms',
      isMalware: false,
      threatName: 'Application',
      threatCategory: 'SAFE',
      hash: 'PHONELINK-APP-SHORTCUT-CYBERZERO',
      analysis: 'System shortcut for Phone Link / CyberComms application.',
      quarantined: false,
      scanned: true
    },
    {
      id: 'desk_app_recycle',
      name: 'Recycle Bin',
      fakeExt: 'lnk',
      realExt: 'lnk',
      type: 'System Folder',
      size: '0 KB',
      date: '9/6/2026 08:00 AM',
      icon: '<img src="assets/icons/folder icons/delete.svg" alt="Recycle Bin" />',
      isMalware: false,
      threatName: 'System Folder',
      threatCategory: 'SAFE',
      hash: 'RECYCLE-BIN-SYSTEM-SHORTCUT',
      analysis: 'Windows Recycle Bin for temporary deleted file storage.',
      quarantined: false,
      scanned: true
    }
  ],
  music: [
    {
      id: 'mus_theme',
      name: 'cyberzero_main_theme.mp3',
      fakeExt: 'mp3',
      realExt: 'mp3',
      type: 'MP3 Audio File (.mp3)',
      size: '4.6 MB',
      date: '9/6/2026 11:20 AM',
      icon: '🎵',
      isMalware: false,
      threatName: 'Clean File',
      threatCategory: 'SAFE',
      hash: 'c4a89f012de940404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f91a0',
      analysis: '✅ Verified clean MP3 audio stream (320 kbps). Clean acoustic ID3 tags, no malicious payload.',
      quarantined: false,
      scanned: true,
      mediaSrc: 'assets/sounds/Hi - Wii.mp3',
      artist: 'CyberZero OST • 320 kbps'
    }
  ],
  usb: [],
  network: [],
  downloads: [
    {
      id: 'dl_games_folder',
      name: 'Games',
      fakeExt: 'dir',
      realExt: 'dir',
      subFolderKey: 'games',
      type: 'File Folder',
      size: '0 KB',
      date: '9/1/2026 08:00 AM',
      icon: '<img src="assets/icons/Chapter 2 new apps/games_folder.svg" alt="Games" />',
      isMalware: false,
      threatName: 'Safe Folder',
      threatCategory: 'SAFE',
      hash: 'DOWNLOADS-GAMES-SUBFOLDER',
      analysis: '✅ Local Games folder. Contains Ethan\'s installed game shortcuts.',
      quarantined: false,
      scanned: true
    }
  ],
  games: [
    // ── Game Shortcuts ─────────────────────────────────────────────────────────
    {
      id: 'game_gta6',
      name: 'GTA VI',
      fakeExt: 'lnk',
      realExt: 'lnk',
      type: 'Shortcut (.lnk)',
      size: '1 KB',
      date: '8/15/2026 12:00 PM',
      icon: '<img src="assets/icons/Chapter 2 new apps/GTA6.svg" alt="GTA 6" style="width:32px;height:32px;" />',
      isMalware: false,
      threatName: 'Safe',
      threatCategory: 'SAFE',
      hash: 'GAMES-GTA6-SHORTCUT-ETHAN',
      analysis: '📁 Desktop shortcut to GTA VI game files.',
      quarantined: false,
      scanned: true,
      isSimulation: false
    },
    // ── Chapter 2 Malware Simulations ──────────────────────────────────────────
    // Safe, fictional educational demos — no real files are harmed or infected.
    {
      id: 'sim_virus',
      name: 'VirusSim_FileInfector.exe',
      fakeExt: 'exe',
      realExt: 'exe',
      type: 'Application (.exe)',
      size: '1.2 MB',
      date: '10/29/2026 08:00 AM',
      icon: '🦠',
      isMalware: false,
      threatName: '[SIM] Virus.Win32.FileInfector',
      threatCategory: 'Safe Simulation',
      hash: 'SIM-VIRUS-CYBERZERO-CH2-001',
      analysis: 'Safe, controlled demonstration of a file-infecting virus. Demonstrates how a virus attaches to executable files and spreads when those files are opened. No real files are modified.',
      quarantined: false,
      scanned: false,
      isSimulation: true,
      simType: 'virus'
    },
    {
      id: 'sim_worm',
      name: 'WormSim_NetworkSpreader.exe',
      fakeExt: 'exe',
      realExt: 'exe',
      type: 'Application (.exe)',
      size: '980 KB',
      date: '10/29/2026 08:00 AM',
      icon: '🐛',
      isMalware: false,
      threatName: '[SIM] Worm.Win32.NetworkSpreader',
      threatCategory: 'Safe Simulation',
      hash: 'SIM-WORM-CYBERZERO-CH2-002',
      analysis: 'Safe, controlled demonstration of a network-spreading worm. Demonstrates how a worm propagates across a network without any user interaction. No real network traffic is generated.',
      quarantined: false,
      scanned: false,
      isSimulation: true,
      simType: 'worm'
    },
    {
      id: 'sim_trojan',
      name: 'TrojanSim_HiddenPayload.exe',
      fakeExt: 'exe',
      realExt: 'exe',
      type: 'Application (.exe)',
      size: '1.5 MB',
      date: '10/29/2026 08:00 AM',
      icon: '🐴',
      isMalware: false,
      threatName: '[SIM] Trojan.Win32.HiddenPayload',
      threatCategory: 'Safe Simulation',
      hash: 'SIM-TROJAN-CYBERZERO-CH2-003',
      analysis: 'Safe, controlled demonstration of a Trojan horse. Demonstrates how a Trojan disguises itself as legitimate software while carrying a hidden payload. No real system changes are made.',
      quarantined: false,
      scanned: false,
      isSimulation: true,
      simType: 'trojan'
    }
  ],               // Ethan's Games folder — 3 malware simulations
  thispc: [
    {
      id: 'pc_perflogs',
      name: 'PerfLogs',
      fakeExt: 'dir',
      realExt: 'dir',
      subFolderKey: 'dir_perflogs',
      type: 'File Folder',
      size: '0 KB',
      date: '9/1/2026 08:00 AM',
      icon: '<img src="assets/icons/apps/folder.svg" alt="Folder" />',
      isMalware: false,
      threatName: 'System Folder',
      threatCategory: 'SAFE',
      hash: 'C-PERFLOGS-DIR',
      analysis: '✅ Windows Performance Logs directory.',
      quarantined: false,
      scanned: true
    },
    {
      id: 'pc_prog',
      name: 'Program Files',
      fakeExt: 'dir',
      realExt: 'dir',
      subFolderKey: 'dir_progfiles',
      type: 'File Folder',
      size: '24.5 GB',
      date: '9/1/2026 08:00 AM',
      icon: '<img src="assets/icons/apps/folder.svg" alt="Folder" />',
      isMalware: false,
      threatName: 'System Folder',
      threatCategory: 'SAFE',
      hash: 'C-PROGRAM-FILES-DIR',
      analysis: '✅ Core Windows 64-bit application binaries and runtime frameworks.',
      quarantined: false,
      scanned: true
    },
    {
      id: 'pc_prog86',
      name: 'Program Files (x86)',
      fakeExt: 'dir',
      realExt: 'dir',
      subFolderKey: 'dir_progfiles86',
      type: 'File Folder',
      size: '12.1 GB',
      date: '9/1/2026 08:00 AM',
      icon: '<img src="assets/icons/apps/folder.svg" alt="Folder" />',
      isMalware: false,
      threatName: 'System Folder',
      threatCategory: 'SAFE',
      hash: 'C-PROGRAM-FILES-X86-DIR',
      analysis: '✅ 32-bit legacy application directory.',
      quarantined: false,
      scanned: true
    },
    {
      id: 'pc_users',
      name: 'Users',
      fakeExt: 'dir',
      realExt: 'dir',
      subFolderKey: 'dir_users',
      type: 'File Folder',
      size: '45.8 GB',
      date: '9/1/2026 08:00 AM',
      icon: '<img src="assets/icons/apps/folder.svg" alt="Folder" />',
      isMalware: false,
      threatName: 'System Folder',
      threatCategory: 'SAFE',
      hash: 'C-USERS-PROFILES-DIR',
      analysis: '✅ User profiles directory (C:\\Users).',
      quarantined: false,
      scanned: true
    },
    {
      id: 'pc_win',
      name: 'Windows',
      fakeExt: 'dir',
      realExt: 'dir',
      subFolderKey: 'dir_windows',
      type: 'System Folder',
      size: '38.2 GB',
      date: '9/1/2026 08:00 AM',
      icon: '<img src="assets/icons/apps/folder.svg" alt="Folder" />',
      isMalware: false,
      threatName: 'System Folder',
      threatCategory: 'SAFE',
      hash: 'C-WINDOWS-SYSTEM-ROOT',
      analysis: '✅ Windows 11 Operating System files, system drivers, and kernel assemblies.',
      quarantined: false,
      scanned: true
    }
  ],

  // ── Windows C Sub-folders ──────────────────────────────────
  dir_perflogs: [],

  dir_progfiles: [
    { id: 'pf_wdef', name: 'Windows Defender', fakeExt: 'dir', realExt: 'dir', subFolderKey: null, type: 'File Folder', size: '210 MB', date: '9/1/2026 08:00 AM', icon: '<img src="assets/icons/apps/folder.svg" alt="Folder" />', isMalware: false, threatName: 'System Folder', threatCategory: 'SAFE', hash: 'PF-WDEF', analysis: '✅ Windows Defender antivirus binaries.', quarantined: false, scanned: true },
    { id: 'pf_edge', name: 'Microsoft Edge', fakeExt: 'dir', realExt: 'dir', subFolderKey: null, type: 'File Folder', size: '890 MB', date: '9/1/2026 08:00 AM', icon: '<img src="assets/icons/apps/folder.svg" alt="Folder" />', isMalware: false, threatName: 'System Folder', threatCategory: 'SAFE', hash: 'PF-EDGE', analysis: '✅ Microsoft Edge browser installation.', quarantined: false, scanned: true },
    { id: 'pf_office', name: 'Microsoft Office', fakeExt: 'dir', realExt: 'dir', subFolderKey: null, type: 'File Folder', size: '4.2 GB', date: '9/1/2026 08:00 AM', icon: '<img src="assets/icons/apps/folder.svg" alt="Folder" />', isMalware: false, threatName: 'System Folder', threatCategory: 'SAFE', hash: 'PF-OFFICE', analysis: '✅ Microsoft Office 365 suite (Word, Excel, Outlook).', quarantined: false, scanned: true },
    { id: 'pf_wt', name: 'WindowsApps', fakeExt: 'dir', realExt: 'dir', subFolderKey: null, type: 'File Folder', size: '1.8 GB', date: '9/1/2026 08:00 AM', icon: '<img src="assets/icons/apps/folder.svg" alt="Folder" />', isMalware: false, threatName: 'System Folder', threatCategory: 'SAFE', hash: 'PF-WAPPS', analysis: '✅ Microsoft Store and UWP applications.', quarantined: false, scanned: true }
  ],

  dir_progfiles86: [
    { id: 'pf86_vc', name: 'Microsoft Visual C++', fakeExt: 'dir', realExt: 'dir', subFolderKey: null, type: 'File Folder', size: '340 MB', date: '9/1/2026 08:00 AM', icon: '<img src="assets/icons/apps/folder.svg" alt="Folder" />', isMalware: false, threatName: 'System Folder', threatCategory: 'SAFE', hash: 'PF86-VC', analysis: '✅ Microsoft Visual C++ Redistributable (x86).', quarantined: false, scanned: true },
    { id: 'pf86_java', name: 'Java', fakeExt: 'dir', realExt: 'dir', subFolderKey: null, type: 'File Folder', size: '480 MB', date: '9/1/2026 08:00 AM', icon: '<img src="assets/icons/apps/folder.svg" alt="Folder" />', isMalware: false, threatName: 'System Folder', threatCategory: 'SAFE', hash: 'PF86-JAVA', analysis: '✅ Java Runtime Environment (JRE 8 x86).', quarantined: false, scanned: true },
    { id: 'pf86_inet', name: 'Internet Explorer', fakeExt: 'dir', realExt: 'dir', subFolderKey: null, type: 'File Folder', size: '92 MB', date: '9/1/2026 08:00 AM', icon: '<img src="assets/icons/apps/folder.svg" alt="Folder" />', isMalware: false, threatName: 'System Folder', threatCategory: 'SAFE', hash: 'PF86-IE', analysis: '✅ Legacy IE compatibility shim (disabled on Windows 11).', quarantined: false, scanned: true }
  ],

  dir_users: [
    { id: 'usr_public', name: 'Public', fakeExt: 'dir', realExt: 'dir', subFolderKey: null, type: 'File Folder', size: '512 MB', date: '9/1/2026 08:00 AM', icon: '<img src="assets/icons/apps/folder.svg" alt="Folder" />', isMalware: false, threatName: 'User Profile', threatCategory: 'SAFE', hash: 'USERS-PUBLIC', analysis: '✅ Shared public user folder accessible to all local accounts.', quarantined: false, scanned: true },
    { id: 'usr_default', name: 'Default', fakeExt: 'dir', realExt: 'dir', subFolderKey: null, type: 'File Folder', size: '28 MB', date: '9/1/2026 08:00 AM', icon: '<img src="assets/icons/apps/folder.svg" alt="Folder" />', isMalware: false, threatName: 'User Profile', threatCategory: 'SAFE', hash: 'USERS-DEFAULT', analysis: '✅ Default user profile template used for new account creation.', quarantined: false, scanned: true }
  ],

  dir_windows: [
    { id: 'win_sys32', name: 'System32', fakeExt: 'dir', realExt: 'dir', subFolderKey: null, type: 'File Folder', size: '18.4 GB', date: '9/1/2026 08:00 AM', icon: '<img src="assets/icons/apps/folder.svg" alt="Folder" />', isMalware: false, threatName: 'System Folder', threatCategory: 'SAFE', hash: 'WIN-SYS32', analysis: '✅ Core Windows 64-bit system DLLs, drivers and executables.', quarantined: false, scanned: true },
    { id: 'win_syswow', name: 'SysWOW64', fakeExt: 'dir', realExt: 'dir', subFolderKey: null, type: 'File Folder', size: '6.1 GB', date: '9/1/2026 08:00 AM', icon: '<img src="assets/icons/apps/folder.svg" alt="Folder" />', isMalware: false, threatName: 'System Folder', threatCategory: 'SAFE', hash: 'WIN-SYSWOW64', analysis: '✅ 32-bit compatibility system libraries (WoW64 subsystem).', quarantined: false, scanned: true },
    { id: 'win_temp', name: 'Temp', fakeExt: 'dir', realExt: 'dir', subFolderKey: null, type: 'File Folder', size: '1.2 GB', date: '9/6/2026 08:00 AM', icon: '<img src="assets/icons/apps/folder.svg" alt="Folder" />', isMalware: false, threatName: 'System Folder', threatCategory: 'SAFE', hash: 'WIN-TEMP', analysis: '✅ Windows temporary files directory. Safe to clear periodically.', quarantined: false, scanned: true },
    { id: 'win_fonts', name: 'Fonts', fakeExt: 'dir', realExt: 'dir', subFolderKey: null, type: 'File Folder', size: '340 MB', date: '9/1/2026 08:00 AM', icon: '<img src="assets/icons/apps/folder.svg" alt="Folder" />', isMalware: false, threatName: 'System Folder', threatCategory: 'SAFE', hash: 'WIN-FONTS', analysis: '✅ Installed system font files (TrueType and OpenType).', quarantined: false, scanned: true },
    { id: 'win_logs', name: 'Logs', fakeExt: 'dir', realExt: 'dir', subFolderKey: null, type: 'File Folder', size: '880 MB', date: '9/6/2026 08:00 AM', icon: '<img src="assets/icons/apps/folder.svg" alt="Folder" />', isMalware: false, threatName: 'System Folder', threatCategory: 'SAFE', hash: 'WIN-LOGS', analysis: '✅ Windows event and setup logs used for diagnostics.', quarantined: false, scanned: true }
  ]
};
window.EXPLORER_ADDITIONAL_FILES = EXPLORER_ADDITIONAL_FILES;

window.ch1DownloadsList = [];

// ═══════════════════════════════════════════════════════════
// PRE-TEST RESULT DOCUMENT PERSISTENCE & FILE INJECTION
// ═══════════════════════════════════════════════════════════

const PRETEST_DOC_STORAGE_KEY = 'cyberzero_pretest_result_file';

function formatPretestDate(isoStr) {
  try {
    const d = isoStr ? new Date(isoStr) : new Date();
    const datePart = d.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
    const timePart = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    return `${datePart} ${timePart}`;
  } catch (e) {
    return '9/6/2026 10:15 AM';
  }
}

function getPlayerDisplayName() {
  try {
    if (typeof firebase !== 'undefined' && firebase.auth && firebase.auth().currentUser) {
      const u = firebase.auth().currentUser;
      if (u.displayName) return u.displayName;
      if (u.email) return u.email.split('@')[0];
    }
  } catch (e) {}
  if (typeof gameState !== 'undefined' && gameState.playerName) return gameState.playerName;
  const startUserName = document.getElementById('start-user-name');
  if (startUserName && startUserName.textContent && startUserName.textContent.trim()) {
    return startUserName.textContent.trim();
  }
  return 'Alex';
}

function generatePretestResultDocument(result) {
  if (!result) return null;

  const playerName = getPlayerDisplayName();
  const completedAt = result.completedAt || new Date().toISOString();
  const formattedDate = formatPretestDate(completedAt);

  const score = typeof result.score === 'number' ? result.score : 0;
  const total = typeof result.total === 'number' ? result.total : 20;
  const correct = score;
  const incorrect = Math.max(0, total - score);
  const percent = typeof result.percent === 'number' ? result.percent : Math.round((score / (total || 1)) * 100);
  const tier = result.tier || (typeof RyanPretest !== 'undefined' && RyanPretest.tierOf ? RyanPretest.tierOf(result) : 'great');
  const rank = result.rank || (tier === 'perfect' ? 'Cyber Guardian' : tier === 'great' ? 'Sharp Defender' : tier === 'ok' ? 'Rising Analyst' : 'Fresh Recruit');

  return {
    id: 'doc_pretest_result',
    name: 'pretest_result_report.docx',
    chapter: 1,
    fakeExt: 'docx',
    realExt: 'docx',
    type: 'Microsoft Word Document',
    size: '34 KB',
    date: formattedDate,
    icon: '📄',
    isMalware: false,
    threatName: 'Clean File',
    threatCategory: 'SAFE',
    hash: 'PRETEST-REPORT-CYBERZERO-' + Math.abs((completedAt + score).split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a; }, 0)).toString(16),
    analysis: '✅ Official CyberZerØ Cybersecurity Pre-Test Baseline Assessment Report. Verified authentic.',
    quarantined: false,
    scanned: true,
    reportData: {
      playerName: playerName,
      completedAt: completedAt,
      formattedDate: formattedDate,
      score: score,
      total: total,
      correct: correct,
      incorrect: incorrect,
      percent: percent,
      tier: tier,
      rank: rank,
      answers: Array.isArray(result.answers) ? result.answers : []
    }
  };
}

function _findPretestResultData() {
  // 1. Direct saved document in localStorage
  try {
    const rawDoc = localStorage.getItem(PRETEST_DOC_STORAGE_KEY);
    if (rawDoc) {
      const parsed = JSON.parse(rawDoc);
      if (parsed && parsed.reportData && typeof parsed.reportData.score === 'number') {
        return parsed;
      }
    }
  } catch (e) {}

  // 2. In-memory gameState.preTestResult
  try {
    if (typeof gameState !== 'undefined' && gameState.preTestResult && typeof gameState.preTestResult.score === 'number') {
      return generatePretestResultDocument(gameState.preTestResult);
    }
  } catch (e) {}

  // 3. RyanPretest.getResult()
  try {
    if (typeof RyanPretest !== 'undefined' && RyanPretest.getResult) {
      const res = RyanPretest.getResult();
      if (res && typeof res.score === 'number') {
        return generatePretestResultDocument(res);
      }
    }
  } catch (e) {}

  // 4. Scan localStorage for any cyberzero_pretest_ keys (guest, uid, alex, etc.)
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('cyberzero_pretest_') && k !== 'cyberzero_pretest_wip' && k !== PRETEST_DOC_STORAGE_KEY) {
        const val = localStorage.getItem(k);
        if (val) {
          try {
            const parsed = JSON.parse(val);
            if (parsed && typeof parsed.score === 'number') {
              return generatePretestResultDocument(parsed);
            }
          } catch (_) {}
        }
      }
    }
  } catch (e) {}

  // 5. Scan session state in localStorage
  try {
    const rawSess = localStorage.getItem('cyberzero_session_state') || localStorage.getItem('cyberzero_session_save');
    if (rawSess) {
      const sess = JSON.parse(rawSess);
      const gs = (sess && sess.gameState) ? sess.gameState : sess;
      if (gs && gs.preTestResult && typeof gs.preTestResult.score === 'number') {
        return generatePretestResultDocument(gs.preTestResult);
      }
      if (gs && (gs.preTestCompleted || typeof gs.preTestScore === 'number')) {
        return generatePretestResultDocument({
          score: typeof gs.preTestScore === 'number' ? gs.preTestScore : 16,
          total: gs.preTestTotal || 20,
          completedAt: sess.savedAt || new Date().toISOString()
        });
      }
    }
  } catch (e) {}

  // 6. Direct gameState flags
  try {
    if (typeof gameState !== 'undefined' && (gameState.preTestCompleted || typeof gameState.preTestScore === 'number')) {
      return generatePretestResultDocument({
        score: typeof gameState.preTestScore === 'number' ? gameState.preTestScore : (gameState.score || 16),
        total: gameState.preTestTotal || 20,
        completedAt: new Date().toISOString()
      });
    }
  } catch (e) {}

  return null;
}

function saveAndInjectPretestDocument(result) {
  if (!result) return;
  const docFile = generatePretestResultDocument(result);
  if (!docFile) return;

  // 1. Save persistently to localStorage
  try {
    localStorage.setItem(PRETEST_DOC_STORAGE_KEY, JSON.stringify(docFile));
  } catch (e) {}

  // 2. Ensure EXPLORER_ADDITIONAL_FILES.documents has this file (prevent duplicates!)
  if (typeof EXPLORER_ADDITIONAL_FILES !== 'undefined') {
    if (!Array.isArray(EXPLORER_ADDITIONAL_FILES.documents)) {
      EXPLORER_ADDITIONAL_FILES.documents = [];
    }
    const docs = EXPLORER_ADDITIONAL_FILES.documents;
    const existingIdx = docs.findIndex(f => f.id === 'doc_pretest_result');
    if (existingIdx !== -1) {
      docs[existingIdx] = docFile;
    } else {
      docs.push(docFile);
    }

    // Refresh active file explorer view if currently open on Documents
    if (typeof currentExplorerFolder !== 'undefined' && currentExplorerFolder === 'documents' && typeof renderFolderFiles === 'function') {
      renderFolderFiles();
    }
  }

  // Update sidebar Documents badge if visible
  const docBadge = document.getElementById('sidebar-documents-badge');
  const isCh2 = (window._currentChapterCategory === 'malware' ||
                 (typeof activeCategoryStory !== 'undefined' && activeCategoryStory === 'malware') ||
                 (typeof gameState !== 'undefined' && gameState.phase === 'malware'));
  const allDocs = (typeof EXPLORER_ADDITIONAL_FILES !== 'undefined' && Array.isArray(EXPLORER_ADDITIONAL_FILES.documents)) ? EXPLORER_ADDITIONAL_FILES.documents : [];
  const visibleDocs = isCh2
    ? allDocs.filter(f => f.id !== 'doc_pretest_result' && f.id !== 'doc_posttest_result' && f.chapter !== 1)
    : allDocs;
  const docCount = visibleDocs.length;
  if (docBadge) {
    docBadge.textContent = docCount;
    docBadge.style.display = docCount > 0 ? '' : 'none';
  }

  if (typeof showToast === 'function') {
    showToast('📄 Pre-Test Report saved to File Explorer → Documents', 'success');
  }

  if (typeof window.saveSessionLocally === 'function') {
    window.saveSessionLocally();
  }
}

function initPretestResultDocument() {
  try {
    const docFile = _findPretestResultData();
    if (docFile) {
      try {
        localStorage.setItem(PRETEST_DOC_STORAGE_KEY, JSON.stringify(docFile));
      } catch (e) {}

      if (typeof EXPLORER_ADDITIONAL_FILES !== 'undefined') {
        if (!Array.isArray(EXPLORER_ADDITIONAL_FILES.documents)) {
          EXPLORER_ADDITIONAL_FILES.documents = [];
        }
        const docs = EXPLORER_ADDITIONAL_FILES.documents;
        const existingIdx = docs.findIndex(f => f.id === 'doc_pretest_result');
        if (existingIdx !== -1) {
          docs[existingIdx] = docFile;
        } else {
          docs.push(docFile);
        }
      }
    }
  } catch (e) {}
}

function renderPretestReportHtml(file) {
  const data = (file && file.reportData) ? file.reportData : (() => {
    try {
      const raw = localStorage.getItem(PRETEST_DOC_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      return (parsed && parsed.reportData) ? parsed.reportData : null;
    } catch (e) { return null; }
  })() || {};

  const _esc = (s) => (typeof escapeHtml === 'function' ? escapeHtml(s) : String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'));

  const playerName = data.playerName || getPlayerDisplayName();
  const completedDate = data.formattedDate || formatPretestDate(data.completedAt);
  const score = typeof data.score === 'number' ? data.score : 0;
  const total = typeof data.total === 'number' ? data.total : 20;
  const correct = typeof data.correct === 'number' ? data.correct : score;
  const incorrect = typeof data.incorrect === 'number' ? data.incorrect : Math.max(0, total - correct);
  const percent = typeof data.percent === 'number' ? data.percent : Math.round((correct / (total || 1)) * 100);
  const tier = data.tier || 'great';
  const rank = data.rank || 'Sharp Defender';

  const mentorRemarks = (tier === 'perfect')
    ? "Twenty out of twenty! You really know your way around online safety. I'm impressed."
    : (tier === 'great')
    ? "That's a really strong start. You already think like a defender."
    : (tier === 'ok')
    ? "You have a solid foundation. Keep studying and we'll build on it together, one step at a time."
    : "Thanks for being honest. This is just your starting point, and I'll be with you the whole way.";

  return `
    <div class="word-doc-header-banner">
      <div>
        <div class="word-doc-title">CYBERSECURITY PRE-TEST ASSESSMENT REPORT</div>
        <div class="word-doc-subtitle">Chapter 1 Baseline Knowledge Evaluation • Technical Solutions IT Security</div>
      </div>
      <div style="font-size:36px">🛡️</div>
    </div>

    <div class="word-doc-meta-strip" style="display:flex; flex-wrap:wrap; gap:14px; background:#f8fafc; padding:8px 14px; border-radius:4px; border:1px solid #e2e8f0; font-size:11.5px; color:#475569; margin-bottom:20px;">
      <span><strong>Player Name:</strong> <span style="color:#0f172a; font-weight:700;">${_esc(playerName)}</span></span>
      <span><strong>Completion Date:</strong> <span style="color:#0f172a;">${_esc(completedDate)}</span></span>
      <span><strong>Document Type:</strong> Official Baseline Assessment</span>
      <span><strong>Evaluation Rank:</strong> <span style="color:#1d4ed8; font-weight:700;">${_esc(rank)}</span></span>
    </div>

    <h3 style="color:#185abd; font-size:14px; margin:0 0 10px 0; letter-spacing:-0.2px;">
      1. Performance Summary
    </h3>

    <!-- 4 Summary Metric Cards -->
    <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:10px; margin-bottom:18px;">
      <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:6px; padding:12px 8px; text-align:center;">
        <div style="font-size:10px; color:#64748b; font-weight:700; text-transform:uppercase; letter-spacing:0.5px;">Total Score</div>
        <div style="font-size:22px; font-weight:800; color:#0f172a; margin-top:2px;">${score} / ${total}</div>
        <div style="font-size:10px; color:#94a3b8; margin-top:1px;">Points Earned</div>
      </div>
      <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:6px; padding:12px 8px; text-align:center;">
        <div style="font-size:10px; color:#166534; font-weight:700; text-transform:uppercase; letter-spacing:0.5px;">Correct Answers</div>
        <div style="font-size:22px; font-weight:800; color:#15803d; margin-top:2px;">${correct}</div>
        <div style="font-size:10px; color:#16a34a; margin-top:1px;">Verified Correct</div>
      </div>
      <div style="background:#fef2f2; border:1px solid #fecaca; border-radius:6px; padding:12px 8px; text-align:center;">
        <div style="font-size:10px; color:#991b1b; font-weight:700; text-transform:uppercase; letter-spacing:0.5px;">Incorrect Answers</div>
        <div style="font-size:22px; font-weight:800; color:#b91c1c; margin-top:2px;">${incorrect}</div>
        <div style="font-size:10px; color:#dc2626; margin-top:1px;">To Learn</div>
      </div>
      <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:6px; padding:12px 8px; text-align:center;">
        <div style="font-size:10px; color:#1e40af; font-weight:700; text-transform:uppercase; letter-spacing:0.5px;">Percentage Score</div>
        <div style="font-size:22px; font-weight:800; color:#1d4ed8; margin-top:2px;">${percent}%</div>
        <div style="font-size:10px; color:#2563eb; margin-top:1px;">Accuracy Rate</div>
      </div>
    </div>

    <div class="word-callout-box" style="margin:16px 0;">
      <strong style="display:flex; align-items:center; gap:6px;">
        <span>🧑‍💼</span> IT Support Mentor (Ryan) Feedback:
      </strong>
      <p style="margin:6px 0 0 0; font-style:italic; font-size:12.5px;">
        "${_esc(mentorRemarks)}"
      </p>
    </div>

    <h3 style="color:#185abd; font-size:14px; margin:20px 0 8px 0; letter-spacing:-0.2px;">
      2. Evaluated Cybersecurity Competencies
    </h3>
    <p style="font-size:12px; color:#334155; margin:0 0 10px 0; line-height:1.5;">
      This baseline diagnostic evaluated your security instincts across 20 foundational real-world scenarios before beginning hands-on phishing email investigation and threat analysis.
    </p>

    <table style="width:100%; border-collapse:collapse; margin-top:8px; font-size:11.5px; border:1px solid #e2e8f0;">
      <thead>
        <tr style="background:#f1f5f9; border-bottom:2px solid #cbd5e1; text-align:left;">
          <th style="padding:8px 10px; color:#334155;">Domain</th>
          <th style="padding:8px 10px; color:#334155;">Key Topic Assessed</th>
          <th style="padding:8px 10px; text-align:center; color:#334155;">Evaluation</th>
        </tr>
      </thead>
      <tbody>
        <tr style="border-bottom:1px solid #e2e8f0;">
          <td style="padding:8px 10px; font-weight:600; color:#0f172a;">Phishing & Social Engineering</td>
          <td style="padding:8px 10px; color:#475569;">Deceptive links, urgency triggers, spoofed senders, and prize lures</td>
          <td style="padding:8px 10px; text-align:center; font-weight:700; color:#15803d;">COMPLETED</td>
        </tr>
        <tr style="border-bottom:1px solid #e2e8f0; background:#fcfcfc;">
          <td style="padding:8px 10px; font-weight:600; color:#0f172a;">Password & Identity Security</td>
          <td style="padding:8px 10px; color:#475569;">Password strength, credential reuse hazards, and Multi-Factor Auth (MFA)</td>
          <td style="padding:8px 10px; text-align:center; font-weight:700; color:#15803d;">COMPLETED</td>
        </tr>
        <tr style="border-bottom:1px solid #e2e8f0;">
          <td style="padding:8px 10px; font-weight:600; color:#0f172a;">Malware & Device Safety</td>
          <td style="padding:8px 10px; color:#475569;">Ransomware risks, unknown USB drives, software updates, and antivirus scans</td>
          <td style="padding:8px 10px; text-align:center; font-weight:700; color:#15803d;">COMPLETED</td>
        </tr>
        <tr style="background:#fcfcfc;">
          <td style="padding:8px 10px; font-weight:600; color:#0f172a;">Network & Data Hygiene</td>
          <td style="padding:8px 10px; color:#475569;">Public Wi-Fi hazards, regular file backups, and reporting compromised accounts</td>
          <td style="padding:8px 10px; text-align:center; font-weight:700; color:#15803d;">COMPLETED</td>
        </tr>
      </tbody>
    </table>`;
}

// Global exposure
window.generatePretestResultDocument = generatePretestResultDocument;
window.saveAndInjectPretestDocument = saveAndInjectPretestDocument;
window.initPretestResultDocument = initPretestResultDocument;
window.renderPretestReportHtml = renderPretestReportHtml;

// Auto-initialize on script execution
if (typeof initPretestResultDocument === 'function') {
  initPretestResultDocument();
}


// ═══════════════════════════════════════════════════════════
// POST-TEST RESULT DOCUMENT PERSISTENCE & FILE INJECTION
// ═══════════════════════════════════════════════════════════

const POSTTEST_DOC_STORAGE_KEY = 'cyberzero_posttest_result_file';

function formatPosttestDate(isoStr) {
  try {
    const d = isoStr ? new Date(isoStr) : new Date();
    const datePart = d.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
    const timePart = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    return `${datePart} ${timePart}`;
  } catch (e) {
    return '9/6/2026 11:20 AM';
  }
}

function generatePosttestResultDocument(result) {
  if (!result) return null;

  const playerName = getPlayerDisplayName();
  const completedAt = result.completedAt || new Date().toISOString();
  const formattedDate = formatPosttestDate(completedAt);

  const score = typeof result.score === 'number' ? result.score : 0;
  const total = typeof result.total === 'number' ? result.total : 20;
  const correct = score;
  const incorrect = Math.max(0, total - score);
  const percent = typeof result.percent === 'number' ? result.percent : Math.round((score / (total || 1)) * 100);
  const tier = result.tier || (typeof RyanPosttest !== 'undefined' && RyanPosttest.tierOf ? RyanPosttest.tierOf(score, total) : (score >= 19 ? 'mastery' : score >= 16 ? 'expert' : score >= 14 ? 'competent' : 'developing'));
  const rank = result.rank || (tier === 'mastery' ? 'Cyber Sentinel' : tier === 'expert' ? 'Phishing Specialist' : tier === 'competent' ? 'Vigilant Analyst' : 'Developing Defender');

  return {
    id: 'doc_posttest_result',
    name: 'posttest_result_report.docx',
    chapter: 1,
    fakeExt: 'docx',
    realExt: 'docx',
    type: 'Microsoft Word Document',
    size: '36 KB',
    date: formattedDate,
    icon: '📄',
    isMalware: false,
    threatName: 'Clean File',
    threatCategory: 'SAFE',
    hash: 'POSTTEST-REPORT-CYBERZERO-' + Math.abs((completedAt + score).split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a; }, 0)).toString(16),
    analysis: '✅ Official CyberZerØ Cybersecurity Post-Test Final Mastery Assessment Report. Verified authentic.',
    quarantined: false,
    scanned: true,
    reportData: {
      playerName: playerName,
      completedAt: completedAt,
      formattedDate: formattedDate,
      score: score,
      total: total,
      correct: correct,
      incorrect: incorrect,
      percent: percent,
      tier: tier,
      rank: rank,
      answers: Array.isArray(result.answers) ? result.answers : []
    }
  };
}

function _findPosttestResultData() {
  // 1. Direct saved document in localStorage
  try {
    const rawDoc = localStorage.getItem(POSTTEST_DOC_STORAGE_KEY);
    if (rawDoc) {
      const parsed = JSON.parse(rawDoc);
      if (parsed && parsed.reportData && typeof parsed.reportData.score === 'number') {
        return parsed;
      }
    }
  } catch (e) {}

  // 2. In-memory gameState.postTestResult
  try {
    if (typeof gameState !== 'undefined' && gameState.postTestResult && typeof gameState.postTestResult.score === 'number') {
      return generatePosttestResultDocument(gameState.postTestResult);
    }
  } catch (e) {}

  // 3. RyanPosttest.getResult()
  try {
    if (typeof RyanPosttest !== 'undefined' && RyanPosttest.getResult) {
      const res = RyanPosttest.getResult();
      if (res && typeof res.score === 'number') {
        return generatePosttestResultDocument(res);
      }
    }
  } catch (e) {}

  // 4. Scan localStorage for any cyberzero_posttest_ keys (alex, guest, uid, etc.)
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('cyberzero_posttest_') && k !== 'cyberzero_posttest_wip' && k !== POSTTEST_DOC_STORAGE_KEY) {
        const val = localStorage.getItem(k);
        if (val) {
          try {
            const parsed = JSON.parse(val);
            if (parsed && typeof parsed.score === 'number') {
              return generatePosttestResultDocument(parsed);
            }
          } catch (_) {}
        }
      }
    }
  } catch (e) {}

  // 5. Scan session state in localStorage
  try {
    const rawSess = localStorage.getItem('cyberzero_session_state') || localStorage.getItem('cyberzero_session_save');
    if (rawSess) {
      const sess = JSON.parse(rawSess);
      const gs = (sess && sess.gameState) ? sess.gameState : sess;
      if (gs && gs.postTestResult && typeof gs.postTestResult.score === 'number') {
        return generatePosttestResultDocument(gs.postTestResult);
      }
      if (gs && (gs.postTestCompleted || typeof gs.postTestScore === 'number')) {
        return generatePosttestResultDocument({
          score: typeof gs.postTestScore === 'number' ? gs.postTestScore : 18,
          total: gs.postTestTotal || 20,
          completedAt: sess.savedAt || new Date().toISOString()
        });
      }
    }
  } catch (e) {}

  // 6. Direct gameState flags
  try {
    if (typeof gameState !== 'undefined' && (gameState.postTestCompleted || typeof gameState.postTestScore === 'number')) {
      return generatePosttestResultDocument({
        score: typeof gameState.postTestScore === 'number' ? gameState.postTestScore : 18,
        total: gameState.postTestTotal || 20,
        completedAt: new Date().toISOString()
      });
    }
  } catch (e) {}

  return null;
}

function saveAndInjectPosttestDocument(result) {
  if (!result) return;
  const docFile = generatePosttestResultDocument(result);
  if (!docFile) return;

  // 1. Save persistently to localStorage
  try {
    localStorage.setItem(POSTTEST_DOC_STORAGE_KEY, JSON.stringify(docFile));
  } catch (e) {}

  // 2. Ensure EXPLORER_ADDITIONAL_FILES.documents has this file (prevent duplicates!)
  if (typeof EXPLORER_ADDITIONAL_FILES !== 'undefined') {
    if (!Array.isArray(EXPLORER_ADDITIONAL_FILES.documents)) {
      EXPLORER_ADDITIONAL_FILES.documents = [];
    }
    const docs = EXPLORER_ADDITIONAL_FILES.documents;
    const existingIdx = docs.findIndex(f => f.id === 'doc_posttest_result');
    if (existingIdx !== -1) {
      docs[existingIdx] = docFile;
    } else {
      docs.push(docFile);
    }

    // Refresh active file explorer view if currently open on Documents
    if (typeof currentExplorerFolder !== 'undefined' && currentExplorerFolder === 'documents' && typeof renderFolderFiles === 'function') {
      renderFolderFiles();
    }
  }

  // Update sidebar Documents badge if visible
  const docBadge = document.getElementById('sidebar-documents-badge');
  const isCh2 = (window._currentChapterCategory === 'malware' ||
                 (typeof activeCategoryStory !== 'undefined' && activeCategoryStory === 'malware') ||
                 (typeof gameState !== 'undefined' && gameState.phase === 'malware'));
  const allDocs = (typeof EXPLORER_ADDITIONAL_FILES !== 'undefined' && Array.isArray(EXPLORER_ADDITIONAL_FILES.documents)) ? EXPLORER_ADDITIONAL_FILES.documents : [];
  const visibleDocs = isCh2
    ? allDocs.filter(f => f.id !== 'doc_pretest_result' && f.id !== 'doc_posttest_result' && f.chapter !== 1)
    : allDocs;
  const docCount = visibleDocs.length;
  if (docBadge) {
    docBadge.textContent = docCount;
    docBadge.style.display = docCount > 0 ? '' : 'none';
  }

  if (typeof showToast === 'function') {
    showToast('📄 Post-Test Report saved to File Explorer → Documents', 'success');
  }

  if (typeof window.saveSessionLocally === 'function') {
    window.saveSessionLocally();
  }
}

function initPosttestResultDocument() {
  try {
    const docFile = _findPosttestResultData();
    if (docFile) {
      try {
        localStorage.setItem(POSTTEST_DOC_STORAGE_KEY, JSON.stringify(docFile));
      } catch (e) {}

      if (typeof EXPLORER_ADDITIONAL_FILES !== 'undefined') {
        if (!Array.isArray(EXPLORER_ADDITIONAL_FILES.documents)) {
          EXPLORER_ADDITIONAL_FILES.documents = [];
        }
        const docs = EXPLORER_ADDITIONAL_FILES.documents;
        const existingIdx = docs.findIndex(f => f.id === 'doc_posttest_result');
        if (existingIdx !== -1) {
          docs[existingIdx] = docFile;
        } else {
          docs.push(docFile);
        }
      }
    }
  } catch (e) {}
}

function renderPosttestReportHtml(file) {
  const data = (file && file.reportData) ? file.reportData : (() => {
    try {
      const raw = localStorage.getItem(POSTTEST_DOC_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      return (parsed && parsed.reportData) ? parsed.reportData : null;
    } catch (e) { return null; }
  })() || {};

  const _esc = (s) => (typeof escapeHtml === 'function' ? escapeHtml(s) : String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'));

  const playerName = data.playerName || getPlayerDisplayName();
  const completedDate = data.formattedDate || formatPosttestDate(data.completedAt);
  const score = typeof data.score === 'number' ? data.score : 0;
  const total = typeof data.total === 'number' ? data.total : 20;
  const correct = typeof data.correct === 'number' ? data.correct : score;
  const incorrect = typeof data.incorrect === 'number' ? data.incorrect : Math.max(0, total - correct);
  const percent = typeof data.percent === 'number' ? data.percent : Math.round((correct / (total || 1)) * 100);
  const tier = data.tier || (score >= 19 ? 'mastery' : score >= 16 ? 'expert' : score >= 14 ? 'competent' : 'developing');
  const rank = data.rank || (tier === 'mastery' ? 'Cyber Sentinel' : tier === 'expert' ? 'Phishing Specialist' : tier === 'competent' ? 'Vigilant Analyst' : 'Developing Defender');

  let preResult = null;
  try {
    if (typeof RyanPretest !== 'undefined' && RyanPretest.getResult) preResult = RyanPretest.getResult();
    if (!preResult && typeof gameState !== 'undefined') preResult = gameState.preTestResult;
    if (!preResult) {
      const rawPre = localStorage.getItem('cyberzero_pretest_result_file');
      if (rawPre) {
        const pFile = JSON.parse(rawPre);
        if (pFile && pFile.reportData) preResult = pFile.reportData;
      }
    }
  } catch (e) {}

  let growthHtml = '';
  if (preResult && typeof preResult.score === 'number') {
    const preScore = preResult.score;
    const preTotal = preResult.total || 20;
    const prePct = typeof preResult.percent === 'number' ? preResult.percent : Math.round((preScore / preTotal) * 100);
    const diff = percent - prePct;
    const isGain = diff > 0;
    const isSame = diff === 0;
    const deltaBadge = isGain
      ? `<span style="background:#dcfce7; color:#15803d; padding:3px 10px; border-radius:999px; font-weight:700; font-size:11px;">▲ +${diff}% Improvement</span>`
      : (isSame ? `<span style="background:#f1f5f9; color:#475569; padding:3px 10px; border-radius:999px; font-weight:700; font-size:11px;">★ Baseline Maintained</span>` : `<span style="background:#fee2e2; color:#b91c1c; padding:3px 10px; border-radius:999px; font-weight:700; font-size:11px;">${diff}% Differential</span>`);

    growthHtml = `
      <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:6px; padding:10px 14px; margin-bottom:18px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px;">
        <div style="display:flex; align-items:center; gap:8px; font-size:11.5px; color:#334155;">
          <span style="font-size:16px;">📈</span>
          <span><strong>Pre-Test Baseline:</strong> ${preScore}/${preTotal} (${prePct}%) ➔ <strong>Final Post-Test:</strong> ${score}/${total} (${percent}%)</span>
        </div>
        <div>${deltaBadge}</div>
      </div>
    `;
  }

  const mentorRemarks = (tier === 'mastery')
    ? "Twenty out of twenty! Outstanding work, Alex. You demonstrated flawless cybersecurity and phishing detection instincts."
    : (tier === 'expert')
    ? "Great awareness! You caught almost every threat indicator and think like a true cyber defender."
    : (tier === 'competent')
    ? "Good job! You have built solid phishing defense habits. Always remember: Stop. Check. Verify. Report."
    : "You have taken your first big step in email security. Keep practicing and your defense instincts will sharpen.";

  return `
    <div class="word-doc-header-banner">
      <div>
        <div class="word-doc-title">CYBERSECURITY POST-TEST ASSESSMENT REPORT</div>
        <div class="word-doc-subtitle">Chapter 1 Phishing &amp; Threat Defense Mastery Evaluation • Technical Solutions IT Security</div>
      </div>
      <div style="font-size:36px">🏆</div>
    </div>

    <div class="word-doc-meta-strip" style="display:flex; flex-wrap:wrap; gap:14px; background:#f8fafc; padding:8px 14px; border-radius:4px; border:1px solid #e2e8f0; font-size:11.5px; color:#475569; margin-bottom:20px;">
      <span><strong>Player Name:</strong> <span style="color:#0f172a; font-weight:700;">${_esc(playerName)}</span></span>
      <span><strong>Completion Date:</strong> <span style="color:#0f172a;">${_esc(completedDate)}</span></span>
      <span><strong>Document Type:</strong> Official Mastery Assessment</span>
      <span><strong>Evaluation Rank:</strong> <span style="color:#1d4ed8; font-weight:700;">${_esc(rank)}</span></span>
    </div>

    <h3 style="color:#185abd; font-size:14px; margin:0 0 10px 0; letter-spacing:-0.2px;">
      1. Performance Summary
    </h3>

    <!-- 4 Summary Metric Cards -->
    <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:10px; margin-bottom:18px;">
      <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:6px; padding:12px 8px; text-align:center;">
        <div style="font-size:10px; color:#64748b; font-weight:700; text-transform:uppercase; letter-spacing:0.5px;">Total Score</div>
        <div style="font-size:22px; font-weight:800; color:#0f172a; margin-top:2px;">${score} / ${total}</div>
        <div style="font-size:10px; color:#94a3b8; margin-top:1px;">Points Earned</div>
      </div>
      <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:6px; padding:12px 8px; text-align:center;">
        <div style="font-size:10px; color:#166534; font-weight:700; text-transform:uppercase; letter-spacing:0.5px;">Correct Answers</div>
        <div style="font-size:22px; font-weight:800; color:#15803d; margin-top:2px;">${correct}</div>
        <div style="font-size:10px; color:#16a34a; margin-top:1px;">Verified Correct</div>
      </div>
      <div style="background:#fef2f2; border:1px solid #fecaca; border-radius:6px; padding:12px 8px; text-align:center;">
        <div style="font-size:10px; color:#991b1b; font-weight:700; text-transform:uppercase; letter-spacing:0.5px;">Incorrect Answers</div>
        <div style="font-size:22px; font-weight:800; color:#b91c1c; margin-top:2px;">${incorrect}</div>
        <div style="font-size:10px; color:#dc2626; margin-top:1px;">To Review</div>
      </div>
      <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:6px; padding:12px 8px; text-align:center;">
        <div style="font-size:10px; color:#1e40af; font-weight:700; text-transform:uppercase; letter-spacing:0.5px;">Percentage Score</div>
        <div style="font-size:22px; font-weight:800; color:#1d4ed8; margin-top:2px;">${percent}%</div>
        <div style="font-size:10px; color:#2563eb; margin-top:1px;">Mastery Rate</div>
      </div>
    </div>

    ${growthHtml}

    <div class="word-callout-box" style="margin:16px 0;">
      <strong style="display:flex; align-items:center; gap:6px;">
        <span>🧑‍💼</span> IT Support Mentor (Ryan) Feedback:
      </strong>
      <p style="margin:6px 0 0 0; font-style:italic; font-size:12.5px;">
        "${_esc(mentorRemarks)}"
      </p>
    </div>

    <h3 style="color:#185abd; font-size:14px; margin:20px 0 8px 0; letter-spacing:-0.2px;">
      2. Evaluated Cybersecurity Competencies
    </h3>
    <p style="font-size:12px; color:#334155; margin:0 0 10px 0; line-height:1.5;">
      This comprehensive post-assessment evaluated your threat detection, evidence gathering, and decision-making capabilities following the Chapter 1 Phishing Investigation practical simulation.
    </p>

    <table style="width:100%; border-collapse:collapse; margin-top:8px; font-size:11.5px; border:1px solid #e2e8f0;">
      <thead>
        <tr style="background:#f1f5f9; border-bottom:2px solid #cbd5e1; text-align:left;">
          <th style="padding:8px 10px; color:#334155;">Domain</th>
          <th style="padding:8px 10px; color:#334155;">Key Topic Assessed</th>
          <th style="padding:8px 10px; text-align:center; color:#334155;">Evaluation</th>
        </tr>
      </thead>
      <tbody>
        <tr style="border-bottom:1px solid #e2e8f0;">
          <td style="padding:8px 10px; font-weight:600; color:#0f172a;">Advanced Phishing &amp; Email Spoofing</td>
          <td style="padding:8px 10px; color:#475569;">Deceptive links, lookalike domains, sender spoofing, and fake security alerts</td>
          <td style="padding:8px 10px; text-align:center; font-weight:700; color:#15803d;">MASTERED</td>
        </tr>
        <tr style="border-bottom:1px solid #e2e8f0; background:#fcfcfc;">
          <td style="padding:8px 10px; font-weight:600; color:#0f172a;">Quishing &amp; QR Threat Analysis</td>
          <td style="padding:8px 10px; color:#475569;">Physical and digital rogue QR code verification, fake multi-factor prompts</td>
          <td style="padding:8px 10px; text-align:center; font-weight:700; color:#15803d;">MASTERED</td>
        </tr>
        <tr style="border-bottom:1px solid #e2e8f0;">
          <td style="padding:8px 10px; font-weight:600; color:#0f172a;">Social Engineering &amp; Urgency Analysis</td>
          <td style="padding:8px 10px; color:#475569;">Extortion pressure, authority manipulation, and psychological pretexts</td>
          <td style="padding:8px 10px; text-align:center; font-weight:700; color:#15803d;">MASTERED</td>
        </tr>
        <tr style="background:#fcfcfc;">
          <td style="padding:8px 10px; font-weight:600; color:#0f172a;">Enterprise Reporting Protocols</td>
          <td style="padding:8px 10px; color:#475569;">Incident reporting, evidence preservation, and secure corporate hygiene</td>
          <td style="padding:8px 10px; text-align:center; font-weight:700; color:#15803d;">MASTERED</td>
        </tr>
      </tbody>
    </table>`;
}

// Global exposure
window.generatePosttestResultDocument = generatePosttestResultDocument;
window.saveAndInjectPosttestDocument = saveAndInjectPosttestDocument;
window.initPosttestResultDocument = initPosttestResultDocument;
window.renderPosttestReportHtml = renderPosttestReportHtml;

// Auto-initialize posttest document
if (typeof initPosttestResultDocument === 'function') {
  initPosttestResultDocument();
}

