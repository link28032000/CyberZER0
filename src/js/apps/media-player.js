'use strict';

// ─── 3. MEDIA / VIDEO PLAYER ────────────────────────────────
function openVideoPlayer(file) {
  const titleText = document.getElementById('videoplayer-title-text');
  if (titleText) titleText.textContent = `Media Player — ${file.name}`;

  const audioStage = document.getElementById('vp-audio-stage');
  if (audioStage) {
    audioStage.classList.remove('vp-audio-playing');
    audioStage.classList.add('hidden');
  }

  const vid = document.getElementById('videoplayer-video');
  if (vid) {
    vid.style.display = 'block';
    vid.src = file.mediaSrc || 'assets/video/video3.mp4';
    vid.currentTime = 0;
    syncMediaPlayerVolume();

    // Wire up events once
    if (!vid._vpWired) {
      vid._vpWired = true;
      vid.addEventListener('loadedmetadata', () => {
        if (typeof window._ch1OnVideoMetadataLoaded === 'function') {
          window._ch1OnVideoMetadataLoaded(vid);
        }
      });
      vid.addEventListener('timeupdate', _vpOnTimeUpdate);
      vid.addEventListener('ended', _vpOnEnded);
      vid.addEventListener('play', () => {
        const btn = document.getElementById('vp-play-btn');
        if (btn) btn.textContent = '⏸';
        document.getElementById('vp-center-overlay')?.classList.add('hidden');
        document.getElementById('vp-audio-stage')?.classList.add('vp-audio-playing');
      });
      vid.addEventListener('pause', () => {
        const btn = document.getElementById('vp-play-btn');
        if (btn) btn.textContent = '▶';
        document.getElementById('vp-center-overlay')?.classList.remove('hidden');
        document.getElementById('vp-audio-stage')?.classList.remove('vp-audio-playing');
      });
    }

    vid.play().catch(() => {});
  }

  openApp('videoplayer');
  focusWindow('videoplayer');

  const isCh1 = (window._currentChapterCategory || (typeof activeCategoryStory !== 'undefined' ? activeCategoryStory : null) || (typeof gameState !== 'undefined' ? gameState.phase : null) || 'phishing') === 'phishing';
  if (!isCh1 && typeof window._notifyPostAwardVideoPlay === 'function') {
    window._notifyPostAwardVideoPlay();
  }
  showToast(`🎬 Playing "${file.name}" in Media Player.`, 'success');
}

// ─── 4. MEDIA / AUDIO PLAYER (MP3 & MUSIC FILES) ────────────
function openAudioPlayer(file) {
  const titleText = document.getElementById('videoplayer-title-text');
  if (titleText) titleText.textContent = `Media Player — ${file.name}`;

  const vid = document.getElementById('videoplayer-video');
  const audioStage = document.getElementById('vp-audio-stage');
  const trackTitle = document.getElementById('vp-audio-track-title');
  const artistName = document.getElementById('vp-audio-artist-name');

  if (audioStage) {
    audioStage.classList.remove('hidden');
  }
  if (trackTitle) trackTitle.textContent = file.name;
  if (artistName) artistName.textContent = file.artist || 'CyberZero Audio Deck • 320 kbps MP3';

  if (vid) {
    vid.style.display = 'none';
    vid.src = file.mediaSrc || 'assets/sounds/Hi - Wii.mp3';
    vid.currentTime = 0;
    syncMediaPlayerVolume();

    if (!vid._vpWired) {
      vid._vpWired = true;
      vid.addEventListener('timeupdate', _vpOnTimeUpdate);
      vid.addEventListener('ended', _vpOnEnded);
      vid.addEventListener('play', () => {
        const btn = document.getElementById('vp-play-btn');
        if (btn) btn.textContent = '⏸';
        document.getElementById('vp-center-overlay')?.classList.add('hidden');
        document.getElementById('vp-audio-stage')?.classList.add('vp-audio-playing');
      });
      vid.addEventListener('pause', () => {
        const btn = document.getElementById('vp-play-btn');
        if (btn) btn.textContent = '▶';
        document.getElementById('vp-center-overlay')?.classList.remove('hidden');
        document.getElementById('vp-audio-stage')?.classList.remove('vp-audio-playing');
      });
    }

    vid.play().catch(() => {
      // Autoplay with user gesture
    });
  }

  openApp('videoplayer');
  focusWindow('videoplayer');
  showToast(`🎵 Playing "${file.name}" in Media Player.`, 'success');
}

function vpTogglePlay() {
  const vid = document.getElementById('videoplayer-video');
  if (!vid) return;
  if (vid.paused || vid.ended) {
    vid.play().catch(() => {});
  } else {
    vid.pause();
  }
}

function vpSkip(secs) {
  const vid = document.getElementById('videoplayer-video');
  if (!vid) return;
  if (typeof window._ch1OnVideoSkip === 'function') {
    window._ch1OnVideoSkip(secs, vid);
  }
  vid.currentTime = Math.max(0, Math.min(vid.duration || 0, vid.currentTime + secs));
}

function vpSeek(e) {
  const vid = document.getElementById('videoplayer-video');
  if (!vid || !vid.duration) return;
  const container = document.getElementById('vp-progress-container');
  if (!container) return;
  const rect = container.getBoundingClientRect();
  const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  const newTime = pct * vid.duration;
  if (typeof window._ch1OnVideoSeek === 'function') {
    window._ch1OnVideoSeek(newTime, vid.currentTime, vid);
  }
  vid.currentTime = newTime;
}

function _vpOnTimeUpdate() {
  const vid = document.getElementById('videoplayer-video');
  if (!vid) return;
  const cur = vid.currentTime;
  const dur = vid.duration || 0;

  const fmtCur = typeof _avFmtTime === 'function' ? _avFmtTime(cur) : `${Math.floor(cur/60)}:${String(Math.floor(cur%60)).padStart(2,'0')}`;
  const fmtDur = typeof _avFmtTime === 'function' ? _avFmtTime(dur) : `${Math.floor(dur/60)}:${String(Math.floor(dur%60)).padStart(2,'0')}`;

  const timeEl = document.getElementById('vp-time-display');
  if (timeEl) timeEl.textContent = `${fmtCur} / ${fmtDur}`;

  const pct = dur > 0 ? (cur / dur) * 100 : 0;
  const fillEl = document.getElementById('vp-progress-fill');
  const thumbEl = document.getElementById('vp-progress-thumb');
  if (fillEl) fillEl.style.width = `${pct}%`;
  if (thumbEl) thumbEl.style.left = `${pct}%`;

  if (typeof window._ch1OnVideoTimeUpdate === 'function') {
    window._ch1OnVideoTimeUpdate(vid);
  }
}

function _vpOnEnded() {
  const btn = document.getElementById('vp-play-btn');
  if (btn) btn.textContent = '▶';
  document.getElementById('vp-center-overlay')?.classList.remove('hidden');
  if (typeof window._ch1OnVideoEnded === 'function') {
    const vid = document.getElementById('videoplayer-video');
    window._ch1OnVideoEnded(vid);
  }
}

function vpToggleMute() {
  if (typeof toggleMasterMute === 'function') {
    toggleMasterMute();
  } else {
    const vid = document.getElementById('videoplayer-video');
    if (!vid) return;
    vid.muted = !vid.muted;
    const btn = document.getElementById('vp-mute-btn');
    if (btn) btn.textContent = vid.muted ? '🔇' : '🔊';
  }
}

function vpSetVolume(val) {
  const vid = document.getElementById('videoplayer-video');
  const floatVal = parseFloat(val);
  const masterVal = Math.round(floatVal * 100);

  if (vid) {
    vid.volume = floatVal;
    vid.muted = (floatVal === 0);
  }
  const btn = document.getElementById('vp-mute-btn');
  if (btn) btn.textContent = floatVal === 0 ? '🔇' : (masterVal < 50 ? '🔉' : '🔊');

  // Synchronize with system Master Volume
  if (typeof AudioManager !== 'undefined' && AudioManager.settings) {
    AudioManager.settings.masterVolume = masterVal;
    if (AudioManager.settings.masterMuted && masterVal > 0) {
      AudioManager.settings.masterMuted = false;
    }
    AudioManager.saveSettings();
    updateVolumeUI();
  }
}

function syncMediaPlayerVolume() {
  const vid = document.getElementById('videoplayer-video');
  const vpSlider = document.getElementById('vp-volume-slider');
  const vpMuteBtn = document.getElementById('vp-mute-btn');
  const s = (typeof AudioManager !== 'undefined' && AudioManager.settings) ? AudioManager.settings : null;
  if (!s) return;

  const isMuted = s.masterMuted || s.masterVolume === 0;
  const volFraction = s.masterVolume / 100;

  if (vid) {
    vid.volume = volFraction;
    vid.muted = s.masterMuted;
  }
  if (vpSlider) {
    vpSlider.value = s.masterMuted ? 0 : volFraction;
  }
  if (vpMuteBtn) {
    vpMuteBtn.textContent = isMuted ? '🔇' : (s.masterVolume < 50 ? '🔉' : '🔊');
  }
}

function vpSetSpeed(speed) {
  const vid = document.getElementById('videoplayer-video');
  if (vid) vid.playbackRate = parseFloat(speed);
}

let _vpIsFullscreen = false;
let _vpHideTimer = null;
let _vpLastClickTime = 0;

function vpOnStageClick(e) {
  const now = Date.now();
  if (now - _vpLastClickTime < 320) {
    _vpLastClickTime = 0;
    vpToggleFullscreen();
    return;
  }
  _vpLastClickTime = now;
  vpTogglePlay();
}

function vpToggleFullscreen() {
  if (_vpIsFullscreen) {
    vpExitFullscreen();
  } else {
    vpEnterFullscreen();
  }
}

function vpEnterFullscreen() {
  const win = document.getElementById('win-videoplayer');
  if (!win) return;

  _vpIsFullscreen = true;
  win.classList.add('vp-fullscreen-mode');

  // Save inline position/bounds to restore accurately later
  win.dataset.savedInlineLeft = win.style.left || '';
  win.dataset.savedInlineTop = win.style.top || '';
  win.dataset.savedInlineWidth = win.style.width || '';
  win.dataset.savedInlineHeight = win.style.height || '';

  // Update button icon & tooltip
  const btn = document.getElementById('vp-fullscreen-btn');
  if (btn) {
    btn.innerHTML = '🗗';
    btn.title = 'Exit Fullscreen (Esc)';
    btn.classList.add('active');
  }

  // Setup auto-hiding controls during playback
  win.addEventListener('mousemove', _vpOnMouseMove);
  win.addEventListener('mouseenter', _vpOnMouseMove);
  document.addEventListener('keydown', _vpOnKeyDown, true);

  _vpResetControlsTimer();
}

function vpExitFullscreen() {
  const win = document.getElementById('win-videoplayer');
  if (!win) return;

  _vpIsFullscreen = false;
  win.classList.remove('vp-fullscreen-mode', 'vp-controls-hidden');

  if (_vpHideTimer) {
    clearTimeout(_vpHideTimer);
    _vpHideTimer = null;
  }

  win.removeEventListener('mousemove', _vpOnMouseMove);
  win.removeEventListener('mouseenter', _vpOnMouseMove);
  document.removeEventListener('keydown', _vpOnKeyDown, true);

  // Restore inline styles if saved
  if (win.dataset.savedInlineLeft !== undefined) {
    win.style.left = win.dataset.savedInlineLeft;
    win.style.top = win.dataset.savedInlineTop;
    win.style.width = win.dataset.savedInlineWidth;
    win.style.height = win.dataset.savedInlineHeight;
    delete win.dataset.savedInlineLeft;
    delete win.dataset.savedInlineTop;
    delete win.dataset.savedInlineWidth;
    delete win.dataset.savedInlineHeight;
  }

  // Update button icon & tooltip
  const btn = document.getElementById('vp-fullscreen-btn');
  if (btn) {
    btn.innerHTML = '⛶';
    btn.title = 'Fullscreen';
    btn.classList.remove('active');
  }

  // Re-center window to keep layout clean
  if (typeof centerWindow === 'function') {
    centerWindow('videoplayer');
  }
}

function _vpOnMouseMove() {
  if (!_vpIsFullscreen) return;
  const win = document.getElementById('win-videoplayer');
  if (!win) return;

  win.classList.remove('vp-controls-hidden');
  _vpResetControlsTimer();
}

function _vpResetControlsTimer() {
  if (_vpHideTimer) {
    clearTimeout(_vpHideTimer);
    _vpHideTimer = null;
  }
  if (!_vpIsFullscreen) return;

  const vid = document.getElementById('videoplayer-video');
  if (vid && !vid.paused && !vid.ended) {
    _vpHideTimer = setTimeout(() => {
      const win = document.getElementById('win-videoplayer');
      if (win && _vpIsFullscreen) {
        win.classList.add('vp-controls-hidden');
      }
    }, 2500);
  }
}

function _vpOnKeyDown(e) {
  if (!_vpIsFullscreen) return;
  if (e.key === 'Escape') {
    e.preventDefault();
    e.stopPropagation();
    vpExitFullscreen();
  }
}

window.vpOnStageClick = vpOnStageClick;
window.vpToggleFullscreen = vpToggleFullscreen;
window.vpEnterFullscreen = vpEnterFullscreen;
window.vpExitFullscreen = vpExitFullscreen;
window.isVpFullscreen = () => _vpIsFullscreen;

function scanCurrentVideoInAV() {
  if (gameState.selectedFolderFileId) {
    scanFileInAntivirus(gameState.selectedFolderFileId);
  } else {
    showToast('Video file verified clean by ShieldAV.', 'success');
  }
}
