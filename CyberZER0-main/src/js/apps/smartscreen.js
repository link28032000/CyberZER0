'use strict';

// ─── 4. WINDOWS DEFENDER SMARTSCREEN MODAL ──────────────────
function showSmartScreenWarning(file) {
  smartscreenTargetFile = file;

  const modal = document.getElementById('modal-smartscreen');
  const nameEl = document.getElementById('smartscreen-app-name');
  const pubEl = document.getElementById('smartscreen-app-publisher');
  const infoPanel = document.getElementById('smartscreen-more-info-panel');

  if (nameEl && file) nameEl.textContent = file.name;
  if (pubEl) pubEl.textContent = 'Unknown publisher';
  if (infoPanel) infoPanel.classList.add('hidden');

  if (modal) modal.classList.remove('hidden');
  if (typeof AudioManager !== 'undefined') AudioManager.playWrong();
}

function toggleSmartScreenMoreInfo() {
  const panel = document.getElementById('smartscreen-more-info-panel');
  if (panel) {
    panel.classList.toggle('hidden');
  }
}

function closeSmartScreenModal() {
  const modal = document.getElementById('modal-smartscreen');
  if (modal) modal.classList.add('hidden');
  smartscreenTargetFile = null;
}

function smartscreenScan() {
  const file = smartscreenTargetFile;
  closeSmartScreenModal();
  if (file) {
    scanFileInAntivirus(file.id);
  }
}

function smartscreenDontRun() {
  closeSmartScreenModal();
  if (typeof AudioManager !== 'undefined' && AudioManager.playCorrect) {
    AudioManager.playCorrect();
  }
  showToast('🛡️ Windows SmartScreen: Blocked unrecognized app from running.', 'info');
  if (typeof RyanGuide !== 'undefined') {
    RyanGuide.speak([
      {
        text: "🎯 <strong>Great decision!</strong> You clicked <strong>Don't run</strong>.",
        state: 'success'
      },
      {
        text: "Windows protected your PC! Never execute unrecognized .exe files downloaded from unverified emails. Now delete or quarantine the file to keep your system safe.",
        state: 'speaking'
      }
    ]);
  }
}

function smartscreenQuarantine() {
  const file = smartscreenTargetFile || getScholarshipGrantFileDef();
  closeSmartScreenModal();
  if (file) {
    quarantineFile(file.id);
  }
  if (typeof AudioManager !== 'undefined' && AudioManager.playCorrect) {
    AudioManager.playCorrect();
  }
  showToast(`🛡️ Threat neutralized: "${file ? file.name : 'Scholarship_Grant_Form.pdf.exe'}" deleted/quarantined.`, 'success');
}
