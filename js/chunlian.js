/* ═══════════════════════════════════════════════════════════
   春聯 CHŪNLIÁN BUILDER – Interactive Spring Couplet Creator
   Year of the Horse 2026 | JPMC Glasgow
   ───────────────────────────────────────────────────────────
   Flow (Journey Mode):
     Step 1 → Pick 橫批 (header)
     Step 2 → Pick 右聯 (right / first line) — sets the length
     Step 3 → Pick 左聯 (left / second line) — filtered to same length
     → Automatically proceeds to Grand Finale
   ═══════════════════════════════════════════════════════════ */

const chunlianState = {
  playerName: '',
  step: 0,
  header: null,
  right: null,
  left: null,
  chosenLength: 0,
  journeyMode: false,
};

// ─── Init ───────────────────────────────────────────────────
function setupChunlianEvents() {
  // Delegate clicks on options
  const optionsContainer = document.querySelector('#chunlian-options');
  if (optionsContainer) {
    optionsContainer.addEventListener('click', (e) => {
      const card = e.target.closest('.cl-option');
      if (!card) return;
      soundEngine.play('pick');
      const id = card.dataset.id;
      handleChunlianPick(id);
    });
  }
}

// ─── Handle Pick ────────────────────────────────────────────
function handleChunlianPick(id) {
  if (chunlianState.step === 1) {
    const header = CHUNLIAN_HEADERS.find(h => h.id === id);
    if (!header) return;
    chunlianState.header = header;
    chunlianState.step = 2;
    particleSystem.burst(window.innerWidth / 2, window.innerHeight / 2, 12);
    setTimeout(() => renderChunlianStep(), 400);

  } else if (chunlianState.step === 2) {
    const line = CHUNLIAN_RIGHT_LINES.find(l => l.id === id);
    if (!line) return;
    chunlianState.right = line;
    chunlianState.chosenLength = line.length;
    chunlianState.step = 3;
    particleSystem.burst(window.innerWidth / 2, window.innerHeight / 2, 12);
    setTimeout(() => renderChunlianStep(), 400);

  } else if (chunlianState.step === 3) {
    const line = CHUNLIAN_LEFT_LINES.find(l => l.id === id);
    if (!line) return;
    chunlianState.left = line;
    chunlianState.step = 4;
    particleSystem.burst(window.innerWidth / 2, window.innerHeight / 3, 25);

    // Store chunlian data in app state
    state.chunlianData = {
      playerName: chunlianState.playerName,
      header: chunlianState.header,
      right: chunlianState.right,
      left: chunlianState.left,
    };

    // In journey mode, go to grand finale
    if (chunlianState.journeyMode) {
      setTimeout(() => showFinale(), 600);
    } else {
      setTimeout(() => showFinale(), 600);
    }
  }
}

// ─── Render Step ────────────────────────────────────────────
function renderChunlianStep() {
  const stepTitle = document.querySelector('#chunlian-step-title');
  const stepDesc = document.querySelector('#chunlian-step-desc');
  const stepNum = document.querySelector('#chunlian-step-num');
  const optionsEl = document.querySelector('#chunlian-options');
  const previewEl = document.querySelector('#chunlian-preview-area');
  const resultEl = document.querySelector('#chunlian-result');
  const stepsArea = document.querySelector('#chunlian-steps-area');

  stepsArea.style.display = 'block';
  resultEl.style.display = 'none';

  // Update preview
  renderChunlianPreview(previewEl);

  if (chunlianState.step === 1) {
    stepNum.textContent = 'Step 1 of 3';
    stepTitle.textContent = '選橫批 · Choose the Header';
    stepDesc.textContent = 'The horizontal scroll sits atop your door — pick a four-character blessing:';
    optionsEl.innerHTML = CHUNLIAN_HEADERS.map((h, i) => `
      <div class="cl-option cl-header-option" data-id="${h.id}" style="animation-delay:${i * 0.05}s">
        <span class="cl-opt-chinese">${h.chinese}</span>
        <span class="cl-opt-pinyin">${h.pinyin}</span>
        <span class="cl-opt-english">${h.english}</span>
      </div>
    `).join('');

  } else if (chunlianState.step === 2) {
    stepNum.textContent = 'Step 2 of 3';
    stepTitle.textContent = '選右聯 · Choose the Right Scroll';
    stepDesc.textContent = 'The right scroll (上聯) is read first. Its length determines the left scroll\'s length:';

    const lengths = [...new Set(CHUNLIAN_RIGHT_LINES.map(l => l.length))].sort((a, b) => a - b);
    let html = '';
    lengths.forEach(len => {
      const lines = CHUNLIAN_RIGHT_LINES.filter(l => l.length === len);
      html += `<div class="cl-length-group">
        <div class="cl-length-label">${len}-Character Lines</div>
        ${lines.map((l, i) => `
          <div class="cl-option cl-line-option" data-id="${l.id}" style="animation-delay:${i * 0.05}s">
            <span class="cl-opt-chinese">${l.chinese}</span>
            <span class="cl-opt-pinyin">${l.pinyin}</span>
            <span class="cl-opt-english">${l.english}</span>
          </div>
        `).join('')}
      </div>`;
    });
    optionsEl.innerHTML = html;

  } else if (chunlianState.step === 3) {
    stepNum.textContent = 'Step 3 of 3';
    stepTitle.textContent = '選左聯 · Choose the Left Scroll';
    const matchId = CHUNLIAN_CLASSIC_MATCHES[chunlianState.right.id];
    stepDesc.textContent = `The left scroll (下聯) must be ${chunlianState.chosenLength} characters to match your right scroll:`;

    const matchingLines = CHUNLIAN_LEFT_LINES.filter(l => l.length === chunlianState.chosenLength);
    optionsEl.innerHTML = matchingLines.map((l, i) => {
      const isClassic = matchId === l.id;
      return `
      <div class="cl-option cl-line-option ${isClassic ? 'cl-classic-match' : ''}" data-id="${l.id}" style="animation-delay:${i * 0.05}s">
        <span class="cl-opt-chinese">${l.chinese}</span>
        <span class="cl-opt-pinyin">${l.pinyin}</span>
        <span class="cl-opt-english">${l.english}</span>
        ${isClassic ? '<span class="cl-classic-tag">⭐ Classic Pair</span>' : ''}
      </div>`;
    }).join('');
  }
}

// ─── Preview ────────────────────────────────────────────────
function renderChunlianPreview(el) {
  if (!el) return;
  const s = chunlianState;
  let html = '<div class="cl-preview">';

  if (s.header) {
    html += `<div class="cl-prev-header"><span class="cl-prev-label">橫批:</span> <span class="cl-prev-text">${s.header.chinese}</span></div>`;
  }
  if (s.right) {
    html += `<div class="cl-prev-line"><span class="cl-prev-label">右聯:</span> <span class="cl-prev-text">${s.right.chinese}</span></div>`;
  }
  if (s.left) {
    html += `<div class="cl-prev-line"><span class="cl-prev-label">左聯:</span> <span class="cl-prev-text">${s.left.chinese}</span></div>`;
  }

  html += '</div>';
  el.innerHTML = (s.header || s.right || s.left) ? html : '';
}
