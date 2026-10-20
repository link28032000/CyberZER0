'use strict';

// ═══════════════════════════════════════════════════════════
// CHAPTER 3: SOCIAL ENGINEERING LAB (PHILLIP)
// ═══════════════════════════════════════════════════════════

const COMMS_ITEMS = [
  {
    id: 'vishing_1',
    type: 'vishing',
    icon: '📞',
    channel: 'Voice Call',
    sender: 'Academy IT Support',
    address: 'Internal Ext 9921',
    time: '2:15 PM',
    subject: 'Emergency Server Migration — Password Verification',
    audioTranscript: '"Hello, this is Campus IT Support. We are performing an emergency server migration right now. We need you to state your account password and read out the 6-digit MFA code sent to your phone immediately so we can preserve your profile."',
    isSocialEngineering: true,
    threatVector: 'Vishing (Voice Call Impersonation)',
    tactic: 'Fake Authority & Urgent Credential Harvesting',
    explanation: 'Legitimate IT support will NEVER call asking for your password or SMS verification code. Attackers use phone calls to create urgent psychological pressure.',
    resolved: false,
    playerVerdict: null
  },
  {
    id: 'smishing_1',
    type: 'smishing',
    icon: '💬',
    channel: 'SMS Alert',
    sender: 'BPI Security Alerts',
    address: '+63-917-000-8812',
    time: '2:30 PM',
    subject: 'Unusual Sign-in Detected',
    messageText: 'BPI SECURITY ALERT: Unusual sign-in attempt from Cebu. Your mobile banking access will be closed in 15 mins. Reactivate now at https://bpi-mobile-verify.cc/login',
    isSocialEngineering: true,
    threatVector: 'Smishing (SMS Phishing Link)',
    tactic: 'False Urgency & Spoofed Shortcode',
    explanation: 'Banks do not send SMS texts with urgent login links from generic mobile numbers. The link domain (.cc) is deceptive.',
    resolved: false,
    playerVerdict: null
  },
  {
    id: 'impersonate_1',
    type: 'impersonation',
    icon: '👥',
    channel: 'Direct Message',
    sender: 'Classmate (Backup)',
    address: 'classmate.backup@tempmail.io',
    time: '2:45 PM',
    subject: 'Lost Project Files — Send Login',
    messageText: 'Hey! My PC crashed and I lost our project files. Can you send me your student portal password real quick so I can copy the research slides before class?',
    isSocialEngineering: true,
    threatVector: 'Pretexting & Identity Impersonation',
    tactic: 'Friend Impersonation & Credential Sharing',
    explanation: 'Attackers create fake lookalike accounts of classmates or friends using temporary email services (@tempmail.io) to trick victims into sharing credentials.',
    resolved: false,
    playerVerdict: null
  },
  {
    id: 'legit_comm_1',
    type: 'legitimate',
    icon: '🛡️',
    channel: 'Official Notice',
    sender: 'Cyber Academy Registrar',
    address: '292900 (Verified Shortcode)',
    time: '3:00 PM',
    subject: 'Midterm Submission Schedule',
    messageText: 'Official Notice: The midterm project submission portal opens next Monday at 8:00 AM on the official school portal. No login credentials will ever be requested via SMS.',
    isSocialEngineering: false,
    threatVector: 'Safe Communication',
    tactic: 'Standard Information Broadcast',
    explanation: 'Contains no urgent threats, asks for zero credentials, and includes standard security disclaimers.',
    resolved: false,
    playerVerdict: null
  }
];

let selectedCommId = 'vishing_1';

// ═══════════════════════════════════════════════════════════
// GROUP 4 MISSION ENGINE — Wi-Fi / Social Eng / Malicious Download
// ═══════════════════════════════════════════════════════════

const G4_WIFI_NETWORKS = [
  {
    id: 'coffeeshop_guest',
    name: 'Free Wifi',
    security: 'Open',
    signal: 3,
    password: 'None',
    deviceVisibility: 'Available',
    tag: 'Open — No Password',
    tagClass: 'wifi-tag-open',
    risk: 'high',
    note: 'Open network with no encryption. All traffic is visible to anyone on this network.'
  },
  {
    id: 'sjshs_free',
    name: 'GLOBE_BROADBAND_2G',
    security: 'Open',
    signal: 4,
    password: 'None',
    deviceVisibility: 'Available',
    tag: 'Open — No Password',
    tagClass: 'wifi-tag-open',
    risk: 'high',
    note: 'School name does not guarantee legitimacy. Anyone can create a network with any name.'
  },
  {
    id: 'coffeeshop_secure',
    name: 'PLDT-Home-5A3B',
    security: 'WPA2-Personal',
    signal: 4,
    password: 'Staff-provided',
    deviceVisibility: 'Hidden',
    tag: 'Password Protected',
    tagClass: 'wifi-tag-secure',
    risk: 'low',
    note: 'Password-protected network provided by the establishment. Reduced risk.'
  }
];

const G4_SECURITY_SETTINGS = [
  { id: 'file_sharing', label: 'File Sharing', icon: '📂', state: true, risky: true, hint: 'Allows other devices to access your files over the network.' },
  { id: 'device_discovery', label: 'Device Discovery', icon: '📡', state: true, risky: true, hint: 'Makes your laptop visible to other devices on the network.' },
  { id: 'firewall', label: 'Firewall', icon: '🔥', state: true, risky: false, hint: 'Blocks unauthorized access from the network. Keep this ON.' },
  { id: 'auto_updates', label: 'Automatic Updates', icon: '🔄', state: true, risky: false, hint: 'Keeps your software patched against vulnerabilities. Keep ON.' }
];

const G4_PROCESSES = [
  { pid: '1284', name: 'explorer.exe', cpu: '0.5%', mem: '32 MB', status: 'Running', suspicious: false },
  { pid: '2048', name: 'chrome.exe', cpu: '3.2%', mem: '180 MB', status: 'Running', suspicious: false },
  { pid: '3104', name: 'OneDrive.exe', cpu: '0.1%', mem: '24 MB', status: 'Running', suspicious: false },
  { pid: '4092', name: 'PremiumDesignTool.exe', cpu: '38.7%', mem: '412 MB', status: '⚠️ Suspicious', suspicious: true }
];

const g4State = {
  stage: 0,          // 1-5
  wifiChoice: null,  // network id chosen
  securedLaptop: false,
  fileSharingOff: false,
  deviceDiscoveryOff: false,
  miaAction: null,   // 'reported' | 'sent' | 'ignored'
  fileDecision: null, // 'delete' | 'report' | 'open'
  infectionInvestigated: false,
  wifiDisconnected: false,
  processKilled: false,
  scannerRan: false,
  score: 0
};

let g4ActiveTab = 'messages';
let g4SelectedNetwork = null;
let g4InfectionSymptoms = 0;
let g4InfectionTimer = null;
