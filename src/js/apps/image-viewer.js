'use strict';

// ─── 2. PHOTOS / IMAGE VIEWER ───────────────────────────────
let imgViewerScale = 1;
let imgViewerRotation = 0;

function openImageViewer(file) {
  const titleText = document.getElementById('imageviewer-title-text');
  if (titleText) titleText.textContent = `Photos — ${file.name}`;

  const imgEl = document.getElementById('imgviewer-display');
  const imgSrc = file.mediaSrc || 'assets/background/Coffe shop.png';
  if (imgEl) {
    imgEl.src = imgSrc;
    imgViewerScale = 1;
    imgViewerRotation = 0;
    imgEl.style.transform = `scale(${imgViewerScale}) rotate(${imgViewerRotation}deg)`;
  }

  // Populate Info Drawer
  const infoList = document.getElementById('pinfo-list');
  if (infoList) {
    infoList.innerHTML = `
      <div class="pinfo-row">
        <span class="pinfo-label">File Name</span>
        <span class="pinfo-val">${file.name}</span>
      </div>
      <div class="pinfo-row">
        <span class="pinfo-label">Dimensions</span>
        <span class="pinfo-val">1920 × 1080 px</span>
      </div>
      <div class="pinfo-row">
        <span class="pinfo-label">File Size</span>
        <span class="pinfo-val">${file.size}</span>
      </div>
      <div class="pinfo-row">
        <span class="pinfo-label">Date Taken</span>
        <span class="pinfo-val">${file.date}</span>
      </div>
      <div class="pinfo-row">
        <span class="pinfo-label">Camera</span>
        <span class="pinfo-val">Sony Alpha 7 IV (35mm, f/2.8)</span>
      </div>
      <div class="pinfo-row">
        <span class="pinfo-label">Integrity</span>
        <span class="pinfo-val" style="color:#00e676">✓ Clean JFIF/EXIF Header</span>
      </div>`;
  }

  openApp('imageviewer');
  focusWindow('imageviewer');
  showToast(`🖼️ Opened "${file.name}" in Photos.`, 'success');
}

function imgViewerZoomIn() {
  imgViewerScale = Math.min(3, imgViewerScale + 0.25);
  _applyImgTransform();
}
function imgViewerZoomOut() {
  imgViewerScale = Math.max(0.5, imgViewerScale - 0.25);
  _applyImgTransform();
}
function imgViewerZoomReset() {
  imgViewerScale = 1;
  imgViewerRotation = 0;
  _applyImgTransform();
}
function imgViewerRotateLeft() {
  imgViewerRotation -= 90;
  _applyImgTransform();
}
function imgViewerRotateRight() {
  imgViewerRotation += 90;
  _applyImgTransform();
}
function _applyImgTransform() {
  const imgEl = document.getElementById('imgviewer-display');
  const zoomStatus = document.getElementById('photos-status-zoom');
  if (imgEl) {
    imgEl.style.transform = `scale(${imgViewerScale}) rotate(${imgViewerRotation}deg)`;
  }
  if (zoomStatus) zoomStatus.textContent = `Zoom: ${Math.round(imgViewerScale * 100)}%`;
}
function toggleImageInfoDrawer() {
  const drawer = document.getElementById('photos-info-drawer');
  const btn = document.getElementById('btn-toggle-img-info');
  if (drawer) drawer.classList.toggle('hidden');
  if (btn) btn.classList.toggle('active', !drawer?.classList.contains('hidden'));
}
function scanCurrentImageInAV() {
  if (gameState.selectedFolderFileId) {
    scanFileInAntivirus(gameState.selectedFolderFileId);
  } else {
    showToast('Photo asset verified clean by ShieldAV.', 'success');
  }
}
