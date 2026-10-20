'use strict';

// ── REAL VIDEO AWARENESS CONTROLLER ──────────────────────────

function _avGetVideo() {
  return document.getElementById('awareness-real-video');
}

function startAwarenessVideo() {
  hideAllOverlays();
  const ov = document.getElementById('overlay-awareness-video');
  if (ov) {
    ov.classList.remove('hidden');
    ov.classList.add('active');
  }

  const vid = _avGetVideo();
  if (!vid) return;

  // Reset finished overlay
  const finEl = document.getElementById('av-finished-overlay');
  if (finEl) finEl.classList.add('hidden');

  // Wire up events once
  if (!vid._avWired) {
    vid._avWired = true;

    vid.addEventListener('timeupdate', _avOnTimeUpdate);
    vid.addEventListener('ended', _avOnEnded);
    vid.addEventListener('play', () => {
      const btn = document.getElementById('av-play-btn');
      if (btn) btn.textContent = '⏸';
    });
    vid.addEventListener('pause', () => {
      const btn = document.getElementById('av-play-btn');
      if (btn) btn.textContent = '▶';
    });
  }

  vid.currentTime = 0;
  vid.volume = 1;
  vid.play().catch(() => {});
}

function _avFmtTime(s) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, '0')}`;
}

function _avOnTimeUpdate() {
  const vid = _avGetVideo();
  if (!vid) return;
  const cur = vid.currentTime;
  const dur = vid.duration || 0;

  const timeEl = document.getElementById('av-time');
  if (timeEl) timeEl.textContent = `${_avFmtTime(cur)} / ${_avFmtTime(dur)}`;

  const pct = dur > 0 ? (cur / dur) * 100 : 0;
  const fillEl = document.getElementById('av-video-progress-fill');
  if (fillEl) fillEl.style.width = `${pct}%`;
  const thumbEl = document.getElementById('av-progress-thumb');
  if (thumbEl) thumbEl.style.left = `${pct}%`;
}

function _avOnEnded() {
  const finEl = document.getElementById('av-finished-overlay');
  if (finEl) finEl.classList.remove('hidden');
  const btn = document.getElementById('av-play-btn');
  if (btn) btn.textContent = '▶';
}

function avTogglePlay() {
  const vid = _avGetVideo();
  if (!vid) return;
  if (vid.paused || vid.ended) { vid.play().catch(() => {}); }
  else { vid.pause(); }
}

function avSeek(e) {
  const vid = _avGetVideo();
  if (!vid || !vid.duration) return;
  const bar = document.getElementById('av-progress-bar');
  if (!bar) return;
  const rect = bar.getBoundingClientRect();
  const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  vid.currentTime = pct * vid.duration;
}

function avToggleMute() {
  const vid = _avGetVideo();
  if (!vid) return;
  vid.muted = !vid.muted;
  const btn = document.getElementById('av-mute-btn');
  if (btn) btn.textContent = vid.muted ? '🔇' : '🔊';
}

function avSetVolume(val) {
  const vid = _avGetVideo();
  if (!vid) return;
  vid.volume = parseFloat(val);
  vid.muted = false;
  const btn = document.getElementById('av-mute-btn');
  if (btn) btn.textContent = vid.volume === 0 ? '🔇' : '🔊';
}

function closeAwarenessVideo() {
  const vid = _avGetVideo();
  if (vid) { vid.pause(); vid.currentTime = 0; }
  const ov = document.getElementById('overlay-awareness-video');
  if (ov) { ov.classList.add('hidden'); ov.classList.remove('active'); }
}

function skipAwarenessVideo() {
  const vid = _avGetVideo();
  if (vid) { vid.pause(); }
  const ov = document.getElementById('overlay-awareness-video');
  if (ov) { ov.classList.add('hidden'); ov.classList.remove('active'); }
  startGroup4Mission();
}
