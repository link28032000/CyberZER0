'use strict';

// Global HTML escaper available to all modules immediately
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
window.escapeHtml = escapeHtml;

// Training slides content — only the demo-ready slide remains (others moved to VN intro)
const TRAINING_SLIDES = [
  {
    title: 'Ready for the Demo? 🎬',
    content: `<p>Before your mission begins, I'll walk you through a real example.</p>
    <p style="margin-top:12px;">I'll show you exactly how to spot the three red flags in a phishing email.</p>
    <p style="margin-top:12px;">Watch closely — then it's your turn.</p>`
  }
];

// ═══════════════════════════════════════════════════════════
// GAME STATE
// ═══════════════════════════════════════════════════════════

const gameState = {
  phase: 'welcome',         // welcome | training | demo | mission | results | malware
  currentEmail: 0,          // index into EMAILS
  score: 0,
  correctDecisions: 0,
  phishingDetected: 0,
  legitimateDetected: 0,
  evidenceFoundTotal: 0,
  trainingSlide: 0,
  demoStep: 0,
  flagModeActive: false,
  currentEmailFlags: [],    // { id, type, text, label }
  emailResults: [],         // per-email result records
  pendingLinkUrl: null,
  pendingLinkFlagId: null,
  pendingLinkFlagType: null,
  currentFolder: 'inbox',   // inbox | sent | trash
  trashedSentIds: [],       // ids of SENT_EMAILS moved to Trash (only sent mail can be deleted)
  readSentIds: [],          // ids of SENT_EMAILS that player has opened/read
  malwareQuarantined: 0,
  malwareFalsePositives: 0,
  selectedFolderFileId: null,
  activeScanFileId: null,
  playerName: 'Student',
  antivirusProtection: true
};

const appState = {
  gmail: { open: false, minimized: false, maximized: false, hasBeenPositioned: false },
  browser: { open: false, minimized: false, maximized: false, hasBeenPositioned: false },
  folder: { open: false, minimized: false, maximized: false, hasBeenPositioned: false },
  antivirus: { open: false, minimized: false, maximized: false, hasBeenPositioned: false },
  comms: { open: false, minimized: false, maximized: false, hasBeenPositioned: false },
  ransomware: { open: false, minimized: false, maximized: false, hasBeenPositioned: false },
  'wifi-settings': { open: false, minimized: false, maximized: false, hasBeenPositioned: false },
  'security-settings': { open: false, minimized: false, maximized: false, hasBeenPositioned: false },
  taskmanager: { open: false, minimized: false, maximized: false, hasBeenPositioned: false },
  scanner: { open: false, minimized: false, maximized: false, hasBeenPositioned: false },
  docviewer: { open: false, minimized: false, maximized: false, hasBeenPositioned: false },
  imageviewer: { open: false, minimized: false, maximized: false, hasBeenPositioned: false },
  videoplayer: { open: false, minimized: false, maximized: false, hasBeenPositioned: false }
};
