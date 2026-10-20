'use strict';

// ═══════════════════════════════════════════════════════════
// PRE-ASSESSMENT EXAM — Baseline Diagnostic Questionnaire
// ═══════════════════════════════════════════════════════════

const PRE_ASSESSMENT_QUESTIONS = [
  {
    id: 1,
    topic: 'phishing',
    question: 'What is phishing?',
    options: [
      'Catching real fish in a lake using a fishing rod',
      'A cyber attack where fake messages are used to steal passwords or personal info',
      'A computer program that cleans hardware dust from your PC',
      'A tool used to speed up computer video games'
    ],
    correctIndex: 1,
    teacherNote: 'Teacher Note: Phishing uses fake messages and deception to trick victims into revealing sensitive credentials or personal data.'
  },
  {
    id: 2,
    topic: 'phishing',
    question: 'Which of the following is a common warning sign of a phishing email?',
    options: [
      'It comes from your company\'s verified, official email domain',
      'It creates false panic, like "Your account will be closed in 15 minutes!"',
      'It contains no attachments and asks for no sensitive information',
      'It is addressed to your verified student or employee name'
    ],
    correctIndex: 1,
    teacherNote: 'Teacher Note: False urgency is a major red flag! Attackers want you to panic so you click before checking the facts.'
  },
  {
    id: 3,
    topic: 'phishing',
    question: 'What is the safest thing to do before clicking any link or button in an email?',
    options: [
      'Click it as fast as possible to see what opens',
      'Hover your mouse over the link to preview the actual destination web address (URL)',
      'Forward the email to everyone in your contact list',
      'Turn off your computer monitor immediately'
    ],
    correctIndex: 1,
    teacherNote: 'Teacher Note: Always hover to verify! Link text can say anything, but the previewed URL shows where you are truly heading.'
  },
  {
    id: 4,
    topic: 'phishing',
    question: 'If an email asks you to reply with your password or bank PIN, what should you do?',
    options: [
      'Reply immediately with your credentials',
      'Never send it — legitimate organizations will never ask for your password via email',
      'Send only the first half of your password',
      'Post your password on public social media to ask if it is safe'
    ],
    correctIndex: 1,
    teacherNote: 'Teacher Note: Legitimate companies, banks, and IT teams will NEVER ask you to email your password or PIN.'
  },
  {
    id: 5,
    topic: 'malware',
    question: 'What is malware?',
    options: [
      'Physical parts of a computer like the monitor and keyboard',
      'Malicious software created to damage, steal data from, or infect a computer',
      'An official anti-virus tool created to protect your files',
      'A high-speed internet connection cable'
    ],
    correctIndex: 1,
    teacherNote: 'Teacher Note: Malware (short for malicious software) includes viruses, worms, trojans, ransomware, and spyware.'
  },
  {
    id: 6,
    topic: 'malware',
    question: 'You see a file named "bonus_payroll.pdf.exe" in your Downloads folder. What is this?',
    options: [
      'A normal PDF document with extra security features',
      'A dangerous file hiding an executable program (.exe) behind a fake PDF name',
      'A photo file taken with a digital smartphone camera',
      'An official audio recording from your music playlist'
    ],
    correctIndex: 1,
    teacherNote: 'Teacher Note: Watch out for double extensions! Windows runs the final extension (.exe), launching malware while pretending to be a document.'
  },
  {
    id: 7,
    topic: 'malware',
    question: 'What can happen if you double-click a suspicious script attachment (like a .vbs or .bat file)?',
    options: [
      'It can silently execute hidden commands to download viruses onto your computer',
      'It will instantly clean your computer hard drive of all dust',
      'It will automatically print a free discount coupon from your printer',
      'It automatically changes your computer desktop wallpaper'
    ],
    correctIndex: 0,
    teacherNote: 'Teacher Note: Script files (.vbs, .bat) can run system commands behind the scenes to install malicious payloads.'
  },
  {
    id: 8,
    topic: 'malware',
    question: 'What is the main job of Anti-Virus software?',
    options: [
      'To scan, detect, and neutralize computer viruses and malware threats',
      'To sell used computer hardware and laptops online',
      'To make your screen brighter when watching movies',
      'To delete all your school documents every weekend'
    ],
    correctIndex: 0,
    teacherNote: 'Teacher Note: Anti-virus tools actively monitor files, scan for malicious signatures, and stop infections.'
  },
  {
    id: 9,
    topic: 'malware',
    question: 'What does "Quarantine" mean in anti-virus software?',
    options: [
      'Sharing the infected file with friends on social media',
      'Moving the dangerous file to a secure, isolated vault so it cannot run or infect the PC',
      'Running the infected file with full administrator rights',
      'Deleting your computer\'s operating system entirely'
    ],
    correctIndex: 1,
    teacherNote: 'Teacher Note: Quarantine locks the threat in an isolated, encrypted vault, stopping execution while keeping the file safely contained.'
  },
  {
    id: 10,
    topic: 'malware',
    question: 'What is a "False Positive" in cyber security?',
    options: [
      'When a clean, safe file is mistakenly flagged or quarantined as malware',
      'When a computer completely runs out of battery power',
      'When an anti-virus software changes its desktop icon',
      'When a computer file has no name at all'
    ],
    correctIndex: 0,
    teacherNote: 'Teacher Note: A false positive happens when a safe file is wrongly treated as a threat. Always verify before quarantining!'
  }
];

let preAssessmentAnswers = {};
let isPreAssessmentGraded = false;
let preAssessmentScore = 0;

function initPreAssessment() {
  renderPreAssessment();
}

function renderPreAssessment() {
  const listEl = document.getElementById('exam-questions-list');
  if (!listEl) return;

  const answeredCount = Object.keys(preAssessmentAnswers).length;
  const countEl = document.getElementById('exam-answered-count');
  if (countEl) countEl.innerHTML = `<strong>${answeredCount} of ${PRE_ASSESSMENT_QUESTIONS.length}</strong>`;

  const optionLetters = ['A', 'B', 'C', 'D'];

  listEl.innerHTML = PRE_ASSESSMENT_QUESTIONS.map((q, qIdx) => {
    const chosenOpt = preAssessmentAnswers[q.id];
    const isAnswered = chosenOpt !== undefined;
    const isCorrect = isAnswered && chosenOpt === q.correctIndex;

    let markHtml = '';
    let explanationHtml = '';

    if (isPreAssessmentGraded) {
      if (isCorrect) {
        markHtml = '<span class="exam-teacher-mark mark-correct">✔</span>';
      } else {
        markHtml = '<span class="exam-teacher-mark mark-wrong">✘</span>';
      }
      explanationHtml = `<div class="exam-teacher-explanation">✍️ ${q.teacherNote}</div>`;
    }

    const optionsHtml = q.options.map((opt, optIdx) => {
      let optClass = 'exam-opt-row';
      let tagHtml = '';

      if (isPreAssessmentGraded) {
        optClass += ' locked';
        if (optIdx === q.correctIndex) {
          optClass += ' teacher-circled-correct';
          tagHtml = '<span class="exam-teacher-opt-tag correct-tag">✔ Correct</span>';
        } else if (chosenOpt === optIdx) {
          optClass += ' student-wrong-pick';
          tagHtml = '<span class="exam-teacher-opt-tag wrong-tag">✘ Your Answer</span>';
        }
      } else {
        if (chosenOpt === optIdx) {
          optClass += ' selected';
        }
      }

      return `
        <div class="${optClass}" onclick="selectPreAssessmentOption(${q.id}, ${optIdx})">
          <div class="exam-opt-bubble">${optionLetters[optIdx]}</div>
          <div class="exam-opt-text">${opt}</div>
          ${tagHtml}
        </div>`;
    }).join('');

    return `
      <div class="exam-q-card" id="exam-q-${q.id}">
        <div class="exam-q-header">
          <div class="exam-q-text">${q.id}. ${q.question}</div>
          ${markHtml}
        </div>
        <div class="exam-opt-list">
          ${optionsHtml}
        </div>
        ${explanationHtml}
      </div>`;
  }).join('');

  // Update Teacher Grade Box and Action buttons
  const gradeBox = document.getElementById('exam-teacher-grade-box');
  const submitBtn = document.getElementById('btn-submit-exam');
  const proceedBtn = document.getElementById('btn-proceed-vn');
  const skipBtn = document.getElementById('btn-skip-exam');
  const floatingSkipBtn = document.getElementById('btn-floating-skip-exam');

  if (isPreAssessmentGraded) {
    if (gradeBox) {
      gradeBox.classList.remove('hidden');

      const stampTitle = document.getElementById('exam-stamp-title');
      const stampSub = document.getElementById('exam-stamp-sub');
      const stampEl = document.getElementById('exam-stamp');
      const scoreVal = document.getElementById('exam-score-val');
      const teacherNote = document.getElementById('exam-teacher-note');

      if (scoreVal) scoreVal.textContent = `${preAssessmentScore}/10`;

      if (preAssessmentScore >= 7) {
        if (stampTitle) stampTitle.textContent = 'PASSED';
        if (stampSub) stampSub.textContent = 'CYBER ACADEMY • CERTIFIED';
        if (stampEl) {
          stampEl.style.borderColor = '#c62828';
          stampEl.style.color = '#c62828';
        }
      } else {
        if (stampTitle) stampTitle.textContent = 'EVALUATED';
        if (stampSub) stampSub.textContent = 'ACADEMY REMEDIATION REQUIRED';
        if (stampEl) {
          stampEl.style.borderColor = '#d84315';
          stampEl.style.color = '#d84315';
        }
      }

      if (teacherNote) {
        if (preAssessmentScore >= 9) {
          teacherNote.textContent = '"Excellent! Outstanding cybersecurity knowledge and awareness. You demonstrate strong threat detection instincts against phishing and malware."';
        } else if (preAssessmentScore >= 7) {
          teacherNote.textContent = '"Passed! Good cybersecurity knowledge and awareness. Continue practicing to maintain high vigilance against sophisticated cyber threats."';
        } else if (preAssessmentScore >= 5) {
          teacherNote.textContent = '"Needs improvement: You have basic familiarity, but you need more cybersecurity knowledge and awareness to consistently identify disguised links and deceptive files."';
        } else {
          teacherNote.textContent = '"Needs remediation: You need more cybersecurity knowledge and awareness. Pay close attention to the simulation lessons to build essential defense habits against phishing and malware."';
        }
      }
    }

    if (submitBtn) submitBtn.classList.add('hidden');
    if (skipBtn) skipBtn.classList.add('hidden');
    if (floatingSkipBtn) floatingSkipBtn.classList.add('hidden');
    if (proceedBtn) proceedBtn.classList.remove('hidden');
  } else {
    if (gradeBox) gradeBox.classList.add('hidden');
    if (submitBtn) submitBtn.classList.remove('hidden');
    if (skipBtn) skipBtn.classList.remove('hidden');
    if (floatingSkipBtn) floatingSkipBtn.classList.remove('hidden');
    if (proceedBtn) proceedBtn.classList.add('hidden');
  }
}

function selectPreAssessmentOption(qId, optIdx) {
  if (isPreAssessmentGraded) return;
  preAssessmentAnswers[qId] = optIdx;
  if (typeof AudioManager !== 'undefined') {
    AudioManager.playExamChoice();
  }
  renderPreAssessment();
}

function submitPreAssessment() {
  const nameInput = document.getElementById('exam-input-name');
  const playerName = nameInput ? nameInput.value.trim() : '';

  if (!playerName) {
    showToast('✍️ Please write your Student Name on the exam paper before turning it in!', 'warning');
    if (typeof AudioManager !== 'undefined') AudioManager.playWrong();
    if (nameInput) {
      nameInput.focus();
      nameInput.classList.add('highlight-pulse');
      setTimeout(() => nameInput.classList.remove('highlight-pulse'), 1200);
      nameInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return;
  }

  const answeredCount = Object.keys(preAssessmentAnswers).length;
  if (answeredCount < PRE_ASSESSMENT_QUESTIONS.length) {
    const missing = PRE_ASSESSMENT_QUESTIONS.length - answeredCount;
    showToast(`⚠️ Please answer all questions before turning in your paper (${missing} left)!`, 'warning');
    if (typeof AudioManager !== 'undefined') AudioManager.playWrong();
    for (const q of PRE_ASSESSMENT_QUESTIONS) {
      if (preAssessmentAnswers[q.id] === undefined) {
        const el = document.getElementById(`exam-q-${q.id}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        break;
      }
    }
    return;
  }

  gameState.playerName = playerName;
  if (nameInput) nameInput.disabled = true;

  let score = 0;
  PRE_ASSESSMENT_QUESTIONS.forEach(q => {
    if (preAssessmentAnswers[q.id] === q.correctIndex) {
      score++;
    }
  });

  isPreAssessmentGraded = true;
  preAssessmentScore = score;
  renderPreAssessment();

  const shell = document.getElementById('exam-paper-shell');
  if (shell) {
    shell.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  if (typeof AudioManager !== 'undefined') {
    if (score >= 7) AudioManager.playCorrect();
    else AudioManager.playWrong();
  }

  showToast(
    score >= 7
      ? `🎓 Exam Graded: ${score}/10 — PASSED! CyberZerØ is ready to guide you.`
      : `🎓 Exam Graded: ${score}/10 — Keep learning! Check the remarks.`,
    score >= 7 ? 'success' : 'warning'
  );
}

function proceedFromPreAssessmentToCategories() {
  const nameInput = document.getElementById('exam-input-name');
  const playerName = (nameInput && nameInput.value.trim()) ? nameInput.value.trim() : 'Alex';
  if (!gameState.playerName || gameState.playerName === 'Student') {
    gameState.playerName = playerName;
  }
  closeOverlay('overlay-pre-assessment');
  openCategoryHub();
  showToast('📁 Pre-assessment completed! Select your story to begin.', 'success');
}

function proceedFromPreAssessmentToVN() {
  proceedFromPreAssessmentToCategories();
}

function skipPreAssessment() {
  const nameInput = document.getElementById('exam-input-name');
  const playerName = (nameInput && nameInput.value.trim()) ? nameInput.value.trim() : 'Alex';
  if (!gameState.playerName || gameState.playerName === 'Student') {
    gameState.playerName = playerName;
  }
  if (typeof AudioManager !== 'undefined') {
    AudioManager.playExamChoice();
  }
  closeOverlay('overlay-pre-assessment');
  openCategoryHub();
  showToast('⏩ Assessment skipped — select your story to begin.', 'info');
}

function skipPreAssessmentFromIntro() {
  if (!gameState.playerName || gameState.playerName === 'Student') {
    gameState.playerName = 'Alex';
  }
  if (typeof AudioManager !== 'undefined') {
    AudioManager.playNotification();
  }
  closeOverlay('overlay-game-intro');
  openCategoryHub();
  showToast('⏩ Assessment skipped — select your story to begin.', 'info');
}

function retakePreAssessment(silent = false) {
  isPreAssessmentGraded = false;
  preAssessmentAnswers = {};
  preAssessmentScore = 0;
  const nameInput = document.getElementById('exam-input-name');
  if (nameInput) {
    nameInput.disabled = false;
  }
  renderPreAssessment();
  const shell = document.getElementById('exam-paper-shell');
  if (shell && !silent) shell.scrollIntoView({ behavior: 'smooth', block: 'start' });
  if (!silent) showToast('📝 Fresh exam sheet ready. Good luck!', 'info');
}

function openPreAssessment() {
  showOverlay('overlay-pre-assessment');
  renderPreAssessment();
}
