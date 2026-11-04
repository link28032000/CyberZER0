'use strict';

// ═══════════════════════════════════════════════════════════
// VISUAL NOVEL ENGINE — Stubbed (scenes removed, flow preserved)
// All VN cutscenes are skipped; game flow callbacks still fire.
// ═══════════════════════════════════════════════════════════

function playCategoryStory(categoryId) {
  activeCategoryStory = categoryId;

  if (categoryId === 'malware') {
    hideAllOverlays();
    if (typeof startMalwareChapter === 'function') {
      startMalwareChapter();
    } else {
      openChapterDesktopDirect('malware');
    }
    return;
  }

  // Skip directly to next game step without showing any VN scenes
  hideAllOverlays();
  _vnResolve(categoryId);
}

function vnInit()    { /* no-op — scenes removed */ }
function vnAdvance() { /* no-op — scenes removed */ }
function vnSkip()    { /* no-op — scenes removed */ }

function vnFinish() {
  _vnResolve(typeof activeCategoryStory !== 'undefined' ? activeCategoryStory : '');
}

function _vnResolve(categoryId) {
  if (categoryId === 'prologue') {
    if (typeof proceedFromIntroToExam === 'function') proceedFromIntroToExam();
  } else if (categoryId === 'phishing') {
    if (typeof showComicStrip === 'function') showComicStrip();
    else if (typeof startMission === 'function') startMission();
  } else if (categoryId === 'social_engineering') {
    if (typeof showComicStripCh3 === 'function') showComicStripCh3();
    else if (typeof openChapterDesktopDirect === 'function') openChapterDesktopDirect('social_engineering');
  } else if (categoryId === 'ransomware') {
    if (typeof showComicStripCh4 === 'function') showComicStripCh4();
    else if (typeof openChapterDesktopDirect === 'function') openChapterDesktopDirect('ransomware');
  } else if (categoryId === 'grand_finale') {
    if (typeof showGrandCertificate === 'function') showGrandCertificate();
  } else {
    if (typeof openCategoryHub === 'function') openCategoryHub();
  }
}
