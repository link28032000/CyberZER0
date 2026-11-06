'use strict';

// ─── 2. PHOTOS / IMAGE VIEWER ───────────────────────────────
let imgViewerScale = 1;
let imgViewerRotation = 0;

function openImageViewer(file) {
  const isCh2 = (window._currentChapterCategory === 'malware' ||
                 (typeof activeCategoryStory !== 'undefined' && activeCategoryStory === 'malware') ||
                 (typeof gameState !== 'undefined' && gameState.phase === 'malware'));

  const titleText = document.getElementById('imageviewer-title-text');
  if (titleText) titleText.textContent = `Photos — ${file.name}`;

  const imgEl = document.getElementById('imgviewer-display');
  const canvasEl = document.getElementById('photos-canvas');
  const imgSrc = file.mediaSrc || 'assets/Pictures/cat.png';

  // Check if we need to simulate the slow image loading
  // Slow loading happens in Chapter 2 Mission 1 before BM is terminated
  const shouldSimulateSlowLoad = isCh2 && window._ch2Mission &&
    (!window._ch2Mission.m1PictureViewed || (!window._ch2Mission.bmKilled && window._ch2Mission.currentMission === 1));

  if (shouldSimulateSlowLoad) {
    if (imgEl) {
      imgEl.style.display = 'none';
      imgEl.src = imgSrc;
    }
    // Show spinner overlay
    let overlay = document.getElementById('photos-slow-loading-overlay');
    if (!overlay && canvasEl) {
      overlay = document.createElement('div');
      overlay.id = 'photos-slow-loading-overlay';
      overlay.style.cssText = 'position:absolute;inset:0;background:rgba(15,23,42,0.85);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:20;color:#f8fafc;font-family:system-ui,sans-serif;';
      overlay.innerHTML = `
        <div style="width:40px;height:40px;border:3px solid rgba(56,189,248,0.25);border-top-color:#38bdf8;border-radius:50%;animation:photosSpinner 0.8s linear infinite;margin-bottom:12px;"></div>
        <div style="font-weight:600;font-size:14px;color:#f1f5f9;">Loading high-resolution picture...</div>
        <div style="font-size:12px;color:#94a3b8;margin-top:4px;">High CPU load &middot; System running slower than usual</div>
      `;
      if (!document.getElementById('photos-spinner-style')) {
        const style = document.createElement('style');
        style.id = 'photos-spinner-style';
        style.textContent = `@keyframes photosSpinner { to { transform: rotate(360deg); } }`;
        document.head.appendChild(style);
      }
      canvasEl.style.position = 'relative';
      canvasEl.appendChild(overlay);
    }
    if (overlay) overlay.style.display = 'flex';

    setTimeout(() => {
      if (overlay) overlay.style.display = 'none';
      if (imgEl) {
        imgEl.style.display = 'block';
        imgViewerScale = 1;
        imgViewerRotation = 0;
        imgEl.style.transform = `scale(${imgViewerScale}) rotate(${imgViewerRotation}deg)`;
      }
      if (typeof window.ch2OnPictureViewed === 'function') {
        window.ch2OnPictureViewed(file);
      }
    }, 2200);
  } else {
    // Normal / Fast load (Mission 4+ or other chapters)
    const overlay = document.getElementById('photos-slow-loading-overlay');
    if (overlay) overlay.style.display = 'none';
    if (imgEl) {
      imgEl.style.display = 'block';
      imgEl.src = imgSrc;
      imgViewerScale = 1;
      imgViewerRotation = 0;
      imgEl.style.transform = `scale(${imgViewerScale}) rotate(${imgViewerRotation}deg)`;
    }
    if (isCh2 && window._ch2Mission && (window._ch2Mission.bmKilled || window._ch2Mission.currentMission >= 4)) {
      if (typeof window.ch2OnPictureViewedAgain === 'function') {
        window.ch2OnPictureViewedAgain(file);
      }
    }
  }

  // Populate Info Drawer
  const infoList = document.getElementById('pinfo-list');
  if (infoList) {
    const isPng = file.realExt === 'png' || (file.name && file.name.endsWith('.png'));
    const integrityLabel = isPng ? '✓ Clean PNG Structure (Safe)' : '✓ Clean JFIF/EXIF Header';
    const dimText = file.dimensions || '1024 × 1024 px';
    const camText = file.camera || (isPng ? 'iPhone 15 Pro' : 'Sony Alpha 7 IV (35mm, f/2.8)');

    infoList.innerHTML = `
      <div class="pinfo-row">
        <span class="pinfo-label">File Name</span>
        <span class="pinfo-val">${file.name}</span>
      </div>
      <div class="pinfo-row">
        <span class="pinfo-label">Dimensions</span>
        <span class="pinfo-val">${dimText}</span>
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
        <span class="pinfo-val">${camText}</span>
      </div>
      <div class="pinfo-row">
        <span class="pinfo-label">Integrity</span>
        <span class="pinfo-val" style="color:#00e676">${integrityLabel}</span>
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
