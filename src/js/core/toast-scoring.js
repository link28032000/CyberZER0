'use strict';

// ═══════════════════════════════════════════════════════════
// TOAST
// ═══════════════════════════════════════════════════════════

let toastTimeout = null;

function showToast(message, type) {
  // If dialogue overlay is active, don't show toast behind the dialogue
  const ryanOverlay = document.getElementById('ryan-guide-overlay');
  if (ryanOverlay && !ryanOverlay.classList.contains('hidden')) {
    return;
  }
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.className = `toast ${type}`;
  toast.classList.remove('hidden');
  if (typeof AudioManager !== 'undefined') AudioManager.playNotification();
  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.add('hidden'), 3000);
}

// ═══════════════════════════════════════════════════════════
// EVIDENCE SCORING HELPERS
// ═══════════════════════════════════════════════════════════

function checkEvidence(email, playerFlags) {
  const correct = playerFlags.filter(f => email.evidence.includes(f));
  const incorrect = playerFlags.filter(f => !email.evidence.includes(f));
  const missed = email.evidence.filter(e => !playerFlags.includes(e));
  return { correct, incorrect, missed };
}

function calculateScore(correctDecision, correct, incorrect, penaltyPerIncorrect = 10) {
  let s = correctDecision ? 100 : -50;
  s += correct.length * 25;
  s -= incorrect.length * penaltyPerIncorrect;
  return s;
}
