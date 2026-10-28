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
  const file = smartscreenTargetFile || getScholarshipGrantFileDef();
  closeSmartScreenModal();

  if (typeof AudioManager !== 'undefined' && AudioManager.playCorrect) {
    AudioManager.playCorrect();
  }

  // Auto-delete via antivirus immediately
  if (file && typeof quarantineFile === 'function') {
    quarantineFile(file.id);
  } else if (typeof quarantineScholarshipMalware === 'function') {
    quarantineScholarshipMalware();
  }

  showToast('🛡️ Windows Defender: Threat automatically deleted — "Scholarship_Form.pdf.exe" has been removed.', 'success');

  if (typeof RyanGuide !== 'undefined') {
    RyanGuide.speak([
      {
        text: "🎯 <strong>Great decision!</strong> You clicked <strong>Don't Run</strong> — Windows Defender automatically deleted the malicious file.",
        state: 'success'
      },
      {
        text: "Never execute unrecognized <code>.exe</code> files downloaded from unverified emails. The file has been safely removed from your system.",
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
  showToast(`🛡️ Threat neutralized: "${file ? file.name : 'Scholarship_Form.pdf.exe'}" deleted/quarantined.`, 'success');
}
