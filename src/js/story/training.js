'use strict';

// ═══════════════════════════════════════════════════════════
// GAME FLOW
// ═══════════════════════════════════════════════════════════

function startTraining() {
  gameState.phase = 'training';
  gameState.trainingSlide = 0;
  renderTrainingSlide();
  showOverlay('overlay-training');
}


function renderTrainingSlide() {
  const slide = TRAINING_SLIDES[gameState.trainingSlide];
  const bubble = document.getElementById('training-bubble');
  bubble.innerHTML = `<h3>${slide.title}</h3>${slide.content}`;

  // Dots
  const dotsEl = document.getElementById('training-dots');
  dotsEl.innerHTML = '';
  TRAINING_SLIDES.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'training-dot' + (i === gameState.trainingSlide ? ' active' : '');
    dot.onclick = () => { gameState.trainingSlide = i; renderTrainingSlide(); };
    dotsEl.appendChild(dot);
  });

  const prevBtn = document.getElementById('btn-training-prev');
  const nextBtn = document.getElementById('btn-training-next');
  prevBtn.style.visibility = gameState.trainingSlide === 0 ? 'hidden' : 'visible';

  if (gameState.trainingSlide === TRAINING_SLIDES.length - 1) {
    nextBtn.textContent = 'See the Demo →';
  } else {
    nextBtn.textContent = 'Next →';
  }
}

function trainingNext() {
  if (gameState.trainingSlide < TRAINING_SLIDES.length - 1) {
    gameState.trainingSlide++;
    renderTrainingSlide();
  } else {
    startMission(false);
  }
}

function trainingPrev() {
  if (gameState.trainingSlide > 0) {
    gameState.trainingSlide--;
    renderTrainingSlide();
  }
}
