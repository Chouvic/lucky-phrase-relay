/* ═══════════════════════════════════════════════════════════
   春聯 CHŪNLIÁN BUILDER – Interactive Spring Couplet Creator
   Year of the Horse 2026 | JPMC Glasgow
   ───────────────────────────────────────────────────────────
   Flow:
     Step 1 → Pick 橫批 (header)
     Step 2 → Pick 右聯 (right / first line) — sets the length
     Step 3 → Pick 左聯 (left / second line) — filtered to same length
     Step 4 → View result: personalised wish + visual 春聯
   ═══════════════════════════════════════════════════════════ */

const chunlianState = {
  playerName: '',
  step: 0,         // 0=inactive, 1=header, 2=right, 3=left, 4=result
  header: null,    // chosen header object
  right: null,     // chosen right-line object
  left: null,      // chosen left-line object
  chosenLength: 0, // set after right line is picked
};

// ─── Init ───────────────────────────────────────────────────
function setupChunlianEvents() {
  // "Create Chūnlián" button on welcome screen
  const btn = document.querySelector('#btn-chunlian');
  if (btn) {
    btn.addEventListener('click', () => {
      soundEngine.play('click');
      const name = document.querySelector('#player-name').value.trim();
      if (!name) {
        showError('Please enter your name first!');
        document.querySelector('#player-name').focus();
        return;
      }
      startChunlian(name);
    });
  }

  // Back button
  const backBtn = document.querySelector('#chunlian-back');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      soundEngine.play('click');
      if (chunlianState.step === 1) {
        // Go back to welcome
        showScreen('welcome');
        chunlianState.step = 0;
      } else if (chunlianState.step > 1) {
        chunlianState.step--;
        if (chunlianState.step === 2) chunlianState.right = null;
        if (chunlianState.step === 1) { chunlianState.header = null; chunlianState.chosenLength = 0; }
        renderChunlianStep();
      }
    });
  }

  // Save screenshot
  const saveBtn = document.querySelector('#btn-save-chunlian');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      soundEngine.play('click');
      saveChunlianScreenshot();
    });
  }

  // Restart
  const restartBtn = document.querySelector('#btn-chunlian-restart');
  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      soundEngine.play('click');
      startChunlian(chunlianState.playerName);
    });
  }

  // Back to welcome
  const homeBtn = document.querySelector('#btn-chunlian-home');
  if (homeBtn) {
    homeBtn.addEventListener('click', () => {
      soundEngine.play('click');
      showScreen('welcome');
      chunlianState.step = 0;
    });
  }

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

// ─── Start ──────────────────────────────────────────────────
function startChunlian(name) {
  chunlianState.playerName = name;
  chunlianState.step = 1;
  chunlianState.header = null;
  chunlianState.right = null;
  chunlianState.left = null;
  chunlianState.chosenLength = 0;

  showScreen('chunlian');
  renderChunlianStep();
}

// ─── Handle Pick ────────────────────────────────────────────
function handleChunlianPick(id) {
  if (chunlianState.step === 1) {
    // Header picked
    const header = CHUNLIAN_HEADERS.find(h => h.id === id);
    if (!header) return;
    chunlianState.header = header;
    chunlianState.step = 2;

    // Burst particles
    particleSystem.burst(window.innerWidth / 2, window.innerHeight / 2, 12);

    setTimeout(() => renderChunlianStep(), 400);

  } else if (chunlianState.step === 2) {
    // Right line picked
    const line = CHUNLIAN_RIGHT_LINES.find(l => l.id === id);
    if (!line) return;
    chunlianState.right = line;
    chunlianState.chosenLength = line.length;
    chunlianState.step = 3;

    particleSystem.burst(window.innerWidth / 2, window.innerHeight / 2, 12);

    setTimeout(() => renderChunlianStep(), 400);

  } else if (chunlianState.step === 3) {
    // Left line picked
    const line = CHUNLIAN_LEFT_LINES.find(l => l.id === id);
    if (!line) return;
    chunlianState.left = line;
    chunlianState.step = 4;

    particleSystem.burst(window.innerWidth / 2, window.innerHeight / 3, 25);

    setTimeout(() => renderChunlianResult(), 500);
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

  // Show steps area, hide result
  stepsArea.style.display = 'block';
  resultEl.style.display = 'none';

  // Update back button visibility
  const backBtn = document.querySelector('#chunlian-back');
  if (backBtn) backBtn.style.display = chunlianState.step >= 1 ? 'inline-flex' : 'none';

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

    // Group by length
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

    // Filter to same length
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

// ─── Preview (mini display of what's picked so far) ─────────
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

// ─── Result ─────────────────────────────────────────────────
function renderChunlianResult() {
  const stepsArea = document.querySelector('#chunlian-steps-area');
  const resultEl = document.querySelector('#chunlian-result');
  stepsArea.style.display = 'none';
  resultEl.style.display = 'block';

  const s = chunlianState;

  // Personalised wish
  const wishEl = document.querySelector('#chunlian-wish');
  wishEl.innerHTML = `
    <p class="cl-wish-text">🐴 <strong>${s.playerName}</strong>, here is your Spring Couplet!</p>
    <p class="cl-wish-sub">May the blessings of <em>${s.header.english}</em> bring you
    <em>${s.right.english.toLowerCase()}</em> and <em>${s.left.english.toLowerCase()}</em>
    in the Year of the Horse 2026! 🏇</p>
  `;

  // Render the visual Chūnlián
  renderChunlianVisual();

  soundEngine.play('gameOver');
  setTimeout(() => soundEngine.play('gong'), 400);
  setTimeout(() => soundEngine.play('firecracker'), 900);

  // Celebration particles
  setTimeout(() => {
    particleSystem.burst(window.innerWidth / 2, window.innerHeight / 4, 30);
    setTimeout(() => particleSystem.burst(window.innerWidth / 3, window.innerHeight / 3, 20), 300);
    setTimeout(() => particleSystem.burst(window.innerWidth * 2 / 3, window.innerHeight / 3, 20), 600);
  }, 300);
}

function renderChunlianVisual() {
  const s = chunlianState;
  const visual = document.querySelector('#chunlian-visual');

  // Build header characters
  const headerChars = s.header.chinese.split('').map(c =>
    `<span class="cl-vis-char">${c}</span>`
  ).join('');

  // Build right scroll characters (vertical, top to bottom)
  const rightChars = s.right.chinese.split('').map(c =>
    `<span class="cl-vis-char">${c}</span>`
  ).join('');

  // Build left scroll characters (vertical, top to bottom)
  const leftChars = s.left.chinese.split('').map(c =>
    `<span class="cl-vis-char">${c}</span>`
  ).join('');

  visual.innerHTML = `
    <div class="cl-display">
      <div class="cl-header-scroll">
        <div class="cl-scroll-paper cl-horizontal">
          ${headerChars}
        </div>
        <div class="cl-header-english">${s.header.english}</div>
      </div>
      <div class="cl-body-scrolls">
        <div class="cl-vertical-scroll cl-left-scroll">
          <div class="cl-scroll-paper cl-vertical">
            ${leftChars}
          </div>
          <div class="cl-scroll-label">左聯 · Left</div>
          <div class="cl-scroll-english">${s.left.english}</div>
        </div>
        <div class="cl-fu-diamond">
          <span class="cl-fu-char">福</span>
        </div>
        <div class="cl-vertical-scroll cl-right-scroll">
          <div class="cl-scroll-paper cl-vertical">
            ${rightChars}
          </div>
          <div class="cl-scroll-label">右聯 · Right</div>
          <div class="cl-scroll-english">${s.right.english}</div>
        </div>
      </div>
      <div class="cl-display-footer">
        <span>🏮 JPMC Glasgow 🏮</span>
        <span>Year of the Horse 2026</span>
        <span>Designed by ${s.playerName}</span>
      </div>
    </div>
  `;
}

// ─── Screenshot ─────────────────────────────────────────────
async function saveChunlianScreenshot() {
  const btn = document.querySelector('#btn-save-chunlian');
  const originalHTML = btn.innerHTML;
  btn.innerHTML = '<span class="btn-icon">⏳</span> Capturing...';
  btn.disabled = true;

  try {
    const card = document.querySelector('#chunlian-visual');
    const canvas = await html2canvas(card, {
      backgroundColor: '#8B0000',
      scale: 2,
      useCORS: true,
      logging: false,
    });

    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));

    if (navigator.share && navigator.canShare) {
      const file = new File([blob], 'my-chunlian.png', { type: 'image/png' });
      const shareData = { files: [file], title: '🧧 My Spring Couplet – Year of the Horse 2026' };
      if (navigator.canShare(shareData)) {
        try {
          await navigator.share(shareData);
          btn.innerHTML = '<span class="btn-icon">✅</span> Shared!';
          setTimeout(() => { btn.innerHTML = originalHTML; btn.disabled = false; }, 2000);
          return;
        } catch (e) { /* User cancelled */ }
      }
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'my-chunlian-2026.png';
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    btn.innerHTML = '<span class="btn-icon">✅</span> Saved!';
    setTimeout(() => { btn.innerHTML = originalHTML; btn.disabled = false; }, 2000);
  } catch (e) {
    console.error('Screenshot failed:', e);
    btn.innerHTML = '<span class="btn-icon">❌</span> Failed — try again';
    setTimeout(() => { btn.innerHTML = originalHTML; btn.disabled = false; }, 2000);
  }
}
