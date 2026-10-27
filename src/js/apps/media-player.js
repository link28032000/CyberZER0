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
  if (typeof window._notifyPostAwardVideoPlay === 'function') {
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
  vid.currentTime = Math.max(0, Math.min(vid.duration || 0, vid.currentTime + secs));
}

function vpSeek(e) {
  const vid = document.getElementById('videoplayer-video');
  if (!vid || !vid.duration) return;
  const container = document.getElementById('vp-progress-container');
  if (!container) return;
  const rect = container.getBoundingClientRect();
  const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  vid.currentTime = pct * vid.duration;
}

function _vpOnTimeUpdate() {
  const vid = document.getElementById('videoplayer-video');
  if (!vid) return;
  const cur = vid.currentTime;
  const dur = vid.duration || 0;

  const timeEl = document.getElementById('vp-time-display');
  if (timeEl) timeEl.textContent = `${_avFmtTime(cur)} / ${_avFmtTime(dur)}`;

  const pct = dur > 0 ? (cur / dur) * 100 : 0;
  const fillEl = document.getElementById('vp-progress-fill');
  const thumbEl = document.getElementById('vp-progress-thumb');
  if (fillEl) fillEl.style.width = `${pct}%`;
  if (thumbEl) thumbEl.style.left = `${pct}%`;
}

function _vpOnEnded() {
  const btn = document.getElementById('vp-play-btn');
  if (btn) btn.textContent = '▶';
  document.getElementById('vp-center-overlay')?.classList.remove('hidden');
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

function vpToggleFullscreen() {
  const stage = document.getElementById('vp-stage');
  if (!stage) return;
  if (!document.fullscreenElement) {
    stage.requestFullscreen().catch(() => {});
  } else {
    document.exitFullscreen().catch(() => {});
  }
}

function scanCurrentVideoInAV() {
  if (gameState.selectedFolderFileId) {
    scanFileInAntivirus(gameState.selectedFolderFileId);
  } else {
    showToast('Video file verified clean by ShieldAV.', 'success');
  }
}
