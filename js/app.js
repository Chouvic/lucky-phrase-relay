/* ═══════════════════════════════════════════════════════════
   LUCKY PHRASE RELAY – Main Application Logic
   Year of the Horse 2026 | JPMC Glasgow
   Wisdom Phrase Edition – No server required
   ═══════════════════════════════════════════════════════════ */

// ─── State ──────────────────────────────────────────────────
const state = {
  playerName: null,
  scrollTitle: '',
  scrollIntro: '',
  sections: [],
  timerAnimation: null,
  totalLuck: 0,
  maxLuck: 36, // 6 rounds × max 6 luck per phrase
};

// ─── DOM Refs ───────────────────────────────────────────────
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const screens = {
  welcome: $('#screen-welcome'),
  game: $('#screen-game'),
  chunlian: $('#screen-chunlian'),
  results: $('#screen-results'),
};

// ─── Init ───────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Init sound on first interaction
  document.addEventListener('click', () => soundEngine.init(), { once: true });
  document.addEventListener('touchstart', () => soundEngine.init(), { once: true });

  // Music toggle button
  setupMusicToggle();

  // Setup event listeners
  setupWelcomeEvents();
  setupGameEvents();
  setupResultsEvents();
  setupChunlianEvents();

  // Wire up game engine callbacks
  gameEngine.onTurnStart = handleTurnStart;
  gameEngine.onTilePicked = handlePhrasePicked;
  gameEngine.onGameOver = handleGameOver;
});

// ─── Screen Navigation ─────────────────────────────────────
function showScreen(name) {
  Object.values(screens).forEach(s => s.classList.remove('active'));
  screens[name].classList.add('active');
  window.scrollTo(0, 0);
}

// ─── Music Toggle ───────────────────────────────────────────
function setupMusicToggle() {
  const btn = $('#music-toggle');
  const icon = $('#music-icon');

  btn.addEventListener('click', () => {
    soundEngine.init();
    const isPlaying = soundEngine.toggleBgMusic();
    icon.textContent = isPlaying ? '🔊' : '🔇';
  });
}

// ═══════════════ WELCOME SCREEN ═══════════════
function setupWelcomeEvents() {
  $('#btn-join-default').addEventListener('click', () => {
    const name = $('#player-name').value.trim();
    if (!name) {
      showError('Please enter your name!');
      $('#player-name').focus();
      return;
    }
    startGame(name);
  });

  $('#player-name').addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
      $('#btn-join-default').click();
    }
  });
}

function startGame(name) {
  state.playerName = name;

  // Start a new game via the engine
  const gameInfo = gameEngine.startNewGame(name);

  state.scrollTitle = gameInfo.scrollTitle;
  state.scrollIntro = gameInfo.scrollIntro;
  state.sections = gameInfo.sections;
  state.totalLuck = 0;

  $('#round-max').textContent = gameInfo.maxRounds;
  $('#scroll-title').textContent = `📜 ${state.scrollTitle}`;
  $('#scroll-intro').textContent = state.scrollIntro;

  showScreen('game');
  soundEngine.play('gong');
  renderScrollLines([], state.sections);
  updateLuckMeter(0);

  // Start first turn after a short delay
  setTimeout(() => gameEngine.startNextTurn(), 800);
}

function showError(msg) {
  const el = $('#welcome-error');
  el.textContent = msg;
  el.style.animation = 'none';
  el.offsetHeight; // reflow
  el.style.animation = 'tabooShake 0.5s ease-out';
  setTimeout(() => { el.textContent = ''; }, 3000);
}

// ═══════════════ GAME ═══════════════
function setupGameEvents() {
  $('#phrases-container').addEventListener('click', (e) => {
    const card = e.target.closest('.phrase-card');
    if (!card || card.classList.contains('disabled')) return;

    soundEngine.play('pick');
    const phraseId = card.dataset.phraseId;
    card.classList.add('picked');

    // Burst particles at card location
    const rect = card.getBoundingClientRect();
    particleSystem.burst(rect.left + rect.width / 2, rect.top + rect.height / 2, 15);

    // Tell the engine the player picked this phrase
    gameEngine.pickPhrase(phraseId);

    // Disable all phrase cards
    $$('.phrase-card').forEach(c => c.classList.add('disabled'));
  });
}

// ─── Game Engine Callbacks ──────────────────────────────────

function handleTurnStart(data) {
  const { choices, round, maxRounds, sectionLabel, greeting, timerDuration, playerName, avatar } = data;

  soundEngine.play('turnStart');
  if (navigator.vibrate) navigator.vibrate(50);

  $('#round-num').textContent = round;
  $('#turn-avatar').textContent = avatar;
  $('#turn-name').textContent = playerName;
  $('#section-label').textContent = sectionLabel;
  $('#turn-label').textContent = '— choose a phrase!';

  renderScrollLines(greeting, state.sections);
  renderPhraseChoices(choices);
  startTimer(timerDuration);

  const hint = $('#phrases-hint');
  hint.textContent = `✨ Round ${round}: ${sectionLabel}`;
  hint.className = 'phrases-hint your-turn';
}

function handlePhrasePicked(data) {
  const { greeting, autoSelected, tabooAlert } = data;

  renderScrollLines(greeting, state.sections);

  let luck = 0;
  greeting.forEach(p => { luck += p.luck; });
  updateLuckMeter(luck);

  if (autoSelected) {
    soundEngine.play('tick');
  }

  if (tabooAlert) {
    showTabooAlert(tabooAlert);
  }
}

function handleGameOver(data) {
  soundEngine.play('gameOver');
  showScreen('results');
  renderResults(data);

  // Fire celebration particles and festive sounds
  setTimeout(() => {
    soundEngine.play('firecracker');
    particleSystem.burst(window.innerWidth / 2, window.innerHeight / 3, 30);
    setTimeout(() => particleSystem.burst(window.innerWidth / 3, window.innerHeight / 2, 20), 300);
    setTimeout(() => {
      soundEngine.play('celebration');
      particleSystem.burst(window.innerWidth * 2 / 3, window.innerHeight / 2, 20);
    }, 600);
  }, 500);
}

// ─── Rendering ──────────────────────────────────────────────

function renderPhraseChoices(choices) {
  const container = $('#phrases-container');
  container.innerHTML = choices.map((phrase, i) => {
    const isTaboo = phrase.taboo;
    const rareTag = phrase.rare ? '<span class="phrase-rare-tag">✨ Rare</span>' : '';
    const luckIndicator = isTaboo
      ? `<span class="phrase-luck taboo-luck">⚠️ ${phrase.luck}</span>`
      : `<span class="phrase-luck lucky-luck">🍀 +${phrase.luck}</span>`;

    return `
    <div class="phrase-card ${isTaboo ? 'taboo-card-choice' : ''}"
         data-phrase-id="${phrase.id}"
         style="animation-delay: ${i * 0.15}s">
      <div class="phrase-card-main">
        <span class="phrase-chinese">${phrase.chinese}</span>
        <span class="phrase-pinyin">${phrase.pinyin}</span>
      </div>
      <div class="phrase-card-details">
        <span class="phrase-english">${phrase.english}</span>
        <span class="phrase-meaning">${phrase.meaning}</span>
      </div>
      <div class="phrase-card-meta">
        ${luckIndicator}
        <span class="phrase-category">${phrase.category}</span>
        ${rareTag}
      </div>
    </div>`;
  }).join('');
}

function renderScrollLines(greeting, sections) {
  const container = $('#scroll-lines');
  let html = '';

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    if (i < greeting.length) {
      const phrase = greeting[i];
      const cls = phrase.taboo ? 'scroll-line-taboo' : phrase.rare ? 'scroll-line-rare' : 'scroll-line-lucky';
      html += `
      <div class="scroll-line ${cls}" style="animation-delay: ${i * 0.05}s">
        <span class="scroll-line-label">${section.label}</span>
        <span class="scroll-line-chinese">${phrase.chinese}</span>
        <span class="scroll-line-english">${phrase.english}</span>
      </div>`;
    } else if (i === greeting.length) {
      // Current picking slot
      html += `
      <div class="scroll-line scroll-line-active">
        <span class="scroll-line-label">${section.label}</span>
        <span class="scroll-line-placeholder">???</span>
      </div>`;
    } else {
      // Future slot
      html += `
      <div class="scroll-line scroll-line-empty">
        <span class="scroll-line-label">${section.label}</span>
        <span class="scroll-line-placeholder">···</span>
      </div>`;
    }
  }

  container.innerHTML = html;
}

function startTimer(duration) {
  const bar = $('#timer-bar');
  bar.classList.remove('running', 'expired');
  bar.style.width = '100%';
  bar.style.transition = 'none';

  bar.offsetHeight; // reflow

  bar.style.transition = `width ${duration}ms linear`;
  bar.classList.add('running');

  if (state.timerAnimation) clearTimeout(state.timerAnimation);
  state.timerAnimation = setTimeout(() => {
    bar.classList.remove('running');
    bar.classList.add('expired');
  }, duration);
}

function updateLuckMeter(luck) {
  state.totalLuck = Math.max(0, luck);
  const pct = Math.min(100, (state.totalLuck / state.maxLuck) * 100);
  $('#luck-bar').style.width = `${pct}%`;
  $('#luck-value').textContent = state.totalLuck;
}

function showTabooAlert(data) {
  soundEngine.play('taboo');
  const overlay = $('#taboo-overlay');
  $('#taboo-phrase-chinese').textContent = data.phrase.chinese;
  $('#taboo-phrase-english').textContent = `${data.phrase.english} — ${data.phrase.meaning}`;
  $('#taboo-note').textContent = data.culturalNote;
  $('#taboo-player').textContent = `${data.playerName} picked a taboo phrase! ${data.phrase.luck} luck`;
  overlay.classList.add('show');

  if (navigator.vibrate) navigator.vibrate([100, 50, 100]);

  setTimeout(() => {
    overlay.classList.remove('show');
  }, 5500);
}

// ═══════════════ RESULTS ═══════════════
function setupResultsEvents() {
  $('#btn-save-screenshot').addEventListener('click', () => {
    soundEngine.play('click');
    saveMemeCardScreenshot();
  });

  $('#btn-play-again').addEventListener('click', () => {
    soundEngine.play('click');
    startGame(state.playerName);
  });
}

function renderResults(data) {
  const { greeting, sections, scrollTitle, scrollIntro, score, tabooHits, playerName } = data;

  $('#results-grade').textContent = score.grade;

  // Meme card
  $('#meme-scroll-title').textContent = scrollTitle;
  const memeGreeting = $('#meme-greeting');
  memeGreeting.innerHTML = greeting.map(phrase => {
    const cls = phrase.taboo ? 'taboo-phrase-line' : phrase.rare ? 'rare-phrase-line' : 'lucky-phrase-line';
    return `<div class="meme-phrase-line ${cls}">
      <span class="meme-chinese">${phrase.chinese}</span>
      <span class="meme-english">${phrase.english}</span>
    </div>`;
  }).join('');

  $('#meme-score-value').textContent = score.total;
  $('#meme-designed-by').textContent = `Designed by ${playerName}`;

  // Score breakdown
  $('#sb-base').textContent = `+${score.baseLuck}`;
  $('#sb-rare').textContent = `+${score.rareBonuses * 2}`;
  $('#sb-rhythm').textContent = `+${score.rhythmBonus}`;
  $('#sb-horse').textContent = `+${score.horseBonus}`;
  $('#sb-diversity').textContent = `+${score.diversityBonus}`;
  $('#sb-total').textContent = score.total;

  // Cultural notes
  if (tabooHits.length > 0) {
    $('#cultural-notes').style.display = 'block';
    $('#cultural-notes-list').innerHTML = tabooHits.map(hit => `
      <div class="cultural-note-item">
        <span class="note-tile">${hit.phrase.chinese}</span>
        <span class="note-english">${hit.phrase.english}</span>
        <p>${hit.phrase.culturalNote}</p>
      </div>
    `).join('');
  } else {
    $('#cultural-notes').style.display = 'none';
  }

  // Phrase review
  const reviewList = $('#phrases-review-list');
  reviewList.innerHTML = greeting.map((phrase, i) => {
    const section = sections[i];
    const cls = phrase.taboo ? 'review-taboo' : phrase.rare ? 'review-rare' : 'review-lucky';
    const sign = phrase.luck >= 0 ? '+' : '';
    return `
    <div class="review-phrase ${cls}" style="animation-delay:${i * 0.08}s">
      <div class="review-phrase-header">
        <span class="review-section-label">${section?.label || ''}</span>
        <span class="review-luck">${sign}${phrase.luck} 🍀</span>
      </div>
      <div class="review-phrase-body">
        <span class="review-chinese">${phrase.chinese}</span>
        <span class="review-pinyin">${phrase.pinyin}</span>
        <span class="review-english">${phrase.english}</span>
      </div>
      <div class="review-phrase-note">${phrase.meaning}</div>
    </div>`;
  }).join('');
}

async function saveMemeCardScreenshot() {
  const btn = $('#btn-save-screenshot');
  const originalHTML = btn.innerHTML;
  btn.innerHTML = '<span class="btn-icon">⏳</span> Capturing...';
  btn.disabled = true;

  try {
    const memeCard = $('#meme-card');
    const canvas = await html2canvas(memeCard, {
      backgroundColor: null,
      scale: 2,
      useCORS: true,
      logging: false,
    });

    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));

    // Try native share (mobile)
    if (navigator.share && navigator.canShare) {
      const file = new File([blob], 'lunar-new-year-blessing.png', { type: 'image/png' });
      const shareData = { files: [file], title: '🐴 Lucky Phrase Relay – Year of the Horse' };
      if (navigator.canShare(shareData)) {
        try {
          await navigator.share(shareData);
          btn.innerHTML = '<span class="btn-icon">✅</span> Shared!';
          setTimeout(() => { btn.innerHTML = originalHTML; btn.disabled = false; }, 2000);
          return;
        } catch (e) { /* User cancelled – fall through */ }
      }
    }

    // Fallback: download
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'lunar-new-year-blessing.png';
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
