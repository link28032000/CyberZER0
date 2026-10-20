'use strict';


function onMasterVolumeInput(val) {
  const num = parseInt(val, 10);
  AudioManager.settings.masterVolume = num;
  if (AudioManager.settings.masterMuted && num > 0) {
    AudioManager.settings.masterMuted = false;
  }
  AudioManager.saveSettings();
  updateVolumeUI();
  AudioManager.playSliderTick();
}

function onClicksVolumeInput(val) {
  const num = parseInt(val, 10);
  AudioManager.settings.clicksVolume = num;
  if (AudioManager.settings.clicksMuted && num > 0) {
    AudioManager.settings.clicksMuted = false;
  }
  AudioManager.saveSettings();
  updateVolumeUI();
  AudioManager.playMouseClick();
}

function onSfxVolumeInput(val) {
  const num = parseInt(val, 10);
  AudioManager.settings.sfxVolume = num;
  if (AudioManager.settings.sfxMuted && num > 0) {
    AudioManager.settings.sfxMuted = false;
  }
  AudioManager.saveSettings();
  updateVolumeUI();
  AudioManager.playSliderTick();
}

function toggleMasterMute() {
  AudioManager.settings.masterMuted = !AudioManager.settings.masterMuted;
  AudioManager.saveSettings();
  updateVolumeUI();
  if (!AudioManager.settings.masterMuted) {
    AudioManager.playMouseClick();
  }
}

function toggleClicksMute() {
  AudioManager.settings.clicksMuted = !AudioManager.settings.clicksMuted;
  AudioManager.saveSettings();
  updateVolumeUI();
  if (!AudioManager.settings.clicksMuted) {
    AudioManager.playMouseClick();
  }
}

function toggleSfxMute() {
  AudioManager.settings.sfxMuted = !AudioManager.settings.sfxMuted;
  AudioManager.saveSettings();
  updateVolumeUI();
  if (!AudioManager.settings.sfxMuted) {
    AudioManager.playChime(true);
  }
}

function onTypingVolumeInput(val) {
  const num = parseInt(val, 10);
  AudioManager.settings.typingVolume = num;
  if (AudioManager.settings.typingMuted && num > 0) {
    AudioManager.settings.typingMuted = false;
  }
  AudioManager.saveSettings();
  updateVolumeUI();
  AudioManager.playTypingKey();
}

function toggleTypingMute() {
  AudioManager.settings.typingMuted = !AudioManager.settings.typingMuted;
  AudioManager.saveSettings();
  updateVolumeUI();
  if (!AudioManager.settings.typingMuted) {
    AudioManager.playTypingKey();
  }
}

function testMouseClickSound() {
  AudioManager.unlock();
  AudioManager.playMouseClick();
}

function testChimeSound() {
  AudioManager.unlock();
  AudioManager.playChime(true);
}

function testTypingSound() {
  AudioManager.unlock();
  AudioManager.playTypingKey();
}

function testCorrectSound() {
  AudioManager.unlock();
  AudioManager.playCorrect();
}

function testWrongSound() {
  AudioManager.unlock();
  AudioManager.playWrong();
}

function testMissionCompleteSound() {
  AudioManager.unlock();
  AudioManager.playMissionComplete();
}
