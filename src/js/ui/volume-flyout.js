'use strict';

// ═══════════════════════════════════════════════════════════
// DESKTOP VOLUME FLYOUT CONTROLS
// ═══════════════════════════════════════════════════════════

function getVolumeSpeakerIcon(volume, isMuted) {
  if (isMuted || volume === 0) return '🔇';
  if (volume < 25) return '🔈';
  if (volume <= 60) return '🔉';
  return '🔊';
}

function updateVolumeUI() {
  const s = AudioManager.settings;
  const masterIcon = getVolumeSpeakerIcon(s.masterVolume, s.masterMuted);

  // Sliders
  const masterSlider = document.getElementById('slider-master-volume');
  const clicksSlider = document.getElementById('slider-clicks-volume');
  const sfxSlider = document.getElementById('slider-sfx-volume');

  if (masterSlider) {
    masterSlider.value = s.masterVolume;
    masterSlider.style.setProperty('--fill-pct', `${s.masterVolume}%`);
  }
  if (clicksSlider) {
    clicksSlider.value = s.clicksVolume;
    clicksSlider.style.setProperty('--fill-pct', `${s.clicksVolume}%`);
  }
  if (sfxSlider) {
    sfxSlider.value = s.sfxVolume;
    sfxSlider.style.setProperty('--fill-pct', `${s.sfxVolume}%`);
  }
  const typingSlider = document.getElementById('slider-typing-volume');
  if (typingSlider) {
    typingSlider.value = s.typingVolume;
    typingSlider.style.setProperty('--fill-pct', `${s.typingVolume}%`);
  }

  // Numeric text
  const masterVal = document.getElementById('volume-master-val');
  const clicksVal = document.getElementById('volume-clicks-val');
  const sfxVal = document.getElementById('volume-sfx-val');
  const typingVal = document.getElementById('volume-typing-val');

  if (masterVal) masterVal.textContent = s.masterMuted ? 'Muted' : `${s.masterVolume}%`;
  if (clicksVal) clicksVal.textContent = s.clicksMuted ? 'Muted' : `${s.clicksVolume}%`;
  if (sfxVal) sfxVal.textContent = s.sfxMuted ? 'Muted' : `${s.sfxVolume}%`;
  if (typingVal) typingVal.textContent = s.typingMuted ? 'Muted' : `${s.typingVolume}%`;

  // Master mute icon and tray icons
  const muteMasterIcon = document.getElementById('mute-master-icon');
  const trayVolIcon = document.getElementById('tray-volume-icon');
  const flyoutHeaderIcon = document.getElementById('flyout-header-icon');
  const masterMuteBtn = document.getElementById('btn-master-mute');

  if (muteMasterIcon) muteMasterIcon.textContent = masterIcon;
  // Keep SVG img in tray — only apply muted visual state via CSS class
  if (trayVolIcon) {
    const isMuted = s.masterMuted || s.masterVolume === 0;
    const soundSrc = isMuted ? 'assets/icons/networks/no_audio.svg' : 'assets/icons/networks/audio.svg';
    trayVolIcon.innerHTML = `<img src="${soundSrc}" alt="${isMuted ? 'No Audio' : 'Sound'}" class="taskbar-icon-img" style="width:18px;height:18px;vertical-align:middle;">`;
  }
  if (flyoutHeaderIcon) flyoutHeaderIcon.textContent = masterIcon;

  // Close volume flyout and start menu when clicking outside
  document.addEventListener('click', (e) => {
    const flyout = document.getElementById('desktop-volume-flyout');
    const trayBtn = document.getElementById('tray-volume-btn');
    if (flyout && !flyout.contains(e.target) && trayBtn && !trayBtn.contains(e.target)) {
      closeVolumeFlyout();
    }

    const startMenu = document.getElementById('desktop-start-menu');
    const startBtn = document.getElementById('start-btn');
    if (startMenu && !startMenu.contains(e.target) && startBtn && !startBtn.contains(e.target)) {
      closeStartMenu();
    }
  });

  if (masterMuteBtn) {
    if (s.masterMuted || s.masterVolume === 0) masterMuteBtn.classList.add('muted');
    else masterMuteBtn.classList.remove('muted');
  }

  // Clicks mute button
  const clicksMuteBtn = document.getElementById('btn-clicks-mute');
  const clicksMuteIcon = document.getElementById('mute-clicks-icon');
  if (clicksMuteBtn) {
    if (s.clicksMuted) {
      clicksMuteBtn.classList.add('muted');
      if (clicksMuteIcon) clicksMuteIcon.textContent = '🔇';
    } else {
      clicksMuteBtn.classList.remove('muted');
      if (clicksMuteIcon) clicksMuteIcon.textContent = '🖱️';
    }
  }

  // SFX mute button
  const sfxMuteBtn = document.getElementById('btn-sfx-mute');
  const sfxMuteIcon = document.getElementById('mute-sfx-icon');
  if (sfxMuteBtn) {
    if (s.sfxMuted) {
      sfxMuteBtn.classList.add('muted');
      if (sfxMuteIcon) sfxMuteIcon.textContent = '🔇';
    } else {
      sfxMuteBtn.classList.remove('muted');
      if (sfxMuteIcon) sfxMuteIcon.textContent = '⚡';
    }
  }

  // Typing mute button
  const typingMuteBtn = document.getElementById('btn-typing-mute');
  const typingMuteIcon = document.getElementById('mute-typing-icon');
  if (typingMuteBtn) {
    if (s.typingMuted) {
      typingMuteBtn.classList.add('muted');
      if (typingMuteIcon) typingMuteIcon.textContent = '🔇';
    } else {
      typingMuteBtn.classList.remove('muted');
      if (typingMuteIcon) typingMuteIcon.textContent = '⌨️';
    }
  }

  // Update tray button tooltip
  const trayBtn = document.getElementById('tray-volume-btn');
  if (trayBtn) {
    trayBtn.title = s.masterMuted ? 'Sound (Muted)' : `Sound (${s.masterVolume}%)`;
  }

  // Live sync Media Player volume
  syncMediaPlayerVolume();
}

function toggleVolumeFlyout(event) {
  if (event) event.stopPropagation();
  AudioManager.unlock();
  const flyout = document.getElementById('desktop-volume-flyout');
  const trayBtn = document.getElementById('tray-volume-btn');
  if (!flyout) return;

  const isHidden = flyout.classList.contains('hidden');

  if (isHidden) {
    closeNetworkFlyout();
    closeCalendarFlyout();
    const startMenu = document.getElementById('desktop-start-menu');
    if (startMenu && !startMenu.classList.contains('hidden')) toggleStartMenu();

    flyout.classList.remove('flyout-global', 'hidden');
    if (trayBtn) trayBtn.classList.add('active');
    updateVolumeUI();
    AudioManager.playMouseClick();
  } else {
    closeVolumeFlyout();
  }
}

function closeVolumeFlyout(event) {
  if (event) event.stopPropagation();
  const flyout = document.getElementById('desktop-volume-flyout');
  const trayBtn = document.getElementById('tray-volume-btn');
  if (flyout) flyout.classList.add('hidden');
  if (trayBtn) trayBtn.classList.remove('active');
}
