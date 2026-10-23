'use strict';

// ═══════════════════════════════════════════════════════════
// VISUAL NOVEL INTRO & CHAPTER STORY ENGINE
// ═══════════════════════════════════════════════════════════

const VN_CHARACTER_MAP = {
  'NARRATOR':    null,
  'CYBERZERO':   'assets/CyberZerØ.png',
  'ZERO':        'assets/CyberZerØ.png',
  'AI GUIDE ZERO':'assets/CyberZerØ.png',
  'SYSTEM':      null,
  'ALEX':        null,
  'IT SUPPORT':  null,
};

const VN_STORIES = {
  prologue: [
    {
      speaker: 'ZERO',
      tag: '🤖 AI SECURITY GUIDE',
      bg: 'assets/Cover.png',
      text: 'Greetings, Trainee. Welcome to CYBERZERØ: THE LAST LOGIN — a realistic cybersecurity desktop simulation where you will investigate real-world digital threats from inside a simulated computer.',
      speed: 24,
      scene: 'story'
    },
    {
      speaker: 'ZERO',
      tag: '🤖 AI SECURITY GUIDE',
      bg: 'assets/Cover.png',
      text: 'I am CyberZerØ — your AI Security Guide. I will assist you as you investigate cybersecurity incidents, examine digital evidence, and make decisions that protect the school and its students.',
      speed: 24,
      scene: 'story'
    },
    {
      speaker: 'ZERO',
      tag: '🤖 AI SECURITY GUIDE',
      bg: 'assets/Cover.png',
      text: 'You are Alex — an IT support trainee at a local school. One morning, the incidents begin. A student clicked a suspicious email. Their account may be compromised. Your investigation starts now.',
      speed: 24,
      scene: 'story'
    },
    {
      speaker: 'ZERO',
      tag: '🤖 AI SECURITY GUIDE',
      bg: 'assets/Cover.png',
      text: 'Your simulated desktop contains everything you need: Email, Browser, File Explorer, Anti-Virus, Messages, and the Activity Log. Each application is part of the investigation.',
      speed: 24,
      scene: 'story'
    },
    {
      speaker: 'ZERO',
      tag: '🤖 AI SECURITY GUIDE',
      bg: 'assets/Cover.png',
      text: 'The story unfolds through the desktop — new emails arrive, files appear in Downloads, notifications warn you of threats, and your decisions shape the outcome of each incident.',
      speed: 24,
      scene: 'story'
    },
    {
      speaker: 'ZERO',
      tag: '🤖 AI SECURITY GUIDE',
      bg: 'assets/Cover.png',
      text: 'Four chapters. Twelve incidents. One final report. Every threat has a story. Every decision matters. Every person deserves digital protection.\n\nTrainee — are you ready to begin?',
      speed: 24,
      scene: 'story'
    }
  ],

  phishing: [
    {
      speaker: 'NARRATOR',
      text: 'CHAPTER 1: THE FIRST DAY\n\nMonday, 7:48 AM. Alex, IT Support Trainee, logs in to start the week. A support request is already waiting.',
      speed: 26,
      scene: 'story'
    },
    {
      speaker: 'SYSTEM',
      text: '📧 NEW SUPPORT REQUEST\nFrom: librarian@northfield.edu.ph\nSubject: Student reported clicking a suspicious email\n\n"Hi IT Support, a Grade 11 student came to me concerned. She clicked a link in an email claiming to offer a ₱50,000 scholarship. Her account may be compromised. Please investigate."',
      speed: 26,
      scene: 'story'
    },
    {
      speaker: 'ZERO',
      tag: '🤖 AI SECURITY GUIDE',
      bg: 'assets/Cover.png',
      text: 'Alex, open your Email application. A phishing email targeting students is in the inbox. Examine the sender address, check for false urgency, and identify any suspicious links.',
      speed: 24,
      scene: 'story'
    },
    {
      speaker: 'ZERO',
      tag: '🤖 AI SECURITY GUIDE',
      bg: 'assets/Cover.png',
      text: 'Remember: Phishing emails use fake sender domains, create panic with deadlines, and redirect victims to credential-harvesting websites. Use your detective tools — flag every piece of evidence you find.',
      speed: 24,
      scene: 'story'
    }
  ],

  malware: [],

  social_engineering: [
    {
      speaker: 'NARRATOR',
      text: 'CHAPTER 3: THE SYSTEM COLLAPSE\n\nA local business connected to the school reports that their files are locked. A ransom note appeared on their screen. The school network may also be affected.',
      speed: 26,
      scene: 'story',
      bg: 'assets/background/Coffe shop.png'
    },
    {
      speaker: 'SYSTEM',
      text: '🚨 SECURITY ALERT — HIGH PRIORITY\nFrom: IT Department\nSubject: Ransomware detected on school-connected business network\n\n"Files on the business server have been encrypted. A ransom note demands payment in cryptocurrency. Suspicious network traffic detected from inside the school building."',
      speed: 26,
      scene: 'story',
      bg: 'assets/background/Coffe shop.png'
    },
    {
      speaker: 'ZERO',
      tag: '🤖 AI SECURITY GUIDE',
      bg: 'assets/Cover.png',
      text: 'Before you proceed, review the incident context. A suspicious device connected to the school network may have introduced the ransomware. Open the Security Settings and investigate the network.',
      speed: 24,
      scene: 'story'
    }
  ],

  ransomware: [
    {
      speaker: 'NARRATOR',
      text: 'CHAPTER 4: THE LAST LOGIN\n\nMultiple incidents. One connected campaign. Alex must review all collected evidence, secure the remaining compromised accounts, and submit the final incident report.',
      speed: 26,
      scene: 'story'
    },
    {
      speaker: 'SYSTEM',
      text: '🚨 CRITICAL SECURITY NOTIFICATION\nFrom: School Principal\nSubject: Urgent — Student data may be exposed\n\n"We have received reports that student personal information from the school database may have been leaked. IT Support is required to investigate immediately and secure all affected systems."',
      speed: 26,
      scene: 'story'
    },
    {
      speaker: 'ZERO',
      tag: '🤖 AI SECURITY GUIDE',
      bg: 'assets/Cover.png',
      text: 'Alex, this is the final stage. Use everything you have learned. Investigate the breach using the Incident Console, isolate affected systems, restore secure access, and prepare the final incident report.',
      speed: 24,
      scene: 'story'
    },
    {
      speaker: 'ZERO',
      tag: '🤖 AI SECURITY GUIDE',
      bg: 'assets/Cover.png',
      text: 'Every threat in this investigation was connected. The scholarship phishing → stolen credentials → ransomware → data breach. Contain the final threat and close the case.',
      speed: 24,
      scene: 'story'
    }
  ],

  grand_finale: [
    {
      speaker: 'ZERO',
      tag: '🤖 AI SECURITY GUIDE',
      bg: 'assets/Cover.png',
      text: 'Investigation complete. All 12 incidents documented. The school network has been secured. Compromised accounts have been recovered. The final incident report has been submitted.',
      speed: 24,
      scene: 'story'
    },
    {
      speaker: 'ZERO',
      tag: '🤖 AI SECURITY GUIDE',
      bg: 'assets/Cover.png',
      text: 'You successfully traced a coordinated scam campaign — from a single suspicious email click, through malware, ransomware, and a data breach — and contained every threat.',
      speed: 24,
      scene: 'story'
    },
    {
      speaker: 'ZERO',
      tag: '🤖 AI SECURITY GUIDE',
      bg: 'assets/Cover.png',
      text: '"Every threat has a story. Every decision matters. Every person deserves digital protection."\n\nWell done, Alex. Your first assignment as IT Support is complete.',
      speed: 24,
      scene: 'story'
    }
  ]
};

let VN_DIALOGUE = VN_STORIES.phishing;

const vnState = {
  lineIndex: 0,
  charIndex: 0,
  typing: false,
  typingTimer: null,
  done: false
};

function playCategoryStory(categoryId) {
  if (categoryId === 'malware') {
    // Remove narration on Chapter 2: directly open clean Chapter 2 desktop
    hideAllOverlays();
    openChapterDesktopDirect('malware');
    return;
  }
  activeCategoryStory = categoryId;
  VN_DIALOGUE = VN_STORIES[categoryId] || VN_STORIES.phishing;
  hideAllOverlays();
  showOverlay('overlay-welcome');
  vnInit();
}

function vnInit() {
  vnSpawnParticles();
  vnState.lineIndex = 0;
  vnState.done = false;
  vnState.typing = false;
  if (vnState.typingTimer) clearTimeout(vnState.typingTimer);
  const bgBackdrop = document.getElementById('vn-bg-backdrop');
  if (bgBackdrop) {
    if (activeCategoryStory === 'prologue') {
      bgBackdrop.style.backgroundImage = "url('assets/Cover.png')";
    } else if (activeCategoryStory === 'social_engineering') {
      bgBackdrop.style.backgroundImage = "url('assets/background/Coffe shop.png')";
    } else {
      bgBackdrop.style.backgroundImage = "url('assets/01Cover.png')";
    }
  }
  const skipBtn = document.getElementById('vn-skip-btn');
  if (skipBtn) {
    if (activeCategoryStory === 'prologue') {
      skipBtn.textContent = 'Skip to Assessment ⏩';
      skipBtn.title = 'Skip the intro and start the Pre-Assessment Exam';
    } else {
      skipBtn.textContent = 'Skip ⏩';
      skipBtn.title = 'Skip dialogue';
    }
  }
  const vcallStage = document.getElementById('vn-videocall-stage');
  if (vcallStage) vcallStage.classList.add('hidden');
  const welcomeOv = document.getElementById('overlay-welcome');
  if (welcomeOv) welcomeOv.classList.remove('vn-mode-videocall');
  vnPlayLine(0);
}

function vnSpawnParticles() {
  const container = document.getElementById('vn-particles');
  if (!container) return;
  container.innerHTML = '';
  for (let i = 0; i < 28; i++) {
    const p = document.createElement('div');
    p.className = 'vn-particle';
    const size = 2 + Math.random() * 4;
    p.style.cssText = `
      left: ${Math.random() * 100}%;
      bottom: ${Math.random() * 30}%;
      width: ${size}px;
      height: ${size}px;
      animation-duration: ${5 + Math.random() * 12}s;
      animation-delay: ${Math.random() * 8}s;
    `;
    container.appendChild(p);
  }
}

function vnPlayLine(index) {
  const line = VN_DIALOGUE[index];
  if (!line) return;

  const textEl        = document.getElementById('vn-text');
  const cursorEl      = document.getElementById('vn-cursor');
  const speakerEl     = document.getElementById('vn-speaker-name');
  const hintEl        = document.getElementById('vn-advance-hint');
  const indEl         = document.getElementById('vn-line-indicator');
  const charEl        = document.getElementById('vn-character');
  const spriteEl      = document.getElementById('vn-char-sprite');
  const charArea      = document.getElementById('vn-character-area');

  const vcallStage    = document.getElementById('vn-videocall-stage');
  const vcallWrapper  = document.getElementById('vcall-aspect-wrapper');
  const welcomeOv     = document.getElementById('overlay-welcome');
  const bgBackdrop    = document.getElementById('vn-bg-backdrop');
  const avatarWrap    = document.getElementById('vn-speaker-avatar-wrap');
  const avatarImg     = document.getElementById('vn-speaker-avatar');
  const speakerStatus = document.getElementById('vn-speaker-status');
  const newsBanner    = document.getElementById('vcall-news-banner');

  speakerEl.textContent = line.speaker;
  indEl.textContent = `${index + 1} / ${VN_DIALOGUE.length}`;
  hintEl.classList.remove('visible');
  cursorEl.classList.remove('visible');
  textEl.textContent = '';

  const imgSrc = VN_CHARACTER_MAP[line.speaker] || null;
  const isVideoCall = (line.scene === 'videocall');

  if (isVideoCall) {
    if (vcallStage) vcallStage.classList.remove('hidden');
    if (welcomeOv) welcomeOv.classList.add('vn-mode-videocall');

    if (charArea) {
      charArea.style.opacity = '0';
      charArea.style.display = 'none';
      if (charEl) charEl.classList.remove('vn-speaking');
    }

    const quads = {
      'NISHREN': document.getElementById('vcall-quad-nishren'),
      'ACE':     document.getElementById('vcall-quad-ace'),
      'PHILLIP': document.getElementById('vcall-quad-phillip'),
      'JONALD':  document.getElementById('vcall-quad-jonald')
    };

    Object.values(quads).forEach(q => q && q.classList.remove('active-speaker'));

    const activeQuad = quads[line.speaker];
    if (activeQuad) {
      activeQuad.classList.add('active-speaker');
      if (vcallWrapper) vcallWrapper.classList.add('has-active-speaker');

      if (avatarWrap) avatarWrap.classList.remove('hidden');
      if (avatarImg && imgSrc) avatarImg.src = imgSrc;
      if (speakerStatus) {
        speakerStatus.classList.remove('hidden');
        speakerStatus.textContent = `🟢 ${line.speaker} • SPEAKING ON CALL`;
        speakerStatus.style.color = '#00e676';
      }
      if (typeof AudioManager !== 'undefined') {
        AudioManager.playExamChoice();
      }
    } else {
      if (vcallWrapper) vcallWrapper.classList.remove('has-active-speaker');
      if (avatarWrap) avatarWrap.classList.add('hidden');
      if (speakerStatus) speakerStatus.classList.add('hidden');
    }

    if (newsBanner) {
      if (line.newsAlert) {
        newsBanner.classList.remove('hidden');
        if (typeof AudioManager !== 'undefined') AudioManager.playWrong();
      } else {
        newsBanner.classList.add('hidden');
      }
    }

    const durEl = document.getElementById('vcall-duration');
    if (durEl) {
      const sec = 245 + Math.max(0, (index - 5) * 6);
      const m = String(Math.floor(sec / 60)).padStart(2, '0');
      const s = String(sec % 60).padStart(2, '0');
      durEl.textContent = `${m}:${s}`;
    }
  } else {
    if (vcallStage) vcallStage.classList.add('hidden');
    if (welcomeOv) welcomeOv.classList.remove('vn-mode-videocall');
    if (avatarWrap) avatarWrap.classList.add('hidden');
    if (newsBanner) newsBanner.classList.add('hidden');

    if (line.tag && speakerStatus) {
      speakerStatus.classList.remove('hidden');
      speakerStatus.textContent = line.tag;
      speakerStatus.style.color = (line.speaker === 'ZERO' || line.speaker === 'CYBERZERO' || line.speaker === 'AI GUIDE ZERO') ? 'var(--accent-cyan)' : '#a7f3d0';
    } else if (speakerStatus) {
      speakerStatus.classList.add('hidden');
    }

    if (line.bg && bgBackdrop) {
      bgBackdrop.style.backgroundImage = `url('${line.bg}')`;
    } else if (bgBackdrop) {
      if (activeCategoryStory === 'prologue') {
        bgBackdrop.style.backgroundImage = "url('assets/Cover.png')";
      } else if (activeCategoryStory === 'social_engineering') {
        bgBackdrop.style.backgroundImage = "url('assets/background/Coffe shop.png')";
      } else {
        bgBackdrop.style.backgroundImage = "url('assets/01Cover.png')";
      }
    }

    if (spriteEl && charArea) {
      if (imgSrc) {
        charArea.style.opacity = '0';
        charArea.style.transition = 'opacity 0.35s ease';
        const isAIZero = (line.speaker === 'ZERO' || line.speaker === 'CYBERZERO' || line.speaker === 'AI GUIDE ZERO');
        spriteEl.innerHTML = `<img src="${imgSrc}" alt="${line.speaker}" class="vn-char-img ${isAIZero ? 'ai-zero' : ''}" />`;
        charArea.style.display = 'flex';
        requestAnimationFrame(() => {
          requestAnimationFrame(() => { charArea.style.opacity = '1'; });
        });
        if (charEl) charEl.classList.add('vn-speaking');
      } else {
        charArea.style.opacity = '0';
        charArea.style.display = 'none';
        if (charEl) charEl.classList.remove('vn-speaking');
      }
    }
  }

  const colours = {
    'CYBERZERO':     'var(--accent-cyan)',
    'ZERO':          '#00f0ff',
    'AI GUIDE ZERO': '#00f0ff',
    'NARRATOR':      'var(--accent-blue)',
    'ACE':           '#f9a825',
    'NISHREN':       '#81c784',
    'PHILLIP':       '#ba68c8',
    'JONALD':        '#e57373',
    'SYSTEM':        'var(--accent-cyan)',
  };
  speakerEl.style.color = colours[line.speaker] || 'var(--accent-cyan)';

  if (vnState.typingTimer) clearTimeout(vnState.typingTimer);
  vnState.typing = true;
  vnState.charIndex = 0;

  function typeNextChar() {
    if (vnState.charIndex < line.text.length) {
      const ch = line.text[vnState.charIndex];
      textEl.textContent += ch;
      vnState.charIndex++;
      if (typeof AudioManager !== 'undefined' && ch.trim().length > 0) {
        AudioManager.playNarratorTyping();
      }
      vnState.typingTimer = setTimeout(typeNextChar, line.speed);
    } else {
      vnState.typing = false;
      if (charEl && charArea && charArea.style.display !== 'none') charEl.classList.remove('vn-speaking');
      cursorEl.classList.add('visible');
      hintEl.classList.add('visible');
      const hint = hintEl.querySelector('span:first-child');
      
      let nextLabel = 'Click to continue';
      if (index === VN_DIALOGUE.length - 1) {
        if (activeCategoryStory === 'prologue') nextLabel = '📝 Start Pre-Assessment Exam ➔';
        else if (activeCategoryStory === 'phishing') nextLabel = 'Start Phishing Demo ➔';
        else if (activeCategoryStory === 'malware') nextLabel = 'Start Malware Lab ➔';
        else if (activeCategoryStory === 'social_engineering') nextLabel = '🎬 Start Social Engineering Mission ➔';
        else if (activeCategoryStory === 'ransomware') nextLabel = 'Start Ransomware Console ➔';
        else if (activeCategoryStory === 'grand_finale') nextLabel = 'View Master Certificate ➔';
      }
      hint.textContent = nextLabel;
      if (index === VN_DIALOGUE.length - 1) vnState.done = true;
    }
  }
  typeNextChar();
}

function vnAdvance() {
  const line = VN_DIALOGUE[vnState.lineIndex];
  if (vnState.typing) {
    if (vnState.typingTimer) clearTimeout(vnState.typingTimer);
    vnState.typing = false;
    const textEl   = document.getElementById('vn-text');
    const cursorEl = document.getElementById('vn-cursor');
    const hintEl   = document.getElementById('vn-advance-hint');
    const charEl   = document.getElementById('vn-character');
    const charArea = document.getElementById('vn-character-area');
    textEl.textContent = line.text;
    if (charEl && charArea && charArea.style.display !== 'none') charEl.classList.remove('vn-speaking');
    cursorEl.classList.add('visible');
    hintEl.classList.add('visible');
    const hint = hintEl.querySelector('span:first-child');
    
    let nextLabel = 'Click to continue';
    if (vnState.lineIndex === VN_DIALOGUE.length - 1) {
      if (activeCategoryStory === 'prologue') nextLabel = '📝 Start Pre-Assessment Exam ➔';
      else if (activeCategoryStory === 'phishing') nextLabel = 'Start Phishing Demo ➔';
      else if (activeCategoryStory === 'malware') nextLabel = 'Start Malware Lab ➔';
      else if (activeCategoryStory === 'social_engineering') nextLabel = '🎬 Start Social Engineering Mission ➔';
      else if (activeCategoryStory === 'ransomware') nextLabel = 'Start Ransomware Console ➔';
      else if (activeCategoryStory === 'grand_finale') nextLabel = 'View Master Certificate ➔';
    }
    hint.textContent = nextLabel;
    if (vnState.lineIndex === VN_DIALOGUE.length - 1) vnState.done = true;
    return;
  }

  if (vnState.done || vnState.lineIndex >= VN_DIALOGUE.length - 1) {
    vnFinish();
  } else {
    vnState.lineIndex++;
    vnPlayLine(vnState.lineIndex);
  }
}

function vnSkip() {
  if (vnState.typingTimer) clearTimeout(vnState.typingTimer);
  vnFinish();
}

function vnFinish() {
  vnState.done = true;
  const vcallStage = document.getElementById('vn-videocall-stage');
  if (vcallStage) vcallStage.classList.add('hidden');
  const welcomeOv = document.getElementById('overlay-welcome');
  if (welcomeOv) welcomeOv.classList.remove('vn-mode-videocall');
  closeOverlay('overlay-welcome');

  if (activeCategoryStory === 'prologue') {
    proceedFromIntroToExam();
  } else if (activeCategoryStory === 'phishing') {
    // Show the Chapter 1 comic strip before starting the mission
    showComicStrip();
  } else if (activeCategoryStory === 'social_engineering') {
    // Show Chapter 3 comic strip before starting the mission
    showComicStripCh3();
  } else if (activeCategoryStory === 'ransomware') {
    // Show Chapter 4 comic strip before starting the mission
    showComicStripCh4();
  } else if (activeCategoryStory === 'malware') {
    openChapterDesktopDirect(activeCategoryStory);
  } else if (activeCategoryStory === 'grand_finale') {
    showGrandCertificate();
  } else {
    openCategoryHub();
  }
}
