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
  documents: [
    {
      id: 'doc_arch',
      name: 'project_architecture_notes.docx',
      fakeExt: 'docx',
      realExt: 'docx',
      type: 'Microsoft Word Document',
      size: '48 KB',
      date: '9/6/2026 08:30 AM',
      icon: '📄',
      isMalware: false,
      threatName: 'Clean File',
      threatCategory: 'SAFE',
      hash: 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e',
      analysis: '✅ Verified clean Word document. Normal Office OpenXML structure, zero macro scripts.',
      quarantined: false,
      scanned: true
    }
  ],
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
    // ── Chapter 2 Malware Simulations ──────────────────────────────────────────
    // Safe, fictional educational demos — no real files are harmed or infected.
    {
      id: 'sim_virus',
      name: 'VirusSim_FileInfector.exe',
      fakeExt: 'exe',
      realExt: 'exe',
      type: 'Educational Simulation (.exe)',
      size: '1.2 MB',
      date: '10/29/2026 08:00 AM',
      icon: '🦠',
      isMalware: false,
      threatName: '[SIM] Virus.Win32.FileInfector',
      threatCategory: 'SIMULATION — SAFE',
      hash: 'SIM-VIRUS-EDUCATIONAL-CYBERZERO-CH2-001',
      analysis: '🎓 EDUCATIONAL SIMULATION — This is a safe, controlled demo of a file-infecting Virus. It shows how a virus attaches itself to executable files and spreads when those files are opened. No real files are modified.',
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
      type: 'Educational Simulation (.exe)',
      size: '980 KB',
      date: '10/29/2026 08:00 AM',
      icon: '🐛',
      isMalware: false,
      threatName: '[SIM] Worm.Win32.NetworkSpreader',
      threatCategory: 'SIMULATION — SAFE',
      hash: 'SIM-WORM-EDUCATIONAL-CYBERZERO-CH2-002',
      analysis: '🎓 EDUCATIONAL SIMULATION — This is a safe, controlled demo of a network-spreading Worm. It shows how a worm propagates across a network without any user interaction. No real network traffic is generated.',
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
      type: 'Educational Simulation (.exe)',
      size: '1.5 MB',
      date: '10/29/2026 08:00 AM',
      icon: '🐴',
      isMalware: false,
      threatName: '[SIM] Trojan.Win32.HiddenPayload',
      threatCategory: 'SIMULATION — SAFE',
      hash: 'SIM-TROJAN-EDUCATIONAL-CYBERZERO-CH2-003',
      analysis: '🎓 EDUCATIONAL SIMULATION — This is a safe, controlled demo of a Trojan Horse. It shows how a Trojan disguises itself as legitimate software while carrying a hidden payload. No real system changes are made.',
      quarantined: false,
      scanned: false,
      isSimulation: true,
      simType: 'trojan'
    }
  ],               // Ethan's Games folder — 3 malware education simulations
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

window.ch1DownloadsList = [];
